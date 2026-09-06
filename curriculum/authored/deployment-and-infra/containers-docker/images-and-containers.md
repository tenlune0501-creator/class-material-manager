---
id: deployment-and-infra/containers-docker/images-and-containers
chapter: deployment-and-infra/containers-docker
title: 이미지와 컨테이너의 차이
mastery: understand
lesson_kind: lesson
estimated_minutes: 50
tags: [docker, container, image, vm, layers]
related_material_ids: []
sources:
  - title: "What is a container?"
    url: https://www.docker.com/resources/what-container/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "What is an image?"
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
  - title: "Docker overview"
    url: https://docs.docker.com/get-started/docker-overview/
    publisher: "Docker, Inc."
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - deployment-and-infra/node-app-hosting/gcp-vm-deploy
  - deployment-and-infra/static-hosting/github-pages
code_examples:
  - slug: run-hello-world
    title: 이미지를 받아 컨테이너로 한 번 실행
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      # 로컬에 이미지가 없으면 레지스트리(Docker Hub)에서 pull 한 뒤,
      # 그 이미지로 컨테이너를 하나 만들어 실행하고, 끝나면 컨테이너는 멈춘다.
      docker run hello-world

      docker image ls        # 방금 받은 이미지가 목록에 있다 (설계도는 남는다)
      docker ps -a           # 방금 만든 컨테이너가 Exited 상태로 남아 있다 (실행 흔적)
  - slug: run-ubuntu-shell
    title: 같은 이미지로 컨테이너 2개 — 서로 격리됨
    source_type: generated_minimal
    language: bash
    code: |
      # 터미널 A
      docker run -it --name box1 ubuntu bash
      #  (컨테이너 안) touch /hello.txt && ls /

      # 터미널 B — 같은 ubuntu 이미지, 다른 컨테이너
      docker run -it --name box2 ubuntu bash
      #  (컨테이너 안) ls /        → box1 에서 만든 /hello.txt 가 여기엔 없다

      # box1 을 지우고 같은 이미지로 다시 만들면 /hello.txt 는 사라진다
      docker rm -f box1
      docker run -it --name box1b ubuntu bash
      #  (컨테이너 안) ls /        → 깨끗한 초기 상태. 이미지는 안 바뀌었다.
  - slug: image-layers
    title: 이미지는 레이어의 스택
    source_type: generated_minimal
    language: bash
    code: |
      docker pull node:24-alpine
      docker image history node:24-alpine
      # 여러 줄이 나온다 = 여러 레이어. 각 레이어는 파일시스템 변경분 하나.
      # base 이미지(alpine) 위에 Node 를 얹은 레이어들이 쌓여 있다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **컨테이너**가 무엇이고 **가상 머신(VM)과 어떻게 다른지**(OS 가상화 vs 하드웨어 가상화,
  호스트 커널 공유) 설명할 수 있다.
- **이미지 ↔ 컨테이너**의 관계를 "읽기 전용 설계도 ↔ 실행 인스턴스"로 설명하고,
  이미지가 **레이어의 스택이며 불변(immutable)**이라는 것을 안다.
- `docker run` 이 하는 일(이미지 + 쓰기 가능 레이어 + 격리된 프로세스)을 말할 수 있고,
  `docker run` / `docker ps` / `docker image ls` 로 그 관계를 직접 확인할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- **셸 기본** — 명령과 플래그(`-it`, `--name` 같은 옵션), 환경변수.
- **웹 앱이 "포트에서 리슨한다"** — `localhost:3000` 에 서버가 뜬다는 감각.
  (→ `deployment-and-infra/node-app-hosting/gcp-vm-deploy` 에서 Express 를 VM 에 올려 본 경험)
- **VM 에 앱을 직접 올려 본 경험 1회** — 이 Lesson은 "VM 마다 OS를 통째로" vs
  "컨테이너는 커널을 공유"의 대비로 시작한다.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"내 컴퓨터에선 되는데 서버에선 안 돼요."

- 로컬은 Node 24, 서버는 Node 18.
- 로컬엔 있는 시스템 라이브러리가 서버엔 없다.
- 환경변수 하나를 안 옮겼다.

VM 에 직접 배포하면 이걸 **매번 손으로 맞춰야** 한다. OS 버전, 런타임, 패키지, 설정.
그리고 다음 앱을 올릴 때 또 처음부터.

컨테이너는 **"코드 + 런타임 + 의존성 + 설정"을 하나로 묶어**, 로컬에서 만든 그 묶음을
서버에서 **그대로** 실행한다. 옮기는 것은 "코드"가 아니라 "실행 환경 전체"다.

<!-- section: concept -->
## 컨테이너 = OS를 가상화한 격리 실행 단위 (vs VM)

