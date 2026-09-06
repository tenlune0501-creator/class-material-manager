---
id: javascript/ui-implementation-patterns/file-preview-and-drag-drop
chapter: javascript/ui-implementation-patterns
title: 파일 미리보기와 드래그&드롭
mastery: practical
lesson_kind: lesson
estimated_minutes: 50
tags: [javascript, file, drag-drop, preview, ui]
related_material_ids:
  - 1VEJLbuN5OQrHfq3EkQeuGdYDl711wDYf
  - 1rRAtQa5zw7U4v4DORf58-iQtrmDEy3iz
prerequisites:
  - javascript/dom-and-events/events-and-delegation
  - javascript/async-and-http/fetch-and-ajax
code_examples:
  - slug: input-preview
    title: "<input type=file> → 미리보기"
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const input = document.querySelector("#file");     // <input type="file" accept="image/*" multiple>
      input.addEventListener("change", () => addFiles(input.files));

      function addFiles(fileList) {
        for (const file of fileList) {
          if (!file.type.startsWith("image/")) continue;       // 타입 검증
          if (file.size > 5 * 1024 * 1024) { warn(`${file.name}: 5MB 초과`); continue; }
          const url = URL.createObjectURL(file);               // 메모리 내 임시 URL (업로드 아님)
          const img = document.createElement("img");
          img.src = url;
          img.onload = () => URL.revokeObjectURL(url);         // 쓰고 나면 해제 (메모리 누수 방지)
          thumbs.append(wrapThumb(img, file));
        }
      }
  - slug: drop-zone
    title: 드롭 영역 — 4개 이벤트 + preventDefault
    source_type: generated_minimal
    language: js
    code: |
      const zone = document.querySelector("#drop");

      ["dragenter", "dragover"].forEach((t) =>
        zone.addEventListener(t, (e) => {
          e.preventDefault();                 // 이게 없으면 브라우저가 파일을 그냥 열어버림
          zone.classList.add("drag-enter");
        }));
      ["dragleave", "drop"].forEach((t) =>
        zone.addEventListener(t, (e) => {
          e.preventDefault();
          zone.classList.remove("drag-enter");
        }));

      zone.addEventListener("drop", (e) => {
        addFiles(e.dataTransfer.files);        // 드롭된 파일도 FileList
      });
  - slug: manage
    title: 목록 관리 — 추가/삭제, 중복 방지
    source_type: generated_minimal
    language: js
    code: |
      const picked = new Map();                // key: name+size+lastModified

      function key(f) { return `${f.name}_${f.size}_${f.lastModified}`; }
      function addFiles(list) {
        for (const f of list) { if (!picked.has(key(f))) picked.set(key(f), f); }
        render();
      }
      thumbs.addEventListener("click", (e) => {           // 삭제도 위임
        const btn = e.target.closest(".remove");
        if (btn) { picked.delete(btn.dataset.key); render(); }
      });
  - slug: upload
    title: 업로드 — FormData + 진행률
    source_type: generated_minimal
    language: js
    code: |
      async function upload() {
        const fd = new FormData();
        for (const f of picked.values()) fd.append("files", f);
        // fetch 는 업로드 진행률 이벤트가 없다 → 진행률이 필요하면 XMLHttpRequest
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        // ⚠️ Content-Type 을 직접 지정하지 말 것 — 브라우저가 boundary 를 붙여야 함
        if (!res.ok) throw new Error("업로드 실패");
      }
      // 학습용 최소 구현: 실제로는 서버가 다시 타입·크기·확장자·매직넘버를 검증하고,
      // 저장 경로/파일명 정규화, 바이러스 검사, 접근 권한을 처리해야 한다 (백엔드 Lesson).
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `<input type="file">` 의 `files`(FileList)에서 `File` 을 읽고 `URL.createObjectURL` 로 미리보기한 뒤 **`revokeObjectURL` 로 해제**한다.
- 드래그&드롭 영역을 `dragenter`/`dragover`/`dragleave`/`drop` + **`preventDefault`** 로 구현한다(`dataTransfer.files`).
- 파일 목록을 `Map` 으로 관리(중복 방지), 삭제는 이벤트 위임.
- `FormData` 로 업로드하고, 진행률이 필요하면 `XMLHttpRequest` 를 쓴다.
- 클라이언트 검증은 UX 이고 **서버가 다시 검증**해야 함을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 이벤트·위임, `fetch`/`FormData`, DOM 생성.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 드롭 영역에 파일을 놓으면 브라우저가 그 파일을 새 탭에서 열어버린다(`preventDefault` 누락).
- `createObjectURL` 로 만든 URL 을 해제 안 해 이미지가 쌓일수록 메모리가 는다.
- 같은 파일을 두 번 고르면 썸네일이 중복된다.
- `FormData` 업로드에 `Content-Type: multipart/form-data` 를 손으로 넣어 boundary 가 빠져 서버가 파싱 못 한다.

