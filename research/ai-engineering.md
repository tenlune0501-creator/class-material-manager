# 조사 영역: AI Engineering (LLM App Fundamentals + RAG/Agents)

담당: Research Agent 3
조사일(checked_at 공통): 2026-09-06
담당 챕터: `ai-engineering/llm-app-fundamentals`, `ai-engineering/rag-and-agents`
(평가/eval 는 Agent 4 담당 `ai-engineering/prompt-and-evaluation` 로 포인터만 남김)

> 주의: 이 문서는 조사 노트다. Lesson 본문을 집필하지 않았고, 커리큘럼 YAML 도 수정하지 않았다.
> 아래 개념·출처는 집필 단계에서 그대로 근거로 쓸 수 있도록 정리한 것이다.

---

## 챕터 준비도 판정 (Readiness)

### `ai-engineering/llm-app-fundamentals` → **READY**

근거:
- OpenAI 공식 문서(Text generation, Function calling, Structured Outputs, Streaming)와 Anthropic 공식
  문서(Context windows, Tool use, API errors)가 이 챕터가 요구하는 개념 전부를 1차 출처로 커버한다:
  메시지/역할, 토큰·컨텍스트 윈도, 구조화 출력, 도구/함수 호출 기초, 스트리밍, 에러·재시도, 비용·지연.
- 제공자 중립 개념(LLM 이란 무엇인가, 토큰, in-context learning, 한계)은 Hugging Face LLM Course 로
  보완 가능.
- 기존 골격 Lesson `ai-engineering/llm-app-fundamentals/prompts-tokens-context` 가 이 범위와 정확히 맞는다.
- 유일한 공백: CMM 보유 자료에 실습 코드가 없다 → 코드 예제는 공식 문서 기반 `generated_minimal` 로
  새로 만들어야 한다(지어내는 게 아니라 공식 예제를 최소화해서 옮김). 집필 자체를 막는 공백은 아님.

권장 첫 Lesson: **"LLM API와 Context 기본"**
(요청/응답 구조 · system/developer/user/assistant 역할 · 토큰과 context window · 대화 상태 누적 ·
비용·지연이 토큰에 비례한다는 감각. 스트리밍·구조화 출력·도구 호출은 후속 Lesson.)

### `ai-engineering/rag-and-agents` → **PARTIAL** (RAG 절반은 READY, 에이전트 절반은 개념 수준까지만)

근거:
- **RAG/검색 쪽은 READY 수준**: 임베딩·유사도·청킹·검색·벡터 검색·RAG 파이프라인·실패 모드·하이브리드
  검색·리랭킹이 OpenAI Retrieval, Anthropic Embeddings, Anthropic Contextual Retrieval, HF RAG
  cookbook 로 모두 1차 출처 확보됨.
- **에이전트 쪽은 PARTIAL**: 에이전트 정의·에이전트 루프·도구 사용·workflow vs autonomous·워크플로
  패턴은 Anthropic "Building effective agents" + OpenAI Agents SDK 문서로 개념 수준까지 확보됨.
  그러나 state/memory/planning 의 깊은 동작, "벡터 데이터베이스" 를 인프라로서 독립적으로 설명하는
  1차 문서(pgvector/Pinecone/Chroma 등)는 이번 라운드에서 확보하지 않음 → 개념 정의 수준으로만 서술 가능.
- 멀티 에이전트는 과제 지시대로 후속 범위로만 링크(집필 안 함).
- 기존 골격 Lesson 은 `retrieval-augmented-generation` 단일(90분)뿐 → 집필 시 최소 2~3개 Lesson
  (임베딩·검색 / RAG 흐름 / 에이전트)으로 쪼개는 것을 권장. (아래 "기존 Curriculum과 연결" 참고)

권장 첫 Lesson: **"RAG가 필요한 이유와 기본 흐름"**
(LLM 지식의 한계·환각·사설/최신 데이터 문제 → ingestion→chunk→embedding→retrieval→context
construction→generation 흐름 → citation/grounding → "RAG 가 필요한 경우 vs 아닌 경우".
벡터 DB 세부, 하이브리드 검색, 리랭킹, 에이전트는 후속 Lesson.)

---

## 기존 CMM 자료 확인

### AI/LLM 관련 실제 자료 (읽고 확인함)

| docId | 제목 | 위치 | 성격 |
|---|---|---|---|
| `10fqbfUnvErZI2L0-iL5rbUwfGLhxq6TNa1bBmPewq-k` | open AI - image generator | `data/materials/others/ai/open AI - image generator--10fqbfUn.md` | 바닐라 JS + Bootstrap 로 DALL·E 이미지 생성 API 호출. API 키를 브라우저에서 입력받아 사용. |
| `1f1uVS9cRS0sGrJv9NUSdBZTwTjSJHMGh` | jv_153-5_image_generator_base.zip | `data/materials/others/ai/jv_153-5_image_generator_base.zip--1f1uVS9c.md` | 위 실습의 시작 코드 zip 설명. |
| `16n0hgBx0COr3XsZGxa4FQSeZRpGLGO96` | jv_153-5_image_generator_final.zip | `data/materials/others/ai/jv_153-5_image_generator_final.zip--16n0hgBx.md` | 위 실습의 완성 코드 zip 설명. |
| `1G-txw9xv7fa5BMU2lE7yLk5GcTSLlN46zjol5S3rKLE` | 생성형 AI - React App | `data/materials/others/ai/생성형 AI - React App--1G-txw9x.md` | React + Supabase Edge Function 에서 GPT-4o-mini(레시피 텍스트) + 이미지 생성 모델 호출, 결과를 Supabase DB 저장. 프론트-백 연동 미니프로젝트. |
| `1JkD6XwOOUHfmil1eLM3CTGGbpbgMZI-M9j-sIfnFp9M` | alan API | `data/materials/others/ai/alan API--1JkD6XwO.md` | 오르미 자체 "앨런 AI" API(프록시성)를 Vite React 앱에서 호출. `.env` 로 키 관리, 배포 시 환경변수 등록. |

- `curriculum/lessons/ai-engineering.yaml` 의 `generative-ai-in-frontend` 챕터가 위 자료로 skeleton 3개를
  이미 매핑해 둠(`openai-image-generation`, `generative-ai-react-app`, `alan-api`). 지시대로 **그대로 둔다.**
