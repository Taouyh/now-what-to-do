# Independent mobile entry verification

Date: 2026-11-09, Asia/Shanghai. Fixed product source: **`296b906029114fbdc838f1ebd197f21ed5310677`**. Independent GPT chat and isolated worktree `C:\Users\fengcai\.codex\worktrees\09f0\now-what-to-do`; detached, clean product checkout during execution.

## Decision

**PASS for the tested web layout/interactions and supplied APK inspection.** Build/typecheck, the requested 13 browser tests and bounded independent probes passed. No blocker was observed in this scope. This does **not** establish that the user's real Android keyboard/IME collision is resolved on their device; actual device/IME, native installation/upgrade and participant acceptance remain untested.

Only this report is committed. No product source/test edits, push, merge, Windows build, Figma access or real browser profile use occurred. Read deployment instructions, implementation and required deployment evidence/rules. Prior mobile-fit reports remain historical evidence; this report does not replace their original source attribution.

## Execution and isolation

- Windows, Node 24.18.0, npm 11.16.0, Playwright 1.64.1, actual headless Microsoft Edge **157.0.4341.42**. Existing isolated-worktree dependencies reused; no installation was needed.
- `npm run build:web`: PASS, TypeScript/Vite, 270 production manifest files assembled.
- `BOOK_TEST_PORT=8793; npx playwright test tests/e2e/mobile-entry.spec.ts tests/e2e/mobile-book.spec.ts`: **13/13 PASS**, 12.3 seconds.
- Test ports 8793/8794 were unused before starting; server reuse disabled for the suite. Supplemental probes served this checkout's `dist/web` on 8794. Every test/context used fresh nonpersistent synthetic storage, Android UA and touch emulation as appropriate.
- The build command's enclosing PowerShell invocation returned 1 because the subsequent free-port lookup found no matching connections; the recorded build itself completed successfully. This is not a failed product build.

Evidence remains locally in ignored `.cache/mobile-entry-independent/`: build/E2E logs, `probe.cjs`, `results.json`, 21 screenshots, initial probe evidence and APK scripts/results/logs. Playwright output is in `test-results/` and `playwright-report/`. No evidence contains personal app data or private signing material.

## Independent bounded checks

Tested Chinese, English and Japanese. Captured and visually inspected onboarding and empty calendar at **360x800**, add dialog at **360x800, 360x360, 320x320 and 800x360**, and edit dialog at **320x320**. These sizes model viewport contraction, not an actual soft keyboard.

- **Onboarding:** title top is y=154 with book top y=84, a 70px book-relative inset in all languages. It is in the upper paper area, with input and primary action readily visible. English wraps naturally to two title lines; Chinese/Japanese retain one line.
- **Empty calendar:** CTA and pager dash centers both equal x=180 in all languages. CTA ends at y=324.5; pager begins at y=336.5, exactly 12px below. The CTA sits above the dash and a coordinate click returns to onboarding.
- **Dialog header:** all twelve add configurations and all three 320x320 edit configurations have distinct title/close/input rectangles. At 320x320, title bounds are x=38..230, y=30..76; close bounds x=238..282, y=31..75 (44x44); input begins at y=93.75. The close center hits the actual button, no brand is visible behind the open dialog, and no header glyph/title is clipped in inspected captures.
- **Draft and closing behavior:** a filled add draft survives the viewport sequence unchanged. Clicking the close button by coordinates at 320x320 closes the dialog, restores the brand and leaves the empty store unchanged. Creating a task at that size preserves its exact multiline description. Opening it, changing its name and closing discards the unsaved change; saved name/description remain intact. Successful Save also restores the brand.
- **Necessary scrolling regression:** at 320x320, wheel input scrolls the editor body; an actual CDP touch swipe scrolls it back. Measured body scrollTop changes are 202 to 92 for Chinese/English and 227 to 142 for Japanese. Visible footer actions remain within the viewport and pass hit tests. The existing suite also reruns short-height footer, confirmation, pagination/rotation and completion capsule behavior.
- No page exceptions occurred in the three supplemental language contexts. Existing noninteractive notifications can briefly cover footer text, as already documented in the prior report; hit testing remains successful through them.

The initial supplemental probe checked `isHidden()` immediately after a coordinate click and failed before the hide state had settled. It was corrected to wait up to three seconds for the actual hidden state, retaining the identical coordinate click and subsequent data/brand assertions. All three languages then completed successfully. Initial results/logs are preserved; no product code or acceptance geometry was changed to obtain a pass.

No unrelated broad matrix was added. Earlier independent backup/restore and native-boundary evidence is not claimed as newly executed here.

## Supplied Android preview

Read-only inspection of `D:\code\now-what-to-do\dist\android-preview-entry\Now-What-1.4.0-Android.apk` after the developer confirmed it was complete:

| Property | Independently observed value |
| --- | --- |
| Bytes | 19,060,482 |
| SHA-256 | `69E5E859397F86E8C8CC2156B7B866A1210F414D69580802DF7A9AF15011FD4E` |
| Package/version | `io.github.taouyh.nowwhat`, versionCode 6, versionName 1.4.0 |
| SDK | min 24, target 35 |
| Certificate SHA-256 | `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15` |

All 270 production manifest files match this fixed-source independent build: 226 exact and 44 text files differing only by CRLF/LF, zero mismatches. Expected native-Android script insertion in index.html is accounted for; native bridge matches after newline normalization. The APK contains 279 entries; inspected paths contain no keystore, node_modules, marketing video or source map. `apksigner` verifies v2/v3 signatures with one signer. The certificate was independently reread from the existing published 1.4 APK and matches. `aapt2` confirms the metadata above. No private signing material was read or printed.

Independent web SHA-256:

- app.js: `EDE8E0231E61D317618F9289EBEF0FA7D13C931867E47E2E50912EB7C5D30801`
- style.css: `6ADEB23B55203EFD5343E132720EB18CA4D98B6421A7ED52BDADC73E471FC3A7`
- index.html: `168CDC9E729155D67E60D6EA7A730596CB89DDD3797F814DF29F46491524E70B`

No APK installation, Android IME/device test, in-place native upgrade, system font/display scaling or participant test was performed. Matching content/signatures supports package continuity; it is not native upgrade acceptance.
