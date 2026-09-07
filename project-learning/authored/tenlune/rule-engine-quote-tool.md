---
id: tenlune/rule-engine-quote-tool
project: tenlune
title: 규칙 기반 견적 도구 — 단일 가격 소스
unit_kind: feature
feature_area: 견적 도구
concepts: [단일 소스 원칙, 순수 계산 함수, DOM 조건부 렌더링, 폼 연동, 재사용]
related_lessons:
  - javascript/ui-implementation-patterns/filtering-and-pagination
  - javascript/dom-and-events/selecting-and-manipulating
  - javascript/language-basics/functions
  - javascript/objects-and-builtins/array-methods
---

<!-- section: role -->
## 이 코드가 하는 일

`snippets/quote-tool-v2.js` — 방문자가 원하는 구성을 고르면 예상 **가격·기간** 을 계산해 보여주는 도구.
`PRICING` 객체 하나가 선택지 표시·계산·설명의 **유일한 소스** 다. `/services/` 와 `/contact/` 두 화면이
같은 계산 로직을 공유한다(모드에 따라 결과를 CTA로 보여줄지 폼 textarea에 기록할지만 다름).

<!-- section: code -->
## 핵심 코드 읽기

```js
// 가격 정책 단일 소스 — 선택지·계산·설명이 전부 이것만 읽는다
var PRICING = {
  services: [
    { id: 'single_page', label: '한 페이지로 …', price: 210000, days: 5 },
    { id: 'company_site', label: '회사·가게·브랜드 홈페이지 …', price: 330000, days: 6 },
    { id: 'webapp', label: '예약·신청·회원 기능 …', price: 470000, days: 8 },
    // ...
  ],
  features: [
    { id: 'booking', label: '예약이나 신청을 받고 싶어요', min: 125000, max: 125000, days: 2 },
    { id: 'login',   label: '회원가입하고 로그인 …',        min: 125000, max: 125000, days: 2 },
    // ...
  ],
};

// contact 모드 판별: 페이지에 CF7 quote-summary textarea 가 있으면 그 모드
var summaryField = document.querySelector('textarea[name="quote-summary"]');
var contactMode = mount.getAttribute('data-tl-quote-mode') === 'contact' || !!summaryField;
```

계산은 `PRICING` 을 순회해 선택된 항목의 `price`/`min`+`max`/`days` 를 더하는 순수 로직이고,
결과는 `resultBox.style.display = ''` 로 조건부 표시한다.

<!-- section: why -->
## 왜 이렇게 했나

- 가격 숫자가 화면 문구·계산·설명 여러 곳에 흩어지면 정책이 바뀔 때 놓친다 → **`PRICING` 한 곳** 만 고친다.
- `/services/` 와 `/contact/` 는 UI가 다르지만 계산은 같다 → 로직을 복붙하지 않고 한 스니펫이 모드로 분기.
- 규칙 기반이라 **네트워크 없이 즉시** 결과가 나온다(LLM은 설명만 — 다음 Unit).

<!-- section: framework_role -->
## WPCode 스니펫이라는 형태

이 코드는 테마 파일이 아니라 WordPress의 WPCode 스니펫(id 21)으로 라이브에 붙는다. 가격 정책의 단일
소스가 "라이브 스니펫 21의 `PRICING`" 이라고 프로젝트 CLAUDE.md에 못 박혀 있다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `javascript/language-basics/functions`, `.../array-methods` — 순수 계산·순회
- `javascript/dom-and-events/selecting-and-manipulating` — `querySelector` + 조건부 표시
- `javascript/ui-implementation-patterns/filtering-and-pagination` — 선택→결과 패턴

<!-- section: caution -->
## 주의점

- 가격 정책(`PRICING`)은 사업 판단이다 — 임의로 숫자를 바꾸지 않는다(프로젝트 규칙).
- 규칙 엔진이 숫자를 정하고, AI는 그 숫자를 절대 바꾸지 않는다(신뢰 경계 — 다음 Unit).

<!-- section: experiment -->
## 작은 실습

1. `PRICING.features` 에 항목 하나를 추가하고 선택지·합계에 반영되는지 확인하라.
2. `contactMode` 판별 조건을 읽고, 어떤 조건이면 결과를 폼 textarea에 쓰는지 정리하라.
3. 같은 계산을 `/services/` 와 `/contact/` 두 번 구현했다고 가정하고, 정책 변경 시 생길 문제를 적어라.

<!-- section: check_question -->
## 이해 점검

1. "단일 소스 원칙" 이 이 코드에서 어떻게 지켜지나?
2. 두 화면이 같은 계산을 공유하는 방법은?
3. 규칙 기반 계산이라 얻는 이점(LLM 대비)은?

<!-- section: review -->
## 한 줄 정리

**견적 도구는 `PRICING` 객체 하나를 선택지·계산·설명의 단일 소스로 삼고, `/services/`·`/contact/` 두
화면이 같은 순수 계산을 모드로만 분기해 공유한다 — 규칙 기반이라 네트워크 없이 즉시 답이 나온다.**
