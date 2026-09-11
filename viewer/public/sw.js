/**
 * CMM Tutor 최소 Service Worker.
 *
 * 목표는 "설치 가능한 앱"이지 "오프라인 앱"이 아니다(요구사항: 전체 offline은 범위 밖).
 * 그래서 캐시하는 것은 Next.js 정적 빌드 자산(_next/static/**, 파일명에 content hash가
 * 있어 캐시해도 항상 최신)과 아이콘/manifest뿐이다.
 *
 * 절대 캐시하지 않는 것 (요구사항: 하루 첫 접속 갱신·session/progress·AI API·사용자별
 * 동적 데이터를 stale하게 캐시하지 않는다):
 *   - 페이지 내비게이션(HTML) — 항상 네트워크로 간다. 로그인 여부·최신 진도·자동 갱신
 *     여부가 매 요청 서버(proxy.ts)에서 결정되므로 캐시하면 안 된다.
 *   - /api/** (Tutor LLM/STT, session 등 전부 사용자별 동적)
 *   - Supabase REST 호출(브라우저가 직접 부르는 경우가 없어 이 SW를 거치지도 않는다)
 */
const STATIC_CACHE = "cmm-tutor-static-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isCacheableStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname === "/manifest.webmanifest" ||
      /^\/(icon-192|icon-512|icon-512-maskable|apple-touch-icon)\.png$/.test(url.pathname))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // POST(API 호출 등)는 손대지 않는다

  const url = new URL(request.url);

  // 페이지 내비게이션과 /api/** 는 절대 캐시하지 않고 그대로 네트워크로 보낸다.
  if (request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    return;
  }

  if (!isCacheableStaticAsset(url)) return;

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }),
  );
});