- `data/references/` 에는 AI/LLM 참조 문서 디렉터리가 **없다** (css/html/javascript/mui/nextjs/react/supabase/typescript 뿐).
- `data/index.json` 전문 검색 결과 임베딩·벡터·RAG·에이전트·function calling·프롬프트 엔지니어링·토큰/컨텍스트
  윈도를 다루는 자료는 **하나도 없음**. AI 자료는 위 5개가 전부.

### 판정

기존 AI 자료는 **"프론트엔드에서 생성형 AI API 붙이기"** 수준의 얇은 미니프로젝트 묶음이다.
- 다루는 것: API 키 관리, fetch 로 REST 호출, 응답을 화면에 렌더, (1건) Edge Function 경유 호출.
- **다루지 않는 것**: 메시지/역할 구조, 토큰·컨텍스트 윈도, 구조화 출력, 도구/함수 호출, 스트리밍,
  에러·재시도·비용·지연 설계, 임베딩, 유사도, 청킹, 벡터 검색, RAG 파이프라인, grounding/인용,
  에이전트·에이전트 루프·도구 사용·상태/메모리.

→ 이 자료는 `llm-app-fundamentals` / `rag-and-agents` 의 **대체재가 아니다.** 두 챕터는 외부 공식 문서
기반으로 새로 집필해야 한다. `generative-ai-in-frontend` 는 이 두 챕터의 **선행/실습 앵커**로만 연결한다.

---

## 학습 목표

이 두 챕터를 마치면 학습자는:

1. LLM API 한 번의 호출이 실제로 무엇을 주고받는지 설명할 수 있다 — messages 배열, 역할(system/
   developer/user/assistant), 토큰, context window, 응답의 구조(텍스트 + 도구호출 + 사용량).
2. 대화 상태가 매 턴 누적되며 비용·지연이 토큰 수에 비례한다는 것을 이해하고, context window 한계에
   부딪혔을 때 무슨 일이 일어나는지 안다.
3. 자유 텍스트 파싱 대신 **구조화 출력(JSON Schema)** 으로 결과를 받는다.
4. **도구/함수 호출**의 왕복(모델이 호출 요청 → 앱이 실행 → 결과 반환 → 모델이 최종 응답)을 직접 구현할 수 있다.
5. **스트리밍**이 왜 필요한지(지연·UX), 응답 처리 방식이 어떻게 달라지는지 안다.
6. 에러(429/5xx/529)와 재시도(지수 백오프, `retry-after`)를 처리할 수 있다.
7. **임베딩**이 무엇인지(부동소수 벡터), 유사도(코사인/내적)로 의미 검색이 되는 원리를 설명할 수 있다.
8. **RAG 파이프라인**을 단계로 그릴 수 있다: 수집 → 청킹 → 임베딩 → (벡터)저장 → 검색 → 컨텍스트 구성 → 생성.
9. RAG 의 실패 모드(청크가 문맥을 잃음, 검색 실패, 근거 없는 생성)와 **RAG 가 필요한 경우 vs 아닌 경우**를 판단할 수 있다.
10. **에이전트**의 개념(도구를 루프에서 쓰는 LLM), 에이전트 루프(행동→관찰→반복), workflow(고정 경로)
    vs autonomous agent(모델이 경로를 정함)의 차이를 설명할 수 있다.

명시적 비목표(이번 라운드): 모델 학습/파인튜닝, CUDA/TensorRT/vLLM/Triton, Kubernetes, 서빙 인프라,
멀티 에이전트 아키텍처. (→ "향후 확장"에 roadmap 링크만.)

---

## 선행 개념

집필 시 "다시 가르치지 않고 짚고 넘어갈" 것들:

- **HTTP/REST 요청·응답, JSON** — CMM `web-foundations` / `javascript` 트랙에서 다룸.
- **fetch / async·await, 환경변수로 API 키 관리** — `javascript`, 그리고 기존 AI 자료
  (`alan API`, `생성형 AI - React App`)에서 이미 실습됨. → `generative-ai-in-frontend` 를 선행으로 링크.
- **서버(엣지 함수)에서 API 키를 숨기는 이유** — `data-and-backend` / `deployment-and-infra` 와 겹침.
  브라우저에서 키를 직접 쓰는 기존 `open AI - image generator` 자료는 "왜 실무에선 이렇게 안 하나"의
  대조 예로 쓸 수 있음.
- **비동기 스트림 / Server-Sent Events 개념** — 스트리밍 Lesson 의 선행. 얕게만 필요.
- **함수 시그니처와 JSON Schema 감각** — 구조화 출력 / 도구 호출 Lesson 의 선행. `typescript` 트랙과 연결.

선행 Lesson(같은 트랙 내): `generative-ai-in-frontend/*` → `llm-app-fundamentals/*` → `rag-and-agents/*`.

---

## 권장 학습 순서

1. **LLM 이란 무엇인가 / 토큰·다음 토큰 예측 / 한계(환각·편향·지식 컷오프)** — 제공자 중립, 짧게.
   (HF LLM Course)
2. **LLM API와 Context 기본** — messages·역할, 요청/응답 구조, 토큰, context window, 대화 상태 누적,
   비용·지연. (OpenAI Text generation + Anthropic Context windows) ← `llm-app-fundamentals` 첫 Lesson
3. **구조화 출력** — JSON Schema, strict, refusal, 자유 텍스트 파싱을 왜 피하나. (OpenAI Structured Outputs)
4. **도구/함수 호출 기초** — 스키마 정의 → `tool_use`/tool call → 앱이 실행 → 결과 반환 → 최종 응답.
   client tool vs server tool. (Anthropic Tool use + OpenAI Function calling)
5. **스트리밍** — SSE, delta/부분 토큰, 지연·UX, 처리 방식 변화. (OpenAI Streaming + Anthropic Streaming)
6. **에러·재시도·비용·지연** — 429/5xx/529, 지수 백오프, `retry-after`, 토큰 기반 비용, 긴 요청. (Anthropic API errors)
7. **임베딩과 의미 검색** — 벡터, 코사인/내적 유사도, 차원, query vs document 임베딩, 최근접 이웃 검색.
   (OpenAI Embeddings + Anthropic Embeddings)
8. **RAG가 필요한 이유와 기본 흐름** — 수집→청킹→임베딩→저장→검색→컨텍스트 구성→생성, grounding/인용,
   RAG 필요/불필요 판단. (OpenAI Retrieval + HF RAG cookbook) ← `rag-and-agents` 첫 Lesson
