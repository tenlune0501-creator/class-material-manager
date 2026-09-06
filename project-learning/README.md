# project-learning/ — 실전 프로젝트 학습 Source of Truth

커리큘럼(`curriculum/`)이 **개념**을 가르친다면, 여기는 **실제로 접근 가능한 프로젝트의
진짜 코드**를 학습 단위로 쪼갠 것이다. "이 개념이 실무 코드에서 어떻게 조립되는가"를 본다.

DB(Schema v2.1)의 `learning_projects` / `project_learning_units` /
`project_unit_sections` / `project_unit_examples` / `lesson_project_links` 가 여기서 파생된다.
향후 `sync-curriculum` CLI가 함께 처리한다(커리큘럼과 같은 격리 파이프라인).

---

## 1. 디렉터리 구조

```
project-learning/
  README.md
  projects.yaml           ← 모든 Project + 그 안의 Unit 목록 (순서 포함) = 골격
  authored/
    <project-id>/<unit-slug>.md    ← 집필된 Unit 본문. 골격 단계에서는 0개.
```

Unit 본문 파일 규격은 `curriculum/authored/**/*.md`(README §5)와 **동일**하다.
차이는 frontmatter의 `chapter` 대신 `project`가 들어가고, section 어휘에
`data_model` / `infra` 관점이 더 쓰인다는 정도.

---

## 2. 대상 프로젝트 (실제 코드로 검증 가능한 것만)

| project id | 무엇 | 코드 위치 | 검증 |
|---|---|---|---|
| `momentalk` | 오르미 FE 13기 3차 팀 프로젝트(TEAM MOSAIC). React + Next.js App Router + MUI + Supabase | 외부 저장소 `minho0391/est-fe-3rd-project`, 고정 커밋 `004b4e856f95892d44759b8936e1e797c7216dc9` | 이미 `project_examples` 11행으로 발췌·수집됨 (`project-examples/momentalk.json`). Unit 은 그 11개 예제를 그대로 감싼다 |
| `class-material-manager` | 이 저장소 자체. TypeScript/Node 데이터 파이프라인 + Next.js 16 뷰어 + Supabase 인증·DB | 이 저장소 `src/`, `viewer/` | 코드 직접 확인. `PROJECT_CONTEXT.md`에 구현 사실 기록됨 |

### 포함하지 않은 접근 가능 프로젝트 (판단 근거)

- `Tenlune` — WordPress 테마/사이트(`wp-content/`, 빌드 산출물). JS 프레임워크 코드베이스가
  아니라 이 프론트엔드 커리큘럼의 RE 단위로 부적합.
- `tenlune-marketing-agent` / `tenlune-operations-agent` / `tenlune-instagram-creative` —
  Node/TS 백엔드 에이전트. 프론트엔드 학습 흐름과 접점이 적어 이번 골격에서 제외
  (TypeScript 트랙 심화 시 재검토 가능).

**없는 프로젝트를 만들어 넣지 않는다.** 위 2개 외에는 이번 단계에서 Unit 을 만들지 않는다.

---

## 3. `projects.yaml` 규격

```yaml
projects:
  - id: momentalk
    title: Momentalk
    summary: ...
    repo_url: https://github.com/minho0391/est-fe-3rd-project
    repo_ref: 004b4e856f95892d44759b8936e1e797c7216dc9
    stack: [react, nextjs, mui, supabase]
    ord: 10
    units:
      - id: momentalk/chosung-quiz-state-machine
        title: 초성 퀴즈 — step 상태 머신
        unit_kind: component        # overview | feature | component | hook | data_model | infra
        feature_area: 미니게임
        summary: ...
        concepts: [useState, 조건부 렌더링, ...]
        related_material_ids: [ ... ]        # material_metadata.source_id loose ref
        example_ids: [momentalk-chosung-quiz-state-machine]   # project_examples.id loose ref
        ord: 10
```

- `example_ids` → `project_unit_examples` (composite key `(unit_id, example_id)`).
  `example_id` 는 기존 `project_examples.id` 로의 **loose reference**(FK 아님).
- `class-material-manager` Unit 은 아직 `project_examples` 에 발췌가 없으므로 `example_ids: []`.
  집필 시 그 Unit 의 `authored/*.md` frontmatter `code_examples[]` 에
  `source_type: user_project` + `code:`(원문 발췌) 로 직접 넣거나, 별도로
  `project_examples` 수집 파이프라인에 `class-material-manager` source 를 추가한다(후속 과제).

---

## 4. Lesson ↔ Project Unit 연결

연결의 **정본은 `curriculum/lessons/*.yaml`(및 집필본 frontmatter)의 `project_links`** 다.
`projects.yaml` 에는 역방향(`related_lessons`)을 두지 않는다 — drift 방지.
`lesson_project_links` 테이블은 전적으로 lesson 쪽 `project_links` 에서 생성된다.

검증(`curriculum/`의 임시 validation 스크립트):
- 모든 `lesson.project_links[].unit` 은 `projects.yaml` 에 존재하는 Unit id 여야 한다.
- 반대(모든 Unit 이 최소 1개 Lesson 에 연결)는 **강제하지 않는다** — 아직 Lesson 이 골격뿐이라
  연결이 붙지 않은 Unit 이 정상적으로 존재한다.

---

## 5. 이번 골격에 포함되지 않은 것

- 모든 Unit 본문 — 다음 단계에서 대표 Lesson 집필과 함께 배치로.
- `class-material-manager` 코드 발췌의 `project_examples` 수집.
- DB 반영, 뷰어 변경.
