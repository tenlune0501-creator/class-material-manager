# 조사 영역: Backend + Database (+ Spring 재조사)

> Research Agent 1 (Backend + Database + Spring). 조사 전용. 이 파일 1개만 생성했다.
> 커리큘럼 YAML / DB / 자료 파일은 읽기만 했고 수정하지 않았다.
> checked_at 기준일: 2026-09-06.

---

## 챕터 준비도 한 줄 판정 (owned chapters)

### `data-and-backend/nodejs-server` → **PARTIAL**

기존 자료가 "없음"이 아니다. React 트랙 `board-crud-app` 챕터에 매핑된 강사 문서
8종(`03_1 서버환경 설정`, `04 웹서버와 DB 연동`, `05~09 게시판 CRUD`, `10 이미지 첨부`)이
실제로 **Express + MySQL REST 서버를 처음부터 만드는 실습**이다. `npm init` → `express`/`mysql`/`cors`
설치 → `app.listen` → `app.get/post` 라우트 → `express.json()` → `mysql.createPool` + 파라미터 바인딩
SQL → `multer` 파일 업로드 → `process.env.PORT` → PM2/systemd/Nginx 리버스 프록시까지 나온다.
따라서 **"동작하는 예제"는 이미 있다.** 부족한 것은 개념 레이어다: HTTP/클라이언트-서버 모델을
명시적으로 가르치는 부분, Node 런타임·이벤트 루프·논블로킹 I/O, 내장 `http` 모듈, 미들웨어를
개념으로 설명, `express.Router` 로 모듈화, 에러 처리 미들웨어, 입력 검증, 프로젝트 구조
(controller/service/repository), REST 설계 원칙과 상태코드 규율. 이 개념들은 아래 공식 문서로
집필 가능하다. 자료를 새로 만들 필요는 없고 **기존 예제 + 공식 문서 개념**으로 골격을 채우면 된다.
→ `related_material_ids` 를 위 8종으로 채우고(현재 빈 배열), `status` 를 `skeleton` 으로 승격 가능.

### `data-and-backend/relational-database-operations` → **NOT READY**

이 챕터의 스코프(스키마 설계·**마이그레이션**·**쿼리 최적화**·**트랜잭션** 실무, Postgres 특성)는
기존 자료가 전혀 다루지 않는다. 기존 DB 자료(`SQL 핵심정리`, `정규화`, `ERD 제작하기`,
`관계형 비관계형 차이`)는 **개념 기초**로 `data-and-backend/data-modeling` 챕터를 채우기엔 충분하지만,
운영 실무(마이그레이션 파이프라인, `BEGIN/COMMIT/ROLLBACK`, `EXPLAIN`, 인덱스 trade-off,
PostgreSQL DDL, RLS 이해에 필요한 DB 기반)는 전부 외부 조사 결과로만 집필해야 한다.
저장소에 `supabase/migrations/*.sql` 실파일은 있으나 교육 자료는 아니다. 아래 PostgreSQL 공식
문서 + Supabase 마이그레이션 문서로 집필 가능하다. → 집필 착수 가능하나 100% 외부 조사 의존.

### Spring 챕터 → **신설 타당(단, 선택/후속 트랙). 지금 단계에서 blocking 아님**

기존 Java/Spring 자료는 **없음(확인됨)**. 현 커리큘럼에 Spring 챕터도 없다. 그러나 (1) 국내 FE
채용에서 Spring Boot 기본 이해를 요구하는 경우가 많고, (2) DB 기초 챕터와 자연스럽게 이어지며,
(3) 이 태스크가 명시적으로 조사를 요청했다. 아래 "향후 확장"에 챕터/레슨 후보를 제안한다.
YAML 은 수정하지 않았다. Node 트랙이 기존 자료로 연속성이 있으므로 **Spring 은 Node 다음의
선택 트랙**으로 두는 것을 권장한다.

---

## 기존 CMM 자료 확인

정적 조사 대상: `data/index.json`(entries 393), `data/materials/**`, `data/references/**`,
`data/*.json`, `curriculum/**`(읽기), `project-learning/projects.yaml`,
접근 가능한 로컬 저장소(`Tenlune`, `tenlune-marketing-agent`, `tenlune-operations-agent`,
`tenlune-instagram-creative`), momentalk(`minho0391/est-fe-3rd-project`).

### 실제로 존재하는 Backend/DB 자료 (재조사로 확인 — "100% frontend" 는 이 부분에서 과장)

