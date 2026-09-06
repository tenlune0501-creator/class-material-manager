# curriculum/ — 학습 커리큘럼 Source of Truth

이 디렉터리는 CMM(Class Material Manager)의 **학습 커리큘럼 원본**이다.
DB(Schema v2.1)의 `learning_tracks` / `learning_chapters` / `learning_lessons` /
`lesson_sections` / `lesson_code_examples` / `lesson_problem` 은 **여기서 파생**되며,
반대 방향(=DB를 직접 고쳐 커리큘럼을 바꾸는 것)은 하지 않는다.

향후 `sync-curriculum` CLI(별도 파이프라인, upsert-only)가 이 파일들을 읽어 위 6개
테이블에 반영한다. 기존 `refresh` / `ci-refresh` / `sync-runner` / `verify` 파이프라인과는
분리된다 (`project_examples` 가 별도 CLI로 분리돼 있는 것과 같은 격리 원칙).

---

## 1. 디렉터리 구조

```
curriculum/
  README.md              ← 이 파일 (규격)
  tracks.yaml            ← 모든 Track + 그 안의 Chapter 목록 (순서 포함)
  lessons/
    <track-id>.yaml      ← 해당 Track 의 모든 Lesson 메타데이터 (= 골격)
  authored/
    <track-id>/<chapter-slug>/<lesson-slug>.md
                         ← 실제로 집필된 Lesson 본문 (Markdown + frontmatter).
                            골격 단계에서는 대표 Lesson 1개만 존재한다.
```

- **골격(skeleton)** = `tracks.yaml` + `lessons/*.yaml`. 모든 Track·Chapter·Lesson 의
  메타데이터가 여기 다 있다.
- **집필본(authored)** = `authored/**/*.md`. Lesson 하나가 완성될 때마다 파일이 하나 생긴다.
  `lessons/*.yaml` 의 해당 항목 `status` 가 `authored` 로 바뀌고 `body_path` 가 채워진다.

이 분리가 핵심이다. 393개 자료를 393개 파일로 만들지 않는다. Lesson 은 **개념 단위**이고,
관련 자료 여러 개를 `related_material_ids` 로 묶는다.

---

## 2. ID 규칙 (사람이 읽을 수 있고, 안정적이어야 함)

| 대상 | 형식 | 예 |
|---|---|---|
| Track | `<track-slug>` | `react` |
| Chapter | `<track-slug>/<chapter-slug>` | `react/state-and-events` |
| Lesson | `<track-slug>/<chapter-slug>/<lesson-slug>` | `react/state-and-events/usestate-basics` |
| Project | `<project-slug>` | `momentalk` |
| Project Unit | `<project-slug>/<unit-slug>` | `momentalk/chosung-quiz-state-machine` |

- slug 는 kebab-case, ASCII 소문자/숫자/하이픈만. 한글 금지 (URL·파일경로 안정성).
- Lesson id 의 앞 2개 세그먼트는 그 Lesson 이 속한 Chapter id 와 **정확히 일치**해야 한다.
- 한 번 부여한 id 는 바꾸지 않는다. 순서를 바꾸려면 id 가 아니라 `ord` 를 바꾼다.
- DB 파생 id(빌드 시 `sync-curriculum` 이 생성, 여기서 직접 쓰지 않음):
  - Section: `<lesson-id>#<section_type>-<ord>`
  - Code example: `<lesson-id>#<example-slug>`

---

## 3. `tracks.yaml` 규격

```yaml
tracks:
  - id: react
    title: React
    summary: 컴포넌트·상태·훅으로 화면을 만든다.
    kind: curriculum          # curriculum | coding_test   (DB learning_tracks.kind)
    ord: 30
    status: active            # active | needs_external_research
    chapters:
      - id: react/state-and-events
        title: 상태와 이벤트
        summary: useState 로 변하는 값을 관리하고 이벤트로 바꾼다.
        ord: 30
        status: active        # active | needs_external_research
```

- `ord` 는 Track 끼리, Chapter 는 같은 Track 안에서만 비교된다. 10 단위로 띄워 둔다.
- `kind: coding_test` 인 Track 은 코딩테스트 트랙이다(현재는 골격만, 자료 없음).

---

## 4. `lessons/<track-id>.yaml` 규격

