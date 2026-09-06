---
id: web-foundations/css-fundamentals/box-model-and-positioning
chapter: web-foundations/css-fundamentals
title: 박스모델과 포지셔닝
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [css, box-model, position, layout]
related_material_ids:
  - 1IJrbFE3fzMN9e3jDbu_oemIG-lU9ciZ-              # WSP_02_CSS2_box_positioning_v2019.pdf
  - 1vIhYSoX7H99c3sYmtCWCw4s5fXPiAdJEITnMoUyFdvo   # css - layout (v2026)
  - 1cWFMPrI5KVaCxr4B0VaS2rP9jZ2Q5Ho5              # layout_ex_final.zip
  - 1swz4tlQwlDZTNZc7k6UN34GzwrXEKb6c              # CSS_P2_BASE.zip
  - 1L-SOl1fBOCZ6kLLUCjhoXi_jDnOjuJvZ              # CSS_P2_FINAL_V202604.zip
sources:
  - reference_slug: css/display-CSS-property
  - reference_slug: css/overflow
code_examples:
  - slug: box-model
    title: content · padding · border · margin
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      *  { box-sizing: border-box; }   /* ★ 거의 항상 첫 줄에 둔다 */

      .card {
        width: 300px;      /* border-box 기준: 테두리까지 포함해 300px */
        padding: 20px;     /* 내용과 테두리 사이 안쪽 여백 */
        border: 2px solid #ccc;
        margin: 16px;      /* 다른 요소와의 바깥 간격 */
      }
      /* box-sizing: content-box (기본) 였다면 실제 폭 = 300 + 20*2 + 2*2 = 344px */
  - slug: display-types
    title: block / inline / inline-block / none
    source_type: generated_minimal
    language: css
    code: |
      .block        { display: block; }         /* 한 줄 차지, width/height/상하 margin 먹음 */
      .inline       { display: inline; }         /* 글자처럼 흐름, width/height 무시, 좌우 margin만 */
      .inline-block { display: inline-block; }   /* 한 줄에 놓이면서 width/height 먹음 */
      .hidden       { display: none; }           /* 렌더 트리에서 제거 (자리도 사라짐) */
      /* cf) visibility: hidden 은 "안 보이지만 자리는 차지" */
  - slug: position
    title: position 4종
    source_type: generated_minimal
    language: css
    code: |
      .a { position: static;   }  /* 기본. top/left 무시 */
      .b { position: relative; top: 10px; }  /* 원래 자리 기준으로 이동. 자리는 유지 */
      .c { position: absolute; top: 0; right: 0; }
      /*   가장 가까운 position!=static 조상 기준. 그런 조상이 없으면 뷰포트 기준. 자리 빠짐 */
      .d { position: fixed;    bottom: 20px; right: 20px; }  /* 뷰포트 고정 (스크롤 무관) */
      .e { position: sticky;   top: 0; }  /* 스크롤하다 top:0 에 닿으면 고정 */

      .parent { position: relative; }  /* absolute 자식의 기준점을 만들 때 흔한 패턴 */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 모든 요소가 **content + padding + border + margin** 상자이고, `box-sizing: border-box` 가 무엇을 바꾸는지 안다.
- `display` 의 block / inline / inline-block / none 차이를 설명하고 고를 수 있다.
- `position` 의 static / relative / absolute / fixed / sticky 를 **구분해서 배치에 쓸 수 있다.**
- `margin` 겹침(collapse), `overflow`, `z-index` 의 기본을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSS 선택자·캐스케이드. (→ `css-fundamentals/selectors-and-cascade`)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `width: 300px` 를 줬는데 실제로는 340px 를 차지한다 → 박스모델(padding/border 포함 여부).
- `<span>` 에 `width` 를 줬는데 안 먹는다 → inline 요소라서.
- 요소를 화면 우상단에 고정하고 싶은데 `margin` 으로 밀다가 반응형에서 다 깨진다 → `position` 을 안 씀.

<!-- section: concept -->
## 박스모델

모든 요소는 4겹의 상자다: **content**(내용) → **padding**(안쪽 여백) → **border**(테두리) → **margin**(바깥 여백).

{{code: box-model}}

- 기본(`content-box`): `width` 는 **content 만**. padding·border 는 그 위에 더해져 실제 폭이 커진다.
- **`box-sizing: border-box`**: `width` 가 **border 까지 포함**. 계산이 직관적이라 **거의 항상 `* { box-sizing: border-box; }`** 로 시작한다.
- **margin 겹침(collapse)**: 위아래로 인접한 두 요소의 상하 margin 은 **큰 값 하나로 합쳐진다**(더해지지 않음).
  좌우 margin 과 fl: 겹치지 않음.

