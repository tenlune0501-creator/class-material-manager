---
id: coding-test/foundations/big-o-notation
chapter: coding-test/foundations
title: Big-O 표기법과 복잡도 분석
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [coding-test, big-o, complexity, time-complexity, space-complexity]
related_material_ids: []
sources:
  - title: "6.006 Introduction to Algorithms, Spring 2020 — Lecture Notes (L1 algorithmic thinking, L19 complexity)"
    url: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/
    publisher: "MIT OpenCourseWare"
    checked_at: 2026-09-06
    source_type: course_material
  - title: "TimeComplexity — Python Wiki (CPython list/dict/set 연산 복잡도)"
    url: https://wiki.python.org/moin/TimeComplexity
    publisher: "Python Software Foundation"
    checked_at: 2026-09-06
    source_type: community_reference
  - title: "Array — JavaScript | MDN"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
    publisher: "Mozilla (MDN)"
    checked_at: 2026-09-06
    source_type: official_docs
prerequisites:
  - coding-test/foundations/problem-solving-approach
  - javascript/language-basics/arrays-and-loops
code_examples:
  - slug: linear-sum
    title: 단일 루프 — O(n)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      function sum(arr) {
        let total = 0;               // 1회
        for (let i = 0; i < arr.length; i++) {  // n회 반복
          total += arr[i];           // 반복마다 1회  → 총 n회
        }
        return total;                // 1회
      }
      // 연산 횟수 ≈ n + 상수  →  상수·저차항 무시  →  O(n)
  - slug: double-loop-dup
    title: 이중 루프 — O(n²)
    source_type: generated_minimal
    language: js
    code: |
      // 배열에 중복이 있는지 (느린 방법)
      function hasDup(arr) {
        for (let i = 0; i < arr.length; i++) {        // n회
          for (let j = i + 1; j < arr.length; j++) {  // 안쪽 평균 n/2회
            if (arr[i] === arr[j]) return true;       // 총 ≈ n²/2회
          }
        }
        return false;
      }
      // n²/2 → 상수 무시 → O(n²).   n = 100,000 이면 ≈ 5,000,000,000 연산 → 시간 초과.

      // 빠른 방법: Set 으로 O(n)
      function hasDupFast(arr) {
        const seen = new Set();
        for (const x of arr) {          // n회
          if (seen.has(x)) return true; // has: 평균 O(1)
          seen.add(x);                  // add: 평균 O(1)
        }
        return false;
      }
      // 총 O(n).  같은 문제, 자료구조를 바꿔 n² → n.
  - slug: binary-search
    title: 매번 절반 — O(log n)
    source_type: generated_minimal
    language: js
    code: |
      // 정렬된 배열에서 target 의 인덱스 (없으면 -1)
      function bsearch(arr, target) {
        let lo = 0, hi = arr.length - 1;
        while (lo <= hi) {                       // 범위가 매 반복 절반으로 줄어든다
          const mid = (lo + hi) >> 1;
          if (arr[mid] === target) return mid;
          if (arr[mid] < target) lo = mid + 1;
          else hi = mid - 1;
        }
        return -1;
      }
      // n → n/2 → n/4 → ... → 1  까지 log2(n) 번  →  O(log n).
      // n = 1,000,000 이어도 약 20번.
  - slug: constraint-math
    title: 제한을 보고 필요한 복잡도를 역산
    source_type: generated_minimal
    language: text
    code: |
      대략적인 기준 (1초, 흔한 채점 환경):
        허용 연산 수 ≈ 1억(10^8) 언저리

        n ≤ 1,000,000 (10^6)  → O(n), O(n log n) 까지 안전
        n ≤ 100,000   (10^5)  → O(n log n) 까지.  O(n²)=10^10 → 위험
        n ≤ 10,000    (10^4)  → O(n²)=10^8 → 아슬. O(n^2 log n) 위험
        n ≤ 1,000     (10^3)  → O(n²) 안전, O(n³)=10^9 → 위험
        n ≤ 20 ~ 25           → O(2^n) 완전탐색 가능

      → 풀이를 쓰기 전에 "이 제한에서 어떤 복잡도까지 허용되나"를 먼저 정한다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 반복문·재귀 구조만 보고 **O(1) / O(log n) / O(n) / O(n log n) / O(n²) / O(2ⁿ)** 를 구분한다.
- 자료구조의 연산별 비용(배열 인덱스 O(1) vs 탐색 O(n), 해시 조회 O(1) 평균, 정렬 O(n log n))을 안다.
- **"n ≤ 10⁵, 1초"** 같은 제한에서 **필요한 복잡도를 역산**해, 풀이를 쓰기 전에
  "이 접근이 통과할지"를 판단한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- **배열 순회, 중첩 반복문** — `for` 안의 `for`.
