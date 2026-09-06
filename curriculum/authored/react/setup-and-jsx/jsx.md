---
id: react/setup-and-jsx/jsx
chapter: react/setup-and-jsx
title: JSX 문법과 HTML의 차이
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [react, jsx, syntax]
related_material_ids:
  - 1aVd84kX2qizpUkmlRXvzQO06eCP9I-64mxVkHYYMPv8   # 00. JSX
  - 1a0QJx6lfbzTr1FHQroS20cq07J3jk9htwcOkMNdYq0E   # 04_JSX 문법과 HTML 차이
prerequisites:
  - react/setup-and-jsx/dev-environment
  - javascript/objects-and-builtins/array-methods
code_examples:
  - slug: jsx-basics
    title: JSX = JavaScript + XML
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function App() {
        const user = { name: "kim", age: 32 };
        const greet = (name) => `안녕하세요, ${name}`;

        return (
          <>                                {/* 하나로 감싸야 함. Fragment(<>) 로 실제 태그 없이 */}
            <h1 className="title">JSX 기초</h1> {/* class → className */}
            <label htmlFor="u">이름</label>     {/* for → htmlFor */}
            <input id="u" type="text" />         {/* 닫는 슬래시 필수 */}
            <p>3 * 7 = {3 * 7}</p>               {/* { } 안은 JS 표현식 */}
            <p>{user.name}, {greet("홍길동")}</p>
            <p>{user.age >= 20 ? "성인" : "미성년"}</p>  {/* 조건은 삼항 or && */}
            {/* <p>이건 주석</p> */}
            <button onClick={() => alert("hi")}>클릭</button>  {/* onclick → onClick, 함수를 전달 */}
          </>
        );
      }
  - slug: jsx-list
    title: 리스트는 map + key
    source_type: generated_minimal
    language: jsx
    code: |
      function Menu() {
        const items = [
          { id: 1, label: "Home" },
          { id: 2, label: "About" },
        ];
        return (
          <ul>
            {items.map((it) => (
              <li key={it.id}>{it.label}</li>   {/* key: 형제 중 고유. index 지양 */}
            ))}
          </ul>
        );
      }
  - slug: jsx-style
    title: 인라인 스타일과 조건부 클래스
    source_type: generated_minimal
    language: jsx
    code: |
      const active = true;
      <div
        className={active ? "card card--active" : "card"}
        style={{ padding: 16, backgroundColor: active ? "#eef" : "#fff" }}
      >
        {/* style 은 객체. 속성은 camelCase(backgroundColor), 숫자는 px 로 해석 */}
      </div>
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- JSX 가 "JS 안에 쓰는 XML 비슷한 문법"이며 결국 **함수 호출로 변환**된다는 것을 안다.
- HTML 과 다른 점(`className`, `htmlFor`, `onClick`, 하나로 감싸기, 셀프 클로징, `{}` 표현식)을 **정확히** 쓴다.
- `{}` 안에 넣을 수 있는 것(표현식)과 없는 것(`if`, `for` 문)을 구분한다.
- 리스트를 `map` + `key` 로, 스타일을 `style={{}}` 객체로 쓴다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `setup-and-jsx/dev-environment` (Vite 앱, `App.jsx`).
- JS: 삼항 연산자, `map`, 템플릿 리터럴, 객체.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `<div class="box">` 를 썼는데 스타일이 안 먹는다 → JSX 는 `className`.
- `return <h1>A</h1> <p>B</p>` → 에러. 형제를 하나로 안 감쌌다.
- `{ if (x) { ... } }` → 에러. `{}` 안엔 **값**만.

<!-- section: concept -->
## JSX 규칙

{{code: jsx-basics}}

| HTML | JSX | 이유 |
|---|---|---|
| `class="..."` | `className="..."` | `class` 는 JS 예약어 |
| `for="..."` | `htmlFor="..."` | `for` 는 JS 예약어 |
| `onclick="..."` | `onClick={함수}` | 이벤트는 camelCase + **함수 전달**(문자열 X) |
| `<img>` | `<img />` | 셀프 클로징 필수 |
| (형제 여러 개 그냥) | `<>...</>` 로 감싸기 | 컴포넌트는 **하나의 요소**를 반환 |
| `<!-- 주석 -->` | `{/* 주석 */}` | JSX 안 주석 |
| `style="color:red"` | `style={{ color: "red" }}` | 객체, camelCase |

