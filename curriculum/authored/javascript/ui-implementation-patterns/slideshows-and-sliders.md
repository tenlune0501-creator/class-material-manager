---
id: javascript/ui-implementation-patterns/slideshows-and-sliders
chapter: javascript/ui-implementation-patterns
title: 슬라이드쇼와 슬라이더
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [javascript, slider, carousel, ui]
related_material_ids:
  - 1LIkvyoZb7Lgi2D9sxPjmP5b-R07sePmk
  - 1Ifq3B-gVdvjZ1ApmuSNKbN1b6l6-vx0G
  - 1et1YaQ-Zz316r-hxfmC5H6ebbj8JXXCI
  - 1lMZEWt1eILew6G0bNNqGcY3q4BrBmxg9
  - 1ydIkwY1tXxmZ1B0drCnlFvukU4Bb9sjx
  - 1Ac6CXlY30HnvPw4Od8TqRvdoigtZIMav
prerequisites:
  - javascript/classes-and-modules/slideshow-module-practice
  - javascript/browser-apis-and-storage/timers
  - web-foundations/css-text-and-effects/animation-and-transform
code_examples:
  - slug: state
    title: 슬라이더의 상태는 "현재 인덱스" 하나
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      function slider(rootSel, { interval = 4000, loop = true } = {}) {
        const root = document.querySelector(rootSel);
        const track = root.querySelector(".track");
        const slides = [...track.children];
        let idx = 0;                     // ← 유일한 상태. 나머지는 여기서 파생
        let timer = null;

        function render() {
          track.style.transform = `translateX(${-idx * 100}%)`;   // 트랙을 통째로 이동
          root.querySelectorAll(".dot").forEach((d, i) =>
            d.setAttribute("aria-current", i === idx ? "true" : "false"));
        }
        function go(next) {
          idx = loop
            ? (next + slides.length) % slides.length
            : Math.max(0, Math.min(slides.length - 1, next));
          render();
        }
        return { next: () => go(idx + 1), prev: () => go(idx - 1), goTo: go,
                 start, stop, get index() { return idx; } };

        function start() { stop(); timer = setInterval(() => go(idx + 1), interval); }
        function stop()  { clearInterval(timer); timer = null; }
      }
  - slug: transition-technique
    title: 이동 방식 — translateX 트랙 (권장)
    source_type: generated_minimal
    language: css
    code: |
      .viewport { overflow: hidden; }
      .track { display: flex; transition: transform .4s ease; }
      .track > * { flex: 0 0 100%; }     /* 슬라이드마다 뷰포트 폭 */
      /* opacity 크로스페이드 방식: 슬라이드를 겹쳐 놓고 .active 만 opacity:1 */
  - slug: controls
    title: 조작 — 버튼 · 도트 · 자동재생 · 키보드
    source_type: generated_minimal
    language: js
    code: |
      const s = slider(".hero", { interval: 4000 });
      root.querySelector(".next").addEventListener("click", s.next);
      root.querySelector(".prev").addEventListener("click", s.prev);
      root.querySelector(".dots").addEventListener("click", (e) => {
        const dot = e.target.closest(".dot"); if (dot) s.goTo(+dot.dataset.i);
      });
      root.addEventListener("mouseenter", s.stop);
      root.addEventListener("mouseleave", s.start);
      root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") s.next();
        if (e.key === "ArrowLeft") s.prev();
      });
      s.start();
  - slug: a11y-touch
    title: 접근성 · 터치 · 라이브러리
    source_type: generated_minimal
    language: js
    code: |
      // 접근성: role="group" aria-roledescription="carousel", 슬라이드에 aria-label "3 / 6",
      //   자동재생은 정지 버튼 제공, prefers-reduced-motion 이면 자동재생 OFF
      // 터치: pointerdown 좌표 저장 → pointermove 델타로 track 이동 → pointerup 에서
      //   임계값 넘으면 next/prev, 아니면 원위치 (transition 잠깐 껐다 켬)
      // 실무: Swiper / Embla / keen-slider 를 쓰는 경우가 많다.
      //   직접 만들 땐 위 상태 모델이면 충분. 라이브러리는 접근성·터치·무한루프가 이미 됨.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 슬라이더의 상태가 **"현재 인덱스" 하나**뿐이고 화면은 거기서 파생됨을 이해한다.
- `translateX` 로 트랙 전체를 이동하는 방식(권장)과 `opacity` 크로스페이드 방식을 구분한다.
- 이전/다음 버튼, 도트 네비(이벤트 위임), 자동재생(hover 정지), 키보드 조작을 붙인다.
- 접근성(carousel 롤, 자동재생 정지, `prefers-reduced-motion`)과 터치 스와이프의 원리를 안다.
- 언제 직접 만들고 언제 Swiper 같은 라이브러리를 쓰는지 판단한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 모듈로 만든 슬라이드쇼 실습, 타이머(정리·중복 방지), CSS transition/transform.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 슬라이드마다 `display` 를 켜고 끄다 상태가 꼬인다(여러 개가 동시에 보임).
- 자동재생 타이머가 버튼 클릭과 겹쳐 슬라이드가 튄다.
- `width` 애니메이션으로 버벅이고, 무한 루프에서 점프가 보인다.
- 도트 10개에 각각 리스너를 단다.

