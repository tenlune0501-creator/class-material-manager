---
id: typescript/objects-interfaces-aliases/objects-interface-type-alias
chapter: typescript/objects-interfaces-aliases
title: 객체 타입, interface, type 별칭
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [typescript, interface, type-alias, object-types]
related_material_ids:
  - 1YU1DAaCW_rVa9ycfG8lJQi0k5jUvLDuUQRTYaiVGwK0   # 03. 객체, 인터페이스, 타입 별칭
prerequisites:
  - typescript/setup-and-basic-types/basic-types-and-inference
code_examples:
  - slug: object-shape
    title: 객체 타입 · 선택 속성 · 읽기 전용
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      type User = {
        id: number;
        name: string;
        email?: string;        // 선택 속성 (있어도 없어도 됨 → string | undefined)
        readonly createdAt: Date; // 재할당 불가
      };

      const u: User = { id: 1, name: "지현", createdAt: new Date() };
      u.email;          // string | undefined → u.email?.toUpperCase()
      // u.createdAt = new Date();  // 에러: readonly
      // { id: 1, name: "A", createdAt: new Date(), age: 20 }  // 에러: 초과 속성
  - slug: interface-vs-type
    title: interface vs type
    source_type: generated_minimal
    language: ts
    code: |
      // interface — 주로 "객체 모양" 에. 선언 병합 가능. extends 로 확장.
      interface Animal { name: string; }
      interface Dog extends Animal { breed: string; }

      // type — 무엇이든 이름 붙이기. 유니언·튜플·기본타입·매핑 등.
      type ID = string | number;
      type Point = { x: number; y: number };
      type Pair = [string, number];
      type Nullable<T> = T | null;

      // 객체 모양은 둘 다 되고 거의 같다. 팀 컨벤션 따르되:
      //   객체/클래스 계약 → interface,  그 외(유니언 등) → type  가 흔한 선택
  - slug: index-nested
    title: 중첩 · 인덱스 시그니처 · 함수 속성
    source_type: generated_minimal
    language: ts
    code: |
      interface Product {
        title: string;
        price: number;
        tags: string[];
        meta: { weight: number; origin?: string };   // 중첩
        onClick: (id: number) => void;               // 함수 속성
      }

      // 키를 미리 다 모를 때 (사전 형태)
      type Scores = { [studentId: string]: number };
      const s: Scores = { a1: 90, b2: 85 };
      // Record<string, number> 와 같다 (뒤 챕터)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 객체 타입을 정의하고 **선택 속성(`?`)**, **`readonly`**, 중첩, 함수 속성을 쓴다.
- **`interface` 와 `type`** 의 차이와 각각 언제 쓰는지 안다.
- **초과 속성 검사**(정의에 없는 키를 리터럴로 넣으면 에러)를 안다.
- **인덱스 시그니처**(`{ [key: string]: number }`)로 "키를 다 모르는" 객체를 표현한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 기본 타입·추론·리터럴 유니언. JS 객체.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 함수가 받는 객체의 "모양"이 코드에 없어서, 어떤 키가 있는지 매번 `console.log`.
- API 응답을 `any` 로 받아 `data.user.name` 오타를 런타임에 발견.
- 어떤 필드가 없을 수도 있는데(`email`) 항상 있다고 가정해 `undefined` 에러.

<!-- section: concept -->
## 객체 타입

{{code: object-shape}}

- `{ 키: 타입; ... }` 로 모양을 정의. `;` 또는 `,` 구분.
- **`email?: string`** — 선택 속성. 실제 타입은 `string | undefined` → `u.email?.xxx` 로 접근.
- **`readonly createdAt`** — 재할당 불가(내용이 객체면 그 내부는 별개).
- **초과 속성 검사** — 객체 **리터럴**을 바로 대입할 때 정의에 없는 키가 있으면 에러(오타 방지).
  변수를 거쳐 넣으면 이 검사는 느슨해진다.

<!-- section: mechanism -->
## interface vs type

{{code: interface-vs-type}}

| | `interface` | `type` |
|---|---|---|
| 객체 모양 | ✅ | ✅ |
| 유니언 (`A \| B`) | ❌ | ✅ |
| 튜플·기본타입 별칭 | ❌ | ✅ |
| `extends` 확장 | ✅ | `&`(교차)로 |
| 선언 병합(같은 이름 다시 선언) | ✅ | ❌ |

**실무 선택**: 객체/클래스의 "공개 계약"은 `interface`, 그 외(유니언, 매핑, 튜플)는 `type`.
둘 중 뭘 써도 객체 모양이면 거의 동일 — **팀 컨벤션을 따른다.**

<!-- section: code | lang: ts -->
## 중첩 · 인덱스 시그니처

{{code: index-nested}}

- 속성 안에 또 객체·배열·함수 타입.
- **인덱스 시그니처** `{ [k: string]: number }` — 키를 미리 다 모를 때(점수표, 캐시). `Record<string, number>` 와 같다.

<!-- section: must_know -->
## 반드시 기억할 것

- `?` = 선택 속성(`T | undefined`). `readonly` = 재할당 금지.
- 객체 **리터럴**을 바로 넣으면 **초과 속성 검사** — 오타를 잡아 준다.
- `interface` (객체·클래스 계약, 확장·병합), `type` (유니언·튜플·별칭 등 뭐든). 객체면 팀 컨벤션대로.
- 키를 다 모르는 객체 = 인덱스 시그니처 / `Record<K, V>`.
- 타입은 **재사용**한다 — 같은 모양이 두 번 나오면 이름을 붙인다.
- API 응답 타입을 정의해 두면 `data.usr.name` 같은 오타가 컴파일 에러가 된다.

<!-- section: experiment -->
## 직접 해 보기

1. `User` 타입을 만들고 `email` 을 선택 속성으로. `user.email.toUpperCase()` 에러 → `?.` 로 고쳐라.
2. 객체 리터럴에 정의에 없는 키(`age`)를 넣어 초과 속성 에러를 확인. 변수로 빼서 넣으면 통과되는 것도 확인(그래서 리터럴이 안전).
3. `interface Shape` 를 `extends` 로 확장하고, 같은 걸 `type` + `&` 로도 해 보라.
4. 학생별 점수를 `{ [id: string]: number }` 로, 그다음 `Record<string, number>` 로 바꿔 동일함을 확인.

<!-- section: check_question -->
## 이해 점검

1. `email?: string` 의 실제 타입과 접근 방법은?
2. `interface` 만 되고 `type` 은 안 되는 것, 반대는?
3. 초과 속성 검사는 언제 작동하나?
4. 인덱스 시그니처는 언제 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "`interface` 와 `type` 을 프로젝트에서 어떻게 구분해 쓰나요?"
- "선언 병합(declaration merging)이 무엇이고 어디에 쓰이나요?"
- "구조적 타이핑(structural typing)이 무슨 뜻인가요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 객체 타입 문법, ?와 readonly, 초과 속성 검사, interface vs type 차이표, 인덱스 시그니처를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**객체 타입은 `{ 키: 타입 }`, `?`(선택)·`readonly` 를 쓰고, 리터럴 대입 시 초과 속성 검사로 오타를 잡는다 —
`interface`(객체 계약)와 `type`(뭐든)은 객체면 거의 같으니 팀 컨벤션대로.**

<!-- section: next -->
## 다음 Chapter

`typescript/functions-unions-guards` — 함수 타입과 유니언.
