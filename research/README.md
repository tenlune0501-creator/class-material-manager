# research/ — 외부 조사 통합 (편집장 검수)

2026-09-06. 기존 수업자료(393)만으로 부족한 5개 영역 — Backend/Database, Docker/Infra,
AI Engineering, Prompt/Evaluation, Coding Test — 을 신뢰할 수 있는 1차 출처로 보강한 조사의
통합 문서. 각 영역 원본은 아래 4개 파일에 있고, 이 문서는 Main Claude Code 가 그 결과를
**직접 재검증하고 통합**한 편집장 노트다.

- `research/backend-and-database.md` — Research Agent 1
- `research/docker-and-infra.md` — Research Agent 2
- `research/ai-engineering.md` — Research Agent 3
- `research/evaluation-and-coding-test.md` — Research Agent 4

> Research Agent 는 조사 + 자기 파일 작성만 했다. Lesson 집필, 커리큘럼/DB/프로젝트러닝
> 수정은 하지 않았다. 실제 authored Lesson 과 커리큘럼 골격 반영은 Main 만 수행했다.

---

## 1. Team 구성과 실행

| Agent | 담당 | 산출 파일 | 결과 |
|---|---|---|---|
| Research Agent 1 | Backend Fundamentals + Node.js + **Java/Spring 재조사** + 관계형 DB/PostgreSQL | `backend-and-database.md` (686줄) | 완료. 공식 23건 |
| Research Agent 2 | Docker / 컨테이너 / Compose / 멀티스테이지 / 로그 | `docker-and-infra.md` (337줄) | 완료. 공식 14건 |
| Research Agent 3 | LLM App Fundamentals + Embedding/RAG + Agents | `ai-engineering.md` (534줄) | 완료. 공식 16건 |
| Research Agent 4 | Prompt/Evaluation + Coding Test 로드맵 + 저작권 | `evaluation-and-coding-test.md` (703줄) | 완료. 공식/권위 19건 |

- 4개 Agent **병렬 실행**. quota/재시도 없이 4개 모두 1회에 완료.
- Agent 간 동일 파일 동시 수정 없음(각자 지정 파일 1개).
- Main 은 4개 완료 후 통합.

## 2. Main 재검증 (Agent 결과를 그대로 신뢰하지 않음)

Agent 가 인용한 출처 중 **위험도 높은 것을 Main 이 직접 WebFetch/WebSearch 로 재확인**:

| 재확인 항목 | 결과 |
|---|---|
| Docker "What is an image?" 정의 | ✅ 원문 일치 — "standardized package…", "Images are immutable…", "composed of layers" |
| Anthropic "Context windows" (llm 대표 Lesson 근거) | ✅ 라이브·current. "working memory", context rot, 매 턴 누적, 400 "prompt is too long" 전부 일치 |
| MIT OCW 6.006 Lecture Notes (코딩테스트 로드맵 근거) | ✅ 라이브. 강의 시퀀스(Intro→DS→Sorting→Hashing→…→BFS→DFS→…→DP×4→Complexity) 일치. **CC BY-NC-SA 4.0** 확인 |
| OpenAI 문서 도메인 이전 (`platform.openai.com` → `developers.openai.com`) | ✅ 신 URL 라이브. prompt-engineering 페이지 "Version prompts in code", developer/user 계층 일치 |
| 백준 이용 규칙 URL (`help.acmicpc.net/rule`, Agent 4 가 404 목격) | ✅ 현재 라이브. 정책("지문 업로드 말고 링크로") 유효. Agent 의 404 는 일시적 |
| 강사 Backend 자료 11개 material ID | ✅ 전부 `material_metadata` 에 실재 (`1k0hObTy`, `1a63pT8q`, `1CvaWGWq`, `1peKntI-`, `1KeXe0iq`, `1bos2ISU`, `1AkBUevg`, `1MjC0nvq`, `1bKTN0FW`, `1E235IuK`, `1b9CclzJ`) |

각 Agent 파일이 나머지 출처를 per-source 표로 정리(제목·URL·publisher·official·checked_at·상태).
Main 판단: **4개 파일 모두 1차 출처 중심, 블로그 인용 0건, 인용 규율(정의문만 인용·장문 복제 금지)
준수.** 채택.

### Main 이 조정한 것

