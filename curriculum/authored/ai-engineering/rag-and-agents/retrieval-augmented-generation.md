---
id: ai-engineering/rag-and-agents/retrieval-augmented-generation
chapter: ai-engineering/rag-and-agents
title: RAG가 필요한 이유와 기본 흐름
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [ai, rag, retrieval, chunking, grounding, citation]
related_material_ids: []
sources:
  - title: "Retrieval"
    url: https://developers.openai.com/api/docs/guides/retrieval
    publisher: "OpenAI"
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Simple RAG (Zephyr + LangChain) cookbook"
    url: https://huggingface.co/learn/cookbook/rag_zephyr_langchain
    publisher: "Hugging Face"
    checked_at: 2026-09-06
    source_type: course_material
  - title: "Introducing Contextual Retrieval"
    url: https://www.anthropic.com/news/contextual-retrieval
    publisher: "Anthropic"
    checked_at: 2026-09-06
    source_type: official_guide
prerequisites:
  - ai-engineering/rag-and-agents/embeddings-and-semantic-search
code_examples:
  - slug: pipeline
    title: RAG 파이프라인 (수집 → 생성)
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      [준비, 오프라인]
        문서 로드 → 청킹(검색 단위로 쪼갬) → 임베딩 → 벡터 저장(색인)

      [질의, 런타임]
        사용자 질문 → 질문 임베딩 → 의미 검색(상위 K 청크)
          → 컨텍스트 구성(청크들을 프롬프트에 삽입) → LLM 생성(그 근거로 답 + 인용)

      같은 모델이라도 관련 문서를 컨텍스트로 받으면 답이 확연히 좋아진다.
  - slug: prompt
    title: 검색 결과를 프롬프트에 넣기
    source_type: generated_minimal
    language: js
    code: |
      const hits = await semanticSearch(question, 4);         // [{ text, score, sourceId }]
      const context = hits.map((h, i) => `[${i + 1}] ${h.text}`).join("\n\n");

      const messages = [
        { role: "system", content:
          "아래 <context> 안의 내용만 근거로 답하라. 근거가 없으면 '모른다'고 답하라. 출처 번호를 [n] 으로 표기하라." },
        { role: "user", content: `<context>\n${context}\n</context>\n\n질문: ${question}` },
      ];
      // grounding: 답을 실제 청크에 근거하게 + 어느 청크에서 왔는지 인용
  - slug: chunking
    title: 청킹 — 크기가 품질을 좌우한다
    source_type: generated_minimal
    language: text
    code: |
      문서를 수백 토큰 단위로 쪼개고, 겹침(overlap)을 둬 경계에서 문맥이 잘리는 걸 완화.
        (예시 기본값 — 규칙 아님: 청크 ~800 토큰, 겹침 ~400 토큰. 데이터에 맞게 조정)
      너무 크면: 검색 정밀도↓, 컨텍스트 낭비
      너무 작으면: 청크가 자체 문맥을 잃음 (대명사·기준 시점·주체가 사라짐)
  - slug: when
    title: RAG가 필요한 경우 / 아닌 경우
    source_type: generated_minimal
    language: text
    code: |
      RAG 필요:  지식 베이스가 프롬프트 한 번에 안 들어갈 만큼 큼 / 자주 갱신됨(사내 문서·상품 DB)
      RAG 불필요: 지식이 작으면 그냥 컨텍스트에 다 넣는 게 낫다 (검색 실패 위험 없음)
      fine-tuning 대비 RAG 장점: 임베딩만 갱신하면 됨(싸고 빠름), 모델 교체 시 재학습 불필요
  - slug: failure
    title: 대표 실패 모드
    source_type: generated_minimal
    language: text
    code: |
      1) 청크가 문맥 손실 → 검색이 엉뚱한 걸 가져옴
      2) 검색 실패 → 관련 청크가 상위 K 밖 → 모델이 근거 없이 지어냄(환각)
      3) 근거는 왔는데 모델이 무시하고 자기 지식으로 답
      완화: 하이브리드 검색(BM25 + 임베딩), 리랭킹, "근거 없으면 모른다" 지시, 인용 강제
      (자세한 심화·하이브리드 검색은 Contextual Retrieval 소스 참고)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **RAG(검색 증강 생성)** 파이프라인을 단계로 그린다: 수집 → 청킹 → 임베딩 → 저장 → 검색 → 컨텍스트 구성 → 생성.
- 검색된 청크를 프롬프트에 넣어 **grounding + 인용** 하는 법을 안다.
- **청킹 크기**가 품질을 좌우한다는 것과, 너무 크거나 작을 때의 문제를 안다.
- **RAG가 필요한 경우 / 아닌 경우**와 fine-tuning 대비 장점을 판단한다.
- 대표 **실패 모드**(청크 문맥 손실, 검색 실패, 근거 무시)를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 임베딩·코사인 유사도·의미 검색(앞 Lesson), LLM 컨텍스트 윈도.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

