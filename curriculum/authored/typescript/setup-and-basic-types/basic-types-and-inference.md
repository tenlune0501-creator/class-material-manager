---
id: typescript/setup-and-basic-types/basic-types-and-inference
chapter: typescript/setup-and-basic-types
title: 기본 타입과 타입 추론
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [typescript, types, inference, primitives]
related_material_ids:
  - 1TW8aWvUFafFEUa-JtM50wYvz0SpwUFv3g7pinqKGHCw   # 02. 기본 타입과 타입 추론
prerequisites:
  - typescript/setup-and-basic-types/intro-and-setup
code_examples:
  - slug: primitives
    title: 기본 타입 + 추론
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      let count: number = 0;
      let name = "지현";          // string 으로 자동 추론 → 굳이 : string 안 씀
      let done = false;           // boolean 추론

      let ids: number[] = [1, 2, 3];        // 배열
      let pair: [string, number] = ["a", 1]; // 튜플 (길이·순서 고정)

      let anything: any;          // 타입 검사 OFF (피한다)
      let safe: unknown;          // "뭔지 모름" — 쓰기 전에 좁혀야 함 (any 의 안전판)

      function log(msg: string): void {}    // 반환 없음
      function fail(): never { throw new Error(); }  // 절대 정상 반환 안 함
  - slug: inference
    title: 추론 — 명시할 때 vs 맡길 때
    source_type: generated_minimal
    language: ts
    code: |
      // 맡긴다 (초기값이 있으면 TS 가 안다)
      const price = 1000;              // number
      const tags = ["a", "b"];        // string[]
      const user = { id: 1, name: "A" }; // { id: number; name: string }

      // 명시한다 (초기값이 없거나, 더 넓거나 좁게 원할 때)
      let selected: string | null = null;
      const scores: number[] = [];     // [] 만으론 any[] 로 추론됨
      function area(w: number, h: number): number { return w * h; } // 파라미터는 항상 명시
  - slug: literal-narrow
    title: 리터럴 타입과 좁히기
    source_type: generated_minimal
    language: ts
    code: |
      let mode: "light" | "dark" = "light";  // 이 두 문자열만 허용
      // mode = "blue";  // 에러

      function handle(x: string | number) {
        if (typeof x === "string") {
          x.toUpperCase();   // 여기선 x 가 string 으로 좁혀짐
        } else {
          x.toFixed(2);      // 여기선 number
        }
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 기본 타입(`number`, `string`, `boolean`, `array`, `tuple`, `any`, `unknown`, `void`, `never`)을 쓴다.
- **타입 추론**이 언제 충분한지, 언제 명시해야 하는지 판단한다(파라미터는 항상 명시).
- `any` 대신 `unknown` 을 쓰는 이유를 안다.
- **리터럴 유니언 타입**(`"light" | "dark"`)과 **좁히기**(`typeof` 로 분기)를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `typescript/setup-and-basic-types/intro-and-setup`. JS 자료형·truthy/falsy.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 모든 것에 `: any` 를 붙여 TS 를 쓰는 의미가 없어진다.
- 타입을 다 손으로 적어서 코드가 장황해진다(추론으로 될 것도).
- `string | number` 를 받는 함수에서 `.toUpperCase()` 를 바로 불러 에러.

<!-- section: concept -->
## 기본 타입

{{code: primitives}}

- **원시**: `number` `string` `boolean` (JS 와 동일). `null` `undefined`.
- **배열**: `number[]` 또는 `Array<number>`. **튜플**: `[string, number]` (길이·위치·타입 고정).
- **`any`** — 타입 검사를 **끈다**. 전염성이 있고 버그를 숨긴다 → **쓰지 않는다**(정말 어쩔 수 없을 때만).
- **`unknown`** — "뭔지 모름". `any` 와 달리 **쓰기 전에 타입을 좁혀야** 한다(안전). 외부 입력·JSON 파싱에.
- **`void`** — 반환값 없음(함수). **`never`** — 절대 정상 종료 안 함(항상 throw, 무한 루프).

<!-- section: mechanism -->
## 추론 — 맡길 것과 명시할 것

{{code: inference}}

- **맡긴다**: 초기값이 있는 `const`/`let`, 객체 리터럴, 배열 리터럴 → TS 가 정확히 안다. `: string` 을 다시 쓰면 잡음.
- **명시한다**:
  - **함수 파라미터** (항상 — 추론 불가).
  - 초기값이 없을 때 (`let x: string`).
  - 빈 배열 (`const a: number[] = []`, 안 그러면 `any[]`).
  - 반환 타입을 계약으로 고정하고 싶을 때.
- 규칙: **"변수는 맡기고, 경계(함수 시그니처)는 명시한다."**

<!-- section: code | lang: ts -->
## 리터럴 유니언 · 좁히기

{{code: literal-narrow}}

- **리터럴 타입**: `"light" | "dark"` — 그 값들만 허용. enum 대신 자주 쓴다(가볍다).
- **좁히기(narrowing)**: `typeof x === "string"` 같은 검사를 하면, 그 블록 안에서 TS 가 `x` 를 더 구체적 타입으로 안다.
  (자세히는 `functions-unions-guards` 챕터)

<!-- section: must_know -->
## 반드시 기억할 것

- 원시 + `number[]`/`[a, b]`(튜플) + `void`/`never`.
- **`any` 금지**(검사 꺼짐). 모르면 **`unknown`** (쓰기 전 좁히기 강제).
- **변수는 추론에 맡기고, 함수 파라미터·빈 배열·초기값 없는 변수는 명시.**
- 반환 타입은 보통 추론에 맡기되, 공개 API 는 명시해 계약을 고정.
- 리터럴 유니언(`"a" | "b"`)이 enum 보다 가볍고 흔함.
- `unknown` 값은 `typeof`/`in`/타입 가드로 좁힌 뒤 사용.

<!-- section: experiment -->
## 직접 해 보기

1. `let x = 5; x = "a";` → 에러. `let y: number | string = 5; y = "a";` → OK. 차이를 설명하라.
2. `const nums = []` 후 `nums.push(1)` → `nums` 가 `any[]` 인 걸 확인하고 `: number[]` 로 고쳐라.
3. `function pick(x: string | number)` 에서 `x.toUpperCase()` 를 바로 부르면 에러 → `typeof` 로 좁혀 해결.
4. `let mode: "sm" | "md" | "lg" = "md"` 를 만들고 `"xl"` 을 넣어 에러를 확인.
5. `JSON.parse(text)` 의 결과 타입을 확인(`any`) → `unknown` 으로 캐스팅하고 좁혀서 써 보라.

<!-- section: check_question -->
## 이해 점검

1. `any` 와 `unknown` 의 차이는?
2. 타입을 명시해야 하는 3가지 경우는?
3. `void` 와 `never` 의 차이를 예로.
4. `"light" | "dark"` 같은 타입을 뭐라고 부르고, enum 대신 쓰는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "`any` 를 피해야 하는 이유와, 불가피할 때의 대안은?"
- "타입 추론에 맡길 때와 명시할 때의 기준은?"
- "`unknown` 을 안전하게 사용하는 방법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 기본 타입 목록, any vs unknown, 추론 맡기기 vs 명시(파라미터·빈배열), 리터럴 유니언, 좁히기 개념을
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**변수 타입은 추론에 맡기고 함수 시그니처는 명시한다 — `any` 대신 `unknown`(쓰기 전 좁히기),
리터럴 유니언(`"a" | "b"`)으로 값 집합을 제한한다.**

<!-- section: next -->
## 다음 Chapter

`typescript/objects-interfaces-aliases` — 객체 타입, interface, type.
