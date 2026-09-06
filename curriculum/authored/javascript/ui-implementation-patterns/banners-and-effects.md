---
id: javascript/ui-implementation-patterns/banners-and-effects
chapter: javascript/ui-implementation-patterns
title: 배너·메뉴 hover·커스텀 커서
mastery: practical
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, banner, hover, cursor, ui]
related_material_ids:
  - 1ydIkwY1tXxmZ1B0drCnlFvukU4Bb9sjx
  - 1UA5i_5w9nz2we1EOl0juhqCwdlsxfvk2
  - 19mP18ldFS7_FSzgFZtbH72nZTl033mD2
prerequisites:
  - javascript/dom-and-events/events-and-delegation
  - javascript/browser-apis-and-storage/timers
  - web-foundations/css-text-and-effects/animation-and-transform
code_examples:
  - slug: banner
    title: 롤링 배너 — 슬라이더 + 하루 안 보기
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const banner = document.querySelector("#banner");
      if (localStorage.getItem("bannerHiddenUntil") > Date.now()) {
        banner.hidden = true;                       // 오늘은 숨김
      } else {
        startRoll(banner, 3000);                    // idx 상태 + translateY 트랙 (세로 롤링)
        banner.querySelector(".hide-today").addEventListener("click", () => {
          localStorage.setItem("bannerHiddenUntil", Date.now() + 864e5);  // +24h
          banner.hidden = true;
        });
        banner.querySelector(".close").addEventListener("click", () => (banner.hidden = true));
      }
  - slug: nav-highlight
    title: 메뉴 hover 하이라이트 바 (이벤트 위임 + rect)
    source_type: generated_minimal
    language: js
    code: |
      const nav = document.querySelector(".nav");
      const bar = nav.querySelector(".highlight");
      const navRect = () => nav.getBoundingClientRect();

      nav.addEventListener("pointerover", (e) => {
        const a = e.target.closest("a"); if (!a) return;
        const r = a.getBoundingClientRect();
        bar.style.transform = `translateX(${r.left - navRect().left}px)`;
        bar.style.width = `${r.width}px`;
      });
      nav.addEventListener("pointerleave", () => moveBarTo(nav.querySelector(".active")));
      // 위임 하나 + transform/width 만 애니메이션 → 부드럽고 링크 개수와 무관
  - slug: cursor
    title: 커스텀 커서 — rAF 로 따라가기(lerp)
    source_type: generated_minimal
    language: js
    code: |
      const dot = document.querySelector("#cursor");
      let mx = 0, my = 0, x = 0, y = 0;
      addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });

      function loop() {
        x += (mx - x) * 0.2;                        // 부드럽게 따라오는 지연 (lerp)
        y += (my - y) * 0.2;
        dot.style.transform = `translate(${x}px, ${y}px)`;  // top/left 아님
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
      // 호버 대상에서 커서 확대: .link:hover ~ #cursor { scale: 2 } 또는 클래스 토글
      @media (pointer: coarse) { #cursor { display: none; } }   /* 터치기기는 숨김 */
  - slug: perf-a11y
    title: 성능·접근성 주의
    source_type: generated_minimal
    language: js
    code: |
      // 스크롤/포인터 핸들러: 좌표만 저장하고 실제 DOM 갱신은 rAF 에서 (throttle 효과)
      // transform/opacity 만 애니메이션. top/left/box-shadow 는 버벅임
      // 커스텀 커서: cursor:none 로 기본 커서를 숨겨도 키보드 포커스는 그대로 보이게
      // 배너: role="region" aria-label, 자동 롤링은 정지 가능, prefers-reduced-motion 시 정지
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 롤링 배너를 슬라이더 상태 모델 + `localStorage` "하루 안 보기" 로 만든다.
- 메뉴 hover 하이라이트 바를 **이벤트 위임 + `getBoundingClientRect` + `transform`** 으로 구현한다.
- 커스텀 커서를 `pointermove` 좌표 저장 + `requestAnimationFrame` + lerp(지연 추적)로 만든다.
- 포인터/스크롤 핸들러는 **좌표만 저장하고 DOM 갱신은 rAF 에서** 하는 패턴을 쓴다.
- 터치기기 제외(`pointer: coarse`), `prefers-reduced-motion`, 키보드 포커스 유지를 지킨다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 이벤트 위임, 타이머·rAF, `localStorage`, CSS transform/transition.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 배너가 매 방문마다 떠서 성가시다("하루 안 보기" 없음).
- 메뉴 링크마다 하이라이트 리스너를 달고, `left` 로 움직여 버벅인다.
- 커스텀 커서를 `pointermove` 안에서 바로 `style.top/left` 갱신 → 프레임 드랍.
- 커스텀 커서가 모바일에서 화면 구석에 박혀 있다.

<!-- section: concept -->
## 롤링 배너

{{code: banner}}

- 배너 = 미니 슬라이더(`idx` 상태 + `translateY` 트랙). `slideshows-and-sliders` 의 모델 재사용.
- "하루 안 보기" = `localStorage` 에 만료 타임스탬프 저장 → 로드 시 비교해서 `hidden`.
- 닫기 버튼, 자동 롤링 hover 정지, `prefers-reduced-motion` 시 롤링 정지.

<!-- section: mechanism -->
## hover 하이라이트 바

{{code: nav-highlight}}

- `nav` 에 **위임** 하나. `e.target.closest("a")` 로 어느 링크인지 → `getBoundingClientRect` 로 위치·너비 계산 → 바를 `transform`/`width` 로 이동.
- 링크 개수와 무관하게 리스너 1개. `pointerleave` 에서 `.active` 링크로 복귀.

{{code: cursor}}

- `pointermove` 에서는 **좌표(mx,my)만 저장**. 실제 위치(x,y)는 rAF 루프에서 `x += (mx-x)*0.2` (lerp)로 부드럽게 따라오게.
- 이동은 `translate` (리플로우 없음). 기본 커서는 `cursor: none`.
- 호버 대상 위에서 확대 등은 클래스 토글로. **`@media (pointer: coarse)`** 로 터치기기에선 숨김.

{{code: perf-a11y}}

- 공통 패턴: 잦은 이벤트(스크롤·포인터·리사이즈)는 **핸들러에서 값만 저장, DOM 갱신은 rAF** → 프레임당 한 번만.
- `transform`/`opacity` 만 애니메이션. 커스텀 커서를 써도 **키보드 포커스 표시는 유지**.

<!-- section: must_know -->
## 반드시 기억할 것

- 배너 = 슬라이더 모델 + `localStorage` 만료 타임스탬프("하루 안 보기"). 정지 가능 + `prefers-reduced-motion`.
- hover 바 = **위임 1개** + `getBoundingClientRect` + `transform`/`width`. 링크 수 무관.
- 커스텀 커서 = 좌표 저장 → **rAF + lerp** → `translate`. `cursor: none`, 터치기기(`pointer: coarse`) 숨김.
- 잦은 이벤트는 값만 저장하고 **DOM 갱신은 rAF 에서**.
- 커서를 바꿔도 키보드 포커스는 보이게.

<!-- section: mission -->
## 미션 — 인터랙티브 히어로

배너/메뉴 hover/커스텀 커서 자료를 재료로.

- 상단 롤링 배너: 3개 메시지 세로 롤링, 닫기 + "하루 안 보기"(localStorage), hover 정지.
- 메뉴 하이라이트 바: 위임 + rect + transform. `pointerleave` 시 현재 메뉴로 복귀.
- 커스텀 커서: 지연 추적(lerp), 링크 위에서 2배 확대, 버튼 위에서 색 변경. `pointer: coarse` 숨김.
- 스크롤 진행바(상단): `scroll` 핸들러는 비율만 저장, rAF 에서 바 너비 갱신.
- `prefers-reduced-motion` 에서 롤링·커서 지연·진행바 애니메이션 최소화.

<!-- section: check_question -->
## 이해 점검

1. "하루 안 보기" 를 어디에 어떻게 저장하나?
2. 메뉴 하이라이트 바를 링크마다 리스너 없이 만드는 방법은?
3. `pointermove` 안에서 바로 `style.left` 를 갱신하면 왜 버벅이나? 대안은?
4. 커스텀 커서를 만들 때 모바일과 키보드 사용자를 위해 무엇을 챙기나?

<!-- section: interview_question -->
## 면접 대비

- "스크롤/마우스 이벤트 성능 최적화 방법은? (rAF, passive, throttle)"
- "커스텀 커서의 접근성 리스크와 대응은?"

<!-- section: review -->
## 한 줄 정리

**배너는 슬라이더 모델 + localStorage 만료값, hover 바는 위임+rect+transform, 커스텀 커서는 좌표 저장 후 rAF+lerp 로 따라오게 —
잦은 이벤트는 값만 저장하고 DOM 갱신은 rAF, 터치기기·모션 민감·키보드 포커스를 배려한다.**

<!-- section: next -->
## 다음 Lesson

`ui-implementation-patterns/calendar-grid` — 날짜 계산과 달력 렌더.
