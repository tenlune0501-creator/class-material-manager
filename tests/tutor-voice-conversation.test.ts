/**
 * 대화 모드/로그인 복귀의 순수 로직 검증 — 실제 함수를 import해 직접 실행한다.
 *
 * - `viewer/lib/tutor/voice-state.ts`: micLevelFromRms
 *   (Voice Indicator 표시용 레벨 — VAD 아님)
 * - `viewer/lib/url.ts`: safeNextPath(로그인 후 복귀 경로 — Open Redirect 방지), lessonHref
 *
 * 두 모듈 모두 상대 import가 없는 self-contained 파일이라(tts-chunking.test.ts와 같은 이유)
 * `node --test`의 기본 TS strip으로 바로 import할 수 있다.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  MIC_LEVEL_CEIL_DB,
  MIC_LEVEL_FLOOR_DB,
  micLevelFromRms,
} from "../viewer/lib/tutor/voice-state.ts";
import { lessonHref, safeNextPath } from "../viewer/lib/url.ts";




describe("micLevelFromRms — Voice Indicator 표시용 입력 레벨(0~1)", () => {
  it("무음/비정상 값은 0", () => {
    assert.equal(micLevelFromRms(0), 0);
    assert.equal(micLevelFromRms(-1), 0);
    assert.equal(micLevelFromRms(Number.NaN), 0);
  });

  it("floor 이하 0, ceil 이상 1로 자른다", () => {
    assert.equal(micLevelFromRms(10 ** ((MIC_LEVEL_FLOOR_DB - 10) / 20)), 0);
    assert.equal(micLevelFromRms(10 ** ((MIC_LEVEL_CEIL_DB + 6) / 20)), 1);
    assert.equal(micLevelFromRms(1), 1);
  });

  it("dB 스케일로 단조 증가한다 — 작은 목소리에도 반응한다", () => {
    const quiet = micLevelFromRms(0.003); // ≈ -50 dBFS
    const normal = micLevelFromRms(0.03); // ≈ -30 dBFS
    assert.ok(quiet > 0 && quiet < normal && normal < 1, `${quiet} < ${normal}`);
  });
});

describe("safeNextPath — 로그인 후 복귀 경로는 이 사이트 안의 화면만", () => {
  it("내부 경로(쿼리 포함)는 그대로 허용한다", () => {
    assert.equal(safeNextPath("/lesson/track-a/ch-1/l-1?tutor=open"), "/lesson/track-a/ch-1/l-1?tutor=open");
    assert.equal(safeNextPath("/tutor"), "/tutor");
    assert.equal(safeNextPath("/"), "/");
    assert.equal(safeNextPath("/lesson/%ED%95%9C%EA%B8%80"), "/lesson/%ED%95%9C%EA%B8%80");
  });

  it("외부로 나가는 형태는 전부 거부한다(Open Redirect)", () => {
    for (const value of [
      "https://evil.example/",
      "http://evil.example",
      "//evil.example/x",
      "/\\evil.example",
      "\\\\evil.example",
      "javascript:alert(1)",
      "/%0d%0aLocation:%20https://evil.example".replace("%0d%0a", "\r\n"),
      " /lesson",
      "lesson/x",
      "",
    ]) {
      assert.equal(safeNextPath(value), null, JSON.stringify(value));
    }
  });

  it("/login(무한 반복)과 /api(JSON 응답)는 복귀 대상이 아니다", () => {
    assert.equal(safeNextPath("/login"), null);
    assert.equal(safeNextPath("/login?next=/x"), null);
    assert.equal(safeNextPath("/api/tutor/resume"), null);
    assert.equal(safeNextPath("/api"), null);
  });

  it("문자열이 아니거나 너무 긴 값은 거부한다", () => {
    assert.equal(safeNextPath(null), null);
    assert.equal(safeNextPath(undefined), null);
    assert.equal(safeNextPath(123), null);
    assert.equal(safeNextPath(`/${"a".repeat(3000)}`), null);
  });

  it("경로 정규화 결과가 사이트 밖을 가리키지 않는다(/./, /../ 는 내부 경로로 정리됨)", () => {
    assert.equal(safeNextPath("/lesson/../tutor"), "/tutor");
    assert.equal(safeNextPath("/../../etc"), "/etc");
  });

  it("정규화 뒤에야 //host 가 되는 값도 거부한다(Codex 리뷰에서 발견한 우회)", () => {
    for (const value of ["/a/..//evil.example", "/./..//evil.example/x?y=1", "/%2e%2e//evil.example", "/a/./..//evil.example"]) {
      assert.equal(safeNextPath(value), null, value);
    }
    // 인코딩된 슬래시는 경로 조각 안의 글자일 뿐 — 내부 경로로 남는다.
    assert.equal(safeNextPath("/a/../%2Fevil.example"), "/%2Fevil.example");
  });
});

describe("lessonHref — Lesson 화면 주소(조각별 인코딩)", () => {
  it("id의 / 는 경로 구분자로 두고 조각마다 인코딩한다(커리큘럼 목록 링크와 같은 규칙)", () => {
    assert.equal(lessonHref("react/hooks/use state"), "/lesson/react/hooks/use%20state");
  });

  it("openTutor면 Tutor 패널을 연 채로 시작하는 ?tutor=open 을 붙인다", () => {
    assert.equal(lessonHref("a/b", { openTutor: true }), "/lesson/a/b?tutor=open");
  });
});
