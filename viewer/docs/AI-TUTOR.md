# AI Tutor

CMM을 "자료를 읽는 곳"에서 "지난 진도를 이어서 실제로 공부하는 곳"으로 확장하는 기능.
`/tutor` 하나의 화면이 시작(지난 진도 확인) → 대화(현재 Lesson 기반 과외) → 종료(요약
확인·저장)까지를 담당한다.

이 문서는 다음 작업자가 코드를 다시 읽지 않고도 재개할 수 있도록 아키텍처·결정
근거·한계를 정리한다. 최종 사용자 흐름 확정 문서는 `PROJECT_CONTEXT.md`, 커리큘럼
콘텐츠 자체는 `curriculum/README.md` 참고.

## 왜 새 스키마를 거의 만들지 않았는가

2026-09-07 `sync-curriculum`(`curriculum/README.md`)이 이미 아래를 만들어 뒀다:

- **콘텐츠**: `learning_tracks` → `learning_chapters` → `learning_lessons` →
  `lesson_sections` / `lesson_code_examples`, `project_learning_units` 등 (읽기 전용,
  `sync-curriculum` CLI만 씀)
- **사용자 진도/노트/복습**: `user_lesson_progress` / `user_project_progress` /
  `user_learning_notes` / `user_review_items` (Schema v2.1,
  `20260906120003_create_user_learning.sql`) — RLS로 `auth.uid() = user_id` 스코프,
  뷰어가 직접 읽고 쓴다.
- `curriculum/README.md` 자체가 "뷰어 변경·`USE_CMM_FOR_STUDY.md`는 이번 골격에 포함되지
  않음(의도적)"이라고 명시해 뒀다 — **이 작업이 바로 그 다음 단계**다.

그래서 이번에 추가한 것은 **`tutor_sessions` 테이블 하나뿐**이다
(`supabase/migrations/20260911000000_create_tutor_sessions.sql`). 기존 4개 테이블은
"현재 진도"를 담당하고(레슨당 행 1개, 세션을 거듭할수록 덮어씀), `tutor_sessions`는
"세션 이력"을 담당한다(세션 1회 = 행 1개, 시작/종료 시각·그 세션의 요약·그 세션이 끝나며
추천한 다음 Lesson). 종료 확정 시 이 4+1개 테이블에 **함께** 쓴다
(`lib/tutor/session.ts:finalizeSession`).

`tutor_sessions.next_target_*`는 "저장된 다음 Lesson 포인터" 역할도 겸한다 — 다음 실행 때
`lib/tutor/progress.ts:computeNextLesson`이 이 값을 먼저 확인하고, 무효(대상이 사라졌거나
이미 완료됨)면 커리큘럼 순서로 재계산한다.

## 아키텍처 개요

```
브라우저 (components/tutor/TutorApp.tsx, "use client")
  │
  ├─ 텍스트 대화 ───────► app/api/tutor/session/[id]/message  ──► GroqQwenProvider ──► Groq API
  ├─ 마이크 녹음 ───────► app/api/tutor/stt                    ──► GroqWhisperProvider ──► Groq API
  ├─ 학습 종료 초안 ─────► app/api/tutor/session/[id]/summarize ──► GroqQwenProvider ──► Groq API
  ├─ 저장하고 종료 ─────► app/api/tutor/session/[id]/finish    ──► lib/tutor/session.ts ──► Supabase(DB)
  │
  └─ 음성 재생(TTS) ────────────────────────────────────────► http://127.0.0.1:8787 (로컬, 직접 호출)
                                                                (local-services/melotts)
```

**왜 TTS만 브라우저가 직접 부르는가**: Vercel에 배포된 뷰어(서버리스)는 사용자의
localhost에 접근할 방법이 없다. LLM/STT는 API 키가 필요해 서버(Next.js API route)를
거치고, TTS(MeloTTS)는 키가 필요 없어 안전하게 브라우저가 직접 부른다. 이 결정 때문에
로컬 TTS 서비스는 "loopback + CORS allowlist"로만 방어한다
(`local-services/melotts/server.py`, `local-services/melotts/README.md`).

