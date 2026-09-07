---
id: data-and-backend/relational-database-operations/schema-and-migrations
chapter: data-and-backend/relational-database-operations
title: 스키마 마이그레이션 실무
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [database, postgres, migration, supabase, cli]
related_material_ids: []
sources:
  - title: "Supabase Docs — Database Migrations"
    url: https://supabase.com/docs/guides/deployment/database-migrations
    publisher: "Supabase"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Supabase CLI Reference — supabase migration / supabase db"
    url: https://supabase.com/docs/reference/cli/supabase-migration-new
    publisher: "Supabase"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Supabase Docs — Local Development & CLI"
    url: https://supabase.com/docs/guides/local-development/overview
    publisher: "Supabase"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - data-and-backend/relational-database-operations/constraints-and-referential-integrity
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
code_examples:
  - slug: what
    title: 마이그레이션이란
    source_type: generated_minimal
    language: text
    code: |
      마이그레이션 = "스키마를 바꾸는 SQL" 을 파일로 만들어 버전 관리(git)하고 순서대로 적용하는 것

      supabase/migrations/
        20260826024724_create_learning_data_schema.sql
        20260826081927_create_refresh_state.sql
        20260827072917_grant_authenticated_select_core_tables.sql
        20260906120001_create_curriculum_core.sql
        ...
      파일명 = <타임스탬프>_<이름>.sql  → 타임스탬프 순으로 실행된다 (순서가 곧 이력)

      바꾸는 대상: 테이블·컬럼·제약·인덱스뿐 아니라
                   RLS 활성화·정책(policy)·GRANT·함수(RPC)·트리거도 전부 마이그레이션으로
  - slug: not-dump
    title: 이관 ≠ 마이그레이션
    source_type: generated_minimal
    language: text
    code: |
      이관 (supabase-in-a-real-project 에서 다룸)
        supabase db dump 로 스키마+데이터를 통째로 뽑아 → 새 프로젝트에 psql 로 복원
        "한 번" 하는 통짜 복사 (프로젝트 이사)

      마이그레이션 (이 Lesson)
        "그 다음부터" 스키마를 조금씩 바꿔 나가는 것 — 변경 하나 = 파일 하나, git 이력에 남음
        상시로 계속 쌓인다 (스키마의 진화 기록)
  - slug: cli
    title: CLI 흐름
    source_type: generated_minimal
    language: bash
    code: |
      # 1) 빈 마이그레이션 파일 생성 → 여기에 직접 SQL 작성
      supabase migration new add_post_pinned_flag
      #   → supabase/migrations/<timestamp>_add_post_pinned_flag.sql

      # (대안) 로컬 DB를 직접 고친 뒤, 변경분을 파일로 뽑아내기
      supabase db diff -f add_post_pinned_flag

      # 2) 로컬 DB를 초기화하고 모든 마이그레이션을 처음부터 다시 적용 → 새 파일 검증
      supabase db reset

      # 3) 검증되면 git 에 커밋 (여기까지가 "정상 경로")

      # 4) 원격(linked)에 아직 적용 안 된 마이그레이션만 밀어넣기
      supabase db push
  - slug: never-remote
    title: 원격 DB를 직접 고치지 않는다
    source_type: generated_minimal
    language: text
    code: |
      ❌ 대시보드 SQL Editor / Table Editor 로 운영 DB 스키마를 직접 수정
         → 그 변경은 마이그레이션 이력에 없음
         → 다음 supabase db push 가 "로컬 이력과 원격 상태가 어긋남" 으로 실패
         → supabase migration list 로 어긋난 지점 확인, db pull / migration repair 로 수습해야 함

      ✅ 모든 스키마 변경은 반드시 마이그레이션 파일을 거친다 (로컬 작성 → reset 검증 → git → push)
  - slug: rollback
    title: 되돌리기 = 새 마이그레이션
    source_type: generated_minimal
    language: sql
    code: |
      -- 이미 push 된 마이그레이션 파일을 "수정" 하거나 "삭제" 하지 않는다 (이력이 깨진다)
      -- 잘못을 되돌리려면: 되돌리는 내용의 "새" 마이그레이션을 추가한다

      -- 20260907090000_add_post_pinned_flag.sql  (이미 적용됨)
      --   alter table post add column pinned boolean not null default false;

      -- 20260907140000_revert_post_pinned_flag.sql  (새 파일로 되돌림)
      alter table post drop column pinned;
  - slug: team
    title: 팀 워크플로
    source_type: generated_minimal
    language: text
    code: |
      기능 브랜치에서:
        1. supabase migration new <이름> 으로 파일 작성
        2. supabase db reset 로 로컬에서 전체 재적용 테스트
        3. git commit → PR
      머지 후:
        4. git pull 로 남의 마이그레이션까지 받고 supabase db reset 로 로컬 동기화
        5. supabase db push 는 한 번에 한 사람만 (동시에 밀면 원격 이력이 꼬인다)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **마이그레이션 = 스키마 변경 SQL을 파일로 버전 관리하고 순서대로 적용**하는 것임을 설명한다.
