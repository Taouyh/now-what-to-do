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