| docId (source_id 앞부분) | 제목 | 실제 주제 | 학습 가치 | 지원 가능 CMM Chapter/Lesson |
|---|---|---|---|---|
| `1k0hObTy…` | 03_1 서버환경 설정 | MySQL 설치(installer/xampp), Workbench, `npm init -y`, `npm i express body-parser mysql`, express 서버 폴더 분리 | 중 — 환경 세팅 실습. 개념 설명은 얕음(스크린샷 위주) | `data-and-backend/nodejs-server/express-rest-api` (선행 세팅) |
| `1a63pT8q…` | 04 웹서버와 DB 연동하기 | axios, CORS 에러의 원인/해결, 클라이언트↔서버 첫 연결 | 중상 — CORS를 실제 에러로 만나 이해. 이미 `backend-integration/frontend-to-webserver-db` 와 `react/data-fetching` 에 매핑됨 | `data-and-backend/nodejs-server` (CORS 미들웨어), `backend-integration` |
| `1CvaWGWq…` | 05 게시판 목록 조회 | `express()`, `cors(corsOptions)`, `mysql.createPool`, `app.get("/list")` + `SELECT * FROM board`, `app.listen(PORT)` | 상 — 최소 REST GET + DB 조회의 완결 예제 | `nodejs-server/express-rest-api` (GET/조회) |
| `1peKntI-…` | 06 게시물 쓰기 | `express.json()`, `express.urlencoded()`, `req.body` 구조분해, `INSERT` | 상 — POST 바디 파싱 미들웨어를 "없으면 안 되는 이유"로 설명 | `nodejs-server/express-rest-api` (POST/생성, 미들웨어) |
| `1OxTMR5Q…` | 07 게시판 목록 조회 개선 | 빈 목록 분기, 클라이언트 렌더링 개선 | 하 — 대부분 React 측 | `react/board-crud-app` (주로 프론트) |
| `1KeXe0iq…` | 08 게시물 수정 | 수정 모드 흐름도, `POST /update` + `UPDATE ... WHERE id=?` | 중상 — 요청 흐름(클라→Express→SQL) 도식 | `nodejs-server/express-rest-api` (UPDATE) |
| `1bos2ISU…` | 09_게시물 삭제 | `app.post("/delete")` + `DELETE FROM board WHERE id=?` 파라미터 바인딩, `confirm` → navigate | 중상 — 파라미터 바인딩(SQL 인젝션 방어) 등장 | `nodejs-server/express-rest-api` (DELETE), `relational-database-operations` (바인딩) |
| `1AkBUevg…` | 10 이미지 파일 첨부 | `multer` multipart 처리, 정적 파일 제공, 파일 경로 DB 저장 | 중 — 파일 업로드 미들웨어. 이미 `board-crud-app/file-upload` 매핑 | `nodejs-server` (multer), `board-crud-app/file-upload` |
| `1MjC0nvq…` | GCP - VM 생성 및 설정, 웹서버설치 | GCP VM(E2-micro/Ubuntu), MySQL 설치, express 설치·실행 | 중 — 배포 인프라. 이미 `deployment-and-infra/node-app-hosting/gcp-vm-deploy` 매핑 | `deployment-and-infra` (다른 에이전트 스코프) |
| `1bKTN0FW…` | GCP - 서비스 등록 실행 | PM2 / systemd 자동 실행, **Nginx 리버스 프록시**(`/api` → `localhost:3000`), `try_files` SPA fallback | 중상 — Express=API 전담 구조, 포트 은닉, HTTPS 확장 | `deployment-and-infra/node-app-hosting` (매핑됨). Node 아키텍처 개념 보조 |
| `1E235IuK…` | GCP - 클라이언트 연결 | `.env.development` / `.env.production`, `VITE_API_URL`, git clone·빌드·`serve -s dist` | 중 — 환경변수 분리 | `deployment-and-infra` (매핑됨) |
| `1b9CclzJ…` | 구글 클라우드 - 배포 part 2 | (제목만 확인) GCP 배포 연속 | — | `deployment-and-infra/node-app-hosting` (매핑됨) |
| `1gmX8yMu…` | 1 - ERD - 제작하기 | 개체/속성/관계 추출, 1:1·1:N·N:M, 물리 스키마, `CREATE TABLE` 예, ERD 툴 | 상 — `data-modeling/erd` 의 핵심 자료(매핑됨) | `data-and-backend/data-modeling/erd` |
| `14E6y0Ti…` | 데이터베이스 - 정규화 | 1NF/2NF/3NF 조건·잘못된 예·수정 예, 정규화 과정 예시(학생/과목/학과) | 상 — `data-modeling/normalization` 핵심(매핑됨) | `data-and-backend/data-modeling/normalization` |
| `1egvVi-6…` | 관계형 비관계형 차이 | RDBMS(MySQL/Oracle/SQLite/MariaDB/PostgreSQL), 스키마 고정, SQL, NoSQL 정의·유형 | 중상 — `data-modeling/relational-vs-nonrelational`(매핑됨) | `data-and-backend/data-modeling/relational-vs-nonrelational` |
| `1Hn4jKnN…` | SQL 핵심정리 | MySQL `CREATE TABLE`(InnoDB/utf8mb4/AUTO_INCREMENT), 인덱스(where 절 기준 컬럼), `INSERT`/`SELECT`(WHERE/AND/OR)/`UPDATE`/`DELETE`, `JOIN`, **파라미터 바인딩으로 SQL 인젝션 방어** | 상 — `data-modeling/sql-essentials` 핵심(매핑됨). MySQL 방언 | `data-and-backend/data-modeling/sql-essentials` |
| `1lihKRwR…` | 01 - Firebase와 Supabase | (BaaS 비교) | 중 — `baas-supabase-firebase/firebase-vs-supabase`(매핑됨) | `data-and-backend/baas-supabase-firebase` |
| `1NFB5KVA…` | supabase - 프로젝트 이관 | (Supabase 이관) | 중 — `baas-supabase-firebase`(매핑됨) | `data-and-backend/baas-supabase-firebase` |
| `data/references/supabase/INDEX.md` | Supabase 공식 문서 색인 | 공식 문서 30개 제목+URL 목록(내용 없음). database / auth / api(PostgREST) / RLS(security) 등 | 낮음(색인만) — 실제 조사 시 원문 재확인 필요 | `baas-supabase-firebase`, `relational-database-operations`(RLS 연결) |

또한 `03_1 서버환경 설정` 은 "서버는 **node express**, DB는 **MySQL**" 이라고 명시.
BBS 서버 클라이언트 저장소는 `github.com/alikerock/react_vite_bbs`(강사 계정)로 언급됨.

### Supabase 실파일 (교육자료 아님, 참고용)

`supabase/migrations/20260826024724_create_learning_data_schema.sql` 등 3개 마이그레이션,
`supabase/config.toml` — **CMM 자체**의 학습데이터 스키마. `relational-database-operations` 의
"마이그레이션 실무" 를 가르칠 때 **실제 사례로 인용 가능**(이 저장소 자산).

---

## Spring 기존 자료 재조사 결과 (REQUIRED)

**결론: 기존 Java/Spring/Spring Boot/JPA/Hibernate 자료 없음 — 확인됨.**

조사 방법 (전부 읽기 전용):

- `data/index.json` 의 `section` 전수(28개) 및 `subject` 전수(17개) 확인 → Java/Spring/backend
  섹션 없음. 섹션: HTML·CSS·Layout / Javascript / jQuery / React / Next.js / TypeScript / Chart JS /
  Git / 배포 / UI 디자인 / AI 활용하기 / 웹접근성 등 전부 프론트엔드.
- `data/` 전체에 대해 대소문자 무시 정규식 검색:
  `spring boot|spring framework|springframework|hibernate|\bJPA\b|@RestController|@Autowired|
  @Entity|gradlew|gradle|maven|nestjs` → **실질적 히트 2건뿐, 둘 다 부수적 언급**:
  1. `others/planning/홈페이지 개설하기` : "Node.js (Express), Python (FastAPI), Java (Spring Boot) 등"
     — 백엔드 스택을 나열만 함.
  2. `react/GCP - 서비스 등록 실행` : Nginx 리버스 프록시 사용처 표에 "Spring Boot(Java) | ✅ | Reverse Proxy"
     한 줄 — Spring 을 가르치는 내용 아님.
- `.java` / `pom.xml` / `build.gradle*` / `application.properties|yml` 파일 검색:
  - 이 저장소: 0건.
  - `C:\Users\minh0\Tenlune`, `tenlune-marketing-agent`, `tenlune-operations-agent`,
    `tenlune-instagram-creative`: 0건 (전부 Node/TS + WordPress).
  - momentalk(`minho0391/est-fe-3rd-project`): `projects.yaml` 에 "React + Next.js App Router + MUI +
    Supabase 웹앱" 으로 문서화. 백엔드 서버 없음. `gh` CLI 가 이 환경에 설치돼 있지 않아 트리 직접
    조회는 못 했으나, `projects.yaml` 의 11개 Unit(모두 프론트/Supabase)과 스택 선언으로 Java/Spring
    부재는 확정적.
- `data/references/**`: css/html/javascript/mui/nextjs/react/supabase/typescript 만 존재. Java/Spring 없음.

→ **Spring 자료를 지어내지 않는다.** Spring 챕터를 만들려면 아래 공식 문서 조사 결과로만 집필.

---

## 학습 목표

이 조사가 지원하는 최종 학습 상태(챕터별):

- **Backend Fundamentals(공유 기반)**: 클라이언트-서버 모델, HTTP 요청/응답 구조(메서드·헤더·상태코드·바디),
  무상태성, REST/자원 설계, 라우팅, 미들웨어, 입력 검증, 에러 처리, 비동기 서버 처리, 환경설정,
  인증/인가 기초, controller-service-repository 계층 구조를 **말로 설명하고 최소 예제를 읽을 수 있다.**
- **Node.js 서버**: Node 런타임/이벤트 루프가 왜 논블로킹인지 설명하고, 내장 `http` 또는 Express 로
  **GET/POST/PUT/DELETE CRUD REST API 를 직접 만들 수 있다.** 미들웨어·에러 처리·환경변수·프로젝트
  구조를 적용한다.
- **관계형 DB 운영**: 관계 모델·PK/FK·제약·JOIN·인덱스·트랜잭션·정규화를 이해하고, **스키마를
  마이그레이션 파일로 버전 관리**하며, `EXPLAIN` 으로 느린 쿼리를 진단하는 절차를 안다.
  PostgreSQL 을 기준으로 하고 Supabase/Postgres·RLS 로 연결한다.
