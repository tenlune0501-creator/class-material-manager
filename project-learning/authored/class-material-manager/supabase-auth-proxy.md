---
id: class-material-manager/supabase-auth-proxy
project: class-material-manager
title: Supabase 인증 — 서버 클라이언트와 미들웨어 세션
unit_kind: infra
feature_area: 인증
concepts: [Supabase Auth, SSR 쿠키 세션, 미들웨어, 서버 액션, 보호된 라우트]
related_lessons:
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
  - data-and-backend/nodejs-server/middleware
  - react/firebase-integration/auth-email-and-social
---

<!-- section: role -->
## 이 코드가 하는 일

`viewer/lib/supabase/{server,proxy,actions}.ts` + `viewer/proxy.ts` — 이메일/비밀번호 로그인, 쿠키
세션, 요청마다 세션 갱신, 그리고 **모든 화면이 로그인을 요구** 하게 만든다.

<!-- section: where -->
## 코드 위치

- `viewer/lib/supabase/server.ts` — 서버 컴포넌트/액션용 `createClient()` (쿠키 어댑터)
- `viewer/lib/supabase/proxy.ts` — `updateSession(request)` (미들웨어에서 세션 갱신)
- `viewer/proxy.ts` — Next 16 미들웨어 진입점 (`proxy()` 가 `updateSession` 호출)

<!-- section: code -->
## 핵심 코드 읽기

```ts
// viewer/lib/supabase/server.ts — 서버에서 쿠키의 세션을 읽는다 (anon 키만)
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(list) {
        try { for (const { name, value, options } of list) cookieStore.set(name, value, options); }
        catch { /* Server Component 에서는 쓰기 불가 → proxy.ts 가 갱신 담당 */ }
      },
    },
  });
}

// viewer/proxy.ts — 모든 요청 앞단
export async function proxy(request: NextRequest) {
  after(() => checkAndTriggerRefresh());   // 응답 후에 자동 갱신 감지
  return updateSession(request);           // 세션 갱신 + 로그인 강제
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
```

<!-- section: why -->
## 왜 이렇게 나눴나

- 정적 페이지(`/`, `/learn`)는 빌드 때 한 번 만들어져 매 요청마다 서버 코드를 다시 안 돈다 →
  "요청마다 해야 할 일"(세션 갱신, 자동 갱신 감지)은 **미들웨어** 에서 한다.
- Momentalk의 `utils/supabase/{server,middleware}.js` 와 **같은 구조** — 나란히 비교하기 좋다.
- `service_role` 키는 뷰어 런타임에 없다 — anon 키 + RLS SELECT 정책 + GRANT로 4개 테이블만 읽는다.

<!-- section: framework_role -->
## @supabase/ssr + Next 미들웨어 가 대신하는 것

라이브러리가 토큰 파싱·refresh를, 미들웨어가 "모든 라우트 앞에서 1회 실행" 을 제공한다. 개발자는 쿠키
어댑터와 matcher만 쓴다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/baas-supabase-firebase/supabase-in-a-real-project` — SSR 세션·RLS 전체
- `data-and-backend/nodejs-server/middleware` — 미들웨어 개념
- `react/firebase-integration/auth-email-and-social` — 다른 BaaS의 인증과 비교

<!-- section: caution -->
## 주의점

- `matcher` 에서 정적 자산을 제외하지 않으면 미들웨어가 이미지·폰트마다 돌아 느려진다.
- 서버 컴포넌트에서 `setAll` 이 던지는 예외를 흡수하되, **세션 갱신 자체를 포기하면 안 된다** → 미들웨어가 보완.

<!-- section: experiment -->
## 작은 실습

1. 로그아웃 상태로 `/learn` 에 접속해 `/login` 으로 튕기는지 확인하라.
2. `viewer/proxy.ts` 의 `matcher` 를 `["/:path*"]` 로 바꿔 정적 파일 요청에도 미들웨어가 도는지 관찰하라.
3. Momentalk의 `src/utils/supabase/server.js` 와 이 파일의 차이를 정리하라.

<!-- section: check_question -->
## 이해 점검

1. 세션 갱신을 페이지가 아니라 미들웨어에서 하는 이유는?
2. `matcher` 가 하는 일은?
3. 뷰어에 `service_role` 키가 없는데 어떻게 DB를 읽나?

<!-- section: review -->
## 한 줄 정리

**뷰어 인증은 `server.ts`(쿠키로 세션 읽기, anon 키) + `proxy.ts`(모든 요청 앞단 세션 갱신 + 로그인
강제)로 이뤄지며, Momentalk의 같은 패턴과 나란히 놓고 비교할 수 있다.**
