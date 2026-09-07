---
id: data-and-backend/baas-supabase-firebase/firebase-vs-supabase
chapter: data-and-backend/baas-supabase-firebase
title: Firebase와 Supabase 비교
mastery: understand
lesson_kind: lesson
estimated_minutes: 35
tags: [baas, firebase, supabase, comparison]
related_material_ids:
  - 1lihKRwRC3KHP4RXBvzGiuIG7bLEJRkgCilkk1LBSZPo   # 01 - Firebase와 Supabase
prerequisites:
  - data-and-backend/data-modeling/relational-vs-nonrelational
code_examples:
  - slug: table
    title: 항목별 비교
    source_type: generated_minimal
    language: text
    code: |
      항목        | Firebase                         | Supabase
      DB          | Firestore(문서형 NoSQL)          | PostgreSQL(관계형) — SQL·JOIN·트랜잭션
      API         | 클라 SDK 로 DB 직접              | PostgREST 로 REST 자동 생성 + 클라 SDK
      인증        | Firebase Auth (SDK 강력)         | Supabase Auth (계정이 Postgres 테이블에 통합)
      실시간      | Firestore/RTDB 기본              | Realtime(테이블 변경 구독)
      스토리지    | Cloud Storage                    | Storage(S3 호환)
      함수        | Cloud Functions                  | Edge Functions
      접근 제어   | 보안 규칙(전용 문법)             | Row Level Security(Postgres RLS, SQL)
      생태계      | Google(GA/ML/푸시) 통합          | 오픈소스, 셀프호스팅 가능
  - slug: shared
    title: 공통점 — BaaS의 모양
    source_type: generated_minimal
    language: text
    code: |
      둘 다:
       - "내 서버" 없이 클라이언트 SDK 가 DB/인증/스토리지에 직접 붙는다
       - apiKey 는 클라에 노출되는 식별자 (비밀 아님)
       - 실제 접근 제어는 "규칙"(보안 규칙 / RLS) 이 담당한다
       - 공개 회원가입·이메일/소셜 로그인·실시간 구독을 기본 제공
       - 무료 티어가 있고, 사용량이 커지면 과금 + 벤더 종속(lock-in) 위험
  - slug: choose
    title: 고르는 기준
    source_type: generated_minimal
    language: text
    code: |
      Firebase 쪽:
        - 문서 단위 읽기/실시간이 중심 (채팅, 알림, 협업 커서)
        - 모바일(iOS/Android) SDK·푸시·A/B·Analytics 를 함께
      Supabase 쪽:
        - 관계·집계·트랜잭션이 필요 (커머스, 정산, 대시보드)
        - SQL 을 그대로 쓰고 싶다 / 나중에 자체 DB 로 이전 여지
        - Next.js SSR 인증(쿠키 기반)과 잘 맞음
      둘 다 "학습·프로토타입에 빠르다" 는 공통 강점.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **BaaS**(Backend as a Service)가 무엇인지 — "내 서버 없이 SDK가 DB·인증·스토리지에 직접" — 설명한다.
