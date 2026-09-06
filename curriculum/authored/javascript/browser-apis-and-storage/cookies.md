---
id: javascript/browser-apis-and-storage/cookies
chapter: javascript/browser-apis-and-storage
title: 쿠키 생성·조회·삭제
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [javascript, cookie, browser]
related_material_ids:
  - 1E0tcY8QGdPaPoXa5BPB8P3--7p30oDvxX2XCbo-XOzQ   # 쿠키활용하기 - 생성, 제거하기
  - 1-FMIiz7J0AcovsslpBhOT_OBhbBeNbmC              # cookie_final_v202605.zip
prerequisites:
  - javascript/objects-and-builtins/builtin-objects
code_examples:
  - slug: create
    title: 생성 — document.cookie 에 한 줄씩
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // document.cookie 에 "이름=값; 옵션..." 을 대입하면 한 개가 추가/갱신된다 (덮어쓰기 아님)
      const exp = new Date();
      exp.setMinutes(exp.getMinutes() + 1);        // 1분 뒤 만료
      document.cookie = `popup=hide; Expires=${exp.toUTCString()}; Path=/; SameSite=Lax`;

      // Expires(또는 Max-Age) 없으면 = 세션 쿠키 (브라우저 닫으면 사라짐)
      document.cookie = "theme=dark; Path=/";
  - slug: read
    title: 조회 — 전체 문자열을 파싱
    source_type: generated_minimal
    language: js
    code: |
      document.cookie;   // "popup=hide; theme=dark"  ← 옵션은 안 보이고 이름=값만, 세미콜론 구분

      function getCookie(name) {
        return document.cookie
          .split("; ")
          .find((row) => row.startsWith(name + "="))
          ?.split("=")[1];
      }
      getCookie("theme");           // "dark"
      document.cookie.includes("popup=hide");   // 간단 확인용
  - slug: delete
    title: 삭제 — 만료일을 과거로
    source_type: generated_minimal
    language: js
    code: |
      // 삭제 API 는 없다. 같은 이름 + Path 로 만료일을 과거로 다시 쓰면 사라진다.
      document.cookie = "popup=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/";
      // Path 가 생성 때와 다르면 안 지워진다 → 만들 때 쓴 Path 를 그대로.
  - slug: popup
    title: 하루 안 보기 팝업
    source_type: generated_minimal
    language: js
    code: |
      const dialog = document.querySelector("#popup");     // <dialog>
      if (document.cookie.includes("popupHidden=1")) {
        dialog.close();
      } else {
        dialog.showModal();
      }
      document.querySelector("#hideToday").addEventListener("change", (e) => {
        if (e.target.checked) {
          const t = new Date();
          t.setDate(t.getDate() + 1);
          document.cookie = `popupHidden=1; Expires=${t.toUTCString()}; Path=/`;
        }
      });
  - slug: httponly-note
    title: 인증에 쓰는 쿠키는 JS 가 만지지 않는다
    source_type: generated_minimal
    language: text
    code: |
      # 로그인 세션 쿠키는 서버가 Set-Cookie 응답 헤더로 내려주며
      #   HttpOnly (JS 접근 불가) · Secure (HTTPS 만) · SameSite 를 붙인다.
      # → document.cookie 로 만드는 쿠키는 "팝업 숨김, 테마" 같은 비민감 값에만.
      # 이 Lesson 은 개념 이해까지. 실제 인증 쿠키 설계는 백엔드/인증 Lesson 범위.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 쿠키가 **작은 이름=값 조각**이고 브라우저가 저장하며 **매 요청 헤더에 실려 간다**는 것을 안다.
- `document.cookie` 로 생성(옵션: `Expires`/`Max-Age`, `Path`, `SameSite`, `Secure`), 조회(문자열 파싱), 삭제(만료일 과거)를 한다.
- 세션 쿠키 vs 만료일 있는 쿠키를 구분한다.
- "하루 안 보기" 팝업을 쿠키로 구현한다.
- **인증용 쿠키는 서버가 `HttpOnly` 로 관리**하며 JS 로 만지지 않는다는 경계를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 문자열 메서드(`split`/`includes`), `Date` 객체, DOM.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `document.cookie = "a=1"` 이 기존 쿠키를 다 지우는 줄 안다(사실은 한 개만 추가).
- 조회하면 옵션까지 나올 줄 알았다가 `이름=값` 만 나와 당황한다.
- 삭제가 안 된다 — 만들 때와 다른 `Path` 로 지우려 해서.
- 민감한 토큰을 `document.cookie` 에 넣는다.