- **(선택) Spring Boot**: 웹 개발자가 IoC/DI·빈·자동설정을 이해하고
  `@RestController`+`@Service`+`@Repository`+Spring Data JPA 로 **기본 REST API + DB CRUD 를 만들고
  구조를 설명할 수 있다.** 보안/인증은 후속 스코프로 명시.

---

## 선행 개념

- **HTTP(S) 기본**: 이미 `javascript/async-and-http` 챕터가 다룸. Backend 챕터는 "서버 쪽에서 본 HTTP"
  로 재사용·심화.
- **JSON, fetch/axios**: `javascript/async-and-http`, `react/data-fetching` 에서 다룸.
- **CORS**: 기존 자료 `04 웹서버와 DB 연동하기` 에 실제 에러로 등장 — 재사용.
- **터미널/npm**: `tooling-and-collaboration/editor-setup`, `javascript/classes-and-modules`(npm 기초).
- **환경변수**: `nextjs/env-and-deployment`, `deployment-and-infra` 자료.
- **SQL·관계 모델 기초**: `data-and-backend/data-modeling` 챕터(기존 자료로 커버됨) → 이게
  `relational-database-operations` 와 Node/Spring DB 파트의 **공통 DB 기반**. 두 트랙에서 중복 설명하지 않는다.
- **Java 기초(Spring 한정)**: 클래스/인터페이스/제네릭/어노테이션/빌드도구. CMM 에 Java 트랙이 없으므로
  Spring 챕터는 "최소 Java 선행" 레슨을 앞에 둬야 함(아래 제안).

---

## 권장 학습 순서

1. **Backend Fundamentals** (공유 기반, Node/Spring 앞) — 클라이언트/서버, HTTP 요청·응답,
   메서드(safe/idempotent), 상태코드, 무상태성, REST 자원 설계, 미들웨어 개념, 계층 구조, 인증/인가 기초.
2. **공통 DB 기반** = 기존 `data-and-backend/data-modeling` (관계 모델, SQL, 정규화, ERD). 이미 자료 있음.
3. **Node.js 서버** (`nodejs-server`) — 런타임·이벤트 루프 → 내장 `http` → Express(라우팅·미들웨어·
   에러처리) → CRUD REST + DB(기존 BBS 예제 재사용) → 프로젝트 구조 → 환경설정.
4. **관계형 DB 운영** (`relational-database-operations`) — PostgreSQL 기준: DDL·제약·PK/FK →
   인덱스 & `EXPLAIN` → 트랜잭션 → 마이그레이션 실무 → Supabase/Postgres·RLS 연결.
5. **(선택) Spring Boot** — 최소 Java → IoC/DI·빈 → Spring Boot(스타터·자동설정) →
   `@RestController` 라우팅·검증·`@ControllerAdvice` → Spring Data JPA·`@Transactional` → 보안은 후속.

---

## 필수 개념

형식: concept / why / prerequisite / mastery 후보 / source / URL / publisher / official / checked_at /
current|deprecated / target chapter / lesson candidate / license note.
(원문 장문 복붙 없음. 집필에 필요한 최소 고품질 출처만.)

### A. Backend Fundamentals (공유 기반)

**A1. 클라이언트-서버 모델 & HTTP 요청/응답 구조**
- why: 모든 백엔드의 출발점. 서버는 요청을 받아 응답을 만드는 프로그램이라는 정의.
- prerequisite: `javascript/async-and-http`
- mastery: required
- source: "Overview of HTTP" — MDN
- URL: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- publisher: Mozilla (MDN) · official: yes(웹 표준 레퍼런스) · checked_at: 2026-09-06 · current (최종수정 2026-08-21)
- backs: 클라이언트가 항상 요청을 시작한다 / 요청 = 메서드+경로+버전+헤더+(바디) / 응답 = 버전+상태코드+상태메시지+헤더+(바디) / 무상태성 / TCP 위 동작 / HTTP flow 4단계
- target chapter: Backend Fundamentals (신설 또는 `backend-integration` 확장)
- lesson candidate: `backend-fundamentals/http-request-response`
- license note: MDN 본문 CC-BY-SA 2.5. 인용은 요약·재서술로. 코드 예제는 직접 작성.

**A2. HTTP 메서드 semantics (safe / idempotent / cacheable)**
- why: REST 자원 설계와 CRUD ↔ 메서드 매핑의 근거. "왜 조회는 GET, 삭제는 DELETE 인가".
- prerequisite: A1
- mastery: required
- source: "HTTP request methods" — MDN
- URL: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
- publisher: Mozilla (MDN) · official: yes · checked_at: 2026-09-06 · current (최종수정 2025-07-04)
- backs: GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS 의미, safe(GET/HEAD/OPTIONS), idempotent(GET/PUT/DELETE=yes, POST/PATCH=no)
- target chapter: Backend Fundamentals
- lesson candidate: `backend-fundamentals/rest-resource-design`
- license note: 위와 동일.

**A3. HTTP 인증/인가 기초 (401 vs 403, Authorization 헤더, Bearer)**
- why: "인증/인가 기초" 요구. 세부 구현(JWT/OAuth)은 후속 스코프.
- prerequisite: A1
- mastery: understand
- source: "HTTP authentication" — MDN
- URL: https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
- publisher: Mozilla (MDN) · official: yes · checked_at: 2026-09-06 · current (최종수정 2026-09-04)
- backs: `WWW-Authenticate`↔`Authorization` 챌린지-응답, Basic(HTTPS 필수), Bearer(OAuth2 토큰), 401(자격 없음/틀림, 재시도 가능) vs 403(자격은 있으나 권한 없음), 인증≠인가
- target chapter: Backend Fundamentals
- lesson candidate: `backend-fundamentals/auth-basics`
- license note: 위와 동일. needs_followup: JWT·세션·OAuth2 는 별도 레슨(자료 없음).

**A4. REST / 자원 지향 API 설계 (실무형)**
- why: 라우트를 자원(`/boards`, `/boards/:id`)으로 설계하고 메서드로 동작을 표현.
- prerequisite: A2
- mastery: required
- source: "Building a RESTful Web Service" — Spring Guides (언어 무관하게 REST 패턴 예시로 활용)
- URL: https://spring.io/guides/gs/rest-service
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (2026 저작권)
- backs: 자원 URL + 메서드, 객체→JSON 자동 직렬화, 쿼리 파라미터/경로 변수
- 보조 source: Express "Routing" (아래 B4) — Node 관점의 동일 개념
- target chapter: Backend Fundamentals / nodejs-server 공유
- lesson candidate: `backend-fundamentals/rest-resource-design`
- license note: Spring Guides 는 ASLv2. 요약·재서술 사용.

**A5. 계층 구조 (controller / service / repository)**
- why: 라우트 핸들러에 SQL 을 직접 박는 기존 BBS 예제의 한계를 넘어서는 구조 감각.
- prerequisite: A4
- mastery: understand
- source: Spring Boot Reference — "Spring Beans and Dependency Injection" (+ 스테레오타입 `@Controller`/`@Service`/`@Repository` 가 계층을 표현)
- URL: https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (Spring Boot 4.1.x 문서)
- backs: 웹 계층/서비스 계층/데이터 접근 계층 분리, 생성자 주입, 스테레오타입 = 계층 표식
- Node 적용: 동일 개념을 `routes/ controllers/ services/ repositories/` 폴더로. (공식 단일 문서 없음 —
  Express "Routing" 의 `express.Router` 모듈화 + 위 Spring 계층 개념을 합쳐 설명)
- target chapter: nodejs-server (구조 레슨), Spring 챕터
- lesson candidate: `nodejs-server/project-structure`
- license note: ASLv2.

