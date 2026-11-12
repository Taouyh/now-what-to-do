# Always-on sound — independent targeted verification and Figma sync

2026-11-11, Asia/Shanghai. Fixed source and report parent: `3fd496890e9bf03e94a651ec396b5967c993401a`. Separate GPT chat and isolated worktree `c1d5`; dependencies reused through a junction to the main worktree. No product source edits, push, merge, release or website publication.

The user correction supersedes the earlier sound-toggle requirement: remove Sound, request one sound automatically at the round deadline, ignore legacy mute preferences, preserve no-repeat/no-replay/screen-off continuation, and retain Android vibration control. **The scoped verification passed with no new product findings.**

## Independent checks

- `npm run build:web`: passed, including TypeScript checking, from the fixed commit.
- `node --test tests/reminders.test.cjs`: **9/9 passed**. Covers legacy muted foreground audio, one-shot delivery, background/sleep/close continuation, consumed rounds, permission ordering and independent vibration preferences.
- `BOOK_TEST_PORT=8913 npx playwright test tests/e2e/startup-reminders.spec.ts`: **3/3 passed** in new Edge contexts. This is an independent rerun of the requested focused suite, not the full project suite.
- [Additional targeted browser probe](independent-probe.cjs), production build on **8914**, fresh nonpersistent Edge contexts and synthetic data: **web, Windows bridge stub and Android bridge stub passed**. No personal profile or real native notification was used. [Measured results](probe-results.json).

The additional probe confirms `#reminderSound` is absent from all three DOMs; vibration is visible and changeable only with Android capability. An actual file-input import and confirmation of a backup containing `preferences.reminders.sound:false` preserves that stored value yet still produces exactly one foreground chord (three oscillator notes). Windows/Android bridge payloads request `sound:true` on start and background scheduling. Subsequent lifecycle return, reload of the consumed round, and return after an expired background round produce no new audio. Background continuation and elapsed-time capping are also covered by the 9 reminder tests.

The desktop footer contains only the no-sync note, left-aligned at x=196.0625; its size remains 530.0625×35.1875. Android at 320×568 retains vibration on the left and no-sync on the right in a 256×39.1875 footer at (32,322). The prior three-case E2E includes the small-screen import visibility check. Native bridges and AudioContext are instrumented for assertions; this proves application requests and consumption, not audible OS delivery.

For reproduction, run from the repository root after building: `node docs/deployment/always-sound-2026-11-11/independent-probe.cjs`. The script starts/stops its own 8914 server and uses `.cache/always-sound/` for captures/results. Its initial draft used an obsolete task-button selector and timed out; after selecting the actual `.task-play` UI, all three scenarios passed. No product fix was necessary.

The main implementation window reported 153 Node regressions passed. This independent window reran only the 9 relevant Node checks and scoped browser checks above.

## Figma delivery

Verified account handle/email `3966592487` / `3966592487@qq.com` before file access. Session `7793d16b-9f5f-447d-9980-8f86c1172b1b`, file `EUoXZR1hDJUUPVAtrDxpE5`, existing page `49:243`. Applied the figma-use and figma-generate-design skills. The existing six local footer components were authoritative; the scoped team-library footer search returned no replacement. No new page or replacement full-screen design was created.

| Current editable target | Result |
| --- | --- |
| [Chinese web settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9433) | Sound removed; no-sync note at left; 1600×1000 preserved |
| [English Windows settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-9791) | Sound removed; no-sync note at left; 1600×1000 preserved |
| [Chinese Android settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-10154) | Vibration retained, unchecked; 360×640 preserved |
| [English Android settings](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=457-10398) | Vibration retained, unchecked; 320×568 preserved |
| [Six footer variants](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=474-9870) | Web/Windows plus Chinese/English Android and dark Chinese/Japanese Android updated |
| [Behavior and validation notes](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=458-9870) | Automatic sound, legacy mute override, no replay and verification limits documented |

Updated component IDs: `474:9772`, `474:9780`, `474:9788`, `474:9799`, `474:9810`, `474:9821`. Their **10 existing instances** reflect the deletion. Removed six sound groups and the two now-empty desktop preference containers. Preserved footer widths/heights, remaining editable text, checkbox vectors, existing tokens and instance links. Android keeps its no-sync note right-aligned; desktop matches the source's left-aligned note after the hidden preferences container disappears.

Readback and visual inspection of the four settings screens, variant board and notes passed: no sound checkbox/label in the current footer components or instances, no empty desktop control, retained Android vibration, and no clipping introduced in the affected areas. [Compact mutation/readback audit](figma-audit.json) records the exact scope. Edits were restricted to these current components/instances and related notes/names. Historical 1.4.1, superseded panels, startup and time-up frames were not targeted; no full historical acceptance audit is claimed. Existing font substitutions and minor baseline differences remain as documented in the previous sync.

This report supersedes the sound-toggle and right-aligned desktop-footer conclusions in `../startup-reminders-1.4.2-2026-11-11/FIGMA-SYNC.md`; that report remains historical evidence.

## Rebuilt native artifacts and limits

The main window rebuilt the same source under `D:/code/now-what-to-do/dist/native-preview-1.4.2-sound/`. This independent window checked the actual files:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Windows Setup | 13714063 | `368815D2BCF3028E2DEAF300B3FA5D6AD1F20C3EF60EACB0BAC68481B5363229` |
| Android APK | 11958018 | `A59F4ECA64397F6AFE6AE4238369BA5338129357920B6408400F0827F92DA93C` |

The independently built `dist/web/app.js`, Windows `webview2-unpacked/web/app.js`, and APK ZIP entry `assets/app.js` all hash to `37EC495A4DBCD21BCEB75D764F514A100D75A76246B5B1CB1682D3036D62F8C7`. Windows comparison is against the accompanying unpacked payload; the installer was hashed, not installed/extracted here.

No native application was run in this window. Earlier native lifecycle tests remain earlier evidence and are not reclassified as validation of this rebuilt package. Real Android screen-off delivery, sound/vibration, permissions and notification taps; real Windows scheduled toast/protocol activation; physical sleep, volume/DND and installer upgrades remain pending device acceptance. Full B/C prototype and participant acceptance are also not claimed.
