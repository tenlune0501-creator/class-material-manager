---
id: deployment-and-infra/ci-cd-github-actions/first-workflow
chapter: deployment-and-infra/ci-cd-github-actions
title: 첫 GitHub Actions 워크플로
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [deployment, github-actions, ci-cd, workflow, yaml]
related_material_ids:
  - 1Vy2qH2_CNLZBpmybJeCDsHHUflrl7Kt_tPdFxDKuEJQ   # github action (정적 배포 흐름)
  - 1m-E8FWFbhiCWekrvwVZKzvkGpkxjN3tk88Zj6-GxtHA   # 13- 배포 (Next.js + GitHub Actions, Secrets, Runner)
sources:
  - title: "GitHub Actions — Understanding GitHub Actions"
    url: https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions
    publisher: "GitHub"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "GitHub Actions — Workflow syntax"
    url: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
    publisher: "GitHub"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - deployment-and-infra/static-hosting/github-pages
  - tooling-and-collaboration/github-workflow/writing-a-readme
code_examples:
  - slug: anatomy
    title: 워크플로 구조 (용어)
    source_type: generated_minimal
    language: yaml
    is_canonical: true
    code: |
      # .github/workflows/ci.yml   ← 이 경로에 둬야 인식됨
      name: CI
      on:                          # 트리거: 언제 실행?
        push: { branches: [main] }
        pull_request: {}
        workflow_dispatch: {}      # Actions 탭에서 수동 실행
      jobs:                        # 병렬로 도는 작업 묶음
        test:
          runs-on: ubuntu-latest   # Runner: 매번 새로 뜨는 임시 리눅스 VM
          steps:                   # 순서대로 실행되는 단계
            - uses: actions/checkout@v4          # 액션 재사용 (코드 체크아웃)
            - uses: actions/setup-node@v4
              with: { node-version: "20", cache: "npm" }
            - run: npm ci                        # 셸 명령
            - run: npm test
            - run: npm run build
  - slug: deploy-job
    title: 빌드 → 배포 (job 의존성 needs)
    source_type: generated_minimal
    language: yaml
    code: |
      jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with: { node-version: "20", cache: "npm" }
            - run: npm ci && npm run build
            - uses: actions/upload-pages-artifact@v3
              with: { path: ./dist }
        deploy:
          needs: build             # build 성공해야 실행
          runs-on: ubuntu-latest
          permissions: { pages: write, id-token: write }
          environment: github-pages
          steps:
            - uses: actions/deploy-pages@v4
  - slug: secrets
    title: 비밀값 — Secrets → env
    source_type: generated_minimal
    language: yaml
    code: |
      # Settings → Secrets and variables → Actions → New repository secret
      jobs:
        build:
          runs-on: ubuntu-latest
          env:
            VITE_API_BASE: ${{ secrets.VITE_API_BASE }}   # 빌드 시 주입
          steps:
            - run: npm run build
      # Runner 로그에 Secrets 값은 자동 마스킹된다.
      # 단, VITE_/NEXT_PUBLIC_ 접두사 값은 빌드 산출물 JS 에 그대로 박힌다(공개됨).
  - slug: runner-lifecycle
    title: Runner — 매번 새 컴퓨터
    source_type: generated_minimal
    language: text
    code: |
      트리거 발생 → ubuntu-latest VM 새로 생성
        → (env 로 Secrets 주입) → checkout → setup → npm ci → build/test
      → 로그·아티팩트 남기고 → VM 삭제
      # 내 PC 도, GitHub 서버 전체도 아니다. "임시 리눅스 서버 1대".
      # 그래서 로컬 .env 파일이 없다 → Secrets 로 넣는다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **CI/CD** 가 무엇인지(push → 자동 빌드·테스트·배포)와, 왜 쓰는지 설명한다.
