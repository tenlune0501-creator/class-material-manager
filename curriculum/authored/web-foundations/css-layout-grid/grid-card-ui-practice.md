---
id: web-foundations/css-layout-grid/grid-card-ui-practice
chapter: web-foundations/css-layout-grid
title: 실전 — Grid로 카드 UI와 깨진 그리드
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [css, grid, flexbox, card-ui, practice]
related_material_ids:
  - 14HwGstOvQePEM5PQdHBEYekTP0S9Zqzv              # Css-grid-and-flexbox-the-card-ui_base.zip
  - 1I5X4dKGlBct5B4fa134Swv66QyAPS8iS              # breaking-the-grid_base.zip
  - 14SBZAa_l-r1n7rhG66IK6m8UPwpy5qZY              # polishing-the-broken-grid_base.zip
  - 1VjoCLp9Ge90zSLR-uMSR_KtbXIFb2XRT              # polishing-the-broken-grid_final_v202605.zip
code_examples:
  - slug: card-grid
    title: 카드 그리드 (Grid) + 카드 내부 (Flexbox)
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      /* 바깥: Grid 로 카드를 격자에 */
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 24px;
      }

      /* 안쪽: Flexbox 로 카드 내부를 세로 흐름 + 버튼을 바닥에 */
      .card {
        display: flex;
        flex-direction: column;
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        overflow: hidden;
      }
      .card img { aspect-ratio: 16 / 9; object-fit: cover; width: 100%; }
      .card__body { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
      .card__title { font-weight: 600; }
      .card__desc  { color: #666; font-size: 14px; }
      .card__cta   { margin-top: auto; }   /* ★ 설명 길이가 달라도 버튼은 항상 바닥 */
  - slug: break-grid
    title: 규칙적인 그리드를 의도적으로 깨기
    source_type: generated_minimal
    language: css
    code: |
      .gallery {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-auto-rows: 160px;
        gap: 12px;
      }
      .gallery .feature { grid-column: span 2; grid-row: span 2; }  /* 큰 타일 */
      .gallery .wide    { grid-column: span 2; }
      .gallery .tall    { grid-row: span 2; }
      /* 남는 구멍이 신경 쓰이면 .gallery { grid-auto-flow: dense; } (순서 주의) */
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **바깥 레이아웃은 Grid, 카드 내부는 Flexbox** 라는 실무 조합을 쓸 수 있다.
- 카드 높이가 제각각이어도 **버튼을 카드 바닥에 정렬**(`margin-top: auto`)할 수 있다.
- `grid-column: span N` / `grid-row: span N` 으로 일부 타일을 크게 만들어 "깨진 그리드"(불규칙 갤러리)를 만들 수 있다.
- `aspect-ratio` + `object-fit: cover` 로 썸네일 비율을 고정한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `css-layout-grid/grid-core`, `grid-areas-and-auto-flow`, `css-layout-flexbox/flexbox-core`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 카드마다 설명 길이가 달라서 "더 보기" 버튼 위치가 들쭉날쭉하다.
- 썸네일 이미지 비율이 제각각이라 카드가 삐뚤빼뚤하다.
- 갤러리에서 특정 사진만 크게 보여주고 싶은데 억지로 별도 마크업을 만든다.

<!-- section: concept -->
## Grid + Flexbox 조합

**바깥(카드들의 배치)** = Grid. `repeat(auto-fill, minmax(260px, 1fr))` 로 반응형.
**안쪽(카드 하나의 내부)** = Flexbox. 세로 흐름(`flex-direction: column`) + `margin-top: auto` 로 버튼 고정.

{{code: card-grid}}

- `.card { display: flex; flex-direction: column; }` → 이미지 / 본문 / 버튼이 세로로.
- `.card__body { flex: 1; }` → 본문이 남는 높이를 먹어 카드 높이를 채운다.
- **`.card__cta { margin-top: auto; }`** → 설명이 짧든 길든 버튼은 항상 바닥.
- `img { aspect-ratio: 16/9; object-fit: cover; }` → 원본 비율과 무관하게 16:9 로 잘라 맞춤.

<!-- section: mechanism -->
## 깨진 그리드 (불규칙 갤러리)

{{code: break-grid}}

- 균일한 격자(`repeat(4, 1fr)` + `grid-auto-rows`)를 먼저 만든다.
- 일부 아이템에 `grid-column: span 2` / `grid-row: span 2` 를 줘서 **여러 칸을 차지**하게 한다.
- 나머지는 자동 흐름으로 빈 칸을 채운다. 구멍이 거슬리면 `grid-auto-flow: dense`
  (단, 시각 순서가 DOM 순서와 달라질 수 있음 → 갤러리처럼 순서가 덜 중요한 곳에만).

<!-- section: must_know -->
## 반드시 기억할 것

- **바깥 = Grid, 안쪽 = Flexbox.** 각자 잘하는 걸 시킨다.
- 카드 바닥 고정 버튼: 카드에 `flex-direction: column`, 버튼에 `margin-top: auto`.
- 썸네일 비율 고정: `aspect-ratio` + `object-fit: cover`.
- 큰 타일: `grid-column: span N` / `grid-row: span N`. `1 / -1` 은 전체 폭.
- `dense` 는 갤러리처럼 순서가 덜 중요한 곳에만.
- 카드 그리드 반응형은 `repeat(auto-fill, minmax(px, 1fr))` — 미디어쿼리 없이.

<!-- section: mission -->
## 미션

1. **상품 카드 그리드**: 카드 8개, `repeat(auto-fill, minmax(240px, 1fr))` + `gap: 20px`.
   각 카드 = 썸네일(1:1, `object-fit: cover`) + 제목 + 가격 + "장바구니" 버튼(항상 바닥).
   설명 길이를 카드마다 다르게 넣어도 버튼 라인이 맞는지 확인.
2. **깨진 갤러리**: 사진 10장, `repeat(4, 1fr)` + `grid-auto-rows: 140px`.
   3장은 `span 2 / span 2`(큰), 2장은 `span 2`(가로 긴). `dense` 를 켰다 껐다 하며 차이를 관찰.
3. 두 미션 모두 폭을 줄여 가며 레이아웃이 자연스럽게 접히는지(카드 그리드), 갤러리는 언제 깨지는지 기록하라.

<!-- section: check_question -->
## 이해 점검

1. 카드 그리드에서 바깥과 안쪽에 각각 Grid/Flex 중 무엇을, 왜?
2. 설명 길이가 달라도 버튼을 바닥에 붙이는 CSS 는?
3. 썸네일 비율을 강제로 맞추는 두 속성은?
4. 갤러리에서 한 사진만 4배 크게 하려면?

<!-- section: review -->
## 한 줄 정리

**카드 UI = 바깥 Grid(`repeat(auto-fill, minmax)`) + 안쪽 Flexbox(`column` + 버튼 `margin-top: auto`),
썸네일은 `aspect-ratio`+`object-fit: cover`. 불규칙 갤러리는 균일 격자에 `span` 을 섞는다.**

<!-- section: next -->
## 다음 Chapter

`javascript/language-basics` — 이제 화면에 동작을 넣는다.
