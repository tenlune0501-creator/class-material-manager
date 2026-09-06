---
id: web-foundations/css-fundamentals/selectors-and-cascade
chapter: web-foundations/css-fundamentals
title: 선택자와 캐스케이드
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [css, selectors, specificity, cascade]
related_material_ids:
  - 1Qd3kB6lwdBYkf-odC4A_EOu5NY8e22Lf              # WSP_02_CSS_01_BASIC_v2019.2
  - 1k7WygVfG3-G6Bx6ubTdNoVyiLwL31vZeQZ4B7OZ_E_Q   # HTML & CSS 핵심정리
  - 1YDCfnjIjNUkg6ISOxoUOmxgja_TSgo8l              # CSS_P1_BASE.zip
  - 1dKeDl5-zCxTbWOMWlvgAf1VV91YNb_nT              # CSS_P1_FINAL_V202604.zip
code_examples:
  - slug: selector-kinds
    title: 선택자 종류
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      *              { box-sizing: border-box; }   /* 전체 */
      h1             { color: navy; }               /* 태그(요소) */
      .card          { padding: 16px; }             /* 클래스 (재사용, 가장 많이 씀) */
      #hero          { height: 400px; }             /* id (페이지에 하나) */
      a[target]      { color: teal; }               /* 속성 있는 것 */
      .card p        { margin: 0; }                 /* 후손 (.card 안의 모든 p) */
      .card > p      { margin: 0; }                 /* 자식 (.card 바로 아래 p) */
      li:first-child { font-weight: bold; }         /* 가상 클래스 */
      a:hover        { text-decoration: underline; }/* 상태 */
      .btn::before   { content: "▶ "; }             /* 가상 요소 */
      h1, h2, h3     { line-height: 1.2; }          /* 그룹 (콤마) */
  - slug: cascade-demo
    title: 같은 요소에 규칙이 여럿일 때
    source_type: generated_minimal
    language: css
    code: |
      /* HTML: <p class="note important" id="msg">…</p> */
      p              { color: black; }   /* 명시도 0,0,1 */
      .note          { color: green; }   /* 명시도 0,1,0 → 이김 */
      .note.important{ color: blue;  }   /* 명시도 0,2,0 → 더 이김 */
      #msg           { color: red;   }   /* 명시도 1,0,0 → 최종 승자 */
      /* p { color: purple !important; }  ← !important 는 명시도를 무시하고 이김. 남용 금지 */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- CSS 규칙이 `선택자 { 속성: 값; }` 구조라는 것과, HTML 에 CSS 를 연결하는 3가지 방법을 안다.
- 클래스·id·후손·자식·가상클래스·가상요소 선택자를 **골라서 쓸 수 있다.**
- 한 요소에 규칙이 여럿 적용될 때 **누가 이기는지**(캐스케이드: 출처 → 명시도 → 순서)를 설명할 수 있고,
  `!important` 를 왜 피하는지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 태그·클래스·id 속성. 시맨틱 구조.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 색을 바꿨는데 화면이 안 변한다 → 더 "센" 다른 규칙이 이기고 있다.
- 그래서 `!important` 를 붙인다 → 다음 사람도 `!important` 를 붙인다 → 아무도 못 고치는 CSS.
- 모든 것에 `#id` 를 쓴다 → 재사용이 안 되고 명시도가 너무 높아진다.

"안 먹히는 CSS"의 90%는 **캐스케이드**를 모르는 것이다.

<!-- section: concept -->
## CSS 를 HTML 에 연결하기

```html
<link rel="stylesheet" href="style.css" />   <!-- ① 외부 파일. 실무는 대부분 이것 -->
<style> h1 { color: navy; } </style>          <!-- ② <head> 안 -->
<h1 style="color: navy;">…</h1>               <!-- ③ 인라인. 지양(재사용·유지보수 X) -->
```

## 선택자

{{code: selector-kinds}}

