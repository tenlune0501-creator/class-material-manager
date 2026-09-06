---
id: react/styling-in-react/images-and-icons
chapter: react/styling-in-react
title: 이미지·아이콘 불러오기
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [react, assets, image, icon, import]
related_material_ids:
  - 1jhiPigTL6WmRKFnE9eXiZuu-cqaiAp0Hnk7zOKGQM80   # 12_이미지·아이콘 불러오기
prerequisites:
  - react/setup-and-jsx/dev-environment
code_examples:
  - slug: image-import
    title: 이미지 — import vs public
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      // 1) src/assets 에서 import — 번들러가 경로를 관리·최적화, 해시 파일명
      import logo from "./assets/logo.png";
      <img src={logo} alt="회사 로고" />

      // 2) public/ 의 파일 — 절대경로 문자열. 빌드 시 그대로 복사
      <img src="/favicon.png" alt="" />

      // 3) 동적 이미지 (서버 URL)
      <img src={user.avatarUrl} alt={`${user.name} 프로필`} />

      // CSS 에서 배경으로
      // .hero { background-image: url("/hero.jpg"); }  ← public 기준 절대경로
  - slug: svg-icon
    title: 아이콘 — SVG 컴포넌트 / 아이콘 라이브러리
    source_type: generated_minimal
    language: jsx
    code: |
      // 아이콘 라이브러리 (react-icons, lucide-react 등)
      import { FiSearch } from "react-icons/fi";
      <button><FiSearch size={18} aria-hidden="true" /> 검색</button>

      // SVG 를 컴포넌트로 (Vite: ?react 또는 vite-plugin-svgr)
      // import Logo from "./logo.svg?react";
      // <Logo className="logo" />   ← currentColor 로 색상 제어 가능

      // 인라인 SVG
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="..." fill="currentColor" />
      </svg>
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 이미지를 `src/assets` 에서 `import` 하는 것과 `public/` 에 두는 것의 차이를 안다.
- 동적 이미지(서버 URL)와 정적 이미지를 구분한다.
- 아이콘을 SVG 컴포넌트나 아이콘 라이브러리로 넣고, `currentColor` 로 색을 제어한다.
- 이미지 접근성(`alt`)과 성능(크기·`loading`)을 챙긴다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Vite 프로젝트 구조(`src/assets`, `public/`), JSX `<img>`, HTML 멀티미디어 Lesson.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `<img src="./logo.png" />` 를 상대경로 문자열로 썼더니 배포하면 깨진다(번들러가 경로를 못 바꿈).
- 아이콘 20종을 각각 PNG 로 넣어 색 변경·해상도 대응이 안 된다.
- 이미지에 `alt` 를 안 넣어 접근성 검사 실패.

<!-- section: concept -->
## 이미지

{{code: image-import}}

| | `import` (`src/assets/`) | `public/` |
|---|---|---|
| 경로 | `import img from "./assets/x.png"` → `<img src={img}>` | `<img src="/x.png">` (문자열) |
| 처리 | 번들러가 해시 파일명·최적화, 없으면 빌드 에러 | 그대로 복사 (검사 안 함) |
| 언제 | **컴포넌트가 쓰는 이미지** 대부분 | `favicon`, `robots.txt`, 크기 큰 정적 파일, CSS `url()` 절대경로 |

- **동적 이미지**(서버가 준 URL, 사용자 업로드)는 그냥 `src={url}` 문자열.
- `alt` 필수(HTML Lesson). 장식이면 `alt=""`. 큰 이미지는 `loading="lazy"`, 크기 지정.

<!-- section: mechanism -->
## 아이콘

{{code: svg-icon}}

- **아이콘 라이브러리**(`react-icons`, `lucide-react`) — `import { FiSearch }` 후 `<FiSearch />`.
  `size`, `color`(또는 CSS `color`), 스크린리더용 `aria-hidden` 또는 `aria-label`.
- **SVG 를 직접** — Vite 에서 `logo.svg?react` (또는 `vite-plugin-svgr`)로 컴포넌트화. `fill="currentColor"` 면
  CSS `color` 로 색이 따라온다 → 상태별 색 변경이 쉽다.
- PNG 아이콘보다 SVG 가 **선명(모든 해상도)하고 색 제어**가 된다.

<!-- section: must_know -->
## 반드시 기억할 것

- 컴포넌트가 쓰는 이미지: **`src/assets` 에서 `import`** (경로를 번들러에 맡긴다).
- `public/`: `favicon`, CSS 배경(`url("/...")`), 손 안 대는 큰 파일.
- 동적 이미지는 `src={url}` 문자열.
- 아이콘은 **SVG**(라이브러리 또는 컴포넌트). `fill="currentColor"` 로 `color` 상속.
- 모든 `<img>` 에 `alt`. 아이콘엔 `aria-hidden`(장식) 또는 `aria-label`(의미 있는 버튼).
- 이미지 성능: 적절한 크기로 리사이즈, `loading="lazy"`, 필요하면 `srcset`/`<picture>`.

<!-- section: experiment -->
## 직접 해 보기

1. 로고를 `src/assets` 에서 `import` 해 넣고, 빌드(`npm run build`) 후 `dist/` 에서 파일명이 해시로 바뀐 걸 확인.
   같은 로고를 `public/` 에 두고 `<img src="/logo.png">` 로도 넣어 비교.
2. `react-icons` 를 설치해 버튼에 아이콘 + 텍스트를 넣고, `aria-hidden` 을 뺐다 넣었다 하며 스크린리더 트리 확인.
3. SVG 아이콘을 `fill="currentColor"` 로 만들고 부모의 `color` 를 `:hover` 로 바꿔 아이콘 색이 따라오게 하라.

<!-- section: check_question -->
## 이해 점검

1. `src/assets` 에서 `import` 한 이미지와 `public/` 의 이미지, 각각 언제 쓰나?
2. 서버가 준 프로필 이미지 URL 은 어떻게 넣나?
3. SVG 아이콘에서 `fill="currentColor"` 가 주는 이점은?
4. 의미 있는 아이콘 버튼(텍스트 없음)의 접근성 처리는?

<!-- section: review -->
## 한 줄 정리

**컴포넌트 이미지는 `src/assets` 에서 `import`, `public/` 은 favicon·CSS 배경·큰 파일, 동적은 `src={url}` —
아이콘은 SVG(`currentColor` 로 색 제어), 모든 이미지에 `alt`.**

<!-- section: next -->
## 다음 Chapter

`react/routing` — 여러 페이지를 라우터로.
