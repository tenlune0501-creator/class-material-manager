/**
 * 핸즈프리 음성 과외를 위한 최소 VAD(Voice Activity Detection) — 순수 로직.
 *
 * ■ 왜 외부 라이브러리를 쓰지 않는가
 *
 * 브라우저 내장 `AnalyserNode`로 RMS(음량)를 뽑아내는 것만으로 "말하기 시작/침묵으로
 * 끝남"을 충분히 판단할 수 있다. 무거운 ML 기반 VAD 라이브러리는 이 정도 요구사항
 * (원격 회의 수준의 정밀 화자 분리가 아니라 "지금 사용자가 말하고 있는가")에는
 * 과하다 — 그래서 이 파일은 RMS 샘플 스트림을 받아 상태만 전이시키는 순수 함수/
 * 클래스로만 구현한다. 브라우저 API(getUserMedia/AudioContext) 연결은
 * TutorApp.tsx가 담당한다(이 파일은 DOM에 의존하지 않아 실제 마이크 없이도
 * 타임스탬프 시퀀스만으로 단위 테스트가 가능하다).
 *
 * 상대 import가 없는 self-contained 모듈이다 — tts-chunking.ts와 같은 이유로
 * `node --test`가 직접 import해 단위 테스트한다(tests/tutor-vad.test.ts).
 */

/** 샘플링 주기(ms). 10Hz면 침묵/발화 판정에 충분하고 CPU 부담도 작다. */
export const VAD_TICK_MS = 100;
/** 진입 직후 주변 소음을 재는 구간(ms) — 이 구간의 평균 RMS로 임계값을 보정한다. */
export const VAD_CALIBRATION_MS = 300;
/** 소음이 거의 없는 방에서도 아주 작은 잡음에 반응하지 않도록 두는 최소 임계값. */
export const VAD_BASE_RMS_THRESHOLD = 0.02;
/** 실제 임계값 = max(BASE, 소음 바닥 * 이 배수). 방 소음이 크면 그만큼 임계값도 올라간다. */
export const VAD_THRESHOLD_MULTIPLIER = 2.5;
/**
 * 임계값을 넘는 상태가 이만큼(ms) 이어져야 "발화 시작"으로 확정한다 — 키보드 소리·
 * 클릭·기침 같은 순간 피크 하나로 오작동하지 않게 하는 smoothing.
 */
export const VAD_ONSET_SUSTAIN_MS = 200;
/** 발화 시작 후 이만큼(ms) 계속 임계값 아래면 "말이 끝났다"고 본다. 1.2~1.8초 범위 중 선택. */
export const VAD_SILENCE_TIMEOUT_MS = 1500;
/** 이보다 짧은 녹음은(잡음일 가능성이 높아) 침묵만으로 끝내지 않고 최소 이 길이는 채운다. */
export const VAD_MIN_UTTERANCE_MS = 350;
/** 안전장치 — 이 길이를 넘으면 침묵을 기다리지 않고 강제로 발화를 끝낸다. */
export const VAD_MAX_UTTERANCE_MS = 20000;

export type VadTransition =
  | { type: "speech-start"; atMs: number }
  | { type: "speech-end"; atMs: number; durationMs: number; reason: "silence" | "max-duration" };

type Phase = "calibrating" | "idle" | "onset" | "speaking";

export interface SpeechActivityDetectorOptions {
  tickMs?: number;
  calibrationMs?: number;
  baseThreshold?: number;
  thresholdMultiplier?: number;
  onsetSustainMs?: number;
  silenceTimeoutMs?: number;
  minUtteranceMs?: number;
  maxUtteranceMs?: number;
}

/**
 * RMS 샘플(오디오 음량)을 하나씩 받아 발화 시작/종료 전이만 돌려주는 상태 머신.
 * DOM/타이머에 의존하지 않는다 — 호출자가 `pushSample(rms, nowMs)`를 원하는
 * 주기로 불러주기만 하면 된다.
 */
export class SpeechActivityDetector {
  private readonly opts: Required<SpeechActivityDetectorOptions>;
  private phase: Phase = "calibrating";
  private calibrationStartMs = 0;
  private calibrationSum = 0;
  private calibrationCount = 0;
  private threshold: number;
  private onsetStartMs = 0;
  private speechStartMs = 0;
  private lastAboveThresholdMs = 0;

