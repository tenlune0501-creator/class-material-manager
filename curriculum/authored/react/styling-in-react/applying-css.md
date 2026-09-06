---
id: react/styling-in-react/applying-css
chapter: react/styling-in-react
title: React에서 CSS 적용하기
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [react, css, css-modules, styling]
related_material_ids:
  - 1KyP9O0IaEBn1foRQIHXqzXIYjwvqnLT9IJZVnwRPp_M   # 11_CSS 적용하기
prerequisites:
  - react/setup-and-jsx/jsx
  - web-foundations/css-fundamentals/selectors-and-cascade
code_examples:
  - slug: css-ways
    title: 네 가지 방식
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      // 1) 전역 CSS 파일 — 앱 전체에 영향. 리셋·토큰·유틸에.
      import "./index.css";

      // 2) CSS Modules — 파일 단위로 클래스명이 자동 고유화 (충돌 없음)
      import styles from "./Card.module.css";
      function Card() {
        return <div className={styles.card}>...</div>;   // 실제 클래스: Card_card__x7k2
      }

      // 3) 인라인 style — 객체, 동적 값에만 짧게
      <div style={{ width: pct + "%", backgroundColor: color }} />

      // 4) 유틸리티 클래스 (Tailwind 등)
      <div className="p-4 rounded-lg border" />
  - slug: conditional-class
    title: 조건부 클래스
    source_type: generated_minimal
    language: jsx
    code: |
      // 직접
      const cls = `btn ${active ? "btn--active" : ""} ${size === "lg" ? "btn--lg" : ""}`;

      // clsx / classnames 라이브러리 (가독성)
      import clsx from "clsx";
      <button className={clsx("btn", { "btn--active": active, "btn--lg": size === "lg" })} />

      // CSS Modules 와 함께
      <button className={clsx(styles.btn, active && styles.active)} />
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- React 에서 CSS 를 적용하는 4가지(전역 CSS, **CSS Modules**, 인라인 `style`, 유틸리티 클래스)를 알고,
  각각 언제 쓰는지 판단한다.
- **CSS Modules** 로 컴포넌트별 스타일 격리를 한다(클래스명 충돌 제거).
- 조건부 클래스를 깔끔하게(`clsx`) 붙인다.
- 인라인 `style` 을 남용하지 않는 이유를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSS 선택자·캐스케이드·명시도, JSX 의 `className`/`style={{}}`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 두 컴포넌트가 각자 `.title` 클래스를 정의 → 전역 CSS 라 서로 덮어써서 스타일이 섞인다.
- 모든 스타일을 인라인 `style={{}}` 로 → `:hover`, 미디어쿼리, 재사용이 안 되고 코드가 지저분.
- 조건부로 클래스 3개를 붙이는 문자열 템플릿이 읽기 힘들다.

<!-- section: concept -->
## 네 가지 방식

{{code: css-ways}}

| 방식 | 언제 |
|---|---|
| **전역 CSS** (`import "./x.css"`) | 리셋, CSS 변수(디자인 토큰), body/공통 타이포. 앱 전체 1~2개. |
| **CSS Modules** (`x.module.css` → `import styles`) | **컴포넌트별 스타일.** 클래스명이 자동으로 고유해져 충돌 없음. Vite 기본 지원. |
| **인라인 `style={{}}`** | **런타임에 계산되는 동적 값** (진행률 %, 사용자가 고른 색)만. 짧게. |
| **유틸리티 클래스** (Tailwind) | 팀이 채택했을 때. 클래스 조합으로 스타일 (별도 챕터에서 다룸). |

<!-- section: mechanism -->
## CSS Modules 원리

- `Card.module.css` 안에 `.card { ... }` 를 쓰면, 빌드 시 **`Card_card__hash`** 처럼 유니크한 이름으로 바뀐다.
- 컴포넌트에서는 `import styles from "./Card.module.css"` 후 `className={styles.card}`.
- → 다른 파일의 `.card` 와 **절대 안 부딪힌다.** 명시도 전쟁이 사라진다.
- 전역이 필요하면 `:global(.foo)`.

<!-- section: code | lang: jsx -->
## 조건부 클래스

{{code: conditional-class}}

- 조건이 1~2개면 템플릿 리터럴, 3개 이상이면 **`clsx`**(또는 `classnames`) — `{ "클래스": 조건 }` 객체로 읽기 쉽게.

<!-- section: must_know -->
## 반드시 기억할 것

- **전역 CSS 는 최소한**(리셋·토큰). 컴포넌트 스타일은 **CSS Modules**(또는 팀의 방식).
- **인라인 `style` 은 동적 값만.** `:hover`·미디어쿼리·재사용은 인라인으로 불가.
- CSS Modules 클래스는 `styles.클래스명` 으로 접근 (`className="card"` 아님).
- 조건부 클래스는 `clsx`.
- 스타일 방식은 **프로젝트 전체가 하나로 통일**. 섞으면 유지보수가 어렵다.
- HTML/CSS 챕터에서 배운 레이아웃(flex/grid)·캐스케이드 지식이 그대로 쓰인다 — React 는 CSS 를 없애지 않는다.

<!-- section: experiment -->
## 직접 해 보기

1. `Card.module.css` 를 만들어 `.card`, `.title` 을 정의하고 컴포넌트에 적용. 다른 컴포넌트에도 `.card` 를
   전역 CSS 로 정의해 충돌시켜 본 뒤, Modules 로 격리되는 걸 확인.
2. 진행률 바를 만들어 채워진 폭을 인라인 `style={{ width: percent + "%" }}` 로, 나머지 색·높이·둥근모서리는
   CSS Modules 로 분리하라.
3. `Button` 에 `variant`, `size`, `disabled` 에 따라 클래스를 붙이되 템플릿 리터럴로 한 번, `clsx` 로 한 번 써서 비교.

<!-- section: check_question -->
## 이해 점검

1. 전역 CSS 와 CSS Modules 는 각각 무엇에 쓰나?
2. CSS Modules 가 클래스 충돌을 없애는 원리는?
3. 인라인 `style` 로 못 하는 것 2가지는?
4. `className={styles.card}` 와 `className="card"` 의 차이는?

<!-- section: interview_question -->
## 면접 대비

- "React 프로젝트에서 스타일링 방식을 어떻게 정하나요? 트레이드오프는?"
- "CSS-in-JS, CSS Modules, 유틸리티 CSS 를 비교해 주세요."

<!-- section: review -->
## 한 줄 정리

**전역 CSS 는 리셋·토큰만, 컴포넌트 스타일은 CSS Modules(자동 고유화로 충돌 없음), 인라인 `style` 은
동적 값만 — 조건부 클래스는 `clsx`. HTML/CSS 실력은 그대로 쓰인다.**

<!-- section: next -->
## 다음 Lesson

`styling-in-react/images-and-icons` — 이미지·아이콘 불러오기.
