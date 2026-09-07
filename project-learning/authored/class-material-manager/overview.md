---
id: class-material-manager/overview
project: class-material-manager
title: 프로젝트 개요 — 파이프라인과 뷰어
unit_kind: overview
feature_area: 전체
concepts: [모노 저장소 구조, CLI 파이프라인, 증분 처리, 읽기 전용 뷰어]
related_lessons:
  - data-and-backend/nodejs-server/config-and-structure
  - tooling-and-collaboration/editor-setup/npm-basics
  - typescript/setup-and-basic-types/intro-and-setup
---

<!-- section: role -->
## 이 프로젝트가 뭔가

**Class Material Manager(CMM)** = 이 저장소 자체다. 강사 Google Docs 수업자료를 **수집·분류·보충** 하는
TypeScript/Node CLI 데이터 파이프라인(`src/`)과, 그 결과를 **읽기 전용** 으로 보여주는 Next.js 16 + MUI
뷰어(`viewer/`)로 이루어진다. Supabase는 인증과 (일부) 데이터 저장(projection)에 쓴다.

<!-- section: where -->
## 구조

```
src/            빌드 없는 Node 24 TS 실행 (type stripping)
  collect/ classify/ enrich/ relate/ learn/ compare/ study/   파이프라인 단계
  refresh/refresh-runner.ts                                   10단계를 순서대로 부르는 오케스트레이터
  sync/                                                       Supabase projection (material / curriculum)
  index.ts                                                    CLI 진입 (명령 디스패치)
data/           1차 저장소 (JSON + .md). git-ignored 대용량 원본 포함
curriculum/     학습 커리큘럼 Source of Truth (YAML + authored .md)
project-learning/ 실전 프로젝트 학습 Source of Truth
viewer/         Next.js 16 App Router 읽기 전용 뷰어
```

<!-- section: flow -->
## 두 축

1. **파이프라인** (`npm run refresh`): Drive에서 자료 수집 → 분류 → 공식문서 보충 → 관계 재계산 →
   통합자료 → 비교 → 학습설명. 각 단계는 **증분**(바뀐 것만).
2. **뷰어**: `data/` 파일 + Supabase projection을 **읽기만** 한다. 쓰기·삭제 코드가 없다. 주소의 id를
   `index.json` 과 대조한 뒤에만 파일을 연다.

<!-- section: framework_role -->
## 왜 빌드가 없나

Node 24가 `.ts` 에서 타입만 지우고 바로 실행한다(type stripping). `tsconfig.json` 은 실행이 아니라
편집기 타입 검사 + `npm run typecheck` 용이다. `erasableSyntaxOnly` 로 enum/namespace를 금지해
"지우기만 해서 실행될 수 없는" 코드를 애초에 막는다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/nodejs-server/config-and-structure` — 계층 분리·환경설정
- `tooling-and-collaboration/editor-setup/npm-basics` — scripts
- `typescript/setup-and-basic-types/intro-and-setup` — TS 실행 방식

<!-- section: caution -->
## 주의점

- `data/` 는 `.gitignore` 되어 있다 — Git canonical은 `curriculum/` · `project-learning/` 이고 DB는 projection이다.
- 뷰어는 `data/` 파일이 없어도(배포 clone) 죽지 않고 Supabase나 빈 값으로 폴백한다.

<!-- section: check_question -->
## 이해 점검

1. `src/` 와 `viewer/` 의 역할 차이는?
2. "빌드 단계가 없다" 는 게 무슨 뜻인가?
3. Git canonical과 Supabase projection의 관계는?

<!-- section: review -->
## 한 줄 정리

**CMM은 자료를 만드는 CLI 파이프라인(`src/`)과 그것을 읽기만 하는 뷰어(`viewer/`)로 나뉘며, 빌드 없이
Node 24로 `.ts` 를 직접 실행하고, Git 파일이 정본·Supabase는 projection이다.**
