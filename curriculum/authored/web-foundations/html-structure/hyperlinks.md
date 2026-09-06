---
id: web-foundations/html-structure/hyperlinks
chapter: web-foundations/html-structure
title: 하이퍼링크
mastery: required
lesson_kind: lesson
estimated_minutes: 25
tags: [html, links, anchor]
related_material_ids:
  - 1H-QRYRa7d_D6R-yy-lncNRj0syxbnrXp3BW2WD8xq1w   # 3. HTML5 하이퍼링크
code_examples:
  - slug: link-kinds
    title: href 로 연결하는 5가지
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!-- 절대경로: 다른 사이트 -->
      <a href="https://example.com/docs/">외부 문서</a>

      <!-- 상대경로: 현재 문서 위치 기준 -->
      <a href="about.html">소개</a>           <!-- 같은 폴더 -->
      <a href="blog/post-1.html">글 1</a>     <!-- 하위 폴더 -->
      <a href="../index.html">홈</a>          <!-- 상위 폴더 -->

      <!-- 페이지 안 특정 위치로 (id) -->
      <a href="#contact">문의로 이동</a>
      ...
      <section id="contact">...</section>

      <!-- 메일 / 전화 -->
      <a href="mailto:hi@example.com">메일 보내기</a>
      <a href="tel:+821012345678">전화</a>

      <!-- 파일 다운로드 -->
      <a href="files/portfolio.pdf" download>이력서 다운로드</a>
  - slug: link-attrs
    title: target 과 안전한 새 창
    source_type: generated_minimal
    language: html
    code: |
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        새 탭에서 열기
      </a>
      <!-- target="_blank" 로 새 탭. rel="noopener noreferrer" 는
           새 탭이 원래 페이지를 조작하지 못하게 + referrer 를 안 넘김.
           외부 링크 새 창에는 관례적으로 함께 쓴다. -->

      <a href="#">아직 없는 링크</a>   <!-- href="#" = 페이지 맨 위로. 임시 placeholder -->
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `<a href>` 로 **외부 사이트 / 같은 사이트의 다른 페이지 / 페이지 안 위치 / 메일·전화 / 파일 다운로드**를 각각 연결할 수 있다.
- **절대경로와 상대경로**(`./`, `../`)를 구분해서 쓴다.
- `target="_blank"` 로 새 탭을 열 때 `rel="noopener noreferrer"` 를 왜 붙이는지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 태그·속성 문법. 폴더 구조(상위/하위) 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 내 PC 에선 링크가 되는데 배포하면 깨진다 → 절대경로(`C:/Users/...` 또는 `file://`)를 썼기 때문.
- "About" 링크가 항상 홈으로 간다 → `href="#"` 를 안 바꿨다.
- 외부 링크를 새 탭으로 열었더니 보안 경고 → `rel` 을 안 붙였다.

링크는 웹을 "웹"이게 하는 것이다. 경로만 정확히 이해하면 대부분 해결된다.

<!-- section: concept -->
## `<a href="...">` — 무엇을 넣나

{{code: link-kinds}}

- **절대경로** — `https://...` 로 시작. 어디서 열어도 같은 곳. 외부 사이트에 쓴다.
- **상대경로** — 현재 문서 위치 기준. `about.html`(같은 폴더), `blog/x.html`(하위),
  `../index.html`(상위). **사이트 내부 링크는 상대경로**가 이사·배포에 안전하다.
- **`#id`** — 같은 페이지의 `id="..."` 요소로 스크롤. `href="#contact"` ↔ `<section id="contact">`.
- **`mailto:` / `tel:`** — 메일 앱 / 전화 앱 실행.
- **`download`** — 열지 말고 내려받게.

<!-- section: mechanism -->
## target 과 rel

{{code: link-attrs}}

- `target="_self"`(기본) — 현재 탭에서 이동. `target="_blank"` — 새 탭.
- 새 탭 링크에는 **`rel="noopener noreferrer"`** 를 관례적으로 붙인다:
  - `noopener` — 새로 열린 페이지가 `window.opener` 로 **원래 페이지를 조작**하지 못하게(보안).
  - `noreferrer` — 어디서 왔는지(referrer) 를 상대에게 안 알림.
- HTML5 부터 `<a>` 안에 `<p>`, `<section>` 같은 **블록 요소**도 넣을 수 있다(카드 전체를 링크로).

<!-- section: must_know -->
## 반드시 기억할 것

- 사이트 **내부** 링크는 **상대경로**. `file://` 이나 로컬 절대경로 금지 — 배포하면 깨진다.
- `href="#"` 는 "맨 위로" = 아직 목적지 없는 임시 링크. 배포 전에 실제 경로로.
- `#id` 링크의 목적지에는 그 `id` 를 가진 요소가 실제로 있어야 한다.
- 새 탭(`target="_blank"`) 외부 링크에는 `rel="noopener noreferrer"`.
- 링크 텍스트는 "여기 클릭" 대신 **목적지를 설명**("이력서 PDF")— 접근성·SEO.

<!-- section: experiment -->
## 직접 해 보기

1. `index.html` 과 `about.html`, `blog/post.html` 을 만들어 서로 상대경로로 오가게 하라.
   `blog/post.html` 에서 홈으로 가는 링크는 `../index.html`.
2. 긴 페이지에 목차를 만들어라: `<a href="#s1">1장</a>` … `<h2 id="s1">1장</h2>`. 클릭 시 스크롤 확인.
3. 외부 링크를 `target="_blank"` 로 열고, `rel` 을 뺐다 넣었다 하며 개발자도구 콘솔의 경고를 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `blog/post.html` 에서 같은 폴더의 `list.html`, 상위 폴더의 `index.html` 로 가는 `href` 는?
2. `href="#"` 를 배포 전에 반드시 바꿔야 하는 이유는?
3. `target="_blank"` 에 `rel="noopener noreferrer"` 를 붙이는 이유 2가지는?

<!-- section: review -->
## 한 줄 정리

**`<a href>` 는 절대경로(외부)·상대경로(내부, `./` `../`)·`#id`(페이지 안)·`mailto:`/`tel:`·`download`
로 연결하며, 새 탭 외부 링크에는 `rel="noopener noreferrer"` 를 붙인다.**

<!-- section: next -->
## 다음 Lesson

`html-structure/forms` — 사용자 입력을 받는 `<form>` 과 `<input>`.
