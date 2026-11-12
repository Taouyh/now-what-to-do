# Android B/C visual design — November 12

The user authorized visual design from the current revised Android wireframes. Delivered a separate editable board in the existing Figma file, using account `3966592487`. Original wireframes and existing desktop/native visual designs were preserved. No application code, APK, installer, push, merge or publication is included.

## Review

- [Complete visual board](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10204)
- [B home: default, compact and long title](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10217) · [preview](home.png)
- [C tasks: sparse, full, next page and compact](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10288) · [preview](tasks.png)
- [C calendar: directory, detail, empty and compact](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10389) · [preview](calendar.png)
- [Add activity: normal and keyboard-visible](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=574-10482) · [preview](editor.png)

There are 13 screen states in total. Home uses B; tasks/calendar use C. The editor retains the established paper and leather controls. The approved single-page mobile structure is retained, rather than squeezing the desktop spread into a phone.

## Visual construction

Reused the existing warm paper image, blurred room background, leather gradients, brass strokes, paper-slip contour, curl, and bookmark icons. Reused the six B/C color variables from `6:3` through `6:8`; no replacement palette or new generated image was introduced. Titles use Noto Serif SC and regular UI/data text uses the existing Noto Sans SC. Source discovery found no matching published mobile page composite or Code Connect mapping, so the existing on-canvas mobile designs and the approved wireframes were authoritative.

Cloned the wireframe board into a separate visual board, including its five local masters; cloned instances reference the visual masters, not the original wireframe masters. Added editable paper contours, shallow curled edges and original navigation icon instances. Text, controls, rows, navigation and layout remain editable. Images are limited to reusable paper/environment material fills, not full-interface screenshots. `source-mobile.png` is a read-only reference capture and was not inserted into the design.

Tasks retain top alignment in short/full/last-page states, true pagination structure, drag/pin/start targets and fixed bottom pagers. Calendar keeps Today and records as separate views, top-aligned entries, reserved record-detail space, and “返回”. Home preserves the three independently raised title positions and the original Start/Change/time/condition/next-step coordinates.

November 12 follow-up: record-detail rows now have transparent backgrounds and only a bottom horizontal rule. The local session-row master and all eight normal/compact instances use the original brass stroke on the bottom edge at 1 px; top and side strokes are zero. Corner radius is zero so the rules have straight endpoints. Text and layout bounds are preserved. Updated `calendar.png` was visually inspected. Run `transparent-record-rows.js`, `borderless-record-rows.js`, `bottom-rule-record-rows.js`, then `straighten-record-rules.js` after the initial styling scripts; their audits record the successive overrides. Earlier audits remain historical.

The activity editor keeps its fixed heading/close target and actions above the keyboard, expanded description, and scrollable form body. The accompanying motion note specifies concurrent blur and IME dismissal with a 0–120 ms opacity-only fade, no vertical squash or delayed second slide, stable background until viewport settling, and page/task-anchor preservation. The keyboard remains a labeled system placeholder.

## Validation and limits

Compared key bounds with the approved wireframes for all 13 screens. Task/calendar lists, pagers, home title and actions, utilities, next-step text and editor action areas match their source coordinates and sizes. Initial styling introduced a 1 px layout shift and white RGB fallback values on bound input paints; both were corrected, then all 13 comparisons passed. Final screenshots of all four sections were visually checked for intact text, touch targets and small-screen fit.

Final visible/default-traversal inventory: 286 text nodes, 320 frames, 5 components, 185 instances, 229 vectors, 21 rectangles and 48 groups. Forty-seven image-filled nodes reuse only the existing paper/environment material hashes. The only font families are Noto Sans SC and Noto Serif SC. `figma-audit.json` contains the exact IDs, image inventory and geometry evidence.

This is a static visual design delivery. Inherited wireframe/component prototype reactions were cleared on the new board to avoid navigating into old desktop/draft flows; existing source prototypes were not changed. No interactive navigation, arbitrary input, real keyboard timing, frame rate or device acceptance is claimed. 360×800 and 320×640 remain reference sizes, not measured OPPO viewports. Application implementation and a new APK require a separate user instruction.

The four design scripts record the actual creation, styling, corrective pass and verification. The initial clone script rejects duplicates. Later scripts are scoped to the returned visual-board IDs and are not imported by the application. Figma session: `ca7389e6-da12-4684-9443-88127082b76a`.
