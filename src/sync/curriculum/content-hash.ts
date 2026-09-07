/**
 * curriculum/project-learning projection 행의 `content_hash` 계산.
 *
 * 계약(curriculum/README.md §6, migration 주석): "그 항목 정규화 직렬화의 sha256".
 * 정규화 = 객체 키를 정렬해 결정적으로 직렬화한다(배열 순서는 의미가 있으므로 보존).
 * 같은 입력이면 몇 번을 다시 이관해도 같은 hex 문자열이 나온다.
 */
import { createHash } from "node:crypto";

export function curriculumContentHash(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === undefined || value === null) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}
