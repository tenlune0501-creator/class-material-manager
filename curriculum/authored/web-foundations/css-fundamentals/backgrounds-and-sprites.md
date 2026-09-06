---
id: web-foundations/css-fundamentals/backgrounds-and-sprites
chapter: web-foundations/css-fundamentals
title: 배경과 스프라이트
mastery: understand
lesson_kind: lesson
estimated_minutes: 35
tags: [css, background, sprites]
related_material_ids:
  - 1j_6_pa70S-iJ77JQhfiK1OSfqAl75Le5              # sprites_base.zip
  - 1vUSFFY_nzNLpFwPVvorvRK4B0aKFBQSv              # sprites_final_v_202604.zip
  - 1jtdbigsYncKzx-FpPi-PJZu42h-0NDKK              # S07_EX.zip
  - 0B0HRSf3dPjJiYldNN3NEVDBYQU0                   # seoul_map.gif
sources:
  - reference_slug: css/background
  - reference_slug: css/background-image
code_examples:
  - slug: background-shorthand
    title: background 속성들
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      .hero {
        background-color: #f4f4f4;
        background-image: url("hero.jpg");
        background-repeat: no-repeat;
        background-position: center top;   /* x y */
        background-size: cover;            /* cover(꽉, 잘림) | contain(다 보임) | 300px 200px */
        background-attachment: fixed;      /* 스크롤해도 배경 고정 (패럴랙스 느낌) */
      }

      /* 한 줄 단축 (순서 유연, / 앞은 position, 뒤는 size) */
      .hero {
        background: #f4f4f4 url("hero.jpg") no-repeat center top / cover;
      }

      /* 배경 여러 장 (콤마, 앞이 위) */
      .card {
        background:
          url("badge.svg") no-repeat right 8px top 8px,
          linear-gradient(#fff, #eee);
      }
  - slug: sprite
    title: 스프라이트 — 아이콘 여러 개를 한 이미지로
    source_type: generated_minimal
    language: css
    code: |
      /* icons.png 안에 32x32 아이콘이 가로로 나열돼 있다고 하자 */
      .icon {
        width: 32px; height: 32px;
        background-image: url("icons.png");
        background-repeat: no-repeat;
        display: inline-block;
      }
      .icon-home   { background-position:   0    0; }
      .icon-search { background-position: -32px  0; }  /* 왼쪽으로 32px 밀어 두 번째 아이콘 노출 */
      .icon-user   { background-position: -64px  0; }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `background-*` 속성(color/image/repeat/position/size/attachment)과 단축 표기를 읽고 쓸 수 있다.
- `background-size: cover` 와 `contain` 의 차이를 안다.
- **스프라이트**가 무엇이고 왜 썼는지, `background-position` 음수값으로 아이콘을 잘라 쓰는 원리를 이해한다.
- `<img>` 와 `background-image` 를 언제 각각 쓰는지 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- CSS 선택자, 박스모델, 단위(px, %). 상대경로.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 배경 이미지가 타일처럼 반복된다 → `background-repeat: no-repeat` 를 안 줌.
- 배경이 잘리거나 찌그러진다 → `background-size` 를 안 씀.
- 아이콘 20개를 각각 파일로 불러와 요청이 20번 나간다(과거엔 큰 성능 문제) → 스프라이트.

<!-- section: concept -->
## background 속성

{{code: background-shorthand}}

- **`background-repeat`**: 기본이 `repeat`(타일). 보통 `no-repeat`.
- **`background-position`**: `center`, `top left`, `50% 20%`, `right 8px top 8px` 등.
- **`background-size`**:
  - `cover` — 영역을 **꽉** 채운다(비율 유지, 넘치는 부분 잘림). 히어로 배너의 기본.
  - `contain` — 이미지가 **다 보이게** 맞춘다(여백 생길 수 있음).
  - `300px 200px` / `50%` — 명시적 크기.
- **`background`** 단축 — 여러 값을 한 줄에. `/` 뒤가 size. 배경을 콤마로 **여러 장**(앞이 위).
- 그라데이션도 이미지다: `background: linear-gradient(...)`.

<!-- section: mechanism -->
## 스프라이트

여러 작은 이미지(아이콘 등)를 **한 장의 이미지**로 합쳐 두고, 각 요소는 그 큰 이미지를 배경으로 깔되
`background-position` 을 음수로 밀어서 **원하는 부분만 창(요소 크기)에 보이게** 한다.

{{code: sprite}}

- `width/height` = 아이콘 한 개 크기. `background-position: -32px 0` = 배경을 왼쪽으로 32px 밀기 → 두 번째 아이콘이 창에 옴.
- **왜 했나(역사)**: HTTP/1.1 시절엔 파일 하나당 요청 하나라, 아이콘 20개 = 요청 20번 = 느림.
  스프라이트로 요청 1번.
- **지금은**: HTTP/2·CDN 으로 다중 요청 비용이 낮아졌고, 아이콘은 대부분 **SVG**(또는 SVG 스프라이트,
  아이콘 폰트)로 간다. 하지만 옛 코드·CSS 배경 아이콘에서 스프라이트를 **읽을 수 있어야** 한다.

<!-- section: concept | title: img vs background-image -->
## `<img>` vs `background-image`

| | `<img>` | `background-image` |
|---|---|---|
| 의미 | **콘텐츠** 이미지 (사진, 다이어그램) | **장식** (배경, 아이콘) |
| 접근성 | `alt` 로 대체 텍스트 | 스크린리더가 무시 (장식이므로 맞음) |
| 크기 | 콘텐츠 흐름에 참여 | 요소 크기는 CSS 가 별도로 정함 |

"이 이미지가 없으면 정보가 빠지나?" → 그렇다면 `<img>`, 아니면 배경.

<!-- section: must_know -->
## 반드시 기억할 것

- 배경 이미지엔 보통 `no-repeat` + `background-position` + `background-size`.
- `cover`(꽉, 잘림) vs `contain`(다 보임, 여백). 히어로는 `cover`.
- 스프라이트 = 한 이미지 + 요소 크기만큼의 창 + 음수 `background-position`. 지금은 SVG 로 대체되는 추세지만 원리는 알아 둔다.
- **콘텐츠 이미지는 `<img alt>`, 장식은 `background-image`.** 접근성이 갈린다.
- 배경은 콘텐츠가 아니므로 인쇄·검색·스크린리더에서 빠질 수 있음을 감안한다.

<!-- section: experiment -->
## 직접 해 보기

1. 같은 큰 이미지에 `background-size` 를 `cover` / `contain` / `100% 100%` 로 바꿔 가며 차이를 보라.
2. 아이콘 3개가 가로로 붙은 이미지를 만들고(또는 받아서), `.icon-a/b/c` 를 `background-position` 음수값으로 잘라 써라.
3. 로고를 한 번은 `<img alt="회사 로고">` 로, 한 번은 `background-image` 로 넣고 개발자도구 접근성 트리에서 차이를 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `background-size: cover` 와 `contain` 은 각각 언제 쓰나?
2. 스프라이트에서 `background-position` 을 음수로 주는 이유는?
3. 회사 로고는 `<img>` 인가 `background-image` 인가? 판별 기준은?

<!-- section: review -->
## 한 줄 정리

**배경 이미지엔 `no-repeat`·`position`·`size`(cover/contain)를 준다 — 스프라이트는 큰 이미지 하나를
요소 크기 창으로 음수 position 해 잘라 쓰는 옛 최적화이고, 콘텐츠 이미지는 `<img alt>`, 장식은 배경이다.**

<!-- section: next -->
## 다음 Lesson

`css-fundamentals/css-review` — 여기까지의 HTML·CSS 를 하나로 묶는 리뷰.
