# Independent web task-pin verification

Date: 2026-11-09, Asia/Shanghai. Final fixed product source: **`6ef3a6012c137e693784dbc6da2159ca34ef372e`**. Initial source: `94e1538d821f79fdeabed6795c9ef294bc331f54`. Separate GPT test chat and isolated worktree `C:\Users\fengcai\.codex\worktrees\09f0\now-what-to-do`, clean detached product checkouts.

## Decision

**PASS for the bounded web scope on the final source.** The initial editor-heading centering defect was found by actual screenshot/text measurements despite the original CSS-property assertions passing. It is independently closed on the final commit. Pin persistence/order/focus, backup compatibility, write-failure behavior, description expansion and completion-note interactions passed the executed checks.

Only this report is committed. No product source or tracked tests were changed by the tester. No push, master merge, publication, Windows/Android package build/update/inspection, native application launch or Figma access occurred. Browser touch/UA emulation here is web testing, not native/device acceptance.

## Executed checks and source attribution

Environment: Windows, Node 24.18.0, npm 11.16.0, Playwright 1.64.1, actual headless Microsoft Edge **157.0.4341.42**. Existing isolated-worktree dependencies reused. Ports 8793/8794 were checked unused; suite server reuse disabled. Every context used fresh nonpersistent synthetic data, never a real browser profile.

| Source | Check | Result |
| --- | --- | --- |
| `94e1538` | Production build/typecheck | PASS, 270 manifest files |
| `94e1538` | `npm test` | **142/142 PASS**, no skips |
| `94e1538` | `task-pin.spec.ts` | **3/3 PASS**, 6.4 seconds |
| `94e1538` | Independent six language/theme journeys | Pin/start separation, defaults and completion-note behavior passed; visual heading defect found separately |
| `94e1538` | Supplemental storage/timer/narrow-view probes | Four final corrected probes PASS |
| `6ef3a60` | Production build/typecheck | PASS |
| `6ef3a60` | Updated `task-pin.spec.ts` with real text-center assertion | **3/3 PASS**, 10.9 seconds |
| `6ef3a60` | Independent real text bounds and screenshots | Seven configurations PASS, center delta 0px |

Reviewed the exact final diff: one CSS rule and five E2E lines; no runtime/storage change. The earlier 142 Node and storage/timer results are inherited for unchanged code, not represented as freshly rerun on the final commit. This bounded retest follows the requested scope rather than extending the regression suite indefinitely.

Evidence: `.cache/web-pin-independent/` contains command logs, probe sources, initial/follow-up/final JSON, synthetic exported backup and screenshots. Final text bounds are `final-heading-results.json`; corrected behavioral results are `settled-results.json`; six visual journeys are in `visual-settled-results.json`. Playwright outputs remain in `test-results/` and `playwright-report/`.

## Initial defect and closure: PIN-01 / P2

On `94e1538`, open Tasks then Add/Edit at 1531x715. The editor's activity-description title is visibly left-aligned in Chinese, English and Japanese despite computed `text-align:center`.

Minimal Chinese measurement: summary `display:flex`, width 56px, text center x=857.5 versus description-options center x=996.890625; a **139.390625px leftward difference**. The inherited `style.css:61` rule sets `width:fit-content`. Setting text-align alone cannot center this narrow flex box within its parent. Timer-description centering was already correct. Evidence: `heading-results.json`, `heading-defect.png` and original `*-editor.png` captures. The developer was notified before the report was completed.

Final `6ef3a60` supplies full-width layout and centered flex content. Independent DOM Range measurements now show delta **0px** for Chinese/English/Japanese in both light and dark at 1531x715, plus English dark at 360x640. All seven final screenshots were visually inspected; the title is actually centered above the open description field. Final E2E also tests actual text center, not just class/computed text-align. **PIN-01 closed.**

## Functional and visual evidence

- **Pin and Start are independent:** in all six desktop language/theme journeys, pinning opens neither timer nor editor. Starting the selected task leaves all pinned values unchanged and runs the correct task. Pin and Start controls remain separate, within the viewport and hit-testable beside a very long mixed-language task name; the title truncates to its bounded lines instead of displacing the controls. A narrow 360x640 browser check also passes.
- **Stable ordering, page and focus:** the configured tests pin a last-page task, follow it to the first page, pin an earlier original task, verify original-order sorting among multiple pins, reload, then unpin and follow/focus it on its resulting page. The independent narrow check edits a pinned task, adds a new unpinned task, traverses the final 14-item sorted view without omission and confirms the stored source array's original order is unchanged.
- **Real backup round trip:** downloaded the app's JSON export containing pins on `i-3` and `i-12`; imported a synthetic older version-2 backup with no pinned fields, then imported the actual downloaded backup via the file chooser and confirmation. Reload preserved both pins, their stable displayed order and custom data. A string-valued pinned field was rejected without changing stored data. This verifies legacy version-2 missing-field compatibility, not every historical schema variant.
- **Write failure:** deliberately threw a synthetic QuotaExceededError on main-document Storage writes in a fresh browser context. Clicking Pin left the raw stored document byte-identical and aria-pressed false; it did not start a timer. Node tests separately cover the in-memory state.
- **Descriptions:** editor descriptions are open by default; timer descriptions open when starting a described task. After manually collapsing, the actual clock changed over 2.3 seconds while the description remained closed. Reload followed by the normal recovery action opens it; a fresh session opens it again. Empty descriptions stay hidden. Final heading screenshots also confirm default-open empty editor fields.
- **Completion note:** inspected paper texture, right-end decoration, legibility and bounded controls in Chinese/English/Japanese, light/dark. Actual screenshots confirm the paper-slip appearance, rather than only the class name. The three configured journeys open the continuation editor and save its content; existing capsule actions remain functional.
- No page exceptions occurred in the six visual contexts. Task/editor/timer/completion captures were inspected at 1531x715, plus focused narrow captures; this is not a full accessibility, zoom or system-font-scaling audit.

## Harness corrections and limitations

Initial supplemental failures were retained and resolved without product changes: a navigation selector matched both the book and its button; it was scoped to bookmarks. A post-reload timer probe tried End before using the existing recovery action; it now follows the actual recovery flow. One fast post-reload narrow traversal sampled initial capacity before fonts/ResizeObserver settled and skipped two IDs in its collected sequence; waiting for font readiness and layout stabilization produced the complete expected 14-ID sequence. The earlier narrow run had also passed. No task data was deleted or lost.

Initial timer screenshots caught the editor's closing transition. Settled recaptures with animations disabled show no persistent overlay. A first final-heading probe's new browser page crashed while the suite was running concurrently; a serial retry after suite completion passed all seven configurations. These runner/capture events are recorded separately from the confirmed product defect.

Final independent web SHA-256:

- app.js: `AA9138CEAE8A6E611F188EA6318B74EA5F2ED4E148687435360EB5203518D2B2`
- style.css: `4DFD5228F58B10B7BA19A03919A83E23DF2109CC4E1A41E8845BBEDBE1F46BC3`
- index.html: `4B6B3C448E761B98CDE66D8B74ADC86159962C9EDC19F5B8E86F18EA15575F5B`

This checkpoint covers the local web candidate only. It does not authorize or establish native rollout, package compatibility, real Android IME/device behavior, deployment, merge or participant acceptance.
