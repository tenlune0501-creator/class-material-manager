---
id: typescript/typescript-in-practice/react-with-typescript
chapter: typescript/typescript-in-practice
title: React + TypeScript
mastery: required
lesson_kind: lesson
estimated_minutes: 60
tags: [typescript, react, props-types, generics-components]
related_material_ids:
  - 1iF9PprUXLgOKGBwqoTv0wP_7nhloyzX47xZEVA-Bx3U   # 10. 실전 프로젝트 1
sources:
  - reference_slug: react/Using-TypeScript
prerequisites:
  - typescript/advanced-and-utility-types/utility-and-advanced-types
  - react/components-and-props/passing-props
code_examples:
  - slug: props-types
    title: props 타입
    source_type: generated_minimal
    language: tsx
    is_canonical: true
    code: |
      type ButtonProps = {
        label: string;
        variant?: "primary" | "ghost";       // 리터럴 유니언
        onClick?: () => void;
        disabled?: boolean;
        children?: React.ReactNode;           // 자식으로 올 수 있는 모든 것
      };

      function Button({ label, variant = "primary", onClick, disabled }: ButtonProps) {
        return <button className={`btn btn--${variant}`} onClick={onClick} disabled={disabled}>{label}</button>;
      }
      // 네이티브 button 의 모든 props 도 받게: React.ComponentProps<"button">
  - slug: state-event-types
    title: useState · 이벤트 · ref 타입
    source_type: generated_minimal
    language: tsx
    code: |
      const [count, setCount] = useState(0);              // number 추론
      const [user, setUser] = useState<User | null>(null); // 초기값이 null 이면 명시

      function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setText(e.target.value);
      }
      function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
      }

      const inputRef = useRef<HTMLInputElement>(null);
      inputRef.current?.focus();
  - slug: generic-component
    title: 제네릭 컴포넌트 (재사용 리스트)
    source_type: generated_minimal
    language: tsx
    code: |
      type ListProps<T> = {
        items: T[];
        getKey: (item: T) => string;
        renderItem: (item: T) => React.ReactNode;
      };

      function List<T>({ items, getKey, renderItem }: ListProps<T>) {
        return <ul>{items.map((it) => <li key={getKey(it)}>{renderItem(it)}</li>)}</ul>;
      }

      // 사용 — T 가 User 로 추론됨
      <List items={users} getKey={(u) => String(u.id)} renderItem={(u) => u.name} />
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 컴포넌트 **props 를 `type` 으로 정의**하고, `children` 은 `React.ReactNode` 로 받는다.
- `useState` / 이벤트(`React.ChangeEvent<HTMLInputElement>` 등) / `useRef` 의 타입을 정확히 쓴다.
- **제네릭 컴포넌트**로 재사용 리스트를 만든다.
- `React.ComponentProps<"button">` 로 네이티브 요소 props 를 확장한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `typescript/*` (제네릭, 유틸리티 타입, 리터럴 유니언), `react/components-and-props` 이상.
- 프로젝트는 `.tsx` (Vite: React + TypeScript 템플릿).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `props.onClik` 오타, `props.variant="blue"` (없는 값)가 안 걸린다.
- 이벤트 핸들러 `e` 를 `any` 로 둬서 `e.target.value` 오타를 놓친다.
- `useState(null)` 로 시작한 값이 계속 `null` 타입이라 나중에 객체를 못 넣는다.

<!-- section: concept -->
## props 타입

{{code: props-types}}

- props 는 **`type ButtonProps = { ... }`** (또는 interface). 컴포넌트 인자에서 구조 분해.
- 선택 props 는 `?`, 리터럴 유니언(`"primary" | "ghost"`)으로 값 제한.
- **`children`** 은 **`React.ReactNode`** (문자열·숫자·JSX·배열·null 등 렌더 가능한 모든 것).
- 이벤트 핸들러 prop 은 `() => void` 또는 `(id: string) => void`.
- 네이티브 요소를 감싸면 **`React.ComponentProps<"button">`** 를 `&` 로 합쳐 `onClick` 등을 다 받는다.

