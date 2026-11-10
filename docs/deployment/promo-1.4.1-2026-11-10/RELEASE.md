# 1.4.1 publication and multilingual introduction

2026-11-10, Asia/Shanghai. User explicitly confirmed the candidate installers and authorized push, Release updates and website publication after passing tests. This supersedes the native candidate's prior local-only restriction for this release.

Scope: publish the verified 1.4.1 native packages and existing web improvements; refresh three READMEs, an 86-second English demo and the current book introduction. Add a hover-open language dropdown before See it work, matching its control style; darken the selected language and start every page load in English. No trigger click toggling; keyboard access supplements hover. All Get the app/platform download links lead exactly to https://github.com/Taouyh/now-what-to-do/releases. No application storage is changed by the introduction.

Media is recaptured from synthetic data. Existing untracked nowwhat-video project remains untouched; reproducible version-specific sources are in media/demo-1.4.1. Independent test and Figma synchronization are pending. Native payloads are unchanged from the approved candidate.

Publish only after fixed-commit independent verification. Release uploads must use the recorded native hashes; Pages should deploy the same reviewed source through master. Verify public version, menu, video and download URLs after deployment. Preserve earlier Releases and user data. Roll back a defective site using a reviewed previous commit; do not clear storage. Android downgrade requires a backup and device-specific handling; prefer a corrected higher versionCode.
