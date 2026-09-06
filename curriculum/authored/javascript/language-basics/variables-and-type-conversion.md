---
id: javascript/language-basics/variables-and-type-conversion
chapter: javascript/language-basics
title: 변수와 자료형 변환
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [javascript, variables, let, const, type-coercion]
related_material_ids:
  - 1HTDn2pwfM2avNkOkLI0BXguLr_vEyVym-cnh0A-RLgc   # Javascript 02 - 변수와 자료형 변환
  - 1F2hOny7c3oBdq-CM9rlGWbELheWfDIB8              # Javascript_Basic_part02_v2.pdf
code_examples:
  - slug: let-const
    title: let 과 const (var 는 안 쓴다)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const PI = 3.14;      // 재할당 불가. 기본은 const.
      let count = 0;        // 재할당 필요할 때만 let.
      count = count + 1;    // OK
      // PI = 3;            // ❌ TypeError: Assignment to constant variable.

      // const 로 묶은 객체·배열의 "내용"은 바꿀 수 있다 (재할당만 금지)
      const user = { name: "A" };
      user.name = "B";      // OK  (user 자체를 다른 객체로 바꾸는 게 아니므로)
      // user = {};         // ❌

      // var 의 문제: 블록 무시 + 재선언 허용 → 안 쓴다
      if (true) { var x = 1; }
      console.log(x);       // 1  (블록 밖에서도 보임 — 헷갈림)
  - slug: coercion
    title: 자동 형 변환 (조심)
    source_type: generated_minimal
    language: js
    code: |
      // + 는 한쪽이 문자열이면 "문자열 이어붙이기"
      12 + "34";   // "1234"
      "12" + 34;   // "1234"
      1 + 2 + "3"; // "33"   (왼쪽부터: 1+2=3, 그다음 3+"3"="33")

      // -, *, /, % 는 숫자로 변환 시도
      "12" - 3;    // 9
      "12" * "2";  // 24
      "abc" - 3;   // NaN

      // 비교
      "" == 0;        // true   (== 는 형변환. 그래서 안 씀)
      "" === 0;       // false  (=== 는 타입 다르면 false)
  - slug: explicit
    title: 명시적 형 변환 (권장)
    source_type: generated_minimal
    language: js
    code: |
      Number("42");        // 42
      Number("42px");      // NaN
      parseInt("42px", 10);// 42   (앞에서부터 숫자만)
      parseFloat("3.14em");// 3.14

      String(42);          // "42"
      (42).toString();     // "42"
      `${42}`;             // "42"

      Boolean(0);          // false
      Boolean("");         // false
      !!"hello";           // true  (관용적으로 truthy → boolean)

      // 사용자 입력은 항상 문자열이다 → 계산 전에 Number()
      const n = Number(prompt("숫자?"));
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`const` 를 기본으로, 재할당이 필요할 때만 `let`** 을 쓰고, `var` 를 왜 안 쓰는지 안다.
- `const` 로 묶은 객체·배열의 **내용은 바꿀 수 있다**는 것을 설명한다.
- **자동 형 변환**(`+` 는 문자열 이어붙이기, `- * /` 는 숫자화)의 규칙을 알고, 함정을 피한다.
- `Number()` / `String()` / `Boolean()` / `parseInt()` 로 **명시적으로 변환**한다 — 특히 사용자 입력.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/data-types` (원시형, truthy/falsy, `===`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `const total = a + b` 로 재할당이 필요한데 `const` 를 써서 에러 — 또는 반대로 다 `var` 로 해서 스코프가 꼬임.
- 입력창에서 받은 `"3"` 과 `"5"` 를 더했더니 `"35"` → 사용자 입력은 **문자열**.
- `if (count == "")` 같은 `==` 비교가 예상 밖으로 동작.

<!-- section: concept -->
## 변수 선언: const → let, var 금지

{{code: let-const}}

- **`const`** — 재할당 불가. **먼저 `const` 로 쓰고**, 값을 바꿔야만 하는 곳(카운터, 누적, 루프 변수)에서만 `let`.
- **`const` 객체의 내용은 바뀐다** — `const user = {}` 는 "`user` 라는 이름이 이 객체를 가리킨다"를 고정할 뿐,
  `user.name = "B"` 처럼 **안을 바꾸는 건 허용**. `user = {}` (다른 객체로 교체)만 금지.
- **`var` 는 쓰지 않는다** — 블록(`{}`)을 무시하고, 재선언이 되고, 호이스팅이 헷갈린다. `let`/`const` 로 다 대체.

<!-- section: mechanism -->
## 자동 형 변환 (coercion)

{{code: coercion}}

- **`+`** 는 한쪽이 문자열이면 **문자열 이어붙이기**. `12 + "34"` → `"1234"`. 왼쪽부터 순서대로.
- **`-`, `*`, `/`, `%`** 는 양쪽을 **숫자로 변환** 시도. `"12" - 3` → `9`. 변환 실패면 `NaN`.
- **`==`** 는 비교 전에 형변환 → `"" == 0` 이 `true`. 그래서 **`===` 만** 쓴다.

<!-- section: code | lang: js -->
## 명시적 형 변환 (이게 정석)

{{code: explicit}}

- **문자열 → 숫자**: `Number("42")` (전체가 숫자여야 함) 또는 `parseInt("42px", 10)` (앞부분만).
- **숫자 → 문자열**: `String(42)`, `` `${42}` ``.
- **→ boolean**: `Boolean(x)` 또는 `!!x`.
- **사용자 입력(`prompt`, `input.value`, URL 쿼리)은 전부 문자열** → 계산 전에 `Number()`.

<!-- section: must_know -->
## 반드시 기억할 것

- **`const` 기본, 재할당 필요 시만 `let`, `var` 금지.**
- `const` 객체·배열은 **내용 변경 OK, 재할당 X**.
- `+` : 문자열 있으면 이어붙임. `- * / %` : 숫자화. → 섞이면 `Number()` 로 먼저 통일.
- 비교는 `===`. `==` 의 형변환 규칙을 외우려 하지 말고 그냥 안 쓴다.
- **입력값은 문자열**. `Number(input.value)`, 실패 시 `NaN` 처리.
- 변수명: camelCase, 의미 있게 (`d` ❌ → `dueDate` ✅). 상수는 관례상 `UPPER_SNAKE`.

<!-- section: experiment -->
## 직접 해 보기

1. `const a = 1; a = 2;` 를 실행해 에러를 보고, `let` 으로 바꿔라. `const obj = {n:1}; obj.n = 2;` 는 되는지 확인.
2. `"5" + 3`, `"5" - 3`, `"5" * "3"`, `5 + 3 + "3"`, `"5" + 3 + 3` 을 예측→확인하라.
3. `Number("12px")`, `parseInt("12px", 10)`, `Number("")`, `Number("  7 ")` 의 결과를 비교하라.
4. `prompt` 로 두 수를 받아 **합**을 구하라. `Number()` 를 빼면 어떻게 되나?

<!-- section: check_question -->
## 이해 점검

1. `const` 를 기본으로 쓰는 이유와, `let` 이 필요한 경우는?
2. `const arr = [1,2]; arr.push(3);` 는 왜 에러가 안 나나?
3. `"3" + 5` 와 `"3" - 5` 의 결과가 다른 이유는?
4. input 창의 값으로 계산하기 전에 반드시 할 일은?

<!-- section: interview_question -->
## 면접 대비

- "`var`, `let`, `const` 의 차이와, `var` 를 피하는 이유는?"
- "암묵적 형 변환이 일어나는 경우와 그로 인한 버그 예시는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> const/let/var, const 객체의 가변성, + 와 -의 형변환 차이, 명시적 변환 함수 4개, 입력값이 문자열이라는 점을
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`const` 를 기본으로, 재할당 때만 `let`, `var` 는 안 쓴다 — `+` 는 문자열이면 이어붙이고 `- * /` 는
숫자화하므로, 섞이는 값(특히 사용자 입력)은 `Number()`/`String()` 으로 먼저 통일한다.**

<!-- section: next -->
## 다음 Lesson

`language-basics/conditionals` — `if` / `switch` / 삼항.
