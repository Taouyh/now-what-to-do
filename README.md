<p align="center"><strong>English</strong> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><img src="packaging/icons/icon-128.png" width="88" height="88" alt="Now What icon"></p>
<h1 align="center">Now What</h1>
<h3 align="center">A little time. A page of your own.</h3>

<p align="center">Keep the things you want to do. Choose one that fits right now.</p>
<p align="center"><a href="#features">Features</a> · <a href="#download">Download</a> · <a href="#start">Quick start</a> · <a href="#privacy">Privacy</a> · <a href="#development">Development</a> · <a href="#license">License</a></p>
<p align="center">
  <a href="https://github.com/Taouyh/now-what-to-do/releases/latest"><img src="https://img.shields.io/github/v/release/Taouyh/now-what-to-do?color=5b6650" alt="Latest release"></a>
  <a href="https://github.com/Taouyh/now-what-to-do/releases"><img src="https://img.shields.io/github/downloads/Taouyh/now-what-to-do/total?color=5b6650" alt="Downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5b6650" alt="MIT License"></a>
</p>
<p align="center"><a href="https://taouyh.github.io/now-what-to-do/">Try the latest web app</a> · <a href="https://taouyh.github.io/now-what-to-do/about/">Website</a></p>

<p align="center"><img src="docs/images/web-home-2026-11-26-en.jpg" width="820" alt="Current desktop web app: editable minutes, focus conditions and an inline next-step note."></p>

<p align="center"><a href="https://taouyh.github.io/now-what-to-do/about/#demo">Desktop demo</a> · <a href="https://taouyh.github.io/now-what-to-do/about/#android-demo">Android demo</a></p>

<a id="features"></a>

**Web update · November 26:** type your available minutes directly, choose focus conditions with icons, and edit your next-step note on the home page. [Try it now](https://taouyh.github.io/now-what-to-do/).
## Features

**New in 1.4: a book for your time.** A warm paper interface, bookmark navigation, a two-page activity library and a journal of your sessions.

- **Pick one and begin.** Add reading, drawing or anything else you want to do. Accept a suggestion, try another or choose for yourself.
- **Know the next step.** Add a note such as “Continue from chapter 5.” In the desktop web app, click the note below the recommendation to edit it; press Enter or click outside to save.
- **Swap without repeats.** Activities you skip stay out of this round. Look again or choose for yourself when none feels right.
- **Fit the moment.** In the desktop web app, click **Focus conditions** and mark anything you cannot do right now (use a computer, listen or speak), plus whether you may be interrupted. Hover over an icon to read its label. Your choices are remembered.
- **Use the time you have.** On desktop web, click the minutes and enter a whole number from **5 to 180** for this round. On mobile, tap to choose a preset or custom duration.
- **Pick up where you stopped.** A running round keeps its original deadline in the background. Return before it ends to continue; after the deadline, choose Continue or Finish and record. Paused rounds stay paused.
- **See your day.** Review your sessions in the book-style Journal. Open an activity to see its recorded sessions.
- **Make it yours.** Light and dark themes. English, Chinese and Japanese. Windows, Android and web.

<a id="download"></a>
## Download

| Platform | Get it | Requirements |
| --- | --- | --- |
| Windows | [Download installer](https://github.com/Taouyh/now-what-to-do/releases/download/v1.4.3/Now-What-1.4.3-Windows-x64-Setup.exe) · 13.3 MiB | Windows 10 / 11, 64-bit |
| Android | [Download APK](https://github.com/Taouyh/now-what-to-do/releases/download/v1.4.3/Now-What-1.4.3-Android-build10.apk) · 11.5 MiB | Android 7.0+ |
| Web | [Open in browser](https://taouyh.github.io/now-what-to-do/) | Nothing to install |

Free. No account. Installed apps work offline and start in English; change the language in **Settings**. The web app starts with your browser language.

The latest desktop controls are available in the online app. The downloads above remain the released Windows 1.4.3 and Android 1.4.3 build 10 installers.

**Updating:** an unfinished older timer may ask you to confirm the time you actually spent. Your existing completed records stay intact.

<details>
<summary>Installation and upgrade notes</summary>

- Windows uses the system WebView2 runtime. Setup downloads it if missing, so the first installation may need internet. The installer is unsigned and may show an unknown-publisher notice.
- Android needs an up-to-date WebView. Package contents and signing passed independent checks. The owner confirmed the candidate installers before release; automated checks did not run on an Android device.
- Update from 1.1–1.4 by installing over the existing app. The data location stays the same. Do not uninstall Android first.
- From **Windows 1.0**, export a backup in the old app, then restore it in the new app's Settings. Migration is manual. Backups do not include a running timer.
- [All releases](https://github.com/Taouyh/now-what-to-do/releases) · [Detailed installation and upgrade guide](docs/installable-builds.md)

</details>

<a id="start"></a>
## Quick start

1. **Add something you want to do.** A name, such as “Read a book,” is enough.
2. **Choose the time you have.** On desktop web, enter 5–180 minutes and click **Focus conditions** to adjust your current restrictions.
3. **Press Start.** When you're done, press End to save your time.



[Desktop demo](https://taouyh.github.io/now-what-to-do/about/#demo) · [Android demo](https://taouyh.github.io/now-what-to-do/about/#android-demo) · [What's new in 1.4.3](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.3)

<a id="privacy"></a>
## Privacy

Activities, settings and history stay on this device. There is no automatic sync. Save a copy in **Settings → Back up data → Export** before switching devices.

Clearing app or browser data can erase your records. Restoring a backup replaces current data and does not include a running timer.

<a id="development"></a>
## Development & contribution

Version 1.4 is the book edition. GitHub Pages builds `master` and publishes the app and trilingual introduction page together. With Node.js 24, run `npm ci`, then `npm run web` and open the local URL printed in the terminal. Use `npm run dev` for live development, `npm test` and `npm run test:e2e` for checks. Do not open the source HTML directly. See the [implementation and verification record](docs/development/book-c-2026-11-05/IMPLEMENTATION.md). Suggestions in [Issues](https://github.com/Taouyh/now-what-to-do/issues) and Pull Requests are welcome.

[Build Windows / Android](docs/installable-builds.md) · [Publish the website](docs/site-and-readme.md)

<a id="license"></a>
## License

[MIT](LICENSE) © 2026 Taouyh. Use, change and share it; keep the license notice.

[Desktop demo](https://taouyh.github.io/now-what-to-do/about/#demo) · [Android demo](https://taouyh.github.io/now-what-to-do/about/#android-demo) · [Editable Figma poster](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=367-4469)

Both demos are 59 seconds, with English narration, English and Chinese subtitles, soft music and click sounds. They show the earlier interface; the screenshot above shows the current web app.

