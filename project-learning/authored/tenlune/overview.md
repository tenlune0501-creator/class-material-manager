---
id: tenlune/overview
project: tenlune
title: 프로젝트 개요 — 테마·플러그인·스니펫 3층
unit_kind: overview
feature_area: 전체
concepts: [WordPress FSE 블록 테마, 커스텀 플러그인, CPT, 코드 정본과 콘텐츠 SoT 분리]
related_lessons:
  - design-and-planning/planning-and-ia/storyboard-and-site-launch
  - web-foundations/html-structure/semantic-tags
  - ai-engineering/llm-app-fundamentals/streaming-and-errors
---

<!-- section: role -->
## 이 프로젝트가 뭔가

**Tenlune** = 실제 운영 중인 1인 웹 제작 사업 사이트(WordPress, cafe24 호스팅). 홈·서비스·문의·저널
페이지와 작업 사례(CPT), 그리고 규칙 기반 견적 도구가 있다.

**중요한 경계**: 라이브 WordPress 사이트가 **콘텐츠의 Source of Truth** 이고, 이 git 저장소는
FSE 블록 테마·커스텀 플러그인·WPCode 스니펫 **코드의 정본** 이다. 학습 기준은 고정 커밋 `9673971`.

<!-- section: where -->
## 3층 구조

```
wp-content/themes/tenlune/          FSE 블록 테마 (정본)
  templates/  parts/  patterns/     화면 뼈대 (블록 마크업)
  assets/css/tenlune.css            반응형 CSS 시스템 (35개 @media)
  theme.json                        디자인 토큰 (색·타이포·스페이싱)
wp-content/plugins/tenlune-content/ 커스텀 플러그인 (정본)
  CPT `case`, OG/canonical 메타, includes/ai-quote.php (AI 견적 REST)
snippets/                           WPCode 스니펫 로컬 원본
  quote-tool-v2.js                  규칙 기반 견적 계산
  quote-tool-style.css / ai-quote-llm-endpoint-v2.php
```

<!-- section: flow -->
## 왜 3층인가

- **테마**: 정적 화면 구조·스타일. FSE(풀 사이트 편집) 블록 테마라 `templates/*.html` + `patterns/*.php`.
- **플러그인**: 데이터 모델(CPT `case`)·SEO 메타·서버 로직(AI 견적 REST 엔드포인트). 테마를 바꿔도 남는 것.
- **WPCode 스니펫**: `wp-config.php` 의 `DISALLOW_FILE_EDIT` 때문에 서버 실행 코드를 테마 파일로 못 넣는다 →
  브라우저 승인 후 wp-admin에서 활성화하는 스니펫으로 반영.

<!-- section: framework_role -->
## WordPress 가 대신하는 것

라우팅·템플릿 계층·CPT/택소노미·관리자 UI·인증을 WordPress가 준다. 이 프로젝트는 그 위에 블록 테마
디자인, CPT 하나, SEO 메타, 견적 도구만 얹는다.

<!-- section: related_lesson -->
## 이어지는 Lesson

- `design-and-planning/planning-and-ia/storyboard-and-site-launch` — 사이트 개설 절차
- `web-foundations/html-structure/semantic-tags` — 블록 마크업의 시맨틱
- `ai-engineering/llm-app-fundamentals/streaming-and-errors` — AI 견적의 실패 처리 패턴

<!-- section: caution -->
## 주의점

- 이 Unit들은 **프론트엔드/AI 커리큘럼과 연결되는 부분만** 다룬다(반응형 CSS, 디자인 토큰, 규칙 견적,
  규칙+LLM). WordPress/PHP 고유 구조(훅, 템플릿 계층)는 현재 트랙 밖이다.
- 콘텐츠(페이지·글)는 저장소에 없다 — 라이브 사이트에만 있다.
- API 키(`TENLUNE_OPENROUTER_API_KEY` 등)는 저장소·문서 어디에도 없다.

<!-- section: check_question -->
## 이해 점검

1. "라이브가 콘텐츠 SoT, git이 코드 정본" 이 무슨 뜻인가?
2. 왜 서버 실행 코드를 테마 파일이 아니라 WPCode 스니펫으로 넣나?
3. 테마와 플러그인의 역할을 한 문장씩으로 구분하라.

<!-- section: review -->
## 한 줄 정리

**Tenlune은 FSE 블록 테마(화면·스타일) + 커스텀 플러그인(CPT·SEO·AI 견적 REST) + WPCode 스니펫(서버
스크립트) 3층으로 나뉘며, 라이브 사이트가 콘텐츠 정본이고 git은 코드 정본이다.**