- **함수 호출·재귀** 감각.
- **문제 해결 접근법** — 입력/출력/제약을 먼저 읽는 습관. (→ `coding-test/foundations/problem-solving-approach`)

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

**"내 풀이는 정답인데 '시간 초과'가 뜬다."**

`double-loop-dup` 처럼 이중 루프로 짰는데 `n = 100,000` 이면 연산이 약 **50억 번** →
채점 환경에서 1초 안에 못 끝난다. 코드는 맞는데 **복잡도가 제한을 못 맞춘 것**이다.

반대로 `n ≤ 1,000` 인데 O(n²)를 무서워해서 억지로 O(n log n)을 짜느라 시간을 버리기도 한다.
**제한을 보고 필요한 복잡도를 먼저 정하면** 이 두 실수가 사라진다.

<!-- section: concept -->
## 점근 표기(Big-O)의 의미

Big-O 는 **입력 크기 n 이 커질 때 연산량이 어떻게 늘어나는지**를, **상수와 낮은 차수 항을
무시하고**, 보통 **최악의 경우** 기준으로 나타낸 것이다.

- `3n + 7` → **O(n)** (상수 배수 3, 상수 항 7 무시)
- `n²/2 + n` → **O(n²)** (낮은 차수 `n`, 상수 `1/2` 무시)
- `100` → **O(1)** (n 과 무관하게 일정)

왜 상수를 버리나? "노트북 vs 서버", "언어 A vs B" 같은 상수 배 차이는 **알고리즘의 좋고 나쁨을
가르지 못한다.** n 이 10배 되면 시간이 10배(O(n))냐 100배(O(n²))냐 — 그 **증가율**이 본질이다.

<!-- section: mechanism -->
## 코드 패턴 → 복잡도

| 코드 모양 | 복잡도 | 예 |
|---|---|---|
| 반복 없이 몇 줄 | **O(1)** | 배열 `arr[i]`, `map.get(k)` |
| n 을 한 번 훑는 루프 | **O(n)** | 합계, 최댓값, 한 번의 순회 |
| 루프 안에 루프 (둘 다 n) | **O(n²)** | 모든 쌍 비교 |
| 매 단계 범위가 **절반**으로 | **O(log n)** | 이진 탐색 |
| n 개를 각각 log n 걸려 처리 / 분할정복 | **O(n log n)** | 정렬, "정렬 후 스캔" |
| 각 원소를 넣거나 뺀다(2가지 선택) × n | **O(2ⁿ)** | 부분집합 완전탐색 |

- **연속된 루프**(하나 끝나고 다음)는 **더한다**: `O(n) + O(n) = O(n)`.
- **중첩된 루프**는 **곱한다**: `O(n) × O(n) = O(n²)`, `O(n) × O(log n) = O(n log n)`.
- 재귀는 "**호출 트리의 노드 수 × 노드당 비용**". 매번 절반이면 깊이 log n.

{{code: linear-sum}}
{{code: double-loop-dup}}
{{code: binary-search}}

<!-- section: code_breakdown -->
## 무엇을 본 것인가

- `linear-sum`: 루프가 정확히 n 번 → **O(n)**. 앞뒤 상수 줄은 무시.
- `double-loop-dup`: 바깥 n × 안쪽 평균 n/2 = **O(n²)**. `Set` 으로 바꾸면 각 원소를 한 번
  보며 O(1) 조회 → **O(n)**. **같은 문제, 자료구조 선택이 복잡도를 바꿨다.**
- `binary-search`: 탐색 범위가 매 반복 절반 → **O(log n)**. n=100만이어도 약 20번.

<!-- section: must_know -->
## 반드시 기억할 것 — 자료구조 연산 비용

| 연산 | 배열(JS Array) | 해시(Map/Set) |
|---|---|---|
| 인덱스로 읽기 `arr[i]` | **O(1)** | — |
| 값으로 찾기 `includes` / `indexOf` | **O(n)** | `has`/`get` **O(1) 평균** (최악 O(n)) |
| 끝에 추가 / 제거 `push`/`pop` | **O(1)** (amortized) | `add`/`delete` **O(1) 평균** |
| 앞에 추가 / 제거 `unshift`/`shift` | **O(n)** (전부 밀림) | — |
| 정렬 `sort` | **O(n log n)** | — |

- **스택 / 큐(덱)**: 한쪽(또는 양쪽) 끝 push/pop → **O(1)**. (배열의 `shift` 는 O(n)이니
  큐는 인덱스 포인터나 덱 자료구조로.)
- **"해시 조회는 O(1) 평균, 최악 O(n)"** — 해시 충돌이 몰리면 최악. 실무·코테에선 평균으로 본다.
- 코테 감각: **O(n²)는 n ≤ 10⁴ 정도까지**, 그 이상이면 O(n log n) 이하를 노린다.

{{code: constraint-math}}

<!-- section: experiment -->
## 직접 해 보기

