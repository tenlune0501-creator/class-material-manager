/**
 * Groq LLM 기본 모델이 deprecated/removed 되어 404("model not found")로 죽었을 때만
 * 쓰는 "동일 계열 후속 모델" fallback 로직 — 오류 판별, Models API 조회, 후보 선택,
 * 재시도 오케스트레이션까지 전부 이 파일 하나에 둔다.
 *
 * 일부러 다른 로컬 파일을 전혀 import하지 않는다(GroqQwenProvider는 여기서 안
 * 쓴다 — `./groq-qwen.ts`가 이 모듈을 불러 쓴다). 이유: `node --test`(타입만
 * 벗겨내는 순수 strip 모드)는 확장자 없는 상대 import(`./types` 같은, 이
 * 프로젝트 전체가 Next.js "bundler" 해석 기준으로 쓰는 스타일)를 해석하지 못한다
 * — 그래서 상대 import가 하나도 없는 이 파일만 `tests/tutor-fallback.test.ts`가
 * 그대로 import해 실제 로직을 mock으로 검증할 수 있다. `Response`/`fetch`는 전역
 * DOM 타입이라 import 없이도 쓸 수 있다.
 *
 * fallback을 "시도할지"의 정책(401/429/5xx/network 제외, env override 시 제외)은
 * 호출하는 쪽(groq-qwen.ts)이 `runChatWithFallback`에 넘기는 `allowFallback` /
 * `attempt` 콜백으로 결정한다 — 이 파일은 그 정책을 안다고 가정하지 않는다.
 */

const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

/** 이 Tutor 용도(Chat Completions, 텍스트 과외)와 명백히 맞지 않는 특수 목적 모델. */
const BLOCKED_TOKENS = new Set([
  "vl",
  "vision",
  "embed",
  "embedding",
  "rerank",
  "reranker",
  "guard",
  "safety",
  "audio",
  "whisper",
  "speech",
  "tts",
  "stt",
  "moderation",
  "omni",
  "coder",
  "math",
]);

export interface GroqModelListEntry {
  id: string;
  active?: boolean;
}

export interface QwenModelVersion {
  /** 원본 모델 id, 그대로 반환용. */
  raw: string;
  /** "qwen/qwen3.8-27b" → 3.8 */
  version: number;
  /** "qwen/qwen3.8-27b" → 27 */
  sizeB: number;
}

/** "qwen/qwen<version>-<size>b(-suffix)?" 형태만 이해한다 — 그 외 이름 규칙은 안전하게 포기(null)한다. */
const QWEN_ID_RE = /^qwen\/qwen(\d+(?:\.\d+)?)[a-z]*-(\d+)b(?:[-_][a-z0-9]+)*$/i;

export function parseQwenModelId(id: string): QwenModelVersion | null {
  const match = QWEN_ID_RE.exec(id.trim());
  if (!match) return null;
  const version = Number.parseFloat(match[1]);
  const sizeB = Number.parseInt(match[2], 10);
  if (Number.isNaN(version) || Number.isNaN(sizeB)) return null;
  return { raw: id, version, sizeB };
}

function hasBlockedToken(id: string): boolean {
  const tokens = id.toLowerCase().split(/[^a-z0-9]+/);
  return tokens.some((t) => BLOCKED_TOKENS.has(t));
}

/** "qwen/" 네임스페이스이고, embedding/vision/audio 등 특수 목적 모델이 아니다. */
export function isQwenChatCandidate(id: string): boolean {
  return id.toLowerCase().startsWith("qwen/") && !hasBlockedToken(id);
}

/**
 * 현재(=deprecated된) 모델과 같은 규모(size)의 Qwen 계열 중, 과거 버전으로
 * downgrade하지 않는 가장 가까운 후속 모델을 고른다. 확신할 수 없으면 null —
 * 아무 모델이나 골라 답변 품질을 예측 불가능하게 만들지 않는다(안전 실패 우선).
 */
export function pickFallbackModel(models: GroqModelListEntry[], currentModelId: string): string | null {
  const current = parseQwenModelId(currentModelId);
  if (!current) return null;

  const candidates = models
    .filter((m) => m.active !== false)
    .map((m) => m.id)
    .filter((id) => id !== currentModelId)
    .filter(isQwenChatCandidate)
    .map(parseQwenModelId)
    .filter((v): v is QwenModelVersion => v !== null)
    .filter((v) => v.sizeB === current.sizeB)
    .filter((v) => v.version >= current.version);

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.version - b.version || a.raw.localeCompare(b.raw));
  return candidates[0].raw;
}

export interface GroqErrorBody {
  error?: { code?: string; message?: string };
}

export async function parseGroqErrorBody(res: Response): Promise<GroqErrorBody | undefined> {
  try {
    return (await res.json()) as GroqErrorBody;
  } catch {
    return undefined;
  }
}

/**
 * "이 모델 자체를 더 이상 쓸 수 없음"만 fallback 대상으로 좁힌다 — 실제로 봤던
 * 사례(404, `The model \`qwen/qwen3.6-27b\` does not exist or you do not have
 * access to it.`, OpenAI 호환 `code: "model_not_found"`)를 기준으로 한다.
 * 401/403/429/5xx/네트워크 오류는 이 함수에 오면 안 된다(호출하는 쪽이 먼저 걸러낸다).
 */
