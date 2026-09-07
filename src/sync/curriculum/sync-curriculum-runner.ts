/**
 * sync-curriculum — Git canonical curriculum / project-learning 을 Supabase projection 으로
 * 반복 반영하는 공식 파이프라인.
 *
 * ■ 격리 원칙 (curriculum/README.md §0, migration 주석)
 *   기존 material 계열 7개 테이블 · refresh_state · user_learning · auth 를 건드리지 않는다.
 *   `refresh` / `ci-refresh` / `sync-supabase` / `verifySupabase` 어디에도 포함되지 않는다.
 *   canonical 파일을 사람이 고친 뒤 `node src/index.ts sync-curriculum` 을 직접 실행한다.
 *
 * ■ upsert 전용
 *   on_conflict merge 만 한다. DELETE 하지 않는다. canonical 에서 사라진 행은 DB 에
 *   stale 로 남고, 이 실행이 그 사실을 보고한다(자동 삭제 안 함).
 *
 * ■ dry-run
 *   `--dry-run` 이면 DB write 를 하지 않는다. canonical 카운트 · 대상 테이블 · 예상 upsert
 *   범위 · stale 감지 · 대상 Supabase project 만 출력한다(읽기는 허용).
 */
import { loadSupabaseEnv, type SupabaseEnv } from "../env.ts";
import { selectRows, upsertRows } from "../postgrest-client.ts";
import * as log from "../../utils/logger.ts";
import { loadCanonicalCurriculum, type CanonicalCurriculum } from "./load-canonical.ts";
import {
  buildCurriculumRows,
  ON_CONFLICT,
  rowKey,
  SELECT_KEY_COLUMNS,
  TABLE_ORDER,
  type CurriculumRowSet,
} from "./build-rows.ts";

const SECTION_CHUNK = 40; // 본문 섹션 행이 크므로 작게.

export interface CurriculumSyncOptions {
  dryRun: boolean;
}

export interface TableReport {
  table: string;
  canonicalRows: number;
  dbRowsBefore: number;
  upserted: number;
  staleInDb: string[];
}

export interface CurriculumSyncReport {
  dryRun: boolean;
  projectRef: string;
  canonicalCounts: Record<string, number>;
  tables: TableReport[];
  integrityErrors: string[];
  warnings: string[];
  verified: boolean;
  verifyErrors: string[];
}

/** 쓰기 전에 canonical 자체의 FK 정합성을 확인한다. 하나라도 깨지면 write 를 하지 않는다. */
function checkIntegrity(canonical: CanonicalCurriculum): string[] {
  const errors: string[] = [];
  const trackIds = new Set(canonical.tracks.map((t) => t.id));
  const chapterIds = new Set(canonical.chapters.map((c) => c.id));
  const lessonIds = new Set<string>();
  const unitIds = new Set<string>();
  const projectIds = new Set(canonical.projects.map((p) => p.id));

  for (const chapter of canonical.chapters) {
    if (!trackIds.has(chapter.trackId)) errors.push(`chapter ${chapter.id} → 없는 track ${chapter.trackId}`);
  }
  for (const project of canonical.projects) {
    for (const unit of project.units) {
      if (unitIds.has(unit.id)) errors.push(`중복 unit id ${unit.id}`);
      unitIds.add(unit.id);
      if (!projectIds.has(unit.projectId)) errors.push(`unit ${unit.id} → 없는 project ${unit.projectId}`);
    }
  }
  for (const lesson of canonical.lessons) {
    if (lessonIds.has(lesson.id)) errors.push(`중복 lesson id ${lesson.id}`);
    lessonIds.add(lesson.id);
    if (!chapterIds.has(lesson.chapterId)) errors.push(`lesson ${lesson.id} → 없는 chapter ${lesson.chapterId}`);
    for (const link of lesson.projectUnitIds) {
      if (!unitIds.has(link.unitId)) errors.push(`lesson ${lesson.id} project_link → 없는 unit ${link.unitId}`);
    }
    for (const section of lesson.sections) {
      const declared = new Set(lesson.codeExamples.map((ce) => ce.id.split("#")[1]));
      for (const slug of section.codeExampleIds) {
        if (!declared.has(slug)) errors.push(`lesson ${lesson.id} 섹션 {{code:${slug}}} 가 code_examples 에 없음`);
      }
    }
  }
  return errors;
}

function projectRefFromEnv(env: SupabaseEnv): string {
  const match = env.url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1] ?? env.url;
}

async function dbKeySet(env: SupabaseEnv, table: keyof CurriculumRowSet): Promise<Set<string>> {
  const columns = SELECT_KEY_COLUMNS[table];
  const rows = await selectRows<Record<string, unknown>>(env, table, `select=${columns}`);
  const keys = new Set<string>();
  for (const row of rows) keys.add(rowKey(table, row));
  return keys;
}

