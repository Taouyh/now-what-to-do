# Web 1.4.3 published

2026-11-12, Asia/Shanghai. The user explicitly authorized updating the web application to the current version, updating the README application icon, and pushing. This supersedes the previous promotional release's deliberate web-1.4.1 scope.

## Public result

- App: https://taouyh.github.io/now-what-to-do/
- README: https://github.com/Taouyh/now-what-to-do#readme
- Promotional page: https://taouyh.github.io/now-what-to-do/about/
- Native Release: https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.3
- Successful Pages deployment: https://github.com/Taouyh/now-what-to-do/actions/runs/43225393167

Live release.json reports version **1.4.3**, commit **77ae6a6a4897298ecc0ac16b67b637dfab06b3ae**. The final tested implementation is aeae00f2001442b8a27d8126eebd1f765b2b545e; the deployed commit adds its independent report only. Later report-only commits leave the deployed payload unchanged.

The tested integration merges design/minimal-ui at 900cc3a into master at 13e0d05, retaining both original histories. All runtime/shared UI/assets are the already verified 1.4.3 implementation; additional web entry changes are the book favicon and versioned CSS/JS URLs. The three READMEs now use the existing approved 128 px book icon at 88 CSS px, with current release/timer descriptions. The two promotional videos and installer URLs remain intact.

## Validation

Independent verification passed 153 Node tests, 110 complete browser cases on the integration, and 3 startup/reminder regressions plus 11 independent checks on the final entry-metadata patch. The final app.js/style.css are byte-identical to the full-suite build. Promotional playback/layout and icon checks passed. See INDEPENDENT-TEST.md.

The separate Figma worktree verified current desktop settings, mobile touch layouts, footer and book-icon mappings against the final source. Existing mappings can be reused without design changes. See FIGMA-VERIFICATION.md.

Public checks after Pages deployment:
- The live JS and CSS hashes equal the reviewed build: 285491adcb0fbb4a3e014185be67021fddf998d4a9a0b9ead08c3c12992aaa95 and 0104a74057e6e65f739005137c7eb88e98797b1da484737d55fe8b8a064e5ef6.
- App entry, favicon and promotional HTML/JS/CSS match the reviewed build (text comparisons normalize platform line endings). Live book favicon SHA-256: 8c8b0afb49877e2cd8016383aa178cf24f72315881d5a2e1d66e08142ce2a042.
- New desktop and Android-like touch browser contexts verified ready-state startup, appropriate responsive layout, versioned resources, recommendation, Start/Pause/Finish, settings and reload. Existing synthetic tasks, descriptions, old completed record, reminder preferences and custom data were retained; each run added exactly one completion. No page errors, HTTP asset failures or horizontal overflow occurred.
- The first local live-smoke fixture omitted the required vibration Boolean from its synthetic reminder preferences. The application correctly protected that invalid data without overwriting it. The ignored fixture was corrected; both final live cases passed. No product patch resulted from this test-data error.
- All three public README files and the new icon matched their Git blobs. A fresh browser opened the actual GitHub repository README and decoded the displayed 128x128 source image at 88x88 CSS pixels. Its screenshot confirms the new book artwork.
- Updated the existing v1.4.3 Release body to state that the web app is also 1.4.3. Installer asset IDs/digests and release tag stayed unchanged.

Machine-readable public results are in published-evidence.json; local screenshots/probes remain in .cache/web143-* and .cache/github-readme-icon.*. Existing user-owned untracked docs/weekly and nowwhat-video in the original checkout were preserved.

## Boundaries and rollback

These are web deployment and isolated synthetic-browser checks. They do not establish physical Android/OS notification or native in-place upgrade acceptance. Browser background suspension, autoplay and system settings remain authoritative.

If rollback is required, use a new reviewed revert commit against the previous deployment, retaining user storage and Git history. Never clear app data or force an Android downgrade. Native installers were neither rebuilt nor replaced during this web publication.