<!-- section: mechanism -->
## 상태 · 이벤트 · ref

{{code: state-event-types}}

- `useState(0)` → `number` 추론. 초기값이 `null`/`[]` 면 **명시**: `useState<User | null>(null)`, `useState<Todo[]>([])`.
- 이벤트: `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`, `React.MouseEvent<HTMLButtonElement>`.
  → `e.target.value`, `e.preventDefault()` 가 타입 안전.
- `useRef<HTMLInputElement>(null)` → `ref.current` 는 `HTMLInputElement | null` → `?.`.

<!-- section: code | lang: tsx -->
## 제네릭 컴포넌트

{{code: generic-component}}

- `function List<T>(props: ListProps<T>)` — 어떤 타입의 배열이든 받는 재사용 리스트.
- 사용처의 `items={users}` 로부터 `T = User` 가 **추론**된다 → `renderItem` 의 `u` 도 `User`.
- 드롭다운, 테이블, 셀렉트 같은 범용 UI 컴포넌트에.

<!-- section: must_know -->
## 반드시 기억할 것

- props = `type`/`interface`. `children` = `React.ReactNode`.
- 리터럴 유니언으로 `variant`·`size` 값을 제한 (오타·오값을 컴파일 에러로).
- `useState` 초기값이 명확하면 추론, `null`/`[]` 면 **`useState<T>()` 명시**.
- 이벤트: `React.ChangeEvent<...>` / `React.FormEvent<...>` / `React.MouseEvent<...>`.
- `useRef<HTMLXxx>(null)` → `current?.`.
- 네이티브 확장은 `React.ComponentProps<"button">`.
- 제네릭 컴포넌트로 범용 UI 를 타입 안전하게 재사용.

<!-- section: mission -->
## 미션 — 타입 안전 컴포넌트 세트

Vite React+TS 로. `strict`, `any` 금지.

- `<Button>` : `variant`("primary"|"ghost"|"danger"), `size`("sm"|"md"|"lg"), `loading`, + `React.ComponentProps<"button">` 확장.
- `<Input>` : label, error?, `React.ComponentProps<"input">` 확장. `onChange` 이벤트 타입 정확히.
- `<Select<T>>` : 제네릭. `options: T[]`, `getLabel`, `getValue`, `value`, `onChange`.
- `<List<T>>` : 제네릭. empty state 포함.
- 이들로 미니 폼(이름·역할 선택·제출)을 만들고, `useState` 상태 타입을 전부 명시/추론 확인.

<!-- section: check_question -->
## 이해 점검

1. `children` 의 타입은?
2. `useState` 를 `useState<T>()` 로 명시해야 하는 경우는?
3. input 의 `onChange` 이벤트 타입은?
4. 제네릭 컴포넌트에서 `T` 는 어떻게 채워지나?

<!-- section: interview_question -->
## 면접 대비

- "React 컴포넌트 props 타입을 어떻게 설계하나요? `interface` vs `type`?"
- "제네릭 컴포넌트를 만든 경험이 있나요? 어떤 UI 였나요?"
- "이벤트 핸들러 타입을 정확히 하면 무엇을 막을 수 있나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> props type + ReactNode children + 리터럴 유니언, useState 명시 시점, 이벤트 타입 3종, 제네릭 컴포넌트,
> ComponentProps 확장을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**props 는 `type` + 리터럴 유니언, `children` 은 `React.ReactNode`, `useState` 는 애매하면 `<T>` 명시,
이벤트는 `React.ChangeEvent<...>` 등 — 범용 UI 는 제네릭 컴포넌트로 타입 안전하게 재사용한다.**

<!-- section: next -->
## 다음 Track

`nextjs` — React 기반 풀스택 프레임워크.
