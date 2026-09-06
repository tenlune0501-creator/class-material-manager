---
id: web-foundations/css-preprocessors-and-frameworks/tailwind
chapter: web-foundations/css-preprocessors-and-frameworks
title: Tailwind CSS 기초
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [css, tailwind, utility-first, framework]
related_material_ids:
  - 1wNYZU3qdkUnBLU8D0Vt7XN6cHms1Wp70GlkD8ZVrLQQ   # CSS framework tailwind
prerequisites:
  - web-foundations/css-layout-flexbox/flexbox-core
  - web-foundations/responsive-and-modern-css/responsive-layout
code_examples:
  - slug: idea
    title: 유틸리티 우선 — 클래스로 스타일을 조립
    source_type: generated_minimal
    language: html
    is_canonical: true
    code: |
      <!-- 커스텀 CSS 없이, 작은 목적 단위 클래스를 조합 -->
      <button class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
                     text-sm font-medium text-white hover:bg-indigo-500
                     focus-visible:outline-2 focus-visible:outline-indigo-600">
        저장
      </button>
      <!-- bg-indigo-600 = background-color: (테마의 indigo-600)  /  px-4 = padding-inline: 1rem -->
  - slug: setup
    title: 설치 (버전에 따라 다름)
    source_type: generated_minimal
    language: text
    code: |
      # 핵심: Tailwind 는 빌드 단계에서 "쓴 클래스만" 모아 CSS 를 생성한다 (Purge/JIT)
      #
      # v4 (현재): CSS 진입점에서  @import "tailwindcss";
      #            Vite 면 @tailwindcss/vite 플러그인. 설정은 CSS 안 @theme 로.
      # v3       : npx tailwindcss init → tailwind.config.js 의 content 에 파일 경로,
      #            CSS 에 @tailwind base; @tailwind components; @tailwind utilities;
      #            npx tailwindcss -i in.css -o out.css --watch
      #
      # 어느 버전이든: content(스캔 대상)에 안 잡힌 파일의 클래스는 결과 CSS 에 없다
  - slug: responsive-state
    title: 반응형 · 상태 · 다크모드 접두사
    source_type: generated_minimal
    language: html
    code: |
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">…</div>
      <!-- md: = @media (min-width: 48rem) 부터. 모바일 퍼스트: 접두사 없는 게 기본 -->

      <a class="text-gray-600 hover:text-black focus-visible:underline dark:text-gray-300">…</a>
      <!-- hover: focus: disabled: first: group-hover: 등 상태도 접두사로 -->

      <p class="text-[13px] top-[117px]">…</p>   <!-- 임의값: 대괄호. 남발하면 유틸리티 이점 반감 -->
  - slug: reuse
    title: 반복을 줄이기 — 컴포넌트로 추출
    source_type: generated_minimal
    language: html
    code: |
      <!-- ❌ 같은 20개 클래스를 카드마다 복붙 -->
      <!-- ✅ React/Vue 컴포넌트로 한 번 정의 -->
      function Card({ title, children }) {
        return (
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            {children}
          </article>
        );
      }
      <!-- 또는 clsx 로 조건부 클래스. @apply 는 최소한만 (유틸리티 철학과 상충) -->
  - slug: tradeoff
    title: 장단점
    source_type: generated_minimal
    language: text
    code: |
      +  파일 전환 없이 마크업에서 바로 스타일, 죽은 CSS 안 쌓임(쓴 것만 빌드)
      +  일관된 스페이싱·컬러 스케일, 반응형·상태가 클래스로 명시적
      -  클래스가 길어 마크업이 시끄럽다 → 컴포넌트 추출로 완화
      -  디자인 시스템을 팀이 합의해야(테마 커스터마이즈)
      -  빌드 파이프라인 필수 (순수 <link> 로는 못 씀, CDN 스크립트는 개발/프로토타입만)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **유틸리티 우선**(목적 단위 클래스 조합)이 커스텀 CSS 작성과 어떻게 다른지 설명한다.
- Tailwind 가 빌드 단계에서 **실제 사용한 클래스만** 모아 CSS 를 만든다는 것(그래서 `content`/스캔 대상이 중요)을 안다.
- 반응형(`md:`), 상태(`hover:`/`focus-visible:`), 다크모드(`dark:`), 임의값(`[13px]`) 접두사를 쓴다.
- 클래스 반복은 **컴포넌트 추출**로 줄인다(`@apply` 는 최소).
- 장단점과 "빌드 필수" 제약을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Flexbox/Grid, 반응형(미디어쿼리·모바일 퍼스트), (실습은) React 컴포넌트.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- CSS 파일이 계속 커지고, 안 쓰는 규칙이 남았는지 알 수 없다.
- 클래스 이름 짓기(BEM 등)에 시간을 쓴다.
- 스페이싱·색이 화면마다 제각각(4px, 5px, 6px…).
- Tailwind 클래스를 썼는데 스타일이 안 나온다(`content` 에 파일이 안 잡힘).

<!-- section: concept -->
## 유틸리티 우선

{{code: idea}}

