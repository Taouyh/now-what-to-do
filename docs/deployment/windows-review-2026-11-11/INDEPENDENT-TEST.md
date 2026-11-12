# Windows 1.4.2 independent package verification

2026-11-11, Asia/Shanghai. **PASS within the scope below; no product defect found.** The actual review installer installs successfully into a fresh isolated directory. Its installed payload matches the accompanying unpacked package byte for byte. Its web implementation matches fixed source `9559eda4ac783767d127af2f9daac0135cdb2d4d`, with the documented text line-ending qualification. The installed application has no Sound option in English, Chinese or Japanese.

## Scope and isolation

This separate GPT chat used `C:/Users/fengcai/.codex/worktrees/abfc/now-what-to-do`, checked out detached at the fixed commit above. Read the deployment guide, development rules, native release context, and `../always-sound-2026-11-11/IMPLEMENTATION.md` and `VERIFICATION.md`. Dependencies were reused through a `node_modules` junction to `D:/code/now-what-to-do/node_modules`; no dependency installation or application source edit was made. Only this report is committed. No push, merge, Android change/test, Figma access or publication occurred.

Before installation, reviewed `packaging/windows-webview2.nsi`: `NOWWHAT_INSTALL_TEST=1` skips the installer registration, uninstall registration, `nowwhat` protocol registration, Desktop shortcut and Start Menu shortcut writes. The installed host's `--check-runtime` prerequisite was checked first and returned 0, so the runtime bootstrapper was not needed. `desktop/webview2/main.cpp` and `reminder.h` confirm that `NOWWHAT_E2E=1` with an explicit profile keeps application data isolated and skips real toast registration, scheduling and cancellation. All native launches used that mode.

## Actual artifact and installation

Artifact: `D:/code/now-what-to-do/dist/windows-review-2026-11-11/Now-What-1.4.2-Windows-x64-Setup.exe`.

| Item | Result |
| --- | --- |
| Installer size | 13,714,061 bytes |
| Installer SHA-256 | `E793C31E5279DF4A0B94CD3ABE3C895B930F44C44C370A8ED847E79799616BF8` |
| Installer / installed host version | 1.4.2 / 1.4.2 |
| Silent installation | Exit 0 using `/S /D=<fresh-directory>` and `NOWWHAT_INSTALL_TEST=1` |
| Installed host SHA-256 | `DDBCE0214B011E27182ADABBD3447A90B663984FF1F044A99A55AED9B5376E5D` |
| Installed native bridge SHA-256 | `79156994CCCCC4A14EEC900850AAFAAF090A665A70B9D0990798211823169639` |

Fresh destination: `C:/Users/fengcai/.codex/worktrees/abfc/now-what-to-do/.tmp/windows-install-f9b01daf29184ad1a9f0728a424a6d09`. The installer was launched hidden with `Start-Process -Wait`; no interactive installation into the user's normal location was performed.

Snapshots before installation, immediately after installation and after both native runs show the three relevant HKCU registry trees and the two real `Now What.lnk` shortcuts unchanged, including shortcut hashes and modification times. The final comparison parsed JSON objects rather than comparing serialization order. The installer hash was also rechecked unchanged at the end. User application data was neither inspected nor used.

## Fixed-source and package content comparison

`npm run build:web` passed independently, including TypeScript checking. The ordinary worktree checkout uses CRLF for tracked text (`git ls-files --eol` reports index LF / worktree CRLF). Initial strict comparisons correctly detected those byte differences; they were not treated as product content differences without further inspection.

For a canonical source comparison, exported the fixed commit with `git -c core.autocrlf=false archive --format=zip`, extracted it into `.tmp/windows-review-fixed-lf`, attached the same dependency junction and ran `npm run build:web` there. The archive/build is local test evidence only; no tracked file was rewritten. An initial archive without the explicit Git option inherited CRLF, so the explicit LF export is the comparison reported here.