```yaml
lessons:
  - id: react/state-and-events/usestate-basics
    chapter: react/state-and-events
    title: useState 로 상태 관리 시작하기
    mastery: required          # understand | required | practical  (DB learning_lessons.mastery)
    lesson_kind: lesson        # lesson | problem                   (DB learning_lessons.lesson_kind)
    estimated_minutes: 40
    ord: 10
    status: skeleton           # skeleton | draft | authored | needs_external_research
    tags: [react, state, useState, hooks]
    related_material_ids:      # material_metadata.source_id (전체 Google Docs ID) 로의 loose ref
      - 1z5idwIpcnePvJWVwa_PmoJZgp1r52fzh6oa-g3Xuscg
      - 1Ps3Gdi8rQLekmWM55h5bHc5AMJQlLOv4oQO5EljLRZI
    sources:                   # 보조 근거 문서. 선택. 두 형태 중 하나 (§4.1).
      - reference_slug: react/useState
    project_links:             # 이 Lesson 이 실제로 쓰이는 Project Unit
      - unit: momentalk/chosung-quiz-state-machine
        note: step 상태 하나로 화면 단계를 전환하는 실제 예
    prerequisites:             # 선행 Lesson id. 선택. (DB 컬럼 아님 — 저작·정렬 보조용)
      - react/components-and-props/passing-props
    body_path: authored/react/state-and-events/usestate-basics.md
                              # status: authored 일 때만. 상대경로(curriculum/ 기준).
```

### mastery 의미

| 값 | 뜻 (학습자가 실제로 할 수 있어야 하는 행동) |
|---|---|
| `understand` | 설명을 이해하고, 코드를 **보고 역할을 설명**할 수 있음. 손으로 다 못 짜도 됨. |
| `required` | 빈 화면에서 **기본 형태를 직접 구현**할 수 있음. 실무 기본기. |
| `practical` | 실제 프로젝트에서 **응용·설계·디버깅**할 수 있음. 보통 미니프로젝트. |

- **mastery 는 기술 이름이나 체감 난이도가 아니라 "그 Lesson 이 실제로 요구하는 행동"으로 정한다.**
  ("Node.js 서버"라서 어렵다 → understand, 가 아니다.)
- **정합성**: `goal` / `mission` / `check_question` 이 요구하는 행동 수준이 `mastery` 와 모순되면
  안 된다. 예: `goal` 은 "이해"인데 `mission` 이 빈 화면 CRUD 전체 구현이면, `mastery` 를 올리거나
  `mission` 을 줄여 맞춘다.

### estimated_minutes 의미

단순 본문 읽기 시간이 **아니다.** GPT 와의 **과외식 학습 세션** — 설명 + 질문·토론 + 코드 읽기
+ **핵심 실습** + 이해 점검 — 까지 포함한 예상 시간이다. 대형 `mission` 전체 완료 시간은
여기 다 들어갈 필요 없다(별도 과제 성격).

### status 의미

| 값 | 뜻 |
|---|---|
| `skeleton` | 메타데이터만 있음. 본문 미집필. 관련 자료는 실제로 존재함. |
| `draft` | 본문 집필 중. |
| `authored` | 본문 완성. `body_path` 존재. |
| `needs_external_research` | **기존 자료로 커버 불가.** 공식 문서 조사가 선행돼야 집필 가능. 지어내지 않는다. |

`needs_external_research` Lesson 은 `related_material_ids` 가 비어 있거나, 있어도
"주변 자료"일 뿐 그 개념 자체를 다루는 자료가 없다는 뜻이다.

**status 는 "CMM 이 그 개념의 수업자료를 가졌는가" 축이다. "외부 공식 문서로 지금
집필 가능한가" 는 별개 축**이며 `research/README.md` 의 챕터별 READY / PARTIAL /
NOT READY 판정이 그 축을 기록한다. 그래서 외부 조사가 끝난 뒤에도, 그 개념을 다루는
CMM 자료가 없으면 (아직 집필 전인 한) `status` 는 `needs_external_research` 로 둔다 —
집필되면 `authored` 로 바뀐다.

### 4.1 `sources[]` 두 형태

한 항목은 아래 둘 중 하나다. 한 Lesson 이 둘을 섞어 써도 된다.

1. **내부 reference 참조** (`data/references/**` → `reference_documents`):
   ```yaml
   - reference_slug: react/useState
   ```
