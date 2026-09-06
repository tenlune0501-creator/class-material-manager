---
id: nextjs/app-setup/create-next-app
chapter: nextjs/app-setup
title: create-next-app으로 앱 만들기
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [nextjs, setup, create-next-app]
related_material_ids:
  - 1wsIFI6TvOlQaOKo9v9dh-JAqQMo1dhWi5GYS9f-oELs   # 01_create app (2025)
prerequisites:
  - react/setup-and-jsx/dev-environment
  - typescript/setup-and-basic-types/intro-and-setup
code_examples:
  - slug: create
    title: 생성 · 실행
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      npx create-next-app@latest my-app
      #  TypeScript: Yes     ESLint: Yes      Tailwind: (취향)
      #  src/ 디렉터리: Yes   App Router: Yes  Turbopack: Yes   import alias @/*: Yes

      cd my-app
      npm run dev        # http://localhost:3000
      npm run build      # 프로덕션 빌드
      npm run start      # 빌드 결과 실행
  - slug: structure
    title: 폴더 구조 (App Router)
    source_type: generated_minimal
    language: text
    code: |
      my-app/
        src/app/
          layout.tsx     ← 모든 페이지를 감싸는 최상위 레이아웃 (<html><body>)
          page.tsx       ← "/" 경로의 화면
          globals.css
          favicon.ico
        public/          ← 정적 파일 (/logo.png 로 접근)
        next.config.ts
        tsconfig.json    ← "@/*" → "src/*" alias 설정됨
      # 폴더 = URL 경로.  app/about/page.tsx → /about
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Next.js 가 **React 프레임워크**(라우팅·번들·SSR·SEO 설정을 대신 해 줌)라는 것을 안다.
- `create-next-app` 으로 App Router + TypeScript 프로젝트를 만들고 실행한다.
- 폴더 구조(`src/app/layout.tsx`, `page.tsx`)와 **폴더 = URL** 규칙을 안다.
- `dev` / `build` / `start` 의 역할을 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- React(컴포넌트·JSX·훅), Vite 프로젝트 경험, TypeScript 기본. npm.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- Vite + React 로 시작하면 라우팅(react-router 설치), SSR, 메타 태그, API 라우트, 이미지 최적화를
  전부 직접 조립해야 한다.
- 검색엔진·SNS 미리보기를 위한 SSR/메타데이터가 CSR 만으로는 약하다.

<!-- section: concept -->
## Next.js = React + 기본 세팅

- **React** = 라이브러리. **Next.js** = 그 위의 **프레임워크** — 라우팅, 번들러(Turbopack), SSR/SSG,
  이미지 최적화, `<head>` 관리, API 라우트, 배포까지 규약으로 제공.
- **App Router**(현재 방식) — `src/app/` 폴더 구조가 곧 라우트. 서버 컴포넌트가 기본.
- 단점: 예약 파일(`page`, `layout`, `loading`, `error` 등)이 많고, 규약을 익혀야 하며, 신기능이 자주 바뀐다.

{{code: create}}

<!-- section: mechanism -->
## 폴더 구조

{{code: structure}}

- **`src/app/layout.tsx`** — 앱 전체를 감싸는 최상위 레이아웃. `<html>`, `<body>`, 공통 헤더/푸터, `metadata`.
- **`src/app/page.tsx`** — `/` 경로의 화면.
- **`app/about/page.tsx`** → `/about`. **폴더가 URL 세그먼트**다.
- `public/` — 정적 파일. `<img src="/logo.png">` (public 기준 절대경로).
- `@/*` alias → `src/*` (설정 완료). `import Button from "@/components/Button"`.

### dev / build / start

- `npm run dev` — 개발 서버(HMR, `:3000`).
- `npm run build` — 프로덕션 최적화 빌드(`.next/`).
- `npm run start` — 빌드 결과를 Node 서버로 실행. (배포는 Vercel 이면 이걸 자동으로)

<!-- section: must_know -->
## 반드시 기억할 것

- Next.js 는 React **프레임워크** — 라우팅·SSR·SEO·번들 설정을 규약으로 대신한다.
- `create-next-app@latest`, **App Router + TypeScript** 선택, `:3000`.
- **`src/app/` 폴더 = URL.** `page.tsx` 는 그 경로의 화면, `layout.tsx` 는 감싸는 틀.
- `public/` = 정적 파일(`/파일명`). `@/` = `src/`.
- `dev`(개발) / `build`(빌드) / `start`(빌드 실행). CSR-only Vite 와 달리 **서버가 관여**한다.

<!-- section: experiment -->
## 직접 해 보기

1. `create-next-app` 으로 App Router + TS 앱을 만들고 `npm run dev`. `src/app/page.tsx` 를 고쳐 HMR 확인.
2. `src/app/about/page.tsx` 를 만들고 `/about` 으로 접속 → 폴더 = URL 을 체감.
3. `npm run build` 후 `.next/` 를 열어 보고 `npm run start` 로 프로덕션 모드 실행. `dev` 와의 차이(빌드 시간, 최적화)를 관찰.
4. `public/` 에 이미지를 넣고 `<img src="/그이미지" />` 로 표시.

<!-- section: check_question -->
## 이해 점검

1. React 와 Next.js 의 관계를 한 문장으로.
2. `src/app/products/page.tsx` 는 어떤 URL 인가?
3. `layout.tsx` 와 `page.tsx` 의 역할 차이는?
4. `dev`, `build`, `start` 는 각각 무엇을 하나?

<!-- section: interview_question -->
## 면접 대비

- "Vite+React 대신 Next.js 를 선택하는 이유는?"
- "App Router 의 폴더 기반 라우팅의 장단점은?"

<!-- section: review -->
## 한 줄 정리

**Next.js 는 라우팅·SSR·SEO·번들을 규약으로 제공하는 React 프레임워크다 — `create-next-app` 으로
App Router+TS 를 만들고, `src/app/` 폴더가 곧 URL(`page.tsx`=화면, `layout.tsx`=틀).**

<!-- section: next -->
## 다음 Lesson

`app-setup/sample-app-structure` — 만들어진 샘플 앱 뜯어보기.
