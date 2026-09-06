---
id: ai-engineering/llm-app-fundamentals/prompts-tokens-context
chapter: ai-engineering/llm-app-fundamentals
title: LLM API와 컨텍스트 윈도
mastery: required
lesson_kind: lesson
estimated_minutes: 55
tags: [ai, llm, messages, roles, tokens, context-window, cost]
related_material_ids: []
sources:
  - title: "Text generation"
    url: https://developers.openai.com/api/docs/guides/text
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Context windows"
    url: https://platform.claude.com/docs/en/build-with-claude/context-windows
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "LLM Course — Chapter 1 (Introduction / NLP & LLMs)"
    url: https://huggingface.co/learn/llm-course/chapter1/1
    publisher: "Hugging Face"
    checked_at: 2026-09-06
    source_type: course_material
prerequisites:
  - ai-engineering/generative-ai-in-frontend/generative-ai-react-app
  - javascript/async-and-http/fetch-and-ajax
code_examples:
  - slug: messages-array
    title: LLM 호출 = 역할이 붙은 메시지 배열
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 제공자마다 필드 이름은 조금 다르다(아래는 개념 형태).
      // 공통점: "역할이 붙은 메시지들의 배열"을 보내고, "역할 assistant 의 메시지"를 받는다.
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: MODEL,                     // 어떤 모델인지는 설정값으로 — 코드에 이름 박지 않기
          messages: [
            { role: "system", content: "너는 요리 도우미다. 재료 목록만 JSON 배열로 답한다." },
            { role: "user", content: "김치볶음밥 재료 알려줘" },
          ],
        }),
      });
      const data = await res.json();
      console.log(data.choices?.[0]?.message?.content ?? data.content); // assistant 메시지
      console.log(data.usage); // { prompt_tokens, completion_tokens, total_tokens } 류
  - slug: multiturn-accumulation
    title: 멀티턴 = 이전 메시지를 다시 보낸다
    source_type: generated_minimal
    language: js
    code: |
      const history = [
        { role: "system", content: "너는 요리 도우미다." },
      ];

      async function ask(userText) {
        history.push({ role: "user", content: userText });   // 이번 질문 추가
        const data = await callLLM({ messages: history });    // history 전체를 매번 보낸다
        const reply = data.content;
        history.push({ role: "assistant", content: reply });  // 답도 history 에 누적
        return reply;
      }

      await ask("김치볶음밥 재료?");   // 보내는 토큰: system + user1
      await ask("2인분으로?");         // 보내는 토큰: system + user1 + assistant1 + user2  ← 계속 커진다
  - slug: too-long
    title: 입력이 윈도를 넘으면 (개념)
    source_type: generated_minimal
    language: js
    code: |
      // system 프롬프트 + 대화 히스토리 + (도구 정의 + 첨부 문서/이미지) 의
      // 토큰 합이 모델의 context window 를 넘으면:
      //   → 요청 자체가 400 에러 ("prompt is too long" 류)
      // 생성 중에 한도에 닿으면:
      //   → 응답이 중간에 잘리거나 stop 이유가 "length"/"context window exceeded" 로 표시
      // 대비: 보내기 전에 token counting 으로 추정하고, 오래된 턴을 요약/제거한다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- LLM API 한 번의 호출이 실제로 무엇을 주고받는지 설명할 수 있다 — **역할이 붙은 메시지 배열**을
  보내고 **assistant 역할의 메시지**를 받는다.
- **토큰**과 **컨텍스트 윈도(context window)** 가 무엇인지, 대화가 진행되면 왜 매 턴이 **누적**되는지,
  **비용·지연이 토큰 수에 비례**하는 이유를 말할 수 있다.
- 입력이 윈도를 넘으면 무슨 일이 나는지, 응답의 **`usage`** 로 소비량을 어떻게 확인하는지 안다.
- 기본적인 **대화 history/context 관리 코드**(이전 메시지 누적, 윈도를 넘으면 오래된 턴 잘라내기)를
  직접 구현할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- **fetch / async·await, `.env` 로 API 키 관리** — 이미 `생성형 AI - React App`, `alan API`
  실습에서 해 봤다. (→ `ai-engineering/generative-ai-in-frontend/*`)
- **JSON** 구조 감각.
- (있으면 좋음) **LLM 이란**: 방대한 텍스트로 학습돼 다음 토큰을 예측하는 모델. 태스크별
  학습 없이 여러 언어 작업을 하지만 **환각·편향·지식 컷오프·제한된 컨텍스트**라는 한계가 있다.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

기존 미니프로젝트에서는 프롬프트를 "문자열 하나" 로 생각했다. 그러면:

