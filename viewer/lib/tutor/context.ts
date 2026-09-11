/**
 * AI Tutor — 현재 Lesson 기반 LLM context 구성.
 *
 * 요구사항: "일반 챗봇이 아니라 현재 Lesson 기반 Tutor" + "전체 DB/전체 커리큘럼을
 * 매 턴 보내지 않는다." 그래서 이 파일이 만드는 system prompt 는:
 *   1) 그 Lesson의 섹션·코드 예제만 담는다 (전체 자료 본문·다른 Lesson은 담지 않는다).
 *   2) 그 Lesson에 대한 과거 진도 요약(last_summary/next_start_point)만 담는다
 *      (다른 Lesson의 세션 이력은 담지 않는다).
 *   3) 그 Lesson에 걸린 미해결 노트(confusing/review_later)만 담는다.
 *   4) 전부 길이 상한을 두고 넘치면 자른다 — 무료 한도 보호.
 */
import { createClient } from "@/lib/supabase/server";
import { getLesson, inlineCodeRefs, type LessonDetail } from "@/lib/curriculum";

const MAX_SECTION_CHARS = 700;
const MAX_TOTAL_SECTION_CHARS = 4500;
const MAX_CODE_CHARS = 1200;
const MAX_TOTAL_CODE_CHARS = 2400;

