/**
 * POST /api/tutor/session/[id]/finish
 * body: FinalizeInput (사용자가 확인·수정한 최종값 — Source of Truth)
 *
 * 이 요청이 들어와야만 진도/노트/복습 항목이 실제로 저장된다.
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { finalizeSession, TutorAuthError, TutorNotFoundError, type FinalizeInput } from "@/lib/tutor/session";

function isValidBody(body: unknown): body is FinalizeInput {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (!["learning", "completed", "review"].includes(b.completionStatus as string)) return false;
  if (typeof b.todaySummary !== "string" || b.todaySummary.trim().length === 0) return false;
  if (!Array.isArray(b.confusingPoints)) return false;
  if (!Array.isArray(b.reviewCandidates)) return false;
  return true;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const input: FinalizeInput = {
    completionStatus: body.completionStatus,
    todaySummary: body.todaySummary.slice(0, 2000),
    confusingPoints: body.confusingPoints.filter((x): x is string => typeof x === "string").slice(0, 20),
    reviewCandidates: body.reviewCandidates
      .filter((x): x is { concept: string; reason?: string } => !!x && typeof x.concept === "string")
      .slice(0, 20),
    nextTarget: body.nextTarget ?? null,
    nextStartNote: body.nextStartNote ? String(body.nextStartNote).slice(0, 1000) : null,
  };

  try {
    const session = await finalizeSession(sessionId, input);
    return NextResponse.json({ session });
  } catch (err) {
    if (err instanceof TutorAuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof TutorNotFoundError) return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: err instanceof Error ? err.message : "알 수 없는 오류" }, { status: 500 });
  }
}
