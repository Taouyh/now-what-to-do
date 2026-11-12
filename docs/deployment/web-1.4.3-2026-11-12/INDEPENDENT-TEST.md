# Independent web 1.4.3 integration verification

**PASS** for final fixed candidate `aeae00f2001442b8a27d8126eebd1f765b2b545e`. No product defect found in this independent round. Public deployment verification remains the publishing chat's next step.

Date: 2026-11-12, Asia/Shanghai. Separate GPT chat and worktree `C:/Users/fengcai/.codex/worktrees/655e/now-what-to-do`. Node 24.18.0; Edge 157.0.4341.46 through Playwright. All browser contexts were new and nonpersistent, with synthetic data only. Dependencies were reused read-only through a junction to `D:/code/now-what-to-do/node_modules`. Test servers ran from this worktree with `reuseExistingServer:false`: full suite/final startup on port 18921, supplemental probes on 18922, promotional test on its own ephemeral port.

## Fixed commits and scope

Initial full-suite candidate `f0b04148d26107bbddaaf72d2684dc78a3698cc4` is a merge with parents `13e0d05414ccf8a5d7f0b6a897ced96548acfc78` (published master) and `900cc3a5d5bed60be5d69414c00322da624b6852` (released native source). Its runtime, shared UI, assets, native sources, packaging and package files are identical to 900cc3a. All `about/` content, including both videos, posters, translated download copy and links, is byte-identical to 13e0d05. README native download URLs and both demo destinations remain unchanged; icon references and release/timer descriptions are updated as requested.

The final follow-up `aeae00f` changes only `index.html` and `scripts/assemble-web.cjs` relative to f0b0414: adds the book favicon, uses `style.css?v=1.4.3`, and generates `app.js?v=1.4.3` from package version. It changes no JS/CSS runtime source or native artifact. Final production JS/CSS hashes equal the initial full-suite build exactly:

| Built file | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `285491ADCB0FBB4A3E014185BE67021FDDF998D4A9A0B9EAD08C3C12992AAA95` |
| `dist/web/style.css` | `0104A74057E6E65F739005137C7EB88E98797B1DA484737D55FE8B8A064E5EF6` |

`package.json` is 1.4.3. Final assembled `dist/site/release.json` is exactly `{ "version": "1.4.3", "commit": "aeae00f2001442b8a27d8126eebd1f765b2b545e" }`. The final patch passes `git diff --check`; comparison against old master reports only the inherited blank line at `app.js:1162`, already present in 900cc3a. It was not edited to silence that historical whitespace warning.

## Executed validation

| Check | Result and tested source |
| --- | --- |
| `npm test` | **153/153 passed**, no failures or skips, f0b0414; runtime unchanged in final |
| `npm run build:web` | **Passed** typecheck, Vite and assembly on both f0b0414 and aeae00f |
| `node scripts/assemble-site.cjs` | **Passed** on both candidates |
| Full `npm run test:e2e`, port 18921 | **110/110 passed in 2.0 minutes**, first run on f0b0414, no timing retry required |
| `node tests/promo-videos.cjs` | **Passed**, 21 three-language/viewport layouts, actual playback of both 59-second videos, poster paths, aspect ratios, language behavior, unchanged download targets and synthetic storage isolation; f0b0414, with `about/` unchanged in final |
| Icon verifier | **Passed** nine embedded ICO sizes and 33 dp adaptive-safe-circle check; artwork radius 32.3173 dp |
| Final `startup-reminders.spec.ts`, port 18921 | **3/3 passed** on aeae00f; cold startup, failed texture fallback, timer arrival/silent reopen and small-screen settings |
| Final supplemental probes, port 18922 | **11/11 passed** on aeae00f; details below |

The full browser suite covers task editing, cancellation, pagination, pin/reorder, calendar/detail navigation, focus retention, dark/light controls, three languages, narrow-screen controls, data preservation and timer recovery. It executed against the isolated production build, not another running development server.

