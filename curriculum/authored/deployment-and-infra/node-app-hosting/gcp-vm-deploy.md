---
id: deployment-and-infra/node-app-hosting/gcp-vm-deploy
chapter: deployment-and-infra/node-app-hosting
title: GCP VM에 앱 올리기
mastery: understand
lesson_kind: lesson
estimated_minutes: 70
tags: [deployment, gcp, vm, nginx, systemd, infra]
related_material_ids:
  - 1MjC0nvq1rc_wQbO1st7P5_mUtCaROXGelLiSNub_aC4   # GCP - VM 생성 및 설정, 웹서버설치
  - 1bKTN0FWrRaGDZ33mLDZm_JiMJzHIWGHNeIEU35_v8Ig   # GCP - 서비스 등록 실행
  - 1E235IuK9vwVtt6ZSdY88IBAdS63mZwJfzGHh_PQs8jI   # GCP - 클라이언트 연결
  - 1b9CclzJ5-MUY-jv0n82pDpNyOt71isP9_B9kbG5QJJ4   # 구글 클라우드 - 배포 part 2
sources:
  - title: "Compute Engine — Create and start a VM instance"
    url: https://cloud.google.com/compute/docs/instances/create-start-instance
    publisher: "Google Cloud"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - deployment-and-infra/static-hosting/github-pages
  - data-and-backend/nodejs-server/express-rest-api
