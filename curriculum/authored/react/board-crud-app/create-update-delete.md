---
id: react/board-crud-app/create-update-delete
chapter: react/board-crud-app
title: 글 쓰기·수정·삭제
mastery: practical
lesson_kind: lesson
estimated_minutes: 70
tags: [react, crud, form, mutation, practice]
related_material_ids:
  - 1peKntI-8PW-rTz3_YEqlvQ5o9WgWOPbcL0-13fyerVE   # 06 게시물 쓰기 (axios POST, express.json)
  - 1KeXe0iqOamu8O2Sy37-3aTCvuKgjtanc0sHFfEOLCqQ   # 08 게시물 수정
  - 1mfJcfoBmjHjA6EXkPX2iy-Gww18Z-FxAFPz-XJvSyDk   # 08 Create
  - 1bos2ISUIaSOOV4QvfS6odYxRW65jUoxfdsOVetOaQMQ   # 09_게시물 삭제
  - 1rsBbWw5onKYlPIrqH_o1gtVUq5wQPK9anoD1R6d4mwM   # 10 update
  - 1kCaN-DWCp2QUo2Bq3yn4AQiDH8_tp--k8Gf6KUtScO0   # 11 Delete
prerequisites:
  - react/board-crud-app/board-ui-and-list
  - react/state-and-events/usestate-basics
  - react/optimization-and-refactoring/refactoring-components
code_examples:
  - slug: create
    title: 쓰기 — 제어 폼 + 검증 + POST + 이동
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { useState } from "react";
      import { useNavigate } from "react-router-dom";
      import axios from "axios";

      export default function Write() {
        const navigate = useNavigate();
        const [form, setForm] = useState({ writer: "", title: "", content: "" });
        const [submitting, setSubmitting] = useState(false);

        const onChange = (e) => {
          const { name, value } = e.target;
          setForm((prev) => ({ ...prev, [name]: value }));  // name 으로 필드 구분
        };

        const onSubmit = async (e) => {
          e.preventDefault();
          if (!form.writer.trim() || !form.title.trim() || !form.content.trim()) {
            return alert("모든 항목을 입력하세요");       // 학습용 최소 검증
          }
          setSubmitting(true);
          try {
            await axios.post(`${API}/write`, form);         // express.json() 이 req.body 로
            navigate("/");                                  // 목록으로 이동 (= 최신 목록 재조회)
          } catch (err) {
            alert("저장 실패");
          } finally {
            setSubmitting(false);
          }
        };

        return (
          <form onSubmit={onSubmit}>
            <input name="writer" value={form.writer} onChange={onChange} />
            <input name="title" value={form.title} onChange={onChange} />
            <textarea name="content" value={form.content} onChange={onChange} />
            <button disabled={submitting}>{submitting ? "저장 중…" : "입력"}</button>
          </form>
        );
      }
  - slug: update
    title: 수정 — 기존 값으로 폼 채우고 → PUT/POST
    source_type: generated_minimal
    language: jsx
    code: |
      function Edit() {
        const { id } = useParams();
        const navigate = useNavigate();
        const [form, setForm] = useState(null); // 아직 안 불러옴

        useEffect(() => {
          axios.get(`${API}/view?id=${id}`).then((res) => {
            const row = res.data[0];
            setForm({ writer: row.writer, title: row.title, content: row.content });
          });
        }, [id]);

        if (!form) return <p>불러오는 중…</p>;

        const onSubmit = async (e) => {
          e.preventDefault();
          await axios.post(`${API}/update`, { ...form, id }); // 수정 대상 id 를 함께
          navigate(`/view/${id}`);
        };
        // ...제어 input 은 create 와 동일 → 공통 <ArticleForm> 으로 뽑는 게 정석
      }
  - slug: delete
    title: 삭제 — 확인 → DELETE → 목록 반영
    source_type: generated_minimal
    language: jsx
    code: |
      const onDelete = async (id) => {
        if (!window.confirm("정말 삭제할까요?")) return;   // 되돌릴 수 없는 동작엔 확인
        await axios.delete(`${API}/delete?id=${id}`);      // 또는 axios.post(`${API}/delete`, { id })
        // 목록 화면이면: 다시 GET 하거나, 낙관적으로 state 에서 제거
        setList((prev) => prev.filter((row) => row.id !== id));
      };
  - slug: refetch-vs-optimistic
    title: 변경 후 화면 반영 — 두 가지 방법
    source_type: generated_minimal
    language: text
    code: |
      1) 재조회(refetch): 변경 성공 후 목록/상세를 다시 GET.
         - 단순하고 항상 정확. 요청 1번 더.  ← 학습 단계 기본값
      2) 낙관적 업데이트(optimistic): 요청 보내기 전/직후에 로컬 state 를 먼저 바꿈.
         - 빠르게 반응. 실패하면 되돌리는 롤백 코드가 필요.
      React Query(TanStack Query) 를 쓰면 이 캐시·무효화를 라이브러리가 관리한다(후속 주제).
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 제어 폼(`useState` + `name` 기반 `onChange`)으로 글쓰기를 만들고, 제출 시 **검증 → POST → 이동**한다.
- 수정은 **기존 값으로 폼을 채운 뒤** 변경분을 보내고, 대상 `id` 를 함께 전송한다.
- 삭제는 **확인창 → 요청 → 화면 반영**. 되돌릴 수 없는 동작을 다룬다.
- 변경 후 화면을 갱신하는 두 방법(**재조회 vs 낙관적 업데이트**)의 차이를 안다.
- 쓰기 폼과 수정 폼의 중복을 공통 컴포넌트로 합친다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 제어 컴포넌트, `useNavigate`, 앞 Lesson의 목록/상세 조회.
- 서버는 Express + MySQL(`express.json()` 으로 `req.body` 파싱) — `data-and-backend` 트랙.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

