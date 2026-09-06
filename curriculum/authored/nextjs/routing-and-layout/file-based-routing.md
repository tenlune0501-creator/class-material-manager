---
id: nextjs/routing-and-layout/file-based-routing
chapter: nextjs/routing-and-layout
title: 파일 기반 라우팅
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [nextjs, routing, dynamic-routes, link]
related_material_ids:
  - 1KC_ycwHIIj-Lx3RJNT2x7eSQ8mIMWQoJ7VGknVVy2DM   # 05_Routing (2025)
prerequisites:
  - nextjs/routing-and-layout/layout-and-page
  - react/routing/react-router-dom
code_examples:
  - slug: folders
    title: 폴더 = URL
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      src/app/
        page.tsx                 →  /
        about/page.tsx           →  /about
        create/page.tsx          →  /create
        read/[id]/page.tsx       →  /read/1, /read/2, ...   (동적)
        blog/[...slug]/page.tsx  →  /blog/a, /blog/a/b/c     (catch-all)
      # page.tsx 가 있는 폴더만 실제 경로가 된다. 폴더만 있고 page 가 없으면 404.
  - slug: dynamic-param
    title: 동적 세그먼트 값 읽기 (서버 컴포넌트)
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/read/[id]/page.tsx
      export default async function Read({ params }: { params: Promise<{ id: string }> }) {
        const { id } = await params;          // params 는 await 해서 꺼낸다
        return <h2>{id}번 글</h2>;
      }
      // 폴더명이 [id] 이므로 키도 id. [slug] 였다면 params.slug.
      // 값은 항상 string (URL 조각). 숫자로 쓰려면 Number(id).
  - slug: link
    title: 이동은 <Link> 로
    source_type: generated_minimal
    language: tsx
    code: |
      import Link from "next/link";

      <nav>
        <Link href="/">홈</Link>
        <Link href="/create">글쓰기</Link>
        <Link href={`/read/${post.id}`}>{post.title}</Link>
      </nav>
      // <a href> 를 쓰면 전체 페이지가 새로 로드된다. <Link> 는 클라이언트 전환 + 프리페치.
  - slug: not-found
    title: 없는 데이터 → notFound()
    source_type: generated_minimal
    language: tsx
    code: |
      import { notFound } from "next/navigation";

      export default async function Read({ params }: { params: Promise<{ id: string }> }) {
        const { id } = await params;
        const post = await getPost(id);
        if (!post) notFound();               // app/read/[id]/not-found.tsx 또는 기본 404 로
        return <h2>{post.title}</h2>;
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **폴더 구조가 곧 URL** 이라는 규칙으로 정적 경로를 만든다 (`page.tsx` 가 있어야 경로).
- **동적 세그먼트** `[id]` 폴더를 만들고 `params` 에서 값을 읽는다 (`await params`, 값은 항상 `string`).
- `catch-all`(`[...slug]`)의 용도를 안다.
- 이동은 `<a>` 가 아니라 **`next/link` 의 `<Link>`** 로 하고, 없는 리소스는 `notFound()` 로 처리한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/routing-and-layout/layout-and-page`.
- (비교용) `react-router-dom` 의 `<Route path="/read/:id">`, `useParams()`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- react-router 처럼 라우트 테이블을 코드로 관리하려다, Next.js 에선 "폴더를 만들라" 는 규칙과 충돌.
- 글 상세를 `/read?id=1` 쿼리로 만들어서 SEO·공유가 약해진다.
- `<a href="/read/1">` 로 이동해서 매번 전체 새로고침 → 느리고 상태가 날아간다.

<!-- section: concept -->
## 폴더가 URL 이다

{{code: folders}}

- **`page.tsx` 가 있는 폴더 = 접근 가능한 경로.** 폴더만 있고 `page` 가 없으면 그 경로는 404.
- react-router 의 `<Routes>`/`<Route>` 선언이 **폴더 구조로 대체**된다. 라우트 테이블을 따로 안 쓴다.
- `[id]` 처럼 대괄호 = **동적 세그먼트**. `[...slug]` = 여러 조각을 한 번에 받는 catch-all.
- `(group)` 괄호 폴더 = URL 에 안 들어가는 그룹핑용(레이아웃만 나누고 싶을 때).

<!-- section: mechanism -->
## 동적 세그먼트 값 읽기

{{code: dynamic-param}}

- 폴더명 `[id]` → `params.id`. 폴더명이 키다.
- 최신 App Router 에서 `params` 는 **Promise** → `const { id } = await params`
  (서버 컴포넌트에서). 클라이언트 컴포넌트에서는 `useParams()` 훅.
- 값은 **언제나 문자열**(URL 조각). 숫자 연산이 필요하면 `Number(id)`.

### 이동 · 없는 리소스

{{code: link}}

{{code: not-found}}

- **`<Link href>`** — 클라이언트 측 전환(전체 새로고침 없음) + 화면에 보이는 링크를 **미리 프리페치**.
- 프로그래밍 이동은 `"use client"` 에서 `useRouter().push("/...")`.
- 데이터가 없으면 **`notFound()`** 호출 → 가장 가까운 `not-found.tsx` 또는 기본 404 페이지.

<!-- section: must_know -->
## 반드시 기억할 것

- **폴더 = URL.** `page.tsx` 가 있어야 경로. `[id]` = 동적, `[...slug]` = catch-all, `(group)` = URL 안 타는 그룹.
- 동적 값: 서버 컴포넌트 `const { id } = await params`, 클라이언트 `useParams()`. **항상 string.**
- 이동은 **`<Link>`** (클라 전환 + 프리페치). `<a>` 는 전체 새로고침.
- 프로그래밍 이동: `useRouter().push()`. 없는 리소스: `notFound()`.
- 쿼리스트링(`?id=1`) 대신 **경로 세그먼트**(`/read/1`)가 SEO·공유에 유리.

<!-- section: mission -->
## 미션 — 라우팅 구조 잡기

- `app/page.tsx`(홈), `app/create/page.tsx`(글쓰기 폼 자리), `app/read/[id]/page.tsx`(상세).
- 홈에 하드코딩 글 배열을 두고 `<Link href={`/read/${p.id}`}>` 목록 렌더.
- 상세에서 `await params` 로 `id` 를 꺼내 배열에서 찾고, 없으면 `notFound()`.
- `app/read/[id]/not-found.tsx` 를 만들어 "그 글은 없어요" + 홈 링크.
- (선택) `app/(marketing)/about/page.tsx` 로 그룹 폴더가 URL 에 안 들어가는 것 확인.

<!-- section: check_question -->
## 이해 점검

1. `app/products/[category]/page.tsx` 는 어떤 URL 이고 `params` 키는?
2. 폴더는 있는데 `page.tsx` 가 없으면?
3. `<Link>` 와 `<a>` 의 차이는?
4. 상세 페이지에서 해당 글이 없을 때 어떻게 처리하나?

<!-- section: interview_question -->
## 면접 대비

- "react-router 의 라우트 선언과 Next.js 파일 기반 라우팅을 비교해 보세요."
- "동적 라우트에서 `params` 값의 타입은? 왜 그런가요?"

<!-- section: review -->
## 한 줄 정리

**폴더가 URL(`page.tsx` 필수), `[id]` 는 동적 세그먼트로 `await params`/`useParams()` 에서 문자열로 읽고,
이동은 `<Link>`(클라 전환+프리페치)·없는 리소스는 `notFound()` — 라우트 테이블은 폴더 구조가 대신한다.**

<!-- section: next -->
## 다음 Lesson

`routing-and-layout/spa-navigation` — SSR 인데도 SPA 처럼 이동하는 원리.
