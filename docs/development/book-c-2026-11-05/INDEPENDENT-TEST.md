# Independent acceptance: Now What book edition

Test date: 2026-11-05, Asia/Shanghai. Tester: separate GPT window `cd53`, independent of the development window. Only synthetic activities, records and files were used. No developer worktree, real user profile, installed app directory or personal backup was accessed. No merge, push or deployment was performed.

## Decision

**PASS for the tested web acceptance scope** on fixed baseline `c388cd8abcd138e55230f9c008cb5cf5d58d0605`. All observed defects are independently closed, including IND-02b dark settings labels and IND-06 file-origin protection. Node 137/137, Web build, existing Edge E2E 10/10, independent supplemental Edge tests 17/17, focused issue tests 5/5, 64 condition cases and the real file-origin probe pass. This satisfies the requested independent web testing checkpoint for this SHA; native/platform and research boundaries remain explicitly untested or developer evidence below. No product code was changed, merged, pushed or deployed by this tester.

| Candidate | Full SHA | Independent result |
| --- | --- | --- |
| Original | `ce7227078ccbfd5d2cf9f14ac982d9e0ddfd8e21` | 135 Node tests, 5 existing Edge E2E and 12 additional acceptance tests pass; separate defect reproductions fail. See original issues below. |
| Revision | `86f0c5fd52163f89d6d41839b94eb6d99421d05c` | 137 Node tests, 8 existing Edge E2E pass; focused issue suite 3 pass / 1 fail (remaining dark settings). Supplemental suite 15 pass / 1 fail (initial protection focus). |
| Final requested baseline | `6c2afaa2df87e1f6af31fbd25ce29b7fa7044caa` | 137 Node tests, Web build, 9 existing Edge E2E, 17 supplemental Edge tests and 64 VM condition cases pass. Focused issue suite 3 pass / 1 fail (IND-02); real file-origin probe FAIL (IND-06). |
| Contrast patch / latest baseline | `d980ae90866f11d1cb14dc84ccdacf25479b4272` | 137 Node tests, Web build, 9 existing Edge E2E and 4 focused issue tests pass. Export/Import contrast closed. Latest visual/keyboard checks recorded below; file-origin probe still fails; dark settings labels still visually fail. Other 6c2afaa evidence explicitly inherited. |
| Final fixed baseline | `c388cd8abcd138e55230f9c008cb5cf5d58d0605` | PASS: 137 Node tests, Web build, 10 existing Edge E2E, 17 supplemental Edge tests, 5 focused issue tests, 64 condition cases and real file-origin probe. No open observed defects. |

## Isolation, requirements and environment

- Worktree: `C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do`; initial HEAD matched the original full SHA and initial `git status --short` was empty. Detached HEAD. Product code was not edited by the tester.
- Read root and development AGENTS, development rules, TECHNICAL, TEST-HANDOFF, current PRD and INTERACTIONS. Stage 7 authorization takes precedence over historical stage labels. No Figma access was needed.
- Windows 11 Home Chinese, version `10.0.26200`, build 26200; AMD Ryzen 7 7735H; 16,369,221,632 bytes physical RAM.
- Node `v24.18.0`, npm `11.16.0`, Playwright `1.64.1`, actual Microsoft Edge `156.0.4314.58` (headless). Browser UA and version are saved in `browser-environment.json`.
- Every Playwright test uses a fresh nonpersistent context. Custom contexts also use a fresh store. Main acceptance origin `http://127.0.0.1:8766/`; port 8766 was free. Additional instrumented probes use an ephemeral localhost server on 8767. Neither connects to developer port 8765.
- All browser checks load this worktree's independently built `dist/web`, including bundled local fonts/assets. Screenshot sizes: 1600×1000, 1280×800, 390×844; focus overflow also checked at 1236×715 and 1480×715.

## Commands and original results

`npm ci --ignore-scripts` succeeded (300 packages; Electron binary intentionally not installed). Deprecation notices occurred, without install failure. The commands below were executed independently, not copied from the developer's summary.

| Command | Original result | Evidence under original evidence directory |
| --- | --- | --- |
| `npm test` | PASS, 135/135 | `npm-test.log` |
| `npm run build:web` | PASS, TypeScript and Vite; 271 production files | `build-web.log` |
| `npm run test:e2e` | PASS, 5/5 real Edge tests | `baseline-e2e.log` |
| `npx playwright test --config tests/independent/config.ts` | PASS, 12/12 additional browser acceptance tests | `independent-e2e-final.log`, `results.json` |
| `node tests/independent/conditions.cjs` | PASS, 64 combinations: 16 condition masks × running/paused/time-up/recovery endings | `conditions.log`; Node VM with the real app.js, not browser evidence |
| `npx playwright test --config tests/independent/defects.config.ts` | FAIL; deliberate assertions against actual product requirements | `defects-e2e.log`, `defect-results.json`, per-test screenshots and traces |
| `node tests/independent/probe.cjs` | Executed measurements and screenshots, including real wheel and CDP touch swipe | `probe.log`, `defect-measurements.json` |

Original production SHA-256:

