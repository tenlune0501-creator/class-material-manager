---
id: web-foundations/html-structure/multimedia
chapter: web-foundations/html-structure
title: 멀티미디어 (audio/video)
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [html, audio, video, multimedia, image]
related_material_ids:
  - 12_sMeeoS9nG0KR4aufL0d89hUJohHdO0GUKQ0XXTW6o   # 8. HTML5 멀티미디어 활용하기
  - 1dZTAHHq8kdY4VrUYKoEVZqEdFnb7dF-6              # YoutubeDownloader.zip
sources:
  - reference_slug: html/audio-HTML-embed-audio-element
code_examples:
  - slug: images
    title: 이미지 — img 와 figure
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <img src="photos/cat.jpg" alt="창밖을 보는 고양이" width="600" height="400" />
      <!-- alt: 이미지를 못 볼 때 대신 읽힐 설명 (스크린리더·로딩실패·SEO). 필수. -->
      <!-- width/height 를 적어 두면 로딩 전 자리를 잡아 레이아웃이 안 튄다 -->

      <picture>
        <source srcset="hero.webp" type="image/webp" />
        <img src="hero.jpg" alt="메인 배너" />
      </picture>
      <!-- 브라우저가 지원하는 첫 source 를 고름. 없으면 img 로 폴백. -->

      <figure>
        <img src="chart.png" alt="2026년 매출 추이" />
        <figcaption>2026년 분기별 매출</figcaption>
      </figure>
  - slug: av
    title: 오디오와 비디오
    source_type: generated_minimal
    language: html
    code: |
      <audio controls src="bgm.mp3">
        이 브라우저는 audio 를 지원하지 않습니다.
      </audio>

      <video controls width="640" poster="thumb.jpg">
        <source src="clip.webm" type="video/webm" />
        <source src="clip.mp4" type="video/mp4" />
        <track kind="subtitles" src="clip.ko.vtt" srclang="ko" label="한국어" />
        비디오를 재생할 수 없습니다.
      </video>
      <!-- controls: 재생 UI. poster: 재생 전 썸네일.
           source 여러 개: 브라우저가 재생 가능한 첫 형식을 씀.
           track: 자막. -->
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `<img>` 의 `alt` 가 왜 필수인지, `width`/`height` 를 적는 이유를 설명할 수 있다.
- `<audio>` / `<video>` 를 `controls` 와 여러 `<source>` 로 넣을 수 있고, 자동재생·자막의 기본을 안다.
- `<picture>` 로 형식/해상도별 이미지를 제공하는 방식을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTML 태그·속성. 상대경로. 시맨틱 태그(`<figure>`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 이미지가 로딩되다가 나타날 때 화면이 **위아래로 튄다**(레이아웃 시프트) → 크기를 안 알려줬다.
- 스크린리더 사용자에게 이미지가 "이미지"로만 읽힌다 → `alt` 가 없다.
- 크롬에선 되는 동영상이 사파리에선 재생이 안 된다 → 한 형식만 제공했다.

<!-- section: concept -->
## 이미지 — `<img>`

{{code: images}}

- **`alt`** — 이미지를 못 볼 때(스크린리더·로딩 실패·검색엔진) 대신 전달되는 텍스트. **항상 쓴다.**
  순수 장식 이미지면 `alt=""` (빈 값)로 "읽지 마" 표시.
- **`width` / `height`** (또는 CSS 로 aspect-ratio) — 브라우저가 로딩 전에 **자리를 잡아** 레이아웃이 안 튄다.
- **`<picture>` + `<source srcset>`** — 브라우저가 지원하는 첫 형식(`webp` → `jpg`)을 고른다. 성능 최적화.
- `loading="lazy"` — 화면에 가까워질 때 로드(스크롤 아래 이미지).

<!-- section: concept | title: 오디오·비디오 -->
## `<audio>` / `<video>`

{{code: av}}

- **`controls`** — 재생/일시정지/볼륨 UI. 없으면 화면에 안 보이거나 조작 불가.
- **여러 `<source>`** — 브라우저마다 지원 코덱이 다르므로 `webm` + `mp4` 를 함께. 첫 재생 가능 형식을 쓴다.
- **`poster`** — 재생 전 썸네일 이미지.
- **`<track kind="subtitles">`** — `.vtt` 자막 파일. 접근성·검색에 중요.
- **자동재생**: `autoplay` 는 대부분 브라우저에서 **`muted` 가 아니면 막힌다**. `autoplay muted playsinline` 조합으로만 배경 영상 가능.

<!-- section: must_know -->
## 반드시 기억할 것

- `<img>` 에 **`alt` 는 필수**. 장식이면 `alt=""`.
- 이미지·비디오에 **크기를 지정**해 레이아웃 시프트를 막는다.
- 비디오는 **형식 하나로 부족** — `webm`+`mp4`, `<source>` 여러 개.
- `autoplay` 는 `muted` 없이는 대부분 차단된다.
- 유튜브 등은 `<iframe>` 임베드(그쪽이 주는 코드) — 직접 `<video>` 로 남의 영상을 긁어오지 않는다(저작권).
- 큰 이미지·영상은 성능 부담 — `loading="lazy"`, 적절한 포맷/크기, CDN 은 이후 배포·성능 챕터.

<!-- section: experiment -->
## 직접 해 보기

1. 이미지 3장을 넣되 하나는 `alt` 를 빼고, 하나는 `width/height` 를 빼 보라. 개발자도구 Network 를
   느리게(throttling) 설정해 로딩 중 레이아웃이 튀는지 비교하라.
2. `<video controls>` 에 `mp4` 하나만 넣고, 그다음 `webm`+`mp4` 두 `<source>` 로 바꿔라.
   `poster` 와 자막 `<track>` 을 추가.
3. `<picture>` 로 `webp` → `jpg` 폴백을 만들고, 개발자도구에서 실제로 어떤 파일을 받았는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `alt` 가 하는 일 3가지는? 장식용 이미지엔 뭘 넣나?
2. `<img width height>` 를 적는 실용적 이유는?
3. 비디오에 `<source>` 를 여러 개 두는 이유는?
4. 배경 영상 `autoplay` 가 안 될 때 확인할 속성은?

<!-- section: review -->
## 한 줄 정리

**이미지엔 `alt`(필수)와 크기를, 오디오·비디오엔 `controls`와 여러 `<source>`(형식별)를 준다 —
`<picture>` 로 포맷을 고르고, `autoplay` 는 `muted` 와 짝, 남의 영상은 임베드로.**

<!-- section: next -->
## 다음 Lesson

`html-structure/markup-conventions-and-entities` — 코딩 컨벤션과 특수문자.
