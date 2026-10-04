"use client";
import { TutorError } from "@/components/tutor/TutorError";

/**
 * AI Tutor 사이드바 — 교재(LessonContent) 옆에 붙는 좁은 패널.
 *
 * 상태 표시(설명하는 중/말하는 중/...) · 음성(TTS) 스위치 · 마이크 시작/중지 ·
 * 텍스트 입력 폴백 · 재생 중지 · 대화 기록 접기/펼치기 · 학습 종료 를 담당한다.
 * 이 컴포넌트는 상태를 갖지 않는다(전부 TutorApp이 들고 있는 값을 prop으로 받는다) —
 * 그래야 TutorApp의 음성 상태 머신을 한 곳에서만 관리할 수 있다.
 *
 * 음성 입력은 반자동이다 — 발화 종료는 언제나 사용자가 [말하기 끝]/⏹ 로 직접 정한다
 * (핸즈프리/VAD 없음). 시작도 사용자 클릭으로만 한다.
 * 음성 상태는 VoiceIndicator 하나가 표현한다.
 */
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import { TutorHistory } from "./TutorHistory";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { VoiceIndicator } from "@/components/tutor/VoiceIndicator";
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

  /** 녹음 중인 마이크 스트림 — VoiceIndicator가 입력 레벨을 "보여주는" 데만 쓴다. */
  micStream: MediaStream | null;
  /** [말하기 끝] — 녹음만 끝낸다(절대 새로 시작하지 않는다). 이후 STT → 자동 전송. */
  onFinishUtterance: () => void;

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
  // 음성 상태와 수동 조작을 기록 위에 유지한다. 대기 중에는 상태 칩을 쓴다.
  const showIndicator = props.voiceState !== "idle";

  return (
    <Stack sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1, minWidth: 0, minHeight: 0, "& > :not([data-tutor-history])": { flexShrink: 0 } }}>
      <Box>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap title={props.lessonTitle}>
            🎧 {props.lessonTitle}
          </Typography>
          {props.onCollapse && (
            <IconButton size="small" sx={{ minWidth: 44, minHeight: 44 }} onClick={props.onCollapse} aria-label="Tutor 패널 접기" title="접기">
              ▸
            </IconButton>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap title={props.lessonMeta}>
          {props.lessonMeta}
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          flexDirection: showIndicator ? "column" : "row",
          alignItems: "center",
          gap: showIndicator ? 0.5 : 1,
          py: showIndicator ? 1 : 0,
        }}
      >
        {showIndicator ? (
          <>
            <VoiceIndicator compact state={props.voiceState} stream={props.micStream} />
            <Typography variant="body2" sx={{ fontWeight: 600 }} role="status" aria-live="polite">
              {VOICE_STATE_LABEL[props.voiceState]}
            </Typography>
          </>
        ) : (
          <Box role="status" aria-live="polite"><StateChip voiceState={props.voiceState} /></Box>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: showIndicator ? 0.5 : 0 }}>
          <Button
            variant="outlined"
            color={props.recording ? "error" : "primary"}
            onClick={props.onMicClick}
            disabled={props.micDisabled}
            aria-label={props.recording ? "말하기 끝" : "말하기 시작"}
            title={props.recording ? "말하기 끝" : "말하기 시작"}
            size="small"
            sx={{ border: 1, borderColor: "divider", minWidth: 44, minHeight: 44 }}
          >
            {props.recording ? "⏹ 말하기 끝" : "🎤 말하기 시작"}
          </Button>
          {props.recording && (
            // 발화 종료는 이 버튼(또는 🎤 옆 ⏹)으로만 — 침묵이 길어도 자동으로 끝나지 않는다.
            <Button variant="contained" size="small" onClick={props.onFinishUtterance}>
              말하기 끝
            </Button>
          )}
          {/* onStopSpeaking은 TTS 재생만 멈춘다 — recording/transcribing/thinking 중에는
              눌러도 아무 효과가 없으므로 실제로 말하는 중일 때만 보여준다. */}
          {props.voiceState === "speaking" && (
            <Button size="small" onClick={props.onStopSpeaking}>
              음성 중지
            </Button>
          )}
        </Stack>
      </Box>

      <Stack spacing={0.5}>
        <FormControlLabel
          control={<Switch size="small" checked={props.voiceOn} onChange={props.onToggleVoice} disabled={!props.ttsAvailable} />}
          label={<Typography variant="caption">{props.ttsAvailable ? "음성 대화" : "음성(미설정)"}</Typography>}
        />
        <Typography variant="caption" color="text.secondary">
          마이크로 시작하고 말하기 끝을 눌러 주세요. 변환된 말은 자동 전송됩니다.
        </Typography>
      </Stack>

      {props.error && (
        <TutorError message={props.error} onClose={props.onDismissError} />
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

      <TutorHistory messages={props.messages} expanded={props.historyExpanded} onToggle={props.onToggleHistoryExpanded} />

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
        <TextField
          fullWidth
          multiline
          maxRows={3}
          size="small"
          label="텍스트로 질문"
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
        <Button
          size="small"
          color="inherit"
          onClick={props.onLeaveWithoutSaving}
        >
          저장하지 않고 나가기
        </Button>
        <Button size="small" color="error" variant="outlined" onClick={props.onRequestEnd}>
          학습 종료
        </Button>
      </Stack>
    </Stack>
  );
}
