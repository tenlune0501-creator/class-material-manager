---
id: tooling-and-collaboration/git-basics/version-control-and-commits
chapter: tooling-and-collaboration/git-basics
title: 버전 관리와 커밋
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [git, version-control, commit]
related_material_ids:
  - 1jMXiGIp9TTK_WfbKs-mArTS83-tPZ5D9uN6UFlYCRno   # 기초 및 주요 에러 대처법
  - 1iqOzKcxQnvrL0Fym1BAj7LTvK1AIQF8yCBuL4Z_8pVA   # 커밋 메시지 입력하기
prerequisites:
  - tooling-and-collaboration/editor-setup/vscode-setup
code_examples:
  - slug: first-commit
    title: 새 프로젝트를 Git으로 관리하기 시작
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      git init                       # 이 폴더를 Git 저장소로 (한 번만)
      git config user.name "이름"
      git config user.email "github메일"

      # 파일을 만들고 수정한 뒤...
      git status                     # 지금 무엇이 바뀌었나
      git add index.html             # 이 파일을 다음 스냅샷에 포함
      git add .                      # (또는) 바뀐 것 전부
      git commit -m "feat: 첫 페이지 추가"

      git log --oneline              # 지금까지의 스냅샷 목록
  - slug: staging-cycle
    title: 워킹 트리 → 스테이징 → 커밋
    source_type: generated_minimal
    language: bash
    code: |
      # 1) 워킹 트리에서 파일 수정 (에디터로)
      # 2) 커밋에 넣을 것만 골라 스테이징
      git add style.css
      #    아직 index.html 은 스테이징 안 함 → 이번 커밋에 안 들어감
      # 3) 스테이징된 것만 스냅샷으로 확정
      git commit -m "style: 헤더 색상 조정"

      git status     # index.html 은 여전히 "수정됨(스테이징 안 됨)"
  - slug: commit-message
    title: 커밋 메시지 — 제목 + (선택) 본문
    source_type: generated_minimal
    language: bash
    code: |
      # 한 줄: 접두사 + 무엇을
      git commit -m "fix: 로그인 시 토큰 갱신 오류 수정"

      # 제목 + 본문 (왜/배경). -m 을 두 번, 또는 에디터로.
      git commit -m "fix: 회원가입 오류 수정" -m "비밀번호 유효성 검사 로직 누락을 보완."

      # 에디터로 쓰려면 (VS Code 를 기본 에디터로)
      git config --global core.editor "code --wait"
      git commit          # 첫 줄=제목, 빈 줄, 그다음=본문
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 버전 관리가 **무엇을** 관리하는지(변경의 스냅샷 히스토리), 로컬 저장소와 원격 저장소가 다르다는 것을 설명할 수 있다.
- 빈 폴더에서 `git init` → `git add` → `git commit` 으로 **첫 커밋을 직접 만들 수 있다.**
- **워킹 트리 / 스테이징 영역 / 커밋** 3단계를 구분하고, 커밋에 넣을 것만 골라 스테이징할 수 있다.
- 읽을 만한 커밋 메시지(접두사 + "무엇을/왜")를 쓸 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- **터미널 기본** — 디렉터리 이동, 명령·플래그. (→ `tooling-and-collaboration/editor-setup/vscode-setup`)
- Git 설치 (`git --version` 이 버전을 출력하면 됨). 안 되면 <https://git-scm.com> 에서 설치.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `index_final.html`, `index_final2.html`, `index_진짜최종.html` … 어느 게 최신인지 모른다.
- 어제 잘 되던 코드를 오늘 고쳤더니 깨졌는데, **어디를 되돌려야** 하는지 모른다.
- 팀원이 내 파일을 덮어썼는데 **뭐가 바뀌었는지** 알 수 없다.

Git 은 프로젝트의 어떤 부분도 겹쳐쓰지 않게, **변경의 "스냅샷"을 시점마다 저장**한다.
그래서 데이터를 잃지 않고, 언제든 이전 시점으로 되돌리거나 비교할 수 있다.

<!-- section: concept -->
## 저장소 · 버전 관리 · 커밋

- **저장소(repository)** — 프로젝트가 사는 폴더 + 그 변경 히스토리. 내 PC 안에 있으면 **로컬 저장소**,
  GitHub 같은 서버에 있으면 **원격 저장소**.
- **버전 관리** — 프로젝트 히스토리의 모든 시점에 "스냅샷"을 남겨, 겹쳐쓰거나 잃어버리지 않게 한다.
- **커밋(commit)** — 그 시점 저장소 상태의 스냅샷을 찍는 것. 각 커밋은 되돌아갈 수 있는 **체크포인트**다.

<!-- section: mechanism -->
## 3단계: 워킹 트리 → 스테이징 → 커밋

Git 으로 하는 일은 기본적으로 세 단계다.

