---
id: javascript/objects-and-builtins/builtin-objects
chapter: javascript/objects-and-builtins
title: 내장 객체 (Math/JSON/Date)
mastery: understand
lesson_kind: lesson
estimated_minutes: 35
tags: [javascript, builtins, Math, JSON, Date]
related_material_ids:
  - 1F2hOny7c3oBdq-CM9rlGWbELheWfDIB8              # Javascript_Basic_part02_v2.pdf
sources:
  - reference_slug: javascript/Math
  - reference_slug: javascript/JSON
  - reference_slug: javascript/Date
prerequisites:
  - javascript/objects-and-builtins/working-with-objects
code_examples:
  - slug: math
    title: Math
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      Math.floor(3.7);   // 3   (내림)
      Math.ceil(3.1);    // 4   (올림)
      Math.round(3.5);   // 4   (반올림)
      Math.trunc(-3.7);  // -3  (소수 버림)
      Math.abs(-5);      // 5
      Math.max(1, 9, 4); // 9    (배열은 Math.max(...arr))
      Math.min(...[3,1,2]); // 1
      Math.random();     // 0 이상 1 미만

      // 0 ~ n-1 정수 랜덤
      const dice = Math.floor(Math.random() * 6) + 1;  // 1~6
  - slug: json
    title: JSON — 객체 ↔ 문자열
    source_type: generated_minimal
    language: js
    code: |
      const obj = { name: "지현", tags: ["a", "b"], active: true };

      const text = JSON.stringify(obj);           // '{"name":"지현","tags":["a","b"],"active":true}'
      const text2 = JSON.stringify(obj, null, 2); // 들여쓰기 2칸 (보기 좋게)

      const back = JSON.parse(text);              // 다시 객체로
      back.name;                                  // "지현"

      // 쓰임: localStorage 저장, fetch 요청/응답, 설정 파일
      localStorage.setItem("user", JSON.stringify(obj));
      const saved = JSON.parse(localStorage.getItem("user") ?? "null");
      // 주의: 함수/undefined/Date 는 stringify 에서 사라지거나 문자열이 됨
  - slug: date
    title: Date
    source_type: generated_minimal
    language: js
    code: |
      const now = new Date();
      now.getFullYear();     // 2026
      now.getMonth();        // 0~11  ★ 0 = 1월
      now.getDate();         // 1~31
      now.getDay();          // 0~6   0 = 일요일
      now.getHours();

      Date.now();            // 1970-01-01 부터의 밀리초 (타임스탬프)
      const d = new Date("2026-09-07T10:00:00");

      // 사람이 읽는 포맷은 Intl 로
      new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(now); // "2026년 9월 7일"
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `Math` 로 반올림·최대/최소·랜덤을 쓰고, "1~n 정수 랜덤" 공식을 만들 수 있다.
- **`JSON.stringify` / `JSON.parse`** 로 객체와 문자열을 오가고, localStorage·fetch 에서 왜 필요한지 안다.
- `Date` 로 연/월/일/요일을 읽고, **`getMonth()` 가 0부터**라는 함정을 안다.
- 날짜 포맷은 `Intl.DateTimeFormat` 을, 복잡한 날짜 계산은 라이브러리를 쓴다는 감각을 갖는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `objects-and-builtins/working-with-objects`, `arrays-and-loops`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 객체를 localStorage 에 넣었더니 `[object Object]` 라는 문자열만 저장됨 → `JSON.stringify` 안 함.
- `new Date().getMonth()` 가 8월인데 7 이 나옴 → 0부터라는 걸 모름.
- 날짜에 3일 더하기, "며칠 전" 표시를 직접 계산하다 윤년·월말에서 틀림.

<!-- section: concept -->
## Math

{{code: math}}

- `floor`(내림) / `ceil`(올림) / `round`(반올림) / `trunc`(소수 버림, 음수 주의).
- `abs` `max` `min` `pow`(=`**`) `sqrt`.
- `Math.random()` → `0 <= x < 1`. **정수 범위 랜덤**: `Math.floor(Math.random() * (max - min + 1)) + min`.