- **AI 두 챕터의 단일 대형 Lesson 을 분할**: `llm-app-fundamentals/prompts-tokens-context`(60분)
  → 4개(`prompts-tokens-context`(45분, 집필) + `structured-outputs` + `tool-calling` +
  `streaming-and-errors`). `rag-and-agents/retrieval-augmented-generation`(90분) → 3개
  (`embeddings-and-semantic-search` + `retrieval-augmented-generation` + `agents-intro`).
- **모델 ID / 컨텍스트 윈도 크기를 Lesson 본문에 못박지 않는다** (세대마다 바뀜). "모델마다
  다르며 공식 문서 확인"으로 서술 — 대표 Lesson `prompts-tokens-context` 에 이 규칙을 명시.
- **OpenAI Evals 플랫폼 API 는 deprecated**(2026-10-31 read-only / 2026-11-30 shutdown) →
  평가 Lesson 은 특정 SaaS 콘솔이 아니라 "평가셋 + 채점 함수" 개념 + 오픈소스(promptfoo,
  HF Evaluate) 중심으로 설계.
- **Node 챕터 status**: 강사 자료가 실재하므로 자료가 붙는 Lesson 은 `skeleton` 로 승격,
  개념 전용(런타임/이벤트루프, 내장 http, 에러 처리)은 `needs_external_research` 유지.
- **SQL 방언 불일치 주의**: 강사 자료는 MySQL, Supabase 는 PostgreSQL. DB 운영 챕터는
  Postgres 기준 + "MySQL 과의 차이" 를 한 번 짚는 구성으로 (research 파일에 반영).

## 3. 영역별 조사 결과 요약

### Backend / Database / Spring

- **채택 출처 23건, 전부 공식** (MDN 3 / Node.js 2 / Express 4 / PostgreSQL 6 / Supabase 1 / Spring 7).
  공식 비율 100%. 추가 확인 필요 11건(needs_followup) 명시.
- **주요 출처**: MDN "Overview of HTTP" / "HTTP methods" / "HTTP authentication",
  Node.js Learn "Event Loop" / "Anatomy of an HTTP Transaction", Express Guide(routing/
  middleware/error-handling), PostgreSQL Docs(SQL/joins/constraints/indexes/transactions/EXPLAIN),
  Supabase "Database Migrations", Spring Guides(rest-service/accessing-data-jpa/validating-form-input).
- **coverage**: Backend Fundamentals + Node.js 서버 = 집필 가능. 관계형 DB 운영 = 집필 가능하나 전량 외부.

### Docker / Infra

- **채택 출처 14건, 전부 공식** (docs.docker.com / docker.com). 공식 비율 100%.
- **주요 출처**: "What is a container?", "What is an image?", "Docker overview",
  "Writing a Dockerfile", "Publishing ports", "Persisting container data",
  "Multi-container applications", "Docker Compose features and uses", "Multi-stage builds",
  "docker container logs", "Containerize a Node.js application".
- **coverage**: 챕터 전 범위(개념~멀티스테이지~로그)를 공식 문서만으로 커버. 블로그 불필요.

### AI Engineering (LLM Fundamentals + RAG/Agents)

- **채택 출처 16건, 전부 공식** (OpenAI 6 / Anthropic 7 / Hugging Face 3). 공식 비율 100%.
- **주요 출처**: OpenAI(Text generation, Function calling, Structured Outputs, Streaming,
  Embeddings, Retrieval, Agents), Anthropic(Context windows, Tool use, Embeddings,
  Contextual Retrieval, Building effective agents, API errors, Streaming), HF(LLM Course Ch.1,
  RAG cookbook).
- **coverage**: LLM Fundamentals = 완전. RAG = 완전. Agents = 개념 수준(state/memory/planning
  깊은 동작, 독립 벡터DB 문서는 미확보 → 벤더 중립 개념까지만).

### Prompt / Evaluation

- **채택 출처 11건**: 공식 벤더 8(Anthropic 5 / OpenAI 3) + promptfoo 2(OSS 공식 문서) +
  HF Evaluate 1.
- **주요 출처**: Anthropic(Prompt engineering overview, Prompting best practices, Define
  success criteria and build evaluations, Reduce hallucinations, Increase output consistency),
  OpenAI(Prompt engineering, Working with evals, Reasoning best practices), promptfoo(Intro,
  Assertions and Metrics), HF Evaluate.
- **coverage**: 프롬프트 설계 + 평가셋 + 채점 방법 + 회귀 + 환각 분석 전부 커버.
  핵심 원칙: **평가가 프롬프트 튜닝보다 먼저 존재해야 한다**(Anthropic 사이클과 일치).

### Coding Test

