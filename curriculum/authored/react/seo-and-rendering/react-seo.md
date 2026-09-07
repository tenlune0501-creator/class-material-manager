---
id: react/seo-and-rendering/react-seo
chapter: react/seo-and-rendering
title: React 앱의 SEO
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [react, seo, meta, ssr]
related_material_ids:
  - 1thbu8MKlX-u3gKdNzThlKF-56w2e3qyo-TAdipGI38I   # 02. React - SEO (meta / react-helmet / pre-render / sitemap)
sources:
  - title: "react-helmet-async — README"
    url: https://github.com/staylor/react-helmet-async
    publisher: "react-helmet-async"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Google Search Central — JavaScript SEO basics"
    url: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
    publisher: "Google"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - react/seo-and-rendering/csr-vs-ssr
code_examples:
  - slug: base-meta
    title: 1단계 — index.html 기본 메타 (사이트 공통)
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!-- 프로젝트 root/index.html -->
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI 웹개발 강의</title>
        <meta name="description" content="React와 AI를 활용한 웹개발 강의" />
        <!-- 링크 공유 미리보기(Open Graph) -->
        <meta property="og:title" content="AI 웹개발 강의" />
        <meta property="og:description" content="React와 AI를 활용한 웹개발 강의" />
        <meta property="og:image" content="https://example.com/og.png" />
      </head>
      <!-- 모든 페이지가 이 값을 공유한다. 페이지별로 다르게 하려면 2단계가 필요 -->
  - slug: helmet
    title: 2단계 — react-helmet-async 로 페이지별 메타
    source_type: generated_minimal
    language: jsx
    code: |
      // main.jsx  —  전체를 Provider 로 감싼다
      import { HelmetProvider } from "react-helmet-async";
      createRoot(root).render(<HelmetProvider><App /></HelmetProvider>);

      // 각 페이지
      import { Helmet } from "react-helmet-async";

      function CoursePage({ course }) {
        return (
          <>
            <Helmet>
              <title>{course.title} | AI 웹개발 강의</title>
              <meta name="description" content={course.summary} />
              <link rel="canonical" href={`https://example.com/courses/${course.slug}`} />
              <meta property="og:title" content={course.title} />
            </Helmet>
            <h1>{course.title}</h1>
          </>
        );
      }
      // 주의: 이 <title>/<meta> 는 "브라우저에서 JS 실행 후"에 바뀐다 (CSR).
  - slug: prerender
    title: 3단계 — 빌드시 정적 HTML 뽑기 (pre-render / SSG)
    source_type: generated_minimal
    language: text
    code: |
      # 방법 A: 크롤 방식 pre-render (react-snap 등)
      #   빌드 후 각 라우트를 헤드리스 브라우저로 열어 완성된 HTML을 파일로 저장
      #   → 정적 호스팅에서도 첫 HTML에 본문 + 메타가 들어간다

      # 방법 B: SSG 프레임워크로 이전 (Next.js / Astro 등)
      #   페이지 단위로 build-time HTML 생성. 근본적 해결이지만 마이그레이션 비용

      # 방법 C: 그대로 CSR 유지
      #   SEO 비중 낮은 관리자/웹앱이면 1~2단계 + 아래 sitemap/robots 로 충분
  - slug: sitemap-robots
    title: 4단계 — sitemap.xml / robots.txt / 이미지
    source_type: generated_minimal
    language: text
    code: |
      # public/robots.txt
      User-agent: *
      Allow: /
      Sitemap: https://example.com/sitemap.xml

      # public/sitemap.xml  (라우트 목록. 빌드 스크립트로 자동 생성 권장)
      <url><loc>https://example.com/</loc></url>
      <url><loc>https://example.com/courses/react</loc></url>

      # 이미지: <img alt="..."> 필수, 지연 로드
      <img src="hero.webp" alt="React 강의 대표 이미지" loading="lazy" width="800" height="450" />
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- CSR React 앱의 SEO를 **4단계**(공통 메타 → 페이지별 메타 → 정적화 → 사이트맵/이미지)로 개선할 수 있다.
- `react-helmet-async` 로 페이지별 `<title>`·`description`·OG·canonical 을 넣을 수 있다.
- Helmet만으로 부족한 경우(봇이 JS를 안 돌릴 때)와 **pre-render/SSG** 가 필요한 시점을 판단한다.
- `sitemap.xml` / `robots.txt` / 이미지 `alt`·`loading` 의 역할을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSR에서 첫 HTML이 비어 있다는 것, hydration (앞 Lesson).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

CSR 앱은 첫 HTML이 `<div id="root"></div>` 뿐이다. 그래서:

- 검색 결과에 사이트가 하나의 제목·설명으로만 뜬다(강의마다 다른 메타 불가).
- 봇이 JS 실행을 건너뛰거나 늦추면 본문을 못 읽는다.
- 링크 미리보기(OG)가 안 나온다.

완전한 해결은 SSR/SSG지만, **CSR을 유지하면서 할 수 있는 개선**이 단계별로 있다.

<!-- section: concept -->
## 1단계 — index.html 공통 메타

가장 먼저, 모든 페이지가 공유할 기본값을 `index.html` `<head>` 에 박는다.

{{code: base-meta}}

이건 JS 없이도 항상 있는 값이라 확실하다. 대신 **모든 페이지가 같은 제목/설명**을 갖는다.

<!-- section: concept | title: 페이지별 메타 -->
## 2단계 — react-helmet-async