9. **RAG 심화** — 청크 문맥 손실, 하이브리드 검색(BM25+임베딩, rank fusion), 리랭킹, 벡터 DB 의 역할,
   RAG 실패 모드. (Anthropic Contextual Retrieval)
10. **에이전트 기초** — 도구를 루프에서 쓰는 LLM, 에이전트 루프(행동→관찰→반복), state/memory/planning,
    workflow vs autonomous, 워크플로 패턴(프롬프트 체이닝·라우팅·병렬화·orchestrator-workers·
    evaluator-optimizer). (Anthropic Building effective agents + OpenAI Agents SDK)
11. (포인터) **출력 평가·회귀 테스트** → Agent 4 담당 `prompt-and-evaluation`.

---

## 필수 개념

> 형식: 개념 / 왜 / 선행 / mastery 후보 / 출처 / URL / publisher / official / checked_at / 상태 /
> 대상 챕터 / Lesson 후보 / 라이선스 노트

### A. LLM App Fundamentals

#### A1. 메시지와 역할 (messages / roles)
- **개념**: LLM API 호출은 역할이 붙은 메시지들의 배열. system/developer(앱 개발자 지시, 우선순위 상),
  user(최종 사용자 입력), assistant(모델 출력). 응답의 `output`/`content` 는 텍스트 외에 도구호출·
  추론 토큰 정보 등 여러 항목을 담을 수 있다. 프롬프트 엔지니어링 = 모델에 줄 지시를 잘 쓰는 일.
- **왜**: 모든 LLM 앱의 최소 단위. "프롬프트 문자열 하나" 가 아니라 구조가 있다는 걸 먼저 잡아야 함.
- **선행**: HTTP/JSON, fetch.
- **mastery 후보**: required
- **출처**: OpenAI — "Text generation" 가이드
- **URL**: https://developers.openai.com/api/docs/guides/text (구 https://platform.openai.com/docs/guides/text 에서 301 리다이렉트)
- **publisher**: OpenAI · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals`
- **Lesson 후보**: "LLM API와 Context 기본"
- **라이선스 노트**: OpenAI 문서 © OpenAI. 개념 인용·재기술은 출처 표기하면 가능. 장문 그대로 복사 금지.
- **needs_followup**: 역할 이름은 제공자마다 다름(Anthropic 은 `system` 파라미터 + user/assistant).
  집필 시 "제공자마다 이름은 다르나 개념은 같다"로 중립화. Anthropic 쪽 대응은 A2/A5 출처에서 교차 확인됨.

#### A2. 토큰과 컨텍스트 윈도 (tokens / context window)
- **개념**: context window = 모델이 응답을 생성할 때 참조할 수 있는 모든 텍스트(응답 자체 포함)의
  "작업 기억". 요청의 모든 것(system 프롬프트, 모든 메시지, 도구 정의, 이미지/문서)과 모델이 생성한
  출력이 전부 토큰으로 카운트된다. 대화가 진행되면 매 턴이 누적된다(이전 턴 보존). 토큰 수가 커질수록
  정확도·recall 이 떨어지는 현상 = *context rot* → "얼마나 많이" 보다 "무엇을" 넣는지가 중요.
  입력이 이미 윈도를 넘으면 400 에러("prompt is too long"). 사용량은 응답의 `usage` 필드로 보고됨.
  요청 전 추정은 token counting API.
- **왜**: 비용·지연·품질·에러가 전부 여기서 갈린다. LLM 앱 설계의 핵심 제약.
- **선행**: A1.
- **mastery 후보**: required
- **출처**: Anthropic — "Context windows"
- **URL**: https://platform.claude.com/docs/en/build-with-claude/context-windows
  (구 https://docs.claude.com/en/docs/build-with-claude/context-windows 에서 302 리다이렉트)
- **publisher**: Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals`
- **Lesson 후보**: "LLM API와 Context 기본"
- **라이선스 노트**: Anthropic 문서 © Anthropic. 개념 인용·재기술 시 출처 표기. 장문 복사 금지.
- **needs_followup**: 구체 윈도 크기·모델명(예: 200k vs 1M)은 모델 세대마다 바뀜 → Lesson 에는
  "모델마다 다르며 문서에서 확인" 으로 쓰고 숫자를 본문에 못박지 않는다.

#### A3. 구조화 출력 (structured outputs)
- **개념**: 모델 출력이 개발자가 준 JSON Schema 를 따르도록 강제하는 기능. 자유 텍스트를 파싱/재시도할
  필요가 없어짐(타입 안전), 안전상 거부(refusal)는 스키마 대신 별도 `refusal` 필드로 프로그램적으로
  감지 가능, 강한 포맷 지시 프롬프트가 불필요. "유효한 JSON"만 보장하는 JSON mode 와 달리 **스키마
  준수**까지 보장(strict). 한계: 일부 JSON Schema 기능 미지원, max token 초과 시 스키마가 깨질 수 있음,
  입력이 스키마와 모순되면 여전히 환각 가능.
