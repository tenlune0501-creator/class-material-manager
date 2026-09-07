---
id: react/ui-libraries/chartjs-in-react
chapter: react/ui-libraries
title: React에서 Chart.js 쓰기
mastery: practical
lesson_kind: lesson
estimated_minutes: 40
tags: [react, chartjs, visualization]
related_material_ids:
  - 17Pfk5sLLHCsAHo_6609VTXRxP1PpE6Nx6u-SNdjwJKI   # Chartjs - React (react-chartjs-2 + register + MyChart 컴포넌트)
sources:
  - title: "react-chartjs-2 — Getting started"
    url: https://react-chartjs-2.js.org/
    publisher: "reactchartjs"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Chart.js — Integration"
    url: https://www.chartjs.org/docs/latest/getting-started/integration.html
    publisher: "Chart.js"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - javascript/external-apis/chartjs
  - react/components-and-props/passing-props
code_examples:
  - slug: install-register
    title: 설치 + register (앱에서 한 번)
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      // npm i chart.js react-chartjs-2

      // src/components/MyChart.jsx
      import { Bar, Line } from "react-chartjs-2";
      import {
        Chart as ChartJS,
        CategoryScale, LinearScale,   // 축(스케일)
        BarElement, PointElement, LineElement, // 그려지는 요소
        Title, Tooltip, Legend,       // 플러그인
      } from "chart.js";

      // 트리셰이킹: 쓰는 것만 등록. 모듈 로드 시 1회면 된다
      ChartJS.register(
        CategoryScale, LinearScale,
        BarElement, PointElement, LineElement,
        Title, Tooltip, Legend,
      );
  - slug: chart-component
    title: 부모가 data를 내려주는 래퍼 컴포넌트
    source_type: generated_minimal
    language: jsx
    code: |
      // MyChart.jsx  (register 아래에 이어서)
      export default function MyChart({ title, labels, datasets }) {
        const data = { labels, datasets };
        const options = {
          maintainAspectRatio: false,               // 부모 크기를 따르게
          scales: { y: { beginAtZero: true } },
          plugins: {
            title: { display: Boolean(title), text: title ?? "" },
            legend: { display: true },
          },
        };
        return (
          // 높이가 있는 래퍼로 감싼다 (maintainAspectRatio:false 와 짝)
          <div style={{ width: "80%", height: 400, margin: "2rem auto" }}>
            <Bar data={data} options={options} />
          </div>
        );
      }
  - slug: parent-usage
    title: App에서 데이터 형태 만들어 넘기기
    source_type: generated_minimal
    language: jsx
    code: |
      function App() {
        const labels = ["1월", "3월", "6월", "9월", "12월"];
        const datasets = [
          { label: "2025 환율", data: [1300, 1400, 1450, 1420, 1410], borderWidth: 2 },
          { label: "2026 환율", data: [1450, 1550, 1500, 1400, 1300], borderWidth: 2 },
        ];
        return <MyChart title="환율 비교" labels={labels} datasets={datasets} />;
      }
      // datasets/labels 가 새 배열/객체여야 <Bar> 가 다시 그린다 (props 참조 변경)
  - slug: update-pattern
    title: 상태가 바뀔 때 — 새 객체로 넘긴다
    source_type: generated_minimal
    language: jsx
    code: |
      const [year, setYear] = useState(2026);
      const datasets = useMemo(
        () => [{ label: `${year} 환율`, data: RATES[year], borderWidth: 2 }],
        [year],
      );
      // year 가 바뀌면 datasets 참조가 바뀜 → react-chartjs-2 가 chart.update() 를 대신 호출
      <MyChart labels={labels} datasets={datasets} />
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `react-chartjs-2` 가 순수 Chart.js를 감싼 **얇은 래퍼**임을 이해하고, `<Bar>` / `<Line>` 컴포넌트로 차트를 그린다.
- `ChartJS.register(...)` 를 **왜, 어디서 한 번** 하는지 안다.
- 부모가 `labels` / `datasets` / `options` 를 props로 내려 주는 **재사용 차트 컴포넌트**를 만든다.
- 데이터가 바뀔 때 **새 객체/배열로 넘겨야** 다시 그려진다는 것을 안다(참조 기반).

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Chart.js 자체(`data = {labels, datasets}`, `options`, register) — `javascript/external-apis/chartjs`.
- props로 데이터 내리기, `useMemo`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

React에서 순수 Chart.js를 쓰면 `useRef` 로 `<canvas>` 를 잡고, `useEffect` 에서 `new Chart()`,
언마운트 때 `chart.destroy()`, 데이터 바뀌면 `chart.update()` 를 직접 관리해야 한다.
`react-chartjs-2` 가 이 생명주기를 대신 처리해 주고, 우리는 **컴포넌트에 props만** 넘긴다.

<!-- section: concept -->
## 설치와 register

{{code: install-register}}

