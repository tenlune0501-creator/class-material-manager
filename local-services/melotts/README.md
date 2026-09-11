# CMM MeloTTS 로컬 컴패니언

CMM AI Tutor의 한국어 음성 응답(TTS)을 담당하는 **로컬 전용** 서비스입니다.
Vercel에 배포된 뷰어는 사용자의 로컬 네트워크(localhost)에 접근할 방법이 없으므로,
이 서비스는 항상 **사용자의 브라우저가 직접** `http://127.0.0.1:8787` 로 호출합니다
(뷰어 서버를 거치지 않습니다). 실행하지 않아도 CMM Tutor의 텍스트 대화 기능은
정상 동작하고, 음성 재생만 꺼집니다.

## 왜 로컬 프로세스인가

- MeloTTS는 Python + PyTorch 기반이라 Vercel 같은 서버리스 환경에 그대로 올리기
  어렵습니다(콜드스타트마다 수백MB 모델 로드, 실행시간 제한, 바이너리 의존성).
- 그래서 "루프백(loopback) 전용 로컬 서비스 + 브라우저가 직접 호출" 구조를
  택했습니다 — API 키가 필요 없는 TTS이기 때문에 안전하게 브라우저에서 직접 부를
  수 있습니다(반대로 Groq LLM/STT는 API 키가 필요해 뷰어 서버를 거칩니다).

## 설치 (최초 1회)

PowerShell에서:

```powershell
cd local-services/melotts
./setup.ps1
```

이 스크립트가 하는 일:
1. MeloTTS 원본을 고정 커밋(`209145371`)으로 `vendor/`에 clone
2. `overlay/`의 CMM 패치 3개 파일(아래 "Windows 네이티브 설치 문제" 참고)을 그 위에 적용
3. Python 3.10 또는 3.11로 가상환경(`.venv/`) 생성 + 설치

**Python 버전이 중요합니다.** MeloTTS가 고정한 `transformers==4.27.4`는
`tokenizers<0.14`를 요구하는데, `tokenizers` 0.13.x는 Python 3.12+용 Windows
prebuilt wheel이 없어(Rust 컴파일러 필요) 3.12에서는 설치가 실패합니다. 3.10/3.11에는
정상적으로 prebuilt wheel이 있습니다. `setup.ps1`이 이 두 버전을 자동으로 찾습니다.

## 실행

```powershell
local-services/melotts/.venv/Scripts/python.exe local-services/melotts/server.py
```

기본 포트는 8787입니다(`PORT` 환경변수로 바꿀 수 있음). 첫 `/synthesize` 요청 때
한국어 모델(수백MB)을 Hugging Face에서 자동으로 내려받고, 이후 요청부터는 메모리에
올려둔 모델을 재사용합니다(요청마다 다시 로드하지 않음).

확인:
```powershell
curl http://127.0.0.1:8787/health
# {"status":"ok","language":"KR","modelLoaded":false}  ← 첫 synthesize 전
```

CMM 뷰어(`viewer/.env.local`)에 다음을 채우면 브라우저가 이 서비스를 씁니다:
```
NEXT_PUBLIC_MELOTTS_URL=http://127.0.0.1:8787
```
배포된 뷰어(Vercel URL)에서 로컬 TTS를 쓰려면, 아래 CORS 설정에 그 오리진을
추가해야 합니다.

## 보안 (loopback only, 최소 CORS)

- `server.py`는 반드시 `127.0.0.1`에만 바인딩합니다(`0.0.0.0` 금지 — 로컬 네트워크
  전체에 노출됩니다). 코드를 고칠 때 이 값을 바꾸지 마세요.
- CORS는 `ALLOWED_ORIGINS` 환경변수(콤마 구분)에 등록한 origin만 허용합니다.
  기본값은 `http://localhost:3000,http://127.0.0.1:3000`(로컬 `next dev`).
  배포된 뷰어에서도 쓰려면 그 origin을 추가하세요:
  ```powershell
  $env:ALLOWED_ORIGINS = "http://localhost:3000,https://<your-app>.vercel.app"
  ```
- API 키가 없습니다 — 텍스트를 받아 오디오로 바꾸는 것 외에 아무 것도 하지
  않습니다(파일 시스템 경로를 입력으로 받지 않음, 텍스트 길이 2000자 제한).

## Windows 네이티브 설치 문제 (조사·해결 기록)

MeloTTS 공식 문서 자체가 "Windows 사용자는 Docker를 권장한다"고 명시합니다.
실제로 이 환경(Windows, Python 3.12)에서 순정 `pip install -e .`를 시도했을 때
**서로 다른 원인의 빌드 실패 2건**을 만났고, 둘 다 근본 원인은 "한국어만 쓰는데
불필요한 일본어 의존성이 무조건 설치/로드된다"였습니다.

