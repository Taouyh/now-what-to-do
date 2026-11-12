# Android 1.4.3 build 10 — remove the vibration setting

The user accepted Windows 1.4.3 and requested removing the additional vibration control from Android settings, then rebuilding the APK. Windows binaries and desktop/web sources remain unchanged. No push or publication.

Removed Android's `supportsVibration` UI opt-in. Existing runtime capability checks now omit the vibration row and its empty preferences section, as on web/Windows. The automatic deadline sound and screen-off fix are unchanged. This request removes the settings control; existing stored reminder values and backup compatibility are retained, and notification behavior is not silently rewritten. Old independent evidence that expected an Android vibration row describes build 9, not this revision.

Android versionName remains 1.4.3 and versionCode increases from 9 to 10 for an identifiable in-place upgrade. The package and signing identity are unchanged. The delivery filename includes build10. The accepted Windows installer remains the exact artifact recorded in ../native-review-1.4.3-2026-11-12/RELEASE.md.

Build: `npm.cmd run build:android -- -OutputDirectory dist/android-no-vibration-2026-11-12`; rename the resulting APK to `Now-What-1.4.3-Android-build10.apk`. Independent verification uses the existing isolated testing chat/worktree, the fixed commit and actual APK adapter rather than a mock advertising the removed capability.