code_examples:
  - slug: topology
    title: VM 안에 무엇이 도나
    source_type: generated_minimal
    language: text
    code: |
      [브라우저] --https--> [GCP VM: Ubuntu, e2-micro]
                              nginx        :80/:443   정적(React dist) + /api 리버스 프록시
                              node/express :3000      REST API (systemd 로 상시 실행)
                              mysql        :3306      127.0.0.1 로만 (외부 비공개)
      방화벽(VPC): HTTP/HTTPS 만 외부 허용. 3000·3306 은 안 연다.
      * Always Free 는 정확히 1 vCPU + 0.6GB. 그 이상은 과금 → 비용 알림 필수.
  - slug: provision
    title: VM 만들고 접속 (SSH)
    source_type: generated_minimal
    language: text
    code: |
      # GCP 콘솔: Compute Engine → VM 인스턴스 만들기
      #   머신: e2-micro / OS: Ubuntu LTS / 디스크 10GB
      #   방화벽: "HTTP 트래픽 허용" + "HTTPS 트래픽 허용" 체크
      #   결제 계정 연결 + 예산 알림 설정
      # 접속: 인스턴스 목록의 "SSH" 버튼 (브라우저 SSH)

      sudo apt-get update
      sudo apt-get install -y nginx mysql-server
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs
  - slug: db-and-app
    title: DB 옮기고 앱 상시 실행
    source_type: generated_minimal
    language: text
    code: |
      # MySQL: 로컬 스키마/데이터를 옮긴다
      sudo mysql            # (초기 root 는 비번 없이 sudo 로 접속)
      CREATE DATABASE bbs;  USE bbs;  SOURCE /home/ubuntu/bbs.sql;   # CREATE TABLE + INSERT
      # mysqld.cnf 의 bind-address 는 127.0.0.1 로 (DB 를 외부에 노출하지 않음)

      # API: git clone → npm ci → .env 작성
      # systemd 유닛으로 상시 실행 (SSH 끊겨도 계속, 죽으면 재시작)
      # /etc/systemd/system/bbs-api.service
      [Service]
      WorkingDirectory=/home/ubuntu/bbs-server
      ExecStart=/usr/bin/node index.js
      Restart=always
      EnvironmentFile=/home/ubuntu/bbs-server/.env
      # sudo systemctl enable --now bbs-api   /   sudo systemctl status bbs-api
  - slug: nginx
    title: nginx — 정적 + /api 프록시 + SPA fallback + HTTPS
    source_type: generated_minimal
    language: text
    code: |
      # /etc/nginx/sites-available/app  (심볼릭 링크로 sites-enabled 에)
      server {
        listen 80;
        server_name _;
        root /var/www/app;                    # React 빌드(dist) 를 여기 배치
        location / { try_files $uri /index.html; }   # SPA fallback
        location /api/ { proxy_pass http://127.0.0.1:3000/; }  # Express 로 중계
      }
      # sudo nginx -t && sudo systemctl reload nginx
      # HTTPS: sudo certbot --nginx   (Let's Encrypt, 무료. 80→443 리다이렉트 자동 구성)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- "정적 호스팅/PaaS"로 안 되는 경우(직접 설치한 DB·임의 프로세스)에 **클라우드 VM**을 쓰는 이유를 안다.
- GCP Compute Engine VM(우분투)에 **nginx + Node/Express + MySQL** 을 얹는 전체 그림을 그린다.
- nginx가 **정적 서빙 + `/api` 리버스 프록시 + SPA fallback + HTTPS** 를 어떻게 하는지 안다.
- **방화벽**(HTTP/HTTPS만), **systemd 상시 실행**, **DB 외부 비공개**, **비용 알림**의 이유를 안다.
- 이건 **개념 이해(understand)** 다 — 전 과정 암기가 아니라 구조를 읽을 수 있으면 된다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 정적 배포 개념, Express REST API, 셸 기본(`sudo`, `apt`, SSH).

<!-- section: dev_problem -->
## 언제 VM인가

GitHub Pages는 정적만, Vercel은 특정 플랫폼·서버리스 위주다. **내가 만든 Express 서버 +
직접 설치한 MySQL** 을 통째로 돌리거나, nginx 설정·cron·로그를 세밀하게 제어하려면
**리눅스 서버 한 대**를 직접 구성한다.

<!-- section: concept -->
## 1. 구성

{{code: topology}}

- **nginx** 가 앞단: 정적 파일은 직접 주고 `/api` 는 뒤의 Express로 넘긴다(같은 도메인/포트 →
  **CORS 문제가 사라진다**).
- **Express** 는 API만. **MySQL** 은 같은 VM 안에서 `127.0.0.1` 로만.

<!-- section: mechanism -->
## 2. VM 준비

{{code: provision}}

- **결제 계정 + 예산 알림 필수.** Always Free는 `1 vCPU + 0.6GB` 뿐 — Node 빌드가 무거우면
  메모리를 늘려야 하고 그 순간부터 과금.
- 방화벽에서 **HTTP/HTTPS만** 외부 허용. `3000`·`3306` 은 안 연다.

<!-- section: concept | title: DB · 앱 -->
## 3. DB 이전 + 상시 실행

{{code: db-and-app}}

- 로컬에서 만든 스키마/데이터를 `.sql` 로 뽑아 VM의 MySQL에 `SOURCE` 로 반영.
- API는 **systemd**(또는 PM2)로 등록 → SSH를 닫아도 계속 돌고, 크래시 시 자동 재시작.
- 프런트는 **빌드 산출물(`dist/`)만** VM에 올린다(`scp` 또는 VM에서 `git pull && npm run build`).

<!-- section: concept | title: nginx -->
## 4. nginx

{{code: nginx}}

- `try_files $uri /index.html` — **SPA fallback**. `/posts/1` 이 실제 파일이 아니어도 `index.html` 을 준다.
- `location /api/ { proxy_pass ... }` — API를 같은 오리진으로 노출.
- **HTTPS**: `certbot --nginx` 로 Let's Encrypt 무료 인증서 + 80→443 리다이렉트. 인증·개인정보가 있으면 필수.

<!-- section: must_know -->
## 반드시 기억할 것

- VM 배포 = **nginx(앞단) + 앱(systemd 상시) + DB(로컬 전용)**.
- nginx: 정적 서빙 + `/api` 리버스 프록시(CORS 회피) + SPA fallback + (certbot) HTTPS.
- 방화벽은 **HTTP/HTTPS만**. 앱·DB 포트는 외부에 안 연다. MySQL `bind-address 127.0.0.1`.
- 앱은 `node index.js` 를 SSH에 매어 두지 말고 **systemd/PM2** 로.
- 클라우드 VM은 **과금** — 예산 알림을 반드시 건다. Always Free 스펙 초과 주의.
- 운영(백업·모니터링·보안 패치·무중단 배포)은 이 Lesson 범위를 넘는다 — 별도 주제.

<!-- section: experiment -->
## 직접 해 보기 (선택 — 비용 주의)

1. GCP e2-micro VM을 만들고 예산 알림을 설정하라. HTTP/HTTPS 허용 체크.
2. SSH로 `nginx` 를 깔고 `/var/www/app/index.html` 을 두어 외부 IP로 열리는지 확인하라.
3. Express API를 올려 systemd 유닛으로 등록하고 `systemctl status` 로 상시 실행을 확인하라.
4. nginx에 `/api/` 프록시 + `try_files` fallback을 넣고 React `dist/` 를 배치해 목록 조회가 되는지 확인하라.
5. 외부에서 `:3000` 직접 접속이 막히는지, `/posts/1` 새로고침이 404가 아닌지 확인하라.
6. (도전) `certbot` 으로 HTTPS를 적용하라.

<!-- section: check_question -->
## 이해 점검

1. Pages/Vercel 대신 VM을 골라야 하는 상황의 예는?
2. nginx가 이 배포에서 하는 일 4가지는?
3. `/api` 를 nginx가 프록시하면 왜 CORS 문제가 없어지나?
4. MySQL을 `127.0.0.1` 로만 여는 이유는?
5. API를 `node index.js` 로 띄우고 SSH를 닫으면? 해결은?

<!-- section: interview_question -->
## 면접 대비

- "정적 호스팅·PaaS·IaaS(VM)의 차이와 선택 기준을 설명해 주세요."
- "리버스 프록시(nginx)를 앞에 두는 이유와, SPA·API를 함께 서빙하는 설정은?"
- "클라우드 VM에서 데이터베이스를 안전하게 두는 방법은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> VM 구성(nginx + systemd 앱 + 로컬 DB), nginx 4역할(정적/api 프록시/SPA fallback/HTTPS),
> 방화벽 HTTP·HTTPS만·DB 127.0.0.1, systemd 상시 실행, 비용 알림을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**GCP VM 배포는 nginx가 앞단에서 React `dist/` 를 서빙하고 `/api` 를 로컬 Express로 프록시하며 SPA
fallback·HTTPS(certbot)를 처리하고, Express는 systemd로 상시 실행, MySQL은 `127.0.0.1` 로만 열며
외부 방화벽은 HTTP/HTTPS만 허용한다 — 편의보다 제어가 필요할 때 쓰고 과금에 주의한다.**
