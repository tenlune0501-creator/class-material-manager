# 조사 영역: Docker / Infra

- 담당: Research Agent 2 (Docker / Infra)
- 대상 챕터: `deployment-and-infra/containers-docker` (`needs_external_research`)
- 조사일(checked_at): 2026-09-06
- 1차 출처: Docker 공식 문서(docs.docker.com, docker.com). 모든 채택 출처를 WebFetch 로 실제 페이지를 열어 확인함.

---

## 준비 상태 판정 — `deployment-and-infra/containers-docker`

**READY**

근거:
- 이 챕터의 스코프(컨테이너 개념 · 이미지 vs 컨테이너 · Dockerfile · build · run · ports · volumes · env · 네트워킹 · Compose · dev/prod 이미지 · 웹/백엔드 앱 컨테이너화 · 로그/디버깅)는 **전부 Docker 공식 문서 한 곳에서 1차 출처로 커버된다.** 개인 블로그 없이 official 문서만으로 집필 가능.
- 개념 정의(이미지 = "읽기 전용 템플릿", 컨테이너 = "이미지의 실행 인스턴스")와 컨테이너 vs VM 비교표가 공식 문서에 명시 문구로 존재 → 지어내지 않고 인용 가능.
- 사용자가 이미 **Docker Desktop + Supabase 로컬 스택(내부적으로 Docker 컨테이너) + 컨테이너 기반 로컬 검증** 실경험이 있음. 개념을 "이미 써 본 것의 원리 설명"으로 연결할 실전 앵커가 확보돼 있음(아래 "기존 Curriculum과 연결" 참조).
- 기존 CMM 자료에 Docker **교육용** 자료는 없음(아래 확인) → `needs_external_research` 표시는 정확했고, 이번 조사로 해소됨.

한계(집필 시 유의, READY 판정을 막지는 않음):
- 스코프에 Kubernetes 는 **넣지 않는다**. 선행 사슬만 표시(Docker → 컨테이너화된 백엔드 → 모델 서빙 → Kubernetes). 이번 라운드 K8s 레슨 없음.
- Compose V1(Python, `docker-compose`)의 정확한 EOL 날짜는 공식 "history" 페이지에 연도만 있고 일자가 없음 → `needs_followup`. 집필 시 "V2(`docker compose`)가 현행"만 단정하고 V1 폐기 일자는 각주 없이 쓰지 않는다.

**권장 첫 레슨: "Image와 Container의 차이"**
- 기존 골격의 레슨 id `deployment-and-infra/containers-docker/images-and-containers` (title "이미지와 컨테이너 기초", mastery `required`, 60분)에 그대로 대응.
- 진입점을 "이미지(설계도, 읽기 전용, 레이어) vs 컨테이너(실행 인스턴스, 쓰기 가능 레이어 + 격리된 프로세스)"로 잡고, `docker run`으로 이미지 → 컨테이너가 되는 순간을 실습 1개로 보여주는 구성.

---

## 기존 CMM 자료 확인

`data/index.json`, `data/materials/**`, `data/references/**`, `curriculum/**`, `project-learning/projects.yaml` 를 Docker/container/image/Dockerfile/Compose/Kubernetes/nginx/systemd/deployment/infra/VM 키워드로 스캔.

### Docker/컨테이너 교육용 자료: **없음**

`container` 매치는 대부분 CSS Container Queries · MUI `<Container>` · `className="container"` 로 무관.

### 주변부에서 Docker 가 언급되는 자료 (교육 자료 아님, 참고용)

| docId | title | Docker 관련 내용 | 지원 가능 챕터 |
|---|---|---|---|
| `1bPuO0PdIH9jPgvRFADOR-_mPcbdrP2KVpOH25Dgg5Qo` | 배포 | Koyeb/Render 비교표에 "배포 방식: GitHub 연동, **Docker**, CLI" 한 줄. Docker 설명은 없음. 본문은 json-server(Koyeb) + Next 정적 export(Vercel) 배포 실습. | `deployment-and-infra/node-app-hosting/platform-comparison` (이미 매핑됨), `containers-docker` 에는 "PaaS 가 Docker 로도 배포를 받는다"는 맥락 링크로만 사용 |
| `1NFB5KVAZTGy2GEmVAD80IGTl2xC5wpFh8kiGrPETHzY` | supabase - 프로젝트 이관 | **Docker Desktop 설치**, WSL/VirtualMachinePlatform 기능 활성화, "DB URL 호스트를 **Docker 컨테이너에서 DNS 로 해석하지 못함**" 트러블슈팅(→ Session pooler 로 회피). Supabase CLI(`supabase db dump`)가 내부적으로 Docker 컨테이너에서 도는 것을 사용자가 직접 겪은 기록. | `containers-docker` 의 **실전 앵커**로 직접 연결 가능(네트워킹/DNS·컨테이너가 호스트와 격리된다는 개념). 단 교육 자료로서의 설명은 없음 |
| `1MjC0nvq1rc_wQbO1st7P5_mUtCaROXGelLiSNub_aC4` | GCP - VM 생성 및 설정, 웹서버설치 | GCP e2-micro VM(Ubuntu) + MySQL + Express + (뒤쪽) nginx. **컨테이너 아님** — VM 위에 직접 설치. | `deployment-and-infra/node-app-hosting/gcp-vm-deploy` (이미 매핑됨). `containers-docker` 의 "VM 에 직접 설치 vs 컨테이너" 대비용 링크 |

