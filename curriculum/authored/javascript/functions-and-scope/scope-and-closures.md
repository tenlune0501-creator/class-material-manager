---
id: javascript/functions-and-scope/scope-and-closures
chapter: javascript/functions-and-scope
title: 스코프와 클로저
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, scope, closure, hoisting]
related_material_ids:
  - 1_dLoqERFBN2rIv8x40PtyGlzpbVGaOKAm0LUFEeYTEs   # Javascript 05 - 함수
prerequisites:
  - javascript/language-basics/functions
code_examples:
  - slug: scope
    title: 스코프 — 변수가 보이는 범위
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const g = "전역";

      function outer() {
        const o = "outer";
        if (true) {
          const block = "블록";      // let/const 는 { } 안에서만 산다
          console.log(g, o, block);  // 다 보임 (안쪽 → 바깥쪽으로 찾아 올라감)
        }
        // console.log(block);        // ❌ ReferenceError: 블록 밖
      }

      // console.log(o);              // ❌ 함수 밖
  - slug: closure
    title: 클로저 — 함수가 자기 만들어진 환경을 기억
    source_type: generated_minimal
    language: js
    code: |
      function makeCounter() {
        let count = 0;                 // 이 변수는 makeCounter 안에만 있다
        return function () {
          count += 1;                  // 바깥 함수의 count 를 계속 기억·수정
          return count;
        };
      }

      const next = makeCounter();
      next();  // 1
      next();  // 2   ← count 가 살아 있다 (호출이 끝났는데도)
      const other = makeCounter();
      other(); // 1   ← 완전히 별개의 count
  - slug: closure-uses
    title: 클로저 실전 — 비공개 상태 · 콜백
    source_type: generated_minimal
    language: js
    code: |
      // 1) 비공개 상태 (모듈 패턴)
      function createStore(initial) {
        let value = initial;
        return {
          get: () => value,
          set: (v) => { value = v; },
        };
        // value 는 밖에서 직접 못 건드림. get/set 을 통해서만.
      }

      // 2) 콜백이 상황을 "기억"
      function attachLogger(prefix) {
        return (msg) => console.log(`[${prefix}] ${msg}`);
      }
      const log = attachLogger("AUTH");
      log("로그인 성공");   // [AUTH] 로그인 성공

      // React 의 useState 도 클로저로 값을 보관한다 (뒤 트랙에서 다시 만남)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **스코프**(변수가 보이는 범위)를 설명하고, `let`/`const` 가 블록 스코프라는 것을 안다.
