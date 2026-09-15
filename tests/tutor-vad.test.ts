/**
 * 핸즈프리 VAD 순수 로직 검증 — `viewer/lib/tutor/vad.ts`.
 *
 * 실제 마이크/AudioContext 없이 RMS 샘플 시퀀스만으로 상태 전이를 검증한다
 * (self-contained 모듈이라 groq-fallback.test.ts와 같은 방식으로 직접 import).
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  SpeechActivityDetector,
  VAD_MIN_UTTERANCE_MS,
  VAD_ONSET_SUSTAIN_MS,
  VAD_SILENCE_TIMEOUT_MS,
} from "../viewer/lib/tutor/vad.ts";

const SILENT = 0.001;
const LOUD = 0.3;

/** 보정 구간(300ms)을 조용한 샘플로 채워 idle 상태로 만든다. */
function calibrate(detector: SpeechActivityDetector, startMs: number): number {
  let t = startMs;
  for (let i = 0; i < 5; i++) {
    detector.pushSample(SILENT, t);
    t += 100;
  }
  return t;
}

describe("SpeechActivityDetector — activity → recording (speech-start)", () => {
  it("임계값을 넘는 소리가 onsetSustainMs만큼 이어져야 speech-start를 낸다", () => {
    const d = new SpeechActivityDetector();
    let t = calibrate(d, 0);

    // 짧은 피크 하나(오탐 후보) — sustain 시간을 채우지 못하면 시작으로 보지 않는다.
    let transition = d.pushSample(LOUD, t);
    t += 50;
    transition = d.pushSample(SILENT, t) ?? transition;
    assert.equal(transition, null, "순간 피크 하나로는 발화 시작으로 보지 않는다");

    // 이제 실제로 onsetSustainMs 이상 지속되는 소리.
    let started: unknown = null;
    for (let i = 0; i < 10; i++) {
      t += 50;
      const r = d.pushSample(LOUD, t);
      if (r) started = r;
    }
    assert.ok(started, "지속된 소리는 speech-start를 내야 한다");
    assert.equal((started as { type: string }).type, "speech-start");
  });

  it("키보드 클릭 같은 짧은 피크는 오작동하지 않는다", () => {
    const d = new SpeechActivityDetector();
    let t = calibrate(d, 0);
    for (let i = 0; i < 3; i++) {
      const r1 = d.pushSample(LOUD, t);
      t += VAD_ONSET_SUSTAIN_MS / 4; // sustain 기준보다 훨씬 짧게
      const r2 = d.pushSample(SILENT, t);
      assert.equal(r1, null);
      assert.equal(r2, null);
      t += 300;
    }
  });
});

describe("SpeechActivityDetector — silence → 종료 (speech-end)", () => {
  function startSpeech(d: SpeechActivityDetector, startMs: number): number {
    let t = calibrate(d, startMs);
    let started = false;
    while (!started) {
      t += 50;
      const r = d.pushSample(LOUD, t);
      if (r?.type === "speech-start") started = true;
    }
    return t;
  }

  it("silenceTimeoutMs 이상 조용하면 speech-end(reason=silence)를 낸다", () => {
    const d = new SpeechActivityDetector();
    let t = startSpeech(d, 0);
    // 최소 발화 시간은 채운다.
    t += VAD_MIN_UTTERANCE_MS;
    d.pushSample(LOUD, t);

    let ended: unknown = null;
    let elapsedSilence = 0;
    while (!ended && elapsedSilence < VAD_SILENCE_TIMEOUT_MS + 300) {
      t += 100;
      elapsedSilence += 100;
      const r = d.pushSample(SILENT, t);
      if (r) ended = r;
    }
    assert.ok(ended, "충분히 조용하면 speech-end를 내야 한다");
    assert.equal((ended as { type: string; reason: string }).reason, "silence");
  });

  it("최소 발화 시간을 채우기 전에는 조용해져도 끝내지 않는다", () => {
    const d = new SpeechActivityDetector({ minUtteranceMs: 2000, silenceTimeoutMs: 300 });
    let t = 0;
    t = calibrate(d, t);
    let started = false;
    while (!started) {
      t += 50;
      const r = d.pushSample(LOUD, t);
      if (r?.type === "speech-start") started = true;
    }
    // silenceTimeoutMs(300ms)는 넘겼지만 minUtteranceMs(2000ms)는 아직 못 채웠다.
    let ended: unknown = null;
    for (let i = 0; i < 5; i++) {
      t += 100;
      const r = d.pushSample(SILENT, t);
      if (r) ended = r;
    }
    assert.equal(ended, null, "최소 발화 시간 전에는 끝내지 않아야 한다");
  });

  it("maxUtteranceMs를 넘으면 침묵을 기다리지 않고 강제 종료한다", () => {
    const d = new SpeechActivityDetector({ maxUtteranceMs: 1000, silenceTimeoutMs: 5000 });
    let t = 0;
    t = calibrate(d, t);
    let started = false;
    while (!started) {
      t += 50;
      const r = d.pushSample(LOUD, t);
      if (r?.type === "speech-start") started = true;
    }
    let ended: unknown = null;
    for (let i = 0; i < 30 && !ended; i++) {
      t += 50;
      const r = d.pushSample(LOUD, t); // 계속 말하는 중이어도
      if (r) ended = r;
    }
    assert.ok(ended, "안전장치로 강제 종료돼야 한다");
    assert.equal((ended as { type: string; reason: string }).reason, "max-duration");
  });

  it("짧은 유효 발화(응/왜?)도 글자 수와 무관하게 최소 시간만 채우면 끝난다", () => {
    // VAD는 글자수를 모른다 — 이 테스트는 "지속시간 기준"만으로 짧은 발화도 정상
    // 종료됨을 보여준다(글자수로 버리지 않는다는 요구사항은 STT 이후 로직의 몫).
    const d = new SpeechActivityDetector({ minUtteranceMs: 200, silenceTimeoutMs: 500 });
    let t = 0;
    t = calibrate(d, t);
    let started = false;
    while (!started) {
      t += 50;
      const r = d.pushSample(LOUD, t);
      if (r?.type === "speech-start") started = true;
    }
    t += 250; // 최소 발화 시간 확보
    d.pushSample(LOUD, t);
    let ended: unknown = null;
    for (let i = 0; i < 10 && !ended; i++) {
      t += 100;
      ended = d.pushSample(SILENT, t);
    }
    assert.ok(ended);
  });
});

describe("SpeechActivityDetector — reset", () => {
  it("reset() 후에는 다시 보정부터 시작한다(바로 이전 임계값을 쓰지 않음)", () => {
    const d = new SpeechActivityDetector();
    let t = calibrate(d, 0);
    let started = false;
    while (!started) {
      t += 50;
      const r = d.pushSample(LOUD, t);
      if (r?.type === "speech-start") started = true;
    }
    assert.equal(d.getPhase(), "speaking");
    d.reset(t + 10000);
    assert.equal(d.getPhase(), "calibrating");
  });
});
