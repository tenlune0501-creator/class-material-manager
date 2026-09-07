---
id: react/missions/react-basic-mission
chapter: react/missions
title: React Basic Mission
mastery: practical
lesson_kind: lesson
estimated_minutes: 120
tags: [react, mission, capstone, practice]
related_material_ids:
  - 17skefIHLsgs97Y3R7mdzKWb8vG2dVvWA4AuNWH_0sTQ   # REACT basic mission (문제)
  - 1gZHjfRVNSgQjcQQ4LCYRcuBM7weDZDi8QmPsN6kd8f0   # REACT basic mission (정답)
  - 1FovqWYuEFX5HFt9Zj2PbI9j5-ZaPRvhRn_ckotLXOuQ   # REACT 핵심정리
prerequisites:
  - react/components-and-props/passing-props
  - react/state-and-events/usestate-basics
  - react/rendering-logic/lists-and-keys
code_examples:
  - slug: list-render-3ways
    title: 목록 렌더 3가지 — for / forEach / map (왜 map인가)
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      const features = [{ id: 1, desc: "..." }, { id: 2, desc: "..." }];

      // for: 누적 배열을 직접 만든다
      const forHTML = [];
      for (let i = 0; i < features.length; i++) forHTML.push(<li key={features[i].id}>{features[i].desc}</li>);

      // forEach: 반환값이 없다 → 바깥 배열에 push 해야 함
      const forEachHTML = [];
      features.forEach((f) => forEachHTML.push(<li key={f.id}>{f.desc}</li>));

      // map: 새 배열을 "반환" → JSX 안에 그대로 쓸 수 있다 ← React 표준
      const mapHTML = features.map((f) => <li key={f.id}>{f.desc}</li>);
      // return <ul>{mapHTML}</ul>;  또는  <ul>{features.map(f => <li key={f.id}>{f.desc}</li>)}</ul>
  - slug: lift-state
    title: 상태 끌어올리기 — 클릭한 항목만 강조
    source_type: generated_minimal
    language: jsx
    code: |
      // App: 데이터와 변경 함수를 소유
      function App() {
        const [features, setFeatures] = useState(INITIAL); // 각 원소에 clicked:false

        const selectItem = (id) =>
          setFeatures((prev) =>
            prev.map((f) => (f.id === id ? { ...f, clicked: !f.clicked } : f)),
          );

        return <Comp4 list={features} selectItem={selectItem} />;
      }

      // Comp4: 표시 + "무엇을 클릭했는지" 만 부모에 알림
      function Comp4({ list, selectItem }) {
        return (
          <ul>
            {list.map((f) => (
              <li key={f.id}
                  className={f.clicked ? "active" : ""}
                  onClick={() => selectItem(f.id)}>
                {f.desc}
              </li>
            ))}
          </ul>
        );
      }
  - slug: controlled-forms
    title: 이벤트 3종 — 입력 반영 / 카운터 / form 제출
    source_type: generated_minimal
    language: jsx
    code: |
      const [text, setText] = useState("");
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>{text}</p>

      const [count, setCount] = useState(0);
      <button onClick={() => setCount((c) => c + 1)}>+1</button> {count}

      const [inputValue, setInputValue] = useState("");
      <form onSubmit={(e) => { e.preventDefault(); alert(inputValue); }}>
        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button>제출</button>
      </form>
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 지금까지 배운 **컴포넌트 분리 / props(구조분해) / 리스트 렌더 / 이벤트 / `useState`** 를
  하나의 미션에서 막힘 없이 조립할 수 있다.
- 목록 렌더에서 `map` 을 쓰는 이유(반환값이 있는 유일한 반복)를 설명한다.
- "클릭한 항목만 강조" 같은 요구를 **상태 끌어올리기 + 불변 업데이트**로 푼다.
- 제어 컴포넌트(입력 반영 / 카운터 / form 제출) 3종을 손으로 짠다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- props와 구조분해, `map` + `key`, `useState`, `onClick`/`onChange`/`onSubmit`.

<!-- section: dev_problem -->
## 미션 개요

`REACT basic mission` 은 챕터 복습용 미션이다(정답 문서·핵심정리 동봉). 대략:

1. `Comp1` — 제목/설명 출력 (컴포넌트 생성·로드)
2. `Comp2-1` / `Comp2-2` — props 그대로 / **구조분해**로 출력
3. `Comp3` — 배열을 받아 `for` / `forEach` / `map` 3가지로 렌더
4. 이벤트 — alert, 입력 내용 반영, 숫자 카운트, form 제출 alert
5. `Comp4` — 목록을 클릭하면 그 항목만 `active` 클래스 (상태 끌어올리기)

