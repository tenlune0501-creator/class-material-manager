import { chunkTextForSpeech } from "./tts-chunking";
import type { TTSProvider } from "./providers/types";

/** A turn completes only after playback ends. Cancellation must settle pending work. */
export interface SpeechOutput {
  speak(text: string, signal: AbortSignal): Promise<void>;
  cancel(): void;
}

function aborted(): DOMException { return new DOMException("Speech cancelled", "AbortError"); }

/** Existing MeloTTS path: first chunk immediately, next chunk prefetched during playback. */
export class BlobSpeechOutput implements SpeechOutput {
  private cancelCurrent: (() => void) | null = null;
  constructor(private readonly provider: TTSProvider) {}
  cancel() { this.cancelCurrent?.(); }

  async speak(text: string, signal: AbortSignal): Promise<void> {
    this.cancel();
    if (signal.aborted) throw aborted();
    const controller = new AbortController();
    const cancel = () => controller.abort();
    this.cancelCurrent = cancel;
    signal.addEventListener("abort", cancel, { once: true });
    const timeout = setTimeout(cancel, 180_000);
    const chunks = chunkTextForSpeech(text);
    const blobPromises = new Map<number, Promise<Blob>>();
    const getBlob = (index: number) => {
      if (index >= chunks.length) return;
      if (!blobPromises.has(index)) {
        const promise = this.provider.synthesize(chunks[index], { signal: controller.signal });
        void promise.catch(() => {}); // prefetch may fail before it is awaited
        blobPromises.set(index, promise);
      }
      return blobPromises.get(index)!;
    };
    try {
      getBlob(0);
      for (let index = 0; index < chunks.length; index++) {
        if (controller.signal.aborted) throw aborted();
        const blob = await abortable(getBlob(index)!, controller.signal);
        if (controller.signal.aborted) throw aborted();
        const playback = playBlob(blob, controller.signal);
        getBlob(index + 1);
        await playback;
        blobPromises.delete(index);
      }
    } finally {
      clearTimeout(timeout);
      controller.abort();
      signal.removeEventListener("abort", cancel);
      if (this.cancelCurrent === cancel) this.cancelCurrent = null;
    }
  }
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const cancel = () => reject(aborted());
    if (signal.aborted) return cancel();
    signal.addEventListener("abort", cancel, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", cancel));
  });
}

function playBlob(blob: Blob, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(aborted());
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      signal.removeEventListener("abort", cancel);
      audio.onended = audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(url);
      if (error) reject(error); else resolve();
    };
    const cancel = () => finish(aborted());
    const watchdog = setTimeout(() => finish(new Error("음성 재생 시간이 초과됐습니다.")), 120_000);
    signal.addEventListener("abort", cancel, { once: true });
    audio.onended = () => finish();
    audio.onerror = () => finish(new Error("음성을 재생할 수 없습니다."));
    audio.play().catch(() => finish(new Error("음성 재생을 허용한 뒤 다시 시도해 주세요.")));
  });
}

export function koreanVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return [...voices].filter((voice) => /^ko(?:[-_]|$)/i.test(voice.lang))
    .sort((a, b) => Number(b.localService) - Number(a.localService) || Number(b.default) - Number(a.default))[0];
}

/** Direct browser playback; no server credential, Blob or PC localhost dependency. */
export class BrowserSpeechOutput implements SpeechOutput {
  private generation = 0;
  private cancelCurrent: (() => void) | null = null;
  constructor(private readonly synthesis: SpeechSynthesis,
    private readonly utterance: (text: string) => SpeechSynthesisUtterance = (text) => new SpeechSynthesisUtterance(text)) {}
  cancel() { this.generation++; this.cancelCurrent?.(); }
  async speak(text: string, signal: AbortSignal): Promise<void> {
    this.cancel();
    const generation = this.generation;
    if (signal.aborted) throw aborted();
    const voice = koreanVoice(this.synthesis.getVoices());
    if (!voice) throw new Error("한국어 음성을 찾을 수 없습니다. 기기의 한국어 음성을 확인하거나 텍스트로 계속해 주세요.");
    // Bounded utterances also avoid browser-specific long-utterance stalls.
    const chunks = chunkTextForSpeech(text);
    for (const chunk of chunks) {
      if (signal.aborted || generation !== this.generation) throw aborted();
      await new Promise<void>((resolve, reject) => {
        const utterance = this.utterance(chunk);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        let settled = false;
        const finish = (error?: Error) => {
          if (settled) return;
          settled = true;
          clearTimeout(watchdog);
          signal.removeEventListener("abort", cancel);
          utterance.onend = utterance.onerror = null;
          if (this.cancelCurrent === cancel) this.cancelCurrent = null;
          if (error) reject(error); else resolve();
        };
        const cancel = () => { finish(aborted()); this.synthesis.cancel(); };
        const watchdog = setTimeout(() => { finish(new Error("음성 응답이 멈췄습니다. 다시 재생하거나 텍스트로 확인해 주세요.")); this.synthesis.cancel(); }, 120_000);
        this.cancelCurrent = cancel;
        signal.addEventListener("abort", cancel, { once: true });
        utterance.onend = () => finish();
        utterance.onerror = () => finish(new Error("브라우저 음성을 재생할 수 없습니다. 음성 다시 듣기를 누르거나 텍스트로 확인해 주세요."));
        try { this.synthesis.speak(utterance); } catch { finish(new Error("브라우저 음성 재생을 시작할 수 없습니다.")); }
      });
    }
  }
}