- 워크플로 YAML의 구조(`on` / `jobs` / `runs-on` / `steps` / `uses` / `run`)를 읽고 쓴다.
- `.github/workflows/*.yml` 에 첫 워크플로를 만들어 push 시 `npm ci → test → build` 를 돌린다.
- **Runner** 가 매번 새로 뜨는 임시 VM이라는 것과, **Secrets → `env`** 로 비밀값을 주입하는 법을 안다.
- `needs` 로 job 순서(빌드 → 배포)를 만든다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- git push, GitHub 저장소, YAML 들여쓰기, npm 스크립트(`test`/`build`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

배포/검사를 손으로 하면: 사람마다 빌드 환경이 다르고, 테스트를 깜빡하고, 배포를 놓치고,
"내 컴퓨터에선 됐는데" 가 반복된다.

- **CI**(지속적 통합): 커밋마다 **자동으로 빌드·테스트** → 깨진 걸 바로 발견.
- **CD**(지속적 배포): 통과한 코드를 **자동으로 배포**까지.

<!-- section: concept -->
## 1. 워크플로 구조

{{code: anatomy}}

- 파일은 **`.github/workflows/`** 안의 `.yml`. 여러 개 둘 수 있다.
- **`on`**: 트리거 (`push`, `pull_request`, `schedule`, `workflow_dispatch`(수동)…).
- **`jobs`**: 서로 병렬로 도는 작업. 각 job은 별도 Runner에서.
- **`runs-on`**: Runner 종류(`ubuntu-latest` / `windows-latest` / `macos-latest`).
- **`steps`**: 순서대로 실행. `uses:` 는 **남이 만든 액션 재사용**(`actions/checkout`), `run:` 은 셸 명령.

<!-- section: mechanism -->
## 2. Runner 생명주기

{{code: runner-lifecycle}}

Runner는 **트리거마다 새로 생성되는 임시 리눅스 VM 1대**다. 작업이 끝나면 삭제된다.
그래서 로컬 `.env` 파일이 없고, 매번 `npm ci` 로 의존성을 새로 깐다(그래서 `cache: npm` 으로 캐시).

<!-- section: concept | title: 순서 -->
## 3. job 순서 + 배포

{{code: deploy-job}}

- 기본은 **병렬**. `needs: build` 를 쓰면 `build` 가 성공한 뒤에만 `deploy` 가 돈다.
- job 사이에 파일을 넘기려면 **아티팩트**(`upload-artifact` / `download-artifact`, Pages는 `upload-pages-artifact`).
- `permissions` 로 그 job이 쓸 수 있는 토큰 권한을 좁힌다(최소 권한).

<!-- section: concept | title: Secrets -->
## 4. 비밀값

{{code: secrets}}

- 로컬 `.env` 대신 **Settings → Secrets and variables → Actions** 에 넣고, workflow의 `env:` 로 주입.
- 로그에는 Secrets 값이 **자동 마스킹**된다.
- 하지만 `VITE_` / `NEXT_PUBLIC_` 접두사 값은 **빌드 결과 JS에 그대로 들어간다**(브라우저에서 보임).
  공개돼도 되는 값(퍼블릭 API base, Supabase anon key)만 그렇게 쓴다. 서버 비밀은 절대 프런트 빌드에 넣지 않는다.

<!-- section: must_know -->
## 반드시 기억할 것

- 파일 위치: **`.github/workflows/*.yml`**. `on` → `jobs` → `steps`(순서) 구조.
- `uses:` = 액션 재사용, `run:` = 셸 명령. `runs-on` 으로 OS 지정.
- **Runner = 매번 새 임시 VM.** 로컬 파일 없음 → `npm ci`, Secrets 주입, 캐시 활용.
- 기본 병렬. 순서는 **`needs`**, job 간 파일은 **아티팩트**.
- 비밀은 **Secrets → `env`**. `VITE_`/`NEXT_PUBLIC_` 값은 번들에 박혀 공개된다.
- `permissions` 로 토큰 권한 최소화. `workflow_dispatch` 로 수동 실행 버튼.

<!-- section: experiment -->
## 직접 해 보기

1. 아무 Node 프로젝트에 `.github/workflows/ci.yml` 을 만들어 push 시 `npm ci → npm test → npm run build` 를 돌려라.
2. Actions 탭에서 실행 로그를 열어 각 step의 출력을 읽어라. 일부러 테스트를 깨서 빨간 X를 확인.
3. `workflow_dispatch` 를 추가하고 Actions 탭에서 "Run workflow" 버튼으로 수동 실행하라.
4. `build` → `deploy` 두 job을 `needs` 로 이어 Pages에 배포하라.
5. `VITE_API_BASE` 를 Secrets에 넣고 `env:` 로 주입한 뒤, 빌드된 JS에서 그 값이 보이는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. CI와 CD는 각각 무엇을 자동화하나?
2. 워크플로 파일은 어디에 둬야 인식되나?
3. `uses:` 와 `run:` 의 차이는?
4. Runner는 어디이고, 작업이 끝나면 어떻게 되나? 그래서 `.env` 대신 무엇을 쓰나?
5. 두 job을 순서대로 실행하고 파일을 넘기려면 각각 무엇을 쓰나?

<!-- section: interview_question -->
## 면접 대비

- "GitHub Actions 워크플로의 구성 요소(trigger/job/step/action)를 설명해 주세요."
- "CI 파이프라인에서 캐시와 아티팩트를 각각 언제 쓰나요?"
- "빌드 시 주입되는 비밀값을 안전하게 다루는 방법과, 프런트엔드에서의 한계는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> CI/CD 정의, .github/workflows/*.yml 구조(on/jobs/steps, uses vs run), Runner=임시 VM(npm ci·Secrets),
> needs 순서·아티팩트, Secrets→env(VITE_는 공개)를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**GitHub Actions는 `.github/workflows/*.yml` 의 `on` 트리거에 맞춰 임시 Runner에서 `steps` 를 순서대로
실행한다 — job은 기본 병렬이고 순서는 `needs`, 파일 전달은 아티팩트, 비밀값은 Secrets → `env`(`VITE_`
접두사는 번들에 박혀 공개됨)로 넣는다.**
