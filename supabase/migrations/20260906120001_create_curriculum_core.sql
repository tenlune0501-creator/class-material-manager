-- CMM DB Schema v2.1 — (1/4) Curriculum 콘텐츠 코어 (신규 6개 테이블)
--
--   learning_tracks → learning_chapters → learning_lessons
--   learning_lessons ⟶ lesson_sections / lesson_code_examples / lesson_problem
--
-- ■ 격리 원칙
--   기존 9개 테이블(material_metadata, relations, learning_documents, comparisons,
--   study_guides, material_bodies, reference_documents, project_examples, refresh_state)은
--   수정하지 않는다. 신규 콘텐츠에서 기존 테이블로의 하드 FK 는 만들지 않는다.
--   - related_material_ids : material_metadata.source_id 로의 loose reference (jsonb, FK 아님)
--   - lesson_code_examples.project_example_id : project_examples.id 로의 loose reference (FK 아님)
--   - lesson_sources[].reference_slug (sources jsonb 내부) : reference_documents 로의 loose reference
--   → sync-curriculum(upsert-only, 별도 CLI)만 이 테이블들을 쓴다. refresh/ci-refresh/
--     sync-runner/verify 파이프라인에는 포함하지 않는다.
--
-- ■ RLS/GRANT (콘텐츠 테이블 공통)
--   RLS 활성 + authenticated SELECT policy.
--   권한은 환경 default privileges 와 무관하게 migration 이 직접 보장한다:
--     revoke all from anon, authenticated, service_role
--     → grant select                     to authenticated
--     → grant select, insert, update      to service_role   (DELETE 없음)
--   anon 은 어떤 권한도 갖지 않는다.
--   ensure_rls 이벤트 트리거가 있어도 fresh clone 재현성을 위해 ENABLE 을 명시한다.

-- ── learning_tracks : 최상위 학습 축 ──────────────────────────────────────────
create table if not exists public.learning_tracks (
  id           text primary key,
  title        text not null,
  summary      text,
  kind         text not null default 'curriculum'
                 check (kind in ('curriculum', 'coding_test')),
  accent       text,
  ord          int  not null default 0,
  content_hash text,
  synced_at    timestamptz not null default now()
);

create index if not exists learning_tracks_ord_idx on public.learning_tracks (ord);

alter table public.learning_tracks enable row level security;

create policy "authenticated can read learning_tracks"
  on public.learning_tracks for select
  to authenticated
  using (true);

revoke all on table public.learning_tracks from anon, authenticated, service_role;
grant select on public.learning_tracks to authenticated;
grant select, insert, update on public.learning_tracks to service_role;

-- ── learning_chapters : 트랙 내 중단원 ───────────────────────────────────────
create table if not exists public.learning_chapters (
  id           text primary key,
  track_id     text not null references public.learning_tracks (id) on delete cascade,
  title        text not null,
  summary      text,
  ord          int  not null default 0,
  content_hash text,
  synced_at    timestamptz not null default now()
);

create index if not exists learning_chapters_track_ord_idx
  on public.learning_chapters (track_id, ord);

alter table public.learning_chapters enable row level security;

create policy "authenticated can read learning_chapters"
  on public.learning_chapters for select
  to authenticated
  using (true);

revoke all on table public.learning_chapters from anon, authenticated, service_role;
grant select on public.learning_chapters to authenticated;
grant select, insert, update on public.learning_chapters to service_role;

-- ── learning_lessons : 학습 단위 (정규 + 코딩테스트 문제) ─────────────────────
--   track_id 비정규화 없음 — track 은 chapter → learning_chapters.track_id 로 조인.
create table if not exists public.learning_lessons (
  id                   text primary key,
  chapter_id           text not null references public.learning_chapters (id) on delete cascade,
  title                text not null,
  mastery              text not null
                         check (mastery in ('understand', 'required', 'practical')),
  lesson_kind          text not null default 'lesson'
                         check (lesson_kind in ('lesson', 'problem')),
  summary              text,
  estimated_minutes    int,
  tags                 jsonb not null default '[]'::jsonb,
  sources              jsonb not null default '[]'::jsonb,
  related_material_ids jsonb not null default '[]'::jsonb,  -- loose ref → material_metadata.source_id
  ord                  int  not null default 0,
  content_hash         text,
  synced_at            timestamptz not null default now()
);

create index if not exists learning_lessons_chapter_ord_idx
  on public.learning_lessons (chapter_id, ord);
create index if not exists learning_lessons_problem_idx
  on public.learning_lessons (lesson_kind) where lesson_kind = 'problem';

alter table public.learning_lessons enable row level security;

