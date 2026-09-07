---
id: react/optimization-and-refactoring/refactoring-components
chapter: react/optimization-and-refactoring
title: 컴포넌트 구조 리팩토링
mastery: understand
lesson_kind: lesson
estimated_minutes: 40
tags: [react, refactoring, structure]
related_material_ids:
  - 1RTWGlU0b_R-ueTd4c8U7pPdGLBvLkIpQkowKWBHktUw   # 12 리팩토링 (ArticleForm 공통화 / switch 렌더 / 핸들러 분리)
prerequisites:
  - react/components-and-props/creating-components
  - react/optimization-and-refactoring/reducing-rerenders
code_examples:
  - slug: before-duplication
    title: Before — 입력 폼과 수정 폼이 거의 같다
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function CreateArticle({ onSubmit }) {
        const [content, setContent] = useState({ title: "", desc: "" });
        // ... input/textarea, handleChange, submit ...
      }

      function UpdateArticle({ title, desc, onSubmit }) {
        const [content, setContent] = useState({ title, desc }); // 초기값만 다름
        // ... 위와 사실상 동일한 input/textarea, handleChange, submit ...
      }
      // 폼 마크업/상태/onChange 가 두 곳에 복붙되어 있다 → 한 곳만 고치면 버그
  - slug: extract-form
    title: After — 공통 ArticleForm 하나로
    source_type: generated_minimal
    language: jsx
    code: |
      function ArticleForm({ initialTitle = "", initialDesc = "", onSubmit, submitLabel = "Submit" }) {
        const [content, setContent] = useState({ title: initialTitle, desc: initialDesc });

        // 수정 대상이 바뀌면 폼 값을 새 초기값으로 리셋
        useEffect(() => {
          setContent({ title: initialTitle, desc: initialDesc });
        }, [initialTitle, initialDesc]);

        const handleChange = (e) => {
          const { name, value } = e.target;
          setContent((prev) => ({ ...prev, [name]: value })); // name 으로 필드 구분
        };

        return (
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(content.title, content.desc); }}>
            <input name="title" value={content.title} onChange={handleChange} />
            <textarea name="desc" value={content.desc} onChange={handleChange} />
            <button>{submitLabel}</button>
          </form>
        );
      }

      const CreateArticle = ({ onSubmit }) => <ArticleForm onSubmit={onSubmit} submitLabel="Create" />;
      const UpdateArticle = ({ title, desc, onSubmit }) => (
        <ArticleForm initialTitle={title} initialDesc={desc} onSubmit={onSubmit} submitLabel="Update" />
      );
  - slug: switch-render
    title: 모드별 렌더를 switch 로 한곳에
    source_type: generated_minimal
    language: jsx
    code: |
      const handleSubmitCreate = useCallback((t, d) => { /* ... */ }, []);
      const handleSubmitUpdate = useCallback((t, d) => { /* ... */ }, [id]);
      const handleDelete = useCallback(() => { /* ... */ }, [id]);
      const handleChangeMode = useCallback((nextId) => { setMode("read"); setId(nextId); }, []);

      function renderArticle() {
        switch (mode) {
          case "read":   return <MyArticle {...selectedArticle} onChangeMode={() => setMode("update")} onDelete={handleDelete} />;
          case "create": return <CreateArticle onSubmit={handleSubmitCreate} />;
          case "update": return selectedArticle
            ? <UpdateArticle title={selectedArticle.title} desc={selectedArticle.desc} onSubmit={handleSubmitUpdate} />
            : null;
          default:       return <MyArticle title="welcome" desc="Welcome to react" />;
        }
      }
  - slug: conditional-buttons
    title: props 유무로 버튼을 조건부 렌더
    source_type: generated_minimal
    language: jsx
    code: |
      function MyArticle({ title, desc, onChangeMode, onDelete }) {
        return (
          <section>
            <h2>{title}</h2><p>{desc}</p>
            {onChangeMode && <button onClick={onChangeMode}>수정</button>}
            {onDelete && <button onClick={onDelete}>삭제</button>}
          </section>
        );
      }
      // welcome 화면에서는 두 핸들러를 안 넘기므로 버튼이 안 나온다 (플래그 prop 이 따로 필요 없음)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **중복된 컴포넌트**(입력 폼 / 수정 폼)를 props 로 차이만 주는 **하나의 공통 컴포넌트**로 합칠 수 있다.
- `mode` 에 따라 흩어진 렌더 분기를 `switch` 한곳으로 모으고, 핸들러를 이름 붙은 함수로 분리한다.
- **플래그 prop 대신 "props 유무"** 로 조건부 렌더를 하는 패턴을 안다.
- 리팩토링이 동작을 바꾸지 않는지 확인하는 방법(콘솔·수동 회귀)을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 컴포넌트 분리·props, `useState` 객체 상태, `useEffect` 의존성, `useCallback`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

수업자료(`12 리팩토링`)의 CRUD 앱은 `CreateArticle` 과 `UpdateArticle` 이 **거의 똑같은 폼**을
각각 들고 있다.

{{code: before-duplication}}

- placeholder 하나 바꾸려면 두 파일을 고쳐야 한다.
- 유효성 검사를 추가하면 한쪽에만 넣는 실수가 난다.
- `App` 컴포넌트에는 `mode === "read" && ...`, `mode === "update" && ...` 분기가
  JSX 여기저기 흩어져, 지금 무슨 화면이 뜨는지 읽기 어렵다.