## 파일 구성

```
viewer/
  lib/tutor/
    providers/
      types.ts             LLMProvider / STTProvider / TTSProvider 인터페이스 + ProviderError
      groq-qwen.ts          GroqQwenProvider (LLM)
      groq-whisper.ts       GroqWhisperProvider (STT)
      melotts-local.ts      MeloTTSProvider (TTS, client 전용)
      index.ts              서버 전용 팩토리 (getLLMProvider/getSTTProvider)
    context.ts              현재 Lesson 기준 system prompt 빌더 (길이 상한 포함)
    progress.ts             진도/세션/복습 조회 + computeNextLesson (SELECT만)
    session.ts              세션 시작/종료 + 4개 테이블 upsert (쓰기)
  app/api/tutor/
    session/start/route.ts
    session/[id]/message/route.ts
    session/[id]/summarize/route.ts
    session/[id]/finish/route.ts
    session/[id]/abandon/route.ts
    stt/route.ts
  app/tutor/page.tsx         서버: getResumeState() → TutorApp에 props로 전달
  components/tutor/TutorApp.tsx   클라이언트: 시작/대화/요약 상태 기계 전체
  public/manifest.webmanifest, sw.js, icon-*.png   PWA
  scripts/generate-pwa-icons.mjs   아이콘 생성 스크립트 (1회성, sharp 사용)

local-services/melotts/       MeloTTS 로컬 컴패니언 (별도 README.md 참고)

supabase/migrations/20260911000000_create_tutor_sessions.sql
```

## Provider 경계 (교체 보험)

`lib/tutor/providers/types.ts`의 `LLMProvider` / `STTProvider` / `TTSProvider` 세
인터페이스만이 교체 지점이다. 이번에 실제로 구현한 것은 `GroqQwenProvider` /
`GroqWhisperProvider` / `MeloTTSProvider` 셋뿐이고, 다른 Provider(OpenAI, 로컬 LLM,
Piper 등)는 만들지 않았다. 복잡한 DI 프레임워크 없이 `providers/index.ts`의 함수형
팩토리로 충분하다 — `GROQ_API_KEY`가 없으면 `null`을 돌려주고, 부르는 쪽이 503으로
안내한다.

### 모델 선택 (2026-09-11, console.groq.com/docs/models 실제 확인)

| 용도 | 모델 id | 비고 |
|---|---|---|
| LLM | `qwen/qwen3.6-27b` | preview, tool calling 지원, 131K context, thinking/non-thinking 모드 전환 가능(`reasoning_effort`). 과외 대화는 저지연 위해 기본 `"none"` |
| STT | `whisper-large-v3-turbo` | production, 저지연 최적화. 정확도가 더 필요하면 `GROQ_STT_MODEL=whisper-large-v3` |

둘 다 `GROQ_LLM_MODEL` / `GROQ_STT_MODEL` 환경변수로 덮어쓸 수 있다(기본값은 코드에
있음). preview 모델은 Groq가 예고 없이 내릴 수 있다 — 그렇게 되면 `.env.local`에
`GROQ_LLM_MODEL`을 다른 값으로 채우기만 하면 된다(코드 변경 불필요).

## Lesson Context — 무료 한도 보호

`lib/tutor/context.ts`가 매 턴 Groq에 보내는 system prompt를 만든다. **전체 DB를
보내지 않는다**:

- 그 Lesson의 섹션 중 핵심 유형만(goal/concept/mechanism/must_know 등, `CORE_SECTION_TYPES`),
  섹션당 700자·전체 4500자 상한.
- 코드 예제는 전체 2400자 상한.
- 그 Lesson의 진도 요약(`user_lesson_progress.last_summary`/`next_start_point`)과
  노트(`user_learning_notes.confusing`/`review_later`)만 — 다른 Lesson·`material_bodies`·
  `comparisons` 전체는 읽지 않는다.

