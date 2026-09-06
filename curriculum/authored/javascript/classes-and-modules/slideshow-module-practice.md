---
id: javascript/classes-and-modules/slideshow-module-practice
chapter: javascript/classes-and-modules
title: 실전 — 모듈로 슬라이드쇼 나누기
mastery: practical
lesson_kind: lesson
estimated_minutes: 50
tags: [javascript, modules, slideshow, practice]
related_material_ids:
  - 1JgvZcovh4kSME4OpUdYZeOQniaWepvv7              # 05_slideshow_module_Base.zip
  - 1799_v3_0i5erA9qU4Fu2qPI9yFs8yeaA              # 05_slideshow_module_Final_v202605.zip
prerequisites:
  - javascript/classes-and-modules/es-modules
  - javascript/functions-and-scope/scope-and-closures
code_examples:
  - slug: base
    title: 시작점 — 한 파일, 전역 변수, 대상 하드코딩
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // js/script1.js  (Base) — .slideshow1 에만 동작, 변수가 전역
      let slideContainer = document.querySelector(".slideshow1 .slide-container");
      let slide = slideContainer.querySelectorAll("li");
      let currentIdx = 0;
      let timer;

      function go(i) {
        slide[currentIdx].classList.remove("active");
        currentIdx = (i + slide.length) % slide.length;
        slide[currentIdx].classList.add("active");
      }
      function autoSlide() { timer = setInterval(() => go(currentIdx + 1), 3000); }
      slideContainer.addEventListener("mouseover", () => clearInterval(timer));
      slideContainer.addEventListener("mouseout", autoSlide);
      autoSlide();
      // 문제: 두 번째 슬라이드쇼를 넣으려면 이 파일을 통째로 복붙 + 이름 다 바꿔야 함
  - slug: module
    title: 함수로 감싸고 target 을 인수로 → export default
    source_type: generated_minimal
    language: js
    code: |
      // js/slideshow.js
      export default function slideshow(rootSelector, { interval = 3000 } = {}) {
        const root = document.querySelector(rootSelector);
        if (!root) return;                       // 방어: 없는 대상
        const slides = root.querySelectorAll(".slide-container > li");
        if (slides.length === 0) return;

        let idx = 0;                              // 클로저 지역 변수 — 인스턴스마다 독립
        let timer = null;

        const go = (i) => {
          slides[idx].classList.remove("active");
          idx = (i + slides.length) % slides.length;
          slides[idx].classList.add("active");
        };
        const start = () => { timer = setInterval(() => go(idx + 1), interval); };
        const stop = () => { clearInterval(timer); timer = null; };

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        go(0);
        start();

        return { next: () => go(idx + 1), prev: () => go(idx - 1), stop };  // 제어 API
      }
  - slug: use
    title: 한 번 import 해서 여러 번 호출
    source_type: generated_minimal
    language: js
    code: |
      // js/main.js
      import slideshow from "./slideshow.js";

      slideshow(".slideshow1");
      slideshow(".slideshow2", { interval: 5000 });   // 인수만 다르게

      // index.html
      // <script type="module" src="./js/main.js"></script>
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 한 파일·전역 변수·대상 하드코딩으로 짜인 슬라이드쇼(Base)를 **재사용 가능한 모듈**로 리팩터링한다.
- "전체를 `function slideshow(target)` 로 감싸고 → 지역 변수(클로저)로 바꾸고 → `export default`" 흐름을 손으로 해 본다.
- 한 번 `import` 한 함수를 **인수만 바꿔** 여러 슬라이드쇼에 적용한다.
- 없는 대상·빈 슬라이드에 대한 방어 코드와, 제어 API(`next`/`prev`/`stop`) 반환을 넣는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `es-modules`(export/import), 클로저, `querySelectorAll`·`classList`·타이머.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 슬라이드쇼를 두 개 놓으려고 `script1.js` 를 복사해 `script2.js` 를 만들고 변수명을 전부 바꾼다.
- 전역 `timer`, `currentIdx` 가 두 슬라이드쇼에서 충돌한다.
- 대상 셀렉터가 페이지에 없으면 `querySelectorAll` 결과가 비어 `slide[0]` 에서 터진다.

