---
id: web-foundations/responsive-and-modern-css/container-queries
chapter: web-foundations/responsive-and-modern-css
title: Container Queries
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [css, container-queries, responsive]
related_material_ids:
  - 1QuBkowN_ZHeYlkuQQLfIaAgaoPhV80JPFeDxi-7A-BM
  - 1i-AXimrzXIHXaTgadpZi9dqEvhibf2Z9
  - 1ukmpO5ps0AF9cYIK6itohEojmEJyv1PO
  - 13s2oWZ82IugnBapXYxtSSBW0NZf5f0Pd
sources:
  - reference_slug: css/container
prerequisites:
  - web-foundations/responsive-and-modern-css/responsive-layout
code_examples:
  - slug: problem
    title: 왜 필요한가 — 같은 컴포넌트, 다른 폭
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      # 카드 컴포넌트를 세 곳에 쓴다:
      #   - 사이드바(240px)  → 세로 쌓기
      #   - 본문(720px)      → 가로 배치
      #   - 대시보드 그리드(360px) → 중간
      # 미디어 쿼리는 "화면(viewport)" 폭만 안다. 카드가 놓인 "부모" 폭은 모른다.
      # → 컨테이너 쿼리: 요소가 자기 부모의 폭에 반응한다
  - slug: setup
    title: 컨테이너 지정 + 쿼리
    source_type: generated_minimal
    language: css
    code: |
      .card-host {
        container-type: inline-size;   /* 이 요소를 "가로폭 컨테이너"로 등록 */
        container-name: card;          /* (선택) 이름 */
      }

      .card { display: grid; gap: .5rem; }              /* 기본: 좁을 때 (세로) */

      @container card (min-width: 26rem) {              /* 부모(.card-host)가 26rem 이상이면 */
        .card { grid-template-columns: 8rem 1fr; }      /* 썸네일 | 내용 가로 배치 */
      }
      @container card (min-width: 40rem) {
        .card { grid-template-columns: 12rem 1fr; font-size: 1.05rem; }
      }
  - slug: units
    title: 컨테이너 기준 단위 (cq*)
    source_type: generated_minimal
    language: css
    code: |
      /* cqw = 컨테이너 폭의 1%, cqi = inline-size 의 1% */
      .card h3 { font-size: clamp(1rem, 4cqi, 1.5rem); }
      /* vw 가 아니라 "부모 폭" 에 비례 → 어디에 놓여도 카드 내부 비율 일관 */
  - slug: gotcha
    title: 주의점
    source_type: generated_minimal
    language: css
    code: |
      /* 1) 컨테이너로 등록한 요소 "자신" 에는 @container 가 안 먹는다 → 자식에 적용 */
      /* 2) container-type: inline-size 는 그 요소에 size containment 를 검 → 자식만으로 높이가 정해짐 (보통 OK) */
      /* 3) 래퍼가 하나 더 필요할 수 있다: <div class="card-host"><article class="card">…</article></div> */
      /* 4) 미디어 쿼리를 대체하는 게 아니라 보완: 페이지 골격 = @media, 재사용 컴포넌트 = @container */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 미디어 쿼리(뷰포트 기준)의 한계와 **컨테이너 쿼리(부모 폭 기준)** 가 필요한 상황을 설명한다.
- `container-type: inline-size`(+ `container-name`)로 컨테이너를 등록하고 `@container (min-width: …)` 로 자식을 반응시킨다.
- `cqw`/`cqi` 컨테이너 단위를 안다.
- 컨테이너 자신에는 안 먹는다는 점, 래퍼가 필요할 수 있다는 점, 미디어 쿼리와 **보완 관계**임을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `responsive-layout`(미디어 쿼리, Grid), 재사용 컴포넌트 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 같은 카드 컴포넌트를 사이드바·본문·그리드에 넣는데, 미디어 쿼리는 화면 폭만 알아서 "사이드바에 있을 때만 세로로" 를 못 한다.
- 재사용 컴포넌트마다 부모 위치별 클래스(`card--sidebar`, `card--wide`)를 손으로 붙인다.

