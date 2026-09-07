/**
 * 커리큘럼 projection 읽기 — `sync-curriculum` 이 올린 11개 테이블을 뷰어가 읽는 부분.
 *
 * ■ 무엇을 읽나 (전부 SELECT 만, 쓰기 없음)
 *   learning_tracks / learning_chapters / learning_lessons
 *   lesson_sections / lesson_code_examples
 *   learning_projects / project_learning_units / project_unit_sections
 *   project_unit_examples / lesson_project_links / project_examples
 *
 * ■ Git canonical = 정본, Supabase = projection
 *   뷰어는 projection(DB)만 읽는다. `curriculum/` · `project-learning/` 파일을 직접 파싱하지
 *   않는다. 콘텐츠 갱신은 `node src/index.ts sync-curriculum` 으로만.
 *
 * ■ 실패는 곧 "비어 있음"
 *   Supabase 환경변수가 없거나(dbConfigured=false) 조회가 실패하면 빈 목록/`null` 을
 *   돌려준다. 화면은 "아직 sync 안 됨" 안내를 보여준다. (material 쪽의 파일 폴백과 달리
 *   커리큘럼은 로컬 폴백 소스가 없다 — 정본이 YAML 이고 뷰어는 그걸 파싱하지 않으므로.)
 */
import { createClient } from "./supabase/server";
import { dbConfigured } from "./db";

// ── 타입 ────────────────────────────────────────────────────

export interface TrackSummary {
  id: string;
  title: string;
  summary: string | null;
  kind: string;
  ord: number;
  chapterCount: number;
  lessonCount: number;
}

export interface ChapterWithLessons {
  id: string;
  title: string;
  summary: string | null;
  ord: number;
  lessons: LessonListItem[];
}

export interface LessonListItem {
  id: string;
  title: string;
  mastery: string;
  lessonKind: string;
  estimatedMinutes: number | null;
  ord: number;
}

export interface TrackDetail {
  id: string;
  title: string;
  summary: string | null;
  chapters: ChapterWithLessons[];
}

export interface LessonSection {
  id: string;
  sectionType: string;
  title: string | null;
  body: string;
  lang: string | null;
  isOptional: boolean;
  ord: number;
}

export interface LessonCodeExample {
  id: string;
  slug: string;
  title: string;
  language: string | null;
  code: string | null;
  sourceType: string;
  projectExampleId: string | null;
  ord: number;
}

export interface LinkedUnitRef {
  unitId: string;
  projectId: string;
  unitTitle: string;
  projectTitle: string;
  note: string | null;
}

export interface LessonDetail {
  id: string;
  chapterId: string;
  trackId: string;
  title: string;
  mastery: string;
  lessonKind: string;
  summary: string | null;
  estimatedMinutes: number | null;
  tags: string[];
  sources: unknown[];
  sections: LessonSection[];
  codeExamples: LessonCodeExample[];
  linkedUnits: LinkedUnitRef[];
  chapterTitle: string | null;
  trackTitle: string | null;
}

export interface ProjectSummary {
  id: string;
  title: string;
  summary: string | null;
  repoUrl: string | null;
  repoRef: string | null;
  stack: string[];
  ord: number;
  unitCount: number;
  exampleCount: number;
}

export interface UnitListItem {
  id: string;
  title: string;
  summary: string | null;
  unitKind: string;
  featureArea: string | null;
  ord: number;
}

export interface ProjectDetail extends ProjectSummary {
  units: UnitListItem[];
}

export interface UnitSection {
  id: string;
  sectionType: string;
  title: string | null;
  body: string;
  lang: string | null;
  isOptional: boolean;
  ord: number;
}

export interface UnitExampleRef {
  id: string;
  title: string;
  filePath: string;
  language: string | null;
  subject: string | null;
}

export interface LinkedLessonRef {
  lessonId: string;
  chapterId: string;
  trackId: string;
  lessonTitle: string;
  note: string | null;
}