## Supplemental storage, capability and timer checks

Six cases cover English/Chinese/Japanese at 1440 x 900 desktop and 390 x 900 Android-like touch browser viewports. Each seeded existing version-2 data containing a goal, an activity, a record for a deleted activity, old reminder preferences and an unknown custom field. Opening, visiting settings and reloading retained the complete original `whatToDoData` string byte-for-byte. `window.nativeApp` remained undefined; no native notification bridge or vibration capability was injected. No sound switch exists, vibration preferences remain hidden and the page has no horizontal overflow. Screenshots of desktop English and mobile Chinese/Japanese settings were visually inspected.

Compact Android/touch browsers correctly activate the existing responsive `mobile-book` layout; this is a web layout capability, not a native notification capability. The first supplemental probe incorrectly expected that class to be absent on every web browser, causing exactly three mobile assertions to fail (7 pass / 3 fail). Source review of `src/ui/book.ts` and the clarified handoff confirmed the test expectation was wrong. Only the ignored probe was corrected to expect mobile layout for the Android-like viewport. Original failure log/traces are preserved in `probe-original.log` and `original-results/`; no product code changed. The final 11-case run passed.

A separate unversioned legacy fixture retained its original raw storage on initial load. Saving a language preference and reloading migrated it to version 2 while preserving its original tasks, goals, unknown custom data and undated legacy record. The migration did not invent `completedAt` or `date` timestamps.

Three clock/audio-instrumented tests used the real production web runtime without a native bridge:

- A running ten-minute round retained its completion identity and deadline across 60 seconds of simulated backgrounding; it finished at 600,000 ms and triggered one three-note chord despite the stored legacy `sound:false` preference. A further day produced no extra elapsed time or replay.
- A round that expired while hidden returned to the time-up state silently. Reloading remained silent with the same capped elapsed time.
- A paused round stayed paused across time advancement and reload, retaining its elapsed time and completion identity.

These tests simulate visibility changes, time and audio calls. They do not establish browser autoplay permission, audible speaker output, OS suspension, physical-device notifications, lock-screen delivery or native upgrade acceptance.

## Icons and final entry

All three READMEs reference `packaging/icons/icon-128.png` at 88 x 88 CSS px. The PNG is 128 x 128; its SHA-256 is `1E725B45FBDB1E98EDBE40629307810A656780C5BE5B2403A7386F42331F2B36`. It was visually inspected as the new open-book artwork. The complete packaging tree is identical to released source 900cc3a, establishing the requested artwork provenance; the icon verifier additionally confirms the matching ICO entries.

The final browser entry loads `app.js?v=1.4.3` and `style.css?v=1.4.3`. Its favicon is `packaging/icon.png?v=1.4.3`; an actual HTTP request returned 200 and bytes identical to the approved source icon, SHA-256 `8C8B0AFB49877E2CD8016383AA178CF24F72315881D5A2E1D66E08142CE2A042`. Both production startup and the exact manifest version/commit passed. The versioned URLs distinguish these resources from the previously published unversioned JS and 1.4.2 stylesheet.

## Evidence and handoff

Ignored local evidence is in `.cache/independent-web143/`: `unit.log`, `build.log`, `final-build.log`, `e2e.log`, `startup-final.log`, `probe-original.log`, `probe-final.log`, `probe.spec.ts`, `probe.config.ts`, `original-results/`, `results/`, `icon-verification.json` and `f0-bundle-hashes.json`. Promotional evidence remains in `.cache/promo-videos-test/`. The icon verifier rewrote its tracked generated JSON as a tool side effect; that output was copied into local evidence and only that generated change was restored before finishing. The worktree was clean before adding this report.

This reviewer changed no product code and rebuilt no installer. Only this report is committed; no push, merge, tag change or deployment was performed. Post-deployment manifest/resource/README checks and Figma verification belong to their separate delivery steps. No physical-device, participant or real-user-profile acceptance is inferred from the synthetic tests.
