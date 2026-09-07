---
id: data-and-backend/relational-database-operations/transactions
chapter: data-and-backend/relational-database-operations
title: 트랜잭션 — 전부 성공 아니면 전부 취소
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [database, postgres, transaction, atomicity, node-postgres]
related_material_ids: []
sources:
  - title: "PostgreSQL Documentation — 3.4. Transactions"
    url: https://www.postgresql.org/docs/current/tutorial-transactions.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "node-postgres — Transactions"
    url: https://node-postgres.com/features/transactions
    publisher: "Brian Carlson (node-postgres)"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/relational-database-operations/postgres-basics-and-dialect
  - data-and-backend/relational-database-operations/constraints-and-referential-integrity
code_examples:
  - slug: sql
    title: BEGIN / COMMIT / ROLLBACK
    source_type: generated_minimal
    language: sql
    is_canonical: true
    code: |
      BEGIN;
        INSERT INTO post (author_id, title) VALUES ($1, $2);
        INSERT INTO attachment (post_id, url) VALUES ($3, $4);   -- 여기서 실패하면
      COMMIT;                                                     -- 이 줄에 도달 못 함
      -- 실패 시:
      ROLLBACK;   -- 위 INSERT 두 개가 "모두" 없던 일이 된다

      -- 부분 취소 지점
      BEGIN;
        INSERT INTO orders ...;
        SAVEPOINT after_order;
        UPDATE stock SET qty = qty - 1 WHERE ...;   -- 재고 부족 등으로 실패
        ROLLBACK TO after_order;                    -- 주문은 유지, 재고 차감만 취소
      COMMIT;
  - slug: why
    title: 왜 필요한가 — 원자성
    source_type: generated_minimal
    language: text
    code: |
      계좌이체:  A에서 -1만원  →  B에게 +1만원
      1번만 성공하고 2번에서 서버가 죽으면? → 1만원이 증발한다

      주문+재고:  주문 INSERT  →  재고 UPDATE
      주문만 들어가고 재고가 안 줄면? → 없는 재고를 파는 상태

      트랜잭션 = 여러 문장을 "하나의 단위"로 묶는다
        전부 COMMIT 되거나(원자성), 전부 ROLLBACK 되거나. 중간 상태를 남기지 않는다
  - slug: node
    title: node-postgres 트랜잭션 패턴
    source_type: generated_minimal
    language: js
    code: |
      // ⚠️ 학습용 최소 구현: 실제 서비스는 에러 타입 분기·로깅·재시도 정책이 더 필요
      // pool.query() 로는 트랜잭션을 쓰지 않는다 — 매번 다른 커넥션이 나올 수 있다
      async function createPostWithAttachment(pool, input) {
        const client = await pool.connect();      // 커넥션 하나를 점유
        try {
          await client.query('BEGIN');
          const { rows } = await client.query(
            'INSERT INTO post (author_id, title) VALUES ($1, $2) RETURNING id',
            [input.authorId, input.title],
          );
          await client.query(
            'INSERT INTO attachment (post_id, url) VALUES ($1, $2)',
            [rows[0].id, input.url],
          );
          await client.query('COMMIT');
          return rows[0].id;
        } catch (e) {
          await client.query('ROLLBACK');         // 하나라도 실패하면 전부 취소
          throw e;
        } finally {
          client.release();                       // 반드시 커넥션 반환
        }
      }
  - slug: boundary
    title: 트랜잭션 경계 = 서비스 계층
    source_type: generated_minimal
    language: text
    code: |
      Controller  요청 파싱·검증
        └ Service   ← 여기서 BEGIN … COMMIT 한 덩어리 (업무 규칙 단위)
            └ Repository  개별 SQL

      경계 잡는 기준: "이 여러 쓰기가 하나라도 실패하면 전부 없던 일이어야 하나?" → 예 → 한 트랜잭션
      - 트랜잭션은 짧게. 그 안에서 외부 API 호출·긴 계산·사용자 입력 대기 금지 (락을 오래 잡음)
      - 격리 수준(Read Committed 기본 등)은 지금은 "이런 게 있다"만. 동시성 깊은 내용은 이후 주제
  - slug: supabase
    title: Supabase 에서
    source_type: generated_minimal
    language: text
    code: |
      - 단일 문장(하나의 INSERT/UPDATE/DELETE, 다중 행 포함)은 그 자체로 원자적이다
      - supabase-js 는 여러 문장을 묶는 클라이언트 트랜잭션 API를 제공하지 않는다
        → 여러 문장을 한 단위로 묶어야 하면 DB 함수(RPC)로 서버에서 실행: supabase.rpc('그_함수')
        (함수 본문은 하나의 트랜잭션에서 돈다)
      - 서버 코드에서 커넥션을 직접 잡을 수 있으면 위 node-postgres 패턴을 그대로 쓴다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **트랜잭션 = 여러 문장을 하나의 단위로**(원자성: 전부 COMMIT 또는 전부 ROLLBACK)임을 설명한다.