2. **외부 공식 문서 참조** (research 로 검증한 1차 출처, `reference_documents` 미등재):
   ```yaml
   - title: "What is an image?"
     url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
     publisher: "Docker, Inc."
     checked_at: 2026-09-06
     source_type: official_docs   # official_docs | official_guide | course_material | community_reference
   ```
   외부 출처 본문을 장문 복제하지 않는다. Lesson 은 출처를 근거로 CMM 학습 목적에 맞게
   재구성한다. 향후 `data/references/<subject>/<slug>.md` 로 편입되면 형태 1 로 옮긴다
   (편입 방법은 `research/README.md` 참조).

---

## 5. 집필본 Lesson 파일 규격 (`authored/**/*.md`)

Markdown + YAML frontmatter. 프로젝트가 이미 `src/sync/frontmatter.ts` /
뷰어 `gray-matter` 로 frontmatter 를 파싱하므로 같은 방식.

### frontmatter

```yaml
---
id: react/state-and-events/usestate-basics
chapter: react/state-and-events
title: useState 로 상태 관리 시작하기
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [react, state, useState, hooks]
related_material_ids: [ ... ]
sources:
  - reference_slug: react/useState
project_links:
  - unit: momentalk/chosung-quiz-state-machine
    note: ...
code_examples:                # 이 Lesson 이 쓰는 코드 예제. 본문에서 {{code: <slug>}} 로 참조.
  - slug: counter-minimal
    title: 카운터 — 가장 작은 useState
    source_type: generated_minimal   # official_example | verified_oss | generated_minimal | user_project
    language: jsx
    is_canonical: true
    code: |
      import { useState } from "react";
      export default function Counter() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount((prev) => prev + 1)}>{count}</button>;
      }
  - slug: momentalk-step-state
    title: Momentalk 초성 퀴즈 — step 상태 머신
    source_type: user_project
    project_example_id: momentalk-chosung-quiz-state-machine   # project_examples.id loose ref
    language: jsx
---
```

`lessons/*.yaml` 의 같은 Lesson 항목과 겹치는 필드(id, chapter, title, mastery,
lesson_kind, estimated_minutes, tags, related_material_ids, sources, project_links)는
**frontmatter 가 정본**이다. `sync-curriculum` 은 frontmatter 를 우선한다.
(골격 단계에서는 아직 겹치는 파일이 대표 Lesson 1개뿐이므로 관리 부담 없음.)

### 본문 — 섹션 구분

본문은 HTML 주석으로 섹션을 나눈다. 파서가 이 주석으로 잘라 `lesson_sections` 로 만든다.

```
<!-- section: goal -->
## 이 Lesson 의 목표
...

<!-- section: concept | title: 상태란 무엇인가 -->
...

<!-- section: code | lang: jsx -->
{{code: counter-minimal}}

<!-- section: optional_deep_dive | optional -->
...
```

- 문법: `<!-- section: <type> [| title: <제목>] [| lang: <언어>] [| optional] -->`
- `type` 은 CHECK 제약이 없다(DB `lesson_sections.section_type` 은 자유 텍스트). 권장 어휘:

  | type | 용도 |
  |---|---|
  | `goal` | 이 Lesson 을 끝내면 할 수 있는 것 |
  | `prerequisite` | 선행 개념 요약 (다시 가르치지 않음, 짚고 넘어감) |
  | `dev_problem` | 이 개념이 없으면 겪는 실제 문제 상황 |
  | `concept` | 핵심 개념 설명 |
  | `mechanism` | 내부 동작 / 왜 그렇게 되는가 |
  | `code` | 코드 예제 (본문에서 `{{code: <slug>}}`) |
  | `code_breakdown` | 코드 줄별 해설 |
  | `experiment` | 직접 바꿔 보며 확인할 것 |
  | `must_know` | 반드시 외워야 하는 것 |
  | `delegatable` | AI/도구에 맡겨도 되는 것 (외울 필요 없는 것) |
  | `mission` | 직접 구현 과제 |
  | `project_link` | 실제 프로젝트에서 이 개념이 쓰인 곳 |
  | `interview_question` | 면접 대비 질문 |
  | `check_question` | 이해 점검 질문 |
  | `digest_prompt` | 복습용 요약 프롬프트 |
  | `review` | 한 줄 총정리 |

- `{{code: <slug>}}` 한 줄은 frontmatter `code_examples[].slug` 와 매칭돼 그 자리에
  코드 블록으로 치환된다. `source_type: user_project` 이고 `project_example_id` 만 있으면
  `sync-curriculum` 이 `project_examples` 에서 코드를 가져온다.

