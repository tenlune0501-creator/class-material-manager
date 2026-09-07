---
id: data-and-backend/relational-database-operations/constraints-and-referential-integrity
chapter: data-and-backend/relational-database-operations
title: 제약과 참조 무결성
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [database, postgres, constraints, foreign-key, referential-integrity]
related_material_ids: []
sources:
  - title: "PostgreSQL Documentation — 5.5. Constraints"
    url: https://www.postgresql.org/docs/current/ddl-constraints.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "PostgreSQL Documentation — 2.6. Joins Between Tables"
    url: https://www.postgresql.org/docs/current/tutorial-join.html
    publisher: "PostgreSQL Global Development Group"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/relational-database-operations/postgres-basics-and-dialect
  - data-and-backend/data-modeling/erd
  - data-and-backend/data-modeling/normalization
code_examples:
  - slug: constraints
    title: 제약 5종 — 테이블 정의에서
    source_type: generated_minimal
    language: sql
    is_canonical: true
    code: |
      CREATE TABLE member (
        id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- PK = UNIQUE + NOT NULL
        email    text NOT NULL UNIQUE,                              -- 중복 금지 (NULL 은 여러 개 허용)
        nickname text NOT NULL,
        age      int CHECK (age >= 0)                               -- 값 범위 규칙
      );

      CREATE TABLE post (
        id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title     text NOT NULL,
        author_id bigint NOT NULL
          REFERENCES member (id) ON DELETE CASCADE,                 -- FK + 삭제 시 동작
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX ON post (author_id);   -- Postgres 는 FK 컬럼 인덱스를 자동으로 안 만든다
  - slug: on-delete
    title: ON DELETE / ON UPDATE 액션
    source_type: generated_minimal
    language: text
    code: |
      부모(member) 행을 지우려 할 때, 그 부모를 가리키는 자식(post) 행을 어떻게 할지:

      NO ACTION (기본)  참조가 남아 있으면 삭제 거부 (체크를 문 끝으로 미룸)
      RESTRICT          참조가 남아 있으면 즉시 삭제 거부
      CASCADE           자식 행도 함께 삭제         (게시글→댓글 처럼 "부모 없으면 무의미")
      SET NULL          자식의 FK 컬럼을 NULL 로     (FK 가 NOT NULL 이면 불가)
      SET DEFAULT       자식의 FK 컬럼을 DEFAULT 로

      ON UPDATE 도 같은 액션. 대개 PK 는 안 바꾸므로 ON DELETE 를 주로 설계한다.
  - slug: integrity
    title: 참조 무결성 — 무엇을 막나
    source_type: generated_minimal
    language: sql
    code: |
      -- 존재하지 않는 member 를 가리키는 post 는 아예 INSERT 가 거부된다
      INSERT INTO post (title, author_id) VALUES ('x', 999999);
      -- ERROR: insert or update on table "post" violates foreign key constraint
      --        Key (author_id)=(999999) is not present in table "member".

      -- 즉 FK 가 "고아 행(orphan)" — 참조 대상이 없는 자식 행 — 을 만들지 못하게 한다.
      -- 앱 코드가 "먼저 member 있나 확인" 하는 로직을 DB 가 대신 보장.
  - slug: joins-deep
    title: 나눈 테이블 되붙이기 — 3+ 테이블 · self-join
    source_type: generated_minimal
    language: sql
    code: |
      -- 정규화로 나눈 member / post / comment 를 한 번에 (INNER/LEFT 문법은 sql-essentials)
      SELECT p.title, m.nickname AS author, c.body AS comment
      FROM post p
      JOIN member m  ON m.id = p.author_id
      LEFT JOIN comment c ON c.post_id = p.id;      -- 댓글 없는 글도 포함하려면 LEFT

      -- self-join: 같은 테이블을 두 번 (예: 직원 - 그 직원의 상사)
      SELECT e.name AS employee, boss.name AS manager
      FROM employee e
      LEFT JOIN employee boss ON boss.id = e.manager_id;
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **제약 5종**(`NOT NULL` / `UNIQUE` / `PRIMARY KEY` / `CHECK` / `FOREIGN KEY`)을 테이블 정의에 쓴다.
- **`ON DELETE` / `ON UPDATE` 액션**(`NO ACTION` / `RESTRICT` / `CASCADE` / `SET NULL` / `SET DEFAULT`)과 각각이
  자식 행에 미치는 영향을 안다.
- **참조 무결성**이 "고아 행(orphan)" 을 어떻게 막는지, 그게 왜 앱 코드보다 안전한지 안다.
- PostgreSQL은 **FK 컬럼에 인덱스를 자동으로 만들지 않는다**는 것을 안다.
- 정규화로 나눈 테이블을 3+ 테이블 JOIN / self-join으로 되붙인다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `postgres-basics-and-dialect`(Postgres 문법), `data-modeling/erd`(PK/FK 개념·카디널리티),
  `data-modeling/normalization`(왜 나누나), `sql-essentials`(INNER/LEFT JOIN 문법).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

`erd` / `normalization` 에서 "테이블을 이렇게 나눈다" 는 배웠다. 그런데 나눠 놓기만 하면:
존재하지 않는 회원을 작성자로 가진 글이 들어가고(고아 행), 이메일이 중복되고, 나이에 `-5` 가 저장된다.
회원을 지웠더니 그 회원의 글이 "작성자 없음" 으로 떠 있다. **제약**이 이걸 DB 수준에서 막는다.

<!-- section: code | lang: sql -->
## 1. 제약 5종

{{code: constraints}}

- **`NOT NULL`**: 빈 값 금지.
- **`UNIQUE`**: 중복 금지. NULL은 "값 없음" 이라 여러 개 허용(Postgres 기본). 자동으로 인덱스가 생긴다.
- **`PRIMARY KEY`**: `UNIQUE` + `NOT NULL`. 테이블당 하나(복합 PK 가능).
- **`CHECK (조건)`**: 값 자체의 규칙(`age >= 0`, `status IN ('open','closed')`).
- **`FOREIGN KEY … REFERENCES 부모(컬럼)`**: 이 컬럼 값이 부모 테이블에 **실제로 존재**해야 함.

<!-- section: mechanism -->
## 2. ON DELETE / ON UPDATE

{{code: on-delete}}

- 부모 행을 지울 때 자식을 어떻게 할지 **설계**한다. "부모 없으면 무의미" 한 관계(게시글→댓글)는 `CASCADE`,
  "함부로 못 지우게" 하려면 `RESTRICT`, "관계만 끊고 자식은 남김" 은 `SET NULL`(FK가 `NOT NULL` 이면 불가).
- 기본은 `NO ACTION` — 참조가 남아 있으면 삭제를 거부한다.

<!-- section: concept | title: 참조 무결성 -->
## 3. 참조 무결성 — 무엇을 막나

{{code: integrity}}

- FK는 **고아 행**(참조 대상이 없는 자식)을 만들지 못하게 한다. `INSERT` 시점에 부모 존재를 검사하고,
  부모 삭제 시 `ON DELETE` 규칙을 적용한다.
- "앱에서 먼저 확인" 하는 로직은 동시성·버그·다른 클라이언트 때문에 새는데, **DB 제약은 항상 보장**한다.

<!-- section: concept | title: FK 인덱스 -->
## 4. Postgres는 FK 인덱스를 자동 생성 안 한다

- `UNIQUE`/`PRIMARY KEY` 는 인덱스가 자동 생성되지만 **`FOREIGN KEY` 는 아니다.**
- FK 컬럼으로 조인·조회를 자주 하면(`WHERE author_id = …`, `JOIN … ON … = post.author_id`)
  `CREATE INDEX ON post (author_id)` 를 직접 만든다. (인덱스 상세는 다음 Lesson.)

<!-- section: concept | title: 되붙이기 -->
## 5. 나눈 테이블 되붙이기

{{code: joins-deep}}

INNER/LEFT JOIN 문법은 `sql-essentials` 에서 배웠다. 여기서는 **3+ 테이블 조인**(글+작성자+댓글)과
**self-join**(직원-상사)만 얹는다. FK가 있으면 `ON` 조건이 자연스럽게 그 FK가 된다.

<!-- section: must_know -->
## 반드시 기억할 것

- 제약 5종: `NOT NULL` / `UNIQUE`(NULL 다중 허용, 자동 인덱스) / `PRIMARY KEY`(=UNIQUE+NOT NULL) / `CHECK` / `FOREIGN KEY`.
- **`ON DELETE`**: `NO ACTION`(기본, 거부) / `RESTRICT`(즉시 거부) / `CASCADE`(자식도 삭제) / `SET NULL` / `SET DEFAULT`.
- FK = **고아 행 방지**. INSERT 시 부모 존재 검사 + 부모 삭제 시 액션 적용. "앱에서 확인" 보다 안전.
- **PostgreSQL은 FK 컬럼 인덱스를 자동 생성하지 않는다** → 조인·조회가 잦으면 직접 `CREATE INDEX`.
- 제약은 "데이터가 절대 어겨선 안 되는 규칙" 만. 유동적인 비즈니스 규칙은 앱/서비스 계층에.
- 되붙이기: FK 기준 3+ 테이블 JOIN, self-join(같은 테이블 두 번, 별칭 필수).

<!-- section: experiment -->
## 직접 해 보기

1. `member`(email UNIQUE, age CHECK ≥ 0) + `post`(author_id FK) 를 만들어라.
2. 같은 이메일로 두 번 INSERT / `age = -1` INSERT / 없는 `author_id` 로 INSERT — 각각 어떤 에러가 나는지 확인.
3. `ON DELETE CASCADE` 로 만든 뒤 `member` 한 명을 지워 그 사람의 `post` 도 사라지는지 보라. `RESTRICT` 로 바꿔 삭제가 거부되는지도.
4. FK 컬럼에 인덱스 없이 `EXPLAIN SELECT … WHERE author_id = 1` 을 보고(다음 Lesson 예고), `CREATE INDEX` 후 다시 비교.
5. `employee(manager_id)` self-join으로 "직원 - 상사" 목록을 만들어라. 상사가 없는 CEO는 어떻게 나오나?

<!-- section: check_question -->
## 이해 점검

1. `PRIMARY KEY` 는 어떤 제약 두 개의 조합인가? `UNIQUE` 컬럼에 NULL을 여러 개 넣을 수 있나?
2. `ON DELETE CASCADE` 와 `ON DELETE RESTRICT` 는 각각 언제 쓰나?
3. FK가 막아 주는 "고아 행" 이란 무엇인가? 앱 코드로 확인하는 것보다 나은 이유는?
4. PostgreSQL에서 FK를 걸면 인덱스가 자동으로 생기나?
5. self-join에서 테이블 별칭이 반드시 필요한 이유는?

<!-- section: interview_question -->
## 면접 대비

- "참조 무결성을 DB 제약으로 강제하는 것과 애플리케이션에서 검증하는 것의 차이는?"
- "`ON DELETE` 옵션들을 설명하고, 각각 어떤 도메인에 맞는지 예를 들어 보세요."
- "PostgreSQL에서 외래키에 인덱스를 직접 만들어야 하는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 제약 5종, ON DELETE 액션 5가지(기본 NO ACTION), FK=고아 행 방지, Postgres는 FK 인덱스 수동,
> 3+ 테이블/self-join 되붙이기를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**제약(`NOT NULL`/`UNIQUE`/`PK`/`CHECK`/`FK`)은 데이터가 절대 어겨선 안 되는 규칙을 DB가 강제하게 하고,
FK의 `ON DELETE` 액션으로 부모-자식 삭제 동작을 설계해 고아 행을 막는다 — PostgreSQL은 FK 컬럼 인덱스를
자동 생성하지 않으므로 조인·조회가 잦으면 직접 만든다.**
