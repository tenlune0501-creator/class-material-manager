---
id: deployment-and-infra/containers-docker/dockerfile-and-build
chapter: deployment-and-infra/containers-docker
title: Dockerfile로 내 앱 이미지 만들기
mastery: required
lesson_kind: lesson
estimated_minutes: 50
tags: [docker, dockerfile, build, image, dockerignore]
related_material_ids: []
sources:
  - title: "Writing a Dockerfile"
    url: https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "docker build (CLI reference)"
    url: https://docs.docker.com/reference/cli/docker/buildx/build/
    publisher: "Docker, Inc."
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Build context / .dockerignore"
    url: https://docs.docker.com/build/concepts/context/
    publisher: "Docker, Inc."
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - deployment-and-infra/containers-docker/images-and-containers
  - data-and-backend/nodejs-server/express-rest-api
code_examples:
  - slug: dockerfile
    title: 최소 Dockerfile (Node 앱)
    source_type: generated_minimal
    language: dockerfile
    is_canonical: true
    code: |
      FROM node:24-alpine          # base image: 여기서부터 레이어를 쌓는다
      WORKDIR /app                 # 이후 명령의 작업 디렉터리 (없으면 생성)

      COPY package*.json ./        # 의존성 파일만 먼저 복사 →
      RUN npm ci                   #   소스가 바뀌어도 이 레이어는 캐시 재사용

      COPY . .                     # 나머지 소스 복사
      ENV NODE_ENV=production      # 실행 컨테이너의 환경변수 (빌드 시 굳는다)
      EXPOSE 3000                  # "이 이미지는 3000 을 쓴다"는 문서화 (자동 발행 아님)
      CMD ["node", "index.js"]     # 컨테이너 시작 시 기본 명령
      # 공식 문서도 "이 정도 Dockerfile 은 아직 production-ready 가 아니다"라고 명시 → 멀티스테이지 Lesson 참고
  - slug: build-run
    title: 빌드하고 실행
    source_type: generated_minimal
    language: bash
    code: |
      docker build -t myapp:1.0 .        # "." = 빌드 컨텍스트(이 폴더를 데몬에 보낸다)
      #        -t 이름:태그              # -f 로 Dockerfile 경로 지정 가능

      docker run -d -p 3000:3000 myapp:1.0
      docker image ls                    # myapp:1.0 이 보인다
      docker image history myapp:1.0     # 레이어 스택 확인
  - slug: dockerignore
    title: .dockerignore — 컨텍스트에서 제외
    source_type: generated_minimal
    language: text
    code: |
      node_modules
      dist
      .git
      .env
      *.log
      # 빌드 컨텍스트(폴더 전체)가 데몬에 전송되므로, 큰/불필요/민감 파일을 제외한다.
      # node_modules 를 빼야 COPY . . 가 호스트의 낡은 모듈을 덮어쓰지 않는다.
  - slug: layer-cache
    title: 레이어 캐시 — 순서가 중요하다
    source_type: generated_minimal
    language: text
    code: |
      한 명령 = 한 레이어. 위 레이어가 안 바뀌면 그 아래는 캐시를 재사용한다.
      그래서:  의존성 파일 COPY → RUN npm ci  를  소스 COPY 보다 "위"에 둔다.
      (소스만 고쳐도 npm ci 를 매번 다시 돌리지 않게)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **Dockerfile** 의 핵심 명령(`FROM`/`WORKDIR`/`COPY`/`RUN`/`ENV`/`EXPOSE`/`CMD`)을 읽고 쓴다.
- `docker build -t 이름:태그 .` 로 내 앱을 이미지로 만든다. "." 이 **빌드 컨텍스트**임을 안다.
- **`.dockerignore`** 로 불필요·민감 파일을 컨텍스트에서 제외한다.
- **레이어 캐시**를 살리는 명령 순서(의존성 먼저, 소스 나중)를 안다.
- 이 Dockerfile은 **학습용**이며 프로덕션에는 멀티스테이지가 필요함을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 이미지 = 읽기 전용 템플릿(레이어의 스택, 불변), 컨테이너 = 그 실행 인스턴스(→ `images-and-containers`).
- 컨테이너로 만들 대상 앱(예: Express 서버) 하나.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

`docker run node` 로 남의 이미지를 돌리는 것과, **내 앱을 어디서든 돌아가는 이미지로 만드는 것**은 다르다.
후자를 하려면 "이 앱은 무슨 base 위에, 무슨 파일을, 어떻게 설치해, 어떻게 시작하나" 를 적은
**Dockerfile** 이 필요하다.

<!-- section: code | lang: dockerfile -->
## 1. Dockerfile

{{code: dockerfile}}