| File | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `E0DC9005235FA6E9D6CC67C6EFCAA391309A443FD066E7CF0D2202D3E7DBCC76` |
| `dist/web/style.css` | `48BB9BE8E891BCB9D5C8371E8B3586654B2387EEE29854DB9FAF7DFCED96A199` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

## Original issues

### IND-01 / P1: narrow layout cannot scroll to task pagination

Requirements: PRD C01/C02, preserved mobile usability; TECHNICAL §7.

1. Use a fresh synthetic library of 11 activities at 390×844.
2. Open Tasks. Put the pointer on the visible task list and wheel down 700px, or swipe upwards with touch.
3. Try to reach items 9/10 and the Next page control.

Expected: the single-column fallback scrolls naturally and its pagination is reachable. Actual: `scrollY=0`, body scrollTop=0 after repeated wheel and a CDP touch swipe. Document height is 1053px, viewport 844px, Next top is 949px and bottom 985.39px. Root `html` retains `overflow:hidden`; body `overflow:auto` does not create a usable scrolling region. This blocks natural pointer/touch access to pagination. Playwright `.click()` can automatically scroll the control into view and conceal the defect.

Evidence: `failure-P1-mobile-scroll.png`, `defect-mobile-after-wheel.png`, `defect-measurements.json` (`mobileAfterWheel`, `mobileWheelRepeated`, `mobileAfterTouch`), defect test/trace. Reproduced independently with wheel and touch. No Android-device claim is made.

### IND-02 / P2: dark theme hides core control labels and dims icons

Requirements: PRD §4.6/§6, C10/C11, TECHNICAL §7.

1. Open Settings and choose Dark, in any of Chinese/English/Japanese.
2. Observe Export/Import, then start a task and observe End.
3. Open Tasks and observe play icons; also inspect home time/conditions summaries and settings field labels.

Expected: controls remain identifiable and readable in both themes. Actual: End, Export and Import use `rgb(241,223,182)` text on `rgb(240,224,183)` backgrounds, contrast **1.005:1**, so they look blank. Dark task-play assets retain the dark `#452A1A` path; screenshot shows very low visibility. Settings labels remain dark on dark paper. Home time/condition summaries also have the light foreground/light background problem. This is global theme rendering, not missing translations or data loss.

Evidence: `failure-P2-dark-settings.png`, `defect-dark-settings.png`, `defect-focus-1280x800.png`; all `*-dark-settings.png`, `*-dark-home.png`, `*-dark-tasks.png`; actual computed color fields in `defect-measurements.json`. End/Export/Import contrast assertions fail independently on original SHA. Approximate icon contrast is only a qualitative supplemental measurement because its textured background is not a uniform CSS color.

**d980ae9 disposition:** Export and Import now have `rgb(241,223,182)` text on `rgb(80,61,44)`, contrast 7.81:1; independent focused test and actual rendered screenshots pass. Task play and selected requirement icons are readable in inspected screenshots. However the field labels Language/Appearance/Back up data/Restore backup remained `rgb(69,42,26)` on dark paper, visibly very faint (d980ae9 archive `defect-dark-settings.png`, `settingsLabel` measurement). This remaining originally reported portion was tracked as **IND-02b / P2** so it was not confused with the closed buttons. **CLOSED on c388cd8**: all four labels inherit `rgb(241,223,182)`; checked in three languages at 1600×1000, 1280×800 and 390×844, with full screenshots.

### IND-03 / P2: expanded long focus description escapes the page and overlaps status

Requirements: PRD §4.2/§6, INTERACTIONS long-description boundary; TECHNICAL §7.

1. Create an activity with a long name (repeated mixed CJK/English text) and 300 lines of description.
2. Start it and expand Activity description at 1280×800 or 1600×1000.

Expected: description stays in the allocated reading area, scrolls inside that area, and leaves status readable. Actual at 1280×800: description bottom=815.97px; focus column bottom=638.75px; status top=575.36px; whole book bottom=750.36px. Text passes the status and book bottom, with its end clipped by the viewport. Also reproduced at 1600×1000 and both 715px-high desktop targets. The textarea editor itself retains the full value and scrolls; this issue is in focus reading.

Evidence: `failure-P2-description-overflow.png`, `defect-focus-1600x1000.png`, `defect-focus-1280x800.png`, `defect-focus-1236x715.png`, `defect-focus-1480x715.png`; geometry in `defect-measurements.json`.

### IND-04 / P2: keyboard focus after a changed task save

Requirements: PRD C11; close/save returns to its trigger even when rows are rerendered.

1. On Tasks, keyboard-focus the first row and press Enter.
2. Change its name, focus Save, press Enter.
3. Observe the closed editor and the replacement row.

Expected: focus returns to the edited task row. Original actual: row is not focused after the list rerenders; dedicated `toBeFocused()` assertion fails. Escape/no-op close passed, which did not cover changed-save rendering. Evidence: original `defect-results/defects-P2-changed-task-sa-d761d-to-the-replacement-task-row/` screenshot, trace and error context. **Closed on 86f0c5f**, same independent test passes.

### IND-05 / P2: protection dialog does not receive initial keyboard focus (revision)

Requirements: PRD C11; TECHNICAL §7 semantic modal opens with focus inside it.

