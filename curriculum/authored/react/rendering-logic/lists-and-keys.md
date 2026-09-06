---
id: react/rendering-logic/lists-and-keys
chapter: react/rendering-logic
title: 리스트 렌더링과 key
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [react, list, map, key, reconciliation]
related_material_ids:
  - 10pXiQ1-JoSE-ELl0BmMu6mX5LiPnLCH1c-551xnrPkY   # 10_리스트 렌더링과 key 속성
prerequisites:
  - react/rendering-logic/conditional-rendering
  - javascript/objects-and-builtins/array-methods
code_examples:
  - slug: list-map
    title: 배열 → JSX 목록
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function TodoList({ todos }) {
        if (todos.length === 0) return <p>할 일이 없습니다.</p>;

        return (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                {todo.done ? <s>{todo.text}</s> : todo.text}
              </li>
            ))}
          </ul>
        );
      }
      // todos = [{ id: "a1", text: "청소", done: false }, ...]
  - slug: key-why
    title: key 를 index 로 하면 생기는 버그
    source_type: generated_minimal
    language: jsx
    code: |
      // ❌ 항목이 추가/삭제/정렬되면 index 가 다른 항목을 가리켜
      //    입력값·체크 상태가 엉뚱한 행으로 옮겨간다
      {items.map((it, i) => <Row key={i} item={it} />)}

      // ✅ 데이터 고유 id
      {items.map((it) => <Row key={it.id} item={it} />)}

      // id 가 없으면? 만들어서 저장해 둔다 (crypto.randomUUID(), 서버가 준 id 등)
      const withId = raw.map((x) => ({ ...x, id: crypto.randomUUID() }));
  - slug: list-update
    title: 목록 상태를 불변으로 바꾸기
    source_type: generated_minimal
    language: jsx
    code: |
      const [todos, setTodos] = useState([]);

      const add = (text) =>
        setTodos((prev) => [...prev, { id: crypto.randomUUID(), text, done: false }]);

      const remove = (id) =>
        setTodos((prev) => prev.filter((t) => t.id !== id));

      const toggle = (id) =>
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        );
      // push / splice / t.done = ... (원본 변경) 금지 → 항상 새 배열/새 객체
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 배열을 `map` 으로 JSX 목록으로 렌더하고, 비었을 때 처리(empty state)를 넣는다.
- **`key`** 가 무엇을 위한 것인지(React 가 어느 항목이 바뀌었는지 추적), 왜 **`index` 대신 고유 id** 를 쓰는지 안다.
- 목록 state 를 **불변**으로 추가·삭제·수정한다(`[...prev, x]`, `filter`, `map`).

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `rendering-logic/conditional-rendering`, JS `map`/`filter`, 스프레드, 불변 업데이트.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 목록에 항목을 추가했는데, 이미 입력해 둔 다른 행의 값이 뒤섞인다 → `key={index}`.
- `todos.push(newTodo); setTodos(todos)` → 화면이 안 바뀐다(같은 배열 참조).
- `key` 를 안 줘서 콘솔 경고 + 렌더 성능 저하.

<!-- section: concept -->
## 배열을 목록으로

{{code: list-map}}

- `array.map(item => <li key={item.id}>...</li>)` — 각 요소를 JSX 로 변환한 **배열**을 `{}` 안에 둔다.
- **비었을 때**(`length === 0`)는 별도 UI(early return 또는 삼항).
- 각 항목 안에서 다시 조건부 렌더링·중첩 컴포넌트 가능.

<!-- section: mechanism -->
## key 는 왜 필요한가

{{code: key-why}}

React 는 리렌더 시 **이전 목록과 새 목록을 비교**해 "무엇이 추가/삭제/이동했는지" 알아내 최소한만 DOM 을 고친다.
그 매칭의 **신원증** 이 `key` 다.

- `key` 는 **형제 사이에서 고유**하면 된다(전역 유니크 불필요). 안정적이어야 한다(렌더마다 안 바뀜).
- **`index` 를 key 로 쓰면**: 항목이 추가/삭제/정렬될 때 같은 `index` 가 **다른 항목**을 가리키게 되어,
  입력값·포커스·체크 상태·애니메이션이 엉뚱한 행으로 붙는다.
- 데이터에 id 가 없으면 **만들어 저장**한다(`crypto.randomUUID()`, DB id). 렌더 중에 `Math.random()` 으로 만들면 매번 바뀌어 최악.

<!-- section: code | lang: jsx -->
## 목록 상태 — 불변 업데이트

{{code: list-update}}

- 추가: `setTodos(prev => [...prev, 새항목])`
- 삭제: `setTodos(prev => prev.filter(t => t.id !== id))`
- 수정: `setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))`
- **`push`/`splice`/`t.done = ...` (원본 직접 변경) 금지** — React 는 참조가 같으면 "안 바뀜"으로 보고 렌더를 건너뛴다.

<!-- section: must_know -->
## 반드시 기억할 것

- 목록 = `array.map(item => <El key={item.id} />)`. 빈 목록 UI 를 잊지 않는다.
- **`key` 는 데이터 고유 id.** `index` 는 순서가 바뀌는 목록에서 버그. 없으면 만들어 저장.
- `key` 는 props 가 아니다 — 컴포넌트 안에서 `props.key` 로 못 읽는다(필요하면 별도 prop).
- 목록 state 변경은 **항상 새 배열/새 객체** (`[...prev]`, `filter`, `map`). 원본 변경 금지.
- 큰 목록(수천 행)은 가상 스크롤(react-window 등) — 나중 최적화 챕터.

<!-- section: experiment -->
## 직접 해 보기

1. 할 일 배열을 `map` 으로 렌더하고, 배열을 비워 empty state 가 나오는지 확인.
2. `key={index}` 로 입력 필드가 있는 행 목록을 만들고, 첫 행을 삭제했을 때 값이 밀리는 버그를 재현.
   `key={item.id}` 로 고쳐 해결.
3. `add`/`remove`/`toggle` 을 불변 방식으로 구현한 미니 Todo 를 만들어라.
   `push` 로 바꿔 보고 화면이 안 갱신되는 걸 확인.
4. id 없는 원본 데이터를 받아 `map` 으로 `crypto.randomUUID()` id 를 붙여 state 에 저장하라.

<!-- section: check_question -->
## 이해 점검

1. `key` 는 무엇을 위한 것이고, 얼마나 고유해야 하나?
2. `key={index}` 가 문제되는 구체적 상황은?
3. `todos.push(x); setTodos(todos)` 가 화면을 안 바꾸는 이유는?
4. 목록에서 한 항목의 `done` 을 토글하는 불변 코드는?

<!-- section: interview_question -->
## 면접 대비

- "React 의 재조정(reconciliation)에서 `key` 의 역할은?"
- "`key`={index} 를 언제는 써도 되고, 언제 절대 안 되나요?"
- "상태 불변성을 지켜야 하는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> map + key + empty state, key 는 고유 id(index 금지 이유), key 는 props 아님, 불변 추가/삭제/수정 패턴을
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**배열은 `map` 으로 그리고 각 항목에 데이터 고유 `key` 를 준다(index 금지) — 목록 state 는
`[...prev]`/`filter`/`map` 으로 항상 새 배열을 만들어 바꾼다.**

<!-- section: next -->
## 다음 Chapter

`react/hooks-effect-and-lifecycle` — useEffect 와 생명주기.
