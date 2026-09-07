---
id: tenlune-operations-agent/cli-command-dispatch
project: tenlune-operations-agent
title: CLI 명령 디스패치 — argv 파싱과 서브커맨드
unit_kind: infra
feature_area: CLI
concepts: [argv 파싱, 서브커맨드 스위치, 옵션 리더, 승인 경계를 코드로]
related_lessons:
  - data-and-backend/nodejs-server/config-and-structure
  - data-and-backend/nodejs-server/routing-and-modules
  - tooling-and-collaboration/editor-setup/npm-basics
  - typescript/functions-unions-guards/function-types
---

<!-- section: role -->
## 이 코드가 하는 일

`src/cli.ts` — 프로그램의 진입점. `process.argv` 에서 명령과 옵션을 읽어 `scan / list / review / draft /
import / submit` 으로 분기한다. `submit` 은 항상 **차단 메시지로 종료** 한다(승인 경계를 코드로).

<!-- section: code -->
## 핵심 코드 읽기

```ts
import { OperationsAgent } from "./agent/operations-agent.js";
import { LocalJsonRepository } from "./repositories/local-json-repository.js";

const repository = new LocalJsonRepository();
const agent = new OperationsAgent(repository);
const [command, ...args] = process.argv.slice(2);

try {
  if (command === "scan") {
    const source = readOption(args, "--source") ?? "wishket";
    const limit = Number(readOption(args, "--limit") ?? "10");
    const detailLimit = Number(readOption(args, "--detail-limit") ?? "3");
    if (source === "wishket") {
      const result = await agent.scanWishketPublic({ limit, detailLimit });
      // ... 출력. "No external application or quote was sent." 를 항상 붙인다
    }
  } else if (command === "review") {
    console.log(JSON.stringify(agent.review(readId(args)), null, 2));
  } else if (command === "draft") {
    const draft = agent.draft(readId(args));
    console.log("\nApproval boundary: draft is awaiting approval. Nothing was submitted externally.");
  }
  // ... submit 은 의도적 차단
}
```

<!-- section: why -->
## 왜 이렇게 했나

- 작은 도구에 웹 프레임워크·명령 파서 라이브러리는 과하다 — `process.argv.slice(2)` + `switch/if` 로 충분.
- 옵션 읽기(`readOption(args, "--limit")`)를 한 함수로 빼서 각 명령이 같은 방식으로 파싱한다.
- **승인 경계를 코드로**: `submit` 이 존재하지만 실행하면 차단 메시지만 낸다. "실수로 제출" 이 불가능하다.
- 모든 출력에 "외부로 아무것도 안 보냈다" 문구를 붙여, 사용자가 상태를 오해하지 않게 한다.

<!-- section: framework_role -->
## 프레임워크 없이 한 라우팅

`src/index.ts` 의 명령 디스패치(이 저장소 CMM)와 **같은 발상** 이다 — `argv[2]` 로 서브커맨드를 고르고,
각 케이스가 도메인 함수를 부른다. 라우터가 없어도 CLI는 이걸로 충분하다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/nodejs-server/config-and-structure` — 진입점 + 계층 조립
- `data-and-backend/nodejs-server/routing-and-modules` — 명령을 모듈로 분리
- `tooling-and-collaboration/editor-setup/npm-basics` — `npm run scan -- --limit 5`

<!-- section: caution -->
## 주의점

- `Number(readOption(...) ?? "10")` — 옵션이 숫자가 아니면 `NaN` 이 된다. 실제 서비스는 검증을 더 한다(학습용 최소).
- `submit` 차단을 "곧 풀 임시 조치" 로 생각하면 안 된다 — v1의 명시적 안전장치다.

<!-- section: experiment -->
## 작은 실습

1. `npm run scan -- --source sample --limit 3` 을 실행하고, `readOption` 이 `--source` 를 어떻게 뽑는지 코드에서 확인하라.
2. `submit` 을 실행해 어떤 메시지로 종료하는지 보라.
3. 새 서브커맨드 `stats` 를 추가해 저장된 기회 수를 출력하도록 만들어 보라.

<!-- section: check_question -->
## 이해 점검

1. 옵션 파싱을 한 함수로 뺀 이유는?
2. "승인 경계를 코드로" 가 이 파일에서 어떻게 구현됐나?
3. CMM의 `src/index.ts` 디스패치와 무엇이 같은가?

<!-- section: review -->
## 한 줄 정리

**`cli.ts` 는 `process.argv` 를 읽어 서브커맨드로 분기하고 옵션을 공통 함수로 파싱하며, `submit` 은
항상 차단 메시지로 끝나 "실수로 외부 제출" 을 코드 수준에서 막는다.**
