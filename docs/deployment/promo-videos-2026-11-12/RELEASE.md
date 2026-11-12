# Published demos and native 1.4.3 release

Completed 2026-11-12, Asia/Shanghai. The user first authorized README, promotional videos and push; then explicitly requested publishing the accepted Windows installer and latest Android installer.

## Public delivery

- Promotional page: https://taouyh.github.io/now-what-to-do/about/
- English README: https://github.com/Taouyh/now-what-to-do/blob/master/README.md
- Native release: https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.3
- Windows: https://github.com/Taouyh/now-what-to-do/releases/download/v1.4.3/Now-What-1.4.3-Windows-x64-Setup.exe
- Android: https://github.com/Taouyh/now-what-to-do/releases/download/v1.4.3/Now-What-1.4.3-Android-build10.apk

The main promotional player is the existing 59-second Desktop demo (16:9); the following player is the latest Android build 10 demo (9:16, maximum 360 CSS px wide). Both original files and covers are unchanged. English, Chinese and Japanese descriptions and README links are updated.

## Source and deployment

Final website/download-copy source: fedfb1501a9a7b1694baaf4ccbd37db9c77b34cb, with independent report in deployed commit 8fb8e6dcd0140fb9ec96977ad085e73e2555a531. GitHub default branch and Pages workflow remain master.

- Initial video deployment succeeded: https://github.com/Taouyh/now-what-to-do/actions/runs/43222620967
- Final download-copy deployment succeeded: https://github.com/Taouyh/now-what-to-do/actions/runs/43223427817
- Live release.json reports web application version 1.4.1 and deployed commit 8fb8e6dcd0140fb9ec96977ad085e73e2555a531.
- Native v1.4.3 source tag points to 900cc3a (completed native delivery). No application branch was merged into master. Windows and Android executable source commits are recorded in NATIVE-RELEASE.md and the GitHub release.
- Subsequent documentation-only commits do not change the deployed payload.

## Verification

Independent fixed-commit verification and the subsequent native-download-copy verification both passed; see INDEPENDENT-TEST.md. Figma synchronization of six translated desktop/mobile frames and native download copy passed; see FIGMA-SYNC.md for editable links and fidelity limits.

Fresh browser checks on the actual public site verified both films playing, seeking to 40 seconds and continuing, correct dimensions/duration, decoded posters, nine language/viewport layouts without overflow and no page errors. After the native-copy update, six desktop/mobile language combinations verified 1.4.3 download labels and release-note destinations. All three public README files matched their Git blobs.

Full public downloads of both MP4 files and both covers have the same SHA-256 as the approved source files. Both native installers and SHA256SUMS.txt were fully downloaded from the public Release; file sizes and SHA-256 match the local verified artifacts and GitHub asset digests. GitHub latest Release resolves to v1.4.3, published (not draft or prerelease). See published-evidence.json.

The web runtime script and stylesheet match the preceding live 1.4.1 deployment byte for byte; local HTML differs only in Windows/Linux line endings. App functionality and data storage were not modified by this publication work. User-owned untracked docs/weekly and nowwhat-video remain untouched.

## Limits and rollback

Windows is the user-accepted 1.4.3 installer. Android build 10 has independent package/signing/settings checks, but physical OS notification, screen-off sound and in-place upgrade acceptance remain pending. Neither the web tests nor the APK-derived video proves physical-device acceptance.

Retain previous releases and backups. Revert scoped website commits through a new reviewed commit if necessary. Do not force an Android downgrade by uninstalling or clearing data; prefer a corrected higher build. No history was rewritten.
