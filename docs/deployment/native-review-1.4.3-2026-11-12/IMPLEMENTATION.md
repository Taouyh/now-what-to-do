# Native review 1.4.3 — November 12, 2026

The user authorized Android implementation from the current Figma visual board, inclusion of the existing sound/screen-off fixes, new Windows and Android book icons, and delivery of both installers after testing in a new GPT window. This supersedes the earlier wireframe-only delivery gate. Local commits and review builds only; no push, merge, release publication, or website deployment.

## Design and behavior

Figma file `EUoXZR1hDJUUPVAtrDxpE5`, visual board `574:10204`. Account handle `3966592487` was verified before reading. Implementation references: home `574:10217`, tasks `574:10288`, calendar `574:10389`, editor `574:10482`. Detailed design history: [Android visuals](../android-visuals-2026-11-12/README.md). Icons were delegated to the existing NowWhat Figma design chat; [icon delivery](../book-icons-2026-11-12/README.md).

- Android home uses the paper page, top time/conditions controls, a centered action group, and an independently raised activity name. Existing next-step content remains readable.
- Tasks stay top-aligned on sparse, full and final pages. Row capacity follows available height, with true pagination, bottom navigation, dragging, pinning and direct Start preserved.
- Independent review correction: sparse final pages use the same 72 px slips as sparse first pages (64 px on small portrait screens). Capacity uses the standard row size so switching to a sparse page cannot oscillate pagination. Calendar reflow preserves focused entry/control after delayed IME release.
- Calendar directory and record details now occupy separate mobile views. Back returns to the same directory page/entry. Records have transparent backgrounds, bottom rules only, reserved detail space and up to four rows per page, reduced on short screens.
- The activity editor keeps its heading/close target and footer visible above the keyboard. Only the form body scrolls. Closing blurs the field and requests native keyboard dismissal immediately; the dialog uses a 100 ms opacity transition with no vertical collapse. Underlying layout remains stable until viewport resize events settle, preserving the task anchor.
- The native Back bridge now calls an exported function instead of inaccessible bundled globals. Notification cold entry waits for the app-ready signal when necessary.
- Reuses the existing absolute-deadline timer fix: screen-off/background checkpoints do not pause; returning before deadline resumes the same session, after deadline shows “时间到了” without accruing waiting time. No Sound option; request one timely sound, no repeat or missed-alert replay. Android vibration remains optional. See [sound correction](../always-sound-2026-11-11/IMPLEMENTATION.md).
- Windows retains desktop layout and timer behavior and receives the new book icon. Shared code changes preserve desktop flow; mobile layout rules require the mobile-book class.

## Assets and compatibility

Reused the original book palette, fonts, paper/environment textures and navigation/play/refresh assets. Figma paper/environment exports exactly match the existing source PNG SHA-256 values; runtime uses their existing optimized WebP versions. The exported task-paper material is `public/assets/android-task-paper.png` (SHA-256 `90c1d5334bca87623d8c9addd1b9d69c67438dbf80399c28134545323482d83f`). It is a reusable paper contour, not a rendered page screenshot. No new runtime dependency or network requirement.

Version 1.4.3; Android versionCode 9, unchanged package `io.github.taouyh.nowwhat`, signing identity and origin. Storage schema and data migration behavior are unchanged. Windows uses the existing per-user installation/profile location. Existing data must be retained during upgrades. Never uninstall/clear storage to perform a routine upgrade; keep a backup before device acceptance.

## Validation and delivery

Implementation checks: 153 Node tests passed; Vite/TypeScript build passed; 23 browser tests covering mobile layout, entry, startup/reminders, pinning and drag sorting passed. An additional final run of the three Android visual-flow cases passed after native Back and popup geometry changes. Cases use 360×752, 320×592 and 390×796 content viewports, three languages, simulated keyboard shrink, task anchor preservation, pagination, calendar Back and stable expanded-row bounds. Reference Figma device dimensions include system bars; browser content dimensions exclude them.

Build commands:

```powershell
npm.cmd run build:android -- -OutputDirectory dist/native-review-1.4.3-2026-11-12/final/android
npm.cmd run build:windows -- -OutputDirectory dist/native-review-1.4.3-2026-11-12/final/windows
```

Run sequentially because both refresh dist/web. The independent window must test the fixed source commit and these exact artifacts, checking hashes, APK signing/version/assets, Windows installer/payload and isolated browser regressions. The release record will hold final paths/hashes and independent results.

Browser resize simulation does not prove OPPO IME animation smoothness, real lock-screen delivery, system sound/vibration settings, launcher mask appearance, or upgrade acceptance. These require physical-device acceptance. This machine currently has Android build tools but no connected-device/emulator test evidence. No physical-device acceptance is claimed.
