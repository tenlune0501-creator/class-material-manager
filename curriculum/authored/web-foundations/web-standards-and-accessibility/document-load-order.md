---
id: web-foundations/web-standards-and-accessibility/document-load-order
chapter: web-foundations/web-standards-and-accessibility
title: 웹페이지 리소스 연결·로드 순서
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [web-standards, performance, loading, script, link]
related_material_ids:
  - 13SSDvGWJGozhRP4T2Xeo7S2LD84haGL59U5ZJr5449I   # 웹페이지 연결 순서
sources:
  - reference_slug: html/script-스크립트-요소
prerequisites:
  - web-foundations/html-structure/markup-conventions-and-entities
  - javascript/async-and-http/http-basics
code_examples:
  - slug: pipeline
    title: 주소 입력 → 화면까지
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      1. URL 파싱 (scheme/host/path/query/fragment)
      2. DNS 조회 (도메인 → IP): 브라우저 → OS → 라우터 → ISP → 루트/TLD/권한 서버
      3. TCP 3-way handshake (SYN / SYN-ACK / ACK)
      4. TLS handshake (https: 인증서 확인 + 키 교환)
      5. HTTP Request 전송
      6. 서버 처리 → HTTP Response (상태코드 + 헤더 + 본문)
      7. HTML 파싱 → DOM 생성 (중간에 CSS/JS/이미지 병렬 다운로드)
      8. CSS 파싱 → CSSOM,  DOM + CSSOM → Render Tree
      9. Layout(Reflow) → Paint → Composite
      10. JS 실행 / DOM 조작 / (SPA면) 프레임워크 렌더
  - slug: css-position
    title: CSS 는 <head> 에서 먼저
    source_type: generated_minimal
    language: html
    code: |
      <head>
        <link rel="stylesheet" href="/style.css">   <!-- 렌더링 차단 자원: 먼저 받아야 FOUC 방지 -->
      </head>
      <!-- CSS 가 늦으면 스타일 없는 화면이 번쩍(FOUC). 그래서 head 상단 -->
      <!-- 중요 폰트/도메인은 미리: <link rel="preconnect" href="https://fonts.gstatic.com"> -->
  - slug: script-loading
    title: script — 위치와 defer / async
    source_type: generated_minimal
    language: html
    code: |
      <!-- (1) 옛 방식: </body> 직전. 파싱 끝난 뒤 실행 -->
      <script src="/app.js"></script>

      <!-- (2) defer: head 에 둬도 됨. HTML 파싱과 병렬 다운로드 → 파싱 끝난 뒤, 순서대로 실행 -->
      <script src="/app.js" defer></script>

      <!-- (3) async: 다운로드되는 즉시 실행 (파싱 중단 가능, 순서 보장 X). 독립 스크립트(분석)용 -->
      <script src="https://analytics.example.com/a.js" async></script>

      <!-- 아무것도 안 붙이면: 만나는 즉시 다운로드+실행하며 HTML 파싱을 멈춘다 (blocking) -->
  - slug: images
    title: 이미지 · 지연 로딩
    source_type: generated_minimal
    language: html
    code: |
      <img src="hero.jpg" width="1200" height="600" fetchpriority="high">   <!-- 첫 화면: 우선 -->
      <img src="below.jpg" width="800" height="400" loading="lazy" decoding="async">
      <!-- width/height 지정 → 로드 전 자리 확보 → 레이아웃 이동(CLS) 방지 -->
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 주소 입력부터 화면 표시까지의 단계(DNS → TCP → TLS → HTTP → 파싱 → 렌더 → JS)를 순서대로 말한다.
- **CSS 는 `<head>`, 렌더링 차단 자원**이라 먼저 받아야 FOUC 를 막는다는 것을 안다.
- `<script>` 의 위치와 **`defer`/`async`/(무옵션)** 의 차이를 구분해 쓴다.
- 이미지에 `width`/`height` 를 주고(CLS 방지), `loading="lazy"` 로 지연 로드한다.
- `preconnect`/`preload` 같은 힌트가 무엇인지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 문서 구조, HTTP 기본(요청/응답/상태코드).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `<script>` 를 `<head>` 에 옵션 없이 넣어 HTML 파싱이 멈추고 첫 화면이 느리다.
- 스크립트가 `document.querySelector` 로 아직 안 만들어진 요소를 잡으려다 `null`.
- CSS 를 `<body>` 끝에 둬서 스타일 없는 화면이 번쩍인다(FOUC).
- 이미지 크기를 안 줘서 로드되며 콘텐츠가 아래로 밀린다(CLS).

