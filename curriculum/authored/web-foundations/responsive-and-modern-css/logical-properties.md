---
id: web-foundations/responsive-and-modern-css/logical-properties
chapter: web-foundations/responsive-and-modern-css
title: Logical Properties
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [css, logical-properties, i18n]
related_material_ids:
  - 11IQVvtab5VnXLxyrdKW_jjIfGxlobP8SQ0YV21NABIg
  - 1jjNRYV5lwp5ZA-WaZR_6hjTLZ_9QFCKA
  - 1391lC9kSnUu3dzMr1HaBw2jZsgUSi8bZ
sources:
  - reference_slug: css/direction-CSS-property
prerequisites:
  - web-foundations/css-fundamentals/box-model-and-positioning
code_examples:
  - slug: axes
    title: 물리 방향 → 논리 방향
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      물리(physical)           논리(logical)
      ─────────────────────────────────────────
      width / height        →  inline-size / block-size
      left / right          →  inline-start / inline-end
      top / bottom          →  block-start / block-end
      margin-left           →  margin-inline-start
      padding-top/bottom    →  padding-block
      border-right          →  border-inline-end
      text-align: left      →  text-align: start
      # inline = 글이 흐르는 축(한국어·영어는 가로), block = 그 줄이 쌓이는 축(세로)
  - slug: use
    title: 흔한 치환
    source_type: generated_minimal
    language: css
    code: |
      .card {
        padding-block: 1rem;          /* 위+아래 */
        padding-inline: 1.25rem;      /* 좌+우 */
        margin-block-end: 1rem;       /* 아래 여백 (margin-bottom) */
        border-inline-start: 3px solid;  /* 시작쪽 강조선 — RTL 이면 자동으로 오른쪽 */
      }
      .modal { inline-size: min(90vw, 32rem); block-size: auto; }
      .back-btn { inset-inline-start: 1rem; }   /* LTR=왼쪽, RTL=오른쪽 */
  - slug: why
    title: 효과 — 방향/언어가 바뀌어도 유지
    source_type: generated_minimal
    language: css
    code: |
      /* <html dir="rtl"> (아랍어·히브리어) 나 세로쓰기로 바뀌어도
         inline-start 는 "글이 시작하는 쪽" 을 따라 자동으로 뒤집힌다.
         물리 속성이면 dir 마다 별도 규칙 (.rtl .card { margin-left→right }) 을 다 써야 함 */
      html[dir="rtl"] { /* 논리 속성만 썼다면 추가 CSS 거의 없음 */ }
  - slug: shorthand
    title: 2값 단축과 혼용
    source_type: generated_minimal
    language: css
    code: |
      margin-block: 1rem 2rem;    /* start end */
      margin-inline: auto;        /* 가운데 정렬 (margin-left/right auto 대체) */
      /* 물리와 논리를 섞어 쓸 수 있으나, 한 프로젝트에서는 논리로 통일하는 게 예측 가능 */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `left/right/top/bottom`·`width/height` 같은 **물리 속성**과 `inline-start/end`·`block-start/end`·`inline-size/block-size` 같은 **논리 속성**을 대응시킨다.
- `inline` 축(글 흐름)과 `block` 축(줄 쌓임)의 의미를 안다.
- `padding-block`/`padding-inline`/`margin-inline: auto`/`border-inline-start`/`inset-inline-start` 등 흔한 치환을 쓴다.
- RTL(`dir="rtl"`)·세로쓰기·다국어에서 논리 속성이 왜 유지보수를 줄이는지 설명한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 박스 모델(`margin`/`padding`/`border`), `position`/`inset`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 다국어(아랍어 등 RTL) 지원을 하려니 `margin-left` → `margin-right` 를 전부 뒤집는 `.rtl` 전용 CSS 를 따로 만들어야 한다.
- "시작쪽 강조선" 을 `border-left` 로 박아서 RTL 에서 반대편에 붙는다.
- 세로쓰기 모드에서 레이아웃이 무너진다.

<!-- section: concept -->
## 물리 축 vs 논리 축

{{code: axes}}

- **inline 축** = 글자가 흐르는 방향(한국어/영어: 가로 좌→우, 아랍어: 가로 우→좌, 일부 일본어: 세로).
- **block 축** = 그 줄들이 쌓이는 방향(보통 위→아래).
- `inline-start` = "글이 시작하는 쪽"(LTR=왼쪽, RTL=오른쪽). `block-start` = "첫 줄 쪽"(보통 위).

<!-- section: mechanism -->
## 치환과 효과

{{code: use}}

{{code: why}}

- 논리 속성으로 쓰면 `<html dir="rtl">` 로 바꿔도 `inline-start` 강조선·여백·정렬이 **자동으로 반대편**을 향한다 → RTL 전용 CSS 거의 불필요.
- `writing-mode` 로 세로쓰기를 켜도 `block`/`inline` 이 그에 맞게 회전한다.

{{code: shorthand}}

- 2값 단축(`margin-block: 1rem 2rem` = start end). `margin-inline: auto` 로 가로 가운데 정렬.
- 물리/논리 혼용은 가능하지만, 프로젝트 내에서는 **논리로 통일**해야 동작이 예측 가능하다.

<!-- section: must_know -->
## 반드시 기억할 것

- `width/height` → `inline-size/block-size`, `left/right` → `inline-start/end`, `top/bottom` → `block-start/end`.
- `inline` = 글 흐름 축, `block` = 줄 쌓임 축. `start` 는 방향에 따라 자동으로 뒤집힌다.
- 흔한 것: `padding-block`/`padding-inline`, `margin-inline: auto`(가운데), `border-inline-start`, `inset-inline-start`.
- RTL·세로쓰기·다국어에서 **전용 CSS 를 안 만들어도 되게** 해 준다.
- 한 프로젝트에서는 논리 속성으로 통일.

<!-- section: experiment -->
## 직접 해 보기

1. 카드에 `padding-inline`/`padding-block`/`border-inline-start` 강조선 적용.
2. `<html dir="rtl">` 로 바꿔 강조선·여백·`text-align: start` 가 자동으로 뒤집히는지 확인.
3. 같은 카드를 물리 속성(`border-left` 등)으로 만든 버전과 비교 — RTL 에서 어긋나는 것 관찰.
4. `writing-mode: vertical-rl` 을 켜고 `block-size`/`inline-size` 가 어떻게 도는지 관찰.

<!-- section: check_question -->
## 이해 점검

1. `inline` 축과 `block` 축은 한국어 기준으로 각각 어느 방향인가?
2. `margin-inline-start` 는 LTR/RTL 에서 각각 어느 쪽 여백인가?
3. `margin-inline: auto` 는 무엇을 대체하나?
4. 논리 속성이 다국어 지원 비용을 줄이는 이유는?

<!-- section: review -->
## 한 줄 정리

**논리 속성(`inline-size`/`block-start`/`margin-inline`…)은 물리 방향 대신 글 흐름·줄 쌓임 축을 기준으로 삼아,
`dir="rtl"` 이나 세로쓰기로 바뀌어도 자동으로 뒤집히므로 다국어 지원용 전용 CSS 를 없앤다.**

<!-- section: next -->
## 다음 Chapter

`web-foundations/web-standards-and-accessibility` — 접근성과 로드 순서.