- 챗봇을 만들었더니 **갈수록 느려지고 비싸진다.** 왜?
- 대화가 길어지면 모델이 **앞 내용을 잊는다.** 왜?
- 어떤 요청은 `400` 에러가 난다. "prompt is too long"? 뭐가 길다는 거지?
- 청구서가 예상보다 많이 나왔다. 무엇에 비례해서 돈이 나가는 거지?

이 네 가지가 전부 **하나의 개념 — 컨텍스트 윈도** 로 설명된다.

<!-- section: concept -->
## 호출의 단위: 역할이 붙은 메시지 배열

LLM API 호출은 "프롬프트 문자열 하나"가 아니라 **역할(role)이 붙은 메시지들의 배열**이다.

| role | 누가 | 용도 |
|---|---|---|
| `system` (또는 `developer`) | **앱 개발자** | 규칙·페르소나·출력 형식. 우선순위가 높다. "함수 정의"에 비유. |
| `user` | 최종 사용자 | 그때그때의 입력. "함수에 넘기는 인자"에 비유. |
| `assistant` | 모델 | 모델의 이전/현재 출력. 멀티턴에서 히스토리로 다시 넣는다. |

> 제공자마다 이름·구조는 조금 다르다(예: 한쪽은 `system` 을 별도 파라미터로 둔다).
> **개념은 같다** — "역할로 구분된 메시지" + "assistant 응답".

{{code: messages-array}}

> `API_KEY` 를 **브라우저 코드에 넣지 않는다.** 이 호출은 서버 / 서버리스 함수 / Edge Function
> 같은 신뢰 가능한 서버측 환경에서 하고, 프론트엔드는 그 서버 엔드포인트만 부른다.
> (강사 자료 `open AI - image generator` 처럼 브라우저에서 키를 입력받는 방식은 학습용이다.)

응답에는 텍스트만 있는 게 아니라 **도구 호출 요청, 추론 토큰 정보, 그리고 `usage`(소비 토큰)**
같은 항목이 함께 올 수 있다.

<!-- section: concept | title: 토큰과 컨텍스트 윈도 -->
## 토큰과 컨텍스트 윈도

- **토큰** = 모델이 텍스트를 다루는 단위(대략 단어 조각). 비용·길이 계산이 전부 토큰 기준.
- **컨텍스트 윈도** = 모델이 응답을 만들 때 **참조할 수 있는 모든 텍스트(자기 응답 포함)의
  "작업 기억"**. 학습 데이터와는 다르다 — 이건 *이번 요청 안에서* 볼 수 있는 범위다.

윈도에 들어가 **토큰으로 계산되는 것**: system 프롬프트, `messages` 의 모든 메시지(도구 결과·
이미지·문서 포함), 도구 정의, 그리고 **모델이 생성하는 출력(추론 토큰 포함)**.

