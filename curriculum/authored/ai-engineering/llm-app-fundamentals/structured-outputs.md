---
id: ai-engineering/llm-app-fundamentals/structured-outputs
chapter: ai-engineering/llm-app-fundamentals
title: 구조화 출력으로 결과 받기
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [ai, llm, structured-outputs, json-schema]
related_material_ids: []
sources:
  - title: "Structured Outputs"
    url: https://developers.openai.com/api/docs/guides/structured-outputs
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Increase output consistency (JSON mode)"
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/increase-consistency
    publisher: "Anthropic"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - ai-engineering/llm-app-fundamentals/prompts-tokens-context
  - typescript/objects-interfaces-and-type-aliases/objects-interface-type-alias
code_examples:
  - slug: problem
    title: 자유 텍스트 파싱의 문제
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 프롬프트: "이 리뷰의 감정과 이유를 알려줘"
      // 응답(자유 텍스트) — 매번 형태가 다르다:
      //   "감정: 긍정 / 이유: 배송이 빨랐음"
      //   "이 리뷰는 긍정적입니다. 왜냐하면..."
      //   "**Sentiment**: positive\n**Reason**: fast shipping"
      // → 정규식 파싱 = 회귀의 온상. 모델을 조금만 바꿔도 깨진다.
  - slug: json-schema
    title: JSON Schema 로 출력 형태를 강제
    source_type: generated_minimal
    language: js
    code: |
      const schema = {
        type: "object",
        properties: {
          sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
          reason: { type: "string" },
          score: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["sentiment", "reason", "score"],
        additionalProperties: false,
      };

      // OpenAI: response_format: { type: "json_schema", json_schema: { name, schema, strict: true } }
      // Anthropic: output_config.format 로 유사 기능 지원
      const res = await callModel({ messages, responseSchema: schema });
      const data = JSON.parse(res.output_text);   // 이제 data.sentiment 는 항상 셋 중 하나
  - slug: refusal
    title: 거부(refusal)는 스키마 밖에서 감지
    source_type: generated_minimal
    language: js
    code: |
      // 안전상 모델이 응답을 거부하면 스키마 대신 별도 필드로 온다
      if (res.refusal) {
        showSafeMessage(res.refusal);   // 스키마 파싱을 시도하지 않는다
      } else {
        const data = JSON.parse(res.output_text);
      }
  - slug: limits
    title: 한계
    source_type: generated_minimal
    language: text
    code: |
      - "유효한 JSON"만 보장하는 JSON mode 와 다르다: 구조화 출력은 스키마 준수(strict)까지.
      - 일부 JSON Schema 기능은 미지원(제공자 문서에서 지원 목록 확인).
      - max_tokens 를 넘으면 응답이 잘려 스키마가 깨질 수 있다 → 넉넉히 + 잘림 감지.
      - 스키마를 지켜도 값의 내용이 사실인지는 별개 → 여전히 환각 가능.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- LLM 결과를 **자유 텍스트로 파싱하는 것이 왜 위험한지**(회귀) 설명한다.
- **JSON Schema** 로 출력 형태를 강제하는 구조화 출력을 쓴다(`enum`, `required`, `additionalProperties`).
- 안전상 **거부(refusal)** 는 스키마 밖 별도 필드로 처리한다.
- "유효한 JSON"(JSON mode)과 "스키마 준수"(strict)의 차이, 그리고 한계(잘림·미지원 기능·환각)를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- LLM 요청/응답 구조(messages·토큰), JSON, 타입/스키마 감각(TypeScript 트랙).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

{{code: problem}}

실무 LLM 앱은 대부분 결과를 **코드로 이어서** 쓴다(DB 저장, 분기, UI 렌더). 그런데 모델이 매번
조금씩 다른 문장으로 답하면 정규식 파싱이 계속 깨진다. 모델을 업그레이드하면 또 깨진다.

<!-- section: concept -->
## 1. JSON Schema로 형태 고정

{{code: json-schema}}

- 원하는 출력의 **모양(스키마)** 을 정의해 요청에 함께 보낸다.
- OpenAI는 `response_format: { type: "json_schema", ..., strict: true }`, Anthropic도 유사한
  구조화 출력/포맷 지정 기능을 제공한다(양쪽 다 있음 — 제공자 문서에서 정확한 파라미터 확인).
- 결과: `data.sentiment` 는 **항상 `enum` 셋 중 하나**, `score` 는 항상 숫자 → 정규식·재시도 불필요, 타입 안전.
- 강한 포맷 지시 프롬프트("반드시 JSON으로만, 다른 말 하지 마…")가 대부분 불필요해진다.

<!-- section: mechanism -->
## 2. 거부 처리

{{code: refusal}}

모델이 안전상 응답을 거부하면 **스키마를 채우는 대신 `refusal` 필드**로 온다. 이걸 먼저 확인하고,
있으면 스키마 파싱을 시도하지 않는다(프로그램적으로 감지 가능).

<!-- section: concept | title: 한계 -->
## 3. 한계

{{code: limits}}

- **JSON mode ≠ 구조화 출력.** JSON mode는 "유효한 JSON"만, 구조화 출력(strict)은 **스키마 준수**까지.
- 일부 JSON Schema 기능은 미지원 — 제공자 문서의 지원 목록 확인.
- `max_tokens` 초과로 응답이 잘리면 스키마가 깨진다 → 넉넉히 잡고 잘림(`finish_reason`)을 감지.
- **스키마를 지켜도 값이 사실인지는 별개** — `reason` 필드에 그럴듯한 거짓이 들어갈 수 있다(→ 평가 챕터).

<!-- section: must_know -->
## 반드시 기억할 것

- 결과를 코드로 이어 쓰면 **자유 텍스트 파싱 금지** → JSON Schema 구조화 출력.
- 스키마: `type`/`properties`/`required`/`enum`/`additionalProperties: false`.
- **거부(refusal)** 는 스키마 밖 별도 필드 — 먼저 확인.
- "유효한 JSON"(JSON mode)과 "스키마 준수"(strict/구조화 출력)는 다르다.
- 잘림(max_tokens) 시 스키마가 깨질 수 있으니 넉넉히 + 잘림 감지.
- 스키마 준수 ≠ 내용의 사실성 — 값 검증·평가는 별도.
- 파라미터 이름은 제공자마다 다르다 → 해당 제공자 문서 확인.

<!-- section: experiment -->
## 직접 해 보기

1. "리뷰 → {sentiment, reason, score}" 를 자유 텍스트로 받아 정규식으로 파싱해 보고, 프롬프트를 살짝 바꿔 파싱이 깨지는 걸 확인하라.
2. 같은 태스크를 JSON Schema 구조화 출력으로 바꿔 `data.sentiment` 가 항상 enum 중 하나인지 확인.
3. `additionalProperties: false` 를 빼고 모델이 추가 필드를 넣는지 관찰한 뒤 되돌려라.
4. `max_tokens` 를 아주 작게 줘서 응답이 잘려 `JSON.parse` 가 실패하는 상황을 만들고, 잘림을 감지해 처리하라.
5. 위험한 요청을 넣어 `refusal` 이 오는지 확인하고, 분기 처리하라.

<!-- section: check_question -->
## 이해 점검

1. LLM 결과를 자유 텍스트로 파싱하면 왜 회귀가 잦나?
2. JSON mode와 구조화 출력(strict)의 차이는?
3. `enum` 과 `additionalProperties: false` 는 각각 무엇을 막나?
4. 안전상 거부는 어떻게 감지하나?
5. 스키마를 지킨 응답도 여전히 검증이 필요한 이유는?

<!-- section: interview_question -->
## 면접 대비

- "LLM 출력을 구조화하는 이유와, JSON mode/구조화 출력의 차이를 설명해 주세요."
- "구조화 출력을 써도 여전히 남는 실패 모드는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 자유 텍스트 파싱=회귀, JSON Schema(enum/required/additionalProperties:false), refusal은 스키마 밖,
> JSON mode≠strict, 잘림 주의·사실성은 별개를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**결과를 코드로 이어 쓰는 LLM 앱은 자유 텍스트 파싱 대신 JSON Schema 구조화 출력(strict)으로 형태를
강제해 회귀를 없애고, 안전상 거부는 스키마 밖 `refusal` 로 처리한다 — 다만 스키마 준수가 값의 사실성을
보장하지는 않는다.**