1. In a fresh context, seed only a synthetic malformed main document, e.g. `{synthetic-broken-source`, then open the built app.
2. Observe the protection alert dialog before any user input. Bring the browser page to the front and inspect activeElement.

Expected: initial focus is on one of the protection operations (implementation explicitly attempts Reload), inside `#dataRecovery`. Actual on 86f0c5f: `document.hasFocus()` is true, activeElement is BODY, and Reload is inactive. Independently reproduced in the full suite and again in a standalone run. Tab then enters the dialog and remains among its actions; Escape leaves protection open, original source is unchanged and a downloaded raw file exactly matches it. Thus data protection/export works; this issue concerns initial focus and announcement/accessibility. Not tested on the original SHA; do not call it a new regression from that SHA.

Evidence: 86f0c5f evidence archive `corrupt-focus.json`, `corrupt-recheck.log`, `results/acceptance-corrupt-source--47591-us-cannot-escape-protection/` screenshot/trace/error context and `synthetic-corrupt-original.txt`. **OPEN on 86f0c5f; CLOSED on 6c2afaa**: same assertion passes, page has focus and activeElement is the Reload button. The new delayed runtime startup changes initial timing; no relaxation of the focus requirement was made.

### IND-06 / P2: file-origin external changes do not enter protection (final baseline)

Requirement: latest TECHNICAL current-structure section explicitly promises that `file:` and environments without Web Locks use single-window fallback, listen for external storage changes and enter protection. Main-data save-time conflict detection alone is not this listener behavior.

1. In a new, nonpersistent Edge context, load this build's `dist/web/index.html` through `file:` with one synthetic task, no running timer, and light theme.
2. Open the exact same file URL in a second tab of that context; choose Dark in its Settings.
3. Observe the first tab's storage event and protection state.

Expected: first tab receives the main-data change and enters protection. Actual on 6c2afaa: `protocol="file:"`, `isSecureContext=true`, `navigator.locks` exists; the first tab receives `whatToDoData`, persisted theme changes to dark, but no `#dataRecovery` is created. Startup correctly bypasses lock acquisition for `file:`, while app.js's new listener returns early whenever `navigator.locks` exists, including this file environment. This is a confirmed skipped protection path, not a claim that the tested change lost data or that fallback provides atomic locking.

Evidence: `file-fallback.cjs` in the independent harness; per-SHA `file-fallback.log`, `file-fallback.json`, `file-fallback.png`. Uses only the isolated context's synthetic file-origin storage. **OPEN on 6c2afaa and d980ae9; CLOSED on c388cd8**: exact same original script receives `whatToDoData` and now reports `protected:true`, with the real protection dialog visible. HTTP Web Locks and the HTTP test with navigator.locks disabled also independently pass.

## Independently exercised coverage

| Requirement / behavior | Original outcome and limits |
| --- | --- |
| C01 visual shell | Book bounds fit 1600×1000/1280×800, no desktop document vertical scroll; theme and long focus content FAIL above. Narrow natural input FAIL above. |
| C02/C03 task paging and hit areas | PASS: 0/1/5/6/10/11/20/21 activities, exact IDs/order/no duplicates, left/right ≤5, edge buttons disabled; add 21st locates group 3, deleting it clamps to group 2; hover leaves storage unchanged, editor/play independent. |
| C04/C05 editing | PASS: whitespace rejection preserves description and focuses name; cancellation preserves stored values; deletion cancel preserves draft; unchanged save performs no main-document write; changed edit/delete during focus preserves original session and history. |
| C06/C07 focus | PASS: pause excludes time, navigation/another task's play returns to original snapshot, editing/deleting original doesn't alter it, refresh recovery records snapshot, repeated reload doesn't duplicate. Real browser virtual clock reaches time-up; waiting excluded; 1-minute extension and 25→13-minute extension verified. |
| C08 conditions/time | PASS: restart clears all four without startup write; navigation retains current conditions; normal completion clears them, retains custom 25-minute choice; reload restores saved 15-minute preset. 64 ending/mask combinations independently exercised in Node, browser samples exercised through real controls. |
| Completion continuation | PASS: new recommendation differs when feasible; saving continuation only changes completed original task description, not new recommendation/history/requirements. |
| C09 calendar | PASS: directories 0/1/5/6/10/11 groups and detail 1/4/5/8/9 boundaries; independent pagers, selection reset, all-page totals/data unchanged; one detail at a time and real 10-second collapse. Same-name identity covered by independently rerun existing browser test. |
| C10 real files | PASS: download event saved actual JSON file; compare content with persisted state; import this real file, cancel replacement, import altered synthetic file, restore downloaded backup; invalid JSON leaves main data unchanged; active session unchanged throughout imports. Unknown field preserved. |
| C10 storage failures | PASS: synthetic QuotaExceededError for main save preserves draft/data; failed finish retains timer and no record; retry creates one; failed timer start doesn't show running; failed remove after record commit permits cleanup retry/reload without duplication or new session. Actual physical disk/quota exhaustion not performed. |
| C11 keyboard / motion | PASS: Enter opens editor, name focused, validation text + aria-invalid, Escape and no-op close return focus, delete cancel returns draft, Tab/Shift+Tab remain in dialog, picker Tab wraps and Escape returns to summary, reduced-motion removes opening animation. Changed-save focus tracked separately. Screen reader not run. |
| Language/theme | Chinese, English and Japanese × light/dark × four pages × three requested sizes captured. All local asset HTTP requests passed in existing browser test. Theme failure above prevents full pass. |
| Scale smoke | 1,000 activities / 10,000 records, roughly 3.04 MB serialized UTF-8; startup, task paging, directory paging and saved preference exercised without storage warning or record loss. Single headless sample with action overhead; measurements in `performance-smoke.json`, not a performance guarantee. |

