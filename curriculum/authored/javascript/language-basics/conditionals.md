---
id: javascript/language-basics/conditionals
chapter: javascript/language-basics
title: 조건문
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [javascript, conditionals, if, switch]
related_material_ids:
  - 1UmeYeEM-QIPQu3ul8-W3cLsYRqj4IbCKs4u8uxUNb5o   # Javascript 03 - 조건문
code_examples:
  - slug: if-else
    title: if / else if / else
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const score = 82;

      if (score >= 90) {
        console.log("A");
      } else if (score >= 80) {
        console.log("B");         // ← 여기 실행. 아래는 안 봄
      } else if (score >= 70) {
        console.log("C");
      } else {
        console.log("F");
      }

      // 조건이 truthy/falsy 로 평가된다
      if (user) { /* user 가 null/undefined/"" 가 아니면 */ }
      if (list.length === 0) { /* 명시적으로 비교하는 게 안전 */ }
  - slug: ternary-short
    title: 삼항 연산자 · 단축 평가
    source_type: generated_minimal
    language: js
    code: |
      // 삼항: 조건 ? 참일때 : 거짓일때  — "값"을 고를 때
      const label = score >= 60 ? "합격" : "불합격";
      const fee = isMember ? 0 : 5000;

      // && : 왼쪽이 truthy 면 오른쪽을 반환 (아니면 왼쪽)
      const name = user && user.name;        // user 없으면 undefined

      // || : 왼쪽이 falsy 면 오른쪽 (기본값 패턴)
      const nickname = input || "익명";       // 단, input 이 0 이나 "" 여도 "익명" 됨

      // ?? : 왼쪽이 null/undefined 일 때만 오른쪽 (0, "" 은 통과)
      const count = value ?? 0;               // value 가 0 이면 0 유지

      // ?. : 중간이 null/undefined 면 undefined (에러 대신)
      const city = user?.address?.city;
  - slug: switch
    title: switch — 한 값을 여러 경우와 비교
    source_type: generated_minimal
    language: js
    code: |
      switch (fruit) {
        case "apple":
        case "cherry":
          console.log("빨강");
          break;            // ★ break 안 하면 아래 case 로 흘러감(fall-through)
        case "banana":
          console.log("노랑");
          break;
        default:
          console.log("모름");
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `if` / `else if` / `else` 로 분기를 **직접 짤 수 있고**, 조건이 truthy/falsy 로 평가된다는 것을 안다.
- **삼항 연산자**(`? :`)로 "값"을 고르고, `&&` / `||` / `??` / `?.` 의 단축 동작을 쓸 수 있다.
- `switch` 의 `break` 와 fall-through 를 안다.
- `if` 와 삼항, `if-else if` 와 `switch` 를 언제 각각 쓰는지 판단한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/data-types` (truthy/falsy, `===`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `if (a = 1)` — `==` 를 실수로 `=` 로 써서 조건이 항상 참.
- `switch` 에서 `break` 를 빼먹어 여러 case 가 다 실행됨.
- `input || "기본값"` 이 `input` 이 `0` 일 때도 기본값으로 덮어씀.

<!-- section: concept -->
## if / else if / else

{{code: if-else}}

- 위에서부터 조건을 확인하다 **처음 참인 블록만** 실행하고 나머지는 건너뛴다.
- 조건은 boolean 이 아니어도 **truthy/falsy** 로 평가. `if (list.length)` 도 되지만
  **`if (list.length === 0)`** 처럼 명시하는 게 읽기 좋다.
- 블록 `{}` 는 한 줄이어도 쓰는 걸 권장(나중에 줄 추가 시 버그 방지).

<!-- section: mechanism -->
## 삼항 · 단축 평가

{{code: ternary-short}}

- **삼항 `조건 ? A : B`** — **값**을 고를 때(변수 할당, JSX 안). 문장(여러 줄 처리)엔 `if`.
- **`&&`** — 왼쪽 truthy → 오른쪽 반환. "있으면 이것" (`user && user.name`, React 조건부 렌더).
- **`||`** — 왼쪽 falsy → 오른쪽 반환. 기본값. **단, `0`/`""` 도 falsy 라 덮인다.**
- **`??` (null 병합)** — 왼쪽이 **`null`/`undefined` 일 때만** 오른쪽. `0`/`""` 는 유지 → 기본값엔 이게 더 안전.
- **`?.` (옵셔널 체이닝)** — 중간 값이 없으면 에러 대신 `undefined`. `user?.address?.city`.

<!-- section: code | lang: js -->
## switch

{{code: switch}}

- 한 값을 **여러 고정 값**과 비교할 때 (`===` 로 비교). `if-else if` 가 5개 이상 늘어지면 고려.
- **`break` 필수** — 없으면 다음 case 로 흘러간다(fall-through). 의도적으로 여러 case 를 묶을 때만 생략.
- `default` 는 아무 case 도 안 맞을 때.

<!-- section: must_know -->
## 반드시 기억할 것

- 조건은 truthy/falsy 로 평가. 개수·존재 검사는 **명시적 비교**(`=== 0`, `!== null`)가 읽기 좋다.
- 값 선택은 **삼항**, 분기 처리는 **if**. 삼항을 중첩하지 말 것(읽기 어려움).
- 기본값: `||` 는 `0`/`""` 도 덮는다 → **`??`** 를 쓴다.
- 없을 수도 있는 중첩 접근은 `?.`.
- `switch` 는 `break` 를 빼먹지 않는다.
- `if (x = 1)` (대입) vs `if (x === 1)` (비교) — 항상 `===`.

<!-- section: experiment -->
## 직접 해 보기

1. 점수(0~100)를 받아 A/B/C/D/F 를 출력하는 `if-else if` 를 짜고, 같은 걸 삼항으로도 써 보라(가독성 비교).
2. `const nickname = input || "익명"` 에서 `input` 을 `0`, `""`, `"철수"`, `undefined` 로 바꿔 결과를 보고,
   `??` 로 바꿨을 때 `0`/`""` 이 어떻게 달라지는지 확인하라.
3. `user?.profile?.email` 을 `user` 가 `null` 일 때 실행해 에러가 안 나는 걸 확인하고, `?.` 를 빼면 어떻게 되는지 보라.
4. `switch` 로 요일 번호(0~6) → 요일 이름. `break` 를 하나 빼서 fall-through 를 관찰.

<!-- section: check_question -->
## 이해 점검

1. `if (list.length)` 와 `if (list.length === 0)` — 어느 쪽을 권장하고 왜?
2. `||` 와 `??` 의 차이를 `input = 0` 인 경우로 설명하라.
3. `switch` 에서 `break` 를 빼면?
4. 삼항 연산자는 언제 쓰고, 언제 `if` 를 써야 하나?

<!-- section: interview_question -->
## 면접 대비

- "`||` 와 `??` 의 차이, 각각 언제 쓰나요?"
- "옵셔널 체이닝(`?.`)이 해결하는 문제는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> if/else if 흐름, 삼항 vs if, && / || / ?? / ?. 의 동작, switch 의 break 를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`if-else if` 로 분기, 삼항으로 값 선택, `&&`/`||`/`??`/`?.` 로 짧게 — 기본값은 `0`/`""` 을 지키는 `??`,
없을 수 있는 접근은 `?.`, `switch` 는 `break` 필수.**

<!-- section: next -->
## 다음 Lesson

`language-basics/arrays-and-loops` — 목록과 반복.
