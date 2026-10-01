/** Reject only clear non-speech artifacts, never reject a word just for being short. */
export function validTranscript(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!/[\p{L}\p{N}]/u.test(text)) return "";
  if (/^(?:[\[(]\s*(?:음악|잡음|침묵|박수|music|noise|silence)\s*[\])]|자막\s*(?:제공|제작).*|시청해\s*주셔서\s*감사합니다[.!]?)$/iu.test(text)) return "";
  return text;
}
