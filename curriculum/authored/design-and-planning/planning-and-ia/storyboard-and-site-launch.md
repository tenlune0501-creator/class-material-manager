---
id: design-and-planning/planning-and-ia/storyboard-and-site-launch
chapter: design-and-planning/planning-and-ia
title: 스토리보드와 홈페이지 개설 절차
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [planning, storyboard]
related_material_ids:
  - 0B0HRSf3dPjJieEowYVZtZ1VEQ00
  - 14oLUXcHxODKFiS6xJft0Y927Iim_Fdw9_wP_mXNFSD8   # 홈페이지 개설하기 (웹 발전사 + 도메인/호스팅/배포)
prerequisites:
  - design-and-planning/planning-and-ia/information-architecture
code_examples:
  - slug: pipeline
    title: 기획 산출물 파이프라인
    source_type: generated_minimal
    language: text
    code: |
      IA(메뉴 구조도) → 와이어프레임(화면별 구조·배치, 흑백)
        → 워크플로우(화면 간 이동 경로) → 스토리보드(각 화면 상세 + 동작 명세)
        → 디자인 → 개발 → 배포
      뒤로 갈수록 수정 비용이 커진다. 앞 단계에서 확정할 것을 확정한다.
  - slug: storyboard
    title: 스토리보드 한 칸에 담는 것
    source_type: generated_minimal
    language: text
    code: |
      화면 ID / 이름            (예: P02 상품목록)
      레이아웃 스케치           (영역 배치)
      각 요소 설명              (버튼/링크가 어디로 가나, 데이터 출처)
      인터랙션·상태             (로딩/빈 목록/에러/호버, 유효성 규칙)
      진입·이탈 경로            (어디서 오고 어디로 가나 — 워크플로우와 일치)
      # 개발자가 "이대로 만들면 되는" 수준까지 구체적으로.
  - slug: hosting
    title: 홈페이지 개설 — 주소 + 공간 + 배포
    source_type: generated_minimal
    language: text
    code: |
      1) 도메인(주소)  : whois / gabia / dotname 등에서 구매. 원하는 주소 가용성 확인.
      2) 호스팅(공간)  : 정적이면 GitHub Pages/Netlify/Vercel(무료),
                         서버형이면 웹호스팅(dothome 등)·PaaS(Render/Koyeb)·클라우드(AWS/GCP).
      3) 연결          : 도메인의 네임서버를 호스팅에 맞춘다(전파에 수 시간~하루).
      4) 배포          : 정적=git push 자동배포 / 전통=FTP(FileZilla) 업로드.
      # 방식 선택 = "서버 로직·DB 가 필요한가?" 로 갈린다.
  - slug: eras
    title: 웹사이트 구현 방식의 변천 (선택 기준)
    source_type: generated_minimal
    language: text
    code: |
      정적 HTML         : 서버 로직 없음        → 정적 호스팅
      SSR(PHP/Django 등): 서버가 HTML 생성 + DB → 웹호스팅/서버
      SPA(React/Vue)    : CSR + REST API        → 프론트(Vercel) + API(Render/Koyeb)
      풀스택(Next.js)   : SSR+SPA+API 통합       → Vercel + Supabase 등
      노코드(Webflow 등): 코딩 없이             → 플랫폼 자체
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 기획 산출물의 순서(IA → 와이어프레임 → 워크플로우 → **스토리보드** → 디자인 → 개발 → 배포)를 안다.
- 스토리보드 한 칸에 담는 것(레이아웃·요소 설명·인터랙션/상태·진입·이탈)을 안다.
- 홈페이지를 여는 절차 — **도메인(주소) + 호스팅(공간) + 네임서버 연결 + 배포** — 를 안다.
- 웹사이트 구현 방식(정적/SSR/SPA/풀스택/노코드)에 따라 어디에 배포하는지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- IA(메뉴 구조도), 정적/서버형 배포 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

와이어프레임만 그리고 개발에 넘기면 "이 버튼 누르면 어디로 가요?", "목록이 비면 뭘 보여줘요?"
가 개발 중에 계속 나온다. 또 다 만들고 나서 "그런데 이걸 어떻게 인터넷에 올리지?" 를 그제야 고민한다.

