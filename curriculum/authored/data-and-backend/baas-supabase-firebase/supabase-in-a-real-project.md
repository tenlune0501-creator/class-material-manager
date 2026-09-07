---
id: data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
chapter: data-and-backend/baas-supabase-firebase
title: 실제 프로젝트에서 Supabase 쓰기
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [supabase, ssr, auth, postgrest, rls, database]
related_material_ids:
  - 1NFB5KVAZTGy2GEmVAD80IGTl2xC5wpFh8kiGrPETHzY   # supabase - 프로젝트 이관 (CLI dump/restore)
sources:
  - title: "Supabase — Server-Side Auth for Next.js"
    url: https://supabase.com/docs/guides/auth/server-side/nextjs
    publisher: "Supabase"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "PostgREST — Resource Embedding"
    url: https://docs.postgrest.org/en/stable/references/api/resource_embedding.html
    publisher: "PostgREST"
    checked_at: 2026-09-07
    source_type: official_docs
project_links:
  - unit: momentalk/supabase-ssr-client
    note: 쿠키 어댑터로 서버에서 세션을 읽는 createServerClient
  - unit: momentalk/community-crud-embed
    note: PostgREST embed 조인으로 게시판 조회를 한 번에
prerequisites:
  - data-and-backend/baas-supabase-firebase/firebase-vs-supabase
  - nextjs/routing-and-layout/layout-and-page
code_examples:
  - slug: ssr-client
    title: 서버용 클라이언트 — 쿠키 어댑터로 세션 읽기
    source_type: user_project
    project_example_id: momentalk-supabase-ssr-client
    language: ts
  - slug: embed-join
    title: PostgREST embed — 조인을 한 번의 select 로
    source_type: user_project
    project_example_id: momentalk-community-crud-embed
    language: ts
  - slug: rls
    title: RLS — 실제 접근 제어는 여기서
    source_type: generated_minimal
    language: sql
    code: |
      alter table posts enable row level security;   -- 켜면 정책 없이는 전부 거부

      create policy "read all" on posts
        for select using (true);
      create policy "insert own" on posts
        for insert with check (auth.uid() = user_id);
      create policy "modify own" on posts
        for update using (auth.uid() = user_id);
      create policy "delete own" on posts
        for delete using (auth.uid() = user_id);
      -- 클라 SDK 가 DB 에 직접 붙으므로, 이 정책이 없으면 누구나 남의 글을 지울 수 있다.
  - slug: migrate
    title: 프로젝트 이관 — CLI dump / restore
    source_type: generated_minimal
    language: text
    code: |
      # 기존 프로젝트에서 3개 백업 (Connect > Session pooler URL 사용)
      supabase db dump --db-url "$OLD_DB_URL" -f roles.sql  --role-only
      supabase db dump --db-url "$OLD_DB_URL" -f schema.sql
      supabase db dump --db-url "$OLD_DB_URL" -f data.sql   --use-copy --data-only

      # 새 프로젝트에 복원 (Region/Postgres 버전/확장을 맞춰 두면 안전)
      psql --single-transaction -v ON_ERROR_STOP=1 \
        --file schema.sql \
        --command "SET session_replication_role = replica" \
        --file data.sql \
        --dbname "$NEW_DB_URL"
      # 이후: Storage 복사 · Edge Functions 재배포 · Auth/OAuth 재설정
      # 비밀번호에 특수문자가 있으면 URL 인코딩(@→%40, !→%21 …)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 토이 CRUD를 넘어 **실제 프로젝트에서 Supabase를 쓸 때** 신경 쓰는 것들을 안다.
- **SSR(Next.js)** 에서 쿠키 기반 세션을 읽는 서버 클라이언트 구조를 이해한다.
- **PostgREST embed**(중첩 select)로 조인을 한 번에 처리해 N+1을 피한다.
- **RLS**가 실제 접근 제어의 최종 책임임을 안다.
- **프로젝트 이관**(CLI `db dump` / `psql` restore)의 흐름을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Firebase vs Supabase(→ 앞 Lesson), Next.js 레이아웃/서버 컴포넌트, 기본 SQL·JOIN.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

예제 수준의 `supabase.from("posts").select()` 는 잘 된다. 그런데 실제 앱에서는:

- **SSR**: 서버 컴포넌트에서 "지금 로그인한 사람" 을 알아야 하는데 브라우저 SDK로는 안 된다.
- **조인**: 목록에 작성자·태그·좋아요 수를 함께 보여주려면 테이블마다 왕복(N+1)하게 된다.
- **보안**: 클라 SDK가 DB에 직접 붙으므로, 클라 코드로는 남의 데이터 수정을 못 막는다.
- **이전**: 계정/조직을 옮기거나 백업하려는데 콘솔에 "복사" 버튼이 없다.

<!-- section: concept -->
## 1. SSR — 쿠키 어댑터 서버 클라이언트

{{code: ssr-client}}

- Next.js 서버 컴포넌트/서버 액션에서는 `@supabase/ssr` 의 `createServerClient` 에
  Next의 `cookies()` 를 **`getAll`/`setAll` 어댑터**로 물린다 → 요청 쿠키의 로그인 세션을 서버에서 읽는다.
- 서버 컴포넌트에서 쿠키 **쓰기**가 막히는 경우가 있어 `try/catch` 로 흡수하고, 세션 갱신은
  **미들웨어**에 맡기는 게 표준 패턴이다.
- 이 프로젝트(class-material viewer)의 `viewer/lib/supabase/server.ts` 와 거의 같은 구조다 — 비교해 보라.

