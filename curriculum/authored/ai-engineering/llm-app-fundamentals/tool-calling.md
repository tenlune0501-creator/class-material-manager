---
id: ai-engineering/llm-app-fundamentals/tool-calling
chapter: ai-engineering/llm-app-fundamentals
title: 도구 호출 왕복 직접 구현하기
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [ai, llm, tool-use, function-calling]
related_material_ids: []
sources:
  - title: "Tool use with Claude (overview)"
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Function calling"
    url: https://developers.openai.com/api/docs/guides/function-calling
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - ai-engineering/llm-app-fundamentals/prompts-tokens-context
  - ai-engineering/llm-app-fundamentals/structured-outputs
code_examples:
  - slug: roundtrip
    title: 도구 호출 왕복 (5단계)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // ① 도구 목록과 함께 요청
      const tools = [{
        name: "get_weather",
        description: "도시의 현재 날씨를 조회한다",
        input_schema: {   // OpenAI 는 parameters, Anthropic 은 input_schema (JSON Schema)
          type: "object",
          properties: { city: { type: "string" } },
          required: ["city"],
        },
      }];
      let messages = [{ role: "user", content: "서울 날씨 어때?" }];
      let res = await model({ messages, tools });

      // ② 모델이 도구 호출을 요청 (stop_reason: "tool_use")
      if (res.stopReason === "tool_use") {
        const call = res.toolCalls[0];              // { name: "get_weather", input: { city: "서울" }, id }

        // ③ 앱이 실제로 함수를 실행
        const result = await getWeather(call.input.city);

        // ④ 결과를 담아 2차 요청 (assistant 턴 + tool_result 를 순서대로)
        messages.push({ role: "assistant", content: res.content });
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
        res = await model({ messages, tools });
      }
      // ⑤ 모델이 최종 답 (또는 추가 도구 호출 → 루프)
      console.log(res.text);
  - slug: tool-def
    title: 도구 정의 = 이름 + 설명 + JSON Schema
    source_type: generated_minimal
    language: text
    code: |
      name         : 짧고 명확 (get_weather, search_orders)
      description  : "언제 이 도구를 쓰는지" 를 모델이 판단할 근거. 자세히.
      input_schema : 파라미터의 JSON Schema (structured-outputs 와 같은 개념). strict 로 형태 보장.

      초기엔 도구 수를 적게(정확도↑). 이름·설명이 겹치면 모델이 헷갈린다.
  - slug: client-server
    title: client tool vs server tool
    source_type: generated_minimal
    language: text
    code: |
      client tool : 앱(내 코드)이 실행. get_weather, query_db, send_email 등 대부분.
      server tool : 제공자 인프라가 실행. 웹 검색, 코드 실행 등 (제공자가 제공하는 것).
      tool_choice : auto(모델이 결정) / 특정 도구 강제 / none(도구 안 씀).
  - slug: cost
    title: 비용 — 도구도 토큰이다
    source_type: generated_minimal
    language: text
    code: |
      도구 정의(이름·설명·스키마), tool_use 블록, tool_result 블록이 전부 context window 토큰에 포함.
      도구를 켜면 제공자가 자동으로 붙이는 시스템 프롬프트 토큰도 더해진다.
      → 안 쓰는 도구를 매 요청에 넣지 않는다. 설명은 명확하되 장황하지 않게.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **도구/함수 호출**의 왕복 5단계(요청 → 모델의 호출 요청 → 앱 실행 → 결과 반환 → 최종 응답)를 직접 구현한다.
- 도구 정의 = **이름 + 설명 + JSON Schema** 임을 안다(구조화 출력과 같은 개념).
- **client tool vs server tool**, `tool_choice` 를 안다.
- 도구 정의·호출·결과가 전부 **토큰 비용**임을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- LLM 요청/응답, messages 누적, JSON Schema(구조화 출력 Lesson).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

LLM은 학습 컷오프 이후 정보를 모르고, 실시간 데이터(날씨·재고·내 DB)를 못 본다. **도구 호출**은
모델이 "이 함수를 이 인자로 불러 줘" 라고 요청하면 앱이 실제로 실행해 결과를 돌려주는 표준 방법이다.
에이전트의 토대이기도 하다.