- **`{ }`** 안에는 **JS 표현식(값이 되는 것)** 만: 변수, 계산, 함수 호출, 삼항, `map` 결과.
  **문장**(`if`, `for`, `let x = 1`)은 못 넣는다 → 함수 밖에서 미리 계산하거나 삼항/`&&` 로.
- JSX 는 결국 `React.createElement(...)` (또는 새 JSX 변환)로 컴파일된다 — "HTML 처럼 생긴 JS".

<!-- section: mechanism -->
## 리스트 · 스타일

{{code: jsx-list}}
{{code: jsx-style}}

- **리스트**: `array.map(item => <li key={item.id}>...</li>)`. **`key`** 는 형제 사이에서 고유해야 한다
  (React 가 어느 항목이 바뀌었는지 추적) — 배열 `index` 는 순서가 바뀌는 리스트에서 버그를 낳으니 **id 를 쓴다**.
- **스타일**: `style={{ ... }}` — 바깥 `{}` 는 JSX 표현식, 안쪽 `{}` 는 객체. 속성은 `backgroundColor` 처럼 camelCase.
  대부분은 인라인 스타일보다 **`className` + CSS 파일**을 쓴다.
- **조건부 클래스**: `className={active ? "a b" : "a"}` (또는 `clsx` 같은 유틸).

<!-- section: must_know -->
## 반드시 기억할 것

- `class`→**`className`**, `for`→**`htmlFor`**, `onclick`→**`onClick={함수}`**.
- 컴포넌트는 **하나의 요소**를 반환 → 형제는 `<>...</>` 로 감싼다.
- 모든 태그는 닫는다 (`<br />`, `<input />`).
- `{}` 안엔 **표현식만**. `if`/`for` 문은 못 넣는다 → 삼항, `&&`, 미리 계산.
- 리스트 = `map` + **`key`(고유 id)**.
- `style` 은 **객체**(`style={{ }}`), camelCase.
- JSX 는 HTML 이 아니라 **JS** 다 — 결국 함수 호출로 바뀐다.

<!-- section: experiment -->
## 직접 해 보기

1. `App.jsx` 에서 `class` 를 써 보고 콘솔 경고를 확인한 뒤 `className` 으로 고쳐라.
2. `return` 에 형제 태그 2개를 감싸지 않고 둬서 에러를 보고, `<>...</>` 로 감싸라.
3. `{}` 안에 `if (x) {...}` 를 넣어 에러를 확인하고, 삼항이나 `&&` 로 바꿔라.
4. 문자열 배열 5개를 `map` 으로 `<li>` 목록으로 렌더하되, `key` 를 빼서 경고를 보고 `key={item}` (또는 id)로 고쳐라.

<!-- section: check_question -->
## 이해 점검

1. `class`, `for`, `onclick` 은 JSX 에서 각각 뭐라고 쓰나?
2. `{}` 안에 넣을 수 있는 것과 없는 것을 예로 하나씩.
3. 컴포넌트가 형제 요소 여러 개를 반환하려면?
4. 리스트에 `key` 가 필요한 이유와, `index` 를 피하는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "JSX 는 브라우저에서 어떻게 실행되나요? (변환)"
- "리스트 렌더링에서 `key` 의 역할과, `key`={index} 의 문제는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> HTML↔JSX 차이 6가지, `{}` 는 표현식만, Fragment, map+key, style 객체를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**JSX 는 JS 안에 쓰는 XML 문법으로 함수 호출로 변환된다 — `className`/`htmlFor`/`onClick`, 하나로 감싸기,
셀프 클로징, `{}` 안엔 표현식만, 리스트는 `map`+`key`, `style` 은 객체.**

<!-- section: next -->
## 다음 Chapter

`react/components-and-props` — 화면 조각을 컴포넌트로.
