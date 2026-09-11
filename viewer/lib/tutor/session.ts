/**
 * AI Tutor — 세션 시작/종료 + 진도·노트·복습 항목 반영.
 *
 * 종료 확정(finalizeSession)이 이 파일의 핵심이다. 사용자가 [저장하고 종료]를 누른
 * 뒤에만 호출되며, 그 순간 4곳에 쓴다:
 *   1) tutor_sessions   — 이 세션 자체를 completed로 (세션 이력)
 *   2) user_lesson_progress — 이 Lesson의 "현재 진도" 갱신 (재사용, 신규 아님)
 *   3) user_learning_notes  — 헷갈린 것/다시 볼 것 누적 (재사용, 신규 아님)
 *   4) user_review_items    — 복습 후보를 실제 복습 항목으로 (재사용, 신규 아님)
 *
 * 사용자가 화면에서 수정한 값이 그대로 여기 들어오는 값이다(Source of Truth) —
 * 이 파일은 LLM이 만든 초안을 다시 손대지 않는다.
 */
import crypto from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { mapSessionRow, type TutorSessionRow } from "./progress";

const STALE_SESSION_MS = 2 * 60 * 60 * 1000; // 2시간 넘게 조용하면 방치된 세션으로 본다

export class TutorAuthError extends Error {}
export class TutorNotFoundError extends Error {}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new TutorAuthError("로그인이 필요합니다.");
  return { supabase, user };
}

export async function startSession(
  targetKind: "lesson" | "project_unit",
  targetId: string,
): Promise<TutorSessionRow> {
  const { supabase, user } = await requireUser();

  const { data: activeRows } = await supabase
    .from("tutor_sessions")
    .select("*")
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1);
  const active = activeRows?.[0];

  if (active) {
    const sameTarget = active.current_target_kind === targetKind && active.current_target_id === targetId;
    const isStale = Date.now() - new Date(active.last_activity_at as string).getTime() > STALE_SESSION_MS;
    if (sameTarget && !isStale) {
      return mapSessionRow(active);
    }
    // 다른 대상으로 새로 시작하거나, 방치된 세션이면 이전 것은 abandoned로 정리한다.
    await supabase
      .from("tutor_sessions")
      .update({ status: "abandoned", ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", active.id as string);
  }

  const nowIso = new Date().toISOString();
  const { data: created, error } = await supabase
    .from("tutor_sessions")
    .insert({
      user_id: user.id,
      target_kind: targetKind,
      target_id: targetId,
      current_target_kind: targetKind,
      current_target_id: targetId,
      status: "active",
      started_at: nowIso,
      last_activity_at: nowIso,
    })
    .select("*")
    .single();
  if (error || !created) throw new Error(error?.message ?? "세션을 시작하지 못했습니다.");
  return mapSessionRow(created);
}

export async function touchSession(sessionId: string): Promise<void> {
  const { supabase } = await requireUser();
  const { data: current } = await supabase
    .from("tutor_sessions")
    .select("message_count")
    .eq("id", sessionId)
    .maybeSingle();
  if (!current) throw new TutorNotFoundError("세션을 찾을 수 없습니다.");
  await supabase
    .from("tutor_sessions")
    .update({
      last_activity_at: new Date().toISOString(),
      message_count: Number(current.message_count ?? 0) + 1,
    })
    .eq("id", sessionId);
}

export interface ReviewCandidateInput {
  concept: string;
  reason?: string;
}

export interface FinalizeInput {
  completionStatus: "learning" | "completed" | "review";
  todaySummary: string;
  confusingPoints: string[];
  reviewCandidates: ReviewCandidateInput[];
  nextTarget: { kind: "lesson" | "project_unit"; id: string } | null;
  nextStartNote: string | null;
}

const MAX_NOTE_ITEMS = 30;

function dedupeCapped(existing: string[], incoming: string[], cap: number): string[] {
  const merged = [...existing];
  for (const item of incoming) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (!merged.includes(trimmed)) merged.push(trimmed);
  }
  return merged.length > cap ? merged.slice(merged.length - cap) : merged;
}

function normalizePrompt(text: string): string {
  return text.trim().normalize("NFC");
}