> **윈도 크기와 모델 이름은 본문에 못박지 않는다.** 모델 세대마다 바뀐다("모델마다 다르며
> 공식 문서에서 확인"). 200k냐 1M이냐가 아니라 "**한계가 있고, 전부 토큰으로 센다**"가 핵심.

더 많이 넣는다고 더 좋아지지 않는다. 토큰이 커질수록 정확도·recall 이 떨어지는 현상을
**context rot** 라고 한다 → "**얼마나 많이**"보다 "**무엇을**" 넣느냐가 중요하다.

<!-- section: mechanism -->
## 왜 갈수록 느리고 비싼가 — 매 턴 누적

멀티턴 대화는 **이전 메시지를 매번 다시 보내거나**(수동), 제공자가 상태를 이어 준다.
어느 쪽이든 **이전 턴이 계속 윈도의 토큰을 먹는다.** 매 턴 `user` + `assistant` 가 쌓인다.

{{code: multiturn-accumulation}}

- **비용** — 대부분 입력+출력 **토큰 수**에 비례. 히스토리가 길수록 매 호출의 입력 토큰이 커진다.
  도구를 켜면 자동으로 붙는 시스템 프롬프트 토큰도 더해진다.
- **지연** — 입력이 길수록, 출력이 길수록 느리다.
- **"앞 내용을 잊는다"** — 히스토리가 윈도에 안 들어가면 오래된 턴을 잘라내야 하고,
  그러면 모델이 그 내용을 더는 못 본다.

### 윈도를 넘으면

{{code: too-long}}

응답마다 **`usage` 필드**로 이번 요청이 얼마를 썼는지 보고된다. 보내기 전 추정은
**token counting** API 로.

<!-- section: must_know -->
## 반드시 기억할 것

- 호출 단위 = **역할이 붙은 메시지 배열**. `system`(개발자 규칙) / `user`(입력) / `assistant`(모델 응답).
- **요청 안의 모든 것 + 생성되는 출력이 전부 토큰**으로 세어지고 윈도에 들어간다.
- **멀티턴은 누적** — 이전 턴이 계속 토큰을 먹는다. 그래서 길어지면 느려지고 비싸진다.
- **비용·지연 ∝ 토큰 수.** 최적화의 첫 수단은 "짧게"가 아니라 "**필요한 것만**"(context rot).
- 입력이 윈도 초과 → **요청 에러**. 생성 중 초과 → 응답 잘림/중단.
- 소비량은 응답 **`usage`**, 사전 추정은 **token counting**.
- 모델 ID·윈도 크기 **숫자를 코드/본문에 박지 않는다** — 설정값 + 공식 문서.

<!-- section: delegatable -->
## 이 Lesson에서 다루지 않는 것 (다음 Lesson)

- **구조화 출력**(JSON Schema 강제) → `structured-outputs`
- **도구/함수 호출**의 왕복 → `tool-calling`
- **스트리밍**(토큰이 타이핑되듯 오는 것), **에러·재시도·rate limit** → `streaming-and-errors`
- 토크나이저의 내부 동작, Transformer 구조 → 개념만. "토큰 ≈ 단어 조각, 비용의 단위" 면 충분.

<!-- section: experiment -->
## 직접 해 보기

1. `messages` 에 `system` 없이 `user` 만 보낸 결과와, `system` 으로 "JSON 배열로만 답하라"를
   준 결과를 비교하라. `usage.prompt_tokens` 가 얼마나 늘었는지도 보라.
2. `multiturn-accumulation` 처럼 5턴을 이어 가며 매 호출의 `usage.prompt_tokens` 를 찍어라.
   그래프로 그리면 우상향 직선이다. "왜 비싸지는가"를 눈으로 확인.
3. 아주 긴 텍스트(예: 문서 여러 개)를 `user` 메시지에 붙여 일부러 윈도를 넘겨 보고,
   돌아오는 에러 메시지를 기록하라.

<!-- section: project_link -->
## 강사 자료와의 연결

`생성형 AI - React App` 자료는 Supabase Edge Function 에서 GPT 계열 모델을 호출해 레시피
텍스트를 받고 DB에 저장한다. 그때 **함수에 넘긴 프롬프트가 사실은 이 Lesson의 `messages`
배열**이고, 브라우저가 아니라 Edge Function(서버)에서 부른 이유는 **API 키를 숨기기 위해서**다
(`open AI - image generator` 처럼 브라우저에서 키를 입력받는 방식은 실무에서 쓰지 않는다).
그 미니프로젝트를 이 Lesson의 관점 — 역할·토큰·비용 — 으로 다시 읽어 보라.

<!-- section: mission -->
## 미션

1. 간단한 CLI 챗봇을 만들어라: 사용자 입력을 받아 `history` 에 쌓고, 매 턴 `history` 전체를
   보내고, `assistant` 응답을 다시 `history` 에 넣는다. 매 턴 `usage` 를 출력한다.
2. 위 챗봇에 "히스토리가 N 토큰(또는 M턴)을 넘으면 가장 오래된 user/assistant 쌍을 버린다"
   규칙을 넣어라. 버린 뒤 모델이 그 내용을 못 답하는 것을 확인하라.
3. `system` 프롬프트를 "재료만 JSON 배열로"로 고정하고, 사용자가 뭘 물어도 형식이 유지되는지
   5개 입력으로 테스트하라. (이게 다음 챕터의 "평가셋"의 씨앗이다.)

<!-- section: check_question -->
## 이해 점검

1. `system`/`developer` 메시지와 `user` 메시지의 역할 차이를 한 문장으로.
2. 5턴짜리 대화의 5번째 호출에서 입력 토큰에 무엇무엇이 들어가나?
3. "context rot" 가 뜻하는 바와, 그래서 프롬프트 설계에서 무엇을 우선해야 하나?
4. `usage` 필드와 token counting API 는 각각 언제 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "LLM API 호출 한 번에 실제로 무엇이 오가나요? 응답에는 텍스트 말고 뭐가 있나요?"
- "챗봇이 대화가 길어질수록 느려지고 비싸지는 이유를 설명해 주세요."
- "컨텍스트 윈도를 초과하면 어떤 일이 생기고, 어떻게 대비하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 메시지 3가지 역할, "요청 안 모든 것이 토큰"의 의미, 멀티턴이 누적된다는 것, 비용이
> 무엇에 비례하는지, 윈도 초과 시 동작을 각각 한 문장으로. 그다음 CLI 챗봇을 코드 없이 말로 설계.

<!-- section: review -->
## 한 줄 정리

**LLM 호출은 역할이 붙은 메시지 배열을 주고받는 것이고, system 프롬프트·히스토리·도구
정의·모델 출력이 전부 토큰으로 컨텍스트 윈도에 들어가며 — 멀티턴은 누적되고, 비용·지연은
그 토큰 수에 비례한다.**
