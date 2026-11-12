# Android 1.4.3 build 10

The user accepted Windows 1.4.3 and requested only removal of the Android vibration setting. No Windows rebuild or publication.

- Source: `7ff2aa77228fc19d338615f4e1843361ca4c20fd`.
- APK: `D:/code/now-what-to-do/dist/android-no-vibration-2026-11-12/Now-What-1.4.3-Android-build10.apk`.
- VersionName 1.4.3, versionCode **10**; 12,106,044 bytes.
- SHA-256: `EB678BBE9E59BE849342F6769873845C07315A1D51A2F9D6E11CBA8B869F9A89`.
- Signing certificate SHA-256: `08D941113E6B6CDE7147CBBD7EEE37345B0D36C477C8472707DB2B9AEF4B4A15`, unchanged; v2/v3 signing verification passed.

The vibration row and its empty preferences section no longer appear in Android settings. Automatic sound reminders, deadline-based screen-off behavior, user data and backup compatibility remain unchanged. This is a settings-control removal, not a change to saved notification-channel behavior.

The accepted Windows installer remains byte-identical: SHA-256 `82F3579826BADAA578B8A241019F4002F2B2B27525B6DBE28E1A735807232B6C`. Package name, signing key and storage origin are unchanged, with a higher Android build number for normal upgrade installation.

Android build, TypeScript/Vite and signing checks passed. The existing isolated GPT testing window verified the actual APK adapter and settings in three languages and both themes; targeted settings checks, 9 reminder regressions and 3 startup/reminder browser checks passed. The corresponding Android vibration controls were removed from Figma. See [independent verification](INDEPENDENT-TEST.md) for package comparison and design-sync evidence. No physical-device upgrade acceptance is inferred from these checks. No push, merge, website or GitHub Release change.
