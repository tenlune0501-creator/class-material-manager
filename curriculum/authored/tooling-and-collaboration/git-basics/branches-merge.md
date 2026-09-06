---
id: tooling-and-collaboration/git-basics/branches-merge
chapter: tooling-and-collaboration/git-basics
title: 브랜치 생성·병합·삭제
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [git, branch, merge]
related_material_ids:
  - 1B9VYYeGi7iPMRB6FeXw_mhkAnkJncIi1Dxxxvg_DJdA   # git - ex 1(브랜치생성,병합,삭제)
prerequisites:
  - tooling-and-collaboration/git-basics/version-control-and-commits
code_examples:
  - slug: branch-flow
    title: 브랜치 만들고 → 작업 → main에 병합 → 삭제
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      git checkout -b feature/about     # feature/about 브랜치 생성 + 그리로 이동
      #   (= git branch feature/about && git checkout feature/about)

      # about.html 만들고 커밋 — 이 커밋들은 feature/about 에만 쌓인다
      git add about.html
      git commit -m "feat: about 페이지 추가"

      git checkout main                 # 다시 main 으로
      git merge feature/about           # feature/about 의 변경을 main 으로 합침

      git branch -d feature/about       # 병합 끝난 브랜치 정리 (-d = 안전 삭제)
  - slug: branch-inspect
    title: 어디에 있고 무엇이 병합됐는지 확인
    source_type: generated_minimal
    language: bash
    code: |
      git branch                # 로컬 브랜치 목록. * 가 현재 위치
      git branch -r             # 원격 추적 브랜치
      git branch --merged       # 현재 브랜치에 이미 병합된 브랜치
      git branch --no-merged    # 아직 병합 안 된 브랜치 (삭제 전에 확인)
      git log --oneline --graph --all   # 히스토리를 갈래로 시각화
  - slug: remote-branch-delete
    title: 원격 브랜치까지 삭제
    source_type: generated_minimal
    language: bash
    code: |
      git branch -d feature/about                 # 로컬에서 삭제(병합됨)
      git branch -D feature/about                 # 강제 삭제(병합 안 됐어도)
      git push origin --delete feature/about      # 원격(GitHub)에서도 삭제
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 브랜치가 **왜** 필요한지(하나의 히스토리를 갈래로 나눠 서로 방해 없이 작업), main 이 무엇인지 설명할 수 있다.
- `git checkout -b`, `git merge`, `git branch -d` 로 **브랜치를 만들어 작업하고 main 에 합치고 정리하는 흐름을 직접 실행할 수 있다.**
- `git branch` 계열 명령으로 "지금 어느 브랜치에 있고, 무엇이 병합됐는지" 확인할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `git init` / `add` / `commit` / `status` / `log`. (→ `git-basics/version-control-and-commits`)
- 커밋이 "되돌아갈 수 있는 체크포인트"라는 감각.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

혼자서도, 팀에서도 — 새 기능을 만드는 도중 **main(배포되는 코드)이 불안정해진다.**
급한 버그 수정이 들어오면 반쯤 만든 기능과 뒤섞인다. 팀원 둘이 같은 파일을 동시에 고치면 충돌한다.

브랜치는 **main 을 건드리지 않고** 내 갈래에서 작업하다가, 완성되면 그때 main 에 합치게 해 준다.

<!-- section: concept -->
## 브랜치와 병합

- **브랜치(branch)** — 커밋 히스토리의 한 갈래. `main`(기본 브랜치)에서 갈라져 나와
  자기만의 커밋 타임라인을 만든다.
- **`HEAD`** — "지금 내가 있는 브랜치". `git branch` 의 `*` 표시.
- **병합(merge)** — 브랜치에서 만든 커밋들을 다른 브랜치(보통 main)로 합치는 것.
- 관례: `feature/로그인`, `fix/카트-수량` 처럼 **목적을 담은 이름**을 쓴다.

<!-- section: mechanism -->
## 흐름

