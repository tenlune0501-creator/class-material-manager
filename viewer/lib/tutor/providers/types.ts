/**
 * AI Tutor Provider 경계 — LLM/STT/TTS 를 나중에 갈아 끼울 수 있게 인터페이스로 둔다.
 *
 * ■ 이번 범위
 *
 * 실제 구현은 GroqQwenProvider / GroqWhisperProvider / MeloTTSProvider 셋뿐이다.
 * 다른 Provider(OpenAI, Local LLM, Piper 등)는 이번에 구현하지 않는다 — 이 인터페이스가
 * 그 확장의 "경계"만 미리 둔다. 복잡한 DI 프레임워크는 쓰지 않는다 — 함수형 팩토리
 * (`getLLMProvider()` 등, `providers/index.ts`)로 충분하다.
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMReply {
  content: string;
}

export type ProviderErrorKind = "auth" | "rate_limit" | "bad_request" | "network" | "server" | "unknown";

/** Provider 오류를 화면에서 구분해 보여줄 수 있도록 종류를 붙인다 (429 안내, 재시도 가능 여부 등). */
export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;
  readonly retryable: boolean;

  constructor(message: string, kind: ProviderErrorKind, retryable: boolean) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.retryable = retryable;
  }
}

export interface LLMProvider {
  readonly name: string;
  chat(messages: LLMMessage[]): Promise<LLMReply>;
}

export interface STTProvider {
  readonly name: string;
  /** audio: 녹음된 오디오 파일 원본 바이트. mimeType 은 브라우저 MediaRecorder 가 준 값 그대로. */
  transcribe(audio: Buffer, mimeType: string, filename: string): Promise<{ text: string }>;
}

/** 브라우저에서 직접 로컬 컴패니언을 호출하는 쪽이라 서버 코드에서는 쓰지 않는다 (client 전용). */
export interface TTSProvider {
  readonly name: string;
  synthesize(text: string): Promise<Blob>;
}
