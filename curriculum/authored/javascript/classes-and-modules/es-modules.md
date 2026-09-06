---
id: javascript/classes-and-modules/es-modules
chapter: javascript/classes-and-modules
title: ES 모듈 (import/export)
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [javascript, modules, import, export, esm]
related_material_ids:
  - 19E-NTySANRnlXoi-BXW7oqvCfyINBsHp93sXko8QnT0   # module_활용하기1
  - 1DTpQdOS-8kFQiIELp4baCQGE-vJSZiYP0f-Zi0onjW8   # module_활용하기2
  - 1puC4XZdZSWmeSO3ZrkLylO07SPqduzTz              # module 예제
  - 1oM0miaWU0ETlOdn34zx54KAMPTD1ncKj              # module 예제
  - 1JlNq4MRLPX9bXOYv1UzPYZYvSJqQULdk              # module 예제
prerequisites:
  - javascript/classes-and-modules/classes
code_examples:
  - slug: before
    title: 예전 코드 — script 여러 개, 전역 하나
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!-- 옛 방식: 파일마다 <script>, 모든 함수/변수가 전역에 쌓임 -->
      <script src="func.js"></script>   <!-- func1, func2 를 전역에 정의 -->
      <script src="main.js"></script>   <!-- 순서가 틀리면 undefined, 이름이 겹치면 덮어씀 -->
      <!-- func.js -->
      function func1() { /* ... */ }
      func1();   // 파일 안에서 바로 실행 = 재사용 불가
  - slug: named
    title: named export / import
    source_type: generated_minimal
    language: js
    code: |
      // func.js
      export function func1() { document.querySelector("#title1").textContent = "Hello"; }
      const func2 = () => { document.querySelector("#title2").textContent = "World"; };
      export { func2 };

      // main.js
      import { func1, func2 } from "./func.js";   // 이름이 정확히 일치해야 함
      func1();
      func2();

      // index.html — 진입점은 type="module"
      // <script type="module" src="./main.js"></script>
  - slug: default
    title: default export — 파일당 하나의 대표
    source_type: generated_minimal
    language: js
    code: |
      // slideshow.js
      const slideshow = (target) => {
        const box = document.querySelector(target);
        // ...슬라이드 로직...
      };
      export default slideshow;

      // main.js
      import slideshow from "./slideshow.js";   // 이름은 내가 정한다 (중괄호 없음)
      slideshow(".slideshow1");
      slideshow(".slideshow2");   // 인수만 바꿔 재사용 = 라이브러리처럼
  - slug: rules
    title: 모듈의 규칙
    source_type: generated_minimal
    language: js
    code: |
      // 1) 모듈 스코프: 파일 안 변수는 전역을 오염시키지 않는다
      // 2) 한 번만 실행·평가되고 캐시됨 (여러 곳에서 import 해도 1회)
      // 3) import 는 파일 맨 위, 정적. 조건부는 동적 import()
      const mod = await import("./heavy.js");   // 필요할 때만 로드

      // 4) 기본적으로 strict mode
      // 5) 브라우저에서 file:// 로 열면 CORS 로 막힘 → 로컬 서버로 실행
      //    (npm/Vite/Next 프로젝트는 번들러가 알아서 처리)
      export { a } from "./a.js";   // re-export: index.js 를 한 창구로
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 옛 방식(파일마다 `<script>`, 전역 오염, 순서 의존)의 문제를 설명한다.
- **named export/import** 와 **default export/import** 를 구분해 쓴다.
- `<script type="module">` 진입점, 모듈 스코프, 한 번만 평가·캐시, static/dynamic `import` 규칙을 안다.
- 예전 강의의 `slideshow(target)` 를 `export default` 로 바꿔 두 군데에서 재사용하는 흐름을 이해한다.
- npm/Vite/Next 에서 쓰던 `import` 가 바로 이것임을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `javascript/classes-and-modules/classes`, 함수·객체, 파일 경로.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `<script>` 를 여러 개 넣고 순서가 틀려 `undefined`, 이름이 겹쳐 서로 덮어쓴다.
- 모든 함수가 전역(`window`)에 붙어 어디서 정의됐는지 추적이 안 된다.
- 같은 슬라이드쇼 코드를 페이지 두 곳에 복붙한다.

<!-- section: concept -->
## 예전 코드 — 전역 하나에 다 쌓기

{{code: before}}

