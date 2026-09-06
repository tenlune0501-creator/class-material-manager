---
id: typescript/generics/generics
chapter: typescript/generics
title: 제네릭
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [typescript, generics, type-parameters, constraints]
related_material_ids:
  - 1vngEn0yZUB2jS2QqfGOGB80_bGqlJ_XnVv3HQejm6QQ   # 06. 제네릭(Generic)
prerequisites:
  - typescript/functions-unions-guards/unions-and-type-guards
code_examples:
  - slug: generic-fn
    title: 제네릭 함수 — 입력 타입을 반환에 이어 준다
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      // ❌ any 를 쓰면 반환 타입 정보가 사라진다
      function firstAny(arr: any[]): any { return arr[0]; }

      // ✅ 제네릭 — 호출할 때의 타입이 T 에 채워진다
      function first<T>(arr: T[]): T | undefined {
        return arr[0];
      }

      const a = first([1, 2, 3]);        // a: number | undefined
      const b = first(["x", "y"]);       // b: string | undefined
      // first<string>(["x"])  ← 명시도 가능하지만 보통 추론에 맡긴다
  - slug: constraint
    title: 제약 (extends) — T 에 조건 걸기
    source_type: generated_minimal
    language: ts
    code: |
      // T 는 "length 를 가진 무언가" 여야 한다
      function longest<T extends { length: number }>(a: T, b: T): T {
        return a.length >= b.length ? a : b;
      }
      longest("abc", "de");        // string
      longest([1, 2], [3]);        // number[]
      // longest(1, 2);            // 에러: number 엔 length 가 없음

      // 키 제약: K 는 T 의 키 중 하나
      function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
        return obj[key];
      }
      prop({ name: "A", age: 1 }, "age");   // number
      // prop({ name: "A" }, "xyz")         // 에러
  - slug: generic-types
    title: 제네릭 타입 / 인터페이스
    source_type: generated_minimal
    language: ts
    code: |
      type ApiResult<T> =
        | { ok: true; data: T }
        | { ok: false; error: string };

      interface Box<T> { value: T; }

      const r: ApiResult<number[]> = { ok: true, data: [1, 2] };

      // 기본 타입 파라미터
      type List<T = string> = T[];
      const names: List = ["a"];      // string[]
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 제네릭이 "**입력 타입을 받아 출력 타입에 이어 주는 타입 변수**"임을 안다.
- 제네릭 함수/타입/인터페이스를 만들고, 호출 시 타입이 **추론**되게 한다.
- **제약**(`T extends ...`)과 `keyof` 로 제네릭에 조건을 건다.
- `any` 대신 제네릭을 써야 하는 이유를 설명한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 함수 타입, 유니언/판별 유니언, 객체 타입, `keyof` 개념 맛보기.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- "배열의 첫 요소" 유틸을 `any` 로 만들면 반환값의 타입 정보가 통째로 사라진다.
- 같은 로직인데 `number` 용, `string` 용을 따로 만든다.
- `getProp(obj, "naem")` 오타가 안 걸린다.

<!-- section: concept -->
## 제네릭 함수

{{code: generic-fn}}

- `function first<T>(arr: T[]): T | undefined` — `T` 는 **호출할 때 결정되는 타입 자리표시자**.
- `first([1,2,3])` 를 부르면 `T = number` 로 채워져 반환이 `number | undefined`.
- **보통 명시 안 한다** — 인자로부터 추론된다. `first<string>(...)` 로 강제할 수도 있다.
- `any` 와의 차이: `any` 는 정보를 **버리고**, 제네릭은 정보를 **이어 준다**.

<!-- section: mechanism -->
## 제약과 keyof

{{code: constraint}}

- **`T extends { length: number }`** — `T` 가 "그 조건을 만족하는 타입"으로 제한된다.
  덕분에 함수 안에서 `a.length` 를 안전하게 쓸 수 있다.
- **`K extends keyof T`** — `K` 는 `T` 의 **키 이름들 중 하나**. `prop(obj, key)` 의 오타를 컴파일 에러로.
- `T[K]` — "`T` 의 `K` 키의 타입" (인덱스 접근 타입).

<!-- section: code | lang: ts -->
## 제네릭 타입/인터페이스

{{code: generic-types}}

- `type ApiResult<T>`, `interface Box<T>` — 타입도 파라미터를 받는다. 사용 시 `ApiResult<User[]>` 처럼 채운다.
- `type List<T = string>` — **기본 타입 파라미터**.
- React 에서도 `useState<string[]>([])`, `Array.prototype.map<U>` 등 제네릭을 매일 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- 제네릭 = **타입 변수**. 입력 타입을 받아 출력 타입에 연결. `any` 는 정보를 버리고 제네릭은 보존한다.
- 호출 시 타입은 **추론**에 맡긴다(필요할 때만 `<T>` 명시).
- 함수 안에서 `T` 의 속성을 쓰려면 **제약**(`T extends ...`)을 걸어야 한다.
- `K extends keyof T` + `T[K]` — 객체 키/값을 타입 안전하게.
- 타입 파라미터 이름은 관례상 `T`, `K`, `V`, `E` (의미 있으면 `TItem` 등).
- 제네릭을 과하게 중첩하면 읽기 어렵다 — 필요한 만큼만.

<!-- section: experiment -->
## 직접 해 보기

1. `first<T>(arr: T[]): T | undefined` 를 만들어 `number[]`, `string[]`, `{id:number}[]` 에 써서 반환 타입을 확인.
   `any[]` 버전과 비교.
2. `pluck<T, K extends keyof T>(arr: T[], key: K): T[K][]` 를 만들어 `pluck(users, "name")` 이 `string[]` 을 반환하게 하라.
   `"naem"` 오타가 에러인지 확인.
3. `type Result<T>` 판별 유니언을 만들어 `fetchUser(): Promise<Result<User>>` 시그니처를 써 보라.
4. `identity<T>(x: T): T` 를 만들고 `identity("x")` 의 타입이 `"x"`(리터럴)인지 `string` 인지 관찰(`as const` 와 함께).

<!-- section: check_question -->
## 이해 점검

1. `any` 대신 제네릭을 쓰면 무엇이 유지되나?
2. 제네릭 함수 안에서 `T` 의 `.length` 를 쓰려면 무엇이 필요한가?
3. `K extends keyof T` 는 무엇을 보장하나?
4. 호출 시 `<T>` 를 대개 생략하는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "제네릭 제약(`extends`)이 필요한 이유를 예로 설명해 주세요."
- "`keyof` 와 인덱스 접근 타입(`T[K]`)을 어디에 쓰나요?"
- "제네릭을 남용했을 때의 문제는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 제네릭의 정의(타입 변수), any 와의 차이, 추론에 맡기기, 제약 extends, keyof + T[K],
> 제네릭 타입/인터페이스를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**제네릭은 입력 타입을 받아 출력 타입에 이어 주는 타입 변수다 — `any` 와 달리 정보를 보존하고,
`T extends ...` / `K extends keyof T` 로 조건을 걸며, 호출 시 타입은 추론에 맡긴다.**

<!-- section: next -->
## 다음 Chapter

`typescript/classes-and-modules` — 클래스와 모듈.
