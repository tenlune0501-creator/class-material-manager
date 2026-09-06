---
id: web-foundations/css-layout-grid/grid-core
chapter: web-foundations/css-layout-grid
title: CSS Grid 핵심 — 트랙·fr·gap
mastery: required
lesson_kind: lesson
estimated_minutes: 55
tags: [css, grid, layout]
related_material_ids:
  - 1dy9elEZOHNEPppLAHXCxjOnARtPxL0l-ZiTPJH0O9cs   # 01_CSS GRID 핵심
  - 1JG9hpif-NzFB7NQudzAlFA6nkp-28uT7              # rec_imgs (폴더 목록)
  - 1Uqv_9mJM7Z6K-s8CZUQ0yaIBpkcZYg2C              # 01_css_grid.png
  - 1e49Dj7XkF-rrpvI6oXXBF-rp4m3ZYkUX              # 02_grid_gap.jpeg
  - 1vN4i17I8INm6TWQRVe6OblQ7NPCzHbgu              # 03_grid_auto_flow.png
  - 1hnlnjs7cKycd1YT7wo0iG08QqV7S8Xie              # 04_grid_template_columns.png
  - 1lVQ_zfaN8zFrhgav5cQRF8sCNLz2_R3K              # 05_grid_template_row.png
  - 1O4KomINSTzbS8E0T7tUydHfMBw6VwFWN              # 05_grid_template_row2.png
  - 1ngW8gI3KGa5nh9G9616XA8Ue7Cz7dpw6              # 05_grid_template_row3.png
  - 1-6wPnxl8QPhpc22xLty37QwDvcsJ6wO-              # 05_grid_template_row4.png
  - 1RYRArVbH1MU5IjAMuhf265bt0V3PQ_81              # 07_grid_column_gap.png
  - 1_LML0t0Aw1lzE9DEkgxdCV9J1XHBoXI5              # 07_grid_column_gap2.png
  - 1j9dNwKecfOehs0AxBULVz5VVWandYik_              # 07_grid_column_gap3.png
  - 1yIke2M8sgdMmHhLaTsSo29ZJijTef3V2              # 10_grid-template-columns.png
  - 1CymD55bdbdqQp5jdtMd_FbxVgQZPDjL_              # 10_grid-template-columns2.png
  - 1TkJSP7BTkt_esfAXj0CPEyOrr5X8ZUpC              # 10_grid-template-columns3.png
  - 1XS_UHNT7tQdPY-zHFfZhvSxofRwypv4x              # 10_grid-template-columns4.png
sources:
  - reference_slug: css/grid-CSS-property
  - reference_slug: css/grid-template-columns
  - reference_slug: css/grid-template-rows-CSS-property
code_examples:
  - slug: grid-basic
    title: 컨테이너에 트랙 정의
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      .grid {
        display: grid;
        grid-template-columns: 200px 1fr 1fr;  /* 열 3개: 200px 고정 + 나머지를 1:1 */
        grid-template-rows: auto 300px;         /* 행 2개 */
        gap: 16px;                              /* 행·열 간격 (row-gap column-gap 축약) */
      }
      /* fr = 남은 공간의 비율 단위. 1fr 1fr 1fr = 3등분. */
  - slug: grid-repeat
    title: repeat 과 반응형 그리드
    source_type: generated_minimal
    language: css
    code: |
      .cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);   /* 1fr 1fr 1fr 과 동일 */
        gap: 20px;
      }

      /* 미디어쿼리 없이 반응형: "최소 240px, 남으면 채워라" */
      .cards-auto {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
      }
      /* auto-fill: 들어갈 수 있는 만큼 열을 만든다. minmax(240px, 1fr): 최소 240, 최대 남는 공간 */
  - slug: grid-placement
    title: 아이템을 특정 칸에 배치
    source_type: generated_minimal
    language: css
    code: |
      .featured {
        grid-column: 1 / 3;    /* 1번 세로선부터 3번 세로선까지 = 2칸 차지 */
        grid-row: 1 / 2;
      }
      .wide { grid-column: span 2; }   /* 현재 위치에서 2칸 */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Grid 가 **2차원(행+열 동시)** 레이아웃 도구라는 것, Flexbox 와 언제 각각 쓰는지 안다.
- `grid-template-columns` / `grid-template-rows` 로 **트랙**을 정의하고, `fr` 단위와 `repeat()` / `minmax()` / `auto-fill` 을 쓸 수 있다.
- `gap` 으로 간격을, `grid-column` / `grid-row` 로 아이템을 특정 칸에 배치할 수 있다.
- **미디어쿼리 없이** 반응형 카드 그리드를 만들 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Flexbox 기본(축, justify/align, gap). (→ `css-layout-flexbox/flexbox-core`)
- 단위 px, %, 미디어쿼리 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- Flexbox 로 카드 그리드를 만들면 마지막 줄이 어색하게 늘어나거나, 칸 폭이 줄마다 미묘하게 다르다.
- "왼쪽 사이드바 + 상단 헤더 + 본문" 처럼 **행과 열을 같이** 잡아야 하는 레이아웃이 Flexbox 로는 복잡하다.