### B. Node.js Backend → `data-and-backend/nodejs-server`

**B1. Node 런타임 & 이벤트 루프 (논블로킹 I/O)**
- why: "요청마다 스레드" 모델과 다른 이유, 왜 CPU 무거운 동기 작업이 서버를 멈추는지.
- prerequisite: `javascript/async-and-http`, 클로저/콜백
- mastery: understand
- source: "The Node.js Event Loop" — Node.js Learn
- URL: https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick
- publisher: OpenJS Foundation · official: yes · checked_at: 2026-09-06 · current (Node 20+ 반영)
- backs: 단일 JS 스레드 + libuv, 6단계(timers/pending/poll/check/close), poll 에서 블로킹, 긴 동기 콜백 = 이벤트 루프 기아, `process.nextTick` 은 루프 밖
- target chapter: `data-and-backend/nodejs-server`
- lesson candidate: `nodejs-server/node-runtime-and-event-loop`
- license note: Node.js 문서 MIT-스타일. 요약 사용.
- 보조 source: "Overview of Blocking vs Non-Blocking" — https://nodejs.org/learn/asynchronous-work/overview-of-blocking-vs-non-blocking (official, current)

**B2. 내장 `http` 모듈로 서버 만들기 (프레임워크 이전)**
- why: Express 가 감춰주는 것(요청 스트림, 상태코드/헤더 수동 설정)을 한 번은 본다.
- prerequisite: B1
- mastery: understand
- source: "Anatomy of an HTTP Transaction" — Node.js Learn
- URL: https://nodejs.org/learn/http/anatomy-of-an-http-transaction
- publisher: OpenJS Foundation · official: yes · checked_at: 2026-09-06 · current
- backs: `http.createServer((req,res)=>…)`, `req.method`/`req.url`/`req.headers`(소문자), 바디는 ReadableStream(`data`/`end` 이벤트 + `Buffer.concat`), `res.statusCode`/`res.setHeader`/`res.writeHead`/`res.write`/`res.end`, `req.on('error')`
- target chapter: `data-and-backend/nodejs-server`
- lesson candidate: `nodejs-server/builtin-http-server`
- license note: 위와 동일. 코드는 직접 최소 작성.

**B3. Express 설치 & 기본 라우팅 (CRUD 형태)**
- why: 실무 REST 서버의 최소 골격. 기존 BBS 예제와 바로 연결.
- prerequisite: B2
- mastery: required
- source: "Basic routing" — Express
- URL: https://expressjs.com/en/starter/basic-routing.html
- publisher: OpenJS Foundation · official: yes · checked_at: 2026-09-06 · current (Express v5.x)
- backs: `app.METHOD(PATH, HANDLER)`, GET/POST/PUT/DELETE, `res.send`/`res.json`/`res.status`/`res.sendStatus`, 최소 CRUD 라우트 4개 형태
- target chapter: `data-and-backend/nodejs-server`
- lesson candidate: `nodejs-server/express-rest-api` (기존 레슨 id 재사용)
- related_material_ids 후보: `1CvaWGWq…`(05), `1peKntI-…`(06), `1KeXe0iq…`(08), `1bos2ISU…`(09)
- license note: Express 문서 CC-BY-SA 3.0(코드는 MIT). 요약·재서술 + 자작 코드.

**B4. Express 라우팅 심화 & 모듈화 (`express.Router`)**
- why: 자원별 파일 분리. 기존 예제가 `index.js` 한 파일에 다 넣는 문제 해결.
- prerequisite: B3
- mastery: required
- source: "Routing" — Express Guide
- URL: https://expressjs.com/en/guide/routing.html
- publisher: OpenJS Foundation · official: yes · checked_at: 2026-09-06 · current (v5.x)
- backs: 라우트 파라미터 `req.params`, `app.route()` 체이닝, `express.Router()` + `app.use('/boards', router)`
- target chapter: `data-and-backend/nodejs-server`
- lesson candidate: `nodejs-server/routing-and-modules`
- license note: 위와 동일.

**B5. 미들웨어 (개념 + 바디 파서)**
- why: "미들웨어" 를 개념으로. 기존 `06 게시물 쓰기` 가 `express.json()` 을 "없으면 `req.body` 가 안 됨" 으로 잘 도입함 → 재사용.
- prerequisite: B3
- mastery: required
- source: "Using middleware" — Express Guide
- URL: https://expressjs.com/en/guide/using-middleware.html
- publisher: OpenJS Foundation · official: yes · checked_at: 2026-09-06 · current (v5.x)
- backs: `(req,res,next)` 시그니처, `next()` 안 부르면 요청 멈춤, application/router/error-handling/built-in 종류, `express.json()`·`express.urlencoded({extended:true})`·`express.static()`, 등록 순서대로 실행
- target chapter: `data-and-backend/nodejs-server`
- lesson candidate: `nodejs-server/middleware`
- related_material_ids 후보: `1peKntI-…`(06, `express.json`), `1a63pT8q…`(04, CORS 미들웨어), `1AkBUevg…`(10, multer)
- license note: 위와 동일.

**B6. 에러 처리 미들웨어**
- why: 기존 예제는 `if (err) throw err` 수준. 4-인자 에러 핸들러로 일관된 에러 응답.
- prerequisite: B5
- mastery: required
- source: "Error Handling" — Express Guide
- URL: https://expressjs.com/en/guide/error-handling.html
- publisher: OpenJS Foundation · official: yes · checked_at: 2026-09-06 · current (v5.x)
- backs: `(err, req, res, next)` 4-인자(맨 마지막 등록), 동기 에러는 자동 캐치, async 는 `async/await` 또는 promise 반환, 콜백 API 는 `next(err)`, 기본 핸들러(`err.status`||500)
- target chapter: `data-and-backend/nodejs-server`
- lesson candidate: `nodejs-server/error-handling`
- license note: 위와 동일. Express 5 는 rejected promise 를 자동 전달(v4 와 차이) — 집필 시 버전 명시.

**B7. 설정/환경변수 & 최소 프로젝트 구조**
- why: `process.env.PORT`, dev/prod 분리 — 기존 GCP 자료에 이미 등장(재사용). 구조는 A5 참조.
- prerequisite: B4, A5
- mastery: required
- source: (기존 자료) `1E235IuK…` `.env.development`/`.env.production`, `1bKTN0FW…` `process.env.PORT || 3000` + Nginx=정적/프록시, Express=API
- 보조 official: Node.js Learn "How much JavaScript…" 및 Express Guide(위) — 별도 env 전용 공식 페이지는 얇음
- checked_at: 2026-09-06 · current
- target chapter: `data-and-backend/nodejs-server`
- lesson candidate: `nodejs-server/config-and-structure`
- license note: 기존 자료(사내 강사 문서) — CMM 내부 사용 전제.
- needs_followup: `dotenv` 라이브러리 vs Node 20+ 내장 `--env-file` 중 무엇을 가르칠지 결정 필요.

### C. Relational DB / PostgreSQL → `data-and-backend/relational-database-operations`

> 공통 DB 기반(관계 모델·기본 SQL·정규화·ERD)은 기존 자료로 `data-and-backend/data-modeling` 에서
> 다룬다. 아래는 **운영 실무** 층이며 Node/Spring 양쪽이 공유한다. 방언은 PostgreSQL 로 통일
> (기존 `SQL 핵심정리` 는 MySQL 방언 — 차이를 한 번 짚어줄 것).

