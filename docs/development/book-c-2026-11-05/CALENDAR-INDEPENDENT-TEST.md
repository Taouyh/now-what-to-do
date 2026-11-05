# Calendar layout independent retest

2026-11-05, Asia/Shanghai. Separate GPT test window, isolated worktree `C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do`.

**Target directory-label fix: PASS. Additional long selected-name detail layout: FAIL, CAL-IND-01 / P2.** The original 1531×715 name compression/cropping is fixed. A supplemental selection of the same long-name test data exposes an unbounded right-page heading that displaces records below its pager. This additional finding needs a developer disposition; this report does not approve all calendar content lengths as passed.

Fixed tested commit: **`3a84870bde55a84d3a9c8bccd64ea787fcb027e6`**. HEAD checked before and after execution, detached, tracked diff empty. No product source changed; no merge, push, native build or deployment performed.

## Isolation and scope

- Read current root/development AGENTS, development rules, current technical scope, PRD/INTERACTIONS calendar and overflow requirements, and `CALENDAR-LAYOUT-FIX.md`. Stage 7 testing is authorized.
- Old untracked report and independent harness that conflict with newly tracked files were moved safely into `test-artifacts/calendar-precheckout-948952a/` before checkout. All old evidence directories were preserved. Existing tracked `INDEPENDENT-TEST.md` is unchanged.
- Windows 11, Node `v24.18.0`, Playwright `1.64.1`, real headless Microsoft Edge `156.0.4314.58`. New browser contexts, only synthetic tasks/records, actual independently built production `dist/web`.
- Dedicated origin `http://127.0.0.1:8766/`; port was free. No connection to developer port 8765 or personal browser/native profiles.
- Tested only calendar/layout and related language behavior. The matrix's 10 CSS viewport sizes are 1531×715, 1480×715, 1236×715, 1920×1080, 1024×768, 820×600, 800×600, 390×844, 320×568 and 812×375, each in Chinese/English/Japanese.

## Executed commands

| Actual command | Independent result | Evidence |
| --- | --- | --- |
| `npm run build:web` | PASS: TypeScript, Vite and 271-file assembly | `build-web.log` |
| `npx playwright test tests/e2e/calendar-layout.spec.ts --output docs/development/book-c-2026-11-05/calendar-independent-evidence/matrix` | PASS **30/30** | `calendar-matrix.log`, 60 matrix screenshots |
| `npx playwright test tests/e2e/book.spec.ts --grep 'calendar groups by identity\|local assets, languages' --output docs/development/book-c-2026-11-05/calendar-independent-evidence/related` | PASS **2/2** existing calendar/language scenarios | `calendar-related.log` |
| `npx playwright test --config tests/calendar-independent/config.ts` (before adding the isolated new-finding reproduction) | PASS **6/6** independently authored supplemental cases | `calendar-supplemental.log`, per-theme metrics and screenshots |
| `npx playwright test --config tests/calendar-independent/config.ts --grep 'supplemental P2'` | FAIL **1/1**, CAL-IND-01 below | `long-heading-reproduction.log`, JSON, screenshot and trace |

