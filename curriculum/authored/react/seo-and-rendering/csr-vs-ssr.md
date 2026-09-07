---
id: react/seo-and-rendering/csr-vs-ssr
chapter: react/seo-and-rendering
title: CSR과 SSR
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [react, csr, ssr, rendering, nextjs-intro]
related_material_ids:
  - 1PCcfvs93XEb4lqKh-V9Z7hA4D7b5cc9TXERLFm4t7z8   # CSR과 SSR (React vs Next / SSG·ISR·SSR 표)
prerequisites:
  - react/setup-and-jsx/why-react-for-publishers
  - react/data-fetching/fetching-in-react
code_examples:
  - slug: csr-html
    title: CSR — 브라우저가 받는 첫 HTML은 거의 비어 있다
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!-- Vite/CRA 로 만든 React 앱이 서버에서 내려주는 index.html -->
      <body>
        <div id="root"></div>                    <!-- 내용 없음 -->
        <script type="module" src="/assets/index-abc123.js"></script>
      </body>
      <!-- 브라우저가 JS 다운로드 → React 실행 → 이 시점에 화면이 채워진다 -->
  - slug: timeline
    title: 두 방식의 응답 타임라인
    source_type: generated_minimal
    language: text
    code: |
      CSR (React + Vite)
        요청 → 빈 HTML + JS 링크 → [JS 다운로드/실행 중 빈 화면] → React 렌더 → 화면
                                     ▲ 이 구간에 사용자는 흰 화면을 본다

      SSR (Next.js 등)
        요청 → 서버에서 React 실행 → 완성된 HTML → 화면(정적) → JS 다운로드 → hydration → 상호작용 가능
                                                  ▲ 여기서 이미 내용이 보인다
  - slug: rendering-matrix
    title: CSR / SSR / SSG / ISR
    source_type: generated_minimal
    language: text
    code: |
      CSR : HTML을 브라우저에서, 접속 후에 만든다
      SSR : HTML을 서버에서, 요청할 때마다 만든다        (Request-time)
      SSG : HTML을 빌드할 때 미리 만든다                 (Build-time)
      ISR : SSG + 일정 주기(revalidate)로 백그라운드 재생성

      데이터 최신성: SSR > ISR > SSG   |   최초 응답/트래픽 방어: SSG ≥ ISR > SSR
      개인화(쿠키/권한): SSR 유리      |   서버 비용: CSR·SSG 낮음, SSR 높음
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **"HTML을 언제, 어디서 만드느냐"** 축으로 CSR / SSR / SSG / ISR을 구분할 수 있다.
- CSR의 흰 화면·SEO 약점이 **어디서** 생기는지 타임라인으로 설명할 수 있다.
- **hydration** 이 무엇인지, SSR이 왜 그 뒤에 CSR처럼 동작하는지 안다.
- "라이브러리 React" vs "프레임워크 Next"의 차이(흐름 주도권)를 한 문장으로 말한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- React 앱이 `<div id="root">` 에 마운트된다는 것.
- 브라우저가 HTML을 받고 → JS를 받고 → 실행한다는 로딩 순서.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

Vite로 만든 React 앱을 배포했다. 그런데:

- 느린 네트워크에서 접속하면 **1~2초간 흰 화면**만 보인다.
- 구글에 검색하면 페이지 설명이 "`<div id="root"></div>`" 처럼 비어 나온다. 상품/글마다
  다른 `<title>`·설명이 안 걸린다.
- 카톡/슬랙에 링크를 붙여도 미리보기(썸네일·제목)가 안 뜬다.

원인은 하나 — **첫 HTML에 내용이 없기 때문**이다.

{{code: csr-html}}

<!-- section: concept -->
## CSR — 클라이언트에서 렌더

1. 유저가 접속 → 서버는 **빈 HTML + JS 링크**를 준다.
2. 브라우저가 JS를 다운로드하는 동안 유저는 **빈 화면**을 본다.
3. JS 실행 → React가 `<div id="root">` 안을 채운다.
4. 이제 유저가 화면을 본다. 이후 이동은 JS가 화면만 바꾸므로 빠르다(SPA).

👍 초기 로드 후 이동이 빠름, 서버 부담 적음. 웹앱·관리자·SaaS처럼 SEO 비중이 낮은 곳에 적합.
👎 첫 화면까지 지연, **SEO·링크 미리보기·페이지별 메타태그에 불리**.

<!-- section: concept | title: SSR -->
## SSR — 서버에서 렌더 + hydration

{{code: timeline}}

1. 요청이 오면 **서버가 React를 실행**해 완성된 HTML을 만들어 보낸다.
2. 유저는 인터넷 속도와 무관하게 **바로 내용을 본다**(정적 상태).
3. 이어서 브라우저가 JS를 받아 실행하며, 이미 있는 HTML에 이벤트를 연결한다 —
   이 과정이 **hydration**(수화). 이후부터는 일반 React 앱처럼 CSR로 동작한다.

