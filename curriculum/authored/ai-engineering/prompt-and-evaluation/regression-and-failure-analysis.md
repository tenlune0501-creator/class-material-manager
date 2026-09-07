---
id: ai-engineering/prompt-and-evaluation/regression-and-failure-analysis
chapter: ai-engineering/prompt-and-evaluation
title: 회귀 평가와 실패·환각 분석
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [ai, evaluation, regression, hallucination, failure-analysis]
related_material_ids: []
sources:
  - title: "Reduce hallucinations"
    url: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Prompt engineering — Version prompts in code"
    url: https://developers.openai.com/api/docs/guides/prompt-engineering
    publisher: "OpenAI"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Intro | Promptfoo"
    url: https://www.promptfoo.dev/docs/intro/
    publisher: "promptfoo"
    checked_at: 2026-09-06
    source_type: community_reference
prerequisites:
  - ai-engineering/prompt-and-evaluation/evaluating-llm-output
code_examples:
  - slug: regression
    title: 회귀 평가 — 같은 평가셋으로 이전과 비교
    source_type: generated_minimal
    language: text
    code: |
      프롬프트/모델을 바꿀 때:
        1) 프롬프트는 앱 코드에 버전으로 둔다 (git). 픽스처·테스트를 "먼저" 만든다.
        2) 변경 전/후를 "같은 평가셋" 으로 돌려 지표를 비교한다.
        3) 전체 지표뿐 아니라 "이전엔 통과하던 케이스가 깨졌나" 를 본다.
        4) feature flag 로 점진 롤아웃, CI 에 평가를 태운다.
      모델 업그레이드 함정: 이전 모델용 "더 꼼꼼히 해" 류 프롬프트가 과도 발동(overtrigger).
                            회귀 평가로 잡는다.
  - slug: failure-classes
    title: 실패를 분류해서 각각 다르게 처방
    source_type: generated_minimal
    language: text
    code: |
      형식 위반      → 구조화 출력 기능 / 예시 강화
      지시 무시      → 지시 계층 정리 / 자기 검증 요구
      환각          → 아래 완화 기법
      톤            → 역할·톤 예시
      컨텍스트 미활용 → "먼저 관련 부분 인용" / 배치 조정
      latency·cost   → 모델 교체가 프롬프트보다 빠를 수 있다 (전부 프롬프트로 풀리는 게 아님)
  - slug: hallucination
    title: 환각 완화 (어느 것도 완전 제거는 못 함)
    source_type: generated_minimal
    language: text
    code: |
      기본:
        1) "모르면 모른다고 해" 를 명시적으로 허용
        2) 긴 문서는 word-for-word 인용을 먼저 뽑고, 그 인용에만 근거해 답
        3) 주장마다 근거 인용, 못 찾으면 그 주장을 철회
      고급:
        4) CoT 검증 — 단계별 추론을 먼저 말하게
        5) best-of-N — 여러 번 돌려 불일치 확인
        6) 반복 정제
        7) 외부 지식 제한 — "제공된 문서만 써"
      고위험 정보(의료·법률·금전)는 어떤 기법을 써도 항상 사람이 검증.
  - slug: self-correct
    title: 자기 교정 체인 (프롬프트 체이닝)
    source_type: generated_minimal
    language: text
    code: |
      draft  →  "기준 대비 리뷰하라" (별도 호출)  →  리팩터 (별도 호출)
      각 단계가 별도 API 호출이라 로깅·평가·분기가 가능하다.
      "끝내기 전에 성공 기준 대비 스스로 확인하라" 로 코딩·수학 오류를 상당수 잡는다.
      주의: "테스트만 통과시키려고 하드코딩" 하지 않게 프롬프트에 명시.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **회귀 평가**: 프롬프트/모델을 바꿀 때 **같은 평가셋으로 이전과 비교**해 "안 깨졌나" 를 확인한다.
- 실패를 **분류**(형식 위반 / 지시 무시 / 환각 / 톤 / 컨텍스트 미활용 / 지연·비용)해 각각 다르게 처방한다.
- **환각 완화 기법**(모른다 허용, 인용 grounding, CoT 검증, best-of-N, 외부 지식 제한)을 안다.
- **자기 교정 체인**(draft → 리뷰 → 리팩터)을 안다.
- 어떤 기법도 환각을 완전히 없애지 못하며 고위험 정보는 항상 사람이 검증함을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 성공 기준·평가셋·채점(앞 두 Lesson), 프롬프트를 개발 산출물로 다루기.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 프롬프트를 고쳐 A 케이스를 살렸는데 B 케이스가 조용히 깨졌다(회귀).
- 모델을 업그레이드했더니 이전엔 필요했던 "꼼꼼히 해" 지시가 과잉 반응한다.
- 환각이 나는데 "프롬프트를 더 세게" 만으로는 안 줄어든다.

