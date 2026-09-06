---
id: web-foundations/css-preprocessors-and-frameworks/sass
chapter: web-foundations/css-preprocessors-and-frameworks
title: Sass — 변수·중첩·믹스인
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [css, sass, scss, preprocessor]
related_material_ids:
  - 1AB7EULjblvytiAVX4M3NUEuGeWgztsJ83b-JhRL7MRQ   # 1. Sass 기초
  - 1ooeGajkllhTB8ZaFrj051uqmyNDy-FErkCZu1z0ZRTM   # 2. Sass 핵심 기능
  - 1CzyoTqdSf_B53IaVp8pzjZTGkhUCeXsH8akT4xkGrWk
  - 1a_6sWxmaKs7lOYrxFAI-jQzAzH2lccJq
prerequisites:
  - web-foundations/css-fundamentals/selectors-and-cascade
  - javascript/classes-and-modules/es-modules
code_examples:
  - slug: setup
    title: 설치와 컴파일 (Sass 는 빌드가 필요)
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      npm install -D sass                    # 프로젝트 로컬 설치 권장

      npx sass style.scss style.css          # 한 번 변환
      npx sass --watch scss/:css/            # 폴더 감시 → 저장 시 자동 변환
      # <link href="style.css">  ← HTML 은 "컴파일된 CSS" 를 링크한다 (.scss 아님)
      # Vite / Next 는 .scss 를 import 하면 알아서 컴파일 (별도 명령 불필요)
  - slug: vars-nesting
    title: 변수 · 중첩 · & (부모 참조)
    source_type: generated_minimal
    language: scss
    code: |
      $main: #3498db;
      $space: 16px;

      .nav {
        display: flex;
        gap: $space;

        a {                       // .nav a 로 컴파일
          color: $main;
          text-decoration: none;
          &:hover { text-decoration: underline; }   // & = .nav a → .nav a:hover
          &.active { font-weight: 700; }            // .nav a.active
        }
      }
      // 중첩은 2~3단계까지만. 깊어지면 셀렉터가 길고 특이도가 높아진다
  - slug: mixin-extend
    title: "@mixin/@include · @extend · 연산"
    source_type: generated_minimal
    language: scss
    code: |
      @mixin flex-center($gap: 0) {         // 인자 가능
        display: flex; align-items: center; justify-content: center; gap: $gap;
      }
      .box { @include flex-center(20px); }   // 규칙 묶음을 "복사해 넣음"

      %card-base { padding: 16px; border-radius: 10px; }   // placeholder
      .message { @extend %card-base; background: #ebebeb; }
      .success { @extend %card-base; background: green; color: #fff; }
      // @extend = 셀렉터를 묶어서 공유 (.message, .success { ... })

      .container { max-width: 800px - 20px; }   // 같은 단위면 calc 없이 연산 → 780px
  - slug: modules
    title: "파일 나누기 — @use (구 @import)"
    source_type: generated_minimal
    language: scss
    code: |
      // _variables.scss  (앞의 _ = partial, 단독 컴파일 안 함)
      $main: #3498db;

      // main.scss
      @use "variables" as v;     // 네임스페이스
      body { background: v.$main; }
      // 옛 자료의 @import 는 전역 오염·중복 이슈로 deprecated → @use / @forward 권장
  - slug: vs-css-vars
    title: Sass 변수 vs CSS 커스텀 속성
    source_type: generated_minimal
    language: scss
    code: |
      $sass-var: #3498db;        // 컴파일 시점에 값이 박힘. 런타임에 못 바꿈. 미디어쿼리로 못 바꿈
      :root { --brand: #3498db; } // 런타임에 살아있음. JS 로 변경 가능, 다크모드 토글에 유리
      .btn { background: var(--brand); border: 1px solid $sass-var; }
      // 테마/런타임 변경 → CSS 변수.  빌드타임 계산·로직 → Sass.  둘을 함께 쓴다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Sass 가 **CSS 전처리기**(빌드 단계에서 `.scss` → `.css`)임을 알고, CLI `--watch` 또는 번들러로 컴파일한다.
- 변수, 중첩(`&` 부모 참조 포함), `@mixin`/`@include`, `@extend`(placeholder `%`), 연산을 쓴다.
- `@use`/`@forward` 로 파일을 나눈다(옛 `@import` 는 지양).
- **Sass 변수(빌드타임)와 CSS 커스텀 속성(런타임)** 을 구분해 함께 쓴다.
- 중첩은 얕게 유지해야 하는 이유를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSS 선택자·cascade·특이도, 모듈 개념(`import`/`export`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 색·간격 값을 수십 파일에 복붙해 한 번 바꾸려면 전부 찾아야 한다.
- `.nav ul li a:hover` 같은 셀렉터를 계속 손으로 반복한다.
- 공통 스타일 묶음(플렉스 중앙정렬 등)을 매번 다시 쓴다.
- `.scss` 파일을 그대로 `<link>` 해서 스타일이 안 먹는다.

<!-- section: concept -->
## Sass 는 빌드가 필요하다

{{code: setup}}

- 브라우저는 `.scss` 를 모른다. **컴파일**해서 나온 `.css` 를 링크한다.
- 로컬 개발: `npx sass --watch`. 번들러(Vite/Next)는 `import "./style.scss"` 하면 자동 컴파일.
- `.scss` 문법은 CSS 의 상위집합(기존 CSS 가 그대로 유효). `.sass`(들여쓰기 문법)도 있지만 `.scss` 권장.

<!-- section: mechanism -->
## 핵심 기능

{{code: vars-nesting}}

- **변수** `$이름: 값`. **중첩**으로 부모-자식 관계를 그대로 쓰되, **`&`** 는 부모 셀렉터 자리(`&:hover`, `&.active`).
- 중첩은 **2~3단계까지**. 깊으면 `.a .b .c .d` 로 컴파일돼 특이도가 치솟고 재사용이 어렵다.

{{code: mixin-extend}}

- **`@mixin` + `@include`** — 스타일 묶음을 (인자와 함께) **복사해 넣는다**. 미디어쿼리·벤더 프리픽스·버튼 변형에.
- **`@extend %placeholder`** — 여러 셀렉터를 **묶어서** 공유(중복 CSS 를 줄임). 남용하면 셀렉터 그룹이 커지니 mixin 을 기본으로.
- **연산** — 같은 단위면 `calc` 없이 `800px - 20px`. 단위가 다르면 `calc()`.

{{code: modules}}

- 파일 분리: `_partial.scss`(앞의 `_` = 단독 컴파일 안 함) + `@use "partial"`. 네임스페이스가 생겨 이름 충돌이 없다.
- 옛 자료의 `@import` 는 전역 오염·중복 로드 문제로 **deprecated** → `@use`/`@forward`.

{{code: vs-css-vars}}

- **Sass 변수** = 컴파일 시점에 값이 박힌다(런타임·미디어쿼리로 못 바꿈). **CSS 커스텀 속성**(`--x`) = 런타임에 살아있어 JS·다크모드로 변경 가능.
- 테마/런타임 = CSS 변수, 빌드타임 계산·믹스인 = Sass. 둘을 같이 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- Sass = 전처리기. `.scss` → 컴파일 → `.css` 를 링크. 번들러는 자동.
- 변수 `$x`, 중첩(+`&` 부모 참조, **2~3단계만**), `@mixin`/`@include`(복사, 인자 가능), `@extend %`(셀렉터 묶기).
- 같은 단위 연산은 `calc` 불필요.
- 파일 분리는 `_partial` + **`@use`**(옛 `@import` 지양).
- **Sass 변수 = 빌드타임(고정), CSS 변수 = 런타임(테마)** — 함께 사용.

<!-- section: mission -->
## 미션 — 디자인 토큰 + 컴포넌트 스타일

Sass 자료의 페이지를 재료로.

- `_tokens.scss` : `$brand`, `$space`, `$radius`, 브레이크포인트 맵. `@use` 로 불러오기.
- `@mixin respond($bp)` : 미디어쿼리 믹스인. 여러 컴포넌트에서 `@include respond(md) { ... }`.
- `@mixin button-variant($bg, $fg)` : 버튼 색 변형. `.btn--primary`, `.btn--ghost` 에 적용.
- `%card` placeholder + `@extend` 로 `.message`/`.success`/`.warning`.
- 네비 스타일을 `&` 중첩으로(최대 3단계). 깊게 만든 버전과 컴파일 결과 셀렉터 비교.
- 런타임 테마 색은 `--brand` CSS 변수로 두고, Sass 는 레이아웃·믹스인에만 — 다크모드 토글로 확인.

<!-- section: check_question -->
## 이해 점검

1. `.scss` 파일을 브라우저가 바로 못 읽는 이유와 해결은?
2. `&:hover` 에서 `&` 는 무엇인가?
3. `@mixin`/`@include` 와 `@extend` 의 차이는?
4. Sass 변수와 CSS 커스텀 속성 중 다크모드 토글에 쓰는 것은? 왜?

<!-- section: interview_question -->
## 면접 대비

- "Sass 중첩을 깊게 쓰면 어떤 문제가 생기나요?"
- "`@extend` 를 조심해서 써야 하는 이유는?"
- "요즘도 Sass 를 쓰나요? CSS 변수·Tailwind 와 어떻게 병행하나요?"

<!-- section: review -->
## 한 줄 정리

**Sass 는 빌드 단계에서 `.scss` 를 `.css` 로 컴파일하며 변수·중첩(`&`, 얕게)·`@mixin`·`@extend`·연산·`@use` 를 제공하고,
런타임 테마는 CSS 커스텀 속성에 맡기고 Sass 는 빌드타임 로직·믹스인에 쓴다.**

<!-- section: next -->
## 다음 Lesson

`css-preprocessors-and-frameworks/less` — LESS 를 짧게 훑기.
