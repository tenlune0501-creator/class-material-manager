---
id: react/missions/portfolio-next-project
chapter: react/missions
title: "미션 7 — Next.js 포트폴리오 프로젝트"
mastery: practical
lesson_kind: lesson
estimated_minutes: 240
tags: [react, nextjs, mission, portfolio, capstone, auth, crud]
related_material_ids:
  - 1Xl9WGO67SFyXSnNxNuAWeloqs23fkzViiaqHHHrhqOI
  - 1MTQQ8p3B1BwWCLQ4NZKa8YlJkGq7j_fX9BBYNq4XqMs
  - 1DaI47_4NGS2fxY0H-89oDfM6_sdh7Do7huV6Lg7Rtjs
  - 1-v08-i8vKVhNDs3K-ClUbk58pElbUyHsjkAZXlu3VwU
  - 12heIiuI1S-aDL5YNKnYY6_sjg99pSv9XqPGpLRd3PM4
  - 1F6bHHdq_xbi-GwCAmUs3pEpdkak72_u27mA7h77NHtM
  - 1zR1UbQStVGowt7j6TlEDdkfT9dqltiqwUD-em-Mbqr0
  - 1CHVG06EkNAQLGr6JHH7kOr3LU9ShgJ1WrsRToZ-yo9M
  - 1YmIbPNGYiGNZjv8nxNUfhEQWCe5y0lIq4JQmnTHvs04
  - 11yovWterP-P7ykquVIBWJFJ9QOxWQTYBlrsspDs1ODU
  - 1j2QUk1wUrx_MUmKl2NL7VvrYw2f5WugY29i07XSlhN4
  - 1WNWY1eoqHwpAVNdhnvTvPgVCFxoJMDnY57BdEMzNF38
  - 1vmABcUPCl1j2O4ScZgSTaERTnaxh3if20cP_jpbM_c8
  - 19Jx0c6_Z1ZGTR9GFK6fJVDX0ZpraOcjLyRFQoVlRMGA
  - 1cusGghzQ5ROMXbXEgouHJ3sG1DKqdit5
prerequisites:
  - nextjs/routing-and-layout/file-based-routing
  - nextjs/board-crud/create-update-delete
  - data-and-backend/baas-supabase-firebase/supabase-in-a-real-project
  - react/react-deployment/deploy-with-github-actions
