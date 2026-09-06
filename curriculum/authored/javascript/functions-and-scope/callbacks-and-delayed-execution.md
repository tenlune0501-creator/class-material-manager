---
id: javascript/functions-and-scope/callbacks-and-delayed-execution
chapter: javascript/functions-and-scope
title: 콜백과 지연 실행
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [javascript, callback, setTimeout, async-intro]
related_material_ids:
  - 1lrm8gd4VJVHMgZWYnXZaKT3vRtEa_y6JiJhVip3PwJU   # Waiting Function in JavaScript
prerequisites:
  - javascript/functions-and-scope/scope-and-closures
code_examples:
  - slug: callback
    title: 콜백 — 함수를 인자로 넘긴다
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // "무엇을 할지"를 함수로 받아 나중에/조건부로 실행
      function repeat(n, action) {
        for (let i = 0; i < n; i++) action(i);
      }
      repeat(3, (i) => console.log("회차", i));

      // 익숙한 콜백들
      [1, 2, 3].forEach((n) => console.log(n));
      button.addEventListener("click", () => console.log("클릭!"));
      arr.sort((a, b) => a - b);
  - slug: timers
    title: setTimeout / setInterval
    source_type: generated_minimal
    language: js
    code: |
      const id = setTimeout(() => console.log("2초 뒤 한 번"), 2000);
      clearTimeout(id);   // 아직 안 울렸으면 취소

      const tick = setInterval(() => console.log("1초마다"), 1000);
      clearInterval(tick); // 반드시 정리 (안 하면 계속 돎 → 메모리 누수)

      setTimeout(() => {}, 0);
      // "0초"라도 지금 코드가 끝난 뒤 실행된다 (동기 코드가 먼저)
  - slug: order
    title: 실행 순서 — 동기 먼저, 콜백은 나중
    source_type: generated_minimal
    language: js
    code: |
      console.log("A");
      setTimeout(() => console.log("B"), 0);
      console.log("C");
      // 출력: A  C  B
      // 이유: setTimeout 콜백은 "지금 하던 일이 다 끝난 뒤" 큐에서 꺼내 실행
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **콜백**(함수를 인자로 넘겨 나중/조건부로 실행)을 쓸 수 있고, `forEach`/`addEventListener`/`sort` 가 다 콜백임을 안다.
- `setTimeout` / `setInterval` 로 지연·반복 실행을 하고 `clearTimeout`/`clearInterval` 로 정리한다.
- **동기 코드가 먼저, 콜백은 나중**이라는 실행 순서를 설명할 수 있다(비동기의 입구).

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `functions` (함수는 값), `scope-and-closures` (콜백이 바깥 변수를 기억).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `setInterval` 을 걸어 놓고 정리를 안 해서, 컴포넌트를 떠났는데도 계속 돈다.
- `console.log(a); setTimeout(...); console.log(b)` 의 출력 순서를 못 맞힌다.
- "3초 뒤에 이걸 하고, 그다음 저걸 하고" 를 콜백으로 겹겹이 쌓아 읽기 어려워진다.

<!-- section: concept -->
## 콜백

{{code: callback}}

**콜백(callback)** = 다른 함수에 **인자로 넘기는 함수**. 넘겨받은 쪽이 "적절한 때"에 호출한다.

- `arr.forEach(fn)` — 각 요소마다 `fn` 호출.
- `el.addEventListener("click", fn)` — 클릭할 때마다 `fn`.
- `arr.sort((a, b) => a - b)` — 비교 규칙을 `fn` 으로.
- 함수가 값이기 때문에 가능하다 (`functions` Lesson).

<!-- section: mechanism -->
## 지연 실행 — 타이머

{{code: timers}}

- **`setTimeout(fn, ms)`** — `ms` 밀리초 **뒤에 한 번** `fn` 실행. 반환된 id 로 `clearTimeout(id)` 취소.
- **`setInterval(fn, ms)`** — `ms` 마다 **반복**. **`clearInterval(id)` 로 반드시 정리** — 안 하면
  화면을 떠나도 계속 돌아 메모리·성능 문제. (React 에서는 `useEffect` 의 정리 함수에서 clear)
- `setTimeout(fn, 0)` 도 **지금 코드가 끝난 뒤** 실행된다("즉시"가 아님).

<!-- section: code | lang: js -->
## 실행 순서

{{code: order}}

JS 는 한 번에 하나씩 실행한다(싱글 스레드). `setTimeout` 콜백은 **"지금 진행 중인 코드가 전부 끝난 뒤"**
대기열(큐)에서 꺼내 실행된다. 그래서 `A → C → B`.

이 "**동기 먼저, 콜백은 나중**"이 비동기(Promise, `async/await`, `fetch`)의 출발점이다 →
`async-and-http` 챕터에서 이어진다.

<!-- section: must_know -->
## 반드시 기억할 것

- 콜백 = 인자로 넘기는 함수. `forEach`/`map`/`addEventListener`/`sort` 다 콜백을 받는다.
- `setInterval` 은 **반드시 `clearInterval`** 로 정리. `setTimeout` 도 필요 없어졌으면 `clearTimeout`.
- `setTimeout(fn, 0)` = "지금 일 끝나고 바로" (동기 코드가 우선).
- 실행 순서: **동기 코드 전부 → 그다음 타이머·이벤트 콜백**.
- 콜백을 3~4겹 중첩("콜백 지옥")하게 되면 → Promise / `async-await` (다음 챕터).

<!-- section: experiment -->
## 직접 해 보기

1. `console.log(1); setTimeout(() => console.log(2), 0); console.log(3);` 의 출력을 예측→확인.
   `0` 을 `1000` 으로 바꿔도 순서가 같은지 보라.
2. `setInterval` 로 1초마다 카운트를 올리다가, 5가 되면 `clearInterval` 로 멈추는 코드를 짜라.
3. `repeat(n, action)` 을 직접 만들어 `repeat(5, i => console.log(i))` 를 실행하라.
4. 버튼에 `addEventListener("click", fn)` 을 걸고, 클로저로 "몇 번째 클릭인지" 세는 카운터를 붙여라.

<!-- section: check_question -->
## 이해 점검

1. 콜백이 무엇인지, `arr.forEach(fn)` 에서 `fn` 은 언제 불리나?
2. `setInterval` 을 정리하지 않으면 무슨 문제가 생기나?
3. `setTimeout(fn, 0)` 이 "즉시"가 아닌 이유는?
4. `console.log` 두 개 사이에 `setTimeout(..., 0)` 이 있으면 출력 순서는?

<!-- section: interview_question -->
## 면접 대비

- "JS 의 콜백 큐와 이벤트 루프를 아는 만큼 설명해 주세요."
- "`setTimeout(fn, 0)` 의 실제 동작은?"
- "콜백 지옥이 무엇이고 어떻게 해결하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 콜백의 정의와 예 3개, setTimeout/setInterval + clear, setTimeout(0)의 의미, 동기→콜백 실행 순서를
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**콜백은 나중에 실행되도록 넘기는 함수다 — 타이머 콜백은 지금 코드가 끝난 뒤 큐에서 실행되고,
`setInterval` 은 꼭 `clearInterval` 로 정리한다. 이 "나중" 개념이 비동기의 시작이다.**

<!-- section: next -->
## 다음 Chapter

`javascript/objects-and-builtins` — 객체 다루기와 내장 객체.
