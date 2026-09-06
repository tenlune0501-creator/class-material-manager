---
id: react/components-and-props/passing-props
chapter: react/components-and-props
title: props로 데이터 전달하기
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [react, props, data-flow, destructuring]
related_material_ids:
  - 1m1LQPW0t_Slw1WRpgSOR_bcMy4PsBRgZYrn61sGGcvo   # 04_props
  - 164YOHvw-BvtwB9Ue_x593k_C02cfFbnKgTuF6xD5qxw   # 06_Props로 데이터 전달하기
prerequisites:
  - react/components-and-props/creating-components
  - javascript/objects-and-builtins/working-with-objects
project_links:
  - unit: momentalk/button-variant-wrapper
    note: props 기본값과 spread 로 MUI 버튼을 감싸는 실제 공통 컴포넌트
code_examples:
  - slug: props-basic
    title: 부모가 내려주고, 자식이 받는다
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      // 자식: props 객체를 구조 분해로 받는다
      function ProductCard({ title, price, onSale = false }) {
        return (
          <article className="card">
            <h3>{title}</h3>
            <p>{price.toLocaleString()}원 {onSale && <span>SALE</span>}</p>
          </article>
        );
      }

      // 부모: 태그의 "속성"처럼 전달
      export default function Shop() {
        return (
          <>
            <ProductCard title="노트북" price={1200000} onSale />
            <ProductCard title="마우스" price={25000} />
          </>
        );
      }
      // 문자열은 "", 그 외(숫자·불리언·객체·함수)는 { }.  onSale (값 생략) = onSale={true}
  - slug: props-readonly
    title: props 는 읽기 전용
    source_type: generated_minimal
    language: jsx
    code: |
      function Bad({ count }) {
        count = count + 1;      // ❌ 자식이 props 를 바꾸면 안 된다 (효과도 없고 혼란)
        return <p>{count}</p>;
      }

      // 값을 바꿔야 하면? → 부모가 바꾸고 다시 내려준다.
      // 자식이 부모에게 알리는 건 콜백 props 로.
      function Toggle({ on, onChange }) {
        return <button onClick={() => onChange(!on)}>{on ? "켜짐" : "꺼짐"}</button>;
      }
      // 부모: <Toggle on={open} onChange={setOpen} />
  - slug: props-spread
    title: 나머지 props 전달 (spread)
    source_type: generated_minimal
    language: jsx
    code: |
      function Button({ variant = "primary", children, ...rest }) {
        return (
          <button className={`btn btn--${variant}`} {...rest}>
            {children}
          </button>
        );
      }
      // <Button onClick={save} disabled type="submit">저장</Button>
      // variant 는 내가 쓰고, onClick/disabled/type 은 ...rest 로 <button> 에 그대로 전달
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **props** 로 부모 → 자식에게 값(문자열·숫자·불리언·객체·함수)을 내려주고, 자식은 **구조 분해**로 받는다.
- **props 는 읽기 전용**이라는 것과, 자식이 부모에게 알리려면 **콜백 props** 를 쓴다는 것을 안다.
- 데이터가 **위에서 아래로 한 방향**(one-way data flow)으로 흐른다는 것을 설명할 수 있다.
- `...rest` 로 나머지 props 를 하위 요소에 전달할 수 있다(공통 컴포넌트 패턴).

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `components-and-props/creating-components`, 객체 구조분해·스프레드, 콜백.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 같은 카드 컴포넌트인데 내용이 달라야 함 → 하드코딩하면 재사용 불가.
- 자식 컴포넌트에서 `props.value = ...` 로 바꿨는데 화면이 안 바뀜(props 는 못 바꿈).
- 자식의 버튼 클릭을 부모가 알아야 하는데 방법을 모름.

<!-- section: concept -->
## props 내려주기

{{code: props-basic}}

- 부모가 `<ProductCard title="노트북" price={1200000} />` 처럼 **속성**을 준다.
  - 문자열은 `"..."`, 그 외(숫자·불리언·객체·배열·함수)는 **`{ }`**.
  - `onSale` (값 생략) = `onSale={true}`.
- 자식은 **props 객체 하나**를 받는다 → `function Card(props)` 후 `props.title`, 또는 바로 **구조 분해**
  `function Card({ title, price, onSale = false })` (기본값 가능).
