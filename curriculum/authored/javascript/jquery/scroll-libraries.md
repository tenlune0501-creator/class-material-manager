---
id: javascript/jquery/scroll-libraries
chapter: javascript/jquery
title: 스크롤 라이브러리 (ScrollMagic·wow.js·fullPage.js)
mastery: practical
lesson_kind: lesson
estimated_minutes: 50
tags: [jquery, scroll, scrollmagic, wowjs, fullpage, animation]
related_material_ids:
  - 1Syu2Owv5OR0McZaobXkcWR8yoinxNXPU
  - 1wARJa31byezya3LvJ9vvdtubrS__cmBw
  - 1uQpbqMcfASrCBOHjwxVAgGXCYhrrWw-o
  - 1NopRne5Ihf1ShjufAwHS8gBFi7whlejw
  - 10YXGXxB-VlKPzHC1qDhMg6T9PahEoWrm
  - 1WuiU6uPBHdrEcM0RLZNxP-2Fjtd1zEyQ
prerequisites:
  - javascript/jquery/jquery-hover-and-animation
  - javascript/ui-implementation-patterns/skeleton-ui-and-number-animation
sources:
  - title: Intersection Observer API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    publisher: MDN Web Docs
    checked_at: 2026-09-07
    source_type: official_docs
code_examples:
  - slug: reveal-io
    title: 스크롤 진입 시 등장 — 라이브러리 없이 (권장 기본)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // wow.js 가 하던 일 = "화면에 들어오면 클래스 추가" → IntersectionObserver 로 충분
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");   // CSS: .reveal{opacity:0;transform:translateY(20px)}
            io.unobserve(e.target);          //      .reveal.in{opacity:1;transform:none;transition:.6s}
          }
        }
      }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
      document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  - slug: progress-parallax
    title: 스크롤 진행률 · 가벼운 패럴랙스
    source_type: generated_minimal
    language: js
    code: |
      let ticking = false;
      addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {                 // 스크롤 핸들러는 rAF 로 스로틀
          const p = scrollY / (document.body.scrollHeight - innerHeight);
          bar.style.transform = `scaleX(${p})`;       // 상단 진행바
          hero.style.transform = `translateY(${scrollY * 0.3}px)`;  // 약한 패럴랙스
          ticking = false;
        });
      }, { passive: true });                          // passive: 스크롤 성능
  - slug: libs
    title: 라이브러리들 — 무엇을, 언제
    source_type: generated_minimal
    language: text
    code: |
      wow.js         스크롤 진입 시 애니메이션 클래스. 지금은 IntersectionObserver 로 대체.
      ScrollMagic    스크롤 위치에 애니메이션을 "핀/스크럽". jQuery 시대 산물, 유지보수 저조.
                     → 요즘은 GSAP + ScrollTrigger 를 쓴다(더 강력·활발).
      fullPage.js    한 화면씩 넘어가는 풀페이지 스크롤. 상용 라이선스 주의. CSS
                     scroll-snap 으로 간단한 건 대체 가능.
      AOS            wow.js 유사, data-aos 속성 기반. 여전히 쓰이지만 IO 로 자작 가능.
      Lenis / GSAP   부드러운 스크롤·타임라인 애니메이션의 현대적 선택.
  - slug: scroll-snap
    title: CSS 만으로 풀페이지 느낌
    source_type: generated_minimal
    language: css
    code: |
      .pages { scroll-snap-type: y mandatory; overflow-y: scroll; height: 100vh; }
      .page  { scroll-snap-align: start; height: 100vh; }
      /* 섹션 스냅 정도는 JS 없이. 진짜 풀페이지 UX(전환 애니메이션·키보드)면 라이브러리 */
  - slug: a11y
    title: 접근성·성능 체크
    source_type: generated_minimal
    language: css
    code: |
      @media (prefers-reduced-motion: reduce) {
        .reveal, .reveal.in { opacity: 1; transform: none; transition: none; }
      }
      /* 스크롤 하이재킹(fullPage 류)은 키보드·스크린리더·"뒤로가기" 를 깨기 쉽다 → 신중히 */
      /* 애니메이션은 transform/opacity. 스크롤 핸들러는 passive + rAF */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- "스크롤 진입 시 등장" 을 **IntersectionObserver + CSS** 로 라이브러리 없이 구현한다(wow.js/AOS 가 하던 일).
- 스크롤 진행바·가벼운 패럴랙스를 `scroll` + `requestAnimationFrame` + `passive` 로 만든다.
- ScrollMagic / wow.js / fullPage.js / AOS 가 무엇을 했고, **오늘날 대안**(GSAP+ScrollTrigger, CSS scroll-snap, Lenis)이 무엇인지 안다.
- 스크롤 하이재킹의 접근성 리스크와 `prefers-reduced-motion` 을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- IntersectionObserver(`skeleton-ui-and-number-animation`), CSS transform/transition, jQuery 효과.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 스크롤 등장 효과 하나 때문에 jQuery + ScrollMagic + wow.js 를 다 얹는다(무겁고 유지보수 어려움).
- `scroll` 이벤트에서 바로 레이아웃을 읽고 써서 스크롤이 버벅인다.
- fullPage.js 로 만든 사이트가 키보드·"뒤로가기"·스크린리더에서 깨진다.

