# Android layout review — awaiting approval

2026-11-11, Asia/Shanghai. **Draft wireframes only.** The user requires wireframe approval before Android visual design, code changes or a new APK. No application source was changed in this task. Windows packaging is delivered separately in `../windows-review-2026-11-11/RELEASE.md`.

## Review links

- [Complete editable Figma board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-9796)
- [Tasks: sparse, full, second page and small screen](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-9820)
- [Calendar: today, activity details, empty and small screen](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-10173)
- [Add activity: keyboard states and closing behavior](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=497-10341)
- [Full-resolution review image](wireframes.png)

Verified Figma account handle `3966592487` before project access. Session `efb45b4b-0625-4fbc-b08e-4a89c5f59425`. Created a separate, clearly named DRAFT board on existing page `49:243`; existing approved visual screens/components were not modified. Gray fills describe structure, not an approved color or visual redesign. The ten screen frames are static editable wireframes, not a functioning phone or executable prototype.

## Proposed layout

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
