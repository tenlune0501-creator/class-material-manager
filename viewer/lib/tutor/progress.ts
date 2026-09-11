/**
 * AI Tutor — 진도/세션/복습 조회 + "다음 Lesson" 계산.
 *
 * ■ 재사용 원칙
 *
 * 이 파일은 새 진도 스키마를 만들지 않는다. 기존 Schema v2.1 4개 사용자 테이블
 * (user_lesson_progress / user_project_progress / user_learning_notes /
 * user_review_items, `20260906120003_create_user_learning.sql`)과 신규
 * `tutor_sessions`(세션 이력 1개 테이블)만 읽는다.
 *
 * ■ 이번 범위
 *
 * Lesson 기반 학습만 다룬다(target_kind='lesson'). project_unit 세션은 스키마상
 * 가능하지만(user_project_progress 재사용) 이번 Tutor UI 에서는 아직 진입점을 만들지
 * 않았다 — 필요하면 동일한 패턴으로 확장한다.
 *
 * ■ "다음 Lesson" 계산 (요구사항: 단순 Lesson+1 금지)
 *
 * 1. 가장 최근 완료 세션의 next_target 이 있고 유효하면(그 Lesson이 존재하고 아직
 *    completed가 아니면) 그것을 우선한다 — "저장된 다음 Lesson".
 * 2. 아니면 커리큘럼 순서(track.ord → chapter.ord → lesson.ord)로 훑어 아직
 *    completed가 아닌 첫 Lesson을 고른다 — 커리큘럼에 prerequisites가 DB 컬럼으로
 *    없으므로(저작 보조용 필드일 뿐, curriculum/README.md §4) 순서 기반이 안전한
 *    폴백이다. status='learning'(진행 중)인 것을 먼저 우선한다.
 * 3. 전부 completed면 status='review'인 것 중 가장 오래전에 공부한 것.
 * 4. 그마저 없으면 null(커리큘럼을 전부 마친 상태).
 */
import { createClient } from "@/lib/supabase/server";

export interface OrderedLesson {
  id: string;
  chapterId: string;
  trackId: string;
  title: string;
  mastery: string;
  trackTitle: string;
  chapterTitle: string;
  ord: number;
}

export interface LessonProgressRow {
  lessonId: string;
  status: "not_started" | "learning" | "completed" | "review";
  startedAt: string | null;
  completedAt: string | null;
  lastStudiedAt: string | null;
  reviewCount: number;
  nextStartPoint: string | null;
  lastSummary: string | null;
}

export interface TutorSessionRow {
  id: string;
  targetKind: "lesson" | "project_unit";
  targetId: string;
  currentTargetKind: "lesson" | "project_unit";
  currentTargetId: string;
  status: "active" | "completed" | "abandoned";
  startedAt: string;
  endedAt: string | null;
  lastActivityAt: string;
  todaySummary: string | null;
  confusingPoints: string[];
  reviewCandidates: { concept: string; reason?: string }[];
  nextTargetKind: "lesson" | "project_unit" | null;
  nextTargetId: string | null;
  nextStartNote: string | null;
}

export interface ReviewItemRow {
  id: string;
  sourceKind: string;
  sourceId: string;
  kind: string;
  prompt: string;
  status: string;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
}

export interface ResumeState {
  lessons: OrderedLesson[];
  progressByLessonId: Map<string, LessonProgressRow>;
  lastSession: TutorSessionRow | null;
  inProgressLesson: OrderedLesson | null;
  nextLesson: OrderedLesson | null;
  dueReviewItems: ReviewItemRow[];
  dueReviewCount: number;
}

type Row = Record<string, unknown>;

function toOrderedLesson(row: Row, chapterTitle: string, trackTitle: string): OrderedLesson {
  const chapterId = String(row.chapter_id);
  return {
    id: String(row.id),
    chapterId,
    trackId: chapterId.split("/")[0] ?? chapterId,
    title: String(row.title),
    mastery: String(row.mastery),
    trackTitle,
    chapterTitle,
    ord: Number(row.ord ?? 0),
  };
}

/** 커리큘럼 트랙(kind='curriculum')의 lesson_kind='lesson' 항목만, 정렬된 순서로. */
export async function getOrderedLessons(): Promise<OrderedLesson[]> {
  const supabase = await createClient();
  const [{ data: tracks }, { data: chapters }, { data: lessons }] = await Promise.all([
    supabase.from("learning_tracks").select("id,title,kind,ord").eq("kind", "curriculum"),
    supabase.from("learning_chapters").select("id,track_id,title,ord"),
    supabase
      .from("learning_lessons")
      .select("id,chapter_id,title,mastery,lesson_kind,ord")
      .eq("lesson_kind", "lesson"),
  ]);

  const trackOrd = new Map((tracks ?? []).map((t) => [String(t.id), Number(t.ord ?? 0)]));
  const trackTitle = new Map((tracks ?? []).map((t) => [String(t.id), String(t.title)]));
  const chapterInfo = new Map(
    (chapters ?? [])
      .filter((c) => trackOrd.has(String(c.track_id)))
      .map((c) => [String(c.id), { trackId: String(c.track_id), title: String(c.title), ord: Number(c.ord ?? 0) }]),
  );

  return (lessons ?? [])
    .filter((l) => chapterInfo.has(String(l.chapter_id)))
    .map((l) => {
      const chapter = chapterInfo.get(String(l.chapter_id))!;
      return {
        lesson: toOrderedLesson(l, chapter.title, trackTitle.get(chapter.trackId) ?? chapter.trackId),
        trackOrd: trackOrd.get(chapter.trackId) ?? 0,
        chapterOrd: chapter.ord,
      };
    })
    .sort(
      (a, b) =>
        a.trackOrd - b.trackOrd || a.chapterOrd - b.chapterOrd || a.lesson.ord - b.lesson.ord,
    )
    .map((entry) => entry.lesson);
}

