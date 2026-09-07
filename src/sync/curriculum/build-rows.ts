/**
 * canonical 중간 표현 → Supabase 11개 테이블 행.
 *
 * 매핑 계약: curriculum/README.md §6, project-learning/README.md.
 * 각 행에 `content_hash`(정규화 직렬화의 sha256)를 넣는다. 복합키 링크 테이블
 * (project_unit_examples / lesson_project_links) 은 스키마에 content_hash 컬럼이 없어 생략.
 */
import type { CanonicalCurriculum } from "./load-canonical.ts";
import { curriculumContentHash } from "./content-hash.ts";

export interface CurriculumRowSet {
  learning_tracks: Dict[];
  learning_chapters: Dict[];
  learning_lessons: Dict[];
  lesson_sections: Dict[];
  lesson_code_examples: Dict[];
  lesson_problem: Dict[];
  learning_projects: Dict[];
  project_learning_units: Dict[];
  project_unit_sections: Dict[];
  project_unit_examples: Dict[];
  lesson_project_links: Dict[];
}

type Dict = Record<string, unknown>;

/** upsert 시 겹침 판정 컬럼. */
export const ON_CONFLICT: Record<keyof CurriculumRowSet, string> = {
  learning_tracks: "id",
  learning_chapters: "id",
  learning_lessons: "id",
  lesson_sections: "id",
  lesson_code_examples: "id",
  lesson_problem: "lesson_id",
  learning_projects: "id",
  project_learning_units: "id",
  project_unit_sections: "id",
  project_unit_examples: "unit_id,example_id",
  lesson_project_links: "lesson_id,unit_id",
};

/** FK 의존성 순서 (부모 먼저). stale 정리·검증도 이 역순을 참고한다. */
export const TABLE_ORDER: (keyof CurriculumRowSet)[] = [
  "learning_tracks",
  "learning_chapters",
  "learning_projects",
  "project_learning_units",
  "learning_lessons",
  "lesson_sections",
  "lesson_code_examples",
  "lesson_problem",
  "project_unit_sections",
  "project_unit_examples",
  "lesson_project_links",
];

const withHash = (row: Dict): Dict => ({ ...row, content_hash: curriculumContentHash(row) });

