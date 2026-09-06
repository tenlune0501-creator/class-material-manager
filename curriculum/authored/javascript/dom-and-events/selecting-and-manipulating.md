---
id: javascript/dom-and-events/selecting-and-manipulating
chapter: javascript/dom-and-events
title: DOM 요소 선택과 조작
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, dom, queryselector, classlist]
related_material_ids:
  - 1CIn7DIpQ75B75uQE0mCGTevqzKfWYGul              # calendar_grid_js_base.zip
  - 1UA5i_5w9nz2we1EOl0juhqCwdlsxfvk2              # custom-cursors-with-javascript_base.zip
prerequisites:
  - javascript/objects-and-builtins/array-methods
  - web-foundations/html-structure/semantic-tags
code_examples:
  - slug: select
    title: 선택 — querySelector / querySelectorAll
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const cal = document.querySelector(".calendar");        // 첫 번째 하나, 없으면 null
      const days = document.querySelectorAll(".days > div");   // NodeList (유사 배열)

      // NodeList 를 배열처럼: 스프레드 또는 Array.from
      [...days].forEach((d) => d.classList.add("cell"));
      const nums = Array.from(days, (d) => Number(d.textContent));

      // 특정 요소 기준으로 좁혀서 찾기
      const header = cal.querySelector("header");
      const label = header.querySelector(".display");
      // null 가능성: const x = document.querySelector("#none"); x.textContent  → TypeError
  - slug: content
    title: 내용 바꾸기 — textContent vs innerHTML
    source_type: generated_minimal
    language: js
    code: |
      label.textContent = "2026-09";          // 텍스트로 그대로. 안전. 대부분 이걸로.

      list.innerHTML = "";                     // 자식 싹 비우기
      list.innerHTML = `<li>${title}</li>`;    // HTML 로 해석 — 사용자 입력을 그대로 넣지 말 것(XSS)

      // 안전하게 여러 개 만들기
      const li = document.createElement("li");
      li.textContent = title;                  // 사용자 값은 textContent 로
      li.dataset.id = String(id);              // data-id="..."
      list.append(li);
  - slug: attr-class-style
    title: 속성 · 클래스 · 스타일
    source_type: generated_minimal
    language: js
    code: |
      el.classList.add("active");
      el.classList.remove("hidden");
      el.classList.toggle("open");             // 있으면 빼고 없으면 넣고
      el.classList.contains("active");         // boolean

      el.getAttribute("href");
      el.setAttribute("aria-expanded", "true");
      el.dataset.role;                         // <div data-role="tab"> → "tab"

      el.style.setProperty("--x", `${px}px`);  // CSS 변수 (커스텀 커서 위치 등)
      // 상태는 되도록 class 로 표현하고 style 은 계산된 동적 값에만
  - slug: build
    title: 여러 요소 만들기 — DocumentFragment
    source_type: generated_minimal
    language: js
    code: |
      function renderDays(year, month) {
        const box = document.querySelector(".days");
        box.replaceChildren();                 // 비우기
        const frag = document.createDocumentFragment();
        const last = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= last; d++) {
          const cell = document.createElement("div");
          cell.textContent = String(d);
          cell.dataset.date = `${year}-${month + 1}-${d}`;
          frag.append(cell);
        }
        box.append(frag);                      // 리플로우 1번 (반복문 안에서 append 하지 말 것)
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `querySelector` / `querySelectorAll` 로 요소를 선택하고, NodeList 를 배열로 다룬다.
- `textContent` 와 `innerHTML` 의 차이(안전성/XSS)를 알고 상황에 맞게 고른다.
- `classList`, `getAttribute`/`setAttribute`, `dataset`, `style` 로 요소를 조작한다.
- 반복문 안에서 `append` 하지 않고 **DocumentFragment/`replaceChildren`** 로 한 번에 렌더한다.
- (연결) React 의 "상태 → 화면" 이 이 수동 DOM 갱신을 자동화한 것임을 감 잡는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 구조·선택자, 배열 메서드(`forEach`/`map`), 문자열 템플릿.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `document.querySelector("#x").textContent` 가 요소가 없을 때 `Cannot read properties of null`.
- `innerHTML` 에 사용자 입력을 그대로 넣어 스크립트가 실행된다(XSS).
- 달력 42칸을 반복문에서 `box.innerHTML +=` 로 붙여 매번 다시 파싱 → 느리고 이벤트가 끊긴다.

<!-- section: concept -->
## 선택

{{code: select}}

- `querySelector(sel)` — CSS 선택자로 **첫 번째** 요소. 없으면 `null` → 쓰기 전에 확인.
- `querySelectorAll(sel)` — **NodeList**(유사 배열). `forEach` 는 되지만 `map`/`filter` 는 `[...list]` 나 `Array.from` 후.
- `요소.querySelector(...)` — 그 요소 **안에서만** 검색. 범위를 좁혀 안전하게.