## Evidence and reproducibility

Original evidence directory: `docs/development/book-c-2026-11-05/independent-evidence-ce72270/`. First revision: `docs/development/book-c-2026-11-05/independent-evidence-86f0c5f/`. Lock baseline: `docs/development/book-c-2026-11-05/independent-evidence-6c2afaa/`. Contrast patch: `docs/development/book-c-2026-11-05/independent-evidence-d980ae9/`. Final c388cd8: `docs/development/book-c-2026-11-05/independent-evidence/`. Test harness: `tests/independent/`; each earlier evidence archive retains its harness and report snapshot before further checkout/adaptation. Relative evidence names in the historical sections refer to their corresponding SHA's archive.

The screenshot matrix contains 72 full-page screenshots (three sizes × three languages × two themes × four routes), plus editor/focus/fault screenshots. Full-page images alone do **not** prove real scrolling. Stable screenshots disable finite animations; screenshots were visually inspected at full resolution for findings and in contact sheets for layout. The separate defects suite asserts the actual failed behavior. Initial harness-only problems (ambiguous selector, nested config working directory, query-string handling in the supplemental probe) were corrected and rerun; they are not product issues. Logs retain this distinction.

## Not run / limited evidence

- Independent Windows/Android build, installer launch, install/upgrade/uninstall, signed release verification, real device WebView and file bridge/OS chooser cancellation. Developer's Windows/Android build and native profile smoke are **developer evidence only**.
- Real OS sleep/resume, true crash/power loss, 60-minute pause, physical clock shift, actual midnight/timezone travel. Existing Node timer/calendar regressions were independently executed; browser time-up uses Playwright's virtual clock.
- System/browser zoom 125%/150%/200%; screen reader output and complete WCAG audit. Requested exact viewport checks are not substitutes for these.
- All historical `browser-*.cjs` scenarios as a complete real-browser runner; files were not simply loaded and called passed. Current concrete Node/Playwright command results are listed above.
- Exhaustive real-browser 16 condition masks × every ending path; 64 combinations used the Node VM, supplemented by browser journeys.
- Simultaneous independent browser-process races and native multi-instance locking. Final HTTP tests independently cover Web Lock denial before runtime initialization, no second-tab storage mutations, reload while original holds lock, release on original close, then recovery in the new owner. HTTP without the API protects on external changes. The separate file-origin failure is IND-06; no atomic fallback guarantee is inferred.
- Real quota exhaustion, OS storage permission revocation, or hardware disk failure. Storage failures used reversible Storage API fault injection.
- Figma prototype full click-through, pixel-exact design comparison, participant research, or measured time-to-real-activity. Code acceptance does not prove product effectiveness.

## Revision retest: 86f0c5f

HEAD independently verified as `86f0c5fd52163f89d6d41839b94eb6d99421d05c`. Original evidence and original harness copied to `independent-evidence-ce72270/` before detached checkout. Only this isolated worktree was updated. package.json and package-lock.json are unchanged between tested commits; the exact npm-ci dependencies were reused.

| Command / check | Result |
| --- | --- |
| `npm test` | PASS 137/137; `independent-evidence/npm-test.log` |
| `npm run build:web` | PASS; 271 production files; `build-web.log` |
| `npm run test:e2e` | PASS 8/8 real Edge tests; `baseline-e2e.log` |
| `node tests/independent/conditions.cjs` | PASS 64/64 combinations; `conditions.log` |
| Independent issue suite | 3 PASS / 1 FAIL; `defects-e2e.log`, `defect-results.json` |
| Supplemental browser suite | 15 PASS / 1 FAIL (IND-05), 16 tests; `independent-e2e-final.log`. Standalone focus reproduction also fails consistently in `corrupt-recheck.log`; raw export and subsequent Tab confinement pass with a soft initial-focus assertion. |

| Issue | Revised independent disposition | Evidence |
| --- | --- | --- |
| IND-01 P1 narrow scrolling | **CLOSED**. Wheel and touch swipe both yield scrollY=209; Next top=740 and bottom=776.39 within 844px viewport. | `defect-measurements.json`, passing focused test, `defect-mobile-after-wheel.png` |
| IND-02 P2 dark contrast | **OPEN, partially fixed**. End now has 7.81:1 contrast; task-play filter and screenshot are brighter. Export/Import remain 1.005:1, same actual colors as original. Settings labels retain `rgb(69,42,26)` on dark paper. | `failure-P2-dark-settings.png`, `defect-dark-settings.png`, failed contrast test/trace, `defect-measurements.json` |
| IND-03 P2 long focus description | **CLOSED**. Scrollable description container stays above status and inside page at all four desktop sizes; full source retained and container scrollTop advances. At 1280×800 container bottom=601.5, status top=613.5, page bottom=638.75. | Passing focused test; `defect-focus-*.png`, `defect-measurements.json` |
| IND-04 P2 changed-save focus | **CLOSED**. Same keyboard-only opening/save sequence returns focus to replacement task row. | Passing fourth focused test in `defects-e2e.log` |
| IND-05 P2 protection initial focus | **OPEN**. Page is active but focus lands on BODY rather than protection action. Raw export, inert book, Escape and subsequent Tab confinement work. | `corrupt-focus.json`, `corrupt-recheck.log`, screenshot and trace |

