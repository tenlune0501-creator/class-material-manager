---
id: nextjs/board-crud/create-update-delete
chapter: nextjs/board-crud
title: 글 생성·수정·삭제
mastery: practical
lesson_kind: lesson
estimated_minutes: 70
tags: [nextjs, crud, mutation, form, practice]
related_material_ids:
  - 1r7c8dDwIztwquCzKBgu-04_0JGkU2TBMkjgLfHePYJk   # 12_글 생성하기
  - 1En630wIfLSwNpcOfJbd0Mp4FaWYDq_MkIjGm30zy39o   # 14_update delete 버튼 구현
  - 1W9XqBADjSVtpFuUMcQ8sDtXPF7a1yX3XBsONGsxFfgM   # 15_글 수정
  - 12XxhDowIcJiG109TECWyBg79FymQ6PLsO9AOTtH3ePc   # 16_글 삭제
prerequisites:
  - nextjs/board-crud/list-and-read
  - react/state-and-events/events-and-handlers
code_examples:
  - slug: create-form
    title: 생성 — 클라이언트 폼 + POST
    source_type: generated_minimal
    language: tsx
    is_canonical: true
    code: |
      // src/app/create/page.tsx
      "use client";
      import { useState } from "react";
      import { useRouter } from "next/navigation";

      export default function Create() {
        const router = useRouter();
        const [error, setError] = useState("");

        async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
          e.preventDefault();                              // 폼 기본 제출(새로고침) 차단
          const form = new FormData(e.currentTarget);
          const title = String(form.get("title") ?? "").trim();
          const message = String(form.get("message") ?? "").trim();
          if (!title) return setError("제목은 필수입니다");   // UX용 (서버도 검증함)

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, message }),
          });
          if (!res.ok) return setError("저장 실패");
          const created = await res.json();
          router.push(`/read/${created.id}`);              // 상세로 이동
          router.refresh();                                // 목록(layout) 갱신
        }

        return (
          <form onSubmit={onSubmit}>
            <input name="title" placeholder="title" />
            <textarea name="message" rows={3} />
            {error && <p role="alert">{error}</p>}
            <button type="submit">전송</button>
          </form>
        );
      }
  - slug: edit-form
    title: 수정 — 기존 값 채우고 PATCH
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/update/[id]/page.tsx
      "use client";
      import { useEffect, useState } from "react";
      import { useParams, useRouter } from "next/navigation";

      export default function Update() {
        const { id } = useParams<{ id: string }>();
        const router = useRouter();
        const [title, setTitle] = useState("");
        const [message, setMessage] = useState("");

        useEffect(() => {                                  // 폼에 기존 글 채우기
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`)
            .then((r) => r.json())
            .then((t) => { setTitle(t.title); setMessage(t.message); });
        }, [id]);

        async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
          e.preventDefault();
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, {
            method: "PATCH",                               // 부분 수정
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, message }),
          });
          router.push(`/read/${id}`);
          router.refresh();
        }

        return (
          <form onSubmit={onSubmit}>
            {/* value + onChange = 제어 컴포넌트 */}
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
            <button type="submit">전송</button>
          </form>
        );
      }
  - slug: delete-btn
    title: 삭제 — 확인 후 DELETE, 홈으로
    source_type: generated_minimal
    language: tsx
    code: |
      // src/app/Controls.tsx  (상세 페이지에서 사용하는 클라이언트 컴포넌트)
      "use client";
      import Link from "next/link";
      import { useParams, useRouter } from "next/navigation";

      export default function Controls() {
        const params = useParams<{ id?: string }>();
        const id = params?.id;                             // 상세 경로일 때만 존재
        const router = useRouter();

        async function onDelete() {
          if (!confirm("정말 삭제하시겠습니까?")) return;
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, { method: "DELETE" });
          router.push("/");
          router.refresh();
        }

        return (
          <div className="controls">
            <Link href="/create">Create</Link>
            {id && (
              <>
                <Link href={`/update/${id}`}>Update</Link>
                <button type="button" onClick={onDelete}>Delete</button>
              </>
            )}
          </div>
        );
      }
  - slug: server-validate
    title: 서버측 검증은 그대로 필수 (Route Handler)
    source_type: generated_minimal
    language: ts
    code: |
      // src/app/api/topics/[id]/route.ts
      export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
        const { id } = await params;
        const body = await req.json();
        const patch: Record<string, string> = {};
        if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 200);
        if (typeof body.message === "string") patch.message = body.message.slice(0, 5000);
        if (patch.title === "") return Response.json({ error: "title 비었음" }, { status: 400 });
        // ...저장... (허용된 필드만 반영 — 클라이언트가 보낸 다른 필드는 무시)
        return Response.json({ ok: true });
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 생성/수정/삭제를 **클라이언트 컴포넌트 폼 + fetch(POST/PATCH/DELETE)** 로 구현한다.
- `e.preventDefault()`, `FormData`, 제어 컴포넌트(`value`+`onChange`), `useRouter().push` + `refresh()` 를 조합한다.
- 수정 폼에 `useEffect` 로 **기존 값을 채우는** 흐름을 만든다.
- 삭제는 `confirm` 후 진행하고, `useParams` 로 상세 경로에서만 버튼을 노출한다.
- **클라이언트 검증은 UX, 진짜 검증은 서버** 라는 경계를 유지한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `nextjs/board-crud/list-and-read`, React 폼 이벤트·제어 컴포넌트, HTTP 메서드.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `e.preventDefault()` 를 빼먹어 폼이 제출되며 새로고침, fetch 가 중단된다.
- 저장은 됐는데 목록/상세에 안 보여서 수동 새로고침(→ `router.refresh()` 누락).
- 수정 폼이 빈 채로 떠서 사용자가 전체를 다시 입력한다.
- 삭제 버튼이 홈에서도 보이는데 `id` 가 없어 잘못된 요청을 보낸다.

<!-- section: concept -->
## 왜 이 부분만 클라이언트인가

- 목록·상세는 서버 컴포넌트였다. 하지만 **입력·클릭·상태**가 있는 폼은 브라우저에서 동작해야 하므로 `"use client"`.
- 서버 컴포넌트(페이지) 안에 이 클라이언트 폼/버튼 컴포넌트를 **심어서** 쓴다.
- 흐름: 폼 제출 → `fetch` 로 API 호출(POST/PATCH/DELETE) → 성공 시 `router.push`(이동) + `router.refresh()`(서버 데이터 갱신).

<!-- section: mechanism -->
## 생성

{{code: create-form}}

- `e.preventDefault()` → 브라우저 기본 제출 차단. `FormData(e.currentTarget)` 로 입력값 수집.
- `POST` + `Content-Type: application/json` + `JSON.stringify(body)`.
- 성공하면 새 글 상세로 `push`, 이어서 `refresh()` 로 `layout` 의 목록을 갱신.

## 수정

{{code: edit-form}}

- `useParams()` 로 `id`. `useEffect([id])` 에서 기존 글을 불러와 `setTitle`/`setMessage` → 폼이 채워진다.
- `value` + `onChange` = **제어 컴포넌트**(입력값을 state 가 소유). `value` 만 주고 `onChange` 를 빼면 입력이 안 된다.
- 저장은 **`PATCH`**(부분 수정). 전체 교체가 필요하면 `PUT`.

## 삭제

{{code: delete-btn}}

- 상세 화면에서 쓰는 `Controls`(클라이언트). `useParams` 의 `id` 가 있을 때만 Update/Delete 노출 → 홈/목록에선 Create 만.
- `confirm()` 으로 사용자 확인 후 `DELETE`. 성공하면 홈으로 `push` + `refresh()`.

### 서버측 검증은 그대로

{{code: server-validate}}

- 클라이언트의 `if (!title)` 는 **즉각 피드백용**이다. 요청은 위조될 수 있으므로 **Route Handler 에서 다시** 필수값·타입·길이·
  허용 필드를 검증한다(`list-and-read` 이전의 `json-as-backend` 원칙).
- `json-server` 를 그대로 쓰는 단계라면 이 검증 계층이 없다는 점을 인지하고, 실제 서비스에선 Route Handler(또는 백엔드)로
  감싸야 한다. 인증·권한(누가 이 글을 수정/삭제할 수 있는가)은 이 Lesson 범위 밖이며 인증 Lesson 에서 다룬다.

<!-- section: must_know -->
## 반드시 기억할 것

- 폼·버튼은 `"use client"`. 서버 컴포넌트 페이지 안에 심는다.
- 제출: `e.preventDefault()` → `fetch(method)` → `router.push()` + `router.refresh()`.
- 생성 `POST` / 부분 수정 `PATCH` / 전체 교체 `PUT` / 삭제 `DELETE`. body 는 `JSON.stringify` + `Content-Type: application/json`.
- 수정 폼은 `useEffect` 로 기존 값 로드 + `value`/`onChange` 제어 컴포넌트.
- 삭제는 `confirm()` 후, `useParams` 의 `id` 있을 때만 버튼 노출.
- **클라 검증 = UX, 서버 검증 = 필수.** 허용된 필드만 반영.

<!-- section: mission -->
## 미션 — 게시판 CUD 완성

`list-and-read` 의 목록/상세 위에 이어서.

- `app/create/page.tsx` : 제목 필수·200자, 본문 5000자. 성공 시 상세 이동 + 목록 갱신. 실패 메시지 표시.
- `app/update/[id]/page.tsx` : 기존 값 프리필, `PATCH`, 성공 시 상세로.
- `app/Controls.tsx` : 상세에서만 Update/Delete. Delete 는 `confirm` → `DELETE` → 홈.
- Route Handler(`app/api/topics/...`)로 감싸 **서버 검증** 추가(필수·길이·허용 필드). `json-server` 직접 호출을 이걸로 교체.
- 낙관적 업데이트 없이도 `router.refresh()` 로 목록이 갱신되는지 확인.
- (선택) 제출 중 버튼 `disabled` + "저장 중…" 표시.

<!-- section: check_question -->
## 이해 점검

1. 목록/상세는 서버 컴포넌트인데 폼은 왜 `"use client"` 인가?
2. `router.push()` 다음에 `router.refresh()` 를 부르는 이유는?
3. `value` 만 주고 `onChange` 를 빼면 무슨 일이 생기나?
4. 클라이언트에서 이미 검증했는데 서버에서 또 하는 이유와, "허용된 필드만 반영" 의 의미는?

<!-- section: interview_question -->
## 면접 대비

- "Next.js 에서 폼 제출 후 목록을 어떻게 최신화하나요? (`router.refresh` / `revalidatePath` 비교)"
- "제어 컴포넌트와 비제어 컴포넌트의 차이, 수정 폼에서 어느 쪽을 택했고 왜인가요?"
- "생성·수정·삭제 각각에 어떤 HTTP 메서드를 쓰나요?"

<!-- section: review -->
## 한 줄 정리

**생성/수정/삭제는 `"use client"` 폼에서 `e.preventDefault()` → `fetch(POST/PATCH/DELETE)` → `router.push` + `router.refresh()` 로 처리하고,
수정은 `useEffect` 로 기존 값을 채운 제어 컴포넌트 — 클라이언트 검증은 UX, 실제 검증은 서버 Route Handler 에서 허용 필드만.**

<!-- section: next -->
## 다음 Lesson

`env-and-deployment/build-and-deploy` — 빌드하고 배포하기.
