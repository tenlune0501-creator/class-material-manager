---
id: typescript/functions-unions-guards/function-types
chapter: typescript/functions-unions-guards
title: 함수 타입
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [typescript, function-types, parameters, overload]
related_material_ids:
  - 1lusAP0njMnYL7Z3oApeNvv56IRE4K5gblpj5e0yiCh0   # 04. 함수 타입
prerequisites:
  - typescript/objects-interfaces-aliases/objects-interface-type-alias
code_examples:
  - slug: fn-signature
    title: 파라미터 · 반환 · 선택 · 기본값 · 나머지
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      function greet(name: string, title?: string): string {
        return title ? `${title} ${name}` : name;   // title 은 string | undefined
      }

      function pow(base: number, exp = 2): number {   // 기본값 → 타입 추론됨
        return base ** exp;
      }

      function sum(...nums: number[]): number {       // 나머지 = 배열 타입
        return nums.reduce((a, n) => a + n, 0);
      }
  - slug: fn-type-alias
    title: 함수 타입을 이름 붙이기 (콜백에 유용)
    source_type: generated_minimal
    language: ts
    code: |
      type Formatter = (value: number, unit: string) => string;

      const won: Formatter = (v, u) => `${v.toLocaleString()}${u}`;
      //         ↑ 여기서 v, u 타입은 Formatter 로부터 추론 → 다시 안 적음

      function makeList(items: number[], fmt: Formatter): string[] {
        return items.map((n) => fmt(n, "원"));
      }
  - slug: void-this
    title: void 반환 · 콜백의 반환 무시
    source_type: generated_minimal
    language: ts
    code: |
      // 반환 타입 void → "반환값을 쓰지 않겠다"
      const nums = [1, 2, 3];
      nums.forEach((n) => console.log(n));   // console.log 는 값을 반환하지만 forEach 는 무시

      // 콜백 타입이 () => void 여도, 실제로 뭔가 반환하는 함수를 넘겨도 됨 (반환값이 무시될 뿐)
      type Handler = () => void;
      const h: Handler = () => 42;   // OK. 42 는 그냥 버려짐
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 함수의 **파라미터 타입 · 반환 타입 · 선택 파라미터(`?`) · 기본값 · 나머지(`...`)** 를 정확히 쓴다.
- 함수 타입을 **`type` 으로 이름 붙여** 콜백 시그니처를 재사용한다(넘기는 함수는 타입을 다시 안 적어도 됨).
- `void` 반환의 의미와 "콜백 반환값 무시" 동작을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 기본 타입, 객체 타입, JS 함수(기본값/나머지/콜백).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `arr.map((x) => ...)` 에서 `x` 가 `any` 로 잡혀 오타가 안 걸린다(콜백 타입을 안 줌).
- 선택 파라미터를 안 쓰고 `undefined` 를 명시적으로 넘겨야 한다.
- 이벤트 핸들러 타입을 매번 인라인으로 길게 적는다.

<!-- section: concept -->
## 함수 시그니처

{{code: fn-signature}}

- **파라미터는 항상 타입 명시.** 반환 타입은 보통 추론에 맡기되, 공개 함수는 명시.
- `title?: string` — 선택 파라미터. 뒤쪽에만 올 수 있다. 실제 타입 `string | undefined`.
- `exp = 2` — 기본값 있으면 타입 추론됨. 선택 파라미터처럼 취급.
- `...nums: number[]` — 나머지는 **배열 타입**.

<!-- section: mechanism -->
## 함수 타입 별칭

{{code: fn-type-alias}}

- `type Formatter = (value: number, unit: string) => string` — 함수의 모양을 이름 붙인다.
- 그 타입으로 선언한 함수의 **파라미터 타입은 자동 추론** → `(v, u) => ...` 처럼 짧게.
- 콜백을 받는 함수의 시그니처가 깔끔해진다.
- (`interface` 로도 가능: `interface Formatter { (v: number, u: string): string }`.)

<!-- section: code | lang: ts -->
## void 반환

{{code: void-this}}

- 반환 타입 `void` = "이 함수의 반환값은 쓰지 않는다".
- 특이점: `() => void` 타입 자리에 **값을 반환하는 함수를 넘겨도 된다**(반환값이 그냥 무시됨).
  그래서 `arr.forEach(x => arr2.push(x))` 같은 코드가 통과한다.

<!-- section: must_know -->
## 반드시 기억할 것

- 파라미터 타입 명시. 선택은 `?`(뒤쪽만), 기본값은 `= 값`, 나머지는 `...x: T[]`.
- 콜백 시그니처는 **`type` 으로 이름** 붙여 재사용 → 넘기는 함수의 파라미터 타입을 다시 안 적어도 된다.
- `void` = 반환값 무시. `() => void` 에는 값 반환 함수도 넘길 수 있다.
- 반환 타입 추론에 맡기되, 실수 방지가 중요한 함수는 명시(잘못된 return 을 컴파일 에러로).
- 함수 오버로드(같은 함수, 여러 시그니처)는 드물게만 — 대개 유니언 파라미터로 충분.

<!-- section: experiment -->
## 직접 해 보기

1. `map((x) => x * 2)` 를 `number[]` 와 `string[]` 에 각각 써서 `x` 타입이 자동으로 잡히는지 확인.
   배열을 `any[]` 로 만들면 `x` 도 `any` 인 것도 확인.
2. `type ClickHandler = (id: number) => void` 를 만들어 여러 버튼 컴포넌트가 재사용하게 하라.
3. `greet(name, title?)` 에서 `title` 을 뺐을 때와 `undefined` 를 명시했을 때가 같은지 확인.
4. `type Task = () => void` 에 `() => "done"` 을 넣어 통과되는 걸 확인하고, 반환값이 무시되는 것을 관찰.

<!-- section: check_question -->
## 이해 점검

1. 선택 파라미터의 실제 타입과 위치 제약은?
2. 콜백 함수 타입을 `type` 으로 빼면 무엇이 좋아지나?
3. `() => void` 자리에 `() => number` 를 넘겨도 되는 이유는?
4. 반환 타입을 명시하면 좋은 경우는?

<!-- section: interview_question -->
## 면접 대비

- "함수 오버로드를 써야 했던 상황이 있나요? 유니언으로 대체 가능했나요?"
- "`void` 반환 타입의 특수한 동작을 설명해 주세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 파라미터/선택/기본값/나머지, 함수 타입 별칭과 파라미터 추론, void 의미와 콜백 반환 무시를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**함수는 파라미터 타입을 명시하고 반환은 추론에 맡긴다 — 콜백 시그니처는 `type` 으로 이름 붙여
재사용하면 넘기는 함수의 타입을 다시 안 적어도 되고, `void` 는 반환값을 무시한다.**

<!-- section: next -->
## 다음 Lesson

`functions-unions-guards/unions-and-type-guards` — 유니언과 타입 가드.
