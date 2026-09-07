---
id: deployment-and-infra/static-hosting/github-pages
chapter: deployment-and-infra/static-hosting
title: GitHub Pages로 페이지 열기
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [deployment, github-pages, static-hosting]
related_material_ids:
  - 1UkMfeU58aX680ezoxy1aVuMdPBxZtHKFwBEsv8V7koc   # github PAGE - 홈페이지 오픈하기
sources:
  - title: "GitHub Pages — About GitHub Pages"
    url: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
    publisher: "GitHub"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - tooling-and-collaboration/git-basics/version-control-and-commits
code_examples:
  - slug: user-site
    title: 사용자 사이트 — username.github.io
    source_type: generated_minimal
    language: text
    code: |
      1. 저장소 이름을 정확히 <username>.github.io 로 생성  (예: likerock/likerock.github.io)
      2. index.html 등 정적 파일을 그 저장소에 push
      3. https://<username>.github.io 로 접속
      # 계정당 하나. HTML/CSS/JS(정적 자산)만 — 서버 코드·DB 없음
  - slug: project-site
    title: 프로젝트 사이트 — 아무 저장소나
    source_type: generated_minimal
    language: text
    code: |
      Settings → Pages → Source
        (A) Deploy from a branch : main 의 / (root) 또는 /docs 폴더를 그대로 서빙
        (B) GitHub Actions        : 빌드 산출물을 배포 (Vite/Next 등 빌드가 필요할 때)
      주소: https://<username>.github.io/<repo-name>/     ← 서브패스에 주목
  - slug: subpath
    title: 서브패스 함정 — 자산 경로가 깨진다
    source_type: generated_minimal
    language: text
    code: |
      프로젝트 사이트는 /repo-name/ 하위에서 서빙된다.
      <img src="/images/logo.png">  →  브라우저는 https://user.github.io/images/logo.png 요청 → 404

      해결:
        - 순수 HTML: 상대경로 사용  <img src="images/logo.png">  (앞에 / 안 붙임)
        - Vite:   vite.config.js  →  base: "/repo-name/"
        - CRA:    package.json    →  "homepage": "https://user.github.io/repo-name"
        - 라우터: BrowserRouter basename={import.meta.env.BASE_URL}
  - slug: git-push
    title: 올리는 법 (git)
    source_type: generated_minimal
    language: text
    code: |
      git init                 # 처음 한 번
      git add .
      git commit -m "첫 배포"
      git remote add origin https://github.com/<user>/<repo>.git
      git push origin main
      # 이후엔 add → commit → push (또는 VS Code Source Control 의 Sync)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- GitHub Pages로 **정적 사이트**(HTML/CSS/JS)를 무료로 공개한다.
- **사용자 사이트**(`username.github.io`)와 **프로젝트 사이트**(`/repo/` 서브패스)의 차이를 안다.
- Settings → Pages의 두 소스(branch 직접 서빙 vs GitHub Actions 빌드)를 구분한다.
- **서브패스 때문에 자산 경로가 깨지는 문제**와 해결법(상대경로 / `base` / `homepage`)을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- git `add`/`commit`/`push`, 원격 저장소 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

만든 페이지를 남에게 보여주려면 어딘가에 호스팅해야 한다. FTP 서버를 빌리거나 유료 호스팅을
쓰는 대신, **GitHub 저장소에 push하면 자동으로 URL이 생기는** 게 GitHub Pages다. 단, "정적"만 —
서버 코드·DB·API 라우트는 못 돌린다(그건 Vercel/서버가 필요).

<!-- section: concept -->
## 1. 두 종류

{{code: user-site}}

{{code: project-site}}

- **사용자 사이트**: 저장소 이름이 정확히 `<username>.github.io`. 계정당 1개. 루트 도메인.
- **프로젝트 사이트**: 아무 저장소나. `Settings → Pages` 에서 켠다. 주소가 **`/<repo>/` 서브패스**.
- 소스 방식: **branch 직접 서빙**(정적 파일 그대로) vs **GitHub Actions**(빌드가 필요한 Vite/Next).

