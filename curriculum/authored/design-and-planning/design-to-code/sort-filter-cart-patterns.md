---
id: design-and-planning/design-to-code/sort-filter-cart-patterns
chapter: design-and-planning/design-to-code
title: 정렬·필터·장바구니 화면 패턴
mastery: practical
lesson_kind: lesson
estimated_minutes: 70
tags: [design-to-code, sorting, filter, cart, ecommerce]
related_material_ids:
  - 1hCQl-_87H6K3EtODs1_Ds7PiBueP2RoRKUxLJh_JgPQ   # 인기순 sorting (sort 비교 함수)
  - 1ZPW1DgdtI0TNAni3m6LU-wlDFDhpawV-tFzZd4TRQFM   # 장바구니
  - 1Qgm1rfMo12mUiMJtK7uF_HrdcMa8_NRUCx-mB-rRq7c   # 카테고리 필터
  - 13qd38LBHTXG4UaiVKHKRb3fVlcKGDrMo              # products.json
prerequisites:
  - design-and-planning/design-to-code/detail-page-linking
  - javascript/ui-implementation-patterns/filtering-and-pagination
code_examples:
  - slug: pipeline
    title: 원본 → 필터 → 정렬 → 페이지 → 렌더 (단방향)
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const ALL = (await (await fetch("./data/products.json")).json()).products; // 원본은 안 바꾼다
      const state = { category: "all", brand: "all", sort: "popular", page: 1, perPage: 12 };

      function view() {
        let rows = ALL;
        if (state.category !== "all") rows = rows.filter((p) => p.category === state.category);
        if (state.brand !== "all")    rows = rows.filter((p) => p.brand === state.brand);
        rows = [...rows].sort(SORTERS[state.sort]);           // 복사본을 정렬
        const pages = Math.max(1, Math.ceil(rows.length / state.perPage));
        state.page = Math.min(state.page, pages);
        const start = (state.page - 1) * state.perPage;
        return { rows: rows.slice(start, start + state.perPage), pages, total: rows.length };
      }
      function update(patch) { Object.assign(state, patch); render(view()); }
      // 필터/정렬이 바뀌면 page 를 1 로 리셋: update({ category, page: 1 })
  - slug: sorters
    title: 정렬 비교 함수
    source_type: generated_minimal
    language: js
    code: |
      const SORTERS = {
        popular:  (a, b) => b.rating - a.rating,                       // 내림차순 = b - a
        newest:   (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        priceAsc: (a, b) => a.price - b.price,                         // 오름차순 = a - b
        priceDesc:(a, b) => b.price - a.price,
      };
      // 비교 함수: 음수 → a 먼저, 양수 → b 먼저, 0 → 유지.  "a - b" 오름차순 / "b - a" 내림차순
  - slug: filter-options
    title: 필터 옵션은 데이터에서 생성
    source_type: generated_minimal
    language: js
    code: |
      const categories = ["all", ...new Set(ALL.map((p) => p.category))]; // 중복 제거
      selectEl.innerHTML = categories.map((c) => `<option value="${c}">${c}</option>`).join("");
      // 옵션을 하드코딩하지 않는다 → 데이터가 늘어도 자동 반영
  - slug: cart
    title: 장바구니 — 상태 + localStorage
    source_type: generated_minimal
    language: js
    code: |
      const KEY = "cart";
      const readCart  = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { return []; } };
      const writeCart = (c) => localStorage.setItem(KEY, JSON.stringify(c));

      function addToCart(product, qty = 1) {
        const cart = readCart();
        const line = cart.find((l) => l.id === product.id);
        if (line) line.qty += qty;                          // 이미 있으면 수량만 +
        else cart.push({ id: product.id, title: product.title, price: product.price, qty });
        writeCart(cart);
        updateCartCount();                                  // 헤더 뱃지 갱신
      }
      const cartTotal = (cart) => cart.reduce((sum, l) => sum + l.price * l.qty, 0);
      // 학습용: 재고·가격은 저장 시점 값. 실제 커머스는 결제 시 서버에서 재검증.
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 커머스 목록 화면의 **원본 → 필터 → 정렬 → 페이지 → 렌더** 단방향 파이프라인을 만든다.
- `sort()` 비교 함수(`a-b` 오름 / `b-a` 내림)로 인기순·최신순·가격순을 구현한다.
- 필터 옵션을 **데이터에서 생성**한다(하드코딩 X).
- **장바구니**를 상태 + `localStorage` 로 구현하고, 수량 합치기·합계·헤더 뱃지를 처리한다.
- 학습용 최소 구현과 실제 커머스(서버 재검증)의 경계를 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 바닐라 필터/페이지네이션, `fetch`, 배열 메서드, `localStorage`, 목록-상세 연결(앞 Lesson).

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

카테고리 클릭, 정렬 변경, 페이지 이동, 장바구니 담기 — 이걸 각각 즉흥으로 DOM을 조작하면
서로 꼬인다("필터했더니 페이지가 이상한 데 가 있음", "정렬이 필터 전 목록에 적용됨").

<!-- section: concept -->
## 1. 단방향 파이프라인

{{code: pipeline}}

