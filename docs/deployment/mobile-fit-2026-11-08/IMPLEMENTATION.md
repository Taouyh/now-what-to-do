# Android viewport and task pagination candidate

2026-11-08. Local candidate based on `322527c`. The user permits local commits but prohibits push/publication until explicitly instructed. Windows packages and native host code are not changed or rebuilt. Existing `docs/weekly/` and `nowwhat-video/` work is preserved.

## Changes

- Compact Android/touch layouts use the available viewport instead of a 720px minimum book. Windows user agents keep their existing layout. Desktop task pagination remains ten tasks across two pages.
- Mobile tasks render one page at a time. A ResizeObserver measures the list area between its heading and persistent pager; page capacity follows the available height and actual row size. Resizing preserves the first visible task where possible. Adding a task opens its current-capacity page; removal clamps pagination. Data remains in the existing task store.
- Settings use compact portrait rows and two landscape columns. Language, appearance, export and import remain reachable without scrolling at the tested phone sizes. Other pages keep internal scrolling for genuinely long content or constrained input/keyboard states; no data is hidden to simulate fitting.
- Completion continuation Save/Cancel share the task pager capsule style, colors and equal-width layout, including dark and hover/focus states. This is shared source for future platform builds; the existing Windows executable/installer is untouched.
- Android build accepts an optional output directory so the local candidate does not overwrite the published 1.4.0 APK. Package identity, signing key, storage schema and app origin remain unchanged; this is not a new public release.

## Developer checks

- Production build/typecheck pass. Existing book journeys: 10/10 pass.
- Added mobile behavioral tests cover real forward/back paging through 23 tasks without duplication/omission; portrait/landscape capacity and visible import chooser; resizing, add/delete; completion save/cancel at phone and desktop sizes in light/dark themes.
- Initial combined run: 17 pass, two capsule comparisons fail only on 0.015625px browser rounding of equal flex widths. Corrected the geometry assertion to allow less than 1px while retaining exact color/border/background comparisons; no product workaround for that assertion.
- Synthetic fresh Edge contexts, no real user storage. Phone sizes: 320×568, 360×640, 390×844, 800×360. Temporary captures/logs are under `.cache/mobile-visual/` and `.cache/mobile-*.txt`.

Independent fixed-source test results, candidate APK identity and Figma synchronization will be added after completion. No Android physical-device, IME, installation/upgrade or Windows acceptance is inferred from browser tests. No push, publication or Windows build is authorized in this round.

## First independent checkpoint and repair

The independent `c208809` checkpoint failed MOB-01 despite build and 19 browser tests passing: the inherited 470px dialog minimum made actions unreachable at 360px viewport height. Its report and evidence are preserved in [INDEPENDENT-TEST.md](INDEPENDENT-TEST.md).

The repair limits only mobile dialogs to the available viewport, scrolls the editor body and keeps its action footer visible. Confirmation content remains scrollable. A stable task-ID anchor now survives portrait/landscape round trips, rather than accumulating page-start rounding. Noninteractive completion notices no longer intercept touch input. Ten developer mobile tests pass, including short-viewport button hit testing, preserved drafts, confirmation scrolling and rotation round trips. The Android preview will be rebuilt and independently rechecked; the first APK is not the final candidate.
