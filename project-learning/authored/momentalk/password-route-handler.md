---
id: momentalk/password-route-handler
project: momentalk
title: 비밀번호 변경 Route Handler — 서버측 검증과 신뢰 경계
unit_kind: feature
feature_area: 인증
concepts: [Route Handler, API, 폼/입력 검증, 인증, 신뢰 경계, 에러 처리]
related_lessons:
  - data-and-backend/nodejs-server/express-rest-api
  - data-and-backend/nodejs-server/error-handling
  - nextjs/data-and-backend/json-as-backend
  - javascript/async-and-http/http-basics
---

<!-- section: role -->
## 이 코드가 하는 일

`src/app/api/auth/password/route.js` — `POST /api/auth/password` **Route Handler**. 로그인한 사용자의
비밀번호를 바꾼다. 핵심은 "클라이언트가 보낸 값을 믿지 않고 서버가 다시 확인" 하는 것. 전체 코드는 실전
예제 `momentalk-password-route-handler`.

<!-- section: flow -->
## 처리 단계

1. 세션에서 현재 사용자 확인. 없으면 **401**.
2. 클라이언트가 보낸 `provider` 를 **믿지 않고** 서버가 Auth 사용자 객체로 `hasEmailProvider` 재확인. 아니면 **403**.
3. 현재 비밀번호 재인증 — 세션 쿠키가 섞이지 않도록 `persistSession: false` 인 **별도 클라이언트** 로 로그인 시도.
4. 새 비밀번호 길이·현재값과 동일 여부 검증. 실패 시 **400**.
5. `supabase.auth.updateUser({ password })`. 예외는 `try/catch` 로 잡아 **500**.

<!-- section: code -->
## 핵심 코드 읽기 (요지)

```js
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();

  // ① 클라이언트 provider 값을 믿지 않는다 — 서버가 user 객체로 판단
  if (!hasEmailProvider(user)) return Response.json({ error: "..." }, { status: 403 });

  // ② 현재 비밀번호 재인증은 세션을 건드리지 않는 별도 클라이언트로
  const check = createRawClient(url, anonKey, { auth: { persistSession: false } });
  const { error: signInErr } = await check.auth.signInWithPassword({ email: user.email, password: currentPassword });
  if (signInErr) return Response.json({ error: "현재 비밀번호가 일치하지 않습니다" }, { status: 400 });

  // ③ 길이·중복 검증 후 갱신
  if (newPassword.length < 8) return Response.json({ error: "..." }, { status: 400 });
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return Response.json({ error: "변경에 실패했습니다" }, { status: 500 });
  return Response.json({ ok: true });
}
```

<!-- section: why -->
## 왜 이렇게 했나

- **신뢰 경계**: 브라우저에서 온 데이터(`provider`, 검증 통과 여부)는 조작될 수 있다. 서버가 **다시** 확인해야 한다.
- 현재 비밀번호 확인용 로그인은 **현재 세션을 덮어쓰면 안 된다** → `persistSession: false` 별도 클라이언트.
- 단계마다 **의미에 맞는 상태 코드**(401 미인증 / 403 권한없음 / 400 잘못된 입력 / 500 서버오류).

<!-- section: framework_role -->
## Next.js Route Handler 가 대신하는 것

`app/api/**/route.js` 의 `export async function POST` 하나로 서버 엔드포인트가 생긴다. Express의
`app.post("/api/...")` 자리이며, 라우팅·요청 파싱은 프레임워크가 한다. 개발자는 검증·권한·응답만 짠다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/nodejs-server/express-rest-api` — REST 엔드포인트
- `data-and-backend/nodejs-server/error-handling` — 상태 코드·에러 처리
- `javascript/async-and-http/http-basics` — 401/403/400/500의 의미

<!-- section: caution -->
## 주의점

- "클라이언트에서 이미 검증했으니 서버는 생략" 은 위험하다 — 클라 검증은 UX, **실제 차단은 서버**.
- 비밀번호·에러 상세를 응답 본문이나 로그에 그대로 남기지 않는다.

<!-- section: experiment -->
## 작은 실습

1. 서버측 `hasEmailProvider` 확인을 지우고, 소셜 로그인 사용자가 이 API를 부를 때 무엇이 뚫리는지 설명하라.
2. `persistSession: false` 를 빼고 현재 비밀번호 확인 후 세션이 어떻게 되는지 예측하라.
3. 각 실패 케이스가 어떤 상태 코드를 반환하는지 표로 정리하라.

<!-- section: check_question -->
## 이해 점검

1. "신뢰 경계" 란 무엇이고, 이 코드에서 어디가 경계인가?
2. 현재 비밀번호 확인에 별도 클라이언트를 쓰는 이유는?
3. 401 / 403 / 400 / 500 을 각각 언제 반환하나?

<!-- section: review -->
## 한 줄 정리

**비밀번호 변경 Route Handler는 클라이언트가 보낸 값을 믿지 않고 서버가 사용자·현재 비밀번호를 다시
확인하며, 단계별로 401/403/400/500 을 반환한다 — "검증은 화면이 아니라 서버에서" 의 실전 코드다.**
