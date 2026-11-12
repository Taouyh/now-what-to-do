# Independent verification — 1.4.2 startup and reminders

## Final conclusion — `7165e14d15cd76a6c782dbbf9f7c83c266c45366`

2026-11-11. **PASS for the requested targeted retest and source/bundle consistency checks. F4 is resolved; no reviewed code finding remains open.** This conclusion does not certify actual OS notifications, physical Android/lock-screen behavior, installer upgrade, or participant acceptance. Those limits remain unchanged. Historical failures and native executions below apply only to their named revisions.

The production diff from `c9a7ad6` is one call to `requestAutomaticReminderPermission()` in the successful `finishTimer(restart:true)` path, after `setTimerState(createTimerState(...))` succeeds. Android/Windows native source, bridge source, packaging/build scripts and UI are unchanged. Review confirmed that a failed restart returns before requesting permission.

### Final targeted validation

| Check | Result and scope |
| --- | --- |
| Independent automatic-permission probes | **5/5 pass.** Ordinary start, short recovery and long recovery each call the permission bridge once. Failed main-data save and failed active-timer replacement each call it zero times; successful retry calls it once, leaves one old completion record, and starts one new running round. Another recovery call does not request/record again. |
| Related existing regression tests | **22/22 pass** via `node --test tests/reminders.test.cjs tests/timer-recovery.test.cjs`. |
| Typecheck + production build | **Pass**, `npm.cmd run build:web`. |
| Final Windows unpacked web bundle | Byte-identical to this worktree's independent build. Native bridge is byte-identical to fixed source. |
| Final Android APK web bundle | `assets/app.js` is byte-identical to the independent build. `assets/native-android.js` matches fixed source exactly after CRLF/LF normalization; the 13-byte raw difference is line endings only. |
| Unchanged broad coverage | Not rerun as requested. The `c9a7ad6` results remain 152 Node / 17 browser tests plus the two real Windows host runs described below. The implementation's reported 153-test full run is not relabeled as an independent full run. |
| Final native runtime / actual OS delivery | Not repeated for the one-line JS fix. Native source is unchanged; final package consistency is verified separately. Actual system notifications, Android runtime, physical screen-off and upgrade acceptance remain untested. |

Reproduction sources alongside this report assert the **fixed** permission behavior. Local logs: `.cache/final-permission.log` and `.cache/final-focused.log`. No original UI selector removed in `c9a7ad6` was reused.

### Final observed artifacts

The files at the provided `D:/code/now-what-to-do/dist/native-preview-1.4.2` paths were independently hashed after rebuilding. They contain the fixed JS bundle. Installer/APK hashes identify these artifacts; hashing does not establish successful installation or device execution. The Windows bundle comparison is against the supplied `webview2-unpacked` payload, not an installed or extracted setup instance.

| Artifact | SHA-256 |
| --- | --- |
| Windows setup (hashed only) | `F061759C9137DF8136FB2A352693737F52BC6F807131FE7719636ECF3E042987` |
| Android APK (hashed and relevant assets inspected) | `8A863BCA10AE659A30A40DA1B1285073E723312597B1A7665DEF5D2582223A7F` |
| Windows host (identified; no new runtime run) | `711C11898CE15EC9EEFA372BACA38E18F1ECE6BF9D2B3118CAA4D7BD3EF77ADB` |
| Independent build, Windows payload and APK `app.js` | `BFEFE56329477B97C5A2B96AE4051205D9A0462672FA113802C46B308CA915C9` |
| Windows bridge, source and payload | `79156994CCCCC4A14EEC900850AAFAAF090A665A70B9D0990798211823169639` |

Only independent reports/reproduction scripts are delivered by this review; product implementation was not modified, pushed or published.

## Retest: `c9a7ad658e05f1d207cd1a2493d8720efb589288`

2026-11-11. **One new P2 finding, F4, remains: long recovery skips automatic notification permission.** Screen-off continuation and removal of the manual reminder UI pass within the tested JS/browser scope. The exact `c9a7ad6` Windows payload now also passes the native follow-up below. This does not resolve F4 or constitute physical lock-screen/system-notification acceptance. Historical native results remain scoped to their named revisions.

### F4 — P2: continuing an old long-paused session bypasses the automatic permission request

Locations: `app.js:574–575` and `app.js:672–675`.