### `data/references/**` (보조 공식 문서 캐시)
- Docker 공식 문서 캐시 없음.
- `data/references/supabase/INDEX.md` 에 `Supabase - Deployment & Branching` 링크 존재(Docker 무관).
- `data/references/nextjs/INDEX.md` 에 Next.js `Deploying` / `Deploying to Platforms` 링크(Docker 무관).

### `project-learning/projects.yaml`
- `unit_kind: infra` 유닛은 전부 Supabase SSR/미들웨어/인증 관련. Docker/컨테이너 유닛 없음.
- CMM 프로젝트 자체 설명에 "data/ 1차 저장소와 Supabase 이관 범위" 언급 — 인프라 개념은 Supabase 쪽에 몰려 있고 컨테이너는 없음.

**결론:** 이 챕터는 관련 `related_material_ids` 가 비어 있는 게 정상(`containers-docker/images-and-containers` 는 `related_material_ids: []`). 교육 본문은 100% 공식 문서 기반으로 신규 집필해야 하며, 사용자의 Docker Desktop/Supabase 로컬 경험을 `project_link` 성격의 실전 연결로 붙인다.

---

## 학습 목표

이 챕터(첫 레슨 기준)를 끝내면:

1. 컨테이너가 무엇이고 **가상 머신(VM)과 어떻게 다른지**(OS 가상화 vs 하드웨어 가상화, 호스트 커널 공유, 크기·기동 시간) 설명할 수 있다.
2. **이미지(image)**와 **컨테이너(container)**의 관계를 "설계도 ↔ 실행 인스턴스"로 설명하고, 이미지가 **레이어의 스택이며 불변(immutable)**이라는 것을 안다.
3. 최소한의 **Dockerfile**(`FROM`/`WORKDIR`/`COPY`/`RUN`/`ENV`/`EXPOSE`/`CMD`)을 읽고 쓸 수 있고, `docker build -t` 로 이미지를 만들 수 있다.
4. `docker run` 으로 컨테이너를 띄우고, `-d`/`-it`/`--name`/`--rm`/`-p`/`-v`/`-e` 의 의미를 안다.
5. 컨테이너가 **기본적으로 네트워크·파일시스템이 격리**돼 있음을 이해하고, **포트 발행(`-p host:container`)**과 **볼륨/바인드 마운트**로 그 격리를 의도적으로 뚫는 법을 안다.
6. **Docker Compose**(`compose.yaml`, `docker compose up/down`)로 여러 컨테이너를 한 번에 정의·기동하고, Compose 가 만들어 주는 기본 네트워크에서 **서비스 이름으로 서로를 찾는다(DNS)**는 것을 안다.
7. **개발용 이미지 vs 프로덕션 이미지**의 차이를 알고, **멀티스테이지 빌드**로 빌드 도구를 최종 이미지에서 제외하는 이유를 설명할 수 있다.
8. `docker logs -f` / `docker exec` 로 컨테이너 로그를 보고 안으로 들어가 디버깅하는 기본기를 익힌다.

---

## 선행 개념

이 챕터 앞에 있어야 하는 것:

- **셸 기본** — 명령·플래그·환경변수(`$PORT` 등). CMM `배포` 자료의 Koyeb `npm start -- --port $PORT` 수준이면 충분.
- **웹 앱이 "포트에서 리슨한다"는 개념** — `localhost:3000` 에 서버가 뜬다는 것. (`deployment-and-infra/node-app-hosting/gcp-vm-deploy` 의 Express 실행 경험과 연결)
- **하나의 앱 = 코드 + 런타임 + 의존성 + 설정**이라는 감각 — "내 컴퓨터에선 되는데" 문제를 겪어 봤을 것. CMM `supabase - 프로젝트 이관` 의 `.env`/시크릿 재등록 경험이 여기에 붙는다.
- **git / GitHub 레포** — 이후 CI 에서 이미지 빌드로 확장할 때. (`deployment-and-infra/ci-cd-github-actions/first-workflow` 와 인접)
- (권장) **VM 에 직접 배포 경험 1회** — `gcp-vm-deploy`. "VM 마다 OS 를 통째로" vs "컨테이너는 커널 공유"의 대비를 체감하게 함.

