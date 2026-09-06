-- CMM DB Schema v2.1 — (3/4) 사용자 학습 데이터 (신규 4개 테이블)
--
--   user_lesson_progress / user_project_progress / user_learning_notes / user_review_items
--
-- ■ FK 전략
--   - user_id → auth.users(id) ON DELETE CASCADE   (계정 삭제 시 사용자 데이터 삭제)
--   - user_lesson_progress.lesson_id → learning_lessons(id) ON DELETE RESTRICT
--   - user_project_progress.unit_id  → project_learning_units(id) ON DELETE RESTRICT
--       진짜 FK. sync-curriculum 은 upsert-only(DELETE 없음)이라 정상 sync 에서 트리거되지
--       않고, 잘못된 target ID 삽입을 막으며, "사용자 이력이 걸린 콘텐츠"의 수동 삭제를
--       RESTRICT 로 막아 의식적 처리(재배정/보존)를 강제한다.
--       lesson_id / unit_id 단독 인덱스를 두어 RESTRICT 검사·parent DELETE 비용을 낮춘다.
--   - notes/review 의 target_id/source_id 는 polymorphic(lesson|project_unit|section)이라
--     하드 FK 불가 → loose text reference. target_kind CHECK + 자연키 UNIQUE 로 무결성 확보.
--
-- ■ user_review_items.prompt_hash
--   복습항목 idempotency 자연키의 일부. 운영 도구는 prompt 를 확정된 정규화 규칙(trim/NFC 등)
--   으로 먼저 정규화한 문자열 자체를 prompt 컬럼에 저장하고, 그 저장값의 md5 를 prompt_hash
--   로 쓴다. DB 는 prompt_hash = md5(prompt) 를 CHECK 로 강제해 도구 간 hash 계산 drift 로
--   중복 항목이 생기는 것을 막는다. (generated column 재설계는 하지 않음 — CHECK 만.)
--
-- ■ RLS/GRANT (사용자 테이블 공통)
--   RLS 활성. authenticated SELECT/INSERT/UPDATE/DELETE policy 를 auth.uid()=user_id 로 스코프.
--   권한은 환경 default 와 무관하게 migration 이 직접 보장:
--     revoke all from anon, authenticated, service_role
--     → grant select, insert, update, delete to authenticated
--   service_role GRANT 없음. anon 권한 없음. (운영 도구는 owner 연결로 RLS/GRANT 우회.)
--
-- ■ updated_at : 트리거를 두지 않는다(프로젝트 무트리거 관례). 모든 UPDATE writer 는
--   updated_at = now() 를 함께 갱신하는 계약이다 (viewer / Result JSON mapper /
--   USE_CMM_FOR_STUDY.md 구현 시 반드시 반영).

-- ── user_lesson_progress ────────────────────────────────────────────────────
create table if not exists public.user_lesson_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  lesson_id        text not null references public.learning_lessons (id) on delete restrict,
  status           text not null default 'not_started'
                     check (status in ('not_started', 'learning', 'completed', 'review')),
  started_at       timestamptz,
  completed_at     timestamptz,
  last_studied_at  timestamptz,
  review_count     int not null default 0,
  next_start_point text,
  last_summary     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists user_lesson_progress_user_status_idx
  on public.user_lesson_progress (user_id, status);
create index if not exists user_lesson_progress_lesson_idx
  on public.user_lesson_progress (lesson_id);

alter table public.user_lesson_progress enable row level security;

create policy "users select own user_lesson_progress"
  on public.user_lesson_progress for select to authenticated
  using (auth.uid() = user_id);
create policy "users insert own user_lesson_progress"
  on public.user_lesson_progress for insert to authenticated
  with check (auth.uid() = user_id);
create policy "users update own user_lesson_progress"
  on public.user_lesson_progress for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own user_lesson_progress"
  on public.user_lesson_progress for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.user_lesson_progress from anon, authenticated, service_role;
grant select, insert, update, delete on public.user_lesson_progress to authenticated;

