---
id: react/board-crud-app/board-with-firestore
chapter: react/board-crud-app
title: 외부 DB(Firestore)에 붙인 게시판
mastery: practical
lesson_kind: lesson
estimated_minutes: 80
tags: [react, firestore, crud, realtime, database, practice]
related_material_ids:
  - 10tvGjA_zcG_nB0TbtKX3Y2E2HrQ-rC-ZrSp4Qk1XQ18   # 07_form Database - 글 입력
  - 1OylAVlJs5dd-N8THl1Z2dtaBzHs-ntk8dOm_GUYx9zU   # 08_form Database - 글 조회
  - 1jaw2HQSehc14S_tBh2JMjhN-tqUXjx-H67YJV1vTheM   # 09_form Database - 실시간 업데이트
  - 1be3S2o6brQ_5_Riwe1l5CdQP7A2Ocz3NRAtPjJyFfXM   # 10_form Database - 삭제
  - 1ZnXC7D8AGkocyuI9ORQczsy_PCGj1RqggM9plKCq_JU   # 11_form Database - 수정
prerequisites:
  - react/board-crud-app/create-update-delete
  - react/firebase-integration/setup-and-firestore
code_examples:
  - slug: crud-ops
    title: Firestore CRUD — modular SDK v9+
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      import { db } from "./firebase"; // getFirestore(app)
      import {
        collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
        query, orderBy, serverTimestamp,
      } from "firebase/firestore";

      const postsRef = collection(db, "posts"); // "posts" 컬렉션

      // CREATE — 문서 id 는 Firestore 가 자동 생성
      await addDoc(postsRef, {
        title, content, writer,
        createdAt: serverTimestamp(),          // 서버 시각 (클라 시계 신뢰 안 함)
      });

      // READ (한 번) — 최신순
      const snap = await getDocs(query(postsRef, orderBy("createdAt", "desc")));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })); // id 는 따로 붙인다

      // UPDATE / DELETE — 문서 id 로 참조
      await updateDoc(doc(db, "posts", id), { title, content });
      await deleteDoc(doc(db, "posts", id));
  - slug: realtime
    title: 실시간 구독 — onSnapshot
    source_type: generated_minimal
    language: jsx
    code: |
      import { useEffect, useState } from "react";
      import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
      import { db } from "./firebase";

      function BoardList() {
        const [list, setList] = useState([]);

        useEffect(() => {
          const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
          // 데이터가 바뀔 때마다 콜백이 다시 불린다 (추가/수정/삭제 자동 반영)
          const unsubscribe = onSnapshot(q, (snap) => {
            setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          });
          return unsubscribe; // 언마운트 시 구독 해제 (필수 — 안 하면 누수)
        }, []);

        return <ul>{list.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
      }
      // onSnapshot 을 쓰면 "변경 후 재조회" 코드가 필요 없다 — DB가 밀어 준다
  - slug: rest-vs-firestore
    title: Express+MySQL 게시판 vs Firestore 게시판
    source_type: generated_minimal
    language: text
    code: |
      항목        | Express + MySQL           | Firestore (BaaS)
      서버 코드   | 내가 작성 (라우트/SQL)    | 없음 (SDK가 클라에서 DB 직접 접근)
      조회        | GET /list → SELECT        | getDocs / onSnapshot(실시간)
      id          | AUTO_INCREMENT 정수       | 문서 id 문자열 (d.id)
      스키마      | 테이블/컬럼 고정          | 문서마다 자유 (NoSQL)
      권한        | 서버 미들웨어에서 검사    | Firestore 보안 규칙(규칙 파일)
      갱신 반영   | 직접 재조회               | onSnapshot 이 자동
  - slug: security-rules
    title: 보안은 클라 코드가 아니라 규칙 파일에서
    source_type: generated_minimal
    language: text
    code: |
      // Firestore 보안 규칙 (Firebase 콘솔 / firestore.rules)
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /posts/{id} {
            allow read: if true;                       // 목록/상세는 공개
            allow create: if request.auth != null;     // 로그인한 사용자만 작성
            allow update, delete: if request.auth != null
              && request.auth.uid == resource.data.uid; // 내 글만 수정/삭제
          }
        }
      }
      // 클라이언트 코드에서 버튼을 숨기는 건 UX일 뿐, 실제 차단은 이 규칙이 한다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **BaaS(Firestore)** 를 쓰면 서버 코드 없이 클라이언트 SDK가 DB에 직접 붙는다는 구조를 이해한다.