  constructor(options: SpeechActivityDetectorOptions = {}) {
    this.opts = {
      tickMs: options.tickMs ?? VAD_TICK_MS,
      calibrationMs: options.calibrationMs ?? VAD_CALIBRATION_MS,
      baseThreshold: options.baseThreshold ?? VAD_BASE_RMS_THRESHOLD,
      thresholdMultiplier: options.thresholdMultiplier ?? VAD_THRESHOLD_MULTIPLIER,
      onsetSustainMs: options.onsetSustainMs ?? VAD_ONSET_SUSTAIN_MS,
      silenceTimeoutMs: options.silenceTimeoutMs ?? VAD_SILENCE_TIMEOUT_MS,
      minUtteranceMs: options.minUtteranceMs ?? VAD_MIN_UTTERANCE_MS,
      maxUtteranceMs: options.maxUtteranceMs ?? VAD_MAX_UTTERANCE_MS,
    };
    this.threshold = this.opts.baseThreshold;
  }

  /** 새 "듣기 세션"을 시작할 때 호출 — 소음 보정부터 다시 한다. */
  reset(nowMs: number): void {
    this.phase = "calibrating";
    this.calibrationStartMs = nowMs;
    this.calibrationSum = 0;
    this.calibrationCount = 0;
    this.threshold = this.opts.baseThreshold;
  }

  getPhase(): Phase {
    return this.phase;
  }

  getThreshold(): number {
    return this.threshold;
  }

  /** RMS 샘플 하나를 투입한다. 상태가 바뀌면(발화 시작/끝) 그 전이를 돌려준다. */
  pushSample(rms: number, nowMs: number): VadTransition | null {
    if (this.phase === "calibrating") {
      this.calibrationSum += rms;
      this.calibrationCount += 1;
      if (nowMs - this.calibrationStartMs < this.opts.calibrationMs) return null;
      const noiseFloor = this.calibrationCount > 0 ? this.calibrationSum / this.calibrationCount : 0;
      this.threshold = Math.max(this.opts.baseThreshold, noiseFloor * this.opts.thresholdMultiplier);
      this.phase = "idle";
      // 보정 구간의 마지막 샘플도 idle 판정에 그대로 사용한다.
    }

    const above = rms > this.threshold;

    if (this.phase === "idle") {
      if (above) {
        this.phase = "onset";
        this.onsetStartMs = nowMs;
      }
      return null;
    }

    if (this.phase === "onset") {
      if (!above) {
        this.phase = "idle";
        return null;
      }
      if (nowMs - this.onsetStartMs >= this.opts.onsetSustainMs) {
        this.phase = "speaking";
        this.speechStartMs = this.onsetStartMs;
        this.lastAboveThresholdMs = nowMs;
        return { type: "speech-start", atMs: nowMs };
      }
      return null;
    }

    // phase === "speaking"
    if (above) this.lastAboveThresholdMs = nowMs;

    const elapsed = nowMs - this.speechStartMs;
    if (elapsed >= this.opts.maxUtteranceMs) {
      this.phase = "idle";
      return { type: "speech-end", atMs: nowMs, durationMs: elapsed, reason: "max-duration" };
    }

    const silentFor = nowMs - this.lastAboveThresholdMs;
    if (!above && silentFor >= this.opts.silenceTimeoutMs && elapsed >= this.opts.minUtteranceMs) {
      this.phase = "idle";
      return { type: "speech-end", atMs: nowMs, durationMs: elapsed, reason: "silence" };
    }

    return null;
  }
}

export function createSpeechActivityDetector(
  options?: SpeechActivityDetectorOptions,
): SpeechActivityDetector {
  return new SpeechActivityDetector(options);
}

/** Float32 time-domain 샘플(AnalyserNode.getFloatTimeDomainData 결과)에서 RMS를 계산한다. */
export function computeRms(samples: Float32Array | number[]): number {
  if (samples.length === 0) return 0;
  let sumSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    sumSquares += v * v;
  }
  return Math.sqrt(sumSquares / samples.length);
}
