# Book edition 1.4.0 release

User authorized deployment, GitHub default-branch restoration, website refresh, README updates, and Android/Windows packages on 2026-11-07. Final publication details will be appended after independent fixed-commit verification.

## Candidate

- Source base: `ef6665e`, incorporating the existing book UI and compact-navigation independent acceptance.
- New English introduction at `about/`, based on editable Figma frame [360:4380](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=360-4380). Account handle `3966592487` verified before design access. Original product designs preserved; the poster uses editable copied product layers, text and auto-layout.
- Actual synthetic-data app captures and the latest 77.013-second English Remotion demo. No guiding lines or voiceover. Soft original music and click sounds. App packages do not include marketing media.
- Three READMEs point to the book edition and new demo. Site is English as requested; app still supports three languages.
- `master` will drive the Pages build workflow. Publishing compiled files is necessary because the source HTML loads TypeScript. Existing site URLs and data origins remain unchanged.

## Size and package checks

The existing native hosts were retained: C++/Win32 with shared Evergreen WebView2 and NSIS on Windows; system WebView with aapt2/D8/apksigner on Android. No Electron/browser runtime is bundled. See [Microsoft distribution guidance](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution) and [GitHub Pages workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Six source textures total 11,848,423 bytes as PNG and 7,838,300 bytes as lossless WebP, saving 4,010,123 bytes (33.8%). Every decoded RGBA pixel matched. Original design PNGs remain in source; production excludes those duplicates and the JS source map. Font coverage remains intact. Compression reduces disk/transfer size, not decoded image memory. In one Windows 11/WebView2 156 isolated-profile idle sample, the host plus six WebView2 processes used 281.7 MiB private bytes; summed working sets were 446.9 MiB and may double-count shared pages. The sample includes a debugging connection and is not a RAM guarantee or comparison against the earlier plain UI. Android RAM was not measured.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Windows x64 installer | 19,496,259 | `6B08CEA74B138C4806C5B788EF98790681D43EB1CE3FC5492AB0C2EFD2EFCF00` |
| Android APK | 19,056,386 | `3A3FB094F21B6AD81DE34F4670F00E73A0AE1E393E6C9868D46430D3F3F0FF85` |

Android package `io.github.taouyh.nowwhat`, versionCode 6, versionName 1.4.0, minSdk 24, targetSdk 35. Signing certificate SHA-256 `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15`; existing signing identity reused, private material excluded from Git.

## Developer verification

- TypeScript and production build passed. Node core tests: 140/140 passed.
- Initial full browser run: 55 passed, 31 failed because old assertions expected a removed calendar `<small>` label and the previous secondary button colors. Tests were corrected against the already approved compact UI, retaining name bounds, full line height, long-name scrolling, paging and focus-description checks. No app layout was changed to satisfy the tests. Targeted rerun: 31/31 passed.
- Introduction: isolated Edge at 1440 and 390 pixels, no horizontal overflow or request/page errors; all screenshots and local font loaded; video metadata 77.013 seconds. Screenshot inspection passed.
- Real Windows installer: temporary path containing spaces; every installed manifest file matches the payload. Native isolated profile: English default, offline assets/fonts, export, pause/close/reopen recovery and exactly one completion passed. Uninstaller preserves unrelated files and does not touch app profiles.
- Android APK built and signature verified. No real phone, emulator or in-place Android upgrade is claimed.

## Compatibility and rollback

No storage schema, package name, native profile location or web origin changed. Preserve user records. Export a backup before update; do not uninstall Android first. Windows 1.0 needs manual export/restore. Android downgrades normally require uninstalling and therefore risk local data loss; export first.

Keep prior GitHub releases available. Web rollback is a reviewed earlier source deployed through the master workflow; do not reset history or clear browser data. Only tracked release files are committed. Pre-existing `docs/weekly/` and `nowwhat-video/` work remain untouched.

Independent test and Figma synchronization reports are required before final publication; pending at this candidate commit.
