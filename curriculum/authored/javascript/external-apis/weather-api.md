---
id: javascript/external-apis/weather-api
chapter: javascript/external-apis
title: 날씨 API (기상청·공공데이터)
mastery: practical
lesson_kind: lesson
estimated_minutes: 50
tags: [javascript, weather, api, public-data]
related_material_ids:
  - 1KulC-xgMNEzQBPH7piSFCpTE_tEryIPzlZ-ioBnawK8   # 기상청 날씨 api (초단기실황 / 단기예보)
  - 1ImZMs1l7VZ33ZUplGFP_VofjyrWrDgi_tw_kvacsf8k   # Weather API (OpenWeatherMap)
  - 1j43M8gac2zVaF-eiQQ3_YHy_3q3Z7aPHOLMLEZsjomU   # 공공 데이터 - 초단기실황 (fetch 버전)
sources:
  - title: "기상청_단기예보 조회서비스 (VilageFcstInfoService_2.0)"
    url: https://www.data.go.kr/data/15084084/openapi.do
    publisher: "공공데이터포털 / 기상청"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "OpenWeatherMap — Current Weather Data"
    url: https://openweathermap.org/current
    publisher: "OpenWeather"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - javascript/async-and-http/fetch-and-ajax
  - javascript/async-and-http/promises-async-await
  - javascript/objects-and-builtins/array-methods
