---
id: typescript/typescript-in-practice/todo-app-with-typescript
chapter: typescript/typescript-in-practice
title: TypeScript로 만든 Todo 앱
mastery: practical
lesson_kind: lesson
estimated_minutes: 90
tags: [typescript, todo, dom, practice]
related_material_ids:
  - 1WZHzUP9pKVyZqDb3LERNWb-RS2zueuvc              # web-todo_final_v202607.zip
prerequisites:
  - typescript/typescript-in-practice/practice-project
  - javascript/dom-and-events/selecting-and-manipulating
code_examples:
  - slug: dom-typed
    title: DOM 요소는 타입이 정확하지 않다 → 좁혀서
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      const input = document.querySelector("#new-todo");
      // input: Element | null   ← id 로 찾아도 TS 는 구체 타입을 모른다

      // 1) 제네릭으로 명시 (내가 확신할 때)
      const box = document.querySelector<HTMLInputElement>("#new-todo");
      box?.value;   // string | undefined

      // 2) 좁히기 (안전)
      const el = document.getElementById("new-todo");
      if (el instanceof HTMLInputElement) {
        el.value;   // 여기선 HTMLInputElement
      }

      // null 도 항상 처리
      const btn = document.querySelector("#add");
      if (!btn) throw new Error("#add 없음");
  - slug: event-typed
    title: 이벤트 타입
    source_type: generated_minimal
    language: ts
    code: |
      form.addEventListener("submit", (e: SubmitEvent) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget as HTMLFormElement);
        const title = String(data.get("title") ?? "");
      });

      list.addEventListener("click", (e: MouseEvent) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const li = target.closest<HTMLLIElement>("li[data-id]");
        if (li) toggle(li.dataset.id!);   // dataset 값은 string | undefined
      });
  - slug: render
    title: 상태 → 렌더 (순수 로직 재사용)
    source_type: generated_minimal
    language: ts
    code: |
      // practice-project 의 Task / addTask / toggle 을 그대로 가져온다
      let todos: Task[] = loadTasks(localStorage.getItem("todos") ?? "[]").value ?? [];

      function render(): void {
        const ul = document.querySelector<HTMLUListElement>("#list")!;
        ul.innerHTML = "";
        for (const t of todos) {
          const li = document.createElement("li");
          li.dataset.id = t.id;
          li.textContent = t.title;
          li.classList.toggle("done", t.done);
          ul.append(li);
        }
        localStorage.setItem("todos", JSON.stringify(todos));
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `document.querySelector` 결과가 `Element | null` 이라는 것을 알고, **제네릭 명시** 또는 **`instanceof` 좁히기**로 처리한다.
- 이벤트 타입(`SubmitEvent`, `MouseEvent`, `e.target` 좁히기)을 정확히 쓴다.
- `practice-project` 의 순수 로직을 재사용해 **상태 → 렌더** 로 DOM Todo 를 만든다.
- `dataset`, `FormData`, `localStorage` 를 타입 안전하게 다룬다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `typescript/typescript-in-practice/practice-project` (Task, Result, 순수 로직).
- JS DOM 조작·이벤트.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `document.querySelector("#x").value` → `Object is possibly null` + `Property 'value' does not exist on 'Element'`.
- `e.target.dataset.id` 에서 `e.target` 이 `EventTarget | null` 이라 `dataset` 이 없다고 함.
- `as HTMLInputElement` 를 남발해 실제로는 다른 요소일 때 런타임 에러.

<!-- section: concept -->
## DOM 조회 타입

{{code: dom-typed}}

- `querySelector` 는 셀렉터를 봐도 **구체 타입을 모른다** → `Element | null`.
- **`querySelector<HTMLInputElement>("#x")`** — 내가 확신하면 제네릭으로 명시. 결과는 `HTMLInputElement | null`.
- **`if (el instanceof HTMLInputElement)`** — 더 안전. 잘못된 요소면 그 블록을 안 탄다.
- **`null` 은 항상** — `?.` 나 `if (!el) throw`.

<!-- section: mechanism -->
## 이벤트 타입

{{code: event-typed}}

- `"submit"` → `SubmitEvent`, `"click"` → `MouseEvent`, `"input"` → `Event`(대상은 `e.currentTarget`).
- **`e.target` 은 `EventTarget | null`** → `if (!(e.target instanceof HTMLElement)) return` 로 좁힌다.
- `el.dataset.id` 는 항상 `string | undefined` → `!` 나 검사.
- `e.currentTarget` (리스너를 단 요소)은 `as HTMLFormElement` 로 좁혀도 비교적 안전(그 요소에 직접 달았으므로).

<!-- section: code | lang: ts -->
## 상태 → 렌더

{{code: render}}

- **`practice-project` 의 `Task` / `addTask` / `toggle` / `loadTasks` 를 그대로 재사용** — 순수 로직은 DOM 과 무관.
- 이벤트 핸들러 → 순수 함수로 새 `todos` 계산 → `render()` 다시 호출 (React 의 "상태 → 화면" 을 손으로).
- `localStorage` 저장/복원은 문자열 ↔ JSON.

<!-- section: must_know -->
## 반드시 기억할 것

- `querySelector` 결과 = `Element | null` → **제네릭 명시** 또는 **`instanceof` 좁히기** + `null` 처리.
- 이벤트: `SubmitEvent`/`MouseEvent`, `e.target instanceof HTMLElement` 로 좁힌다.
- `dataset` 값 = `string | undefined`.
- **순수 로직(계산)은 재사용, DOM(반영)은 얇게.** 이 분리가 나중에 React 로 옮기기 쉽게 한다.
- `as` 단언은 최소화 — 좁히기가 우선.

<!-- section: mission -->
## 미션 — DOM Todo

`practice-project` 의 타입·순수 함수를 import 해서 완성한다. `strict`, `any` 금지, `as` 최소.

- 입력 폼(`submit`) → `addTask` → `render`. 빈 제목은 `Result` 로 막고 메시지 표시.
- 목록 클릭(이벤트 위임) → `data-id` 로 `toggle` → `render`.
- 삭제 버튼, 필터(전체/미완료), 우선순위별 그룹 보기.
- `localStorage` 로 유지. 새로고침 후 복원(`loadTasks` 의 `Result` 처리).
- 모든 `querySelector` 에 제네릭 또는 `instanceof`, 모든 이벤트에 정확한 타입.

<!-- section: check_question -->
## 이해 점검

1. `document.querySelector("#x")` 의 타입은? `.value` 를 쓰려면?
2. `e.target` 을 `HTMLElement` 로 다루려면?
3. `practice-project` 의 어떤 부분을 그대로 재사용했나? 왜 가능한가?
4. `as HTMLInputElement` 대신 `instanceof` 를 쓰는 게 나은 이유는?

<!-- section: review -->
## 한 줄 정리

**DOM 조회는 `Element | null` 이라 제네릭 명시나 `instanceof` 로 좁히고 `null` 을 처리하며, 이벤트는
정확한 타입 + `e.target` 좁히기 — 순수 로직은 `practice-project` 에서 재사용, DOM 반영만 얇게 얹는다.**

<!-- section: next -->
## 다음 Lesson

`typescript-in-practice/react-with-typescript` — React + TS.
