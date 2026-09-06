---
id: nextjs/routing-and-layout/spa-navigation
chapter: nextjs/routing-and-layout
title: SPA처럼 이동하기
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [nextjs, spa, client-navigation, prefetch]
related_material_ids:
  - 11d8ppC3NPbP4SpV-5qHBH0JGBwgWAcV3ME5mf5fR4E0   # 06_Single Page Application (2025)
prerequisites:
  - nextjs/routing-and-layout/file-based-routing
code_examples:
  - slug: a-vs-link
    title: <a> → 전체 새로고침 / <Link> → 부분 교체
    source_type: generated_minimal
    language: tsx
    is_canonical: true
    code: |
      // ❌ 전체 문서를 다시 받는다 (모든 JS/CSS 재다운로드, 상태 초기화)
      <a href="/read/2">css</a>

      // ✅ 바뀐 부분(page)만 받아 교체. layout 은 그대로. 스크롤/상태 유지
      import Link from "next/link";
      <Link href="/read/2">css</Link>
  - slug: network
    title: 개발자도구로 확인
    source_type: generated_minimal
    language: text
    code: |
      # DevTools → Network, 속도를 "Slow 3G" 로
      #  <a> 클릭  : document + 모든 청크 재요청, 화면 깜빡임
      #  <Link> 클릭: 해당 라우트의 작은 payload 1건. 이미 방문/프리페치된 곳은 요청 0건
      #
      # DevTools → "Disable JavaScript" 체크 후 첫 로드:
      #  Next.js 는 서버에서 HTML 을 이미 그려 보내므로 내용이 보인다 (SSR).
      #  단, <Link> 클릭 같은 클라 전환은 JS 가 꺼져 있으면 <a> 처럼 전체 로드로 동작.
  - slug: prefetch-router
    title: 프리페치 제어 · 프로그래밍 이동
    source_type: generated_minimal
    language: tsx
    code: |
      <Link href="/heavy" prefetch={false}>무거운 페이지</Link>  {/* 자동 프리페치 끄기 */}

      "use client";
      import { useRouter } from "next/navigation";
      const router = useRouter();
      router.push("/read/1");     // 이동
      router.replace("/login");   // 히스토리 교체
      router.refresh();           // 현재 라우트의 서버 데이터만 다시 가져와 갱신
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Next.js 가 **첫 화면은 SSR(서버가 HTML 완성)**, 이후 이동은 **클라이언트 전환**이라는 하이브리드 모델을 설명한다.
- `<a>` 는 전체 문서 재요청, `<Link>` 는 바뀐 부분만 교체 + 프리페치라는 차이를 개발자도구로 확인한다.
- `prefetch`, `useRouter().push/replace/refresh` 를 언제 쓰는지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/routing-and-layout/file-based-routing` (`<Link>`, 폴더 라우팅).
- CSR(클라 렌더) vs SSR(서버 렌더) 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 옛 CRA 앱: JS 를 끄면 빈 화면. 검색엔진·SNS 미리보기가 약하다.
- 순수 SSR(옛 방식): 메뉴를 누를 때마다 **모든 소스를 재다운로드** → 3G 에서 느리고 깜빡인다.
- Next.js 를 쓰면서도 `<a>` 로 이동하면 위 두 문제를 그대로 떠안는다.

<!-- section: concept -->
## 첫 로드는 서버, 다음 이동은 클라이언트

- **첫 요청** — 서버가 해당 경로의 HTML 을 **완성해서** 보낸다(SSR). JS 가 느리거나 꺼져 있어도 내용이 보인다 →
  검색엔진·공유 미리보기에 유리.
- 그 뒤 브라우저에서 JS 가 붙으면(hydration) 앱이 **SPA 처럼** 동작한다.
- **`<Link>` 클릭** — 전체 문서를 다시 받지 않는다. 바뀌는 **`page` 부분의 데이터만** 받아 갈아 끼운다.
  `layout`(네비·헤더)은 그대로 → 스크롤·입력 상태 유지, 깜빡임 없음.

{{code: a-vs-link}}

<!-- section: mechanism -->
## <a> 와 <Link> 를 눈으로 비교

{{code: network}}

- `<a href>` : document 부터 모든 청크 재요청. 이미 방문한 링크도 다시 받는다.
- `<Link>` : 화면에 보이는 링크의 목적지를 **미리 프리페치**해 둔다 → 클릭 시 요청 0건이거나 아주 작은 payload.
- 같은 구역 안에서 이동하면 **공통 `layout` 은 다시 실행되지 않고** 그 아래 `page` 만 바뀐다.

### 프리페치·프로그래밍 이동

{{code: prefetch-router}}

- 목록이 아주 길거나 목적지가 무거우면 `prefetch={false}` 로 자동 프리페치를 끈다.
- 폼 제출 후 이동 등은 `"use client"` 컴포넌트에서 `useRouter().push()`.
- `router.refresh()` — URL 은 그대로 두고 **현재 라우트의 서버 데이터만** 다시 가져와 갱신(글 작성 후 목록 새로고침 등).

<!-- section: must_know -->
## 반드시 기억할 것

- Next.js = **첫 화면 SSR + 이후 클라이언트 전환**. JS 꺼져도 첫 화면은 보인다.
- `<a>` = 전체 문서 재요청. `<Link>` = 바뀐 `page` 만 교체 + 프리페치. **내부 이동은 무조건 `<Link>`**.
- 같은 구역 이동 시 공통 `layout` 은 리렌더 안 됨.
- `prefetch={false}` 로 프리페치 제어. `useRouter()` 의 `push`/`replace`/`refresh`.
- `refresh()` = 현재 라우트의 서버 데이터만 다시 가져오기.

<!-- section: experiment -->
## 직접 해 보기

1. 네비 링크 하나를 `<a href>`, 하나를 `<Link href>` 로 두고 Network(Slow 3G)에서 클릭 비교.
2. 이미 방문한 `<Link>` 를 다시 클릭 → 요청이 거의 없는지 확인.
3. "Disable JavaScript" 후 새로고침 → 내용이 보이는지(SSR), 그 상태에서 `<Link>` 클릭이 전체 로드로 바뀌는지 확인.
4. 글 목록에서 `prefetch={false}` 를 준 링크와 안 준 링크의 프리페치 요청 차이를 관찰.

<!-- section: check_question -->
## 이해 점검

1. JS 를 끈 채 Next.js 앱 첫 화면에 내용이 보이는 이유는?
2. `<Link>` 클릭이 `<a>` 보다 빠른 두 가지 이유는?
3. 같은 구역에서 페이지를 이동하면 `layout` 은 다시 실행되나?
4. 글 작성 후 목록만 갱신하고 싶다. 무엇을 호출하나?

<!-- section: review -->
## 한 줄 정리

**Next.js 는 첫 화면을 서버가 완성해 보내고(SSR) 그 뒤 이동은 `<Link>` 로 바뀐 `page` 부분만 교체 + 프리페치해
SPA 처럼 동작한다 — `<a>` 는 전체 새로고침, 데이터만 다시 받으려면 `router.refresh()`.**

<!-- section: next -->
## 다음 Lesson

`assets-and-styling/public-assets` — 이미지·스크립트 같은 정적 자원.
