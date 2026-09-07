---
id: design-and-planning/design-to-code/detail-page-linking
chapter: design-and-planning/design-to-code
title: 목록에서 상세페이지로 연결하기
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [design-to-code, routing, list-detail]
related_material_ids:
  - 1QFb547W5eflOP4BdA7DSkOKWTn4BOAEsW7Xsxv6bQJE   # 서브페이지_연결(상세페이지) — URLSearchParams, find, 잘못된 접근 방어
prerequisites:
  - design-and-planning/design-to-code/coding-from-a-reference
  - javascript/async-and-http/fetch-and-ajax
code_examples:
  - slug: list-link
    title: 목록 — 각 항목에 id를 붙인 링크
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const res = await fetch("./data/products.json");
      const { products } = await res.json();

      document.querySelector(".product-grid").innerHTML = products
        .map((p) => `
          <article class="product-card">
            <img src="${p.thumbnail}" alt="${p.title}" loading="lazy" />
            <h3><a href="./product_detail.html?id=${p.id}">${p.title}</a></h3>
            <strong>${p.price.toLocaleString()}원</strong>
          </article>`)
        .join("");
      // 링크 목적지에 ?id=<고유값> 을 심는다 (경로 파라미터 /detail/1 도 가능 — SPA 라우터일 때)
  - slug: detail-read
    title: 상세 — URL에서 id를 읽어 한 건 표시
    source_type: generated_minimal
    language: js
    code: |
      // product_detail.html?id=3
      const params = new URLSearchParams(location.search);
      const id = params.get("id");            // "3" (문자열)

      if (!id) { alert("잘못된 접근입니다."); location.href = "./index.html"; }

      const { products } = await (await fetch("./data/products.json")).json();
      const product = products.find((p) => p.id === Number(id)); // 타입 맞추기!

      if (!product) { alert("존재하지 않는 상품입니다."); location.href = "./index.html"; return; }
      render(product);
  - slug: why-no-restpath
    title: 정적 JSON에는 /products.json/3 이 안 되는 이유
    source_type: generated_minimal
    language: text
    code: |
      fetch("./data/products.json/3")  → 그런 파일 경로는 없다 → 404
      products.json 은 "파일" 이지 서버 API 가 아니다. "/3" 을 해석할 주체가 없다.
      => 정적 파일이면: 전체를 받아 클라에서 .find() 로 거른다.
         진짜 REST(/products/3)가 필요하면 서버(Express) 또는 json-server 가 필요.
  - slug: related
    title: 관련 상품 — 같은 카테고리, 자기 자신 제외
    source_type: generated_minimal
    language: js
    code: |
      const related = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 목록의 각 항목에 **고유 id를 심은 링크**(`?id=` 또는 `/detail/:id`)를 만든다.
- 상세 화면에서 **URL의 id를 읽어**(`URLSearchParams`) 데이터에서 한 건을 찾아 렌더한다.
- **잘못된 접근**(id 없음, 없는 id)을 방어한다.
- 정적 JSON 파일에는 `/products.json/3` 같은 REST 경로가 안 된다는 것과 그 이유를 안다.
- 관련 항목(같은 카테고리, 자기 제외)을 표시한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- `fetch` + `.json()`, 배열 `.map()`/`.find()`/`.filter()`, `location.search`.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

목록만 있고 상세가 없으면 반쪽이다. 상세를 만들려고 화면을 100개 복사할 수는 없다.
**한 개의 상세 화면 + URL의 id** 로 어떤 항목이든 보여줘야 한다.

<!-- section: concept -->
## 1. 목록 → 링크

{{code: list-link}}

- 목록을 데이터로 렌더하면서 각 링크에 **그 항목의 고유값(id)** 을 심는다.
- 순수 정적 페이지면 `product_detail.html?id=3`, SPA 라우터면 `/detail/3`.

<!-- section: mechanism -->
## 2. 상세 — id 읽어서 찾기

{{code: detail-read}}

- `new URLSearchParams(location.search).get("id")` → **항상 문자열**. 데이터의 `id` 가 숫자면
  `Number(id)` 로 타입을 맞춘다(`"3" === 3` 은 `false`).
