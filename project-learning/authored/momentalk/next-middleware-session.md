---
id: momentalk/next-middleware-session
project: momentalk
title: 미들웨어에서 Supabase 세션 갱신
unit_kind: infra
feature_area: 인증
concepts: [Next.js 미들웨어, 세션 갱신, 쿠키 전파, NextResponse, 라우팅]
related_lessons:
  - data-and-backend/nodejs-server/middleware
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
  - nextjs/routing-and-layout/spa-navigation
---

<!-- section: role -->
## 이 코드가 하는 일

`src/utils/supabase/middleware.js` — **모든 요청이 지나는** 미들웨어에서 `supabase.auth.getUser()` 를
호출해 만료 직전 토큰을 갱신하고, 새 쿠키를 요청과 응답 양쪽에 다시 심는다. `src/proxy.js` 가 이 함수를
부른다. 전체 코드는 실전 예제 `momentalk-next-middleware-session`.

<!-- section: code -->
## 핵심 코드 읽기

```js
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));   // 요청에도
        supabaseResponse = NextResponse.next({ request });                             // 응답 새로 생성
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options));                         // 응답에도
      },
    },
  });

  await supabase.auth.getUser();     // ← 여기서 필요하면 토큰 refresh 가 일어난다
  return supabaseResponse;
}
```

<!-- section: flow -->
## 요청/응답 쿠키가 흐르는 순서

1. 요청이 들어오면 `request.cookies` 에서 현재 세션 쿠키를 읽는다.
2. `getUser()` 가 토큰이 곧 만료면 새 토큰을 발급받는다 → `setAll` 이 불린다.
3. `setAll` 은 **요청 객체와 응답 객체 둘 다** 에 새 쿠키를 심는다.
4. 갱신된 `supabaseResponse` 를 반환 → 브라우저는 새 세션 쿠키를 받는다.

<!-- section: why -->
## 왜 응답 객체를 setAll 안에서 다시 만드나

`NextResponse.next({ request })` 를 새로 만들지 않고 기존 응답에 쿠키만 추가하면, 앞서 설정된 헤더와 섞여
**쿠키가 유실** 될 수 있다. 그래서 쿠키를 심을 때 응답을 새로 생성해 깨끗한 상태에서 다시 쓴다.

<!-- section: framework_role -->
## Next.js 미들웨어가 대신하는 것

미들웨어는 **모든 라우트 앞단** 에서 한 번 실행된다 → "요청마다 세션 확인/갱신" 을 각 페이지에 넣지 않아도
된다. 서버 컴포넌트의 Supabase 클라이언트가 쿠키를 못 쓸 때(앞 Unit) 그 갱신을 여기가 대신한다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/nodejs-server/middleware` — 미들웨어 개념
- `data-and-backend/baas-supabase-firebase/supabase-in-a-real-project` — SSR 세션 전체 그림

<!-- section: caution -->
## 주의점

- 이 자리는 이 저장소(class-material viewer)의 `viewer/proxy.ts` 자동 갱신 트리거와 **같은 위치** 다.
- `getUser()` 를 부르지 않으면 refresh 로직이 돌지 않는다 — "쓸데없는 호출" 처럼 보여도 지워선 안 된다.
- 미들웨어는 자주 실행되므로 무거운 작업(외부 API, DB 조회)을 넣지 않는다.

<!-- section: experiment -->
## 작은 실습

1. `updateSession` 에서 `await supabase.auth.getUser()` 줄을 지우고 로그인 세션이 오래 못 가는지 관찰하라.
2. 응답을 `setAll` 안에서 다시 만들지 않도록 바꿔 보고 어떤 쿠키가 사라지는지 확인하라.
3. `viewer/proxy.ts` 를 열어 이 코드와 "같은 자리에서 무엇을 하는지" 비교하라.

<!-- section: check_question -->
## 이해 점검

1. 세션 갱신을 각 페이지가 아니라 미들웨어에서 하는 이유는?
2. `setAll` 이 쿠키를 요청·응답 양쪽에 심는 이유는?
3. `getUser()` 호출을 지우면 무슨 일이 생기나?

<!-- section: review -->
## 한 줄 정리

**미들웨어는 모든 요청 앞단에서 `getUser()` 로 토큰을 갱신하고 새 쿠키를 요청·응답 양쪽에 전파한다 —
서버 컴포넌트가 못 하는 세션 갱신을 여기가 책임진다.**