`resumeRecoveredTimer()` returns through `finishTimer(..., {restart:true})` when recovery requires a new session, before reaching `requestAutomaticReminderPermission()`. The restart branch writes a new versioned timer and starts its loop directly, without requesting permission either. This differs from ordinary Start and short recovery.

Reproduced with a fresh synthetic profile containing an unversioned v2 timer paused overnight, representing an older installation's pending timer. Boot conservatively creates `resumeAsNew:true`. Explicit Continue records the previous segment once and starts a new `reminderVersion:1` running session, but calls the native `requestReminders` bridge **zero times**. On Android 13+ where permission has never been requested/granted, that resumed session can therefore reach its deadline without a system notification. The receiver checks `areNotificationsEnabled()` before posting. The missing bridge call is executable evidence; actual Android dialog/notification behavior was not observed.

Reproduction: `node docs/deployment/startup-reminders-1.4.2-2026-11-11/independent-permission.cjs` — **2 pass, 1 fail**. Start and short recovery request once; long recovery fails `expected 1, actual 0`. The test asserts the desired repaired behavior rather than treating this omission as success.

Fix direction: after successfully creating a restarted session in `finishTimer` (or in a shared successful-start path), invoke the automatic permission helper. Preserve idempotent record handling and avoid prompting on a failed restart. Android's existing persistent `asked` guard still owns the once-only dialog policy. Retest new start, short recovery, long recovery, retry after failed replacement, and extension.

### Current executed checks

- **152/152 existing Node tests pass**, typecheck and production build pass.
- **17/17 Edge browser tests pass** on isolated port `18842`: startup-reminders, mobile-entry, mobile-book, task-reorder. These use the new direct checkbox UI; they do not click the removed `reminderSettings summary`. The 320×568 dark-screen case confirms no reminder button exists, sound is directly reachable, and import remains visible.
- Existing independent consumption/import/storage probes still pass. New independent sleep probes confirm both a fresh round and a known-live old v2 round gain exactly 60 seconds during simulated sleep/resume, remain unpaused, later cap at the deadline without extension/records, and adopt `reminderVersion:1` where appropriate. A fresh-runtime uncertain old snapshot stays paused in conservative recovery with its saved elapsed time unchanged.
- **New permission probe: 2 pass / 1 fail (F4).** Source inspection confirms Android prompts at most once via its persisted `asked` flag and no longer opens system settings automatically; Windows has removed the permission/settings bridge entry. These source observations do not prove a real Android dialog was shown.
- Exact `c9a7ad6` Windows payload: **both native runs pass**, as detailed below. The setup installer and Android APK were hash-verified but not installed. Physical screen-off, actual Windows/Android system notifications, sound/vibration and notification clicking remain unverified.

Logs under `.cache`: `retest4-node.log`, `retest4-browser.log`, `retest4-probes.json`, `retest4-permission.log`. Only review documentation and reproduction scripts were changed in this worktree; no product fix, push or publication was performed.

### Native follow-up for the exact `c9a7ad6` artifacts

The delivered setup and APK hashes were independently checked and match the supplied values. The unpacked Windows payload was copied unchanged to `.cache/native-retest4`; the host executable's hash was checked again before launch. **No AUMID or other binary patch was applied.** Its `web/app.js` hash equals this worktree's independent production build of `c9a7ad6`.

| Artifact | SHA-256 |
| --- | --- |
| Windows setup (hashed only) | `70E5FBE1B2A538DFFF5F85B37B1E2B5BB91DCC5278CBF195F1762DBF228115B0` |
| Android APK (hashed only) | `C105E0AA9A4E903A5CF32AFC213722828016854E90B0079A5EC1129D6EC14C19` |
| Unmodified Windows host executed | `6060E72E391564C6098A24D11382BE0F9477076B4688EE4B514648CA1D064830` |
| Packaged and independently built `app.js` | `C4EE775F936AAD46ACEFC4CCCA59A5CBB4306CB53FD6338CDA40D78D63EC6D51` |

Real WebView2 `157.0.4341.42`, `NOWWHAT_E2E=1`, separate synthetic profiles and dynamically allocated CDP ports:

- `independent-native.cjs` — **PASS**, profile `test-artifacts/reminder-native-UZk8js`. Actual host background message produced the muted schedule JSON. Real-time arrival capped elapsed at 600000ms and preserved the pending background reminder. Activation-handler message consumed it, subsequent background sent null, and explicit finish recorded once. Added host power-message cases (`WM_POWERBROADCAST/PBT_APMSUSPEND`, then `PBT_APMRESUMEAUTOMATIC`) left both a new round and a synthetic known-live old v2 round running, at 4443ms and 4384ms elapsed respectively, with `reminderVersion:1`. Explicit pause then sent null.
- `tests/native-book-smoke.cjs` — **PASS**, profile `test-artifacts/book-native-bUkEnq`. Native origin/bridge/assets, actual backup export to the synthetic directory, pause, exit/reopen recovery, and unique completion passed.

