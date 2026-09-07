---
id: class-material-manager/viewer-db-mapping
project: class-material-manager
title: 뷰어의 DB 매핑 — 파일과 테이블 사이
unit_kind: data_model
feature_area: 뷰어
concepts: [데이터 매핑, 소스 추상화, 스키마 대응, 점진적 이관]
related_lessons:
  - data-and-backend/data-modeling/relational-vs-nonrelational
  - data-and-backend/backend-integration/frontend-to-webserver-db
  - typescript/objects-interfaces-aliases/objects-interface-type-alias
---

<!-- section: role -->
## 이 코드가 하는 일

`viewer/lib/{db,db-map,data,projectExamples}.ts` — 뷰어가 데이터를 읽는 계층. **로컬 `data/` 파일이 1차
저장소** 이고, 일부 화면은 Supabase 테이블도 읽는다. 두 소스의 형태를 화면이 기대하는 타입으로 맞추는
**매핑 계층** 이다.

<!-- section: where -->
## 파일별 역할

- `viewer/lib/db.ts` — Supabase에서 구조화 데이터 읽기(`material_metadata` 등 4개 테이블). `.select()` 만, 쓰기 없음.
- `viewer/lib/db-map.ts` — DB 행(snake_case) → 뷰어 타입(camelCase) 변환 함수(`toMaterial`, `toComparison`…).
- `viewer/lib/data.ts` — **하이브리드 진입점**. 먼저 DB를 시도하고, 실패(환경변수 없음·네트워크·권한)하면
  로컬 `data/*.json` 파일로 **폴백**. "행 0건" 과 "읽지 못함" 을 구분한다.
- `viewer/lib/projectExamples.ts` — `project_examples` 테이블(없으면 `project-examples/*.json`).

<!-- section: code -->
## 핵심 패턴 (하이브리드 + 매핑)

```ts
// data.ts — DB 먼저, 실패하면 파일
export async function getComparisons() {
  try {
    return await fetchComparisonsFromDb();   // db.ts
  } catch {
    return await readComparisonsJsonFile();  // data/comparisons.json 폴백
  }
}

// db-map.ts — 행 모양을 타입에 맞춘다
export function toMaterial(row: MaterialRow): Material {
  return { docId: row.source_id, title: row.title, subject: row.subject ?? undefined, /* ... */ };
}
```

<!-- section: why -->
## 왜 이렇게 했나

- **점진적 이관**: 원본 본문(.md)·코드는 "DB에 저장하지 않는다" 는 프로젝트 원칙 → 메타데이터만 DB로,
  본문은 계속 파일에서. 두 소스를 매핑 계층이 이어 붙인다.
- **폴백**: 배포 clone엔 `data/` 대용량이 없을 수 있고, 로컬엔 Supabase 환경변수가 없을 수 있다 →
  어느 쪽이든 화면이 뜨게 한다.
- **매핑 함수** 로 DB 스키마(snake_case, nullable)와 화면 타입(camelCase, optional)을 분리한다.

<!-- section: framework_role -->
## 무엇을 직접 하고 무엇을 위임하나

Supabase JS 클라이언트가 인증·쿼리를, 매핑 함수가 형변환을 한다. 화면 컴포넌트는 "어디서 왔는지" 를
모르고 뷰어 타입만 쓴다 — 소스가 파일이든 DB든 바뀌어도 화면 코드는 그대로다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/data-modeling/relational-vs-nonrelational` — 파일 vs 테이블
- `data-and-backend/backend-integration/frontend-to-webserver-db` — 프론트가 데이터에 붙는 경로
- `typescript/objects-interfaces-aliases/objects-interface-type-alias` — 행 타입 ↔ 도메인 타입

<!-- section: caution -->
## 주의점

- `catch` 로 폴백하되, "행 0건" 은 폴백이 아니라 정상적으로 빈 배열을 돌려줘야 한다 — 둘을 섞으면 데이터가 사라진 것처럼 보인다.
- 매핑 함수를 건너뛰고 DB 행을 화면에 바로 넘기면 snake_case/null이 새어 나온다.
- **curriculum projection**(`learning_lessons` 등)은 이 계층에 아직 없다 — 새 매핑을 추가할 자리다.

<!-- section: experiment -->
## 작은 실습

1. Supabase 환경변수를 지우고 `/compare` 가 파일 폴백으로 뜨는지 확인하라.
2. `toMaterial` 이 `row.subject ?? undefined` 로 null을 undefined로 바꾸는 이유를 설명하라.
3. `data.ts` 에서 "읽지 못함" 과 "0건" 을 다르게 다루는 코드를 찾아라.

<!-- section: check_question -->
## 이해 점검

1. 왜 메타데이터는 DB, 본문은 파일로 나눴나?
2. 매핑 함수(`db-map.ts`)가 없으면 화면 코드에 무엇이 새어 나오나?
3. "행 0건" 과 "읽지 못함" 을 구분해야 하는 이유는?

<!-- section: review -->
## 한 줄 정리

**뷰어 데이터 계층은 "DB 먼저, 실패하면 로컬 파일" 하이브리드이며, `db-map.ts` 의 매핑 함수가 DB 행
모양을 화면 타입으로 통일해 화면 코드가 소스를 모르게 한다.**
