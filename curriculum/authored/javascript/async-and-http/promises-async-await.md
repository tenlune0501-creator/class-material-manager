---
id: javascript/async-and-http/promises-async-await
chapter: javascript/async-and-http
title: Promise와 async/await
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [javascript, promise, async, await, asynchronous]
related_material_ids:
  - 1lrm8gd4VJVHMgZWYnXZaKT3vRtEa_y6JiJhVip3PwJU   # Waiting Function in JavaScript
sources:
  - reference_slug: javascript/Promise
prerequisites:
  - javascript/functions-and-scope/callbacks-and-delayed-execution
code_examples:
  - slug: callback-problem
    title: 예전 코드 — setTimeout / 콜백으로 순서 맞추기
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // "func1 실행" → (2초) "func2 실행" → "func1 완료" 순서로 만들고 싶다
      function func2(done) {
        setTimeout(() => { console.log("func2 실행"); done(); }, 2000);
      }
      function func1() {
        console.log("func1 실행");
        func2(() => console.log("func1 완료"));   // 완료 시점을 콜백으로 전달
      }
      func1();
      // 단계가 늘면 콜백 안의 콜백... "콜백 지옥". 에러 전파도 제각각.
  - slug: promise
    title: Promise — 나중에 끝나는 작업을 값으로
    source_type: generated_minimal
    language: js
    code: |
      function wait(sec) {
        return new Promise((resolve, reject) => {
          if (sec < 0) return reject(new Error("음수 불가"));
          setTimeout(resolve, sec * 1000);        // 성공하면 resolve 호출
        });
      }

      wait(2)
        .then(() => console.log("2초 지남"))       // 성공 경로
        .then(() => wait(1))                       // then 에서 또 Promise 반환 → 체이닝
        .then(() => console.log("추가 1초"))
        .catch((err) => console.error(err))       // 어디서 실패하든 여기로
        .finally(() => console.log("끝"));         // 성공/실패 공통 마무리
      // 상태: pending → fulfilled(resolve) 또는 rejected(reject). 한 번 정해지면 불변.
  - slug: async-await
    title: async / await — 동기처럼 읽히는 비동기
    source_type: generated_minimal
    language: js
    code: |
      async function run() {                       // async 함수는 항상 Promise 를 반환
        console.log("작업 시작");
        try {
          await wait(2);                            // Promise 가 끝날 때까지 이 지점에서 대기
          console.log("작업 완료");
        } catch (err) {
          console.error("실패:", err.message);      // reject → 예외로 잡힌다
        } finally {
          console.log("모든 작업 끝");
        }
      }
      run();
      console.log("이 줄은 await 를 기다리지 않는다");  // run() 은 즉시 반환됨
  - slug: parallel
    title: 순차 vs 병렬 — Promise.all
    source_type: generated_minimal
    language: js
    code: |
      // ❌ 순차: 각 1초면 총 3초
      const a = await getUser();
      const b = await getPosts();
      const c = await getComments();

      // ✅ 병렬: 서로 의존 없으면 동시에 → 총 ~1초
      const [u, p, cm] = await Promise.all([getUser(), getPosts(), getComments()]);
      // 하나라도 reject 면 전체 reject. 실패를 개별로 받으려면 Promise.allSettled.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 콜백으로 순서를 맞추던 예전 코드의 한계(콜백 지옥, 제각각 에러 처리)를 설명한다.
- **Promise** 의 상태(pending → fulfilled/rejected), `then`/`catch`/`finally`, 체이닝을 쓴다.
- **`async`/`await`** 로 비동기 코드를 동기처럼 읽히게 쓰고, `try/catch` 로 에러를 잡는다.
- `async` 함수가 항상 Promise 를 반환하고, `run()` 호출이 즉시 반환됨을 안다.
- **순차 vs 병렬**을 구분하고 독립 작업은 `Promise.all` 로 묶는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `callbacks-and-delayed-execution`(콜백, `setTimeout`), 함수·화살표 함수.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- "A 끝나면 B, B 끝나면 C" 를 콜백 중첩으로 짜다 4단계에서 읽을 수 없게 된다.
- 콜백마다 `if (err)` 를 따로 처리하다 하나를 빠뜨린다.
- 서로 무관한 세 요청을 `await` 로 줄줄이 세워 3배 느리다.
- `await` 를 `async` 아닌 함수에서 써서 문법 에러.

<!-- section: concept -->
## 예전 코드 — 콜백으로 순서 맞추기

{{code: callback-problem}}

