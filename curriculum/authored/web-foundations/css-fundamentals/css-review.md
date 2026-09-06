---
id: web-foundations/css-fundamentals/css-review
chapter: web-foundations/css-fundamentals
title: HTML·CSS 종합 리뷰
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [css, review]
related_material_ids:
  - 1xqF2yfWDNjs4FDCKRQAK07YrENv2qFowTcC2nk7l27Y   # 00_REVIEW_02_HTML&CSS
  - 1akfI8Q-Wul3qWhu1vSZUI-PI2KVkKMKJDYNEQdeiPbc   # 00_REVIEW_03_CSS REVIEW2
code_examples:
  - slug: page-scaffold
    title: 리뷰용 페이지 뼈대
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>내 프로필</title>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <header><h1>내 프로필</h1></header>
          <nav><a href="#work">작업</a> <a href="#contact">연락</a></nav>
          <main>
            <section id="work">
              <h2>작업</h2>
              <article class="card">
                <h3>프로젝트 A</h3>
                <p>한 줄 소개</p>
              </article>
            </section>
            <section id="contact">
              <h2>연락</h2>
              <address><a href="mailto:me@example.com">me@example.com</a></address>
            </section>
          </main>
          <footer><p>&copy; 2026</p></footer>
        </body>
      </html>
  - slug: base-css
    title: 거의 모든 프로젝트가 시작하는 CSS
    source_type: generated_minimal
    language: css
    code: |
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.6; color: #222; }
      img { max-width: 100%; height: auto; display: block; }
      a { color: inherit; }

      .card { padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
      .card + .card { margin-top: 12px; }   /* 인접 형제에만 간격 */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 지금까지 배운 것(문서 골격 · 시맨틱 태그 · 링크 · 폼 · 선택자 · 캐스케이드 · 박스모델 · display · position · background)을
  **하나의 페이지로 조립할 수 있다.**
- "안 먹히는 CSS" 를 개발자도구로 **스스로 진단**할 수 있다.
- 새 프로젝트마다 반복되는 기본 CSS(리셋/베이스)를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `html-structure/*` 전체, `css-fundamentals/selectors-and-cascade`, `box-model-and-positioning`, `backgrounds-and-sprites`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

각 개념은 알겠는데 **막상 페이지 하나를 처음부터 못 만든다** — 어디서 시작하고, 무엇이 무엇을 밀어내고,
왜 이 요소가 저기 있는지 설명을 못 한다. 리뷰는 조각을 한 흐름으로 꿰는 단계다.

<!-- section: concept -->
## 페이지를 만드는 순서

1. **문서 골격** — `<!DOCTYPE>` / `<head>`(charset, viewport, title, `<link>` CSS) / `<body>`.
2. **시맨틱 구조 먼저** — `header` / `nav` / `main` / `section` / `article` / `footer`. **스타일 없이도 목차가 읽히게.**
3. **베이스 CSS** — `box-sizing: border-box`, body margin 0, 폰트·줄간격, `img { max-width: 100% }`.
4. **구역별 스타일** — 위에서 아래로, 큰 것(레이아웃)부터 작은 것(색·간격)으로.
5. **반응형** — 마지막에 (다음 챕터들).

{{code: page-scaffold}}
{{code: base-css}}

<!-- section: mechanism -->
## "왜 안 먹히지" 진단 순서 (개발자도구)

1. **Elements 패널**에서 그 요소를 선택 → 오른쪽 **Styles** 를 본다.
2. 내가 준 규칙이 **취소선**(overridden)인가? → **캐스케이드**: 다른 규칙이 명시도/순서로 이겼다. 이긴 규칙을 찾는다.
3. 규칙이 아예 **안 보이는가?** → 선택자 오타, 파일이 연결 안 됨(`<link>` 경로), 캐시.
4. 규칙은 먹는데 **위치가 이상**한가? → 박스모델(padding/border/box-sizing), margin 겹침, `display`(inline?), `position`.
5. **Computed 탭**에서 최종 계산값 확인. **Layout**(박스 그림)으로 4겹 상자 시각화.

<!-- section: must_know -->
## 반드시 기억할 것

- **시맨틱 HTML → 베이스 CSS → 레이아웃 → 디테일** 순서. HTML 을 CSS 로 억지로 교정하지 말고 구조를 먼저 바로.
- 안 먹히면 **개발자도구 Styles 패널**이 답을 준다: 취소선(캐스케이드 패배) / 없음(선택자·연결) / 위치(박스모델).
- `* { box-sizing: border-box; }` + `body { margin: 0 }` + `img { max-width: 100% }` 는 사실상 표준 시작.
- 명시도는 낮고 평평하게(클래스), `!important` 금지, 상하 margin 겹침 유의.
- 간격은 **한 방향으로 일관되게**(예: 항상 `margin-bottom` 또는 `.a + .a { margin-top }`).

<!-- section: mission -->
## 미션 — 프로필 페이지

`page-scaffold` 를 확장해 1페이지 프로필을 만들어라.

- 시맨틱 구조: `header`(이름) · `nav`(앵커 링크) · `main` 안에 `section#about` / `section#work`(카드 3개 `article`) / `section#contact`(연락 폼) · `footer`.
- 카드: `border` + `border-radius` + `padding`, 카드 사이 간격은 `.card + .card` 로만.
- 상단 `nav` 를 `position: sticky; top: 0` 로 고정.
- 우상단에 "이력서 PDF" 링크(새 탭, `rel` 포함).
- 폼: 이름(`required`) · 이메일(`type="email"`) · 메시지(`textarea`), `<label>` 연결.
- 배경: `header` 에 `background: linear-gradient(...)` 또는 이미지 `cover`.
- 배포 전 체크: 모든 `href="#"` 를 실제 앵커로, 모든 `<img>` 에 `alt`, `<a target="_blank">` 에 `rel`.

<!-- section: check_question -->
## 이해 점검

1. 페이지를 만들 때 HTML 구조와 CSS 중 무엇을 먼저, 왜?
2. 내 CSS 규칙에 취소선이 그어져 있다 — 무엇을 확인하나?
3. 규칙이 Styles 패널에 아예 없다 — 원인 후보 3개는?
4. 카드 3개 사이에만 간격을 주는 선택자는? (첫 카드 위엔 간격 없이)

<!-- section: interview_question -->
## 면접 대비

- "새 페이지를 처음부터 만들 때 어떤 순서로 작업하나요?"
- "CSS 가 적용되지 않을 때 어떻게 디버깅하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 페이지 제작 5단계, 베이스 CSS 3줄, 개발자도구로 "안 먹히는 CSS" 진단하는 순서를 말하고,
> 프로필 페이지를 코드 없이 구조로 설명하기.

<!-- section: review -->
## 한 줄 정리

**시맨틱 HTML 로 목차부터 세우고, 베이스 CSS → 레이아웃 → 디테일 순으로 스타일한다 —
안 먹히면 개발자도구 Styles 패널의 취소선·부재·박스모델을 순서대로 확인한다.**

<!-- section: next -->
## 다음 Chapter

`web-foundations/css-layout-flexbox` — 이제 요소를 줄 세우고 정렬한다.
