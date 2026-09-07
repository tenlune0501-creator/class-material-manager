---
id: react/optimization-and-refactoring/reducing-rerenders
chapter: react/optimization-and-refactoring
title: 불필요한 렌더 줄이기
mastery: understand
lesson_kind: lesson
estimated_minutes: 40
tags: [react, performance, memo, optimization]
related_material_ids:
  - 1Y_4ajA89SNegKtIZX6lLczA3_JUfz3jUuA0QHBak3M0   # 09 최적화 (memo / useCallback)
sources:
  - reference_slug: react/memo
  - reference_slug: react/useCallback
  - reference_slug: react/useMemo
prerequisites:
  - react/hooks-ref-memo-callback/usememo-usecallback
  - react/components-and-props/passing-props
code_examples:
  - slug: why-rerender
    title: 부모가 렌더되면 자식도 전부 다시 실행된다
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function App() {
        const [mode, setMode] = useState("welcome");
        // mode 만 바꿨는데 ...
        return (
          <div>
            <MyHeader title="..." />   {/* props 안 바뀌어도 다시 실행 */}
            <MyNav data={menus} />     {/* props 안 바뀌어도 다시 실행 */}
            <Article mode={mode} />    {/* 실제로 바뀐 건 이것뿐 */}
          </div>
        );
      }
      // 기본 규칙: 컴포넌트가 리렌더되면 그 자식들의 함수도 모두 다시 호출된다.
      // 대부분은 이래도 빠르다. "느릴 때만" 아래 도구를 쓴다.
  - slug: memo-plus-callback
    title: memo + useCallback 짝
    source_type: generated_minimal
    language: jsx
    code: |
      // 자식: props 가 얕은 비교로 같으면 다시 안 그린다
      const MyNav = memo(function MyNav({ data, onChangeMode }) {
        console.log("MyNav render");
        return <nav>{/* ... */}</nav>;
      });

      // 부모: 인라인 함수를 넘기면 매 렌더마다 "새 함수" → memo 가 무력화된다
      function App() {
        const [mode, setMode] = useState("welcome");
        const [id, setId] = useState(null);

        // ❌ <MyNav onChangeMode={(id) => { setMode("read"); setId(id); }} />
        // ✅ 참조를 고정
        const handleChangeMode = useCallback((nextId) => {
          setMode("read");
          setId(nextId);
        }, []); // 의존성 없음 → 앱 생애 동안 같은 함수

        return <MyNav data={menus} onChangeMode={handleChangeMode} />;
      }
  - slug: usememo-derived
    title: 비싼 파생값은 useMemo
    source_type: generated_minimal
    language: jsx
    code: |
      // content, id 가 그대로면 find 를 다시 돌리지 않는다
      const selectedArticle = useMemo(
        () => content.find((item) => item.id === id),
        [content, id],
      );
      // 주의: find 한 번은 사실 안 비싸다. 정렬/필터/무거운 계산일 때만 의미가 있다.
  - slug: compare-table
    title: memo / useCallback / useMemo
    source_type: generated_minimal
    language: text
    code: |
      memo(Component)      → 컴포넌트를 감싼다. 이전 props 와 얕게 같으면 렌더 스킵
      useCallback(fn, dep) → 함수의 "참조"를 렌더 사이에 고정
      useMemo(() => v, dep)→ 계산 "결과값"을 캐시

      memo 한 자식에 함수/객체/배열을 props 로 넘길 때만
      useCallback / useMemo 가 memo 를 살아있게 해 준다. 셋은 보통 함께 쓰인다.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- React의 기본 규칙("부모가 리렌더되면 자식도 다 다시 실행된다")을 설명할 수 있다.
