/** API auth expiry must not surface as a JSON syntax error after an HTML redirect. */
export async function readTutorResponse(response: Response) {
  if (response.status === 401 || (response.redirected && new URL(response.url).pathname === "/login")) {
    throw new Error("로그인이 만료되었습니다. 다시 로그인한 뒤 이 Lesson으로 돌아와 주세요.");
  }
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(response.status === 413 ? "녹음 파일이 너무 큽니다. 더 짧게 나누어 말씀해 주세요." : "서버 응답을 읽을 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  return response.json();
}