공식 정의(요약): 컨테이너는 **애플리케이션 코드와 그 모든 의존성을 패키징해, 한 컴퓨팅
환경에서 다른 환경으로 앱이 빠르고 안정적으로 실행되게 하는 표준 소프트웨어 단위**다.

| | 컨테이너 | 가상 머신(VM) |
|---|---|---|
| 무엇을 가상화 | **OS** (호스트 커널을 공유) | **하드웨어** (VM 마다 게스트 OS 전체) |
| 크기 | 수십 MB | 수십 GB |
| 기동 시간 | 초 단위 | 분 단위 |
| 격리 방식 | 리눅스 커널 기능(namespaces, cgroups)으로 프로세스·파일시스템·네트워크를 분리 | 하이퍼바이저가 가상 하드웨어를 분리 |

즉 컨테이너는 "가벼운 VM"이 아니라 **격리된 프로세스**에 가깝다. 그래서 한 호스트에서
수십 개를 띄워도 부담이 적다.

<!-- section: concept | title: 이미지 = 읽기 전용 설계도 -->
## 이미지 = 읽기 전용 설계도, 레이어, 불변

공식 정의: 이미지는 **"컨테이너 실행에 필요한 모든 파일·바이너리·라이브러리·설정을 담은
표준화된 패키지"** 이자 **"컨테이너를 만들기 위한 명령이 담긴 읽기 전용 템플릿"** 이다.

세 가지만 기억하면 된다.

1. **레이어의 스택**이다. 각 레이어는 파일시스템 변경분 하나(파일 추가/삭제/수정).
   `node:24-alpine` = `alpine` base 위에 Node 를 얹은 레이어들.
2. **불변(immutable)** — 한 번 만든 이미지는 못 고친다. "고친다"가 아니라
   **위에 새 레이어를 얹거나, 새 이미지를 만든다.**
3. **태그**로 버전을 가리킨다(`node:24-alpine`, 안 붙이면 `latest`).

{{code: image-layers}}

<!-- section: mechanism -->
## 컨테이너 = 이미지의 실행 인스턴스, `docker run` 이 만드는 것

공식 정의: 컨테이너는 **"이미지의 실행 가능한 인스턴스(a runnable instance of an image)"**.
생성·시작·정지·삭제할 수 있고, **격리된 파일시스템과 네트워킹**을 가진다.

`docker run <이미지>` 를 실행하면 Docker 는:

1. 로컬에 이미지가 없으면 레지스트리에서 **pull** 한다.
2. 그 (읽기 전용) 이미지 위에 **얇은 쓰기 가능 레이어**를 하나 얹는다.
3. 그 위에서 **격리된 프로세스**를 시작한다 — 자기만의 파일시스템·네트워크·프로세스 공간.
4. 프로세스가 끝나면 컨테이너는 **멈춘다**(`Exited`). 지우기 전까지 흔적은 남는다.

핵심은 **"이미지는 여럿이 공유하는 설계도, 컨테이너는 그때그때 만드는 일회성 실행"** 이다.
컨테이너 안에서 만든 파일은 그 **쓰기 가능 레이어**에만 있고, 컨테이너를 지우면 함께 사라진다
(영속화는 다음 Lesson의 볼륨).

<!-- section: code | lang: bash -->
## 직접 확인 1 — 이미지는 남고, 컨테이너는 일회성

{{code: run-hello-world}}

<!-- section: code | lang: bash -->
## 직접 확인 2 — 같은 이미지, 격리된 컨테이너들

{{code: run-ubuntu-shell}}

<!-- section: code_breakdown -->
## 무엇을 본 것인가

- `docker run hello-world` → 이미지 pull → 컨테이너 1개 생성·실행·종료.
  `docker image ls` 에 **이미지는 남는다**(설계도). `docker ps -a` 에 **컨테이너도 남는다**(멈춘 상태).
- `box1` 에서 만든 `/hello.txt` 가 `box2` 에 **없다** → 두 컨테이너는 같은 이미지에서 나왔지만
  파일시스템이 **격리**돼 있다.
- `box1` 을 지우고 같은 이미지로 다시 만들면 초기 상태 → **이미지는 안 바뀌었다.**
  컨테이너의 변경은 그 컨테이너의 쓰기 레이어에만 있었다.

<!-- section: must_know -->
## 반드시 기억할 것

- **이미지 = 읽기 전용 설계도 (레이어 스택, 불변).** 컨테이너 = 그 이미지의 실행 인스턴스.
- `docker run` = pull(필요 시) + 쓰기 레이어 + 격리된 프로세스 시작.
- 컨테이너 안에서 바꾼 파일은 **컨테이너를 지우면 사라진다.** (영속화 = 볼륨, 다음 Lesson)
- 컨테이너는 **기본적으로 네트워크·파일시스템이 호스트와 분리**돼 있다.
  포트로 접근하려면 발행(`-p`), 파일을 공유하려면 마운트(`-v`)를 **명시**해야 한다.
