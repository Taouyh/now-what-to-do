# Native 1.4.1 local review candidate

User authorized Windows and Android package updates and independent testing in a new worktree on 2026-11-09. Local commits only. No push, publication or master merge. User acceptance of the installers remains required.

## Scope

Packages include the verified web candidate through `debf26c`: pinning, persistent drag ordering within pinned/unpinned groups, cross-page and keyboard ordering, default expanded activity descriptions, paper-slip continuation notes, matching controls, import layout fixes, and prior mobile pagination/keyboard/viewport adjustments. Existing native hosts and data origins are retained. No new visual change was introduced for packaging; the verified Figma synchronization remains in `../web-drag-2026-11-09/FIGMA-SYNC.md`.

Version is 1.4.1; Android versionCode increases from 6 to 7. Android package ID and original signing identity are retained. Backup schema stays version 2 with optional pinned/taskOrder fields and compatibility for old backups.

## Validation and artifacts

Pending build and independent fixed-commit verification. Candidates will be written under `dist/native-preview-1.4.1/`, preserving old installers. Native Windows install/run, synthetic upgrade/data persistence, package contents and Android signatures will be checked where supported. Browser tests do not establish physical Android device or keyboard acceptance.

## User acceptance and rollback

Export a backup from the existing application before personal upgrade testing. Install the candidate over the existing app; do not uninstall or clear app data. Check task order, records, backup import/export, timer controls and language/theme. Android also needs physical-device touch, keyboard, rotation and small-screen checks.

Old 1.4.0 installers remain in `dist/windows/` and `dist/android/`; previous Android previews remain intact. Windows can reinstall the older package while retaining its profile. Android versionCode 7 cannot normally be downgraded to 6 in place; prefer a corrected higher-code candidate. If uninstall/reinstall is necessary, export first because Android uninstall removes app data, then restore a backup compatible with the installed version. No automatic rollback or user data mutation is performed.
