---
id: ai-engineering/generative-ai-in-frontend/generative-ai-react-app
chapter: ai-engineering/generative-ai-in-frontend
title: 생성형 AI를 쓰는 React 앱
mastery: practical
lesson_kind: lesson
estimated_minutes: 50
tags: [ai, generative-ai, react, integration]
related_material_ids:
  - 1G-txw9xv7fa5BMU2lE7yLk5GcTSLlN46zjol5S3rKLE   # 생성형 AI - React App (Supabase Edge Function + OpenAI)
sources:
  - title: "Supabase — Edge Functions"
    url: https://supabase.com/docs/guides/functions
    publisher: "Supabase"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "OpenAI API Reference — Chat Completions"
    url: https://developers.openai.com/api/reference/resources/chat/methods/create
    publisher: "OpenAI"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - ai-engineering/generative-ai-in-frontend/openai-image-generation
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
code_examples:
  - slug: architecture
    title: 구조 — 프런트는 내 함수만 부른다
    source_type: generated_minimal
    language: text
    code: |
      [React]  --POST { title }-->  [Supabase Edge Function (Deno)]
                                       ├─ OPENAI_API_KEY = Deno.env.get(...)   ← 키는 서버에만
                                       ├─ fetch chat/completions  (레시피 텍스트)
                                       ├─ fetch images/generations (음식 이미지, b64)
                                       ├─ Storage 업로드 → 공개 URL
                                       └─ DB insert (title, recipe, image_url)
                                    <--  { title, recipe, image_url }
      브라우저는 OpenAI 를 직접 부르지 않는다 → 키 노출 없음, CORS 는 함수가 처리.
  - slug: edge-function
    title: Edge Function 골격 (Deno)
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY"); // supabase secrets set 으로 등록

      function json(body: unknown, status = 200) {
        return Response.json(body, { status });
      }

      Deno.serve(async (req) => {
        if (req.method === "OPTIONS") return new Response("ok", { headers: CORS }); // 사전 요청
        if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
        if (!OPENAI_API_KEY) return json({ error: "missing_env" }, 500);

        const { title } = await req.json();
        if (!title?.trim()) return json({ error: "title_required" }, 400);

        // 1) 레시피 텍스트
        const chat = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "2인분 기준으로 재료·단계·시간·팁을 간결하게." },
              { role: "user", content: `요리명: ${title}` },
            ],
          }),
        }).then((r) => r.json());
        const recipe = chat?.choices?.[0]?.message?.content ?? "";

        // 2) 이미지 (b64) — openai-image-generation Lesson 과 동일한 호출
        // 3) Storage 업로드 → publicUrl,  4) DB insert
        return json({ title, recipe /*, image_url */ });
      });
  - slug: front-call
    title: 프런트 — 내 함수 호출
    source_type: generated_minimal
    language: jsx
    code: |
      const { data, error } = await supabase.functions.invoke("recipe", {
        body: { title },
      });
      // 또는 fetch(`${SUPABASE_URL}/functions/v1/recipe`, { method:"POST",
      //   headers:{ Authorization:`Bearer ${ANON_KEY}`, "Content-Type":"application/json" },
      //   body: JSON.stringify({ title }) })
      if (error) setError(error.message);
      else setResult(data); // { title, recipe, image_url }
  - slug: llm-notes
    title: LLM 호출에서 신경 쓸 것
    source_type: generated_minimal
    language: text
    code: |
      - 응답이 느리다(수 초) → 로딩 표시 필수, 필요하면 스트리밍(SSE).
      - 응답은 확률적이다 → 같은 입력에도 매번 다름. 형식이 필요하면 프롬프트로 강하게 지시하거나 구조화 출력.
      - 실패/타임아웃/레이트리밋(429)을 분기 처리.
      - 비용은 토큰 수(입력+출력)에 비례 → system 프롬프트를 짧게, max 토큰 제한.
      - 사용자 입력을 프롬프트에 그대로 넣을 때 프롬프트 인젝션 가능성 인지.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 생성형 AI 기능을 **"프런트 → 내 서버(Edge Function) → OpenAI"** 로 중계하는 구조를 만든다.
- **API 키가 서버 환경변수에만** 있고 브라우저에 노출되지 않는 이유를 안다.
- Chat Completions(텍스트) + Images(이미지)를 한 함수에서 조합하고 결과를 DB/Storage에 저장한다.
- LLM 호출 특유의 고려사항(지연·비확정성·실패·비용)을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 앞 Lesson(이미지 API + 키 위험), Supabase 기초(Edge Function·Storage·DB·RLS).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

앞 Lesson처럼 브라우저에서 OpenAI를 직접 부르면 키가 노출된다(배포 불가). 실제 앱은
**키를 숨길 곳**이 필요하다. 별도 Express 서버를 세우는 대신, **Supabase Edge Function**
(서버리스, Deno)을 쓰면 인프라 없이 "내 서버" 자리를 만들 수 있다.

<!-- section: concept -->
## 1. 구조

