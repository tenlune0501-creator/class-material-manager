---
id: javascript/language-basics/arrays-and-loops
chapter: javascript/language-basics
title: 배열과 반복문
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, array, loop, for, while]
related_material_ids:
  - 17MerbozH6mLKSw-5KnqnyLCOf2x1vAxBt2C9DYBE_Sc   # Javascript 04 - 배열과 반복문
sources:
  - reference_slug: javascript/Array
code_examples:
  - slug: array-basics
    title: 배열 만들고 다루기
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const nums = [10, 20, 30];
      nums[0];            // 10   (0부터)
      nums.length;        // 3
      nums[nums.length - 1]; // 30  (마지막)

      nums.push(40);      // 끝에 추가 → [10,20,30,40]
      nums.pop();         // 끝에서 제거 → 40 반환
      nums.unshift(5);    // 앞에 추가 (느림: O(n))
      nums.shift();       // 앞에서 제거

      nums.includes(20);  // true
      nums.indexOf(30);   // 2  (없으면 -1)
  - slug: loops
    title: 반복문 3형태
    source_type: generated_minimal
    language: js
    code: |
      const items = ["a", "b", "c"];

      // for — 인덱스가 필요하거나 횟수 기반
      for (let i = 0; i < items.length; i++) {
        console.log(i, items[i]);
      }

      // for...of — 값만 필요할 때 (가장 읽기 쉬움)
      for (const item of items) {
        console.log(item);
      }

      // while — 종료 조건이 횟수가 아닐 때
      let n = 100;
      while (n > 1) { n = Math.floor(n / 2); }

      // break: 즉시 종료 / continue: 이번 회차만 건너뜀
      for (const x of items) {
        if (x === "b") continue;
        if (x === "c") break;
        console.log(x);   // "a" 만
      }
  - slug: iteration-methods
    title: 반복 대신 배열 메서드 (다음 챕터 예고)
    source_type: generated_minimal
    language: js
    code: |
      const nums = [1, 2, 3, 4];

      nums.forEach((n) => console.log(n));          // 각 요소로 무언가 실행
      const doubled = nums.map((n) => n * 2);       // [2,4,6,8]  변환
      const evens   = nums.filter((n) => n % 2 === 0); // [2,4]  걸러내기
      const total   = nums.reduce((sum, n) => sum + n, 0); // 10  하나로 접기
      // → 직접 for 를 도는 대신 "무엇을 하려는지"가 드러난다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 배열을 만들고 인덱스로 접근하며, `push`/`pop`/`unshift`/`shift`/`includes`/`indexOf` 를 쓸 수 있다.
- **`for`**, **`for...of`**, **`while`** 을 상황에 맞게 골라 **직접 반복문을 짤 수 있다.**
- `break` / `continue` 를 안다.
- "직접 for 를 도는 것"보다 `map`/`filter`/`forEach` 가 읽기 좋은 이유를 안다(다음 챕터 예고).

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/data-types` (배열은 참조형), `conditionals`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `for (let i = 0; i <= arr.length; i++)` — `<=` 로 써서 마지막 회차에 `arr[length]` = `undefined`.
- 반복 안에서 배열을 수정하다 인덱스가 꼬임.
- 뭘 하려는 반복인지(변환? 필터? 합계?) 코드만 봐선 모름.

<!-- section: concept -->
## 배열

{{code: array-basics}}

- **0부터** 색인. `arr[0]` 첫 번째, `arr[arr.length - 1]` 마지막.
- `push`/`pop` (끝) — 빠름. `unshift`/`shift` (앞) — 요소를 다 밀어야 해서 느림(큰 배열 주의).
- `includes(x)` — 있는지(true/false). `indexOf(x)` — 위치(없으면 `-1`).
- 배열도 참조형 → `const arr = []` 여도 `arr.push(1)` 는 된다(내용 변경).

<!-- section: mechanism -->
## 반복문

{{code: loops}}

| 형태 | 언제 |
|---|---|
| `for (let i...; i < n; i++)` | 인덱스가 필요하거나 "N번" 반복 |
| `for (const x of arr)` | **값만** 필요할 때. 가장 읽기 쉬움 |
| `while (조건)` | 종료 조건이 횟수가 아닐 때 (입력 받을 때까지 등) |

- **`break`** — 반복 전체를 즉시 끝냄. **`continue`** — 이번 회차만 건너뛰고 다음으로.
- `for...in` 은 **객체 키 순회**용 — 배열엔 쓰지 않는다(순서·상속 프로퍼티 문제).

<!-- section: code | lang: js -->
## 반복 대신 배열 메서드

{{code: iteration-methods}}

실무에서는 직접 `for` 를 도는 일보다 **`map`(변환) / `filter`(걸러내기) / `reduce`(합치기) / `forEach`(실행)**
가 훨씬 많다 — "무엇을 하려는지"가 코드에 드러나기 때문. (자세히는 `objects-and-builtins/array-methods`,
React 의 리스트 렌더링에서 `map` 을 매일 쓴다.)

<!-- section: must_know -->
## 반드시 기억할 것

- 인덱스는 **0 ~ length-1**. 반복 조건은 **`i < arr.length`** (`<=` 아님).
- 값만 필요하면 `for...of`. 인덱스·횟수면 `for`. 조건 기반이면 `while`.
- `break`(전체 종료) / `continue`(이번만 스킵).
- 앞쪽 추가/제거(`unshift`/`shift`)는 느리다 — 큐가 필요하면 인덱스 포인터나 다른 자료구조.
- **배열 순회는 `for...of` 나 `map`/`filter`**. `for...in` 은 객체용.
- 반복 도중 그 배열을 `splice` 등으로 수정하지 않는다(인덱스 꼬임).

<!-- section: experiment -->
## 직접 해 보기

1. `[3, 1, 4, 1, 5, 9]` 에서 (a) 합계 (b) 최댓값 (c) 3보다 큰 값만 모은 새 배열 을 `for` 로 구하라.
   그다음 같은 걸 `reduce` / `Math.max(...arr)` / `filter` 로 해 보라.
2. `for (let i = 0; i <= arr.length; i++)` 로 순회해 마지막에 `undefined` 가 나오는 걸 확인하고 고쳐라.
3. `while` 로 "사용자가 'quit' 을 입력할 때까지" 반복하는 루프를 짜라(`prompt`).
4. `break` 와 `continue` 를 각각 넣어 출력 차이를 관찰하라.

<!-- section: check_question -->
## 이해 점검

1. 길이 5인 배열의 유효한 인덱스 범위는? 반복 조건에 `<` 를 쓰는 이유는?
2. `for`, `for...of`, `while` 을 각각 언제 쓰나?
3. `break` 와 `continue` 의 차이는?
4. 배열 순회에 `for...in` 을 쓰면 안 되는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "`for`, `for...of`, `for...in`, `forEach` 의 차이는?"
- "`forEach` 로 순회 중 `break` 를 하려면? (못 한다 → 대안)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 배열 인덱스 범위와 length, push/pop vs shift/unshift 비용, 반복문 3형태의 선택 기준,
> break/continue, for...of vs for...in 을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**배열은 0부터, 순회 조건은 `i < length` — 값만 필요하면 `for...of`, 실무에선 대부분 `map`/`filter`/`reduce`
로 "무엇을 하는지"가 드러나게 쓴다.**

<!-- section: next -->
## 다음 Lesson

`language-basics/functions` — 코드를 이름 붙여 재사용.
