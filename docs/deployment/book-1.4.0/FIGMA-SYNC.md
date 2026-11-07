# Introduction webpage Figma synchronization

Date: 2026-11-07 (Asia/Shanghai).
Fixed source: `e2c66b800d505f4328df0a0ffe256019bd7216eb`.
Report branch: `codex/figma-introduction-1.4`.

## Result and scope

Delivered editable desktop and mobile introduction designs for `about/index.html` and `about/about.css`, covering the English hero, book preview, three steps, 77-second demo, journal, downloads, privacy and footer. A separate expanded installation disclosure contains the source instructions and release-notes link. The original app prototype and original reference poster were preserved.

- [Desktop 1440](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=367-4469), 1440 × 4369.56.
- [Mobile 390](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=367-5014), 390 × 3633.53.
- [Expanded installation disclosure](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=367-5561), 511.625 × 237.6.
- [Editable source components](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=366-4399).
- [Preserved original reference poster](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=360-4380).

The active Figma handle was verified as `3966592487` before file access. The same-task Figma session `cc25b499-1ce6-4e4c-ac7f-84c631f03ce9` was reused.

## Source and visual verification

Read the deployment guide, release report, development rules and the fixed candidate's HTML/CSS. Used a new branch in this separate worktree. The assembled production introduction in `D:/code/now-what-to-do/dist/site/about/` matched the candidate's HTML and CSS after CRLF/LF normalization.

Rendered that assembled page in isolated headless Microsoft Edge contexts at widths 1440 and 390. Awaited the local fonts and explicitly decoded both content images before the final source captures. Both source layouts had no horizontal overflow. No existing personal browser profile was used; the product captures contain synthetic examples.

Measured section boundaries from the rendered DOM and reproduced them in semantic auto-layout sections. Created nine local component masters: the editable book and journal previews, four CTA sizes/styles, two step layouts, and one download row. Repeated content uses instances and text properties. Six scoped CSS color variables bind the introduction colors. No applicable landing-page component, download component, button, paper variable or EB Garamond text style was returned by the subscribed team-library search; no unrelated UI library was added. No Code Connect file was found for the required source elements.

Compared full desktop and mobile Figma composition screenshots with the browser captures. Fixed mobile shadow overflow by clipping to the viewport and widened its copyright text box to keep one line. The separate installation screenshot exposed overlapping auto-height text; explicit paragraph heights fixed it. Inspected the corrected disclosure and post-fix full compositions. No visible clipping or overlap remained. The final mobile composition is 390 pixels wide. The final structural audit found no visible content outside either viewport and no visible Chinese text.

The original rotated `Choose` label `361:4485` was inspected at -90 degrees and was legible within its tab. Its clone remains editable in the new preview. The new home preview uses “15 min,” “Read a few pages,” and “Begin on this page.” The journal preview uses the source capture's two-session reading example and English labels. Only cloned preview layers were translated or adjusted.

## Editability evidence

Counts exclude each wrapper itself and include instance internals and hidden cloned states. Counts alone are not the editability criterion: the hierarchy and every image-filled node were also inspected.

| Descendant type | Desktop | Mobile |
| --- | ---: | ---: |
| Frame | 144 | 146 |
| Text | 102 | 102 |
| Instance | 22 | 22 |
| Rectangle | 15 | 15 |
| Group | 52 | 52 |
| Vector | 194 | 194 |
| **Total** | **529** | **531** |

Each main frame has 14 text hyperlinks for navigation, calls to action, video access, downloads, source and license links. The expanded disclosure has four editable text nodes. The source-components container has 374 descendants and nine component masters.

The complete page and the product previews are represented by editable hierarchy, text, vectors and component instances. No complete-UI screenshot, browser capture or flattened poster was imported. Existing raster fills are the environment, bookmark, paper and activity-strip textures reused from the original product layers.

### Image-filled node inventory

All 44 image-filled descendants are listed below; dimensions are rounded to two decimals. The preview instance fills are environment textures with editable product layers above them, not flattened UI images.

