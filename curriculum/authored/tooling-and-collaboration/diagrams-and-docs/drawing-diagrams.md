---
id: tooling-and-collaboration/diagrams-and-docs/drawing-diagrams
chapter: tooling-and-collaboration/diagrams-and-docs
title: 흐름도·구조도 그리기
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [diagrams, documentation, mermaid]
related_material_ids:
  - 1RpLWa3bKzu7-osltdYZob9R9OQvXPxohRUAFxXZ9WXs   # 다이어그램 그리기
prerequisites:
  - tooling-and-collaboration/github-workflow/writing-a-readme
code_examples:
  - slug: mermaid-flowchart
    title: Mermaid 순서도 (README에 그대로 렌더됨)
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      ```mermaid
      flowchart TD
        A[방문] --> B{로그인?}
        B -->|아니오| C[로그인 페이지]
        B -->|예| D[대시보드]
        C --> E[인증]
        E --> D
      ```
      %% TD=Top-Down, LR=Left-Right
      %% A[..]=사각형  B{..}=마름모(분기)  C(..)=둥근모서리  D[(..)]=DB
      %% -->|라벨| 로 분기 설명. 결정 노드에서 나가는 엣지엔 항상 라벨.
  - slug: mermaid-gantt
    title: Mermaid 간트 차트 (일정/마일스톤)
    source_type: generated_minimal
    language: text
    code: |
      ```mermaid
      gantt
        title 프로젝트 일정
        dateFormat YYYY-MM-DD
        excludes weekends
        section 기획
        요구사항·IA 정리 :a1, 2026-09-01, 3d
        와이어프레임     :a2, after a1, 3d
        section 구현
        스키마·API      :b1, 2026-09-08, 4d
        화면 구현       :b2, after b1, 6d
      ```
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 왜 다이어그램을 남기는지(말·글로 설명하기 어려운 **흐름·구조**를 한눈에), 언제 쓰는지 안다.
- **Mermaid** 문법으로 순서도(flowchart)와 간트 차트를 **읽고 간단히 쓸 수 있다.**
- Mermaid 코드를 README/문서에 넣어 그대로 그림으로 렌더시키는 법을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Markdown 코드펜스(``` ``` ```) 사용법. (→ `github-workflow/writing-a-readme`)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"로그인하면 대시보드로 가고, 안 했으면 로그인 페이지로 갔다가 인증 후 대시보드로..." — 이걸
글로만 쓰면 팀원마다 다르게 이해한다. 화면 흐름, 데이터 흐름, 폴더 구조, 일정은
**그림 한 장**이 문단 열 개보다 빠르다.

<!-- section: concept -->
## Mermaid — 텍스트로 그리는 다이어그램

Mermaid 는 **코드로 다이어그램을 쓰면 그림으로 렌더**해 주는 문법이다.
GitHub README, Notion, VS Code(확장), <https://mermaid.live> 에서 바로 렌더된다.
그림 파일이 아니라 **텍스트**라서 Git 으로 diff·리뷰가 되고 수정이 쉽다.

### 순서도 핵심

- 첫 줄: `flowchart TD` (방향: `TD` 위→아래, `LR` 왼→오른쪽)
- **노드**: `A[사각형]` · `B(둥근모서리)` · `C{마름모=분기}` · `D((원))` · `E[(실린더=DB)]`
  - `A` 는 연결에 쓰는 **ID**, `[]` 안이 화면에 보이는 **라벨**.
- **엣지**: `A --> B`(실선 화살표) · `A --- B`(화살표 없음) · `A -.-> B`(점선) · `A ==> B`(굵게)
  - `A -->|설명| B` 로 연결선에 라벨. **분기 노드에서 나가는 엣지엔 항상 라벨**(예/아니오).

{{code: mermaid-flowchart}}

<!-- section: concept | title: 간트 차트 -->
## 간트 차트 — 일정/마일스톤

`gantt` 로 시작. `section` 으로 단계를 묶고, 각 작업은 `이름 :id, 시작일, 기간(3d)` 또는
`이름 :id, after 이전id, 기간`. `excludes weekends` 로 주말 제외.

{{code: mermaid-gantt}}

<!-- section: must_know -->
## 반드시 기억할 것

- README 에 넣을 땐 코드펜스를 ` ```mermaid ` 로 정확히 열고 **앞뒤로 빈 줄**.
- 노드 ID 는 공백 없이 영문/숫자로 유일하게. 라벨은 `[]`/`()`/`{}` 안.
- 분기(`{}`)에서 나가는 화살표는 라벨(Yes/No, 성공/실패)을 꼭 단다.
- 큰 그림은 `subgraph 이름 ... end` 로 블록을 묶어 가독성 확보.
- 세부 UI 목업이 아니라 **흐름·구조·일정**용. 픽셀 단위 디자인은 Figma.

<!-- section: experiment -->
## 직접 해 보기

1. <https://mermaid.live> 에서 `mermaid-flowchart` 를 붙여 넣고, `TD` 를 `LR` 로 바꿔 렌더 차이를 보라.
2. "카트 담기 → 로그인 여부 확인 → (비로그인) 로그인 → 결제 → 완료" 흐름을 순서도로 그려라.
   분기에는 라벨을 달아라.
3. 위 순서도를 저장소 README 에 ` ```mermaid ` 코드펜스로 넣고, GitHub 에서 그림으로 렌더되는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. Mermaid 를 이미지 파일 대신 쓰면 좋은 점 2가지는?
2. `A{로그인?}` 와 `A[로그인]` 의 차이는?
3. 분기 노드에서 나가는 엣지에 라벨을 꼭 다는 이유는?

<!-- section: review -->
## 한 줄 정리

**Mermaid 는 텍스트로 쓰는 다이어그램이다 — `flowchart`/`gantt` 로 흐름·구조·일정을 그리고,
README 코드펜스에 넣으면 그대로 그림으로 렌더된다. 텍스트라서 diff·수정이 쉽다.**

<!-- section: next -->
## 다음 Lesson

`editor-setup/vscode-setup` — 매일 쓰는 에디터를 손에 맞게.
