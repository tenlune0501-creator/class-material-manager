---
id: web-foundations/html-structure/markup-conventions-and-entities
chapter: web-foundations/html-structure
title: 마크업 코딩 컨벤션과 특수문자
mastery: understand
lesson_kind: lesson
estimated_minutes: 20
tags: [html, conventions, entities]
related_material_ids:
  - 1o9ZCbrTXf3rAXiub3Jg8qeoG9iLdvhWE              # NHN_Coding_Conventions_for_Markup_Languages.pdf
  - 1-5EX3dXHBagUi4jGWwpIeV5Mo5glLD8gjXcmHDPdWBE   # 특수문자 이름
code_examples:
  - slug: entities
    title: 자주 쓰는 HTML 엔티티
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      &lt;   &gt;      <!-- < >  : 태그로 해석되지 않게 -->
      &amp;            <!-- &    : 앰퍼샌드 자체 -->
      &quot;  &#39;    <!-- " '  : 따옴표 -->
      &nbsp;           <!-- 줄바꿈 안 되는 공백 -->
      &copy;  &reg;    <!-- © ®  -->
      &times;  &middot;  &rarr;   <!-- × · → -->

      <!-- 코드 예시를 화면에 "보여줄" 때: -->
      <pre><code>&lt;div class="box"&gt;내용&lt;/div&gt;</code></pre>
  - slug: conventions
    title: 마크업 컨벤션 예
    source_type: generated_minimal
    language: html
    code: |
      <!-- 소문자 태그·속성, 속성값은 큰따옴표, 2칸 들여쓰기 -->
      <ul class="menu">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>

      <!-- 자기 닫는 요소: <img />, <br />, <input /> (HTML5는 / 생략 가능하나 팀 규칙 따름) -->
      <!-- 의미로 태그 선택: 강조는 <strong>/<em>, 줄바꿈용 <br> 남발 금지 -->
      <!-- 한 줄에 한 블록 요소, 중첩은 들여쓰기로 구조가 보이게 -->
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 코딩 컨벤션이 왜 필요한지(팀이 같은 스타일 → diff·리뷰·유지보수), 대표 규칙 몇 개를 말할 수 있다.
- HTML **엔티티**(`&lt;` `&amp;` `&nbsp;` 등)가 무엇이고 언제 반드시 써야 하는지 안다.
- 화면에 코드나 `<`, `&` 를 "글자로" 보여줄 때 처리할 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 기본 태그·속성. Prettier 같은 포매터의 존재.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 튜토리얼 글에 `<div>` 를 그냥 썼더니 **태그로 해석돼 사라진다**.
- `약관 & 정책` 을 쓰니 일부 브라우저·검증기에서 경고가 난다(`&` 는 엔티티 시작 문자).
- 팀원마다 대문자 태그, 작은따옴표, 4칸 들여쓰기가 뒤섞여 커밋 diff 가 지저분하다.

<!-- section: concept -->
## HTML 엔티티

HTML 에서 `<`, `>`, `&` 는 **문법 문자**다. 이 글자를 화면에 "그대로" 보여주려면 엔티티로 쓴다.

{{code: entities}}

| 쓰고 싶은 것 | 엔티티 |
|---|---|
| `<` `>` | `&lt;` `&gt;` |
| `&` | `&amp;` |
| `"` `'` | `&quot;` `&#39;` |
| 안 깨지는 공백 | `&nbsp;` |
| © ® × · → | `&copy;` `&reg;` `&times;` `&middot;` `&rarr;` |

**반드시 엔티티로**: 본문에 나오는 `<`, `>`, `&` (특히 코드 예시). **선택**: `©` 등은 유니코드 문자를 직접 넣어도 됨(UTF-8).

<!-- section: concept | title: 컨벤션 -->
## 코딩 컨벤션

컨벤션은 "옳고 그름"이 아니라 **팀이 하나로 정한 약속**이다. 그래야 diff 가 깨끗하고 리뷰가 빠르다.
대표적인 것:

{{code: conventions}}

- 태그·속성은 **소문자**. 속성값은 **큰따옴표**.
- 들여쓰기는 **일관되게**(보통 2칸). 중첩 깊이가 그대로 보이게.
- **의미로 태그 선택**: 강조는 `<strong>`(중요) / `<em>`(어조), 줄바꿈만을 위한 `<br>` 남발 금지.
- 한 줄에 블록 요소 하나. 속성이 많으면 줄바꿈.
- 대부분 **Prettier + 팀 설정 파일**(`.prettierrc`, `.editorconfig`)이 자동으로 맞춰 준다 —
  사람이 손으로 지킬 것은 "의미에 맞는 태그 고르기".

<!-- section: must_know -->
## 반드시 기억할 것

- 본문·코드 예시의 `<` `>` `&` 는 **엔티티**(`&lt;` `&gt;` `&amp;`). 안 그러면 태그로 먹힌다.
- 코드를 화면에 보여줄 땐 `<pre><code>` + 엔티티.
- `&nbsp;` 는 "줄바꿈 안 되는 공백" — 레이아웃 땜빵용으로 남용하지 말 것(간격은 CSS).
- 컨벤션은 팀 약속. **포매터(Prettier)에 맡기고**, 사람은 "태그 의미"에 집중.
- 컨벤션 문서가 있으면 프로젝트 루트에 `.prettierrc`/`.editorconfig` 로 강제.

<!-- section: experiment -->
## 직접 해 보기

1. `<p>` 안에 `if (a < b && c > d)` 를 그냥 써 보고 화면에서 사라지는 부분을 확인한 뒤, 엔티티로 고쳐라.
2. `<pre><code>` 로 HTML 스니펫을 화면에 그대로 보여 주는 블록을 만들어라(엔티티 사용).
3. 대문자 태그·작은따옴표·4칸 들여쓰기로 지저분하게 쓴 HTML 을 Prettier(저장 시 포맷)로 정리해 보라.

<!-- section: check_question -->
## 이해 점검

1. `<`, `&` 를 본문에 그냥 쓰면 안 되는 이유는? 각각의 엔티티는?
2. 코드 예시를 화면에 "글자로" 보여주는 태그 조합은?
3. 컨벤션을 사람이 손으로 지키기보다 무엇에 맡기나? 사람이 여전히 신경 쓸 것은?

<!-- section: review -->
## 한 줄 정리

**`<` `>` `&` 는 문법 문자라 화면에 보이려면 엔티티(`&lt;` `&gt;` `&amp;`)로 쓴다 — 코딩 컨벤션은
팀 약속이고 포매터가 대부분 자동으로 맞춰 주므로, 사람은 "의미에 맞는 태그"에 집중한다.**

<!-- section: next -->
## 다음 Chapter

`web-foundations/css-fundamentals` — 이제 이 구조에 스타일을 입힌다.
