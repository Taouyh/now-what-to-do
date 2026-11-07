# Independent release verification

Date: 2026-11-07, Asia/Shanghai. Tested fixed source: **`e2c66b800d505f4328df0a0ffe256019bd7216eb`**. Tester: separate GPT chat and isolated worktree `C:\Users\fengcai\.codex\worktrees\bd77\now-what-to-do`, branch `codex/independent-release-e2c66b8`.

## Decision

**PASS for the independently tested web and supplied-package inspection scope.** Core tests 140/140, production build, full configured Playwright suite 86/86, and additional production-introduction probes pass. No observed product defect blocks the independent pre-merge web checkpoint. This does not establish native installation/upgrade acceptance, Android device acceptance, Figma synchronization, or successful public deployment.

No product code, original workspace file, real user profile, GitHub setting, branch publication, merge or release was changed by this tester. The only committed file is this English report. Initial tracked status was clean and HEAD remained the fixed source throughout execution. Read root/deployment instructions, deployment candidate, required development rules and development validation results. No earlier-stage guide or Figma account was accessed.

## Executed checks

Environment: Windows, Node 24.18.0, npm 11.16.0, Playwright 1.64.1, actual headless Microsoft Edge 156.0.4314.58. Installed this worktree's own dependencies with `npm ci --ignore-scripts`: 300 packages, successful, with deprecation notices. No node_modules junction was used.

| Check | Actual result |
| --- | --- |
| `npm test` | 140 passed, 0 failed/skipped |
| `npm run build:web` | TypeScript and Vite passed; 270 manifest entries, plus manifest.json |
| `$env:BOOK_TEST_PORT='8789'; npm run test:e2e` | All 86 configured tests passed in approximately 1.3 minutes; three workers |
| `node scripts/assemble-site.cjs` | Public app plus introduction assembled successfully; release.json identifies 1.4.0 and the fixed SHA |
| Additional introduction browser probes | Passed at 1440x1000, 390x844 and 320x568 |
| Read-only supplied-package comparison | All 270 manifest production files match Windows unpacked payload and APK, allowing the specified Android index bridge insertion |
| Android signature and metadata tools | apksigner verifies v2/v3 signatures; aapt2 confirms package/version/SDK metadata |
| PNG/WebP decoded comparison | Visible pixels and alpha unchanged; transparent RGB caveat below |

Port 8789 was unused before testing; Playwright started its own server, with reuse disabled. It served this worktree's independently built dist/web. Every test/probe used a new nonpersistent synthetic browser context. No personal browser profile or developer server on 8765/8766/8778 was used. The introduction probe used an ephemeral localhost server over dist/site, mounted at `/now-what-to-do/` to exercise the GitHub Pages project-prefix paths.

The full suite means all tests under the configured `tests/e2e` directory. Historical separately configured harnesses under tests/independent were not additionally rerun. Executed coverage includes recovery, storage protection, backup/restore, task editing, continuation, custom time, theme/language, calendar bounds/paging, keyboard behavior and feedback controls.

Local uncommitted evidence is retained under `.cache/release-independent/`: command logs, about-check.cjs, about-results.json, about-1440.png, about-390.png, about-320.png, package-check.cjs, package-results.json, texture-check.py and texture-results.json. Browser artifacts remain in test-results/playwright-report. These are isolated test outputs, not release assets.

## Introduction and corrected assertions

Visually inspected the full desktop and 390px screenshots. The page has readable ordered sections, local book screenshots, responsive columns, downloads and footer. Automated bounds also pass at 320px: document/body widths equal the viewport, with no horizontal overflow. Both images decode, the local Book font reports loaded and returns HTTP 200, and there are no observed failed requests, HTTP errors or page exceptions. Video is not requested before explicit loading; it then decodes at 1920x1080, reports 77.013 seconds, and advances during actual muted playback at all three sizes. This was a playback smoke check, not a complete audio/video editorial review.

The browser action successfully opens the compiled book app at the project-prefixed root. Source, MIT license, release-notes and both download URL targets use the expected repository and v1.4.0 filenames. The equivalent release-link checks pass for all three README files and about/index.html. External download availability was not asserted before publication.

Reviewed the exact candidate test changes against implementation. Calendar group cards intentionally contain a single name span; group counts/time remain in the overview and selected right-page caption. Removing assertions against a nonexistent small element is justified. The revised tests retain complete line-height and card bounds, exercise all 30 language/viewport combinations, real wheel scrolling when needed, long-name keyboard scrolling, right-page nonoverlap and directory paging. They do not simply suppress the failing assertion.

The End control uses the existing shared primary CSS: foreground `rgb(241, 220, 173)` and the three-stop brown gradient. Reading backgroundImage rather than backgroundColor matches that implementation. Description/status geometry and source-description preservation assertions remain. This correction verifies the approved shared style; it is not a comprehensive contrast/accessibility audit. No product layout or control behavior was changed in this candidate to make these tests pass.

Independently rebuilt primary hashes:

| File | SHA-256 |
| --- | --- |
| dist/web/app.js | `F2E57E7995BBF8B3C5267163925BDCD2D00A278AF69149F158413AD8E3CC1BBB` |
| dist/web/style.css | `F5390AB1F3DC4A16C66661D25A675D55409EA20ED668CF61B0AFC413E860176A` |
| dist/web/index.html | `168CDC9E729155D67E60D6EA7A730596CB89DDD3797F814DF29F46491524E70B` |

## Supplied native artifacts

Read artifacts from D:\code\now-what-to-do\dist without executing the installer or application. Independently calculated identities:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Now-What-1.4.0-Windows-x64-Setup.exe | 19,496,259 | `6B08CEA74B138C4806C5B788EF98790681D43EB1CE3FC5492AB0C2EFD2EFCF00` |
| Now-What-1.4.0-Android.apk | 19,056,386 | `3A3FB094F21B6AD81DE34F4670F00E73A0AE1E393E6C9868D46430D3F3F0FF85` |

Windows Authenticode reports NotSigned, matching the release notice. The supplied native host version is 1.4.0. The unpacked Windows payload has 275 files and no Electron/browser runtime payload, marketing MP4, source map or the six duplicate PNG textures. This is inspection of the supplied unpacked payload, not independent proof of installer extraction or installation: an attempted read-only extraction with the available 7za executable could not open this NSIS archive. Its failure is retained in installer-extract.log and is not counted as a package failure or successful extraction.

The APK has 279 entries, forward-slash asset paths and no signing key/metadata, node_modules, marketing video, source map or duplicate textures. Manifest entries match byte-for-byte against the paired supplied web payload, and both native bridges match the original source bytes. The independently rebuilt web set has exactly the same paths; 44 SVG/CSS/license/provenance text files differ only by CRLF/LF, with all other manifest files exact. Cross-checkout bridge bytes also differ only by CRLF/LF. An initial strict bridge comparison failed for that reason; package-check-initial.log is preserved. The final check verifies exact supplied-source pairing and separately checks only newline normalization against this checkout. It does not normalize binary differences.

apksigner verifies one RSA-3072 signer with certificate SHA-256 `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15`. Independently inspected the supplied 1.3 APK certificate and confirmed the same digest. aapt2 reports package io.github.taouyh.nowwhat, versionName 1.4.0, versionCode 6, minSdk 24 and targetSdk 35. Matching package/signature metadata supports identity continuity; no actual Android install or upgrade was performed.

No native compilation or source-to-binary reproducibility claim is made. Installer/native lifecycle tests described by the developer remain developer evidence, not results independently rerun here.

## Publishing review and observations

Reviewed `.github/workflows/pages.yml` and both assembly scripts. The workflow is guarded to master, runs npm ci with lifecycle scripts disabled, core tests and the production build, assembles dist/site, and uploads only that public directory before Pages deployment. Pages/id-token permissions and the deployment environment are configured. Locally assembled output contains 298 files, 28,670,314 bytes, including 9,326,371 bytes under about. The about copy retains unused older marketing media; native packages exclude it. No repository data, node_modules or signing files were found in the inspected public artifact. Relative application/font/image paths work under the project prefix. No workflow run, repository setting or live Pages response was independently verified.

Reviewed publish-release.ps1 without invoking it. It checks source-branch remote HEAD, tag identity, package contents and checksums, refuses an existing release and creates a draft before publication. Operationally it still requires origin/design/minimal-ui to equal the publishing HEAD, even after master integration; the publisher must satisfy that explicit gate. Its source-cleanliness path list omits src, public, Vite config and .github, and it invokes package-contents without --release. These are limitations of relying on that helper as the sole future release gate; this fixed clean candidate had separate full testing, path/content and README/about release-link inspection. No attempt was made to bypass its checks.

The first observed external SHA256SUMS.txt still listed 1.3 assets. The development window regenerated it during verification; the final read lists the two 1.4 filenames with hashes exactly matching the table above. This preparation issue is closed for the supplied artifacts. The release helper itself was not executed.

The candidate's literal claim that every decoded RGBA pixel matches is inaccurate: task-paper differs at 4,711 fully transparent RGB pixels, with identical alpha and no difference at any pixel having nonzero alpha. Composites over white, black and the dark-book background are identical. The other five textures are exact RGBA matches. This is a documentation correction, not an observed rendering regression. Independently reviewed follow-up commits 2b6250cf07e626a7798ae92d858f725932c57963 and 7c40877 from the development window: their changes comprise README/release/build documentation, provenance wording and an assembly comment; the transparent-pixel description is corrected in 7c40877. Executed tests remain attributed to e2c66b8. The developer's additional RAM sample was not independently measured here.

## Remaining boundaries

There are no remaining observed publication blockers in the executed web/package scope. The publisher still owns the actual master integration, source/tag/artifact alignment, Figma synchronization checkpoint, release upload, GitHub Pages configuration/run and live post-publication version/download verification. None was performed here.

No real Android phone/emulator, Android lifecycle, in-place native upgrade, native installer registration/shortcuts/uninstall, runtime bootstrap, OS sleep/power-loss, full screen-reader/system-scaling audit or participant acceptance was independently tested. Browser success must not be represented as those results. Existing personal profiles and the original untracked docs/weekly and nowwhat-video work were untouched.
