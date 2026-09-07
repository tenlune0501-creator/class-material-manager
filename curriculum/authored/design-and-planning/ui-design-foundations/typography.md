---
id: design-and-planning/ui-design-foundations/typography
chapter: design-and-planning/ui-design-foundations
title: 웹 타이포그래피 기초
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [design, typography]
related_material_ids:
  - 1N_QFuagkhnJsK_AAX6aAieeYaFOU3Z-U              # UI_design_typography.pdf
  - 1FZTnhS4iDbxQ4da8guiu8qw7uMFGtPokf4QScA_j5FM   # Web Design - typography summary
prerequisites: []
code_examples:
  - slug: readable-body
    title: 읽기 편한 본문 CSS
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      body {
        font-family: "Pretendard", "Noto Sans KR", system-ui, sans-serif; /* 화면 = 고딕(sans) */
        font-size: 16px;             /* 본문 최소 16px 권장 */
        line-height: 1.6;            /* 대략 font-size × 1.5~1.6 */
        color: #1f2328;              /* 순수 검정(#000) 대신 약간 부드럽게 */
      }
      p { max-width: 65ch; }         /* 한 줄 50~75자 (ch = "0" 글자 너비) */
      h1, h2, h3 { line-height: 1.25; letter-spacing: -0.01em; } /* 제목은 행간 좁게, 자간 약간 조임 */
  - slug: hierarchy
    title: 위계는 크기 하나로만 만들지 않는다
    source_type: generated_minimal
    language: css
    code: |
      /* 우선순위: size → weight → color → spacing */
      .card-title { font-size: 18px; font-weight: 700; color: #1f2328; }
      .card-meta  { font-size: 13px; font-weight: 400; color: #6a737d; }  /* 작게 + 흐리게 */
      .card-body  { font-size: 15px; font-weight: 400; color: #333; }
      /* 색상 배경 위에서는 회색 대신 배경색 계열의 밝은 색을 쓴다 (대비 유지) */
  - slug: scale
    title: 타입 스케일 (몇 단계로 고정)
    source_type: generated_minimal
    language: css
    code: |
      :root {
        --text-xs: 12px;  --text-sm: 14px;  --text-base: 16px;
        --text-lg: 20px;  --text-xl: 25px;  --text-2xl: 31px;   /* 대략 1.25배씩 */
      }
      /* 폰트 크기를 아무 값이나 쓰지 말고 이 스케일 안에서만 고른다 → 일관성 */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **가독성(legibility)** 과 **판독성(readability)** 을 구분하고, 각각을 올리는 방법을 안다.
- 본문 글자 크기·행간·한 줄 글자 수·색의 실무 기준값을 안다.
- **위계(hierarchy)** 를 크기만이 아니라 weight·color·spacing 으로 만든다.
- **타입 스케일**로 크기를 몇 단계로 고정해 일관성을 유지한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSS `font-size` / `line-height` / `color` / `font-weight`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

디자인 시안 없이 화면을 짜면 글자 크기가 제각각이고, 본문이 줄바꿈 없이 화면 끝까지 늘어져
읽기 힘들며, 제목·본문·메타가 잘 구분되지 않는다. 몇 가지 기준값과 원칙만 잡아도 크게 나아진다.

<!-- section: concept -->
## 1. 가독성 vs 판독성

- **가독성(legibility)**: 한 글자를 다른 글자와 구별하기 쉬운가(서체 자체의 성질).
  대문자 `I` 와 소문자 `l` 이 안 구별되는 폰트는 피한다. x-height 큰 폰트, counter(글자 속 공백)
  넓은 폰트, 너무 굵지 않은 weight가 읽기 쉽다.
- **판독성(readability)**: 문단·제목·블록을 훑고 구분하기 쉬운가(레이아웃의 성질).
  대비·색·크기·여백·구분선으로 만든다.

<!-- section: code | lang: css -->
## 2. 본문 기준값

{{code: readable-body}}

- **화면 = 고딕(sans-serif).** 명조(serif)는 긴 인쇄물용.
- 본문 **16px 이상**, 행간 대략 **1.5~1.6배**.
- **한 줄 50~75자**(모바일 30~40자). 너무 넓으면 다음 줄을 못 찾고, 너무 좁으면 리듬이 깨진다.
  → `max-width: 65ch` 또는 `680px` 정도.
- 본문 색은 **순수 검정 대신 약간 부드럽게**(`#1f2328` 등). 색 배경 위에서는 회색 대신 배경색 계열 밝은 색.
- 폰트는 표준 웹폰트(Google Fonts 등)에서 **최소 개수**로.

<!-- section: mechanism -->
## 3. 위계 만들기

{{code: hierarchy}}

"중요하니까 무조건 크게" 가 아니다. 우선순위: **크기 → 굵기(weight) → 색(대비) → 간격(spacing)**.
제목만 살짝 굵고 크게, 메타 정보는 작고 흐리게 → 크기 차이를 과하게 벌리지 않아도 구분된다.

<!-- section: concept | title: 스케일 -->
## 4. 타입 스케일

{{code: scale}}

폰트 크기를 `13px`, `15px`, `17px`… 아무렇게나 쓰지 말고 **미리 정한 몇 단계(스케일)** 안에서만
고른다. 대략 1.2~1.25배씩 키운 6~7단계면 충분하다. (다음 Lesson의 디자인 토큰과 연결된다.)

<!-- section: must_know -->
## 반드시 기억할 것

- 화면 본문은 **sans-serif**, **16px+**, 행간 **1.5~1.6**, 한 줄 **50~75자**.
- 본문 색은 순수 검정 대신 약간 부드럽게. 색 배경 위엔 회색 금지(배경색 계열 밝은 색).
- 위계 = **크기 + 굵기 + 색 + 간격**을 함께. 크기 하나에 의존하지 않는다.
- 제목은 행간 좁게(1.2~1.3), 자간 살짝 조임.
- 폰트 크기는 **타입 스케일** 안에서만 고른다. 폰트 종류는 최소 개수.
- 텍스트 대비는 최소 **4.5:1**(→ 다음 Lesson `대비와 색`).

<!-- section: experiment -->
## 직접 해 보기

1. 아무 글 페이지의 본문에 `font-size:16px; line-height:1.6; max-width:65ch` 를 적용해 전후를 비교하라.
2. `line-height` 를 `1.0` / `1.3` / `1.6` / `2.2` 로 바꿔 읽기 편한 지점을 찾아라.
3. 카드 컴포넌트의 제목/메타/본문을 크기 대신 **weight + color** 로만 구분해 보라.
4. `:root` 에 타입 스케일 변수 6개를 정의하고, 페이지의 모든 `font-size` 를 그 변수로 바꿔라.
5. 순수 `#000` 본문과 `#1f2328` 본문을 나란히 두고 장시간 읽어 보라.

<!-- section: check_question -->
## 이해 점검

1. 가독성과 판독성의 차이는?
2. 웹 본문에 명조체를 잘 안 쓰는 이유는?
3. 한 줄 글자 수가 너무 많거나 적으면 각각 어떤 문제가 생기나?
4. 위계를 만들 때 크기 외에 쓰는 요소 세 가지는?
5. 타입 스케일을 쓰는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "본문 타이포그래피에서 가독성을 결정하는 요소들을 나열해 보세요."
- "디자인 시스템에서 타입 스케일을 어떻게 정의하나요?"
- "정보 위계를 시각적으로 표현하는 방법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> legibility vs readability, 본문 16px+·행간 1.5~1.6·50~75자, 위계=크기+굵기+색+간격,
> 색 배경엔 회색 금지, 타입 스케일을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**웹 본문은 sans-serif·16px+·행간 1.5~1.6·한 줄 50~75자를 기준으로 하고, 위계는 크기 하나가 아니라
굵기·색·간격을 함께 써서 만들며, 글자 크기는 미리 정한 타입 스케일 안에서만 고른다.**
