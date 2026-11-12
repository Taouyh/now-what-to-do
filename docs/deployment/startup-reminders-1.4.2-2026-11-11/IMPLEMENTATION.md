# 1.4.2 review candidate: cold start and round reminders

Local candidate only. No push or public release in this delivery. Windows and Android 1.4.1 remain the published versions.

## Requirements and behavior

- A foreground round stops at its deadline, shows the existing localized “时间到了” state, and plays at most one sound when enabled.
- Notifications say “这一轮时间到了” / “Time is up for this round” / “今回の時間になりました”. They never declare the activity complete.
- Notification activation opens the current session with Continue and Finish and record. Only these explicit actions extend or record it.
- Background, lock, close and reopening do not extend the round beyond its deadline. Missed reminders are consumed silently when the UI returns; finished sessions remain at time-up, even overnight.
- Newly started rounds carry `reminderVersion: 1`. A known-running old v2 round adopts this deadline policy at a normal sleep/background transition or explicit resume; uncertain old snapshots still retain conservative recovery. Screen-off does not pause a running round. Backup schema remains v2; optional `preferences.reminders` stores sound and vibration. Old tasks, records and manual/pinned ordering remain intact.
- Per the latest user correction, there is **no reminder button or expandable reminder panel**. Reminders activate automatically with the timer. Sound defaults on and vibration defaults off; simple direct preference checkboxes remain in the settings footer (vibration on Android only). A closed web page cannot deliver a system notification.
- `reminderConsumed` persists foreground/reopen consumption. A finished round cannot re-arm on a subsequent background transition; genuinely pending background delivery remains armed until foreground reconciliation. Failed timer persistence cancels native delivery. Imports synchronize the new reminder preferences immediately.

## Native delivery

- Android: one persisted AlarmManager deadline and one immutable PendingIntent; a non-exported receiver deduplicates by round key, checks foreground activity, and opens MainActivity without changing web records. Notification channels separate sound/vibration preferences. The first explicit timer start/resume requests notification permission when required, once; no manual reminder activation. Exact scheduling uses permission when available, otherwise Android may delay the inexact fallback. Permission and exact-alarm access remain controllable in Android system settings. Delayed deliveries older than a minute are silent; stale newly submitted deadlines are ignored. Reboot re-registers a future pending round.
- Windows WebView2: one ScheduledToastNotification while inactive/asleep/closed, canceled when foreground or paused/recorded. AUMID and shortcut identity plus a `nowwhat://timer` protocol return to the app/current session. No repeat/snooze schedule. Windows notification permissions and Do Not Disturb remain authoritative.
- Native bridge failures do not block saving timer state. No native host writes task or completion data.
- Native OS notification delivery and tap activation need actual platform observation; browser tests do not prove locked-device delivery. No Android device/emulator is currently connected.

## Cold start

The six decorative WebPs were excessively large (individual paper textures ~1.9 MB). Re-encode from preserved PNG originals at WebP quality 85 using `scripts/optimize-startup.py`; outputs are lossy derivatives, not pixel-identical. Preserve upstream fonts/licenses, consolidate font CSS to eliminate chained stylesheet requests, and use optional font display to avoid late text reflow. Preload major textures, decode the assembled book, then reveal the page together. A 2.5-second post-mount ceiling prevents broken decorations trapping the UI. Runtime failure and second-window notices remain available.

Measured with cache disabled, Edge, 80 ms latency, 750 kB/s downlink, CPU 4× slowdown:

| View | Before resource bytes / last response | After resource bytes / book ready |
|---|---|---|
| Desktop 1440×900 | 6.12 MB / 9.14 s | 1.67 MB / 3.38 s |
| Mobile emulation 390×844 | 7.49 MB / 10.67 s | 1.57 MB / 3.14 s |

These are cold-load measurements, not physical-device frame-rate measurements. They do not promise instant rendering on every connection. Baseline/raw probe evidence is retained in the root worktree `.cache/startup-{before,after}.json`; independent verification must use a fresh profile.

## Validation and rollback

Latest local validation: 152 Node tests passed; 13 focused startup/mobile browser tests passed, plus the previous task-dragging regression. Cases cover no-pause on screen-off, one-shot consumption across foreground/background/reopen, failed persistence, preferences, 320–800 px layouts and IME contraction. Native build and independent verification follow in INDEPENDENT-TEST.md / RELEASE.md. Figma synchronization follows finalized UI verification in a separate worktree/chat.

Rollback: reinstall the published 1.4.1 package or serve the previous web commit; preserve user profile and backups. New reminder preferences are optional v2 fields. Before rollback, finish/discard the current round to cancel its scheduled native notification. Windows protocol registration is owned by the installer and removed by uninstall; profiles remain preserved.

Primary API references: [Android alarms](https://developer.android.com/develop/background-work/services/alarms), [Android exact alarm permission](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms), [Windows desktop notifications](https://learn.microsoft.com/en-us/windows/win32/shell/quickstart-sending-desktop-toast), [scheduled app notifications](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/app-notifications/app-notifications-scheduled).
