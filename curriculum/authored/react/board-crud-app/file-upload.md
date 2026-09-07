---
id: react/board-crud-app/file-upload
chapter: react/board-crud-app
title: 파일 첨부와 업로드·삭제
mastery: practical
lesson_kind: lesson
estimated_minutes: 55
tags: [react, file-upload, storage, practice]
related_material_ids:
  - 1AkBUevgwRooF_sqef8D80r2tGnx4Swm1LwWWzgAVWCk   # 10 이미지 파일 첨부 (FormData + multer)
  - 1xOMXJxTmpgkoVd8UDm9xWu_UP2HWI5SdpLxc8SjSLPU   # 12_파일 업로드
  - 104xxvLKOsWPr6n93ncFBxTlmPSBoampNCZC54UANcuA   # 13_파일 업로드 및 파일 삭제
  - 17bLGPEf8dAeyKc2hXPdsCuswVb-mBqb_              # est-shop_final_v202512.zip
prerequisites:
  - react/board-crud-app/create-update-delete
  - javascript/browser-apis-and-storage/local-storage
code_examples:
  - slug: file-input
    title: 파일 input — File 객체를 state에
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      const [form, setForm] = useState({ title: "", content: "", image: null });
      const [preview, setPreview] = useState(null);

      const onFileChange = (e) => {
        const file = e.target.files[0];       // FileList → 첫 파일
        if (!file) return;
        setForm((prev) => ({ ...prev, image: file }));      // 텍스트가 아니라 File 객체
        setPreview(URL.createObjectURL(file)); // 미리보기용 임시 URL
      };

      // <input type="file" accept="image/*" onChange={onFileChange} />
      // {preview && <img src={preview} alt="미리보기" />}
      // 정리: useEffect 언마운트에서 URL.revokeObjectURL(preview)
  - slug: formdata-post
    title: 전송 — JSON이 아니라 FormData (multipart/form-data)
    source_type: generated_minimal
    language: js
    code: |
      // ❌ JSON 으로는 파일(binary)을 못 보낸다
      // axios.post("/write", { title, content, image })  // image 가 사라진다

      // ✅ FormData: 텍스트 파트 + 파일 파트를 나눠 전송
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      if (form.image) fd.append("image", form.image); // File 을 파일 파트로

      await axios.post(`${API}/write`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // React 는 폼 기본 제출을 막고 JS로 처리하므로 FormData 를 직접 만들어야 한다
  - slug: server-multer
    title: 서버 — multer로 파일 받기 (학습용 최소)
    source_type: generated_minimal
    language: js
    code: |
      const multer = require("multer");
      const storage = multer.diskStorage({
        destination: "uploads/",
        filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
      });
      const upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },              // 5MB 제한
        fileFilter: (req, file, cb) =>
          cb(null, file.mimetype.startsWith("image/")),     // 이미지만
      });

      app.post("/write", upload.single("image"), (req, res) => {
        const { title, content } = req.body;               // 텍스트 파트
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // 파일 파트
        // DB 에는 파일이 아니라 "경로/URL"만 저장
      });
      app.use("/uploads", express.static("uploads"));       // 정적 파일로 제공
  - slug: delete-file
    title: 파일 삭제 — DB 레코드와 실제 파일 둘 다
    source_type: generated_minimal
    language: text
    code: |
      글 삭제 / 이미지 교체 시:
        1) DB 에서 이미지 경로를 읽는다
        2) 디스크(또는 스토리지)에서 실제 파일을 지운다  (fs.unlink / storage delete)
        3) DB 레코드(또는 image 컬럼)를 갱신한다
      하나라도 빠지면 → 고아 파일(참조 없는 파일) 또는 깨진 이미지(경로만 있고 파일 없음)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `<input type="file">` 에서 **File 객체**를 받아 state에 담고, 미리보기를 만든다.
- 파일은 JSON으로 못 보내는 이유와, **`FormData`(multipart/form-data)** 로 텍스트+파일을 함께 보내는 법을 안다.
- 서버(`multer`)가 파일을 받아 **디스크에 저장하고 DB에는 경로만** 저장하는 구조를 이해한다.
- 파일 삭제/교체 시 **DB 레코드와 실제 파일을 함께** 정리해야 함을 안다.
- 크기·확장자 제한 같은 **학습용 최소 방어**와 운영 수준(스토리지·CDN·바이러스 검사)의 경계를 구분한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 제어 폼 + 제출(앞 Lesson), `axios.post`.
- 서버는 Express(`multer` 미들웨어) — `data-and-backend/nodejs-server/middleware`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

게시글에 이미지를 붙이려는데, 지금까지처럼 `axios.post("/write", { title, content, image })` 로
보내면 **image가 사라진다**. `File` 은 텍스트가 아니라 바이너리이고, JSON은 바이너리를 담지 못한다.

<!-- section: concept -->
## 1. 파일 input → state

{{code: file-input}}

- `e.target.files` 는 `FileList`(유사 배열). 단일 첨부면 `[0]`.
- state에 넣는 건 문자열이 아니라 **`File` 객체 자체**.
- `URL.createObjectURL(file)` — 파일을 가리키는 임시 URL. `<img src>` 에 넣어 즉시 미리보기.
  다 쓰면 `URL.revokeObjectURL` 로 해제(메모리).

<!-- section: mechanism -->
## 2. 전송 — FormData

