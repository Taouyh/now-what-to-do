# Independent acceptance scripts

Copied without product changes from the separate GPT acceptance worktree `C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do`. The report is at `docs/development/book-c-2026-11-05/INDEPENDENT-TEST.md`; that worktree retains the original screenshots and traces.

From the repository root on Windows with Edge installed:

```powershell
npm ci --ignore-scripts
npm run build:web
New-Item -ItemType Directory -Force docs/development/book-c-2026-11-05/independent-evidence
npx playwright test --config tests/independent/config.ts
npx playwright test --config tests/independent/defects.config.ts
node tests/independent/conditions.cjs
node tests/independent/file-fallback.cjs
node tests/independent/probe.cjs
```

Keep ports 8766 and 8767 free. These tests create synthetic data in fresh browser contexts. `probe.cjs` produces supplemental measurements/screenshots, not a standalone acceptance verdict. `contact-sheets.py` is an optional image review helper requiring Pillow. Do not replace personal data or reuse a real browser profile. Run new verification in another worktree to retain the original evidence.

The appended `packaging-check.cjs` and `installer-fixture.cjs` archive the Windows artifact-pair checks. They reference the supplied build at `D:\code\now-what-to-do` and must be reviewed and run from an isolated test worktree, after copying its paired Windows artifacts as described in the report. They do not independently compile the Windows installer. Preserve the original artifact hashes and the failed CRLF/LF comparison evidence when reproducing them.