create policy "authenticated can read learning_lessons"
  on public.learning_lessons for select
  to authenticated
  using (true);

revoke all on table public.learning_lessons from anon, authenticated, service_role;
grant select on public.learning_lessons to authenticated;
grant select, insert, update on public.learning_lessons to service_role;

-- ── lesson_sections : Lesson 내 가변 블록 (lesson 전용, 진짜 FK) ──────────────
--   section_type 은 진화하는 어휘라 CHECK 를 걸지 않는다 (sync 가 미등록 유형을 경고).
--   권장값: goal, dev_problem, concept, mechanism, code, code_breakdown, experiment,
--           must_know, delegatable, optional_deep_dive, mission, project_link,
--           interview_question, check_question, digest_prompt, review
create table if not exists public.lesson_sections (
  id               text primary key,
  lesson_id        text not null references public.learning_lessons (id) on delete cascade,
  section_type     text not null,
  title            text,
  body             text not null,
  lang             text,
  is_optional      boolean not null default false,
  code_example_ids jsonb not null default '[]'::jsonb,  -- loose ref → lesson_code_examples.id
  ord              int  not null default 0,
  content_hash     text,
  synced_at        timestamptz not null default now(),
  unique (lesson_id, section_type, ord)
);

create index if not exists lesson_sections_lesson_ord_idx
  on public.lesson_sections (lesson_id, ord);

alter table public.lesson_sections enable row level security;

create policy "authenticated can read lesson_sections"
  on public.lesson_sections for select
  to authenticated
  using (true);

revoke all on table public.lesson_sections from anon, authenticated, service_role;
grant select on public.lesson_sections to authenticated;
grant select, insert, update on public.lesson_sections to service_role;

-- ── lesson_code_examples : 코드 예제 4종 ─────────────────────────────────────
--   project_example_id 는 기존 project_examples.id 로의 loose reference (FK 아님).
--   의미(변경 없음):
--     source_type = 'user_project'  → project_example_id 또는 inline code 중 하나가 있으면 허용
--     source_type != 'user_project' → code 필요
--   빈 문자열은 "존재함" 으로 인정하지 않는다 (NULL 뿐 아니라 '' / 공백도 거부).
create table if not exists public.lesson_code_examples (
  id                 text primary key,
  lesson_id          text not null references public.learning_lessons (id) on delete cascade,
  title              text not null,
  source_type        text not null
                       check (source_type in ('official_example', 'verified_oss',
                                              'generated_minimal', 'user_project')),
  summary            text,
  language           text,
  code               text,
  project_example_id text,                         -- loose ref → project_examples.id
  source_name        text,
  source_url         text,
  repo_url           text,
  repo_ref           text,
  file_path          text,
  line_start         int,
  line_end           int,
  license            text,
  license_url        text,
  authorship_note    text,
  is_canonical       boolean not null default false,
  ord                int  not null default 0,
  content_hash       text,
  synced_at          timestamptz not null default now(),
  constraint lesson_code_examples_code_present_chk
    check ((source_type = 'user_project'
            and nullif(btrim(project_example_id), '') is not null)
           or nullif(btrim(code), '') is not null)
);

create index if not exists lesson_code_examples_lesson_ord_idx
  on public.lesson_code_examples (lesson_id, ord);

alter table public.lesson_code_examples enable row level security;

create policy "authenticated can read lesson_code_examples"
  on public.lesson_code_examples for select
  to authenticated
  using (true);

revoke all on table public.lesson_code_examples from anon, authenticated, service_role;
grant select on public.lesson_code_examples to authenticated;
grant select, insert, update on public.lesson_code_examples to service_role;

-- ── lesson_problem : 코딩테스트형 lesson 전용 필드 (1:1 확장) ──────────────────
create table if not exists public.lesson_problem (
  lesson_id        text primary key references public.learning_lessons (id) on delete cascade,
  statement        text not null,
  constraints      text,
  difficulty       text,
  time_complexity  text,
  space_complexity text,
  hints            jsonb not null default '[]'::jsonb,
  solutions        jsonb not null default '[]'::jsonb,
  test_cases       jsonb not null default '[]'::jsonb,
  source_name      text,
  source_url       text,
  content_hash     text,
  synced_at        timestamptz not null default now()
);

alter table public.lesson_problem enable row level security;

create policy "authenticated can read lesson_problem"
  on public.lesson_problem for select
  to authenticated
  using (true);

revoke all on table public.lesson_problem from anon, authenticated, service_role;
grant select on public.lesson_problem to authenticated;
grant select, insert, update on public.lesson_problem to service_role;
