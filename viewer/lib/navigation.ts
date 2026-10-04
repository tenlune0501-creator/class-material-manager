/** Route semantics are shared; each surface chooses which destination represents them. */
export const navigationItems = [
  { id: "tutor", href: "/tutor", label: "AI Tutor", icon: "🎧", description: "지난 진도 → 이어서 음성/텍스트 과외" },
  { id: "curriculum", href: "/curriculum", label: "커리큘럼", icon: "🗺️", description: "Track → Chapter → Lesson" },
  { id: "projects", href: "/projects", label: "실전 프로젝트 학습", icon: "🏗️", description: "Project → Unit → 관련 Lesson" },
  { id: "study", href: "/study", label: "다시 공부하기", icon: "📚", description: "다시 살펴볼 Lesson 선택" },
  { id: "materials", href: "/materials", label: "학습자료", icon: "📁", description: "원본 자료 · 과목별 탐색 · 공식 문서" },
] as const;

/** Secondary tools live inside the material library on every surface. */
export const materialNavigationItems = [
  { id: "learn", href: "/learn", label: "통합 학습자료", icon: "🎓", description: "설명 + 실습 코드 + 공식 문서" },
  { id: "compare", href: "/compare", label: "수업 방식 점검", icon: "⚖️", description: "지금도 그대로 써도 되나" },
  { id: "material-study", href: "/materials/study", label: "자료 복습 가이드", icon: "📚", description: "자료별 변경 사항과 복습 순서" },
  { id: "examples", href: "/examples", label: "실전 예제", icon: "🧩", description: "개념을 실제 프로젝트 코드로" },
] as const;

const matches = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
export function isMaterialRoute(pathname: string): boolean {
  return ["/materials", "/m", "/s", "/r", ...materialNavigationItems.map((item) => item.href)]
    .some((href) => matches(pathname, href));
}

export function classifyRoute(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/lesson/")) return "lesson";
  if (pathname.startsWith("/unit/")) return "projects";
  if (isMaterialRoute(pathname)) return "materials";
  return navigationItems.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.id ?? "more";
}

export function desktopDestination(pathname: string): string {
  const route = classifyRoute(pathname);
  return route === "lesson" || route === "home" ? "curriculum" : route;
}

export function mobileDestination(pathname: string): string {
  const route = classifyRoute(pathname);
  if (route === "lesson" || route === "tutor") return "lesson";
  return route === "home" || route === "curriculum" ? route : "more";
}

export function mobileLessonHref(pathname: string): string {
  return classifyRoute(pathname) === "lesson" ? pathname : "/tutor";
}
