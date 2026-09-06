---
id: web-foundations/css-preprocessors-and-frameworks/less
chapter: web-foundations/css-preprocessors-and-frameworks
title: LESS 훑어보기
mastery: understand
lesson_kind: lesson
estimated_minutes: 20
tags: [css, less, preprocessor]
related_material_ids:
  - 0B0HRSf3dPjJid1FZeWtxbkJHTzQ              # LESS_Basic_Base.zip
  - 1mhyHw-mDlhJLfPv_xKPl_WxPR83Ft9pB
prerequisites:
  - web-foundations/css-preprocessors-and-frameworks/sass
code_examples:
  - slug: syntax
    title: LESS 문법 — Sass 와 거의 대응
    source_type: generated_minimal
    language: less
    is_canonical: true
    code: |
      @main: #3498db;              // 변수는 @ (Sass 는 $)
      @space: 16px;

      #header {
        background: @main;
        nav a {                   // 중첩 (Sass 와 동일)
          color: @main;
          &:hover { text-decoration: underline; }
        }
      }

      .card(@pad: 16px) {         // "믹스인" = 그냥 클래스에 인자
        padding: @pad;
        border-radius: 10px;
      }
      .message { .card(); background: #ebebeb; }   // 호출
      .container { width: (800px - 20px); }         // 연산
  - slug: build
    title: 빌드 방식
    source_type: generated_minimal
    language: bash
    code: |
      npm install -D less
      npx lessc styles.less styles.css     # .less → .css 컴파일 후 <link>
      # 브라우저용 less.js 로 클라이언트 컴파일도 가능하나 프로덕션엔 비권장(느림)
  - slug: compare
    title: Sass vs LESS
    source_type: generated_minimal
    language: text
    code: |
      변수         Sass $x      /  LESS @x
      믹스인       @mixin/@include  /  .name() 정의·호출
      조건·반복    @if/@each/@for   /  가드(when)·재귀 — Sass 쪽이 강력
      생태계       현재 표준(node-sass→dart-sass) / 유지보수 위주, 신규 채택 적음
      대표 사용처  대부분의 레거시·현행 프로젝트 / Bootstrap 3, 옛 프로젝트
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- LESS 가 Sass 와 같은 부류(전처리기)이며 문법이 거의 1:1 대응됨을 안다(`@변수`, 중첩, `.믹스인()`, 연산).
- `.less` 를 `lessc` 로 컴파일해 `.css` 를 링크하는 흐름을 안다.
- 오늘날 **Sass 가 사실상 표준**이고 LESS 는 주로 레거시(Bootstrap 3 등)에서 만난다는 맥락을 안다.
- LESS 코드를 읽고 Sass 로 옮길 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `sass` Lesson(변수·중첩·믹스인 개념).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 오래된 프로젝트나 Bootstrap 3 테마에서 `.less` 파일을 만났는데 문법이 낯설다.
- `@` 로 시작하는 변수를 CSS `@media` 와 헷갈린다.

<!-- section: concept -->
## 문법 — Sass 를 알면 바로 읽힌다

{{code: syntax}}

- 변수는 **`@`**(Sass 는 `$`). 중첩·`&` 는 Sass 와 동일.
- 믹스인은 별도 키워드 없이 **클래스(또는 `#id`)를 정의해 두고 `.이름();` 으로 호출**한다.
- 연산도 지원(`(800px - 20px)`).

<!-- section: mechanism -->
## 빌드와 비교

{{code: build}}

- `npm i -D less` → `npx lessc in.less out.css`. 결과 `.css` 를 링크.
- 브라우저에서 `less.js` 로 즉석 컴파일도 되지만 느려서 프로덕션엔 안 쓴다.

{{code: compare}}

- 개념은 대부분 대응된다. 조건·반복 로직은 Sass(`@if`/`@each`/`@for`)가 더 명료하고, **생태계·도구·자료가 Sass 에 집중**돼 있다.
- 그래서 신규 프로젝트는 Sass(또는 CSS 변수 + PostCSS, 또는 Tailwind)를 고르고, LESS 는 **읽을 줄만** 알면 된다.

<!-- section: must_know -->
## 반드시 기억할 것

- LESS = 전처리기. 변수 `@x`, 중첩·`&` 동일, 믹스인은 `.name()` 정의·호출, 연산 지원.
- `.less` → `lessc` → `.css` 링크.
- 오늘날 표준은 **Sass**. LESS 는 Bootstrap 3·레거시에서 만나며 **읽기 위주**로 익힌다.
- LESS `@x` ↔ Sass `$x`, `.mixin()` ↔ `@mixin`/`@include`.

<!-- section: experiment -->
## 직접 해 보기

1. LESS Base 페이지의 `styles.less` 를 `lessc` 로 컴파일해 결과 CSS 를 확인.
2. 그 `.less` 를 Sass(`.scss`)로 1:1 포팅(`@`→`$`, `.mixin()`→`@mixin`/`@include`).
3. 둘의 컴파일 결과 CSS 를 비교해 동일한지 확인.

<!-- section: check_question -->
## 이해 점검

1. LESS 변수 기호와 Sass 변수 기호는?
2. LESS 에서 믹스인을 만들고 쓰는 방법은?
3. 신규 프로젝트에서 LESS 대신 무엇을 고르나? 왜?
4. `.less` 를 브라우저가 바로 읽나?

<!-- section: review -->
## 한 줄 정리

**LESS 는 Sass 와 같은 전처리기로 `@변수`·중첩·`.믹스인()`·연산을 제공하며 `lessc` 로 컴파일하지만,
오늘날 표준은 Sass 이므로 LESS 는 레거시(Bootstrap 3 등)에서 읽을 수 있을 정도로만 익힌다.**

<!-- section: next -->
## 다음 Lesson

`css-preprocessors-and-frameworks/tailwind` — 유틸리티 우선 프레임워크.
