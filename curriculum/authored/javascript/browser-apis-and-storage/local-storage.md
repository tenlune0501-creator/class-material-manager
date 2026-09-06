---
id: javascript/browser-apis-and-storage/local-storage
chapter: javascript/browser-apis-and-storage
title: localStorage
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [javascript, localstorage, web-storage]
related_material_ids:
  - 1m0ERPZSlPw_OHTsby-9pp1tiAzAFs9Vi              # local-storage - base.zip
prerequisites:
  - javascript/browser-apis-and-storage/cookies
  - javascript/objects-and-builtins/builtin-objects
code_examples:
  - slug: api
    title: 4개 메서드 — 값은 항상 문자열
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      localStorage.setItem("theme", "dark");
      localStorage.getItem("theme");     // "dark"  (없으면 null)
      localStorage.removeItem("theme");
      localStorage.clear();              // 이 origin 전체 삭제

      // 저장은 문자열만! 객체/배열은 JSON 으로
      const reserve = { location: "서울", theater: "강남", movie: "F1더무비" };
      localStorage.setItem("reserve", JSON.stringify(reserve));
      const saved = JSON.parse(localStorage.getItem("reserve") ?? "null");
  - slug: safe
    title: 안전하게 읽고 쓰기 (파싱 실패 대비)
    source_type: generated_minimal
    language: js
    code: |
      function load(key, fallback) {
        try {
          const raw = localStorage.getItem(key);
          return raw === null ? fallback : JSON.parse(raw);
        } catch {
          return fallback;               // 깨진 JSON / 접근 차단(사생활 모드 등)
        }
      }
      function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch { /* 용량 초과(보통 5MB) 등 — 조용히 무시하거나 사용자 안내 */ }
      }
  - slug: form-flow
    title: 예제 — 예매 폼 → 다음 페이지로 값 전달
    source_type: generated_minimal
    language: js
    code: |
      // index.html: 폼 제출 시 선택값을 저장하고 다음 페이지로
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));   // {location, theater, movie, date, time}
        localStorage.setItem("reserve", JSON.stringify(data));
        location.href = "seat.html";
      });

      // seat.html: 읽어서 표시
      const data = JSON.parse(localStorage.getItem("reserve") ?? "{}");
      document.querySelector(".movie").textContent = data.movie ?? "";
  - slug: vs
    title: localStorage vs sessionStorage vs cookie
    source_type: generated_minimal
    language: text
    code: |
      localStorage    영구(직접 지울 때까지) · origin 단위 · ~5MB · 서버로 안 감 · JS 전용
      sessionStorage  탭이 살아있는 동안만 · 탭/창 단위 · 나머지는 localStorage 와 동일
      cookie          만료일까지 · ~4KB · 매 요청 헤더에 자동 첨부 · 서버도 읽음
      # 클라이언트에만 필요한 설정·임시 데이터 → localStorage / sessionStorage
      # 서버가 매 요청에 알아야 하는 것(세션 ID) → cookie
  - slug: event
    title: 다른 탭 동기화 — storage 이벤트
    source_type: generated_minimal
    language: js
    code: |
      window.addEventListener("storage", (e) => {
        // 같은 사이트의 "다른 탭"에서 localStorage 가 바뀌면 발생 (자기 탭에서는 안 옴)
        if (e.key === "theme") applyTheme(e.newValue);
      });
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `localStorage` 의 4개 메서드(`setItem`/`getItem`/`removeItem`/`clear`)를 쓰고, **값이 항상 문자열**이라 객체는 `JSON.stringify`/`parse` 해야 함을 안다.
- 읽기 실패(깨진 JSON, 접근 차단, 용량 초과)에 대비한 `try/catch` 래퍼를 만든다.
- 폼 값을 저장해 다음 페이지로 넘기는 흐름을 구현한다.
- `localStorage` / `sessionStorage` / `cookie` 를 상황에 맞게 고른다.
- `storage` 이벤트로 다른 탭과 동기화한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `cookies` Lesson, `JSON.parse`/`stringify`, `FormData`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 객체를 그대로 `setItem` 해서 `"[object Object]"` 가 저장된다.
- `getItem` 결과가 없을 때 `null` 인데 `JSON.parse(null)` 하다 에러.
- 사생활 보호 모드/용량 초과에서 `setItem` 이 예외를 던져 앱이 죽는다.
- 새로고침에도 남아야 할 값을 `sessionStorage` 에 넣어 사라진다.