Grid 는 **격자(행 × 열)를 먼저 그리고 그 칸에 아이템을 놓는다**.

<!-- section: concept -->
## 트랙과 fr

{{code: grid-basic}}

- `display: grid` → 자식들이 grid 아이템. 부모에 **트랙(열/행)** 을 정의한다.
- `grid-template-columns: 200px 1fr 1fr` → 열 3개. `200px` 는 고정, `1fr` 은 **남은 공간의 비율**.
  (`1fr 1fr` = 남은 공간을 1:1 로.)
- `grid-template-rows` → 행. 안 정하면 콘텐츠 높이만큼 자동(`auto`).
- **`gap`** → 칸 사이 간격. Flexbox 의 `gap` 과 같은 개념.

<!-- section: mechanism -->
## repeat · minmax · auto-fill

{{code: grid-repeat}}

- `repeat(3, 1fr)` = `1fr 1fr 1fr`. 개수 반복.
- **`repeat(auto-fill, minmax(240px, 1fr))`** = "한 칸은 최소 240px, 공간이 남으면 최대 `1fr` 까지 늘리고,
  한 줄에 들어갈 수 있는 만큼 열을 만들어라." → **미디어쿼리 없이** 화면이 넓으면 열이 늘고 좁으면 준다.
  실무 카드 그리드의 표준.
- `auto-fill` vs `auto-fit`: 빈 칸을 남기냐(`fill`) 남은 칸을 아이템이 늘려 채우냐(`fit`).

<!-- section: code | lang: css -->
## 아이템 배치

{{code: grid-placement}}

- `grid-column: 1 / 3` — **세로선 번호** 1부터 3까지 = 2칸. (선은 1부터, 열이 3개면 선은 1~4)
- `grid-column: span 2` — 현재 위치에서 2칸 차지.
- `grid-row` 도 동일. 이걸로 "이 카드만 2배 넓게" 같은 걸 한다.

<!-- section: must_know -->
## 반드시 기억할 것

- **Flexbox = 1차원(한 줄/한 열), Grid = 2차원(행+열).** 카드 그리드·페이지 레이아웃은 Grid.
- `fr` = 남는 공간의 비율. `1fr 2fr` = 1:2.
- 반응형 카드: `repeat(auto-fill, minmax(240px, 1fr))` + `gap`. 미디어쿼리 불필요.
- 간격은 `gap`. `margin` 으로 칸 사이를 벌리지 않는다.
- `grid-column: 1 / 3` 의 숫자는 **칸이 아니라 선** 번호.
- 부모는 `display: grid` + 트랙만 정하면, 아이템은 왼→오, 위→아래로 자동 채워진다(다음 Lesson 의 `grid-auto-flow`).

<!-- section: experiment -->
## 직접 해 보기

1. `grid-template-columns` 를 `1fr 1fr 1fr` → `200px 1fr` → `repeat(4, 1fr)` 로 바꿔 가며 관찰.
2. 카드 10개를 `repeat(auto-fill, minmax(220px, 1fr))` + `gap: 16px` 로 놓고, 브라우저 폭을 조절하며
   열 개수가 저절로 바뀌는지 확인하라. `auto-fill` 을 `auto-fit` 으로 바꿔 마지막 줄 동작을 비교.
3. 그 중 첫 카드에 `grid-column: 1 / -1` (첫 선부터 마지막 선까지 = 전체 폭)을 줘 배너처럼 만들어라.

<!-- section: check_question -->
## 이해 점검

1. Flexbox 대신 Grid 를 쓰는 대표 상황 2가지는?
2. `grid-template-columns: 100px 1fr 2fr` 에서 창 폭이 700px 이면 각 열의 폭은?
3. 미디어쿼리 없이 반응형 카드 그리드를 만드는 한 줄은?
4. `grid-column: 2 / 4` 는 몇 칸을 차지하나? 숫자는 무엇의 번호인가?

<!-- section: interview_question -->
## 면접 대비

- "CSS Grid 와 Flexbox 를 언제 각각 선택하나요?"
- "`fr` 단위와 `%` 의 차이는?"
- "`repeat(auto-fit, minmax(...))` 이 하는 일을 설명해 주세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> Grid vs Flexbox 차이, 트랙 정의, fr 의 의미, repeat/minmax/auto-fill, gap, grid-column 의 선 번호를
> 각각 한 줄로. 그다음 반응형 카드 그리드를 코드 없이 설명.

<!-- section: review -->
## 한 줄 정리

**Grid 는 행·열 격자를 먼저 그린다 — `grid-template-columns` 에 `fr`/`repeat`/`minmax`, 간격은 `gap`,
칸 배치는 `grid-column`(선 번호). 반응형 카드는 `repeat(auto-fill, minmax(px, 1fr))`.**

<!-- section: next -->
## 다음 Lesson

`css-layout-grid/grid-areas-and-auto-flow` — 영역에 이름을 붙이고 흐름을 제어.
