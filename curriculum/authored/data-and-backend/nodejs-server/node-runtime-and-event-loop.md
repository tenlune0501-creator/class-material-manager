---
id: data-and-backend/nodejs-server/node-runtime-and-event-loop
chapter: data-and-backend/nodejs-server
title: Node 런타임과 이벤트 루프
mastery: understand
lesson_kind: lesson
estimated_minutes: 35
tags: [nodejs, event-loop, non-blocking-io, runtime]
related_material_ids: []
sources:
  - title: "The Node.js Event Loop, Timers, and process.nextTick()"
    url: https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Overview of Blocking vs Non-Blocking"
    url: https://nodejs.org/learn/asynchronous-work/overview-of-blocking-vs-non-blocking
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - javascript/async-and-http/promises-async-await
  - javascript/functions-and-scope/callbacks-and-delayed-execution
code_examples:
  - slug: model
    title: 단일 스레드 + libuv
    source_type: generated_minimal
    language: text
    code: |
      "요청마다 스레드" (전통 서버)         Node
      ┌───────────────────┐              ┌──────────────────────────────┐
      │ req1 → thread1     │              │ 하나의 JS 스레드 + 이벤트 루프 │
      │ req2 → thread2     │              │  I/O(파일·네트워크·DB)는       │
      │ ... (스레드 수만큼) │              │  libuv 에 넘기고 콜백 등록 후  │
      └───────────────────┘              │  다음 일을 계속 처리          │
                                         └──────────────────────────────┘
      → Node 는 I/O 를 "기다리며 멈추지" 않는다(논블로킹). 대신 CPU 무거운 "동기" 작업은 전부를 멈춘다.
  - slug: phases
    title: 이벤트 루프 6단계 (개념)
    source_type: generated_minimal
    language: text
    code: |
      timers        → setTimeout / setInterval 콜백
      pending       → 지연된 시스템 콜백 일부
      poll          → I/O 이벤트 대기·처리 (여기서 블로킹될 수 있음)
      check         → setImmediate 콜백
      close         → 'close' 이벤트 콜백
      각 단계 사이에: process.nextTick 큐 + Promise(microtask) 큐를 비운다 (루프 "밖")
      순서 감각: 동기 코드 → nextTick → Promise → (timers/immediate/...)
  - slug: starvation
    title: 이벤트 루프 기아 (starvation)
    source_type: generated_minimal
    language: js
    code: |
      app.get("/slow", (req, res) => {
        let sum = 0;
        for (let i = 0; i < 5e9; i++) sum += i;   // ❌ 동기 CPU 작업 (수 초)
        res.json({ sum });
      });
      // 이 요청이 도는 동안 "다른 모든 요청" 이 멈춘다 (단일 스레드).
      // 해결: 작업을 쪼개기 / worker_threads / 별도 서비스 / 큐로 오프로드
  - slug: dont-block
    title: 블로킹을 피하는 법
    source_type: generated_minimal
    language: js
    code: |
      // ❌ 동기 API 는 이벤트 루프를 멈춘다
      const data = fs.readFileSync("big.json");
      // ✅ 비동기 API (I/O 를 libuv 에 넘기고 콜백/await)
      const data = await fs.promises.readFile("big.json");
      // JSON.parse 같은 큰 동기 연산, 정규식 폭주, 큰 반복문도 블로킹이다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Node가 **단일 JS 스레드 + libuv**로 동작하고, I/O를 기다리며 멈추지 않는(논블로킹) 이유를 설명한다.
- 이벤트 루프의 **6단계**(개념)와 `process.nextTick`/Promise 큐가 그 사이에 처리됨을 안다.
- **이벤트 루프 기아**(긴 동기 작업이 서버 전체를 멈춤)가 왜 생기는지, 어떻게 피하는지 안다.
- "요청마다 스레드" 모델과의 차이를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 콜백/비동기, Promise/`async·await`(자바스크립트 트랙).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

Node 서버를 만들었는데 어떤 요청 하나가 느리면 **모든 요청이 같이 느려진다**. `fs.readFileSync` 를
썼더니 서버가 멈춘다. "Node는 비동기라던데 왜?" — 런타임 모델을 모르면 이 현상을 이해할 수 없다.

<!-- section: concept -->
## 1. 단일 스레드 + libuv

{{code: model}}

- 전통 서버는 요청마다 스레드/프로세스를 띄운다. Node는 **JS를 도는 스레드가 하나**다.
- 파일·네트워크·DB 같은 **I/O는 libuv**(내부 라이브러리)에 넘기고 콜백을 등록한 뒤, 그동안 **다음 일을
  계속** 처리한다. I/O가 끝나면 콜백이 큐에 들어가고 루프가 실행한다.