export async function finalizeSession(
  sessionId: string,
  input: FinalizeInput,
): Promise<TutorSessionRow> {
  const { supabase, user } = await requireUser();

  const { data: sessionRow } = await supabase
    .from("tutor_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (!sessionRow) throw new TutorNotFoundError("세션을 찾을 수 없습니다.");
  if (sessionRow.status === "completed") {
    // 중복 제출은 조용히 기존 값을 돌려준다 (사용자가 저장 버튼을 두 번 눌러도 안전).
    return mapSessionRow(sessionRow);
  }

  const nowIso = new Date().toISOString();
  const targetKind = sessionRow.current_target_kind as "lesson" | "project_unit";
  const targetId = String(sessionRow.current_target_id);

  const { data: updatedSession, error: sessionError } = await supabase
    .from("tutor_sessions")
    .update({
      status: "completed",
      ended_at: nowIso,
      updated_at: nowIso,
      today_summary: input.todaySummary,
      confusing_points: input.confusingPoints,
      review_candidates: input.reviewCandidates,
      next_target_kind: input.nextTarget?.kind ?? null,
      next_target_id: input.nextTarget?.id ?? null,
      next_start_note: input.nextStartNote,
    })
    .eq("id", sessionId)
    .select("*")
    .single();
  if (sessionError || !updatedSession) throw new Error(sessionError?.message ?? "세션 저장 실패");

  if (targetKind === "lesson") {
    await upsertLessonProgress(supabase, user.id, targetId, input, nowIso);
  } else {
    await upsertProjectProgress(supabase, user.id, targetId, input, nowIso);
  }

  await upsertLearningNotes(supabase, user.id, targetKind, targetId, input, nowIso);
  await insertReviewItems(supabase, user.id, targetKind, targetId, input.reviewCandidates, nowIso);

  return mapSessionRow(updatedSession);
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function upsertLessonProgress(
  supabase: SupabaseServerClient,
  userId: string,
  lessonId: string,
  input: FinalizeInput,
  nowIso: string,
) {
  const { data: existing } = await supabase
    .from("user_lesson_progress")
    .select("started_at,completed_at,review_count")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  await supabase.from("user_lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      status: input.completionStatus,
      started_at: existing?.started_at ?? nowIso,
      completed_at: input.completionStatus === "completed" ? nowIso : existing?.completed_at ?? null,
      last_studied_at: nowIso,
      review_count:
        input.completionStatus === "review" ? Number(existing?.review_count ?? 0) + 1 : Number(existing?.review_count ?? 0),
      next_start_point: input.nextStartNote,
      last_summary: input.todaySummary,
      updated_at: nowIso,
    },
    { onConflict: "user_id,lesson_id" },
  );
}

async function upsertProjectProgress(
  supabase: SupabaseServerClient,
  userId: string,
  unitId: string,
  input: FinalizeInput,
  nowIso: string,
) {
  const { data: existing } = await supabase
    .from("user_project_progress")
    .select("started_at,completed_at,review_count")
    .eq("unit_id", unitId)
    .maybeSingle();

  await supabase.from("user_project_progress").upsert(
    {
      user_id: userId,
      unit_id: unitId,
      status: input.completionStatus,
      started_at: existing?.started_at ?? nowIso,
      completed_at: input.completionStatus === "completed" ? nowIso : existing?.completed_at ?? null,
      last_studied_at: nowIso,
      review_count:
        input.completionStatus === "review" ? Number(existing?.review_count ?? 0) + 1 : Number(existing?.review_count ?? 0),
      next_start_point: input.nextStartNote,
      last_summary: input.todaySummary,
      updated_at: nowIso,
    },
    { onConflict: "user_id,unit_id" },
  );
}

async function upsertLearningNotes(
  supabase: SupabaseServerClient,
  userId: string,
  targetKind: "lesson" | "project_unit",
  targetId: string,
  input: FinalizeInput,
  nowIso: string,
) {
  const { data: existing } = await supabase
    .from("user_learning_notes")
    .select("understood,confusing,review_later")
    .eq("target_kind", targetKind)
    .eq("target_id", targetId)
    .maybeSingle();

  const asStrArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

  await supabase.from("user_learning_notes").upsert(
    {
      user_id: userId,
      target_kind: targetKind,
      target_id: targetId,
      understood: asStrArr(existing?.understood),
      confusing: dedupeCapped(asStrArr(existing?.confusing), input.confusingPoints, MAX_NOTE_ITEMS),
      review_later: dedupeCapped(
        asStrArr(existing?.review_later),
        input.reviewCandidates.map((c) => c.concept),
        MAX_NOTE_ITEMS,
      ),
      one_line_summary: input.todaySummary.slice(0, 300),
      updated_at: nowIso,
    },
    { onConflict: "user_id,target_kind,target_id" },
  );
}

async function insertReviewItems(
  supabase: SupabaseServerClient,
  userId: string,
  targetKind: "lesson" | "project_unit",
  targetId: string,
  candidates: ReviewCandidateInput[],
  nowIso: string,
) {
  if (candidates.length === 0) return;
  const rows = candidates.map((candidate) => {
    const prompt = normalizePrompt(candidate.reason ? `${candidate.concept} — ${candidate.reason}` : candidate.concept);
    const promptHash = crypto.createHash("md5").update(prompt, "utf8").digest("hex");
    return {
      user_id: userId,
      source_kind: targetKind,
      source_id: targetId,
      kind: "concept" as const,
      prompt,
      prompt_hash: promptHash,
      status: "active" as const,
      next_review_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    };
  });
  await supabase
    .from("user_review_items")
    .upsert(rows, { onConflict: "user_id,source_kind,source_id,kind,prompt_hash", ignoreDuplicates: true });
}