대화 이력은 DB에 저장하지 않는다. `components/tutor/TutorApp.tsx`가 브라우저 메모리에만
들고 있다가 매 `/message` 호출 시 최근 16개(`MAX_HISTORY_MESSAGES`)만 함께 보낸다. 세션이
끝나면(탭을 닫으면) 사라진다 — 남는 것은 사용자가 확정한 요약뿐이다.

## 세션 생명주기

1. **시작** (`app/api/tutor/session/start`) — 같은 대상으로 이미 `active` 세션이 있고
   2시간 이내 활동이 있었으면 그 세션을 이어 받는다. 다른 대상이거나 방치됐으면(2시간
   초과) 기존 세션을 `abandoned`로 정리하고 새로 만든다.
2. **대화** (`/message`) — 서버가 매번 그 Lesson의 최신 context를 다시 만든다(클라이언트가
   보낸 system prompt를 신뢰하지 않음). `message_count`/`last_activity_at`만 갱신.
3. **종료 의사 감지** — `학습 종료` 버튼 또는 "오늘/그만/여기까지/끝낼래" 등 패턴
   (`END_INTENT_PATTERN`)이 사용자 메시지에서 보이면 확인 배너만 띄운다(자동 종료 아님).
4. **요약 초안** (`/summarize`) — LLM이 그 세션 대화만 보고 JSON 초안(진행상태/오늘 배운
   내용/헷갈린 점/복습 후보/다음 시작 메모)을 만든다. **저장하지 않는다.**
5. **확인·수정** — 화면에서 전부 편집 가능한 폼으로 보여준다. LLM이 실패해도(429, 키
   없음 등) 빈 폼으로 폴백해 사용자가 직접 채울 수 있다.
6. **저장** (`/finish`, `lib/tutor/session.ts:finalizeSession`) — 사용자가 확정한 값만
   받아 `tutor_sessions`(completed) + `user_lesson_progress`(또는
   `user_project_progress`) + `user_learning_notes`(confusing/review_later 누적) +
   `user_review_items`(복습 후보 → 실제 복습 항목, `prompt_hash = md5(prompt)`)에 반영한다.
   이미 `completed`인 세션에 다시 호출해도 안전하다(중복 제출 무시).

## 다음 Lesson 계산 (`lib/tutor/progress.ts:computeNextLesson`)

단순 "Lesson id + 1"이 아니다:

1. 가장 최근 **완료된** 세션의 `next_target`이 있고 유효하면(대상이 존재하고 아직
   completed가 아니면) 그것을 그대로 쓴다.
2. 아니면 커리큘럼 순서(`learning_tracks.ord` → `learning_chapters.ord` →
   `learning_lessons.ord`, `kind='curriculum'` 트랙만, `lesson_kind='lesson'`만)로 훑어
   `status='learning'`인 것을 최우선으로, 없으면 첫 미완료 Lesson을 고른다.
3. 전부 완료됐으면 `status='review'` 중 가장 오래전에 공부한 것.
4. 그마저 없으면 `null`(커리큘럼 전부 완료).

curriculum의 `prerequisites` 필드는 저작 보조용일 뿐 DB 컬럼이 아니다
(`curriculum/README.md` §4) — 그래서 prerequisite 그래프가 아니라 ord 순서를 근거로 삼는다.
사용자가 "다른 Lesson 선택"으로 직접 고르면 이 계산을 그냥 건너뛴다.

## MeloTTS — Windows 네이티브 설치 (조사·해결 완료)

`local-services/melotts/README.md`에 전체 기록이 있다. 요약: MeloTTS 원본은 Windows에서
Docker를 권장하지만, 실제로는 **한국어만 쓰면 굳이 Docker 없이도 동작한다** — Python
3.10/3.11(3.12는 tokenizers 빌드 실패) + 3개 파일 최소 패치(`overlay/`, 일본어 모듈
불필요 import 지연) + Windows용 형태소 분석기 대체(`winshim/eunjeon.py`,
`python-mecab-ko`로). **이 환경에서 실제로 한국어 문장을 합성해 WAV로 저장하고 재생
길이·샘플레이트까지 확인했다** — 설치만 됐다는 뜻이 아니다.