Power messages were deliberately sent to the real host window; the machine was **not** locked or suspended. They test the native handler/JS integration and wall-clock continuation, not physical sleep behavior. E2E mode does **not** submit actual system notifications. Actual toast/Android notification delivery, audible sound/vibration, user clicking a real notification, Android permission dialogs, Android runtime, and installer upgrade remain untested. The Windows tests do not exercise the Android-only missing-permission path F4, so that finding remains open.

Reproduction uses the same `independent-native.cjs` command as below, with `NOWWHAT_NATIVE_DIR` set to `.cache/native-retest4` and `NOWWHAT_NATIVE_SHA256` set to the executed-host hash in this table. Raw logs: `.cache/retest4-native.log` and `.cache/retest4-native-smoke.log`. Test processes were closed; the existing installed application/profile was not operated.

## Retest: `3a59aa494574966062135612c628663c4d30c0da`

2026-11-11, separate worktree. **PASS within the executed scope: all three original code findings and C1 are resolved.** No new blocking source/runtime defect was found. This is not physical Android, actual system-notification, installer-upgrade, or participant acceptance. Those platform gates remain unverified; the historical failed verdicts below apply only to their named revisions.

| Finding | Latest result |
| --- | --- |
| F1 Android replay | **Resolved by source review and independent runtime probes.** Foreground arrival persists consumption and sends null on subsequent background/resume transitions. Fresh-runtime restoration of both expired running and already-finished snapshots also consumes the reminder before backgrounding. The Android native guard rejects an expired payload with no existing same-key pending payload. Actual Android delivery was not exercised. |
| F2 Windows E2E isolation | **Resolved.** Test-mode cancellation returns before OS calls. The newly rebuilt, unmodified host was safely exercised with an isolated profile in E2E mode; no identity patch was needed for this revision. |
| F3 frozen timer deadline | **Resolved.** Background checkpoint write failure pauses recovery and sends exactly one null native sync. |
| C1 imported preference sync | **Resolved.** Both successful import and an injected post-save UI failure/rollback immediately synchronize the correct current preference to the native bridge. |

Validation: **151/151 Node tests, 17/17 Edge browser tests, typecheck, production build, updated independent probes, and both real Windows WebView2 runs pass.** The extra browser test measures dark reminder-panel text contrast above 4.5:1 and verifies its bounds inside a 320×568 viewport. Browser tests use the isolated port `18842` and fresh contexts. Test scripts were updated to assert the repaired behavior, not the former failure.

Additional independent assertions verify that genuine background arrival retains the original key/deadline with `reminderConsumed:false` and zero foreground oscillator requests; resume consumes it; a later background sends null; explicit extension resets consumption and creates a new round key. Neither fresh-runtime restoration nor waiting creates a completion record. Import rollback uses an injected single UI exception after saving, then checks synchronization of the restored sound preference.

### Latest native package and runtime evidence

The newly rebuilt payload was copied, without modifying any bytes, from the provided `D:/code/now-what-to-do/dist/native-preview-1.4.2/windows/webview2-unpacked` into `.cache/native-retest3`. The native probe verifies the executable SHA-256 before launching. The packaged web bundle exactly matches the independent build of the fixed source. These hashes identify the artifacts observed during this retest; the setup installer and APK were hashed but were not installed/executed.

- Unmodified host: `B78DC277F91AB911E9F3275B9A5ACF6ABD53B14CC4A03ABBEE34B61646213F28`.
- Packaged and independently built `app.js`: `EC6D677405535A0C6B3B352924F50FB3DB919410B9F82BFCCC568F3BC523459B`.
- Windows setup: `5E32D9E7F8F2C7075533FDBF6F57717F53CE741719BCD6A7912D8D1FEC3E6A25`.
- Android APK: `2344DC416A8BC94C2173BB29E56688E7FA176F41D074DDEF6A99F8C4404DF5F3`.
- Real WebView2 runtime: `157.0.4341.42`.
- Native reminder profile: `test-artifacts/reminder-native-XnEjlr`. Actual host `WM_ACTIVATE/WA_INACTIVE` produced the expected muted schedule JSON. Real elapsed time reached the deadline with `elapsed:600000` and consumption still false. Actual host `WM_APP+41` then persisted consumption and displayed Continue/Finish. A second background message sent null. Explicit Finish produced one record for the original completion ID.
- Native smoke profile: `test-artifacts/book-native-fbncMg`. Native origin/bridge, assets, real export to a synthetic directory, pause, exit/reopen recovery, and exactly one completion all passed.

