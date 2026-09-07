---
id: tenlune/responsive-css-system
project: tenlune
title: 반응형 CSS 시스템 — 브레이크포인트와 유동 단위
unit_kind: feature
feature_area: 스타일링
concepts: [반응형 레이아웃, 미디어 쿼리, clamp/rem/em, 그리드 붕괴, 가로 스크롤 방지]
related_lessons:
  - web-foundations/responsive-and-modern-css/responsive-layout
  - web-foundations/responsive-and-modern-css/logical-properties
  - web-foundations/css-layout-grid/grid-core
  - web-foundations/css-fundamentals/box-model-and-positioning
---

<!-- section: role -->
## 이 코드가 하는 일

`wp-content/themes/tenlune/assets/css/tenlune.css` — 사이트 전체의 반응형 스타일. **35개의 `@media`
쿼리**(400~1040px)와 `rem`/`em`/`clamp()` 로, 그리드가 모바일에서 1열로 정확히 붕괴하고 가로 스크롤을
유발할 고정 너비가 없다.

<!-- section: code -->
## 핵심 코드 읽기

```css
:root {
  /* theme.json 이 만든 CSS 변수를 짧은 이름으로 다시 잡는다 (디자인 토큰) */
  --tl-bg:   var(--wp--preset--color--base);
  --tl-text: var(--wp--preset--color--contrast);
  --tl-f-disp: var(--wp--preset--font-family--display);
  --tl-s-3: var(--wp--preset--spacing--30);   /* 1.6rem */
  --tl-s-5: var(--wp--preset--spacing--50);   /* 4rem   */
  --tl-max: 1180px;      /* 콘텐츠 최대 폭 */
  --tl-pad: 1.5rem;      /* 좌우 여백 */
}

/* 기본(모바일)은 1열. 넓어지면 다열로 */
@media (min-width: 900px) {
  .tl-grid { grid-template-columns: repeat(2, 1fr); }
}
/* 아주 좁은 화면 전용 보정 */
@media (max-width: 619px) { /* ... */ }
```

- **모바일 퍼스트**: 기본 스타일이 좁은 화면 기준, `min-width` 쿼리로 넓어질 때 열을 늘린다.
- 폭·여백·글자 크기가 `px` 상수가 아니라 `rem`/`clamp()` → 사용자 글꼴 설정을 존중하고 화면에 따라 유동.

<!-- section: why -->
## 왜 이렇게 했나

- 고정 `width: 1200px` 같은 값이 하나라도 있으면 모바일에서 가로 스크롤이 생긴다 → `max-width` + `%`/`rem`.
- 브레이크포인트를 여러 개(400·620·640·860·900·1000·1040) 둔 이유: 콘텐츠가 어색해지는 지점마다 보정.
- 토큰(`--tl-*`)을 CSS 변수로 잡으면 색·간격을 한 곳에서 바꿔도 전체에 퍼진다.

<!-- section: framework_role -->
## theme.json 이 대신하는 것

WordPress FSE는 `theme.json` 의 색·폰트·스페이싱 정의를 `--wp--preset--*` CSS 변수로 자동 생성한다.
`tenlune.css` 는 그 변수를 짧은 별칭으로 다시 잡아 쓴다 — 값의 단일 소스는 `theme.json`.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `web-foundations/responsive-and-modern-css/responsive-layout` — 미디어 쿼리·모바일 퍼스트
- `web-foundations/responsive-and-modern-css/logical-properties` — `padding-inline` 등
- `web-foundations/css-layout-grid/grid-core` — 그리드 열 정의

<!-- section: caution -->
## 주의점

- 이미 촘촘하게 구성돼 있으니 **재작업하지 않는다**(프로젝트 CLAUDE.md 명시). 읽고 패턴만 배운다.
- 브레이크포인트를 늘리기 전에 "이 지점에서 무엇이 어색한가" 를 먼저 확인 — 숫자만 늘리면 유지보수가 어렵다.

<!-- section: experiment -->
## 작은 실습

1. 브라우저 개발자도구로 화면 폭을 400→1200px 로 줄였다 늘리며 그리드 열 수가 바뀌는 지점을 기록하라.
2. 임의의 요소에 `width: 1400px` 를 넣어 가로 스크롤을 만들어 보고, `max-width: 100%` 로 고쳐라.
3. `--tl-s-3` 값을 바꿨을 때 어떤 요소들의 간격이 함께 바뀌는지 관찰하라.

<!-- section: check_question -->
## 이해 점검

1. "모바일 퍼스트" 로 짠다는 게 미디어 쿼리에서 어떻게 드러나나?
2. 고정 `px` 폭이 모바일에서 만드는 문제는?
3. `--tl-*` 변수의 값은 어디가 원본인가?

<!-- section: review -->
## 한 줄 정리

**Tenlune의 CSS는 theme.json 토큰을 CSS 변수로 받아, 모바일 퍼스트 + `rem`/`clamp()` + 35개 `@media`
쿼리로 그리드가 화면 폭마다 자연스럽게 붕괴하고 가로 스크롤이 없게 만든다.**
