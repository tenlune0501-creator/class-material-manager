import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { validTranscript } from "../viewer/lib/tutor/transcript-validation.ts";

describe("transcript validation after user stop", () => {
  it("preserves brief answers and incomplete phrases without guessing completion", () => {
    for (const text of ["네", "응", "아니", "아니요", "몰라", "다시", "왜?", "뭐야?", "그러면 이 코드가..."]) {
      assert.equal(validTranscript(text), text);
    }
  });
  it("rejects empty, punctuation-only and clear non-speech artifacts", () => {
    for (const text of [undefined, "", "  ", "...", "[음악]", "(noise)", "자막 제공: 방송", "시청해 주셔서 감사합니다."]) {
      assert.equal(validTranscript(text), "");
    }
  });
  it("trims text but preserves ordinary questions about noise", () => {
    assert.equal(validTranscript("  TV 소리가 왜 나요?  "), "TV 소리가 왜 나요?");
    assert.equal(validTranscript("[네]"), "[네]");
  });
});