export interface UnitDetail {
  id: string;
  projectId: string;
  projectTitle: string | null;
  title: string;
  summary: string | null;
  unitKind: string;
  featureArea: string | null;
  concepts: string[];
  repoUrl: string | null;
  repoRef: string | null;
  sections: UnitSection[];
  examples: UnitExampleRef[];
  linkedLessons: LinkedLessonRef[];
}

// ── 공통 도우미 ─────────────────────────────────────────────

const asStrArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

type Row = Record<string, unknown>;

async function selectAll(table: string, columns: string): Promise<Row[]> {
  const supabase = await createClient();
  const rows: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) throw new Error(`curriculum select 실패 (${table}): ${error.message}`);
    const page = (data ?? []) as unknown as Row[];
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

/** dbConfigured=false 이거나 조회 실패면 fallback 을 돌려준다 (커리큘럼은 로컬 폴백 없음). */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!dbConfigured()) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

const byOrd = (a: { ord: number }, b: { ord: number }) => a.ord - b.ord;

// ── 커리큘럼 ────────────────────────────────────────────────

export async function getTracks(): Promise<TrackSummary[]> {
  return safe(async () => {
    const [tracks, chapters, lessons] = await Promise.all([
      selectAll("learning_tracks", "id,title,summary,kind,ord"),
      selectAll("learning_chapters", "id,track_id"),
      selectAll("learning_lessons", "id,chapter_id"),
    ]);
    const chToTrack = new Map(chapters.map((c) => [String(c.id), String(c.track_id)]));
    const chapterCount = new Map<string, number>();
    for (const c of chapters) {
      const t = String(c.track_id);
      chapterCount.set(t, (chapterCount.get(t) ?? 0) + 1);
    }
    const lessonCount = new Map<string, number>();
    for (const l of lessons) {
      const t = chToTrack.get(String(l.chapter_id));
      if (!t) continue;
      lessonCount.set(t, (lessonCount.get(t) ?? 0) + 1);
    }
    return tracks
      .map((t) => ({
        id: String(t.id),
        title: String(t.title),
        summary: (t.summary as string | null) ?? null,
        kind: String(t.kind ?? "curriculum"),
        ord: Number(t.ord ?? 0),
        chapterCount: chapterCount.get(String(t.id)) ?? 0,
        lessonCount: lessonCount.get(String(t.id)) ?? 0,
      }))
      .sort(byOrd);
  }, []);
}

export async function getTrack(trackId: string): Promise<TrackDetail | null> {
  return safe(async () => {
    const [tracks, chapters, lessons] = await Promise.all([
      selectAll("learning_tracks", "id,title,summary"),
      selectAll("learning_chapters", "id,track_id,title,summary,ord"),
      selectAll("learning_lessons", "id,chapter_id,title,mastery,lesson_kind,estimated_minutes,ord"),
    ]);
    const track = tracks.find((t) => String(t.id) === trackId);
    if (!track) return null;
    const trackChapters = chapters.filter((c) => String(c.track_id) === trackId);
    const lessonsByChapter = new Map<string, LessonListItem[]>();
    for (const l of lessons) {
      const key = String(l.chapter_id);
      const list = lessonsByChapter.get(key) ?? [];
      list.push({
        id: String(l.id),
        title: String(l.title),
        mastery: String(l.mastery),
        lessonKind: String(l.lesson_kind ?? "lesson"),
        estimatedMinutes: (l.estimated_minutes as number | null) ?? null,
        ord: Number(l.ord ?? 0),
      });
      lessonsByChapter.set(key, list);
    }
    return {
      id: String(track.id),
      title: String(track.title),
      summary: (track.summary as string | null) ?? null,
      chapters: trackChapters
        .map((c) => ({
          id: String(c.id),
          title: String(c.title),
          summary: (c.summary as string | null) ?? null,
          ord: Number(c.ord ?? 0),
          lessons: (lessonsByChapter.get(String(c.id)) ?? []).sort(byOrd),
        }))
        .sort(byOrd),
    };
  }, null);
}

