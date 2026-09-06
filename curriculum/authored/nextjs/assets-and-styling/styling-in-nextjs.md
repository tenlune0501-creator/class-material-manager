---
id: nextjs/assets-and-styling/styling-in-nextjs
chapter: nextjs/assets-and-styling
title: Next.js에서 CSS 적용
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [nextjs, css, css-modules, global-css]
related_material_ids:
  - 1ZxdBe7qwrMkUbEQ0O-sNhE6TDI6SnMOPtOv7FdAfVLc   # 08_CSS (2025)
prerequisites:
  - nextjs/assets-and-styling/public-assets
  - web-foundations/css-fundamentals/selectors-and-cascade
  - react/styling-in-react/applying-css
code_examples:
  - slug: global
    title: 전역 CSS — layout 에서 한 번만 import
    source_type: generated_minimal
    language: tsx
    is_canonical: true
    code: |
      /* src/app/globals.css — reset, 폰트, 컬러/여백 토큰, 유틸리티만 */
      a { text-decoration: none; }
      a:hover { text-decoration: underline; }
      :root { --gap: 16px; --brand: royalblue; }

      // src/app/layout.tsx
      import "./globals.css";   // 전역 CSS 는 layout(또는 page)에서만 import
  - slug: module
    title: CSS Module — 컴포넌트 옆, 자동 스코프
    source_type: generated_minimal
    language: tsx
    code: |
      /* src/app/create/create.module.css */
      .title { color: var(--brand); font-size: 24px; margin-bottom: 20px; }
      .field { display: block; margin-bottom: var(--gap); }

      // src/app/create/page.tsx
      import styles from "./create.module.css";

      export default function Create() {
        return (
          <form>
            <h2 className={styles.title}>Create</h2>
            <input className={styles.field} name="title" />
          </form>
        );
      }
      // 빌드 시 .title → .create_title__x7Kd2 로 해싱 → 다른 파일의 .title 과 절대 안 부딪힘
  - slug: cx
    title: 조건부 클래스 조합
    source_type: generated_minimal
    language: tsx
    code: |
      import styles from "./button.module.css";

      function Button({ primary, disabled }: { primary?: boolean; disabled?: boolean }) {
        const cls = [styles.btn, primary && styles.primary, disabled && styles.disabled]
          .filter(Boolean)
          .join(" ");
        return <button className={cls} disabled={disabled}>확인</button>;
      }
      // 조합이 많아지면 clsx / classnames 같은 작은 라이브러리를 쓴다.
  - slug: inline
    title: 인라인 스타일 — 동적 값에만
    source_type: generated_minimal
    language: tsx
    code: |
      <div style={{ width: `${percent}%`, height: 8, background: "var(--brand)" }} />
      // 정적 스타일을 인라인으로 흩뿌리지 말 것: 재사용·가상클래스(:hover)·미디어쿼리가 안 된다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **전역 CSS**(`globals.css`)는 `layout` 에서 한 번만 import 하고, reset·폰트·토큰·유틸리티만 담는다.
- **CSS Module**(`*.module.css`)을 컴포넌트 옆에 두고 `styles.클래스` 로 쓰면 이름이 자동 스코프되는 원리를 안다.
- 조건부 클래스 조합, 인라인 스타일을 언제 쓰는지 구분한다.
- (개요) Tailwind·styled-components 같은 다른 방식이 있다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSS 선택자·cascade, React 의 `className`. `nextjs/assets-and-styling/public-assets`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 모든 CSS 를 `globals.css` 한 파일에 넣어 `.title`, `.item` 같은 흔한 이름이 페이지마다 충돌한다.
- 충돌을 피하려 `.create-page .title` 처럼 셀렉터를 길게 쓰다 특이도 전쟁이 난다.
- 컴포넌트 CSS 파일을 아무 컴포넌트에서나 import 하려다 "전역 CSS 는 여기서 import 못 한다" 에러.

<!-- section: concept -->
## 전역 CSS 는 최소한, layout 에서만

{{code: global}}

- 전역 CSS 는 **`layout.tsx` 또는 `page.tsx` 에서만** import 할 수 있다(일반 컴포넌트에서 import 시 에러).
- 여기에는 **여러 화면이 공유하는 것만**: reset/normalize, 웹폰트, 컬러·여백 토큰(CSS 변수), 아주 얇은 유틸리티.
- 특정 화면에서만 쓰는 스타일을 전역에 넣으면 이름 충돌과 "이 규칙 누가 쓰지?" 문제가 쌓인다.

