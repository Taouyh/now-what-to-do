# Web pins and descriptions — Figma synchronization

2026-11-09, Asia/Shanghai. **PASS for bounded editable web-design synchronization, screenshot inspection and structural/action read-back.** Final product source: `6ef3a6012c137e693784dbc6da2159ca34ef372e`. This replaces the initial `94e1538` reference after the editor heading's full-width centering fix.

## Isolation and evidence

- Separate GPT chat and worktree: `C:/Users/fengcai/.codex/worktrees/3114/now-what-to-do`, branch `codex/web-pin-figma-sync`. Product files were not edited. Only this report and `figma-sync.json` are committed; no push, master merge or native package build.
- Read the deployment guide, current implementation/release evidence, development rules, previous sync reports and actual TypeScript/CSS. Used figma-use and figma-generate-design.
- Before file access, whoami matched handle `3966592487`, email `3966592487@qq.com`, user ID `1698571271826901612`. File `EUoXZR1hDJUUPVAtrDxpE5`, page `49:243`, session `8b7c0f9f-757a-4a5b-ab99-3ab63b19dfbf`.
- No Code Connect files were found. The subscribed team-library searches returned no matching task-book, pin or paper-slip assets. Existing local paper, icons, text families, light ink variables and capsule components were reused.
- Built final fixed source successfully with `npm run build:web`. Rendered it in fresh Edge contexts at 1600×1000: Chinese, English and Japanese × light/dark × tasks/editor/timer/completion/completion editor = 30 source captures. Synthetic data only.
- Parent chat reported final independent web PASS and report commit `a0f28f823db00e8c4c95a6c5814817b6b084508e`. Those tests are not tests rerun by this Figma chat.

## Editable delivery

| Delivery | Figma node | Scope |
| --- | --- | --- |
| Existing C task book | [151:3405](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3405), [151:3813](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3813) | Pin controls on all 14 existing sample rows; original task/edit/start actions retained |
| Pinned ordering example | [408:6136](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=408-6136) | Draw moves from fourth to first; remaining tasks retain order; filled pin returns to the original order |
| Timer, default expanded | [71:1045](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=71-1045) | Five timer states updated; centered summary and readable description; click toggles the description variable |
| Editor headings | [151:4148](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4148), 151:4235, 234:4153, 234:4227 | Four existing add/edit overlays use full-content-width centered headings |
| Completion paper entry | [408:6441](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=408-6441) | Visible completion example; four original continuation groups also updated in place |
| Existing rounded save/cancel | [205:4085](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=205-4085) | Existing capsule shapes, dimensions and business actions preserved |
| Three languages × two themes | [408:5894](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=408-5894) | Editable changed-control comparisons, including task pins, timer notes, editor heading/input and continuation paper entry |
| Reusable pin and row assets | [406:6114](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=406-6114), 408:5897, 408:5913 | Six pin variants and two reusable task-row components; source SVG paths, editable text properties |

Android and Windows-specific delivery frames were not edited. Existing task examples keep their historical 14-item dataset; the independent product captures use a separate 12-item synthetic dataset.

## Verification

- Pin hit area 36×36, SVG 20×20; exact two source paths imported as editable vectors. Pinned background and filled head match the implementation; light and dark colors are represented.
- Actual product task/completion paper is 530.0625×63.921875. New comparison rows and completion example use those dimensions. Timer summary is 530.0625×48; editor comparison heading/input width is 520.03125. Existing editor overlays retain their historical body width while centering across that width.
- Timer heading at x196.0625/y471 and body at y527 match the measured source geometry. The default expanded variable is true; 18 existing start-action sequences now initialize it true. Summary toggles are the intentionally changed interactions.
- Seven final composition screenshots were inspected: task book, pinned order, timer, editor overlay, completion entry, preserved continuation editor and six-case comparison board. Corrections addressed comparison-index wrapping and the completion example's clipping parent. Passing screenshots were not repeated without further changes.
- The 18 inspected roots contain 2,711 descendants, including 500 text nodes and 261 instances. The full 134 image-fill inventory is recorded in JSON. Images are inherited environment/paper textures, not screenshots of complete interfaces; no full-UI raster was uploaded or inserted.
- All inspected text families are Noto Serif SC, Noto Sans SC or EB Garamond, matching the corresponding CSS Variable families. Continuation action weight is 600 through the variable font axis. No font-family mismatches were found.
- Original page-wide reaction fingerprints cover 113 pre-existing top-level objects: 102 are byte-for-byte unchanged. For the remaining 11, reversing only the recorded description-default/toggle changes, new pin nodes and paper-hover additions reproduces all original fingerprints. The expiry state's new description toggle accounts for its additional action. Thus no unrelated original reaction change was detected.
- All eight original save/cancel instances remain 236×44 with radius24. Their ON_CLICK fingerprints remain `5fc9a6ef` for Save and `6928f224` for Cancel.
- Pin/unpin example links were read back as `406:6137 → 408:6136` and `408:6205 → 151:3405`. Completion entry `408:6532` links to the existing continuation editor `205:4085`. Original continuation business clicks remain attached, alongside paper-hover reactions.

Complete node IDs, source measurements, image hashes, component references, reaction fingerprints, screenshot paths and SHA-256 hashes are in [figma-sync.json](figma-sync.json). Screenshots remain local and ignored under `.cache/figma-web-pin/`; the final comparison screenshot is `figma-408-5894-final.png`, ordering is `figma-408-6136-final.png`, and completion is `figma-408-6441-final.png`.

## Bounded acceptance

This is a design synchronization, not full prototype-player click or native acceptance. Only the Draw task has a wired sorting before/after example; other pin components demonstrate visual toggling, not arbitrary multi-pin sorting, pagination, focus restoration or persistence. The comparison board covers changed controls in six language/theme combinations, not six complete app flows.

Existing screen shells, unrelated historical details and editable paper silhouettes/curls remain; they are not claimed to be whole-screen pixel-identical to the current browser. The existing continuation editor remains the reference for rounded Save/Cancel. Real input, saved data, refresh and multi-pin behavior belong to the implementation and its independent web tests. Android device/IME, Windows packaging, upgrades, participants and full B/C prototype acceptance remain outside this delivery.
