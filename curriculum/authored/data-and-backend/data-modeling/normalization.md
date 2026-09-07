---
id: data-and-backend/data-modeling/normalization
chapter: data-and-backend/data-modeling
title: 정규화
mastery: understand
lesson_kind: lesson
estimated_minutes: 40
tags: [database, normalization, 1nf, 2nf, 3nf]
related_material_ids:
  - 14E6y0TieVisd_jpln3_F9wwbmdR4LKka7XJ05KZJ1zo   # 데이터베이스 - 정규화 (1NF/2NF/3NF 예시)
prerequisites:
  - data-and-backend/data-modeling/erd
code_examples:
  - slug: unnormalized
    title: 정규화 전 — 중복과 이상 현상
    source_type: generated_minimal
    language: text
    code: |
      학생ID | 이름   | 학과명     | 과목명
      1      | 홍길동 | 컴퓨터공학 | React
      1      | 홍길동 | 컴퓨터공학 | SQL
      2      | 김철수 | 디자인     | Figma

      문제(이상 현상):
       - 갱신 이상: "컴퓨터공학"을 "SW공학"으로 바꾸려면 홍길동 행을 전부 수정
       - 삽입 이상: 아직 수강 안 한 신입생을 넣으려면 과목명을 억지로 채워야
       - 삭제 이상: 홍길동이 마지막 과목을 취소하면 그의 학과 정보까지 사라짐
  - slug: nf1
    title: 1NF — 한 칸에 값 하나
    source_type: generated_minimal
    language: text
    code: |
      위반:  과목 = "React, Figma, SQL"   (한 컬럼에 여러 값)
      해결:  행을 나눈다.  (1, 홍길동, React) / (1, 홍길동, Figma) / (1, 홍길동, SQL)
             또는 학생/과목을 별 테이블로.
      규칙: 컬럼값은 원자값(더 못 쪼갬), 반복 그룹 컬럼(취미1·취미2·취미3) 금지.
  - slug: nf2
    title: 2NF — 부분 종속 제거
    source_type: generated_minimal
    language: text
    code: |
      수강(학생ID, 과목ID, 학생이름, 과목명)   PK = (학생ID, 과목ID)
        학생이름 → 학생ID 만으로 결정  (복합키의 '일부'에만 의존 = 부분 종속)
        과목명   → 과목ID 만으로 결정

      해결: 학생(학생ID, 이름) / 과목(과목ID, 과목명) / 수강(학생ID, 과목ID)
      # 복합 PK 가 있을 때만 문제 된다. PK가 단일 컬럼이면 2NF는 자동 만족.
  - slug: nf3
    title: 3NF — 이행 종속 제거
    source_type: generated_minimal
    language: text
    code: |
      학생(학생ID, 학과ID, 학과명)
        학생ID → 학과ID → 학과명   (키가 아닌 학과ID 가 학과명을 결정 = 이행 종속)

      해결: 학생(학생ID, 학과ID) / 학과(학과ID, 학과명)
      # 학과명 변경 시 한 곳만 수정하면 된다.
  - slug: summary
    title: 한눈에 + 언제 비정규화
    source_type: generated_minimal
    language: text
    code: |
      1NF  한 칸에 한 값, 반복 컬럼 금지
      2NF  1NF + 복합키의 '일부'에만 의존하는 컬럼 분리
      3NF  2NF + 키가 아닌 컬럼끼리의 종속 분리
      비유: 1NF 한 칸 한 정보 / 2NF 주제별 테이블 / 3NF 유도되는 값은 별 테이블

      의도적 비정규화: 조회 성능/집계를 위해 일부 중복을 '알고' 허용
        (예: 주문에 당시 상품가격 복사 저장 — 나중에 가격이 바뀌어도 주문 기록은 고정).
        Firestore 같은 NoSQL 은 JOIN 이 없어 비정규화가 기본이다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **이상 현상**(갱신·삽입·삭제 이상)이 왜 생기는지 설명한다.
- **1NF / 2NF / 3NF** 를 예시로 판별하고, 각각 어떻게 테이블을 나누는지 안다.
- "부분 종속" / "이행 종속" 이라는 말을 예로 풀 수 있다.
- **언제 일부러 비정규화**(중복 허용)하는지 판단한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 테이블·PK·FK, 1:N/N:M(→ `erd` Lesson).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

{{code: unnormalized}}

