# Web 1.4.3: scoped Figma mapping verification

2026-11-12, Asia/Shanghai. **PASS within the scoped design-mapping checks; no Figma changes needed.**

This separate GPT chat used isolated worktree `7d87` and branch `codex/figma-web-1.4.3-verification`, fixed at `f0b04148d26107bbddaaf72d2684dc78a3698cc4`. The final follow-up `aeae00f2001442b8a27d8126eebd1f765b2b545e` was reviewed with `git show`: it adds the approved book favicon, updates the CSS cache key and versions the assembled JS URL, with no page-layout or runtime change. This report covers that final source. The fresh production build and browser captures below use `f0b0414`; the metadata-only follow-up did not require repeating layout captures.

Read the stage-8 guide, development rules, current implementation document, `always-sound-2026-11-11/VERIFICATION.md`, `book-icons-2026-11-12/README.md`, and `native-review-1.4.3-2026-11-12/FIGMA-VERIFICATION.md`. Used the `figma-use` skill for read-only node inspection. Figma `whoami` verified account handle `3966592487` before project access. Session: `532e384d-7401-478d-a1d6-a8f5859ac5a2`; file: `EUoXZR1hDJUUPVAtrDxpE5`; page: `49:243`.

## Existing mappings

| Target | Result |
| --- | --- |
| [Chinese web settings, 457:9433](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9433) | Current instance `474:9832` uses footer master `474:9772`; only 数据不同步, aligned left. No sound or vibration control. |
| [English Windows settings, 457:9791](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9791) | Current instance `474:9840` uses footer master `474:9780`; only No data sync, aligned left. No sound or vibration control. |
| [Book icon board, 595:10979](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10979) | Existing editable book artwork agrees with approved local PNG/SVG resources. Windows/web master `595:10936` has 14 vectors and no image fills; review board uses linked instances and no raster fills. |
| [Compact home, 574:10241](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10241), [normal home, 574:10223](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10223) | Existing responsive components apply to compact Android/touch browsers as well as native Android. Start 240×56, Change 160×44, gap 20 px remain correct. |

The settings frames/components still carry historical `1.4.2` / `3fd4968` names. These identify the prior automatic-sound delivery, not a stale visible footer; their rendered content is already the required current design. No rename or historical-frame rebuild was necessary.

## Independent evidence

- A scoped Git comparison against released source `900cc3a` found no differences in `src`, `public/assets`, `packaging` or `package.json`, including at final `aeae00f`. The current runtime and resource mappings therefore reuse the previously verified implementation. Promotional videos and README changes are outside those runtime paths.
- `npm run build:web` passed in this isolated worktree, including TypeScript, Vite and assembly. Existing dependencies were reused through a junction; no package or lockfile edits were made.
- Fresh nonpersistent headless Edge contexts rendered Chinese web and English Windows-bridge-stub settings at 1600×1000, plus narrow non-touch web at 390×844. In all three: `#reminderSound` absent; vibration and preference container hidden; no horizontal overflow or page errors. Desktop footer bounds were `(196.0625, 575.921875, 530.0625, 35.1875)`, with the note starting at the same x-coordinate, matching the current component dimensions and placement.
- Independently captured 320×592 and 360×752 touch-browser cases used Android user-agent/touch emulation **without a native bridge**. Both activated `mobile-book`, retained the verified home controls and 20 px action gap, and kept settings import visible. Both settings pages contained only the no-sync note in the footer and no sound/vibration controls; no horizontal overflow occurred. Initial scratch-probe failures were test-fixture issues: an obsolete Change selector and a one-task fixture that intentionally hides Change. After using `#random` and two synthetic tasks, both cases passed; no product correction was made.
- Fresh Figma exports of both desktop settings screens, the icon board and compact home were visually inspected against local browser captures. Existing palette, layout, footer content and book icon agree. The normal/compact home control bounds match the earlier independent native-review measurements: runtime Start at `(60,438)` / `(40,358)` versus Figma `(61,460)` / `(41,383)` before excluding its 24 px top system bar. The existing 1–2 px geometry qualification remains; no new discrepancy was found.
- All three READMEs reference `packaging/icons/icon-128.png` at 88×88 CSS px. A fresh browser loaded that actual source asset at 128×128 intrinsic size and rendered it at 88×88; the open-book silhouette, spine and Start mark agree with the existing icon board. The final favicon URL points to the already approved `packaging/icon.png?v=1.4.3`; no new icon design is introduced.

## Limits and handoff

This is scoped correspondence verification, not a pixel-identical rebuild. Existing font substitutions, texture-rendering differences and the documented 1–2 px mobile geometry differences remain. Dynamic headings/task text differ from illustrative fixtures. Compact touch-web rendering does not grant native notification APIs; Android build-10 control changes are outside this web/Windows mapping check. The Windows scenario uses a bridge stub, not an installed native app.

No historical-screen sweep, Android redesign, repeated promotional-video sync, complete browser regression, native notification test, installer/upgrade check, physical-device acceptance or participant test is claimed. Those remain owned by the relevant independent/release reports. No Figma node, component, token, icon or prototype connection was modified.

Only this report and the compact [figma-verification-audit.json](figma-verification-audit.json) are committed. No product source changes, merge, push, release upload or deployment were performed. Ignored evidence remains under `.cache/figma-web143/`: build output in `dist/web`, browser probes/results, screenshots and Figma comparison captures. The deployment chat may reuse these mappings for final `aeae00f`.
