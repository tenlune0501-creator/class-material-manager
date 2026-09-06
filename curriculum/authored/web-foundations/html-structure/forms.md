---
id: web-foundations/html-structure/forms
chapter: web-foundations/html-structure
title: 폼 양식
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [html, forms, input]
related_material_ids:
  - 1Qp1qLbicezo2hd7sYuaZw9UcnnLTvO_tTuJmqkO_-hM   # 6. HTML5의 확장된 폼 양식
  - 11_5H7eq8ddkf_zt2goN4HWBpc_L_fSVI              # WSP_03_Media_form_advanced_v2019.pdf
sources:
  - reference_slug: html/input-HTML-input-element
  - reference_slug: html/select-HTML-select-element
  - reference_slug: html/textarea-HTML-textarea-element
code_examples:
  - slug: form-anatomy
    title: 폼의 구조
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <form action="/signup" method="post">
        <p>
          <label for="userId">아이디</label>
          <input id="userId" type="text" name="userid" required maxlength="20" />
        </p>
        <p>
          <label for="userPw">비밀번호</label>
          <input id="userPw" type="password" name="userpw" required minlength="8" />
        </p>
        <p>
          <label for="email">이메일</label>
          <input id="email" type="email" name="email" placeholder="you@example.com" />
        </p>

        <fieldset>
          <legend>지역</legend>
          <label><input type="radio" name="city" value="seoul" checked /> 서울</label>
          <label><input type="radio" name="city" value="busan" /> 부산</label>
        </fieldset>

        <label for="intro">자기소개</label>
        <textarea id="intro" name="intro" rows="5"></textarea>

        <label><input type="checkbox" name="agree" required /> 약관에 동의</label>

        <button type="submit">가입</button>
      </form>
  - slug: input-types
    title: type 에 따라 달라지는 input
    source_type: generated_minimal
    language: html
    code: |
      <input type="text" />        <!-- 한 줄 텍스트 -->
      <input type="password" />    <!-- 가려짐 -->
      <input type="email" />       <!-- 형식 검증 + 모바일 키패드 -->
      <input type="number" min="1" max="10" step="1" />
      <input type="date" />        <!-- 날짜 선택 UI -->
      <input type="file" accept="image/*" />
      <input type="checkbox" />    <!-- 여러 개 중 다중 선택 -->
      <input type="radio" name="g" />  <!-- 같은 name 끼리 하나만 -->
      <input type="hidden" name="token" value="abc" />  <!-- 안 보이지만 전송됨 -->

      <select name="city">
        <option value="">지역 선택</option>
        <option value="seoul">서울</option>
      </select>
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `<form>` 이 무엇을 하는지(입력을 모아 `action` 으로 `method` 방식으로 보냄), `name` 이 왜 중요한지 안다.
- `<input>` 을 `type` 별로(text/password/email/number/date/file/checkbox/radio/hidden) 골라 쓸 수 있고,
  `<select>` / `<textarea>` 로 목록·여러 줄 입력을 만들 수 있다.
- **`<label>` + `for`/`id`** 로 라벨을 입력과 연결하고, `required` / `minlength` / `maxlength` / `pattern` 으로
  기본 검증을 붙일 수 있다 — **회원가입 폼을 직접 마크업할 수 있다.**

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 태그·속성. 시맨틱 태그(폼도 보통 `<section>`/`<main>` 안).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 서버로 보냈는데 값이 안 들어온다 → `<input>` 에 `name` 이 없다(`name` 없는 필드는 **전송 안 됨**).
- 라벨을 클릭해도 입력창이 포커스를 안 받는다 → `<label for>` ↔ `<input id>` 연결이 없다.
- 아무 검증 없이 빈 값이 제출된다 → `required` 를 안 붙였다.

폼은 웹에서 **데이터를 받는 유일한 기본 수단**이다. 구조만 잡으면 나머지(JS 검증, 서버 전송)는 그 위에 얹는다.

<!-- section: concept -->
## `<form>` 의 구조

{{code: form-anatomy}}

- `<form action="..." method="post">` — 제출하면 `action` URL 로 입력값을 보낸다.
  `method="get"`(URL 쿼리스트링) vs `method="post"`(본문). 로그인·가입은 `post`.
- `<button type="submit">` (또는 `<input type="submit">`) — 폼 제출. `type="button"` 은 제출 안 함(JS 용).
- **`name`** — 전송될 때의 키. `name="userid"` → 서버는 `userid=입력값` 을 받는다. **`name` 없으면 전송 안 됨.**
- **`<label for="X">` ↔ `<input id="X">`** — 라벨 클릭 시 입력 포커스, 스크린리더가 "무엇을 입력하는지" 읽음.
  (또는 `<label>` 로 `<input>` 을 감싸도 됨)

