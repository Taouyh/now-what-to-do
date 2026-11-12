# Independent native candidate verification — November 12, 2026

**Final candidate PASS within the verified scope below.** Two original findings were corrected by the implementation chat and independently retested. Final source: `a6e9c9e8f73f132c86674e105c658fb1643e042f`. Final delivery is exclusively the `final/` package directory; the original candidate remains preserved as historical evidence. Physical-device, OS notification and upgrade acceptance remain pending.

## Final candidate verification

The authorized production correction was cherry-picked into this isolated worktree as `9224f1997be13a1296160b98ae645e10dc52d4e8`. Its tracked tree is identical to main source `a6e9c9e` (both tree IDs `b2b4a2431c1530b2f901e21b81f14f5dd4846674`). No local application patch or native build was used to make the tests pass.

| Final check | Result |
| --- | --- |
| Node core regression | **153/153 passed** |
| Independent TypeScript/Vite/web assembly | **Passed** |
| Complete repository browser suite, port 18768 | **110/110 passed**; includes the new viewport-focus regression and 72 px last-page assertions |
| Independent probes, port 18767 | **23/23 passed**: all 18 language/theme/viewport combinations, timer/audio/no-replay, cold notification readiness, CDP touch drag, deterministic focus regression, home/static-asset geometry |
| Additional narrow + deterministic-focus repetitions | **10/10 passed** (five each), after stabilizing the test target by ID as explained below |
| Final APK identity, signing, alignment, paths, assets and icons | **Passed**; same 1.4.3/code 9 and original signing certificate |
| Final Windows actual silent install + payload comparison | **Passed**, exit 0, all 276 payload files identical; 278 installed files |
| Final installed WebView2 smoke + user-registration protection | **Passed**; new synthetic profile, same seven smoke checks; user HKCU registration/shortcuts unchanged |

Final artifacts in `D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12/final/`:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `android/Now-What-1.4.3-Android.apk` | 12,106,044 | `41C33C9347F9D55CC7AF0AADE132E3177C3A862916122B864A473BE26E54B87F` |
| `windows/Now-What-1.4.3-Windows-x64-Setup.exe` | 13,910,587 | `82F3579826BADAA578B8A241019F4002F2B2B27525B6DBE28E1A735807232B6C` |

Final bundled `app.js` SHA-256 is `285491ADCB0FBB4A3E014185BE67021FDDF998D4A9A0B9EAD08C3C12992AAA95`, identical across independent web build/APK/Windows. File counts and CRLF/LF qualification remain the same as below. All seven compiled Android icon XML path geometries and all nine PNG icon resources in both Windows EXEs were rechecked. Final and original installer/APK hashes were checked again at completion and remain unchanged. [Final package comparison](evidence/final/package-comparison.json), [installation](evidence/final/installation.json), [native smoke](evidence/final/native-smoke.txt), [browser suite](evidence/final/e2e.txt), [independent probes](evidence/final/independent.txt), [repeat confirmation](evidence/final/focus-repeat-corrected.txt).

Re-run package/install probes from the root with `NOWWHAT_CANDIDATE_DIR=D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12/final` and `NOWWHAT_TEST_OUTPUT=test-artifacts/native-143-final`. The latter directory must exist. Use `python .../evidence/verify-packages.py`, `python .../evidence/verify-exe-icons.py` and `pwsh -NoProfile -File .../evidence/verify-install.ps1` after building web in this worktree. These probes read the supplied artifacts and install only into a newly generated `.tmp/independent-install-*` path; they do not package applications.

An additional stress run initially had 9 pass / 1 focus assertion failure. Trace inspection proved a **test identity race**, not a remaining focus defect: the test read first-row ID `ind-5` at 12564 ms, but after capacity recalculation `.first().click()` resolved to `ind-4` at 12583 ms, then incorrectly expected `ind-5` on return. Changed only the probe to click the captured `data-group-id`, retaining the focus assertion. The following 10/10 run passed. The deterministic defect test passed throughout final verification. Original logs remain preserved; no failed result is silently discarded.

## Scope and fixed source

Independent GPT/worktree: `C:/Users/fengcai/.codex/worktrees/3e31/now-what-to-do`. Initial clean HEAD and original artifact source: `08cc289202f6d5cb575b0ea9a659da3c3becedb9`. Application source was not edited, native applications were not rebuilt, and candidate packages were never overwritten in this test window. No push, merge, publication or real-user profile operation occurred.