강의 상세, 글 상세처럼 **페이지마다 다른** 메타가 필요하면 `react-helmet-async` 를 쓴다.
(예전 `react-helmet` 은 유지보수가 멈췄고 SSR에서 문제가 있어, 지금은 `-async` 가 표준이다.)

{{code: helmet}}

- 앱을 `<HelmetProvider>` 로 감싸고, 각 페이지에서 `<Helmet>` 안에 태그를 선언한다.
- 라우트가 바뀌면 Helmet이 `document.head` 를 갱신한다.
- **한계**: 이 변경도 결국 **브라우저에서 JS가 돈 뒤**다. JS를 실행하는 크롤러(요즘 구글)에는
  유효하지만, 링크 미리보기 봇(카톡/슬랙/일부 SNS)은 JS 전 HTML만 보므로 못 읽을 수 있다.

<!-- section: mechanism -->
## 3단계 — 정적 HTML 만들기

미리보기 봇·비-JS 크롤러까지 확실히 하려면, **빌드 시점에 완성된 HTML**을 만들어야 한다.

{{code: prerender}}

- **pre-render**(react-snap류): 빌드 후 각 라우트를 헤드리스 브라우저로 렌더해 HTML 파일로 저장.
  정적 호스팅 그대로 쓰면서 첫 HTML에 본문+메타가 들어간다. 라우트가 많거나 데이터 의존이 크면 한계.
- **SSG/SSR 프레임워크로 이전**(Next.js/Astro): 근본 해결. 마이그레이션 비용을 감수.
- **CSR 유지**: 관리자·사내 웹앱처럼 검색 유입이 목적이 아니면 1~2단계로 충분하다.

<!-- section: concept | title: 부가 요소 -->
## 4단계 — sitemap / robots / 이미지

{{code: sitemap-robots}}

- **robots.txt**: 크롤 허용 범위 + 사이트맵 위치.
- **sitemap.xml**: 색인시킬 URL 목록. 라우트에서 빌드 스크립트로 자동 생성하는 게 안전(수동은 누락).
- **이미지**: `alt` 는 접근성 + 이미지 검색, `loading="lazy"` + `width/height` 는 성능(CLS).
  성능(Core Web Vitals)도 랭킹 요소다.

<!-- section: must_know -->
## 반드시 기억할 것

- 순서: **공통 메타(index.html) → 페이지별 메타(helmet) → 필요하면 pre-render/SSG → sitemap/robots/이미지.**
- `react-helmet-async` 를 쓴다(구 `react-helmet` 아님). `<HelmetProvider>` 로 감싸는 걸 잊지 않는다.
- Helmet의 메타는 **JS 실행 후** 적용된다 — JS 안 돌리는 봇에는 안 보인다. 그게 3단계의 이유.
- `canonical` 로 중복 URL(쿼리스트링·페이지네이션)을 정리한다.
- SEO가 목적이 아닌 앱이면 억지로 SSG로 갈 필요 없다. *학습용/사내용*과 *검색 유입용*을 구분한다.
- 근본적으로 SEO가 중요하면 처음부터 **Next.js**(SSR/SSG 기본 제공)를 고려한다.

<!-- section: experiment -->
## 직접 해 보기

1. Vite React 앱의 `index.html` 에 `description` + OG 태그를 넣고, 배포 후 링크를 슬랙/카톡에 붙여 미리보기를 확인하라.
2. `react-helmet-async` 를 설치하고 두 페이지에 서로 다른 `<title>` 을 넣어라. 탭 제목이 바뀌는지 확인.
3. 개발자도구에서 JS를 비활성화하고 새로고침해, Helmet이 넣은 메타가 사라지는 것을 관찰하라(3단계 필요성 체감).
4. `public/robots.txt` 와 최소 `sitemap.xml` 을 추가하고, 배포 URL 뒤에 `/robots.txt` 로 접근되는지 확인.
5. 모든 `<img>` 에 의미 있는 `alt` 와 `loading="lazy"` 를 붙여라.

<!-- section: check_question -->
## 이해 점검

1. `index.html` 메타와 `react-helmet-async` 메타는 각각 언제 쓰나?
2. Helmet으로 메타를 넣어도 안 되는 크롤러가 있다. 왜 그런가?
3. pre-render(react-snap)와 SSG 프레임워크 이전의 차이는?
4. `canonical` 태그는 어떤 문제를 푸나?
5. 이미지 `loading="lazy"` 와 `width/height` 가 SEO/성능에 왜 중요한가?

<!-- section: interview_question -->
## 면접 대비

- "CSR SPA의 SEO를 개선하는 방법을 비용이 낮은 것부터 나열해 보세요."
- "`react-helmet` 대신 `react-helmet-async` 를 쓰는 이유는?"
- "언제 SEO를 위해 Next.js 같은 프레임워크로의 전환을 권하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 4단계(공통 메타 / helmet / pre-render·SSG / sitemap·robots·이미지), helmet 한계(JS 후 적용),
> canonical 의 용도, "SEO 목적이 아니면 SSG 강요 안 함" 원칙을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**CSR React의 SEO는 공통 메타(index.html) → 페이지별 메타(react-helmet-async) → (필요 시)
빌드 시 정적 HTML(pre-render/SSG) → sitemap·robots·이미지 순으로 올린다 — helmet은 JS 실행 후라
비-JS 봇에는 3단계가 필요하다.**