These are actual Windows host/bridge executions, not browser simulations of the host. They deliberately use `NOWWHAT_E2E=1`, which records scheduled-notification JSON and does not submit a Windows toast. `WM_APP+41` exercises the handler, not a user's click on an actual OS notification. No Android emulator or physical device was used. User data and the existing installed application were not operated.

Reproduce the new native check from the repository root after placing the verified payload at the indicated path:

```powershell
$env:NOWWHAT_NATIVE_DIR=(Resolve-Path .cache/native-retest3).Path
$env:NOWWHAT_NATIVE_SHA256='B78DC277F91AB911E9F3275B9A5ACF6ABD53B14CC4A03ABBEE34B61646213F28'
node docs/deployment/startup-reminders-1.4.2-2026-11-11/independent-native.cjs
node tests/native-book-smoke.cjs
```

Local raw logs: `.cache/retest3-node.log`, `retest3-browser.log`, `retest3-probes.json`, `retest3-native.log`, `retest3-native-smoke.log` (all under `.cache`). No production implementation changes, pushes, or publication were made by this independent review.

## Retest: `16efacd706b2faa1ab0c146f84c0430a283320ea`

2026-11-11, separate worktree. **F1 remains a release blocker.** This retest covers source, the JS runtime, and browsers; the rebuilt native packages have not yet been verified for this revision. Native observations below belong to the initial candidate only.

| Finding | Retest result |
| --- | --- |
| F1 Android expired-round replay | **Still reproduced.** Foreground arrival creates three oscillator requests and sends null; background one second later resends the identical expired round key with sound enabled. `TimerReminder.java` and the finished/background payload branch are unchanged. Silencing resume does not prevent this separate foreground → background path. |
| F2 Windows E2E cancellation isolation | **Fixed by source inspection.** `reminderCancel()` now returns immediately when testing, before any ToastNotificationManager call. Real rebuilt-host verification is pending. |
| F3 frozen timer retains deadline | **Fixed in independent runtime probe.** Injected background checkpoint failure now creates paused recovery and sends exactly one null native payload. |
| C1 import sync | Unchanged; remains a low-priority observation with normal checkpoint/lifecycle repair. |

Validation rerun: **149/149 Node tests, 16/16 Edge browser tests, typecheck and production web build pass.** The browser command and port are the same as below. Updated `independent-probes.cjs` asserts the F3 cancellation fix and still reproduces F1. The original initial-candidate probe is preserved in commit `9c46b03`.

The new reminder-version validator and resume audio regression were reviewed; the added AudioContext stub test passes for one foreground chord, muted arrival, and silent resume. This is JS call-count evidence, not observed device audio. Local retest logs: `.cache/retest-node.log`, `.cache/retest-browser.log`, `.cache/retest-probes.json`.

## Initial review: `9e6f6bb02c4b11c93a0b376c53ce0b34030c4744`

Date: 2026-11-11 (Asia/Shanghai). Fixed candidate: `9e6f6bb02c4b11c93a0b376c53ce0b34030c4744`.

**Verdict: do not release this candidate unchanged.** The web regression suite passes, but Android can replay an already consumed foreground reminder. Windows E2E notification cancellation is not isolated from the installed app. A storage-failure path also leaves the native deadline armed after the JS timer has frozen.

This review was performed in a separate GPT chat/worktree, `C:/Users/fengcai/.codex/worktrees/1605/now-what-to-do`, checked out at the requested commit. No product implementation was changed, no push/publication was performed, and no user profile was used. Dependencies are a junction to `D:/code/now-what-to-do/node_modules`.

## Findings

### F1 — P1: Android re-arms a foreground reminder after it has already sounded

Locations: `app.js:397–400`, `app.js:802`, `android/src/io/github/taouyh/nowwhat/TimerReminder.java:21–33,51–55`.

Reproduction from the real JS runtime, using synthetic time and a native bridge recorder:

