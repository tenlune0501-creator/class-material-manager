---
id: react/board-crud-app/board-ui-and-list
chapter: react/board-crud-app
title: 게시판 UI와 목록 조회
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [react, board, list, crud, practice]
related_material_ids:
  - 15h7tMuI67jHapvXEW9Fug4g6lArnNgVq9BqEoNPaImo   # 02_게시판 UI 만들기 (react-bootstrap)
  - 1CvaWGWqZBZGzsCgcT35oWZoK6uIV7JrXFgjI3lCYRX8   # 05 게시판 목록 조회 (axios + Express)
  - 1OxTMR5Q9sE6zsgq2R-CPCFuFPysMPv9HoKDJ1vrtBRU   # 07 게시판 목록 조회 개선
  - 1BavurLXerauVD6im1pp_KqKT1B50FWRbKrGtdrTBq0I   # 08 글보기 (useParams)
  - 1zpIYS4w_Mn_B1t5lgMsjGxIU3E1ROpwd8JLwDisCf3Q   # 06_1 이전 글·다음 글
  - 1bJ9rmZ7rUcYcFU8QimOKRWbXAphew2TP              # react_vite_todo-main.zip
  - 1a3QZKQlOnWb4T5UB4uwgClajgsDRHSE6              # todoList_ls_v202607.zip (localStorage)
  - 1I1pWDuAZ2_LrkA5NG-dgtfekAY9cnKwpBr4oNTRLxTU   # 01_todolist(v2026)
prerequisites:
  - react/data-fetching/fetching-in-react
  - react/routing/react-router-dom
  - react/rendering-logic/lists-and-keys
