---
id: ai-engineering/prompt-and-evaluation/structured-and-fewshot
chapter: ai-engineering/prompt-and-evaluation
title: 구조적 출력과 few-shot
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [ai, prompt-engineering, few-shot, structured-output, context-design]
related_material_ids: []
sources:
  - title: "Claude prompting best practices"
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Prompt engineering (few-shot, formatting)"
    url: https://developers.openai.com/api/docs/guides/prompt-engineering
    publisher: "OpenAI"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Increase output consistency"
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/increase-consistency
    publisher: "Anthropic"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - ai-engineering/prompt-and-evaluation/prompting-as-development
  - ai-engineering/llm-app-fundamentals/structured-outputs
code_examples:
  - slug: structure-tags
    title: 구획을 태그로 분리
    source_type: generated_minimal
    language: text
    code: |
      <instructions>
      아래 리뷰를 분류하라. 출력은 감정(positive/neutral/negative)과 이유 한 문장.
      </instructions>

      <examples>
      <example><input>배송 빨랐어요</input><output>positive | 배송 속도</output></example>
      <example><input>그냥 그래요</input><output>neutral | 특별한 언급 없음</output></example>
      <example><input>포장이 다 찢어져 왔네요</input><output>negative | 파손 배송</output></example>
      </examples>

      <input>{{리뷰}}</input>
      # 지시·예시·입력을 태그로 감싸면 모델이 경계를 헷갈리지 않는다. 태그 이름은 일관되게.
  - slug: fewshot
    title: few-shot — 예시 3~5개
    source_type: generated_minimal
    language: text
    code: |
      좋은 예시의 3요소:
        관련성 : 실제 use case 를 닮게 (극단적/희귀 케이스만 넣지 않기)
        다양성 : 엣지 케이스 포함 (혼합 감정, 비꼼, 빈 입력) → 모델이 엉뚱한 패턴을 학습 안 하게
        구조   : <example> 태그로 지시와 분리, 출력 형식을 예시로 "보여줌"
      "하지 마" 보다 "이렇게 해" — 원하는 출력을 예시로 제시하는 게 금지어 나열보다 강하다.
      (reasoning 모델은 zero-shot 먼저, 안 되면 few-shot)
  - slug: format-choice
    title: 형식 강제 — 무엇으로 하나
    source_type: generated_minimal
    language: text
    code: |
      스키마를 반드시 지켜야 함  → Structured Outputs 기능 (프롬프트 기법 아님)
      유연한 형식 일관성        → 프롬프팅: 예시로 형식 제시 + "출력은 X 형식만"
      prefill(assistant 턴 미리 채우기)은 최신 모델에서 미지원 → 위 두 방법으로 대체
  - slug: long-context
    title: 긴 컨텍스트 배치
    source_type: generated_minimal
    language: text
    code: |
      20k+ 토큰 입력이면: 긴 문서를 프롬프트 "맨 위", 질문·지시·예시는 그 "아래".
        (출처 측정치: 질문을 끝에 두면 품질이 최대 ~30% 향상 — 인용일 뿐, 규칙으로 단정 금지)
      다중 문서는 <document><source>...</source><document_content>...</document_content></document>.
      긴 문서 과제: "먼저 관련 부분을 그대로 인용하게" 한 뒤 그 인용에만 근거해 답하게(grounding).
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 지시·예시·입력을 **태그로 구획**해 오해석을 줄인다.
- **few-shot**(예시 3~5개)의 3요소(관련성·다양성·구조)를 알고, "하지 마" 대신 "이렇게 해" 를 쓴다.
- 형식 강제를 **Structured Outputs 기능 vs 프롬프팅** 중 상황에 맞게 고른다.
- **긴 컨텍스트 배치**(긴 문서 위, 질문 아래)와 다중 문서 태깅을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 프롬프트 기본기·지시 계층(앞 Lesson), 구조화 출력 기능(JSON Schema).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

프롬프트에 지시·배경·예시·실제 입력을 줄글로 뭉쳐 놓으면 모델이 "어디까지가 지시고 어디부터가
데이터인지" 를 헷갈린다. 출력 형식도 매번 조금씩 다르다.

<!-- section: concept -->
## 1. 구획을 태그로

{{code: structure-tags}}

- 지시(`<instructions>`), 예시(`<examples>`), 입력(`<input>`)을 각각 태그로 감싼다.
  태그 이름은 **일관되게**, 자연스러운 계층이 있으면 중첩.