<!-- section: concept -->
## input → 미리보기

{{code: input-preview}}

- `input.files` 는 **FileList**(유사 배열). `for...of` 로 `File` 순회. `File` 은 `name`/`size`/`type`/`lastModified`.
- **`URL.createObjectURL(file)`** — 파일을 가리키는 메모리 내 임시 URL(`blob:`). 업로드가 아니다.
- 다 쓰면 **`URL.revokeObjectURL(url)`** 로 해제(이미지 `onload` 후). 안 하면 누수.
- 텍스트/데이터가 필요하면 `FileReader` 나 `await file.text()` / `file.arrayBuffer()`.

<!-- section: mechanism -->
## 드래그&드롭

{{code: drop-zone}}

- 네 이벤트 모두 **`e.preventDefault()`** — 기본 동작(파일 열기)을 막아야 드롭이 앱으로 온다.
- `dragenter`/`dragover` 에서 강조 클래스, `dragleave`/`drop` 에서 해제.
- 드롭된 파일은 **`e.dataTransfer.files`** (역시 FileList) → 같은 `addFiles` 로.

{{code: manage}}

- 목록은 `Map`(key = 이름+크기+수정시각)으로 관리해 **중복 방지**. 삭제 버튼은 컨테이너에 위임 + `data-key`.

{{code: upload}}

- 업로드는 `FormData` 에 `append("files", file)` → `fetch(url, { method: "POST", body: fd })`.
- **`Content-Type` 을 직접 설정하지 말 것** — 브라우저가 `multipart/form-data; boundary=...` 를 자동으로 붙인다.
- `fetch` 는 업로드 **진행률 이벤트가 없다** → 진행률 바가 필요하면 `XMLHttpRequest` 의 `upload.onprogress`.
- 이 코드는 **학습용 최소 구현**이다. 실제로는 서버가 타입·크기·확장자·매직넘버를 재검증하고, 파일명 정규화·저장 경로·권한·바이러스 검사를
  처리한다. 클라이언트 검증은 즉시 피드백용일 뿐 신뢰 경계 밖이다(백엔드/파일 업로드 Lesson 범위).

<!-- section: must_know -->
## 반드시 기억할 것

- `input.files` / `e.dataTransfer.files` = FileList. `File` 로 `name/size/type` 검증.
- 미리보기 = `URL.createObjectURL` → 쓰고 나면 **`revokeObjectURL`**.
- 드롭존 = `dragenter/over/leave/drop` **전부 `preventDefault`**.
- 목록은 `Map` 으로 중복 방지, 삭제는 위임.
- 업로드는 `FormData` (+ `Content-Type` 손대지 않기). 진행률은 `XMLHttpRequest`.
- 클라 검증은 UX, **서버가 재검증** — 신뢰 경계.

<!-- section: mission -->
## 미션 — 이미지 업로더

drag&drop preview 자료를 재료로 (jQuery 없이 바닐라로).

- `<input type="file" multiple accept="image/*">` + 드롭존. 둘 다 `addFiles` 로.
- 이미지가 아닌 파일·5MB 초과·중복은 거부하고 사유를 표시(`aria-live`).
- 썸네일(파일명·크기 표시 + 삭제 버튼). `createObjectURL`/`revokeObjectURL` 짝 맞추기.
- 드롭존 드래그 상태 강조(`preventDefault` 확인).
- "업로드" → `FormData` 로 `POST`(모의 엔드포인트나 `httpbin`). 성공/실패 표시.
- (선택) `XMLHttpRequest` 로 진행률 바.
- 코드에 "학습용 최소 구현 — 서버 재검증 필요" 주석.

<!-- section: check_question -->
## 이해 점검

1. 드롭존에서 `preventDefault` 를 안 하면 무슨 일이 생기나?
2. `URL.createObjectURL` 로 만든 URL 을 해제해야 하는 이유는?
3. `FormData` 업로드에서 `Content-Type` 을 직접 넣으면 안 되는 이유는?
4. 클라이언트에서 파일 타입·크기를 검사했는데도 서버가 다시 검사해야 하는 이유는?

<!-- section: interview_question -->
## 면접 대비

- "파일 업로드의 진행률을 어떻게 표시하나요? `fetch` 로 되나요?"
- "드래그&드롭 API 의 이벤트 흐름을 설명해 보세요."
- "업로드 보안에서 클라이언트/서버 각각의 책임은?"

<!-- section: review -->
## 한 줄 정리

**`FileList` 의 `File` 을 검증하고 `createObjectURL`(→`revoke`)로 미리보기하며, 드롭존은 네 이벤트 모두 `preventDefault`,
목록은 `Map` 으로 중복 방지, 업로드는 `FormData`(Content-Type 손대지 않기) — 클라 검증은 UX, 서버가 재검증한다.**

<!-- section: next -->
## 다음 Lesson

`ui-implementation-patterns/banners-and-effects` — 배너·hover·커스텀 커서.
