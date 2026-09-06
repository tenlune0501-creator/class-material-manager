---
id: javascript/objects-and-builtins/array-methods
chapter: javascript/objects-and-builtins
title: 배열 메서드 (map/filter/reduce)
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, array, map, filter, reduce, higher-order]
related_material_ids:
  - 17MerbozH6mLKSw-5KnqnyLCOf2x1vAxBt2C9DYBE_Sc   # Javascript 04 - 배열과 반복문
sources:
  - reference_slug: javascript/Array
prerequisites:
  - javascript/language-basics/arrays-and-loops
  - javascript/language-basics/functions
code_examples:
  - slug: big-three
    title: map · filter · reduce
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const items = [
        { name: "펜", price: 1000, qty: 3 },
        { name: "공책", price: 3000, qty: 1 },
        { name: "지우개", price: 500, qty: 5 },
      ];

      // map: 각 요소를 변환 → 같은 길이의 새 배열
      const names = items.map((it) => it.name);           // ["펜","공책","지우개"]
      const withTotal = items.map((it) => ({ ...it, total: it.price * it.qty }));

      // filter: 조건에 맞는 것만 → 더 짧을 수 있는 새 배열
      const cheap = items.filter((it) => it.price < 1000); // [지우개]

      // reduce: 전부를 하나로 접기 (초기값, 누적자)
      const grandTotal = items.reduce((sum, it) => sum + it.price * it.qty, 0); // 8500
  - slug: chaining
    title: 체이닝 — 순서대로 이어 쓰기
    source_type: generated_minimal
    language: js
    code: |
      const result = items
        .filter((it) => it.qty > 0)          // 재고 있는 것만
        .map((it) => it.price * it.qty)      // 금액으로 변환
        .reduce((a, b) => a + b, 0);         // 합계

      // for 로 쓰면 3개의 루프 + 임시 변수. 체이닝은 "무엇을" 하는지가 세로로 읽힌다.
  - slug: find-some-every
    title: 자주 쓰는 나머지
    source_type: generated_minimal
    language: js
    code: |
      items.find((it) => it.name === "공책");   // 첫 번째 매칭 요소 (없으면 undefined)
      items.findIndex((it) => it.price > 2000);  // 첫 매칭 인덱스 (없으면 -1)
      items.some((it) => it.price > 2000);       // 하나라도 참? → true/false
      items.every((it) => it.price > 0);         // 전부 참? → true/false
      items.sort((a, b) => a.price - b.price);   // 정렬 (★ 원본을 바꾼다! [...items].sort() 권장)
      names.join(", ");                          // "펜, 공책, 지우개"
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`map`**(변환) / **`filter`**(걸러내기) / **`reduce`**(하나로 접기)를 골라 쓰고, 셋을 **체이닝**할 수 있다.
- `find` / `findIndex` / `some` / `every` / `sort` / `join` 을 상황에 맞게 쓴다.
- **원본을 바꾸는 메서드**(`sort`, `reverse`, `push`, `splice`)와 **새 배열을 반환하는 메서드**(`map`, `filter`, `slice`)를 구분한다.
- `for` 대신 배열 메서드를 쓰면 "무엇을 하는지"가 드러나는 이유를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `language-basics/arrays-and-loops`, `functions` (콜백).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `for` 를 세 번 돌려 임시 배열을 두 개 만드는 코드 → 무슨 의도인지 읽기 어렵다.
- `arr.sort()` 를 했더니 **원본 배열**이 바뀌어서 다른 데서 버그.
- React 에서 리스트를 그리려면 `items.map(...)` 이 필수인데 손에 안 익음.

<!-- section: concept -->
## 세 가지 핵심

{{code: big-three}}

- **`map(fn)`** — 각 요소를 `fn` 으로 변환. **길이 같은** 새 배열. "A들을 B들로."
- **`filter(fn)`** — `fn` 이 `true` 인 것만. **더 짧을 수 있는** 새 배열. "조건에 맞는 것만."
- **`reduce(fn, 초기값)`** — 요소를 순회하며 하나의 값으로 누적. `fn(누적자, 현재요소)`.
  합계·개수·그룹핑·객체로 변환 등. **초기값을 꼭 준다**(빈 배열 대비).

