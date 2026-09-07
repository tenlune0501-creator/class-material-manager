---
id: tenlune-marketing-agent/publishing-workflow-connectors
project: tenlune-marketing-agent
title: 발행 워크플로 — connector 추상화
unit_kind: feature
feature_area: 발행
concepts: [전략 패턴(connector), 워크플로 오케스트레이션, 부분 실패 집계, 채널별 발행 모드]
related_lessons:
  - typescript/objects-interfaces-aliases/objects-interface-type-alias
  - typescript/functions-unions-guards/function-types
  - data-and-backend/nodejs-server/error-handling
  - data-and-backend/backend-integration/frontend-to-webserver-db
---

<!-- section: role -->
## 이 코드가 하는 일

`src/agent/publishing-workflow.ts` + `publisher-connector.ts`(인터페이스) +
`wordpress-publisher-connector.ts` / `manual-publisher-connector.ts` — 승인된 변형을 채널별
**connector** 로 넘겨 발행하고, `automatic` / `assisted` / `disabled` 모드별 결과를 집계한다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
// publisher-connector.ts — 모든 채널 connector 가 지키는 계약
export interface PublisherConnector {
  readonly channelId: ChannelId;
  readonly mode: ChannelPublishMode;              // "automatic" | "assisted" | "disabled"
  validateConfig?(): void;
  prepare?(input: PublishRequest): ManualPublishInstructions;   // assisted 용
  publish(input: PublishRequest): Promise<PublishResult>;
}

// publishing-workflow.ts — 여러 채널을 한 태스크로 발행하고 결과를 모은다
export interface ChannelPublishOutcome {
  variantId: string; channelId: string;
  mode: "automatic" | "assisted" | "disabled";
  status: "published" | "failed" | "assisted_ready" | "blocked";
  record?: PublishingRecord;
  errorInfo?: string;
}
```

<!-- section: why -->
## 왜 이렇게 했나

- 채널마다 발행 방식이 다르다(WordPress는 API, 인스타는 사람이 수동). 공통 인터페이스
  `PublisherConnector` 뒤에 숨기면 워크플로는 채널을 몰라도 된다 → **전략 패턴**.
- 5개 채널 중 2개가 실패해도 나머지는 발행돼야 한다 → 결과를 `ChannelPublishOutcome[]` 로 **집계**
  (한 채널 실패가 전체를 막지 않음).
- `assisted` 모드는 발행 대신 `prepare()` 로 "사람이 붙여 넣을 패키지" 를 만든다(승인 경계).

<!-- section: framework_role -->
## 인터페이스가 대신하는 것

`publishing-workflow.ts` 는 `PublisherConnector[]` 만 받는다. 새 채널을 추가하려면 인터페이스를 구현한
클래스 하나를 배열에 넣으면 된다 — 워크플로 코드는 수정 없음(개방-폐쇄).

<!-- section: related_lesson -->
## 이어지는 Lesson

- `typescript/objects-interfaces-aliases/objects-interface-type-alias` — 인터페이스 계약
- `data-and-backend/nodejs-server/error-handling` — 부분 실패·에러 정보
- `data-and-backend/backend-integration/frontend-to-webserver-db` — 외부 시스템 연동

<!-- section: caution -->
## 주의점

- `publish()` 는 외부 호출이라 실패·타임아웃을 전제로 짠다 — 결과의 `status`/`errorInfo` 로 표현.
- 실제 채널 발행은 승인이 필요하다 — connector가 있다고 자동으로 나가지 않는다.

<!-- section: experiment -->
## 작은 실습

1. `PublisherConnector` 를 구현한 가짜 connector(항상 성공)를 만들어 워크플로에 넣어 보라.
2. connector 하나가 `publish()` 에서 throw할 때, 나머지 채널 결과가 어떻게 나오는지 확인하라.
3. `mode: "assisted"` connector가 `publish` 대신 무엇을 하는지 코드에서 찾아라.

<!-- section: check_question -->
## 이해 점검

1. 채널마다 발행 방식이 다른데 워크플로가 채널을 모를 수 있는 이유는?
2. 5채널 중 2개 실패 시 결과는 어떻게 표현되나?
3. `assisted` 모드가 하는 일은?

<!-- section: review -->
## 한 줄 정리

**발행 워크플로는 `PublisherConnector` 인터페이스 뒤로 채널별 차이를 숨기고, automatic/assisted/disabled
모드별 결과를 `ChannelPublishOutcome[]` 로 집계해 한 채널 실패가 전체를 막지 않게 한다.**
