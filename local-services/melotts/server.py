"""
MeloTTS 로컬 컴패니언 서비스 — 루프백(loopback) 전용.

CMM AI Tutor 는 브라우저에서 **직접** 이 서버(기본 http://127.0.0.1:8787)를 호출해
한국어 TTS 오디오를 받는다. Vercel 등에 배포된 뷰어 서버는 사용자의 로컬 네트워크에
접근할 수 없으므로, 이 호출은 항상 "사용자 브라우저 → 이 로컬 프로세스"로만 이뤄진다.
(Groq LLM/Whisper 호출과 달리, 이 서비스는 API 키가 필요 없다 — 그래서 브라우저가
직접 불러도 비밀정보 노출 문제가 없다.)

보안 (CLAUDE.md 전역 지침 §20 "localhost TTS loopback only, 최소 CORS, 임의 파일
접근 금지" 반영):
  - 바인딩은 127.0.0.1 만 한다 (0.0.0.0 금지 — README 의 실행 명령을 그대로 따를 것).
    Docker 로 실행할 때도 반드시 `-p 127.0.0.1:8787:8787` 로 호스트 루프백에만 매핑한다.
  - CORS 는 ALLOWED_ORIGINS 환경변수(콤마 구분)에 등록된 origin만 허용한다.
    기본값은 로컬 개발 origin만 허용 — 배포된 도메인(예: Vercel URL)은 직접 등록해야 한다.
  - 입력 길이를 제한한다(텍스트 최대 2000자) — 큰 페이로드로 서버를 묶어 두는 것을 막는다.
  - 파일 시스템 경로를 입력으로 받지 않는다 — 오직 텍스트→오디오 변환 한 가지 동작만 한다.
"""
import io
import os
import sys
from pathlib import Path

# 이 파일 옆의 vendor/(MeloTTS 소스, CMM 패치 적용됨)와 winshim/(Windows용
# eunjeon 대체 shim — README 참고)을 sys.path에 넣는다. 실행 위치(cwd)에
# 상관없이 항상 이 파일 기준 상대 경로로 찾는다.
_HERE = Path(__file__).resolve().parent
for _sub in ("winshim", "vendor"):
    _path = str(_HERE / _sub)
    if _path not in sys.path:
        sys.path.insert(0, _path)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

MAX_TEXT_LENGTH = 2000
DEFAULT_SPEAKER = "KR-Default"

_allowed_origins = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]

app = FastAPI(title="CMM MeloTTS Companion", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["content-type"],
    allow_credentials=False,
)

_tts = None
_speaker_id = None


def _get_model():
    """첫 요청에서만 모델을 불러온다(한국어 1개 언어만 — 다른 5개 언어는 로드하지 않는다)."""
    global _tts, _speaker_id
    if _tts is None:
        from melo.api import TTS  # 무거운 import라 지연 로드

        device = os.environ.get("MELOTTS_DEVICE", "auto")
        tts = TTS(language="KR", device=device)
        spk2id = tts.hps.data.spk2id
        # spk2id는 melo.utils.HParams(dict가 아님) — __iter__가 없어 iter()가
        # __getitem__(0)로 잘못 빠진다. .keys()로 순회해야 한다.
        speaker_name = DEFAULT_SPEAKER if DEFAULT_SPEAKER in spk2id else next(iter(spk2id.keys()))
        _tts = tts
        _speaker_id = spk2id[speaker_name]
    return _tts, _speaker_id


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    speed: float = Field(1.0, ge=0.5, le=1.6)


@app.get("/health")
def health():
    return {"status": "ok", "language": "KR", "modelLoaded": _tts is not None}


@app.post("/synthesize")
def synthesize(payload: SynthesizeRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text가 비어 있습니다.")
    try:
        tts, speaker_id = _get_model()
    except Exception as exc:  # noqa: BLE001 — 모델 로드 실패(다운로드 실패 등)를 그대로 알린다
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=503, detail=f"모델을 불러오지 못했습니다: {exc}") from exc

    try:
        buf = io.BytesIO()
        tts.tts_to_file(text, speaker_id, buf, speed=payload.speed, format="wav", quiet=True)
        buf.seek(0)
        return Response(content=buf.read(), media_type="audio/wav")
    except Exception as exc:  # noqa: BLE001 — 합성 실패를 502로 알려 클라이언트가 텍스트로 폴백하게 한다
        raise HTTPException(status_code=502, detail=f"TTS 합성 실패: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    # 반드시 127.0.0.1 — 0.0.0.0으로 바꾸지 않는다(로컬 네트워크 전체에 노출됨).
    uvicorn.run(app, host="127.0.0.1", port=int(os.environ.get("PORT", "8787")))
