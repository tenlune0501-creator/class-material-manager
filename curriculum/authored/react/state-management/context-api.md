---
id: react/state-management/context-api
chapter: react/state-management
title: Context API
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [react, context, prop-drilling, global-state]
related_material_ids:
  - 1Fl9V6dt0oKMz7QrzUPBO4M2c2LIKHWcWHTITx5eY3yc   # P5_02_Context API
  - 1UF3v3QjzQgZXrD8r4GOd1K4Cj7DwNekp              # react_app_with_contextAPI.zip
sources:
  - reference_slug: react/useContext
  - reference_slug: react/createContext
prerequisites:
  - react/custom-hooks/writing-custom-hooks
code_examples:
  - slug: create-provide-consume
    title: 만들기 · 제공 · 사용
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { createContext, useContext, useState } from "react";

      // 1) 만들기
      const ThemeContext = createContext(null);

      // 2) 제공 (보통 커스텀 훅 + Provider 컴포넌트로 감싼다)
      export function ThemeProvider({ children }) {
        const [theme, setTheme] = useState("light");
        const value = { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
        return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
      }

      // 3) 사용 (아무리 깊은 자식이라도)
      export function useTheme() {
        const ctx = useContext(ThemeContext);
        if (!ctx) throw new Error("useTheme 는 ThemeProvider 안에서만");
        return ctx;
      }
  - slug: usage
    title: 앱에 붙이기
    source_type: generated_minimal
    language: jsx
    code: |
      // main.jsx 또는 App
      <ThemeProvider>
        <App />
      </ThemeProvider>

      // 깊숙한 컴포넌트
      function Header() {
        const { theme, toggle } = useTheme();   // props 를 5단계 안 넘겨도 된다
        return <button onClick={toggle}>{theme}</button>;
      }
  - slug: split-context
    title: 자주 바뀌는 값과 안 바뀌는 값을 분리
    source_type: generated_minimal
    language: jsx
    code: |
      // ❌ user + 매초 바뀌는 시계를 한 Context 에 → 모든 소비자가 매초 리렌더
      // ✅ 나눈다
      const AuthContext = createContext(null);   // 로그인 정보 (거의 안 바뀜)
      const ClockContext = createContext(null);  // 시간 (자주 바뀜)
      // Context value 는 객체이므로 매 렌더 새로 생기지 않게 useMemo 로 감싸기도 한다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **prop drilling**(props 를 여러 단계 통과시키는 것)이 무엇이고 왜 불편한지 안다.
- `createContext` / `Provider` / `useContext` 로 "여러 컴포넌트가 공유하는 값"(테마, 로그인 정보, 언어)을 전달한다.
- Context 를 **커스텀 훅 + Provider 컴포넌트**로 감싸는 관용 패턴을 쓴다.
- Context 의 한계(값이 바뀌면 모든 소비자 리렌더)와 분리 전략을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- props, 컴포넌트 합성(`children`), 커스텀 훅, `useState`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 로그인한 사용자 정보를 `App → Layout → Header → UserMenu → Avatar` 5단계로 props 전달.
  중간 컴포넌트들은 `user` 를 안 쓰는데 그냥 받아서 넘기기만 한다(prop drilling).
- 테마(라이트/다크)를 앱 곳곳에서 읽어야 하는데 전부 props 로 연결 불가능.

<!-- section: concept -->
## Context — "전역처럼" 값 공유

{{code: create-provide-consume}}

1. **`createContext(기본값)`** — Context 객체 생성.
2. **`<Ctx.Provider value={...}>`** 로 트리 일부를 감싸면, 그 **안의 어떤 깊이**에서든 값을 읽을 수 있다.
3. **`useContext(Ctx)`** 로 읽는다.

관용: **`Provider` 컴포넌트 + `useCtx` 훅**을 한 파일에서 export → 사용처는 `useTheme()` 만 부르면 됨.
Provider 밖에서 쓰면 에러를 던지게 한다.

{{code: usage}}

<!-- section: mechanism -->
## 한계와 분리

{{code: split-context}}

- **Context value 가 바뀌면 그걸 쓰는 모든 컴포넌트가 리렌더**된다. 그래서:
  - **자주 바뀌는 값과 안 바뀌는 값을 다른 Context 로** 나눈다.
  - value 객체를 매 렌더 새로 만들면(참조가 매번 바뀜) 소비자가 다 리렌더 → `useMemo` 로 감싼다.
- Context 는 **"전달 도구"** 지 상태 관리 라이브러리가 아니다. 복잡한 전역 상태(많은 액션, 미들웨어,
  비동기)는 Redux/Zustand 등(다음 Lesson).
- 서버 데이터의 전역 캐시는 React Query 가 더 낫다.

<!-- section: must_know -->
## 반드시 기억할 것

- Context 는 **prop drilling 해소**용. "여러 곳에서 읽는 소수의 값"(테마·인증·언어·토스트).
- 패턴: `createContext` + `<Provider>` 컴포넌트 + `useCtx()` 훅(밖에서 쓰면 throw).
- **value 가 바뀌면 소비자 전부 리렌더** → 빈번한 값과 드문 값을 **분리**, value 는 `useMemo`.
- Context ≠ 상태 관리 라이브러리. 액션·비동기·큰 상태는 별도 도구.
- Provider 는 트리의 필요한 범위만 감싼다(꼭 최상단일 필요 없음).

<!-- section: experiment -->
## 직접 해 보기

1. `ThemeProvider` + `useTheme` 를 만들어 `App` 을 감싸고, 3단계 깊은 컴포넌트에서 테마를 읽고 토글하라.
   중간 컴포넌트들이 `theme` props 를 안 받는 걸 확인.
2. `AuthProvider`(user, login, logout)를 만들어 헤더와 마이페이지에서 공유하라.
3. 매초 바뀌는 시계 값을 같은 Context 에 넣어 보고, 소비자 컴포넌트에 `console.log("render")` 를 찍어
   불필요한 리렌더를 관찰 → Context 분리 or `useMemo` 로 개선.

<!-- section: check_question -->
## 이해 점검

1. prop drilling 이 무엇이고, Context 가 그걸 어떻게 해결하나?
2. `createContext` / `Provider` / `useContext` 의 역할을 각각 한 문장으로.
3. Context value 가 바뀔 때 리렌더되는 범위는? 어떻게 줄이나?
4. Context 를 상태 관리 라이브러리 대신 쓰면 안 되는 경우는?

<!-- section: interview_question -->
## 면접 대비

- "Context 의 성능 함정과 대응 방법은?"
- "Context 와 Redux(또는 Zustand)를 각각 언제 쓰나요?"
- "Provider 를 최상단이 아니라 특정 서브트리에만 두는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> prop drilling, create/provide/consume 패턴, Provider+훅 관용, value 변경 시 리렌더와 분리·useMemo,
> Context ≠ 상태관리 라이브러리를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Context 는 prop drilling 을 없애 "여러 곳이 읽는 소수의 값"을 깊은 자식에게 바로 전달한다 —
value 가 바뀌면 소비자가 전부 리렌더되니 빈번한/드문 값을 나누고 `useMemo` 로 감싼다.**

<!-- section: next -->
## 다음 Lesson

`state-management/redux` — 예측 가능한 전역 상태.
