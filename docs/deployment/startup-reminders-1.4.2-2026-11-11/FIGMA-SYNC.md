# Startup and automatic round reminders 1.4.2 — final Figma synchronization

2026-11-11, Asia/Shanghai. Final fixed source: `c9a7ad658e05f1d207cd1a2493d8720efb589288`. Separate GPT chat/worktree `f12f`, branch `codex/figma-startup-reminders-1.4.2`.

The current editable designs now show sound directly in the settings footer (default on), Android-only vibration (default off), and the no-data-sync note on the right. The reminder entry, expanded panel and system-notification settings button are removed from the four current settings screens. Timer reminders are automatic; the behavior notes describe the corresponding platform and deadline rules.

This report supersedes the panel-based design conclusions in the [preserved previous report](FIGMA-SYNC-PANELS-SUPERSEDED.md). The earlier audits and dark-panel screenshots remain historical evidence, not current requirements.

## Current editable delivery

Account `3966592487` was verified before project access in the final session `7263b892-1273-4fbc-8f93-4c51a40858e7`. File `EUoXZR1hDJUUPVAtrDxpE5`, existing page `49:243`.

| Scope | Current design |
| --- | --- |
| Chinese web, 1600×1000 | [Settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9433) |
| English Windows UI, 1600×1000 | [Settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9791) |
| Chinese Android UI, 360×640 | [Settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-10154) |
| English Android UI, 320×568 | [Settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-10398) |
| Six footer variants, including Chinese/Japanese dark Android at 320 | [Final footer board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=474-9870) |
| Updated behavior and validation notes | [Notes](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9870) |
| Preserved startup | [1600×1000](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9721), [390×844](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9724) |
| Preserved time-up screen | [Explicit actions](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9727) |

Six new footer components use editable text, frames and checkbox vectors, with instances in the screens and review board. Existing paper/leather capsule masters, book shells, navigation icons, decorative textures and applicable color variables are reused. No full-UI screenshot was imported.

Eighteen earlier nodes from this 1.4.2 iteration, including open-panel screens, summary/panel components and the dark/hover correction board, are retained with a `SUPERSEDED by c9a7ad6` name. Their old reminder navigation reactions were removed. Current settings screens and final footer components have no stale panel navigation reactions. The checkboxes show static defaults; Figma does not simulate preference persistence or OS notification behavior.

## Final behavior represented

- No manual reminder-enable step. Starting a timer schedules its reminder automatically.
- Android requests notification permission once, as required by the OS, on the first explicit start/resume. System permissions and Do Not Disturb still apply. No standalone system-notification settings button is shown.
- Screen-off does not pause the running round. It continues to its deadline, then stops with `时间到了`, `继续`, `结束并记录` and `等待期间不计时`. Only an explicit action extends the round or records it.
- A consumed marker prevents duplicate reminders across foreground, background and reopening. Notification activation returns to the current session. Notification copy announces the round deadline, not activity completion.
- Startup frames remain unchanged. The 2.5-second ceiling is post-mount protection against missing decorations, not a fixed animation duration or a universal startup-performance guarantee.

These behaviors are documented from the fixed implementation and parent handoff; the design itself does not verify OS scheduling or delivery.

## Verification

The complete fixed commit was extracted into the ignored `.cache/figma-reminders/c9a7-source` directory. `npm run build:web` passed, including typecheck. Dependencies were reused read-only through a junction. The isolated build was served on port 8901 with fresh nonpersistent headless Edge contexts and synthetic data; no personal profile or application storage was used.

Six source scenarios passed the scoped checks: Chinese web and English Windows at 1600×1000; Chinese Android at 360×640; English Android, dark Chinese Android and dark Japanese Android at 320×568. All confirmed absence of `#reminderSettings`, `.reminder-panel` and `#enableNotifications`, sound checked, vibration unchecked and shown only for Android, and no horizontal document overflow. Android contexts used an explicit Android user agent and mobile/touch emulation. Native bridges were presentation stubs.

Measured footer bounds were 530.0625×35.1875 at (196.0625,575.921875) on desktop, and 296/256×39.1875 at (32,322) on mobile. The mobile backup section begins at y=361.1875 after panel removal. The editable components follow these outer bounds, 18-pixel checkboxes, 6-pixel label gaps and 12-pixel group gaps. The no-sync note remains right-aligned. Minor text-baseline differences remain because of font substitution and Figma layout.

Inspected the four final screen screenshots, six-variant board and updated notes against source captures. The [final Japanese dark source screenshot](figma-source-footer-final.png) records the narrow case. Machine-readable evidence, affected node IDs, final text/font inventories and hashes are in [figma-footer-final.json](figma-footer-final.json).

Final read-back confirmed **all 144 original historical top-level subtrees** retain the same geometry/text/reaction fingerprints. The **three startup/time-up roots** also match their pre-final-edit fingerprints. The 18 superseded nodes each have zero prototype reactions. No historical 1.4.1 target was edited. New footer components and review board contain no image fills; reused image fills in current full screens are decorative environment/paper textures.

The parent implementation chat reported **152 Node and 13 focused browser checks passed**. This chat did not independently rerun those suites. Its acceptance is limited to the build and source/design synchronization checks above.

## Limitations and handoff

Exact platform-font fidelity is not passed: unavailable Segoe UI/system body fonts use Inter, Japanese system body uses Noto Sans JP, and startup Georgia uses EB Garamond with Noto Sans SC fallback. Chinese text uses Noto Sans SC / Noto Serif SC. Native checkbox rendering and existing paper/letterform details remain approximations. No real Android notification, screen-off, reboot, Windows toast activation, native upgrade, participant study or full B/C prototype-player acceptance is claimed.

Only Figma and deployment documentation/evidence changed. No tracked product source modification, push, merge, package build or publication was performed. Earlier audits `figma-sync.json` and `figma-dark-followup.json` remain unchanged. Local source captures and Figma review screenshots are retained in the ignored `.cache/figma-reminders/` directory.