Read the repository/deployment AGENTS instructions, development rules, candidate implementation, Windows test-install instructions and Android visual/icon handoffs. Reused dependencies through the local `node_modules` junction to `D:/code/now-what-to-do/node_modules`. Verified that configuration, test files, runtime harness, server CWD and generated `dist/web` belong to this worktree; only dependency package resolution goes to the main checkout. Browser servers use ports 18767/18768 with `reuseExistingServer:false`; all browser contexts and WebView2 profiles are synthetic and isolated.

## Findings on the original candidate

1. **P3 — calendar return focus can be lost after editor viewport settling; fixed in final.** At 320×592, close the activity editor after simulated IME contraction, immediately enter a calendar record and return. The selected directory entry initially receives focus, then `MobileViewport.release()` calls the `book.ts` reflow callback, whose `pages.renderToday()` replaces the focused element. Focus becomes `BODY`; directory page, entry and records remain present. The original matrix produced one return-focus assertion failure and a five-repeat narrow run produced four. Subsequent trace audit showed that some were also affected by the first-row identity race described above; **the deterministic clock-controlled regression and its captured before/after JSON independently establish the genuine defect** after 250 ms. `renderToday`/its ResizeObserver also replace nodes without restoring focus. Evidence: [original focused run](evidence/original/focused.txt), [focus state](evidence/original/focus.json), [repeat run](evidence/original/focus-repeat.txt), [screenshot](evidence/original/focus-after-release.png). The implementation chat supplied the correction; this test window did not author an application patch.
2. **P3 — last task-page row height differs from Figma; fixed in final.** The approved 360×800 last-page frame has three 72 px rows; the original candidate renders 64 px rows when the library total exceeds three. Top alignment and pager placement work. Source: `mobile-book.css` `.few-tasks` and `pages.ts` total-task check. [Original screenshot](evidence/original/last-page-64px.png), [corrected final screenshot](evidence/final/tasks.png). Design was not changed to conceal the difference.
3. **Historical test expectation, not a new product defect.** Three `continuation-label.spec.ts` cases expected a 1 px right border, while the approved paper-slip implementation has `border:0` since `94e1538d`. Initial full suite: **106 passed / 3 failed**. The implementation chat explicitly authorized its test-only correction `786580a`; it was cherry-picked here as `b2f3563`. Re-running that complete spec passed **4/4**, retaining its save/cancel/layout assertions. The product and original artifacts still correspond to `08cc289`.

## Original candidate execution

| Check | Observed result |
| --- | --- |
| `npm.cmd test` | 153/153 Node tests passed |
| `npm.cmd run build:web` | TypeScript + Vite + assembly passed; 272 web files including manifest |
| `BOOK_TEST_PORT=18767 npm.cmd run test:e2e` | 106 pass / 3 historical border assertion failures, described above |
| Corrected `continuation-label.spec.ts`, port 18768 | 4/4 passed |
| Independent language/theme/viewport matrix | 17/18 passed; one focus failure, described above |
| Production-bundle timer test | Passed: 60 s hidden, resume same unpaused completion ID, deadline exactly 600,000 ms, legacy `sound:false` ignored, exactly three oscillator starts (one chord), no replay or waiting accrual after 24 h |
| Exact Java `openTimer` script before delayed bundle load | Passed: readiness observer returns cold entry to `#home`, same current completion ID, time-up state |
| CDP touch drag on Android browser layout | Passed: pinned item remains first, unpinned touch reorder persists across reload, no unintended edit/start |
| Design geometry/asset probe | Passed: 240×56 Start, 160×44 Change, 20 px inter-action gap; next-step text and raised long title do not collide; visible local SVG assets loaded |

The matrix covers Chinese, English and Japanese × light/dark × 360×752, 320×592 and 800×360 content viewports. It traverses every task page without duplicates, pins from the last page, saves an edit, closes an unsaved editor through `nativeNavigateBack`, verifies immediate blur/native keyboard-dismiss request and restored task page/anchor, opens calendar directory/detail/back, checks expanded-row geometry, time/condition popup Back, absence of Sound controls and Android-only vibration visibility. Existing tests additionally cover 390×796 Japanese, small screens, task drag across desktop columns/pages, cancellation, persistence and data safety.

The first draft of the independent matrix accidentally included hidden calendar rows in a broad `.task-strip` selector. It was corrected to `#taskList .task-strip` before the results above; no product code changed. The first design fixture had only one task, which correctly hides Change; it was corrected to two eligible tasks. These test-authoring mistakes are not product findings.

