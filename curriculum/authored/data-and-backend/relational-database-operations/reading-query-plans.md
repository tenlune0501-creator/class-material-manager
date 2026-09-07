---
id: data-and-backend/relational-database-operations/reading-query-plans
chapter: data-and-backend/relational-database-operations
title: 쿼리 플랜 읽기 — EXPLAIN
mastery: understand
lesson_kind: lesson
estimated_minutes: 40
tags: [database, postgres, explain, query-plan, performance]
related_material_ids: []
sources:
  - title: "PostgreSQL Documentation — 14.1. Using EXPLAIN"
    url: https://www.postgresql.org/docs/current/using-explain.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "PostgreSQL Documentation — 14.2. Statistics Used by the Planner"
    url: https://www.postgresql.org/docs/current/planner-stats.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/relational-database-operations/constraints-and-referential-integrity
  - data-and-backend/relational-database-operations/indexes
code_examples:
  - slug: explain
    title: EXPLAIN vs EXPLAIN ANALYZE
    source_type: generated_minimal
    language: sql
    is_canonical: true
    code: |
      -- 실행하지 않고 "계획"만 (추정치)
      EXPLAIN SELECT * FROM post WHERE author_id = 42;

      -- 실제로 실행하고 "계획 + 실측치"
      EXPLAIN ANALYZE SELECT * FROM post WHERE author_id = 42;
      -- ⚠️ ANALYZE 는 쿼리를 진짜 실행한다 → UPDATE/DELETE 는 트랜잭션 안에서 ROLLBACK 하거나 주의

      EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...;   -- 옵션 조합
  - slug: read-line
    title: 플랜 한 줄 읽기
    source_type: generated_minimal
    language: text
    code: |
      Index Scan using idx_post_author on post  (cost=0.29..8.31 rows=3 width=44)
                                                       │        │      │        └ 한 행 평균 바이트
                                                       │        │      └ 반환할 행 수 "추정"
                                                       │        └ 이 노드까지의 총 예상 비용(임의 단위)
                                                       └ 첫 행을 내놓기까지의 예상 비용
      EXPLAIN ANALYZE 를 붙이면 뒤에:
        (actual time=0.02..0.05 rows=3 loops=1)  ← 실제 시간(ms)·실제 행 수·반복 횟수
      추정 rows 와 actual rows 가 크게 다르면 통계가 낡음 → ANALYZE <table>;
  - slug: scan-types
    title: 스캔·조인 노드 종류
    source_type: generated_minimal
    language: text
    code: |
      Seq Scan          테이블 전체를 순서대로 읽음 (인덱스 없음 / 큰 비율을 읽음 / 작은 테이블)
      Index Scan        인덱스로 위치를 찾아 테이블 행을 가져옴 (선택도 높을 때)
      Index Only Scan   필요한 컬럼이 전부 인덱스에 있어 테이블을 안 봄 (가장 빠름)
      Bitmap Heap Scan  인덱스로 후보를 모아 정렬 후 한 번에 테이블 읽기 (중간 선택도)

      Nested Loop       한쪽을 돌며 다른쪽을 반복 조회 (작은 쪽 + 인덱스 있을 때 유리)
      Hash Join         한쪽으로 해시 테이블을 만들고 다른쪽을 훑음 (큰 두 집합, 등호 조인)
      Merge Join        양쪽을 정렬해 훑으며 병합 (양쪽이 이미 정렬돼 있을 때)
  - slug: workflow
    title: 느린 쿼리 진단 흐름
    source_type: generated_minimal
    language: text
    code: |
      1) EXPLAIN ANALYZE 로 실제로 느린 노드를 찾는다 (actual time 이 큰 곳)
      2) Seq Scan 인데 조건이 선택적이면 → 인덱스 후보
      3) 추정 rows ≠ actual rows 크게 → ANALYZE <table> 로 통계 갱신
      4) 인덱스를 만들고 EXPLAIN ANALYZE 로 다시 측정 → Index Scan 으로 바뀌고 시간이 줄었나
      5) 소규모 테스트 결과는 운영 데이터에서 안 맞을 수 있다 (플래너가 크기에 따라 다른 계획 선택)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`EXPLAIN`**(계획만) vs **`EXPLAIN ANALYZE`**(실제 실행 + 실측치)의 차이를 안다.
