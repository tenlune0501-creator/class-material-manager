---
id: react/setup-and-jsx/why-react-for-publishers
chapter: react/setup-and-jsx
title: 퍼블리셔가 React를 배우는 이유
mastery: understand
lesson_kind: lesson
estimated_minutes: 20
tags: [react, intro, mental-model]
related_material_ids:
  - 1lHGLaDCm7Ug_mS-3KrZ1r9vmE93o4MJyw3yi60j8nj0   # 02_퍼블리셔가 React를 배워야 하는 이유
  - 1iCvZI0msUX1IsK8kZC51_vKQ9lDrKYsCDP_23pNsoBk   # 00_Bass
prerequisites:
  - javascript/language-basics/functions
  - javascript/objects-and-builtins/array-methods
code_examples:
  - slug: vanilla-vs-react
    title: 같은 화면, 바닐라 vs React
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 바닐라: "상태가 바뀌면 DOM 을 어떻게 고칠지"를 매번 손으로
      let count = 0;
      const btn = document.querySelector("#btn");
      const label = document.querySelector("#label");
      btn.addEventListener("click", () => {
        count += 1;
        label.textContent = `클릭: ${count}`;   // 바뀐 부분을 직접 찾아 갱신
      });

      // React: "이 상태면 화면은 이렇게 생겼다"만 선언. 갱신은 React 가.
      function Counter() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(count + 1)}>클릭: {count}</button>;
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- React 가 해결하는 문제(상태가 바뀔 때 DOM 을 손으로 동기화하는 고통)를 설명할 수 있다.
- **"명령형(DOM 을 어떻게 바꿀지)" vs "선언형(이 상태면 화면은 이렇다)"** 의 차이를 안다.
- 컴포넌트 · 상태 · "상태 → 화면" 이라는 React 의 세 가지 큰 그림을 말할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- JS 함수·배열 메서드(특히 `map`), 객체 구조분해. 바닐라로 DOM 을 조금이라도 만져 본 경험.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제 (바닐라의 한계)

화면에 "장바구니 개수"가 헤더, 사이드바, 결제 버튼 세 곳에 나온다.
아이템을 추가하면 **세 군데를 다 찾아 `textContent` 를 갱신**해야 한다.
하나라도 빠뜨리면 화면이 불일치. 상태가 늘수록, 화면이 복잡할수록 이 "동기화 코드"가 폭증한다.

<!-- section: concept -->
## 선언형 — "상태 → 화면"

{{code: vanilla-vs-react}}

- **바닐라(명령형)**: "count 가 바뀌면 → `#label` 을 찾아서 → `textContent` 를 이렇게" 를 매번 적는다.
- **React(선언형)**: "**count 가 이 값이면 화면은 이렇게 생겼다**" 하나만 적는다.
  `setCount` 로 상태를 바꾸면 **React 가 알아서** 바뀐 부분만 다시 그린다.

즉 React 는 **"UI = f(상태)"** 라는 함수적 사고를 강제한다. 개발자는 "어떻게 바꿀지"가 아니라
"어떤 상태면 어떤 모습인지"만 신경 쓴다.

<!-- section: mechanism -->
## 큰 그림 3가지

1. **컴포넌트** — 화면의 조각(버튼, 카드, 헤더)을 **함수**로 만든다. 재사용·조합 가능.
2. **상태(state)** — 시간에 따라 변하는 값(입력값, 열림/닫힘, 목록). 컴포넌트가 들고 있다.
3. **상태 → 화면 자동 갱신** — 상태가 바뀌면 React 가 그 컴포넌트를 다시 실행해 화면을 맞춘다.

"퍼블리셔"에게 이게 왜 중요한가: 요즘 실무 프론트엔드는 대부분 React/Vue/Svelte 같은
컴포넌트 기반이다. HTML/CSS 실력은 그대로 쓰이되(오히려 더 중요해진다), **동적인 화면**은 이 방식으로 만든다.

<!-- section: must_know -->
## 반드시 기억할 것

- React 의 핵심 문장: **"UI = f(state)"** — 상태를 바꾸면 화면은 따라온다.
- 개발자는 "DOM 을 어떻게 고칠지"가 아니라 "**이 상태면 화면이 어떻게 생겼는지**"를 쓴다.
- 컴포넌트 = 화면 조각을 만드는 함수. 상태 = 변하는 값.
- HTML/CSS 는 버려지는 게 아니다 — JSX 로 그대로 쓰고, 레이아웃·디자인 감각이 더 중요해진다.
- 이번 트랙은 **함수 컴포넌트 + 훅**만 다룬다. 옛 코드의 `class ... extends Component` 는 뒤에서 잠깐 비교만.

<!-- section: check_question -->
## 이해 점검

1. 바닐라 JS 로 "한 값을 세 군데에 표시"할 때 생기는 문제는?
2. 명령형과 선언형 UI 의 차이를 한 문장으로.
3. "UI = f(state)" 가 개발자에게 요구하는 사고방식은?
4. React 를 배워도 HTML/CSS 가 필요 없어지지 않는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "React 가 해결하는 문제가 무엇이라고 생각하나요?"
- "선언형 프로그래밍이 UI 개발에서 갖는 이점은?"

<!-- section: review -->
## 한 줄 정리

**React 는 "상태를 바꾸면 화면이 따라온다(UI = f(state))"를 제공한다 — 개발자는 DOM 동기화 코드 대신
"이 상태면 화면은 이렇다"만 선언하고, 나머지는 React 가 맞춘다.**

<!-- section: next -->
## 다음 Lesson

`setup-and-jsx/dev-environment` — Vite 로 React 프로젝트 만들기.
