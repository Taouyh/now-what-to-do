# Independent web controls verification

2026-11-09. Fixed source: `b8b887871fa4c9f1325a2aabb88b2cee22cf30ab`.

**Result: FAIL visual acceptance; bounded behavior and style comparisons PASS.** The desktop English and Japanese import actions overlap the scroll decoration. No product files were changed by this test.

## Environment and scope

- Separate testing chat and isolated worktree `C:/Users/fengcai/.codex/worktrees/09f0/now-what-to-do`, detached at the fixed commit with a clean tracked tree before testing.
- Windows; Node 24.18.0, npm 11.16.0; Playwright with headless Microsoft Edge 157.0.4341.42. Fresh nonpersistent browser contexts and synthetic local data only; local production server on port 8794.
- Desktop 1531 x 715: Simplified Chinese, English and Japanese, each in light and dark themes. Additional English dark 360 x 640 browser mobile emulation.
- Only the import controls, task continuation heading/paging/Add, and expired timer controls were tested. No full regression suite, native build, native device, upgrade, participant, publication or Figma acceptance is implied.

## Finding requiring correction

**P2: Desktop import action capsules are obscured by the bottom scroll decoration.** Open Settings in English or Japanese at 1531 x 715 and choose a valid backup through Import. Both themes reproduce immediately, before hover or focus. English Cancel/Confirm text is partly covered; Japanese button lower edges are covered. Buttons remain clickable because the decoration has `pointer-events: none`, so successful clicks and matching computed styles do not establish visual correctness.

- The confirmation card spans y=122.91..582.97. English actions span y=546.36..590.36, and their text spans y=558.20..578.20. Japanese actions span y=535.16..579.16. The bottom decoration is 18px high with bottom=-9px and a 1px border; screenshots show its overlap with the actions. Chinese actions end at y=545.23 and remain clear.
- Relevant layout: `src/ui/styles/book.css` lines 193-195 and 218-220 (fixed card height, centered flex content and bottom pseudo-element); import action sizing at lines 143-147.
- Evidence: `en-light-import-initial.png`, `en-dark-import-initial.png`, `ja-light-import-initial.png`, `ja-dark-import-initial.png`, and `occlusion.json` in the evidence directory below. Initial-open screenshots independently reproduce the same appearance as the full interaction journeys.
- Required outcome: keep both complete capsules and their labels clear of the decoration in all three languages and both themes at the requested desktop viewport; repeat the bounded import checks after the correction.

## Passed checks

| Check | Result |
| --- | --- |
| `npm run build:web` | PASS: TypeScript check, Vite production build, 270 assembled files |
| Seven bounded browser journeys | PASS for behavior/style assertions; visual finding above overrides overall acceptance |
| Import normal / hover / keyboard focus-visible | Matching width/height (less than 1px tolerance), background, text color, border, radius, filter and outline within each pair; labels exactly 确认 / Confirm / 確認する |
| Import behavior | Actual filechooser upload; Cancel preserves the complete stored data string; Confirm replaces activities and preserves the imported custom field in all seven cases |
| Task paging and Add | All 23 task IDs traversed in order, without omission/duplication; three desktop spreads and four narrow pages; no right-column continuation heading on any spread; Add remains visible and saves a 24th activity after navigating backward |
| Expired timer button styles | Matching brown primary appearance and dimensions in normal, hover and focus-visible states; text stays inside both button bounds |
| Timer behavior | Actual running five-minute timer advanced through expiry, Continue adds three minutes, second expiry followed by Finish records exactly one eight-minute session with the correct task and extension; active timer cleared |
| Narrow view | Import actions and expired timer actions visible without text overflow; task paging and all behavioral checks pass |
| Browser errors | No page errors in the seven full journeys |

Desktop import buttons measure 161.39 x 44px; expired timer buttons measure approximately 174.38 x 47.84px. Matching styles were asserted separately for each state and theme. Screenshot review covered the normal import, final task spread, and expired timer state for all seven cases. The timer was advanced using Playwright's clock with callbacks executed, without injecting an expired timer state.

## Evidence and limitations

Local, ignored evidence directory: `C:/Users/fengcai/.codex/worktrees/09f0/now-what-to-do/.cache/web-controls-independent/`.

- `build.log`; `probe.cjs`, `probe.log`, `results.json`; 21 journey screenshots named `{language}-{theme}-{width}-{import|tasks-last|expired}.png`.
- `occlusion.cjs`, `occlusion.json`; six initial-open import screenshots named `{language}-{theme}-import-initial.png`.
- The first synthetic fixture used unsupported `preferences.time=1` and was correctly rejected. It was corrected to the supported five-minute value before the reported journeys. That harness false start is retained as `invalid-fixture-results.json` and is not a product failure.
- Evidence is local and is not included in this report-only commit. `results.json` records assertion success, not visual acceptance; use this report's overall FAIL until the obstruction is corrected and independently retested.