리팩토링은 **동작을 그대로 두고 구조만** 정리하는 작업이다.

<!-- section: concept -->
## 1단계 — 중복을 공통 컴포넌트로

두 폼의 **차이는 초기값과 버튼 라벨뿐**이다. 그것만 props 로 받는다.

{{code: extract-form}}

- `initialTitle` / `initialDesc` — 차이나는 부분만 밖에서.
- `useEffect([initialTitle, initialDesc])` — 수정 대상이 다른 글로 바뀌면 폼을 새 값으로 리셋.
  (이게 없으면 다른 글을 눌러도 폼에 이전 글 내용이 남는다.)
- `name` 속성 + `[name]: value` — input 이 여러 개여도 `handleChange` 하나로 처리.
- `CreateArticle` / `UpdateArticle` 은 이제 `ArticleForm` 을 **얇게 감싸는** 래퍼가 된다.

<!-- section: concept | title: 렌더 분기 모으기 -->
## 2단계 — switch 로 모드별 렌더 한곳에

{{code: switch-render}}

- JSX 안에 흩어진 `mode === ...` 삼항/`&&` 을 `renderArticle()` 하나로 모은다.
- 제출/삭제 로직을 `handleSubmitCreate` / `handleSubmitUpdate` / `handleDelete` /
  `handleChangeMode` **이름 붙은 함수**로 빼면, JSX는 "무엇을 부를지"만 남아 읽기 쉬워진다.
- 각 핸들러의 `useCallback` 의존성(`[]` vs `[id]`)은 그 함수가 실제로 참조하는 값에 맞춘다.

<!-- section: mechanism -->
## 3단계 — 플래그 prop 대신 "props 유무"

"이 화면에서 수정/삭제 버튼을 보여줄까?"를 `showButtons={true}` 같은 플래그로 넘기는 대신,
**핸들러 prop 자체를 넘겼는지**로 판단한다.

{{code: conditional-buttons}}

- `read` 모드에서는 `onChangeMode` / `onDelete` 를 넘기므로 버튼이 나온다.
- `welcome` 모드에서는 안 넘기므로 버튼이 사라진다.
- prop 이 하나 줄고, "버튼이 있으면 그 동작도 있다"가 타입 수준에서 보장된다.

<!-- section: must_know -->
## 반드시 기억할 것

- **차이만 props 로.** 두 컴포넌트가 90% 같으면 공통 컴포넌트 + 차이 props 로 합친다.
  (단, 겉만 비슷하고 목적이 다르면 억지로 합치지 않는다 — 나중에 갈라내기가 더 어렵다.)
- 제어 폼에서 **외부 초기값이 바뀔 수 있으면** `useEffect` 로 동기화한다.
- 여러 input 은 `name` + `[name]: value` 로 핸들러 하나.
- 조건 분기가 3개 이상이면 `switch`/전용 함수로 **한곳에** 모은다.
- 불리언 플래그보다 **필요한 콜백/데이터 prop 의 존재 여부**로 분기하면 API가 단순해진다.
- 리팩토링 전후로 **동작이 같은지** 반드시 확인한다(주요 시나리오 수동 실행 + 콘솔 로그 + 가능하면 테스트).

<!-- section: experiment -->
## 직접 해 보기

1. 수업자료의 `CreateArticle` / `UpdateArticle` 을 `ArticleForm` 하나로 합쳐라. 생성·수정이 모두 동작하는지 확인.
2. `useEffect([initialTitle, initialDesc])` 를 지우고 다른 글을 클릭했을 때 폼에 뭐가 남는지 관찰한 뒤 되돌려라.
3. `App` 의 흩어진 `mode` 분기를 `renderArticle()` `switch` 로 모아라.
4. `MyArticle` 에 `showEdit` 같은 플래그를 쓰던 코드가 있으면 "핸들러 유무" 방식으로 바꿔라.

<!-- section: check_question -->
## 이해 점검

1. 두 폼을 하나로 합칠 때 "차이"로 뽑아야 하는 것은 무엇이었나?
2. `ArticleForm` 의 `useEffect([initialTitle, initialDesc])` 가 없으면 어떤 버그가 나나?
3. `switch` 로 렌더를 모으면 무엇이 좋아지나?
4. `showButtons` 플래그 대신 `onDelete` 유무로 판단하면 어떤 이점이 있나?
5. 리팩토링이 성공했는지 어떻게 확인하나?

<!-- section: interview_question -->
## 면접 대비

- "중복 컴포넌트를 언제 합치고 언제 두어야 한다고 보나요? (성급한 추상화의 위험)"
- "제어 컴포넌트에서 부모가 준 초기값이 바뀔 때 어떻게 처리하나요?"
- "props 로 동작을 제어할 때 불리언 플래그와 콜백/children 전달의 트레이드오프는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 중복 폼 → 공통 컴포넌트(차이만 props), initialValue 동기화 useEffect, name 기반 handleChange,
> switch 로 렌더 모으기, 플래그 대신 props 유무 분기를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**리팩토링은 동작을 그대로 두고 구조만 정리한다 — 중복 컴포넌트는 "차이만 props"로 합치고,
흩어진 모드 분기는 `switch` 한곳으로, 조건부 UI는 플래그 대신 "필요한 prop 의 유무"로 판단한다.**