export async function syncCurriculum(options: CurriculumSyncOptions): Promise<CurriculumSyncReport> {
  const env = loadSupabaseEnv();
  const projectRef = projectRefFromEnv(env);

  log.step("Git canonical curriculum 을 읽습니다");
  const canonical = loadCanonicalCurriculum();
  const rows = buildCurriculumRows(canonical);

  const canonicalCounts: Record<string, number> = {
    tracks: canonical.tracks.length,
    chapters: canonical.chapters.length,
    lessons: canonical.lessons.length,
    lessons_authored: canonical.lessons.filter((l) => l.status === "authored").length,
    lessons_skeleton: canonical.lessons.filter((l) => l.status === "skeleton").length,
    lessons_needs_external_research: canonical.lessons.filter((l) => l.status === "needs_external_research").length,
    projects: canonical.projects.length,
    units: canonical.projects.reduce((sum, p) => sum + p.units.length, 0),
  };
  log.detail(
    `tracks ${canonicalCounts.tracks} · chapters ${canonicalCounts.chapters} · lessons ${canonicalCounts.lessons} ` +
      `(authored ${canonicalCounts.lessons_authored}) · projects ${canonicalCounts.projects} · units ${canonicalCounts.units}`,
  );

  log.step("canonical FK 정합성 확인");
  const integrityErrors = checkIntegrity(canonical);
  if (integrityErrors.length > 0) {
    for (const err of integrityErrors) log.error(err);
    return {
      dryRun: options.dryRun,
      projectRef,
      canonicalCounts,
      tables: [],
      integrityErrors,
      warnings: canonical.warnings,
      verified: false,
      verifyErrors: [],
    };
  }
  log.success("정합성 OK — 없는 상위 참조/중복 id 없음");

  log.step(`대상 Supabase project: ${projectRef}`);
  log.detail(options.dryRun ? "DRY-RUN — DB write 를 하지 않습니다 (읽기만)" : "실제 upsert 를 수행합니다");

  const tables: TableReport[] = [];
  for (const table of TABLE_ORDER) {
    const canonicalRows = rows[table];
    const dbKeys = await dbKeySet(env, table);
    const canonicalKeys = new Set(canonicalRows.map((row) => rowKey(table, row)));
    const staleInDb = [...dbKeys].filter((key) => !canonicalKeys.has(key));

    let upserted = 0;
    if (!options.dryRun && canonicalRows.length > 0) {
      const chunkSize = table === "lesson_sections" || table === "project_unit_sections" ? SECTION_CHUNK : undefined;
      await upsertRows(env, table, canonicalRows, ON_CONFLICT[table], chunkSize);
      upserted = canonicalRows.length;
    }

    tables.push({
      table,
      canonicalRows: canonicalRows.length,
      dbRowsBefore: dbKeys.size,
      upserted,
      staleInDb,
    });
    log.detail(
      `${table.padEnd(24)} canonical ${String(canonicalRows.length).padStart(4)} · db ${String(dbKeys.size).padStart(4)} · ` +
        `${options.dryRun ? "예상 upsert" : "upsert"} ${String(canonicalRows.length).padStart(4)}` +
        (staleInDb.length ? ` · stale ${staleInDb.length}` : ""),
    );
  }

  let verified = false;
  const verifyErrors: string[] = [];
  if (!options.dryRun) {
    log.step("이관 결과를 canonical 과 대조합니다 (READ-ONLY)");
    for (const table of TABLE_ORDER) {
      const dbKeys = await dbKeySet(env, table);
      const canonicalKeys = new Set(rows[table].map((row) => rowKey(table, row)));
      const missing = [...canonicalKeys].filter((key) => !dbKeys.has(key));
      if (missing.length > 0) {
        verifyErrors.push(`${table}: canonical 에 있는데 DB 에 없음 ${missing.length}건 (예: ${missing.slice(0, 3).join(", ")})`);
      }
    }
    verified = verifyErrors.length === 0;
    if (verified) log.success("Git ↔ DB projection 일치 (모든 canonical 행이 DB 에 존재)");
    else for (const err of verifyErrors) log.error(err);
  }

  return {
    dryRun: options.dryRun,
    projectRef,
    canonicalCounts,
    tables,
    integrityErrors: [],
    warnings: canonical.warnings,
    verified,
    verifyErrors,
  };
}

export function printCurriculumSyncReport(report: CurriculumSyncReport): boolean {
  log.info("");
  log.step(report.dryRun ? "sync-curriculum DRY-RUN 요약" : "sync-curriculum 요약");
  log.detail(`대상 project ref : ${report.projectRef}`);
  for (const [key, value] of Object.entries(report.canonicalCounts)) {
    log.detail(`  ${key.padEnd(32)} ${value}`);
  }
  let totalStale = 0;
  for (const table of report.tables) {
    totalStale += table.staleInDb.length;
    if (table.staleInDb.length > 0) {
      log.warn(`stale (${table.table}): ${table.staleInDb.slice(0, 10).join(", ")}${table.staleInDb.length > 10 ? " …" : ""}`);
    }
  }
  if (report.warnings.length > 0) {
    for (const warn of report.warnings) log.warn(warn);
  }

  const hasProblem =
    report.integrityErrors.length > 0 || (!report.dryRun && !report.verified);
  if (report.integrityErrors.length > 0) {
    log.error(`정합성 오류 ${report.integrityErrors.length}건 — write 를 하지 않았습니다`);
  } else if (report.dryRun) {
    log.success(`DRY-RUN 완료 — DB write 없음. stale ${totalStale}건 (자동 삭제 안 함).`);
  } else if (report.verified) {
    log.success(`sync 완료 — Git ↔ DB 일치. stale ${totalStale}건 (자동 삭제 안 함).`);
  } else {
    log.error("sync 후 검증 실패 — 위 불일치를 확인하세요");
  }
  return hasProblem;
}