**C1. 관계 모델 & 기본 SQL (Postgres 기준 재정리)**
- why: 기존 자료가 MySQL 방언. Supabase=Postgres 이므로 기준 통일.
- prerequisite: `data-and-backend/data-modeling/sql-essentials`
- mastery: required
- source: "The SQL Language / 2.1 Introduction" — PostgreSQL Documentation
- URL: https://www.postgresql.org/docs/current/tutorial-sql-intro.html
- publisher: PostgreSQL Global Development Group · official: yes · checked_at: 2026-09-06 · current (v18.6)
- backs: 테이블=행/열, 데이터 타입, `CREATE TABLE`, `INSERT`, `SELECT ... WHERE ... ORDER BY`
- target chapter: `data-and-backend/relational-database-operations`
- lesson candidate: `relational-database-operations/postgres-sql-basics`
- license note: PostgreSQL 문서 = PostgreSQL License(BSD 계열). 요약·자작 예제.

**C2. JOIN (FK 관계 기반)**
- why: 정규화로 나눈 테이블을 다시 붙이기. 기존 `SQL 핵심정리` 의 JOIN 절 보강.
- prerequisite: C1, 정규화(기존 자료), ERD(기존 자료)
- mastery: required
- source: "2.6. Joins Between Tables" — PostgreSQL Documentation
- URL: https://www.postgresql.org/docs/current/tutorial-join.html
- publisher: PGDG · official: yes · checked_at: 2026-09-06 · current (v18.6)
- backs: inner join(`... JOIN ... ON`), 암시적 join(구문), `LEFT OUTER JOIN`(비매칭 시 NULL), 테이블 별칭, 컬럼 명시적 수식
- target chapter: `data-and-backend/relational-database-operations`
- lesson candidate: `relational-database-operations/joins`
- license note: 위와 동일.

**C3. 제약 (PK / FK / UNIQUE / NOT NULL / CHECK) & 참조 무결성**
- why: 스키마 설계 = 제약 설계. RLS 이해에도 PK/FK 감각 필요.
- prerequisite: C1
- mastery: required
- source: "5.5. Constraints" — PostgreSQL Documentation
- URL: https://www.postgresql.org/docs/current/ddl-constraints.html
- publisher: PGDG · official: yes · checked_at: 2026-09-06 · current (v18.6)
- backs: `CHECK`, `NOT NULL`, `UNIQUE`(자동 B-tree 인덱스, NULL 다중 허용), `PRIMARY KEY`(= UNIQUE + NOT NULL), `REFERENCES`(FK), `ON DELETE` 액션(NO ACTION/RESTRICT/CASCADE/SET NULL/SET DEFAULT), FK 컬럼은 인덱스 권장
- target chapter: `data-and-backend/relational-database-operations`
- lesson candidate: `relational-database-operations/schema-and-constraints`
- license note: 위와 동일.

**C4. 인덱스 (개념 + trade-off)**
- why: 느린 조회의 1차 처방이자, 남발하면 쓰기가 느려지는 trade-off. 기존 `SQL 핵심정리` 가
  "where 절 뒤 컬럼에 인덱스" 라고만 언급 → 이유·비용까지.
- prerequisite: C1
- mastery: required
- source: "11.1. Introduction" (Indexes) — PostgreSQL Documentation
- URL: https://www.postgresql.org/docs/current/indexes-intro.html
- publisher: PGDG · official: yes · checked_at: 2026-09-06 · current (v18.6)
- backs: 인덱스=책 색인, 없으면 full scan, `CREATE INDEX name ON t (col)`, 쓰기마다 인덱스 유지 비용, 안 쓰는 인덱스는 제거, 기본은 B-tree
- 보조 source: "11.2. Index Types" — https://www.postgresql.org/docs/current/indexes-types.html (official, current) — B-tree/Hash/GIN/GiST 존재만
- target chapter: `data-and-backend/relational-database-operations`
- lesson candidate: `relational-database-operations/indexes`
- license note: 위와 동일.

**C5. 쿼리 플랜 읽기 — `EXPLAIN` / `EXPLAIN ANALYZE`**
- why: "쿼리 최적화 실무" 요구의 핵심 도구. 추측 대신 측정.
- prerequisite: C2, C4
- mastery: understand
- source: "14.1. Using EXPLAIN" — PostgreSQL Documentation
- URL: https://www.postgresql.org/docs/current/using-explain.html
- publisher: PGDG · official: yes · checked_at: 2026-09-06 · current (v18.6)
- backs: 플랜 트리(스캔 노드=leaf), `(cost=시작..총 rows=… width=…)`, Seq Scan vs Index Scan vs Bitmap Scan, join 종류(Nested Loop/Hash/Merge), `EXPLAIN ANALYZE`=실제 실행 + `actual time`/`rows`/`loops`, 행 추정 틀리면 `ANALYZE` 로 통계 갱신
- target chapter: `data-and-backend/relational-database-operations`
- lesson candidate: `relational-database-operations/query-plans`
- license note: 위와 동일. 소규모 테이블 결과는 대규모에 안 맞을 수 있음(문서 caveat) — 집필 시 명시.

**C6. 트랜잭션 (원자성, BEGIN/COMMIT/ROLLBACK, savepoint)**
- why: 게시글+첨부, 이체 등 "여러 SQL 이 전부 성공하거나 전부 실패" 해야 하는 경우.
- prerequisite: C1
- mastery: required
- source: "3.4. Transactions" — PostgreSQL Documentation
- URL: https://www.postgresql.org/docs/current/tutorial-transactions.html
- publisher: PGDG · official: yes · checked_at: 2026-09-06 · current (v18.6)
- backs: 트랜잭션=다단계 SQL 을 전부-아니면-전무로 묶음, 원자성, `BEGIN`/`COMMIT`/`ROLLBACK`, 은행 이체 예, `SAVEPOINT`/`ROLLBACK TO`
- 보조 source: "13.2. Transaction Isolation" — https://www.postgresql.org/docs/current/transaction-iso.html (official, current) — Read Committed 기본, isolation level 존재. mastery: understand.
- target chapter: `data-and-backend/relational-database-operations`
- lesson candidate: `relational-database-operations/transactions`
- license note: 위와 동일. ACID 라는 용어는 이 튜토리얼 페이지엔 없음 — 필요 시 별도 정의.

**C7. 마이그레이션 실무 (버전 관리되는 스키마 변경)**
- why: `relational-database-operations/schema-and-migrations` 레슨의 정면 주제. 기존 자료 0.
- prerequisite: C3
- mastery: required
- source: "Database Migrations" — Supabase Docs
- URL: https://supabase.com/docs/guides/deployment/database-migrations
- publisher: Supabase · official: yes(Supabase 공식) · checked_at: 2026-09-06 · current
- backs: 마이그레이션 = 스키마를 만들고/바꾸고/지우는 버전된 SQL 파일, `supabase/migrations/<timestamp>_name.sql`, `supabase migration new`, `supabase db reset`(로컬 전체 재적용), `supabase db push`(원격 반영), **원격 DB 를 직접 고치지 않는다**, 팀은 로컬 생성→reset 테스트→git 커밋→한 명만 push
- 실사례: 이 저장소 `supabase/migrations/20260826024724_create_learning_data_schema.sql` 등 3개 — 인용 가능
- 보조 source: "Local Development" — https://supabase.com/docs/guides/local-development (official, current)
- target chapter: `data-and-backend/relational-database-operations`
- lesson candidate: `relational-database-operations/schema-and-migrations` (기존 레슨 id 재사용)
- license note: Supabase 문서 Apache-2.0(문서 저장소). 요약·재서술.