## PWA

- `public/manifest.webmanifest` — `start_url: "/tutor"`(요구사항: 아이콘 클릭 → 바로
  공부), `display: "standalone"`, 아이콘 3종(192/512/512-maskable).
- `public/sw.js` — Next.js 정적 빌드 자산(`_next/static/**`)과 아이콘만 캐시한다.
  페이지 내비게이션과 `/api/**`는 **절대 캐시하지 않는다**(요구사항: 하루 첫 접속 갱신·
  session/progress·AI API·사용자별 동적 데이터를 stale 캐시하지 않음).
- 전체 오프라인 기능은 범위 밖 — 오프라인 폴백 페이지도 만들지 않았다.

## CMM Tutor 원클릭 launcher (Windows, 2026-09-12 완료)

바탕화면의 `CMM Tutor` 아이콘 하나로 "MeloTTS 준비 → Production CMM을 독립 앱 창으로
실행"까지 하기 위한 것이다. **AI Tutor 기능 자체를 바꾸지 않는다** — Groq
Provider·context builder·session/progress·MeloTTS 자체 구현은 전혀 손대지 않았다.
Electron/Tauri/설치형 앱을 새로 만들지 않고 기존 3가지(Production Vercel, 로컬
MeloTTS, OS 브라우저의 app 모드)를 그대로 이어 붙이기만 한다.

### 파일 구성

```
CMMTutor.cmd                        바탕화면 바로가기의 target(더블클릭 진입점)
CMMTutor-stop.cmd                   launcher가 시작한 MeloTTS만 안전하게 종료
cmm-tutor.ico                       바로가기 아이콘(기존 PWA icon-192.png를 ICO로 감싼 것)
scripts/
  cmm-tutor-launcher.ps1            실제 로직 — MeloTTS 확인/시작 → /health 대기 → 앱 창 실행
  cmm-tutor-stop.ps1                launcher-started MeloTTS만 종료(프로세스 트리 인식)
  install-cmm-shortcut.ps1          바탕화면 바로가기 생성(npm run cmm-install-shortcut)
  generate-launcher-icon.mjs        cmm-tutor.ico 생성 스크립트(1회성, 재실행 가능)
```

`.cmd` 파일은 `%~dp0`(자기 자신의 위치)를 기준으로 `.ps1`을 호출한다 — 저장소를
어디에 두거나 경로에 공백이 있어도 그대로 동작한다(절대경로를 하드코딩하지 않음).

### 실행 흐름 (`scripts/cmm-tutor-launcher.ps1`)

1. `http://127.0.0.1:8787/health` 로 MeloTTS 상태 확인.
   - `{"status":"ok","language":"KR"}` 를 돌려주면 **그대로 재사용**(중복 실행 안 함).
   - 응답이 없는데 8787을 다른 프로세스가 쓰고 있으면(`Get-NetTCPConnection`) 그
     프로세스를 임의로 종료하지 않고, PID를 알려준 뒤 즉시 중단한다.
   - 8787이 완전히 비어 있으면 `local-services/melotts/.venv/Scripts/python.exe
     server.py` 를 새로 실행한다. **기존 venv를 그대로 쓴다** — 새 Python 환경을
     만들거나 `pip install`을 다시 하지 않는다. venv 자체가 없으면(설치 전) 설치를
     대신 진행하지 않고 README 안내로 넘기며, 음성 없이 텍스트 Tutor로 계속한다.
2. 최대 120초, 2초 간격으로 `/health` 를 다시 확인(bounded retry). 준비되기 전에는
   브라우저를 열지 않는다. 시간 안에 준비되지 않아도(첫 실행 모델 다운로드가 오래
   걸리는 경우 등) 텍스트 Tutor는 쓸 수 있으므로 계속 진행한다.