code_examples:
  - slug: structure
    title: 페이지 구성 (App Router)
    source_type: generated_minimal
    language: text
    code: |
      app/
        page.js                 홈 (소개 + 대표 프로젝트)
        about/page.js           소개
        portfolio/page.js       프로젝트 목록 + 페이지네이션 (?page=2)
        detail/[id]/page.js     프로젝트 상세 + 이전/다음 글
        contact/page.js         연락처
        (admin)/write/page.js   글 작성  ← 로그인 필요
        (admin)/edit/[id]/page.js
      lib/supabase/…            createClient (서버/클라)
      lib/path.js               withBase() — 서브패스 배포용
  - slug: data-layer
    title: 데이터 — Supabase portfolio 테이블
    source_type: generated_minimal
    language: js
    code: |
      // 목록 + 페이지네이션 (서버 컴포넌트)
      const PAGE_SIZE = 6;
      const from = (page - 1) * PAGE_SIZE;
      const { data, count } = await supabase
        .from("portfolio")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);   // 페이지 슬라이스
      const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

      // 상세 + 이전/다음
      const { data: cur } = await supabase.from("portfolio").select().eq("id", id).single();
      const { data: prev } = await supabase.from("portfolio").select("id,title")
        .lt("id", id).order("id", { ascending: false }).limit(1).maybeSingle();
      const { data: next } = await supabase.from("portfolio").select("id,title")
        .gt("id", id).order("id", { ascending: true }).limit(1).maybeSingle();
  - slug: deploy-choice
    title: 배포 — 정적(Pages) vs 서버형(Vercel)
    source_type: generated_minimal
    language: text
    code: |
      GitHub Pages (output: "export")            Vercel
      정적 HTML만. SSR/Route Handler 불가         SSR/서버 컴포넌트/API 전부 OK
      [id] 동적 경로 → generateStaticParams 필수  동적 경로 그대로
      새 글은 재빌드해야 반영                     즉시 반영
      서브패스(/repo-name/) → basePath 처리 필요  루트 도메인
      → 프로젝트 수 고정·정적 성격이면 적합       → CRUD·인증이 있으면 이쪽
  - slug: static-params
    title: 정적 배포 시 — generateStaticParams
    source_type: generated_minimal
    language: js
    code: |
      // app/detail/[id]/page.js  — output:"export" 이면 필수
      export async function generateStaticParams() {
        const supabase = createClient();
        const { data } = await supabase.from("portfolio").select("id");
        return (data ?? []).map((row) => ({ id: String(row.id) }));
      }
      // next.config.mjs: { output: "export", images: { unoptimized: true } }
      // 서브패스 이미지: <Image src={withBase("/images/x.png")} />
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 지금까지의 Next.js·Supabase·인증·배포 조각을 **하나의 포트폴리오 사이트**로 합친다.
- App Router 파일 구조로 홈/소개/목록/상세/연락처 + 관리자(작성/수정)를 나눈다.
- Supabase `portfolio` 테이블로 **목록·페이지네이션·상세·이전/다음 글**을 구현한다.
- **정적(GitHub Pages) vs 서버형(Vercel)** 배포의 차이를 이해하고 적절히 고른다.
- 정적 배포 시 `generateStaticParams` 와 서브패스(`basePath`) 문제를 처리한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Next.js 파일 라우팅·레이아웃(`nextjs/routing-and-layout`), 게시판 CRUD(`nextjs/board-crud`),
  Supabase 실전(`data-and-backend/baas-supabase-firebase/supabase-in-a-real-project`),
  GitHub Actions 배포(`react/react-deployment/deploy-with-github-actions`).

<!-- section: dev_problem -->
## 미션 개요

배운 것을 조립해 **개인 포트폴리오 웹**을 만들고 배포한다. 요구 축:

1. **페이지 구성** — 홈/소개/프로젝트 목록/상세/연락처.
2. **데이터** — Supabase `portfolio` 테이블(제목·설명·이미지·날짜 등).
3. **목록** — 페이지네이션(`?page=`).
4. **상세** — 이전/다음 프로젝트 링크.
5. **관리자** — 로그인 후 글 작성/수정/삭제.
6. **배포** — GitHub Actions 또는 Vercel.

<!-- section: concept -->
## 1. 구조

{{code: structure}}

- 라우트 그룹 `(admin)` 으로 관리자 페이지를 묶고, 그 레이아웃에서 세션을 확인해 비로그인 시 리다이렉트.
- `lib/supabase/` 에 서버/클라이언트용 `createClient` 를 분리(SSR 쿠키 어댑터).

<!-- section: mechanism -->
## 2. 데이터 레이어

{{code: data-layer}}

- 목록은 `.range(from, to)` 로 페이지 슬라이스 + `{ count: "exact" }` 로 전체 개수 → `totalPages`.
- 상세의 이전/다음은 `id` 비교 + `maybeSingle()`(없을 수 있으니 `single()` 아님).
- 서버 컴포넌트에서 직접 `await` 하면 별도 로딩 상태 없이 SSR로 채워진다.

<!-- section: concept | title: 인증 -->
## 3. 관리자 인증

- Supabase Auth(이메일/비번). 관리자 계정은 콘솔에서 미리 생성(공개 회원가입 없음).
- 관리자 레이아웃(서버)에서 `supabase.auth.getUser()` → 없으면 `redirect("/login")`.
- **실제 보호는 RLS**: `portfolio` 에 `insert/update/delete` 는 인증된(또는 특정 uid) 사용자만.
  라우트 가드는 UX일 뿐.

<!-- section: concept | title: 배포 -->
## 4. 배포 — 정적 vs 서버형

{{code: deploy-choice}}

{{code: static-params}}