- 그래서 I/O가 많은 서버에 효율적이다. **대신 CPU 무거운 "동기" 작업은 그 스레드를 통째로 점유**한다.

<!-- section: mechanism -->
## 2. 이벤트 루프 단계

{{code: phases}}

- 루프는 **timers → pending → poll → check → close** 단계를 돈다. `poll` 에서 I/O를 대기·처리한다.
- 각 단계 사이에 **`process.nextTick` 큐 + Promise(microtask) 큐**를 비운다(루프 "밖").
- 대략의 실행 순서: 동기 코드 → `nextTick` → Promise → (timers/immediate/…).
  세부 순서는 상황 의존적이라 이 순서에 코드 로직을 의존하지 않는다.

<!-- section: concept | title: 기아 -->
## 3. 이벤트 루프 기아

{{code: starvation}}

한 요청이 **수 초짜리 동기 반복문**을 돌면, 그 스레드가 다른 모든 요청·타이머·콜백을 막는다.
"Node가 느리다" 가 아니라 **내 코드가 이벤트 루프를 붙잡고 있는** 것이다.

<!-- section: mechanism -->
## 4. 블로킹 피하기

{{code: dont-block}}

- **`*Sync` API 를 요청 처리 경로에서 쓰지 않는다.** 비동기(`fs.promises`, `await`)로.
- 큰 `JSON.parse`, 정규식 폭주(ReDoS), 큰 반복문도 블로킹이다 → 쪼개거나 `worker_threads`/별도 서비스/큐로.

<!-- section: must_know -->
## 반드시 기억할 것

- Node = **단일 JS 스레드 + libuv**. I/O는 libuv에 위임 → 논블로킹.
- **CPU 무거운 동기 작업은 서버 전체를 멈춘다**(이벤트 루프 기아).
- 루프 단계: timers / pending / **poll(I/O)** / check / close. 사이사이 `nextTick` + Promise 큐.
- 실행 순서 세부(nextTick vs Promise vs timer)에 로직을 의존하지 않는다.
- 요청 경로에서 **`*Sync` 금지**. 비동기 API 사용. 무거운 계산은 쪼개기/worker/오프로드.
- 구체 단계 수·이름·Node 버전별 차이는 공식 문서에서 확인(모델은 유지).

<!-- section: experiment -->
## 직접 해 보기

1. `app.get("/slow")` 에 큰 동기 반복문을 넣고, 다른 라우트가 그동안 응답하지 않는 걸 확인하라.
2. 그 반복문을 `setImmediate` 로 청크 단위로 쪼개거나 비동기로 바꿔 다른 요청이 계속 처리되는지 보라.
3. `fs.readFileSync` vs `await fs.promises.readFile` 로 파일을 100번 읽으며 동시 요청 응답성을 비교하라.
4. `console.log("A"); process.nextTick(() => console.log("B")); Promise.resolve().then(() => console.log("C")); setTimeout(() => console.log("D"));` 의 출력 순서를 예상하고 확인하라.
5. `worker_threads` 로 무거운 계산을 옮겨 메인 이벤트 루프가 자유로워지는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. Node의 JS 스레드는 몇 개인가? I/O는 누가 처리하나?
2. "Node는 비동기인데 왜 한 요청이 느리면 다 느려지나?"
3. 이벤트 루프의 `poll` 단계는 무엇을 하나?
4. `process.nextTick` 과 `Promise.then` 콜백은 루프의 어디에서 처리되나?
5. 요청 처리 중 `JSON.parse(거대문자열)` 를 하면 무슨 문제가 있나?

<!-- section: interview_question -->
## 면접 대비

- "Node.js의 이벤트 루프와 논블로킹 I/O를 설명해 주세요."
- "이벤트 루프 기아(blocking the event loop)의 원인과 해결책은?"
- "`setTimeout` / `setImmediate` / `process.nextTick` 의 차이는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 단일 JS 스레드 + libuv(I/O 위임=논블로킹), CPU 동기 작업 = 루프 기아, 6단계(poll=I/O) + nextTick/Promise 큐,
> 요청 경로에서 *Sync 금지·무거운 계산 오프로드를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Node는 단일 JS 스레드 + libuv로 I/O를 위임해 논블로킹으로 동작하지만, CPU 무거운 동기 작업은 그
스레드를 점유해 서버 전체를 멈춘다(이벤트 루프 기아) — 요청 경로에서 `*Sync` 를 피하고 무거운 계산은
쪼개거나 worker/별도 서비스로 오프로드한다.**
