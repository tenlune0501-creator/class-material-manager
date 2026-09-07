---
id: coding-test/foundations/problem-solving-approach
chapter: coding-test/foundations
title: 문제 해결 접근법
mastery: understand
lesson_kind: lesson
estimated_minutes: 25
tags: [coding-test, problem-solving, approach]
related_material_ids: []
sources:
  - title: "6.006 Introduction to Algorithms, Spring 2020 — Lecture Notes"
    url: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/
    publisher: "MIT OpenCourseWare"
    checked_at: 2026-09-06
    source_type: course_material
  - title: "Big-O Cheat Sheet"
    url: https://www.bigocheatsheet.com/
    publisher: "Eric Rowell"
    checked_at: 2026-09-07
    source_type: community_reference
prerequisites: []
code_examples:
  - slug: steps
    title: 문제를 푸는 순서 (코드는 마지막)
    source_type: generated_minimal
    language: text
    code: |
      1) 문제를 내 말로 다시 쓴다 : 입력 / 출력 / 제약(N 범위, 값 범위, 시간 제한)
      2) 예제를 손으로 푼다       : 주어진 예제 + 내가 만든 작은 예제 1~2개
      3) 엣지 케이스를 나열한다   : N=0/1, 중복, 음수, 최대 크기, 정렬 안 됨, 빈 입력
      4) 무식한 풀이(brute force)를 먼저 : 되는 것부터. 복잡도를 계산한다
      5) 복잡도 예산과 비교        : 제약을 넘으면 어디가 병목인지 찾아 개선
      6) 그때 코드를 쓴다 + 예제·엣지로 검증
  - slug: budget
    title: 제약 → 필요한 복잡도 (역산)
    source_type: generated_minimal
    language: text
    code: |
      대략 1초 ≈ 1e8 ~ 1e9 기본 연산 (환경마다 다름 — 감각용)

      N ≤ 10        → 순열/완전탐색 O(N!) 도 가능
      N ≤ 20        → 부분집합 O(2^N)
      N ≤ 2,000     → O(N^2)
      N ≤ 100,000   → O(N log N)  (정렬/이분탐색/힙)
      N ≤ 1,000,000 → O(N) 또는 O(N log N)
      N ≥ 1e9       → O(log N) 또는 O(1) (수식/이분탐색)
      => "N 을 보면 필요한 알고리즘 계열이 보인다"
  - slug: patterns
    title: 병목을 줄이는 흔한 수단
    source_type: generated_minimal
    language: text
    code: |
      "안에서 또 찾는다"(O(N^2)) → 해시맵/집합으로 O(1) 조회 → O(N)
      "매번 정렬한다"            → 한 번 정렬 후 투 포인터 / 슬라이딩 윈도
      "겹치는 하위 문제"         → 메모이제이션 / DP
      "정렬된 데이터에서 탐색"   → 이분 탐색
      "그래프/트리 탐색"         → BFS(최단거리) / DFS(경로·연결성)
  - slug: verify
    title: 제출 전 체크
    source_type: generated_minimal
    language: text
    code: |
      □ 예제 전부 통과  □ 내가 만든 엣지(N=0/1, 최대, 중복, 음수) 통과
      □ 시간 복잡도가 제약 안  □ 오버플로(정수 범위)  □ 인덱스 경계(off-by-one)
      □ 입출력 형식(공백/개행/여러 줄)  □ 큰 입력에서 시간 측정
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 코딩테스트 문제를 **코드부터 치지 않고** "이해 → 예제 → 엣지 → brute force → 개선 → 구현·검증" 순으로 푼다.
- **제약(N 범위)에서 필요한 복잡도를 역산**한다.
- 병목(중첩 루프, 반복 정렬 등)을 줄이는 흔한 수단을 안다.
- 제출 전 체크리스트로 흔한 실수(엣지, 오버플로, off-by-one, 입출력 형식)를 잡는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- (없음) 이 Lesson이 코딩테스트 트랙의 출발점이다. 다음 Lesson `big-o-notation` 이 복잡도의 정의를 다룬다.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

문제를 읽자마자 코드를 치기 시작하면: 제약을 놓쳐 시간 초과(TLE) 나고, 엣지 케이스에서 틀리고,
"어디부터 고쳐야 할지" 를 모른 채 삽질한다. **접근 순서**가 있으면 이 낭비가 준다.

<!-- section: concept -->
## 1. 순서 — 코드는 마지막

