---
id: javascript/ui-implementation-patterns/filtering-and-pagination
chapter: javascript/ui-implementation-patterns
title: 필터와 페이지네이션
mastery: practical
lesson_kind: lesson
estimated_minutes: 55
tags: [javascript, filter, pagination, ui]
related_material_ids:
  - 1l4lpnBwi2kODMxmlB3noONNS5sWrpENW
  - 10kj1r4rA1hrzM6FiSYhrBh0ngLs5B8ri
  - 1cvet9qugHhHJ2kmbqkCnHGGDG4H9wn-M
  - 1Lz4__eRVWJtXdl_VJHXUNDIhzLtCmHHk
prerequisites:
  - javascript/objects-and-builtins/array-methods
  - javascript/dom-and-events/events-and-delegation
code_examples:
  - slug: pipeline
    title: 데이터 → 필터 → 정렬 → 페이지 → 렌더 (단방향)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const ALL = [...];                    // 원본은 절대 안 바꾼다
      const state = { filter: "*", sort: "asc", page: 1, perPage: 6 };

      function view() {
        let rows = ALL;
        if (state.filter !== "*") rows = rows.filter((p) => p.cat === state.filter);
        rows = [...rows].sort(SORTERS[state.sort]);          // 복사본을 정렬
        const pages = Math.max(1, Math.ceil(rows.length / state.perPage));
        state.page = Math.min(state.page, pages);
        const start = (state.page - 1) * state.perPage;
        return { rows: rows.slice(start, start + state.perPage), pages, total: rows.length };
      }
      function update(patch) { Object.assign(state, patch); render(view()); }
  - slug: dom-vs-data
    title: 두 가지 방식 — DOM 숨기기 vs 데이터에서 렌더
    source_type: generated_minimal
    language: js
    code: |
      // (A) 이미 있는 DOM 을 보이고/숨기기 — 항목이 적고 이미 마크업이 있을 때
      items.forEach((li) => { li.hidden = filterName !== "*" && !li.matches(filterName); });

      // (B) 데이터 배열에서 매번 렌더 — 정렬·페이지·검색이 얽히면 이 편이 깔끔
      list.replaceChildren(...rows.map(toCard));
      // 정렬 시 innerHTML="" 후 재삽입하는 옛 코드 → replaceChildren + map 으로
  - slug: sorters
    title: 정렬 함수 테이블
    source_type: generated_minimal
    language: js
    code: |
      const SORTERS = {
        asc:  (a, b) => a.order - b.order,
        desc: (a, b) => b.order - a.order,
        price: (a, b) => a.price - b.price,
        name: (a, b) => a.name.localeCompare(b.name, "ko"),
        random: () => Math.random() - 0.5,
      };
      // NodeList 는 sort 불가 → [...nodes] 로 배열화 후 정렬
  - slug: pager
    title: 페이지네이션 UI + URL 동기화
    source_type: generated_minimal
    language: js
    code: |
      function renderPager(page, pages) {
        pagerEl.replaceChildren(
          ...Array.from({ length: pages }, (_, i) => {
            const b = document.createElement("button");
            b.textContent = i + 1;
            b.setAttribute("aria-current", i + 1 === page ? "page" : "false");
            b.dataset.page = i + 1;
            return b;
          })
        );
      }
      pagerEl.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-page]");
        if (b) update({ page: +b.dataset.page });
      });
      // 상태를 쿼리스트링에 반영: history.replaceState(null,"",`?cat=${f}&sort=${s}&page=${p}`)
      // → 새로고침·공유해도 같은 화면
  - slug: search-debounce
    title: 검색 입력 — 디바운스
    source_type: generated_minimal
    language: js
    code: |
      searchEl.addEventListener("input", debounce((e) => {
        update({ q: e.target.value.trim().toLowerCase(), page: 1 });  // 검색 바뀌면 1페이지로
      }, 250));
      // view() 안에서: rows = rows.filter(p => p.name.toLowerCase().includes(state.q))
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- **원본 데이터는 불변**으로 두고 `데이터 → 필터 → 정렬 → 페이지 → 렌더` 단방향 파이프라인을 만든다.
- "DOM 숨기기" 방식과 "데이터에서 렌더" 방식의 트레이드오프를 안다.
- 정렬은 함수 테이블로, NodeList 는 배열화 후 `sort`.
- 페이지네이션 UI 를 이벤트 위임으로 만들고 상태를 쿼리스트링에 동기화한다.
- 검색 입력은 디바운스하고, 조건이 바뀌면 1페이지로 되돌린다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 배열 메서드(`filter`/`sort`/`slice`/`map`), 이벤트 위임, 디바운스(`timers`).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 정렬하면서 `products` 원본 배열을 `sort` 로 바꿔 필터 결과가 오염된다.
- 필터·정렬·페이지가 서로를 덮어써서 조합이 안 맞는다.
- 3페이지에서 필터를 바꿨더니 빈 화면(그 필터엔 3페이지가 없음).
- 새로고침하면 필터가 초기화된다.

