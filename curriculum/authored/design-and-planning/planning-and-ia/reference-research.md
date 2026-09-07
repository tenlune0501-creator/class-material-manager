---
id: design-and-planning/planning-and-ia/reference-research
chapter: design-and-planning/planning-and-ia
title: 레퍼런스 조사와 분석
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [planning, research]
related_material_ids:
  - 1tvrQFteEzAlmRxKwSUXWvnBCGgUkU6mMNTF3g7sWQmI   # 레퍼런스 조사 분석하기
prerequisites:
  - design-and-planning/planning-and-ia/information-architecture
code_examples:
  - slug: axes
    title: 조사 6축 — 무엇을 볼지
    source_type: generated_minimal
    language: text
    code: |
      CONTENTS       핵심 내용이 잘 정리돼 찾기 쉬운가 / 차별화된 콘텐츠가 있는가
      UI / UX        메뉴 구조, 네비게이션 효율, 검색, 반응형 — 학습 없이 바로 쓸 수 있는가
      VISUAL         배색, 레이아웃, 콘텐츠 폭·세로 길이, 동적 요소, 시선을 끄는 요소
      MARKETING      핵심 기능 구현, 이벤트/프로모션, 고객 로열티 콘텐츠
      THEME/MESSAGE  사이트 정체성·컨셉이 명확한가, 전달 메뉴가 있는가
      SUPPORT        고객지원, FAQ/Q&A, 검색, 피드백
      (+ 웹표준/접근성  대비·이미지 텍스트·표준 오류)
  - slug: benchmark
    title: 벤치마킹 표 (현황 → 참조 → 방향)
    source_type: generated_minimal
    language: text
    code: |
      대상 사이트 현황분석: "메뉴가 찾기 힘들다 / 정적이다 / 색대비 약함" 처럼 구체적으로.

      구분          | 참조 사이트 / URL         | 배울 점 (구체적으로)
      디자인(VISUAL)| a.com                    | 여백·위계, teal 포인트 1색 운용
      내용(CONTENTS)| b.com                    | 상세 스펙을 탭으로 접어 스캔 쉬움
      사용성(UI/UX) | c.com                    | 상단 검색 + 최근 본 항목
      트렌드        | d.com                    | 스크롤 스냅 섹션
      => 제작 방향: 위에서 뽑은 것들을 우리 IA·톤에 맞게 어떻게 반영할지 1~2문장.
  - slug: pitfalls
    title: 흔한 실수
    source_type: generated_minimal
    language: text
    code: |
      - "예쁘다" 로 끝냄 → 무엇이 왜 좋은지(어떤 문제를 어떻게 푸나)를 적지 않음
      - 한 사이트를 통째로 베끼기 → 우리 목적·타겟·IA 와 안 맞음
      - 경쟁사만 봄 → 다른 업종의 UX 패턴에서 배울 게 더 많을 때가 있음
      - 스크린샷만 모음 → 상호작용(호버·전환·로딩)을 안 봄
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 레퍼런스(모델/경쟁/유사 사이트)를 **목적을 갖고** 조사한다.
- 조사 축(CONTENTS / UI·UX / VISUAL / MARKETING / THEME / SUPPORT + 접근성)을 안다.
- **벤치마킹 표**(대상 현황 → 참조 → 제작 방향)로 정리한다.
- "예쁘다" 로 끝내지 않고 **왜 좋은지(어떤 문제를 어떻게 푸나)** 를 기록한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- IA(메뉴 구조), 타이포·대비 기초.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

레퍼런스 조사를 "예쁜 사이트 스크린샷 모으기" 로 하면, 정작 우리 프로젝트에 뭘 반영할지 안 나온다.
한 사이트를 통째로 흉내 내면 우리 목적·타겟과 안 맞는다.

<!-- section: concept -->
## 1. 무엇을 보나 — 6축

{{code: axes}}

- 각 축마다 "잘한 사이트" 를 몇 개 수집하되, **한 사이트가 모든 축을 다 잘할 필요는 없다.**
- 경쟁사만 보지 말고 **다른 업종**의 좋은 UX 패턴도 본다(예: 커머스 필터를 포트폴리오 작업물 필터에).

<!-- section: mechanism -->
## 2. 벤치마킹 표

{{code: benchmark}}

핵심은 마지막 열 — **"배울 점을 구체적으로"**. "디자인이 좋다" ❌ → "상세 스펙을 탭으로 접어
스캔이 쉽다" ✅. 그리고 그걸 **우리 IA·톤에 맞게 어떻게 반영할지** 한 줄로 방향을 적는다.

<!-- section: concept | title: 실수 -->
## 3. 흔한 실수

{{code: pitfalls}}

- 상호작용(호버·전환·로딩·빈 상태)을 직접 클릭해 보며 관찰한다. 스크린샷만으로는 안 보인다.

<!-- section: must_know -->
## 반드시 기억할 것

- 레퍼런스 조사는 **목적**(우리 프로젝트에 뭘 반영할지)이 있어야 한다.
- 축: CONTENTS / UI·UX / VISUAL / MARKETING / THEME·MESSAGE / SUPPORT (+ 접근성).
- 정리는 **현황분석(구체적) → 참조(URL) → 배울 점(구체적) → 제작 방향** 표로.
- "예쁘다" 가 아니라 **"어떤 문제를 어떻게 푸나"** 를 적는다.
- 한 사이트 통째로 베끼지 않는다. 경쟁사 + **타 업종** 패턴도 본다.
- 상호작용(호버·전환·로딩·빈 상태)을 직접 눌러 보며 관찰한다.

<!-- section: experiment -->
## 직접 해 보기

1. 만들 프로젝트와 유사한 사이트 3곳 + 다른 업종 2곳을 골라 6축으로 각각 1~2줄 평가하라.
2. 벤치마킹 표를 만들어 "배울 점" 을 전부 **구체적 문장**으로 적어라("좋다" 금지).
3. 각 배울 점에 대해 "우리 IA/톤에 맞게 어떻게 반영" 을 한 줄씩 붙여라.
4. 한 사이트의 버튼 호버·페이지 전환·로딩 상태·검색 결과 빈 상태를 직접 눌러 관찰 메모하라.
5. 조사 결과에서 우리 프로젝트의 "제작 방향" 3가지를 뽑아라.

<!-- section: check_question -->
## 이해 점검

1. 레퍼런스 조사의 목적은 무엇이어야 하나?
2. 조사 6축을 나열하면?
3. "배울 점" 을 적을 때 "디자인이 좋다" 가 안 되는 이유는?
4. 경쟁사만 보면 안 되는 이유는?
5. 스크린샷만 모으면 놓치는 것은?

<!-- section: interview_question -->
## 면접 대비

- "레퍼런스 리서치를 어떻게 진행하고, 결과를 어떻게 반영하나요?"
- "경쟁사 벤치마킹에서 '베끼기' 와 '배우기' 를 어떻게 구분하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 목적 있는 조사, 6축(콘텐츠/UI·UX/비주얼/마케팅/테마/지원+접근성),
> 벤치마킹 표(현황→참조→배울 점 구체적→방향), 통째 베끼기 금지·상호작용 관찰을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**레퍼런스 조사는 "우리 프로젝트에 무엇을 반영할지" 를 목적으로 6축(콘텐츠·UI·비주얼·마케팅·테마·지원)
으로 보고, 벤치마킹 표에 "어떤 문제를 어떻게 푸나" 를 구체적으로 적은 뒤 우리 IA·톤에 맞는 제작 방향으로
바꾼다 — 통째로 베끼지 않고 상호작용까지 직접 관찰한다.**
