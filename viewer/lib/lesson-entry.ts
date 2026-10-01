/** 자료는 Lesson과 다른 엔터티다. 명시적인 연결만 사용하고 제목/과목으로 추측하지 않는다. */
export function lessonsForMaterials(
  rows: ReadonlyArray<Record<string, unknown>>,
  materialIds: readonly string[],
): Array<{ id: string; title: string }> {
  const ids = new Set(materialIds);
  return rows
    .filter((row) => row.lesson_kind === "lesson" &&
      Array.isArray(row.related_material_ids) &&
      row.related_material_ids.some((id) => typeof id === "string" && ids.has(id)))
    .sort((a, b) => String(a.chapter_id).localeCompare(String(b.chapter_id)) ||
      Number(a.ord ?? 0) - Number(b.ord ?? 0) || String(a.id).localeCompare(String(b.id)))
    .map((row) => ({ id: String(row.id), title: String(row.title) }));
}

/** 여러 Lesson에 연결된 자료는 기존 목록 순서(chapter/ord/id)의 첫 Lesson으로 진입한다.
 * 모든 후보는 explicit mapping이어야 하며, 원문 링크는 이 resolver를 사용하지 않는다. */
export function materialLessonIds(
  rows: ReadonlyArray<Record<string, unknown>>,
  materialIds: readonly string[],
): Record<string, string> {
  const wanted = new Set(materialIds);
  const destinations = new Map<string, string>();
  const byId = new Map(rows.map((row) => [String(row.id), row]));
  for (const lesson of lessonsForMaterials(rows, materialIds)) {
    for (const id of byId.get(lesson.id)!.related_material_ids as unknown[]) {
      if (typeof id === "string" && wanted.has(id) && !destinations.has(id)) {
        destinations.set(id, lesson.id);
      }
    }
  }
  return Object.fromEntries(destinations);
}
