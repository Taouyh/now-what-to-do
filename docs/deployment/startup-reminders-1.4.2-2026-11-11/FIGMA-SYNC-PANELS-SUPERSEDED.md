# Startup and round reminders 1.4.2 — Figma synchronization

2026-11-11, Asia/Shanghai. Initial fixed source: `9e6f6bb02c4b11c93a0b376c53ce0b34030c4744`; dark-panel/hover follow-up source: `de59c5a920d7b13e4e07fdb1c524e5dd093970a7`. Separate GPT chat/worktree `f12f`, branch `codex/figma-startup-reminders-1.4.2`.

Bounded editable synchronization is delivered. **The previously reported dark reminder contrast defect is resolved and synchronized from `de59c5a`.** The scoped contrast/viewport verification passes; exact platform-font fidelity and the broader acceptance boundaries below remain unchanged. This report does not approve release or native notification delivery.

## Resolved source defect and scoped follow-up

At the initial `9e6f6bb` commit, `src/ui/styles/book.css:290` changed `--ink` to `#f1dfb6` inside the dark book but left `--paper` as `#f1dfb6`. The new `.reminder-panel` used these identical foreground/background colors. Sound, vibration, the native settings button, and explanatory copy became nearly invisible. The summary hover also retained a light background.

Reproduced in a fresh Edge context with Japanese, dark theme, Android user agent, 390×844, and a synthetic native bridge reporting approximate scheduling. The bridge only exposes the real source UI; it does not simulate successful native notification delivery. [Source screenshot](figma-source-dark-defect.png), SHA-256 `B2268306047DA33A6BAE44B434157A0BDF87EB7F65E533A16282BA8527E318FC`.

The user supplied `de59c5a`, which sets the dark panel background to `#503d2c` and shared summary hover to `#b18a5033`. This chat extracted the complete fixed commit to an ignored directory inside the existing worktree, built it successfully with typecheck, and served it on independent port 8900. No tracked product source was changed. The earlier failure screenshot is retained as historical evidence.

Fresh temporary Android Edge contexts verified dark Chinese web UI at 320×568, dark Japanese native UI at 390×844 and 320×568, and the shared hover change in light Chinese UI at 360×640. All three dark panel checks measured **7.809781:1** foreground/background contrast and complete viewport containment. Every hover check returned `rgba(177, 138, 80, 0.2)`. The Japanese 320 panel measured 249.59375×242.75 at (32,87.25); the 390 panel remained 300×223.5625 at (32,106.4375). [Corrected 320-pixel source screenshot](figma-source-dark-corrected.png), SHA-256 `1A2F72D30E7BD53C62BC6FCA821C25BCBCCF56DF42D5148EA7E069863D046223`.

The existing [JA dark component](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9706) is now corrected in place. Added a [320-pixel panel component](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=463-9740) and [dark/hover review board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=463-9755). Four hover components clone only this iteration's summary masters; fills use the existing brass token with explicitly verified 20% opacity. Default summary components remain transparent. Hover examples are static references, with no new prototype business reactions. Updated the interaction notes to mark the defect resolved.

Follow-up `whoami` again confirmed account `3966592487`; session `3b134865-5f68-416e-a288-c11d8e904ab2`. Inspected the source screenshots, corrected panel/hover composition and updated notes. Fixed the review board's row sizing after its first screenshot; the post-fix composition passed with readable, nonoverlapping copy. Read-back reconfirmed all 144 original geometry/text/reaction fingerprints unchanged. New follow-up components and board contain no image fills. Current scoped evidence is in [figma-dark-followup.json](figma-dark-followup.json); `figma-sync.json` remains the historical first-pass snapshot. Only panel colors, corresponding narrow layout, hover examples and the correction notes were updated; timer and startup designs were unchanged. This follow-up does not claim to independently accept the intervening `16efacd` reminder logic changes.

## Editable delivery

Figma `whoami` verified handle `3966592487` before project access. File `EUoXZR1hDJUUPVAtrDxpE5`, existing page `49:243`, session `fcd3b971-0e7d-4f71-9488-ec7e21392065`. All new content is to the right of the previous delivery; no historical page or master was replaced.

| Scope | New nodes |
| --- | --- |
| Chinese web, 1600×1000 | [Settings closed](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9433), [reminders open](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9600) |
| English Windows UI, 1600×1000 | [Settings closed](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9791), [reminders open](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9958) |
| Chinese Android UI, 360×640 | [Settings closed](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-10154), [reminders open](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-10260) |
| English Android UI, 320×568 | [Notifications off, open panel](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-10398) |
| Startup | [1600×1000](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9721), [390×844](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9724) |
| Round deadline | [Time-up, explicit actions](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9727) |
| Interaction and acceptance notes | [Behavior board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9870) |

Four summary components and four light panel components are instantiated in the screens; IDs are in [figma-sync.json](figma-sync.json). Existing paper/leather capsule masters, book shells, navigation icons, paper/environment textures, and ink/brass variables are reused. Library searches for the reminder-settings composite, checkbox and capsule returned no published team assets; no Code Connect source was found. New related controls use auto-layout; panel overlays retain the actual source anchors.

