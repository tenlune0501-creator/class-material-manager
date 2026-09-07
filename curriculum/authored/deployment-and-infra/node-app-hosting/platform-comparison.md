---
id: deployment-and-infra/node-app-hosting/platform-comparison
chapter: deployment-and-infra/node-app-hosting
title: Koyeb·Heroku·AWS 비교
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [deployment, koyeb, heroku, aws, paas, comparison]
related_material_ids:
  - 1oBYMnzeAurIBI556SN49zk9YXIX2156CEkoVcSfhQ9A   # koyeb, heroku, aws 비교
prerequisites:
  - deployment-and-infra/node-app-hosting/gcp-vm-deploy
code_examples:
  - slug: spectrum
    title: 추상화 스펙트럼 — 내가 관리하는 양
    source_type: generated_minimal
    language: text
    code: |
      정적 호스팅   PaaS                          IaaS(VM)
      (Pages)      (Heroku / Koyeb / Railway …)  (GCP CE / AWS EC2)
      코드만       코드 + 약간의 설정             OS부터 전부

      위로 갈수록: 편함 · 빠른 배포 · 제어 적음 · 플랫폼 종속(lock-in) 큼
      아래로 갈수록: 복잡 · 느린 초기 설정 · 제어 많음 · 종속 적음
  - slug: table
    title: 세 후보 요약
    source_type: generated_minimal
    language: text
    code: |
      Koyeb  | 서버리스 PaaS. Buildpack 자동 감지, 무료 인스턴스, 자동 확장.
             | 단점: 고급 커스터마이징·복잡 워크로드 약함, 지원 언어 최적화 편차.
      Heroku | 개발자 친화 PaaS. git push 배포, 애드온(DB·모니터링) 풍부, 유료 자동 확장.
             | 단점: 무료 플랜 축소(슬립/성능), 규모 커지면 비용 급증, 네트워킹 커스터마이징 제한.
      AWS    | 종합 클라우드(EC2·Lambda·RDS…). 확장성·유연성·고급 보안(VPC/IAM).
             | 단점: 설정 복잡, 학습 곡선 큼, 비용이 사용량 따라 빠르게 증가.
  - slug: pick
    title: 고르는 질문
    source_type: generated_minimal
    language: text
    code: |
      Q1. 정적인가? → 예: Pages/Netlify/Vercel 로 끝. (아래는 서버가 필요할 때)
      Q2. "git push 하면 알아서" 수준이면 충분한가? → PaaS(Heroku/Koyeb/Railway).
      Q3. OS·네트워킹·특수 런타임·비용 최적화를 직접 제어해야 하나? → IaaS(EC2/GCE) + nginx/systemd.
      Q4. 특정 벤더에 묶이는 게 부담인가? → PaaS는 lock-in 큼, IaaS/컨테이너는 상대적으로 이식 쉬움.
      학습 단계: 먼저 PaaS 로 배포 감각을 잡고, 필요할 때 VM 으로 내려간다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 배포 플랫폼을 **추상화 스펙트럼**(정적 → PaaS → IaaS)으로 놓고 "내가 관리하는 양"의 차이를 안다.
- Koyeb / Heroku / AWS 각각의 성격·장점·단점을 한 문장으로 말한다.
- **편함 ↔ 제어 ↔ 비용 ↔ 벤더 종속(lock-in)** 의 트레이드오프를 안다.
- 프로젝트 상황에 맞는 플랫폼을 질문 몇 개로 고른다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 정적 호스팅과 VM 배포(앞 Lesson들)의 대략적인 그림.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"서버 앱을 배포하자"에서 바로 AWS 콘솔을 열면 EC2·VPC·보안그룹·IAM에 파묻힌다. 반대로 규모가
커진 앱을 Heroku 무료 플랜에 두면 슬립·성능·비용에 시달린다. **먼저 "얼마나 직접 관리할지"**
를 정하는 게 순서다.

<!-- section: concept -->
## 1. 추상화 스펙트럼

{{code: spectrum}}

- **정적 호스팅**(Pages/Netlify/Vercel): 코드만. 서버 로직 없음.
- **PaaS**(Heroku·Koyeb·Railway·Render): 코드 + 약간의 설정. 빌드·실행·확장을 플랫폼이 한다.
- **IaaS**(GCP Compute Engine·AWS EC2): OS부터 nginx·systemd·방화벽까지 내가 구성(앞 Lesson).
- 위로 갈수록 **편하지만 제어가 적고 벤더에 묶인다**. 아래로 갈수록 **자유롭지만 손이 많이 간다**.

