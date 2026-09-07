---
id: react/portfolio-project/pagination-and-deploy
chapter: react/portfolio-project
title: 페이지네이션과 배포
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [react, pagination, deploy, portfolio, practice]
related_material_ids:
  - 1j8lcOvnP0GZfOFV-uRzCa7Wwjq5qjfadhnGUPZF5rUQ   # 14 - 포트폴리오 페이지네이션
  - 1IeehQhjAszfx3WusWYochDLtZHGh6YQnrflz3s77axU   # 16 배포
  - 1hiK1TGrT9IEVLiTy5mBPs3c6e_3bSqOx              # portfolio_dist.zip
prerequisites:
  - javascript/ui-implementation-patterns/filtering-and-pagination
  - react/react-deployment/deploy-with-github-actions
code_examples:
  - slug: page-math
    title: 페이지 계산 — 핵심 4줄
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const PAGE_SIZE = 6;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.min(Math.max(1, current), totalPages); // 범위 밖 방어
      const start = (page - 1) * PAGE_SIZE;
      const pageItems = items.slice(start, start + PAGE_SIZE);  // 클라 슬라이스
      // 서버(Supabase)면: .range(start, start + PAGE_SIZE - 1)  + { count: "exact" }
  - slug: page-url
    title: 페이지 상태는 URL에 (?page=2)
    source_type: generated_minimal
    language: jsx
    code: |
      import { useSearchParams } from "react-router-dom";

      const [sp, setSp] = useSearchParams();
      const page = Number(sp.get("page") ?? 1);

      const goTo = (p) => setSp({ page: String(p) }); // 뒤로가기·새로고침·공유가 동작
      // <button disabled={page <= 1} onClick={() => goTo(page - 1)}>이전</button>
      // <button disabled={page >= totalPages} onClick={() => goTo(page + 1)}>다음</button>
  - slug: page-group
    title: 페이지 그룹 (1~5, 6~10 …)
    source_type: generated_minimal
    language: js
    code: |
      const GROUP = 5;
      const groupStart = Math.floor((page - 1) / GROUP) * GROUP + 1;
      const groupEnd = Math.min(groupStart + GROUP - 1, totalPages);
      const numbers = [];
      for (let n = groupStart; n <= groupEnd; n++) numbers.push(n);
      // « 이전그룹 [1][2][3][4][5] 다음그룹 »
  - slug: vite-deploy
    title: Vite 빌드 → 정적 배포
    source_type: generated_minimal
    language: text
    code: |
      npm run build          # dist/ 생성 (HTML/CSS/JS 정적 산출물)
      npm run preview        # 로컬에서 dist/ 를 서빙해 배포본 확인

      # GitHub Pages 서브패스(https://user.github.io/repo/) → vite.config.js
      export default defineConfig({ base: "/repo-name/", plugins: [react()] });
      # BrowserRouter 라면 basename={import.meta.env.BASE_URL} 도 맞춰 준다

      # SPA fallback: 정적 호스트가 모든 경로를 index.html 로 주도록 (없으면 /posts/1 새로고침 404)
      #   Netlify: _redirects 에  /*  /index.html  200
      #   GitHub Pages: 404.html 트릭 또는 HashRouter
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 페이지네이션의 핵심 계산(`totalPages` / `slice` 또는 `.range`)과 **범위 밖 방어**를 안다.
- 현재 페이지를 **URL(`?page=`)** 에 둬서 뒤로가기·새로고침·공유가 되게 한다.
- 페이지 번호가 많을 때 **페이지 그룹**(1~5, 6~10)을 만든다.
- Vite `build` → 정적 배포의 흐름과, **서브패스(`base`)** · **SPA fallback** 함정을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 바닐라 필터/페이지네이션(`javascript/ui-implementation-patterns/filtering-and-pagination`),
  `useSearchParams`, GitHub Actions 배포(앞 Lesson).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

프로젝트가 30개인데 한 화면에 다 뿌리면 스크롤이 길고 느리다. 페이지를 나눠야 한다.
그리고 만든 걸 남에게 보여주려면 **배포**해야 한다 — 이때 로컬에선 잘 되던 게 서브패스·새로고침에서 깨진다.

<!-- section: concept -->
## 1. 페이지 계산

{{code: page-math}}

- `Math.ceil(total / PAGE_SIZE)` = 전체 페이지 수. 최소 1(빈 목록 대비).
- 요청된 페이지가 범위를 벗어나면 **clamp**(`Math.min/Math.max`). 직접 `?page=999` 입력 방어.
- 데이터가 클라에 다 있으면 `slice`, 서버(Supabase)면 `.range(start, end)` + `{ count: "exact" }` 로
  현재 페이지 것만 가져온다(서버 페이지네이션이 원칙).

