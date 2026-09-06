---
id: web-foundations/css-layout-flexbox/flexbox-navigation-practice
chapter: web-foundations/css-layout-flexbox
title: 실전 — Flexbox로 내비게이션 만들기
mastery: practical
lesson_kind: lesson
estimated_minutes: 45
tags: [css, flexbox, navigation, practice]
related_material_ids:
  - 1cqQya4ua9cIqZ3gxpu2xR6sSDqCrJ9CF              # striped_navigation_base.zip
  - 1El27_13sIpf9TbdF_qMKmt6LISeYyqH2              # striped_navigation_FINAL_V202604.zip
code_examples:
  - slug: navbar
    title: 로고 왼쪽 · 메뉴 오른쪽 헤더
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <header class="nav">
        <a class="nav__logo" href="/">MySite</a>
        <nav class="nav__menu">
          <a href="/">Home</a>
          <a href="/work">Work</a>
          <a href="/about">About</a>
        </nav>
        <button class="nav__cta">문의</button>
      </header>
  - slug: navbar-css
    title: navbar CSS
    source_type: generated_minimal
    language: css
    code: |
      .nav {
        display: flex;
        align-items: center;          /* 세로 가운데 정렬 */
        gap: 24px;
        padding: 0 24px;
        height: 60px;
        border-bottom: 1px solid #eee;
      }
      .nav__menu {
        display: flex;
        gap: 20px;
        margin-left: auto;            /* ★ 남는 공간을 왼쪽에 몰아 → 메뉴를 오른쪽으로 */
      }
      .nav__cta { /* margin-left: auto 를 menu 대신 여기 주면 CTA만 오른쪽 */ }
      .nav a { text-decoration: none; color: #333; }
      .nav a:hover { color: #0070f3; }
  - slug: navbar-responsive
    title: 좁아지면 세로로
    source_type: generated_minimal
    language: css
    code: |
      @media (max-width: 600px) {
        .nav { flex-direction: column; align-items: stretch; height: auto; padding: 12px; }
        .nav__menu { margin-left: 0; justify-content: space-between; }
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- "로고는 왼쪽, 메뉴는 오른쪽, 전부 세로 가운데" 같은 **실전 헤더**를 Flexbox 로 직접 만들 수 있다.
- **`margin-left: auto`** 트릭(남는 공간을 한쪽에 몰아 요소를 반대편으로 밀기)을 쓸 수 있다.
- 좁은 화면에서 `flex-direction: column` 으로 전환하는 반응형 내비를 만들 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `css-layout-flexbox/flexbox-core` (주축/교차축, justify/align, gap, flex).
- 미디어 쿼리를 처음 보면 "`@media (max-width: N)` 안의 규칙은 화면이 N 이하일 때만 적용" 정도만.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

헤더를 `float` 이나 `position: absolute` 로 만들면 — 메뉴 항목 수가 바뀌면 위치가 틀어지고,
로고와 메뉴의 세로 정렬이 안 맞고, 모바일에서 통째로 깨진다.
Flexbox 로 하면 **항목이 늘거나 줄어도 알아서** 배치된다.

<!-- section: concept | title: 구조 -->
## 마크업 먼저

{{code: navbar}}

시맨틱하게: `<header>` 안에 로고(`<a>`), 메뉴(`<nav>` 안에 링크들), CTA 버튼.

<!-- section: mechanism -->
## `margin-left: auto` — 오른쪽으로 밀기

{{code: navbar-css}}

- `.nav { display: flex; align-items: center; }` → 로고·메뉴·버튼이 한 줄, 세로 가운데.
- **`.nav__menu { margin-left: auto; }`** → flex 아이템의 한쪽 `margin` 을 `auto` 로 주면
  **남는 공간을 전부 그쪽에 먹는다** → 메뉴가 오른쪽으로 밀린다.
  (`justify-content: space-between` 는 "로고 | 메뉴 | 버튼" 을 3등분해 흩어 놓지만,
  `margin-left: auto` 는 "여기서부터 오른쪽 그룹" 을 만들 때 정확하다.)
- 메뉴 내부 링크 간격은 `.nav__menu { gap: 20px; }`.

<!-- section: code | lang: css -->
## 반응형 — 좁으면 세로로

{{code: navbar-responsive}}

`@media (max-width: 600px)` 안에서 `flex-direction: column` 으로 바꾸면 같은 마크업이 세로 메뉴가 된다.

<!-- section: must_know -->
## 반드시 기억할 것

- **한 줄 헤더 = `display: flex` + `align-items: center`** 로 시작.
- 요소를 반대편으로 밀 때: 그 요소에 `margin-<방향>: auto`.
- 링크 간격은 `gap`(부모 `.nav__menu` 에). `<a>` 사이에 `&nbsp;` 나 `margin` 나열 금지.
- 반응형은 `@media` 안에서 `flex-direction` 만 바꿔도 큰 전환이 된다.
- 접근성: 메뉴는 `<nav>` 로 감싸고, 링크에는 실제 `href`. `:hover` 뿐 아니라 `:focus` 스타일도.

<!-- section: mission -->
## 미션

1. `navbar` 마크업으로 헤더를 만들되 요구사항:
   - 로고 왼쪽, 메뉴 4개 오른쪽, 그 오른쪽 끝에 "로그인" 버튼.
   - 전체 높이 64px, 세로 가운데, 좌우 패딩 32px, 하단 1px 보더.
   - 메뉴 링크: 밑줄 없음, `:hover` 시 색 + `:focus` 시 외곽선.
2. `@media (max-width: 640px)` 에서 메뉴를 세로로 펼치고 로그인 버튼을 전체폭으로.
3. `margin-left: auto` 를 `justify-content: space-between` 으로 바꿨을 때 배치가 어떻게 달라지는지
   직접 비교하고, 왜 이 경우엔 `margin: auto` 가 나은지 한 줄로 설명하라.

<!-- section: check_question -->
## 이해 점검

1. flex 아이템에 `margin-left: auto` 를 주면 무슨 일이 일어나나?
2. `justify-content: space-between` 과 `margin-left: auto` 는 각각 언제 쓰나?
3. 메뉴 링크 사이 간격은 어디에 무엇으로 주나?
4. 반응형에서 세로 메뉴로 바꾸려면 미디어쿼리 안에서 무엇을 바꾸나?

<!-- section: review -->
## 한 줄 정리

**헤더는 `display: flex` + `align-items: center` 로 한 줄에 세로 가운데 정렬하고,
오른쪽 그룹은 `margin-left: auto` 로 밀며, 좁은 화면은 `@media` 안에서 `flex-direction: column`.**

<!-- section: next -->
## 다음 Chapter

`web-foundations/css-layout-grid` — 행과 열을 동시에 다루는 Grid.
