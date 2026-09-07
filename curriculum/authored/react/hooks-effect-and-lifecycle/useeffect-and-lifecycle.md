---
id: react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
chapter: react/hooks-effect-and-lifecycle
title: useEffect와 컴포넌트 생명주기
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [react, useEffect, lifecycle, cleanup, side-effect]
related_material_ids:
  - 14wmj7HCNsplUxO1VN49tqtCfaSow7md9TaQ1MS4shWU   # 라이프사이클_(use effect)
  - 1hg_rdVuQsgzGyptOYaw6AfADkUTagzPVU4ybN4uh7qk   # 리엑트 생명주기
  - 1dr40cVwMdPVW_3IEQWE6fv-4EjWTX9UY              # react-lifeCycle_v202606.zip
sources:
  - reference_slug: react/useEffect
prerequisites:
  - react/state-and-events/usestate-basics
  - javascript/functions-and-scope/scope-and-closures
project_links:
  - unit: momentalk/use-focus-trap-hook
    note: useEffect 정리(cleanup) 함수로 이벤트 리스너를 해제하는 실제 예
  - unit: momentalk/random-pick-game-logic
    note: setTimeout 을 여러 개 예약하고 반환 함수에서 전부 clearTimeout, Supabase 조회 effect 의 alive 가드
