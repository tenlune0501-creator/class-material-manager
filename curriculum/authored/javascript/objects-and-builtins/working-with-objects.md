---
id: javascript/objects-and-builtins/working-with-objects
chapter: javascript/objects-and-builtins
title: 객체 다루기
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [javascript, object, property, destructuring]
related_material_ids:
  - 1edNbFgnIHPS6iVctKeqL7XORLvuDhAvK              # Javascript_Basic_part01_v2.pdf
sources:
  - reference_slug: javascript/Object
prerequisites:
  - javascript/language-basics/data-types
code_examples:
  - slug: object-basics
    title: 만들기 · 읽기 · 쓰기 · 순회
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const user = { name: "지현", age: 20, isAdmin: false };

      user.name;            // "지현"   점 표기
      user["age"];          // 20       대괄호 표기 (키가 변수/문자열일 때)
      const key = "isAdmin";
      user[key];            // false

      user.email = "a@b.c"; // 추가
      user.age = 21;        // 수정
      delete user.isAdmin;  // 삭제
      "email" in user;      // true

      Object.keys(user);    // ["name", "age", "email"]
      Object.values(user);  // ["지현", 21, "a@b.c"]
      Object.entries(user); // [["name","지현"], ...]
      for (const [k, v] of Object.entries(user)) console.log(k, v);
  - slug: destructure-spread
    title: 구조 분해 · 스프레드 · 축약
    source_type: generated_minimal
    language: js
    code: |
      const user = { name: "지현", age: 20, city: "서울" };

      // 구조 분해 — 필요한 값만 꺼내기
      const { name, age } = user;
      const { city: location, job = "무직" } = user;  // 이름 바꾸기 + 기본값

      // 스프레드 — 복사 + 덮어쓰기 (새 객체)
      const older = { ...user, age: 21 };   // user 는 그대로, age 만 바뀐 새 객체

      // 속성 축약 — 변수명 = 키명
      const x = 1, y = 2;
      const point = { x, y };               // { x: 1, y: 2 }

      // 배열도 구조분해 · 스프레드
      const [first, , third] = [10, 20, 30]; // first=10, third=30
      const merged = [...[1, 2], ...[3, 4]]; // [1,2,3,4]
  - slug: reference
    title: 참조 — 복사한 게 아니다
    source_type: generated_minimal
    language: js
    code: |
      const a = { n: 1 };
      const b = a;          // 같은 객체를 가리킴 (주소 복사)
      b.n = 99;
      a.n;                  // 99  ← a 도 바뀜!

      const c = { ...a };   // 얕은 복사 (1단계만)
      c.n = 1;
      a.n;                  // 99  (c 는 별개)

      a === b;              // true
      a === { n: 99 };      // false  (내용이 같아도 다른 객체)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 객체를 만들고 점/대괄호 표기로 읽고 쓰고 지우며, `Object.keys/values/entries` 로 순회할 수 있다.
