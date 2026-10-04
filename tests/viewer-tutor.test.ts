const speechOutput = await readFile("viewer/lib/tutor/speech-output.ts", "utf8");
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
const tutorSidebar = await readFile("viewer/components/tutor/TutorSidebar.tsx", "utf8");
const appShell = await readFile("viewer/components/AppShell.tsx", "utf8");
const lessonContentSrc = await readFile("viewer/components/LessonContent.tsx", "utf8");
const ttsChunking = await readFile("viewer/lib/tutor/tts-chunking.ts", "utf8");
const voiceStateSrc = await readFile("viewer/lib/tutor/voice-state.ts", "utf8");
const proxySrc = await readFile("viewer/proxy.ts", "utf8");
const lessonTutorSidebar = await readFile("viewer/components/tutor/LessonTutorSidebar.tsx", "utf8");
const lessonPage = await readFile("viewer/app/lesson/[...id]/page.tsx", "utf8");
const resumeRoute = await readFile("viewer/app/api/tutor/resume/route.ts", "utf8");
const resumeDto = await readFile("viewer/lib/tutor/resume-dto.ts", "utf8");
const tutorPage = await readFile("viewer/app/tutor/page.tsx", "utf8");
const voiceIndicator = await readFile("viewer/components/tutor/VoiceIndicator.tsx", "utf8");
const supabaseProxy = await readFile("viewer/lib/supabase/proxy.ts", "utf8");
const loginActions = await readFile("viewer/lib/supabase/actions.ts", "utf8");
const loginPage = await readFile("viewer/app/login/page.tsx", "utf8");
const loginForm = await readFile("viewer/app/login/LoginForm.tsx", "utf8");

/** 함수 본문(선언부터 2칸 들여쓴 닫는 중괄호까지)을 잘라온다 — 이 파일 전체의 기존 관례. */
function fnBody(src: string, signature: string): string {
  const start = src.indexOf(signature);
  if (start === -1) return "";
  const end = src.indexOf("\n  }\n", start);
  return end === -1 ? "" : src.slice(start, end + 5);
}