export async function getLessonProgressMap(): Promise<Map<string, LessonProgressRow>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select(
      "lesson_id,status,started_at,completed_at,last_studied_at,review_count,next_start_point,last_summary",
    );
  const map = new Map<string, LessonProgressRow>();
  for (const row of data ?? []) {
    map.set(String(row.lesson_id), {
      lessonId: String(row.lesson_id),
      status: row.status as LessonProgressRow["status"],
      startedAt: (row.started_at as string | null) ?? null,
      completedAt: (row.completed_at as string | null) ?? null,
      lastStudiedAt: (row.last_studied_at as string | null) ?? null,
      reviewCount: Number(row.review_count ?? 0),
      nextStartPoint: (row.next_start_point as string | null) ?? null,
      lastSummary: (row.last_summary as string | null) ?? null,
    });
  }
  return map;
}

export async function getLatestSession(): Promise<TutorSessionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tutor_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return mapSessionRow(data as Row);
}

export async function getActiveSession(): Promise<TutorSessionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tutor_sessions")
    .select("*")
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return mapSessionRow(data as Row);
}

export function mapSessionRow(row: Row): TutorSessionRow {
  return {
    id: String(row.id),
    targetKind: row.target_kind as TutorSessionRow["targetKind"],
    targetId: String(row.target_id),
    currentTargetKind: row.current_target_kind as TutorSessionRow["currentTargetKind"],
    currentTargetId: String(row.current_target_id),
    status: row.status as TutorSessionRow["status"],
    startedAt: String(row.started_at),
    endedAt: (row.ended_at as string | null) ?? null,
    lastActivityAt: String(row.last_activity_at),
    todaySummary: (row.today_summary as string | null) ?? null,
    confusingPoints: Array.isArray(row.confusing_points) ? (row.confusing_points as string[]) : [],
    reviewCandidates: Array.isArray(row.review_candidates)
      ? (row.review_candidates as { concept: string; reason?: string }[])
      : [],
    nextTargetKind: (row.next_target_kind as TutorSessionRow["nextTargetKind"]) ?? null,
    nextTargetId: (row.next_target_id as string | null) ?? null,
    nextStartNote: (row.next_start_note as string | null) ?? null,
  };
}

export async function getDueReviewItems(limit = 5): Promise<ReviewItemRow[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("user_review_items")
    .select("id,source_kind,source_id,kind,prompt,status,next_review_at,last_reviewed_at")
    .eq("status", "active")
    .or(`next_review_at.is.null,next_review_at.lte.${nowIso}`)
    .order("next_review_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    sourceKind: String(row.source_kind),
    sourceId: String(row.source_id),
    kind: String(row.kind),
    prompt: String(row.prompt),
    status: String(row.status),
    nextReviewAt: (row.next_review_at as string | null) ?? null,
    lastReviewedAt: (row.last_reviewed_at as string | null) ?? null,
  }));
}

export async function getDueReviewCount(): Promise<number> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { count } = await supabase
    .from("user_review_items")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .or(`next_review_at.is.null,next_review_at.lte.${nowIso}`);
  return count ?? 0;
}

/** 요구사항: 저장된 next lesson이 유효하면 우선, 무효면 커리큘럼 순서로 안전하게 재계산. */
export function computeNextLesson(
  lessons: OrderedLesson[],
  progressByLessonId: Map<string, LessonProgressRow>,
  lastSession: TutorSessionRow | null,
): OrderedLesson | null {
  if (
    lastSession?.status === "completed" &&
    lastSession.nextTargetKind === "lesson" &&
    lastSession.nextTargetId
  ) {
    const candidate = lessons.find((l) => l.id === lastSession.nextTargetId);
    if (candidate) {
      const prog = progressByLessonId.get(candidate.id);
      if (!prog || prog.status !== "completed") return candidate;
    }
    // 대상이 사라졌거나 이미 completed면 아래 재계산으로 폴백한다.
  }

  const inProgress = lessons.find((l) => progressByLessonId.get(l.id)?.status === "learning");
  if (inProgress) return inProgress;

  const notStarted = lessons.find((l) => {
    const prog = progressByLessonId.get(l.id);
    return !prog || prog.status === "not_started";
  });
  if (notStarted) return notStarted;

  const reviewNeeded = lessons
    .filter((l) => progressByLessonId.get(l.id)?.status === "review")
    .sort((a, b) => {
      const aTime = progressByLessonId.get(a.id)?.lastStudiedAt ?? "";
      const bTime = progressByLessonId.get(b.id)?.lastStudiedAt ?? "";
      return aTime.localeCompare(bTime);
    });
  return reviewNeeded[0] ?? null;
}

export async function getResumeState(): Promise<ResumeState> {
  const [lessons, progressByLessonId, lastSession, dueReviewItems, dueReviewCount] = await Promise.all([
    getOrderedLessons(),
    getLessonProgressMap(),
    getLatestSession(),
    getDueReviewItems(),
    getDueReviewCount(),
  ]);

  const inProgressLesson =
    lessons.find((l) => progressByLessonId.get(l.id)?.status === "learning") ?? null;
  const nextLesson = computeNextLesson(lessons, progressByLessonId, lastSession);

  return {
    lessons,
    progressByLessonId,
    lastSession,
    inProgressLesson,
    nextLesson,
    dueReviewItems,
    dueReviewCount,
  };
}
