---
id: data-and-backend/data-modeling/sql-essentials
chapter: data-and-backend/data-modeling
title: SQL 핵심
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [database, sql, select, join, crud]
related_material_ids:
  - 1Hn4jKnNU0sURe1TUOIE_ESNK3Kr6nMH-TcsJbEQ35Wk   # SQL 핵심정리 (CREATE/INSERT/SELECT/UPDATE/DELETE/JOIN)
sources:
  - title: "MySQL 8.0 Reference — SELECT Statement"
    url: https://dev.mysql.com/doc/refman/8.0/en/select.html
    publisher: "Oracle"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/data-modeling/erd
project_links:
  - unit: momentalk/community-crud-embed
    note: PostgREST embed 조인이 SQL JOIN 으로 번역되는 실제 예 — N+1 을 피하는 게시판 조회
code_examples:
  - slug: ddl
    title: 테이블 만들기 (DDL)
    source_type: generated_minimal
    language: sql
    is_canonical: true
    code: |
      CREATE TABLE board (
        id       INT PRIMARY KEY AUTO_INCREMENT,
        writer   VARCHAR(50),
        title    VARCHAR(200) NOT NULL,
        content  TEXT,
        status   TINYINT DEFAULT 1,               -- 1=정상, 0=삭제 (soft delete)
        regdate  DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- 자주 WHERE 에 오는 컬럼엔 인덱스 (검색 빨라짐, 쓰기는 약간 느려짐)
      CREATE INDEX idx_board_status ON board(status);
  - slug: crud
    title: INSERT / SELECT / UPDATE / DELETE
    source_type: generated_minimal
    language: sql
    code: |
      -- CREATE: auto_increment·default 컬럼은 생략
      INSERT INTO board (writer, title, content) VALUES ('hong', '안녕', '처음 인사');

      -- READ
      SELECT * FROM board WHERE writer = 'hong' ORDER BY regdate DESC;
      SELECT COUNT(*) AS cnt FROM board WHERE status = 1;
      SELECT * FROM board WHERE title LIKE '%html%';           -- 포함 검색
      SELECT * FROM board ORDER BY regdate DESC LIMIT 0, 10;   -- 페이징: (offset, count)

      -- UPDATE / DELETE — WHERE 를 빠뜨리면 전체 행이 바뀐다/지워진다!
      UPDATE board SET title = '수정된 제목' WHERE id = 1;
      DELETE FROM board WHERE id IN (8, 10, 11);
  - slug: injection
    title: SQL 인젝션 — 문자열 조립 금지, 파라미터 바인딩
    source_type: generated_minimal
    language: js
    code: |
      // ❌ 값을 문자열로 이어 붙이면 공격 가능
      db.query(`SELECT * FROM board WHERE id = ${req.query.id}`);
      //  id = "1 OR 1=1" / "1; DROP TABLE board" ...

      // ✅ 플레이스홀더(?) + 값 배열 → 드라이버가 안전하게 이스케이프
      db.query("SELECT * FROM board WHERE id = ?", [req.query.id]);
      db.query("INSERT INTO board (writer,title,content) VALUES (?,?,?)", [w, t, c]);
  - slug: join
    title: JOIN — 흩어진 테이블을 합쳐 조회
    source_type: generated_minimal
    language: sql
    code: |
      -- 게시글 + 작성자 이름 (board.writer = member.userid)
      SELECT b.title, m.username, b.regdate
      FROM board b
      JOIN member m ON b.writer = m.userid;       -- INNER JOIN: 양쪽 다 있는 행만

      -- 댓글이 없는 글도 포함하려면 LEFT JOIN (없으면 오른쪽 컬럼이 NULL)
      SELECT b.*, c.content
      FROM board b
      LEFT JOIN comment c ON c.board_id = b.id;

      -- 집계: 작성자별 글 수
      SELECT writer, COUNT(*) AS cnt FROM board GROUP BY writer HAVING cnt > 5;
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `CREATE TABLE`(DDL)로 테이블·PK·기본값·인덱스를 만든다.
- **CRUD** 4문(`INSERT` / `SELECT` / `UPDATE` / `DELETE`)을 쓰고, `WHERE` 를 빠뜨리는 사고를 안다.
- `WHERE` / `ORDER BY` / `LIMIT`(페이징) / `LIKE` / `COUNT` / `GROUP BY … HAVING` 를 쓴다.
- **INNER JOIN vs LEFT JOIN** 으로 여러 테이블을 합쳐 조회한다.
- **SQL 인젝션**을 파라미터 바인딩(`?`)으로 막는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 테이블·PK·FK·1:N (→ `erd`). MySQL(또는 호환 DB) 접속 환경(Workbench, CLI, XAMPP 등).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

백엔드가 하는 일의 절반은 "DB에서 필요한 것만 뽑아 오기"다. SQL을 모르면 전부 가져와서
JS로 거르게 되고(느리고 위험), 관계 데이터를 합치지 못한다.

<!-- section: concept -->
## 1. 테이블 만들기 (DDL)

{{code: ddl}}

- `PRIMARY KEY AUTO_INCREMENT` — id 자동 증가. `NOT NULL` / `DEFAULT` 로 제약·기본값.
- **인덱스**: `WHERE` / `ORDER BY` 에 자주 쓰는 컬럼에 걸면 조회가 빨라진다(쓰기는 약간 느려짐).
  삭제 여부(`status`)처럼 구분자로 쓰는 컬럼이 대표적.

<!-- section: code | lang: sql -->
## 2. CRUD 4문

{{code: crud}}

- **`UPDATE` / `DELETE` 에 `WHERE` 를 안 쓰면 테이블 전체가 바뀐다.** 실무 사고 1순위. 항상 확인.
- `WHERE` 조건에는 보통 PK(`id`)를 써서 딱 한 행을 가리킨다.
- 페이징: `LIMIT offset, count` (`LIMIT 20, 10` = 21번째부터 10개).
- 검색: `LIKE '%키워드%'`(포함), `'키워드%'`(시작), `'%키워드'`(끝).

<!-- section: mechanism -->
## 3. SQL 인젝션 방어

{{code: injection}}

사용자 입력을 SQL 문자열에 **직접 이어 붙이면**, `1 OR 1=1`, `1; DROP TABLE board` 같은 값으로
쿼리 구조 자체가 바뀐다. 해결은 **플레이스홀더 `?` + 값 배열** — 드라이버가 값을 데이터로만 취급한다.
(이건 협상 불가 규칙이다. 예제라도 문자열 조립을 하지 않는다.)

<!-- section: concept | title: JOIN -->
## 4. JOIN

{{code: join}}

- **INNER JOIN**(`JOIN`): 조건이 **양쪽 다 맞는** 행만. (작성자가 회원 테이블에 없으면 그 글은 안 나옴.)
- **LEFT JOIN**: **왼쪽(기준) 테이블은 전부**, 오른쪽은 있으면 붙고 없으면 `NULL`.
  (댓글 없는 글도 목록에 포함하고 싶을 때.)
- 컬럼명이 겹치면 `테이블.컬럼` 또는 **별칭**(`board b`, `b.title`)으로 구분.
- 집계: `GROUP BY` 로 묶고 `COUNT`/`SUM`, 묶은 결과에 조건은 `HAVING`(not `WHERE`).

<!-- section: must_know -->
## 반드시 기억할 것

- CRUD = `INSERT` / `SELECT` / `UPDATE` / `DELETE`. **`UPDATE`·`DELETE` 는 반드시 `WHERE`**.
- 조회에서 필요한 컬럼만 `SELECT`, 필요한 행만 `WHERE`, 정렬 `ORDER BY`, 페이징 `LIMIT offset, count`.
- 사용자 입력은 **절대 문자열로 조립하지 않는다** — `?` 바인딩.
- INNER JOIN = 교집합, LEFT JOIN = 왼쪽 전부(+없으면 NULL).
- 겹치는 컬럼명은 테이블 별칭으로. 집계 후 조건은 `HAVING`.
- 삭제는 실제 `DELETE` 대신 `status` 플래그(soft delete)를 쓰는 설계도 흔하다.

<!-- section: experiment -->
## 직접 해 보기

1. `board` 와 `member` 테이블을 만들고 각각 더미 5행씩 넣어라.
2. `board` 를 최신순 10개, 그다음 11~20번째를 `LIMIT` 로 조회하라.
3. 제목에 특정 단어가 들어간 글을 `LIKE` 로 찾아라.
4. `board` + `member` 를 `JOIN` 해 "제목 · 작성자 이름 · 날짜" 만 뽑아라. 그다음 `LEFT JOIN` 으로 바꿔 차이를 보라.
5. `UPDATE board SET title='x'` 를 (테스트 DB에서!) `WHERE` 없이 실행해 몇 행이 바뀌는지 확인하고 되돌려라.
6. Node에서 `db.query("... WHERE id = ?", [id])` 로 파라미터 바인딩을 써 보라.

<!-- section: check_question -->
## 이해 점검

1. `DELETE FROM board` 만 실행하면?
2. `LIMIT 30, 10` 은 몇 번째부터 몇 개인가?
3. `1 OR 1=1` 로 전체 행이 조회되는 코드는 어떤 모양이고, 어떻게 막나?
4. INNER JOIN과 LEFT JOIN의 결과 차이를 "댓글 없는 글" 로 설명하라.
5. `GROUP BY` 결과에 조건을 걸 때 `WHERE` 가 아니라 무엇을 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "SQL 인젝션의 원리와 방어법을 설명해 주세요."
- "INNER JOIN과 OUTER JOIN(LEFT/RIGHT)의 차이와 사용 사례는?"
- "인덱스를 거는 기준과, 인덱스가 많으면 생기는 비용은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> CRUD 4문 + UPDATE/DELETE는 WHERE 필수, ORDER BY/LIMIT offset,count/LIKE/COUNT/GROUP BY·HAVING,
> ? 파라미터 바인딩(인젝션), INNER vs LEFT JOIN을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**SQL은 `INSERT`/`SELECT`/`UPDATE`/`DELETE` 로 데이터를 다루고(수정·삭제엔 `WHERE` 필수),
`WHERE`/`ORDER BY`/`LIMIT`/`LIKE`/`GROUP BY` 로 필요한 만큼만 조회하며, 여러 테이블은 `JOIN`(INNER=교집합,
LEFT=왼쪽 전부)으로 합친다 — 사용자 입력은 언제나 `?` 파라미터 바인딩으로 넣는다.**
