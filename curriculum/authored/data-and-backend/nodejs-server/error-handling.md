---
id: data-and-backend/nodejs-server/error-handling
chapter: data-and-backend/nodejs-server
title: 에러 처리 미들웨어
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [nodejs, express, error-handling, middleware]
related_material_ids: []
sources:
  - title: "Express Guide — Error Handling"
    url: https://expressjs.com/en/guide/error-handling.html
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - data-and-backend/nodejs-server/middleware
  - data-and-backend/nodejs-server/routing-and-modules
code_examples:
  - slug: error-handler
    title: 에러 핸들러 = 인자 4개, 맨 마지막
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 라우터·미들웨어를 전부 등록한 "뒤"
      app.use((req, res) => res.status(404).json({ message: "not found" }));   // 안 걸린 요청

      // 에러 핸들러: (err, req, res, next) — 인자가 4개여야 Express 가 에러 핸들러로 인식
      app.use((err, req, res, next) => {
        const status = err.status || 500;
        if (status >= 500) console.error(err);          // 서버 에러는 로깅
        res.status(status).json({
          message: status >= 500 ? "server error" : err.message,   // 5xx 는 내부 메시지 감춤
        });
      });
  - slug: throw-vs-next
    title: 동기 에러 vs 비동기 에러
    source_type: generated_minimal
    language: js
    code: |
      // 동기: throw 하면 Express 가 자동으로 잡아 에러 핸들러로 보낸다
      app.get("/a", (req, res) => { throw new AppError(400, "bad"); });

      // 비동기: async 함수의 reject 는 (버전에 따라) 자동으로 안 잡힐 수 있다 → 명시적으로 next(e)
      app.get("/b", async (req, res, next) => {
        try {
          const row = await db.query("...");
          if (!row) throw new AppError(404, "not found");
          res.json(row);
        } catch (e) { next(e); }        // ← 에러 핸들러로 넘긴다
      });

      // 콜백 API: 첫 인자가 err → next(err)
      fs.readFile(p, (err, data) => { if (err) return next(err); /* ... */ });
  - slug: app-error
    title: 커스텀 에러 클래스
    source_type: generated_minimal
    language: js
    code: |
      class AppError extends Error {
        constructor(status, message) { super(message); this.status = status; }
      }
      // throw new AppError(400, "title required")  → 핸들러가 err.status 로 상태 코드 결정
      // 400 잘못된 입력 / 401 미인증 / 403 권한 / 404 없음 / 409 충돌 / 500 서버
  - slug: async-wrapper
    title: try/catch 반복을 줄이기
    source_type: generated_minimal
    language: js
    code: |
      const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
      app.get("/c", ah(async (req, res) => {
        const row = await db.query("...");   // 에러 나면 자동으로 next(e)
        res.json(row);
      }));
      // (Express 5 는 async 라우트의 reject 를 자동 전달하는 방향 — 버전 문서 확인)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`(err, req, res, next)` 4-인자 에러 핸들러**를 맨 마지막에 등록해 일관된 에러 응답을 만든다.
- **동기 에러**(`throw`)는 자동으로 잡히고, **비동기 에러**는 `next(e)` 로 넘겨야 함을 안다(콜백은 `next(err)`).
- **커스텀 에러 클래스**(`status` 필드)로 상태 코드를 정하고, 5xx는 내부 메시지를 감춘다.
- `try/catch` 반복을 줄이는 async 래퍼를 안다.
- 404(안 걸린 요청)와 500(에러)을 분리한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 미들웨어 `(req, res, next)`·등록 순서, `express.Router` 분리.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

수업자료의 게시판 서버는 `if (err) throw err` 수준이다. 라우트마다 에러 응답 형식이 다르고,
비동기 에러는 잡히지 않아 서버가 죽거나 응답이 영영 안 온다. 5xx 에러에 DB 스택트레이스가
클라이언트에 그대로 나갈 수도 있다.

<!-- section: code | lang: js -->
## 1. 에러 핸들러

{{code: error-handler}}

- Express는 **인자가 정확히 4개**(`err, req, res, next`)인 미들웨어를 **에러 핸들러**로 인식한다.
- **모든 라우터·미들웨어를 등록한 뒤 맨 마지막**에 하나 둔다.
- 여기서 상태 코드(`err.status || 500`)와 응답 형식을 **한곳에서** 정한다. 5xx는 로깅 + 내부 메시지 감춤.
- 그 앞에 "아무 라우트에도 안 걸린 요청" 을 위한 404 미들웨어.