선행 레슨 id(저작·정렬 보조):
- `deployment-and-infra/node-app-hosting/gcp-vm-deploy`
- `deployment-and-infra/static-hosting/github-pages` (배포라는 행위 자체의 첫 경험)

---

## 권장 학습 순서

1. **Image와 Container의 차이** (첫 레슨, `images-and-containers`) — 컨테이너 개념 · vs VM · 이미지=레이어/불변 · `docker run hello-world` / `docker run -it ubuntu` 로 이미지→컨테이너 체험 · `docker ps` / `docker images`.
2. **Dockerfile 로 내 앱 이미지 만들기** — `FROM node` → `WORKDIR` → `COPY` → `RUN npm ci` → `EXPOSE` → `CMD`. `docker build -t myapp .` → `docker run -dp 3000:3000 myapp`. `.dockerignore`.
3. **컨테이너 다루기: 포트 · 볼륨 · 환경변수** — `-p` 로 포트 발행(EXPOSE 는 문서화일 뿐), `-v name:/path` 로 DB 데이터 영속화, 바인드 마운트로 개발 중 소스 공유, `-e` / `--env-file` 로 설정 주입.
4. **Docker Compose 로 멀티 컨테이너** — `compose.yaml` 에 web + db 정의, `docker compose up`, 기본 네트워크 + 서비스명 DNS, `docker compose down`.
5. **개발 이미지 vs 프로덕션 이미지 + 멀티스테이지** — `FROM ... AS build` / `COPY --from=build`, 최종 이미지에서 빌드 툴 제거, `--target` 로 dev 스테이지.
6. **로그와 디버깅** — 앱은 stdout/stderr 로 로그, `docker logs -f --tail`, `docker exec -it <c> sh`, `docker inspect`.

> 로드맵 링크(레슨 집필 대상 아님, 선행 사슬만): Docker → 컨테이너화된 백엔드 → 모델 서빙 → Kubernetes. 이번 라운드는 여기서 멈춘다.

---

## 필수 개념

### 1. 컨테이너란 무엇인가 (vs 가상 머신)

- **why**: 챕터 전체의 진입 개념. "왜 컨테이너를 쓰나 = 왜 VM 만으론 부족한가"를 못 세우면 나머지가 암기가 됨.
- **prerequisite**: VM 에 앱을 직접 올려 본 경험(`gcp-vm-deploy`), "환경 차이로 안 되는" 경험.
- **mastery 후보**: `understand`
- 핵심 인용(공식): 컨테이너 = "code and all its dependencies 를 패키징해 한 컴퓨팅 환경에서 다른 환경으로 앱이 빠르고 안정적으로 실행되게 하는 표준 소프트웨어 단위". 컨테이너는 **OS 를 가상화**(호스트 커널 공유, 수십 MB, 초 단위 기동), VM 은 **하드웨어를 가상화**(VM 마다 OS 전체 복사, 수십 GB). 리눅스 primitive(cgroups, namespaces) 기반.
- **source**: What is a container? / Docker overview
- **URL**: https://www.docker.com/resources/what-container/ · https://docs.docker.com/get-started/docker-overview/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current** (deprecated 표기 없음)
- **target chapter**: `deployment-and-infra/containers-docker`
- **lesson candidate**: "Image와 Container의 차이" (도입부)
- **license note**: 짧은 정의 문구만 인용, 표는 자체 재작성. Docker Docs 는 문서 재사용에 별도 CC 표기 없음 → 인용·요약만, 장문 복붙 금지.

### 2. 이미지 = 읽기 전용 템플릿, 레이어, 불변

- **why**: "이미지를 고친다"는 오개념 제거. 빌드 캐시·`docker pull`·태그를 이해하려면 레이어/불변성이 선행.
- **prerequisite**: 개념 1.
- **mastery 후보**: `required`
- 핵심(공식): 이미지 = "A read-only template with instructions for creating a Docker container" = "표준화된 패키지: 컨테이너 실행에 필요한 파일·바이너리·라이브러리·설정 전부". 이미지는 **레이어의 스택**(각 레이어 = 파일시스템 변경분, `docker image history` 로 확인), **한 번 만들면 불변** — 위에 새 레이어를 얹거나 새 이미지를 만들 뿐. **base image**(node, python 등) 위에 얹어 확장. 태그(`latest` 가 기본).
- **source**: What is an image? / Docker overview
- **URL**: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "Image와 Container의 차이"
- **license note**: 정의 1문장 인용, 나머지 재작성.

### 3. 컨테이너 = 이미지의 실행 인스턴스