<!-- section: mechanism -->
## JSON

{{code: json}}

- **`JSON.stringify(obj)`** — 객체/배열 → 문자열. `(obj, null, 2)` 로 들여쓰기.
- **`JSON.parse(text)`** — 문자열 → 객체. 잘못된 JSON 이면 예외 → `try/catch`.
- **왜 필요한가**: localStorage·쿠키·네트워크는 **문자열만** 저장·전송한다. 객체를 주고받으려면 JSON 을 거친다.
- **한계**: `stringify` 는 함수·`undefined` 를 버리고, `Date` 를 문자열로 바꾼다. `parse` 로 되돌려도 `Date` 는 문자열인 채.

<!-- section: code | lang: js -->
## Date

{{code: date}}

- `new Date()` — 지금. `getFullYear/getDate/getHours` 는 그대로지만 **`getMonth()` 는 0~11** (0=1월).
  `getDay()` 는 요일 0~6 (0=일).
- `Date.now()` — 타임스탬프(ms). 경과 시간 측정, 정렬 키.
- **포맷**: 직접 문자열 조립하지 말고 `Intl.DateTimeFormat` / `toLocaleDateString`.
- **날짜 연산**(더하기, 차이, "3일 전")은 실수가 잦다 → `date-fns` / `Day.js` 같은 라이브러리 (필요할 때 도입).

<!-- section: must_know -->
## 반드시 기억할 것

- 정수 랜덤: `Math.floor(Math.random() * n)` → `0 ~ n-1`. `+1`, `+min` 으로 범위 조정.
- 객체를 저장·전송하려면 **`JSON.stringify`**, 꺼낼 때 **`JSON.parse`** (`try/catch`).
- `stringify` 는 함수·`undefined` 를 잃고 `Date` 를 문자열로 만든다.
- **`Date#getMonth()` 는 0부터.** (달력 표시할 때 `+1`)
- 날짜 포맷은 `Intl`, 날짜 계산은 라이브러리. 직접 `+ 1000*60*60*24` 로 하루 더하기는 서머타임 등에서 위험.

<!-- section: experiment -->
## 직접 해 보기

1. "주사위 두 개 합"(2~12)을 `Math.random` 으로 만들고, 1000번 돌려 각 합의 빈도를 세어 보라.
2. 객체를 `localStorage.setItem("k", obj)` (stringify 없이)로 저장 → 꺼내 보면 `"[object Object]"`.
   `JSON.stringify` 를 넣어 고치고, `JSON.parse` 로 복원하라.
3. `new Date()` 에서 "YYYY-MM-DD" 문자열을 직접 만들어 보라(월에 `+1`, 한 자리 0 채우기).
   그다음 `toLocaleDateString("ko-KR")` 과 비교.
4. `JSON.stringify({ f: () => 1, u: undefined, d: new Date() })` 의 결과를 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `1~6` 정수 랜덤을 만드는 식은?
2. 객체를 localStorage 에 저장하려면 무엇을 거쳐야 하나? 꺼낼 때는?
3. `new Date().getMonth()` 가 8월에 `7` 인 이유는?
4. `JSON.stringify` 로 잃어버리는 것 2가지는?

<!-- section: interview_question -->
## 면접 대비

- "`JSON.stringify` 로 직렬화가 안 되는 값에는 어떤 것이 있나요?"
- "깊은 복사에 `JSON.parse(JSON.stringify(obj))` 를 쓸 때의 한계는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 정수 랜덤 공식, JSON.stringify/parse 와 그 쓰임·한계, getMonth 0-base, 날짜 포맷·계산은 무엇으로 하는지를
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`Math` 로 반올림·랜덤, `JSON` 으로 객체↔문자열(저장·전송의 필수 관문, 함수·Date 는 잃음),
`Date` 는 `getMonth()` 가 0부터 — 포맷은 `Intl`, 계산은 라이브러리.**

<!-- section: next -->
## 다음 Chapter

`javascript/classes-and-modules` — class 와 ES 모듈.