1. **`fugashi`(일본어 MeCab 바인딩)** — Windows용 prebuilt wheel이 없어
   Cython 빌드가 시도되고, `Microsoft Visual C++ 14.0 Build Tools`가 없어 실패.
2. **`tokenizers==0.13.3`**(transformers 고정 버전이 요구) — Python 3.12용
   Windows wheel이 없어 소스 빌드가 시도되고, Rust 컴파일러가 없어 실패.
   → Python 3.10/3.11로 내리면 prebuilt wheel이 있어 해결(위 "설치" 참고).
3. 위 2건을 우회해도, **`eunjeon`**(한국어 형태소 분석기, g2pkk가 Windows에서
   강제로 요구)은 PyPI에 **Python 3.6용 wheel만** 존재해 3.10에서도 설치 불가.
   → `python-mecab-ko`(진짜 Windows wheel 있는 대안 MeCab-ko 바인딩)로 대체.
   `g2pkk`가 `import eunjeon`을 하드코딩해 부르므로, `winshim/eunjeon.py`가
   `python-mecab-ko`를 `eunjeon.Mecab`이라는 이름으로 재노출하는 얇은 호환
   shim 역할을 합니다(제3자 패키지 내부를 고치지 않음).
4. MeloTTS 원본 코드는 언어와 상관없이 **일본어 텍스트 모듈을 무조건 import**합니다
   (`melo/text/cleaner.py`의 최상단 import, `melo/text/__init__.py`의
   `get_bert()`가 7개 언어 bert 함수를 전부 즉시 import). 그 일본어 모듈이
   `import MeCab`(`mecab-python3`+`unidic`, 위 1~3번과는 또 다른 패키지)을
   최상단에서 실행해, 한국어만 쓰더라도 이 import 사슬을 타고 실패합니다.
   → `overlay/text/__init__.py`·`overlay/text/cleaner.py`가 **실제로 쓰는
   언어만 그때그때 import**하도록 바꿨습니다(동작은 그대로 — import 시점만
   늦췄습니다). 다른 언어(EN/JP/ZH/FR/ES)를 실제로 쓰면 그때 정상적으로
   로드됩니다 — 이 패치가 다른 언어 지원을 없앤 것은 아닙니다.

이 4가지를 모두 적용한 뒤 **실제로 한국어 문장을 합성해 WAV로 저장 → 재생 길이·
샘플레이트 확인까지 이 환경에서 직접 검증했습니다**(설치가 됐다는 것만 확인한
게 아닙니다). Docker(MeloTTS 공식 Dockerfile, Linux 컨테이너)를 쓰면 이 4가지
문제가 애초에 발생하지 않지만(Linux에는 각 패키지의 prebuilt wheel이 다 있음),
이 방법이 검증까지 끝난 상태라 기본 경로로 남겨둡니다. Docker로 실행하고 싶다면
`vendor/Dockerfile`(원본)에 `server.py`를 추가해 직접 이미지를 만들어도 됩니다.

## 문제 해결

| 증상 | 원인/조치 |
|---|---|
| `setup.ps1`이 "Python 3.10/3.11을 찾지 못했습니다" | https://www.python.org/downloads/ 에서 3.10 또는 3.11 설치 후 재실행 |
| 첫 요청이 매우 느림(수십 초~수 분) | 첫 요청에서 한국어 모델을 Hugging Face에서 내려받는 중입니다. 이후 요청은 빠릅니다 |
| 브라우저 콘솔에 CORS 오류 | `ALLOWED_ORIGINS`에 뷰어가 실제로 열려 있는 origin(포트 포함)을 추가했는지 확인 |
| `ModuleNotFoundError: No module named 'MeCab'` 등이 다시 보임 | `overlay/`의 패치가 `vendor/`에 제대로 복사됐는지 확인 — `setup.ps1`을 다시 실행 |
| 음성이 아예 안 나오지만 텍스트는 정상 | 정상적인 폴백입니다(요구사항) — 이 서비스가 꺼져 있거나 `NEXT_PUBLIC_MELOTTS_URL` 미설정 |

## 파일 구성

- `server.py` — FastAPI 서버 (loopback only, `/health`, `/synthesize`)
- `winshim/eunjeon.py` — Windows용 eunjeon → python-mecab-ko 호환 shim
- `overlay/` — MeloTTS 원본에 적용하는 CMM 최소 패치 3개 (커밋 대상)
- `setup.ps1` — clone + patch + venv 설치 스크립트
- `requirements-server.txt` — 서버 전용 추가 의존성(FastAPI/uvicorn 등)
- `vendor/`, `.venv/` — `setup.ps1`이 만드는 산출물 (git에 커밋하지 않음, `.gitignore`)

## 라이선스

MeloTTS는 MIT 라이선스입니다(MyShell.ai, 2024). `overlay/`의 3개 파일은 그 원본을
최소 수정한 파생본입니다.
