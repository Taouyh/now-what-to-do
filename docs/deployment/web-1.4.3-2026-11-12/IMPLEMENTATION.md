# Web 1.4.3 and README book icon

2026-11-12, Asia/Shanghai. The user explicitly requested updating the web app to the current native version, changing the README application icon, and pushing the result. This supersedes the earlier web-1.4.1 preservation scope.

Integrate the already released native source branch design/minimal-ui at 900cc3a with master 13e0d05 in an isolated integration worktree. Preserve the deployed desktop/Android videos, download links, source history and user-owned untracked files. The only merge conflict is AGENTS.md; reconcile it with the current publication authorization.

Runtime, shared UI, optimized textures, font loading, reminder behavior, source icons and package version are identical to the independently verified 1.4.3 source. The existing responsive mobile book layout activates for compact Android/touch browsers. The web adapter remains in use; native notification APIs must not be advertised as browser capabilities. Web entry metadata adds the approved book favicon and 1.4.3 CSS/JS cache keys so returning visitors load the current assets. No native installer rebuild is requested.

All three READMEs use the existing approved packaging/icons/icon-128.png at 88 CSS px. This is a new image URL for the new book artwork. Update the release summary and timer description to the existing 1.4.3 behavior. Preserve both demo links and native downloads.

Validate 153 core tests, production build, complete browser suite, both marketing players and icon asset checks. Before master integration, obtain independent fixed-commit validation in a separate GPT window/worktree and fresh browser context. The existing separate Figma window should verify reuse of current verified web/footer/icon mappings and synchronize only genuine discrepancies; no redesign.

After successful review, fast-forward master to the reviewed integration result, push, wait for Pages and check release.json version/commit, served JS/CSS/icon hashes, fresh desktop/mobile flows, existing-data retention, both marketing videos and all three GitHub README images. Update the public Release's web-version statement after deployment. Keep native binaries and v1.4.3 tag unchanged.

Rollback uses a new reviewed revert commit restoring the previous website payload; never reset history or clear application data. Browser autoplay/background suspension and OS settings remain authoritative. This publication cannot establish physical-device notification or upgrade acceptance.