- `BEGIN` / `COMMIT` / `ROLLBACK`, 부분 취소 지점 `SAVEPOINT` / `ROLLBACK TO` 를 쓴다.
- 게시글+첨부, 주문+재고, 계좌이체가 왜 한 트랜잭션이어야 하는지 안다.
- **node-postgres** 에서 `pool.connect()` → `BEGIN` → 쿼리들 → `COMMIT` / `catch` → `ROLLBACK` / `finally` → `release()` 패턴을 쓴다.
- 트랜잭션 경계를 **서비스 계층**에 두고, 트랜잭션은 짧게 유지한다.
- 격리 수준은 "이런 개념이 있다" 수준으로만 인지한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `postgres-basics-and-dialect`(`$1` 바인딩, `pg` Pool), `constraints-and-referential-integrity`(FK로 인한 다중 쓰기).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

주문을 넣고 재고를 줄이는 코드에서, 주문 `INSERT` 는 성공했는데 재고 `UPDATE` 직전에 서버가 죽었다.
결과: **주문은 있는데 재고가 안 줄어든** 잘못된 상태. 여러 쓰기를 따로따로 실행하면 중간에 깨졌을 때
데이터가 어긋난다. 트랜잭션은 이걸 "전부 아니면 전무" 로 만든다.

<!-- section: concept -->
## 1. 왜 필요한가 — 원자성

{{code: why}}

여러 문장을 하나의 단위로 묶어, **전부 반영(COMMIT)되거나 전부 되돌려(ROLLBACK)진다.** 중간 상태를
외부에 남기지 않는다. 이것이 원자성(atomicity)이다.

<!-- section: code | lang: sql -->
## 2. BEGIN / COMMIT / ROLLBACK

{{code: sql}}

- `BEGIN` 으로 시작, `COMMIT` 으로 확정, `ROLLBACK` 으로 전체 취소.
- **`SAVEPOINT` / `ROLLBACK TO`**: 트랜잭션 안의 특정 지점까지만 되돌린다(나머지는 유지).
- 에러가 난 트랜잭션은 이후 문장이 모두 거부된다 → `ROLLBACK`(또는 `ROLLBACK TO 세이브포인트`) 필요.

<!-- section: code | title: node-postgres | lang: js -->
## 3. node-postgres 패턴

{{code: node}}

- **`pool.query()` 로는 트랜잭션을 쓰지 않는다.** 매 호출이 풀에서 다른 커넥션을 받을 수 있어
  `BEGIN` 과 `COMMIT` 이 서로 다른 커넥션에서 실행될 수 있다.
- `pool.connect()` 로 커넥션 하나를 잡고, 그 `client` 로 `BEGIN` → 쿼리들 → `COMMIT`.
- `catch` 에서 `ROLLBACK` 후 에러를 다시 던진다. `finally` 에서 **반드시 `client.release()`**.

<!-- section: mechanism -->
## 4. 트랜잭션 경계

{{code: boundary}}

- 경계를 잡는 질문: **"이 여러 쓰기 중 하나라도 실패하면 전부 없던 일이어야 하나?"** → 예 → 한 트랜잭션.
- 보통 **서비스 계층**(업무 규칙 단위)에서 `BEGIN … COMMIT` 을 감싸고, Repository는 개별 SQL만 담당.
- **트랜잭션은 짧게.** 그 안에서 외부 API 호출, 긴 계산, 사용자 입력 대기 금지(락을 오래 잡아 다른 요청을 막음).

<!-- section: concept | title: 격리 수준 -->
## 5. 격리 수준 (인지만)

- 동시에 도는 트랜잭션들이 서로를 얼마나 볼 수 있는지가 **격리 수준**이다.
- PostgreSQL 기본은 **Read Committed**(다른 트랜잭션이 커밋한 것만 보임). `REPEATABLE READ`, `SERIALIZABLE` 도 있다.
- 지금은 **"이런 개념이 있고, 동시성 문제(경쟁 상태·중복 차감 등)는 격리 수준·락으로 다룬다"** 정도만.
  깊은 내용은 이후 동시성 주제에서.

