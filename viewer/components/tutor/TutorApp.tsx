"use client";

/**
 * AI Tutor 화면 전체 — 시작 화면 → (교재 + Tutor 사이드바) 학습 → 종료 요약 확인의 상태 기계.
 *
 * ■ 레이아웃
 * 주 콘텐츠는 현재 Lesson 교재(LessonContent — /lesson/[...id] 페이지와 같은 렌더러를
 * 공유한다)이고, AI Tutor는 그 옆의 좁고 접을 수 있는 사이드바(TutorSidebar)다.
 * 채팅이 화면을 차지하지 않는다 — 대화 기록은 사이드바 안에서 접혀 있다가 펼칠 수 있다.
 *
 * ■ 이 컴포넌트가 하지 않는 것
 * - 전체 대화(transcript)를 서버에 저장하지 않는다. `messages` 는 이 탭이 들고 있는
 *   메모리일 뿐이고, 탭을 닫으면 사라진다 — 남는 것은 [학습 종료] 로 확정한 요약뿐이다.
 * - LLM이 만든 종료 요약 초안을 그대로 저장하지 않는다. 사용자가 확인·수정한 값만
 *   /finish 로 보낸다.
 *
 * ■ Provider 경계
 * - LLM/STT 호출은 서버 API(app/api/tutor/**)를 거친다 — GROQ_API_KEY가 브라우저에
 *   노출되지 않는다.
 * - TTS(MeloTTS)는 브라우저가 로컬 컴패니언(NEXT_PUBLIC_MELOTTS_URL)을 직접 부른다 —
 *   Vercel 서버는 사용자의 localhost에 접근할 수 없기 때문이다.
 *
 * ■ 음성 상태 머신 (voice-state.ts)
 * recording/transcribing/speaking/sending 같은 boolean을 따로따로 두면 "speaking과
 * recording이 동시" 같은 조합이 생긴다. 대신 `VoiceState` 값 하나로 통일한다.
 *
 * ■ 음성 입력 = 반자동(사용자가 시작/중지를 직접 제어)
 * 핸즈프리(VAD 기반 자동 발화 종료)는 실사용 검토 결과 채택하지 않기로 했다 — 사용자가
 * 생각하며 말을 멈춰도(침묵 1~2초) 녹음이 끊기면 안 되기 때문이다. 그래서 발화 종료
 * 판단은 프로그램이 하지 않는다: 🎙️ 눌러 시작 → 원하는 만큼 말하기 → ⏹ 직접 중지 →
 * 그 구간의 오디오만 Whisper로 보낸다. TTS가 끝나도 자동으로 다시 듣지 않는다 — 다음
 * 질문도 사용자가 마이크를 다시 눌러 시작한다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { LessonContent } from "@/components/LessonContent";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";
import type { LessonDetail } from "@/lib/curriculum";
import { MeloTTSProvider } from "@/lib/tutor/providers/melotts-local";
import { chunkTextForSpeech } from "@/lib/tutor/tts-chunking";
import type { VoiceState } from "@/lib/tutor/voice-state";

// ── 타입 (서버 컴포넌트가 넘겨준 초기 상태) ──────────────────────────

interface LessonRef {
  id: string;
  title: string;
  trackTitle: string;
  chapterTitle: string;
}

interface DueReviewItem {
  id: string;
  sourceKind: string;
  sourceId: string;
  prompt: string;
}

interface TutorSessionRowLike {
  id: string;
  currentTargetId: string;
  status: string;
  endedAt: string | null;
  todaySummary: string | null;
  nextStartNote: string | null;
}

interface TutorAppProps {
  autoStartLessonId: string | null;
  ttsConfigured: boolean;
  lastSession: TutorSessionRowLike | null;
  inProgressLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  dueReviewCount: number;
  dueReviewItems: DueReviewItem[];
  allLessons: LessonRef[];
  lessonProgress: { lessonId: string; status: string }[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Draft {
  completionStatus: "learning" | "completed" | "review";
  todaySummary: string;
  confusingPoints: string[];
  reviewCandidates: { concept: string; reason?: string }[];
  nextStartNote: string;
  suggestedNextLesson: { kind: "lesson"; id: string; title: string } | null;
}

type View = "start" | "chat" | "summarizing" | "summarize" | "saved";

const END_INTENT_PATTERN = /(오늘|여기까지|그만|끝낼래|끝낼게|마칠래|종료할래|공부\s*끝)/;

function lessonLabel(lesson: LessonRef): string {
  return `${lesson.trackTitle} · ${lesson.chapterTitle} — ${lesson.title}`;
}

export function TutorApp(props: TutorAppProps) {
  const router = useRouter();
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("md"));

  const [view, setView] = useState<View>("start");
  const [currentLesson, setCurrentLesson] = useState<LessonRef | null>(
    props.inProgressLesson ?? props.nextLesson,
  );
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceState, setVoiceStateRaw] = useState<VoiceState>("idle");

  const [sidebarOpenDesktop, setSidebarOpenDesktop] = useState(true);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  /** TTS 실패를 조용히 무시하지 않고 비차단으로 알린다(텍스트 수업은 계속 진행) —
   * CORS/Private Network Access/브라우저 로컬 네트워크 권한 등 사용자 브라우저 쪽
   * 설정 문제로 실패해도 원인을 전혀 알 수 없었던 문제의 최소 개선. */
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);
  const [manualNextLessonId, setManualNextLessonId] = useState<string>("");

  // ── ref: 최신 값을 async 콜백에서 즉시 읽기 위함(state 클로저 지연 방지) ──
  const voiceOnRef = useRef(voiceOn);
  const voiceStateRef = useRef<VoiceState>("idle");
  /** 이번이 "가장 최근" handleStart 호출인지 판별— Strict Mode 등으로 handleStart가
   * 중복 호출돼도 최초 인사말이 두 번 재생되지 않게 한다(마지막 호출만 speak). */
  const handleStartCallIdRef = useRef(0);

  // ── ref: 미디어/오디오 자원 ──
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);
  /** TTS "턴"이 바뀔 때마다 올라간다 — 이전 턴의 pending 합성/재생이 뒤늦게 끝나도
   * generation이 다르면 전부 무시한다(정지·새 턴 시작 시 stale 재생 방지). */
  const ttsGenerationRef = useRef(0);

  const tts = useMemo(
    () => (props.ttsConfigured ? new MeloTTSProvider(process.env.NEXT_PUBLIC_MELOTTS_URL!) : null),
    [],
  );

  function setVoiceState(next: VoiceState) {
    voiceStateRef.current = next;
    setVoiceStateRaw(next);
  }

  useEffect(() => {
    try {
      setVoiceOn(window.localStorage.getItem("cmm-tutor-voice") === "on");
    } catch {
      // localStorage 접근 실패(프라이빗 모드 등) — 기본값 off 유지
    }
  }, []);

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  // 언마운트 시 마이크/오디오를 반드시 정리한다.
  useEffect(() => {
    return () => cleanupVoiceResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?lessonId= 로 들어오면 시작 화면 없이 바로 그 Lesson으로 시작한다.
  useEffect(() => {
    if (props.autoStartLessonId) {
      const lesson = props.allLessons.find((l) => l.id === props.autoStartLessonId);
      if (lesson) void handleStart(lesson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 음성 자원 정리 ────────────────────────────────────────────────

  /** Lesson 변경/학습 종료/음성 끔/unmount — 마이크·오디오·큐를 전부 정리한다. */
  function cleanupVoiceResources() {
    ttsGenerationRef.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // 이미 멈춘 상태 등 — 무시
      }
    }
    mediaRecorderRef.current = null;
    setVoiceState("idle");
  }

  function toggleVoice() {
    setVoiceOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("cmm-tutor-voice", next ? "on" : "off");
      } catch {
        // 무시 — 이번 세션 동안만 유지된다
      }
      if (!next) {
        stopSpeakingInternal();
        setVoiceState("idle");
      }
      return next;
    });
  }

  // ── TTS: chunk 단위 합성 + prefetch 재생 ────────────────────────────

  function stopSpeakingInternal() {
    ttsGenerationRef.current += 1; // 진행 중이던 합성/재생 파이프라인을 전부 무효화한다
    audioRef.current?.pause();
    audioRef.current = null;
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
  }

  /** Sidebar의 "정지" 버튼 — 재생을 멈추고 idle로 돌아간다. 다음 질문은 사용자가
   * 마이크를 다시 눌러 시작한다(TTS 종료 후 자동으로 다시 듣지 않는다). */
  function stopSpeaking() {
    stopSpeakingInternal();
    setVoiceState("idle");
  }

  function playBlob(blob: Blob, gen: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (ttsGenerationRef.current !== gen) return resolve(false);
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current);
        activeObjectUrlRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      activeObjectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => resolve(ttsGenerationRef.current === gen);
      audio.onerror = () => resolve(false);
      audio.play().catch(() => resolve(false));
    });
  }

  function finishSpeaking(gen: number) {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
    audioRef.current = null;
    if (ttsGenerationRef.current !== gen) return; // 이미 다음 턴/정지로 넘어감
    setVoiceState("idle");
  }

  /**
   * 답변 전체를 chunk로 나눠 첫 chunk를 즉시 합성/재생하고, 재생 중 다음 chunk를
   * prefetch한다 — 긴 답변 전체 합성이 끝날 때까지 기다리지 않는다(time-to-first-audio
   * 최적화, tts-chunking.ts 상단 실측 주석 참고).
   */
  async function speakReply(rawText: string) {
    const myGen = ++ttsGenerationRef.current;

    if (!tts || !voiceOnRef.current) {
      setVoiceState("idle");
      return;
    }

    const chunks = chunkTextForSpeech(rawText);
    if (chunks.length === 0) {
      finishSpeaking(myGen);
      return;
    }

    setVoiceState("speaking");
    setTtsNotice(null);

    const blobPromises = new Map<number, Promise<Blob>>();
    const getBlob = (i: number): Promise<Blob> | null => {
      if (i < 0 || i >= chunks.length) return null;
      if (!blobPromises.has(i)) blobPromises.set(i, tts.synthesize(chunks[i]));
      return blobPromises.get(i) ?? null;
    };

    getBlob(0); // 첫 chunk는 즉시 합성 시작

    for (let i = 0; i < chunks.length; i++) {
      if (ttsGenerationRef.current !== myGen) return; // 정지/새 턴 — 조용히 중단
      getBlob(i + 1); // 지금 chunk가 재생되는 동안 다음 chunk를 미리 합성(prefetch depth=1)

      let blob: Blob;
      try {
        blob = await getBlob(i)!;
      } catch {
        if (ttsGenerationRef.current !== myGen) return;
        setTtsNotice("음성 서비스에 연결할 수 없습니다. 텍스트 수업은 계속 사용할 수 있습니다.");
        break;
      }
      if (ttsGenerationRef.current !== myGen) return;

      const played = await playBlob(blob, myGen);
      if (!played) {
        if (ttsGenerationRef.current === myGen) {
          setTtsNotice((prev) => prev ?? "음성 재생 중 문제가 발생했습니다. 텍스트 수업은 계속 사용할 수 있습니다.");
        }
        break;
      }
    }

    finishSpeaking(myGen);
  }

  function classifyMicError(err: unknown): string {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return "마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요. 텍스트로 계속 진행할 수 있습니다.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "마이크 장치를 찾을 수 없습니다. 텍스트로 계속 진행할 수 있습니다.";
    }
    return "마이크를 사용할 수 없습니다. 텍스트로 계속 진행할 수 있습니다.";
  }

  // ── STT: 기존 /api/tutor/stt 재사용, 중지 시 그 구간의 오디오만 보낸다 ──

  /** 발화 종료는 프로그램이 판단하지 않는다 — 사용자가 ⏹로 직접 중지한 구간만 전달된다. */
  async function transcribeAndSend(blob: Blob) {
    setVoiceState("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/tutor/stt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "음성 인식에 실패했습니다.");
      const text = typeof data.text === "string" ? data.text.trim() : "";

      if (!text) {
        // 빈 transcript/무음·잡음 — 자동 전송하지 않는다.
        setVoiceState("idle");
        return;
      }

      // 유효한 transcript는 별도 "보내기" 클릭 없이 즉시 Tutor로 보낸다.
      await handleSend(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "음성 인식에 실패했습니다. 텍스트로 입력해 주세요.");
      setVoiceState("idle");
    }
  }

  // ── 마이크: 사용자가 시작/중지를 직접 제어한다(자동 발화 종료 없음) ──

  async function onMicClick() {
    if (voiceStateRef.current === "recording") {
      // 중지는 사용자만 누른다 — 침묵/시간 기반 자동 종료 코드는 없다.
      mediaRecorderRef.current?.stop();
      return;
    }
    if (voiceStateRef.current !== "idle") return; // TTS 재생/응답 대기 중에는 새로 시작하지 않는다

    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void transcribeAndSend(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setVoiceState("recording");
    } catch (err) {
      setError(classifyMicError(err));
    }
  }

  // ── Lesson 시작/대화 ─────────────────────────────────────────────

  async function handleStart(lesson: LessonRef) {
    cleanupVoiceResources(); // 이전 Lesson의 TTS/마이크가 남아있지 않게 한다
    const callId = ++handleStartCallIdRef.current;
    setStarting(true);
    setError(null);
    setFallbackNotice(null);
    setLessonDetail(null);
    try {
      const res = await fetch("/api/tutor/session/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetKind: "lesson", targetId: lesson.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "세션을 시작하지 못했습니다.");

      setCurrentLesson(lesson);
      setSessionId(data.session.id);
      setLessonDetail(data.lesson ?? null);

      const progress = props.lessonProgress.find((p) => p.lessonId === lesson.id);
      const resuming = progress && (progress.status === "learning" || progress.status === "review");
      const greeting = resuming
        ? `안녕하세요! "${lesson.title}" 이어서 볼게요. 지난번 요약을 참고했어요 — 어디부터 다시 볼까요, 아니면 바로 이어갈까요?`
        : `안녕하세요! 오늘은 "${lesson.title}"를 같이 볼게요. 준비되면 말씀해 주세요 — 목표부터 짚어드릴까요?`;
      setMessages([{ role: "assistant", content: greeting }]);
      setView("chat");
      // handleStart가 (Strict Mode의 mount effect 이중 호출 등으로) 중복 실행됐다면
      // 가장 마지막 호출만 읽는다 — 기존 speak()를 그대로 재사용, 새 TTS 구현 없음.
      if (handleStartCallIdRef.current === callId) {
        void speakReply(greeting);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setStarting(false);
    }
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || !sessionId || voiceStateRef.current === "thinking") return;
    setInput("");
    setError(null);
    setShowEndConfirm(false);

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setVoiceState("thinking");

    if (END_INTENT_PATTERN.test(text)) {
      setShowEndConfirm(true);
    }

    try {
      const res = await fetch(`/api/tutor/session/${sessionId}/message`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ history: messages, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "응답을 받지 못했습니다.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setFallbackNotice(
        data.fallbackModel ? `기본 AI 모델을 사용할 수 없어 ${data.fallbackModel}로 임시 전환했습니다.` : null,
      );
      void speakReply(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setVoiceState("idle");
    }
  }

  async function beginEndSession() {
    if (!sessionId) return;
    cleanupVoiceResources();
    setShowEndConfirm(false);
    setView("summarizing");
    setSummarizeError(null);
    try {
      const res = await fetch(`/api/tutor/session/${sessionId}/summarize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ history: messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "요약 생성에 실패했습니다.");
      setDraft(data.draft);
      setManualNextLessonId(data.draft.suggestedNextLesson?.id ?? "");
      setView("summarize");
    } catch (err) {
      setSummarizeError(err instanceof Error ? err.message : "요약을 만들지 못했습니다. 직접 입력해 주세요.");
      // 실패해도 사용자가 직접 채울 수 있게 빈 초안으로 넘어간다.
      setDraft({
        completionStatus: "learning",
        todaySummary: "",
        confusingPoints: [],
        reviewCandidates: [],
        nextStartNote: "",
        suggestedNextLesson: null,
      });
      setView("summarize");
    }
  }

  async function saveAndFinish() {
    if (!sessionId || !draft) return;
    if (!draft.todaySummary.trim()) {
      setSummarizeError("오늘 배운 내용을 한 줄이라도 적어주세요.");
      return;
    }
    setSummarizeError(null);
    try {
      const res = await fetch(`/api/tutor/session/${sessionId}/finish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          completionStatus: draft.completionStatus,
          todaySummary: draft.todaySummary,
          confusingPoints: draft.confusingPoints,
          reviewCandidates: draft.reviewCandidates,
          nextTarget: manualNextLessonId ? { kind: "lesson", id: manualNextLessonId } : null,
          nextStartNote: draft.nextStartNote || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장에 실패했습니다.");
      setView("saved");
    } catch (err) {
      setSummarizeError(err instanceof Error ? err.message : "저장에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  async function cancelSummarize() {
    setView("chat");
    setDraft(null);
  }

  async function abandonAndLeave() {
    cleanupVoiceResources();
    if (sessionId) {
      try {
        await fetch(`/api/tutor/session/${sessionId}/abandon`, { method: "POST" });
      } catch {
        // 최선 노력 — 실패해도 화면 전환은 계속한다
      }
    }
    router.push("/");
  }

  // ── 화면 ──────────────────────────────────────────────────────────

  if (view === "start") {
    return (
      <StartScreen
        starting={starting}
        error={error}
        lastSession={props.lastSession}
        inProgressLesson={props.inProgressLesson}
        nextLesson={props.nextLesson}
        dueReviewCount={props.dueReviewCount}
        dueReviewItems={props.dueReviewItems}
        allLessons={props.allLessons}
        onPick={handleStart}
      />
    );
  }

  if (view === "summarizing") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary">오늘 배운 내용을 정리하고 있어요…</Typography>
      </Box>
    );
  }

  if (view === "summarize" && draft) {
    return (
      <SummaryScreen
        draft={draft}
        setDraft={setDraft}
        error={summarizeError}
        allLessons={props.allLessons}
        manualNextLessonId={manualNextLessonId}
        setManualNextLessonId={setManualNextLessonId}
        onSave={saveAndFinish}
        onCancel={cancelSummarize}
      />
    );
  }

  if (view === "saved") {
    return (
      <Box sx={{ maxWidth: 560 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          ✅ 저장했습니다
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          오늘 학습이 진도·복습 목록에 반영됐습니다. 다음에 들어오면 이어서 안내해 드릴게요.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => router.push("/tutor")}>
            Tutor 홈으로
          </Button>
          <Button variant="outlined" onClick={() => router.push("/study")}>
            복습 목록 보기
          </Button>
        </Stack>
      </Box>
    );
  }

  // view === "chat" — 교재(왼쪽, 가장 넓음) + Tutor 사이드바(오른쪽, 좁고 접힘)
  const lessonMeta = currentLesson ? `${currentLesson.trackTitle} · ${currentLesson.chapterTitle}` : "";

  const sidebar = (
    <TutorSidebar
      lessonTitle={currentLesson?.title ?? ""}
      lessonMeta={lessonMeta}
      voiceState={voiceState}
      ttsAvailable={Boolean(tts)}
      voiceOn={voiceOn}
      onToggleVoice={toggleVoice}
      onStopSpeaking={stopSpeaking}
      onMicClick={() => void onMicClick()}
      recording={voiceState === "recording"}
      micDisabled={voiceState !== "idle" && voiceState !== "recording"}
      messages={messages}
      historyExpanded={historyExpanded}
      onToggleHistoryExpanded={() => setHistoryExpanded((v) => !v)}
      input={input}
      onInputChange={setInput}
      onSend={() => void handleSend()}
      sendDisabled={voiceState === "thinking" || voiceState === "transcribing" || voiceState === "recording"}
      error={error}
      onDismissError={() => setError(null)}
      fallbackNotice={fallbackNotice}
      onDismissFallbackNotice={() => setFallbackNotice(null)}
      ttsNotice={ttsNotice}
      onDismissTtsNotice={() => setTtsNotice(null)}
      showEndConfirm={showEndConfirm}
      onConfirmEnd={beginEndSession}
      onCancelEnd={() => setShowEndConfirm(false)}
      onRequestEnd={beginEndSession}
      onLeaveWithoutSaving={abandonAndLeave}
      onCollapse={isWide ? () => setSidebarOpenDesktop(false) : undefined}
    />
  );

  return (
    <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 140px)", minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto", pr: 1 }}>
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
              {currentLesson?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lessonMeta}
            </Typography>
          </Box>
          {isWide && !sidebarOpenDesktop && (
            <Button size="small" variant="outlined" onClick={() => setSidebarOpenDesktop(true)} sx={{ flexShrink: 0 }}>
              🎧 Tutor 펼치기
            </Button>
          )}
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {lessonDetail ? (
          <LessonContent lesson={lessonDetail} />
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {isWide ? (
        sidebarOpenDesktop && (
          <Box sx={{ width: 380, flexShrink: 0, borderLeft: 1, borderColor: "divider", pl: 2, py: 0.5 }}>{sidebar}</Box>
        )
      ) : (
        <>
          {!sidebarOpenMobile && (
            <Fab
              color="primary"
              onClick={() => setSidebarOpenMobile(true)}
              sx={{ position: "fixed", right: 16, bottom: 16, zIndex: (t) => t.zIndex.drawer + 1 }}
              aria-label="AI Tutor 열기"
            >
              🎧
            </Fab>
          )}
          <Drawer anchor="right" open={sidebarOpenMobile} onClose={() => setSidebarOpenMobile(false)}>
            <Box sx={{ width: "88vw", maxWidth: 380, height: "100%", p: 2 }}>{sidebar}</Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}

// ── 시작 화면 ──────────────────────────────────────────────────────

function StartScreen(props: {
  starting: boolean;
  error: string | null;
  lastSession: TutorSessionRowLike | null;
  inProgressLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  dueReviewCount: number;
  dueReviewItems: DueReviewItem[];
  allLessons: LessonRef[];
  onPick: (lesson: LessonRef) => void;
}) {
  const [pickerValue, setPickerValue] = useState<LessonRef | null>(null);
  const resumeTarget = props.inProgressLesson ?? props.nextLesson;
  const reviewLesson =
    props.dueReviewItems.find((r) => r.sourceKind === "lesson") &&
    props.allLessons.find((l) => l.id === props.dueReviewItems.find((r) => r.sourceKind === "lesson")!.sourceId);

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        🎧 AI Tutor
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        지난 학습을 이어서, 현재 Lesson 기준으로 한국어 음성/텍스트 과외를 시작합니다.
      </Typography>

      {props.error && <Alert severity="error" sx={{ mb: 2 }}>{props.error}</Alert>}

      {props.lastSession?.todaySummary && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            지난 학습
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.lastSession.todaySummary}
          </Typography>
          {props.lastSession.nextStartNote && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              다음에 볼 것: {props.lastSession.nextStartNote}
            </Typography>
          )}
        </Paper>
      )}

      {resumeTarget && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderColor: "primary.main" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            ▶️ 이어서 공부하기
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {lessonLabel(resumeTarget)}
          </Typography>
          <Button
            variant="contained"
            disabled={props.starting}
            onClick={() => props.onPick(resumeTarget)}
          >
            {props.starting ? <CircularProgress size={18} /> : "시작하기"}
          </Button>
        </Paper>
      )}

      {props.dueReviewCount > 0 && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            📚 복습 필요 {props.dueReviewCount}건
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {reviewLesson ? lessonLabel(reviewLesson) : "복습 목록에서 확인하세요."}
          </Typography>
          <Stack direction="row" spacing={1}>
            {reviewLesson && (
              <Button variant="outlined" disabled={props.starting} onClick={() => props.onPick(reviewLesson)}>
                복습부터 시작하기
              </Button>
            )}
            <Button variant="text" href="/study">
              복습 목록 전체 보기
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          🔍 다른 Lesson 선택
        </Typography>
        <Autocomplete
          options={props.allLessons}
          value={pickerValue}
          onChange={(_e, v) => setPickerValue(v)}
          getOptionLabel={(l) => lessonLabel(l)}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => <TextField {...params} size="small" placeholder="Lesson 검색" />}
        />
        <Button
          sx={{ mt: 1.5 }}
          variant="outlined"
          disabled={!pickerValue || props.starting}
          onClick={() => pickerValue && props.onPick(pickerValue)}
        >
          이 Lesson으로 시작하기
        </Button>
      </Paper>
    </Box>
  );
}

