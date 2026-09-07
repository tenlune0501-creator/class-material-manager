---
id: javascript/external-apis/chartjs
chapter: javascript/external-apis
title: Chart.js로 데이터 시각화
mastery: practical
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, chartjs, visualization, chart]
related_material_ids:
  - 1CXsWroXCl9PJUygoTIIrWFZenRq4W83k              # chart-js_202607.zip (React + react-chartjs-2)
  - 1ze4bEucBoRWPCSoqcvau97Og64GwjLBXfFK9RyJzsGo   # Bar chart 배경/테두리 색상 입력데이터
sources:
  - title: "Chart.js — Step-by-step guide"
    url: https://www.chartjs.org/docs/latest/getting-started/usage.html
    publisher: "Chart.js"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Chart.js — Integration (bundlers, tree-shaking)"
    url: https://www.chartjs.org/docs/latest/getting-started/integration.html
    publisher: "Chart.js"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - javascript/dom-and-events/selecting-and-manipulating
  - javascript/objects-and-builtins/working-with-objects
code_examples:
  - slug: cdn-bar-minimal
    title: CDN + canvas — 가장 작은 막대그래프
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!doctype html>
      <html lang="ko">
        <body>
          <!-- 1. Chart.js 는 <canvas> 안에 그림을 그린다 -->
          <canvas id="chart" width="600" height="300"></canvas>

          <!-- 2. auto 번들: 모든 차트 타입/스케일이 미리 등록된 버전 (학습·프로토타입용) -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>

          <script>
            const ctx = document.getElementById("chart");
            new Chart(ctx, {
              type: "bar",                                   // bar | line | pie | doughnut | radar ...
              data: {
                labels: ["1월", "3월", "6월", "9월", "12월"],  // x축 눈금
                datasets: [
                  { label: "2026 환율", data: [1450, 1550, 1500, 1400, 1300], borderWidth: 1 },
                ],
              },
              options: {
                responsive: true,
                scales: { y: { beginAtZero: true } },
              },
            });
          </script>
        </body>
      </html>
  - slug: dataset-shape
    title: data 객체 — labels + datasets[]
    source_type: generated_minimal
    language: js
    code: |
      const data = {
        labels: ["1월", "3월", "6월", "9월", "12월"], // 항목 이름들 (datasets 의 data 와 길이가 맞아야 함)
        datasets: [
          {
            label: "2025 환율",
            data: [1300, 1400, 1450, 1420, 1410],       // labels 와 1:1 대응
            backgroundColor: "rgba(54, 162, 235, 0.3)", // 문자열 하나 = 전체, 배열 = 막대별로 다른 색
            borderColor: "rgb(54, 162, 235)",
            borderWidth: 2,
          },
          { label: "2026 환율", data: [1450, 1550, 1500, 1400, 1300], borderWidth: 2 },
        ],
      };
      // datasets 에 객체를 여러 개 넣으면 그룹 막대 / 여러 줄 선그래프가 된다
  - slug: tree-shake-register
    title: npm — 필요한 것만 register (v3+ 필수)
    source_type: generated_minimal
    language: js
    code: |
      // 방법 A: 전부 등록된 번들 (간단, 번들 크기 큼)
      import Chart from "chart.js/auto";

      // 방법 B: 트리셰이킹 — 쓰는 컨트롤러/엘리먼트/스케일/플러그인만 등록
      import {
        Chart, BarController, BarElement,
        CategoryScale, LinearScale, Tooltip, Legend,
      } from "chart.js";
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
      // 등록 안 한 요소를 쓰면 "not a registered ... " 에러가 난다
  - slug: update-data
    title: 데이터가 바뀌면 — 새 Chart 만들지 말고 update()
    source_type: generated_minimal
    language: js
    code: |
      const chart = new Chart(ctx, config);

      function setYear(values) {
        chart.data.datasets[0].data = values; // 배열 내용을 갈아끼우고
        chart.update();                       // 다시 그린다 (애니메이션 포함)
      }

      // 화면에서 치울 때: 메모리/이벤트 정리
      // chart.destroy();
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Chart.js가 **`<canvas>` 에 그린다**는 것과, `new Chart(ctx, { type, data, options })` 한 형태를 안다.
- **`data.labels` + `data.datasets[]`** 구조를 직접 만들 수 있다(막대별 색, 여러 dataset).
- npm 설치 시 왜 **`register`** 가 필요한지(v3부터 트리셰이킹), `chart.js/auto` 와의 차이를 안다.
- 데이터가 바뀔 때 `chart.update()` 를 쓰고, 컨테이너 크기/비율 문제를 다룰 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 객체 리터럴 중첩, 배열. DOM 요소 선택.
- (React 예제를 볼 거면) 컴포넌트와 props.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

숫자 배열을 막대/선 그래프로 그리려면 축 눈금 계산, 스케일링, 툴팁, 반응형 리사이즈,
캔버스 드로잉을 다 짜야 한다. Chart.js는 그걸 **설정 객체 하나**로 바꾼다 —
"타입은 bar, 라벨은 이것들, 데이터는 이 배열" 이라고 적으면 끝.

<!-- section: code | lang: html -->
## 실습 1 — CDN으로 가장 작은 차트

{{code: cdn-bar-minimal}}

<!-- section: code_breakdown -->
## 한 줄씩

- **`<canvas>`** — Chart.js는 SVG가 아니라 캔버스에 픽셀로 그린다. 그래서 요소를 지우려면
  DOM 삭제가 아니라 `chart.destroy()` 를 부른다.
- **`new Chart(ctx, config)`** — `ctx` 는 `<canvas>` 요소(또는 2d 컨텍스트). `config` 는
  `{ type, data, options }` 세 덩어리.
