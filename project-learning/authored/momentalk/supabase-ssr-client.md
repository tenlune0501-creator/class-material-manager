---
id: momentalk/supabase-ssr-client
project: momentalk
title: Supabase 서버 클라이언트 — 쿠키 어댑터로 세션 읽기
unit_kind: infra
feature_area: 인증
concepts: [Supabase 연동, SSR, 쿠키 어댑터, createServerClient, 인증 세션]
related_lessons:
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
  - nextjs/routing-and-layout/layout-and-page
  - data-and-backend/backend-integration/frontend-to-webserver-db
---

<!-- section: role -->
## 이 코드가 하는 일

`src/utils/supabase/server.js` — 서버 컴포넌트/서버 액션에서 쓰는 Supabase 클라이언트를 만든다.
`@supabase/ssr` 의 `createServerClient` 에 Next의 `cookies()` 를 어댑터로 물려, 요청 쿠키에 담긴 로그인
세션을 읽는다. 전체 코드는 실전 예제 `momentalk-supabase-ssr-client`.

<!-- section: code -->
## 핵심 코드 읽기

```js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,     // ← anon 키만. service_role 아님
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // 서버 컴포넌트에서 호출된 경우 무시 — 세션 갱신은 미들웨어가 담당
          }
        },
      },
    },
  );
};
```

<!-- section: why -->
## 왜 이렇게 했나

- SSR에서는 브라우저 `localStorage` 를 못 쓴다 → **세션이 쿠키에 있다.** Supabase 클라이언트에 "쿠키 읽고 쓰는 법"을 어댑터로 알려 줘야 한다.
- 서버 컴포넌트는 응답 쿠키를 못 쓸 때가 있다 → `setAll` 의 `try/catch` 로 흡수하고, **실제 갱신은 미들웨어에 맡긴다**(다음 Unit).
- **anon 키만** 넘긴다. `service_role` 키는 RLS를 우회하므로 클라이언트 코드 경로에 절대 두지 않는다.

<!-- section: framework_role -->
## @supabase/ssr 가 대신하는 것

토큰 파싱·만료 확인·refresh 요청을 라이브러리가 한다. 개발자는 "쿠키를 어떻게 읽고 쓰는가"(getAll/setAll)만
환경(Next)에 맞게 제공한다. 그래서 같은 라이브러리가 Next·SvelteKit·Remix에서 어댑터만 바꿔 쓰인다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/baas-supabase-firebase/supabase-in-a-real-project` — SSR 세션·RLS
- `data-and-backend/backend-integration/frontend-to-webserver-db` — 프론트가 DB에 붙는 경로

<!-- section: caution -->
## 주의점

- 이 프로젝트의 `viewer/lib/supabase/server.ts` 와 **거의 같은 구조** 다 — 두 코드를 나란히 놓고 비교해 보라.
- `NEXT_PUBLIC_` 접두사는 "브라우저에도 노출됨" 을 뜻한다. anon 키는 그래도 되지만 service_role은 절대 안 된다.
- `cookies()` 는 `await` 해야 한다(이 버전의 Next).

<!-- section: experiment -->
## 작은 실습

1. `createClient()` 로 서버 컴포넌트에서 `supabase.auth.getUser()` 를 호출해 로그인 여부를 찍어 보라.
2. `setAll` 의 `try/catch` 를 `try` 없이 바꿔 서버 컴포넌트에서 어떤 에러가 나는지 확인하라.
3. `viewer/lib/supabase/server.ts` 와 이 파일의 차이(있다면)를 목록으로 정리하라.

<!-- section: check_question -->
## 이해 점검

1. SSR에서 세션이 `localStorage` 가 아니라 쿠키에 있는 이유는?
2. `getAll`/`setAll` 어댑터가 하는 일은?
3. 왜 anon 키만 넘기고 service_role은 안 되는가?

<!-- section: review -->
## 한 줄 정리

**서버용 Supabase 클라이언트는 `createServerClient` 에 Next `cookies()` 를 getAll/setAll 어댑터로 물려 요청
쿠키의 세션을 읽으며, anon 키만 쓰고 실제 세션 갱신은 미들웨어에 맡긴다.**
