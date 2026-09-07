---
id: javascript/language-basics/functions
chapter: javascript/language-basics
title: 함수
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, function, parameter, return]
related_material_ids:
  - 1_dLoqERFBN2rIv8x40PtyGlzpbVGaOKAm0LUFEeYTEs   # Javascript 05 - 함수
  - 12W77c-tGjeY_8kAFSi59nwWsfuFwPoCh              # javascript_final_v202605.zip
sources:
  - reference_slug: javascript/Function
project_links:
  - unit: momentalk/hangul-chosung-util
    note: 초성 추출을 부수효과 없는 순수 함수로 — 입력만으로 출력이 정해져 그대로 테스트 가능
code_examples:
  - slug: function-forms
    title: 함수 선언 3가지
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 1) 함수 선언문 — 호이스팅됨(위에서 호출 가능)
      function add(a, b) {
        return a + b;
      }

      // 2) 함수 표현식 — 변수에 담음. 정의 전 호출 불가
      const sub = function (a, b) {
        return a - b;
      };

      // 3) 화살표 함수 — 짧고, 콜백에 주로. this 를 자기 것으로 안 만듦
      const mul = (a, b) => a * b;          // 한 줄이면 return 생략
      const square = (n) => n * n;
      const greet = () => console.log("hi"); // 인자 0개면 ()
      const makeUser = (name) => ({ name }); // 객체 반환은 () 로 감쌈
  - slug: params
    title: 매개변수 — 기본값 · 나머지 · 구조분해
    source_type: generated_minimal
    language: js
    code: |
      // 기본값
      function greet(name = "손님") {
        return `안녕, ${name}`;
      }
      greet();          // "안녕, 손님"

      // 나머지 매개변수 (...) — 개수 미정
      function sum(...nums) {
        return nums.reduce((a, n) => a + n, 0);
      }
      sum(1, 2, 3, 4);  // 10

      // 인자로 객체를 받아 구조분해 (옵션 묶음 패턴)
      function createButton({ label, size = "md", disabled = false }) {
        console.log(label, size, disabled);
      }
      createButton({ label: "저장", disabled: true });
  - slug: return-side-effect
    title: 반환 vs 부수효과
    source_type: generated_minimal
    language: js
    code: |
      // 순수: 입력 → 출력. 외부를 안 건드림. 테스트·재사용 쉬움
      function totalPrice(items) {
        return items.reduce((sum, it) => sum + it.price * it.qty, 0);
      }

      // 부수효과: 화면·서버·전역을 바꿈. return 값이 없을 수 있음
      function renderTotal(items) {
        document.querySelector("#total").textContent = totalPrice(items);
      }
      // 계산(순수)과 반영(부수효과)을 나누면 각각을 이해·수정하기 쉽다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 함수 선언문 / 함수 표현식 / **화살표 함수**를 쓸 수 있고, 언제 각각 쓰는지 안다.
