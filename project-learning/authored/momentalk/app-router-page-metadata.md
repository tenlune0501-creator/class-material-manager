---
id: momentalk/app-router-page-metadata
project: momentalk
title: App Router page — 서버 컴포넌트가 metadata 선언, 클라이언트에 위임
unit_kind: feature
feature_area: 라우팅
concepts: [Next.js App Router, page.jsx, 정적 metadata, 서버/클라이언트 컴포넌트 경계, 라우팅]
related_lessons:
  - nextjs/routing-and-layout/file-based-routing
  - nextjs/routing-and-layout/layout-and-page
  - react/seo-and-rendering/csr-vs-ssr
  - react/seo-and-rendering/react-seo
---

<!-- section: role -->
## 이 코드가 하는 일

`src/app/game/chosung-quiz/page.jsx` — `/game/chosung-quiz` 라우트의 **진입 파일**. 이 파일은
`"use client"` 가 없는 **서버 컴포넌트** 라 `export const metadata` 로 SEO/OG 정보를 선언하고, 실제
상호작용은 `"use client"` 가 붙은 `<ChosungQuiz />` 에 넘긴다. 전체 코드는 실전 예제 `momentalk-app-router-page-metadata`.

<!-- section: code -->
## 핵심 코드 읽기

```jsx
import ChosungQuiz from "@/components/games/ChosungQuiz";
import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "초성 퀴즈";
const DESCRIPTION = "직접 문제를 내고 초성 힌트로 맞히는 퀴즈 게임입니다.";

export const metadata = {                       // ← 서버 컴포넌트만 할 수 있다
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({ title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION }),
};

export default function ChosungQuizPage() {
  return <ChosungQuiz />;                       // 상호작용은 "use client" 컴포넌트로
}
```

<!-- section: flow -->
## 렌더 흐름

1. 브라우저가 `/game/chosung-quiz` 요청 → App Router가 `app/game/chosung-quiz/page.jsx` 를 고른다.
2. 서버에서 `metadata` 를 읽어 `<head>` 에 title·description·OG 태그를 넣는다.
3. `<ChosungQuiz />`(클라이언트 컴포넌트)가 브라우저에서 hydrate되어 상태·이벤트가 살아난다.

<!-- section: why -->
## 왜 이렇게 나눴나

- `metadata` 는 **서버에서 HTML을 만들 때** 필요하다(크롤러·미리보기용). 그래서 서버 컴포넌트가 선언한다.
- `useState`/`onClick` 같은 상호작용은 브라우저에서만 의미가 있다 → `"use client"` 로 명시.
- `page.jsx` 를 얇게 두면 "이 경로는 무엇 + SEO는 무엇" 만 보이고, 구현은 컴포넌트로 분리된다.

<!-- section: framework_role -->
## Next.js App Router 가 대신하는 것

- **폴더 = 경로**: `app/game/chosung-quiz/` → `/game/chosung-quiz`. 라우터 설정 파일이 없다.
- `page.jsx` = 그 경로의 화면, `export const metadata` = 그 경로의 `<head>`.
- 기본이 서버 컴포넌트라, 클라이언트가 필요한 곳에만 `"use client"` 를 붙인다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `nextjs/routing-and-layout/file-based-routing` — 폴더 = URL
- `nextjs/routing-and-layout/layout-and-page` — layout/page 역할
- `react/seo-and-rendering/csr-vs-ssr`, `react/seo-and-rendering/react-seo` — 왜 서버에서 head를 채우나

<!-- section: caution -->
## 주의점

- `page.jsx` 상단에 `"use client"` 를 붙이면 그 파일에서 `export const metadata` 가 무효가 된다.
- `metadata` 는 정적 export다 — 요청 데이터에 따라 바꾸려면 `generateMetadata` 함수를 쓴다.

<!-- section: experiment -->
## 작은 실습

1. `metadata.title` 을 바꾸고 브라우저 탭·페이지 소스의 `<title>` 변화를 확인하라.
2. `page.jsx` 맨 위에 `"use client"` 를 붙여 보고 어떤 경고/동작 변화가 있는지 관찰하라.
3. 새 폴더 `app/game/test/page.jsx` 를 만들어 `/game/test` 가 자동 생기는 것을 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `metadata` 를 서버 컴포넌트가 선언하는 이유는?
2. `page.jsx` 는 왜 얇게(진입만) 두었나?
3. App Router에서 새 URL을 만들려면 무엇을 하나?

<!-- section: review -->
## 한 줄 정리

**App Router에서 `page.jsx`(서버 컴포넌트)는 `export const metadata` 로 그 경로의 head를 채우고, 상호작용은
`"use client"` 컴포넌트에 위임한다 — "폴더 = 경로, 서버가 기본" 규칙의 가장 짧은 예다.**
