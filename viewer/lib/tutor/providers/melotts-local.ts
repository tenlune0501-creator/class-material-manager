/**
 * MeloTTSProvider — TTSProvider 구현체.
 *
 * ■ 왜 서버를 거치지 않고 브라우저가 직접 부르는가
 *
 * Vercel에 배포된 뷰어(서버리스 함수)는 사용자의 로컬 네트워크(localhost)에 접근할
 * 방법이 없다. 그래서 이 호출은 항상 "사용자 브라우저 → 사용자 PC의 로컬 프로세스"로
 * 이뤄진다 — 배포 환경이 Vercel이든 로컬 `next dev`든 동일하게 동작한다.
 * (반대로 Groq 호출은 API 키가 필요해 반드시 서버(app/api/tutor/**)를 거친다.)
 *
 * 이 모듈은 클라이언트 컴포넌트에서만 import한다. API 키를 다루지 않으므로
 * 브라우저에 노출돼도 안전하다 — 노출되면 안 되는 것은 로컬 서비스 자체의
 * loopback 바인딩(local-services/melotts/README.md 참고)이다.
 */
import { TTSProvider } from "./types";

export class MeloTTSProvider implements TTSProvider {
  readonly name = "melotts-local";

  constructor(private readonly baseUrl: string) {}

  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  }

  async synthesize(text: string): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/synthesize`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error(`MeloTTS 합성 실패 (${res.status})`);
    }
    return res.blob();
  }
}

export function getTTSProvider(): TTSProvider | null {
  const baseUrl = process.env.NEXT_PUBLIC_MELOTTS_URL;
  if (!baseUrl) return null;
  return new MeloTTSProvider(baseUrl);
}