3. Chrome → Edge 순서로 설치 여부를 확인해(레지스트리 `App Paths` 우선, 표준 설치
   경로가 다음 순위) `--app=https://class-material-manager-dusky.vercel.app/tutor`
   로 독립 앱 창을 연다. 둘 다 없으면 시스템 기본 브라우저로 일반 탭으로 연다.

### MeloTTS 자동 시작 — 기존 환경만 재사용

- 새 Python 환경을 만들지 않는다. `local-services/melotts/.venv`가 이미 있어야 하고,
  없으면 launcher가 설치를 대신하지 않는다(`README.md`의 `./setup.ps1`을 사용자가
  직접 실행해야 함 — 이번 launcher 작업으로 그 설치 스크립트를 건드리지 않았다).
- **실제 구성 확인 결과**: 이 환경의 Python 3.10 venv는 `.venv\Scripts\python.exe`가
  실제 인터프리터(`...\Python310\python.exe`)를 **자식 프로세스로 재실행**하고,
  포트 8787을 실제로 리스닝하는 것은 그 자식 쪽이다. `Start-Process`가 돌려주는
  PID(부모)와 포트를 실제로 쓰는 PID(자식)가 다를 수 있다는 뜻이라, 종료 스크립트는
  **프로세스 트리**(부모 + 모든 자손) 단위로 확인·종료하도록 만들었다(아래 참고).
- loopback(127.0.0.1)만 쓴다 — launcher 코드 어디에도 `0.0.0.0`을 지시하지 않는다.
  CORS·`/synthesize`·기존 Windows 패치(`overlay/`, `winshim/`)는 전혀 건드리지 않았다.

### 포트 8787 충돌 처리

`Get-NetTCPConnection -LocalPort 8787 -State Listen` 으로 소유 PID를 확인한다.
`/health`가 CMM MeloTTS로 확인되지 않는데 그 포트를 누가 쓰고 있으면, PID를 화면에
보여주고 **launcher는 즉시 중단한다** — 강제 종료하지 않는다. 사용자가 작업
관리자에서 직접 확인한 뒤 다시 실행하면 된다.

### 앱 종료 정책 (선택한 방식과 이유)

브라우저 app 모드 창이 실제로 "닫혔는지"를 감지하는 것은 신뢰성 있게 구현하기
어렵다(Chrome이 여러 프로세스로 쪼개져 있고, 이미 떠 있는 Chrome 인스턴스가 있으면
새 요청은 그 인스턴스로 흡수돼 launcher 프로세스 자체는 바로 끝난다). 그래서 **오탐
종료보다 안전을 선택**했다:

- launcher는 앱 창이 닫히는 시점을 감지하지 않는다.
- launcher가 이번 실행에서 새로 MeloTTS를 시작했으면 그 PID(정확히는 프로세스
  트리 루트 PID)를 `local-services/melotts/.launcher-started.pid` 에 기록한다
  (git에 커밋되지 않음).
- 사용자가 끄고 싶으면 **`CMMTutor-stop.cmd`를 직접 실행**한다.
  `cmm-tutor-stop.ps1`은 마커 PID(와 그 프로세스 트리) 가 **지금도 python
  프로세스이고 지금도 실제로 8787을 리스닝 중일 때만** 종료한다. 마커가 없거나
  (재사용 중이었음), PID가 이미 사라졌거나, 다른 프로세스로 바뀐 것으로 보이면
  아무 것도 종료하지 않고 이유를 설명한다 — pre-existing MeloTTS(사용자가 따로
  실행해 둔 것)를 launcher가 실수로 끄는 사고를 원천적으로 막기 위한 설계다.

### 바탕화면 바로가기

```
npm run cmm-install-shortcut
```

`scripts/install-cmm-shortcut.ps1`이 `[Environment]::GetFolderPath("Desktop")`로
바탕화면 경로를 찾아(OneDrive로 리디렉션된 바탕화면도 정확히 찾는다) `CMM
Tutor.lnk`를 만든다. Target은 `CMMTutor.cmd`, Working Directory는 저장소 루트,
아이콘은 `cmm-tutor.ico`(기존 PWA 아이콘 재사용, 새 디자인 없음). **이미 같은 이름의
바로가기가 있으면 덮어쓰지 않고 그대로 둔다** — 덮어쓰려면 `-Force`:

```
powershell -File scripts/install-cmm-shortcut.ps1 -Force
```

관리자 권한이 필요 없다(바탕화면 바로가기 생성은 항상 일반 사용자 권한으로 가능).
시작 메뉴 바로가기는 이번 범위에 포함하지 않았다(선택 사항으로 명시된 대로).

### 문제 해결

| 증상 | 원인/조치 |
|---|---|
| "포트 8787을 다른 프로그램이 사용 중" 이라며 중단됨 | 작업 관리자에서 해당 PID 확인. CMM MeloTTS가 아니면 그 프로그램을 직접 정리한 뒤 재실행 |
| MeloTTS 준비 대기가 120초를 넘김 | 첫 실행의 한국어 모델 다운로드일 수 있음 — 텍스트 Tutor로 우선 쓰고, 잠시 후 음성 스위치를 다시 켜본다 |
| 앱 창이 로그인 화면으로 뜸 | 정상 — Production 로그인 세션이 그 브라우저 프로필에 없는 것뿐. 로그인하면 그 뒤로는 유지된다(기존 auth 흐름 그대로) |
| `CMMTutor-stop.cmd`가 "종료하지 않습니다"라고만 함 | 정상 — launcher가 시작한 MeloTTS가 아니거나(원래 실행 중이었음) 이미 꺼져 있다는 뜻. pre-existing MeloTTS는 의도적으로 건드리지 않는다 |
| 바로가기를 다시 만들고 싶음 | 바탕화면의 `CMM Tutor.lnk`를 직접 지우거나 `-Force`로 재실행 |
| launcher/바로가기를 완전히 없애고 싶음 | 바탕화면의 `CMM Tutor.lnk`를 지우고, 저장소의 `CMMTutor.cmd`/`CMMTutor-stop.cmd`/`cmm-tutor.ico`/`scripts/cmm-tutor-*.ps1`/`scripts/install-cmm-shortcut.ps1`을 지우면 된다 — MeloTTS·AI Tutor 본체·Production 배포에는 아무 영향 없다(완전히 독립적인 파일들) |
| 실행 시 콘솔 창에 한글이 깨져 보임 | 발생하지 않아야 한다 — `.ps1` 파일이 UTF-8 BOM으로 저장돼 있어야 Windows PowerShell 5.1이 올바르게 읽는다. 직접 수정했다면 저장 시 인코딩을 "UTF-8 with BOM"으로 유지할 것 |

### Production CMM + 로컬 TTS 구조 (다시 정리)

launcher는 이 구조를 바꾸지 않는다 — 이어 붙이기만 한다.

```
Windows 바탕화면 아이콘
  └─ CMMTutor.cmd → cmm-tutor-launcher.ps1
       ├─ (필요시) local-services/melotts 시작 → http://127.0.0.1:8787
       └─ Chrome/Edge --app= 로 https://class-material-manager-dusky.vercel.app/tutor 실행
            └─ 브라우저 안에서 CMM(Vercel)이 그대로 로드됨
                 ├─ 텍스트 대화 → Vercel 서버 → Groq
                 └─ 음성 재생   → 브라우저가 직접 http://127.0.0.1:8787 호출
```

## 알려진 한계 / 다음 단계

- **project_unit 세션 UI 없음** — `user_project_progress`/`lib/tutor/session.ts`가 이미
  대응하지만(`target_kind='project_unit'`), `/tutor` 시작 화면·Lesson 검색은 Lesson만
  다룬다. 확장하려면 같은 패턴으로 Unit 검색/시작 진입점만 추가하면 된다.
- **복습 항목(`user_review_items`) 전용 드릴 UI 없음** — 지금은 개수·대표 Lesson만
  시작 화면에 보여주고, 실제 복습은 그 Lesson의 일반 Tutor 대화로 들어간다. 간격 반복
  퀴즈(정답/오답 체크, `ease`/`interval_days` 갱신)는 구현하지 않았다.
  `PRIORITY`(active/suspended/archived)와 요구사항의 pending/reviewed/resolved는
  개념적으로만 대응시켰다(별도 매핑 컬럼 없음).
