-- CMM DB Schema v2.1 — (4/4) GPT 학습 세션 반영 이력 (신규 1개 테이블)
--
--   learning_session_imports
--     · CMM_STUDY_RESULT.json 반영의 idempotency 앵커 + 최소 감사 로그.
--     · applied import 만 저장한다. rejected(검증 실패) import 는 DB 에 저장하지 않는다
--       (운영 도구가 대화/자체 로그로만 처리).
--     · normalized_payload 는 검증·정규화된 Result JSON — 전체 transcript 저장 금지.
--     · import_hash = sha256(canonical normalized_payload). source 는 해시에서 제외
--       (ChatGPT/Claude Code/Codex 중 어느 도구로 반영해도 동일 해시 → 1회 적용).
--     · target_id 는 loose reference (lesson | project_unit). 감사 durability 상 FK 안 검.
--
-- ■ 이번 최종 설계에서 사용하지 않는 컬럼: validation_status, validation_errors, created_at.
--
-- ■ RLS/GRANT (append-only 감사)
--   RLS 활성. authenticated SELECT/INSERT policy 를 auth.uid()=user_id 로 스코프.
--   UPDATE policy 없음, DELETE policy 없음.
--   권한은 환경 default 와 무관하게 migration 이 직접 보장:
--     revoke all from anon, authenticated, service_role
--     → grant select, insert to authenticated
--   authenticated UPDATE/DELETE 없음. service_role GRANT 없음. anon 권한 없음.

create table if not exists public.learning_session_imports (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  source             text not null
                       check (source in ('chatgpt', 'claude_code', 'codex', 'other')),
  target_kind        text not null check (target_kind in ('lesson', 'project_unit')),
  target_id          text not null,               -- loose ref
  schema_version     integer not null,
  studied_at         timestamptz not null,
  import_hash        text not null,
  normalized_payload jsonb not null,
  applied_counts     jsonb not null default '{}'::jsonb,
  warnings           jsonb not null default '[]'::jsonb,
  applied_at         timestamptz not null default now(),
  unique (user_id, import_hash)
);

create index if not exists learning_session_imports_target_idx
  on public.learning_session_imports (user_id, target_kind, target_id);
create index if not exists learning_session_imports_applied_idx
  on public.learning_session_imports (user_id, applied_at desc);

alter table public.learning_session_imports enable row level security;

create policy "users select own learning_session_imports"
  on public.learning_session_imports for select to authenticated
  using (auth.uid() = user_id);
create policy "users insert own learning_session_imports"
  on public.learning_session_imports for insert to authenticated
  with check (auth.uid() = user_id);

revoke all on table public.learning_session_imports from anon, authenticated, service_role;
grant select, insert on public.learning_session_imports to authenticated;
