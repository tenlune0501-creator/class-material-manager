---
id: momentalk/community-crud-embed
project: momentalk
title: 게시판 조회 — PostgREST embed 조인 + 행 매핑
unit_kind: data_model
feature_area: 커뮤니티
concepts: [Supabase CRUD, PostgREST embed 조인, N+1 회피, 데이터 매핑, 게시판]
related_lessons:
  - data-and-backend/data-modeling/erd
  - data-and-backend/relational-database-operations/constraints-and-referential-integrity
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
  - data-and-backend/data-modeling/sql-essentials
---

<!-- section: role -->
## 이 코드가 하는 일

`src/lib/communityQueries.js` (39–99행) — 커뮤니티 글 목록/상세를 그릴 때 `posts` 와 연관 테이블
(`boards` · `profiles` · `post_tags` · `tags` · `post_likes`)을 **한 번의 쿼리로** 가져온다. 전체 코드는
실전 예제 `momentalk-community-crud-embed`.

<!-- section: code -->
## 핵심 코드 읽기

```js
// PostgREST embed: 중첩 select 문자열 하나로 여러 테이블을 조인해 가져온다
export const POST_SELECT = `
  id, title, content, created_at,
  board:boards ( id, name, slug ),
  author:profiles ( id, nickname, avatar_url ),
  post_tags ( tags ( id, name ) ),
  post_likes ( user_id )
`;

const rows = await supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false });

// 조인 결과를 화면용 형태로 변환. 관계가 배열/객체 어느 쪽으로 와도 정규화한다.
function getSingleRelation(rel) {
  return Array.isArray(rel) ? (rel[0] ?? null) : (rel ?? null);
}
function mapPost(row) {
  return {
    id: row.id,
    title: row.title,
    board: getSingleRelation(row.board),
    author: getSingleRelation(row.author),
    tags: (row.post_tags ?? []).map(pt => pt.tags).filter(Boolean),
    likeCount: (row.post_likes ?? []).length,
  };
}
```

<!-- section: why -->
## 왜 이렇게 했나

- 글 20개마다 작성자·게시판·태그를 따로 조회하면 요청이 **20 + 20 + …** 로 폭발한다(**N+1 문제**).
  embed 조인은 **한 번** 에 가져온다.
- DB 응답은 관계가 배열(`post_tags`) 또는 객체(`board`)로 온다 → `getSingleRelation`/`.map` 으로 **화면이
  기대하는 모양** 으로 통일한다(매핑 계층).
- `POST_SELECT` 를 상수로 빼면 목록·상세가 같은 필드를 쓴다.

<!-- section: framework_role -->
## PostgREST / Supabase 가 대신하는 것

`supabase.from("posts").select("...board:boards(...)...")` 문자열이 서버에서 SQL JOIN으로 번역된다.
개발자는 SQL을 직접 쓰지 않고 **필요한 필드 트리** 만 적는다. RLS 정책이 각 테이블에 걸려 있으면 조인
결과도 그 정책을 통과한 행만 온다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/data-modeling/erd`, `.../relational-database-operations/constraints-and-referential-integrity` — 관계·FK
- `data-and-backend/data-modeling/sql-essentials` — JOIN의 원리
- `data-and-backend/baas-supabase-firebase/supabase-in-a-real-project` — Supabase 실전

<!-- section: caution -->
## 주의점

- embed는 편하지만 깊은 중첩·큰 목록은 응답이 커진다 — 페이지네이션(`range`)과 함께 쓴다.
- 관계 이름(`board:boards`)의 alias와 FK 방향을 헷갈리면 빈 결과가 온다.

<!-- section: experiment -->
## 작은 실습

1. `POST_SELECT` 에서 `post_likes` 를 빼고 `likeCount` 가 어떻게 되는지 확인하라.
2. 같은 조회를 embed 없이 "글 조회 → 작성자 조회 반복" 으로 짰을 때 요청 수를 세어 보라.
3. `getSingleRelation` 을 없애고 `row.board.name` 을 바로 쓰면 언제 터지는지 설명하라.

<!-- section: check_question -->
## 이해 점검

1. N+1 문제란 무엇이고, embed가 어떻게 푸나?
2. `mapPost` 같은 매핑 계층이 필요한 이유는?
3. embed 조인 결과에도 RLS가 적용되나?

<!-- section: review -->
## 한 줄 정리

**PostgREST embed는 중첩 select 문자열 하나로 여러 테이블을 한 번에 조인해 N+1을 피하고, `mapPost` 가 그
결과를 화면용 형태로 정규화한다 — Supabase로 CRUD를 짤 때 조인과 형변환을 어디서 하는지 보여준다.**
