# Android layout review — awaiting approval

2026-11-11, Asia/Shanghai. **Draft wireframes only.** The user requires wireframe approval before Android visual design, code changes or a new APK. No application source was changed in this task. Windows packaging is delivered separately in `../windows-review-2026-11-11/RELEASE.md`.

## Review links

- [Now/home: default, compact and long-name layouts — added November 12](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=516-10138) · [preview](home-wireframes.png)
- [Complete editable Figma board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-9796)
- [Tasks: sparse, full, second page and small screen](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-9820)
- [Calendar: today, activity details, empty and small screen](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-10173)
- [Add activity: keyboard states and closing behavior](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-10341)
- [Full-resolution review image](wireframes.png)

Verified Figma account handle `3966592487` before project access. Session `efb45b4b-0625-4fbc-b08e-4a89c5f59425`. Created a separate, clearly named DRAFT board on existing page `49:243`; existing approved visual screens/components were not modified. Gray fills describe structure, not an approved color or visual redesign. The ten screen frames are static editable wireframes, not a functioning phone or executable prototype.

## Proposed layout

**Now/home (added and revised 2026-11-12).** The latest feedback is that geometric centering makes the task/action group look too low against the uniform background. Keep time and current conditions in the top utility row; place the group slightly above the remaining area's geometric center, with Start primary and Change directly underneath. Move the whole group without altering its internal spacing, control sizes, or background. Reserve two lines for the task name. Existing next-step text participates in the group's layout. On small screens or with larger text, reduce free space before permitting content scrolling; never hide the primary controls. The review includes 360×800 default, 320×640 compact, and 360×800 long-title/next-step states. These are reference sizes, not measured OPPO viewports.

The home extension reuses the prior wireframe shell, navigation, gray variables and existing Start/Change/capsule components. Its original session was `420dc164-465c-4c9e-b4ab-79a89fd3bdf4`. It contains 55 editable text nodes, 47 frames, 20 instances, 8 vectors and one local reusable action-group component, with no image-filled nodes. Text families are Noto Sans SC and Noto Serif SC. `home-figma-audit.json` preserves the original creation audit; the latest positions below supersede its original bounds. `add-home-wireframes.js` reproduces the updated design-only extension. The earlier `wireframes.png` remains the November 11 snapshot; `home-wireframes.png` now shows the optical-center correction.

### Home optical-center correction — November 12

Account `3966592487` was verified with whoami before access. Session: `735a8f94-63e8-41e8-9176-5f8f0b2b6240`. Only the three home focus-area containers and six explanatory text nodes changed. No task, calendar, editor, or approved visual frame was changed.

| Reference state | Live group top before | Move up | Final group top | Preserved group height | Final bottom |
| --- | ---: | ---: | ---: | ---: | ---: |
| Default 360×800 | 364 px | 48 px | 316 px | 222 px | 538 px |
| Compact 320×640 | 287 px | 28 px | 259 px | 216 px | 475 px |
| Long title + next step 360×800 | 346.5 px | 48 px | 298.5 px | 257 px | 555.5 px |

Coordinates are relative to the phone frame. The live default group's 222 px height differed from the original 216 px audit and was deliberately preserved. All three keep the 76 px two-line name reservation, 20 px inter-item spacing, 240×56 Start control and 160×44 Change control. Time/conditions stay at y=130 with height 44 px. No card fill or border was added to the action groups.

The flexible focus area keeps center alignment with 96 px additional bottom padding on the 800 px references and 56 px on the compact reference. This shifts the group up by half that padding while retaining auto-layout. The reproduction script interpolates the offset from 28 to 48 px across these reference heights; this is a wireframe layout rule, not implemented responsive code. Before/after geometry and unchanged internal layout are recorded in `home-optical-center-audit.json`. `raise-home-wireframes.js` is an idempotent correction for the existing nodes and does not recreate them.

The updated 1676×1226 screenshot was inspected: all three phone states show complete task titles, next-step text and controls within the viewport, with clear separation below the fixed utilities. No physical-device, browser interaction or user acceptance is claimed. The updated screenshot is `docs/deployment/android-wireframes-2026-11-11/home-wireframes.png`.

