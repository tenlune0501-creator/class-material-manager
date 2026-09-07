---
id: data-and-backend/nodejs-server/express-rest-api
chapter: data-and-backend/nodejs-server
title: Express로 REST API 서버 만들기
mastery: required
lesson_kind: lesson
estimated_minutes: 70
tags: [nodejs, express, rest-api, crud, backend]
related_material_ids:
  - 1k0hObTy4naQwvnx-jVg_J2pwtj3tNwFoIgMQ3UTmjSI   # 03_1 서버환경 설정 (npm init / express / nodemon)
  - 1CvaWGWqZBZGzsCgcT35oWZoK6uIV7JrXFgjI3lCYRX8   # 05 게시판 목록 조회
  - 1peKntI-8PW-rTz3_YEqlvQ5o9WgWOPbcL0-13fyerVE   # 06 게시물 쓰기
  - 1KeXe0iqOamu8O2Sy37-3aTCvuKgjtanc0sHFfEOLCqQ   # 08 게시물 수정
  - 1bos2ISUIaSOOV4QvfS6odYxRW65jUoxfdsOVetOaQMQ   # 09_게시물 삭제
sources:
  - title: "Express — Basic routing"
    url: https://expressjs.com/en/starter/basic-routing.html
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Express — Hello world"
    url: https://expressjs.com/en/starter/hello-world.html
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/nodejs-server/builtin-http-server
  - data-and-backend/data-modeling/sql-essentials
  - data-and-backend/backend-integration/frontend-to-webserver-db
project_links:
  - unit: momentalk/password-route-handler
    note: Next Route Handler(POST /api/auth/password) — 서버가 입력을 다시 검증하고 단계별로 401/403/400/500 반환
