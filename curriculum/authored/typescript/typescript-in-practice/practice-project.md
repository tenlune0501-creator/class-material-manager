---
id: typescript/typescript-in-practice/practice-project
chapter: typescript/typescript-in-practice
title: 실전 프로젝트 1 (CLI 또는 웹앱)
mastery: practical
lesson_kind: lesson
estimated_minutes: 120
tags: [typescript, project, cli, practice]
related_material_ids:
  - 1iF9PprUXLgOKGBwqoTv0wP_7nhloyzX47xZEVA-Bx3U   # 10. 실전 프로젝트 1 (CLI 또는 웹앱)
  - 1w6DCrqmtw9TrG05k9LHvk1_G4FcY96Nd              # typscript_basic_final.zip
prerequisites:
  - typescript/advanced-and-utility-types/utility-and-advanced-types
project_links:
  - unit: tenlune-marketing-agent/repository-port-and-adapters
    note: 포트 인터페이스 하나에 인메모리·Supabase 두 어댑터 — 빌드 없는 TS 실전 프로젝트의 계층 구조
  - unit: tenlune-operations-agent/cli-command-dispatch
    note: process.argv 로 서브커맨드를 분기하는 CLI 진입점 (이 저장소 src/index.ts 와 같은 발상)
code_examples:
  - slug: domain-types
    title: 도메인 타입부터 (판별 유니언 + Result)
    source_type: generated_minimal
    language: ts
    is_canonical: true
    code: |
      // 1) 데이터의 모양
      type Priority = "low" | "mid" | "high";
      interface Task {
        readonly id: string;
        title: string;
        done: boolean;
        priority: Priority;
        due?: string;   // ISO 날짜, 선택
      }

      // 2) 결과 타입 (성공/실패를 예외 대신 값으로)
      type Result<T> = { ok: true; value: T } | { ok: false; error: string };

      // 3) 생성 payload 는 파생
      type NewTask = Omit<Task, "id" | "done">;
  - slug: pure-core
    title: 순수 로직을 먼저 (테스트 가능)
    source_type: generated_minimal
    language: ts
    code: |
      function addTask(tasks: Task[], input: NewTask): Result<Task[]> {
        const title = input.title.trim();
        if (!title) return { ok: false, error: "제목은 필수" };
        const task: Task = { id: crypto.randomUUID(), done: false, ...input, title };
        return { ok: true, value: [...tasks, task] };
      }

      function toggle(tasks: Task[], id: string): Task[] {
        return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      }

      function byPriority(tasks: Task[]): Record<Priority, Task[]> {
        const groups: Record<Priority, Task[]> = { low: [], mid: [], high: [] };
        for (const t of tasks) groups[t.priority].push(t);
        return groups;
      }
  - slug: io-edge
    title: 입출력(IO)은 경계에서만, unknown 을 좁혀서
    source_type: generated_minimal
    language: ts
    code: |
      function loadTasks(raw: string): Result<Task[]> {
        let parsed: unknown;
        try { parsed = JSON.parse(raw); }
        catch { return { ok: false, error: "JSON 파싱 실패" }; }

        if (!Array.isArray(parsed)) return { ok: false, error: "배열이 아님" };
        // 필요하면 각 항목을 검증 (zod 같은 라이브러리를 쓰면 편함)
        return { ok: true, value: parsed as Task[] };
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 작은 프로젝트(할 일 관리 CLI 또는 웹앱)를 **타입부터 설계**해 만들 수 있다.
- **도메인 타입 → 순수 로직 → IO(경계)** 순서로 쌓는다.
- `Result<T>` 판별 유니언으로 성공/실패를 값으로 다룬다.
- 외부 입력(JSON/파일/입력창)을 `unknown` 으로 받아 좁혀서 쓴다.
- `strict` 를 켠 상태로 `any` 없이 완성한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `typescript/*` 전체 (기본 타입, 객체/interface, 함수, 유니언/가드, 제네릭, 유틸리티 타입).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 코드를 먼저 쓰고 타입을 나중에 억지로 붙여 `any` 가 스며든다.
- 계산 로직과 화면/파일 입출력이 섞여 테스트가 안 된다.
- 파일에서 읽은 데이터를 검증 없이 `Task[]` 로 단언해 런타임에 터진다.

<!-- section: concept -->
## 순서 — 타입 → 로직 → IO

{{code: domain-types}}

1. **도메인 타입**: `Task`, `Priority`, `Result<T>`. 데이터의 모양을 먼저 못 박는다.
   생성/수정 payload 는 `Omit`/`Partial` 로 **파생**.
2. 이 타입들이 앞으로 모든 함수 시그니처의 기준이 된다.

<!-- section: mechanism -->
## 순수 로직을 먼저

{{code: pure-core}}

- `addTask`, `toggle`, `byPriority` 등은 **입력 → 출력**, 외부를 안 건드린다 → 콘솔에서 여러 입력으로 바로 테스트.
- 실패는 예외 대신 `Result<T>` 로 반환 → 호출부가 `if (r.ok)` 로 안전하게 처리, 타입이 강제한다.
- 불변 업데이트(`[...tasks, x]`, `map`).

<!-- section: code | lang: ts -->
## IO 는 경계에서만

{{code: io-edge}}

- 파일 읽기, `JSON.parse`, 사용자 입력, `fetch` 는 **`unknown`** 으로 받아 `Array.isArray`·속성 검사·
  (또는 `zod` 같은 런타임 검증 라이브러리)로 좁힌 뒤 도메인 타입으로.
- `as Task[]` 단언은 **검증을 마친 뒤** 최소한으로.

<!-- section: must_know -->
## 반드시 기억할 것

- **타입 → 순수 로직 → IO** 순서. `any` 없이, `strict` 켜고.
- 생성/수정 payload 는 `Omit`/`Partial` 로 파생 (원본 타입 하나가 진실).
- 성공/실패는 `Result<T>` 판별 유니언 — 호출부가 분기를 빠뜨릴 수 없다.
- 외부 입력은 `unknown` → 좁히기/검증 → 도메인 타입.
- 순수 함수는 콘솔·유닛 테스트로 검증. IO 는 얇게 감싼다.

<!-- section: mission -->
## 미션 — 할 일 관리기

CLI(`node`)든 간단한 웹 화면이든 하나 골라 만든다. `strict: true`, `any` 금지.

- `Task` / `Priority` / `Result<T>` / `NewTask`(파생) 타입 정의.
- 순수 함수: `addTask`, `removeTask`, `toggle`, `editTitle`, `filterByDone`, `byPriority`(`Record<Priority, Task[]>`),
  `sortByDue`. 각각 콘솔에서 3케이스씩 테스트.
- 저장/불러오기: `saveTasks(tasks): string`(JSON), `loadTasks(raw: string): Result<Task[]>` — `unknown` → 검증.
- (선택) `zod` 로 `loadTasks` 의 항목 검증을 대체해 보라.
- README 에 "타입 → 로직 → IO 순서로 만들었다" 를 적고, 어떤 유틸리티 타입을 어디에 썼는지 정리.

<!-- section: check_question -->
## 이해 점검

1. 프로젝트를 만들 때 무엇부터 정의하나? 왜?
2. `Result<T>` 를 예외 대신 쓰면 호출부에서 무엇이 강제되나?
3. 파일에서 읽은 데이터를 바로 `Task[]` 로 단언하면 안 되는 이유는?
4. 순수 함수와 IO 함수를 나누면 테스트가 왜 쉬워지나?

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 타입→로직→IO 순서, payload 파생, Result 판별 유니언, unknown→좁히기, 순수/IO 분리를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**도메인 타입을 먼저 못 박고(생성/수정은 `Omit`/`Partial` 파생), 순수 로직을 `Result<T>` 로 쌓은 뒤,
IO 는 `unknown` → 검증 → 도메인 타입으로 경계에서만 — `strict` 켜고 `any` 없이.**

<!-- section: next -->
## 다음 Lesson

`typescript-in-practice/todo-app-with-typescript` — DOM 을 만지는 Todo.
