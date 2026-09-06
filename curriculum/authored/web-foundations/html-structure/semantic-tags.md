---
id: web-foundations/html-structure/semantic-tags
chapter: web-foundations/html-structure
title: HTML5 시맨틱 태그
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [html, semantic, structure]
related_material_ids:
  - 1jvP8IQ6HunrlbFLJYd2UoHS4kBFUqSk6bwXJ-wUzqWk   # 1. HTML5의 시맨틱 태그
  - 1hMS4ne2bcesEkboVYloviQj_H5MR6IvV              # HTML_BASIC_BASE.zip
  - 13XVJT8KzkXeg6LArIdFSL8yrjw34vQ_4              # HTML_BASIC_FINAL_V202604.zip
  - 1afi7aBfZ-6gwlgtufgR5G0S-xBpE0HMa              # WSP_01_HTML_2020_v.pdf
sources:
  - reference_slug: html/section-일반-구획-요소
  - reference_slug: html/article
code_examples:
  - slug: doc-skeleton
    title: HTML 문서의 기본 골격
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>문서 제목</title>
        </head>
        <body>
          <!-- 화면에 보이는 내용은 전부 여기 -->
        </body>
      </html>
  - slug: div-soup
    title: div 만 쓴 레이아웃 (의미 없음)
    source_type: generated_minimal
    language: html
    code: |
      <div id="header"><h1>사이트</h1></div>
      <div id="nav"> ... 메뉴 ... </div>
      <div id="content"> ... 본문 ... </div>
      <div id="footer"> ... 저작권 ... </div>
      <!-- 브라우저·검색엔진·스크린리더에게 이 div 들은 전부 "그냥 상자" 다. -->
  - slug: semantic-layout
    title: 같은 레이아웃, 시맨틱 태그로
    source_type: generated_minimal
    language: html
    code: |
      <header>
        <h1>사이트</h1>
      </header>

      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>

      <main>
        <section>
          <h2>공지</h2>
          <article>
            <h3>HTML5란?</h3>
            <p>2014년 표준으로 확정된 마크업 언어.</p>
          </article>
        </section>
        <aside>
          <p>관련 링크 · 배너 (본문보다 비중 낮음)</p>
        </aside>
      </main>

      <footer>
        <address>
          <time datetime="2026-09-06">2026년 9월</time>
        </address>
      </footer>
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 시맨틱 태그가 **무엇을 위한 것인지**(검색엔진·스크린리더·유지보수를 위해 소스에 "의미"를 담는 것) 설명할 수 있다.
- `header` / `nav` / `main` / `section` / `article` / `aside` / `footer` 를 **역할에 맞게 배치해 페이지 골격을 직접 짤 수 있다.**
- `section` 과 `article`, `section` 과 `div` 를 언제 쓰는지 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 태그가 `<시작>내용</끝>` 형태라는 것, 중첩 개념.
- 제목 태그 `h1`~`h6`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

예전 방식: 화면을 전부 `<div id="header">`, `<div id="nav">` … 로 만든다.

{{code: div-soup}}

브라우저에겐 문제없다. 하지만 —

- **검색엔진**은 사람이 보는 화면이 아니라 **소스**를 읽는다. `div` 만 있으면 "어디가 본문이고 어디가 메뉴인지" 모른다.
- **스크린리더** 사용자는 "본문으로 건너뛰기"를 못 한다(`main` 이 없으니).
- **다른 개발자**(6개월 뒤의 나 포함)는 `id` 이름에 의존해서 구조를 짐작해야 한다.

시맨틱 태그는 **소스 레벨에서 각 구역의 의미를 선언**한다.

<!-- section: concept -->
## 문서 골격 태그

{{code: doc-skeleton}}

- `<!DOCTYPE html>` — 이 문서가 HTML5임을 선언. 첫 줄.
- `<head>` — 화면에 안 보이는 문서 정보(제목, 인코딩, viewport, CSS 연결).
- `<body>` — 화면에 보이는 모든 것.

### 구역(landmark) 태그

