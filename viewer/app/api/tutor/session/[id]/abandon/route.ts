/**
 * POST /api/tutor/session/[id]/abandon
 *
 * 사용자가 요약 확인 화면에서 저장 없이 나가거나, 세션을 그냥 접을 때 쓴다.
 * 진도/노트/복습 항목은 건드리지 않는다 — 세션 자체만 abandoned로 남긴다.
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { data: sessionRow } = await supabase
    .from("tutor_sessions")
    .select("id,status")
    .eq("id", sessionId)
    .maybeSingle();
  if (!sessionRow) return NextResponse.json({ error: "세션을 찾을 수 없습니다." }, { status: 404 });
  if (sessionRow.status !== "active") {
    return NextResponse.json({ ok: true }); // 이미 끝난 세션 — 그대로 둔다
  }

  await supabase
    .from("tutor_sessions")
    .update({ status: "abandoned", ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return NextResponse.json({ ok: true });
}
