---
id: javascript/browser-apis-and-storage/timers
chapter: javascript/browser-apis-and-storage
title: 타이머 (setTimeout/setInterval)
mastery: required
lesson_kind: lesson
estimated_minutes: 30
tags: [javascript, timer, setTimeout, setInterval]
related_material_ids:
  - 1U2sMPS2lrlD_sUSX_vbHSUzkKlOqYVoY              # timer_v202605.zip
prerequisites:
  - javascript/functions-and-scope/callbacks-and-delayed-execution
code_examples:
  - slug: basic
    title: setTimeout / setInterval / clear
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      const id1 = setTimeout(() => console.log("3초 뒤 한 번"), 3000);
      clearTimeout(id1);        // 아직 안 울렸으면 취소

      const id2 = setInterval(() => console.log("0.5초마다"), 500);
      clearInterval(id2);       // 멈추지 않으면 계속 — 반드시 저장했다가 정리

      setTimeout(() => console.log("다음 tick"), 0);  // 0 이어도 "지금 즉시" 아님(큐 뒤로)
  - slug: countdown
    title: 카운트다운 — start / stop / reset
    source_type: generated_minimal
    language: js
    code: |
      const target = document.querySelector("#target");
      let current = 100;
      let timer = null;                 // 진행 중인 interval id (없으면 null)

      function start() {
        if (timer) return;              // 중복 시작 방지 (안 하면 타이머가 겹쳐 2배로 감소)
        timer = setInterval(() => {
          current -= 1;
          target.textContent = current;
          if (current <= 0) stop();
        }, 500);
      }
      function stop()  { clearInterval(timer); timer = null; }
      function reset() { stop(); current = 100; target.textContent = current; }
  - slug: drift
    title: setInterval 은 정확하지 않다 — 시계는 기준시각으로
    source_type: generated_minimal
    language: js
    code: |
      // ❌ 1초마다 +1 → 탭 비활성/렉이면 누적 오차(드리프트)
      let sec = 0;
      setInterval(() => { sec += 1; render(sec); }, 1000);

      // ✅ "시작 시각" 을 기준으로 매 tick 실제 경과를 계산
      const startAt = Date.now();
      const t = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startAt) / 1000);
        render(elapsed);
      }, 250);
  - slug: cleanup
    title: 정리 — 페이지/컴포넌트 떠날 때
    source_type: generated_minimal
    language: js
    code: |
      let timer = setInterval(tick, 1000);
      window.addEventListener("beforeunload", () => clearInterval(timer));

      // 애니메이션은 setInterval 보다 requestAnimationFrame
      let raf;
      function loop() { move(); raf = requestAnimationFrame(loop); }
      raf = requestAnimationFrame(loop);
      // 중지: cancelAnimationFrame(raf)
      // React 라면 useEffect 의 cleanup 에서 clearInterval / cancelAnimationFrame
  - slug: debounce
    title: setTimeout 활용 — 디바운스
    source_type: generated_minimal
    language: js
    code: |
      function debounce(fn, wait) {
        let id;
        return (...args) => {
          clearTimeout(id);
          id = setTimeout(() => fn(...args), wait);  // 마지막 호출 후 wait 만큼 잠잠하면 실행
        };
      }
      input.addEventListener("input", debounce((e) => search(e.target.value), 300));
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- `setTimeout`/`setInterval` 로 지연·반복 실행을 걸고, 반환된 **id 를 저장해 `clearTimeout`/`clearInterval`** 로 정리한다.
- start/stop/reset 카운트다운에서 **중복 시작 방지**와 정리를 구현한다.
- `setInterval` 이 정확한 시계가 아님(드리프트)을 알고, 경과 시간은 **기준 시각(`Date.now()`)** 으로 계산한다.
- 페이지/컴포넌트를 떠날 때 타이머를 정리하고, 애니메이션은 `requestAnimationFrame` 을 쓴다.
- `setTimeout` 으로 디바운스를 만든다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 콜백·화살표 함수, `callbacks-and-delayed-execution`, DOM.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- start 버튼을 두 번 누르면 `setInterval` 이 겹쳐 숫자가 2배로 줄어든다.
- `clearInterval` 을 안 해서 페이지를 벗어나도 타이머가 돌고 콘솔이 계속 찍힌다.
- 1초 타이머로 만든 시계가 5분 뒤 몇 초씩 어긋난다.
- 검색 input 이 글자마다 API 를 때린다.

