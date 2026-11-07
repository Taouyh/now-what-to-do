# Introduction page and GitHub Pages

The app stays at https://taouyh.github.io/now-what-to-do/ and the introduction stays at https://taouyh.github.io/now-what-to-do/about/.

## Publish

GitHub Pages uses GitHub Actions. `.github/workflows/pages.yml` only publishes `master`: install dependencies with lifecycle scripts disabled, run core tests, build `dist/web`, assemble `dist/site`, and deploy the Pages artifact. Never serve the repository's development `index.html` directly.

Local preview: `npm run build:web`, `node scripts/assemble-site.cjs`, then `python -m http.server 8778 --bind 127.0.0.1 --directory dist/site`. Open `/about/` for the introduction. Only the assembled public directory is served.

The English introduction uses the warm paper Figma design at https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=360-4380. Its HTML and CSS are `about/index.html` and `about/about.css`. It needs no JavaScript. App language preferences and stored activities are untouched. The app itself retains English, Chinese and Japanese.

## Media

- `about/assets/nowwhat-demo-1.4.mp4`: latest 77-second, 1920×1080 English functional walkthrough. Simulated mouse clicks, original gentle music, clear click sounds, no voiceover, no green guiding lines.
- `book-home.webp` and `book-calendar.webp`: actual book-interface captures with synthetic data, not user records.
- Video loads only on request. It is not included in Windows or Android packages.
- The older 1.3 demo assets remain in source for historical references but are not used by the new page.

The three README files link to the same release, book screenshot and latest video. Retain font licenses when changing assets. Verification, fixed commit and release hashes are recorded in `docs/deployment/book-1.4.0/RELEASE.md`.
