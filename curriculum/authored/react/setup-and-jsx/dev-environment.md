---
id: react/setup-and-jsx/dev-environment
chapter: react/setup-and-jsx
title: Vite + React 개발환경 세팅
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [react, vite, setup, npm]
related_material_ids:
  - 1gvijL_vSUC-mSP03eE_wEGZkjcb6MGES7734SKUWGJs   # 01_리액트 개발환경 세팅하기(2026)
  - 1orYZSB7hNsCAmCMyrobOSCkVorhUkCCAZOL9zzS_Z_E   # 01_React 설치
  - 1wrl236qROd_hjiCOzQqWjF_6naBEBrS6nN7LDxtfF88   # 03_개발환경 세팅 (Vite + React)
  - 1VNXrsvNf7SMF2H0XjKyWYOVW1QjxlqhIJLEEtAbZlh8   # 02_샘플 웹앱 실행하기
  - 1B5SKP6RYbz77fr508x4NdMPCmAUDIfVf              # my-first-app_v20260623.zip
sources:
  - reference_slug: react/Installation
prerequisites:
  - tooling-and-collaboration/editor-setup/npm-basics
code_examples:
  - slug: create-app
    title: 프로젝트 생성 · 실행
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      npm create vite@latest my-app       # 프레임워크 선택: React, 언어: JavaScript(or TypeScript)
      cd my-app
      npm install                          # 의존성 설치 (node_modules 생성)
      npm run dev                          # 개발 서버 → http://localhost:5173

      npm run build                        # dist/ 에 배포용 정적 파일
      npm run preview                      # build 결과 미리보기
  - slug: structure
    title: 폴더 구조와 진입점
    source_type: generated_minimal
    language: text
    code: |
      my-app/
        index.html        ← <div id="root"></div> + <script src="/src/main.jsx">
        package.json       ← scripts, dependencies
        vite.config.js
        src/
          main.jsx        ← createRoot(document.getElementById("root")).render(<App />)
          App.jsx         ← 최상위 컴포넌트 (여기부터 만든다)
          App.css / index.css
          assets/
        public/           ← 그대로 복사되는 정적 파일 (favicon 등)
  - slug: first-component
    title: 첫 컴포넌트
    source_type: generated_minimal
    language: jsx
    code: |
      // src/App.jsx
      import "./App.css";

      export default function App() {
        const today = new Date().toLocaleDateString("ko-KR");
        return (
          <main>
            <h1>내 첫 React 앱</h1>
            <p>오늘은 {today}</p>
          </main>
        );
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `npm create vite` 로 React 프로젝트를 만들고 `npm run dev` 로 실행할 수 있다.
- 프로젝트 구조(`index.html` → `src/main.jsx` → `src/App.jsx`)와 **진입점**을 안다.
- `npm run build` / `preview` 의 역할을 안다.
- Vite 개발 서버가 왜 빠른지(대략) 감을 잡는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `tooling-and-collaboration/editor-setup/npm-basics` (`package.json`, `npm install`, `npm run`).
- Node.js 설치.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- JSX·모듈·최신 문법은 브라우저가 바로 못 읽는다 → **빌드 도구**가 변환해 줘야 한다.
- 예전 도구(CRA/Webpack)는 개발 서버 시작이 느리고 설정이 복잡했다.
- Vite 는 시작이 즉각적이고 설정이 거의 없다 → 요즘 React 학습·실무의 기본.

<!-- section: concept -->
## 프로젝트 생성

{{code: create-app}}

- **`npm create vite@latest my-app`** → 대화형으로 React 선택. (`npm install` 후 `npm run dev`)
- 개발 서버는 **`http://localhost:5173`** (CRA 는 3000 이었다).
- 파일을 저장하면 **HMR**(Hot Module Replacement)로 화면이 즉시 갱신 — 새로고침 없이, 상태 유지.

<!-- section: mechanism -->
## 구조와 진입점

{{code: structure}}

실행 흐름:
1. 브라우저가 **`index.html`** 을 연다. 안에 `<div id="root"></div>` 와 `<script type="module" src="/src/main.jsx">`.
2. **`src/main.jsx`** 가 `createRoot(document.getElementById("root")).render(<App />)` 로 React 를 그 div 에 붙인다.
3. **`src/App.jsx`** 가 최상위 컴포넌트. **여기부터 우리가 만든다.**

{{code: first-component}}

- `public/` = 그대로 복사되는 정적 파일. `src/assets/` = 코드에서 `import` 하는 자원(번들에 포함·최적화).

<!-- section: mechanism | title: build -->
## dev vs build

- **`npm run dev`** — 개발용. 빠른 서버 + HMR. 최적화 안 함.
- **`npm run build`** — 배포용. `dist/` 에 번들·압축된 정적 파일(HTML/JS/CSS). 이걸 호스팅한다.
- **`npm run preview`** — `build` 결과를 로컬에서 확인(배포 전 점검).

> Vite 가 빠른 이유(간단히): dev 에서는 파일을 **미리 다 번들하지 않고**, 브라우저가 요청하는 모듈만
> 그때그때 변환해 준다(ESM 기반). 그래서 프로젝트가 커도 서버 시작이 즉각적이다.

<!-- section: must_know -->
## 반드시 기억할 것

- 생성: `npm create vite@latest` → React. 실행: `npm run dev` (`:5173`).
- 진입점 사슬: `index.html` → `src/main.jsx`(`createRoot().render(<App/>)`) → `src/App.jsx`.
- 저장하면 **HMR** 로 즉시 반영(새로고침·상태 초기화 없음).
- 배포는 **`npm run build`** → `dist/` 를 정적 호스팅. `preview` 로 사전 점검.
- `.jsx` 확장자 — JSX 를 쓰는 파일. (TS 면 `.tsx`)
- `node_modules/` 와 `dist/` 는 `.gitignore` (npm 챕터).

<!-- section: experiment -->
## 직접 해 보기

1. Vite 로 React 앱을 만들고 `npm run dev` 로 띄운 뒤, `src/App.jsx` 의 텍스트를 고쳐 저장 →
   새로고침 없이 바뀌는지(HMR) 확인.
2. `index.html` 을 열어 `<div id="root">` 와 `main.jsx` 로 이어지는 사슬을 눈으로 따라가라.
3. `npm run build` 후 `dist/` 안을 열어 보라. `npm run preview` 로 실행.
4. `public/` 에 이미지 하나, `src/assets/` 에 이미지 하나 넣고 각각 `<img src="/파일">` 과 `import img from "./assets/파일"` 로 써서 차이를 확인.

<!-- section: check_question -->
## 이해 점검

1. 브라우저가 `App.jsx` 를 그리기까지의 파일 사슬은?
2. `npm run dev` 와 `npm run build` 의 결과물은 각각 무엇인가?
3. HMR 이 새로고침과 다른 점은?
4. `public/` 과 `src/assets/` 에 넣는 이미지의 차이는?

<!-- section: interview_question -->
## 면접 대비

- "CRA(Webpack) 대신 Vite 를 쓰는 이유는?"
- "React 앱의 진입점과 렌더링이 시작되는 지점을 설명해 주세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 생성·실행 명령, index.html→main.jsx→App.jsx 사슬, HMR, dev vs build vs preview, public vs assets 를
> 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`npm create vite` → React → `npm run dev`(:5173, HMR). `index.html` → `src/main.jsx`(root 에 render)
→ `src/App.jsx` 부터 우리가 만든다. 배포는 `npm run build` 의 `dist/`.**

<!-- section: next -->
## 다음 Lesson

`setup-and-jsx/jsx` — JSX 문법과 HTML 의 차이.
