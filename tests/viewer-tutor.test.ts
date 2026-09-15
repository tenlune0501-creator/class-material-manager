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
    assert.ok(tutorApp.includes("if (!tts || !voiceOnRef.current)"));
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
      /if \(handleStartCallIdRef\.current === callId\) \{\s*void speakReply\(greeting\);/.test(handleStartBody),
      "가장 마지막 handleStart 호출만 greeting을 speakReply()로 읽어야 한다",
    );
    assert.ok(
      !/new Audio\(|MeloTTSProvider|tts\.synthesize/.test(handleStartBody),
      "handleStart가 직접 오디오/TTS를 구현하면 안 된다 — 기존 speakReply() 함수만 재사용",
    );
  });

  it("TTS로 보내기 전 마크다운 기호를 벗겨낸다 (Groq 실사용 검증 중 발견: 백틱이 MeloTTS 합성을 깨뜨림) — tts-chunking.ts로 이동", () => {
    assert.ok(ttsChunking.includes("export function stripMarkdownForSpeech"), "마크다운 제거 함수가 있어야 한다");
    assert.ok(tutorApp.includes("chunkTextForSpeech"), "speakReply()가 chunking(내부에서 strip 포함)을 거쳐야 한다");
  });

  it("종료 의사는 버튼 + 보조적 텍스트 감지 둘 다 있다 (자동 완료 처리는 아님)", () => {
    assert.ok(tutorApp.includes("학습 종료"));
    assert.ok(tutorApp.includes("END_INTENT_PATTERN"));
    assert.ok(tutorApp.includes("showEndConfirm"), "감지되면 확인만 묻고 바로 끝내지 않는다");
  });
});

describe("교재 중심 레이아웃 — 기존 Lesson 렌더러 재사용", () => {
  it("AI Tutor 전용 Lesson 렌더러를 새로 만들지 않고 LessonContent를 그대로 쓴다", () => {
    assert.ok(tutorApp.includes('import { LessonContent } from "@/components/LessonContent"'));
    assert.ok(tutorApp.includes("<LessonContent lesson={lessonDetail} />"));
    assert.ok(
      !/lesson\.sections\.map|lesson\.codeExamples\.map/.test(tutorApp),
      "TutorApp이 섹션/코드예제를 직접 렌더하면 안 된다 — LessonContent에 위임",
    );
  });

  it("session/start가 Tutor context뿐 아니라 화면에 보여줄 Lesson 전체(LessonDetail)도 함께 돌려준다", () => {
    assert.ok(startRoute.includes("lesson: context.lesson"), "트리밍하지 않은 전체 LessonDetail을 돌려줘야 한다");
  });

  it("Tutor 사이드바는 Desktop/Mobile 공통으로 하나의 overlay Drawer이고 접을 수 있다", () => {
    assert.ok(tutorApp.includes("const [sidebarOpen, setSidebarOpen]"), "Desktop/Mobile을 나누던 두 state가 하나로 합쳐져야 한다");
    assert.ok(!tutorApp.includes("sidebarOpenDesktop") && !tutorApp.includes("sidebarOpenMobile"), "예전 이원화 state가 남아있으면 안 된다");
    assert.ok(tutorSidebar.includes("onCollapse"), "사이드바 안에 접기 버튼이 있어야 한다");
  });

  it("대화 기록은 삭제하지 않고 접혀서 최근 발화만 보이다가 펼치면 전체를 본다", () => {
    assert.ok(tutorSidebar.includes("historyExpanded"));
    assert.ok(tutorSidebar.includes("messages.slice(-2)"), "접힌 기본 상태는 최근 발화만");
    assert.ok(tutorSidebar.includes("props.historyExpanded ? props.messages : lastMessages"));
  });
});

/**
 * 실사용 검수에서 발견된 문제: Desktop에서 [Navigation][Lesson][Tutor] 3열이
 * 동시에 고정폭을 차지해 Lesson 본문이 지나치게 좁아졌다. 수업 중(view==="chat")에는
 * Lesson이 화면의 주인공이 되도록 Navigation/Tutor를 모두 overlay Drawer로 바꾸고
 * 기본 닫힘으로 둔다(2026-09-15 결정). 새 "수업 시작" state를 만들지 않고 기존
 * view state를 재사용한다.
 */