code_examples:
  - slug: effect-basic
    title: useEffect — 렌더 "이후" 외부와 동기화
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { useEffect, useState } from "react";

      function Title({ name }) {
        useEffect(() => {
          document.title = `${name} 페이지`;   // 부수효과: 렌더 밖의 것을 바꿈
        }, [name]);                             // 의존성: name 이 바뀔 때만 다시 실행

        return <h1>{name}</h1>;
      }
      // [] : 마운트 시 1번   |   생략 : 매 렌더마다   |   [a, b] : a 또는 b 가 바뀔 때
  - slug: effect-cleanup
    title: 정리(cleanup) 함수 — 구독/타이머 해제
    source_type: generated_minimal
    language: jsx
    code: |
      function Clock() {
        const [now, setNow] = useState(Date.now());

        useEffect(() => {
          const id = setInterval(() => setNow(Date.now()), 1000);
          return () => clearInterval(id);   // ★ 이 컴포넌트가 사라지거나 effect 재실행 전에 호출
        }, []);

        return <p>{new Date(now).toLocaleTimeString()}</p>;
      }
      // 이벤트 리스너도 동일: addEventListener → return () => removeEventListener
  - slug: effect-fetch
    title: 데이터 가져오기 + 경쟁 조건 방지
    source_type: generated_minimal
    language: jsx
    code: |
      function User({ id }) {
        const [user, setUser] = useState(null);

        useEffect(() => {
          let cancelled = false;
          fetch(`/api/users/${id}`)
            .then((r) => r.json())
            .then((data) => { if (!cancelled) setUser(data); });
          return () => { cancelled = true; };   // id 가 빨리 바뀌면 이전 응답 무시
        }, [id]);

        if (!user) return <p>로딩…</p>;
        return <p>{user.name}</p>;
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `useEffect` 가 **렌더 이후 "외부 세계와 동기화"**(document, 타이머, 구독, 네트워크)하는 자리임을 안다.
- **의존성 배열**(`[]`, 생략, `[a, b]`)이 effect 재실행을 어떻게 제어하는지 설명한다.
- **정리(cleanup) 함수**로 타이머·이벤트 리스너·구독을 해제한다(누수 방지).
- "마운트 / 업데이트 / 언마운트" 생명주기를 훅 관점에서 설명한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `state-and-events/usestate-basics` (렌더, 함수 컴포넌트가 매번 실행됨).
- 클로저(effect 안 함수가 "그 렌더 시점의 값"을 기억).
- 콜백·`setInterval`/`addEventListener`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 렌더 함수 본문에서 `fetch` 나 `document.title = ...` 를 하면 → 렌더마다 실행되고, 무한 루프도 난다.
- `setInterval` 을 걸었는데 컴포넌트를 떠나도 계속 돈다(정리 안 함).
- `id` 를 빠르게 바꾸면 **먼저 보낸 요청이 나중에 도착**해 옛 데이터가 화면에 남는다.

<!-- section: concept -->
## useEffect = 렌더 이후 부수효과

{{code: effect-basic}}

- 컴포넌트 함수 본문은 **순수**해야 한다(JSX 계산만). `document.title` 변경, 네트워크, 구독 같은
  **부수효과**는 `useEffect(() => { ... })` 안에 넣는다 → React 가 **화면을 그린 뒤** 실행한다.
- **의존성 배열**:
  - `[]` — **마운트 시 1번**만.
  - 생략 — **매 렌더**마다 (거의 안 씀, 위험).
  - `[a, b]` — `a` 또는 `b` 가 (이전 렌더와 다르게) 바뀌었을 때.
- effect 안에서 쓰는 **모든 state/props/함수**를 의존성에 넣어야 한다(안 넣으면 옛 값을 봄 = stale closure).

<!-- section: mechanism -->
## 정리 함수

{{code: effect-cleanup}}

`useEffect` 가 **함수를 반환**하면 그게 **정리(cleanup) 함수**다. 호출 시점:

1. 컴포넌트가 **사라질 때**(언마운트).
2. effect 가 **다시 실행되기 직전**(의존성이 바뀌어서).

→ "설정한 것은 반드시 해제한다": `setInterval`↔`clearInterval`, `addEventListener`↔`removeEventListener`,
구독↔구독해제. Momentalk 의 `useFocusTrap` 훅이 정확히 이 패턴(키다운 리스너 등록 → cleanup 에서 제거).

<!-- section: code | lang: jsx -->
## 데이터 가져오기 + 경쟁 조건

{{code: effect-fetch}}

- `[id]` 를 의존성으로 → `id` 가 바뀌면 다시 fetch.
- `cancelled` 플래그(정리 함수에서 `true`) → `id` 가 빨리 바뀌어 **이전 요청의 응답이 늦게 오면 버린다**.
- 실무에서는 이 로직을 React Query / SWR 같은 라이브러리에 맡기는 경우가 많다(데이터 패칭 챕터).

<!-- section: must_know -->
## 반드시 기억할 것

- 렌더 본문은 **순수**. 부수효과(타이머·구독·네트워크·`document`)는 **`useEffect` 안**.
- 의존성 배열: `[]`(1번), `[deps]`(deps 바뀔 때). effect 안에서 쓰는 값은 **전부** 의존성에.
- **설정 → 정리**: 반환 함수에서 `clearInterval`/`removeEventListener`/구독 해제.
- 의존성을 비워 두거나(`[]`) 거짓말하면 **stale closure**(옛 state/props 를 봄) 버그.
- effect 안에서 `setState` 를 무조건 하면 무한 렌더 → 조건을 걸거나 의존성을 정확히.
- "생명주기": 마운트(첫 렌더 + `[]` effect) → 업데이트(state/props 변경 → 리렌더 + 관련 effect) → 언마운트(cleanup).
- 순수 계산으로 될 일에 effect 를 쓰지 않는다(파생 값은 렌더 중 계산).

<!-- section: experiment -->
## 직접 해 보기

1. `useEffect(() => console.log("run"), [])` vs `[count]` vs 생략 — 각각 언제 로그가 찍히는지 관찰.
2. `Clock` 을 만들되 `return () => clearInterval(id)` 를 지워 보라. 컴포넌트를 껐다 켜기를 반복하며
   개발자도구 Performance 나 콘솔로 인터벌이 쌓이는 걸 확인 → 정리 함수 복구.
3. 창 리사이즈 크기를 보여주는 컴포넌트를 `addEventListener("resize", ...)` + cleanup 으로.
4. `User({ id })` 를 만들어 `id` 를 1초 간격으로 두 번 바꾼 뒤, `cancelled` 플래그가 없을 때 옛 데이터가
   깜빡이는 걸 재현하고 고쳐라.

<!-- section: check_question -->
## 이해 점검

1. 왜 `fetch` 를 렌더 본문이 아니라 `useEffect` 에 넣나?
2. 의존성 배열이 `[]`, `[x]`, 생략일 때 effect 는 각각 언제 실행되나?
3. 정리 함수는 언제 호출되나(2가지)?
4. 의존성에 필요한 값을 빠뜨리면 어떤 버그가 나나?

<!-- section: interview_question -->
## 면접 대비

- "`useEffect` 의 의존성 배열과 정리 함수를 설명해 주세요."
- "stale closure 를 겪은 적이 있나요? 어떻게 해결했나요?"
- "클래스 생명주기 메서드와 `useEffect` 를 매핑하면?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> useEffect 의 자리(부수효과), 의존성 배열 3형태, 정리 함수의 호출 시점, stale closure, 무한 렌더 주의를
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`useEffect` 는 렌더 이후 외부 세계와 동기화하는 자리다 — 의존성 배열로 재실행을 제어하고,
설정한 타이머·구독·리스너는 반환하는 정리 함수에서 반드시 해제한다.**

<!-- section: next -->
## 다음 Lesson

`hooks-effect-and-lifecycle/function-vs-class-components` — 옛 코드의 클래스 컴포넌트 읽기.