읽기(목록·상세)만으로는 반쪽이다. **쓰기·수정·삭제**는 서버 상태를 바꾸므로:

- 제출 후 목록으로 돌아갔는데 방금 쓴 글이 안 보인다(갱신 안 함).
- 검증 없이 빈 글이 저장된다.
- 삭제 버튼을 실수로 눌러 글이 사라진다(확인 없음).
- 쓰기 폼과 수정 폼이 거의 같은데 두 벌로 관리된다.

<!-- section: code | lang: jsx -->
## 1. 쓰기 (Create)

{{code: create}}

- **제어 폼**: `value={form.x}` + `onChange` 로 state가 입력값을 소유. `name` + `[name]: value` 로 핸들러 하나.
- **검증은 학습용 최소 수준**(빈 값 체크 + `trim()`). 실제 서비스는 길이 제한, XSS, 금칙어,
  서버 측 재검증이 필요하다 — 클라이언트 검증만으로는 못 막는다.
- POST 본문은 그냥 객체(`form`)를 넘긴다. 서버의 `express.json()` 이 `req.body` 로 만들어 준다.
- 성공하면 `navigate("/")` — 목록으로 가면 목록이 다시 조회되며 새 글이 보인다.
- `submitting` 으로 **더블 클릭 중복 제출**을 막는다.

<!-- section: concept | title: 수정 -->
## 2. 수정 (Update)

{{code: update}}

- 수정은 "빈 폼"이 아니라 **기존 값이 채워진 폼**에서 시작한다 → 먼저 GET 해서 `setForm`.
- 다 불러오기 전에는 `form` 이 `null` → 로딩 처리(폼을 그리면 `value={undefined}` 경고).
- 요청에 **대상 `id`** 를 반드시 함께 보낸다.
- input 마크업이 Create와 똑같다 → `refactoring-components` 에서 배운 **공통 `<ArticleForm>`** 으로 합친다.

<!-- section: concept | title: 삭제 -->
## 3. 삭제 (Delete)

{{code: delete}}

- **`window.confirm`** — 되돌릴 수 없는 동작 앞의 최소 안전장치.
- 삭제 후 화면 반영: 목록을 다시 GET 하거나, `setList(prev => prev.filter(...))` 로 로컬에서 제거.

<!-- section: mechanism -->
## 4. 변경 후 화면 갱신 — 재조회 vs 낙관적

{{code: refetch-vs-optimistic}}

React 자체는 서버 상태를 캐시하지 않는다. "변경했으니 다시 읽는다"를 **직접** 챙겨야 한다.
이 부담을 줄이는 게 React Query 같은 서버 상태 라이브러리다(지금은 재조회로 충분).

<!-- section: must_know -->
## 반드시 기억할 것

- 쓰기·수정 폼은 **제어 컴포넌트**. 제출 시 `e.preventDefault()` → 검증 → 요청 → `navigate`.
- 수정 폼은 **먼저 조회해서 채운다**. 대상 `id` 를 요청에 포함.
- 삭제 등 파괴적 동작은 **확인** 후 실행. 성공 후 목록/상세를 갱신(재조회 기본).
- 제출 중 `disabled` 로 **중복 요청** 차단.
- 클라이언트 검증은 UX용이고 **보안이 아니다** — 서버가 다시 검증한다고 가정한다.
- Create/Update 폼 중복은 공통 컴포넌트로 합친다("차이만 props").

<!-- section: experiment -->
## 직접 해 보기

1. 제어 폼으로 글쓰기를 만들고 빈 값 검증 + 제출 중 버튼 비활성 + 성공 시 목록 이동을 구현하라.
2. 수정 화면에서 기존 글을 GET 해 폼을 채우고, 저장하면 상세로 돌아가게 하라.
3. Create/Update의 input 마크업을 공통 `<ArticleForm initial submitLabel onSubmit>` 로 뽑아라.
4. 삭제에 `window.confirm` 을 붙이고, 삭제 후 목록에서 사라지는 것을 재조회 방식과 `filter` 방식 둘 다로 구현해 비교하라.
5. 네트워크를 느리게 한 상태에서 제출 버튼을 빠르게 두 번 눌러 중복 저장이 되는지 확인하고 막아라.

<!-- section: check_question -->
## 이해 점검

1. 제출 핸들러에서 `e.preventDefault()` 를 빼면 무슨 일이 생기나?
2. 수정 폼을 "빈 폼"에서 시작하면 안 되는 이유는?
3. 삭제 후 목록에 그대로 남아 있다. 무엇을 안 한 것인가? 두 가지 해결책은?
4. "클라이언트 검증은 보안이 아니다"라는 말의 의미는?
5. 재조회와 낙관적 업데이트의 장단점은?

<!-- section: interview_question -->
## 면접 대비

- "CRUD에서 변경(mutation) 후 화면을 어떻게 최신 상태로 유지하나요?"
- "낙관적 업데이트를 구현할 때 실패 롤백은 어떻게 처리하나요?"
- "폼 검증을 클라이언트와 서버 중 어디서 얼마나 해야 한다고 보나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 제어 폼 제출(preventDefault→검증→요청→navigate), 수정은 먼저 조회해 채우고 id 포함,
> 삭제는 confirm→요청→갱신, 재조회 vs 낙관적, Create/Update 폼 공통화를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**쓰기·수정은 제어 폼에서 검증 후 요청하고 성공 시 이동하며(수정은 기존 값을 먼저 채운다),
삭제는 확인 후 실행하고, 변경 뒤에는 재조회로 화면을 맞춘다 — 클라이언트 검증은 UX용이지 보안이 아니다.**
