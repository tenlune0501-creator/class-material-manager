---
id: javascript/ui-implementation-patterns/calendar-grid
chapter: javascript/ui-implementation-patterns
title: 달력 그리드 만들기
mastery: practical
lesson_kind: lesson
estimated_minutes: 55
tags: [javascript, calendar, date, grid, ui]
related_material_ids:
  - 1CIn7DIpQ75B75uQE0mCGTevqzKfWYGul              # calendar_grid_js_base.zip
prerequisites:
  - javascript/dom-and-events/selecting-and-manipulating
  - javascript/objects-and-builtins/builtin-objects
code_examples:
  - slug: date-math
    title: 필요한 날짜 계산 3가지
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // month 는 0-based (0 = 1월)
      const firstDay = new Date(year, month, 1).getDay();        // 그 달 1일의 요일 (0=일)
      const daysInMonth = new Date(year, month + 1, 0).getDate();// "다음 달 0일" = 이번 달 말일
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      // 이전 달로 이동 (12월↔1월 경계는 Date 가 알아서 처리)
      function prevMonth(y, m) { return m === 0 ? [y - 1, 11] : [y, m - 1]; }
      function nextMonth(y, m) { return m === 11 ? [y + 1, 0] : [y, m + 1]; }
  - slug: build-cells
    title: 6주 x 7칸 = 42칸 생성 (앞뒤 채우기)
    source_type: generated_minimal
    language: js
    code: |
      function buildCells(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const total = new Date(year, month + 1, 0).getDate();
        const prevTotal = new Date(year, month, 0).getDate();
        const cells = [];

        for (let i = firstDay - 1; i >= 0; i--)                 // 앞: 이전 달 꼬리
          cells.push({ day: prevTotal - i, cur: false });
        for (let d = 1; d <= total; d++)                        // 이번 달
          cells.push({ day: d, cur: true });
        while (cells.length % 7 !== 0 || cells.length < 42)     // 뒤: 다음 달 머리 (6줄 고정)
          cells.push({ day: cells.length - firstDay - total + 1, cur: false });

        return cells;
      }
  - slug: render
    title: 렌더 — DocumentFragment + data-date
    source_type: generated_minimal
    language: js
    code: |
      const state = { y: 2026, m: 8, selected: null };   // m: 0-based → 9월

      function render() {
        label.textContent = `${state.y}-${String(state.m + 1).padStart(2, "0")}`;
        const frag = document.createDocumentFragment();
        for (const c of buildCells(state.y, state.m)) {
          const el = document.createElement("button");
          el.textContent = c.day;
          el.className = "cell" + (c.cur ? "" : " muted");
          if (c.cur) {
            const iso = `${state.y}-${String(state.m + 1).padStart(2,"0")}-${String(c.day).padStart(2,"0")}`;
            el.dataset.date = iso;
            if (iso === todayISO()) el.classList.add("today");
            if (iso === state.selected) el.setAttribute("aria-pressed", "true");
          } else {
            el.disabled = true;
          }
          frag.append(el);
        }
        daysBox.replaceChildren(frag);
      }
  - slug: interact
    title: 이동·선택 — 위임
    source_type: generated_minimal
    language: js
    code: |
      prevBtn.addEventListener("click", () => { [state.y, state.m] = prevMonth(state.y, state.m); render(); });
      nextBtn.addEventListener("click", () => { [state.y, state.m] = nextMonth(state.y, state.m); render(); });

      daysBox.addEventListener("click", (e) => {
        const cell = e.target.closest(".cell[data-date]");
        if (!cell) return;
        state.selected = cell.dataset.date;
        render();
        onSelect?.(state.selected);
      });
      // 키보드: 화살표로 날짜 이동(±1/±7), Enter 로 선택 — 그리드에 roving tabindex
  - slug: gotcha
    title: 흔한 함정
    source_type: generated_minimal
    language: js
    code: |
      // 1) month 0-based: "9월" 은 8. 표시할 땐 +1
      // 2) new Date(y, m, 0) = 이전 달 마지막 날 (말일 구하기 관용구)
      // 3) 시간대: new Date("2026-09-07") 는 UTC 자정 → 로컬에서 하루 밀릴 수 있다.
      //    날짜만 다룰 땐 y/m/d 숫자로 비교하거나 "YYYY-MM-DD" 문자열로 비교
      // 4) 요일 시작(일요일 vs 월요일)은 옵션으로: (getDay() + 7 - startDow) % 7
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `Date` 로 **1일의 요일**, **그 달 말일**(`new Date(y, m+1, 0)`), 이전/다음 달 이동을 계산한다.
- 앞뒤를 이전/다음 달 날짜로 채워 **42칸(6주) 고정** 그리드를 만든다.
- `DocumentFragment` + `data-date` 로 렌더하고, 오늘/선택 상태를 클래스·ARIA 로 표시한다.
- 월 이동·날짜 선택을 이벤트 위임으로 처리하고 키보드 이동을 붙인다.
- `month` 0-based, 시간대(UTC 파싱), 요일 시작 옵션 같은 함정을 피한다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- DOM 생성·`DocumentFragment`, `Date` 객체 기본, 이벤트 위임.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- `month` 를 1-based 로 착각해 한 달씩 어긋난다.
- 말일을 구하려고 "2월은 28 또는 29..." 를 직접 분기한다.
- 그리드 줄 수가 달마다 달라져(4~6줄) 레이아웃이 출렁인다.
- `new Date("2026-09-07")` 로 비교하다 시간대 때문에 하루 밀린다.