<!-- section: mechanism -->
## 체이닝

{{code: chaining}}

메서드가 배열을 반환하므로 **이어 쓸 수 있다**. `filter → map → reduce` 가 "재고 있는 것 중 금액의 합"으로
세로로 읽힌다. `for` 로 쓰면 루프 3개 + 임시 변수 여러 개.

> 아주 큰 배열(수십만 개)에서 체이닝은 매번 새 배열을 만들어 약간 느릴 수 있다 — 대부분의 UI 데이터에선
> 신경 안 써도 되고, 문제가 되면 그때 `reduce` 한 번으로 합치거나 `for` 로 최적화한다.

<!-- section: code | lang: js -->
## 자주 쓰는 나머지 + 원본 변경 주의

{{code: find-some-every}}

| 새 배열 반환 (원본 유지) | 원본을 바꿈 (주의) |
|---|---|
| `map` `filter` `slice` `concat` `flatMap` | `sort` `reverse` `push` `pop` `shift` `unshift` `splice` |

`sort` 는 특히 함정 — **원본을 정렬**한다. 원본을 지키려면 **`[...arr].sort(...)`**.
정렬 콜백은 `a - b`(오름차순), `b - a`(내림차순). 콜백 없이 `sort()` 하면 문자열로 비교("10" < "9").

<!-- section: must_know -->
## 반드시 기억할 것

- **`map`**: 변환(길이 유지). **`filter`**: 선택(짧아짐). **`reduce`**: 접기(초기값 필수).
- 메서드는 이어 쓴다: `arr.filter(...).map(...)`.
- **`sort`/`reverse`/`push`/`splice` 는 원본을 바꾼다** → 원본 유지가 필요하면 `[...arr]` 먼저.
- `sort((a,b) => a - b)` — 콜백 없으면 문자열 정렬이 되어 숫자가 뒤죽박죽.
- `find`(요소) vs `findIndex`(위치) vs `filter`(전부) vs `some`/`every`(불리언).
- React 리스트 렌더링은 `items.map(it => <Row key={it.id} ... />)` — `map` 을 매일 쓴다.

<!-- section: experiment -->
## 직접 해 보기

1. 상품 배열에서 (a) 이름만 모은 배열 (b) 3000원 이상만 (c) 총 재고 금액 을 `map`/`filter`/`reduce` 로 구하라.
2. 위를 한 줄 체이닝으로 합쳐라.
3. `[3, 20, 1, 100]` 를 `.sort()` (콜백 없이) → 결과가 이상한 걸 확인하고 `(a,b) => a-b` 로 고쳐라.
   `[...arr].sort()` 와 `arr.sort()` 후 원본을 비교하라.
4. `reduce` 로 `["a","b","a","c","a"]` → `{ a: 3, b: 1, c: 1 }` (빈도 세기)를 만들어라.

<!-- section: check_question -->
## 이해 점검

1. `map`, `filter`, `reduce` 를 각각 한 문장으로.
2. `reduce` 에 초기값을 안 주면 어떤 문제가 생길 수 있나?
3. `sort` 가 다른 배열 메서드와 다른 위험한 점은? 회피법은?
4. `find` 와 `filter` 중 "첫 번째만 필요"할 때 무엇을?

<!-- section: interview_question -->
## 면접 대비

- "`map` 과 `forEach` 의 차이는?"
- "고차 함수(higher-order function)란? 배열 메서드가 왜 그에 해당하나요?"
- "`reduce` 로 `map`/`filter` 를 구현할 수 있나요? 반대는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> map/filter/reduce 의 역할과 반환, 체이닝, 원본 변경 메서드 목록, sort 의 함정, find vs filter 를
> 각각 한 줄로. 그다음 "재고 있는 상품의 총액"을 코드 없이 설계.

<!-- section: review -->
## 한 줄 정리

**`map`(변환)·`filter`(선택)·`reduce`(접기)를 이어 쓰면 "무엇을 하는지"가 드러난다 —
단 `sort`/`reverse`/`push` 는 원본을 바꾸므로 필요하면 `[...arr]` 먼저 복사한다.**

<!-- section: next -->
## 다음 Lesson

`objects-and-builtins/builtin-objects` — Math · JSON · Date.
