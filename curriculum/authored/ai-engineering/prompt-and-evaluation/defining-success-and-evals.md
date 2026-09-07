---
id: ai-engineering/prompt-and-evaluation/defining-success-and-evals
chapter: ai-engineering/prompt-and-evaluation
title: 성공 기준 정의와 평가셋 만들기
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [ai, evaluation, success-criteria, eval-set, metrics]
related_material_ids: []
sources:
  - title: "Define success criteria and build evaluations"
    url: https://platform.claude.com/docs/en/test-and-evaluate/define-success
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Working with evals"
    url: https://developers.openai.com/api/docs/guides/evals
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - ai-engineering/prompt-and-evaluation/prompting-as-development
  - react/testing/tdd-practice
code_examples:
  - slug: bad-good
    title: 나쁜 기준 vs 좋은 기준
    source_type: generated_minimal
    language: text
    code: |
      ❌ "모델이 감정 분류를 잘한다"           (측정 불가, 언제 통과인지 모름)
      ✅ "다양한 트윗 10,000개에서 F1 ≥ 0.85   (베이스라인 대비 +5%p)"

      SMART: Specific · Measurable · Achievable(벤치마크 근거) · Relevant
  - slug: multidim
    title: 대부분 여러 기준을 동시에
    source_type: generated_minimal
    language: text
    code: |
      task fidelity : F1 ≥ 0.85
      safety        : 비독성 응답 ≥ 99.5%
      오류 심각도   : 오답의 90%는 "사소" 등급
      latency       : 95% 요청이 < 200ms
      price         : 호출당 예산 이하
      # 지표는 성공 기준과 1:1. 기준 없는 지표는 수집하지 않는다.
  - slug: evalset
    title: 평가셋 설계 3원칙
    source_type: generated_minimal
    language: text
    code: |
      1) task-specific : 실제 사용 분포를 반영 + 엣지 케이스
                         (빈/없는 입력, 과도하게 긴 입력, 모호·비꼬는 문장, 화난 사용자)
      2) 자동화 가능한 구조 : 객관식 / 문자열 매치 / 코드 채점 / LLM 채점 (JSONL + ground truth)
      3) 양 > 질 : 자동 채점 문항을 많이 두는 게 손채점 소수보다 낫다 (약간 낮은 신호는 감수)
  - slug: jsonl
    title: 평가셋 파일 (JSONL) 예
    source_type: generated_minimal
    language: json
    code: |
      {"input": "배송 진짜 빨랐어요 ㅋㅋ", "expected": "positive"}
      {"input": "뭐 그냥 샀어요", "expected": "neutral"}
      {"input": "안 오길래 문의했더니 답도 없네요~", "expected": "negative"}
      {"input": "좋다고 해야 하나... 반은 맞고 반은 별로", "expected": "neutral"}
      {"input": "", "expected": "neutral"}
      // 한 줄 = 한 케이스. expected(정답 라벨)로 자동 채점.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 애플리케이션의 **성공 기준을 SMART 하게**(측정 가능한 숫자 + 베이스라인) 정의한다.
- 대부분 **여러 기준을 동시에**(정확도·안전·오류 심각도·지연·비용) 잡아야 함을 안다.
- **평가셋(eval set)** 을 3원칙(task-specific + 엣지 케이스 / 자동화 가능 구조 / 양 > 질)으로 설계한다.
- 지표는 성공 기준과 **1:1** 로만 수집한다.
- **평가가 프롬프트 튜닝보다 먼저** 존재해야 한다는 원칙을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 프롬프트를 개발 산출물로 다루기(앞 Lesson), "검증할 것을 먼저 정의한다" 는 테스트 사고(react/testing).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"프롬프트를 이렇게 바꾸니 더 나아진 것 같아" — **느낌**으로 튜닝하면, 어떤 변경이 정말 좋은지 모르고,
한쪽을 고치다 다른 쪽을 망가뜨린다(회귀). 먼저 **"무엇이 성공인가"** 를 숫자로 정하고, 그걸 재는
**평가셋**을 만들어야 한다.

<!-- section: concept -->
## 1. 성공 기준 (SMART)

{{code: bad-good}}

- "잘한다" 는 기준이 아니다. **다양한 입력 N개에서 지표 X ≥ 값 (베이스라인 대비 +Δ)**.
- **Achievable**: 벤치마크·기존 시스템·인간 성능을 근거로 현실적인 목표를.

<!-- section: mechanism -->
## 2. 다차원

