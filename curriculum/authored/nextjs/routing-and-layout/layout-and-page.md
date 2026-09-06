---
id: nextjs/routing-and-layout/layout-and-page
chapter: nextjs/routing-and-layout
title: layout과 page로 뼈대 만들기
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [nextjs, layout, page, app-router]
related_material_ids:
  - 18CUxbf3--TfKOVa6o4monPBZTPUeejSS6m9DzcZSZMU   # 04_뼈대 만들기 - layout & page (2025)
prerequisites:
  - nextjs/app-setup/sample-app-structure
  - react/components-and-props/passing-props
project_links:
  - unit: momentalk/app-router-page-metadata
    note: 서버 컴포넌트 page.jsx가 metadata를 선언하고 실제 UI는 클라이언트 컴포넌트에 위임
code_examples:
  - slug: root-layout
    title: 최상위 layout — 모든 페이지 공통
    source_type: generated_minimal
    language: tsx
    is_canonical: true
    code: |
      // src/app/layout.tsx
      import "./globals.css";
      import Link from "next/link";

      export const metadata = { title: "WEB", description: "학습용 게시판" };

      export default function RootLayout({ children }: { children: React.ReactNode }) {
        return (
          <html lang="ko">
            <body>
              <nav className="navbar">
                <Link href="/" className="brand">WEB</Link>
                <Link href="/read/1">html</Link>
                <Link href="/read/2">css</Link>
              </nav>
              <main className="container">{children}</main>
            </body>
          </html>
        );
      }
  - slug: page
    title: page — 그 경로의 내용
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/page.tsx  →  "/"
      export default function Home() {
        return (
          <>
            <h2>Welcome</h2>
            <p>왼쪽 메뉴에서 글을 선택하세요.</p>
          </>
        );
      }
  - slug: nested-layout
    title: 중첩 layout — 특정 구역만 감싸기
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/read/layout.tsx  →  /read/* 아래에만 적용
      export default function ReadLayout({ children }: { children: React.ReactNode }) {
        return (
          <section className="article">
            <aside>목차</aside>
            <article>{children}</article>   {/* read/[id]/page.tsx 가 여기로 */}
          </section>
        );
      }
      // 최종 화면: RootLayout > ReadLayout > read/[id]/page
  - slug: per-page-metadata
    title: 경로별 metadata
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/read/[id]/page.tsx  (서버 컴포넌트)
      export const metadata = { title: "글 읽기 · WEB" };

      export default function Read() {
        return <h2>글 본문</h2>;
      }
      // 동적 제목이 필요하면 generateMetadata({ params }) 함수를 대신 export 한다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `layout.tsx` 와 `page.tsx` 의 역할을 정확히 나눠 뼈대를 만든다.
