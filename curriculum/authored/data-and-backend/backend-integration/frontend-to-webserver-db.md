---
id: data-and-backend/backend-integration/frontend-to-webserver-db
chapter: data-and-backend/backend-integration
title: 프론트엔드에서 웹서버·DB에 붙기
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [backend, integration, rest, fetch, database]
related_material_ids:
  - 1a63pT8qv_jVoOdSsM4audNDYIQj4CWa7DA0IMt7AAwM   # 04 웹서버와 DB 연동하기 (axios)
  - 1pVRYcYZM4XyofD3QoUm-NCuI0nfU4a-IXDig_vOW3lQ   # 09_Backend (json-server)
prerequisites:
  - react/data-fetching/fetching-in-react
  - data-and-backend/data-modeling/sql-essentials
code_examples:
  - slug: three-tier
    title: 3계층 — 브라우저 / 웹서버(API) / DB
    source_type: generated_minimal
    language: text
    code: |
      [브라우저 (React)]  --HTTP(JSON)-->  [웹서버 (Express)]  --SQL-->  [DB (MySQL)]
        fetch/axios                          라우트 핸들러                테이블
        화면·상태                            검증·권한·비즈니스 로직      영속 저장
                          <--JSON--                     <--rows--

      브라우저는 DB에 직접 못 붙는다(자격증명 노출·SQL 노출). 반드시 API 서버를 거친다.
      * BaaS(Firebase/Supabase)는 이 웹서버 자리를 SDK+보안규칙이 대신한다.
  - slug: client-call
    title: 클라이언트 — axios 로 API 호출
    source_type: generated_minimal
    language: js
    code: |
      import axios from "axios";
      const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE }); // "http://localhost:8000"

      // GET 목록
      const { data } = await api.get("/list");
      // POST 생성 (JSON 본문 자동 직렬화)
      await api.post("/write", { title, content, writer });
      // 에러: axios 는 4xx/5xx 를 reject 한다 (fetch 와 달리)
      try { await api.get("/list"); } catch (e) { console.error(e.response?.status); }
  - slug: server-route
    title: 서버 — 요청을 받아 DB에 위임
    source_type: generated_minimal
    language: js
    code: |
      import express from "express";
      import mysql from "mysql2/promise";

      const app = express();
      app.use(express.json());                         // JSON 본문 → req.body
      const pool = mysql.createPool({ host: "localhost", user: "root", password: "...", database: "bbs" });

      app.get("/list", async (req, res) => {
        const [rows] = await pool.query("SELECT * FROM board ORDER BY id DESC");
        res.json(rows);                                // 배열 → JSON
      });
      app.post("/write", async (req, res) => {
        const { title, content, writer } = req.body;
        await pool.query("INSERT INTO board (title,content,writer) VALUES (?,?,?)", [title, content, writer]);
        res.status(201).json({ ok: true });
      });
      app.listen(8000);
  - slug: cors-mock
    title: CORS 한 줄 · 백엔드 없이 연습(json-server)
    source_type: generated_minimal
    language: js
    code: |
      // 브라우저는 다른 오리진(:5173 → :8000) 요청을 CORS 정책으로 막는다
      import cors from "cors";
      app.use(cors({ origin: "http://localhost:5173" })); // 학습용. 운영은 허용 목록을 좁힌다
      // ⚠️ origin: "*" 는 편하지만 아무 사이트나 이 API 를 부를 수 있게 된다

      // 서버를 아직 안 만들었으면 json-server 로 가짜 REST API:
      //   npx json-server --port 9999 --watch db.json
      //   db.json:  { "posts": [ { "id": 1, "title": "..." } ] }
      //   → GET/POST/PUT/DELETE /posts 가 자동 생성
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **3계층 구조**(브라우저 → 웹서버/API → DB)에서 각 층이 하는 일과, 브라우저가 DB에 직접 못 붙는 이유를 안다.
- 클라이언트에서 `axios`/`fetch` 로 API를 호출하고 응답(JSON)을 화면에 반영한다.
- 서버가 요청을 받아 **검증 → SQL 위임 → JSON 응답** 하는 흐름을 안다.
- **CORS** 가 왜 나는지와 학습용 해결, `json-server` 로 백엔드 없이 연습하는 법을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- React에서 `useEffect` + fetch/axios, SQL 기본(`SELECT`/`INSERT` + `?` 바인딩).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

지금까지의 React 게시판은 데이터가 새로고침하면 사라졌다. **영구 저장**하려면 DB가 필요한데,
브라우저에서 MySQL에 직접 붙일 수는 없다 — DB 접속 정보와 쿼리가 사용자에게 그대로 노출되기 때문이다.
그래서 **중간에 API 서버**를 둔다.

<!-- section: concept -->
## 1. 3계층

{{code: three-tier}}

