---
id: momentalk/hangul-chosung-util
project: momentalk
title: 한글 초성 추출 — 유니코드 계산 순수 함수
unit_kind: feature
feature_area: 유틸리티
concepts: [순수 함수, 문자열/유니코드 처리, 배열 메서드, 테스트 용이성]
related_lessons:
  - javascript/language-basics/functions
  - javascript/objects-and-builtins/array-methods
  - react/testing/tdd-practice
---

<!-- section: role -->
## 이 코드가 하는 일

`src/lib/hangul.js` — 완성형 한글의 유니코드 코드포인트에서 **초성만 계산** 하는 순수 함수 두 개.
`toChosung("소개팅") → ["ㅅ", "ㄱ", "ㅌ"]`. 초성 퀴즈 게임이 이 함수를 쓴다.

<!-- section: code -->
## 핵심 코드 읽기

```js
const CHOSUNG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const HANGUL_START = 0xac00;              // '가'
const HANGUL_END = 0xd7a3;                // '힣'
const JUNG_JONG_COUNT = 21 * 28;          // 중성 21 × 종성 28

export function toChosung(word) {
  return [...word].map(char => {          // 전개로 "문자" 단위 순회
    const code = char.charCodeAt(0);
    if (code < HANGUL_START || code > HANGUL_END) return char;   // 한글 아니면 그대로
    return CHOSUNG[Math.floor((code - HANGUL_START) / JUNG_JONG_COUNT)];
  });
}
```

- 완성형 한글은 `(초성 index × 588) + (중성 × 28) + 종성` 규칙으로 코드포인트가 배치돼 있다.
- 그래서 `(code - '가') / 588` 의 몫이 초성 인덱스다.

<!-- section: why -->
## 왜 이렇게 했나

- **순수 함수**: 입력만으로 출력이 정해지고 부수효과가 없다 → 그대로 단위 테스트 가능(`toChosung("가") === ["ㄱ"]`).
- 화면·상태·라이브러리에 의존하지 않으니 게임 어디서든 재사용된다.
- `[...word]` 로 순회하면 서로게이트 페어(이모지 등)도 한 글자로 다룬다(`word[i]` 보다 안전).

<!-- section: framework_role -->
## 라이브러리 대신 직접 만든 이유

초성 추출만 필요한데 형태소 분석 라이브러리를 끌어오면 과하다. `charCodeAt` + `Math.floor` 나눗셈이면
충분하고, 규칙이 고정이라 깨질 일이 없다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `javascript/language-basics/functions` — 순수 함수
- `javascript/objects-and-builtins/array-methods` — `map` / `filter`
- `react/testing/tdd-practice` — 순수 함수가 테스트하기 쉬운 이유

<!-- section: caution -->
## 주의점

- 조합형(옛한글)·자모 분리 입력은 이 규칙 밖이다 — 완성형(`가`~`힣`)만 처리하고 나머지는 그대로 반환한다.
- 상수(`588`, 배열)를 잘못 바꾸면 조용히 틀린 초성이 나온다 → 테스트로 고정한다.

<!-- section: experiment -->
## 작은 실습

1. `toChosung("띠빠라빠")` 를 손으로 예측하고 실행해 맞춰 보라.
2. `toChosung("Hello 세계 123")` 처럼 섞인 문자열을 넣어 비한글이 그대로 오는지 확인하라.
3. 이 함수의 테스트를 5줄 안에 작성하라(입력 → 기대 배열).

<!-- section: check_question -->
## 이해 점검

1. "순수 함수" 라서 얻는 이점 두 가지는?
2. `[...word]` 와 `word.split("")` / `for (i)` 의 차이는?
3. 한글이 아닌 문자는 어떻게 처리하나?

<!-- section: review -->
## 한 줄 정리

**초성 추출은 완성형 한글의 코드포인트 규칙을 나눗셈으로 푸는 순수 함수다 — 부수효과가 없어 그대로
테스트할 수 있고, 게임 로직이 이 함수 하나에 의존한다.**
