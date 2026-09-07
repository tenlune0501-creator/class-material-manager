---
id: deployment-and-infra/containers-docker/ports-volumes-env
chapter: deployment-and-infra/containers-docker
title: 컨테이너 다루기 — 포트·볼륨·환경변수
mastery: required
lesson_kind: lesson
estimated_minutes: 55
tags: [docker, ports, volumes, bind-mount, environment-variables]
related_material_ids: []
sources:
  - title: "Publishing ports"
    url: https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Persisting container data"
    url: https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Sharing local files with containers"
    url: https://docs.docker.com/get-started/docker-concepts/running-containers/sharing-local-files/
    publisher: "Docker, Inc."
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Running containers (docker run options)"
    url: https://docs.docker.com/engine/containers/run/
    publisher: "Docker, Inc."
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - deployment-and-infra/containers-docker/dockerfile-and-build
code_examples:
  - slug: run-flags
    title: docker run 자주 쓰는 플래그
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      docker run \
        -d \                       # detached: 백그라운드로 (로그는 docker logs 로)
        --name api \               # 컨테이너 이름 (안 주면 랜덤)
        --rm \                     # 종료 시 컨테이너 자동 삭제
        -p 3000:3000 \             # 포트 발행 (host:container)
        -e NODE_ENV=production \   # 환경변수 주입
        --env-file .env \          # 파일에서 여러 개 주입
        -v pgdata:/var/lib/postgresql/data \  # named volume (데이터 영속)
        myapp:1.0

      docker run -it ubuntu sh     # -i(stdin) + -t(TTY) = 대화형 셸
  - slug: ports
    title: 포트 발행 — 네트워크 격리 뚫기
    source_type: generated_minimal
    language: bash
    code: |
      # 컨테이너는 기본적으로 호스트와 분리된 샌드박스 → 안의 서버에 직접 접근 불가
      docker run -d -p 8080:80 nginx        # 호스트 8080 → 컨테이너 80
      docker run -d -p 127.0.0.1:5432:5432 postgres  # 특정 IP 에만 바인딩(로컬만)
      # ⚠️ -p 만 쓰면 기본 0.0.0.0(모든 인터페이스) → DB 등 민감 포트는 127.0.0.1 로 제한
      # EXPOSE(Dockerfile)는 문서화일 뿐, 발행은 -p / Compose 에서
  - slug: volumes
    title: 데이터 영속화 — 볼륨 vs 바인드 마운트
    source_type: generated_minimal
    language: bash
    code: |
      # 컨테이너 안 파일 변경은 컨테이너를 지우면 함께 사라진다.

      # named volume: Docker 가 관리하는 저장소. DB 데이터 영속에 적합
      docker run -d -v pgdata:/var/lib/postgresql/data postgres
      docker rm -f <컨테이너>              # 컨테이너를 지워도
      docker run -d -v pgdata:/var/lib/postgresql/data postgres  # 데이터는 유지

      # bind mount: 호스트의 실제 경로를 컨테이너에 연결. 개발 중 소스 실시간 공유
      docker run -d -v "$(pwd)":/app -v /app/node_modules myapp:dev
      #             호스트 현재 폴더 → /app,  node_modules 는 컨테이너 것 유지

      docker volume ls        # 볼륨 목록
      docker volume rm pgdata # 삭제 (데이터 완전 소멸 — 주의)
  - slug: env-timing
    title: 환경변수 — 빌드타임 vs 런타임
    source_type: generated_minimal
    language: text
    code: |
      ENV (Dockerfile)      → 이미지에 굳는다 (빌드타임). 값이 이미지에 박힘
      docker run -e / --env-file → 컨테이너 실행 시 주입 (런타임). 이미지 재빌드 불필요
      Compose: environment: / env_file:

      시크릿(DB 비번, API 키)은 ENV/COPY 로 이미지에 넣지 않는다 → 레이어에 영구히 남는다.
      런타임 주입 + .env 는 .gitignore.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `docker run` 의 핵심 플래그(`-d`/`-it`/`--name`/`--rm`/`-p`/`-v`/`-e`/`--env-file`)를 안다.
- **포트 발행(`-p host:container`)** 으로 컨테이너의 네트워크 격리를 의도적으로 뚫는다. `EXPOSE` 와의 차이도.
- 컨테이너가 **일시적**이라는 성질과, **볼륨**(영속) / **바인드 마운트**(개발 중 소스 공유)를 구분한다.
- 환경변수의 **빌드타임(`ENV`) vs 런타임(`-e`/`--env-file`)** 차이와, 시크릿을 이미지에 굽지 않는 이유를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Dockerfile로 이미지 만들기(`EXPOSE`, `ENV`), 이미지/컨테이너 개념.
- "서버가 포트에서 리슨한다"는 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- "컨테이너는 떴는데 브라우저에서 안 보인다" → 포트 발행 안 함.
- "컨테이너를 지웠더니 DB 데이터가 다 날아갔다" → 볼륨 안 씀.
- "코드를 고쳐도 컨테이너 안 반영된다" → 개발 중 바인드 마운트 안 씀.
- ".env 를 이미지에 COPY 했더니 히스토리에 비번이 남았다" → 런타임 주입 안 씀.

<!-- section: concept -->
## 1. docker run 플래그

{{code: run-flags}}

- `-d` 백그라운드(로그는 `docker logs`), `-it` 대화형 셸, `--name` 이름, `--rm` 종료 시 자동 삭제.

