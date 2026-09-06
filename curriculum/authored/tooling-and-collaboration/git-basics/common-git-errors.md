---
id: tooling-and-collaboration/git-basics/common-git-errors
chapter: tooling-and-collaboration/git-basics
title: 자주 만나는 Git 에러 대처
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [git, troubleshooting]
related_material_ids:
  - 1jMXiGIp9TTK_WfbKs-mArTS83-tPZ5D9uN6UFlYCRno   # 기초 및 주요 에러 대처법
prerequisites:
  - tooling-and-collaboration/git-basics/branches-merge
code_examples:
  - slug: push-rejected
    title: push 가 거부될 때 (원격이 앞서 있음)
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      git push origin main
      # ! [rejected]  ... (fetch first)
      #   → 원격에 내가 아직 안 받은 커밋이 있다.

      git pull origin main          # 원격 변경을 받아 병합 (또는 --rebase)
      #   충돌이 없으면 자동 병합 커밋 생성 → 다시
      git push origin main
  - slug: resolve-conflict
    title: 병합 충돌 해결
    source_type: generated_minimal
    language: bash
    code: |
      git merge feature/x
      # CONFLICT (content): Merge conflict in index.html

      # 파일을 열면 이렇게 표시된다:
      #   <<<<<<< HEAD
      #   현재 브랜치의 내용
      #   =======
      #   합치려는 브랜치의 내용
      #   >>>>>>> feature/x
      # → 표시줄을 지우고 최종 내용을 손으로 만든 뒤:

      git add index.html
      git commit                    # 병합 완료
      # (되돌리려면 git merge --abort)
  - slug: undo
    title: 되돌리기 3가지
    source_type: generated_minimal
    language: bash
    code: |
      git restore index.html            # 워킹 트리 수정 취소 (아직 커밋 전)
      git restore --staged index.html   # 스테이징만 취소 (수정은 유지)
      git commit --amend -m "새 메시지"  # 방금 한 커밋의 메시지/내용 고치기
      #   ↑ 이미 push 한 커밋에는 하지 않는다 (히스토리가 갈라짐)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `push` 가 거부되는 이유(원격이 앞서 있음)와 대처(`pull` 후 다시 `push`)를 설명할 수 있다.
- 병합 **충돌**이 왜 나는지, 충돌 표시(`<<<<<<<` `=======` `>>>>>>>`)를 읽고 해결하는 절차를 안다.
- "아직 커밋 안 함 / 스테이징만 취소 / 방금 커밋 고치기"를 상황에 맞게 고를 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `add` / `commit` / `push` / `pull` / `merge` / 브랜치. (→ `git-basics/branches-merge`)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

Git 에러 메시지는 대부분 **다음에 뭘 하라고 알려준다**(`fetch first`, `Merge conflict in ...`).
그런데 읽지 않고 당황해서 폴더를 통째로 지우거나, 강제 push 로 남의 작업을 날린다.
자주 나오는 3~4가지 패턴만 알면 대부분 침착하게 넘어간다.

<!-- section: concept | title: push 거부 -->
## 1. push 거부 — `! [rejected] ... (fetch first)`

내가 마지막으로 받은 뒤 **원격에 새 커밋이 생겼다**(팀원이 push 했거나, 내가 웹에서 고쳤거나).
Git 은 그 커밋을 덮어쓰지 않으려고 push 를 막는다.

**대처**: `git pull origin main` 으로 원격 변경을 받아 합친 뒤(충돌 없으면 자동), 다시 `git push`.
`git push --force` 는 **원격 히스토리를 덮어쓴다** — 팀 브랜치에는 쓰지 않는다.

{{code: push-rejected}}

<!-- section: concept | title: 병합 충돌 -->
## 2. 병합 충돌 — `CONFLICT (content): Merge conflict in ...`

두 브랜치가 **같은 파일의 같은 줄**을 다르게 고쳤을 때. Git 은 어느 쪽이 맞는지 모르므로
사람에게 넘긴다. 파일에 이렇게 들어간다:

```
<<<<<<< HEAD
현재 브랜치의 내용
=======
합치려는 브랜치의 내용
>>>>>>> feature/x
```

**대처**: 표시줄 3개(`<<<`, `===`, `>>>`)를 지우고 **최종적으로 원하는 내용**만 남긴다 →
`git add <파일>` → `git commit`. 시작 전으로 되돌리려면 `git merge --abort`.

{{code: resolve-conflict}}

<!-- section: concept | title: 되돌리기 -->
## 3. 되돌리기

| 상황 | 명령 |
|---|---|
| 파일 수정을 아예 취소 (커밋 전) | `git restore <파일>` |
| `git add` 만 취소 (수정은 유지) | `git restore --staged <파일>` |
| **방금 한** 커밋의 메시지/내용 고치기 | `git commit --amend` |
| 과거 커밋을 되돌리는 새 커밋 만들기 | `git revert <해시>` |

`--amend` 와 `push --force` 는 **이미 원격에 올라간 커밋**에는 쓰지 않는다 — 히스토리가 갈라져
팀원이 꼬인다.

{{code: undo}}

<!-- section: must_know -->
## 반드시 기억할 것

- **에러 메시지를 읽는다.** 대부분 다음 명령을 알려준다(`fetch first`, `--abort` 등).
- push 거부 → `pull` → 다시 `push`. `--force` 는 팀 브랜치 금지.
- 충돌 = 같은 줄을 둘이 다르게 고침. 표시줄 지우고 최종본 만든 뒤 `add` + `commit`.
- 커밋 전 실수는 `git restore` 로 대부분 복구. **push 전에는 대체로 안전**하다.
- 이미 push 한 것은 `--amend`/`reset --hard` 대신 `revert`(되돌리는 새 커밋).

<!-- section: experiment -->
## 직접 해 보기

1. 저장소를 웹(GitHub)에서 한 줄 고쳐 커밋한 뒤, 로컬에서 다른 줄을 고쳐 `push` 를 시도하라 —
   거부된다. `git pull` 후 다시 `push`.
2. 브랜치 둘에서 같은 파일 **같은 줄**을 다르게 고쳐 `merge` 하고, 충돌 표시를 직접 해결하라.
   그다음 `git merge --abort` 로 처음부터 다시 해 보라.
3. 파일을 고친 뒤 `git restore` 로 되돌리고, `git add` 후 `git restore --staged` 로 스테이징만 취소해 보라.

<!-- section: check_question -->
## 이해 점검

1. `push` 가 `(fetch first)` 로 거부되는 상황을 한 문장으로.
2. 충돌 파일의 `=======` 위/아래는 각각 무엇인가?
3. 이미 원격에 올라간 커밋을 되돌릴 때 `--amend` 대신 무엇을 쓰나? 왜?
4. `git restore <파일>` 와 `git restore --staged <파일>` 는 각각 무엇을 취소하나?

<!-- section: interview_question -->
## 면접 대비

- "병합 충돌은 왜 생기고 어떻게 해결하나요?"
- "`git reset` 과 `git revert` 의 차이, 팀 환경에서 어느 것을 쓰나요?"

<!-- section: review -->
## 한 줄 정리

**Git 에러는 대부분 다음 행동을 알려준다 — push 거부는 pull 후 재시도, 충돌은 같은 줄을 손으로
합쳐 add·commit, 커밋 전 실수는 `restore`, push 후에는 `revert`.**

<!-- section: next -->
## 다음 Lesson

`github-workflow/github-desktop` — 같은 흐름을 GUI(GitHub Desktop)로.
