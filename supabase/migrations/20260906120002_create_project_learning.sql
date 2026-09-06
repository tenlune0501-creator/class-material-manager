-- CMM DB Schema v2.1 — (2/4) Project Reverse Engineering (신규 5개 테이블)
--
--   learning_projects → project_learning_units → project_unit_sections
--   project_learning_units ⟶ project_unit_examples (기존 project_examples loose ref)
--   learning_lessons ⟷ project_learning_units (lesson_project_links, M:N)
--
-- ■ 격리 원칙
--   기존 project_examples / material_metadata / reference_documents 로의 하드 FK 없음.
--   - project_unit_examples.example_id : project_examples.id 로의 loose reference (FK 아님)
--   - related_material_ids : material_metadata.source_id 로의 loose reference (jsonb, FK 아님)
--   project_unit_sections 는 lesson_sections 와 동일 구조지만 별도 테이블로 유지한다
--   (polymorphic 으로 합치지 않음 — 무결성·명확성 우선, 진짜 FK).
--
-- ■ RLS/GRANT : 콘텐츠 테이블 공통 (파일 1 헤더 참고).
--   revoke all from anon, authenticated, service_role
--     → grant select                to authenticated
--     → grant select, insert, update to service_role   (DELETE 없음, anon 없음)

-- ── learning_projects : RE 대상 프로젝트 카탈로그 ────────────────────────────
create table if not exists public.learning_projects (
  id           text primary key,
  title        text not null,
  summary      text,
  repo_url     text,
  repo_ref     text,
  stack        jsonb not null default '[]'::jsonb,
  ord          int  not null default 0,
  content_hash text,
  synced_at    timestamptz not null default now()
);

create index if not exists learning_projects_ord_idx on public.learning_projects (ord);

alter table public.learning_projects enable row level security;

create policy "authenticated can read learning_projects"
  on public.learning_projects for select
  to authenticated
  using (true);

revoke all on table public.learning_projects from anon, authenticated, service_role;
grant select on public.learning_projects to authenticated;
grant select, insert, update on public.learning_projects to service_role;

-- ── project_learning_units : 프로젝트 내부 학습 단위 ─────────────────────────
create table if not exists public.project_learning_units (
  id                   text primary key,
  project_id           text not null references public.learning_projects (id) on delete cascade,
  title                text not null,
  summary              text,
  feature_area         text,
  unit_kind            text not null default 'feature'
                         check (unit_kind in ('overview', 'feature', 'component',
                                              'hook', 'data_model', 'infra')),
  concepts             jsonb not null default '[]'::jsonb,
  related_material_ids jsonb not null default '[]'::jsonb,  -- loose ref → material_metadata.source_id
  ord                  int  not null default 0,
  content_hash         text,
  synced_at            timestamptz not null default now()
);

create index if not exists project_learning_units_project_ord_idx
  on public.project_learning_units (project_id, ord);

alter table public.project_learning_units enable row level security;

create policy "authenticated can read project_learning_units"
  on public.project_learning_units for select
  to authenticated
  using (true);

revoke all on table public.project_learning_units from anon, authenticated, service_role;
grant select on public.project_learning_units to authenticated;
grant select, insert, update on public.project_learning_units to service_role;

-- ── project_unit_sections : Project Unit 내 가변 블록 (unit 전용, 진짜 FK) ─────
create table if not exists public.project_unit_sections (
  id               text primary key,
  unit_id          text not null references public.project_learning_units (id) on delete cascade,
  section_type     text not null,
  title            text,
  body             text not null,
  lang             text,
  is_optional      boolean not null default false,
  code_example_ids jsonb not null default '[]'::jsonb,
  ord              int  not null default 0,
  content_hash     text,
  synced_at        timestamptz not null default now(),
  unique (unit_id, section_type, ord)
);

create index if not exists project_unit_sections_unit_ord_idx
  on public.project_unit_sections (unit_id, ord);

alter table public.project_unit_sections enable row level security;

create policy "authenticated can read project_unit_sections"
  on public.project_unit_sections for select
  to authenticated
  using (true);

revoke all on table public.project_unit_sections from anon, authenticated, service_role;
grant select on public.project_unit_sections to authenticated;
grant select, insert, update on public.project_unit_sections to service_role;

-- ── project_unit_examples : project_learning_units ↔ 기존 project_examples ────
--   example_id 는 project_examples.id 로의 loose reference (FK 아님 — 별도 sync 파이프라인 격리).
--   composite natural key (unit_id, example_id).
create table if not exists public.project_unit_examples (
  unit_id    text not null references public.project_learning_units (id) on delete cascade,
  example_id text not null,                     -- loose ref → project_examples.id
  role_note  text,
  ord        int  not null default 0,
  synced_at  timestamptz not null default now(),
  primary key (unit_id, example_id)
);

create index if not exists project_unit_examples_example_idx
  on public.project_unit_examples (example_id);

alter table public.project_unit_examples enable row level security;

create policy "authenticated can read project_unit_examples"
  on public.project_unit_examples for select
  to authenticated
  using (true);

revoke all on table public.project_unit_examples from anon, authenticated, service_role;
grant select on public.project_unit_examples to authenticated;
grant select, insert, update on public.project_unit_examples to service_role;

-- ── lesson_project_links : learning_lessons ↔ project_learning_units (M:N) ────
--   양 끝 모두 신규 sync-curriculum 관리 테이블 → 양쪽 진짜 FK + CASCADE.
create table if not exists public.lesson_project_links (
  lesson_id     text not null references public.learning_lessons (id) on delete cascade,
  unit_id       text not null references public.project_learning_units (id) on delete cascade,
  relation_note text,
  ord           int  not null default 0,
  synced_at     timestamptz not null default now(),
  primary key (lesson_id, unit_id)
);

create index if not exists lesson_project_links_unit_idx
  on public.lesson_project_links (unit_id);

alter table public.lesson_project_links enable row level security;

create policy "authenticated can read lesson_project_links"
  on public.lesson_project_links for select
  to authenticated
  using (true);

revoke all on table public.lesson_project_links from anon, authenticated, service_role;
grant select on public.lesson_project_links to authenticated;
grant select, insert, update on public.lesson_project_links to service_role;