- Firebase와 Supabase를 **DB / 인증 / 실시간 / 접근 제어 / 생태계** 축으로 비교한다.
- 둘의 공통점(apiKey는 비밀 아님, 규칙이 접근 제어)을 안다.
- 프로젝트 성격에 따라 어느 쪽이 맞는지 판단한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 관계형 vs 비관계형(→ `relational-vs-nonrelational`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"BaaS 하나 쓰자" 하고 감으로 골랐다가, 관계·집계가 많은 커머스를 Firestore에 넣어 JOIN을 코드로
흉내 내거나, 반대로 단순 실시간 피드에 Postgres 스키마·마이그레이션 부담을 짊어진다.

<!-- section: concept -->
## BaaS란

전통적으로는 우리가 서버(Express) + DB(MySQL) + 인증 + 스토리지를 직접 만들었다.
**BaaS**는 그 전부를 서비스로 제공하고, 클라이언트 SDK가 직접 붙는다.

{{code: shared}}

가장 중요한 공통점: **접근 제어가 클라이언트 코드가 아니라 "규칙"에서 온다.** 버튼을 숨겨도
SDK를 직접 호출하면 우회되므로, Firebase는 **보안 규칙**, Supabase는 **RLS(Row Level Security)** 로 막는다.

<!-- section: mechanism -->
## 축별 비교

{{code: table}}

- **DB가 근본 차이다.** Firestore = 문서형 NoSQL(스키마 유연, JOIN 없음).
  Supabase = 진짜 PostgreSQL(SQL·JOIN·트랜잭션·외래키·뷰·함수 그대로).
- **인증**: Supabase는 사용자가 Postgres `auth.users` 테이블에 있어 관계형 데이터와 FK로 엮기 쉽다.
- **접근 제어 문법**: Firebase는 전용 규칙 언어, Supabase는 **SQL로 쓰는 RLS 정책**.
- **개방성**: Supabase는 오픈소스라 셀프호스팅·마이그레이션 여지가 있다. Firebase는 구글 생태계 통합이 강점.

<!-- section: concept | title: 선택 -->
## 고르는 기준

{{code: choose}}

한 줄: **문서·실시간·모바일 중심이면 Firebase, 관계·집계·SQL·SSR 인증이면 Supabase.**
학습/프로토타입 속도는 둘 다 빠르다.

<!-- section: must_know -->
## 반드시 기억할 것

- BaaS = 내 서버 없이 SDK가 DB·인증·스토리지에 직접. 접근 제어는 **규칙(보안 규칙 / RLS)**.
- 근본 차이는 **DB**: Firestore(문서 NoSQL) vs Supabase(PostgreSQL, SQL/JOIN/트랜잭션).
- Supabase 인증은 사용자가 **Postgres 테이블**에 있어 관계형 연동이 쉽다. RLS는 SQL로 작성.
- apiKey는 **둘 다 클라에 노출되는 식별자**(비밀 아님). 실제 방어는 규칙.
- 공통 리스크: 사용량 과금 + **벤더 종속(lock-in)**.
- 선택: 문서·실시간·모바일 → Firebase / 관계·집계·SSR 인증 → Supabase.

<!-- section: experiment -->
## 직접 해 보기

1. "실시간 채팅" / "온라인 서점(주문·정산·재고)" 각각에 어느 BaaS가 맞는지 이유와 함께 적어라.
2. Firestore와 Supabase에서 "회원의 주문 목록 + 각 주문의 상품명" 을 어떻게 조회하는지(중첩/복사 vs JOIN) 스케치하라.
3. Firebase 보안 규칙 한 줄과 Supabase RLS 정책 한 줄을 같은 요구("내 글만 수정")로 각각 써 보라.
4. 두 서비스의 무료 티어 한도를 공식 페이지에서 확인해 표로 정리하라.

<!-- section: check_question -->
## 이해 점검

1. BaaS에서 "버튼 숨기기"로 접근을 막을 수 없는 이유와, 실제 방어 수단은?
2. Firebase와 Supabase의 가장 근본적인 차이는?
3. Supabase 인증이 관계형 데이터와 잘 엮이는 이유는?
4. apiKey를 클라에 두는데 "비밀이 아니다"라는 게 무슨 뜻인가?
5. 커머스(주문·정산)에 Supabase를 권하는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "BaaS를 도입할 때의 장점과, 벤더 종속·쿼리 제약 같은 리스크는?"
- "Firestore 보안 규칙과 Postgres RLS의 차이를 설명해 주세요."
- "관계형 데이터가 많은 서비스에서 Firebase를 피하는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> BaaS 정의(SDK 직결 + 규칙), 근본 차이(Firestore NoSQL vs Supabase Postgres), RLS는 SQL,
> apiKey 비밀 아님, 선택 기준(문서·실시간 → Firebase / 관계·SSR → Supabase)을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**둘 다 내 서버 없이 SDK가 붙고 접근은 규칙이 막는 BaaS지만, Firebase는 Firestore(문서 NoSQL·실시간·모바일),
Supabase는 PostgreSQL(SQL·JOIN·트랜잭션·SQL로 쓰는 RLS·SSR 인증)이 강점이다 — 문서·실시간이면 Firebase,
관계·집계면 Supabase.**
