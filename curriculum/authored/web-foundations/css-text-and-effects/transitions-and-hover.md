---
id: web-foundations/css-text-and-effects/transitions-and-hover
chapter: web-foundations/css-text-and-effects
title: transition과 hover 효과
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [css, transition, hover, interaction]
related_material_ids:
  - 0B0HRSf3dPjJiMExkQXdyQ2hWalk              # transition 자료
  - 1-a2vGyThLHay5XtuDEMQlbACHv2mp9wX        # Make Ordinary Links Interesting
  - 0B0HRSf3dPjJicU9KYjFCbGl5bDQ              # hover 자료
  - 13wub4tP5SjPdTUensi3_Ysh6EIwx2yjp        # engaging buttons
  - 1tCe1s6iwE_IMLTjZwHXYVMW6VC5dAxo4        # transition 실습
  - 1MmEWPW0DuLYxXhJ6F_jCncAQoaxD6-sU        # hover 실습
prerequisites:
  - web-foundations/css-fundamentals/box-model-and-positioning
  - web-foundations/css-fundamentals/selectors-and-cascade
code_examples:
  - slug: basic
    title: transition — 무엇을, 얼마나, 어떤 곡선으로
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      .btn {
        background: #3498db;
        transform: translateY(0);
        /* property  duration  timing-function  delay */
        transition: background .25s ease, transform .25s ease;
      }
      .btn:hover {
        background: #2c80c0;
        transform: translateY(-2px);   /* 시작/끝 값만 쓰면 브라우저가 중간을 채운다 */
      }
      /* transition 은 "상태가 바뀔 때" 보간. hover 해제 시 자동으로 역방향 재생 */
  - slug: what-animates
    title: 애니메이션 되는 속성 / 안 되는 속성
    source_type: generated_minimal
    language: css
    code: |
      /* ✅ 부드럽고 저렴: transform, opacity  (레이아웃 재계산 없음, GPU) */
      .card { transition: transform .3s, opacity .3s; }

      /* ⚠️ 되지만 비쌈: width/height/top/left/margin → 매 프레임 리플로우 */
      /* ❌ 아예 안 됨: display (none↔block) → visibility/opacity 로 우회 */
      .menu { opacity: 0; visibility: hidden; transition: opacity .2s, visibility 0s .2s; }
      .menu.open { opacity: 1; visibility: visible; transition: opacity .2s; }
  - slug: pseudo-reveal
    title: 밑줄/배경 슬라이드 — 가상요소 + transform
    source_type: generated_minimal
    language: css
    code: |
      a { position: relative; text-decoration: none; }
      a::after {
        content: ""; position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: left;         /* 왼쪽에서 자라남 */
        transition: transform .3s ease;
      }
      a:hover::after { transform: scaleX(1); }
      /* width 0→100% 대신 scaleX 를 쓰면 리플로우 없이 부드럽다 */
  - slug: states
    title: hover 만이 아니다 — focus / focus-visible
    source_type: generated_minimal
    language: css
    code: |
      .btn { transition: box-shadow .2s; }
      .btn:hover  { box-shadow: 0 4px 12px rgba(0,0,0,.15); }
      .btn:focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }  /* 키보드 접근성 */

      /* 모션 민감 사용자 배려 */
      @media (prefers-reduced-motion: reduce) {
        * { transition-duration: .01ms !important; animation-duration: .01ms !important; }
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `transition: property duration timing-function delay` 를 읽고, 시작/끝 값만으로 중간을 브라우저가 채운다는 원리를 안다.
- **`transform`/`opacity` 는 저렴하고, `width`/`top` 등은 비싸며, `display` 는 전이 불가**임을 알고 우회한다(`visibility`+`opacity`).
- 가상요소(`::after`) + `transform: scaleX` 로 밑줄·배경 슬라이드 효과를 만든다.
- `:hover` 뿐 아니라 `:focus-visible` 을 함께 처리하고, `prefers-reduced-motion` 을 존중한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 박스 모델·`position`, 선택자·가상요소·가상클래스, `transform` 기본.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `hover` 시 값이 툭 바뀐다(전이 없음) — `transition` 을 hover 쪽이 아니라 **기본 상태**에 둬야 양방향으로 부드럽다.
- `width`/`left` 로 애니메이션해서 버벅인다.
- `display: none ↔ block` 에 `transition` 을 걸었는데 아무 일도 안 일어난다.
- 마우스 없는 키보드 사용자는 버튼 상태 변화를 전혀 못 본다.

<!-- section: concept -->
## transition 기본

{{code: basic}}

- `transition` 은 **속성 값이 바뀔 때** 그 사이를 시간에 걸쳐 보간한다. 트리거는 `:hover`, 클래스 토글, 미디어쿼리 등.
- `transition` 선언은 **기본 상태(.btn)** 에 둔다 → hover 진입·해제 모두 부드럽다. hover 에만 두면 들어갈 때만 전이.
- 여러 속성은 콤마로. `all` 은 편하지만 의도치 않은 것까지 전이되니 명시 권장.
- timing-function: `ease`(기본), `linear`, `ease-in/out`, `cubic-bezier(...)`, `steps(...)`.

<!-- section: mechanism -->
## 무엇을 애니메이션할까

{{code: what-animates}}

- **`transform`(이동·크기·회전)과 `opacity` 는 레이아웃을 다시 계산하지 않아** 60fps 로 부드럽다.
- `width`/`height`/`top`/`left`/`margin` 도 전이는 되지만 매 프레임 리플로우 → 느림. 되도록 `transform` 으로 대체.
- `display` 는 전이 불가. 나타남/사라짐은 `opacity` + `visibility`(딜레이로 뒤늦게 `hidden`) 조합으로.

{{code: pseudo-reveal}}

- 밑줄이 자라나는 효과: `::after` 를 깔고 `transform: scaleX(0) → scaleX(1)`, `transform-origin` 으로 방향 결정.
  `width 0→100%` 보다 훨씬 매끄럽다.

{{code: states}}

- `:hover` 는 마우스 전용. 키보드 사용자를 위해 **`:focus-visible`** 로 초점 스타일을 함께 준다(`outline` 을 지우지만 말 것).
- `@media (prefers-reduced-motion: reduce)` 로 모션에 민감한 사용자에겐 전이를 사실상 끈다.

<!-- section: must_know -->
## 반드시 기억할 것

- `transition: 속성 시간 타이밍 지연` — **기본 상태**에 선언(양방향 부드럽게). 속성은 명시(`all` 지양).
- **싸다: `transform`, `opacity`**(리플로우 없음). 비싸다: `width`/`top`/`margin`. 안 됨: `display`.
- 나타남/사라짐 = `opacity` + `visibility`(지연). 밑줄/슬라이드 = `::after` + `scaleX` + `transform-origin`.
- `:hover` 와 함께 **`:focus-visible`**. `prefers-reduced-motion` 존중.

<!-- section: mission -->
## 미션 — 인터랙티브 링크·버튼 세트

"Make Links Interesting" / "engaging buttons" 자료를 재료로.

- 링크 효과 4종: 배경 페이드, 왼쪽에서 밑줄 자라기(`scaleX`), 가운데에서 밑줄, `::after` 배경 슬라이드.
- 버튼 3종: 위로 살짝 뜨기(`translateY`), `::after` 배경이 왼쪽→오른쪽 채우기, 그로우(`scale`).
- 드롭다운 메뉴: `display` 대신 `opacity`+`visibility` 전이로 열고 닫기.
- 모든 인터랙티브 요소에 `:focus-visible` 스타일. `prefers-reduced-motion` 미디어쿼리로 전이 비활성.
- `width` 로 만든 밑줄 버전과 `scaleX` 버전을 각각 만들어 Performance 로 비교(3줄 소감).

<!-- section: check_question -->
## 이해 점검

1. `transition` 을 `:hover` 안에만 두면 어떤 일이 생기나?
2. `transform` 으로 애니메이션하는 게 `left`/`width` 보다 나은 이유는?
3. `display: none` 요소를 페이드로 등장시키려면?
4. `:hover` 만 스타일링하면 누가 소외되나? 해결책은?

<!-- section: interview_question -->
## 면접 대비

- "CSS 애니메이션 성능을 위해 어떤 속성을 선호하나요? 왜죠?"
- "`transition` 과 `animation` 의 차이는?"
- "접근성 관점에서 모션을 어떻게 다루나요?"

<!-- section: review -->
## 한 줄 정리

**`transition` 은 기본 상태에 선언해 값 변화 사이를 보간하며, `transform`/`opacity` 는 싸고 `width`/`display` 는 피하고,
밑줄 효과는 `::after` + `scaleX`, 상호작용은 `:hover` + `:focus-visible` + `prefers-reduced-motion` 까지 챙긴다.**

<!-- section: next -->
## 다음 Lesson

`css-text-and-effects/animation-and-transform` — `@keyframes` 와 2D/3D transform.