<!-- section: concept -->
## API — 문자열만 저장된다

{{code: api}}

- 4개 메서드가 전부. 키·값 모두 **문자열**. 없는 키는 `getItem` → `null`.
- 객체/배열은 `JSON.stringify` 로 저장, `JSON.parse` 로 복원.
- 범위는 **origin**(protocol+host+port) 단위. 용량은 대략 5MB.
- `localStorage` 는 **서버로 전송되지 않는다**(쿠키와 결정적 차이).

<!-- section: mechanism -->
## 안전한 래퍼

{{code: safe}}

- `JSON.parse` 는 깨진 문자열에 예외를 던진다. 사생활 모드/설정에 따라 `localStorage` 접근 자체가 예외일 수 있다.
- 그래서 읽기·쓰기를 `try/catch` 로 감싸고 실패 시 기본값을 돌려준다.
- 쓰기 실패의 흔한 원인은 **용량 초과**(`QuotaExceededError`).

### 예제 — 폼 값 이어 넘기기

{{code: form-flow}}

- 예매 1단계에서 선택값을 `localStorage` 에 JSON 으로 저장 → 2단계 페이지에서 읽어 표시.
- (쿼리스트링/서버 없이) 페이지 간 임시 상태 전달에 유용. 결제 완료 후 `removeItem` 으로 정리.

### 무엇을 어디에

{{code: vs}}

{{code: event}}

- 영구·클라이언트 전용 → `localStorage`. 탭 수명 동안만 → `sessionStorage`. 서버가 알아야 함 → `cookie`.
- 다른 탭에서 바뀐 걸 반영하려면 `window` 의 `storage` 이벤트(자기 탭에서는 안 온다).

<!-- section: must_know -->
## 반드시 기억할 것

- `setItem`/`getItem`(없으면 `null`)/`removeItem`/`clear`. **문자열만** → 객체는 `JSON.stringify`/`parse`.
- 읽기·쓰기를 `try/catch` 로 감싸기(깨진 JSON, 접근 차단, 용량 초과).
- origin 단위, ~5MB, **서버로 안 감**.
- 영구=localStorage / 탭 한정=sessionStorage / 서버 공유=cookie.
- 다른 탭 동기화는 `storage` 이벤트(자기 탭 제외).

<!-- section: mission -->
## 미션 — 예매 폼 + 테마 토글

local-storage Base(폼 2페이지)를 재료로.

- `index.html` : 폼 제출 시 `FormData` → 객체 → `localStorage["reserve"]`. `seat.html` 로 이동.
- `seat.html` : `reserve` 를 읽어 각 `<span>` 에 표시. 값이 없으면 `index.html` 로 되돌리기.
- `load`/`save` 안전 래퍼를 만들어 사용.
- 다크모드 토글: `localStorage["theme"]` 저장 + 첫 로드 시 적용 + `storage` 이벤트로 다른 탭에도 반영.
- 개발자도구에서 값을 손으로 깨뜨려(`{`) 넣고, 래퍼가 기본값으로 살아남는지 확인.
- "결제" 후 `removeItem("reserve")` 로 정리.

<!-- section: check_question -->
## 이해 점검

1. 객체를 `localStorage` 에 저장하려면? 다시 꺼낼 때는?
2. `getItem` 이 없는 키에 대해 무엇을 반환하나? `JSON.parse` 에 그대로 넘기면?
3. `localStorage` 와 `cookie` 의 결정적 차이 두 가지는?
4. 다른 탭에서의 변경을 감지하려면?

<!-- section: interview_question -->
## 면접 대비

- "localStorage 에 토큰을 저장하는 것의 위험은? 대안은?"
- "localStorage / sessionStorage / cookie 를 어떻게 구분해 쓰나요?"

<!-- section: review -->
## 한 줄 정리

**`localStorage` 는 문자열만 담는 origin 단위 영구 저장소라 객체는 `JSON.stringify`/`parse` 하고 읽기·쓰기를 `try/catch` 로 감싸며,
서버로 안 가는 클라이언트 전용 설정·임시 데이터에 쓰고 다른 탭 동기화는 `storage` 이벤트로 한다.**

<!-- section: next -->
## 다음 Lesson

`browser-apis-and-storage/timers` — `setTimeout`/`setInterval`.
