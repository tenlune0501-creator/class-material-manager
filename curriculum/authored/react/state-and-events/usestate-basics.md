---
id: react/state-and-events/usestate-basics
chapter: react/state-and-events
title: useState로 상태 관리 시작하기
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [react, state, useState, hooks, rerender]
related_material_ids:
  - 1JLvhOpeNX8-EdPkEp1eYgqQP4XmiVI6CEc3Tg9EQpro   # useState
  - 1z5idwIpcnePvJWVwa_PmoJZgp1r52fzh6oa-g3Xuscg   # 06_state
  - 1Ps3Gdi8rQLekmWM55h5bHc5AMJQlLOv4oQO5EljLRZI   # 07_State로 동적인 UI 만들기 (버튼 예제)
  - 1ATnGguACNmVAFOBCng1Us_kgBz9gadab               # useState_rv_v202606.zip
sources:
  - reference_slug: react/useState
prerequisites:
  - react/setup-and-jsx/jsx
  - react/components-and-props/passing-props
project_links:
  - unit: momentalk/chosung-quiz-state-machine
    note: step 상태 하나로 setup·play·answer 화면 단계를 전환하는 실제 예
  - unit: momentalk/signin-controlled-form
    note: 입력값을 useState로 제어하는 로그인 폼
code_examples:
  - slug: counter-minimal
    title: 카운터 — 가장 작은 useState
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { useState } from "react";

      export default function Counter() {
        const [count, setCount] = useState(0);

        return (
          <button onClick={() => setCount((prev) => prev + 1)}>
            {count}
          </button>
        );
      }
  - slug: plain-variable-broken
    title: 일반 변수로 만든 (안 되는) 카운터
    source_type: generated_minimal
    language: jsx
    code: |
      export default function BrokenCounter() {
        let count = 0;

        const handleClick = () => {
          count++;            // 값은 바뀌지만
          console.log(count);  // 콘솔에만 찍히고
        };

        return <button onClick={handleClick}>{count}</button>; // 화면은 0에서 안 바뀜
      }
  - slug: controlled-input
    title: 제어 컴포넌트 — input 값을 state로
    source_type: generated_minimal
    language: jsx
    code: |
      import { useState } from "react";

      export default function NameField() {
        const [text, setText] = useState("");

        return (
          <>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="이름"
            />
            <p>입력값: {text}</p>
          </>
        );
      }
  - slug: momentalk-step-state
    title: Momentalk 초성 퀴즈 — step 상태 머신
    source_type: user_project
    project_example_id: momentalk-chosung-quiz-state-machine
    language: jsx
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `useState`로 "화면을 바꾸는 값"을 컴포넌트에 만들 수 있다.
- `set` 함수를 호출하면 왜 화면이 다시 그려지는지 설명할 수 있다.
- 이전 값을 기반으로 안전하게 업데이트하는 함수형 업데이트(`setX(prev => ...)`)를 쓸 수 있다.
- input을 state로 제어하는 **제어 컴포넌트** 패턴을 만들 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- **JSX**: 중괄호 `{}` 안에 자바스크립트 값을 넣어 화면에 출력한다는 것.
  (→ `react/setup-and-jsx/jsx`)
- **props**: 부모가 자식에게 값을 내려주고, 자식은 그 값을 **못 바꾼다**는 것.
  (→ `react/components-and-props/passing-props`)

props가 "밖에서 받은, 못 바꾸는 값"이라면, 이번에 배우는 state는
"컴포넌트가 직접 들고 바꾸는 값"이다.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

버튼을 누르면 숫자가 올라가는 화면을 만든다고 하자. 그냥 변수로 하면:

{{code: plain-variable-broken}}

`count++`는 실제로 실행된다. 콘솔에는 1, 2, 3이 찍힌다.
그런데 **화면은 계속 0이다.**

React는 "이 변수가 바뀌었으니 화면을 다시 그려야겠다"를 **알지 못한다.**
React가 화면을 다시 그리는 건 오직 **state가 바뀌었다고 React에게 알려줬을 때**뿐이다.
그 통로가 `useState`다.

<!-- section: concept -->
## state = 화면을 바꾸는 값

state는 **컴포넌트 안에서 변하고, 변하면 화면이 따라 바뀌어야 하는 데이터**다.

전형적인 예:

- 버튼 클릭 횟수
- input에 입력 중인 값
- 체크박스 체크 여부
- 모달 열림/닫힘
- (실전) 지금 어느 단계 화면을 보여줄지 (`"setup" | "play" | "answer"`)