| 태그 | 역할 |
|---|---|
| `<header>` | 머리 영역 — 로고, 사이트 제목, 상단 소개. (특정 `article`/`section` 안에서도 그 부분의 머리로 쓸 수 있음) |
| `<nav>` | 주요 내비게이션 메뉴 |
| `<main>` | 이 페이지의 **핵심 본문**. 페이지당 **하나**. |
| `<section>` | 내용의 한 "절/장". **제목(`h2` 등)을 동반**하는 것이 원칙 |
| `<article>` | 그 자체로 **독립적으로 말이 되는** 덩어리 — 기사, 블로그 글, 댓글, 상품 카드 |
| `<aside>` | 본문보다 비중 낮은 곁가지 — 사이드바, 관련 링크, 배너 |
| `<footer>` | 바닥 영역 — 저작권, 제작자, 연락처 |

<!-- section: mechanism -->
## section vs article vs div — 무엇을 언제

- **`article`**: "이걸 잘라내서 다른 곳에 붙여도 말이 되나?" → 그렇다면 `article`. (뉴스 기사, 상품, 댓글 하나)
- **`section`**: 주제로 묶인 한 덩어리인데 독립적이진 않음. **제목이 붙는다.** (한 페이지의 "소개", "후기" 구역)
- **`div`**: **의미는 없고 스타일/스크립트 때문에 묶어야 할 때만.** 시맨틱 태그로 표현이 안 될 때 최후로.

`article` 안에 `section` 이 올 수도, `section` 안에 여러 `article` 이 올 수도 있다. 정답은
"이 덩어리의 성격"에 달렸다.

{{code: semantic-layout}}

<!-- section: must_know -->
## 반드시 기억할 것

- `<main>` 은 페이지당 하나. `<header>`/`<footer>` 는 페이지 전체용 + 각 `article`/`section` 내부용 둘 다 가능.
- `<section>` 은 **제목을 동반**한다. 제목 없이 그냥 묶는 거라면 `div`.
- `article` 판별: **떼어내도 말이 되는가.**
- `div`/`span` 은 "의미 없음"이 특징이다 — 시맨틱 태그가 있으면 그걸 먼저.
- 시맨틱 태그도 기본 스타일은 거의 없다. **레이아웃은 CSS 가 한다**(다음 챕터). 태그는 "의미"만.
- `<figure>`+`<figcaption>` 은 이미지와 그 설명을 묶고, `<time datetime="...">` 은 기계가 읽을 시각.

<!-- section: experiment -->
## 직접 해 보기

1. `div-soup` 를 `semantic-layout` 처럼 시맨틱 태그로 바꿔라. 브라우저 화면은 거의 안 변한다 —
   개발자도구로 구조를 비교해 보라.
2. 블로그 글 목록 페이지를 마크업하라: `header`(제목) + `nav` + `main` 안에 글 3개를 `article` 로,
   각 `article` 은 `<header><h2>제목</h2><time></time></header>` + `<p>`. 사이드바는 `aside`.
3. `section` 을 제목 없이 써 보고, W3C validator(<https://validator.w3.org/>)로 검사해 경고를 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `div` 대신 시맨틱 태그를 쓰면 **누가** 이득을 보나? (3주체)
2. 상품 카드 하나는 `section` 인가 `article` 인가? 판별 기준은?
3. 한 페이지에 `<main>` 이 두 개 있으면?
4. 시맨틱 태그를 썼는데 레이아웃이 안 잡힌다 — 왜? 무엇이 레이아웃을 하나?

<!-- section: interview_question -->
## 면접 대비

- "시맨틱 마크업이 왜 중요한가요? SEO·접근성 관점에서 설명해 주세요."
- "`section`, `article`, `div` 를 고르는 기준은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 시맨틱 태그의 목적 한 문장, landmark 태그 7개의 역할, article 판별 기준, section이 동반하는 것,
> div 를 쓰는 경우를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**시맨틱 태그는 소스에 "이 구역이 무엇인지"를 선언한다 — 검색엔진·스크린리더·동료를 위해.
`header/nav/main/section/article/aside/footer` 로 골격을 짜고, 의미가 없을 때만 `div` 를 쓴다.
모양은 CSS 가 한다.**

<!-- section: next -->
## 다음 Lesson

`html-structure/hyperlinks` — 페이지와 페이지, 리소스를 잇는 `<a>`.