- 플랜 한 줄의 `(cost=시작..총 rows=… width=…)` 와 `(actual time=… rows=… loops=…)` 를 읽는다.
- **Seq Scan / Index Scan / Index Only Scan / Bitmap Heap Scan** 과 **Nested Loop / Hash Join / Merge Join** 을 구분한다.
- **추정 rows ≠ actual rows** 일 때 `ANALYZE` 로 통계를 갱신한다.
- "느린 쿼리 → `EXPLAIN` 진단 → 인덱스/쿼리 수정 → 다시 측정" 흐름을 실행한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `indexes`(Seq Scan vs 인덱스, 복합/부분 인덱스), 조인(`constraints-and-referential-integrity`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"이 쿼리가 느린 것 같다" 를 **감으로** 고치면(인덱스 아무거나 걸기, 쿼리 다시 쓰기) 나아졌는지 알 수 없고
운영에서 더 느려지기도 한다. `EXPLAIN` 은 "DB가 이 쿼리를 실제로 어떻게 실행할 계획인가" 를 보여 준다 —
추측 대신 측정.

<!-- section: code | lang: sql -->
## 1. EXPLAIN vs EXPLAIN ANALYZE

{{code: explain}}

- **`EXPLAIN`**: 실행하지 않고 플래너의 **계획과 추정치**만.
- **`EXPLAIN ANALYZE`**: 쿼리를 **진짜 실행**하고 계획 + **실측치**(actual time/rows/loops). `UPDATE`/`DELETE` 에
  쓸 때는 트랜잭션 안에서 `ROLLBACK` 하거나 주의.

<!-- section: mechanism -->
## 2. 플랜 한 줄 읽기

{{code: read-line}}

- `cost=A..B` — A는 첫 행까지, B는 전부까지의 **예상 비용**(임의 단위, 절대값보다 노드 간 비교용).
- `rows` — 반환할 행 수 **추정**. `width` — 행 평균 바이트.
- `EXPLAIN ANALYZE` 의 `actual time` — 실제 ms, `loops` — 이 노드가 몇 번 반복 실행됐나.
- **추정 rows 와 actual rows 가 크게 다르면** 통계가 낡은 것 → `ANALYZE <테이블>;`.

<!-- section: concept | title: 노드 종류 -->
## 3. 스캔·조인 노드

{{code: scan-types}}

- 플랜은 **트리**다. 리프(leaf)가 스캔 노드, 위로 갈수록 조인·정렬·집계. 아래에서 위로 읽는다.
- `Seq Scan` 이 항상 나쁜 건 아니다 — 테이블이 작거나 전체의 큰 비율을 읽으면 그게 더 빠르다.
- `Index Only Scan` 이 가장 빠르다(테이블을 아예 안 봄).

<!-- section: concept | title: 흐름 -->
## 4. 느린 쿼리 진단 흐름

{{code: workflow}}

<!-- section: must_know -->
## 반드시 기억할 것

- `EXPLAIN` = 계획+추정, `EXPLAIN ANALYZE` = 실행+실측. `ANALYZE` 는 쿼리를 진짜 돌린다.
- 한 줄: `cost=시작..총`(비교용), `rows`(추정), `width`. ANALYZE면 `actual time`/`rows`/`loops`.
- **추정 rows ≠ actual rows 크게 → `ANALYZE <table>`** 로 통계 갱신.
- 노드: Seq Scan / Index Scan / **Index Only Scan(가장 빠름)** / Bitmap Heap Scan. 조인: Nested Loop / Hash / Merge.
- 플랜은 트리, **아래(리프 스캔)에서 위로** 읽는다.
- `Seq Scan` 이 항상 나쁜 게 아니다. **소규모 테스트 결과는 운영 데이터에 안 맞을 수 있다.**
- 흐름: EXPLAIN ANALYZE → 느린 노드 → 인덱스/쿼리 수정 → 다시 측정.

<!-- section: experiment -->
## 직접 해 보기

1. 더미 10만 행 `post` 에서 `EXPLAIN SELECT * FROM post WHERE author_id = 1` 을 보고 `Seq Scan` 을 확인.
2. `CREATE INDEX ON post (author_id)` 후 `EXPLAIN ANALYZE` 로 `Index Scan` 으로 바뀌고 `actual time` 이 줄었는지 확인.
3. `EXPLAIN ANALYZE` 의 `rows` 추정과 `actual rows` 를 비교하고, 크게 다르면 `ANALYZE post;` 후 다시.
4. 두 테이블 조인의 `EXPLAIN` 에서 `Nested Loop` / `Hash Join` 중 무엇이 나오는지 보고, 한쪽 인덱스를 지웠다 다시 만들며 변화를 관찰.
5. 필요한 컬럼만 `SELECT` 하고 그 컬럼이 인덱스에 다 있게 만들어 `Index Only Scan` 을 유도해 보라.
6. 100행짜리 테이블에서 같은 쿼리가 인덱스가 있어도 `Seq Scan` 인 것을 확인하고 이유를 설명하라.

<!-- section: check_question -->
## 이해 점검

1. `EXPLAIN` 과 `EXPLAIN ANALYZE` 의 차이는? ANALYZE를 조심해야 하는 경우는?
2. 플랜 한 줄의 `cost=0.29..8.31 rows=3` 은 무슨 뜻인가?
3. 추정 rows와 actual rows가 10배 차이 난다. 무엇을 하나?
4. `Index Only Scan` 이 `Index Scan` 보다 빠른 이유는?
5. 소규모 테스트에서 잘 나온 계획을 운영에서 못 믿는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "느린 쿼리를 어떻게 진단하나요? `EXPLAIN ANALYZE` 출력에서 무엇을 보나요?"
- "Seq Scan이 항상 나쁜 게 아닌 이유를 예로 설명해 보세요."
- "플래너의 행 추정이 틀리는 원인과 대응은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> EXPLAIN(계획)/EXPLAIN ANALYZE(실행+실측), cost/rows/width·actual time/loops, 추정≠actual→ANALYZE,
> Seq/Index/Index Only/Bitmap·Nested Loop/Hash/Merge, 트리 아래→위, 소규모≠운영을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`EXPLAIN ANALYZE` 는 DB가 쿼리를 실제로 어떻게 실행했는지(스캔·조인 노드, actual time/rows)를 보여 준다 —
느린 노드를 찾아 인덱스나 쿼리를 고치고 다시 측정하며, 추정 행 수가 실제와 크게 다르면 `ANALYZE` 로 통계를
갱신한다(소규모 테스트 결과는 운영과 다를 수 있다).**
