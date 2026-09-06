# 조사 영역: Prompt/Evaluation + Coding Test

Research Agent 4 조사 결과. 조사만 수행했고, 이 파일 외에는 아무 것도 수정하지 않았다.
checked_at 은 전부 **2026-09-06**.

---

## 준비도 판정 (요약)

### chapter `ai-engineering/prompt-and-evaluation` → **READY**

- 공식 문서(Anthropic docs 5개, OpenAI docs 3개)만으로 "AI 애플리케이션을 개발하고 검증한다"
  라는 프레이밍의 Lesson 을 집필할 수 있다. 프롬프트 기본기 · 지시 계층 · 구조적 프롬프팅 ·
  few-shot · 컨텍스트 설계 · 프롬프트 실패 분석 · 성공 기준 정의 · 테스트 데이터셋 ·
  회귀 평가 · 결정적/확률적 테스트 · 환각 분석 · 품질 지표 · 사람/자동 평가가 모두
  1차 출처로 커버된다.
- **권장 첫 Lesson**: `ai-engineering/prompt-and-evaluation/prompting-as-development`
  ("프롬프트를 앱 개발·유지보수 단위로 다루기"). 기존 skeleton 의
  `evaluating-llm-output` 은 ord 40 으로 뒤로 미루고, 그 앞에 프롬프트 설계 Lesson 3개를 둔다.
- 남은 한계: "few-shot 이 정확도를 몇 % 올린다" 같은 수치는 벤더 문서의 자체 측정치라
  집필 시 "출처에 따르면" 으로 인용하고 절대 단정하지 않는다. 학습자 직접 실습용
  평가 스크립트는 CMM 이 `generated_minimal` 로 새로 작성한다(외부 코드 복붙 금지).

### track `coding-test` → **PLAN READY (NOT BLOCKED)**

- 이 트랙은 "자료가 없어서 막힌" 것이 아니라 **로드맵을 설계하면 되는** 트랙이다.
  개념 순서 · 개념별 연습 문제 유형 · 숙련도 배치는 아래 로드맵에서 확정했다.
- **문제는 CMM 이 직접 저장하되, 저장하는 문제는 전부 CMM 이 새로 만든
  `source_type: generated_minimal` 예제 문제**로 한다. LeetCode/프로그래머스/백준 등
  외부 문제는 **제목 + URL 링크로만** 참조한다(지문 복제 금지). 근거는 아래 저작권 전략.
- **권장 첫 authored Lesson**: `coding-test/foundations/big-o-notation`
  ("Big-O 표기법과 복잡도 분석"). 그 앞에 짧은 ord 10 Lesson
  `coding-test/foundations/problem-solving-approach` ("문제 해결 접근법")을 둔다.
- 블로커: 없음. 단, `lesson_problem.statement` 가 `NOT NULL` 이므로 저장형 문제는
  반드시 자체 원본 지문이 있어야 한다(외부 지문 재사용 불가).

---

## 기존 CMM 자료 확인 (TASK A)

`data/index.json`(entries 393개), `data/materials/**`, `data/references/**`,
`curriculum/**` 를 읽기 전용으로 스캔했다.

| 조사 키워드 | 결과 |
|---|---|
| prompt engineering / 프롬프트 설계 | **0건.** `ai-engineering.yaml` 의 `prompts-tokens-context`, `evaluating-llm-output` 은 `related_material_ids: []` (skeleton, needs_external_research). |
| evaluation / eval / LLM 출력 평가 | **0건.** |
| 회귀 테스트(AI 출력) / regression eval | **0건.** `react/testing` 챕터는 프론트엔드 TDD 자료지 LLM 평가와 무관. |
| hallucination / 환각 분석 | **0건.** |
| 알고리즘 / algorithm | **0건** (의미 있는 자료). |
| 자료구조 / data structure | **0건.** |
| 코딩테스트 / coding test | **0건.** `curriculum/lessons/coding-test.yaml` = `lessons: []`. |
| Big-O / 시간복잡도 / complexity | **0건.** |
| DFS / BFS / 그래프 탐색 | **0건.** |
| 동적 계획법 / DP / 그리디 / 이진탐색 / 재귀 / 스택·큐 | **0건.** |

키워드 스캔에서 뜬 것은 전부 오탐이었다: `"graph"` → typography 자료의 "paragraph",
`"sort"` → 디자인 자료의 "sorting" UI 패턴, `"그래프"` → jQuery `EJL15_5_Bar chart`.
`data/references/` 하위 디렉터리는 `css / html / javascript / mui / nextjs / react /
supabase / typescript` 뿐 — AI·알고리즘 레퍼런스 없음.

**결론: 두 영역 모두 기존 자료 0. 100% 외부 공식 문서 기반으로 신규 집필해야 한다.**
(사전 예상과 일치.)

---

# PART 1 — Prompt & Evaluation

대상 chapter: `ai-engineering/prompt-and-evaluation` (`tracks.yaml` 상 status
`needs_external_research`, summary "프롬프트 설계 패턴, 출력 평가·회귀 테스트").

## 학습 목표

이 챕터를 끝내면 학습자는 —

1. 프롬프트를 "요령 모음" 이 아니라 **애플리케이션 코드의 일부**로 다룰 수 있다.
   버전 관리하고, 변경 전에 테스트 픽스처를 만들고, 배포 파이프라인에 태운다.
2. 지시 계층(system/developer vs user), 구조적 프롬프팅(XML·Markdown 구획), few-shot,
   컨텍스트 배치 규칙을 적용해 **의도한 출력 형식·톤·정확도**를 얻을 수 있다.
3. 애플리케이션의 **성공 기준을 SMART 하게 정의**하고(정확도 F1 ≥ 0.85, 독성 < 0.1% 등),
   그 기준을 재는 **평가셋(eval set)** 을 만들 수 있다.
4. 채점 방식을 상황에 맞게 고른다: 코드 기반 exact match, 임베딩 유사도, LLM-as-judge
   (Likert/이진/루브릭), 사람 평가. 각각의 신뢰도·비용·한계를 설명할 수 있다.
5. LLM 출력이 **확률적**이라는 전제 위에서 회귀 평가를 설계한다. 프롬프트/모델을 바꿀 때
   같은 평가셋으로 이전 버전과 비교하고, 환각·오류를 분류해 완화 기법을 적용한다.

## 선행 개념

- `ai-engineering/generative-ai-in-frontend/*` (생성형 AI API 를 앱에 붙여 본 경험) —
  이미 skeleton 존재.
- `ai-engineering/llm-app-fundamentals/prompts-tokens-context` (프롬프트·토큰·컨텍스트·
  스트리밍) — needs_external_research. **이 챕터의 진짜 선행이므로 llm-app-fundamentals
  조사/집필이 먼저거나 최소한 병행**이어야 한다. (Research Agent — AI 담당과 조율 필요.)
- `react/testing` (테스트라는 행위 자체 — "무엇을 검증할지 먼저 정한다" 는 사고방식).
- JavaScript/TypeScript 기초 (평가 스크립트를 직접 짜기 때문).

## 권장 학습 순서

1. **프롬프트 = 개발 산출물** — 명확하고 직접적인 지시, 동기·맥락 부여, 지시 계층,
   XML 구조화, 역할 부여. "동료에게 시켜서 헷갈리면 모델도 헷갈린다" 규칙.
