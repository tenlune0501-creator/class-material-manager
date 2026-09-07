---
id: javascript/external-apis/map-api
chapter: javascript/external-apis
title: 지도 API 붙이기
mastery: practical
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, map, api, geolocation]
related_material_ids:
  - 1p-9VZXmvak564yNKRy_a4Hxds09brFhFUf_hg2azQII   # MAP - API (NAVER / Kakao / Google 매뉴얼)
  - 1fWq89qe3p3OveESC8EuOX57X3XYd9Qp3              # map_BASE.zip (빈 map.html)
sources:
  - title: "카카오맵 Web API — 지도 시작하기"
    url: https://apis.map.kakao.com/web/guide/
    publisher: "Kakao"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "NAVER Maps API v3 — Getting Started"
    url: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
    publisher: "NAVER Cloud Platform"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Google Maps JavaScript API — Load the Maps JavaScript API"
    url: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
    publisher: "Google"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - javascript/dom-and-events/selecting-and-manipulating
  - javascript/async-and-http/fetch-and-ajax
code_examples:
  - slug: kakao-map-minimal
    title: 카카오맵 — 가장 작은 지도
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!doctype html>
      <html lang="ko">
        <head><meta charset="utf-8" /></head>
        <body>
          <!-- 1. 지도가 그려질 자리. 반드시 크기가 있어야 한다(높이 0이면 안 보인다) -->
          <div id="map" style="width:100%;height:400px;"></div>

          <!-- 2. 카카오가 제공하는 지도 SDK를 불러온다. appkey = 내 JS 앱 키 -->
          <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JS_APP_KEY"></script>

          <script>
            // 3. SDK가 로드되면 전역 객체 kakao.maps.* 가 생긴다
            const container = document.getElementById("map");
            const options = {
              center: new kakao.maps.LatLng(37.5563, 126.9723), // 위도, 경도 (서울역)
              level: 3,                                          // 확대 레벨 (작을수록 확대)
            };
            const map = new kakao.maps.Map(container, options);  // 이 한 줄이 지도를 그린다
          </script>
        </body>
      </html>
  - slug: kakao-async-load
    title: SDK를 비동기로 로드하기 (autoload=false)
    source_type: generated_minimal
    language: html
    code: |
      <!-- autoload=false : SDK 스크립트를 받아만 두고 즉시 초기화하지 않는다 -->
      <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JS_APP_KEY&autoload=false"></script>
      <script>
        // 준비가 되면 콜백을 호출해 준다. SPA/모듈 환경에서 "SDK 아직 안 뜸" 에러를 막는다
        kakao.maps.load(() => {
          const map = new kakao.maps.Map(document.getElementById("map"), {
            center: new kakao.maps.LatLng(37.5563, 126.9723),
            level: 3,
          });
        });
      </script>
  - slug: kakao-marker-infowindow
    title: 마커 + 정보창 찍기
    source_type: generated_minimal
    language: js
    code: |
      const position = new kakao.maps.LatLng(37.5563, 126.9723);

      const marker = new kakao.maps.Marker({ position });
      marker.setMap(map); // 지도에 올린다. setMap(null) 이면 제거

      const info = new kakao.maps.InfoWindow({
        content: '<div style="padding:6px 10px;">서울역</div>', // 문자열 HTML
      });

      // 마커를 클릭하면 정보창을 연다
      kakao.maps.event.addListener(marker, "click", () => info.open(map, marker));
  - slug: loader-urls
    title: 세 제공사의 로더 스크립트 (2026-09 기준)
    source_type: generated_minimal
    language: text
    code: |
      # 카카오맵 (JS 앱 키, 도메인 등록 필요)
      //dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JS_APP_KEY

      # NAVER 지도 v3  — 현재 방식
      https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_KEY_ID
      # NAVER 지도 v3  — 옛 방식(수업자료), 지금은 인증 실패
      https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID

      # Google Maps JS API (부트스트랩 로더, async)
      https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&loading=async&callback=initMap
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **지도 SDK**가 무엇인지(제공사가 배포하는 자바스크립트 파일 + 전역 객체) 설명할 수 있다.
- `<script>` 로 SDK를 불러오고, 빈 `<div>` 에 지도를 렌더하고, **마커·정보창**을 올릴 수 있다.
- **API 키 발급 → 도메인(웹 서비스 URL) 등록** 이라는 공통 절차를 이해한다.
- 카카오·NAVER·Google 지도의 로더가 어떻게 다른지, 수업자료의 NAVER 예제가 왜 지금은 안 되는지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- DOM 선택(`getElementById`)과 이벤트 리스너.
- 스크립트가 **로드된 뒤에야** 그 전역 객체를 쓸 수 있다는 것(`fetch`/Ajax Lesson의 "비동기").

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

