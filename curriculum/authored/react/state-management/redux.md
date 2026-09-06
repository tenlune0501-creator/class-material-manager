---
id: react/state-management/redux
chapter: react/state-management
title: Redux와 프로젝트 도입
mastery: required
lesson_kind: lesson
estimated_minutes: 60
tags: [react, redux, store, reducer, state-management]
related_material_ids:
  - 1TLo7G8cwQbOzyCj_Db78_LYGChfaftRhGKDaAN4PnZI   # P5_01_Redux
  - 19s_s78Chllf9hPjDPny3CI4i_ksuhzfj3h5Z8phib44   # P5_03_Redux 도입
  - 19Ojz7VxUScH5TJeNdqvntyVjggcPyFt0              # react-redux-ex_v202606.zip
prerequisites:
  - react/state-management/context-api
  - javascript/objects-and-builtins/working-with-objects
code_examples:
  - slug: slice
    title: Redux Toolkit — slice (상태 + 리듀서 + 액션)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      import { createSlice, configureStore } from "@reduxjs/toolkit";

      const cartSlice = createSlice({
        name: "cart",
        initialState: { items: [] },
        reducers: {
          added(state, action) {
            state.items.push(action.payload);   // Toolkit 은 Immer 로 "불변처럼" 안전
          },
          removed(state, action) {
            state.items = state.items.filter((it) => it.id !== action.payload);
          },
        },
      });

      export const { added, removed } = cartSlice.actions;
      export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
  - slug: use-in-component
    title: 컴포넌트에서 읽고 보내기
    source_type: generated_minimal
    language: jsx
    code: |
      import { Provider, useSelector, useDispatch } from "react-redux";
      import { store, added, removed } from "./store";

      // main.jsx:  <Provider store={store}><App /></Provider>

      function Cart() {
        const items = useSelector((s) => s.cart.items);   // store 에서 필요한 부분만 선택
        const dispatch = useDispatch();
        return (
          <>
            <p>{items.length}개</p>
            <button onClick={() => dispatch(added({ id: crypto.randomUUID(), name: "펜" }))}>
              추가
            </button>
          </>
        );
      }
  - slug: flow
    title: 데이터 흐름
    source_type: generated_minimal
    language: text
    code: |
      컴포넌트 --dispatch(action)--> store
                                     store 가 reducer(state, action) 실행 → 새 state
      store --구독한 컴포넌트 리렌더--> useSelector 가 새 값 반환

      단방향. 상태 변경은 반드시 action 을 통해서만. → 추적·디버깅·타임트래블 가능
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Redux 가 해결하는 문제(**여러 화면이 공유하는 복잡한 상태를 예측 가능하게**)와, Context 로 부족한 지점을 안다.
- **store / action / reducer / dispatch / selector** 의 역할과 단방향 흐름을 설명한다.
- **Redux Toolkit** 의 `createSlice` / `configureStore` / `useSelector` / `useDispatch` 로 기본 전역 상태를 만든다.
- 언제 Redux 를 도입하고, 언제 안 쓰는 게 나은지 판단한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Context API, 불변 업데이트, 리듀서식 사고(`(state, action) => newState`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 장바구니가 헤더, 목록, 상세, 결제 4곳에서 읽고 쓰인다. Context 로 하면 액션이 많아 value 가 비대해지고,
  "누가 언제 이 상태를 바꿨는지" 추적이 안 된다.
- 상태 변경 로직이 컴포넌트마다 흩어져 버그를 찾기 어렵다.

<!-- section: concept -->
## 구성요소

- **store** — 앱의 전역 상태 하나(트리).
- **action** — "무슨 일이 일어났다"는 객체 `{ type, payload }`.
- **reducer** — `(현재 state, action) => 새 state`. **순수 함수.** 상태 변경 규칙.
- **dispatch(action)** — action 을 store 에 보냄 → reducer 실행 → 새 state.
- **selector** — store 에서 컴포넌트가 필요한 부분만 꺼냄. 그 부분이 바뀌면 그 컴포넌트만 리렌더.

**단방향**: 컴포넌트는 오직 `dispatch` 로만 상태를 바꾼다. 직접 수정 금지.

<!-- section: mechanism -->
## Redux Toolkit (요즘 표준)

{{code: slice}}

- **`createSlice`** — 한 도메인의 `initialState` + `reducers`(각각이 action 생성자도 됨) 를 한 번에.
  Toolkit 은 **Immer** 를 써서 `state.items.push(...)` 처럼 써도 **내부적으로 불변**을 지킨다.
- **`configureStore({ reducer: { cart: cartSlice.reducer } })`** — slice 들을 합쳐 store.

{{code: use-in-component}}

- `<Provider store={store}>` 로 앱을 감싼다.
- **`useSelector(s => s.cart.items)`** — 필요한 조각만. **`useDispatch()`** → `dispatch(added(payload))`.

{{code: flow}}

<!-- section: must_know -->
## 반드시 기억할 것

- 요즘은 **Redux Toolkit** 을 쓴다(순수 Redux 의 보일러플레이트 제거). `createSlice` + `configureStore`.
- 흐름: `dispatch(action)` → `reducer(state, action)` → 새 state → `useSelector` 소비자 리렌더. **단방향.**
- reducer 는 **순수 함수**. 부수효과(fetch)는 thunk(`createAsyncThunk`)나 미들웨어로.
- `useSelector` 는 **필요한 최소 조각**만 선택(전체를 select 하면 다 리렌더).
- **언제 도입**: 여러 화면이 공유하는 상태 + 액션이 많음 + 디버깅·추적이 중요. 그 전엔 `useState`/Context/서버상태(React Query)로 충분.
- 상태를 다 Redux 에 넣지 않는다 — 폼 입력값, 열림/닫힘 같은 지역 상태는 `useState`.

<!-- section: experiment -->
## 직접 해 보기

1. Toolkit 으로 `counter` slice(`increment`, `decrement`, `addBy(payload)`)를 만들어 두 컴포넌트가 공유하게 하라.
2. `cart` slice 로 추가/삭제를 구현하고, Redux DevTools 확장으로 dispatch 되는 action 히스토리를 확인하라.
3. `useSelector` 로 `s => s.cart` (전체) vs `s => s.cart.items.length` (조각) 를 각각 써서 리렌더 범위를 비교.
4. 폼 입력값을 Redux 에 넣어 보고 왜 불편한지 느낀 뒤 `useState` 로 되돌려라.

<!-- section: check_question -->
## 이해 점검

1. action / reducer / dispatch / selector 의 역할을 각각 한 문장으로.
2. Redux 의 데이터 흐름이 "단방향"이라는 게 무슨 뜻이고, 왜 좋은가?
3. Redux Toolkit 의 `createSlice` 가 줄여 주는 것은?
4. Redux 를 도입할 만한 신호와, 안 쓰는 게 나은 상태의 예는?

<!-- section: interview_question -->
## 면접 대비

- "Redux 의 3원칙(single source of truth, state is read-only, changes via pure functions)을 설명해 주세요."
- "Context + useReducer 로 충분한 경우와 Redux 가 필요한 경우의 경계는?"
- "비동기(서버 호출)를 Redux 에서 어떻게 다루나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> store/action/reducer/dispatch/selector, 단방향 흐름, Toolkit 의 createSlice/configureStore,
> useSelector 조각 선택, 도입 기준을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Redux 는 전역 상태를 store 하나에 두고, `dispatch(action)` → 순수 `reducer` → 새 state → 소비자 리렌더의
단방향으로 예측 가능하게 만든다 — 요즘은 Toolkit(`createSlice`)을 쓰고, 필요할 때만 도입한다.**

<!-- section: next -->
## 다음 Chapter

`react/board-crud-app` — 배운 것을 조립한 게시판.
