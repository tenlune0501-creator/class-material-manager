/**
 * GroqQwenProvider — LLMProvider 구현체.
 *
 * Groq 의 OpenAI 호환 Chat Completions 엔드포인트를 쓴다. 모델 id 는 실제 Groq 문서
 * (console.groq.com/docs/models, 2026-09 확인)에 있는 값을 그대로 기본값으로 둔다 —
 * `qwen/qwen3.6-27b` (preview, tool calling 지원, 131K context, non-thinking/thinking
 * 모드 전환 가능). 과거 이름을 기억만으로 하드코딩하지 않았다.
 *
 * API 키는 이 파일(서버 전용 모듈, "use server" 경계인 app/api/tutor/** 에서만 import)
 * 밖으로 나가지 않는다 — 브라우저 번들에 절대 포함되지 않는다.
 */
import { LLMMessage, LLMProvider, LLMReply, ProviderError } from "./types";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "qwen/qwen3.6-27b";
const DEFAULT_REASONING_EFFORT = "none"; // 과외 대화는 저지연 우선 — 필요하면 env로 "default"

export class GroqQwenProvider implements LLMProvider {
  readonly name = "groq-qwen";

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.GROQ_LLM_MODEL || DEFAULT_MODEL,
    private readonly reasoningEffort: string = process.env.GROQ_REASONING_EFFORT || DEFAULT_REASONING_EFFORT,
  ) {}

  async chat(messages: LLMMessage[]): Promise<LLMReply> {
    let res: Response;
    try {
      res = await fetch(GROQ_CHAT_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.6,
          max_tokens: 900,
          reasoning_effort: this.reasoningEffort,
        }),
      });
    } catch {
      throw new ProviderError("Groq API에 연결하지 못했습니다.", "network", true);
    }

    if (!res.ok) {
      throw await toProviderError(res, "LLM");
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new ProviderError("Groq LLM 응답이 비어 있습니다.", "unknown", true);
    }
    return { content };
  }
}

export async function toProviderError(res: Response, label: string): Promise<ProviderError> {
  let detail = "";
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    detail = body.error?.message ?? "";
  } catch {
    // 본문이 JSON이 아니어도 상태 코드만으로 분류한다.
  }

  if (res.status === 401 || res.status === 403) {
    return new ProviderError(`${label} 인증에 실패했습니다. API 키를 확인하세요.`, "auth", false);
  }
  if (res.status === 429) {
    return new ProviderError(
      `${label} 사용량 한도(429)에 도달했습니다. 잠시 후 다시 시도하세요.`,
      "rate_limit",
      true,
    );
  }
  if (res.status >= 500) {
    return new ProviderError(`${label} 서버 오류(${res.status}). 잠시 후 다시 시도하세요.`, "server", true);
  }
  return new ProviderError(`${label} 요청이 거부됐습니다(${res.status}). ${detail}`.trim(), "bad_request", false);
}