- 옛 자료는 `func.js` 에서 함수를 정의하고 **파일 안에서 바로 실행**했다 → 다른 파일에서 못 쓴다.
- 여러 `<script>` 는 전역을 공유하므로 이름 충돌·로드 순서 문제가 생긴다.
- 해결: 각 파일을 **모듈**로 만들어 필요한 것만 `export` 하고, 쓰는 쪽에서 `import`.

<!-- section: mechanism -->
## named vs default

{{code: named}}

- **named export** — 여러 개 내보낼 수 있다. `import { 이름 }` 으로 **정확한 이름**을 가져온다. `as` 로 별칭 가능.

{{code: default}}

- **default export** — 파일당 하나. "이 파일의 대표". `import 아무이름 from` (중괄호 없음).
- 옛 슬라이드쇼 자료가 딱 이 패턴: 함수를 `export default` 하고, 쓰는 쪽에서 `slideshow(".slideshow1")`,
  `slideshow(".slideshow2")` 처럼 **인수만 바꿔 재사용** → 복붙이 사라진다.
- 한 파일에서 default 1개 + named 여러 개를 섞어도 된다.

### 규칙

{{code: rules}}

- **모듈 스코프** — 파일 안 변수는 전역을 오염시키지 않는다.
- **1회 평가 + 캐시** — 여러 곳에서 같은 모듈을 import 해도 실제 실행은 한 번.
- `import` 는 파일 맨 위, 정적. 조건부 로드는 `await import("./x.js")` (동적).
- 브라우저에서 `file://` 로 열면 막힌다 → 로컬 서버로 실행. 번들러(Vite/Next)는 자동 처리.

<!-- section: must_know -->
## 반드시 기억할 것

- 진입점은 `<script type="module">`. 파일 = 모듈.
- **named**: `export { a, b }` / `import { a, b } from` — 이름 일치. **default**: `export default x` / `import 내맘대로 from` — 파일당 1개.
- 모듈 스코프(전역 안 더럽힘) + 1회 평가·캐시 + strict mode 기본.
- 정적 `import` 는 맨 위. 필요할 때만은 동적 `import()`.
- 예전 복붙하던 슬라이드쇼 → `export default 함수` + 인수로 대상 전달 = 재사용.
- npm/Vite/Next 의 `import` 가 이 문법이다.

<!-- section: mission -->
## 미션 — 슬라이드쇼를 모듈로 분리

옛 슬라이드쇼 실습 코드를 재료로.

- `js/slideshow.js` : 슬라이드 로직 전체를 `function slideshow(target)` 로 감싸 `export default`.
- `js/main.js` : `import slideshow from "./slideshow.js"` → `slideshow(".slideshow1")`, `slideshow(".slideshow2")`.
- `js/dom.js` : `export function $(sel)`, `export function setText(sel, text)` 같은 헬퍼 named export → `main.js` 에서 사용.
- `index.html` 은 `<script type="module" src="./js/main.js">` 하나만.
- 전역(`window`)에 슬라이드쇼 관련 변수가 안 생기는 것 확인.
- (선택) `js/index.js` 로 re-export 창구를 만들어 `import { slideshow, $ } from "./js/index.js"`.

<!-- section: check_question -->
## 이해 점검

1. named export 와 default export 의 차이는? import 문법은 각각 어떻게 다른가?
2. 여러 `<script>` 방식 대비 모듈이 해결하는 문제 두 가지는?
3. 같은 모듈을 세 파일에서 import 하면 그 모듈 코드는 몇 번 실행되나?
4. 조건에 따라 무거운 모듈을 나중에 불러오려면?

<!-- section: interview_question -->
## 면접 대비

- "ES 모듈과 옛 `<script>` 방식의 차이를 설명해 보세요."
- "named export 만 쓰는 팀도 있는데 왜 그럴까요? (트리셰이킹·자동완성)"

<!-- section: review -->
## 한 줄 정리

**파일을 모듈로 만들어 `export`(named 여럿 / default 하나) 한 것을 `import` 로 가져오면 전역 오염·로드 순서 문제가 사라지고,
옛날 복붙하던 슬라이드쇼도 `export default 함수` + 인수 전달로 재사용된다 — Vite/Next 의 `import` 가 이것이다.**

<!-- section: next -->
## 다음 Lesson

`classes-and-modules/slideshow-module-practice` — 실전으로 모듈 분리.
