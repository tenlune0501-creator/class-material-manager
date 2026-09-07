---
id: data-and-backend/relational-database-operations/indexes
chapter: data-and-backend/relational-database-operations
title: 인덱스 — 언제 만들고 언제 만들지 않나
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [database, postgres, index, b-tree, performance]
related_material_ids: []
sources:
  - title: "PostgreSQL Documentation — 11.1. Introduction (Indexes)"
    url: https://www.postgresql.org/docs/current/indexes-intro.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "PostgreSQL Documentation — 11.3. Multicolumn Indexes"
    url: https://www.postgresql.org/docs/current/indexes-multicolumn.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "PostgreSQL Documentation — 11.8. Partial Indexes"
    url: https://www.postgresql.org/docs/current/indexes-partial.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/relational-database-operations/postgres-basics-and-dialect
  - data-and-backend/relational-database-operations/constraints-and-referential-integrity
code_examples:
  - slug: create
    title: 인덱스 만들기 / 지우기
    source_type: generated_minimal
    language: sql
    is_canonical: true
    code: |
      -- 인덱스 없으면: WHERE 로 한 행을 찾아도 테이블 전체를 훑는다 (Sequential Scan)
      CREATE INDEX ON post (author_id);              -- 이름 생략 시 자동 명명
      CREATE INDEX idx_post_created ON post (created_at);
      DROP INDEX idx_post_created;

      -- 기본은 B-tree: =, <, <=, >, >=, BETWEEN, IN, ORDER BY 에 쓰인다
      -- 다른 종류(GIN=배열/JSONB/전문검색, GiST=범위/공간 등)는 필요할 때만
  - slug: tradeoff
    title: 읽기 이득 vs 쓰기 비용
    source_type: generated_minimal
    language: text
    code: |
      인덱스 = 책 뒤의 "찾아보기". 있으면 특정 값을 빨리 찾는다.
      대가:
        - INSERT / UPDATE / DELETE 마다 인덱스도 갱신 → 쓰기가 느려진다
        - 저장 공간을 더 쓴다
        - UPDATE 가 인덱스 컬럼을 안 건드려도 (일부 경우) 유지 비용 발생
      => 조회 성능이 필요한 컬럼에만. 안 쓰는 인덱스는 오히려 손해 → 제거.
  - slug: where-to-index
    title: 어디에 거나
    source_type: generated_minimal
    language: sql
    code: |
      -- WHERE 조건, JOIN 의 ON, ORDER BY 에 자주 오는 컬럼
      SELECT * FROM post WHERE author_id = $1;            -- author_id
      SELECT * FROM post ORDER BY created_at DESC LIMIT 20; -- created_at
      SELECT ... FROM post p JOIN member m ON m.id = p.author_id; -- p.author_id (FK — 자동 아님)

      -- 카디널리티(값의 다양성)가 낮으면(예: is_deleted 두 값뿐) 단독 인덱스는 효과가 작다
      -- 아주 작은 테이블은 인덱스가 있어도 Seq Scan 이 더 빠를 수 있다 → 플래너가 판단
  - slug: composite-partial
    title: 복합 인덱스 · 부분 인덱스 · UNIQUE 인덱스
    source_type: generated_minimal
    language: sql
    code: |
      -- 복합(multicolumn): 컬럼 순서가 중요 — 왼쪽부터 접두(prefix)로만 활용된다
      CREATE INDEX ON post (author_id, created_at);
      --  WHERE author_id = ?                         ✅ 사용
      --  WHERE author_id = ? AND created_at > ?      ✅ 사용
      --  WHERE created_at > ?  (author_id 없이)      ❌ 이 인덱스로는 못 씀

      -- 부분(partial): 자주 조회하는 부분집합만 색인 → 인덱스가 작고 빠름
      CREATE INDEX ON post (created_at) WHERE is_deleted = false;

      -- UNIQUE 인덱스: 제약이자 인덱스 (constraints Lesson 의 UNIQUE 와 같은 것)
      CREATE UNIQUE INDEX ON member (lower(email));   -- 표현식 인덱스도 가능
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 인덱스가 없을 때(Sequential Scan) vs 있을 때의 차이를 안다.
- `CREATE INDEX` / `DROP INDEX`, 기본이 **B-tree** 라는 것을 안다.
- **읽기 이득 ↔ 쓰기 비용 trade-off** 로 "어디에 걸고 어디에 안 거나" 를 판단한다.
- **복합 인덱스**(컬럼 순서 = 왼쪽 접두 규칙), **부분 인덱스**, **UNIQUE 인덱스**를 쓴다.
- 안 쓰는 인덱스는 손해이고, FK 컬럼 인덱스는 직접 만들어야 함(앞 Lesson과 연결)을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `postgres-basics-and-dialect`, `constraints-and-referential-integrity`(FK·UNIQUE·자동 인덱스 여부).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

`sql-essentials` 에서 "자주 WHERE에 오는 컬럼엔 인덱스" 라고 한 줄 봤다. 그런데 실제로는:
데이터가 10만 건이 되니 목록 조회가 느려지고, 인덱스를 마구 걸었더니 이번엔 글쓰기가 느려진다.
인덱스는 **거는 것보다 "언제 걸고 언제 안 거나" 를 판단하는 게** 핵심이다.

<!-- section: code | lang: sql -->
## 1. 만들기 / 지우기

{{code: create}}

