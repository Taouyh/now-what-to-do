# Independent 1.4.1 publication verification

2026-11-10, Asia/Shanghai. Fixed candidate: `8d64eb148f634ee6b4631c440a3774bc3ac683ac`.

**NOT PASSED for publication: two content corrections are required.** Build, 144 Node tests, introduction interactions, responsive layouts, media playback/decoding and retained native artifact identity passed. The rendered video contains corrupt English punctuation, and the Japanese README lists obsolete time presets. No product or media corrections were made in this test window.

## Findings

1. **P2 — Corrupt captions are visible in the actual MP4.** At 0 seconds the caption reads `NowWhat â€” product walkthrough`; at 62 seconds it reads `Open the Journal to review todayâ€™s sessions.` This is present in decoded video frames, not merely terminal encoding. Sources: `media/demo-1.4.1/capture-demo.cjs:14` and `:58`, and generated `src/demo-data.json:323` and `:433`. Correct the source captions, regenerate the video/data, record its new SHA-256 and recheck the rendered frames before publication. Evidence: `frame-0.png`, `frame-62.png` below.
2. **P2 — Japanese README describes the wrong presets.** `README.ja.md:27` says `5・10・15・30・60分`. Actual `index.html:23` and both other READMEs use 10, 15, 20, 30 and 60 minutes. Correct Japanese to match the verified implementation.
3. **P3 — Localized README footers are still English.** `README.zh-CN.md:86–88` and `README.ja.md:86–88` retain English demo/poster labels and the music/no-voiceover sentence. These are understandable but do not complete the localized presentation. Translate while correcting the READMEs.

## Isolation

Separate GPT chat/worktree: `C:/Users/fengcai/.codex/worktrees/f7ec/now-what-to-do`, branch `codex/promo-141-independent-f7ec`. It initially contained clean commit `322527c`; switched this worktree to the requested fixed candidate before building. Read current deployment guide, release plan, native validation/artifact records and development rules.

Node 24.18.0, npm 11.16.0, Playwright 1.64.1, fresh temporary Edge contexts. `node_modules` is a local junction to `D:/code/now-what-to-do/node_modules`, as authorized; this is an independent source build, not an independent dependency supply-chain audit. Browser storage was synthetic and disposable. No real user app/browser profile or application data was accessed. No installation, push, release upload, master merge or site publication was performed. Existing `nowwhat-video` work was not modified; media inspection used read-only FFmpeg binaries from `media/demo-1.4.1/node_modules` in the main repository.

## Executed checks

| Check | Result |
| --- | --- |
| `npm run build:web` | PASS: typecheck, Vite build and 270 assembled files. |
| `node scripts/assemble-site.cjs` | PASS: fresh independent app + introduction site. |
| `npm test` | PASS: 144 tests, zero failed/cancelled/skipped. |
| `node tests/promo-141.cjs` | PASS: 21 language/viewport combinations at widths 320, 360, 390, 700, 768, 1024 and 1531. |
| Independent supplemental browser harness | PASS: Chinese and Japanese browser locales with stale saved language and query parameters both start in English. Enter, Space and ArrowDown open keyboard choices; Tab/Enter changes language; Escape and focus departure close the menu. |
| Menu geometry and pointer interaction | PASS: language trigger precedes and is physically left of See it work. Hover opens; crossing into options keeps it open; pointer departure closes. Trigger click dispatch does not open; actual emulated touch tap does not open. Selection closes. |
| Control styles and selected state | PASS: shared radius, border width, font size, padding and minimum height; one selected language has a darker background. |
| Language content | PASS for introduction: reviewed rendered English/Chinese/Japanese body, expanded installation details, title, description, OG title, both image alts and video accessible label. Brand/platform names remain proper nouns; English screenshots/video are explicitly described as English. No untranslated prose found in the introduction. README exceptions are listed above. |
| Responsive screenshots | PASS: no horizontal page overflow in the 21 combinations; supplemental fully loaded screenshots at 320, 390 and 1531 for each language, including expanded installation notes. Visually inspected English desktop, Chinese mobile and Japanese 320px renders. |
| Introduction download URLs | PASS: Get the app and both platform buttons point exactly to `https://github.com/Taouyh/now-what-to-do/releases` in all languages. Save-video links correctly point to the MP4, not an app installer. |
| Assets and data isolation | PASS: project-prefix local assets return 200; no page errors; synthetic app data/timer keys remain unchanged. Supplemental screenshots explicitly decode the lazy Journal image before capture. |
| App/native source preservation | PASS: full diff from `39d64f1` contains only documentation, introduction, version-specific media and promotional test changes. No changes to app implementation, native hosts, packaging, build scripts or root package/lock files. |

