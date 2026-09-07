---
id: ai-engineering/prompt-and-evaluation/evaluating-llm-output
chapter: ai-engineering/prompt-and-evaluation
title: 채점 방법 — 코드·유사도·LLM-as-judge·사람
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [ai, evaluation, llm-as-judge, grading, deterministic]
related_material_ids: []
sources:
  - title: "Define success criteria and build evaluations (grading methods)"
    url: https://platform.claude.com/docs/en/test-and-evaluate/define-success
    publisher: "Anthropic"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Assertions and Metrics — LLM Output Validation"
    url: https://www.promptfoo.dev/docs/configuration/expected-outputs/
    publisher: "promptfoo"
    checked_at: 2026-09-06
    source_type: community_reference
  - title: "Evaluate on the Hub (metrics catalog)"
    url: https://huggingface.co/docs/evaluate/index
    publisher: "Hugging Face"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - ai-engineering/prompt-and-evaluation/defining-success-and-evals
code_examples:
  - slug: ladder
    title: 채점 방법 — 싼 것부터
    source_type: generated_minimal
    language: text
    code: |
      1) 코드 기반 (가장 싸고 재현 가능)
         exact match (정답이 범주형) · regex · JSON 스키마 검증 · Levenshtein 거리
         · latency/cost 임계값 · 커스텀 함수(js/python)
      2) 유사도
         문장 임베딩 코사인 유사도(일관성: 패러프레이즈에 비슷하게 답하나)
         · ROUGE-L / BLEU (요약·번역)
      3) LLM-as-judge (코드로 못 재는 것: 톤·공감·근거 충실도)
         Likert 1~5 · 이진(yes/no) · 루브릭 채점 · CoT 채점(g-eval)
      4) 사람 평가 (주관적·고위험 기준의 최종 기준선)
      => 코드로 되면 코드로. LLM/사람은 코드로 안 되는 것만.
  - slug: code-grade
    title: 코드 기반 채점
    source_type: generated_minimal
    language: js
    code: |
      const cases = loadJsonl("evalset.jsonl");
      let tp = 0, total = cases.length;
      for (const c of cases) {
        const out = await runModel(c.input);          // 프롬프트 v3
        const label = out.trim().toLowerCase();
        if (label === c.expected) tp++;               // exact match
      }
      console.log("accuracy", tp / total);            // 임계값과 비교: >= 0.85 ?
  - slug: llm-judge
    title: LLM-as-judge — 규칙
    source_type: generated_minimal
    language: text
    code: |
      - 피평가 모델과 "다른 모델" 로 채점 (자기 채점 편향)
      - 루브릭을 명확히 (무엇이 3점, 무엇이 5점인지 예와 함께)
      - 출력 형식 고정: 숫자만 / yes·no 만 (판정 파싱 쉽게)
      - 필요하면 few-shot 채점 예시
      - 알려진 편향: 위치 편향, 장황함 선호, 자기 모델 선호 → 페어와이즈·교차검증으로 보정
  - slug: deterministic
    title: 결정적 vs 확률적
    source_type: generated_minimal
    language: text
    code: |
      일반 유닛 테스트: 같은 입력 → 같은 출력 (결정적).
      LLM 출력은 확률적 → 채점을 "통과율/임계값" 으로:  "95%가 < 200ms", "F1 ≥ 0.85"
        + 같은 프롬프트를 N번 돌려 분산을 본다 (best-of-N 불일치 = 환각 신호)
        + temperature 낮추거나 검색 grounding 으로 일관성↑
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 채점 방법을 **코드 기반 → 유사도 → LLM-as-judge → 사람** 순(싼 것 우선)으로 고른다.
- **코드 기반 채점**(exact match, regex, JSON 스키마, 거리, latency/cost)을 직접 짠다.
- **LLM-as-judge** 의 규칙(다른 모델로, 명확한 루브릭, 형식 고정)과 편향을 안다.
- LLM 출력이 **확률적**이라는 전제 위에서 채점을 **통과율/임계값**으로 표현한다.
- (참고) OpenAI Evals 플랫폼 API는 폐기 예정 — 특정 SaaS가 아니라 "평가셋 + 채점 함수" 개념으로 간다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 성공 기준·평가셋(앞 Lesson), 임베딩·코사인 유사도, JS/TS로 스크립트 작성.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

평가셋은 만들었는데 "이 출력이 정답인가" 를 어떻게 자동으로 판정하지? 감정 라벨은 문자열 비교로
되지만, "요약이 원문에 충실한가", "톤이 공감적인가" 는 문자열 비교로 안 된다.

<!-- section: concept -->
## 1. 채점 방법 사다리

{{code: ladder}}