- Momentalk 의 공통 `Button` 도 이렇게 `variant` 기본값 + spread 로 MUI 를 감싼다 (`momentalk/button-variant-wrapper`).

<!-- section: mechanism -->
## 단방향 흐름 · props 는 읽기 전용

{{code: props-readonly}}

- **데이터는 위 → 아래** 로만 흐른다. 자식은 받은 props 를 **바꾸지 않는다**(바꿔도 부모엔 반영 안 되고, 다음 렌더에 덮인다).
- 값을 바꿔야 하면 → **상태를 가진 부모가 바꾸고, 바뀐 값을 다시 내려준다.**
- 자식 → 부모 소통은 **콜백 props**: 부모가 함수를 내려주고(`onChange={setOpen}`), 자식이 그 함수를 호출.
  이게 "상태를 부모가 소유한다"의 실천 방법 (state 챕터에서 계속).

<!-- section: code | lang: jsx -->
## `...rest` 전달

{{code: props-spread}}

공통 컴포넌트는 자기가 쓰는 props 만 꺼내고 **나머지(`...rest`)를 하위 HTML 요소에 그대로 전달**한다
→ `onClick`, `disabled`, `aria-*`, `type` 같은 걸 일일이 다시 정의하지 않아도 된다.

<!-- section: must_know -->
## 반드시 기억할 것

- 전달: `<Child prop={값} />`. 문자열만 `""`, 나머지는 `{}`.
- 받기: 구조 분해 `function Child({ a, b = 기본값 })`.
- **props 는 읽기 전용.** 자식이 못 바꾼다.
- 데이터는 **한 방향(위→아래)**. 자식 → 부모는 **콜백 props**(`onXxx`).
- 공통 컴포넌트: 내가 쓸 것만 꺼내고 **`{...rest}`** 를 아래로.
- props 이름은 의미 있게. 불리언은 `isOpen`, `disabled` 처럼. 핸들러는 `onSave`, `onChange`.

<!-- section: experiment -->
## 직접 해 보기

1. `ProductCard({ title, price, tags })` 를 만들어 `tags` 는 배열로 받아 `map` 으로 `<span>` 렌더하라.
   `price` 를 숫자로 안 주고 문자열 `"1200000"` 으로 주면 `toLocaleString` 이 어떻게 되나?
2. 자식에서 `props.title = "X"` 를 시도해 (효과 없음 / 경고) 확인하라.
3. `<Toggle on={open} onChange={setOpen} />` 처럼 콜백 props 로 부모의 state 를 자식이 토글하게 만들어라.
4. `Button({ variant, children, ...rest })` 를 만들어 `<Button onClick={f} disabled>저장</Button>` 이
   `<button>` 에 `onClick`·`disabled` 를 전달하는지 개발자도구로 확인.

<!-- section: check_question -->
## 이해 점검

1. `<Card count={5} />` 와 `<Card count="5" />` 의 차이는?
2. props 가 읽기 전용이라는 게 무슨 뜻이고, 값을 바꿔야 하면 어떻게 하나?
3. 자식이 부모에게 이벤트를 알리는 방법은?
4. `{...rest}` 를 하위 요소에 넘기면 무엇이 편해지나?

<!-- section: interview_question -->
## 면접 대비

- "React 의 단방향 데이터 흐름을 설명하고, 장점을 말해 주세요."
- "자식 컴포넌트에서 부모의 상태를 바꾸는 올바른 방법은?"
- "props drilling 이 무엇이고 어떻게 완화하나요? (Context 힌트)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> props 전달·수신 문법, 읽기 전용, 단방향 흐름, 콜백 props, ...rest 를 각각 한 줄로.
> 그다음 Toggle 을 코드 없이 설계(부모/자식 역할).

<!-- section: review -->
## 한 줄 정리

**props 는 부모가 자식에게 내려주는 읽기 전용 값이다 — 데이터는 위→아래 한 방향, 자식→부모는
콜백 props(`onXxx`), 공통 컴포넌트는 `{...rest}` 로 나머지를 흘려보낸다.**

<!-- section: next -->
## 다음 Chapter

`react/state-and-events` — 변하는 값(state)과 이벤트. (이미 `usestate-basics` 집필됨)
