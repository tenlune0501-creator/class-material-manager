"use client";

/**
 * AI Tutor 사이드바 — 교재(LessonContent) 옆에 붙는 좁은 패널.
 *
 * 상태 표시(설명하는 중/말하는 중/...) · 음성(TTS) 스위치 · 마이크 시작/중지 ·
 * 텍스트 입력 폴백 · 재생 중지 · 대화 기록 접기/펼치기 · 학습 종료 를 담당한다.
 * 이 컴포넌트는 상태를 갖지 않는다(전부 TutorApp이 들고 있는 값을 prop으로 받는다) —
 * 그래야 TutorApp의 음성 상태 머신을 한 곳에서만 관리할 수 있다.
 *
 * 음성 입력은 반자동이다 — 마이크는 사용자가 직접 시작/중지하며, 발화 종료를
 * 프로그램이 판단하는 핸즈프리/VAD는 쓰지 않는다.
 */
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { VOICE_STATE_LABEL, type VoiceState } from "@/lib/tutor/voice-state";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorSidebarProps {
  lessonTitle: string;
  lessonMeta: string;

  voiceState: VoiceState;
  ttsAvailable: boolean;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onStopSpeaking: () => void;

  onMicClick: () => void;
  recording: boolean; // 지금 녹음 중(눌러서 중지 가능한 상태)
  micDisabled: boolean; // TTS 재생/응답 대기 중 등 — 새로 시작하지 못하게 잠근다

  messages: ChatMessage[];
  historyExpanded: boolean;
  onToggleHistoryExpanded: () => void;

  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  sendDisabled: boolean;

  error: string | null;
  onDismissError: () => void;
  fallbackNotice: string | null;
  onDismissFallbackNotice: () => void;
  ttsNotice: string | null;
  onDismissTtsNotice: () => void;

  showEndConfirm: boolean;
  onConfirmEnd: () => void;
  onCancelEnd: () => void;
  onRequestEnd: () => void;
  onLeaveWithoutSaving: () => void;

  onCollapse?: () => void;
}

function StateChip({ voiceState }: { voiceState: VoiceState }) {
  const busy = voiceState !== "idle";
  return (
    <Chip
      size="small"
      color={voiceState === "error" ? "error" : busy ? "primary" : "default"}
      variant={busy ? "filled" : "outlined"}
      icon={
        voiceState === "recording" ? (
          <span aria-hidden>🎙️</span>
        ) : voiceState === "speaking" ? (
          <span aria-hidden>🔊</span>
        ) : voiceState === "transcribing" || voiceState === "thinking" ? (
          <CircularProgress size={12} sx={{ ml: 1 }} color="inherit" />
        ) : undefined
      }
      label={VOICE_STATE_LABEL[voiceState]}
    />
  );
}

export function TutorSidebar(props: TutorSidebarProps) {
  const lastMessages = props.messages.slice(-2);

  return (
    <Stack sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
      <Box>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap title={props.lessonTitle}>
            🎧 {props.lessonTitle}
          </Typography>
          {props.onCollapse && (
            <IconButton size="small" onClick={props.onCollapse} aria-label="Tutor 패널 접기" title="접기">
              ▸
            </IconButton>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap title={props.lessonMeta}>
          {props.lessonMeta}
        </Typography>
      </Box>

      <Divider />

      <Box>
        <StateChip voiceState={props.voiceState} />
        {/* onStopSpeaking은 TTS 재생만 멈춘다 — recording/transcribing/thinking 중에는
            눌러도 아무 효과가 없으므로 실제로 말하는 중일 때만 보여준다. */}
        {props.voiceState === "speaking" && (
          <Button size="small" sx={{ ml: 1 }} onClick={props.onStopSpeaking}>
            정지
          </Button>
        )}
      </Box>

      <Stack spacing={0.5}>
        <FormControlLabel
          control={<Switch size="small" checked={props.voiceOn} onChange={props.onToggleVoice} disabled={!props.ttsAvailable} />}
          label={<Typography variant="caption">{props.ttsAvailable ? "음성 응답(TTS)" : "음성(미설정)"}</Typography>}
        />
      </Stack>

      {props.error && (
        <Alert severity="warning" onClose={props.onDismissError} sx={{ py: 0 }}>
          <Typography variant="caption">{props.error}</Typography>
        </Alert>
      )}
      {props.fallbackNotice && (
        <Alert severity="info" onClose={props.onDismissFallbackNotice} sx={{ py: 0 }}>
          <Typography variant="caption">{props.fallbackNotice}</Typography>
        </Alert>
      )}
      {props.ttsNotice && props.voiceOn && (
        <Alert severity="info" onClose={props.onDismissTtsNotice} sx={{ py: 0 }}>
          <Typography variant="caption">{props.ttsNotice}</Typography>
        </Alert>
      )}

      <Divider />

      {/* ── 대화 기록: 기본은 최근 발화만, 펼치면 전체 ── */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            대화 기록
          </Typography>
          <Button size="small" onClick={props.onToggleHistoryExpanded}>
            {props.historyExpanded ? "접기" : "전체 보기"}
          </Button>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            flex: props.historyExpanded ? 1 : "0 0 auto",
            minHeight: props.historyExpanded ? 0 : "auto",
            overflowY: "auto",
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {(props.historyExpanded ? props.messages : lastMessages).map((m, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "92%",
                bgcolor: m.role === "user" ? "primary.main" : "action.hover",
                color: m.role === "user" ? "primary.contrastText" : "text.primary",
                borderRadius: 2,
                px: 1.2,
                py: 0.7,
                whiteSpace: "pre-wrap",
                fontSize: "0.8rem",
                lineHeight: 1.6,
              }}
            >
              {m.content}
            </Box>
          ))}
          {props.messages.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              아직 대화가 없습니다.
            </Typography>
          )}
        </Paper>
      </Box>

      {props.showEndConfirm && (
        <Alert
          severity="info"
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={props.onConfirmEnd}>
                네
              </Button>
              <Button size="small" onClick={props.onCancelEnd}>
                아니요
              </Button>
            </Stack>
          }
        >
          <Typography variant="caption">오늘 학습을 종료할까요?</Typography>
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
        <IconButton
          color={props.recording ? "error" : "default"}
          onClick={props.onMicClick}
          disabled={props.micDisabled}
          aria-label={props.recording ? "녹음 중지" : "마이크로 말하기"}
          size="small"
          sx={{ border: 1, borderColor: "divider" }}
        >
          {props.recording ? "⏹" : "🎤"}
        </IconButton>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          size="small"
          placeholder="메시지를 입력하거나 마이크를 눌러 말해보세요"
          value={props.input}
          onChange={(e) => props.onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              props.onSend();
            }
          }}
        />
        <Button variant="contained" size="small" onClick={props.onSend} disabled={props.sendDisabled || !props.input.trim()}>
          전송
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={props.onLeaveWithoutSaving}
        >
          저장하지 않고 나가기
        </Typography>
        <Button size="small" color="error" variant="outlined" onClick={props.onRequestEnd}>
          학습 종료
        </Button>
      </Stack>
    </Stack>
  );
}
