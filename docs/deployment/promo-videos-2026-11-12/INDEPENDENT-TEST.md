# Independent promotional-video verification

Result: **PASS** for the scoped README, promotional-page and existing-media update. No product changes were made during verification.

Date: 2026-11-12, Asia/Shanghai. Separate GPT chat and isolated worktree: `C:/Users/fengcai/.codex/worktrees/655e/now-what-to-do`.

- Fixed tested commit: `e0e266a043d118f1ba1c942f930dfb23bede51ab`.
- Comparison baseline (`origin/master` at verification): `fe1f5f9fbf07518f562d76a9b4549eeb7ea32991`.
- Node: 24.18.0. Browser: Edge 157.0.4341.46, launched headless through Playwright with new nonpersistent contexts. No personal browser profile or real application data was used.
- Dependencies were reused through a local `node_modules` junction to `D:/code/now-what-to-do/node_modules`; no dependency install or source mutation was performed there. All generated output and supplemental test code stayed in this worktree's ignored directories.

## Scope and version

The complete baseline-to-candidate diff contains exactly 12 files: the three READMEs; `about/about.css`, `about/about.js`, `about/index.html`; two MP4 files and their PNG posters under `about/assets`; `IMPLEMENTATION.md`; and `tests/promo-videos.cjs`. `git diff --check` passed. Application sources, native packaging, package version, lockfile and release workflow are unchanged. No APK, EXE, new release tag or unpublished 1.4.3 application code is included. The Android media filename describes the existing source film, not an installer publication.

The locally assembled `dist/site/release.json` reports version `1.4.1` and the exact tested commit. All three README installer links still target `v1.4.1`; page download links still point to `https://github.com/Taouyh/now-what-to-do/releases`. Page copy in all three languages retains 1.4.1, without a visible 1.4.3 release claim.

Read-only public checks during verification found GitHub's latest release at [v1.4.1](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.1), with only `Now-What-1.4.1-Android.apk`, `Now-What-1.4.1-Windows-x64-Setup.exe` and `SHA256SUMS.txt`. The [live release manifest](https://taouyh.github.io/now-what-to-do/release.json) still reports `1.4.1`, source `aea1f98893bf4dc862c5126bccd94ed225af5338`. These are pre-publication observations; this test did not publish the candidate.

## Media integrity

All four delivered media files match the original files listed in `IMPLEMENTATION.md` byte for byte by SHA-256. The source posters are `poster.png` in each corresponding source `out` directory.

| File under `about/assets` | SHA-256 |
| --- | --- |
| `desktop-demo-2026-11.mp4` | `54912CA9AAD19DD8865B40AA212D032127144F8EDC83D559998D01C9CF1D151F` |
| `android-demo-1.4.3-build10.mp4` | `47AC10A30B55B6CCA82B8F52BA7F91B62321A4C1961BF939D9A086B0714C371D` |
| `desktop-demo-2026-11.png` | `178894C8031050C2CC9572801692072B7682139AEA3029D6153F10AD0DA2D9AD` |
| `android-demo-1.4.3-build10.png` | `C4E09567E76269EB8E79BCD48DF5B7BF8C132057DAEC50E53E301C7AD12EA3C3` |

`ffprobe` reports H.264 video plus AAC audio, each 59.000 seconds: desktop 1920 x 1080, Android 1080 x 1920. Both files passed complete audio/video decode using `ffmpeg -v error -i <file> -f null -`, exit 0 with no decode errors. Both posters decode at the corresponding original video dimensions. Visual inspection of the posters and extracted 30-second frames confirmed the intended desktop/portrait UI and legible English/Chinese burned-in captions.

## Executed checks

- `npm test`: all 144 tests passed, zero failed or skipped.
- `npm run build:web`: typecheck, Vite build and 270-file web assembly passed.
- `node scripts/assemble-site.cjs`: passed.
- `node tests/promo-videos.cjs`: passed all 21 language/viewport combinations (320, 360, 390, 700, 768, 1024, 1531 CSS px), language-menu behavior and keyboard access, initial English behavior, download destinations, synthetic storage preservation, local asset responses, posters and two actual browser video playbacks; no page errors.
- Independent supplemental script `.cache/independent-promo/supplement.cjs`: passed 21 additional language/viewport combinations (320, 360, 390, 700, 768, 1024, 1440 CSS px). Both players preserve 16:9 and 9:16 respectively in every combination, without page overflow. Android player width is 360 px at larger widths, then 350 / 320 / 280 px for the 390 / 360 / 320 px viewports. Both retain native controls, inline playback, no autoplay and `preload="none"`.
- Supplemental real playback and seeks passed for each video at 30 and 57 seconds. Each `seeked` event completed, the decoded frame matched the requested time, playback resumed with increasing time and decoded-frame counts, and `video.error` remained null. Final samples: desktop 30.428 / 57.424 seconds; Android 30.416 / 57.421 seconds.
- Read the three-language copy and inspected desktop/mobile screenshots. Desktop demo precedes Android demo; localized headings, duration/caption descriptions, save links and existing page content are present. Full-page captures were refreshed after scrolling the lazy journal image into view and waiting for image decoding.
- Checked all README local file/image references and explicit internal navigation anchors, and both newly linked promotional-page anchors against the assembled page. The 36 / 36 / 34 extracted references in English / Chinese / Japanese passed the applicable local/anchor/version checks. Stale 86-second/no-narration descriptions are removed. MP4 fallback and save targets refer to the intended local files. Unchanged external destinations were reviewed, not exhaustively crawled.