describe("집중 학습 레이아웃 — Lesson이 항상 주 콘텐츠 (회귀 테스트)", () => {
  it("A/B. AppShell은 useLessonFocusMode(focused)를 받으면 Desktop에서도 Navigation을 permanent가 아닌 overlay로 바꾼다", () => {
    assert.ok(appShell.includes("export function useLessonFocusMode"), "TutorApp이 호출할 hook을 내보내야 한다");
    assert.ok(appShell.includes("const desktopPermanent = isWide && !focusMode;"));
    assert.ok(appShell.includes('variant={desktopPermanent ? "permanent" : "temporary"}'));
    assert.ok(appShell.includes("open={desktopPermanent || open}"));
  });

  it("B/C. TutorApp은 view==='chat'일 때만 focus mode를 켠다 — 새 state를 만들지 않고 기존 view를 재사용", () => {
    assert.ok(tutorApp.includes('useLessonFocusMode(view === "chat");'));
    // 핸즈프리 때처럼 별도 "수업 시작 여부" state를 새로 만들면 안 된다.
    assert.ok(!/const \[(?:lessonStarted|inSession|isTeaching)/i.test(tutorApp));
  });

  it('D. Lesson이 왼쪽 Navigation·오른쪽 Tutor 고정폭 때문에 좁아지는 3-column flex 구조가 없다', () => {
    // 이전 구조: 바깥 Box가 display:flex이고 Lesson Box(flex:1)와 Tutor Box(width:380)가
    // 형제로 나란히 배치돼 있었다. 이제 Tutor는 Drawer(별도 오버레이)뿐이어야 한다.
    assert.ok(!/width:\s*380,\s*flexShrink:\s*0,\s*borderLeft/.test(tutorApp), "Tutor용 고정폭 flex 형제 Box가 남아있으면 안 된다");
  });

  it("E. Navigation trigger(☰)는 항상 aria-expanded를 갖고, 열림 상태를 그대로 반영한다", () => {
    assert.ok(appShell.includes('aria-label="탐색 메뉴 열기"'));
    assert.ok(appShell.includes("aria-expanded={open}"));
  });

  it("F. Tutor trigger는 사이드바가 닫혀 있을 때만 보이고 눌러도 Lesson 레이아웃을 바꾸지 않는다(Drawer만 연다)", () => {
    assert.ok(tutorApp.includes("{!sidebarOpen && (") && tutorApp.includes("🎧 AI Tutor"));
    assert.ok(tutorApp.includes("onClick={() => setSidebarOpen(true)}"));
  });

  it("G. Tutor Drawer는 MUI Drawer(overlay/portal)이므로 열려도 Lesson Box의 width를 다시 계산하지 않는다", () => {
    const chatReturn = tutorApp.match(/\/\/ view === "chat"[\s\S]*?\n}\n/)?.[0] ?? "";
    assert.ok(chatReturn.includes('<Drawer anchor="right"'));
    // 예전처럼 Lesson과 Tutor가 같은 flex row의 형제로 폭을 나눠 갖는 구조(고정폭 380
    // Box)가 없어야 한다 — 위 "D" 테스트가 그 정확한 패턴 부재를 확인한다.
    assert.ok(chatReturn.includes("maxWidth: 900"), "Lesson 영역은 읽기 좋은 고정 상한만 가질 뿐 Drawer와 폭을 나누지 않는다");
  });

  it("기존 LessonContent에는 변경이 없다(레이아웃 문제이지 내부 디자인 문제가 아니다)", () => {
    assert.ok(lessonContentSrc.includes("export function LessonContent"));
    // TutorApp이 넘기는 방식(단일 lesson prop)이 그대로 유지돼야 한다.
    assert.ok(tutorApp.includes("<LessonContent lesson={lessonDetail} />"));
  });

  it("H/I. Tutor Drawer 안 기능(대화 기록/마이크/TTS/텍스트 입력)과 반자동 마이크 자동 전송 흐름이 그대로 유지된다", () => {
    assert.ok(tutorApp.includes("recording={voiceState ===") && tutorApp.includes("onMicClick="));
    assert.ok(tutorApp.includes("onSend={() => void handleSend()}"));
    assert.ok(tutorApp.includes("historyExpanded={historyExpanded}"));
    assert.ok(tutorApp.includes("onStopSpeaking={stopSpeaking}"));
    // 이전 회귀 테스트(반자동 마이크 A~J)가 이미 handleSend 자동 호출 등을 검증한다 — 여기서는
    // 그 wiring이 Drawer 전환 후에도 sidebar 컴포넌트에 그대로 전달되는지만 본다.
  });

  it("K. Lesson을 새로 시작하면 Tutor Drawer는 항상 닫힌 채로 시작한다(이전 세션의 열림 상태가 새지 않음)", () => {
    const handleStartBody = tutorApp.match(/async function handleStart\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(handleStartBody.includes("setSidebarOpen(false)"));
  });

  it("useLessonFocusMode는 라우트를 완전히 벗어나면(unmount) 일반 Navigation으로 복귀시킨다", () => {
    const hookBody = appShell.match(/export function useLessonFocusMode[\s\S]*?\n\}/)?.[0] ?? "";
    assert.ok(hookBody.includes("return () => setFocusMode(false);"));
  });

  it("L. Mobile/좁은 화면도 같은 Drawer 코드 경로를 쓴다 — Desktop 전용 별도 구현이 없다", () => {
    const chatReturn = tutorApp.match(/\/\/ view === "chat"[\s\S]*?\n}\n/)?.[0] ?? "";
    assert.equal((chatReturn.match(/<Drawer/g) ?? []).length, 1, "Desktop/Mobile을 나눠 Drawer를 두 번 렌더하면 안 된다");
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
    for (const needle of ["URL.revokeObjectURL", "mediaRecorderRef.current = null", "mediaRecorderRef.current.stop()"]) {
      assert.ok(cleanupBody.includes(needle), `cleanup에 ${needle}가 있어야 한다`);
    }
    assert.ok(tutorApp.includes("return () => cleanupVoiceResources();"), "unmount 시 정리해야 한다");
    assert.ok(/cleanupVoiceResources\(\); \/\/ 이전 Lesson/.test(tutorApp), "Lesson 재시작 시 이전 TTS/마이크를 정리해야 한다");
  });
});

