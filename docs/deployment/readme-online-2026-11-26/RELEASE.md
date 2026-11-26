# README synchronized with the online app

Verified on 2026-11-26 (Asia/Shanghai).

- Public app: https://taouyh.github.io/now-what-to-do/
- GitHub README: https://github.com/Taouyh/now-what-to-do#readme
- Live release.json: version 1.4.3, commit cafb82b23e5eb95d952c0a294a1a8b8c88cbc37c.
- Native downloads remain Windows 1.4.3 and Android 1.4.3 build 10:
  https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.3

## Changes

Updated the English, Simplified Chinese and Japanese READMEs with the current desktop web controls: direct 5-180 minute input for a round, click-to-open focus restrictions, and inline continuation notes saved with Enter or an outside click. Replaced the old shared home screenshot with one current live capture per language. Clarified that existing demonstration videos show the previous interface and that native installers remain the previously published builds.

Screenshots are in docs/images/web-home-2026-11-26-{en,zh-CN,ja}.jpg. Each was captured from the public app in a fresh Edge browser context at 1440 x 1000 with synthetic reading-task data. No personal records were used.

## Verification

- All three live language contexts reached the application ready state.
- Changing the minute input updated the selected duration.
- Clicking the first focus restriction toggled its selected state; Escape closed the panel.
- Editing the continuation note and pressing Enter updated stored task data. Source review also confirmed outside-click saving.
- No page errors or horizontal overflow occurred in these three contexts.
- Visually reviewed all three screenshots for correct language, complete content and readable text.
- Checked local README link targets, explicit section anchors and image dimensions.
- Confirmed the native asset names and sizes from the latest GitHub Release metadata.
- Documentation-only change; no runtime code, installer, release tag or app version changes.

A normal revert of this documentation commit restores the previous README and screenshots without changing application data.