<!-- section: code | lang: js -->
## 1. 왕복 5단계

{{code: roundtrip}}

- ① 도구 목록과 함께 요청 → ② 모델이 `stop_reason: "tool_use"` 로 **호출 요청**(어떤 도구, 무슨 인자) →
  ③ **앱이** 그 인자로 실제 함수 실행 → ④ 결과를 `tool_result` 로 담아 2차 요청(직전 assistant 턴 포함,
  **정확한 순서로**) → ⑤ 모델이 최종 답(또는 또 도구 호출 → 루프).
- 모델은 함수를 실행하지 않는다. **실행은 항상 내 코드**다.

<!-- section: concept | title: 도구 정의 -->
## 2. 도구 정의

{{code: tool-def}}

`description` 이 핵심이다 — 모델이 "언제 이 도구를 쓸지" 판단하는 근거. 파라미터는 JSON Schema로
(구조화 출력과 동일). 초기엔 도구를 **적게** 두는 게 정확도에 좋다.

<!-- section: mechanism -->
## 3. client vs server tool · tool_choice

{{code: client-server}}

<!-- section: concept | title: 비용 -->
## 4. 비용

{{code: cost}}

<!-- section: must_know -->
## 반드시 기억할 것

- 왕복: 요청(+tools) → `tool_use` → **앱이 실행** → `tool_result` 로 2차 요청(assistant 턴 + 순서 유지) → 최종.
- **모델은 실행 안 한다.** 실행은 내 코드.
- 도구 정의 = 이름 + **설명(언제 쓰나)** + JSON Schema. 초기엔 도구 수 적게.
- client tool(내 코드) vs server tool(제공자). `tool_choice` 로 auto/강제/none.
- 도구 정의·`tool_use`·`tool_result` + 자동 시스템 프롬프트가 **토큰 비용**. 안 쓰는 도구는 빼기.
- 파라미터/필드 이름은 제공자마다 다르다(OpenAI `parameters`/tool_calls, Anthropic `input_schema`/content 블록).

<!-- section: experiment -->
## 직접 해 보기

1. `get_weather(city)` 도구를 정의하고 "서울 날씨" 질문에 왕복 5단계를 구현하라. `tool_result` 를 안 돌려주면 어떻게 되는지도 관찰.
2. 도구 2개(`get_weather`, `get_time`)를 주고 모델이 상황에 맞게 고르는지, 둘 다 필요한 질문에 순차 호출하는지 보라.
3. `description` 을 부실하게("날씨") vs 자세히 써서 모델의 도구 선택 정확도를 비교하라.
4. `tool_choice` 를 특정 도구로 강제해 보라.
5. 도구를 10개 넣고 정확도가 떨어지는지, 요청 토큰(usage)이 늘어나는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 도구 호출에서 함수를 실제로 실행하는 주체는 누구인가?
2. 왕복 2차 요청에 무엇을 넣어야 하나?
3. 도구 정의의 `description` 이 왜 중요한가?
4. client tool과 server tool의 차이는?
5. 도구를 많이 켜면 어떤 비용이 생기나?

<!-- section: interview_question -->
## 면접 대비

- "function calling / tool use의 요청-응답 사이클을 설명해 주세요."
- "도구를 여러 개 제공할 때 정확도가 떨어지는 이유와 대응은?"
- "도구 호출이 토큰/비용에 미치는 영향은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 왕복 5단계(요청+tools→tool_use→앱 실행→tool_result 2차 요청→최종), 실행은 내 코드,
> 도구 정의=이름+설명+스키마, client/server·tool_choice, 도구도 토큰을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**도구 호출은 모델이 `tool_use` 로 "이 함수를 이 인자로" 요청하면 앱이 실행해 `tool_result` 로 돌려주고
모델이 최종 답을 내는 왕복이다 — 도구 정의는 이름+설명+JSON Schema이고, 도구 정의·호출·결과가 모두
토큰 비용이라 안 쓰는 도구는 넣지 않는다.**
