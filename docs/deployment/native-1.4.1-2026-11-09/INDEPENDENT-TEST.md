# Independent native 1.4.1 candidate verification

2026-11-09, Asia/Shanghai. Fixed source: `39d64f18bb6ffcf5125a05719ccbf492dcc1ce81`, including product `debf26c`.

**PASS within the Windows and Android package scope below.** No product defect was reproduced. Windows installation, synthetic upgrade and actual WebView2 interactions passed. Android package integrity and signing passed; Android execution, touch, keyboard, rotation and on-device upgrade remain unverified. These results support delivery for the user's personal testing, not publication or push.

## Isolation and environment

Separate GPT chat and worktree: `C:/Users/fengcai/.codex/worktrees/20a3/now-what-to-do`, initially clean and detached at the fixed source. Read the current deployment guide, candidate release, relevant validation results and development rules. No product source changes, package rebuilding, push, master merge or access to real app data. Prior installers remain intact.

Windows, Node 24.18.0, npm 11.16.0, Playwright 1.64.1, Edge and WebView2 157.0.4341.42. Initial `npm ci --ignore-scripts` was stopped after slow mirror downloads and optional dependency failures; an offline retry reported ENOTCACHED. Reused the main repository's installed dependencies of the same declared versions, then independently built this worktree's source. This is an independent source build, not an independent dependency supply-chain audit.

Native installation used `NOWWHAT_INSTALL_TEST=1` and a unique directory containing spaces. Every native launch used `NOWWHAT_E2E=1`, a unique `NOWWHAT_E2E_PROFILE`, an allocated loopback CDP port, and an isolated export directory. Browser scenarios used fresh contexts and synthetic data. No user profile was opened or cleared.

## Exact candidates tested

Paths are under `D:/code/now-what-to-do/dist/native-preview-1.4.1/`.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `windows/Now-What-1.4.1-Windows-x64-Setup.exe` | 19,500,594 | `47F2924EA30F317C363ACEED09BCE796D0CD7A81FF6C81173E3763FA9BE1F6FA` |
| `android/Now-What-1.4.1-Android.apk` | 19,064,578 | `E1C284F8358CB780BDFCD234693C8E9EFD634A35F8EA6025FED55AF4B1576753` |

Retained 1.4.0 installer/APK hashes still match the published release record: Windows `6B08CEA74B138C4806C5B788EF98790681D43EB1CE3FC5492AB0C2EFD2EFCF00`, Android `3A3FB094F21B6AD81DE34F4670F00E73A0AE1E393E6C9868D46430D3F3F0FF85`.

## Independent source and browser checks

| Check | Result |
| --- | --- |
| `npm run build:web` | PASS: TypeScript, Vite and 270 assembled files. |
| `node --test tests/*.test.cjs` | PASS: 144 tests, zero failed/cancelled/skipped. |
| `npx playwright test tests/e2e/task-reorder.spec.ts tests/e2e/task-pin.spec.ts tests/e2e/mobile-book.spec.ts --workers=1`, port 8807 | PASS: 14 tests in 39.2 seconds. Includes pointer/keyboard ordering, cross-page hover, pinning, default expanded descriptions, mobile pagination/import reachability, viewport contraction and continuation controls. Mobile results are browser emulation. |
| Supplemental visual runner, port 8808 | PASS: English/Chinese/Japanese x light/dark at 1531 x 715. Long names preserve separate grip/edit/pin/Start bounds. Real mouse dragging produces the expected order. Thirty final screenshots cover tasks, active drag, editor, settings and import confirmation. Contact sheets were visually inspected. |

For each candidate's 270 web files, 226 match the independent build byte-for-byte and 44 text resources match after CRLF-to-LF normalization. The differences come from checkout line endings in SVG/CSS/license/provenance files, not app behavior. `app.js`, `style.css` and Windows `index.html` match exactly. Android `index.html` matches after its documented native-bridge injection. No other content difference was accepted. The complete normalized-file list is retained in evidence.

## Actual Windows candidate