바뀌어도 화면과 무관한 값(예: 로깅용 카운터, 스크롤 위치 임시 저장)은 state가 아니어도 된다.
"이 값이 바뀌면 화면이 바뀌어야 하나?" — 그렇다면 state다.

<!-- section: concept | title: 기본 문법 -->
## 기본 문법

```jsx
import { useState } from "react";

const [state, setState] = useState(초기값);
```

`useState`는 원소가 2개인 배열을 돌려준다. 구조 분해 할당으로 이름을 붙인다.

| 이름 | 뜻 |
|---|---|
| `state` (첫 번째) | 지금 값 |
| `setState` (두 번째) | 값을 바꾸는 함수. 이걸 호출해야 리렌더가 일어난다 |
| `useState(초기값)` | 이 컴포넌트가 **처음 렌더될 때 딱 한 번** 쓰이는 값 |

이름은 관례상 `[x, setX]` 꼴로 짓는다 (`count`/`setCount`, `text`/`setText`).

<!-- section: code | lang: jsx -->
## 실습 1 — 카운터

{{code: counter-minimal}}

<!-- section: code_breakdown -->
## 한 줄씩

- `const [count, setCount] = useState(0)`
  → `count`는 처음엔 `0`. `setCount`로만 바꾼다.
- `onClick={() => setCount((prev) => prev + 1)}`
  → 버튼을 누르면 `setCount` 호출 → React가 "state 바뀜" 인지 → **컴포넌트 함수를 다시 실행** →
    이번엔 `count`가 `1` → 화면의 `{count}`가 `1`로 갱신.
- `{count}` → JSX 안에서 현재 값을 그대로 출력.

핵심은 **"`setCount` 호출 = state 변경 + 리렌더 예약"** 한 문장이다.

<!-- section: mechanism -->
## 왜 다시 그려지나 (동작 원리)

1. 컴포넌트는 그냥 **함수**다. React가 이 함수를 호출하면 JSX(화면 설계도)가 나온다.
2. `useState`는 그 값을 컴포넌트 함수 바깥, **React 내부**에 저장해 둔다.
   그래서 함수가 다시 실행돼도 값이 초기화되지 않는다.
3. `setCount(...)`를 호출하면 React는 저장해 둔 값을 바꾸고,
   **그 컴포넌트 함수를 다시 호출**한다 (= 리렌더).
4. 다시 호출된 함수 안에서 `useState`는 이번엔 **바뀐 값**을 돌려준다.
5. 새로 나온 JSX와 이전 JSX를 비교해 바뀐 DOM만 갱신한다.

그래서 "변수를 바꾼다"가 아니라 "**React에게 바꿔달라고 요청한다**"가 맞는 표현이다.

<!-- section: must_know -->
## 반드시 기억할 것

- **`state`를 직접 바꾸지 않는다.** `count = 5` ❌ → 항상 `setCount(5)` ✅
- **`set` 함수를 불러야만** 화면이 바뀐다.
- **`useState(초기값)`의 초기값은 첫 렌더에만** 쓰인다. 이후 렌더에서 이 줄은 "저장된 현재 값"을 줄 뿐이다.
- 연속으로 바꿀 때는 **함수형 업데이트**를 쓴다:
  `setCount(prev => prev + 1)`. `prev`는 "React가 아는 가장 최신 값"이라
  `setCount(count + 1)`을 여러 번 부를 때 생기는 값 꼬임을 막는다.

<!-- section: experiment -->
## 직접 바꿔 보기

1. `counter-minimal`에서 `setCount((prev) => prev + 1)`을 `setCount(count + 1)`로 바꾸고,
   `onClick`에서 두 번 연속 호출해 보라 (`() => { setCount(count+1); setCount(count+1); }`).
   1씩만 오르는 것을 확인하라. 그다음 함수형으로 바꾸면 2씩 오른다.
2. `useState(0)`을 `useState(() => { console.log("init"); return 0; })`로 바꿔 보라.
   버튼을 눌러 리렌더시켜도 `"init"`이 **다시 찍히지 않는** 것을 확인하라.

<!-- section: concept | title: 제어 컴포넌트 -->
## 실습 2 — input을 state로 (제어 컴포넌트)

입력값도 "화면을 바꾸는 값"이다. input의 `value`를 state로 묶고,
`onChange`에서 그 state를 갱신한다.

{{code: controlled-input}}

