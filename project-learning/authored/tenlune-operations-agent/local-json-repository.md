---
id: tenlune-operations-agent/local-json-repository
project: tenlune-operations-agent
title: 로컬 JSON 리포지토리 — 파일 기반 상태
unit_kind: data_model
feature_area: 로컬 저장
concepts: [파일 기반 영속화, 자연키 중복 방지, 불변 반환(structuredClone), 리포지토리 인터페이스]
related_lessons:
  - nextjs/data-and-backend/json-as-backend
  - data-and-backend/data-modeling/relational-vs-nonrelational
  - typescript/objects-interfaces-aliases/objects-interface-type-alias
  - javascript/objects-and-builtins/working-with-objects
---

<!-- section: role -->
## 이 코드가 하는 일

`src/repositories/local-json-repository.ts` — 에이전트의 상태(발견한 기회, 리뷰, 지원 초안)를
`data/operations-state.json` 한 파일에 읽고 쓴다. `operations-repository.ts` 인터페이스를 구현한다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
export class LocalJsonRepository implements OperationsRepository {
  private state: OperationsState;

  constructor(private readonly filePath = "data/operations-state.json") {
    this.state = this.load();                     // 생성 시 파일에서 로드
  }

  getState(): OperationsState {
    return structuredClone(this.state);           // ← 불변 사본을 준다
  }

  listOpportunities(): Opportunity[] {
    return this.getState().opportunities;
  }
  // saveOpportunity: platform + externalId 자연키로 기존 항목을 찾아 갱신, 없으면 추가 → 중복 방지
}
```

```ts
// operations-repository.ts — 포트
export interface OperationsRepository {
  getState(): OperationsState;
  listOpportunities(): Opportunity[];
  listReviews(): Review[];
  listApplications(): ApplicationDraft[];
  saveOpportunity(opportunity: Opportunity): void;
  saveReview(review: Review): void;
  saveApplication(application: ApplicationDraft): void;
}
```

<!-- section: why -->
## 왜 이렇게 했나

- v1은 혼자 쓰는 CLI 도구다 → DB를 세팅할 이유가 없다. **JSON 파일 하나** 로 충분하고, 사람이 열어볼 수도 있다.
- `structuredClone` 으로 사본을 돌려주는 이유: 호출부가 반환값을 수정해도 내부 상태가 안 바뀐다(**불변 반환**).
- **자연키**(`platform + externalId`)로 중복을 막는다 — 같은 Wishket 프로젝트를 다시 스캔해도 새 항목이
  쌓이지 않고 갱신된다.
- 인터페이스(`OperationsRepository`)를 두면 나중에 Supabase 어댑터로 갈아 끼워도 CLI 코드는 그대로다
  (Marketing Agent의 포트-어댑터와 같은 발상).

<!-- section: framework_role -->
## 파일이 곧 데이터베이스

`fs.readFileSync` / `writeFileSync` + `JSON.parse` / `stringify`. ORM도, 마이그레이션도 없다.
"작은 도구는 파일이 DB" — CMM 뷰어가 `data/*.json` 을 소스로 쓰는 것과 같은 선택.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `nextjs/data-and-backend/json-as-backend` — 파일을 데이터 소스로
- `data-and-backend/data-modeling/relational-vs-nonrelational` — 파일 vs 테이블
- `typescript/objects-interfaces-aliases/objects-interface-type-alias` — 리포지토리 포트

<!-- section: caution -->
## 주의점

- 동시 쓰기(여러 프로세스가 같은 파일)는 안전하지 않다 — v1은 단일 사용자 전제.
- `structuredClone` 을 빼면 호출부가 리스트를 정렬·수정할 때 내부 상태가 오염된다.
- 안정적인 `externalId` 가 없으면 중복 방지가 흔들린다(README의 fingerprint 대체 규칙 참고).

<!-- section: experiment -->
## 작은 실습

1. 같은 기회를 두 번 `saveOpportunity` 하고 `listOpportunities().length` 가 1인지 확인하라.
2. `getState()` 결과 배열을 `.sort()` 한 뒤 다시 `getState()` 를 불러 원본이 그대로인지 보라(불변 반환 확인).
3. 이 클래스를 인메모리 버전으로 바꿔 같은 인터페이스를 구현해 보라.

<!-- section: check_question -->
## 이해 점검

1. `getState()` 가 `structuredClone` 을 쓰는 이유는?
2. `platform + externalId` 를 자연키로 쓰는 목적은?
3. 인터페이스(`OperationsRepository`)를 두면 나중에 무엇이 쉬워지나?

<!-- section: review -->
## 한 줄 정리

**`LocalJsonRepository` 는 상태를 JSON 파일 하나에 담고, `structuredClone` 으로 불변 사본을 돌려주며
`platform+externalId` 자연키로 중복을 막는다 — 작은 도구에는 "파일이 DB" 로 충분하다.**
