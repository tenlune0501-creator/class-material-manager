---
id: react/testing/tdd-practice
chapter: react/testing
title: React에서 TDD 실습
mastery: understand
lesson_kind: lesson
estimated_minutes: 50
tags: [react, tdd, testing, vitest, react-testing-library]
related_material_ids:
  - 1Jg_F1mqoikOOqE4gFXJS1cysZRjaDFPA_-s11vtKczE   # Test Driven Development (Vitest + RTL, Counter 예제)
sources:
  - title: "React Testing Library — Introduction"
    url: https://testing-library.com/docs/react-testing-library/intro/
    publisher: "Testing Library"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Vitest — Getting Started"
    url: https://vitest.dev/guide/
    publisher: "Vitest"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - react/state-and-events/events-and-handlers
  - javascript/async-and-http/promises-async-await
code_examples:
  - slug: setup
    title: Vitest + Testing Library 설치·설정
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

      // vite.config.js
      export default defineConfig({
        plugins: [react()],
        test: {
          environment: "jsdom",      // Node 에서 브라우저 DOM 흉내
          globals: true,             // describe/test/expect 를 import 없이
          setupFiles: "./src/test/setup.js",
        },
      });

      // src/test/setup.js
      import "@testing-library/jest-dom"; // toBeInTheDocument, toHaveTextContent ...

      // package.json  →  "test": "vitest",  "test:run": "vitest run"
  - slug: red
    title: RED — 아직 없는 컴포넌트의 테스트를 먼저 쓴다
    source_type: generated_minimal
    language: jsx
    code: |
      import { render, screen } from "@testing-library/react";
      import userEvent from "@testing-library/user-event";
      import Counter from "./Counter";

      describe("Counter", () => {
        test("초기값 0이 보인다", () => {
          render(<Counter />);
          expect(screen.getByTestId("count")).toHaveTextContent("0");
        });

        test("+ 버튼을 누르면 1 증가한다", async () => {
          const user = userEvent.setup();
          render(<Counter />);
          await user.click(screen.getByRole("button", { name: "+" })); // 사용자처럼 클릭
          expect(screen.getByTestId("count")).toHaveTextContent("1");
        });
      });
      // 지금 실행하면 Counter 가 없어 실패한다 → 그게 RED
  - slug: green
    title: GREEN — 테스트를 통과하는 최소 코드
    source_type: generated_minimal
    language: jsx
    code: |
      import { useState } from "react";

      export default function Counter() {
        const [count, setCount] = useState(0);
        return (
          <div>
            <h2 data-testid="count">{count}</h2>
            <button onClick={() => setCount((c) => c + 1)}>+</button>
            <button onClick={() => setCount((c) => c - 1)}>-</button>
            <button onClick={() => setCount(0)}>Reset</button>
          </div>
        );
      }
  - slug: query-priority
    title: 요소 찾기 — 우선순위
    source_type: generated_minimal
    language: js
    code: |
      screen.getByRole("button", { name: "저장" }); // 1순위: 접근성 role + 이름
      screen.getByLabelText("이메일");               // 폼 입력
      screen.getByText("에러 발생");                 // 표시 텍스트
      screen.getByTestId("count");                   // 최후: data-testid

      // getBy*  : 없으면 즉시 에러 (있어야 하는 것)
      // queryBy*: 없으면 null   (없어야 하는 것 단언에)
      // findBy* : Promise, 나타날 때까지 대기 (비동기 등장)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **TDD의 RED → GREEN → REFACTOR** 사이클을 React 컴포넌트에 적용할 수 있다.
