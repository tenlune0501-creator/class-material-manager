---
id: design-and-planning/ui-design-foundations/design-tokens-and-auto-layout
chapter: design-and-planning/ui-design-foundations
title: 디자인 토큰과 오토레이아웃 사고
mastery: understand
lesson_kind: lesson
estimated_minutes: 30
tags: [design, design-tokens, auto-layout, workflow]
related_material_ids:
  - 1Ra0bbcQUIcm78jr-OVxzgX3403WlgvyMobsK2ydfYc4   # STYLE (Figma style vs variable)
  - 11lB8Eju8IsBlxCsQha8gSiXRlbZnHeLcyXS3fX0t9g8   # Auto layout
  - 1_-yWsy2vF53CltSMvHKP7jqsqDzgIEPl1L6PSogEgNE   # variable - ex
  - 1DQUn2tGjVDo92LWlbb-LzBBnFkx6bZHsIiabR-_bkWk   # workflow (IA → wireframe → workflow)
prerequisites:
  - design-and-planning/ui-design-foundations/typography
  - design-and-planning/ui-design-foundations/contrast-and-color
code_examples:
  - slug: tokens-css
    title: 디자인 토큰 = 이름 붙인 값 (CSS 변수)
    source_type: generated_minimal
    language: css
    is_canonical: true
    code: |
      :root {
        /* primitive: 원시값 */
        --gray-900: #1f2328;  --gray-500: #6a737d;  --blue-600: #2563eb;
        --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px;
        --radius-sm: 6px; --radius-md: 10px;

        /* semantic: 역할 이름 (primitive 를 가리킴) */
        --text-primary: var(--gray-900);
        --text-muted: var(--gray-500);
        --accent: var(--blue-600);
        --surface: #ffffff;
      }
      .card { background: var(--surface); border-radius: var(--radius-md); padding: var(--space-4); }
      .card p { color: var(--text-primary); }
      /* 다크 모드: semantic 토큰만 바꾸면 전체가 따라온다 */
      @media (prefers-color-scheme: dark) {
        :root { --surface: #16181d; --text-primary: #e6e6e6; --text-muted: #9aa0a6; }
      }
  - slug: figma-style-var
    title: Figma — 스타일 vs 변수
    source_type: generated_minimal
    language: text
    code: |
      스타일(Style)  : 여러 속성을 한 번에 묶음 (텍스트 스타일 = 폰트+크기+행간+자간).
                       별칭 불가. "이 조합" 을 이름 붙여 재사용.
      변수(Variable) : 단일 값 (색 하나, 간격 하나). 별칭 가능(토큰이 토큰을 가리킴),
                       모드(라이트/다크) 지원. → CSS 변수 / 디자인 토큰과 1:1로 대응.
      다크 모드처럼 값이 대거 바뀌면 변수(모드)가 유리.
  - slug: auto-layout
    title: 오토레이아웃 = Flexbox 사고
    source_type: generated_minimal
    language: text
    code: |
      Figma Auto Layout            CSS Flexbox
      방향 가로/세로               flex-direction: row / column
      간격(gap)                    gap
      패딩                         padding
      Hug contents                 width: fit-content (내용에 맞게)
      Fixed                        고정 px
      Fill container               flex: 1 (남는 공간 채움)
      정렬(가운데/양끝)            justify-content / align-items
      # 디자인을 "박스 안에 박스" + "간격/패딩/정렬" 로 생각하면 그대로 CSS 로 옮겨진다.
  - slug: workflow
    title: 산출물 순서
    source_type: generated_minimal
    language: text
    code: |
      IA(정보구조) → 와이어프레임(구조/배치, 흑백) → 워크플로우(화면 간 이동)
        → 디자인 토큰/스타일 정의 → 컴포넌트(오토레이아웃) → 화면 조립 → 개발 핸드오프
      뒤로 갈수록 되돌리기 비용이 커진다 → 앞 단계를 대충 넘기지 않는다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **디자인 토큰**(이름 붙인 값)과 primitive → semantic 2단 구조를 이해한다.
- Figma의 **스타일 vs 변수** 차이와, 변수가 CSS 변수/토큰과 대응됨을 안다.
- **오토레이아웃**을 Flexbox 사고(방향·간격·패딩·정렬·Hug/Fixed/Fill)로 읽는다.
- 디자인 산출물의 순서(IA → 와이어프레임 → 워크플로우 → 토큰 → 컴포넌트)를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 타이포·색 기초, CSS `custom properties`(변수), Flexbox 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

색·간격을 화면마다 손으로 다른 값을 쓰면, "브랜드 색을 조금 바꾸자" 한마디에 수십 곳을 고쳐야 한다.
디자인을 픽셀 위치로만 잡아 두면 텍스트가 길어질 때 다 깨진다.

<!-- section: concept -->
## 1. 디자인 토큰

{{code: tokens-css}}

- **토큰 = 이름 붙인 값.** `#2563eb` 대신 `--accent`.
- 2단 구조: **primitive**(`--blue-600` 같은 원시값) → **semantic**(`--accent`, `--text-primary` 같은
  역할 이름). 컴포넌트는 semantic만 참조.
- 그래서 다크 모드·리브랜딩이 **semantic 토큰 몇 개 교체**로 끝난다.

<!-- section: concept | title: Figma -->
## 2. Figma — 스타일 vs 변수

{{code: figma-style-var}}

- **스타일**은 "속성 묶음"(텍스트 스타일 = 폰트+크기+행간). 별칭 불가.
- **변수**는 "단일 값" + 별칭 가능 + **모드(라이트/다크)**. → 코드의 디자인 토큰과 1:1.
- 값이 대거 바뀌는 다크 모드는 변수(모드 전환)로 구현한다.

<!-- section: mechanism -->
## 3. 오토레이아웃 = Flexbox

{{code: auto-layout}}

- Figma 오토레이아웃은 CSS Flexbox와 거의 같은 개념이다. 디자인을 **"박스 안 박스 + 간격/패딩/정렬"**
  로 만들면 개발자가 그대로 CSS로 옮긴다.
- **Hug**(내용에 맞게) / **Fixed**(고정) / **Fill**(남는 공간 채움) = `fit-content` / `px` / `flex:1`.
- 절대 좌표로 배치하지 않는다 → 텍스트 길이·화면 폭이 바뀌어도 안 깨진다. 반복 요소는 **컴포넌트**로.

<!-- section: concept | title: 순서 -->
## 4. 산출물 순서

{{code: workflow}}

앞 단계(IA·와이어프레임)를 대충 넘기고 색·아이콘부터 만지면, 구조가 틀어졌을 때 되돌리기 비용이 크다.

<!-- section: must_know -->
## 반드시 기억할 것

- 토큰 = 이름 붙인 값. **primitive → semantic** 2단. 컴포넌트는 semantic만 참조.
- 다크 모드·리브랜딩은 **semantic 토큰 교체**로 끝나게 설계.
- Figma **스타일**(속성 묶음) vs **변수**(단일 값·별칭·모드). 변수 ≈ CSS 변수/디자인 토큰.
- 오토레이아웃 = Flexbox 사고(방향·gap·padding·정렬·Hug/Fixed/Fill). 절대 좌표 배치 금지.
- 반복 요소는 컴포넌트로. 순서: IA → 와이어프레임 → 워크플로우 → 토큰 → 컴포넌트 → 조립.

<!-- section: experiment -->
## 직접 해 보기

1. 페이지의 하드코딩된 색·간격·radius를 `:root` 의 primitive + semantic 토큰으로 바꿔라.
2. semantic 토큰만 바꿔 다크 모드를 만들어 보라(`@media (prefers-color-scheme: dark)`).
3. Figma에서 텍스트 스타일 1개, 색 변수 3개를 만들고, 색 변수에 라이트/다크 모드를 추가해 전환해 보라.
4. 카드 컴포넌트를 오토레이아웃으로 만들고 제목 길이를 늘려도 안 깨지는지 확인하라.
5. 아무 화면을 골라 "박스 안 박스" 트리로 그려 보고, 각 박스의 방향/간격/정렬을 적어라.

<!-- section: check_question -->
## 이해 점검

1. primitive 토큰과 semantic 토큰의 차이와, 컴포넌트가 참조해야 하는 쪽은?
2. 다크 모드를 토큰으로 어떻게 구현하나?
3. Figma 스타일과 변수의 차이는?
4. 오토레이아웃의 Hug/Fixed/Fill은 각각 CSS의 무엇인가?
5. 디자인을 절대 좌표로 배치하면 뭐가 문제인가?

<!-- section: interview_question -->
## 면접 대비

- "디자인 토큰의 계층(primitive/semantic/component)을 설명해 주세요."
- "Figma 변수와 코드의 디자인 토큰을 어떻게 연결하나요?"
- "오토레이아웃과 Flexbox의 대응 관계는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 토큰=이름 붙인 값·primitive→semantic, 다크 모드=semantic 교체, Figma 스타일(묶음) vs 변수(단일·모드),
> 오토레이아웃=Flexbox(Hug/Fixed/Fill), 산출물 순서를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**디자인 토큰은 값에 이름을 붙여 primitive → semantic 2단으로 구성하면 다크 모드·리브랜딩이 토큰 교체로
끝나고, Figma 변수가 그 토큰에 대응한다 — 오토레이아웃은 Flexbox 사고(방향·간격·정렬·Hug/Fixed/Fill)로
만들어 절대 좌표 없이 그대로 코드로 옮긴다.**
