---
id: react/firebase-integration/auth-email-and-social
chapter: react/firebase-integration
title: Firebase Auth — 이메일·소셜 로그인·로그아웃
mastery: practical
lesson_kind: lesson
estimated_minutes: 70
tags: [react, firebase, auth, oauth, login, logout]
related_material_ids:
  - 1n7X2GMDnGnzKD4MKqSIG6cc-qFRxPKvDBupYQwgzPxY   # 03_Firebase Auth
  - 1_YT0-5KoVzW2_Xm1uDPzKYNrnO35VEpRhPsKCGD6z8I   # 04_Login form
  - 1WMmAYKcERJ0YfJR4Hxpp181m28O9-SuycckMF6XcwHE   # 05_Social Login
  - 1xVNkx0zawoduCMk0Qgs4pMgKKEyIlJFQ-hDxnC6qJoc   # 06_Log Out
sources:
  - title: "Firebase Authentication — Get started (Web)"
    url: https://firebase.google.com/docs/auth/web/start
    publisher: "Google"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Authenticate using Google with JavaScript"
    url: https://firebase.google.com/docs/auth/web/google-signin
    publisher: "Google"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - react/firebase-integration/setup-and-firestore
  - react/state-management/context-api
  - react/routing/react-router-dom
code_examples:
  - slug: email-auth
    title: 이메일/비밀번호 — 가입·로그인·로그아웃
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      import { auth } from "./firebase";
      import {
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
      } from "firebase/auth";

      // 콘솔 > Authentication > Sign-in method 에서 "이메일/비밀번호" 사용 설정 필요
      await createUserWithEmailAndPassword(auth, email, password); // 가입
      await signInWithEmailAndPassword(auth, email, password);     // 로그인
      await signOut(auth);                                          // 로그아웃

      // 에러는 code 로 분기: auth/email-already-in-use, auth/invalid-credential,
      //                     auth/weak-password, auth/too-many-requests ...
  - slug: auth-state
    title: 로그인 상태는 onAuthStateChanged 로 구독
    source_type: generated_minimal
    language: jsx
    code: |
      import { createContext, useContext, useEffect, useState } from "react";
      import { onAuthStateChanged } from "firebase/auth";
      import { auth } from "./firebase";

      const AuthContext = createContext(null);

      export function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        const [ready, setReady] = useState(false); // 첫 판정 전엔 화면 결정 보류

        useEffect(() => {
          // 새로고침해도 SDK가 세션을 복원해 여기로 알려 준다
          const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);        // 로그인 중이면 User 객체, 아니면 null
            setReady(true);
          });
          return unsub;        // 정리
        }, []);

        if (!ready) return <p>로딩…</p>;
        return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
      }
      export const useAuth = () => useContext(AuthContext);
  - slug: social
    title: 소셜 로그인 (Google) — 팝업
    source_type: generated_minimal
    language: js
    code: |
      import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
      import { auth } from "./firebase";

      const provider = new GoogleAuthProvider();
      // 콘솔 > Authentication > Sign-in method 에서 Google 사용 설정 + 승인된 도메인 등록
      const result = await signInWithPopup(auth, provider);
      // result.user 로 프로필(displayName, email, photoURL) 접근
      // 같은 이메일이면 이메일 계정과 자동 연결될 수도(계정 연결 정책) — 콘솔 설정 확인
  - slug: guard
    title: 보호 라우트 — 로그인 안 했으면 리다이렉트
    source_type: generated_minimal
    language: jsx
    code: |
      import { Navigate } from "react-router-dom";
      import { useAuth } from "./AuthProvider";

      function RequireAuth({ children }) {
        const user = useAuth();
        return user ? children : <Navigate to="/login" replace />;
      }
      // <Route path="/write" element={<RequireAuth><Write /></RequireAuth>} />
      // 이건 UX 가드일 뿐, 실제 데이터 보호는 Firestore 보안 규칙(request.auth) 에서.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 이메일/비밀번호로 **가입·로그인·로그아웃**을 구현하고, 에러 `code` 로 분기한다.
- 로그인 상태를 **`onAuthStateChanged`** 로 구독해 Context로 앱 전역에 공급한다(새로고침 후 세션 복원 포함).
- **소셜 로그인(Google 팝업)** 을 붙인다.
- **보호 라우트**로 비로그인 사용자를 리다이렉트한다.
- 클라이언트 라우트 가드와 **Firestore 보안 규칙**의 역할 차이를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `firebase.js` 의 `auth` export(앞 Lesson), Context API, `react-router` 의 `Navigate`/라우팅.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

게시판에 "내 글만 수정", "로그인해야 글쓰기" 를 넣으려면 사용자 인증이 필요하다.
직접 만들면 비밀번호 해시·세션·토큰·소셜 OAuth 왕복까지 구현해야 한다.
Firebase Auth가 이 전부를 SDK 호출 몇 개로 바꾼다.

<!-- section: concept -->
## 1. 이메일/비밀번호

먼저 **콘솔 > Authentication > Sign-in method** 에서 "이메일/비밀번호"를 켠다.

{{code: email-auth}}

- 세 함수 모두 `auth` 인스턴스를 첫 인자로. Promise를 반환하므로 `await` + `try/catch`.
- 실패는 `err.code` 로 판단한다(`auth/invalid-credential`, `auth/email-already-in-use`,
  `auth/weak-password`, `auth/too-many-requests` …). 사용자에게는 **일반화된 메시지**를 보여
  (계정 존재 여부를 노출하지 않는다).

