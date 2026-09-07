---
id: deployment-and-infra/containers-docker/compose
chapter: deployment-and-infra/containers-docker
title: Docker Compose로 멀티 컨테이너
mastery: practical
lesson_kind: lesson
estimated_minutes: 55
tags: [docker, compose, multi-container, networking, dns]
related_material_ids: []
sources:
  - title: "Multi-container applications"
    url: https://docs.docker.com/get-started/docker-concepts/running-containers/multi-container-applications/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Docker Compose: features and uses"
    url: https://docs.docker.com/compose/intro/features-uses/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "History and development of Docker Compose (V1 vs V2)"
    url: https://docs.docker.com/compose/intro/history/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - deployment-and-infra/containers-docker/ports-volumes-env
code_examples:
  - slug: compose-yaml
    title: compose.yaml — web + db
    source_type: generated_minimal
    language: yaml
    is_canonical: true
    code: |
      services:
        web:
          build: .                     # 현재 폴더의 Dockerfile 로 이미지 빌드
          ports:
            - "3000:3000"              # docker run -p 와 동일
          environment:
            DB_HOST: db                # ← db 라는 "서비스 이름"으로 접속 (Compose DNS)
            DB_USER: app
          depends_on:
            - db                       # db 를 먼저 시작 (기동 순서일 뿐, "준비 완료"는 아님)
        db:
          image: postgres:16
          environment:
            POSTGRES_USER: app
            POSTGRES_PASSWORD: secret  # 학습용. 실제는 .env / secrets 로
          volumes:
            - pgdata:/var/lib/postgresql/data   # 데이터 영속

      volumes:
        pgdata:
      # version: top-level 요소는 이제 무시된다(Compose Specification 이 통합)
  - slug: commands
    title: 기동/정리 명령
    source_type: generated_minimal
    language: bash
    code: |
      docker compose up -d        # 스택 전체 기동 (백그라운드)
      docker compose up --build   # 이미지 다시 빌드하며 기동
      docker compose ps           # 이 스택의 컨테이너 상태
      docker compose logs -f web  # 특정 서비스 로그 팔로우
      docker compose down         # 컨테이너·네트워크 정리 (볼륨은 유지)
      docker compose down -v      # 볼륨까지 삭제 (데이터 소멸 — 주의)
      # ⚠️ 명령은 "docker compose"(공백). 낡은 튜토리얼의 "docker-compose"(하이픈)는 V1
  - slug: networking
    title: Compose 네트워킹 — 서비스 이름이 곧 호스트
    source_type: generated_minimal
    language: text
    code: |
      Compose 는 스택마다 기본 네트워크를 자동 생성하고 모든 서비스를 거기 참여시킨다.
      → 서비스는 서로를 "서비스 이름"으로 찾는다 (내부 DNS). IP 를 알 필요가 없다.
        web 컨테이너에서:  postgres://app@db:5432/app   ← "db" = services.db
      ports: 로 발행한 것만 호스트에서 접근 가능. 서비스 간 통신은 발행 없이도 됨.
  - slug: v1-v2
    title: V1 vs V2 (버전 주의)
    source_type: generated_minimal
    language: text
    code: |
      V1: Python 구현, 2014. 명령 `docker-compose`(하이픈). legacy.
      V2: Go 구현, 2020. 명령 `docker compose`(공백). 현행.
      낡은 자료를 따라 `docker-compose up` 을 치면 혼란 → `docker compose` 로.
      (V1 의 정확한 제거 일자는 공식 문서에 명시가 없어 이 Lesson 도 단정하지 않는다.)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`compose.yaml`** 로 web + db 같은 멀티 컨테이너 앱을 한 파일에 정의한다.
- `docker compose up/down` 으로 스택 전체를 한 번에 기동·정리한다.
- Compose가 만드는 **기본 네트워크 + 서비스 이름 DNS**(IP 없이 서로 접속)를 이해한다.
- `docker run` 플래그가 Compose의 어떤 키(`ports`/`environment`/`volumes`/`build`)에 대응하는지 안다.
- **V1(`docker-compose`) vs V2(`docker compose`)** 를 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `docker run` 의 `-p`/`-e`/`-v`, Dockerfile 빌드, 볼륨.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

앱 컨테이너 + DB 컨테이너 + (캐시) 컨테이너를 `docker run` 3~4번으로 매번 띄우고, 네트워크로 잇고,
정리하는 건 실수투성이다. **개발 환경 전체를 한 파일 + 한 명령**으로 만드는 게 Compose다.
(참고: Supabase CLI의 로컬 스택도 여러 컨테이너를 함께 띄우는 같은 성격이다.)

