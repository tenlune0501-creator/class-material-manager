import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import { navigationItems, materialNavigationItems, isMaterialRoute, desktopDestination, mobileDestination } from "../viewer/lib/navigation.ts";

describe("Lesson-first information architecture", () => {
  it("all material routes share one destination without claiming similarly named routes", () => {
    for (const path of ["/materials", "/materials/study", "/m/id", "/s/React", "/r/react/hooks", "/learn", "/compare", "/examples/code"]) {
      assert.equal(isMaterialRoute(path), true, path);
      assert.equal(desktopDestination(path), "materials", path);
      assert.equal(mobileDestination(path), "more", path);
    }
    for (const path of ["/materialship", "/study", "/lesson/web/html", "/search", "/learning"]) assert.equal(isMaterialRoute(path), false, path);
  });
  it("primary learning destinations never expose a Material catalogue", () => {
    assert.deepEqual(navigationItems.map((item) => item.id), ["tutor", "curriculum", "projects", "study", "materials"]);
    assert.equal(desktopDestination("/"), "curriculum");
    assert.equal(desktopDestination("/lesson/web/html"), "curriculum");
    assert.equal(mobileDestination("/lesson/web/html"), "lesson");
    assert.equal(desktopDestination("/unit/project/unit"), "projects");
    assert.ok(materialNavigationItems.some((item) => item.href === "/materials/study"));
  });
  it("home and review select Lessons; legacy material review remains in the library", async () => {
    const home = await readFile("viewer/app/page.tsx", "utf8");
    const study = await readFile("viewer/app/study/page.tsx", "utf8");
    const library = await readFile("viewer/app/materials/study/page.tsx", "utf8");
    assert.ok(home.includes('./curriculum/page'));
    assert.ok(study.includes('href={lessonHref(lesson.id)}'));
    assert.ok(!study.includes('/m/'));
    assert.ok(library.includes('StudyCard'));
    assert.ok(library.includes('/materials/study?'));
  });
  it("search explicitly separates related Lessons from Material hits", async () => {
    const search = await readFile("viewer/app/search/page.tsx", "utf8");
    assert.ok(search.includes('aria-label="관련 Lesson"'));
    assert.ok(search.includes('href={hit.href}'));
    assert.ok(search.includes('"학습자료" : "공식 문서"'));
    assert.ok(!search.includes('materialEntryHref'));
  });
});