describe("TTS chunking/prefetch — time-to-first-audio 최적화", () => {
  it("답변 전체를 한 번에 합성하지 않고 chunk 단위로 순서대로 재생한다", () => {
    const speakReplyBody = tutorApp.match(/async function speakReply\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(speakReplyBody.includes("chunkTextForSpeech(rawText)"));
    assert.ok(speakReplyBody.includes("for (let i = 0; i < chunks.length; i++)"), "chunk를 순서대로 재생해야 한다");
  });

  it("다음 chunk를 재생 중에 미리 합성한다(prefetch)", () => {
    const speakReplyBody = tutorApp.match(/async function speakReply\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(speakReplyBody.includes("getBlob(i + 1)"), "현재 chunk 처리 중 다음 chunk 합성을 미리 시작해야 한다");
  });

  it("정지하거나 새 turn이 시작되면 generation id로 이전 chunk 재생을 무효화한다(stale 재생 방지)", () => {
    assert.ok(tutorApp.includes("ttsGenerationRef"));
    assert.ok(tutorApp.includes("ttsGenerationRef.current !== myGen"), "생성 시점의 generation과 다르면 중단해야 한다");
    assert.ok(tutorApp.includes("ttsGenerationRef.current += 1"), "정지 시 generation을 올려 이전 파이프라인을 무효화해야 한다");
  });

  it("재생한 Object URL을 정리한다(메모리 누수 방지)", () => {
    assert.ok((tutorApp.match(/URL\.revokeObjectURL/g) ?? []).length >= 2, "chunk마다/정리 시 revoke해야 한다");
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
    assert.equal((tutorApp.match(/void speakReply\(/g) ?? []).length, 2, "greeting/reply 각 1회, 총 2회여야 한다");
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
    assert.equal((tutorApp.match(/\.play\(\)/g) ?? []).length, 1);
    const playBlobBody = tutorApp.match(/function playBlob\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(playBlobBody.includes(".play()"), "play() 호출은 playBlob 안에 있어야 한다");
  });

  it("/synthesize는 chunk당 정확히 1번만 요청한다(getBlob이 Map으로 메모이즈)", () => {
    const speakReplyBody = tutorApp.match(/async function speakReply\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(speakReplyBody.includes("blobPromises.has(i)"), "이미 요청한 chunk는 다시 요청하지 않아야 한다");
    assert.equal((speakReplyBody.match(/tts\.synthesize\(/g) ?? []).length, 1, "synthesize 호출부는 getBlob 안 한 곳뿐이어야 한다");
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
describe("반자동 마이크 음성 입력 (핸즈프리/VAD 제거 후 최종 UX)", () => {
  it("A. idle에서 마이크를 누르면 recording을 시작한다", () => {
    const micBody = tutorApp.match(/async function onMicClick\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(micBody.includes('if (voiceStateRef.current !== "idle") return;'), "idle이 아니면 새로 시작하지 않는다");
    assert.ok(micBody.includes('setVoiceState("recording");'));
    assert.ok(micBody.includes("await navigator.mediaDevices.getUserMedia"));
  });

  it("B. recording 중 마이크(중지) 버튼을 누르면 MediaRecorder.stop()만 호출한다 — 발화 종료를 프로그램이 판단하지 않는다", () => {
    const micBody = tutorApp.match(/async function onMicClick\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(
      /if \(voiceStateRef\.current === "recording"\) \{\s*\/\/[^\n]*\s*mediaRecorderRef\.current\?\.stop\(\);\s*return;\s*\}/.test(
        micBody,
      ),
      "recording 중 클릭은 오직 stop()만 해야 한다",
    );
  });

  it("C. 중지(stop) 시 기존 /api/tutor/stt(Whisper)로 그 구간의 오디오만 보낸다", () => {
    const micBody = tutorApp.match(/async function onMicClick\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(micBody.includes("recorder.onstop"));
    assert.ok(micBody.includes("void transcribeAndSend(blob)"));
    const transcribeBody = tutorApp.match(/async function transcribeAndSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(transcribeBody.includes('fetch("/api/tutor/stt"'));
  });

  it("D. 유효 transcript는 별도 보내기 클릭 없이 즉시 handleSend로 자동 전송된다", () => {
    const transcribeBody = tutorApp.match(/async function transcribeAndSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(transcribeBody.includes("await handleSend(text);"));
    assert.ok(!transcribeBody.includes("setInput("), "다시 입력창에 채우고 기다리는 옛 방식으로 되돌아가면 안 된다");
  });

  it("E. 빈 transcript(무음/공백)는 자동 전송하지 않는다", () => {
    const transcribeBody = tutorApp.match(/async function transcribeAndSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(/if \(!text\) \{\s*\/\/[^\n]*\s*setVoiceState\("idle"\);\s*return;\s*\}/.test(transcribeBody));
  });

  it("F. STT 실패해도 throw하지 않고 비차단 안내 후 idle로 돌아간다(텍스트 Tutor 계속 사용 가능)", () => {
    const transcribeBody = tutorApp.match(/async function transcribeAndSend\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    const catchBlock = transcribeBody.split(/\}\s*catch/)[1] ?? "";
    assert.ok(catchBlock.includes("setError("));
    assert.ok(catchBlock.includes('setVoiceState("idle")'));
  });

  it('G. 침묵/시간 기반 자동 종료 코드가 없다 — silence timeout·VAD 상수·백그라운드 타이머 폴링 전부 제거됨', () => {
    for (const needle of [
      "SILENCE",
      "silenceTimeout",
      "VAD_",
      "SpeechActivityDetector",
      "setInterval",
      "handsFree",
      "AudioContext",
      "AnalyserNode",
    ]) {
      assert.ok(!tutorApp.includes(needle), `${needle} — 자동 발화 종료 관련 코드가 남아있으면 안 된다`);
    }
    // setTimeout은 다른 목적(예: 일시적 UI 지연)으로 쓰일 수 있으나, VAD 폴링 루프
    // 형태(재귀적으로 자기 자신을 다시 스케줄)는 없어야 한다.
    assert.ok(!/window\.setTimeout\(tick/.test(tutorApp));
  });

  it("H. 사용자가 직접 중지하기 전에는 STT가 호출되지 않는다 — recorder.onstop에서만 transcribeAndSend를 부른다", () => {
    assert.equal((tutorApp.match(/transcribeAndSend\(/g) ?? []).length, 2, "정의 1회 + onstop에서 호출 1회여야 한다");
    const micBody = tutorApp.match(/async function onMicClick\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    const onstopBody = micBody.match(/recorder\.onstop = \(\) => \{[\s\S]*?\n      \};/)?.[0] ?? "";
    assert.ok(onstopBody.includes("transcribeAndSend"), "onstop 콜백 안에서만 호출돼야 한다");
  });

  it("I. TTS 재생 중에는 새로 마이크를 시작하지 못하게 잠근다", () => {
    assert.ok(
      tutorApp.includes('micDisabled={voiceState !== "idle" && voiceState !== "recording"}'),
      "idle/recording이 아니면(= speaking/thinking/transcribing 포함) 마이크 버튼을 잠가야 한다",
    );
  });

  it("J. TTS 종료 후 자동으로 다시 듣지 않는다 — finishSpeaking/stopSpeaking은 idle로만 돌아간다", () => {
    const finishBody = tutorApp.match(/function finishSpeaking\([\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(finishBody.includes('setVoiceState("idle");'));
    assert.ok(!finishBody.includes("Listening") && !/listening/.test(finishBody), "재생 종료 후 자동 listening 진입 코드가 없어야 한다");

    const stopBody = tutorApp.match(/function stopSpeaking\(\)[\s\S]*?\n  \}\n/)?.[0] ?? "";
    assert.ok(stopBody.includes('setVoiceState("idle");'));
  });

  it("voice-state.ts에 더 이상 'listening' 상태가 없다 — idle/recording/transcribing/thinking/speaking/error 6개뿐", () => {
    const match = voiceStateSrc.match(/export type VoiceState =\s*([\s\S]*?);/);
    assert.ok(match, "VoiceState 타입 선언을 찾을 수 없습니다");
    const union = match![1];
    assert.ok(!union.includes('"listening"'));
    for (const value of ["idle", "recording", "transcribing", "thinking", "speaking", "error"]) {
      assert.ok(union.includes(`"${value}"`), `${value}는 유지돼야 한다`);
    }
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
