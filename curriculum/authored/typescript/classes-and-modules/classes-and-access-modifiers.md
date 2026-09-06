---
id: typescript/classes-and-modules/classes-and-access-modifiers
chapter: typescript/classes-and-modules
title: 클래스와 접근 제한자
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [typescript, class, public, private, readonly]
related_material_ids:
  - 1J1TtJ0eMWIT1r_ICrF1M89qdo0Dba77jSNhbjANvlMw   # 07. 클래스와 접근 제한자
prerequisites:
  - typescript/generics/generics
  - javascript/classes-and-modules/classes
code_examples:
  - slug: class-basics
    title: 필드 · 접근 제한자 · 생성자 축약
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      class Account {
        // 파라미터 프로퍼티: 생성자 인자에 제한자를 붙이면 필드 선언 + 대입을 한 번에
        constructor(
          public readonly id: string,
          private balance: number,
        ) {}

        deposit(amount: number): void {
          if (amount <= 0) throw new Error("금액은 양수");
          this.balance += amount;
        }

        get currentBalance(): number {   // getter
          return this.balance;
        }
      }

      const a = new Account("acc_1", 1000);
      a.deposit(500);
      a.currentBalance;   // 1500
      // a.balance;       // 에러: private
      // a.id = "x";      // 에러: readonly
  - slug: modifiers
    title: 제한자 정리
    source_type: generated_minimal
    language: ts
    code: |
      class Base {
        public name = "";        // 어디서나 (기본값)
        protected level = 1;     // 이 클래스 + 하위 클래스
        private secret = 42;     // 이 클래스 안에서만
        #trueSecret = 0;         // JS 네이티브 private (런타임에도 진짜 은닉)
        static count = 0;        // 인스턴스가 아니라 클래스에 속함
      }
      class Sub extends Base {
        show() { this.level; /* OK */  /* this.secret 은 에러 */ }
      }
  - slug: implements
    title: interface 를 클래스가 implements
    source_type: generated_minimal
    language: ts
    code: |
      interface Repository<T> {
        get(id: string): T | undefined;
        save(item: T): void;
      }

      class MemoryRepo<T extends { id: string }> implements Repository<T> {
        private store = new Map<string, T>();
        get(id: string) { return this.store.get(id); }
        save(item: T) { this.store.set(item.id, item); }
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- TS 클래스의 **필드 타입**, **접근 제한자**(`public`/`private`/`protected`), **`readonly`**, **`static`** 을 쓴다.
- **파라미터 프로퍼티**(생성자 인자에 제한자 → 필드 자동 생성) 축약을 안다.
- `implements` 로 클래스가 `interface` 계약을 지키게 한다.
- TS `private` 와 JS `#private` 의 차이를 안다.
- 요즘 React 에서는 클래스를 거의 안 쓴다는 것도 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- JS `class`(constructor, this, extends), 제네릭, interface.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 클래스 필드를 아무나 밖에서 바꿔 불변식(잔액은 음수 불가)이 깨진다.
- `constructor(id, balance) { this.id = id; this.balance = balance; }` 같은 뻔한 대입을 매번.
- "이 클래스는 이런 메서드를 반드시 가진다"를 강제할 방법이 없다.

<!-- section: concept -->
## 클래스 기본 + 파라미터 프로퍼티

{{code: class-basics}}

- 필드에 타입을 붙인다. `strict` 에서는 **초기화**가 필요(생성자에서 대입하거나 `= 기본값` 또는 `!` 단언).
- **파라미터 프로퍼티**: `constructor(public readonly id: string, private balance: number) {}` →
  `id`, `balance` 필드 선언 + 대입을 자동으로. 보일러플레이트 제거.
- `get`/`set` 접근자.

<!-- section: mechanism -->
## 접근 제한자

{{code: modifiers}}

| 제한자 | 접근 범위 | 런타임 은닉 |
|---|---|---|
| `public` (기본) | 어디서나 | — |
| `protected` | 이 클래스 + 하위 클래스 | ❌ (컴파일 시 검사만) |
| `private` (TS) | 이 클래스 안 | ❌ (JS 로 컴파일되면 그냥 필드) |
| `#name` (JS) | 이 클래스 안 | ✅ **진짜 은닉** (런타임에도 접근 불가) |
| `static` | 클래스 자체 (인스턴스 아님) | — |

→ **정말 숨겨야 하면 `#`**, 타입 수준 캡슐화면 `private` 로 충분.

<!-- section: code | lang: ts -->
## implements

{{code: implements}}

- `class X implements SomeInterface` — 그 인터페이스의 모든 멤버를 구현하지 않으면 컴파일 에러.
- "이 클래스는 이 계약을 만족한다"를 강제. 여러 인터페이스도 가능.
- `extends`(구현 상속, 하나) vs `implements`(계약 준수, 여러 개).

<!-- section: must_know -->
## 반드시 기억할 것

- 필드는 `strict` 에서 **초기화 필수** (`= 값` / 생성자 대입 / `!`).
- **파라미터 프로퍼티**로 생성자 보일러플레이트 제거.
- `private`(TS) 는 **타입 검사만** — 런타임 은닉은 **`#`**.
- `implements` = interface 계약 강제. `extends` = 상속(하나만).
- `static` = 클래스에 속하는 멤버.
- **React 는 함수 컴포넌트 + 훅** — 클래스는 유틸(리포지토리, 서비스, 상태 머신)이나 라이브러리에서.

<!-- section: experiment -->
## 직접 해 보기

1. `Account` 를 파라미터 프로퍼티로 만들고, 밖에서 `a.balance` 접근 시 에러를 확인. `#` 로 바꿔 런타임에도 막히는 걸 확인.
2. `interface Logger { log(msg: string): void }` 를 만들고 `ConsoleLogger implements Logger` 를 구현.
   메서드 하나를 빼서 컴파일 에러를 보라.
3. `static create()` 팩토리 메서드를 가진 클래스를 만들어 `new` 대신 `X.create(...)` 로.
4. `protected` 필드를 하위 클래스에서 접근, 외부에서 접근 불가한 것을 확인.

<!-- section: check_question -->
## 이해 점검

1. `private`(TS)와 `#`(JS)의 차이는?
2. 파라미터 프로퍼티가 줄여 주는 코드는?
3. `extends` 와 `implements` 의 차이는?
4. `static` 멤버는 어디에 속하나?

<!-- section: interview_question -->
## 면접 대비

- "TS 의 `private` 이 진짜 은닉이 아니라는 게 무슨 뜻인가요?"
- "`implements` 와 `extends` 를 각각 언제 쓰나요?"
- "React 에서 클래스 컴포넌트를 안 쓰는데, 클래스는 어디에 쓰나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 필드 초기화, 파라미터 프로퍼티, 제한자 4종 + static + #, implements vs extends 를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**TS 클래스는 필드에 타입·제한자를 붙이고 파라미터 프로퍼티로 생성자를 줄인다 — `private` 은 타입 검사만,
런타임 은닉은 `#`, 계약 준수는 `implements`. React 는 함수+훅이라 클래스는 유틸용이다.**

<!-- section: next -->
## 다음 Lesson

`classes-and-modules/modules-and-namespaces` — 모듈과 네임스페이스.
