---
id: react/react-deployment/deploy-with-github-actions
chapter: react/react-deployment
title: GitHub Actions로 자동 배포
mastery: practical
lesson_kind: lesson
estimated_minutes: 50
tags: [react, deploy, github-actions, ci-cd]
related_material_ids:
  - 1m-E8FWFbhiCWekrvwVZKzvkGpkxjN3tk88Zj6-GxtHA   # 13- 배포 (next.js + github Actions)
  - 1Vy2qH2_CNLZBpmybJeCDsHHUflrl7Kt_tPdFxDKuEJQ   # github action
  - 1to7zF_68YLwOp-C0D8kYIT07XbxxGL5KOtiZCAHYnxo   # 11 - 배포 (nextjs)
  - 1bPuO0PdIH9jPgvRFADOR-_mPcbdrP2KVpOH25Dgg5Qo   # 배포
sources:
  - title: "Deploying Next.js to GitHub Pages"
    url: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
    publisher: "Vercel"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "GitHub Actions — Deploying with GitHub Pages"
    url: https://docs.github.com/en/actions/how-tos/deploy/deploy-to-github-pages
    publisher: "GitHub"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - deployment-and-infra/ci-cd-github-actions/first-workflow
  - react/portfolio-project/pagination-and-deploy
code_examples:
  - slug: vite-pages-workflow
    title: Vite React → GitHub Pages 워크플로
    source_type: generated_minimal
    language: yaml
    is_canonical: true
    code: |
      # .github/workflows/deploy.yml
      name: Deploy to Pages
      on:
        push:
          branches: ["main"]     # main 에 push 되면
        workflow_dispatch: {}     # 수동 실행도 허용
      permissions:
        contents: read
        pages: write
        id-token: write
      concurrency:
        group: "pages"
        cancel-in-progress: false
      jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with: { node-version: "20", cache: "npm" }
            - run: npm ci
            - run: npm run build          # → dist/
              env:
                VITE_API_BASE: ${{ secrets.VITE_API_BASE }}  # 빌드 시 주입
            - uses: actions/configure-pages@v5
            - uses: actions/upload-pages-artifact@v3
              with: { path: ./dist }
        deploy:
          needs: build
          runs-on: ubuntu-latest
          environment: { name: github-pages, url: "${{ steps.d.outputs.page_url }}" }
          steps:
            - id: d
              uses: actions/deploy-pages@v4
  - slug: env-flow
    title: 환경변수 흐름 — 로컬 파일 vs Secrets
    source_type: generated_minimal
    language: text
    code: |
      로컬:   .env(.local)  →  Vite/Next 가 읽음  →  build

      Actions: GitHub Secrets  →  workflow 의 env:  →  Runner(임시 리눅스 VM) OS 환경변수
               →  process.env / import.meta.env  →  build  →  VM 삭제

      # VITE_ / NEXT_PUBLIC_ 접두사 값은 "빌드 결과 JS 에 그대로 박힌다" → 공개 가능한 값만.
      # 진짜 비밀(서버 키)은 클라 번들에 넣지 않는다 — 서버/프록시에서만.
  - slug: gha-vs-vercel
    title: GitHub Actions(+Pages) vs Vercel
    source_type: generated_minimal
    language: text
    code: |
      GitHub Actions + Pages          Vercel
      정적만 (SSR/API/Middleware ✗)   SSR/서버컴포넌트/Route Handler ✓
      워크플로 YAML 로 세밀 제어       git 연결 후 push 시 자동
      아무 클라우드로도 배포 가능      Vercel 플랫폼
      무료 분(월 ~2000분)             무료 플랜 빌드/프로젝트 제한
      Vite/CSR·SSG 포트폴리오에 적합   Next.js 앱에 기본 선택
  - slug: nextjs-export-gotchas
    title: Next.js → Pages 정적 export 함정
    source_type: generated_minimal
    language: text
    code: |
      next.config.mjs: { output: "export", images: { unoptimized: true } }
      - [id] 동적 라우트 → generateStaticParams 로 경로 목록 제공 (없으면 빌드 실패)
      - 서브패스(/repo/) → basePath / assetPrefix, 이미지 src 에 base 접두
      - SSR / Route Handler / Server Actions → 정적 export 에서 불가 → Vercel 로
      - 새 글은 재빌드해야 반영 (빌드 타임 렌더)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **CI/CD**(push → 자동 빌드 → 자동 배포)의 개념과, GitHub Actions 워크플로 YAML의 뼈대를 안다.
- Vite React 앱을 **GitHub Pages** 에 자동 배포하는 워크플로를 작성한다.
- **환경변수**가 로컬 `.env` → **GitHub Secrets** → Runner OS → `build` 로 흐르는 경로를 안다.
- **GitHub Actions+Pages vs Vercel** 을 프로젝트 성격에 맞게 고른다.
- Next.js를 Pages에 올릴 때의 정적 export 함정을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- GitHub Actions 첫 워크플로(`deployment-and-infra/ci-cd-github-actions/first-workflow`),
  Vite build/`base`/SPA fallback(앞 Lesson).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

배포할 때마다 로컬에서 `npm run build` → `dist/` 를 수동 업로드하면: 빌드 환경이 사람마다 다르고,
올리는 걸 깜빡하고, 되돌리기가 어렵다. **push하면 알아서 빌드·배포**되게 하는 게 CI/CD다.

