// Vercel Functions accepts 4.5 MB including multipart framing (verified 2026-10-04):
// https://vercel.com/docs/functions/limitations#request-body-size
// Reserve 0.5 MB for framing/metadata. This limits upload, never recording duration.
export const MAX_STT_AUDIO_BYTES = 4_000_000;
export const AUDIO_TOO_LARGE = "녹음 파일이 너무 큽니다. 더 짧게 나누어 말씀한 뒤 직접 말하기 종료를 눌러 주세요. (업로드 한도 4MB)";
export const RECORDING_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
export function recordingMime(isSupported: (type: string) => boolean): string | undefined {
  return RECORDING_TYPES.find(isSupported);
}
export function recordingFilename(mime: string): string {
  const type = mime.split(";")[0].toLowerCase();
  const extension: Record<string, string> = {
    "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/wav": "wav", "audio/mpeg": "mp3",
  };
  return `recording.${extension[type] ?? "webm"}`;
}