<!-- section: concept -->
## 뷰포트가 아니라 부모

{{code: problem}}

- 미디어 쿼리 조건은 **뷰포트(브라우저 창)** 폭. 컴포넌트가 *어디에 놓였는지* 는 모른다.
- 컨테이너 쿼리는 요소가 **자신을 감싼 컨테이너의 폭**에 반응한다 → 진짜 "컴포넌트 단위 반응형".

<!-- section: mechanism -->
## 등록하고 질의하기

{{code: setup}}

- 부모(또는 래퍼)에 **`container-type: inline-size`** → 그 요소가 "가로폭을 재는 컨테이너" 가 된다. `container-name` 으로 이름 부여(여러 컨테이너 구분).
- **`@container [이름] (min-width: …)`** 안의 규칙은 그 컨테이너의 **자손**에 적용된다.
- 같은 컴포넌트를 240px 슬롯에 넣으면 세로, 720px 슬롯에 넣으면 가로 — CSS 만으로.

{{code: units}}

- `cqw`(컨테이너 폭 1%), `cqi`(inline-size 1%). `clamp(1rem, 4cqi, 1.5rem)` 처럼 부모 폭 비례 타이포.

{{code: gotcha}}

- 컨테이너로 등록한 **요소 자신에는 `@container` 가 안 먹는다** → 보통 `<div class="host">` 래퍼 + 안쪽 실제 컴포넌트 구조.
- `inline-size` 컨테이너는 size containment 가 걸려 자식만으로 높이가 결정된다(대부분 문제없음).
- **미디어 쿼리를 대체하지 않는다**: 페이지 전체 골격은 `@media`, 여러 곳에 재사용되는 위젯·카드는 `@container`.

<!-- section: must_know -->
## 반드시 기억할 것

- 미디어 쿼리 = 뷰포트 폭 / 컨테이너 쿼리 = **부모(컨테이너) 폭**.
- `container-type: inline-size` (+ `container-name`) 로 등록 → `@container 이름 (min-width: …)` 로 **자식** 스타일.
- 컨테이너 단위 `cqw`/`cqi` (부모 폭 %).
- 등록한 요소 자신엔 안 먹음 → 래퍼 필요. size containment 유의.
- `@media`(페이지 골격) 와 `@container`(재사용 컴포넌트)는 함께 쓴다.

<!-- section: experiment -->
## 직접 해 보기

1. 카드 컴포넌트 하나를 만들고, 폭이 다른 슬롯 3개(240 / 380 / 720px)에 같은 마크업으로 배치.
2. `.host` 에 `container-type: inline-size`, `@container (min-width: 26rem)` 에서 가로 배치로 전환 → 슬롯마다 다르게 보이는지 확인.
3. 제목 폰트를 `4cqi` 로 주고 슬롯 폭에 따라 비례하는지 확인.
4. 같은 조건을 `@media` 로 만들어 보고, 브라우저 창은 그대로인데 슬롯만 좁힐 때 왜 안 바뀌는지 관찰.

<!-- section: check_question -->
## 이해 점검

1. 미디어 쿼리로 해결이 안 되고 컨테이너 쿼리가 필요한 구체적 예 하나는?
2. `@container` 규칙은 컨테이너로 등록한 요소 자신에 적용되나?
3. `cqi` 는 무엇의 1% 인가?
4. `@media` 와 `@container` 의 역할 분담은?

<!-- section: review -->
## 한 줄 정리

**컨테이너 쿼리는 요소를 뷰포트가 아니라 부모 폭에 반응시킨다 — 래퍼에 `container-type: inline-size` 를 걸고
`@container (min-width: …)` 로 자식을 바꾸며(`cqi` 단위 포함), 페이지 골격의 `@media` 와 함께 쓴다.**

<!-- section: next -->
## 다음 Lesson

`responsive-and-modern-css/logical-properties` — 방향에 독립적인 CSS.
