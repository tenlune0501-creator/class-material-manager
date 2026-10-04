# Lesson-first navigation

The October 4, 2026 product decision makes Lesson the default unit of study and
Material an explicitly selected reference. It supersedes the earlier behavior
that resolved a Material title to the first related Lesson.

## Entry points

| Entry | Previous behavior | Current behavior |
| --- | --- | --- |
| Home | Material statistics, subject cards, integrated materials | Existing curriculum page, shared with `/curriculum` |
| Desktop sidebar | Learning destinations mixed with Material subject counts | Tutor, curriculum, projects, Lesson review, one material library entry |
| Mobile bottom navigation | Home, curriculum, Lesson, More | Same four items; More contains the shared material library entry |
| Subject `/s/...` | Material titles resolved to Lessons when mapped; extra Lesson rows | Material titles open `/m/...`; references stay available |
| Integrated materials `/learn` | Mapped Material titles opened Lessons | Material catalogue inside the library |
| Review `/study` | Material/guide list mixed with related Lessons | Only explicitly related Lessons needing review; curriculum fallback |
| Material review | `/study` priority/subject filters and guides | Preserved at `/materials/study` with the same data and filters |
| Search | Material titles could silently open Lessons | Separate related Lesson list, typed Material/reference results |
| Projects | Project → Unit → related Lesson | Preserved |
| Examples / comparisons | Material and reference exploration | Preserved inside the library |
| Tutor `/tutor` | Lesson selection/resume | Preserved; actual learning stays at `/lesson/...` |
| Lesson | Content plus Tutor and explicit original Material links | Preserved |
| Material `/m/...` | Original content, TOC, related information | Preserved; library context, no Tutor, no redirect |

## Shared structure

`viewer/lib/navigation.ts` owns primary destinations, secondary library tools,
and route classification. The same AppShell drawer content serves Desktop and
Mobile More. Material subjects and their counts appear only on library routes.
Counts still come from `getSubjects()` in the existing data layer, not from
Lesson counts. Existing `/m`, `/s`, `/r`, `/learn`, `/compare`, and `/examples`
URLs remain valid.

`/materials` reuses the former home catalogue, statistics, data-health handling,
subject cards, and collection status. `/materials/study` preserves the former
Material review UI and `StudyCard`. No data migration is involved.

Relationships continue to use explicit `related_material_ids` through
`getLessonsForMaterials`; titles are never used to guess a relationship. Lesson
original-material links remain direct `/m/...` links. Search searches the existing
Material/reference index and presents associated Lessons separately; this change
does not add independent full-text indexing of Lessons.

## Regression boundaries

No Tutor controller, LessonTutorSidebar, voice, recording, authentication,
Service Worker, database schema, or Tauri runtime code changes are required.
Desktop overlay below 1400 CSS pixels and 380px push at/above 1400 are preserved.
The legacy Material-to-Lesson resolver remains available for compatibility but
is no longer used for Material catalogue links.

Validation commands:

```powershell
npm test
npm run typecheck
npm run typecheck --prefix viewer
npx playwright test --config playwright.mobile.config.ts
npm run build --prefix viewer
# For validation only: select a separate CARGO_TARGET_DIR before desktop:build.
npm run desktop:build
```

The Playwright suite uses existing test authentication and mocks Tutor writes
and media through `e2e/helpers/tutor-mocks.ts`. It tests real viewer rendering and
navigation, not physical microphone/speaker quality. Native WebView2 validation
must separately check its runtime identity; browser results alone do not prove it.

## Executed validation (2026-10-04)

- `npm test`: 448 tests, 104 suites, all passed; root/viewer typechecks passed.
- Web production build and the separate Windows Tauri release build passed.
- Playwright: 8 Lesson-first cases, 6 existing Mobile PWA cases, and 24 viewer
  cases passed across targeted runs. The first new test run had selector/timing
  failures; the corrected 8-case suite passed without skips. No application
  workaround was added for those test failures.
- Explicit navigation cases covered 390, 430, 768, 820, 1280, 1366 and 1440px.
  Existing PWA cases also exercised the 899/900 and 1399/1400 boundaries, voice
  mocks, text/history/draft preservation, safe-area spacing and auth expiry.
- Actual Tauri/WebView2 in a separate verification profile: 820/900/1280/1366px
  overlay; 1400/1440px sticky push, measured 380px. Resizing caused no additional
  session starts. Home → library → HTML → Material, destination selection,
  existing test-session authentication, and zero registered workers were verified.
- Native runtime source digest:
  `60be4b837f17e0b73e783082e7d4df4928a5c9fe608d6a19d1581ba63fa21534`.
  BUILD_ID: `mYrP7XVc5JWU3cx6_MYgv`. Runtime identity matched the build manifest.
- Verification EXE: `desktop/.runtime/mobile-target/release/cmm-desktop.exe`.
  The existing `src-tauri/target/release/cmm-desktop.exe` hash was unchanged.
- Owned verification processes were stopped; user applications were not replaced.

Limits: hardware audio and production deployment were not tested. The development
server emitted an existing Markdown heading-ID hydration warning on Material
content, plus a transient upstream JWT timestamp error; subsequent navigation and
native checks passed. Neither authentication policy nor Markdown rendering was
changed. The old user EXE remains incompatible with the current Desktop BUILD_ID
until a separately authorized executable update. No commit, push or deployment.