<!-- section: concept -->
## Base 의 한계

{{code: base}}

- 강의 Base 코드는 `.slideshow1` **하나에만** 동작하고, `slideContainer`·`currentIdx`·`timer` 가 **전역**이다.
- 두 번째 슬라이드쇼 = 파일 복붙 + 이름 전부 변경. 유지보수 불가.
- 목표: **대상을 인수로 받는 함수 하나**로 만들고, 내부 상태를 그 함수 안(클로저)에 가둔다.

<!-- section: mechanism -->
## 리팩터링 3단계

{{code: module}}

1. **감싸기** — 코드 전체를 `function slideshow(rootSelector) { ... }` 안으로.
2. **지역화** — `let idx`, `let timer` 를 함수 안 변수로. 호출할 때마다 **독립된 클로저**가 생겨 슬라이드쇼끼리 안 섞인다.
3. **파라미터화 + export** — 하드코딩된 `.slideshow1` 을 `rootSelector` 인수로. `interval` 같은 옵션은 기본값 있는 옵션 객체로.
   `export default`.

{{code: use}}

- `main.js` 에서 한 번 `import` → `slideshow(".slideshow1")`, `slideshow(".slideshow2", { interval: 5000 })`.
- 반환한 `{ next, prev, stop }` 로 외부 버튼과 연결할 수 있다(라이브러리처럼).

### 방어 코드

- `document.querySelector(rootSelector)` 가 `null` 이면 즉시 `return`.
- `slides.length === 0` 이면 `return`.
- 이벤트는 `mouseenter`/`mouseleave`(버블링 없음)로 — 자식 위에서도 안정적.

<!-- section: must_know -->
## 반드시 기억할 것

- 재사용의 핵심: **전체를 함수로 감싸기 → 상태를 지역 변수(클로저)로 → 대상·옵션을 인수로 → `export default`.**
- 호출마다 새 클로저 = 슬라이드쇼 인스턴스가 서로 독립.
- 대상 없음/빈 슬라이드는 초반에 `return` 으로 방어.
- 제어가 필요하면 함수가 `{ next, prev, stop }` 을 반환.
- `main.js` 하나가 진입점, `import` 는 한 번, 호출은 여러 번.

<!-- section: mission -->
## 미션 — 재사용 슬라이드쇼 모듈

Base zip 을 시작점으로.

- `js/slideshow.js` : `export default function slideshow(rootSelector, options)`.
  - 자동재생 + hover 정지/재개, 옵션 `interval`, `loop`(기본 true).
  - 없는 대상/빈 슬라이드 방어. `{ next, prev, stop, start }` 반환.
- `js/main.js` : 페이지에 슬라이드쇼 2개(`interval` 다르게) + 한쪽에 이전/다음 버튼을 반환 API 로 연결.
- `js/dom.js` : `$`, `$$`(querySelectorAll → 배열) 헬퍼 named export.
- 전역 변수 0개 확인(개발자도구 `window` 에 슬라이드쇼 흔적 없음).
- README 에 "복붙 → 모듈" 로 무엇이 바뀌었는지 3줄.

<!-- section: check_question -->
## 이해 점검

1. Base 코드에서 슬라이드쇼를 2개로 늘리기 어려운 이유 두 가지는?
2. `idx`, `timer` 를 함수 안 지역 변수로 옮기면 무엇이 해결되나?
3. `rootSelector` 가 페이지에 없을 때 어떻게 방어하나?
4. 함수가 `{ next, prev, stop }` 을 반환하면 무엇을 할 수 있나?

<!-- section: review -->
## 한 줄 정리

**슬라이드쇼를 `function slideshow(target, options)` 로 감싸고 상태를 클로저 지역 변수로 옮긴 뒤 `export default` 하면,
한 번 `import` 해서 인수만 바꿔 여러 개를 독립적으로 돌릴 수 있다 — 복붙이 재사용 모듈로 바뀐다.**

<!-- section: next -->
## 다음 Lesson

`dom-and-events/selecting-and-manipulating` — DOM 선택과 조작을 정리.