"우리 회사 위치를 지도로 보여 주세요." 직접 만들려면 전 세계 도로·건물·위성 타일 데이터,
좌표계 변환, 타일을 격자로 이어 붙이는 렌더링, 확대/드래그 상호작용까지 전부 구현해야 한다.
현실적으로 불가능하다.

그래서 카카오·NAVER·Google이 **그 전부를 자바스크립트 라이브러리(SDK)로 배포**한다.
우리는 그 SDK를 불러와서 "여기(div)에, 이 좌표를 중심으로, 이 배율로 지도를 그려"라고 **명령만** 한다.
이것이 이 챕터의 주제 — **외부 API/SDK 붙이기** — 의 전형이다.

<!-- section: concept -->
## 지도 SDK를 쓰는 3단계 (제공사가 달라도 똑같다)

1. **키 발급 + 도메인 등록.** 콘솔에서 앱을 만들고 JS용 키를 받는다. 그 지도를 **띄울 웹 주소**
   (`http://localhost:5500`, 배포 도메인)를 등록한다. 등록 안 된 곳에서 열면 인증 실패로 지도가 안 뜬다.
2. **SDK 로드.** `<script src="...sdk.js?appkey=키">`. 로드되면 전역 객체(`kakao.maps.*`,
   `naver.maps.*`, `google.maps.*`)가 생긴다.
3. **지도 생성 + 오버레이.** 빈 `<div>` 를 하나 잡고 `new kakao.maps.Map(div, options)`.
   그 위에 마커, 정보창, 선/도형 같은 **오버레이**를 얹는다.

<!-- section: code | lang: html -->
## 실습 1 — 가장 작은 지도 (카카오맵)

수업자료의 `map_BASE.zip` 은 `<div id="map">` 만 있는 빈 페이지다. 여기에 SDK와 3줄을 더한다.

{{code: kakao-map-minimal}}

<!-- section: code_breakdown -->
## 한 줄씩

- `<div id="map" style="...height:400px">` — 지도가 들어갈 상자. **높이가 0이면 지도가 그려져도 안 보인다.**
  수업자료가 CSS로 `#map { height: 350px }` 를 먼저 주는 이유다.
- `?appkey=YOUR_JS_APP_KEY` — 카카오 개발자 콘솔 앱의 **JavaScript 키**. REST 키가 아니다.
- `new kakao.maps.LatLng(위도, 경도)` — 좌표 객체. 위도(lat)가 먼저, 경도(lng)가 뒤.
- `level: 3` — 카카오는 숫자가 작을수록 확대. (Google/NAVER는 `zoom` 이고 클수록 확대 — 제공사마다 다르다.)
- `new kakao.maps.Map(container, options)` — **이 줄이 실제로 지도를 그린다.**

<!-- section: mechanism -->
## SDK가 "아직 안 떴는데요" 문제

`<script src="...sdk.js">` 는 네트워크로 파일을 받아온다. 그 아래 `<script>` 가
바로 실행되면 `kakao` 가 아직 `undefined` 일 수 있다 — 특히 번들러/모듈 환경, `defer`,
동적 삽입일 때.

- **가장 단순한 해결**: 로더 `<script>` 를 지도 코드 **위에** 두고, 로더에 `async`/`defer` 를 붙이지 않는다.
- **권장**: `&autoload=false` + `kakao.maps.load(콜백)`. "준비되면 이 콜백을 불러 줘"라고 맡긴다.

{{code: kakao-async-load}}

NAVER는 로더에 `callback` 파라미터, Google은 부트스트랩 로더의 `callback=initMap` 으로 같은 문제를 푼다.

<!-- section: concept | title: 마커와 정보창 -->
## 실습 2 — 마커 + 정보창

지도 자체보다 **그 위에 뭔가 표시**하는 게 실무의 핵심이다.

{{code: kakao-marker-infowindow}}

- `marker.setMap(map)` 으로 올리고, `marker.setMap(null)` 로 내린다. (Google도 동일 패턴, NAVER는 `setMap`.)
- `InfoWindow.content` 는 **문자열 HTML** 또는 DOM 노드. 사용자 입력을 그대로 넣으면 XSS가 되므로
  이스케이프한 값만 넣는다.
- `kakao.maps.event.addListener(대상, "click", 핸들러)` — SDK 자체 이벤트 시스템. DOM `addEventListener`
  가 아니다.

<!-- section: concept | title: 기존 자료와 지금 -->
## 수업자료의 NAVER·Google 예제는 지금 그대로 되나?

