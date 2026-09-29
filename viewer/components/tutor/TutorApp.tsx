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
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { LessonContent } from "@/components/LessonContent";
import { useLessonFocusMode } from "@/components/AppShell";
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

  // ── sidebar 모드 전용 (기본 "standalone" — /tutor는 이 prop들을 넘기지 않으므로
  //     기존 동작이 그대로 유지된다) ────────────────────────────────────────
  /** "standalone"(기본, /tutor 전체 화면) | "sidebar"(/lesson/[...id] 페이지에 임베드).
   * 차이는 이 값 하나로 분기한다 — Tutor 로직을 복제하지 않는다. */
  layoutMode?: "standalone" | "sidebar";
  /** sidebar 모드에서만 쓰인다 — 지금 화면에 보이는 정확한 Lesson으로 시작을 고정한다.
   * allLessons.find(autoStartLessonId) 조회에 의존하면(커리큘럼 목록에 없는 Lesson 등)
   * 화면과 Tutor가 서로 다른 Lesson을 가리킬 위험이 있다. */
  initialLesson?: LessonRef;
  /** sidebar 모드에서만 쓰인다 — 부모가 패널을 지금 활성 상태로 보여주고 있는지(true)
   * 숨겼는지(false). false가 되면 진행 중인 마이크 시작/STT/TTS/세션시작 응답이 뒤늦게
   * 도착해도 조용히 버린다(제출·재생하지 않는다) — messages/sessionId/draft는 그대로
   * 보존한다(재오픈 시 대화가 이어진다). 생략하면 항상 true(standalone 기존 동작). */
  active?: boolean;
  /** sidebar 모드에서만 쓰인다 — "접기"/닫기 등으로 부모에게 패널을 숨겨 달라고 요청한다
   * (TutorApp 자신은 계속 마운트된 채로 남는다 — unmount하지 않아야 대화가 보존된다). */
  onRequestClose?: () => void;
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
  const layoutMode = props.layoutMode ?? "standalone";

  const [view, setView] = useState<View>("start");
  // Lesson이 실제 학습 화면(수업 중)일 때만 왼쪽 Navigation을 접는다 — 새 상태를
  // 만들지 않고 기존 view state를 그대로 재사용한다. sidebar 모드는 /lesson 페이지
  // 자신의 레이아웃이므로 왼쪽 Navigation을 건드리지 않는다(표준 화면 그대로 유지).
  useLessonFocusMode(layoutMode === "standalone" && view === "chat");
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

  // 수업 중에는 Lesson이 화면의 주인공이다 — Tutor 패널은 필요할 때만 여는
  // overlay(Drawer)이고 기본은 닫힘이다(Desktop/Mobile 공통, isWide로 나누지 않는다).
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  /** sidebar 모드에서 패널이 "지금 화면에 보이는 활성 상태"인지 — false면 진행 중인
   * 비동기 응답(마이크 시작/STT/세션시작)이 도착해도 조용히 버린다(제출·재생 안 함).
   * standalone에서는 항상 true다(props.active를 넘기지 않으므로). */
  const activeRef = useRef(true);
  /** 닫힐 때(active: true→false)마다 올라간다 — "그 이전에 시작된" 마이크/STT 요청을
   * 구분하는 용도다. activeRef만으로는 "닫기 전 시작 → 닫힘 → 다시 열림 → 응답 도착"
   * 순서에서 다시 true가 돼 버려 오래된 녹음이 자동 제출되는 것을 못 막는다(Codex
   * 최종 리뷰에서 발견). onMicClick/recorder.onstop/transcribeAndSend가 시작 시점의
   * 값을 캡처해 응답 도착 시 비교한다. */
  const requestEpochRef = useRef(0);

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

  // sidebar 모드: 부모가 패널을 보이는 상태로 유지하는지를 그대로 따른다. 열림→닫힘
  // 전환마다 진행 중이던 마이크/재생을 실제로 멈춘다(Codex 최종 리뷰: Escape/backdrop로
  // 닫을 때는 "접기" 버튼과 달리 아무 정리도 안 하고 있었다 — 트리거와 무관하게 active
  // 자체가 정리 시점이 되도록 한 곳으로 모았다).
  useEffect(() => {
    const next = props.active ?? true;
    const wasActive = activeRef.current;
    activeRef.current = next;
    if (layoutMode === "sidebar" && wasActive && !next) {
      requestEpochRef.current += 1;
      cleanupVoiceResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.active]);

  // 언마운트 시 마이크/오디오를 반드시 정리한다.
  useEffect(() => {
    return () => {
      activeRef.current = false;
      cleanupVoiceResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sidebar 모드: 지금 화면에 보이는 Lesson으로 시작을 고정한다(allLessons 조회에
  // 의존하면 화면과 Tutor가 다른 Lesson을 가리킬 위험이 있다).
  // standalone(/tutor): 기존과 동일하게 ?lessonId= 로 들어오면 목록에서 찾아 시작한다.
  useEffect(() => {
    if (layoutMode === "sidebar") {
      if (props.initialLesson) void handleStart(props.initialLesson);
      return;
    }
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
    // sidebar 모드에서 패널이 닫힌 뒤에는 화면에 보이지 않는 곳에서 음성이 재생되면
    // 안 된다 — standalone에서는 activeRef가 항상 true라 영향이 없다. voiceState를
    // 여기서 idle로 되돌리지 않으면 handleSend가 남겨둔 "thinking"이 그대로 굳어
    // 입력이 잠긴 채로 남는다(Codex 최종 리뷰에서 발견).
    if (!activeRef.current) {
      setVoiceState("idle");
      return;
    }
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
  /** myEpoch: 이 녹음을 시작할 때의 requestEpochRef 값 — 응답이 도착했을 때도 "그 사이
   * 한 번이라도 닫혔다 나온" 녹음이 아닌지 확인한다. activeRef(지금 열려 있는지)만으로는
   * "녹음 시작 → 닫힘 → 다시 열림 → 응답 도착" 순서에서 다시 true가 돼 버려 오래된
   * 녹음이 자동 제출되는 것을 못 막는다(Codex 최종 리뷰에서 발견). */
  async function transcribeAndSend(blob: Blob, myEpoch: number) {
    setVoiceState("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/tutor/stt", { method: "POST", body: form });
      const data = await res.json();
      if (!activeRef.current || requestEpochRef.current !== myEpoch) {
        // 응답 도착 전에 패널이 닫혔거나, 닫혔다 다시 열렸다 — 오래된 녹음이니 버린다.
        setVoiceState("idle");
        return;
      }
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
      if (!activeRef.current || requestEpochRef.current !== myEpoch) return;
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

    const myEpoch = requestEpochRef.current;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!activeRef.current || requestEpochRef.current !== myEpoch) {
        // 권한 요청 중 패널이 닫혔다 — 뒤늦게 허용돼도 숨겨진 곳에서 녹음을 시작하지 않는다.
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        // cleanupVoiceResources()가 패널이 닫히는 동안 이 stop()을 유발했을 수 있다 —
        // 그 경우 사용자가 직접 중지 버튼을 누른 게 아니므로 제출하지 않고 버린다
        // (녹음 취소가 녹음 제출이 되면 안 된다).
        if (!activeRef.current || requestEpochRef.current !== myEpoch) return;
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void transcribeAndSend(blob, myEpoch);
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
      // activeRef로 여기를 막지 않는다 — sidebar 모드에서 첫 세션 준비 중 패널이 닫히면
      // (이 mount-effect 호출은 단 한 번뿐이라) 재시도할 방법이 없어 재오픈해도 영구
      // 로딩에 빠진다(Codex 최종 리뷰에서 발견). 세션 데이터는 항상 반영하고, 숨겨진
      // 곳에서 음성만 나지 않게 speakReply() 자신의 activeRef 체크로 막는다.
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
      setSidebarOpen(false); // 새 Lesson을 시작할 때마다 Tutor 패널은 항상 닫힌 채로 시작한다
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
    // 이 메시지가 "지금 세션"에 속한다는 표시 — 응답이 오는 동안 abandon 재무장 등으로
    // 새 세션이 시작되면(handleStart가 다시 호출되면) 값이 바뀐다. 단순히 패널을
    // 닫았다 여는 것만으로는 바뀌지 않으므로 그 경우엔 응답이 정상적으로 이어진다.
    const sendGen = handleStartCallIdRef.current;
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
      if (handleStartCallIdRef.current !== sendGen) return; // 그 사이 새 세션이 시작됐다 — 옛 답변을 섞지 않는다
      if (!res.ok) throw new Error(data.error ?? "응답을 받지 못했습니다.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setFallbackNotice(
        data.fallbackModel ? `기본 AI 모델을 사용할 수 없어 ${data.fallbackModel}로 임시 전환했습니다.` : null,
      );
      void speakReply(data.reply);
    } catch (err) {
      if (handleStartCallIdRef.current !== sendGen) return;
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

  /** sidebar 모드: 현재 화면(Lesson 페이지)을 벗어나지 않는다 — abandon 후 같은 Lesson으로
   * 새 세션을 조용히 준비해 두고(기존 handleStart 재사용, 새 로직 없음) 패널만 닫는다
   * (재오픈하면 깨끗한 상태로 시작한다). standalone(/tutor): 기존과 동일하게 홈으로 이동. */
  async function abandonAndLeave() {
    cleanupVoiceResources();
    const abandonedSessionId = sessionId;
    if (abandonedSessionId) {
      try {
        await fetch(`/api/tutor/session/${abandonedSessionId}/abandon`, { method: "POST" });
      } catch {
        // 최선 노력 — 실패해도 화면 전환은 계속한다
      }
    }
    if (layoutMode === "sidebar") {
      // abandon 응답을 기다리는 동안 패널이 닫히거나(재열기 전) 이 컴포넌트 자체가
      // unmount됐을 수 있다(Lesson 변경) — 그 경우 여기서 새 세션을 재무장하면 다른
      // Lesson으로 옮겨간 뒤에 이 Lesson의 세션이 서버에서 다시 active가 되어 새
      // Lesson의 세션을 도리어 abandon시킨다(Codex 최종 리뷰에서 발견). activeRef는
      // unmount 시에도 false로 남으므로(위 unmount effect) 여기서 재확인한다.
      if (!activeRef.current) return;
      if (currentLesson) await handleStart(currentLesson);
      cleanupVoiceResources(); // 방금 준비된 세션의 인사말이 재생 중이면 나가기 전에 멈춘다
      props.onRequestClose?.();
      return;
    }
    router.push("/");
  }

  // ── 화면 ──────────────────────────────────────────────────────────

  if (view === "start") {
    // sidebar 모드: 화면에 보이는 Lesson으로만 시작한다 — 다른 Lesson을 고를 수 있는
    // 전체 목록 picker는 보여주지 않는다(화면 Lesson과 Tutor Lesson이 어긋나면 안 된다).
    if (layoutMode === "sidebar") {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 6 }}>
          {error ? (
            <>
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
              <Button
                variant="outlined"
                size="small"
                disabled={starting}
                onClick={() => props.initialLesson && void handleStart(props.initialLesson)}
              >
                다시 시도
              </Button>
            </>
          ) : (
            <>
              <CircularProgress size={24} />
              <Typography variant="caption" color="text.secondary">
                이 Lesson으로 Tutor를 준비하고 있어요…
              </Typography>
            </>
          )}
        </Box>
      );
    }
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
        {layoutMode === "sidebar" ? (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={() => currentLesson && void handleStart(currentLesson)}
            >
              이 Lesson 새 대화 시작
            </Button>
            <Button variant="outlined" onClick={() => props.onRequestClose?.()}>
              닫기
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => router.push("/tutor")}>
              Tutor 홈으로
            </Button>
            <Button variant="outlined" onClick={() => router.push("/study")}>
              복습 목록 보기
            </Button>
          </Stack>
        )}
      </Box>
    );
  }

  // view === "chat" — 집중 학습 레이아웃: Lesson 교재가 주 콘텐츠이고, Tutor는
  // 필요할 때만 여는 overlay Drawer다(왼쪽 Navigation은 AppShell이 useLessonFocusMode로
  // 접는다 — 위 참고). Desktop/Mobile을 나눠 별도 구현하지 않는다.
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
      onCollapse={
        // 정리는 위 active effect가 트리거와 무관하게(▸ 버튼/Escape/backdrop 전부)
        // 공통으로 처리한다 — 여기서는 부모에게 닫아 달라고 요청만 한다.
        layoutMode === "sidebar" ? () => props.onRequestClose?.() : () => setSidebarOpen(false)
      }
    />
  );

  if (layoutMode === "sidebar") {
    // 부모(LessonTutorSidebar)가 위치·폭·overlay 여부를 담당한다 — 여기서는 순수
    // TutorSidebar 하나만 돌려준다(Lesson 렌더링도, 자체 Drawer도 없음 — 복제 없음).
    return <Box sx={{ height: "100%" }}>{sidebar}</Box>;
  }

  return (
    <Box sx={{ position: "relative", minWidth: 0 }}>
      {/* 읽기 좋은 폭으로 제한한다(기존 /lesson/[...id] 페이지와 같은 900px 관례) —
          Navigation/Tutor를 접어 넓어진 화면을 글자가 끝까지 늘어나는 데 쓰지 않는다. */}
      <Box sx={{ maxWidth: 900 }}>
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
              {currentLesson?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lessonMeta}
            </Typography>
          </Box>
          {!sidebarOpen && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSidebarOpen(true)}
              sx={{ flexShrink: 0 }}
              aria-expanded={sidebarOpen}
            >
              🎧 AI Tutor
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

      {/* Tutor는 항상 overlay Drawer다 — 열려도 위 Lesson 영역의 폭을 밀어내지 않는다. */}
      <Drawer anchor="right" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Box sx={{ width: { xs: "88vw", sm: 380 }, maxWidth: 380, height: "100%", p: 2 }}>{sidebar}</Box>
      </Drawer>
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