- 옛 자료는 `setTimeout` + "완료되면 부를 콜백" 을 넘겨 순서를 맞췄다.
- 단계가 늘면 콜백이 콜백을 물고, 성공/실패 처리가 흩어진다.
- Promise 는 "나중에 끝나는 작업" 을 **값처럼** 다뤄 이걸 정리한다.

<!-- section: mechanism -->
## Promise

{{code: promise}}

- `new Promise((resolve, reject) => { ... })` — 작업이 성공하면 `resolve(값)`, 실패하면 `reject(에러)`.
- 상태는 **pending → fulfilled 또는 rejected** 로 딱 한 번 바뀌고 그 뒤엔 불변.
- `.then(성공)` / `.catch(실패)` / `.finally(공통)`. `then` 이 Promise 를 반환하면 이어서 체이닝.
- `resolve` 를 안 부르면 `await`/`then` 은 영원히 대기한다.

## async / await

{{code: async-await}}

- 함수 앞에 `async` → 그 함수는 **항상 Promise 를 반환**. 안에서 `await Promise` 로 완료를 기다린다.
- `await` 는 **`async` 함수 안**(또는 모듈 최상위)에서만.
- reject 는 `await` 지점에서 **예외로 던져진다** → `try/catch/finally` 로 처리. 콜백 시절보다 에러 흐름이 하나로.
- `run()` 호출 자체는 즉시 반환된다. 뒷줄 코드는 `await` 를 기다리지 않는다.

### 순차 vs 병렬

{{code: parallel}}

- 앞 결과가 뒤에 필요하면 순차(`await` 줄줄이)가 맞다.
- **서로 독립**이면 `Promise.all([...])` 로 동시에 → 가장 느린 하나만큼만 걸린다.
- `Promise.all` 은 하나라도 실패하면 전체 실패. 개별 성패가 필요하면 `Promise.allSettled`.

<!-- section: must_know -->
## 반드시 기억할 것

- Promise 상태: pending → fulfilled(`resolve`) / rejected(`reject`), 한 번만.
- `.then/.catch/.finally` 체이닝. `then` 에서 Promise 반환 = 이어짐.
- `async` 함수 = 항상 Promise 반환. `await` 는 `async` 안에서. reject → `try/catch`.
- `run()` 호출은 즉시 반환 — 뒷줄은 안 기다린다.
- 독립 작업은 `Promise.all`(하나 실패=전체 실패) / 개별 결과는 `allSettled`.

<!-- section: mission -->
## 미션 — wait 유틸과 순차·병렬

- `wait(sec)` : `Promise` 반환. 음수면 `reject`.
- `async function demo()` :
  - "시작" 출력 → `await wait(1)` → "1초" → `await wait(1)` → "2초" → "끝".
  - `try/catch` 로 `wait(-1)` 의 에러를 잡아 메시지 출력.
- 가짜 API 3개(`fakeUser`, `fakePosts`, `fakeComments`, 각 `wait` 후 객체 resolve).
  - 순차 버전과 `Promise.all` 버전을 각각 만들고 `console.time` 으로 소요 시간 비교.
- `Promise.allSettled` 로 하나를 일부러 실패시켜 나머지 결과를 받는 것 확인.
- `.then` 체이닝 버전과 `async/await` 버전을 나란히 두고 가독성 비교(3줄 소감).

<!-- section: check_question -->
## 이해 점검

1. Promise 의 세 상태와, 상태가 몇 번 바뀔 수 있는지.
2. `await` 한 Promise 가 reject 되면 어떻게 잡나?
3. `async function f(){...}` 에서 `return 3` 하면 `f()` 의 결과 타입은?
4. 독립적인 요청 3개를 가장 빠르게 처리하려면? 그 방식의 위험은?

<!-- section: interview_question -->
## 면접 대비

- "콜백 지옥이 무엇이고 Promise/async 가 어떻게 해결하나요?"
- "`Promise.all` 과 `Promise.allSettled` 의 차이와 각각 언제 쓰나요?"
- "`await` 를 반복문에서 쓸 때 주의점은? (순차 실행되어 느려질 수 있음)"

<!-- section: review -->
## 한 줄 정리

**Promise 는 나중에 끝나는 작업을 값으로 만들어(`pending→fulfilled/rejected`, `then/catch/finally`),
`async/await` 로 동기처럼 읽고 `try/catch` 로 에러를 잡으며, 독립 작업은 `Promise.all` 로 병렬 처리한다.**

<!-- section: next -->
## 다음 Lesson

`async-and-http/fetch-and-ajax` — 실제 데이터를 가져오기.