<!-- section: mechanism -->
## 2. 로그인 상태 — onAuthStateChanged + Context

로그인 여부를 `useState(false)` 로 직접 들고 다니면, 새로고침하면 사라진다. Firebase SDK는
**세션을 로컬에 저장**하고, 상태가 정해질 때 `onAuthStateChanged` 콜백으로 알려 준다.

{{code: auth-state}}

- `AuthProvider` 로 앱을 감싸고 어디서든 `useAuth()` 로 현재 유저(`null` 또는 `User`)를 읽는다.
- **`ready` 플래그**가 중요하다 — 첫 판정 전에는 "로그인 안 됨"이 아니라 "아직 모름"이다.
  이걸 구분 안 하면 새로고침마다 로그인 화면이 깜빡인다.
- 반환된 `unsub` 를 `useEffect` 정리에서 호출.

<!-- section: concept | title: 소셜 -->
## 3. 소셜 로그인 (Google)

{{code: social}}

- 콘솔에서 Google 공급자를 켜고, **승인된 도메인**(localhost, 배포 도메인)을 등록한다.
- `signInWithPopup` — 팝업으로 구글 로그인 → 완료되면 `onAuthStateChanged` 가 알아서 발화한다.
- 팝업이 막히는 환경이면 `signInWithRedirect` 대안. (모바일 웹뷰 등에서 리다이렉트가 안전.)

<!-- section: concept | title: 보호 라우트 -->
## 4. 보호 라우트 + 보안의 실제 위치

{{code: guard}}

- `RequireAuth` 는 **UX 가드**다 — "로그인 화면으로 보내 준다"일 뿐.
- 실제 데이터 보호는 **Firestore 보안 규칙**에서 한다: `allow write: if request.auth != null`,
  `allow update, delete: if request.auth.uid == resource.data.uid`.
- 클라 코드에서 버튼을 숨기거나 라우트를 막아도, SDK를 직접 호출하면 우회된다. 규칙이 최종 방어선.

<!-- section: must_know -->
## 반드시 기억할 것

- 가입/로그인/로그아웃 = `createUserWithEmailAndPassword` / `signInWithEmailAndPassword` / `signOut`. 모두 `auth` 를 첫 인자로.
- 에러는 `err.code` 로 분기, 사용자에겐 계정 존재 여부를 흘리지 않는 **일반 메시지**.
- 로그인 상태는 **`onAuthStateChanged`** 로 구독 → Context로 공급. **`ready`(첫 판정 완료) 플래그**를 둔다.
- 소셜 로그인은 콘솔에서 공급자 켜기 + **승인된 도메인** 등록. `signInWithPopup` / `signInWithRedirect`.
- 보호 라우트는 UX용. **접근 제어의 최종 책임은 Firestore 보안 규칙**(`request.auth`).
- 비밀번호 정책·이메일 인증·비번 재설정은 Firebase가 제공(직접 구현하지 않는다).

<!-- section: experiment -->
## 직접 해 보기

1. 이메일/비밀번호 공급자를 켜고 가입 폼을 만들어라. `auth/weak-password`, `auth/email-already-in-use` 를 일부러 발생시켜 메시지를 분기하라.
2. `AuthProvider` + `onAuthStateChanged` 로 로그인 상태를 Context에 올리고, 헤더에 이메일/로그아웃 버튼을 조건부로 렌더하라.
3. `ready` 플래그를 제거하고 새로고침해 로그인 화면이 깜빡이는지 확인한 뒤 되돌려라.
4. Google 공급자를 켜고 `signInWithPopup` 으로 로그인해 `user.displayName` 을 표시하라.
5. `/write` 를 `RequireAuth` 로 감싸 비로그인 시 `/login` 으로 가는지 확인하라. 그다음 Firestore 규칙에도 `request.auth != null` 을 걸어 이중으로 막아라.

<!-- section: check_question -->
## 이해 점검

1. 로그인 상태를 `useState` 로만 관리하면 새로고침 시 무슨 일이 생기나? 대안은?
2. `onAuthStateChanged` 의 `ready` 플래그가 없으면 어떤 UX 문제가 생기나?
3. 로그인 실패 메시지를 "이메일이 없습니다" 처럼 구체적으로 쓰면 안 되는 이유는?
4. `signInWithPopup` 후에 상태 갱신 코드를 따로 안 써도 되는 이유는?
5. `RequireAuth` 만으로 데이터가 보호되지 않는 이유와, 진짜 방어선은?

<!-- section: interview_question -->
## 면접 대비

- "SPA에서 인증 상태를 어떻게 전역으로 관리하고, 새로고침 후 세션을 어떻게 복원하나요?"
- "클라이언트 라우트 가드와 서버(또는 보안 규칙) 권한 검사의 역할 분담은?"
- "OAuth 소셜 로그인에서 popup vs redirect 방식을 언제 선택하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 이메일 가입/로그인/로그아웃 3함수 + err.code 분기, onAuthStateChanged + Context + ready 플래그,
> signInWithPopup + 승인 도메인, RequireAuth는 UX·보안은 Firestore 규칙을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Firebase Auth는 `createUser`/`signIn`/`signOut` + 소셜 `signInWithPopup` 으로 인증을 처리하고,
로그인 상태는 `onAuthStateChanged` 를 Context에 실어 앱 전역에 공급한다(ready 플래그 필수) —
보호 라우트는 UX 가드일 뿐, 실제 접근 제어는 Firestore 보안 규칙의 `request.auth` 가 한다.**
