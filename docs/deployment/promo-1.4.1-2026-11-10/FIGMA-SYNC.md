# Promotional page 1.4.1 Figma synchronization

Date: 2026-11-10, Asia/Shanghai. Fixed implementation: `8d64eb148f634ee6b4631c440a3774bc3ac683ac`. Report branch: `codex/figma-promo-1.4.1`.

## Delivery

Synchronized the current promotional webpage into six editable full-page designs, six expanded language-menu review states, and six translated installation disclosures. The English default, Chinese and Japanese copy, rounded navigation controls, dark selected language, release links, 1.4.1 labels, pin/reorder description, updated journal example and 86-second demonstration are represented.

The work ran in a separate GPT chat and isolated worktree, checked out at the fixed implementation before editing. Figma `whoami` verified handle `3966592487` before project access. File `EUoXZR1hDJUUPVAtrDxpE5`; session `26616b18-4237-4df7-848a-6dcc129f3f7e`; existing page `49:243`.

| Language / width | Full page | Menu open | Installation expanded |
| --- | --- | --- | --- |
| English / 1440 | [442:6759](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=442-6759) | [445:9385](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=445-9385) | [447:9421](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=447-9421) |
| Chinese / 1440 | [444:7195](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-7195) | [445:9411](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=445-9411) | [447:9427](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=447-9427) |
| Japanese / 1440 | [444:7779](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-7779) | [445:9437](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=445-9437) | [447:9433](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=447-9433) |
| English / 390 | [444:8363](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-8363) | [445:9463](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=445-9463) | [447:9439](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=447-9439) |
| Chinese / 390 | [444:8940](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-8940) | [445:9488](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=445-9488) | [447:9445](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=447-9445) |
| Japanese / 390 | [444:9517](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=444-9517) | [445:9513](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=445-9513) | [447:9451](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=447-9451) |

All additions are in a bounded 1.4.1 area to the right of existing designs. Existing 1.4.0 promotional frames, source masters, original poster, app book screens, pages and prototype connections were retained. No mutation targeted original app or historical promotional nodes. New preview masters `441:6720` and `441:6897` are scoped copies; new navigation master is `442:6757`. The original nodes were read back successfully in the final audit.

## Source comparison and validation

Read the deployment guide, required development rules, preceding release and independent verification reports, preceding promotional Figma report, and current `about/index.html`, `about/about.css`, `about/about.js` and `tests/promo-141.cjs`. No earlier-stage guide was opened.

Rendered this worktree's source using an ephemeral local HTTP server and fresh nonpersistent headless Edge contexts at 1440 and 390 pixels. Used the existing Playwright installation read-only; no personal browser profile or app storage was accessed. Loaded the local heading font, made lazy images eager for capture, decoded both images, selected each language through the webpage menu, and captured closed and expanded states. All six source layouts had document width within the viewport. This was source measurement and visual comparison, not a rerun of the separate independent browser acceptance suite.

Measured DOM bounds supplied section sizes, spacing, navigation placement and responsive ordering. Related content uses auto-layout, with explicit overlays for decorative or absolutely positioned elements. The current team library returned no matching introduction-page or language-menu component; no Code Connect files were found. Reused the existing six promotional color variables and cloned editable product structures. No unrelated library was introduced.

Verification results:

- Every full-page design contains all 47 visible source marketing text items, compared after whitespace normalization and the disclosure marker. Six comparisons returned no missing copy. Installation paragraphs are provided in the separate translated states.
- Final full-page screenshots for all six layouts were inspected against browser captures. Corrected short English link wrapping, the English mobile headline's three-line break, and preview positioning. Inspected the final screenshots after those corrections; no visible marketing-text overlap or clipping remained.
- All six language-menu screenshots were inspected. Language control precedes See it work, options share the rounded outline, and exactly the current language has a dark fill. The 390-pixel header wraps navigation beneath the wordmark as implemented. The Japanese mobile installation disclosure was visually inspected as a long-copy case.
- Final structural audit found no visible non-instance marketing node outside any full-page viewport, and no stale `1.4.0`, `77 seconds` or `1:17` marketing text.
- Each full page has 13 external URL targets across text hyperlinks and node reactions. Get the app and both platform rows target `https://github.com/Taouyh/now-what-to-do/releases`. Video links target `/now-what-to-do/about/assets/nowwhat-demo-1.4.1.mp4`; expanded release notes target `/releases/tag/v1.4.1`. Other source/browser/license links remain represented.
- Menu options have review navigation to the corresponding translated full page. Installation summaries navigate to their translated disclosure. The menu boards represent expanded states; hover opening, pointer exit, keyboard dismissal and touch behavior are not implemented or acceptance-tested as a complete Figma interaction simulation. The source intentionally opens on non-touch hover or keyboard, not trigger click/tap. Existing app prototype interactions were preserved by leaving their nodes untouched, not by rerunning full B/C interaction tests.

## Editability and fidelity limits

Each desktop frame has 561 descendants: 182 frames, 100 text nodes, 18 instances, 15 rectangles, 52 groups and 194 vectors. Each mobile frame has 554 descendants, differing only in frame count (175). The shared controls and preview compositions remain editable. Full node, image-fill and URL inventories are in [figma-audit.json](figma-audit.json).

Each full page has 22 image-filled descendants. These are the pre-existing environmental, paper, bookmark and activity-strip textures inside editable preview instances. No complete webpage capture or flattened product UI screenshot was imported into the deliverable.

The new home and calendar screenshots were inspected as source references. Their editable reconstructions retain the reading example and update the journal to November 10, Stretch for a moment, one session, two seconds and 18:05–18:05. The previews use the current 16:9 presentation, but paper texture placement, letterforms, control dimensions and small spacing details remain approximations inherited from the editable design. They are not pixel-identical copies of the supplied screenshots.

English headings and wordmarks use the verified EB Garamond family. The source body uses a platform system stack; Segoe UI was unavailable in the Figma font inventory. Inter is the explicit Latin body substitute. Noto Sans SC/JP and Noto Serif SC/JP are explicit CJK substitutions for platform body/serif fallback fonts. Font-family read-back verified the intended Figma families, but exact platform-font fidelity remains unmet. Some line breaks and glyph shapes therefore differ from the browser; the English mobile heading received a deliberate line break to match the source.

The demo is an editable static poster and video hyperlink with a 1:26 visual duration. No native Figma video playback is claimed. Browser-native video controls, loading spinners, exact system typography and all webpage hover/focus/disclosure animations are outside this delivery's fidelity acceptance. The task did not verify public release availability, video playback, Android devices, native upgrades or participant acceptance.

## Repository handoff

Only this report and the machine-readable audit are committed. No product files were changed; no merge, push, deployment or publication was performed. This report applies only to fixed source `8d64eb148f634ee6b4631c440a3774bc3ac683ac`; later implementation changes require a scoped follow-up.

Local scratch evidence remains in ignored `.cache/figma-promo/`: browser source snapshots and geometry, Figma screenshots, menu/disclosure captures, final comparison sheets, and assembly scripts. Final reviewed renders use the `final-*` prefix. Historical project acceptance gaps remain unchanged.