<!-- section: mechanism -->
## 2. 포트 발행

{{code: ports}}

- 컨테이너는 기본적으로 **완전히 분리된 샌드박스** — 안의 서비스에 직접 접근 못 한다.
- `-p HOST:CONTAINER` 로 포워딩. `HOST_IP:HOST:CONTAINER` 로 특정 IP(예: `127.0.0.1`)에만 바인딩.
- **`-p` 만 쓰면 기본이 `0.0.0.0`**(모든 인터페이스) → DB 같은 민감 포트는 `127.0.0.1` 로 제한.
- `EXPOSE`(Dockerfile)는 **문서화**일 뿐 — 발행은 `-p`/`-P`/Compose 에서 명시해야 한다.

<!-- section: concept | title: 볼륨 -->
## 3. 데이터 영속화

{{code: volumes}}

- 컨테이너 안 파일 변경은 **컨테이너를 지우면 함께 사라진다**.
- **named volume**: Docker가 관리하는 저장소. `-v 이름:/컨테이너경로`. 없으면 자동 생성. DB 데이터 영속에.
  컨테이너를 지웠다 새로 띄워도 같은 볼륨을 붙이면 데이터 유지. 여러 컨테이너가 공유 가능.
- **bind mount**: 호스트의 **실제 경로**를 컨테이너에 연결. `-v /호스트:/컨테이너`. **개발 중 소스 실시간 공유**에.
  (`--mount type=bind,...` 가 더 명시적 — 프로덕션 권장.)
- `docker volume ls/rm/prune`. `volume rm` 은 데이터를 완전히 지운다.

<!-- section: concept | title: 환경변수 -->
## 4. 환경변수 타이밍

{{code: env-timing}}

- **`ENV`(Dockerfile) = 빌드타임**, 이미지에 값이 박힌다. **`-e`/`--env-file` = 런타임**, 이미지 재빌드 불필요.
- **시크릿은 `ENV`/`COPY` 로 이미지에 넣지 않는다** — 레이어에 영구히 남는다. 런타임 주입 + `.env` 는 `.gitignore`.

<!-- section: must_know -->
## 반드시 기억할 것

- 네트워크: `-p HOST:CONTAINER`. `-p` 만이면 `0.0.0.0` → 민감 포트는 `127.0.0.1:`로 제한. `EXPOSE` 는 문서화.
- 데이터: 컨테이너는 일시적. **named volume = 영속**(DB), **bind mount = 개발 중 소스 공유**.
- 환경변수: **`ENV` 빌드타임(이미지에 박힘)** vs **`-e`/`--env-file` 런타임(주입)**. 시크릿은 런타임만.
- `docker run` 플래그: `-d`/`-it`/`--name`/`--rm`.
- 볼륨 삭제(`docker volume rm`)는 데이터 완전 소멸 — 확인 후.

<!-- section: experiment -->
## 직접 해 보기

1. `docker run -d nginx` (포트 없이) 후 `localhost` 접속 실패 확인 → `-p 8080:80` 붙여 재실행.
2. `docker run -d -p 127.0.0.1:5432:5432 postgres` 와 `-p 5432:5432` 를 비교(외부 접근 차이).
3. `postgres` 를 named volume 없이 띄워 데이터 넣고 `docker rm -f` → 새로 띄우면 데이터가 없는 걸 확인. 그다음 `-v pgdata:...` 로 반복해 유지되는 걸 확인.
4. 개발용으로 `-v "$(pwd)":/app` 바인드 마운트 후 호스트에서 소스를 고쳐 컨테이너에 즉시 반영되는지 확인.
5. `.env` 파일을 만들어 `--env-file .env` 로 주입하고, 컨테이너 안에서 `printenv` 로 확인.
6. `ENV SECRET=...` 를 Dockerfile에 넣고 `docker image history` 로 값이 노출되는지 확인한 뒤 제거.

<!-- section: check_question -->
## 이해 점검

1. 컨테이너의 웹서버가 브라우저에서 안 보인다. 무엇을 안 했나?
2. `-p 5432:5432` 와 `-p 127.0.0.1:5432:5432` 의 차이는?
3. named volume 과 bind mount 는 각각 언제 쓰나?
4. `ENV` 로 넣은 값과 `-e` 로 넣은 값은 무엇이 다른가?
5. API 키를 Dockerfile `ENV` 에 넣으면 왜 위험한가?

<!-- section: interview_question -->
## 면접 대비

- "컨테이너의 포트 격리와 발행 메커니즘을 설명해 주세요."
- "컨테이너에서 데이터를 영속화하는 방법과 볼륨/바인드 마운트의 차이는?"
- "컨테이너에 시크릿을 안전하게 전달하는 방법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> -p host:container(EXPOSE는 문서화, 민감 포트는 127.0.0.1), volume=영속/bind mount=개발 소스,
> ENV 빌드타임 vs -e/--env-file 런타임, 시크릿은 런타임만을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**컨테이너는 격리·일시적이라 `-p HOST:CONTAINER` 로 포트를 뚫고(민감 포트는 `127.0.0.1:`), named volume으로
데이터를 영속화하며(개발 중엔 bind mount로 소스 공유), 환경변수는 `ENV`(빌드타임·이미지에 박힘) 대신
`-e`/`--env-file`(런타임)로 주입하고 시크릿은 절대 이미지에 굽지 않는다.**
