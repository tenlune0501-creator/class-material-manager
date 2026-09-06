---
id: tooling-and-collaboration/editor-setup/npm-basics
chapter: tooling-and-collaboration/editor-setup
title: npm 기초
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [npm, node, package-manager]
related_material_ids:
  - 1_ocUBLoWrO_oO5VshStFlwJd9Zu9Khga3MT6kkWCYh0   # npm
prerequisites:
  - tooling-and-collaboration/git-basics/version-control-and-commits
code_examples:
  - slug: npm-lifecycle
    title: 프로젝트 시작부터 실행까지
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      npm init -y                 # package.json 생성 (프로젝트의 명세서)

      npm install react           # 의존성 추가 → node_modules/ 에 설치 + package.json 에 기록
      npm install -D prettier     # 개발용 의존성 (devDependencies)
      npm install                 # package.json 대로 전부 설치 (clone 직후)

      npm run dev                 # package.json 의 "scripts": { "dev": ... } 실행
      npx create-vite my-app      # 설치 없이 패키지 1회 실행
  - slug: package-json
    title: package.json 핵심
    source_type: generated_minimal
    language: json
    code: |
      {
        "name": "my-app",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "lint": "eslint ."
        },
        "dependencies":    { "react": "^19.0.0" },
        "devDependencies": { "vite": "^6.0.0", "prettier": "^3.0.0" }
      }
      // ^19.0.0 : 19.x.y 중 최신 허용 (major 고정)
      // dependencies    = 실행에 필요
      // devDependencies = 개발/빌드에만 필요 (-D 로 설치)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- npm 이 무엇을 관리하는지(패키지 설치 + 버전 + 실행 스크립트) 설명할 수 있다.
- `npm init` / `npm install` / `npm run` / `npx` 를 상황에 맞게 **직접 쓸 수 있다.**
- `package.json` / `package-lock.json` / `node_modules/` 가 각각 무엇이고, 무엇을 Git 에 올리는지 안다.
- `dependencies` 와 `devDependencies`, 버전 표기(`^`, `~`)를 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 터미널 기본, Node.js 설치(`node -v`, `npm -v`).
- Git 커밋 / `.gitignore` 개념. (→ `git-basics/version-control-and-commits`)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 라이브러리를 쓰려면 파일을 직접 다운로드해 복사… 버전 관리가 안 된다.
- 팀원 PC 에선 되는데 내 PC 에선 안 된다 — 설치한 버전이 다르다.
- `npm run dev` 가 뭘 하는지 몰라서 `vite`, `react-scripts` 같은 명령을 통째로 외운다.

npm 은 **어떤 패키지를 어떤 버전으로 쓰는지 `package.json` 에 적어 두고**, 그걸로 누구 PC 에서든
똑같이 재현하게 해 준다.

<!-- section: concept -->
## npm 이 관리하는 3가지

1. **패키지 설치** — `npm install <이름>` → `node_modules/` 에 코드가 들어오고, `package.json` 에
   "이 프로젝트는 이 패키지를 쓴다"가 기록된다.
2. **버전** — `package.json` 은 허용 범위(`^19.0.0`), `package-lock.json` 은 **실제로 설치된 정확한 버전**.
   그래서 lock 파일이 "재현성"을 보장한다.
3. **스크립트** — `package.json` 의 `"scripts"` 에 이름 붙인 명령. `npm run dev` = 그 이름의 명령 실행.

{{code: npm-lifecycle}}

<!-- section: concept | title: 세 가지 파일/폴더 -->
## package.json / package-lock.json / node_modules

| | 무엇 | Git 에 올리나 |
|---|---|---|
| `package.json` | 프로젝트 명세: 이름·스크립트·의존성 **범위** | ✅ 올린다 |
| `package-lock.json` | 실제 설치된 **정확한 버전** 트리 | ✅ 올린다 (재현성) |
| `node_modules/` | 실제 패키지 코드 (수백 MB, 수만 파일) | ❌ `.gitignore`. `npm install` 로 복원 |

{{code: package-json}}

- `dependencies` — 앱 실행에 필요(예: `react`). `npm install react`
- `devDependencies` — 개발/빌드에만(예: `vite`, `eslint`, `prettier`). `npm install -D vite`
- `^19.0.0` = `19.x.y` 중 최신 허용(major 고정). `~19.1.0` = `19.1.x` 만. 정확히 = 숫자만.

<!-- section: must_know -->
## 반드시 기억할 것

- clone 직후 **`npm install`** 한 번 — `package.json`/`lock` 대로 `node_modules/` 를 만든다.
- **`node_modules/` 는 커밋하지 않는다.** `package.json` + `package-lock.json` 만 올리면 누구나 재현.
- `npm install X` = 설치 + `package.json` 기록. 그냥 다운로드가 아니다.
- `npm run <name>` 은 `package.json > scripts` 의 명령 실행. 없는 이름은 안 된다.
- `npx X` = 전역 설치 없이 X 를 1회 실행(스캐폴딩 도구 `create-vite` 등).
- `dependencies`(-없이) vs `devDependencies`(`-D`) 를 구분해서 설치.

<!-- section: experiment -->
## 직접 해 보기

1. 빈 폴더에서 `npm init -y` → `package.json` 을 열어 보라. `npm install dayjs` 후 `package.json` 과
   `node_modules/` 의 변화, `package-lock.json` 생성 확인.
2. `package.json` 에 `"scripts": { "hi": "echo hello" }` 를 추가하고 `npm run hi` 실행.
3. `node_modules/` 를 통째로 지운 뒤 `npm install` 로 복원해 보라 — `package-lock.json` 덕분에 같은 버전이 온다.
   `.gitignore` 에 `node_modules/` 가 있는지 확인.

<!-- section: check_question -->
## 이해 점검

1. `node_modules/` 를 Git 에 올리지 않아도 팀원이 똑같이 실행할 수 있는 이유는?
2. `package.json` 의 `^19.0.0` 과 `package-lock.json` 의 역할 차이는?
3. `dependencies` 와 `devDependencies` 를 나누는 기준은?
4. `npm run build` 가 실제로 무엇을 실행하는지 어디서 확인하나?

<!-- section: interview_question -->
## 면접 대비

- "`package.json` 과 `package-lock.json` 은 각각 왜 필요한가요?"
- "`npm install` 과 `npm ci` 의 차이는?"
- "semantic versioning 에서 `^` 와 `~` 의 차이는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> npm 이 관리하는 3가지, 세 파일/폴더의 역할과 Git 포함 여부, dependencies vs devDependencies,
> `^`/`~` 의미, `npm run` 과 `npx` 의 차이를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**npm 은 "어떤 패키지를 어떤 버전으로 쓰는지"를 `package.json`+`package-lock.json` 에 적어 두고
`npm install` 로 어디서든 재현한다 — `node_modules/` 는 그 결과물이라 커밋하지 않고,
`npm run` 은 명세서에 적어 둔 명령을 실행한다.**

<!-- section: next -->
## 다음 Chapter

`web-foundations/html-structure` — 실제 화면을 만드는 첫걸음, HTML 문서 구조.
