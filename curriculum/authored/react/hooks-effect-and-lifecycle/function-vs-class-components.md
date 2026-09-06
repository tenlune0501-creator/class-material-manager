---
id: react/hooks-effect-and-lifecycle/function-vs-class-components
chapter: react/hooks-effect-and-lifecycle
title: 함수형과 클래스형 컴포넌트 비교
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [react, class-component, function-component, history]
related_material_ids:
  - 1ZvMqD542Ib1vvfw0WHu9zwZu1-g5tXNLjiXqXlgkquo   # 11. 함수형 클래스형 컴포넌트 비교
sources:
  - reference_slug: react/Component
prerequisites:
  - react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
code_examples:
  - slug: side-by-side
    title: 같은 컴포넌트, 두 방식
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      // 클래스형 (옛 코드에서 만난다)
      class Counter extends React.Component {
        state = { count: 0 };
        handleClick = () => this.setState({ count: this.state.count + 1 });
        componentDidMount()    { document.title = String(this.state.count); }
        componentDidUpdate()   { document.title = String(this.state.count); }
        componentWillUnmount() { /* 정리 */ }
        render() {
          return <button onClick={this.handleClick}>{this.state.count}</button>;
        }
      }

      // 함수형 (지금 쓰는 방식)
      function Counter() {
        const [count, setCount] = useState(0);
        useEffect(() => { document.title = String(count); }, [count]);
        return <button onClick={() => setCount(count + 1)}>{count}</button>;
      }
  - slug: lifecycle-map
    title: 생명주기 메서드 ↔ 훅
    source_type: generated_minimal
    language: text
    code: |
      componentDidMount            →  useEffect(() => {...}, [])
      componentDidUpdate           →  useEffect(() => {...}, [deps])
      componentWillUnmount         →  useEffect(() => { return () => {...} }, [])
      this.state / this.setState   →  useState
      this.props                   →  함수 매개변수 props (구조 분해)
      this.someRef                 →  useRef
      shouldComponentUpdate        →  React.memo + useMemo/useCallback
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 클래스형 컴포넌트(`extends React.Component`, `this.state`, `render()`, 생명주기 메서드)를 **읽을 수 있다.**
- 클래스 생명주기 메서드가 훅으로 어떻게 대응되는지 매핑한다.
- 왜 지금은 **함수형 + 훅**이 표준인지, 옛 코드를 만났을 때 어떻게 볼지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useState`, `useEffect`(의존성, 정리 함수). JS `class` 문법, `this`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 회사 레거시 코드, 옛 튜토리얼, 강사 자료(대부분 클래스형)를 열었는데 `this.setState`, `componentDidMount` 가 뭔지 몰라 막힌다.
- 클래스형을 함수형으로 옮겨야 하는데 대응 관계를 모름.

<!-- section: concept -->
## 두 방식은 "같은 것"을 다르게 쓴다

{{code: side-by-side}}

- **클래스형**: `state` 는 `this.state` 객체, 변경은 `this.setState({...})`(**병합**됨), 로직은 `render()` 와
  생명주기 메서드(`componentDidMount` 등)에 흩어진다. `this` 바인딩 문제로 핸들러를 화살표 필드로 써야 했다.
- **함수형 + 훅**: `useState`(값마다 따로), `useEffect`(관련 로직을 한 곳에), `this` 없음.

<!-- section: mechanism -->
## 매핑표

{{code: lifecycle-map}}

- **마운트 후 1회** = `componentDidMount` = `useEffect(fn, [])`.
- **업데이트 후** = `componentDidUpdate` = `useEffect(fn, [deps])`.
- **언마운트 전** = `componentWillUnmount` = `useEffect` 의 **반환(정리) 함수**.
- 클래스는 `mount / update / unmount` 를 **메서드로 나눠** 생각했고, 훅은 **"무엇과 동기화하느냐"(의존성)** 로 생각한다.

<!-- section: must_know -->
## 반드시 기억할 것

- **새 코드는 함수형 + 훅.** 클래스형은 **읽을 줄만** 알면 된다(옛 코드·에러 경계 정도).
- `this.setState` 는 객체를 **병합**한다. `useState` 의 `setX` 는 **교체**한다(객체면 `{...prev, 바꿀것}`).
- `componentDidMount` + `componentDidUpdate` 에 같은 코드를 두던 패턴 = `useEffect(fn, [deps])` 하나.
- 생명주기 "메서드 이름"을 외우기보다 **"이 effect 는 무엇이 바뀌면 다시 해야 하나"**(의존성)로 생각.
- `Error Boundary`(에러 잡기)는 아직 클래스로만 가능 — 그 경우만 클래스를 직접 쓴다(또는 라이브러리).

<!-- section: experiment -->
## 직접 해 보기

1. 강사 자료의 클래스형 컴포넌트(예: `Myheader`)를 함수형으로 옮겨라. `this.props.title` → `props.title`.
2. `componentDidMount` + `componentWillUnmount` 로 이벤트 리스너를 등록/해제하는 클래스 코드를
   `useEffect(() => { ...; return () => ... }, [])` 로 바꿔라.
3. `this.setState({ a: 1 })` 가 `b` 를 안 지우는 것과, `useState` 에서 `setObj({ a: 1 })` 이 `b` 를 날리는 것을
   비교하고 `{...prev, a: 1}` 로 고쳐라.

<!-- section: check_question -->
## 이해 점검

1. `componentDidMount` / `componentDidUpdate` / `componentWillUnmount` 를 각각 훅으로?
2. `this.setState` 와 `useState` 의 `set` 함수의 "객체 처리" 차이는?
3. 지금도 클래스 컴포넌트를 써야 하는 경우는?
4. 훅 방식은 생명주기를 무엇 중심으로 생각하나?

<!-- section: interview_question -->
## 면접 대비

- "클래스형에서 함수형으로 전환한 이유(React 팀 관점)는?"
- "생명주기 메서드와 `useEffect` 의 사고방식 차이를 설명해 주세요."

<!-- section: review -->
## 한 줄 정리

**클래스형과 함수형은 같은 일을 다르게 쓴다 — 새 코드는 함수형+훅, 클래스형은 읽을 줄만 알면 되고,
`didMount/didUpdate/willUnmount` 는 `useEffect` 의 `[]`/`[deps]`/정리 함수에 대응한다.**

<!-- section: next -->
## 다음 Chapter

`react/hooks-ref-memo-callback` — useRef · useMemo · useCallback.
