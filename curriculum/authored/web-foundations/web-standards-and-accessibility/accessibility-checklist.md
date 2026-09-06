---
id: web-foundations/web-standards-and-accessibility/accessibility-checklist
chapter: web-foundations/web-standards-and-accessibility
title: 웹접근성 체크리스트
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [accessibility, a11y, wcag, web-standards]
related_material_ids:
  - 1-I_e9yiEaL4hH-5vbA7sntQQ6piAoeurEMT1B1eBF2M   # 웹접근성 체크리스트 (NWCAG 기반)
  - 1FJRCOzictcVSZKBlfLt6FVgBPRAp4EDj
prerequisites:
  - web-foundations/html-structure/semantic-tags
  - web-foundations/html-structure/forms
code_examples:
  - slug: images
    title: 이미지 대체 텍스트
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <img src="chart.png" alt="2026년 분기별 매출: 1분기 대비 4분기 32% 증가">
      <img src="divider.svg" alt="">          <!-- 장식용은 빈 alt (스크린리더가 건너뜀) -->
      <button aria-label="메뉴 열기"><svg>…</svg></button>   <!-- 아이콘 버튼엔 이름 -->
  - slug: semantics
    title: 의미있는 마크업 + 폼 라벨
    source_type: generated_minimal
    language: html
    code: |
      <header> <nav aria-label="주 메뉴"> … </nav> </header>
      <main>                          <!-- 페이지당 하나. 스킵 링크의 도착점 -->
        <h1>글 제목</h1>              <!-- h1 하나, h2→h3 순서 건너뛰지 않기 -->
        <a class="skip" href="#main">본문 바로가기</a>
      </main>

      <label for="email">이메일</label>
      <input id="email" type="email" required
             aria-describedby="email-hint">
      <p id="email-hint">회사 이메일을 입력하세요</p>
      <!-- label 의 for = input 의 id. placeholder 는 label 을 대체하지 못한다 -->
  - slug: keyboard
    title: 키보드 · 포커스
    source_type: generated_minimal
    language: css
    code: |
      /* 포커스 링을 지우지 말 것. 디자인이 필요하면 대체 스타일 */
      :focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }

      /* 클릭 가능한 건 <button>/<a> 로. <div onclick> 은 키보드로 못 누른다 */
      /* 부득이 커스텀 위젯이면: tabindex="0" + role + keydown(Enter/Space) 처리 */
  - slug: dynamic
    title: 동적 변화 알리기 (live region)
    source_type: generated_minimal
    language: html
    code: |
      <div role="status" aria-live="polite" id="toast"></div>
      <!-- JS: toast.textContent = "저장되었습니다" → 스크린리더가 읽어줌 -->

      <button aria-expanded="false" aria-controls="menu">메뉴</button>
      <ul id="menu" hidden>…</ul>
      <!-- 열리면 aria-expanded="true" + hidden 제거. 상태를 ARIA 로 반영 -->
  - slug: color
    title: 색만으로 정보 전달 금지 + 명도 대비
    source_type: generated_minimal
    language: text
    code: |
      # ❌ "빨간 항목이 필수입니다"        → 색맹 사용자가 구분 못 함
      # ✅ 색 + 아이콘/텍스트("* 필수") 병행
      # 명도 대비: 본문 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상 (WCAG AA)
      # 도구: DevTools 색상 피커의 contrast 표시, Lighthouse, axe DevTools
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 이미지 `alt`(의미/장식/아이콘 버튼)를 상황에 맞게 작성한다.
- 의미있는 마크업(`header`/`nav`/`main`/`h1~h6` 순서)과 **`label`↔`for`** 연결, 스킵 링크를 적용한다.
- 키보드만으로 조작 가능하게 만들고 **포커스 표시를 지우지 않는다**. `<div onclick>` 대신 `<button>`.
- 동적 변화(토스트, 메뉴 열림)를 `aria-live`/`aria-expanded` 로 알린다.
- 색만으로 정보를 전달하지 않고 명도 대비(AA 4.5:1)를 지킨다.
- Lighthouse/axe 로 점검한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 시맨틱 HTML, 폼 요소(`label`/`input`), 기본 CSS.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 스크린리더 사용자는 `alt` 없는 이미지·아이콘 버튼이 뭔지 모른다.
- `placeholder` 만 있는 입력창은 포커스하면 안내가 사라진다.
- `<div onclick>` 버튼은 키보드 사용자가 아예 못 누른다.
- `outline: none` 으로 포커스 링을 지워 키보드 위치를 알 수 없다.
- "저장됨" 토스트가 화면에만 떠서 스크린리더는 침묵.

<!-- section: concept -->
## 기본기 — alt, 시맨틱, 라벨

{{code: images}}

