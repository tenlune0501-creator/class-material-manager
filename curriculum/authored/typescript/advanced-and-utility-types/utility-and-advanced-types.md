---
id: typescript/advanced-and-utility-types/utility-and-advanced-types
chapter: typescript/advanced-and-utility-types
title: 유틸리티 타입과 고급 타입
mastery: required
lesson_kind: lesson
estimated_minutes: 55
tags: [typescript, utility-types, mapped-types, conditional-types, keyof]
related_material_ids:
  - 1u5NUzv7wZC-jZKruRadITVvSYVeDiPCjCoVdSlSiRis   # 09. 타입 유틸리티와 고급 타입
prerequisites:
  - typescript/generics/generics
code_examples:
  - slug: builtin-utilities
    title: 자주 쓰는 내장 유틸리티
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      interface User { id: number; name: string; email: string; age: number }

      type PartialUser  = Partial<User>;              // 모든 속성 선택 (수정 폼)
      type RequiredUser = Required<PartialUser>;      // 모든 속성 필수
      type UserName     = Pick<User, "id" | "name">;  // 고른 것만
      type NoEmail      = Omit<User, "email">;        // 뺀 것만
      type ReadonlyUser = Readonly<User>;             // 전부 readonly

      type Role = "admin" | "user" | "guest";
      type RoleFlags = Record<Role, boolean>;         // { admin: boolean; user: ...; guest: ... }

      type Names = NonNullable<string | null | undefined>;   // string
      type Ret   = ReturnType<() => User>;                   // User
      type Args  = Parameters<(a: number, b: string) => void>; // [number, string]
      type Awaited1 = Awaited<Promise<number>>;              // number
  - slug: keyof-indexed
    title: keyof · 인덱스 접근 · typeof
    source_type: generated_minimal
    language: ts
    code: |
      const config = { host: "localhost", port: 5173, secure: false };
      type Config = typeof config;              // { host: string; port: number; secure: boolean }
      type ConfigKey = keyof Config;            // "host" | "port" | "secure"
      type PortType = Config["port"];           // number

      // as const → 리터럴 그대로 고정
      const ROUTES = ["home", "about", "contact"] as const;
      type Route = (typeof ROUTES)[number];     // "home" | "about" | "contact"
  - slug: mapped-conditional
    title: 매핑 타입 · 조건부 타입 (직접 만들기)
    source_type: generated_minimal
    language: ts
    code: |
      // 매핑: 모든 키를 돌며 변형
      type Nullable<T> = { [K in keyof T]: T[K] | null };
      type Optional<T> = { [K in keyof T]?: T[K] };

      // 조건부: T extends U ? X : Y
      type IsString<T> = T extends string ? "yes" : "no";
      type A = IsString<"hi">;   // "yes"
      type B = IsString<42>;     // "no"

      // 실전: 함수 속성만 뽑기
      type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 내장 유틸리티 타입(`Partial` / `Required` / `Pick` / `Omit` / `Readonly` / `Record` / `ReturnType` / `Parameters` / `Awaited` / `NonNullable`)을 골라 쓴다.
- **`keyof` / 인덱스 접근(`T[K]`) / `typeof` / `as const`** 로 값에서 타입을 끌어낸다.
- **매핑 타입**(`{ [K in keyof T]: ... }`)과 **조건부 타입**(`T extends U ? X : Y`)의 기본을 읽고 만든다.
- "타입을 손으로 다시 적지 말고 파생시킨다"는 원칙을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 제네릭, 제약(`extends`), 유니언, 객체 타입, `keyof` 맛보기.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `User` 와 "수정용 부분 User" 를 각각 손으로 정의 → 필드 추가 시 두 곳 수정, 어긋남.
- 설정 객체의 키 목록을 문자열 배열로 또 적어 오타·불일치.
- 함수의 반환 타입을 다른 데서 쓰려고 통째로 복사.

<!-- section: concept -->
## 내장 유틸리티

{{code: builtin-utilities}}

| 유틸리티 | 하는 일 | 흔한 용도 |
|---|---|---|
| `Partial<T>` | 모든 속성 선택 | 수정(PATCH) 폼, 부분 업데이트 |
| `Required<T>` | 모든 속성 필수 | 검증 후 확정 타입 |
| `Pick<T, K>` | `K` 키만 | 목록용 축소 타입 |
| `Omit<T, K>` | `K` 제외 | id 없는 생성용 타입 (`Omit<User, "id">`) |
| `Record<K, V>` | `K` 키에 `V` 값 | 사전, 상태 맵 |
| `ReturnType<F>` / `Parameters<F>` | 함수 반환/인자 타입 | 라이브러리 타입 재사용 |
| `Awaited<T>` | `Promise` 벗기기 | async 함수 결과 타입 |
| `NonNullable<T>` | `null`/`undefined` 제거 | 필터 후 타입 |

