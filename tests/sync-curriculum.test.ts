/**
 * sync-curriculum 파이프라인 검증.
 *
 * DB 없이 검증 가능한 부분만 본다:
 *   - content_hash 가 결정적이고 키 순서에 무관하다
 *   - 실제 canonical(curriculum/ · project-learning/)을 읽어 11개 테이블 행으로 매핑된다
 *   - FK 컬럼(track_id / chapter_id / project_id)이 id 에서 파생된다
 *   - lesson_sections id = `<lesson>#<type>-<ord>` 규격
 *   - 복합키 링크 테이블(project_unit_examples / lesson_project_links) rowKey
 *   - lesson_problem 은 problem 지문이 있는 lesson 만 (현재 0)
 *   - canonical 자체 FK 정합성이 깨지지 않았다
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { curriculumContentHash } from "../src/sync/curriculum/content-hash.ts";
import { loadCanonicalCurriculum } from "../src/sync/curriculum/load-canonical.ts";
import { buildCurriculumRows, rowKey, TABLE_ORDER, ON_CONFLICT } from "../src/sync/curriculum/build-rows.ts";

describe("curriculumContentHash", () => {
  it("같은 입력이면 같은 hex", () => {
    assert.equal(curriculumContentHash({ a: 1, b: [2, 3] }), curriculumContentHash({ a: 1, b: [2, 3] }));
  });

  it("객체 키 순서가 달라도 같은 hash (배열 순서는 유지)", () => {
    assert.equal(curriculumContentHash({ a: 1, b: 2 }), curriculumContentHash({ b: 2, a: 1 }));
    assert.notEqual(curriculumContentHash({ a: [1, 2] }), curriculumContentHash({ a: [2, 1] }));
  });

  it("64자리 hex", () => {
    assert.match(curriculumContentHash({ x: "y" }), /^[0-9a-f]{64}$/);
  });
});

describe("loadCanonicalCurriculum + buildCurriculumRows", () => {
  const canonical = loadCanonicalCurriculum();
  const rows = buildCurriculumRows(canonical);

  it("canonical 로드에 경고가 없다", () => {
    assert.deepEqual(canonical.warnings, []);
  });

  it("track/chapter/lesson/project/unit 이 모두 1개 이상", () => {
    assert.ok(canonical.tracks.length > 0);
    assert.ok(canonical.chapters.length > 0);
    assert.ok(canonical.lessons.length > 0);
    assert.ok(canonical.projects.length > 0);
    assert.ok(canonical.projects.reduce((n, p) => n + p.units.length, 0) > 0);
  });

  it("11개 테이블 전부 빌드된다", () => {
    assert.equal(TABLE_ORDER.length, 11);
    for (const table of TABLE_ORDER) assert.ok(Array.isArray(rows[table]), `${table} 누락`);
  });

  it("learning_tracks 행 수 = canonical tracks", () => {
    assert.equal(rows.learning_tracks.length, canonical.tracks.length);
  });

  it("learning_chapters.track_id = chapter id 앞 1세그먼트, 모든 상위 track 존재", () => {
    const trackIds = new Set(rows.learning_tracks.map((r) => r.id));
    for (const chapter of rows.learning_chapters) {
      assert.equal(chapter.track_id, String(chapter.id).split("/")[0]);
      assert.ok(trackIds.has(chapter.track_id), `${String(chapter.id)} 의 track 없음`);
    }
  });

  it("learning_lessons.chapter_id = lesson id 앞 2세그먼트, 모든 상위 chapter 존재", () => {
    const chapterIds = new Set(rows.learning_chapters.map((r) => r.id));
    for (const lesson of rows.learning_lessons) {
      assert.equal(lesson.chapter_id, String(lesson.id).split("/").slice(0, 2).join("/"));
      assert.ok(chapterIds.has(lesson.chapter_id), `${String(lesson.id)} 의 chapter 없음`);
    }
  });

  it("project_learning_units.project_id = unit id 앞 1세그먼트, 모든 상위 project 존재", () => {
    const projectIds = new Set(rows.learning_projects.map((r) => r.id));
    for (const unit of rows.project_learning_units) {
      assert.equal(unit.project_id, String(unit.id).split("/")[0]);
      assert.ok(projectIds.has(unit.project_id), `${String(unit.id)} 의 project 없음`);
    }
  });

  it("모든 행에 content_hash (링크 2개 테이블 제외)", () => {
    for (const table of TABLE_ORDER) {
      if (table === "project_unit_examples" || table === "lesson_project_links") continue;
      for (const row of rows[table]) {
        assert.match(String(row.content_hash), /^[0-9a-f]{64}$/, `${table} content_hash 누락`);
      }
    }
  });

  it("lesson_sections id = `<lesson>#<type>-<ord>` 이고 lesson_id FK 유효", () => {
    const lessonIds = new Set(rows.learning_lessons.map((r) => r.id));
    for (const section of rows.lesson_sections) {
      assert.match(String(section.id), /#[a-z_]+-\d+$/);
      assert.equal(String(section.id).split("#")[0], section.lesson_id);
      assert.ok(lessonIds.has(section.lesson_id));
      assert.equal(typeof section.ord, "number");
    }
  });

  it("lesson_code_examples.id = `<lesson>#<slug>`, source_type 은 허용값", () => {
    const allowed = new Set(["official_example", "verified_oss", "generated_minimal", "user_project"]);
    for (const ex of rows.lesson_code_examples) {
      assert.equal(String(ex.id).split("#")[0], ex.lesson_id);
      assert.ok(allowed.has(String(ex.source_type)), `${String(ex.id)} source_type=${String(ex.source_type)}`);
    }
  });

  it("lesson_problem 은 problem 지문이 있는 lesson 만 (현재 0)", () => {
    assert.equal(rows.lesson_problem.length, canonical.lessons.filter((l) => l.problem).length);
  });

  it("lesson_project_links 의 unit_id 는 실제 unit, lesson_id 는 실제 lesson", () => {
    const unitIds = new Set(rows.project_learning_units.map((r) => r.id));
    const lessonIds = new Set(rows.learning_lessons.map((r) => r.id));
    assert.ok(rows.lesson_project_links.length > 0);
    for (const link of rows.lesson_project_links) {
      assert.ok(lessonIds.has(link.lesson_id), `link lesson 없음 ${String(link.lesson_id)}`);
      assert.ok(unitIds.has(link.unit_id), `link unit 없음 ${String(link.unit_id)}`);
    }
  });

  it("project_unit_examples 의 unit_id 는 실제 unit", () => {
    const unitIds = new Set(rows.project_learning_units.map((r) => r.id));
    for (const pe of rows.project_unit_examples) assert.ok(unitIds.has(pe.unit_id));
  });

  it("rowKey — 복합키 테이블", () => {
    assert.equal(rowKey("lesson_project_links", { lesson_id: "a", unit_id: "b" }), "a::b");
    assert.equal(rowKey("project_unit_examples", { unit_id: "u", example_id: "e" }), "u::e");
    assert.equal(rowKey("learning_lessons", { id: "x" }), "x");
    assert.equal(rowKey("lesson_problem", { lesson_id: "p" }), "p");
  });

  it("ON_CONFLICT 키가 11개 테이블 전부에 정의됨", () => {
    for (const table of TABLE_ORDER) assert.ok(ON_CONFLICT[table], `${table} on_conflict 없음`);
    assert.equal(ON_CONFLICT.project_unit_examples, "unit_id,example_id");
    assert.equal(ON_CONFLICT.lesson_project_links, "lesson_id,unit_id");
  });

  it("content_hash 는 재빌드해도 동일 (결정적)", () => {
    const rebuilt = buildCurriculumRows(loadCanonicalCurriculum());
    const a = rows.learning_lessons.map((r) => r.content_hash).sort();
    const b = rebuilt.learning_lessons.map((r) => r.content_hash).sort();
    assert.deepEqual(a, b);
  });
});
