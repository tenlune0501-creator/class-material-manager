---
id: javascript/async-and-http/fetch-and-ajax
chapter: javascript/async-and-http
title: fetch와 Ajax로 데이터 가져오기
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, fetch, ajax, api]
related_material_ids:
  - 1oZk7DMHPvLOpK6-eNlbM12QDTj06luJ7-z_X4pK-sm4   # Ajax_00_JS_basic
prerequisites:
  - javascript/async-and-http/http-basics
  - javascript/async-and-http/promises-async-await
code_examples:
  - slug: old-xhr
    title: 예전 코드 — XMLHttpRequest (Ajax)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 옛 방식: readyState 를 폴링하고 콜백으로 처리
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/products", true);   // true = 비동기
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {             // 4 = 완료
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);
          } else {
            console.error("에러", xhr.status);
          }
        }
      };
      xhr.send(null);
      // "Ajax" = 페이지 전체를 새로고침하지 않고 일부만 갱신하는 이 비동기 요청 방식
  - slug: fetch-get
    title: fetch — GET + async/await
    source_type: generated_minimal
    language: js
    code: |
      async function getProducts() {
        const res = await fetch("https://dummyjson.com/products");
        // ⚠️ fetch 는 404/500 에도 reject 하지 않는다 → ok 를 직접 확인
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();           // 본문 파싱도 비동기
        return data.products;
      }

      getProducts()
        .then((list) => console.log(list.length))
        .catch((err) => console.error(err));
  - slug: fetch-post
    title: fetch — POST (headers + body)
    source_type: generated_minimal
    language: js
    code: |
      async function addPost(payload) {
        const res = await fetch("https://dummyjson.com/posts/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },  // 보내는 형식을 서버에 알림
          body: JSON.stringify(payload),                     // 객체 → JSON 문자열
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
      // addPost({ title: "Hello", userId: 1 });
  - slug: robust
    title: 에러·로딩·취소까지
    source_type: generated_minimal
    language: js
    code: |
      async function load(url, { signal } = {}) {
        try {
          const res = await fetch(url, { signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return { ok: true, data: await res.json() };
        } catch (err) {
          if (err.name === "AbortError") return { ok: false, aborted: true };
          return { ok: false, error: err.message };   // 네트워크 끊김도 여기
        }
      }

      const ctrl = new AbortController();
      load("/api/search?q=abc", { signal: ctrl.signal });
      ctrl.abort();   // 입력이 바뀌면 이전 요청 취소 (검색어 자동완성 등)
  - slug: render
    title: 화면에 반영 (DOM)
    source_type: generated_minimal
    language: js
    code: |
      const listEl = document.querySelector("#list");
      const statusEl = document.querySelector("#status");

      async function show() {
        statusEl.textContent = "불러오는 중…";
        try {
          const products = await getProducts();
          listEl.replaceChildren(
            ...products.map((p) => {
              const li = document.createElement("li");
              li.textContent = p.title;        // 사용자/서버 값은 textContent
              return li;
            })
          );
          statusEl.textContent = "";
        } catch {
          statusEl.textContent = "불러오기 실패. 다시 시도해 주세요.";
        }
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- "Ajax" 가 페이지 전체 새로고침 없이 일부만 갱신하는 비동기 요청 방식임을 알고, 옛 `XMLHttpRequest` 코드를 읽는다.
- **`fetch` + `async/await`** 로 GET/POST 요청을 보내고, `res.ok` 확인 → `res.json()` 파싱 흐름을 지킨다.
- `fetch` 가 **HTTP 에러(404/500)에 reject 하지 않는다**는 함정을 안다.
- 로딩·에러 상태를 화면에 반영하고, `AbortController` 로 이전 요청을 취소한다.
- (연결) React 의 `useEffect` + `fetch`, Next.js 서버 컴포넌트의 `await fetch` 가 같은 원리임을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `http-basics`(메서드·상태코드), `promises-async-await`, DOM 조작.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `XMLHttpRequest` 의 `readyState`/콜백이 장황하고 에러 처리가 흩어진다.
- `fetch` 결과를 바로 쓰려다 `Promise` 를 출력하거나, `.json()` 을 `await` 안 해서 또 Promise.
- 서버가 `500` 을 줘도 `catch` 로 안 들어와서 "성공" 인 줄 안다.
- 로딩 표시가 없어 사용자가 멈춘 줄 안다.

<!-- section: concept -->
## 예전 코드 — XMLHttpRequest

{{code: old-xhr}}

- **Ajax** = Asynchronous JavaScript And XML. 핵심은 "**전체 새로고침 없이** 서버와 데이터를 주고받아 일부만 갱신".
- 옛 방식은 `XMLHttpRequest` 객체를 만들고 `readyState`(0~4)를 감시하며 콜백에서 `responseText` 를 `JSON.parse`.
- 지금은 **`fetch`** 가 표준. Promise 기반이라 `async/await` 와 잘 맞는다. (예전 코드를 만나면 위처럼 읽으면 된다.)

<!-- section: mechanism -->
## fetch — GET / POST

{{code: fetch-get}}

- `fetch(url)` → **응답 헤더가 오면** resolve 되는 Promise(본문은 아직). 본문은 `await res.json()`(또는 `.text()`).
- **함정**: `fetch` 는 네트워크가 완전히 실패할 때만 reject 한다. `404`/`500` 도 "응답을 받았다" 로 보고 **resolve** 한다 →
  반드시 `if (!res.ok) throw ...` 로 직접 확인.

{{code: fetch-post}}

- POST/PATCH: `method`, `headers`(`Content-Type: application/json`), `body: JSON.stringify(obj)`.

### 에러·로딩·취소

{{code: robust}}

{{code: render}}

- `try/catch` 로 HTTP 에러 + 네트워크 끊김을 함께 처리. 결과를 `{ ok, data }` / `{ ok:false, error }` 형태로 돌려주면 호출부가 깔끔.
- 로딩 상태는 요청 전 "불러오는 중…", 끝나면 지운다.
- **`AbortController`** — 검색어 자동완성처럼 요청이 연달아 나갈 때 이전 것을 `ctrl.abort()` 로 취소(경쟁 상태 방지).

### 프레임워크와의 연결

- React 에서는 이 `fetch` 를 `useEffect` 안에서 부르고 결과를 `useState` 에 담는다(로딩/에러 state 포함).
- Next.js 서버 컴포넌트에서는 컴포넌트 함수에서 바로 `const data = await fetch(...)`. 원리는 동일하다.

<!-- section: must_know -->
## 반드시 기억할 것

- Ajax = 전체 새로고침 없이 부분 갱신하는 비동기 요청. 표준 도구는 `fetch`(옛것은 `XMLHttpRequest`).
- `fetch`: `await fetch(url, opts)` → **`if (!res.ok) throw`** → `await res.json()`.
- **`fetch` 는 404/500 에 reject 안 한다.** `res.ok`/`res.status` 를 직접 확인.
- POST: `method` + `headers`(`Content-Type`) + `body: JSON.stringify(...)`.
- 로딩/에러 상태를 화면에 반영. 연속 요청은 `AbortController` 로 취소.
- React `useEffect`+`fetch`, Next 서버 컴포넌트 `await fetch` 가 같은 원리.

<!-- section: mission -->
## 미션 — 상품 목록 뷰어

`https://dummyjson.com/products` 사용.

- `getProducts({ q, limit })` : `fetch` + `res.ok` 확인 + `res.json()`. 검색어 있으면 `/products/search?q=`.
- 화면: 검색 input, 상태 영역(`불러오는 중…`/에러), 결과 `<ul>`. `replaceChildren` + `textContent` 로 렌더.
- 검색 input `input` 이벤트에 300ms 디바운스 + `AbortController` 로 이전 요청 취소.
- 에러를 강제로 만들기: 잘못된 URL → `catch` 가 동작하고 사용자에게 메시지 보이는지 확인.
- (선택) "추가" 폼 → `POST /products/add` → 응답을 목록 맨 위에 붙이기.
- `XMLHttpRequest` 로 같은 GET 을 한 번 구현해 보고 `fetch` 버전과 코드량 비교(3줄 소감).

<!-- section: check_question -->
## 이해 점검

1. `fetch` 가 `404` 응답에 어떻게 반응하나? 그래서 무엇을 해야 하나?
2. `res.json()` 을 `await` 하지 않으면 무엇을 얻나?
3. POST 요청에 반드시 필요한 세 가지는?
4. 검색어가 빠르게 바뀔 때 이전 요청을 취소하는 이유와 방법은?

<!-- section: interview_question -->
## 면접 대비

- "`fetch` 의 에러 처리에서 흔한 실수는 무엇인가요?"
- "`XMLHttpRequest` 대비 `fetch` 의 장단점은? (스트리밍, 진행률, 타임아웃)"
- "요청 경쟁 상태(race condition)를 어떻게 다루나요?"

<!-- section: review -->
## 한 줄 정리

**`fetch` + `async/await` 로 요청하되 `fetch` 는 404/500 에 reject 하지 않으니 `if (!res.ok) throw` 후 `await res.json()` 하고,
로딩·에러 상태를 화면에 반영하며 연속 요청은 `AbortController` 로 취소한다 — React/Next 의 데이터 패칭도 같은 원리.**

<!-- section: next -->
## 다음 Chapter

`javascript/browser-apis-and-storage` — 쿠키·localStorage·타이머.
