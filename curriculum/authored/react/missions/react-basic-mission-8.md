---
id: react/missions/react-basic-mission-8
chapter: react/missions
title: React Basic Mission 8
mastery: practical
lesson_kind: lesson
estimated_minutes: 180
tags: [react, mission, capstone, practice]
related_material_ids:
  - 1gDF0BVE4sFtEwJXjGCl93p10zXlHvzXOM7hA87zNAJM   # REACT basic mission 8 (문제)
  - 1O9496od15d2eFjx_LgdRDaRqvfZ0gITm1K_xaBQz80c   # REACT basic mission 8 - 매뉴얼
  - 1Jyha-NxLXz6teWjNaRdzfdG9P1QPswwioZDYdTMnhGs   # REACT basic mission 7 - 답안
  - 1AQdGoQUUcuoUgfiKXTNvtzNf_j3jFRpZ              # react-mission8_final_v202607.zip
prerequisites:
  - react/hooks-ref-memo-callback/usememo-usecallback
  - react/hooks-ref-memo-callback/useref
  - react/optimization-and-refactoring/reducing-rerenders
code_examples:
  - slug: state-first
    title: 상태를 먼저 다 선언한다 (App이 단일 소유)
    source_type: generated_minimal
    language: jsx
    is_canonical: true
    code: |
      function App() {
        const [keyword, setKeyword] = useState("");
        const [category, setCategory] = useState("all");
        const [favoriteIds, setFavoriteIds] = useState([]); // id 배열
        const [favoriteOnly, setFavoriteOnly] = useState(false);

        // 자식(SearchForm, CategoryFilter, List)에는 값 + 변경 함수만 내린다
        return (
          <>
            <SearchForm keyword={keyword} onKeywordChange={setKeyword} />
            <CategoryFilter category={category} onChange={setCategory} />
            {/* ... */}
          </>
        );
      }
  - slug: usememo-filter
    title: useMemo — 검색+카테고리+즐겨찾기 필터 결과 캐시
    source_type: generated_minimal
    language: jsx
    code: |
      const filtered = useMemo(() => {
        return data.filter((item) => {
          const byKeyword = item.title.toLowerCase().includes(keyword.toLowerCase());
          const byCategory = category === "all" || item.category === category;
          const byFav = !favoriteOnly || favoriteIds.includes(item.id);
          return byKeyword && byCategory && byFav;
        });
      }, [keyword, category, favoriteOnly, favoriteIds]); // 이 중 하나 바뀔 때만 재계산
      // JSX 안에서 매 렌더 data.filter(...) 하던 걸 useMemo 로 옮긴 것
  - slug: usecallback-handler
    title: useCallback — memo 한 자식에 넘기는 핸들러
    source_type: generated_minimal
    language: jsx
    code: |
      const toggleFavorite = useCallback((id) => {
        setFavoriteIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
      }, []); // setState 함수형 업데이트라 의존성 불필요

      // <Item> 이 React.memo 로 감싸져 있을 때만 이게 실제 효과가 있다
      const Item = memo(function Item({ item, isFav, onToggle }) { /* ... */ });
  - slug: useref-scroll
    title: useRef — 검색창으로 스크롤 / 포커스
    source_type: generated_minimal
    language: jsx
    code: |
      const inputRef = useRef(null);

      const focusSearch = () => {
        inputRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      };
      // <input ref={inputRef} ... />
      // useRef 값 변경은 리렌더를 일으키지 않는다 (DOM 참조용)
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **`useState` / `useMemo` / `useCallback` / `useRef`** 4개 훅을 한 미션에서 목적에 맞게 쓴다.
- 상태를 **App이 단일 소유**하고 자식에 값+변경 함수를 내리는 구조로 검색·필터 UI를 만든다.
- JSX 안 `data.filter(...)` 를 **`useMemo`** 로 옮겨 재계산을 줄인다.
- `memo` 한 자식에 넘기는 핸들러를 **`useCallback`** 으로 고정한다.
- `useRef` 로 DOM(스크롤/포커스)을 조작한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `useMemo`/`useCallback` 문법과 의존성, `useRef` 의 DOM 참조, `memo` 의 얕은 비교
  (→ `react/optimization-and-refactoring/reducing-rerenders`).

<!-- section: dev_problem -->
## 미션 개요 — 개념 카드 검색/필터 앱

`data/data.json`(id·title·desc·category·level)을 화면에 카드로 보여 주고:

- **검색창**: `keyword` 로 title 필터
- **카테고리 버튼**: `all` / `concept` / `library` / `hook`
- **즐겨찾기**: 카드별 ★ 토글, "즐겨찾기만 보기" 스위치
- **검색창으로 이동** 버튼: 스크롤 + 포커스

이 요구를 4개 훅에 나눠 배정하는 게 미션의 핵심이다.

<!-- section: concept -->
## 1. 상태를 먼저 다 선언 (useState)

{{code: state-first}}