- 인덱스가 없으면 `WHERE` 로 한 행만 찾아도 **테이블 전체를 훑는다**(Sequential Scan).
- 인덱스 = 정렬된 "찾아보기". 기본은 **B-tree**로 `=`, 부등호, `BETWEEN`, `IN`, `ORDER BY` 에 쓰인다.
- 배열/JSONB/전문검색은 GIN, 범위/공간은 GiST 등 다른 종류가 있으나 필요할 때만.

<!-- section: mechanism -->
## 2. Trade-off

{{code: tradeoff}}

인덱스는 조회를 빠르게 하지만 **`INSERT`/`UPDATE`/`DELETE` 마다 갱신**되고 공간을 더 쓴다.
그래서 "혹시 몰라서" 다 거는 건 손해다. 조회 성능이 실제로 필요한 컬럼에만, 안 쓰는 인덱스는 제거.

<!-- section: concept | title: 어디에 -->
## 3. 어디에 거나

{{code: where-to-index}}

- **`WHERE` 조건 / `JOIN` 의 `ON` / `ORDER BY`** 에 자주 오는 컬럼.
- **FK 컬럼**(Postgres는 자동 아님 — 앞 Lesson).
- 카디널리티가 낮은 컬럼(`is_deleted` 두 값)은 단독 인덱스 효과가 작다.
- **아주 작은 테이블**은 인덱스가 있어도 Seq Scan이 더 빠를 수 있다 → 플래너가 알아서 고른다(다음 Lesson `EXPLAIN`).

<!-- section: concept | title: 복합·부분·UNIQUE -->
## 4. 복합 · 부분 · UNIQUE

{{code: composite-partial}}

- **복합 인덱스**: 컬럼 순서가 중요하다. `(author_id, created_at)` 은 `author_id` 부터 시작하는 조건에만 쓰인다
  (왼쪽 접두 규칙).
- **부분 인덱스**: `WHERE is_deleted = false` 처럼 자주 쓰는 부분집합만 색인 → 인덱스가 작고 빠르다.
- **UNIQUE 인덱스**: 제약이자 인덱스. 표현식 인덱스(`lower(email)`)도 가능.

<!-- section: must_know -->
## 반드시 기억할 것

- 인덱스 없으면 **Sequential Scan**(전체 훑기). 인덱스는 정렬된 찾아보기, 기본 **B-tree**.
- **읽기 빠름 ↔ 쓰기 느림 + 공간.** "혹시 몰라" 다 걸지 않는다. 안 쓰는 인덱스는 제거.
- 대상: `WHERE` / `JOIN ON` / `ORDER BY` 자주 오는 컬럼, **FK 컬럼**(수동).
- **복합 인덱스는 컬럼 순서 = 왼쪽 접두**. `(a, b)` 는 `a` 없는 조건엔 안 쓰인다.
- **부분 인덱스**로 자주 쓰는 부분집합만 색인. UNIQUE 인덱스 = 제약 + 인덱스. 표현식 인덱스 가능.
- 작은 테이블·낮은 카디널리티는 인덱스 효과가 작다 — 실제 사용 여부는 `EXPLAIN` 으로 확인(다음 Lesson).

<!-- section: experiment -->
## 직접 해 보기

1. `post` 테이블에 더미 10만 행을 넣고, `WHERE author_id = 1` 을 인덱스 없이 실행 시간 측정 → `CREATE INDEX` 후 다시.
2. 그 테이블에 인덱스를 5개 걸고 대량 `INSERT` 시간을, 인덱스 1개일 때와 비교하라.
3. `(author_id, created_at)` 복합 인덱스를 만들고 `WHERE created_at > ?` (author_id 없이)가 이 인덱스를 못 쓰는 것을 `EXPLAIN` 으로 확인(다음 Lesson 미리보기).
4. 부분 인덱스 `WHERE is_deleted = false` 를 만들고 인덱스 크기를 전체 인덱스와 비교하라(`\di+`).
5. `CREATE UNIQUE INDEX ON member (lower(email))` 로 대소문자 무시 이메일 중복을 막아 보라.
6. 100행짜리 작은 테이블에서 인덱스가 있어도 플래너가 Seq Scan을 고르는지 관찰하라.

<!-- section: check_question -->
## 이해 점검

1. 인덱스가 없으면 `WHERE id = 5` 는 어떻게 동작하나?
2. 인덱스를 많이 걸면 무엇이 느려지나? 왜?
3. `CREATE INDEX ON t (a, b)` 는 `WHERE b = ?` 조건에 쓰이나? 이유는?
4. 부분 인덱스는 어떤 상황에서 이득인가?
5. 인덱스를 걸었는데 플래너가 Seq Scan을 골랐다. 이상한 일인가?

<!-- section: interview_question -->
## 면접 대비

- "인덱스의 트레이드오프를 읽기/쓰기/공간 관점에서 설명해 주세요."
- "복합 인덱스의 컬럼 순서를 어떻게 정하나요? (왼쪽 접두 규칙)"
- "부분 인덱스와 표현식 인덱스는 각각 언제 유용한가요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 인덱스 없으면 Seq Scan, B-tree 기본, 읽기 이득↔쓰기·공간 비용, WHERE/JOIN/ORDER BY + FK 컬럼,
> 복합=왼쪽 접두, 부분 인덱스, 작은 테이블은 효과 작음을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**인덱스는 `WHERE`/`JOIN`/`ORDER BY`·FK 컬럼의 조회를 Sequential Scan에서 벗어나게 하지만 쓰기와 공간을
대가로 하므로 필요한 곳에만 걸고 안 쓰는 것은 지운다 — 복합 인덱스는 컬럼 순서(왼쪽 접두)가, 부분 인덱스는
자주 쓰는 부분집합만 색인하는 것이 핵심이다.**
