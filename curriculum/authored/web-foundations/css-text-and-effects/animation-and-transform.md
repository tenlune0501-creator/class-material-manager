---
id: web-foundations/css-text-and-effects/animation-and-transform
chapter: web-foundations/css-text-and-effects
title: 애니메이션과 transform
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [css, animation, transform, keyframes, svg]
related_material_ids:
  - 0B0HRSf3dPjJib2tEMXpWMlhEQjQ              # animation 자료
  - 1xDaIrUfiC5orGgZ_9rZoUKWbTo8JFQ9e        # css3 loading animations
  - 1aXahIAS5AJHAjqgQgVgaE0w1LB7XDBUD        # animation 실습
  - 19aSAgS50ov6T5MjHQOjt46ubAfKD9PSK        # rotate card (3D flip)
  - 1TeKq4Lb57mMDpkMd9dxhupUn7xezrHBe        # transform 실습
sources:
  - reference_slug: css/animation
  - reference_slug: css/animation-name-CSS-property
  - reference_slug: css/animation-timing-function-CSS-property
prerequisites:
  - web-foundations/css-text-and-effects/transitions-and-hover
code_examples:
  - slug: transform
    title: transform — 이동·크기·회전·기울임
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      .box {
        transform: translate(10px, -4px) scale(1.1) rotate(8deg) skewX(-6deg);
        transform-origin: center;   /* 기준점 (top left, 50% 50% ...) */
      }
      /* 여러 함수는 오른쪽→왼쪽 순으로 적용된다. translate 를 먼저 쓰는 습관 */
      /* transform 은 문서 흐름을 안 바꾼다 → 옆 요소가 안 밀림 (레이아웃 안전) */
  - slug: keyframes
    title: "@keyframes + animation"
    source_type: generated_minimal
    language: css
    code: |
      @keyframes bounce {
        0%   { transform: translateY(0); animation-timing-function: ease-in; }
        50%  { transform: translateY(-40px); animation-timing-function: ease-out; }
        100% { transform: translateY(0); }
      }
      .ball {
        /* name  duration  timing  delay  iteration-count  direction  fill-mode */
        animation: bounce 1s ease-in-out 0s infinite alternate;
      }
      /* transition = A→B 한 번(트리거 필요). animation = 여러 구간을 스스로 반복 */
  - slug: loader
    title: 로딩 스피너 — 무한 회전
    source_type: generated_minimal
    language: css
    code: |
      @keyframes spin { to { transform: rotate(360deg); } }
      .spinner {
        width: 2.5rem; height: 2.5rem;
        border: 4px solid #e0e0e0;
        border-top-color: #3498db;
        border-radius: 50%;
        animation: spin .8s linear infinite;
      }
      /* 점 3개 순차 깜빡임: 같은 keyframes 에 animation-delay 만 다르게 */
      .dot:nth-child(2) { animation-delay: .2s; }
      .dot:nth-child(3) { animation-delay: .4s; }
  - slug: flip-3d
    title: 3D 카드 뒤집기
    source_type: generated_minimal
    language: css
    code: |
      .scene { perspective: 800px; }                 /* 부모: 원근 */
      .card  { transform-style: preserve-3d; transition: transform .6s; }
      .scene:hover .card { transform: rotateY(180deg); }
      .face  { position: absolute; inset: 0; backface-visibility: hidden; }  /* 뒷면 숨김 */
      .face.back { transform: rotateY(180deg); }
  - slug: perf
    title: 성능·접근성
    source_type: generated_minimal
    language: css
    code: |
      /* transform / opacity 만 애니메이션 (compositor). box-shadow·filter 는 무겁다 */
      .move { will-change: transform; }   /* 힌트 — 남발 금지, 애니메이션 요소에만 */
      @media (prefers-reduced-motion: reduce) {
        .spinner { animation: none; }     /* 대체: 정적 표시나 아주 짧게 */
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `transform` 의 `translate`/`scale`/`rotate`/`skew` 와 `transform-origin`, 함수 적용 순서를 안다.
- `@keyframes` + `animation`(name/duration/timing/delay/iteration/direction/fill-mode)으로 스스로 반복되는 애니메이션을 만든다.
- `transition`(A→B 1회) vs `animation`(다구간 반복)을 구분한다.
- 로딩 스피너·점 애니메이션, `perspective`/`rotateY`/`backface-visibility` 로 3D 카드 뒤집기를 만든다.
- `transform`/`opacity` 중심 성능 원칙과 `prefers-reduced-motion` 을 지킨다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `transitions-and-hover`(전이, timing-function), `position`, 가상클래스.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `rotate` 후 `translate` 순서를 헷갈려 회전축이 엉뚱한 데로 간다.
- 반복 로딩 표시를 JS `setInterval` 로 힘들게 만든다(CSS `animation` 한 줄이면 됨).
- 스피너를 `box-shadow`/`width` 로 돌려 버벅인다.
- 모션 민감 사용자에게 계속 도는 스피너가 불편하다.

<!-- section: concept -->
## transform

{{code: transform}}

- `translate`(이동), `scale`(확대/축소), `rotate`(회전), `skew`(기울임). `transform-origin` 이 기준점.
- **여러 함수는 오른쪽→왼쪽 적용**. `rotate` 뒤 `translate` 는 회전된 좌표계에서 이동한다 → 보통 `translate` 를 먼저.
- `transform` 은 **문서 흐름을 바꾸지 않는다** → 옆 요소가 안 밀리고, 리플로우가 없어 애니메이션에 유리.

<!-- section: mechanism -->
## @keyframes 애니메이션

{{code: keyframes}}

- `@keyframes 이름 { 0% {...} 50% {...} 100% {...} }` 로 구간별 상태를 정의하고, 요소에 `animation: 이름 지속 타이밍 지연 반복횟수 방향 fill-mode`.
- `iteration-count`: 숫자 또는 `infinite`. `direction: alternate` 는 왕복. `fill-mode: forwards` 는 끝 상태 유지.
- **`transition` 과 차이**: transition 은 값이 바뀌는 순간(트리거)에 A→B 한 번, animation 은 트리거 없이도 스스로 여러 구간을 반복.

{{code: loader}}

- 스피너 = `@keyframes spin { to { rotate(360deg) } }` + `animation: spin .8s linear infinite`.
- 점 3개 순차 = 같은 keyframes 에 `animation-delay` 만 다르게.

{{code: flip-3d}}

- 3D: 부모에 `perspective`, 카드에 `transform-style: preserve-3d`, 앞/뒤 면에 `backface-visibility: hidden`, 뒷면은 미리 `rotateY(180deg)`.

<!-- section: mechanism | title: 성능과 접근성 -->
## 성능·접근성

{{code: perf}}

- 애니메이션은 **`transform`/`opacity`** 로 (합성 단계, GPU). `box-shadow`·`filter`·`width` 는 무겁다.
- `will-change: transform` 은 힌트일 뿐 — 실제 애니메이션 요소에만, 남발하면 오히려 메모리 낭비.
- `@media (prefers-reduced-motion: reduce)` 에서 무한 애니메이션은 끄거나 최소화.

<!-- section: must_know -->
## 반드시 기억할 것

- `transform`: `translate`/`scale`/`rotate`/`skew` + `transform-origin`. 함수는 오른쪽→왼쪽, 흐름 안 바꿈.
- `@keyframes` + `animation: 이름 시간 타이밍 지연 반복 방향 fill-mode`. `infinite`, `alternate`, `forwards`.
- `transition` = 트리거 시 A→B 1회 / `animation` = 스스로 다구간 반복.
- 스피너·순차 점 = 같은 keyframes + `animation-delay`. 3D = `perspective` + `preserve-3d` + `backface-visibility`.
- 애니메이션은 `transform`/`opacity` 로. `prefers-reduced-motion` 존중.

<!-- section: mission -->
## 미션 — 로딩 UI + 3D 플립 카드

css3 loading / rotate card 자료를 재료로.

- 스피너(회전), 점 3개 순차 깜빡임, 바운싱 볼(중력감 나게 timing-function 구간별로) — 전부 `transform`.
- 3D 플립 카드: hover(또는 클릭 토글)로 `rotateY(180deg)`, 앞/뒤 콘텐츠. `perspective` 값을 바꿔 원근 차이 관찰.
- 진입 애니메이션: 리스트 아이템이 아래에서 페이드+슬라이드로 등장, `animation-delay` 로 계단식.
- `prefers-reduced-motion` 에서 스피너를 정적 텍스트로 대체.
- 스피너를 `border`/`transform` 버전과 `box-shadow` 버전으로 만들어 Performance 비교.

<!-- section: check_question -->
## 이해 점검

1. `transform: rotate(45deg) translateX(100px)` 와 `translateX(100px) rotate(45deg)` 의 결과가 다른 이유는?
2. `transition` 대신 `animation` 을 써야 하는 상황은?
3. 3D 뒤집기에서 뒷면이 비쳐 보이지 않게 하는 속성은?
4. 무한 스피너를 성능·접근성 측면에서 어떻게 만드나?

<!-- section: interview_question -->
## 면접 대비

- "리플로우/리페인트/컴포지트 단계와, 어떤 CSS 속성이 어디에 영향을 주나요?"
- "`will-change` 는 언제 쓰고 왜 남발하면 안 되나요?"

<!-- section: review -->
## 한 줄 정리

**`transform`(translate/scale/rotate/skew, 오른쪽→왼쪽, 흐름 불변)과 `@keyframes`+`animation`(스스로 반복)으로
스피너·플립 카드를 만들되, 애니메이션은 `transform`/`opacity` 로 하고 `prefers-reduced-motion` 을 존중한다.**

<!-- section: next -->
## 다음 Chapter

`web-foundations/css-preprocessors-and-frameworks` — Sass·Tailwind.