- **스트리밍 응답 없음** — LLM 응답은 한 번에 받아 화면에 표시한다(SSE 스트리밍 미구현).
  자연스러운 타자 효과가 필요하면 이후 추가.
- **마크다운 → TTS 변환 시 손실** — `stripMarkdownForSpeech`가 `**bold**`/`` `code` ``/
  헤더를 제거하고 읽으므로, 코드 블록 전체는 음성으로 아예 생략된다(화면에는 그대로
  보인다). 코드를 소리내 읽어주는 기능은 범위 밖.
- **launcher를 반복 실행하면 앱 창이 하나씩 늘어난다** — 같은 URL의 기존 app 창을
  재사용/포커스하는 기능은 의도적으로 만들지 않았다(Chrome/Edge 창 열거는 복잡도
  대비 이득이 적어 단순하게 두기로 함, "CMM Tutor 원클릭 launcher" 절 참고).
- **로그인 세션이 없으면 `/tutor`가 아니라 홈(`/`)으로 착지한다** — 기존
  `lib/supabase/proxy.ts`가 로그인 성공 후 항상 `/`로 보내고 원래 요청 경로로
  돌아가지 않는다(이 동작은 기존 auth 흐름이라 이번 launcher 작업에서 바꾸지
  않았다). 로그인 후 사이드바의 "AI Tutor"를 한 번 더 눌러야 한다. 세션이 살아
  있는 일반적인 경우(로그인 뒤 매일 실행)에는 영향 없음.

## Groq 실사용(live) 검증 (2026-09-11 완료)

실제 `GROQ_API_KEY`로 api.groq.com을 직접 호출해 검증했다. 결과와 재현 방법:

- **자동 라이브 테스트**: `npm run test:live-groq`(`tests/live/groq-live.test.ts`).
  `viewer/.env.local`의 `GROQ_API_KEY`가 비어 있으면 관련 테스트를 스킵하고 이유만
  표시한다(실패 처리 안 함) — 그래서 이 파일이 있어도 키 없는 환경의 `npm test`/CI에는
  영향이 없다(애초에 `npm test`의 glob(`tests/*.test.ts`)에도 안 걸림). 4건 확인:
  Qwen 인증 성공 + 실제 Lesson context(useState) 기준 한국어 응답 + 길이·주제 적합성,
  짧은 대화 응답 지연(<15s), Whisper로 MeloTTS가 만든 실제 한국어 오디오를 원문과
  정확히 일치하게 인식, 잘못된 키의 401 분류.
- **브라우저 종단 간 검증**(agent-browser, 실제 로그인 세션): 세션 시작 → 실제 Qwen
  대화 2턴(응답이 직전 세션에서 저장된 `user_learning_notes.confusing`을 실제로
  언급하며 개인화됨 — Lesson context가 실전에서 반영됨을 확인) → 음성 on 상태에서
  TTS 실제 재생 → 브라우저의 실제 인증 세션으로 `/api/tutor/stt` 호출(MeloTTS로 만든
  오디오를 "마이크 입력"으로 사용, 원문과 정확히 일치하는 인식 결과) → 학습 종료 →
  실제 LLM 요약 초안(진행 상태를 과대평가하지 않음, Lesson 본문 내용을 실제로 참고한
  "다음 시작 참고사항") → 저장 → 새로고침 시 정확히 복원.
