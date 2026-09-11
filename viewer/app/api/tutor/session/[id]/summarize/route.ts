/**
 * POST /api/tutor/session/[id]/summarize
 * body: { history: {role, content}[] }
 *
 * "학습 종료" 를 눌렀을 때 LLM이 이번 대화를 근거로 초안을 만든다. 이 결과는
 * **초안**일 뿐이다 — 그대로 저장되지 않는다. 화면에서 사용자가 확인·수정한 뒤
 * /finish 를 호출해야 실제로 저장된다(요구사항: 사용자 확정본이 Source of Truth).
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { buildLessonContext } from "@/lib/tutor/context";
import { getLLMProvider, ProviderError, type LLMMessage } from "@/lib/tutor/providers";
import {
  computeNextLesson,
  getLessonProgressMap,
  getOrderedLessons,
  type LessonProgressRow,
} from "@/lib/tutor/progress";

const MAX_HISTORY_MESSAGES = 24;

interface DraftShape {
  completionStatus: "learning" | "completed" | "review";
  todaySummary: string;
  confusingPoints: string[];
  reviewCandidates: { concept: string; reason?: string }[];
  nextStartNote: string;
}

function safeParseDraft(raw: string): DraftShape | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Partial<DraftShape>;
    const status = parsed.completionStatus;
    return {
      completionStatus: status === "completed" || status === "review" ? status : "learning",
      todaySummary: typeof parsed.todaySummary === "string" ? parsed.todaySummary.slice(0, 1000) : "",
      confusingPoints: Array.isArray(parsed.confusingPoints)
        ? parsed.confusingPoints.filter((x): x is string => typeof x === "string").slice(0, 10)
        : [],
      reviewCandidates: Array.isArray(parsed.reviewCandidates)
        ? parsed.reviewCandidates
            .filter((x): x is { concept: string; reason?: string } => !!x && typeof x.concept === "string")
            .slice(0, 10)
        : [],
      nextStartNote: typeof parsed.nextStartNote === "string" ? parsed.nextStartNote.slice(0, 500) : "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const llm = getLLMProvider();
  if (!llm) {
    return NextResponse.json({ error: "GROQ_API_KEY가 설정되지 않았습니다." }, { status: 503 });
  }

  let body: { history?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }

  const { data: sessionRow } = await supabase
    .from("tutor_sessions")
    .select("id,status,current_target_kind,current_target_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!sessionRow) return NextResponse.json({ error: "세션을 찾을 수 없습니다." }, { status: 404 });
  if (sessionRow.current_target_kind !== "lesson") {
    return NextResponse.json({ error: "이번 버전은 Lesson 세션만 지원합니다." }, { status: 400 });
  }

  const lessonId = String(sessionRow.current_target_id);
  const context = await buildLessonContext(lessonId);
  if (!context) return NextResponse.json({ error: "Lesson을 찾을 수 없습니다." }, { status: 404 });

  const history = Array.isArray(body.history) ? body.history : [];
  const transcript = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => `${m.role === "user" ? "학생" : "튜터"}: ${m.content}`)
    .join("\n");

  const instruction = [
    "지금까지의 대화를 보고 이 학습 세션을 요약하는 JSON을 만드세요.",
    "실제로 대화에서 다룬 내용만 근거로 삼고, 다루지 않은 것을 완료했다고 적지 마세요.",
    "대화가 거의 없었거나 이 Lesson을 제대로 다루지 못했으면 completionStatus를",
    "'learning'(진행 중)으로 두세요 — 확신이 없으면 completed로 적지 않습니다.",
    "",
    "JSON 형식(다른 텍스트 없이 이 JSON 객체만 출력):",
    "{",
    '  "completionStatus": "learning" | "completed" | "review",',
    '  "todaySummary": "오늘 배운 내용을 3~5문장 한국어로",',
    '  "confusingPoints": ["학생이 헷갈려했거나 반복 질문한 개념", ...],',
    '  "reviewCandidates": [{"concept": "복습이 필요한 개념", "reason": "왜 복습이 필요한지"}],',
    '  "nextStartNote": "다음 세션을 시작할 때 참고할 한두 문장"',
    "}",
    "",
    `## 대화 기록\n${transcript || "(대화 없음)"}`,
  ].join("\n");

  const messages: LLMMessage[] = [
    { role: "system", content: context.systemPrompt },
    { role: "user", content: instruction },
  ];

  try {
    const reply = await llm.chat(messages);
    const draft = safeParseDraft(reply.content);
    if (!draft) {
      return NextResponse.json({ error: "요약 생성 결과를 해석하지 못했습니다. 직접 입력해 주세요." }, { status: 502 });
    }

    const lessons = await getOrderedLessons();
    const progressMap = await getLessonProgressMap();
    const hypotheticalMap = new Map<string, LessonProgressRow>(progressMap);
    hypotheticalMap.set(lessonId, {
      lessonId,
      status: draft.completionStatus,
      startedAt: null,
      completedAt: null,
      lastStudiedAt: new Date().toISOString(),
      reviewCount: 0,
      nextStartPoint: null,
      lastSummary: null,
    });
    const suggestedNext = computeNextLesson(lessons, hypotheticalMap, null);

    return NextResponse.json({
      draft: {
        ...draft,
        suggestedNextLesson: suggestedNext
          ? { kind: "lesson" as const, id: suggestedNext.id, title: suggestedNext.title }
          : null,
      },
    });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json({ error: err.message, kind: err.kind, retryable: err.retryable }, { status: 502 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "알 수 없는 오류" }, { status: 500 });
  }
}