<!-- section: concept -->
## 대부분은 라이브러리가 필요 없다

{{code: reveal-io}}

- wow.js/AOS 의 핵심 = "요소가 화면에 들어오면 애니메이션 클래스 추가". 이건 **IntersectionObserver** 한 줄이면 된다.
- 애니메이션 자체는 CSS(`.reveal` → `.reveal.in`, `transform`/`opacity` 트랜지션).

{{code: progress-parallax}}

- 진행바·패럴랙스처럼 **스크롤 위치에 연동**되는 건 `scroll` 이벤트에서 값만 읽고 `requestAnimationFrame` 안에서 `transform` 갱신, 리스너는 `{ passive: true }`.

<!-- section: mechanism -->
## 라이브러리 지도

{{code: libs}}

- **wow.js / AOS** — 스크롤 진입 애니메이션. → IntersectionObserver 자작으로 대체 가능.
- **ScrollMagic** — 스크롤에 애니메이션을 핀/스크럽. jQuery 시대 산물, 유지보수 저조. → **GSAP + ScrollTrigger**.
- **fullPage.js** — 한 화면씩 넘기는 풀페이지. **상용 라이선스** 주의. 단순 스냅은 CSS `scroll-snap`.
- **Lenis / GSAP** — 부드러운 스크롤·타임라인의 현대적 선택.

{{code: scroll-snap}}

- 섹션 스냅 정도는 CSS `scroll-snap-type`/`scroll-snap-align` 로 JS 없이.

{{code: a11y}}

- **스크롤 하이재킹**(기본 스크롤 동작을 가로채는 fullPage 류)은 키보드·스크린리더·딥링크·뒤로가기를 깨기 쉽다 → 꼭 필요한지 재검토.
- `prefers-reduced-motion` 에서 등장 효과·패럴랙스를 끈다. 애니메이션은 `transform`/`opacity`.

<!-- section: must_know -->
## 반드시 기억할 것

- 스크롤 등장 = **IntersectionObserver + CSS 클래스**(라이브러리 불필요). `unobserve` 로 1회.
- 스크롤 연동(진행바·패럴랙스) = `scroll`(값만) + **rAF** + `{ passive: true }`.
- ScrollMagic → GSAP+ScrollTrigger, wow.js/AOS → IO 자작, fullPage.js(라이선스) → CSS `scroll-snap`.
- 스크롤 하이재킹은 접근성 위험 — 신중히. `prefers-reduced-motion` 존중.
- 애니메이션은 `transform`/`opacity`.

<!-- section: mission -->
## 미션 — 스크롤 인터랙션 랜딩

제공 자료를 재료로, jQuery 스크롤 플러그인 없이.

- 섹션 등장 효과: `.reveal` + IntersectionObserver. 방향별 변형(위/좌/우), stagger(자식 `transition-delay`).
- 상단 스크롤 진행바 + 히어로 약한 패럴랙스(rAF + passive).
- 섹션 스냅: CSS `scroll-snap`. 키보드 PageUp/Down 이 정상 동작하는지 확인(하이재킹 안 함).
- 통계 카운트업(이전 Lesson)과 결합: 화면 진입 시 실행.
- `prefers-reduced-motion` 에서 등장·패럴랙스·스냅 애니메이션 비활성.
- (있으면) 기존 wow.js/ScrollMagic 예제 하나를 IO 버전으로 이식하고 번들 크기 비교.

<!-- section: check_question -->
## 이해 점검

1. wow.js/AOS 가 하던 일을 표준 API 로 어떻게 대체하나?
2. `scroll` 이벤트 핸들러에서 성능을 위해 무엇을 하나? (`passive`, rAF)
3. fullPage.js 를 쓰기 전에 고려할 점 두 가지는? (라이선스, 접근성)
4. ScrollMagic 의 현대적 대안은?

<!-- section: interview_question -->
## 면접 대비

- "스크롤 애니메이션을 라이브러리 없이 구현하는 방법은?"
- "스크롤 하이재킹의 접근성 문제를 설명해 보세요."
- "패럴랙스를 성능 좋게 만들려면?"

<!-- section: review -->
## 한 줄 정리

**스크롤 등장은 IntersectionObserver + CSS, 스크롤 연동은 `scroll`(값만)+rAF+passive 로 라이브러리 없이 되며,
ScrollMagic→GSAP·wow.js→IO·fullPage.js→`scroll-snap` 이 현대적 대안이고 스크롤 하이재킹은 접근성 때문에 신중해야 한다.**

<!-- section: next -->
## 다음 Chapter

`javascript` 트랙 마무리 — 남은 `external-apis` (지도·날씨·차트).