### 집필 원칙 (authored Lesson 공통)

위 섹션 어휘는 도구일 뿐이고, 아래가 실제 규칙이다. 모든 Lesson 에 기계적으로 강제하진 않되
해당 Lesson 에 의미가 있으면 지킨다.

1. **질문 중심.** 정의 암기만 시키지 않는다. 가능하면 — 왜 필요한가 / 이게 없으면 / 언제 쓰나 /
   다른 방법은 / framework·library 는 무엇을 대신하나 / 실제 프로젝트 어디에 쓰이나 — 중
   그 Lesson 에 의미 있는 질문을 본문·`check_question`·`interview_question` 에 넣는다.
2. **기존 자료 → 원리 → 최소 구현 → framework 가 대신하는 것 → 기존 코드 재해석.**
   `related_material_ids` 나 `project_links` 로 붙는 기존 코드/문제가 있으면 이 흐름을 먼저 검토한다
   (강제는 아님).
3. **`generated_minimal` 코드가 production concern 을 생략하면 그 사실을 명시한다** — validation
   생략 / error handling 단순화 / security 단순화 / size·rate limit 생략 / persistence 생략 등.
   단 **오해 가능성이 실제로 있을 때만**. 매 예제마다 경고문을 붙이지 않는다.
   production-ready 구현으로 확장하지 않는다(그건 후속 Lesson).
4. **운영/보안 단순화 경계.** CORS·Auth·권한·입력검증·secret·error handling 에서 교육용 단순
   설정을 쓰면 "이것이 운영 환경의 완전한 해결책은 아니다"를 **필요한 만큼만** 명시하고,
   Lesson 범위를 벗어나는 운영 내용은 과도하게 확장하지 말고 후속 Lesson 으로 연결한다.

---

## 6. DB Schema v2.1 로의 결정적 매핑

`sync-curriculum` 이 수행할 매핑(이번 단계에서 구현하지 않음, 계약만 고정):

| Source of Truth | → DB 테이블 | 비고 |
|---|---|---|
| `tracks.yaml` 각 track | `learning_tracks` | id, title, summary, kind, ord. `content_hash` = 그 항목 정규화 직렬화의 sha256 |
| `tracks.yaml` 각 chapter | `learning_chapters` | id, track_id(=id 앞 1세그먼트), title, summary, ord |
| `lessons/*.yaml` 각 lesson | `learning_lessons` | id, chapter_id(=id 앞 2세그먼트), title, mastery, lesson_kind, summary(=frontmatter 없으면 goal 섹션 첫 문단), estimated_minutes, tags, sources, related_material_ids, ord |
| frontmatter `code_examples[]` | `lesson_code_examples` | id=`<lesson-id>#<slug>`. `source_type != user_project` → `code` 필수. `user_project` → `project_example_id` 또는 `code` 중 하나 |
| 본문 `<!-- section: -->` 블록 | `lesson_sections` | id=`<lesson-id>#<type>-<ord>`, ord=본문 등장 순서(0부터), is_optional=`optional` 플래그, code_example_ids=블록 안 `{{code:}}` 들 |
| `lesson_kind: problem` 인 lesson 의 추가 필드 | `lesson_problem` | statement/constraints/hints/solutions/test_cases 등. 별도 frontmatter 키 `problem:` 로 표현 (코딩테스트 트랙에서 정의 예정) |
| `project_links[]` | `lesson_project_links` | (lesson_id, unit_id). 양방향 검증은 `project-learning/projects.yaml` 의 `related_lessons` 와 대조 |

`content_hash` 는 전부 `sync-curriculum` 이 계산한다. Source of Truth 에는 쓰지 않는다.

---

## 7. 이번 골격에 포함되지 않은 것 (의도적)

- Lesson 본문(대표 1개 제외) — 다음 단계에서 배치로 집필.
- `needs_external_research` 로 표시된 영역(Node.js 서버, 실제 관계형 DB 운영, Docker/컨테이너,
  LLM 앱/RAG/에이전트/평가, 코딩테스트 문제) — 자료가 없어 지어내지 않음. 승인된 조사 단계에서 채움.
- DB 반영(`sync-curriculum` 구현·실행), 뷰어 변경, `USE_CMM_FOR_STUDY.md`.
