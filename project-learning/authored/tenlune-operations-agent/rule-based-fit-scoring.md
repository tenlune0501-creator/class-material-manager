---
id: tenlune-operations-agent/rule-based-fit-scoring
project: tenlune-operations-agent
title: 규칙 기반 적합도 점수 — 0~100
unit_kind: feature
feature_area: 적합도 분석
concepts: [규칙 기반 점수화, 키워드 가중치, 결과 등급화, 판정에 근거 첨부]
related_lessons:
  - ai-engineering/rag-and-agents/agents-intro
  - ai-engineering/prompt-and-evaluation/defining-success-and-evals
  - javascript/objects-and-builtins/array-methods
  - javascript/language-basics/conditionals
---

<!-- section: role -->
## 이 코드가 하는 일

`src/domain/scoring.ts` + `delivery-model.ts` — 외주 기회 하나를 받아 **0~100 점** 의 Tenlune 적합도와
`recommend` / `review` / `hold` 판정을, **이유·주의사항과 함께** 낸다. LLM 없이 순수 규칙이다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
const HIGH_MATCH = ["wordpress", "워드프레스", "홈페이지", "랜딩", "반응형",
  "next.js", "react", "supabase", "postgres", "관리자", "문의", "예약", "api", "자동화", "ai"];
const CONDITIONAL = ["인증", "회원", "결제", "데이터 이전", "레거시", "유지보수", "외부 api", "llm"];
const LOW_MATCH = ["android", "ios", "앱", "게임", "3d", "erp", "임베디드", "블록체인"];

export function scoreOpportunity(opportunity: Opportunity): FitScore {
  const delivery = classifyDeliveryModel(opportunity);      // ① 납품형 프로젝트인가?
  if (delivery.model !== "project_delivery") {
    return { score: delivery.model === "unclear" ? 45 : 25, recommendation: "hold", /* ... */ };
  }
  // ② 텍스트에서 HIGH/CONDITIONAL/LOW 키워드를 세어 가감점
  // ③ score → recommend(높음) / review(중간) / hold(낮음), 항상 reasons + cautions 첨부
}
```

<!-- section: why -->
## 왜 규칙인가

- 적합도 기준이 **명확하고 안정적** 이다(우리가 잘하는 스택 vs 못하는 스택). 규칙이면 매번 같은 입력에
  같은 점수가 나오고, "왜 이 점수?" 를 이유 목록으로 설명할 수 있다.
- **2단계 판정**: 먼저 "납품형 개발 프로젝트인가" 를 가른다(단순 상담·컨설팅·운영대행이면 스택과
  무관하게 hold). 그 뒤에 기술 적합도를 본다.
- 등급화(`recommend`/`review`/`hold`)로 사람이 빠르게 분류한다.

<!-- section: framework_role -->
## LLM을 안 쓴 자리

이건 "에이전트가 판단을 내리는" 부분이지만 LLM이 아니라 규칙이 한다. LLM은 초안 문구 생성 같은
**자연어가 필요한 곳** 에만 쓰고, 점수 같은 **결정적이어야 하는 곳** 은 규칙이 맡는다(Tenlune AI 견적과 같은 원칙).

<!-- section: related_lesson -->
## 이어지는 Lesson

- `ai-engineering/rag-and-agents/agents-intro` — 에이전트의 판단 단계
- `ai-engineering/prompt-and-evaluation/defining-success-and-evals` — "무엇이 좋은 결과인가" 를 규칙으로
- `javascript/objects-and-builtins/array-methods`, `.../conditionals` — 키워드 매칭·가감점

<!-- section: caution -->
## 주의점

- 키워드 목록이 곧 정책이다 — 한 곳(`scoring.ts`)에서만 관리한다.
- 규칙 점수는 "1차 선별" 이다. 최종 지원 여부는 사람이 상세 정보를 보고 정한다(`hold`/`review` 의 의미).

<!-- section: experiment -->
## 작은 실습

1. `HIGH_MATCH` 에 키워드를 하나 추가하고, 그 단어가 든 기회의 점수가 오르는지 확인하라.
2. `classifyDeliveryModel` 이 `unclear` 를 반환하는 조건을 코드에서 찾아라.
3. 같은 판정을 "LLM에게 물어본다" 로 바꿨을 때 생기는 문제(재현성·설명)를 적어라.

<!-- section: check_question -->
## 이해 점검

1. 점수화를 규칙으로 한 이유 두 가지는?
2. "납품형 프로젝트인가" 를 먼저 가르는 이유는?
3. 판정에 항상 `reasons` 를 붙이는 이유는?

<!-- section: review -->
## 한 줄 정리

**적합도 점수는 먼저 납품형 프로젝트인지 가른 뒤 HIGH/CONDITIONAL/LOW 키워드로 0~100점을 매기고
recommend/review/hold + 이유를 낸다 — 결정적이어야 하는 판단은 LLM이 아니라 규칙이 맡는다.**
