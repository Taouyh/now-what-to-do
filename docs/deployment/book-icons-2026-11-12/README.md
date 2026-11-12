# NowWhat open-book application icon

November 12, 2026. Scoped design/resource handoff to the implementation chat. Editable warm-brown leather tile, ivory open pages, visible spine/page block and a Start symbol on the right page. No lettering, bitmap texture, or external artwork is used. The colors reuse the existing B/C Figma palette; five additional fixed illustration shades are bound to local icon variables.

## Design

- [Editable Figma review board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10979)
- [Windows master](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10936)
- [Android foreground master](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10952)
- [Native-size and mask preview](icon-preview.png) · [Figma preview](figma-preview.png)

Account `3966592487` verified. Session and five master IDs are in `figma-state.json`. Existing team-library search returned no application-icon asset. Original shapes are imported as editable SVG paths; the five masters contain 30 vector nodes, all fill-bound to variables. The review contains instances, editable Noto Sans SC captions, and no image fills. Masters live outside the review frame. `create-figma-icons.js` records construction with the supplied binding helper; `fit-adaptive-safe-circle.js` is the subsequent targeted correction.

## Packaging resources

| Target | Files and behavior |
| --- | --- |
| Windows | `packaging/icon.png` (512 px), `packaging/icon.ico` (16, 20, 24, 32, 40, 48, 64, 128, 256 px entries) |
| Editable source | `packaging/icon.svg`, `icon-foreground.svg`, `icon-monochrome.svg`, `icon-notification.svg`; canonical geometry in `scripts/create-book-icons.cjs` |
| Raster sizes | `packaging/icons/icon-{16,20,24,32,40,48,64,128,256,512,1024}.png` |
| Android 24–25 | Existing `android/res/drawable/app_icon.xml` replaced with legacy book vector |
| Android 26+ | `drawable-anydpi-v26/app_icon.xml` selects separate `app_icon_background` and `app_icon_foreground` vectors |
| Android 33+ | `drawable-anydpi-v33/app_icon.xml` adds `app_icon_monochrome` |
| Notification | `android/res/drawable/ic_stat_nowwhat.xml`, white alpha-only 24 dp silhouette with transparent center seam and Start cutout |

The existing manifest reference `@drawable/app_icon` resolves the version-qualified adaptive resources without a manifest change. Existing Windows build and installer paths already consume `packaging/icon.ico`; web/native image references consume `packaging/icon.png`. This handoff does not edit app ID, signing material, manifest, or application code.

**Implementation integration:** notifications should use `setSmallIcon(R.drawable.ic_stat_nowwhat)`. The concurrent implementation chat has already made that change in the shared working tree; it is outside this icon-only commit. Confirm it is included in the final implementation commit and device test.

## Reproduce and verify

Run `node scripts/create-book-icons.cjs` (or `powershell -File scripts/create-icons.ps1`) from the repository. Requires existing `@playwright/test` and Microsoft Edge; no dependency or lockfile change. The generator derives SVG and Android vector paths from one geometry table, rasterizes at native output sizes, writes PNG-backed multi-resolution ICO, and creates the mask/size review image.

Run `node docs/deployment/book-icons-2026-11-12/verify-icon-assets.cjs`. It validates ICO entries byte-for-byte against PNGs, their dimensions, and samples every foreground path against the safe circle. Results/hashes are in `asset-verification.json`.

The initial shadow exceeded the safe circle by 0.146 dp; reduced the adaptive artwork from 0.16 to 0.156 scale and centered at 14.064 dp translation. Final maximum sampled radius is **32.318 dp**, within the **33 dp** safe radius of the centered 108 dp canvas. Figma masters were adjusted to match. Android guidance: [adaptive icon layers and safe zone](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).

Final checks passed:

- Windows ICO decoded with Pillow: all nine entries present; PNG is 512×512 RGBA.
- 16/24/32/48 px artwork and circle/rounded/squircle crops visually inspected. Central book remains recognizable; smallest sizes intentionally do not rely on bookmark or page-line detail.
- Figma native-size review inspected; vector bindings and caption fonts verified; no flattened icon image layers.
- Android Build Tools 35 `aapt2 compile --dir android/res` and resource `link` with the existing manifest and android-35 platform passed after the safe-zone correction. Resource table contains base, `anydpi-v26`, `anydpi-v33`, foreground, background, monochrome and notification entries.

These are resource compilation and design checks, not physical Android launcher/notification acceptance or an installer test. Actual APK/Windows packaging, isolated-window tests, and user acceptance are owned by the implementation chat. No push or release publication performed.
