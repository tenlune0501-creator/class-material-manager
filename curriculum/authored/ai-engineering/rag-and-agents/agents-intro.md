---
id: ai-engineering/rag-and-agents/agents-intro
chapter: ai-engineering/rag-and-agents
title: 에이전트 기초 — 도구를 루프에서 쓰기
mastery: understand
lesson_kind: lesson
estimated_minutes: 45
tags: [ai, agents, agent-loop, tools, workflow]
related_material_ids: []
sources:
  - title: "Building effective agents"
    url: https://www.anthropic.com/engineering/building-effective-agents
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_guide
  - title: "Agents (Agents SDK guide)"
    url: https://developers.openai.com/api/docs/guides/agents
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - ai-engineering/llm-app-fundamentals/tool-calling
  - ai-engineering/rag-and-agents/retrieval-augmented-generation
code_examples:
  - slug: loop
    title: 에이전트 루프 (행동 → 관찰 → 반복)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 도구 호출(단발) 을 "완료/정지 조건까지 반복" 으로 확장한 것이 에이전트
      let messages = [{ role: "user", content: goal }];
      for (let step = 0; step < MAX_STEPS; step++) {
        const res = await model({ messages, tools });

        if (res.stopReason !== "tool_use") return res.text;   // 정지: 최종 답

        for (const call of res.toolCalls) {
          const observation = await runTool(call.name, call.input); // 환경에서 ground truth
          messages.push({ role: "assistant", content: res.content });
          messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(observation) });
        }
        // 다음 루프: 모델이 관찰을 보고 다음 행동을 정한다
      }
      // MAX_STEPS / 예산 / 사람 확인 체크포인트로 무한 루프·폭주를 막는다
  - slug: augmented-llm
    title: 기본 빌딩블록 — augmented LLM
    source_type: generated_minimal
    language: text
    code: |
      augmented LLM = LLM + 검색(retrieval) + 도구(tools) + 메모리(memory)
        - 모델이 스스로 검색 쿼리를 만들고, 도구를 고르고, 무엇을 기억할지 정한다.
      에이전트 = 이 augmented LLM 을 루프에서 돌리는 것.
  - slug: workflow-vs-agent
    title: Workflow vs Autonomous Agent
    source_type: generated_minimal
    language: text
    code: |
      Workflow : LLM·도구가 "미리 정해진 코드 경로" 로 오케스트레이션. 예측 가능·저비용.
      Agent    : LLM 이 "경로·도구 사용을 스스로" 지휘. 유연하나 비용·지연·예측불가↑.

      원칙: 복잡도는 "결과가 눈에 띄게 좋아질 때만" 추가한다.
             고정 경로로 되는 일이면 워크플로가 낫다. 에이전트는 최후.
  - slug: patterns
    title: 대표 워크플로 패턴
    source_type: generated_minimal
    language: text
    code: |
      프롬프트 체이닝   : 단계를 순차로, 중간 게이트로 검증
      라우팅           : 입력을 분류해 전문 경로로 보냄
      병렬화           : 나눠서(sectioning) / 여러 번 투표(voting)
      orchestrator-workers : 중앙 LLM 이 작업 분해·위임·종합
      evaluator-optimizer  : 한 LLM 생성 + 다른 LLM 평가·피드백 반복
  - slug: guardrails
    title: 안전 — 가드레일·상태·핸드오프 (개념)
    source_type: generated_minimal
    language: text
    code: |
      state      : 다단계 작업을 끝낼 만큼의 최소 상태만 유지
      가드레일   : 입력·출력·도구에 검사. 위험 작업 전 정지/승인 대기(재개 가능)
      핸드오프   : 담당 에이전트 전환 (멀티 에이전트 — 이번 범위 아님, 포인터만)
      도구 종류  : 플랫폼 도구 / 함수 호출 / MCP 연결 / 다른 에이전트를 도구로
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **에이전트 = 도구를 루프에서 쓰는 LLM** 이라는 정의와 **에이전트 루프**(행동 → 관찰 → 반복)를 설명한다.
- 기본 빌딩블록 **augmented LLM**(검색 + 도구 + 메모리)을 안다.
- **Workflow(고정 경로) vs Autonomous Agent(모델이 경로 결정)** 를 구분하고, "복잡도는 필요할 때만" 원칙을 안다.
- 대표 워크플로 패턴(체이닝·라우팅·병렬화·orchestrator-workers·evaluator-optimizer)을 안다.
- 이 Lesson은 **개념 소개**다 — 깊은 메모리/플래닝, 멀티 에이전트 구현은 범위 밖.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 도구 호출 왕복(단발), RAG(검색), LLM 컨텍스트/비용.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

도구 호출은 "한 번" 왕복이다. 그런데 "이 이슈를 조사해서 요약해 줘" 같은 일은 여러 번
검색·읽기·판단을 **반복**해야 한다. 그걸 모델이 스스로 하게 하는 게 에이전트다 — 다만
아무 데나 붙이면 비싸고 느리고 예측 불가능해진다.

<!-- section: concept -->
## 1. 에이전트 루프

