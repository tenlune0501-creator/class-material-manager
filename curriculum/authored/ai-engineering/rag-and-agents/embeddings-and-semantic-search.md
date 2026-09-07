---
id: ai-engineering/rag-and-agents/embeddings-and-semantic-search
chapter: ai-engineering/rag-and-agents
title: 임베딩과 의미 검색
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [ai, embeddings, similarity, vector-search]
related_material_ids: []
sources:
  - title: "Vector embeddings"
    url: https://developers.openai.com/api/docs/guides/embeddings
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Embeddings"
    url: https://platform.claude.com/docs/en/build-with-claude/embeddings
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - ai-engineering/llm-app-fundamentals/prompts-tokens-context
code_examples:
  - slug: what
    title: 임베딩 = 의미를 담은 벡터
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const v1 = await embed("환불은 어떻게 하나요");   // → [0.021, -0.11, 0.34, ... ] (부동소수 N차원)
      const v2 = await embed("결제 취소 절차 문의");
      const v3 = await embed("오늘 서울 날씨");

      // 의미가 가까우면 벡터도 가깝다:
      cosine(v1, v2)  // ≈ 0.9  (표현이 달라도 의미가 비슷)
      cosine(v1, v3)  // ≈ 0.1  (무관)
      // 키워드가 안 겹쳐도 "의미로" 찾는다 = 의미 검색(semantic search)
  - slug: cosine
    title: 코사인 유사도
    source_type: generated_minimal
    language: js
    code: |
      const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
      const norm = (a) => Math.sqrt(dot(a, a));
      const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b));  // -1 ~ 1, 클수록 유사
      // 벡터가 정규화(길이 1)돼 있으면 내적 = 코사인 → 더 빠름
      // 차원 수는 모델마다 다르다(수백~수천). 일부 모델은 차원 축소 파라미터 제공.
  - slug: search
    title: 의미 검색 — 최근접 이웃
    source_type: generated_minimal
    language: js
    code: |
      // 준비: 문서(청크)들을 미리 임베딩해 저장
      const store = docs.map((d) => ({ text: d, vec: /* await embed(d) */ }));

      async function semanticSearch(query, k = 3) {
        const qv = await embed(query, { inputType: "query" }); // 검색용 임베딩 구분(품질↑)
        return store
          .map((s) => ({ ...s, score: cosine(qv, s.vec) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, k);                                        // 상위 K개
      }
      // 문서가 수천 개면 전수 비교는 느리다 → 벡터 인덱스(ANN) / 벡터 DB 가 필요(다음 Lesson)
  - slug: uses
    title: 용도
    source_type: generated_minimal
    language: text
    code: |
      검색(RAG의 "검색" 단계) · 유사 문서/중복 탐지 · 추천 · 클러스터링 · 분류 · 이상 탐지
      임베딩 제공자는 골라 쓴다(OpenAI, Voyage 등). 특정 벤더에 종속되지 않게 인터페이스로 감싼다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **임베딩** = 텍스트의 의미를 담은 **부동소수 벡터**임을 안다.
- **코사인 유사도**(정규화 시 내적)로 "의미가 가까운지"를 잰다.
- 쿼리 임베딩과 문서 임베딩들 사이 유사도로 **의미 검색(최근접 이웃)** 을 구현한다.
- 검색용/문서용 임베딩 구분, 차원, 그리고 규모가 커지면 **벡터 인덱스/DB** 가 필요함을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- LLM API 호출, 벡터/거리의 아주 기초.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"환불 방법" 을 검색하는데 문서엔 "결제 취소 절차" 라고 쓰여 있으면 키워드 검색은 못 찾는다.
**의미로** 찾으려면 텍스트를 숫자 벡터로 바꿔 거리로 비교해야 한다 — 그게 임베딩이다.
RAG·추천·중복 탐지의 수학적 토대다.

<!-- section: concept -->
## 1. 임베딩

{{code: what}}

- 임베딩 모델에 텍스트를 넣으면 **N차원 벡터**(부동소수 리스트)가 나온다.
- **벡터 간 거리가 가까우면 의미가 가깝다.** 표현이 달라도(환불 ↔ 결제 취소) 의미가 비슷하면 벡터도 비슷.

<!-- section: mechanism -->
## 2. 코사인 유사도

{{code: cosine}}

- 두 벡터가 이루는 각도로 유사도를 잰다(−1~1, 클수록 유사). 벡터가 **정규화**(길이 1)돼 있으면
  내적 = 코사인이라 더 빠르다.
- 차원 수는 모델마다 다르다(수백~수천). 일부 모델은 차원을 줄이는 파라미터를 제공한다.

<!-- section: concept | title: 검색 -->
## 3. 의미 검색

{{code: search}}

- 문서(청크)들을 **미리** 임베딩해 저장 → 런타임에 쿼리를 임베딩 → 저장된 벡터들과 유사도 계산 → 상위 K개.
- 검색 태스크에서는 **쿼리용/문서용 임베딩을 구분**(`input_type`)하면 품질이 오른다.
- 문서가 수천~수백만이면 전수 비교가 느리다 → 근사 최근접 이웃(ANN) 인덱스 / 벡터 DB 필요(다음 Lesson).

<!-- section: concept | title: 용도 -->
## 4. 용도

{{code: uses}}

<!-- section: must_know -->
## 반드시 기억할 것

- 임베딩 = 의미를 담은 **부동소수 벡터**. 거리가 가까우면 의미가 가깝다.
- 유사도는 **코사인**(정규화 시 내적). 클수록 유사.
- 의미 검색: 문서 **미리 임베딩** → 쿼리 임베딩 → 유사도 상위 K개.
- 검색용/문서용 임베딩을 **구분**하면 품질↑.
- 차원은 모델마다 다름. 규모가 크면 **전수 비교 대신 벡터 인덱스/DB**.
- 임베딩 제공자는 골라 쓰되 **인터페이스로 감싸** 벤더 종속을 피한다.
- 임베딩 모델과 생성(LLM) 모델은 별개 — 섞지 않는다.

<!-- section: experiment -->
## 직접 해 보기

1. 문장 5쌍(의미 유사 / 무관)을 임베딩해 코사인 유사도를 출력하고 예상과 맞는지 보라.
2. FAQ 10개를 미리 임베딩해 두고, 표현이 다른 질문으로 `semanticSearch` 가 맞는 FAQ를 찾는지 확인하라.
3. 쿼리/문서 임베딩을 구분한 경우와 안 한 경우의 상위 결과를 비교하라.
4. 벡터를 정규화한 뒤 내적만으로 랭킹이 같은지 확인하라.
5. 문서를 1000개로 늘려 전수 비교의 응답 시간을 재고, "여기서 벡터 DB가 필요하다" 는 지점을 체감하라.

<!-- section: check_question -->
## 이해 점검

1. 임베딩이 무엇이고, 왜 키워드가 안 겹쳐도 검색이 되나?
2. 코사인 유사도는 무엇을 재나? 정규화하면 왜 내적으로 충분한가?
3. 의미 검색에서 문서 임베딩은 언제 만드나?
4. 쿼리/문서 임베딩을 구분하는 이유는?
5. 문서가 아주 많아지면 무엇이 필요한가?

<!-- section: interview_question -->
## 면접 대비

- "임베딩 기반 의미 검색의 원리와, 키워드 검색 대비 장단점은?"
- "코사인 유사도와 유클리드 거리, 내적의 관계는?"
- "임베딩 모델을 교체할 때 고려할 점은? (재임베딩)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 임베딩=의미 벡터(거리=의미 유사), 코사인(정규화 시 내적), 의미 검색(문서 미리 임베딩→쿼리→상위 K),
> 쿼리/문서 구분, 규모 크면 벡터 DB를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**임베딩은 텍스트의 의미를 부동소수 벡터로 바꿔, 코사인 유사도(정규화 시 내적)로 "의미가 가까운지"를
재게 한다 — 문서를 미리 임베딩해 두고 쿼리 임베딩과의 유사도 상위 K개를 뽑는 게 의미 검색이며,
규모가 커지면 벡터 인덱스/DB가 필요하다.**