<!-- section: mechanism -->
## CSS Module — 이름이 자동으로 안 부딪힌다

{{code: module}}

- 파일명이 **`.module.css`** 여야 한다. `import styles from "./x.module.css"` → `styles.title` 은
  빌드 시 `create_title__x7Kd2` 처럼 해싱된 **유일한 이름**이 된다.
- 그래서 다른 파일에도 `.title` 이 있어도 **절대 충돌하지 않는다**. 셀렉터를 길게 쓸 필요가 없다.
- 규칙: **그 화면/컴포넌트에서만 쓰는 스타일은 같은 폴더에 `.module.css`** 로. 찾기 쉽고 삭제도 안전.

{{code: cx}}

{{code: inline}}

- 조건부 클래스는 배열 `.filter(Boolean).join(" ")` 또는 `clsx`.
- 인라인 `style` 은 **런타임에 계산되는 동적 값**(진행률 바 너비 등)에만. 정적 스타일·`:hover`·미디어쿼리는 CSS 로.

### 다른 방식 (개요)

- **Tailwind** — 유틸리티 클래스(`className="flex gap-4 text-lg"`)로 CSS 파일 없이 스타일링. Next.js 가 셋업 옵션으로 지원.
- **styled-components / emotion** — JS 안에서 스타일 작성. 클라이언트 컴포넌트 위주라 App Router 에선 설정이 더 필요.
- 이 커리큘럼은 **전역 CSS + CSS Module** 을 기본으로 한다.

<!-- section: must_know -->
## 반드시 기억할 것

- 전역 CSS = `layout`/`page` 에서만 import. 내용은 reset·폰트·토큰·유틸리티 **공통만**.
- 화면 전용 스타일 = 같은 폴더에 **`*.module.css`** + `import styles from` + `styles.클래스`.
- CSS Module 은 클래스명을 해싱 → **충돌 없음**, 긴 셀렉터 불필요.
- 조건부 클래스는 배열 join 또는 `clsx`. 인라인 `style` 은 **동적 값에만**.
- 대안: Tailwind, styled-components (이 커리큘럼 기본은 전역 CSS + Module).

<!-- section: mission -->
## 미션 — 스타일 구조 정리

- `globals.css` : reset + `:root` 토큰(`--brand`, `--gap`, `--radius`) + `.container` 정도만.
- `app/create/create.module.css` : 폼 전용(`.form`, `.title`, `.field`, `.error`). `page.tsx` 에서 `styles.` 로 적용.
- `components/Button/Button.module.css` : `.btn` + `.primary` + `.ghost` + `.disabled`. props 로 조건부 조합.
- 진행률 바 컴포넌트: 너비만 인라인 `style`, 나머지는 Module.
- 일부러 두 Module 파일에 같은 `.title` 을 두고 **충돌하지 않는 것**을 개발자도구에서 확인.

<!-- section: check_question -->
## 이해 점검

1. `globals.css` 는 어디서 import 할 수 있나? 무엇을 담아야 하나?
2. `x.module.css` 의 `.title` 이 다른 파일의 `.title` 과 안 부딪히는 이유는?
3. 인라인 `style` 을 써야 하는 경우와, 쓰면 안 되는 경우는?
4. 조건부로 클래스를 붙이는 방법 한 가지를 코드로.

<!-- section: interview_question -->
## 면접 대비

- "CSS Module 이 이름 충돌을 어떻게 막나요?"
- "전역 CSS 에 넣을 것과 넣지 말아야 할 것을 어떻게 나누나요?"

<!-- section: review -->
## 한 줄 정리

**전역 CSS(`globals.css`)는 `layout` 에서 한 번, 공통 토큰·reset 만 — 화면 전용 스타일은 같은 폴더의
`*.module.css` 를 `styles.클래스` 로 쓰면 클래스명이 해싱돼 충돌이 없고, 인라인 `style` 은 동적 값에만.**

<!-- section: next -->
## 다음 Lesson

`data-and-backend/json-as-backend` — 데이터를 다루는 백엔드 붙이기.