1. Start a new `reminderVersion:1` round in the foreground with sound enabled.
2. Advance to its deadline. One Web Audio chord is requested (three oscillators), `soundPlayed` becomes true, and the bridge receives `null`.
3. One second later, call the native background lifecycle, as when pressing Home/locking the phone.
4. The bridge receives the same key and expired deadline again, with `sound:true` and `background:true`.

The Android implementation removes `payload` on the foreground null sync, but does not mark that key delivered. The receiver also returns before marking `delivered` when the activity is resumed. Consequently the later payload passes both native deduplication checks and schedules an alarm for `max(expiredDeadline, now + 100ms)`. While now in the background, the receiver marks it delivered and emits another audible notification because it is less than 60 seconds late. If the user backgrounds much later, it still creates an unwanted silent stale notification. This also affects a silently restored time-up round without a previously delivered native key.

Evidence: `node docs/deployment/startup-reminders-1.4.2-2026-11-11/independent-probes.cjs`, `ANDROID-REPLAY`. The payload sequence is executable evidence; the Android notification outcome is source-level inference, **not device observation**. Android's [AlarmManager documentation](https://developer.android.com/reference/android/app/AlarmManager) describes one-shot scheduling; this implementation explicitly moves the stale deadline into the future by 100ms.

Fix direction: persist consumption consistently across foreground and background owners, or explicitly distinguish a pending background delivery from an already consumed round. Simply dropping all finished payloads risks canceling a legitimate pending background notification. Retest foreground arrival → background, reopen after arrival → background, and background arrival → foreground → background.

### F2 — P2: Windows test profiles share cancellation with production notifications

Locations: `desktop/webview2/reminder.h:8,12–18,42–44,57`, `desktop/webview2/main.cpp:176`.

`NOWWHAT_E2E=1` guards registration and `AddToSchedule`, but `reminderCancel()` still calls `CreateToastNotifier`, `RemoveFromSchedule`, and `History().Remove` with the production AUMID `io.github.taouyh.nowwhat`. It runs at startup and during ordinary state changes. Thus an independent storage profile does not prevent a test from removing the installed app's pending notification/history. The claim that test mode only writes schedule JSON is incomplete.

This was identified by source review; **no production notification was deliberately created/deleted to demonstrate it**. The supplied executable was not launched with its original notification identity. Use a test-only notifier identity or make all OS notification operations no-ops in E2E mode, including cancellation. The schedule log also remains after cancellation, so its existence alone cannot verify successful cancellation.

### F3 — P2: checkpoint storage failure freezes JS but leaves the native deadline armed

Location: `app.js:434–442`.

Start a round, enter background, then inject an `activeTimer` write failure at the next checkpoint. `setTimerState` stops the timer loop and creates a paused `timerFrozen` with `recoveryReason:'interrupted'`, but its catch path never sends a null native sync. The previous Android alarm / Windows scheduled payload remains active. With no later lifecycle event to repair it, the native reminder can fire for a session the runtime has stopped. This is a reminder-state inconsistency; it does not itself create completion records.

Evidence: executable `STORAGE-FAILURE-STALE-ALARM` probe confirms paused recovery, no cancellation call, and the previous non-null native payload. Actual OS delivery under this fault was not tested. Attempt cancellation independently of localStorage persistence when transitioning into frozen/protected recovery; test failures while already backgrounded.

### C1 — low-priority observation: import does not immediately synchronize reminder preferences

`applyImport` calls `syncRuntimePreferences`, whose reminder helper only updates controls/status. Importing sound-off preferences into a running timer changes the UI immediately but leaves the native payload at sound-on until a checkpoint or lifecycle sync. The `IMPORT-STALE-PREFERENCES` probe reproduces zero bridge calls on import. Normal backgrounding syncs the new preferences, and ordinary checkpoints usually repair this within five seconds, so this is not an independent release blocker in the tested flow. Synchronize after successful import to make the state transition explicit.

## Executed validation

| Layer | Result | Evidence / scope |
| --- | --- | --- |
| Node regression | 148 / 148 pass | `npm.cmd test`; isolated storage VM |
| Typecheck + production web build | Pass | `npm.cmd run build:web` |
| Edge browser regression | 16 / 16 pass | `BOOK_TEST_PORT=18842`; startup-reminders, mobile-entry, mobile-book, task-reorder specs |
| Additional independent probes | Findings above reproduced; other assertions pass | `independent-probes.cjs`; no OS API mocks described as physical tests |
| Windows WebView2 native smoke | Pass | Existing `tests/native-book-smoke.cjs`, with isolated-identity executable copy |
| Windows native reminder host | Pass within E2E limits | `independent-native.cjs`; actual host window messages, actual JS/native bridge, schedule JSON |
| Android runtime / physical device | Not tested | No Android device or emulator exercised |
| Real system notification delivery / sound / click | Not tested on either native platform | E2E suppresses Windows notification submission; no Android runtime |