{{code: architecture}}

수업자료의 예제: **요리명을 입력하면 레시피(텍스트) + 음식 이미지를 생성해 DB에 저장**한다.

- 브라우저는 **내 Edge Function 하나**만 호출한다.
- 함수 안에서 `Deno.env.get("OPENAI_API_KEY")` — 키는 **`supabase secrets set` 으로 등록한 서버 환경변수**.
  빌드 산출물에도, 네트워크에도 안 나온다.
- CORS도 함수가 처리(브라우저 사전 `OPTIONS` 요청에 헤더만 응답).

<!-- section: code | lang: ts -->
## 2. Edge Function 골격

{{code: edge-function}}

- Deno 런타임: `.ts` 바로 실행, `npm` 없이 `jsr:`/`npm:` URL로 모듈, 파일·네트워크 권한이 기본 차단.
- 순서: 메서드 검사 → 환경변수 검사 → 입력 검증 → OpenAI 호출(들) → (이미지 base64를) Storage 업로드 →
  DB `insert` → JSON 응답. 각 단계에서 실패하면 적절한 상태 코드.
- DB 쓰기는 **service role(관리자) 클라이언트**로(RLS 우회) — 서버 안에서만 쓰므로 안전.

<!-- section: mechanism -->
## 3. 프런트 호출

{{code: front-call}}

`supabase.functions.invoke("recipe", { body: { title } })` 또는 그 함수 URL로 `fetch`.
응답(`{ title, recipe, image_url }`)을 state에 담아 렌더.

<!-- section: concept | title: LLM 특성 -->
## 4. LLM 호출의 특성

{{code: llm-notes}}

일반 REST API와 다른 점: **느리고(수 초), 매번 다른 답이 나오고(확률적), 토큰 수만큼 과금된다.**
로딩 표시·실패 분기·비용 상한을 항상 함께 설계한다. (자세한 프롬프트·토큰·평가는 `llm-app-fundamentals` 챕터.)

<!-- section: must_know -->
## 반드시 기억할 것

- 구조: **프런트 → 내 Edge Function → OpenAI.** 키는 `supabase secrets` 로 **서버 환경변수에만**.
- Edge Function = 서버리스 Deno. CORS·인증·DB(admin)까지 그 안에서.
- 한 함수에서 여러 AI 호출(텍스트+이미지) 조합 + Storage/DB 저장이 가능.
- LLM 응답은 **느리고 비확정적** → 로딩·재시도·형식 지시. 429/타임아웃 분기.
- 비용은 **토큰(입력+출력)** 비례 → system 프롬프트 짧게, 출력 상한.
- 사용자 입력을 프롬프트에 넣을 때 **프롬프트 인젝션** 가능성을 인지한다.

<!-- section: experiment -->
## 직접 해 보기

1. Supabase 프로젝트 + `recipes` 테이블을 만들고 `supabase functions new recipe` 로 함수를 생성하라.
2. `supabase secrets set OPENAI_API_KEY=...` 로 키를 등록하라(로컬 `.env` 에 두지 않는다).
3. 함수에서 Chat Completions로 레시피 텍스트를 생성해 JSON으로 반환하라. `supabase functions serve` 로 로컬 테스트.
4. 이미지 생성(b64)을 추가해 Storage에 올리고 `image_url` 을 DB에 저장하라.
5. React에서 `functions.invoke` 로 호출해 결과를 표시하라. 네트워크 탭에 OpenAI 키가 **안** 보이는 걸 확인.
6. 없는 `title` / 429 상황을 만들어 에러 메시지 분기를 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 왜 브라우저에서 OpenAI를 직접 부르지 않고 Edge Function을 거치나?
2. `OPENAI_API_KEY` 는 어디에 저장되고, 어디에는 없나?
3. 한 Edge Function에서 텍스트와 이미지 생성을 둘 다 하려면 순서가 어떻게 되나?
4. LLM API가 일반 REST와 다른 점 세 가지는?
5. 비용을 줄이는 방법 두 가지는?

<!-- section: interview_question -->
## 면접 대비

- "생성형 AI 기능을 제품에 붙일 때 API 키와 비용을 어떻게 관리하나요?"
- "서버리스 함수(Edge Function/Lambda)로 LLM 호출을 중계하는 이유와 한계는?"
- "LLM 응답의 비확정성·지연을 UX에서 어떻게 다루나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 프런트→Edge Function→OpenAI(키는 secrets), Deno 함수에서 CORS·검증·AI 호출·Storage·DB,
> functions.invoke 호출, LLM 특성(느림·비확정·토큰 과금·인젝션)을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**생성형 AI 앱은 브라우저가 OpenAI를 직접 부르지 않고 Supabase Edge Function을 거친다 — 키는
`supabase secrets` 의 서버 환경변수에만 두고, 함수 안에서 Chat/Images 호출·Storage·DB를 조합하며,
LLM 응답의 지연·비확정성·토큰 과금을 UX와 비용 설계에 반영한다.**