- Firestore modular SDK로 게시판 **CRUD**(`addDoc` / `getDocs` / `updateDoc` / `deleteDoc`)를 구현한다.
- `onSnapshot` 으로 **실시간 목록**을 만들고, 구독 해제를 처리한다.
- Express+MySQL 게시판과 Firestore 게시판의 차이(id, 스키마, 권한, 갱신)를 비교한다.
- **보안이 클라이언트 코드가 아니라 보안 규칙 파일**에서 온다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 앞 Lesson의 CRUD 흐름(제어 폼·검증·목록 갱신).
- Firebase 프로젝트 생성과 `firebase.js` 초기화(`react/firebase-integration/setup-and-firestore`).
- 컬렉션/문서(NoSQL) 개념.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

앞의 게시판은 Express 서버 + MySQL을 **직접** 만들었다. 배포하려면 서버 호스팅·DB 운영·CORS·
인증까지 챙겨야 한다. 팀 프로젝트나 프로토타입에서는 부담이 크다.

**Firestore(BaaS)** 는 그 서버 자리를 대신한다 — 클라이언트가 SDK로 DB에 직접 읽고 쓰고,
실시간 구독·인증·보안 규칙을 Firebase가 제공한다.

<!-- section: concept -->
## 구조 비교

{{code: rest-vs-firestore}}

- 가장 큰 차이: **"내가 만든 서버"가 없다.** 대신 Firebase가 "규칙에 맞으면 통과시키는 관문"이 된다.
- id가 정수 AUTO_INCREMENT가 아니라 **문서 id 문자열**(`d.id`). 목록에서 `key`, 상세에서 `useParams` 로 그대로 쓴다.

<!-- section: code | lang: js -->
## CRUD

{{code: crud-ops}}

- `collection(db, "posts")` — 컬렉션 참조. `addDoc` 은 문서 id를 **자동 생성**.
- `getDocs(...)` → `snap.docs.map(d => ({ id: d.id, ...d.data() }))` — **`d.data()` 에는 id가 없으므로** 따로 붙인다.
- `serverTimestamp()` — 정렬·표시에 쓸 시각을 **서버 기준**으로. 클라이언트 시계는 틀릴 수 있다.
- 수정/삭제는 `doc(db, "posts", id)` 로 문서를 콕 집어서.

<!-- section: mechanism -->
## 실시간 목록 — onSnapshot

{{code: realtime}}

- `onSnapshot(query, callback)` — 그 쿼리 결과가 바뀔 때마다(누가 글을 추가/수정/삭제) 콜백이 다시 실행된다.
- 그래서 앞 Lesson의 "변경 후 재조회" 코드가 **필요 없다** — DB가 변경을 밀어 준다.
- `onSnapshot` 은 **구독 해제 함수**를 반환한다. `useEffect` 에서 `return unsubscribe` 로
  언마운트 시 정리하지 않으면 리스너가 쌓여 메모리·요청이 샌다.

<!-- section: concept | title: 보안 -->
## 보안 — 클라 코드가 아니라 규칙 파일

클라이언트 SDK가 DB에 **직접** 붙으므로, "로그인 안 했으면 버튼 숨김" 같은 클라 코드는
아무것도 막지 못한다(개발자도구에서 SDK를 직접 호출하면 끝). 실제 차단은 **Firestore 보안 규칙**이 한다.

{{code: security-rules}}