code_examples:
  - slug: kma-ultra-fetch
    title: 기상청 초단기실황 — fetch로 현재 기온·습도·풍속
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // base_date: 오늘(YYYYMMDD). base_time: 정시("0600" 등), 매시각 40분 이후에 그 시각이 나옴
      function ymd(d = new Date()) {
        const p = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
      }

      const KEY = "YOUR_SERVICE_KEY";                 // 공공데이터포털에서 발급 (URL 인코딩된 키)
      const base = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
      const qs = new URLSearchParams({
        serviceKey: KEY, dataType: "JSON", numOfRows: "60", pageNo: "1",
        base_date: ymd(), base_time: "0600",
        nx: "60", ny: "127",                          // 격자 좌표 (서울 종로 부근). 위경도 아님
      });

      async function loadWeather() {
        const res = await fetch(`${base}?${qs}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.response.header.resultCode !== "00") {
          throw new Error(json.response.header.resultMsg); // 키 미승인/파라미터 오류 등
        }
        const items = json.response.body.items.item;      // 카테고리별 관측값 배열
        const pick = (cat) => items.find((it) => it.category === cat)?.obsrValue;
        return { 기온: pick("T1H"), 습도: pick("REH"), 풍속: pick("WSD") };
      }

      loadWeather().then(console.log).catch(console.error);
  - slug: kma-response-shape
    title: 기상청 응답 JSON 구조
    source_type: generated_minimal
    language: json
    code: |
      {
        "response": {
          "header": { "resultCode": "00", "resultMsg": "NORMAL_SERVICE" },
          "body": {
            "items": {
              "item": [
                { "category": "T1H", "obsrValue": "24.3", "baseDate": "20260907", "baseTime": "0600", "nx": 60, "ny": 127 },
                { "category": "REH", "obsrValue": "57" },
                { "category": "WSD", "obsrValue": "2.1" }
              ]
            }
          }
        }
      }
      // 초단기실황 카테고리: T1H 기온(℃) · REH 습도(%) · WSD 풍속(m/s) · RN1 1시간 강수량 · PTY 강수형태
      // 단기예보(getVilageFcst)는 obsrValue 대신 fcstValue, fcstDate/fcstTime 을 쓴다. 카테고리 TMP=기온
  - slug: kma-forecast-table
    title: 단기예보 — 카테고리로 걸러 시간대별 표 만들기
    source_type: generated_minimal
    language: js
    code: |
      // getVilageFcst 응답의 item[] 에서 기온(TMP)만 골라 시간순 배열로
      const rows = items
        .filter((it) => it.category === "TMP")
        .map((it) => ({ date: it.fcstDate, time: it.fcstTime, temp: it.fcstValue }));

      document.querySelector("tbody").innerHTML = rows
        .map((r) => `<tr><td>${r.date}</td><td>${r.time}</td><td>${r.temp}℃</td></tr>`)
        .join("");
  - slug: owm-current
    title: OpenWeatherMap — 도시 이름으로 현재 날씨
    source_type: generated_minimal
    language: js
    code: |
      const KEY = "YOUR_API_KEY";
      const url = new URL("https://api.openweathermap.org/data/2.5/weather");
      url.search = new URLSearchParams({
        q: "Seoul,KR", appid: KEY, units: "metric", lang: "kr", // units=metric → ℃ (기본은 켈빈)
      });

      const res = await fetch(url);
      const data = await res.json();               // { main:{temp,...}, weather:[{description,icon}], name }
      console.log(data.name, data.main.temp, data.weather[0].description);
      const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **공공데이터포털(data.go.kr)** 에서 서비스 키를 받아 기상청 API를 `fetch` 로 호출할 수 있다.
- 기상청 응답의 `response.header.resultCode` 로 성공을 판정하고, `body.items.item[]` 을
  **카테고리 코드**(T1H·REH·WSD·TMP…)로 걸러 원하는 값을 뽑을 수 있다.
- `base_date`/`base_time`/`nx`/`ny`(격자 좌표) 같은 파라미터의 의미를 안다.
- OpenWeatherMap 같은 글로벌 API와 기상청 API의 차이(요청 방식, 응답 구조, 좌표계)를 비교할 수 있다.
- **브라우저에 노출되는 서비스 키의 한계**와 학습용/운영용 경계를 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `fetch` + `async/await`, `res.ok` 확인, `res.json()`.
- 배열 `.find()` / `.filter()` / `.map()`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

날씨는 우리가 만들 수 있는 데이터가 아니다. 관측소·수치예보 모델이 있어야 한다.
그래서 **기상청이 공공데이터포털을 통해 API로 개방**한다. 우리는 "이 좌표, 이 시각의
관측/예보 값을 JSON으로 줘"라고 요청만 하면 된다.

수업자료는 이걸 jQuery `$.ajax` / `$.getJSON` 으로 했지만, 지금은 **표준 `fetch`** 로 충분하다
(세 번째 자료 `공공 데이터 - 초단기실황` 이 이미 `fetch` 로 바꿔 놓았다). 이 Lesson도 `fetch` 기준이다.

<!-- section: concept -->
## 공공데이터포털 API의 공통 모양

1. **회원가입 → 활용신청 → 서비스 키 발급.** 승인까지 (자동승인이라도) **1시간쯤** 걸린다.
   키는 **URL 인코딩된 문자열**(`%2B`, `%3D` 포함)로 준다 — 그대로 쿼리에 넣는다.
2. **엔드포인트 + 쿼리스트링**으로 GET 요청. 기상청 초단기실황은
   `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst`.
3. **응답은 이중 구조**: `response.header`(성공 여부) + `response.body.items.item`(실제 데이터 배열).
   `header.resultCode === "00"` 이면 성공, 아니면 `resultMsg` 에 이유(키 미승인, 파라미터 오류…).

<!-- section: code | lang: js -->
## 실습 1 — 초단기실황(현재값) 가져오기

{{code: kma-ultra-fetch}}

{{code: kma-response-shape}}

<!-- section: code_breakdown -->
## 파라미터가 하는 일

- **`base_date` / `base_time`** — "언제 발표된 자료냐". 초단기실황은 매 정시 자료가
  **그 시각 40분 이후**에 올라온다. 지금이 06:20이면 `base_time`을 `"0500"`으로 줘야 안전하다.
- **`nx` / `ny`** — 위·경도가 **아니다.** 기상청이 한반도를 5km 격자(약 37,700칸)로 나눈
  **격자 번호**다. 종로 근처가 대략 `nx=60, ny=127`. 위경도 → 격자는 기상청 배포 엑셀이나
  변환 도구(`fronteer.kr/service/kmaxy` 등)로 구한다.
- **`dataType=JSON`** — 안 주면 기본이 XML이다.
- **`numOfRows`** — 한 번에 받을 행 수. 초단기실황은 8개 안팎, 단기예보는 수백 개라 넉넉히 준다.

<!-- section: concept | title: 예보를 표로 -->
## 실습 2 — 단기예보를 카테고리로 걸러 표로

`getVilageFcst`(단기예보)는 여러 시각의 예보가 **한 배열에 카테고리별로 섞여** 온다.
`obsrValue`(실황) 대신 `fcstValue`(예보), `fcstDate`/`fcstTime` 을 쓴다.

{{code: kma-forecast-table}}

수업자료는 이걸 처음에 `for` 루프로 하다가 `.filter()` 로 리팩터링하고, 두 카테고리(TMP·REH)를
`fcstTime` 기준으로 합치는 것까지 나아간다 — 배열 메서드 연습으로 좋은 소재다.

<!-- section: concept | title: 글로벌 API 비교 -->
## 비교 — OpenWeatherMap

두 번째 자료의 OpenWeatherMap은 "글로벌·간단" 쪽이다.

{{code: owm-current}}

| | 기상청(공공데이터포털) | OpenWeatherMap |
|---|---|---|
| 위치 지정 | `nx`/`ny` **격자 좌표** | `q=Seoul,KR` 또는 `lat`/`lon` |
| 응답 | `response.header`+`body.items.item[]` (카테고리 코드) | 평평한 객체 `main.temp`, `weather[0]` |
| 온도 단위 | ℃ 그대로 | 기본 **켈빈**, `units=metric` 필요 |
| 무료 한도(2026-09) | 개발계정 트래픽 한도 | `/data/2.5/weather` 60회/분·100만회/월 |

수업자료의 OWM 예제는 `http://` + jQuery 라서 두 가지가 낡았다:
`https://` 로 호출해야 하고(HTTPS 페이지에서 `http://` 요청은 브라우저가 차단),
`$.getJSON` 대신 `fetch`. 엔드포인트 `data/2.5/weather` 자체는 지금도 유효하다.

<!-- section: must_know -->
## 반드시 기억할 것

- 응답 성공은 HTTP 200이 아니라 **`response.header.resultCode === "00"`** 으로 판정한다.
- `nx`/`ny` 는 **격자 번호**다. 위경도를 그대로 넣으면 엉뚱한 데이터가 온다.
- `base_time` 은 **정시 + 40분 규칙**을 지켜 조금 이전 시각을 준다. 안 그러면 `NO_DATA`.
- `dataType=JSON` 을 꼭 붙인다.
- **서비스 키/`appid` 는 브라우저 네트워크 탭에 그대로 보인다.** 학습용으로는 그냥 쓰지만,
  운영에서는 **내 서버(프록시)가 키를 들고 대신 호출**하고, 프런트는 내 서버만 부른다.
  키를 깃에 커밋하지 않는다(수업자료 URL에 박힌 키는 이 Lesson에서 재사용하지 않는다).
- data.go.kr 호출이 브라우저에서 **CORS/HTTPS 문제**로 막히면, 그때도 답은 "프록시 서버 경유"다.

<!-- section: experiment -->
## 직접 해 보기

1. 공공데이터포털에서 "기상청_단기예보 조회서비스" 활용신청 → 키 발급. `getUltraSrtNcst` 로
   현재 기온(T1H)을 화면에 출력하라.
2. `base_time` 을 미래 시각으로 줘서 `resultCode` 가 `"00"` 이 아닌 경우를 만들어 보고,
   `resultMsg` 를 화면에 표시하라.
3. `getVilageFcst` 로 오늘 기온(TMP)을 시간대별 표로 그려라. 습도(REH)도 같은 행에 합쳐라.
4. OpenWeatherMap에 가입해 `q=` 를 바꿔 가며(도쿄, 런던) 현재 날씨와 아이콘을 표시하라.

<!-- section: check_question -->
## 이해 점검

1. `fetch` 가 200을 받았는데도 데이터가 없을 수 있다. 어디를 봐야 하나?
2. `nx=37.5, ny=127.0` 을 넣으면 왜 안 되나?
3. 지금 06:20인데 `base_time="0600"` 으로 초단기실황을 부르면 어떤 결과가 나올 가능성이 큰가?
4. 브라우저에 노출된 서비스 키를 "숨기려면" 실제로 무엇을 해야 하나?

<!-- section: interview_question -->
## 면접 대비

- "프런트엔드에서 서드파티 API 키를 다뤄야 할 때 어떻게 보호하나요?"
- "외부 API 응답을 화면에 쓰기 전에 어떤 검증·변환 단계를 두나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 공공데이터포털 API 3단계(키+승인 / 엔드포인트+쿼리 / header·body 이중구조), resultCode 판정,
> nx·ny 격자, base_time 40분 규칙, 키 노출을 프록시로 막는 이유를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**날씨 API는 `fetch` 로 엔드포인트+쿼리스트링을 부르고, `response.header.resultCode` 로 성공을
판정한 뒤 `body.items.item[]` 을 카테고리 코드로 걸러 쓴다 — 기상청은 격자 좌표·이중 응답 구조가,
글로벌 API는 평평한 JSON이 특징이고, 키는 학습용으로만 클라이언트에 둔다.**
