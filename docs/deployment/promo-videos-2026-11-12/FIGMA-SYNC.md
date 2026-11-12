# Promotional videos and native release copy: Figma synchronization

Date: 2026-11-12, Asia/Shanghai. Report branch: `codex/figma-promo-videos-2026-11-12`.

## Delivery and source

Updated the six existing English, Chinese and Japanese desktop/mobile introduction frames in place. The main video is now Desktop demo / 电脑版演示 / PC版デモ, followed by Android demo / 安卓版本演示 / Android版デモ. Both have the source's 59-second English narration and English/Chinese subtitle descriptions. The portrait player is centered, 9:16 and at most 360 px wide.

This separate GPT chat used isolated worktree `7d87`, checked out at fixed implementation `e0e266a043d118f1ba1c942f930dfb23bede51ab`. The later authorized native-release copy was read with `git show` from `fedfb1501a9a7b1694baaf4ccbd37db9c77b34cb`, without cherry-picking it or changing product files. Hero eyebrows no longer carry a version; download eyebrows and Windows/Android platform descriptions show 1.4.3. All six existing installation disclosure states now link Release notes to `/releases/tag/v1.4.3`. This does not change or claim a 1.4.3 web application release; the web app remains 1.4.1.

Read the stage-8 deployment guide, development rules, implementation report, preceding promotional Figma report and the relevant `about` source. No earlier-stage guide was opened. Followed the `figma-use` and `figma-generate-design` skills. Figma `whoami` verified handle `3966592487` before file access. File `EUoXZR1hDJUUPVAtrDxpE5`, page `49:243`, session `5e27677e-ee6a-4ddc-9481-2a34da0894b7`.

| Language | Desktop, 1440 px | Mobile, 390 px |
| --- | --- | --- |
| English | [442:6759](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=442-6759) | [444:8363](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-8363) |
| Chinese | [444:7195](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-7195) | [444:8940](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-8940) |
| Japanese | [444:7779](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-7779) | [444:9517](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-9517) |

## Scope and preservation

Kept the six full-page IDs and demo section IDs, including existing navigation destinations. Reused the existing translated text nodes/fonts and promotional color variables. The subscribed team library had no matching promotional video section; no Code Connect file was found. Created two reusable poster components, `604:11058` and `604:11060`, in free canvas space to the right of existing content. Their fills are the unchanged source PNGs `desktop-demo-2026-11.png` and `android-demo-1.4.3-build10.png`; SHA-256 and Figma image hashes are recorded in the audit.

Only the video regions were recomposed into editable auto-layout containers, with real film-cover instances, editable headings, captions and link controls. The obsolete editable 86-second poster instances within those regions were replaced; their source masters and the separate hero/journal previews were retained. Subsequent sections moved down by the added demo height. The native follow-up changed exactly 24 full-page text nodes and six disclosure hyperlink nodes.

Before/after fingerprints verified all 42 non-demo sections: descendant IDs, content, fonts, relative geometry, fills and reactions stayed equal after normalizing the explicitly authorized native text delta. Their heights were unchanged. Header/hero/steps positions stayed unchanged; journal/download/privacy/footer positions shifted only with the demo height. The 179 other pre-existing top-level nodes retained their IDs, names and bounds; the six disclosure link edits are explicitly recorded. Existing app pages, historical designs, menu states and app prototype wiring were not targeted. Full B/C prototype acceptance was not rerun.

## Verification

Rendered the local source in a new headless Edge process with fresh nonpersistent contexts at 1440 and 390 px, selecting English, Chinese and Japanese through the language menu. Loaded fonts and decoded preview images before capture. For the follow-up, the local server served `about/index.html` and `about/about.js` directly from `git show fedfb15`; all other files came from the fixed checkout. This compared final source without modifying the worktree's implementation or using a personal browser profile.

- All six final browser layouts had no horizontal document overflow. Final full-page Figma exports were compared with browser captures; changed video and native-copy regions were also inspected at readable scale.
- All eight visible source video-copy items per frame matched; no old 86-second, 1:26 or no-voiceover copy remained in the six demo regions. Both editable control links show `0:00 / 0:59`.
- Desktop video geometry is 1200 × 675; mobile is 350 × 196.875. Android geometry is 360 × 640 on desktop and 350 × 622.21875 on mobile. Player placement and demo section heights match measured source geometry.
- Corrected desktop Japanese heading wrapping, translated narration-label wrapping and save-link alignment after the first comparison. Final changed-region text had no horizontal viewport overflow, visible clipping or overlap.
- Each player poster, control label and save link targets its corresponding finished MP4 under `https://taouyh.github.io/now-what-to-do/about/assets/`. Native follow-up read-back passed all 30 intended text/link changes, including six 1.4.3 release-note links.
- Each desktop page has 427 descendants. Mobile counts are 421 English, 420 Chinese and 421 Japanese. Each has 17 image-filled descendants: two discrete film covers plus retained preview textures. No flattened webpage capture was imported. Node-type counts, every image-filled descendant, affected IDs, URLs and preservation evidence are in [figma-audit.json](figma-audit.json).

## Fidelity and acceptance limits

The videos are **static original film covers with MP4 links**, not native Figma playback. The cover artwork and burned-in captions are raster media assets; surrounding website text, controls, hierarchy and existing product previews remain editable. Browser-native controls, loading spinners, playback, audio, timing, subtitle animation and download behavior are not simulated or newly acceptance-tested here. Browser captures showed native loading indicators with `preload="none"`; these are intentionally absent from the static cover.

Preserved the previously documented font substitutions: EB Garamond for Latin headings, Inter for system body/control text, Noto Sans/Serif SC and JP for CJK. Font-family read-back matches those existing design choices. Platform system-font fidelity remains unmet; glyph shapes and some inherited line breaks differ, including the Japanese mobile Windows row. Existing hero/journal reconstruction differences remain. This is scoped synchronization, not a pixel-identical rebuild.

The desktop film represents the shared desktop web interface; the Android film uses build-10 UI assets. Neither establishes Windows-native capture, physical Android-device acceptance, upgrade compatibility or participant acceptance. This task did not publish or verify the live website, native Release or installers.

## Repository handoff

Only this report and `figma-audit.json` are committed. No product source changes, cherry-pick, merge, push, release upload or installer publication were performed. The report covers the video implementation at `e0e266a` and the authorized promotional native-copy delta at `fedfb15`.

Ignored scratch evidence is in `.cache/figma-promo-videos/`: fresh-browser captures/geometry, final Figma exports, full-page and focused comparison sheets, before-state fingerprints and assembly/audit scripts. The current `source-*`, `figma-*`, `full-*` and `native-review-*` images reflect the final native-copy update. Historical project acceptance gaps remain unchanged.