- `memo` 가 무엇을 비교하는지(얕은 props 비교)와, 인라인 함수/객체가 왜 이를 깨는지 안다.
- `memo` + `useCallback` + `useMemo` 가 **한 세트로** 동작하는 이유를 안다.
- **언제 최적화하고 언제 하지 않아야 하는지**(먼저 측정) 판단 기준을 갖는다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useMemo` / `useCallback` 의 문법과 의존성 배열.
- props 는 부모가 내려 주는 값이고, 객체/배열/함수는 **새로 만들면 참조가 달라진다**는 것.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

수업자료(`09 최적화`)의 앱은 `MyHeader` / `MyNav` / `MyArticle` 로 나뉜다.
메뉴를 한 번 클릭해 `mode` 만 바꿨는데 콘솔을 보면 **바뀐 게 없는 `MyHeader` / `MyNav` 까지 다시 렌더**된다.

{{code: why-rerender}}

리스트가 길거나 자식 렌더가 무거우면 이 "덤 렌더"가 눈에 띄는 버벅임이 된다.
(단, 대부분의 화면에서는 이래도 충분히 빠르다는 걸 먼저 인정하고 시작한다.)

<!-- section: concept -->
## React의 기본 렌더 규칙

- 컴포넌트는 **함수**다. state/props 가 바뀌면 그 함수를 다시 호출한다.
- 한 컴포넌트가 다시 호출되면 **그 안에서 렌더되는 자식 함수들도 전부 다시 호출**된다 —
  자식 props 가 그대로여도.
- "다시 호출"이 곧 "DOM 갱신"은 아니다. React는 결과 JSX를 비교해 **바뀐 DOM만** 건드린다.
  그래도 함수 실행·JSX 생성 비용은 든다.

<!-- section: mechanism -->
## memo — 자식 쪽에서 렌더를 건너뛰기

{{code: memo-plus-callback}}

- `memo(Component)` 는 **이전 props 와 이번 props 를 얕게 비교**해서, 같으면 그 자식의 렌더를 스킵한다.
- 얕은 비교이므로 `data === data`, `onChangeMode === onChangeMode` 처럼 **참조가 같아야** "같다"로 본다.
- 문제: 부모가 `onChangeMode={(id) => ...}` 처럼 **인라인 함수**를 넘기면 부모가 렌더될 때마다
  새 함수가 생겨 참조가 달라진다 → `memo` 가 있어도 자식이 다시 렌더된다.
- 해결: `useCallback(fn, [])` 으로 함수 참조를 고정한다. 객체/배열 props 는 `useMemo` 로.

<!-- section: concept | title: 파생값 -->
## useMemo — 비싼 계산 결과 재사용

{{code: usememo-derived}}

수업자료는 `content.find(item => item.id === id)` 를 `useMemo` 로 감싼다. 개념 시연으로는 좋지만,
`find` 한 번은 실제로는 안 비싸다. **정렬·필터·큰 배열 변환·무거운 포맷팅**처럼 진짜 비용이
있을 때만 `useMemo` 가 값을 한다.

<!-- section: concept | title: 세 도구의 관계 -->
## memo · useCallback · useMemo 는 한 세트

{{code: compare-table}}

`useCallback` / `useMemo` 만 단독으로 쓰면 대개 효과가 없다. **`memo` 한 자식에게
함수/객체를 props 로 넘길 때** 그 참조를 지켜 주는 게 이 둘의 존재 이유다.

<!-- section: must_know -->
## 반드시 기억할 것

- 리렌더 = 자식 함수 재실행. DOM 갱신은 그중 바뀐 부분만.
- `memo` 는 **얕은 props 비교**. 인라인 함수/객체/배열이 그 비교를 깬다.
- `memo` + `useCallback`(함수) + `useMemo`(객체·파생값)는 **함께** 써야 의미가 있다.
- **먼저 측정하고 나중에 최적화한다.** React DevTools Profiler 로 "실제로 느린 컴포넌트"를 찾은
  뒤에 감싼다. 전부 `memo` 로 감싸면 비교 비용 + 코드 복잡도만 늘고 대개 더 느려지거나 그대로다.
- state를 필요한 곳에 가깝게 두고, 자주 바뀌는 부분을 작은 컴포넌트로 분리하는 게
  `memo` 남발보다 효과가 크다.

<!-- section: experiment -->
## 직접 해 보기

1. 수업자료 앱의 각 컴포넌트에 `console.log("... render")` 를 넣고 메뉴를 눌러 어떤 게 리렌더되는지 확인.
2. `MyNav` 를 `memo` 로 감싸고 다시 확인 — 여전히 리렌더되면 `onChangeMode` 인라인 함수가 원인.
3. `handleChangeMode` 를 `useCallback(fn, [])` 으로 바꾸고, 이제 `MyNav` 가 안 그려지는지 확인.
4. React DevTools Profiler 로 클릭 한 번을 녹화해 렌더된 컴포넌트와 소요 시간을 읽어 보라.
5. `useCallback` 의존성에 `[id]` 를 넣었다 뺐다 하며 참조가 언제 새로 생기는지 관찰.

<!-- section: check_question -->
## 이해 점검

1. `mode` 만 바꿨는데 `MyHeader` 가 왜 다시 렌더되나?
2. `memo` 는 정확히 무엇과 무엇을 비교하나?
3. `memo` 한 자식에 `onClick={() => f()}` 를 넘기면 왜 memo 가 무력화되나?
4. `useCallback` 을 자식에게 함수를 안 넘기는 컴포넌트에 써도 이득이 있나?
5. "최적화 전에 해야 할 일"은?

<!-- section: interview_question -->
## 면접 대비

- "React에서 리렌더가 발생하는 조건과, 리렌더가 곧 DOM 갱신은 아니라는 말의 의미는?"
- "`React.memo` 를 붙였는데도 자식이 리렌더된다면 어디를 의심하나요?"
- "`useMemo` / `useCallback` 을 남용하면 생기는 비용은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 기본 렌더 규칙, memo 의 얕은 비교, 인라인 함수가 memo 를 깨는 이유, useCallback/useMemo 가
> memo 와 한 세트인 이유, "측정 먼저" 원칙을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**부모가 리렌더되면 자식도 다시 실행된다 — 느린 게 측정으로 확인됐을 때만 `memo` 로 자식을 감싸고,
그 자식에 넘기는 함수·객체는 `useCallback` / `useMemo` 로 참조를 고정해 memo 를 살려 둔다.**
