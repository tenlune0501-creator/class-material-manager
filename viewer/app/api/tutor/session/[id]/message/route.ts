/**
 * POST /api/tutor/session/[id]/message
 * body: { history: {role:"user"|"assistant", content:string}[], message: string }
 *
 * 세션의 대화 한 턴을 처리한다. system prompt는 서버가 세션의 current_target에서
 * 다시 만든다(클라이언트가 보낸 것을 신뢰하지 않는다 — 매번 최신 Lesson 상태 기준).
 * history는 이 브라우저 탭이 들고 있는 이번 세션의 대화일 뿐, DB에는 저장하지
 * 않는다(요구사항: 전체 대화를 무조건 저장하지 않는다). 무료 한도 보호를 위해
 * 최근 N턴만 잘라 보낸다.
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { buildLessonContext } from "@/lib/tutor/context";
import { getLLMProvider, ProviderError, type LLMMessage } from "@/lib/tutor/providers";
import { touchSession, TutorNotFoundError } from "@/lib/tutor/session";

const MAX_HISTORY_MESSAGES = 16; // user+assistant 합쳐 최근 16개(=8턴)만 LLM에 보낸다
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const llm = getLLMProvider();
  if (!llm) {
    return NextResponse.json(
      { error: "GROQ_API_KEY가 설정되지 않아 Tutor를 쓸 수 없습니다. viewer/.env.local을 확인하세요." },
      { status: 503 },
    );
  }

  let body: { history?: { role: string; content: string }[]; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "message가 비어 있습니다." }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "메시지가 너무 깁니다." }, { status: 400 });
  }

  const { data: sessionRow } = await supabase
    .from("tutor_sessions")
    .select("id,status,current_target_kind,current_target_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!sessionRow) return NextResponse.json({ error: "세션을 찾을 수 없습니다." }, { status: 404 });
  if (sessionRow.status !== "active") {
    return NextResponse.json({ error: "이미 종료된 세션입니다." }, { status: 409 });
  }
  if (sessionRow.current_target_kind !== "lesson") {
    return NextResponse.json({ error: "이번 버전은 Lesson 세션만 지원합니다." }, { status: 400 });
  }

  const context = await buildLessonContext(String(sessionRow.current_target_id));
  if (!context) return NextResponse.json({ error: "Lesson을 찾을 수 없습니다." }, { status: 404 });

  const history = Array.isArray(body.history) ? body.history : [];
  const trimmedHistory: LLMMessage[] = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

  const messages: LLMMessage[] = [
    { role: "system", content: context.systemPrompt },
    ...trimmedHistory,
    { role: "user", content: message },
  ];

  try {
    const reply = await llm.chat(messages);
    await touchSession(sessionId);
    return NextResponse.json({ reply: reply.content });
  } catch (err) {
    if (err instanceof TutorNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof ProviderError) {
      return NextResponse.json({ error: err.message, kind: err.kind, retryable: err.retryable }, { status: 502 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "알 수 없는 오류" }, { status: 500 });
  }
}
