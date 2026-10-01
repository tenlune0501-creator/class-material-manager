/**
 * 외부 링크 URL 을 `<a href>` 에 넣기 전 스킴을 확인합니다.
 *
 * React 는 `href` 값을 sanitize 하지 않습니다 — `javascript:` 나 `data:` URL 이 들어오면
 * 클릭 시 실행될 수 있습니다. 여기 담긴 URL(수업자료 `source_url`, 근거의 `where` 등)은
 * 우리 파이프라인이 만든 값이라 위험도가 낮지만, DB/파일 어느 쪽에서 오든 렌더 직전에
 * 한 번 더 거릅니다. sync 쪽(`src/sync/build-references.ts:sanitizeUrl`)에서도 같은 허용
 * 목록으로 저장 시 검증합니다 (이중 방어).
 *
 * 허용: http, https, mailto. 그 외(상대경로·빈 값·javascript: 등)는 undefined 를 돌려
 * 주고, 호출부는 링크 대신 그냥 텍스트로 보여 줍니다.
 */
export function safeHref(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return undefined;
  }
  const scheme = parsed.protocol.toLowerCase();
  return scheme === "http:" || scheme === "https:" || scheme === "mailto:" ? parsed.href : undefined;
}

/**
 * 마크다운 본문 링크·이미지 URL 용. react-markdown 에 `urlTransform` 으로 넘겨,
 * 본문 안의 링크도 앱 정책(http/https/mailto + 상대경로·#앵커만)에 맞춥니다.
 * react-markdown 기본값은 irc:·xmpp: 등도 허용하므로 여기서 좁힙니다.
 * 허용 안 되는 스킴은 빈 문자열을 돌려 링크를 무력화합니다.
 */
export function safeMarkdownUrl(url: string): string {
  if (!url) return "";
  const colon = url.indexOf(":");
  if (colon === -1) return url; // 스킴 없음 — 상대경로·#앵커·쿼리
  const firstSep = Math.min(
    ...["/", "?", "#"].map((c) => url.indexOf(c)).filter((i) => i !== -1),
  );
  if (Number.isFinite(firstSep) && firstSep < colon) return url; // 콜론이 경로 안 (스킴 아님)
  const scheme = url.slice(0, colon).toLowerCase();
  return scheme === "http" || scheme === "https" || scheme === "mailto" ? url : "";
}

/**
 * 로그인 후 돌아갈 경로(`/login?next=...`)를 검증합니다 — Open Redirect 방지.
 *
 * 허용: 이 사이트 안의 경로(`/lesson/...`, `/tutor?x=1` 등)만. 다음은 전부 거부하고
 * null 을 돌려줍니다(호출부는 기본값 `/` 로 보냅니다):
 *   · `//evil.com`, `/\evil.com` — 브라우저가 다른 호스트로 해석하는 형태
 *   · `https://...`, `javascript:...` 등 스킴이 있는 값 · 역슬래시 · 제어 문자
 *   · `/login`(무한 반복) · `/api/...`(화면이 아니라 JSON 응답)
 * 문자열 검사만으로 끝내지 않고 가상의 origin 기준으로 한 번 더 파싱해, 해석 결과의
 * origin 이 바뀌지 않았는지까지 확인합니다.
 */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return null;

  const base = "http://next-path.invalid";
  let parsed: URL;
  try {
    parsed = new URL(value, base);
  } catch {
    return null;
  }
  if (parsed.origin !== base) return null;
  // `/a/..//evil.example` 처럼 정규화(.. 처리) 뒤에야 `//host` 가 되는 값이 있다 — 돌려줄
  // "결과"를 다시 검사해야 한다(원본 문자열 검사만으로는 부족 — Codex 리뷰에서 발견).
  const result = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (result.startsWith("//") || result.includes("\\")) return null;
  if (parsed.pathname === "/login" || parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")) return null;
  return result;
}

/**
 * Lesson 화면 주소. Lesson id 에는 `/` 가 들어 있어(`track/chapter/lesson`) 조각마다
 * 따로 인코딩합니다(커리큘럼 목록 화면의 링크와 같은 규칙). `openTutor` 이면 그 화면에서
 * AI Tutor 패널을 열린 채로 시작합니다(`/tutor` 수업 선택 → 실제 수업).
 */
export function lessonHref(lessonId: string, options: { openTutor?: boolean } = {}): string {
  const path = `/lesson/${lessonId.split("/").map(encodeURIComponent).join("/")}`;
  return options.openTutor ? `${path}?tutor=open` : path;
}

/** 일반 학습 목록의 목적지. 원문 열기는 직접 /m 링크를 사용해 우회 없이 보존한다. */
export function materialEntryHref(materialId: string, destinations: Readonly<Record<string, string>>): string {
  return Object.hasOwn(destinations, materialId)
    ? lessonHref(destinations[materialId]!)
    : `/m/${encodeURIComponent(materialId)}`;
}
