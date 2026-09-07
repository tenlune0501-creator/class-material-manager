---
id: design-and-planning/figma/figma-basics
chapter: design-and-planning/figma
title: Figma 기본 조작
mastery: understand
lesson_kind: lesson
estimated_minutes: 40
tags: [figma, design-tools]
related_material_ids:
  - 1t4OiOiMeL3L97LGm7V_PLc5TvTD2hEi6
  - 17b6Up6v5tVBIcKfsxnZmByJ3OGH5jsrh
  - 1xnZet5KmRFBf-5iVAnwP_MBdz7a2agIF
  - 1Jyv8RFRBxnKdANi2NE1iGsn6ERgSc5t1
  - 16WmAhtRtcehFEm_wqCrjNhFK2u4PtxvE
  - 1864bTT5tIEtRSM_l_yGCr6qFeBAkh93K
  - 19D05WtqP8k-pZZFaUOpTYSUkPubPNJdM
  - 1QfG-bPkg-JuZbotT3O200IieV_9ghZsM
  - 1Sgy6gj860F2Blk3AjMk6_coGmGaMDpqY
  - 1Rs3xuoSOFQGBZi8kOqUgdtWDW79SS0Mp
  - 1TNqalkFtspY7U0RMfElPCS-FsnRiSh-e
  - 1dT2py26HBCBl4fvCQ1TgfRzWkQMdPVMM
  - 1mxYXAX4_6cQo9d8puskT9R1DkESDYZig
  - 0B0HRSf3dPjJicmRvRzNIcGFYZlU
sources:
  - title: "Figma — Get started with Figma design"
    url: https://help.figma.com/hc/en-us/categories/360002042553-Getting-started
    publisher: "Figma"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - design-and-planning/ui-design-foundations/design-tokens-and-auto-layout
code_examples:
  - slug: object-tree
    title: 객체 계층 — Frame / Group / Component / Instance
    source_type: generated_minimal
    language: text
    code: |
      Frame      : 화면·영역의 컨테이너 (CSS 의 <div>·화면 하나). 오토레이아웃을 걸 수 있다.
      Group      : 그냥 묶음 (레이아웃 규칙 없음). 이동·정렬 편의용.
      Component  : 재사용 원본(마스터). 여기서 고치면 모든 인스턴스에 반영.
      Instance   : 컴포넌트의 복제본. 개별로 텍스트·색 override 가능, 구조는 원본을 따름.
      # 반복되는 UI(버튼/카드/헤더) = Component. 화면 = Frame.
  - slug: constraints
    title: 제약(Constraints) — 프레임 크기가 바뀔 때
    source_type: generated_minimal
    language: text
    code: |
      Left / Right / Center / Scale / Left&Right(stretch)   ← 각 자식이 부모 리사이즈에 반응하는 방식
      예) 헤더 로고 = Left+Top,  우측 메뉴 = Right+Top,  본문 = Left&Right(늘어남)
      # 오토레이아웃을 안 쓰는 프레임에서 반응형 배치를 잡는 도구.
  - slug: shortcuts
    title: 자주 쓰는 단축키 (기억할 것만)
    source_type: generated_minimal
    language: text
    code: |
      F         프레임    |  R 사각형  |  T 텍스트  |  O 원
      Shift+A   선택 요소를 오토레이아웃으로 감싸기
      Ctrl/Cmd+G  그룹   |  Ctrl/Cmd+Alt+K  컴포넌트 만들기
      Alt+드래그  복제 + 간격 측정 (다른 요소로 hover 시 간격 표시)
      Space+드래그  캔버스 이동  |  Ctrl/Cmd+휠  줌
  - slug: dev-mode
    title: 개발자에게 넘기기 (Dev Mode / Inspect)
    source_type: generated_minimal
    language: text
    code: |
      요소 선택 → 우측 패널에서 크기·간격·색·폰트 값 확인, CSS 스니펫 복사.
      단, 스니펫을 그대로 붙이지 않는다 — 토큰(변수)·오토레이아웃(Flexbox)으로 재해석해서 쓴다.
      (자세한 design→code 흐름은 design-to-code 챕터)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Figma의 **객체 계층**(Frame / Group / Component / Instance)을 구분해 쓴다.
- **오토레이아웃**과 **제약(Constraints)** 으로 리사이즈에 안 깨지는 배치를 만든다.
- 재사용 UI를 **컴포넌트**로 만들고 인스턴스에서 override 한다.
- 자주 쓰는 단축키와, 개발자에게 값을 넘기는 방법(Inspect)을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 오토레이아웃 ≈ Flexbox, 디자인 토큰/변수(앞 Lesson).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