code_examples:
  - slug: setup
    title: 프로젝트 준비
    source_type: generated_minimal
    language: text
    code: |
      mkdir bbs-server && cd bbs-server
      npm init -y
      npm i express mysql2 cors
      npm i -D nodemon              # 코드 저장 시 서버 자동 재시작
      # package.json scripts: "dev": "nodemon index.js", "start": "node index.js"
      # (수업자료의 body-parser 는 이제 express 내장(express.json)으로 대체, mysql → mysql2)
  - slug: hello
    title: 가장 작은 서버
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      import express from "express";
      const app = express();
      const PORT = process.env.PORT || 8000;

      app.get("/", (req, res) => res.send("ok"));   // 라우트: METHOD + 경로 + 핸들러

      app.listen(PORT, () => console.log(`listening on ${PORT}`));
      // 내장 http 로 하던 "요청 메서드/URL 분기 + 본문 파싱"을 Express 가 대신한다
  - slug: crud-routes
    title: 게시판 REST 라우트 (CRUD)
    source_type: generated_minimal
    language: js
    code: |
      import mysql from "mysql2/promise";
      const pool = mysql.createPool({ host: "localhost", user: "root", password: "1234", database: "bbs" });

      app.use(express.json());                       // JSON 본문 → req.body
      app.use(cors({ origin: "http://localhost:5173" }));

      // 목록
      app.get("/board", async (req, res) => {
        const [rows] = await pool.query("SELECT * FROM board ORDER BY id DESC");
        res.json(rows);
      });
      // 상세  (경로 파라미터 :id)
      app.get("/board/:id", async (req, res) => {
        const [rows] = await pool.query("SELECT * FROM board WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "not found" });
        res.json(rows[0]);
      });
      // 생성
      app.post("/board", async (req, res) => {
        const { title, content, writer } = req.body;
        if (!title?.trim()) return res.status(400).json({ message: "title required" });
        const [r] = await pool.query(
          "INSERT INTO board (title,content,writer) VALUES (?,?,?)", [title, content, writer]);
        res.status(201).json({ id: r.insertId });
      });
      // 수정 / 삭제
      app.put("/board/:id", async (req, res) => {
        const { title, content } = req.body;
        await pool.query("UPDATE board SET title=?, content=? WHERE id=?", [title, content, req.params.id]);
        res.json({ ok: true });
      });
      app.delete("/board/:id", async (req, res) => {
        await pool.query("DELETE FROM board WHERE id=?", [req.params.id]);
        res.status(204).end();
      });
  - slug: rest-conventions
    title: REST 규칙 — 메서드 + 자원 URL + 상태 코드
    source_type: generated_minimal
    language: text
    code: |
      GET    /board        목록        200
      GET    /board/:id    한 건       200 / 404
      POST   /board        생성        201 (+ 새 id)
      PUT    /board/:id    전체 수정   200
      PATCH  /board/:id    부분 수정   200
      DELETE /board/:id    삭제        204 (본문 없음)

      동사를 URL 에 넣지 않는다: /getBoardList ✗  →  GET /board ✓
      의미: URL 은 "무엇"(자원), METHOD 는 "어떻게"(행위).
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `npm init` → `express` 설치 → 가장 작은 서버를 띄운다(`nodemon` 으로 자동 재시작).
- 내장 `http` 로 직접 하던 **메서드/URL 분기·본문 파싱**을 Express가 어떻게 대신하는지 안다.
- 게시판 **CRUD REST 라우트**(GET/POST/PUT/DELETE + `:id` + `req.body`)를 `mysql2` 로 만든다.
- **REST 규칙**(메서드 + 자원 URL + 상태 코드)을 지킨다.
- 수업자료의 옛 스택(`body-parser`, `mysql` 콜백)과 현재 스택(`express.json`, `mysql2/promise`)의 차이를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 내장 `http` 모듈로 서버 만들기(`builtin-http-server`), SQL CRUD + `?` 바인딩, 3계층 구조.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

내장 `http` 로 서버를 짜면 `if (req.method === "GET" && req.url === "/board")` 분기가 산더미가 되고,
본문을 `data` 이벤트로 직접 모아 `JSON.parse` 해야 한다. **Express**는 이 반복을
`app.get("/board", handler)` + `express.json()` 로 압축한다.

<!-- section: concept -->
## 1. 준비와 최소 서버

{{code: setup}}

{{code: hello}}

- **라우트** = METHOD(`app.get`/`post`/…) + 경로 + `(req, res) => {}` 핸들러.
- `res.send` / `res.json` / `res.status(코드)` / `res.end`.
- `nodemon` 은 개발용 — 저장하면 서버를 다시 띄운다. 운영은 `node index.js`(+ PM2/systemd).

<!-- section: code | lang: js -->
## 2. 게시판 CRUD 라우트

{{code: crud-routes}}

- `express.json()` — POST/PUT 본문(JSON)을 `req.body` 로. **이게 없으면 `req.body` 가 `undefined`.**
- `:id` — 경로 파라미터. `req.params.id` (항상 문자열).
- 쿼리스트링(`?page=2`)은 `req.query.page`.
- 쿼리는 **항상 `?` 바인딩**. 응답은 배열/객체를 `res.json` 으로.
- `mysql2/promise` 의 **풀**을 쓴다(요청마다 연결 새로 안 엶). `[rows] = await pool.query(...)` 구조 분해.

<!-- section: mechanism -->
## 3. REST 규칙

{{code: rest-conventions}}

- URL은 **자원(명사)**, 메서드는 **행위**. `GET /getList` 처럼 동사를 URL에 넣지 않는다.
- 상태 코드로 결과를 알린다: 생성 `201`, 없음 `404`, 잘못된 입력 `400`, 삭제 `204`(본문 없음), 서버 오류 `500`.
- 같은 자원의 목록/상세는 `/board` 와 `/board/:id` 로 계층.

<!-- section: concept | title: 기존 자료 -->
## 수업자료 스택 vs 지금

- `npm i express body-parser mysql` → 지금은 **`express mysql2`**. `body-parser` 는 Express 4.16+에
  `express.json()` / `express.urlencoded()` 로 내장됐다. `mysql` 콜백 드라이버는 유지보수가 느려
  **`mysql2`**(+`/promise`) 를 쓴다.
- 라우트/핸들러/`req`·`res` API는 그대로다 — 스택 이름만 갱신하면 자료가 유효하다.

<!-- section: must_know -->
## 반드시 기억할 것

- 라우트 = `app.METHOD(경로, 핸들러)`. `req.params`(경로) / `req.query`(쿼리) / `req.body`(본문, `express.json()` 필요).
- REST: URL=자원(명사), METHOD=행위, 결과는 **상태 코드**로. 동사 URL 금지.
- 없는 자원은 `404`, 잘못된 입력은 `400`, 생성은 `201`, 삭제는 `204`.
- DB는 `mysql2/promise` **풀** + `?` 바인딩. `[rows] = await pool.query(...)`.
- `express.json()` 을 빠뜨리면 `req.body` 가 `undefined`.
- 옛 자료의 `body-parser`/`mysql` → `express.json()`/`mysql2` 로 읽는다.

<!-- section: experiment -->
## 직접 해 보기

1. `npm init` → `express`·`mysql2`·`cors` 설치 → `/` 에 "ok" 를 주는 서버를 `nodemon` 으로 띄워라.
2. `bbs` DB의 `board` 테이블에 CRUD 5개 라우트를 만들어라. Postman/브라우저/`curl` 로 각각 호출.
3. `express.json()` 을 주석 처리하고 POST 해서 `req.body` 가 `undefined` 인 걸 확인한 뒤 되돌려라.
4. `GET /board/999999`(없는 id)에서 `404` 를 반환하게 하라.
5. `POST /board` 에서 제목이 비면 `400` 을 반환하게 하라.
6. React 게시판을 이 API에 연결해 목록/작성/삭제가 도는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 내장 `http` 대비 Express가 대신 해 주는 것 두 가지는?
2. `req.params` / `req.query` / `req.body` 는 각각 어디서 온 값인가?
3. `express.json()` 이 없으면 POST 라우트에서 무슨 일이 생기나?
4. `GET /deleteBoard?id=3` 이 REST 규칙 위반인 이유와 올바른 형태는?
5. 생성 성공·없는 자원·잘못된 입력의 상태 코드는 각각?

<!-- section: interview_question -->
## 면접 대비

- "RESTful API 설계 원칙을 URL·메서드·상태 코드 관점에서 설명해 주세요."
- "Express에서 요청 데이터를 받는 세 가지 경로(params/query/body)의 차이는?"
- "DB 커넥션 풀을 쓰는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> app.METHOD(경로,핸들러), params/query/body(express.json 필요), REST(자원 URL + METHOD + 상태 코드),
> mysql2/promise 풀 + ? 바인딩, 옛 스택(body-parser/mysql) 매핑을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Express는 내장 `http` 의 메서드/URL 분기·본문 파싱을 `app.get("/board", handler)` + `express.json()` 로
압축한다 — CRUD는 자원 URL + HTTP 메서드 + 상태 코드(201/404/400/204)로 설계하고, DB는
`mysql2/promise` 풀에 `?` 바인딩으로 위임한다.**
