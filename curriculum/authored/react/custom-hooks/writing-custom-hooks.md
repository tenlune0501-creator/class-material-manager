---
id: react/custom-hooks/writing-custom-hooks
chapter: react/custom-hooks
title: 커스텀 훅 만들기
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [react, custom-hook, reuse, logic-extraction]
related_material_ids:
  - 1H5toucLXeXOM8U_-XBGC2Oyi4iUx7ZZVe-cTsk5kOuU   # Custom Hook
  - 1agxOyJ-iaV_WIo0dX_Ma9i2WK2lkJPBS              # react-custom-hooks-starter.zip
  - 1OTNXRKEkpp9fBFfTM2PN0LaAx7XTZEg4              # react-custom-hooks-v202606.zip
sources:
  - reference_slug: react/rules-of-hooks
prerequisites:
  - react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
  - react/hooks-ref-memo-callback/useref
project_links:
  - unit: momentalk/use-focus-trap-hook
    note: useEffect + useRef 를 묶은 useFocusTrap 커스텀 훅
code_examples:
  - slug: use-toggle
    title: useToggle — 가장 작은 커스텀 훅
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { useState, useCallback } from "react";

      // 규칙: 이름이 use 로 시작 + 안에서 다른 훅을 쓸 수 있다
      function useToggle(initial = false) {
        const [on, setOn] = useState(initial);
        const toggle = useCallback(() => setOn((v) => !v), []);
        return [on, toggle];        // 무엇을 반환할지는 자유 (배열/객체)
      }

      // 사용 — 여러 컴포넌트가 같은 로직을 재사용
      function Modal() {
        const [open, toggleOpen] = useToggle();
        return (<><button onClick={toggleOpen}>{open ? "닫기" : "열기"}</button>{open && <div>내용</div>}</>);
      }
  - slug: use-local-storage
    title: useLocalStorage — state + 저장을 하나로
    source_type: generated_minimal
    language: jsx
    code: |
      function useLocalStorage(key, initial) {
        const [value, setValue] = useState(() => {
          const saved = localStorage.getItem(key);
          return saved != null ? JSON.parse(saved) : initial;
        });

        useEffect(() => {
          localStorage.setItem(key, JSON.stringify(value));
        }, [key, value]);

        return [value, setValue];   // useState 와 같은 모양으로 → 갈아 끼우기 쉽다
      }
      // const [theme, setTheme] = useLocalStorage("theme", "light");
  - slug: use-fetch
    title: useFetch — effect + cleanup 을 캡슐화
    source_type: generated_minimal
    language: jsx
    code: |
      function useFetch(url) {
        const [state, setState] = useState({ data: null, loading: true, error: null });

        useEffect(() => {
          let cancelled = false;
          setState({ data: null, loading: true, error: null });
          fetch(url)
            .then((r) => r.json())
            .then((data) => !cancelled && setState({ data, loading: false, error: null }))
            .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
          return () => { cancelled = true; };
        }, [url]);

        return state;   // { data, loading, error }
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 커스텀 훅이 **`use` 로 시작하는, 안에서 다른 훅을 쓰는 그냥 함수**임을 안다.
- 여러 컴포넌트에 흩어진 **상태 로직**(토글, localStorage 동기화, 데이터 패칭, 이벤트 구독)을 훅으로 추출할 수 있다.
- 훅의 규칙(최상위에서만 호출, 컴포넌트/훅 안에서만)을 지킨다.
- 훅이 반환하는 것을 `useState` 와 같은 모양으로 맞추면 좋은 이유를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useState`/`useEffect`/`useRef`/`useCallback`. 함수를 만들어 반환하는 것.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 세 컴포넌트가 각각 "열림/닫힘 토글" 을 복붙 → 하나 고치면 나머지를 놓침.
- `useEffect` 로 이벤트 리스너 등록/해제하는 8줄이 컴포넌트마다 반복.
- 데이터 패칭 + 로딩/에러 상태 관리 로직이 매 화면마다 재작성.

<!-- section: concept -->
## 커스텀 훅 = 로직만 재사용

{{code: use-toggle}}

- **규칙 1**: 이름이 **`use`** 로 시작. (React 가 "이건 훅"으로 알고 규칙을 검사)
- **규칙 2**: 훅은 **컴포넌트 본문 최상위** 또는 **다른 훅 안**에서만 호출. `if`/`for`/콜백 안에서 호출 금지
  (렌더마다 호출 순서가 같아야 React 가 상태를 매칭한다).
- 커스텀 훅은 **UI 를 반환하지 않는다**(그건 컴포넌트). **값·함수**(state, setter, 액션)를 반환한다.
- 두 컴포넌트가 같은 커스텀 훅을 써도 **상태는 각각 독립**(클로저처럼).

<!-- section: mechanism -->
## 흔한 패턴

{{code: use-local-storage}}

- `useLocalStorage` — `useState` + `useEffect(저장)` 를 묶어, **`useState` 와 똑같은 `[value, setValue]`** 를 반환.
  → 기존 `useState` 를 이걸로 **한 줄만 바꿔** 영속화.

{{code: use-fetch}}

- `useFetch` — `useEffect` 의 fetch + cleanup(경쟁 조건) + 로딩/에러 상태를 한 곳에.
  실무에서는 React Query/SWR 이 이 역할을 더 잘한다(캐시·재시도까지) — 하지만 원리는 이거다.

Momentalk 의 `useFocusTrap` 도 `useRef`(컨테이너) + `useEffect`(키다운 리스너 등록/해제)를 묶은 커스텀 훅이다.

<!-- section: must_know -->
## 반드시 기억할 것

- 커스텀 훅 = **`use`로 시작 + 안에서 훅 사용 가능한 함수**. UI 반환 X, 값/함수 반환.
- 훅 규칙: **최상위에서만** 호출. 조건·반복·콜백 안 금지.
- 반환 모양을 표준 훅에 맞추면(`[value, setter]` 등) 갈아 끼우기 쉽다.
- 여러 컴포넌트가 같은 훅을 써도 **상태는 공유되지 않는다**(각 컴포넌트 인스턴스마다 별도).
  상태를 진짜 공유하려면 Context/전역 상태(다음 챕터들).
- "이 `useEffect`/`useState` 조합을 두 번째 쓰고 있다" 싶으면 커스텀 훅으로.
- 과추출 주의 — 한 곳에서만 쓰는 3줄을 훅으로 빼면 오히려 추적이 어렵다.

<!-- section: experiment -->
## 직접 해 보기

1. `useToggle` 을 만들어 모달·드롭다운·아코디언 세 곳에서 재사용하라. 각 상태가 독립인지 확인.
2. `useLocalStorage("todos", [])` 를 만들어 기존 `useState([])` 를 대체하고, 새로고침 후 유지되는지 확인.
3. `useWindowSize()` 를 만들어라: `resize` 리스너 등록 + cleanup, `{ width, height }` 반환.
4. `useFetch(url)` 로 목록 화면을 만들고, `url` 을 빠르게 두 번 바꿔 경쟁 조건이 처리되는지 확인.

<!-- section: check_question -->
## 이해 점검

1. 커스텀 훅과 컴포넌트의 차이는? (반환하는 것)
2. 훅을 `if` 문 안에서 호출하면 왜 안 되나?
3. 두 컴포넌트가 같은 커스텀 훅을 쓰면 상태가 공유되나?
4. 커스텀 훅의 반환값을 `[value, setValue]` 로 맞추면 뭐가 좋나?

<!-- section: interview_question -->
## 면접 대비

- "커스텀 훅으로 로직을 추출한 경험을 말해 주세요. 무엇을 반환하게 설계했나요?"
- "훅의 규칙(Rules of Hooks)과 그 이유는?"
- "커스텀 훅으로 상태를 공유할 수 있나요? (없다 → Context)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 커스텀 훅의 정의와 규칙, UI 대신 값 반환, 상태 비공유, 반환 모양 표준화, 과추출 주의를 각각 한 줄로.
> 그다음 useToggle 을 코드 없이 설계.

<!-- section: review -->
## 한 줄 정리

**커스텀 훅은 `use`로 시작하는 함수로 상태 로직만 재사용한다(UI 아님, 상태는 인스턴스마다 독립) —
`useState`/`useEffect` 조합이 두 번째로 반복되면 훅으로 빼되, 과추출은 피한다.**

<!-- section: next -->
## 다음 Chapter

`react/styling-in-react` — React 에서 CSS 다루기.