-- ── user_project_progress (진행 상태 구조는 user_lesson_progress 와 동일) ─────
create table if not exists public.user_project_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  unit_id          text not null references public.project_learning_units (id) on delete restrict,
  status           text not null default 'not_started'
                     check (status in ('not_started', 'learning', 'completed', 'review')),
  started_at       timestamptz,
  completed_at     timestamptz,
  last_studied_at  timestamptz,
  review_count     int not null default 0,
  next_start_point text,
  last_summary     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, unit_id)
);

create index if not exists user_project_progress_user_status_idx
  on public.user_project_progress (user_id, status);
create index if not exists user_project_progress_unit_idx
  on public.user_project_progress (unit_id);

alter table public.user_project_progress enable row level security;

create policy "users select own user_project_progress"
  on public.user_project_progress for select to authenticated
  using (auth.uid() = user_id);
create policy "users insert own user_project_progress"
  on public.user_project_progress for insert to authenticated
  with check (auth.uid() = user_id);
create policy "users update own user_project_progress"
  on public.user_project_progress for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own user_project_progress"
  on public.user_project_progress for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.user_project_progress from anon, authenticated, service_role;
grant select, insert, update, delete on public.user_project_progress to authenticated;

-- ── user_learning_notes (이해/혼동/다시볼것/한줄요약/자유메모, polymorphic 유지) ─
create table if not exists public.user_learning_notes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  target_kind      text not null check (target_kind in ('lesson', 'project_unit', 'section')),
  target_id        text not null,                 -- loose ref
  understood       jsonb not null default '[]'::jsonb,
  confusing        jsonb not null default '[]'::jsonb,
  review_later     jsonb not null default '[]'::jsonb,
  one_line_summary text,
  body             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, target_kind, target_id)
);

create index if not exists user_learning_notes_user_kind_idx
  on public.user_learning_notes (user_id, target_kind);

alter table public.user_learning_notes enable row level security;

create policy "users select own user_learning_notes"
  on public.user_learning_notes for select to authenticated
  using (auth.uid() = user_id);
create policy "users insert own user_learning_notes"
  on public.user_learning_notes for insert to authenticated
  with check (auth.uid() = user_id);
create policy "users update own user_learning_notes"
  on public.user_learning_notes for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own user_learning_notes"
  on public.user_learning_notes for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.user_learning_notes from anon, authenticated, service_role;
grant select, insert, update, delete on public.user_learning_notes to authenticated;

-- ── user_review_items (간격 반복 복습 항목, polymorphic 유지) ─────────────────
create table if not exists public.user_review_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  source_kind    text not null check (source_kind in ('lesson', 'project_unit', 'section')),
  source_id      text not null,                  -- loose ref
  kind           text not null
                   check (kind in ('concept', 'explain', 'code_blank',
                                   'debug', 'mission', 'interview')),
  prompt         text not null,
  prompt_hash    text not null,
  status         text not null default 'active'
                   check (status in ('active', 'suspended', 'archived')),
  next_review_at   timestamptz,
  last_reviewed_at timestamptz,
  ease           numeric not null default 2.5,
  interval_days  int not null default 0,
  correct_count  int not null default 0,
  wrong_count    int not null default 0,
  last_result    text check (last_result is null
                             or last_result in ('again', 'hard', 'good', 'easy')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, source_kind, source_id, kind, prompt_hash),
  constraint user_review_items_prompt_hash_chk check (prompt_hash = md5(prompt))
);

create index if not exists user_review_items_due_idx
  on public.user_review_items (user_id, status, next_review_at);

alter table public.user_review_items enable row level security;

create policy "users select own user_review_items"
  on public.user_review_items for select to authenticated
  using (auth.uid() = user_id);
create policy "users insert own user_review_items"
  on public.user_review_items for insert to authenticated
  with check (auth.uid() = user_id);
create policy "users update own user_review_items"
  on public.user_review_items for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own user_review_items"
  on public.user_review_items for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.user_review_items from anon, authenticated, service_role;
grant select, insert, update, delete on public.user_review_items to authenticated;