{{code: formdata-post}}

- 파일을 보내려면 요청이 `Content-Type: multipart/form-data` 여야 한다. 그걸 JS로 만든 게 `FormData`.
- `fd.append(key, value)` — 문자열은 텍스트 파트, `File` 은 파일 파트(파일명·MIME 포함).
- 전통 HTML은 `<form enctype="multipart/form-data">` 제출 시 브라우저가 자동으로 만들어 주지만,
  **React는 기본 제출을 막고 JS로 처리**하므로 직접 만들어야 한다.
- `FormData` 는 일반 객체가 아니라 스트림 — 직접 대입은 안 되고 `append()` / `get()` 만.

<!-- section: concept | title: 서버 -->
## 3. 서버 — multer, 그리고 "DB엔 경로만"

{{code: server-multer}}

- `multer` 가 `multipart/form-data` 를 파싱해 텍스트는 `req.body`, 파일은 `req.file` 로 준다.
- **파일 자체를 DB에 넣지 않는다.** 디스크(또는 클라우드 스토리지)에 저장하고, DB에는
  `/uploads/168...-photo.jpg` 같은 **경로/URL만** 저장한다.
- 저장한 폴더를 `express.static` 으로 열어야 브라우저가 `<img src="/uploads/...">` 로 볼 수 있다.
- **학습용 최소 방어**: `limits.fileSize`(용량), `fileFilter`(MIME). *운영*에서는 이걸로 부족하다 —
  확장자 위조·매직바이트 검사, 저장 파일명 무작위화, 별도 도메인/CDN, 접근 권한, 악성코드 검사,
  Firebase/S3 같은 **오브젝트 스토리지** 사용이 필요하다.

<!-- section: concept | title: 삭제 -->
## 4. 삭제·교체 — 두 곳을 함께

{{code: delete-file}}

DB 레코드만 지우면 **고아 파일**이 디스크에 쌓이고, 파일만 지우면 **깨진 이미지**가 뜬다.
글 삭제·이미지 교체 시 항상 둘을 같이 처리한다(트랜잭션처럼 생각).

<!-- section: must_know -->
## 반드시 기억할 것

- 파일은 JSON 불가 → **`FormData` + `multipart/form-data`**. React에서는 `FormData` 를 직접 만든다.
- state엔 **`File` 객체**를 담고, 미리보기는 `URL.createObjectURL` (쓰고 나면 `revokeObjectURL`).
- 서버는 `multer` 로 받고, **DB엔 파일이 아니라 경로/URL**만. 저장 폴더는 `express.static` 으로 노출.
- **삭제/교체는 DB + 실제 파일을 함께** 정리한다.
- 용량/타입 제한은 최소 방어일 뿐. 운영은 스토리지 서비스·권한·검사까지 — *학습용 경계*를 명시한다.
- 파일 첨부 없이 연습하려면 이미지 대신 `localStorage` 에 dataURL 을 저장하는 축소판도 가능(흐름 학습용).

<!-- section: experiment -->
## 직접 해 보기

1. `<input type="file" accept="image/*">` 로 이미지를 골라 `URL.createObjectURL` 로 미리보기를 띄워라.
2. 텍스트 + 이미지를 `FormData` 로 묶어 전송하고, 서버 콘솔에서 `req.body` 와 `req.file` 을 확인하라.
3. `Content-Type: multipart/form-data` 헤더를 빼면 서버에서 어떻게 보이는지 관찰하라.
4. `multer` 에 5MB 제한과 이미지 MIME 필터를 걸고, 큰 파일/텍스트 파일을 올려 거부되는지 확인하라.
5. 글을 삭제할 때 `fs.unlink` 로 실제 파일도 지우고, 안 지웠을 때 `uploads/` 에 파일이 남는 걸 비교하라.

<!-- section: check_question -->
## 이해 점검

1. `axios.post("/write", { image })` 로 파일이 안 가는 이유는?
2. `FormData` 를 React에서 "직접" 만들어야 하는 이유는? (전통 HTML 폼과 비교)
3. 왜 파일을 DB가 아니라 디스크/스토리지에 두고 경로만 저장하나?
4. 저장 폴더에 `express.static` 을 안 걸면 무슨 일이 생기나?
5. 글만 지우고 파일을 안 지우면? 반대면?

<!-- section: interview_question -->
## 면접 대비

- "이미지 업로드 파이프라인을 클라이언트→서버→저장소 순으로 설명해 주세요."
- "파일 업로드에서 보안상 최소한으로 챙겨야 하는 것들은? 운영 환경에서 추가로 필요한 것은?"
- "업로드된 파일과 DB 레코드의 정합성(고아 파일)을 어떻게 관리하나요?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> File을 state에 + createObjectURL 미리보기, FormData/multipart 전송, multer로 받고 DB엔 경로만 +
> express.static, 삭제는 DB+파일 함께, 최소 방어(용량/MIME) vs 운영을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**파일 첨부는 `File` 객체를 state에 담아 `FormData`(multipart)로 보내고, 서버(`multer`)는 디스크에
저장한 뒤 DB에는 경로만 남기며 `express.static` 으로 노출한다 — 삭제는 DB와 실제 파일을 함께 정리하고,
용량·타입 제한은 최소 방어일 뿐 운영은 스토리지·권한·검사가 더 필요하다.**
