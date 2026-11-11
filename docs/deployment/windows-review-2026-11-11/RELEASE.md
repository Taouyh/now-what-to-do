# Windows 1.4.2 review installer

2026-11-11, Asia/Shanghai. Built at the user's request from fixed source `9559eda4ac783767d127af2f9daac0135cdb2d4d`, using the current verified web implementation. This is a **local review installer**, not a published release. No push, master merge, GitHub Release or website change occurred. Published 1.4.1 remains unchanged.

## Download and identity

Installer: `D:/code/now-what-to-do/dist/windows-review-2026-11-11/Now-What-1.4.2-Windows-x64-Setup.exe`

- Version: **1.4.2**, Windows x64, existing WebView2 host.
- Size: **13,714,061 bytes**.
- SHA-256: `E793C31E5279DF4A0B94CD3ABE3C895B930F44C44C370A8ED847E79799616BF8`.
- Payload directory: `dist/windows-review-2026-11-11/webview2-unpacked`.
- Build command: `npm run build:windows -- -OutputDirectory dist/windows-review-2026-11-11`.

The shared runtime has no Sound option; it requests one timely foreground sound, ignores legacy `sound:false`, and does not replay missed/consumed reminders. Background/screen-off rounds keep their deadline, stop accruing at time-up and await Continue or Finish and record. The previous startup optimization and existing task capabilities are preserved. Browser/OS permission, volume and Do Not Disturb restrictions still apply.

## Verification

Build/type checking passed. Main-window native smoke passed with an isolated profile. A separate GPT chat at a fixed commit in a new worktree then installed the actual setup into an isolated directory using the existing non-registering installer test mode. All 275 payload files matched the installed files byte-for-byte. The source web content was equivalent, with CRLF/LF differences documented rather than misreported as byte identity.

Installed native smoke, trilingual settings checks, imported legacy mute preference, one-shot deadline/no replay checks and 9 reminder regressions passed. See [independent report](INDEPENDENT-TEST.md), originally committed as `e6da612b961f5311e2aa034dcc7a78a385092303` and incorporated as `e7028d4`. Test chat: `01a1cab3-da85-7030-9799-e9dfec0a24e3`.

No actual OS toast, notification tap, physical sleep/lock, speaker playback, installer upgrade or user visual acceptance is claimed. No Android APK was rebuilt for this request. The Android redesign remains gated by [wireframe approval](../android-wireframes-2026-11-11/README.md).

## Data compatibility and rollback

The application ID, WebView2 origin/profile location and backup schema are unchanged. Export a backup before the user's upgrade test; install over the existing version without clearing application data. Keep the published 1.4.1 installer. If rollback is needed, finish or discard the active round first to cancel its scheduled reminder, then reinstall the prior Windows version using the existing profile. No uninstall or user-profile modification was performed during these tests.
