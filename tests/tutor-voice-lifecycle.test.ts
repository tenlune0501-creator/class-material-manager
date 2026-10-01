/** Execute the actual TutorApp function bodies with deterministic browser doubles.
 * This checks async ownership, not real microphone/echo quality or React rendering. */
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { setImmediate } from "node:timers/promises";
import { describe, it } from "node:test";
import ts from "typescript";
import { chunkTextForSpeech } from "../viewer/lib/tutor/tts-chunking.ts";
import { validTranscript } from "../viewer/lib/tutor/transcript-validation.ts";

const source = await readFile("viewer/components/tutor/TutorApp.tsx", "utf8");
const tree = ts.createSourceFile("TutorApp.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const app = tree.statements.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "TutorApp") as ts.FunctionDeclaration;
const names = ["stopSpeakingInternal", "playBlob", "finishSpeaking", "speakReply", "cleanupVoiceResources"];
const code = app.body!.statements.filter((n) => ts.isFunctionDeclaration(n) && names.includes(n.name!.text)).map((n) => n.getText(tree)).join("\n");
const js = ts.transpileModule(`${code}\n({${names.join(",")}})`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

const micNames = ["startRecording", "stopRecording", "onMicClick", "transcribeAndSend", "classifyMicError", "cleanupVoiceResources", "endAssistantTurn"];
const micSource = app.body!.statements.filter((n) => ts.isFunctionDeclaration(n) && micNames.includes(n.name!.text)).map((n) => n.getText(tree)).join("\n");
const micJs = ts.transpileModule(`${micSource}\n({${micNames.join(",")}})`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

function micHarness() {
  const ref = <T>(current: T) => ({ current });
  const recorders: FakeRecorder[] = [];
  const sent: string[] = [];
  const timers = new Map<number, () => void>();
  let timerId = 0;
  let stoppedTracks = 0;
  let requests = 0;
  let permissions = 0;
  let error: string | null = null;
  let transcript: unknown = "네";
  let fail = false;
  let pendingResponse: Promise<unknown> | null = null;
  const stream = { getTracks: () => [{ stop: () => { stoppedTracks++; } }] };
  class FakeRecorder {
    state = "inactive";
    mimeType = "audio/webm";
    stops = 0;
    ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;
    constructor() { recorders.push(this); }
    start() { this.state = "recording"; }
    stop() {
      this.stops++;
      this.state = "inactive";
      queueMicrotask(() => {
        this.ondataavailable?.({ data: new Blob(["audio"]) });
        this.onstop?.();
      });
    }
  }
  const c = {
    voiceStateRef: ref("idle"), micStartingRef: ref(false), activeRef: ref(true), mountedRef: ref(true), viewRef: ref("chat"),
    requestEpochRef: ref(0), mediaRecorderRef: ref<FakeRecorder | null>(null), streamRef: ref<unknown>(null),
    sttAbortRef: ref<AbortController | null>(null), messageAbortRef: ref<AbortController | null>(null),
    navigator: { mediaDevices: { getUserMedia: async () => { permissions++; return stream; } } },
    setVoiceState: (state: string) => { c.voiceStateRef.current = state; },
    setError: (value: string | null) => { error = value; }, setMicStream: () => {},
    stopSpeakingInternal: () => {},
    handleSend: async (text: string) => { sent.push(text); c.voiceStateRef.current = "thinking"; },
    fetch: async () => { requests++; if (fail) throw new Error("offline"); return { ok: true, json: async () => pendingResponse ? await pendingResponse : { text: transcript } }; },
    setTimeout: (fn: () => void) => { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout: (id: number) => { timers.delete(id); },
    MediaRecorder: FakeRecorder, Blob, FormData, AbortController, DOMException, validTranscript,
  };
  const api = runInNewContext(micJs, c) as {
    startRecording: () => Promise<void>; stopRecording: () => void; onMicClick: () => void;
    cleanupVoiceResources: () => void; endAssistantTurn: () => void;
  };
  return { api, c, recorders, sent, timers,
    requests: () => requests, permissions: () => permissions, stopped: () => stoppedTracks, error: () => error,
    transcript: (value: unknown) => { transcript = value; }, fail: () => { fail = true; },
    response: (value: Promise<unknown>) => { pendingResponse = value; },
  };
}

describe("user-controlled recording and STT lifecycle", () => {
  it("records until explicit stop, with no silence or duration timers, then automatically sends STT", async () => {
    const h = micHarness();
    await h.api.startRecording();
    assert.equal(h.c.voiceStateRef.current, "recording");
    assert.equal(h.timers.size, 0);
    assert.equal(h.recorders[0].stops, 0);
    assert.equal(h.requests(), 0);
    h.api.stopRecording();
    h.api.stopRecording();
    await setImmediate();
    assert.equal(h.recorders[0].stops, 1);
    assert.equal(h.requests(), 1);
    assert.deepEqual(h.sent, ["네"]);
    assert.equal(h.stopped(), 1);
  });
  it("does not send empty/noise transcripts; short valid answers remain valid", async () => {
    for (const value of ["", " ", "[음악]", "...", "네", "응", "아니", "왜?", "다시"]) {
      const h = micHarness();
      h.transcript(value);
      await h.api.startRecording();
      h.api.stopRecording();
      await setImmediate();
      assert.deepEqual(h.sent, validTranscript(value) ? [value] : []);
      assert.equal(h.permissions(), 1);
      assert.equal(h.timers.size, 0);
    }
  });
  it("STT failure restores idle without opening the microphone again", async () => {
    const h = micHarness();
    h.fail();
    await h.api.startRecording();
    h.api.stopRecording();
    await setImmediate();
    assert.equal(h.c.voiceStateRef.current, "idle");
    assert.ok(h.error());
    assert.equal(h.timers.size, 0);
    await h.api.startRecording();
    assert.equal(h.c.voiceStateRef.current, "recording");
    h.api.cleanupVoiceResources();
  });
  it("cleanup cancels rather than submits recording and stale STT cannot send", async () => {
    const h = micHarness();
    await h.api.startRecording();
    h.api.cleanupVoiceResources();
    await setImmediate();
    assert.equal(h.requests(), 0);
    let resolve!: (value: unknown) => void;
    h.response(new Promise((r) => { resolve = r; }));
    await h.api.startRecording();
    h.api.stopRecording();
    await setImmediate();
    const signal = h.c.sttAbortRef.current!.signal;
    h.api.cleanupVoiceResources();
    resolve({ text: "오래된 응답" });
    await setImmediate();
    assert.equal(signal.aborted, true);
    assert.deepEqual(h.sent, []);
    assert.equal(h.c.voiceStateRef.current, "idle");
  });
  it("unexpected device stop never auto-submits", async () => {
    const h = micHarness();
    await h.api.startRecording();
    h.recorders[0].stop();
    await setImmediate();
    assert.equal(h.requests(), 0);
    assert.equal(h.c.voiceStateRef.current, "idle");
    assert.ok(h.error());
  });
  it("speaking blocks microphone, and assistant completion does not start recording", async () => {
    const h = micHarness();
    h.c.voiceStateRef.current = "speaking";
    h.api.onMicClick();
    await setImmediate();
    assert.equal(h.permissions(), 0);
    h.api.endAssistantTurn();
    assert.equal(h.permissions(), 0);
    assert.equal(h.c.voiceStateRef.current, "idle");
  });
  it("late microphone permission after unmount releases tracks without recording", async () => {
    const h = micHarness();
    let resolve!: (value: { getTracks: () => { stop: () => void }[] }) => void;
    let stopped = false;
    h.c.navigator.mediaDevices.getUserMedia = () => new Promise((r) => { resolve = r; });
    const pending = h.api.startRecording();
    h.api.cleanupVoiceResources();
    h.c.activeRef.current = h.c.mountedRef.current = false;
    resolve({ getTracks: () => [{ stop: () => { stopped = true; } }] });
    await pending;
    assert.ok(stopped);
    assert.equal(h.recorders.length, 0);
  });
});

function harness() {
  const ref = <T>(current: T) => ({ current });
  const revoked: string[] = [];
  const audio: FakeAudio[] = [];
  const synth: { text: string; signal: AbortSignal; resolve: (blob: Blob) => void; reject: (e: Error) => void }[] = [];
  class FakeAudio {
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onplaying: (() => void) | null = null;
    paused = false;
    url: string;
    constructor(url: string) { this.url = url; audio.push(this); }
    play() { this.onplaying?.(); return Promise.resolve(); }
    pause() { this.paused = true; }
    removeAttribute() {}
    load() {}
  }
  let state = "idle";
  let turns = 0;
  let tracksStopped = 0;
  const c = {
    activeRef: ref(true), voiceOnRef: ref(true), ttsGenerationRef: ref(0),
    ttsAbortRef: ref<AbortController | null>(null), sttAbortRef: ref<AbortController | null>(null), messageAbortRef: ref<AbortController | null>(null),
    cancelPlaybackRef: ref<(() => void) | null>(null), audioRef: ref<FakeAudio | null>(null), activeObjectUrlRef: ref<string | null>(null),
    latencyRef: ref<unknown>(null), requestEpochRef: ref(0),
    streamRef: ref<unknown>({ getTracks: () => [{ stop: () => { tracksStopped++; } }] }),
    mediaRecorderRef: ref<unknown>(null),
    setVoiceState: (s: string) => { state = s; },
    endAssistantTurn: () => { state = "idle"; turns++; },
    setMicStream: () => {}, setTtsNotice: () => {}, markLatency: () => {},
    chunkTextForSpeech, performance, AbortController, Blob, Audio: FakeAudio,
    URL: { createObjectURL: () => `blob:${audio.length}`, revokeObjectURL: (url: string) => revoked.push(url) },
    setTimeout: () => 1, clearTimeout: () => {},
    tts: { synthesize: (text: string, opts: { signal: AbortSignal }) => new Promise<Blob>((resolve, reject) => {
      synth.push({ text, signal: opts.signal, resolve, reject });
      opts.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    }) },
  };
  const api = runInNewContext(js, c) as {
    speakReply: (text: string) => Promise<void>;
    stopSpeakingInternal: () => void;
    cleanupVoiceResources: () => void;
    finishSpeaking: (generation: number) => void;
  };
  return { api, c, synth, audio, revoked, state: () => state, turns: () => turns, tracks: () => tracksStopped };
}

describe("Tutor TTS async lifecycle", () => {
  it("plays the first blob before requesting the next and preserves queue order", async () => {
    const h = harness();
    const run = h.api.speakReply("첫 번째 설명입니다.\n두 번째 설명입니다.");
    assert.equal(h.synth.length, 1);
    h.synth[0].resolve(new Blob(["first"]));
    await setImmediate();
    assert.equal(h.audio.length, 1);
    assert.equal(h.synth.length, 2);
    h.synth[1].resolve(new Blob(["second"]));
    await setImmediate();
    assert.equal(h.audio.length, 1);
    h.audio[0].onended?.();
    await setImmediate();
    assert.equal(h.audio.length, 2);
    h.audio[1].onended?.();
    await run;
    assert.equal(h.turns(), 1);
    assert.equal(h.revoked.length, 2);
  });
  it("stop aborts prefetch, settles playback and removes stale handlers/URLs", async () => {
    const h = harness();
    const run = h.api.speakReply("첫 번째 설명입니다.\n두 번째 설명입니다.");
    h.synth[0].resolve(new Blob(["first"]));
    await setImmediate();
    h.api.stopSpeakingInternal();
    await run;
    assert.ok(h.synth.every((s) => s.signal.aborted));
    assert.equal(h.audio[0].paused, true);
    assert.equal(h.audio[0].onended, null);
    assert.equal(h.c.cancelPlaybackRef.current, null);
    assert.equal(h.revoked.length, 1);
    assert.equal(h.turns(), 0);
  });
  it("old synthesis or finish cannot release the new generation's resources", async () => {
    const h = harness();
    const old = h.api.speakReply("이전 응답입니다.");
    const oldGen = h.c.ttsGenerationRef.current;
    const next = h.api.speakReply("새 응답입니다.");
    h.synth[1].resolve(new Blob(["new"]));
    await setImmediate();
    h.api.finishSpeaking(oldGen);
    assert.equal(h.audio.length, 1);
    assert.equal(h.audio[0].paused, false);
    assert.equal(h.synth[1].signal.aborted, false);
    h.audio[0].onended?.();
    await Promise.all([old, next]);
    assert.equal(h.turns(), 1);
  });
  it("prefetch failure is handled even while the first audio is still playing", async () => {
    const h = harness();
    const run = h.api.speakReply("첫 번째 설명입니다.\n두 번째 설명입니다.");
    h.synth[0].resolve(new Blob(["first"]));
    await setImmediate();
    h.synth[1].reject(new Error("offline"));
    await setImmediate();
    h.audio[0].onended?.();
    await run;
    assert.equal(h.state(), "idle");
    assert.equal(h.turns(), 1);
  });
  it("voice-off/close cleanup aborts requests and stops tracks", async () => {
    const h = harness();
    const stt = new AbortController();
    const message = new AbortController();
    h.c.sttAbortRef.current = stt;
    h.c.messageAbortRef.current = message;
    const run = h.api.speakReply("설명입니다.");
    h.api.cleanupVoiceResources();
    await run;
    assert.ok(stt.signal.aborted && message.signal.aborted && h.synth[0].signal.aborted);
    assert.equal(h.tracks(), 1);
    assert.equal(h.c.requestEpochRef.current, 1);
    assert.equal(h.state(), "idle");
  });
});