- Vitest + React Testing Library + `user-event` 의 역할 분담을 설명할 수 있다.
- `render` / `screen` / `getByRole` / `userEvent` 로 "사용자 관점" 테스트를 작성한다.
- `getBy` / `queryBy` / `findBy` 의 차이와, 요소를 찾는 **우선순위**를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useState` 로 값 바꾸기, 이벤트 핸들러. `async/await` (클릭이 비동기라서).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"버튼 누르면 숫자 올라가는 것" 정도는 눈으로 확인한다. 그런데 화면이 20개가 되고
공통 컴포넌트를 고치면, 매번 20군데를 손으로 눌러 볼 수 없다. 하나 고칠 때마다
어딘가 조용히 깨진다.

**TDD**는 순서를 뒤집는다 — 코드보다 **"이 컴포넌트는 이렇게 동작해야 한다"는 테스트를 먼저**
쓰고, 그걸 통과시키는 코드를 짠다. 요구사항이 실행 가능한 명세로 남고, 이후 리팩토링 때
회귀를 잡아 준다.

<!-- section: concept -->
## 도구 4개의 역할

| 도구 | 역할 | 비유 |
|---|---|---|
| **Vitest** | 테스트 실행기 (파일 찾아 실행, 결과 출력) | 감독 |
| **jsdom** | Node에 브라우저 DOM 환경 제공 | 경기장 |
| **@testing-library/react** | 컴포넌트를 렌더하고(`render`) 요소를 찾음(`screen`) | 선수 |
| **@testing-library/jest-dom** | `toBeInTheDocument` 등 DOM matcher 추가 | 심판 판정 기준 |
| **@testing-library/user-event** | 실제 사용자처럼 클릭·타이핑 시뮬레이션 | 관객의 행동 |

수업자료는 예전엔 Jest를 썼지만 지금은 **Vitest**를 쓴다. 테스트 API(`describe`/`test`/`expect`)와
RTL 사용법은 Jest와 사실상 동일하고, Vite 프로젝트와 설정이 자연스럽게 맞는다.

{{code: setup}}

<!-- section: code | lang: jsx -->
## RED — 실패하는 테스트부터

{{code: red}}

- **테스트를 먼저 쓴다.** `Counter` 가 아직 없으니 실행하면 빨갛게 실패한다. 이 실패가 "할 일 목록"이다.
- `screen.getByRole("button", { name: "+" })` — 화면을 **접근성 트리**로 본다. 사용자가
  "+ 버튼"을 인식하는 방식과 같다. CSS 클래스나 DOM 구조에 의존하지 않아 리팩토링에 강하다.
- `userEvent.setup()` → `await user.click(...)` — 클릭은 포커스 이동·mousedown·mouseup·click을
  순서대로 일으키는 **비동기** 동작이라 `await` 한다.

<!-- section: code | lang: jsx -->
## GREEN — 통과하는 최소 코드

{{code: green}}

- 테스트가 요구한 것만 만든다: `data-testid="count"` 요소, `+`/`-`/`Reset` 버튼.
- 이제 `npm test` 가 초록색이 되면 GREEN.

<!-- section: mechanism -->
## REFACTOR — 초록을 유지하며 정리

- 중복 제거, 함수 추출, 스타일 정리. **테스트가 계속 통과하는 한** 자유롭게 구조를 바꾼다.
- 테스트가 CSS 클래스·태그 구조가 아니라 **role/text/동작**을 검증하므로, 마크업을 바꿔도 안 깨진다.
- 새 요구사항이 생기면 다시 RED(테스트 추가) → GREEN → REFACTOR.

<!-- section: concept | title: 요소 찾기 -->
## 요소 찾기 — 우선순위와 3가지 접두사

{{code: query-priority}}

- 가능하면 **`getByRole` + 이름** → `getByLabelText` → `getByText` → 마지막 수단으로 `getByTestId`.
- `getBy*` = 있어야 함(없으면 에러), `queryBy*` = 없어야 함 단언용(없으면 null),
  `findBy*` = 나중에 나타남(Promise, `await`).

<!-- section: must_know -->
## 반드시 기억할 것

- 사이클: **RED**(실패 테스트) → **GREEN**(최소 통과 코드) → **REFACTOR**(초록 유지하며 정리), 반복.
- 테스트는 **사용자가 보고 하는 것**(텍스트가 보이나, 버튼을 누르면 바뀌나)을 검증한다.
  내부 state·함수 이름을 직접 들여다보지 않는다.
- 요소는 `getByRole` 우선. `data-testid` 는 최후의 수단.
- `userEvent` 상호작용은 **비동기** → `async` 테스트 + `await`.
- 설정 3종: `vite.config.js` 의 `test.environment: "jsdom"`, `setupFiles`, `setup.js` 의 `jest-dom` import.
- CI(GitHub Actions)에서는 watch 없이 `vitest run`.

<!-- section: experiment -->
## 직접 해 보기

1. 수업자료대로 `Counter.test.jsx` 의 4개 테스트(초기값 / + / - / Reset)를 **먼저** 쓰고 전부 실패시켜라.
2. `Counter.jsx` 를 최소로 구현해 4개를 모두 통과시켜라.
3. `-` 버튼 테스트에서 기대값을 `"-1"` → `"0"` 으로 바꿔 일부러 실패시키고, 에러 메시지를 읽어 보라.
4. `getByTestId("count")` 를 `getByRole("heading")` 로 바꿔 role 기반으로 찾아보라.
5. "0 아래로는 안 내려간다"는 새 요구사항을 RED → GREEN 으로 추가하라.

<!-- section: check_question -->
## 이해 점검

1. RED/GREEN/REFACTOR 각 단계에서 하는 일은?
2. `getByRole` 을 `getByTestId` 보다 먼저 시도하라는 이유는?
3. `await user.click(...)` 에서 `await` 이 필요한 이유는?
4. `getBy` / `queryBy` / `findBy` 는 각각 언제 쓰나?
5. 테스트가 마크업 구조에 의존하지 않으면 무엇이 좋아지나?

<!-- section: interview_question -->
## 면접 대비

- "TDD를 실제로 어떻게 진행하나요? 장점과 현실적인 한계는?"
- "React Testing Library가 'implementation detail 을 테스트하지 말라'고 하는 이유는?"
- "단위 테스트에서 `data-testid` 사용을 최소화하라는 조언의 배경은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> RED/GREEN/REFACTOR, 도구 4개 역할(Vitest/jsdom/RTL/user-event), getByRole 우선순위,
> getBy·queryBy·findBy 차이, userEvent 가 비동기인 이유를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**TDD는 실패하는 테스트를 먼저 쓰고(RED), 최소 코드로 통과시키고(GREEN), 초록을 유지하며
정리한다(REFACTOR) — RTL로 "사용자가 보고 하는 것"을 검증하면 마크업을 바꿔도 회귀를 잡아 준다.**
