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

## Final independent checkpoint and local APK

Fixed product `ca728cd276db3f8d1c64aff297ec0ba18d418a6d` passed the independent build and 20/20 configured book/mobile tests. Supplemental real wheel/CDP touch checks closed MOB-01, confirmed long confirmation content remains reachable, preserved edit drafts and the original task across rotation, and verified that the visible notification no longer blocks Save. See [the final report and preserved failure history](INDEPENDENT-TEST.md).

- Candidate: `dist/android-preview/Now-What-1.4.0-Android.apk`, 19,060,482 bytes. SHA-256: `722AF52D3CBEF09CD645C477D69895C82DEF70180C69B88A78C8C78B7613BACC`.
- Package/version remain `io.github.taouyh.nowwhat`, versionCode 6 / versionName 1.4.0; this is a local preview of that version, not a published release or a version-number bump.
- Independent inspection matched all 270 production web files (226 byte-exact, 44 newline-only text differences), the native bridge, and v2/v3 signatures using the existing certificate. No private signing material is included.
- The previously published Android APK remains byte-identical (`3A3FB094...F0FF85`). The Windows 1.4.0 installer remains byte-identical to the published release (`6B08CEA7...CF00`). No Windows build/install was performed.
- Changes remain on local `design/minimal-ui`; `master` and public releases are not updated. There has been no push.
- Android physical-device installation, keyboard/IME and in-place upgrade acceptance still require device verification. Browser simulation and signature continuity do not prove these behaviors. Export a backup before trying the preview; do not uninstall the existing Android app to update.

## Design handoff

A separate GPT window and fresh `0969` worktree verified Figma account `3966592487` and synchronized six editable mobile states, two-way task paging, light/dark capsules, and only the matching desktop continuation controls. Eight final screenshots and bounded geometry/action checks pass. [Figma synchronization report](FIGMA-SYNC.md) records the exact nodes, retained actions and static-prototype limits; [mobile task entry](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=376-5829). The report-only original commit is `4e4bf26`; product code remains the independently tested `ca728cd`.