- 자주 쓰는 명령: `docker run`, `docker ps` / `docker ps -a`, `docker image ls`,
  `docker rm -f`, `docker image history`.

<!-- section: experiment -->
## 직접 바꿔 보기

1. `docker run --rm hello-world` 로 실행한 뒤 `docker ps -a` 를 보라.
   `--rm` 이 있으면 종료 즉시 컨테이너가 **자동 삭제**된다(흔적 없음).
2. `docker run -d nginx` 로 백그라운드 실행한 뒤 `docker ps` → 실행 중.
   `docker logs <컨테이너>` 로 로그를 보고, `docker stop <컨테이너>` 로 멈춰 보라.
   브라우저에서 접속은 **안 된다** — 포트를 발행하지 않았기 때문(다음 Lesson).
3. `docker image ls` 로 `ubuntu` 와 `node:24-alpine` 의 크기를 비교하라.
   `alpine` 기반이 왜 훨씬 작은지 생각해 보라(base 레이어 차이).

<!-- section: project_link -->
## 실제로 겪은 것 — Supabase 로컬 스택

Supabase CLI 로 로컬 개발 스택을 띄우면, 내부적으로 **Postgres · Auth(GoTrue) · Realtime ·
Storage 등을 각각 별도 컨테이너로** 실행한다. `docker ps` 를 쳐 보면 `supabase_db_...`,
`supabase_auth_...` 같은 컨테이너가 여러 개 떠 있다 — 이게 "멀티 컨테이너 앱"(다음다음 Lesson의 Compose)의 실물이다.

프로젝트 이관 때 겪은 **"DB URL 호스트를 Docker 컨테이너가 DNS로 해석하지 못함"** 에러도
이 Lesson의 개념이다: 컨테이너는 **호스트와 네트워크가 격리**돼 있어서, 컨테이너 안에서
호스트 이름을 그냥 쓴다고 풀리지 않는다. (그래서 Session pooler 주소로 우회했다.)
"왜 그 에러가 났는지"를 이제 한 문장으로 설명할 수 있어야 한다.

<!-- section: delegatable -->
## 지금 깊이 안 파도 되는 것

- **OCI 스펙**(이미지·런타임 표준) — "표준이 있다" 정도만.
- **네임스페이스/cgroups 의 커널 내부 동작** — 격리가 "커널 기능으로 된다"는 사실이면 충분.
- **레지스트리 운영**(Docker Hub rate limit, 프라이빗 레지스트리, `docker push`) — CI Lesson에서.
- **이미지 빌드 캐시 최적화** — Dockerfile Lesson 이후.

<!-- section: mission -->
## 미션

1. `node:24-alpine` 이미지로 컨테이너에 들어가(`docker run -it --rm node:24-alpine sh`)
   `node -v` 를 확인하라. 나온 뒤 그 컨테이너가 없는 것을 `docker ps -a` 로 확인하라.
2. 같은 이미지로 컨테이너 2개를 띄우고, 각각 다른 파일을 만든 뒤, 서로 안 보이는 것을 확인하라.
   한쪽을 지우고 다시 만들었을 때 파일이 사라지는 것도 확인하라.
3. "우리 회사가 VM 대신 컨테이너로 옮기면 좋은 점 3가지, 주의할 점 1가지"를
   이 Lesson의 용어(커널 공유·격리·불변 이미지·일회성 컨테이너)로 5줄 이내로 써라.

<!-- section: check_question -->
## 이해 점검

1. 이미지와 컨테이너의 관계를 한 문장으로 설명하라.
2. `docker run` 을 실행하면 순서대로 무슨 일이 일어나나?
3. 컨테이너 안에서 만든 파일이 컨테이너를 지우면 사라지는 이유는?
4. 컨테이너가 VM 보다 가볍고 빠르게 뜨는 근본 이유는?

<!-- section: interview_question -->
## 면접 대비

- "컨테이너와 가상 머신의 차이를 격리·성능 관점에서 설명해 주세요."
- "Docker 이미지가 레이어로 구성된다는 게 무슨 뜻이고, 왜 그렇게 만드나요?"
- "'이미지는 불변이다'라는 말의 의미와, 그럼 이미지를 어떻게 바꾸나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 컨테이너 vs VM 을 한 문장, 이미지 vs 컨테이너를 한 문장, `docker run` 의 4단계,
> "컨테이너 안 변경이 사라지는 이유"를 각각 답하기. 그다음 Supabase 로컬 스택의 DNS 에러를
> 이 Lesson 용어로 설명하기.

<!-- section: review -->
## 한 줄 정리

**이미지는 여럿이 공유하는 읽기 전용·불변 설계도(레이어 스택)이고, 컨테이너는 `docker run`
이 그 위에 쓰기 레이어와 격리된 프로세스를 얹어 만든 일회성 실행 인스턴스다.**
