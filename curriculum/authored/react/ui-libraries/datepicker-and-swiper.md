---
id: react/ui-libraries/datepicker-and-swiper
chapter: react/ui-libraries
title: 데이트피커와 스와이퍼
mastery: practical
lesson_kind: lesson
estimated_minutes: 45
tags: [react, datepicker, swiper, ui-library]
related_material_ids:
  - 1BhV087Hh_BZm26KqfboEHRd09WvswkeHz_jzwhjjeBg   # React datepicker
  - 1cqIEN2t9v8bmvgjb8fh74Bx6fCIgBoyIkIRo2U6Oql4   # etc_01_swiper_JS
  - 1k80DnPEL_7Tdlx6oC59yARGTHsf3DKL1              # react-swiper_v202607.zip
sources:
  - title: "react-datepicker — Documentation"
    url: https://reactdatepicker.com/
    publisher: "HackerOne / react-datepicker"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Swiper — Swiper React Components"
    url: https://swiperjs.com/react
    publisher: "Swiper"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - react/state-and-events/usestate-basics
  - react/hooks-ref-memo-callback/useref
code_examples:
  - slug: datepicker-basic
    title: react-datepicker — 제어 컴포넌트로
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { useState } from "react";
      import DatePicker from "react-datepicker";
      import "react-datepicker/dist/react-datepicker.css"; // 라이브러리 CSS 반드시 import

      export default function DateField() {
        const [date, setDate] = useState(new Date()); // 선택값을 내 state 로 소유

        return (
          <DatePicker
            selected={date}                    // 지금 선택된 날짜 (state)
            onChange={(d) => setDate(d)}        // 사용자가 고르면 state 갱신
            dateFormat="yyyy/MM/dd"
            minDate={new Date()}                // 오늘 이전 비활성
          />
        );
      }
      // useState + selected/onChange = 앞서 배운 "제어 컴포넌트" 패턴 그대로
  - slug: swiper-basic
    title: Swiper — 기본 슬라이더
    source_type: generated_minimal
    language: jsx
    code: |
      import { Swiper, SwiperSlide } from "swiper/react";
      import "swiper/css";

      export default function Gallery({ images }) {
        return (
          <Swiper spaceBetween={50} slidesPerView={3}>
            {images.map((src) => (
              <SwiperSlide key={src}><img src={src} alt="" /></SwiperSlide>
            ))}
          </Swiper>
        );
      }
  - slug: swiper-modules
    title: Swiper — Navigation / Pagination 모듈
    source_type: generated_minimal
    language: jsx
    code: |
      import { Swiper, SwiperSlide } from "swiper/react";
      import { Navigation, Pagination, Autoplay } from "swiper/modules"; // v9+ 경로
      import "swiper/css";
      import "swiper/css/navigation";
      import "swiper/css/pagination";

      <Swiper
        modules={[Navigation, Pagination, Autoplay]} // 쓰는 기능만 등록 (Chart.js register 와 같은 발상)
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop
      >
        {slides.map((s) => <SwiperSlide key={s.id}>{s.content}</SwiperSlide>)}
      </Swiper>
  - slug: swiper-ref
    title: Swiper — 외부 버튼으로 제어 (ref)
    source_type: generated_minimal
    language: jsx
    code: |
      import { useRef } from "react";

      function Slider() {
        const swiperRef = useRef(null);
        return (
          <>
            <Swiper onSwiper={(swiper) => (swiperRef.current = swiper)} /* ...props */>
              {/* slides */}
            </Swiper>
            <button onClick={() => swiperRef.current?.slideNext()}>다음</button>
            <button onClick={() => swiperRef.current?.slidePrev()}>이전</button>
          </>
        );
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **UI 라이브러리를 붙이는 공통 절차**(설치 → 컴포넌트 import → **CSS import** → props로 제어)를 안다.
- `react-datepicker` 를 **제어 컴포넌트**(`selected`/`onChange` + `useState`)로 쓴다.
- `Swiper` 를 붙이고 **필요한 모듈만 등록**(`modules={[Navigation, Pagination]}`)해 페이지네이션·오토플레이를 켠다.
- `onSwiper` + `ref` 로 슬라이더를 **외부 버튼**에서 제어한다.
- 수업자료의 낡은 import 경로(구 Swiper)와 현재 경로의 차이를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useState` 제어 컴포넌트 패턴, `useRef` 로 인스턴스 붙잡기, 리스트 렌더(`map` + `key`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

날짜 입력을 직접 만들면 달력 그리드, 월 이동, 키보드 접근성, 로케일, 유효 범위 제한까지
전부 구현해야 한다. 캐러셀도 마찬가지로 터치 스와이프·관성·반응형 slidesPerView가 골칫거리다.
그래서 검증된 라이브러리를 붙인다. 이 챕터의 주제 — **UI 라이브러리 붙이기** — 다.

<!-- section: concept -->
## UI 라이브러리 붙이는 4단계 (거의 항상 같다)

1. `npm i <라이브러리>`.
2. 컴포넌트 `import` (`DatePicker`, `Swiper`/`SwiperSlide`).
3. **라이브러리 CSS import** — 이걸 빼먹으면 "동작은 하는데 모양이 깨져" 보인다.
4. **props로 제어** — 값은 내 `useState` 가 소유하고, 라이브러리엔 현재값 + 변경 콜백을 넘긴다.

<!-- section: code | lang: jsx -->
## 실습 1 — react-datepicker

{{code: datepicker-basic}}

- `import "react-datepicker/dist/react-datepicker.css"` — 3단계. 없으면 달력 레이아웃이 무너진다.
- `selected` = 현재값(state), `onChange` = 갱신 → **앞서 배운 제어 컴포넌트 그대로**다.
- `dateFormat`, `minDate`/`maxDate`, `showTimeSelect`, `locale` 등은 전부 props.
- `onChange` 가 주는 값은 `Date` 객체(또는 범위 모드면 배열). 서버로 보낼 땐 문자열로 포맷한다.

<!-- section: code | lang: jsx -->
## 실습 2 — Swiper 기본

{{code: swiper-basic}}

- `<Swiper>` 안에 `<SwiperSlide>` 들. 슬라이드는 `map` 으로 만들고 `key` 를 준다.
- `spaceBetween`, `slidesPerView` 로 한 화면에 보일 개수와 간격.
- `import "swiper/css"` 는 필수(코어 스타일).

<!-- section: mechanism -->
## 실습 3 — 모듈 등록 + 외부 제어

Swiper는 페이지네이션·네비게이션·오토플레이를 **모듈**로 분리해, 쓰는 것만 등록하게 한다
(Chart.js의 `register` 와 같은 발상 — 번들 크기).

{{code: swiper-modules}}

{{code: swiper-ref}}

- `onSwiper={(swiper) => (swiperRef.current = swiper)}` — Swiper 인스턴스를 ref에 저장.
- 외부 버튼에서 `swiperRef.current.slideNext()` / `slidePrev()` / `slideTo(n)` 호출.
- 인스턴스가 준비되기 전 클릭 대비 `?.` (옵셔널 체이닝).

<!-- section: concept | title: 수업자료 vs 지금 -->
## 수업자료의 낡은 import

수업자료(`etc_01_swiper_JS`)는 2022년 버전이라 옛 경로가 섞여 있다:

| 수업자료(구) | 현재(v9+) |
|---|---|
| `import { Navigation } from "swiper"` | `import { Navigation } from "swiper/modules"` |
| `import "swiper/swiper.min.css"` | `import "swiper/css"` |
| `import "swiper/modules/pagination/pagination.min.css"` | `import "swiper/css/pagination"` |
| `from "swiper/react/swiper-react"` | `from "swiper/react"` |

자료의 **더 아래쪽 예제**(`swiper/modules`, `swiper/css`, `swiper/css/navigation`)가
현재 방식이다. `Swiper`/`SwiperSlide`/`modules`/`onSwiper` API 자체는 그대로다.
react-datepicker는 `DatePicker` + `react-datepicker/dist/react-datepicker.css` 가 버전 무관하게 유지된다.

<!-- section: must_know -->
## 반드시 기억할 것

- UI 라이브러리 4단계: 설치 → import → **CSS import** → props 제어. CSS 누락이 "모양만 깨짐"의 1순위 원인.
- datepicker는 `selected` + `onChange` + `useState` = **제어 컴포넌트**. 값 소유는 내 컴포넌트.
- Swiper는 **필요한 모듈만** `modules={[...]}` 로 등록하고, 각 모듈의 CSS도 따로 import.
- 슬라이더를 밖에서 조작하려면 `onSwiper` 로 인스턴스를 `ref` 에 담는다.
- 라이브러리 버전이 다르면 **import 경로/CSS 경로가 바뀔 수 있다** — 붙이기 전 그 버전 문서를 확인.
- 슬라이드/캐러셀은 접근성(키보드, `aria-live`, 자동재생 일시정지)을 라이브러리 옵션으로 챙긴다.

<!-- section: experiment -->
## 직접 해 보기

1. `react-datepicker` 로 "예약일" 입력을 만들고 `minDate={new Date()}` 로 과거를 막아라. 선택값을 `yyyy-MM-dd` 문자열로 화면에 출력.
2. `dateFormat` 을 여러 개(`"yyyy/MM/dd"`, `"yy.MM.dd (eee)"`)로 바꿔 보라.
3. Swiper로 이미지 5장 갤러리를 만들고 `slidesPerView` 를 1↔3, `loop` on/off 로 바꿔 보라.
4. `Pagination` + `Navigation` + `Autoplay` 모듈을 켜고 각 CSS도 import 하라. CSS를 하나 빼면 어떻게 되는지 확인.
5. 슬라이더 밖에 "이전/다음" 버튼을 만들고 `onSwiper` + `ref` 로 연결하라.

<!-- section: check_question -->
## 이해 점검

1. datepicker/swiper가 "동작은 하는데 못생겼다"면 무엇을 빠뜨렸을 가능성이 큰가?
2. `react-datepicker` 를 제어 컴포넌트로 쓴다는 게 코드로 어떤 모습인가?
3. Swiper에서 `modules={[Navigation]}` 없이 `navigation` prop만 주면 어떻게 되나?
4. 슬라이더를 외부 버튼으로 제어하려면 무엇을 저장해야 하나?
5. 수업자료의 `import { Navigation } from "swiper"` 가 지금은 왜 안 되나?

<!-- section: interview_question -->
## 면접 대비

- "서드파티 UI 라이브러리를 도입할 때 확인하는 것들(번들 크기, 접근성, 유지보수 상태, SSR 호환)은?"
- "제어 컴포넌트로 쓰는 입력 라이브러리와 비제어로 두는 경우의 차이는?"
- "라이브러리 메이저 업그레이드 시 import/CSS 경로가 바뀌는 문제를 어떻게 관리하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> UI 라이브러리 4단계(설치/import/CSS/props), datepicker=제어 컴포넌트, Swiper modules 등록 + 개별 CSS,
> onSwiper+ref 외부 제어, 버전에 따른 import 경로 변화를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**UI 라이브러리는 "설치 → import → CSS import → props로 제어" 4단계로 붙인다 — datepicker는
`selected`/`onChange`+`useState` 제어 컴포넌트, Swiper는 필요한 `modules` 만 등록하고 `onSwiper`+`ref` 로
외부에서 조작한다.**