<!-- section: concept -->
## 쿠키란

- 이름·값과 만료일·경로 등 옵션을 가진 **작은 데이터 조각**. 도메인별로 브라우저에 저장.
- 특징: 해당 도메인으로 가는 **모든 HTTP 요청 헤더에 자동 첨부**된다(그래서 크기 제한 ~4KB, 많으면 요청이 무거워짐).
- 세션(서버 저장)과 대비: 쿠키는 클라이언트 저장, 만료 직접 설정, 자동 로그인·팝업 숨김·장바구니 유지 등에.

{{code: create}}

<!-- section: mechanism -->
## 조회와 삭제

{{code: read}}

- `document.cookie` 는 **현재 도메인의 쿠키를 `이름=값; 이름=값` 문자열**로 준다. `Expires`·`Path` 같은 옵션은 안 보인다.
- 특정 쿠키를 꺼내려면 `split("; ")` 후 찾기.

{{code: delete}}

- 삭제 함수는 없다. **같은 이름 + 같은 Path** 로 만료일을 과거로 다시 쓰면 브라우저가 제거한다.

### 실전 — 팝업

{{code: popup}}

- 첫 방문이면 모달을 열고, "하루 안 보기" 체크 시 1일짜리 쿠키를 심는다. 다음 방문 땐 쿠키를 보고 닫는다.

### 보안 경계

{{code: httponly-note}}

- 로그인 세션 같은 민감 쿠키는 **서버가 `Set-Cookie` 응답 헤더로** 내려주고 `HttpOnly`(JS 접근 차단)·`Secure`·`SameSite` 를 붙인다.
- 그래서 `document.cookie` 로 다루는 값은 **비민감**(테마, 팝업 숨김)에 한정한다. 실제 인증 쿠키 설계는 이 Lesson 범위 밖(백엔드/인증에서).

<!-- section: must_know -->
## 반드시 기억할 것

- `document.cookie = "이름=값; ..."` = **한 개 추가/갱신**(전체 교체 아님).
- 옵션: `Expires`/`Max-Age`(없으면 세션), `Path`(범위, 좁을수록 안전), `SameSite`, `Secure`.
- 조회는 `이름=값; ...` 문자열 파싱. 삭제는 **같은 이름+Path 로 만료일 과거**.
- 쿠키는 매 요청 헤더에 실린다 → 작게, 꼭 필요한 것만.
- 인증 쿠키는 서버가 `HttpOnly` 로. JS 로 만드는 쿠키는 비민감 값만.

<!-- section: experiment -->
## 직접 해 보기

1. 쿠키 3개를 만들고 개발자도구 Application → Cookies 에서 이름/값/Expires/Path 확인.
2. `document.cookie` 를 출력해 옵션이 안 보이는 것 확인.
3. 하나를 만료일 과거로 지우고, 일부러 다른 `Path` 로 시도해 안 지워지는 것 관찰.
4. `<dialog>` 로 "하루 안 보기" 팝업 완성. 체크 후 새로고침 → 안 뜨는지 확인.

<!-- section: check_question -->
## 이해 점검

1. `document.cookie = "a=1"` 을 두 번(다른 이름) 실행하면 쿠키는 몇 개?
2. `document.cookie` 로 조회하면 무엇이 보이고 무엇이 안 보이나?
3. 쿠키를 지우는 방법은? 안 지워질 때 흔한 원인은?
4. 로그인 토큰을 `document.cookie` 에 저장하면 안 되는 이유는?

<!-- section: review -->
## 한 줄 정리

**쿠키는 매 요청에 실려 가는 작은 이름=값 조각으로, `document.cookie` 에 한 줄씩 써서 만들고(옵션 `Expires`/`Path`),
조회는 문자열 파싱·삭제는 만료일을 과거로 — 인증 쿠키는 서버가 `HttpOnly` 로 관리하니 JS 는 비민감 값만 다룬다.**

<!-- section: next -->
## 다음 Lesson

`browser-apis-and-storage/local-storage` — 더 쓰기 편한 클라이언트 저장소.
