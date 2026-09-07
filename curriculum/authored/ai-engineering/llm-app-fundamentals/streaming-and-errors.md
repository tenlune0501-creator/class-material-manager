---
id: ai-engineering/llm-app-fundamentals/streaming-and-errors
chapter: ai-engineering/llm-app-fundamentals
title: 스트리밍·에러·재시도·비용
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [ai, llm, streaming, sse, retries, rate-limit, cost]
related_material_ids: []
sources:
  - title: "Streaming API responses"
    url: https://developers.openai.com/api/docs/guides/streaming-responses
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Streaming Messages"
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
    publisher: "Anthropic"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Claude API errors"
    url: https://platform.claude.com/docs/en/api/errors
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - ai-engineering/llm-app-fundamentals/prompts-tokens-context
code_examples:
  - slug: streaming
    title: 스트리밍 — 조각(delta)을 순회
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // stream: true → HTTP 스트리밍(Server-Sent Events). 응답 전체를 안 기다린다.
      const stream = await model({ messages, stream: true });

      let full = "";
      for await (const event of stream) {
        // 타입별 이벤트를 순회: message_start / content_block_delta / message_stop / error ...
        if (event.type.endsWith(".delta") && event.delta?.text) {
          full += event.delta.text;
          renderPartial(full);         // 타이핑되듯 화면에 즉시
        }
      }
      // 단일 응답 객체 대신 "이벤트 스트림" 을 처리한다는 게 핵심 차이
  - slug: stream-error
    title: 스트림 중간 에러는 별도 경로
    source_type: generated_minimal
    language: text
    code: |
      SSE 는 이미 200 OK 로 시작하므로, 스트림 "도중" 나는 에러는 표준 HTTP 에러 처리를 안 탄다.
      → 스트림 안의 error 이벤트를 따로 처리해야 한다.
      트레이드오프: 부분 출력이라 콘텐츠 모더레이션(전체를 보고 판단)이 어렵다.
  - slug: errors
    title: 예측 가능한 HTTP 에러
    source_type: generated_minimal
    language: text
    code: |
      400 invalid_request   형식 오류 / 컨텍스트 초과("prompt is too long") / spend limit
      401 authentication    키 문제
      403 permission        권한 없음
      413 request_too_large 요청 본문 과대
      429 rate_limit        조직의 rate limit 또는 월 사용 한도 도달
      500 api_error         서버 오류
      529 overloaded_error  일시적 과부하 (재시도 대상)
  - slug: retry
    title: 재시도 — 지수 백오프 + retry-after
    source_type: generated_minimal
    language: js
    code: |
      // 공식 SDK 는 연결 오류 / 429 / 5xx 를 지수 백오프로 기본 2회 자동 재시도하고
      // 응답의 retry-after 헤더를 존중한다 (최대 재시도 설정/비활성 가능).
      async function withRetry(fn, tries = 3) {
        for (let i = 0; i < tries; i++) {
          try { return await fn(); }
          catch (e) {
            if (![429, 500, 502, 503, 529].includes(e.status) || i === tries - 1) throw e;
            const wait = e.headers?.["retry-after"] ? Number(e.headers["retry-after"]) * 1000
                                                    : (2 ** i) * 1000 + Math.random() * 500;
            await new Promise((r) => setTimeout(r, wait));
          }
        }
      }
      // 주의: tier spend-cap 429 는 retry-after 없이 계속 실패 → 무한 재시도 금지
  - slug: cost
    title: 비용·지연은 토큰에 비례
    source_type: generated_minimal
    language: text
    code: |
      비용/지연 ∝ 토큰 수 (입력 + 출력, 도구 정의 포함).
      - system 프롬프트를 짧게, 대화 히스토리를 필요한 만큼만.
      - 긴 출력이 필요하면 스트리밍/배치 API (유휴 연결 끊김 대비).
      - usage 필드로 실제 소비 토큰을 로깅해 비용을 추적한다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **스트리밍**(SSE, `stream: true`)이 왜 필요한지(체감 지연·UX)와, 응답을 "단일 객체"가 아니라
  "이벤트 스트림"으로 처리하는 법을 안다.
- 스트림 **중간 에러**가 표준 HTTP 에러 경로를 안 탄다는 것을 안다.
- 예측 가능한 HTTP 에러(400/401/403/413/429/5xx/529)와, **지수 백오프 + `retry-after`** 재시도를 구현한다.
- 비용·지연이 **토큰 수에 비례**한다는 감각으로 요청을 설계한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- LLM 요청/응답·토큰·context window, HTTP 상태 코드, SSE(서버가 조각을 밀어 주는 방식) 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 긴 답변을 다 만들 때까지 화면이 몇 초간 멈춰 있으면 "고장 났나?" 싶다.
- 429/529가 나면 앱이 그냥 죽는다. 재시도를 아무렇게나 하면 rate limit을 더 악화시킨다.
- 비용이 왜 이렇게 나오는지 감이 없다.

