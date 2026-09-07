---
id: react/firebase-integration/setup-and-firestore
chapter: react/firebase-integration
title: Firebase 설정과 Firestore 연동
mastery: practical
lesson_kind: lesson
estimated_minutes: 60
tags: [react, firebase, firestore, baas, setup]
related_material_ids:
  - 1bavjSi0xWx-Kgks4at7mCi4fJuyPoNaeJKqQJLcYy7o   # 01_firebase_시작_설정
  - 1-4o3Z2qGu6vB4aeqUdKuJS0itmC72w1LMZ-N1jJ2QK0   # 02_react firebase 연동
sources:
  - title: "Firebase — Add Firebase to your JavaScript project"
    url: https://firebase.google.com/docs/web/setup
    publisher: "Google"
    checked_at: 2026-09-07
    source_type: official_docs
  - title: "Cloud Firestore — Get started"
    url: https://firebase.google.com/docs/firestore/quickstart
    publisher: "Google"
    checked_at: 2026-09-07
    source_type: official_docs
prerequisites:
  - react/data-fetching/fetching-in-react
  - data-and-backend/data-modeling/relational-vs-nonrelational
code_examples:
  - slug: firebase-init
    title: firebase.js — 앱 초기화 + 서비스 export
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      import { initializeApp } from "firebase/app";
      import { getFirestore } from "firebase/firestore";
      import { getAuth } from "firebase/auth";

      // 콘솔 "앱 추가 > 웹" 에서 복사한 설정. 값은 .env 로 뺀다
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FB_API_KEY,
        authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FB_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
        appId: import.meta.env.VITE_FB_APP_ID,
      };

      export const app = initializeApp(firebaseConfig);
      export const db = getFirestore(app);   // Firestore
      export const auth = getAuth(app);      // Auth (다음 Lesson)
  - slug: env
    title: .env (Vite) — 그리고 .gitignore
    source_type: generated_minimal
    language: text
    code: |
      # .env  (Vite 는 VITE_ 접두사만 클라이언트에 노출)
      VITE_FB_API_KEY=xxxxx
      VITE_FB_AUTH_DOMAIN=my-app.firebaseapp.com
      VITE_FB_PROJECT_ID=my-app
      # ... 나머지

      # .gitignore 에 .env 추가

      # 주의: Firebase 웹 apiKey 는 "비밀번호"가 아니라 프로젝트 식별자다.
      #   빌드된 JS 에 어차피 들어간다. 실제 보안은 Firestore 보안 규칙 + 승인된 도메인.
      #   .env 로 빼는 건 실수 커밋/재사용 편의 목적이지, 키를 숨기는 게 아니다.
  - slug: nosql-shape
    title: 컬렉션 / 문서 (NoSQL) — RDB와의 대응
    source_type: generated_minimal
    language: text
    code: |
      Firestore                     관계형 DB
      컬렉션(collection)      ≈     테이블
      문서(document)         ≈     행(row)  — 단, 스키마 자유, 문서 id 는 문자열
      필드(field)            ≈     컬럼     — 문서마다 달라도 됨
      하위 컬렉션            ≈     (JOIN 대신) 중첩/참조

      posts (컬렉션)
        └─ 8fK2… (문서)  { title, content, writer, createdAt }
        └─ a91X… (문서)  { title, content, writer, createdAt, imageUrl }  ← 필드가 달라도 OK
  - slug: read-write
    title: 첫 읽기·쓰기
    source_type: generated_minimal
    language: js
    code: |
      import { db } from "./firebase";
      import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

      // 쓰기
      await addDoc(collection(db, "posts"), {
        title: "안녕", content: "첫 글", writer: "kim", createdAt: serverTimestamp(),
      });

      // 읽기 (한 번)
      const snap = await getDocs(collection(db, "posts"));
      snap.forEach((d) => console.log(d.id, d.data()));
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- Firebase 콘솔에서 프로젝트·웹 앱·Firestore를 만들고, **설정값을 `.env` 로** 뺀 `firebase.js` 를 작성한다.
- `initializeApp` → `getFirestore` / `getAuth` 로 서비스 인스턴스를 export 하는 구조를 이해한다.
- Firestore의 **컬렉션 / 문서 / 필드**(NoSQL)를 관계형 DB와 대응시켜 설명한다.
- `addDoc` / `getDocs` 로 첫 읽기·쓰기를 한다.
- Firebase 웹 `apiKey` 가 **비밀이 아니라는** 점과, 실제 보안이 어디서 오는지 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- React에서 외부 데이터 다루기(`react/data-fetching`).
- 관계형 vs 비관계형 개념(`data-and-backend/data-modeling/relational-vs-nonrelational`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

앱에 데이터를 저장하려면 보통 서버 + DB를 직접 만들어야 한다. 프로토타입·팀 프로젝트에서는
그 인프라가 부담이다. **Firebase(BaaS)** 는 인증·DB·스토리지·호스팅을 묶어 제공하고,
클라이언트 SDK가 직접 붙는다. 첫 단계는 **연결 설정**이다.

<!-- section: concept -->
## 1. 콘솔에서 만드는 것 (순서)

1. **프로젝트 생성** (`console.firebase.google.com`). 무료 요금제로 시작.
2. **Firestore Database 만들기** — 위치(seoul), **프로덕션 모드**(전부 거부에서 시작)로.
3. **앱 추가 > 웹(`</>`)** — 닉네임 입력 → `firebaseConfig` 객체를 받는다.
4. `npm install firebase`.

<!-- section: code | lang: js -->
## 2. firebase.js — 한곳에서 초기화

{{code: firebase-init}}

- `initializeApp(config)` 를 **딱 한 번**. 여기서 나온 `app` 으로 `getFirestore(app)`, `getAuth(app)`.
- 이 파일에서 `db` / `auth` 를 export 해 두면 앱 어디서든 `import { db } from "./firebase"`.

{{code: env}}

<!-- section: concept | title: NoSQL 구조 -->
## 3. 컬렉션 / 문서 / 필드

{{code: nosql-shape}}

- **문서마다 필드가 달라도 된다**(스키마 자유). 편하지만, 그래서 코드에서 `d.data().imageUrl` 이
  `undefined` 일 수 있음을 늘 염두에 둔다.
- 문서 id는 **문자열**(자동 생성 또는 지정). 관계형의 정수 PK와 다르다.
- JOIN이 없다 — 필요하면 데이터를 **중복 저장**(비정규화)하거나 여러 번 조회한다.

<!-- section: mechanism -->
## 4. 첫 읽기·쓰기

{{code: read-write}}

- `collection(db, "posts")` — 컬렉션 참조(없으면 첫 쓰기 때 생긴다).
- `addDoc` — 문서 추가, id 자동. `getDocs` — 한 번 읽기. (실시간 `onSnapshot` 은 다음 게시판 Lesson.)
- `serverTimestamp()` — 시각을 서버 기준으로.
- 프로덕션 모드라 처음엔 **읽기·쓰기가 거부**된다. 학습용으로 콘솔의 규칙에서 임시로
  `allow read, write: if true;` 로 열되, 이건 **누구나 전체 DB 접근 가능**이라는 뜻임을 알고 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- `initializeApp` 은 한 번. `firebase.js` 에서 `db`/`auth` 를 export 해 공유.
- 설정값은 `.env`(Vite는 `VITE_` 접두사) + `.gitignore`.
- **Firebase 웹 `apiKey` 는 비밀이 아니다** — 빌드 JS에 포함된다. 보안은 **Firestore 보안 규칙 + 승인된 도메인**.
- Firestore: 컬렉션≈테이블, 문서≈행(스키마 자유·id 문자열), JOIN 없음.
- 프로덕션 모드는 전부 거부에서 시작 — 필요한 규칙만 연다. `if true` 를 운영에 두지 않는다.
- `d.data()` 의 필드는 문서마다 있을 수도/없을 수도 → 방어적으로 읽는다.

<!-- section: experiment -->
## 직접 해 보기

1. Firebase 프로젝트 + Firestore + 웹 앱을 만들고 `firebase.js` 를 작성하라. `console.log(app)` 으로 연결 확인.
2. 설정값을 `.env` 로 옮기고 `.gitignore` 에 `.env` 를 추가한 뒤 앱을 재시작하라(Vite는 재시작 필요).
3. 콘솔에서 `posts` 컬렉션에 문서를 손으로 하나 만들고, `getDocs` 로 읽어 콘솔에 출력하라.
4. `addDoc` 으로 글을 하나 넣고 콘솔 Firestore 화면에서 확인하라.
5. 보안 규칙을 기본(거부) 상태로 두고 쓰기가 막히는 걸 본 뒤, 학습용으로 `if true` 로 열고 다시 시도하라. (열어 둔 위험을 메모.)

<!-- section: check_question -->
## 이해 점검

1. `initializeApp` 은 몇 번 부르나? 그 결과로 무엇을 얻나?
2. Firestore 컬렉션/문서/필드는 관계형 DB의 무엇에 대응하나? 다른 점 두 가지는?
3. Firebase 웹 `apiKey` 를 `.env` 로 빼는 진짜 이유는? (그게 "보안"이 아닌 이유는?)
4. 실제로 접근을 막는 건 어디에 있나?
5. NoSQL에서 "스키마 자유"가 코드 작성에 주는 부담은?

<!-- section: interview_question -->
## 면접 대비

- "BaaS를 도입할 때의 트레이드오프(개발 속도 vs 벤더 종속·쿼리 제약·비용)는?"
- "클라이언트에 노출되는 Firebase 설정에서 무엇이 민감하고 무엇이 아닌가요?"
- "Firestore에서 JOIN이 없는 상황을 어떻게 모델링하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 콘솔 순서(프로젝트/Firestore/웹앱), firebase.js에서 initializeApp 1회 + db/auth export,
> .env(VITE_)와 apiKey 비밀 아님, 컬렉션≈테이블·문서≈행, 보안은 규칙 파일을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Firebase 연동은 콘솔에서 프로젝트·Firestore·웹 앱을 만들고 `firebase.js` 에서 `initializeApp` 한 번 →
`db`/`auth` export 로 끝난다 — 설정값은 `.env` 로 빼되 `apiKey` 는 비밀이 아니며, 실제 접근 제어는
Firestore 보안 규칙이 담당한다.**
