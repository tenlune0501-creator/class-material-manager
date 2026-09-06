---
id: tooling-and-collaboration/github-workflow/github-desktop
chapter: tooling-and-collaboration/github-workflow
title: GitHub Desktop로 원격 저장소 다루기
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [github, github-desktop, remote]
related_material_ids:
  - 2PACX-1vQncLWg0uERomqED1z0Yol6iCD0srwRU9T5SDXM8t9F1g0jj5zTk2-Exf0Rbd4RiRSqOYr16tHiG6WV   # github 사용법-desktop_v2
prerequisites:
  - tooling-and-collaboration/git-basics/branches-merge
code_examples:
  - slug: cli-equivalents
    title: GUI 버튼 ↔ CLI 명령 대응
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      # GitHub Desktop 버튼        # 같은 일을 CLI 로
      # File > Clone repository     git clone <url>
      # (변경 목록 체크 + Commit)   git add . && git commit -m "..."
      # Push origin                 git push
      # Fetch origin                git fetch
      # Pull origin                 git pull
      # Branch > New branch         git checkout -b <name>
      # Branch > Merge into current git merge <branch>
      # History 탭                  git log
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- GitHub Desktop 의 주요 버튼(Clone / Commit / Push / Fetch / Pull / Branch / History)이
  각각 어떤 **CLI 명령과 같은 일**을 하는지 안다.
- 새 원격 저장소를 만들고 → 로컬에 clone → 커밋 → push → 팀원 변경 pull 하는 흐름을 GUI로 수행할 수 있다.
- GUI 로 하든 CLI 로 하든 **밑에서 일어나는 일은 같다**는 것을 설명할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Git 개념: 로컬/원격 저장소, add/commit/push/pull, 브랜치. (→ `git-basics/*`)
- GitHub 계정.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

CLI 는 강력하지만, 변경 내용을 **눈으로 확인**하거나 충돌을 파일별로 훑기엔 GUI 가 빠르다.
반대로 GUI 만 쓰면 "이 버튼이 정확히 뭘 하는지" 몰라서, CLI 로만 되는 상황(서버, CI, 스크립트)에서 막힌다.
→ **둘을 대응시켜** 이해하면 어느 쪽이든 쓸 수 있다.

<!-- section: concept -->
## GitHub Desktop = git + GitHub 를 감싼 GUI

- **Clone** — GitHub 의 저장소를 내 PC로 복사(`git clone`). 로그인(File > Options > Accounts)이 선행.
- **변경 목록 + Commit** — 왼쪽에 바뀐 파일이 뜬다. 체크 → 아래에 제목/설명 입력 → `Commit to <branch>`
  (`git add` 선택 + `git commit`).
- **Push origin / Fetch origin / Pull origin** — 상단 버튼. 각각 `git push` / `git fetch` / `git pull`.
  Fetch 후 "원격에 N개 커밋" 이 뜨면 Pull.
- **Current Branch (좌상단)** — 브랜치 전환·생성. `Branch > New branch` = `git checkout -b`.
  `Branch > Merge into current branch` = `git merge`.
- **History 탭** — 커밋 목록과 각 커밋의 변경(diff). `git log` + `git show`.

{{code: cli-equivalents}}

<!-- section: mechanism -->
## 표준 흐름 (GUI)

1. GitHub 웹에서 `New repository` → 생성 → `Set up in Desktop` (또는 Desktop에서 `File > Clone`).
2. 로컬 폴더에 clone 됨. 파일을 만들고 수정.
3. 왼쪽 변경 목록에서 커밋할 파일 체크 → 제목 입력 → `Commit to main`.
4. `Push origin` → GitHub 에 반영.
5. 팀원이 push 하면 `Fetch origin` → `Pull origin` 으로 받는다.
6. 새 기능은 `New branch` → 작업·커밋·push → (GitHub 에서 Pull Request) → 병합.

<!-- section: must_know -->
## 반드시 기억할 것

- GUI 버튼과 CLI 명령은 **1:1로 대응**한다. "Commit" 은 `add`(선택) + `commit`, "Push" 는 `git push`.
- `Fetch` 는 받아서 **확인만**, `Pull` 은 받아서 **합침**. 팀 작업 전엔 Pull 먼저.
- 충돌이 나면 Desktop 이 충돌 파일을 알려준다 — 파일을 열어 `<<<<<<<` 표시를 손으로 해결하는 건 CLI 와 동일.
- `.gitignore` 에 없는 파일(`node_modules/`, `.env`)이 변경 목록에 뜨면 커밋하기 전에 `.gitignore` 부터.

<!-- section: experiment -->
## 직접 해 보기

1. 웹에서 저장소를 만들고 Desktop 으로 clone 하라. `README.md` 를 고쳐 커밋 → Push → 웹에서 반영 확인.
2. 웹에서 파일을 한 줄 고쳐 커밋한 뒤, Desktop 에서 `Fetch origin` → `Pull origin` 으로 받아라.
3. Desktop 에서 `New branch` 로 브랜치를 만들어 커밋·push 하고, History 탭에서 갈래를 확인하라.
   각 단계에서 "CLI 라면 어떤 명령인지" 말해 보라.

<!-- section: check_question -->
## 이해 점검

1. Desktop 의 `Commit to main` 버튼은 CLI 명령 몇 개에 해당하나?
2. `Fetch origin` 과 `Pull origin` 의 차이는?
3. GUI 로만 하면 안 되는(=CLI가 필요한) 상황의 예는?

<!-- section: interview_question -->
## 면접 대비

- "Git GUI 도구를 쓰다가 CLI 로 넘어가야 했던 경험이 있나요? 어떤 상황이었나요?"

<!-- section: review -->
## 한 줄 정리

**GitHub Desktop 의 버튼들은 `clone`/`add+commit`/`push`/`fetch`/`pull`/`checkout -b`/`merge`/`log` 와
1:1로 대응한다 — GUI로 익힌 흐름을 CLI 명령으로 바꿔 말할 수 있으면 어느 환경에서든 된다.**

<!-- section: next -->
## 다음 Lesson

`github-workflow/writing-a-readme` — 저장소의 첫인상, README 를 Markdown 으로.
