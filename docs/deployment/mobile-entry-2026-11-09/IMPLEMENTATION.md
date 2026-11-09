# Android entry and keyboard-contracted layout

Local-only follow-up to the mobile-fit candidate, 2026-11-09. No push/publication, master merge or Windows package update is authorized.

- Mobile onboarding is top-aligned with 24–48px of paper inset instead of vertically centered in the entire viewport.
- Empty-calendar Get started is centered above the directory pager's dash, with 12px separation from the pager.
- Mobile activity editor title and 44px close target participate in a separate flex header; they no longer use overflowing absolute offsets. The input body follows the header. The app brand behind the modal is hidden while it is open and restored on close. The existing bounded, scrollable body and visible footer remain.
- All product changes are scoped to `.mobile-book`; desktop layout and native hosts are untouched. Draft, save/cancel, calendar navigation and data schemas are unchanged.

Developer production build passed. Existing mobile behavior tests 10/10 passed; new Chinese/English/Japanese entry tests 3/3 passed after correcting the calendar grid item's horizontal alignment. These exercise reduced-height 360×360 and landscape 800×360, actual close hit-testing, draft preservation, calendar return and header restoration. Browser contraction is not a real Android IME test.

Independent fixed-commit verification, a fresh Android preview APK and a separate-worktree Figma synchronization follow. Prior independent reports remain historical evidence; this candidate has not been published.

## Final verification and local package

Fixed product `296b906029114fbdc838f1ebd197f21ed5310677` passed independent build, 13/13 browser tests and three-language screenshot/hit-target checks, including 320×320, 360×360 and 800×360 contracted viewports. Draft retention, coordinate close, brand restoration, save/cancel and real wheel/CDP touch body scrolling passed. See [independent report](INDEPENDENT-TEST.md). This is browser simulation, not proof of the user's actual Android IME behavior.

Local APK: `dist/android-preview-entry/Now-What-1.4.0-Android.apk`, 19,060,482 bytes, SHA-256 `69E5E859397F86E8C8CC2156B7B866A1210F414D69580802DF7A9AF15011FD4E`. Independent inspection matched all 270 production files (226 exact and 44 newline-only text differences), the bridge, and the existing certificate with v2/v3 signatures. Package/version remain `io.github.taouyh.nowwhat`, 1.4.0/code 6. No published artifact was overwritten; no Windows package, master or remote was changed. Device keyboard and upgrade verification remain outstanding.

The separate `cbbe` worktree/GPT window verified Figma account `3966592487`, added four entry states and updated the existing short-screen editor. Five screenshots and bounded action/geometry checks passed; all 51 prior action-node digests were preserved. [Figma report](FIGMA-SYNC.md), original report-only commit `02fe502`, records the editable nodes and limitations. Product source remains the independently tested `296b906`.
