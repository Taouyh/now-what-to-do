# Android layout review — awaiting approval

2026-11-11, Asia/Shanghai. **Draft wireframes only.** The user requires wireframe approval before Android visual design, code changes or a new APK. No application source was changed in this task. Windows packaging is delivered separately in `../windows-review-2026-11-11/RELEASE.md`.

## Review links

- [Now/home: default, compact and long-name layouts — added November 12](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=516-10138) · [preview](home-wireframes.png)
- [Complete editable Figma board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-9796)
- [Tasks: sparse, full, second page and small screen](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-9820)
- [Calendar: today, activity details, empty and small screen](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-10173)
- [Add activity: keyboard states and closing behavior](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-10341)
- November 12 revised previews: [Tasks](tasks-top-aligned.png), [Calendar](calendar-top-aligned.png), [Add activity and closing](editor-close-review.png)
- [November 11 historical review image](wireframes.png)

Verified Figma account handle `3966592487` before project access. Session `efb45b4b-0625-4fbc-b08e-4a89c5f59425`. Created a separate, clearly named DRAFT board on existing page `49:243`; existing approved visual screens/components were not modified. Gray fills describe structure, not an approved color or visual redesign. The ten screen frames are static editable wireframes, not a functioning phone or executable prototype.

## Proposed layout

**Now/home (added and revised 2026-11-12).** The latest user correction is to raise only the task name. Start, Change, time, current conditions and existing next-step text must remain at their original positions. The earlier whole-group movement has been reverted. Keep the two-line task-name reservation and existing control sizes; the space between the name and the following content increases, while the Start-to-Change gap stays unchanged. The review includes 360×800 default, 320×640 compact, and 360×800 long-title/next-step states. These are reference sizes, not measured OPPO viewports.

The home extension reuses the prior wireframe shell, navigation, gray variables and existing Start/Change/capsule components. Its original session was `420dc164-465c-4c9e-b4ab-79a89fd3bdf4`; the original creation contained 55 editable text nodes, 47 frames, 20 instances, 8 vectors and one local reusable action-group component, with no image-filled nodes. The title-only revision adds three independently positioned editable text nodes. Text families remain Noto Sans SC and Noto Serif SC. `home-figma-audit.json` preserves the creation audit; `home-title-position-audit.json` records the current geometry. `add-home-wireframes.js` reproduces the updated design-only extension. The earlier `wireframes.png` remains the November 11 snapshot; `home-wireframes.png` now shows the title-only correction.

### Home title-only correction — November 12

Account `3966592487` was verified with whoami before access. Session: `735a8f94-63e8-41e8-9176-5f8f0b2b6240`. Changes are confined to the three home draft states and explanatory text. No task, calendar, editor, or approved visual frame was changed.

| Reference state | Original title top | Name moves up | Final title top | Start Y before = after | Change Y before = after |
| --- | ---: | ---: | ---: | ---: | ---: |
| Default 360×800 | 364 px | 32 px | 332 px | 460 px | 536 px |
| Compact 320×640 | 287 px | 20 px | 267 px | 383 px | 459 px |
| Long title + next step 360×800 | 346.5 px | 28 px | 318.5 px | 483.5 px | 559.5 px |

Coordinates above are relative to the phone frame. The original group top/height values are restored to 364/222, 287/216 and 346.5/257 px. The live default group's 222 px height differed from the original 216 px audit and is preserved. All three keep the 76 px two-line name reservation, 240×56 Start control and 160×44 Change control. The two buttons retain their 20 px gap. Time/conditions stay at y=130 with height 44 px; the long-state next-step text stays at y=442.5. No card fill or border was added.

AbsoluteBoundingBox Y checks also match exactly: default Start 932→932 and Change 1008→1008; compact 855→855 and 931→931; long state 955.5→955.5 and 1031.5→1031.5. The next-step text remains 914.5→914.5. These compare with the live measurements at the beginning of this task, before the now-reverted group movement.

Figma does not allow overriding child auto-layout positioning inside these instances. The three existing instance title layers are therefore hidden while their original 76 px title + 20 px gap are preserved as flow space. Three editable title text layers sit independently in the surrounding focus areas; button components and existing next-step text retain their positions. Only the name-to-following-content gap changes (52/40/48 px in the three states). This is a static draft arrangement, not an application implementation.

`adjust-home-title.js` is the idempotent correction for the existing nodes. The original `home-optical-center-audit.json` is marked superseded, and the whole-group correction script was replaced. Current bounds, title IDs and absolute button-position evidence are in `home-title-position-audit.json`.

The updated 1676×1226 screenshot was inspected: all three phone states show complete task titles, next-step text and controls within the viewport, with clear separation below the fixed utilities. No physical-device, browser interaction or user acceptance is claimed. The updated screenshot is `docs/deployment/android-wireframes-2026-11-11/home-wireframes.png`.

This home layout still awaits user approval before visual or code changes. The correction was handed off to the existing Figma design chat, as requested. No application code, installer, APK or published site was changed; this handoff requires no additional chat.

**Tasks (revised November 12).** Keep the app brand and four navigation tabs. Give the task page the remaining usable viewport. All task lists start at the top of the content area, including short lists and a partially filled last page. Leave unused space below the list. Align each name, pin and Start control vertically within its row. Keep Previous/Next in a stable bottom area, clear of the system inset. More activities use true pagination; the examples show six rows at 360×800 and four at 320×640. Actual capacity must use available height, font size and safe insets. Preserve pinning, dragging, editing and starting. Do not add a visible task page counter or “任务·续页”. Keep the current page/anchor when dismissing the editor.