- `react-chartjs-2` 는 렌더링을 **Chart.js에 위임**한다. 그래서 Chart.js의 트리셰이킹 규칙이 그대로 적용된다 —
  쓰는 **스케일(Category/Linear) · 요소(Bar/Point/Line) · 플러그인(Title/Tooltip/Legend)** 을 등록해야 한다.
- `register` 는 **모듈 로드 시 1회**면 충분하다. 보통 차트 컴포넌트 파일 최상단이나 앱 진입점에 둔다.
- 등록을 빠뜨리면 `"bar" is not a registered controller` 류 에러. 빠르게 만들 땐
  `import Chart from "chart.js/auto"` 로 전부 등록해도 된다(번들 큼).

<!-- section: code | lang: jsx -->
## 재사용 차트 컴포넌트

수업자료(`Chartjs - React`)의 `MyChart` 는 **차이나는 것만 props**로 받는 전형적인 래퍼다.

{{code: chart-component}}

{{code: parent-usage}}

- 부모(`App`)가 `labels` / `datasets` 를 만들어 내려 준다. `MyChart` 는 표현만 담당.
- `datasets` 에 객체 2개 → 그룹 막대. `title` 유무로 제목 표시를 토글(`display: Boolean(title)`).

<!-- section: mechanism -->
## 왜 크기 래퍼가 필요한가 / 갱신은 어떻게

- `maintainAspectRatio: false` 로 두면 차트가 **부모 요소 크기**를 따른다. 그래서 수업자료가
  `<div style={{ height: 400 }}>` 로 감싼다. 이게 없으면 캔버스가 계속 커지거나 0이 된다.
- `react-chartjs-2` 는 `data` / `options` props가 **바뀌면** 내부적으로 `chart.update()` 를 호출한다.
  단, **참조**로 비교하므로 같은 배열을 `mutate` 하면 안 그려진다 — 항상 **새 객체/배열**을 만들어 넘긴다.

{{code: update-pattern}}

<!-- section: must_know -->
## 반드시 기억할 것

- `react-chartjs-2` = Chart.js 래퍼. **`ChartJS.register(...)` 는 여전히 필요**(모듈당 1회).
- `<Bar data={...} options={...} />`. `data = { labels, datasets:[{ label, data }] }`.
- 데이터 변경은 **새 객체/배열로** props를 넘겨야 반영된다. 파생 데이터는 `useMemo` 로 만들되
  의존성이 바뀔 때만 새 참조가 되게.
- 반응형 크기는 `maintainAspectRatio: false` + **높이 있는 부모 div**.
- 차트 파일은 `register` 를 한곳에만. 여러 컴포넌트에서 흩어 부르면 중복이지만 무해(권장은 한곳).
- 시각화 정직성(`beginAtZero`, 축 왜곡 주의)은 라이브러리를 바꿔도 그대로 지킨다.

<!-- section: experiment -->
## 직접 해 보기

1. `MyChart` 를 만들고 `<Bar>` 로 그린 뒤, 같은 `data` 로 `<Line>` 도 나란히 렌더하라(`PointElement`/`LineElement` 등록 필요).
2. `register` 줄을 지우고 어떤 에러가 나는지 읽어 보라. 다시 넣어라.
3. 연도 선택 버튼(2024/2025/2026)을 만들어 `datasets` 를 `useMemo([year])` 로 바꾸고, 차트가 갱신되는지 확인.
4. `useMemo` 대신 기존 배열을 `push` 로 수정해 넘겨 보고, 왜 안 그려지는지 설명하라.
5. 부모 `<div>` 높이를 200/600으로 바꿔 `maintainAspectRatio: false` 효과를 확인하라.

<!-- section: check_question -->
## 이해 점검

1. `react-chartjs-2` 를 써도 `ChartJS.register` 가 필요한 이유는?
2. `<Bar data={data} />` 에서 `data` 를 매 렌더 새로 만들면(인라인 객체) 어떤 일이 생기나? 반대로 항상 같은 배열을 mutate 하면?
3. 차트가 부모를 안 채우거나 무한히 커질 때 옵션 어디를 보나?
4. `register` 는 어디에 몇 번 두는 게 좋은가?
5. 순수 Chart.js 대비 래퍼가 대신 해 주는 것은?

<!-- section: interview_question -->
## 면접 대비

- "명령형 라이브러리(Chart.js)를 선언형(React)으로 감쌀 때 생명주기(생성/갱신/파기)를 어떻게 다루나요?"
- "React에서 props 변경 감지가 참조 비교라는 점이 차트 갱신에 어떤 영향을 주나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> react-chartjs-2 = 래퍼, register 는 여전히 필요(1회), <Bar data options>, 데이터 변경은 새 참조,
> maintainAspectRatio:false + 부모 높이를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`react-chartjs-2` 는 Chart.js 생명주기를 대신 관리하는 래퍼다 — `ChartJS.register(...)` 로 쓰는 요소를
등록하고 `<Bar data={{labels,datasets}} options />` 로 그리며, 데이터는 항상 새 객체/배열로 넘겨야 갱신된다.**
