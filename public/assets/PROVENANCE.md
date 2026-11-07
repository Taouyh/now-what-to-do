# Local design assets

Retrieved 2026-11-05 through the Figma connector, after verifying account handle `3966592487`.

- File: https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5
- Background, book paper/edges/corners, navigation and recommendation icons: node 49:244.
- Plant vector parts `plant-4.svg` through `plant-15.svg`: node 49:276 within 49:244. The UI positions the original vector parts; it does not use a screenshot of a page.
- Task strip paper and playback icon: node 151:3405.
- Scroll paper, binding and control icons: node 151:4235.

Assets are checked into the project for offline use. Temporary Figma download URLs are not runtime dependencies. These are user-provided design assets; this manifest does not establish any wider redistribution rights beyond the project.

Fonts: Fontsource Variable packages Noto Serif SC 5.3.1, Noto Sans SC 5.3.1, EB Garamond 5.3.0. Their original OFL licenses are included in the corresponding `fonts/*/LICENSE` files. CSS retains the original unicode ranges and local WOFF2 files.

Release 1.4 optimization (2026-11-07): six PNG textures also have lossless WebP copies. RGBA pixel equality was checked for every copy; original PNGs remain here as source assets. Production builds omit those PNG duplicates and the JavaScript source map. Font coverage is unchanged.