**코드로 잴 수 있으면 코드로.** LLM/사람은 코드로 못 재는 것(톤, 근거 충실도, 창의성)에만 쓴다 —
느리고 비싸고 편향이 있으므로.

<!-- section: code | lang: js -->
## 2. 코드 기반 채점

{{code: code-grade}}

- **exact match**(정답이 범주형), **regex**(형식), **JSON 스키마 검증**, **문자열 거리**(Levenshtein),
  **latency/cost 임계값**, **커스텀 함수**.
- 결과를 accuracy/F1 등으로 집계해 **성공 기준의 임계값과 비교**.

<!-- section: mechanism -->
## 3. LLM-as-judge

{{code: llm-judge}}

- **피평가 모델과 다른 모델**로 채점(자기 채점 편향). **루브릭**을 예와 함께 명확히.
  **출력 형식 고정**(숫자만/yes·no) → 판정 파싱이 쉽다. 필요하면 few-shot.
- 알려진 편향: **위치 편향, 장황함 선호, 자기 모델 선호** → 페어와이즈 비교·심판 교차검증으로 보정.
- 유사도 채점: 임베딩 코사인(일관성), ROUGE-L/BLEU(요약·번역) — 각 지표의 한계는 HF 지표 카드 참고.

<!-- section: concept | title: 확률적 -->
## 4. 결정적 vs 확률적

{{code: deterministic}}

일반 유닛 테스트는 "같은 입력 → 같은 출력". LLM은 확률적이라:
- 채점을 **통과율/임계값**으로("95%가 < 200ms", "F1 ≥ 0.85").
- 같은 프롬프트를 **N번** 돌려 분산을 본다. best-of-N 불일치가 크면 환각 신호.
- temperature를 낮추거나 검색 grounding으로 일관성을 높인다.

<!-- section: must_know -->
## 반드시 기억할 것

- 채점 사다리: **코드 기반 → 유사도 → LLM-as-judge → 사람.** 코드로 되면 코드로.
- 코드 기반: exact match / regex / JSON 스키마 / Levenshtein / latency·cost / 커스텀 함수.
- LLM-as-judge: **다른 모델로**, 명확한 루브릭, **출력 형식 고정**. 위치·장황함·자기 모델 편향 주의.
- LLM은 확률적 → 채점을 **통과율/임계값**으로, **N번 돌려 분산** 확인.
- 지표 한계(ROUGE/BLEU가 못 잡는 것)를 안다 — HF 지표 카드.
- 특정 평가 SaaS에 의존하지 않는다("평가셋 + 채점 함수"). OpenAI Evals 플랫폼 API는 폐기 예정.

<!-- section: experiment -->
## 직접 해 보기

1. 감정 분류 평가셋 30건을 exact match로 자동 채점하는 스크립트를 짜고 accuracy를 출력하라.
2. 프롬프트 v1/v2에 같은 스크립트를 돌려 어느 쪽이 임계값(0.85)을 넘는지 비교하라.
3. 요약 태스크에서 exact match가 무의미한 걸 확인하고, 임베딩 코사인 유사도 채점으로 바꿔라.
4. "톤이 공감적인가" 를 LLM-as-judge(다른 모델, yes/no)로 채점하는 프롬프트를 만들어라. 루브릭을 붙이기 전/후 판정 안정성을 비교.
5. 같은 입력을 5번 돌려 판정이 흔들리는 케이스를 찾고, temperature를 낮춰 안정되는지 보라.

<!-- section: check_question -->
## 이해 점검

1. 채점 방법을 고르는 우선순위와 이유는?
2. exact match가 안 맞는 태스크의 예와, 그때 쓰는 방법은?
3. LLM-as-judge에서 지켜야 할 규칙 3가지는? 알려진 편향은?
4. LLM 출력이 확률적이라 채점을 어떻게 표현하나?
5. 같은 프롬프트를 여러 번 돌려 보는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "LLM 출력을 자동 채점하는 방법들과 각각의 신뢰도·비용은?"
- "LLM-as-judge의 편향과 이를 완화하는 기법은?"
- "확률적 출력을 어떻게 테스트에 담나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 채점 사다리(코드→유사도→LLM judge→사람), 코드 기반 종류, LLM judge 규칙+편향,
> 확률적이라 통과율/임계값 + N번, SaaS 비의존을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**출력 채점은 코드 기반(exact match·regex·스키마·거리·지연/비용)을 우선하고, 코드로 못 재는 톤·충실도만
LLM-as-judge(다른 모델·명확한 루브릭·형식 고정, 편향 주의)나 사람으로 한다 — LLM은 확률적이라 채점을
통과율/임계값으로 표현하고 여러 번 돌려 분산을 본다.**