- `supabase/migrations/<타임스탬프>_<이름>.sql` 구조와, 파일 순서가 곧 적용 이력임을 안다.
- `supabase migration new`, `supabase db diff -f`, `supabase db reset`, `supabase db push` 의 역할을 구분해 쓴다.
- **원격 DB를 대시보드로 직접 고치면 안 되는 이유**(이력 어긋남 → `db push` 실패)를 안다.
- 팀 워크플로(로컬 작성 → `db reset` 검증 → git 커밋 → 원격 push, push는 한 명만)를 설명한다.
- **되돌리기 = 기존 파일 수정이 아니라 되돌리는 새 마이그레이션 추가**임을 안다.
- RLS·정책·GRANT·함수 변경도 마이그레이션 대상임을 안다.
- **이관(한 번의 통짜 복사)과 마이그레이션(상시 스키마 진화)** 을 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 제약·인덱스(`constraints-and-referential-integrity`), Supabase 프로젝트 구조·RLS·이관(`supabase-in-a-real-project`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

혼자 개발할 땐 대시보드에서 컬럼을 추가하면 됐다. 그런데 팀원이 생기니:
"네 로컬엔 그 컬럼이 있는데 내 로컬엔 없다", "운영 DB엔 언제 반영하지?", "지난주 그 변경 왜 했더라?"
스키마 변경에 **이력과 절차**가 없으면 환경마다 스키마가 달라지고 되돌릴 수도 없다.

<!-- section: concept -->
## 1. 마이그레이션이란

{{code: what}}

- 스키마를 바꾸는 SQL을 **파일**로 만들어 git으로 버전 관리하고, **타임스탬프 순서대로** 적용한다.
- 파일 하나 = 변경 하나. 파일들의 나열이 곧 **스키마의 변경 이력**이다.
- 테이블·컬럼·제약·인덱스만이 아니라 **RLS 활성화, 정책(policy), `GRANT`, 함수(RPC), 트리거** 변경도
  전부 마이그레이션으로 한다(이 저장소의 `..._grant_authenticated_select_core_tables.sql`,
  `..._create_refresh_state.sql` 안의 `enable row level security` 가 그 예).

<!-- section: concept | title: 이관과 구분 -->
## 2. 이관 ≠ 마이그레이션

{{code: not-dump}}

- **이관**(`supabase-in-a-real-project` §이관): `supabase db dump` → `psql` 복원. 프로젝트를 통째로
  옮기는 **일회성** 작업.
- **마이그레이션**(이 Lesson): 그 이후로 스키마를 **조금씩 계속** 바꿔 나가는 것. 변경마다 파일이 쌓인다.
- 헷갈리지 말 것: 이관은 "이사", 마이그레이션은 "이사한 집을 계속 고치는 기록".

<!-- section: code | title: CLI 흐름 | lang: bash -->
## 3. CLI 흐름

{{code: cli}}

- **`supabase migration new <이름>`**: 빈 `.sql` 파일을 만든다 → 여기에 `alter table ...` 등을 직접 쓴다.
- **`supabase db diff -f <이름>`**: 로컬 DB를 먼저 고쳐 놓고, 현재 스키마와 마이그레이션 이력의 차이를
  파일로 뽑아낸다(직접 쓰기 대신).
- **`supabase db reset`**: 로컬 DB를 비우고 **모든 마이그레이션을 처음부터 다시 적용**한다 → 새 파일이
  깨끗한 상태에서도 도는지 검증.
- **`supabase db push`**: 로컬 이력 중 **원격(linked)에 아직 없는** 마이그레이션만 원격에 적용한다.
- (참고: 로컬에서 한 단계씩 올릴 때는 `supabase migration up`.)

<!-- section: mechanism | title: 원격 직접 수정 금지 -->
## 4. 원격 DB를 직접 고치지 않는다

{{code: never-remote}}

- 대시보드 SQL Editor / Table Editor로 **운영 DB 스키마를 직접 바꾸면** 그 변경은 마이그레이션 이력에
  없다 → 다음 `supabase db push` 가 **"로컬 이력과 원격 상태 불일치"** 로 실패한다.
- 수습: `supabase migration list` 로 어긋난 지점을 보고, `supabase db pull`(원격 변경을 파일로 가져오기)
  또는 `supabase migration repair`(이력 레코드 교정).
- 원칙: **모든 스키마 변경은 마이그레이션 파일을 거친다.** (이 저장소의
  `20260826024724_create_learning_data_schema.sql` 머리말이 "사후 복원본 — 다시 실행하지 마세요" 라고
  적힌 것도, 원격에 이미 손으로 반영된 걸 뒤늦게 이력으로 맞춘 흔적이다.)

<!-- section: mechanism | title: 되돌리기 -->
## 5. 되돌리기 = 새 마이그레이션

{{code: rollback}}

- 이미 push된 마이그레이션 파일을 **수정하거나 삭제하지 않는다** — 다른 사람·다른 환경의 이력과 어긋난다.
- 잘못을 되돌리려면 **되돌리는 내용의 새 마이그레이션 파일**을 추가한다(컬럼 추가 → 되돌릴 땐 컬럼 삭제 파일).
- 아직 아무 데도 push/공유하지 않은 **로컬 전용** 파일이라면 고쳐도 된다(그 경우 `db reset` 으로 재검증).

<!-- section: concept | title: 팀 워크플로 -->
## 6. 팀 워크플로

{{code: team}}

- 기능 브랜치에서 `migration new` → SQL 작성 → `db reset` 로 전체 재적용 테스트 → git 커밋 → PR.
- 머지 후 `git pull` 로 남의 마이그레이션까지 받고 `db reset` 로 로컬을 다시 맞춘다.
- **`supabase db push` 는 한 번에 한 사람만.** 여러 명이 동시에 밀면 원격 이력 순서가 꼬인다.

<!-- section: must_know -->
## 반드시 기억할 것

- 마이그레이션 = 스키마 변경 SQL을 **파일로 버전 관리**하고 **타임스탬프 순서**대로 적용. 파일 나열 = 이력.
- 경로/이름: `supabase/migrations/<타임스탬프>_<이름>.sql`.
- `migration new`(빈 파일 작성) / `db diff -f`(로컬 변경을 파일로 추출) / `db reset`(전체 재적용 검증) /
  `db push`(원격에 미적용분 반영).
- **원격 DB를 대시보드로 직접 수정 금지** → 이력 불일치 → `db push` 실패 → `migration list`/`db pull`/`migration repair` 로 수습.
- **되돌리기 = 기존 파일 수정이 아니라 되돌리는 새 마이그레이션 추가.** 로컬 전용·미공유 파일만 직접 수정 가능.
- **RLS·정책·GRANT·함수·트리거** 변경도 마이그레이션 대상.
- 팀: 브랜치에서 작성 → `db reset` 검증 → 커밋 → 머지 후 pull+reset. **`db push` 는 한 명만.**
- **이관(일회성 통짜 복사) ≠ 마이그레이션(상시 스키마 진화).**
- CLI 명령·플래그는 버전에 따라 바뀔 수 있다 → 공식 CLI 레퍼런스로 확인.

<!-- section: experiment -->
## 직접 해 보기

1. `supabase migration new add_demo_column` 으로 파일을 만들고 `alter table ... add column ...` 을 넣은 뒤 `supabase db reset` 으로 적용되는지 확인하라.
2. 로컬 DB에서 직접 컬럼을 하나 더 추가한 뒤 `supabase db diff -f capture_demo` 로 그 변경이 파일로 잡히는지 보라.
3. 이 저장소의 `supabase/migrations/` 파일 하나를 열어 헤더 주석·`create table if not exists`·`enable row level security` 패턴을 관찰하라.
4. 방금 만든 `add_demo_column` 을 되돌리는 `drop_demo_column` 마이그레이션을 **새 파일로** 추가하고 `db reset` 하라(기존 파일을 지우지 말 것).
5. `supabase migration list` 로 로컬과 원격(linked라면) 이력 상태를 비교해 보라.
6. RLS 정책 하나(`create policy ...`)를 마이그레이션으로 추가하고, 스키마 변경만이 마이그레이션 대상이 아님을 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 마이그레이션 파일명의 타임스탬프는 왜 중요한가?
2. `supabase db reset` 과 `supabase db push` 는 각각 무엇을 하나?
3. 운영 대시보드에서 컬럼을 직접 추가하면 나중에 무슨 문제가 생기나?
4. 이미 push한 마이그레이션에서 실수를 발견했다. 어떻게 되돌리나?
5. RLS 정책 변경도 마이그레이션으로 관리해야 하나? 왜?
6. "Supabase 이관" 과 "스키마 마이그레이션" 은 어떻게 다른가?

<!-- section: interview_question -->
## 면접 대비

- "DB 마이그레이션을 왜 쓰나요? 버전 관리와 어떤 관계인가요?"
- "여러 명이 같은 DB 스키마를 바꿀 때 충돌을 어떻게 관리하나요?"
- "적용된 마이그레이션을 롤백하는 안전한 방법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 마이그레이션=스키마 변경 SQL 파일을 버전 관리·순서 적용, migration new/db diff/db reset/db push,
> 원격 직접 수정 금지→이력 불일치, 되돌리기=새 파일, RLS·GRANT·함수도 대상, 팀은 reset 검증 후 push 한 명만,
> 이관≠마이그레이션을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**스키마 마이그레이션은 모든 DB 구조·정책 변경을 `supabase/migrations/` 아래 타임스탬프 SQL 파일로
버전 관리하고 `db reset` 으로 검증한 뒤 `db push` 로 원격에 순서대로 반영하는 절차다 — 원격을 직접 고치지
않고, 되돌릴 때도 기존 파일을 건드리지 않고 새 마이그레이션을 추가하며, 이는 프로젝트를 통째로 옮기는
일회성 '이관' 과는 다르다.**
