---
id: deployment-and-infra/containers-docker/logs-and-debugging
chapter: deployment-and-infra/containers-docker
title: 컨테이너 로그와 디버깅
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [docker, logs, exec, debugging, stdout]
related_material_ids: []
sources:
  - title: "docker container logs (CLI reference)"
    url: https://docs.docker.com/reference/cli/docker/container/logs/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "docker exec (CLI reference)"
    url: https://docs.docker.com/reference/cli/docker/container/exec/
    publisher: "Docker, Inc."
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - deployment-and-infra/containers-docker/ports-volumes-env
code_examples:
  - slug: logs
    title: docker logs
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      docker logs api                 # 컨테이너 api 의 STDOUT/STDERR 전체
      docker logs -f api              # -f/--follow: 실시간 스트리밍 (tail -f 처럼)
      docker logs --tail 100 api      # 끝에서 100줄만
      docker logs --since 5m api      # 최근 5분 (RFC3339 / 유닉스타임 / Go duration)
      docker logs -t api             # -t/--timestamps: 각 줄에 시각
      docker compose logs -f web     # Compose 스택의 특정 서비스
  - slug: stdout-rule
    title: 규칙 — 앱은 파일이 아니라 stdout/stderr 로
    source_type: generated_minimal
    language: text
    code: |
      docker logs 는 컨테이너의 STDOUT / STDERR 만 보여준다.
      앱이 로그를 파일(./app.log)에 쓰면 docker logs 로 안 보인다.
      → 컨테이너 안 앱은 콘솔(stdout/stderr)로 로그를 내보내야 한다.
        (12-factor: 로그는 이벤트 스트림. 파일 회전·수집은 플랫폼이 담당)
  - slug: exec
    title: 컨테이너 안으로 들어가 디버깅
    source_type: generated_minimal
    language: bash
    code: |
      docker exec -it api sh          # 실행 중 컨테이너에 셸 (alpine 은 sh, 없으면 bash)
      #   안에서:  env / ls / cat / ping db / wget -qO- localhost:3000/health

      docker ps                       # 실행 중 컨테이너 (Up / Exited 상태·포트 매핑)
      docker inspect api              # 설정·마운트·네트워크·환경변수 전체(JSON)
      docker stats                    # 실시간 CPU/메모리 사용량
  - slug: crashloop
    title: 계속 죽는 컨테이너 디버깅 순서
    source_type: generated_minimal
    language: text
    code: |
      1) docker ps -a        → 상태(Exited (코드)) 와 몇 번 재시작했는지 확인
      2) docker logs <c>     → 마지막 에러 메시지 (대개 여기서 원인이 나온다)
      3) 원인이 안 보이면:  docker run --rm -it <이미지> sh  로 손으로 명령을 하나씩 실행
      4) 네트워크 문제면:   docker exec -it <다른 컨테이너> ping/curl 로 서비스 이름 확인
      5) 환경변수 문제면:   docker exec -it <c> env  로 실제 주입된 값 확인
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`docker logs`**(+`-f`/`--tail`/`--since`/`-t`)로 컨테이너 로그를 본다.
- 로그가 컨테이너의 **STDOUT/STDERR** 만 보인다는 것과, 그래서 앱이 콘솔로 로그를 내보내야 함을 안다.
- **`docker exec -it <c> sh`** 로 실행 중 컨테이너에 들어가 디버깅한다.
- `docker ps -a` / `inspect` / `stats` 로 상태·설정·리소스를 확인한다.
- "계속 죽는 컨테이너" 를 진단하는 순서를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `docker run` 플래그, 포트/볼륨/환경변수, (Compose면) 서비스 이름 DNS.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

컨테이너는 "안이 안 보인다" 는 두려움이 있다. `docker run` 했는데 바로 꺼지고, 브라우저는
안 열리고, 왜인지 모르겠다. **로그 + 안으로 들어가기** 두 가지면 대부분 해결된다.

<!-- section: concept -->
## 1. docker logs

{{code: logs}}

- `docker logs <컨테이너>` = 그 컨테이너의 **STDOUT/STDERR** 조회.
- `-f`(follow) 실시간, `--tail N` 끝 N줄, `--since 5m`/`--since 2026-09-07T00:00:00` 시간 필터, `-t` 타임스탬프.
- Compose는 `docker compose logs -f <서비스>`.