{{code: multidim}}

거의 항상 한 지표로는 부족하다. 정확도만 올리다 지연·비용이 폭증하거나 안전이 깨진다.
**성공 기준을 여러 개** 세우고, 각각을 재는 지표를 1:1로 붙인다. 기준 없는 지표는 수집하지 않는다.

<!-- section: concept | title: 평가셋 -->
## 3. 평가셋 설계

{{code: evalset}}

{{code: jsonl}}

- **task-specific**: 실제 사용 분포 + 엣지 케이스(빈 입력, 긴 입력, 비꼼, 혼합 감정, 화난 사용자).
- **자동화 가능**: 코드/LLM이 채점할 수 있게 구조화(정답 라벨 포함). JSONL 한 줄 = 한 케이스.
- **양 > 질**: 자동 채점 100문항이 손채점 10문항보다 낫다. 자동화의 약간 낮은 신호는 감수한다.

<!-- section: concept | title: 순서 -->
## 4. 평가가 먼저

성공 기준 → 평가셋 → **그다음** 프롬프트 엔지니어링. 이 순서(Anthropic의 사이클)를 지켜야
"바꿨더니 좋아졌나?" 에 숫자로 답할 수 있다. (OpenAI Evals 같은 특정 SaaS 콘솔에 의존하지 말고
**"평가셋 + 채점 함수"** 라는 개념 자체를 붙잡는다 — 다음 Lesson.)

<!-- section: must_know -->
## 반드시 기억할 것

- 성공 기준 = **SMART**(측정 가능한 지표 + 값 + 베이스라인). "잘한다" 는 기준이 아니다.
- **다차원**: 정확도 + 안전 + 오류 심각도 + 지연 + 비용. 지표는 기준과 1:1.
- 평가셋 3원칙: **실제 분포 + 엣지 케이스 / 자동 채점 가능 / 양 > 질**.
- 엣지 케이스: 빈 입력, 과장 입력, 모호·비꼼, 혼합, 화난 사용자.
- 순서: **성공 기준 → 평가셋 → 프롬프트 튜닝.** 평가가 먼저.
- 특정 평가 SaaS에 종속되지 않는다 — "평가셋 + 채점 함수" 개념 중심.

<!-- section: experiment -->
## 직접 해 보기

1. 만들려는 LLM 기능 하나에 대해 성공 기준을 SMART로 3개(정확도/안전/지연 또는 비용) 적어라.
2. 각 기준에 지표를 1:1로 붙여라. 기준 없이 "그냥 궁금해서" 재던 지표가 있으면 지워라.
3. 그 기능의 평가셋을 JSONL로 30줄 만들어라. 그중 10줄은 엣지 케이스로.
4. 평가셋에 정답 라벨을 붙일 수 없는 케이스가 있으면, 자동 채점 가능한 형태로 바꿀 수 있는지 고민하라.
5. "느낌으로 프롬프트를 5번 고친 기록" 을 떠올려, 만약 이 평가셋이 있었다면 어떤 결정이 달랐을지 적어라.

<!-- section: check_question -->
## 이해 점검

1. "모델이 요약을 잘한다" 를 SMART 기준으로 바꾸면?
2. 왜 지표를 여러 개 세워야 하나? 예를 들면?
3. 평가셋 3원칙은? "양 > 질" 이 무슨 뜻인가?
4. 평가셋에 꼭 넣어야 하는 엣지 케이스의 예는?
5. 성공 기준·평가셋·프롬프트 튜닝의 순서와 이유는?

<!-- section: interview_question -->
## 면접 대비

- "LLM 기능의 성공 기준을 어떻게 정의하나요? 다차원 기준의 예는?"
- "평가 데이터셋을 어떻게 구성하고, 엣지 케이스를 어떻게 발굴하나요?"
- "'평가가 프롬프트 튜닝보다 먼저' 라는 원칙의 근거는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> SMART 성공 기준(지표+값+베이스라인), 다차원(정확도·안전·지연·비용, 기준과 1:1),
> 평가셋 3원칙(분포+엣지/자동/양>질), 순서(기준→평가셋→튜닝)를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**LLM 기능은 먼저 SMART 한 다차원 성공 기준(정확도·안전·지연·비용을 숫자로)을 정하고, 실제 분포 +
엣지 케이스를 담은 자동 채점 가능한 평가셋(양 > 질)을 만든 뒤에 프롬프트를 튜닝한다 — 평가가 튜닝보다
먼저다.**