<!-- section: concept -->
## 1. 리스트 렌더 — 왜 map인가

{{code: list-render-3ways}}

- `for` / `forEach` 는 값을 **반환하지 않는다** → 바깥 배열에 `push` 해야 JSX에 쓸 수 있다.
- `map` 은 **새 배열을 반환** → `<ul>{arr.map(...)}</ul>` 로 바로 쓴다. 그래서 React 표준.
- 어느 방식이든 각 항목에 **안정적인 `key`**(보통 `id`)를 준다.

<!-- section: mechanism -->
## 2. 상태 끌어올리기 — 클릭 강조

{{code: lift-state}}

- 데이터(`features`)와 그걸 바꾸는 함수(`selectItem`)는 **부모(App)가 소유**한다.
- 자식(`Comp4`)은 표시와 "무엇을 클릭했는지 id 전달"만 한다.
- 갱신은 **불변**으로: `prev.map(f => f.id === id ? { ...f, clicked: !f.clicked } : f)`.
  원본 배열/객체를 직접 바꾸면 리렌더가 안 되거나 버그가 난다.
- 표시 클래스는 파생값: `className={f.clicked ? "active" : ""}`.

<!-- section: concept | title: 이벤트 3종 -->
## 3. 제어 컴포넌트 이벤트

{{code: controlled-forms}}

- 입력 반영·카운터·form 제출 모두 `useState` + `value`/`onChange` 패턴.
- form 제출은 `onSubmit` 에서 **`e.preventDefault()`** 를 먼저.
- 카운터는 연속 클릭 대비 **함수형 업데이트**(`setCount(c => c + 1)`).

<!-- section: must_know -->
## 반드시 기억할 것

- 목록은 `map` (반환값 있음) + `key`. `for`/`forEach` 는 `push` 필요.
- props는 구조분해로 받으면 코드가 짧다: `function Comp({ title, desc })`.
- "특정 항목만 바뀌는" 요구 → 상태는 **부모가 소유**, 자식은 id만 올려 보냄(끌어올리기).
- 배열/객체 상태는 **불변 업데이트**(`map`/`filter`/spread). 직접 수정 금지.
- form 제출은 `e.preventDefault()`. 연속 증가는 함수형 업데이트.
- 표시용 클래스/텍스트는 상태에서 **계산**한다(따로 저장하지 않는다).

<!-- section: experiment -->
## 미션 체크리스트

1. `Comp1`~`Comp3` 를 만들고 `Comp3` 에서 `forHTML`/`forEachHTML`/`mapHTML` 세 변수를 각각 렌더하라.
2. `Comp2-2` 는 props를 **구조분해**로 받아 출력하라.
3. 이벤트 4개(alert / 입력 반영 / 카운터 / form 제출 alert)를 각각 별도 영역에 구현하라.
4. `Comp4` 에서 목록 클릭 시 그 항목만 `active` 가 붙게 하라. `selectItem` 은 App이 소유.
5. 카운터를 `setCount(count + 1)` 로 바꿔 두 번 연속 호출해 보고 함수형으로 되돌려라.
6. 정답 문서와 비교해 "다르게 풀었지만 맞는" 부분과 "틀린" 부분을 구분하라.

<!-- section: check_question -->
## 이해 점검

1. `for`/`forEach` 로 리스트를 만들 때 `map` 과 달리 꼭 해야 하는 건?
2. `Comp4` 에서 클릭한 항목만 바꾸려면 상태를 누가 소유해야 하나? 왜?
3. `features[0].clicked = true` 로 바꾸면 왜 화면이 안 바뀌나?
4. form 제출에서 `e.preventDefault()` 를 빼면?
5. `active` 클래스를 별도 state로 저장하지 않고 계산하는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "리스트 렌더링에서 `key` 의 역할과, index를 key로 쓰면 생기는 문제는?"
- "상태 끌어올리기(lifting state up)는 언제 필요하고 어떻게 하나요?"
- "불변 업데이트를 지키지 않으면 React에서 무슨 일이 생기나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> map=반환값 있음(표준)·for/forEach=push, props 구조분해, 상태 끌어올리기+불변 업데이트,
> 제어 이벤트 3종(value/onChange, preventDefault, 함수형 카운터)을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**이 미션은 컴포넌트·props·리스트·이벤트·`useState` 를 한 번에 조립한다 — 목록은 `map`+`key`,
"특정 항목만 변경"은 부모가 상태를 소유하고 불변 업데이트로 처리, 폼은 제어 컴포넌트 + `preventDefault`.**
