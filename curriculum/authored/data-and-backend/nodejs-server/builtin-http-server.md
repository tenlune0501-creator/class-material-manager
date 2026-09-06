---
id: data-and-backend/nodejs-server/builtin-http-server
chapter: data-and-backend/nodejs-server
title: 내장 http 모듈로 서버 만들기
mastery: required
lesson_kind: lesson
estimated_minutes: 60
tags: [nodejs, http, server, request-response, rest]
related_material_ids:
  - 1CvaWGWqZBZGzsCgcT35oWZoK6uIV7JrXFgjI3lCYRX8   # 05 게시판 목록 조회 (Express + MySQL)
  - 1a63pT8qv_jVoOdSsM4audNDYIQj4CWa7DA0IMt7AAwM   # 04 웹서버와 DB 연동하기 (CORS)
sources:
  - title: "Overview of HTTP"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
    publisher: "Mozilla (MDN)"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "HTTP request methods"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    publisher: "Mozilla (MDN)"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Anatomy of an HTTP Transaction"
    url: https://nodejs.org/learn/http/anatomy-of-an-http-transaction
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - javascript/async-and-http/http-basics
  - javascript/async-and-http/promises-async-await
code_examples:
  - slug: hello-server
    title: 가장 작은 HTTP 서버
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      import { createServer } from "node:http";

      const server = createServer((req, res) => {
        // req: 들어온 요청 (읽기 스트림)   res: 내보낼 응답 (쓰기 스트림)
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("hello\n");
      });

      server.listen(3000, () => console.log("http://localhost:3000"));
  - slug: route-by-method-url
    title: 메서드 + 경로로 분기 (라우팅의 본질)
    source_type: generated_minimal
    language: js
    code: |
      import { createServer } from "node:http";

      const server = createServer((req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (req.method === "GET" && req.url === "/health") {
          res.writeHead(200);
          return res.end(JSON.stringify({ ok: true }));
        }

        if (req.method === "GET" && req.url === "/boards") {
          res.writeHead(200);
          return res.end(JSON.stringify([{ id: 1, title: "첫 글" }]));
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: "not found" }));
      });

      server.listen(3000);
  - slug: read-json-body
    title: 요청 바디 읽기 (스트림을 모아서 파싱)
    source_type: generated_minimal
    language: js
    code: |
      import { createServer } from "node:http";

      const server = createServer((req, res) => {
        if (req.method === "POST" && req.url === "/boards") {
          const chunks = [];
          req.on("data", (chunk) => chunks.push(chunk));       // 조각으로 도착
          req.on("end", () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString()); // 다 모아서 파싱
              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ id: 2, ...body }));
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "invalid JSON" }));
            }
          });
          req.on("error", () => {
            res.writeHead(400);
            res.end();
          });
          return;
        }
        res.writeHead(404);
        res.end();
      });

      server.listen(3000);
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **서버 = 요청을 받아 응답을 만드는 프로그램**이라는 정의를 코드로 설명할 수 있다.
- HTTP **요청의 구조**(메서드 + 경로 + 헤더 + (바디))와 **응답의 구조**(상태코드 + 헤더 + (바디))를 말할 수 있다.
- Node 내장 `http` 모듈로 최소 서버를 만들고, **메서드 + 경로로 분기**(= 라우팅)하고,
  **요청 바디를 스트림으로 읽어** 파싱할 수 있다.
- Express 같은 프레임워크가 **대신 해 주는 것**이 무엇인지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- **HTTP(S) 기본** — 클라이언트가 요청을 시작하고 서버가 응답한다는 것, `GET`/`POST` 감각.
  (→ `javascript/async-and-http/http-basics`)
- **비동기 / 이벤트** — 콜백, `await`, 그리고 "데이터가 조각으로 온다"는 스트림 감각.
- **JSON** — `JSON.parse` / `JSON.stringify`.

지금까지는 브라우저(클라이언트)에서 `fetch` 로 요청을 **보내는** 쪽이었다.
이번엔 그 요청을 **받는** 쪽을 만든다.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

강사 자료(`05 게시판 목록 조회`)는 이렇게 시작한다:

```js
const express = require("express");
const app = express();
app.get("/list", (req, res) => { /* ... */ });
app.listen(3000);
```

`express()` 가 뭘 하는지, `app.get` 이 왜 저렇게 생겼는지, `res.json()` 은 어디서 오는지
모르면 **프레임워크가 마법처럼 보이고**, 에러가 나면 손댈 곳을 못 찾는다.
한 번은 프레임워크 없이 **HTTP 요청/응답을 손으로 다뤄** 봐야, Express 가 무엇을
줄여 주는지 정확히 보인다.

<!-- section: concept -->
## 클라이언트-서버와 HTTP 메시지

- **클라이언트가 항상 요청을 시작한다.** 서버는 기다렸다가 응답한다. (서버가 먼저 말 걸지 않는다)
- HTTP는 **무상태(stateless)** — 요청 하나하나가 독립적이다. "로그인 상태" 같은 건
  쿠키/토큰을 매 요청에 실어서 만드는 것이지 HTTP 자체가 기억하지 않는다.

