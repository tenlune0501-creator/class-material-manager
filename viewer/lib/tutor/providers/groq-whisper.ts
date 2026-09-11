/**
 * GroqWhisperProvider — STTProvider 구현체.
 *
 * Groq 의 OpenAI 호환 오디오 전사 엔드포인트(`/openai/v1/audio/transcriptions`)를 쓴다.
 * 기본 모델은 `whisper-large-v3-turbo`(2026-09 기준 Groq 문서에 있는 실제 production 모델
 * id) — 지연이 짧아 대화형 과외에 맞다. 더 정확한 `whisper-large-v3` 로 바꾸려면
 * GROQ_STT_MODEL 환경변수를 쓴다.
 *
 * language를 "ko" 로 고정한다 — 이 프로젝트는 한국어 음성 과외만 다룬다.
 */
import { ProviderError, STTProvider } from "./types";
import { toProviderError } from "./groq-qwen";

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const DEFAULT_MODEL = "whisper-large-v3-turbo";

export class GroqWhisperProvider implements STTProvider {
  readonly name = "groq-whisper";

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.GROQ_STT_MODEL || DEFAULT_MODEL,
  ) {}

  async transcribe(audio: Buffer, mimeType: string, filename: string): Promise<{ text: string }> {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(audio)], { type: mimeType }), filename);
    form.append("model", this.model);
    form.append("language", "ko");
    form.append("response_format", "json");

    let res: Response;
    try {
      res = await fetch(GROQ_TRANSCRIBE_URL, {
        method: "POST",
        headers: { authorization: `Bearer ${this.apiKey}` },
        body: form,
      });
    } catch {
      throw new ProviderError("Groq Whisper API에 연결하지 못했습니다.", "network", true);
    }

    if (!res.ok) {
      throw await toProviderError(res, "STT");
    }

    const data = (await res.json()) as { text?: string };
    return { text: (data.text ?? "").trim() };
  }
}
