---
id: design-and-planning/figma/plugins-and-mcp
chapter: design-and-planning/figma
title: Figma 플러그인과 MCP 연동
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [figma, plugins, mcp]
related_material_ids:
  - 1TbvhY_tdTQlHC-oWTYLarZOQdNmBuk5FOU2hHGnAaqY   # 03_Figma 플러그인 (Unsplash 등)
  - 186Pniw5Fo9HgDGksXtfxe3F__El_WCa4D65pqDp-ID8
  - 1WhBa5Vy7afTcG7gUc48eaJ26B0Jo7ZmQ-Libi9o8yPw
sources:
  - title: "Figma — Dev Mode MCP server"
    url: https://help.figma.com/hc/en-us/articles/32132100833559
    publisher: "Figma"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - design-and-planning/figma/figma-basics
code_examples:
  - slug: plugins
    title: 자주 쓰는 플러그인 (역할별)
    source_type: generated_minimal
    language: text
    code: |
      이미지 채우기   : Unsplash (플레이스홀더 사진), Iconify (아이콘)
      더미 데이터     : "Content Reel" / "Google Sheets Sync" (이름·문장·아바타 자동 채움)
      다이어그램      : "FigJam"·flow chart 플러그인 (IA/유저플로우)
      접근성          : 대비(contrast) 체크 플러그인
      정리            : "Similayer"(비슷한 레이어 선택), 이름 일괄 변경
      # 플러그인은 편의 도구. 핵심 구조(오토레이아웃·컴포넌트·토큰)를 대신하지 않는다.
  - slug: mcp
    title: Figma Dev Mode MCP — AI 코딩 도구가 시안을 읽게
    source_type: generated_minimal
    language: text
    code: |
      MCP(Model Context Protocol) : AI 에이전트(Claude/Cursor 등)가 외부 도구·데이터에
        표준 방식으로 접근하게 하는 프로토콜.
      Figma Dev Mode MCP server : Figma 데스크톱 앱이 로컬에 MCP 서버를 띄우면,
        코딩 에이전트가 선택된 프레임의 구조·토큰·오토레이아웃 정보를 직접 읽어
        "이 시안 컴포넌트로 만들어줘" 를 더 정확히 수행.
      켜기: Figma 데스크톱 → Preferences → "Enable Dev Mode MCP server" (Dev/Full seat 필요),
            에이전트 쪽에 그 로컬 서버 주소를 MCP 로 등록.
  - slug: caveat
    title: 그래도 사람이 검토한다
    source_type: generated_minimal
    language: text
    code: |
      - MCP/플러그인이 뽑아 준 코드도 토큰·시맨틱 태그·접근성·반응형을 사람이 점검.
      - 시안이 오토레이아웃·컴포넌트·변수로 잘 정리돼 있을수록 결과가 좋다(garbage in, garbage out).
      - 버전·기능이 자주 바뀐다 → 도입 전 현재 문서 확인.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Figma **플러그인**을 역할별(이미지·더미데이터·다이어그램·접근성·정리)로 안다.
- 플러그인이 **편의 도구**이지 구조(오토레이아웃·컴포넌트·토큰)를 대신하지 않음을 안다.
- **MCP**가 무엇인지, **Figma Dev Mode MCP server** 로 AI 코딩 도구가 시안을 읽게 하는 흐름을 안다.
- 자동 생성 결과도 사람이 토큰·접근성·반응형을 검토해야 한다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Figma 기본 조작(컴포넌트·오토레이아웃·변수), Inspect.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

시안에 이미지·더미 텍스트를 하나씩 붙이면 오래 걸린다. 또 시안을 코드로 옮길 때 Inspect 값을
사람이 일일이 베끼면 실수가 난다. 플러그인과 MCP가 이 반복을 줄여 준다 — 단, 맹신하면 안 된다.

<!-- section: concept -->
## 1. 플러그인

{{code: plugins}}

- 플러그인은 Figma 커뮤니티에서 설치. **역할별로 몇 개만** 익혀 두면 충분하다.
- 주의: 플러그인이 채운 더미 이미지·텍스트는 **최종본 전에 실제 콘텐츠로 교체**. 아이콘은 라이선스 확인.