// ── 종료 요약 확인 화면 ────────────────────────────────────────────

function SummaryScreen(props: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  error: string | null;
  allLessons: LessonRef[];
  manualNextLessonId: string;
  setManualNextLessonId: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { draft, setDraft } = props;

  function updateList(key: "confusingPoints", value: string) {
    setDraft({ ...draft, [key]: value.split("\n").map((s) => s.trim()).filter(Boolean) });
  }

  function updateReviewCandidates(value: string) {
    const items = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ concept: line }));
    setDraft({ ...draft, reviewCandidates: items });
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        오늘 학습 요약
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        AI가 만든 초안입니다. 확인하고 자유롭게 수정한 뒤 저장하세요 — 저장한 내용이 실제
        진도에 반영됩니다.
      </Typography>

      {props.error && <Alert severity="warning" sx={{ mb: 2 }}>{props.error}</Alert>}

      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            진행 상태
          </Typography>
          <Select
            size="small"
            fullWidth
            value={draft.completionStatus}
            onChange={(e) => setDraft({ ...draft, completionStatus: e.target.value as Draft["completionStatus"] })}
          >
            <MenuItem value="learning">아직 진행 중 (다음에 이어서)</MenuItem>
            <MenuItem value="completed">이 Lesson 완료</MenuItem>
            <MenuItem value="review">완료했지만 복습 필요</MenuItem>
          </Select>
        </Box>

        <TextField
          label="오늘 배운 내용"
          multiline
          minRows={3}
          value={draft.todaySummary}
          onChange={(e) => setDraft({ ...draft, todaySummary: e.target.value })}
        />

        <TextField
          label="헷갈린 부분 (한 줄에 하나씩)"
          multiline
          minRows={2}
          value={draft.confusingPoints.join("\n")}
          onChange={(e) => updateList("confusingPoints", e.target.value)}
        />

        <TextField
          label="복습이 필요한 개념 (한 줄에 하나씩)"
          multiline
          minRows={2}
          value={draft.reviewCandidates.map((c) => c.concept).join("\n")}
          onChange={(e) => updateReviewCandidates(e.target.value)}
        />

        <TextField
          label="다음 학습 시작 참고사항"
          multiline
          minRows={2}
          value={draft.nextStartNote}
          onChange={(e) => setDraft({ ...draft, nextStartNote: e.target.value })}
        />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            다음 Lesson
          </Typography>
          <Autocomplete
            options={props.allLessons}
            value={props.allLessons.find((l) => l.id === props.manualNextLessonId) ?? null}
            onChange={(_e, v) => props.setManualNextLessonId(v?.id ?? "")}
            getOptionLabel={(l) => lessonLabel(l)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="다음에 볼 Lesson (선택)" />
            )}
          />
        </Box>

        <Divider />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={props.onSave}>
            저장하고 종료
          </Button>
          <Button variant="outlined" onClick={props.onCancel}>
            취소하고 계속 공부하기
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