- **`FROM`**: 시작점(base image). `node:24-alpine` 처럼 런타임이 든 공개 이미지 위에 얹는다.
- **`WORKDIR`**: 이후 `COPY`/`RUN`/`CMD` 의 기준 경로.
- **`COPY 호스트경로 이미지경로`**: 빌드 컨텍스트의 파일을 이미지로.
- **`RUN`**: **빌드 중** 실행(의존성 설치 등). 결과가 레이어로 굳는다.
- **`ENV`**: 실행 컨테이너의 환경변수(빌드 시 값이 고정 — 런타임 주입은 다음 Lesson `-e`).
- **`EXPOSE`**: "이 이미지는 이 포트를 쓴다" 는 **문서화일 뿐** — 실제 공개는 `docker run -p`.
- **`CMD`**: 컨테이너가 뜰 때 실행할 기본 명령(배열 형태 권장).

<!-- section: mechanism -->
## 2. 빌드와 실행

{{code: build-run}}

- `docker build -t 이름:태그 .` — 마지막 `.` 이 **빌드 컨텍스트**(그 폴더 전체를 데몬에 전송).
  Dockerfile이 다른 곳/이름이면 `-f 경로`.
- 태그를 안 주면 `latest`. 재현성을 위해 버전 태그를 붙인다.
- `docker image history` 로 이미지가 **레이어의 스택**임을 눈으로 확인.

<!-- section: concept | title: .dockerignore -->
## 3. .dockerignore

{{code: dockerignore}}

빌드 컨텍스트는 **폴더 전체가 데몬에 전송**된다. `node_modules`, `.git`, `dist`, `.env`, 로그를
제외해야 빌드가 빠르고, `COPY . .` 가 호스트의 낡은/민감 파일을 이미지에 넣지 않는다.

<!-- section: mechanism -->
## 4. 레이어 캐시

{{code: layer-cache}}

한 명령 = 한 레이어. 위 레이어가 안 바뀌면 아래는 캐시를 재사용한다. 그래서
**`COPY package*.json` + `RUN npm ci` 를 `COPY . .` 보다 위에** 둔다 — 소스만 고쳤을 때
`npm ci` 를 매번 다시 돌리지 않도록.

<!-- section: must_know -->
## 반드시 기억할 것

- 명령: `FROM`(base) → `WORKDIR` → `COPY`(의존성) → `RUN`(설치) → `COPY .` → `ENV`/`EXPOSE` → `CMD`.
- **`EXPOSE` 는 문서화**. 실제 포트 공개는 `docker run -p`(다음 Lesson).
- `docker build -t 이름:태그 .` — `.` 은 빌드 컨텍스트. 태그를 붙인다.
- **`.dockerignore`** 로 `node_modules`/`.git`/`.env`/로그 제외.
- 레이어 캐시: **의존성 설치를 소스 복사보다 위에**.
- 시크릿을 `ENV`/`COPY` 로 이미지에 굽지 않는다(레이어에 남는다) — 런타임 주입.
- 이 Dockerfile은 학습용. 프로덕션은 **멀티스테이지**(빌드 도구 제외) → `dev-vs-prod-multistage` Lesson.

<!-- section: experiment -->
## 직접 해 보기

1. Express 앱에 위 Dockerfile을 두고 `docker build -t myapp:1.0 .` → `docker run -d -p 3000:3000 myapp:1.0`. 브라우저로 확인.
2. `docker image history myapp:1.0` 로 레이어를 세어 보라.
3. 소스 한 줄만 바꿔 다시 빌드 — `npm ci` 레이어가 캐시되는지(로그의 `CACHED`) 확인.
4. `COPY . .` 를 `COPY package*.json ./` + `RUN npm ci` 보다 위로 옮겨 다시 빌드 — 캐시가 깨지는 걸 확인한 뒤 되돌려라.
5. `.dockerignore` 없이 빌드해 컨텍스트 전송 크기를 보고, `node_modules` 등을 추가해 줄여라.
6. `EXPOSE 3000` 만 두고 `-p` 없이 `docker run` 해서 브라우저 접속이 안 되는 걸 확인하라(다음 Lesson 예고).

<!-- section: check_question -->
## 이해 점검

1. `RUN` 과 `CMD` 의 차이는? (언제 실행되나)
2. `EXPOSE 3000` 만으로 브라우저에서 접속되나?
3. `docker build ... .` 의 마지막 `.` 은 무엇인가?
4. `.dockerignore` 에 `node_modules` 를 넣는 두 가지 이유는?
5. 의존성 설치를 소스 복사보다 위에 두는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "Dockerfile 레이어 캐시가 어떻게 동작하고, 어떻게 최적화하나요?"
- "빌드 컨텍스트와 `.dockerignore` 의 역할은?"
- "이미지에 시크릿을 넣으면 안 되는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> Dockerfile 명령(FROM/WORKDIR/COPY/RUN/ENV/EXPOSE/CMD), EXPOSE는 문서화·공개는 -p,
> build -t 이름:태그 .(컨텍스트), .dockerignore, 레이어 캐시(의존성 먼저)를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Dockerfile은 base(`FROM`) 위에 의존성·소스를 `COPY`/`RUN` 으로 레이어로 쌓고 `CMD` 로 시작 명령을
정해 `docker build -t 이름:태그 .` 로 이미지를 만든다 — `EXPOSE` 는 문서화일 뿐이고, `.dockerignore` 로
컨텍스트를 줄이며 의존성 설치를 소스 복사보다 위에 둬 캐시를 살린다.**
