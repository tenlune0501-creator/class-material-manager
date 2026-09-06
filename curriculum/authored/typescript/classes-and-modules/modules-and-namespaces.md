---
id: typescript/classes-and-modules/modules-and-namespaces
chapter: typescript/classes-and-modules
title: 모듈과 네임스페이스
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [typescript, modules, namespace, import]
related_material_ids:
  - 1kKr-fdcvZt_2pgaATCs9lkwdD8cR9Ig8J5vJ55ib7d4   # 08. 모듈과 네임스페이스
prerequisites:
  - typescript/classes-and-modules/classes-and-access-modifiers
  - javascript/classes-and-modules/es-modules
code_examples:
  - slug: es-modules
    title: ES 모듈 — import / export (표준)
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      // math.ts
      export const PI = 3.14159;
      export function area(r: number): number { return PI * r * r; }
      export default class Calculator { /* ... */ }

      // types.ts
      export interface User { id: number; name: string }

      // main.ts
      import Calculator, { PI, area } from "./math";
      import { type User } from "./types";        // 타입만 import (런타임 코드 없음)
      import type { User as U } from "./types";   // 파일 전체가 타입 전용
  - slug: barrel
    title: 배럴 파일 (index.ts 로 재-export)
    source_type: generated_minimal
    language: ts
    code: |
      // components/index.ts
      export { Button } from "./Button";
      export { Card } from "./Card";
      export * from "./forms";

      // 사용처
      import { Button, Card } from "./components";   // 경로 하나로
      // 주의: 큰 배럴은 번들 크기·순환 참조 문제를 낼 수 있음
  - slug: namespace
    title: namespace — 옛 방식 (지금은 거의 안 씀)
    source_type: generated_minimal
    language: ts
    code: |
      // 모듈 시스템이 없던 시절 전역 오염을 막던 방법
      namespace Geometry {
        export function area(r: number) { return 3.14 * r * r; }
      }
      Geometry.area(2);

      // 지금은 ES 모듈(파일 = 모듈)을 쓴다. namespace 는 .d.ts 로 전역 타입 정의할 때 정도만 만난다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **ES 모듈**(파일 = 모듈, `import`/`export`)이 표준이라는 것과 `export default` vs named 를 구분한다.
- **`import type`** / `import { type X }` 로 타입만 가져오는 이유를 안다.
- 배럴 파일(`index.ts` 재-export)의 편의와 함정을 안다.
- `namespace` 는 레거시이며 지금은 거의 안 쓴다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- JS ES 모듈(`export`/`import`), 클래스·인터페이스.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 옛 TS 코드에서 `namespace` 를 보고 요즘 방식과 헷갈린다.
- 타입만 필요한데 `import { User }` 로 가져와 번들러가 불필요한 코드를 포함(또는 순환 참조).
- `import` 경로가 `../../../components/Button` 처럼 길어진다.

<!-- section: concept -->
## ES 모듈이 표준

{{code: es-modules}}

- **파일 하나 = 모듈 하나.** `export` 한 것만 밖에서 보인다.
- `export default` (파일당 1개, import 이름 자유) + named `export` (여러 개, import 이름 고정).
- **`import type` / `import { type X }`** — 타입만 가져온다. 컴파일 후 그 import 는 **사라진다**
  (런타임 코드 아님). `verbatimModuleSyntax`/`isolatedModules` 환경에서 특히 권장.
- 경로: 상대(`./`, `../`) 또는 패키지 이름(`react`). tsconfig `paths` 로 `@/` 별칭도.

<!-- section: mechanism -->
## 배럴 파일

{{code: barrel}}

- `components/index.ts` 에서 하위 모듈을 모아 `export` → 사용처는 `import { Button, Card } from "./components"`.
- 장점: 경로 단순화, 공개 API 정리.
- **함정**: 배럴이 크면 **하나만 import 해도 배럴 전체가 로드**(트리셰이킹 방해), **순환 참조** 유발.
  → 작게 유지하거나, 성능 민감한 곳은 직접 경로.

<!-- section: code | lang: ts -->
## namespace (레거시)

{{code: namespace}}

- 모듈 시스템이 없던 시절 전역 이름 충돌을 막던 도구.
- **지금은 안 쓴다.** ES 모듈로 충분. `namespace` 는 `.d.ts` 에서 전역 타입을 그룹화할 때 정도만 만난다.

<!-- section: must_know -->
## 반드시 기억할 것

- **파일 = 모듈. ES `import`/`export` 만.** `namespace` 는 신규 코드에서 쓰지 않는다.
- `export default` (1개) vs named (여러 개). named 를 선호하는 팀도 많다(자동 import·리네임 안정).
- **타입만 가져올 땐 `import type`** — 런타임 코드가 안 섞이고 번들이 깨끗.
- 배럴(`index.ts`)은 편하지만 **작게** — 큰 배럴은 트리셰이킹·순환 참조 문제.
- tsconfig `paths` + Vite `resolve.alias` 로 `@/` 절대 import 를 맞춘다(둘 다 설정해야 함).

<!-- section: experiment -->
## 직접 해 보기

1. `math.ts` 에 `PI`, `area`, `default class` 를 export 하고 `main.ts` 에서 import. default 를 다른 이름으로 받아 보라.
2. `types.ts` 의 인터페이스를 `import { User }` 와 `import type { User }` 로 각각 가져와 컴파일 결과(JS)를 비교.
3. `components/index.ts` 배럴을 만들어 경로를 단순화. 그다음 A 가 배럴을, 배럴이 A 를 참조하는 순환을 만들어 문제를 관찰.
4. `tsconfig.json` 의 `paths` 로 `@/` 를 설정하고 Vite 에도 alias 를 추가해 `import ... from "@/components"` 를 동작시켜라.

<!-- section: check_question -->
## 이해 점검

1. `export default` 와 named export 의 import 방식 차이는?
2. `import type` 을 쓰면 컴파일 후 무엇이 달라지나?
3. 배럴 파일의 장점과 함정은?
4. `namespace` 를 신규 코드에서 안 쓰는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "`import type` 이 필요한 이유(빌드/번들 관점)는?"
- "배럴 파일이 성능에 미치는 영향은?"

<!-- section: review -->
## 한 줄 정리

**ES 모듈(파일 = 모듈, `import`/`export`)이 표준이고 `namespace` 는 레거시 — 타입만 필요하면
`import type`, 배럴(`index.ts`)은 작게 유지한다.**

<!-- section: next -->
## 다음 Chapter

`typescript/advanced-and-utility-types` — 유틸리티 타입과 고급 타입.
