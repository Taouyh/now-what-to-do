# Android build 10 independent verification

Result: **PASS for the requested removal of the Android vibration setting**, verified on 2026-11-12 in a separate chat and isolated worktree. No product defects found in this targeted round. Physical Android notification, sound, screen-off delivery and in-place upgrade acceptance remain pending.

## Fixed source and delivery

- Main source: `7ff2aa77228fc19d338615f4e1843361ca4c20fd`.
- Equivalent cherry-pick in this worktree: `a0e4e1062930890c5a6baabef73dbe96df313f46`.
- Worktree: `C:/Users/fengcai/.codex/worktrees/3e31/now-what-to-do`.
- APK: `D:/code/now-what-to-do/dist/android-no-vibration-2026-11-12/Now-What-1.4.3-Android-build10.apk`.
- APK size: **12,106,044 bytes**; SHA-256: `EB678BBE9E59BE849342F6769873845C07315A1D51A2F9D6E11CBA8B869F9A89`.
- Package `io.github.taouyh.nowwhat`; versionName **1.4.3**, versionCode **10**, minSdk 24, targetSdk 35.
- APK signature v2/v3 verifies. RSA-3072 signer certificate SHA-256: `08d941113e6b6cde7147cbbd7eee37345b0d36c477c8472707db2b9aef4b4a15`, matching build 9's verified signing identity.

The actual APK was inspected without rebuilding or modifying it. Of 286 ZIP entries, exactly five differ from the final build 9 APK: `AndroidManifest.xml`, `assets/native-android.js`, and three signing metadata entries (`META-INF/NOWWHAT.SF`, `META-INF/NOWWHAT.RSA`, `META-INF/MANIFEST.MF`). The remaining 281 entries, including DEX, icons, resources and 272 other web assets, are identical. The packaged adapter matches the fixed source after line-ending normalization and no longer advertises `supportsVibration`. See [package comparison](evidence/package-comparison.json), [package metadata](evidence/badging.txt), and [signature verification](evidence/signature.txt).

## Targeted checks

| Check | Result |
| --- | --- |
| Actual APK settings at 320 × 568; zh-CN/en/ja × light/dark | 6/6 pass |
| Reminder unit tests (`node --test tests/reminders.test.cjs`) | 9/9 pass |
| Startup/reminder browser regression (`tests/e2e/startup-reminders.spec.ts`) | 3/3 pass |

The six settings cases serve assets extracted from the actual APK and execute its real `native-android.js`; only the Java `NowWhatAndroid` bridge is mocked. Each uses a fresh Edge browser context with Android viewport/touch settings. The assertions confirm no sound control, no visible vibration control, hidden zero-height reminder preferences, no overflow, and a reachable import file chooser. The footer contains only the translated data-sync note: its 39.1875px height equals the note height plus its existing margins, with no empty preference block. No page errors occurred.

Seeded legacy preferences `{sound:false,vibration:true}` remain stored unchanged. Starting a task sends `{sound:true,vibration:true}` through the actual adapter: the control removal retains existing preference compatibility and automatic sound behavior. This is bridge-level evidence, not an observation of native OS output. See [six-case results](evidence/settings-results.json), [settings log](evidence/settings.txt), [reminder log](evidence/reminders.txt), and [startup log](evidence/startup.txt). The six `settings-*.png` files capture the resulting settings pages.

The broader build 9 suite and Windows installation checks remain recorded in [the preceding independent report](../native-review-1.4.3-2026-11-12/INDEPENDENT-TEST.md); they were not repeated for this narrowly scoped change. Dependencies reuse the existing node_modules junction, while this checkout supplies the test/configuration source. The new six-case probe uses the exact APK assets; the existing three-case browser regression uses the previously verified build 9 web bundle, whose runtime assets are unchanged in build 10.

## Figma synchronization

The active Figma account was verified as **3966592487** before project access. Session: `e9cf2053-acd5-4d4c-a60c-3f71035c4263`; file: `EUoXZR1hDJUUPVAtrDxpE5`; page: `49:243`.

Removed the vibration preference frame and its descendants from four existing Android footer masters (`474:9788`, `474:9799`, `474:9810`, `474:9821`). Their six linked instances inherited the removal. The remaining translated data-sync note aligns at x=0; footer dimensions are unchanged. No new screens, components, assets or tokens were created. The affected footer-board annotation (`474:9872`) now says Android's vibration switch was removed in build10. The board title's older source hash remains historical.

Before/after structural comparison confirmed unchanged geometry, text, reactions and structure outside the targeted component/instance interiors across the two settings screens, footer board, web/Windows footer masters, Android visual board and icon board. The subsequent annotation change only updated the relevant explanatory text. Home, tasks, calendar and editor were not edited. See [mutation audit](evidence/figma-audit.json).

Final screenshots were visually reviewed: [Chinese settings](evidence/figma-final-zh.png), [English settings](evidence/figma-final-en.png), and [footer variants](evidence/figma-final-variants.png). Live nodes: [Chinese settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5/NowWhat?node-id=457-10154), [English settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5/NowWhat?node-id=457-10398), [footer variants](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5/NowWhat?node-id=474-9870).

## Scope and delivery status

The accepted Windows installer remains unchanged at SHA-256 `82F3579826BADAA578B8A241019F4002F2B2B27525B6DBE28E1A735807232B6C`; it was not reinstalled or rebuilt in this round. APK and Windows hashes were checked again after package/browser verification.

This report supersedes build 9 assertions that Android settings should expose a vibration row. It does not claim device execution, upgrade acceptance or participant acceptance. No push, publication or merge was performed; this delivery contains verification documentation and evidence only.
