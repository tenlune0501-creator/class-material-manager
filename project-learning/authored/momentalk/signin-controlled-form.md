---
id: momentalk/signin-controlled-form
project: momentalk
title: 로그인 폼 — 제어 컴포넌트, useState, 리다이렉트
unit_kind: component
feature_area: 인증
concepts: [로그인/인증, 제어 컴포넌트 폼, useState, 이벤트 처리, 리다이렉트, 에러 처리, useSearchParams]
related_lessons:
  - react/state-and-events/usestate-basics
  - react/state-and-events/events-and-handlers
  - nextjs/routing-and-layout/spa-navigation
  - react/data-fetching/fetching-in-react
---

<!-- section: role -->
## 이 코드가 하는 일

`src/app/sign-in/page.jsx` (55–118행) — 이메일 로그인 폼(`SignInForm`)의 **상태·핸들러** 부분.
제어 컴포넌트로 입력을 받고, 로그인 성공 시 원래 있던 페이지로 되돌려 보낸다. 전체 코드는 실전 예제
`momentalk-signin-controlled-form`.

<!-- section: code -->
## 핵심 코드 읽기

```jsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const searchParams = useSearchParams();
const returnUrl = searchParams.get("returnUrl") || "/";     // 로그인 후 돌아갈 자리

const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true); setError("");
  try {
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) { setError(toMessage(error)); return; }      // Supabase 오류 → 사용자 문구
    router.push(returnUrl);
  } catch {
    setError("잠시 후 다시 시도해 주세요");
  } finally {
    setLoading(false);
  }
};

<input value={email} onChange={e => setEmail(e.target.value)} />   // ← 제어 컴포넌트
```

<!-- section: flow -->
## 상태와 이벤트 흐름

- 입력값은 **React 상태가 원본**(`value` + `onChange`). DOM은 화면만.
- `handleSubmit`: `preventDefault` → 로딩 켜기 → try(로그인) → 성공 시 `router.push` / 실패 시 `setError` → finally 로딩 끄기.
- `useSearchParams` 로 `?returnUrl=...` 을 읽어 로그인 후 목적지를 정한다.

<!-- section: why -->
## 왜 이렇게 했나

- **제어 컴포넌트**: 검증·비활성화·초기화를 상태로 다루려면 입력값이 상태에 있어야 한다.
- `try/catch/finally`: 성공/실패 어느 쪽이든 로딩 표시를 반드시 끈다.
- Supabase의 원문 오류(`Invalid login credentials`)를 그대로 보여주지 않고 **사용자 문구** 로 바꾼다.
- `returnUrl`: "글 쓰려다 로그인 화면으로 튕긴" 사용자를 원래 자리로 돌려보낸다.

<!-- section: framework_role -->
## React / Next 가 대신하는 것

- React: `setEmail` 호출 → 리렌더 → `value` 반영. 입력과 상태 동기화를 개발자가 안 짜도 된다.
- Next `useSearchParams`: 현재 URL의 쿼리스트링을 훅으로 준다. `router.push` 로 SPA 이동(전체 새로고침 없음).

<!-- section: related_lesson -->
## 이어지는 Lesson

- `react/state-and-events/usestate-basics`, `.../events-and-handlers` — 제어 컴포넌트·이벤트
- `nextjs/routing-and-layout/spa-navigation` — `router.push`
- `react/data-fetching/fetching-in-react` — async 핸들러 + 로딩/에러 상태

<!-- section: caution -->
## 주의점

- `e.preventDefault()` 를 빠뜨리면 폼이 브라우저 기본 제출로 페이지를 새로고침한다.
- `returnUrl` 을 그대로 `router.push` 하면 오픈 리다이렉트가 될 수 있다 — 실제 서비스는 내부 경로만 허용해야 한다.

<!-- section: experiment -->
## 작은 실습

1. `email` 입력을 비제어(`defaultValue`)로 바꿔 보고 검증 로직에서 값을 못 읽는 상황을 만들어 보라.
2. `finally` 를 지우고 로그인 실패 시 버튼이 계속 로딩 상태로 남는지 확인하라.
3. `?returnUrl=/community/write` 로 접속해 로그인 후 그 자리로 가는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 제어 컴포넌트에서 "원본" 은 DOM인가 상태인가?
2. `try/catch/finally` 에서 `finally` 가 하는 일은?
3. `useSearchParams` 는 무엇을 돌려주나?

<!-- section: review -->
## 한 줄 정리

**로그인 폼은 입력을 제어 컴포넌트(`value`+`onChange`)로 상태에 묶고, `handleSubmit` 에서
preventDefault → try(로그인) → push(returnUrl) / catch(에러) → finally(로딩 해제) 흐름을 돈다.**