- **왜**: 실무 LLM 앱은 대부분 결과를 코드로 이어 쓴다. 문자열 정규식 파싱은 회귀의 온상.
- **선행**: A1, JSON Schema 감각(`typescript` 트랙).
- **mastery 후보**: required
- **출처**: OpenAI — "Structured Outputs"
- **URL**: https://developers.openai.com/api/docs/guides/structured-outputs
- **publisher**: OpenAI · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals`
- **Lesson 후보**: "구조화 출력으로 결과 받기"
- **라이선스 노트**: © OpenAI. 개념 재기술 + 출처 표기.
- **needs_followup**: Anthropic 도 structured outputs / `output_config.format` 을 지원(A6/에러 문서에서
  언급 확인). 집필 시 양쪽 다 있음을 명시.

#### A4. 도구 / 함수 호출 기초 (tool use / function calling)
- **개념**: 모델이 개발자가 정의한 함수를 "호출 요청" 형태로 반환하고, 앱이 실제 실행 후 결과를 다시
  모델에 돌려주면 모델이 최종 답을 만든다. 흐름(5단계): ①도구 목록과 함께 요청 → ②모델이 tool call
  반환(`stop_reason: "tool_use"`) → ③앱이 입력으로 코드 실행 → ④결과를 담아 2차 요청(`tool_result`)
  → ⑤모델이 최종 응답(또는 추가 호출). 도구 정의 = name + description + JSON Schema(`input_schema` /
  `parameters`). client tool(앱에서 실행) vs server tool(제공자 인프라에서 실행: 웹검색·코드실행 등).
  `tool_choice` 로 자동/강제 제어. `strict: true` 로 스키마 일치 보장. 초기 도구 수는 적게(정확도),
  이름·설명을 명확히. 도구 정의·`tool_use`·`tool_result` 블록 자체가 토큰 비용에 포함된다.
- **왜**: LLM 을 외부 시스템·최신 데이터와 잇는 표준 방법이자, 에이전트의 토대.
- **선행**: A1, A3(스키마).
- **mastery 후보**: required
- **출처**: Anthropic — "Tool use with Claude" (overview) / OpenAI — "Function calling"
- **URL**: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview ·
  https://developers.openai.com/api/docs/guides/function-calling
- **publisher**: Anthropic / OpenAI · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals` (기초) + `ai-engineering/rag-and-agents` (에이전트에서 재사용)
- **Lesson 후보**: "도구 호출 왕복 직접 구현하기"
- **라이선스 노트**: © Anthropic / © OpenAI. 공식 코드 예제는 최소화해서 `generated_minimal` 로 재작성,
  출처 주석. 장문 복사 금지.

#### A5. 대화 상태 / 멀티턴 (conversation state)
- **개념**: 멀티턴 대화는 이전 메시지를 매번 다시 보내거나(수동), 제공자가 상태를 이어주는 방식
  (예: 이전 응답 id 참조)으로 유지된다. 어느 쪽이든 이전 턴이 context window 토큰을 계속 먹는다.
  도구 사용 사이클에서는 assistant 턴(도구호출 포함)과 `tool_result` 를 정확한 순서로 다시 넣어야 한다.
- **왜**: 챗봇/에이전트에서 "왜 갈수록 느려지고 비싸지나", "왜 앞 내용을 잊나"를 설명하는 개념.
- **선행**: A1, A2.
- **mastery 후보**: understand
- **출처**: OpenAI — "Text generation" (conversation state) / Anthropic — "Context windows" (progressive token accumulation)
- **URL**: https://developers.openai.com/api/docs/guides/text · https://platform.claude.com/docs/en/build-with-claude/context-windows
- **publisher**: OpenAI / Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals`
- **Lesson 후보**: "LLM API와 Context 기본" 에 포함
- **라이선스 노트**: © 각 사. 개념 재기술 + 출처 표기.

#### A6. 스트리밍 (streaming)
- **개념**: 응답 전체를 기다리지 않고 생성되는 대로 조각(delta)으로 받는다. 기본 전송은 HTTP
  스트리밍(`stream=true`) over Server-Sent Events(SSE). 텍스트는 `*.delta` 이벤트로 증분 전달, 여러 번
  방출. 이유: 긴 출력의 체감 지연 감소·UX. 처리 방식 변화: 단일 응답 객체 대신 타입별 이벤트를
  순회(created/delta/completed/error). 트레이드오프: 부분 출력이라 콘텐츠 모더레이션이 어려움.
  SSE 로 200 응답 이후 스트림 중간에 나는 에러는 표준 에러 처리 경로를 안 탄다(별도 error 이벤트).
- **왜**: 챗 UI 의 사실상 표준. "왜 글자가 타이핑되듯 나오나"를 구현 수준에서 이해.
- **선행**: A1, SSE 개념.
- **mastery 후보**: understand (구현은 practical 로 미니실습 가능)
- **출처**: OpenAI — "Streaming API responses" / Anthropic — "Streaming Messages"
- **URL**: https://developers.openai.com/api/docs/guides/streaming-responses ·
  https://platform.claude.com/docs/en/build-with-claude/streaming
- **publisher**: OpenAI / Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals`
- **Lesson 후보**: "스트리밍 응답 다루기"
- **라이선스 노트**: © 각 사. 개념 재기술 + 출처 표기.

#### A7. 에러 · 재시도 · 비용 · 지연 (errors / retries / cost / latency)
- **개념**: 예측 가능한 HTTP 에러 코드 — 400 invalid_request(형식·컨텍스트 초과·spend limit),
  401 authentication, 403 permission, 413 request_too_large, 429 rate_limit, 500 api_error,
  529 overloaded_error(일시적 과부하). 공식 SDK 는 연결 오류·rate limit·5xx 를 지수 백오프로 기본
  2회 자동 재시도하며 `retry-after` 헤더를 존중(최대 재시도 설정/비활성 가능). 429 는 조직이 rate
  limit/월 사용 한도에 도달했다는 뜻; tier spend-cap 429 는 `retry-after` 없이 계속 실패. 긴 요청은
  스트리밍/배치 API 권장(유휴 연결 끊김 대비). 비용·지연은 근본적으로 **토큰 수**(입력+출력, 도구 정의
  포함)에 비례 — 도구를 켜면 자동 삽입되는 시스템 프롬프트 토큰도 더해진다.