- **why**: 개념 1·2 를 잇는 고리. `docker run` 이 하는 일 = 이미지 + 쓰기 가능 레이어 + 격리된 프로세스.
- **prerequisite**: 개념 1, 2.
- **mastery 후보**: `required`
- 핵심(공식): 컨테이너 = "A runnable instance of an image". 생성·시작·정지·삭제 가능. **격리된 파일시스템과 네트워킹**을 가짐. 이미지는 앱 바이너리, 컨테이너는 그 바이너리가 OS 위에서 도는 프로세스에 비유.
- **source**: Docker overview / What is an image?
- **URL**: https://docs.docker.com/get-started/docker-overview/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "Image와 Container의 차이"
- **license note**: 정의 인용만.

### 4. Dockerfile 로 이미지 만들기

- **why**: "내 앱을 이미지로" = 실무에서 실제로 쓰는 산출물. 레이어 개념(개념 2)의 실체.
- **prerequisite**: 개념 2, 셸/`npm` 기본.
- **mastery 후보**: `required`
- 핵심(공식): Dockerfile = "실행할 명령, 복사할 파일, 시작 명령 등을 담은 텍스트 문서"로 **container image 를 만든다**. 주요 명령: `FROM`(base image), `WORKDIR`(작업 디렉터리), `COPY`(호스트→이미지 파일 복사), `RUN`(빌드 중 명령 실행), `ENV`(실행 컨테이너의 환경변수), `EXPOSE`(이 이미지가 쓰는 포트 문서화), `USER`(기본 사용자), `CMD`(컨테이너 시작 시 기본 명령). 권장 순서: base image 선택 → 의존성 설치 → 소스/바이너리 복사 → 최종 설정. 공식 문서 자체가 "이 Dockerfile 은 아직 production-ready 아님"이라고 명시(→ 개념 8 로 이어짐).
- **source**: Writing a Dockerfile
- **URL**: https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "Dockerfile 로 내 앱 이미지 만들기"
- **license note**: 명령 목록은 사실, 예제는 자체 작성.
- **needs_followup**: `docker build` 명령 정확한 문법은 이 페이지에 없음 → build 레퍼런스(https://docs.docker.com/reference/cli/docker/buildx/build/ 또는 `docker build`)로 보강 필요.

### 5. `docker run` 과 컨테이너 라이프사이클

- **why**: 매일 치는 명령. 플래그의 의미를 모르면 복붙만 하게 됨.
- **prerequisite**: 개념 3.
- **mastery 후보**: `required`
- 핵심(공식): `docker run [OPTIONS] IMAGE [COMMAND]`. **foreground(기본) vs `-d`(detached, 백그라운드)** — detached 는 `docker logs` 로 출력 확인. `--name` 으로 컨테이너 이름 지정. `-i`(stdin 유지) + `-t`(pseudo-TTY) = `-it` 로 대화형 셸. `--rm` = 종료 시 컨테이너 자동 삭제. `-e "VAR=value"` 로 환경변수 주입(호스트 변수명만 줘서 전달도 가능). 관련 명령: `docker ps`(실행 중 목록), `docker logs`, `docker attach`.
- **source**: Running containers (Engine)
- **URL**: https://docs.docker.com/engine/containers/run/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "컨테이너 다루기: 포트·볼륨·환경변수"
- **license note**: 플래그 사실 요약.
- **needs_followup**: 이 페이지 요약 범위에서 `--env-file`, restart policy 는 확인 안 됨 → 별도 페이지(https://docs.docker.com/engine/containers/start-containers-automatically/) 보강.

### 6. 포트 발행 — 컨테이너 네트워크 격리 뚫기

- **why**: "컨테이너는 떴는데 브라우저에서 안 보임"의 원인·해법. 격리(개념 3)의 첫 실전 적용.
- **prerequisite**: 개념 5, "서버가 포트에서 리슨한다".
- **mastery 후보**: `required`
- 핵심(공식): 컨테이너는 기본적으로 호스트와 **완전히 분리된 샌드박스** → 안에서 도는 서비스에 직접 접근 불가. `-p`(`--publish`) `HOST_PORT:CONTAINER_PORT` 로 포워딩. `HOST_IP:HOST_PORT:CONTAINER_PORT` 로 특정 IP(예: `127.0.0.1`) 바인딩. **`EXPOSE` 는 문서화일 뿐 자동 발행 안 함** — `-p`/`-P`/Compose 로 명시해야 함. 예: `docker run -d -p 8080:80 nginx`, `docker run -P nginx`(EXPOSE 된 포트 전부 임의 호스트 포트로). 발행된 포트는 기본적으로 `0.0.0.0`(모든 인터페이스)에서 리슨 → DB 등 민감 포트 발행 주의.
- **source**: Publishing ports
- **URL**: https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "컨테이너 다루기: 포트·볼륨·환경변수"
- **license note**: 예제 명령은 공식 문서의 표준 예(nginx) — 짧아 인용 가능.

### 7. 데이터 영속화 — 볼륨과 바인드 마운트

- **why**: "컨테이너 지웠더니 DB 가 날아갔다". 컨테이너가 **일시적**이라는 성질의 실전 대응.
- **prerequisite**: 개념 3.
- **mastery 후보**: `required`
- 핵심(공식): 컨테이너 파일 변경은 **컨테이너 삭제 시 함께 삭제**됨. **볼륨** = 컨테이너 수명을 넘어 데이터를 영속. `docker run -d -v volume-name:/container/path image` — named volume 은 없으면 자동 생성. 대표 예: PostgreSQL `/var/lib/postgresql` 를 볼륨에 → 컨테이너 삭제해도 데이터 유지, 새 컨테이너에 재연결. 같은 볼륨을 여러 컨테이너에 붙여 공유 가능. 관리: `docker volume ls/rm/prune`. **바인드 마운트** = 호스트 실제 경로를 컨테이너에 연결(`-v /HOST:/CONTAINER` 또는 `--mount type=bind,source=,target=`), **개발 중 실시간 소스 공유**에 적합. `--mount` 가 더 명시적/고급(프로덕션 권장), `-v` 가 간단. `:ro`/`:rw` 로 권한.
- **source**: Persisting container data / Sharing local files
- **URL**: https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/ · https://docs.docker.com/get-started/docker-concepts/running-containers/sharing-local-files/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "컨테이너 다루기: 포트·볼륨·환경변수"
- **license note**: 명령·개념 요약, 예제 자체 작성.

### 8. 환경변수 / 설정 주입 (빌드타임 vs 런타임)

- **why**: 12-factor 감각. `.env` 재등록으로 고생한 사용자 경험(`supabase - 프로젝트 이관`)과 직결.
- **prerequisite**: 개념 4, 5.
- **mastery 후보**: `required`
- 핵심(공식): `ENV`(Dockerfile) = 이미지/실행 컨테이너의 환경변수(빌드타임에 굳음). `docker run -e VAR=value` / (레퍼런스상) `--env-file` = 런타임 주입. 시크릿은 이미지에 굽지 않는다(레이어에 남음). Compose 에서는 `environment:` / `env_file:`.
- **source**: Running containers (Engine) / Writing a Dockerfile
- **URL**: https://docs.docker.com/engine/containers/run/ · https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "컨테이너 다루기: 포트·볼륨·환경변수"
- **license note**: 사실 요약.
- **needs_followup**: "시크릿을 이미지에 굽지 말라"의 공식 근거 페이지(https://docs.docker.com/build/building/secrets/) 별도 확인 권장.

### 9. Docker Compose — 멀티 컨테이너 한 파일로

- **why**: 실무 개발 환경의 표준. web+db 를 한 명령으로. 사용자의 Supabase 로컬 스택도 Compose 성격.
- **prerequisite**: 개념 5, 6, 7.
- **mastery 후보**: `practical`
- 핵심(공식): Compose = 멀티 컨테이너 앱을 **하나의 YAML(`compose.yaml`)**로 정의·관리. `docker compose up` / `docker compose down` 으로 스택 전체 기동/정리. 변경 없는 서비스 재시작 시 기존 컨테이너 재사용(설정 캐시). 환경별 변수 지원. 대표 용도: **개발 환경 셋업**, **CI 의 격리된 테스트 환경 생성·파기**, 단일 호스트 배포. Compose 가 **기본 네트워크를 자동 생성**하고 서비스는 거기에 자동 참여 → **서비스 이름으로 서로 접속(DNS)**, IP 불필요.
- **source**: Compose features and uses / Multi-container applications
- **URL**: https://docs.docker.com/compose/intro/features-uses/ · https://docs.docker.com/get-started/docker-concepts/running-containers/multi-container-applications/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "Docker Compose 로 멀티 컨테이너"
- **license note**: 요약. `compose.yaml` 예제는 자체 작성.

### 10. Compose V1 vs V2 (버전 주의)

- **why**: 낡은 튜토리얼의 `docker-compose`(하이픈) 명령을 그대로 따라 하면 혼란. 현행은 `docker compose`.
- **prerequisite**: 개념 9.
- **mastery 후보**: `understand`
- 핵심(공식): Compose **V1** = Python 구현, 2014 출시, `docker-compose`(하이픈)로 호출, legacy 파일 포맷 참조는 더 이상 활발히 유지 안 됨. **V2** = Go 구현, 2020 발표, `docker compose`(공백)로 호출 — **현행**. `version:` top-level 요소 무시(Compose Specification 이 2.x/3.x 를 통합, version 은 선택). (2025 의 "V5"는 V2 와 기능적으로 동일, Go SDK 추가.)
- **source**: History and development of Docker Compose
- **URL**: https://docs.docker.com/compose/intro/history/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "Docker Compose 로 멀티 컨테이너" (주의 박스)
- **license note**: 사실 요약.
- **needs_followup**: **V1 의 정확한 EOL/제거 일자**는 이 페이지에 없음(연도만). 집필 시 일자를 단정하지 말 것. 필요하면 https://docs.docker.com/compose/releases/migrate/ , https://docs.docker.com/retired/ 재확인.

### 11. 개발 이미지 vs 프로덕션 이미지 — 멀티스테이지 빌드

- **why**: 개념 4 의 Dockerfile 은 공식 문서도 "production-ready 아님"이라 함. 빌드 도구가 최종 이미지에 남으면 크고 취약.
- **prerequisite**: 개념 4.
- **mastery 후보**: `understand` (필요 시 `required`)
- 핵심(공식): 멀티스테이지 = **빌드 의존성과 프로덕션 이미지를 분리**. `FROM` 을 여러 개 → 각 `FROM` 이 새 스테이지. `FROM golang:1.26 AS build` 처럼 `AS <name>` 로 스테이지 명명, `COPY --from=build /src /dst` 로 산출물만 다음 스테이지로. `docker build --target build` 로 특정 스테이지까지만 빌드(디버깅·테스트용). 외부 이미지에서도 `COPY --from=nginx:latest ...` 가능. BuildKit 은 target 이 의존하는 스테이지만 처리.
- **source**: Multi-stage builds
- **URL**: https://docs.docker.com/build/building/multi-stage/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "개발 이미지 vs 프로덕션 이미지 + 멀티스테이지"
- **license note**: 예제 구조는 공식 문서의 표준 golang 예 — 짧아 인용 가능, 자체 각색 권장.

### 12. 로그와 디버깅 기본

- **why**: 컨테이너는 "안이 안 보인다"는 두려움을 없애는 최소 도구 세트.
- **prerequisite**: 개념 5.
- **mastery 후보**: `required`
- 핵심(공식): `docker logs` / `docker container logs` = 컨테이너의 **STDOUT/STDERR** 출력 조회. `-f`(`--follow`) 스트리밍, `--tail N`(끝에서 N줄, 기본 전체), `--since`(RFC3339/유닉스/Go duration 예 `1m30s`), `-t`(`--timestamps`), `--details`, `--until`(API 1.35+). → 앱은 파일이 아니라 **stdout/stderr 로 로그를 내보내야** 이 명령이 먹는다. 실행 중 컨테이너로 들어가 디버깅: `docker exec -it <container> sh`. 상세 상태: `docker inspect`.
- **source**: docker container logs (CLI reference) / Running containers
- **URL**: https://docs.docker.com/reference/cli/docker/container/logs/ · https://docs.docker.com/engine/containers/run/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "로그와 디버깅"
- **license note**: 플래그 사실 요약.
- **needs_followup**: 로깅 드라이버(기본 `json-file`, `local`) 상세는 별도 페이지(https://docs.docker.com/engine/logging/ 계열) 확인 — 이번 라운드 필수는 아님.

### 13. 실제 백엔드 앱 컨테이너화 (Node.js 예)

- **why**: 개념 4~9 를 하나의 실전 흐름으로. CMM 스택(Node/Next/Express)과 정확히 겹침.
- **prerequisite**: 개념 4~9.
- **mastery 후보**: `practical`
- 핵심(공식): 공식 "Containerize a Node.js application" 가이드는 **Dockerfile(멀티스테이지: builder → deps(프로덕션 의존성만) → runner) + `compose.yaml`(`3000:3000`, build context, dev 는 `target: dev`) + `.dockerignore`(`node_modules/`, `dist/`, `.env`, `.git` 등 제외)** 를 직접 작성하고 `docker compose up --build` 로 실행하는 흐름. 단계: 앱 파일 → Dockerfile(멀티스테이지) → compose.yaml → .dockerignore → `docker compose up --build`.
- **source**: Containerize a Node.js application (Docker guides)
- **URL**: https://docs.docker.com/guides/nodejs/containerize/
- **publisher**: Docker, Inc. · **official**: yes · **checked_at**: 2026-09-06 · **current**
- **target chapter**: `containers-docker` · **lesson candidate**: "실제 백엔드 앱 컨테이너화" (챕터 종합 실습)
- **license note**: 흐름·파일 구성 요약. 이 가이드는 base image 로 Docker Hardened Images(`dhi.io/node:...`)를 쓰는데, 레슨에서는 일반 `node:24-alpine` 등 공개 이미지로 각색 권장(DHI 는 유료/구독 성격이라 학습용 부적합). `docker init` 은 이 페이지엔 없음 — 별도(https://docs.docker.com/reference/cli/docker/init/) 확인 가능하나 이번 스코프 밖.

---

## 기존 Curriculum과 연결

### 같은 Track 안 (`deployment-and-infra`)
- **선행**: `static-hosting/github-pages`(배포 첫 경험) → `node-app-hosting/gcp-vm-deploy`(VM 에 직접 설치 — 컨테이너의 대조군) → **`containers-docker`**.
- **인접/후행**: `ci-cd-github-actions/first-workflow` — 이후 "CI 에서 이미지 빌드 & 레지스트리 푸시"로 자연스럽게 확장(이번 라운드엔 레슨 없음, 링크만).
- **비교 자료 재활용**: `node-app-hosting/platform-comparison`(docId `1oBYMnze...`, `배포` 자료 `1bPuO0Pd...`) 의 "Koyeb/Render 가 Docker 로도 배포를 받는다" 한 줄을 `containers-docker` 도입의 "왜 이걸 배우나"에 링크. **중복 집필 금지, cross-link 만.**

### 다른 Track 과의 연결
- **backend-node (Research Agent 1 담당) 와 접점**: "컨테이너화된 백엔드"는 backend Node 레슨의 산출물(Express/Fastify 앱)을 입력으로 받는다. 두 챕터의 경계 = "앱을 만든다"(backend) / "그 앱을 이미지로 만들어 어디서든 돌린다"(this). 레슨 집필 시 backend 팀과 예제 앱을 하나로 맞추면 `13. 실제 백엔드 앱 컨테이너화`가 그대로 재사용됨.
- **database (관계형 DB 운영)**: `7. 데이터 영속화` 의 PostgreSQL 볼륨 예제가 DB 챕터의 "로컬에서 진짜 Postgres 띄우기"와 공유 가능.

### 사용자 실전 경험 앵커 (project_link 성격)
- **Docker Desktop + Supabase 로컬 스택**: `supabase - 프로젝트 이관`(docId `1NFB5KVA...`) — Docker Desktop 설치, WSL/VirtualMachinePlatform 활성화, "**DB 호스트를 Docker 컨테이너가 DNS 로 해석 못 함**" → Session pooler 로 우회. 이 경험은:
  - 개념 3(격리) · 개념 6(네트워크 격리) · 개념 9(Compose 네트워크/DNS)의 **살아 있는 예시**. "이미 겪은 그 DNS 에러가 왜 났는지"를 레슨에서 되짚어 주는 구성이 강력함.
  - `supabase` CLI 가 로컬에서 Postgres/GoTrue/Realtime 등을 **여러 컨테이너로** 띄운다는 사실 → 개념 9(멀티 컨테이너)의 실물.
- **컨테이너 기반 로컬 검증 경험**: CMM 자체 워크플로에 "Docker-container-based local verification" 이 있다고 함 → `12. 로그와 디버깅`, `13. 컨테이너화` 의 mission 을 "네가 이미 하는 그 검증을 Dockerfile 로 재현" 형태로 설계 가능.

---

## 부족한 부분

1. **`docker build` CLI 정확한 문법** — 채택한 "Writing a Dockerfile" 페이지에 빌드 명령 문법이 없음. `docker build -t name:tag .`, build context, `-f` 는 build 레퍼런스(https://docs.docker.com/reference/cli/docker/buildx/build/)에서 보강 필요. (개념 4, needs_followup)
2. **Compose V1 EOL 정확한 일자** — 연도만 확인됨. 집필 시 일자 단정 금지. (개념 10, needs_followup)
3. **`--env-file` / restart policy / 로깅 드라이버 상세** — 요약 범위에서 미확인. 필요 시 각 전용 페이지 확인. 이번 챕터 필수 스코프는 아님. (개념 5, 8, 12)
4. **시크릿 취급 공식 근거** — "이미지에 시크릿 굽지 말 것"의 근거 페이지(build secrets) 미열람. 보안 언급을 넣을 거면 확인. (개념 8)
5. **Windows/WSL2 특이사항** — 사용자가 Windows 11 + Docker Desktop. 공식 문서의 Docker Desktop for Windows / WSL2 backend 페이지는 이번에 안 봤음. `supabase - 프로젝트 이관` 자료가 이미 WSL/VirtualMachinePlatform 활성화를 다루므로, 레슨에서 그쪽으로 링크하고 공식 설치 페이지 1개만 추가 확인하면 됨.
6. **레지스트리 push/pull 실습** — 개념으로만 언급(개념 2). Docker Hub 로그인·`docker push` 실습을 넣을지는 챕터 범위 결정 필요(CI 챕터로 미뤄도 됨).
7. **OCI 스펙** — 스코프에 "OCI spec references if useful" 라고 했으나, 학습 첫 챕터에는 과함. "이미지·런타임에 표준(OCI)이 있다" 한 줄이면 충분. 별도 출처 조사 생략.

---

## 향후 확장

선행 사슬(레슨 집필은 이번 라운드 대상 아님, 순서만 고정):

1. **containers-docker** (이번) — 이미지/컨테이너/Dockerfile/run/ports/volumes/env/Compose/멀티스테이지/로그.
2. **컨테이너화된 백엔드** — backend-node 트랙의 앱을 이미지로, Compose 로 app+db, 헬스체크, `.dockerignore`/캐시 최적화, non-root 유저, 이미지 크기 줄이기. CI(GitHub Actions)에서 빌드·레지스트리 푸시.
3. **모델 서빙** — 추론 서버(예: FastAPI + 모델)를 컨테이너로, GPU 런타임 개념, 큰 이미지/레이어 캐시 전략.
4. **Kubernetes** — Pod/Deployment/Service, 여러 노드에 스케줄링, 롤링 업데이트. **이번 라운드에서는 레슨을 만들지 않는다.** 스코프 확장 금지, 선행 표시만.

추가로:
- **Compose Watch / 개발 루프** — `docker compose watch` 로 소스 동기화(개념 13 의 dev 흐름 심화).
- **이미지 보안** — `docker scout`, 취약점 스캔, base image 갱신. 별도 챕터 후보.
- **레지스트리 운영** — Docker Hub rate limit, GHCR, 프라이빗 레지스트리.

---

## 부록: 채택 출처 목록 (총 14, official 14)

| # | title | URL | publisher | official | checked_at | 상태 | 뒷받침 개념 |
|---|---|---|---|---|---|---|---|
| 1 | Docker overview | https://docs.docker.com/get-started/docker-overview/ | Docker, Inc. | yes | 2026-09-06 | current | 1, 3, 4 (아키텍처·정의) |
| 2 | What is a container? | https://www.docker.com/resources/what-container/ | Docker, Inc. | yes | 2026-09-06 | current | 1 (컨테이너 vs VM) |
| 3 | What is an image? | https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/ | Docker, Inc. | yes | 2026-09-06 | current | 2 (레이어·불변) |
| 4 | Writing a Dockerfile | https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/ | Docker, Inc. | yes | 2026-09-06 | current | 4, 8 |
| 5 | Publishing ports | https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/ | Docker, Inc. | yes | 2026-09-06 | current | 6 |
| 6 | Persisting container data | https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/ | Docker, Inc. | yes | 2026-09-06 | current | 7 |
| 7 | Sharing local files with containers | https://docs.docker.com/get-started/docker-concepts/running-containers/sharing-local-files/ | Docker, Inc. | yes | 2026-09-06 | current | 7 (바인드 마운트) |
| 8 | Multi-container applications | https://docs.docker.com/get-started/docker-concepts/running-containers/multi-container-applications/ | Docker, Inc. | yes | 2026-09-06 | current | 9 (네트워크·DNS) |
| 9 | Docker Compose: features and uses | https://docs.docker.com/compose/intro/features-uses/ | Docker, Inc. | yes | 2026-09-06 | current | 9 |
| 10 | History and development of Docker Compose | https://docs.docker.com/compose/intro/history/ | Docker, Inc. | yes | 2026-09-06 | current | 10 (V1 vs V2) |
| 11 | Multi-stage builds | https://docs.docker.com/build/building/multi-stage/ | Docker, Inc. | yes | 2026-09-06 | current | 11 |
| 12 | Running containers (Engine) | https://docs.docker.com/engine/containers/run/ | Docker, Inc. | yes | 2026-09-06 | current | 5, 8, 12 |
| 13 | docker container logs (CLI reference) | https://docs.docker.com/reference/cli/docker/container/logs/ | Docker, Inc. | yes | 2026-09-06 | current | 12 |
| 14 | Containerize a Node.js application | https://docs.docker.com/guides/nodejs/containerize/ | Docker, Inc. | yes | 2026-09-06 | current | 13 |

- 모든 페이지에 명시적 "last updated" 날짜나 deprecated 배너는 노출되지 않았음(콘텐츠 자체는 current 표준 문서). checked_at 은 조사일.
- 라이선스: Docker Docs 는 별도 CC 표기가 표면에 없음 → 정의 1~2문장 인용 + 자체 재작성 원칙. 장문 복붙 금지.
- needs_followup 표시된 항목(개념 4, 5, 8, 10, 12): 집필 착수 시 해당 전용 레퍼런스 페이지 1개씩 추가 확인.
