---
id: design-and-planning/planning-and-ia/information-architecture
chapter: design-and-planning/planning-and-ia
title: 정보구조(IA) 잡기
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [planning, ia]
related_material_ids:
  - 1ZJoiV5mQXua-dWOG8M08O_pf-fe2CFBOUf3atyHK4Fw   # Information Architecture (메뉴 구조도)
prerequisites: []
code_examples:
  - slug: tree
    title: 메뉴 구조도 (트리)
    source_type: generated_minimal
    language: text
    code: |
      홈
      ├── 소개 (About)          /about
      │   ├── 프로필            /about/profile
      │   └── 경력사항          /about/career
      ├── 작업물 (Works)        /works
      │   ├── 웹사이트          /works?category=web
      │   ├── 앱 디자인         /works?category=app
      │   └── 브랜딩            /works?category=branding
      ├── 블로그 (Blog)         /blog
      └── 연락하기 (Contact)    /contact
      # 각 노드에 화면 이름 + URL 을 같이 적는다 → 라우팅 설계가 그대로 나온다.
  - slug: steps
    title: 제작 5단계
    source_type: generated_minimal
    language: text
    code: |
      1) 콘텐츠 수집 : 담을 것을 전부 나열 (회사소개/제품/고객센터/로그인 ...)
      2) 분류(grouping) : 유사한 것끼리 묶기 (카드소팅). 사용자 언어로 이름 짓기.
      3) 계층화 : 대분류 → 소분류 트리. 한 레벨에 항목 5~7개, 깊이 3단계 이내 권장.
      4) 유저 플로우 점검 : "이 정보를 찾으려면 몇 번 클릭?" 경로 시뮬레이션.
      5) 네이밍 + URL : 짧고 명확한 메뉴명, URL 구조 확정.
  - slug: checks
    title: 좋은 IA 점검
    source_type: generated_minimal
    language: text
    code: |
      - 중복 페이지 / 어디에도 안 속하는 페이지가 있나?
      - 같은 정보가 두 경로로 접근되면 정경로(canonical)를 정했나?
      - 메뉴명이 내부 용어가 아니라 "사용자가 쓰는 말" 인가?
      - 3번 클릭 안에 주요 정보에 닿나?
      - 향후 항목 추가 시 어디에 들어갈지 예측되나?
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **정보구조(IA) = 메뉴 구조도**가 왜 필요한지(UX 길잡이 + 협업 설계도 + 라우팅 기반) 안다.
- 콘텐츠 수집 → 분류 → 계층화 → 유저 플로우 → 네이밍/URL 의 5단계로 IA를 만든다.
- 트리에 **화면명 + URL** 을 같이 적어 라우팅 설계로 바로 잇는다.
- 좋은 IA의 점검 항목(깊이·중복·네이밍·클릭 수)을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- (없음) 이 Lesson이 기획 산출물의 출발점이다.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

메뉴 구조 없이 바로 화면을 그리면: 중복 페이지가 생기고, "이 정보 어디에 넣지?" 를 매번 즉흥으로
정하며, 개발 단계에서 라우팅이 뒤섞인다. 나중에 항목을 추가할 때 전체 영향 범위를 못 읽는다.

<!-- section: concept -->
## 1. IA가 하는 일

- **사용자**: 어디에 뭐가 있는지 예측 가능한 탐색(길잡이).
- **팀**: 기획·디자인·개발이 공유하는 **하나의 설계도** — 페이지 연결, 링크, 라우팅이 명확해진다.
- **유지보수**: 구조가 명확하면 기능 추가 시 영향 범위를 예측할 수 있다.

<!-- section: mechanism -->
## 2. 5단계

{{code: steps}}

{{code: tree}}

- 2단계(분류)는 **카드 소팅**으로: 콘텐츠 항목을 카드로 적어 실제 사용자(또는 팀원)에게 묶게 시킨다.
  묶음 이름은 내부 용어가 아니라 **사용자가 쓰는 말**로.
- 한 레벨에 **5~7개**, 깊이 **3단계 이내** 를 넘기면 탐색이 어려워진다.
- 트리의 각 노드에 **URL** 을 적어 두면 그게 곧 라우트 목록이다.

<!-- section: concept | title: 점검 -->
## 3. 좋은 IA 점검

{{code: checks}}

<!-- section: must_know -->
## 반드시 기억할 것

- IA = 메뉴 구조도 = **탐색 길잡이 + 팀 공유 설계도 + 라우팅 기반**.
- 5단계: 콘텐츠 수집 → 분류(카드 소팅) → 계층화 → 유저 플로우 점검 → 네이밍/URL.
- 한 레벨 **5~7개**, 깊이 **3단계 이내**. 주요 정보는 **3클릭 이내**.
- 메뉴명은 **사용자 언어**로. 내부 용어·영어 남용 금지.
- 트리에 **화면명 + URL** 을 같이 적는다 → 개발 라우팅과 1:1.
- 같은 정보가 두 경로면 **정경로(canonical)** 를 정한다(SEO·유지보수).

<!-- section: experiment -->
## 직접 해 보기

1. 만들려는 사이트의 콘텐츠를 전부 나열하고(20~30개), 카드 소팅으로 4~6개 그룹으로 묶어라.
2. 그룹을 트리로 계층화하고 각 노드에 URL을 붙여라. 깊이가 3단계를 넘으면 재정리.
3. "특정 정보를 찾는" 시나리오 3개를 잡아 클릭 경로를 세어 보라(목표: 3클릭).
4. 메뉴명 중 내부 용어가 있으면 사용자 언어로 바꿔라.
5. 완성한 트리의 URL 목록을 React Router `<Route>` 목록으로 옮겨 적어 보라.

<!-- section: check_question -->
## 이해 점검

1. IA가 개발(라우팅)에 어떻게 이어지나?
2. 카드 소팅은 어느 단계에서 쓰나?
3. 한 레벨 항목 수·트리 깊이의 권장 기준은?
4. 메뉴명을 "사용자 언어" 로 쓰라는 이유는?
5. 같은 정보에 두 경로가 있으면 무엇을 정해야 하나?

<!-- section: interview_question -->
## 면접 대비

- "정보구조(IA)를 설계하는 절차와 산출물을 설명해 주세요."
- "IA가 라우팅·SEO에 미치는 영향은?"
- "메뉴 깊이와 폭의 트레이드오프는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> IA=길잡이+설계도+라우팅 기반, 5단계(수집/분류/계층화/플로우/네이밍·URL), 5~7개·3단계·3클릭,
> 사용자 언어, 트리에 URL 병기를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**정보구조(IA)는 콘텐츠를 수집·분류(카드 소팅)·계층화해 사용자 언어로 이름 붙인 메뉴 트리이고,
각 노드에 URL을 병기하면 그대로 라우팅 설계가 된다 — 한 레벨 5~7개·깊이 3단계·주요 정보 3클릭이 기준.**