- Both canonical build and package contain exactly **271 web files**, with identical relative paths.
- **268 files are byte-identical**, including `app.js`, `style.css`, images, SVGs and font binaries.
- Package `index.html` is 16,896 bytes versus 16,819 in the LF build; package `assets/fonts/fonts.css` is 211,974 bytes versus 209,888. Both are **exactly equal after CRLF-to-LF normalization**, with no other text differences.
- `manifest.json` lists the same 270 payload paths (it excludes itself). Each recorded byte count was checked against its own file tree; its differences reflect the two line-ending-dependent sizes. Thus an all-files byte-identical source-build claim would be inaccurate, while implementation/content equivalence is verified.
- All **271 installed web files exactly match** the unpacked package by path, size and SHA-256.
- All **275 unpacked payload files exactly match** the installed files. The installation adds only the expected `LICENSE` and `Uninstall.exe` (277 installed files total). The bridge and repository license also match fixed-source text after line-ending normalization.

All three builds/payloads share `app.js` SHA-256 `37EC495A4DBCD21BCEB75D764F514A100D75A76246B5B1CB1682D3036D62F8C7` (122,440 bytes). The native EXE was compared between unpacked and installed payloads; an independent C++ rebuild or reproducible-EXE claim is outside this test.

## Installed application checks

Ran the unmodified repository test with `NOWWHAT_NATIVE_DIR` set to the fresh installation:

```powershell
$env:NOWWHAT_NATIVE_DIR='<fresh-directory>'
node tests/native-book-smoke.cjs
```

**PASS, process exit 0**, WebView2 `157.0.4341.42`, synthetic profile `test-artifacts/book-native-30EQDY`. Verified the `https://nowwhat.local` origin, no Node `require`/`process` exposure, native default English, assembled book DOM, loaded image/font assets, actual native backup export into the test directory, pause/close, reopen recovery and exactly one completion retaining its completion ID.

A separate focused installed-host probe used fresh profile `test-artifacts/book-native-PaAs22` and the same real installed executable and native bridge:

| Check | Result |
| --- | --- |
| English / Chinese / Japanese settings | `#reminderSound` absent in all three; reminder preferences and vibration row hidden |
| Settings footer | Only `No data sync`, `数据不同步`, or `データ同期なし`; no sound label or empty visible preference control |
| Import synthetic version-2 backup with `sound:false` | Import/confirmation succeeded and the legacy stored preference remained false |
| Start imported task | Forwarded native reminder payload requests `sound:true` despite the legacy mute value |
| Simulated foreground deadline | Exactly three oscillator starts, representing one chord |
| Background/resume after consumed deadline | Zero additional oscillator starts; elapsed remains 600,000 ms and `reminderConsumed:true` |

The focused probe wrapped `nativeApp.syncReminder` to observe and forward actual bridge messages, instrumented `AudioContext` to avoid audible output, and used a simulated clock plus lifecycle callback for the deadline. This establishes application requests and one-shot consumption, not physical speaker playback or real OS notification delivery.

Also reran `node --test tests/reminders.test.cjs`: **9/9 PASS**, covering one-shot sound despite legacy mute, reminder consumption, pause/resume scheduling, simulated background/sleep/close continuation, and permission ordering. This window did not rerun the full Node or browser suite; earlier reports are separate evidence.

Local reproducibility/evidence helpers are retained under `.cache/windows-review/`: `install.ps1`, `artifact.json`, `install-result.json`, integration snapshots, `compare.cjs`, `comparison.json`, `make-focused-probe.cjs`, `focused-native.cjs` and `focused-result.json`. They are ignored test artifacts and are not part of this single-file report commit. The native smoke script remains the tracked, unmodified repository test.

## Limits

No actual Windows toast, notification tap/protocol activation, physical sleep/lock, volume/DND behavior, interactive Save As dialog, visible native screenshot acceptance, installer upgrade, uninstallation or missing-runtime bootstrap was tested. The host's E2E window is transparent; DOM checks are not native visual acceptance. No Android/device or participant acceptance is inferred. This report verifies the requested local Windows review package against the fixed web implementation; it does not verify the state of a live website or authorize publication.