- **매개변수**(기본값, 나머지 `...`, 객체 구조분해)와 **`return`** 을 다룬다.
- **인자(argument)와 매개변수(parameter)**, **반환값과 부수효과**를 구분한다.
- 함수를 **값처럼 전달**(콜백)할 수 있다는 것을 이해한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/*` 전체 (변수, 조건문, 배열, `reduce` 맛보기).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 같은 계산 코드를 여러 군데 복붙 → 한 곳만 고치고 나머지를 놓침.
- 함수가 계산도 하고 화면도 바꾸고 서버도 호출해서, 하나만 테스트할 수가 없음.
- `return` 을 안 써서 결과가 `undefined`.

함수는 **"이름 붙인 재사용 가능한 코드 블록"** 이자, JS 에서 **값**(변수에 담고, 인자로 넘기고, 반환)이다.

<!-- section: concept -->
## 함수 선언 3가지

{{code: function-forms}}

- **함수 선언문 `function name() {}`** — 호이스팅되어 정의보다 위에서도 호출 가능. 최상위 유틸에.
- **함수 표현식 `const f = function() {}`** — 변수 규칙을 따름(정의 전 호출 불가).
- **화살표 함수 `(a) => a * 2`** — 짧다. **콜백**(`map`, `addEventListener`, `setTimeout`)에 주로.
  한 줄이면 `return` 과 `{}` 생략. `this` 를 자기 것으로 만들지 않음(뒤 Lesson).

<!-- section: mechanism -->
## 매개변수와 인자

{{code: params}}

- **매개변수(parameter)** = 정의할 때의 이름(`function add(a, b)` 의 `a`, `b`).
  **인자(argument)** = 호출할 때 넣는 실제 값(`add(1, 2)` 의 `1`, `2`).
- **기본값** `name = "손님"` — 인자를 안 주면 이 값.
- **나머지 `...nums`** — 남은 인자를 배열로 모음. 개수 미정일 때.
- **객체 구조분해** `function f({ label, size = "md" })` — 옵션이 여러 개면 순서 대신 이름으로. React props 가 이 패턴.

<!-- section: code | lang: js -->
## 반환값 vs 부수효과

{{code: return-side-effect}}

- **`return`** — 함수의 결과를 밖으로. `return` 없으면 `undefined`.
- **부수효과(side effect)** — 함수 밖의 것을 바꾸는 일: DOM 수정, `console.log`, 서버 호출, 전역 변수 변경.
- **계산(순수 함수)** 과 **반영(부수효과)** 을 나누면 — 계산은 테스트·재사용이 쉽고, 반영은 한곳에 모인다.

<!-- section: must_know -->
## 반드시 기억할 것

- 콜백·짧은 함수는 **화살표 함수**. 최상위 유틸은 `function` 선언문도 OK. 팀 스타일을 따른다.
- `return` 을 안 쓰면 `undefined`. "값을 만드는" 함수는 꼭 `return`.
- 매개변수 = 이름, 인자 = 값. 기본값·`...나머지`·구조분해를 활용.
- **함수는 값이다** — 변수에 담고(`const f = ...`), 인자로 넘기고(`arr.map(f)`), 반환할 수 있다. 이게 콜백.
- **한 함수는 한 가지 일.** 계산과 화면 갱신을 섞지 않는다.
- 화살표 함수로 **객체를 반환**할 땐 `() => ({ ... })` (괄호로 감싸기).

<!-- section: experiment -->
## 직접 해 보기

1. `average(...nums)` 를 나머지 매개변수로 만들어 `average(80, 90, 100)` 이 90 을 반환하게 하라.
2. `formatPrice(n, { currency = "원", comma = true } = {})` 를 만들어 옵션 구조분해 + 기본값을 연습하라.
3. `totalPrice(items)` (순수) 와 `showTotal(items)` (DOM 갱신)로 나눠 짜라. 순수 함수만 콘솔에서 여러 입력으로 테스트.
4. `[1,2,3].map(square)` 처럼 함수를 **이름으로** 넘겨 보라. `map(function(n){ return n*n })` 와 같은 결과인지 확인.

<!-- section: check_question -->
## 이해 점검

1. 함수 선언문과 함수 표현식의 차이(호이스팅)는?
2. 매개변수와 인자의 차이를 예로.
3. `return` 을 빠뜨린 함수의 결과는?
4. "함수는 값이다" 가 실무에서 뜻하는 것(예: `map` 에 넘기기)은?
5. 순수 함수와 부수효과를 나누면 뭐가 좋아지나?

<!-- section: interview_question -->
## 면접 대비

- "화살표 함수와 일반 함수의 차이(특히 `this`)는?"
- "일급 함수(first-class function)가 무슨 뜻이고, JS 에서 어떻게 드러나나요?"
- "순수 함수란 무엇이고 왜 선호되나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 함수 3형태와 선택 기준, 매개변수(기본값/나머지/구조분해), return vs 부수효과, "함수는 값"의 의미를
> 각각 한 줄로. 그다음 average 함수를 코드 없이 설계.

<!-- section: review -->
## 한 줄 정리

**함수는 이름 붙인 재사용 코드이자 값이다 — 콜백엔 화살표 함수, 결과는 `return`, 옵션은 객체 구조분해,
그리고 계산(순수)과 반영(부수효과)을 나눈다.**

<!-- section: next -->
## 다음 Chapter

`javascript/functions-and-scope` — 스코프와 클로저, 콜백 심화.
