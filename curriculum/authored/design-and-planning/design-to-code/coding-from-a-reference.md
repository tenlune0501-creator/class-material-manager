---
id: design-and-planning/design-to-code/coding-from-a-reference
chapter: design-and-planning/design-to-code
title: 디자인 참조해서 코딩하기
mastery: required
lesson_kind: lesson
estimated_minutes: 60
tags: [design-to-code, publishing]
related_material_ids:
  - 1ywjoGYpCZZVggGI_YRa6u0EFSsc7UPdpk1_ME-jFNSs   # 디자인 참조 Coding 기초
  - 1cySMLVRezEvANW4MAhnRYm7x3EIB4Dib0Ve7RVbDSe8   # Rounz 웹페이지 크롤링
  - 1R4cQytjc00wjV2WSml1LeJr8EZjVlhUg              # Blog_layout_final_v202604.zip
  - 1tRxk52dS2rwKAjv_VA3bveWr5hbpjArP              # SITE.zip
prerequisites:
  - design-and-planning/ui-design-foundations/design-tokens-and-auto-layout
  - web-foundations/html-structure/semantic-tags
code_examples:
  - slug: five-steps
    title: 디자인 → 코드 5단계
    source_type: generated_minimal
    language: text
    code: |
      1) 구조 분석    : Header/Main/Section/Footer + 레이어(Frame/Component) + 네이밍 확인
      2) 이미지 vs 코드 : 텍스트·버튼·카드·아이콘 = 코드 / 복잡한 일러스트·사진 = 이미지
      3) 레이아웃 분석 : 각 영역이 Flex? Grid? Position? 컨테이너 폭·정렬
      4) 디자인 시스템 추출 : Typography·Color·Spacing·Radius 를 토큰으로
      5) 컴포넌트 단위 구현 : 반복되는 것(카드/버튼)부터 만들고 조립
  - slug: skeleton
    title: 시맨틱 골격 먼저
    source_type: generated_minimal
    language: html
    code: |
      <body>
        <header>...</header>
        <main>
          <section class="hero">...</section>
          <section class="products">
            <div class="container">
              <article class="product-card">...</article>
            </div>
          </section>
        </main>
        <footer>...</footer>
      </body>
      <!-- 그림을 보고 바로 <div> 를 쌓지 않는다. 의미(section/article/nav/header)를 먼저 정한다 -->
  - slug: tokens
    title: 시안에서 토큰 뽑기
    source_type: generated_minimal
    language: css
    code: |
      :root {
        --primary: #2563eb; --ink: #0f172a; --muted: #64748b;
        --text-h1: 48px; --text-body: 16px; --text-label: 14px;
        --space-2: 8px; --space-4: 16px; --space-6: 24px;
        --radius: 10px;
      }
      /* Inspect 로 읽은 값을 하드코딩하지 말고 이 변수로. 반복 간격은 스케일로 통일. */
  - slug: image-formats
    title: 이미지 포맷
    source_type: generated_minimal
    language: text
    code: |
      jpg  사진        |  png  투명 배경  |  svg  아이콘·로고(코드로 색 제어 가능)
      webp/avif  웹 최적화(우선 고려)   |  아이콘은 가급적 인라인 SVG
      <img> 에는 항상 alt, width/height, loading="lazy"
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 디자인 시안을 **구조 분석 → 이미지/코드 구분 → 레이아웃 분석 → 디자인 시스템 추출 → 컴포넌트 구현**
  5단계로 코드로 옮긴다.
- 그림을 보고 바로 `<div>` 를 쌓지 않고 **시맨틱 골격**을 먼저 잡는다.
- Inspect로 읽은 값을 하드코딩하지 않고 **토큰(CSS 변수)** 으로 정리한다.
- 무엇을 이미지로, 무엇을 코드로 만들지 판단한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 시맨틱 HTML, Flex/Grid, 디자인 토큰/오토레이아웃(앞 챕터).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

시안을 받자마자 눈에 보이는 대로 `<div>` 를 쌓고 픽셀 값을 하나씩 베끼면: 시맨틱이 없어
접근성·SEO가 나쁘고, 색·간격이 제각각이라 유지보수가 안 되며, 반복 요소를 매번 새로 짠다.

<!-- section: concept -->
## 1. 5단계

{{code: five-steps}}

- **1단계**: 시안의 레이어가 정리돼 있나(의미 없는 Group 남발 아님, 네이밍 있음, 컴포넌트 분리 가능).
  안 돼 있으면 먼저 머릿속으로 정리하고 시작.
