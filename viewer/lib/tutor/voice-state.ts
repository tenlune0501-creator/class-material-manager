/**
 * AI Tutor 음성 UX의 명시적 상태 — 겹쳐서는 안 되는 여러 boolean(recording/
 * transcribing/speaking/sending 등)이 동시에 켜지는 사고를 막기 위해 하나의 값으로
 * 통일한다. 상태 머신 라이브러리는 쓰지 않는다 — 값 하나 + 전이 함수 몇 개로 충분하다.
 *
 * 발화 "종료"는 프로그램이 판단하지 않는다 — 사용자가 [말하기 끝]/⏹ 로 직접 끝낸다
 * (VAD/침묵 기반 자동 종료 없음). 시작도 사용자의 명시적 클릭으로만 한다.
 * TTS가 끝나면 idle로 돌아가 다음 사용자 입력을 기다린다.
 *
 * 이 파일은 상대 import가 없는 self-contained 모듈이다 — tests/에서 직접 import해
 * 순수 로직을 검증한다.
 */
export type VoiceState =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

/** Sidebar/Voice Indicator 아래에 그대로 보여줄 라벨. */
export const VOICE_STATE_LABEL: Record<VoiceState, string> = {
  idle: "말하기 준비",
  recording: "녹음 중",
  transcribing: "음성 변환 중…",
  thinking: "생각 중…",
  speaking: "설명하고 있어요",
  error: "오류",
};

/** 이 dBFS 아래는 조용함(0), 위는 충분히 큰 목소리(1)로 본다 — Voice Indicator 표시용. */
export const MIC_LEVEL_FLOOR_DB = -60;
export const MIC_LEVEL_CEIL_DB = -18;

/**
 * 마이크 입력 RMS(0~1) → Voice Indicator 크기용 레벨(0~1). **화면 애니메이션에만
 * 쓴다** — 발화 종료 판단(VAD)에는 쓰지 않는다. 사람 귀처럼 로그(dB) 스케일로 바꿔야
 * 작은 목소리에도 원이 반응한다(선형 RMS는 대부분 0 근처에 몰린다).
 */
export function micLevelFromRms(rms: number): number {
  if (!Number.isFinite(rms) || rms <= 0) return 0;
  const db = 20 * Math.log10(rms);
  const level = (db - MIC_LEVEL_FLOOR_DB) / (MIC_LEVEL_CEIL_DB - MIC_LEVEL_FLOOR_DB);
  return Math.min(1, Math.max(0, level));
}
