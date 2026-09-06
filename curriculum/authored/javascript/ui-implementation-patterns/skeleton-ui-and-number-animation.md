---
id: javascript/ui-implementation-patterns/skeleton-ui-and-number-animation
chapter: javascript/ui-implementation-patterns
title: 스켈레톤 UI와 숫자 카운트업
mastery: practical
lesson_kind: lesson
estimated_minutes: 50
tags: [javascript, skeleton-ui, animation, loading, ui]
related_material_ids:
  - 1U9d8s6WjpbDQbaRyBE7NhogK_Awqx2EcRy9G67K03yg
  - 1CXptlO7i4Wo7UGRnrEjDBIpBIGtYRkPJ
  - 193zXkSjbvBwZi-XCQqvREZbrkFXZhy62
  - 14tzeASyfnNoqN0Swk4OVs3PJoPQG4Vm9
  - 1hKwoevx3RAkAFw47SP_bcmkfjGZjhzZd
  - 1Th4fzRJ6eOYhBOYM2mQSs3_pvZ7UBncC
prerequisites:
  - javascript/async-and-http/fetch-and-ajax
  - web-foundations/css-text-and-effects/animation-and-transform
code_examples:
  - slug: skeleton-css
    title: 스켈레톤 — 형태만 먼저, shimmer 애니메이션
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      .skeleton { position: relative; overflow: hidden; background: var(--skeleton, #e9e9e9); }
      .skeleton::after {
        content: ""; position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
        transform: translateX(-100%);
        animation: shimmer 1.2s infinite;
      }
      @keyframes shimmer { to { transform: translateX(100%); } }
      .skeleton.line { height: 12px; border-radius: 8px; }
      .skeleton.media { aspect-ratio: 4 / 3; }   /* 실제 콘텐츠와 같은 크기 → 레이아웃 점프 없음 */
      @media (prefers-reduced-motion: reduce) { .skeleton::after { animation: none; } }
  - slug: skeleton-flow
    title: 로딩 → 데이터 교체 + 접근성
    source_type: generated_minimal
    language: js
    code: |
      const grid = document.querySelector("#grid");

      function showSkeleton(n = 6) {
        grid.setAttribute("aria-busy", "true");
        grid.replaceChildren(...Array.from({ length: n }, skeletonCard));
      }
      async function load() {
        showSkeleton();
        try {
          const items = await fetchItems();
          grid.replaceChildren(...items.map(realCard));   // 스켈레톤 → 실제 카드
        } catch {
          grid.replaceChildren(errorBanner("불러오기 실패"));
        } finally {
          grid.setAttribute("aria-busy", "false");        // 준비 끝 → 스크린리더가 읽음
        }
      }
      // aria-busy="true" 동안 보조기술은 "아직 준비 중" 으로 인식하고 기다린다
  - slug: countup
    title: 숫자 카운트업 — rAF + 시작시각 기준
    source_type: generated_minimal
    language: js
    code: |
      function countUp(el, to, { duration = 1200 } = {}) {
        const from = 0;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);      // easeOutCubic
        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          el.textContent = Math.round(from + (to - from) * ease(t)).toLocaleString("ko");
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
      // setInterval 로 +1 씩 하지 말 것: 프레임 드랍 시 느려지고 큰 수는 오래 걸린다
  - slug: on-view
    title: 화면에 들어올 때 실행 — IntersectionObserver
    source_type: generated_minimal
    language: js
    code: |
      const io = new IntersectionObserver((entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          countUp(e.target, +e.target.dataset.to);
          obs.unobserve(e.target);                        // 한 번만
        }
      }, { threshold: 0.4 });
      document.querySelectorAll(".stat[data-to]").forEach((el) => io.observe(el));
      // "더 보기" 무한 스크롤도 같은 관찰자로: 센티넬 요소가 보이면 다음 페이지 fetch
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 스피너 대신 **스켈레톤 UI**(형태를 먼저 보여줌)로 체감 로딩을 줄이고, `aspect-ratio` 로 레이아웃 점프를 막는다.
- `aria-busy` 로 로딩 상태를 보조기술에 알리고, 로딩 → 데이터 → 에러 흐름을 `replaceChildren` 으로 교체한다.
- 숫자 카운트업을 **`requestAnimationFrame` + 시작시각 + easing** 으로 구현한다(`setInterval` +1 금지).
- **IntersectionObserver** 로 "화면에 들어올 때" 애니메이션을 실행하고 무한 스크롤을 만든다.
- `prefers-reduced-motion` 을 존중한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `fetch` + 로딩/에러 상태, CSS `@keyframes`/`transform`, 타이머·rAF.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 로딩 동안 빈 화면 → 데이터가 오면서 콘텐츠가 툭 나타나고 아래가 밀린다(CLS).
- 스크린리더가 로딩 중인 영역을 다 읽어버린다.
- 카운트업을 `setInterval(() => n++, 10)` 으로 만들어 큰 수는 몇 초씩 걸리고 프레임이 튄다.
- 통계 숫자가 화면에 보이기도 전에 다 올라가 버린다.

<!-- section: concept -->
## 스켈레톤 UI

{{code: skeleton-css}}

- 실제 콘텐츠의 **자리와 크기를 먼저** 회색 블록으로 보여준다 → 체감 대기 감소 + `aspect-ratio` 로 점프 방지.
- shimmer 는 `::after` 그라디언트를 `translateX` 로 지나가게. `prefers-reduced-motion` 이면 끈다.

<!-- section: mechanism -->
## 로딩 흐름과 접근성

{{code: skeleton-flow}}

- `showSkeleton()` 으로 스켈레톤 카드 n개를 그리고 `aria-busy="true"`.
- 성공 시 실제 카드로 `replaceChildren`, 실패 시 에러 배너, `finally` 에서 `aria-busy="false"`.
- `aria-busy="true"` 동안 스크린리더는 "준비 중" 으로 알고 기다린다 → 반쯤 그려진 걸 안 읽음.

{{code: countup}}

- `performance.now()` 로 시작 시각을 잡고, 매 프레임 `경과/지속시간` 비율 `t` 에 **easing** 적용해 `from→to` 보간.
- `setInterval` +1 은 값에 비례해 오래 걸리고 프레임 드랍에 취약. **rAF + 시각 기준**이 정확.
- `toLocaleString("ko")` 로 천 단위 콤마.

{{code: on-view}}

- **IntersectionObserver** 로 요소가 뷰포트에 `threshold` 만큼 들어오면 카운트업 실행 후 `unobserve`(한 번만).
- 무한 스크롤: 목록 끝 센티넬 요소를 관찰 → 보이면 다음 페이지 `fetch`. (스크롤 이벤트 + 계산보다 효율적)

<!-- section: must_know -->
## 반드시 기억할 것

- 스켈레톤 = 실제 크기의 자리 표시(+`aspect-ratio` 점프 방지) + shimmer. `prefers-reduced-motion` 시 정지.
- 로딩 영역에 **`aria-busy`** 토글. 로딩→데이터→에러는 `replaceChildren` 로 교체.
- 카운트업 = **rAF + `performance.now()` 기준 + easing**. `setInterval` +1 금지.
- "화면에 들어올 때" 는 **IntersectionObserver** (+ `unobserve` 로 1회). 무한 스크롤도 센티넬 관찰.

<!-- section: mission -->
## 미션 — 대시보드 로딩 + 통계 카운트업

Skeleton UI 매뉴얼을 재료로.

- 상품/카드 그리드: 진입 시 스켈레톤 6장 → `fetch`(의도적 지연) → 실제 카드. 에러 시 배너. `aria-busy` 토글.
- `aspect-ratio` 로 이미지 자리 확보(로드 후 점프 0 확인).
- 상단 통계 4개(가입자·매출 등): `data-to` 값으로 IntersectionObserver 진입 시 카운트업(easeOutCubic, 콤마).
- "더 보기" 또는 무한 스크롤: 센티넬 요소 관찰 → 다음 페이지 스켈레톤 → 데이터 append.
- `prefers-reduced-motion` 에서 shimmer·카운트업을 최종값 즉시 표시로 대체.

<!-- section: check_question -->
## 이해 점검

1. 스피너 대신 스켈레톤을 쓰면 무엇이 좋아지나? `aspect-ratio` 의 역할은?
2. `aria-busy` 는 무엇을 위한 속성인가?
3. 카운트업을 `setInterval` +1 로 만들면 어떤 문제가 있나? 대안은?
4. 요소가 화면에 보일 때만 실행하려면 무엇을 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "로딩 UX 를 어떻게 설계하나요? (스피너 vs 스켈레톤 vs 낙관적 UI)"
- "IntersectionObserver 로 스크롤 이벤트를 대체하는 이유는?"
- "숫자 애니메이션을 프레임 안전하게 만드는 법은?"

<!-- section: review -->
## 한 줄 정리

**스켈레톤으로 실제 크기의 자리를 먼저 보여주고(`aria-busy`+`aspect-ratio`) 데이터가 오면 `replaceChildren` 으로 교체하며,
숫자는 rAF+시작시각+easing 으로 카운트업하고 "화면 진입 시 실행" 은 IntersectionObserver 로 한다.**

<!-- section: next -->
## 다음 Lesson

`ui-implementation-patterns/file-preview-and-drag-drop` — 파일 업로드 UX.
