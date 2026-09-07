---
id: tenlune-marketing-agent/overview
project: tenlune-marketing-agent
title: 프로젝트 개요 — 에이전트 코어 구조
unit_kind: overview
feature_area: 전체
concepts: [계층 분리, 포트-어댑터, 에이전트 루프, 승인 경계, 모의 시나리오 테스트]
related_lessons:
  - ai-engineering/rag-and-agents/agents-intro
  - data-and-backend/nodejs-server/config-and-structure
  - typescript/setup-and-basic-types/intro-and-setup
---

<!-- section: role -->
## 이 프로젝트가 뭔가

**Tenlune Marketing Agent** — Tenlune 마케팅 운영을 돕는 Codex 중심 에이전트 **코어**
(TypeScript/Node, 런타임 프레임워크 없음). 마케팅 상태를 살피고, 다음 행동을 정하고, 콘텐츠 태스크를
만들고, 채널별 변형을 만들고, 리뷰·승인을 거쳐 발행한다. **외부 LLM provider 연결이나 실제 채널 발행은
명시적 승인 없이는 하지 않는다.** 학습 기준은 커밋 `a84cae2`.

<!-- section: where -->
## src 구조

```
src/
  domain/        types.ts(문자열 유니온·interface), channels.ts, id.ts, tracking.ts
  repositories/  marketing-repository.ts(포트) + in-memory-* + supabase-* + supabase-mapping.ts
  agent/         marketing-agent.ts(결정 코어), quality-gate.ts, content-adapter.ts,
                 publishing-workflow.ts, publisher-connector.ts, wordpress-publisher-connector.ts
  scenarios/     mock-marketing-flow.ts (node:test 로 검증)
```

<!-- section: flow -->
## 큰 흐름

1. **도메인 모델**(`types.ts`)이 상태를 타입으로 규정한다.
2. **리포지토리 포트** 하나에 인메모리·Supabase 두 어댑터가 같은 계약을 구현한다.
3. **에이전트**(`marketing-agent.ts`)가 상태를 읽어 다음 행동을 결정한다.
4. **품질 게이트**가 발행 전 콘텐츠를 검사한다(비밀정보·과장 표현·필수 필드).
5. **발행 워크플로** 가 승인된 변형을 채널별 connector로 넘긴다(automatic/assisted/disabled).

<!-- section: framework_role -->
## 프레임워크 없이 한 것

빌드 없이 Node 24 타입 스트리핑으로 `.ts` 실행. 라우터·ORM·DI 컨테이너 없이 **인터페이스 + 생성자
주입** 만으로 계층을 분리했다. 테스트는 `node --test` 로 모의 시나리오를 돌린다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `ai-engineering/rag-and-agents/agents-intro` — 에이전트 = 도구 호출을 정지 조건까지 반복
- `data-and-backend/nodejs-server/config-and-structure` — 계층 분리
- `typescript/setup-and-basic-types/intro-and-setup` — 빌드 없는 TS 실행

<!-- section: caution -->
## 주의점

- 이 프로젝트는 **개발 중** 이다. Unit은 커밋된 아키텍처 코어(도메인·포트/어댑터·결정 코어·품질
  게이트·발행)만 다루고, 미커밋 working tree(진행 중 기능)는 근거로 쓰지 않는다.
- 유료 LLM API, 계정 자동화, DM/댓글, 코드·평범한 DB 테이블에 secret 저장은 의도적으로 범위 밖.

<!-- section: check_question -->
## 이해 점검

1. 이 에이전트가 "승인 없이 하지 않는" 일은 무엇인가?
2. `domain / repositories / agent` 세 계층의 역할을 한 줄씩으로 말하라.
3. 프레임워크 없이 계층을 분리한 방법은?

<!-- section: review -->
## 한 줄 정리

**Marketing Agent는 도메인 모델 → 리포지토리 포트/어댑터 → 결정 코어 → 품질 게이트 → 발행 워크플로로
계층이 나뉜 TypeScript 에이전트 코어이며, 외부 발행·LLM 연결은 승인 경계 뒤에 있다.**