| View | Node ID | Role | Type | Width × height |
| --- | --- | --- | --- | --- |
| Desktop | `367:4491` | Editable home book preview | INSTANCE | 1200.00 × 750.00 |
| Desktop | `I367:4491;366:4406` | Start bookmark texture | FRAME | 99.00 × 63.00 |
| Desktop | `I367:4491;366:4409` | Tasks bookmark texture | FRAME | 99.00 × 54.00 |
| Desktop | `I367:4491;366:4412` | Journal bookmark texture | FRAME | 99.00 × 54.00 |
| Desktop | `I367:4491;366:4415` | Settings bookmark texture | FRAME | 99.00 × 54.00 |
| Desktop | `I367:4491;366:4436` | Left paper vector with texture | VECTOR | 507.00 × 528.53 |
| Desktop | `I367:4491;366:4437` | Right paper vector with texture | VECTOR | 507.00 × 528.53 |
| Desktop | `367:4682` | Editable demo poster | INSTANCE | 1080.00 × 675.00 |
| Desktop | `I367:4682;366:4406` | Start bookmark texture | FRAME | 89.10 × 56.70 |
| Desktop | `I367:4682;366:4409` | Tasks bookmark texture | FRAME | 89.10 × 48.60 |
| Desktop | `I367:4682;366:4412` | Journal bookmark texture | FRAME | 89.10 × 48.60 |
| Desktop | `I367:4682;366:4415` | Settings bookmark texture | FRAME | 89.10 × 48.60 |
| Desktop | `I367:4682;366:4436` | Left paper vector with texture | VECTOR | 456.30 × 475.67 |
| Desktop | `I367:4682;366:4437` | Right paper vector with texture | VECTOR | 456.30 × 475.67 |
| Desktop | `367:4852` | Editable C journal preview | INSTANCE | 672.33 × 420.20 |
| Desktop | `I367:4852;366:4750` | Start bookmark texture | FRAME | 55.47 × 30.25 |
| Desktop | `I367:4852;366:4753` | Tasks bookmark texture | FRAME | 55.47 × 30.25 |
| Desktop | `I367:4852;366:4756` | Journal bookmark texture | FRAME | 55.47 × 35.30 |
| Desktop | `I367:4852;366:4759` | Settings bookmark texture | FRAME | 55.47 × 30.25 |
| Desktop | `I367:4852;366:4601` | Left paper vector with texture | VECTOR | 284.06 × 296.12 |
| Desktop | `I367:4852;366:4602` | Right paper vector with texture | VECTOR | 284.06 × 296.12 |
| Desktop | `I367:4852;366:4634` | Activity paper strip texture | VECTOR | 221.45 × 26.05 |
| Mobile | `367:5036` | Editable home book preview | INSTANCE | 350.00 × 218.75 |
| Mobile | `I367:5036;366:4406` | Start bookmark texture | FRAME | 28.88 × 18.38 |
| Mobile | `I367:5036;366:4409` | Tasks bookmark texture | FRAME | 28.88 × 15.75 |
| Mobile | `I367:5036;366:4412` | Journal bookmark texture | FRAME | 28.88 × 15.75 |
| Mobile | `I367:5036;366:4415` | Settings bookmark texture | FRAME | 28.88 × 15.75 |
| Mobile | `I367:5036;366:4436` | Left paper vector with texture | VECTOR | 147.88 × 154.15 |
| Mobile | `I367:5036;366:4437` | Right paper vector with texture | VECTOR | 147.88 × 154.15 |
| Mobile | `367:5228` | Editable demo poster | INSTANCE | 315.00 × 196.87 |
| Mobile | `I367:5228;366:4406` | Start bookmark texture | FRAME | 25.99 × 16.54 |
| Mobile | `I367:5228;366:4409` | Tasks bookmark texture | FRAME | 25.99 × 14.17 |
| Mobile | `I367:5228;366:4412` | Journal bookmark texture | FRAME | 25.99 × 14.17 |
| Mobile | `I367:5228;366:4415` | Settings bookmark texture | FRAME | 25.99 × 14.17 |
| Mobile | `I367:5228;366:4436` | Left paper vector with texture | VECTOR | 133.09 × 138.74 |
| Mobile | `I367:5228;366:4437` | Right paper vector with texture | VECTOR | 133.09 × 138.74 |
| Mobile | `367:5398` | Editable C journal preview | INSTANCE | 350.00 × 218.75 |
| Mobile | `I367:5398;366:4750` | Start bookmark texture | FRAME | 28.88 × 15.75 |
| Mobile | `I367:5398;366:4753` | Tasks bookmark texture | FRAME | 28.88 × 15.75 |
| Mobile | `I367:5398;366:4756` | Journal bookmark texture | FRAME | 28.88 × 18.38 |
| Mobile | `I367:5398;366:4759` | Settings bookmark texture | FRAME | 28.88 × 15.75 |
| Mobile | `I367:5398;366:4601` | Left paper vector with texture | VECTOR | 147.88 × 154.15 |
| Mobile | `I367:5398;366:4602` | Right paper vector with texture | VECTOR | 147.88 × 154.15 |
| Mobile | `I367:5398;366:4634` | Activity paper strip texture | VECTOR | 115.28 × 13.56 |

## Fidelity limits and acceptance boundaries

- EB Garamond is the verified marketing heading and wordmark font. Source product preview layers retain the product's Noto Serif SC, Noto Sans SC and EB Garamond families. All marketing headings passed the EB Garamond family assertion.
- The webpage body uses the platform system-font stack, which renders with the Windows system face in this Edge environment. Segoe UI was absent from the Figma font inventory and no font-upload tool was available. Inter Regular/Semi Bold is an explicit body-text substitute. Exact system-font fidelity therefore remains **unmet**; the design is not a pixel-identical typography acceptance result.
- The supplied production product screenshots were used as visual evidence. Their editable reconstructions reuse the existing product design and match the English example, but small spacing, letterform, paper and control differences remain. The editable preview is not a raster copy.
- The demo is a static editable poster with visual controls and a video hyperlink. It does not embed or play the 77.013-second video in Figma. Browser-native control rendering and transient loading spinners are not reproduced.
- Navigation and download text link to the intended published destinations. This task did not verify release publication or download availability. The expanded installation state is a separate review frame; browser disclosure animation, hover/focus states, keyboard behavior and Figma click-through parity were not acceptance-tested here.
- This synchronization does not establish participant acceptance, Android-device behavior, Android upgrade safety or complete B/C prototype interaction acceptance.

## Repository delivery

Only this English report is committed. No product code was changed, and no merge, push, deployment or publication was performed. The source candidate remains the fixed release reference. Browser and Figma inspection artifacts and assembly scripts are local scratch evidence in the ignored `.cache/` directory.