- `.btn { ... }` 를 CSS 에 쓰는 대신, `flex`·`px-4`·`bg-indigo-600` 같은 **한 가지 목적의 작은 클래스**를 마크업에서 조합한다.
- 클래스 이름을 새로 짓지 않고, 값은 **테마 스케일**(간격 `0.5/1/2/4…`, 색 `50~950`)에서 고른다 → 자연히 일관됨.
- "죽은 CSS" 가 안 쌓인다: 빌드가 마크업을 스캔해 **쓴 클래스만** 최종 CSS 에 넣는다.

<!-- section: mechanism -->
## 설치와 접두사

{{code: setup}}

- 버전에 따라 셋업이 다르다: **v4** 는 CSS 에 `@import "tailwindcss";`(+ Vite 플러그인), 설정은 CSS `@theme`.
  **v3** 는 `tailwind.config.js` + `@tailwind` 지시어 + CLI `--watch`.
- 공통 원칙: **스캔 대상에 없는 파일의 클래스는 결과 CSS 에 없다**. 동적으로 문자열 조합한 클래스명(`` `text-${color}` ``)도 못 잡는다 → 완전한 클래스명을 쓰거나 safelist.
- 순수 `<link>` 만으로는 못 쓴다(빌드 필요). CDN 스크립트(`cdn.tailwindcss.com`)는 프로토타입·학습용.

{{code: responsive-state}}

- 반응형은 **모바일 퍼스트**: 접두사 없는 게 기본, `md:`/`lg:` 가 그 이상. 상태는 `hover:`/`focus-visible:`/`disabled:`/`group-hover:`.
- 다크모드는 `dark:`. 임의값은 `p-[13px]` 대괄호 — 편하지만 남용하면 일관성·목적이 흐려진다.

{{code: reuse}}

- 같은 클래스 뭉치를 반복하면 **컴포넌트로 추출**(React/Vue). 조건부는 `clsx`/`cn`.
- `@apply` 로 유틸리티를 CSS 로 묶을 수도 있으나, 유틸리티 철학과 상충하니 정말 반복되는 소수에만.

{{code: tradeoff}}

<!-- section: must_know -->
## 반드시 기억할 것

- 유틸리티 우선 = 목적 단위 클래스 조합. 이름 짓기 불필요, 값은 **테마 스케일**에서 → 일관성.
- 빌드가 마크업을 스캔해 **쓴 클래스만** CSS 로. `content`/스캔 대상 밖이면 스타일 없음. 동적 클래스명 조합 금지.
- 접두사: `md:`(반응형, 모바일 퍼스트) / `hover:`·`focus-visible:`(상태) / `dark:` / `[임의값]`.
- 클래스 반복은 **컴포넌트 추출**로. `@apply` 는 최소.
- 빌드 파이프라인 필수. CDN 스크립트는 학습·프로토타입만.

<!-- section: mission -->
## 미션 — Tailwind 로 랜딩 섹션

- 셋업: 프로젝트 버전에 맞게(v4 권장) Tailwind 설치, 스캔 대상 지정, 빌드 `--watch`(또는 Vite).
- 헤더(로고 + 반응형 네비: 모바일 햄버거 → `md:` 가로), 히어로(제목 `text-3xl md:text-5xl`, CTA 버튼 2개), 카드 그리드(`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
- 모든 인터랙티브 요소에 `hover:`/`focus-visible:` 상태, `dark:` 대응.
- 반복되는 카드/버튼을 컴포넌트로 추출. 조건부 클래스 한 곳에 `clsx` 적용.
- 일부러 스캔 대상 밖 파일에 클래스를 써서 "안 나오는" 현상 재현 후 고치기.
- 빌드된 CSS 파일 크기를 확인(쓴 유틸리티만 들어있는지).

<!-- section: check_question -->
## 이해 점검

1. Tailwind 클래스를 썼는데 스타일이 안 나온다. 가장 먼저 확인할 것은?
2. `md:grid-cols-3` 은 언제부터 적용되나? 접두사 없는 클래스는?
3. 같은 20개 클래스를 여러 곳에 쓸 때 권장 방법은? `@apply` 는?
4. `` className={`text-${color}-500`} `` 가 위험한 이유는?

<!-- section: interview_question -->
## 면접 대비

- "유틸리티 우선 CSS 의 장단점을 설명해 보세요."
- "Tailwind 의 빌드/purge 동작을 설명해 보세요."
- "Tailwind 와 CSS Module/Sass 중 언제 무엇을 고르나요?"

<!-- section: review -->
## 한 줄 정리

**Tailwind 는 목적 단위 유틸리티 클래스를 마크업에서 조합하고 빌드가 쓴 클래스만 CSS 로 뽑는 프레임워크로,
반응형·상태·다크모드는 `md:`/`hover:`/`dark:` 접두사로 쓰고 반복은 컴포넌트로 추출하며, 빌드 파이프라인이 필수다.**

<!-- section: next -->
## 다음 Chapter

`web-foundations` 완료 — `javascript` 의 남은 UI 구현 패턴/jQuery 로.