- Markdown 헤더/리스트로도 논리적 경계를 만들 수 있다. 재사용 블록은 앞쪽에 둬서 prompt caching 이득.

<!-- section: mechanism -->
## 2. few-shot

{{code: fewshot}}

- 잘 만든 예시 3~5개가 **형식·톤·구조를 잡는 가장 신뢰도 높은 수단**이다.
- 3요소: **관련성**(실제 use case를 닮게), **다양성**(엣지 케이스 포함 — 모델이 엉뚱한 패턴을 학습 못 하게),
  **구조**(`<example>` 로 지시와 분리, 출력 형식을 예시로 보여줌).
- **"하지 마" 나열보다 "이렇게 해" 예시**가 강하다.

<!-- section: concept | title: 형식 -->
## 3. 형식 강제

{{code: format-choice}}

- **스키마를 반드시** 지켜야 하면 프롬프트 기법이 아니라 **Structured Outputs 기능**(앞 챕터).
- 유연한 형식 일관성이면 프롬프팅(예시 + "출력은 X 형식만").
- 예전 방식인 prefill(assistant 턴 미리 채우기)은 최신 모델에서 미지원 → 위 두 방법으로.

<!-- section: concept | title: 긴 컨텍스트 -->
## 4. 긴 컨텍스트

{{code: long-context}}

<!-- section: must_know -->
## 반드시 기억할 것

- 지시·예시·입력을 **태그로 구획**. 태그 이름 일관되게.
- few-shot: **예시 3~5개**, 관련성 + 다양성(엣지 케이스) + 구조. **"이렇게 해" > "하지 마".**
- 스키마 필수면 **Structured Outputs 기능**, 유연하면 프롬프팅. prefill은 이제 안 씀.
- 긴 입력(20k+): **긴 문서 맨 위, 질문·지시 아래**. 다중 문서는 `<document>` 태깅.
- 긴 문서 과제는 "관련 부분 인용 먼저" 로 grounding.
- 벤더 측정치("질문 끝에 두면 +30%", "예시 3~5개")는 **인용일 뿐** — 규칙으로 단정하지 않고 평가로 확인.

<!-- section: experiment -->
## 직접 해 보기

1. 감정 분류 프롬프트를 태그 구획 없이 / 있게 두 버전으로 만들어 출력 일관성을 비교하라.
2. few-shot 예시를 0개 / 2개(비슷한 것만) / 4개(다양하게) 로 바꿔 결과를 비교하라.
3. "말줄임표 쓰지 마, 이모지 쓰지 마, ~하지 마" 나열 프롬프트를 "원하는 출력 예시 3개" 로 바꿔 보라.
4. 스키마를 반드시 지켜야 하는 태스크에서 프롬프팅만으로 시도했다가 Structured Outputs 기능으로 바꿔 안정성을 비교하라.
5. 5천 자 문서를 프롬프트 앞/뒤에 각각 두고 같은 질문에 답 품질을 비교하라.

<!-- section: check_question -->
## 이해 점검

1. 지시·예시·입력을 태그로 감싸는 이유는?
2. 좋은 few-shot 예시의 3요소는? 왜 다양성이 필요한가?
3. "하지 마" 나열보다 예시가 강한 이유는?
4. 형식을 반드시 지켜야 할 때는 프롬프팅과 기능 중 무엇을 쓰나?
5. 긴 문서와 질문의 배치 순서는? 그 근거의 신뢰도는?

<!-- section: interview_question -->
## 면접 대비

- "few-shot 프롬프팅에서 예시를 고르는 기준은?"
- "출력 형식을 강제하는 방법들(프롬프팅/구조화 출력/도구 호출)의 트레이드오프는?"
- "long-context 프롬프트에서 정보 배치가 왜 중요한가요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 태그 구획, few-shot 3~5개(관련성·다양성·구조)·"이렇게 해", 스키마 필수면 기능/유연하면 프롬프팅,
> 긴 문서 위·질문 아래, 벤더 수치는 인용일 뿐을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**지시·예시·입력을 태그로 구획하고, few-shot 예시 3~5개(관련성·다양성·구조)로 형식을 "보여" 주며
"하지 마" 대신 "이렇게 해" 를 쓴다 — 스키마 필수면 Structured Outputs 기능을, 긴 입력이면 문서를 위·질문을
아래에 두되, 벤더 측정치는 규칙이 아니라 인용이므로 평가로 확인한다.**
