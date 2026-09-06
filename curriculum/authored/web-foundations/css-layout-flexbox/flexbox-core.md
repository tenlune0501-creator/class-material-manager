---
id: web-foundations/css-layout-flexbox/flexbox-core
chapter: web-foundations/css-layout-flexbox
title: Flexbox 핵심 — 축과 정렬
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [css, flexbox, layout]
related_material_ids:
  - 1bz3nNb6yKnf3SOwPyo2a00GZHN84sTDuR1v__e0Ty_s   # 00_FLEX_SUMMARY
  - 1KQXiYrN-e2elFKAS4S5ttfjbUIA16Ycf              # flexbox_base_2020v.zip
  - 1dLMDsMH_EkhNXtJTQw2W_S_5fVFci0Sm              # flexbox_base_202604_f.zip
sources:
  - reference_slug: css/flex
  - reference_slug: css/flex-direction
  - reference_slug: css/justify-content
  - reference_slug: css/align-items
code_examples:
  - slug: flex-container
    title: 부모에 주는 속성 (컨테이너)
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      .row {
        display: flex;              /* 자식들이 flex item 이 된다. 기본: 가로 한 줄 */
        flex-direction: row;        /* row(기본) | row-reverse | column | column-reverse */
        justify-content: center;    /* 주축 정렬: flex-start(기본)|flex-end|center|space-between|space-around|space-evenly */
        align-items: center;        /* 교차축 정렬: stretch(기본)|flex-start|flex-end|center|baseline */
        flex-wrap: wrap;            /* nowrap(기본, 안 넘김) | wrap(넘치면 다음 줄) */
        gap: 16px;                  /* item 사이 간격 (margin 보다 이걸 쓴다) */
      }
  - slug: flex-item
    title: 자식에 주는 속성 (아이템)
    source_type: generated_minimal
    language: css
    code: |
      .item {
        flex: 1;          /* = flex: 1 1 0  → 남은 공간을 1:1 로 나눠 가짐 (균등) */
      }
      .sidebar { flex: 0 0 240px; }  /* grow 0, shrink 0, basis 240px → 고정 240 */
      .main    { flex: 1; }          /* 나머지 전부 */

      /* flex: <grow> <shrink> <basis>
         grow   : 남는 공간을 얼마 비율로 가져갈지 (0 이면 안 커짐)
         shrink : 공간 부족 시 얼마 비율로 줄어들지 (0 이면 안 줄어듦)
         basis  : 시작 크기 (auto | 0 | 200px) */
      .item-b { align-self: flex-end; }  /* 이 아이템만 교차축 정렬 다르게 */
      .item-c { order: -1; }             /* 시각적 순서만 앞으로 (DOM 순서는 그대로) */
  - slug: center-anything
    title: 완벽한 가운데 정렬
    source_type: generated_minimal
    language: css
    code: |
      .center {
        display: flex;
        justify-content: center;   /* 가로 가운데 */
        align-items: center;       /* 세로 가운데 */
        min-height: 100vh;
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Flexbox 가 **1차원(한 방향) 레이아웃** 도구라는 것과 **주축/교차축** 개념을 설명할 수 있다.
- 부모(`display: flex` + `flex-direction` + `justify-content` + `align-items` + `gap` + `flex-wrap`)와
  자식(`flex`, `align-self`, `order`) 속성을 **골라서 레이아웃을 직접 짤 수 있다.**
- `flex: 1` 과 `flex: 0 0 240px` 이 무엇을 의미하는지 안다.
- 요소를 가로·세로 가운데 정렬할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 박스모델, `display` 종류, 단위(px, %, vh). (→ `css-fundamentals/box-model-and-positioning`)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

`float` / `position` 으로 가로 배치를 하면 — 높이가 안 맞고, 가운데 정렬이 안 되고,
아이템 개수가 바뀌면 다 깨진다. "세로 가운데 정렬"은 오랫동안 CSS 의 악몽이었다.
Flexbox 는 **"한 줄(또는 한 열)에 아이템을 늘어놓고 정렬한다"** 를 위한 전용 도구다.

<!-- section: concept -->
## 주축(main axis)과 교차축(cross axis)

- `display: flex` 를 준 요소 = **flex 컨테이너**, 그 직계 자식 = **flex 아이템**.
- **주축** = `flex-direction` 방향. `row`(기본, 가로) 또는 `column`(세로).
- **교차축** = 주축에 수직.
- `justify-content` = **주축** 방향 정렬. `align-items` = **교차축** 방향 정렬.
  → `flex-direction` 을 바꾸면 이 둘의 의미도 90도 회전한다.

{{code: flex-container}}

<!-- section: mechanism -->
## `flex` 축약 — grow / shrink / basis

{{code: flex-item}}

`flex: <grow> <shrink> <basis>`:

- **basis** — 시작 크기. `auto`(콘텐츠 크기) / `0` / `200px`.
- **grow** — **남는** 공간을 이 아이템이 가져갈 비율. `0` 이면 안 커짐. `1` 씩이면 균등 분배.
- **shrink** — 공간이 **부족할 때** 줄어들 비율. `0` 이면 안 줄어듦(넘침 감수).

자주 쓰는 것만:
- `flex: 1` = `1 1 0` → 남은 공간 균등 분배 (여러 개면 똑같은 폭).
- `flex: 0 0 240px` → 딱 240px 고정 (안 커지고 안 줄어듦). 사이드바.
- `flex: auto` = `1 1 auto` → 콘텐츠 크기 유지하되 남는 공간은 나눠 가짐.

<!-- section: code | lang: css -->
## 가운데 정렬

{{code: center-anything}}

세 줄이면 끝난다: `display: flex` + `justify-content: center` + `align-items: center`.

<!-- section: must_know -->
## 반드시 기억할 것

- Flexbox 는 **한 방향**(row 또는 column). 행+열 동시 격자는 **Grid**(다음 챕터).
- `justify-content` = 주축, `align-items` = 교차축. `flex-direction` 바꾸면 축도 바뀐다.
- 아이템 사이 간격은 `margin` 이 아니라 **`gap`**.
- `flex: 1` = 균등, `flex: 0 0 <px>` = 고정.
- `align-items` 기본값은 `stretch` — 아이템이 교차축으로 늘어난다(높이 자동 통일). 원치 않으면 `flex-start`.
- `flex-wrap: nowrap` 이 기본 → 좁아지면 아이템이 줄어들다가 넘친다. 카드 그리드는 `wrap` + 아이템에 `flex-basis`.
- `order` 는 **시각 순서만** 바꾼다. 접근성·탭 순서는 DOM 순서 그대로 → 남용 주의.

<!-- section: experiment -->
## 직접 해 보기

1. 박스 3개를 `display: flex` 로 감싸고 `justify-content` 를 6가지 값으로 바꿔 가며 관찰하라.
   `flex-direction: column` 으로 바꾼 뒤 `justify-content`/`align-items` 의 방향이 회전하는 것을 확인.
2. `sidebar`(`flex: 0 0 240px`) + `main`(`flex: 1`) 2단 레이아웃을 만들어라. 창을 좁혀도 사이드바가 240 을 지키는지 보라.
3. 카드 6개를 `flex-wrap: wrap` + `.card { flex: 1 1 200px; }` 로 반응형 그리드처럼 만들어 보라.
4. 아무 요소나 화면 정중앙에 놓아 보라(3줄).

<!-- section: check_question -->
## 이해 점검

1. `justify-content` 와 `align-items` 는 각각 어느 축을 정렬하나? `flex-direction: column` 이면?
2. `flex: 1` 과 `flex: 0 0 240px` 의 차이를 한 문장씩.
3. 아이템 높이가 저절로 같아지는 이유는? 안 그러게 하려면?
4. 아이템 사이 간격에 `margin` 대신 무엇을 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "Flexbox 와 Grid 를 언제 각각 쓰나요?"
- "`flex: 1` 은 `flex-grow`/`shrink`/`basis` 로 풀면 무엇인가요?"
- "요소를 수직·수평 가운데 정렬하는 방법 몇 가지를 말해 주세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 주축/교차축, 컨테이너 6속성, `flex` 3값의 의미, `flex: 1` vs `flex: 0 0 px`, gap, align-items 기본값,
> order 의 한계를 각각 한 줄로. 그다음 2단 레이아웃을 코드 없이 설계.

<!-- section: review -->
## 한 줄 정리

**Flexbox 는 한 방향으로 아이템을 늘어놓고 정렬한다 — 부모에 `display: flex`+방향+`justify-content`(주축)
+`align-items`(교차축)+`gap`, 자식에 `flex`(1=균등, 0 0 px=고정). 2차원 격자는 Grid.**

<!-- section: next -->
## 다음 Lesson

`css-layout-flexbox/flexbox-navigation-practice` — 실전 내비게이션 바.