2. **구조적 출력과 few-shot** — 예시 3~5개(관련성·다양성·구조), 출력 형식 고정,
   Structured Outputs 와 프롬프팅의 관계, "하지 마" 대신 "이렇게 해".
3. **성공 기준 정의와 평가셋 만들기** — SMART 기준, 다차원 평가(task fidelity·consistency·
   tone·privacy·latency·price), task-specific · 자동화 · "양 > 질" 원칙, 엣지 케이스 설계.
4. **채점 방법** — 코드 기반(exact match, 정규식, JSON 스키마), 임베딩 코사인 유사도,
   ROUGE/BLEU, LLM-as-judge(Likert·이진·루브릭·CoT), 사람 평가. 결정적 vs 확률적.
5. **회귀 평가와 실패·환각 분석** — 프롬프트/모델 버전 비교, 모델 교체 시 회귀 감지,
   환각 완화(불확실성 허용, 인용 grounding, best-of-N, 외부 지식 제한), CI 연결.

이 순서는 Anthropic "Define success criteria → build evaluations → prompt engineer"
사이클(출처 3, 1)과 정확히 일치한다: **평가가 프롬프트 튜닝보다 먼저 존재해야 한다.**

## 필수 개념 (개념별 레코드)

각 레코드: 개념 요약 · 뒷받침 출처 · 대상 Lesson · 숙련도(mastery).

### 1. 프롬프트 기본기 (명확·직접·맥락)
- **요약**: 구체적으로 원하는 출력 형식·제약을 말한다. 순서가 중요하면 번호 목록으로.
  지시에 "왜" 를 붙이면 모델이 일반화한다("TTS 로 읽히니 말줄임표 금지").
  "above and beyond" 를 원하면 명시적으로 요청한다.
- **출처**: Anthropic *Prompting best practices* — "Be clear and direct",
  "Add context to improve performance". OpenAI *Prompt engineering* — "write clear
  instructions".
- **대상 Lesson**: `prompting-as-development` · **mastery: required**

### 2. 지시 계층 (instruction hierarchy)
- **요약**: system/developer 메시지 = 시스템의 규칙·비즈니스 로직(함수 정의에 해당),
  user 메시지 = 그 함수에 넘기는 입력. 권한이 다르다. reasoning 계열 모델은
  system 대신 developer 메시지를 쓰고, 프롬프트를 단순하게 유지한다.
