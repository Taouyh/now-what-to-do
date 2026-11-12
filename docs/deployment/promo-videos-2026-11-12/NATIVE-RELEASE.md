# Native 1.4.3 publication

On 2026-11-12 the user additionally requested uploading the accepted Windows installer and latest Android installer to GitHub Release. This explicitly supersedes the earlier local-only publication restrictions for these artifacts.

Release: v1.4.3. Source tag: 900cc3a, the completed Android build 10 delivery; Android executable source 7ff2aa77228fc19d338615f4e1843361ca4c20fd; Windows executable source a6e9c9e8f73f132c86674e105c658fb1643e042f. Publish this source tag without merging the application branch into master. The web application remains the published 1.4.1 code; only marketing/download copy and links change on master.

Exact existing artifacts (no rebuild):
- Now-What-1.4.3-Windows-x64-Setup.exe: 13,910,587 bytes; SHA-256 82F3579826BADAA578B8A241019F4002F2B2B27525B6DBE28E1A735807232B6C.
- Now-What-1.4.3-Android-build10.apk: 12,106,044 bytes; SHA-256 EB678BBE9E59BE849342F6769873845C07315A1D51A2F9D6E11CBA8B869F9A89.

Windows was accepted by the user. Existing independent testing passed the actual Windows installer/payload/native smoke, 153 unit tests and 110 browser tests. Android build 10 has its own independent signature/package/settings/reminder verification. Reports are preserved in the source tag under docs/deployment/native-review-1.4.3-2026-11-12 and android-no-vibration-2026-11-12. These checks do not establish physical Android notification, OS sound, lock-screen or upgrade acceptance.

Create a draft Release, upload both verified binaries and SHA256SUMS.txt, verify GitHub asset digests, then publish and verify public downloads. Preserve all older releases. Before upgrading, export a backup; retain existing profiles and signing identity. Android build 10 should not be forcibly downgraded by uninstalling or clearing data; prefer a corrected higher build.

The README installer URLs and sizes, promotional download versions/release notes link, and Figma download copy are updated to 1.4.3. The hero no longer advertises one version for both the web and native apps. Historical demo/independent implementation evidence predates this additional release authorization.