{{code: steps}}

- **문제를 내 말로 다시 쓴다**: 입력·출력·제약(N 범위, 값 범위, 시간 제한). 제약이 알고리즘을 결정한다.
- **예제를 손으로**: 주어진 예제 + 내가 만든 작은 예제. 여기서 규칙·패턴이 보인다.
- **brute force 먼저**: "일단 되는" 풀이의 복잡도를 계산 → 제약과 비교 → 안 되면 병목을 찾아 개선.
  처음부터 최적해를 노리다 시간을 다 쓰지 않는다.

<!-- section: mechanism -->
## 2. 제약 → 복잡도 역산

{{code: budget}}

`N` 을 보면 **허용되는 복잡도 등급**이 보인다. `N = 100,000` 이면 `O(N^2)`(100억)는 불가, `O(N log N)` 이 목표.
이 감각이 "무슨 알고리즘 계열을 써야 하나" 를 좁혀 준다. (구체 상수는 채점 환경마다 다르니 감각용.)

<!-- section: concept | title: 병목 -->
## 3. 병목 줄이기

{{code: patterns}}

대부분의 개선은 "이 반복 안에서 또 O(N)으로 뭔가 한다" 를 **해시/정렬/이분탐색/DP** 로 O(1)이나
O(log N)으로 바꾸는 것이다.

<!-- section: concept | title: 검증 -->
## 4. 제출 전 체크

{{code: verify}}

<!-- section: must_know -->
## 반드시 기억할 것

- 순서: **이해(입력·출력·제약) → 예제 손풀이 → 엣지 나열 → brute force + 복잡도 → 개선 → 구현·검증.**
- **제약(N)에서 필요한 복잡도를 역산**한다. `N` 크기가 알고리즘 계열을 좁힌다.
- brute force를 먼저 확실히 한다. 처음부터 최적해에 매달리지 않는다.
- 병목 개선 = 중첩 탐색을 해시/정렬+투포인터/이분탐색/DP로.
- 제출 전: 엣지(N=0/1·최대·중복·음수), 정수 오버플로, off-by-one, 입출력 형식, 큰 입력 시간 측정.
- 시간 상수·"1초 = 몇 연산" 은 환경 의존 — 감각으로만 쓴다.

<!-- section: experiment -->
## 직접 해 보기

1. 아무 문제 하나를 골라 코드를 치기 전에 "입력/출력/제약/엣지" 를 종이에 적어라.
2. 그 문제의 brute force 풀이의 복잡도를 계산하고, 제약을 넘는지 판단하라.
3. 넘는다면 §3의 수단 중 무엇으로 병목을 줄일지 한 문장으로 정한 뒤 구현하라.
4. `N` 값이 다른 비슷한 문제 3개를 보고, 각각 어떤 복잡도가 필요한지 §2 표로 맞혀 보라.
5. 제출 전 체크리스트를 실제로 한 줄씩 확인하고, 걸린 항목이 있으면 기록하라.

<!-- section: check_question -->
## 이해 점검

1. 문제를 풀 때 코드는 몇 번째 단계인가? 그 앞에 무엇이 있나?
2. `N ≤ 2,000` 과 `N ≤ 100,000` 은 각각 어떤 복잡도가 목표인가?
3. brute force를 먼저 하는 이유는?
4. "이중 루프로 안에서 또 찾는다" 를 O(N)으로 줄이는 대표 수단은?
5. 제출 전 반드시 확인할 실수 유형 3가지는?

<!-- section: interview_question -->
## 면접 대비

- "새 알고리즘 문제를 받으면 어떤 순서로 접근하나요?"
- "제약 조건(N의 범위)에서 알고리즘을 어떻게 좁히나요?"
- "brute force에서 최적해로 넘어가는 사고 과정을 예로 설명해 보세요."

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 접근 순서(이해·예제·엣지·brute force·개선·검증), 제약→복잡도 역산(N 크기 표),
> 병목 줄이기(해시/정렬/이분/DP), 제출 전 체크(엣지·오버플로·off-by-one·입출력)를 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**코딩테스트는 코드를 치기 전에 입력·출력·제약을 정리하고 예제를 손으로 풀어 brute force와 그 복잡도를
확인한 뒤, 제약을 넘으면 병목을 해시·정렬·이분탐색·DP로 줄여 구현하고 엣지·오버플로·off-by-one·입출력을
점검한다 — `N` 의 크기가 필요한 복잡도를 알려 준다.**