export async function getLesson(lessonId: string): Promise<LessonDetail | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data: lessonRow, error } = await supabase
      .from("learning_lessons")
      .select("id,chapter_id,title,mastery,lesson_kind,summary,estimated_minutes,tags,sources")
      .eq("id", lessonId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!lessonRow) return null;
    const l = lessonRow as Row;
    const chapterId = String(l.chapter_id);
    const trackId = chapterId.split("/")[0] ?? chapterId;

    const [sectionRows, codeRows, linkRows, chapterRow, trackRow, unitRows, projectRows] =
      await Promise.all([
        supabase
          .from("lesson_sections")
          .select("id,section_type,title,body,lang,is_optional,ord")
          .eq("lesson_id", lessonId),
        supabase
          .from("lesson_code_examples")
          .select("id,title,source_type,language,code,project_example_id,ord")
          .eq("lesson_id", lessonId),
        supabase
          .from("lesson_project_links")
          .select("unit_id,relation_note,ord")
          .eq("lesson_id", lessonId),
        supabase.from("learning_chapters").select("title").eq("id", chapterId).maybeSingle(),
        supabase.from("learning_tracks").select("title").eq("id", trackId).maybeSingle(),
        selectAll("project_learning_units", "id,project_id,title"),
        selectAll("learning_projects", "id,title"),
      ]);

    const projectTitle = new Map(projectRows.map((p) => [String(p.id), String(p.title)]));
    const unitInfo = new Map(
      unitRows.map((u) => [String(u.id), { projectId: String(u.project_id), title: String(u.title) }]),
    );

    const sections: LessonSection[] = ((sectionRows.data ?? []) as Row[])
      .map((s) => ({
        id: String(s.id),
        sectionType: String(s.section_type),
        title: (s.title as string | null) ?? null,
        body: String(s.body ?? ""),
        lang: (s.lang as string | null) ?? null,
        isOptional: s.is_optional === true,
        ord: Number(s.ord ?? 0),
      }))
      .sort(byOrd);

    const codeExamples: LessonCodeExample[] = ((codeRows.data ?? []) as Row[])
      .map((c) => ({
        id: String(c.id),
        slug: String(c.id).split("#")[1] ?? String(c.id),
        title: String(c.title),
        language: (c.language as string | null) ?? null,
        code: (c.code as string | null) ?? null,
        sourceType: String(c.source_type),
        projectExampleId: (c.project_example_id as string | null) ?? null,
        ord: Number(c.ord ?? 0),
      }))
      .sort(byOrd);

    const linkedUnits: LinkedUnitRef[] = ((linkRows.data ?? []) as Row[])
      .map((k) => {
        const info = unitInfo.get(String(k.unit_id));
        return {
          unitId: String(k.unit_id),
          projectId: info?.projectId ?? String(k.unit_id).split("/")[0] ?? "",
          unitTitle: info?.title ?? String(k.unit_id),
          projectTitle: projectTitle.get(info?.projectId ?? "") ?? (info?.projectId ?? ""),
          note: (k.relation_note as string | null) ?? null,
          ord: Number(k.ord ?? 0),
        };
      })
      .sort(byOrd)
      .map(({ ord: _ord, ...rest }) => rest);

    return {
      id: String(l.id),
      chapterId,
      trackId,
      title: String(l.title),
      mastery: String(l.mastery),
      lessonKind: String(l.lesson_kind ?? "lesson"),
      summary: (l.summary as string | null) ?? null,
      estimatedMinutes: (l.estimated_minutes as number | null) ?? null,
      tags: asStrArray(l.tags),
      sources: asArr(l.sources),
      sections,
      codeExamples,
      linkedUnits,
      chapterTitle: (chapterRow.data as { title?: string } | null)?.title ?? null,
      trackTitle: (trackRow.data as { title?: string } | null)?.title ?? null,
    };
  }, null);
}

// ── 실전 프로젝트 학습 ─────────────────────────────────────

