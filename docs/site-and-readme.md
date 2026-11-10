# Introduction page and GitHub Pages

The app stays at https://taouyh.github.io/now-what-to-do/ and the introduction stays at https://taouyh.github.io/now-what-to-do/about/.

## Publish

GitHub Pages uses GitHub Actions. `.github/workflows/pages.yml` only publishes `master`: install dependencies with lifecycle scripts disabled, run core tests, build `dist/web`, assemble `dist/site`, and deploy the Pages artifact. Never serve the repository's development `index.html` directly.

Local preview: `npm run build:web`, `node scripts/assemble-site.cjs`, then `python -m http.server 8778 --bind 127.0.0.1 --directory dist/site`. Open `/about/` for the introduction. Only the assembled public directory is served.

The trilingual introduction uses the warm paper Figma design at https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=442-6759. Its files are `about/index.html`, `about/about.css` and `about/about.js`. Static English remains readable without JavaScript. Every load starts in English; hover the language control to reveal Chinese, English and Japanese choices. Keyboard access supplements hover, without a click/tap-to-open fallback. Selected options have a darker fill. App language preferences and stored activities are untouched. Get the app and platform actions point to the project GitHub Releases page.

## Media

- `about/assets/nowwhat-demo-1.4.1.mp4`: latest 86-second, 1920×1080 English functional walkthrough. Simulated mouse clicks, original gentle music, clear click sounds, no voiceover, no green guiding lines.
- `book-home.webp` and `book-calendar.webp`: actual book-interface captures with synthetic data, not user records.
- Video loads only on request. It is not included in Windows or Android packages.
- The older 1.3 and 1.4.0 demo assets remain in source for historical references but are not used by the new page.

The three README files link to the same release, book screenshot and latest video. Retain font licenses when changing assets. Verification, fixed commit and release hashes are recorded in `docs/deployment/promo-1.4.1-2026-11-10/RELEASE.md`.
