---
id: ai-engineering/generative-ai-in-frontend/alan-api
chapter: ai-engineering/generative-ai-in-frontend
title: alan API 사용하기
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [ai, alan-api, integration]
related_material_ids:
  - 1JkD6XwOOUHfmil1eLM3CTGGbpbgMZI-M9j-sIfnFp9M   # alan API (Vite React + dev proxy + GET /question)
prerequisites:
  - javascript/async-and-http/fetch-and-ajax
  - react/data-fetching/fetching-in-react
code_examples:
  - slug: env-proxy
    title: .env + Vite dev proxy (CORS 우회)
    source_type: generated_minimal
    language: js
    code: |
      // .env  (gitignore)
      // VITE_CLIENT_ID=여기에_발급받은_클라이언트_ID

      // vite.config.js
      export default defineConfig({
        plugins: [react()],
        server: {
          proxy: {
            "/api": {
              target: "https://kdt-api-function.azurewebsites.net", // 실제 API 호스트
              changeOrigin: true,   // Origin 헤더를 target 기준으로 (Azure 등이 요구)
              secure: true,
            },
          },
        },
      });
      // 브라우저는 /api/... (동일 출처) 로 요청 → Vite 가 실제 호스트로 중계 → CORS 회피
      // ⚠️ proxy 는 dev 서버(npm run dev) 에서만. 배포 빌드에는 적용 안 됨.
  - slug: request
    title: GET /question — 질문 보내고 답 받기
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      const API_BASE = "/api/v1";
      const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

      async function getAnswer(question) {
        const qs = new URLSearchParams({ content: question, client_id: CLIENT_ID });
        //         ↑ URLSearchParams: 공백·한글을 자동 인코딩 (문자열 조합보다 안전)
        const res = await fetch(`${API_BASE}/question?${qs}`);
        const data = await res.json();
        // 응답 형태가 여러 가지일 수 있어 방어적으로 꺼낸다
        if (typeof data?.answer === "string") return data.answer;
        if (typeof data?.content === "string") return data.content;
        return JSON.stringify(data, null, 2); // 에러/디버그 응답은 전체 출력
      }
  - slug: component
    title: React 컴포넌트
    source_type: generated_minimal
    language: jsx
    code: |
      function ApiTest() {
        const [question, setQuestion] = useState("");
        const [output, setOutput] = useState("결과가 아직 없습니다.");

        async function onSubmit(e) {
          e.preventDefault();
          setOutput("요청 중…");                 // 지연 대비 즉시 피드백
          try {
            setOutput(await getAnswer(question));
          } catch (err) {
            setOutput(`에러: ${err.message}`);
          }
        }

        return (
          <form onSubmit={onSubmit}>
            <p>CLIENT_ID: {CLIENT_ID ? "OK" : "없음"}</p>  {/* env 반영 확인 */}
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
            <button>질문</button>
            <pre>{output}</pre>
          </form>
        );
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **강의용 alan AI API**(EST 오르미의 `kdt-api-function`)를 Vite React 앱에서 호출한다.
- `client_id` 를 **`.env`(gitignore)** 로 관리하고 `import.meta.env` 로 읽는다.
- **Vite dev proxy**(`server.proxy`)로 개발 중 CORS를 우회하고, 그것이 dev 전용임을 안다.
- `URLSearchParams` 로 쿼리스트링을 안전하게 만들고, 응답을 방어적으로 파싱한다.
- 지연 대비 로딩 표시·에러 분기를 넣는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `fetch` + `async/await`, `useState` 제어 폼, 쿼리스트링 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

강의에서 제공하는 AI API를 React 앱에 붙이려는데, (1) 브라우저에서 다른 도메인 API를 부르면
**CORS**로 막히고, (2) `client_id` 를 코드에 박으면 깃에 노출된다.

<!-- section: concept -->
## 1. .env + dev proxy

{{code: env-proxy}}

- `VITE_` 접두사 값만 `import.meta.env` 로 노출된다. `.env` 는 `.gitignore`.
- **Vite dev proxy**: 브라우저는 `/api/...`(동일 출처)로 요청 → Vite dev 서버가 실제 API 호스트로
  중계 → 브라우저 입장에서 CORS가 없다. `changeOrigin: true` 는 대상 서버가 `Origin` 헤더를 볼 때 필요.
- **주의: proxy는 `npm run dev` 에서만.** 배포하면 이 중계가 없다 → 배포 환경은 별도 대응
  (내 서버/함수 경유, 또는 API가 CORS를 허용).

<!-- section: code | lang: jsx -->
## 2. 요청

{{code: request}}

- `URLSearchParams({ content, client_id })` — 공백은 `%20`, 한글은 UTF-8로 자동 인코딩. 문자열
  직접 조합보다 오류가 적다.
- 응답이 `{ answer }` 또는 `{ content }` 또는 에러 객체로 올 수 있어 **방어적으로** 꺼낸다.

<!-- section: mechanism -->
## 3. 컴포넌트

{{code: component}}

- 요청 전에 `setOutput("요청 중…")` — 네트워크 지연에 화면이 멈춘 것처럼 보이지 않게.
- `CLIENT_ID ? "OK" : "없음"` 표시로 env가 제대로 로드됐는지 눈으로 확인(흔한 실수: `.env` 수정 후
  dev 서버 재시작 안 함).

<!-- section: must_know -->
## 반드시 기억할 것

- `client_id` 는 `.env`(gitignore) + `import.meta.env.VITE_...`. `.env` 수정 후 **dev 서버 재시작**.
- **Vite dev proxy** 로 개발 중 CORS 우회 — `npm run dev` 전용, 배포엔 적용 안 됨.
- 쿼리스트링은 **`URLSearchParams`** 로. 응답은 형태가 여러 가지일 수 있으니 방어적으로 파싱.
- 요청 시작 시 로딩 표시, 실패 시 에러 분기.
- 이건 **강의용 API**다(범용 OpenAI 등과 다름). API 명세(오르미 Notion / `/docs`)를 기준으로 파라미터를 맞춘다.
- `client_id` 도 결국 브라우저에 나가는 값이다 — 강의용이라 허용되지만, 일반 서비스라면 서버 경유가 원칙.

<!-- section: experiment -->
## 직접 해 보기

1. Vite React 프로젝트를 만들고 `.env` 에 `VITE_CLIENT_ID` 를 넣어라. 화면에 "OK/없음" 을 표시해 확인.
2. `vite.config.js` 에 `/api` proxy 를 설정하고, `changeOrigin` 을 빼서 요청이 거부되는지 관찰한 뒤 되돌려라.
3. `URLSearchParams` 로 쿼리를 만들어 `GET /api/v1/question?content=...&client_id=...` 를 호출하고 답을 `<pre>` 에 출력하라.
4. 일부러 `client_id` 를 틀리게 넣어 에러 응답을 받아 보고, 방어적 파싱이 전체 JSON을 보여주는지 확인하라.
5. `npm run build && npm run preview` 로 배포본에서 `/api` 가 동작하지 않는 것을 확인하라(proxy는 dev 전용).

<!-- section: check_question -->
## 이해 점검

1. `.env` 값을 바꿨는데 반영이 안 된다. 왜인가?
2. Vite dev proxy는 어떤 문제를 푸나? 배포 후에도 되나?
3. `changeOrigin: true` 는 왜 필요할 수 있나?
4. 쿼리스트링을 문자열로 직접 잇지 않고 `URLSearchParams` 를 쓰는 이유는?
5. 응답을 `data.answer ?? data.content ?? 전체 JSON` 순으로 꺼내는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "개발 중 CORS를 우회하는 방법들(dev proxy, CORS 헤더, 백엔드 프록시)과 각각의 적용 범위는?"
- "외부 API 응답 형태가 불안정할 때 파싱을 어떻게 방어하나요?"
- "클라이언트에 노출되는 식별자/키를 어떻게 취급하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> .env(VITE_)+재시작, Vite dev proxy(dev 전용, changeOrigin), URLSearchParams 인코딩,
> 방어적 응답 파싱(answer/content/전체), 로딩·에러 분기를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**alan API는 Vite React에서 `.env` 의 `client_id` 와 dev proxy(`/api` → 실제 호스트, CORS 우회, dev 전용)로
호출한다 — 쿼리는 `URLSearchParams` 로 인코딩하고 응답은 `answer`/`content`/전체 JSON 순으로 방어적으로
꺼내며, 배포 환경의 CORS는 별도로 대응한다.**