한 테이블에 학생·학과·과목을 다 넣으면 같은 값이 계속 반복되고, 그 반복 때문에
**수정/삽입/삭제할 때 데이터가 어긋난다**(이상 현상). 정규화는 이 반복을 없애는 규칙이다.

<!-- section: concept -->
## 1NF — 한 칸에 값 하나

{{code: nf1}}

- 한 컬럼에 콤마로 여러 값(`"React, SQL"`)을 넣지 않는다.
- `취미1`, `취미2`, `취미3` 처럼 번호 붙인 반복 컬럼도 금지 — 별 테이블로.

<!-- section: concept | title: 2NF -->
## 2NF — 부분 종속 제거

{{code: nf2}}

- **복합 PK(2개 이상 컬럼)** 일 때만 해당된다.
- PK 전체가 아니라 그중 **일부만으로 결정되는** 컬럼이 있으면(학생이름 ← 학생ID) 그건 다른 테이블로.

<!-- section: concept | title: 3NF -->
## 3NF — 이행 종속 제거

{{code: nf3}}

- **키가 아닌 컬럼이 또 다른 키 아닌 컬럼을 결정**하면(학과ID → 학과명) 분리한다.
- `학생ID → 학과ID → 학과명` 처럼 한 다리 건너 결정되는 게 이행 종속.

<!-- section: mechanism -->
## 정리 · 비정규화

{{code: summary}}

- 실무 기본 목표는 보통 **3NF**. 여기까지 하면 중복이 크게 준다.
- 단, 조회 성능·집계·이력 보존을 위해 **의도적으로** 일부 중복을 허용하기도 한다(비정규화).
  이건 "몰라서 안 나눈 것"과 다르다 — 이유를 적어 둔다.
- NoSQL(Firestore)은 JOIN이 없어 처음부터 비정규화(중첩·복사)로 설계한다.

<!-- section: must_know -->
## 반드시 기억할 것

- 정규화의 목적은 **중복 제거 → 이상 현상 방지**.
- 1NF: 원자값, 반복 컬럼 금지. 2NF: 복합키의 부분 종속 제거. 3NF: 키 아닌 컬럼 간 종속 제거.
- 2NF는 **복합 PK가 있을 때만** 의미가 있다.
- 보통 3NF까지. 그 이상(BCNF 등)은 필요할 때.
- 비정규화는 성능·이력 목적으로 **의도적으로** 한다 — 이유를 남긴다.
- "유도 가능한 값"(나이 ← 생년월일, 합계 ← 항목들)은 저장 대신 계산을 우선 검토.

<!-- section: experiment -->
## 직접 해 보기

1. 수업자료의 "정규화 전" 표에서 갱신·삽입·삭제 이상을 각각 한 문장으로 설명하라.
2. 그 표를 1NF → 2NF → 3NF 로 단계별로 나눠 학생/과목/수강/학과 4개 테이블로 만들어라.
3. `수강(학생ID, 과목ID, 학생이름)` 에서 `학생이름` 이 왜 2NF 위반인지 종속으로 설명하라.
4. 주문 테이블에 `상품가격` 을 복사 저장하는 게 왜 "정당한 비정규화"인지 적어라.
5. `직원(사번, 부서번호, 부서명, 부서장)` 에서 3NF 위반을 찾아 분리하라.

<!-- section: check_question -->
## 이해 점검

1. 이상 현상 3가지를 한 줄씩 설명하라.
2. 1NF 위반의 두 가지 형태는?
3. 2NF는 어떤 경우에만 문제가 되나?
4. `학생ID → 학과ID → 학과명` 이 3NF 위반인 이유는?
5. 비정규화를 "정당하게" 하는 경우의 예는?

<!-- section: interview_question -->
## 면접 대비

- "정규화의 목적과, 1NF/2NF/3NF의 차이를 예로 설명해 주세요."
- "실무에서 3NF를 깨고 비정규화하는 판단은 어떤 기준으로 하나요?"
- "NoSQL 설계가 정규화 관점에서 관계형과 다른 점은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 이상 현상 3종, 1NF(원자값·반복컬럼), 2NF(부분종속·복합키), 3NF(이행종속),
> 의도적 비정규화의 근거를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**정규화는 중복을 없애 갱신·삽입·삭제 이상을 막는다 — 1NF(한 칸 한 값)·2NF(복합키 부분 종속 제거)·
3NF(키 아닌 컬럼 간 종속 제거)까지가 보통 목표이고, 성능·이력을 위해서는 이유를 적고 의도적으로 비정규화한다.**