Reproducible probes are in [evidence](evidence/): `independent.config.ts`, `independent.spec.ts`, `verify-packages.py`, `verify-exe-icons.py`, and `verify-install.ps1`. Run browser probes using `node node_modules/@playwright/test/cli.js test -c docs/deployment/native-review-1.4.3-2026-11-12/evidence/independent.config.ts` from the repository root. Focus regression is intentionally failing on the original candidate.

## Original artifacts and package integrity

Root: `D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12/`.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `android/Now-What-1.4.3-Android.apk` | 12,106,044 | `F110433C3602D1F200D34AF99B3CB3838909E4C08C1B335CA9193E4957AD1208` |
| `windows/Now-What-1.4.3-Windows-x64-Setup.exe` | 13,910,535 | `84DCE583F61D5E7F245E2168CF97FF17999488C5F9D1F582FE0CE6BE1E705EF3` |

APK: application `io.github.taouyh.nowwhat`, version 1.4.3/code 9, min SDK 24, target 35. `apksigner verify --verbose --print-certs` passes v2/v3; `zipalign -c -v 4` passes. Signer certificate SHA-256 `08D941113E6B6CDE7147CBBD7EEE37345B0D36C477C8472707DB2B9AEF4B4A15` matches both the previous 1.4.2-sound candidate and the original `.signing/release.jks` certificate. The password was passed privately through an ephemeral environment variable and never printed or persisted as evidence.

APK contains 286 unique safe slash-separated entries, no backslashes/traversal paths. Seven compiled icon XML resources contain the source vector path geometry, including legacy, adaptive v26, adaptive/monochrome v33, background, foreground, monochrome and notification. v33 points to the expected background/foreground/monochrome resource IDs. `TimerReminder` uses `R.drawable.ic_stat_nowwhat`. Source icon verification passes all nine ICO sizes (16 through 256 px) and the 33 dp adaptive safe circle. Both actual Windows host and installer contain all nine PNG icon resources **byte-identical** to the current source ICO entries.

Independent web build and both package trees have the same implementation. APK has 273 asset files including its native bridge; Windows has 272 web files. In each comparison, 228 files are byte-identical (including bundled JS/CSS, fonts/images); the remaining 44 Windows / 45 Android entries are exactly CRLF/LF text differences and the resulting manifest byte-count differences. Android's expected bridge injection is accounted for. Every manifest path is compared and recorded sizes checked against its package (index is deliberately modified after manifest generation). Shared original `app.js` SHA-256: `7F97A8D788F5C0301B15F3282265ED37F52C55ABEC81F51D26FA2AEAE4032E69`. No independent native binary reproducible-build claim is made. [Full comparison](evidence/original/package-comparison.json).

## Actual Windows installation

Reviewed `windows-webview2.nsi` test-mode gates before execution. Existing WebView2 runtime check returned 0, so no runtime bootstrapper was needed. `NOWWHAT_INSTALL_TEST=1` skips actual install/uninstall/protocol registration and shortcut writes. Installed the **actual supplied setup** silently with `/S /D=<fresh-directory>`; exit 0. Destination is recorded in [installation evidence](evidence/original/installation.json). All **276 payload files** match installed files by SHA-256; installation adds only `LICENSE` and `Uninstall.exe` (278 files). Host/setup version both 1.4.3.

Ran `tests/native-book-smoke.cjs` with `NOWWHAT_NATIVE_DIR` pointing to that install. It launches the real host with `NOWWHAT_E2E=1`, an explicit unique `NOWWHAT_E2E_PROFILE` and export directory. Passed origin/runtime isolation, default language, assembled DOM, real local assets, real native backup export, paused close/reopen recovery and exactly one completion. WebView2 `157.0.4341.46`. Three user HKCU registration trees and two real shortcuts were snapshotted before installation and after native runs and remained unchanged. User data was never opened, imported or cleared. Raw snapshots stay local; the report records the comparison result rather than distributing user install metadata.

## Limits

These checks establish application behavior, package content and isolated Windows installation. They do **not** establish OPPO/device IME animation smoothness, real lock-screen/sleep notification delivery, OS sound/vibration audibility, notification permission/DND settings, launcher-mask display, Android hardware Back, an actual notification tap, or upgrade retention on a physical device. CDP touch, viewport contraction, fake clock/audio and execution of Java's injected JavaScript are browser simulations. The Java host callback wiring was reviewed, not executed on an Android device. Physical-device and user acceptance remain pending.

Figma counterpart and visual evidence: [FIGMA-VERIFICATION.md](FIGMA-VERIFICATION.md).