- **왜**: 실서비스에서 안 죽는 LLM 앱을 만들려면 필수. "재시도는 지수 백오프 + retry-after" 습관.
- **선행**: A1, A2, HTTP 상태코드.
- **mastery 후보**: required
- **출처**: Anthropic — "Claude API errors" (+ Tool use 문서의 Pricing 절)
- **URL**: https://platform.claude.com/docs/en/api/errors ·
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#pricing
- **publisher**: Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals`
- **Lesson 후보**: "에러·재시도·비용 감각"
- **라이선스 노트**: © Anthropic. 코드값·개념 재기술 + 출처 표기. 표 전체 복사 금지.
- **needs_followup**: OpenAI 쪽 rate limit/에러 코드 대응표는 이번에 별도로 안 땄음. 개념은 동일하나
  집필 시 OpenAI "Rate limits" 문서 1건 추가 조사 권장.

#### A8. (제공자 중립) LLM 이란 / 토큰 / 한계
- **개념**: LLM = 방대한 텍스트로 학습된, 태스크별 학습 없이 다양한 언어 작업을 하는 모델. 특징:
  스케일(수백만~수천억 파라미터), 범용성, in-context learning(프롬프트 예시로 학습), emergent
  abilities. NLP 작업 분류: 문장/단어 분류, 텍스트 생성(다음 단어 예측), 문맥 기반 QA, 변환(번역·요약).
  한계: 환각(그럴듯한 거짓), 편향(학습 데이터 반영), 진짜 이해 없음(통계적 패턴), 지식 컷오프,
  제한된 컨텍스트 윈도, 계산 비용.
- **왜**: 챕터 도입부. 제공자 문서로 바로 들어가기 전에 중립적 그림 한 장.
- **선행**: 없음.
- **mastery 후보**: understand
- **출처**: Hugging Face — LLM Course, Chapter 1 (Introduction / "NLP and Large Language Models")
- **URL**: https://huggingface.co/learn/llm-course/chapter1/1 · https://huggingface.co/learn/llm-course/chapter1/2
- **publisher**: Hugging Face · **official**: yes (HF 공식 교육 자료) · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/llm-app-fundamentals` (도입)
- **Lesson 후보**: "LLM 이란 무엇인가 (짧게)" 또는 첫 Lesson 의 도입 섹션
- **라이선스 노트**: HF Course 는 오픈 라이선스(Apache-2.0 계열, 교재). 출처 표기 시 요약·인용 자유롭게 가능.
- **needs_followup**: 이 인트로 페이지들은 "토큰의 정확한 정의 / autoregressive 생성 메커니즘"을 얕게만
  다룸. 토큰·다음 토큰 예측을 제대로 쓰려면 HF Course 의 뒤 챕터(Transformer 동작) 1건 추가 조사 권장.

### B. RAG & Agents

#### B1. 임베딩 (embeddings)
- **개념**: 임베딩 = 텍스트의 의미를 담은 **부동소수 벡터(리스트)**. 벡터 간 거리가 가까우면 의미가
  가깝고 멀면 무관. 비교는 코사인 유사도 권장(정규화된 벡터는 내적 = 코사인, 더 빠름). 차원은 모델마다
  다르며(수백~수천) 일부 모델은 차원 축소 파라미터 지원. 용도: 검색, 클러스터링, 추천, 이상탐지, 분류,
  다양성 측정. 의미 검색 = 쿼리 임베딩과 문서 임베딩들 사이 유사도를 계산해 상위 문서를 반환.
  검색 태스크에서는 쿼리용/문서용 임베딩을 구분(`input_type`)하면 품질이 오른다.
- **왜**: RAG·의미 검색의 수학적 토대. "키워드가 안 겹쳐도 의미로 찾는다"의 원리.
- **선행**: 벡터/거리의 아주 기초. A2(토큰).
- **mastery 후보**: required (개념) / understand (수식 세부)
- **출처**: OpenAI — "Vector embeddings" / Anthropic — "Embeddings"
- **URL**: https://developers.openai.com/api/docs/guides/embeddings ·
  https://platform.claude.com/docs/en/build-with-claude/embeddings
- **publisher**: OpenAI / Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "임베딩과 의미 검색"
- **라이선스 노트**: © 각 사. Anthropic 은 자체 임베딩 모델이 없고 서드파티(Voyage AI)를 예로 듦 —
  Lesson 에서 특정 벤더에 종속되지 않게 "임베딩 제공자를 골라 쓴다"로 서술. 개념 재기술 + 출처 표기.

#### B2. 청킹 (chunking)
- **개념**: 문서를 검색 단위(수백 토큰 정도)로 쪼갠다. 겹침(overlap)을 둬서 경계에서 문맥이 잘리는 걸
  완화. (OpenAI Retrieval 기본값 예: 청크 최대 800 토큰, 겹침 400 토큰 — 조정 가능.) 너무 크면 검색
  정밀도↓·컨텍스트 낭비, 너무 작으면 청크가 자체 문맥을 잃음(대명사·기준 시점·주체 상실).
- **왜**: RAG 품질을 가장 크게 좌우하는 전처리 선택. 실패 모드의 출발점.
- **선행**: B1.
- **mastery 후보**: required
- **출처**: OpenAI — "Retrieval" (기본 청킹 전략) / Anthropic — "Contextual Retrieval" (청크 문맥 손실 사례)
- **URL**: https://developers.openai.com/api/docs/guides/retrieval · https://www.anthropic.com/news/contextual-retrieval
- **publisher**: OpenAI / Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "RAG가 필요한 이유와 기본 흐름" / "RAG 심화"
- **라이선스 노트**: © 각 사. 숫자는 "제공자 기본값 예시"로만 인용, 절대 규칙처럼 쓰지 않기.

#### B3. 검색 / 벡터 검색 / 벡터 데이터베이스 (retrieval / vector search / vector DB)
- **개념**: 런타임에 쿼리를 임베딩해 저장된 청크 벡터들과 최근접 이웃 검색 → 유사도 상위 K개를 가져옴.
  벡터 스토어/DB = 이 임베딩을 담고 의미 검색을 가능케 하는 컨테이너(파일 추가 시 자동 청킹·임베딩·
  색인). 메타데이터 속성 필터(날짜·지역 등), 점수 임계값, query rewriting 같은 부가 기능.
- **왜**: "검색" 단계의 실체. 규모가 커지면 전부 프롬프트에 못 넣기 때문에 필요.
- **선행**: B1, B2.
- **mastery 후보**: understand (개념) / practical (간단 구현)
- **출처**: OpenAI — "Retrieval" (semantic search, vector stores) / Anthropic — "Embeddings" (nearest-neighbor 예제, RAG recipe 포인터)
- **URL**: https://developers.openai.com/api/docs/guides/retrieval · https://platform.claude.com/docs/en/build-with-claude/embeddings
- **publisher**: OpenAI / Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "임베딩과 의미 검색" / "RAG가 필요한 이유와 기본 흐름"
- **라이선스 노트**: © 각 사.
- **needs_followup**: "벡터 데이터베이스" 를 독립 인프라로 설명하는 1차 문서(pgvector / Pinecone /
  Chroma 공식)는 이번에 확보 안 함. 집필 시 벤더 중립 개념 정의 1건 추가 조사 권장(예: pgvector README,
  Supabase Vector 문서 — CMM 은 이미 Supabase 를 씀).

