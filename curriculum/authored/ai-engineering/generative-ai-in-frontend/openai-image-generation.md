---
id: ai-engineering/generative-ai-in-frontend/openai-image-generation
chapter: ai-engineering/generative-ai-in-frontend
title: OpenAI 이미지 생성 API를 React 앱에 붙이기
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [ai, openai, image-generation, react, api-key]
related_material_ids:
  - 10fqbfUnvErZI2L0-iL5rbUwfGLhxq6TNa1bBmPewq-k   # open AI - image generator (vanilla JS, key in localStorage)
  - 1f1uVS9cRS0sGrJv9NUSdBZTwTjSJHMGh              # jv_153-5_image_generator_base.zip
  - 16n0hgBx0COr3XsZGxa4FQSeZRpGLGO96              # jv_153-5_image_generator_final.zip
sources:
  - title: "OpenAI API Reference — Create image"
    url: https://developers.openai.com/api/reference/resources/images/methods/generate
    publisher: "OpenAI"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "OpenAI — Image generation guide"
    url: https://developers.openai.com/api/docs/guides/image-generation
    publisher: "OpenAI"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - javascript/async-and-http/fetch-and-ajax
  - react/state-and-events/usestate-basics
code_examples:
  - slug: request
    title: 이미지 생성 요청 — POST /v1/images/generations
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,     // 절대 코드에 하드코딩하지 않는다
        },
        body: JSON.stringify({
          model: "gpt-image-1",                  // 또는 gpt-image-2 / dall-e-3
          prompt,                                // 사용자가 입력한 설명
          n: 1,                                  // dall-e-3 는 1개만
          size: "1024x1024",                     // 1024x1024 / 1024x1536 / 1536x1024
          // quality: "low" | "medium" | "high"  (gpt-image-*)
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
      const b64 = json.data[0].b64_json;         // 기본은 base64 문자열
      const src = `data:image/png;base64,${b64}`; // <img src> 에 바로
  - slug: react-component
    title: React 컴포넌트로 감싸기
    source_type: generated_minimal
    language: jsx
    code: |
      function ImageGenerator() {
        const [prompt, setPrompt] = useState("");
        const [src, setSrc] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        async function onSubmit(e) {
          e.preventDefault();
          if (!prompt.trim()) return;
          setLoading(true); setError(null);
          try {
            setSrc(await generateImage(prompt));   // 위 fetch 를 함수로
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }

        return (
          <form onSubmit={onSubmit}>
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <button disabled={loading}>{loading ? "생성 중…" : "이미지 생성"}</button>
            {error && <p role="alert">{error}</p>}
            {src && <img src={src} alt={prompt} />}
          </form>
        );
      }
  - slug: key-danger
    title: API 키를 브라우저에 두면 (학습용 최소 구현)
    source_type: generated_minimal
    language: text
    code: |
      수업자료: localStorage 에 키 저장 → 브라우저에서 직접 api.openai.com 호출.
        장점: 서버 없이 바로 실습.
        문제: 네트워크 탭·소스에서 키가 그대로 보인다 → 누구나 내 계정으로 과금 가능.
              (도메인 제한도 없다. OpenAI 키는 순수 비밀이다.)

      => 학습/개인 실습 한정. 절대 배포하지 않는다. 이미 커밋했다면 키를 폐기(revoke)한다.
      운영: 키는 "내 서버"(또는 Supabase Edge Function)에만 두고,
            프런트 → 내 서버 → OpenAI 로 중계한다. → generative-ai-react-app Lesson.
  - slug: cost
    title: 비용·안전 장치
    source_type: generated_minimal
    language: text
    code: |
      - 이미지 생성은 호출당 과금. size·quality·n 이 커질수록 비싸다.
      - OpenAI 대시보드에서 "사용 한도(usage limit)" 와 결제 알림을 설정한다.
      - 프롬프트를 그대로 신뢰하지 않는다(부적절 요청 필터링은 API 정책 + 앱단 확인).
      - 로딩 중 버튼 disabled 로 중복 호출 방지.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- OpenAI **이미지 생성 API**(`POST /v1/images/generations`)의 요청·응답 형태(`model`/`prompt`/`size`,
  `data[0].b64_json`)를 안다.
- base64 응답을 `data:` URL로 만들어 `<img>` 에 표시한다.
- 이 흐름을 **React 컴포넌트**(입력 state, 로딩·에러 분기)로 감싼다.
- **API 키를 브라우저에 두는 것의 위험**과 학습용/운영의 경계를 명확히 구분한다.
- 비용 한도·중복 호출 방지 같은 안전 장치를 건다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `fetch` + `async/await` + `res.ok` 확인, `useState` 제어 폼.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"텍스트를 넣으면 이미지가 나오는" 기능은 직접 만들 수 없다. OpenAI 같은 제공사의 API를 호출한다.
이때 두 가지가 걸린다 — **응답이 URL이 아니라 base64** 라는 점, 그리고 **API 키를 어디에 두느냐**.

<!-- section: concept -->
## 1. 요청과 응답

{{code: request}}

- 엔드포인트: `POST https://api.openai.com/v1/images/generations`.
- `model`: `gpt-image-1`(널리 사용), `gpt-image-2`(최신), `dall-e-3`. `dall-e-3` 는 `n:1` 만.
- `size`: `1024x1024` 등. `quality`(gpt-image-*): `low`/`medium`/`high` — 클수록 느리고 비싸다.
- **응답의 `data[0].b64_json`** 은 base64 문자열. `data:image/png;base64,<b64>` 로 감싸 `<img src>` 에.
- 실패는 `json.error.message` 로 판단(HTTP 200이 아니어도 JSON 본문을 준다).

<!-- section: code | lang: jsx -->
## 2. React 컴포넌트

{{code: react-component}}

수업자료는 바닐라 JS + Bootstrap이지만, React에서는 `prompt`/`src`/`loading`/`error` 를 state로 두고
제어 폼 + 조건부 렌더로 바꾼다. `fetch` 부분(`generateImage`)만 그대로 재사용한다.

<!-- section: mechanism -->
## 3. API 키 — 어디에 두나

{{code: key-danger}}

- 수업자료는 **`localStorage` 에 키를 저장**해 브라우저에서 직접 호출한다. 서버 없이 바로 실습할 수 있어
  교육용으로는 쓰지만, **키가 네트워크 탭·소스에 그대로 노출**된다. OpenAI 키는 도메인 제한이 없는
  **순수 비밀**이라, 노출되면 누구나 내 계정으로 과금할 수 있다.
- 그래서 이 방식은 **개인 실습 한정, 절대 배포 금지.** 이미 공개 저장소에 올렸다면 키를 즉시 **폐기(revoke)**.
- 운영에서는 키를 **내 서버**(또는 Supabase Edge Function)에만 두고 **프런트 → 내 서버 → OpenAI** 로
  중계한다. 그 패턴은 `generative-ai-react-app` 에서 다룬다.

<!-- section: concept | title: 비용·안전 -->
## 4. 비용·안전 장치

{{code: cost}}

<!-- section: must_know -->
## 반드시 기억할 것

- `POST /v1/images/generations`, `{ model, prompt, size, n }`. 응답은 **`data[0].b64_json`**(base64).
- 화면 표시: `` `data:image/png;base64,${b64}` `` → `<img src>`.
- 실패 판정은 `json.error.message`. 로딩 중 버튼 `disabled` 로 중복 호출 방지.
- **브라우저에 API 키를 두는 건 학습용 최소 구현.** OpenAI 키는 순수 비밀(도메인 제한 없음) — 노출되면 즉시 폐기, 배포 금지.
- 운영은 **키를 서버에만** 두고 프런트가 내 서버를 부르게 한다(→ 다음 Lesson).
- 이미지 생성은 호출당 과금 — 대시보드에서 **사용 한도·결제 알림**을 건다.

<!-- section: experiment -->
## 직접 해 보기

1. 개인 실습용 OpenAI 키를 발급하고 **사용 한도**를 낮게 설정하라.
2. 바닐라 예제(`image_generator_base.zip`)를 열어 `fetch` 로 이미지를 생성하고 `<img>` 에 표시하라.
3. `n`/`size`/`quality` 를 바꿔 응답 시간과 결과를 비교하라.
4. 같은 기능을 React 컴포넌트로 옮겨 로딩 문구·에러 메시지·중복 호출 방지를 넣어라.
5. 개발자도구 네트워크 탭에서 요청 헤더의 `Authorization` 에 키가 그대로 보이는 것을 확인하라(그리고 이 앱을 배포하지 않는다).

<!-- section: check_question -->
## 이해 점검

1. 이미지 API 응답은 URL인가? 화면에 어떻게 표시하나?
2. `res.ok` 가 아닐 때 에러 이유는 어디서 읽나?
3. `localStorage` 에 OpenAI 키를 두면 정확히 무엇이 위험한가?
4. 운영에서는 키를 어디에 두고, 요청 경로가 어떻게 바뀌나?
5. 비용 사고를 막는 장치 두 가지는?

<!-- section: interview_question -->
## 면접 대비

- "프런트엔드에서 서드파티 AI API 키를 다뤄야 할 때 어떻게 보호하나요?"
- "클라이언트에서 직접 호출 vs 백엔드 프록시의 트레이드오프는?"
- "생성형 API의 비용·오남용 리스크를 어떻게 통제하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> POST /v1/images/generations({model,prompt,size}), 응답 data[0].b64_json → data:URL,
> 키 localStorage=학습용 최소 구현·배포 금지·순수 비밀, 운영은 서버 프록시, 사용 한도·중복 방지를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**OpenAI 이미지 생성은 `POST /v1/images/generations` 에 `{model, prompt, size}` 를 보내고 `data[0].b64_json` 을
`data:` URL로 만들어 표시하며 React에서는 state+제어 폼으로 감싼다 — 브라우저에 키를 두는 건 학습용
최소 구현이고, 운영은 반드시 키를 서버에만 두고 프록시한다.**
