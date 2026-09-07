---
id: momentalk/overview
project: momentalk
title: 프로젝트 개요 — 구조와 스택
unit_kind: overview
feature_area: 전체
concepts: [프로젝트 구조, App Router, 서버/클라이언트 컴포넌트, 스택 선택]
related_material_ids:
  - 18CUxbf3--TfKOVa6o4monPBZTPUeejSS6m9DzcZSZMU
  - 1mEpVHXmFMNaE1WgtwrlBfd97saAxznV_rVGCNrobFho
related_lessons:
  - nextjs/app-setup/sample-app-structure
  - nextjs/routing-and-layout/file-based-routing
  - react/setup-and-jsx/why-react-for-publishers
---

<!-- section: role -->
## 이 프로젝트가 뭐였나

**Momentalk** 은 오르미 FE 13기 3차 팀 프로젝트(TEAM MOSAIC)다. 초성 퀴즈·랜덤 픽 같은
**미니게임** 과 **커뮤니티 게시판**, 그리고 **로그인/회원** 을 갖춘 웹앱이다.

- 스택: **React + Next.js(App Router) + MUI + Supabase**, 언어는 JavaScript(JSX)
- 고정 커밋 `004b4e8` 한 지점을 학습 기준으로 삼는다 — 이 Unit 들과 실전 예제의 코드는 전부 그 커밋 원문이다.

<!-- section: where -->
## 코드가 어디에 있나

```
src/
  app/                  라우트 (폴더 = 경로, page.jsx = 그 경로의 화면)
    game/chosung-quiz/   미니게임 라우트
    sign-in/             로그인
    api/auth/password/   Route Handler (서버 API)
  components/
    games/               ChosungQuiz.jsx, RandomPick.jsx …
    ui/                  공통 Button 등
    layout/              GameHeader, Footer …
  hooks/                 useFocusTrap.js …
  lib/                  hangul.js(순수 함수), communityQueries.js(Supabase 조회)
  utils/supabase/        server.js, middleware.js (SSR 클라이언트·세션 갱신)
```

<!-- section: flow -->
## 화면이 그려지는 큰 흐름

1. 요청이 들어오면 **미들웨어**(`utils/supabase/middleware.js`)가 먼저 Supabase 세션을 갱신하고 쿠키를 전파한다.
2. App Router가 경로에 맞는 `page.jsx`(기본은 **서버 컴포넌트**)를 고른다. 서버 컴포넌트는 `metadata` 를 선언하고,
   상호작용이 필요한 부분은 `"use client"` 컴포넌트에 위임한다.
3. 클라이언트 컴포넌트가 `useState` 로 화면 상태를 들고, 필요하면 `lib/*` 의 함수로 Supabase를 조회한다.

<!-- section: framework_role -->
## Next.js / MUI / Supabase 가 대신하는 것

- **Next.js App Router**: 라우팅(폴더 구조 = URL), 서버/클라이언트 렌더링 경계, `metadata` 기반 SEO를 대신한다.
- **MUI**: 버튼·레이아웃 등 접근성 갖춘 컴포넌트를 제공한다. 프로젝트는 그 위에 공통 `Button` 을 한 겹 더 씌운다.
- **Supabase**: 인증(쿠키 세션)과 Postgres DB를 BaaS로 제공한다. 서버 클라이언트 + 미들웨어 세션 갱신이 정형 패턴이다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `nextjs/app-setup/sample-app-structure`, `nextjs/routing-and-layout/file-based-routing` — 폴더 = 경로 규칙
- `react/setup-and-jsx/why-react-for-publishers` — 왜 컴포넌트로 나누나

<!-- section: caution -->
## 주의점

- 이 코드는 **학습 기준 커밋의 원문**이다. 실제 서비스는 이후 더 다듬어졌을 수 있다.
- 팀 프로젝트라 파일 단위 작성자는 추정하지 않는다(README 역할표는 기능 영역 단위).

<!-- section: check_question -->
## 이해 점검

1. App Router에서 "폴더"와 "URL 경로"는 어떤 관계인가?
2. 서버 컴포넌트와 클라이언트 컴포넌트를 나누는 기준은? `metadata` 는 어느 쪽이 선언하나?
3. 요청이 들어와서 화면이 그려지기까지, 미들웨어가 하는 일은?

<!-- section: review -->
## 한 줄 정리

**Momentalk은 Next.js App Router + MUI + Supabase로 만든 미니게임·커뮤니티 웹앱이며, "미들웨어가 세션을
갱신 → 서버 컴포넌트가 metadata 선언 → 클라이언트 컴포넌트가 상태·조회"라는 흐름이 프로젝트 전반의 뼈대다.**