- **구조 분해**, **스프레드(`...`)**, **속성 축약**을 쓸 수 있다(React props·state 에서 매일 쓴다).
- 객체는 **참조로 전달**된다는 것 — `const b = a` 가 복사가 아니라는 것을 설명할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/data-types` (참조형, `===`), `functions`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `state.items.push(x)` 로 원본을 직접 바꿔서 React 가 변화를 감지 못 함.
- `const copy = original` 후 `copy` 를 고쳤는데 `original` 도 바뀜.
- 함수에 인자를 5개 순서대로 넘기다 실수 → 객체 하나로 받아 구조분해하면 됨.

<!-- section: concept -->
## 객체 기본

{{code: object-basics}}

- `{ 키: 값 }`. 키는 문자열(또는 심볼). 값은 아무 타입(함수면 "메서드").
- **점 표기** `user.name` (키를 아는 경우). **대괄호** `user[key]` (키가 변수·문자열·특수문자일 때).
- 추가·수정은 그냥 대입, 삭제는 `delete`, 존재 확인은 `"키" in obj`.
- 순회: **`Object.keys/values/entries`** + `for...of`. (`for...in` 도 되지만 상속 프로퍼티까지 도는 문제가 있어 `entries` 를 권장)

<!-- section: mechanism -->
## 구조 분해 · 스프레드

{{code: destructure-spread}}

- **구조 분해** `const { name, age } = user` — 필요한 값만 이름으로 꺼낸다. `: 새이름`, `= 기본값` 가능.
  함수 매개변수에서 `function f({ label, size = "md" })` 로 "옵션 묶음".
- **스프레드** `{ ...user, age: 21 }` — 기존 속성을 펼쳐 새 객체를 만들고 일부만 덮어쓴다.
  **원본을 안 바꾸고** 바뀐 버전을 만드는 표준 방법(React state 업데이트가 이 패턴).
- **속성 축약** `{ x, y }` = `{ x: x, y: y }`.
- 배열도 `[a, b] = arr`, `[...arr1, ...arr2]`.

<!-- section: code | lang: js -->
## 참조

{{code: reference}}

- 객체·배열 변수는 **값이 있는 곳의 주소**를 담는다. `const b = a` → 둘이 **같은 객체**를 가리킨다.
  한쪽을 고치면 다른 쪽도 바뀐다.
- 복사는 **`{ ...a }`** 또는 `[...arr]` (단, **얕은 복사** — 1단계만. 중첩 객체는 여전히 공유).
- `a === b` 는 **같은 객체인지** 비교. 내용이 같아도 다른 객체면 `false`.

<!-- section: must_know -->
## 반드시 기억할 것

- 객체 순회는 `Object.keys/values/entries` + `for...of`.
- **구조 분해**로 필요한 값만, **`{ ...obj, 바꿀거 }`** 로 원본 안 건드리고 새 객체.
- `const b = a` (객체) = **주소 복사**. 진짜 복사는 `{ ...a }` (얕음).
- `===` 는 객체의 **동일성**(같은 객체?) 비교지 내용 비교가 아니다. 내용 비교는 직접 하거나 라이브러리.
- 중첩 객체를 깊게 복사하려면 `structuredClone(obj)` (최신) 또는 단계별 스프레드.
- React 에서 state 를 바꿀 땐 **항상 새 객체/배열**을 만든다(`push`/`obj.x = ` 금지).

<!-- section: experiment -->
## 직접 해 보기

1. `user` 객체를 만들어 `Object.entries` + `for...of` 로 "키: 값" 을 전부 출력하라.
2. `const b = a` 후 `b` 를 수정 → `a` 도 바뀜 확인. `const c = {...a}` 로 다시 → `c` 만 바뀜 확인.
   중첩 객체(`a.addr.city`)를 `c` 에서 바꾸면 `a` 도 바뀌는지(얕은 복사의 한계) 보라.
3. `function makeUser({ name, role = "user", ...rest })` 를 만들어 구조분해 + 기본값 + 나머지를 연습하라.
4. `const next = { ...state, count: state.count + 1 }` 패턴으로 "불변 업데이트"를 해 보라.

<!-- section: check_question -->
## 이해 점검

1. 점 표기와 대괄호 표기는 각각 언제 쓰나?
2. `const b = a` (a 는 객체) 이후 `b.x = 1` 을 하면 `a` 는? 이유는?
3. `{ ...obj }` 가 "얕은 복사"라는 게 무슨 뜻인가?
4. React state 를 `state.items.push(x)` 로 바꾸면 안 되는 이유는? (힌트: 참조)

<!-- section: interview_question -->
## 면접 대비

- "얕은 복사와 깊은 복사의 차이, 각각 어떻게 하나요?"
- "객체를 값이 아니라 참조로 전달한다는 게 무슨 의미인가요?"
- "불변성(immutability)을 지키며 객체를 업데이트하는 방법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 객체 읽기/쓰기/순회, 구조분해와 스프레드, 참조(=주소), 얕은 복사, 불변 업데이트 패턴을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**객체 변수는 주소를 담는다 — `const b = a` 는 같은 객체를 가리키므로, 원본을 안 바꾸려면
`{ ...obj, 바꿀것 }` 로 새 객체를 만든다. 구조 분해와 스프레드가 그 도구다.**

<!-- section: next -->
## 다음 Lesson

`objects-and-builtins/array-methods` — map · filter · reduce.