- **채택 출처 8건**: MIT OCW 6.006(CC BY-NC-SA 4.0) · cp-algorithms(CC BY-SA 4.0) ·
  Big-O Cheat Sheet · Python Wiki TimeComplexity(CPython) · LeetCode ToS · 백준 이용규칙 ·
  프로그래머스 약관+QnA · CLRS(인용 전용).
- **로드맵**: MIT 6.006 시퀀스 축약 = 15개 개념 (문제해결접근 → Big-O → 배열/문자열 →
  해시 → 스택 → 큐/덱 → 재귀 → 정렬 → 이진탐색 → 트리 → 그래프표현 → BFS → DFS →
  그리디 → DP). 5 Chapter / 15 개념 Lesson / 8 예제 문제 설계 (research 파일 PART 2).
- **저작권 전략**: **외부 문제는 "제목 + URL + 한 줄 분류" 링크 참조만; CMM 저장 문제는
  100% 자작 `generated_minimal`; CLRS·강의자료는 인용만.** `lesson_problem` 스키마에
  `source_name`/`source_url` 이 이미 있어 링크 참조가 스키마에 내장됨. `statement` 는
  `NOT NULL` 이라 저장형은 자체 원본 지문 필수.
- LeetCode = 지문 인용 불가(전면 금지). 프로그래머스 = 재호스팅(풀이·채점) 불가, 연습 공개
  문제는 출처 명시 시 링크 가능, 기업 코테 유형은 링크도 지양. 백준 = 지문 업로드 말고 링크.

## 4. needs_external_research 챕터 판정 (READY / PARTIAL / NOT READY)

> **status(=CMM 자료 유무) ≠ readiness(=외부 공식 문서로 지금 집필 가능한가).** 아래는 readiness.

| 챕터 | readiness | 근거 | 이번 라운드 |
|---|---|---|---|
| `data-and-backend/nodejs-server` | **PARTIAL** | 강사 자료(Express+MySQL BBS 실습 7종) + Express/Node 공식 문서. 개념 레이어만 외부 | 1→7 Lesson 분할. `builtin-http-server` 집필. 자료 붙는 Lesson `skeleton` 승격 |
| `data-and-backend/relational-database-operations` | **NOT READY** | 스코프(마이그레이션·트랜잭션·EXPLAIN·Postgres) 0% 기존 커버. 전량 외부(PostgreSQL 공식 6 + Supabase). 저장소 `supabase/migrations/*.sql` 을 사례로 | **골격 미분할**(1 Lesson 유지). 8-Lesson 분할안은 아래 §6 |
| `deployment-and-infra/containers-docker` | **READY** | Docker 공식 14건이 전 범위 커버. 사용자 Docker Desktop/Supabase 로컬 경험 = 실전 앵커 | 1→6 Lesson 분할. `images-and-containers` 집필 |
| `ai-engineering/llm-app-fundamentals` | **READY** | OpenAI+Anthropic+HF 공식이 전 범위 커버. 공백=CMM 실습코드 없음(→ `generated_minimal`) | 1→4 Lesson 분할. `prompts-tokens-context` 집필 |
| `ai-engineering/rag-and-agents` | **PARTIAL** | RAG 절반 READY, 에이전트 절반 개념 수준(깊은 state/memory, 독립 벡터DB 문서 미확보) | 1→3 Lesson 분할, 전부 `needs_external_research` |
| `ai-engineering/prompt-and-evaluation` | **READY** | Anthropic/OpenAI 공식 + promptfoo/HF. OpenAI Evals 플랫폼 API 만 deprecated(개념·OSS 로 대체) | 1→5 Lesson 분할. `prompting-as-development` 집필 |
| `coding-test` 트랙 | **PLAN READY** | 자료가 없는 게 아니라 로드맵 설계 태스크. MIT 6.006 + CLRS 로 15개념 순서 확정 | `foundations` Chapter + 2 Lesson 반영. `big-o-notation` 집필. 나머지 4 Chapter 는 §6 |

### Spring 챕터 신설 — 판정: **타당하나 이번 라운드 미반영 (설계안만)**

- **기존 Java/Spring 자료: 없음 — 확인됨** (§5).
- Spring 공식 문서 7건으로 집필 가능(단 4건은 원문 재확인 필요). 국내 FE 채용에서 Spring Boot
  기본 이해를 요구하는 경우가 많아 **선택/후속 트랙으로 타당**.
