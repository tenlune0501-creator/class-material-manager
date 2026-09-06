---
id: javascript/jquery/jquery-hover-and-animation
chapter: javascript/jquery
title: jQuery hover·이벤트·애니메이션
mastery: practical
lesson_kind: lesson
estimated_minutes: 40
tags: [jquery, hover, animation, event]
related_material_ids:
  - 0B0HRSf3dPjJiSmlFbDlaQnBxQzQ
  - 1T_9Ofx3Ea4c3kwcm632fmXAmIrw8U49Y
prerequisites:
  - javascript/jquery/jquery-vs-vanilla
code_examples:
  - slug: events
    title: 이벤트 — on / 위임 / this
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      $(".tab").on("click", function () {
        $(".tab").removeClass("active");
        $(this).addClass("active");                 // this = 클릭된 .tab
        $(".panel").hide().eq($(this).index()).show();  // index() = 형제 중 순번
      });

      // 위임 (동적 항목)
      $("#list").on("click", ".item .remove", function () {
        $(this).closest(".item").remove();
      });

      // hover = mouseenter + mouseleave 묶음
      $(".menu li").hover(
        function () { $(this).addClass("open"); },   // enter
        function () { $(this).removeClass("open"); }  // leave
      );
  - slug: effects
    title: 효과 메서드
    source_type: generated_minimal
    language: js
    code: |
      $el.show(200); $el.hide(200); $el.toggle(200);
      $el.fadeIn(200); $el.fadeOut(200); $el.fadeToggle(200);
      $el.slideDown(200); $el.slideUp(200); $el.slideToggle(200);
      $el.fadeTo(200, 0.5);
      // 콜백 = 애니메이션이 끝난 뒤 실행 (연쇄의 핵심)
      $el.slideUp(200, function () { $(this).remove(); });
  - slug: animate-queue
    title: animate 와 큐(queue)
    source_type: generated_minimal
    language: js
    code: |
      $box
        .animate({ left: "+=100px", opacity: 0.5 }, 300)   // 큐에 쌓임 → 순차 실행
        .animate({ top: "50px" }, 300)
        .animate({ left: 0, opacity: 1 }, 300);

      $box.stop(true, true);   // 진행 중 애니메이션 정리 (hover 반복 시 필수 — 안 하면 밀림)
      // 큐를 건너뛰려면 { queue: false }, 지연은 .delay(ms)
  - slug: modern-note
    title: 지금은 CSS/WAAPI 로
    source_type: generated_minimal
    language: js
    code: |
      // jQuery 효과 → 현대적 대안
      //   fadeIn/Out      → CSS: opacity + transition (또는 el.animate)
      //   slideUp/Down    → CSS: grid-template-rows 0fr→1fr, 또는 height/max-height transition
      //   animate({...})   → el.animate([{...},{...}], { duration, easing })  (Web Animations API)
      //   .stop(true,true) → getAnimations().forEach(a => a.cancel())
      // hover 는 대부분 CSS :hover 로 충분. JS 는 상태·타이밍이 필요할 때만
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- jQuery 이벤트(`.on`, 위임, `.hover`)와 `this`/`.index()` 를 읽고, 탭·아코디언·메뉴에 적용한다.
- 효과 메서드(`show/hide/fade*/slide*`)와 **완료 콜백**으로 연쇄 동작을 만든다.
- `.animate()` 가 **큐에 쌓여 순차 실행**되고, `.stop(true, true)` 로 hover 반복 밀림을 막는다는 것을 안다.
- 같은 효과를 CSS transition / Web Animations API 로 옮긴다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `jquery-vs-vanilla`, CSS transition/`@keyframes`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 탭/아코디언 jQuery 코드에서 `$(this).index()` 로 패널을 고르는 부분이 안 읽힌다.
- 메뉴에 마우스를 빠르게 넣었다 뺐다 하면 애니메이션이 계속 밀려서 늦게 닫힌다(`stop` 누락).
- `.slideUp()` 후 요소를 지우고 싶은데 타이밍을 못 잡는다(완료 콜백 모름).

<!-- section: concept -->
## 이벤트

