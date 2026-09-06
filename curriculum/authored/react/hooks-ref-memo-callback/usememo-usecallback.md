---
id: react/hooks-ref-memo-callback/usememo-usecallback
chapter: react/hooks-ref-memo-callback
title: useMemo와 useCallback
mastery: required
lesson_kind: lesson
estimated_minutes: 40
tags: [react, useMemo, useCallback, memoization, performance]
related_material_ids:
  - 1ityo_Iuprr05vhTk4JyjmUrAmt3vl-7zs7Zd3fU4Zl4   # useMemo
  - 17MmYtDVPs1hyHrRSQqSquLgZYpn22jBVT0AmzPiW1og   # useCallback
sources:
  - reference_slug: react/useMemo
  - reference_slug: react/useCallback
prerequisites:
  - react/hooks-ref-memo-callback/useref
code_examples:
  - slug: usememo
    title: useMemo — 무거운 계산 결과 캐시
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function ProductList({ products, query }) {
        // query 나 products 가 안 바뀌면 다시 계산 안 함
        const filtered = useMemo(
          () => products.filter((p) => p.name.includes(query)),
          [products, query],
        );
        return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
      }
      // 이 배열이 20만 개쯤 되고 필터가 무거울 때 의미가 있다.
      // 100개짜리면 useMemo 없이 그냥 계산하는 게 낫다 (memo 자체도 비용).
  - slug: usecallback
    title: useCallback — 함수 참조 고정
    source_type: generated_minimal
    language: jsx
    code: |
      const Child = React.memo(function Child({ onAdd }) {
        console.log("Child render");
        return <button onClick={onAdd}>추가</button>;
      });

      function Parent() {
        const [count, setCount] = useState(0);

        // useCallback 없으면 매 렌더마다 새 함수 → React.memo 가 무력화됨
        const handleAdd = useCallback(() => setCount((c) => c + 1), []);

        return (<><p>{count}</p><Child onAdd={handleAdd} /></>);
      }
      // useCallback(fn, deps) === useMemo(() => fn, deps)
  - slug: derived
    title: 대부분은 memo 없이 — 렌더 중 계산으로 충분
    source_type: generated_minimal
    language: jsx
    code: |
      function Cart({ items }) {
        // 파생 값은 그냥 렌더 중에 계산한다. state 로 중복 보관 X, 대부분 useMemo 도 불필요.
        const total = items.reduce((s, it) => s + it.price * it.qty, 0);
        return <p>합계 {total.toLocaleString()}원</p>;
      }
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `useMemo` 가 "**의존성이 안 바뀌면 계산 결과를 재사용**", `useCallback` 이 "**함수 참조를 고정**"하는 것임을 안다.
- `React.memo` 와 `useCallback` 이 왜 함께 쓰이는지 설명한다.
- **대부분의 경우 이 훅들이 필요 없다**는 것(파생 값은 그냥 렌더 중 계산)을 안다 — 언제 실제로 필요한지 판단.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useState`/`useEffect`/`useRef`, 리렌더 개념, 참조 동일성(`{} !== {}`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제 (그리고 과용의 문제)

- 진짜 무거운 계산(수십만 건 필터/정렬)을 매 렌더마다 해서 화면이 버벅인다.
- `React.memo` 로 감싼 자식이 계속 리렌더된다 → 부모가 매 렌더마다 **새 함수/객체**를 props 로 넘기기 때문.
- **반대로**: 모든 값에 `useMemo`, 모든 함수에 `useCallback` 을 붙여 코드가 읽기 어려워지고 오히려 느려진다.

<!-- section: concept -->
## useMemo — 계산 캐시

{{code: usememo}}

- `useMemo(() => 계산, [deps])` — `deps` 가 이전 렌더와 같으면 **지난 결과를 그대로** 돌려준다.
- 쓸 만한 때: 계산이 **정말 무겁다**(큰 배열 필터/정렬/변환), 또는 결과 객체를 **`React.memo` 자식이나
  다른 훅의 의존성**으로 넘겨서 참조를 안정시켜야 한다.

<!-- section: mechanism -->
## useCallback — 함수 참조 고정

{{code: usecallback}}

- 컴포넌트가 리렌더되면 **본문의 함수도 매번 새로 만들어진다**(`handleAdd !== 지난 handleAdd`).
- 그 함수를 `React.memo` 로 감싼 자식에게 props 로 넘기면 → props 가 "바뀐 것"으로 보여 자식이 리렌더.
- `useCallback(fn, deps)` 로 감싸면 `deps` 가 같은 한 **같은 함수 참조**를 유지 → `React.memo` 가 제대로 동작.
- `useCallback(fn, d)` 는 `useMemo(() => fn, d)` 와 같다.

<!-- section: code | lang: jsx -->
## 대부분은 필요 없다

{{code: derived}}

- **파생 값**(합계, 필터 결과)은 state 로 중복 보관하지 말고 **렌더 중에 계산**. 그게 가장 단순하고 버그가 없다.
- 그 계산이 눈에 띄게 느릴 때만 `useMemo`.
- React 19 의 컴파일러가 이런 최적화를 자동으로 해 주기도 한다 — **먼저 단순하게 짜고, 측정 후 필요하면** memo.

<!-- section: must_know -->
## 반드시 기억할 것

- `useMemo` = 계산 결과 캐시. `useCallback` = 함수 참조 캐시. 둘 다 `deps` 기반.
- **`React.memo` + `useCallback`/`useMemo` 는 세트** — 자식에게 넘기는 함수/객체 props 의 참조를 안정시킬 때.
- **먼저 memo 없이 짠다.** 파생 값은 렌더 중 계산. 느린 게 측정되면 그때 `useMemo`.
- memoization 자체도 비용(비교 + 메모리)이다. 가벼운 계산엔 손해.
- `deps` 를 빠뜨리면 옛 값을 캐시해 버그 — `useEffect` 와 같은 규칙.
- "리렌더 = 느림"이 아니다. 리렌더는 보통 싸다. 진짜 병목을 Profiler 로 확인하고 최적화.

<!-- section: experiment -->
## 직접 해 보기

1. 20만 개 배열을 필터하는 컴포넌트를 만들어 무관한 state(입력창)를 바꿀 때 버벅이는 걸 확인 →
   `useMemo(..., [query, list])` 로 감싸 개선. 100개짜리로 줄이면 차이가 없는(또는 memo 가 손해인) 것도 확인.
2. `React.memo(Child)` + 부모가 인라인 `onClick={() => ...}` 를 넘길 때 Child 가 매번 리렌더되는 걸
   콘솔로 확인 → `useCallback` 으로 고쳐라.
3. 장바구니 합계를 `useState` + `useEffect` 로 "동기화"한 코드를, 렌더 중 `reduce` 계산으로 바꿔 단순화하라.

<!-- section: check_question -->
## 이해 점검

1. `useMemo` 와 `useCallback` 은 각각 무엇을 캐시하나?
2. `React.memo` 자식이 계속 리렌더되는 흔한 원인과 해결책은?
3. "파생 값"을 다루는 가장 단순한 방법은? `useMemo` 는 언제?
4. 모든 함수에 `useCallback` 을 붙이면 왜 안 좋은가?

<!-- section: interview_question -->
## 면접 대비

- "`useMemo`/`useCallback` 을 언제 쓰고, 언제 쓰면 안 되나요?"
- "`React.memo` 가 얕은 비교를 한다는 게 무슨 뜻이고, 함수 props 와 어떤 관계가 있나요?"
- "성능 최적화 전에 무엇을 먼저 하나요? (측정)"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> useMemo/useCallback 의 역할, React.memo 와의 세트 관계, "먼저 memo 없이", memoization 비용,
> deps 규칙을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**`useMemo`(계산 캐시)·`useCallback`(함수 참조 캐시)은 `React.memo` 와 세트로, 자식에게 넘기는 값의
참조를 안정시킬 때만 의미가 있다 — 파생 값은 그냥 렌더 중 계산하고, 느린 게 측정되면 그때 감싼다.**

<!-- section: next -->
## 다음 Chapter

`react/custom-hooks` — 반복되는 상태 로직을 훅으로 추출.