수업자료(`MAP - API`)는 세 제공사를 다 다루지만 일부가 낡았다.

{{code: loader-urls}}

- **NAVER**: 자료의 `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=...` 는
  구버전 인증이라 **현재는 "인증이 실패하였습니다"** 가 뜬다. 지금은
  `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_KEY_ID` (도메인 `oapi`, 파라미터 `ncpKeyId`).
  지도 객체 API(`new naver.maps.Map`, `naver.maps.LatLng`, `zoom`)는 그대로다.
- **Google**: 자료의 `new google.maps.Marker(...)` 는 2024년부터 **deprecated**다. 지금은
  `google.maps.marker.AdvancedMarkerElement` 를 권장하고, 로더도 `callback` 만 쓰던 방식에서
  `loading=async` 를 붙인 부트스트랩 로더로 바뀌었다. `initMap` 콜백에서 지도를 만드는 흐름 자체는 같다.
- **카카오**: 자료의 `//dapi.kakao.com/v2/maps/sdk.js?appkey=...`, `new kakao.maps.Map`,
  `kakao.maps.LatLng` 는 **지금도 그대로 유효**하다. (콘솔 UI와 "카카오맵 사용 신청/비즈앱 전환"
  절차 화면은 수시로 바뀐다.)

핵심 감각: **"지도를 그리는 코드"는 잘 안 변한다. 잘 변하는 건 "키를 어떻게 받고 로더 URL이 뭐냐"** 이다.

<!-- section: must_know -->
## 반드시 기억할 것

- 지도 `<div>` 는 **명시적 크기(특히 높이)** 가 있어야 한다.
- 로더 `<script>` 가 **먼저** 로드돼야 전역 객체를 쓴다. 안전하게는 `autoload=false` + `load(콜백)`.
- 좌표는 **위도(lat), 경도(lng) 순서**. 확대 값의 방향(작을수록/클수록 확대)은 제공사마다 다르다.
- **JS 키는 브라우저에 그대로 노출된다.** 그래서 제공사가 **도메인 등록**으로 오용을 막는다.
  키를 깃에 커밋하지 말고(`.env` / 콘솔), 등록 도메인을 좁게 잡는다. → *학습용 최소 구현*에서는
  로컬 키를 그냥 쓰지만, 운영에서는 도메인 제한 + 사용량 알림이 필수다.
- 마커/정보창은 SDK 객체를 만들고 `setMap(map)` 으로 올린다. 이벤트는 **SDK 이벤트 API**로 건다.

<!-- section: experiment -->
## 직접 해 보기

1. `map_BASE.zip` 의 `map.html` 에 카카오 SDK를 붙여 지도를 띄워라. `level` 을 1↔10으로 바꿔 보라.
2. 회사(또는 아무 건물) 좌표를 구글맵에서 찾아 마커 + 정보창을 찍어라.
3. 버튼 3개(`1공장`/`2공장`/`사무동`)에 `data-lat`/`data-lng` 를 넣고, 클릭하면
   `map.setCenter(new kakao.maps.LatLng(...))` 로 중심을 옮겨라. (수업자료의 "탭과 연동" 예제)
4. `navigator.geolocation.getCurrentPosition` 으로 내 위치를 받아 그 좌표를 지도 중심으로 써 보라.

<!-- section: check_question -->
## 이해 점검

1. 지도 `<div>` 에 높이를 안 주면 무슨 일이 생기나?
2. `kakao.maps.load(콜백)` 을 쓰는 이유는? 안 쓰면 어떤 에러가 나나?
3. 수업자료의 NAVER 예제가 지금은 실패하는 이유와, 현재 로더 URL은?
4. "JS 키가 브라우저에 노출되는데 왜 그나마 안전한가?" — 제공사는 무엇으로 오용을 막나?

<!-- section: interview_question -->
## 면접 대비

- "서드파티 SDK를 `<script>` 로 불러올 때 생기는 로딩 타이밍 문제와 해결책은?"
- "클라이언트에 노출되는 API 키와 서버에만 두는 키의 차이, 각각 어떻게 보호하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 지도 SDK 붙이는 3단계(키+도메인 / 로더 / 생성+오버레이), div 크기 함정, autoload=false의 이유,
> JS 키 노출을 도메인 등록으로 막는 이유, NAVER 로더가 바뀐 점을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**지도 API는 제공사가 배포한 SDK를 `<script>` 로 불러와, 크기가 있는 `<div>` 에
`new Map(div, {center, zoom})` 으로 그리고 마커·정보창을 `setMap` 으로 얹는 것 —
잘 바뀌는 건 키 발급·로더 URL이고, 지도를 그리는 코드는 거의 그대로다.**
