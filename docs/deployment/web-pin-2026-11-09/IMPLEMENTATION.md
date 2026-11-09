# Web task pins and readable activity details

2026-11-09. Web review candidate only. User confirmation is required before Windows/Android implementation or packaging. Local commits are authorized; push, publication and master merge are not.

## Behavior

- Each task strip has a pin icon before Start. Filled pin means pinned; click again to unpin. Accessible labels and tooltips are localized in Chinese, English and Japanese.
- Pinned tasks precede unpinned tasks. Both groups preserve their original task order. Pinning/unpinning follows the moved task to its resulting page and retains keyboard focus. Edit/save and responsive pagination use the same sorted view.
- Optional boolean `Task.pinned` persists in the existing version-2 data/backup. Missing means unpinned. Invalid non-booleans are rejected on import. A failed write leaves the task state unchanged. Source array order and recommendation ranking remain unchanged.
- Editor descriptions open by default; timer descriptions open for every new session and after reload. Users can collapse the timer description during a session without ticks reopening it. Empty descriptions remain hidden in the timer.
- Activity-description headings in the editor and timer are centered. Completion's “Note where to resume” uses the same paper-slip background, end decoration and hover treatment as task strips, preserving the existing resume-note editor and capsule Save/Cancel actions.

Only shared web source is changed and built in this stage. Existing Windows and Android binaries are untouched; native rollout is deferred until the user confirms the web result. This shared source will be the basis of the later platform builds.

## Validation and delivery

Developer production build/typecheck, focused pin persistence/failure/localization tests (11) and three-language browser scenarios (3) passed. Browser cases cover pinning across pages, multiple pins, refresh, unpin/focus, editor defaults, timer collapse and next-session reset, centered headings and completion-note saving. Full runtime regression and independent fixed-commit browser review follow. Figma synchronization runs in a separate GPT/worktree after code validation, using account 3966592487. No native acceptance is claimed.

Full runtime regression: 142/142 passed. Initial product commit `94e1538d821f79fdeabed6795c9ef294bc331f54` was independently tested; the reviewer caught a real editor-heading alignment defect masked by a computed-style-only assertion. Final product `6ef3a6012c137e693784dbc6da2159ca34ef372e` gives the summary full container width and flex centering. Build and three-language E2E passed again, now asserting actual text-range/container centers within 1px. The independent report records final verification separately from earlier behavioral results.

Local review URL: `http://127.0.0.1:8765/#tasks` (served from rebuilt `dist/web`, HTTP 200 confirmed). No installer was built or replaced. Existing Windows installer SHA-256 remains `6B08CEA74B138C4806C5B788EF98790681D43EB1CE3FC5492AB0C2EFD2EFCF00`; prior Android entry-preview APK remains `69E5E859397F86E8C8CC2156B7B866A1210F414D69580802DF7A9AF15011FD4E`.

Independent verification is PASS; see [INDEPENDENT-TEST.md](INDEPENDENT-TEST.md), original report commit `a0f28f8` (integrated as `d83633a`). It includes real download/import, old-backup compatibility, rejected malformed pin data, failed-write protection, sorted editing/creation/pagination, timer disclosure behavior and paper-slip screenshots. The final title fix was independently rechecked across three languages, light/dark desktop and a narrow web viewport; measured text-center deviations were 0px. This is web acceptance only, not user approval for native rollout.

Figma synchronization is complete in the separate `3114` worktree/GPT chat, with account 3966592487 verified. See [FIGMA-SYNC.md](FIGMA-SYNC.md), original report commit `25a63bd` (integrated as `7fac95c`). Editable task pins, centered/expanded descriptions and completion paper slips were updated; seven final compositions, language/theme comparisons and unrelated action fingerprints were checked. This bounded design check does not claim a complete interactive Figma implementation of arbitrary multi-pin sorting or native acceptance.

Status: ready for user web review. Await explicit user confirmation before Windows/Android follow-up. No push, publication or master merge performed.
