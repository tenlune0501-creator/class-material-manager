---
id: javascript/jquery/jquery-basics
chapter: javascript/jquery
title: jQuery 기초
mastery: understand
lesson_kind: lesson
estimated_minutes: 35
tags: [jquery, dom, legacy]
related_material_ids:
  - 1z1ZazOejwksm81nP5m5b2zdEQcRaN1Ei              # jQuery_BASE.zip
  - 0B0HRSf3dPjJidHpZaU9jUS1qTm8
  - 1eNRD5Jtxwmp_NXPEXMHGA49DtRYt-jPRYfeBU_xyO10
  - 1dThjd-2mJtkqHzUtuVP0tDN_voqzbN3m7JdTT_0acTw
prerequisites:
  - javascript/dom-and-events/selecting-and-manipulating
  - javascript/dom-and-events/events-and-delegation
code_examples:
  - slug: load
    title: 로드와 $(function)
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
      <script>
        // DOM 준비되면 실행 (= DOMContentLoaded)
        $(function () {
          // 여기서 작업
        });
      </script>
      <!-- 왜 이 Lesson? 새 프로젝트에 jQuery 를 도입하려는 게 아니라,
           예전 코드·플러그인·회사 레거시에서 만나므로 "읽을 수" 있어야 한다 -->
  - slug: select-chain
    title: 선택 + 체이닝 + $() 래퍼
    source_type: generated_minimal
    language: js
    code: |
      $("#list li.active")          // querySelectorAll + jQuery 객체로 감쌈 (유사배열)
        .addClass("done")           // 대부분의 메서드가 자기 자신을 반환 → 체이닝
        .css("color", "green")
        .fadeIn(200);

      $("#list li").length          // 개수
      $("#list li").eq(0)           // n번째 (jQuery 객체 유지)
      $("#list li").get(0)          // n번째 (순수 DOM 요소)
      $(domElement)                 // 순수 DOM → jQuery 객체
      $("<li>새 항목</li>")          // 생성
  - slug: dom-ops
    title: 내용 · 속성 · 클래스 (바닐라 대응)
    source_type: generated_minimal
    language: js
    code: |
      $el.text("안녕");          // textContent
      $el.html("<b>x</b>");      // innerHTML
      $el.val();                 // input.value
      $el.attr("href");          // getAttribute
      $el.prop("checked");       // 속성(property) — checked/disabled 는 prop
      $el.data("id");            // dataset.id (읽기)
      $el.addClass("on").removeClass("off").toggleClass("open");
      $el.append($child); $el.remove(); $el.closest(".card"); $el.find("a");
  - slug: events-ajax
    title: 이벤트(위임) · Ajax
    source_type: generated_minimal
    language: js
    code: |
      // 위임: 부모에 걸고 셀렉터로 필터 (동적 요소에도 동작)
      $("#list").on("click", "li", function () {
        $(this).toggleClass("selected");   // this = 클릭된 li (DOM), $(this) 로 감싼다
      });

      $.ajax({ url: "/api/items", method: "GET" })
        .done((data) => { /* 성공 */ })
        .fail((xhr) => { /* 실패 */ });
      // 요즘은 $.ajax 대신 fetch 를 쓴다. jQuery 코드에서 만나면 이렇게 읽으면 된다
  - slug: today
    title: 오늘날의 위치
    source_type: generated_minimal
    language: text
    code: |
      - 2010년대 표준. 브라우저 API 파편화(IE)를 메워 준 게 핵심 가치였다.
      - 이제 querySelector/classList/fetch/Promise 가 표준이라 신규 프로젝트엔 거의 안 쓴다.
      - 여전히 만나는 곳: 옛 사내 코드, WordPress 테마·플러그인, Bootstrap 4 이하, jQuery 플러그인(slick 등).
      - 목표: jQuery 코드를 읽고, 필요하면 바닐라로 옮길 수 있다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `<script src>` 로 jQuery 를 로드하고 `$(function(){})` 안에서 작업하는 관용구를 안다.
- `$(선택자)` 가 `querySelectorAll` + 래퍼이고, 메서드가 **체이닝**된다는 것을 안다.
- `.text/.html/.val/.attr/.prop/.data/.addClass/.on` 을 **바닐라 대응**과 함께 읽는다.
- 이벤트 위임(`.on("click", "li", fn)`)과 `this`/`$(this)` 를 안다.
- jQuery 를 **읽기 위해** 배우는 것(신규 프로젝트엔 바닐라/프레임워크)이라는 맥락을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 바닐라 DOM 선택·조작, 이벤트 위임(이걸 알아야 jQuery 가 무엇을 감쌌는지 보인다).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 옛 프로젝트·워드프레스 테마·jQuery 플러그인 코드(`$(...).on(...)`)를 못 읽는다.
- `$` 로 감싼 것과 순수 DOM(`this`, `e.target`)을 헷갈려 `.addClass` 가 안 먹는다.
- `.attr("checked")` 와 `.prop("checked")` 차이를 몰라 체크박스 상태가 안 맞는다.