- **출처**: OpenAI *Prompt engineering* — "Message roles and instruction following"
  ("developer messages provide the system's rules and business logic, like a
  function definition"). OpenAI *Reasoning best practices* — developer 메시지, 지시 단순화.
  Anthropic *Prompting best practices* — "Give Claude a role" (system prompt).
- **대상 Lesson**: `prompting-as-development` · **mastery: required**

### 3. 구조적 프롬프팅 (XML/Markdown 구획)
- **요약**: 지시·맥락·예시·입력을 각각 태그로 감싸면 오해석이 준다(`<instructions>`,
  `<context>`, `<input>`). 태그 이름은 일관되게, 자연스러운 계층이 있으면 중첩.
  Markdown 헤더/리스트로 논리적 경계를 만든다. 재사용 블록은 앞쪽에 둬서 prompt caching 이득.
- **출처**: Anthropic *Prompting best practices* — "Structure prompts with XML tags",
  "Control the format of responses". OpenAI *Prompt engineering* — "Message formatting
  with Markdown and XML".
- **대상 Lesson**: `prompting-as-development`, `structured-and-fewshot` · **mastery: required**

### 4. 구조적 출력과 프롬프팅의 관계
- **요약**: JSON 스키마를 반드시 지켜야 하면 **Structured Outputs 기능**을 쓴다(프롬프트
  기법 아님). 프롬프팅은 그보다 유연한 형식 일관성이 필요할 때. 예전 방식이던
  prefill(assistant 턴 미리 채우기)은 최신 모델에서 미지원 → 형식 강제는 structured
  outputs / 도구 호출 / 시스템 프롬프트 지시로 대체.
- **출처**: Anthropic *Increase output consistency* (상단 Tip + "Prefill" Note),
  *Prompting best practices* — "Migrating away from prefilled responses".
- **대상 Lesson**: `structured-and-fewshot` · **mastery: required**

### 5. few-shot / multishot
- **요약**: 잘 만든 예시 3~5개가 형식·톤·구조를 잡는 가장 신뢰도 높은 수단. 예시는
  (a) 관련성 — 실제 use case 를 닮게, (b) 다양성 — 엣지 케이스 포함, 모델이 엉뚱한
  패턴 학습 못 하게, (c) 구조 — `<example>`/`<examples>` 태그로 지시와 분리.
  reasoning 모델은 zero-shot 먼저 시도 후 필요할 때만 few-shot.
- **출처**: Anthropic *Prompting best practices* — "Use examples effectively".
  OpenAI *Prompt engineering* — "Few-shot learning". OpenAI *Reasoning best practices*
  — "try zero-shot before few-shot".
- **대상 Lesson**: `structured-and-fewshot` · **mastery: required**

### 6. 컨텍스트 설계 (long context 배치)
- **요약**: 20k+ 토큰 입력이면 **긴 문서를 프롬프트 맨 위, 질문·지시·예시는 그 아래**.
  질문을 끝에 두면 응답 품질이 최대 30%까지 오른다(출처 측정치, 단정 금지).
  다중 문서는 `<document>` + `<source>`/`<document_content>` 로 감싼다. 긴 문서 과제는
  "먼저 관련 부분을 그대로 인용하게" 해서 grounding.
- **출처**: Anthropic *Prompting best practices* — "Long context prompting".
  OpenAI *Prompt engineering* — "Include relevant context information" (RAG 포함).
- **대상 Lesson**: `structured-and-fewshot` (+ `rag-and-agents` 챕터와 연결) ·
  **mastery: understand**

### 7. 프롬프트 실패 분석
- **요약**: 실패한 eval 이 전부 프롬프트로 풀리는 건 아니다 — latency/cost 는 모델 교체가
  더 빠를 수 있다. 실패를 (형식 위반 / 지시 무시 / 환각 / 톤 / 컨텍스트 미활용)으로
  분류하고 각각 다른 처방을 쓴다. 자기 검증("끝내기 전에 기준 대비 확인하라")으로
  코딩·수학 오류를 잡는다.
- **출처**: Anthropic *Prompt engineering overview* — "When to prompt engineer".
  Anthropic *Prompting best practices* — "Ask Claude to self-check", "Avoid focusing
  on passing tests and hardcoding". OpenAI *Prompt engineering* — "test changes
  systematically" / 대표 픽스처.
- **대상 Lesson**: `regression-and-failure-analysis` · **mastery: required**

### 8. 성공 기준 정의 (SMART · 다차원)
- **요약**: 나쁜 기준 "모델이 감정 분류를 잘한다" → 좋은 기준 "다양한 트윗 10,000개에서
  F1 ≥ 0.85 (베이스라인 대비 +5%)". Specific · Measurable · Achievable(벤치마크 근거) ·
  Relevant. 대부분은 **여러 기준을 동시에**: task fidelity(F1 ≥ 0.85) · safety(비독성 99.5%) ·
  오류 심각도(90%는 사소) · latency(95% < 200ms) · price(호출당 예산).
- **출처**: Anthropic *Define success criteria and build evaluations* — "Building
  strong criteria", "Common criteria", "Multidimensional".
- **대상 Lesson**: `defining-success-and-evals` · **mastery: required**

### 9. 테스트 데이터셋 (eval set) 설계
- **요약**: 원칙 3개 — (1) task-specific: 실제 사용 분포를 반영, 엣지 케이스 포함
  (빈/없는 입력, 지나치게 긴 입력, 모호·비꼬는 문장, 화난 사용자), (2) 자동화 가능하게
  구조화(객관식·문자열 매치·코드 채점·LLM 채점), (3) **양 > 질**: 자동 채점 문항을 많이
  두는 게 손채점 소수보다 낫다(자동화의 약간 낮은 신호는 감수).
- **출처**: Anthropic *Define success criteria and build evaluations* — "Designing
  evals", 감정 분석 예시(비꼼·혼합 감정 엣지 케이스). OpenAI *Working with evals* —
  JSONL 테스트 데이터 + ground-truth 라벨.
- **대상 Lesson**: `defining-success-and-evals` · **mastery: required**

### 10. 채점 방법: 코드 기반 / 유사도 / LLM-as-judge / 사람
- **요약**:
  - **코드 기반** — exact match(정답이 범주형일 때), 정규식, JSON 스키마 검증,
    문자열 거리(Levenshtein). 가장 싸고 재현 가능.
  - **유사도** — 문장 임베딩 코사인 유사도(일관성: 패러프레이즈 질문에 비슷하게 답하나),
    ROUGE-L/BLEU(요약·번역).
  - **LLM-as-judge** — Likert 1~5(톤·공감), 이진 분류(PHI 포함 여부 등 안전), 루브릭
    채점, CoT 채점(g-eval). 반드시 **피평가 모델과 다른 모델**로 채점, 명확한 루브릭,
    출력 형식 고정(숫자만/yes·no), 필요시 few-shot.
  - **사람 평가** — Likert 척도, 전문가 루브릭(언어학자 평가 등). 주관적·고위험 기준의
    최종 기준선.
- **출처**: Anthropic *Define success criteria and build evaluations* — 6개 채점 예시
  (exact match, cosine similarity, ROUGE-L, LLM Likert, LLM 이진, LLM 서수).
  promptfoo *Assertions and metrics* — deterministic(equals/contains/regex/is-json/
  levenshtein/rouge-n/bleu/latency/cost/javascript/python) vs model-assisted
  (similar/llm-rubric/g-eval/factuality/answer-relevance/context-faithfulness/
  classifier/select-best). Hugging Face *Evaluate* — Metric/Comparison/Measurement,
  도메인별 표준 지표 모음.
- **대상 Lesson**: `evaluating-llm-output` · **mastery: required**

### 11. 결정적 vs 확률적 테스트
- **요약**: 일반 유닛 테스트는 결정적(같은 입력 → 같은 출력). LLM 출력은 확률적이라
  (a) 채점을 임계값·통과율로 표현("95%가 < 200ms", "F1 ≥ 0.85"), (b) 같은 프롬프트를
  여러 번 돌려 분산을 본다(best-of-N 불일치 = 환각 신호), (c) temperature 를 낮추거나
  검색으로 grounding 해서 일관성을 높인다.
- **출처**: Anthropic *Increase output consistency* (형식 지정·예시 제약·검색 grounding·
  프롬프트 체이닝). Anthropic *Reduce hallucinations* — "Best-of-N verification".
  promptfoo *Intro* — "test-driven LLM development, not trial-and-error".
- **대상 Lesson**: `evaluating-llm-output`, `regression-and-failure-analysis` ·
  **mastery: required**

### 12. 회귀 평가
- **요약**: 프롬프트 버전 / 모델 버전을 바꿀 때 **같은 평가셋으로 이전과 비교**한다.
  프롬프트는 앱 코드에 두고 픽스처·테스트를 먼저 만든 뒤 변경한다. 모델 업그레이드 시
  이전에 필요했던 "더 꼼꼼히" 류 프롬프트가 과도 발동(overtrigger)할 수 있으니 회귀로 잡는다.
  체이닝의 대표 패턴 = 자기 교정(draft → 기준 대비 리뷰 → 리팩터), 각 단계가 별도 호출이라
  로깅·평가·분기 가능.
- **출처**: OpenAI *Prompt engineering* — "Version prompts in code" (픽스처·테스트 먼저,
  feature flag). OpenAI *Working with evals* — 프롬프트/모델 버전 간 성능 비교로 회귀 감지.
  Anthropic *Prompting best practices* — "Chain complex prompts" (self-correction),
  "Migration considerations" (anti-laziness 프롬프트 튜닝).
- **대상 Lesson**: `regression-and-failure-analysis` · **mastery: required**

### 13. 환각 / 오류 분석
- **요약**: 완화 기법 — (1) "모르면 모른다고 해" 명시적 허용, (2) 긴 문서는 word-for-word
  인용 먼저 뽑고 그 인용에만 근거, (3) 주장마다 근거 인용 달고 못 찾으면 주장 철회,
  (4) CoT 검증(단계별 추론을 먼저 말하게), (5) best-of-N(여러 번 돌려 불일치 확인),
  (6) 반복 정제, (7) 외부 지식 제한("제공된 문서만 써"). 어떤 기법도 완전 제거는 못 한다 —
  고위험 정보는 항상 검증.
- **출처**: Anthropic *Reduce hallucinations* (기본 3 + 고급 4 기법 전부).
  Anthropic *Prompting best practices* — "Minimizing hallucinations in agentic coding"
  (`<investigate_before_answering>`).
- **대상 Lesson**: `regression-and-failure-analysis` · **mastery: required**

### 14. 품질 지표 (metrics)
- **요약**: task-specific(F1, BLEU, perplexity) / generic(accuracy, precision, recall) /
  operational(응답시간 ms, uptime %). 정성 척도(Likert 1~5, 전문가 루브릭). 지표는
  성공 기준과 1:1로 연결돼야 한다 — 기준 없는 지표는 수집하지 않는다.
- **출처**: Anthropic *Define success criteria and build evaluations* — "Measuring".
  Hugging Face *Evaluate* — `evaluate-metric` 표준 지표 카탈로그, 지표별 한계 카드.
- **대상 Lesson**: `defining-success-and-evals`, `evaluating-llm-output` ·
  **mastery: understand → required**

## 기존 Curriculum과 연결

- `ai-engineering/llm-app-fundamentals/prompts-tokens-context` — **직접 선행**. 토큰·
  컨텍스트 윈도우·스트리밍을 먼저 알아야 프롬프트 설계가 성립. 조사 순서상 이 챕터보다
  앞이거나 병행.
- `ai-engineering/rag-and-agents/retrieval-augmented-generation` — 개념 6(컨텍스트 설계)·
  개념 13(외부 지식 제한)과 겹침. RAG 챕터에서 "검색해 온 컨텍스트를 어떻게 넣나",
  이 챕터에서 "그 컨텍스트 활용을 어떻게 평가하나"로 역할 분담.
  promptfoo `context-faithfulness` / `context-recall` / `answer-relevance` 어서션이
  RAG 평가의 표준 예.
- `ai-engineering/generative-ai-in-frontend/*` — 이미 API 를 붙여 본 미니프로젝트.
  "그때 프롬프트를 감으로 고쳤는데, 이제 평가셋으로 고친다" 로 이어붙일 수 있다.
- `react/testing` — "검증할 것을 먼저 정의한다" 는 사고를 LLM 으로 확장. TDD ↔ eval-driven.
- `typescript/*` — 평가 스크립트를 TS 로 작성(타입 있는 픽스처).

## 부족한 부분

- **한국어 1차 출처 부재.** 채택 출처는 전부 영문 공식 문서. 집필 시 용어(예: eval set,
  LLM-as-judge, grounding)는 원어 + 한국어 병기.
- **오프라인 평가 프레임워크 실습 코드.** promptfoo 는 공식 OSS 지만 설치·실행 예제는
  CMM 이 `generated_minimal` 로 직접 작성해야 한다(문서 코드 복붙 금지, 버전 고정).
- **OpenAI Evals 플랫폼 API 는 폐기 예정** (출처: OpenAI *Working with evals* — 2026-10-31
  read-only, 2026-11-30 shutdown). → Lesson 에서 특정 SaaS 평가 콘솔에 의존하지 말고
  "평가셋 + 채점 함수" 라는 개념과 오픈소스(promptfoo, HF evaluate) 중심으로 집필.
- **벤더 자체 측정치**(예: "질문을 끝에 두면 +30%", "few-shot 3~5개가 최적") 는 재현
  조건이 공개돼 있지 않다. "출처에 따르면" 으로 인용하고 CMM 이 수치로 단정하지 않는다.
- **정량 지표 수학**(F1, ROUGE-L, BLEU, perplexity 의 정의·계산) 은 별도 짧은 보충이
  필요. HF `evaluate-metric` 카드가 각 지표의 정의·한계를 제공하므로 링크로 연결 가능.

## 향후 확장

- LLM-as-judge 편향(위치 편향, 장황함 선호, 자기 모델 선호)과 보정 — g-eval, 페어와이즈
  비교, 심판 교차검증. (promptfoo `select-best` / g-eval 문서 기반으로 확장 가능.)
- 프로덕션 관측(observability): 트레이스 기반 평가, 온라인 평가 vs 오프라인 평가.
  (promptfoo trace-span 어서션이 진입점.)
- 안전·정책 평가: moderation 어서션, red-teaming, jailbreak 회귀셋.
- 에이전트 평가: trajectory / goal-success 어서션, 도구 호출 정확도.

## source 목록 (PART 1)

> 형식: title · URL · publisher · official? · checked_at · 상태 · 뒷받침 개념 ·
> 대상 · Lesson 후보 · 품질 · 인용/라이선스 · followup?

1. **Prompt engineering overview**
   - URL: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
     (구 docs.anthropic.com / docs.claude.com 에서 302 리다이렉트)
   - publisher: Anthropic · **official: YES** · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 1·7 ("평가·성공 기준이 프롬프트 튜닝보다 먼저", "모든 실패가 프롬프트로
     풀리는 건 아님")
   - 대상: chapter 전체 프레이밍 · Lesson 후보: `prompting-as-development` 도입부
   - 품질: 1차·간결 · 인용: 저작권 Anthropic, 문구 그대로 인용 금지 · followup: 없음

2. **Prompting best practices** (Claude 최신 모델용 리빙 레퍼런스)
   - URL: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
   - publisher: Anthropic · **official: YES** · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 1·2·3·5·6·7·11·12 (clear & direct, add context, XML tags, examples,
     long context, role, self-check, chain prompts, prefill 폐기)
   - 대상: `prompting-as-development`, `structured-and-fewshot`,
     `regression-and-failure-analysis`
   - 품질: 매우 높음(모델별 주의사항까지) · 인용: 문구 그대로 복붙 금지, 요약·재서술 ·
     followup: 모델 버전 갱신 잦음 — 집필 직전 재확인

3. **Define success criteria and build evaluations**
   - URL: https://platform.claude.com/docs/en/test-and-evaluate/define-success
     (그리고 .../test-and-evaluate/develop-tests — 같은 문서군)
   - publisher: Anthropic · **official: YES** · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 8·9·10·14 (SMART, 다차원, eval 설계 3원칙, 6개 채점 예시 코드)
   - 대상: `defining-success-and-evals`, `evaluating-llm-output`
   - 품질: 매우 높음, 실행 코드 포함(9개 언어) · 인용: 코드 예시는 개념 설명용으로만
     참조, CMM 실습 코드는 `generated_minimal` 신규 작성 · followup: 없음

4. **Reduce hallucinations**
   - URL: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
   - publisher: Anthropic · **official: YES** · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 13·11 (불확실성 허용, 인용 grounding, 인용 검증, CoT 검증,
     best-of-N, 반복 정제, 외부 지식 제한)
   - 대상: `regression-and-failure-analysis`
   - 품질: 높음, 기법별 프롬프트 예시 · 인용: 재서술 · followup: 없음

5. **Increase output consistency**
   - URL: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/increase-consistency
   - publisher: Anthropic · **official: YES** · checked_at 2026-09-06 · 상태: current
     (단, prefill 관련 서술은 최신 모델 미지원으로 Note 처리됨)
   - 뒷받침: 개념 4·11 (출력 형식 지정, 예시 제약, 검색 grounding, 프롬프트 체이닝,
     역할 유지; structured outputs 우선)
   - 대상: `structured-and-fewshot`, `evaluating-llm-output`
   - 품질: 높음 · 인용: 재서술 · followup: prefill 서술은 "구방식" 으로만 소개

6. **Prompt engineering** (OpenAI API 가이드)
   - URL: https://developers.openai.com/api/docs/guides/prompt-engineering
     (구 platform.openai.com/docs/guides/prompt-engineering 에서 301)
   - publisher: OpenAI · **official: YES** · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 1·2·3·5·6·12 (message roles/instruction following, version prompts
     in code, Markdown+XML, few-shot, context/RAG, 모델별 프롬프팅)
   - 대상: `prompting-as-development`, `structured-and-fewshot`,
     `regression-and-failure-analysis`
   - 품질: 높음 · 인용: 재서술 · followup: 없음

7. **Working with evals** (OpenAI API 가이드)
   - URL: https://developers.openai.com/api/docs/guides/evals
     (구 platform.openai.com/docs/guides/evals 에서 301)
   - publisher: OpenAI · **official: YES** · checked_at 2026-09-06 · 상태:
     **문서는 current 이나 Evals 플랫폼 API 는 deprecated (2026-10-31 read-only /
     2026-11-30 shutdown)**
   - 뒷받침: 개념 9·10·12 (JSONL 테스트 데이터 + ground truth, string_check 그레이더,
     describe→run→analyze 3단계, 버전 간 회귀 비교)
   - 대상: `defining-success-and-evals`, `regression-and-failure-analysis`
   - 품질: 중간(플랫폼 종속 서술 많음) · 인용: **플랫폼 API 세부는 집필에서 제외**,
     "평가셋 + 그레이더" 개념만 채택 · followup: 대체 도구(promptfoo) 중심으로

8. **Reasoning best practices** (OpenAI API 가이드)
   - URL: https://developers.openai.com/api/docs/guides/reasoning-best-practices
   - publisher: OpenAI · **official: YES** · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 2·5 (reasoning 모델은 developer 메시지, 프롬프트 단순화, CoT 지시
     회피, zero-shot 먼저)
   - 대상: `prompting-as-development`, `structured-and-fewshot`
   - 품질: 높음 · 인용: 재서술 · followup: 없음

9. **Intro | Promptfoo**
   - URL: https://www.promptfoo.dev/docs/intro/
   - publisher: promptfoo (OSS, MIT 라이선스 프로젝트) · **official: YES (프로젝트 공식
     문서)** · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 11 (test-driven LLM dev), 평가 워크플로 5단계
   - 대상: `evaluating-llm-output`, `regression-and-failure-analysis` (실습 도구)
   - 품질: 높음 · 인용: 문서 재서술, 예제 코드는 버전 고정해 CMM 이 재작성 · followup:
     집필 시 promptfoo 최신 major 버전 확인

10. **Assertions and Metrics — LLM Output Validation | Promptfoo**
    - URL: https://www.promptfoo.dev/docs/configuration/expected-outputs/
    - publisher: promptfoo · **official: YES** · checked_at 2026-09-06 · 상태: current
    - 뒷받침: 개념 10 (결정적 어서션 목록 vs model-assisted 어서션 목록 — 채점 방법의
      구체 카탈로그)
    - 대상: `evaluating-llm-output`
    - 품질: 높음, 표준 분류 제공 · 인용: 목록 재서술 · followup: 없음

11. **Evaluate on the Hub · Hugging Face** (🤗 Evaluate 라이브러리 문서)
    - URL: https://huggingface.co/docs/evaluate/index
    - publisher: Hugging Face · **official: YES** · checked_at 2026-09-06 · 상태: current
    - 뒷받침: 개념 10·14 (Metric/Comparison/Measurement 3분류, 표준 지표 카탈로그,
      지표별 한계 카드; lighteval 언급)
    - 대상: `evaluating-llm-output`, `defining-success-and-evals` (지표 정의 보충)
    - 품질: 중상 (index 페이지라 개념 서술은 얕음 — `types_of_evaluations` 하위 문서
      추가 확인 필요) · 인용: 재서술 · **followup: YES** — 집필 전
      huggingface.co/docs/evaluate/types_of_evaluations 와 `evaluate-metric` 조직
      페이지를 열어 지표 정의를 확정

---

# PART 2 — Coding Test Track

대상 track: `coding-test` (`tracks.yaml`: `kind: coding_test`, ord 100, status
`needs_external_research`, `chapters: []`). DB: `learning_lessons.lesson_kind = 'problem'`
+ `lesson_problem` 1:1 확장 테이블.

`lesson_problem` 컬럼(실제 스키마, `supabase/migrations/20260906120001_create_curriculum_core.sql`):
`lesson_id(PK) · statement(NOT NULL) · constraints · difficulty · time_complexity ·
space_complexity · hints(jsonb) · solutions(jsonb) · test_cases(jsonb) · source_name ·
source_url · content_hash · synced_at`.
→ `source_name` / `source_url` 이 이미 있으므로 **외부 문제를 "링크로만" 참조하는 구조가
스키마에 내장**돼 있다. `statement` 가 `NOT NULL` 이므로 **저장하는 문제는 자체 원본
지문 필수**.

## 학습 로드맵 (개념 순서 + 연습 문제 유형 + 숙련도)

순서는 MIT 6.006 강의 시퀀스(출처 A)와 CLRS 표준 목차, cp-algorithms 카테고리(출처 B)를
"프론트엔드 개발자의 코딩테스트 대비" 범위로 축약한 것이다. CMM 범위 밖(세그먼트 트리,
최대 유량, суффикс 배열, 고급 그래프)은 제외.

| # | 개념 | 무엇을 연습하나 (문제 유형) | mastery |
|---|---|---|---|
| 1 | **문제 해결 접근법** | 입력/출력/제약 읽기, 예제로 손 시뮬레이션, brute force → 개선, 엣지 케이스 나열, 시간 제한에서 필요한 복잡도 역산 | required |
| 2 | **Big-O 표기법과 복잡도 분석** | 반복문 중첩으로 O(n)/O(n²)/O(log n) 판별, 자료구조 연산별 비용, "n ≤ 10⁵ 이면 O(n log n)까지" 감각 | required |
| 3 | **배열 / 문자열** | 순회·부분합, 투 포인터, 슬라이딩 윈도우, 누적합(prefix sum), 문자열 뒤집기·빈도수 | required |
| 4 | **해시 (map / set)** | 존재 여부 O(1) 조회, 빈도 카운트, 중복 제거, "두 수의 합" 류 보수(complement) 탐색, 그룹핑 | required |
| 5 | **스택** | 괄호 짝 검사, 후위 표기 계산, 단조 스택(다음 큰 원소), 되돌리기 | required |
| 6 | **큐 / 덱** | FIFO 처리, 슬라이딩 윈도우 최대(덱), BFS 를 위한 준비 | required |
| 7 | **재귀** | 팩토리얼·피보나치, 하노이, 순열·조합 생성(백트래킹 기초), 재귀 → 반복 변환 | required |
| 8 | **정렬** | 내장 정렬 + 비교 함수(key)·안정성, "정렬 후 투 포인터/그리디" 패턴. 머지·퀵·힙 정렬은 **원리와 복잡도만** | 개념 understand / 활용 required |
| 9 | **이진 탐색** | 정렬된 배열에서 값 찾기, lower/upper bound, **정답에 대한 이분 탐색**(parametric search), 경계 조건 | required |
| 10 | **트리** | 이진 트리 순회(전위·중위·후위·레벨), 깊이·높이, 이진 탐색 트리 성질, 트리를 재귀로 처리 | required |
| 11 | **그래프 표현** | 인접 리스트 vs 인접 행렬, 방향/무방향, 가중치, 격자(grid)를 그래프로 보기 | required |
| 12 | **BFS** | 최단 거리(무가중치), 레벨 탐색, 격자 최단 경로, 다중 시작점 BFS | required |
| 13 | **DFS** | 연결 요소 세기, 사이클 탐지, 백트래킹(순열·조합·부분집합·N-Queens 류), 위상 정렬 개념 | required |
| 14 | **그리디 기초** | 거스름돈, 회의실 배정(구간 스케줄링), 정렬 + 탐욕 선택, "왜 그리디가 되는가" 반례 찾기 | 개념 understand / 적용 required |
| 15 | **동적 계획법 기초** | 1차원 DP(피보나치·계단 오르기·도둑), 0/1 배낭, LIS, LCS, 동전 교환, 메모이제이션 ↔ 타뷸레이션 | practical |

**학습 순서 근거**
- 1~2 를 먼저: 복잡도 감각 없이는 "이 풀이가 통과할지" 판단 불가. (MIT 6.006 L1 =
  algorithmic thinking / L19 = complexity; CMM 은 complexity 를 앞으로 당김 — 대비 학습에선
  먼저 필요.)
- 3~9 는 "선형 자료구조 + 탐색" 묶음. 해시(4)를 스택·큐보다 앞: 코딩테스트에서 압도적
  빈도. (6.006: hashing L4 가 sorting L3 직후.)
- 10~13 은 "비선형 + 그래프 탐색" 묶음. 트리(재귀 순회)를 그래프 앞에 둬서 재귀·인접
  구조에 먼저 익숙해지게. (6.006: BFS L9 → DFS L10.)
- 14~15 는 "설계 패러다임". 그리디 → DP 순(6.006: DP L15~18 가 마지막 본 강의). DP 는
  가장 어렵고 응용형이라 유일하게 **practical**.

**연습량 배분(권장)**: 개념 1·2 는 각 예제 2~3개. 3~13 은 각 개념당 CMM 자작 예제
2개(easy 1 / medium 1) + 외부 링크 3~5개. 14 는 예제 2개 + 링크. 15 는 예제 4개
(1D 2개, 2D 2개) + 링크 5개 이상.

## 문제 저장 vs 외부 링크 판단

**권장: 하이브리드 — "개념당 CMM 자작 예제 소수 저장 + 외부 문제는 링크만".**

| 방식 | 채택 여부 | 이유 |
|---|---|---|
| 외부(LeetCode/프로그래머스/백준) 지문을 `lesson_problem.statement` 에 복제 저장 | **금지** | 세 사이트 모두 지문 재배포를 약관·규칙으로 제한(아래 저작권 전략). `statement` 는 원본이어야 함. |
| 외부 문제를 `source_name` + `source_url` 로만 참조(지문 없이 "제목 + 링크 + 한 줄 성격") | **채택** | 백준 규칙이 명시적으로 "지문 업로드 말고 링크로" 권장. 링크·제목·사실적 분류는 저작물 복제가 아님. |
| CMM 이 개념 검증용 **자작 예제 문제**를 `statement` 포함 저장 (`source_type: generated_minimal`) | **채택** | 학습자가 CMM 안에서 바로 풀고 채점되게 하려면 자체 지문·테스트케이스가 필요. 저작권 리스크 0. |
| 대량 문제 은행을 CMM 이 자체 구축 | **비권장(현 단계)** | 유지보수 비용 큼. 로드맵이 목표지 문제 수집이 목표가 아님(태스크 명시). |

**저장형 예제 문제 설계 규칙**
- 완전 자작. 흔한 교과서 문제(2-sum, 괄호 검사, 계단 오르기)는 **아이디어는 공용이나
  지문·변수·스토리·테스트케이스를 CMM 이 새로 쓴다**. LeetCode/프로그래머스 특정 지문의
  표현·제약·예시를 그대로 옮기지 않는다.
- frontmatter: `lesson_kind: problem` + `problem:` 블록(`statement / constraints /
  difficulty / time_complexity / space_complexity / hints[] / solutions[] /
  test_cases[]`). `solutions[]` 는 `source_type: generated_minimal` 코드.
- 각 예제에 "이 개념의 어떤 패턴을 검증하는가" 1줄.
- 난이도는 easy/medium 까지만(코딩테스트 통과 목적). hard·대회형 제외.

**외부 링크 참조 규칙**
- `source_name`(예: "LeetCode 1. Two Sum"), `source_url`(정식 문제 URL), 그리고 Lesson
  본문에 **한 줄 분류만**("해시로 보수를 찾는 기본형", "난이도 easy"). 지문·제약·예시 복사 금지.
- 사이트별 최소 1~2개씩 섞어 특정 플랫폼 종속 회피. 한국 코딩테스트 대비이므로
  프로그래머스(연습 문제)·백준 위주, 영어권 감각용으로 LeetCode 소수.

## 저작권 전략 (한 줄)

**외부 문제는 "제목 + URL + 한 줄 성격" 링크 참조만; CMM 저장 문제는 100% 자작
`generated_minimal`; CLRS·강의자료는 인용만 하고 본문·그림·문제를 복제하지 않는다.**

플랫폼별 근거(전부 checked_at 2026-09-06):

| 플랫폼 | 정책 요지 | CMM 처리 |
|---|---|---|
| **LeetCode** (Terms of Service, https://leetcode.com/terms/) | 모든 콘텐츠(문항·솔루션 포함)가 LeetCode 독점 재산. 무단 복제·재배포·게시 금지. | 지문 저장·인용 **불가**. `제목 + URL` 링크만. |
| **프로그래머스** (school.programmers.co.kr/tos + 공식 QnA) | 문제 지문·테스트케이스·힌트 저작권 보호. **기업 코테·탑프로그래머스 선발 문제 = 게시 절대 금지(민형사 책임)**. **코딩테스트 연습·과제관 공개 문제 = 비상업·비영리 게시 가능, 출처 명시 필수**("출처: 프로그래머스 코딩테스트 연습, https://school.programmers.co.kr/learn/challenges"), 단 **풀고 채점되게 재호스팅하는 것은 제한**. 광고 붙은 블로그/유튜브·유료 강의·서적 불가. | CMM 안에서 풀이·채점 UI 제공 = 재호스팅에 해당하므로 **지문 저장 불가**. `제목 + URL` 링크 + 규정 문구 그대로 출처 표기. 기업 코테 유형은 링크도 지양. |
| **백준 / BOJ** (이용 규칙, help.acmicpc.net 계열 + startlink 안내) | **문제 저작권 = 출제자에게 귀속.** 블로그 등에 **지문을 올리지 말고 링크로 추가할 것**을 권장. 소스코드 저작권은 작성자. LLM·자동 제출 도구 사용 시 제재. | `제목 + URL` 링크만. 지문·예제 입출력 복사 금지. |
| **CLRS**(Cormen 외, *Introduction to Algorithms*) | 상용 교재. 본문·연습문제 저작권 보유. | 개념 출처로 **인용만**(장·개념 언급). 정의문·의사코드·연습문제 복제 금지. 가능하면 CC 라이선스인 MIT 6.006 강의자료를 1차로. |
| **MIT OCW 6.006** | **CC BY-NC-SA 4.0.** | 저작자 표시 + 비영리 + 동일조건변경허락 준수 시 강의 노트·시퀀스 인용/재구성 가능. CMM 자료가 비영리 교육이면 부합. 표기: "MIT OpenCourseWare, 6.006 Introduction to Algorithms (Spring 2020), CC BY-NC-SA 4.0". |
| **cp-algorithms.com** | **CC BY-SA 4.0.** | 저작자 표시 + 동일조건변경허락 시 설명 인용/번역 가능. 알고리즘 구현을 그대로 옮기면 파생물이 CC BY-SA 가 되므로, 개념 설명 참고 후 코드는 CMM 이 새로 작성 권장. |
| **Big-O Cheat Sheet** (bigocheatsheet.com, Eric Drowell) | 명시적 오픈 라이선스 표기 못 찾음. | 복잡도 "사실값"(퀵정렬 평균 O(n log n) 등)은 저작 대상 아님 — CMM 표로 재작성. 표 이미지·문구는 복제 금지. 교차검증용으로만 사용. |
| **Python `wiki.python.org` TimeComplexity** | Python 문서 라이선스(PSF)/편집 가능 위키. | CPython 내장 자료구조 연산 복잡도의 **사실 확인용 1차 출처**. 표는 CMM 이 재작성. |

## 권장 첫 Lesson

**첫 authored Lesson = `coding-test/foundations/big-o-notation` ("Big-O 표기법과 복잡도
분석")**, 그 앞에 짧은 도입 Lesson `coding-test/foundations/problem-solving-approach`.

이유:
- 태스크가 준 후보는 "Big-O" 또는 "문제 해결 접근법". 둘 다 필요하나, **집필 우선순위는
  Big-O** — 개념 밀도가 높고(mechanism·must_know·experiment 섹션이 풍부), CMM 대표 Lesson
  (`usestate-basics`) 의 "동작 원리 + 반드시 기억할 것 + 직접 바꿔 보기" 스타일과 가장 잘 맞는다.
- "문제 해결 접근법" 은 ord 10 의 짧은(20~25분) Lesson 으로 먼저 배치하되, 개념보다
  체크리스트·사고 흐름 위주라 집필 난이도가 낮다. Big-O 를 레퍼런스 품질로 먼저 완성하고
  그 다음에 채운다.

**`big-o-notation` Lesson 스케치** (curriculum/README §5 섹션 어휘 사용):
- `goal` — 반복문만 보고 O(1)/O(log n)/O(n)/O(n log n)/O(n²)/O(2ⁿ) 를 구분한다;
  "n ≤ 10⁵, 1초" 같은 제한에서 필요한 복잡도를 역산한다.
- `prerequisite` — 배열 순회, 중첩 반복문, 함수 호출 비용(JS 기준).
- `dev_problem` — 정답인데 "시간 초과" 나는 상황: O(n²) 로 n=10⁵ → 10¹⁰ 연산.
- `concept` — 점근 표기의 의미(상수·저차항 무시, 최악의 경우), 왜 입력 크기 함수인가.
- `mechanism` — 흔한 코드 패턴 → 복잡도 매핑 표(단일 루프, 이중 루프, 반씩 줄이기,
  분할정복, 재귀 트리).
- `code` — `generated_minimal` JS/TS 예제 3개(선형 합, 이중 루프 중복 검사,
  이진 탐색). 각각 연산 횟수를 주석으로.
- `must_know` — 자료구조 연산별 복잡도(배열 index O(1)/탐색 O(n), 해시 조회 O(1) 평균,
  정렬 O(n log n), 스택·큐 push/pop O(1)). 출처: Python TimeComplexity, Big-O Cheat Sheet
  (사실 교차검증).
- `experiment` — n 을 10³→10⁴→10⁵ 로 키우며 O(n) vs O(n²) 실행 시간 체감.
- `delegatable` — 마스터 정리의 엄밀한 증명, амортизированный 분석의 형식적 전개 →
  개념만. 공간 복잡도의 정밀 계산 → 큰 그림만.
- `check_question` / `interview_question` — "HashMap 조회가 O(1)인데 왜 최악 O(n)?",
  "정렬 후 투 포인터가 O(n log n)인 이유".
- `review` — "Big-O 는 입력이 커질 때 연산량이 어떻게 늘어나는지를 상수 빼고 본 것;
  제한을 보고 필요한 복잡도를 먼저 정한 뒤 자료구조를 고른다."

## Chapter/Lesson 후보 설계 (YAML 수정 금지 — 설계안만)

`tracks.yaml` 의 `coding-test.chapters: []` 를 채울 때의 **제안**. 실제 반영은 별도 승인 단계.

```
Track: coding-test  (kind: coding_test, ord 100)

Chapter  coding-test/foundations            "기초 — 접근법과 복잡도"      ord 10
  L problem-solving-approach   "문제 해결 접근법"          lesson   understand  ord 10
  L big-o-notation            "Big-O 표기법과 복잡도 분석"  lesson   required    ord 20   ← 첫 집필

Chapter  coding-test/linear-structures      "선형 자료구조"               ord 20
  L array-traversal-patterns  "배열 — 투 포인터·슬라이딩 윈도우·누적합"  lesson  required  ord 10
  L strings                   "문자열 다루기"              lesson   required    ord 20
  L hashing                   "해시 — map과 set으로 O(1) 조회"  lesson  required  ord 30
  L stack                     "스택"                      lesson   required    ord 40
  L queue-deque               "큐와 덱"                    lesson   required    ord 50
  P two-sum-ish               "예제: 합이 K인 두 원소"      problem  required    ord 60   (generated_minimal)
  P valid-brackets-ish        "예제: 괄호 짝 검사"          problem  required    ord 70   (generated_minimal)

Chapter  coding-test/recursion-and-search   "재귀와 탐색"                 ord 30
  L recursion                 "재귀와 백트래킹 기초"        lesson   required    ord 10
  L sorting                   "정렬 — 내장 정렬 활용과 원리"  lesson  required    ord 20
  L binary-search             "이진 탐색과 정답 이분 탐색"   lesson   required    ord 30
  P binary-search-answer-ish  "예제: 최소 용량 구하기(이분 탐색)"  problem required ord 40  (generated_minimal)

Chapter  coding-test/trees-and-graphs       "트리와 그래프"               ord 40
  L binary-tree-traversal     "이진 트리 순회"             lesson   required    ord 10
  L graph-representation      "그래프 표현 — 인접 리스트와 격자"  lesson required ord 20
  L bfs                       "BFS — 무가중치 최단 거리"    lesson   required    ord 30
  L dfs                       "DFS — 연결 요소·사이클·백트래킹"  lesson required ord 40
  P grid-shortest-path-ish    "예제: 격자 최단 경로(BFS)"   problem  required    ord 50   (generated_minimal)
  P count-islands-ish         "예제: 덩어리 개수 세기(DFS)"  problem  required    ord 60   (generated_minimal)

Chapter  coding-test/design-paradigms       "설계 패러다임"               ord 50
  L greedy-basics             "그리디 기초와 반례 찾기"      lesson   understand  ord 10
  L dynamic-programming-1d    "DP 기초 — 1차원"            lesson   practical   ord 20
  L dynamic-programming-2d    "DP 기초 — 2차원(배낭·LCS)"   lesson   practical   ord 30
  P climb-stairs-ish          "예제: 계단 오르기(1D DP)"    problem  practical   ord 40   (generated_minimal)
  P knapsack-ish              "예제: 0/1 배낭"             problem  practical   ord 50   (generated_minimal)
```

- Lesson id 는 chapter id 앞 2세그먼트 규칙 준수 (`coding-test/<chapter>/<lesson>`).
- `problem` Lesson 은 전부 `generated_minimal` 자작. 각 개념 Lesson 의
  `sources:` 에 외부 문제를 `source_name`+`source_url` 로 3~5개 loose ref (지문 없이).
- 언어: 예제 코드·솔루션은 JS/TS (프론트엔드 트랙과 일관). 파이썬 병기는 선택.
- 전체 15 Lesson + 8 예제 문제 = Chapter 5개. `estimated_minutes` 는 개념 35~50,
  예제 25~40 권장.

## source 목록 (PART 2)

> 형식: title · URL · publisher · official/authoritative? · checked_at · 상태 ·
> 뒷받침 개념 · 대상 · Lesson 후보 · 품질 · 라이선스/인용 · followup?

A. **6.006 Introduction to Algorithms — Syllabus & Lecture Notes (Spring 2020)**
   - URL: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/syllabus/
     · https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/
   - publisher: MIT OpenCourseWare · **authoritative: YES (대학 정규 교과)** ·
     checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 순서 전체 (L1 algorithmic thinking → data structures → sorting →
     hashing → binary trees/AVL → heaps → BFS → DFS → shortest paths → DP ×4 →
     complexity → review)
   - 대상: `coding-test` 트랙 전체 로드맵 골격, `foundations`·`trees-and-graphs`·
     `design-paradigms` 챕터
   - 품질: 매우 높음 · **라이선스: CC BY-NC-SA 4.0** — 저작자 표시·비영리·동일조건
     준수 시 시퀀스 재구성 가능. 강의 노트 문장·그림 복제는 지양 ·
     **followup: YES** — 개별 lecture note PDF 를 열어 각 개념의 "무엇을 먼저 가르치나"
     디테일 확인(현재는 제목 시퀀스까지 확인)

B. **CP-Algorithms**
   - URL: https://cp-algorithms.com/
   - publisher: cp-algorithms (커뮤니티, e-maxx.ru/algo 번역·확장) ·
     **authoritative: 중상 (경진 프로그래밍 표준 레퍼런스, 다만 커뮤니티 편집)** ·
     checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 3·4·5·9·12·13·15 (fundamentals, data structures, DP, string
     processing, graphs 카테고리 구조)
   - 대상: `linear-structures`, `recursion-and-search`, `trees-and-graphs`,
     `design-paradigms` 의 개념 정의·연습 유형 참고
   - 품질: 높음(단 CMM 범위보다 깊음 — 축약 필요) · **라이선스: CC BY-SA 4.0** —
     설명 인용 가능, 코드를 옮기면 파생물이 BY-SA 가 되므로 코드는 CMM 재작성 ·
     followup: 없음

C. **Big-O Cheat Sheet**
   - URL: https://www.bigocheatsheet.com/
   - publisher: Eric Drowell (개인) · **authoritative: 중 (비공식이나 널리 쓰임)** ·
     checked_at 2026-09-06 · 상태: current
   - 뒷받침: 개념 2·8 (복잡도 등급, 자료구조 14종 연산별 평균/최악, 정렬 15종
     best/avg/worst + 공간)
   - 대상: `big-o-notation` 의 `must_know` 표 (교차검증용)
   - 품질: 중 · **라이선스: 명시 못 찾음** — 복잡도 사실값만 취해 CMM 이 표 재작성,
     페이지 문구·그래픽 복제 금지 · **followup: YES** — 최소 1개 교재(CLRS 표 또는
     6.006 노트)와 대조해 값 확정

D. **Python TimeComplexity (wiki.python.org)**
   - URL: https://wiki.python.org/moin/TimeComplexity
   - publisher: Python Software Foundation wiki · **authoritative: 높음 (CPython
     동작 기준)** · checked_at 2026-09-06 · 상태: current (편집 가능 위키이므로 값은
     교차검증)
   - 뒷받침: 개념 2·4·6·8 (list append/pop O(1), 중간 삽입 O(n), `x in s` O(n);
     deque 양끝 O(1); set 멤버십 O(1) 평균; dict 조회·삽입·삭제 O(1) 평균, 최악 O(n))
   - 대상: `big-o-notation`, `hashing`, `queue-deque` 의 연산 비용 사실 근거
   - 품질: 높음(언어 내장 자료구조 한정) · 라이선스: Python 문서 라이선스, 표는 재작성 ·
     followup: JS 대응(Array/Map/Set) 은 MDN 또는 V8 문서로 별도 확인 필요 —
     현재 트랙 예제 언어가 JS/TS 이므로 **followup: YES**

E. **LeetCode — Terms of Service**
   - URL: https://leetcode.com/terms/
   - publisher: LeetCode · official: YES · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 저작권 전략 (콘텐츠·문항 독점 재산, 무단 복제·재배포·게시 금지)
   - 대상: 외부 문제 참조 정책 (링크만)
   - 품질: 1차(약관) · 인용: 정책 사실만 요약 · followup: 없음

F. **백준 / BOJ 이용 규칙 · 저작권 안내**
   - URL: https://help.acmicpc.net/rule (조사 시점 404 — 리다이렉트/이동 가능) ·
     대체 확인: https://startlink.blog/author/baekjoon/ 및 커뮤니티 정리
     (예: https://leeryeongsong.github.io/baekjoon/about-baekjoon/)
   - publisher: Startlink (BOJ 운영사) · official: YES (운영사 규칙) ·
     checked_at 2026-09-06 · 상태: current (규칙 URL 은 재확인 필요)
   - 뒷받침: 저작권 전략 (문제 저작권 = 출제자 귀속; 지문 업로드 대신 링크 권장;
     소스코드 저작권 = 작성자; LLM/자동 제출 도구 제재)
   - 대상: 외부 문제 참조 정책 (링크만, 예제 입출력도 복사 금지)
   - 품질: 1차(운영 규칙) · 인용: 정책 사실만 · **followup: YES** — `help.acmicpc.net`
     규칙 페이지의 현재 정식 URL 을 재확인해 인용 링크 확정

G. **프로그래머스 — 서비스 이용약관 + 공식 QnA "문제를 외부에 게시할 수 있나요?"**
   - URL: https://school.programmers.co.kr/tos ·
     https://docs.channel.io/grepp_qna/ko/articles/프로그래머스의-문제를-외부에-게시할-수-있나요-3f8537c9
   - publisher: 프로그래머스(그렙) · official: YES · checked_at 2026-09-06 · 상태: current
   - 뒷받침: 저작권 전략 (기업 코테·탑프로그래머스 선발 문제 게시 절대 금지;
     연습·과제관 공개 문제는 비상업·비영리 + 출처 명시 시 게시 가능하나 풀이·채점
     재호스팅은 제한; 광고 블로그·유료 강의·서적 불가)
   - 대상: 외부 문제 참조 정책 (링크 + 규정 출처 문구), 저장형 문제를 자작으로 하는 근거
   - 품질: 1차(약관·공식 QnA) · 인용: 출처 표기 문구 그대로 사용 ·
     followup: 약관 버전 날짜 확인

H. **CLRS — *Introduction to Algorithms* (Cormen, Leiserson, Rivest, Stein)**
   - URL: 없음(상용 서적) · publisher: MIT Press · **authoritative: YES (표준 교재)** ·
     checked_at 2026-09-06 · 상태: current (4th ed.)
   - 뒷받침: 개념 2·8·9·10·13·15 (점근 표기 정의, 정렬, 이진 탐색, 트리, 그래프 탐색, DP)
     의 표준 정의·용어 기준
   - 대상: 모든 개념 Lesson 의 용어·정의 정합성 체크
   - 품질: 최고 · **인용만** — 장·개념 언급 가능, 정의문·의사코드·연습문제·그림 복제 금지.
     1차 인용은 CC 라이선스인 6.006(출처 A)을 우선 · followup: 없음

I. (Part 1 과 공유) **promptfoo / OpenAI evals** — 코딩테스트 트랙과 무관. Part 1 목록 참조.

---

## 조사 마무리 노트

- 작성 파일: `research/evaluation-and-coding-test.md` (이 파일) **한 개만**.
- 임시/스크래치 파일 없음(scratchpad 미사용). curriculum/**, supabase/**, src/**,
  data/**, 기타 기존 파일 **미수정** (읽기 전용 스캔만).
- 외부 문제 지문 **복제 없음**. LeetCode/프로그래머스/백준은 제목·URL·정책만 인용.
- 벤더 문서의 자체 성능 수치는 "출처에 따르면" 조건부로만 기록, CMM 단정 아님.
- followup 필요 표시: HF `types_of_evaluations` 하위 문서(#11), MIT 6.006 개별 lecture
  note(A), Big-O 값 교재 대조(C), JS 자료구조 복잡도 MDN 확인(D), 백준 규칙 정식 URL(F).