**C8. Supabase = Postgres 로 연결 + RLS 이해에 필요한 DB 기반**
- why: CMM 은 Supabase 를 실제로 씀(`baas-supabase-firebase` 챕터, momentalk). RLS 는 행 단위
  보안 = 테이블/행/정책(policy) + `auth.uid()`. 위 C3(제약)·C6(트랜잭션) 기반이 있어야 이해됨.
- prerequisite: C3, `data-and-backend/baas-supabase-firebase`
- mastery: understand
- source: "Row Level Security" — Supabase Docs (조사 시 원문 재확인 — INDEX.md 에 security 가이드 등재)
- URL: https://supabase.com/docs/guides/database/postgres/row-level-security
- publisher: Supabase · official: yes · checked_at: 2026-09-06 · current (URL 은 INDEX.md 색인 + 표준 경로 기준; 집필 전 WebFetch 재확인 권장)
- backs: Postgres RLS = 테이블에 `ENABLE ROW LEVEL SECURITY` + `CREATE POLICY`, PostgREST 가 SQL 없이 REST 를 열어주는 구조, `anon`/`authenticated` 롤
- target chapter: `data-and-backend/relational-database-operations` ↔ `baas-supabase-firebase` 연결 레슨
- lesson candidate: `relational-database-operations/postgres-and-supabase-rls`
- license note: Apache-2.0. needs_followup: RLS 상세 정책 문법은 별도 레슨(BaaS 챕터와 조율).

### D. Java / Spring / Spring Boot (신설 제안 — 자료 0, 전량 외부)