export function buildCurriculumRows(canonical: CanonicalCurriculum): CurriculumRowSet {
  const rows: CurriculumRowSet = {
    learning_tracks: [],
    learning_chapters: [],
    learning_lessons: [],
    lesson_sections: [],
    lesson_code_examples: [],
    lesson_problem: [],
    learning_projects: [],
    project_learning_units: [],
    project_unit_sections: [],
    project_unit_examples: [],
    lesson_project_links: [],
  };

  for (const track of canonical.tracks) {
    rows.learning_tracks.push(
      withHash({
        id: track.id,
        title: track.title,
        summary: track.summary,
        kind: track.kind,
        accent: track.accent,
        ord: track.ord,
      }),
    );
  }

  for (const chapter of canonical.chapters) {
    rows.learning_chapters.push(
      withHash({
        id: chapter.id,
        track_id: chapter.trackId,
        title: chapter.title,
        summary: chapter.summary,
        ord: chapter.ord,
      }),
    );
  }

  for (const project of canonical.projects) {
    rows.learning_projects.push(
      withHash({
        id: project.id,
        title: project.title,
        summary: project.summary,
        repo_url: project.repoUrl,
        repo_ref: project.repoRef,
        stack: project.stack,
        ord: project.ord,
      }),
    );
    for (const unit of project.units) {
      rows.project_learning_units.push(
        withHash({
          id: unit.id,
          project_id: unit.projectId,
          title: unit.title,
          summary: unit.summary,
          feature_area: unit.featureArea,
          unit_kind: unit.unitKind,
          concepts: unit.concepts,
          related_material_ids: unit.relatedMaterialIds,
          ord: unit.ord,
        }),
      );
      unit.exampleIds.forEach((exampleId, index) => {
        rows.project_unit_examples.push({
          unit_id: unit.id,
          example_id: exampleId,
          role_note: null,
          ord: index,
        });
      });
      for (const section of unit.sections) {
        rows.project_unit_sections.push(
          withHash({
            id: section.id,
            unit_id: unit.id,
            section_type: section.sectionType,
            title: section.title,
            body: section.body,
            lang: section.lang,
            is_optional: section.isOptional,
            code_example_ids: section.codeExampleIds,
            ord: section.ord,
          }),
        );
      }
    }
  }

  for (const lesson of canonical.lessons) {
    rows.learning_lessons.push(
      withHash({
        id: lesson.id,
        chapter_id: lesson.chapterId,
        title: lesson.title,
        mastery: lesson.mastery,
        lesson_kind: lesson.lessonKind,
        summary: lesson.summary,
        estimated_minutes: lesson.estimatedMinutes,
        tags: lesson.tags,
        sources: lesson.sources,
        related_material_ids: lesson.relatedMaterialIds,
        ord: lesson.ord,
      }),
    );

    for (const section of lesson.sections) {
      rows.lesson_sections.push(
        withHash({
          id: section.id,
          lesson_id: lesson.id,
          section_type: section.sectionType,
          title: section.title,
          body: section.body,
          lang: section.lang,
          is_optional: section.isOptional,
          code_example_ids: section.codeExampleIds,
          ord: section.ord,
        }),
      );
    }

    for (const example of lesson.codeExamples) {
      rows.lesson_code_examples.push(
        withHash({
          id: example.id,
          lesson_id: lesson.id,
          title: example.title,
          source_type: example.sourceType,
          summary: example.summary,
          language: example.language,
          code: example.code,
          project_example_id: example.projectExampleId,
          source_name: example.sourceName,
          source_url: example.sourceUrl,
          repo_url: example.repoUrl,
          repo_ref: example.repoRef,
          file_path: example.filePath,
          line_start: example.lineStart,
          line_end: example.lineEnd,
          license: example.license,
          license_url: example.licenseUrl,
          authorship_note: example.authorshipNote,
          is_canonical: example.isCanonical,
          ord: example.ord,
        }),
      );
    }

    if (lesson.problem) {
      rows.lesson_problem.push(
        withHash({
          lesson_id: lesson.id,
          statement: lesson.problem.statement,
          constraints: lesson.problem.constraints,
          difficulty: lesson.problem.difficulty,
          time_complexity: lesson.problem.timeComplexity,
          space_complexity: lesson.problem.spaceComplexity,
          hints: lesson.problem.hints,
          solutions: lesson.problem.solutions,
          test_cases: lesson.problem.testCases,
          source_name: lesson.problem.sourceName,
          source_url: lesson.problem.sourceUrl,
        }),
      );
    }

    lesson.projectUnitIds.forEach((link, index) => {
      rows.lesson_project_links.push({
        lesson_id: lesson.id,
        unit_id: link.unitId,
        relation_note: link.note,
        ord: index,
      });
    });
  }

  return rows;
}

/** 각 테이블의 자연키 문자열 집합 (stale 대조용). */
export function rowKey(table: keyof CurriculumRowSet, row: Dict): string {
  if (table === "project_unit_examples") return `${String(row.unit_id)}::${String(row.example_id)}`;
  if (table === "lesson_project_links") return `${String(row.lesson_id)}::${String(row.unit_id)}`;
  if (table === "lesson_problem") return String(row.lesson_id);
  return String(row.id);
}

export const SELECT_KEY_COLUMNS: Record<keyof CurriculumRowSet, string> = {
  learning_tracks: "id",
  learning_chapters: "id",
  learning_lessons: "id",
  lesson_sections: "id",
  lesson_code_examples: "id",
  lesson_problem: "lesson_id",
  learning_projects: "id",
  project_learning_units: "id",
  project_unit_sections: "id",
  project_unit_examples: "unit_id,example_id",
  lesson_project_links: "lesson_id,unit_id",
};