const MASTERY_LABEL: Record<string, string> = {
  understand: "이해(설명하고 역할을 말할 수 있으면 됨)",
  required: "직접 구현(빈 화면에서 기본 형태를 짤 수 있어야 함)",
  practical: "응용·설계(실제 프로젝트에서 응용·디버깅 가능해야 함)",
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…(생략)`;
}

interface LessonNotesSnapshot {
  confusing: string[];
  reviewLater: string[];
  oneLineSummary: string | null;
}

async function getLessonNotes(lessonId: string): Promise<LessonNotesSnapshot> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_learning_notes")
    .select("understood,confusing,review_later,one_line_summary")
    .eq("target_kind", "lesson")
    .eq("target_id", lessonId)
    .maybeSingle();
  if (!data) return { confusing: [], reviewLater: [], oneLineSummary: null };
  const asStrArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return {
    confusing: asStrArr(data.confusing),
    reviewLater: asStrArr(data.review_later),
    oneLineSummary: (data.one_line_summary as string | null) ?? null,
  };
}

async function getLessonProgressSummary(
  lessonId: string,
): Promise<{ lastSummary: string | null; nextStartPoint: string | null; status: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("status,last_summary,next_start_point")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!data) return null;
  return {
    status: (data.status as string | null) ?? null,
    lastSummary: (data.last_summary as string | null) ?? null,
    nextStartPoint: (data.next_start_point as string | null) ?? null,
  };
}

/** 본문 섹션 중 과외 대화에 실제로 필요한 것만 고른다 — interview/check/digest는 별도 취급. */
const CORE_SECTION_TYPES = new Set([
  "goal",
  "prerequisite",
  "dev_problem",
  "concept",
  "mechanism",
  "must_know",
  "delegatable",
  "code_breakdown",
  "review",
]);

export interface LessonContext {
  lesson: LessonDetail;
  systemPrompt: string;
}

export async function buildLessonContext(lessonId: string): Promise<LessonContext | null> {
  const lesson = await getLesson(lessonId);
  if (!lesson) return null;

  const [notes, progress] = await Promise.all([
    getLessonNotes(lessonId),
    getLessonProgressSummary(lessonId),
  ]);

  const parts: string[] = [];
  parts.push(
    [
      "당신은 CMM(Class Material Manager)의 한국어 AI 과외 선생님입니다.",
      "지금 이 세션은 아래 Lesson **하나**에 집중합니다. 범위를 벗어난 질문이 나오면",
      "짧게만 답하고 다시 이 Lesson으로 돌아오도록 자연스럽게 안내하세요.",
      "",
      "지도 방식:",
      "- 정답을 곧바로 말하기보다 힌트를 먼저 주고, 사용자가 스스로 생각할 기회를 줍니다.",
      "- 사용자가 전체 설명이나 정답을 요청하면 그때는 바로 온전히 설명합니다.",
      "- 사용자의 수준에 맞춰 설명 난이도를 조절하고, 이미 이해했다고 확인된 내용은",
      "  반복해서 처음부터 설명하지 않습니다.",
      "- 코드 예시는 필요할 때 짧게 보여줍니다.",
      "- 시험처럼 몰아붙이지 말고, 자연스러운 음성 대화체(간결한 문장, 존댓말)로 답하세요.",
      "- 답변은 음성으로 읽힐 수 있으므로 마크다운 헤더나 긴 표는 쓰지 말고, 짧은 문단과",
      "  필요할 때만 코드 블록을 씁니다.",
    ].join("\n"),
  );

  parts.push(
    [
      "",
      `## 오늘의 Lesson: ${lesson.title}`,
      `- 트랙/챕터: ${lesson.trackTitle ?? lesson.trackId} / ${lesson.chapterTitle ?? lesson.chapterId}`,
      `- 목표 수준: ${MASTERY_LABEL[lesson.mastery] ?? lesson.mastery}`,
      lesson.summary ? `- 요약: ${truncate(lesson.summary, 300)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  if (progress?.lastSummary || progress?.nextStartPoint) {
    parts.push(
      [
        "",
        "## 지난 학습 요약 (이 Lesson)",
        progress.status ? `- 현재 상태: ${progress.status}` : "",
        progress.lastSummary ? `- 지난번 배운 것: ${truncate(progress.lastSummary, 500)}` : "",
        progress.nextStartPoint ? `- 지난번에 남긴 다음 시작 메모: ${truncate(progress.nextStartPoint, 300)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (notes.confusing.length > 0 || notes.reviewLater.length > 0) {
    parts.push(
      [
        "",
        "## 전에 헷갈려했거나 다시 보기로 한 것",
        ...notes.confusing.slice(0, 5).map((c) => `- (헷갈림) ${truncate(c, 200)}`),
        ...notes.reviewLater.slice(0, 5).map((c) => `- (다시 보기) ${truncate(c, 200)}`),
        "이 항목은 짚고 넘어가되, 이미 이해했는지 자연스럽게 확인하세요.",
      ].join("\n"),
    );
  }

  // ── 본문 섹션 (핵심 유형만, 길이 상한) ──
  let sectionBudget = MAX_TOTAL_SECTION_CHARS;
  const sectionLines: string[] = ["", "## Lesson 본문"];
  for (const section of lesson.sections) {
    if (!CORE_SECTION_TYPES.has(section.sectionType)) continue;
    if (sectionBudget <= 0) break;
    const body = inlineCodeRefs(section.body, lesson.codeExamples);
    const clipped = truncate(body, Math.min(MAX_SECTION_CHARS, sectionBudget));
    sectionBudget -= clipped.length;
    sectionLines.push(`\n### ${section.title ?? section.sectionType}\n${clipped}`);
  }
  parts.push(sectionLines.join("\n"));

  // ── 코드 예제 (전체가 아니라 대표 예제 중심, 길이 상한) ──
  if (lesson.codeExamples.length > 0) {
    let codeBudget = MAX_TOTAL_CODE_CHARS;
    const codeLines: string[] = ["", "## 코드 예제"];
    for (const ex of lesson.codeExamples) {
      if (!ex.code || codeBudget <= 0) continue;
      const clipped = truncate(ex.code, Math.min(MAX_CODE_CHARS, codeBudget));
      codeBudget -= clipped.length;
      codeLines.push(`\n### ${ex.title}\n\`\`\`${ex.language ?? ""}\n${clipped}\n\`\`\``);
    }
    parts.push(codeLines.join("\n"));
  }

  const check = lesson.sections.find((s) => s.sectionType === "check_question");
  if (check) {
    parts.push(["", "## 이해 점검 질문(참고용)", truncate(check.body, 400)].join("\n"));
  }

  parts.push(
    [
      "",
      "## 학습 종료 처리",
      "사용자가 '오늘 공부 끝', '그만할래', '여기까지' 같은 말을 하거나 화면의",
      "[학습 종료] 버튼을 누르면, 그 시점까지 이 Lesson을 얼마나 다뤘는지에 근거해서만",
      "요약을 만듭니다. 실제로 다루지 않은 내용을 완료했다고 적지 마세요.",
    ].join("\n"),
  );

  return { lesson, systemPrompt: parts.join("\n") };
}