- 미션 매뉴얼이 강조하는 순서: **필요한 상태를 App에 전부 선언**하고 시작한다.
- 자식은 상태를 갖지 않고, `keyword`+`onKeywordChange`, `category`+`onChange` 처럼 내려받는다
  → "상태는 부모가 소유".

<!-- section: mechanism -->
## 2. useMemo — 파생 목록

{{code: usememo-filter}}

- 원래는 렌더 JSX 안에서 `data.filter(...)` 를 매번 돌렸다. 목록이 커지고 필터 조건이 늘면 낭비다.
- `useMemo(() => data.filter(...), [의존성들])` — **의존성이 바뀔 때만** 재계산.
- 의존성 배열에 필터에 쓰는 값(`keyword`, `category`, `favoriteOnly`, `favoriteIds`)을 **빠짐없이** 넣는다.
  하나 빠뜨리면 화면이 옛 결과에 멈춘다.

<!-- section: concept | title: useCallback -->
## 3. useCallback — 핸들러 참조 고정

{{code: usecallback-handler}}

- 카드(`Item`)가 많고 `memo` 로 감싸져 있으면, `onToggle` 이 매 렌더 새 함수라 `memo` 가 깨진다.
- `useCallback(fn, [])` 으로 참조 고정 → `memo` 가 살아 카드 리렌더가 준다.
- **`memo` 없이 `useCallback` 만 쓰면 효과가 거의 없다** — 세트로 쓴다.

<!-- section: concept | title: useRef -->
## 4. useRef — DOM 조작

{{code: useref-scroll}}

- "검색창으로 이동" = `inputRef.current.scrollIntoView()` + `focus()`.
- `useRef` 값 변경은 **리렌더를 일으키지 않는다**. 화면에 안 나오는 값(이전 값 저장, 타이머 id)이나
  DOM 핸들에 쓴다.

<!-- section: must_know -->
## 반드시 기억할 것

- **훅 배정**: 화면 바뀌는 값 → `useState` / 비싼 파생 목록 → `useMemo` /
  memo 자식에 주는 함수 → `useCallback` / DOM·비표시 값 → `useRef`.
- 상태는 App이 단일 소유, 자식엔 값+변경 함수.
- `useMemo`/`useCallback` 의존성 배열은 **참조하는 값을 전부** 넣는다. 빠지면 stale.
- `useCallback` 은 **`memo` 한 자식**과 짝일 때만 의미. 단독은 대체로 무의미.
- 배열 상태 토글은 불변으로: `prev.includes(id) ? prev.filter(...) : [...prev, id]`.
- 이건 **복습 미션**이다 — 훅을 억지로 다 쓰는 게 아니라 "이 요구엔 이 훅"을 고르는 연습.

<!-- section: experiment -->
## 미션 체크리스트

1. App에 4개 상태를 먼저 선언하고 `SearchForm`/`CategoryFilter` 를 값+콜백으로 연결하라.
2. 필터링을 JSX 안 `filter` 로 먼저 만든 뒤, `useMemo` 로 옮기고 의존성을 채워라.
3. 의존성 하나를 일부러 빼서 검색이 "멈추는" 것을 확인한 뒤 되돌려라.
4. 카드 `Item` 을 `memo` 로 감싸고 `toggleFavorite` 를 `useCallback` 으로 고정해, 카드 리렌더가 주는지 Profiler로 확인하라.
5. `useRef` + "검색창으로 이동" 버튼으로 스크롤 + 포커스를 구현하라.
6. `favoriteOnly` 스위치로 즐겨찾기만 보기를 토글하라.

<!-- section: check_question -->
## 이해 점검

1. 검색/카테고리/즐겨찾기 각 요구는 어떤 훅으로 푸나?
2. `useMemo` 의존성에 `favoriteIds` 를 빼면 어떤 증상이 나오나?
3. `useCallback` 을 썼는데 카드 리렌더가 안 줄었다. 무엇을 안 한 것인가?
4. `useRef` 값을 바꿔도 화면이 안 바뀌는 이유는? 그게 왜 이 용도에 맞나?
5. 배열 상태(`favoriteIds`)에서 id를 토글하는 불변 코드는?

<!-- section: interview_question -->
## 면접 대비

- "`useMemo` 와 `useCallback` 을 각각 언제 써야 하고, 언제 쓰면 안 되나요?"
- "의존성 배열을 잘못 관리하면 생기는 stale closure 문제를 설명해 주세요."
- "`useState` 와 `useRef` 로 값을 들고 있을 때의 차이는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 훅 배정 규칙(state/useMemo/useCallback/useRef), 상태 단일 소유, useMemo 의존성 전부 넣기,
> useCallback은 memo와 세트, useRef는 리렌더 없음을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**Mission 8은 "이 요구엔 이 훅"을 고르는 복습이다 — 화면 값은 `useState`, 비싼 필터 목록은 `useMemo`,
memo 자식에 주는 핸들러는 `useCallback`, 스크롤·포커스는 `useRef`, 상태는 App이 단일 소유한다.**