<!-- section: mechanism -->
## 2. 서브패스 함정

{{code: subpath}}

프로젝트 사이트에서 가장 흔한 실수. **`/` 로 시작하는 절대경로**(`/images/x.png`)는
도메인 루트로 해석돼 서브패스를 무시한다 → 404. 해결:
- 순수 HTML이면 **상대경로**(`images/x.png`, `./images/x.png`).
- 번들러면 **`base` / `homepage`** 설정으로 빌드 시 경로에 `/repo/` 를 붙이게 한다.
- SPA 라우터는 `basename` 을 맞추고, **SPA fallback**(없는 경로 → `index.html`)이 없어서
  하위 경로 새로고침이 404나는 것도 고려한다(Pages는 `404.html` 트릭 또는 `HashRouter`).

<!-- section: concept | title: 올리기 -->
## 3. 올리는 법

{{code: git-push}}

VS Code라면 Source Control 패널에서 stage → 커밋 메시지 → commit → **Sync Changes**(pull+push).

<!-- section: must_know -->
## 반드시 기억할 것

- GitHub Pages = **정적(HTML/CSS/JS)만**. 서버·DB·API 라우트 없음.
- 사용자 사이트는 저장소명 `<username>.github.io`, 계정당 1개, 루트. 프로젝트 사이트는 `/<repo>/` 서브패스.
- 소스: branch 직접 서빙(정적) 또는 GitHub Actions(빌드 필요).
- 서브패스에서 **절대경로 자산은 404** → 상대경로 또는 `base`/`homepage` 설정.
- SPA는 `basename` + fallback(404.html/HashRouter) 없으면 하위 경로 새로고침 404.
- 저장소가 **public** 이어야 무료로 켤 수 있다(Pro는 private도 가능).

<!-- section: experiment -->
## 직접 해 보기

1. `<username>.github.io` 저장소를 만들고 `index.html` 하나를 push해 접속되는지 확인하라.
2. 아무 저장소에 정적 페이지를 넣고 `Settings → Pages` 에서 branch 서빙으로 켜라. 주소의 서브패스를 확인.
3. 그 페이지에 `<img src="/img/a.png">` 를 넣어 404를 재현한 뒤 `src="img/a.png"` 로 고쳐라.
4. Vite React 앱을 프로젝트 사이트로 배포하며 `base: "/repo/"` 를 설정하라.
5. SPA 라우터가 있으면 `/about` 새로고침이 404나는지 확인하고 대응하라.

<!-- section: check_question -->
## 이해 점검

1. GitHub Pages로 못 하는 것(정적이 아닌 것)의 예는?
2. 사용자 사이트와 프로젝트 사이트의 주소·개수 차이는?
3. `<img src="/logo.png">` 가 프로젝트 사이트에서 404나는 이유와 두 가지 해결책은?
4. `Settings → Pages` 의 "Deploy from a branch" 와 "GitHub Actions" 는 언제 각각 쓰나?
5. SPA에서 `/detail/3` 새로고침이 404나는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "정적 호스팅(GitHub Pages/Netlify)과 서버형 호스팅의 경계를 설명해 주세요."
- "서브 경로에 배포할 때 자산·라우팅 경로를 어떻게 처리하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> Pages는 정적만, 사용자 사이트(username.github.io·1개·루트) vs 프로젝트 사이트(/repo/·서브패스),
> 절대경로 자산 404 → 상대경로/base, SPA fallback을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**GitHub Pages는 저장소에 push한 정적 파일을 URL로 공개한다 — `<username>.github.io` 는 루트,
프로젝트 사이트는 `/<repo>/` 서브패스라 절대경로 자산이 404나므로 상대경로나 `base`/`homepage` 로
경로를 맞추고, SPA는 fallback을 챙긴다.**