<!-- section: code | lang: js -->
## 1. 스트리밍

{{code: streaming}}

- `stream: true` 로 요청하면 응답이 **생성되는 대로 조각(delta)** 으로 온다(SSE over HTTP).
- 처리 방식이 바뀐다: 단일 응답 객체 대신 **타입별 이벤트를 순회**(start / `*.delta` / stop / error).
- 챗 UI가 "타이핑되듯" 보이는 이유. 긴 출력의 체감 지연이 줄고 첫 글자가 빨리 나온다.

<!-- section: mechanism -->
## 2. 스트림 중간 에러

{{code: stream-error}}

SSE는 이미 `200 OK` 로 시작하므로 **스트림 도중 나는 에러는 표준 HTTP 에러 처리를 안 탄다** —
스트림 안의 `error` 이벤트를 따로 잡아야 한다. 또 부분 출력만 보고는 콘텐츠 모더레이션이 어렵다.

<!-- section: concept | title: 에러 -->
## 3. 에러와 재시도

{{code: errors}}

{{code: retry}}

- **재시도 대상**: 연결 오류, 429, 5xx, 529. **재시도 아님**: 400/401/403(요청 자체가 잘못).
- **지수 백오프**(`2^i` + jitter) + **`retry-after` 헤더 존중**. 공식 SDK가 기본 2회 자동 재시도한다.
- 단, **spend-cap 429**(사용 한도 초과)는 `retry-after` 없이 계속 실패 → 무한 재시도 금지.

<!-- section: concept | title: 비용 -->
## 4. 비용·지연

{{code: cost}}

<!-- section: must_know -->
## 반드시 기억할 것

- 스트리밍 = `stream: true`(SSE). 응답을 **이벤트 스트림**으로 순회(`*.delta` 누적).
- 스트림 **중간 에러**는 HTTP 에러 경로 밖 — `error` 이벤트로 처리.
- 재시도: **429·5xx·529·연결 오류만**, 지수 백오프 + `retry-after` 존중. 400/401/403은 재시도 X.
- **spend-cap 429**는 무한 재시도 금지.
- 비용·지연 ∝ **토큰 수**(입력+출력+도구). `usage` 로 로깅.
- 긴 출력은 스트리밍/배치. system 프롬프트·히스토리는 최소.
- 에러 코드·이벤트 이름은 제공자마다 다르다 → 해당 문서 확인.

<!-- section: experiment -->
## 직접 해 보기

1. 긴 답변을 논스트리밍/스트리밍으로 각각 요청해 첫 글자까지 걸리는 시간을 비교하라.
2. 스트리밍 이벤트를 콘솔에 찍어 타입 종류(start/delta/stop)를 관찰하라.
3. `withRetry` 를 구현하고, 존재하지 않는 모델명으로 400을 내서 **재시도하지 않는지** 확인하라.
4. `retry-after` 가 있는 응답을 mock해 그 값을 존중하는지 확인하라.
5. system 프롬프트를 길게/짧게 해서 `usage.input_tokens` 와 응답 시간의 차이를 보라.

<!-- section: check_question -->
## 이해 점검

1. 스트리밍 응답을 코드에서 어떻게 처리하나? (논스트리밍과 뭐가 다른가)
2. 스트림 도중 에러가 표준 HTTP 에러로 안 잡히는 이유는?
3. 재시도해야 하는 에러와 하면 안 되는 에러는?
4. 지수 백오프 + `retry-after` 를 쓰는 이유는?
5. LLM 비용을 줄이는 방법 세 가지는?

<!-- section: interview_question -->
## 면접 대비

- "LLM 응답 스트리밍의 동작(SSE)과 클라이언트 처리 방식을 설명해 주세요."
- "429/5xx에 대한 견고한 재시도 전략은?"
- "LLM 서비스의 비용을 어떻게 모니터링·제어하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> stream:true(SSE)·delta 순회, 스트림 중간 에러는 error 이벤트, 재시도(429·5xx·529 + 지수 백오프 + retry-after),
> spend-cap 429는 무한 재시도 금지, 비용 ∝ 토큰을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**스트리밍은 `stream: true` 로 조각(delta) 이벤트를 순회해 체감 지연을 줄이고(중간 에러는 `error` 이벤트로
따로 처리), 에러는 429·5xx·529만 지수 백오프 + `retry-after` 로 재시도하며(spend-cap 429는 예외),
비용·지연은 토큰 수에 비례하므로 프롬프트·히스토리를 최소로 유지한다.**