1. `hasDup`(O(n²))와 `hasDupFast`(O(n))에 길이 10³ → 10⁴ → 10⁵ 인 배열을 넣고
   `performance.now()` 로 시간을 재라. n 이 10배 될 때 O(n²)는 약 100배, O(n)은 약 10배 느려진다.
2. `sum`(O(n))과 `bsearch`(O(log n))에 n=10⁶ 을 넣어 보라. 둘 다 순식간이지만,
   `bsearch` 는 **정렬된 입력**을 요구한다는 전제를 확인하라(정렬 비용 O(n log n)이 먼저).
3. `constraint-math` 표를 안 보고 다시 써라: `n ≤ ?` 각 구간에서 허용되는 최대 복잡도.

<!-- section: delegatable -->
## 지금 깊이 안 파도 되는 것

- **마스터 정리(Master Theorem)의 엄밀한 증명** — 재귀식 → 복잡도 매핑 결과만 알면 됨.
- **amortized 분석의 형식적 전개** — "`push` 는 amortized O(1)" 라는 결론만.
- **Θ(빅세타), Ω(빅오메가)** 의 형식 정의 — 코테에서는 Big-O(상한)로 소통. 개념만.
- **공간 복잡도의 정밀 계산** — "추가로 배열 하나 O(n)냐, 변수 몇 개 O(1)냐" 큰 그림이면 충분.

<!-- section: check_question -->
## 이해 점검

1. `3n² + 100n + 5` 의 Big-O 는? 왜 `100n` 을 버리나?
2. `for` 두 개가 **나란히** 있을 때와 **중첩**됐을 때의 복잡도 차이는?
3. `arr.includes(x)` 와 `set.has(x)` 의 복잡도가 다른 이유는?
4. `n ≤ 100,000`, 1초 제한. O(n²) 풀이를 내도 될까? 어떤 복잡도를 노려야 하나?

<!-- section: interview_question -->
## 면접 대비

- "HashMap 조회가 O(1)이라는데, 왜 최악의 경우 O(n)인가요?"
- "정렬 후 투 포인터로 푸는 풀이의 전체 복잡도가 O(n log n)인 이유는?"
- "시간 복잡도가 같은 두 알고리즘 중 하나를 고르는 기준은 무엇인가요?"

<!-- section: mission -->
## 미션

1. `double-loop-dup` 를 `Map` 으로 "가장 먼저 중복되는 값"을 O(n)에 찾도록 고쳐라.
2. 함수 5개를 주고(직접 만들어도 됨) 각각의 시간·공간 복잡도를 적고, 한 줄 근거를 달아라.
   최소 O(1), O(log n), O(n), O(n log n), O(n²) 를 하나씩 포함하라.
3. 아래 외부 연습 문제를 "**복잡도만**" 분석하라(풀지 않아도 됨): 입력 제한을 보고
   허용 복잡도를 역산하고, 순진한 접근의 복잡도와 비교해 "통과 여부"를 예측한 뒤,
   실제로 풀어 확인하라. (지문은 링크에서 읽는다 — 여기 복제하지 않는다.)

<!-- section: problem_link -->
## 연습 문제 (외부 — 제목과 링크만)

> CMM 은 외부 문제의 지문을 저장하지 않는다. 아래는 제목·출처·한 줄 분류만이며,
> 문제는 링크에서 직접 읽는다.

- **프로그래머스 · "완주하지 못한 선수"** — 해시로 빈도 차이 찾기. 난이도 낮음.
  <https://school.programmers.co.kr/learn/challenges> 에서 제목으로 검색.
  (출처: 프로그래머스 코딩테스트 연습, https://school.programmers.co.kr/learn/challenges)
- **백준 · 1920 "수 찾기"** — 정렬 + 이진 탐색 vs 해시. O(n log n) / O(n).
  <https://www.acmicpc.net/problem/1920>
- **백준 · 2750 "수 정렬하기"** vs **2751 "수 정렬하기 2"** — 같은 문제, 제한만 다르다
  (n ≤ 1,000 vs n ≤ 1,000,000). O(n²) 정렬이 되는 구간과 안 되는 구간을 몸으로 확인.
  <https://www.acmicpc.net/problem/2750> · <https://www.acmicpc.net/problem/2751>

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> Big-O 가 무엇을 무시하고 무엇을 보는지, 코드 패턴 6가지 → 복잡도 매핑, 배열 vs 해시 연산
> 비용표, "n ≤ 10⁵ 이면 어디까지"를 답하기. 그다음 `hasDup` 를 O(n)으로 고치는 아이디어를 말로.

<!-- section: review -->
## 한 줄 정리

**Big-O 는 입력이 커질 때의 연산 증가율을 상수 빼고 본 것이다 — 풀이를 쓰기 전에 입력 제한을
보고 허용 복잡도를 정하고, 그에 맞는 자료구조를 고른다.**
