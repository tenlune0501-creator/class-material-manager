---
id: javascript/classes-and-modules/classes
chapter: javascript/classes-and-modules
title: class 문법
mastery: required
lesson_kind: lesson
estimated_minutes: 45
tags: [javascript, class, constructor, this, inheritance]
related_material_ids:
  - 1_vcEvfntPW20h8NiTeCZFEwaG904c4sF5h_O-fLfozc   # class MANUAL
  - 1QwoyuXNuzWgCxDlBok2OBkWrkd5f7NbL              # javascript-class-base.zip
  - 1_VVpVAer8laiICbMwS69GNjReoRFwg7P              # javascript-class-final.zip
prerequisites:
  - javascript/objects-and-builtins/working-with-objects
  - javascript/functions-and-scope/scope-and-closures
code_examples:
  - slug: before-class
    title: 예전 코드 — 객체를 만드는 세 가지 방법
    source_type: generated_minimal
    language: js
    is_canonical: true
    code: |
      // 1) 객체 리터럴 — 하나만 필요할 때
      const front = { a: "html", b: "css", c: "javascript" };

      // 2) 생성자 함수 — 같은 모양을 여러 개 (옛 방식)
      function Lang(x, y, z) {
        this.a = x;   // this = 새로 만들어질 인스턴스
        this.b = y;
        this.c = z;
      }
      const back = new Lang("php", "jsp", "asp");

      // 3) class — 위 생성자 함수를 정리한 문법 (동작은 사실상 같다)
      class LangC {
        constructor(x, y, z) { this.a = x; this.b = y; this.c = z; }
      }
      const front2 = new LangC("html", "css", "javascript");
  - slug: class-methods
    title: class — 생성자 + 메서드
    source_type: generated_minimal
    language: js
    code: |
      class Web {
        constructor(skill) {
          this.tech = skill;              // 인스턴스 속성
        }
        msg() {                           // 프로토타입 메서드 (모든 인스턴스가 공유)
          return `당신은 ${this.tech} 를 할 수 있다`;
        }
      }

      const step1 = new Web("html");
      step1.tech;        // "html"
      step1.msg();       // "당신은 html 를 할 수 있다"
      // new 없이 Web("html") 하면 TypeError — class 는 반드시 new 로 호출
  - slug: extends
    title: extends / super — 상속
    source_type: generated_minimal
    language: js
    code: |
      class Stack extends Web {
        constructor(skill, step) {
          super(skill);                  // 부모 constructor 먼저 호출 (this 전에 필수)
          this.stage = step;
        }
        show() {
          return `${this.msg()} 그래서 ${this.stage}를 마스터했다`;  // 부모 메서드 재사용
        }
      }

      const s = new Stack("html", "기초");
      s.show();          // "당신은 html 를 할 수 있다 그래서 기초를 마스터했다"
      s instanceof Web;  // true
  - slug: this-trap
    title: this 는 "어떻게 불렀나" 로 정해진다
    source_type: generated_minimal
    language: js
    code: |
      class Counter {
        count = 0;                       // 필드 문법
        inc() { this.count++; }
        incArrow = () => { this.count++; };  // 화살표 필드: this 고정
      }
      const c = new Counter();
      const f = c.inc;
      // f();            // ❌ this 가 undefined — 메서드를 떼어내면 연결이 끊김
      c.inc();           // ✅
      const g = c.incArrow;
      g();               // ✅ 화살표 필드라 this 가 c 에 묶여 있음
      setTimeout(c.incArrow, 100);  // 콜백으로 넘길 땐 화살표 필드가 편하다
---

<!-- section: goal -->
## 이 Lesson을 끝내면

- 객체를 만드는 세 방법(리터럴 / 생성자 함수 / `class`)의 관계를 설명하고, `class` 가 생성자 함수를 정리한 문법임을 안다.
- `constructor`, 인스턴스 속성, 메서드, `new` 로 인스턴스를 만든다.
- `extends` / `super` 로 상속하고 부모 메서드를 재사용한다.
- **`this` 는 "어떻게 호출했는가" 로 정해진다**는 것을 알고, 메서드를 콜백으로 넘길 때의 함정과 화살표 필드 해결책을 안다.
- (연결) 나중에 배울 React 클래스 컴포넌트가 이 문법 위에 있다는 것을 안다.

<!-- section: prerequisite -->
## 먼저 알고 있어야 하는 것

- 객체·속성·메서드, 함수와 스코프, `this` 기초.

<!-- section: dev_problem -->
## 이게 없으면 겪는 문제

- 같은 모양의 객체를 20개 손으로 복붙한다.
- 생성자 함수 + `prototype` 문법이 장황하고 상속 코드가 헷갈린다.
- 메서드를 `addEventListener` 나 `setTimeout` 에 넘겼더니 `this` 가 엉뚱한 걸 가리킨다.

