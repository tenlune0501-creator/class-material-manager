---
id: class-material-manager/viewer-app-router
project: class-material-manager
title: 뷰어 — Next.js 16 App Router 읽기 전용 화면
unit_kind: feature
feature_area: 뷰어
concepts: [App Router, 서버 컴포넌트, 동적 라우트, 입력 검증, 읽기 전용 설계]
related_lessons:
  - nextjs/routing-and-layout/file-based-routing
  - nextjs/routing-and-layout/layout-and-page
  - react/seo-and-rendering/csr-vs-ssr
  - nextjs/data-and-backend/json-as-backend
---

<!-- section: role -->
## 이 코드가 하는 일

`viewer/app/**` — 홈, 자료 상세(`/m/[docId]`), 참조(`/r/[subject]/[slug]`), 학습설명(`/s/[subject]`),
비교, 검색, 커리큘럼(`/learn`), 실전 예제(`/examples/[id]`) 화면. 전부 **서버 컴포넌트** 로 데이터를 읽어
그린다. **쓰기·삭제 코드가 없다.**

<!-- section: where -->
## 라우트 구조

```
viewer/app/
  page.tsx              /            홈
  learn/page.tsx        /learn       커리큘럼 (Track/Chapter/Lesson)
  m/[docId]/page.tsx    /m/<id>      수업자료 상세  (동적 세그먼트)
  r/[subject]/[slug]/   /r/<s>/<sl>  공식문서 참조 (중첩 동적)
  s/[subject]/page.tsx  /s/<s>       과목별 학습설명
  examples/[id]/        /examples/<id> 실전 예제 상세
  login/                /login       로그인 폼
```

<!-- section: flow -->
## 한 화면이 그려지는 순서

1. `proxy.ts` 가 세션 확인/갱신(로그인 안 됐으면 `/login`).
2. App Router가 경로 → `page.tsx`(async 서버 컴포넌트) 선택.
3. `page.tsx` 가 `params` 를 `await` 해서 id를 얻고, **`data/index.json` 과 대조** 한 뒤에만 파일/DB를 읽는다.
4. 없는 id면 `notFound()` → 404.

<!-- section: code -->
## 핵심 패턴 (동적 라우트 + 검증)

```tsx
export default async function MaterialPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;                    // Next 16: params 는 Promise
  const found = await getMaterial(decodeURIComponent(docId));
  if (!found) notFound();                            // index.json 에 없으면 404
  return <>{/* 읽어온 데이터로 렌더 */}</>;
}
```

<!-- section: why -->
## 왜 읽기 전용인가

이 뷰어의 유일한 임무는 "만들어진 자료를 보여주기" 다. 자료 생성·수정은 CLI 파이프라인의 몫이다.
그래서 뷰어에는 `INSERT`/`UPDATE`/파일 쓰기 경로가 아예 없다 — 공격 표면이 작아진다.

<!-- section: framework_role -->
## Next.js 16 App Router 가 대신하는 것

- 폴더 = URL, `[param]` = 동적 세그먼트, `page.tsx` = 화면.
- 서버 컴포넌트가 기본 → 데이터 읽기를 `await` 로 바로 쓴다(클라이언트 fetch 왕복 없음).
- `middleware.ts` 가 `proxy.ts` 로 이름이 바뀌었다(역할 동일 — `node_modules/next/dist/docs` 안내 따름).

<!-- section: related_lesson -->
## 이어지는 Lesson

- `nextjs/routing-and-layout/file-based-routing`, `.../layout-and-page` — App Router 규칙
- `react/seo-and-rendering/csr-vs-ssr` — 서버 렌더링
- `nextjs/data-and-backend/json-as-backend` — 파일을 데이터 소스로

<!-- section: caution -->
## 주의점

- 주소의 id를 검증 없이 파일 경로에 쓰면 경로 탈출 위험 — 반드시 `index.json` 화이트리스트와 대조.
- Next 16에서 `params` 는 **Promise** 다 — `await params` 를 잊으면 타입 에러.

<!-- section: experiment -->
## 작은 실습

1. `/m/없는id` 로 접속해 404가 나는지 확인하고, `notFound()` 를 지우면 어떻게 되는지 관찰하라.
2. `viewer/app` 에서 서버 컴포넌트와 클라이언트 컴포넌트(`"use client"`)를 각각 찾아 목록화하라.
3. 새 라우트 `viewer/app/projects/page.tsx` 를 만들면 `/projects` 가 자동 생기는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 뷰어가 "읽기 전용" 이라는 게 코드에서 어떻게 드러나나?
2. 동적 라우트에서 id를 파일에 쓰기 전에 왜 `index.json` 과 대조하나?
3. Next 16에서 `params` 의 타입은?

<!-- section: review -->
## 한 줄 정리

**뷰어는 App Router 서버 컴포넌트로만 이뤄져 있고, 동적 세그먼트의 id를 `index.json` 화이트리스트와
대조한 뒤에만 데이터를 읽으며, 쓰기·삭제 경로가 존재하지 않는다.**
