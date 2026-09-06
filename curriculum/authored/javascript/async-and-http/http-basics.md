---
id: javascript/async-and-http/http-basics
chapter: javascript/async-and-http
title: HTTP(S) 기본
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [javascript, http, https, web]
related_material_ids:
  - 1PzESoOFesMH-_WakTHF7TU_aHrmZh22abSq24LUda8Y   # HTTP(HTTPS)
prerequisites:
  - web-foundations/html-structure/semantic-tags
code_examples:
  - slug: req-res
    title: 요청과 응답의 구조
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      요청 (Request)                        응답 (Response)
      ┌───────────────────────────┐         ┌───────────────────────────┐
      │ POST /login  HTTP/1.1      │         │ HTTP/1.1 200 OK           │
      │ Host: api.example.com     │         │ Content-Type: application/json │
      │ Content-Type: application/json │     │                           │
      │                           │         │ { "id": 1, "name": "홍길동" } │
      │ { "email": "..", "pw": ".." } │      └───────────────────────────┘
      └───────────────────────────┘
      요소:  URL · Method · Headers · Body        Status Code · Headers · Body
  - slug: methods
    title: 메서드 — 무엇을 할 것인가
    source_type: generated_minimal
    language: text
    code: |
      GET     리소스 조회        (본문 없음, 캐시/북마크 가능)
      POST    새로 생성          (본문에 데이터)
      PUT     통째로 교체
      PATCH   일부만 수정
      DELETE  삭제
      # 대부분의 REST API 는 이 5개로 CRUD 를 표현한다.
  - slug: status
    title: 상태 코드 — 결과 분류
    source_type: generated_minimal
    language: text
    code: |
      2xx 성공     200 OK · 201 Created · 204 No Content
      3xx 리다이렉트 301 이동됨 · 304 Not Modified(캐시)
      4xx 클라이언트 잘못  400 Bad Request · 401 인증 필요 · 403 권한 없음 · 404 없음 · 409 충돌 · 429 너무 많음
      5xx 서버 잘못  500 Internal Error · 502 · 503 점검
      # 프런트엔드는 특히 4xx(내가 보낸 요청 문제)와 5xx(서버 문제)를 구분해 처리한다.
  - slug: devtools
    title: DevTools Network 로 실제 확인
    source_type: generated_minimal
    language: text
    code: |
      # F12 → Network → 요청 클릭
      #  Headers  : Request URL / Method / Status / 요청·응답 헤더
      #  Payload  : 내가 보낸 body
      #  Response / Preview : 서버가 준 데이터
      #  Timing   : 얼마나 걸렸나
      # "왜 안 되지" 의 90%는 여기서 Status 와 Response 를 보면 답이 나온다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 웹이 **요청(Request) ↔ 응답(Response)** 으로 동작한다는 것과 각각의 구성요소(URL/Method/Headers/Body, Status/Headers/Body)를 설명한다.
- HTTP 메서드 5개와 그 의미(CRUD)를 안다.
- 상태 코드 그룹(2xx/3xx/4xx/5xx)과 자주 보는 코드를 읽는다.
- **HTTP vs HTTPS**(암호화 여부)를 안다.
- 개발자도구 Network 탭에서 실제 요청/응답을 확인한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 브라우저·서버라는 말, JSON 형태. HTML 기본.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `fetch` 를 쓰는데 왜 `method`, `headers`, `body` 가 필요한지 몰라 복붙만 한다.
- 요청이 실패했을 때 400 인지 500 인지 구분 못 해서 프런트 버그인지 서버 버그인지 못 가린다.
- Network 탭을 안 봐서 디버깅을 감으로 한다.

<!-- section: concept -->
## 요청과 응답

{{code: req-res}}

- **클라이언트**(브라우저/JS)가 **서버**에 요청을 보내고, 서버가 응답을 준다. 페이지 하나를 그리는 데도 수십 번 오간다.
- 요청 = **URL**(어디로) + **Method**(무엇을) + **Headers**(부가 정보: 인증 토큰, 콘텐츠 타입 등) + **Body**(보낼 데이터).
- 응답 = **Status Code**(결과) + **Headers** + **Body**(실제 데이터, 보통 JSON).

<!-- section: mechanism -->
## 메서드와 상태 코드

{{code: methods}}

{{code: status}}

- 메서드는 **의도**를 표현한다. 조회는 `GET`, 생성은 `POST`, 수정은 `PUT`/`PATCH`, 삭제는 `DELETE`.
- 상태 코드 첫 자리로 크게 나눈다: **4xx = 내 요청이 잘못**(입력·인증·주소), **5xx = 서버 문제**. 이 구분이 디버깅의 출발점.
- `401`(로그인 안 됨)과 `403`(로그인은 됐지만 권한 없음)은 다르다.

### HTTP vs HTTPS

- **HTTP** — 평문. 중간에서 내용을 볼 수 있다.
- **HTTPS** — TLS 로 암호화. 실서비스는 전부 HTTPS. 브라우저는 HTTP 폼 전송·혼합 콘텐츠에 경고를 띄운다.

### DevTools 로 보기

{{code: devtools}}

- Network 탭에서 URL·Method·Status·요청 body·응답 body·소요 시간을 눈으로 본다. "왜 안 되지" 의 대부분은 여기서 풀린다.

<!-- section: must_know -->
## 반드시 기억할 것

- 웹 = 요청(URL·Method·Headers·Body) ↔ 응답(Status·Headers·Body).
- 메서드: `GET` 조회 / `POST` 생성 / `PUT`·`PATCH` 수정 / `DELETE` 삭제 = CRUD.
- 상태 코드: **2xx** 성공, **3xx** 리다이렉트, **4xx** 요청 잘못(400·401·403·404·429), **5xx** 서버 잘못.
- `401`(미인증) ≠ `403`(권한 없음).
- HTTPS = 암호화된 HTTP. 실서비스 필수.
- 디버깅은 DevTools **Network** 탭의 Status/Response 부터.

<!-- section: experiment -->
## 직접 해 보기

1. 아무 페이지나 열고 Network 탭에서 문서·이미지·API 요청의 Method·Status 를 관찰.
2. 콘솔에서 `fetch("https://dummyjson.com/products").then(r => r.json()).then(console.log)` → Network 에서 그 요청의 Headers/Response 확인.
3. 일부러 없는 주소 `fetch("https://dummyjson.com/nope")` → Status `404` 확인.
4. `https://dummyjson.com/products/add` 에 `POST` 로 `{ title: "x" }` 를 보내고 `201`/응답 body 관찰.

<!-- section: check_question -->
## 이해 점검

1. 요청의 4가지 구성요소는? 응답의 3가지는?
2. `GET` 과 `POST` 의 차이를 의미와 body 관점에서.
3. `404` 와 `500` 중 서버 담당자에게 알려야 하는 쪽은? `401` 과 `403` 의 차이는?
4. HTTPS 가 HTTP 와 다른 점 한 가지는?

<!-- section: review -->
## 한 줄 정리

**웹은 요청(URL·Method·Headers·Body)과 응답(Status·Headers·Body)의 주고받기이고, 메서드는 CRUD 의도를,
상태 코드 첫 자리는 결과(4xx=내 요청, 5xx=서버)를 말한다 — 디버깅은 DevTools Network 탭에서 시작한다.**

<!-- section: next -->
## 다음 Lesson

`async-and-http/promises-async-await` — 비동기 흐름 제어.