| Scenario | Observed result |
| --- | --- |
| Installation and contents | PASS. Actual silent installer, isolated path with spaces, 275 host/bridge/license/manifest/web files equal the candidate unpacked payload. Executable version is 1.4.1. Native bridge matches fixed source after newline normalization. |
| 1.4.0 to 1.4.1 upgrade | PASS. Installed retained 1.4.0, seeded 23 synthetic activities, started and paused a real timer, closed the host, then installed 1.4.1 over the same isolated directory. Tasks/preferences were unchanged. Recovery produced exactly one completion with the original completion ID. |
| Pointer and keyboard ordering | PASS in the installed WebView2 host through CDP input. Pinned two tasks; dragged an unpinned task across columns; invalid pinned-boundary drop and Escape preserved data; hovered Next to cross a page and dropped after another task; ArrowUp adjusted that order. Closing/relaunching preserved it. Product ordering functions were not called to simulate dragging. |
| Controls and descriptions | PASS. Edit, cancel, Start, pause, finish and continuation-note save worked. Activity editor and timer descriptions opened by default. |
| Backup export and restore | PASS. Export button wrote an actual JSON file through the native bridge. Import button opened the chooser; restored an old backup without pin/rank fields, then restored the exported current backup with pins, manual order and completion data. Data matched after host restart. Test-mode export bypasses the Windows Save As dialog. |
| Language and theme | PASS. Native UI controls switched English/Chinese/Japanese and light/dark; task control bounds stayed separate and editor descriptions remained expanded. Native viewport sampled at 866 x 643 CSS pixels. |
| Uninstall preservation | PASS. Uninstaller removed owned app/asset files while preserving unrelated files at installation root and inside `web/assets`, plus the separate synthetic profile. Reinstalling 1.4.1 loaded the retained tasks, records and manual order. Test mode intentionally bypassed registry/shortcut changes. |
| Fresh 1.4.1 profile | PASS via repository `tests/native-book-smoke.cjs` against the installed candidate. English default, unchanged `https://nowwhat.local` origin, no Node globals, native bridge, local images/font, actual export, close/reopen timer recovery and single completion all passed. |

No page errors were observed in the completed native runner. Test hosts were closed at completion. The user's existing application was left running and untouched.

The native E2E host deliberately creates an alpha-zero transparent window. An attempted WebView2 screenshot timed out; no native visual screenshot is claimed. Native acceptance above uses actual host execution, input, DOM geometry and persisted data. Visual screenshots are explicitly browser captures of the matching fixed build. The raw native log's historical check label mentioning “screenshots” is corrected by its appended evidence note and `visualCaptureNote` in JSON.

## Android package checks and limits

`apksigner verify --verbose --print-certs` passed with APK v2/v3 signatures. Both old and new APKs have certificate SHA-256 `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15`. Package remains `io.github.taouyh.nowwhat`, versionName 1.4.1, versionCode 7, minSdk 24, targetSdk 35. Signature continuity and increasing code support upgrade eligibility; they do not prove an on-device upgrade.

`aapt2` badging/XML inspection confirmed the launcher activity, `adjustResize`, configuration-change handling, `allowBackup=false` and `usesCleartextTraffic=false`. `zipalign -c -v 4` passed. APK entries have no duplicates or backslash paths. All web assets and the native bridge match the fixed source/build as described above. Host `classes.dex` and compiled icon equal 1.4.0; DEX SHA-256 is `02c37995a0aa0c9f98664fd63f8f8d9ce0b2b8e59123c24c1bbfac878d4f1dab`.

No usable device/emulator connection was available: adb/emulator absent from PATH; no configured Android SDK environment variables, default SDK or AVD directory; the available build SDK lacks platform-tools/emulator; no adb/qemu/emulator processes or listeners on 5037/5554/5555 were found. No Android installation, native touch, software keyboard, rotation, persistence or upgrade test was run. Physical device/user acceptance and participant testing remain outstanding.

## Evidence and harness corrections

Ignored local evidence: `C:/Users/fengcai/.codex/worktrees/20a3/now-what-to-do/.cache/native-independent/`.

- `build.log`, `node.log`, `e2e.log`, dependency setup logs, `environment.json`, `packages.json`, `web-compare.json`.
- `native.cjs`, `native.log`, `native-results.json`, `native-fresh-smoke.log`, synthetic backup files, and `installed-1TsRdH/` containing the final isolated install/profile. Fresh-profile smoke evidence is in `test-artifacts/book-native-nSDZyB/` under this worktree.
- `visual.cjs`, `visual-stable.log`, `visual-results.json`, thirty `stable-{tasks,drag,edit,settings,import}-{language}-{theme}.png` images and five `stable-contact-*.png` contact sheets.
- `android-check.py`, `android-results.json`, `android.log`, old/new signature logs, badging, manifest and alignment logs.

Initial harness stops are retained: strict byte comparison encountered checkout newlines, then its text whitelist omitted Markdown; the native screenshot attempt hit the transparent-host limit. Neither required product changes. Initial browser captures caught 240 ms dialog transitions; final captures fast-forward finite animations. A capture-script filename replacement briefly changed synthetic IDs and caused a selector timeout; restoring fixture IDs produced six passing final scenarios. These harness corrections do not replace or conceal product failures.

Only this report is committed. User approval of the delivered native candidates remains separate; no remote or release state changed.
