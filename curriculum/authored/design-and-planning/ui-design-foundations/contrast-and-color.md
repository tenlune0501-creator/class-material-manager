---
id: design-and-planning/ui-design-foundations/contrast-and-color
chapter: design-and-planning/ui-design-foundations
title: 대비와 색
mastery: understand
lesson_kind: lesson
estimated_minutes: 20
tags: [design, contrast, color, accessibility]
related_material_ids:
  - 1ONAaSVhhv1jV65LvMjyfo4ekt1YRj3p6              # Web_design_Contrast.pdf
sources:
  - title: "WCAG 2.2 — Contrast (Minimum) 1.4.3"
    url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
    publisher: "W3C (WAI)"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - design-and-planning/ui-design-foundations/typography
code_examples:
  - slug: four-factors
    title: 대비의 4가지 축
    source_type: generated_minimal
    language: text
    code: |
      1) 색(Color)   : 색상 자체보다 "명도 값(value)" 차이로 대비를 만든다
      2) 크기(Size)  : 스케일을 크게 벌린다 (제목은 본문의 ~2배)
      3) 공간(Space) : 중요한 요소를 빈 공간으로 둘러싼다 / 간격 크기 = 관계
      4) 모양·스타일 : 형태·굵기·둥글기·채움 vs 외곽선의 차이
  - slug: wcag
    title: 텍스트 대비 최소 기준 (WCAG)
    source_type: generated_minimal
    language: text
    code: |
      본문(작은 글자)      : 4.5:1 이상  (AA)
      큰 글자(18.66px+ bold, 또는 24px+) : 3:1 이상
      UI 컴포넌트·아이콘 경계 : 3:1 이상
      # 회색 placeholder, 흐린 캡션이 이 기준을 못 넘는 경우가 매우 흔하다.
      # 측정: 브라우저 개발자도구 색상 피커, Figma 플러그인, WebAIM Contrast Checker.
  - slug: bg-color
    title: 배경색은 "어둡고 채도 낮게"
    source_type: generated_minimal
    language: text
    code: |
      HSB 로 생각: 같은 hue(색상) 를 유지하고 S(채도)·B(밝기) 만 조절해 팔레트를 만든다.
        - 배경: 채도 낮고(또는 밝기 높은 아주 옅은 톤) → 텍스트와 경쟁하지 않음
        - 강조(버튼/링크): 밝고 채도 높은 색 → 시선을 끈다. 남발 금지(선택과 집중)
      한 화면에서 메인 컬러는 2개를 넘기지 않는다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 대비를 **색·크기·공간·모양** 4가지 축으로 만든다는 것을 안다.
- 색 대비는 "색상 차이"가 아니라 **명도(value) 차이**로 만든다는 것을 안다.
- **텍스트 대비 최소 기준(WCAG: 본문 4.5:1)** 을 알고 측정할 수 있다.
- 배경색은 "어둡고 채도 낮게", 강조색은 아껴서 쓰는 원칙을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 색을 HSB(색상/채도/밝기)로 생각하는 법, 타이포 위계.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"예뻐 보여서" 흐린 회색 글씨, 옅은 색 버튼을 쓰면 — 밝은 화면·저시력·야외에서 안 보인다.
접근성 검사에서 대비 미달로 무더기 지적을 받는다.

<!-- section: concept -->
## 1. 대비의 4가지 축

{{code: four-factors}}

- **색**: 파랑 vs 빨강처럼 "색상"이 달라도 **명도가 비슷하면 대비가 약하다.** 흑백으로 바꿔 봐서
  구분되면 진짜 대비가 있는 것.
- **크기**: 어중간하게 키우지 말고 확실히(제목 ≈ 본문의 2배).
- **공간**: 중요한 요소 둘레에 여백을 크게 → 저절로 눈에 띈다. 간격의 크기가 요소 간 관계를 말한다.
- **모양/스타일**: 채운 버튼 vs 외곽선 버튼, 굵은 vs 얇은.

<!-- section: mechanism -->
## 2. 텍스트 대비 기준

{{code: wcag}}

- **본문 4.5:1, 큰 글자 3:1** (WCAG AA). placeholder·캡션·비활성 텍스트가 이걸 못 넘는 경우가 흔하다.
- 측정: 브라우저 DevTools 색상 피커(대비 비율 표시), Figma 대비 플러그인, WebAIM Contrast Checker.
- "대비를 확보하되 눈부시지 않게" — 본문을 `#000` on `#fff`(21:1)로 하면 너무 강해 눈이 피로하다.
  `#1f2328` on `#fff`(≈15:1) 정도.

<!-- section: concept | title: 배경·강조색 -->
## 3. 배경색과 강조색

{{code: bg-color}}

- 배경은 **텍스트와 경쟁하지 않게** — 채도·밝기를 낮춘 톤.
- 강조색(주요 버튼, 링크, 배지)은 밝고 채도 높게 — 대신 **한 화면에 소수**만. 다 강조하면 아무것도 강조가 안 된다.
- 팔레트는 hue 하나를 고정하고 S/B만 조절해 여러 톤을 뽑으면 통일감이 생긴다.

<!-- section: must_know -->
## 반드시 기억할 것

- 대비 축 4개: **색·크기·공간·모양**.
- 색 대비 = **명도 차이**. 흑백 변환 테스트로 확인.
- 텍스트 대비 최소 **4.5:1**(본문), **3:1**(큰 글자·UI 요소). 도구로 측정한다.
- 본문을 `#000` on `#fff` 로 하지 않는다(너무 강함). 약간 완화.
- 배경 = 저채도·저(또는 고)명도로 텍스트와 비경쟁. 강조색은 **소수만**.
- 한 화면 메인 컬러 2개 이하.

<!-- section: experiment -->
## 직접 해 보기

1. 현재 페이지의 본문·캡션·placeholder 색을 DevTools 색상 피커로 열어 대비 비율을 확인하라. 4.5:1 미만을 찾아 고쳐라.
2. UI 스크린샷을 흑백(grayscale)으로 만들어, 색만으로 구분하던 요소가 사라지는지 보라.
3. 같은 hue로 S/B만 바꿔 배경/카드/보더/강조 4단계 팔레트를 만들어라.
4. 버튼을 전부 색으로 채우던 화면에서 주요 버튼 1개만 채우고 나머지는 외곽선으로 바꿔라.

<!-- section: check_question -->
## 이해 점검

1. "파란 글씨 on 초록 배경" 이 대비가 약할 수 있는 이유는?
2. 본문 텍스트의 최소 대비 비율은? 큰 글자는?
3. `#000` on `#fff` 본문의 문제는?
4. 배경색을 고를 때의 원칙은?
5. 강조색을 화면에 몇 개까지 쓰는 게 좋은가?

<!-- section: interview_question -->
## 면접 대비

- "색 대비를 접근성 관점에서 어떻게 검증하나요? (WCAG 기준)"
- "시각적 위계에서 색과 명도를 어떻게 활용하나요?"
- "색맹 사용자를 고려한 UI 설계 원칙은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 대비 4축(색·크기·공간·모양), 색 대비=명도 차이(흑백 테스트), 텍스트 4.5:1/3:1,
> 배경은 비경쟁·강조는 소수, 메인 컬러 2개 이하를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**대비는 색·크기·공간·모양으로 만들고, 색 대비는 색상이 아니라 명도 차이다 — 텍스트는 최소 4.5:1
(큰 글자 3:1)을 도구로 확인하고, 배경은 텍스트와 경쟁하지 않게, 강조색은 소수만 쓴다.**
