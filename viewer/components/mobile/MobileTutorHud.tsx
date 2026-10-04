"use client";
import { TutorError } from "@/components/tutor/TutorError";

import { useState } from "react";
import { Alert, Box, Button, Dialog, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import type { TutorSidebarProps } from "@/components/tutor/TutorSidebar";
import { VOICE_STATE_LABEL } from "@/lib/tutor/voice-state";
import { VoiceIndicator } from "@/components/tutor/VoiceIndicator";
import { TutorHistory } from "@/components/tutor/TutorHistory";
import { MobileTutorDock } from "./MobileLayout";

/** Only presentation state lives here. Session, draft and every voice action belong to TutorApp. */
export function MobileTutorHud(props: TutorSidebarProps & { micPending?: boolean; onReplay?: () => void }) {
  const [open, setOpen] = useState(false);
  const status = props.micPending ? "마이크 권한 확인 중…" : props.error ? "음성 작업을 확인해 주세요" : VOICE_STATE_LABEL[props.voiceState];
  const controls = <Stack direction="row" spacing={1}>
    {props.voiceState === "speaking"
      ? <Button fullWidth variant="contained" onClick={props.onStopSpeaking} sx={{ minHeight: 48 }}>■ AI 답변 중지</Button>
      : <Button fullWidth variant="contained" disabled={props.micDisabled} onClick={props.recording ? props.onFinishUtterance : props.onMicClick} sx={{ minHeight: 48 }}>
        {props.recording ? "■ 말하기 종료" : props.micPending ? "권한 확인 중…" : "🎙 말하기 시작"}
      </Button>}
  </Stack>;
  const notices = <>
    {props.error && <TutorError message={props.error} onClose={props.onDismissError} />}
    {props.ttsNotice && <Alert severity="warning" onClose={props.onDismissTtsNotice}>{props.ttsNotice}</Alert>}
    {props.fallbackNotice && <Alert severity="info" onClose={props.onDismissFallbackNotice}>{props.fallbackNotice}</Alert>}
  </>;
  return <>
    <MobileTutorDock hidden={open}>
      <Stack spacing={0.5}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}><VoiceIndicator compact state={props.voiceState} stream={props.micStream} /><Typography variant="caption" role="status" aria-live="polite">{props.recording ? "● 녹음 중 · 직접 종료할 때까지 계속됩니다" : `🎧 ${status}`}</Typography></Stack>
        {props.error && <Typography role="alert" variant="caption" color="error">{props.error}</Typography>}
        {props.ttsNotice && <Typography role="alert" variant="caption">{props.ttsNotice}</Typography>}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>{controls}</Box>
          <Button aria-expanded={open} aria-controls="mobile-tutor-detail" sx={{ minHeight: 48 }} onClick={() => setOpen(true)}>상세 · 입력</Button>
        </Stack>
      </Stack>
    </MobileTutorDock>
    <Dialog fullScreen open={open} onClose={() => setOpen(false)} aria-labelledby="mobile-tutor-title"
      slotProps={{ paper: { id: "mobile-tutor-detail", sx: { height: "100dvh", maxHeight: "100dvh", pt: "env(safe-area-inset-top, 0px)", pb: "env(safe-area-inset-bottom, 0px)" } } }}>
      <Box sx={{ display: "flex", alignItems: "center", px: 2, flexShrink: 0 }}>
        <Typography id="mobile-tutor-title" noWrap sx={{ flex: 1, fontWeight: 700 }}>{props.lessonTitle}</Typography>
        <Button onClick={() => setOpen(false)} sx={{ minHeight: 48 }}>접기</Button>
      </Box>
      <Box sx={{ px: 2, flexShrink: 0 }}>
        <Typography role="status" aria-live="polite" variant="body2">{status}</Typography>
        {controls}
        <Stack direction="row" sx={{ flexWrap: "wrap", alignItems: "center" }}>
          <FormControlLabel control={<Switch checked={props.voiceOn} onChange={props.onToggleVoice} />} label="AI 음성 응답" />
          <Button sx={{ minHeight: 48 }} disabled={props.voiceState !== "idle" || !props.ttsAvailable} onClick={props.onReplay}>답변 다시 듣기</Button>
        </Stack>
        {!props.ttsAvailable && <Typography variant="caption">한국어 음성을 사용할 수 없습니다. 마이크 입력과 텍스트 수업은 계속 사용할 수 있습니다.</Typography>}
      </Box>
      <Stack spacing={1.5} sx={{ p: 2, minHeight: 0, flex: 1, overflowY: "auto", overflowWrap: "anywhere", "& > :not([data-tutor-history])": { flexShrink: 0 } }}>
        {notices}
        <TutorHistory messages={props.messages} expanded={props.historyExpanded} onToggle={props.onToggleHistoryExpanded} />
        {props.showEndConfirm && <Alert severity="info">학습을 마칠까요?<Button onClick={props.onConfirmEnd} sx={{ minHeight: 48 }}>요약하기</Button><Button onClick={props.onCancelEnd} sx={{ minHeight: 48 }}>계속하기</Button></Alert>}
        <Stack direction="row" sx={{ flexWrap: "wrap" }}>
          <Button onClick={props.onRequestEnd} sx={{ minHeight: 48 }}>학습 종료 · 요약</Button>
          <Button color="inherit" onClick={props.onLeaveWithoutSaving} sx={{ minHeight: 48 }}>저장 없이 새 대화</Button>
        </Stack>
      </Stack>
      <Box component="form" onSubmit={(event) => { event.preventDefault(); if (!props.sendDisabled && props.input.trim()) props.onSend(); }} sx={{ p: 2, display: "flex", gap: 1, flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
        <TextField fullWidth multiline maxRows={3} label="텍스트로 질문" value={props.input} onChange={(e) => props.onInputChange(e.target.value)} />
        <Button type="submit" variant="contained" disabled={props.sendDisabled || !props.input.trim()} sx={{ minHeight: 48 }}>전송</Button>
      </Box>
    </Dialog>
  </>;
}
