# Now What workflow

Help people with free time choose one feasible activity and start quickly.
Follow these stages in order. Open only the current stage guide and its required inputs.

| Stage | Guide |
| --- | --- |
| 1. Market research | [AGENTS.md](docs/research/AGENTS.md) |
| 2. Product prototype | [AGENTS.md](docs/prototype/AGENTS.md) |
| 3. Product documentation | [AGENTS.md](docs/product/AGENTS.md) |
| 4. UI/UX design | [AGENTS.md](docs/design/AGENTS.md) |
| 5. Technical framework research | [AGENTS.md](docs/technology/AGENTS.md) |
| 6. Technical documentation | [AGENTS.md](docs/technical/AGENTS.md) |
| 7. Development | [AGENTS.md](docs/development/AGENTS.md) |
| 8. Deployment | [AGENTS.md](docs/deployment/AGENTS.md) |

Current stage: 8, deployment authorized on 2026-11-07. Release delivery: `docs/deployment/book-1.4.0/RELEASE.md`. Use C for tasks/calendar and B elsewhere. Preserve v1.3 capabilities unless superseded by the current PRD. Full B/C prototype click verification and participant tests remain incomplete; older stage labels are historical.
Development delivery: `docs/development/book-c-2026-11-05/IMPLEMENTATION.md`; independent results: `INDEPENDENT-TEST.md` in the same directory. Do not infer Android-device, upgrade, or participant acceptance from web tests.
Research delivery: `docs/research/market-2026-11-01/REPORT.md`.
Prototype draft: `docs/prototype/free-time-start-2026-11-01/README.md`.
Product delivery: `docs/product/book-c-2026-11-04/PRD.md`; interactions: `docs/product/book-c-2026-11-04/INTERACTIONS.md`.
Design delivery: `docs/design/free-time-start-2026-11-01/V13-ITERATION.md`.
Latest verified design sync: `docs/deployment/web-drag-2026-11-09/FIGMA-SYNC.md`; earlier reports remain in their delivery directories.
Current native review candidate: `docs/deployment/native-1.4.1-2026-11-09/RELEASE.md`. User authorized Windows/Android packages and a new independent test worktree on 2026-11-09. Local commits only; no push, publication or master merge. Deliver tested installers for user acceptance.
Web source and verified design: `docs/deployment/web-drag-2026-11-09/IMPLEMENTATION.md`.
Release introduction design sync: `docs/deployment/book-1.4.0/FIGMA-SYNC.md`.
Use Figma account `3966592487` for this project. Verify the active account before accessing project designs in each Figma session.
After interface or interaction changes are finalized, open a separate GPT chat in a new worktree to synchronize the affected Figma pages or components with the verified implementation.
Framework: `docs/technology/book-c-2026-11-05/FRAMEWORK.md`.
Technical delivery: `docs/technical/book-c-2026-11-05/TECHNICAL.md`; workflow: `WORKFLOW.md`; independent-window testing: `TEST-HANDOFF.md` in the same directory.
After implementation, require a separate GPT window to test a fixed commit in an isolated worktree/profile before merging `design/minimal-ui` into `master`. Preserve existing uncommitted changes; do not rebuild the repository or rewrite history without a concrete reason.
After research, establish [development](docs/rules/development.md), [product](docs/rules/product.md), and [design](docs/rules/design.md) rules.
Earlier artifacts are background, not approved requirements. Preserve existing user changes.
Keep every AGENTS.md short and in English. This workflow applies only to this repository.
