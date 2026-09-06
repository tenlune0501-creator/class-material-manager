---
id: nextjs/data-and-backend/json-as-backend
chapter: nextjs/data-and-backend
title: JSON 데이터를 백엔드처럼 쓰기
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [nextjs, route-handler, json, api, server]
related_material_ids:
  - 1pVRYcYZM4XyofD3QoUm-NCuI0nfU4a-IXDig_vOW3lQ   # 09_Backend(json 데이터)
prerequisites:
  - nextjs/routing-and-layout/file-based-routing
  - react/data-fetching/fetching-in-react
project_links:
  - unit: momentalk/password-route-handler
    note: Route Handler에서 서버측 입력 검증과 신뢰 경계 처리
code_examples:
  - slug: json-server
    title: json-server — 가짜 백엔드 30초 만에
    source_type: generated_minimal
    language: bash
    is_canonical: true
    code: |
      # db.json
      # { "topics": [ { "id": "1", "title": "html", "message": "html is..." } ] }

      npx json-server --port 9999 --watch db.json
      #  GET    /topics        목록
      #  GET    /topics/1      단건
      #  POST   /topics        생성 (body JSON)
      #  PATCH  /topics/1      부분 수정
      #  DELETE /topics/1      삭제
      # 실제 DB·인증·검증이 전혀 없다. 학습·프로토타입용.
  - slug: route-handler
    title: Next.js 내장 방식 — Route Handler
    source_type: generated_minimal
    language: ts
    code: |
      // src/app/api/topics/route.ts   →  /api/topics
      import { NextResponse } from "next/server";

      let topics = [{ id: "1", title: "html", message: "html is..." }];  // 학습용: 메모리 저장

      export async function GET() {
        return NextResponse.json(topics);
      }

      export async function POST(req: Request) {
        const body = await req.json();
        // 서버가 다시 검증한다 — 클라이언트 검증은 신뢰 경계 밖
        const title = String(body.title ?? "").trim();
        const message = String(body.message ?? "").trim();
        if (!title) return NextResponse.json({ error: "title 필수" }, { status: 400 });

        const created = { id: crypto.randomUUID(), title, message };
        topics.push(created);
        return NextResponse.json(created, { status: 201 });
      }
  - slug: dynamic-route-handler
    title: 단건 조회·수정·삭제
    source_type: generated_minimal
    language: ts
    code: |
      // src/app/api/topics/[id]/route.ts   →  /api/topics/:id
      import { NextResponse } from "next/server";

      export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
        const { id } = await params;
        const found = topics.find((t) => t.id === id);
        if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
        return NextResponse.json(found);
      }

      export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
        const { id } = await params;
        topics = topics.filter((t) => t.id !== id);
        return NextResponse.json({ ok: true });
      }
  - slug: consume
    title: 서버 컴포넌트에서 직접 읽기
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/page.tsx  (서버 컴포넌트 — 브라우저를 거치지 않고 서버에서 fetch)
      export default async function Home() {
        const res = await fetch("http://localhost:9999/topics", { cache: "no-store" });
        const topics: { id: string; title: string }[] = await res.json();
        return <ul>{topics.map((t) => <li key={t.id}>{t.title}</li>)}</ul>;
      }
      // DB 접속정보·API 키가 필요한 요청은 여기(서버)에서. 브라우저 코드에 넣지 않는다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `json-server` 로 REST 흉내 백엔드를 즉석에서 띄우고 `GET/POST/PATCH/DELETE` 를 호출한다.
- 그게 왜 학습·프로토타입 전용인지(DB·인증·검증 없음) 설명한다.
- Next.js **내장 Route Handler**(`app/api/.../route.ts`)로 같은 API 를 만든다.
- **입력 검증은 서버에서 다시 한다**(클라이언트 검증은 신뢰 경계 밖)는 원칙을 코드로 지킨다.
- 서버 컴포넌트에서 데이터를 직접 `fetch` 하고, 비밀값이 필요한 호출을 서버에 둔다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- HTTP 메서드·상태코드, `fetch`, JSON. `nextjs/routing-and-layout/file-based-routing`.
- (비교) `react/data-fetching/fetching-in-react` 의 클라이언트 `fetch`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 프런트를 만들려는데 붙일 API 가 없어서 진도가 안 나간다.
- 클라이언트에서만 입력을 검사하고 서버는 그대로 저장 → 개발자도구로 요청을 조작하면 뚫린다.
- DB 접속정보나 API 키를 브라우저 코드(`"use client"`)에 넣어 노출된다.

<!-- section: concept -->
## 1) json-server — 빠른 가짜 백엔드

{{code: json-server}}

- `db.json` 의 최상위 키(`topics`)가 그대로 컬렉션 엔드포인트가 된다. 파일을 고치면 자동 반영.
- 프런트 3000, json-server 9999 처럼 **포트를 분리**한다.
- 한계: 실제 DB 아님(파일), **인증·권한·검증·트랜잭션 없음**. 화면 개발과 프로토타입까지만.

