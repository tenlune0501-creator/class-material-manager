/** Execute the actual TutorApp function bodies with deterministic browser doubles.
 * This checks async ownership, not real microphone/echo quality or React rendering. */
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { setImmediate } from "node:timers/promises";
import { describe, it } from "node:test";
import ts from "typescript";
import { chunkTextForSpeech } from "../viewer/lib/tutor/tts-chunking.ts";
import { recordingFilename, recordingMime, MAX_STT_AUDIO_BYTES, AUDIO_TOO_LARGE } from "../viewer/lib/tutor/recording.ts";
import { readTutorResponse } from "../viewer/lib/tutor/response.ts";
import { validTranscript } from "../viewer/lib/tutor/transcript-validation.ts";

const source = await readFile("viewer/components/tutor/TutorApp.tsx", "utf8");
const tree = ts.createSourceFile("TutorApp.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const app = tree.statements.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "TutorApp") as ts.FunctionDeclaration;
const names = ["stopSpeakingInternal", "speakReply", "cleanupVoiceResources"];
const code = app.body!.statements.filter((n) => ts.isFunctionDeclaration(n) && names.includes(n.name!.text)).map((n) => n.getText(tree)).join("\n");
const js = ts.transpileModule(`${code}\n({${names.join(",")}})`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

const adapterSource = (await readFile("viewer/lib/tutor/speech-output.ts", "utf8")).replace(/^import .*;$/gm, "").replace(/export /g, "");
const adapterJs = ts.transpileModule(adapterSource + "\n({ BlobSpeechOutput, BrowserSpeechOutput, koreanVoice })", { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

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
    static isTypeSupported() { return true; }
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
    fetch: async () => { requests++; if (fail) throw new Error("offline"); return { ok: true, headers: new Headers({ "content-type": "application/json" }), json: async () => pendingResponse ? await pendingResponse : { text: transcript } }; },
    setTimeout: (fn: () => void) => { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout: (id: number) => { timers.delete(id); },
    MediaRecorder: FakeRecorder, Blob, FormData, AbortController, DOMException, validTranscript,
    recordingFilename, recordingMime, MAX_STT_AUDIO_BYTES, AUDIO_TOO_LARGE, readTutorResponse, setMicPending: () => {},
  };
  const api = runInNewContext(micJs, c) as {
    transcribeAndSend: (blob: Blob, epoch: number) => Promise<void>;
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
  it("rejects oversized audio before fetch, without a recording duration timer", async () => {
    const h = micHarness();
    await h.api.transcribeAndSend(new Blob([new Uint8Array(MAX_STT_AUDIO_BYTES + 1)], { type: "audio/webm" }), 0);
    assert.equal(h.requests(), 0);
    assert.equal(h.error(), AUDIO_TOO_LARGE);
    assert.equal(h.c.voiceStateRef.current, "idle");
    assert.equal(h.timers.size, 0);
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
  let notice: string | null = null;
  const diagnostics: unknown[][] = [];
  const c = {
    activeRef: ref(true), mobileRef: ref(false), mountedRef: ref(true), activeSpeechRef: ref<unknown>(null), browserSpeechRef: ref(null), blobSpeech: null as unknown, voiceOnRef: ref(true), ttsGenerationRef: ref(0),
    ttsAbortRef: ref<AbortController | null>(null), sttAbortRef: ref<AbortController | null>(null), messageAbortRef: ref<AbortController | null>(null),
    cancelPlaybackRef: ref<(() => void) | null>(null), audioRef: ref<FakeAudio | null>(null), activeObjectUrlRef: ref<string | null>(null),
    latencyRef: ref<unknown>(null), requestEpochRef: ref(0),
    streamRef: ref<unknown>({ getTracks: () => [{ stop: () => { tracksStopped++; } }] }),
    mediaRecorderRef: ref<unknown>(null),
    setVoiceState: (s: string) => { state = s; },
    endAssistantTurn: () => { state = "idle"; turns++; },
    setMicStream: () => {}, setTtsNotice: (value: string | null) => { notice = value; }, markLatency: () => {},
    console: { warn: (...args: unknown[]) => diagnostics.push(args) },
    chunkTextForSpeech, performance, AbortController, DOMException, Error, Blob, Audio: FakeAudio,
    URL: { createObjectURL: () => `blob:${audio.length}`, revokeObjectURL: (url: string) => revoked.push(url) },
    setTimeout: () => 1, clearTimeout: () => {},
    tts: { synthesize: (text: string, opts: { signal: AbortSignal }) => new Promise<Blob>((resolve, reject) => {
      synth.push({ text, signal: opts.signal, resolve, reject });
      opts.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    }) },
  };
  const adapters = runInNewContext(adapterJs, c);
  c.blobSpeech = new adapters.BlobSpeechOutput(c.tts);
  const api = runInNewContext(js, c) as {
    speakReply: (text: string) => Promise<void>;
    stopSpeakingInternal: () => void;
    cleanupVoiceResources: () => void;
    finishSpeaking: (generation: number) => void;
  };
  return { api, c, synth, audio, revoked, diagnostics, notice: () => notice, state: () => state, turns: () => turns, tracks: () => tracksStopped };
}

describe("Tutor TTS async lifecycle", () => {
  it("middle 502 stops the queue, reports metadata only and never replays a successful chunk", async () => {
    const h = harness();
    const run = h.api.speakReply('첫 번째 설명입니다.\n두 번째 설명입니다.\n세 번째 설명입니다.');
    h.synth[0].resolve(new Blob(['first']));
    await setImmediate();
    const error = Object.assign(new Error('MeloTTS 합성 실패 (502)'), {status:502});
    h.synth[1].reject(error);
    await setImmediate();
    h.audio[0].onended?.();
    await run;
    assert.equal(h.synth.length, 2);
    assert.equal(h.audio.length, 1);
    assert.equal(h.state(), 'idle');
    assert.equal(h.turns(), 1);
    assert.equal(h.diagnostics.length, 1);
    assert.deepEqual(JSON.parse(JSON.stringify(h.diagnostics[0][1])), {chunk:2,total:3,chars:11,category:'upstream_http',status:502,retries:0});
    assert.ok(!JSON.stringify(h.diagnostics).includes('두 번째 설명'));
    assert.equal(h.notice(), 'MeloTTS 합성 실패 (502)');
  });
  it("a later explicit speech call can succeed after 502 without stale queued audio", async () => {
    const h = harness();
    const failed = h.api.speakReply('실패한 설명입니다.');
    h.synth[0].reject(new Error('MeloTTS 합성 실패 (502)'));
    await failed;
    const next = h.api.speakReply('다음 설명입니다.');
    h.synth[1].resolve(new Blob(['next']));
    await setImmediate();
    h.audio[0].onended?.();
    await next;
    assert.equal(h.synth.length, 2); // no automatic retry of deterministic input
    assert.equal(h.audio.length, 1);
    assert.equal(h.notice(), null);
    assert.equal(h.state(), 'idle');
  });
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
    await old; // stale completion must not clear the new turn
    assert.notEqual(h.c.ttsGenerationRef.current, oldGen);
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

function browserHarness(voices = [{ lang: "ko-KR", localService: true, default: false }]) {
  const utterances: any[] = [];
  let cancels = 0;
  const synthesis = { getVoices: () => voices, cancel: () => { cancels++; }, speak: (u: any) => utterances.push(u) };
  const { BrowserSpeechOutput, koreanVoice } = runInNewContext(adapterJs, { chunkTextForSpeech, DOMException, AbortController, setTimeout, clearTimeout });
  const output = new BrowserSpeechOutput(synthesis, (text: string) => ({ text }));
  return { output, utterances, cancels: () => cancels, koreanVoice };
}

describe("browser SpeechOutput contract (mock speech, not hardware quality)", () => {
  it("selects Korean local voice and completes all bounded chunks sequentially", async () => {
    const h = browserHarness();
    const run = h.output.speak("첫 번째 설명입니다.\n두 번째 설명입니다.", new AbortController().signal);
    assert.equal(h.utterances.length, 1);
    assert.equal(h.utterances[0].lang, "ko-KR");
    h.utterances[0].onend();
    await setImmediate();
    assert.equal(h.utterances.length, 2);
    h.utterances[1].onend();
    await run;
    assert.equal(h.utterances[0].onend, null);
  });
  it("missing Korean voice is explicit and never selects an English substitute", async () => {
    const h = browserHarness([{ lang: "en-US", localService: true, default: true }]);
    await assert.rejects(h.output.speak("안녕하세요", new AbortController().signal), /한국어/);
    assert.equal(h.utterances.length, 0);
  });
  it("abort settles speech and stale completion cannot advance its queue", async () => {
    const h = browserHarness();
    const abort = new AbortController();
    const run = h.output.speak("첫 번째 설명입니다.\n두 번째 설명입니다.", abort.signal);
    const stale = h.utterances[0].onend;
    const rejected = assert.rejects(run, { name: "AbortError" });
    abort.abort();
    stale();
    await rejected;
    assert.equal(h.utterances.length, 1);
    assert.equal(h.cancels(), 1);
  });
  it("direct cancellation between chunks cannot start another utterance", async () => {
    const h = browserHarness();
    const run = h.output.speak("첫 번째 설명입니다.\n두 번째 설명입니다.", new AbortController().signal);
    const rejected = assert.rejects(run, { name: "AbortError" });
    h.utterances[0].onend();
    h.output.cancel();
    await rejected;
    assert.equal(h.utterances.length, 1);
  });
  it("old end/error callbacks cannot finish a newer utterance", async () => {
    const h = browserHarness();
    const old = h.output.speak("이전 설명입니다.", new AbortController().signal);
    const stale = h.utterances[0].onend;
    const rejected = assert.rejects(old, { name: "AbortError" });
    const next = h.output.speak("새 설명입니다.", new AbortController().signal);
    stale();
    assert.ok(h.utterances[1].onend);
    h.utterances[1].onend();
    await Promise.all([rejected, next]);
  });
  it("speech errors settle instead of locking the controller", async () => {
    const h = browserHarness();
    const run = h.output.speak("설명입니다.", new AbortController().signal);
    const rejected = assert.rejects(run, /브라우저 음성/);
    h.utterances[0].onerror();
    await rejected;
    assert.equal(h.utterances[0].onend, null);
  });
});
const sendCode = app.body!.statements.filter((n) => ts.isFunctionDeclaration(n) && n.name?.text === 'handleSend').map(n=>n.getText(tree)).join('\n');
const sendJs = ts.transpileModule(sendCode+'\n({handleSend})',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
describe('LLM late response ownership',()=>{
 it('ignores a late reply after cancellation even when transport ignores AbortSignal',async()=>{
  let resolve!:(v:Response)=>void;let spoken=0;let messages:any[]=[];
  const c:any={input:'질문',activeRef:{current:true},viewRef:{current:'chat'},sessionIdRef:{current:'session'},messagesRef:{current:[]},voiceStateRef:{current:'idle'},handleStartCallIdRef:{current:1},requestEpochRef:{current:1},messageAbortRef:{current:null},mountedRef:{current:true},
   AbortController,readTutorResponse,END_INTENT_PATTERN:/종료/,setTimeout,clearTimeout,
   fetch:()=>new Promise(r=>resolve=r),setInput(){},setError(){},setShowEndConfirm(){},setFallbackNotice(){},setMessages:(v:any)=>{messages=typeof v==='function'?v(messages):v;},setVoiceState:(v:string)=>c.voiceStateRef.current=v,speakReply:()=>{spoken++;},stopSpeakingInternal(){}
  };
  const api=runInNewContext(sendJs,c);const run=api.handleSend();
  c.requestEpochRef.current++;c.messageAbortRef.current.abort();
  resolve(Response.json({reply:'늦은 응답'}));await run;
  assert.equal(spoken,0);assert.equal(messages.length,1);assert.equal(messages[0].role,'user');
 });
});
