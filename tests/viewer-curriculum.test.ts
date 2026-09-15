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
const curriculumRender = await readFile("viewer/lib/curriculum-render.ts", "utf8");
const curriculumPage = await readFile("viewer/app/curriculum/page.tsx", "utf8");
const projectsPage = await readFile("viewer/app/projects/page.tsx", "utf8");
const lessonPage = await readFile("viewer/app/lesson/[...id]/page.tsx", "utf8");
const lessonContent = await readFile("viewer/components/LessonContent.tsx", "utf8");
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
    // 실제 정의는 curriculum-render.ts에 있다(DB 접근 없는 순수 헬퍼라 클라이언트
    // 컴포넌트에서도 쓸 수 있게 분리 — 아래 "AI Tutor 교재 렌더러" describe 참고).
    // curriculum.ts는 하위 호환을 위해 그대로 재노출한다.
    assert.ok(lib.includes("export { inlineCodeRefs, SECTION_LABEL }"), "재노출(re-export)해야 한다");
    assert.ok(curriculumRender.includes("export function inlineCodeRefs"));
    assert.ok(
      /\\\{\\\{\\s\*code:/.test(curriculumRender) || curriculumRender.includes("{{ code:") || curriculumRender.includes("code:\\s*("),
      "code 참조 정규식",
    );
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
    // 실제 렌더링은 LessonContent(공유 부품, AI Tutor와 함께 쓴다)가 맡는다 —
    // lessonPage는 그 부품을 그대로 가져다 쓴다(같은 렌더러를 두 번 만들지 않는다).
    assert.ok(lessonPage.includes("LessonContent"), "lessonPage가 LessonContent를 써야 한다");
    assert.ok(lessonContent.includes("lesson.sections"));
    assert.ok(lessonContent.includes("lesson.codeExamples"));
    assert.ok(lessonContent.includes("lesson.linkedUnits"));
    assert.ok(lessonContent.includes("inlineCodeRefs"));
  });

  it("Unit 상세는 본문 섹션 · 예제 · 관련 Lesson 을 렌더한다", () => {
    assert.ok(unitPage.includes("unit.sections"));
    assert.ok(unitPage.includes("unit.examples"));
    assert.ok(unitPage.includes("unit.linkedLessons"));
  });
});

describe("curriculum-render.ts — 클라이언트 컴포넌트에서도 안전한 순수 렌더링 헬퍼", () => {
  it("DB/Supabase server 클라이언트를 import하지 않는다(next/headers가 클라이언트 번들에 끌려가면 빌드가 깨진다)", () => {
    // 설명 주석에는 이유를 적기 위해 그 경로를 문자열로 언급하므로, 실제 import 구문만 본다.
    assert.ok(!/^import .*@\/lib\/supabase\/server/m.test(curriculumRender));
    assert.ok(!/^import .*next\/headers/m.test(curriculumRender));
  });

  it("LessonContent는 값(inlineCodeRefs/SECTION_LABEL)을 curriculum.ts가 아니라 curriculum-render.ts에서 가져온다", () => {
    assert.ok(lessonContent.includes('from "@/lib/curriculum-render"'));
    assert.ok(
      !/import\s*\{[^}]*\b(inlineCodeRefs|SECTION_LABEL)\b[^}]*\}\s*from\s*"@\/lib\/curriculum"/.test(lessonContent),
      "value import는 curriculum.ts(서버 전용 supabase client를 최상단에서 import)에서 직접 가져오면 안 된다",
    );
  });
});

describe("네비게이션", () => {
  it("사이드바에 커리큘럼 · 실전 프로젝트 학습 링크가 있다", () => {
    assert.ok(appShell.includes('href="/curriculum"'));
    assert.ok(appShell.includes('href="/projects"'));
  });
});
