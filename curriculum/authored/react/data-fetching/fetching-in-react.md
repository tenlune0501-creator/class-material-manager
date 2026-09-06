---
id: react/data-fetching/fetching-in-react
chapter: react/data-fetching
title: React에서 Ajax/fetch로 데이터 연동
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [react, ajax, fetch, useEffect, data-fetching]
related_material_ids:
  - 1WCflwTKb_6J-dTa7l71JNirtxcfa-mIGeYMPOhD_UoM   # 13. ajax
  - 1wUgE9qmUV6Xj-AxPGifPv9OhzHxQcaBfwhKtyFzy6OI   # REACT basic mission v2-ajax
  - 1AEIr3Ugsq_zDPjbuWAjNO9LEzRDGs7tk              # react-ajax-ex_v202606.zip
  - 1a63pT8qv_jVoOdSsM4audNDYIQj4CWa7DA0IMt7AAwM   # 04 웹서버와 DB 연동하기 (CORS)
prerequisites:
  - react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
  - javascript/objects-and-builtins/builtin-objects
code_examples:
  - slug: fetch-effect
    title: fetch + 3-상태 (loading / error / data)
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function Posts() {
        const [posts, setPosts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          let cancelled = false;
          setLoading(true);
          setError(null);
          fetch("/api/posts")
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);  // fetch 는 404/500 을 reject 안 함!
              return res.json();
            })
            .then((data) => { if (!cancelled) setPosts(data); })
            .catch((err) => { if (!cancelled) setError(err); })
            .finally(() => { if (!cancelled) setLoading(false); });
          return () => { cancelled = true; };
        }, []);

        if (loading) return <p>로딩…</p>;
        if (error)   return <p>오류: {error.message}</p>;
        return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
      }
  - slug: post-mutate
    title: 보내기(POST) + 목록 갱신
    source_type: generated_minimal
    language: jsx
    code: |
      async function addPost(title) {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error("생성 실패");
        const created = await res.json();
        setPosts((prev) => [created, ...prev]);   // 다시 GET 하거나, 응답으로 로컬 갱신
      }
  - slug: env-url
    title: API 주소는 환경변수로
    source_type: generated_minimal
    language: js
    code: |
      // .env.development :  VITE_API_URL=http://localhost:4000
      // .env.production  :  VITE_API_URL=https://api.example.com
      const API = import.meta.env.VITE_API_URL;
      fetch(`${API}/posts`);
      // 브라우저 → 다른 도메인 API 호출 시 서버가 CORS 헤더를 줘야 함 (04 웹서버와 DB 연동 자료)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `useEffect` 안에서 `fetch` 로 데이터를 가져와 **loading / error / data** 3-상태로 렌더한다.