<!-- section: code | lang: yaml -->
## 1. compose.yaml

{{code: compose-yaml}}

- `services:` 아래 각 서비스 = 컨테이너 하나(또는 replica).
- `build: .` = 그 폴더의 Dockerfile로 빌드. `image: postgres:16` = 공개 이미지 사용.
- `ports` / `environment` / `volumes` = `docker run` 의 `-p` / `-e` / `-v` 와 같다.
- `depends_on` = **기동 순서**만 보장(그 서비스가 "요청 받을 준비" 됐다는 뜻은 아님 — 헬스체크/재시도 별도).
- `version:` top-level 은 이제 무시된다(Compose Specification이 통합).

<!-- section: mechanism -->
## 2. 기동/정리

{{code: commands}}

<!-- section: concept | title: 네트워킹 -->
## 3. 네트워킹 — 서비스 이름이 호스트

{{code: networking}}

Compose는 스택마다 **기본 네트워크를 자동 생성**하고 모든 서비스를 참여시킨다. 그래서 서비스는
서로를 **서비스 이름**으로 찾는다(내부 DNS) — `web` 에서 DB는 `db:5432`. IP를 알 필요가 없다.
`ports:` 로 발행한 것만 **호스트**에서 접근 가능하고, 서비스 간 통신은 발행 없이도 된다.

<!-- section: concept | title: V1 vs V2 -->
## 4. V1 vs V2

{{code: v1-v2}}

<!-- section: must_know -->
## 반드시 기억할 것

- `compose.yaml` `services:` — 각 서비스가 컨테이너. `build`/`image`/`ports`/`environment`/`volumes`.
- `docker compose up -d` / `down`(볼륨 유지) / `down -v`(볼륨 삭제).
- **명령은 `docker compose`(공백)**. `docker-compose`(하이픈)는 구버전 V1.
- Compose가 **기본 네트워크 + 서비스 이름 DNS** 제공 → 서비스끼리 이름으로 접속, IP 불필요.
- `depends_on` 은 기동 순서일 뿐, "준비 완료" 아님(헬스체크/재시도로 보완).
- `ports:` 발행은 호스트 접근용. 서비스 간 통신은 발행 없이 됨.
- DB 비번 등은 `.env`/secrets 로(YAML에 평문 금지).

<!-- section: experiment -->
## 직접 해 보기

1. Express 앱 + `postgres:16` 를 `compose.yaml` 로 정의하고 `docker compose up -d` 로 띄워라.
2. 앱에서 DB 접속 호스트를 `localhost` 로 두면 실패, `db`(서비스 이름)로 바꾸면 성공하는 걸 확인하라.
3. `docker compose ps` / `logs -f` 로 상태·로그를 보라.
4. `docker compose down` → `up` 후 DB 데이터가 유지되는지, `down -v` 후엔 사라지는지 비교하라.
5. `db` 서비스에 `ports:` 를 빼도 `web` 에서 접속되는지 확인하라(서비스 간 통신은 발행 불필요).
6. `docker-compose`(하이픈)을 쳐 보고 `docker compose`(공백)와의 차이를 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `docker run -p 3000:3000 -e X=1` 은 compose.yaml의 어느 키들에 대응하나?
2. `web` 컨테이너에서 DB에 접속할 때 호스트로 무엇을 쓰나? 왜 IP가 필요 없나?
3. `depends_on` 이 보장하는 것과 보장하지 않는 것은?
4. `docker compose down` 과 `down -v` 의 차이는?
5. `docker-compose`(하이픈)와 `docker compose`(공백)의 차이는?

<!-- section: interview_question -->
## 면접 대비

- "Docker Compose가 만들어 주는 네트워크와 서비스 디스커버리를 설명해 주세요."
- "`depends_on` 만으로 DB 준비를 보장할 수 없는 이유와 대안은?"
- "개발 환경을 Compose로 구성할 때의 이점은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> compose.yaml services(build/image/ports/environment/volumes), up/down/down -v,
> 기본 네트워크 + 서비스 이름 DNS, depends_on은 순서만, docker compose(공백)를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Docker Compose는 `compose.yaml` 하나에 여러 서비스를 정의해 `docker compose up/down` 으로 스택 전체를
다루고, 자동 생성된 기본 네트워크에서 서비스는 **이름으로** 서로를 찾는다(IP 불필요) — 명령은
`docker compose`(공백, V2)이고 `depends_on` 은 기동 순서만 보장한다.**