**Calendar (revised November 12).** Keep “今天” and “记录明细” as separate directory/detail views inside the Calendar tab. The entry shows today's date, aggregate count/duration and activity names. Activity and session lists both start at the top; a partially filled page is not vertically centered. Selecting an activity opens its full-page details with a “返回” control. The examples show four session rows; timestamps stop at minutes. Each row reserves a secondary line for plan/pause/extension information, so expanding it does not change the row width or move the pager. Returning preserves the directory selection/page. Empty-state text also starts at the top; “去开始” remains horizontally centered directly above the bottom pager. Existing desktop two-page layouts are outside this proposal.

**Add activity.** Keep the title and a full 44×44 close target in a fixed top row, with Add/Cancel fixed above the keyboard. Only the form body may scroll as available height shrinks. Activity description remains expanded by default and its title is centered. Do not show the brand behind/through the editor heading. The keyboard graphic is a labeled system placeholder, not a reproduction of a particular IME.

**Close behavior.** On X/Cancel, blur the input and request IME dismissal together; dismiss the panel immediately with at most an approximately 120 ms opacity fade. Remove the mobile vertical squash/roll-away effect. Keep the background task layout stable while the IME animates, then perform a bounded pagination reflow after the viewport settles. Do not delay dismissal until after a keyboard animation, restart the closing animation on every resize, or lose the current task page. Reduced-motion users get an immediate close. These are proposed implementation requirements, not fixes already made.

### November 12 task/calendar/editor review revision

The user requested this wireframe revision before checking it and authorizing visual design. Account `3966592487` was verified; Figma session `b75d31e2-bf64-4ad0-b99d-fe0c0b04933a`. The existing draft board and component instances were retained. Eight content containers now use top alignment, and both detail-page controls read “返回”. The editor notes explicitly specify concurrent blur/IME dismissal, 0–120 ms opacity-only closing, stable background layout until the viewport settles, and preservation of the page/task anchor. This mobile proposal is distinct from the desktop C scroll animation.

The four task examples and four calendar examples were measured: the first content child is at local y=0 in every container. Bottom pager Y remains 603 px in the 360×800 examples and 443 px in the 320×640 examples, relative to the single-page frame. Row sizes, gaps, touch targets, and existing home layouts were retained. Screenshot review of all three affected sections passed with complete labels and controls. The full board, including the previously added home section, contains 286 text nodes, 272 frames, 5 components, 137 instances and 76 vectors; no image-filled UI nodes or unexpected fonts were found.

`revise-top-aligned-wireframes.js` records the targeted Figma edit; `top-alignment-audit.json` contains changed IDs and before/after measurements. The three new section previews above supersede the corresponding November 11 screenshots. These remain static editable wireframes: no app code, visual design, APK, IME behavior or device performance was changed or validated. Await the user's review of this revision before proceeding to visual design.

## Device report and diagnosis boundary

User phone: **OPPO Reno 10 Pro 5G**. User reports the IME sits below the Add activity panel; when closing, the keyboard slides down first, then the panel slides away choppily. Android/ColorOS/IME versions and actual CSS viewport are not yet measured. 360×800 and 320×640 are reference viewports, not claimed exact device dimensions.

Read-only source inspection found `src/ui/styles/book.css` has a 240 ms discrete modal opacity/display transition plus `translateY(18px) scaleY(.08)` on closing. The mobile editor height also depends on `100dvh`. `closeActivity()` hides the panel, updates inert state and restores focus; task capacity uses ResizeObserver. This combination can involve resizing and repainting during keyboard dismissal and is consistent with the report, but no physical trace proves the root cause. No performance fix or frame-rate improvement is claimed yet.

## Validation and next gate

The final board contains 231 editable text nodes, 224 frames, 4 local components, 117 instances and 68 vectors; no image-filled UI nodes. It reuses existing capsule, drag, pin, start and close components with draft overrides. Calendar rows and navigation were componentized locally. Text uses the product's Noto Sans SC / Noto Serif SC families; no unexpected font family was found. Composition screenshot review caught and corrected task-name vertical alignment and an incorrectly enabled Next button in the four-record example. The final screenshot was inspected for readable labels, intact controls and small-screen fit.

The board is built and refined by the adjacent design-only scripts; `figma-audit.json` preserves target IDs. These scripts are not imported by the application. API writes are transactional: two initial creation attempts rolled back because instance-relative positioning and nested-frame NAVIGATE links were unsupported; the successful output uses capsule auto-layout and documented static transitions. Original designs were not replaced.

**Required user decision:** review this revised wireframe: (1) top-aligned task lists with true pagination, (2) separate Calendar directory/detail views with top-aligned content and “返回”, and (3) keyboard-safe editor with immediate short-fade dismissal. Proceed to visual design only after the user confirms this wireframe; this revision does not authorize application implementation or a new APK. Carry forward the already-implemented no-Sound-toggle and screen-off-deadline behavior into the eventual APK. After a separately authorized implementation, test a fixed commit independently, then ask the user to verify IME open/closed dismissal, repeated Add/Cancel, short/full lists, rotation/back behavior and screen-off timing on their phone. Real OS reminder and upgrade acceptance remain pending.
