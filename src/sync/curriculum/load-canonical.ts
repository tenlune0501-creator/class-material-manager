/**
 * Git canonical Source of Truth 를 읽어 sync-curriculum 이 쓸 중간 표현으로 만든다.
 *
 * 입력(전부 Git 파일 — DB 를 읽어 canonical 을 만들지 않는다):
 *   curriculum/tracks.yaml                     Track + Chapter
 *   curriculum/lessons/<track>.yaml            Lesson 골격
 *   curriculum/authored/**\/*.md                집필본 (frontmatter 가 정본) + 본문 섹션
 *   project-learning/projects.yaml             Project + Unit
 *   project-learning/authored/**\/*.md          Unit 본문 (있으면)
 *
 * 매핑 계약: curriculum/README.md §6, project-learning/README.md §3~4.
 */
import fs from "node:fs";
import path from "node:path";
import { parseYaml } from "./canonical-yaml.ts";
import { splitFrontmatter } from "../frontmatter.ts";

const CURRICULUM_DIR = "curriculum";
const LESSONS_DIR = path.join(CURRICULUM_DIR, "lessons");
const PROJECT_LEARNING_DIR = "project-learning";

export interface CanonicalTrack {
  id: string;
  title: string;
  summary: string | null;
  kind: string;
  accent: string | null;
  ord: number;
}

export interface CanonicalChapter {
  id: string;
  trackId: string;
  title: string;
  summary: string | null;
  ord: number;
}

export interface CanonicalSection {
  id: string;
  lessonId: string;
  sectionType: string;
  title: string | null;
  body: string;
  lang: string | null;
  isOptional: boolean;
  codeExampleIds: string[];
  ord: number;
}

export interface CanonicalCodeExample {
  id: string;
  lessonId: string;
  title: string;
  sourceType: string;
  summary: string | null;
  language: string | null;
  code: string | null;
  projectExampleId: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  repoUrl: string | null;
  repoRef: string | null;
  filePath: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  license: string | null;
  licenseUrl: string | null;
  authorshipNote: string | null;
  isCanonical: boolean;
  ord: number;
}

export interface CanonicalLesson {
  id: string;
  chapterId: string;
  title: string;
  mastery: string;
  lessonKind: string;
  summary: string | null;
  estimatedMinutes: number | null;
  tags: unknown[];
  sources: unknown[];
  relatedMaterialIds: unknown[];
  ord: number;
  status: string;
  sections: CanonicalSection[];
  codeExamples: CanonicalCodeExample[];
  problem: CanonicalProblem | null;
  projectUnitIds: { unitId: string; note: string | null }[];
}

export interface CanonicalProblem {
  lessonId: string;
  statement: string;
  constraints: string | null;
  difficulty: string | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  hints: unknown[];
  solutions: unknown[];
  testCases: unknown[];
  sourceName: string | null;
  sourceUrl: string | null;
}

export interface CanonicalUnit {
  id: string;
  projectId: string;
  title: string;
  summary: string | null;
  featureArea: string | null;
  unitKind: string;
  concepts: unknown[];
  relatedMaterialIds: unknown[];
  ord: number;
  exampleIds: string[];
  sections: CanonicalSection[];
}

export interface CanonicalProject {
  id: string;
  title: string;
  summary: string | null;
  repoUrl: string | null;
  repoRef: string | null;
  stack: unknown[];
  ord: number;
  units: CanonicalUnit[];
}

export interface CanonicalCurriculum {
  tracks: CanonicalTrack[];
  chapters: CanonicalChapter[];
  lessons: CanonicalLesson[];
  projects: CanonicalProject[];
  warnings: string[];
}

type Dict = Record<string, unknown>;

const isDict = (v: unknown): v is Dict => typeof v === "object" && v !== null && !Array.isArray(v);
const asStr = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v : null);
const asNum = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asBool = (v: unknown): boolean => v === true;

function readYamlFile(file: string): Dict {
  const parsed = parseYaml(fs.readFileSync(file, "utf8"));
  if (!isDict(parsed)) throw new Error(`${file}: 최상위가 매핑이 아닙니다`);
  return parsed;
}