<!-- section: mechanism -->
## 값에서 타입 끌어내기

{{code: keyof-indexed}}

- **`typeof 값`** — 런타임 값의 타입을 얻는다(설정 객체 등).
- **`keyof T`** — `T` 의 키 이름 유니언.
- **`T[K]`** — 그 키의 값 타입.
- **`as const`** — 배열/객체를 리터럴 그대로 고정 → `(typeof ARR)[number]` 로 값 유니언 추출(라우트 목록 등).

<!-- section: code | lang: ts -->
## 매핑 · 조건부 타입

{{code: mapped-conditional}}

- **매핑 타입** `{ [K in keyof T]: 변형 }` — 모든 키를 순회하며 값 타입을 바꾼다. `Partial`/`Readonly` 도 이걸로 구현됨.
- **조건부 타입** `T extends U ? X : Y` — 타입 수준 if. 유니언에 분배(distributive)되는 성질이 있다.
- 이 둘로 `Partial`, `Pick`, `Omit` 을 직접 만들 수 있다(그리고 라이브러리 타입이 이렇게 만들어져 있다).
- **직접 복잡한 매핑/조건부를 남발하지 말 것** — 대부분 내장 유틸리티 조합으로 충분. 읽기 어려운 타입은 부채.

<!-- section: must_know -->
## 반드시 기억할 것

- 타입은 **파생**시킨다: `Partial`/`Pick`/`Omit`/`Record`/`ReturnType` 등. 손으로 다시 적으면 어긋난다.
- `typeof` + `keyof` + `T[K]` + `as const` — **값에서 타입 추출**.
- `Omit<T, "id">` = 생성 payload, `Partial<T>` = 수정 payload 가 흔한 관용.
- 매핑 타입 `{ [K in keyof T]: ... }`, 조건부 `T extends U ? X : Y` — 읽을 줄은 알되, 자작은 필요할 때만.
- 타입이 너무 복잡하면 — 데이터 구조나 함수 설계를 단순화하는 게 먼저.

<!-- section: experiment -->
## 직접 해 보기

1. `User` 를 정의하고 `CreateUserDto = Omit<User, "id" | "createdAt">`, `UpdateUserDto = Partial<CreateUserDto>` 를 만들어라.
2. `const THEME = { primary: "#09f", radius: 8 } as const` 에서 `keyof typeof THEME`, `(typeof THEME)["radius"]` 를 확인.
3. `Record<"loading" | "success" | "error", string>` 로 상태별 메시지 맵을 만들고, 키를 하나 빠뜨려 에러를 보라.
4. `Nullable<T> = { [K in keyof T]: T[K] | null }` 를 직접 만들어 `Nullable<User>` 를 확인.
5. `type ElementType<T> = T extends (infer U)[] ? U : never` 를 만들어 `ElementType<string[]>` 가 `string` 인지 확인.

<!-- section: check_question -->
## 이해 점검

1. "id 없는 생성 타입" 과 "부분 수정 타입" 은 각각 어떤 유틸리티로?
2. 런타임 설정 객체의 키 유니언을 얻는 방법은?
3. `as const` 는 무엇을 바꾸나?
4. 매핑 타입과 조건부 타입은 각각 무엇을 하나?

<!-- section: interview_question -->
## 면접 대비

- "자주 쓰는 유틸리티 타입 5개와 각각의 용도는?"
- "`keyof`, `typeof`, 인덱스 접근을 조합한 실전 예를 들어 주세요."
- "복잡한 타입 마법을 피해야 하는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 내장 유틸리티 8개의 용도, typeof/keyof/T[K]/as const, 매핑·조건부 타입, "파생하고 자작은 최소"를
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**타입은 손으로 다시 적지 말고 `Partial`/`Pick`/`Omit`/`Record`/`ReturnType` 으로 파생시키고,
`typeof`+`keyof`+`as const` 로 값에서 끌어낸다 — 매핑·조건부 타입 자작은 정말 필요할 때만.**

<!-- section: next -->
## 다음 Chapter

`typescript/typescript-in-practice` — 실전 TypeScript.