<!-- section: mechanism -->
## 2. MCP 연동

{{code: mcp}}

- **MCP(Model Context Protocol)**: AI 에이전트가 외부 도구·데이터에 표준 방식으로 붙게 하는 프로토콜.
- **Figma Dev Mode MCP server**: Figma 데스크톱이 로컬에 MCP 서버를 띄우면, 코딩 에이전트가
  선택한 프레임의 **구조·토큰·오토레이아웃**을 직접 읽는다 → "이 시안을 React 컴포넌트로" 를 더 정확히.
- 켜는 법은 Figma Preferences에서(Dev/Full seat 필요), 에이전트에 로컬 서버를 MCP로 등록.
  (세부 절차·요구 사항은 버전에 따라 바뀌므로 공식 문서를 그때 확인.)

<!-- section: concept | title: 한계 -->
## 3. 자동화의 한계

{{code: caveat}}

<!-- section: must_know -->
## 반드시 기억할 것

- 플러그인은 **역할별로 소수만** — 이미지, 더미 데이터, 다이어그램, 대비 체크, 레이어 정리.
- 플러그인이 채운 더미 콘텐츠는 배포 전 실제 콘텐츠로 교체. 아이콘 라이선스 확인.
- **MCP** = AI 에이전트가 외부 도구를 표준으로 쓰는 프로토콜. **Figma Dev Mode MCP** 로 시안을 직접 읽힌다.
- 시안이 **오토레이아웃·컴포넌트·변수로 잘 정리**돼 있어야 MCP/자동 코드 품질이 좋다.
- 자동 생성 코드도 **사람이 토큰·시맨틱·접근성·반응형을 검토**한다.
- 이 영역은 기능·버전이 자주 바뀐다 → 도입 시점의 공식 문서 확인.

<!-- section: experiment -->
## 직접 해 보기

1. Unsplash + Content Reel 플러그인으로 카드 목록의 이미지·이름·문장을 자동으로 채워 보라.
2. 대비 체크 플러그인으로 시안의 텍스트 대비 미달을 찾아라.
3. (가능하면) Figma 데스크톱에서 Dev Mode MCP server를 켜고, 코딩 에이전트에 등록해 프레임 하나를 컴포넌트로 변환시켜 보라.
4. 그 결과 코드에서 색이 토큰인지 하드코딩인지, 시맨틱 태그·alt·반응형이 맞는지 검토하라.
5. 오토레이아웃/컴포넌트가 안 된 지저분한 시안과 잘 정리된 시안을 각각 넣어 결과 차이를 비교하라.

<!-- section: check_question -->
## 이해 점검

1. 플러그인으로 채운 더미 콘텐츠를 그대로 두면 안 되는 이유는?
2. MCP는 무엇을 표준화하나?
3. Figma Dev Mode MCP server는 코딩 에이전트에게 무엇을 제공하나?
4. MCP 결과 품질이 시안 정리 상태에 좌우되는 이유는?
5. 자동 생성 코드에서 사람이 반드시 확인해야 할 것들은?

<!-- section: interview_question -->
## 면접 대비

- "디자인→코드 자동화 도구(MCP 등)를 쓸 때 개발자의 검토 포인트는?"
- "Figma 플러그인을 팀에 도입할 때 관리 기준은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 플러그인=역할별 소수(더미는 교체), MCP=AI 도구 표준 접근, Figma Dev Mode MCP가 시안 구조 제공,
> 결과는 시안 정리 상태에 좌우, 사람이 토큰·접근성·반응형 검토를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Figma 플러그인은 이미지·더미데이터·다이어그램·대비·정리를 돕는 편의 도구이고, MCP는 AI 코딩 도구가
시안 구조를 직접 읽게 하는 프로토콜이다 — 시안이 오토레이아웃·컴포넌트·변수로 잘 정리돼 있어야
결과가 좋고, 자동 생성 코드도 사람이 토큰·접근성·반응형을 검토한다.**