The revised long-description assertion measures the **visible scroll container**, not the raw text child's offscreen layout box: overflow content is intentionally taller than its scrollport. The original failure used text visibly outside any bounded reading area. The original test source is preserved, and the revised test also verifies that the new container really scrolls.

Revised production SHA-256:

| File | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `C65688BCC83183E4331BA66BEEF5D224785C2BDB6071F7024B1461C5793D0538` |
| `dist/web/style.css` | `4069AC6F2B10CD59E9958251A034FA7ACC36A6B429C0BF9958A73F4D9DAE5EF4` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

Additional revised checks independently pass: finishing a recovered timer with removeItem failure offers only cleanup retry and cannot start a replacement session; sequential stale-tab changes are protected; 1440-minute custom upper bound is accepted; rapid editor close/reopen retains the new draft; completion feedback remains after 3.5 seconds and cancellation writes nothing. Revised scale sample: startup 527ms, task page 49ms, directory page 40ms, preference write 64ms for 1,000/10,000 synthetic data (single headless sample including action overhead).

The developer reported isolated native Windows export, paused close/reopen recovery and completion deduplication. Those were not rerun by this independent window and are not included in its pass counts. Final merging/deployment remains the developer's responsibility after remaining issues and required platform boundaries are resolved.

## Final requested baseline retest: 6c2afaa

HEAD verified before and after testing as `6c2afaa2df87e1f6af31fbd25ce29b7fa7044caa`, detached, in the same isolated worktree. Previous evidence, harness and report were archived before checkout. package.json/package-lock.json remain unchanged from the clean `npm ci --ignore-scripts` installation. Current report/test/evidence files are untracked additions; no tracked product source has tester modifications.

| Actual command | Independent result / latest evidence |
| --- | --- |
| `npm test` | PASS 137/137; `npm-test.log` |
| `npm run build:web` | PASS TypeScript/Vite/271 production files; `build-web.log` |
| `npm run test:e2e` | PASS 9/9; `baseline-e2e.log` |
| `npx playwright test --config tests/independent/config.ts` | PASS 17/17; `independent-e2e-final.log`, `results.json` |
| `node tests/independent/conditions.cjs` | PASS 64 combinations; `conditions.log` |
| `npx playwright test --config tests/independent/defects.config.ts` | 3 PASS / 1 FAIL, only dark controls fail; `defects-e2e.log`, `defect-results.json` and trace |
| `node tests/independent/probe.cjs` | Actual geometry, color and wheel/touch measurements; `probe.log`, `defect-measurements.json` |
| `node tests/independent/file-fallback.cjs` | FAIL protection assertion; `file-fallback.log`, `file-fallback.json`, screenshot |

Focused dispositions: IND-01 scrolling, IND-03 long reading area, IND-04 changed-save focus continue passing. IND-05 now passes without weakening its assertion: activeElement is `<button id="retryDataLoad">` and document.hasFocus=true (`corrupt-focus.json`); raw download matches the synthetic corrupt source. IND-02 still fails with Export/Import contrast 1.005:1; End contrast is 7.81:1. IND-06 is the remaining newly tested file-origin mismatch described above.

The added independent lock test instruments localStorage mutations in the second tab before navigation: it observes zero writes/deletes when blocked, also after blocked reload; main and activeTimer raw strings remain unchanged. After original close the held lock count becomes zero; reload obtains ownership, displays the original session recovery, and finishing creates exactly one record. Another test disables navigator.locks before both HTTP pages initialize and confirms external change protection. These checks run against the real production IIFE in Edge, not a VM implementation of locks.

The full screenshot matrix was recaptured for this SHA, including three requested sizes, three languages, both themes, long editor/focus text and failure states. Actual wheel/touch checks supplement full-page images. Original and intermediate screenshots remain archived. Native Windows/Android APK construction, normalization of all 271 ZIP entry paths, installation and native lifecycle claims remain **developer evidence**; this window did not build/install native artifacts or inspect a native package produced by that window.

Final requested baseline artifact SHA-256:

| File | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `9E1DBD681514EB05E9A47DC0CAD1CF21CEF303F5D2B46E6B620FDD5694E9A6C0` |
| `dist/web/style.css` | `E9F7ED5F54CB334A2F394E6E7B5A37490E13A0EDEE787E522C794A60D834E7DE` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

Final independent decision for this SHA: **fix IND-02 and IND-06, then independently retest affected behavior before merging**. No data-loss or duplicate-record defect was observed in the tested flows. This is not authorization for native release, and the untested boundaries above remain explicit.

