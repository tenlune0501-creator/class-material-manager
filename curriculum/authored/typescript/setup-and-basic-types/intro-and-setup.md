---
id: typescript/setup-and-basic-types/intro-and-setup
chapter: typescript/setup-and-basic-types
title: TypeScript 소개와 개발환경 설정
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [typescript, setup, tsconfig, compiler]
related_material_ids:
  - 1u4K8A6aZy2CQm2J779z1WU0RUWCGoOoHnLFnFizxXkw   # 01. TypeScript 소개와 개발 환경 설정
  - 1IX3_8v_OODnvSZiAAUtrqfHnkJyXsS6L              # typscript_basic_base.zip
prerequisites:
  - javascript/language-basics/functions
  - javascript/objects-and-builtins/working-with-objects
code_examples:
  - slug: why-ts
    title: 타입이 잡아 주는 것
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      function total(price: number, qty: number): number {
        return price * qty;
      }

      total(1000, 3);        // 3000
      total("1000", 3);      // ✅ 컴파일 에러: '"1000"' 은 number 가 아님 (실행 전에 잡힘)
      total(1000);           // ✅ 에러: 인자 2개 필요

      // JS 였다면 "1000" * 3 = 3000 이 우연히 동작하거나, undefined * 3 = NaN 이 런타임에 터짐
  - slug: setup
    title: 설치 · 설정 · 실행
    source_type: generated_minimal
    language: bash
    code: |
      npm i -D typescript          # 프로젝트에 설치 (전역 -g 도 가능)
      npx tsc --init               # tsconfig.json 생성
      npx tsc                      # .ts → .js 컴파일 (outDir 로)
      npx tsc --watch              # 저장할 때마다 재컴파일

      # 실행:  node dist/index.js
      # 또는 tsx / ts-node 로 .ts 를 바로 (npx tsx src/index.ts)
      # Vite/Next 는 내부에서 알아서 변환한다
  - slug: tsconfig
    title: tsconfig.json 핵심 옵션
    source_type: generated_minimal
    language: json
    code: |
      {
        "compilerOptions": {
          "target": "ES2020",        // 어떤 JS 문법으로 내보낼지
          "module": "ESNext",        // 모듈 방식
          "outDir": "./dist",        // 컴파일 결과 폴더
          "rootDir": "./src",
          "strict": true,            // ★ 가장 중요 — 모든 엄격 검사 on
          "esModuleInterop": true,
          "skipLibCheck": true       // node_modules .d.ts 검사 생략 (속도)
        },
        "include": ["src/**/*.ts"],
        "exclude": ["node_modules"]
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- TypeScript 가 **JavaScript + 정적 타입**이고 `.ts` 는 **JS 로 컴파일**돼야 실행된다는 것을 안다.
- `npm i -D typescript` → `tsc --init` → `tsc` 흐름으로 프로젝트를 세팅한다.
- `tsconfig.json` 의 핵심 옵션(`strict`, `target`, `outDir`, `include`)이 무엇을 하는지 안다.
- 타입이 "실행 전에" 잡아 주는 오류의 예를 든다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- JS 언어 기본(함수, 객체, 모듈). npm.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 함수에 잘못된 타입의 인자를 넘겨도 JS 는 조용히 이상한 값을 만든다(`"1000" * 3`, `undefined.name`).
  런타임에, 그것도 사용자 화면에서 터진다.
- 큰 프로젝트에서 "이 함수가 뭘 받고 뭘 반환하는지" 를 코드로 알 수 없어 매번 추적.

<!-- section: concept -->
## TypeScript = JS + 타입

{{code: why-ts}}

- **JavaScript 의 상위집합(superset)** — 모든 JS 코드는 유효한 TS 다. `.js` → `.ts` 로 바꾸고 점진 적용.
- **정적 타입** — 변수·인자·반환값의 타입을 명시(또는 추론). **컴파일 시점**에 타입 오류를 잡는다.
- `.ts` 는 브라우저·Node 가 직접 못 읽는다 → **`tsc` 가 `.js` 로 컴파일**(타입은 제거됨).
- **도구 친화적** — VS Code 자동완성·리팩터링·"이건 뭐지" 가 타입 덕에 정확해진다.

<!-- section: mechanism -->
## 세팅

{{code: setup}}
{{code: tsconfig}}

- `tsconfig.json` = 컴파일러 설정. 있으면 그 폴더가 "TS 프로젝트 루트".
- **`strict: true`** — 가장 중요. `noImplicitAny`, `strictNullChecks` 등을 한 번에 켠다. **새 프로젝트는 항상 켠다.**
- `target` — 내보낼 JS 문법 버전. `outDir`/`rootDir` — 입출력 폴더.
- 실무: Vite/Next 는 내부에서 변환하므로 `tsc` 를 직접 안 돌리고, `tsc --noEmit` 을 **타입 검사만** 하는 CI 스텝으로 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- TS 는 JS 의 상위집합. `.ts` → `tsc` → `.js` (타입은 런타임에 사라진다 — "지운다").
- **`strict: true` 는 무조건 켠다.**
- 타입 오류는 **컴파일 시점**에 잡힌다(실행 전). 런타임 동작은 JS 와 동일.
- Vite/Next 프로젝트는 `.tsx`/`.ts` 를 알아서 처리 — 별도 `tsc` 빌드 불필요, `tsc --noEmit` 은 검사용.
- `any` 를 쓰면 그 부분은 타입 검사가 꺼진다 — 최후의 수단.
- `.d.ts` = 타입 선언만 담은 파일(라이브러리가 제공하거나, JS 라이브러리용 `@types/xxx`).

<!-- section: experiment -->
## 직접 해 보기

1. `npm i -D typescript` + `npx tsc --init` 후 `src/index.ts` 에 `total` 함수를 만들고 잘못된 인자를 넣어
   `tsc` 에러를 확인. 그다음 `node dist/index.js` 로 실행.
2. `tsconfig.json` 에서 `strict` 를 `false` 로 바꿔 `let x; x.foo` 같은 코드가 통과되는 걸 보고 다시 `true`.
3. `npx tsx src/index.ts` (또는 `ts-node`)로 컴파일 없이 바로 실행해 보라.
4. VS Code 에서 함수 인자에 마우스를 올려 타입 힌트가 뜨는 걸 확인.

<!-- section: check_question -->
## 이해 점검

1. `.ts` 파일을 브라우저에서 바로 못 쓰는 이유는?
2. `strict: true` 는 왜 켜야 하나?
3. 타입 오류는 언제(어느 시점에) 발견되나?
4. `tsc` 와 `tsc --noEmit` 의 차이는?

<!-- section: interview_question -->
## 면접 대비

- "TypeScript 를 도입하면 얻는 것과 비용은?"
- "타입은 런타임에 존재하나요? (아니오 — 왜 중요한가)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> TS = JS + 정적 타입, 컴파일 필요(타입 제거), strict, tsconfig 핵심, 오류 시점을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**TypeScript 는 JS 에 정적 타입을 더해 컴파일 시점에 오류를 잡는다 — `.ts` 는 `tsc` 로 `.js` 가 되고
타입은 사라진다. `strict: true` 는 항상 켠다.**

<!-- section: next -->
## 다음 Lesson

`setup-and-basic-types/basic-types-and-inference` — 기본 타입과 추론.