#### B4. RAG 파이프라인 (ingestion → generation)
- **개념**: 수집(문서 로드) → 청킹 → 임베딩 → (벡터)저장 → 검색(쿼리로 상위 K 청크) → 컨텍스트 구성
  (검색된 청크를 프롬프트에 삽입) → 생성(모델이 그 근거로 답). fine-tuning 대비 장점: 임베딩 벡터만
  갱신하면 되므로 싸고 빠르고, 모델 교체 시 재학습 불필요, "model shift" 회피. 같은 모델이라도 관련
  문서를 컨텍스트로 받으면 답이 확연히 좋아진다.
- **왜**: 이 챕터의 중심. 학습자가 머릿속에 이 다이어그램을 그릴 수 있어야 함.
- **선행**: A1, B1, B2, B3.
- **mastery 후보**: required
- **출처**: Hugging Face — "Simple RAG for GitHub issues (Zephyr + LangChain)" cookbook / OpenAI — "Retrieval"
- **URL**: https://huggingface.co/learn/cookbook/rag_zephyr_langchain · https://developers.openai.com/api/docs/guides/retrieval
- **publisher**: Hugging Face / OpenAI · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "RAG가 필요한 이유와 기본 흐름" (권장 첫 Lesson)
- **라이선스 노트**: HF cookbook 오픈 라이선스, 출처 표기 시 요약 가능. OpenAI © OpenAI.

#### B5. Grounding / 인용 (citation / grounding)
- **개념**: 생성된 답을 실제 출처 자료에 근거하게 만들고, 어느 청크에서 왔는지 인용/출처를 함께
  제시하는 것. 의미 검색은 유사도 점수와 함께 청크를 반환하므로 그 점수·출처를 답에 붙일 수 있다.
- **왜**: "환각을 줄인다"의 실체이자 신뢰성·검증 가능성의 핵심. RAG 를 쓰는 주된 이유 중 하나.
- **선행**: B4.
- **mastery 후보**: understand
- **출처**: OpenAI — "Retrieval" (검색 결과를 모델과 결합해 grounded 응답 합성) / Anthropic — "Contextual Retrieval"
- **URL**: https://developers.openai.com/api/docs/guides/retrieval · https://www.anthropic.com/news/contextual-retrieval
- **publisher**: OpenAI / Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "RAG가 필요한 이유와 기본 흐름"
- **라이선스 노트**: © 각 사.

#### B6. RAG 실패 모드 / 하이브리드 검색 / 리랭킹
- **개념**: 대표 실패 모드 — 청크가 문맥을 잃어(어느 회사/시점인지 사라짐) 검색 정확도 하락. 대응:
  ①BM25(어휘 정확 매칭: 에러코드·식별자 등 임베딩이 놓치는 정확 용어에 강함)와 임베딩 의미 검색을
  rank fusion 으로 결합(하이브리드), ②리랭킹(1차 검색 결과를 다시 점수 매겨 상위 소수만 모델에
  전달 → 품질↑, 전달 청크 수↓). RAG 가 필요한 경우 = 지식 베이스가 프롬프트 한 번에 안 들어갈 만큼
  큰 경우; 작으면 그냥 컨텍스트에 다 넣는 게 낫다.
- **왜**: "RAG 붙였는데 왜 못 찾나"의 진단 도구. RAG 필요/불필요 판단 기준.
- **선행**: B4.
- **mastery 후보**: understand
- **출처**: Anthropic — "Introducing Contextual Retrieval"
- **URL**: https://www.anthropic.com/news/contextual-retrieval
- **publisher**: Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current (2024-09 발표, 개념 유효)
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "RAG 심화 — 실패 모드와 하이브리드 검색"
- **라이선스 노트**: © Anthropic. 예시(재무 필링 문장 등)는 재기술, 장문 복사 금지.

#### B7. 에이전트 개념 / 에이전트 루프
- **개념**: 에이전트 = 도구를 **루프에서** 쓰는 LLM. 사용자 지시로 시작 → 스스로 계획·실행 → 매
  단계마다 환경에서 "ground truth"(도구 결과·실행 피드백)를 받아 진척을 평가·조정 → 완료 또는 정지
  조건까지 반복(중간에 사람 확인 체크포인트 가능). "augmented LLM"(검색+도구+메모리) 이 기본 빌딩블록:
  모델이 스스로 검색 쿼리를 만들고, 도구를 고르고, 무엇을 기억할지 정한다.
- **왜**: 에이전트 절의 정의. 도구 호출(A4)이 여기서 루프로 확장된다.
- **선행**: A4.
- **mastery 후보**: understand
- **출처**: Anthropic — "Building effective agents"
- **URL**: https://www.anthropic.com/engineering/building-effective-agents
- **publisher**: Anthropic · **official**: yes (Anthropic Engineering) · **checked_at**: 2026-09-06 ·
  **상태**: current (본문에 "2024-12 이후 툴링 지형은 바뀜" 주석 있음 — **개념 프레임워크는 유효**, 특정
  도구/SDK 언급만 최신 아님)
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "에이전트 기초 — 도구를 루프에서 쓰기"
- **라이선스 노트**: © Anthropic. 인용 시 출처 표기.

#### B8. Workflow vs Autonomous Agent / 워크플로 패턴
- **개념**: **Workflow** = LLM·도구가 미리 정해진 코드 경로로 오케스트레이션되는 시스템.
  **Agent** = LLM 이 자기 프로세스·도구 사용을 동적으로 지휘, 목표 달성 방법을 스스로 통제.
  복잡도는 "결과가 눈에 띄게 좋아질 때만" 추가 — 고정 경로로 되면 워크플로가 낫다. 대표 워크플로 패턴:
  프롬프트 체이닝(순차, 중간 게이트), 라우팅(입력 분류 후 전문 경로), 병렬화(sectioning/voting),
  orchestrator-workers(중앙 LLM 이 분해·위임·종합), evaluator-optimizer(한 LLM 생성 + 다른 LLM 평가·
  피드백 반복). 상태(state)를 "다단계 작업을 끝낼 만큼" 유지하는 것이 에이전트/워크플로의 공통 요소.
- **왜**: "언제 에이전트를 쓰나 / 언제 안 쓰나"의 판단틀. 실무에서 과설계 방지.
- **선행**: B7.
- **mastery 후보**: understand
- **출처**: Anthropic — "Building effective agents" / OpenAI — "Agents" (Agents SDK 가이드)
- **URL**: https://www.anthropic.com/engineering/building-effective-agents · https://developers.openai.com/api/docs/guides/agents
- **publisher**: Anthropic / OpenAI · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "에이전트 vs 워크플로 — 언제 무엇을"
- **라이선스 노트**: © 각 사.

