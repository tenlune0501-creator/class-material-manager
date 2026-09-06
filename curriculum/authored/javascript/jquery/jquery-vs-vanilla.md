---
id: javascript/jquery/jquery-vs-vanilla
chapter: javascript/jquery
title: jQuery와 순수 JS 비교
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [jquery, vanilla-js, comparison]
related_material_ids:
  - 1R-LC_LxenaZj4eZ7IK61vAQAhOJE_GHCVAAyN8QtWic   # Javascript와 jQuery 비교
sources:
  - title: You Might Not Need jQuery
    url: https://youmightnotneedjquery.com/
    publisher: youmightnotneedjquery.com
    checked_at: 2026-09-07
    source_type: community_reference
prerequisites:
  - javascript/jquery/jquery-basics
code_examples:
  - slug: table
    title: 대응표 (자주 쓰는 것)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 준비                jQuery                          Vanilla
      $(fn)                              document.addEventListener("DOMContentLoaded", fn)
      // 선택
      $("#id"), $(".cls"), $("h1")       document.querySelector / querySelectorAll
      $el.eq(0)                          nodeList[0]  (또는 [...nodeList][0])
      // 순회
      $sel.each((i, el) => {})           [...nodeList].forEach((el, i) => {})
      // 클래스 / CSS
      $el.addClass("a")                  el.classList.add("a")
      $el.css("color", "red")            el.style.color = "red"
      $el.css({ fontSize: "70px" })      Object.assign(el.style, { fontSize: "70px" })
      // 내용
      $el.text("x") / .html("x")         el.textContent = "x" / el.innerHTML = "x"
      $el.attr("href") / .prop("checked")  el.getAttribute("href") / el.checked
  - slug: events
    title: 이벤트 · 표시
    source_type: generated_minimal
    language: js
    code: |
      $el.on("click", fn)               el.addEventListener("click", fn)
      $parent.on("click", ".item", fn)  parent.addEventListener("click", e => {
                                          const it = e.target.closest(".item");
                                          if (it && parent.contains(it)) fn.call(it, e);
                                        })
      $el.show() / .hide()              el.hidden = false / true   (또는 style.display)
      $el.fadeIn() / .fadeOut()         CSS: opacity + visibility + transition, 클래스 토글
  - slug: traverse-ajax
    title: 탐색 · 생성 · Ajax
    source_type: generated_minimal
    language: js
    code: |
      $el.closest(".card")              el.closest(".card")
      $el.find("a")                     el.querySelectorAll("a")
      $el.parent() / .next() / .prev()  el.parentElement / el.nextElementSibling / el.previousElementSibling
      $("<div>x</div>")                 const d = document.createElement("div"); d.textContent = "x";
      $.get(url).done(fn)               fetch(url).then(r => r.json()).then(fn)
      $.ajax({ method:"POST", data })   fetch(url, { method:"POST", body: JSON.stringify(data),
                                              headers:{ "Content-Type":"application/json" } })
  - slug: no-equivalent
    title: 바닐라에 바로 대응이 없는 것
    source_type: generated_minimal
    language: js
    code: |
      // $el.animate({left: 100}) → CSS transition/animation 또는 Web Animations API el.animate(...)
      // $.each / $.map (배열·객체 겸용) → Array.forEach/map, Object.entries
      // $el.slideUp/slideDown → max-height/transform 트랜지션으로 직접
      // jQuery 플러그인($.fn.xxx) → 대체 바닐라 라이브러리 또는 직접 구현
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- jQuery 관용구를 **바닐라 등가**로 즉석에서 옮긴다(선택/순회/클래스/CSS/내용/이벤트/탐색/Ajax).
- `$el.on(parent, selector, fn)` 위임을 바닐라(`closest` + `contains`)로 재현한다.
- `show/hide/fadeIn/animate` 처럼 바로 대응이 없는 것을 CSS/Web Animations 로 처리한다.
- "You Might Not Need jQuery" 를 참고 자료로 활용한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `jquery-basics`, 바닐라 DOM/이벤트/`fetch`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 레거시 jQuery 코드를 걷어내려는데 한 줄씩 무엇으로 바꿔야 할지 막막하다.
- `.fadeIn()` 을 `style.display` 로만 바꿔 애니메이션이 사라진다.
- 위임(`.on("click", ".x", fn)`)을 바닐라로 옮기며 `this` 를 잘못 넘긴다.

