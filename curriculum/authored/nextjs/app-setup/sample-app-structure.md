---
id: nextjs/app-setup/sample-app-structure
chapter: nextjs/app-setup
title: 샘플 앱 구조 파악하기
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [nextjs, project-structure, app-router]
related_material_ids:
  - 1mEpVHXmFMNaE1WgtwrlBfd97saAxznV_rVGCNrobFho   # 02_샘플 앱 정리 (2025)
prerequisites:
  - nextjs/app-setup/create-next-app
code_examples:
  - slug: layout-clean
    title: layout.tsx — 최소 형태로 정리
    source_type: generated_minimal
    language: tsx
    is_canonical: true
    code: |
      // src/app/layout.tsx
      import "./globals.css";

      export const metadata = {
        title: "내 앱",
        description: "학습용 Next.js 앱",
      };

      export default function RootLayout({ children }: { children: React.ReactNode }) {
        return (
          <html lang="ko">
            <body>{children}</body>
          </html>
        );
      }
      // create-next-app 이 넣어 준 next/font, 데모 className 등은 지우고 시작해도 된다.
  - slug: page-clean
    title: page.tsx — 최소 형태
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/page.tsx  →  "/" 경로
      export default function Home() {
        return <>Hello, Next.js!</>;
      }
  - slug: head-check
    title: metadata 가 <head> 로 들어가는지 확인
    source_type: generated_minimal
    language: text
    code: |
      # 브라우저 개발자도구 → Elements → <head> 안에
      #   <title>내 앱</title>
      #   <meta name="description" content="학습용 Next.js 앱">
      # layout.tsx 의 export const metadata 가 서버에서 주입된 결과다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `create-next-app` 이 만든 데모 코드에서 **꼭 필요한 뼈대**(`layout.tsx` / `page.tsx` / `globals.css`)만 남기고 정리한다.
- `RootLayout({ children })` 의 `children` 이 각 `page.tsx` 의 내용이라는 것을 안다.
- `export const metadata` 가 서버에서 `<head>` 로 주입되는 것을 개발자도구로 확인한다.
- 어디를 지워도 되고 어디는 건드리면 안 되는지 감을 잡는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/app-setup/create-next-app` (앱 생성, 폴더 = URL).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 데모 코드(폰트 import, 데모 CSS, 데모 마크업)를 그대로 두고 그 위에 얹어서, 내 코드와 보일러플레이트가 섞인다.
- `layout` 과 `page` 중 어디에 무엇을 써야 하는지 몰라서 헤더/푸터를 `page` 마다 복붙한다.

<!-- section: concept -->
## layout / page / globals.css 만 남긴다

{{code: layout-clean}}

{{code: page-clean}}

- **`layout.tsx`** — 모든 페이지를 감싸는 껍데기. `<html>`, `<body>`, 공통 헤더/푸터, `metadata`.
  페이지가 바뀌어도 **다시 렌더되지 않는다**(공통 영역).
- **`page.tsx`** — 한 경로의 실제 내용. `layout` 의 `{children}` 자리에 들어간다.
- **`globals.css`** — 앱 전체 CSS. `create-next-app` 데모 스타일은 지우고 시작해도 된다.
- create-next-app 이 넣은 `next/font/google`, 데모 `className`, 데모 마크업은 **학습 초반엔 지워도 무방**하다
  (웹폰트는 나중에 다시 붙일 수 있다).

<!-- section: mechanism -->
## metadata 는 서버가 <head> 로 넣는다

{{code: head-check}}

- `layout.tsx` 에서 `export const metadata = { title, description }` 하면 Next.js 가 **서버 렌더 시점에**
  `<head>` 에 `<title>`·`<meta>` 를 넣는다.
- React 처럼 `<head>` 를 직접 JSX 로 쓰지 않는다 — **`metadata` 객체를 export** 하는 게 App Router 방식.
- `page.tsx` 에서도 `export const metadata` 가능 → 그 경로만의 제목.

<!-- section: must_know -->
## 반드시 기억할 것

- 뼈대 = `layout.tsx`(껍데기) + `page.tsx`(내용) + `globals.css`(전역 CSS).
- `RootLayout({ children })` 의 `children` = 현재 경로의 `page.tsx`.
- `layout` 은 페이지 전환 시 **다시 렌더 안 됨** → 공통 헤더/푸터·네비를 여기에.
- 제목·설명은 JSX `<head>` 가 아니라 **`export const metadata` 객체**.
- create-next-app 데모(폰트·CSS·마크업)는 지우고 내 코드로 시작해도 된다.

<!-- section: experiment -->
## 직접 해 보기

1. `layout.tsx` / `page.tsx` / `globals.css` 를 위 최소 형태로 정리하고 화면·`<head>` 를 확인.
2. `layout.tsx` 에 `<header>내 앱</header>` 를 `{children}` 위에 추가 → 모든 경로에 헤더가 붙는 것 확인.
3. `app/about/page.tsx` 에 `export const metadata = { title: "소개" }` → `/about` 에서만 탭 제목이 바뀌는지 확인.
4. 페이지를 오가며 개발자도구 Network 를 보고, `layout` 이 다시 요청되지 않는 것을 관찰.

<!-- section: check_question -->
## 이해 점검

1. `layout.tsx` 와 `page.tsx` 중 공통 헤더는 어디에 두나? 왜?
2. `RootLayout` 의 `children` 은 무엇인가?
3. 페이지 제목을 바꾸려면 무엇을 export 하나?
4. `create-next-app` 이 넣은 데모 CSS 를 지워도 되는 이유는?

<!-- section: review -->
## 한 줄 정리

**샘플 앱의 뼈대는 `layout.tsx`(공통 껍데기·안 바뀜) + `page.tsx`(경로별 내용) + `globals.css` 이고,
제목·설명은 `export const metadata` 객체로 선언하면 서버가 `<head>` 에 넣는다 — 데모 코드는 지우고 시작한다.**

<!-- section: next -->
## 다음 Lesson

`routing-and-layout/layout-and-page` — layout·page 로 실제 뼈대 잡기.
