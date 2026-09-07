---
id: typescript/functions-unions-guards/unions-and-type-guards
chapter: typescript/functions-unions-guards
title: 유니언 타입과 타입 가드
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [typescript, union, narrowing, type-guard, discriminated-union]
related_material_ids:
  - 1DreidRVMMRlnSW8bZ1GpF3zSnl1Zdd2uddwcARh2eog   # 05. 유니언 타입과 타입 가드
project_links:
  - unit: tenlune-marketing-agent/domain-model-string-unions
    note: ChannelId·TaskStatus 등을 문자열 리터럴 유니온으로 두고 판별 유니온으로 상태를 제약한 실제 도메인 모델
prerequisites:
  - typescript/functions-unions-guards/function-types
code_examples:
  - slug: union-narrow
    title: 유니언 + 좁히기
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      function format(x: string | number | Date): string {
        if (typeof x === "string") return x.trim();       // string
        if (typeof x === "number") return x.toFixed(2);    // number
        return x.toISOString();                            // 나머지 → Date
      }

      // 좁히는 방법들
      if (typeof v === "string") {}          // 원시 타입
      if (v instanceof Date) {}              // 클래스 인스턴스
      if ("email" in obj) {}                 // 속성 존재
      if (Array.isArray(v)) {}               // 배열
      if (v != null) {}                      // null / undefined 제거
  - slug: discriminated
    title: 판별 유니언 (discriminated union) — 실무 핵심
    source_type: generated_minimal
    language: ts
    code: |
      type Shape =
        | { kind: "circle"; radius: number }
        | { kind: "rect"; width: number; height: number };

      function area(s: Shape): number {
        switch (s.kind) {                 // 공통 리터럴 필드 "kind" 로 분기
          case "circle": return Math.PI * s.radius ** 2;   // 여기선 s.radius 접근 가능
          case "rect":   return s.width * s.height;
        }
      }
      // API 응답, Redux action, 상태 머신에 매우 흔한 패턴
  - slug: type-predicate
    title: 사용자 정의 타입 가드 (x is T)
    source_type: generated_minimal
    language: ts
    code: |
      type Cat = { meow: () => void };
      type Dog = { bark: () => void };

      function isCat(a: Cat | Dog): a is Cat {   // 반환 타입이 "a is Cat"
        return "meow" in a;
      }

      function speak(a: Cat | Dog) {
        if (isCat(a)) a.meow();   // isCat 이 true 면 TS 가 a 를 Cat 으로 안다
        else a.bark();
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **유니언 타입**(`A | B`)을 쓰고, `typeof` / `instanceof` / `in` / `Array.isArray` 로 **좁힌다**.
- **판별 유니언**(공통 리터럴 필드로 분기)을 설계한다 — API 응답·상태·액션의 표준.
- **사용자 정의 타입 가드**(`x is T` 반환)를 만든다.
- `strictNullChecks` 하에서 `null`/`undefined` 를 좁히는 습관을 들인다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 기본 타입, 리터럴 유니언, 객체 타입, 함수 타입.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 응답이 "성공이면 `{ data }`, 실패면 `{ error }`" 인데 타입이 `{ data?; error? }` 로 뭉뚱그려져,
  `data` 를 항상 `?.` 로 조심해야 한다.
- `string | number` 파라미터에서 `.toUpperCase()` 를 바로 불러 에러.
- `find` 결과(`T | undefined`)를 바로 써서 `undefined` 접근.

<!-- section: concept -->
## 유니언과 좁히기

{{code: union-narrow}}

- `A | B` = "A 이거나 B". 그대로는 **공통 멤버만** 쓸 수 있다.
- **좁히기(narrowing)**: 런타임 검사를 하면 그 블록 안에서 TS 가 더 구체적 타입을 안다.
  - `typeof x === "string" | "number" | "boolean" | ...` (원시)
  - `x instanceof Date` (클래스)
  - `"key" in obj` (속성)
  - `Array.isArray(x)`
  - `x != null` (`null`/`undefined` 제거 — `strictNullChecks` 에서 필수)

<!-- section: mechanism -->
## 판별 유니언

{{code: discriminated}}

- 각 갈래에 **공통의 리터럴 필드**(`kind: "circle" | "rect"`)를 둔다.
- `switch (s.kind)` 로 분기하면, 각 `case` 안에서 TS 가 정확한 갈래로 좁혀 준다.
- **매우 흔한 패턴**: `{ status: "loading" } | { status: "success"; data } | { status: "error"; error }`,
  Redux action `{ type: "added"; payload }`, 상태 머신.
- `default` 에서 `never` 로 받으면 "갈래를 빠뜨렸다"를 컴파일 에러로 잡을 수 있다(exhaustiveness).

<!-- section: code | lang: ts -->
## 사용자 정의 타입 가드

{{code: type-predicate}}

- 함수 반환 타입을 **`매개변수 is T`** 로 쓰면, 그 함수가 `true` 를 반환할 때 TS 가 인자를 `T` 로 좁힌다.
- 복잡한 판별 로직을 재사용할 때. (남용하면 런타임 검사와 타입이 어긋날 수 있으니 로직을 정확히.)

<!-- section: must_know -->
## 반드시 기억할 것

- `A | B` 는 공통 멤버만 → **좁혀서** 쓴다.
- 좁히기 도구: `typeof`(원시), `instanceof`(클래스), `in`(속성), `Array.isArray`, `x != null`.
- **판별 유니언**(공통 리터럴 필드 + `switch`)이 실무의 핵심 — 상태·응답·액션.
- `find`/`get`/JSON 등 `T | undefined` 반환은 **먼저 좁힌다**(`if (!x) return`).
- 사용자 정의 가드 `x is T` — 복잡한 판별 재사용. 로직을 정확히.
- `switch` 의 `default` 를 `never` 로 받아 갈래 누락을 잡는다.

<!-- section: experiment -->
## 직접 해 보기

1. `format(x: string | number | Date)` 를 만들어 세 갈래를 `typeof`/`instanceof` 로 좁혀라.
2. `type Result<T> = { ok: true; value: T } | { ok: false; error: string }` 를 만들고
   `if (r.ok) r.value else r.error` 로 안전하게 쓰는 함수를 짜라.
3. `Shape` 판별 유니언에 `"triangle"` 갈래를 추가하고, `area` 의 `switch` 에서 처리 안 하면
   `default: const _x: never = s` 가 에러를 내는지 확인.
4. `isNonEmptyString(x: unknown): x is string` 가드를 만들어 배열 필터에 써 보라.

<!-- section: check_question -->
## 이해 점검

1. `A | B` 를 그대로 쓰면 무엇만 가능한가? 어떻게 풀어 쓰나?
2. 판별 유니언이 무엇이고, 왜 `{ data?; error? }` 보다 나은가?
3. `x is T` 반환 타입 가드는 언제 만드나?
4. `strictNullChecks` 에서 `T | undefined` 값을 다루는 첫 단계는?

<!-- section: interview_question -->
## 면접 대비

- "판별 유니언(discriminated union)의 이점과 예를 들어 주세요."
- "타입 좁히기 방법들과, 사용자 정의 타입 가드가 필요한 경우는?"
- "`switch` 문에서 exhaustiveness 를 어떻게 강제하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 유니언과 좁히기 도구 5개, 판별 유니언 설계와 switch, x is T 가드, T | undefined 먼저 좁히기,
> never 로 누락 잡기를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`A | B` 는 좁혀서 쓴다(`typeof`/`instanceof`/`in`/`!= null`) — 상태·응답·액션은 공통 리터럴 필드를 둔
판별 유니언으로 설계하고 `switch` 로 분기, 복잡한 판별은 `x is T` 가드로 재사용한다.**

<!-- section: next -->
## 다음 Chapter

`typescript/generics` — 타입을 매개변수로.