{{code: events}}

- `.on("click", fn)` / 위임 `.on("click", ".child", fn)`. 콜백 `this` = 이벤트가 걸린 요소(DOM).
- **`.index()`** — 형제들 사이에서 자기 순번. 탭 ↔ 패널 매칭에 자주 쓴다.
- **`.hover(enterFn, leaveFn)`** = `mouseenter` + `mouseleave`.

<!-- section: mechanism -->
## 효과와 큐

{{code: effects}}

- `show/hide/toggle`, `fadeIn/Out/Toggle`, `slideDown/Up/Toggle` — 인자는 지속시간(ms). 마지막 인자로 **완료 콜백**.
- 완료 콜백 안 `this` 도 그 요소 → `$(this).remove()` 로 "사라진 뒤 제거".

{{code: animate-queue}}

- `.animate({css}, ms)` 는 **fx 큐**에 쌓여 순차 실행. `+=`/`-=` 상대값 가능.
- **`.stop(true, true)`** — 남은 큐를 비우고 현재 애니메이션을 끝 상태로. hover 반복에서 안 하면 동작이 누적돼 밀린다.
- `.delay(ms)`, `{ queue: false }` 로 타이밍 제어.

{{code: modern-note}}

- 오늘날 대안: fade/slide 는 CSS `transition`(`opacity`, `grid-template-rows 0fr→1fr`), `.animate()` 는 `el.animate([...], {...})`(WAAPI),
  `.stop` 은 `el.getAnimations().forEach(a => a.cancel())`. hover 는 대부분 CSS `:hover`.

<!-- section: must_know -->
## 반드시 기억할 것

- `.on(evt, [selector,] fn)`, 콜백 `this` = DOM 요소. `.index()` = 형제 중 순번(탭↔패널).
- `.hover(enter, leave)` = `mouseenter`+`mouseleave`.
- 효과 메서드 마지막 인자 = **완료 콜백**(연쇄·정리에).
- `.animate()` 는 **큐 순차 실행**. hover 반복엔 **`.stop(true, true)`** 필수.
- 현대적으로는 CSS transition / `element.animate()` / CSS `:hover`.

<!-- section: mission -->
## 미션 — 탭·아코디언·메뉴 (jQuery → 이해 → 이식)

hover/animation 자료를 재료로.

- 탭: `.on("click")` + `$(this).index()` 로 패널 매칭, `fadeIn/Out`. 완료 콜백으로 포커스 이동.
- 아코디언: `slideToggle`, 한 번에 하나만 열림, 나머지 `slideUp`.
- 메뉴: `.hover` + `.stop(true, true)` — 빠르게 왕복해도 밀리지 않는지 확인.
- 위 3개를 각각 CSS transition / WAAPI 버전으로 하나씩 이식.
- `.stop` 을 뺀 버전과 넣은 버전의 hover 반복 동작 차이를 관찰.

<!-- section: check_question -->
## 이해 점검

1. jQuery 이벤트 콜백에서 `this` 는 무엇인가? `.index()` 는?
2. 효과 메서드의 마지막 인자는 무엇이고 왜 유용한가?
3. hover 애니메이션이 밀리는 이유와 해결책은?
4. `$el.slideToggle()` 를 CSS 로 옮기려면 어떤 속성을 트랜지션하나?

<!-- section: interview_question -->
## 면접 대비

- "jQuery 애니메이션 큐가 무엇이고 `.stop()` 은 언제 필요한가요?"
- "jQuery 효과를 CSS/WAAPI 로 대체할 때 주의점은?"

<!-- section: review -->
## 한 줄 정리

**jQuery 이벤트는 `this`/`.index()` 로 탭·패널을 잇고 효과 메서드의 완료 콜백으로 연쇄하며, `.animate()` 는 큐 순차 실행이라
hover 반복엔 `.stop(true,true)` 가 필수 — 지금은 CSS transition·`element.animate()`·`:hover` 로 대체한다.**

<!-- section: next -->
## 다음 Lesson

`jquery/scroll-libraries` — 스크롤 연동 애니메이션 라이브러리.
