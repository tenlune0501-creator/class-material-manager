---
id: data-and-backend/nodejs-server/routing-and-modules
chapter: data-and-backend/nodejs-server
title: 라우팅 심화와 모듈 분리
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [nodejs, express, router, modules, project-structure]
related_material_ids:
  - 1CvaWGWqZBZGzsCgcT35oWZoK6uIV7JrXFgjI3lCYRX8   # 05 게시판 목록 조회 (index.js 한 파일에서 시작)
sources:
  - title: "Express Guide — Routing (express.Router)"
    url: https://expressjs.com/en/guide/routing.html
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/nodejs-server/express-rest-api
code_examples:
  - slug: one-file
    title: Before — index.js 한 파일에 다 있음
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // index.js — 라우트가 20개가 넘어가면 스크롤 지옥
      app.get("/board", ...);      app.post("/board", ...);
      app.get("/board/:id", ...);  app.put("/board/:id", ...);
      app.get("/user", ...);       app.post("/user/login", ...);
      // ... DB 코드, 유틸, 미들웨어가 한 파일에 뒤섞임
  - slug: router
    title: After — express.Router 로 도메인별 분리
    source_type: generated_minimal
    language: js
    code: |
      // routes/board.js
      import { Router } from "express";
      import { pool } from "../db.js";
      const router = Router();

      router.get("/", async (req, res) => {           // 여기 경로는 "/board" 기준의 상대경로
        const [rows] = await pool.query("SELECT * FROM board ORDER BY id DESC");
        res.json(rows);
      });
      router.get("/:id", async (req, res) => { /* ... */ });
      router.post("/", async (req, res) => { /* ... */ });
      export default router;

      // index.js
      import boardRouter from "./routes/board.js";
      import userRouter from "./routes/user.js";
      app.use("/board", boardRouter);   // /board* 는 boardRouter 가 처리
      app.use("/user", userRouter);
  - slug: layers
    title: 얇은 라우트 → 서비스 → DB (관심사 분리)
    source_type: generated_minimal
    language: js
    code: |
      // routes/board.js  — HTTP 만 안다 (요청 꺼내기 / 상태 코드 / 응답)
      router.post("/", async (req, res, next) => {
        try {
          const id = await boardService.create(req.body);   // 로직은 위임
          res.status(201).json({ id });
        } catch (e) { next(e); }                            // 에러는 에러 핸들러로
      });

      // services/board.js — 비즈니스 규칙 (검증 등). HTTP 를 모른다
      export async function create({ title, content, writer }) {
        if (!title?.trim()) throw new AppError(400, "title required");
        return repo.insert({ title, content, writer });
      }

      // repositories/board.js — SQL 만
      export const insert = (row) =>
        pool.query("INSERT INTO board (title,content,writer) VALUES (?,?,?)",
          [row.title, row.content, row.writer]).then(([r]) => r.insertId);
  - slug: route-params
    title: 라우트 경로 문법
    source_type: generated_minimal
    language: js
    code: |
      router.get("/:id", ...)              // /board/42       → req.params.id === "42"
      router.get("/:id/comments", ...)     // /board/42/comments
      app.use("/api/v1", apiRouter)        // 버전 프리픽스
      // 같은 경로의 여러 메서드는 router.route("/:id").get(...).put(...).delete(...) 로 묶을 수 있다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `index.js` 한 파일에 다 넣던 라우트를 **`express.Router` 로 도메인별 파일**로 나눈다.
- `app.use("/board", boardRouter)` 로 **경로 프리픽스**를 붙이는 구조를 안다.
- 라우트(HTTP) → 서비스(로직) → 리포지토리(SQL)로 **관심사를 나눈다**.
- `:param`, 중첩 경로, 버전 프리픽스 같은 라우트 문법을 쓴다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Express 라우트·`req`/`res`, ES 모듈(`import`/`export`), SQL CRUD.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

{{code: one-file}}

수업자료의 게시판 서버는 `index.js` 하나에서 시작한다. 라우트가 5개일 땐 괜찮지만,
회원·댓글·파일까지 붙으면 한 파일이 수백 줄이 되고, DB 코드·유틸·미들웨어가 뒤섞여 어디를 고칠지 모르게 된다.

