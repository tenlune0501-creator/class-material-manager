---
id: data-and-backend/nodejs-server/middleware
chapter: data-and-backend/nodejs-server
title: 미들웨어와 바디 파싱
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [nodejs, express, middleware, body-parser, cors]
related_material_ids:
  - 1peKntI-8PW-rTz3_YEqlvQ5o9WgWOPbcL0-13fyerVE   # 06 게시물 쓰기 (express.json / express.urlencoded)
  - 1a63pT8qv_jVoOdSsM4audNDYIQj4CWa7DA0IMt7AAwM   # 04 웹서버와 DB 연동하기 (cors)
  - 1AkBUevgwRooF_sqef8D80r2tGnx4Swm1LwWWzgAVWCk   # 10 이미지 파일 첨부 (multer, multipart)
sources:
  - title: "Express Guide — Using middleware"
    url: https://expressjs.com/en/guide/using-middleware.html
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Express Guide — Writing middleware"
    url: https://expressjs.com/en/guide/writing-middleware.html
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/nodejs-server/express-rest-api
code_examples:
  - slug: what
    title: 미들웨어 = (req, res, next) 함수, 순서대로 통과
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 요청 → [mw1] → [mw2] → ... → [라우트 핸들러] → 응답
      // 각 미들웨어는 req/res 를 보거나 바꾸고, next() 로 다음으로 넘긴다

      const logger = (req, res, next) => {
        console.log(req.method, req.url);
        next();                    // ← 안 부르면 요청이 여기서 멈춘다(응답 없음 = 행)
      };
      app.use(logger);             // 모든 요청에 적용

      app.use("/admin", (req, res, next) => {   // 특정 경로에만
        if (!req.headers.authorization) return res.status(401).json({ message: "no auth" });
        next();
      });
  - slug: builtins
    title: 자주 쓰는 내장/공통 미들웨어
    source_type: generated_minimal
    language: js
    code: |
      app.use(express.json());                          // JSON 본문 → req.body
      app.use(express.urlencoded({ extended: true }));  // HTML form(x-www-form-urlencoded) → req.body
      app.use(express.static("public"));               // public/ 를 정적 파일로 서빙
      app.use(cors({ origin: "http://localhost:5173" }));// 허용 오리진 지정

      // Content-Type 별 파서가 다르다:
      //   application/json                  → express.json()
      //   application/x-www-form-urlencoded → express.urlencoded()
      //   multipart/form-data (파일)        → multer (아래)
  - slug: multer
    title: 파일 업로드 — multer (multipart/form-data)
    source_type: generated_minimal
    language: js
    code: |
      import multer from "multer";
      const upload = multer({
        dest: "uploads/",
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
      });

      // 이 라우트에만 적용 (라우트 레벨 미들웨어)
      app.post("/board", upload.single("image"), (req, res) => {
        const { title } = req.body;                 // 텍스트 파트
        const path = req.file ? `/uploads/${req.file.filename}` : null; // 파일 파트
        // DB 에는 파일이 아니라 path 만 저장
      });
  - slug: order
    title: 등록 순서가 곧 실행 순서
    source_type: generated_minimal
    language: js
    code: |
      app.use(express.json());        // 1) 본문 파싱  ← 라우트보다 먼저!
      app.use(cors(...));             // 2)
      app.use("/board", boardRouter); // 3) 라우트
      app.use((req, res) => res.status(404).json({ message: "not found" })); // 4) 안 걸리면 404
      app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message })); // 5) 에러 핸들러(맨 끝)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **미들웨어**가 `(req, res, next)` 함수이고, **등록 순서대로** 요청을 통과시킨다는 것을 안다.
- `next()` 를 부르는 것/안 부르는 것(중단)의 의미를 안다.
- `express.json()` / `express.urlencoded()` / `express.static()` / `cors()` 가 각각 무엇을 하는지 안다.
- **Content-Type 별로 파서가 다르다**(JSON / form / multipart)는 것과, 파일은 `multer` 로 받는 것을 안다.
- 미들웨어를 전역·경로·라우트 레벨로 붙이고, 순서를 올바르게 배치한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Express 라우트, `req.body` 개념, HTTP 헤더/Content-Type.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"모든 요청에 로그를 남기고 싶다", "관리자 경로만 인증 검사", "POST 본문을 객체로 받고 싶다",
"이미지를 첨부받고 싶다" — 이걸 라우트마다 복붙하면 지옥이다. **미들웨어**는 "요청이 라우트에
도달하기 전에 거치는 공통 처리"다.

<!-- section: concept -->
## 1. 미들웨어란

{{code: what}}

- 요청은 등록된 미들웨어를 **순서대로** 통과해 라우트 핸들러에 도달한다.
- 각 미들웨어는 `req`/`res` 를 읽거나 바꾸고, **`next()`** 로 다음으로 넘긴다.
- `next()` 를 안 부르고 `res` 로 응답하면 **거기서 중단**(예: 인증 실패 시 `401`). `next()` 도 `res` 도
  안 하면 요청이 영영 멈춘다(브라우저가 계속 로딩).