## Latest baseline retest: d980ae9

Verified detached HEAD: `d980ae90866f11d1cb14dc84ccdacf25479b4272`. All 6c2afaa evidence/harness/report was archived before checkout. Verified diff from 6c2afaa: only two CSS rules (dark backup buttons, selected requirement background) and four E2E assertions; runtime, dependencies, templates and packaging scripts unchanged. Unchanged runtime artifact has identical SHA-256. The 6c2afaa 17-test full supplemental regression, 64 condition combinations, recovery/file-backup/large-data/locking results are **inherited evidence**, not claimed as newly executed wholesale on d980ae9. The following were actually rerun on d980ae9:

| Command / check | Latest independent result |
| --- | --- |
| `npm test` | PASS 137/137 (`npm-test.log`) |
| `npm run build:web` | PASS TypeScript/Vite/271 files (`build-web.log`) |
| `npm run test:e2e` | PASS 9/9 (`baseline-e2e.log`) |
| `npx playwright test --config tests/independent/defects.config.ts` | PASS 4/4: narrow wheel, End/Export/Import contrast, bounded scrolling description, changed-save keyboard focus (`defects-e2e.log`) |
| `npx playwright test --config tests/independent/config.ts --grep 'visual matrix\|drafts'` | PASS 2/2 automated keyboard and screenshot/bounds checks; 72 screenshot matrix recaptured (`visual-and-keyboard-e2e.log`, `results.json`). Manual label contrast finding remains IND-02b despite automated bounds passing. |
| `node tests/independent/probe.cjs` | Actual End/Export contrast 7.81:1; selected computer requirement background `rgb(114,83,52)` and bright icon visually confirmed; dark settings label color unchanged `rgb(69,42,26)` (`probe.log`, `defect-measurements.json`, `defect-dark-settings.png`, `defect-dark-editor-steady.png`) |
| `node tests/independent/file-fallback.cjs` | FAIL again: file origin receives main-data storage event but does not protect (`file-fallback.log/json/png`) |

Latest production SHA-256:

| File | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `9E1DBD681514EB05E9A47DC0CAD1CF21CEF303F5D2B46E6B620FDD5694E9A6C0` |
| `dist/web/style.css` | `C7900A2F68AE6AF2EE2C005DCFE80F4074B3695BD6287A49502215506E546B94` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

Latest disposition: **Export/Import button issue CLOSED. IND-02b dark field labels and IND-06 file-origin protection remain OPEN / P2. Fix and independently retest these before merge.** No product code changes, merge, push, deployment or native installation were performed by the tester. Native/package evidence remains attributed to the developer.

## Final independent retest and decision: c388cd8

Exact fixed SHA read from `refs/heads/design/minimal-ui`, then checked out by the full SHA and independently verified: **`c388cd8abcd138e55230f9c008cb5cf5d58d0605`**. No placeholder SHA was used. The reference was used only to resolve the target; tests ran against detached fixed HEAD. The d980ae9 evidence, harness and report were archived before checkout; final HEAD and empty tracked diff were checked again after testing. Dependencies remain the original clean npm-ci installation; package.json and lockfile are unchanged. The environment/origin isolation above still applies.

All following commands were actually rerun on this SHA, rather than inherited as pass claims:

| Actual command | Final independent result / evidence |
| --- | --- |
| `npm test` | **PASS 137/137**; `independent-evidence/npm-test.log` |
| `npm run build:web` | **PASS** TypeScript, Vite, assembly of 271 files; `build-web.log` |
| `npm run test:e2e` | **PASS 10/10** real Edge tests, including original-window lock release and file fallback; `baseline-e2e.log` |
| `npx playwright test --config tests/independent/config.ts` | **PASS 17/17** full independent supplemental suite; `independent-e2e-final.log`, `results.json` |
| `npx playwright test --config tests/independent/defects.config.ts` | **PASS 5/5** focused issue tests, including new four-label × three-language × three-size check; `defects-e2e.log`, `defect-results.json` |
| `node tests/independent/conditions.cjs` | **PASS 64 combinations**; `conditions.log` (Node VM, not browser masks) |
| `node tests/independent/file-fallback.cjs` | **PASS original reproduction**: actual file-origin main-data event received and `protected:true`; `file-fallback.log`, `file-fallback.json`, `file-fallback.png` |
| `node tests/independent/probe.cjs` | Executed actual color/geometry/input measurements; final `settingsLabel.color=rgb(241,223,182)`; End/Export contrast 7.81:1; `probe.log`, `defect-measurements.json` |

| Finding | Final disposition |
| --- | --- |
| IND-01 / P1 narrow natural scroll | CLOSED; real wheel/touch reach pager, still passes on final SHA |
| IND-02 / P2 dark controls/icons | CLOSED; End/Export/Import and task/requirement icon rendering verified |
| IND-02b / P2 dark settings labels | CLOSED; Language/Appearance/Back up data/Restore backup all use bright inherited ink, Chinese/English/Japanese at 1600×1000, 1280×800 and 390×844 |
| IND-03 / P2 long focus text | CLOSED; bounded scroll container clear of status, source retained, desktop and narrow screenshots checked |
| IND-04 / P2 changed-save keyboard focus | CLOSED; replacement row focused after keyboard save |
| IND-05 / P2 protection initial focus | CLOSED; Reload is initially focused, Tab confinement/raw export pass |
| IND-06 / P2 file external storage guard | CLOSED; same original script now shows protection after actual storage event; final existing E2E also verifies inert book |

