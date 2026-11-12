# Promotional page book icon

2026-11-12, Asia/Shanghai. User requested updating the promotional application's icon and pushing.

The page's only app-icon reference is its browser favicon. Replace the unversioned ../packaging/icon.png reference with assets/app-icon-1.4.3.png, copied byte-for-byte from the approved packaging/icons/icon-128.png. The distinct URL avoids reusing cached old favicon bytes. Type is image/png and declared size is 128x128.

SHA-256: 1e725b45fbdb1e98edbe40629307810a656780c5be5b2403a7386f42331f2b36.

Local assembled-page verification in a fresh Edge context passed: the icon link resolves, HTTP 200, browser decode is 128x128, and response hash matches the approved book icon. Existing page content, layout, videos, app runtime and installer assets are unchanged. This reuses the already verified Figma book artwork; no page/component design change requires synchronization.

Publish through master/Pages and verify the actual public favicon URL and hash. Roll back only this scoped metadata/asset change with a new revert commit if necessary.

Published source: 23cb19a3d76389b84a37fddc6b1be81b9d0bf8aa. Pages workflow https://github.com/Taouyh/now-what-to-do/actions/runs/43230613937 completed successfully. Live release.json reports 1.4.3 and this commit. Fresh Edge verification of https://taouyh.github.io/now-what-to-do/about/ resolved https://taouyh.github.io/now-what-to-do/about/assets/app-icon-1.4.3.png, decoded 128x128 and confirmed HTTP 200 plus the exact source SHA-256 above. Evidence: .cache/promo-icon-live.json.