<!-- section: concept | title: Supabase -->
## 6. Supabase 에서

{{code: supabase}}

- 단일 문장은 그 자체로 원자적. 여러 문장을 묶어야 하면 **DB 함수(RPC)** 로 서버에서 실행(함수 본문 = 한 트랜잭션).
- 서버 코드에서 커넥션을 직접 잡을 수 있으면 위 node-postgres 패턴을 그대로 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- 트랜잭션 = 여러 문장을 **하나의 단위**로. 원자성: 전부 COMMIT 또는 전부 ROLLBACK, 중간 상태 없음.
- `BEGIN` / `COMMIT` / `ROLLBACK`. `SAVEPOINT` + `ROLLBACK TO` = 부분 취소.
- **node-postgres: `pool.query()` 로 트랜잭션 금지.** `pool.connect()` → `client` 로 `BEGIN`…`COMMIT`,
  `catch`→`ROLLBACK`, `finally`→`release()`.
- 경계는 보통 **서비스 계층**. 기준: "하나라도 실패하면 전부 취소돼야 하나?"
- 트랜잭션은 **짧게** — 안에서 외부 API/긴 계산/입력 대기 금지.
- 격리 수준(Read Committed 기본 등)은 지금은 개념 인지만. 동시성 세부는 이후 주제.
- Supabase: 단일 문장은 원자적, 여러 문장 묶음은 **RPC(DB 함수)**.

<!-- section: experiment -->
## 직접 해 보기

1. `psql` 에서 `BEGIN; INSERT ...; ROLLBACK;` 후 그 행이 없는 것을, `BEGIN; INSERT ...; COMMIT;` 후 있는 것을 확인.
2. 두 번째 `INSERT` 가 FK 위반으로 실패하게 만들고, `ROLLBACK` 하면 첫 번째 `INSERT` 도 사라지는 것을 확인.
3. `SAVEPOINT` 를 찍고 이후 문장을 실패시킨 뒤 `ROLLBACK TO` 로 세이브포인트 이전만 살리는 걸 해 보라.
4. node-postgres로 게시글+첨부 생성 함수를 만들고, 첨부 `INSERT` 에 일부러 잘못된 값을 넣어 게시글도 롤백되는지 확인.
5. `finally` 의 `client.release()` 를 빼고 함수를 여러 번 호출해 커넥션 풀이 고갈되는 현상을 재현하라.
6. Supabase에서 "잔액 차감 + 로그 기록" 을 하는 `plpgsql` 함수를 만들고 `supabase.rpc()` 로 호출해 보라.

<!-- section: check_question -->
## 이해 점검

1. 트랜잭션의 원자성이란 무엇인가? 계좌이체 예로 설명하라.
2. `pool.query()` 로 `BEGIN` / `COMMIT` 을 하면 왜 위험한가?
3. `catch` 블록에서 `ROLLBACK` 을 빠뜨리면 무슨 일이 생기나?
4. `SAVEPOINT` 는 언제 쓰나?
5. 트랜잭션 안에서 외부 결제 API를 호출하면 안 되는 이유는?
6. Supabase에서 두 테이블에 걸친 쓰기를 원자적으로 하려면?

<!-- section: interview_question -->
## 면접 대비

- "트랜잭션의 ACID 중 원자성과 격리성을 설명해 주세요."
- "Node.js에서 DB 트랜잭션을 어떻게 구현하나요? 커넥션 풀과의 관계는?"
- "트랜잭션 경계를 어느 계층에 두나요? 왜인가요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 원자성(전부 COMMIT/전부 ROLLBACK), BEGIN/COMMIT/ROLLBACK·SAVEPOINT, node-postgres는 connect()로
> 커넥션 잡고 BEGIN…COMMIT/catch→ROLLBACK/finally→release, 경계=서비스 계층·짧게, 격리 수준은 인지만,
> Supabase는 RPC를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**트랜잭션은 여러 문장을 원자적 단위로 묶어 전부 COMMIT 되거나 전부 ROLLBACK 되게 하며 —
node-postgres에서는 `pool.connect()` 로 커넥션 하나를 잡아 `BEGIN`…`COMMIT` 하고 실패 시 `ROLLBACK`,
`finally` 에서 `release()` 하며, 경계는 서비스 계층에 짧게 둔다.**
