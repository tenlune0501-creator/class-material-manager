---
id: web-foundations/css-layout-grid/grid-areas-and-auto-flow
chapter: web-foundations/css-layout-grid
title: 영역 이름과 auto-flow
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [css, grid, grid-template-areas, auto-flow]
related_material_ids:
  - 19zTTram0-JqtXFiR_lBbBwflt_oqnfZq              # 13_grid-template-areas.png
  - 1Hw8_xfPCQ1huxYnrJhgA2QJ1q2nDyD7w              # 13_grid-template-areas2.png
  - 1knQKx0H-jpjevp2hB14R2JIcD0XV9UbU              # 13_grid-template-areas3.png
  - 1Mu3Q3ghbBV2m79gLWOE5_HMZDEK-5jd2              # 14_Naming_Lines.png
  - 1FabTfw5s-0xJvbjyC9JB95AML7f2gCs0              # 06_auto_flow.png
  - 1AeJFQzhRIb60TVaPTk1fxDsMDmpyZRpR              # 08_frection.png
  - 1pltXJEAT26pcUrupi57ixKaLItxyUS4y              # 08_frection2.png
  - 1jzV0jK-E6kVsuc8bRxaE6Lc1qzcgtaOG              # 08_frection3.png
  - 1uA0vx-7teQZ99BQG4qXlsrPcDySzeh-l              # 08_frection4.png
  - 1vCpPPPIuI_H4WlKSyU8vvfhkekfM1iuU              # 09_grid-column.png
  - 1y7W44sBop-tJJ4Nspv8GDdewyROkaTEu              # 09_grid-column2.png
  - 1rQ2B3Eu4-1Pk9--3pjX6gYyyvudmysmz              # 11_image_max-content.png
  - 1nfHn8DYmn3Oy_rFT3muczNUI5U0OHEua              # 12_Align_self.png
  - 1oaks_FRL0Tvtb9fUtV3lP6DBBSloH5o2              # 12_Justify_self.png
sources:
  - reference_slug: css/grid-template-CSS-property