1. `git checkout -b feature/x` — 새 브랜치 생성 + 이동. 이제 커밋하면 `feature/x` 에만 쌓인다.
2. 작업 → `add` → `commit` 을 반복. main 은 그대로다.
3. `git checkout main` → `git merge feature/x` — `feature/x` 의 커밋들이 main 히스토리에 합쳐진다.
   (다른 사람이 그 사이 main 을 안 바꿨으면 **fast-forward**: main 포인터만 앞으로 이동.)
4. `git branch -d feature/x` — 다 합친 브랜치는 정리. 원격에도 있었으면 `git push origin --delete feature/x`.

{{code: branch-flow}}

<!-- section: code_breakdown -->
## 한 줄씩

- `git checkout -b <이름>` = `git branch <이름>` + `git checkout <이름>` 을 한 번에.
- `git merge <브랜치>` — **현재 브랜치로** 그 브랜치를 가져와 합친다. 그래서 병합 전에
  `git checkout main` 으로 받는 쪽에 서 있어야 한다.
- `git branch -d` — 병합이 끝난 브랜치만 안전하게 삭제. `-D` 는 병합 안 됐어도 강제 삭제(주의).
- `git log --oneline --graph --all` — 갈래·병합을 그림으로.

<!-- section: must_know -->
## 반드시 기억할 것

- **병합은 "받는 쪽" 브랜치에 서서** 한다. `git checkout main` → `git merge feature/x`.
- 삭제 전에 `git branch --no-merged` 로 아직 안 합친 게 없는지 확인.
- 로컬 삭제(`-d`)와 원격 삭제(`git push origin --delete`)는 **따로**다.
- 브랜치 이름은 목적을 담아서(`feature/`, `fix/`). 오래된 브랜치는 정리한다.
- 두 브랜치가 **같은 줄**을 다르게 고쳤으면 병합 시 **충돌(conflict)** 이 난다 → 다음 Lesson / `common-git-errors`.

<!-- section: experiment -->
## 직접 해 보기

1. `main` 에서 `feature/a` 브랜치를 만들어 `a.txt` 를 추가·커밋하라. `git checkout main` 후
   `ls` 를 보면 `a.txt` 가 **없다**(브랜치에만 있음). `git merge feature/a` 하면 나타난다.
2. `git log --oneline --graph --all` 로 갈라졌다 합쳐지는 모양을 확인하라.
3. `feature/b` 를 만들어 커밋한 뒤 **병합하지 않고** `git branch -d feature/b` 를 시도하라 —
   거부된다. `git branch --no-merged` 로 확인하고, `-D` 로 강제 삭제해 보라.

<!-- section: check_question -->
## 이해 점검

1. 브랜치를 왜 쓰나? main 에서 바로 작업하면 뭐가 문제인가?
2. `feature/x` 를 main 에 합치려면 어떤 브랜치에 서서 어떤 명령을?
3. `git branch -d` 와 `git branch -D` 의 차이는?
4. 두 브랜치가 같은 파일의 같은 줄을 다르게 고쳤다면 병합 시 무슨 일이?

<!-- section: interview_question -->
## 면접 대비

- "브랜치 전략을 팀에서 어떻게 쓰나요? feature 브랜치의 수명은?"
- "fast-forward 병합과 merge commit 이 생기는 병합의 차이는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 브랜치의 정의와 존재 이유, 생성+이동 한 줄 명령, 병합을 어느 브랜치에서 하는지,
> 로컬/원격 삭제 명령, 충돌이 나는 조건을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**브랜치는 히스토리의 갈래다 — `checkout -b` 로 갈라져 나와 작업하고, 받는 브랜치(main)에 서서
`merge` 로 합친 뒤, 다 쓴 브랜치는 로컬·원격에서 정리한다.**

<!-- section: next -->
## 다음 Lesson

`git-basics/common-git-errors` — push 거부, 충돌, 잘못된 커밋 등 자주 만나는 상황 대처.
