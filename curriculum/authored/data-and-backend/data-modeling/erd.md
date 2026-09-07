---
id: data-and-backend/data-modeling/erd
chapter: data-and-backend/data-modeling
title: ERD 제작하기
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [database, erd, modeling, entity-relationship]
related_material_ids:
  - 1gmX8yMuc3IJPkYjkzUoOHjboPirybRBDMjeK3LuxKWQ   # 1 - ERD - 제작하기 (개체/속성/관계 추출 + PK/FK)
prerequisites:
  - data-and-backend/data-modeling/relational-vs-nonrelational
code_examples:
  - slug: extract
    title: 문장에서 개체 · 속성 · 관계 뽑기
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      요구: "보험사 DB. 고객이 있고, 고객이 쓰는 계좌가 있다.
             고객 정보: 이름, 주소, 휴대폰, 주민번호.
             계좌 정보: 계좌번호, 종류, 잔고, 개설일자, 인출한도.
             주소 정보: 시군구, 동, 상세주소, 우편번호."

      개체(Entity)  → 고객 / 계좌 / 주소       (독립적으로 존재하는 '것')
      속성(Attribute)→ 고객: 이름·주민번호·휴대폰 / 계좌: 계좌번호·잔고·인출한도 / 주소: 우편번호·동
      관계(Relationship) → 고객 —소유— 계좌 (1:N) / 고객 —거주— 주소 (1:N)
      # "~가 있다 / ~의 정보로는" = 개체·속성,  "~가 ~를 소유한다/사용한다" = 관계
  - slug: cardinality
    title: 관계의 수 (1:1 / 1:N / N:M)
    source_type: generated_minimal
    language: text
    code: |
      1:1  한 쪽에서 봐도 상대가 딱 하나  (예: 사람 — 주민등록증)
      1:N  한 쪽이 상대를 여럿 가질 수 있음 (예: 게시글 — 댓글, 고객 — 계좌)
      N:M  양쪽 모두 여럿 가질 수 있음     (예: 회원 — 상품(장바구니), 학생 — 과목)

      1:N  → N 쪽 테이블에 1 쪽의 PK 를 FK 컬럼으로 둔다 (댓글에 board_id)
      N:M  → 두 PK 를 컬럼으로 갖는 '연결(중간) 테이블' 을 새로 만든다 (enrollment(student_id, subject_id))
  - slug: pk-fk
    title: PK / FK 로 관계 맺기 (게시글 1:N 댓글)
    source_type: generated_minimal
    language: sql
    code: |
      CREATE TABLE board (
        id      INT PRIMARY KEY AUTO_INCREMENT,   -- 대표키(PK): 중복 불가, 각 행을 유일 식별
        title   VARCHAR(200) NOT NULL,
        writer  VARCHAR(50)
      );

      CREATE TABLE comment (
        id        INT PRIMARY KEY AUTO_INCREMENT,
        content   TEXT NOT NULL,
        board_id  INT NOT NULL,                   -- 외래키(FK): '어느 게시글에 속하나'
        FOREIGN KEY (board_id) REFERENCES board(id)
      );
      -- 게시글은 자기 댓글을 몰라도 된다. 댓글이 board_id 하나만 알면 1:N 이 성립.
  - slug: nm-bridge
    title: N:M — 연결 테이블
    source_type: generated_minimal
    language: sql
    code: |
      CREATE TABLE student (id INT PRIMARY KEY, name VARCHAR(50));
      CREATE TABLE subject (id INT PRIMARY KEY, name VARCHAR(50));

      CREATE TABLE enrollment (               -- 학생 N : M 과목
        student_id INT,
        subject_id INT,
        PRIMARY KEY (student_id, subject_id), -- 복합 PK (같은 조합 중복 방지)
        FOREIGN KEY (student_id) REFERENCES student(id),
        FOREIGN KEY (subject_id) REFERENCES subject(id)
      );
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 요구사항 문장에서 **개체 / 속성 / 관계**를 뽑아낼 수 있다.
- 관계의 **수(1:1 / 1:N / N:M)** 를 판별하고, 각각을 테이블로 어떻게 표현하는지 안다.
- **PK(대표키)** 와 **FK(외래키)** 로 두 테이블을 잇는다.
- **N:M 은 연결 테이블**로 푸는 규칙을 안다.
- ERD 툴(dbdiagram.io, ERDCloud, MySQL Workbench)로 그림 → SQL 로 옮긴다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 관계형 DB는 행·열의 테이블이고 스키마를 미리 정한다는 것.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"게시판 만들자"에서 바로 `CREATE TABLE` 을 치면, 나중에 "댓글은?", "작성자 정보는 회원 테이블에서?",
"같은 주소를 여러 번 저장하고 있네" 같은 문제가 줄줄이 나온다. **먼저 그림(ERD)으로 개체와 관계를
정리**한 뒤 테이블로 옮기면 이 재작업이 준다.

<!-- section: concept -->
## 1. 문장에서 요소 뽑기