<!-- section: concept -->
## 기본 — 걸고, 저장하고, 정리한다

{{code: basic}}

- `setTimeout(fn, ms)` — `ms` 뒤 **한 번**. `setInterval(fn, ms)` — `ms` 마다 **반복**.
- 둘 다 **id 를 반환** → `clearTimeout(id)` / `clearInterval(id)` 로 취소·중지.
- 지연은 "최소 대기"다. 콜 스택이 비어야 실행되므로 `0` 이어도 즉시는 아니다.

<!-- section: mechanism -->
## 카운트다운

{{code: countdown}}

- 진행 중인 타이머 id 를 변수(`timer`)에 담고, 없을 때(`null`)만 시작 → **중복 시작 방지**.
- stop 은 `clearInterval` + `timer = null`. reset 은 stop 후 값 복원.

### 정확도 — 드리프트

{{code: drift}}

- `setInterval(…, 1000)` 은 정확히 1초마다가 아니다(탭 비활성 시 느려지거나 밀린다). 누적하면 오차가 커진다.
- 시계·스톱워치는 **시작 시각을 저장**하고 매 tick 마다 `Date.now() - startAt` 로 **실제 경과**를 계산해 표시한다.

### 정리와 애니메이션

{{code: cleanup}}

- 페이지 이탈(`beforeunload`)이나 컴포넌트 언마운트 시 타이머를 정리하지 않으면 메모리·CPU 누수.
- 부드러운 애니메이션은 `setInterval` 대신 **`requestAnimationFrame`**(브라우저 프레임에 맞춰 호출, 비활성 탭에서 자동 정지).
- React: `useEffect` 의 cleanup 함수에서 `clearInterval`/`cancelAnimationFrame`.

### 디바운스

{{code: debounce}}

- "마지막 이벤트 후 일정 시간 잠잠하면 한 번 실행" — `setTimeout` + `clearTimeout` 조합. 검색어 입력, 리사이즈에.

<!-- section: must_know -->
## 반드시 기억할 것

- `setTimeout`(1회) / `setInterval`(반복). **id 저장 → `clear*` 로 정리**. `0` 지연도 즉시는 아님.
- 반복 타이머는 변수에 id 를 담아 **중복 시작 방지** + stop 시 `null` 로.
- `setInterval` 은 부정확 → 경과 시간은 `Date.now() - startAt` 로 계산.
- 이탈/언마운트 시 타이머 정리. 애니메이션은 `requestAnimationFrame`.
- 디바운스 = `setTimeout` + `clearTimeout`(마지막 호출만 실행).

<!-- section: mission -->
## 미션 — 스톱워치 + 디바운스 검색

timer Base 를 재료로.

- 카운트다운(100→0): start/stop/reset. 중복 start 방지, 0 에서 자동 정지.
- 스톱워치: `Date.now()` 기준으로 `mm:ss.cs` 표시(드리프트 없이). lap 기록.
- 페이지를 벗어날 때 모든 타이머 `clear`.
- 검색 input 에 `debounce(fn, 300)` 적용 → 콘솔에 실제 호출 횟수 비교(디바운스 전/후).
- (선택) 원형 진행바를 `requestAnimationFrame` 으로 그려 `setInterval` 버전과 부드러움 비교.

<!-- section: check_question -->
## 이해 점검

1. `setInterval` 을 멈추려면 무엇이 필요한가? 안 하면?
2. start 버튼 중복 클릭으로 타이머가 겹치는 걸 어떻게 막나?
3. 1초 `setInterval` 로 만든 시계가 어긋나는 이유와 해결책은?
4. 애니메이션에 `setInterval` 대신 무엇을 쓰고 왜?

<!-- section: interview_question -->
## 면접 대비

- "`setTimeout(fn, 0)` 은 언제 실행되나요? (이벤트 루프)"
- "디바운스와 스로틀의 차이와 각각의 사용처는?"
- "타이머를 정리하지 않으면 어떤 문제가 생기나요?"

<!-- section: review -->
## 한 줄 정리

**`setTimeout`/`setInterval` 은 id 를 저장해 `clear*` 로 정리하고 반복 타이머는 중복 시작을 막으며,
`setInterval` 은 부정확하니 경과는 `Date.now()` 기준으로 계산하고 애니메이션은 `requestAnimationFrame`, 입력 처리는 디바운스를 쓴다.**

<!-- section: next -->
## 다음 Chapter

`javascript/external-apis` — 지도·날씨·차트 같은 외부 API.
