---
id: tooling-and-collaboration/editor-setup/vscode-setup
chapter: tooling-and-collaboration/editor-setup
title: VS Code 세팅
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [vscode, editor, setup]
related_material_ids:
  - 1aiShBBmoTCUJF4JXZhf3wJU58IVAOxxLSbkb7Xf00bA   # VS code - setting
code_examples:
  - slug: settings-json
    title: 자주 쓰는 설정 (settings.json)
    source_type: generated_minimal
    language: json
    is_canonical: true
    code: |
      {
        "editor.linkedEditing": true,        // 시작 태그 바꾸면 닫는 태그 자동 변경
        "editor.formatOnSave": true,         // 저장 시 자동 포맷
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.tabSize": 2,
        "files.autoSave": "onFocusChange",
        "liveServer.settings.fullReload": true  // Live Server: CSS 변경 시 화면 튐 방지
      }
      // 열기: Ctrl + ,  (설정)  →  우상단 { } 아이콘으로 JSON 직접 편집
  - slug: git-editor
    title: Git 기본 에디터를 VS Code로
    source_type: generated_minimal
    language: bash
    code: |
      git config --global core.editor "code --wait"
      # 이제 git commit (메시지 -m 없이) 하면 VS Code 에서 작성
      # Ctrl+S 저장 → 탭 닫기 → 커밋 완료
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- VS Code 설정을 여는 법(`Ctrl + ,`)과 `settings.json` 직접 편집을 안다.
- 프론트엔드에 유용한 확장(Live Server, Prettier, Auto Rename Tag 류)과 그것이 **무엇을 대신해 주는지** 안다.
- 저장 시 포맷·태그 자동 변경 같은 편의 설정을 켤 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 없음. VS Code 설치만.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 시작 태그를 `<div>` → `<section>` 으로 바꿨는데 닫는 `</div>` 를 안 고쳐서 레이아웃이 깨진다.
- 사람마다 들여쓰기·따옴표가 달라서 커밋마다 diff 가 지저분하다.
- HTML 을 저장해도 브라우저를 직접 새로고침해야 한다.

기본 설정 몇 개와 확장 몇 개면 이런 반복을 도구가 대신한다.

<!-- section: concept -->
## 설정 여는 법

- **`Ctrl + ,`** → 설정 UI. 검색창에 항목 이름(`format on save`, `linked editing`)을 친다.
- 우상단 **`{ }`(Open Settings JSON)** → `settings.json` 을 직접 편집(위 예제).
- 설정은 **User**(전역) / **Workspace**(이 프로젝트만) 두 범위가 있다.

{{code: settings-json}}

<!-- section: concept | title: 확장 -->
## 유용한 확장과 그 역할

| 확장 | 무엇을 대신하나 |
|---|---|
| **Live Server** | 저장하면 브라우저 자동 새로고침 (수동 F5 불필요) |
| **Prettier** | 저장 시 코드 포맷 통일 (들여쓰기·따옴표·줄바꿈 논쟁 종료) |
| **Auto Rename Tag** | 시작 태그 바꾸면 닫는 태그 자동 변경 (= 설정 `editor.linkedEditing` 으로도 가능) |
| **HTML CSS Support / CSS Peek** | HTML 의 클래스에서 `Ctrl+클릭` 으로 해당 CSS 규칙으로 이동 |

확장은 **에디터가 자동화해 주는 반복 작업**이다 — 없어도 되지만 손이 느려진다.

<!-- section: must_know -->
## 반드시 기억할 것

- `editor.formatOnSave` + Prettier: 팀이 같은 설정을 쓰면 커밋 diff 가 깨끗해진다.
  프로젝트에 `.prettierrc` 를 두면 팀원 모두 같은 규칙.
- `editor.linkedEditing`(내장) 또는 Auto Rename Tag: 태그 짝 자동 유지.
- `git config --global core.editor "code --wait"`: `git commit` 을 VS Code 에서 작성.
- Live Server 로 CSS 만 바꿨는데 화면이 위로 튀면 `liveServer.settings.fullReload` 체크 후 재시작.
- 설정을 **Workspace** 로 저장하면 그 프로젝트에서만 적용된다.

<!-- section: experiment -->
## 직접 해 보기

1. `Ctrl + ,` → `format on save` 검색 → 체크. Prettier 설치 후 아무 JS 파일을 지저분하게 쓰고 저장해 보라.
2. `settings.json` 에 `"editor.linkedEditing": true` 를 넣고, HTML 에서 시작 태그를 바꿔 닫는 태그가 따라오는지 확인.
3. `git config --global core.editor "code --wait"` 후 `git commit`(`-m` 없이) → VS Code 에서 메시지를 쓰고 저장·닫기.

<!-- section: check_question -->
## 이해 점검

1. 설정 UI 대신 `settings.json` 을 직접 여는 이유는?
2. User 설정과 Workspace 설정의 차이는?
3. Prettier + formatOnSave 를 팀이 공유하면 무엇이 좋아지나?

<!-- section: review -->
## 한 줄 정리

**`Ctrl + ,` 로 설정을 열고, formatOnSave·linkedEditing 같은 편의 설정과 Live Server·Prettier 확장으로
반복 작업을 에디터에 맡긴다 — 확장은 "있으면 빨라지는" 자동화지 필수는 아니다.**

<!-- section: next -->
## 다음 Lesson

`editor-setup/npm-basics` — 패키지와 스크립트를 다루는 npm.