export async function getProjects(): Promise<ProjectSummary[]> {
  return safe(async () => {
    const [projects, units, examples] = await Promise.all([
      selectAll("learning_projects", "id,title,summary,repo_url,repo_ref,stack,ord"),
      selectAll("project_learning_units", "id,project_id"),
      selectAll("project_unit_examples", "unit_id"),
    ]);
    const unitToProject = new Map(units.map((u) => [String(u.id), String(u.project_id)]));
    const unitCount = new Map<string, number>();
    for (const u of units) {
      const p = String(u.project_id);
      unitCount.set(p, (unitCount.get(p) ?? 0) + 1);
    }
    const exampleCount = new Map<string, number>();
    for (const e of examples) {
      const p = unitToProject.get(String(e.unit_id));
      if (!p) continue;
      exampleCount.set(p, (exampleCount.get(p) ?? 0) + 1);
    }
    return projects
      .map((p) => ({
        id: String(p.id),
        title: String(p.title),
        summary: (p.summary as string | null) ?? null,
        repoUrl: (p.repo_url as string | null) ?? null,
        repoRef: (p.repo_ref as string | null) ?? null,
        stack: asStrArray(p.stack),
        ord: Number(p.ord ?? 0),
        unitCount: unitCount.get(String(p.id)) ?? 0,
        exampleCount: exampleCount.get(String(p.id)) ?? 0,
      }))
      .sort(byOrd);
  }, []);
}

export async function getProject(projectId: string): Promise<ProjectDetail | null> {
  return safe(async () => {
    const [projects, units, examples] = await Promise.all([
      selectAll("learning_projects", "id,title,summary,repo_url,repo_ref,stack,ord"),
      selectAll("project_learning_units", "id,project_id,title,summary,unit_kind,feature_area,ord"),
      selectAll("project_unit_examples", "unit_id"),
    ]);
    const project = projects.find((p) => String(p.id) === projectId);
    if (!project) return null;
    const projectUnits = units.filter((u) => String(u.project_id) === projectId);
    const exampleCount = examples.filter((e) =>
      projectUnits.some((u) => String(u.id) === String(e.unit_id)),
    ).length;
    return {
      id: String(project.id),
      title: String(project.title),
      summary: (project.summary as string | null) ?? null,
      repoUrl: (project.repo_url as string | null) ?? null,
      repoRef: (project.repo_ref as string | null) ?? null,
      stack: asStrArray(project.stack),
      ord: Number(project.ord ?? 0),
      unitCount: projectUnits.length,
      exampleCount,
      units: projectUnits
        .map((u) => ({
          id: String(u.id),
          title: String(u.title),
          summary: (u.summary as string | null) ?? null,
          unitKind: String(u.unit_kind ?? "feature"),
          featureArea: (u.feature_area as string | null) ?? null,
          ord: Number(u.ord ?? 0),
        }))
        .sort(byOrd),
    };
  }, null);
}