- **2단계**: {{code: image-formats}} 참고. 텍스트를 이미지로 박으면 검색·수정·번역이 다 막힌다.

<!-- section: mechanism -->
## 2. 시맨틱 골격 먼저

{{code: skeleton}}

레이아웃(색·폰트) 전에 **의미 구조**(`header`/`nav`/`main`/`section`/`article`/`footer`)를 정한다.
그다음 각 영역의 정렬 방식(Flex/Grid/Position)을 결정.

<!-- section: concept | title: 토큰 -->
## 3. 디자인 시스템 추출

{{code: tokens}}

시안의 Typography·Color·Spacing·Radius를 **먼저 토큰으로 뽑고**, 그다음 컴포넌트가 토큰을 참조하게 한다.
Inspect의 CSS 스니펫은 참고만 — 반복 간격은 눈으로 다른데 실제로는 같은 값이어야 한다(스케일로 통일).

<!-- section: concept | title: 컴포넌트 -->
## 4. 컴포넌트 단위

- 반복되는 것(product-card, btn-primary)부터 하나 만들고, 데이터로 반복 렌더 → 조립.
- 참조 사이트의 마크업을 볼 때(크롤링/개발자도구) 구조 아이디어는 얻되 **그대로 복사하지 않는다**
  (남의 클래스명·불필요한 wrapper·라이선스). 우리 토큰·시맨틱으로 다시 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- 순서: **구조 분석 → 이미지/코드 구분 → 레이아웃 분석 → 토큰 추출 → 컴포넌트 구현**.
- 그림 → `<div>` 직행 금지. **시맨틱 골격**(section/article/nav…)을 먼저.
- 텍스트·버튼·아이콘은 **코드**로. 복잡한 일러스트·사진만 이미지. 텍스트를 이미지로 박지 않는다.
- Inspect 값은 참고 — **토큰(CSS 변수)** 으로 정리하고 간격은 스케일로 통일.
- 이미지: 사진 jpg/webp, 투명 png, 아이콘·로고 svg(가급적 인라인). `<img>` 엔 `alt`·크기·`lazy`.
- 반복 요소는 컴포넌트로. 참조 사이트 마크업은 아이디어만, 복사 금지.

<!-- section: experiment -->
## 직접 해 보기

1. 참조 시안(또는 `Blog_layout` zip)을 골라 5단계 중 1~3단계(구조/이미지·코드/레이아웃)를 문서로 정리하라.
2. 시맨틱 골격만 먼저 HTML로 짜라(내용 없이 태그만).
3. 시안의 Typography·Color·Spacing을 `:root` 토큰 10개 안팎으로 뽑아라.
4. product-card 컴포넌트 하나를 만들고 `products.json` 으로 반복 렌더하라.
5. 참조 사이트를 개발자도구로 열어 레이아웃 아이디어를 메모하되, 클래스명·wrapper를 그대로 쓰지 말고 내 토큰으로 다시 작성하라.

<!-- section: check_question -->
## 이해 점검

1. 디자인 → 코드 5단계를 순서대로 말하면?
2. `<div>` 를 바로 쌓지 말고 무엇을 먼저 정하나?
3. 무엇을 이미지로, 무엇을 코드로 만드나? 텍스트를 이미지로 박으면 뭐가 문제인가?
4. Inspect의 CSS 스니펫을 그대로 쓰지 않는 이유는?
5. 참조 사이트 마크업을 복사하면 안 되는 이유들은?

<!-- section: interview_question -->
## 면접 대비

- "디자인 시안을 코드로 옮기는 절차를 설명해 주세요."
- "퍼블리싱에서 시맨틱 마크업과 접근성을 어떻게 챙기나요?"
- "디자인 토큰을 시안에서 어떻게 추출하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 5단계(구조/이미지·코드/레이아웃/토큰/컴포넌트), 시맨틱 골격 먼저, 텍스트는 코드,
> Inspect는 참고·토큰으로 정리, 참조 마크업은 아이디어만을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**시안은 구조 분석 → 이미지/코드 구분 → 레이아웃 분석 → 토큰 추출 → 컴포넌트 구현 순으로 옮긴다 —
그림을 보고 바로 `<div>` 를 쌓지 말고 시맨틱 골격을 먼저 잡고, Inspect 값은 토큰으로 정리하며,
참조 사이트 마크업은 아이디어만 얻고 복사하지 않는다.**
