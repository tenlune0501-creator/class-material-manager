import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import { lessonsForMaterials, materialLessonIds } from "../viewer/lib/lesson-entry.ts";
import { lessonHref, materialEntryHref } from "../viewer/lib/url.ts";

describe("자료에서 정규 Lesson 진입", () => {
  const row = { id: "web/html/semantic", title: "시맨틱 태그", chapter_id: "web/html", ord: 10,
    lesson_kind: "lesson", related_material_ids: ["doc-a", "doc-b"] };

  it("여러 자료가 같은 Lesson을 가리켜도 같은 ID/제목으로 한 번만 제공한다", () => {
    assert.deepEqual(lessonsForMaterials([row], ["doc-a", "doc-b", "doc-a"]),
      [{ id: row.id, title: row.title }]);
  });

  it("자료와 여러 Lesson의 명시적 연결을 모두 보존하고 순서를 유지한다", () => {
    const second = { ...row, id: "web/html/forms", title: "폼", ord: 20 };
    assert.deepEqual(lessonsForMaterials([second, row], ["doc-b"]).map((l) => l.id), [row.id, second.id]);
  });

  it("제목이 같아도 연결 없는 자료·문제·잘못된 매핑에는 Lesson을 추측하지 않는다", () => {
    assert.deepEqual(lessonsForMaterials([row], [row.title]), []);
    assert.deepEqual(lessonsForMaterials([row], []), []);
    assert.deepEqual(lessonsForMaterials([
      { ...row, lesson_kind: "problem" }, { ...row, related_material_ids: null },
    ], ["doc-a"]), []);
  });

  it("과목·자료·검색·복습은 같은 링크 컴포넌트와 query 없는 Lesson URL을 사용한다", async () => {
    for (const path of ["s/[subject]", "search", "study"]) {
      const source = await readFile(`viewer/app/${path}/page.tsx`, "utf8");
      assert.ok(source.includes("<MaterialLessonLinks materialIds="), path);
      assert.ok(source.includes("materialEntryHref("), `${path}: 원래 Material 클릭도 resolver를 사용한다`);
    }
    const links = await readFile("viewer/components/MaterialLessonLinks.tsx", "utf8");
    for (const path of ["learn", "examples/[id]"]) {
      const source = await readFile(`viewer/app/${path}/page.tsx`, "utf8");
      assert.ok(source.includes("materialEntryHref("), `${path}: 일반 학습 링크도 동일 resolver 사용`);
    }
    assert.ok(links.includes("href={lessonHref(lesson.id)}"));
    assert.ok(!links.includes("TutorApp"));
    assert.ok(!/<Paper|<Typography|<List\s|aria-label="연결된 Lesson"/.test(links), "별도 카드·헤더·목록 wrapper를 만들지 않는다");
    assert.ok(!links.includes("Lesson · AI Tutor와 공부하기"));
    const materialPage = await readFile("viewer/app/m/[docId]/page.tsx", "utf8");
    assert.ok(!materialPage.includes("MaterialLessonLinks"), "원문 화면에 중간 진입 안내를 만들지 않는다");
    assert.ok(!materialPage.includes("redirect("), "직접 원문 접근은 redirect하지 않는다");
  });

  it("mapped Material 클릭과 Lesson 직접 링크는 같은 canonical URL로 수렴한다", () => {
    const destinations = materialLessonIds([row], ["doc-a", "doc-b"]);
    assert.equal(materialEntryHref("doc-a", destinations), lessonHref(row.id));
    assert.equal(materialEntryHref("doc-b", destinations), lessonHref(row.id));
    assert.equal(materialEntryHref(row.title, destinations), `/m/${encodeURIComponent(row.title)}`);
    assert.equal(materialEntryHref("missing/id", destinations), "/m/missing%2Fid");
  });

  it("복수 명시적 매핑은 목록 순서로 결정되며 DB 반환 순서에 영향받지 않는다", () => {
    const second = { ...row, id: "web/html/other", ord: 20 };
    assert.deepEqual(materialLessonIds([second, row], ["doc-a"]), materialLessonIds([row, second], ["doc-a"]));
    assert.equal(materialLessonIds([second, row], ["doc-a"])["doc-a"], row.id);
    assert.deepEqual(materialLessonIds([{ ...row, lesson_kind: "problem" }], ["doc-a"]), {});
  });

  it("Lesson의 원문 열기는 학습 resolver를 거치지 않고 /m으로 연결한다", async () => {
    const page = await readFile("viewer/app/lesson/[...id]/page.tsx", "utf8");
    assert.ok(page.includes("lesson.relatedMaterialIds.map(getMaterial)"));
    assert.ok(page.includes('href={`/m/${encodeURIComponent(material.docId)}`}'));
    assert.ok(page.includes("원문 열기"));
  });
});
