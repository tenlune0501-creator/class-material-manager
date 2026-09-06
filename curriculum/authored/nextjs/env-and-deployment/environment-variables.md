---
id: nextjs/env-and-deployment/environment-variables
chapter: nextjs/env-and-deployment
title: 환경변수 다루기
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [nextjs, env, environment-variables, secrets]
related_material_ids:
  - 1kw3FXI2AunNXfxnFC4zyV3-UU8Q6BiFGme2Dj6_3W6o   # 환경변수 마무리
prerequisites:
  - nextjs/env-and-deployment/build-and-deploy
  - nextjs/data-and-backend/json-as-backend
code_examples:
  - slug: files
    title: .env 파일들과 우선순위
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      # .env            공통 기본값 (Git 에 커밋 O) — 비밀 아님
      # .env.local      내 로컬 전용 (Git 에 커밋 X) — 개인 값·개발용 시크릿
      # .env.development / .env.production   환경별
      # 같은 키가 여러 곳에 있으면 .env.local 이 우선

      # .env.local
      API_URL=http://localhost:9999                 # 서버에서만 보임
      NEXT_PUBLIC_API_URL=http://localhost:9999     # 브라우저에도 노출됨
  - slug: server-only
    title: 서버에서만 쓰는 값 (접두사 없음)
    source_type: generated_minimal
    language: tsx
    code: |
      // 서버 컴포넌트 / Route Handler / generateMetadata 등 "서버" 에서만
      const res = await fetch(`${process.env.API_URL}/topics`);
      const key = process.env.OPENAI_API_KEY;   // 클라이언트 컴포넌트에서 읽으면 undefined

      // 클라이언트 컴포넌트("use client")에서 process.env.API_URL 은 undefined →
      //   그래서 강사 자료에서 글쓰기 폼이 에러났다. 해결: 서버로 옮기거나 NEXT_PUBLIC_ 로.
  - slug: public-prefix
    title: 브라우저에서도 필요한 값 → NEXT_PUBLIC_
    source_type: generated_minimal
    language: tsx
    code: |
      // .env.local :  NEXT_PUBLIC_API_URL=http://localhost:9999
      "use client";
      async function submit(body: unknown) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      // NEXT_PUBLIC_ 값은 빌드 시 번들에 그대로 박힌다 = 공개된다.
      // 절대 넣지 말 것: API 키·비밀번호·DB 접속정보·토큰. 그런 건 서버 전용 변수 + 서버에서 호출.
  - slug: gitignore
    title: .gitignore 와 .env.example
    source_type: generated_minimal
    language: bash
    code: |
      # .gitignore
      .env*
      !.env.example        # 예시 파일만 커밋 (키 이름만, 값은 비움)

      # .env.example
      API_URL=
      NEXT_PUBLIC_API_URL=
      # 배포 환경(Vercel 등)에는 대시보드의 Environment Variables 에 실제 값을 넣는다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `.env` / `.env.local` / 환경별 파일의 역할과 **우선순위**를 안다.
