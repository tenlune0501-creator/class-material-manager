---
id: nextjs/assets-and-styling/public-assets
chapter: nextjs/assets-and-styling
title: public 폴더로 정적 자원 다루기
mastery: understand
lesson_kind: lesson
estimated_minutes: 20
tags: [nextjs, public, static-assets, image]
related_material_ids:
  - 1esDYub3lfcCsU8QMMkfTy3t64-dRmReHTR0f2zOEXe0   # 07_정적인 자원 사용하기 - public (2025)
prerequisites:
  - nextjs/app-setup/sample-app-structure
code_examples:
  - slug: public-path
    title: public/ = 사이트 루트(/)
    source_type: generated_minimal
    language: text
    is_canonical: true
    code: |
      my-app/
        public/
          home_icon.png     →  /home_icon.png
          logo.svg          →  /logo.svg
          docs/guide.pdf     →  /docs/guide.pdf
      # 코드에서는 항상 "/..." 절대경로. import 하지 않는다.
  - slug: next-image
    title: next/image — 최적화 이미지
    source_type: generated_minimal
    language: tsx
    code: |
      import Image from "next/image";

      export default function Home() {
        return (
          <>
            <h2>Welcome</h2>
            {/* width/height 필수: 레이아웃이 밀리지 않도록 자리를 미리 잡는다 */}
            <Image src="/home_icon.png" alt="홈" width={48} height={48} />

            {/* 부모 크기에 맞추려면 fill + 부모 position:relative */}
            <div style={{ position: "relative", width: 320, height: 180 }}>
              <Image src="/cover.jpg" alt="표지" fill style={{ objectFit: "cover" }} />
            </div>
          </>
        );
      }
      // next/image: 자동 리사이즈·포맷 변환(webp)·지연 로딩. <img> 도 여전히 쓸 수 있다.
  - slug: next-script
    title: 외부/정적 스크립트는 next/script
    source_type: generated_minimal
    language: tsx
    code: |
      import Script from "next/script";

      // public/main.js  →  /main.js
      <Script src="/main.js" strategy="afterInteractive" />

      // 외부 CDN 도 동일
      <Script src="https://example.com/widget.js" strategy="lazyOnload" />
      // strategy: beforeInteractive(hydration 전) / afterInteractive(기본) / lazyOnload(idle)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `public/` 에 넣은 파일이 **사이트 루트(`/파일명`)** 로 서빙된다는 것을 안다 (import 아님).
- `next/image` 의 `<Image>` 로 최적화 이미지를 넣고 `width`/`height`(또는 `fill`)가 왜 필요한지 안다.
- 스크립트는 `<script>` 직접 삽입 대신 `next/script` 의 `<Script strategy>` 로 로드한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/app-setup/*`. HTML `<img>`, CLS(레이아웃 이동) 개념이면 도움.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 이미지를 `src/` 아래 두고 상대경로로 부르다 빌드 후 경로가 깨진다.
- 큰 원본 이미지를 그대로 `<img>` 로 내보내 느리고, 로드되며 화면이 툭툭 밀린다(CLS).
- `<head>` 에 `<script>` 를 직접 박아 SSR 시점 차이·중복 실행이 생긴다.

<!-- section: concept -->
## public/ 은 그대로 서빙된다

{{code: public-path}}

- `public/` 안의 파일은 **가공 없이** `/` 기준 절대경로로 제공된다. `public/a/b.png` → `/a/b.png`.
- 코드에서 `import` 하지 않고 문자열 경로(`"/home_icon.png"`)로 참조한다.
- 자주 바뀌지 않는 것: 파비콘, 로고, `robots.txt`, `og` 이미지, 다운로드용 PDF, 서드파티가 요구하는 정적 파일.
- 컴포넌트에 **묶여 변형·해싱이 필요한** 이미지는 `src/` 아래 두고 `import` 해서 `<Image>` 에 넘겨도 된다.

<!-- section: mechanism -->
## next/image 와 next/script

{{code: next-image}}

- `<Image>` = 자동 리사이즈 · webp 변환 · 지연 로딩 · `srcset` 생성.
- **`width`/`height` 필수** — 로드 전에 자리를 잡아 화면 밀림(CLS)을 막는다. 크기를 모르면 `fill` + 부모 `position: relative`.
- 그냥 `<img>` 도 동작한다. 최적화가 필요 없거나 SVG 아이콘이면 `<img>` 가 더 간단.

{{code: next-script}}

- `next/script` 는 로딩 시점을 `strategy` 로 제어한다: `beforeInteractive`(초기화에 꼭 필요) /
  `afterInteractive`(기본, 대부분) / `lazyOnload`(분석·채팅 위젯 등 나중에).
- 외부에서 불러오는 스크립트(분석, 지도, 결제 위젯 등)도 같은 방식.

<!-- section: must_know -->
## 반드시 기억할 것

- `public/파일` → `/파일` 로 서빙. **import 하지 않고 절대경로 문자열**로 참조.
- `next/image` `<Image>` = 자동 최적화. `width`/`height`(또는 `fill`) **필수** — CLS 방지.
- SVG 아이콘·초소형 이미지·최적화 불필요면 그냥 `<img>` 도 OK.
- 스크립트는 `next/script` `<Script strategy>` — `<head>` 직접 삽입 지양.
- `strategy`: `beforeInteractive` / `afterInteractive`(기본) / `lazyOnload`.

<!-- section: experiment -->
## 직접 해 보기

1. `public/` 에 아이콘 하나 넣고 `<Image src="/그아이콘" width height />` 와 `<img src="/그아이콘">` 를 나란히 렌더, Network 에서 응답 크기·포맷 비교.
2. `width`/`height` 를 뺐을 때 나는 에러/경고를 확인.
3. `public/main.js` 에 `console.log("loaded")` 를 두고 `<Script strategy>` 값을 바꿔 가며 실행 시점 관찰.

<!-- section: check_question -->
## 이해 점검

1. `public/img/logo.png` 는 어떤 URL 로 접근하나? 코드에서 어떻게 참조하나?
2. `<Image>` 에 `width`/`height` 가 필요한 이유는?
3. `<Image>` 대신 `<img>` 를 써도 되는 경우는?
4. `next/script` 의 `strategy` 세 가지는 각각 언제 쓰나?

<!-- section: review -->
## 한 줄 정리

**`public/` 파일은 `/파일명` 으로 그대로 서빙(문자열 절대경로로 참조), 이미지는 `next/image` `<Image>` 로
`width`/`height`(또는 `fill`)를 줘 최적화·CLS 방지, 스크립트는 `next/script` `<Script strategy>` 로 로드한다.**

<!-- section: next -->
## 다음 Lesson

`assets-and-styling/styling-in-nextjs` — 전역 CSS 와 CSS Module.