LLM은 학습 컷오프 이후를 모르고, 사내 문서·상품 DB 같은 **비공개 지식**도 없다. 그 지식을 전부
프롬프트에 넣기엔 너무 크다. **RAG**는 질문과 관련된 조각만 검색해 컨텍스트에 넣어 답하게 한다.

<!-- section: concept -->
## 1. 파이프라인

{{code: pipeline}}

- **오프라인(준비)**: 문서를 청킹 → 임베딩 → 벡터 저장(색인).
- **런타임(질의)**: 질문 임베딩 → 의미 검색(상위 K) → 검색된 청크를 프롬프트에 삽입 → 생성.
- 핵심 통찰: **같은 모델이라도 관련 문서를 컨텍스트로 받으면 답이 확연히 좋아진다.**

<!-- section: mechanism -->
## 2. 컨텍스트 구성 + grounding

{{code: prompt}}

- 검색된 청크를 번호와 함께 프롬프트에 넣고, **"이 안의 내용만 근거로, 없으면 모른다고, 출처 [n] 표기"**
  를 지시한다.
- **grounding** = 답을 실제 청크에 근거하게 만드는 것. **인용** = 어느 청크에서 왔는지 표시.
  이게 "RAG가 환각을 줄인다"의 실체이자 검증 가능성의 핵심이다.

<!-- section: concept | title: 청킹 -->
## 3. 청킹

{{code: chunking}}

RAG 품질을 가장 크게 좌우하는 전처리 선택이다. 겹침을 둬서 경계 문맥 손실을 완화한다.
(구체 숫자는 제공자 기본값 예시일 뿐 — 데이터에 맞게 조정.)

<!-- section: concept | title: 판단 -->
## 4. 언제 쓰나 · 실패 모드

{{code: when}}

{{code: failure}}

<!-- section: must_know -->
## 반드시 기억할 것

- RAG = **수집 → 청킹 → 임베딩 → 저장 → 검색(상위 K) → 컨텍스트 구성 → 생성**.
- 프롬프트에 검색 청크 삽입 + **"근거 안에서만, 없으면 모른다, 출처 [n]"** → grounding + 인용.
- **청킹 크기**: 크면 정밀도↓, 작으면 문맥 손실. 겹침으로 완화. 숫자는 조정 대상.
- RAG 필요: 지식이 크거나 자주 갱신. 작으면 그냥 컨텍스트에 다 넣기.
- fine-tuning 대비: 임베딩만 갱신(싸고 빠름), 모델 교체에 재학습 불필요.
- 실패 모드: 청크 문맥 손실 / 검색 실패 → 환각 / 근거 무시. 완화는 하이브리드 검색·리랭킹·인용 강제.
- 벡터 저장은 규모에 따라 라이브러리~벡터 DB(예: Supabase Vector/pgvector) — 개념은 동일.

<!-- section: experiment -->
## 직접 해 보기

1. 문서 3~5개를 청킹·임베딩해 저장하고, 질문에 대해 상위 4 청크를 컨텍스트로 넣어 답을 생성하라.
2. 같은 질문을 RAG 없이(모델 지식만)도 물어 답 품질을 비교하라.
3. 청크 크기를 아주 크게 / 아주 작게 바꿔 검색 결과와 답이 어떻게 나빠지는지 관찰하라.
4. 지식 베이스에 없는 질문을 던져 모델이 "모른다"고 하는지, 아니면 지어내는지 보고 프롬프트를 강화하라.
5. 답에 `[n]` 인용을 붙이게 하고, 그 청크를 실제로 확인해 grounding이 맞는지 검증하라.

<!-- section: check_question -->
## 이해 점검

1. RAG 파이프라인 7단계를 순서대로 말하면?
2. grounding과 인용은 각각 무엇인가? 왜 환각을 줄이나?
3. 청크가 너무 작으면 어떤 문제가 생기나?
4. RAG가 필요 없는 경우의 예는?
5. "검색은 됐는데 답이 근거를 무시한다" — 어떻게 완화하나?

<!-- section: interview_question -->
## 면접 대비

- "RAG 파이프라인을 단계별로 설명하고, 각 단계의 실패 모드를 말해 보세요."
- "RAG와 fine-tuning의 트레이드오프는?"
- "RAG의 답이 근거에 충실한지(grounded) 어떻게 검증하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 파이프라인 7단계, 컨텍스트 삽입 + "근거만·없으면 모른다·출처[n]", 청킹 크기 트레이드오프,
> RAG 필요/불필요, 실패 모드 3종 + 완화를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**RAG는 문서를 청킹·임베딩·저장해 두고, 질문과 의미가 가까운 상위 K 청크를 검색해 프롬프트에 넣어
"근거 안에서만, 출처를 달아" 답하게 한다 — 청킹 크기가 품질을 좌우하고, 검색 실패·문맥 손실이
환각으로 이어지므로 하이브리드 검색·리랭킹·인용 강제로 완화한다.**
