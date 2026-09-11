/**
 * 서버 전용 Provider 팩토리. GROQ_API_KEY 가 없으면 null을 돌려주고,
 * 부르는 쪽(app/api/tutor/**)이 "Tutor를 쓰려면 키가 필요하다" 안내로 처리한다.
 */
import { GroqQwenProvider } from "./groq-qwen";
import { GroqWhisperProvider } from "./groq-whisper";
import { LLMProvider, STTProvider } from "./types";

export function getLLMProvider(): LLMProvider | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new GroqQwenProvider(apiKey);
}

export function getSTTProvider(): STTProvider | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new GroqWhisperProvider(apiKey);
}

export { ProviderError } from "./types";
export type { LLMMessage, LLMReply } from "./types";