All evidence names above are relative to:
`C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do\docs\development\book-c-2026-11-05\calendar-independent-evidence\`.

Independent supplemental source: `tests/calendar-independent/config.ts` and `tests/calendar-independent/layout.spec.ts`. The final source contains six passing targeted checks and one failing new-finding reproduction; a complete rerun of this seven-case file is expected to fail that reproduction until resolved. `supplemental.json` and `supplemental/` reflect the last filtered failure run; the original six-case pass remains in its log and separately named screenshots/metrics.

## Confirmed fixed behavior

At **1531×715**, actual directory title line height and element height are both **24px**; summary line and element height are **18px**. Cards are **60px** high and retain a **2px** border in both selected and unselected states. All five row heights are unchanged by selection, including the ellipsized long-name row. This directly addresses compression of a full line into the smaller old container; visual inspection confirms the glyphs are not vertically cropped.

The matrix checks each name/summary retains a full line, no name/summary overlap, summary inside its card, selected first card, actual wheel scrolling where the directory overflows, list bottom above its independent pager, last-row access and second directory page. Supplemental checks independently confirm:

- Light and dark selection invariance at the user viewport, keyboard Enter activation and visible focus.
- Nine records for one group: changing the right record page leaves the directory page unchanged; scrolling the left directory leaves the right record page unchanged; changing directory page clears record selection. Totals and raw persisted main document remain unchanged.
- At 320×568 and 390×844, directory overflow is visible and the document scrolls naturally with a real mouse wheel; the directory Next control becomes physically visible before click. No hidden internal directory scroll is required.
- Font-loading failure at 1531×715 and 390×844: deliberately blocked 18 and 17 font requests respectively, waited for fonts to settle, then verified complete 24px name lines and nonoverlapping summary lines. This is a fallback-font test, not browser/system zoom or a claim that normal font loading fails.

Desktop scrolling can expose a partial card at a scrollport edge; scrolling that card into view reveals its complete text. This is separate from the original fixed-height card internally clipping the text line. The new directory's bounded scroll and independent pager match the requested hotfix behavior.

## Screenshots visually inspected

| View/state | Screenshot under evidence root |
| --- | --- |
| User size, light, unselected / selected short | `1531x715-light-unselected.png`, `1531x715-light-selected-short.png` |
| User size, dark, unselected / selected short | `1531x715-dark-unselected.png`, `1531x715-dark-selected-short.png` |
| User size, long card selected, both themes | `1531x715-light-selected-long.png`, `1531x715-dark-selected-long.png` (also new finding evidence) |
| 320 English / 390 dark English, natural wheel | `320-mobile-unselected.png`, `320-mobile-selected-after-wheel.png`, `390-mobile-unselected.png`, `390-mobile-selected-after-wheel.png` |
| Font fallback | `1531-font-fallback.png`, `390-font-fallback.png` |
| Requested matrix samples | `matrix/calendar-layout-calendar-l-3efb9--readable-at-1531x715-zh-CN/calendar-initial.png` and `calendar.png`; `matrix/calendar-layout-calendar-labels-stay-readable-at-320x568-en/`; `matrix/calendar-layout-calendar-labels-stay-readable-at-390x844-ja/` |

The three matrix sample pairs were viewed at full resolution, along with supplemental user-size/light/dark and 320/390/fallback screenshots. All 30 cases produced screenshot pairs; not every screenshot was manually inspected. The screenshots are from real browser rendering, not Figma or simulated DOM.

## CAL-IND-01 / P2: selecting a very long name displaces right-page records/pager

Status: **OPEN on tested SHA**. The directory fix itself passes; this is a supplemental right-page content-height problem. It is outside the changed right-page CSS selectors. This report did not run a prior SHA for this case, so it does not classify it as a newly introduced regression.

Reproduction, using the same long name pattern already present in the committed 30-case fixture:

1. New context at **1531×715**; seed six task groups and today's records. Use `长活动名称 Long activity 日本語 `.repeat(8) for the fifth group. No character limit is approved by the PRD, and this is valid imported/created task text.
2. Open Calendar. Scroll the left directory to its fifth card.
3. Click or keyboard-activate that long-name card.

Expected: complete name remains accessible in a bounded heading/reading area; record rows and their independent pager occupy usable nonoverlapping space inside the right page.

Actual in **both light and dark themes**: directory card still correctly displays one full ellipsized title line. The right `h2` wraps to **330.75px** high. Right column bottom is **569.375px**, but `.calendar-records` starts at **563.75px** and ends at **825.8125px**. The right pager already occupies **532.984–569.375px**. The record region is therefore below/through the pager and outside the allotted page; its summary overlaps the pager and records fall below normal page controls. Full-page screenshots also show the overflowing content extending beyond the requested viewport.

Evidence: `failure-long-selected-heading.png`, `failure-long-selected-heading.json`, `1531x715-*-selected-long.png`, `metrics-light.json`, `metrics-dark.json`, and `long-heading-reproduction.log`. Trace and failure screenshot:
`supplemental/layout-supplemental-P2-lon-b716e-ord-details-above-its-pager/trace.zip` and `test-failed-1.png`.

The new isolated test asserts both record region within its column and above its pager; both fail with the measured values. Developer should bound long right-page headings while keeping the full name accessible and preserving record/pager space, then independently retest this case and affected layout matrix. No repair was applied by the tester.

## Build identity and boundaries

| Independently built file | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `DF2BB17EF09C296F21880824603AE48158C423D6C130392E00A3A73508C0A768` |
| `dist/web/style.css` | `E0F18A3C9B1914E087CF2CADD54D605B9F6384A7407AF54FCD51CB305077EB66` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

Application JS/HTML hashes remain unchanged from prior acceptance; CSS is the new tested artifact. Native Windows/Android packages were **not rebuilt or retested** for this CSS hotfix; existing installers still contain their previously built CSS. No full business regression, real mobile hardware, OS/browser zoom, screen reader audit, participant testing or pixel-exact Figma comparison was run. Font fallback does not substitute for those checks. Developer's old-version failure log was not used as independent pass/fail evidence, and this window did not rerun the old directory CSS.

Conclusion: **PASS for the reported directory text-cropping repair and its 30+2 requested scenarios. Supplemental long-name right-page scenario FAIL / P2; not all calendar overflow behavior is accepted.** Developer retains repair/merge responsibility. This worktree contains only new test/report/evidence additions; tracked product source and historical acceptance reports are unchanged.

## Retest: fcbf056 — PASS, CAL-IND-01 closed

2026-11-05, Asia/Shanghai. New fixed tested SHA: **`fcbf056cc2392fd9e76824684db98b4591d59d94`**. HEAD verified before and after testing, detached; tracked product diff remains empty. The preceding 3a84870 report text is retained unchanged as historical failure evidence.

Before checkout, the complete prior evidence directory, its harness and report snapshot were preserved under `calendar-independent-evidence-3a84870/` (`ORIGINAL-REPORT.md`, `harness/`, original logs, screenshots, metrics and failing trace). References in the historical section above now refer to that archive. New evidence uses the original `calendar-independent-evidence/` path; no earlier failure was overwritten or reclassified as a pass on its old SHA.

Reviewed diff: calendar column/heading/record-area CSS, focusable right-page heading in `src/ui/pages.ts`, expanded 30-case layout test and repair documentation. The tester did not alter product code. Same Windows/Edge/Node, isolated origin, fresh contexts and synthetic data as above. No native build/install or full unrelated business regression was performed.

### Actual rerun commands and results

| Command | New SHA result / evidence in `calendar-independent-evidence/` |
| --- | --- |
| `npm run build:web` | **PASS** TypeScript/Vite/271-file assembly; `build-web.log` |
| `npx playwright test tests/e2e/calendar-layout.spec.ts --output docs/development/book-c-2026-11-05/calendar-independent-evidence/matrix` | **PASS 30/30**, all 10 dimensions × three languages; `calendar-matrix.log`, 90 screenshot files |
| `npx playwright test tests/e2e/book.spec.ts --grep 'calendar groups by identity\|local assets, languages' --output docs/development/book-c-2026-11-05/calendar-independent-evidence/related` | **PASS 2/2** existing related cases; `calendar-related.log` |
| `npx playwright test --config tests/calendar-independent/config.ts` | **PASS 9/9** independently authored cases, including the original CAL-IND-01 assertions unchanged; `calendar-supplemental.log`, `supplemental.json` |

The committed matrix now also selects the long-name fifth group, checks full text retention and nonoverlapping heading/summary/record/pager regions, and verifies keyboard End reaches the heading's last scroll position at every matrix size/language. The independent suite retains all six prior targeted checks, the original failing right-page assertions, and adds two cases with **nine records for the long-name group** at 1531×715 dark and 820×600 light.

### CAL-IND-01 disposition

**CLOSED on fcbf056.** The original reproduction passes without weakening either record-boundary assertion. Measured at 1531×715 with the same original long name and record fixture:

| Geometry | 3a84870 failed | fcbf056 passed |
| --- | --- | --- |
| Right heading height | 330.75px | 73.5px |
| Right record scrollport bottom | 825.8125px | 524.984375px |
| Right pager top | 532.984375px | 532.984375px |
| Right column bottom | 569.375px | 569.375px |

The complete long name is preserved in DOM/stored data, while its visible heading is limited to two line heights. Independent **actual Tab navigation** from the selected left card reaches the directory Next control, then the focusable heading. End scrolls the heading to its tail: observed heading scrollTop 257px at the user size and 297px at 820×600; remaining distance to the bottom ≤1px. No text or main document is rewritten by viewing/scrolling.

With four visible records from a nine-record long-name group, real wheel input scrolls the desktop record area; heading scroll position is unchanged. The record scrollport remains above its independent pager. Changing the right record page retains left directory page 1/2, full heading text and persisted data. This additionally exercises content pressure absent from a single-record long-name fixture.

The left directory repair remains passing in both themes. Selected/unselected card heights and borders remain stable; title/summary line boxes remain complete. At 320/390 narrow sizes, document scrolling remains natural and record regions use the existing single-column behavior. Font-request failure tests still pass at user/narrow sizes; they are not claims about system zoom or screen readers.

### New screenshots and metrics visually checked

- `1531x715-light-selected-long.png`, `1531x715-dark-selected-long.png`: repaired heading/summary/record/pager separation.
- `1531-long-heading-end-records-scrolled.png`, `820-long-heading-end-records-scrolled.png`: visible heading focus and tail text with independently scrolled records.
- `matrix/calendar-layout-calendar-labels-stay-readable-at-320x568-en/calendar-long-name.png` and `matrix/calendar-layout-calendar-labels-stay-readable-at-390x844-ja/calendar-long-name.png`: narrow layouts, selected long card, keyboard-scrollable full heading.
- `failure-long-selected-heading.json/png`: the original reproduction's historical basename is intentionally retained in the new evidence directory, but these are the **now-passing new-SHA measurements/screenshot**. The actual failed 3a files remain in the separate archive.
- `metrics-light.json`, `metrics-dark.json`, `long-heading-scroll-1531.json`, `long-heading-scroll-820.json`: raw geometry, full text and keyboard-scroll evidence.

The six screenshot selections above were viewed at full resolution, supplemented by the matrix and independent screenshots. Screenshots are from actual Edge rendering. All new 30-case matrix screenshots were captured; not all 90 were individually inspected.

### New build identity and final scoped decision

| File | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `459250CE5998E1A6EAF2FC0BD20413D6FA206224EC0CBFF50E920577D2999B0D` |
| `dist/web/style.css` | `A82CE0341371DBB8256CA4012C6E1D5ADE2E3D353C4C8B22563508EB6A44ED92` |
| `dist/web/index.html` | `A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1` |

**PASS for this affected-calendar web hotfix on fcbf056cc2392fd9e76824684db98b4591d59d94. Original directory cropping and CAL-IND-01 are closed; no remaining finding was observed in the requested and supplemental retests.** This supplies the requested independent pre-merge evidence for this fixed SHA. Native packages were not rebuilt and do not automatically contain this new CSS/JS; full unrelated business/native/platform/zoom/reader/research checks remain outside this retest. No merge, product edit or deployment was performed by this window.