- 그러나 (1) 이번 5개 authored Lesson 은 각 조사 축의 **가장 선행되는 개념** 우선이라 Spring DI
  보다 HTTP/서버 기초·Big-O·Docker·LLM 기초가 앞서고, (2) Spring 은 `relational-database-operations`
  C1~C3 를 선행으로 요구하는데 그게 아직 NOT READY. → **`data-and-backend/spring-boot` 신설안은
  아래 §6 에 설계안으로 두고, YAML 에는 반영하지 않았다.** (Node 트랙 이수 후 별도 단계에서 추가)

## 5. 기존 Backend / Spring 자료 재조사 결과

- **Java / Spring / Spring Boot / JPA / Hibernate / Gradle / Maven 자료: 없음.**
  `data/index.json` 섹션 28개·subject 17개 전수 + `data/` 전체 정규식 스윕 +
  `.java`/`pom.xml`/`build.gradle*` 검색(이 저장소 + Tenlune 4개 repo + momentalk) = 실질 히트 0.
  부수 언급 2건: `홈페이지 개설하기`(백엔드 스택 나열), `GCP - 서비스 등록 실행`(Nginx 예시 표 한 줄).
  → **지어내지 않았다.**
- **"보유 자료 100% 프론트엔드" 는 Node 에 대해 과장이었다** (직전 393 분석의 정정).
  `react/board-crud-app` 에 매핑된 강사 문서 중 **7종이 Express + MySQL REST 서버를 처음부터
  만드는 실습**이다(`1k0hObTy` 서버세팅, `1a63pT8q` CORS, `1CvaWGWq` GET+DB, `1peKntI-` POST/
  body-parser, `1KeXe0iq` UPDATE, `1bos2ISU` DELETE+파라미터바인딩, `1AkBUevg` multer). 얕고
  미모듈화됐지만 **동작하는 예제**. 이번에 이 7종을 `data-and-backend/nodejs-server` Lesson 에
  dual-map (같은 자료를 "서버 관점"으로도 참조 — README §1 loose ref 중복 허용). 393 accounting 불변.
- DB 개념 자료(`ERD`, `정규화`, `관계형 비관계형 차이`, `SQL 핵심정리`)는 `data-and-backend/data-modeling`
  을 채우기 충분. 운영 실무(마이그레이션·트랜잭션·EXPLAIN)는 전무.

## 6. YAML 미반영 설계안 (승인 시 같은 규격으로 추가)

이번 라운드에서 **반영하지 않은** 구조. Research 결과가 구체 설계까지 나왔으나, "authored
Lesson 반영에 필요한 최소 범위" 원칙상 골격만 남긴다.

### 6.1 `data-and-backend/relational-database-operations` — 8 Lesson 분할안

`postgres-sql-basics`(C1) · `joins`(C2) · `schema-and-constraints`(C3) · `indexes`(C4) ·
`query-plans`(C5) · `transactions`(C6) · `schema-and-migrations`(C7, 기존 id 유지) ·
`postgres-and-supabase-rls`(C8). 전부 `needs_external_research`. 근거·출처는
`backend-and-database.md` §C.

### 6.2 신설 Chapter `data-and-backend/spring-boot` (ord 60, status: needs_external_research)

| lesson id | title | mastery |
|---|---|---|
| `spring-boot/minimal-java-for-spring` | Spring을 위한 최소 Java | understand |
| `spring-boot/ioc-di-beans` | IoC·DI와 빈 | understand |
| `spring-boot/boot-autoconfig-and-starters` | Spring Boot 자동설정과 스타터 | required |
| `spring-boot/rest-controller` | @RestController로 REST API | required |
| `spring-boot/request-validation` | 요청 검증 (Bean Validation) | required |
| `spring-boot/exception-handling` | 예외 처리 (@ControllerAdvice) | required |
| `spring-boot/configuration` | application.yml 설정 | understand |
| `spring-boot/spring-data-jpa` | Spring Data JPA로 DB CRUD | required |
| `spring-boot/transactions` | @Transactional 기초 | understand |

비스코프: Spring Security / JWT·OAuth2 / 마이크로서비스 / WebFlux / 배포. 근거는
`backend-and-database.md` §D.

### 6.3 `coding-test` 나머지 4 Chapter (foundations 는 반영됨)

`linear-structures`(배열/문자열/해시/스택/큐덱 + 예제 2) · `recursion-and-search`(재귀/정렬/
이진탐색 + 예제 1) · `trees-and-graphs`(트리순회/그래프표현/BFS/DFS + 예제 2) ·
`design-paradigms`(그리디/DP-1D/DP-2D + 예제 2). 개념 Lesson 은 `needs_external_research`,
문제 Lesson 은 CMM 자작 지문이 준비될 때 `lesson_kind: problem` + `problem:` 블록으로 추가.
전체 설계는 `evaluation-and-coding-test.md` PART 2.

