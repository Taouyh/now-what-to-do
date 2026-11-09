# Native 1.4.1 local review candidate

User authorized Windows and Android package updates and independent testing in a new worktree on 2026-11-09. Local commits only. No push, publication or master merge. User acceptance of the installers remains required.

## Scope

Packages include the verified web candidate through `debf26c`: pinning, persistent drag ordering within pinned/unpinned groups, cross-page and keyboard ordering, default expanded activity descriptions, paper-slip continuation notes, matching controls, import layout fixes, and prior mobile pagination/keyboard/viewport adjustments. Existing native hosts and data origins are retained. No new visual change was introduced for packaging; the verified Figma synchronization remains in `../web-drag-2026-11-09/FIGMA-SYNC.md`.

Version is 1.4.1; Android versionCode increases from 6 to 7. Android package ID and original signing identity are retained. Backup schema stays version 2 with optional pinned/taskOrder fields and compatibility for old backups.

## Validation and artifacts

Both packages built successfully from `39d64f18bb6ffcf5125a05719ccbf492dcc1ce81`, including typecheck/production assembly. Candidates are under `dist/native-preview-1.4.1/`, preserving old installers. See [artifact manifest](artifacts.json) for exact paths, sizes and hashes. Independent fixed-commit verification passed within the scope recorded below. Native Windows install/run, synthetic upgrade/data persistence, package contents and Android signatures passed. Browser tests do not establish physical Android device or keyboard acceptance.

## User acceptance and rollback

Export a backup from the existing application before personal upgrade testing. Install the candidate over the existing app; do not uninstall or clear app data. Check task order, records, backup import/export, timer controls and language/theme. Android also needs physical-device touch, keyboard, rotation and small-screen checks.

Old 1.4.0 installers remain in `dist/windows/` and `dist/android/`; previous Android previews remain intact. Windows can reinstall the older package while retaining its profile. Android versionCode 7 cannot normally be downgraded to 6 in place; prefer a corrected higher-code candidate. If uninstall/reinstall is necessary, export first because Android uninstall removes app data, then restore a backup compatible with the installed version. No automatic rollback or user data mutation is performed.

## Package identity

Android v2/v3 signatures verify with the original certificate (`08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15`), package `io.github.taouyh.nowwhat`, versionName 1.4.1 and versionCode 7. Windows installer and host version metadata are 1.4.1; the installer is unsigned, as with the prior release. The WebView2 bootstrapper signature was verified by the build script.

Build logs: `.cache/native-141-windows-build.log` and `.cache/native-141-android-build.log`. Old public Windows/Android and prior entry-preview APK hashes were verified unchanged.

## Independent result and delivery

New GPT worktree `C:/Users/fengcai/.codex/worktrees/20a3/now-what-to-do` verified the exact installer hashes against fixed source `39d64f1`. [Independent report](INDEPENDENT-TEST.md), original commit `c07217ac77d0577e45a628b1a979f340a8eb6d7f`, records: independent production build, 144 Node tests, 14 browser tests, six language/theme visual scenarios, actual Windows install/1.4.0 upgrade/pointer ordering/export/import/restart/uninstall preservation/fresh-profile recovery, and Android signature/alignment/manifest/content checks. No product correction was required.

Windows native tests used the actual transparent E2E host with DOM/input/storage assertions; visual screenshots are browser captures of the same build, not native visual captures. Save As and registry/shortcut changes were bypassed by isolation switches. No Android device/emulator was available, so Android execution, upgrade, touch, IME and rotation remain user acceptance items.

Delivered local candidates: Windows x64 installer and Android APK, both 1.4.1. User should export a backup and personally test before authorizing any push. Old installer hashes are unchanged; master remains `322527c44a9d1c0d3709040ee20f879ef2eafa10`. No push, publication or master merge was performed.