<!-- section: mechanism -->
## 2. stdout/stderr 규칙

{{code: stdout-rule}}

`docker logs` 는 **콘솔 출력만** 본다. 앱이 로그를 파일에 쓰면 이 명령으로 안 보인다.
컨테이너 안 앱은 **콘솔(stdout/stderr)로** 로그를 내보내야 한다(12-factor: 로그 = 이벤트 스트림,
파일 회전·수집은 플랫폼 몫). Node의 `console.log`/`console.error` 는 그대로 stdout/stderr다.

<!-- section: concept | title: exec -->
## 3. 안으로 들어가기

{{code: exec}}

- **`docker exec -it <c> sh`** — 실행 중 컨테이너에 셸. `env`, `ls`, `cat`, `ping db`, `wget` 로
  "환경변수가 맞나", "다른 서비스가 보이나" 를 직접 확인.
- `docker ps -a` — 멈춘 것 포함 상태(`Exited (1)`)와 포트 매핑.
- `docker inspect <c>` — 마운트·네트워크·환경변수 전체(JSON). `docker stats` — 실시간 CPU/메모리.

<!-- section: concept | title: 크래시 -->
## 4. 계속 죽는 컨테이너

{{code: crashloop}}

<!-- section: must_know -->
## 반드시 기억할 것

- `docker logs <c>` (+`-f`/`--tail`/`--since`/`-t`). Compose는 `docker compose logs -f <svc>`.
- `docker logs` 는 **STDOUT/STDERR 만** — 앱은 파일이 아니라 콘솔로 로그를 내보낸다.
- **`docker exec -it <c> sh`** 로 실행 중 컨테이너에 들어가 `env`/`ping`/`curl` 로 확인.
- 멈춘 컨테이너는 `docker ps -a` 로 종료 코드, `docker logs` 로 마지막 에러.
- 손으로 재현: `docker run --rm -it <이미지> sh` 로 명령을 하나씩.
- `docker inspect`(설정) / `docker stats`(리소스).

<!-- section: experiment -->
## 직접 해 보기

1. 앱을 `docker run -d --name api ...` 로 띄우고 `docker logs -f api` 로 요청 로그를 실시간으로 보라.
2. 앱이 로그를 `./app.log` 파일에도 쓰게 한 뒤 `docker logs` 에는 안 나오는 걸 확인하라. `console.log` 로 바꿔 나오는지 확인.
3. `docker exec -it api sh` 로 들어가 `env` 로 환경변수가 기대대로인지, `ping db`(Compose) 로 DB 서비스가 보이는지 확인.
4. 일부러 잘못된 `DB_HOST` 로 컨테이너를 띄워 죽게 만들고, `docker ps -a` + `docker logs` 로 원인을 찾아라.
5. `docker run --rm -it <이미지> sh` 로 들어가 `node index.js` 를 손으로 실행해 에러를 재현하라.
6. `docker stats` 로 부하 중 CPU/메모리를 관찰하라.

<!-- section: check_question -->
## 이해 점검

1. 앱 로그가 `docker logs` 에 안 보인다. 왜일 수 있나?
2. `docker logs -f` 와 `--tail 100` 은 각각 무엇을 하나?
3. 실행 중 컨테이너 안에서 명령을 실행하려면?
4. 컨테이너가 바로 꺼졌다. 어떤 순서로 진단하나?
5. `docker ps` 와 `docker ps -a` 의 차이는?

<!-- section: interview_question -->
## 면접 대비

- "컨테이너 로깅에서 stdout/stderr 규칙과 그 이유(12-factor)를 설명해 주세요."
- "크래시 루프에 빠진 컨테이너를 어떻게 디버깅하나요?"
- "`docker exec` 와 `docker attach` 의 차이는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> docker logs -f/--tail/--since/-t, STDOUT/STDERR만(앱은 콘솔로), docker exec -it sh,
> ps -a/inspect/stats, 크래시 진단 순서를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**컨테이너 디버깅의 두 축은 `docker logs`(컨테이너의 STDOUT/STDERR — 그래서 앱은 콘솔로 로그를 내보낸다)
와 `docker exec -it <c> sh`(안에 들어가 `env`/`ping`/`curl` 확인)이고, 멈춘 컨테이너는 `docker ps -a` 의
종료 코드와 `docker logs` 의 마지막 에러부터 본다.**
