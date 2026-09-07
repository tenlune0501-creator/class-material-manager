---
id: data-and-backend/nodejs-server/config-and-structure
chapter: data-and-backend/nodejs-server
title: 환경설정과 프로젝트 구조
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [nodejs, config, environment-variables, project-structure, layering]
related_material_ids:
  - 1E235IuK9vwVtt6ZSdY88IBAdS63mZwJfzGHh_PQs8jI   # GCP - 클라이언트 연결 (배포 환경 주소·CORS)
  - 1bKTN0FWrRaGDZ33mLDZm_JiMJzHIWGHNeIEU35_v8Ig   # GCP - 서비스 등록 실행
sources:
  - title: "Node.js — process.env"
    url: https://nodejs.org/api/process.html#processenv
    publisher: "OpenJS Foundation"
    checked_at: 2026-09-07
    source_type: official_docs
project_links:
  - unit: tenlune-operations-agent/cli-command-dispatch
    note: src/cli.ts 가 argv 를 파싱해 서브커맨드로 분기하고 도메인·connector·repository 계층을 조립하는 실제 진입점
prerequisites:
  - data-and-backend/nodejs-server/routing-and-modules
code_examples:
  - slug: env
    title: .env — 환경마다 다른 값을 코드 밖으로
    source_type: generated_minimal
    language: text
    code: |
      # .env  (git 에 커밋하지 않는다 → .gitignore)
      PORT=8000
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=1234
      DB_NAME=bbs
      CORS_ORIGIN=http://localhost:5173

      # .env.example  (이건 커밋 — "무슨 키가 필요한지" 만, 값은 빈칸/더미)
      PORT=
      DB_HOST=
      # ...
  - slug: config
    title: config.js — 한곳에서 읽고 검증
    source_type: generated_minimal
    language: js
    code: |
      import "dotenv/config";   // .env → process.env  (Node 20.6+ 는 --env-file 로 대체 가능)

      function required(name) {
        const v = process.env[name];
        if (v == null || v === "") throw new Error(`missing env: ${name}`); // 없으면 부팅 시 즉시 실패
        return v;
      }

      export const config = {
        port: Number(process.env.PORT ?? 8000),
        db: {
          host: required("DB_HOST"),
          user: required("DB_USER"),
          password: required("DB_PASSWORD"),
          database: required("DB_NAME"),
        },
        corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
      };
      // 앱 어디서도 process.env 를 직접 읽지 않는다 → config 만 import
  - slug: structure
    title: 폴더 구조 (계층형)
    source_type: generated_minimal
    language: text
    code: |
      bbs-server/
        .env  .env.example  .gitignore
        package.json
        src/
          config.js          환경변수 로딩·검증
          db.js              mysql2 풀 (config 사용)
          app.js             express 앱 조립 (미들웨어 + 라우터 마운트)
          server.js          app.listen (진입점)
          routes/            board.js, user.js  (HTTP)
          services/          board.js           (비즈니스 규칙)
          repositories/      board.js           (SQL)
          middlewares/       error.js, auth.js
      # app.js 와 server.js 분리 → 테스트에서 listen 없이 app 만 불러올 수 있다
  - slug: deploy-env
    title: 배포 환경 — 값만 바꾸면 된다
    source_type: generated_minimal
    language: text
    code: |
      로컬:   .env 파일
      GCP VM: /etc/environment 또는 systemd 유닛의 Environment= / EnvironmentFile=
      PaaS:   대시보드의 환경변수 UI
      GitHub Actions: Secrets → workflow env:

      코드는 그대로. DB_HOST 가 localhost → 운영 DB 주소로,
      CORS_ORIGIN 이 localhost:5173 → 배포된 프런트 도메인으로 바뀔 뿐.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 환경마다 다른 값(포트·DB 접속·CORS 오리진·키)을 **`.env` 로 코드 밖에** 두는 이유를 안다.
- `process.env` 를 **한 파일(`config.js`)에서만** 읽고, 필수값이 없으면 **부팅 시 즉시 실패**시킨다.
- **계층형 폴더 구조**(config / db / app / routes / services / repositories / middlewares)를 잡는다.
- `app.js` 와 `server.js` 를 나누는 이유(테스트)를 안다.
- 배포 환경에서는 **코드가 아니라 값만** 바뀐다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Express 라우터 분리, ES 모듈, DB 풀.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

`mysql.createPool({ host: "localhost", password: "1234" })` 를 코드에 박아 두면:

- 깃에 **DB 비밀번호가 그대로** 올라간다.
- 배포하려면 소스를 고쳐야 한다(로컬 `localhost` → 운영 DB 주소).
- 개발/운영 설정이 섞여 실수로 운영 DB에 붙는다.

<!-- section: concept -->
## 1. .env

{{code: env}}

