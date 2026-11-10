# 1.4.1 publication and multilingual introduction

2026-11-10, Asia/Shanghai. User explicitly confirmed the candidate installers and authorized push, Release updates and website publication after passing tests. This supersedes the native candidate's prior local-only restriction for this release.

Scope: publish the verified 1.4.1 native packages and existing web improvements; refresh three READMEs, an 86-second English demo and the current book introduction. Add a hover-open language dropdown before See it work, matching its control style; darken the selected language and start every page load in English. No trigger click toggling; keyboard access supplements hover. All Get the app/platform download links lead exactly to https://github.com/Taouyh/now-what-to-do/releases. No application storage is changed by the introduction.

Media is recaptured from synthetic data. Existing untracked nowwhat-video project remains untouched; reproducible version-specific sources are in media/demo-1.4.1. Native payloads are unchanged from the approved candidate.

Independent worktree f7ec verified initial source 8d64eb1, caught two corrupt video captions and an outdated Japanese preset list, and retained the failed report. Corrections in 5bf74a6 passed focused independent re-verification: final video hash, full decode, playback, 0/62-second frame inspection, localized README/guides and 21 language/viewport layouts. The initial 144 Node tests/build passed; unchanged app/native code was compared with approved source 39d64f1. See INDEPENDENT-TEST.md. Release link/payload gate also passed for all 270 production files.

Final MP4: 86 seconds, 1920×1080; SHA-256 D17F47754D91E4ECF76AB08D8C685E55801AA45D3229B3250AF8079F2BA8B67A. Separate Figma worktree fdb4 verified account 3966592487 and synchronized six full pages and their menu/disclosure states. See FIGMA-SYNC.md for editable nodes and fidelity limits. Caption-only video corrections do not change that website design.

Publish only after fixed-commit independent verification. Release uploads must use the recorded native hashes; Pages should deploy the same reviewed source through master. Verify public version, menu, video and download URLs after deployment. Preserve earlier Releases and user data. Roll back a defective site using a reviewed previous commit; do not clear storage. Android downgrade requires a backup and device-specific handling; prefer a corrected higher versionCode.

## Published and verified

Published source/tag: `aea1f98893bf4dc862c5126bccd94ed225af5338`, `v1.4.1`. The tested design/minimal-ui history was fast-forwarded into master without rewriting history. Both branches were pushed. The following report-only commit does not change the deployed payload.

- Public release: https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.1. Both native installers and SHA256SUMS.txt uploaded; GitHub asset SHA-256 digests equal the approved candidate hashes in the native delivery. Earlier releases remain intact.
- Pages workflow https://github.com/Taouyh/now-what-to-do/actions/runs/42822095836 completed successfully for the exact source above.
- Live https://taouyh.github.io/now-what-to-do/release.json reports 1.4.1 and the exact deployed source. A fresh Japanese-locale browser verified initial English, all three hover-selected languages, exact Releases download destination, no page errors and the live book app.
- Live video played at 1920×1080, 86.016 seconds container duration. Full HTTP download hash equals `D17F47754D91E4ECF76AB08D8C685E55801AA45D3229B3250AF8079F2BA8B67A`. Local evidence: `.cache/live-promo-141.json`.
- GitHub default-branch README blob matches local source (`2277a7f38e9db1c5328f36158f396dc6c063589b`). The Chinese and Japanese README updates are in the same pushed commit.

User-owned untracked docs/weekly and nowwhat-video remain untouched. No user app data or personal browser profile was modified.
