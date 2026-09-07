---
id: react/react-deployment/deploy-to-gcp-vm
chapter: react/react-deployment
title: GCP VM에 직접 배포하기
mastery: understand
lesson_kind: lesson
estimated_minutes: 60
tags: [react, deploy, gcp, vm, nginx, infra]
related_material_ids:
  - 1MjC0nvq1rc_wQbO1st7P5_mUtCaROXGelLiSNub_aC4   # GCP - VM 생성 및 설정, 웹서버설치
  - 1bKTN0FWrRaGDZ33mLDZm_JiMJzHIWGHNeIEU35_v8Ig   # GCP - 서비스 등록 실행
  - 1E235IuK9vwVtt6ZSdY88IBAdS63mZwJfzGHh_PQs8jI   # GCP - 클라이언트 연결
  - 1b9CclzJ5-MUY-jv0n82pDpNyOt71isP9_B9kbG5QJJ4   # 구글 클라우드 - 배포 part 2
prerequisites:
  - react/react-deployment/deploy-with-github-actions
  - react/board-crud-app/board-ui-and-list
code_examples:
  - slug: topology
    title: 구성 — 무엇이 어디서 도나
    source_type: generated_minimal
    language: text
    code: |
      [브라우저]
         │  https://<도메인 or VM 외부IP>
         ▼
      [GCP VM  (Ubuntu, e2-micro)]
         ├─ nginx        :80/:443   정적 파일(React dist/) 서빙 + /api → 프록시
         ├─ Node/Express :3000      REST API (systemd 로 상시 실행)
         └─ MySQL        :3306      로컬에서만 접속 (bind-address 127.0.0.1)
      방화벽: HTTP/HTTPS 만 외부 허용. 3000·3306 은 외부에 열지 않는다.
  - slug: provision
    title: VM 준비 (SSH 안에서)
    source_type: generated_minimal
    language: text
    code: |
      # GCP 콘솔: VM 인스턴스 만들기 (e2-micro / Ubuntu / HTTP·HTTPS 허용)
      #           → 비용 경고 알림 설정 (Always Free 는 1 vCPU + 0.6GB 만 무료)
      # 브라우저 SSH 로 접속 후:
      sudo apt-get update
      sudo apt-get install -y nginx mysql-server
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs
      # MySQL: CREATE DATABASE bbs;  + 로컬 스키마(bbs.sql) 반영
      # bind-address 는 127.0.0.1 로 두어 DB 를 외부에 노출하지 않는다
  - slug: deploy-app
    title: 앱 올리기 + 상시 실행(systemd)
    source_type: generated_minimal
    language: text
    code: |
      # 서버(API): git clone → npm ci → .env 작성(DB 접속정보) 
      # PM2 또는 systemd 유닛으로 상시 실행 (SSH 끊겨도 계속 돌게)
      # /etc/systemd/system/bbs-api.service
      [Service]
      WorkingDirectory=/home/ubuntu/bbs-server
      ExecStart=/usr/bin/node index.js
      Restart=always
      Environment=NODE_ENV=production
      # sudo systemctl enable --now bbs-api

      # 프런트(React): 로컬에서 npm run build → dist/ 를 scp 로 VM 에 복사
      #   또는 VM 에서 git pull && npm run build
      #   → /var/www/app  에 배치
  - slug: nginx-conf
    title: nginx — 정적 서빙 + API 프록시 + SPA fallback
    source_type: generated_minimal
    language: text
    code: |
      server {
        listen 80;
        server_name _;
        root /var/www/app;                 # React dist/

        location / {
          try_files $uri /index.html;      # SPA fallback: 없는 경로는 index.html
        }
        location /api/ {
          proxy_pass http://127.0.0.1:3000/;  # Express 로 넘김 (CORS 회피)
        }
      }
      # sudo nginx -t && sudo systemctl reload nginx
      # HTTPS: certbot(Let's Encrypt) 로 인증서 발급 → 443 리다이렉트
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- "정적 호스팅(Pages/Vercel)"과 "직접 서버(VM)"의 차이와, 언제 VM이 필요한지 설명할 수 있다.
- GCP VM(우분투)에 **nginx + Node/Express + MySQL** 을 얹는 큰 그림을 안다.
- nginx가 **정적 파일 서빙 + `/api` 프록시 + SPA fallback** 을 어떻게 하는지 안다.
- **방화벽**(HTTP/HTTPS만 열고 DB·앱 포트는 안 연다), **systemd 상시 실행**, **HTTPS(certbot)** 의 역할을 안다.
- 이건 **개념 이해(understand)** 목표다 — 전 과정을 외우는 게 아니라 구조를 읽을 수 있으면 된다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 앞 Lesson(빌드/배포·환경변수), 게시판이 프런트(React) + API(Express) + DB로 이뤄진다는 것.
- 셸 기본(`sudo`, `apt`, SSH). 자세한 서버 운영은 `deployment-and-infra` 트랙.

<!-- section: dev_problem -->
## 언제 VM이 필요한가

Pages/Vercel은 편하지만 제약이 있다: 정적(또는 특정 플랫폼) 위주, 임의의 백그라운드 프로세스·
직접 설치한 DB·특수 런타임을 못 돌린다.

- **Express + MySQL 서버를 통째로** 내가 관리해야 할 때
- 배포 환경을 세밀하게 제어하고 싶을 때 (nginx 설정, cron, 로그)
- 학습 목적으로 "리눅스 서버에 직접 올려 보기"