export async function getUnit(unitId: string): Promise<UnitDetail | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data: unitRow, error } = await supabase
      .from("project_learning_units")
      .select("id,project_id,title,summary,unit_kind,feature_area,concepts")
      .eq("id", unitId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!unitRow) return null;
    const u = unitRow as Row;
    const projectId = String(u.project_id);

    const [sectionRows, exampleLinkRows, lessonLinkRows, projectRow, lessonRows] = await Promise.all([
      supabase
        .from("project_unit_sections")
        .select("id,section_type,title,body,lang,is_optional,ord")
        .eq("unit_id", unitId),
      supabase.from("project_unit_examples").select("example_id,ord").eq("unit_id", unitId),
      supabase.from("lesson_project_links").select("lesson_id,relation_note,ord").eq("unit_id", unitId),
      supabase
        .from("learning_projects")
        .select("title,repo_url,repo_ref")
        .eq("id", projectId)
        .maybeSingle(),
      selectAll("learning_lessons", "id,chapter_id,title"),
    ]);

    const exampleIds = ((exampleLinkRows.data ?? []) as Row[]).map((e) => String(e.example_id));
    let examples: UnitExampleRef[] = [];
    if (exampleIds.length > 0) {
      const { data: exRows } = await supabase
        .from("project_examples")
        .select("id,title,file_path,language,subject")
        .in("id", exampleIds);
      examples = ((exRows ?? []) as Row[]).map((e) => ({
        id: String(e.id),
        title: String(e.title),
        filePath: String(e.file_path ?? ""),
        language: (e.language as string | null) ?? null,
        subject: (e.subject as string | null) ?? null,
      }));
    }

    const lessonInfo = new Map(
      lessonRows.map((l) => [String(l.id), { chapterId: String(l.chapter_id), title: String(l.title) }]),
    );

    const sections: UnitSection[] = ((sectionRows.data ?? []) as Row[])
      .map((s) => ({
        id: String(s.id),
        sectionType: String(s.section_type),
        title: (s.title as string | null) ?? null,
        body: String(s.body ?? ""),
        lang: (s.lang as string | null) ?? null,
        isOptional: s.is_optional === true,
        ord: Number(s.ord ?? 0),
      }))
      .sort(byOrd);

    const linkedLessons: LinkedLessonRef[] = ((lessonLinkRows.data ?? []) as Row[])
      .map((k) => {
        const info = lessonInfo.get(String(k.lesson_id));
        const chapterId = info?.chapterId ?? "";
        return {
          lessonId: String(k.lesson_id),
          chapterId,
          trackId: chapterId.split("/")[0] ?? "",
          lessonTitle: info?.title ?? String(k.lesson_id),
          note: (k.relation_note as string | null) ?? null,
          ord: Number(k.ord ?? 0),
        };
      })
      .sort(byOrd)
      .map(({ ord: _ord, ...rest }) => rest);

    const proj = projectRow.data as { title?: string; repo_url?: string; repo_ref?: string } | null;

    return {
      id: String(u.id),
      projectId,
      projectTitle: proj?.title ?? null,
      title: String(u.title),
      summary: (u.summary as string | null) ?? null,
      unitKind: String(u.unit_kind ?? "feature"),
      featureArea: (u.feature_area as string | null) ?? null,
      concepts: asStrArray(u.concepts),
      repoUrl: proj?.repo_url ?? null,
      repoRef: proj?.repo_ref ?? null,
      sections,
      examples,
      linkedLessons,
    };
  }, null);
}

/** 섹션 본문의 `{{code: slug}}` 를 코드 예제의 코드 펜스로 치환한다 (Lesson 본문 렌더 전처리). */
export function inlineCodeRefs(body: string, examples: LessonCodeExample[]): string {
  const bySlug = new Map(examples.map((e) => [e.slug, e]));
  return body.replace(/\{\{\s*code:\s*([a-z0-9-]+)\s*\}\}/g, (whole, slug: string) => {
    const ex = bySlug.get(slug);
    if (!ex || !ex.code) return whole;
    const lang = ex.language ?? "";
    return `\n\`\`\`${lang}\n${ex.code.replace(/\n$/, "")}\n\`\`\`\n`;
  });
}

/** 섹션 타입 → 한국어 라벨 (curriculum/README.md §5 어휘). */
export const SECTION_LABEL: Record<string, string> = {
  goal: "이 Lesson을 끝내면",
  prerequisite: "먼저 알아야 할 것",
  dev_problem: "이게 없으면 겪는 문제",
  concept: "개념",
  mechanism: "동작 원리",
  code: "코드",
  code_breakdown: "코드 해설",
  experiment: "직접 해 보기",
  must_know: "반드시 기억할 것",
  delegatable: "도구에 맡겨도 되는 것",
  mission: "직접 구현 과제",
  project_link: "실제 프로젝트에서",
  interview_question: "면접 대비",
  check_question: "이해 점검",
  digest_prompt: "복습용 요약 프롬프트",
  review: "한 줄 정리",
  role: "이 코드가 하는 일",
  where: "코드 위치",
  flow: "데이터·상태 흐름",
  why: "왜 이렇게 했나",
  framework_role: "프레임워크가 대신하는 것",
  related_lesson: "이어지는 Lesson",
  caution: "주의점",
  next: "다음",
};