<!-- section: mechanism -->
## 내용 · 속성 · 클래스

{{code: content}}

- **`textContent`** — 문자열을 그대로. 안전. 기본값으로 이걸 쓴다.
- **`innerHTML`** — 문자열을 HTML 로 해석. 편하지만 **사용자 입력을 넣으면 XSS**. 비우기(`= ""`)나 내가 만든 정적 마크업에만.
- 사용자 값이 섞이면 `createElement` + `textContent` + `append` 로 만든다.

{{code: attr-class-style}}

- 보이기/숨기기·활성 상태는 **`classList`** 로 표현하고 CSS 가 그림을 담당. `style` 직접 조작은 좌표·크기 같은 **계산된 동적 값**에만.
- `dataset` 으로 `data-*` 를 읽고 쓴다(요소에 붙은 메타데이터, 이벤트 위임에서 자주 씀).
- `el.style.setProperty("--x", ...)` — CSS 변수로 넘겨 스타일은 CSS 에 맡긴다(커스텀 커서 위치 등).

### 여러 요소를 효율적으로

{{code: build}}

- 반복문 안에서 `append`/`innerHTML +=` 를 하면 매번 레이아웃을 다시 계산한다.
- **`DocumentFragment`** 에 다 담아 마지막에 한 번 `append`, 또는 `replaceChildren(...nodes)`.

### React 와의 연결

- 여기서 하는 "데이터가 바뀌면 → 관련 DOM 을 찾아 → `textContent`/`classList` 를 손으로 갱신" 을
  React 는 "상태를 바꾸면 → 알아서 다시 그림" 으로 자동화한다. 그 전에 이 수동 과정을 이해해야 React 가 왜 편한지 안다.

<!-- section: must_know -->
## 반드시 기억할 것

- `querySelector`(첫 하나, `null` 가능) / `querySelectorAll`(NodeList → `[...]` 로 배열화).
- **`textContent` 가 기본.** `innerHTML` 은 정적 마크업/비우기에만 — 사용자 입력 금지(XSS).
- 상태 표현은 `classList`, `style` 은 동적 계산값. `dataset` 으로 `data-*`.
- 여러 요소는 `DocumentFragment` / `replaceChildren` 로 한 번에.
- 이 수동 DOM 갱신을 자동화한 게 React 의 "상태 → 화면".

<!-- section: mission -->
## 미션 — 달력 그리드 렌더

calendar grid Base(HTML/CSS 제공)를 재료로.

- `renderCalendar(year, month)` : 이전 달 빈칸 + 이번 달 날짜를 `.days` 에 `DocumentFragment` 로 렌더. 각 칸에 `data-date`.
- 오늘 날짜 칸에 `classList.add("today")`.
- 헤더 `◀`/`▶` 로 `year`/`month` 를 바꿔 다시 렌더(다음 Lesson 에서 이벤트로 연결, 지금은 함수 직접 호출로 확인).
- `.display` 에 `textContent` 로 "YYYY-MM".
- 반복문 안에서 `append` 한 버전과 `Fragment` 버전을 각각 만들어 성능 차이를 개발자도구 Performance 로 관찰.
- 사용자 입력(메모)을 칸에 표시할 때 `textContent` 를 쓰는 이유를 한 줄로.

<!-- section: check_question -->
## 이해 점검

1. `querySelector` 결과가 `null` 일 수 있는 상황과 대처는?
2. `textContent` 와 `innerHTML` 중 사용자 입력에는 무엇을 쓰나? 왜?
3. 요소를 보이기/숨기기 할 때 `style.display` 대신 무엇을 권하나?
4. 42칸을 그릴 때 `DocumentFragment` 를 쓰면 무엇이 좋아지나?

<!-- section: interview_question -->
## 면접 대비

- "`innerHTML` 사용의 위험과 안전한 대안은?"
- "많은 DOM 노드를 추가할 때 성능을 어떻게 챙기나요?"
- "바닐라 DOM 조작과 React 의 렌더링 모델을 비교해 보세요."

<!-- section: review -->
## 한 줄 정리

**`querySelector(All)` 로 선택(→ `null`·NodeList 주의), 내용은 `textContent`(사용자 입력)·`innerHTML`(정적만),
상태는 `classList`·데이터는 `dataset` 으로 다루고, 여러 요소는 `DocumentFragment` 로 한 번에 렌더한다.**

<!-- section: next -->
## 다음 Lesson

`dom-and-events/events-and-delegation` — 이벤트 등록과 위임.
