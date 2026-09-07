/**
 * YAML 파싱 도우미 (sync-curriculum 전용).
 *
 * CLI 쪽에는 YAML 의존성이 없다. 뷰어(`viewer/`)가 이미 `gray-matter`(내부적으로 js-yaml)
 * 로 `curriculum/**` 와 같은 파일을 파싱하므로, 새 의존성을 추가하는 대신 그 파서를
 * `createRequire` 로 재사용한다 — `curriculum/` 구조 검증 스크립트와 동일한 방식이다.
 */
import { createRequire } from "node:module";

interface JsYamlModule {
  load(source: string): unknown;
}

const viewerRequire = createRequire(`${process.cwd()}/viewer/package.json`);
const jsYaml = viewerRequire("js-yaml") as JsYamlModule;

/** YAML 문서 하나를 파싱한다. 최상위가 매핑이 아니면 호출부에서 검증한다. */
export function parseYaml(source: string): unknown {
  return jsYaml.load(source);
}
