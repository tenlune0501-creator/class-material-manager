---
id: class-material-manager/postgrest-sync
project: class-material-manager
title: PostgREST 동기화와 파이프라인 격리
unit_kind: infra
feature_area: 데이터 파이프라인
concepts: [PostgREST, upsert, 청크 처리, 파이프라인 격리, 검증]
related_lessons:
  - data-and-backend/relational-database-operations/schema-and-migrations
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
  - data-and-backend/relational-database-operations/transactions
  - javascript/async-and-http/fetch-and-ajax
---

<!-- section: role -->
## 이 코드가 하는 일

`src/sync/postgrest-client.ts` — `@supabase/supabase-js` 를 새 의존성으로 넣지 않고 **`fetch` 만으로**
Supabase PostgREST에 upsert / select / RPC를 하는 얇은 클라이언트. `sync-runner.ts`(material 7개
테이블)와 `sync-curriculum`(11개 테이블)이 이 하나를 공유한다.

<!-- section: code -->
## 핵심 코드 읽기

```ts
export async function upsertRows<T extends object>(
  env, table, rows: T[], onConflict: string, chunkSize = 200,
): Promise<void> {
  if (rows.length === 0) return;
  for (const part of chunk(rows, chunkSize)) {                 // 요청 본문 크기 제한 회피
    const url = `${env.url}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: env.serviceRoleKey, Authorization: `Bearer ${env.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",   // ← upsert. DELETE 없음
      },
      body: JSON.stringify(part),
    });
    if (!res.ok) throw new Error(`upsert 실패 (${table}, HTTP ${res.status}): ${await res.text()}`);
  }
}

// selectRows: Range 헤더로 1000행씩 페이지네이션해 전부 읽는다 (검증 단계용)
```

<!-- section: why -->
## 왜 이렇게 했나

- **upsert 전용**(`merge-duplicates`): 재실행해도 기존 행·다른 시험 데이터를 지우지 않는다. DELETE는 없다
  (service_role에도 DELETE 권한을 주지 않았다).
- **청크**: 큰 배열을 한 번에 POST하면 본문 크기 제한에 걸린다 → 200행(본문 큰 테이블은 40행)씩.
- **fetch만**: upsert 하나 하려고 SDK 전체를 끌어오지 않는다(이 프로젝트의 일관된 방침).

<!-- section: framework_role -->
## PostgREST 가 대신하는 것

Postgres 테이블마다 REST 엔드포인트(`/rest/v1/<table>`)가 자동 생긴다. `on_conflict` + `Prefer`
헤더로 SQL `INSERT ... ON CONFLICT DO UPDATE` 를 HTTP로 표현한다. 서버 SQL을 쓰지 않는다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `.../relational-database-operations/schema-and-migrations` — 이 클라이언트가 쓰는 테이블의 스키마
- `.../relational-database-operations/transactions` — upsert의 원자성 경계
- `data-and-backend/baas-supabase-firebase/supabase-in-a-real-project` — PostgREST 실전

<!-- section: caution -->
## 주의점

- `sync-curriculum` / `sync-project-examples` 는 `refresh` / `ci-refresh` 파이프라인에 **포함되지 않는다**
  (격리). 자동 갱신이 curriculum 테이블을 건드리지 않는다.
- `service_role` 키는 CLI 런타임에서만 쓴다 — 뷰어에는 들어오지 않는다.
- 소스에서 행을 지우면 DB에 stale로 남는다 → 검증이 경고한다(자동 삭제 없음).

<!-- section: experiment -->
## 작은 실습

1. `chunkSize` 를 1로 낮춰 요청 수가 행 수만큼 늘어나는 것을 확인하라.
2. `Prefer` 헤더에서 `resolution=merge-duplicates` 를 빼면 같은 id 재삽입 시 무슨 에러가 나는지 예측하라.
3. `selectRows` 가 1000행 단위로 페이지네이션하는 코드를 찾아 종료 조건을 설명하라.

<!-- section: check_question -->
## 이해 점검

1. "upsert 전용, DELETE 없음" 을 택한 이유는?
2. 청크로 나눠 보내는 이유는?
3. `sync-curriculum` 이 `refresh` 파이프라인과 분리된 이유는?

<!-- section: review -->
## 한 줄 정리

**`postgrest-client.ts` 는 fetch만으로 PostgREST에 청크 단위 upsert(merge-duplicates, DELETE 없음)와
페이지네이션 select를 하는 얇은 클라이언트이며, material sync와 curriculum sync가 이 하나를 공유한다.**
