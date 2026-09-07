/**
 * 뷰어의 커리큘럼 화면이 **읽기 전용 + 빈 상태 안전** 인지 정적으로 확인한다.
 *
 * (브라우저로 실제 흐름을 눌러 보는 것은 e2e/viewer.spec.ts "커리큘럼 · 실전 프로젝트 학습을
 *  오간다" 가 한다. 여기서는 서버 없이 코드 규칙만 본다.)
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

const lib = await readFile("viewer/lib/curriculum.ts", "utf8");
const curriculumPage = await readFile("viewer/app/curriculum/page.tsx", "utf8");
const projectsPage = await readFile("viewer/app/projects/page.tsx", "utf8");
const lessonPage = await readFile("viewer/app/lesson/[...id]/page.tsx", "utf8");
const unitPage = await readFile("viewer/app/unit/[...id]/page.tsx", "utf8");
const appShell = await readFile("viewer/components/AppShell.tsx", "utf8");

describe("커리큘럼 데이터 계층 (viewer/lib/curriculum.ts)", () => {
  it("SELECT 만 한다 — 쓰기·RPC 없음", () => {
    assert.ok(!/\.insert\(|\.update\(|\.upsert\(|\.delete\(|\.rpc\(/.test(lib), "쓰기 호출이 있으면 안 된다");
    assert.ok(lib.includes(".select("), "select 는 있어야 한다");
  });

  it("Git 파일을 직접 파싱하지 않는다 (projection 만 읽는다)", () => {
    assert.ok(!/curriculum\/tracks\.yaml|project-learning\/projects\.yaml|readFileSync|gray-matter|js-yaml/.test(lib));
  });

  it("dbConfigured=false 또는 실패 시 빈 값/ null 로 폴백한다", () => {
    assert.ok(lib.includes("dbConfigured"), "dbConfigured 확인이 있어야 한다");
    assert.ok(/function safe<T>/.test(lib), "safe() 폴백 래퍼가 있어야 한다");
    assert.ok(lib.includes("return fallback"), "실패 시 fallback 반환");
  });

  it("Lesson ↔ Unit 양방향 연결을 읽는다", () => {
    assert.ok(lib.includes("lesson_project_links"), "링크 테이블을 읽어야 한다");
    assert.ok(lib.includes("linkedUnits"), "Lesson → Unit");
    assert.ok(lib.includes("linkedLessons"), "Unit → Lesson");
  });

  it("11개 projection 테이블을 다룬다", () => {
    for (const t of [
      "learning_tracks",
      "learning_chapters",
      "learning_lessons",
      "lesson_sections",
      "lesson_code_examples",
      "learning_projects",
      "project_learning_units",
      "project_unit_sections",
      "project_unit_examples",
      "lesson_project_links",
      "project_examples",
    ]) {
      assert.ok(lib.includes(t), `${t} 를 읽어야 한다`);
    }
  });

  it("본문의 {{code: slug}} 를 코드 예제로 치환하는 전처리가 있다", () => {
    assert.ok(lib.includes("inlineCodeRefs"), "inlineCodeRefs export");
    assert.ok(/\\\{\\\{\\s\*code:/.test(lib) || lib.includes("{{ code:") || lib.includes("code:\\s*("), "code 참조 정규식");
  });
});

describe("커리큘럼 화면 (빈 상태 안내)", () => {
  it("커리큘럼 목록은 projection 이 없으면 sync-curriculum 안내를 보여준다", () => {
    assert.ok(curriculumPage.includes("sync-curriculum"), "빈 상태에서 다음 할 일을 알려 준다");
    assert.ok(curriculumPage.includes("tracks.length === 0"));
  });

  it("실전 프로젝트 목록도 빈 상태 안내가 있다", () => {
    assert.ok(projectsPage.includes("projects.length === 0"));
    assert.ok(projectsPage.includes("sync-curriculum"));
  });

  it("Lesson · Unit 상세는 없는 id 면 notFound() 로 404", () => {
    assert.ok(lessonPage.includes("notFound()"));
    assert.ok(unitPage.includes("notFound()"));
  });

  it("Lesson 상세는 섹션 · 코드 예제 · 연결 Unit 을 모두 렌더한다", () => {
    assert.ok(lessonPage.includes("lesson.sections"));
    assert.ok(lessonPage.includes("lesson.codeExamples"));
    assert.ok(lessonPage.includes("lesson.linkedUnits"));
    assert.ok(lessonPage.includes("inlineCodeRefs"));
  });

  it("Unit 상세는 본문 섹션 · 예제 · 관련 Lesson 을 렌더한다", () => {
    assert.ok(unitPage.includes("unit.sections"));
    assert.ok(unitPage.includes("unit.examples"));
    assert.ok(unitPage.includes("unit.linkedLessons"));
  });
});

describe("네비게이션", () => {
  it("사이드바에 커리큘럼 · 실전 프로젝트 학습 링크가 있다", () => {
    assert.ok(appShell.includes('href="/curriculum"'));
    assert.ok(appShell.includes('href="/projects"'));
  });
});
