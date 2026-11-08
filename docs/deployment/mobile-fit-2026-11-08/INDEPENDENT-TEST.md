# Independent Android viewport verification

## Final retest: PASS for web and supplied-package scope

2026-11-08, Asia/Shanghai. Final fixed product source: **`ca728cd276db3f8d1c64aff297ec0ba18d418a6d`**. Same independent GPT chat/worktree, clean detached product checkout, fresh synthetic nonpersistent Edge contexts. The original failed checkpoint below is preserved unchanged as historical evidence.

**MOB-01 is independently closed.** Production build/typecheck and all **20 requested Edge tests pass** (10 mobile plus 10 book journeys; 14.8 seconds). Bounded supplemental interaction retests pass. No remaining blocker was observed in the executed web/package scope. Browser simulation does not establish Android-device, soft-keyboard/IME, installation, in-place upgrade, system-scaling or participant acceptance.

The new source changes only the relevant mobile dialog rules, task anchor behavior and noninteractive notification hit handling, plus tests/documentation. Tested on Edge 157.0.4341.42 with Node 24.18.0/npm 11.16.0. Reused the already installed isolated-worktree dependencies. Ports 8793/8794 were checked unused before starting this round. No product source/test change, Windows package build, push, merge or Figma access was performed by the tester; only this report is committed.

### Targeted independent retests

- **800x360 landscape and 390x360 contracted phone:** Save/Cancel/Delete occupy y=286..330, fit inside the viewport and pass center-point hit testing both before and after scrolling. The editor body moves with actual wheel input and CDP touch swipes in both directions, while its footer stays reachable. Measured body scroll ranges reached 154/157px at 800 width and 139/142px at 390 width. Name and multiline mixed-language description drafts survived contraction and scrolling; Save persisted them, while Cancel discarded later unsaved changes.
- **Long-content confirmation:** Real saved long task names and descriptions produce confirmation scrollHeight 652px at 800 width and 1128px at 390 width, with clientHeight 332px. Touch input advances the content from its top; wheel input reaches its end. Both confirmation actions then fit at approximately y=274..318 and pass hit testing. Cancelling deletion preserves the editor's unsaved name draft and all 23 stored tasks.
- **Rotation observation closed:** The exact original sequence now yields portrait `ind-9..17`, landscape `ind-8,ind-9`, then portrait `ind-9..17`. Original task `ind-9` remains visible after the round trip. Editing this task, changing capacity while the dialog is open, then saving also returns to the page containing `ind-9`.
- **Toast touch interception closed:** At 320x568, while the completion notification was still visible, computed `pointer-events` was `none`; both continuation buttons passed hit tests and Save persisted the draft immediately. The notification can still visually overlap the button area briefly; this is not reported as visual removal of the notification.
- Inspected six new targeted screenshots: both editor sizes, both long confirmations, rotation return and the visible-toast hit scenario. No page exceptions occurred in the two editor/confirmation contexts.

The specified 20-test run also reran the original four-size task traversal/settings chooser checks, add/delete/current-capacity behavior, completion capsule checks and existing book journeys. Prior separate four-configuration visual/text-boundary checks, empty-phone/actual backup restore, dynamic language traversal and final-page deletion evidence are inherited from the original checkpoint for unchanged behavior; that broader supplemental matrix was not needlessly repeated or represented as newly rerun.

New evidence is under `.cache/mobile-independent-retest/`: `build-web.log`, `e2e.log`, `retest.cjs`, `probe.log`, `results.json`, six PNG captures and final APK comparison/signature/metadata logs. Original `.cache/mobile-independent/` evidence remains intact.

### Final supplied APK

Read-only inspection of the rebuilt `D:\code\now-what-to-do\dist\android-preview\Now-What-1.4.0-Android.apk`:

| Property | Final observed value |
| --- | --- |
| Bytes | 19,060,482 |
| SHA-256 | `722AF52D3CBEF09CD645C477D69895C82DEF70180C69B88A78C8C78B7613BACC` |
| Package/version | `io.github.taouyh.nowwhat`, versionCode 6, versionName 1.4.0 |
| SDK | min 24, target 35 |
| Certificate SHA-256 | `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15` |

All 270 production manifest files match the independent final-source build: 226 exact, 44 text-only CRLF/LF differences, zero mismatches. The expected Android index bridge insertion and native bridge match. The APK has 279 entries and no inspected prohibited paths. `apksigner` verifies v2/v3 signatures with the same certificate as the previously inspected published package; `aapt2` confirms the metadata above. The published `dist/android` APK remains SHA-256 `3A3FB094F21B6AD81DE34F4670F00E73A0AE1E393E6C9868D46430D3F3F0FF85`. The original candidate APK hash in the historical section is superseded for this final candidate.

