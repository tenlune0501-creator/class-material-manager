---
id: web-foundations/css-text-and-effects/text-and-paragraph-effects
chapter: web-foundations/css-text-and-effects
title: CSS3 확장된 텍스트·단락 효과
mastery: understand
lesson_kind: lesson
estimated_minutes: 35
tags: [css, text, typography, css3]
related_material_ids:
  - 1zXGQ5OWDsb1YUe1Myrmv5I4KsSMAySmC3jOH1dNRdIA   # 4. CSS3 확장된 텍스트, 단락 효과
sources:
  - reference_slug: css/columns-CSS-property
prerequisites:
  - web-foundations/css-fundamentals/box-model-and-positioning
code_examples:
  - slug: shadow
    title: text-shadow / box-shadow
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      /* x offset · y offset · blur · color  (blur 없으면 딱딱한 그림자) */
      h1 { text-shadow: 2px 2px 4px rgba(0,0,0,.3); }
      .card { box-shadow: 0 8px 24px rgba(0,0,0,.12); }   /* 문법 동일, 요소 박스에 */
  - slug: overflow-ellipsis
    title: 넘치는 텍스트 — 한 줄 말줄임
    source_type: generated_minimal
    language: css
    code: |
      .one-line {
        overflow: hidden;
        white-space: nowrap;      /* 줄바꿈 금지 → 한 줄로 넘침 */
        text-overflow: ellipsis;  /* 잘린 끝에 … */
      }

      /* 여러 줄 말줄임 (widely supported now) */
      .clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
  - slug: columns
    title: 다단 (multi-column)
    source_type: generated_minimal
    language: css
    code: |
      .news {
        column-count: 3;            /* 또는 column-width: 16rem (자동 개수) */
        column-gap: 2.5rem;
        column-rule: 2px dashed #ccc;   /* 단 사이 구분선 */
      }
      .news h2 { column-span: all; }     /* 제목은 전체 폭 차지 */
      /* 인쇄물 느낌의 본문에. 스크롤이 위→아래→다음 단으로 흐른다 */
  - slug: webfont
    title: 웹폰트 연결
    source_type: generated_minimal
    language: css
    code: |
      /* <link> 로 google fonts 를 불러오거나 @font-face 로 직접 */
      @font-face {
        font-family: "Pretendard";
        src: url("/fonts/Pretendard.woff2") format("woff2");
        font-weight: 400 700;      /* variable font 범위 */
        font-display: swap;         /* 폰트 로드 전 시스템 폰트로 먼저 보여줌 (FOIT 방지) */
      }
      body { font-family: "Pretendard", system-ui, sans-serif; }  /* 항상 폴백 스택 */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `text-shadow` / `box-shadow` 의 4값(x·y·blur·color)을 읽고 쓴다.
- 넘치는 텍스트를 `overflow` + `white-space` + `text-overflow: ellipsis`(한 줄)와 `line-clamp`(여러 줄)로 처리한다.
- `column-count`/`column-width`/`column-gap`/`column-rule`/`column-span` 으로 다단 레이아웃을 만든다.
- 웹폰트를 `@font-face` / `<link>` 로 연결하고 `font-display: swap` 과 **폴백 스택**을 쓴다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSS 박스 모델·`overflow`, 선택자. 단위(`rem`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 카드 제목이 길면 레이아웃이 깨진다(말줄임 미적용).
- `overflow: hidden` 만 해서 글자가 칼같이 잘려 읽기 이상하다.
- 웹폰트 로딩 동안 글자가 안 보이거나(FOIT), 폰트 파일을 못 받으면 깨진 폰트로 나온다.

<!-- section: concept -->
## 그림자와 넘침 처리

{{code: shadow}}

- 그림자는 `x y blur color`. `blur` 를 키우면 부드럽고, `0` 이면 딱딱한 오프셋. `box-shadow` 는 콤마로 여러 겹.

{{code: overflow-ellipsis}}

- **한 줄 말줄임 3종 세트**: `overflow: hidden` + `white-space: nowrap` + `text-overflow: ellipsis`. 셋 다 있어야 `…` 가 나온다.
- **여러 줄**: `-webkit-line-clamp: N` (+ `display: -webkit-box` + `-webkit-box-orient: vertical`).

<!-- section: mechanism -->
## 다단과 웹폰트

{{code: columns}}

- `column-count`(개수 고정) 또는 `column-width`(폭 기준, 개수는 자동). `column-gap`, `column-rule`(구분선), `column-span: all`(제목이 전 폭).
- 신문·잡지 스타일 본문에. 반응형에서 좁아지면 단 수를 줄이거나 1단으로.

{{code: webfont}}

- `@font-face` 로 폰트 파일 등록, `font-display: swap` 으로 로드 전엔 시스템 폰트를 보여주고 로드되면 교체.
- `font-family` 는 **항상 폴백 스택**(`"내폰트", system-ui, sans-serif`) — 파일을 못 받아도 읽히게.
- `woff2` 우선. 필요한 굵기·문자셋만 (한글은 subset 이 큼).

<!-- section: must_know -->
## 반드시 기억할 것

- 그림자 = `x y blur color`. `text-shadow`·`box-shadow` 문법 동일.
- 한 줄 말줄임 = `overflow:hidden` + `white-space:nowrap` + `text-overflow:ellipsis` (3개 세트).
- 여러 줄 = `-webkit-line-clamp` (+ `-webkit-box` / `vertical`).
- 다단 = `column-count`/`column-width` + `column-gap` + `column-rule`, 제목은 `column-span: all`.
- 웹폰트 = `@font-face` + `font-display: swap` + **폴백 스택** 필수. `woff2`.

<!-- section: experiment -->
## 직접 해 보기

1. 카드 제목에 한 줄 말줄임, 본문에 3줄 `line-clamp` 적용. 텍스트 길이를 바꿔 확인.
2. 뉴스 본문 `<div>` 에 `column-count: 3` + 점선 `column-rule`. 창을 줄여 단이 좁아지는 것 관찰.
3. Google Fonts 하나를 `<link>` 로, 또 하나를 `@font-face` 로 연결. Network 를 3G 로 느리게 하고 `swap` 유무 차이 관찰.

<!-- section: check_question -->
## 이해 점검

1. `text-overflow: ellipsis` 가 동작하려면 함께 필요한 두 속성은?
2. `column-count` 와 `column-width` 의 차이는?
3. `font-display: swap` 은 무엇을 막나?
4. `font-family` 에 폴백을 여러 개 두는 이유는?

<!-- section: review -->
## 한 줄 정리

**그림자는 `x y blur color`, 넘치는 텍스트는 `ellipsis`(한 줄 3세트)·`line-clamp`(여러 줄), 다단은 `column-*`,
웹폰트는 `@font-face` + `font-display: swap` + 폴백 스택으로 안전하게 연결한다.**

<!-- section: next -->
## 다음 Lesson

`css-text-and-effects/transitions-and-hover` — 상태 변화를 부드럽게.