code_examples:
  - slug: list-fetch
    title: 목록 조회 — useEffect 안에서 GET 한 번
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { useEffect, useState } from "react";
      import axios from "axios";
      import { Link } from "react-router-dom";

      const API = "http://localhost:3000"; // 학습용. 배포 시 env 로

      export default function BoardList() {
        const [list, setList] = useState([]);   // 초기값은 반드시 빈 배열
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          axios.get(`${API}/list`)
            .then((res) => setList(res.data))
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
        }, []); // [] → 마운트 시 1회만

        if (loading) return <p>불러오는 중…</p>;
        if (error) return <p>목록을 불러오지 못했습니다.</p>;

        return (
          <table>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td><Link to={`/view/${row.id}`}>{row.title}</Link></td>
                  <td>{row.writer}</td>
                  <td>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
  - slug: infinite-loop-trap
    title: 흔한 함정 — useEffect 의존성에 함수를 넣어 무한 요청
    source_type: generated_minimal
    language: jsx
    code: |
      // ❌ getList 가 매 렌더 새로 생성 → useEffect 매번 실행 → setState → 리렌더 → 무한
      const getList = () => axios.get(`${API}/list`).then((r) => setList(r.data));
      useEffect(() => { getList(); }, [getList]);

      // ✅ 방법 A: 그냥 effect 안에 직접
      useEffect(() => { axios.get(`${API}/list`).then((r) => setList(r.data)); }, []);
      // ✅ 방법 B: 재사용해야 하면 useCallback 으로 참조 고정
      const getList = useCallback(() => axios.get(`${API}/list`).then((r) => setList(r.data)), []);
      useEffect(() => { getList(); }, [getList]);
  - slug: detail-param
    title: 상세 — URL 파라미터로 한 건 조회
    source_type: generated_minimal
    language: jsx
    code: |
      import { useParams, Link } from "react-router-dom";

      function View() {
        const { id } = useParams();                 // /view/42 → "42" (문자열)
        const [post, setPost] = useState(null);
        const [notFound, setNotFound] = useState(false);

        useEffect(() => {
          axios.get(`${API}/view?id=${id}`)
            .then((res) => {
              const row = res.data[0];              // 서버가 배열로 준다
              if (!row) return setNotFound(true);   // 없는 id 방어
              setPost(row);
            });
        }, [id]);                                    // id 가 바뀌면 다시 조회

        if (notFound) return <p>잘못된 접근입니다. <Link to="/">홈</Link></p>;
        if (!post) return <p>불러오는 중…</p>;
        return <><h2>{post.title}</h2><p>{post.writer} · {post.date}</p><div>{post.content}</div></>;
      }
  - slug: prev-next
    title: 이전 글 · 다음 글 — id 비교로 가장 가까운 한 건
    source_type: generated_minimal
    language: text
    code: |
      # 서버(SQL) 또는 Supabase/Firestore 어디서 하든 개념은 같다
      이전 글 = 현재 id 보다 작은 것 중 가장 큰 id  (id < :id ORDER BY id DESC LIMIT 1)
      다음 글 = 현재 id 보다 큰 것 중 가장 작은 id  (id > :id ORDER BY id ASC  LIMIT 1)

      # Supabase 예: .lt("id", id).order("id", { ascending:false }).limit(1).maybeSingle()
      #   single()      → 0건이면 에러 (반드시 있어야 할 때)
      #   maybeSingle() → 0건이면 data:null (이전/다음 글은 없을 수 있으니 이걸 쓴다)
      화면에서는 prev 가 null 이면 버튼을 disabled 로.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- react-bootstrap `Table` / `Button` / `Form` 으로 게시판 목록·글쓰기 골격 UI를 만든다.
- `useEffect(() => { ... }, [])` 안에서 목록을 **한 번** GET 하고, `useState([])` 로 렌더한다.
- **로딩 / 에러 / 빈 목록** 세 상태를 화면에 분기한다.
- 상세는 `useParams` 로 id를 받아 조회하고, **없는 id**를 방어한다.
- "이전 글 / 다음 글"을 id 비교로 구현한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useEffect` + fetch/axios(→ `react/data-fetching/fetching-in-react`), `map` + `key`,
  `react-router` 의 `Link` / `useParams` / `useNavigate`.
- 이 게시판의 서버는 `data-and-backend/nodejs-server/express-rest-api` 에서 만드는 Express + MySQL API다.
  (백엔드 없이 연습하려면 `todoList_ls` 처럼 `localStorage` 를 "가짜 DB"로 써도 흐름은 같다.)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

지금까지 배운 state·이벤트·라우팅·데이터 페칭을 **하나의 화면 흐름**으로 조립해 본 적이 없다.
게시판(BBS)은 그 조립을 연습하는 표준 과제다: **목록 → 상세 → 쓰기 → 수정 → 삭제**.
이 Lesson은 그중 **UI 골격 + 목록/상세 조회(읽기)**까지다.

<!-- section: concept -->
## 1. UI 골격 (react-bootstrap)

```
npm install react-bootstrap bootstrap
// App.jsx 최상단
import "bootstrap/dist/css/bootstrap.min.css";
```

- `BoardList` — `<Table striped bordered hover>` 로 번호·제목·작성자·작성일 컬럼.
  하단에 `글쓰기 / 수정 / 삭제` 버튼.
- `Write` — `<Form.Control name="title" />`, `<Form.Control as="textarea" name="content" />`.
- 라우터로 `/`(목록), `/view/:id`(상세), `/write`(작성) 을 나눈다.

<!-- section: code | lang: jsx -->
## 2. 목록 조회

{{code: list-fetch}}

- **초기값은 `useState([])`.** `null` 로 두면 첫 렌더에서 `list.map` 이 터진다.
- `useEffect(..., [])` — 마운트 시 1회. 여기가 "화면 뜨자마자 필요한 데이터"의 자리.
- `loading` / `error` 상태를 함께 둬서 흰 화면·크래시를 막는다.

<!-- section: mechanism -->
## 3. 흔한 함정 — 무한 요청

수업자료(`07 게시판 목록 조회 개선`)가 짚는 실수다.

{{code: infinite-loop-trap}}

`useEffect` 의존성에 **매 렌더 새로 만들어지는 함수**를 넣으면, 요청 → `setState` → 리렌더 →
새 함수 → effect 재실행 → … 무한 루프가 된다. effect 안에 직접 넣거나 `useCallback` 으로 고정한다.

<!-- section: concept | title: 상세 조회 -->
## 4. 상세 — URL 파라미터

{{code: detail-param}}

- 목록의 `<Link to={`/view/${row.id}`}>` → 라우트 `/view/:id` → `useParams()` 로 `id`.
- 서버가 결과를 **배열**(`[{...}]`)로 주면 `res.data[0]` 을 꺼낸다.
- **없는 id**(직접 URL 입력, 삭제된 글) → `row` 가 `undefined` → "잘못된 접근" 화면.
- 의존성 `[id]` — 상세 화면에서 다른 글로 이동하면 다시 조회.

<!-- section: concept | title: 이전·다음 글 -->
## 5. 이전 글 · 다음 글

{{code: prev-next}}

<!-- section: must_know -->
## 반드시 기억할 것

- 목록 state 초기값은 **빈 배열**. `loading` / `error` 를 항상 함께 둔다.
- 목록/상세 조회는 `useEffect` 안에서. 상세는 의존성 `[id]`.
- `useEffect` 의존성에 **인라인 함수를 넣지 않는다**(무한 요청). 필요하면 `useCallback`.
- URL로 직접 올 수 있는 id는 **없을 수 있다** — 방어 렌더.
- 서버 응답 형태(배열인지 객체인지)를 콘솔로 먼저 확인하고 파싱한다.
- API 주소를 곳곳에 하드코딩하지 말고 상수/`import.meta.env` 로 모은다. *학습용*은 `localhost` 직결,
  운영은 도메인·HTTPS·CORS 설정이 필요하다.

<!-- section: experiment -->
## 직접 해 보기

1. react-bootstrap으로 목록 테이블 + 글쓰기 폼 골격을 만들고 라우트 3개(`/`, `/view/:id`, `/write`)를 연결하라.
2. `/list` API(또는 `localStorage`)에서 목록을 받아 렌더하라. 로딩 문구와 에러 문구를 넣어라.
3. 일부러 `useEffect(() => getList(), [getList])` 로 무한 요청을 만들어 네트워크 탭에서 확인한 뒤 고쳐라.
4. `/view/999999`(없는 id)로 접속해 "잘못된 접근" 화면이 뜨는지 확인하라.
5. 상세 화면에 "이전 글 / 다음 글" 링크를 붙이고, 첫 글·마지막 글에서 버튼이 비활성인지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 목록 state 초기값을 `null` 로 두면 무슨 일이 생기나?
2. `useEffect` 의존성 배열에 `[]` 를 주는 것과 아무것도 안 주는 것의 차이는?
3. 목록 조회 함수를 의존성에 넣었더니 요청이 멈추지 않는다. 원인과 두 가지 해결책은?
4. 상세 화면에서 다른 글로 이동해도 내용이 안 바뀐다. 어디를 봐야 하나?
5. "이전 글"을 SQL/쿼리로 어떻게 표현하나?

<!-- section: interview_question -->
## 면접 대비

- "목록/상세 데이터를 언제, 어디서 불러오나요? 로딩·에러·빈 상태는 어떻게 다루나요?"
- "`useEffect` 의존성 배열 관리에서 무한 루프가 생기는 전형적인 패턴은?"
- "상세 페이지를 URL로 직접 접근했을 때 고려할 것들은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 목록 state=빈 배열 + loading/error, useEffect([]) 1회 조회, 무한요청 함정과 해결(useCallback),
> useParams + res.data[0] + 없는 id 방어, 이전/다음 글 쿼리를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**게시판 읽기는 `useEffect([])` 에서 목록을 한 번 GET 해 `useState([])` 로 렌더하고(로딩·에러 분기),
상세는 `useParams` 의 id로 조회하되 없는 id를 방어한다 — 의존성에 인라인 함수를 넣으면 무한 요청이 된다.**
