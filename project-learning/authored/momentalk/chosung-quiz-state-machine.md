---
id: momentalk/chosung-quiz-state-machine
project: momentalk
title: 초성 퀴즈 — step 상태 머신
unit_kind: component
feature_area: 미니게임
concepts: [useState, 조건부 렌더링, 이벤트 처리, 컴포넌트 합성, 상태 끌어올리기, MUI]
related_lessons:
  - react/state-and-events/usestate-basics
  - react/rendering-logic/conditional-rendering
  - react/components-and-props/passing-props
---

<!-- section: role -->
## 이 코드가 하는 일

`src/components/games/ChosungQuiz.jsx` — 초성 퀴즈 화면 전체의 **컨테이너**. 출제(`setup`) → 풀이(`play`) →
정답(`answer`) 세 단계를 오가는 흐름을 관리한다. 실전 예제 `momentalk-chosung-quiz-state-machine` 에 전체 코드가 있다.

<!-- section: where -->
## 코드 위치

- `src/components/games/ChosungQuiz.jsx` — 컨테이너 (`"use client"`)
- 같은 폴더의 `QuizSetup.jsx` / `QuizPlay.jsx` / `QuizAnswer.jsx` — 단계별 자식

<!-- section: flow -->
## 상태와 데이터 흐름

- **상태 2개**: `step`(`"setup" | "play" | "answer"`), `quiz`(출제 데이터, 없으면 `null`).
- 자식은 상태를 갖지 않는다. `QuizSetup` 이 `onSubmit(data)` 로 데이터를 올려 주면 부모가 `setQuiz(data); setStep("play")`.
- `handleReveal` → `answer`, `handleNext` → `quiz` 비우고 `setup` 으로.

<!-- section: code -->
## 핵심 코드 읽기

```jsx
const [step, setStep] = useState("setup"); // setup | play | answer
const [quiz, setQuiz] = useState(null);

const handleSubmit = data => { setQuiz(data); setStep("play"); };

const handleBack = () => {
  if (step === "play") setStep("setup");
  else if (step === "answer") setStep("play");
  else router.back();               // setup 에서 뒤로가기는 라우터
};

{step === "setup" && <QuizSetup onSubmit={handleSubmit} />}
{step === "play"  && <QuizPlay quiz={quiz} onReveal={handleReveal} />}
{step === "answer" && <QuizAnswer quiz={quiz} onNext={handleNext} />}
```

- 화면 전환을 `if/switch` 로 컴포넌트를 갈아 끼우는 대신, **`step` 문자열 하나 + `{조건 && <Child/>}`** 로 표현한다.
- `handleBack` 은 같은 버튼이 단계에 따라 다르게 동작하도록 **분기**한다.

<!-- section: why -->
## 왜 이렇게 했나

- 단계가 3개뿐이라 라우팅으로 나누면 오히려 무겁다. **상태 하나로 유한 상태 머신** 을 만들면 한 파일에서 흐름이 보인다.
- 상태를 부모가 소유(**상태 끌어올리기**)하면 "출제 데이터를 풀이·정답 화면이 함께 본다" 가 자연스럽다.

<!-- section: framework_role -->
## React 가 대신하는 것

`setStep` 을 부르면 React가 컴포넌트를 다시 실행하고, 바뀐 `step` 에 따라 다른 자식이 렌더된다.
개발자는 "지금 어느 단계인가"만 관리하고, DOM 교체는 React가 한다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `react/state-and-events/usestate-basics` — `useState` 와 리렌더
- `react/rendering-logic/conditional-rendering` — `{조건 && <JSX/>}`
- `react/components-and-props/passing-props` — 콜백을 props로 내려 상태 끌어올리기

<!-- section: caution -->
## 주의점

- `{step === "..." && <Child/>}` 는 **한 번에 하나만** 참이어야 한다 — `step` 값이 세 문자열 중 하나로 유지되도록 관리.
- 자식에서 상태를 또 만들면 "부모/자식 중 누가 진짜인가" 가 흐려진다. 여기선 자식은 표시만 한다.

<!-- section: experiment -->
## 작은 실습

1. `step` 에 `"result"` 같은 4번째 단계를 추가해 흐름을 늘려 보라.
2. `handleBack` 에서 `answer → setup` 으로 한 번에 가도록 바꿔 보고 UX 차이를 느껴 보라.
3. `quiz` 를 자식 `QuizPlay` 의 `useState` 로 옮겼을 때 생기는 문제를 예측하고 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 화면 3단계를 라우트가 아니라 `step` 상태로 표현한 이유는?
2. 자식 `QuizSetup` 은 출제 데이터를 어떻게 부모에게 전달하나?
3. `handleBack` 이 분기하는 이유는?

<!-- section: review -->
## 한 줄 정리

**`step` 문자열 상태 하나 + `{step === "..." && <Child/>}` 조건부 렌더링으로 3단계 흐름을 한 컴포넌트에서
관리하고, 출제 데이터는 부모가 소유해 자식들이 공유한다 — 작은 유한 상태 머신 패턴이다.**
