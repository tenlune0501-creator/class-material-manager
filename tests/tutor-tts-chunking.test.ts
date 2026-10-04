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
  normalizePronunciation,
  splitIntoSentences,
  stripMarkdownForSpeech,
} from "../viewer/lib/tutor/tts-chunking.ts";
import { semanticReply } from "./fixtures/tts-semantic-reply.ts";

describe("speech pronunciation", () => {
  for (const [raw, speech] of [
    ["div", "디아이브이"], ["DIV", "디아이브이"], ["<div>", "디아이브이"],
    ["div에 id를 지정하면", "디아이브이에 아이디를 지정하면"],
    ["id", "아이디"], ["ID", "아이디"], ['id="header"', '아이디 이퀄 "header"'],
    ['`div`에 `id`를 줍니다.', '디아이브이에 아이디를 줍니다.'],
    ["div+id", "디아이브이 플러스 아이디"],
  ]) it(`${raw} changes only in the speech copy`, () => {
    const message = { content: raw };
    assert.deepEqual(chunkTextForSpeech(message.content), [speech]);
    assert.equal(message.content, raw);
  });
  it("keeps identifiers and URLs intact", () => {
    const text = 'grid video identifier constructor toString user_id div2 data-id $id https://example.com/div/id?grid=video+id#id';
    assert.equal(normalizePronunciation(text), text);
    assert.deepEqual(chunkTextForSpeech(text), [text.replace('user_id', 'userid')]); // existing Markdown underscore stripping
    assert.deepEqual(chunkTextForSpeech('_id'), ['id']); // identifier must not become a new lexicon match after stripping
  });
  it("omits fenced code, retains surrounding prose and normalizes inline code", () => {
    assert.deepEqual(chunkTextForSpeech('`div` 설명\n```html\n<div id="header"></div>\n```\n`id` 설명'), ['디아이브이 설명', '아이디 설명']);
  });
  it("reproduces all six reply chunks with safe final input", () => {
    const chunks = chunkTextForSpeech(semanticReply);
    assert.deepEqual(chunks.map(c => c.length), [69, 15, 62, 56, 68, 41]);
    assert.equal(chunks[5], '이 정도면 "왜 디아이브이 플러스 아이디로는 부족한지"는 이제 명확해질까?');
    assert.equal(chunks.join(' '), normalizePronunciation(stripMarkdownForSpeech(semanticReply)).replace(/\n/g, ' '));
    assert.ok(semanticReply.includes('디아이브이+id'));
    assert.ok(!chunks.some(c => c.includes('+')));
  });
  it("normalizes before chunk limits and preserves order without duplication", () => {
    const text = Array.from({length:80}, () => 'div에 id를 지정하면').join(' ') + '.';
    const chunks = chunkTextForSpeech(text);
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every(c => c.length <= HARD_MAX_CHUNK_CHARS));
    assert.equal(chunks.join(' '), normalizePronunciation(text));
    assert.equal(chunks.join(' ').match(/디아이브이/g)?.length, 80);
    assert.equal(chunks.join(' ').match(/아이디/g)?.length, 80);
    assert.deepEqual(chunkTextForSpeech(text), chunks);
  });
});

describe("stripMarkdownForSpeech", () => {
  it("MeloTTS에서 실패하는 인라인 코드의 =와 =>를 음성용 말로 바꾼다", () => {
    const text = stripMarkdownForSpeech("`let count = 0`과 `setCount(prev => prev + 1)`입니다.");
    assert.ok(!text.includes("=") && !text.includes(">"));
    assert.ok(text.includes("이퀄") && text.includes("화살표"));
  });
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