- **접두사 없는 변수는 서버 전용**, `NEXT_PUBLIC_` 접두사는 브라우저에 노출된다는 규칙을 안다.
- 클라이언트 컴포넌트에서 `process.env.API_URL` 이 `undefined` 인 이유와 두 가지 해결책을 설명한다.
- 비밀값(API 키·DB 접속정보)을 `NEXT_PUBLIC_` 에 절대 넣지 않고, `.env*` 를 Git 에서 제외한다.
- 배포 환경 변수는 호스트 대시보드에 넣는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/env-and-deployment/build-and-deploy`, 서버/클라이언트 컴포넌트 구분.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- API 주소를 코드에 박아 로컬↔배포에서 매번 고친다.
- 클라이언트 폼에서 `process.env.API_URL` 을 썼는데 `undefined` → fetch 가 `undefined/topics` 로 감.
- 급한 마음에 `NEXT_PUBLIC_OPENAI_KEY` 로 노출 → 키가 번들에 박혀 유출된다.
- `.env.local` 을 Git 에 커밋한다.

<!-- section: concept -->
## .env 파일과 우선순위

{{code: files}}

- **`.env`** — 공통 기본값. 비밀 아닌 것만. 커밋해도 됨.
- **`.env.local`** — 내 로컬 전용, **커밋 안 함**. 개인 값·개발용 시크릿.
- `.env.development` / `.env.production` — 환경별.
- 같은 키가 겹치면 **`.env.local` 이 이긴다**. 파일을 바꾸면 dev 서버를 재시작해야 반영된다.

<!-- section: mechanism -->
## 서버 전용 vs 브라우저 노출

{{code: server-only}}

- **접두사 없는 변수**(`API_URL`, `OPENAI_API_KEY`)는 **서버에서만** 읽힌다: 서버 컴포넌트, Route Handler, `generateMetadata`, 미들웨어.
- 클라이언트 컴포넌트에서 그 변수를 읽으면 `undefined`. 강사 자료에서 글쓰기 폼(클라이언트)이 에러난 게 이 때문.

{{code: public-prefix}}

- 브라우저 코드에서도 필요하면 **`NEXT_PUBLIC_`** 접두사를 붙인다. 이 값은 **빌드 시 번들에 문자열로 박혀 공개**된다.
- 그러므로 `NEXT_PUBLIC_` 에 넣어도 되는 것: 공개 API 베이스 URL, 공개 가능한 클라이언트 ID 정도.
- **절대 안 됨**: API 시크릿 키, 비밀번호, DB 접속정보, 서버 토큰. 이런 건 서버 전용 변수로 두고
  **서버 컴포넌트/Route Handler 에서만** 그 키로 외부를 호출한다(브라우저는 우리 서버의 `/api/...` 만 호출).

<!-- section: mechanism | title: Git 과 배포 환경 -->
## Git 에서 제외 · 배포 환경 주입

{{code: gitignore}}

- `.gitignore` 에 `.env*` (예시 파일 `!.env.example` 만 예외). 커밋되는 건 **키 이름만 있고 값은 빈** `.env.example`.
- 배포(Vercel/Render 등)에서는 `.env.local` 을 올리지 않는다 → 호스트 대시보드의 **Environment Variables** 에 실제 값을 입력.
- 배포 환경마다 값이 다르다: 로컬 `http://localhost:9999`, 프로덕션 `https://내-api.onrender.com`.

<!-- section: must_know -->
## 반드시 기억할 것

- `.env`(공통·커밋) / `.env.local`(로컬·커밋 X). 겹치면 `.env.local` 우선. 변경 시 dev 재시작.
- **접두사 없음 = 서버 전용.** 클라이언트에서 읽으면 `undefined`.
- **`NEXT_PUBLIC_` = 브라우저 노출** = 번들에 박힘. 공개 가능한 값만.
- 비밀값은 서버 전용 변수 + 서버(컴포넌트/Route Handler)에서만 사용. 브라우저엔 절대.
- `.gitignore` 에 `.env*`, 대신 `.env.example` 커밋. 배포 값은 호스트 대시보드에.

<!-- section: mission -->
## 미션 — 환경변수로 API 주소 분리

- `.env.local` 에 `NEXT_PUBLIC_API_URL` (목록/상세/폼에서 사용) 정의. 코드의 `http://localhost:9999` 를 전부 치환.
- 서버에서만 필요한 값 하나(예: `INTERNAL_TOKEN`)를 접두사 없이 두고, 클라이언트에서 읽으면 `undefined` 인 것 확인.
- 일부러 클라이언트 폼에서 `process.env.API_URL`(접두사 없음)을 써서 나는 에러를 재현하고, `NEXT_PUBLIC_` 로 고치기.
- `.gitignore` 에 `.env*` + `!.env.example`, `.env.example` 작성.
- 배포한다면 Vercel 대시보드에 프로덕션 API 주소를 넣고 재배포.
- "무엇을 `NEXT_PUBLIC_` 에 넣어도 되고 무엇은 안 되는지" 를 예와 함께 3줄로 정리.

<!-- section: check_question -->
## 이해 점검

1. `.env` 와 `.env.local` 의 차이와, 같은 키가 겹칠 때 이기는 쪽은?
2. 클라이언트 컴포넌트에서 `process.env.API_URL` 이 `undefined` 인 이유와 해결책 두 가지는?
3. `NEXT_PUBLIC_` 변수의 값은 어디에 들어가나? 그래서 넣으면 안 되는 것은?
4. 배포 환경의 변수 값은 어디에 설정하나? `.env.local` 을 커밋하지 않는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "프런트엔드 코드에서 API 키를 안전하게 다루려면 어떻게 하나요?"
- "`NEXT_PUBLIC_` 접두사의 의미와 위험은?"

<!-- section: review -->
## 한 줄 정리

**`.env`(공통·커밋) / `.env.local`(로컬·비커밋, 우선) 로 값을 두되, 접두사 없는 변수는 서버 전용이고 `NEXT_PUBLIC_` 은
번들에 박혀 공개되므로 비밀값은 서버에서만 쓴다 — `.env*` 는 `.gitignore`, 배포 값은 호스트 대시보드에 넣는다.**

<!-- section: next -->
## 다음 Track

`data-and-backend` — 진짜 데이터베이스와 백엔드.
