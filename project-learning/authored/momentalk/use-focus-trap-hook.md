---
id: momentalk/use-focus-trap-hook
project: momentalk
title: useFocusTrap — 커스텀 훅
unit_kind: hook
feature_area: 접근성
concepts: [커스텀 훅, useEffect, 정리(cleanup) 함수, useRef, 이벤트 리스너, 웹 접근성]
related_lessons:
  - react/custom-hooks/writing-custom-hooks
  - react/hooks-ref-memo-callback/useref
  - react/hooks-effect-and-lifecycle/useeffect-and-lifecycle
  - web-foundations/web-standards-and-accessibility/accessibility-checklist
---

<!-- section: role -->
## 이 코드가 하는 일

`src/hooks/useFocusTrap.js` — 모달이 열려 있는 동안 `Tab` 이동을 모달 안에 **가두고**, 닫히면 모달을 열었던
요소로 포커스를 **되돌리는** 커스텀 훅. 전체 코드는 실전 예제 `momentalk-use-focus-trap-hook`.

<!-- section: flow -->
## 입력·상태·정리

- 입력: `open`(불리언). 반환: `containerRef`(모달 컨테이너에 붙일 ref).
- `useRef` 두 개: `containerRef`(DOM 참조), `previousFocusRef`(열기 직전 포커스 요소 기억).
- `useEffect([open])`: `open` 이 참일 때 리스너 등록 + 첫 포커스 이동, 반환 함수에서 리스너 제거 + 포커스 복원.

<!-- section: code -->
## 핵심 코드 읽기

```js
export default function useFocusTrap(open) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    previousFocusRef.current = document.activeElement;   // 지금 포커스를 기억
    const focusable = getFocusable();
    (focusable[0] ?? container).focus();                 // 모달 안 첫 요소로

    const handleKeyDown = event => {
      if (event.key !== "Tab") return;
      const items = getFocusable();
      const first = items[0], last = items[items.length - 1];
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    };
    container.addEventListener("keydown", handleKeyDown);

    return () => {                                       // ← 정리 함수
      container.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();               // 원래 자리로 복원
    };
  }, [open]);

  return containerRef;
}
```

<!-- section: why -->
## 왜 이렇게 했나

- **포커스 트랩은 접근성 요구사항** 이다(모달 밖 요소로 Tab이 새면 스크린리더 사용자가 길을 잃는다).
- 로직을 훅으로 빼면 여러 모달이 `const ref = useFocusTrap(open)` 한 줄로 재사용한다.
- `previousFocusRef` 를 `useState` 가 아니라 `useRef` 로 두는 이유: **값이 바뀌어도 리렌더가 필요 없다.**

<!-- section: framework_role -->
## React 가 대신하는 것

`useEffect` 의 반환 함수가 "이 effect가 정리될 때"(=`open` 이 false로 바뀌거나 언마운트) 자동 호출된다 →
`addEventListener`/`removeEventListener` 짝을 개발자가 수동 관리하지 않아도 된다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `react/custom-hooks/writing-custom-hooks` — 훅으로 로직 추출
- `react/hooks-ref-memo-callback/useref` — 리렌더 없는 값·DOM 참조
- `web-foundations/web-standards-and-accessibility/accessibility-checklist` — 키보드 접근성

<!-- section: caution -->
## 주의점

- 정리 함수에서 `removeEventListener` 를 빠뜨리면 모달을 여닫을 때마다 리스너가 쌓인다.
- `getFocusable()` 은 매번 다시 조회한다 — 모달 내용이 동적으로 바뀌어도 최신 요소를 잡기 위해서다.

<!-- section: experiment -->
## 작은 실습

1. 간단한 모달을 만들고 `const ref = useFocusTrap(open)` 를 붙여 Tab이 안에서 순환하는지 확인하라.
2. 정리 함수에서 `previousFocusRef.current?.focus?.()` 를 지우고 닫은 뒤 포커스가 어디 있는지 보라.
3. 의존성 배열을 `[]` 로 바꾸면 무슨 문제가 생기나 예측하고 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `previousFocusRef` 를 `useState` 가 아니라 `useRef` 로 둔 이유는?
2. `useEffect` 의 반환 함수는 언제 실행되나?
3. 이 훅이 해결하는 접근성 문제는 무엇인가?

<!-- section: review -->
## 한 줄 정리

**`useFocusTrap(open)` 은 useEffect 안에서 keydown 리스너를 등록하고 반환(정리) 함수에서 리스너 제거 +
포커스 복원까지 하는, cleanup·useRef·커스텀 훅의 전형이다.**
