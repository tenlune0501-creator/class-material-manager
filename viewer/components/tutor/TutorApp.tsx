"use client";

/**
 * AI Tutor 화면 전체 — 시작 화면 → 대화 → 종료 요약 확인의 상태 기계.
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
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { MeloTTSProvider } from "@/lib/tutor/providers/melotts-local";

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

/**
 * TTS로 읽기 전에 마크다운 기호를 없앤다.
 *
 * 두 가지 이유가 있다: (1) "**1.5**", "`line-height`" 를 기호까지 그대로 읽으면
 * 자연스러운 음성 과외가 아니다. (2) MeloTTS(한국어 심볼 테이블)가 백틱(`)처럼
 * 학습되지 않은 기호를 만나면 합성 자체가 KeyError로 실패한다(실사용 검증 중
 * 발견) — 그래서 안전을 위해서도 코드/강조 기호는 읽기 전에 반드시 벗겨낸다.
 */
function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "") // 코드 블록은 음성으로 읽지 않고 생략한다
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/[`*_~#>|]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function TutorApp(props: TutorAppProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("start");
  const [currentLesson, setCurrentLesson] = useState<LessonRef | null>(
    props.inProgressLesson ?? props.nextLesson,
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const [voiceOn, setVoiceOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);
  const [manualNextLessonId, setManualNextLessonId] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const tts = useMemo(
    () => (props.ttsConfigured ? new MeloTTSProvider(process.env.NEXT_PUBLIC_MELOTTS_URL!) : null),
    [],
  );

  useEffect(() => {
    try {
      setVoiceOn(window.localStorage.getItem("cmm-tutor-voice") === "on");
    } catch {
      // localStorage 접근 실패(프라이빗 모드 등) — 기본값 off 유지
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ?lessonId= 로 들어오면 시작 화면 없이 바로 그 Lesson으로 시작한다.
  useEffect(() => {
    if (props.autoStartLessonId) {
      const lesson = props.allLessons.find((l) => l.id === props.autoStartLessonId);
      if (lesson) void handleStart(lesson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleVoice() {
    setVoiceOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("cmm-tutor-voice", next ? "on" : "off");
      } catch {
        // 무시 — 이번 세션 동안만 유지된다
      }
      if (!next) stopSpeaking();
      return next;
    });
  }

  function stopSpeaking() {
    audioRef.current?.pause();
    setSpeaking(false);
  }

  async function speak(rawText: string) {
    if (!tts || !voiceOn) return;
    const text = stripMarkdownForSpeech(rawText);
    if (!text) return;
    try {
      stopSpeaking();
      const blob = await tts.synthesize(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setSpeaking(true);
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      await audio.play();
    } catch {
      // TTS 실패 — 텍스트는 이미 화면에 있으므로 조용히 넘어간다 (요구사항: 실패해도 텍스트 유지)
      setSpeaking(false);
    }
  }

  async function handleStart(lesson: LessonRef) {
    setStarting(true);
    setError(null);
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

      const progress = props.lessonProgress.find((p) => p.lessonId === lesson.id);
      const resuming = progress && (progress.status === "learning" || progress.status === "review");
      const greeting = resuming
        ? `안녕하세요! "${lesson.title}" 이어서 볼게요. 지난번 요약을 참고했어요 — 어디부터 다시 볼까요, 아니면 바로 이어갈까요?`
        : `안녕하세요! 오늘은 "${lesson.title}"를 같이 볼게요. 준비되면 말씀해 주세요 — 목표부터 짚어드릴까요?`;
      setMessages([{ role: "assistant", content: greeting }]);
      setView("chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setStarting(false);
    }
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || !sessionId || sending) return;
    setInput("");
    setError(null);
    setShowEndConfirm(false);

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setSending(true);

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
      void speak(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setSending(false);
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        await transcribe(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("마이크 권한을 확인해 주세요.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function transcribe(blob: Blob) {
    setTranscribing(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/tutor/stt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "음성 인식에 실패했습니다.");
      // 요구사항: 자동 전송 금지 — 입력창에 채워 사용자가 확인·수정 후 보내게 한다.
      setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "음성 인식에 실패했습니다. 텍스트로 입력해 주세요.");
    } finally {
      setTranscribing(false);
    }
  }

  async function beginEndSession() {
    if (!sessionId) return;
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

  // view === "chat"
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", maxWidth: 900 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            🎧 {currentLesson?.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentLesson?.trackTitle} · {currentLesson?.chapterTitle}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <FormControlLabel
            control={<Switch size="small" checked={voiceOn} onChange={toggleVoice} disabled={!tts} />}
            label={<Typography variant="caption">{tts ? "음성" : "음성(미설정)"}</Typography>}
          />
          {speaking && (
            <Chip size="small" label="🔊 재생 중" onDelete={stopSpeaking} />
          )}
          <Button size="small" color="error" variant="outlined" onClick={beginEndSession}>
            학습 종료
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        {messages.map((m, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              bgcolor: m.role === "user" ? "primary.main" : "action.hover",
              color: m.role === "user" ? "primary.contrastText" : "text.primary",
              borderRadius: 2,
              px: 1.5,
              py: 1,
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            {m.content}
          </Box>
        ))}
        {sending && (
          <Box sx={{ alignSelf: "flex-start" }}>
            <CircularProgress size={16} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {showEndConfirm && (
        <Alert
          severity="info"
          sx={{ mt: 1 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={beginEndSession}>
                네, 종료할게요
              </Button>
              <Button size="small" onClick={() => setShowEndConfirm(false)}>
                아니요, 계속할게요
              </Button>
            </Stack>
          }
        >
          오늘 학습을 종료할까요?
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "flex-end" }}>
        <IconButton
          color={recording ? "error" : "default"}
          onClick={recording ? stopRecording : startRecording}
          disabled={transcribing}
          aria-label="마이크로 말하기"
          sx={{ border: 1, borderColor: "divider" }}
        >
          {transcribing ? <CircularProgress size={20} /> : recording ? "⏹" : "🎤"}
        </IconButton>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="메시지를 입력하거나 마이크로 말해보세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button variant="contained" onClick={() => handleSend()} disabled={sending || !input.trim()}>
          보내기
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        <Box component="span" sx={{ cursor: "pointer", textDecoration: "underline" }} onClick={abandonAndLeave}>
          저장하지 않고 나가기
        </Box>
      </Typography>
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
