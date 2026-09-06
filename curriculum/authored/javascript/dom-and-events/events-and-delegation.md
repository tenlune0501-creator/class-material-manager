---
id: javascript/dom-and-events/events-and-delegation
chapter: javascript/dom-and-events
title: 이벤트 등록과 위임
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [javascript, dom, events, addEventListener, delegation]
related_material_ids:
  - 19mP18ldFS7_FSzgFZtbH72nZTl033mD2              # menu hover effect base
  - 1RfTKoSkDllWZI-XJM1WUgNC9jQxxEKgz              # filter base
prerequisites:
  - javascript/dom-and-events/selecting-and-manipulating
code_examples:
  - slug: basic
    title: addEventListener — 등록 / 해제
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const btn = document.querySelector("#save");

      function onSave(e) {
        console.log("clicked", e.currentTarget);   // 리스너를 단 요소
      }
      btn.addEventListener("click", onSave);
      btn.removeEventListener("click", onSave);     // 같은 함수 참조여야 해제됨 (익명 함수는 못 뗌)

      // 옵션
      el.addEventListener("scroll", onScroll, { passive: true });  // preventDefault 안 함 → 부드러움
      el.addEventListener("click", once, { once: true });          // 한 번만
  - slug: default-bubble
    title: preventDefault / 버블링 / stopPropagation
    source_type: generated_minimal
    language: js
    code: |
      form.addEventListener("submit", (e) => {
        e.preventDefault();          // 폼 기본 제출(새로고침) 취소
      });
      link.addEventListener("click", (e) => e.preventDefault());  // a 이동 취소

      // 이벤트는 target → 부모 → ... → document 로 "버블링" 된다
      inner.addEventListener("click", () => console.log("inner"));
      outer.addEventListener("click", () => console.log("outer"));  // inner 클릭해도 실행됨
      // e.stopPropagation() 으로 위로 안 올라가게 (꼭 필요할 때만)
  - slug: delegation
    title: 이벤트 위임 — 부모 하나에 리스너
    source_type: generated_minimal
    language: js
    code: |
      const list = document.querySelector(".product_list");

      list.addEventListener("click", (e) => {
        const item = e.target.closest(".item");   // 클릭 지점에서 가장 가까운 .item
        if (!item || !list.contains(item)) return;
        const id = item.dataset.order;
        item.classList.toggle("selected");
        console.log("선택:", id);
      });
      // 장점: item 이 나중에 추가돼도 동작. 리스너 1개로 수백 개 커버.
  - slug: controls
    title: 필터/정렬 버튼 — data 속성 + 위임
    source_type: generated_minimal
    language: js
    code: |
      const controls = document.querySelector(".controls");

      controls.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-filter]");
        if (!btn) return;
        const sel = btn.dataset.filter;                       // "*" | ".web" | ...
        document.querySelectorAll(".product_list .item").forEach((li) => {
          li.hidden = sel !== "*" && !li.matches(sel);        // hidden 속성으로 표시/숨김
        });
      });

      // select 는 change 이벤트
      document.querySelector("#sort").addEventListener("change", (e) => {
        sortItems(e.target.value);
      });
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `addEventListener` 로 이벤트를 등록/해제하고, `{ once, passive }` 옵션을 안다.
- `e.target` vs `e.currentTarget`, `preventDefault()`, **버블링**, `stopPropagation()` 을 구분한다.
- **이벤트 위임**(부모에 리스너 하나 + `e.target.closest()`)으로 동적 목록을 처리한다.
- 필터/정렬 UI 를 `data-*` 속성 + 위임으로 구현한다.
- (연결) React 의 `onClick` 이 실제로는 이 위임 방식과 닮았음을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `selecting-and-manipulating`(선택, `classList`, `dataset`), 함수·화살표 함수.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 목록 아이템 100개에 각각 `addEventListener` → 코드도 메모리도 낭비. 아이템을 새로 추가하면 리스너가 없다.
- `<a>`/`submit` 이 페이지를 새로고침해서 JS 가 중단된다.
- 자식 요소(아이콘 `<span>`)를 클릭하면 `e.target` 이 그 `<span>` 이라 `dataset` 이 없다.

<!-- section: concept -->
## 등록과 이벤트 객체

{{code: basic}}

- `addEventListener(type, handler, options)`. 같은 요소에 여러 개 달 수 있다.
- 해제(`removeEventListener`)하려면 **등록할 때와 같은 함수 참조**가 필요 → 익명 함수는 못 뗀다.
- `e.currentTarget` = 리스너를 단 요소. `e.target` = 실제로 이벤트가 시작된 요소(자식일 수 있음).