Local evidence: `.cache/promo-videos-test/result.json` and screenshots; `.cache/independent-promo/npm-test.log`, `build.log`, `supplement-result.json`, `supplement.cjs`, six full-page screenshots, seek screenshots and extracted 30-second frames. These generated files are intentionally not included in the report commit.

## Boundaries and handoff

This is local website/media validation in Edge, including emulated narrow/touch layouts. It is not Android-device, Windows-native, installer, upgrade, notification or participant acceptance. Audio streams were fully decoded and preserved by hash; a complete listening/editorial review was not performed. Native media controls can temporarily overlay burned-in captions while visible. Figma synchronization and post-deployment live-media hashes/playback remain separate delivery checks.

Only this report is committed by the independent reviewer. No push, merge, release upload or deployment was performed. The parent delivery can use this PASS for the exact fixed commit and should verify the deployed candidate after publication.

## Addendum: authorized native 1.4.3 download publication

**PASS** for the focused follow-up at fixed commit `fedfb1501a9a7b1694baaf4ccbd37db9c77b34cb`, on 2026-11-12 (Asia/Shanghai). The user additionally authorized publishing the existing accepted Windows installer and latest Android build 10 installer. This supersedes the earlier download-version restriction in this report; the earlier findings remain evidence for their original fixed commit.

Compared with `e0e266a043d118f1ba1c942f930dfb23bede51ab`, the only changes are the three README download rows, promotional hero/download/release-note copy in `about/about.js` and `about/index.html`, this pre-existing report, and `NATIVE-RELEASE.md`. No application source, native packaging, package/lockfile, CSS, media or build workflow changed. `git diff --check` passed. The web code/package remains 1.4.1; site reassembly reports version `1.4.1` and source `fedfb1501a9a7b1694baaf4ccbd37db9c77b34cb`. No native application branch was merged here.

Read the existing independent reports from `D:/code/now-what-to-do/docs/deployment/native-review-1.4.3-2026-11-12/INDEPENDENT-TEST.md` and `android-no-vibration-2026-11-12/INDEPENDENT-TEST.md`. Rehashed the actual existing installers without rebuilding or installing them:

| Existing file under `D:/code/now-what-to-do/dist/` | Bytes | Rounded MiB | SHA-256 |
| --- | ---: | ---: | --- |
| `native-review-1.4.3-2026-11-12/final/windows/Now-What-1.4.3-Windows-x64-Setup.exe` | 13,910,587 | 13.3 | `82F3579826BADAA578B8A241019F4002F2B2B27525B6DBE28E1A735807232B6C` |
| `android-no-vibration-2026-11-12/Now-What-1.4.3-Android-build10.apk` | 12,106,044 | 11.5 | `EB678BBE9E59BE849342F6769873845C07315A1D51A2F9D6E11CBA8B869F9A89` |

Both match their respective final independent reports exactly. The superseded build 9 APK hash was not substituted for build 10. Planned Release tag target `900cc3a5d5bed60be5d69414c00322da624b6852` resolves locally, includes both independent reports, and descends from Android source `7ff2aa77228fc19d338615f4e1843361ca4c20fd`. Windows executable source remains the separately verified `a6e9c9e8f73f132c86674e105c658fb1643e042f`, as disclosed in `NATIVE-RELEASE.md`; this is a combined artifact release, not a claim that both binaries were rebuilt from the tag.

Focused probe `.cache/independent-promo/native-copy.cjs` passed:

- All three READMEs contain exactly the intended two `/releases/download/v1.4.3/` installer URLs, filenames and 13.3 / 11.5 MiB sizes.
- Six fresh-context Edge cases: English, Chinese and Japanese at 1440 and 390 CSS px. The hero has no shared version label; the native download section and both platform descriptions show 1.4.3; release notes target `/releases/tag/v1.4.3`; the main and platform download links still lead to the Releases listing.
- No horizontal overflow or page errors. Download-section screenshots were captured; desktop English and mobile Chinese/Japanese were visually inspected. Local result: `.cache/independent-promo/native-copy-result.json`.

The public GitHub API endpoint for `releases/tags/v1.4.3` returned 404 during this check, consistent with the parent's release upload/publication still in progress. Public tag/asset digests and actual download availability therefore remain **pending post-publication verification**, not a source-validation failure. No claim of successful public publication is made here.

The original media decode and broader application suites were not repeated because their bytes/source are unchanged. Existing native report results are relied on by exact artifact identity; this addendum does not add physical-device, notification, OS sound, upgrade or participant acceptance. Only this report is appended and committed; no push, merge or release action is performed by this reviewer.