/** curriculum/tracks.yaml → Track + Chapter (chapter.track_id = id 앞 1세그먼트). */
function loadTracksAndChapters(warnings: string[]): {
  tracks: CanonicalTrack[];
  chapters: CanonicalChapter[];
} {
  const doc = readYamlFile(path.join(CURRICULUM_DIR, "tracks.yaml"));
  const tracks: CanonicalTrack[] = [];
  const chapters: CanonicalChapter[] = [];
  for (const rawTrack of asArr(doc.tracks)) {
    if (!isDict(rawTrack)) continue;
    const id = asStr(rawTrack.id);
    if (!id) {
      warnings.push("tracks.yaml: id 없는 track 항목을 건너뜁니다");
      continue;
    }
    tracks.push({
      id,
      title: asStr(rawTrack.title) ?? id,
      summary: asStr(rawTrack.summary),
      kind: asStr(rawTrack.kind) ?? "curriculum",
      accent: asStr(rawTrack.accent),
      ord: asNum(rawTrack.ord) ?? 0,
    });
    for (const rawChapter of asArr(rawTrack.chapters)) {
      if (!isDict(rawChapter)) continue;
      const chapterId = asStr(rawChapter.id);
      if (!chapterId) {
        warnings.push(`tracks.yaml: ${id} 아래 id 없는 chapter 를 건너뜁니다`);
        continue;
      }
      chapters.push({
        id: chapterId,
        trackId: chapterId.split("/")[0] ?? id,
        title: asStr(rawChapter.title) ?? chapterId,
        summary: asStr(rawChapter.summary),
        ord: asNum(rawChapter.ord) ?? 0,
      });
    }
  }
  return { tracks, chapters };
}

const SECTION_MARKER = /<!--\s*section:\s*([a-z_]+)\s*(\|[^>]*?)?\s*-->/g;
const CODE_REF = /\{\{\s*code:\s*([a-z0-9-]+)\s*\}\}/g;

interface ParsedSectionMeta {
  title: string | null;
  lang: string | null;
  isOptional: boolean;
}

function parseSectionMeta(rawPipe: string | undefined): ParsedSectionMeta {
  const meta: ParsedSectionMeta = { title: null, lang: null, isOptional: false };
  if (!rawPipe) return meta;
  for (const segment of rawPipe.split("|")) {
    const part = segment.trim();
    if (!part) continue;
    if (part === "optional") meta.isOptional = true;
    else if (part.startsWith("title:")) meta.title = part.slice("title:".length).trim() || null;
    else if (part.startsWith("lang:")) meta.lang = part.slice("lang:".length).trim() || null;
  }
  return meta;
}

function codeRefsIn(text: string): string[] {
  const ids: string[] = [];
  for (const match of text.matchAll(CODE_REF)) if (match[1]) ids.push(match[1]);
  return ids;
}

/**
 * 본문을 `<!-- section: ... -->` 마커로 잘라 섹션 배열로 만든다.
 * id = `<owner-id>#<type>-<ord>`, ord = 본문 등장 순서(0부터, 전역).
 */
function parseSections(ownerId: string, body: string): CanonicalSection[] {
  const markers: { type: string; meta: ParsedSectionMeta; start: number; end: number }[] = [];
  for (const match of body.matchAll(SECTION_MARKER)) {
    markers.push({
      type: match[1] ?? "",
      meta: parseSectionMeta(match[2]),
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }
  const sections: CanonicalSection[] = [];
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    if (!marker) continue;
    const sliceEnd = i + 1 < markers.length ? (markers[i + 1]?.start ?? body.length) : body.length;
    const sectionBody = body.slice(marker.end, sliceEnd).trim();
    sections.push({
      id: `${ownerId}#${marker.type}-${i}`,
      lessonId: ownerId,
      sectionType: marker.type,
      title: marker.meta.title,
      body: sectionBody,
      lang: marker.meta.lang,
      isOptional: marker.meta.isOptional,
      codeExampleIds: codeRefsIn(sectionBody),
      ord: i,
    });
  }
  return sections;
}

/** goal 섹션 첫 문단에서 Lesson summary 를 뽑는다 (frontmatter 에 summary 가 없을 때). */
function deriveSummary(sections: CanonicalSection[]): string | null {
  const goal = sections.find((section) => section.sectionType === "goal");
  if (!goal) return null;
  const lines = goal.body.split("\n");
  const collected: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;
    if (trimmed === "") {
      if (collected.length > 0) break;
      continue;
    }
    collected.push(trimmed.replace(/^[-*]\s+/, "").replace(/\*\*/g, ""));
  }
  const text = collected.join(" ").trim();
  return text === "" ? null : text.slice(0, 800);
}

