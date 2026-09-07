---
id: momentalk/button-variant-wrapper
project: momentalk
title: 공통 Button — props 기본값과 variant 매핑으로 MUI 감싸기
unit_kind: component
feature_area: 공통 UI
concepts: [props 구조 분해, 기본값 매개변수, 공통 컴포넌트 재사용, MUI, 합성(spread)]
related_lessons:
  - react/components-and-props/passing-props
  - react/components-and-props/creating-components
  - react/optimization-and-refactoring/refactoring-components
---

<!-- section: role -->
## 이 코드가 하는 일

`src/components/ui/Button.jsx` — 프로젝트 전역에서 쓰는 버튼을 **한 컴포넌트로** 모았다. `variant` 문자열
(`primary|secondary|tertiary|text`)을 받아 매핑 객체로 MUI Button의 실제 `variant` 와 `sx` 를 정한다.
전체 코드는 실전 예제 `momentalk-button-variant-wrapper`.

<!-- section: code -->
## 핵심 코드 읽기

```jsx
const variantMap = { primary: "contained", secondary: "outlined", tertiary: "outlined", text: "text" };
const variantStyles = { primary: { bgcolor: "primary.main", color: "#fff", "&:hover": {...} }, /* ... */ };

export default function Button({
  variant = "primary", size = "md", leadingIcon, trailingIcon, children, sx, ...rest
}) {
  return (
    <MuiButton
      variant={variantMap[variant]}
      startIcon={leadingIcon}
      endIcon={trailingIcon}
      sx={{ ...variantStyles[variant], ...sx }}   // 기본 스타일 + 호출부 override
      {...rest}                                   // 나머지 props 는 그대로 전달
    >
      {children}
    </MuiButton>
  );
}
```

<!-- section: why -->
## 왜 이렇게 했나

- 같은 버튼 모양이 화면마다 반복되면, 매번 `<MuiButton variant="contained" sx={{...}}>` 를 복붙하게 된다 →
  디자인이 바뀌면 전부 고쳐야 한다. **공통 컴포넌트 한 곳** 으로 모으면 한 번만 고친다.
- `variant` 를 **디자인 언어**(primary/secondary…)로 받고, MUI의 구현 세부(contained/outlined)는 매핑 객체가 숨긴다.
- `sx={{ ...variantStyles[variant], ...sx }}` — 기본값을 깔고 호출부가 필요하면 덮어쓴다.
- `{...rest}` — `onClick`, `disabled`, `type` 등 나머지 props를 그대로 MUI Button에 넘긴다.

<!-- section: framework_role -->
## MUI 가 대신하는 것

MUI Button이 포커스 링·리플·disabled 처리·키보드 접근성을 제공한다. 이 래퍼는 그 위에 **프로젝트 고유의
이름과 기본 스타일** 만 한 겹 얹는다. 과하게 추상화하지 않고 딱 필요한 만큼만.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `react/components-and-props/passing-props` — props 구조 분해·기본값·`...rest`
- `react/optimization-and-refactoring/refactoring-components` — 반복 UI를 컴포넌트로

<!-- section: caution -->
## 주의점

- 매핑 객체에 없는 `variant` 값을 넘기면 `variantMap[variant]` 가 `undefined` 가 된다 — 기본값(`"primary"`)으로 방어.
- `sx` 병합 순서가 중요하다: `{ ...기본, ...호출부 }` 여야 호출부가 이긴다.

<!-- section: experiment -->
## 작은 실습

1. `variant="danger"` 를 추가하고 `variantMap`/`variantStyles` 에 항목을 넣어 보라.
2. `{...rest}` 를 지우고 `<Button onClick={...}>` 이 동작하지 않는 것을 확인하라.
3. `sx` 병합 순서를 뒤집어 호출부 스타일이 무시되는 것을 관찰하라.

<!-- section: check_question -->
## 이해 점검

1. `variant` 를 "contained/outlined" 가 아니라 "primary/secondary" 로 받는 이유는?
2. `{...rest}` 가 없으면 어떤 props가 전달되지 않나?
3. `sx={{ ...variantStyles[variant], ...sx }}` 에서 두 spread의 순서가 뜻하는 바는?

<!-- section: review -->
## 한 줄 정리

**공통 Button은 디자인 언어(primary/secondary)를 받아 매핑 객체로 MUI 구현에 연결하고, `sx` 병합과
`{...rest}` 로 확장 여지를 남긴 "반복 UI를 한 컴포넌트로" 의 작은 실물이다.**