code_examples:
  - slug: template-areas
    title: 페이지 레이아웃을 그림처럼
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      .layout {
        display: grid;
        grid-template-columns: 240px 1fr;
        grid-template-rows: 60px 1fr 40px;
        grid-template-areas:
          "header  header"
          "sidebar main"
          "footer  footer";
        min-height: 100vh;
        gap: 8px;
      }
      .layout > header  { grid-area: header;  }
      .layout > .side   { grid-area: sidebar; }
      .layout > main    { grid-area: main;    }
      .layout > footer  { grid-area: footer;  }
      /* "." 을 쓰면 빈 칸: "header header" / "sidebar ." */
  - slug: auto-flow
    title: 자동 배치 흐름
    source_type: generated_minimal
    language: css
    code: |
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-flow: row;      /* 기본: 왼→오 채우고 다음 행. column 이면 위→아래 먼저 */
        grid-auto-rows: 120px;    /* 명시 안 한 행(자동 생성)의 높이 */
      }
      .grid .tall { grid-row: span 2; }   /* 빈 칸이 생기면 dense 로 메울 수도 */
      .grid { grid-auto-flow: row dense; } /* 뒤 아이템을 당겨 구멍 메움 (순서 뒤바뀔 수 있음) */
  - slug: item-align
    title: 개별 칸 정렬
    source_type: generated_minimal
    language: css
    code: |
      .grid {
        justify-items: stretch;  /* 칸 안에서 가로 정렬 (start|end|center|stretch) — 전체 */
        align-items: stretch;    /* 세로 정렬 — 전체 */
      }
      .grid .badge {
        justify-self: end;       /* 이 아이템만 오른쪽 */
        align-self: start;       /* 이 아이템만 위 */
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`grid-template-areas`** 로 페이지 레이아웃(header/sidebar/main/footer)을 "그림처럼" 정의하고 아이템을 `grid-area` 로 배치할 수 있다.
- `grid-auto-flow` 와 `grid-auto-rows` 로 자동 배치되는 아이템의 흐름·크기를 제어한다.
- `justify-items` / `align-items`(전체)와 `justify-self` / `align-self`(개별)로 칸 안 정렬을 한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `css-layout-grid/grid-core` (트랙, fr, gap, grid-column).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

`grid-column: 1 / 2; grid-row: 2 / 3;` 같은 숫자를 아이템마다 세는 건 실수하기 쉽고, 나중에 레이아웃을
바꾸면 전부 다시 세야 한다. 반응형에서 "모바일에선 사이드바를 아래로" 같은 재배치도 번거롭다.

<!-- section: concept -->
## `grid-template-areas` — ASCII 아트로 배치

{{code: template-areas}}

- 부모에서 격자를 **문자열 그림**으로 그린다. 각 문자열 = 한 행, 각 단어 = 한 칸.
- 같은 이름을 이웃하게 반복하면 그 영역이 **여러 칸에 걸친다**(`"header header"` = 2칸).
- `.` = 빈 칸.
- 아이템에는 `grid-area: <이름>` 만 주면 그 자리에 들어간다. **숫자를 안 센다.**
- **반응형이 쉽다**: `@media` 안에서 `grid-template-areas` 와 `grid-template-columns` 만 다시 그리면 재배치 끝.

<!-- section: mechanism -->
## 자동 배치 흐름

{{code: auto-flow}}

- 위치를 지정 안 한 아이템은 `grid-auto-flow` 방향(`row` 기본)으로 자동 채워진다.
- 트랙에 없는 행이 필요하면 **자동으로 행이 생기고**, 그 높이는 `grid-auto-rows` 로 정한다.
- `grid-auto-flow: row dense` — 앞에서 생긴 빈 칸을 뒤 아이템으로 메운다. 대신 **DOM 순서와 시각 순서가 어긋날 수 있어** 접근성 주의.

<!-- section: code | lang: css -->
## 칸 안 정렬

{{code: item-align}}

- `justify-items`/`align-items` — 부모에 주면 **모든 칸**의 콘텐츠 정렬(가로/세로).
- `justify-self`/`align-self` — 아이템에 주면 **그 칸만**.
- 컨테이너 자체를 정렬하는 `justify-content`/`align-content` 도 있다(트랙 합이 컨테이너보다 작을 때).

<!-- section: must_know -->
## 반드시 기억할 것

- 페이지 레이아웃(헤더·사이드·본문·푸터)은 **`grid-template-areas`** 가 가장 읽기 쉽다 — 숫자 안 셈, 반응형 재배치 쉬움.
- `grid-area: 이름` ↔ 부모의 `grid-template-areas` 문자열 안 이름.
- 자동 생성되는 행 높이는 `grid-auto-rows`. 흐름 방향은 `grid-auto-flow`.
- `dense` 는 구멍은 메우지만 순서를 흩뜨린다 — 폼·리스트엔 쓰지 말 것.
- 칸 정렬: 전체는 `*-items`, 개별은 `*-self`. Flexbox 와 이름이 통일돼 있다.

<!-- section: mission -->
## 미션 — 대시보드 레이아웃

`grid-template-areas` 로 만든다:

- 데스크톱: `header`(상단 전체) / 왼쪽 `nav`(240px) + 가운데 `main`(1fr) + 오른쪽 `aside`(300px) / `footer`(하단 전체).
- `main` 안은 별도 grid: 통계 카드 4개를 `repeat(auto-fill, minmax(200px, 1fr))`, 그중 첫 카드는 2칸.
- `@media (max-width: 900px)`: `aside` 를 `main` 아래로. `@media (max-width: 600px)`: `nav` 도 위로,
  전부 1열. → `grid-template-areas` 와 `grid-template-columns` 만 다시 그려서.

<!-- section: check_question -->
## 이해 점검

1. `grid-template-areas` 로 배치할 때 아이템에는 무엇만 주면 되나?
2. "모바일에선 사이드바를 본문 아래로" 를 areas 로 어떻게 하나?
3. `grid-auto-rows` 는 어떤 행의 높이를 정하나?
4. `justify-items` 와 `justify-self` 의 차이는?

<!-- section: interview_question -->
## 면접 대비

- "`grid-template-areas` 의 장점은? 언제 이걸, 언제 `grid-column` 숫자를 쓰나요?"
- "`grid-auto-flow: dense` 의 트레이드오프는?"

<!-- section: review -->
## 한 줄 정리

**`grid-template-areas` 로 레이아웃을 문자열 그림으로 그리고 아이템엔 `grid-area: 이름` 만 준다 —
반응형은 areas 를 다시 그리면 끝. 자동 배치는 `grid-auto-flow`/`grid-auto-rows`, 칸 정렬은 `*-items`/`*-self`.**

<!-- section: next -->
## 다음 Lesson

`css-layout-grid/grid-card-ui-practice` — Grid + Flexbox 로 카드 UI 실전.