#### B9. 에이전트의 도구·상태·핸드오프·가드레일 (개념 수준)
- **개념**: 에이전트는 플랫폼 도구·함수 호출·MCP 연결·다른 에이전트를 도구로 사용. 에이전트 루프가
  도구 루프 수행, 핸드오프 시 담당 에이전트 전환, 실행 종료/승인 대기 시 정지. state = 다단계 작업
  완수를 위한 최소 상태. 가드레일(입력·출력·도구)과 재개 가능한 승인 흐름으로 위험한 작업 전 차단/정지.
  단일 전문가 = 계약(입출력)을 깔끔히 정의; 멀티 에이전트 = "agents-as-tools"(매니저형) vs
  "handoffs"(담당 위임) 중 소유권 설계를 의도적으로. **멀티 에이전트는 이번 라운드 집필 범위 아님(포인터만).**
- **왜**: 에이전트를 "실제로 돌리는" 데 필요한 최소 어휘. 깊은 구현은 후속.
- **선행**: B7, B8.
- **mastery 후보**: understand
- **출처**: OpenAI — "Agents" (Agents SDK) / Anthropic — "Tool use" (client vs server tool, tool_choice)
- **URL**: https://developers.openai.com/api/docs/guides/agents · https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- **publisher**: OpenAI / Anthropic · **official**: yes · **checked_at**: 2026-09-06 · **상태**: current
- **대상 챕터**: `ai-engineering/rag-and-agents`
- **Lesson 후보**: "에이전트 기초" 후반 섹션
- **라이선스 노트**: © 각 사.
- **needs_followup**: memory / planning 의 깊은 동작(메모리 도구, 장기 실행 하네스)은 개념 언급만 확보.
  깊게 다루려면 Anthropic "memory tool" / "effective harnesses for long-running agents" 추가 조사.

---

## 기존 Curriculum과 연결

- **`ai-engineering/generative-ai-in-frontend` (active, 자료 있음)** — 이 두 챕터의 **선행/앵커**.
  - 기존 자료가 이미 다룬 것: API 키 관리(`.env`, 엣지 함수), REST 호출, 응답 렌더.
  - `open AI - image generator` 자료의 "브라우저에서 API 키 입력" 은 `llm-app-fundamentals` 에서
    "실무에선 왜 서버/엣지 함수로 감싸나"의 **대조 예**로 재활용 가능.
  - `생성형 AI - React App` 자료(Supabase Edge Function → GPT-4o-mini 호출 → DB 저장)는
    `llm-app-fundamentals` 의 messages/역할·구조화 출력·에러 처리를 얹을 **현실적 실습 베이스**.
- **`ai-engineering/llm-app-fundamentals` 골격 Lesson** `prompts-tokens-context`
  (제목: "프롬프트·토큰·컨텍스트·스트리밍", required, 60분) — 범위가 넓음.
  → 집필 시 최소 2개로 분리 제안: ①"LLM API와 Context 기본"(messages·역할·토큰·context window·비용),
  ②"스트리밍 응답 다루기". 구조화 출력·도구 호출·에러는 추가 Lesson(ord 20~50).
- **`ai-engineering/rag-and-agents` 골격 Lesson** `retrieval-augmented-generation`
  (제목: "RAG — 검색 증강 생성", required, 90분) — 90분에 임베딩+RAG+에이전트를 다 넣기엔 큼.
  → 집필 시 3개로 분리 제안: ①"임베딩과 의미 검색", ②"RAG가 필요한 이유와 기본 흐름"(+심화),
  ③"에이전트 기초 — 도구를 루프에서 쓰기".
- **`ai-engineering/prompt-and-evaluation` (Agent 4 담당)** — `rag-and-agents` 의 evaluator-optimizer
  패턴, RAG 품질 측정, 도구 호출 회귀 테스트가 그 챕터로 이어짐. 이 문서에서는 포인터만.
- **다른 트랙 연결**:
  - `data-and-backend` / Supabase — 벡터 저장(Supabase Vector/pgvector)은 CMM 스택과 직접 연결됨
    → B3 의 "벡터 DB" 조사 공백을 Supabase 문서로 메우면 트랙 간 재사용이 자연스러움.
  - `typescript` — 구조화 출력/도구 정의의 JSON Schema.
  - `deployment-and-infra` — API 키를 서버에서 숨기기, rate limit·비용 모니터링.

---

## 부족한 부분

1. **CMM 내부 실습 코드 부재**: `llm-app-fundamentals` / `rag-and-agents` 를 뒷받침하는 CMM 자료가
   없다. 코드 예제는 전부 공식 문서 기반 `generated_minimal` 로 새로 만들어야 함(`source_type` 주의).
2. **벡터 데이터베이스 1차 문서 미확보**: B3. 벤더 중립 개념 정의가 필요. 권장: Supabase Vector /
   pgvector 공식 문서 1건(스택 일치) 또는 Pinecone "vector similarity" 학습 글.
3. **토큰 / 다음 토큰 예측 메커니즘의 깊이**: HF Course 인트로 2개 페이지는 얕음. Transformer 동작·
   autoregressive 생성·tokenization 을 제대로 쓰려면 HF Course 후속 챕터 1건 추가 조사.
4. **OpenAI rate limit / 에러 대응표**: A7 은 Anthropic 문서로 채웠음. OpenAI "Rate limits" 문서
   1건을 더 봐서 "제공자 무관하게 같다"를 확실히 하는 게 좋음.
5. **OpenAI 문서 정밀 인용의 한계**: 이번 조사에서 OpenAI 문서는 요약 형태로만 수집됨(모델이 페이지를
   요약). 구체 파라미터명·기본값·현행 모델 ID 는 집필 직전 원문 재확인 필요. 특히 특정 모델 이름/ID 는
   **본문에 못박지 말 것**(세대마다 바뀜) — "모델마다 다르며 공식 문서에서 확인"으로 서술.
6. **LangChain / LlamaIndex 개념 페이지**: `python.langchain.com/docs/concepts/rag` 는 308 로
   `docs.langchain.com/oss/...` 로 이동됨. 프레임워크 중립 개념은 OpenAI/Anthropic/HF 로 충분히 커버되어
   필수는 아니나, "프레임워크가 RAG 를 어떻게 조립하는지" 예시가 필요하면 신 URL 재조사.