<!-- section: concept -->
## 예전 코드부터 — 왜 class 가 나왔나

{{code: before-class}}

- 옛 강의 코드는 **객체 리터럴 → 생성자 함수(`function Lang(){ this.a = ... }` + `new`) → `class`** 순으로 발전한다.
- `class` 는 생성자 함수 + `prototype` 방식을 **읽기 쉽게 정리한 문법**이다(내부 동작은 거의 같다 — "설탕 문법").
- 그래서 예전 자료의 `function Lang(x,y,z){ this.a = x }` 코드를 보면, 이제는 `class Lang { constructor(x,y,z){ this.a = x } }` 로
  같은 일을 한다고 읽으면 된다.

<!-- section: mechanism -->
## class 만들고 상속하기

{{code: class-methods}}

- `constructor(...)` — `new` 할 때 한 번 실행. `this.속성 = 값` 으로 인스턴스 상태를 초기화.
- 메서드는 중괄호 안에 `이름() { }` 로. 모든 인스턴스가 **공유**(프로토타입에 올라감).
- `class` 는 반드시 `new` 로 호출. 그냥 부르면 `TypeError`.

{{code: extends}}

- `class 자식 extends 부모` — 부모의 속성·메서드를 물려받는다.
- 자식 `constructor` 에서는 `this` 를 쓰기 전에 **`super(...)` 로 부모 constructor 를 먼저** 불러야 한다.
- `super.메서드()` 로 부모 메서드를 명시적으로 호출할 수도 있다.
- `자식 instanceof 부모` → `true`.

<!-- section: mechanism | title: this 함정 -->
## this 는 호출 방식으로 정해진다

{{code: this-trap}}

- `c.inc()` 처럼 **점 앞의 객체**가 그 호출의 `this` 가 된다. `const f = c.inc; f()` 처럼 떼어 내면 연결이 끊겨 `this` 가 `undefined`.
- 콜백으로 넘겨야 하면: **화살표 필드**(`inc = () => {}`)로 `this` 를 인스턴스에 고정하거나, `c.inc.bind(c)` 를 넘긴다.
- 이 `this` 규칙 때문에 옛 React 클래스 컴포넌트는 `constructor` 에서 `this.handleClick = this.handleClick.bind(this)` 를 했다.

<!-- section: must_know -->
## 반드시 기억할 것

- `class` = 생성자 함수 + `prototype` 을 정리한 문법. 동작은 사실상 동일.
- `constructor` 에서 `this.속성` 초기화. 메서드는 인스턴스가 공유. 호출은 **반드시 `new`**.
- `extends` + `super(...)`(this 쓰기 전 필수)로 상속. `super.메서드()` 로 부모 것 재사용. `instanceof` 로 확인.
- **`this` = 호출 방식.** 메서드를 떼어 콜백으로 넘기면 `this` 가 끊긴다 → 화살표 필드 또는 `bind`.
- 옛 React 클래스 컴포넌트의 `bind` 코드가 바로 이 `this` 규칙 때문이다.

<!-- section: mission -->
## 미션 — 스킬 트리 모델

- `class Skill { constructor(name, level) }` + `describe()` 메서드.
- `class Track extends Skill { constructor(name, level, lessons) }` — `super` 사용, `summary()` 가 `describe()` 를 재사용.
- 배열 `[new Track(...), new Skill(...)]` 를 만들어 `map` 으로 한 줄씩 출력.
- `const m = track.summary; m()` 를 시도해 `this` 에러를 재현하고, 화살표 필드나 `bind` 로 고치기.
- (선택) 사설 상태를 `#count` (private 필드)로 만들어 외부에서 못 건드리는 것 확인.

<!-- section: check_question -->
## 이해 점검

1. `class` 와 생성자 함수의 관계를 한 문장으로.
2. 자식 `constructor` 에서 `super()` 를 `this` 사용 전에 불러야 하는 이유는?
3. `const f = obj.method; f()` 에서 `this` 가 깨지는 이유와 해결책 두 가지는?
4. `class` 를 `new` 없이 호출하면?

<!-- section: interview_question -->
## 면접 대비

- "JS 의 `class` 는 다른 언어의 클래스와 무엇이 다른가요? (프로토타입)"
- "`this` 바인딩이 깨지는 상황과 대처법을 설명해 보세요."
- "옛 React 클래스 컴포넌트에서 `bind` 를 쓰던 이유는?"

<!-- section: review -->
## 한 줄 정리

**`class` 는 생성자 함수+`prototype` 을 정리한 문법으로 `constructor`/메서드/`new`/`extends`+`super` 를 쓰고,
`this` 는 호출 방식으로 정해지므로 메서드를 콜백으로 넘길 땐 화살표 필드나 `bind` 로 인스턴스에 묶는다.**

<!-- section: next -->
## 다음 Lesson

`classes-and-modules/es-modules` — 파일을 나누고 `import`/`export`.
