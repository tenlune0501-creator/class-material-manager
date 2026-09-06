---
id: nextjs/data-and-backend/caching
chapter: nextjs/data-and-backend
title: 캐시 동작 이해하기
mastery: understand
lesson_kind: lesson
estimated_minutes: 35
tags: [nextjs, cache, revalidate, fetch-cache]
related_material_ids:
  - 1HTav7144_WnoqG0Te0XTdp_umBFWwvU1dUPtbt6FxbE   # 13_cache
prerequisites:
  - nextjs/data-and-backend/json-as-backend
code_examples:
  - slug: symptom
    title: 증상 — 데이터를 바꿨는데 화면이 안 바뀐다
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      # db.json 을 고쳐도 목록이 그대로다. 왜?
      #  → Next.js 는 서버 렌더 결과와 fetch 응답을 .next/ 에 캐시하고 재사용한다.
      #  개발 중 강제로 비우려면: 서버 끄고 .next/ 폴더 삭제 후 npm run dev
      #  (근본 해결은 아래의 캐시 옵션)
  - slug: per-fetch
    title: fetch 단위로 캐시 제어
    source_type: generated_minimal
    language: ts
    code: |
      // 매 요청마다 새로 (캐시 안 함) — 자주 바뀌는 데이터
      await fetch(url, { cache: "no-store" });

      // N초 동안 캐시, 지나면 백그라운드에서 갱신 (ISR 스타일)
      await fetch(url, { next: { revalidate: 60 } });

      // 기본값: 정적으로 캐시 (빌드 시 또는 최초 1회) — 거의 안 바뀌는 데이터
      await fetch(url);
  - slug: per-route
    title: 라우트(page/layout) 단위 옵션
    source_type: generated_minimal
    language: ts
    code: |
      // src/app/read/[id]/page.tsx 상단
      export const revalidate = 60;        // 이 라우트의 데이터 60초마다 재검증
      export const dynamic = "force-dynamic"; // 항상 요청 시 렌더 (= 모든 fetch no-store 느낌)
      // 반대로 "force-static" 은 항상 정적으로.
  - slug: on-demand
    title: 쓰기 후 즉시 반영 — 온디맨드 재검증 / refresh
    source_type: generated_minimal
    language: ts
    code: |
      // 서버(Route Handler / Server Action)에서: 특정 경로·태그만 콕 집어 무효화
      import { revalidatePath, revalidateTag } from "next/cache";
      revalidatePath("/");            // "/" 를 다음 방문 때 새로 렌더
      revalidateTag("topics");        // fetch(url, { next: { tags: ["topics"] } }) 를 무효화

      // 클라이언트에서: 현재 라우트의 서버 데이터만 다시 가져오기
      "use client";
      import { useRouter } from "next/navigation";
      useRouter().refresh();          // 글 작성/삭제 후 목록 갱신에 자주 씀
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- "데이터를 바꿨는데 화면이 그대로" 의 원인이 **Next.js 캐시**임을 안다.
- `fetch` 옵션(`cache: "no-store"` / `next: { revalidate }`) 과 라우트 옵션(`export const revalidate` / `dynamic`)으로 캐시를 제어한다.
- 쓰기(작성·수정·삭제) 후 화면을 즉시 갱신하는 방법(`revalidatePath`/`revalidateTag`, `router.refresh()`)을 안다.
- **정확한 최신값 vs 속도** 트레이드오프를 데이터 성격에 맞게 고른다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/data-and-backend/json-as-backend` (서버 컴포넌트 `fetch`, Route Handler).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `db.json` 을 고쳐도, 글을 새로 써도 목록이 안 바뀌어서 "버그" 라고 착각한다.
- 반대로 모든 fetch 를 `no-store` 로 막아 버려서, 안 바뀌는 데이터까지 매번 다시 받아 느려진다.
- 글 작성은 됐는데 목록 페이지엔 안 보여서 새로고침을 눌러야 한다.

<!-- section: concept -->
## Next.js 는 기본적으로 캐시한다

{{code: symptom}}

- App Router 는 성능을 위해 **서버 렌더 결과와 `fetch` 응답**을 `.next/` 에 저장하고 재사용한다.
- 개발 중 임시로는 서버를 끄고 `.next/` 를 지우면 되지만, 그건 근본 해결이 아니다 →
  **데이터 성격에 맞는 캐시 옵션**을 코드로 지정하는 게 맞다.
- 버전에 따라 기본 동작·API 이름이 조금씩 다르다(예: `revalidate`, 또는 `"use cache"` + `cacheLife`).
  핵심 개념(캐시함 / 안 함 / N초마다 갱신 / 콕 집어 무효화)은 동일하다.

<!-- section: mechanism -->
## 제어하는 세 층위

{{code: per-fetch}}

- **`cache: "no-store"`** — 이 fetch 는 캐시 안 함. 매 요청 최신. (댓글, 재고, 대시보드)
- **`next: { revalidate: N }`** — N초 캐시, 지나면 다음 요청 때 백그라운드로 갱신(오래된 값 잠깐 보여주고 교체).
- **옵션 없음** — 정적 캐시. 거의 안 바뀌는 것(문서, 공지).

{{code: per-route}}

- 페이지/레이아웃 파일 상단에서 `export const revalidate` / `export const dynamic` 으로 그 라우트 전체를 한 번에.

{{code: on-demand}}

- 쓰기 후 **콕 집어 무효화**: 서버에서 `revalidatePath("/")` 나 `revalidateTag("topics")`.
  (`fetch` 에 `next: { tags: ["topics"] }` 를 달아 두면 태그로 묶어 무효화)
- 클라이언트에서 폼 제출 직후엔 `useRouter().refresh()` — 현재 라우트의 서버 데이터만 다시 가져온다.
- 주의: 공통 `layout` 은 페이지 이동만으로는 다시 실행되지 않는다. 목록이 `layout` 에 있다면 `refresh()` 나
  재검증이 필요하다.

<!-- section: must_know -->
## 반드시 기억할 것

- Next.js 는 **기본적으로 캐시**한다 → "안 바뀐다" 는 대개 버그가 아니라 캐시.
- 자주 바뀜 → `cache: "no-store"`. 가끔 바뀜 → `next: { revalidate: N }`. 거의 안 바뀜 → 옵션 없음.
- 라우트 전체는 `export const revalidate` / `export const dynamic = "force-dynamic"`.
- 쓰기 후 즉시 반영: 서버 `revalidatePath`/`revalidateTag`, 클라이언트 `router.refresh()`.
- `.next/` 삭제는 개발 중 임시방편. 코드로 옵션을 지정하는 게 정답.

<!-- section: experiment -->
## 직접 해 보기

1. 목록 fetch 를 옵션 없이 → `db.json` 을 고쳐도 안 바뀌는 것 확인.
2. `cache: "no-store"` 로 바꾸고 다시 → 새로고침마다 반영되는지 확인.
3. `next: { revalidate: 10 }` 로 바꾸고 10초 전/후의 동작 차이 관찰.
4. Route Handler 의 `POST` 성공 뒤 `revalidatePath("/")` 를 호출하고, 목록에 바로 뜨는지 확인.
5. 클라이언트 폼에서 제출 후 `router.refresh()` 유무에 따른 차이 확인.

<!-- section: check_question -->
## 이해 점검

1. 데이터를 바꿨는데 화면이 그대로다. 가장 먼저 의심할 것은?
2. 1분 정도 지난 데이터는 괜찮은 목록에는 어떤 옵션이 맞나?
3. `revalidatePath` 와 `router.refresh()` 의 차이는?
4. 모든 fetch 를 `no-store` 로 하면 무엇을 잃나?

<!-- section: review -->
## 한 줄 정리

**Next.js 는 fetch·렌더 결과를 기본 캐시하므로, 데이터 성격에 맞게 `no-store`(항상 최신) / `revalidate: N`(N초 갱신) /
무옵션(정적)을 고르고, 쓰기 후엔 `revalidatePath`·`revalidateTag`·`router.refresh()` 로 콕 집어 무효화한다.**

<!-- section: next -->
## 다음 Lesson

`board-crud/list-and-read` — 목록·상세를 실제로 구현.