- 정보 전달 이미지엔 **내용을 요약한 `alt`**, 순수 장식엔 `alt=""`(빈 문자열), 아이콘 버튼엔 `aria-label`.

{{code: semantics}}

- `header`/`nav`/`main`/`footer` 로 영역을 구분(스크린리더의 "랜드마크"). `main` 은 페이지당 하나.
- 제목은 `h1` 하나, `h2 → h3` 순서를 건너뛰지 않기(문서 개요가 목차가 된다).
- **모든 입력에 `label`**, `for` = `input` 의 `id`. `placeholder` 는 라벨을 대신하지 못한다. 부가 설명은 `aria-describedby`.
- 반복 메뉴 위에 "본문 바로가기" 스킵 링크.

<!-- section: mechanism -->
## 키보드·동적 상태·색

{{code: keyboard}}

- 클릭 가능한 것은 `<button>`/`<a>` — 자동으로 포커스·Enter/Space 가 된다. `<div>` 로 만들면 `tabindex`+`role`+키 핸들러를 직접 다 해야 한다.
- **포커스 스타일을 지우지 말 것**. 디자인이 필요하면 `:focus-visible` 로 예쁘게 대체.
- 포커스 순서는 DOM 순서를 따른다. `tabindex` 양수 남용 금지.

{{code: dynamic}}

- 화면만 바뀌고 소리로 안 알리면 스크린리더 사용자는 모른다. **`aria-live="polite"`**(또는 `role="status"`)로 변경을 읽게.
- 토글 버튼은 `aria-expanded`, 연 대상은 `aria-controls`. 상태가 바뀌면 ARIA 값도 갱신.

{{code: color}}

- 색상만으로 상태를 표현하지 않기(색맹). 색 + 아이콘/텍스트 병행.
- 명도 대비: 본문 4.5:1, 큰 글자 3:1 이상(WCAG AA). DevTools contrast, Lighthouse, axe DevTools 로 확인.

<!-- section: must_know -->
## 반드시 기억할 것

- `alt`: 정보=요약, 장식=`""`, 아이콘 버튼=`aria-label`.
- `header`/`nav`/`main`(하나)/`footer` + `h1` 하나 + 제목 레벨 순서. 스킵 링크.
- 모든 입력에 `label for` = `input id`. `placeholder` ≠ 라벨.
- 클릭요소는 `<button>`/`<a>`. **포커스 링 지우지 않기**(`:focus-visible` 로 대체).
- 동적 변화는 `aria-live`/`role="status"`, 토글은 `aria-expanded`.
- 색만으로 전달 금지. 명도 대비 AA(4.5:1). Lighthouse/axe 로 점검.

<!-- section: mission -->
## 미션 — 접근성 리팩터링

기존 페이지(또는 이전 실습 결과물)를 재료로.

- 모든 이미지 `alt` 정리(정보/장식/아이콘 구분). 아이콘 버튼에 `aria-label`.
- `div` 로 만든 메뉴/버튼을 `<button>`/`<a>` + `<nav>` 로 교체. 스킵 링크 추가.
- 폼: 모든 입력에 `label for`, 오류 메시지를 `aria-describedby` + `aria-live` 로 연결, 오류 시 첫 오류로 포커스 이동.
- 드롭다운/아코디언에 `aria-expanded`/`aria-controls` 적용, 키보드(Enter/Space/Esc) 동작.
- `:focus-visible` 포커스 스타일 통일.
- Lighthouse Accessibility 점수와 axe DevTools 로 전/후 비교, 남은 이슈 3개 기록.

<!-- section: check_question -->
## 이해 점검

1. 장식용 이미지의 `alt` 는? 정보 전달 이미지는? 아이콘 버튼은?
2. `placeholder` 로 라벨을 대신하면 안 되는 이유는?
3. `<div onclick>` 버튼의 접근성 문제와 올바른 대안은?
4. "저장되었습니다" 를 스크린리더가 읽게 하려면?

<!-- section: interview_question -->
## 면접 대비

- "웹 접근성을 어디서부터 점검하나요? (자동화 도구 + 수동)"
- "`aria-*` 를 남용하면 왜 문제가 되나요? (네이티브 요소 우선)"
- "키보드 접근성 테스트를 어떻게 하나요?"

<!-- section: review -->
## 한 줄 정리

**정보/장식/아이콘에 맞는 `alt`, 시맨틱 랜드마크 + 제목 순서 + `label for`, 클릭요소는 네이티브 `<button>`/`<a>` 로
포커스 링을 살리고, 동적 변화는 `aria-live`/`aria-expanded`, 색만으로 전달 금지 + 명도 대비 AA — Lighthouse/axe 로 확인.**

<!-- section: next -->
## 다음 Lesson

`web-standards-and-accessibility/document-load-order` — 리소스 연결과 로드 순서.
