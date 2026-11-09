# Web manual task ordering

2026-11-09. Web-only review candidate. Local commits permitted; no push, publication, master merge or Windows/Android package update. User confirmation is required before native follow-up.

- Task strips have a left grip. Drag with a mouse or pointer/touch from the grip; a preview follows the pointer and a line marks before/after the target row. Editing, pinning and Start remain separate controls.
- Pinned tasks remain first. Manual ordering is allowed within pinned or unpinned groups; dropping across the boundary leaves order and pin status unchanged and explains why.
- Hover Previous/Next for 650ms to change one pagination spread, then move onto a task to choose its insertion position. Leave/reenter a pager to turn again. Pointer capture belongs to the stable list container, so rebuilding visible rows does not end the drag.
- Drop commits once, follows the moved task to its resulting page and focuses its grip. Escape, pointer cancellation, loss of capture/window focus, resize, navigation or release outside a valid row cancels without a write. Arrow Up/Down on a focused grip moves it within its group, including across pages.
- Optional `preferences.taskOrder` is an array of unique nonempty task IDs in existing version-2 backups. Old data without it uses the original task order. Newly added tasks append after manually ranked tasks; stale IDs are harmless and normalized on the next move. Pin/unpin preserves manual rank. Source `tasks` array order is never changed, so recommendation ordering is unaffected. Invalid order fields are rejected on import; failed writes preserve stored and in-memory state.

## Developer validation

Production build/typecheck passed. Node regression: 144/144 passed, including ordering persistence, backup validation, pin boundaries, new tasks and failed writes. Browser: 4/4 passed (three existing localized pin/description tests and a real-pointer drag scenario covering column/page moves, reload, Escape, pin boundaries, keyboard and separate edit/start clicks). The initial browser run was interrupted before a final result; the explicit single-worker rerun completed successfully. No native test or build performed.

Next: independent GPT fixed-commit browser/profile verification, then bounded Figma synchronization in a new worktree with account 3966592487. These stages do not constitute user approval for native rollout.
