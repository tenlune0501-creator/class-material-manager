# TTS pronunciation and final-chunk 502 investigation

## Reproduction (2026-10-04)

Baseline: `d32b743b8c05ef24e716dd8e75718e92f064fe46`.
The user supplied the complete reply in `tests/fixtures/tts-semantic-reply.ts`.
The original chunk lengths are **69, 15, 61, 55, 68, 36** characters.
The first five chunks synthesize successfully. The final chunk is:

> 이 정도면 "왜 디아이브이+id로는 부족한지"는 이제 명확해질까?

The running local companion returns HTTP 502 with `TTS 합성 실패: '+'`.
Changing only `+` to ` 플러스 ` returns a WAV with HTTP 200. Replacing `id`
with `아이디` as well also succeeds. This is a deterministic symbol failure,
not evidence of a transient service outage, chunk size limit, or bad quotes.
The Korean symbol-to-ID lookup in the vendored MeloTTS implementation performs
direct dictionary indexing. A separate `<div>` input also reproduces an
unsupported `<` symbol; speech preprocessing now strips both angle brackets.

Historical request logs were not persisted by the existing launcher. The chunk
identification is a reproduction using the supplied full reply, not a claim that
the historical browser request stream was recovered.
The baseline Production bundle was also exercised in an isolated Chromium
profile with the supplied reply: five real WAVs decoded and reached `ended`,
then the sixth `/synthesize` request returned 502 for `+`. Only the Tutor
session/reply APIs were mocked; MeloTTS requests and audio decoding were real.

## Actual path

Tutor reply → `BlobSpeechOutput` → speech preparation/chunking → current blob
synthesis → playback plus next-blob prefetch → remaining chunks in order.

- Production Web: browser → configured loopback `/synthesize` directly.
  There is no Vercel TTS API route. The companion's `server.py` maps synthesis
  exceptions to 502 (model loading exceptions are 503).
- Local Web uses the same direct provider. Desktop builds use
  `/__cmm_desktop/melotts/synthesize`, whose Node proxy forwards to loopback.
- Mobile uses browser speech synthesis; it shares speech text preparation.
- Payload: JSON `{text}`, companion default speed 1.0, maximum 2000 characters.
  Chunking retains its 12-character minimum, 70-character target and 140-character
  hard limit. Blob speech retains the 180-second turn deadline and 120-second
  playback watchdog. Desktop proxy retains its 180-second timeout and 32 KiB cap.
- Production origin CORS/PNA preflight returns 200 with the matching origin and
  private-network permission header. Fresh Chromium profiles additionally need
  local-network permission. No deployment environment changes are needed.
- A read-only Vercel query for recent Production 502s returned no records; local
  synthesis does not run in Vercel, so that query cannot recover these errors.

## Minimal changes

`normalizePronunciation` applies a small lexicon to complete ASCII identifier
tokens: case-insensitive `div` → `디아이브이`, `id` → `아이디`. Korean particles
may follow. Other identifiers such as grid, video, identifier, user_id, div2 and
data-id are not lexicon matches. URLs bypass both pronunciation and Markdown
operator transformations. Existing fenced-code omission remains in place.

Order: **pronunciation → Markdown/operator preparation → chunking**. Matching
before Markdown stripping avoids turning `_id` into a new `id` match. Matching
before chunking prevents token boundary loss and includes expanded pronunciation
in length calculations. The reply passed to React, history and storage is never
rewritten. `+` becomes `플러스` in the speech copy only.

There is deliberately **no automatic retry**: retrying the reproduced invalid
symbol would repeat the same failure. A failed prefetched chunk is handled when
its queue position is reached; successful chunks are not replayed. The error
reaches the existing notice and the turn returns to idle. User cancellation
still aborts pending synthesis/playback; a later explicit call can recover.

Browser diagnostic warnings contain only chunk index/total, length, status
category, HTTP status and retry count (zero). They exclude source text, response
bodies and credentials. The UI keeps the existing concise failure notice.

## Validation

- Pure pronunciation, URL/identifier protection, fenced/inline code, immutable
  source, expanded chunk limits, deterministic ordering and full-reply tests.
- Queue tests for middle 502, no duplicate playback, final error/idle state,
  cancellation, stale work and recovery on a later explicit speech call.
- Browser tests exercise the real deployed UI/controller with mocked audio for
  ordered requests, collapsed history, unchanged display text and 502 notice.
- Real companion synthesis after preprocessing: all six WAVs succeed, with
  lengths **69, 15, 62, 56, 68, 41**. This verifies audio generation, not listening
  quality. Physical microphone and subjective pronunciation require user review.

No recording lifecycle, provider selection, system prompt, DB/schema, local
companion installation or existing user profile is changed.