function buildCodeExamples(lessonId: string, raw: unknown[]): CanonicalCodeExample[] {
  const examples: CanonicalCodeExample[] = [];
  raw.forEach((entry, index) => {
    if (!isDict(entry)) return;
    const slug = asStr(entry.slug);
    if (!slug) return;
    examples.push({
      id: `${lessonId}#${slug}`,
      lessonId,
      title: asStr(entry.title) ?? slug,
      sourceType: asStr(entry.source_type) ?? "generated_minimal",
      summary: asStr(entry.summary),
      language: asStr(entry.language),
      code: typeof entry.code === "string" ? entry.code : null,
      projectExampleId: asStr(entry.project_example_id),
      sourceName: asStr(entry.source_name),
      sourceUrl: asStr(entry.source_url),
      repoUrl: asStr(entry.repo_url),
      repoRef: asStr(entry.repo_ref),
      filePath: asStr(entry.file_path),
      lineStart: asNum(entry.line_start),
      lineEnd: asNum(entry.line_end),
      license: asStr(entry.license),
      licenseUrl: asStr(entry.license_url),
      authorshipNote: asStr(entry.authorship_note),
      isCanonical: asBool(entry.is_canonical),
      ord: index,
    });
  });
  return examples;
}

function buildProblem(lessonId: string, raw: unknown): CanonicalProblem | null {
  if (!isDict(raw)) return null;
  const statement = asStr(raw.statement);
  if (!statement) return null;
  return {
    lessonId,
    statement,
    constraints: asStr(raw.constraints),
    difficulty: asStr(raw.difficulty),
    timeComplexity: asStr(raw.time_complexity),
    spaceComplexity: asStr(raw.space_complexity),
    hints: asArr(raw.hints),
    solutions: asArr(raw.solutions),
    testCases: asArr(raw.test_cases),
    sourceName: asStr(raw.source_name),
    sourceUrl: asStr(raw.source_url),
  };
}

function projectLinksFrom(raw: unknown): { unitId: string; note: string | null }[] {
  const links: { unitId: string; note: string | null }[] = [];
  for (const entry of asArr(raw)) {
    if (!isDict(entry)) continue;
    const unitId = asStr(entry.unit);
    if (!unitId) continue;
    links.push({ unitId, note: asStr(entry.note) });
  }
  return links;
}

/** lessons/*.yaml 의 한 항목 + (있으면) 집필본 frontmatter/본문 을 합쳐 Lesson 을 만든다. */
function buildLesson(rawYaml: Dict, warnings: string[]): CanonicalLesson | null {
  const yamlId = asStr(rawYaml.id);
  if (!yamlId) {
    warnings.push("lessons/*.yaml: id 없는 lesson 항목을 건너뜁니다");
    return null;
  }
  const status = asStr(rawYaml.status) ?? "skeleton";
  const bodyPath = asStr(rawYaml.body_path);

  let front: Dict = {};
  let sections: CanonicalSection[] = [];
  if (bodyPath) {
    const abs = path.join(CURRICULUM_DIR, bodyPath);
    if (!fs.existsSync(abs)) {
      warnings.push(`${yamlId}: body_path 파일 없음 (${bodyPath})`);
    } else {
      const split = splitFrontmatter(fs.readFileSync(abs, "utf8"));
      const parsedFront = split.frontmatter ? parseYaml(split.frontmatter) : {};
      if (isDict(parsedFront)) front = parsedFront;
      sections = parseSections(yamlId, split.body);
    }
  }

  // frontmatter 가 정본인 필드는 frontmatter 를 우선, 없으면 yaml.
  const pick = <T>(key: string, fromFront: (v: unknown) => T, fromYaml: (v: unknown) => T): T =>
    key in front ? fromFront(front[key]) : fromYaml(rawYaml[key]);

  const id = asStr(front.id) ?? yamlId;
  const chapterId = id.split("/").slice(0, 2).join("/");
  const codeExamples = buildCodeExamples(id, asArr(front.code_examples));
  const frontSummary = asStr(front.summary);
  const projectLinksRaw = "project_links" in front ? front.project_links : rawYaml.project_links;

  return {
    id,
    chapterId,
    title: pick("title", asStr, asStr) ?? id,
    mastery: pick("mastery", (v) => asStr(v) ?? "understand", (v) => asStr(v) ?? "understand"),
    lessonKind: pick("lesson_kind", (v) => asStr(v) ?? "lesson", (v) => asStr(v) ?? "lesson"),
    summary: frontSummary ?? deriveSummary(sections),
    estimatedMinutes: pick("estimated_minutes", asNum, asNum),
    tags: pick("tags", asArr, asArr),
    sources: pick("sources", asArr, asArr),
    relatedMaterialIds: pick("related_material_ids", asArr, asArr),
    ord: asNum(rawYaml.ord) ?? 0,
    status,
    sections,
    codeExamples,
    problem: buildProblem(id, front.problem),
    projectUnitIds: projectLinksFrom(projectLinksRaw),
  };
}