👍 SEO 좋음, 첫 화면 빠름, 요청별 개인화(쿠키·권한) 가능.
👎 요청마다 서버가 렌더 → 서버 부하·비용, 컴포넌트가 무거우면 서버 응답 자체가 느려짐.

<!-- section: mechanism -->
## SSG와 ISR — SSR의 비용을 줄이는 변형

같은 `/courses` 페이지를 10만 명이 요청하는데 매번 서버가 똑같은 HTML을 만드는 건 낭비다.

{{code: rendering-matrix}}

- **SSG**: `npm run build` 때 HTML을 미리 만들어 CDN에 둔다. 요청 시 계산 없음. 문서·블로그·마케팅.
- **ISR**: SSG로 시작하되 `revalidate`(초) 주기로 백그라운드에서 다시 생성. 자주 바뀌지만
  초 단위 실시간까진 필요 없는 게시글·상품 목록.
- **SSR**: 대시보드·개인화·권한 검사·결제 콜백처럼 **요청마다 달라야** 하는 페이지.

한 사이트에서 페이지별로 섞어 쓴다(Next.js가 이걸 페이지 단위로 고르게 해 준다).

<!-- section: concept | title: library vs framework -->
## React(라이브러리) vs Next(프레임워크)

- **라이브러리**: 내가 필요한 기능(함수·컴포넌트)을 **내가 불러다 쓴다**. 라우팅·빌드·렌더 방식을
  직접 조립. 자유롭지만 결정할 게 많다. → React + Vite.
- **프레임워크**: **틀이 흐름을 주도**하고 나는 규칙에 맞춰 코드만 채운다. 파일을 만들면
  라우트가 되고, 함수를 export 하면 서버에서 실행된다. → Next.js.

"흐름의 주도권을 누가 갖는가"가 핵심 차이다. Next는 SSR/SSG/ISR을 기본 제공하므로
SEO가 중요한 서비스의 출발점이 된다(다음 Chapter의 Next.js 트랙으로 이어진다).

<!-- section: must_know -->
## 반드시 기억할 것

- 구분 축은 **"HTML을 언제(빌드/요청/접속 후), 어디서(서버/브라우저) 만드나"**.
- CSR의 두 약점(흰 화면, SEO)은 **첫 HTML이 비어 있어서** 생긴다.
- SSR = 서버가 HTML 완성 → 전송 → **hydration** 후 CSR처럼 동작.
- SSG(빌드 시) / ISR(빌드 + 주기 재생성) / SSR(요청 시)은 **최신성 ↔ 비용/속도**의 트레이드오프.
- 현대 구글봇은 JS를 어느 정도 실행하지만, 완성 HTML을 주는 쪽이 **크롤링·메타데이터에서 여전히 유리**하다.
- React는 라이브러리(자유·조립), Next는 프레임워크(규칙·자동).

<!-- section: experiment -->
## 직접 해 보기

1. 배포된(또는 `vite build && vite preview`) React 앱에서 **페이지 소스 보기**(Ctrl+U)를 눌러
   `<div id="root">` 가 비어 있는 걸 확인하라. 개발자도구 Elements 탭(렌더 후)과 비교.
2. 네트워크 탭에서 **throttling(Slow 3G)** 을 켜고 새로고침해 흰 화면 구간을 체감하라.
3. Next.js 예제 사이트에서 같은 "소스 보기"를 눌러 HTML에 본문이 들어 있는지 확인하라.
4. SSG/ISR/SSR을 "블로그 글", "실시간 재고", "내 주문 내역" 각각에 배정해 보고 이유를 적어라.

<!-- section: check_question -->
## 이해 점검

1. CSR에서 흰 화면이 나오는 정확한 구간은 타임라인의 어디인가?
2. hydration 이 무엇이고, 그 전/후 동작이 어떻게 다른가?
3. SSR과 SSG는 "HTML을 언제 만드나"가 어떻게 다른가? ISR은?
4. SEO가 별로 안 중요한 서비스의 예와, CSR이 그런 곳에 잘 맞는 이유는?
5. "React는 라이브러리, Next는 프레임워크"를 한 문장으로.

<!-- section: interview_question -->
## 면접 대비

- "CSR과 SSR의 차이를 로딩 타임라인으로 설명해 주세요. 각 방식의 SEO 영향은?"
- "hydration 은 무엇이고, hydration mismatch 는 왜 생기나요?"
- "SSG / ISR / SSR 중 하나를 골라야 할 때 어떤 기준으로 판단하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> "언제·어디서 HTML을 만드나" 축, CSR의 두 약점의 원인, hydration 정의, SSG/ISR/SSR 트레이드오프,
> library vs framework 한 줄 정의를 각각 답하기.

<!-- section: review -->
## 한 줄 정리

**CSR은 브라우저가 접속 후 HTML을 만들어 흰 화면·SEO 약점이 있고, SSR은 서버가 HTML을 완성해
보낸 뒤 hydration 으로 상호작용을 붙인다 — SSG(빌드 시)·ISR(빌드+재생성)은 그 사이의 비용/최신성 절충이다.**