{{code: loop}}

- 사용자 지시로 시작 → 모델이 행동(도구 호출)을 정함 → 앱이 실행해 **환경에서 ground truth**(도구 결과)를
  얻음 → 모델이 그걸 보고 다음 행동을 정함 → 완료/정지 조건까지 반복.
- **`MAX_STEPS`·예산 한도·사람 확인 체크포인트**로 무한 루프·폭주를 막는다.

<!-- section: mechanism -->
## 2. augmented LLM

{{code: augmented-llm}}

에이전트의 기본 단위는 "검색·도구·메모리로 증강된 LLM" 이다. 모델이 스스로 검색 쿼리를 만들고,
도구를 고르고, 무엇을 기억할지 정한다. 에이전트는 이걸 루프에서 돌리는 것.

<!-- section: concept | title: workflow vs agent -->
## 3. Workflow vs Agent

{{code: workflow-vs-agent}}

{{code: patterns}}

- **Workflow** = 미리 정해진 코드 경로(예측 가능, 싸다). **Agent** = 모델이 경로를 스스로 통제(유연하나 비쌈).
- **원칙: 복잡도는 결과가 눈에 띄게 좋아질 때만 추가.** 고정 경로로 되면 워크플로, 에이전트는 최후.
- 대부분의 "에이전트 문제"는 사실 위 워크플로 패턴 하나로 충분하다.

<!-- section: concept | title: 안전 -->
## 4. 안전 — 가드레일·상태 (개념)

{{code: guardrails}}

- **state**: 다단계 작업 완수에 필요한 최소만.
- **가드레일**: 입력·출력·도구 검사 + 위험 작업 전 정지/승인(재개 가능).
- 멀티 에이전트(핸드오프, agents-as-tools)는 이번 범위 밖 — 필요해질 때 별도 학습.
- (깊은 memory/planning 동작은 이 Lesson에서 다루지 않는다.)

<!-- section: must_know -->
## 반드시 기억할 것

- 에이전트 = **도구를 루프에서 쓰는 LLM.** 루프 = 행동 → 관찰(환경의 ground truth) → 반복 → 정지 조건.
- 기본 단위 = **augmented LLM**(검색 + 도구 + 메모리).
- **Workflow(고정 경로) vs Agent(모델이 경로 결정).** 복잡도는 필요할 때만 — 고정 경로면 워크플로.
- 워크플로 패턴: 체이닝 / 라우팅 / 병렬화 / orchestrator-workers / evaluator-optimizer.
- 안전: `MAX_STEPS`·예산·사람 체크포인트, 가드레일, 최소 state.
- 멀티 에이전트·깊은 메모리/플래닝은 후속 주제.
- (도구 지형·SDK는 빠르게 바뀐다 — 개념 프레임은 유효하되 특정 도구는 그때 문서 확인.)

<!-- section: experiment -->
## 직접 해 보기

1. 도구 2개(`search`, `read_page`)로 "질문 → 검색 → 읽기 → 요약" 을 하는 최소 에이전트 루프를 구현하라. `MAX_STEPS=5`.
2. `MAX_STEPS` 를 1로 줄여 중간에 잘리는 걸, 예산 한도를 걸어 비용 폭주를 막는 걸 확인하라.
3. 같은 태스크를 **고정 워크플로**(검색 → 읽기 → 요약, 코드로 순서 고정)로도 짜서 에이전트와 비용·정확도를 비교하라.
4. 위험한 도구(`delete_file`)를 넣고, 실행 전 사람 승인을 요구하는 가드레일을 붙여라.
5. "라우팅" 패턴으로 입력을 분류해 서로 다른 프롬프트로 보내 보라.

<!-- section: check_question -->
## 이해 점검

1. 에이전트와 단발 도구 호출의 차이는?
2. 에이전트 루프에서 "관찰(observation)" 은 어디서 오나?
3. Workflow와 Agent를 각각 언제 쓰나? "복잡도" 원칙은?
4. 워크플로 패턴 5가지를 말하면?
5. 에이전트의 폭주를 막는 장치들은?

<!-- section: interview_question -->
## 면접 대비

- "에이전트와 워크플로의 차이, 그리고 언제 무엇을 선택하나요?"
- "에이전트 루프를 안전하게 운영하기 위한 가드레일에는 무엇이 있나요?"
- "'대부분의 에이전트 문제는 워크플로로 충분하다' 는 주장에 대한 생각은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 에이전트=도구를 루프에서(행동→관찰→반복→정지), augmented LLM(검색+도구+메모리),
> workflow vs agent(복잡도는 필요할 때만), 패턴 5종, 가드레일·MAX_STEPS를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**에이전트는 augmented LLM(검색+도구+메모리)을 행동 → 관찰 → 반복 루프에서 돌려 목표를 달성하되
`MAX_STEPS`·예산·가드레일로 폭주를 막는다 — 고정 경로로 되는 일은 워크플로(체이닝·라우팅·orchestrator 등)가
낫고, 복잡도는 결과가 분명히 좋아질 때만 올린다.**