<!-- section: concept -->
## 1. express.Router — 도메인별 분리

{{code: router}}

- `Router()` 인스턴스에 그 도메인의 라우트만 등록하고 `export`.
- `app.use("/board", boardRouter)` — `/board*` 로 들어온 요청을 이 라우터가 처리. **라우터 안의 경로는
  `/board` 를 뗀 상대경로**(`/`, `/:id`).
- 파일 구조: `routes/board.js`, `routes/user.js`, … + `db.js`(풀 하나를 공유).

<!-- section: mechanism -->
## 2. 관심사 분리 — 얇은 라우트

{{code: layers}}

- **라우트**는 HTTP만 안다: `req` 에서 값 꺼내기, 상태 코드, `res.json`. 로직을 여기 두지 않는다.
- **서비스**는 비즈니스 규칙(검증, 권한, 여러 리포 조합). HTTP를 모른다 → 테스트하기 쉽다.
- **리포지토리**는 SQL만.
- 작은 프로젝트에서 3층이 과하면 **라우트 + 서비스** 2층만 해도 된다. 핵심은 "라우트에 SQL·로직을 다 넣지 않기".
- 에러는 `try/catch` 로 잡아 `next(e)` → 중앙 에러 핸들러(다음 Lesson).

<!-- section: concept | title: 문법 -->
## 3. 라우트 경로 문법

{{code: route-params}}

<!-- section: must_know -->
## 반드시 기억할 것

- 도메인별로 `express.Router` 파일 분리 → `app.use("/prefix", router)`.
- 라우터 안 경로는 **프리픽스를 뗀 상대경로**.
- 라우트는 얇게(HTTP만). 로직은 서비스, SQL은 리포지토리. 작으면 2층으로 줄여도 됨.
- 라우트에서 에러는 `next(e)` 로 넘긴다(직접 `res` 로 처리하지 않고 중앙 핸들러에).
- `db.js` 에서 커넥션 풀 **하나**를 만들어 여러 라우터가 import 해 공유.
- 같은 경로의 여러 메서드는 `router.route("/:id").get().put().delete()` 로 묶을 수 있다.

<!-- section: experiment -->
## 직접 해 보기

1. 수업자료의 `index.js` 게시판 라우트를 `routes/board.js` 로 옮기고 `app.use("/board", boardRouter)` 로 연결하라. 동작이 같은지 확인.
2. `routes/user.js` 를 추가해 `/user/login` 을 만들어라.
3. `board.js` 라우트에서 SQL을 `repositories/board.js` 로, 검증을 `services/board.js` 로 빼라.
4. `db.js` 로 풀을 분리하고 두 라우터가 같은 풀을 쓰게 하라.
5. `router.route("/:id")` 로 GET/PUT/DELETE 를 한 체인으로 묶어 보라.

<!-- section: check_question -->
## 이해 점검

1. `app.use("/board", boardRouter)` 일 때 `boardRouter` 안의 `router.get("/:id")` 의 실제 경로는?
2. 라우트 핸들러에 SQL과 검증을 다 넣으면 나중에 뭐가 불편한가?
3. 서비스 계층이 "HTTP를 모른다" 는 게 왜 장점인가?
4. 여러 라우터가 DB 풀을 공유하려면 어떻게 하나?
5. 라우트에서 에러가 나면 어떻게 처리하나?

<!-- section: interview_question -->
## 면접 대비

- "Express 프로젝트가 커질 때 라우팅과 폴더 구조를 어떻게 나누나요?"
- "라우트/서비스/리포지토리 계층 분리의 장점과, 소규모에서 과한 경우는?"
- "`express.Router` 의 마운트 경로와 상대 경로가 어떻게 합쳐지나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> express.Router 도메인 분리 + app.use("/prefix", router)(상대경로), 얇은 라우트→서비스→리포지토리,
> 에러는 next(e), db.js 풀 공유를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**커진 서버는 `express.Router` 로 도메인별 파일로 나눠 `app.use("/prefix", router)` 로 마운트하고,
라우트는 HTTP만 다루며 로직은 서비스, SQL은 리포지토리로 위임한다 — 에러는 `next(e)` 로 중앙 핸들러에 넘긴다.**
