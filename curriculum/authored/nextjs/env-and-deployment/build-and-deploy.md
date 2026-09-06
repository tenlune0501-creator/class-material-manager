---
id: nextjs/env-and-deployment/build-and-deploy
chapter: nextjs/env-and-deployment
title: 빌드와 배포
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [nextjs, build, deploy, vercel]
related_material_ids:
  - 1M7uAN4K5Bl9pfjU5K3Am3hBLhKNoctEkiiTKqTFeATc   # 03_빌드와 배포 (2025)
  - 1b4IhqIgN-ku2n1WnlPPgpwpXmFqpnIPm9RdIV_ZVj-w   # 배포 - v2026
prerequisites:
  - nextjs/board-crud/create-update-delete
  - deployment-and-infra/static-hosting/github-pages
code_examples:
  - slug: build-vs-dev
    title: dev 는 개발용, 배포는 build → start
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      npm run dev      # HMR·소스맵·최적화 없음. 응답이 크고 느리다. 로컬 개발 전용.

      npm run build    # .next/ 에 프로덕션 번들 생성 (코드 분할·압축·트리셰이킹·정적 프리렌더)
      npm run start    # .next/ 를 Node 서버로 서빙. 로컬에서 프로덕션 동작 확인용.
      # 빌드 결과를 보면 응답 용량이 확 줄어 있다.
  - slug: build-output
    title: 빌드 로그 읽기
    source_type: generated_minimal
    language: text
    code: |
      Route (app)                     Size     First Load JS
      ┌ ○ /                           1.2 kB        95 kB
      ├ ● /read/[id]                  0.9 kB        94 kB
      └ ƒ /api/topics                 0 B            0 B
      ○  (Static)   빌드 시 미리 렌더 (가장 빠름)
      ●  (SSG)      generateStaticParams 로 경로별 프리렌더
      ƒ  (Dynamic)  요청마다 서버에서 렌더
      # 빌드가 실패하면(타입 에러/린트/빌드타임 fetch 실패) 배포도 실패한다 → 로그부터 본다.
  - slug: vercel-deploy
    title: Vercel — Git 연동 자동 배포
    source_type: generated_minimal
    language: text
    code: |
      1. 코드를 GitHub 에 push
      2. vercel.com → New Project → 그 저장소 선택 (프레임워크: Next.js 자동 감지)
      3. Environment Variables 에 배포용 값 입력 (예: NEXT_PUBLIC_API_URL = 배포된 API 주소)
      4. Deploy
      # 이후 main 에 push → 프로덕션 배포, PR/브랜치 push → 미리보기(preview) 배포가 자동.
      # 빌드 명령 `next build`, 출력 `.next` 는 Vercel 이 자동 설정.
  - slug: split-deploy
    title: 프런트와 목데이터 백엔드를 따로 배포
    source_type: generated_minimal
    language: text
    code: |
      # 이 커리큘럼 예제는 json-server 를 백엔드로 쓴다 → 별도 호스트에 올린다.
      # Render 예: 서비스 생성 → json-server 레포 연결
      #   start: npx json-server --host 0.0.0.0 --port $PORT --watch db.json
      #   ($PORT 는 호스트가 주입. 9999 고정 금지)
      # 그 주소를 Vercel 프로젝트의 NEXT_PUBLIC_API_URL 환경변수로 지정.
      # (실서비스라면 json-server 가 아니라 진짜 DB + 백엔드로 대체)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `dev` 와 `build`→`start` 의 차이(최적화·용량·용도)를 설명하고, 로컬에서 프로덕션 빌드를 확인한다.
