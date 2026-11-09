# Independent web drag verification

2026-11-09. Fixed product commit: `debf26c44f805a3a5471e4104fe3937416dcc1f1`.

**Result: PASS within the bounded web scope below.** No product defect was reproduced. Window-blur cancellation was verified by event injection, not an operating-system focus change. Touch results are browser emulation, not native-device acceptance.

## Environment

Separate testing chat and worktree `C:/Users/fengcai/.codex/worktrees/09f0/now-what-to-do`, detached at the fixed product commit, with a clean tracked tree before testing. Windows, Node 24.18.0, npm 11.16.0; headless Microsoft Edge 157.0.4341.42 through Playwright. Every supplemental scenario used a fresh nonpersistent context with 23 synthetic tasks (two pinned). No real profile or user data was used.

Read the deployment guide, development rules and this candidate's implementation handoff. Only the requested build/tests and ordering-related browser scenarios were run. No product changes, push, master merge, native package, publication or Figma work.

## Independent commands

| Command | Result |
| --- | --- |
| `npm run build:web` | PASS: typecheck, Vite build and 270 assembled files |
| `npm test` | 144 passed, zero failed/cancelled/skipped |
| `npx playwright test tests/e2e/task-reorder.spec.ts tests/e2e/task-pin.spec.ts --workers=1` with `BOOK_TEST_PORT=8793` | 4 passed; completed uninterrupted in 11.9 seconds |

The four repository browser tests covered the three localized pin/description journeys and the real mouse scenario with column/page moves, persistence, cancellation, pinned boundaries, keyboard, editing and Start. Supplemental tests served the independently built production files on port 8794.

## Supplemental browser results

| Scenario | Observed result |
| --- | --- |
| Desktop long-name layout | PASS in Chinese/English/Japanese, light/dark, 1531 x 715. All four controls (grip, edit/title, pin, Start) have positive widths and disjoint horizontal bounds inside each row. Six normal and six active-drag screenshots were captured and visually reviewed. Long names truncate; controls remain separate. Preview, source dimming and insertion line are visible. |
| Real mouse to group tail and head | PASS: dragged the first unpinned task through two Next pager hovers to after the last task; dragged it back through two Previous hovers to the first unpinned position. Each drop wrote once. Leaving/reentering the pager allowed another page turn. Source `tasks` array remained byte-equivalent as parsed data. |
| Keyboard across page boundary | PASS: ArrowDown moved the final first-spread task to the second spread; ArrowUp returned it. The moved grip retained focus, rank persisted after reload, and source task order was unchanged. |
| Escape / external drop | PASS after hovering to another page: zero data writes, exact stored string unchanged, original page/order restored, and preview/markers removed. External drop means release outside a valid row in the browser viewport. |
| Pointer cancellation / lost capture | PASS: injected desktop pointercancel and actual releasePointerCapture both cancelled with zero writes and restored the original page. The touch scenario separately generated a trusted pointercancel through CDP touchCancel, also with zero writes. |
| Window blur | PASS at the event-handler boundary: injected window blur during a cross-page drag cancels with zero writes and restores the original page. Headless tab activation did not emit a trusted blur; native window focus switching remains unverified. |
| Resize | PASS in three bounded repetitions after observing the browser's trusted resize event: zero writes, unchanged storage, original page/order restored and preview removed. See the timing note below. |
| Failed persistence | PASS: injected QuotaExceededError for the data write; one attempted write, stored string and visible order unchanged. After restoring writes, an ArrowUp move used the original ordering, confirming failed movement did not leak into subsequent in-memory behavior. |
| Pin/unpin and group boundary | PASS: manual rank survived pin then unpin; pinned tasks stayed first; an unpinned-to-pinned drop left data unchanged with zero writes. Existing browser tests also exercised reordering within the pinned group. |
| Actual export/import | PASS: clicked Export, saved and parsed the downloaded JSON, imported an old backup without taskOrder through the file chooser/confirmation, then imported the exported backup. Legacy order was restored first; manual rank and visible order survived the exported-backup import and reload. Source task array order was preserved. |
| Narrow touch | PASS: English dark 360 x 640 with mobile/touch emulation. CDP touchStart/move/end dragged a task before another and wrote once. A second drag ended with trusted pointercancel from touchCancel, preserving stored data with zero writes. Active-drag and reordered screenshots were reviewed. |

The supplemental runner contains 16 scenarios. Its original results retain one resize synchronization failure; the focused three-run resize retest supersedes that scenario only. All other 15 scenarios passed on the first run.

## Timing note and limits

The initial resize test released the mouse immediately after `setViewportSize` returned, before the browser necessarily dispatched resize. This allowed an ordinary drop to commit. A diagnostic repetition captured an empty resize-event list and a still-active preview immediately after the viewport command, confirming the harness had not yet observed its cancellation trigger. The corrected probe waits for the actual trusted resize event before releasing the pointer; all three repetitions passed. No source change was needed, and the original failing result is retained rather than overwritten.

Storage-write counts instrumented `Storage.prototype.setItem` for the app data key only; the failure case deliberately threw at that boundary. Mouse moves and touch dispatches used browser input paths rather than invoking ordering functions. Native OS blur, physical touch hardware, Android/WebView acceptance, Windows application behavior, upgrades and participant testing were not tested or inferred. This bounded check does not authorize native rollout.

## Evidence

Ignored local evidence directory: `C:/Users/fengcai/.codex/worktrees/09f0/now-what-to-do/.cache/web-drag-independent/`.

- `build.log`, `node.log`, `e2e.log`.
- `probe.cjs`, `probe.log`, `results.json`: scenario assertions, row/control geometry, persistence and captured event trust flags.
- `resize.cjs`, `resize.log`, `resize-results.json`: three corrected resize repetitions and immediate-versus-dispatched event observations.
- `layout-{language}-{theme}.png`, `drag-{language}-{theme}.png` (12 desktop screenshots); `mouse-cross-page-last.png`; `touch-drag.png`; `touch-reordered.png`.
- `synthetic-export.json`: downloaded synthetic backup used for the actual import round trip.

Evidence is local and excluded from this report-only commit. No permanent implementation tests were added.
