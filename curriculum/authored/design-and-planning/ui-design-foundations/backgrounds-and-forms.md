---
id: design-and-planning/ui-design-foundations/backgrounds-and-forms
chapter: design-and-planning/ui-design-foundations
title: 배경과 폼 디자인
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [design, forms, background]
related_material_ids:
  - 1HA6tVHH1bWQ9k9m-fRXcrt8fB-a_V-Q9              # UI_design_background.pdf
  - 1zc-XxXqk4xOA6GeaDBCrWgeiEwnWpPhR              # UI_design_form.pdf
  - 1okH3qLEtDAeTO2P4sEbCPBkiOLiOOam-              # check_vs_toggle.pdf
sources:
  - title: "Material Design — Selection controls (checkbox vs switch)"
    url: https://m3.material.io/components/checkbox
    publisher: "Google"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - design-and-planning/ui-design-foundations/contrast-and-color
code_examples:
  - slug: form-layout
    title: 폼 레이아웃 — 세로 길이·동선을 줄인다
    source_type: generated_minimal
    language: text
    code: |
      - 라벨은 입력칸 "위·왼쪽" 에 (좌측 정렬). 라벨이 옆이면 시선 이동이 늘어남.
      - 연관 필드는 그룹핑 (이름/연락처, 주소 묶음). 그룹 간 여백으로 구분.
      - 세로로 길게 늘어놓지 말고, 한 화면에 "적게 입력한다" 는 인상.
      - 필수/선택을 명확히. 대부분 필수면 "선택" 만 표시하는 게 덜 부담스럽다.
      - placeholder 는 "예시" 이지 라벨 대체가 아니다. 라벨은 항상 보이게.
  - slug: input-states
    title: 입력 상태 표시
    source_type: generated_minimal
    language: css
    code: |
      input        { border: 1px solid #ccc; background: #fff; }
      input:focus  { border-color: #2563eb; outline: 2px solid #93c5fd; } /* 지금 어디를 입력 중인지 */
      input:disabled { background: #f3f4f6; color: #9ca3af; }
      .field.error input { border-color: #dc2626; }
      .field.error .msg  { color: #dc2626; font-size: 13px; } /* 어디서·왜·어떻게 고칠지 */
  - slug: cta
    title: CTA(주요 버튼) — 하나만 강조
    source_type: generated_minimal
    language: text
    code: |
      - 폼 하단 주요 동작(제출) 버튼 1개만 채운 색. "취소" 는 외곽선/텍스트 버튼.
      - 버튼 라벨은 역할을 명확히: "제출" 보다 "회원가입 완료" 처럼 구체적으로.
  - slug: check-vs-toggle
    title: 체크박스 vs 토글 스위치
    source_type: generated_minimal
    language: text
    code: |
      토글 스위치 (즉시 적용):
        - 추가 확인 없이 바로 반영 (알림 on/off, 다크모드)
      체크박스 (확인 후 적용 / 다중 선택):
        - 제출·저장·다음 등 사용자 확인이 뒤따를 때
        - 여러 개 중 하나 이상 선택
        - 부모-자식 중간 상태(indeterminate) 표현
        - "켜짐/꺼짐" 이 확실히 보여야 할 때 (토글은 좌/우 헷갈릴 수 있음)
      단일 yes/no: on/off 즉시 반영이면 토글, 그 외 확인 필요하면 체크박스
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **배경색**을 "어둡고 채도 낮게" 잡아 텍스트와 경쟁하지 않게 한다.
- 폼의 세로 길이·시선 동선을 줄이는 레이아웃 원칙(라벨 위치, 그룹핑, 필수/선택 표시)을 안다.
- **입력 상태**(focus / disabled / error)를 시각적으로 표시하고, 에러 메시지로 수정 방법을 안내한다.
- **CTA는 하나만** 강조한다.
- **체크박스 vs 토글 스위치**를 상황에 맞게 고른다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 대비/색(앞 Lesson), 기본 HTML form 요소.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

폼은 사용자가 "이거 오래 걸리겠다" 싶으면 이탈한다. 라벨이 옆에 있어 시선이 왔다 갔다 하고,
지금 어디를 입력 중인지 모르겠고, 에러가 났는데 뭘 고쳐야 할지 안 알려주면 완성률이 떨어진다.
배경도 채도가 높으면 본문과 싸운다.

<!-- section: concept -->
## 1. 배경색

- **밝기를 낮추면** 색에서 흰색을 빼는 것, **채도를 낮추면** 색에서 회색을 더하는 것.
- 배경은 **어둡거나(다크) 아주 옅고 채도 낮은(라이트)** 색 → 텍스트·콘텐츠가 주인공.
- 밝고 채도 높은 색은 **사용자를 지치게** 한다 → 액션 버튼처럼 시선을 끌 곳에만.
- 팔레트: hue 고정, S/B만 조절해 배경·카드·보더 톤을 뽑는다. 미학(aesthetics)과 사용성(usability)을 함께 본다.

<!-- section: mechanism -->
## 2. 폼 레이아웃

{{code: form-layout}}

{{code: input-states}}

{{code: cta}}

- **라벨은 항상 보이게**(위/왼쪽). placeholder만 두면 입력 시작하면 뭘 넣는 칸인지 사라진다.
- **focus 표시** 필수 — 지금 어느 칸을 입력 중인지. `:focus` 스타일 + `outline` 을 지우지 않는다(접근성).
- **에러**는 "어디서 / 왜 / 어떻게 고치는지" 를 그 칸 근처에 구체적으로.

<!-- section: concept | title: 체크박스 vs 토글 -->
## 3. 체크박스 vs 토글 스위치

{{code: check-vs-toggle}}

한 줄: **"바로 반영되면 토글, 나중에 저장/제출로 확정되거나 여러 개 고르면 체크박스."**
토글은 좌/우 어느 쪽이 켜짐인지 헷갈릴 수 있어, 명확한 선택 표시가 필요하면 체크박스가 낫다.

<!-- section: must_know -->
## 반드시 기억할 것

- 배경 = 어둡고/옅고 **채도 낮게**(텍스트와 비경쟁). 밝고 채도 높은 색은 액션 버튼에만.
- 라벨은 입력칸 **위/왼쪽**, 항상 보이게. placeholder는 예시일 뿐.
- 연관 필드 **그룹핑**, 그룹 간 여백. 폼의 세로 길이·동선을 줄인다.
- **focus / disabled / error 상태**를 시각적으로. 에러는 수정 방법까지 안내.
- **CTA는 하나만** 채운 색. 버튼 라벨은 구체적으로.
- **즉시 반영 = 토글**, **확인/제출·다중 선택 = 체크박스**.

<!-- section: experiment -->
## 직접 해 보기

1. 회원가입 폼을 만들되 라벨을 입력칸 위에 두고, 이름/연락처/주소를 그룹으로 나눠라.
2. `:focus` / `:disabled` / `.error` 세 상태 스타일을 각각 넣고 탭 이동하며 확인하라.
3. 유효성 에러 메시지를 그 칸 아래에 "이메일 형식이 아닙니다 (예: name@site.com)" 처럼 구체적으로 표시하라.
4. "알림 받기" 는 토글로, "약관 동의" 는 체크박스로 만들고 이유를 적어라.
5. 배경색을 채도 80으로 올려 본문과 경쟁하는 걸 확인한 뒤 채도를 낮춰라.

<!-- section: check_question -->
## 이해 점검

1. 배경색을 "채도 낮고 밝기 낮게" 잡는 이유는?
2. placeholder를 라벨 대신 쓰면 안 되는 이유는?
3. 폼에서 완성률을 높이는 레이아웃 원칙 세 가지는?
4. 에러 메시지에 반드시 담아야 하는 정보는?
5. 토글 스위치와 체크박스를 각각 언제 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "폼 UX를 개선하는 원칙들을 나열해 보세요."
- "입력 상태(focus/error/disabled)를 접근성까지 고려해 어떻게 표현하나요?"
- "체크박스와 토글 스위치의 선택 기준은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 배경=채도 낮게(비경쟁), 라벨 위/왼쪽·항상 보임, 그룹핑·세로 축소, focus/disabled/error + 에러 안내,
> CTA 하나, 토글(즉시)/체크박스(확인·다중)를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**배경은 채도를 낮춰 텍스트와 경쟁하지 않게 하고, 폼은 라벨을 위/왼쪽에 항상 보이게 두고 연관 필드를
그룹핑해 동선을 줄이며 focus·error 상태를 명확히 표시한다 — CTA는 하나만, 즉시 반영은 토글·확인이나
다중 선택은 체크박스.**
