---
id: web-foundations/responsive-and-modern-css/responsive-layout
chapter: web-foundations/responsive-and-modern-css
title: 반응형 레이아웃과 미디어 쿼리
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [css, responsive, media-query]
related_material_ids:
  - 1jC3cwTiy_a0rMUdAPu2JXjSF-RPmZ9bx        # responsive_video_base.zip
project_links:
  - unit: tenlune/responsive-css-system
    note: 운영 사이트의 실제 반응형 CSS — 35개 미디어 쿼리와 clamp/rem 로 그리드가 모바일 1열로 붕괴, 가로 스크롤 없음
prerequisites:
  - web-foundations/css-layout-flexbox/flexbox-core
  - web-foundations/css-layout-grid/grid-core
code_examples:
  - slug: viewport
    title: 시작점 — viewport meta + 상대 단위
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!-- 이게 없으면 모바일이 데스크톱 폭을 축소해서 보여줌 -->
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        html { box-sizing: border-box; } *, *::before, *::after { box-sizing: inherit; }
        body { font-size: 100%; }            /* 사용자 설정 존중 */
        .col { width: 100%; max-width: 40rem; margin-inline: auto; padding-inline: 1rem; }
      </style>
  - slug: media
    title: 미디어 쿼리 — 모바일 퍼스트
    source_type: generated_minimal
    language: css
    code: |
      /* 기본 = 모바일 (좁은 화면). 위로 올려가며 덧쓴다 */
      .grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }

      @media (min-width: 40rem)  { .grid { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 64rem)  { .grid { grid-template-columns: repeat(4, 1fr); } }

      /* min-width(모바일 퍼스트) 를 기본으로. max-width 는 예외 처리에만 섞어 쓴다 */
  - slug: intrinsic
    title: 미디어 쿼리 없이 되는 반응형
    source_type: generated_minimal
    language: css
    code: |
      /* 카드가 최소 16rem, 공간 남으면 자동으로 열 추가 — 브레이크포인트 불필요 */
      .cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }

      /* 유동 타이포: 최소~최대 사이에서 뷰포트에 따라 */
      h1 { font-size: clamp(1.5rem, 1rem + 3vw, 3rem); }

      /* 반응형 미디어 */
      img, video { max-width: 100%; height: auto; display: block; }
  - slug: responsive-embed
    title: 16:9 iframe/video 비율 유지
    source_type: generated_minimal
    language: css
    code: |
      /* 최신: aspect-ratio */
      .embed { width: 100%; aspect-ratio: 16 / 9; }
      .embed iframe { width: 100%; height: 100%; border: 0; }

      /* 구형 폴백: padding-top 해킹 */
      .embed-legacy { position: relative; padding-top: 56.25%; }   /* 9/16 */
      .embed-legacy > * { position: absolute; inset: 0; width: 100%; height: 100%; }
  - slug: other-queries
    title: 그 밖의 쿼리
    source_type: generated_minimal
    language: css
    code: |
      @media (prefers-color-scheme: dark) { :root { --bg: #111; --fg: #eee; } }
      @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      @media (hover: hover) { .btn:hover { background: #eee; } }   /* 터치기기 제외 */
      @media print { nav, .ads { display: none; } }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `viewport` meta 와 상대 단위(`rem`/`%`/`vw`)로 반응형의 토대를 잡는다.
- **모바일 퍼스트**(`min-width` 로 위로 덧쓰기) 미디어 쿼리를 작성한다.
- 미디어 쿼리 없이도 되는 반응형(`auto-fit`+`minmax`, `clamp()`, `max-width: 100%`)을 우선 쓴다.
- `aspect-ratio`(+ 구형 `padding-top` 폴백)로 영상/iframe 비율을 유지한다.
- `prefers-color-scheme`, `prefers-reduced-motion`, `hover`, `print` 쿼리를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Flexbox·Grid 기본, 박스 모델, 단위(`rem`/`em`/`%`/`vw`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `viewport` meta 가 없어 모바일에서 데스크톱 화면이 쪼그라들어 보인다.
- `px` 고정폭이라 작은 화면에서 가로 스크롤이 생긴다.
- 브레이크포인트를 잘게 쪼개 미디어 쿼리가 수십 개.
- 유튜브 iframe 이 화면 폭에 따라 비율이 깨진다.

<!-- section: concept -->
## 토대

{{code: viewport}}

- **`<meta name="viewport">`** 없으면 반응형 CSS 가 무의미하다(모바일이 980px 을 축소 렌더).
- 폭은 `%`/`max-width`/`min()`/`clamp()`, 여백·폰트는 `rem` 을 기본으로. `px` 는 테두리·그림자 정도.
- `box-sizing: border-box` 를 전역으로.

<!-- section: mechanism -->
## 미디어 쿼리 — 모바일 퍼스트

{{code: media}}

- 기본 스타일은 **가장 좁은 화면** 기준. `@media (min-width: …)` 로 넓어질 때 규칙을 덧쓴다.
- 이유: 모바일이 다수이고, 좁은 레이아웃이 단순해 기본으로 두기 쉽다. `max-width` 는 특정 구간 예외에만.
- 브레이크포인트는 기기명이 아니라 **콘텐츠가 깨지는 지점**에서 잡는다. 보통 2~3개면 충분.

{{code: intrinsic}}

- **미디어 쿼리를 쓰기 전에** 자동 반응형을 시도: `grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr))`,
  `clamp()` 유동 타이포, `max-width: 100%` 미디어.

{{code: responsive-embed}}

- 영상/iframe 비율: `aspect-ratio: 16 / 9`. 구형 지원이 필요하면 `padding-top: 56.25%` 해킹 + 절대배치.

{{code: other-queries}}

- 폭 외에도 `prefers-color-scheme`(다크모드), `prefers-reduced-motion`, `hover`(터치 구분), `print`.

<!-- section: must_know -->
## 반드시 기억할 것

- `<meta viewport>` 필수. 폭은 `%`/`max-width`/`clamp`, 나머지는 `rem`. `box-sizing: border-box` 전역.
- **모바일 퍼스트**: 기본 = 좁은 화면, `@media (min-width)` 로 덧쓰기. 브레이크포인트는 콘텐츠 기준 2~3개.
- 가능하면 미디어 쿼리 없이: `auto-fit`+`minmax`, `clamp()`, `max-width: 100%`.
- 비율 유지 = `aspect-ratio`(폴백 `padding-top`).
- 폭 외 쿼리: `prefers-color-scheme` / `prefers-reduced-motion` / `hover` / `print`.

<!-- section: mission -->
## 미션 — 반응형 페이지

responsive video 자료를 재료로.

- 카드 그리드: `auto-fit`+`minmax(16rem,1fr)` 로 미디어 쿼리 없이 1~4열 자동.
- 헤더/본문/사이드바 레이아웃: 모바일 1열 → `min-width: 48rem` 에서 사이드바 분리(2~3개 브레이크포인트만).
- 유튜브 iframe + 로컬 `<video>` 를 `aspect-ratio: 16/9` 로. 구형 폴백 버전도 하나.
- 제목에 `clamp()` 유동 타이포.
- 다크모드(`prefers-color-scheme`)와 `prefers-reduced-motion` 대응.
- 개발자도구 반응형 모드로 320~1440px 훑으며 가로 스크롤 0 확인.

<!-- section: check_question -->
## 이해 점검

1. `viewport` meta 가 없으면 모바일에서 무슨 일이 생기나?
2. 모바일 퍼스트에서 미디어 쿼리는 `min-width` 와 `max-width` 중 무엇을 기본으로?
3. 미디어 쿼리 없이 카드가 자동으로 열 수를 바꾸게 하려면?
4. 16:9 비율을 유지하는 최신 방법과 구형 폴백은?

<!-- section: interview_question -->
## 면접 대비

- "브레이크포인트를 어떻게 정하나요? (기기 vs 콘텐츠)"
- "미디어 쿼리를 최소화하는 CSS 기법을 아는 대로 말해 보세요."

<!-- section: review -->
## 한 줄 정리

**`viewport` meta + 상대 단위 위에서, 모바일 퍼스트(`min-width`)로 콘텐츠가 깨지는 지점에만 브레이크포인트를 두되
`auto-fit`+`minmax`·`clamp()`·`aspect-ratio` 로 미디어 쿼리 자체를 줄이고, 다크모드·모션 쿼리도 챙긴다.**

<!-- section: next -->
## 다음 Lesson

`responsive-and-modern-css/container-queries` — 부모 크기 기준 반응형.