function loadLessons(warnings: string[]): CanonicalLesson[] {
  const lessons: CanonicalLesson[] = [];
  const seen = new Set<string>();
  for (const file of fs.readdirSync(LESSONS_DIR).filter((name) => name.endsWith(".yaml")).sort()) {
    const doc = readYamlFile(path.join(LESSONS_DIR, file));
    for (const rawLesson of asArr(doc.lessons)) {
      if (!isDict(rawLesson)) continue;
      const lesson = buildLesson(rawLesson, warnings);
      if (!lesson) continue;
      if (seen.has(lesson.id)) {
        warnings.push(`중복 lesson id: ${lesson.id}`);
        continue;
      }
      seen.add(lesson.id);
      lessons.push(lesson);
    }
  }
  return lessons;
}

function loadUnitBody(projectId: string, unitId: string): CanonicalSection[] {
  // project-learning/authored/<project-id>/<unit-slug>.md — 골격 단계에서는 0개.
  const slug = unitId.startsWith(`${projectId}/`) ? unitId.slice(projectId.length + 1) : unitId;
  const abs = path.join(PROJECT_LEARNING_DIR, "authored", projectId, `${slug}.md`);
  if (!fs.existsSync(abs)) return [];
  const split = splitFrontmatter(fs.readFileSync(abs, "utf8"));
  return parseSections(unitId, split.body);
}

function loadProjects(warnings: string[]): CanonicalProject[] {
  const doc = readYamlFile(path.join(PROJECT_LEARNING_DIR, "projects.yaml"));
  const projects: CanonicalProject[] = [];
  const seenUnits = new Set<string>();
  for (const rawProject of asArr(doc.projects)) {
    if (!isDict(rawProject)) continue;
    const projectId = asStr(rawProject.id);
    if (!projectId) {
      warnings.push("projects.yaml: id 없는 project 항목을 건너뜁니다");
      continue;
    }
    const units: CanonicalUnit[] = [];
    for (const rawUnit of asArr(rawProject.units)) {
      if (!isDict(rawUnit)) continue;
      const unitId = asStr(rawUnit.id);
      if (!unitId) {
        warnings.push(`projects.yaml: ${projectId} 아래 id 없는 unit 을 건너뜁니다`);
        continue;
      }
      if (seenUnits.has(unitId)) {
        warnings.push(`중복 unit id: ${unitId}`);
        continue;
      }
      seenUnits.add(unitId);
      units.push({
        id: unitId,
        projectId: unitId.split("/")[0] ?? projectId,
        title: asStr(rawUnit.title) ?? unitId,
        summary: asStr(rawUnit.summary),
        featureArea: asStr(rawUnit.feature_area),
        unitKind: asStr(rawUnit.unit_kind) ?? "feature",
        concepts: asArr(rawUnit.concepts),
        relatedMaterialIds: asArr(rawUnit.related_material_ids),
        ord: asNum(rawUnit.ord) ?? 0,
        exampleIds: asArr(rawUnit.example_ids).filter((v): v is string => typeof v === "string"),
        sections: loadUnitBody(projectId, unitId),
      });
    }
    projects.push({
      id: projectId,
      title: asStr(rawProject.title) ?? projectId,
      summary: asStr(rawProject.summary),
      repoUrl: asStr(rawProject.repo_url),
      repoRef: asStr(rawProject.repo_ref),
      stack: asArr(rawProject.stack),
      ord: asNum(rawProject.ord) ?? 0,
      units,
    });
  }
  return projects;
}

export function loadCanonicalCurriculum(): CanonicalCurriculum {
  const warnings: string[] = [];
  const { tracks, chapters } = loadTracksAndChapters(warnings);
  const lessons = loadLessons(warnings);
  const projects = loadProjects(warnings);
  return { tracks, chapters, lessons, projects, warnings };
}