1. **워킹 트리(내 컴퓨터의 파일)** 에서 파일을 수정한다.
2. **스테이징 영역(staging area)** 에 `git add` 로 파일을 올려, "이번 커밋에 넣을 것"을 고른다.
3. `git commit` 으로 스테이징된 것만 **영구 스냅샷**으로 저장한다.

핵심은 2단계가 따로 있다는 것 — **바꾼 것 전부가 아니라 골라서** 커밋할 수 있다.
`git status` 는 매 순간 "무엇이 워킹 트리에만 있고, 무엇이 스테이징됐는지"를 보여준다.

<!-- section: code | lang: bash -->
## 실습 1 — 첫 커밋

{{code: first-commit}}

## 실습 2 — 골라서 스테이징

{{code: staging-cycle}}

<!-- section: code_breakdown -->
## 한 줄씩

- `git init` — 이 폴더를 저장소로 만든다. 이걸 하기 전엔 그냥 일반 폴더다. **한 번만.**
- `git config user.name / user.email` — 커밋에 찍힐 작성자. (`--global` 을 붙이면 모든 저장소 공통)
- `git add <파일>` / `git add .` — 파일을 저장소에 "추가"하는 게 아니라, **다음 스냅샷에 포함되도록 스테이징**한다.
- `git commit -m "..."` — 스테이징된 것으로 스냅샷을 찍는다. `-m` 다음이 커밋 메시지.
- `git status` — 지금 상태. `git log --oneline` — 커밋 히스토리(한 줄씩).

<!-- section: concept | title: 커밋 메시지 -->
## 커밋 메시지 쓰기

메시지는 나중의 나와 팀원을 위한 것이다 — "코드만으로는 알기 어려운 **왜**"를 남긴다.

- **제목**: 50자 이내, 간결하게. `무엇을` 위주. 끝에 마침표 없음.
- **본문**(선택): 필요하면 `왜/배경`. `어떻게`는 코드에 이미 있다.
- **접두사(Conventional Commits)**: `feat`(기능) · `fix`(버그) · `docs`(문서) · `style`(포맷) ·
  `refactor`(구조 개선, 동작 그대로) · `test` · `chore`(설정·빌드). 팀에선 이 정도면 충분.

{{code: commit-message}}

<!-- section: must_know -->
## 반드시 기억할 것

- `git init` 은 저장소당 **한 번**. `add` → `commit` 은 **매 변경마다** 반복.
- `git add` 는 "추가"가 아니라 **"다음 커밋에 넣기"**. 커밋 전에 `git status` 로 무엇이 스테이징됐는지 확인.
- 커밋 하나 = 하나의 논리적 변경. "이것저것 다 고침" 한 커밋보다, 작게 나눈 커밋이 되돌리기·리뷰가 쉽다.
- 메시지: `<접두사>: <무엇을>` 한 줄이면 대부분 충분.

<!-- section: experiment -->
## 직접 해 보기

1. 새 폴더에서 `git init` 후 `a.txt`, `b.txt` 두 파일을 만들어라. `git add a.txt` 만 하고
   `git status` 를 보라 — `a.txt` 는 "스테이징됨", `b.txt` 는 "추적 안 됨". `git commit` 하면
   `a.txt` 만 커밋된다.
2. `git commit` 을 `-m` 없이 실행해 에디터가 열리는 것을 확인하라(접두사·제목·본문 형식으로 작성).
   `git config --global core.editor "code --wait"` 후 다시 시도.
3. `git log --oneline` 으로 커밋 2~3개를 만든 뒤, `git show <해시>` 로 특정 커밋의 변경 내용을 보라.

<!-- section: check_question -->
## 이해 점검

1. `git add` 는 "저장소에 파일을 추가"하는 명령인가? 정확히 무엇을 하나?
2. 파일 3개를 고쳤는데 그중 1개만 커밋하려면?
3. 커밋 메시지에 `어떻게`(구현 방법)를 길게 쓰지 않는 이유는?
4. `git init` 을 한 폴더에서 두 번 실행하면 어떻게 되나? (해도 되는가?)

<!-- section: interview_question -->
## 면접 대비

- "워킹 트리, 스테이징 영역, 커밋의 차이를 설명해 주세요."
- "좋은 커밋 단위와 커밋 메시지는 어떤 것인가요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 버전 관리가 관리하는 것 한 문장, 로컬 vs 원격 저장소, add/commit 의 정확한 의미,
> 커밋 메시지 형식(접두사+제목), "작은 커밋"의 이점을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Git 은 변경의 스냅샷을 시점마다 저장한다 — 워킹 트리에서 고치고, `git add` 로 커밋에 넣을 것을
고르고, `git commit` 으로 되돌아갈 수 있는 체크포인트를 남긴다.**

<!-- section: next -->
## 다음 Lesson

`git-basics/branches-merge` — 하나의 히스토리를 갈래(브랜치)로 나눠 따로 작업하고 다시 합치기.
