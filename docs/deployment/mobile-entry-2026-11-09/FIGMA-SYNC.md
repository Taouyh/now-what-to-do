# Android entry Figma synchronization

2026-11-09, Asia/Shanghai. **PASS for bounded editable-design synchronization, screenshot inspection and structural read-back.** Fixed product source: `296b906029114fbdc838f1ebd197f21ed5310677`. This is not Android-device/IME, upgrade, participant or full B/C prototype acceptance.

## Isolation and source

- Separate GPT chat and clean worktree: `C:/Users/fengcai/.codex/worktrees/cbbe/now-what-to-do`, branch `codex/mobile-entry-figma-sync`, created at the fixed source. Only this report and `figma-sync.json` are committed. No product edits, push, merge or package build.
- Read deployment stage guide, current IMPLEMENTATION, release/validation evidence, development rules and relevant source CSS/markup. Earlier mobile-fit reports remain historical evidence.
- Before design access, Figma whoami matched handle `3966592487`, email `3966592487@qq.com`, user ID `1698571271826901612`. File `EUoXZR1hDJUUPVAtrDxpE5`, page `49:243`, session `8eec11c7-bd0e-4f28-bc44-d9720ea71a31`.
- Used figma-use and figma-generate-design. No Code Connect files found. The subscribed team library returned no matching mobile activity-dialog/close assets; existing local book, paper, buttons, icons and variables were reused.
- Visual source: this candidate's independent `.cache/mobile-entry-independent/` screenshots and final `results.json` in worktree `09f0`. Read final independent report commit `c5ed2fc`: build, 13/13 browser tests, three-language bounded probes and supplied APK inspection passed. These are the tester's results, not tests rerun by this sync chat. The initial asynchronous-close probe failure is superseded by the tester's documented final run.

## Delivered states

| State | Figma node | Result |
| --- | --- | --- |
| Empty library, 360×800 | [392:5701](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=392-5701) | Title at y=154, book at y=84; top-aligned welcome with 48px onboarding padding and existing column margin |
| Empty calendar, 360×800 | [392:5748](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=392-5748) | Start CTA centered at x=180 above pager dash; CTA bottom324.5, pager top336.5 |
| Add activity, 360×800 | [393:5746](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=393-5746) | Flow header, 44px close, body and visible footer |
| Add activity, 360×360 | [393:5930](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=393-5930) | Contracted viewport example; no keyboard artwork; scrolling body and fixed footer |
| Existing edit activity, 800×360 | [379:5620](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=379-5620) | Updated in place to the same flow-header structure; existing actions retained |

Four new examples are adjacent top-level frames. [Scope annotation](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=395-5852) records the fixed source and acceptance boundary. The existing mobile component area `374:5366` contains one new reusable [44×44 close component](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=391-5701). No desktop design was edited.

## Verified geometry and editability

- Normal and contracted 360px dialogs: title x40..268/y30..76; close x276..320/y31..75; input x40..320/y95.20..145.20. Title and close are siblings in a horizontal auto-layout header; input belongs to the separate scroll body. Independent product input y=95.1875, within 0.02px.
- Landscape editor: title x62..686/y30..76; close x694..738/y31..75; input begins y111.04 (independent source111.03125). No close/input overlap.
- Normal footer y470..514; short/landscape footer y286..330. Short body y84..274, height190, `VERTICAL` overflow and clipping; content heights353.2/390. Cropped body content is intentional scrolling, not a cropped action.
- Modal-open brand uses opacity0 while retaining the32px header frame, matching CSS visibility:hidden without collapsing layout. Closed empty-library/calendar examples use opacity1. Figma does not execute native close-and-restore behavior.
- Five screens contain 428 descendants: 94 TEXT, 62 INSTANCE, 153 FRAME, 20 GROUP, 90 VECTOR and 9 RECTANGLE. All image fills were read back, including screen roots: they are reused environment/paper textures, never whole-interface screenshots. Full inventory is in [figma-sync.json](figma-sync.json).
- Fonts explicitly checked: Noto Serif SC, Noto Sans SC and EB Garamond match the CSS Variable families. Critical title, close, input/button and pager-label bounds fit their containers.
- Five final screenshots were visually inspected against this candidate's reference screenshots. One targeted correction preserved the hidden header's occupied space and aligned the new calendar/body details. Local final PNG paths and SHA-256 hashes are recorded in JSON; PNGs remain ignored under `.cache/figma-entry/`.

Original action read-back was unchanged across the edited landscape root and four reused source roots:51 nodes with reactions. FNV-1a before/after summaries: `379:5620=c0578784`, `376:5829=ee26296a`, `376:5950=2b99cc51`, `104:4256=6986e043`, `270:4257=dabbdcbb`. The new empty-calendar CTA navigates to the new empty-library frame, and their corresponding new tabs are connected. These are API read-backs, not prototype-player click verification.

## Limits

This is a small Chinese-state design update, not a full language/state matrix. Existing editable paper curls and the historical landscape form-body details remain illustrative rather than pixel-identical. Draft text is synthetic. The new add/edit fields, close and save/cancel controls show layout; they do not simulate native input, draft persistence, business saving or real IME. Native close/brand restoration was checked by the independent browser tester, not demonstrated as a new Figma business flow. Actual Android-device/IME and full B/C participant/prototype acceptance remain incomplete. No Windows package was changed.
