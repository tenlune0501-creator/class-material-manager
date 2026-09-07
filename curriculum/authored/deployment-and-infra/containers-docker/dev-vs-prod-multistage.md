---
id: deployment-and-infra/containers-docker/dev-vs-prod-multistage
chapter: deployment-and-infra/containers-docker
title: 개발 이미지 vs 프로덕션 이미지 — 멀티스테이지 빌드
mastery: understand
lesson_kind: lesson
estimated_minutes: 40
tags: [docker, multi-stage-build, production, image-size]
related_material_ids: []
sources:
  - title: "Multi-stage builds"
    url: https://docs.docker.com/build/building/multi-stage/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - deployment-and-infra/containers-docker/dockerfile-and-build
code_examples:
  - slug: naive
    title: 문제 — 빌드 도구가 최종 이미지에 남는다
    source_type: generated_minimal
    language: dockerfile
    is_canonical: true
    code: |
      FROM node:24
      WORKDIR /app
      COPY package*.json ./
      RUN npm ci                 # devDependencies + 빌드 툴 전부
      COPY . .
      RUN npm run build          # dist/ 생성
      CMD ["node", "dist/server.js"]
      # 최종 이미지에 컴파일러·devDependencies·소스 전체가 남는다 → 크고, 공격면이 넓다
  - slug: multistage
    title: 멀티스테이지 — 산출물만 다음 스테이지로
    source_type: generated_minimal
    language: dockerfile
    code: |
      # 1) build 스테이지: 빌드에 필요한 모든 것
      FROM node:24 AS build
      WORKDIR /app
      COPY package*.json ./
      RUN npm ci
      COPY . .
      RUN npm run build          # → /app/dist

      # 2) 프로덕션 스테이지: 런타임만
      FROM node:24-alpine AS prod
      WORKDIR /app
      COPY package*.json ./
      RUN npm ci --omit=dev      # 프로덕션 의존성만
      COPY --from=build /app/dist ./dist   # build 스테이지의 산출물만 가져온다
      CMD ["node", "dist/server.js"]
      # 최종 이미지 = alpine + 프로덕션 의존성 + dist. 컴파일러·소스·devDeps 없음.
  - slug: target
    title: --target 으로 특정 스테이지까지만
    source_type: generated_minimal
    language: bash
    code: |
      docker build --target build -t myapp:dev .   # build 스테이지까지만 (디버깅/테스트용)
      docker build -t myapp:1.0 .                   # 마지막 스테이지 = prod
      # 외부 이미지에서도 가져올 수 있다:  COPY --from=nginx:latest /etc/nginx/nginx.conf ./
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **개발 이미지와 프로덕션 이미지가 왜 달라야 하는지**(크기, 공격면, 빌드 도구) 설명한다.
- **멀티스테이지 빌드**로 빌드 의존성과 최종 이미지를 분리한다(`FROM ... AS name`, `COPY --from=`).
- `docker build --target` 으로 특정 스테이지까지만 빌드하는 법을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Dockerfile(`FROM`/`COPY`/`RUN`/`CMD`), 레이어 개념, `npm run build` 가 있는 앱.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

{{code: naive}}

`dockerfile-and-build` 에서 만든 Dockerfile을 공식 문서도 "아직 production-ready가 아니다" 라고 한다.
빌드에 쓴 **컴파일러·devDependencies·소스 전체**가 최종 이미지에 그대로 남아:

- 이미지가 크다(느린 pull/배포, 스토리지).
- 공격면이 넓다(안 쓰는 도구·라이브러리마다 취약점).
- 소스 코드가 이미지에 통째로 들어간다.

<!-- section: concept -->
## 멀티스테이지 빌드

{{code: multistage}}

- `FROM` 을 여러 개 쓰면 **각각이 새 스테이지**. `AS <name>` 으로 이름을 붙인다.
- **`COPY --from=build /경로`** — 이전 스테이지의 **산출물만** 다음 스테이지로 가져온다.
- 최종 이미지 = 마지막 `FROM` 부터 시작 → 앞 스테이지의 도구·소스는 안 들어간다.
- 결과: `node:24`(수백 MB) + 빌드 툴 → `node:24-alpine` + 프로덕션 의존성 + `dist` 로 크게 작아진다.

<!-- section: mechanism -->
## --target

{{code: target}}

- `docker build --target build ...` — build 스테이지까지만(디버깅·테스트용 dev 이미지).
- BuildKit은 `--target` 이 의존하는 스테이지만 처리한다.
- `COPY --from=` 은 **외부 이미지**에서도 가능(`--from=nginx:latest`).

<!-- section: must_know -->
## 반드시 기억할 것

- 단일 스테이지 Dockerfile은 **빌드 도구·devDeps·소스가 최종 이미지에 남는다** → 크고 취약.
- 멀티스테이지: `FROM base AS build` → 빌드 → `FROM slim AS prod` → `COPY --from=build 산출물`.
- 프로덕션 스테이지는 **런타임만**(`npm ci --omit=dev`, alpine/slim base).
- `docker build --target <stage>` 로 dev/test 스테이지까지만 빌드.
- `COPY --from=` 은 다른 스테이지 또는 외부 이미지에서 파일을 가져온다.
- (참고) 공식 Node 가이드는 이 패턴 + `compose.yaml`(dev는 `target: dev`) + `.dockerignore` 를 함께 쓴다.

<!-- section: experiment -->
## 직접 해 보기

1. 빌드 스텝이 있는 앱(TS/React/Vite)에 단일 스테이지 Dockerfile을 만들고 이미지 크기를 재라(`docker image ls`).
2. 멀티스테이지로 바꿔 다시 빌드하고 크기를 비교하라.
3. 최종 이미지에서 `docker run --rm myapp sh -c "which tsc || echo none"` 로 빌드 도구가 없는지 확인.
4. `docker build --target build -t myapp:dev .` 로 dev 이미지를 만들어 안에 소스·devDeps가 있는지 확인.
5. `COPY --from=nginx:latest /etc/nginx/nginx.conf ./` 로 외부 이미지에서 파일을 가져와 보라.

<!-- section: check_question -->
## 이해 점검

1. 단일 스테이지 Dockerfile의 최종 이미지에 무엇이 불필요하게 남나? 왜 문제인가?
2. `COPY --from=build` 는 무엇을 하나?
3. 프로덕션 스테이지에서 `npm ci --omit=dev` 를 쓰는 이유는?
4. `docker build --target build` 는 언제 쓰나?
5. `COPY --from=` 의 소스로 외부 이미지도 가능한가?

<!-- section: interview_question -->
## 면접 대비

- "멀티스테이지 빌드가 해결하는 문제와 동작 원리를 설명해 주세요."
- "프로덕션 이미지 크기를 줄이는 방법들은?"
- "개발용 이미지와 프로덕션 이미지를 하나의 Dockerfile로 관리하는 법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 단일 스테이지 = 빌드 도구/소스 잔존(크고 취약), 멀티스테이지(FROM AS + COPY --from=),
> prod 스테이지는 런타임만(--omit=dev·slim), --target 으로 dev 스테이지를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**멀티스테이지 빌드는 빌드 스테이지(`FROM base AS build`)에서 컴파일한 뒤 슬림한 프로덕션 스테이지로
`COPY --from=build` 산출물만 옮겨, 최종 이미지에서 빌드 도구·devDeps·소스를 제거한다 — `--target` 으로
같은 Dockerfile에서 dev 이미지도 뽑는다.**