<!-- section: mechanism -->
## `type` 이 바꾸는 것

{{code: input-types}}

`<input>` 은 `type` 하나로 완전히 다른 위젯이 된다:

- `text` / `password` / `email` / `url` / `tel` / `search` — 한 줄 텍스트. `email` 등은 **형식 검증 + 모바일 키패드**.
- `number` / `range` — 숫자. `min` / `max` / `step`.
- `date` / `time` / `datetime-local` — 날짜·시간 선택 UI.
- `checkbox` — 독립적인 on/off. 여러 개 다중 선택.
- `radio` — **같은 `name` 끼리 하나만** 선택.
- `file` — 파일 선택. `accept="image/*"`.
- `hidden` — 화면엔 없지만 제출 시 값이 함께 감(토큰 등).

`<select><option>` — 드롭다운. `<textarea rows cols>` — 여러 줄. `<fieldset><legend>` — 관련 필드 묶음.

<!-- section: concept | title: 기본 검증 -->
## 브라우저 기본 검증

속성만으로 제출 전 검사가 된다:

- `required` — 비어 있으면 제출 막음
- `minlength` / `maxlength` — 글자 수
- `min` / `max` — 숫자·날짜 범위
- `pattern="[0-9]{3}-[0-9]{4}"` — 정규식
- `type="email"` / `type="url"` — 형식

> **이건 UX 보조일 뿐 보안이 아니다.** 사용자가 개발자도구로 속성을 지우거나 요청을 직접 보낼 수 있으므로
> **서버(또는 JS)에서 반드시 다시 검증**해야 한다. 자세한 서버측 검증은 백엔드 챕터에서.

<!-- section: must_know -->
## 반드시 기억할 것

- **`name` 없는 필드는 전송되지 않는다.** 서버가 받을 키 = `name`.
- **`<label for>` ↔ `<input id>`** 연결은 접근성 필수 (라벨 클릭·스크린리더).
- `radio` 는 같은 `name` 으로 묶어야 "하나만" 이 된다. `checkbox` 는 각자 독립.
- `method="get"` 은 값이 URL 에 노출된다 — 비밀번호·개인정보는 `post`.
- HTML 기본 검증(`required` 등)은 **UX 보조**. 진짜 검증은 JS + 서버.
- 제출 버튼은 `<button type="submit">`. `type` 을 안 쓰면 form 안에서 기본이 `submit` 이라 의도치 않게 제출될 수 있다.

<!-- section: experiment -->
## 직접 해 보기

1. 회원가입 폼을 마크업하라: 아이디(`required`, 4~20자), 비밀번호(`type="password"`, 8자+),
   이메일(`type="email"`), 성별(`radio`), 관심사(`checkbox` 여러 개), 자기소개(`textarea`), 약관동의(`checkbox required`).
   모든 필드에 `<label>` 연결.
2. 빈 값으로 제출을 시도해 브라우저 검증 메시지를 보고, 개발자도구로 `required` 를 지워 우회해 보라
   (→ "그래서 서버 검증이 필요하다").
3. `method="get"` 으로 바꿔 제출하고 주소창에 값이 어떻게 붙는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 서버에 값이 안 들어온다. 가장 먼저 확인할 속성은?
2. `<label>` 을 `<input>` 과 연결하는 두 가지 방법은?
3. `radio` 버튼 3개 중 하나만 선택되게 하려면?
4. `required` 만 믿으면 안 되는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "HTML 폼 검증만으로 충분하지 않은 이유는?"
- "`GET` 과 `POST` 로 폼을 보낼 때의 차이와 선택 기준은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> form 의 action/method, name 의 역할, label-input 연결, radio vs checkbox, 기본 검증이 "보안이 아닌" 이유를
> 각각 한 줄로. 그다음 로그인 폼을 코드 없이 말로 마크업.

<!-- section: review -->
## 한 줄 정리

**`<form>` 은 `name` 붙은 입력들을 모아 `action` 으로 보낸다 — `<input type>` 으로 위젯을 고르고,
`<label for>`↔`id` 로 접근성을 잇고, `required` 등으로 기본 검증을 붙이되 진짜 검증은 서버가 한다.**

<!-- section: next -->
## 다음 Lesson

`html-structure/multimedia` — 이미지·오디오·비디오 넣기.