<!-- section: concept -->
## 1. 회귀 평가

{{code: regression}}

- 프롬프트는 **코드에 버전으로**(git), 픽스처·테스트를 **먼저**, feature flag로 점진 롤아웃.
- 변경 전/후를 **같은 평가셋**으로 돌려 비교. 전체 지표 + **"이전에 통과하던 케이스가 깨졌나"**.
- CI에 평가를 태워 매 변경마다 자동으로.

<!-- section: mechanism -->
## 2. 실패 분류

{{code: failure-classes}}

**모든 실패가 프롬프트로 풀리는 건 아니다.** 지연·비용은 모델 교체가 더 빠를 수 있다.
실패를 위 범주로 나누고 각각에 맞는 처방을 쓴다.

<!-- section: concept | title: 환각 -->
## 3. 환각 완화

{{code: hallucination}}

- 기본 3(모른다 허용 / 인용 먼저 / 주장마다 근거) + 고급 4(CoT / best-of-N / 반복 정제 / 외부 지식 제한).
- **어떤 기법도 완전 제거는 못 한다.** 고위험 정보(의료·법률·금전)는 항상 사람 검증.

<!-- section: concept | title: 자기 교정 -->
## 4. 자기 교정 체인

{{code: self-correct}}

<!-- section: must_know -->
## 반드시 기억할 것

- **회귀 평가**: 프롬프트는 코드 버전 + 픽스처 먼저 + 같은 평가셋으로 전/후 비교 + CI.
- 모델 업그레이드 시 **overtrigger**(이전용 강한 지시가 과잉 반응)를 회귀로 잡는다.
- 실패를 **분류**(형식/지시 무시/환각/톤/컨텍스트/지연·비용)하고 각각 다르게 처방. 전부 프롬프트로 풀리지 않는다.
- 환각 완화: **모른다 허용 + 인용 grounding + 근거 없으면 주장 철회** (+ CoT/best-of-N/외부 지식 제한).
- **완전 제거 불가** — 고위험 정보는 사람 검증.
- 자기 교정 체인(draft → 기준 대비 리뷰 → 리팩터). "테스트만 통과시키려는 하드코딩" 금지 명시.

<!-- section: experiment -->
## 직접 해 보기

1. 평가셋을 통과율로 채점하는 스크립트를 CI 스텝처럼 만들고, 프롬프트를 고칠 때마다 실행하라.
2. 프롬프트 v2로 전체 accuracy는 올랐지만 특정 케이스가 깨진 상황을 재현하고, "케이스별 diff" 로 회귀를 잡아라.
3. 지식 베이스에 없는 질문에 대해 "모르면 모른다고 해" 를 넣기 전/후 환각률을 비교하라.
4. 같은 사실 질문을 5번 돌려 답이 흔들리면(best-of-N 불일치) 그걸 환각 신호로 로깅하라.
5. draft → "성공 기준 대비 스스로 리뷰" → 리팩터 3단계 체인을 만들어 코딩 태스크의 오류가 줄어드는지 보라.

<!-- section: check_question -->
## 이해 점검

1. 회귀 평가는 무엇을, 언제, 어떻게 비교하나?
2. 모델 업그레이드 시 "overtrigger" 란?
3. "모든 실패가 프롬프트로 풀리지 않는다" 의 예는?
4. 환각 완화 기본 3기법은? 완전히 없앨 수 있나?
5. 자기 교정 체인의 단계와, 각 단계를 별도 호출로 나누는 이점은?

<!-- section: interview_question -->
## 면접 대비

- "프롬프트/모델 변경 시 회귀를 어떻게 감지하고 CI에 통합하나요?"
- "LLM 환각을 줄이는 기법들과 각각의 한계는?"
- "프롬프트 체이닝(자기 교정)의 장점과, 언제 단일 프롬프트가 나은가요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 회귀 평가(코드 버전+픽스처 먼저+같은 평가셋 전후 비교+CI, overtrigger), 실패 분류별 처방,
> 환각 완화(모른다 허용·인용·근거 철회 + CoT/best-of-N/외부 지식 제한, 완전 제거 불가), 자기 교정 체인을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**프롬프트/모델을 바꿀 때는 같은 평가셋으로 전/후를 비교해 회귀(특히 모델 업그레이드의 overtrigger)를
잡고, 실패를 형식·지시 무시·환각·톤·컨텍스트·지연으로 분류해 각각 다르게 처방한다 — 환각은 모른다 허용·
인용 grounding·CoT·best-of-N으로 줄이되 완전히 없앨 수 없어 고위험 정보는 사람이 검증한다.**
