---
id: tenlune-operations-agent/overview
project: tenlune-operations-agent
title: 프로젝트 개요 — CLI 우선 v1 에이전트
unit_kind: overview
feature_area: 전체
concepts: [CLI 우선 설계, 승인 게이트, 상태 머신, 순수 도메인 모듈 분리]
related_lessons:
  - ai-engineering/rag-and-agents/agents-intro
  - data-and-backend/nodejs-server/config-and-structure
  - typescript/setup-and-basic-types/intro-and-setup
---

<!-- section: role -->
## 이 프로젝트가 뭔가

**Tenlune Operations Agent** — 외주 개발 기회를 찾아 검토하고 지원/견적 **초안** 까지 만드는 CLI 우선
v1 에이전트(TypeScript/Node). Wishket 공개 목록을 read-only로 수집 → 적합도 점수 → 견적·기간·리스크
분석 → 초안 작성. **v1은 실제 지원 제출·견적 전송·고객 메시지를 전부 차단** 하고 `submit` 명령은
의도적으로 비활성. 학습 기준은 커밋 `1cfef95`.

<!-- section: where -->
## src 구조

```
src/
  cli.ts               진입 — argv 파싱, 서브커맨드 분기
  agent/operations-agent.ts   스캔·리뷰·초안 조합
  connectors/          wishket-public.ts(공개 페이지 read-only), soomgo-assisted.ts, sample-opportunities.ts
  domain/              scoring.ts, pricing.ts, duration.ts, risk.ts, quality-gate.ts,
                       portfolio.ts, questions.ts, delivery-model.ts, types.ts  ← 순수 함수
  repositories/        local-json-repository.ts (data/operations-state.json), operations-repository.ts(포트)
```

<!-- section: flow -->
## 상태 머신

```
discovered → analyzed → recommended → draft_ready → awaiting_approval
          → approved → submitted → (rejected | won | lost)
```

v1은 어떤 것도 `submitted` 로 **자동 이동하지 않는다.** 사람이 승인해야 그다음이다.

<!-- section: framework_role -->
## CLI 우선 설계

라우터·서버가 없다. `src/cli.ts` 가 `process.argv` 를 읽어 `scan / list / review / draft / submit` 으로
분기하고, 도메인 규칙은 전부 순수 함수(`domain/*`)로, 상태는 로컬 JSON 파일로 둔다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `ai-engineering/rag-and-agents/agents-intro` — 규칙 기반 에이전트 판단
- `data-and-backend/nodejs-server/config-and-structure` — CLI 진입 + 계층 분리
- `typescript/setup-and-basic-types/intro-and-setup` — 빌드 없는 TS

<!-- section: caution -->
## 주의점

- Unit은 **커밋된 코어**(CLI 디스패치·규칙 점수·견적/리스크 순수 함수·로컬 리포지토리)만 다룬다.
  개발 중인 Gmail/OAuth/메일 문의 기능은 근거에서 제외.
- Wishket 수집은 공개 페이지 1회 read-only다 — 로그인·폼 제출·깊은 크롤 없음. 구조가 바뀌면 빈 결과를 낸다(추측 안 함).

<!-- section: check_question -->
## 이해 점검

1. v1이 절대 자동으로 하지 않는 일은?
2. 도메인 규칙을 순수 함수로 둔 이유는?
3. 상태 머신에서 `awaiting_approval` 다음은 무엇이 결정하나?

<!-- section: review -->
## 한 줄 정리

**Operations Agent는 CLI 진입 + 순수 도메인 모듈(점수·견적·기간·리스크) + 로컬 JSON 상태로 이뤄진
승인 게이트형 v1 에이전트이며, 어떤 것도 자동으로 외부에 제출하지 않는다.**