- 빌드 로그의 라우트 표(`○` 정적 / `●` SSG / `ƒ` 동적)를 읽고, 빌드 실패가 곧 배포 실패임을 안다.
- **Vercel Git 연동**으로 자동 배포를 설정하고, `main` push = 프로덕션 / 브랜치 push = 프리뷰 흐름을 안다.
- 프런트(Vercel)와 예제용 백엔드(json-server, 다른 호스트)를 **분리 배포**하고 환경변수로 연결한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/board-crud/*`, Git·GitHub, `deployment-and-infra/static-hosting` 의 Vercel/Netlify 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `next dev` 상태 그대로를 "배포" 라고 생각해 느리고 무거운 앱을 내보낸다.
- 로컬에선 되는데 배포가 깨진다 — 타입 에러/린트/빌드타임 fetch 실패를 빌드 로그에서 안 본다.
- 로컬 `http://localhost:9999` 를 코드에 박아서 배포된 앱이 API 를 못 찾는다.

<!-- section: concept -->
## dev vs build → start

{{code: build-vs-dev}}

- **`dev`** — 빠른 반영(HMR), 최적화 없음. 응답이 크다. 로컬에서만.
- **`build`** — `.next/` 에 프로덕션 번들: 코드 분할, 압축, 미사용 코드 제거, 가능한 페이지는 **미리 렌더**.
- **`start`** — 빌드 결과를 서빙. 배포 전 "프로덕션에서도 되나" 를 로컬에서 확인하는 용도.
- Vercel 에 올리면 이 `build`/`start` 를 **호스트가 대신** 실행한다.

<!-- section: mechanism -->
## 빌드 로그 · Vercel · 분리 배포

{{code: build-output}}

- 라우트마다 `○`(정적, 빌드 시 렌더) / `●`(SSG, `generateStaticParams`) / `ƒ`(동적, 요청 시 렌더) 표시.
- **빌드가 실패하면 배포도 실패**. 원인은 대개 타입 에러, 린트 에러, 빌드타임 `fetch` 실패, 환경변수 누락. 로그 먼저.

{{code: vercel-deploy}}

- GitHub 에 push → Vercel 이 저장소를 감지해 빌드·배포. 프레임워크가 Next.js 면 빌드 설정은 자동.
- 이후 **`main` push = 프로덕션**, **브랜치/PR push = 프리뷰 URL** 이 자동 생성된다.
- 롤백은 대시보드에서 이전 배포를 "Promote" 하면 된다.

{{code: split-deploy}}

- 이 커리큘럼 예제 백엔드는 `json-server` → 프런트와 **다른 호스트**(Render 등)에 올리고, `$PORT` 는 호스트가 주입한다(고정 포트 금지).
- 그 주소를 프런트의 환경변수(`NEXT_PUBLIC_API_URL`)로 연결한다(다음 Lesson).
- **주의**: `json-server` 는 학습·데모용이다. 실서비스에서는 진짜 DB + 백엔드(또는 Next.js Route Handler + DB)로 대체한다.
  공개된 `json-server` 는 누구나 읽고 쓸 수 있으므로 민감 데이터를 넣지 않는다.

<!-- section: must_know -->
## 반드시 기억할 것

- 배포 = **`build` → `start`**. `dev` 는 로컬 전용(최적화 없음).
- 빌드 로그: `○` 정적 / `●` SSG / `ƒ` 동적. **빌드 실패 = 배포 실패** → 로그부터.
- Vercel: GitHub 연동 → 자동 빌드. `main` = 프로덕션, 브랜치 = 프리뷰. 롤백은 이전 배포 Promote.
- 배포 환경의 API 주소는 **환경변수**로. `localhost` 를 코드에 박지 않는다.
- 예제 백엔드(`json-server`)는 별도 호스트 + `$PORT` 주입. 데모용임을 명심.

<!-- section: experiment -->
## 직접 해 보기

1. `npm run build` → 라우트 표를 읽고 어떤 페이지가 `○`/`ƒ` 인지 확인. `npm run start` 로 열어 `dev` 와 Network 용량 비교.
2. 일부러 타입 에러를 넣고 `build` → 실패 로그 확인 후 되돌리기.
3. GitHub 에 push 하고 Vercel 프로젝트 생성 → 배포 URL 확인.
4. 브랜치를 만들어 push → 프리뷰 URL 이 따로 생기는지 확인.

<!-- section: check_question -->
## 이해 점검

1. `dev` 결과를 그대로 배포하면 안 되는 이유는?
2. 빌드 로그의 `ƒ` 와 `○` 는 각각 무슨 뜻인가?
3. Vercel 에서 `main` push 와 브랜치 push 는 각각 무엇을 만드나?
4. 배포된 앱이 API 를 못 찾는다. 가장 먼저 확인할 것은?

<!-- section: interview_question -->
## 면접 대비

- "Next.js 앱의 배포 파이프라인을 설명해 보세요 (빌드 → 배포 → 롤백)."
- "프리뷰 배포는 왜 유용한가요?"

<!-- section: review -->
## 한 줄 정리

**배포는 `build`(.next/ 프로덕션 번들) → `start` 이고, Vercel 은 GitHub 연동으로 이를 자동화한다(`main`=프로덕션, 브랜치=프리뷰) —
빌드 실패는 곧 배포 실패이니 로그를 먼저 보고, 배포 환경의 API 주소는 코드가 아니라 환경변수로 넣는다.**

<!-- section: next -->
## 다음 Lesson

`env-and-deployment/environment-variables` — 환경변수와 `NEXT_PUBLIC_`.