This home layout still awaits user approval before visual or code changes. The optical-center correction was handed off to the existing Figma design chat, as requested. No application code, installer, APK or published site was changed; this handoff requires no additional chat.

**Tasks.** Keep the app brand and four navigation tabs. Give the task page the remaining usable viewport. Center a short set of activities within the main content area; align each name, pin and Start control vertically. Keep Previous/Next in a stable bottom area, clear of the system inset. More activities use true pagination; the examples show six rows at 360×800 and four at 320×640. Actual capacity must use available height, font size and safe insets. Preserve pinning, dragging, editing and starting. Do not add a visible task page counter or “任务·续页”. Keep the current page/anchor when dismissing the editor.

**Calendar.** Replace the stacked mobile “今天” plus “记录明细” regions with a directory/detail flow inside the Calendar tab. The entry shows today's date, aggregate count/duration and activity names. Selecting an activity opens its full-page details with a “返回今天” control. The examples show four session rows; timestamps stop at minutes. Each row reserves a secondary line for plan/pause/extension information, so expanding it does not change the row width or move the pager. Returning preserves the directory selection/page. An empty day shows “去开始” centered directly above the bottom pager. Existing desktop two-page layouts are outside this proposal.

**Add activity.** Keep the title and a full 44×44 close target in a fixed top row, with Add/Cancel fixed above the keyboard. Only the form body may scroll as available height shrinks. Activity description remains expanded by default and its title is centered. Do not show the brand behind/through the editor heading. The keyboard graphic is a labeled system placeholder, not a reproduction of a particular IME.

**Close behavior.** On X/Cancel, blur the input and request IME dismissal together; dismiss the panel immediately with at most an approximately 120 ms opacity fade. Remove the mobile vertical squash/roll-away effect. Keep the background task layout stable while the IME animates, then perform a bounded pagination reflow after the viewport settles. Do not delay dismissal until after a keyboard animation, restart the closing animation on every resize, or lose the current task page. Reduced-motion users get an immediate close. These are proposed implementation requirements, not fixes already made.

## Device report and diagnosis boundary

User phone: **OPPO Reno 10 Pro 5G**. User reports the IME sits below the Add activity panel; when closing, the keyboard slides down first, then the panel slides away choppily. Android/ColorOS/IME versions and actual CSS viewport are not yet measured. 360×800 and 320×640 are reference viewports, not claimed exact device dimensions.

Read-only source inspection found `src/ui/styles/book.css` has a 240 ms discrete modal opacity/display transition plus `translateY(18px) scaleY(.08)` on closing. The mobile editor height also depends on `100dvh`. `closeActivity()` hides the panel, updates inert state and restores focus; task capacity uses ResizeObserver. This combination can involve resizing and repainting during keyboard dismissal and is consistent with the report, but no physical trace proves the root cause. No performance fix or frame-rate improvement is claimed yet.

## Validation and next gate

The final board contains 231 editable text nodes, 224 frames, 4 local components, 117 instances and 68 vectors; no image-filled UI nodes. It reuses existing capsule, drag, pin, start and close components with draft overrides. Calendar rows and navigation were componentized locally. Text uses the product's Noto Sans SC / Noto Serif SC families; no unexpected font family was found. Composition screenshot review caught and corrected task-name vertical alignment and an incorrectly enabled Next button in the four-record example. The final screenshot was inspected for readable labels, intact controls and small-screen fit.

The board is built and refined by the adjacent design-only scripts; `figma-audit.json` preserves target IDs. These scripts are not imported by the application. API writes are transactional: two initial creation attempts rolled back because instance-relative positioning and nested-frame NAVIGATE links were unsupported; the successful output uses capsule auto-layout and documented static transitions. Original designs were not replaced.

**Required user decision:** approve or revise (1) centered short task lists plus bottom pagination, (2) Calendar directory/detail navigation, and (3) keyboard-safe editor with immediate short-fade dismissal. Only then update visual design and Android code. Carry forward the already-implemented no-Sound-toggle and screen-off-deadline behavior into the eventual APK. After implementation, test a fixed commit independently, then ask the user to verify IME open/closed dismissal, repeated Add/Cancel, short/full lists, rotation/back behavior and screen-off timing on their phone. Real OS reminder and upgrade acceptance remain pending.
