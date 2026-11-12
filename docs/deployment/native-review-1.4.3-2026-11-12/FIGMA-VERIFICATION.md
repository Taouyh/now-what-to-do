# Implementation / Figma verification — November 12, 2026

**Final correspondence verified** against source `a6e9c9e` and the final packages identified in the independent test report. Both originally reported issues are resolved. The existing Figma targets and verified implementation are synchronized at the responsive layout/component level, with the explicit 1–2 px geometry qualifications below. No Figma overwrite was needed.

Independent GPT/worktree: `C:/Users/fengcai/.codex/worktrees/3e31/now-what-to-do`. Figma `whoami` verified handle **3966592487** before accessing the project. Read `figma-design-to-code/SKILL.md`. Access was read-only: design context and fresh rendered screenshots, compared with source callsites, runtime geometry and independently captured browser screenshots. No design node, component, token, reaction or icon was modified.

File: [NowWhat](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5). Visual board [574:10204](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10204). The original source `08cc289` had one last-page row-size mismatch and an editor-settling/calendar-focus defect; both were reported to the implementation chat, which supplied production correction `a6e9c9e8f73f132c86674e105c658fb1643e042f`. This report preserves the original observations rather than editing design to fit implementation.

## Screen and component correspondence

| Figma target | Implementation and verified behavior |
| --- | --- |
| [Home 574:10217](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10217); normal 574:10223, compact 574:10241, long/next-step 574:10259 | `book.ts` mobile book/home structure; `pages.ts` home title/action rendering; `mobile-book.css` utility row, independently translated title, Start and Change. Three explicit geometry fixtures preserve 240×56 Start, 160×44 Change and 20 px action gap; optional next-step content remains visible without collision. |
| [Tasks 574:10288](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10288); sparse 574:10291, full 574:10315, last page 574:10342, compact 574:10366 | Top-aligned strips, separate drag/edit/pin/start targets, actual capacity-based pages and fixed lower pagers. Original last-page rows were 64 px rather than Figma's 72 px. Final correction uses 72 px for sparse/last pages, 64 px on short screens and 52 px in short landscape; capacity uses a separate standard-row metric to avoid page-count oscillation. |
| [Calendar 574:10389](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10389); directory 574:10392, detail 574:10414, empty 574:10438, compact 574:10460 | Directory/detail are separate views with Back. Detail records have transparent backgrounds, zero top/side borders, straight 1 px bottom rule, reserved expansion space and stable x/y/width. Four rows maximum, fewer on short screens. Return keeps the directory page and selected entry; correction preserves that entry's focus across pending viewport/ResizeObserver redraw. |
| [Editor 574:10482](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10482); normal 574:10485, IME 574:10514 | Fixed heading/close and footer, scrolling form body, visible text condition controls, expanded description, opacity-only 100 ms close with no transform. `MobileViewport` keeps the underlying page height stable while the simulated IME changes height; close blurs input and requests native keyboard dismissal immediately. Task page and anchor are retained. The corrected calendar redraw also preserves focus after settling. |

## Geometry qualification

The design reference includes 24 px top and bottom system-bar areas (360×800 / 320×640); the browser checks use 360×752 / 320×592 content areas. Browser measurements exclude system bars. Representative home measurements:

| State | Figma Start x/y/w/h | Runtime x/y/w/h | Runtime Change x/y/w/h |
| --- | --- | --- | --- |
| Normal | 61 / 460 / 240 / 56 | 60 / 438 / 240 / 56 | 100 / 514 / 160 / 44 |
| Compact | 41 / 383 / 240 / 56 | 40 / 358 / 240 / 56 | 80 / 434 / 160 / 44 |
| Long title + next step | 61 / 483.5 / 240 / 56 | 60 / 458.5 / 240 / 56 | 100 / 534.5 / 160 / 44 |

After excluding the 24 px top bar, positions differ by 1–2 px due to border/content sizing and centering; runtime utility/title content widths are 310/270 px versus the design's 312/272 px. These are recorded small geometry differences, not a pixel-identical rendering claim. Main control sizes, hierarchy and independent title movement agree. Localized product headings and user activity/record content are intentionally dynamic. The design board provides light-theme references; dark mode and horizontal layouts were checked for inherited palette, readable controls and functional layout, not against nonexistent dark/landscape frames on this board.

## Static assets and application icons

Visible home static assets are the existing local `nav-home.svg`, `nav-tasks.svg`, `nav-calendar.svg`, `nav-settings.svg` (16×16), `play.svg` (28×28) and `refresh.svg` (24×24), all loaded with nonzero natural size. Paper/environment slots use existing optimized `scroll-paper.webp`/`environment.webp`; task slips use `android-task-paper.png` exported material, not full-interface images. Font/material files and their browser/native package copies were checked by the independent package comparison. Native source PNG SHA-256 for task paper remains `90C1D5334BCA87623D8C9ADDD1B9D69C67438DBF80399C28134545323482D83F`. No new stock/generated illustration or replacement palette was introduced.

Fresh read-only screenshot of [icon board 595:10979](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10979) agrees with the local open-book geometry and native-size preview. Corresponding masters:

- Windows [595:10936](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10936) → `packaging/icon.svg`, PNG and nine-entry ICO.
- Android foreground [595:10952](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10952) and background [595:10976](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10976) → separate adaptive vector layers.
- Monochrome [595:10966](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10966) and notification [595:10971](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=595-10971) → themed icon and alpha-only notification resource.

Actual host/setup PE icon resources match all nine source PNG entries exactly. Actual APK contains the seven source-matching compiled icon XMLs and expected adaptive/monochrome references. Resource verification does not prove how an actual launcher or OS notification renders them.

## Evidence and acceptance boundary

Fresh Figma screenshots are retained under `evidence/figma/`; independently captured final implementation screenshots and geometry are under `evidence/final/`. Full test execution, original defects and final candidate identity are in [INDEPENDENT-TEST.md](INDEPENDENT-TEST.md). The fixed implementation is the synchronization reference; no design change is necessary for these corrections because they restore the existing design.

This is independent implementation/design correspondence verification, not a clickable Figma prototype test or participant acceptance. Figma keyboard area is a system placeholder. Browser IME/Back/lifecycle simulation does not establish OPPO animation quality, physical Android Back, lock-screen sound, real notification tap, launcher-mask display or upgrade retention. Those remain explicit device/user acceptance work.