<!-- section: mechanism -->
## 2. PostgREST embed — 조인 한 번에

{{code: embed-join}}

- Supabase의 REST는 **PostgREST**다. `select("*, boards(name), profiles(nickname), tags(name)")` 처럼
  **중첩 select** 로 연관 테이블을 한 응답에 담아 온다(FK 기준). → 목록 하나에 테이블 5개를 왕복하던 게 1번으로.
- 관계는 결과에서 **배열 또는 객체**로 올 수 있어(1:1 vs 1:N), `mapPost` 처럼 화면용 형태로 정규화하는 계층을 둔다.
- 조인·형변환을 **데이터 접근 함수(`getCommunityPosts` 등)에 모으고**, 컴포넌트는 그 결과만 쓴다.

<!-- section: concept | title: RLS -->
## 3. RLS — 접근 제어의 최종 책임

{{code: rls}}

- 테이블에 `enable row level security` 를 켜면 **정책이 없는 한 전부 거부**된다.
- `select`/`insert`/`update`/`delete` 별로 `using` / `with check` 조건을 SQL로 쓴다. `auth.uid()` 가 현재 사용자.
- **클라이언트에서 버튼을 숨기거나 라우트를 막는 건 UX일 뿐** — SDK를 직접 호출하면 우회된다.
  실제 차단은 이 RLS 정책이 한다. (Firebase 보안 규칙과 같은 역할, 문법이 SQL.)

<!-- section: concept | title: 이관 -->
## 4. 프로젝트 이관 (백업/복원)

{{code: migrate}}

- `supabase db dump` 로 **roles / schema / data** 3개 파일을 뽑고, 새 프로젝트에 `psql` 로 순서대로 복원.
- 연결은 **Session pooler URL**(Connect 메뉴)을 쓰는 게 DNS/네트워크 이슈가 적다.
- DB 외에 **Storage 파일·Edge Functions·Auth/OAuth 설정**은 따로 옮겨야 한다(자동 아님).
- 이건 학습용 최소 절차다. 무중단 이전·대용량은 별도 전략이 필요하다.

<!-- section: must_know -->
## 반드시 기억할 것

- SSR에서 세션은 **`createServerClient` + `cookies()` 어댑터**로 읽고, 갱신은 미들웨어에.
- 목록에 연관 데이터가 필요하면 **PostgREST embed(중첩 select)** 로 한 번에. 조인·형변환은 접근 함수에 모은다.
- **RLS가 실제 접근 제어**다. `enable row level security` + 작업별 정책. 클라 가드는 UX.
- `auth.uid()` = 현재 사용자. `with check`(insert) / `using`(select·update·delete).
- 이관: `supabase db dump`(roles/schema/data) → `psql` restore. Storage·Functions·Auth는 별도.
- Supabase의 anon key는 클라에 노출되는 식별자 — 방어는 RLS.

<!-- section: experiment -->
## 직접 해 보기

1. Next.js 앱에 `@supabase/ssr` 로 서버용 클라이언트를 만들고, 서버 컴포넌트에서 `supabase.auth.getUser()` 로 로그인 유저를 찍어라.
2. `posts` + `profiles`(작성자) + `tags` 를 `select("*, profiles(nickname), tags(name)")` embed 로 한 번에 조회하라.
3. 관계 결과가 객체/배열로 오는 두 경우를 만들어 보고, 정규화 함수(`getSingleRelation` 같은)를 작성하라.
4. `posts` 에 RLS를 켜고 정책 없이 조회가 막히는 걸 확인한 뒤, 4개 정책을 추가하라.
5. 로그아웃 상태(또는 다른 uid)로 남의 글 `update` 를 시도해 RLS가 막는지 확인하라.
6. `supabase db dump` 로 schema/data 를 뽑아 로컬 파일로 저장해 보라(복원은 새 프로젝트가 있으면).

<!-- section: check_question -->
## 이해 점검

1. 서버 컴포넌트에서 브라우저용 Supabase 클라이언트를 쓰면 왜 로그인 유저를 못 읽나?
2. 목록에 작성자·태그를 붙이는데 테이블마다 왕복하는 걸 어떻게 피하나?
3. `enable row level security` 를 켜고 정책을 안 만들면?
4. `RequireAuth` 라우트 가드만으로 데이터가 보호되지 않는 이유는?
5. Supabase 프로젝트를 옮길 때 DB 외에 따로 챙겨야 하는 것 3가지는?

<!-- section: interview_question -->
## 면접 대비

- "Next.js SSR에서 Supabase 인증 세션을 어떻게 다루나요? (쿠키·미들웨어)"
- "PostgREST의 resource embedding으로 N+1을 어떻게 줄이나요?"
- "RLS 정책 설계 시 select/insert/update/delete를 어떻게 나눠 작성하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> SSR = createServerClient + cookies 어댑터(+미들웨어 갱신), embed 중첩 select로 조인 1회,
> RLS가 실제 접근 제어(enable + 작업별 정책, auth.uid()), 이관은 db dump→psql + Storage/Functions/Auth 별도.

<!-- section: review -->
## 한 줄 정리

**실전 Supabase는 SSR 세션(쿠키 어댑터 서버 클라이언트 + 미들웨어), 연관 데이터는 PostgREST embed로 한 번에,
접근 제어는 클라 코드가 아니라 RLS 정책(`auth.uid()`)이 담당하며, 프로젝트 이전은 `supabase db dump` →
`psql` 복원 + Storage·Functions·Auth 별도 이관이다.**