- **회귀 버그 발견·수정**: 이 검증 중 실제로 발견한 버그 — Qwen 응답에 포함된 백틱
  (`` ` ``, 인라인 코드 표기)을 그대로 MeloTTS에 보내면 한국어 심볼 테이블에 없는
  문자라 `KeyError`로 합성이 502로 실패했다. `components/tutor/TutorApp.tsx`에
  `stripMarkdownForSpeech()`를 추가해 TTS로 보내기 직전에 `**bold**`/`` `code` ``/
  헤더/목록 기호를 제거하도록 고쳤다(화면 표시 텍스트는 그대로 마크다운 유지 — 음성
  전송용 사본만 정리한다). MeloTTS 자체 패치(`local-services/melotts/overlay/`,
  `winshim/`)는 손대지 않았다.

## 필요한 환경변수 (`viewer/.env.example` 참고)

| 변수 | 필수 여부 | 설명 |
|---|---|---|
| `GROQ_API_KEY` | Tutor 대화에 필수 | 없으면 Tutor가 안내만 하고 나머지 기능은 정상. **절대 커밋하지 않는다** — `viewer/.env.local`(gitignore 대상)에만 둔다 |
| `GROQ_LLM_MODEL` | 선택 | 기본 `qwen/qwen3.6-27b`(2026-09 기준 console.groq.com/docs/models 실제 확인, preview) |
| `GROQ_STT_MODEL` | 선택 | 기본 `whisper-large-v3-turbo` |
| `NEXT_PUBLIC_MELOTTS_URL` | 선택 | 없으면 텍스트만, 음성 재생 없음. `local-services/melotts` 실행 후 `http://127.0.0.1:8787` |

### 무료 한도 / rate limit

- Groq는 모델별로 분당·일일 토큰 한도가 있다(정확한 수치는 계정별로 다르므로
  console.groq.com/settings/limits 에서 직접 확인). 이 앱은 `viewer/lib/tutor/context.ts`
  의 길이 상한 + 최근 대화 16개(`MAX_HISTORY_MESSAGES`)만 전송해 자연스럽게 한도를
  아낀다.
- 429가 오면 `ProviderError(kind: "rate_limit", retryable: true)`로 분류되고, 화면에는
  "사용량 한도에 도달했습니다. 잠시 후 다시 시도하세요." 가 뜬다(무한 재시도 없음,
  수동 재시도만).
- `test:live-groq`를 반복 실행하면 그만큼 실제 사용량을 쓴다 — CI에 자동 연결하지
  않는다(이 파일이 `npm test`/`tests/*.test.ts` glob에 안 걸리는 이유).

### API Key 보안

- `GROQ_API_KEY`는 서버 전용(`viewer/lib/tutor/providers/index.ts`의 팩토리)에서만
  읽는다 — `NEXT_PUBLIC_` 접두어가 없어 브라우저 번들에 절대 포함되지 않는다.
  (대조: TTS는 키가 필요 없어 `NEXT_PUBLIC_MELOTTS_URL`로 브라우저가 직접 부른다.)
- `viewer/.env.local`은 `viewer/.gitignore`의 `.env*` 규칙으로 항상 git 추적에서
  제외된다. `git status`로 커밋 전에 반드시 확인한다.
- 소스 파일에는 실제 키 값을 절대 넣지 않는다 — `tests/live/groq-live.test.ts`에
  등장하는 `gsk_invalid_test_key_...` 는 401 분류를 확인하기 위한 **의도적으로
  틀린 가짜 값**이다.

### 문제 해결

| 증상 | 원인/조치 |
|---|---|
| Tutor 화면에 "GROQ_API_KEY가 설정되지 않아…" | `viewer/.env.local`에 `GROQ_API_KEY` 확인, dev 서버 재시작(env는 시작 시 1회 로드) |
| 401 | 키가 잘못됐거나 만료됨 — Groq 콘솔에서 재발급 |
| 429 | 무료 한도 초과 — 잠시 후 재시도, 필요하면 유료 tier 검토 |
| 음성이 갑자기 안 나옴(텍스트는 정상) | `local-services/melotts` 프로세스가 죽었는지 `curl http://127.0.0.1:8787/health` 로 확인 |
| TTS가 특정 응답에서만 실패 | 위 "마크다운 → TTS" 한계 참고 — 이미 방어돼 있지만, 새로운 특수기호가 또 나오면 `stripMarkdownForSpeech`에 추가 |