<!-- section: concept -->
## 1. 산출물 파이프라인

{{code: pipeline}}

- **와이어프레임**: 화면별 구조·배치를 흑백으로(색·폰트는 나중). "무엇이 어디에".
- **워크플로우**: 화면과 화면 사이의 이동 경로(유저 플로우). IA의 트리를 "움직이는 그림" 으로.
- **스토리보드**: 각 화면을 개발 가능한 수준으로 상세화 + 동작 명세.

<!-- section: mechanism -->
## 2. 스토리보드 한 칸

{{code: storyboard}}

인터랙션과 **상태**(로딩·빈 목록·에러·유효성)를 빠뜨리지 않는 게 핵심이다 — 개발 중 되묻는 것의 대부분이 여기.

<!-- section: concept | title: 개설 -->
## 3. 홈페이지 개설 절차

{{code: hosting}}

{{code: eras}}

- **주소(도메인)** 는 사고 → **공간(호스팅)** 을 잡고 → **네임서버**로 둘을 연결 → **배포**.
- 방식 선택은 **"서버 로직·DB가 필요한가?"** 하나로 크게 갈린다. 필요 없으면 정적 호스팅으로 충분(무료).
- 도메인 없이 배포처가 주는 주소(`*.vercel.app`, `*.github.io`)로 먼저 열고, 나중에 도메인을 붙여도 된다.

<!-- section: must_know -->
## 반드시 기억할 것

- 순서: IA → 와이어프레임(흑백 구조) → 워크플로우(이동) → **스토리보드**(상세+동작) → 디자인 → 개발 → 배포.
- 스토리보드에는 **인터랙션 + 상태(로딩·빈·에러·유효성) + 진입/이탈** 을 반드시.
- 개설 = **도메인 구매 + 호스팅 + 네임서버 연결 + 배포**. 네임서버 전파는 시간이 걸린다.
- 정적이면 GitHub Pages/Netlify/Vercel(무료), 서버형이면 웹호스팅/PaaS/클라우드.
- 배포 방식 = "서버 로직·DB 필요?" 로 갈린다.
- 도메인 없이 배포처 기본 주소로 먼저 열 수 있다.

<!-- section: experiment -->
## 직접 해 보기

1. IA 트리를 바탕으로 주요 화면 5개의 와이어프레임을 흑백으로 그려라.
2. 화면 간 이동을 화살표로 이은 워크플로우를 만들어라(로그인 전/후 분기 포함).
3. "상품목록" 화면 하나를 스토리보드로 상세화하라 — 요소 설명 + 로딩/빈/에러 상태 + 진입·이탈.
4. 원하는 도메인의 가용성을 도메인 업체에서 확인해 보라(구매는 안 해도 됨).
5. 정적 페이지를 Vercel 또는 Netlify에 배포해 기본 주소로 열고, "도메인을 붙이려면 무엇을 하나" 를 문서에서 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 와이어프레임 / 워크플로우 / 스토리보드는 각각 무엇을 담나?
2. 스토리보드에서 빠뜨리기 쉬운, 그러나 개발 중 되묻게 되는 것은?
3. 홈페이지 개설의 4단계는?
4. 네임서버 연결 후 바로 접속이 안 될 수 있는 이유는?
5. 정적/서버형 배포처를 가르는 질문 하나는?

<!-- section: interview_question -->
## 면접 대비

- "기획 산출물(IA/와이어/스토리보드)의 역할과 순서를 설명해 주세요."
- "도메인과 호스팅을 연결하는 과정을 설명해 주세요."
- "프로젝트 성격에 따라 배포처를 어떻게 고르나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 파이프라인(IA→와이어→워크플로우→스토리보드→디자인→개발→배포), 스토리보드=요소+상태+진입/이탈,
> 개설 4단계(도메인/호스팅/네임서버/배포), 정적 vs 서버형을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**기획은 IA → 와이어프레임 → 워크플로우 → 스토리보드(요소·상태·진입/이탈까지 개발 가능 수준) 순으로
구체화하고, 개설은 도메인 구매 + 호스팅 + 네임서버 연결 + 배포로 이뤄지며 — 서버 로직·DB가 필요 없으면
정적 호스팅으로 무료로 연다.**