7. **한국어 1차 자료 없음**: 모든 출처가 영문. Lesson 은 한국어로 집필하되 용어(임베딩/토큰/컨텍스트
   윈도/도구 호출/에이전트 루프)를 첫 등장 시 영문 병기.
8. **평가(eval)**: 의도적으로 이 문서 범위 밖(Agent 4). `rag-and-agents` 에서 "품질을 어떻게 재나"는
   포인터만 남기고 깊이 들어가지 않음.

---

## 향후 확장 (roadmap linkage — 이번 라운드 Lesson 아님)

과제 지시대로 이번 라운드에서 **Lesson 으로 만들지 않는다.** 트랙 성장 시 연결 지점만 기록:

- **서빙 / 추론 최적화**: vLLM, TensorRT-LLM, Triton, 배치·연속 배치, KV 캐시, 양자화(임베딩 양자화는
  B1 출처에 이미 나옴 — 확장 시 생성 모델 양자화로). → `deployment-and-infra` 트랙과 접점.
- **GPU / CUDA 기초**: 커널, 메모리 계층. 서빙 확장의 선행.
- **Kubernetes / 오토스케일링**: LLM 워크로드 운영. → `deployment-and-infra`.
- **모델 학습 / 파인튜닝 / RLHF / LoRA**: RAG 대비 "언제 파인튜닝인가"는 B4 에서 한 문단으로만 언급.
  본격 학습 파이프라인은 별도 트랙 후보.
- **멀티 에이전트 아키텍처**: B9 에서 개념만. orchestrator-workers·handoffs 를 실제 시스템으로 짜는 법.
- **관측성 / 트레이싱 / 비용 대시보드**: 프로덕션 LLM 앱 운영. Agents SDK 의 tracing 이 접점.
- **평가 자동화 / 회귀 스위트**: Agent 4 의 `prompt-and-evaluation` 이 1차 담당, 그 다음 단계.

---

## 채택 출처 요약 (per-source)

| # | 제목 | URL | publisher | official | checked_at | 상태 | 뒷받침 개념 | 대상 챕터 | 품질 | needs_followup |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Text generation (guide) | https://developers.openai.com/api/docs/guides/text | OpenAI | yes | 2026-09-06 | current | A1, A5 | llm-app-fundamentals | 높음(요약 수집) | 원문 파라미터 재확인 |
| 2 | Context windows | https://platform.claude.com/docs/en/build-with-claude/context-windows | Anthropic | yes | 2026-09-06 | current | A2, A5 | llm-app-fundamentals | 높음(원문) | 윈도 크기 숫자 못박지 말 것 |
| 3 | Function calling | https://developers.openai.com/api/docs/guides/function-calling | OpenAI | yes | 2026-09-06 | current | A4 | llm-app-fundamentals | 높음(요약) | 원문 재확인 |
| 4 | Tool use with Claude (overview) | https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview | Anthropic | yes | 2026-09-06 | current | A4, A7(pricing), B9 | llm-app-fundamentals + rag-and-agents | 높음(원문) | — |
| 5 | Structured Outputs | https://developers.openai.com/api/docs/guides/structured-outputs | OpenAI | yes | 2026-09-06 | current | A3 | llm-app-fundamentals | 높음(요약) | Anthropic 대응 명시 |
| 6 | Streaming API responses | https://developers.openai.com/api/docs/guides/streaming-responses | OpenAI | yes | 2026-09-06 | current | A6 | llm-app-fundamentals | 높음(요약) | — |
| 7 | Streaming Messages | https://platform.claude.com/docs/en/build-with-claude/streaming | Anthropic | yes | 2026-09-06 | current | A6 | llm-app-fundamentals | 높음(참조) | — |
| 8 | Vector embeddings | https://developers.openai.com/api/docs/guides/embeddings | OpenAI | yes | 2026-09-06 | current | B1 | rag-and-agents | 높음(요약) | — |
| 9 | Embeddings | https://platform.claude.com/docs/en/build-with-claude/embeddings | Anthropic | yes | 2026-09-06 | current | B1, B3 | rag-and-agents | 높음(원문) | 벤더 중립 서술 |
| 10 | Retrieval (guide) | https://developers.openai.com/api/docs/guides/retrieval | OpenAI | yes | 2026-09-06 | current | B2, B3, B4, B5 | rag-and-agents | 높음(요약) | 청킹 숫자는 예시로만 |
| 11 | Agents (Agents SDK guide) | https://developers.openai.com/api/docs/guides/agents | OpenAI | yes | 2026-09-06 | current | B8, B9 | rag-and-agents | 높음(요약) | — |
| 12 | Building effective agents | https://www.anthropic.com/engineering/building-effective-agents | Anthropic | yes | 2026-09-06 | current(개념) | B7, B8 | rag-and-agents | 높음(요약) | "툴링 지형 변경" 주석 — 개념만 사용 |
| 13 | Introducing Contextual Retrieval | https://www.anthropic.com/news/contextual-retrieval | Anthropic | yes | 2026-09-06 | current(2024-09, 개념 유효) | B2, B6 | rag-and-agents | 높음(요약) | — |
| 14 | Claude API errors | https://platform.claude.com/docs/en/api/errors | Anthropic | yes | 2026-09-06 | current | A7 | llm-app-fundamentals | 높음(원문) | OpenAI Rate limits 1건 추가 |
| 15 | LLM Course Ch.1 (Intro / NLP & LLMs) | https://huggingface.co/learn/llm-course/chapter1/1 , /chapter1/2 | Hugging Face | yes | 2026-09-06 | current | A8 | llm-app-fundamentals | 중(인트로라 얕음) | 토큰/Transformer 후속 챕터 |
| 16 | Simple RAG (Zephyr + LangChain) cookbook | https://huggingface.co/learn/cookbook/rag_zephyr_langchain | Hugging Face | yes | 2026-09-06 | current | B4 | rag-and-agents | 중~높음 | — |

미채택/이동: `python.langchain.com/docs/concepts/rag` → 308 리다이렉트(`docs.langchain.com/oss/...`).
프레임워크 중립 개념은 위 출처로 충분하여 이번 라운드 미추적. needs_followup.
