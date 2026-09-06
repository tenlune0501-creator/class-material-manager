---
id: nextjs/board-crud/list-and-read
chapter: nextjs/board-crud
title: 글 목록과 읽기
mastery: practical
lesson_kind: lesson
estimated_minutes: 55
tags: [nextjs, crud, list, detail, practice]
related_material_ids:
  - 1Cgfdp8l6wbW5DT_EsZk3nVpqLj8LYrbWDDlComch6u0   # 10_글목록 출력하기
  - 1LPMDi2RwM3ycFYpP9OryTvWrpgTHDiZ9WtimuO5UdSk   # 11_글 읽기
prerequisites:
  - nextjs/data-and-backend/json-as-backend
  - nextjs/data-and-backend/caching
  - react/rendering-logic/lists-and-keys
code_examples:
  - slug: old-client-way
    title: 예전 코드 — layout 을 "use client" 로 만들어 목록 fetch
    source_type: generated_minimal
    language: tsx
    is_canonical: true
    code: |
      // 강사 자료에서 처음 시도한 방식
      "use client";
      import { useEffect, useState } from "react";
      // export const metadata = {...}  ← 클라이언트 컴포넌트에선 에러

      export default function RootLayout({ children }) {
        const [topics, setTopics] = useState([]);
        useEffect(() => {
          fetch("http://localhost:9999/topics").then((r) => r.json()).then(setTopics);
        }, []);
        return (
          <html lang="ko"><body>
            <nav>{topics.map((t) => <a key={t.id} href={`/read/${t.id}`}>{t.title}</a>)}</nav>
            {children}
          </body></html>
        );
      }
      // 문제: (1) metadata 못 씀 (2) JS 꺼지면 목록 안 뜸
      //      (3) DB 접속정보가 브라우저 코드로 노출될 수 있음 (4) 로딩 깜빡임
  - slug: server-list
    title: 서버 컴포넌트로 목록 (권장)
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/layout.tsx  — 서버 컴포넌트 그대로
      import Link from "next/link";
      export const metadata = { title: "WEB" };   // 서버라서 가능

      async function getTopics() {
        const res = await fetch(`${process.env.API_URL}/topics`, { cache: "no-store" });
        if (!res.ok) throw new Error("목록 조회 실패");
        return res.json() as Promise<{ id: string; title: string }[]>;
      }

      export default async function RootLayout({ children }: { children: React.ReactNode }) {
        const topics = await getTopics();       // 서버에서 fetch → HTML 완성
        return (
          <html lang="ko"><body>
            <nav>
              <Link href="/">WEB</Link>
              {topics.map((t) => <Link key={t.id} href={`/read/${t.id}`}>{t.title}</Link>)}
            </nav>
            <main>{children}</main>
          </body></html>
        );
      }
  - slug: server-detail
    title: 상세 페이지 — 서버 컴포넌트 + params
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/read/[id]/page.tsx
      import { notFound } from "next/navigation";

      export default async function Read({ params }: { params: Promise<{ id: string }> }) {
        const { id } = await params;
        const res = await fetch(`${process.env.API_URL}/topics/${id}`, { cache: "no-store" });
        if (res.status === 404) notFound();
        if (!res.ok) throw new Error("글 조회 실패");
        const topic: { title: string; message: string } = await res.json();
        return (
          <article>
            <h2>{topic.title}</h2>
            <p>{topic.message}</p>
          </article>
        );
      }

      export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
        const { id } = await params;
        return { title: `글 ${id} · WEB` };
      }
  - slug: loading-error
    title: 로딩·에러 UI (예약 파일)
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/read/[id]/loading.tsx   — fetch 대기 중 자동 표시
      export default function Loading() { return <p>불러오는 중…</p>; }

      // src/app/read/[id]/error.tsx     — throw 시 자동 표시 (클라이언트 컴포넌트여야 함)
      "use client";
      export default function Error({ reset }: { error: Error; reset: () => void }) {
        return <div><p>글을 불러오지 못했어요.</p><button onClick={reset}>다시</button></div>;
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 예전 코드가 **왜** `layout` 을 `"use client"` + `useEffect` 로 만들었는지, 그 방식의 한계 4가지를 설명한다.
- 목록과 상세를 **서버 컴포넌트**로 구현한다: `layout` 에서 목록 fetch, `read/[id]/page.tsx` 에서 `await params` + 단건 fetch.
- 없는 글은 `notFound()`, 실패는 `throw` → `loading.tsx`/`error.tsx`/`not-found.tsx` 예약 파일로 UI 를 붙인다.
- 언제 클라이언트 컴포넌트가 필요한지(검색창, 좋아요 버튼 등) 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/data-and-backend/json-as-backend`, `nextjs/data-and-backend/caching`.
- React 리스트 렌더·`key`, `useEffect` 패턴(비교용).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- React 습관대로 `useEffect` 로 목록을 불러오다 `metadata` 를 못 쓰고, JS 꺼진 첫 로드에 빈 화면.
- 상세를 클라이언트에서 불러와서 SEO·공유 미리보기가 약하다.
- 로딩·에러 상태를 매 컴포넌트에서 `if (loading)` / `if (error)` 로 반복한다.

<!-- section: concept -->
## 예전 방식과 그 한계

{{code: old-client-way}}

강사 자료는 처음에 `layout` 을 클라이언트 컴포넌트로 만들어 `useEffect` 로 목록을 불러왔다. 그리고 곧 되돌린다. 이유:

1. **`metadata` 를 export 할 수 없다** — 클라이언트 컴포넌트라서.
2. **JS 가 꺼지거나 늦으면 목록이 안 뜬다** — 데이터가 브라우저에서만 채워지므로.
3. **DB 접속정보·키가 브라우저 코드로 노출**될 수 있다 — fetch 로직이 클라이언트 번들에 들어간다.
4. **로딩 깜빡임** — 빈 목록 → 채워짐.

→ "목록/상세처럼 **보여주기만 하는** 화면은 서버 컴포넌트" 가 App Router 의 기본값이다. 예전에 `useEffect` 로
쓰던 코드를, 이제는 **서버에서 직접 `await fetch`** 로 옮긴다.

<!-- section: mechanism -->
## 서버 컴포넌트로 목록·상세

{{code: server-list}}

- `layout.tsx` 는 서버 컴포넌트 그대로. 함수 본문에서 `await fetch` → 결과로 HTML 을 완성해 보낸다.
- `metadata` 도 그대로 export 가능.
- 캐시는 데이터 성격에 맞게(`caching` Lesson): 게시판 목록은 보통 `no-store` 또는 짧은 `revalidate`.

{{code: server-detail}}

- 상세는 `read/[id]/page.tsx` 에서 `const { id } = await params` → 단건 fetch.
- `404` → `notFound()` (가장 가까운 `not-found.tsx`). 그 외 실패는 `throw` → `error.tsx`.
- 제목은 `generateMetadata` 로 글마다 다르게.

{{code: loading-error}}

- **`loading.tsx`** — 그 구역의 서버 컴포넌트가 데이터를 기다리는 동안 자동 표시(Suspense 경계).
- **`error.tsx`** — 렌더 중 에러가 던져지면 자동 표시. `"use client"` 필수, `reset()` 으로 재시도.
- 덕분에 컴포넌트마다 `if (loading)` 분기를 안 써도 된다.

### 클라이언트가 필요한 곳

- 검색창(입력·필터), 좋아요/북마크 버튼, 무한 스크롤 등 **상호작용**만 `"use client"` 컴포넌트로 떼어
  `layout`/`page`(서버) 안에 심는다. 서버 컴포넌트 안에 클라이언트 컴포넌트를 넣는 건 자유.

<!-- section: must_know -->
## 반드시 기억할 것

- 보여주기 화면(목록·상세) = **서버 컴포넌트 + `await fetch`**. `useEffect` 로 안 옮긴다.
- 클라이언트 `layout` 의 대가: `metadata` 불가, JS 의존, 시크릿 노출, 깜빡임.
- 상세 = `await params` + 단건 fetch. `404` → `notFound()`, 실패 → `throw`.
- 예약 파일: `loading.tsx`(대기), `error.tsx`(`"use client"`, 에러+`reset`), `not-found.tsx`.
- 상호작용 부분만 `"use client"` 컴포넌트로 분리해 서버 컴포넌트 안에 배치.

<!-- section: mission -->
## 미션 — 게시판 목록 + 읽기

`json-server`(9999) 또는 이전 Lesson 의 Route Handler 를 백엔드로.

- `layout.tsx`(서버): 상단 네비에 글 목록(`<Link href={`/read/${id}`}>`), 사이트 `metadata`.
- `app/read/[id]/page.tsx`(서버): 단건 조회, `notFound()` 처리, `generateMetadata` 로 제목.
- `app/read/[id]/loading.tsx`, `app/read/[id]/error.tsx`, `app/read/[id]/not-found.tsx` 각각 작성.
- `app/page.tsx`: 최신 글 5개 카드.
- (선택) `components/SearchBox.tsx`(`"use client"`)로 제목 필터 — 서버가 준 목록을 클라이언트에서 거르기.
- 마지막에 "예전 `useEffect` 방식 대비 무엇이 나아졌는지" 3줄로 정리.

<!-- section: check_question -->
## 이해 점검

1. 목록을 `useEffect` 로 불러오던 코드를 서버 컴포넌트로 옮기면 좋아지는 점 3가지는?
2. 클라이언트 컴포넌트에서 `export const metadata` 가 안 되는 이유는?
3. `loading.tsx` 와 `error.tsx` 는 각각 언제 자동으로 뜨나? `error.tsx` 의 제약은?
4. 검색창은 왜 `"use client"` 여야 하나? 목록 데이터는 어디서 오나?

<!-- section: interview_question -->
## 면접 대비

- "목록/상세 페이지를 서버 컴포넌트로 만드는 이유를 설명해 보세요."
- "`loading.tsx`/`error.tsx` 예약 파일이 컴포넌트 코드를 어떻게 단순하게 만드나요?"

<!-- section: review -->
## 한 줄 정리

**목록·상세는 서버 컴포넌트에서 `await fetch` 로 그린다 — 예전 `"use client"` + `useEffect` `layout` 은 `metadata` 불가·
JS 의존·시크릿 노출·깜빡임이 있었고, 없는 글은 `notFound()`, 대기·에러는 `loading.tsx`/`error.tsx` 예약 파일로 처리한다.**

<!-- section: next -->
## 다음 Lesson

`board-crud/create-update-delete` — 폼으로 쓰고 고치고 지우기.