<!-- section: concept | title: display -->
## display

{{code: display-types}}

- **block** (`div`, `p`, `section`…) — 한 줄을 다 차지. `width`/`height`/상하 `margin` 적용.
- **inline** (`span`, `a`, `em`…) — 글자처럼 옆으로 흐름. `width`/`height`/상하 `margin` **무시**.
- **inline-block** — 옆으로 놓이면서 `width`/`height` 는 먹는다. (버튼 나열 등)
- **none** — 렌더에서 제거, **자리도 없어짐**. (`visibility: hidden` 은 자리 유지)
- (다음 챕터) **flex / grid** — 자식 배치를 위한 컨테이너.

<!-- section: mechanism -->
## position

{{code: position}}

| 값 | 기준 | 자리 |
|---|---|---|
| `static` (기본) | 없음 (`top`/`left` 무시) | 문서 흐름대로 |
| `relative` | **자기 원래 자리** | 유지 (겉보기만 이동) |
| `absolute` | 가장 가까운 `position != static` **조상** (없으면 뷰포트) | **흐름에서 빠짐** |
| `fixed` | **뷰포트** | 빠짐. 스크롤해도 고정 |
| `sticky` | 스크롤 위치 | `top` 등에 닿기 전엔 흐름대로, 닿으면 고정 |

**가장 흔한 패턴**: 부모에 `position: relative`, 자식에 `position: absolute` → 자식이 부모 안에서 절대 배치.

`z-index` — `position` 이 static 이 아닌 요소들끼리 겹칠 때 쌓임 순서(큰 값이 위). `overflow: hidden/auto/scroll` —
자식이 넘칠 때 자르기/스크롤.

<!-- section: must_know -->
## 반드시 기억할 것

- **`* { box-sizing: border-box; }`** 로 시작. `width` 계산이 예측 가능해진다.
- 상하 `margin` 은 **겹친다**(합쳐서 큰 값). 간격이 예상과 다르면 이걸 의심.
- `inline` 요소엔 `width`/`height` 가 안 먹는다 → `inline-block` 또는 `block`.
- `position: absolute` 는 **기준 조상**이 필요 → 보통 부모에 `position: relative`.
- `display: none`(자리 없음) vs `visibility: hidden`(자리 유지) vs `opacity: 0`(자리·클릭 유지).
- 레이아웃 전반은 `position` 이 아니라 **flex/grid** 로 한다(다음 챕터). `position` 은 배지·모달·고정 헤더 같은 **국소 배치**용.

<!-- section: experiment -->
## 직접 해 보기

1. `.card { width: 300px; padding: 20px; border: 5px solid; }` 를 `content-box` 와 `border-box` 로 각각 두고
   개발자도구에서 실제 폭을 재 보라.
2. 두 `<p>` 사이의 간격을 `margin-bottom: 30px` + `margin-top: 20px` 로 주고 → 실제 간격이 50 이 아니라 30 인 것을 확인(겹침).
3. 카드 우상단에 "NEW" 배지를 `position: absolute` 로 붙여라. 부모에 `relative` 를 뺐다 넣었다 하며 기준이 바뀌는 걸 보라.
4. 하단 고정 "맨 위로" 버튼을 `position: fixed` 로 만들어라.

<!-- section: check_question -->
## 이해 점검

1. `box-sizing: border-box` 는 `width` 계산에서 무엇을 바꾸나?
2. `<span>` 에 `width: 200px` 가 안 먹는 이유와 해결책은?
3. `position: absolute` 요소의 위치 기준은 무엇으로 정해지나?
4. `display: none` 과 `visibility: hidden` 의 차이는?

<!-- section: interview_question -->
## 면접 대비

- "CSS 박스모델을 설명하고, `border-box` 를 왜 쓰는지 말해 주세요."
- "`position` 5가지 값의 차이와 각각의 사용 사례는?"
- "margin collapsing 이 무엇이고 언제 문제가 되나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 박스 4겹, border-box 가 바꾸는 것, margin 겹침, display 4종, position 5종의 기준과 자리 여부,
> z-index 조건을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**모든 요소는 content+padding+border+margin 상자다 — `border-box` 로 폭을 예측 가능하게 하고,
`display` 로 흐름 방식을, `position` 으로 국소 배치를 정한다. 큰 레이아웃은 다음 챕터의 flex/grid.**

<!-- section: next -->
## 다음 Lesson

`css-fundamentals/backgrounds-and-sprites` — 배경 이미지와 스프라이트.
