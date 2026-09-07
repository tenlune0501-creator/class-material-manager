---
id: tenlune/hybrid-llm-quote-explanation
project: tenlune
title: 규칙 + LLM 하이브리드 — 설명만 LLM, 숫자는 규칙
unit_kind: infra
feature_area: AI 견적
concepts: [규칙 엔진과 LLM 역할 분리, graceful degradation, 프롬프트로 출력 제약, provider 추상화, same-origin·rate-limit 방어]
related_lessons:
  - ai-engineering/llm-app-fundamentals/streaming-and-errors
  - ai-engineering/llm-app-fundamentals/structured-outputs
  - ai-engineering/prompt-and-evaluation/prompting-as-development
  - data-and-backend/nodejs-server/error-handling
---

<!-- section: role -->
## 이 코드가 하는 일

`wp-content/plugins/tenlune-content/includes/ai-quote.php` + `snippets/quote-tool-v2.js` 의 AI 호출 부분 —
규칙 엔진이 정한 가격·기간 숫자를 **LLM이 자연어로 설명** 만 해 준다. LLM은 숫자를 새로 계산하거나 바꾸지
않는다(프롬프트로 강제). 호출이 실패하면 규칙 결과만 그대로 보인다.

<!-- section: code -->
## 핵심 코드 읽기 (프런트)

```js
if (window.tlAiQuoteEndpoint) {
  fetch(window.tlAiQuoteEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: pack.service.label,
      features: pack.priced.map(f => f.label),
      low: pack.low, high: pack.high, days: pack.days, budget: budget.label,
    }),
  })
  .then(r => r.ok ? r.json() : null)
  .then(data => {
    if (data && data.explanation) {           // 설명이 있을 때만 렌더
      aiBox.innerHTML = '';
      aiBox.appendChild(el('p', { class: 'tl-quote-ai-text', text: data.explanation }));
      aiBox.style.display = '';
    }
  })
  .catch(() => { /* 조용히 무시 — 규칙 기반 결과는 이미 표시됨 */ });
}
```

## 서버(ai-quote.php)의 역할 분담 (주석 요지)

```
- 가격·기간 숫자는 프런트 규칙 계산기(snippet 21)가 유일하게 정한다.
  이 엔드포인트는 그 숫자를 "사실" 로만 받아 설명 문장을 만든다 (프롬프트로 강제).
- provider 키가 없거나 호출이 실패/타임아웃/레이트리밋이면 항상 { "explanation": null } 을 200 으로 반환.
- 3층 분리: build_messages(프롬프트) / providers(레지스트리·선택) / chat(OpenAI 호환 통신).
  provider 전환은 wp-config 상수 한 줄. openrouter·groq 는 같은 스키마라 분기 없음.
- same-origin(Origin/Referer) 확인, IP rate-limit.
```

<!-- section: why -->
## 왜 이렇게 나눴나

- **숫자는 결정적이어야 한다.** LLM이 가격을 만들면 매번 달라지고 사업적으로 위험하다 → 규칙이 소유.
- **LLM은 있으면 좋고 없어도 되는 부가물** 이다 → 키 없음·실패·타임아웃이면 `{explanation:null}` 200,
  프런트는 `.catch` 로 조용히 무시, 규칙 결과는 그대로. 이것이 **graceful degradation**.
- provider(OpenRouter/Groq)를 레지스트리로 추상화 → 프롬프트·프런트·규칙은 provider 전환에 무관.

<!-- section: framework_role -->
## LLM 호출 계층이 대신하는 것 / 안 하는 것

- 대신: 여러 규칙 항목을 사람이 읽기 좋은 한 문단으로 요약, 중복 정리.
- 안 함: 가격·기간 결정, 필수 정보 제공(그건 규칙 결과가 이미 화면에 있음).

<!-- section: related_lesson -->
## 이어지는 Lesson

- `ai-engineering/llm-app-fundamentals/streaming-and-errors` — 실패·타임아웃·레이트리밋 처리
- `ai-engineering/llm-app-fundamentals/structured-outputs` — `{explanation: string|null}` 계약
- `ai-engineering/prompt-and-evaluation/prompting-as-development` — "숫자를 바꾸지 마라" 를 프롬프트로

<!-- section: caution -->
## 주의점

- 학습용으로 봐야 할 경계: 이 코드는 "규칙이 이미 답을 냈고 LLM은 장식" 인 경우다. LLM이 핵심 기능이면
  실패 처리가 훨씬 더 필요하다.
- API 키(`TENLUNE_OPENROUTER_API_KEY`)는 저장소·문서에 **없다** — `wp-config.php` 상수로만.
- reasoning 모델은 `<think>` 를 뱉을 수 있어 파서가 제거한다 — provider별 quirk를 설정에서 흡수.

<!-- section: experiment -->
## 작은 실습

1. `fetch` 의 `.catch` 를 지우고 엔드포인트를 죽인 뒤, 화면이 어떻게 깨지는지 관찰하라(왜 `.catch` 가 필요한지).
2. 서버가 `{ explanation: null }` 을 반환할 때 프런트가 아무것도 안 하는 코드 경로를 짚어라.
3. "가격을 조정해서 다시 알려 줘" 같은 요청을 프롬프트가 어떻게 막는지 설계로 설명하라.

<!-- section: check_question -->
## 이해 점검

1. 가격을 규칙 엔진이 소유하고 LLM이 설명만 하는 이유는?
2. graceful degradation이 이 코드에서 구체적으로 어떻게 구현됐나?
3. provider를 레지스트리로 추상화해서 얻는 것은?

<!-- section: review -->
## 한 줄 정리

**AI 견적은 규칙 엔진이 숫자를 소유하고 LLM은 설명만 하며(프롬프트 강제), 키 없음·실패·타임아웃이면
`{explanation:null}` 200 + 프런트 `.catch` 로 규칙 결과만 남는 graceful degradation 구조다.**