{{code: default-bubble}}

- `e.preventDefault()` — 브라우저 기본 동작(폼 제출, 링크 이동, 체크박스 토글) 취소.
- **버블링** — 이벤트는 `target` 에서 시작해 조상으로 타고 올라간다. 그래서 부모에서도 자식 클릭을 잡을 수 있다(위임의 원리).
- `e.stopPropagation()` — 위로 전파 중단. 남용하면 다른 리스너가 안 먹으니 꼭 필요할 때만.

<!-- section: mechanism -->
## 이벤트 위임

{{code: delegation}}

- 자식마다 리스너를 다는 대신 **부모 하나**에 달고, `e.target.closest(선택자)` 로 "어느 아이템인지" 찾는다.
- 장점: (1) 나중에 추가된 아이템도 자동 동작 (2) 리스너 1개 = 메모리·설정 비용 최소 (3) 코드가 한곳.
- 주의: `closest` 가 `null` 이거나 그 부모가 이 컨테이너 밖이면 무시.

{{code: controls}}

- 필터/정렬 버튼은 `data-filter="*"` / `data-sort="asc"` 같은 **데이터 속성**에 의도를 담고, 위임으로 한 번에 처리.
- `<select>` 는 `click` 이 아니라 **`change`** 이벤트. `e.target.value`.
- 표시/숨김은 `element.hidden = true` (또는 `classList`)로.

### React 와의 연결

- React 의 `onClick={...}` 은 각 DOM 에 직접 리스너를 다는 게 아니라 루트에서 위임 처리한다(합성 이벤트).
- 즉 여기서 배운 "부모에서 잡아 `target` 으로 분기" 사고가 React 이벤트 모델의 바탕이다.

<!-- section: must_know -->
## 반드시 기억할 것

- `addEventListener(type, fn, options)`. 해제는 **같은 함수 참조** 필요(익명 X). `{ once, passive }`.
- `e.target`(시작 지점, 자식 가능) ≠ `e.currentTarget`(리스너 단 요소).
- `preventDefault()` = 기본 동작 취소. 버블링 = target→조상 전파. `stopPropagation()` 은 최소한만.
- **이벤트 위임** = 부모에 리스너 1개 + `e.target.closest(sel)`. 동적 목록·성능에 유리.
- 버튼 의도는 `data-*`, `<select>` 는 `change`, 표시/숨김은 `hidden`/`classList`.

<!-- section: mission -->
## 미션 — 필터·정렬 목록 + 메뉴 하이라이트

filter Base / menu hover Base 를 재료로.

- 상품 목록: `.controls` 에 **클릭 위임** 하나로 `data-filter` 버튼과 `data-sort` 버튼 처리.
- `<select id="filter">`, `<select id="sort">` 는 `change` 로 같은 로직 재사용(함수로 분리).
- 목록 아이템 클릭(위임) → `selected` 토글. 아이템을 JS 로 3개 더 추가해도 동작하는지 확인.
- 메뉴 하이라이트: `nav` 에 `mouseover`/`mouseout` 위임 + `.target` 바를 `getBoundingClientRect` 로 이동.
- 익명 함수로 등록했다가 `removeEventListener` 가 안 되는 걸 재현하고, 이름 붙여 고치기.

<!-- section: check_question -->
## 이해 점검

1. `e.target` 과 `e.currentTarget` 의 차이를 예로 설명.
2. 이벤트 위임이 동적으로 추가되는 목록에서 유리한 이유는?
3. `removeEventListener` 가 안 먹는 흔한 실수는?
4. `<select>` 의 값 변화를 잡는 이벤트는? 폼 새로고침을 막는 방법은?

<!-- section: interview_question -->
## 면접 대비

- "이벤트 버블링과 캡처링을 설명하고, 위임이 왜 버블링에 의존하는지 말해 보세요."
- "리스너를 수백 개 다는 것과 위임 하나의 트레이드오프는?"
- "React 의 이벤트 처리가 DOM 이벤트와 어떻게 다른가요?"

<!-- section: review -->
## 한 줄 정리

**`addEventListener` 로 등록하고 `e.target`/`preventDefault`/버블링을 이해한 뒤, 자식마다 달지 말고 부모 하나에
`e.target.closest()` 로 분기하는 이벤트 위임을 쓰면 동적 목록·필터 UI 를 리스너 1개로 처리한다 — React `onClick` 의 바탕.**

<!-- section: next -->
## 다음 Lesson

`async-and-http/http-basics` — 요청/응답과 상태코드.