- 기본 "프로덕션 모드"는 **전부 거부**로 시작한다. 필요한 만큼만 `allow` 를 연다.
- *학습용 최소 구현* 단계에서 규칙을 `allow read, write: if true` 로 열어 두는 경우가 많은데,
  이건 **누구나 전체 DB를 읽고 쓸 수 있다**는 뜻이다. 최소한 `create` 는 `request.auth != null` 로 좁힌다.
- Firebase 웹 `apiKey` 는 **비밀이 아니다**(클라이언트 식별자). 보안은 이 규칙 + 승인된 도메인이 담당한다.
  그래도 `.env` + `.gitignore` 로 관리해 실수 커밋을 줄인다.

<!-- section: must_know -->
## 반드시 기억할 것

- BaaS = "내 서버" 없이 클라 SDK가 DB에 직접. 관문은 **보안 규칙**.
- `getDocs` 결과는 `d.data()` + **`id: d.id`** 를 직접 합쳐서 쓴다.
- 시각은 `serverTimestamp()`. 정렬은 `query(ref, orderBy("createdAt", "desc"))`.
- `onSnapshot` = 실시간. `useEffect` 에서 **반드시 `return unsubscribe`**.
- 보안은 클라 코드가 아니라 **규칙 파일**. `if true` 로 열어 둔 규칙은 운영에 절대 금지.
- Firebase `apiKey` 는 식별자이지 비밀번호가 아니다 — 그래도 `.env` 로 관리.

<!-- section: experiment -->
## 직접 해 보기

1. `posts` 컬렉션에 `addDoc` 으로 글을 넣고, Firebase 콘솔에서 문서가 생기는지 확인하라.
2. `getDocs` + `orderBy("createdAt","desc")` 로 목록을 만들고, `id: d.id` 를 안 붙이면 수정/삭제가 왜 안 되는지 확인하라.
3. `onSnapshot` 으로 바꾸고, 두 탭을 열어 한쪽에서 글을 쓰면 다른 쪽 목록이 즉시 바뀌는지 보라.
4. `useEffect` 의 `return unsubscribe` 를 지우고, 페이지를 여러 번 오가며 콘솔에 리스너가 쌓이는지 관찰한 뒤 되돌려라.
5. 보안 규칙을 `allow write: if false` 로 바꾸고 글쓰기가 막히는지 확인한 뒤, `request.auth != null` 로 조정하라.

<!-- section: check_question -->
## 이해 점검

1. Firestore 게시판에는 왜 "내가 만든 서버"가 없나? 그 자리를 대신하는 건?
2. `snap.docs.map(d => d.data())` 만 하면 나중에 뭐가 문제인가?
3. `onSnapshot` 을 쓰면 CRUD 코드에서 무엇이 사라지나?
4. `useEffect` 에서 `onSnapshot` 의 반환값을 return 안 하면?
5. "로그인 안 한 사람은 글을 못 쓴다"를 실제로 보장하는 건 어디에 있나?

<!-- section: interview_question -->
## 면접 대비

- "BaaS(Firebase/Supabase)를 쓸 때 보안 모델이 전통적인 3-tier와 어떻게 다른가요?"
- "Firestore 실시간 리스너의 생명주기를 React에서 어떻게 관리하나요?"
- "클라이언트에 노출되는 Firebase apiKey 가 '비밀이 아니다'라는 말의 의미와, 그럼에도 관리하는 이유는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> BaaS 구조(서버 없음 + 보안 규칙), addDoc/getDocs/updateDoc/deleteDoc + id:d.id, serverTimestamp,
> onSnapshot 실시간 + unsubscribe, 보안은 규칙 파일에서를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Firestore 게시판은 내 서버 없이 클라 SDK가 DB에 직접 CRUD 하고(`addDoc`/`getDocs`/`updateDoc`/`deleteDoc`,
목록은 `id:d.id` 를 합쳐 사용), `onSnapshot` 으로 실시간 반영하며 — 접근 제어는 클라 코드가 아니라 보안 규칙 파일이 한다.**