The repository harness captures some full-page screenshots before the lazy Journal image loads. This is a capture limitation, not a broken image: the independent supplemental captures scroll to it, await `decode()`, then capture all content successfully.

## Actual video verification

File: `about/assets/nowwhat-demo-1.4.1.mp4`, 7,720,689 bytes. SHA-256 exactly matches the requested candidate: `81525017E50F5DA149913013AA905B24ACFBE55809B4B9CAEBAEE7F9941DE94C`.

FFprobe reports H.264, 1920 x 1080, 30 fps, 2,580 video frames / 86.000 seconds, AAC stereo 48 kHz; container/audio duration is 86.016 seconds. Edge loaded metadata and actually advanced playback with `paused=false`. Full audio/video decode passed with exit 0 using explicit `-c:v rawvideo -c:a pcm_s16le -f null -`, with an empty error log.

An initial decode command using the bundled FFmpeg default null encoder failed because that build omits `wrapped_avframe`; the explicit-codec retry above resolved this tool limitation. Both logs are retained, and no media corruption is inferred from the first command.

Extracted PNGs at 0, 20, 22, 24, 26, 28, 54, 57 and 62 seconds. Actual decoded frames show:

- Opening: current book interface, plus the corrupt opening caption described above.
- 20 seconds: Read a few pages is pinned, with the filled pin and remaining tasks below it.
- 22 seconds: active drag preview, faded source row and insertion indicator.
- 24 seconds: Stretch for a moment moved ahead of Sketch an idea, with Task order saved feedback.
- 57 seconds: continuation-note editor with entered text and Save/Cancel controls.
- 62 seconds: corrupt Journal caption, confirming the second encoding defect in the rendered asset.

This is an edited screenshot-based walkthrough as documented in its media README, not continuous video evidence of app execution or Android acceptance. Audio decoded successfully; subjective music/click listening quality was not separately assessed.

## README and native artifact review

All three READMEs describe 1.4.1 pin/order changes, point to matching `v1.4.1` installer/APK names, and link the 86-second introduction and local release notes. The quoted download sizes round correctly to 18.6 MiB and 18.2 MiB. Relative documentation/image targets exist. Direct README asset URLs are intended post-publication destinations; this test did not establish that unpublished remote assets are already downloadable. The introduction's platform links use the exact Releases index required by the release plan.

The English README accurately distinguishes owner confirmation from automated Android-device coverage. Chinese/Japanese still say device operation is unverified; this test supplies no new device evidence, and user confirmation alone is not inferred to establish particular touch/upgrade scenarios. Existing 1.4 book-edition references are historical context, not installer version claims.

Read-only hashing confirms both user-confirmed packages remain present with the recorded bytes and hashes:

| Artifact under `D:/code/now-what-to-do/dist/native-preview-1.4.1/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `windows/Now-What-1.4.1-Windows-x64-Setup.exe` | 19,500,594 | `47F2924EA30F317C363ACEED09BCE796D0CD7A81FF6C81173E3763FA9BE1F6FA` |
| `android/Now-What-1.4.1-Android.apk` | 19,064,578 | `E1C284F8358CB780BDFCD234693C8E9EFD634A35F8EA6025FED55AF4B1576753` |

Prior native independent results retain their documented scope. No new Android device, native upgrade, participant or Figma acceptance is claimed here. The current promotional release plan supersedes historical local-only release restrictions; publication remains the main window's responsibility after corrections and verification.

While this verification was running, the main window added `259ff4d097d5390b5047a79f49bca536bf55fa9e` (`test: verify release-page download routing for introduction`). Independently inspected its commit scope: only `tests/package-contents.cjs` changed. It distinguishes the three introduction Releases-index links from version-specific README asset links. The main window reports a passing `node tests/package-contents.cjs --release` against the approved payload, including 270 exact production files; that execution is reported by the main window, not rerun here. This report's independently executed product/site checks remain pinned to `8d64eb1` and its findings are unaffected by the test-only addition.

## Evidence and handoff

Primary absolute evidence directory: `C:/Users/fengcai/.codex/worktrees/f7ec/now-what-to-do/.cache/promo-141-independent/`.

- `build-web.log`, `node-tests.log`, `source-diff.txt`, `artifact-check.json`.
- `supplement.cjs`, `supplement-body.txt`, `supplement-result.json`, `content-en.json`, `content-zh-CN.json`, `content-ja.json`.
- Nine `complete-{en,zh-CN,ja}-{320,390,1531}.png` screenshots with loaded Journal image and installation details expanded.
- `video-metadata.json`, `video-decode.log` (initial encoder limitation), `video-decode-raw.log` (successful full decode), and the nine `frame-{seconds}.png` files listed above.

Repository browser harness evidence: `C:/Users/fengcai/.codex/worktrees/f7ec/now-what-to-do/.cache/promo-141-test/`, including `result.json` and six menu screenshots.

Only this report is committed. Correct the two P2 findings, preferably localize the P3 footer at the same time, and submit the corrected fixed commit/new media hash for focused re-verification before recording a publication PASS.

## Focused re-verification — 2026-11-10

**PASS for the corrected promotional publication candidate `5bf74a693eab92cb0e9fdb28d9acc1c09594cde0`.** Both P2 findings and the P3 localization finding above are resolved. The original failed result and evidence remain unchanged as the historical assessment of `8d64eb1`; this appended result applies to the corrected candidate only. Combined with the original passing checks for unchanged code, no promotional publication blocker remains in this independent test scope. Main-window release/deployment and public verification are still separate actions.

Retest used the same isolated worktree on new branch `codex/promo-141-retest-f7ec`, fixed at the exact SHA above before any checks. `git diff` confirmed no app/native/build implementation or introduction HTML/CSS/JavaScript change since `8d64eb1`. Therefore the prior independent build and 144 passing Node tests remain applicable; those unchanged tests were not rerun. Reassembled `dist/site` using the previously independently built, unchanged app files and the corrected checked-out introduction/media. No original evidence was overwritten.

| Focused check | Result |
| --- | --- |
| Corrected video identity | PASS: 7,719,812 bytes; SHA-256 `D17F47754D91E4ECF76AB08D8C685E55801AA45D3229B3250AF8079F2BA8B67A`, matching the requested hash and updated media README. |
| Whole-file video/audio decode | PASS: FFmpeg `-c:v rawvideo -c:a pcm_s16le -f null -`, exit 0, empty error log. FFprobe retains 1920 x 1080, 30 fps, 2,580 frames / 86.000 seconds video and 86.016-second container/audio. |
| Rendered caption fixes | PASS: independently extracted and visually inspected new MP4 frames at 0 and 62 seconds. Opening reads `Now What 1.4.1 - product walkthrough`; Journal reads `Open the Journal to review today's sessions.` Both punctuation sequences are clean ASCII. Capture source and generated caption data match; no corrupt `â` or replacement characters remain in caption texts. |
| Browser playback and site regression | PASS: reran the existing `tests/promo-141.cjs` harness body with only its local root/evidence paths redirected, using fresh temporary Edge contexts and the reassembled site. Video metadata loaded, actual playback advanced with `paused=false`, all 21 language/width combinations passed, and no page errors were reported. Hover/exit, no click/touch opening, keyboard, selected styling, exact Releases-index links and synthetic storage preservation all passed again. |
| Japanese README presets | PASS: now `10・15・20・30・60分`, matching `index.html` and both other READMEs. |
| Chinese/Japanese README footer | PASS: demo/poster links and music/click/no-narration prose now appear in the corresponding language. Destinations remain intact. |
| Installation guide | PASS: current release/tag/notes and filenames are 1.4.1; Android versionName 1.4.1 / versionCode 7 matches the manifest; 144-test statement matches prior independent execution. Device coverage wording distinguishes automated package checks from owner confirmation. Historical 1.0 migration, 1.3 timer behavior and 1.4 memory context remain historical sections. |
| Site/readme guide | PASS: documents the trilingual HTML/CSS/JavaScript implementation, readable static English fallback, English initialization, hover/keyboard behavior, Releases-index actions and the 86-second version-specific MP4. Master-only Pages description matches the checked-in workflow. New Figma reference matches the committed synchronization report; Figma itself was not reopened or re-audited in this test window. |
| Local documentation links | PASS: relative link/image targets in all three READMEs and both updated guides exist. Public asset availability is a post-publication check, not claimed here. |

Additional evidence directory: `C:/Users/fengcai/.codex/worktrees/f7ec/now-what-to-do/.cache/promo-141-retest/`.

- `video-hash.txt`, `video-metadata.json`, `video-decode.log`, `content-check.json`.
- `frame-0.png` and `frame-62.png`: visually inspected corrected captions decoded from the exact candidate MP4.
- `browser.cjs`, `browser/result.json` and six `browser/menu-{en,zh-CN,ja}-{390,1531}.png` captures from the rerun.

Only this appended report is committed. Native installer identities and prior native/Android/participant limitations remain as recorded above; the focused media/documentation correction introduces no new device or upgrade claim. No product fix, package rebuild, push, merge, Release or website publication was performed in this window.
