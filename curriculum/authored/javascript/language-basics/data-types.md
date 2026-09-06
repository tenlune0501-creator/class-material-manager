---
id: javascript/language-basics/data-types
chapter: javascript/language-basics
title: 자료형
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [javascript, types, primitives]
related_material_ids:
  - 1fhRBcjSPLJxleIVwjxC3KOhhNyHNL_vi6r8suTlEP-Q   # Javascript 01- 자료형
sources:
  - reference_slug: javascript/Number
  - reference_slug: javascript/String
  - reference_slug: javascript/Boolean
code_examples:
  - slug: primitives
    title: 원시 자료형 6종
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const n = 42;            // number  (정수·실수 구분 없음. 3.14 도 number)
      const s = "hello";       // string  ("" '' `` 다 됨)
      const b = true;          // boolean (true / false)
      const u = undefined;     // 값이 아직 없음 (선언만 하고 할당 안 함)
      const nl = null;         // "비어 있음"을 개발자가 명시적으로 넣은 값
      const sym = Symbol("id");// symbol  (고급. 지금은 존재만)
      // (bigint — 아주 큰 정수용. 웹 개발에서 드묾)

      typeof n;   // "number"
      typeof s;   // "string"
      typeof u;   // "undefined"
      typeof nl;  // "object"  ← 유명한 버그. null 은 원시값이지만 typeof 는 "object"
  - slug: falsy
    title: falsy 값 — 조건문에서 false 취급되는 것
    source_type: generated_minimal
    language: js
    code: |
      // 아래 6개만 falsy. 나머지는 전부 truthy.
      if (false)      {}
      if (0)          {}
      if ("")         {}   // 빈 문자열
      if (null)       {}
      if (undefined)  {}
      if (NaN)        {}

      if ("0")   { /* 실행됨! 문자열 "0" 은 비어 있지 않으므로 truthy */ }
      if ([])    { /* 실행됨! 빈 배열도 truthy */ }
      if ({})    { /* 실행됨! 빈 객체도 truthy */ }
  - slug: object-array
    title: object 와 array (참조형)
    source_type: generated_minimal
    language: js
    code: |
      const person = { name: "지현", age: 20 };   // object — 키:값 묶음
      person.name;         // "지현"
      person["age"];       // 20

      const nums = [10, 20, 30];                  // array — 순서 있는 목록 (사실 object)
      nums[0];             // 10
      nums.length;         // 3
      typeof nums;         // "object"  → 배열 판별은 Array.isArray(nums)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **원시 자료형**(number, string, boolean, undefined, null, symbol)과 **참조형**(object, array)을 구분한다.
- `typeof` 로 자료형을 확인할 수 있고, `typeof null === "object"` 같은 함정을 안다.
- **truthy / falsy** — 조건문에서 어떤 값이 `false` 로 취급되는지(6개) 외운다.
- `undefined` 와 `null` 의 차이를 설명할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/must-know` (연산자, `===`, console.log).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `if (userInput)` 가 `"0"` 이나 `" "` 도 통과시킨다 → truthy/falsy 를 모름.
- API 에서 받은 값이 `null` 인지 `undefined` 인지에 따라 처리를 다르게 해야 하는데 구분을 못 함.
- `typeof [] === "object"` 라서 배열인지 확인이 안 됨.

<!-- section: concept -->
## 원시 자료형 6종

{{code: primitives}}

- **number** — 정수·실수 구분 없음. `10`, `3.14`, `-5` 다 number. 특수값: `NaN`, `Infinity`.
- **string** — `"..."`, `'...'`, `` `...` ``.
- **boolean** — `true` / `false`.
- **undefined** — "값이 아직 없음". 변수를 선언만 하고 할당 안 하면 자동으로 이 값.
- **null** — "비어 있음"을 **개발자가 명시적으로** 넣은 값. (typeof 는 `"object"` — 언어의 오래된 버그)
- **symbol** / **bigint** — 고급. 지금은 존재만 알면 됨.

<!-- section: concept | title: 참조형 -->
## 참조형 — object 와 array

{{code: object-array}}

- **object** — `{ 키: 값 }`. `person.name` 또는 `person["name"]`.
- **array** — `[값, 값, ...]`. 순서와 `length` 가 있다. **기술적으로는 object** 라 `typeof [] === "object"`
  → 배열 판별은 **`Array.isArray(x)`**.
- 원시값은 "값 자체"를 담고, 참조형은 "값이 있는 곳의 주소"를 담는다 (자세한 건 뒤 Lesson).

<!-- section: mechanism -->
## truthy / falsy

`if (...)`, `&&`, `||`, 삼항 연산자는 값을 boolean 으로 본다. **falsy 는 정확히 6개**:

`false`, `0`, `""`(빈 문자열), `null`, `undefined`, `NaN`

{{code: falsy}}

그 외 **전부 truthy** — `"0"`, `"false"`, `[]`, `{}`, `-1` 모두 참으로 취급.
그래서 "값이 있는지"를 볼 땐 `if (value)` 로 충분하지만, **"빈 문자열도 걸러야 하면"** `if (value !== "")`
처럼 명시적으로.

<!-- section: must_know -->
## 반드시 기억할 것

- 원시형: number / string / boolean / undefined / null / symbol. 참조형: object / array.
- **falsy 6개**: `false 0 "" null undefined NaN`. 나머지는 전부 truthy (`[]`, `{}`, `"0"` 포함).
- `undefined` = 아직 값 없음(자동). `null` = 비었음(의도적).
- `typeof null === "object"` (버그, 그냥 외운다). 배열은 `Array.isArray()`.
- number 는 정수/실수 구분이 없다. `0.1 + 0.2 !== 0.3` (부동소수 오차 — 돈 계산은 정수(원 단위)로).

<!-- section: experiment -->
## 직접 해 보기

1. 콘솔에서 `typeof` 를 `42`, `"x"`, `true`, `undefined`, `null`, `[]`, `{}`, `function(){}` 에 각각 적용하라.
2. `if` 로 `0`, `"0"`, `""`, `" "`, `[]`, `null` 을 하나씩 검사해 어느 게 통과하는지 확인하라.
3. `let x;` 만 하고 `x` 를 출력 → `undefined`. `x = null` 후 다시 출력. `x == null` 과 `x === null` 도 비교.
4. `0.1 + 0.2` 를 출력해 보라.

<!-- section: check_question -->
## 이해 점검

1. falsy 값 6개를 대라. `[]` 와 `"0"` 은 truthy 인가 falsy 인가?
2. `undefined` 와 `null` 의 차이를 한 문장으로.
3. `typeof [1,2,3]` 의 결과와, 배열을 제대로 판별하는 방법은?
4. `if (name)` 만으로는 부족하고 `if (name !== "")` 가 필요한 상황은?

<!-- section: interview_question -->
## 면접 대비

- "JS 의 원시 타입을 나열하고, 참조 타입과의 차이를 설명해 주세요."
- "truthy/falsy 를 설명하고, 실무에서 주의할 점을 말해 주세요."
- "`0.1 + 0.2 === 0.3` 이 `false` 인 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 원시형 6 + 참조형 2, falsy 6개, undefined vs null, typeof null, 배열 판별, 부동소수 오차를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**값은 원시형(number/string/boolean/undefined/null/symbol)과 참조형(object/array)으로 나뉜다 —
조건문에서 falsy 는 정확히 `false 0 "" null undefined NaN` 6개, 나머지는 다 참이다.**

<!-- section: next -->
## 다음 Lesson

`language-basics/variables-and-type-conversion` — `let`/`const` 와 형 변환.
