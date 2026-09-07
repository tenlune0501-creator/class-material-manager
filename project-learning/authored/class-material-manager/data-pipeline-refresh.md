---
id: class-material-manager/data-pipeline-refresh
project: class-material-manager
title: refresh 파이프라인 — 10단계 증분 실행
unit_kind: feature
feature_area: 데이터 파이프라인
concepts: [파이프라인 오케스트레이션, 증분 처리, 단계 분리, CLI 서브커맨드]
related_lessons:
  - data-and-backend/nodejs-server/config-and-structure
  - data-and-backend/nodejs-server/routing-and-modules
  - typescript/functions-unions-guards/function-types
---

<!-- section: role -->
## 이 코드가 하는 일

`src/refresh/refresh-runner.ts` — 여덟 개 넘는 CLI 명령을 **올바른 순서로 부르기만** 하는
오케스트레이터. 각 단계의 실제 작업은 원래 모듈이 그대로 한다. 여기서 다시 구현하지 않는다.

<!-- section: where -->
## 코드 위치

- `src/refresh/refresh-runner.ts` — 순서·단계 상태 관리
- `src/collect/` `classify/` `enrich/` `relate/` `learn/` `compare/` `study/` — 각 단계 구현
- `src/index.ts` `refresh` 케이스 → `runRefresh()`

<!-- section: flow -->
## 순서가 왜 중요한가 (파일 주석 그대로)

```
· 수집을 하고 분류를 안 하면 자료가 _inbox 에 남는다
· 분류를 하고 연결을 다시 안 하면 relations.json 이 옛날 것을 가리킨다
· 연결을 다시 하고 학습자료를 안 만들면 화면이 옛날 코드를 보여준다
```

단계: 링크 추출 → 수집(Docs/파일/zip) → 분류 → 공식문서 보충(enrich) → 관계 재계산(relate) →
통합 학습자료(build-learning) → 비교(compare) → 학습설명(study) → 수집 상태 기록 → 백업.

<!-- section: code -->
## 핵심 코드 읽기 (요지)

```ts
export interface RefreshOptions {
  dryRun?: boolean;      // 바꾸지 않고 미리보기만
  skipCollect?: boolean; // Drive 수집 건너뛰고 로컬만 다시 엮기
  skipEnrich?: boolean;  // 공식 문서 재확인 건너뛰기 (빠른 갱신)
}

// 각 단계는 "완료 / 이전 데이터 사용 / 실패" 중 하나로 끝난다.
// "바깥에서 자료를 못 받아왔지만 잃지는 않은" 경우를 "완료" 와 구분하려고 상태를 나눴다.
```

<!-- section: why -->
## 왜 이렇게 했나

- 사용자가 8개 명령의 순서를 외우게 하지 않는다 — `npm run refresh` 한 줄.
- **오케스트레이터는 "부르기" 만** 하고 로직은 각 모듈에 남긴다(단일 책임, 테스트 분리).
- 단계 상태를 세 가지로 나눠 "부분 실패" 를 "성공" 으로 오판하지 않는다.

<!-- section: framework_role -->
## 프레임워크 없이 한 것

런타임 프레임워크가 없다. `process.argv[2]` 로 명령을 고르는 `switch` (`src/index.ts`)와, 단계 함수를
순서대로 `await` 하는 러너뿐이다. "작은 CLI는 프레임워크가 필요 없다" 의 예.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `data-and-backend/nodejs-server/config-and-structure` — 계층·오케스트레이션
- `data-and-backend/nodejs-server/routing-and-modules` — 모듈 분리
- `typescript/functions-unions-guards/function-types` — 단계 함수 시그니처

<!-- section: caution -->
## 주의점

- 단계 순서를 바꾸면 조용히 어긋난 결과가 나온다 — 주석의 "왜 이 순서인가" 를 먼저 읽는다.
- `dryRun` 은 "쓰지 않고 볼 수 있는 것만" 이다 — 모든 단계를 미리 볼 수 있는 건 아니다.

<!-- section: experiment -->
## 작은 실습

1. `runRefresh` 가 부르는 단계 함수를 순서대로 나열하고, 각 단계의 입력/출력 파일을 표로 적어라.
2. `skipEnrich: true` 와 아닐 때의 차이를 코드에서 찾아라.
3. 두 단계의 순서를 바꾸면 어떤 파일이 옛것을 가리키게 되는지 추론하라.

<!-- section: check_question -->
## 이해 점검

1. 이 러너가 "하지 않는" 일은 무엇인가?
2. 단계 상태를 셋으로 나눈 이유는?
3. 파이프라인 순서가 어긋나면 생기는 문제 하나를 들어라.

<!-- section: review -->
## 한 줄 정리

**refresh-runner는 8개 파이프라인 단계를 정해진 순서로 부르기만 하는 얇은 오케스트레이터이며, 각 단계는
증분으로 동작하고 "완료 / 이전 데이터 사용 / 실패" 로 결과를 구분한다.**
