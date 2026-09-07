---
id: tenlune-marketing-agent/domain-model-string-unions
project: tenlune-marketing-agent
title: 도메인 모델 — 문자열 리터럴 유니온과 interface
unit_kind: data_model
feature_area: 도메인 모델
concepts: [문자열 리터럴 유니온, 판별 유니온, interface 모델링, 타입으로 상태 제약]
related_lessons:
  - typescript/functions-unions-guards/unions-and-type-guards
  - typescript/objects-interfaces-aliases/objects-interface-type-alias
  - typescript/setup-and-basic-types/basic-types-and-inference
---

<!-- section: role -->
## 이 코드가 하는 일

`src/domain/types.ts` — 마케팅 도메인의 모든 개념을 **타입으로** 규정한다. 채널·태스크 상태·결정
종류를 **문자열 리터럴 유니온** 으로, 상태 엔티티를 `interface` 로 모델링한다. 잘못된 값이 컴파일
단계에서 걸린다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
export type ChannelId =
  | "website" | "naver_blog" | "instagram" | "threads"
  | "facebook" | "linkedin" | "kmong" | "soomgo" | "daangn" | "disquiet";

export type TaskStatus =
  | "idea" | "drafting" | "review" | "approved"
  | "publishing" | "published" | "failed" | "archived";

export type DecisionType =
  | "create_content_task" | "prepare_channel_variant"
  | "request_review" | "publish_approved_content" | "monitor_results";

export interface ChannelRule {
  channelId: ChannelId;
  displayName: string;
  purpose: ChannelPurpose;                 // 또 다른 유니온
  operationalStatus: ChannelOperationalStatus;
  role: ChannelRole;
  supportedFormats: ContentFormat[];
  isEnabled: boolean;
  publishMode: ChannelPublishMode;         // "automatic" | "assisted" | "disabled"
}
```

<!-- section: why -->
## 왜 이렇게 했나

- `status: string` 이면 `"pubished"`(오타)도 컴파일된다. **리터럴 유니온** 이면 IDE가 자동완성하고
  잘못된 값에 빨간 줄이 뜬다.
- 상태 전이(`idea → drafting → review → …`)를 함수가 유니온으로 받으면, 존재하지 않는 상태를 실수로
  다룰 수 없다.
- `interface` 로 엔티티 모양을 고정하면, 리포지토리·에이전트·매핑 계층이 **같은 계약** 을 공유한다.

<!-- section: framework_role -->
## TypeScript 가 대신하는 것

런타임 검증 코드(`if (status !== "idea" && status !== ...) throw`)를 안 짜도 컴파일러가 잡는다.
`node` 는 이 타입을 실행 시점에 그냥 지우고 돌린다(type stripping) — 비용 0.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `typescript/functions-unions-guards/unions-and-type-guards` — 유니온·좁히기·판별 유니온
- `typescript/objects-interfaces-aliases/objects-interface-type-alias` — interface vs type
- `typescript/setup-and-basic-types/basic-types-and-inference` — 리터럴 타입

<!-- section: caution -->
## 주의점

- 리터럴 유니온이 길어지면(채널 10개) 한 곳에서만 정의하고 재사용한다 — 여러 파일에 복붙하면 어긋난다.
- 유니온에 값을 추가하면 그 값을 다루지 않는 `switch` 가 **컴파일 에러** 로 드러난다(이게 장점이다).

<!-- section: experiment -->
## 작은 실습

1. `TaskStatus` 에 `"scheduled"` 를 추가하고, 그 값을 처리하지 않는 `switch` 에서 에러가 나는지 확인하라.
2. `ChannelRule.channelId: string` 으로 바꾸고 오타 `"webiste"` 가 통과하는 것을 확인한 뒤 되돌려라.
3. `publishMode` 유니온을 좁히는(`if (mode === "automatic")`) 코드를 `marketing-agent.ts` 에서 찾아라.

<!-- section: check_question -->
## 이해 점검

1. `type Status = string` 대신 리터럴 유니온을 쓰면 무엇이 좋아지나?
2. 유니온에 새 값을 추가했을 때 컴파일러가 알려 주는 것은?
3. 이 타입들은 런타임에 어떻게 되나?

<!-- section: review -->
## 한 줄 정리

**도메인 모델은 채널·상태·결정을 문자열 리터럴 유니온으로, 엔티티를 interface로 규정해 잘못된 값·처리
누락을 컴파일 단계에서 잡으며, 런타임 비용은 0이다.**
