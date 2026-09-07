---
id: class-material-manager/frontmatter-parsing
project: class-material-manager
title: frontmatter 파싱 — 수업자료 .md 읽기
unit_kind: component
feature_area: 데이터 파이프라인
concepts: [frontmatter, YAML 파싱, 순수 함수, 재사용 모듈]
related_lessons:
  - typescript/functions-unions-guards/function-types
  - javascript/objects-and-builtins/working-with-objects
  - data-and-backend/relational-database-operations/schema-and-migrations
---

<!-- section: role -->
## 이 코드가 하는 일

`src/sync/frontmatter.ts` — `.md` 파일 맨 앞의 `---\n … \n---\n` 블록(frontmatter)을 본문과 **분리** 하고,
들여쓰기 없는 `key: value` 줄만 얕게 읽는 작은 도우미. 파이프라인과 curriculum sync가 공유한다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
export function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
  const text = raw.replace(/^﻿/, "");
  if (!text.startsWith("---")) return { frontmatter: "", body: text };
  const lines = text.split("\n");
  let close = -1;
  for (let i = 1; i < lines.length; i++)          // 2번째 줄부터 닫는 --- 찾기
    if ((lines[i] ?? "").trim() === "---") { close = i; break; }
  if (close === -1) return { frontmatter: "", body: text };
  const frontmatter = lines.slice(1, close).join("\n");
  let bodyStart = close + 1;
  if (lines[bodyStart] === "") bodyStart += 1;     // 뒤 빈 줄 하나 흡수
  return { frontmatter, body: lines.slice(bodyStart).join("\n") };
}
```

- 본문 중간의 `---`(수평선)은 건드리지 않는다 — **닫는 구분자는 2번째 줄부터 처음 만나는 `---` 하나** 뿐.
- `parseFlatFrontmatter` 는 최상위 스칼라(`key: value`)만 읽는다. 중첩 목록·블록 스칼라는 무시.

<!-- section: why -->
## 왜 YAML 라이브러리를 안 썼나 (파이프라인 쪽)

파이프라인이 다루는 `data/materials/**.md` · `data/references/**.md` 의 frontmatter는
`markdown-writer.ts` 가 만든 것이라 **최상위 스칼라 위주로 규칙적** 이다. 그 경우엔 YAML 파서를 새로
들이지 않고 최소만 파싱하는 게 의존성·성능 면에서 낫다.

> 대조: `sync-curriculum` 은 authored `.md` 의 frontmatter가 중첩(`sources[]`, `code_examples[]`)이라
> `splitFrontmatter` 로 블록만 떼고 실제 파싱은 js-yaml에 맡긴다(`src/sync/curriculum/`).

<!-- section: framework_role -->
## 순수 함수라서

`splitFrontmatter` 는 문자열 → 객체. 파일 시스템·전역 상태를 안 건드린다 → 그대로 테스트 가능하고,
뷰어(`gray-matter`)든 CLI든 같은 규칙으로 쓸 수 있다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `typescript/functions-unions-guards/function-types` — 순수 함수 시그니처
- `javascript/objects-and-builtins/working-with-objects` — key:value 파싱
- `data-and-backend/relational-database-operations/schema-and-migrations` — frontmatter → DB 매핑의 입력

<!-- section: caution -->
## 주의점

- 본문에 `---` 로 시작하는 줄(수평선)이 있어도 안전하다 — 닫는 구분자는 **처음 하나** 만 인정한다.
- `parseFlatFrontmatter` 로는 `tags: [a, b]` 같은 인라인 배열이 문자열로 온다 — 중첩이 필요하면 js-yaml을 쓴다.

<!-- section: experiment -->
## 작은 실습

1. 본문 중간에 `---` 를 넣은 `.md` 를 `splitFrontmatter` 에 넣어 수평선이 보존되는지 확인하라.
2. 닫는 `---` 가 없는 파일을 넣으면 무엇이 반환되나?
3. `parseFlatFrontmatter` 에 `tags: [react, hooks]` 를 넣어 값이 어떻게 오는지 보라.

<!-- section: check_question -->
## 이해 점검

1. "닫는 구분자는 처음 만나는 `---` 하나" 규칙이 막는 문제는?
2. 파이프라인은 왜 YAML 라이브러리를 안 쓰고, curriculum sync는 왜 쓰나?
3. `splitFrontmatter` 가 순수 함수라서 얻는 이점은?

<!-- section: review -->
## 한 줄 정리

**`splitFrontmatter` 는 `.md` 앞머리 `---` 블록만 떼어 본문과 나누는 순수 함수이며, 규칙적인 파이프라인
frontmatter는 얕은 파서로, 중첩된 authored frontmatter는 js-yaml로 나눠 처리한다.**