**요청(request)** = 메서드 + 경로 + 버전 + 헤더들 + (바디)
**응답(response)** = 버전 + 상태코드 + 상태메시지 + 헤더들 + (바디)

메서드의 의미(자원에 무엇을 하려는가):

| 메서드 | 뜻 | safe? | idempotent? |
|---|---|---|---|
| `GET` | 조회 | ✅ | ✅ |
| `POST` | 생성/제출 | ❌ | ❌ |
| `PUT` | 통째로 교체 | ❌ | ✅ |
| `PATCH` | 부분 수정 | ❌ | ❌ |
| `DELETE` | 삭제 | ❌ | ✅ |

- **safe** = 서버 상태를 안 바꾼다(조회만). **idempotent** = 같은 요청을 여러 번 보내도
  결과가 같다. 그래서 "삭제"는 `DELETE`(여러 번 보내도 결국 없는 상태), "생성"은
  `POST`(두 번 보내면 2개 생김).

<!-- section: mechanism -->
## Node `http` 모듈이 주는 것

`createServer((req, res) => { ... })` 의 콜백이 **요청 하나마다 한 번** 불린다.

- `req` (IncomingMessage) — **읽기 스트림**.
  `req.method`, `req.url`(경로+쿼리스트링), `req.headers`(키는 전부 소문자).
  **바디는 즉시 안 온다** — `data` 이벤트로 조각(`Buffer`)이 오고, `end` 이벤트로 끝난다.
- `res` (ServerResponse) — **쓰기 스트림**.
  `res.statusCode` / `res.setHeader(k, v)` / `res.writeHead(status, headers)` 로 상태·헤더를
  정하고, `res.write(...)` / `res.end(...)` 로 바디를 내보낸다.
  **`res.end()` 를 반드시 호출**해야 응답이 완료된다(안 하면 클라이언트가 계속 기다림).

<!-- section: code | lang: js -->
## 실습 1 — 가장 작은 서버

{{code: hello-server}}

## 실습 2 — 메서드 + 경로로 분기 (= 라우팅)

{{code: route-by-method-url}}

## 실습 3 — 요청 바디 읽기

{{code: read-json-body}}

> **이 코드는 원리를 보여주는 학습용 최소 구현이다.** 실무에서는 그대로 쓰지 않는다:
> 바디 **크기 제한**이 없어 큰(또는 악의적인) 요청이 메모리를 무제한으로 채울 수 있고,
> `Content-Type` 을 확인하지 않고 무조건 JSON 으로 파싱한다. 실제로는 프레임워크의
> 바디 파서(`express.json({ limit: "1mb" })` 등)가 크기 제한·타입 검사·에러 처리를 해 준다.
> 여기서는 "그 파서가 밑에서 하는 일"을 한 번 보는 것이 목적이다.

<!-- section: code_breakdown -->


## 한 줄씩

- `createServer((req, res) => {...})` — 요청마다 이 함수. `req` 읽기, `res` 쓰기.
- `res.writeHead(200, { "Content-Type": ... })` — 상태코드 + 헤더를 한 번에.
  `res.setHeader` 로 나눠 써도 된다(단, `writeHead`/`write` 이후엔 못 바꾼다).
- `req.method === "GET" && req.url === "/boards"` — **이 조건 분기가 곧 "라우팅"이다.**
  Express 의 `app.get("/boards", ...)` 는 이걸 표로 관리해 주는 것뿐이다.
- 바디: `req.on("data", ...)` 로 `Buffer` 조각을 모아 `Buffer.concat(...).toString()` →
  `JSON.parse`. 실패하면 `400`.
- `res.end(JSON.stringify(...))` — 문자열/Buffer 만 보낼 수 있다. 객체는 직접 직렬화.

<!-- section: must_know -->
## 반드시 기억할 것

- 서버 콜백은 **요청 1건 = 실행 1회**. 그 안에서 반드시 **`res.end()` 로 응답을 끝낸다.**
- `req.url` 은 **경로 + 쿼리스트링**이다(`/boards?page=2`). 순수 경로만 필요하면 파싱해야 함.
- `req.headers` **키는 소문자**. (`req.headers["content-type"]`)
- **바디는 스트림** — `data`/`end` 로 모은 뒤에야 쓸 수 있다. `JSON.parse` 는 `try/catch`.
- CRUD ↔ 메서드: 조회 `GET`, 생성 `POST`, 교체 `PUT`, 부분수정 `PATCH`, 삭제 `DELETE`.
- 상태코드 최소 세트: `200` OK, `201` Created, `400` 잘못된 요청, `404` 없음, `500` 서버 에러.

<!-- section: delegatable -->
## Express가 대신 해 주는 것 (그래서 다음 Lesson)

이 실습에서 손으로 한 것들 → Express 에서는 한 줄:

| 손으로 | Express |
|---|---|
| `if (req.method === "GET" && req.url === "/x")` | `app.get("/x", handler)` |
| `req.on("data"/"end")` + `Buffer.concat` + `JSON.parse` | `express.json()` 미들웨어 → `req.body` |
| `res.writeHead` + `res.end(JSON.stringify(...))` | `res.status(201).json(obj)` |
| `req.url` 에서 `?page=2` 직접 파싱 | `req.query.page` |
| 경로에서 `/boards/42` 의 `42` 직접 추출 | `app.get("/boards/:id")` → `req.params.id` |

→ **"프레임워크 없이도 되지만 매번 같은 코드를 쓰게 된다"** 가 Express 를 쓰는 이유다.
정규식 라우트 파싱, 스트림 버퍼링의 세부는 프레임워크에 맡긴다.

<!-- section: experiment -->
## 직접 바꿔 보기

1. 실습 2 서버를 띄우고 `curl -i localhost:3000/health`, `curl -i localhost:3000/none` 을
   비교하라. 상태코드(`200` vs `404`)와 바디를 확인.
2. 실습 3 서버에 `curl -X POST localhost:3000/boards -d '{"title":"hi"}' -H 'content-type: application/json'`
   를 보내고, 그다음 `-d '{title:hi}'`(깨진 JSON)를 보내 `400` 이 오는지 확인하라.
3. 브라우저 페이지에서 `fetch("http://localhost:3000/boards")` 를 호출해 보라.
   **CORS 에러**가 날 것이다 → 강사 자료 `04 웹서버와 DB 연동하기` 가 다룬 그 문제다.
   응답에 `res.setHeader("Access-Control-Allow-Origin", "*")` 를 추가하면 풀린다.

> `Access-Control-Allow-Origin: *` 는 **이 실험에서 "CORS 가 무엇인지" 감을 잡기 위한
> 최소 설정**이지 운영 환경의 완전한 해결책이 아니다. 실무 CORS 는 **허용 origin 을 목록으로
> 제한**하고, 쿠키/자격증명을 쓰면 `*` 를 못 쓰며(`Access-Control-Allow-Credentials` + 특정
> origin), `Authorization` 같은 커스텀 헤더나 `PUT`/`DELETE` 요청 전에는 브라우저가
> **preflight `OPTIONS`** 를 먼저 보낸다 — 이걸 처리해야 한다. 자세한 것은 후속
> Express/CORS Lesson(`data-and-backend/nodejs-server/middleware`)에서 다룬다.

<!-- section: project_link -->
## 강사 자료와의 연결

`05 게시판 목록 조회`(Express + MySQL)의 `app.get("/list", ...)` 안에서 하는 일 =
이 Lesson의 "GET + `/list` 분기 → DB 조회 → `res` 로 JSON". `04 웹서버와 DB 연동하기` 의
CORS 는 위 실험 3 그대로다. 프레임워크가 감싸고 있을 뿐, **밑에서 일어나는 일은 이 Lesson**이다.
다음 Lesson(`express-rest-api`)에서 같은 게시판을 Express 로 다시 만든다.

<!-- section: mission -->
## 미션

1. 내장 `http` 만으로 인메모리 게시판을 만들어라: `GET /boards`(목록), `POST /boards`(생성),
   `DELETE /boards/:id`(삭제). 데이터는 배열 하나. 상태코드를 정확히(`200`/`201`/`204`/`404`).
2. `req.url` 에서 `/boards/42` 의 `42` 를 뽑는 함수와 `?q=키워드` 를 뽑는 함수를 직접 짜라.
   (`URL` 클래스를 써도 된다: `new URL(req.url, "http://x")`.)
3. 위 1번을 표로 정리하라: "내가 손으로 한 줄" ↔ "Express 라면 어떻게". delegatable 표를 네 코드로 다시.

<!-- section: check_question -->
## 이해 점검

1. `createServer` 의 콜백은 언제 몇 번 불리나?
2. `req` 에서 바디를 바로 못 읽고 `data`/`end` 이벤트를 써야 하는 이유는?
3. "삭제"에 `DELETE`, "생성"에 `POST` 를 쓰는 이유를 idempotent 개념으로 설명하라.
4. `res.end()` 를 호출하지 않으면 어떻게 되나?

<!-- section: interview_question -->
## 면접 대비

- "HTTP 요청과 응답의 구조를 각각 말해 주세요."
- "safe 메서드와 idempotent 메서드가 무엇이고, 왜 중요한가요?"
- "Express 같은 프레임워크가 없으면 REST API 서버에서 직접 해야 하는 일은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 서버의 정의 한 문장, 요청/응답 구조 각 한 줄, `req` 가 스트림이라 바디를 어떻게 읽는지,
> CRUD ↔ HTTP 메서드 매핑, Express 가 줄여 주는 것 3가지를 답하기.

<!-- section: review -->
## 한 줄 정리

**서버는 "요청 1건마다 콜백 1회 실행 → `res` 로 상태·헤더·바디를 쓰고 `res.end()`" 하는
프로그램이고, 라우팅은 `req.method` + `req.url` 분기이며, 바디는 스트림으로 모아서 파싱한다 —
Express 는 이 반복을 줄여 줄 뿐이다.**