Final screenshots include the full 72-image language/theme/page/size matrix, nine extra dark-label screenshots (`fixed-dark-labels-*.png`), long editor/focus, synthetic fault states and the real file-origin protection dialog. Visually inspected final repaired settings at desktop and 390px in all three languages, along with original before/after findings. Screenshot full-page capture is supplemented by real wheel/touch checks. Earlier failure evidence remains in four separate SHA archives; no original failure was relabeled as a pass.

Final production artifact SHA-256:

| File | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `DF2BB17EF09C296F21880824603AE48158C423D6C130392E00A3A73508C0A768` |
| `dist/web/style.css` | `80129ED23F9F3E24576B3C2E4F44491EB234A69265245ECB4073C0ED036BA8C3` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

The final scale sample remains a smoke observation, not a benchmark: 1,000 tasks / 10,000 records / 3,042,471 UTF-8 bytes, startup 419ms, task paging 49ms, directory paging 38ms and preference write 83ms including Playwright overhead (`performance-smoke.json`).

**Final decision: PASS within the independently tested web scope, with no remaining observed blocking or P2 findings.** This fixed commit can be used as the completed independent web acceptance evidence before the developer handles merging. Native Windows/Android installation/upgrade/package runtime results remain developer evidence; actual zoom/system scaling, screen reader audit, real OS sleep/power-loss and participant research were not independently run. This report neither claims those unrun checks passed nor authorizes deployment. No merge/push/deployment was performed.

## Packaging validation addendum: 948952a

2026-11-05. This section **appends** results; all preceding per-SHA history is retained unchanged. Fixed detached HEAD before and after testing: **`948952aabab7594e5c7e631a219551c0cc162c50`**. Current tracked diff is empty. The c388cd8 evidence/harness/report snapshot was archived to `independent-evidence-c388cd8/`; this addendum's evidence is in `independent-evidence/`. No developer worktree file or product source was modified.

### Scope and artifact pairing

Reviewed the exact diff from c388cd8: only `packaging/windows-webview2.nsi`, `scripts/build-windows.ps1`, `tests/native-book-smoke.cjs` and `tests/windows-installer.cjs` differ. Application/runtime/UI source, package/lockfile and native host source do not differ. NSIS now includes `web/*` recursively; build generates explicit owned-file Delete commands and deepest-directory-first nonrecursive RMDir commands. Reviewed the existing `NOWWHAT_INSTALL_TEST=1` branch, which skips product registration/shortcut changes, and the host test-profile overrides before execution.

`npm run build:web` independently passed (TypeScript/Vite/271 manifest entries), and `npm test` independently passed **137/137**. Full unaffected UI was not rerun: the c388cd8 10 existing E2E, 17 independent supplemental tests, 5 focused issue tests and closed findings remain **inherited web evidence**, justified by unchanged web source and the exact primary production hashes below.

| Independently rebuilt file | SHA-256, identical to c388cd8 |
| --- | --- |
| `dist/web/app.js` | `DF2BB17EF09C296F21880824603AE48158C423D6C130392E00A3A73508C0A768` |
| `dist/web/style.css` | `80129ED23F9F3E24576B3C2E4F44491EB234A69265245ECB4073C0ED036BA8C3` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