- 안쪽에서 바깥쪽으로 변수를 찾아 올라가는 **스코프 체인**을 이해한다.
- **클로저**가 "함수가 자기 만들어진 환경(바깥 변수)을 계속 기억하는 것"임을 설명하고,
  카운터·비공개 상태·콜백 패턴을 직접 만들 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/functions` (함수는 값, 함수를 반환할 수 있다).
- `let`/`const` vs `var`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 반복문에서 만든 콜백들이 전부 마지막 값만 참조한다(`var` + 클로저의 고전 버그).
- "이 변수를 밖에서 못 건드리게" 하고 싶은데 방법을 모름.
- React 의 `useState` 나 이벤트 핸들러가 "옛날 값"을 기억하는 이유(stale closure)를 이해 못 함.

<!-- section: concept -->
## 스코프

{{code: scope}}

- **스코프** = 변수를 참조할 수 있는 범위.
- `let`/`const` 는 **블록 스코프** — `{ }` (함수, `if`, `for`) 안에서만 유효.
- 안쪽에서 변수를 찾을 때 **자기 스코프 → 바깥 스코프 → ... → 전역** 순으로 올라간다(**스코프 체인**).
  반대(바깥에서 안쪽 변수 접근)는 불가.
- `var` 는 함수 스코프뿐이라 블록을 무시 → 그래서 안 쓴다.

<!-- section: mechanism -->
## 클로저

{{code: closure}}

**클로저** = 함수가, 자기가 **정의된 위치의 바깥 변수들**을 계속 붙잡고 있는 것.

- `makeCounter` 는 실행이 끝났지만, 반환된 함수가 `count` 를 참조하므로 `count` 는 **메모리에 살아남는다.**
- `makeCounter()` 를 두 번 부르면 각각 **독립된 `count`** 를 가진다.
- 즉 클로저는 "함수 + 그 함수가 기억하는 바깥 변수들"의 묶음이다.

<!-- section: code | lang: js -->
## 실전 쓰임

{{code: closure-uses}}

- **비공개 상태** — `createStore` 의 `value` 는 밖에서 직접 접근 불가. `get`/`set` 을 통해서만.
  (JS 에 `private` 이 없던 시절의 캡슐화. 지금도 흔한 패턴)
- **콜백이 문맥을 기억** — `attachLogger("AUTH")` 가 만든 함수는 `prefix` 를 계속 안다.
- **React** — `useState` 로 만든 `count` 와 `setCount` 가 리렌더 사이에 값을 유지하는 것도 이 원리(뒤 트랙).

<!-- section: must_know -->
## 반드시 기억할 것

- `let`/`const` = **블록 스코프**. 변수는 **안 → 밖**으로만 찾아 올라간다.
- **클로저 = 함수 + 그 함수가 붙잡은 바깥 변수.** 바깥 함수가 끝나도 그 변수는 살아 있다.
- 클로저 호출마다 **독립된 상태**를 갖는다(`makeCounter()` 를 두 번 부르면 카운터 2개).
- 반복문 안에서 콜백을 만들 땐 `let`(반복마다 새 바인딩)을 쓴다. `var` 로 하면 전부 마지막 값 참조.
- "핸들러가 옛날 state 를 본다"(stale closure)는 클로저가 **그 시점의 값을 기억**하기 때문 — React 에서 다시 다룸.

<!-- section: experiment -->
## 직접 해 보기

1. `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 10)` → `3 3 3`. `var` 를 `let` 으로 바꾸면 `0 1 2`.
   왜 그런지 스코프로 설명하라.
2. `makeCounter` 를 만들어 `next()` 를 3번 부르고, 새로 `makeCounter()` 한 것과 카운터가 섞이지 않는지 확인.
3. `createStore(10)` 로 만든 객체에서 `store.value` 로 직접 접근이 안 되는 것(`undefined`)과, `store.get()` 은 되는 것을 확인.
4. `attachLogger("DB")` 와 `attachLogger("UI")` 를 만들어 각자 prefix 를 기억하는지 보라.

<!-- section: check_question -->
## 이해 점검

1. `if (true) { const x = 1; }` 밖에서 `x` 를 쓰면? 이유는?
2. 클로저를 한 문장으로 정의하라.
3. `makeCounter()` 를 두 번 호출하면 카운터가 몇 개 생기나? 왜?
4. `for` + `setTimeout` 콜백이 `var` 에서 안 되고 `let` 에서 되는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "클로저란 무엇이고, 실무에서 어디에 쓰이나요?"
- "블록 스코프와 함수 스코프의 차이, `var` 를 피하는 이유는?"
- "stale closure 문제를 겪은 적이 있나요? (React 힌트)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 블록 스코프, 스코프 체인 방향, 클로저의 정의, "호출마다 독립 상태", for+let 이 필요한 이유를
> 각각 한 줄로. 그다음 makeCounter 를 코드 없이 설명.

<!-- section: review -->
## 한 줄 정리

**변수는 블록 안에서만 살고 안→밖으로 찾아 올라간다 — 클로저는 함수가 자기 바깥 변수를 계속
붙잡는 것이라, 바깥 함수가 끝나도 그 값이 살아남고 호출마다 독립된 상태가 된다.**

<!-- section: next -->
## 다음 Lesson

`functions-and-scope/callbacks-and-delayed-execution` — 콜백과 지연 실행.