- **브라우저(React)**: 화면·상태. HTTP로 JSON을 주고받는다.
- **웹서버(Express)**: 요청을 받아 **검증·권한·비즈니스 로직**을 처리하고 DB에 위임. DB 접속 정보는 여기에만.
- **DB(MySQL)**: 실제 영속 저장. SQL로만 대화.
- BaaS(Firebase/Supabase)는 이 "웹서버" 자리를 **SDK + 보안 규칙**이 대신한다(다음 챕터).

<!-- section: code | lang: js -->
## 2. 클라이언트 호출

{{code: client-call}}

- `axios.create({ baseURL })` 로 API 주소를 한곳에. 주소는 `import.meta.env` 로(하드코딩 금지).
- **axios는 4xx/5xx를 `catch` 로 던진다**(fetch는 `res.ok` 를 직접 봐야 함).
- 응답 데이터는 `res.data`.

<!-- section: mechanism -->
## 3. 서버 라우트

{{code: server-route}}

- `express.json()` 이 요청 본문을 `req.body` 객체로 만든다.
- 라우트 핸들러는 **얇게**: 입력 꺼내기 → (검증) → `pool.query("... ?", [값])` → `res.json(...)`.
- `mysql2/promise` 의 커넥션 **풀**을 쓴다(요청마다 연결을 새로 열지 않음). 수업자료의 옛
  `mysql` 콜백 드라이버 / `body-parser` 는 지금은 `mysql2` / `express.json()` 으로 대체된다.
- 상태 코드: 생성은 `201`, 없는 리소스는 `404`, 잘못된 입력은 `400`.

<!-- section: concept | title: CORS · mock -->
## 4. CORS · 백엔드 없이 연습

{{code: cors-mock}}

- 브라우저는 프런트(:5173)에서 다른 오리진(:8000) API를 부르면 **CORS 정책**으로 막는다.
  서버에 `cors` 미들웨어로 **허용할 오리진을 명시**한다. `origin: "*"` 는 학습용으로만 —
  운영에서는 내 프런트 도메인만 허용한다. (이건 브라우저 보호장치이지 서버 인증이 아니다.)
- 서버를 아직 안 만들었으면 **`json-server`** 로 `db.json` 하나에서 REST API를 자동 생성해 연습한다.

<!-- section: must_know -->
## 반드시 기억할 것

- 브라우저는 DB에 직접 못 붙는다 → **API 서버 경유**(자격증명·SQL은 서버에만).
- 계층별 역할: 화면(React) / 검증·로직(Express) / 영속(DB).
- 클라이언트는 `axios`(4xx/5xx는 catch) 또는 `fetch`(res.ok 확인). API 주소는 env로.
- 서버 라우트는 얇게: `req.body` → `?` 바인딩 쿼리 → `res.json` + 적절한 상태 코드.
- **CORS**는 브라우저 보호장치 — 서버에서 허용 오리진을 좁게 설정. `*` 는 학습용만.
- `json-server` 로 백엔드 없이 REST 흐름을 연습할 수 있다.

<!-- section: experiment -->
## 직접 해 보기

1. `json-server` 로 `db.json`(`posts` 배열)을 띄우고 React에서 목록 GET / 생성 POST 를 붙여라.
2. Express + `mysql2/promise` 로 `/list`, `/write` 를 만들고 같은 프런트를 연결하라.
3. `cors` 를 빼고 요청해 콘솔의 CORS 에러를 확인한 뒤 `origin` 을 지정해 해결하라.
4. axios로 없는 경로(`/nope`)를 호출해 `catch` 로 `e.response.status` 를 찍어 보라.
5. 서버 라우트에서 입력 검증(빈 제목이면 `400`)을 추가하라.

<!-- section: check_question -->
## 이해 점검

1. 브라우저에서 MySQL에 직접 붙으면 안 되는 이유 두 가지는?
2. 3계층에서 "검증·권한"은 어느 층의 책임인가?
3. axios와 fetch의 에러 처리 방식 차이는?
4. CORS 에러는 어디서(누가) 발생시키나? `cors` 미들웨어의 `origin` 을 `*` 로 두면 뭐가 문제인가?
5. 서버 없이 REST 흐름을 연습하려면 무엇을 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "프런트엔드 → API → DB 3계층에서 각 계층의 책임 분리를 설명해 주세요."
- "CORS의 동작 원리와, 서버에서 어떻게 설정하나요?"
- "클라이언트에 DB 자격증명이나 쿼리를 노출하면 안 되는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 3계층(화면/검증·로직/영속), 브라우저는 API 경유, axios(catch)·fetch(res.ok), 얇은 라우트+? 바인딩,
> CORS는 브라우저 보호장치·origin 좁게, json-server 목을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**프런트는 DB에 직접 못 붙으므로 `axios`/`fetch` 로 API 서버를 부르고, 서버는 요청을 검증한 뒤 `?` 바인딩
쿼리로 DB에 위임해 JSON을 돌려준다 — 다른 오리진 호출은 서버의 `cors` 설정으로 열되 범위를 좁히고,
백엔드 전이면 `json-server` 로 흐름을 연습한다.**