- 붙이는 범위: `app.use(fn)`(전역) / `app.use("/path", fn)`(경로) / `app.post("/x", fn, handler)`(라우트).

<!-- section: mechanism -->
## 2. 자주 쓰는 미들웨어

{{code: builtins}}

- `express.json()` — `Content-Type: application/json` 본문을 `req.body` 객체로.
- `express.urlencoded()` — HTML `<form>` 전송(`application/x-www-form-urlencoded`)을 `req.body` 로.
- `express.static("public")` — `public/` 폴더의 파일을 URL로 직접 서빙(이미지 등).
- `cors()` — 다른 오리진 요청 허용(브라우저 보호장치 대응). `origin` 을 좁게.
- (수업자료의 `body-parser` 는 이 내장 미들웨어들로 대체됐다.)

<!-- section: concept | title: multipart -->
## 3. 파일은 multer

{{code: multer}}

- `express.json()`/`urlencoded()` 는 파일(바이너리)을 못 다룬다. `multipart/form-data` 는 **`multer`**.
- `upload.single("image")` 를 **그 라우트에만** 붙인다(라우트 레벨 미들웨어). 텍스트는 `req.body`,
  파일은 `req.file` 로 나온다.
- 용량·타입 제한은 최소 방어. DB엔 파일이 아니라 **경로**만 저장.

<!-- section: concept | title: 순서 -->
## 4. 순서가 전부

{{code: order}}

- **본문 파서·cors 는 라우트보다 먼저.** 라우트 뒤에 두면 `req.body` 가 비어 있다.
- 아무 라우트에도 안 걸리면 마지막의 **404 미들웨어**가 잡는다.
- **에러 핸들러**(`(err, req, res, next)`, 인자 4개)는 **맨 끝**에 하나. `next(err)` 로 넘어온 에러를 여기서 응답.

<!-- section: must_know -->
## 반드시 기억할 것

- 미들웨어 = `(req, res, next)`. **등록 순서 = 실행 순서.**
- `next()` 를 부르면 다음으로, `res` 로 응답하면 중단. 둘 다 안 하면 요청이 멈춘다(행).
- Content-Type 별 파서: JSON → `express.json()`, form → `express.urlencoded()`, 파일 → `multer`.
- 본문 파서·`cors` 는 **라우트 등록보다 위**에.
- 범위: `app.use(fn)` 전역 / `app.use("/p", fn)` 경로 / `app.post("/x", fn, h)` 라우트.
- 에러 핸들러는 인자 **4개**, **맨 끝**에 하나(→ 다음 Lesson).
- `body-parser` 는 옛 이름 — 지금은 `express.json()`/`express.urlencoded()`.

<!-- section: experiment -->
## 직접 해 보기

1. 모든 요청의 `method`·`url`·소요 시간을 찍는 로거 미들웨어를 만들어 `app.use` 하라.
2. `express.json()` 을 라우트 **아래**로 옮겨 POST 시 `req.body` 가 비는 걸 확인한 뒤 되돌려라.
3. `/admin` 경로에만 `authorization` 헤더 검사 미들웨어를 붙여 `401` 을 내 보라.
4. `multer` 로 `POST /board` 에 이미지 첨부를 받고 `req.file` 을 찍어라. 텍스트+파일이 같이 오는지 확인.
5. 맨 끝에 404 미들웨어와 에러 핸들러를 추가하고, 라우트에서 `next(new Error("boom"))` 로 던져 보라.

<!-- section: check_question -->
## 이해 점검

1. 미들웨어에서 `next()` 도 `res` 도 안 부르면 어떻게 되나?
2. `express.json()` 을 라우트 뒤에 두면 무슨 일이 생기나?
3. JSON / HTML form / 파일 업로드는 각각 어떤 미들웨어가 파싱하나?
4. `upload.single("image")` 를 `app.use` 전역으로 붙이면 안 되는 이유는?
5. 에러 핸들러 미들웨어를 다른 미들웨어와 구분하는 문법적 차이는?

<!-- section: interview_question -->
## 면접 대비

- "Express 미들웨어 체인의 동작과, `next()` 의 역할을 설명해 주세요."
- "미들웨어 등록 순서가 왜 중요한가요? 잘못 배치하면 생기는 버그의 예는?"
- "`multipart/form-data` 를 왜 별도 미들웨어로 처리하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 미들웨어=(req,res,next)·등록 순서=실행 순서, next() vs res(중단), 파서(json/urlencoded/multer),
> 파서·cors는 라우트 위, 에러 핸들러는 4인자·맨 끝을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**미들웨어는 요청이 라우트에 닿기 전에 순서대로 거치는 `(req, res, next)` 함수다 — `express.json()`·
`urlencoded()`·`static()`·`cors()`·`multer` 를 Content-Type에 맞게, 파서와 cors는 라우트보다 먼저,
에러 핸들러(4인자)는 맨 끝에 배치한다.**