<!-- section: concept -->
## 날짜 계산

{{code: date-math}}

- **`month` 는 0-based** (0 = 1월). 화면 표시할 때만 `+1`.
- 관용구: **`new Date(y, m + 1, 0)`** = "다음 달 0일" = 이번 달 **말일**. `.getDate()` 로 일수.
- `new Date(y, m, 1).getDay()` = 1일의 요일(0 = 일요일).
- 12↔1월 경계는 `Date` 가 자동 처리하지만, 우리가 `y/m` 숫자만 관리하면 `prevMonth`/`nextMonth` 헬퍼가 깔끔하다.

<!-- section: mechanism -->
## 42칸 그리드

{{code: build-cells}}

- **앞**: 1일 요일만큼 이전 달 꼬리 날짜. **가운데**: 이번 달 1~말일. **뒤**: 42칸(6주) 채울 때까지 다음 달 머리.
- 6주 고정 → 달이 바뀌어도 그리드 높이가 안 변한다.

{{code: render}}

- `state`(y, m, selected) 하나. `render()` 가 `buildCells` → `DocumentFragment` 로 42개 셀 생성 → `replaceChildren`.
- 이번 달 셀만 `data-date`(ISO) + 클릭 가능, 나머지는 `muted` + `disabled`.
- 오늘은 `.today`, 선택된 날은 `aria-pressed="true"`.

{{code: interact}}

- 이전/다음 버튼은 `prevMonth`/`nextMonth` 후 `render`. 날짜 선택은 `daysBox` 에 **위임** + `closest(".cell[data-date]")`.
- 키보드: 화살표로 ±1/±7일 이동, Enter 선택. 그리드는 roving tabindex(한 셀만 `tabindex=0`).

{{code: gotcha}}

- `month` 0-based, 말일 관용구, **문자열 파싱 시간대 함정**(날짜만이면 `y/m/d` 숫자나 `"YYYY-MM-DD"` 문자열 비교), 요일 시작 옵션.

<!-- section: must_know -->
## 반드시 기억할 것

- `month` **0-based**. 말일 = `new Date(y, m+1, 0).getDate()`. 1일 요일 = `new Date(y, m, 1).getDay()`.
- 앞(이전 달 꼬리) + 이번 달 + 뒤(다음 달 머리) = **42칸 6주 고정**.
- `state`(y/m/selected) + `render()` (`DocumentFragment` + `data-date`). 오늘/선택은 클래스·ARIA.
- 이동·선택은 **이벤트 위임**. 키보드 화살표 이동.
- `new Date("YYYY-MM-DD")` 는 UTC 파싱 → 날짜 비교는 숫자/문자열로.

<!-- section: mission -->
## 미션 — 날짜 선택 달력

calendar grid Base(HTML/CSS 제공)를 재료로.

- `calendar(rootSel, { startDow = 0, onSelect })` : `state`(y/m/selected), `render()`, 이전/다음, 오늘 버튼.
- 42칸 고정, 이전/다음 달 날짜는 흐리게 + 비활성. 오늘 강조, 선택 강조(`aria-pressed`).
- 상단 라벨 "YYYY년 M월". 요일 헤더는 `startDow` 옵션(일/월 시작).
- 클릭·키보드(화살표 ±1/±7, Enter, PageUp/Down 로 월 이동) 선택. 그리드 roving tabindex.
- 특정 날짜 배열(`events`)을 받아 해당 셀에 점 표시.
- `new Date("...")` 파싱으로 하루 밀리는 케이스를 재현하고 숫자 비교로 고치기.

<!-- section: check_question -->
## 이해 점검

1. 이번 달 말일을 한 줄로 구하는 방법은?
2. `month` 가 0-based 라서 생기는 흔한 버그와 대응은?
3. 그리드를 42칸 고정으로 하는 이유는?
4. `new Date("2026-09-07")` 로 날짜를 비교하면 왜 위험한가?

<!-- section: interview_question -->
## 면접 대비

- "달력 UI 를 구현할 때 날짜 계산에서 조심할 점은?"
- "달력에 키보드 접근성을 어떻게 넣나요? (roving tabindex, grid role)"
- "date-fns/Day.js 같은 라이브러리를 언제 쓰나요?"

<!-- section: review -->
## 한 줄 정리

**`new Date(y, m+1, 0)` 로 말일을, `getDay()` 로 1일 요일을 구해 앞뒤를 채운 42칸 고정 그리드를 `state`+`render()` 로 그리고,
이동·선택은 이벤트 위임+키보드로 하며, `month` 0-based 와 문자열 파싱 시간대 함정을 피한다.**

<!-- section: next -->
## 다음 Chapter

`javascript/jquery` — 레거시 코드를 읽기 위한 jQuery.