The three closed/open pairs have six new review navigation reactions on the reminder summary. The 320-pixel notifications-off example is a static open state. No sound playback, preference persistence, system settings dialog, notification scheduling, or timer business action is falsely simulated in Figma. Original business interactions remain on their historical screens.

## Behavior represented

- Footer summary opens a compact panel upward over the settings content. Sound is initially checked; vibration is initially unchecked and appears only for Android. Native UI includes the system notification settings action. Web hides both vibration and the native settings action and explains that closing the page prevents system notifications.
- Native copy covers system permissions/Do Not Disturb, notifications off, and potentially delayed lock-screen reminders without exact-alarm access. Japanese long permission text is transcribed on the behavior board and present in the corrected dark components.
- Startup shows `Now What` and `Loading… / 正在打开 / 読み込み中`, then reveals the assembled page. The 2.5-second ceiling is post-mount protection against missing decorations, not a fixed animation duration or universal startup-performance promise.
- A round reaching its deadline remains at `时间到了`, with `继续`, `结束并记录` and `等待期间不计时`. Notifications say `这一轮时间到了` / `Time is up for this round` / `今回の時間になりました`, not that an activity is completed. Only explicit actions extend or record. Background, lock, close and overnight return do not automatically extend a versioned round; missed reminders are silently consumed. Notification activation returns to the current session.

## Validation and limitations

Read only stage 8 and its required source/release context, development rules, this implementation, previous synchronization reports, and actual HTML/JS/TS/CSS. `npm run build:web` passed, including typecheck. Built and served this isolated worktree on `127.0.0.1:8899`; used fresh, nonpersistent headless Edge contexts with synthetic data. The shared dependency installation was reused read-only through this worktree's ignored dependency junction. No personal browser profile, application storage or native installer was accessed.

Captured Chinese web, English Windows UI, Chinese Android 360, Japanese dark Android 390 and English Android 320 closed/open states, plus startup and time-up. Android contexts explicitly use an Android user agent and touch/mobile emulation. Windows/Android bridges are lightweight presentation stubs. Source document width stayed within each viewport. This is source measurement for design synchronization, not a rerun or replacement of the separate 148 Node/13 browser checks reported in IMPLEMENTATION.md.

Inspected complete Figma compositions against source captures. Corrected 320-pixel English navigation/label width, translated copied desktop navigation, and multi-line annotation flow, then inspected their post-fix screenshots. No further unchanged screenshot pass was repeated. The Chinese Android expanded screen was inspected inline. The initial dark failure was subsequently resolved by the scoped follow-up above.

Read-back confirmed all **144 pre-existing top-level subtrees** retain the same geometry/text/reaction fingerprints as before the writes. This includes old settings, timers, task/calendar screens, the drag board `435:6377`, and previous promotional designs. No mutation targeted those old nodes. The audit records each new root's node counts, fonts, image-filled descendants, panel bounds and reactions. The new UI is editable text/frames/instances/vectors; reused image fills are decorative textures. No full-UI screenshot was imported into any deliverable.

The four expanded light panels match measured source outer bounds: web 300×128.375 at (196.0625,455.546875); Windows 300×183.5625 at (196.0625,400.359375); Android 360 panel 280.796875×204.375 at (32,125.625); Android 320 panel 249.59375×223.5625 at (32,106.4375).

Chinese UI fonts resolve to Noto Sans SC / Noto Serif SC, with EB Garamond for the timer. Exact platform-font fidelity is **not passed**: unavailable Segoe UI/system body fonts use Inter, Japanese system body uses Noto Sans JP, and startup Georgia uses EB Garamond with Noto Sans SC for multilingual body fallback. These substitutions affect glyph shapes and line wrapping. The 320-pixel backup label uses a wider text slot to avoid Inter wrapping. Existing shell paper grain/letterforms and native checkbox drawing are approximations. The startup frames are static states; no real image decode or timeout is emulated in Figma.

The local HTML capture workflow was attempted, but automatic approval review rejected capture-script injection and browser launch with only `blocked by policy`. No capture submission occurred and no capture artifact was imported. Work continued through semantic Plugin API reconstruction and local screenshots. No external image-generation credits were used.

No real Android-device notification/lock/reboot test, actual Windows toast activation, native upgrade, participant study, or full B/C prototype-player traversal is claimed. The new six navigation reactions were read back, not traversed in the Figma player. Earlier acceptance gaps remain unchanged.

## Repository handoff

Only this report, machine-readable audits and synthetic before/after dark screenshots are committed. No product source modification, push, merge, native package build or publication. Local ignored evidence remains under `.cache/figma-reminders/`; `final-*` files are initial reviewed post-fix compositions, and `de59-figma-board-final.png` is the reviewed correction board. Initial UI evidence applies to `9e6f6bb`; the dark-panel/hover correction applies to `de59c5a` as specified above.
