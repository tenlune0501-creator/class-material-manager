---
id: tenlune-operations-agent/estimation-and-risk-modules
project: tenlune-operations-agent
title: 견적·기간·리스크 — 순수 함수 도메인 모듈
unit_kind: feature
feature_area: 견적/리스크
concepts: [순수 함수, 입력→출력 결정성, 테스트 용이성, 도메인 규칙 분리]
related_lessons:
  - javascript/language-basics/functions
  - react/testing/tdd-practice
  - typescript/functions-unions-guards/function-types
  - typescript/objects-interfaces-aliases/objects-interface-type-alias
---

<!-- section: role -->
## 이 코드가 하는 일

`src/domain/pricing.ts` · `duration.ts` · `risk.ts` — 기회 하나를 받아 각각 **견적 범위**, **영업일
기간 범위**, **리스크 등급(LOW/MEDIUM/HIGH)** 을 낸다. 셋 다 입력만으로 결정되는 **순수 함수** 다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
// pricing.ts — 복잡도 → 기본 범위 → 플랫폼 예산으로 상/하한 보정
export function estimatePrice(opportunity: Opportunity): PriceEstimate {
  const complexity = estimateComplexity(opportunity);          // 요건 수 + 키워드 가점
  const base = complexity === "low"  ? [800_000, 2_000_000]
             : complexity === "medium" ? [2_000_000, 6_000_000]
             : [6_000_000, 15_000_000];
  let [min, max] = base;
  if (opportunity.budget?.min || opportunity.budget?.max) {
    min = Math.max(Math.round(base[0] * 0.85), Math.round(budgetMin * 0.7));
    max = Math.min(Math.round(base[1] * 1.15), Math.round(budgetMax * 1.05));
  }
  return { platformBudget, tenluneRange: { min, max, currency: "KRW" }, rationale: [ /* 근거 목록 */ ] };
}

// risk.ts — 체크리스트로 점수를 쌓아 등급화
if (opportunity.description.length < 120 || opportunity.requirements.length < 2) add("요구사항이 불명확함", 2);
if (/급|긴급|즉시|이번 주|내일/.test(text)) add("납기가 과도하게 짧을 수 있음", 2);
if (/인증|개인정보|결제/.test(text)) add("인증/개인정보/결제 검토 필요", 2);
const level: RiskLevel = points >= 5 ? "HIGH" : points >= 2 ? "MEDIUM" : "LOW";
```

<!-- section: why -->
## 왜 순수 함수인가

- **결정성**: 같은 기회를 넣으면 항상 같은 견적·리스크가 나온다 → 리뷰 결과를 신뢰할 수 있다.
- **테스트 용이**: 파일·네트워크·시계에 의존하지 않으니 `estimatePrice(fixture)` 결과를 그대로 단언한다.
- **도메인 분리**: CLI·리포지토리와 섞이지 않는다 → 규칙만 따로 읽고 고칠 수 있다.
- 불확실한 항목은 **확정가가 아니라 범위** 로 남긴다(rationale에 명시).

<!-- section: framework_role -->
## 무엇을 라이브러리에 맡기지 않았나

견적·리스크 규칙은 도메인 지식이라 외부 라이브러리가 없다. `Math.max/min`, 정규식, 배열 길이만으로
규칙을 표현했다 — "도메인 로직은 직접, 보일러플레이트만 라이브러리" 의 예.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `javascript/language-basics/functions` — 순수 함수
- `react/testing/tdd-practice` — 순수 함수가 테스트하기 쉬운 이유
- `typescript/functions-unions-guards/function-types`, `.../objects-interface-type-alias` — 입력/출력 타입

<!-- section: caution -->
## 주의점

- 규칙 상수(범위 금액, 점수 임계값)를 바꾸면 조용히 결과가 달라진다 → 테스트로 고정한다.
- 이 값들은 "초기 견적" 이다 — 계약 확정가가 아니다(리스크 `rationale` 에도 그렇게 적혀 있다).

<!-- section: experiment -->
## 작은 실습

1. `risk.ts` 의 체크 항목을 표로 옮기고, 각 항목의 가점을 적어 `HIGH` 가 되는 최소 조합을 찾아라.
2. `estimateComplexity` 가 `high` 를 반환하는 기회를 하나 만들어 견적 범위를 확인하라.
3. `estimatePrice` 의 단위 테스트를 5줄로 작성하라(fixture → 기대 `tenluneRange`).

<!-- section: check_question -->
## 이해 점검

1. 이 세 모듈이 "순수 함수" 라서 얻는 이점 두 가지는?
2. 견적을 단일 금액이 아니라 범위로 내는 이유는?
3. 리스크 등급은 어떻게 결정되나?

<!-- section: review -->
## 한 줄 정리

**pricing·duration·risk는 기회 하나를 받아 견적 범위·기간·리스크 등급을 내는 순수 함수이며,
부수효과가 없어 그대로 테스트되고 결과가 결정적이라 리뷰를 신뢰할 수 있다.**