- **클래스 `.name`** — 실무의 주력. 여러 요소에 재사용, HTML 에서 `class="a b c"` 로 조합.
- **id `#name`** — 페이지에 하나. 명시도가 매우 높아 스타일용으로는 아껴 쓴다(주로 JS·앵커용).
- **후손 `.a b`** (공백) vs **자식 `.a > b`** (`>`) — 전자는 모든 깊이, 후자는 바로 아래만.
- **가상 클래스 `:hover` `:first-child` `:nth-child(2n)`** — 상태·위치.
- **가상 요소 `::before` `::after`** — 실제 요소가 아닌 것을 만들어 스타일(`content` 필요).

<!-- section: mechanism -->
## 캐스케이드 — 누가 이기나

한 요소의 한 속성에 여러 규칙이 걸리면, 이 순서로 승자를 정한다:

1. **출처·중요도** — `!important` > 일반. (보통 우리 CSS 끼리는 여기서 안 갈림)
2. **명시도(specificity)** — `(id 개수, 클래스·속성·가상클래스 개수, 태그·가상요소 개수)` 를
   자릿수처럼 비교. `#msg`(1,0,0) > `.note.important`(0,2,0) > `.note`(0,1,0) > `p`(0,0,1).
   인라인 `style=""` 은 그보다 위.
3. **소스 순서** — 명시도가 **같으면**, **나중에 쓴 규칙**이 이긴다.

{{code: cascade-demo}}

**상속**: `color`, `font-*` 같은 일부 속성은 부모 → 자식으로 자동 전달된다.
`margin`, `border`, `background` 등은 상속 안 됨.

<!-- section: must_know -->
## 반드시 기억할 것

- 실무 선택자는 **클래스**. id 는 명시도가 너무 높아 재사용·오버라이드가 어려워진다.
- 안 먹히면 개발자도구 **Styles 패널**에서 어떤 규칙이 이기고 무엇이 취소선(overridden)인지 본다.
- 명시도 비교: id > 클래스/속성/가상클래스 > 태그. 같으면 **나중 규칙** 승리.
- **`!important` 는 최후의 수단.** 한 번 쓰면 그걸 이기려고 또 `!important` → 악순환.
  대신 선택자를 다듬거나 순서를 조정한다.
- `color`/`font` 는 상속됨. `margin`/`border`/`background` 는 상속 안 됨.
- 팀에선 보통 **명시도를 낮고 평평하게**(클래스 위주, 중첩 얕게) 유지한다.

<!-- section: experiment -->
## 직접 해 보기

1. `<p class="a b" id="c">` 에 `p`, `.a`, `.a.b`, `#c` 로 각각 다른 `color` 를 주고, 최종 색을 예측한 뒤 확인하라.
2. 규칙 두 개를 **같은 명시도**로 만들고 순서를 바꿔 가며 승자가 바뀌는지 보라.
3. 개발자도구 Styles 패널에서 취소선 그어진 규칙을 찾아, 왜 졌는지(명시도? 순서?) 말해 보라.
4. `.card p` 와 `.card > p` 를 3단 중첩 구조에 적용해 차이를 눈으로 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `.menu li a` 와 `.menu > li > a` 의 차이는?
2. `p`(태그), `.note`(클래스), `#msg`(id) 규칙이 같은 `color` 를 다르게 줄 때 승자와 이유는?
3. `!important` 를 피해야 하는 이유를 한 문장으로.
4. 부모에 `color: red` 를 줬는데 자식 글자색이 안 바뀌는 속성의 예는?(상속 안 되는 것)

<!-- section: interview_question -->
## 면접 대비

- "CSS 캐스케이드와 명시도를 설명해 주세요."
- "왜 id 선택자보다 클래스 선택자를 선호하나요?"
- "`!important` 를 언제 쓰고, 왜 대개 피하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> CSS 연결 3방법, 선택자 6종, 캐스케이드 3단계(출처→명시도→순서), 명시도 계산법, 상속되는/안 되는 속성,
> `!important` 를 피하는 이유를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**한 요소에 규칙이 겹치면 출처 → 명시도(id>클래스>태그) → 소스 순서로 승자를 정한다 —
실무는 클래스 위주로 명시도를 낮게 유지하고, `!important` 는 쓰지 않는다.**

<!-- section: next -->
## 다음 Lesson

`css-fundamentals/box-model-and-positioning` — 모든 요소는 상자다.
