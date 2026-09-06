---
id: react/routing/react-router-dom
chapter: react/routing
title: React Router DOM
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [react, react-router, routing, spa]
related_material_ids:
  - 1DP7OhXDFNaMdpy6SCO_G4zH0R3nZyfYD5w1vgp9V000   # P3_01_React Router DOM
  - 1rwB-ql-DY6hFYnjYs4sDmUurV9Gt4qgDHfWzG3UuDxM   # 07 라우터로 분리하기
  - 1TRypbCoPA_ws6ZzWEgxZyfS17jZBq95t              # react-router-ex_v202606.zip
prerequisites:
  - react/components-and-props/passing-props
  - react/rendering-logic/lists-and-keys
code_examples:
  - slug: routes
    title: 라우트 정의
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";

      function App() {
        return (
          <BrowserRouter>
            <nav>
              <Link to="/">Home</Link>
              <NavLink to="/about" className={({ isActive }) => isActive ? "on" : ""}>About</NavLink>
            </nav>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/posts/:id" element={<Post />} />   {/* :id = 동적 세그먼트 */}
              <Route path="*" element={<NotFound />} />          {/* 아무데도 안 맞으면 */}
            </Routes>
          </BrowserRouter>
        );
      }
  - slug: params-navigate
    title: URL 파라미터 · 프로그래매틱 이동 · 쿼리
    source_type: generated_minimal
    language: jsx
    code: |
      import { useParams, useNavigate, useSearchParams } from "react-router-dom";

      function Post() {
        const { id } = useParams();               // /posts/42 → id === "42" (문자열)
        const navigate = useNavigate();
        const [sp, setSp] = useSearchParams();     // ?page=2
        const page = Number(sp.get("page") ?? 1);

        function goBackToList() {
          navigate("/posts");                     // 이동
          // navigate(-1);  // 뒤로가기
        }
        return <button onClick={goBackToList}>목록</button>;
      }
  - slug: nested
    title: 중첩 라우트 + 공통 레이아웃
    source_type: generated_minimal
    language: jsx
    code: |
      import { Outlet } from "react-router-dom";

      function DashboardLayout() {
        return (<div className="dash"><SideNav /><main><Outlet /></main></div>);
      }

      <Route path="/dash" element={<DashboardLayout />}>
        <Route index element={<Overview />} />        {/* /dash */}
        <Route path="stats" element={<Stats />} />    {/* /dash/stats */}
      </Route>
      // 부모의 <Outlet /> 자리에 자식 라우트가 렌더된다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- SPA 에서 라우팅이 왜 필요한지(새로고침 없이 URL ↔ 화면 매핑)를 안다.
- `BrowserRouter` / `Routes` / `Route` 로 페이지를 정의하고, `Link` / `NavLink` 로 이동한다.
- **URL 파라미터**(`:id` → `useParams`), **쿼리스트링**(`useSearchParams`), **프로그래매틱 이동**(`useNavigate`)을 쓴다.
- **중첩 라우트 + `<Outlet />`** 으로 공통 레이아웃을 공유한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 컴포넌트·props, 조건부/리스트 렌더링. `npm install` (`react-router-dom` 설치 필요).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `useState` 로 `page` 를 바꿔 화면을 전환하니 **뒤로가기·북마크·새로고침·링크 공유**가 안 된다.
- 조건부 렌더링(`{page === "about" && <About/>}`)이 5개가 넘어가면 관리가 안 된다.
- URL 이 항상 `/` 라서 SEO·공유가 불가능.

라우터는 **URL 을 상태처럼** 다뤄, 주소가 곧 화면이 되게 한다.

<!-- section: concept -->
## 라우트 정의

{{code: routes}}

- `<BrowserRouter>` 로 앱을 감싼다(보통 `main.jsx` 나 `App` 최상단).
- `<Routes>` 안에 `<Route path="..." element={<컴포넌트 />} />`. 위에서부터 **가장 잘 맞는 하나**를 렌더.
- `path="*"` — 아무 것도 안 맞을 때(404).
- **이동은 `<a>` 가 아니라 `<Link to="...">`** — 전체 페이지 리로드 없이 화면만 교체(SPA). `<NavLink>` 는 현재 경로면 활성 스타일.