**D1. 최소 Java 선행**
- why: CMM 에 Java 트랙 없음. Spring 이전에 클래스/인터페이스/제네릭/어노테이션/빌드도구(Gradle) 최소.
- prerequisite: `javascript/classes-and-modules`, `typescript`(타입 감각)
- mastery: understand
- source: (공식) "Building a RESTful Web Service" — Spring Guides 의 사전요구 + Java 기본은 별도.
  집필 시 Oracle "Java Tutorials"(https://docs.oracle.com/javase/tutorial/) 또는 dev.java 의
  클래스/인터페이스/제네릭/어노테이션 페이지 인용 권장.
- URL: https://dev.java/learn/ (Oracle 운영, official) · checked_at: 2026-09-06 · current — **아직 WebFetch 미확인**, 집필 전 확인 필요
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/minimal-java-for-spring`
- license note: Oracle 튜토리얼 인용 조건 확인 필요. needs_followup: yes.

**D2. IoC / DI / 빈 (Spring Core)**
- why: Spring 의 근본 개념. "객체 생성·주입을 컨테이너가 한다".
- prerequisite: D1
- mastery: understand
- source: "Introduction to the Spring IoC Container and Beans" — Spring Framework Reference
- URL: https://docs.spring.io/spring-framework/reference/core/beans/introduction.html
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (Spring Framework 7.0.9)
- backs: IoC=생성·생명주기를 컨테이너에 위임, DI=생성자/팩토리/프로퍼티로 의존성 주입, `ApplicationContext`(BeanFactory 상위셋), 빈=컨테이너가 인스턴스화·조립·관리하는 객체
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/ioc-di-beans`
- license note: Spring 문서 ASLv2. 요약·자작 코드.

**D3. Spring Boot (스타터, 자동설정, `@SpringBootApplication`) + DI 실무**
- why: 실제로 앱을 띄우는 방법. 스타터가 무엇을 가져오는지.
- prerequisite: D2
- mastery: required
- source: "Spring Beans and Dependency Injection" — Spring Boot Reference
- URL: https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (Spring Boot 4.1.x)
- backs: 생성자 주입 권장(`final`), 스테레오타입 `@Component`/`@Service`/`@Repository`/`@Controller`, `@SpringBootApplication` = `@Configuration`+`@EnableAutoConfiguration`+`@ComponentScan`, 앱 클래스는 최상위 패키지, 자동설정은 classpath 의 jar 기반
- 보조 source: "Building a RESTful Web Service" — https://spring.io/guides/gs/rest-service (Spring Initializr, `spring-boot-starter-web`)
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/boot-autoconfig-and-starters`
- license note: ASLv2.

**D4. `@RestController` + 요청 매핑 (REST API)**
- why: web dev 가 바로 만드는 것. Node 트랙의 REST 개념(A4)을 Java 로.
- prerequisite: D3, A4
- mastery: required
- source: "Building a RESTful Web Service" — Spring Guides
- URL: https://spring.io/guides/gs/rest-service
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (2026 저작권)
- backs: `@RestController`, `@GetMapping`/`@PostMapping` 등, `@RequestParam`(+`defaultValue`)·경로변수, 반환 객체 → Jackson JSON 자동 직렬화
- 보조 source(집필 시 재확인): "Annotated Controllers" — https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html (official, current) — `@RequestBody`/`@PathVariable`/`ResponseEntity`
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/rest-controller`
- license note: ASLv2.

**D5. 입력 검증 (Bean Validation)**
- why: "input validation" 요구. Node(B5)와 대칭.
- prerequisite: D4
- mastery: required
- source: "Validating Form Input" — Spring Guides
- URL: https://spring.io/guides/gs/validating-form-input
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (2026 저작권)
- backs: Jakarta Bean Validation 어노테이션(`@NotNull`/`@Size`/`@Min` 등), 컨트롤러 파라미터에 `@Valid`, `BindingResult` 로 위반 수집, `spring-boot-starter-validation`
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/request-validation`
- license note: ASLv2. 가이드는 Thymeleaf 폼 예 — REST 로 각색(`@RequestBody @Valid` + 400 응답).

**D6. 예외 처리 (`@ExceptionHandler` / `@ControllerAdvice`)**
- why: "error handling" 요구. Node(B6)와 대칭. 일관된 에러 응답.
- prerequisite: D4
- mastery: required
- source: "Exceptions" (`@ExceptionHandler`) — Spring Framework Reference (Web MVC)
- URL: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (Spring Framework 7.0.9)
- backs: 컨트롤러 내 `@ExceptionHandler(X.class)`, 전역 `@ControllerAdvice`/`@RestControllerAdvice`, 반환값으로 `ResponseEntity`/`ProblemDetail`(RFC 9457), 상태코드 지정
- 보조 source(집필 시 재확인): "Error Responses" — https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/exception-handling`
- license note: ASLv2.

**D7. 설정 (`application.properties` / `.yml`)**
- why: 포트·DB URL·프로파일. Node 의 env(B7)와 대칭.
- prerequisite: D3
- mastery: understand
- source: (집필 시 WebFetch) "Externalized Configuration" — Spring Boot Reference
- URL: https://docs.spring.io/spring-boot/reference/features/external-config.html
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · **아직 WebFetch 미확인** — 집필 전 확인
- backs: `application.properties`/`application.yml`, `spring.datasource.*`, 프로파일(`application-dev.yml`), 환경변수 오버라이드
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/configuration`
- license note: ASLv2. needs_followup: yes(원문 미확인).

**D8. Spring Data JPA 기초**
- why: "DB CRUD with Spring Boot" 의 데이터 접근층. `@Repository` 계층 실체.
- prerequisite: D3, C1~C3
- mastery: required
- source: "Accessing Data with JPA" — Spring Guides
- URL: https://spring.io/guides/gs/accessing-data-jpa
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (2026 저작권)
- backs: `@Entity`/`@Id`/`@GeneratedValue`, `CrudRepository<T,ID>`/`JpaRepository`, 파생 쿼리(`findByLastName`), 런타임에 구현체 생성, `spring-boot-starter-data-jpa`
- 보조 source(집필 시 재확인): "Spring Data JPA Reference" — https://docs.spring.io/spring-data/jpa/reference/
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/spring-data-jpa`
- license note: ASLv2. 가이드는 H2 in-memory — 실전은 Postgres 로 각색.

**D9. `@Transactional` 기초**
- why: C6(트랜잭션)의 Java/Spring 적용. 서비스 메서드 경계.
- prerequisite: D8, C6
- mastery: understand
- source: "Using `@Transactional`" — Spring Framework Reference (Data Access)
- URL: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
- publisher: Spring (Broadcom) · official: yes · checked_at: 2026-09-06 · current (Spring Framework 7.0.9)
- backs: 선언적 트랜잭션, 클래스/메서드에 `@Transactional`, 기본은 RuntimeException/Error 에서 롤백(체크예외는 아님), `readOnly=true`, 프록시 기반 → **자기호출(self-invocation) 시 적용 안 됨**
- target chapter: (신설) `spring-boot/*`
- lesson candidate: `spring-boot/transactions`
- license note: ASLv2.

**D10. 보안/인증 — 후속 스코프 명시**
- Spring Security / JWT / OAuth2 는 이 챕터에서 다루지 않는다(요구사항: "mark security/auth as follow-up").
- 후속 참고(미조사): https://docs.spring.io/spring-security/reference/ , https://spring.io/guides/gs/securing-web
- needs_followup: yes.

---

## 기존 Curriculum과 연결

| CMM 요소 | 연결 방식 |
|---|---|
| `data-and-backend/data-modeling` (erd/normalization/relational-vs-nonrelational/sql-essentials) | **공통 DB 기반**. 기존 자료로 이미 커버. `relational-database-operations` 와 Spring/Node DB 파트는 이걸 prerequisite 로 참조하고 중복 설명 금지. 단 SQL 방언은 Postgres 로 통일 필요(현재 MySQL). |
| `data-and-backend/backend-integration/frontend-to-webserver-db` (`1a63pT8q`, `1pVRYcYZ`) | Backend Fundamentals 의 클라이언트→서버→DB 흐름과 겹침. CORS 자료(`1a63pT8q`)를 미들웨어 레슨(B5)과 공유 참조. |
| `data-and-backend/nodejs-server/express-rest-api` (현재 `needs_external_research`, `related_material_ids: []`) | **PARTIAL**. `related_material_ids` 를 `1CvaWGWq/1peKntI-/1KeXe0iq/1bos2ISU`(+`1k0hObTy` 세팅) 로 채우고 `status: skeleton` 승격. 개념(B1·B2·B4·B5·B6·A1·A4)은 공식 문서로 집필. 레슨 여러 개로 분할 권장(챕터에 레슨 1개뿐). |
| `data-and-backend/relational-database-operations/schema-and-migrations` (현재 `needs_external_research`, `[]`) | **NOT READY**. C1~C8 전량 외부. 이 저장소 `supabase/migrations/*.sql` 을 실사례로 인용. 레슨 분할(현재 1개): sql-basics/joins/constraints/indexes/query-plans/transactions/migrations/rls. |
| `data-and-backend/baas-supabase-firebase/supabase-in-a-real-project` (`1NFB5KVA`, momentalk units) | C8(Postgres/RLS)과 상호 참조. "Supabase 뒤에 Postgres 가 있다" 를 `relational-database-operations` 가 근거로 제공. |
| `react/board-crud-app` (게시판 CRUD, `1CvaWGWq`~`1AkBUevg`) | BBS 서버 자료가 여기 매핑돼 있음. **dual-map**: 같은 자료를 `nodejs-server` 에서 "서버 쪽 관점" 으로도 참조(README §1 이 loose ref 중복 허용). |
| `deployment-and-infra/node-app-hosting/gcp-vm-deploy` (`1MjC0nvq/1bKTN0FW/1E235IuK/1b9CclzJ`) | 다른 에이전트 스코프. `1bKTN0FW` 의 "Express=API, Nginx=정적/프록시" 는 B7(구조) 보조 자료로만 인용, 배포 절차는 건드리지 않음. |
| `javascript/async-and-http` | Node 이벤트 루프(B1)·`http`(B2)의 prerequisite. |
| Spring 챕터 | 현재 커리큘럼에 **없음**. 아래 "향후 확장" 에서 신설 제안(YAML 미수정). |

---

## 부족한 부분

- **Node 챕터 레슨 수 부족**: `nodejs-server` 챕터에 레슨이 `express-rest-api` 1개뿐. 최소
  runtime/이벤트루프 · builtin-http · routing&modules · middleware · error-handling · config&structure
  로 5~6개 분할 필요(이 조사가 근거 제공).
- **DB 운영 챕터 레슨 수 부족**: `relational-database-operations` 도 레슨 1개(`schema-and-migrations`).
  8개(C1~C8)로 분할 필요.
- **SQL 방언 불일치**: 기존 `SQL 핵심정리` = MySQL(InnoDB, `AUTO_INCREMENT`, `utf8mb4`), BBS 예제도
  MySQL(`mysql`/`mysql2` 드라이버). 그런데 Supabase = PostgreSQL. 기준을 Postgres 로 잡고
  "MySQL 과의 차이(자동증가: `SERIAL`/`IDENTITY`, 문자셋 등)" 를 한 번 정리하는 레슨/섹션 필요.
- **`http` 모듈 raw 예제의 공식 코드가 얇음**: Node.js Learn "Anatomy…" 는 echo 서버 위주.
  CRUD 라우팅을 raw `http` 로 보여주려면 자작 예제 필요(공식엔 없음).
- **프로젝트 구조(controller/service/repository)의 Node 쪽 공식 단일 출처 없음**: Express 문서는
  `express.Router` 까지만. 계층 구조는 Spring 스테레오타입 개념 + 자작 폴더 예제로 합성해야 함.
- **ORM/쿼리빌더 미조사**: Node 에서 raw SQL 을 넘어설 때(Prisma/Knex/Drizzle) 무엇을 가르칠지 미정.
  기존 자료는 전부 raw `mysql.query`. 요구 스코프상 raw SQL + 파라미터 바인딩까지가 최소선.
- **Java 기초·Spring 설정·Spring Data 레퍼런스 3개 URL 미검증**: D1(dev.java), D7(external-config),
  D8 보조(spring-data-jpa reference), D4/D6 보조(mvc-controller, rest-exceptions) 는 이번에 WebFetch
  하지 않음. 집필 착수 전 재확인 필요(needs_followup 표시함).
- **인증/인가 심화 자료 전무**: 세션 vs JWT, OAuth2, Supabase Auth 내부, Spring Security — 전부
  후속 조사 대상. 이번 스코프는 "기초(401/403, Authorization 헤더)" 까지.
- **테스트 자료 없음(백엔드)**: API 테스트(supertest / Spring `@SpringBootTest`, MockMvc) 미조사.
- **momentalk 저장소 직접 트리 확인 불가**: `gh` CLI 미설치. `projects.yaml` 문서로 대체 확인.

---

## 향후 확장

### 1) Node 챕터 레슨 분할 제안 (`data-and-backend/nodejs-server`, YAML 미수정 — 제안만)

| lesson id 후보 | title | mastery | 근거 |
|---|---|---|---|
| `nodejs-server/node-runtime-and-event-loop` | Node 런타임과 이벤트 루프 | understand | B1 |
| `nodejs-server/builtin-http-server` | 내장 http 모듈로 서버 만들기 | understand | B2 |
| `nodejs-server/express-rest-api` (기존) | Express로 REST API 서버 만들기 | required | B3 + 기존 자료 8종 |
| `nodejs-server/routing-and-modules` | 라우팅 심화와 모듈 분리 | required | B4 |
| `nodejs-server/middleware` | 미들웨어와 바디 파싱 | required | B5 + `1peKntI-`,`1a63pT8q`,`1AkBUevg` |
| `nodejs-server/error-handling` | 에러 처리 미들웨어 | required | B6 |
| `nodejs-server/config-and-structure` | 환경설정과 프로젝트 구조 | required | B7 + A5 |

### 2) DB 운영 챕터 레슨 분할 제안 (`data-and-backend/relational-database-operations`, 제안만)

`postgres-sql-basics`(C1) · `joins`(C2) · `schema-and-constraints`(C3) · `indexes`(C4) ·
`query-plans`(C5) · `transactions`(C6) · `schema-and-migrations`(C7, 기존 id) ·
`postgres-and-supabase-rls`(C8).

### 3) Spring 챕터 신설 제안 (`spring-boot` Track 또는 `data-and-backend/spring-boot` Chapter)

- **위치**: `data-and-backend` 트랙 안 새 Chapter `data-and-backend/spring-boot`
  (ord: `relational-database-operations`(50) 뒤 → 60), status: `needs_external_research`.
  또는 독립 Track `spring-boot`(ord 75, kind: curriculum, status: needs_external_research).
- **성격**: 선택/후속. Node 트랙 이수 후. "웹 개발자가 Spring Boot 로 기본 REST + DB CRUD 를 만들고
  구조를 이해한다" 가 목표. 백과사전식 X.
- **레슨 후보**(D1~D9):

| lesson id 후보 | title | mastery |
|---|---|---|
| `spring-boot/minimal-java-for-spring` | Spring을 위한 최소 Java | understand |
| `spring-boot/ioc-di-beans` | IoC·DI와 빈 | understand |
| `spring-boot/boot-autoconfig-and-starters` | Spring Boot 자동설정과 스타터 | required |
| `spring-boot/rest-controller` | @RestController로 REST API | required |
| `spring-boot/request-validation` | 요청 검증 (Bean Validation) | required |
| `spring-boot/exception-handling` | 예외 처리 (@ControllerAdvice) | required |
| `spring-boot/configuration` | application.yml 설정 | understand |
| `spring-boot/spring-data-jpa` | Spring Data JPA로 DB CRUD | required |
| `spring-boot/transactions` | @Transactional 기초 | understand |

- **명시적 비스코프**: Spring Security, JWT/OAuth2, 마이크로서비스, 리액티브(WebFlux), 배포/도커.
- **선행**: `data-and-backend/data-modeling`(공통 DB 기반) + `data-and-backend/relational-database-operations` C1~C3, C6.

### 4) 공통 후속 조사 항목 (별도 승인 단계)

- Node ORM/쿼리빌더 선택(Prisma vs Knex vs Drizzle vs raw).
- 인증 심화(세션/JWT/OAuth2, Supabase Auth, Spring Security).
- 백엔드 테스트(supertest, MockMvc/`@SpringBootTest`).
- API 문서화(OpenAPI/Swagger).
- Java 기초 · Spring 설정/Spring Data 레퍼런스 3개 URL 검증(D1/D7/D8 보조).
- MySQL↔PostgreSQL 방언 차이 정리 레슨.

---

## 출처 요약 (이번에 WebFetch 로 원문 확인한 공식 문서)

| # | 제목 | URL | publisher | official | current |
|---|---|---|---|---|---|
| 1 | Overview of HTTP | https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview | Mozilla MDN | yes | yes (2026-08-21) |
| 2 | HTTP request methods | https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods | Mozilla MDN | yes | yes (2025-07-04) |
| 3 | HTTP authentication | https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication | Mozilla MDN | yes | yes (2026-09-04) |
| 4 | The Node.js Event Loop | https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick | OpenJS Foundation | yes | yes |
| 5 | Anatomy of an HTTP Transaction | https://nodejs.org/learn/http/anatomy-of-an-http-transaction | OpenJS Foundation | yes | yes |
| 6 | Express — Basic routing | https://expressjs.com/en/starter/basic-routing.html | OpenJS Foundation | yes | yes (v5.x) |
| 7 | Express Guide — Routing | https://expressjs.com/en/guide/routing.html | OpenJS Foundation | yes | yes (v5.x) |
| 8 | Express Guide — Using middleware | https://expressjs.com/en/guide/using-middleware.html | OpenJS Foundation | yes | yes (v5.x) |
| 9 | Express Guide — Error Handling | https://expressjs.com/en/guide/error-handling.html | OpenJS Foundation | yes | yes (v5.x) |
| 10 | PostgreSQL — 2.1 The SQL Language (Intro) | https://www.postgresql.org/docs/current/tutorial-sql-intro.html | PGDG | yes | yes (v18.6) |
| 11 | PostgreSQL — 2.6 Joins Between Tables | https://www.postgresql.org/docs/current/tutorial-join.html | PGDG | yes | yes (v18.6) |
| 12 | PostgreSQL — 5.5 Constraints | https://www.postgresql.org/docs/current/ddl-constraints.html | PGDG | yes | yes (v18.6) |
| 13 | PostgreSQL — 11.1 Indexes Introduction | https://www.postgresql.org/docs/current/indexes-intro.html | PGDG | yes | yes (v18.6) |
| 14 | PostgreSQL — 3.4 Transactions | https://www.postgresql.org/docs/current/tutorial-transactions.html | PGDG | yes | yes (v18.6) |
| 15 | PostgreSQL — 14.1 Using EXPLAIN | https://www.postgresql.org/docs/current/using-explain.html | PGDG | yes | yes (v18.6) |
| 16 | Supabase — Database Migrations | https://supabase.com/docs/guides/deployment/database-migrations | Supabase | yes | yes |
| 17 | Spring Guides — Building a RESTful Web Service | https://spring.io/guides/gs/rest-service | Spring (Broadcom) | yes | yes (2026) |
| 18 | Spring Guides — Accessing Data with JPA | https://spring.io/guides/gs/accessing-data-jpa | Spring (Broadcom) | yes | yes (2026) |
| 19 | Spring Guides — Validating Form Input | https://spring.io/guides/gs/validating-form-input | Spring (Broadcom) | yes | yes (2026) |
| 20 | Spring Framework Ref — Intro to IoC Container and Beans | https://docs.spring.io/spring-framework/reference/core/beans/introduction.html | Spring (Broadcom) | yes | yes (7.0.9) |
| 21 | Spring Boot Ref — Spring Beans and Dependency Injection | https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html | Spring (Broadcom) | yes | yes (Boot 4.1.x) |
| 22 | Spring Framework Ref — Exceptions (@ExceptionHandler) | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html | Spring (Broadcom) | yes | yes (7.0.9) |
| 23 | Spring Framework Ref — Using @Transactional | https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html | Spring (Broadcom) | yes | yes (7.0.9) |

**보조로 지목했으나 이번에 원문 미확인(집필 전 WebFetch 필요)**: PostgreSQL 11.2 Index Types,
PostgreSQL 13.2 Transaction Isolation, Supabase Local Development, Supabase Row Level Security,
Node.js Learn "Blocking vs Non-Blocking", Spring MVC "Annotated Controllers", Spring MVC "Error Responses",
Spring Boot "Externalized Configuration", Spring Data JPA Reference, dev.java / Oracle Java Tutorials,
Spring Security Reference.

집계: 이번에 원문 확인한 출처 **23개(전부 공식)**. 그중 MDN 3 / Node.js 2 / Express 4 /
PostgreSQL 6 / Supabase 1 / Spring 7. 비공식 블로그 인용 **0건**.
