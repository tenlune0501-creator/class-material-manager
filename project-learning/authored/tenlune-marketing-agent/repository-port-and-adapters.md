---
id: tenlune-marketing-agent/repository-port-and-adapters
project: tenlune-marketing-agent
title: 리포지토리 포트와 어댑터 — 인메모리 ↔ Supabase
unit_kind: infra
feature_area: 데이터 저장
concepts: [포트-어댑터 패턴, 인터페이스에 의존, 테스트 더블, Node 에서 Supabase 접근, 매핑 계층]
related_lessons:
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
  - typescript/objects-interfaces-aliases/objects-interface-type-alias
  - typescript/typescript-in-practice/practice-project
  - data-and-backend/backend-integration/frontend-to-webserver-db
---

<!-- section: role -->
## 이 코드가 하는 일

`src/repositories/` — 마케팅 운영 상태를 저장/조회하는 계층. **포트 인터페이스 하나**
(`MarketingRepository`)에, 테스트·모의용 `InMemoryMarketingRepository` 와 실제
`SupabaseMarketingRepository`(+`supabase-mapping.ts`) 두 **어댑터** 가 같은 계약을 구현한다.
호출부(에이전트)는 어느 어댑터인지 모른다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
// marketing-repository.ts — 포트 (계약)
export interface MarketingRepository {
  getState(): MarketingState;
  listChannels(): ChannelRule[];
  listTasks(): MarketingTask[];
  listVariants(): ContentVariant[];
  listApprovals(): Approval[];
  listPublishingRecords(): PublishingRecord[];
  saveChannel(channel: ChannelRule): void;
  saveTask(task: MarketingTask): void;
  saveVariant(variant: ContentVariant): void;
  saveApproval(approval: Approval): void;
  savePublishingRecord(record: PublishingRecord): void;
  saveDecision(decision: AgentDecision): void;
  listDecisions(): AgentDecision[];
}

// supabase-mapping.ts — DB 행(snake_case) ↔ 도메인 타입(camelCase)
export interface ChannelRow {
  id: string; display_name: string; purpose: ChannelPurpose;
  operational_status: ChannelOperationalStatus; supported_formats: ContentFormat[];
  is_enabled: boolean; /* ... */
}
```

에이전트 생성자: `new MarketingAgent(repository)` — `repository` 타입은 **인터페이스**.

<!-- section: why -->
## 왜 이렇게 했나

- 테스트에서 실제 Supabase에 붙으면 느리고 불안정하다 → **인메모리 어댑터** 로 같은 계약을 만족시켜
  빠르게 돌린다(모의 시나리오 테스트).
- 저장소를 파일 → Supabase → 다른 DB로 바꿔도 **에이전트 코드는 그대로** — 어댑터만 교체.
- DB 스키마(snake_case, nullable)와 도메인 타입(camelCase)을 **매핑 함수** 로 분리(뷰어의 `db-map.ts` 와 같은 발상).

<!-- section: framework_role -->
## @supabase/supabase-js 가 대신하는 것 / 안 하는 것

- 대신: 인증·PostgREST 쿼리·재시도.
- 안 함: "우리 도메인의 `ChannelRule` 이 어떤 컬럼에 대응하는가" — 그건 `supabase-mapping.ts` 가 명시한다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/baas-supabase-firebase/supabase-in-a-real-project` — Node에서 Supabase
- `typescript/objects-interfaces-aliases/objects-interface-type-alias` — 인터페이스 계약
- `typescript/typescript-in-practice/practice-project` — 계층 조립

<!-- section: caution -->
## 주의점

- 포트를 잘게 쪼개지 말고 "에이전트가 실제로 부르는 메서드" 만 둔다 — 인터페이스가 비대해지면 어댑터 작성이 고통.
- 매핑 함수를 건너뛰고 DB 행을 도메인에 바로 넣으면 `null` 과 snake_case가 새어 나온다.

<!-- section: experiment -->
## 작은 실습

1. `MarketingRepository` 에 메서드를 하나 추가하고, 두 어댑터가 다 구현해야 컴파일되는 것을 확인하라.
2. 테스트가 `InMemoryMarketingRepository` 를 쓰는 부분을 찾아, 왜 실제 Supabase를 안 쓰는지 설명하라.
3. `supabase-mapping.ts` 에서 `ChannelRow → ChannelRule` 변환 함수를 찾아 필드 대응을 표로 적어라.

<!-- section: check_question -->
## 이해 점검

1. 에이전트 생성자가 구체 클래스가 아니라 인터페이스를 받는 이유는?
2. 인메모리 어댑터가 존재하는 이유는?
3. 매핑 계층이 없으면 도메인 코드에 무엇이 새어 나오나?

<!-- section: review -->
## 한 줄 정리

**하나의 `MarketingRepository` 포트에 인메모리·Supabase 두 어댑터가 같은 계약을 구현하고, `supabase-mapping.ts`
가 행↔도메인 형변환을 맡아 에이전트 코드가 저장소 구현을 모르게 한다.**