export function isModelUnavailableError(
  status: number,
  errorCode: string | undefined,
  errorMessage: string | undefined,
): boolean {
  if (status !== 404) return false;
  if (errorCode === "model_not_found") return true;
  return /does not exist|model[^.]*not found|no longer (available|supported)|has been (decommissioned|deprecated|removed)|model unavailable|access unavailable/i.test(
    errorMessage ?? "",
  );
}

export interface FallbackCacheEntry {
  /** 후속 모델을 못 찾았어도(null) 짧게 캐싱해 /models 재조회를 막는다. */
  model: string | null;
  expiresAt: number;
}

export interface FallbackCache {
  get(): FallbackCacheEntry | undefined;
  set(model: string | null, ttlMs: number): void;
}

/**
 * 프로세스(=Vercel serverless 웜 인스턴스) 안에서만 사는 단순 in-memory 캐시.
 * DB/외부 캐시로 확장하지 않는다 — 콜드 스타트되면 그냥 다시 조회한다.
 */
export function createFallbackCache(): FallbackCache {
  let entry: FallbackCacheEntry | undefined;
  return {
    get() {
      if (!entry || entry.expiresAt <= Date.now()) return undefined;
      return entry;
    },
    set(model, ttlMs) {
      entry = { model, expiresAt: Date.now() + ttlMs };
    },
  };
}

export const FALLBACK_CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchGroqModelIds(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GroqModelListEntry[]> {
  const res = await fetchImpl(GROQ_MODELS_URL, {
    headers: { authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: GroqModelListEntry[] };
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * 캐시를 먼저 보고, 없으면 Models API를 1회 조회해 후속 모델을 고른 뒤 캐싱한다.
 * (실패=null도 캐싱한다 — 기본 모델이 죽어 있는 동안 매 요청마다 /models를 또
 * 부르지 않기 위해서.)
 */
export async function resolveFallbackModel(params: {
  apiKey: string;
  currentModelId: string;
  cache: FallbackCache;
  fetchImpl?: typeof fetch;
}): Promise<string | null> {
  const cached = params.cache.get();
  if (cached) return cached.model;

  const models = await fetchGroqModelIds(params.apiKey, params.fetchImpl ?? fetch);
  const picked = pickFallbackModel(models, params.currentModelId);
  params.cache.set(picked, FALLBACK_CACHE_TTL_MS);
  return picked;
}

// ── 재시도 오케스트레이션 ──────────────────────────────────────────
//
// GroqQwenProvider.chat()이 실제 fetch/파싱을 맡고, 이 함수는 "언제 몇 번
// 재시도할지"의 흐름만 담당한다 — 그래서 실제 네트워크 없이 attempt/resolveFallback
// 콜백만 mock하면 A~H 시나리오(기본 모델 정상 / unavailable / 후속 없음 / 401 /
// 429 / 5xx·network / env override / fallback도 실패)를 전부 검증할 수 있다.

export type ChatOutcome =
  | { ok: true; content: string }
  | { ok: false; status: number; errorCode?: string; errorMessage?: string };

export interface FallbackChatResult {
  content: string;
  /** fallback이 실제로 일어났을 때만 채워진다. */
  usedFallbackModel?: string;
}

export type FallbackChatError =
  /** fallback 대상이 아니었거나(401/429/5xx/network/override), 아예 성공 못한 원본 오류. */
  | { type: "original"; outcome: Extract<ChatOutcome, { ok: false }> }
  /** fallback 대상이었지만 안전하게 고를 후속 모델이 없었다. */
  | { type: "no-candidate" }
  /** 후속 모델로 1회 재시도했지만 그것도 실패했다. */
  | { type: "fallback-failed"; outcome: Extract<ChatOutcome, { ok: false }> };

export async function runChatWithFallback(params: {
  defaultModel: string;
  /** GROQ_LLM_MODEL로 사용자가 명시 override한 경우 false — 그 의도를 존중해 fallback하지 않는다. */
  allowFallback: boolean;
  attempt: (model: string) => Promise<ChatOutcome>;
  resolveFallback: () => Promise<string | null>;
}): Promise<{ ok: true; result: FallbackChatResult } | { ok: false; error: FallbackChatError }> {
  const first = await params.attempt(params.defaultModel);
  if (first.ok) return { ok: true, result: { content: first.content } };

  if (params.allowFallback && isModelUnavailableError(first.status, first.errorCode, first.errorMessage)) {
    const fallbackModel = await params.resolveFallback();
    if (!fallbackModel) {
      return { ok: false, error: { type: "no-candidate" } };
    }

    const retry = await params.attempt(fallbackModel);
    if (retry.ok) {
      return { ok: true, result: { content: retry.content, usedFallbackModel: fallbackModel } };
    }
    return { ok: false, error: { type: "fallback-failed", outcome: retry } };
  }

  return { ok: false, error: { type: "original", outcome: first } };
}