<!-- section: mechanism -->
## 2. 페이지 상태 = URL

{{code: page-url}}

- 페이지를 `useState` 로만 들면 새로고침·뒤로가기·링크 공유가 안 된다.
- `useSearchParams` 로 `?page=` 에 두면 그 전부가 공짜로 동작한다.
- 이전/다음 버튼은 `disabled={page <= 1}` / `disabled={page >= totalPages}`.

<!-- section: concept | title: 페이지 그룹 -->
## 3. 페이지 그룹

{{code: page-group}}

페이지가 40개면 `[1][2]…[40]` 을 다 그릴 수 없다. `GROUP` 단위로 잘라
`groupStart = Math.floor((page-1)/GROUP)*GROUP + 1` 부터 보여 주고 «/» 로 그룹 이동.

<!-- section: concept | title: 배포 -->
## 4. Vite 빌드 → 정적 배포

{{code: vite-deploy}}

- `npm run build` → `dist/`(정적 파일). `npm run preview` 로 배포본을 로컬에서 먼저 확인.
- **서브패스 배포**(`https://user.github.io/repo/`): `vite.config.js` 의 `base: "/repo/"` 를 맞추지 않으면
  JS/CSS/이미지가 도메인 루트로 요청돼 전부 404. 라우터의 `basename` 도 함께.
- **SPA fallback**: 정적 호스트는 `/posts/1` 이라는 파일이 없어서 새로고침 시 404를 낸다.
  호스트가 **모든 경로를 `index.html` 로** 주도록 설정한다(Netlify `_redirects`, Pages는 404.html 트릭 또는 `HashRouter`).
- 배포 자동화는 앞 Lesson(GitHub Actions) — push하면 build → deploy.

<!-- section: must_know -->
## 반드시 기억할 것

- `totalPages = Math.max(1, Math.ceil(total / size))`. 페이지는 항상 **1..totalPages 로 clamp**.
- 데이터가 크면 **서버 페이지네이션**(`.range`), 작으면 클라 `slice`.
- 현재 페이지는 **URL(`?page=`)** 에. `useSearchParams`.
- 페이지 번호가 많으면 **그룹**으로 나눈다.
- 서브패스 배포 → `vite base` + 라우터 `basename` 일치.
- SPA는 **fallback(모든 경로 → index.html)** 이 없으면 하위 경로 새로고침이 404.
- 빌드 후 반드시 `preview` 로 배포본을 확인하고 올린다.

<!-- section: experiment -->
## 미션 체크리스트

1. 프로젝트 목록에 `PAGE_SIZE=6` 페이지네이션을 붙이고 `?page=` 를 `useSearchParams` 로 읽어라.
2. `?page=0`, `?page=999` 로 접속해 clamp가 동작하는지 확인하라.
3. 이전/다음 버튼에 경계 `disabled` 를 걸어라.
4. 페이지 그룹(5개 단위) + «/» 이동을 구현하라.
5. `npm run build` → `npm run preview` 로 확인한 뒤 GitHub Pages(또는 Netlify)에 배포하라.
6. 배포본에서 `/detail/3` 을 새로고침해 404가 나면 `base`/`basename`/fallback을 점검해 고쳐라.

<!-- section: check_question -->
## 이해 점검

1. `?page=999` 로 들어왔을 때 앱이 깨지지 않게 하려면?
2. 페이지 상태를 `useState` 로만 두면 무엇이 안 되나?
3. 데이터 1만 건일 때 클라 `slice` 페이지네이션의 문제는?
4. 서브패스 배포에서 CSS/JS가 전부 404다. 어디를 봐야 하나?
5. `/posts/1` 을 새로고침하면 404다. SPA에서 왜 그렇고 어떻게 푸나?

<!-- section: interview_question -->
## 면접 대비

- "클라이언트 페이지네이션과 서버 페이지네이션의 트레이드오프는?"
- "페이지네이션 상태를 URL에 두면 얻는 이점은?"
- "SPA를 정적 호스팅에 배포할 때 라우팅이 깨지는 원인과 해결책은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> totalPages/clamp/slice·range, 페이지=URL(useSearchParams), 페이지 그룹,
> vite base + 라우터 basename, SPA fallback(모든 경로→index.html)을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**페이지네이션은 `Math.ceil(total/size)` 로 페이지 수를 구하고 페이지를 1..N으로 clamp 하며 현재 페이지를
URL(`?page=`)에 둔다 — 정적 배포에서는 `vite base`/라우터 `basename` 을 맞추고 SPA fallback을 설정하지 않으면
하위 경로 새로고침이 404난다.**