<!-- section: concept -->
## 대응표

{{code: table}}

{{code: events}}

- 대부분 1:1 이다: `$` → `querySelector(All)`, `.addClass` → `classList.add`, `.on` → `addEventListener`.
- `.css({...})` 는 `Object.assign(el.style, {...})`. `.attr` 은 `getAttribute`, 현재 상태(`checked`)는 그냥 `el.checked`.

<!-- section: mechanism -->
## 탐색·Ajax·대응 없는 것

{{code: traverse-ajax}}

- 탐색 메서드는 표준에 다 있다: `closest`, `querySelectorAll`(=`.find`), `parentElement`, `nextElementSibling`.
- `$.get`/`$.ajax` → `fetch`(+ `res.ok` 확인, 에러 처리는 이전 Lesson 참고).

{{code: no-equivalent}}

- **애니메이션류**(`animate`/`slideUp`/`fadeIn`)는 바로 대응이 없다 → CSS `transition`/`@keyframes` 또는 `element.animate()`(Web Animations API).
- `$.each`(배열·객체 겸용)는 `Array.forEach` / `Object.entries`.
- jQuery 플러그인은 바닐라 대체 라이브러리(예: slick → Swiper)나 직접 구현.

### 옮기는 순서 (실무)

1. 새 코드는 바닐라로만.
2. 기존 jQuery 는 **파일/기능 단위**로 점진 교체, 매번 회귀 확인.
3. 다른 라이브러리가 jQuery 에 의존하면 마지막에.

<!-- section: must_know -->
## 반드시 기억할 것

- `$` ↔ `querySelector(All)`, `.addClass` ↔ `classList`, `.on` ↔ `addEventListener`, `.text/.html` ↔ `textContent/innerHTML`.
- 위임: `$parent.on("click",".x",fn)` ↔ `parent.addEventListener("click", e => { const t = e.target.closest(".x"); if (t && parent.contains(t)) fn.call(t, e); })`.
- 현재 상태는 `el.checked`/`el.value`(= `.prop`), HTML 속성은 `getAttribute`(= `.attr`).
- `$.ajax`/`$.get` ↔ `fetch`.
- `animate/fadeIn/slideUp` 는 등가 없음 → CSS transition/`@keyframes` 또는 `el.animate()`.
- 참고: **youmightnotneedjquery.com**.

<!-- section: mission -->
## 미션 — jQuery 코드 바닐라로 포팅

jQuery_BASE 자료의 탭/아코디언/back-to-top 중 하나를 재료로.

- 원본 jQuery 스니펫을 주석으로 남기고 바로 아래에 바닐라 등가 작성.
- 선택·클래스·이벤트 위임·`fetch` 는 표대로 옮긴다.
- `.slideToggle()`/`.fadeIn()` 은 CSS 트랜지션(`max-height`/`opacity`)이나 `el.animate()` 로.
- 옮긴 뒤 동작이 동일한지, 접근성(`aria-expanded` 등)이 유지되는지 확인.
- 코드 길이·의존성(jQuery 제거) 비교를 3줄로.

<!-- section: check_question -->
## 이해 점검

1. `$(".x").addClass("on").css("color","red")` 를 바닐라로.
2. `$("#list").on("click","li",fn)` 를 바닐라 위임으로. `this` 는 어떻게 넘기나?
3. `$el.fadeIn()` 에 바로 대응이 없는 이유와 대안은?
4. jQuery 를 점진적으로 걷어내는 순서는?

<!-- section: interview_question -->
## 면접 대비

- "레거시 jQuery 코드베이스를 어떻게 현대화하나요?"
- "jQuery 없이도 되는 이유(표준 API)를 설명해 보세요."

<!-- section: review -->
## 한 줄 정리

**jQuery 관용구는 대부분 `querySelector`/`classList`/`addEventListener`/`fetch` 로 1:1 대응되고, 위임은 `closest`+`contains`,
`animate/fadeIn` 류만 CSS 트랜지션·`el.animate()` 로 대체하며 기능 단위로 점진 교체한다.**

<!-- section: next -->
## 다음 Lesson

`jquery/jquery-hover-and-animation` — jQuery 의 이벤트·효과 메서드.