- **중첩 layout**(`app/read/layout.tsx`)으로 특정 구역만 감싸고, `RootLayout > 중첩 layout > page` 로 겹치는 구조를 안다.
- 공통 네비게이션을 `RootLayout` 에 한 번만 두고, 페이지 전환 시 `layout` 이 다시 안 그려지는 것을 이용한다.
- 경로별 `metadata` (정적/`generateMetadata`)를 선언한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/app-setup/*`, React `children` 패턴, `next/link` 의 `<Link>`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 헤더/네비/푸터를 페이지마다 복붙 → 하나 고치면 다 고쳐야 한다.
- 페이지 전환마다 네비까지 다시 렌더돼서 깜빡이거나 스크롤이 튄다.
- "글 목록 구역만 사이드바를 붙이고 싶다" 를 조건부 렌더로 처리하다 지저분해진다.

<!-- section: concept -->
## layout = 껍데기, page = 내용

{{code: root-layout}}

{{code: page}}

- **`layout.tsx`** — 자식들을 `{children}` 으로 받아 감싼다. 그 폴더와 **하위 전체**에 적용.
  최상위(`app/layout.tsx`)는 `<html>`/`<body>` 를 반드시 포함.
- **`page.tsx`** — 그 경로에서 실제로 보이는 것. `layout` 의 `{children}` 자리에 꽂힌다.
- 페이지를 이동해도 **layout 은 유지**(리렌더 X) → 네비·스크롤 위치가 안 튄다. 공통 UI 는 전부 layout 으로.
- 둘 다 기본은 **서버 컴포넌트**. `useState`·이벤트가 필요한 부분만 `"use client"` 컴포넌트로 떼어 낸다.

<!-- section: mechanism -->
## 중첩 layout — 겹쳐서 감싼다

{{code: nested-layout}}

- `app/read/layout.tsx` 는 `/read/*` **아래에만** 적용된다.
- 렌더 결과는 바깥→안: **`RootLayout` → `ReadLayout` → `read/[id]/page`**.
- "이 구역만 사이드바", "이 구역만 인증 필요" 같은 요구를 폴더 단위로 깔끔하게 해결한다.
- 같은 폴더에 `loading.tsx`(로딩 UI), `error.tsx`(에러 UI), `not-found.tsx` 도 예약 파일로 둘 수 있다.

### 경로별 metadata

{{code: per-page-metadata}}

- 서버 컴포넌트 `page.tsx` 에서 `export const metadata` → 그 경로의 `<title>`·`<meta>`.
- 값이 데이터에 따라 달라지면 `export async function generateMetadata({ params }) { ... }`.
- **클라이언트 컴포넌트(`"use client"`)에서는 `metadata` 를 export 할 수 없다** → 서버인 `page.tsx` 가
  `metadata` 를 선언하고 UI 를 클라이언트 컴포넌트에 넘기는 패턴을 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- `layout` = 자식을 `{children}` 으로 감싸는 껍데기(그 폴더+하위 전체, 리렌더 X). `page` = 경로별 내용.
- 최상위 `app/layout.tsx` 는 `<html>`/`<body>` 필수. 공통 네비/헤더/푸터는 여기 한 번만.
- **중첩 layout** = 폴더에 `layout.tsx` → 그 구역만 추가로 감싼다. `Root → 중첩 → page` 순서로 겹침.
- `metadata` 는 **서버 컴포넌트에서만** export. 동적이면 `generateMetadata`.
- 예약 파일: `layout` `page` `loading` `error` `not-found`.

<!-- section: mission -->
## 미션 — 게시판 뼈대

App Router + TS. 아직 데이터는 하드코딩해도 된다.

- `app/layout.tsx` : 상단 네비(`홈`, `글쓰기`) + `{children}`. `metadata` 로 사이트 제목.
- `app/page.tsx` : 환영 화면.
- `app/read/layout.tsx` : `/read/*` 구역에 사이드바(목차 자리)를 붙이는 중첩 layout.
- `app/read/[id]/page.tsx` : `params.id` 를 그대로 출력 + `generateMetadata` 로 `"글 {id} · 제목"`.
- 네비로 페이지를 오가며 **네비가 다시 안 그려지는 것**을 개발자도구로 확인하고 한 줄로 적어 두기.

<!-- section: check_question -->
## 이해 점검

1. 공통 네비를 `page` 마다 두면 안 되는 이유는? `layout` 에 두면 무엇이 좋아지나?
2. `app/read/layout.tsx` 는 어디에 적용되나? 렌더 순서는?
3. 클라이언트 컴포넌트에서 `export const metadata` 가 안 되는 이유와 우회법은?
4. 제목이 글 데이터에 따라 달라져야 하면 무엇을 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "App Router 의 중첩 레이아웃을 어떻게 활용했나요?"
- "페이지 전환 시 레이아웃이 유지된다는 게 왜 이점인가요?"

<!-- section: review -->
## 한 줄 정리

**`layout.tsx` 는 `{children}` 을 감싸는(그 폴더+하위, 리렌더 안 되는) 껍데기, `page.tsx` 는 경로별 내용 —
폴더마다 `layout` 을 두면 `Root → 중첩 → page` 로 겹치고, `metadata` 는 서버 컴포넌트에서 정적/`generateMetadata` 로 선언한다.**

<!-- section: next -->
## 다음 Lesson

`routing-and-layout/file-based-routing` — 폴더로 URL 만들기, 동적 경로.
