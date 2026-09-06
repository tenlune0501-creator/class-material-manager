---
id: react/state-and-events/events-and-handlers
chapter: react/state-and-events
title: 이벤트 핸들링 (onClick, onChange)
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [react, events, onClick, onChange, handler]
related_material_ids:
  - 19w6uu-g9dyoacyEANxUApzRkp3FX2m1hZGCJPSotI3U   # 07_state 이벤트 연결
  - 1Et_OStoxyfctX2Shin0FizlwJbP0wt64hkG91wIKPQk   # 08_이벤트 핸들링 (onClick, onChange)
prerequisites:
  - react/state-and-events/usestate-basics
code_examples:
  - slug: handlers
    title: 핸들러 — 함수를 "전달"한다
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function Buttons() {
        const [n, setN] = useState(0);

        function handleReset() {          // 핸들러는 컴포넌트 안에 함수로
          setN(0);
        }

        return (
          <>
            <p>{n}</p>
            <button onClick={() => setN(n + 1)}>+1</button>   {/* 인자 필요 → 화살표로 감쌈 */}
            <button onClick={handleReset}>리셋</button>        {/* 인자 없음 → 이름만. () 붙이면 즉시 실행됨(버그) */}
          </>
        );
      }
  - slug: onchange
    title: onChange — 입력값을 state 로 (제어 컴포넌트)
    source_type: generated_minimal
    language: jsx
    code: |
      function NameForm() {
        const [name, setName] = useState("");
        const [agree, setAgree] = useState(false);

        return (
          <form onSubmit={(e) => { e.preventDefault(); console.log(name, agree); }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}   {/* e.target.value = 입력창의 현재 값 */}
            />
            <label>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}  {/* 체크박스는 .checked */}
              />
              동의
            </label>
            <button type="submit">제출</button>
          </form>
        );
      }
  - slug: event-arg
    title: 이벤트 객체와 인자 넘기기
    source_type: generated_minimal
    language: jsx
    code: |
      // 목록에서 어떤 항목인지 넘기기
      {items.map((it) => (
        <li key={it.id}>
          {it.name}
          <button onClick={() => handleDelete(it.id)}>삭제</button>
        </li>
      ))}

      function handleDelete(id) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }

      // 폼 제출 시 새로고침 막기
      function handleSubmit(e) {
        e.preventDefault();   // 브라우저 기본 동작(페이지 리로드) 차단
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `onClick` / `onChange` / `onSubmit` 에 **함수를 전달**하고, `handler` vs `handler()` 의 차이(즉시 실행 버그)를 안다.
- `onChange` 로 입력값을 state 에 담는 **제어 컴포넌트**를 만들 수 있다(`value` + `onChange` 쌍).
- 이벤트 객체(`e.target.value`, `e.target.checked`, `e.preventDefault()`)를 쓴다.
- 목록 항목에서 "어떤 항목인지" 핸들러에 넘길 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `react/state-and-events/usestate-basics` (state, `set` 함수, 함수형 업데이트).
- JS 콜백, 화살표 함수.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `<button onClick={handleClick()}>` — 렌더될 때 **즉시 실행**돼 버림. 클릭과 무관.
- 입력창에 타이핑이 안 됨 → `value={name}` 만 있고 `onChange` 가 없어 state 가 안 바뀜(읽기 전용이 됨).
- 폼 제출 시 페이지가 새로고침돼 state 가 날아감 → `e.preventDefault()` 누락.

<!-- section: concept -->
## 핸들러는 "전달"하는 것

{{code: handlers}}

- `onClick={함수}` — 클릭 시 React 가 **그 함수를 호출**한다.
- `onClick={handleReset}` (이름만) — OK. `onClick={handleReset()}` (괄호) — **렌더 중 즉시 실행** → 버그.
- 인자를 넘기거나 여러 줄이면 **화살표로 감싼다**: `onClick={() => setN(n + 1)}`.
- 핸들러 함수는 보통 컴포넌트 안에 `handleXxx` 로 정의한다.

<!-- section: mechanism -->
## onChange + 제어 컴포넌트

{{code: onchange}}

- 입력 요소의 값을 **state 가 소유**한다: `value={name}` (state → 화면) + `onChange={e => setName(e.target.value)}` (입력 → state).
  이 쌍이 **제어 컴포넌트**. 하나만 있으면 안 됨.
- `e.target.value` — text/textarea/select 의 현재 값. `e.target.checked` — 체크박스/라디오.
- 폼 전체는 `<form onSubmit={handleSubmit}>` + `<button type="submit">`. `handleSubmit` 첫 줄에 **`e.preventDefault()`**.

<!-- section: code | lang: jsx -->
## 이벤트 객체 · 인자

{{code: event-arg}}

- 목록에서 삭제할 항목의 id 를 넘기려면 `onClick={() => handleDelete(it.id)}`.
- 상태 업데이트는 **함수형**(`setItems(prev => prev.filter(...))`) — 이전 값을 기준으로 안전하게.
- `e.preventDefault()` — 폼 제출(리로드), 링크 이동 같은 브라우저 기본 동작 차단.

<!-- section: must_know -->
## 반드시 기억할 것

- `onClick={fn}` (전달). **`onClick={fn()}` 은 즉시 실행 버그.** 인자 필요하면 `onClick={() => fn(arg)}`.
- 제어 컴포넌트 = **`value` + `onChange` 쌍**. 하나만 있으면 입력이 안 되거나 state 와 어긋난다.
- `e.target.value` (텍스트류), `e.target.checked` (체크박스).
- 폼 제출 핸들러 첫 줄: **`e.preventDefault()`**.
- 이벤트 이름은 camelCase: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onMouseEnter`.
- 목록·비동기 후 상태 변경은 **함수형 업데이트**(`setX(prev => ...)`).

<!-- section: experiment -->
## 직접 해 보기

1. `<button onClick={handleClick()}>` 로 써서 클릭 전에 실행되는 걸 확인하고 `onClick={handleClick}` 으로 고쳐라.
2. `<input value={text} />` 만 두고 타이핑이 안 되는 걸 확인한 뒤 `onChange` 를 추가하라.
3. 이름·이메일·동의(체크박스) 폼을 만들어 `onSubmit` 에서 `e.preventDefault()` 후 값을 콘솔에 찍어라.
   `preventDefault` 를 빼면 어떻게 되나?
4. 항목 목록에서 각 항목 옆 "삭제" 버튼으로 그 항목만 제거하라(`filter` + 함수형 업데이트).

<!-- section: check_question -->
## 이해 점검

1. `onClick={fn}` 과 `onClick={fn()}` 의 차이는?
2. 제어 컴포넌트가 되려면 input 에 무엇 무엇이 있어야 하나?
3. 텍스트 입력과 체크박스는 각각 `e.target` 의 무엇을 읽나?
4. `onSubmit` 핸들러에서 `e.preventDefault()` 를 하는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "제어 컴포넌트와 비제어 컴포넌트의 차이는?"
- "React 이벤트가 실제 DOM 이벤트와 다른 점(합성 이벤트)이 있나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 핸들러 전달 vs 즉시 실행, 제어 컴포넌트의 value+onChange, e.target.value/checked, preventDefault,
> 목록에서 인자 넘기기를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**이벤트엔 함수를 "전달"한다(`onClick={fn}`, 괄호 붙이면 즉시 실행) — 입력은 `value`+`onChange` 쌍의
제어 컴포넌트로, 폼 제출은 `e.preventDefault()` 로 새로고침을 막는다.**

<!-- section: next -->
## 다음 Chapter

`react/rendering-logic` — 조건부 렌더링과 리스트.
