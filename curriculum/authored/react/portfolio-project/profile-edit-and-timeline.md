---
id: react/portfolio-project/profile-edit-and-timeline
chapter: react/portfolio-project
title: 프로필 편집과 타임라인
mastery: practical
lesson_kind: lesson
estimated_minutes: 90
tags: [react, portfolio, profile, timeline, practice]
related_material_ids:
  - 1iObU3n2lHX823U9Om2tZqUiOzHbWE602t_wIdCtJnro   # 01 portfolio - 미션
  - 1LyfAMLdaVHcEcFLbvFBAKyJav0AXm_8UzzzB7oDpsaA   # 14. 프로필 편집 (Storage uploadBytes + updateProfile)
  - 18-i6VFtzV-14OLI8Yi7_KrF3PFsfej-j-dLsleoSgvE   # 15. 프로필 타임라인
  - 1PUjS-7voqhcPnI1v8bh7lzD-trTZhUuN              # portfolio_ex_v202606.zip
prerequisites:
  - react/firebase-integration/auth-email-and-social
  - react/board-crud-app/file-upload
code_examples:
  - slug: upload-and-updateprofile
    title: 이미지 업로드(Storage) → 프로필 사진 URL 반영(Auth)
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      import { auth, storage } from "../firebase";
      import { updateProfile } from "firebase/auth";
      import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

      // 화면엔 안 보이는 input + label 로 파일 선택
      // <input type="file" id="profile" className="hidden" accept="image/*" onChange={updateLogo} />
      // <label htmlFor="profile" className="btn">프로필 업데이트</label>

      const [photo, setPhoto] = useState(auth.currentUser?.photoURL ?? DEFAULT);

      const updateLogo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // 사용자별 고정 경로 → 새로 올리면 덮어쓴다
        const fileRef = ref(storage, `profile/${auth.currentUser.uid}`);
        await uploadBytes(fileRef, file);               // Storage 에 업로드
        const url = await getDownloadURL(fileRef);      // 공개 접근 URL
        await updateProfile(auth.currentUser, { photoURL: url }); // Auth 프로필에 반영
        setPhoto(url);                                  // 화면 즉시 갱신
      };
  - slug: display-name
    title: 표시 이름 변경
    source_type: generated_minimal
    language: js
    code: |
      await updateProfile(auth.currentUser, { displayName: name });
      // updateProfile 은 displayName / photoURL 만. email/password 는 별도 API
      // (updateEmail / updatePassword, 재인증 필요할 수 있음)
      // 새로고침 후에도 유지되려면 updateProfile 을 호출해야 한다 (로컬 state 만 바꾸면 사라짐)
  - slug: timeline
    title: 타임라인 — 사용자별 문서를 시간순으로
    source_type: generated_minimal
    language: js
    code: |
      import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp }
        from "firebase/firestore";

      // 쓰기: 누가(uid), 언제(serverTimestamp) 를 항상 같이
      await addDoc(collection(db, "timeline"), {
        uid: auth.currentUser.uid,
        text, createdAt: serverTimestamp(),
      });

      // 읽기: 내 항목만, 최신순, 실시간
      const q = query(
        collection(db, "timeline"),
        where("uid", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc"),
      );
      const unsub = onSnapshot(q, (snap) =>
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      );
      // where + orderBy 조합은 Firestore 복합 색인이 필요할 수 있다(콘솔이 링크로 안내)
  - slug: security
    title: 규칙 — 내 것만 읽고 쓴다
    source_type: generated_minimal
    language: text
    code: |
      // storage.rules
      match /profile/{uid} {
        allow read: if true;                       // 프로필 사진은 공개
        allow write: if request.auth.uid == uid;   // 내 경로에만 업로드
      }
      // firestore.rules  /timeline/{id}
      allow read: if resource.data.uid == request.auth.uid;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update, delete: if request.auth.uid == resource.data.uid;
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **Firebase Storage** 에 이미지를 올리고(`uploadBytes` → `getDownloadURL`), 그 URL을
  **Auth 프로필**(`updateProfile` 의 `photoURL`)에 반영한다.
- `displayName` 변경과, 새로고침 후에도 유지시키는 법을 안다.
- **타임라인**을 사용자별 문서(`uid` + `serverTimestamp`)로 저장하고 `where` + `orderBy` + `onSnapshot` 으로 읽는다.
- Storage/Firestore 보안 규칙으로 "내 것만" 접근을 강제한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- Firebase Auth 상태(`auth.currentUser`), 파일 input/`FormData` 개념, Firestore CRUD·`onSnapshot`.

<!-- section: dev_problem -->
## 미션 개요

포트폴리오 사이트의 **로그인한 사용자용 프로필 영역**을 만든다:

- 프로필 사진 업로드/변경
- 표시 이름 수정
- 개인 타임라인(짧은 글) 작성·표시

<!-- section: concept -->
## 1. 프로필 사진 — Storage + Auth 두 단계

{{code: upload-and-updateprofile}}

- **Storage**(파일 저장)와 **Auth 프로필**(그 파일의 URL)은 별개다. 두 단계로 처리한다:
  1. `uploadBytes(ref, file)` — 파일을 `profile/<uid>` 경로에 저장(사용자별 고정 경로 → 재업로드 시 덮어씀).
  2. `getDownloadURL(ref)` — 공개 접근 URL을 받아 `updateProfile({ photoURL: url })` 로 프로필에 반영.
- 파일 선택 UI는 `<input type="file" className="hidden">` + `<label htmlFor>` 조합(버튼처럼 보이게).

<!-- section: mechanism -->
## 2. displayName — updateProfile

{{code: display-name}}

- `updateProfile` 은 `displayName` / `photoURL` 만 다룬다(이메일·비밀번호는 `updateEmail`/`updatePassword`, 재인증 필요할 수 있음).
- **로컬 state만 바꾸면 새로고침 시 사라진다** — `updateProfile` 을 호출해야 서버(Auth)에 남는다.

<!-- section: concept | title: 타임라인 -->
## 3. 타임라인 — 사용자별 문서

{{code: timeline}}

- 문서마다 **`uid`(누가)** 와 **`createdAt: serverTimestamp()`(언제)** 를 항상 함께 저장.
- 읽기는 `where("uid", "==", myUid)` + `orderBy("createdAt", "desc")` + `onSnapshot`(실시간).
- `where` + `orderBy` 를 섞으면 Firestore가 **복합 색인**을 요구할 수 있다 — 콘솔이 에러 메시지에 생성 링크를 준다.

<!-- section: concept | title: 보안 -->
## 4. 보안 규칙 — "내 것만"

{{code: security}}

- Storage: `profile/{uid}` 는 `request.auth.uid == uid` 인 사람만 쓰기.
- Firestore: 타임라인 문서는 `resource.data.uid == request.auth.uid` 인 사람만 읽기/수정/삭제.
- 화면에서 남의 프로필을 못 열게 하는 건 UX일 뿐 — 규칙이 실제 차단.

<!-- section: must_know -->
## 반드시 기억할 것

- 사진 = **Storage 업로드(`uploadBytes`) → URL(`getDownloadURL`) → Auth(`updateProfile.photoURL`)** 2단계.
- 파일 경로를 `profile/<uid>` 로 고정하면 재업로드 시 자연히 덮어쓴다(옛 파일 정리 고민 감소).
- `displayName`/`photoURL` 변경은 **`updateProfile` 호출로 서버에 저장**. 로컬 state만 바꾸면 새로고침에 날아감.
- 사용자별 데이터는 문서에 **`uid` + `serverTimestamp`** 를 항상 넣는다.
- `where` + `orderBy` → 복합 색인 필요할 수 있음(콘솔 링크로 생성).
- 접근 제어는 **Storage/Firestore 규칙**에서 `request.auth.uid` 로.

<!-- section: experiment -->
## 미션 체크리스트

1. 숨긴 file input + label 로 프로필 사진 선택 UI를 만들고, 선택 즉시 미리보기를 갱신하라.
2. `uploadBytes` → `getDownloadURL` → `updateProfile({ photoURL })` 3단계를 구현하라. 새로고침 후에도 사진이 유지되는지 확인.
3. `updateProfile` 을 빼고 `setPhoto` 만 하면 새로고침 시 사라지는 걸 확인한 뒤 되돌려라.
4. `displayName` 편집 폼을 만들고 저장 후 헤더의 이름이 바뀌는지 확인하라.
5. `timeline` 컬렉션에 `uid`+`createdAt` 로 글을 저장하고, `where`+`orderBy`+`onSnapshot` 으로 내 글만 최신순으로 렌더하라. (색인 요청이 뜨면 콘솔 링크로 생성.)
6. Storage 규칙을 `request.auth.uid == uid` 로 좁히고, 로그아웃 상태에서 업로드가 막히는지 확인하라.

<!-- section: check_question -->
## 이해 점검

1. 프로필 사진 반영이 왜 두 단계(Storage + Auth)인가?
2. `updateProfile` 없이 `setPhoto` 만 하면 무슨 일이 생기나?
3. 타임라인 문서에 `uid` 를 안 넣으면 나중에 뭐가 안 되나?
4. `where` + `orderBy` 를 같이 썼더니 에러가 났다. 원인과 해결은?
5. "남의 타임라인을 못 본다"를 실제로 보장하는 건 어디에 있나?

<!-- section: interview_question -->
## 면접 대비

- "파일 스토리지와 사용자 프로필(메타데이터)을 분리해서 다루는 이유는?"
- "사용자별 데이터를 조회할 때 인덱스/보안 규칙을 어떻게 설계하나요?"
- "클라이언트에서 프로필을 수정할 때 낙관적 UI와 서버 반영을 어떻게 맞추나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 사진 2단계(uploadBytes→getDownloadURL→updateProfile), updateProfile 로 서버 저장,
> 타임라인은 uid+serverTimestamp, where+orderBy 복합색인, 규칙에서 request.auth.uid를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**프로필 편집은 이미지를 Storage에 올려 URL을 받고(`uploadBytes`→`getDownloadURL`) `updateProfile` 로
Auth에 반영하며, 타임라인은 `uid`+`serverTimestamp` 문서를 `where`+`orderBy`+`onSnapshot` 으로 읽는다 —
"내 것만" 접근은 Storage/Firestore 규칙의 `request.auth.uid` 가 강제한다.**