- `value={text}` → input에 보이는 값은 **항상 `text` state**가 결정한다.
- `onChange={(e) => setText(e.target.value)}` → 사용자가 타이핑할 때마다 state를 갱신.
- 이렇게 "input의 값 = React state"인 구조를 **제어 컴포넌트(controlled component)**라고 한다.
  폼 검증, 글자 수 제한, 제출 값 읽기가 전부 쉬워진다.

<!-- section: project_link -->
## 실제 프로젝트에서 — Momentalk 초성 퀴즈

수업 예제(카운터)는 state가 숫자 하나였다. 실제 화면에서는 state 하나로
**"지금 어느 화면을 보여줄지"**를 정하는 경우가 많다.

Momentalk(오르미 FE 13기 3차 팀 프로젝트)의 초성 퀴즈 컴포넌트는
`step` state 하나(`"setup" | "play" | "answer"`)로 세 단계 화면을 전환한다.

{{code: momentalk-step-state}}

- `const [step, setStep] = useState("setup")` — 이번 Lesson의 `useState(초기값)` 그대로.
- `setStep("play")` — 이번 Lesson의 "`set` 함수를 불러야 화면이 바뀐다" 그대로.
- `{step === "play" && <QuizPlay ... />}` — 다음 Lesson(`조건부 렌더링`)에서 배울 패턴.
- 자식 컴포넌트에는 `onSubmit`, `onReveal` 같은 **콜백을 props로 내려** 자식이 부모의
  state를 바꾸게 한다 → "상태는 부모가 소유한다".

로그인 폼(`momentalk/signin-controlled-form`)은 실습 2의 제어 컴포넌트 패턴을
이메일·비밀번호 입력에 그대로 쓴 예다.

<!-- section: delegatable -->
## 외울 필요 없는 것 (도구에 맡겨도 되는 것)

- `useReducer`, 상태 관리 라이브러리(Redux/Zustand)로의 확장 → 나중 Lesson.
- "이 상태를 `useState`로 둘까 `useRef`로 둘까 파생값으로 계산할까" 같은 설계 판단 →
  패턴이 손에 익은 뒤 고민해도 된다. 지금은 **"화면 바뀌는 값 = `useState`"** 한 규칙이면 충분.
- 함수형 업데이트가 필요한 정확한 배칭 규칙의 세부 → 원리(값 꼬임 방지)만 이해하고,
  "연속 업데이트엔 `prev =>`" 습관만 들이면 된다.

<!-- section: mission -->
## 미션

1. **좋아요 버튼**: `liked`(boolean) state와 개수 `count` state를 두고,
   누르면 토글되며 숫자가 +1/−1 되는 컴포넌트를 만들어라. (직접 값 수정 금지, 함수형 업데이트 사용)
2. **글자 수 카운터**: `textarea`를 제어 컴포넌트로 만들고 "현재 12 / 200"처럼 길이를 표시하라.
   200자를 넘으면 `setText`를 하지 않도록 막아라.
3. **3단계 위저드**: `step` state(`1 | 2 | 3`)로 "이전 / 다음" 버튼을 만들어라.
   Momentalk의 `handleBack`처럼 단계별로 다르게 동작하게 하라.

<!-- section: check_question -->
## 이해 점검

1. `count = count + 1`이 화면을 못 바꾸는 이유를 한 문장으로 설명하라.
2. `useState(0)`의 `0`은 언제 쓰이나? 리렌더될 때마다 `0`으로 돌아가지 않는 이유는?
3. `setCount(count + 1)`을 한 이벤트에서 두 번 부르면 왜 1만 오르나?
4. 제어 컴포넌트에서 `value={text}`만 있고 `onChange`가 없으면 어떤 일이 생기나?

<!-- section: interview_question -->
## 면접 대비

- "React에서 상태가 바뀌면 무슨 일이 일어나는지 렌더링 관점에서 설명해 주세요."
- "`setState`(또는 `set` 함수)가 비동기적으로 동작한다는 말의 의미는?"
- "제어 컴포넌트와 비제어 컴포넌트의 차이는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> `useState`의 반환값 2개, "화면을 바꾸는 값"의 판별 기준, 함수형 업데이트를 쓰는 이유,
> 제어 컴포넌트의 정의를 각각 한 문장으로 답하기. 그다음 좋아요 버튼을 코드 없이 말로 설계하기.

<!-- section: review -->
## 한 줄 정리

**state는 "바뀌면 화면도 바뀌어야 하는 값"이고, 그 값은 `set` 함수로만 바꾸며,
`set`을 부르는 순간 React가 컴포넌트를 다시 실행해 화면을 갱신한다.**
