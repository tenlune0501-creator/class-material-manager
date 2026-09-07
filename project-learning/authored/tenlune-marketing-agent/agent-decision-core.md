---
id: tenlune-marketing-agent/agent-decision-core
project: tenlune-marketing-agent
title: 에이전트 결정 코어 — 다음 행동 고르기
unit_kind: feature
feature_area: 에이전트 코어
concepts: [상태 기반 결정, 규칙 우선순위, 의존성 주입, 결정 로깅, 최근 중복 회피]
related_lessons:
  - ai-engineering/rag-and-agents/agents-intro
  - typescript/functions-unions-guards/unions-and-type-guards
  - data-and-backend/nodejs-server/config-and-structure
---

<!-- section: role -->
## 이 코드가 하는 일

`src/agent/marketing-agent.ts` — `decideNextAction()` 이 현재 마케팅 상태(활성/종료 태스크, 준비된
변형 유무 등)를 보고 **다음에 할 행동** 을 규칙으로 정하고, 그 결정을 로그로 남긴다.
`content-adapter` 와 `quality-gate` 를 생성자에서 주입받는다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
const ACTIVE_STATUSES: TaskStatus[] = ["idea", "drafting", "review", "approved", "publishing", "failed"];
const TERMINAL_STATUSES: TaskStatus[] = ["published", "archived"];

export class MarketingAgent {
  constructor(
    private readonly repository: MarketingRepository,
    private readonly contentAdapter = new ContentAdapter(),
    private readonly qualityGate = new QualityGate(),
  ) {}

  decideNextAction(): AgentDecision {
    const state = this.repository.getState();

    const draftTask = state.tasks.find(t => t.status === "idea" || t.status === "drafting");
    if (draftTask) {
      return this.recordDecision({
        type: "prepare_channel_variant",
        reason: "A content task exists but channel-specific variants have not been prepared yet.",
        recommendedTaskId: draftTask.id,
        recommendedChannelIds: draftTask.targetChannelIds,
        requiresUserApproval: false,
      });
    }
    // ... review 대기 → request_review, approved → publish_approved_content, 없으면 create/monitor
  }
}
```

<!-- section: why -->
## 왜 이렇게 했나

- 에이전트라고 해서 매번 LLM에 "뭐 할까?" 를 묻지 않는다 — **상태 → 다음 행동** 이 규칙으로 결정 가능한
  건 규칙으로 한다(빠르고 결정적이고 검증 가능).
- 결정에 항상 `reason` 을 달고 `recordDecision` 으로 로그를 남긴다 → 나중에 "왜 이걸 했지?" 를 되짚는다.
- `contentAdapter`/`qualityGate` 를 **주입** 받아 테스트에서 가짜로 바꿔 끼울 수 있다.

<!-- section: framework_role -->
## "에이전트 루프" 와의 관계

`ai-engineering/rag-and-agents/agents-intro` 의 에이전트 루프 = 행동 → 관찰 → 반복. 여기서 한 스텝의
"행동 결정" 이 `decideNextAction()` 이다. 관찰(상태 갱신)은 리포지토리가, 반복은 호출부가 한다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `ai-engineering/rag-and-agents/agents-intro` — 에이전트 = 정지 조건까지 반복
- `typescript/functions-unions-guards/unions-and-type-guards` — 상태 유니온으로 분기
- `data-and-backend/nodejs-server/config-and-structure` — 의존성 주입

<!-- section: caution -->
## 주의점

- 규칙 우선순위(어떤 상태를 먼저 처리할지)가 곧 에이전트의 성격이다 — 순서를 바꾸면 행동이 달라진다.
- "최근 중복 토픽 회피" 같은 규칙이 있다 — 결정이 상태뿐 아니라 최근 이력도 본다.

<!-- section: experiment -->
## 작은 실습

1. `decideNextAction` 의 분기 순서를 나열하고, 각 분기가 반환하는 `DecisionType` 을 표로 적어라.
2. 인메모리 리포지토리에 `status: "approved"` 태스크만 넣고 `decideNextAction()` 결과를 예측·확인하라.
3. `qualityGate` 를 항상 실패하는 가짜로 주입하면 발행 결정이 어떻게 되는지 추론하라.

<!-- section: check_question -->
## 이해 점검

1. 에이전트가 "매번 LLM에 묻지 않는" 이유는?
2. 모든 결정에 `reason` 을 다는 이유는?
3. `contentAdapter`/`qualityGate` 를 주입받는 이점은?

<!-- section: review -->
## 한 줄 정리

**`decideNextAction()` 은 현재 상태(태스크/변형/승인)를 규칙 우선순위로 훑어 다음 행동을 결정하고 이유와
함께 로그에 남긴다 — 에이전트 루프의 "한 스텝 결정" 을 규칙으로 구현한 것이다.**