- `.env` 에 **환경마다 다른 값**을 넣고 **`.gitignore`** 한다.
- `.env.example` 은 커밋한다 — "이 앱은 어떤 키가 필요한가"를 알려 주되 값은 비운다.
- 비밀(DB 비번, API 키)은 절대 커밋 금지. 이미 커밋했다면 값을 **교체(rotate)** 해야 한다(히스토리에 남음).

<!-- section: mechanism -->
## 2. config.js — 읽기·검증을 한곳에

{{code: config}}

- `dotenv/config`(또는 Node 20.6+ 의 `node --env-file=.env`)로 `.env` → `process.env`.
- 앱 곳곳에서 `process.env.X` 를 직접 읽지 말고 **`config` 객체만** import 한다 —
  오타·누락을 한곳에서 잡고, 타입 변환(`Number(...)`)도 한 번만.
- **필수값이 없으면 `throw`** 해서 서버가 아예 안 뜨게 한다("나중에 요청 왔을 때 터지는" 것보다 낫다).

<!-- section: concept | title: 구조 -->
## 3. 폴더 구조

{{code: structure}}

- `config` → `db` → `app`(미들웨어·라우터 조립) → `server`(listen).
- 도메인 로직은 `routes`(HTTP) / `services`(규칙) / `repositories`(SQL) 로. (소규모면 services 생략 가능.)
- **`app.js`(앱) 와 `server.js`(listen) 분리**: 테스트에서 포트를 안 열고 `app` 만 불러와 요청을 흉내 낼 수 있다.

<!-- section: concept | title: 배포 -->
## 4. 배포 환경

{{code: deploy-env}}

환경변수를 제대로 빼 놓으면 **배포는 "값 바꾸기"** 가 된다. 코드 브랜치가 환경별로 갈리지 않는다.
`NODE_ENV=production` 으로 로깅·에러 응답 상세도를 조절한다(운영에서는 스택트레이스를 클라에 안 보냄).

<!-- section: must_know -->
## 반드시 기억할 것

- 환경마다 다른 값·비밀은 **`.env`(gitignore)** 에. `.env.example` 은 커밋.
- `process.env` 는 **`config.js` 한곳에서만** 읽고 검증. 필수값 없으면 **부팅 시 즉시 실패**.
- 계층: config / db / app / server / routes / services / repositories / middlewares.
- `app.js`(조립) 와 `server.js`(listen) 를 분리 → 테스트 용이.
- 배포는 코드가 아니라 **환경변수 값**을 바꾼다(VM·PaaS·Actions 각각의 방식으로).
- 이미 커밋된 비밀은 지워도 히스토리에 남는다 → **값을 교체**한다.

<!-- section: experiment -->
## 직접 해 보기

1. 게시판 서버의 DB 접속 정보와 포트, CORS 오리진을 `.env` 로 빼고 `.gitignore` 에 `.env` 추가.
2. `config.js` 를 만들어 `required()` 로 검증하고, `DB_PASSWORD` 를 지우면 서버가 안 뜨는지 확인하라.
3. 앱 코드에서 `process.env` 직접 참조를 전부 `config` import 로 바꿔라.
4. `app.js` / `server.js` 를 분리하고, `app` 만 import 해 라우트가 등록됐는지 콘솔로 확인하라.
5. `.env.production` 예시를 만들어(가짜 값) "배포 시 무엇만 바뀌는지" 를 적어라.

<!-- section: check_question -->
## 이해 점검

1. DB 비밀번호를 코드에 박으면 생기는 문제 3가지는?
2. `process.env` 를 여러 파일에서 직접 읽으면 뭐가 불편한가?
3. 필수 환경변수가 없을 때 "부팅 시 실패" 가 "요청 시 실패" 보다 나은 이유는?
4. `app.js` 와 `server.js` 를 나누면 무엇이 쉬워지나?
5. 이미 깃에 올라간 비밀번호를 파일에서 지우면 안전한가?

<!-- section: interview_question -->
## 면접 대비

- "12-Factor App의 config 원칙(환경변수로 분리)을 설명해 주세요."
- "Node 서버 프로젝트의 폴더 구조를 어떻게 잡나요? 계층 분리의 이점은?"
- "환경변수 검증을 부팅 시점에 하는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> .env(gitignore)+.env.example, config.js 한곳 읽기·검증·부팅 시 실패, 계층 폴더,
> app/server 분리(테스트), 배포=값만 변경을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**환경마다 다른 값과 비밀은 `.env` 로 빼고 `config.js` 한곳에서 읽어 검증하며(필수값 없으면 부팅 실패),
폴더는 config/db/app/server/routes/services/repositories 로 나눈다 — 이렇게 하면 배포는 코드가 아니라
환경변수 값만 바꾸는 일이 된다.**