<!-- section: concept -->
## 왜 지금 jQuery 를 보나

{{code: today}}

- jQuery 는 브라우저 API 가 제각각이던 시절(IE) 이를 통일해 준 라이브러리다. `querySelector`·`classList`·`fetch`·`Promise` 가 표준이 된 지금
  신규 프로젝트에는 거의 안 쓴다.
- 하지만 사내 레거시, WordPress, 옛 Bootstrap, jQuery 플러그인에서 계속 만난다 → **읽고, 옮길 수** 있어야 한다.

{{code: load}}

<!-- section: mechanism -->
## 선택·조작·이벤트

{{code: select-chain}}

- `$("셀렉터")` = `querySelectorAll` 결과를 **jQuery 객체**(유사 배열)로 감싼 것. 대부분 메서드가 자신을 반환 → `.a().b().c()` 체이닝.
- `$(this)` — 이벤트 콜백 안 `this` 는 **순수 DOM 요소**라 jQuery 메서드를 쓰려면 감싼다.
- `.eq(n)`(jQuery 객체 유지) vs `.get(n)`(순수 DOM).

{{code: dom-ops}}

- 바닐라 대응: `.text`↔`textContent`, `.html`↔`innerHTML`, `.val`↔`.value`, `.attr`↔`getAttribute`, `.addClass`↔`classList.add`.
- **`.attr` vs `.prop`**: HTML 속성 vs DOM 프로퍼티. `checked`/`disabled`/`value`(현재 상태)는 **`.prop`**.

{{code: events-ajax}}

- `.on("이벤트", "자식셀렉터", fn)` = 이벤트 위임. `.off` 로 해제. `.trigger` 로 발생.
- `$.ajax`/`$.get`/`$.post` 는 오늘날 `fetch` 로 대체. jQuery 코드에서 만나면 그렇게 읽는다.

<!-- section: must_know -->
## 반드시 기억할 것

- `$(function(){})` = DOM 준비 후 실행. `$("셀렉터")` = querySelectorAll + 래퍼, 메서드 **체이닝**.
- 콜백 안 `this` 는 순수 DOM → **`$(this)`** 로 감싸 jQuery 메서드 사용.
- 대응: `.text/.html/.val/.attr/.addClass` ↔ `textContent/innerHTML/value/getAttribute/classList`.
- **`.prop`** 은 현재 상태(`checked`/`disabled`), `.attr` 은 HTML 속성.
- `.on("click", "li", fn)` = 위임. `$.ajax` ≈ `fetch`.
- jQuery 는 **읽기용**으로 배운다. 새 코드는 바닐라/프레임워크.

<!-- section: experiment -->
## 직접 해 보기

1. jQuery CDN 로드 후 `$("li").addClass("x").css("color","red")` 체이닝을 콘솔에서.
2. `$("#list").on("click","li",function(){ $(this).toggleClass("on") })` — 위임 + `$(this)` 확인.
3. 같은 동작을 바닐라(`addEventListener` + `closest` + `classList`)로 옮겨 비교.
4. 체크박스에 `.attr("checked")` 와 `.prop("checked")` 를 각각 찍어 차이 관찰.

<!-- section: check_question -->
## 이해 점검

1. `$("셀렉터")` 는 바닐라로 무엇에 해당하나? 왜 체이닝이 되나?
2. 이벤트 콜백 안 `this` 로 `.addClass` 가 안 될 때 어떻게 하나?
3. `.attr("checked")` 와 `.prop("checked")` 중 현재 체크 상태는?
4. 새 프로젝트에서 jQuery 대신 무엇을 쓰나? jQuery 를 배우는 이유는?

<!-- section: review -->
## 한 줄 정리

**jQuery 는 `$(셀렉터)` 로 요소를 감싸 체이닝 메서드(`.text/.addClass/.on`…)를 제공하던 레거시 라이브러리로,
콜백의 `this` 는 `$(this)` 로 감싸고 `.prop` 은 현재 상태를 다룬다 — 신규 코드는 바닐라, jQuery 는 읽기 위해 익힌다.**

<!-- section: next -->
## 다음 Lesson

`jquery/jquery-vs-vanilla` — 나란히 놓고 비교.