describe("Groq Provider 경계", () => {
  it("LLM/STT 모두 GROQ_API_KEY 를 생성자로만 받는다 (프로세스 환경변수 직접 참조는 팩토리에서만)", () => {
    assert.ok(groqQwen.includes("apiKey: string"), "생성자 인자로 apiKey를 받아야 한다");
    assert.ok(groqWhisper.includes("apiKey: string"));
    assert.ok(providerIndex.includes("process.env.GROQ_API_KEY"), "키 조회는 팩토리 한 곳");
  });

  it("모델 id를 env로 override할 수 있고, 하드코딩된 기본값이 있다", () => {
    assert.ok(groqQwen.includes("GROQ_LLM_MODEL"));
    assert.ok(groqQwen.includes("qwen/qwen3.8-27b"), "실제 Groq 문서 기준 모델 id");
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
    assert.ok(sttRoute.includes("MAX_STT_AUDIO_BYTES"));
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

  it("manifest/sw/아이콘은 로그인 미들웨어를 거치지 않는다 (Production에서 실제로 /login 307을 받던 버그 수정)", () => {
    for (const file of [
      "manifest.webmanifest",
      "sw.js",
      "icon-192.png",
      "icon-512.png",
      "icon-512-maskable.png",
      "apple-touch-icon.png",
    ]) {
      assert.ok(proxySrc.includes(file), `proxy matcher가 ${file}을 제외해야 한다`);
    }
  });

  it("Service Worker는 페이지 내비게이션과 /api/** 를 캐시하지 않는다", () => {
    assert.ok(sw.includes('request.mode === "navigate"'));
    assert.ok(sw.includes('url.pathname.startsWith("/api/")'));
    assert.ok(sw.includes("return;"), "캐시하지 않고 그대로 network로 보내야 한다");
  });
});

describe("음성 UX 안전 규칙", () => {
  it("STT 성공 시 별도 보내기 클릭 없이 즉시 Tutor로 자동 전송한다(빈 transcript는 전송하지 않음)", () => {
    const transcribeBody = tutorApp.match(/async function transcribeAndSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(transcribeBody.includes("if (!text) {"), "빈 transcript/무음은 전송하지 않아야 한다");
    assert.ok(transcribeBody.includes("await handleSend(text);"), "유효 transcript는 자동으로 handleSend를 호출해야 한다");
  });

  it("TTS 실패는 조용히 무시하고 텍스트를 유지한다 (throw하지 않음, ttsNotice로만 비차단 안내)", () => {
    assert.ok(tutorApp.includes("catch {"), "synthesize/play 실패를 잡아야 한다");
    assert.ok(tutorApp.includes("setTtsNotice("), "실패 시 비차단 안내를 띄운다");
    assert.ok(!/throw\s+err/.test(tutorApp.match(/async function speakReply[\s\S]*?\n  \}\n/)?.[0] ?? ""));
  });

  it("voice off일 때 TTS를 호출하지 않는다", () => {
    assert.ok(tutorApp.includes("if (!voiceOnRef.current)"));
  });

  it("최초 Lesson 인사말도 기존 speakReply() 경로로 1회만 읽는다 (handleStart가 중복 호출돼도 마지막 호출만)", () => {
    const handleStartMatch = tutorApp.match(/async function handleStart\([\s\S]*?\n  \}\n/);
    assert.ok(handleStartMatch, "handleStart 함수를 찾을 수 없습니다");
    const handleStartBody = handleStartMatch![0];

    assert.ok(handleStartBody.includes("const callId = ++handleStartCallIdRef.current;"), "중복 호출 구분용 id");
    assert.ok(
      handleStartBody.includes('setMessages([{ role: "assistant", content: greeting }]);'),
      "인사말 내용/생성 방식은 그대로",
    );
    assert.ok(
      /if \(handleStartCallIdRef\.current === callId\) \{\s*if \(!mobileRef.current\) void speakReply\(greeting\);/.test(handleStartBody),
      "가장 마지막 handleStart 호출만 greeting을 speakReply()로 읽어야 한다",
    );
    assert.ok(
      !/new Audio\(|MeloTTSProvider|tts\.synthesize/.test(handleStartBody),
      "handleStart가 직접 오디오/TTS를 구현하면 안 된다 — 기존 speakReply() 함수만 재사용",
    );
  });

  it("TTS로 보내기 전 마크다운 기호를 벗겨낸다 (Groq 실사용 검증 중 발견: 백틱이 MeloTTS 합성을 깨뜨림) — tts-chunking.ts로 이동", () => {
    assert.ok(ttsChunking.includes("export function stripMarkdownForSpeech"), "마크다운 제거 함수가 있어야 한다");
    assert.ok(speechOutput.includes("chunkTextForSpeech"), "speakReply()가 chunking(내부에서 strip 포함)을 거쳐야 한다");
  });

  it("종료 의사는 버튼 + 보조적 텍스트 감지 둘 다 있다 (자동 완료 처리는 아님)", () => {
    assert.ok(tutorApp.includes("학습 종료"));
    assert.ok(tutorApp.includes("END_INTENT_PATTERN"));
    assert.ok(tutorApp.includes("showEndConfirm"), "감지되면 확인만 묻고 바로 끝내지 않는다");
  });
});

/**
 * 2026-09-30 결정: 실제 수업 UI는 /lesson/[...id] 의 [Lesson + AI Tutor Sidebar] 하나뿐이다.
 * /tutor 는 수업 "선택"만 하고 고르면 그 Lesson 화면으로 이동한다(?tutor=open). 이전의
 * /tutor 전용 채팅형 수업 화면(TutorApp standalone chat + 자체 Drawer + LessonContent)은
 * 제거했다 — Tutor UI를 두 벌 유지하지 않는다.
 */
describe("Tutor 진입 통일 — 실제 수업은 Lesson + Tutor Sidebar 하나", () => {
  it("TutorApp은 Lesson 본문을 직접 그리지 않는다 — 교재는 Lesson 페이지의 LessonContent 한 곳뿐", () => {
    assert.ok(lessonPage.includes("<LessonContent lesson={lesson} />"), "Lesson 페이지가 기존 렌더러를 그대로 쓴다");
    assert.ok(
      !tutorApp.includes('from "@/components/LessonContent"') && !tutorApp.includes("<LessonContent"),
      "TutorApp이 교재를 다시 렌더하면 수업 화면이 두 벌이 된다",
    );
    assert.ok(
      !/lesson\.sections\.map|lesson\.codeExamples\.map/.test(tutorApp),
      "TutorApp이 섹션/코드예제를 직접 렌더하면 안 된다 — LessonContent에 위임",
    );
    assert.ok(lessonContentSrc.includes("export function LessonContent"));
  });

  it("TutorApp에 별도 수업 화면용 Drawer/열림 state/focus mode가 남아있지 않다", () => {
    for (const needle of ["import Drawer", "<Drawer", "sidebarOpen", "useLessonFocusMode", "lessonDetail"]) {
      assert.ok(!tutorApp.includes(needle), `${needle} — standalone 채팅형 수업 화면의 잔재`);
    }
    // 예전처럼 Lesson과 Tutor가 같은 flex row의 형제로 폭을 나눠 갖는 구조(고정폭 380 Box)도 없어야 한다.
    assert.ok(!/width:\s*380,\s*flexShrink:\s*0,\s*borderLeft/.test(tutorApp));
    assert.ok(tutorSidebar.includes("onCollapse"), "사이드바 안에 접기 버튼이 있어야 한다");
  });

  it("chat view는 TutorSidebar 하나만 돌려준다(위치·폭·overlay는 LessonTutorSidebar 담당)", () => {
    const chatReturn = tutorApp.match(/\/\/ view === "chat"[\s\S]*?\n}\n/)?.[0] ?? "";
    assert.ok(chatReturn.includes('return <Box sx={{ height: props.mobile ? "auto" : "100%" }}>{sidebar}</Box>;'));
    assert.equal((chatReturn.match(/return /g) ?? []).length, 1, "chat view의 다른 레이아웃 분기가 없어야 한다");
  });

  it("/tutor 수업 선택 → Lesson 화면으로 이동(?tutor=open) — standalone에서 세션을 직접 시작하지 않는다", () => {
    const openBody = tutorApp.match(/function openLessonPage\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(openBody.includes("router.push(lessonHref(lesson.id, { openTutor: true }));"));
    assert.ok(tutorApp.includes("onPick={openLessonPage}"), "StartScreen의 선택은 Lesson 화면 이동이어야 한다");
    assert.ok(!tutorApp.includes("onPick={handleStart}"), "standalone에서 handleStart로 수업을 시작하면 수업 화면이 두 벌이 된다");
    const mountEffect = tutorApp.match(/useEffect\(\(\) => \{\s*if \(layoutMode === "sidebar"\) \{[\s\S]*?\n  \}, \[\]\);/)?.[0] ?? "";
    assert.ok(mountEffect, "mount effect를 찾을 수 없습니다");
    assert.ok(!mountEffect.includes("autoStartLessonId"), "standalone 자동 시작 경로는 제거됐다");
  });

  it("/tutor?lessonId= (예전 바로 시작 링크)는 같은 Lesson 화면으로 redirect한다", () => {
    assert.ok(tutorPage.includes("if (lessonId) redirect(lessonHref(lessonId, { openTutor: true }));"));
    assert.ok(!tutorPage.includes("autoStartLessonId"));
  });

  it("일반 Lesson 직접 진입은 query·진입 경로와 무관하게 Tutor를 연다", () => {
    assert.ok(!lessonPage.includes("searchParams"));
    assert.ok(!lessonTutorSidebar.includes("initialOpen"));
    assert.ok(!/localStorage|sessionStorage|usePathname|useSearchParams/.test(lessonTutorSidebar));
    assert.ok(
      lessonTutorSidebar.includes("else handleOpen();") && lessonTutorSidebar.includes("if (!ready || initialized.current) return;"),
      "자동 열기는 별도 로직이 아니라 기존 handleOpen(resume 로딩·마운트·focus)을 그대로 불러야 한다",
    );
  });

  it("AppShell의 Navigation trigger(☰)는 항상 aria-expanded를 갖고, 열림 상태를 그대로 반영한다", () => {
    assert.ok(appShell.includes('aria-label="탐색 메뉴 열기"'));
    assert.ok(appShell.includes("aria-expanded={open}"));
  });

  it("사이드바 wiring(대화 기록/마이크/TTS/텍스트 입력)이 그대로 전달된다", () => {
    assert.ok(tutorApp.includes("recording={voiceState ===") && tutorApp.includes("onMicClick={onMicClick}"));
    assert.ok(tutorApp.includes("onSend={() => void handleSend()}"));
    assert.ok(tutorApp.includes("historyExpanded={historyExpanded}"));
    assert.ok(tutorApp.includes("onStopSpeaking={stopSpeaking}"));
  });

  it("대화 기록은 컨트롤러 상태를 전달하는 공통 보조 UI다", () => {
    assert.ok(tutorSidebar.includes("historyExpanded"));
    assert.ok(!tutorSidebar.includes("messages.slice(-2)"));
    assert.ok(tutorSidebar.includes("<TutorHistory messages={props.messages}"));
  });

  it("session/start는 Tutor context와 함께 LessonDetail도 돌려준다(서버 계약 유지)", () => {
    assert.ok(startRoute.includes("lesson: context.lesson"));
  });
});

describe("mic 권한/오류 처리", () => {
  it("mic 권한 거부/장치 없음도 비차단으로 안내하고 텍스트 Tutor는 계속 쓸 수 있다", () => {
    assert.ok(tutorApp.includes("NotAllowedError") && tutorApp.includes("PermissionDeniedError"));
    assert.ok(tutorApp.includes("NotFoundError"));
    assert.ok(tutorApp.includes("function classifyMicError"));
  });

  it("Lesson 변경/학습 종료/unmount 시 마이크·오디오·큐를 정리한다(cleanup)", () => {
    const cleanupBody = tutorApp.match(/function cleanupVoiceResources\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    for (const needle of ["stopSpeakingInternal()", "sttAbortRef.current?.abort()", "mediaRecorderRef.current = null", "mediaRecorderRef.current.stop()"]) {
      assert.ok(cleanupBody.includes(needle), `cleanup에 ${needle}가 있어야 한다`);
    }
    assert.ok(
      /return \(\) => \{\s*activeRef\.current = false;\s*cleanupVoiceResources\(\);/.test(tutorApp),
      "unmount 시 정리해야 한다(sidebar 모드의 activeRef도 함께 꺼야 한다)",
    );
    assert.ok(/cleanupVoiceResources\(\); \/\/ 이전 Lesson/.test(tutorApp), "Lesson 재시작 시 이전 TTS/마이크를 정리해야 한다");
  });
});

describe("TTS chunking/prefetch — time-to-first-audio 최적화", () => {
  it("답변 전체를 한 번에 합성하지 않고 chunk 단위로 순서대로 재생한다", () => {
    const speakReplyBody = speechOutput;
    assert.ok(speakReplyBody.includes("chunkTextForSpeech(text)"));
    assert.ok(speakReplyBody.includes("for (let index = 0; index < chunks.length; index++)"), "chunk를 순서대로 재생해야 한다");
  });

  it("다음 chunk를 재생 중에 미리 합성한다(prefetch)", () => {
    const speakReplyBody = speechOutput;
    assert.ok(speakReplyBody.includes("getBlob(index + 1)"), "현재 chunk 처리 중 다음 chunk 합성을 미리 시작해야 한다");
  });

  it("정지하거나 새 turn이 시작되면 generation id로 이전 chunk 재생을 무효화한다(stale 재생 방지)", () => {
    assert.ok(tutorApp.includes("ttsGenerationRef"));
    assert.ok(tutorApp.includes("myGen === ttsGenerationRef.current"), "생성 시점의 generation과 다르면 중단해야 한다");
    assert.ok(tutorApp.includes("ttsGenerationRef.current += 1"), "정지 시 generation을 올려 이전 파이프라인을 무효화해야 한다");
  });

  it("재생한 Object URL을 정리한다(메모리 누수 방지)", () => {
    assert.ok((speechOutput.match(/URL\.revokeObjectURL/g) ?? []).length === 1, "chunk마다/정리 시 revoke해야 한다");
  });

  it("문장 경계 우선 chunking이며 자연스러운 길이로 합치고 쪼갠다", () => {
    assert.ok(ttsChunking.includes("splitIntoSentences"));
    assert.ok(ttsChunking.includes("MIN_CHUNK_CHARS") && ttsChunking.includes("MAX_CHUNK_CHARS"));
    assert.ok(ttsChunking.includes("HARD_MAX_CHUNK_CHARS"), "너무 긴 문장은 보조 기준으로 강제 분리해야 한다");
  });
});

/**
 * 코드 리뷰(2차) 회귀 방지 — 구현 로그 중간에 legacy speak()/speakReply()가 동시에
 * 남아있던 흔적, 중복 boolean state 등을 점검한 결과를 "존재 여부"가 아니라
 * "정확한 횟수"로 고정한다. 단순 .includes() boolean 체크는 "두 번째 호출이 추가로
 * 더 있는지"는 못 잡아내므로, 개수를 직접 세어 이중 호출을 구조적으로 막는다.
 * (Next.js/Supabase 런타임 없이 소스 텍스트만 보는 이 파일의 기존 방식과 동일하다 —
 * React 컴포넌트를 실제로 마운트해 검증하는 러너는 이 프로젝트에 없다.)
 */
describe("TTS 이중 호출 방지 (회귀 테스트)", () => {
  it("legacy speak() 함수/호출이 완전히 제거됐다 — speakReply()만 canonical 경로다", () => {
    assert.ok(!/function speak\(/.test(tutorApp), "구 speak() 함수 선언이 남아있으면 안 된다");
    assert.ok(!/\bspeak\(greeting\)/.test(tutorApp), "구 speak(greeting) 호출이 남아있으면 안 된다");
    assert.ok(!/\bspeak\(data\.reply\)/.test(tutorApp), "구 speak(data.reply) 호출이 남아있으면 안 된다");
    // speakReply는 정의 1회 + 실제 호출 2회(greeting, 일반 답변)여야 한다.
    assert.equal((tutorApp.match(/async function speakReply\(/g) ?? []).length, 1);
    assert.equal((tutorApp.match(/void speakReply\(/g) ?? []).length, 4, "다시 듣기/세션 인사/음성 ON 인사/일반 응답이 같은 파이프라인을 사용한다");
  });

  it("greeting은 handleStart 안에서 정확히 1번만 speakReply를 호출한다", () => {
    const handleStartBody = tutorApp.match(/async function handleStart\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.equal((handleStartBody.match(/void speakReply\(/g) ?? []).length, 1);
    assert.equal((handleStartBody.match(/\.synthesize\(/g) ?? []).length, 0, "handleStart가 직접 synthesize를 호출하면 안 된다");
  });

  it("일반 Tutor 답변은 handleSend 안에서 정확히 1번만 speakReply를 호출한다", () => {
    const handleSendBody = tutorApp.match(/async function handleSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.equal((handleSendBody.match(/void speakReply\(/g) ?? []).length, 1);
  });

  it("audio.play()는 전체 파일에서 정확히 1곳(playBlob)에서만 호출된다 — 중복 재생 경로 없음", () => {
    assert.equal((speechOutput.match(/\.play\(\)/g) ?? []).length, 1);
    const playBlobBody = speechOutput;
    assert.ok(playBlobBody.includes(".play()"), "play() 호출은 playBlob 안에 있어야 한다");
  });

  it("/synthesize는 chunk당 정확히 1번만 요청한다(getBlob이 Map으로 메모이즈)", () => {
    const speakReplyBody = speechOutput;
    assert.ok(speakReplyBody.includes("blobPromises.has(index)"), "이미 요청한 chunk는 다시 요청하지 않아야 한다");
    assert.equal((speakReplyBody.match(/provider\.synthesize\(/g) ?? []).length, 1, "synthesize 호출부는 getBlob 안 한 곳뿐이어야 한다");
  });
});

describe("음성 state/ref 동기화 (회귀 테스트)", () => {
  it("옛 recording/transcribing/speaking/sending boolean state가 재도입되지 않았다", () => {
    assert.ok(!/const \[recording,/.test(tutorApp));
    assert.ok(!/const \[transcribing,/.test(tutorApp));
    assert.ok(!/const \[speaking,/.test(tutorApp));
    assert.ok(!/const \[sending,/.test(tutorApp), "sending은 voiceState('thinking')으로 흡수됐다");
    // starting은 음성 상태가 아니라 "시작하기" 버튼의 API 로딩 상태라 별도로 남아있는 게 맞다.
    assert.ok(tutorApp.includes("const [starting, setStarting]"), "starting은 음성과 무관한 값이라 유지해야 한다");
  });

  it("voiceState는 setVoiceState() 한 곳에서만 state와 ref를 함께 갱신한다(불일치 원천 차단)", () => {
    assert.equal((tutorApp.match(/function setVoiceState\(/g) ?? []).length, 1);
    const setter = tutorApp.match(/function setVoiceState\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(setter.includes("voiceStateRef.current = next;") && setter.includes("setVoiceStateRaw(next);"));
    assert.ok(!/setVoiceStateRaw\(/.test(tutorApp.replace(setter, "")), "setVoiceStateRaw를 직접 호출하는 곳이 없어야 한다(항상 setVoiceState 경유)");
  });

  it("voiceOnRef는 voiceOn state에만 의존하는 useEffect로 동기화한다", () => {
    assert.match(tutorApp, /useEffect\(\(\) => \{\s*voiceOnRef\.current = voiceOn;\s*\}, \[voiceOn\]\);/);
  });

  it("handleSend에는 finally가 없다 — 응답 실패 처리와 TTS 시작이 서로 밟고 지나가지 않는다", () => {
    const handleSendBody = tutorApp.match(/async function handleSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(!/\}\s*finally\s*\{/.test(handleSendBody));
  });
});

/**
 * 핸즈프리/VAD 기반 자동 발화 종료를 완전히 제거하고, 사용자가 마이크 시작/중지를
 * 직접 제어하는 반자동 음성 입력으로 전환한 최종 UX를 검증한다(2026-09-15 결정).
 */
describe("수동 시작·종료 후 STT 자동 전송", () => {
  it("A. 녹음 시작은 idle에서만 — speaking/thinking/transcribing 중에는 시작하지 않는다", () => {
    const startBody = fnBody(tutorApp, "async function startRecording(");
    assert.ok(
      startBody.includes('if (voiceStateRef.current !== "idle" || micStartingRef.current) return;'),
      "idle이 아니거나 권한 요청이 진행 중이면 새로 시작하지 않는다(TTS와 마이크 동시 활성 금지)",
    );
    assert.ok(startBody.includes('setVoiceState("recording");'));
    assert.ok(startBody.includes("await navigator.mediaDevices.getUserMedia"));
    assert.ok(
      startBody.includes('voiceStateRef.current !== "idle") {'),
      "권한 요청을 기다리는 사이 다른 상태(텍스트 전송 등)가 됐으면 녹음을 시작하지 않아야 한다",
    );
  });

  it("B. 🎤(recording 중)/[말하기 끝]은 MediaRecorder.stop()만 호출한다 — 발화 종료를 프로그램이 판단하지 않는다", () => {
    const micBody = fnBody(tutorApp, "function onMicClick(");
    assert.ok(/if \(voiceStateRef\.current === "recording"\) \{\s*stopRecording\(\);\s*return;\s*\}/.test(micBody));
    const stopBody = fnBody(tutorApp, "function stopRecording(");
    assert.ok(stopBody.includes('if (voiceStateRef.current !== "recording") return;'));
    assert.ok(stopBody.includes("recorder.stop();") && stopBody.includes('setVoiceState("transcribing")'));
    assert.equal(
      (tutorApp.match(/stopRecording\(\)/g) ?? []).length,
      2,
      "정의 1회 + 🎤 토글 호출 1회뿐이어야 한다(그 외엔 [말하기 끝] prop 전달) — 타이머/자동 호출 금지",
    );
    assert.ok(tutorApp.includes("onFinishUtterance={stopRecording}"), "[말하기 끝] 버튼은 stopRecording에 연결된다");
  });

  it("C. 중지(stop) 시 기존 /api/tutor/stt(Whisper)로 그 구간의 오디오만 보낸다", () => {
    const startBody = fnBody(tutorApp, "async function startRecording(");
    assert.ok(startBody.includes("recorder.onstop"));
    assert.ok(startBody.includes("void transcribeAndSend(blob, myEpoch)"));
    const transcribeBody = fnBody(tutorApp, "async function transcribeAndSend(");
    assert.ok(transcribeBody.includes('fetch("/api/tutor/stt"'));
  });

  it("D. 유효 transcript는 별도 보내기 클릭 없이 즉시 handleSend로 자동 전송된다", () => {
    const transcribeBody = fnBody(tutorApp, "async function transcribeAndSend(");
    assert.ok(transcribeBody.includes("await handleSend(text);"));
    assert.ok(!transcribeBody.includes("setInput("), "다시 입력창에 채우고 기다리는 옛 방식으로 되돌아가면 안 된다");
  });

  it("E. 빈 transcript(무음/공백)는 자동 전송하지 않고, 알린 뒤 다시 말할 수 있게 복구한다", () => {
    const transcribeBody = fnBody(tutorApp, "async function transcribeAndSend(");
    const emptyBlock = transcribeBody.match(/if \(!text\) \{[\s\S]*?\n      \}/)?.[0] ?? "";
    assert.ok(emptyBlock.includes("setError("), "사용자에게 상태를 보여줘야 한다");
    assert.ok(emptyBlock.includes('setVoiceState("idle");'));
    assert.ok(emptyBlock.includes("return;") && !emptyBlock.includes("handleSend"), "빈 transcript를 보내면 안 된다");
  });

  it("F. STT 실패는 idle로 복구하고 수동 재시도를 기다린다", () => {
    const body = fnBody(tutorApp, "async function transcribeAndSend(");
    const failure = body.split(/\}\s*catch/)[1] ?? "";
    assert.ok(failure.includes('setVoiceState("idle")'));
    assert.ok(failure.includes("setError("));
    assert.ok(!body.includes("startRecording(") && !body.includes("maybeAutoListen"));
  });

  it("G. 녹음에는 발화 감지기·자동 종료 타이머가 없다", () => {
    const body = fnBody(tutorApp, "async function startRecording(");
    for (const token of ["TurnDetector", "AudioContext", "setInterval", "setTimeout", "heardSpeech"]) {
      assert.ok(!body.includes(token), token);
    }
    assert.ok(!tutorApp.includes('startRecording("auto")'));
  });

  it("H. 사용자가 직접 중지하기 전에는 STT가 호출되지 않는다 — recorder.onstop에서만 transcribeAndSend를 부른다", () => {
    assert.equal((tutorApp.match(/transcribeAndSend\(/g) ?? []).length, 2, "정의 1회 + onstop에서 호출 1회여야 한다");
    const startBody = fnBody(tutorApp, "async function startRecording(");
    const onstopBody = startBody.match(/recorder\.onstop = \(\) => \{[\s\S]*?\n    \};/)?.[0] ?? "";
    assert.ok(onstopBody.includes("transcribeAndSend"), "onstop 콜백 안에서만 호출돼야 한다");
  });

  it("I. 설명 중에는 마이크가 잠기며 음성 중지와 녹음 시작은 별도 사용자 행동이다", () => {
    assert.ok(tutorApp.includes('micDisabled={micPending || (voiceState !== "idle" && voiceState !== "recording")}'));
    assert.ok(!fnBody(tutorApp, "function onMicClick(").includes("stopSpeakingInternal"));
  });

  it("J. TTS 종료/정지/실패는 idle로 돌아가며 마이크를 열지 않는다", () => {
    assert.ok(fnBody(tutorApp, "async function speakReply(").includes("endAssistantTurn();"));
    assert.ok(fnBody(tutorApp, "function stopSpeaking()").includes("endAssistantTurn();"));
    const end = fnBody(tutorApp, "function endAssistantTurn(");
    assert.ok(end.includes('setVoiceState("idle")'));
    assert.ok(!end.includes("startRecording"));
    assert.ok(!tutorApp.includes("maybeAutoListen"));
  });

  it("음성 상태는 수동 녹음의 여섯 상태로 유지한다", () => {
    const union = voiceStateSrc.match(/export type VoiceState =\s*([\s\S]*?);/)?.[1] ?? "";
    assert.ok(!union.includes('"listening"'));
    for (const state of ["idle", "recording", "transcribing", "thinking", "speaking", "error"]) assert.ok(union.includes(state));
  });

  it("핸즈프리/VAD 전용 함수·ref·모듈이 전부 제거됐다", () => {
    for (const needle of [
      "toggleHandsFree",
      "resumeListening",
      "startHandsFreeListening",
      "ensureHandsFreeMicStream",
      "startVadHeartbeat",
      "runVadTick",
      "finalizeHandsFreeUtterance",
      "pauseVadSampling",
      "handsFreeStreamRef",
      "handsFreeRecorderRef",
      "handsFreeChunksRef",
      "recordingSourceRef",
      "vadDetectorRef",
      "vadFloatBufferRef",
      "analyserRef",
      "audioContextRef",
      "cmm-tutor-handsfree",
    ]) {
      assert.ok(!tutorApp.includes(needle), `${needle} 잔재가 남아있으면 안 된다`);
    }
    assert.ok(!tutorSidebar.includes("handsFree") && !tutorSidebar.includes("onToggleHandsFree"));
  });

  it("viewer/lib/tutor/vad.ts와 그 전용 테스트가 삭제됐다", async () => {
    await assert.rejects(() => readFile("viewer/lib/tutor/vad.ts", "utf8"));
    await assert.rejects(() => readFile("tests/tutor-vad.test.ts", "utf8"));
  });
});

describe("사이드바 '정지' 버튼 — TTS 재생 중일 때만 의미 있는 동작을 보여준다 (버그 수정 확인)", () => {
  it('voiceState !== "idle" 전체가 아니라 "speaking"일 때만 정지 버튼을 보여준다', () => {
    assert.ok(
      tutorSidebar.includes('props.voiceState === "speaking" &&'),
      "리뷰에서 발견: listening/recording/transcribing/thinking 중에도 버튼이 떠서 눌러도 아무 효과가 없었다",
    );
    assert.ok(
      !/voiceState === "speaking" \|\| props\.voiceState !== "idle"/.test(tutorSidebar),
      "수정 전의 중복(항상 참이 되는) 조건이 되돌아오면 안 된다",
    );
  });
});

/**
 * Lesson 화면(/lesson/[...id])에 AI Tutor를 그 자리에서 열 수 있게 하는 기능(2026-09-29).
 * 기존 TutorApp/TutorSidebar/session API를 layoutMode prop으로 재사용하며, 새 구현은
 * "패널을 화면 어디에 어떻게 보여줄지"(LessonTutorSidebar)뿐이다.
 */
describe("Lesson 임베디드 Tutor Sidebar — 기존 Tutor 재사용 (신규)", () => {
  it("TutorApp은 layoutMode/active/onRequestClose/initialLesson prop을 받는다(기본값은 standalone)", () => {
    assert.ok(tutorApp.includes('layoutMode?: "standalone" | "sidebar"'));
    assert.ok(tutorApp.includes("active?: boolean"));
    assert.ok(tutorApp.includes("onRequestClose?: () => void"));
    assert.ok(tutorApp.includes("initialLesson?: LessonRef"));
    assert.ok(tutorApp.includes('const layoutMode = props.layoutMode ?? "standalone";'));
  });

  it("sidebar 모드의 mount-effect는 initialLesson으로 시작을 고정한다 — allLessons.find에 의존하지 않는다", () => {
    assert.ok(
      /if \(layoutMode === "sidebar"\) \{\s*if \(props\.initialLesson\) void handleStart\(props\.initialLesson\);\s*return;\s*\}/.test(
        tutorApp,
      ),
      "sidebar 모드는 화면에 보이는 Lesson으로만 시작해야 한다(화면-Tutor Lesson 불일치 방지)",
    );
  });

  it("activeRef — sidebar 모드에서 패널이 닫힌 뒤 도착하는 응답은 제출/재생하지 않는다", () => {
    assert.ok(tutorApp.includes("const activeRef = useRef(true);"));
    assert.ok(tutorApp.includes("const requestEpochRef = useRef(0);"), "닫기 이전 요청을 구분할 세대 값이 있어야 한다");
    const activeEffectBody = tutorApp.match(/useEffect\(\(\) => \{\s*const next = props\.active[\s\S]*?\n  \}, \[props\.active\]\);/)?.[0] ?? "";
    assert.ok(activeEffectBody.includes("activeRef.current = next;"), "부모의 active prop을 그대로 따라야 한다");
    assert.ok(
      activeEffectBody.includes("requestEpochRef.current += 1;") && activeEffectBody.includes("cleanupVoiceResources();"),
      "닫히는 순간(트리거와 무관하게) 세대를 올리고 마이크/재생을 실제로 정리해야 한다",
    );
    const speakReplyBody = tutorApp;
    assert.ok(
      speakReplyBody.includes('if (!activeRef.current) {') && speakReplyBody.includes('setVoiceState("idle");'),
      "숨겨진 패널에서 음성이 재생되면 안 되고, 그때도 thinking 상태가 굳으면 안 된다",
    );
    const transcribeBody = tutorApp.match(/async function transcribeAndSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(
      transcribeBody.includes("if (!activeRef.current || requestEpochRef.current !== myEpoch)"),
      "STT 응답이 도착했을 때 패널이 닫혀 있거나 그 사이 닫혔다 다시 열렸으면 자동 전송하지 않아야 한다",
    );
    const handleStartBody = tutorApp.match(/async function handleStart\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(
      !handleStartBody.includes("if (!activeRef.current) return;"),
      "첫 세션시작 응답을 activeRef로 버리면 재오픈해도 복구할 방법이 없어 영구 로딩에 빠진다 — 항상 반영해야 한다",
    );
  });

  it("녹음 취소가 녹음 제출이 되면 안 된다 — 패널이 닫히는 동안(또는 닫혔다 다시 열려도)의 오래된 녹음은 전송하지 않는다", () => {
    const startBody = fnBody(tutorApp, "async function startRecording(");
    assert.ok(startBody.includes("const myEpoch = requestEpochRef.current;"), "녹음 시작 시점의 세대를 캡처해야 한다");
    assert.ok(
      /recorder\.onstop = \(\) => \{[\s\S]*?if \(!activeRef\.current \|\| requestEpochRef\.current !== myEpoch\) return;[\s\S]*?void transcribeAndSend\(blob, myEpoch\);\s*\};/.test(
        startBody,
      ),
      "onstop은 지금 닫혀 있거나 그 사이 닫혔다 다시 열렸으면(세대 불일치) transcribeAndSend를 부르지 않고 버려야 한다",
    );
    assert.ok(
      startBody.includes("if (!activeRef.current || requestEpochRef.current !== myEpoch ||") &&
        startBody.includes("stream.getTracks().forEach((track) => track.stop());"),
      "권한 요청 중 패널이 닫혔으면 새로 받은 stream을 바로 정리해야 한다",
    );
    const cleanupBody = fnBody(tutorApp, "function cleanupVoiceResources(");
    assert.ok(
      cleanupBody.includes("requestEpochRef.current += 1;"),
      "정리(대화 모드 끔/학습 종료 등) 자체가 세대를 올려야 한다 — 그래야 cleanup이 stop()한 녹음의 onstop이 제출되지 않는다",
    );
  });

  it("abandonAndLeave/saved 화면은 현재 화면을 벗어나지 않는다(router.push 없음)", () => {
    const abandonBody = fnBody(tutorApp, "async function abandonAndLeave(");
    assert.ok(!abandonBody.includes("router.push"), "수업은 Lesson 화면에서만 진행된다 — 나가기가 다른 화면으로 이동하면 안 된다");
    assert.ok(abandonBody.includes("props.onRequestClose?.();"));
    const savedMatch = tutorApp.match(/if \(view === "saved"\) \{[\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(
      savedMatch.includes('onClick={() => props.onRequestClose?.()}'),
      "saved 화면은 닫기만 해야 한다(Tutor 홈/복습 목록으로 이동 금지)",
    );
    assert.ok(!savedMatch.includes("router.push"));
  });

  it("abandon 응답 도착 전에 닫히거나 unmount됐으면 새 세션을 재무장하지 않는다(다른 Lesson 세션을 abandon시키는 사고 방지)", () => {
    const abandonBody = fnBody(tutorApp, "async function abandonAndLeave(");
    assert.ok(
      /if \(!activeRef\.current\) return;\s*if \(currentLesson\) await handleStart\(currentLesson\);/.test(abandonBody),
      "activeRef가 꺼져 있으면(닫힘 또는 unmount) handleStart 재호출 전에 그쳐야 한다 — 다른 Lesson으로 이동한 뒤 이 abandon 응답이 도착해 handleStart를 부르면 그 Lesson의 새 세션이 서버에서 abandon된다",
    );
  });

  it("handleSend는 응답 도착 시 세션이 이미 다른 것으로 바뀌었으면 옛 답변을 섞지 않는다", () => {
    const handleSendBody = fnBody(tutorApp, "async function handleSend(");
    assert.ok(
      handleSendBody.includes("const sendGen = handleStartCallIdRef.current;"),
      "보낼 때의 세션 세대를 캡처해야 한다(abandon 재무장은 handleStart를 다시 부르므로 이 값이 바뀐다)",
    );
    assert.ok(
      handleSendBody.indexOf("if (handleStartCallIdRef.current !== sendGen) return;") < handleSendBody.indexOf("setMessages((prev)"),
      "응답이 오는 사이 새 세션이 시작됐으면(abandon 재무장 등) setMessages/speakReply 전에 버려야 한다",
    );
  });

  it("onCollapse는 대화를 지우지 않고 부모에게 닫기만 요청한다(정리는 active effect가 트리거와 무관하게 공통 처리)", () => {
    assert.ok(
      tutorApp.includes("onCollapse={() => props.onRequestClose?.()}"),
      "▸ 버튼이 직접 cleanup을 부르면 Escape/backdrop 경로와 정리 시점이 달라진다 — active effect 한 곳에 모아야 한다",
    );
  });

  it("LessonTutorSidebar — 최초로 열기 전에는 TutorApp을 마운트하지 않는다(everOpened)", () => {
    assert.ok(lessonTutorSidebar.includes("const [everOpened, setEverOpened] = useState(false);"));
    assert.ok(lessonTutorSidebar.includes("const [panelOpen, setPanelOpen] = useState(false);"));
    assert.ok(
      lessonTutorSidebar.includes("display: everOpened ? \"block\" : \"none\","),
      "패널 컨테이너는 everOpened로만 마운트를 결정해야 한다",
    );
    assert.ok(
      !/\{panelOpen && <(Box|TutorApp)/.test(lessonTutorSidebar),
      "panelOpen만으로 TutorApp을 조건부 렌더하면 닫을 때마다 unmount되어 대화가 사라진다",
    );
  });

  it("LessonTutorSidebar — Desktop push 임계값은 AppShell의 md와 별개다(그 기준을 그대로 재사용하지 않는다)", () => {
    assert.ok(
      lessonTutorSidebar.includes("PUSH_MIN_WIDTH_PX = 1400"),
      "900px(md) 기준으로 push하면 2026-09-15에 고친 '3열이 Lesson을 좁게 만드는' 문제가 재현된다",
    );
    assert.ok(!appShell.includes("PUSH_MIN_WIDTH_PX"), "AppShell의 breakpoint를 그대로 가져다 쓰지 않는다");
  });

  it("LessonTutorSidebar — TutorApp을 담는 Box는 하나뿐이다(Desktop/Mobile을 위해 두 번 마운트하지 않는다)", () => {
    assert.equal(
      (lessonTutorSidebar.match(/<TutorApp/g) ?? []).length,
      1,
      "isWide에 따라 TutorApp을 다른 부모(aside/Drawer)로 옮기면 리마운트로 대화가 사라진다",
    );
    assert.ok(!lessonTutorSidebar.includes("import Drawer"), "MUI Drawer는 기본적으로 닫히면 자식을 unmount한다(keepMounted 없이는 부적합)");
  });

  it("LessonTutorSidebar — 닫혀 있는 패널은 inert로 Tab/스크린리더에서 제외된다(Codex 최종 리뷰에서 발견)", () => {
    assert.ok(
      lessonTutorSidebar.includes("inert={(!mobile && panelInert) || undefined}"),
      "width:0/transform으로만 가려서는 안의 버튼·입력이 계속 Tab 대상이자 스크린리더에 노출된다",
    );
    // panelInert는 panelOpen과 한 프레임 어긋나게 움직인다 — 닫히는 바로 그 렌더에서
    // (아직 focus/blur가 안 끝난 채로) inert까지 같이 적용하면 브라우저가 페이지 스크롤을
    // 맨 위로 되돌리는 부작용이 있었다(실브라우저 재검증 중 발견). 열 때는 즉시, 닫을
    // 때만 한 프레임(rAF) 늦춘다.
    const inertEffect = lessonTutorSidebar.match(/useEffect\(\(\) => \{\s*if \(panelOpen\) \{\s*setPanelInert\(false\);[\s\S]*?\n  \}, \[panelOpen\]\);/)?.[0] ?? "";
    assert.ok(inertEffect.includes("setPanelInert(false);"), "열 때는 즉시 inert를 풀어야 한다");
    assert.ok(
      inertEffect.includes("requestAnimationFrame(() => setPanelInert(true))"),
      "닫을 때는 한 프레임 늦춰 inert를 적용해 스크롤 부작용을 피해야 한다",
    );
    assert.ok(
      /role=\{!mobile && !isWide && panelOpen \? "dialog" : undefined\}/.test(lessonTutorSidebar) &&
        /aria-modal=\{!mobile && !isWide && panelOpen \? true : undefined\}/.test(lessonTutorSidebar),
      "닫힌 뒤에도 aria-modal=true가 남아있으면 안 된다(좁은 화면에서 실제로 modal로 열려 있을 때만)",
    );
  });

  it("LessonTutorSidebar — 닫기 전에 패널 안의 focus를 먼저 명시적으로 치운다(스크롤 위치 보존)", () => {
    assert.ok(
      lessonTutorSidebar.includes("panelRef.current?.contains(document.activeElement)"),
      "패널(또는 그 안)이 focus를 든 채로 inert가 되면 브라우저가 강제로 focus를 치우면서 스크롤을 맨 위로 되돌린다 — 그 전에 우리가 먼저 blur해야 한다",
    );
    assert.ok(lessonTutorSidebar.includes("getTarget()?.focus({ preventScroll: true })"), "닫힌 뒤 토글 버튼으로 focus를 옮길 때도 스크롤을 건드리면 안 된다");
  });

  it("LessonTutorSidebar — 좁은 화면에서 패널이 열려 있는 동안 배경(Lesson)을 inert로 막는다(키보드 focus 격리)", () => {
    assert.ok(
      lessonTutorSidebar.includes("const backgroundInert = !mobile && !isWide && panelOpen;"),
      "backdrop은 포인터만 막는다 — 키보드/스크린리더가 배경으로 넘어가지 못하게 별도로 막아야 한다",
    );
    assert.ok(lessonTutorSidebar.includes("inert={backgroundInert || undefined}"));
  });

  it("Lesson 페이지 — key={lesson.id}로 Lesson이 바뀌면 Tutor 패널을 강제로 새로 마운트한다", () => {
    assert.ok(lessonPage.includes("<LessonTutorSidebar"));
    assert.ok(/<LessonTutorSidebar\s+key=\{lesson\.id\}/.test(lessonPage), "다른 Lesson의 context가 섞이면 안 된다");
    assert.ok(
      !lessonPage.includes('/tutor?lessonId='),
      "이제 별도 /tutor 페이지로 이동하지 않고 이 화면에서 그대로 열어야 한다",
    );
  });

  it("/api/tutor/resume — 로그인 확인 후 getResumeState()를 그대로 재사용한다(새 조회 로직 없음)", () => {
    assert.ok(resumeRoute.includes("supabase.auth.getUser()"));
    assert.ok(resumeRoute.includes("await getResumeState()"));
    assert.ok(resumeRoute.includes("toResumeStateDTO(resume)"));
    assert.ok(resumeDto.includes("progressByLessonId.entries()"), "Map을 JSON 배열로 바꿔야 한다");
  });

  it("TutorApp은 LessonTutorSidebar wrapper를 알지 못한다(반대 방향 의존 없음)", () => {
    assert.ok(!tutorApp.includes("import { LessonTutorSidebar }"), "TutorApp이 새 wrapper를 알 필요는 없다(반대 방향 의존)");
  });
});

/**
 * 대화 모드(2026-09-30 결정) — 발화 "시작"만 자동, 발화 "종료"는 사용자.
 * AI 답변 → TTS 완전 종료 → 녹음 자동 시작 → [말하기 끝] → STT → 자동 전송 → 반복.
 * 순수 판단(shouldAutoListen)은 tests/tutor-voice-conversation.test.ts 가 직접 검증한다.
 */
describe("수동 음성 입력과 공통 TTS", () => {
    it("이전 자동 대화 설정을 읽지 않고 자동 녹음도 시작하지 않는다", () => {
      for (const token of ["conversationOn", "cmm-tutor-conversation", "maybeAutoListen", "TurnDetector"]) assert.ok(!tutorApp.includes(token), token);
      assert.equal((tutorApp.match(/void startRecording\(\)/g) ?? []).length, 1);
      assert.ok(fnBody(tutorApp, "function onMicClick(").includes("void startRecording();"));
    });
    it("음성 OFF는 요청과 미디어를 취소하고 ON은 인사를 공통 TTS로 보낸다", () => {
      const body = fnBody(tutorApp, "function setVoice(");
      assert.ok(body.includes("cleanupVoiceResources();"));
      assert.ok(body.includes("void speakReply(greeting[0].content)"));
      assert.ok(!body.includes("startRecording"));
    });
    it("STT의 최신 session/history ref와 녹음 중 텍스트 전송 방어를 유지한다", () => {
      const body = fnBody(tutorApp, "async function handleSend(");
      assert.ok(body.includes("const currentSessionId = sessionIdRef.current;"));
      assert.ok(body.includes("const history = messagesRef.current;"));
      assert.ok(body.includes('voiceStateRef.current === "recording"'));
    });
    it("사이드바의 수동 마이크·말하기 끝·음성 중지·텍스트 fallback이 유지된다", () => {
      assert.ok(tutorSidebar.includes('aria-label={props.recording ? "말하기 끝" : "말하기 시작"}'));
      assert.ok(tutorSidebar.includes("onFinishUtterance") && tutorSidebar.includes("음성 중지"));
      assert.ok(tutorSidebar.includes("음성 대화") && tutorSidebar.includes("props.onSend()"));
      assert.ok(!tutorSidebar.includes("onToggleConversation"));
    });
  });

describe("VoiceIndicator — 하나의 컴포넌트, 레벨은 표시 전용", () => {
  it("TutorSidebar는 VoiceIndicator를 한 번만 렌더하고 상태를 prop으로 넘긴다(상태별 원을 따로 만들지 않는다)", () => {
    assert.equal((tutorSidebar.match(/<VoiceIndicator /g) ?? []).length, 1);
    assert.ok(tutorSidebar.includes("<VoiceIndicator compact state={props.voiceState} stream={props.micStream} />"));
    assert.ok(tutorSidebar.includes('role="status" aria-live="polite"'), "상태 문구는 스크린리더에도 전달된다");
  });

  it("레벨은 녹음 종료 판단에 쓰이지 않는다 — 콜백 prop이 없고 MediaRecorder/stop을 건드리지 않는다", () => {
    const signature = voiceIndicator.match(/export function VoiceIndicator\(([\s\S]*?)\) \{/)?.[1] ?? "";
    assert.ok(signature.includes("state: VoiceState; stream: MediaStream | null"));
    assert.ok(!/on[A-Z]\w*:/.test(signature), "콜백 prop이 있으면 레벨이 녹음 종료로 이어질 수 있다");
    for (const needle of ["MediaRecorder", ".stop()", "getTracks"]) {
      assert.ok(!voiceIndicator.includes(needle), `${needle} — Indicator는 스트림을 소유/종료하지 않는다`);
    }
  });

  it("레벨은 React state가 아니라 CSS 변수로 매 프레임 쓴다(리렌더 없음)", () => {
    assert.ok(voiceIndicator.includes('el.style.setProperty("--voice-level"'));
    assert.ok(!/useState/.test(voiceIndicator), "애니메이션 값을 state로 두면 매 프레임 리렌더된다");
    assert.ok(voiceIndicator.includes("requestAnimationFrame(tick)"));
  });

  it("분석 자원을 정리한다 — rAF 취소, 노드 disconnect, AudioContext close / 스피커로 되돌리지 않는다", () => {
    for (const needle of ["cancelAnimationFrame(frame)", "source.disconnect()", "analyser.disconnect()", "audioCtx.close()", "void ctx?.close()"]) {
      assert.ok(voiceIndicator.includes(needle), `${needle} 정리가 있어야 한다`);
    }
    assert.ok(!voiceIndicator.includes("ctx.destination"), "내 목소리를 스피커로 출력하면 안 된다");
  });

  it("prefers-reduced-motion에서 반복 애니메이션을 끈다", () => {
    const start = voiceIndicator.indexOf('"@media (prefers-reduced-motion: reduce)"');
    const reduced = voiceIndicator.slice(start, start + 600);
    assert.ok(start > 0 && reduced.includes('animation: "none"') && reduced.includes('transition: "none"'));
  });
});

describe("로그인 후 원래 경로로 복귀 — 내부 경로만 허용(Open Redirect 방지)", () => {
  it("proxy는 로그인 안 된 요청의 경로를 safeNextPath로 걸러 ?next= 로 넘긴다", () => {
    assert.ok(supabaseProxy.includes("safeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`)"));
    assert.ok(supabaseProxy.includes('url.searchParams.set("next", next)'));
    assert.ok(supabaseProxy.includes('url.search = "";'), "원래 query가 /login URL에 그대로 섞이면 안 된다");
  });

  it("이미 로그인된 채로 /login?next= 에 오면 검증된 경로로, 아니면 / 로 보낸다", () => {
    assert.ok(supabaseProxy.includes('safeNextPath(request.nextUrl.searchParams.get("next")) ?? "/"'));
  });

  it("로그인 폼은 next를 hidden 값으로 넘기고, 서버 액션이 다시 검증한다(폼 값은 조작 가능)", () => {
    assert.ok(loginPage.includes("<LoginForm next={safeNextPath(next)} />"));
    assert.ok(loginForm.includes('<input type="hidden" name="next" value={next} />'));
    assert.ok(loginActions.includes('redirect(safeNextPath(formData.get("next")) ?? "/");'));
    assert.ok(!/redirect\("\/"\);\s*\}\s*\n\s*export async function logout/.test(loginActions), "무조건 / 로 보내던 예전 동작이 남아있으면 안 된다");
  });
});
