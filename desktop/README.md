# CMM Desktop PoC (Windows)

This is a **checkout-bound PoC**, not a portable distribution. It runs the current
CMM Next application with its existing server components, password login, cookies,
Tutor session/message APIs and STT. It never opens a production URL or Chrome.

## Run

From the repository root, with Node 24+, Rust MSVC stable, Visual Studio C++ Build
Tools/Windows SDK and WebView2 installed:

```powershell
npm ci
npm ci --prefix viewer
npm run desktop:dev
```

`viewer/.env.local` remains local and ignored. Use the existing Supabase/Groq
configuration. API secrets stay in the Next server, not Tauri IPC or client JS.
The CLI adds the normal user `.cargo/bin` location to its child PATH only.

```powershell
npm run desktop:build
./src-tauri/target/release/cmm-desktop.exe
```

The build runs Next first, records source SHA-256 / Git HEAD / Next BUILD_ID, then
embeds that BUILD_ID and the current Node executable location in the Rust EXE.
The EXE needs this checkout, its node_modules, local env and build files in place.
Moving the checkout or Node requires rebuilding. There is no installer, updater,
packaged Node, automatic MeloTTS startup or replacement desktop shortcut yet.

## Architecture and ownership

- Tauri 2 / WebView2 → owned Node custom server → the existing Next app.
- Dev: `127.0.0.1:4318`, Next development/HMR, `.next-desktop/dev` output.
- Release: `127.0.0.1:4319`, `.next-desktop` production build.
- Separate persistent WebView profiles under the app's local data directory for
  dev and release. Neither uses any Chrome profile. Login persists per profile.
- Bind loopback only, reserve the exact port, and require the launched process's
  readiness identifier. An occupied port fails; no auto-attach/port fallback.
- Rust owns the child process and kills/waits on exit. Its stdin pipe also lets
  Node detect a lost parent. Helper console windows are hidden.
- No JS Tauri API, plugins, filesystem/shell capabilities or custom IPC commands.
  Main navigation stays within the owned origin; popups/external navigation are
  denied in this PoC. Microphone/autoplay retain WebView2's user permission policy;
  other new permission requests are denied. There are no insecure browser flags.
- Desktop requests do not trigger the web deployment's background refresh workflow.
  Tutor use still accesses the configured Supabase/Groq services as before.

Static export would remove required Next server functions. A bundled standalone
Node sidecar is a reasonable distribution step, but adds packaging, resource and
secret-provisioning work. This smaller PoC validates the real Next runtime first.

## Source identity and cache

Desktop devtools / local diagnostics:

```js
await fetch('/__cmm_desktop/identity').then(r => r.json())
```

Dev reports startup and current source hashes (HMR may still be compiling when a
file has just changed). Release refuses to start if current source, manifest,
Next BUILD_ID or the EXE's expected BUILD_ID differ. Logs are in
`desktop/.runtime/dev.log` and `build.log`; they are ignored by Git.

The old SW is cache-first for `_next/static`, using one stable cache name. In dev,
asset URLs can be reused, so its content-hash assumption is insufficient.
Desktop uses an isolated origin/profile, skips SW registration, serves a retiring
SW at `/sw.js`, and starts on a bootstrap document that unregisters workers and
clears **only that Desktop origin's CacheStorage** before loading `/tutor`.
Desktop responses (including JS) are `Cache-Control: no-store`. Cookies and
localStorage are preserved. The web SW and Chrome caches are untouched.

## Audio

The Tutor components and manual-turn state machine are unchanged. The existing
MeloTTS provider uses `/__cmm_desktop/melotts` only in Desktop builds. This tiny
server adapter forwards only GET `/health` and POST `/synthesize` to the existing
configured HTTP loopback MeloTTS service (default `127.0.0.1:8787`). It does not
forward cookies, follow redirects, accept arbitrary upstream URLs, or expose a
general proxy. Host/Origin checks reject other websites and DNS rebinding.
Request bodies are limited; playback cancellation aborts the upstream request.

This same-origin path avoids WebView CORS/PNA changes without broadening the
MeloTTS service's CORS allowlist. MeloTTS must still be running separately.
`getUserMedia` remains explicit user action on the loopback secure context.
Actual microphone hardware, OS privacy settings and audible speaker quality need
user verification. A denied permission must remain denied until the user changes it.

## Verification

```powershell
npm run typecheck
npm run typecheck --prefix viewer
npm test
git diff --check
```

`tests/desktop-runtime.test.ts` covers source changes, build mismatch rejection
and Host/Origin boundaries. Native window, auth persistence, media and runtime
ownership require integration checks as well; browser-only results are not proof
that WebView2 passed. See the final task report for executed checks and limitations.

Existing Chrome launcher files, Tutor UX, deployment and production distribution
are outside this change. No desktop remote-debugging port is enabled by default.

### Executed on 2026-10-01 (Windows)

- Rust 1.98.1 MSVC, VS Build Tools 2022 17.14, Windows SDK 10.0.26100,
  WebView2 154.0.4258.37. Native `cargo check`, Tauri dev and release EXE build passed.
- Final Desktop + Lesson entry baseline: root/viewer typechecks and 432 tests /
  99 suites passed.
- Actual WebView2: password login and `/tutor` return; Lesson + Sidebar;
  real Tutor message HTTP 200; two MeloTTS chunks HTTP 200 with two `playing` and
  two `ended` events, both Object URLs revoked and audio sources cleared.
- Synthetic speech fed into the **WebView2 MediaRecorder**, without accessing
  physical microphone: recording survived 9 seconds of speech + silence until the
  explicit stop button. Real STT returned `다시 설명해 주세요.` (HTTP 200), auto-send
  and real LLM/TTS followed. TTS stop, voice OFF, panel close and track cleanup passed.
- Microphone API/MediaRecorder present, secure context true, permission `prompt`.
  Actual hardware permission approval, noisy environment and audible speaker quality
  remain MANUAL CHECK; they were not simulated as a hardware pass.
- Release restart retained login cookies and a test localStorage marker, removed
  a deliberately seeded stale cache, and had zero registered workers. The marker
  was removed afterward. Actual Next JS asset response was `Cache-Control: no-store`.
- Normal exit of both native windows removed their Node processes and listeners.
  Wrong build ID and occupied port were rejected without affecting another server.
- HTML Material and Lesson links both reached
  `/lesson/web-foundations/html-structure/semantic-tags` in the release WebView.
  Curriculum, Tutor resume/picker, review, search, direct Lesson, integrated learning
  and project-example entry passed. Unmapped `강사소개 - v2026` stayed on `/m`;
  Lesson's original-material link also opened `/m` without redirect.
- Regular Lesson entry always opens the existing Tutor Sidebar, independently of
  `?tutor=open`. Material entry uses only explicit `related_material_ids`; multiple
  matches use the existing chapter/ord/id ordering. No Tutor-mode banner is added.
- One-off verification scripts/screenshots/results were cleaned from the ignored
  `desktop/.runtime/` directory. Keep `build.json` (required release manifest) and
  `dev.log` / `build.log` (runtime diagnostics). Debugging ports were enabled only
  in the verification process environment.

Official references: [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/),
[Tauri releases](https://v2.tauri.app/release/),
[WebView window / permissions](https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html),
[Next custom server](https://nextjs.org/docs/app/guides/custom-server).