Browser coverage includes assembled initial book, aborted texture fallback, one time-up session with Continue and Finish controls, sound preference persistence, mobile viewport/IME contraction, reachable completion controls, and task dragging. This is mobile browser emulation, not Android performance evidence. The implementation document's before/after throttled timings were not independently remeasured, and physical mobile cold-start smoothness remains unverified.

Independent runtime probes also cover muted foreground arrival, pause cancellation payload, deadline shift after resume, no post-deadline accrual, overnight waiting, explicit-only extension, and reload retaining time-up without recording. Existing recovery tests exercise unversioned conservative recovery and storage failures. No participant or upgrade acceptance is inferred.

## Windows isolation and native evidence

The supplied unpacked host was copied from `D:/code/now-what-to-do/dist/native-preview-1.4.2/windows/webview2-unpacked` to this worktree's ignored `.cache/native-audit`. Exactly one same-length UTF-16 constant was changed in the **test copy only**: `io.github.taouyh.nowwhat` → `io.github.audit1.nowwhat`. This avoids F2 without altering reminder control flow or product source. It does mean the native run is an instrumented-identity host test, not a byte-identical installer acceptance test. The committed native probe refuses an unisolated executable.

- Original host SHA-256: `00CCA6029C72C586C39326979C11F5CF006285A330A8ABE9F7843A00622ED566`.
- Isolated host SHA-256: `48DF657CFE6B196D9B81E4BC4891C94298E1CBBA45FB452F511E94D50403AE6F`.
- Supplied native web bundle and independently rebuilt `dist/web/app.js` both SHA-256: `51DB8BD667C54D697961CE906D9B8E409C3556275EB05EDB8CA51CAA99AC31A6`.
- Supplied Android APK SHA-256 (identified only, not executed): `E836244C52CBC3F1BC9CE14206884A697351B382E67EA1A8BC116940D9270DE1`.
- Runtime observed: WebView2 `157.0.4341.42`.
- Native smoke profile: `test-artifacts/book-native-yM8RbL` — native origin and bridge, real file export to synthetic directory, pause, exit/reopen recovery, one completion.
- Reminder profile: `test-artifacts/reminder-native-nbVidj` — injected a synthetic running round; delivered actual `WM_ACTIVATE/WA_INACTIVE` to the isolated process; received a native schedule JSON with `sound:false`, `background:true`, key `audit-native-round:600000`; waited for real time-up; delivered `WM_APP+41`; verified Continue/Finish visible and explicit Finish created exactly one record.

`WM_APP+41` verifies the host's activation-handler branch, **not** Windows protocol registration, clicking an actual toast, or OS cold-launch activation. The process was closed after testing. User application's existing process/profile was not operated. An initial native reminder probe could not locate the transparent test window through `MainWindowHandle`; it was corrected to enumerate windows by the isolated PID and then passed. This was a test-harness issue, not counted as a product failure.

Local raw logs are ignored under `.cache`: `browser-tests.log`, `native-probe.log`, and `independent-probes.json`. Reproduction sources are committed alongside this report. Run from repository root:

```powershell
node docs/deployment/startup-reminders-1.4.2-2026-11-11/independent-probes.cjs
# After preparing the isolated executable copy described above:
node docs/deployment/startup-reminders-1.4.2-2026-11-11/independent-native.cjs
```

## Initial review's remaining release gates

Fix and retest F1–F3 on a new fixed commit. On actual native platforms, verify permission denial/grant, exact-alarm fallback, background/locked/closed delivery, foreground/background boundary races, sound/vibration combinations, notification activation to the existing session, pause/cancel, reboot and overnight reopen without replay. Verify actual Windows toast identity/protocol registration and installation/upgrade behavior. Keep these device/OS gates explicitly incomplete until observed.

A preliminary concern that ordinary Windows time-up synchronization always deletes the pending toast was **not confirmed**: the same-round deadline and payload signature normally stay unchanged across arrival, and the signature guard returns first. It is not listed as a finding.
