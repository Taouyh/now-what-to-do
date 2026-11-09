# Web controls — Figma synchronization

2026-11-09, Asia/Shanghai. **PASS for bounded editable synchronization and static screenshot/structural verification.** Fixed product commit: `b8b887871fa4c9f1325a2aabb88b2cee22cf30ab`.

## Isolation and source

- Separate GPT chat/worktree: `C:/Users/fengcai/.codex/worktrees/0c39/now-what-to-do`, branch `codex/web-controls-figma-sync`. Product files unchanged. No push, master merge, publication or native build.
- Followed deployment guide, development rules, release context, this iteration's implementation note and previous web-pin synchronization. Used figma-use and figma-generate-design. No Code Connect files found; capsule library search returned no assets. Reused the existing local compact-navigation capsule component and focus-action instances.
- Before file access, whoami verified handle `3966592487`, email `3966592487@qq.com`, user ID `1698571271826901612`. File `EUoXZR1hDJUUPVAtrDxpE5`, page `49:243`, session `bc222b46-0039-4d8e-b227-e951b737f337`.
- `npm run build:web` passed, including typecheck. Rendered the fixed build at 1600×1000 in isolated headless Edge contexts, synthetic data only: Chinese/English/Japanese × light/dark × tasks/import/expired = 18 final captures. Expired captures use an explicit finished timer fixture and open the floating timer. These are design references, not a substitute for the parallel independent behavioral test.

## Editable updates

| Target | Delivery |
| --- | --- |
| [Task pages 1–2](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3405), [3–4](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3813), [pinned ordering](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=408-6136) | Hide the three continuation-title layers; right-align Add; second-spread Add label now matches the first. Pins, guidance and pagination remain. |
| [Import overlay](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=114-3620), [import example](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-6815) | Cancel then Confirm in one horizontal auto-layout row. Four instances reuse `342:4343`; radius24, height44, equal widths222 within the existing 456-wide historical body. The actual current browser's wider body produces width254.015625, represented exactly in the control comparison. |
| [Expired timer](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=71-1566) | Continue and End/save both use the existing primary brown gradient, width259.03125 × height48, gap12 and radius6. Existing expiry actions retained; the old Continue icon is hidden to match source text-only buttons. Expanded description retained. |
| [Bounded comparison](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=422-6274) | Six small editable control strips, not six full scenarios. Import: 取消/确认, Cancel/Confirm, キャンセル/確認する. Expiry: 继续/结束并记录, Resume/End and save, 再開/終了して記録. Light/dark capsule instances and exact measured button dimensions. Static comparison actions intentionally cleared. |

The deliverable uses editable instances, text and auto-layout; no screenshot was inserted into Figma. All changed labels use the existing Noto Serif SC family corresponding to the source Variable family. Original unrelated screen shells, task sample data and historical overlay text/layout remain; this is not whole-screen pixel equivalence.

## Verification and limits

- Five Figma screenshots inspected: import overlay, original task page, pinned-order page, expired timer and six-case comparison. Labels are readable, action pairs equal, title removal visible, Add right-aligned, pin examples retained. All six source import/expiry pairs were also inspected in a contact sheet; computed geometry/colors and labels are in JSON.
- Corrected final count: **119 pre-existing top-level objects, 117 byte-identical reaction fingerprints**. The two changed roots are the import overlay/example, where button component swaps inherit capsule hover behavior and wrapper order changes. All other originals, including timer, task pages, pin components and default-description interactions, have identical fingerprints.
- Import business wrapper read-back: `114:3637 → 114:3679` (swap), `114:3639` (close), `111:7026 → 111:7226` (navigate), `111:7029` retains six conditional actions. These wrappers were reparented without editing their reactions. Pin/unpin remains `406:6137 → 408:6136`, `408:6205 → 151:3405`.
- No Figma prototype-player real clicks were performed. Runtime hover/variant transitions, keyboard focus, actual import/cancel, timer extension/recording, pagination and arbitrary pin persistence are not certified by these static checks. The six-case board is a static comparison. Complete B/C prototype traversal, participant testing, Android device/IME, native packages and upgrade acceptance remain outside this delivery.
- Two oversized read calls and one rejected attempt to retain an inherited hover reaction during a component swap produced no committed canvas changes. The successful swap retains the new capsule's inherited hover behavior and original business wrappers.

Evidence: [figma-sync.json](figma-sync.json) records source measurements, affected IDs, component references, fonts, reaction hashes and action targets; [screenshot-hashes.json](screenshot-hashes.json) records local screenshot SHA-256 values. Screenshots remain ignored under `.cache/figma-web-controls/`; no remote expiring asset URLs are committed.
