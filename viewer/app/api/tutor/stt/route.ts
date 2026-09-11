/**
 * POST /api/tutor/stt
 * multipart/form-data: audio=<Blob>
 *
 * 마이크로 녹음한 오디오를 Groq Whisper로 전사한다. GROQ_API_KEY는 이 서버
 * 라우트 안에서만 쓰인다 — 브라우저는 오디오만 올리고 키를 보지 않는다.
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSTTProvider, ProviderError } from "@/lib/tutor/providers";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20MB — 짧은 발화용 마이크 녹음이면 충분한 여유
const ALLOWED_MIME_PREFIXES = ["audio/webm", "audio/ogg", "audio/wav", "audio/mp4", "audio/mpeg", "audio/x-m4a"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const stt = getSTTProvider();
  if (!stt) {
    return NextResponse.json({ error: "GROQ_API_KEY가 설정되지 않아 음성 인식을 쓸 수 없습니다." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "multipart/form-data 요청이 아닙니다." }, { status: 400 });
  }

  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "audio 파일이 필요합니다." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "빈 오디오 파일입니다." }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "오디오 파일이 너무 큽니다(20MB 제한)." }, { status: 413 });
  }
  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))) {
    return NextResponse.json({ error: `지원하지 않는 오디오 형식입니다: ${mimeType}` }, { status: 415 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await stt.transcribe(buffer, mimeType, file.name || "recording.webm");
    return NextResponse.json({ text: result.text });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json({ error: err.message, kind: err.kind, retryable: err.retryable }, { status: 502 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "알 수 없는 오류" }, { status: 500 });
  }
}
