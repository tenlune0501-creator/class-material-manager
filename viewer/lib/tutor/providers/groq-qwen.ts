/**
 * GroqQwenProvider — LLMProvider 구현체.
 *
 * Groq 의 OpenAI 호환 Chat Completions 엔드포인트를 쓴다. 모델 id 는 실제 Groq 문서
 * (console.groq.com/docs/models, 2026-09 확인)에 있는 값을 그대로 기본값으로 둔다 —
 * `qwen/qwen3.8-27b` (preview, tool calling 지원, 131K context, non-thinking/thinking
 * 모드 전환 가능). 과거 이름을 기억만으로 하드코딩하지 않았다.
 *
 * API 키는 이 파일(서버 전용 모듈, "use server" 경계인 app/api/tutor/** 에서만 import)
 * 밖으로 나가지 않는다 — 브라우저 번들에 절대 포함되지 않는다.
 *
 * ■ Preview 모델 deprecated 대응 — 동일 계열 후속 모델 자동 fallback
 *
 * `qwen/qwen3.6-27b` → 404("model not found")로 죽었던 사고 이후 추가했다. 정상
 * 상태에서는 이 기본값(DEFAULT_MODEL) 그대로만 쓰고 `/models` 조회조차 하지 않는다
 * — "모델 자체를 쓸 수 없음"(404 + model_not_found류 메시지)으로 확인된 경우에만
 * `./groq-fallback.ts` 로 후속 Qwen 모델을 찾아 **이번 요청 한정으로 1회만**
 * 재시도한다(재시도 흐름 자체는 `runChatWithFallback`이 담당 — 실제 fetch 없이
 * mock으로 A~H 전 시나리오를 검증할 수 있다, `tests/tutor-fallback.test.ts` 참고).
 * 401/429/5xx/network 오류는 절대 대상이 아니다. `GROQ_LLM_MODEL` 로 사용자가
 * 모델을 명시적으로 지정했다면(=env override) 그 의도를 존중해 fallback을 하지
 * 않고 오류를 그대로 낸다 — DEFAULT_MODEL을 쓰는 경우에만 자동 fallback 대상이다.
 * fallback은 런타임 장애 복구일 뿐이라 DEFAULT_MODEL 소스, .env* 파일을 자동으로
 * 고치지 않는다(사람이 확인한 뒤 별도 작업으로 영구 변경한다).
 */
import { LLMMessage, LLMProvider, LLMReply, ProviderError } from "./types";
import {
  createFallbackCache,
  parseGroqErrorBody,
  resolveFallbackModel,
  runChatWithFallback,
  type ChatOutcome,
  type FallbackCache,
} from "./groq-fallback";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "qwen/qwen3.8-27b";
const DEFAULT_REASONING_EFFORT = "none"; // 과외 대화는 저지연 우선 — 필요하면 env로 "default"

/** 모듈 스코프 — 같은 웜 serverless 인스턴스에서 여러 요청이 이 캐시를 공유한다. */
const fallbackCache: FallbackCache = createFallbackCache();

export class GroqQwenProvider implements LLMProvider {
  readonly name = "groq-qwen";

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.GROQ_LLM_MODEL || DEFAULT_MODEL,
    private readonly reasoningEffort: string = process.env.GROQ_REASONING_EFFORT || DEFAULT_REASONING_EFFORT,
    /** GROQ_LLM_MODEL로 명시 override된 경우 false — 사용자 의도를 존중해 fallback하지 않는다. */
    private readonly allowFallback: boolean = !process.env.GROQ_LLM_MODEL,
  ) {}

  private async attemptChat(messages: LLMMessage[], model: string): Promise<ChatOutcome> {
    let res: Response;
    try {
      res = await fetch(GROQ_CHAT_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
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
      const body = await parseGroqErrorBody(res);
      return { ok: false, status: res.status, errorCode: body?.error?.code, errorMessage: body?.error?.message };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new ProviderError("Groq LLM 응답이 비어 있습니다.", "unknown", true);
    }
    return { ok: true, content };
  }

  async chat(messages: LLMMessage[]): Promise<LLMReply> {
    const outcome = await runChatWithFallback({
      defaultModel: this.model,
      allowFallback: this.allowFallback,
      attempt: (model) => this.attemptChat(messages, model),
      resolveFallback: () =>
        resolveFallbackModel({ apiKey: this.apiKey, currentModelId: this.model, cache: fallbackCache }),
    });

    if (outcome.ok) return outcome.result;

    if (outcome.error.type === "no-candidate") {
      throw new ProviderError(
        "기본 AI 모델을 사용할 수 없고, 안전하게 전환할 후속 모델도 찾지 못했습니다. 잠시 후 다시 시도하거나 관리자에게 문의하세요.",
        "bad_request",
        false,
      );
    }

    throw classifyProviderError(outcome.error.outcome, "LLM");
  }
}

/** 이미 상태코드/메시지를 알고 있을 때(응답 스트림을 두 번 읽지 않기 위해)의 공통 분류. */
function classifyProviderError(
  outcome: { status: number; errorMessage?: string },
  label: string,
): ProviderError {
  const detail = outcome.errorMessage ?? "";

  if (outcome.status === 401 || outcome.status === 403) {
    return new ProviderError(`${label} 인증에 실패했습니다. API 키를 확인하세요.`, "auth", false);
  }
  if (outcome.status === 429) {
    return new ProviderError(
      `${label} 사용량 한도(429)에 도달했습니다. 잠시 후 다시 시도하세요.`,
      "rate_limit",
      true,
    );
  }
  if (outcome.status >= 500) {
    return new ProviderError(`${label} 서버 오류(${outcome.status}). 잠시 후 다시 시도하세요.`, "server", true);
  }
  return new ProviderError(
    `${label} 요청이 거부됐습니다(${outcome.status}). ${detail}`.trim(),
    "bad_request",
    false,
  );
}

/** groq-whisper.ts 등 다른 Provider가 쓰는 공개 진입점 — 오류 본문을 아직 안 읽었을 때. */
export async function toProviderError(res: Response, label: string): Promise<ProviderError> {
  const body = await parseGroqErrorBody(res);
  return classifyProviderError({ status: res.status, errorMessage: body?.error?.message }, label);
}