- **원본(`ALL`)은 절대 안 바꾼다.** 매번 원본에서 시작해 필터 → 정렬(복사본) → 슬라이스.
- 상태(`state`)는 한 객체에 모으고, `update(patch)` 하나로만 바꾼 뒤 다시 그린다.
- **필터/정렬이 바뀌면 `page: 1` 로 리셋** — 안 그러면 5페이지 보다가 필터해서 결과가 2페이지뿐인데 5페이지에 머문다.

<!-- section: mechanism -->
## 2. 정렬

{{code: sorters}}

- 비교 함수: 음수면 `a` 먼저, 양수면 `b` 먼저. **`a - b` 오름차순**, **`b - a` 내림차순**.
- 날짜는 `new Date(x) - new Date(y)` (Date 뺄셈 = ms 차이).
- **`sort()` 는 원본을 변형**하므로 `[...rows].sort(...)` 로 복사본을 정렬.

<!-- section: concept | title: 필터 옵션 -->
## 3. 필터 옵션은 데이터에서

{{code: filter-options}}

`<option>` 을 손으로 나열하면 상품이 늘 때마다 고쳐야 한다. `new Set` 으로 데이터에서 뽑는다.

<!-- section: concept | title: 장바구니 -->
## 4. 장바구니

{{code: cart}}

- 장바구니 = 배열(라인 아이템). **이미 있는 상품이면 수량만 증가**, 없으면 새 라인.
- `localStorage` 로 새로고침에도 유지. 읽기는 `try/catch`(깨진 값 대비).
- 합계는 `reduce`. 헤더의 개수 뱃지는 담을 때마다 갱신.
- **학습용 최소 구현 경계**: 담을 때의 가격·재고를 저장한다. 실제 커머스는 **결제 시 서버에서
  가격·재고·쿠폰을 재검증**한다(클라 값 신뢰 불가). 여기서는 그 흐름 연습까지만.

<!-- section: must_know -->
## 반드시 기억할 것

- **원본 불변.** 매번 원본 → 필터 → 정렬(복사본) → 슬라이스 → 렌더. 상태는 한 객체 + `update()`.
- **필터/정렬 변경 시 `page` 를 1로 리셋.**
- `sort` 비교: `a-b` 오름 / `b-a` 내림. 날짜는 `Date` 뺄셈. `[...arr].sort()` (원본 보호).
- 필터 옵션(`<option>`)은 **데이터에서 `new Set`** 으로 생성.
- 장바구니는 라인 아이템 배열 + `localStorage`(try/catch). 중복 상품은 수량 합산.
- 장바구니 가격·재고는 **결제 시 서버 재검증** — 클라 저장값을 신뢰하지 않는다(운영).

<!-- section: experiment -->
## 직접 해 보기

1. `products.json` 으로 목록을 그리고 `state` + `view()` + `update()` 파이프라인을 만들어라.
2. 카테고리/브랜드 `<select>` 옵션을 `new Set` 으로 데이터에서 생성하라.
3. 정렬 `<select>`(인기·최신·가격↑·가격↓) 4개를 `SORTERS` 로 구현하라. 날짜가 다 같으면 최신순이 안 되는 것을 확인하고 데이터의 `createdAt` 을 분산시켜라.
4. 5페이지를 보다가 필터를 바꿔 결과가 줄었을 때 `page` 리셋을 넣기 전/후를 비교하라.
5. `addToCart` + `localStorage` 로 장바구니를 만들고, 같은 상품을 두 번 담아 수량이 2가 되는지, 새로고침 후에도 유지되는지 확인하라.
6. 헤더에 장바구니 개수 뱃지와 합계를 표시하라.

<!-- section: check_question -->
## 이해 점검

1. 왜 원본 배열을 직접 필터/정렬하지 않고 매번 원본에서 시작하나?
2. 필터를 바꿨는데 페이지를 리셋하지 않으면 어떤 버그가 나나?
3. `sort((a,b) => a - b)` 와 `(a,b) => b - a` 의 차이는? 날짜 정렬은?
4. `<option>` 을 하드코딩하면 안 되는 이유는?
5. 장바구니에 같은 상품을 또 담으면 어떻게 처리하나? 실제 커머스에서 가격/재고는 언제 다시 확인하나?

<!-- section: interview_question -->
## 면접 대비

- "필터·정렬·페이지네이션을 함께 다룰 때 상태를 어떻게 관리하나요?"
- "`Array.prototype.sort` 의 비교 함수 규약과 안정성(stable sort)을 설명해 주세요."
- "클라이언트 장바구니 상태와 서버 검증의 역할 분담은?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 원본 불변 + 필터→정렬(복사본)→슬라이스 + state/update, 필터 변경 시 page=1,
> sort a-b/b-a·Date 뺄셈, 옵션은 new Set, 장바구니=배열+localStorage·수량 합산·결제 시 서버 재검증을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**커머스 목록은 원본을 건드리지 않고 매번 필터 → 정렬(복사본) → 페이지 슬라이스 → 렌더의 단방향으로
그리며(필터·정렬 변경 시 page=1), 필터 옵션은 데이터에서 생성하고, 장바구니는 라인 아이템 배열 +
`localStorage`(중복은 수량 합산)로 두되 실제 커머스는 결제 시 서버에서 가격·재고를 재검증한다.**
