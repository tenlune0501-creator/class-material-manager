---
id: momentalk/random-pick-game-logic
project: momentalk
title: 랜덤 픽 — 셔플과 여러 훅으로 짠 게임 로직
unit_kind: feature
feature_area: 미니게임
concepts: [게임 로직, Fisher–Yates 셔플, useState, useEffect, 정리 함수, useMemo, useRef, 조건부 렌더링, Supabase 조회]
related_lessons:
  - react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
  - react/hooks-ref-memo-callback/usememo-usecallback
  - javascript/language-basics/arrays-and-loops
---

<!-- section: role -->
## 이 코드가 하는 일

`src/components/games/RandomPick.jsx` — 공을 섞어 하나를 뽑는 미니게임의 **로직 부분**. 셔플 애니메이션,
Supabase 콘텐츠 조회, 형식 필터, 중복 제외 랜덤 선택을 한 컴포넌트에 모았다. 전체 코드는 실전 예제
`momentalk-random-pick-game-logic`.

<!-- section: flow -->
## 상태·데이터 흐름

- `order`(공 순서), `isShuffling`, `pool`(조회한 콘텐츠), `result`(뽑힌 것), `selectedFormat`, `loadError`.
- `timers`(useRef): `setTimeout` 핸들을 모아 두었다가 정리.
- `useEffect` 두 개: ① 셔플 스텝을 `setTimeout` 으로 여러 개 예약(반환 함수에서 전부 `clearTimeout`),
  ② Supabase `default_contents` 조회(`alive` 플래그로 언마운트 후 `setState` 방지).
- `useMemo`: `pool` 에서 실제 존재하는 형식만 골라 칩으로, 선택 형식으로 필터한 `filteredPool`.

<!-- section: code -->
## 핵심 코드 읽기

```jsx
function shuffle(list) {                     // 순수 함수 — Fisher–Yates
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]]; // 구조분해 swap
  }
  return next;
}

useEffect(() => {
  for (let step = 1; step <= SHUFFLE_STEPS; step += 1)
    timers.current.push(setTimeout(() => setOrder(p => shuffle(p)), step * STEP_DURATION));
  timers.current.push(setTimeout(() => setIsShuffling(false), SHUFFLE_STEPS * STEP_DURATION));
  return clearTimers;                        // ← 정리 함수: 예약한 타이머 전부 취소
}, []);

useEffect(() => {
  let alive = true;
  (async () => {
    const { data, error } = await createClient().from("default_contents")
      .select("id, title, scripts, tips, extras, format_code")
      .in("format_code", CONTENT_FORMATS).eq("is_active", true).limit(500);
    if (!alive) return;                      // ← 언마운트됐으면 setState 안 함
    if (error || !data?.length) return setLoadError(true);
    setPool(data);
  })();
  return () => { alive = false; };
}, []);

const pickRandom = prevId => {
  const candidates = filteredPool.filter(i => i.id !== prevId);   // 직전 결과 제외
  const list = candidates.length ? candidates : filteredPool;
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
};
```

<!-- section: why -->
## 왜 이렇게 했나

- **셔플은 순수 함수** 로 빼서 테스트·재사용이 쉽다. `Math.random` 만 비결정적.
- 타이머를 `useRef` 배열에 모으는 이유: `useEffect` 반환 함수가 **모든** 예약을 한 번에 취소해야 리렌더/언마운트 때 누수가 없다.
- `alive` 플래그: 비동기 조회가 끝나기 전에 컴포넌트가 사라지면 `setState` 경고가 난다 → 플래그로 막는다.
- `useMemo`: `pool` 이 안 바뀌면 필터 결과를 다시 계산하지 않는다.

<!-- section: framework_role -->
## React 가 대신하는 것

`useEffect` 는 "렌더 후에 실행 + 정리" 타이밍을, `useMemo` 는 "입력이 같으면 재계산 생략" 을 대신한다.
개발자는 의존성 배열로 "언제"만 정한다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `react/hooks-effect-and-lifecycle/useeffect-and-lifecycle` — effect + cleanup
- `react/hooks-ref-memo-callback/usememo-usecallback` — 파생값 메모
- `javascript/language-basics/arrays-and-loops` — 셔플 반복문

<!-- section: caution -->
## 주의점

- `[...list]` 로 **복사 후** 섞는다. 원본을 직접 섞으면 상태 불변성이 깨진다.
- `alive`/`clearTimers` 를 빼면 개발 중엔 안 보이다가 화면 전환이 잦아질 때 경고·누수로 나타난다.

<!-- section: experiment -->
## 작은 실습

1. `shuffle` 만 떼어 `[1,2,3,4,5]` 를 여러 번 섞어 분포를 관찰하라.
2. 두 번째 `useEffect` 의 `alive` 를 지우고, 조회 중 라우트를 떠나 경고를 재현하라.
3. `filteredPool` 을 `useMemo` 없이 매 렌더 새로 계산하도록 바꿔 보고 차이를 설명하라.

<!-- section: check_question -->
## 이해 점검

1. `timers.current` 에 타이머를 모으는 이유는?
2. `alive` 플래그가 막는 문제는 무엇인가?
3. `pickRandom` 이 `prevId` 를 받는 이유는?

<!-- section: review -->
## 한 줄 정리

**게임 하나에 순수 셔플 함수 + effect(타이머 예약/정리) + effect(Supabase 조회 + alive 가드) + useMemo(파생
필터)가 모두 들어 있다 — 배열·반복문 기초와 useState/useEffect 수업이 실제 화면에서 합쳐진 예시다.**