<!-- section: mechanism -->
## 2. 동기 vs 비동기 에러

{{code: throw-vs-next}}

- **동기 라우트**에서 `throw` → Express가 자동으로 에러 핸들러로 보낸다.
- **`async` 라우트**의 reject는 (Express 버전에 따라) 자동으로 안 잡힐 수 있다 → `try/catch` 후 **`next(e)`**.
- **콜백 API**(`fs.readFile` 등)는 첫 인자 `err` 를 확인해 `next(err)`.
- 라우트 핸들러에서 직접 `res.status().json()` 로 에러를 처리하지 말고 **핸들러로 넘겨** 일관성을 유지한다.

<!-- section: concept | title: 커스텀 에러 -->
## 3. 커스텀 에러 클래스

{{code: app-error}}

`AppError(status, message)` 로 던지면 핸들러가 `err.status` 로 상태 코드를 정한다.
400(입력)/401(미인증)/403(권한)/404(없음)/409(충돌)/500(서버).

<!-- section: mechanism -->
## 4. try/catch 줄이기

{{code: async-wrapper}}

<!-- section: must_know -->
## 반드시 기억할 것

- 에러 핸들러 = **`(err, req, res, next)` 인자 4개**, **맨 마지막**에 하나. 상태·형식을 한곳에서.
- **동기 `throw` 는 자동 캐치.** `async` reject는 **`next(e)`**(버전에 따라). 콜백은 `next(err)`.
- 라우트에서 에러를 직접 응답하지 말고 **핸들러로 넘긴다**.
- **5xx 는 내부 메시지·스택트레이스를 클라이언트에 노출하지 않는다.** 로깅은 서버에서.
- 커스텀 에러 클래스(`status`)로 코드 매핑. 404(안 걸린 요청)는 별도 미들웨어.
- async 래퍼로 `try/catch` 반복을 줄인다. Express 5의 async 자동 전달 여부는 문서 확인.

<!-- section: experiment -->
## 직접 해 보기

1. `AppError` 클래스와 중앙 에러 핸들러(4-인자, 맨 끝)를 추가하고, 라우트에서 `throw new AppError(400, ...)` 로 던져 일관된 JSON 응답이 오는지 확인하라.
2. `async` 라우트에서 `try/catch` 없이 던진 에러가 어떻게 되는지 관찰한 뒤 `next(e)` 로 고쳐라.
3. 5xx 에러에서 클라이언트 응답에 스택트레이스가 안 나가고 서버 콘솔에는 찍히는지 확인하라.
4. 404 미들웨어를 에러 핸들러 앞에 두고, 없는 경로 요청이 404 JSON을 받는지 확인하라.
5. `ah()` async 래퍼로 `try/catch` 를 제거하고 동작이 같은지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. Express가 미들웨어를 "에러 핸들러" 로 인식하는 기준은?
2. 에러 핸들러는 어디에 등록하나?
3. 동기 `throw` 와 `async` 함수의 reject는 처리가 어떻게 다른가?
4. 5xx 에러 응답에서 무엇을 감춰야 하나?
5. 라우트에서 에러를 직접 `res` 로 처리하지 말라는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "Express의 중앙 에러 처리 미들웨어를 어떻게 설계하나요?"
- "비동기 라우트의 에러를 놓치지 않으려면?"
- "에러 응답에서 클라이언트에 노출할 정보와 감출 정보의 기준은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 에러 핸들러=4인자·맨 끝(상태·형식 한곳), 동기 throw 자동/async는 next(e)/콜백 next(err),
> 5xx 내부 메시지 감춤 + 로깅, AppError(status), 404 별도를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**에러는 `(err, req, res, next)` 4-인자 핸들러를 맨 마지막에 하나 두고 상태 코드·응답 형식을 그곳에서
통일한다 — 동기 `throw` 는 자동으로 잡히지만 `async` reject·콜백 에러는 `next(e)`/`next(err)` 로 넘기고,
5xx 는 스택트레이스를 클라이언트에 노출하지 않는다.**