{{code: extract}}

- **개체(Entity)**: 독립적으로 존재하고 여러 개가 생기는 "것" (고객, 계좌, 게시글). 보통 테이블 하나.
- **속성(Attribute)**: 개체가 가진 정보 (고객의 이름·주민번호). 보통 컬럼.
- **관계(Relationship)**: 개체 사이의 연결 ("고객이 계좌를 소유한다").
- 신호어: "~가 있다 / ~의 정보로는" → 개체·속성. "~가 ~를 소유/사용/작성한다" → 관계.

<!-- section: concept | title: 관계의 수 -->
## 2. 카디널리티 (1:1 / 1:N / N:M)

{{code: cardinality}}

판별 질문: **"A 하나에 B가 몇 개 붙나? 반대로 B 하나에 A는?"**
- 둘 다 하나 → 1:1
- 한 쪽만 여럿 → 1:N
- 둘 다 여럿 → N:M

<!-- section: mechanism -->
## 3. PK / FK 로 관계 만들기

{{code: pk-fk}}

- **PK(Primary Key)**: 각 행을 유일하게 식별. 중복·NULL 불가. 보통 `id INT AUTO_INCREMENT`.
- **FK(Foreign Key)**: 다른 테이블의 PK를 가리키는 컬럼. "이 행이 저쪽 어느 행에 속하나".
- **1:N** = N 쪽 테이블에 1 쪽의 PK를 FK로. (댓글에 `board_id`, 계좌에 `client_id`.)

<!-- section: concept | title: N:M -->
## 4. N:M → 연결 테이블

{{code: nm-bridge}}

N:M 은 컬럼 하나로 표현할 수 없다. 두 개체의 PK를 컬럼으로 갖는 **중간 테이블**
(`enrollment`, `cart_item`, `post_tag`)을 새로 만든다. 그 조합 자체가 PK(복합 PK)다.
중간 테이블에 관계 고유 속성(수강 학기, 담은 수량)도 붙일 수 있다.

<!-- section: must_know -->
## 반드시 기억할 것

- 순서: **요구 문장 → 개체·속성·관계 추출 → 카디널리티 판별 → PK/FK → SQL**.
- PK = 유일 식별(중복·NULL 불가). FK = 다른 테이블 PK를 가리켜 관계를 형성.
- **1:N 은 N 쪽에 FK.** **N:M 은 연결 테이블(복합 PK)로.**
- 같은 데이터가 여러 행에 반복되면 개체 분리 신호(→ 다음 Lesson `정규화`).
- ERD는 **툴로 그리고 SQL로 내보낸다**(dbdiagram.io, ERDCloud, Workbench). 손으로 다 쓰지 않는다.
- 물리 스키마(자료형·길이·인덱스)는 개념 ERD를 확정한 뒤에 붙인다.

<!-- section: experiment -->
## 직접 해 보기

1. 수업자료의 보험사 예시로 개체 3개·관계 2개를 뽑고, dbdiagram.io 로 ERD를 그려라.
2. "게시글 — 댓글 — 회원" 을 1:N 으로 설계하고 FK를 어디에 둘지 정한 뒤 `CREATE TABLE` 로 옮겨라.
3. "회원 — 상품(장바구니)" 을 N:M 으로 보고 연결 테이블 `cart_item(member_id, product_id, qty)` 을 만들어라.
4. `comment` 에서 `board_id` FK를 빼면 어떤 조회가 불가능해지는지 설명하라.
5. 같은 주소가 계좌마다 반복 저장되는 설계를 그려 보고, 왜 별 테이블로 빼는 게 나은지 적어라.

<!-- section: check_question -->
## 이해 점검

1. "고객의 정보로는 이름, 주민번호가 있다" 에서 개체와 속성은 각각 무엇인가?
2. 게시글과 댓글은 1:N 이다. FK는 어느 테이블 어느 컬럼에 두나?
3. N:M 관계를 컬럼 하나로 못 푸는 이유와, 대신 무엇을 만드나?
4. PK가 "중복 불가, NULL 불가" 여야 하는 이유는?
5. ERD를 먼저 그리면 어떤 재작업이 줄어드나?

<!-- section: interview_question -->
## 면접 대비

- "요구사항에서 엔티티와 관계를 도출하는 절차를 설명해 주세요."
- "1:N 과 N:M 을 스키마로 각각 어떻게 표현하나요?"
- "외래키 제약을 거는 것과 안 거는 것의 트레이드오프는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 개체/속성/관계 추출 신호어, 카디널리티 판별 질문, 1:N=N쪽 FK, N:M=연결 테이블(복합 PK),
> ERD 툴→SQL 흐름을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**ERD는 요구 문장에서 개체·속성·관계를 뽑아 카디널리티(1:1/1:N/N:M)를 정하고, 1:N 은 N 쪽에 FK,
N:M 은 연결 테이블(복합 PK)로 표현해 테이블 설계를 확정하는 그림이다 — 툴로 그려 SQL로 내보낸다.**