Used the explicitly supplied developer-built Windows artifacts, copied read-only from `D:\code\now-what-to-do\dist\windows\` to this worktree's `dist/windows/`; no artifact was executed in the developer directory. Recorded binary identities:

| Supplied artifact | SHA-256 |
| --- | --- |
| `Now-What-1.4.0-Windows-x64-Setup.exe` | `A29B001B87786A3896E0508273E2F4B3A4EC69F4FB18F68CCDC7B9A5C32CB77A` |
| `webview2-unpacked/Now What.exe` | `A71458FF4D954483478C12F9766891EC71B3E70F09558F5B27E06873949FE018` |

Independent `packaging-check.cjs` verifies all **271 supplied manifest entries plus manifest.json** byte-for-byte between supplied `dist/web`, supplied original Windows payload and the local copied payload. Installer copy is byte-identical to the supplied installer. This is artifact-pair consistency, not a claim that this window independently compiled the Windows executable/installer.

### Cross-worktree text differences, explicitly retained

The first all-byte comparison against the independently rebuilt web directory failed at `app.js.map`; its log is preserved as `packaging-check-initial.log`. Inspection shows **source-content CRLF/LF differences**, not different mappings/source paths/code: parsing both maps and normalizing only sourcesContent CRLF→LF produces identical complete JSON. Current worktree has core.autocrlf=true. Additional provided-vs-independent differences are 44 UTF-8 text files (SVG/font CSS/licenses/provenance/theme CSS), each verified identical after only CRLF→LF normalization. The manifest's byte counts correctly reflect those variants. Including manifest.json: 226 files are byte-identical, one is the source-map source-content variant, 44 are text-line-ending variants, and one is manifest byte-count metadata. No arbitrary source-content normalization or product edit was used.

Evidence: `packaging-check.log`, `packaging-files.json` (per-file independent and supplied lengths/hashes/classification), `tests/independent/packaging-check.cjs`. The running three primary files above are exactly identical, and the installer is validated against **its own supplied byte-identical web payload**, not against the other worktree's differently line-ended text files.

### Real installation, native smoke and uninstallation

First ran the current `node tests/windows-installer.cjs` directly in this worktree. Silent installation and all manifest-resource comparisons succeeded, then the root LICENSE byte comparison stopped the test: supplied installer LICENSE is LF (1063 bytes), this Git checkout LICENSE is CRLF (1084 bytes), with identical text after newline normalization. Preserved `windows-installer-initial.log` / `windows-installer.log`. That first temporary installation was subsequently uninstalled under test mode; cleanup exit code 0 and absence of its app executable/web app were verified (`installer-fixture.json`). This is an artifact/checkout pairing issue; the failed run is not recorded as a full pass.

For the complete run, created a new fixture **only under this worktree's test-artifacts** with the paired supplied payload/web/LICENSE and exact copies of the two current test scripts. No test assertion was weakened, no tracked LICENSE or source was changed. Byte hashes verify the copied scripts equal this fixed commit's working files:

| Unmodified copied test | SHA-256 |
| --- | --- |
| `tests/windows-installer.cjs` | `04A00BE9E963C7F12A44E4915050B7A24B1893DB2FA886624059DAFB0F601143` |
| `tests/native-book-smoke.cjs` | `1D8FE4BBAC319A14211B82C8EEF8789D5931D054918AC9B1AC79FF51A85AA3E8` |

Executed `node tests/independent/installer-fixture.cjs`, which runs the unmodified fixture's `tests/windows-installer.cjs` as a child. **PASS, exit 0**. Before installation, native `--check-runtime` returned 0; no WebView2 runtime bootstrap/install was needed. Test mode used `NOWWHAT_INSTALL_TEST=1`; the native child used `NOWWHAT_E2E=1`, an ephemeral CDP port, a dedicated profile and export directory. Every install/profile path was verified under this isolated worktree's test-artifacts before actions.

- Fixture: `C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do\test-artifacts\installer-fixture-2HHP5U`.
- Installation with spaces: `...\installer-fixture-2HHP5U\test-artifacts\installer-LEdNAe\Folder with spaces`.
- Fresh native profile: `...\installer-fixture-2HHP5U\test-artifacts\book-native-DTqHvY`.
- Actual installed WebView runtime: **156.0.4314.58**.

Independently observed checks from the installed application: unchanged origin `https://nowwhat.local`, no Node require/process exposure, native export bridge available, English native default, book DOM, two real image assets and a local font loaded, actual backup file exported with the synthetic activity, timer paused and host closed, same temporary profile reopened to recovery, completion produced exactly one record with the original completionId. The transparent native test window is **not native visual screenshot evidence**; web visuals retain the independently tested browser evidence.

After silent uninstall, an additional independent scan verifies **277 owned payload/manifest/license files absent**, beyond the existing test's two representative deletion assertions. Both `unrelated-file.txt` and `web/assets/unrelated-note.txt` retain their exact sentinel contents. The direct `/S _?=<install-dir>` invocation leaves `Uninstall.exe` plus the two sentinels in that test directory; this run verifies owned payload removal and preservation of unrelated content, **not self-deletion of the executing uninstaller or ordinary registered/interactive uninstall behavior**. Test-only leftover files/profile/export evidence were retained; no recursive deletion of a user-selected directory occurred.

Evidence: `installer-fixture.log`, `windows-installer-paired.log`, `installer-fixture.json` (exact paths, script/binary hashes, exit code, post-uninstall file list), `runtime-preflight.log`; wrapper source `tests/independent/installer-fixture.cjs`. Synthetic native backup is under the profile's `exports/what-to-do-backup.json`.

### Addendum decision and remaining boundaries

**PASS for the scoped Windows packaging/install/native smoke validation of supplied installer hash A29B001B… at source baseline 948952aabab7594e5c7e631a219551c0cc162c50.** Recursive nested resources are installed intact; current native smoke and owned-file uninstall checks pass independently. The previously accepted web runtime remains byte-identical to c388cd8. No new product defect was found in this packaging review.

This window did **not** run a fresh full `npm run build:windows` compilation (its WebView2 SDK/NSIS caches are absent), independently verify a source-to-installer reproducible build, run `tests/package-contents.cjs` against an Android APK/SDK, install Android, perform an upgrade over a real prior installation, exercise registration/shortcuts/UAC/runtime-bootstrap installation, or independently perform ordinary interactive uninstall/self-cleanup. The supplied artifact's source association is developer-provided; this report pins its actual hash and independently tests its contents/behavior. Existing web zoom/accessibility/real OS lifecycle/research boundaries remain as recorded above. No real application installation or user profile was accessed or replaced, and no merge/push/deployment was performed.
