---
id: tooling-and-collaboration/github-workflow/writing-a-readme
chapter: tooling-and-collaboration/github-workflow
title: README.md 작성법
mastery: understand
lesson_kind: lesson
estimated_minutes: 20
tags: [github, readme, documentation, markdown]
related_material_ids:
  - 1p595QXIctbX-CW7R7cSYOZfV_9UPWxJcXYV2OU8f-UQ   # Readme.md 작성법
prerequisites:
  - tooling-and-collaboration/github-workflow/github-desktop
code_examples:
  - slug: markdown-basics
    title: Markdown 핵심 문법
    source_type: generated_minimal
    language: markdown
    is_canonical: true
    code: |
      # 제목 (H1)        ## 소제목 (H2)      ### 더 작게 (H3)
      # 과 글자 사이는 반드시 띄운다. 최대 H6.

      - 순서 없는 목록 (또는 * , +)
        - 들여쓰기로 하위 항목
      1. 순서 있는 목록
      2. 숫자는 순서대로 렌더된다

      **굵게**   *기울임*   `인라인 코드`   > 인용구

      ```js
      // 언어를 붙이면 문법 강조
      console.log("hello");
      ```

      | 항목 | 설명 |
      | :--- | :--- |
      | 소개 | 첫 줄<br>둘째 줄 |   <!-- 셀 안 줄바꿈은 <br> -->

      [링크 텍스트](https://example.com)
      ![이미지 대체텍스트](./public/readme/screenshot.png)
      ---   <!-- 수평선 -->
  - slug: readme-skeleton
    title: 프로젝트 README 뼈대
    source_type: generated_minimal
    language: markdown
    code: |
      # 프로젝트 이름

      한 줄 소개 — 이게 무엇이고 누구를 위한 것인가.

      ## 미리보기
      ![스크린샷](./docs/preview.png)

      ## 기술 스택
      React · Vite · TypeScript

      ## 실행 방법
      ```bash
      npm install
      npm run dev
      ```

      ## 폴더 구조
      - `src/` 소스
      - `public/` 정적 자원

      ## 배포 주소
      https://example.com
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- README 가 저장소에서 **어떤 역할**을 하는지(첫 화면, "이게 뭐고 어떻게 돌리나"의 답) 안다.
- Markdown 핵심 문법(제목·목록·코드블록·표·링크·이미지)을 **읽고 쓸 수 있다.**
- 포트폴리오/팀 프로젝트 README 에 무엇을 담아야 하는지 뼈대를 말할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- GitHub 저장소를 만들고 파일을 커밋해 본 경험. (→ `github-workflow/github-desktop`)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

저장소를 열었는데 README 가 없거나 "test" 한 줄이면 — 채용 담당자든 팀원이든
**이게 뭔지, 어떻게 실행하는지** 알 수 없어서 그냥 닫는다.
README 는 GitHub 저장소 첫 화면에 그대로 렌더되는 **프로젝트의 얼굴**이다.

<!-- section: concept -->
## Markdown 이란

Markdown 은 **기호 몇 개로 서식을 만드는 경량 문법**이다(`# 제목`, `- 목록`, `**굵게**`).
`.md` 파일이면 GitHub·VS Code 가 자동으로 예쁘게 렌더한다. GitHub 은 여기에 표·체크박스·
문법 강조를 더한 **GFM(GitHub Flavored Markdown)** 을 쓴다.

{{code: markdown-basics}}

<!-- section: must_know -->
## 반드시 기억할 것

- `#` 과 제목 텍스트 사이는 **꼭 띄운다** (`#제목` ❌ → `# 제목` ✅).
- 코드블록은 앞뒤로 빈 줄. ``` ``` `` 뒤에 언어(`js`, `bash`)를 붙이면 강조된다.
- 표는 **헤더 한 줄 + 구분선(`| --- |`) 한 줄 + 데이터 행**. `:` 위치로 정렬. 셀 줄바꿈은 `<br>`.
- 이미지는 `![대체텍스트](경로)` — 저장소 안 파일은 상대경로(`./docs/preview.png`)가 안전.
- 링크는 `[텍스트](url)`. 저장소 내부 파일도 `[문서](docs/guide.md)` 로 링크 가능.

<!-- section: concept | title: README 뼈대 -->
## README 에 담을 것

{{code: readme-skeleton}}

최소한: **한 줄 소개 · 미리보기(스크린샷/GIF) · 기술 스택 · 실행 방법 · 배포 주소**.
포트폴리오라면 "내가 맡은 부분"과 "특히 봐줬으면 하는 코드"를 링크로.

<!-- section: experiment -->
## 직접 해 보기

1. 빈 저장소에 위 뼈대로 `README.md` 를 만들어 커밋하고, GitHub 첫 화면에 렌더되는 것을 확인하라.
2. 표를 하나 넣어 정렬(`:---`, `:---:`, `---:`)을 바꿔 보고, 셀에 `<br>` 로 줄바꿈을 넣어 보라.
3. 스크린샷 이미지를 `docs/` 에 넣고 상대경로로 참조하라. 절대경로(로컬 파일 경로)로 하면 왜 안 되는지 생각해 보라.

<!-- section: check_question -->
## 이해 점검

1. `#제목` 이 제목으로 렌더되지 않는 이유는?
2. GitHub 표의 최소 구성 3줄은?
3. README 이미지에 로컬 절대경로를 쓰면 안 되는 이유는?

<!-- section: review -->
## 한 줄 정리

**README 는 저장소의 첫 화면 = "이게 뭐고 어떻게 돌리나"의 답이다 — Markdown 으로 소개·미리보기·
스택·실행법·배포주소를 담고, 이미지는 저장소 안 상대경로로 참조한다.**

<!-- section: next -->
## 다음 Lesson

`diagrams-and-docs/drawing-diagrams` — 구조·흐름을 그림으로 남기기.
