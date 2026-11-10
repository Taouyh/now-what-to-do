# Now What 1.4.1 demo

86 seconds, 1920 × 1080, 30 fps. English, original soft music and synchronized clicks, no voiceover. This edited screenshot-based walkthrough demonstrates the current web build with synthetic data; it is not a continuous screen recording or native-device evidence.

Existing `nowwhat-video/` user work is preserved. This version copies its composition/capture approach and updates task pinning, real pointer drag ordering, current controls, default expanded descriptions and continuation-note styling.

## Reproduce

Install this directory's locked dependencies with `npm ci`. Start the parent application on port 5189 (`npm run dev -- --host 127.0.0.1 --port 5189` at repository root). This capture uses the parent's Playwright and Edge. Run:

1. `node capture-demo.cjs`
2. `python make-audio.py` (Python with NumPy)
3. `npx tsc`
4. `npx remotion render NowWhat-English out/NowWhat-1.4.1-Demo.mp4 --codec=h264 --crf=18 --concurrency=6 --browser-executable="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`

Composition duration derives from `src/demo-data.json`; capture coordinates drive the reconstructed cursor and click feedback. Generated screenshots, audio, dependencies and local output are ignored. The shipped MP4 is `about/assets/nowwhat-demo-1.4.1.mp4`. The older demo remains available under its original filename.

Validation: TypeScript, all 2,580 rendered frames, full-file video/audio decode, browser playback, first frame and representative task/drag/note/journal/theme screenshots. Final artifact SHA-256: `81525017E50F5DA149913013AA905B24ACFBE55809B4B9CAEBAEE7F9941DE94C`. Generated mixed PCM peak is 0.532 (below clipping). Opening capture waits for the app, fonts and images to settle.
