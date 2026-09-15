/**
 * AI Tutor 음성 UX의 명시적 상태 — 겹쳐서는 안 되는 여러 boolean(recording/
 * transcribing/speaking/sending 등)이 동시에 켜지는 사고를 막기 위해 하나의 값으로
 * 통일한다. 상태 머신 라이브러리는 쓰지 않는다 — 값 하나 + 전이 함수 몇 개로 충분하다.
 *
 * 음성 입력은 반자동(사용자가 마이크 시작/중지를 직접 제어)이라 "listening"(자동 듣기
 * 대기) 상태는 없다 — idle에서 바로 마이크를 눌러 recording으로 들어간다.
 */
export type VoiceState =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

/** Sidebar에 그대로 보여줄 라벨. */
export const VOICE_STATE_LABEL: Record<VoiceState, string> = {
  idle: "대기 중",
  recording: "말하는 중...",
  transcribing: "음성을 이해하는 중...",
  thinking: "답변을 준비하는 중...",
  speaking: "설명하는 중...",
  error: "오류",
};
