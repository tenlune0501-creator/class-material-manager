/**
 * AI Tutor(음성/텍스트 과외) 기능이 요구사항의 핵심 안전 규칙을 지키는지 정적으로
 * 확인한다. viewer-curriculum.test.ts 와 같은 방식 — Next.js/Supabase 런타임 없이
 * 소스 텍스트를 읽어 구조·규칙을 검증한다(실제 흐름은 e2e/tutor.spec.ts 가 다룬다).
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

const groqQwen = await readFile("viewer/lib/tutor/providers/groq-qwen.ts", "utf8");
const groqWhisper = await readFile("viewer/lib/tutor/providers/groq-whisper.ts", "utf8");
const meloProvider = await readFile("viewer/lib/tutor/providers/melotts-local.ts", "utf8");
const providerIndex = await readFile("viewer/lib/tutor/providers/index.ts", "utf8");
const providerTypes = await readFile("viewer/lib/tutor/providers/types.ts", "utf8");
const progress = await readFile("viewer/lib/tutor/progress.ts", "utf8");
const context = await readFile("viewer/lib/tutor/context.ts", "utf8");
const session = await readFile("viewer/lib/tutor/session.ts", "utf8");
const startRoute = await readFile("viewer/app/api/tutor/session/start/route.ts", "utf8");
const messageRoute = await readFile("viewer/app/api/tutor/session/[id]/message/route.ts", "utf8");
const summarizeRoute = await readFile("viewer/app/api/tutor/session/[id]/summarize/route.ts", "utf8");
const finishRoute = await readFile("viewer/app/api/tutor/session/[id]/finish/route.ts", "utf8");
const sttRoute = await readFile("viewer/app/api/tutor/stt/route.ts", "utf8");
const tutorMigration = await readFile(
  "supabase/migrations/20260911000000_create_tutor_sessions.sql",
  "utf8",
);
const manifest = await readFile("viewer/public/manifest.webmanifest", "utf8");
const sw = await readFile("viewer/public/sw.js", "utf8");
const tutorApp = await readFile("viewer/components/tutor/TutorApp.tsx", "utf8");

describe("Groq Provider 경계", () => {
  it("LLM/STT 모두 GROQ_API_KEY 를 생성자로만 받는다 (프로세스 환경변수 직접 참조는 팩토리에서만)", () => {
    assert.ok(groqQwen.includes("apiKey: string"), "생성자 인자로 apiKey를 받아야 한다");
    assert.ok(groqWhisper.includes("apiKey: string"));
    assert.ok(providerIndex.includes("process.env.GROQ_API_KEY"), "키 조회는 팩토리 한 곳");
  });

  it("모델 id를 env로 override할 수 있고, 하드코딩된 기본값이 있다", () => {
    assert.ok(groqQwen.includes("GROQ_LLM_MODEL"));
    assert.ok(groqQwen.includes("qwen/qwen3.6-27b"), "실제 Groq 문서 기준 모델 id");
    assert.ok(groqWhisper.includes("GROQ_STT_MODEL"));
    assert.ok(groqWhisper.includes("whisper-large-v3-turbo"));
  });

  it("Whisper 요청은 한국어(ko)로 고정한다", () => {
    assert.ok(groqWhisper.includes('form.append("language", "ko")'));
  });

  it("429/401/5xx를 구분해 ProviderError로 분류한다", () => {
    assert.ok(groqQwen.includes("429"), "rate_limit 처리");
    assert.ok(groqQwen.includes("401") && groqQwen.includes("403"), "auth 처리");
    assert.ok(providerTypes.includes("retryable"), "ProviderError가 retryable 여부를 담아야 한다");
  });

  it("MeloTTS Provider는 API 키를 다루지 않고 NEXT_PUBLIC_ 환경변수만 쓴다 (브라우저 직접 호출)", () => {
    assert.ok(!/apiKey|Authorization|Bearer/i.test(meloProvider), "TTS는 인증 헤더가 없어야 한다");
    assert.ok(meloProvider.includes("NEXT_PUBLIC_MELOTTS_URL"));
  });
});

describe("Lesson Context 빌더 — 전체 DB를 매 턴 보내지 않는다", () => {
  it("길이 상한을 두고 있다", () => {
    assert.ok(context.includes("MAX_SECTION_CHARS"));
    assert.ok(context.includes("MAX_TOTAL_SECTION_CHARS"));
    assert.ok(context.includes("MAX_TOTAL_CODE_CHARS"));
  });

  it("이 Lesson의 진도/노트만 읽고, material_bodies/comparisons 전체를 읽지 않는다", () => {
    assert.ok(context.includes("user_lesson_progress"));
    assert.ok(context.includes("user_learning_notes"));
    assert.ok(!context.includes("material_bodies"), "본문 전체 테이블을 context에 끌어오면 안 된다");
    assert.ok(!context.includes("comparisons"));
  });
});

describe("세션 시작/메시지 — 서버 API 경계", () => {
  it("모든 tutor API 라우트가 로그인 여부를 확인한다", () => {
    for (const route of [startRoute, messageRoute, summarizeRoute, finishRoute, sttRoute]) {
      assert.ok(route.includes("auth.getUser()"), "getUser() 로 인증 확인이 있어야 한다");
      assert.ok(/status:\s*401/.test(route), "미로그인 401 처리가 있어야 한다");
    }
  });

  it("message 라우트는 client가 보낸 systemPrompt를 신뢰하지 않고 서버가 다시 만든다", () => {
    assert.ok(messageRoute.includes("buildLessonContext"));
    assert.ok(!messageRoute.includes("body.systemPrompt"), "클라이언트 systemPrompt를 그대로 쓰면 안 된다");
  });

  it("history 길이를 잘라 무료 한도를 보호한다", () => {
    assert.ok(messageRoute.includes("MAX_HISTORY_MESSAGES"));
    assert.ok(messageRoute.includes(".slice("));
  });

  it("STT 라우트는 MIME과 크기를 검증한다", () => {
    assert.ok(sttRoute.includes("MAX_AUDIO_BYTES"));
    assert.ok(sttRoute.includes("ALLOWED_MIME_PREFIXES"));
    assert.ok(/status:\s*413/.test(sttRoute));
    assert.ok(/status:\s*415/.test(sttRoute));
  });
});

describe("학습 종료 — 사용자 확정본만 저장한다", () => {
  it("finalizeSession은 이미 completed인 세션에 다시 쓰지 않는다 (중복 제출 안전)", () => {
    assert.ok(session.includes('sessionRow.status === "completed"'));
  });

  it("4곳(session/progress/notes/review)에 반영하되 대화 원문은 저장하지 않는다", () => {
    assert.ok(session.includes("upsertLessonProgress"));
    assert.ok(session.includes("upsertLearningNotes"));
    assert.ok(session.includes("insertReviewItems"));
    assert.ok(!/transcript|full.*history/i.test(session), "세션 저장 로직에 원문 대화를 담으면 안 된다");
  });

  it("summarize 라우트는 초안일 뿐이고, finish 라우트만 실제로 저장한다", () => {
    assert.ok(!summarizeRoute.includes("finalizeSession"), "summarize는 저장하면 안 된다");
    assert.ok(finishRoute.includes("finalizeSession"));
  });

  it("finish 라우트는 요청 형식을 검증한다(임의 completionStatus 금지)", () => {
    assert.ok(finishRoute.includes('["learning", "completed", "review"].includes'));
  });

  it("복습 후보는 prompt_hash = md5(prompt) 계약을 지킨다", () => {
    assert.ok(session.includes('crypto.createHash("md5")'));
    assert.ok(session.includes("normalizePrompt"));
  });
});

describe("다음 Lesson 계산 — 단순 +1이 아니다", () => {
  it("저장된 next_target을 우선하고, 무효하면 재계산한다", () => {
    assert.ok(progress.includes("computeNextLesson"));
    assert.ok(progress.includes("lastSession.nextTargetId"));
    assert.ok(progress.includes('progressByLessonId.get(candidate.id)'));
  });

  it("커리큘럼 순서(track→chapter→lesson ord)로 정렬한다", () => {
    assert.ok(progress.includes("trackOrd") && progress.includes("chapterOrd"));
  });

  it("진행 중(learning) 상태를 완료 처리보다 우선 이어서 준다", () => {
    assert.ok(progress.includes('status === "learning"'));
  });

  it("progress.ts는 SELECT만 한다 (쓰기는 session.ts의 책임)", () => {
    assert.ok(!/\.insert\(|\.update\(|\.upsert\(/.test(progress));
  });
});

describe("tutor_sessions 마이그레이션", () => {
  it("RLS + auth.uid() 스코프 정책 4종(select/insert/update/delete)이 있다", () => {
    assert.ok(tutorMigration.includes("enable row level security"));
    for (const op of ["select", "insert", "update", "delete"]) {
      assert.ok(tutorMigration.includes(`for ${op} to authenticated`), `${op} 정책 필요`);
    }
    assert.ok((tutorMigration.match(/auth\.uid\(\) = user_id/g) ?? []).length >= 4);
  });

  it("anon/service_role 권한을 주지 않는다 (authenticated만)", () => {
    assert.ok(tutorMigration.includes("revoke all on table public.tutor_sessions from anon, authenticated, service_role"));
    assert.ok(tutorMigration.includes("grant select, insert, update, delete on public.tutor_sessions to authenticated"));
  });

  it("기존 9개 이상 테이블을 건드리지 않는다 (신규 CREATE TABLE 하나만)", () => {
    assert.equal((tutorMigration.match(/create table/g) ?? []).length, 1);
    assert.ok(!/drop table|delete from|truncate/i.test(tutorMigration));
  });
});

describe("PWA", () => {
  it("manifest가 start_url/standalone/아이콘 3종을 갖췄다", () => {
    const parsed = JSON.parse(manifest);
    assert.equal(parsed.start_url, "/tutor");
    assert.equal(parsed.display, "standalone");
    assert.ok(parsed.icons.length >= 3);
  });

  it("Service Worker는 페이지 내비게이션과 /api/** 를 캐시하지 않는다", () => {
    assert.ok(sw.includes('request.mode === "navigate"'));
    assert.ok(sw.includes('url.pathname.startsWith("/api/")'));
    assert.ok(sw.includes("return;"), "캐시하지 않고 그대로 network로 보내야 한다");
  });
});

describe("음성 UX 안전 규칙", () => {
  it("STT 결과는 자동 전송하지 않고 입력창에 채워 사용자가 확인·수정한다", () => {
    assert.ok(tutorApp.includes("setInput((prev)"));
    assert.ok(!/handleSend\(data\.text\)/.test(tutorApp), "전사 직후 자동 전송 금지");
  });

  it("TTS 실패는 조용히 무시하고 텍스트를 유지한다 (throw하지 않음)", () => {
    assert.ok(/catch\s*\{[^}]*setSpeaking\(false\)/.test(tutorApp));
  });

  it("voice off일 때 TTS를 호출하지 않는다", () => {
    assert.ok(tutorApp.includes("if (!tts || !voiceOn) return;"));
  });

  it("TTS로 보내기 전 마크다운 기호를 벗겨낸다 (Groq 실사용 검증 중 발견: 백틱이 MeloTTS 합성을 깨뜨림)", () => {
    assert.ok(tutorApp.includes("stripMarkdownForSpeech"), "마크다운 제거 함수가 있어야 한다");
    assert.ok(
      tutorApp.includes("const text = stripMarkdownForSpeech(rawText);"),
      "speak()가 실제로 이 함수를 거쳐야 한다",
    );
  });

  it("종료 의사는 버튼 + 보조적 텍스트 감지 둘 다 있다 (자동 완료 처리는 아님)", () => {
    assert.ok(tutorApp.includes("학습 종료"));
    assert.ok(tutorApp.includes("END_INTENT_PATTERN"));
    assert.ok(tutorApp.includes("showEndConfirm"), "감지되면 확인만 묻고 바로 끝내지 않는다");
  });
});
