"use client";

/**
 * PWA 설치를 위한 Service Worker 등록.
 *
 * public/sw.js 는 정적 빌드 자산만 캐시하고 페이지/‌API는 건드리지 않는다
 * (public/sw.js 상단 주석 참고) — 그래서 여기서 등록 자체는 안전하게 항상 켜 둔다.
 */
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 등록 실패해도 앱은 평소대로 동작한다(설치 가능성만 없어질 뿐).
      });
    }
  }, []);
  return null;
}
