/**
 * TTS chunking 순수 로직 검증 — `viewer/lib/tutor/tts-chunking.ts`.
 *
 * groq-fallback.test.ts와 같은 이유로 실제 로직을 import해서 직접 검증한다
 * (이 모듈은 상대 import가 없는 self-contained 파일이라 `node --test`의 기본 TS
 * strip으로 바로 import할 수 있다).
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  chunkTextForSpeech,
  HARD_MAX_CHUNK_CHARS,
  MAX_CHUNK_CHARS,
  MIN_CHUNK_CHARS,
  splitIntoSentences,
  stripMarkdownForSpeech,
} from "../viewer/lib/tutor/tts-chunking.ts";

describe("stripMarkdownForSpeech", () => {
  it("코드 블록은 통째로 없앤다", () => {
    assert.equal(stripMarkdownForSpeech("설명\n```js\nconst x = 1;\n```\n끝"), "설명\n끝");
  });

  it("백틱/강조/헤더/목록 기호를 벗겨낸다", () => {
    const out = stripMarkdownForSpeech("# 제목\n**중요**한 `코드` 와 *강조*\n- 목록1\n- 목록2");
    assert.ok(!out.includes("`"));
    assert.ok(!out.includes("**"));
    assert.ok(!out.includes("#"));
    assert.ok(out.includes("중요"));
    assert.ok(out.includes("목록1"));
  });
});

describe("splitIntoSentences", () => {
  it(". ? ! 로 문장을 나눈다", () => {
    assert.deepEqual(splitIntoSentences("안녕하세요! 오늘 뭐 할까요? 좋습니다."), [
      "안녕하세요!",
      "오늘 뭐 할까요?",
      "좋습니다.",
    ]);
  });

  it("소수점(1.5, v1.2)은 문장 경계로 보지 않는다", () => {
    assert.deepEqual(splitIntoSentences("이 값은 1.5배입니다."), ["이 값은 1.5배입니다."]);
  });

  it("끝에 구두점이 없어도 마지막 조각을 버리지 않는다", () => {
    assert.deepEqual(splitIntoSentences("문장 하나"), ["문장 하나"]);
  });
});

describe("chunkTextForSpeech", () => {
  it("빈 입력/마크다운만 있는 입력은 빈 배열", () => {
    assert.deepEqual(chunkTextForSpeech(""), []);
    assert.deepEqual(chunkTextForSpeech("```\ncode only\n```"), []);
  });

  it("짧은 문장들은 MAX_CHUNK_CHARS까지 합친다", () => {
    const chunks = chunkTextForSpeech("네. 왜요? 그렇군요.");
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0], "네. 왜요? 그렇군요.");
  });

  it("합쳐도 MAX_CHUNK_CHARS를 넘기면 그 앞에서 끊는다", () => {
    const sentence = "가".repeat(MAX_CHUNK_CHARS - 5) + "다.";
    const chunks = chunkTextForSpeech(`${sentence} 두 번째 문장입니다.`);
    assert.ok(chunks.length >= 2, "두 chunk 이상으로 나뉘어야 한다");
    assert.ok(chunks[0].length <= MAX_CHUNK_CHARS + 5);
  });

  it("한 문장이 HARD_MAX_CHUNK_CHARS를 넘으면 쉼표/공백 기준으로 강제 분리한다", () => {
    const longSentence = Array.from({ length: 40 }, (_, i) => `조각${i}번째부분`).join(", ") + " 입니다.";
    assert.ok(longSentence.length > HARD_MAX_CHUNK_CHARS, `테스트 문장이 너무 짧다: ${longSentence.length}`);
    const chunks = chunkTextForSpeech(longSentence);
    assert.ok(chunks.length >= 2);
    for (const c of chunks) assert.ok(c.length <= HARD_MAX_CHUNK_CHARS + 20, `chunk가 너무 길다: ${c.length}`);
  });

  it("줄바꿈(문단/목록 경계)은 절대 합치지 않는다", () => {
    const chunks = chunkTextForSpeech("첫 줄.\n둘째 줄.");
    assert.equal(chunks.length, 2);
    assert.equal(chunks[0], "첫 줄.");
    assert.equal(chunks[1], "둘째 줄.");
  });

  it("순서를 보존한다", () => {
    const chunks = chunkTextForSpeech("하나. 둘. 셋. 넷. 다섯.");
    const joined = chunks.join(" ");
    assert.ok(joined.indexOf("하나") < joined.indexOf("둘"));
    assert.ok(joined.indexOf("둘") < joined.indexOf("셋"));
  });

  it("MIN_CHUNK_CHARS보다 짧은 조각을 혼자 남기지 않으려 시도한다(마지막 제외)", () => {
    const chunks = chunkTextForSpeech("응. 그건 왜 그런가요?");
    assert.equal(chunks.length, 1);
    assert.ok(chunks[0].length >= MIN_CHUNK_CHARS - 5);
  });
});