<!-- section: concept -->
## 상태 = 인덱스 하나

{{code: state}}

- `idx` 만 바꾸고 `render()` 를 부른다. 도트 활성, 트랙 위치, 버튼 disabled 는 전부 `idx` 에서 계산.
- `loop` 면 `(next + n) % n`, 아니면 `clamp(0, n-1)`.
- 이 모델은 `slideshow-module-practice` 에서 만든 클로저 패턴 그대로다.

<!-- section: mechanism -->
## 이동 방식

{{code: transition-technique}}

- **translateX 트랙**: 슬라이드를 가로로 나열(`flex: 0 0 100%`)하고 `.track` 을 `translateX(-idx*100%)`. 리플로우 없이 부드럽다.
- **크로스페이드**: 슬라이드를 겹쳐 놓고 `.active` 만 `opacity: 1`. 폭 계산이 필요 없어 반응형에 편하다.

{{code: controls}}

- 버튼은 반환된 `next`/`prev`, 도트는 컨테이너에 **이벤트 위임** + `data-i`.
- 자동재생은 `mouseenter` 에서 `stop`, `mouseleave` 에서 `start`. `start` 안에서 `stop()` 먼저 호출해 중복 방지.
- 키보드: 컨테이너에 `tabindex="0"` + `ArrowLeft/Right`.

{{code: a11y-touch}}

- 접근성: `role="group"` + `aria-roledescription="carousel"`, 슬라이드에 "3 / 6" 라벨, **자동재생 정지 버튼**, `prefers-reduced-motion` 이면 자동재생 끄기.
- 터치: `pointerdown` 좌표 저장 → `pointermove` 델타로 트랙 드래그 → `pointerup` 에서 임계값 넘으면 next/prev.
- 무한 루프 점프 방지: 양 끝에 클론 슬라이드를 두거나, 끝에 도달하면 transition 을 잠깐 끄고 순간이동.
- 실무는 **Swiper / Embla / keen-slider** 를 자주 쓴다(접근성·터치·루프가 이미 해결). 학습·간단한 건 직접.

<!-- section: must_know -->
## 반드시 기억할 것

- 상태 = **`idx` 하나**. 화면은 `render()` 에서 전부 파생.
- 이동: `translateX` 트랙(리플로우 없음) 또는 `opacity` 크로스페이드.
- 도트는 **이벤트 위임** + `data-i`. 자동재생은 hover 정지 + `start` 안에서 `stop()` 먼저.
- 접근성: carousel 롤 + 슬라이드 라벨 + **정지 버튼** + `prefers-reduced-motion`.
- 터치는 pointer 이벤트 델타. 실무는 Swiper 등 라이브러리 고려.

<!-- section: mission -->
## 미션 — 재사용 슬라이더 모듈

제공된 슬라이드 자료를 재료로.

- `slider(rootSel, options)` : `idx` 상태, `translateX` 트랙, `{ next, prev, goTo, start, stop, index }` 반환.
- 이전/다음 버튼 + 도트(위임) + 자동재생(hover 정지) + 키보드 화살표.
- 무한 루프 옵션(`loop`), 끝에서 점프 없이.
- 접근성: carousel 롤, 슬라이드 "n / total" 라벨, 자동재생 정지 토글, `prefers-reduced-motion` 대응.
- (선택) pointer 이벤트로 드래그 스와이프.
- 같은 페이지에 슬라이더 2개(옵션 다르게) — 서로 독립인지 확인.

<!-- section: check_question -->
## 이해 점검

1. 슬라이더의 "상태" 는 무엇인가? 나머지 UI 는 어디서 오나?
2. `translateX` 트랙 방식이 각 슬라이드 `display` 토글보다 나은 점은?
3. 자동재생 타이머가 버튼 클릭과 충돌하지 않게 하려면?
4. 자동재생 캐러셀의 접근성 필수 요소 두 가지는?

<!-- section: interview_question -->
## 면접 대비

- "캐러셀을 직접 구현한다면 상태를 어떻게 설계하나요?"
- "무한 루프 캐러셀에서 끝-처음 전환의 점프를 어떻게 없애나요?"
- "캐러셀 라이브러리를 쓸지 직접 만들지 어떻게 결정하나요?"

<!-- section: review -->
## 한 줄 정리

**슬라이더의 상태는 `idx` 하나이고 화면은 `render()` 로 파생하며, `translateX` 트랙으로 부드럽게 이동하고
도트는 위임·자동재생은 hover 정지·접근성은 carousel 롤+정지 버튼+`prefers-reduced-motion` 까지 챙긴다.**

<!-- section: next -->
## 다음 Lesson

`ui-implementation-patterns/filtering-and-pagination` — 목록 필터·정렬·페이지 나누기.
