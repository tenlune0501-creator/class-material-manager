---
id: react/components-and-props/creating-components
chapter: react/components-and-props
title: 컴포넌트 만들고 파일로 분리하기
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [react, component, structure]
related_material_ids:
  - 1NEc37gENWll9_lbm1jpNIqpO3b84z8uia8ITuNCTXFc   # 03_컴포넌트 생성하기
  - 184rtxdCAnpjIk7S4Ovc4PDkeXy4La-lQJ4Oo7tmDg7Q   # 05_컴포넌트 기초 (Header, Footer 만들기)
  - 1LDQv5dSs8Dq8vHLBw6LHFdhwyvIdjTqJJnoopzBUgd4   # 05_컴포넌트를 파일로 분리하기
prerequisites:
  - react/setup-and-jsx/jsx
  - javascript/classes-and-modules/es-modules
code_examples:
  - slug: component-basic
    title: 컴포넌트 = JSX 를 반환하는 함수
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      // 이름은 대문자로 시작해야 React 가 "컴포넌트"로 인식 (소문자면 HTML 태그)
      function Header() {
        return (
          <header>
            <h1>My Site</h1>
          </header>
        );
      }

      function Footer() {
        return <footer><small>© 2026</small></footer>;
      }

      export default function App() {
        return (
          <>
            <Header />          {/* 함수 호출이 아니라 태그처럼 */}
            <main>본문</main>
            <Footer />
          </>
        );
      }
  - slug: split-files
    title: 파일로 분리
    source_type: generated_minimal
    language: jsx
    code: |
      // src/components/Header.jsx
      export default function Header() {
        return <header><h1>My Site</h1></header>;
      }

      // src/components/Footer.jsx
      export function Footer() {          // named export 도 가능
        return <footer><small>© 2026</small></footer>;
      }

      // src/App.jsx
      import Header from "./components/Header";      // default → 이름 자유
      import { Footer } from "./components/Footer";  // named → 중괄호 + 같은 이름

      export default function App() {
        return (<><Header /><main>본문</main><Footer /></>);
      }
  - slug: children
    title: children — 태그 사이의 내용
    source_type: generated_minimal
    language: jsx
    code: |
      function Card({ children }) {
        return <div className="card">{children}</div>;
      }

      // 사용
      <Card>
        <h3>제목</h3>
        <p>아무 JSX 나 안에 넣으면 children 으로 들어온다</p>
      </Card>
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 컴포넌트가 **JSX 를 반환하는 함수**이며, 이름은 **대문자**로 시작해야 한다는 것을 안다.
- `<Header />` 처럼 태그로 조합하고, 컴포넌트를 **파일로 분리**해 `export` / `import` 한다.
- `children` 으로 "태그 사이의 내용"을 받는 래퍼 컴포넌트를 만들 수 있다.
- 컴포넌트를 언제 쪼개는지 감을 잡는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `setup-and-jsx/jsx`, ES 모듈(`export default` / `export` / `import`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `App.jsx` 하나에 200줄 JSX → 어디가 헤더고 어디가 카드인지 안 보이고, 재사용이 안 된다.
- 같은 카드 UI 를 5번 복붙 → 디자인 바뀌면 5군데 수정.
- 컴포넌트 이름을 `header` (소문자)로 해서 React 가 HTML 태그로 오해.

<!-- section: concept -->
## 컴포넌트 = 함수

{{code: component-basic}}

- 컴포넌트 = **JSX 를 `return` 하는 함수**.
- **이름 대문자 필수**: `<Header />` 는 컴포넌트, `<header>` 는 HTML 태그. React 가 이걸로 구분한다.
- 사용할 때 **`<Header />`** — 함수 호출(`Header()`)이 아니라 **태그처럼**.
- 한 파일에 여러 컴포넌트를 둘 수 있지만, 보통 **하나의 파일 = 하나의 주요 컴포넌트**.

<!-- section: mechanism -->
## 파일 분리 · export / import

{{code: split-files}}

- **`export default Header`** → `import Header from "./Header"` (이름 자유, 중괄호 없음). 파일의 "대표" 하나.
- **`export function Footer`** (named) → `import { Footer } from "./Footer"` (중괄호 + 같은 이름). 여러 개 export 할 때.
- 관례: `src/components/` 아래에 컴포넌트 파일, 파일명 = 컴포넌트명(`Header.jsx`).
- 한 컴포넌트가 커지면 그 폴더 안에 하위 컴포넌트를 두기도 한다.

<!-- section: code | lang: jsx -->
## children

{{code: children}}

`<Card>...</Card>` 처럼 **여는 태그와 닫는 태그 사이에 넣은 JSX** 는 그 컴포넌트에 `props.children` 으로 전달된다.
레이아웃·래퍼(카드, 모달, 패널)를 만들 때 핵심 패턴이다.

<!-- section: must_know -->
## 반드시 기억할 것

- 컴포넌트 = JSX 반환 함수. **이름 대문자**로 시작.
- 사용은 `<Comp />` (태그처럼). 스스로 닫거나 `<Comp>...</Comp>`.
- `export default` (대표 1개, import 이름 자유) vs `export` named (여러 개, import 이름 고정).
- `children` = 태그 사이 내용. 래퍼 컴포넌트의 핵심.
- **언제 쪼개나**: 재사용될 때 / 한 화면이 너무 길 때 / 한 덩어리가 독립적인 역할일 때.
  너무 잘게 쪼개도(1줄짜리 컴포넌트 남발) 오히려 읽기 어렵다 — 균형.
- 컴포넌트는 **순수하게** 유지: 같은 props 면 같은 결과. 렌더 중에 외부를 바꾸지 않는다.

<!-- section: experiment -->
## 직접 해 보기

1. `Header`, `Nav`, `Footer` 를 각각 파일로 만들고 `App.jsx` 에서 조합하라. `Header` 는 default, `Nav` 는 named export.
2. 컴포넌트 이름을 `nav`(소문자)로 바꿔 보고 화면에서 사라지는(또는 경고) 것을 확인, 대문자로 복구.
3. `<Panel title="설정">` + `children` 을 받는 `Panel` 컴포넌트를 만들어, 안에 아무 JSX 나 넣어 렌더하라.
4. `App.jsx` 의 긴 JSX 를 의미 단위로 3개 컴포넌트로 쪼개고, 오히려 읽기 어려워지는 "과분할" 선을 느껴 보라.

<!-- section: check_question -->
## 이해 점검

1. 컴포넌트 이름을 대문자로 시작해야 하는 이유는?
2. `<Header />` 와 `Header()` 의 차이는?
3. `export default` 와 named `export` 의 import 방식 차이는?
4. `children` 은 언제 어떻게 들어오나?

<!-- section: interview_question -->
## 면접 대비

- "컴포넌트를 어떤 기준으로 분리하나요? 과분할의 단점은?"
- "합성(composition)을 `children` 으로 하는 예를 들어 주세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 컴포넌트 정의, 대문자 규칙, 사용법, default vs named export, children, 분리 기준을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**컴포넌트는 JSX 를 반환하는 대문자 함수다 — `<Comp />` 로 조합하고, 파일로 분리해 `export`/`import` 하며,
태그 사이 내용은 `children` 으로 받는다.**

<!-- section: next -->
## 다음 Lesson

`components-and-props/passing-props` — 부모가 자식에게 값 내려주기.