<!-- section: mechanism -->
## 파라미터 · 이동 · 쿼리

{{code: params-navigate}}

- **`:id`** 같은 동적 세그먼트 → `useParams()` 로 `{ id }` (항상 **문자열**, 숫자면 `Number()`).
- **`useNavigate()`** → `navigate("/path")` (이동), `navigate(-1)` (뒤로). 폼 제출 후 이동 등.
- **`useSearchParams()`** → `?page=2` 같은 쿼리. `sp.get("page")`, `setSp({ page: "3" })`.

<!-- section: code | lang: jsx -->
## 중첩 라우트

{{code: nested}}

- 부모 `<Route>` 의 `element` 에 공통 레이아웃(사이드바 등), 그 안에 **`<Outlet />`** = 자식 라우트가 들어올 자리.
- 자식 `<Route>` 는 부모 안에 중첩. `index` = 부모 경로 그 자체(`/dash`).
- → 여러 페이지가 헤더·사이드바를 공유하고 본문만 바뀐다.

<!-- section: must_know -->
## 반드시 기억할 것

- 앱을 `<BrowserRouter>` 로 감싼다. 페이지는 `<Routes><Route path element/></Routes>`.
- 내부 이동은 **`<Link to>`** / `<NavLink>` (절대 `<a href>` 로 내부 이동하지 않는다 — 리로드됨).
- `:param` → `useParams()` (문자열). 쿼리 → `useSearchParams()`. 코드로 이동 → `useNavigate()`.
- 공통 레이아웃 = **중첩 라우트 + `<Outlet />`**.
- `path="*"` 로 404 를 꼭 둔다.
- 배포 시 **서버가 모든 경로를 `index.html` 로 보내도록** 설정해야 새로고침 시 404 가 안 난다(SPA fallback — 배포 챕터).

<!-- section: experiment -->
## 직접 해 보기

1. `react-router-dom` 을 설치하고 `/`, `/about`, `/posts/:id`, `*`(404) 4개 라우트를 만들어 `<Link>` 로 오가라.
2. `/posts/1`, `/posts/2` 를 열어 `useParams` 로 id 를 표시하고, "다음 글" 버튼을 `useNavigate` 로 만들어라.
3. 목록 페이지에 `?page=N` 을 `useSearchParams` 로 읽어 표시하고, 페이지 버튼으로 URL 을 바꿔라
   (새로고침해도 페이지가 유지되는지 확인).
4. `/dash` 아래 `overview`/`stats` 중첩 라우트 + `<Outlet />` 으로 사이드바를 공유하는 레이아웃을 만들어라.

<!-- section: check_question -->
## 이해 점검

1. `useState` 로 화면 전환하는 것 대비 라우터를 쓰면 무엇이 가능해지나?
2. `<Link>` 와 `<a>` 의 차이는?
3. `/users/:id` 의 `id` 는 어디서 어떤 타입으로 받나?
4. 여러 페이지가 헤더를 공유하려면 무엇을 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "SPA 라우팅이 서버 라우팅과 어떻게 다른가요? 배포 시 주의점은?"
- "중첩 라우트와 `<Outlet />` 의 용도는?"
- "`useNavigate` 와 `<Link>` 를 각각 언제 쓰나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> BrowserRouter/Routes/Route, Link vs a, useParams/useSearchParams/useNavigate, Outlet 중첩,
> SPA fallback 을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**라우터는 URL 을 상태로 다룬다 — `<Routes><Route/></Routes>` 로 경로↔화면을 매핑하고, `<Link>` 로 이동,
`useParams`/`useSearchParams`/`useNavigate` 로 파라미터·쿼리·프로그램 이동, `<Outlet/>` 으로 공통 레이아웃.**

<!-- section: next -->
## 다음 Chapter

`react/data-fetching` — 서버 데이터 가져오기.