- `fetch` 가 **404/500 을 reject 하지 않는다**는 함정(`res.ok` 확인)을 안다.
- POST 로 보내고 응답으로 로컬 목록을 갱신한다.
- API 주소를 환경변수로 두고, **CORS** 가 무엇인지 안다.
- 실무에서는 React Query/SWR 로 이 로직을 대체한다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useEffect`(의존성, cleanup, 경쟁 조건), Promise/`async-await`, `fetch` 기본, JSON.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 렌더 본문에서 `fetch` → 무한 요청.
- `fetch` 응답이 404 인데 `catch` 로 안 들어와서 에러 처리가 안 됨.
- 로딩 중 빈 화면, 에러 시 깨진 화면 (3-상태를 안 나눔).
- API 주소를 코드에 하드코딩 → 개발/배포 환경에서 못 바꿈.

<!-- section: concept -->
## fetch + 3-상태

{{code: fetch-effect}}

- 데이터 화면 = **`loading`(로딩 중), `error`(실패), `data`(성공)** 세 갈래. 각각 다른 UI.
- `fetch` 는 `useEffect` 안에서. 의존성에 따라 재요청(`[id]` 등).
- 경쟁 조건 방지: `cancelled` 플래그(정리 함수) — 빠른 파라미터 변경 시 옛 응답 무시.
- **함정**: `fetch` 는 네트워크 자체가 실패해야 reject 한다. **404·500 은 정상 resolve** → `if (!res.ok) throw` 로 직접 에러 처리.

<!-- section: mechanism -->
## 보내기 + 갱신

{{code: post-mutate}}

- POST/PUT/DELETE: `fetch(url, { method, headers, body: JSON.stringify(...) })`.
- 성공 후 목록을 최신화하는 방법 2가지: **다시 GET** 하거나, **응답으로 로컬 state 를 불변 갱신**.
- 낙관적 업데이트(먼저 화면 바꾸고 실패 시 롤백)는 고급 — 나중에.

<!-- section: code | lang: js -->
## 환경변수 + CORS

{{code: env-url}}

- API 주소는 **`import.meta.env.VITE_API_URL`** (Vite 는 `VITE_` 접두사만 노출). `.env.development` / `.env.production`.
- 브라우저에서 **다른 도메인** API 를 부르면 → 서버가 **CORS 응답 헤더**(`Access-Control-Allow-Origin` 등)를 줘야 한다.
  안 주면 브라우저가 차단(강사 자료 `04 웹서버와 DB 연동하기`). 이건 **서버 설정**이지 프론트에서 못 고친다.

<!-- section: must_know -->
## 반드시 기억할 것

- `fetch` 는 **`useEffect` 안**. 3-상태(loading/error/data)로 UI 를 나눈다.
- **`fetch` 는 404/500 을 에러로 안 본다** → `if (!res.ok) throw`.
- `res.json()` 도 Promise (`await` 또는 `.then`).
- 경쟁 조건: `cancelled` 플래그로 옛 응답 버리기.
- API 주소는 환경변수. `VITE_` 접두사(Vite).
- CORS 는 **서버가 헤더를 줘야** 풀린다. 프론트 코드로 못 우회.
- 실무: **React Query / SWR** 가 캐시·재요청·로딩·에러·경쟁조건을 다 해 준다 → 프로젝트가 커지면 도입.

<!-- section: experiment -->
## 직접 해 보기

1. 공개 API(예: `https://jsonplaceholder.typicode.com/posts`)로 목록을 3-상태로 렌더하라.
   일부러 잘못된 경로로 바꿔 `res.ok` 체크가 있을 때/없을 때 동작을 비교.
2. `Network` 탭에서 응답을 느리게(throttle) 해 로딩 UI 를, 오프라인으로 만들어 에러 UI 를 확인.
3. POST 로 새 항목을 보내고 응답으로 목록 맨 앞에 추가하라(불변 업데이트).
4. `id` 를 빠르게 두 번 바꿔 경쟁 조건을 재현하고 `cancelled` 로 고쳐라.

<!-- section: check_question -->
## 이해 점검

1. `fetch` 로 데이터 화면을 만들 때 나눠야 하는 3가지 상태는?
2. `fetch` 로 받은 응답이 404 인데 `catch` 로 안 가는 이유와 해결책은?
3. API 주소를 환경변수로 두는 이유는?
4. CORS 에러는 어디서(누가) 고쳐야 하나?

<!-- section: interview_question -->
## 면접 대비

- "`fetch` 의 에러 처리에서 흔한 실수는?"
- "데이터 패칭 라이브러리(React Query 등)가 직접 `useEffect`+`fetch` 대비 주는 이점은?"
- "CORS 를 설명하고, 프론트엔드가 할 수 있는 것과 없는 것을 말해 주세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> useEffect 안 fetch, 3-상태, res.ok 함정, 경쟁 조건, 환경변수 API URL, CORS 는 서버 책임,
> 라이브러리로 대체를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`useEffect` 안에서 `fetch` → loading/error/data 3-상태로 렌더한다 — `fetch` 는 404/500 을 에러로 안 보니
`res.ok` 를 확인하고, 경쟁 조건은 플래그로, API 주소는 환경변수로, CORS 는 서버가 푼다.**

<!-- section: next -->
## 다음 Chapter

`react/state-management` — Context 와 Redux.
