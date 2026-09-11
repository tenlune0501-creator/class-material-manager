/**
 * Groq 실사용(live) 검증 — 진짜 GROQ_API_KEY 로 실제 api.groq.com 을 호출한다.
 *
 * ■ 왜 tests/ 바로 아래가 아니라 tests/live/ 인가
 *
 * 루트 `npm test` 는 `node --test "tests/*.test.ts"` 로 **이 폴더를 glob에서
 * 제외**한다. 그래서 이 파일은 평소 test suite/CI에 영향을 주지 않는다
 * (요구사항: 기존 mock/contract 테스트를 삭제·약화하지 않고, live test는 분리).
 *
 * ■ 실행
 *
 *   npm run test:live-groq        (viewer/.env.local 에서 GROQ_API_KEY 를 읽는다)
 *
 * GROQ_API_KEY 가 비어 있으면(기본 로컬 개발 상태) 관련 테스트를 스킵하고
 * 이유만 표시한다 — 실패로 처리하지 않는다. 인증 실패(401) 분류 테스트만은
 * 진짜 키가 없어도 "가짜로 틀린 키" 로 실행해 오류 처리 자체를 검증한다.
 *
 * ■ 왜 GroqQwenProvider 를 직접 import 하지 않는가
 *
 * `viewer/lib/tutor/providers/*.ts` 는 Next.js 번들러(모듈 해석 "bundler")
 * 기준으로 작성돼 있어 `node --test` 의 순수 type-stripping 실행과 import
 * 규약이 다르다(확장자 없는 상대 import, 매개변수 속성 등). 이 라이브 테스트는
 * 모델 id를 소스에서 정규식으로 그대로 추출해(`extractDefault`) 실제 코드와
 * 어긋나지 않게 하면서, 요청은 동일한 모양으로 직접 fetch 한다.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

function parseEnvFile(text: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return env;
}

function extractDefault(src: string, constName: string): string {
  const match = src.match(new RegExp(`${constName}\\s*=\\s*"([^"]+)"`));
  if (!match) throw new Error(`${constName} 기본값을 소스에서 찾지 못했습니다`);
  return match[1];
}

const envText = await readFile("viewer/.env.local", "utf8").catch(() => "");
const env = parseEnvFile(envText);
const GROQ_API_KEY = env.GROQ_API_KEY;

const groqQwenSrc = await readFile("viewer/lib/tutor/providers/groq-qwen.ts", "utf8");
const groqWhisperSrc = await readFile("viewer/lib/tutor/providers/groq-whisper.ts", "utf8");

const LLM_MODEL = env.GROQ_LLM_MODEL || extractDefault(groqQwenSrc, "DEFAULT_MODEL");
const STT_MODEL = env.GROQ_STT_MODEL || extractDefault(groqWhisperSrc, "DEFAULT_MODEL");

const hasKey = Boolean(GROQ_API_KEY);
const skipReason = "GROQ_API_KEY가 비어 있습니다 — viewer/.env.local에 채우면 이 테스트가 실행됩니다.";

const KOREAN_RE = /[가-힣]/;

// buildLessonContext(viewer/lib/tutor/context.ts)와 같은 모양(과외 지시 + 그
// Lesson의 goal/concept 섹션)의 system prompt를 실제 CMM Lesson 내용으로 구성한다.
const LESSON_SYSTEM_PROMPT = [
  "당신은 CMM(Class Material Manager)의 한국어 AI 과외 선생님입니다.",
  "지금 이 세션은 아래 Lesson 하나에 집중합니다. 범위를 벗어난 질문이 나오면",
  "짧게만 답하고 다시 이 Lesson으로 돌아오도록 안내하세요.",
  "답변은 음성으로 읽힐 수 있으므로 마크다운 헤더나 긴 표는 쓰지 말고, 짧은",
  "문단과 필요할 때만 코드 블록을 쓰세요.",
  "",
  "## 오늘의 Lesson: useState로 상태 관리 시작하기",
  "- 트랙/챕터: React / 상태와 이벤트",
  "- 목표 수준: 직접 구현(빈 화면에서 기본 형태를 짤 수 있어야 함)",
  "",
  "## Lesson 본문",
  "### 이 Lesson을 끝내면",
  "useState로 컴포넌트가 값을 기억하고, 그 값이 바뀌면 화면이 다시 그려지는",
  "이유를 설명할 수 있다.",
  "### 개념",
  "React 컴포넌트의 일반 변수는 리렌더링되면 초기화된다. useState는 그 값을",
  "컴포넌트 바깥(React 내부)에 보관해 리렌더링 사이에도 유지되게 하고,",
  "setter 함수를 호출하면 컴포넌트를 다시 그리도록 예약한다.",
].join("\n");

describe(
  "Groq LLM 실사용 검증 (api.groq.com, 진짜 키 필요)",
  { skip: !hasKey && skipReason },
  () => {
    it(`인증 성공 + Lesson context 기반 한국어 응답 (model=${LLM_MODEL})`, async () => {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [
            { role: "system", content: LESSON_SYSTEM_PROMPT },
            { role: "user", content: "useState가 왜 필요한지 한 문장으로 설명해줘." },
          ],
          temperature: 0.6,
          max_tokens: 900,
          reasoning_effort: "none",
        }),
      });

      if (res.status !== 200) {
        assert.fail(`Groq 인증/요청 실패: ${res.status} ${await res.text()}`);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content?.trim() ?? "";

      assert.ok(content.length > 0, "응답이 비어 있으면 안 된다");
      assert.ok(KOREAN_RE.test(content), `한국어 질문에 한국어로 답해야 한다: ${content.slice(0, 80)}`);
      // 음성으로 읽히므로 지나치게 길면 안 된다 — max_tokens=900과 별개로 실제 습관 확인.
      assert.ok(content.length < 1500, `답변이 과도하게 깁니다(${content.length}자) — 짧게 답하도록 유도 필요`);
      // "Lesson 기반 Tutor"인지 — 일반 챗봇이면 이 Lesson의 핵심 개념(useState/리렌더링)과
      // 무관하게 답할 수 있으므로, 최소한 관련 용어가 있는지 느슨하게 확인한다.
      assert.ok(
        /useState|state|상태|리렌더|렌더/i.test(content),
        `Lesson context가 실제로 반영되지 않은 것으로 보입니다: ${content.slice(0, 200)}`,
      );

      console.log(`  [Qwen 응답 미리보기] ${content.slice(0, 120)}${content.length > 120 ? "…" : ""}`);
    });

    it("429(rate limit) 이외의 유효한 요청은 몇 초 안에 응답한다 (무료 한도 보호용 짧은 대화 확인)", async () => {
      const start = Date.now();
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [{ role: "user", content: "안녕하세요" }],
          max_tokens: 50,
          reasoning_effort: "none",
        }),
      });
      const elapsed = Date.now() - start;
      assert.ok(res.status === 200 || res.status === 429, `예상 밖 상태 코드: ${res.status}`);
      if (res.status === 200) {
        assert.ok(elapsed < 15000, `응답이 너무 느립니다(${elapsed}ms)`);
      } else {
        console.log("  [참고] 429 rate limit에 걸렸습니다 — 정상적인 방어 동작입니다.");
      }
    });
  },
);

describe("Groq STT(Whisper) 실사용 검증 — 로컬 MeloTTS로 만든 실제 한국어 오디오", { skip: !hasKey && skipReason }, () => {
  const MELOTTS_URL = env.NEXT_PUBLIC_MELOTTS_URL || "http://127.0.0.1:8787";
  const PHRASE = "리액트 상태 관리를 공부하고 있습니다";

  it(`한국어 음성을 정확히 인식한다 (model=${STT_MODEL})`, async (t) => {
    let audio: Response;
    try {
      audio = await fetch(`${MELOTTS_URL}/synthesize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: PHRASE }),
      });
    } catch {
      t.skip("로컬 MeloTTS 컴패니언이 실행 중이 아닙니다 (local-services/melotts/server.py)");
      return;
    }
    if (!audio.ok) {
      t.skip(`MeloTTS 합성 실패(${audio.status}) — 서버가 아직 모델을 로드 중일 수 있습니다`);
      return;
    }
    const wavBuffer = Buffer.from(await audio.arrayBuffer());
    assert.ok(wavBuffer.length > 1000, "합성된 오디오가 비정상적으로 작습니다");

    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(wavBuffer)], { type: "audio/wav" }), "test.wav");
    form.append("model", STT_MODEL);
    form.append("language", "ko");
    form.append("response_format", "json");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { authorization: `Bearer ${GROQ_API_KEY}` },
      body: form,
    });
    if (res.status !== 200) {
      assert.fail(`Whisper 요청 실패: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { text?: string };
    const transcribed = (data.text ?? "").trim();

    assert.ok(transcribed.length > 0, "전사 결과가 비어 있으면 안 된다");
    assert.ok(KOREAN_RE.test(transcribed), `한국어로 인식돼야 한다: ${transcribed}`);

    // 완전 일치는 요구하지 않는다(TTS→STT 왕복이라 미세한 오차가 자연스럽다) —
    // 원문 어절 중 절반 이상이 그대로 나타나는지만 느슨하게 확인한다.
    const originalWords = PHRASE.split(" ");
    const matched = originalWords.filter((w) => transcribed.includes(w));
    assert.ok(
      matched.length >= Math.ceil(originalWords.length / 2),
      `인식 결과가 원문과 너무 다릅니다. 원문="${PHRASE}" 인식="${transcribed}"`,
    );

    console.log(`  [Whisper 인식 결과] "${transcribed}" (원문: "${PHRASE}")`);
  });
});

describe("Groq 오류 분류 — 잘못된 키는 401로 거부된다 (진짜 키 없어도 실행됨)", () => {
  it("인증 실패를 정확히 감지한다", async () => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer gsk_invalid_test_key_0000000000" },
      body: JSON.stringify({ model: LLM_MODEL, messages: [{ role: "user", content: "hi" }] }),
    });
    assert.equal(res.status, 401, `잘못된 키는 401이어야 합니다 (실제: ${res.status})`);
  });
});