Final independent web SHA-256: app.js `EDE8E0231E61D317618F9289EBEF0FA7D13C931867E47E2E50912EB7C5D30801`; style.css `78661CEBF681D4877AFD5D11BD16D3D74B56BEB7F7FD7AF0CDCE27E42E2CD33F`; index.html `168CDC9E729155D67E60D6EA7A730596CB89DDD3797F814DF29F46491524E70B`.

No APK installation, native upgrade, real IME or device acceptance was performed. No private signing material was accessed. The fixed-source web and supplied-package checkpoint passes within these boundaries.

## Historical first checkpoint: FAIL

Date: 2026-11-08, Asia/Shanghai. Fixed source: **`c208809211874e54fa15c9ee37da5f8bbc5e2f61`**. Separate GPT chat, isolated worktree `C:\Users\fengcai\.codex\worktrees\09f0\now-what-to-do`, detached HEAD during testing.

## Decision

**FAIL for the requested short-viewport interaction checkpoint.** Production build and the requested 19 browser tests pass. Actual supplemental wheel/touch interaction exposes inaccessible task-editor actions at 800x360 and in contracted phone viewports. This is a reproducible usability defect, not an assertion rounding issue. No observed data loss occurred; restoring portrait height allowed the draft to be saved.

Task pagination, compact settings/import, completion Save/Cancel styling, actual synthetic backup restore, language changes and last-page deletion passed the checks described below. Package-content/signature inspection passed. These results do not establish Android-device, IME, installation, upgrade or participant acceptance.

Only this report is committed. Product source, tests and native hosts were not changed. No push, merge, publication, Windows build, real browser profile, Figma session or private signing material was used. Initial tracked status was clean. Read deployment instructions, current implementation, release/validation evidence and development rules; earlier-stage guides were not opened.

## Environment and execution

- Windows; Node 24.18.0, npm 11.16.0, Playwright 1.64.1; actual headless Microsoft Edge **157.0.4341.42**.
- `npm ci` completed with 300 packages. An early build attempt while installation was still completing could not find `tsc`; after install completed, the production build/typecheck passed without source changes. Dependency deprecation/pending-script notices did not prevent the web build.
- `npm run build:web`: PASS, 270 manifest files assembled.
- `BOOK_TEST_PORT=8793; npx playwright test tests/e2e/mobile-book.spec.ts tests/e2e/book.spec.ts`: **19/19 PASS**, 17.7 seconds, three workers. Port 8793 was checked unused; configured server reuse was disabled.
- Supplemental probes served this worktree's independently built `dist/web` on private test port 8794. Every probe used a fresh nonpersistent Edge context and synthetic data. The existing developer server and personal profiles were not accessed.

Evidence stays locally under `.cache/mobile-independent/`: `build-web.log`, `e2e.log`, `probe.cjs`, `probe.log`, `results.json`, `focus.cjs`, `focus-results.json`, `continuation.cjs`, `continuation-results.json`, PNG captures and APK checks/logs. Playwright artifacts are in `test-results/` and `playwright-report/`. These ignored outputs are not release artifacts or tracked product changes.

## Confirmed defect: MOB-01 / P1

**Task editor Save, Cancel and Delete cannot be reached in a short viewport.**

Reproduction on the fixed source:

1. Open a fresh Android-UA/touch context at 800x360 with a synthetic task.
2. Open Tasks, edit the task, and enter a name/description draft.
3. Scroll the dialog using three real wheel gestures and a CDP touch swipe.
4. Try to reach Save, Cancel or Delete.

The dialog starts at y=28.796875 and is 470px tall, ending at y=498.796875. Its computed `min-height:470px` overrides `max-height:302.4px`; the dialog's scrollHeight and clientHeight are both 466, so scrollTop remains zero. All three actions occupy y=422.796875 through 466.796875, outside the 360px viewport. Repeated wheel/touch cannot reveal them.

The inherited compact rule is `src/ui/styles/book.css:311`. The mobile-specific rules do not reset the dialog minimum height. This rule predates the candidate, but the requested mobile/keyboard acceptance scope exposes it; it remains a real blocker for this candidate's short-viewport interaction claim. The same rule also targets confirmation cards; only the task editor is included in this defect's independently confirmed reproduction.

It also reproduces when 320/360/390-wide phone contexts are reduced to 360px height. These are viewport-contraction simulations, not a real Android soft keyboard. Draft fields retained their exact values; restoring 390x844 allowed Save to persist the name and description. No actual data loss was observed.

Evidence: `defect-landscape-modal.png`, `focus-results.json` (afterWheel/afterTouch/restored/saved), and the four `*-modal-contracted.png` captures. The development chat was notified immediately with measurements and source location. Fix and a new fixed-source retest are required before closing this defect.

## Bounded supplemental checks