- **GitHub Pages**(`output: "export"`): SSR·Route Handler·Server Actions 불가. `[id]` 동적 경로는
  `generateStaticParams` 로 빌드 시 목록을 넘겨야 한다. 새 글은 **재빌드**해야 보인다.
  서브패스(`https://user.github.io/repo/`)라 `basePath` / `withBase()` 로 링크·이미지 경로를 보정.
- **Vercel**: 서버 기능을 그대로 쓴다. CRUD·인증·즉시 반영이 필요하면 이쪽이 맞다.
- 환경변수: Pages는 **GitHub Secrets** → workflow `env:`, Vercel은 **프로젝트 환경변수**.
  `NEXT_PUBLIC_` 접두사 값은 클라이언트 번들에 포함됨을 인지(공개 가능한 값만).

<!-- section: must_know -->
## 반드시 기억할 것

- 페이지는 App Router 파일 구조. 관리자 묶음은 라우트 그룹 `(admin)` + 레이아웃 세션 체크.
- 페이지네이션 = `.range()` + `{ count: "exact" }` → `Math.ceil(count / PAGE_SIZE)`.
- 이전/다음 글 = `id` 비교 + `maybeSingle()`.
- **정적 배포면 `[id]` 에 `generateStaticParams` 필수**, 새 글은 재빌드. 서브패스면 `basePath`.
- CRUD·인증이 핵심이면 정적 export 대신 **Vercel**(서버형)을 고른다.
- 접근 제어의 최종 책임은 **RLS**. 라우트 리다이렉트는 UX.
- 환경변수는 배포처별 위치가 다르다(Secrets vs Vercel env). `NEXT_PUBLIC_` 은 공개된다.

<!-- section: experiment -->
## 미션 체크리스트

1. `portfolio` 테이블을 만들고 더미 6~12건을 넣어라. RLS: 읽기 공개, 쓰기 인증 사용자.
2. `/portfolio` 목록에 6개씩 페이지네이션(`?page=`)을 붙여라. 마지막 페이지 처리 확인.
3. `/detail/[id]` 에 이전/다음 링크를 붙이고, 첫/마지막에서 disabled 처리하라.
4. 관리자 로그인 후에만 `/write` 에 접근되게 하고, RLS로도 이중으로 막아라.
5. 먼저 **Vercel**로 배포해 CRUD가 즉시 반영되는지 확인하라.
6. (도전) 같은 프로젝트를 `output: "export"` + `generateStaticParams` 로 GitHub Pages에 배포하고,
   새 글이 재빌드 전에는 안 보이는 것 / 서브패스 이미지 404를 직접 겪고 `withBase()` 로 고쳐라.

<!-- section: check_question -->
## 이해 점검

1. `output: "export"` 인데 `/detail/[id]` 가 빌드에서 실패했다. 무엇이 필요한가?
2. GitHub Pages 배포에서 새로 쓴 글이 안 보이는 이유는?
3. `https://user.github.io/repo/` 서브패스에서 `<img src="/images/x.png">` 가 404나는 이유와 해결은?
4. 관리자 페이지를 라우트 가드로만 막으면 안 되는 이유는?
5. Pages와 Vercel에서 환경변수를 각각 어디에 넣나?

<!-- section: interview_question -->
## 면접 대비

- "Next.js 앱을 정적으로 배포할 때의 제약과, 그럼에도 정적을 택하는 상황은?"
- "포트폴리오/블로그처럼 콘텐츠가 늘어나는 사이트에서 SSG/ISR/SSR을 어떻게 선택하나요?"
- "SSR 환경에서 Supabase 인증 세션을 어떻게 다루나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> App Router 구조 + (admin) 그룹, .range()+count 페이지네이션, id 비교 이전/다음,
> 정적(export)=generateStaticParams·재빌드·basePath vs Vercel(서버형), 보안은 RLS를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**미션 7은 Next.js + Supabase(목록·페이지네이션·상세·인증·CRUD)를 포트폴리오로 조립하고 배포한다 —
CRUD·인증이 핵심이면 Vercel(서버형), 정적 배포를 택하면 `[id]` 에 `generateStaticParams` 와
서브패스 `basePath` 처리가 필요하며 새 글은 재빌드해야 반영된다.**