### 6.4 AI 나머지 세분 (prompt-and-evaluation)

`structured-and-fewshot` · `defining-success-and-evals` · `evaluating-llm-output`(기존 id, ord 40 으로
이동) · `regression-and-failure-analysis` — 이번에 **YAML 에는 반영**(needs_external_research),
집필은 안 함. `llm-app-fundamentals` 의 `structured-outputs`/`tool-calling`/`streaming-and-errors`,
`rag-and-agents` 의 3개도 동일.

## 7. Lesson 제작 순서 제안 (다음 단계)

외부 조사 영역의 잔여 Lesson 을, 선행 관계 순으로. 배치당 1 Chapter(~5–8 Lesson).

| 배치 | 범위 | 근거 |
|---|---|---|
| R1 | `containers-docker` 나머지 5 (Dockerfile→ports/volumes→Compose→multistage→logs) | READY, 공식만으로 완결. 이미 앵커 확보 |
| R2 | `llm-app-fundamentals` 나머지 3 (structured-outputs→tool-calling→streaming-and-errors) | READY |
| R3 | `nodejs-server` 나머지 6 (event-loop→express→routing→middleware→error→config) | PARTIAL, 강사 예제 재사용 |
| R4 | `prompt-and-evaluation` 나머지 4 | READY. R2 선행 |
| R5 | `rag-and-agents` 3 + `relational-database-operations` 8 (분할 먼저 승인) | PARTIAL/NOT READY. followup 출처 재확인 후 |
| R6 | `coding-test` `linear-structures`~`design-paradigms` 12 + 예제 문제 8 | PLAN READY. 예제 문제는 자작 |
| (별도) | `spring-boot` 9 | Node 트랙 이수 + relational-db C1~C3 이후 |

## 8. Source 갱신 정책

- 모든 authored Lesson 의 외부 `sources[]` 는 `title / url / publisher / checked_at /
  source_type` 5필드. `checked_at` 은 마지막으로 원문을 확인한 날짜.
- **재확인 주기**: AI 벤더 문서(모델 세대·파라미터 변동 잦음)는 집필/개정 시마다 원문 재확인.
  Docker/PostgreSQL/MDN 은 분기 1회 또는 메이저 릴리스 시.
- **URL 이 죽거나 이동하면**: 리다이렉트 최종 URL 로 교체하고 `checked_at` 갱신. 대응 문서가
  사라졌으면 그 개념을 다루는 다른 1차 출처로 교체(블로그 금지).
- **모델 ID·컨텍스트 윈도 크기·벤더 자체 성능 수치**("few-shot 3~5개가 최적", "질문을 끝에
  두면 +30%")는 **본문에 단정하지 않는다**. "출처에 따르면" 조건부 + "공식 문서에서 확인".
- **저작권**: 외부 문서 정의문 1–2문장 인용 + 출처 표기, 장문 복제 금지. 코딩테스트 외부 문제
  지문 복제 금지(제목+URL만). CC BY-NC-SA(6.006)/CC BY-SA(cp-algorithms) 자료는 코드·그림
  복제 대신 개념 참고 후 재작성.

## 9. 향후 정식 reference 편입 (이번 단계 미실행)

현재 `data/references/<subject>/<slug>.md`(flat frontmatter) → `src/sync/build-references.ts`
→ `reference_documents` 테이블 (refresh 파이프라인 `enrich` 단계가 채움). 지금은
`css/html/javascript/mui/nextjs/react/supabase/typescript` subject 만 존재.

**편입 방법(제안)**: 이번 research 의 각 1차 출처를 같은 flat-frontmatter 형식으로
`data/references/<new-subject>/<slug>.md` 생성 (new-subject = `docker` / `nodejs` /
`postgres` / `ai` / `algorithms`), `build-references.ts` 가 그대로 픽업 → `reference_documents`.
그 뒤 각 Lesson 의 `sources[]` 를 외부 형태(형태 2)에서 `reference_slug`(형태 1)로 전환
(`curriculum/README.md §4.1`). 이번 단계는 `research/*.md` + authored Lesson frontmatter
`sources` 까지만이며, `data/references/` 파일 생성·`reference_documents` 반영·sync 실행은
하지 않았다.
