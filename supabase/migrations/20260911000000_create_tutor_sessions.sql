-- CMM AI Tutor — 세션 이력 (신규 1개 테이블)
--
--   tutor_sessions
--     · 실시간 AI Tutor(음성/텍스트 과외) 세션 1회 = 행 1개. 세션 "이력"이다.
--     · "현재 진도"는 기존 user_lesson_progress / user_project_progress 가 이미 담당한다
--       (Schema v2.1, 20260906120003_create_user_learning.sql). 이 테이블은 그것을
--       대체하지 않고, 세션 단위로만 존재하는 것(시작/종료 시각, 그 세션의 요약 초안,
--       그 세션이 끝나며 추천한 다음 Lesson)만 추가로 담는다.
--     · 종료 확정 시 애플리케이션(뷰어)이 이 행을 쓰는 것과 같은 트랜잭션 성격으로
--       user_lesson_progress / user_project_progress / user_learning_notes /
--       user_review_items 를 함께 upsert 한다 — 이 테이블은 그 4개를 대체하지 않는다.
--     · next_target_* 는 "저장된 다음 Lesson 포인터" 로도 쓰인다 — 앱 시작 화면이
--       가장 최근 세션의 next_target 을 읽어 유효성(대상이 아직 존재하는지 등)을 확인한
--       뒤 우선 제안하고, 무효면 커리큘럼 순서로 안전하게 재계산한다.
--     · confusing_points / review_candidates 는 그 세션에서 새로 나온 후보의 **스냅샷**이다.
--       확정된 값은 user_learning_notes.confusing / user_review_items 에 반영된다 — 중복
--       저장이지만 세션 단위 감사 로그 성격과 진도 집계 성격이 달라 의도적으로 분리한다.
--     · 전체 대화(transcript)는 저장하지 않는다 — 요약·후보만 저장(무료 한도·개인정보 보호).
--
-- ■ target_kind / target_id : 기존 user_learning 4테이블과 동일한 loose reference 패턴
--   (target_kind CHECK + text id, 하드 FK 없음 — lesson|project_unit 양쪽을 다뤄야 하므로).
--
-- ■ RLS/GRANT (사용자 테이블 공통, 20260906120003 과 동일 패턴)
--   RLS 활성. authenticated SELECT/INSERT/UPDATE/DELETE policy 를 auth.uid()=user_id 로 스코프.
--   revoke all from anon, authenticated, service_role → grant select, insert, update, delete to authenticated.
--   service_role GRANT 없음. anon 권한 없음.
--
-- ■ updated_at : 트리거 없음(프로젝트 무트리거 관례). writer 가 매 UPDATE 마다 함께 갱신한다.

create table if not exists public.tutor_sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,

  target_kind          text not null check (target_kind in ('lesson', 'project_unit')),
  target_id            text not null,                 -- loose ref (시작 Lesson/Unit)
  current_target_kind  text not null default 'lesson' check (current_target_kind in ('lesson', 'project_unit')),
  current_target_id    text not null,                 -- loose ref (세션 진행 중 바뀔 수 있음)

  status               text not null default 'active'
                          check (status in ('active', 'completed', 'abandoned')),

  started_at           timestamptz not null default now(),
  ended_at             timestamptz,
  last_activity_at     timestamptz not null default now(),
  message_count        int not null default 0,

  today_summary        text,                          -- 오늘 배운 내용 (사용자 확정본)
  confusing_points     jsonb not null default '[]'::jsonb,  -- 헷갈린 부분 스냅샷
  review_candidates    jsonb not null default '[]'::jsonb,  -- 복습 필요 후보 스냅샷

  next_target_kind     text check (next_target_kind in ('lesson', 'project_unit')),
  next_target_id       text,                          -- loose ref — 다음 Lesson/Unit 포인터
  next_start_note      text,                          -- 다음 학습 시작 참고사항

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists tutor_sessions_user_started_idx
  on public.tutor_sessions (user_id, started_at desc);
create index if not exists tutor_sessions_user_status_idx
  on public.tutor_sessions (user_id, status);

alter table public.tutor_sessions enable row level security;

create policy "users select own tutor_sessions"
  on public.tutor_sessions for select to authenticated
  using (auth.uid() = user_id);
create policy "users insert own tutor_sessions"
  on public.tutor_sessions for insert to authenticated
  with check (auth.uid() = user_id);
create policy "users update own tutor_sessions"
  on public.tutor_sessions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own tutor_sessions"
  on public.tutor_sessions for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.tutor_sessions from anon, authenticated, service_role;
grant select, insert, update, delete on public.tutor_sessions to authenticated;
