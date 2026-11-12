# Desktop and Android demonstration update

Date: 2026-11-12, Asia/Shanghai.

The user authorized updating and pushing the README, promotional page and existing videos. This isolated branch starts at published master fe1f5f9. It includes no unpublished application code, installer, version change or release tag.

The primary player now shows Desktop demo, followed by Android demo. Three languages retain their existing navigation and styling. The portrait player is 9:16, centered and at most 360 CSS pixels wide. Both players retain native controls, inline playback, no autoplay and no preloading. Three READMEs link directly to both sections and describe the existing English narration and bilingual captions.

## Source provenance

- Desktop: D:/code/nowwhat-web-film/out/NowWhat-Web-Intro-EN-ZH.mp4. 59 seconds, 1920 x 1080. SHA-256 54912ca9aad19dd8865b40aa212d032127144f8edc83d559998d01c9cf1d151f.
- The original marketing chat confirms this was the desktop web film preceding the matching Android film. BRIEF.md identifies product source 04b6f8e3f6e8dc90dc2c890ceab0300ac831f6d1, 1.4.1. Windows packaging uses the same dist/web interface (scripts/build-windows.ps1). Desktop demo therefore describes the shared interface; this is not claimed to be a Windows-native screen recording. The tiny historical windows-demo.mp4 predates the current book films.
- Android: D:/code/nowwhat-android-latest-film/out/NowWhat-Android-1.4.3-build10-Portrait-EN-ZH.mp4. 59 seconds, 1080 x 1920. SHA-256 47ac10a30b55b6cca82b8f52ba7f91b62321a4c1961bf939d9a086b0714c371d.
- Android uses actual build 10 APK UI resources in a mobile browser capture. It is not physical Android footage or notification/upgrade acceptance.
- Both files and their existing posters were copied unchanged. Captions are already burned into the films, so duplicate subtitle tracks are unnecessary.

## Validation and deployment

144 Node tests, typecheck, web build and site assembly passed. tests/promo-videos.cjs passed 21 language/viewport layouts (320–1531 px), two real video playbacks, metadata, poster URLs, original aspect ratios, language-menu behavior, unchanged download destinations and application storage isolation. Local fresh-browser screenshots were inspected at desktop and mobile sizes. Source hashes match the approved finished films.

Require independent fixed-commit verification before pushing. Figma synchronization is delegated to a separate isolated worktree chat after implementation is fixed. Public application/download version stays 1.4.1; the newer Android film does not publish its installer.

Deploy only this branch's scoped commits to master through the existing Pages workflow. Verify both live media hashes, playback, README blobs and release.json after deployment. Roll back with a new revert commit for this scoped update; retain the historical media and do not reset history or app data.