- **`data.labels`** — x축(카테고리축) 눈금. **`data.datasets[i].data`** 와 **길이가 같아야** 한다.
- **`options.scales.y.beginAtZero`** — y축을 0부터. 안 주면 데이터 최솟값 근처에서 시작해
  차이가 과장돼 보인다.

<!-- section: concept | title: data 구조 -->
## 핵심은 data 객체

{{code: dataset-shape}}

- `backgroundColor` 에 **문자열 하나**를 주면 그 dataset 전체가 같은 색. **배열**을 주면
  막대마다 다른 색 — 수업자료 `Bar chart 배경/테두리 색상` 이 색 배열 12개를 순환시키는 게 이 방식이다.
- `datasets` 에 객체를 2개 이상 넣으면 **그룹 막대**(bar) 또는 **여러 줄**(line)이 된다.
- `type: "line"` 으로만 바꾸면 같은 `data` 로 선그래프가 된다.

<!-- section: mechanism -->
## npm 설치 — 왜 register를 하나

수업자료의 `chart-js_202607.zip` 은 이 코드로 시작한다:

```js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, /* ... */ } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, /* ... */);
```

Chart.js **v3부터 트리셰이킹**이 기본이다. 모든 차트 타입·스케일·플러그인을 자동 포함하면
안 쓰는 pie/radar 코드까지 번들에 들어간다. 그래서 **쓰는 것만 `register`** 하게 바꿨다.

{{code: tree-shake-register}}

- 빠르게 실험할 땐 `import Chart from "chart.js/auto"` (전부 등록). 실서비스 번들은 트리셰이킹.
- `register` 를 빼먹으면 `"bar" is not a registered controller` 류 에러가 난다.

<!-- section: concept | title: 갱신과 크기 -->
## 데이터 갱신 · 컨테이너 크기

{{code: update-data}}

- 데이터가 바뀔 때마다 `new Chart()` 를 또 만들면 캔버스에 차트가 **겹쳐 쌓인다**.
  기존 인스턴스의 `chart.data...` 를 바꾸고 `chart.update()`.
- `responsive: true`(기본) + `maintainAspectRatio: false` 이면 차트가 **부모 요소 크기**를 따른다.
  그래서 수업자료가 `<div style={{ height: 400 }}>` 로 **높이 있는 래퍼**로 감싼다. 안 그러면
  캔버스가 계속 커지거나 0이 된다.

<!-- section: project_link -->
## React에서는

수업자료 zip은 순수 Chart.js가 아니라 **`react-chartjs-2`**(얇은 래퍼)를 쓴다 —
`<Bar data={...} options={...} />` 처럼 컴포넌트로. `ChartJS.register(...)` 는 그대로 필요하고,
`data` 를 **새 객체로** 넘겨야 리렌더 시 다시 그려진다.

React 환경의 구체적인 패턴(래퍼 컴포넌트, ref, 리렌더 최적화)은
`react/ui-libraries/chartjs-in-react` 에서 다룬다. 이 Lesson은 그 밑에 깔린 **Chart.js 자체**가 목표다.

<!-- section: must_know -->
## 반드시 기억할 것

- `new Chart(canvas, { type, data, options })`. `data = { labels, datasets:[{ label, data }] }`.
- `labels` 길이와 각 `dataset.data` 길이가 **일치**해야 한다.
- npm이면 **`Chart.register(...)`** (또는 `chart.js/auto`). 안 하면 등록 에러.
- 데이터 변경은 **`chart.update()`**, 제거는 **`chart.destroy()`**. `new Chart` 를 반복하지 않는다.
- 반응형 크기는 **부모 요소에 높이**를 주고 `maintainAspectRatio: false`.
- 시각화 윤리(학습용이라도): `beginAtZero`, 축 생략·왜곡 주의 — 그래프는 설득 도구다.

<!-- section: experiment -->
## 직접 해 보기

1. CDN 버전으로 막대그래프를 만들고 `type` 만 `"line"`, `"pie"` 로 바꿔 보라.
2. `datasets` 에 2개 dataset(2025·2026)을 넣어 그룹 막대로 만들어라.
3. `backgroundColor` 를 색 5개 배열로 줘서 막대마다 다른 색을 입혀라(수업자료 색값 사용).
4. 버튼으로 `chart.data.datasets[0].data` 를 랜덤 배열로 바꾸고 `chart.update()` 로 갱신하라.
5. `maintainAspectRatio: false` 로 두고 래퍼 `<div>` 높이를 200/600으로 바꿔 차이를 보라.

<!-- section: check_question -->
## 이해 점검

1. Chart.js는 무엇 위에 그리나? 그래서 요소를 지울 때 뭘 불러야 하나?
2. `labels` 가 5개인데 `data` 가 4개면 무슨 일이 생기나?
3. npm에서 `register` 를 왜 하나? 안 하면 어떤 에러가 나나?
4. 데이터가 바뀔 때 `new Chart()` 를 다시 부르면 뭐가 문제인가?
5. 차트가 부모를 안 채우거나 무한히 커질 때 어디를 손보나?

<!-- section: interview_question -->
## 면접 대비

- "차트 라이브러리(Chart.js)가 트리셰이킹을 도입하며 API를 바꾼 이유는?"
- "SVG 기반(D3/Recharts)과 Canvas 기반(Chart.js) 시각화의 트레이드오프는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> new Chart(ctx,{type,data,options}), data={labels,datasets}, register vs chart.js/auto,
> update()/destroy(), 반응형 크기(부모 높이 + maintainAspectRatio:false)를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Chart.js는 `<canvas>` 에 `new Chart(ctx, { type, data:{labels,datasets}, options })` 로 그린다 —
npm이면 쓰는 요소만 `register`, 갱신은 `chart.update()`, 반응형은 부모 높이로 제어한다.**
