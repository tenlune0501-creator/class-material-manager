/**
 * Groq 기본 LLM 모델이 deprecated/removed(404)될 때만 도는 "동일 계열 후속 모델"
 * fallback 로직 검증 — `viewer/lib/tutor/providers/groq-fallback.ts`.
 *
 * 이 파일만 실제 로직을 **import해서 mock으로 직접** 검증한다(다른 tutor 관련
 * 테스트는 viewer-tutor.test.ts처럼 소스 텍스트 정적 검사에 의존하는데, groq-qwen.ts
 * 자체는 이 프로젝트 전체가 쓰는 확장자 없는 상대 import 스타일 때문에 `node --test`
 * 순수 type-stripping으로 직접 import할 수 없다 — groq-fallback.ts는 상대 import가
 * 하나도 없는 자립 모듈이라 예외적으로 가능하다).
 *
 * Models API/Chat API 모두 실제 네트워크를 타지 않는다 — attempt/resolveFallback/
 * fetchImpl 전부 이 파일이 주입하는 mock이다. 실제 Groq 사용량 검증은
 * tests/live/groq-live.test.ts(정상 모델 확인용)가 그대로 담당한다.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  createFallbackCache,
  fetchGroqModelIds,
  isModelUnavailableError,
  isQwenChatCandidate,
  parseQwenModelId,
  pickFallbackModel,
  resolveFallbackModel,
  runChatWithFallback,
  type ChatOutcome,
  type GroqModelListEntry,
} from "../viewer/lib/tutor/providers/groq-fallback.ts";

const CURRENT = "qwen/qwen3.8-27b";

// ── parseQwenModelId / isQwenChatCandidate ──────────────────────────

describe("parseQwenModelId", () => {
  it("qwen/qwen<version>-<size>b 형태를 해석한다", () => {
    assert.deepEqual(parseQwenModelId("qwen/qwen3.8-27b"), { raw: "qwen/qwen3.8-27b", version: 3.8, sizeB: 27 });
    assert.deepEqual(parseQwenModelId("qwen/qwen3-32b"), { raw: "qwen/qwen3-32b", version: 3, sizeB: 32 });
  });

  it("접미사가 붙어도 해석한다", () => {
    const parsed = parseQwenModelId("qwen/qwen4.1-27b-preview");
    assert.equal(parsed?.version, 4.1);
    assert.equal(parsed?.sizeB, 27);
  });

  it("이 규칙에 맞지 않으면 null(안전 실패)", () => {
    assert.equal(parseQwenModelId("openai/gpt-oss-20b"), null);
    assert.equal(parseQwenModelId("qwen/qwen-embedding-4b"), null);
    assert.equal(parseQwenModelId("llama-3.1-70b"), null);
  });
});

describe("isQwenChatCandidate", () => {
  it("qwen/ 네임스페이스만 후보로 본다", () => {
    assert.equal(isQwenChatCandidate("qwen/qwen4.0-27b"), true);
    assert.equal(isQwenChatCandidate("meta/llama-4-27b"), false);
  });

  it("embedding/vision/audio/coder 등 특수 목적 모델은 제외한다", () => {
    assert.equal(isQwenChatCandidate("qwen/qwen3-vl-32b"), false, "vision");
    assert.equal(isQwenChatCandidate("qwen/qwen-embedding-4b"), false, "embedding");
    assert.equal(isQwenChatCandidate("qwen/qwen3-coder-32b"), false, "coder");
    assert.equal(isQwenChatCandidate("qwen/qwen-audio-7b"), false, "audio");
    assert.equal(isQwenChatCandidate("qwen/qwen3-guard-8b"), false, "guard");
  });
});

// ── pickFallbackModel ────────────────────────────────────────────────

describe("pickFallbackModel", () => {
  it("같은 규모(size)의 가장 가까운 후속 버전을 고른다", () => {
    const models: GroqModelListEntry[] = [
      { id: "qwen/qwen3.9-27b" },
      { id: "qwen/qwen4.2-27b" },
      { id: "qwen/qwen3.8-32b" }, // 크기 다름 — 제외
    ];
    assert.equal(pickFallbackModel(models, CURRENT), "qwen/qwen3.9-27b");
  });

  it("과거 버전으로 downgrade하지 않는다", () => {
    const models: GroqModelListEntry[] = [{ id: "qwen/qwen3.5-27b" }, { id: "qwen/qwen2.0-27b" }];
    assert.equal(pickFallbackModel(models, CURRENT), null);
  });

  it("특수 목적 모델(같은 size라도)은 후보에서 뺀다", () => {
    const models: GroqModelListEntry[] = [{ id: "qwen/qwen4.0-coder-27b" }, { id: "qwen/qwen4.0-vl-27b" }];
    assert.equal(pickFallbackModel(models, CURRENT), null);
  });

  it("active: false 로 표시된 모델은 제외한다", () => {
    const models: GroqModelListEntry[] = [{ id: "qwen/qwen3.9-27b", active: false }];
    assert.equal(pickFallbackModel(models, CURRENT), null);
  });

  it("현재 모델 id 자체는 후보에서 제외한다", () => {
    const models: GroqModelListEntry[] = [{ id: CURRENT }];
    assert.equal(pickFallbackModel(models, CURRENT), null);
  });

  it("현재 모델 id를 이 규칙으로 해석할 수 없으면(커스텀 override 등) 아무것도 고르지 않는다", () => {
    const models: GroqModelListEntry[] = [{ id: "qwen/qwen4.0-27b" }];
    assert.equal(pickFallbackModel(models, "my-custom-model"), null);
  });

  it("동일 규모 후보가 여럿이면 가장 낮은(=가장 가까운) 후속 버전을 고른다", () => {
    const models: GroqModelListEntry[] = [{ id: "qwen/qwen4.5-27b" }, { id: "qwen/qwen3.9-27b" }];
    assert.equal(pickFallbackModel(models, CURRENT), "qwen/qwen3.9-27b");
  });
});

// ── isModelUnavailableError ──────────────────────────────────────────

describe("isModelUnavailableError", () => {
  it("404 + code=model_not_found 는 fallback 대상이다", () => {
    assert.equal(isModelUnavailableError(404, "model_not_found", "아무 메시지"), true);
  });

  it("404 + 실제 Groq 오류 메시지(코드 없이도)는 fallback 대상이다", () => {
    assert.equal(
      isModelUnavailableError(404, undefined, "The model `qwen/qwen3.6-27b` does not exist or you do not have access to it."),
      true,
    );
  });

  it("404여도 모델과 무관한 메시지면 fallback 대상이 아니다", () => {
    assert.equal(isModelUnavailableError(404, undefined, "세션을 찾을 수 없습니다."), false);
  });

  it("401/403/429/5xx/그 외 400은 상태코드만으로 절대 fallback 대상이 아니다", () => {
    assert.equal(isModelUnavailableError(401, undefined, "does not exist"), false);
    assert.equal(isModelUnavailableError(403, undefined, "does not exist"), false);
    assert.equal(isModelUnavailableError(429, undefined, "does not exist"), false);
    assert.equal(isModelUnavailableError(500, undefined, "does not exist"), false);
    assert.equal(isModelUnavailableError(400, undefined, "does not exist"), false);
  });
});

// ── createFallbackCache ──────────────────────────────────────────────

describe("createFallbackCache", () => {
  it("TTL 안에서는 같은 값을 돌려준다(모델이 null이어도 캐싱한다)", () => {
    const cache = createFallbackCache();
    cache.set("qwen/qwen3.9-27b", 60_000);
    assert.deepEqual(cache.get()?.model, "qwen/qwen3.9-27b");

    cache.set(null, 60_000);
    assert.equal(cache.get()?.model, null);
    assert.ok(cache.get(), "null도 유효한 캐시 엔트리로 취급해야 재조회를 막는다");
  });

  it("TTL이 지나면 만료된 것으로 본다", () => {
    const cache = createFallbackCache();
    cache.set("qwen/qwen3.9-27b", -1); // 이미 만료된 상태로 저장
    assert.equal(cache.get(), undefined);
  });
});

// ── fetchGroqModelIds / resolveFallbackModel (fetch는 전부 mock) ─────

function fakeModelsResponse(ids: GroqModelListEntry[]): Response {
  return new Response(JSON.stringify({ object: "list", data: ids }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("fetchGroqModelIds", () => {
  it("Models API 응답에서 id 목록을 그대로 돌려준다(mock, 실제 네트워크 없음)", async () => {
    let calledUrl: string | undefined;
    let calledAuth: string | undefined;
    const fakeFetch = (async (url: string, init?: RequestInit) => {
      calledUrl = String(url);
      calledAuth = (init?.headers as Record<string, string> | undefined)?.authorization;
      return fakeModelsResponse([{ id: "qwen/qwen3.9-27b" }]);
    }) as typeof fetch;

    const models = await fetchGroqModelIds("gsk_test_key", fakeFetch);
    assert.deepEqual(models, [{ id: "qwen/qwen3.9-27b" }]);
    assert.equal(calledUrl, "https://api.groq.com/openai/v1/models");
    assert.equal(calledAuth, "Bearer gsk_test_key");
  });

  it("Models API 자체가 실패하면 빈 목록(=안전 실패로 이어짐)을 돌려준다", async () => {
    const fakeFetch = (async () => new Response("{}", { status: 500 })) as typeof fetch;
    assert.deepEqual(await fetchGroqModelIds("gsk_test_key", fakeFetch), []);
  });
});

describe("resolveFallbackModel", () => {
  it("캐시가 비어 있으면 /models를 1회 조회하고 결과를 캐싱한다", async () => {
    let fetchCalls = 0;
    const fakeFetch = (async () => {
      fetchCalls += 1;
      return fakeModelsResponse([{ id: "qwen/qwen3.9-27b" }]);
    }) as typeof fetch;
    const cache = createFallbackCache();

    const first = await resolveFallbackModel({
      apiKey: "gsk_test",
      currentModelId: CURRENT,
      cache,
      fetchImpl: fakeFetch,
    });
    const second = await resolveFallbackModel({
      apiKey: "gsk_test",
      currentModelId: CURRENT,
      cache,
      fetchImpl: fakeFetch,
    });

    assert.equal(first, "qwen/qwen3.9-27b");
    assert.equal(second, "qwen/qwen3.9-27b");
    assert.equal(fetchCalls, 1, "두 번째 호출은 캐시를 써야 하고 /models를 또 부르면 안 된다");
  });

  it("호환 가능한 후속 모델이 없으면 null이고, 그 결과도 캐싱한다", async () => {
    let fetchCalls = 0;
    const fakeFetch = (async () => {
      fetchCalls += 1;
      return fakeModelsResponse([{ id: "qwen/qwen2.0-27b" }]); // 과거 버전뿐
    }) as typeof fetch;
    const cache = createFallbackCache();

    assert.equal(
      await resolveFallbackModel({ apiKey: "gsk_test", currentModelId: CURRENT, cache, fetchImpl: fakeFetch }),
      null,
    );
    assert.equal(
      await resolveFallbackModel({ apiKey: "gsk_test", currentModelId: CURRENT, cache, fetchImpl: fakeFetch }),
      null,
    );
    assert.equal(fetchCalls, 1, "null 결과도 캐싱해 /models 재조회를 막아야 한다");
  });
});

// ── runChatWithFallback — A~H 시나리오 ────────────────────────────────
//
// attempt/resolveFallback을 전부 mock 콜백으로 주입한다 — 실제 Groq Chat/Models
// API를 전혀 부르지 않는다.

function ok(content: string): ChatOutcome {
  return { ok: true, content };
}

function fail(status: number, errorCode?: string, errorMessage?: string): ChatOutcome {
  return { ok: false, status, errorCode, errorMessage };
}

describe("runChatWithFallback", () => {
  it("A. 기본 모델이 정상이면 그대로 성공하고 /models(resolveFallback)는 호출되지 않는다", async () => {
    let resolveCalls = 0;
    const attempts: string[] = [];
    const result = await runChatWithFallback({
      defaultModel: CURRENT,
      allowFallback: true,
      attempt: async (model) => {
        attempts.push(model);
        return ok("안녕하세요");
      },
      resolveFallback: async () => {
        resolveCalls += 1;
        return "should-not-be-called";
      },
    });

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.result.content, "안녕하세요");
    assert.equal(result.ok && result.result.usedFallbackModel, undefined);
    assert.deepEqual(attempts, [CURRENT]);
    assert.equal(resolveCalls, 0, "/models 추가 조회 금지 — 정상일 때는 절대 호출되면 안 된다");
  });

  it("B. 기본 모델이 unavailable(404)이면 후속 모델로 1회만 재시도해 성공한다", async () => {
    const attempts: string[] = [];
    let resolveCalls = 0;
    const result = await runChatWithFallback({
      defaultModel: CURRENT,
      allowFallback: true,
      attempt: async (model) => {
        attempts.push(model);
        if (model === CURRENT) {
          return fail(404, "model_not_found", "The model `qwen/qwen3.8-27b` does not exist or you do not have access to it.");
        }
        return ok("한국어 응답");
      },
      resolveFallback: async () => {
        resolveCalls += 1;
        return "qwen/qwen3.9-27b";
      },
    });

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.result.content, "한국어 응답");
    assert.equal(result.ok && result.result.usedFallbackModel, "qwen/qwen3.9-27b");
    assert.deepEqual(attempts, [CURRENT, "qwen/qwen3.9-27b"]);
    assert.equal(resolveCalls, 1);
  });

  it("C. 후속 모델을 찾지 못하면 아무 모델도 임의로 쓰지 않고 명확히 실패한다", async () => {
    const attempts: string[] = [];
    const result = await runChatWithFallback({
      defaultModel: CURRENT,
      allowFallback: true,
      attempt: async (model) => {
        attempts.push(model);
        return fail(404, "model_not_found", "does not exist");
      },
      resolveFallback: async () => null,
    });

    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.error.type, "no-candidate");
    assert.deepEqual(attempts, [CURRENT], "재시도할 모델이 없으므로 attempt는 1번만 불려야 한다");
  });

  it("D. 401은 fallback 대상이 아니다", async () => {
    let resolveCalls = 0;
    const result = await runChatWithFallback({
      defaultModel: CURRENT,
      allowFallback: true,
      attempt: async () => fail(401, undefined, "invalid api key"),
      resolveFallback: async () => {
        resolveCalls += 1;
        return "qwen/qwen3.9-27b";
      },
    });

    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.error.type, "original");
    assert.equal(!result.ok && result.error.type === "original" && result.error.outcome.status, 401);
    assert.equal(resolveCalls, 0);
  });

  it("E. 429는 fallback 대상이 아니다", async () => {
    let resolveCalls = 0;
    const result = await runChatWithFallback({
      defaultModel: CURRENT,
      allowFallback: true,
      attempt: async () => fail(429, undefined, "rate limit"),
      resolveFallback: async () => {
        resolveCalls += 1;
        return "qwen/qwen3.9-27b";
      },
    });

    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.error.type, "original");
    assert.equal(resolveCalls, 0);
  });

  it("F. 5xx/network는 fallback 대상이 아니다", async () => {
    let resolveCalls = 0;
    const serverErrorResult = await runChatWithFallback({
      defaultModel: CURRENT,
      allowFallback: true,
      attempt: async () => fail(503, undefined, "server error"),
      resolveFallback: async () => {
        resolveCalls += 1;
        return "qwen/qwen3.9-27b";
      },
    });
    assert.equal(serverErrorResult.ok, false);
    assert.equal(!serverErrorResult.ok && serverErrorResult.error.type, "original");
    assert.equal(resolveCalls, 0);

    // network 오류는 attempt 자체가 reject하는 모양(ProviderError를 그대로 던짐)이라
    // runChatWithFallback을 거치지 않고 그대로 전파돼야 한다 — resolveFallback 호출 금지.
    await assert.rejects(
      () =>
        runChatWithFallback({
          defaultModel: CURRENT,
          allowFallback: true,
          attempt: async () => {
            throw new Error("network down");
          },
          resolveFallback: async () => {
            resolveCalls += 1;
            return "qwen/qwen3.9-27b";
          },
        }),
      /network down/,
    );
    assert.equal(resolveCalls, 0);
  });

  it("G. env override(allowFallback=false)면 모델이 unavailable해도 fallback하지 않는다", async () => {
    let resolveCalls = 0;
    const attempts: string[] = [];
    const result = await runChatWithFallback({
      defaultModel: "qwen/qwen3.8-27b-preview", // GROQ_LLM_MODEL로 지정한 값이라 가정
      allowFallback: false,
      attempt: async (model) => {
        attempts.push(model);
        return fail(404, "model_not_found", "does not exist");
      },
      resolveFallback: async () => {
        resolveCalls += 1;
        return "qwen/qwen3.9-27b";
      },
    });

    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.error.type, "original");
    assert.deepEqual(attempts, ["qwen/qwen3.8-27b-preview"]);
    assert.equal(resolveCalls, 0, "사용자가 명시한 모델은 자동으로 바꾸지 않는다");
  });

  it("H. fallback 모델로도 실패하면 추가 재시도 없이 그 오류로 끝난다", async () => {
    const attempts: string[] = [];
    let resolveCalls = 0;
    const result = await runChatWithFallback({
      defaultModel: CURRENT,
      allowFallback: true,
      attempt: async (model) => {
        attempts.push(model);
        if (model === CURRENT) return fail(404, "model_not_found", "does not exist");
        return fail(500, undefined, "fallback model server error");
      },
      resolveFallback: async () => {
        resolveCalls += 1;
        return "qwen/qwen3.9-27b";
      },
    });

    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.error.type, "fallback-failed");
    assert.equal(!result.ok && result.error.type === "fallback-failed" && result.error.outcome.status, 500);
    assert.deepEqual(attempts, [CURRENT, "qwen/qwen3.9-27b"], "2번째 재시도까지만 — 무한 재시도 금지");
    assert.equal(resolveCalls, 1, "fallback이 또 실패해도 resolveFallback을 다시 부르면 안 된다");
  });
});