<!-- section: mechanism -->
## 2. 세 후보

{{code: table}}

- **Koyeb**: 서버리스 PaaS. Buildpack 자동 감지 + 무료 인스턴스 → 초보자 진입이 쉽다.
  대신 복잡한 워크로드·깊은 커스터마이징엔 약하다.
- **Heroku**: PaaS의 원조. `git push heroku main` 한 줄 배포, 애드온 생태계가 크다.
  무료 플랜이 축소돼(슬립·성능) 지금은 유료 전제. 규모가 커지면 비용이 빠르게 오른다.
- **AWS**: PaaS가 아니라 **종합 클라우드**. EC2(VM)·Lambda·RDS·S3… 뭐든 있고 확장·보안이 강력하다.
  대신 배우고 설정할 게 많고, 비용 관리가 별도 과제다.

<!-- section: concept | title: 선택 -->
## 3. 고르는 질문

{{code: pick}}

한 줄: **"git push 하면 알아서" 로 충분하면 PaaS, OS·네트워킹·비용을 직접 쥐어야 하면 IaaS.**
학습 단계에서는 PaaS로 배포 감각을 먼저 잡고, 필요할 때 VM으로 내려간다.

<!-- section: must_know -->
## 반드시 기억할 것

- 스펙트럼: 정적 → PaaS → IaaS. 위로 갈수록 편함·제어↓·lock-in↑.
- **Koyeb** = 간단·무료 인스턴스(제어 약함), **Heroku** = 개발자 친화·애드온(무료 축소·비용), **AWS** = 만능·강력(복잡·비용·학습).
- AWS는 "플랫폼"이 아니라 **서비스 모음** — 그 안에서 EC2(IaaS)·Lambda(FaaS) 등을 다시 고른다.
- 정적이면 서버 플랫폼을 고민할 필요 없다(Pages/Vercel로 끝).
- PaaS는 이식성이 낮다(설정·애드온이 벤더 고유). 컨테이너(Docker)로 만들면 이식이 쉬워진다.
- 무료/저비용 티어의 제약(슬립, 스펙, 사용량 한도)을 배포 전에 확인한다.

<!-- section: experiment -->
## 직접 해 보기

1. 같은 Express 앱을 "배포하려면 무엇을 해야 하나" 관점에서 Koyeb / Heroku / EC2 각각의 단계를 3줄로 적어 비교하라.
2. "개인 포트폴리오 API(트래픽 적음)", "실시간 채팅(스케일 필요)", "사내 관리 도구(보안·VPC)" 에 각각 어느 플랫폼이 맞는지 이유와 함께.
3. Heroku 또는 Koyeb 무료 티어의 현재 제약(슬립 시간, 메모리, 월 사용량)을 공식 페이지에서 확인해 표로 정리하라.
4. "PaaS lock-in을 줄이려면 무엇을 하나?" 를 한 문단으로 정리하라(컨테이너화 관점).

<!-- section: check_question -->
## 이해 점검

1. 정적 호스팅 / PaaS / IaaS 는 "내가 관리하는 것"이 각각 어디까지인가?
2. Koyeb·Heroku·AWS를 한 문장씩으로 요약하면?
3. "AWS는 PaaS가 아니다" 라는 말의 의미는?
4. 편함을 택할 때 대가로 커지는 것 두 가지는?
5. 학습 단계에서 PaaS로 시작하라는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "PaaS와 IaaS의 차이, 그리고 각각을 선택하는 기준을 설명해 주세요."
- "벤더 종속(lock-in)을 줄이기 위한 배포 전략은?"
- "무료/저비용 호스팅 티어의 함정에는 어떤 것들이 있나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 스펙트럼(정적→PaaS→IaaS, 편함↑·제어↓·lock-in↑), Koyeb/Heroku/AWS 한 줄 요약,
> AWS=서비스 모음, 선택 질문(git push로 충분? / OS 제어 필요?)을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**배포 플랫폼은 정적 → PaaS(Koyeb/Heroku) → IaaS(AWS EC2/GCE)로 갈수록 편하지만 제어가 줄고 벤더에
묶인다 — "git push 하면 알아서" 로 충분하면 PaaS, OS·네트워킹·비용을 직접 쥐어야 하면 IaaS이고,
학습은 PaaS로 시작해 필요할 때 VM으로 내려간다.**
