---
id: react/rendering-logic/conditional-rendering
chapter: react/rendering-logic
title: 조건부 렌더링
mastery: required
lesson_kind: lesson
estimated_minutes: 35
tags: [react, conditional-rendering, jsx]
related_material_ids:
  - 1Gjszssjrh0IglY766h3Xv-ggywJ4iPwI6EtxuxtigMo   # 09_조건부 렌더링 (if, &&, ? :)
prerequisites:
  - react/state-and-events/usestate-basics
project_links:
  - unit: momentalk/chosung-quiz-state-machine
    note: "{step === '...' && <Child/>} 로 화면 단계를 전환하는 실제 예"
code_examples:
  - slug: patterns
    title: 세 가지 패턴
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function Greeting({ user }) {
        // 1) early return — 완전히 다른 화면
        if (!user) return <p>로그인이 필요합니다.</p>;

        return (
          <div>
            {/* 2) && — "조건이면 이것, 아니면 아무것도" */}
            {user.isAdmin && <button>관리자 메뉴</button>}

            {/* 3) 삼항 — A 또는 B */}
            {user.premium ? <Badge label="PRO" /> : <a href="/upgrade">업그레이드</a>}

            <p>안녕하세요, {user.name}님</p>
          </div>
        );
      }
  - slug: falsy-trap
    title: && 의 함정 — 0 이 화면에 찍힌다
    source_type: generated_minimal
    language: jsx
    code: |
      // ❌ count 가 0 이면 화면에 "0" 이 그대로 나온다 (0 은 falsy 지만 렌더됨)
      {count && <Badge>{count}</Badge>}

      // ✅ 명시적으로 boolean 화
      {count > 0 && <Badge>{count}</Badge>}
      {!!items.length && <List items={items} />}

      // null / undefined / false / "" 는 아무것도 안 그린다. 숫자 0 만 예외.
  - slug: step-machine
    title: state 하나로 화면 전환
    source_type: generated_minimal
    language: jsx
    code: |
      function Wizard() {
        const [step, setStep] = useState("intro");   // "intro" | "form" | "done"
        return (
          <>
            {step === "intro" && <Intro onNext={() => setStep("form")} />}
            {step === "form"  && <Form  onDone={() => setStep("done")} />}
            {step === "done"  && <Done />}
          </>
        );
      }
      // Momentalk 초성 퀴즈가 이 패턴 (setup / play / answer)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 조건에 따라 다른 UI 를 보여주는 3패턴(**early return**, **`&&`**, **삼항**)을 상황에 맞게 쓴다.
- **`&&` 의 함정**(왼쪽이 숫자 `0` 이면 화면에 `0` 이 찍힘)을 알고 피한다.
- `null` 을 반환하면 아무것도 안 그린다는 것을 안다.
- **state 하나로 여러 화면을 전환**하는 패턴을 만들 수 있다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `state-and-events/usestate-basics`, JS 의 `&&`/`||`/삼항, truthy/falsy.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `{cartCount && <Badge />}` 를 썼는데 장바구니가 비면 화면에 `0` 이 뜬다.
- `if` 를 JSX `{}` 안에 넣으려다 에러 (`{}` 는 표현식만).
- 로그인/비로그인, 로딩/완료 같은 화면 전환을 `display: none` CSS 로 억지로 처리.

<!-- section: concept -->
## 세 가지 패턴

{{code: patterns}}

| 패턴 | 언제 |
|---|---|
| **early return** (`if (...) return <A/>;`) | 조건에 따라 **완전히 다른 화면** (로딩, 에러, 비로그인) |
| **`&&`** (`{cond && <A/>}`) | "조건이면 보이고, 아니면 **아무것도**" (배지, 경고, 관리자 버튼) |
| **삼항** (`{cond ? <A/> : <B/>}`) | **A 또는 B** 둘 중 하나 |

`{}` 안에는 **표현식만** 되므로 `if` 문은 못 쓴다 → early return(함수 최상단) 또는 `&&`/삼항.

<!-- section: mechanism -->
## `&&` 의 함정

{{code: falsy-trap}}

`{왼쪽 && <JSX/>}` 에서 왼쪽이 falsy 면 그 **falsy 값 자체**가 렌더 위치에 놓인다.

- `false`, `null`, `undefined`, `""` → React 는 **아무것도 안 그린다**(다행).
- **숫자 `0`** → 화면에 `"0"` 이 **그대로 찍힌다**.

→ 조건이 숫자일 수 있으면 **`count > 0 && ...`** 처럼 명시적 boolean 으로.

<!-- section: code | lang: jsx -->
## state 로 화면 전환

{{code: step-machine}}

`step` 같은 state 하나(`"intro" | "form" | "done"`)로 `{step === "x" && <X/>}` 를 나열하면
여러 화면을 깔끔하게 전환한다. Momentalk 의 초성 퀴즈(`setup`/`play`/`answer`)가 정확히 이 패턴이다
(`momentalk/chosung-quiz-state-machine`).

<!-- section: must_know -->
## 반드시 기억할 것

- `{}` 안엔 표현식만 → `if` 는 early return, 나머지는 `&&` / 삼항.
- **`&&` + 숫자 조건은 `0` 이 화면에 찍힌다** → `length > 0 &&`, `!!count &&`.
- `return null` 하면 그 컴포넌트는 아무것도 안 그린다(조건부로 통째 숨길 때).
- 삼항을 **중첩하지 않는다**(2단만). 3갈래 이상이면 early return 여러 개 또는 `switch`/객체 매핑.
- 화면 전환은 CSS `display` 가 아니라 **조건부 렌더링**으로 — 안 보이는 컴포넌트는 아예 마운트 안 됨.

<!-- section: experiment -->
## 직접 해 보기

1. `user` 가 `null` 이면 "로그인 필요", 있으면 이름을 보여주는 컴포넌트를 early return 으로 짜라.
2. `{cart.length && <Cart />}` 를 빈 배열로 테스트해 `0` 이 찍히는 걸 보고 `cart.length > 0 &&` 로 고쳐라.
3. `status` state(`"loading" | "error" | "ok"`)로 3화면을 전환하는 컴포넌트를 만들어라.
4. 삼항을 3번 중첩한 코드를 짜 보고, early return 여러 개로 리팩터해 가독성을 비교하라.

<!-- section: check_question -->
## 이해 점검

1. `{}` 안에 `if` 를 못 쓰는 이유와 대안 2가지는?
2. `{count && <Badge/>}` 에서 `count === 0` 이면 화면에 무엇이 나오나? 왜?
3. `&&` 와 삼항은 각각 언제 쓰나?
4. 컴포넌트가 아무것도 안 그리게 하려면 무엇을 반환하나?

<!-- section: interview_question -->
## 면접 대비

- "조건부 렌더링 패턴들과 각각의 트레이드오프는?"
- "`&&` 조건부 렌더링에서 `0` 이 노출되는 버그를 설명해 주세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> early return / && / 삼항의 사용처, && 의 0 함정과 회피, return null, 삼항 중첩 금지, 화면 전환은
> 조건부 렌더링을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**완전히 다른 화면은 early return, "보이거나 말거나"는 `&&`, "A 또는 B"는 삼항 —
`&&` 왼쪽이 숫자 `0` 이면 화면에 찍히니 `> 0` 으로 명시하고, `null` 을 반환하면 아무것도 안 그린다.**

<!-- section: next -->
## 다음 Lesson

`rendering-logic/lists-and-keys` — 배열을 화면에 그리기.
