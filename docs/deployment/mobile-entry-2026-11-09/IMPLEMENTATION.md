# Android entry and keyboard-contracted layout

Local-only follow-up to the mobile-fit candidate, 2026-11-09. No push/publication, master merge or Windows package update is authorized.

- Mobile onboarding is top-aligned with 24–48px of paper inset instead of vertically centered in the entire viewport.
- Empty-calendar Get started is centered above the directory pager's dash, with 12px separation from the pager.
- Mobile activity editor title and 44px close target participate in a separate flex header; they no longer use overflowing absolute offsets. The input body follows the header. The app brand behind the modal is hidden while it is open and restored on close. The existing bounded, scrollable body and visible footer remain.
- All product changes are scoped to `.mobile-book`; desktop layout and native hosts are untouched. Draft, save/cancel, calendar navigation and data schemas are unchanged.

Developer production build passed. Existing mobile behavior tests 10/10 passed; new Chinese/English/Japanese entry tests 3/3 passed after correcting the calendar grid item's horizontal alignment. These exercise reduced-height 360×360 and landscape 800×360, actual close hit-testing, draft preservation, calendar return and header restoration. Browser contraction is not a real Android IME test.

Independent fixed-commit verification, a fresh Android preview APK and a separate-worktree Figma synchronization follow. Prior independent reports remain historical evidence; this candidate has not been published.
