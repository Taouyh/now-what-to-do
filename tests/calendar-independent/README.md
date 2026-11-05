# Calendar independent acceptance

These two TypeScript files are archived from the separate GPT test worktree at `C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do`. They use synthetic data and fresh Edge contexts; the original evidence remains in that worktree's `docs/development/book-c-2026-11-05/calendar-independent-evidence*` directories.

Run from the repository root in an isolated worktree with port 8766 free:

```powershell
npm ci --ignore-scripts
npm run build:web
npx playwright test --config tests/calendar-independent/config.ts
```

The report is `docs/development/book-c-2026-11-05/CALENDAR-INDEPENDENT-TEST.md`. This supplemental suite covers selection geometry, light/dark rendering, mobile scrolling, font fallback, the original long-heading reproduction, keyboard access and independent heading/record scrolling. The committed 30-size/language matrix is separately in `tests/e2e/calendar-layout.spec.ts`.