<!-- section: mechanism -->
## 2) Next.js Route Handler — 내장 API

{{code: route-handler}}

{{code: dynamic-route-handler}}

- `app/api/<경로>/route.ts` 에서 `GET`/`POST`/`PATCH`/`DELETE` **함수를 export** 하면 그게 `/api/<경로>` 엔드포인트다.
- 응답은 `NextResponse.json(data, { status })`. 요청 body 는 `await req.json()`.
- 동적 경로는 페이지와 똑같이 `[id]` 폴더 + `await params`.
- 여기 코드는 **서버에서만** 실행된다 → DB 클라이언트·시크릿을 여기 두는 게 안전하다.
- 위 예제는 **학습용 최소 구현**: 데이터를 메모리 배열에 담아 서버를 재시작하면 사라지고, 동시성·영속성·인증이 없다.
  실제로는 DB(다음 트랙) + 인증 미들웨어로 대체한다.

### 입력 검증 — 서버가 신뢰 경계

- 클라이언트의 `required` 나 JS 체크는 **UX 를 위한 것**이지 보안이 아니다. 요청은 얼마든지 위조된다.
- 그래서 `POST`/`PATCH` 핸들러에서 **body 를 다시 검증**한다: 필수값, 타입, 길이, 허용된 필드만.
- 검증 실패는 `400`(잘못된 입력) / 권한 문제는 `401`·`403` / 없는 리소스는 `404`.
- 규모가 커지면 `zod` 같은 스키마 검증 라이브러리로 이 부분을 정리한다. 인증·권한·CSRF 등
  본격적인 보호는 이 Lesson 범위 밖이며 백엔드/인증 Lesson 에서 다룬다.

### 3) 소비 — 서버 컴포넌트에서 직접

{{code: consume}}

- 서버 컴포넌트는 브라우저를 거치지 않고 **서버에서 바로 `fetch`** → 비밀값을 노출하지 않고, HTML 을 완성해 보낸다.
- 사용자 상호작용이 필요한 폼·버튼만 `"use client"` 로 떼어 `/api/...` 를 호출한다.

<!-- section: must_know -->
## 반드시 기억할 것

- `json-server` = `db.json` 하나로 REST 흉내. **학습·프로토타입 전용**(DB·인증·검증 없음).
- Next.js 내장 API = `app/api/.../route.ts` 에서 **HTTP 메서드 이름 함수 export**. `NextResponse.json`, `await req.json()`.
- Route Handler 코드는 **서버 전용** → DB 접속정보·API 키는 여기(또는 서버 컴포넌트)에.
- **입력 검증은 서버에서 다시.** 클라이언트 검증은 신뢰 경계 밖. 실패는 `400`, 권한은 `401/403`, 없음은 `404`.
- 서버 컴포넌트는 데이터를 직접 `fetch`. 폼·버튼만 클라이언트로.

<!-- section: mission -->
## 미션 — topics API + 목록/상세

- `app/api/topics/route.ts` : `GET`(목록), `POST`(생성 — `title` 필수, 200자 제한, 서버 검증, `201`).
- `app/api/topics/[id]/route.ts` : `GET`(없으면 404), `PATCH`(부분 수정), `DELETE`.
- 저장은 학습용으로 메모리 배열 또는 `db.json` 파일 읽기/쓰기 중 택1 — 코드에 "학습용 최소 구현" 주석.
- `app/page.tsx`(서버 컴포넌트)에서 `GET /api/topics` 를 직접 fetch 해 목록 렌더.
- 개발자도구로 `title` 없이 `POST` 를 날려 `400` 이 오는지 확인하고, 그 이유를 한 줄로 정리.

<!-- section: check_question -->
## 이해 점검

1. `json-server` 를 실서비스에 못 쓰는 이유 두 가지는?
2. `/api/topics` 엔드포인트를 만들려면 어떤 파일에 무엇을 export 하나?
3. 클라이언트에서 이미 검사했는데 서버에서 또 검증하는 이유는?
4. API 키가 필요한 외부 호출은 어디에 두어야 하나? 왜?

<!-- section: interview_question -->
## 면접 대비

- "클라이언트 검증만으로 충분하지 않은 이유를 설명해 보세요."
- "Next.js Route Handler 와 별도 백엔드 서버(Express 등)를 어떻게 구분해 쓰나요?"

<!-- section: review -->
## 한 줄 정리

**`json-server` 는 `db.json` 으로 빠르게 띄우는 학습용 가짜 백엔드, 내장 방식은 `app/api/.../route.ts` 에
메서드 함수를 export 하는 Route Handler 다 — 서버 전용이라 시크릿을 여기 두고, 입력 검증은 신뢰 경계인 서버에서 다시 한다.**

<!-- section: next -->
## 다음 Lesson

`data-and-backend/caching` — fetch 캐시와 재검증.