| Configuration | Task capacity | Tasks / settings | Completion editor |
| --- | ---: | --- | --- |
| Chinese dark, 360x640 | 6 | Bounds and controls pass | Reachable by real wheel; save persists |
| English light, 320x568 | 5 | Bounds and controls pass | Pass after transient notification disappears |
| Japanese light, 390x844 | 9 | Bounds and controls pass | Reachable; save persists |
| English light, 800x360 | 2 | Bounds and controls pass | Reachable by internal scroll; save persists |

Inspected all twelve task/settings/completion screenshots across these four configurations. Task titles retain readable line height, with no observed collision with action/pager controls. Settings language, appearance, export and import buttons and their labels stay in the viewport; import is operable, not merely present. Supplementary measurements record text ranges, element/client/scroll bounds and hit targets. This is a bounded visual review, not a font-scaling or screen-reader audit.

The original 19 tests independently traverse 23 tasks in every requested configuration without omissions/duplicates, verify add/delete and current capacity, and compare completion capsule styles in light/dark mobile/desktop contexts. Supplemental checks exercised actual internal wheel scrolling before clicking continuation actions, rather than relying on Playwright auto-scroll alone.

At 320px width the 3.2-second completion notification initially covered the Save/Cancel hit centers. The first supplemental assertion consequently failed. A focused follow-up waited for the existing notification to hide, verified both buttons at y=491.765625..535.765625 with successful hit tests, and saved the draft. This transient overlay is recorded rather than counted as a persistent inaccessible-control defect.

Additional behavior:

- Fresh empty phone library: opened empty Tasks, created the first real task through the editor, and verified persistence.
- Actual file chooser import: restored a synthetic seven-task Japanese/dark backup, accepted the confirmation, reloaded, and verified all seven tasks, language and custom data survived. No personal backup was read.
- Dynamically switched Chinese, Japanese and English through Settings; paged through all 23 IDs after each switch without omission/duplication.
- Rotation preserves the first visible task for each individual resize. **Round-trip position drift remains an observation:** portrait page `ind-9..17` becomes landscape `ind-8,ind-9`, then portrait `ind-0..8`. The implementation anchors each resize to the then-current page start, so the original `ind-9` is no longer visible after the round trip. The first probe's stricter original-anchor assertion failed; it is not reported as passing. Developer was notified. No task data disappears. This is separate from the confirmed modal blocker.
- Deleted all five tasks on the final portrait page through real editor/confirmation actions. Pagination correctly returned to the preceding nine-task page; stored count became 18.
- Windows UA with touch enabled at 360x640 does not receive `mobile-book`. The existing desktop book journeys passed; no Windows package/native acceptance is inferred.
- No page exceptions occurred in the four primary supplemental contexts.

## Read-only Android package inspection

Inspected the supplied `D:\code\now-what-to-do\dist\android-preview\Now-What-1.4.0-Android.apk`; did not build or install it.

| Property | Observed value |
| --- | --- |
| Bytes | 19,060,482 |
| SHA-256 | `C4879A64DB8FD6632FFD3F306C5C2ADA4F79457A8A700EE299201D954C1DC478` |
| Package | `io.github.taouyh.nowwhat` |
| Version | versionCode 6, versionName 1.4.0 |
| SDK | min 24, target 35 |
| Certificate SHA-256 | `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15` |

All 270 production manifest files match the independently rebuilt fixed source: 226 exact and 44 text files differing only by CRLF/LF. For index.html the expected native-android script insertion is accounted for. The native bridge matches after newline normalization. APK has 279 entries; inspected paths contain no keystore, node_modules, marketing video or source map. Initial comparison classified three extensionless LICENSE files as mismatches; explicit text newline comparison closed those false alarms without relaxing binary checks.

`apksigner` verifies v2/v3 signatures and one RSA-3072 signer. The certificate was also read from the supplied existing 1.4 APK and matches exactly. `aapt2` confirms the metadata above. The first signer-tool attempt failed because inherited JAVA_HOME pointed at unavailable JDK8; rerunning with the installed JDK17 succeeded. No signing private key or secret was read or printed.

Independently built web hashes:

- app.js: `C236F8C682ACE8C9D61C23867C5D48EE1552D06405FF01AA368BBEB327D0877A`
- style.css: `AE8E986B958887989D9E7BAFD26636924BE38788D97A7103DDFFA096A5C1BE37`
- index.html: `168CDC9E729155D67E60D6EA7A730596CB89DDD3797F814DF29F46491524E70B`

No usable ADB command/platform-tools installation was found in the checked environment, and no physical phone/emulator was used. Browser viewport contraction and CDP touch input are not Android IME/device acceptance. Actual Android installation, in-place upgrade, lifecycle, system scaling and participant acceptance remain untested. APK identity/signature continuity does not prove an upgrade works.