- **CI**(지속적 통합): 커밋마다 자동 빌드·테스트로 오류를 일찍 잡음.
- **CD**(지속적 배포): 통과한 코드를 배포 환경까지 자동 전달.

<!-- section: concept -->
## 1. 워크플로 뼈대

{{code: vite-pages-workflow}}

- **`on: push: branches: [main]`** — main에 푸시되면 실행. `workflow_dispatch` 로 수동 실행도.
- **`jobs`** — `build`(체크아웃 → Node 세팅 → `npm ci` → `npm run build` → 아티팩트 업로드) →
  `deploy`(아티팩트를 Pages로).
- **Runner** = 매 실행마다 새로 뜨는 임시 우분투 VM. 빌드가 끝나면 삭제된다. (내 PC도, 깃허브 서버 전체도 아니다.)
- `permissions` / `concurrency` 는 Pages 배포에 필요한 표준 설정.

<!-- section: mechanism -->
## 2. 환경변수 흐름

{{code: env-flow}}

- 로컬에선 `.env` **파일**이 필요했다. Actions에는 그 파일이 없으니 **GitHub Secrets**
  (Settings → Secrets and variables → Actions)에 값을 넣고, workflow의 `env:` 로 주입한다.
- **`VITE_` / `NEXT_PUBLIC_` 접두사 값은 빌드 결과 JS에 그대로 박힌다** — Supabase anon key,
  퍼블릭 API base처럼 공개돼도 되는 값만. 진짜 비밀은 클라이언트 번들에 절대 넣지 않는다.

<!-- section: concept | title: 선택 -->
## 3. GitHub Actions+Pages vs Vercel

{{code: gha-vs-vercel}}

- **Vite/CSR·SSG 포트폴리오** → Pages + Actions로 충분(YAML을 배우는 이점도).
- **Next.js 앱(SSR·Route Handler·Middleware)** → Vercel이 기본. Pages는 정적만이라 서버 기능이 빠진다.

{{code: nextjs-export-gotchas}}

<!-- section: must_know -->
## 반드시 기억할 것

- CI/CD = push → 자동 빌드(임시 Runner) → 자동 배포. 되돌리기·재현성 확보.
- Vite Pages 워크플로: `on.push.main` → `build`(npm ci → build → upload-pages-artifact) → `deploy-pages`.
- 로컬 `.env` 대신 **GitHub Secrets** → workflow `env:`. `VITE_`/`NEXT_PUBLIC_` 값은 **공개된다**.
- Pages는 **정적만**. Next.js SSR/API가 필요하면 **Vercel**.
- Next.js를 Pages로: `output: "export"` + `[id]` 에 `generateStaticParams` + 서브패스 `basePath` + 재빌드로만 갱신.
- 배포 전 로컬 `npm run build && npm run preview` 로 배포본을 먼저 확인.

<!-- section: experiment -->
## 직접 해 보기

1. Vite React 앱 리포에 `.github/workflows/deploy.yml` 을 추가하고 Settings → Pages → Source = GitHub Actions로 설정하라.
2. `main` 에 push해 Actions 탭에서 `build` → `deploy` 두 잡이 도는 걸 확인하라.
3. `VITE_API_BASE` 를 Secrets에 넣고 workflow `env:` 로 주입한 뒤, 빌드된 JS에서 그 값이 보이는지(공개됨) 확인하라.
4. `vite.config.js` 의 `base` 를 빼고 배포해 CSS/JS 404를 재현한 뒤 `base: "/repo/"` 로 고쳐라.
5. (도전) Next.js 앱을 `output: "export"` 로 Pages에 올리며 `generateStaticParams` 누락 에러를 직접 겪고 고쳐라.

<!-- section: check_question -->
## 이해 점검

1. CI와 CD는 각각 무엇을 자동화하나?
2. workflow가 실행되는 "Runner"는 어디이고 실행 후 어떻게 되나?
3. 로컬 `.env` 대신 Actions에서는 환경변수를 어디에 넣나?
4. `VITE_SUPABASE_ANON_KEY` 를 Secrets에 넣어도 "숨겨지지" 않는 이유는?
5. Next.js 앱을 GitHub Pages에 올릴 수 없는(또는 제약이 큰) 경우는?

<!-- section: interview_question -->
## 면접 대비

- "CI/CD 파이프라인을 GitHub Actions로 구성한 경험을 설명해 주세요."
- "빌드 시 주입되는 환경변수와 런타임 환경변수의 차이, 프런트엔드에서의 주의점은?"
- "정적 호스팅(Pages)과 서버형(Vercel) 배포를 어떤 기준으로 선택하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> CI/CD 정의, workflow 뼈대(on.push→build→deploy-pages, Runner=임시VM), Secrets→env: 흐름,
> VITE_/NEXT_PUBLIC_ 은 공개됨, Pages=정적만·Next SSR은 Vercel을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**GitHub Actions 워크플로는 main push 시 임시 Runner에서 `npm ci && build` 후 아티팩트를 Pages로 배포한다 —
환경변수는 Secrets → `env:` 로 주입하되 `VITE_`/`NEXT_PUBLIC_` 값은 번들에 박혀 공개되며,
SSR·API가 필요한 Next.js 앱은 Pages 대신 Vercel을 쓴다.**
