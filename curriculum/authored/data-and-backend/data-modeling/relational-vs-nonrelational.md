---
id: data-and-backend/data-modeling/relational-vs-nonrelational
chapter: data-and-backend/data-modeling
title: 관계형과 비관계형의 차이
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [database, sql, nosql, comparison]
related_material_ids:
  - 1egvVi-6Dp33Klw1WXYLqNCKJQS9JDKu02orlbjwmUmA   # 관계형 비관계형 차이
prerequisites: []
code_examples:
  - slug: shapes
    title: 같은 데이터, 두 가지 저장 방식
    source_type: generated_minimal
    language: text
    code: |
      관계형 (RDB) — 테이블. 스키마를 미리 정함
        users(id, name, email)          posts(id, user_id, title)
        1  김  kim@x.com                10  1  안녕
        → 관계는 FK(user_id) + JOIN 으로 조합

      비관계형 (NoSQL, 문서형) — 문서(JSON 유사). 스키마 유연
        users/1  { name:"김", email:"kim@x.com",
                   posts:[ {title:"안녕"} ] }   ← 필요한 걸 한 문서에 중첩/복사
        → JOIN 없이 한 번에 읽음 (대신 중복이 생김)
  - slug: schema-timing
    title: schema-on-write vs schema-on-read
    source_type: generated_minimal
    language: text
    code: |
      RDB    : 쓸 때 스키마 검증 (schema on write)
               → 컬럼·타입에 안 맞으면 INSERT 거부. 데이터가 항상 정형.
      NoSQL  : 읽을 때 앱이 형태를 해석 (schema on read)
               → 문서마다 필드가 달라도 저장됨. 코드가 없는 필드(undefined)를 방어해야.
  - slug: pick
    title: 고르는 기준
    source_type: generated_minimal
    language: text
    code: |
      관계형을 고른다:
        - 데이터 간 관계가 많고 JOIN/집계가 중요 (주문·정산·통계)
        - 정합성이 중요 (트랜잭션: 계좌 이체)
        - 스키마가 비교적 안정적

      비관계형을 고른다:
        - 읽기 위주 + 문서 단위로 통째로 읽음 (피드, 프로필, 로그)
        - 스키마가 자주 바뀌거나 항목마다 다름
        - 수평 확장(대량 트래픽) 이 우선

      실무: 둘을 섞어 쓰기도 한다 (핵심 데이터는 RDB, 캐시/세션/로그는 NoSQL).
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 관계형(RDB, SQL)과 비관계형(NoSQL)의 **저장 형태**(테이블 vs 문서/키값/그래프) 차이를 안다.
- **스키마를 언제 검증하나**(쓸 때 vs 읽을 때)의 차이와 그 결과를 설명한다.
- JOIN이 있는 쪽과 없는 쪽에서 **관계 데이터**를 각각 어떻게 다루는지 안다.
- 프로젝트 성격에 따라 어느 쪽이 맞는지 판단 기준을 갖는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- (없음) 이 Lesson이 다음 DB 학습(SQL, Firestore, Supabase)의 출발점이다.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"게시판은 MySQL로, 채팅은 Firestore로" 같은 선택을 감으로 하면, 나중에 관계·집계가 많은 데이터를
NoSQL에 넣어 JOIN을 코드로 흉내 내거나, 로그처럼 관계 없는 데이터를 RDB에 넣고 스키마 변경에 시달린다.

<!-- section: concept -->
## 1. 저장 형태

{{code: shapes}}

- **관계형**: 고정된 행·열 테이블. 데이터 타입·구조를 **미리 정의**. 관계는 FK + JOIN으로 조합.
  대표: MySQL, PostgreSQL, MariaDB, Oracle, SQLite. 언어는 **SQL**.
- **비관계형(NoSQL)**: 관계형이 아닌 나머지 총칭. 유형이 여럿 — **문서형**(Firestore, MongoDB),
  **키-값**(Redis), **와이드 컬럼**(Cassandra), **그래프**(Neo4j). 문서형이 웹에서 가장 흔하다.
  스키마가 유연해 문서마다 필드가 달라도 된다.

<!-- section: mechanism -->
## 2. 스키마를 언제 확인하나

{{code: schema-timing}}

