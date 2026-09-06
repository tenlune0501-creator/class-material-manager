---
id: javascript/language-basics/must-know
chapter: javascript/language-basics
title: 시작 전 필수 암기
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [javascript, basics, syntax]
related_material_ids:
  - 1_PSuXMsznOaF231zDZTGSFHjIstCGxOmmiqmbIVsZ1k   # Javascript 00 - 필수 암기
  - 1edNbFgnIHPS6iVctKeqL7XORLvuDhAvK              # Javascript_Basic_part01_v2.pdf
  - 1EsnGnQl3e940Y_612wTxnpqnCcWFr6EQ              # javascript_base.zip
code_examples:
  - slug: connect-js
    title: HTML 에 JS 연결 · 출력 · 주석
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!-- </body> 직전에 두면 DOM 이 만들어진 뒤 실행된다 -->
      <script src="main.js"></script>

      <!-- main.js -->
      <script>
        console.log("개발자도구 콘솔에 찍힌다");  // 한 줄 주석
        /* 여러 줄
           주석 */
        alert("사용자에게 팝업");        // 실무에선 거의 안 씀
      </script>
  - slug: operators
    title: 자주 쓰는 연산자
    source_type: generated_minimal
    language: js
    code: |
      // 산술
      5 + 8;  10 - 3;  4 * 2;  7 / 2;  // 3.5 (정수 나눗셈 없음)
      7 % 2;                            // 1  (나머지 — 짝/홀, 순환에 자주)
      2 ** 10;                          // 1024 (거듭제곱)

      // 비교 — 항상 === (타입까지 비교)
      1 === 1;       // true
      1 === "1";     // false   ← === 는 타입이 다르면 false
      1 == "1";      // true    ← == 는 형변환 후 비교. 쓰지 않는다
      1 !== 2;       // true

      // 논리
      (a > 0) && (b > 0);   // 둘 다 참
      (a > 0) || (b > 0);   // 하나라도 참
      !done;                // 부정

      // 복합 대입
      x += 1;  x -= 1;  x *= 2;
      // 증감
      let i = 0;  i++;  ++i;   // 헷갈리면 i += 1 만 써도 된다
  - slug: template-literal
    title: 문자열 — 템플릿 리터럴
    source_type: generated_minimal
    language: js
    code: |
      const name = "지현";
      const age = 20;

      // 옛날: "이름: " + name + ", 나이: " + age
      // 지금: 백틱 + ${}
      const msg = `이름: ${name}, 나이: ${age}, 내년: ${age + 1}`;

      const multiline = `여러 줄도
      그대로 들어간다`;
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- HTML 에 JS 를 연결하는 법(`<script src>` 위치)과 `console.log` 로 확인하는 습관을 익힌다.
- 산술·비교·논리·복합대입 연산자를 쓸 수 있고, **`===` 만 쓰고 `==` 는 피하는** 이유를 안다.
- 템플릿 리터럴(`` `${}` ``)로 문자열을 조립할 수 있다.
- `%`(나머지)와 `**`(거듭제곱)의 실전 용도를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 기본, 개발자도구 여는 법(F12 → Console 탭).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `<script>` 를 `<head>` 에 넣었더니 "요소를 못 찾음" 에러 → DOM 이 아직 없는데 JS 가 먼저 실행됨.
- `if (score == "0")` 가 예상과 다르게 동작 → `==` 가 형변환을 한다.
- `"금액: " + price + "원"` 처럼 `+` 로 문자열을 이어 붙이다 실수 → 템플릿 리터럴.

<!-- section: concept -->
## JS 연결 · 출력

{{code: connect-js}}

- **`<script src="main.js"></script>` 를 `</body>` 직전**에 둔다 → HTML(DOM)이 다 만들어진 뒤 JS 실행.
  (또는 `<head>` 에 두고 `defer` 속성)
- **`console.log(...)`** — 개발자도구 Console 에 출력. 디버깅의 90%. `alert` 는 실무에서 거의 안 쓴다.
- 주석: `// 한 줄`, `/* 여러 줄 */`.

<!-- section: mechanism -->
## 연산자

{{code: operators}}

- **비교는 `===`, `!==`.** `==` 는 `1 == "1"` 이 `true` 가 되는 등 형변환을 하므로 **버그의 원천** → 쓰지 않는다.
- `%` (나머지) — 짝/홀(`n % 2`), N개마다 순환(`i % list.length`).
- `**` (거듭제곱) — `2 ** 10`.
- `&&` / `||` / `!` — 조건 조합.
- `x += 1` 같은 복합 대입, `i++` 증감. `i++`(후위) vs `++i`(전위)가 헷갈리면 **`i += 1`** 만 써도 된다.

<!-- section: code | lang: js -->
## 문자열 조립 — 템플릿 리터럴

{{code: template-literal}}

- **백틱(`` ` ``)** 안에서 `${표현식}` 으로 값을 끼워 넣는다. `${age + 1}` 처럼 식도 가능.
- 여러 줄 문자열도 그대로.
- `+` 로 이어 붙이는 옛 방식보다 읽기 쉽고 실수가 적다.

<!-- section: must_know -->
## 반드시 기억할 것

- `<script>` 는 `</body>` 직전 (또는 `defer`). 그래야 DOM 을 만질 수 있다.
- **`===` 만.** `==` 는 쓰지 않는다.
- `console.log` 로 값을 계속 찍어 보며 개발한다.
- 문자열 조립은 **템플릿 리터럴** `` `${}` ``.
- `/` 는 실수 나눗셈(정수 나눗셈 없음). 몫이 필요하면 `Math.floor(a / b)`, 나머지는 `a % b`.
- `NaN`(Not a Number)은 숫자가 아닌 연산 결과. `NaN === NaN` 은 `false` — 검사는 `Number.isNaN(x)`.

<!-- section: experiment -->
## 직접 해 보기

1. 콘솔에서 `12 + "34"`, `"12" - 3`, `"12" * "2"`, `1 == "1"`, `1 === "1"` 을 하나씩 실행하고 결과를 예측→확인하라.
2. `Math.floor(17 / 5)` 와 `17 % 5` 를 계산해 "17을 5로 나눈 몫과 나머지"를 구하라.
3. 이름·나이 변수를 만들고 `+` 방식과 템플릿 리터럴 방식으로 같은 문장을 만들어 비교하라.

<!-- section: check_question -->
## 이해 점검

1. `<script>` 를 `<head>` 에 넣으면 왜 문제가 되나? 두 가지 해결책은?
2. `==` 대신 `===` 를 쓰는 이유를 예로 설명하라.
3. `%` 연산자의 실전 용도 2가지는?
4. `"합계: " + a + "원"` 을 템플릿 리터럴로 바꾸면?

<!-- section: interview_question -->
## 면접 대비

- "`==` 와 `===` 의 차이, 왜 `===` 를 권장하나요?"
- "`NaN` 은 무엇이고 어떻게 검사하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> script 위치, ===만 쓰는 이유, console.log 습관, 템플릿 리터럴, %와 ** 용도, NaN 검사법을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`<script>` 는 body 끝에, 비교는 `===`, 출력은 `console.log`, 문자열은 백틱 `${}` —
이 네 가지가 앞으로 나오는 모든 코드의 바닥이다.**

<!-- section: next -->
## 다음 Lesson

`language-basics/data-types` — 값의 종류(자료형).
