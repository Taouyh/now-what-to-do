# 1.4.2 local review candidate

Source commit: `7165e14d15cd76a6c782dbbf9f7c83c266c45366`. Local commits only; no push, master merge, GitHub Release or website deployment. Published 1.4.1 remains unchanged.

## What changed

Cold startup uses substantially smaller decorative textures and one font stylesheet, with an assembled first view instead of progressively appearing book parts. See [implementation and measured limits](IMPLEMENTATION.md) and the adjacent before/after JSON evidence.

Screen-off no longer automatically pauses a running round. New rounds and known-live v2 sessions keep the same deadline in background/lock, stop accruing at time-up, and wait for explicit Continue or Finish and record. Uncertain old saved snapshots still need deliberate recovery; this avoids inventing time from legacy data. Finished rounds remain at time-up overnight without replaying sound or creating records.

There is **no “到点提醒” button**. Starting or explicitly continuing a session enables its one-shot reminder automatically. Sound and Android vibration are directly adjustable in Settings. Android requests OS notification permission on the first explicit start/resume when required; denial is respected, not repeatedly prompted. Native delivery uses Android alarms / Windows scheduled notifications, with the text “这一轮时间到了”. Tapping returns to the current session. Browser foreground uses one sound; a closed browser page cannot produce a native notification.

## Review artifacts

| Platform | Local path | Bytes | SHA-256 |
|---|---|---:|---|
| Windows x64 | `dist/native-preview-1.4.2/windows/Now-What-1.4.2-Windows-x64-Setup.exe` | 13714096 | `F061759C9137DF8136FB2A352693737F52BC6F807131FE7719636ECF3E042987` |
| Android | `dist/native-preview-1.4.2/android/Now-What-1.4.2-Android.apk` | 11958018 | `8A863BCA10AE659A30A40DA1B1285073E723312597B1A7665DEF5D2582223A7F` |

Verify exact sizes against [artifacts.json](artifacts.json), generated from the final files. Android package ID remains `io.github.taouyh.nowwhat`, versionCode 8, minSdk 24, targetSdk 35. Original signing certificate SHA-256 remains `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15`. Windows remains the existing WebView2 host and data origin. User profiles, tasks, records and v2 backups are preserved.

## Validation and device acceptance

153 Node tests pass. Focused browser tests cover assembled startup, failed texture loads, no manual reminder entry, direct sound preference, mobile pagination/settings/IME and existing task ordering. The [independent report](INDEPENDENT-TEST.md) closes all reviewed code findings, including final permission probes (5/5), related regressions (22/22) and final package/source consistency. Broad c9a7ad6 coverage was 152 Node / 17 browser checks; the one-line final permission fix was tested selectively. Real Windows WebView2 lifecycle/backup/reopen tests use isolated profiles and a non-notifying E2E mode; sending power/activation messages is not physical sleep or clicking a real system toast. [Figma synchronization](FIGMA-SYNC.md) reflects the final UI at c9a7ad6; the final source commit changes permission handling only.

**Still requires user device acceptance:** Android lock/background notification delivery, sound/vibration, permission grant/denial and notification taps; real Windows scheduled notification display and protocol activation; physical sleep/Do Not Disturb; installer upgrade. Android has no connected device/emulator in this environment. OS notification and exact-alarm permissions, power management and Do Not Disturb can suppress or delay alerts; denied exact-alarm access uses Android's inexact fallback. No web test is presented as physical-device proof.

For personal review, export a backup first and install over the existing app (do not uninstall or clear its data). Start a short round, turn off the screen before it ends, return once before the deadline to check continued countdown, and again after the deadline to check time-up without extra accrual/repeated audio. Test Continue and Finish separately; only Finish records. Repeat with sound/vibration disabled and with permission denied.

## Rollback

Keep the published 1.4.1 installers. Finish/discard an active round before rollback so its native schedule is canceled. Windows may reinstall 1.4.1 over the existing profile. Android generally rejects an in-place versionCode 8 → 7 downgrade; prefer a corrected higher-code candidate. Export before any uninstall, because Android removes application data on uninstall. Do not overwrite profiles or rewrite Git history.
