/**
 * POST /api/tutor/session/start
 * body: { targetKind: "lesson" | "project_unit", targetId: string }
 *
 * 세션을 시작하거나(같은 대상으로 활성 세션이 있으면) 이어 받는다. 그 Lesson의
 * LLM context(system prompt)도 함께 돌려줘 클라이언트가 바로 대화를 시작할 수 있다.
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { buildLessonContext } from "@/lib/tutor/context";
import { startSession, TutorAuthError } from "@/lib/tutor/session";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  let body: { targetKind?: string; targetId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }

  const targetKind = body.targetKind;
  const targetId = body.targetId;
  if ((targetKind !== "lesson" && targetKind !== "project_unit") || !targetId || typeof targetId !== "string") {
    return NextResponse.json({ error: "targetKind/targetId가 필요합니다." }, { status: 400 });
  }

  try {
    const session = await startSession(targetKind, targetId);

    if (targetKind === "lesson") {
      const context = await buildLessonContext(targetId);
      if (!context) {
        return NextResponse.json({ error: "Lesson을 찾을 수 없습니다." }, { status: 404 });
      }
      return NextResponse.json({
        session,
        lesson: {
          id: context.lesson.id,
          title: context.lesson.title,
          mastery: context.lesson.mastery,
          trackTitle: context.lesson.trackTitle,
          chapterTitle: context.lesson.chapterTitle,
        },
        systemPrompt: context.systemPrompt,
      });
    }

    // project_unit 세션은 이번 UI 진입점이 없다 — context 없이 세션만 반환.
    return NextResponse.json({ session, lesson: null, systemPrompt: null });
  } catch (err) {
    if (err instanceof TutorAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "알 수 없는 오류" }, { status: 500 });
  }
}
