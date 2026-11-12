# NowWhat 1.4.3 native review packages

November 12, 2026, Asia/Shanghai. Local review delivery only; the published 1.4.1 release and promotional website are unchanged. No push or master merge.

Final source commit: `a6e9c9e8f73f132c86674e105c658fb1643e042f`. Initial candidate `08cc289` was superseded after independent review found lost calendar focus during delayed keyboard reflow and a sparse last-page row-height discrepancy. Test-only commit `786580a` updates an obsolete rectangular-border assertion to the approved paper-slip style. Book icon commits: `a750e58` and documentation cleanup `fc8f986`. Scope and Figma mapping: [implementation](IMPLEMENTATION.md), [icon design](../book-icons-2026-11-12/README.md).

## Downloads

| Package | Local file | Size | SHA-256 |
| --- | --- | ---: | --- |
| Android 1.4.3, versionCode 9, Android 7+ | `D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12/final/android/Now-What-1.4.3-Android.apk` | 12,106,044 bytes | `41C33C9347F9D55CC7AF0AADE132E3177C3A862916122B864A473BE26E54B87F` |
| Windows 1.4.3, x64 | `D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12/final/windows/Now-What-1.4.3-Windows-x64-Setup.exe` | 13,910,587 bytes | `82F3579826BADAA578B8A241019F4002F2B2B27525B6DBE28E1A735807232B6C` |

Builds use the existing scripts and signing identity. Android certificate SHA-256: `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15`. Package name, WebView origins, profile/storage paths and backup format are unchanged. [Machine-readable artifact record](artifacts.json).

## Changes

Android follows the new home, task, calendar and activity-editor visuals. Tasks have true pagination; calendar uses separate directory and detail views. The editor closes concurrently with keyboard dismissal and keeps its background anchor stable. Native Back and cold notification entry use explicit bridges.

Both native packages include the book icon and the current timer correction: screen-off does not automatically pause a running round; no Sound option; one timely alert, no looping, no missed-alert replay, no accumulated waiting time. Notification wording remains “这一轮时间到了”. Windows otherwise retains the current desktop/web layout.

## Verification status

The implementation window passed 153 Node tests, TypeScript/Vite build and 23 targeted browser regressions. After the review corrections, all 44 Android-flow/mobile/calendar layout tests passed. Both final native builds completed; APK signing and resource packaging passed. Earlier candidate artifacts remain for audit only; deliver the final subdirectory files above.

Independent test chat: `01a1cf8d-8bc0-7693-af05-fa1e3306d5aa`, worktree `C:/Users/fengcai/.codex/worktrees/3e31/now-what-to-do`. Final full browser regression: **110/110**. The independent 23-case suite covers 18 language/theme/size combinations, deterministic keyboard-release focus recovery, touch drag, timer behavior and notification cold entry. Final APK signature/resources/content checks passed. The actual final Windows installer completed an isolated test install; all **276 payload files** matched, native WebView2 smoke passed and user registration/shortcuts remained unchanged. See [independent report](INDEPENDENT-TEST.md) for the original findings, corrections, exact evidence and limitations, and [Figma verification](FIGMA-VERIFICATION.md).

## User acceptance and rollback

Install over the existing app, retaining its data. On OPPO Reno 10 Pro 5G, check the new layouts, opening/closing Add activity with the keyboard, and a short round that crosses its deadline while locked. Reopen/tap the notification to confirm the existing session offers Continue and Finish and record. Check the new launcher icons on both platforms. These physical-device/OS checks are not covered by browser viewport simulations.

For rollback, export a backup and finish or discard the active round to cancel its reminder. Windows can reinstall the earlier installer with the existing profile. Android normally blocks downgrading versionCode 9; do not uninstall/clear data to force it. Prefer a corrected APK with a higher versionCode, preserving the same signing identity. No live user installation was modified by the implementation window.