→ 이럴 때 클라우드 VM(GCP Compute Engine 등) 하나를 빌려 **직접 구성**한다.

<!-- section: concept -->
## 1. 구성

{{code: topology}}

- **nginx** 가 앞단: 브라우저 요청 중 정적(HTML/JS/CSS/이미지)은 직접 주고, `/api/...` 는
  뒤의 Express로 넘긴다(reverse proxy). 같은 도메인/포트로 나가므로 **CORS 문제가 사라진다**.
- **Express** 는 API만. **MySQL** 은 같은 VM 안에서 `127.0.0.1` 로만 접속(외부 비공개).

<!-- section: mechanism -->
## 2. VM 준비

{{code: provision}}

- **비용 경고 알림 필수.** Always Free는 정확히 `1 vCPU + 0.6GB`만 — 그 이상은 과금된다.
- 방화벽에서 **HTTP/HTTPS만** 외부 허용. `3000`(Express)·`3306`(MySQL)은 열지 않는다.

<!-- section: concept | title: 앱 올리기 -->
## 3. 앱 배치 + 상시 실행

{{code: deploy-app}}

- API 서버는 **systemd(또는 PM2)** 로 등록해 SSH가 끊겨도 계속 돌고, 죽으면 자동 재시작하게 한다.
- 프런트는 **빌드 산출물(`dist/`)만** VM에 올린다(소스 빌드를 VM에서 해도 되지만 메모리 여유 확인).

<!-- section: concept | title: nginx -->
## 4. nginx 설정

{{code: nginx-conf}}

- `try_files $uri /index.html` — **SPA fallback**. `/posts/1` 같은 경로가 실제 파일이 아니어도
  `index.html` 을 줘서 라우터가 처리하게 한다(없으면 새로고침 404).
- `location /api/ { proxy_pass ... }` — API를 같은 오리진으로 노출 → 프런트는 `/api/list` 만 부르면 된다.
- **HTTPS**: `certbot` 으로 Let's Encrypt 무료 인증서를 발급해 443을 열고 80→443 리다이렉트.
  *학습용으로 http만 써도 되지만*, 로그인·개인정보가 있으면 HTTPS는 사실상 필수다.

<!-- section: must_know -->
## 반드시 기억할 것

- VM 배포 = **nginx(앞단) + 앱 프로세스(systemd) + DB(로컬 전용)** 조합.
- nginx가 **정적 서빙 + `/api` 프록시(CORS 회피) + SPA fallback** 을 한꺼번에.
- 방화벽은 **HTTP/HTTPS만**. 앱 포트·DB 포트는 외부에 열지 않는다. DB `bind-address` 는 `127.0.0.1`.
- 앱은 **systemd/PM2** 로 상시 실행 + 자동 재시작. SSH 세션에 묶어 두지 않는다.
- 클라우드 VM은 **과금**된다 — 비용 알림을 반드시 건다.
- HTTPS는 `certbot` 으로. 학습용 http는 가능하나 인증·개인정보엔 HTTPS 필수.
- 이 Lesson은 구조 이해가 목표. 실제 운영(백업·모니터링·보안 패치)은 `deployment-and-infra` 트랙.

<!-- section: experiment -->
## 직접 해 보기 (선택 — 비용 주의)

1. GCP 무료 VM을 만들고 비용 경고를 설정하라. HTTP/HTTPS 허용 체크.
2. SSH로 `nginx` 를 설치하고 `/var/www/app` 에 아무 `index.html` 을 두어 외부 IP로 열리는지 확인하라.
3. Express API를 올려 systemd 유닛으로 등록하고, `sudo systemctl status` 로 상시 실행을 확인하라.
4. nginx에 `/api/` 프록시 + `try_files` fallback을 넣고, React `dist/` 를 배치해 목록 조회가 되는지 확인하라.
5. `3000` 포트로 외부에서 직접 접속이 안 되는지(방화벽), `/posts/1` 새로고침이 404가 아닌지 확인하라.
6. (도전) certbot으로 HTTPS를 적용하라.

<!-- section: check_question -->
## 이해 점검

1. Pages/Vercel 대신 VM을 골라야 하는 상황의 예는?
2. nginx가 이 배포에서 하는 일 3가지는?
3. `/api` 를 nginx가 프록시하면 왜 CORS 문제가 없어지나?
4. MySQL `bind-address` 를 `127.0.0.1` 로 두는 이유는?
5. API를 그냥 `node index.js` 로 띄우고 SSH를 닫으면 무슨 일이 생기나? 해결은?

<!-- section: interview_question -->
## 면접 대비

- "정적 호스팅과 직접 VM 배포의 트레이드오프를 설명해 주세요."
- "리버스 프록시(nginx)를 앞에 두는 이유와, SPA 라우팅을 위한 설정은?"
- "클라우드 VM에서 데이터베이스를 외부에 노출하지 않으려면?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> VM 배포 구성(nginx+systemd 앱+로컬 DB), nginx 3역할(정적/api 프록시/SPA fallback),
> 방화벽 HTTP·HTTPS만, DB bind 127.0.0.1, systemd 상시 실행, 비용 알림을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**VM 배포는 nginx가 앞단에서 React `dist/` 를 서빙하고 `/api` 를 로컬 Express로 프록시하며 SPA fallback을
처리하고, Express는 systemd로 상시 실행, MySQL은 `127.0.0.1` 로만 열며, 외부 방화벽은 HTTP/HTTPS만 허용한다 —
편의보다 제어가 필요할 때의 선택이고 과금에 주의한다.**