디자이너가 시안을 주는데 레이어가 그냥 "Group" 뿐이고 절대 좌표로만 배치돼 있으면, 개발자는
매 요소의 위치를 픽셀로 재고 텍스트가 길어지면 다 깨진다. 반대로 개발자도 시안을 읽으려면
Figma의 구조를 알아야 한다.

<!-- section: concept -->
## 1. 객체 계층

{{code: object-tree}}

- **화면 = Frame.** Frame에 오토레이아웃을 걸면 그게 곧 Flex 컨테이너.
- **반복 UI = Component.** 원본(마스터)을 고치면 모든 인스턴스가 따라온다.
- Group은 레이아웃 규칙이 없는 단순 묶음 — 정렬·이동 편의용.

<!-- section: mechanism -->
## 2. 오토레이아웃 + 제약

- **오토레이아웃**(`Shift+A`): 방향·간격(gap)·패딩·정렬 + Hug/Fixed/Fill. 대부분의 컴포넌트·리스트는 이걸로.
- **제약(Constraints)**: 오토레이아웃을 안 쓰는 프레임에서 "부모가 커지면 이 자식은 어디에 붙나".

{{code: constraints}}

<!-- section: concept | title: 단축키 -->
## 3. 단축키

{{code: shortcuts}}

`Alt+드래그` 로 복제하며 다른 요소에 hover하면 **간격이 숫자로** 표시된다 — 간격 일관성 잡을 때 유용.

<!-- section: concept | title: 핸드오프 -->
## 4. 개발자에게 넘기기

{{code: dev-mode}}

<!-- section: must_know -->
## 반드시 기억할 것

- 화면 = **Frame**(오토레이아웃 가능), 반복 UI = **Component**(원본 수정 → 전체 반영), 단순 묶음 = Group.
- 배치는 **오토레이아웃**(Flex 사고) 우선. 안 쓰는 프레임은 **제약(Constraints)** 으로 반응형.
- Instance는 텍스트·색을 개별 override 가능, 구조는 원본을 따른다.
- Inspect로 값을 확인하되 **CSS 스니펫을 그대로 붙이지 않는다**(토큰·오토레이아웃으로 재해석).
- 색·텍스트는 변수/스타일로(직접 값 입력 지양) → 일관성·다크 모드.

<!-- section: experiment -->
## 직접 해 보기

1. Frame 하나에 헤더/본문/푸터를 만들고 각각에 오토레이아웃(세로, gap)을 걸어라.
2. 버튼을 Component로 만들고 인스턴스 3개에서 라벨만 바꿔라. 원본 색을 바꿔 전체가 따라오는지 확인.
3. 오토레이아웃 없는 프레임에서 로고=Left, 메뉴=Right, 본문=Left&Right로 제약을 걸고 프레임을 넓혀 보라.
4. `Alt+드래그` 로 카드를 복제하며 간격을 24px로 맞춰라.
5. 완성한 카드를 Inspect로 열어 값을 읽고, 그 값을 CSS 변수로 옮겨 적어라.

<!-- section: check_question -->
## 이해 점검

1. Frame / Group / Component / Instance 는 각각 언제 쓰나?
2. 오토레이아웃과 제약(Constraints)의 차이와 각각의 용도는?
3. 컴포넌트 원본을 고치면 인스턴스는? 인스턴스에서 바꿀 수 있는 건?
4. Inspect의 CSS 스니펫을 그대로 쓰면 안 되는 이유는?
5. 색을 직접 hex로 입력하지 않고 변수로 지정하는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "Figma에서 재사용 가능한 컴포넌트 시스템을 어떻게 구성하나요?"
- "디자인 시안을 개발로 넘길 때(핸드오프) 무엇을 확인하나요?"
- "오토레이아웃으로 반응형 컴포넌트를 만드는 방법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> Frame/Group/Component/Instance 역할, 오토레이아웃(Flex) + 제약(반응형), 원본 수정→전체 반영,
> Inspect는 참고용(토큰으로 재해석), 색은 변수로를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Figma는 화면을 Frame, 반복 UI를 Component로 만들고 오토레이아웃(Flex 사고)·제약으로 리사이즈에
안 깨지게 배치한다 — Inspect로 값을 확인하되 CSS 스니펫은 토큰·오토레이아웃으로 재해석해 쓴다.**