- RDB = **schema on write**: 넣을 때 형식을 강제한다. 그래서 나중에 읽을 때가 편하다(항상 정형).
- NoSQL = **schema on read**: 넣을 때는 관대하고, **읽는 앱 코드가** 형태를 해석·방어한다.
  "없을 수도 있는 필드"를 늘 염두에 둬야 한다.
- NoSQL도 스키마가 **없는 게 아니다** — 앱이 기대하는 형태가 암묵적으로 존재한다.

<!-- section: concept | title: 관계 데이터 -->
## 3. 관계 데이터 다루기

- **RDB**: 정규화해서 나눠 저장하고, 볼 때 `JOIN` 으로 합친다. 중복이 적다.
- **NoSQL**: JOIN이 (대개) 없다. 필요한 데이터를 **한 문서에 중첩하거나 복사**해 둔다(비정규화).
  읽기는 빠르지만, 원본이 바뀌면 복사본을 갱신하는 책임이 앱에 있다.

<!-- section: concept | title: 선택 -->
## 4. 무엇을 고르나

{{code: pick}}

한 줄 감각: **"관계와 정합성이 중요하면 RDB, 문서 단위로 읽고 스키마가 유동적이면 NoSQL."**
실무에서는 둘을 섞는다(핵심 트랜잭션 데이터는 RDB, 세션·캐시·로그·검색은 별도).

<!-- section: must_know -->
## 반드시 기억할 것

- RDB = 테이블 + 미리 정한 스키마 + SQL + JOIN. NoSQL = 문서/키값/그래프 + 유연 스키마.
- **schema on write(RDB)** vs **schema on read(NoSQL)** — 검증 책임이 DB냐 앱이냐.
- NoSQL에 스키마가 아예 없는 건 아니다(암묵적). 없는 필드 방어가 필수.
- 관계·집계·트랜잭션 중요 → RDB. 문서 단위 읽기·유동 스키마·수평 확장 → NoSQL.
- NoSQL의 관계는 **중첩/복사(비정규화)** 로. 그 대가로 갱신 책임이 앱에 온다.
- 하나만 골라야 하는 게 아니다 — 용도별로 섞어 쓴다.

<!-- section: experiment -->
## 직접 해 보기

1. "회원 — 주문 — 주문상품 — 상품" 을 RDB 테이블로 스케치하고, 같은 걸 Firestore 문서 구조로 스케치해 비교하라.
2. RDB에서 "회원별 총 주문액" 을 `JOIN` + `GROUP BY` 로, NoSQL에서 같은 걸 얻으려면 어떤 저장/계산이 필요한지 적어라.
3. 문서에 `imageUrl` 이 있는 문서와 없는 문서가 섞여 있을 때, 앱 코드가 어떻게 방어해야 하는지 써 보라.
4. "실시간 채팅 메시지" 와 "월별 매출 정산" 에 각각 어떤 DB가 맞는지 이유와 함께.

<!-- section: check_question -->
## 이해 점검

1. RDB와 NoSQL은 데이터를 각각 무엇으로 저장하나?
2. schema on write와 schema on read의 차이와, 각각의 장단점은?
3. NoSQL에서 관계 데이터를 어떻게 다루나? 그 대가는?
4. 트랜잭션(계좌 이체)이 중요한 시스템은 어느 쪽이 맞나? 왜?
5. "NoSQL은 스키마가 없다"가 정확하지 않은 이유는?

<!-- section: interview_question -->
## 면접 대비

- "RDB와 NoSQL을 선택하는 기준을 구체적 사례로 설명해 주세요."
- "NoSQL에서 JOIN이 필요할 때 어떻게 모델링하나요?"
- "한 서비스에서 RDB와 NoSQL을 함께 쓰는 구성의 예는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 저장 형태(테이블 vs 문서/키값/그래프), schema on write vs read, 관계=JOIN vs 중첩·복사,
> 선택 기준(관계·정합성 → RDB / 문서·유동 → NoSQL)을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**관계형은 미리 정한 스키마의 테이블에 저장하고 JOIN으로 관계를 조합하며(쓸 때 검증), 비관계형은
유연한 문서 등에 저장하고 관계를 중첩·복사로 표현한다(읽을 때 앱이 해석) — 관계·정합성이 중요하면 RDB,
문서 단위 읽기와 유동 스키마면 NoSQL, 보통은 용도별로 섞는다.**