- **방어 2가지**: id 파라미터가 아예 없을 때, 있지만 매칭되는 항목이 없을 때(직접 URL 입력, 삭제된 항목).
- 의존 배열/재조회는 (SPA면) 라우트 파라미터가 바뀔 때.

<!-- section: concept | title: 정적 파일의 한계 -->
## 3. 정적 JSON에 REST 경로가 안 되는 이유

{{code: why-no-restpath}}

`products.json` 은 파일이지 API가 아니다. `/products.json/3` 을 해석할 서버 로직이 없어 404다.
정적이면 **전체를 받아 클라에서 `.find()`**. 진짜 `/products/3` REST가 필요하면
서버(Express) 또는 `json-server` 를 둔다.

<!-- section: concept | title: 관련 상품 -->
## 4. 관련 항목

{{code: related}}

<!-- section: must_know -->
## 반드시 기억할 것

- 목록 링크에 **항목 고유 id**를 심는다(`?id=` / `/detail/:id`).
- 상세는 URL에서 id를 읽어(`URLSearchParams`) 데이터에서 `.find()`. **타입 일치**(`Number(id)`).
- 방어 2가지: **id 파라미터 없음**, **매칭 항목 없음** → 안내 후 홈으로.
- 정적 JSON은 파일이라 `/x.json/3` 이 404 — 전체 받아 클라에서 거른다. 진짜 REST는 서버 필요.
- 관련 항목: 같은 카테고리 + **자기 자신 제외** + 개수 제한(`.slice`).
- `<img>` 에 `alt`, `loading="lazy"` 는 목록에서 특히 중요(이미지 많음).

<!-- section: experiment -->
## 직접 해 보기

1. `products.json` 으로 목록을 렌더하고 각 카드에 `?id=` 링크를 붙여라.
2. `product_detail.html` 에서 `id` 를 읽어 해당 상품을 표시하라.
3. `products.find(p => p.id === id)` (Number 없이)로 매칭이 안 되는 걸 확인한 뒤 `Number(id)` 로 고쳐라.
4. `?id=` 없이 / `?id=999999` 로 접속해 두 방어가 각각 동작하는지 확인하라.
5. 상세 하단에 같은 카테고리 관련 상품 4개(자기 제외)를 표시하라.
6. `fetch("./data/products.json/1")` 을 시도해 404를 확인하고 왜인지 설명하라.

<!-- section: check_question -->
## 이해 점검

1. 목록 링크에 무엇을 심어야 상세에서 항목을 특정할 수 있나?
2. `URLSearchParams` 로 읽은 값의 타입은? 왜 문제가 될 수 있나?
3. 상세 화면에서 방어해야 할 두 가지 잘못된 접근은?
4. `/products.json/3` 이 404인 이유는? 대안은?
5. 관련 상품에서 자기 자신을 왜, 어떻게 제외하나?

<!-- section: interview_question -->
## 면접 대비

- "목록-상세 패턴에서 URL 설계(쿼리 vs 경로 파라미터)를 어떻게 하나요?"
- "정적 사이트와 API 서버에서 단건 조회가 어떻게 달라지나요?"
- "URL로 직접 접근하는 상세 페이지의 예외 처리는?"

<!-- section: digest_prompt -->
## 복습용 요약 프롬프트

> 목록 링크에 id 심기, 상세는 URLSearchParams + find(Number 타입 맞춤), 방어(id 없음/매칭 없음),
> 정적 JSON은 /x.json/3 불가(전체 받아 find), 관련 항목(카테고리·자기 제외)을 각각 한 줄로.

<!-- section: review -->
## 한 줄 정리

**목록 각 항목에 고유 id를 심은 링크를 만들고, 상세는 `URLSearchParams` 로 id를 읽어(타입 맞춰)
데이터에서 `.find()` 하며 id 없음·매칭 없음을 방어한다 — 정적 JSON은 파일이라 `/x.json/3` 이 불가하므로
전체를 받아 클라에서 거른다.**
