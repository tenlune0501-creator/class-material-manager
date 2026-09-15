/**
 * TTS 텍스트 전처리 — 마크다운 제거 + 문장 경계 기준 chunking.
 *
 * ■ 왜 chunking이 필요한가 (실측)
 *
 * 실제 로컬 MeloTTS 컴패니언(local-services/melotts)에 curl로 직접 측정한 결과,
 * 합성 시간은 텍스트 길이에 거의 선형이었다(대략 글자당 0.1초):
 *   24자 → 2.5s, 42자 → 4.9s, 119자 → 11.8s, 251자 → 24.5s
 * 즉 Tutor 응답 전체(1~2문단)를 한 번에 합성하면 첫 음성이 나오기까지 20초+가 걸릴
 * 수 있다. 반면 합성된 오디오의 재생 길이 대비 합성 시간 비율은 항상 약 0.5~0.6배였다
 * (합성이 재생보다 빠르다) — 그래서 "첫 chunk는 최대한 짧게, 이후 chunk는 재생 중에
 * 미리 합성"하면 chunk 사이에 끊김 없이 이어 말할 수 있다.
 *
 * 이 파일은 순수 함수만 담는다(상대 import 없음) — `node --test`로 직접 단위
 * 테스트하기 위해서다(tests/tutor-tts-chunking.test.ts, tests/tutor-fallback.test.ts와
 * 같은 이유: 이 프로젝트의 확장자 없는 상대 import 스타일은 Node 기본 TS strip으로
 * 해석되지 않아, 다른 모듈을 참조하지 않는 self-contained 파일만 직접 import해서
 * 테스트할 수 있다).
 */

/** 이 길이 미만이면 다음 문장과 합쳐서 chunk를 만든다("응", "왜?" 같은 짧은 발화가 혼자 chunk가 되지 않게). */
export const MIN_CHUNK_CHARS = 12;
/** chunk를 더 늘리지 않고 끊어내는 목표 상한(글자 수). 위 실측 기준 약 5~7초 합성에 해당. */
export const MAX_CHUNK_CHARS = 70;
/** 문장 하나가 이 길이를 넘으면(쉼표/공백 등 보조 기준으로) 강제로 더 쪼갠다. */
export const HARD_MAX_CHUNK_CHARS = 140;

/**
 * TTS로 읽기 전에 마크다운 기호를 없앤다.
 *
 * 두 가지 이유가 있다: (1) "**1.5**", "`line-height`" 를 기호까지 그대로 읽으면
 * 자연스러운 음성 과외가 아니다. (2) MeloTTS(한국어 심볼 테이블)가 백틱(`)처럼
 * 학습되지 않은 기호를 만나면 합성 자체가 KeyError로 실패한다(실사용 검증 중
 * 발견) — 그래서 안전을 위해서도 코드/강조 기호는 읽기 전에 반드시 벗겨낸다.
 */
export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "") // 코드 블록은 음성으로 읽지 않고 생략한다
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/[`*_~#>|]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/**
 * 문장 경계(`.`/`?`/`!` + 공백 또는 끝)로 나눈다. "1.5", "v1.2" 같은 소수점은
 * 다음 글자가 숫자면 경계로 보지 않는다.
 */
export function splitIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    buf += ch;
    if (ch === "." || ch === "?" || ch === "!") {
      const prev = text[i - 1];
      const next = text[i + 1];
      const isDecimalPoint = ch === "." && prev !== undefined && next !== undefined && /\d/.test(prev) && /\d/.test(next);
      const atBoundary = next === undefined || /\s/.test(next);
      if (!isDecimalPoint && atBoundary) {
        sentences.push(buf.trim());
        buf = "";
      }
    }
  }
  if (buf.trim()) sentences.push(buf.trim());
  return sentences.filter(Boolean);
}

/** HARD_MAX_CHUNK_CHARS를 넘는 조각을 쉼표/공백 경계(없으면 강제 절단)로 더 쪼갠다. */
function splitOversized(text: string): string[] {
  if (text.length <= HARD_MAX_CHUNK_CHARS) return [text];
  const parts: string[] = [];
  let remaining = text;
  while (remaining.length > HARD_MAX_CHUNK_CHARS) {
    let cut = remaining.lastIndexOf(",", HARD_MAX_CHUNK_CHARS);
    if (cut < HARD_MAX_CHUNK_CHARS * 0.4) cut = remaining.lastIndexOf(" ", HARD_MAX_CHUNK_CHARS);
    if (cut < HARD_MAX_CHUNK_CHARS * 0.4) cut = HARD_MAX_CHUNK_CHARS - 1; // 최후 수단: 강제 절단
    parts.push(remaining.slice(0, cut + 1).trim());
    remaining = remaining.slice(cut + 1).trim();
  }
  if (remaining) parts.push(remaining);
  return parts.filter(Boolean);
}

/** 한 줄(=원래 문단/목록 한 줄) 안의 문장들을 짧으면 합치고 길면 쪼개 chunk로 만든다. */
function chunkLine(sentences: string[]): string[] {
  const out: string[] = [];
  let buf = "";
  for (const sentence of sentences) {
    const candidate = buf ? `${buf} ${sentence}` : sentence;
    if (buf.length >= MIN_CHUNK_CHARS && candidate.length > MAX_CHUNK_CHARS) {
      out.push(...splitOversized(buf));
      buf = sentence;
    } else {
      buf = candidate;
    }
  }
  if (buf) out.push(...splitOversized(buf));
  return out;
}

/**
 * Tutor 응답 원문(마크다운 포함) → TTS로 순서대로 읽을 chunk 배열.
 *
 * 줄바꿈(문단/목록 경계)은 절대 합치지 않는다 — 서로 다른 항목을 이어 말하면
 * 부자연스럽다. 같은 줄 안에서만 문장을 합치거나 쪼갠다.
 */
export function chunkTextForSpeech(rawText: string): string[] {
  const stripped = stripMarkdownForSpeech(rawText);
  if (!stripped) return [];
  const lines = stripped
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const line of lines) {
    chunks.push(...chunkLine(splitIntoSentences(line)));
  }
  return chunks.filter((c) => c.trim().length > 0);
}
