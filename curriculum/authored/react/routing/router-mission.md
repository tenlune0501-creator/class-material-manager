---
id: react/routing/router-mission
chapter: react/routing
title: 실전 — 라우터 미션
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [react, react-router, practice, mission]
related_material_ids:
  - 1QY0VqaDsQsLBtctH7PwB1SGWGhpj1n3GUXtJmvbOiy0   # router - mission 5
  - 1nL6ZmqlkdfHgneWfSILL6V89jeajAbPRhlkwxrqiEHI   # router - mission manual_2026 (Router + Ajax Blog)
  - 1ob-o3WlDEiyF_udGfhA4MQTB_fG8UP8f              # ajax-router-mission_base.zip
prerequisites:
  - react/routing/react-router-dom
  - react/data-fetching/fetching-in-react
  - react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
code_examples:
  - slug: nested-layout
    title: 중첩 라우트 + Layout + Outlet
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      // App.jsx
      import { Routes, Route } from "react-router-dom";

      <Routes>
        <Route path="/" element={<Layout loaded={loaded} />}>
          <Route index element={<Home posts={posts} />} />        {/* / */}
          <Route path="posts" element={<Posts posts={posts} />} />
          <Route path="posts/:id" element={<PostDetail posts={posts} />} />
          <Route path="posts/new" element={<PostNew />} />
          <Route path="posts/:id/edit" element={<PostEdit posts={posts} />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      // Layout.jsx — 공통 Header + 로딩 게이트
      function Layout({ loaded }) {
        return (
          <div>
            <Header />
            {!loaded ? <p>로딩 중…</p> : <Outlet />}  {/* 자식 라우트가 여기 */}
          </div>
        );
      }
  - slug: load-once
    title: 앱 시작 시 1회 데이터 로드 — async in useEffect
    source_type: generated_minimal
    language: jsx
    code: |
      const [posts, setPosts] = useState([]);
      const [loaded, setLoaded] = useState(false); // "요청 끝났나" 깃발

      useEffect(() => {
        let alive = true; // 언마운트 후 setState 방지 (경쟁 상태)
        (async () => {   // useEffect 콜백은 async 불가 → 안에서 IIFE
          try {
            const res = await fetch("/data/blog.json"); // 절대경로! (상세 새로고침 대비)
            if (!res.ok) throw new Error("초기 데이터 로드 실패");
            const data = await res.json();
            if (alive) setPosts(data);
          } catch (e) {
            if (alive) setPosts([]);
          } finally {
            if (alive) setLoaded(true);
          }
        })();
        return () => { alive = false; };
      }, []);
      // 더 나은 방법: AbortController 로 fetch 자체를 취소
  - slug: navlink-end
    title: NavLink 활성 표시 — end 옵션
    source_type: generated_minimal
    language: jsx
    code: |
      // React Router 는 기본이 prefix 매치 → "/" 는 /posts 에서도 active 가 된다
      <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
      <NavLink to="/posts" className={({ isActive }) => isActive ? "active" : ""}>Posts</NavLink>
      // end = "to 와 정확히 일치할 때만 active"
  - slug: client-crud
    title: 클라이언트 상태로 CRUD (백엔드 없이)
    source_type: generated_minimal
    language: jsx
    code: |
      // posts 는 App 이 소유. 자식에 변경 함수를 내려 준다
      const addPost = (p) => setPosts((prev) => [...prev, { ...p, id: nextId(prev) }]);
      const editPost = (id, patch) =>
        setPosts((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      const removePost = (id) => setPosts((prev) => prev.filter((x) => x.id !== id));

      // PostNew: 폼 제출 → addPost → navigate("/posts")
      // 주의: 새로고침하면 초기 blog.json 으로 되돌아간다 (읽기 전용 원본).
      //       영속화하려면 localStorage 나 실제 API 가 필요.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `react-router` 로 **중첩 라우트 + `Layout`/`Outlet`** 구조의 블로그를 조립한다.
- 앱 시작 시 데이터를 **한 번** 로드하고, `loaded` 깃발로 첫 렌더의 잘못된 UI를 막는다.
- `useEffect` 안에서 async를 쓰는 올바른 패턴(IIFE + `alive`/`AbortController`)을 안다.
- `NavLink` 의 `end`, 정적 데이터(`public/*.json` vs `src/*.json`), 절대경로의 이유를 안다.
- 목록·상세·작성·수정·삭제·404를 라우팅 하나로 엮는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `react/routing/react-router-dom`(Routes/Route/Link/NavLink/useParams/useNavigate/Outlet),
  `useEffect` 데이터 페칭. (설치: `npm i react-router` — v7은 패키지명이 `react-router`, v6은 `react-router-dom`. import는 동일 계열.)

<!-- section: dev_problem -->
## 미션 — Router + Ajax Blog

`ajax-router-mission_base.zip` 에서 시작해, 다음을 만든다:

| 경로 | 화면 |
|---|---|
| `/` | 홈 (최근 글 몇 개) |
| `/posts` | 글 목록 |
| `/posts/:id` | 글 상세 (없는 id는 404 또는 안내) |
| `/posts/new` | 글 작성 → 제출 후 목록으로 |
| `/posts/:id/edit` | 글 수정 |
| `*` | NotFound |

데이터는 `public/data/blog.json` 을 `fetch` 로 읽는다(실제 API 흐름 연습).

<!-- section: concept -->
## 1. 골격 — 중첩 라우트 + Layout

{{code: nested-layout}}

- `Layout` 이 `Header` 를 공통으로 들고, 자식 라우트는 `<Outlet />` 자리에 렌더된다.
- `<Route index element={<Home />} />` — 부모 경로(`/`) 자체일 때의 기본 화면.
- `path="*"` 로 404를 꼭 둔다.

<!-- section: mechanism -->
## 2. 데이터 1회 로드 + loaded 깃발

{{code: load-once}}

- 앱이 처음 뜰 때 `posts` 는 `[]` 다. 이 상태로 `Home`/`Posts`/`PostDetail` 을 그리면
  "글이 없습니다", "존재하지 않는 id" 같은 **잘못된 UI**가 잠깐 보인다.
- `loaded` 깃발: `false`(요청 중) → `true`(성공/실패 무관, 요청 종료). `Layout` 에서
  `!loaded` 면 로딩 문구만.
- **`useEffect` 콜백은 `async` 로 만들 수 없다**(정리 함수 대신 Promise를 반환하게 됨).
  안에서 **IIFE**(`(async () => { ... })()`)를 쓰거나 별도 함수를 정의해 호출한다.
- 언마운트 후 `setState` 경고를 막으려면 `alive` 깃발 또는 **`AbortController`**(요청 자체 취소, 권장).
- `fetch("/data/blog.json")` — **절대경로**. 상대경로면 `/posts/1` 에서 새로고침 시
  `/posts/data/blog.json` 을 찾아 404난다.

<!-- section: concept | title: NavLink · 정적 데이터 -->
## 3. NavLink end · 정적 데이터 위치

{{code: navlink-end}}

- `public/data/*.json` = 정적 자산. 빌드 시 그대로 복사, `fetch` 로 읽음 → **실제 API 연습에 적합**.
- `src/data.json` = 번들에 포함, `import` 로 즉시 사용 → 초기 state·예제용.
- 이 미션은 "Ajax" 연습이므로 `public` + `fetch`.

<!-- section: concept | title: CRUD -->
## 4. 작성·수정·삭제 (클라이언트 상태)

{{code: client-crud}}

- 백엔드가 없으므로 `posts` 를 `App` state로 두고 변경 함수를 자식에 내린다.
- **새로고침하면 원본 `blog.json` 으로 되돌아간다** — `blog.json` 은 읽기 전용 원본.
  영속화하려면 `localStorage` 또는 실제 API(다음 단계: `board-crud-app`).

<!-- section: must_know -->
## 반드시 기억할 것

- 공통 레이아웃 = **중첩 라우트 + `<Outlet />`**. `index` 라우트로 부모 경로 기본 화면.
- 앱 시작 데이터는 `useEffect([])` 1회 + **`loaded` 깃발**로 첫 렌더 방어.
- `useEffect` 콜백은 async 금지 → 내부 **IIFE**. 정리로 `alive=false` 또는 `AbortController`.
- `fetch` 경로는 **절대경로**(`/data/...`). 상세 새로고침 대비.
- `NavLink to="/"` 에는 **`end`**.
- 백엔드 없는 CRUD는 새로고침 시 초기화됨을 인지하고 연습한다.

<!-- section: experiment -->
## 미션 체크리스트

1. base zip에서 6개 라우트 + `Layout`/`Outlet` + `Header`(NavLink `end`)를 구성하라.
2. `public/data/blog.json` 을 `useEffect` IIFE로 로드하고 `loaded` 로 로딩 문구를 띄워라.
3. `fetch` 를 상대경로로 바꿔 `/posts/1` 새로고침 시 깨지는 걸 확인한 뒤 절대경로로 되돌려라.
4. `/posts/:id` 에서 없는 id면 안내 + 홈 링크를 렌더하라.
5. `/posts/new` 폼 제출 → `addPost` → `navigate("/posts")`. 새로고침하면 사라지는 걸 확인하라.
6. `AbortController` 로 언마운트 시 요청을 취소하도록 바꿔 보라.

<!-- section: check_question -->
## 이해 점검

1. `Layout` 의 `<Outlet />` 자리에는 무엇이 들어오나?
2. `loaded` 깃발이 없으면 어떤 화면이 잠깐 보이나?
3. `useEffect(async () => {...})` 가 왜 문제이고, 어떻게 우회하나?
4. `fetch("data/blog.json")` (상대경로)이 `/posts/1` 에서 실패하는 이유는?
5. `NavLink to="/"` 에 `end` 가 없으면?

<!-- section: interview_question -->
## 면접 대비

- "SPA에서 공통 레이아웃과 페이지별 콘텐츠를 어떻게 분리하나요?"
- "컴포넌트가 언마운트된 뒤 도착한 fetch 응답을 어떻게 처리하나요?"
- "초기 데이터 로딩 중 UI를 어떻게 다루나요? (로딩/에러/빈 상태)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 중첩 라우트+Outlet+index, loaded 깃발, useEffect async 우회(IIFE)+alive/AbortController,
> fetch 절대경로 이유, NavLink end, 백엔드 없는 CRUD의 한계를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**라우터 미션은 중첩 라우트 + `Layout`/`Outlet` 으로 블로그를 엮고, `useEffect([])` IIFE로 데이터를
한 번 로드하며 `loaded` 깃발로 첫 렌더를 방어한다 — fetch는 절대경로, NavLink `to="/"` 는 `end`,
백엔드 없는 CRUD는 새로고침 시 초기화된다.**