<!-- section: concept -->
## 전체 파이프라인

{{code: pipeline}}

- 브라우저는 HTML 을 **위에서부터** 파싱하며 DOM 을 만들고, 도중에 만나는 CSS·JS·이미지를 **병렬로** 내려받는다.
- DOM + CSSOM → Render Tree → Layout(위치·크기) → Paint(픽셀) → Composite(레이어 합성).
- SPA(React/Next)는 이 뒤에 JS 가 실행되며 실제 UI 를 그린다(그래서 초기 JS 크기가 중요).

<!-- section: mechanism -->
## CSS 와 script 위치

{{code: css-position}}

- CSS 는 **렌더링 차단 자원**: 브라우저는 CSSOM 이 준비될 때까지 첫 페인트를 미룬다(스타일 없는 화면 방지). 그래서 `<head>` 상단.

{{code: script-loading}}

- **무옵션 `<script>`** — 만나는 즉시 다운로드+실행하며 **HTML 파싱을 멈춘다**. `<head>` 에 두면 특히 느림.
- **`</body>` 직전** — 파싱이 끝난 뒤 실행되므로 DOM 이 준비됨(옛 방식).
- **`defer`** — `<head>` 에 둬도 파싱과 **병렬 다운로드**, 파싱 완료 후 **문서 순서대로** 실행. 앱 스크립트 기본값으로 권장.
- **`async`** — 다운로드되는 대로 즉시 실행(순서·시점 보장 X). 다른 코드와 무관한 분석/광고 스크립트용.
- `type="module"` 스크립트는 기본 `defer` 처럼 동작.

{{code: images}}

- 이미지에 `width`/`height`(또는 `aspect-ratio`) → 로드 전 자리 확보 → **CLS(레이아웃 이동) 방지**.
- 첫 화면 밖 이미지엔 `loading="lazy"`. 중요한 히어로 이미지엔 `fetchpriority="high"`.
- 폰트·API 도메인은 `<link rel="preconnect">`, 꼭 필요한 자원은 `<link rel="preload">`.

<!-- section: must_know -->
## 반드시 기억할 것

- 순서: URL → DNS → TCP → TLS → HTTP req/res → HTML 파싱(+병렬 다운로드) → CSSOM → Render Tree → Layout/Paint/Composite → JS.
- **CSS 는 `<head>`**(렌더링 차단, FOUC 방지).
- `<script>`: 무옵션=파싱 중단 / `</body>` 앞=파싱 후 / **`defer`=병렬 다운로드+순서 실행(권장)** / `async`=즉시·무순서(독립 스크립트).
- 이미지 `width`/`height` 로 CLS 방지, 아래쪽은 `loading="lazy"`.
- 힌트: `preconnect`(도메인 미리 연결), `preload`(자원 미리 받기).

<!-- section: experiment -->
## 직접 해 보기

1. `<script>` 를 `<head>` 무옵션 / `<head>` `defer` / `</body>` 앞 세 위치로 옮기며 DevTools Performance 의 첫 페인트 시점 비교.
2. `defer` 스크립트에서 `document.querySelector` 로 요소를 잡아 `null` 이 안 나는지 확인.
3. CSS `<link>` 를 `<body>` 끝으로 옮겨 FOUC(스타일 번쩍임)를 재현 후 되돌리기.
4. 이미지에서 `width`/`height` 를 빼고 느린 네트워크로 로드해 콘텐츠가 밀리는(CLS) 것 관찰.

<!-- section: check_question -->
## 이해 점검

1. `<head>` 에 옵션 없는 `<script>` 를 두면 왜 느려지나?
2. `defer` 와 `async` 의 차이(다운로드/실행 시점, 순서)는?
3. CSS 를 `<head>` 에 두는 이유는?
4. 이미지에 `width`/`height` 를 주면 무엇을 막나?

<!-- section: interview_question -->
## 면접 대비

- "Critical Rendering Path 를 설명해 보세요."
- "렌더링 차단 자원이란? 어떻게 줄이나요?"
- "CLS 를 유발하는 원인과 대책은?"

<!-- section: review -->
## 한 줄 정리

**브라우저는 HTML 을 위에서부터 파싱하며 자원을 병렬로 받고 DOM+CSSOM→렌더트리→Layout/Paint 로 그린다 —
CSS 는 `<head>`(차단 자원), 스크립트는 `defer` 로 병렬+순서 실행, 이미지엔 크기를 줘 CLS 를 막는다.**

<!-- section: next -->
## 다음 Chapter

`web-foundations/css-preprocessors-and-frameworks` — Sass·Tailwind.