<!-- section: concept -->
## 단방향 파이프라인

{{code: pipeline}}

- `state`(filter/sort/page/q)만 바꾸고 `view()` 가 **원본 → 필터 → 정렬(복사본) → 페이지 슬라이스** 를 계산해 돌려준다.
- 원본 `ALL` 은 절대 변형하지 않는다. `sort` 는 `[...rows].sort(...)`.
- `page` 는 계산된 총 페이지 수로 clamp → "없는 페이지" 방지.

<!-- section: mechanism -->
## DOM 숨기기 vs 데이터 렌더

{{code: dom-vs-data}}

- **(A) DOM 숨기기** — 항목이 적고 서버에서 이미 마크업을 받은 경우. `hidden`/`classList` 로 표시 전환.
- **(B) 데이터에서 렌더** — 정렬·페이지·검색이 얽히면 이쪽이 훨씬 명료. `replaceChildren(...rows.map(toCard))`.
- 옛 필터 코드의 `innerHTML = ""` 후 재삽입 → `replaceChildren` + `map` 으로 정리.

{{code: sorters}}

- 정렬 규칙은 **객체 테이블**(`SORTERS[state.sort]`). `localeCompare(x, "ko")` 로 한글 정렬.

{{code: pager}}

- 페이지 버튼은 총 페이지 수만큼 생성, **이벤트 위임** + `data-page`, 현재 페이지에 `aria-current="page"`.
- 상태를 `?cat=&sort=&page=` 로 `history.replaceState` → 새로고침·공유해도 같은 화면.

{{code: search-debounce}}

- 검색은 `input` + 디바운스(250ms). 검색어가 바뀌면 `page: 1` 로.

<!-- section: must_know -->
## 반드시 기억할 것

- 원본 불변 + 단방향: **필터 → 정렬(복사본) → 페이지 슬라이스 → 렌더**. `state` 만 바꾸고 다시 계산.
- 조건이 바뀌면 `page` 를 총 페이지로 clamp, 검색·필터 변경 시 `page: 1`.
- NodeList 는 `[...]` 후 `sort`. 정렬 규칙은 함수 테이블.
- 페이지 버튼은 위임 + `data-page` + `aria-current`.
- 상태를 쿼리스트링에 동기화하면 새로고침·공유가 된다.

<!-- section: mission -->
## 미션 — 상품 목록 필터/정렬/페이지

filter 자료를 재료로 확장.

- 데이터 배열(카테고리·이름·가격·순번 12~30개). 원본 불변.
- 필터 버튼 + `<select>` (같은 로직), 정렬 5종(테이블), 검색(디바운스), 페이지네이션(perPage 6).
- `state` 하나 + `view()` + `render()`. 모든 조작은 `update(patch)` 를 통과.
- 결과 개수를 `aria-live` 영역에 표시("12개 중 6개"). 결과 0개 empty state.
- 상태를 쿼리스트링에 반영하고, 첫 로드 시 쿼리스트링에서 복원.
- 이벤트는 컨트롤 컨테이너 1~2개에 위임.

<!-- section: check_question -->
## 이해 점검

1. 정렬할 때 원본 배열을 `sort` 하면 왜 문제인가?
2. "DOM 숨기기" 와 "데이터에서 렌더" 중 검색·정렬·페이지가 얽히면 어느 쪽이 나은가?
3. 3페이지에서 결과가 5개로 줄면 `page` 를 어떻게 처리하나?
4. 새로고침해도 필터가 유지되게 하려면?

<!-- section: interview_question -->
## 면접 대비

- "필터·정렬·페이지네이션 상태를 어떻게 관리하나요?"
- "클라이언트 페이지네이션과 서버 페이지네이션의 차이와 선택 기준은?"
- "React 라면 이 파이프라인을 어떻게 옮기나요? (파생 상태 = 렌더 중 계산)"

<!-- section: review -->
## 한 줄 정리

**원본을 불변으로 두고 `state` 만 바꿔 `필터→정렬(복사본)→페이지 슬라이스→렌더` 를 다시 계산하며,
조건 변경 시 페이지를 보정하고 정렬은 함수 테이블·페이저는 위임·상태는 쿼리스트링에 동기화한다.**

<!-- section: next -->
## 다음 Lesson

`ui-implementation-patterns/skeleton-ui-and-number-animation` — 로딩 UX 와 카운트업.
