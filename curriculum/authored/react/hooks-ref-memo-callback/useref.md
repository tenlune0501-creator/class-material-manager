---
id: react/hooks-ref-memo-callback/useref
chapter: react/hooks-ref-memo-callback
title: useRef — 리렌더 없이 값·DOM 참조
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [react, useRef, dom, mutable-ref]
related_material_ids:
  - 11IY6WWNEtSjZNJALMsL5IflXLuoedHnD86ICDQr3RUc   # useRef
sources:
  - reference_slug: react/useRef
prerequisites:
  - react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
project_links:
  - unit: momentalk/use-focus-trap-hook
    note: useRef 로 컨테이너 요소를 잡아 포커스 트랩 구현
code_examples:
  - slug: dom-ref
    title: DOM 요소 참조 (가장 흔한 용도)
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { useRef } from "react";

      function SearchBox() {
        const inputRef = useRef(null);

        function focusInput() {
          inputRef.current.focus();   // 실제 <input> DOM 노드
        }

        return (
          <>
            <input ref={inputRef} />
            <button onClick={focusInput}>검색창으로</button>
          </>
        );
      }
      // ref={inputRef} → 마운트되면 inputRef.current 에 그 DOM 요소가 들어간다
  - slug: mutable-value
    title: 리렌더를 안 일으키는 값 저장
    source_type: generated_minimal
    language: jsx
    code: |
      function Timer() {
        const [seconds, setSeconds] = useState(0);
        const intervalId = useRef(null);   // 화면과 무관한 값 → state 가 아니라 ref

        function start() {
          if (intervalId.current) return;
          intervalId.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        }
        function stop() {
          clearInterval(intervalId.current);
          intervalId.current = null;
        }
        return (<><p>{seconds}s</p><button onClick={start}>시작</button><button onClick={stop}>정지</button></>);
      }
      // intervalId 를 useState 로 뒀다면 매번 불필요한 리렌더가 났을 것
  - slug: ref-vs-state
    title: ref 는 바꿔도 화면이 안 바뀐다
    source_type: generated_minimal
    language: jsx
    code: |
      const countRef = useRef(0);

      function handleClick() {
        countRef.current += 1;       // 값은 바뀐다
        console.log(countRef.current);
        // 하지만 화면의 {countRef.current} 는 갱신 안 됨 (리렌더가 없으므로)
      }
      // 화면에 보여야 하는 값 = useState.   화면과 무관하게 들고만 있을 값 = useRef.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `useRef` 로 **DOM 요소를 참조**(포커스, 스크롤, 크기 측정)한다.
- `useRef` 로 **리렌더를 일으키지 않는 값**(타이머 id, 이전 값, 플래그)을 보관한다.
- `useRef` 와 `useState` 를 언제 각각 쓰는지("화면에 보이나?") 판단한다.
- `ref.current` 를 바꿔도 화면이 안 바뀐다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useState`, `useEffect`. 컴포넌트가 리렌더될 때마다 함수가 다시 실행된다는 것.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- input 에 자동 포커스를 주고 싶은데 `document.querySelector` 를 쓰자니 React 스럽지 않다.
- `setInterval` 의 id 를 `useState` 로 뒀더니 정지 버튼을 누를 때마다 불필요한 리렌더.
- 렌더 사이에 "이전 값"을 비교하고 싶은데 저장할 곳이 없다.

<!-- section: concept -->
## useRef = "리렌더와 무관한 상자"

`const r = useRef(초기값)` → `{ current: 초기값 }` 객체를 돌려준다. 이 객체는 **컴포넌트가 살아 있는 동안 계속 같다**.

- `r.current` 를 읽고 쓸 수 있다.
- **`r.current` 를 바꿔도 리렌더가 일어나지 않는다.**

### 용도 1 — DOM 참조

{{code: dom-ref}}

JSX 요소에 `ref={inputRef}` 를 달면, 마운트될 때 `inputRef.current` 에 **그 DOM 노드**가 들어간다.
`focus()`, `scrollIntoView()`, `getBoundingClientRect()` 같은 명령형 DOM API 를 쓸 때.

<!-- section: mechanism -->
## 용도 2 — 리렌더 없이 값 보관

{{code: mutable-value}}

타이머 id, "이미 실행했음" 플래그, 이전 props 값 등 **화면에 안 나오지만 렌더 사이에 유지해야 하는 값**은
`useState` 대신 `useRef` — 바꿔도 리렌더가 안 나서 낭비가 없다.

Momentalk 의 `useFocusTrap` 훅도 `useRef` 로 컨테이너 요소를 잡아, 그 안에서 Tab 이동을 가둔다.

<!-- section: code | lang: jsx -->
## ref vs state

{{code: ref-vs-state}}

**판별 기준: "이 값이 바뀌면 화면이 바뀌어야 하나?"**
- 그렇다 → `useState` (바꾸면 리렌더).
- 아니다(들고만 있으면 됨) → `useRef` (바꿔도 조용함).

<!-- section: must_know -->
## 반드시 기억할 것

- `useRef(init)` → `{ current }`. 컴포넌트 수명 동안 **같은 객체**.
- `ref.current` 변경은 **리렌더를 안 일으킨다.** 화면에 보여야 하면 `useState`.
- DOM 참조: JSX 에 `ref={r}` → 마운트 후 `r.current` = DOM 노드. **렌더 중에는 `null`** 일 수 있으니
  `useEffect` 나 이벤트 핸들러에서 접근.
- 렌더 중에 `ref.current` 를 읽거나 쓰지 않는다(effect/핸들러에서만).
- 타이머 id, 플래그, 이전 값 저장에 `useRef`.

<!-- section: experiment -->
## 직접 해 보기

1. 페이지가 열리면 검색 input 에 자동 포커스되게 하라(`useRef` + `useEffect(() => ref.current.focus(), [])`).
2. `Timer` 를 만들되 `intervalId` 를 `useState` 로 뒀을 때와 `useRef` 로 뒀을 때 리렌더 횟수를 비교
   (`console.log("render")` 를 본문에).
3. `countRef.current += 1` 만 하고 화면의 `{countRef.current}` 가 안 바뀌는 걸 확인한 뒤, `useState` 로 고쳐라.
4. "이전 값"을 기억하는 패턴: `const prev = useRef(); useEffect(() => { prev.current = value; });` 로
   `value` 가 바뀔 때 이전/현재를 비교해 로그.

<!-- section: check_question -->
## 이해 점검

1. `ref.current` 를 바꾸면 화면이 갱신되나? state 와의 차이는?
2. DOM 요소를 `useRef` 로 잡는 방법과, `current` 가 언제 채워지나?
3. 타이머 id 를 `useState` 대신 `useRef` 에 두는 이유는?
4. "이 값을 state 로 할까 ref 로 할까"의 판별 질문은?

<!-- section: interview_question -->
## 면접 대비

- "`useRef` 의 두 가지 용도를 설명해 주세요."
- "`useRef` 로 만든 값과 일반 변수(`let`)의 차이는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> useRef 의 반환값, "리렌더 안 함", DOM 참조 방법과 current 채워지는 시점, ref vs state 판별,
> 렌더 중 접근 금지를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`useRef` 는 리렌더와 무관한 `{ current }` 상자다 — DOM 요소를 잡거나(포커스·스크롤),
화면에 안 나오지만 렌더 사이 유지할 값(타이머 id·플래그)을 담는다. 바꿔도 화면은 안 바뀐다.**

<!-- section: next -->
## 다음 Lesson

`hooks-ref-memo-callback/usememo-usecallback` — 불필요한 재계산·재생성 줄이기.
