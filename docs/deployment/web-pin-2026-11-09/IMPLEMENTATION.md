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
