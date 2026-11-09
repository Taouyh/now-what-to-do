# Web task drag ordering — Figma synchronization

2026-11-09, Asia/Shanghai. **PASS for bounded editable synchronization, screenshot inspection, font/geometry checks and original-action read-back.** Fixed product source: `debf26c44f805a3a5471e4104fe3937416dcc1f1`.

## Isolation and source

- Separate GPT chat/worktree: `C:/Users/fengcai/.codex/worktrees/c9e8/now-what-to-do`, branch `codex/figma-web-drag-sync`, created at the requested fixed SHA. Only this report and its JSON evidence are committed. No product changes, push, master merge, publication or Windows/Android package changes.
- Read the stage-8 guide, development rules, release/validation context, this iteration's implementation, prior web-controls/web-pin synchronization, and actual task-reorder TypeScript/CSS. Used figma-use, figma-generate-design and scoped figma-generate-library reconciliation.
- Before design access, whoami verified handle `3966592487`, email `3966592487@qq.com`, user ID `1698571271826901612`. File `EUoXZR1hDJUUPVAtrDxpE5`, page `49:243`, session `138f8ab2-59af-4f5d-b96b-4f40b70b5c53`.
- No Code Connect files found. The subscribed team-library task-book and drag-handle queries returned no assets. Reused local paper, pin, Start, typography and light muted-ink assets. Added only two exact-source SVG grip components.
- Built the fixed source with `npm run build:web` successfully, including typecheck. Served this worktree on port8897. Fresh headless Edge contexts rendered six1600×1000 captures: Chinese light/dark × default/drag/sorted, with synthetic data only. Both drag captures were visually inspected; measurements record the normal/drag geometry and resulting order. These source captures support design synchronization, not full independent acceptance.

## Editable delivery

| Target | Change |
| --- | --- |
| [Task pages1–2](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3405) | Added10 left28px grip instances; moved each existing edit/name region right without replacing business-action nodes. |
| [Task pages3–4](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3813) | Added4 grips to the existing populated rows. Preserved empty-page content and pagination. |
| [Pinned-order example](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=408-6136) | Added10 grips; retained Draw first, filled pin and original pin/unpin navigation. |
| [Light task-row component](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=408-5897), [dark component](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=408-5913) | Reconciled in place to horizontal grip, number/name edit container, pin and Start. Existing six language/theme comparison rows inherit the update. |
| [Bounded state board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=435-6377) | Six compact, editable three-row examples: default, dragging and sorted × light/dark. Shows a fixed guitar-before-drawing move, pinned task retained first, preview, insertion line, faded source and restored grip focus. |
| [Light grip](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=434-6301), [dark grip](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=434-6304) | Exact source SVG path in reusable28px components;16×24 icon. Light strokes reuse the existing muted-ink variable. |

The state board documents same-pin-group ordering,650ms pager hover, leave/reenter for another page, Arrow Up/Down including page boundaries, and cancellation without writes. It is a fixed visual storyboard, not an arbitrary interactive reorder/persistence implementation. Existing component hover/pin visual reactions are inherited; no new sorting business reactions were invented.

## Verification

- Inspected five final Figma compositions: both original task spreads, pinned order, the six-state board and the prior six-language/theme control board affected through component reuse. The first state-board screenshot revealed wrapped index digits and low-contrast dark Start icons; a targeted component fix and one post-fix screenshot passed. No further screenshots repeated unchanged results.
- Source and reusable-row dimensions:530.0625×63.921875. Grip28px; edit region413.0625px at x28; pin36×36 at x441.0625; Start44×44 at x477.0625; right inset9px. Preview240×49.59375, padding12, radius5. Insertion line530.0625×3; dragged source opacity0.45.
- Figma's EB Garamond index uses a30px slot to prevent digit wrapping, compared with the source's measured22.09375px text width. Therefore the reusable-row title begins about8px farther right. This is a documented font-metric accommodation, not exact whole-screen pixel parity. Original screen shells and historical14-task sample data remain.
- All1498 descendants across the seven inspected roots/components were inventoried, including283 text nodes. Fonts are exclusively Noto Serif SC, Noto Sans SC and EB Garamond, with the source-equivalent variable weights; zero unexpected families. The new board has397 descendants,73 text nodes and90 instances. Image fills are inherited paper/environment textures; no full-UI screenshot was uploaded or inserted.
- **All121 pre-existing top-level reaction fingerprints are unchanged.** This includes task editing, Start, pagination, timers, imports, native-specific frames and prior pin behavior. Pin/unpin read-back remains `406:6137 → 408:6136` and `408:6205 → 151:3405`. Continuation-title nodes `151:3649`, `151:4057` and `408:6209` remain hidden; Add remains right-aligned.
- One oversized read-only result exceeded the tool response limit; no canvas edits were committed by that call. The narrowed hash-based read succeeded. No mutation recovery or product repair was needed.

## Acceptance boundary

The parent chat reported independent final PASS at the same `debf26c` product commit:144 unit tests,4 E2E tests, real cross-page mouse/keyboard ordering, cancellation with zero writes, storage failures, export/import, six language/theme long-name layouts and narrow CDP touch. Independent report commit `aa409561`, integrated there as `7d3030f`. Those behavioral checks were communicated by the parent, not rerun as the independent test in this Figma chat.

No Figma prototype-player click traversal, dynamic drag/pager/keyboard execution, arbitrary sorting persistence, participant acceptance, complete B/C traversal, native-device or upgrade acceptance is claimed. Windows/Android-specific frames and packages were not edited.

Evidence: [figma-sync.json](figma-sync.json) contains created/mutated IDs, exact source measurements, fonts, image-fill inventory, final geometry, preserved action hashes and screenshot SHA-256 values. Local screenshots remain ignored under `.cache/figma-web-drag/`; final state board is `figma-435-6377-final.png`. Expiring asset URLs are not committed.
