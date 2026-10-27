<p align="center"><strong>English</strong> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><img src="packaging/icon.png" width="88" height="88" alt="Now What icon"></p>
<h1 align="center">Now What</h1>
<h3 align="center">A little time. A real start.</h3>

<p align="center">Keep the things you've been meaning to do. Pick one when you have a moment.</p>
<p align="center"><a href="#features">Features</a> · <a href="#download">Download</a> · <a href="#start">Quick start</a> · <a href="#privacy">Privacy</a> · <a href="#development">Development</a> · <a href="#license">License</a></p>
<p align="center">
  <a href="https://github.com/Taouyh/now-what-to-do/releases/latest"><img src="https://img.shields.io/github/v/release/Taouyh/now-what-to-do?color=5b6650" alt="Latest release"></a>
  <a href="https://github.com/Taouyh/now-what-to-do/releases"><img src="https://img.shields.io/github/downloads/Taouyh/now-what-to-do/total?color=5b6650" alt="Downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5b6650" alt="MIT License"></a>
</p>
<p align="center"><a href="https://taouyh.github.io/now-what-to-do/">Try it online</a> · <a href="https://taouyh.github.io/now-what-to-do/about/">Website</a></p>

<p align="center"><img src="about/assets/start-en.png" width="820" alt="Ten minutes available. Start reading a book."></p>

<a id="features"></a>
## Features

- **Pick one and begin.** Add reading, drawing or anything else you want to do. Accept a suggestion, try another or choose for yourself.
- **Know the next step.** Add an optional line such as “Open where I left off and read one page.” It appears right on the recommendation.
- **Swap without repeats.** Activities you skip stay out of this round. Look again or choose for yourself when none feels right.
- **Fit the moment.** Say whether you can use a computer, listen, speak or might be interrupted. All conditions start unchecked; your choices are remembered.
- **Use the time you have.** Choose 5, 10, 15, 30, 60 minutes or your own duration. On desktop, hover over time or conditions to open the menu; move away from the panel to close it. On mobile, tap.
- **Pick up where you stopped.** Time stops at the end of a round until you choose Continue. Reopening waits for you to resume; a long break keeps the previous time as a separate session.
- **See your day.** Repeat sessions appear together with their count and total time. Open an activity for individual sessions; it closes after ten seconds.
- **Make it yours.** Light and dark themes. English, Chinese and Japanese. Windows, Android and web.

<a id="download"></a>
## Download

| Platform | Get it | Requirements |
| --- | --- | --- |
| Windows | [Download installer](https://github.com/Taouyh/now-what-to-do/releases/download/v1.3.0/Now-What-1.3.0-Windows-x64-Setup.exe) · ~2 MiB | Windows 10 / 11, 64-bit |
| Android | [Download APK](https://github.com/Taouyh/now-what-to-do/releases/download/v1.3.0/Now-What-1.3.0-Android.apk) | Android 7.0+ |
| Web | [Open in browser](https://taouyh.github.io/now-what-to-do/) | Nothing to install |

Free. No account. Installed apps work offline and start in English; change the language in **Settings**. The web app starts with your browser language.

**Updating to 1.3:** an unfinished older timer may ask you to confirm the time you actually spent. Your existing completed records stay intact.

<details>
<summary>Installation and upgrade notes</summary>

- Windows uses the system WebView2 runtime. Setup downloads it if missing, so the first installation may need internet. The installer is unsigned and may show an unknown-publisher notice.
- Android needs an up-to-date WebView. Package contents and signing are verified; runtime has not yet been tested on a real phone.
- Update from 1.1 / 1.2 by installing over the existing app. The data location stays the same. Do not uninstall Android first.
- From **Windows 1.0**, export a backup in the old app, then restore it in the new app's Settings. Migration is manual. Backups do not include a running timer.
- [All releases](https://github.com/Taouyh/now-what-to-do/releases) · [Detailed installation and upgrade guide](docs/installable-builds.md)

</details>

<a id="start"></a>
## Quick start

1. **Add something you want to do.** A name, such as “Read a book,” is enough.
2. **Choose the time you have.** Adjust your current conditions if needed.
3. **Press Start.** When you're done, press End to save your time.

<details>
<summary>See conditions, recovery and today's records</summary>

<p align="center"><img src="about/assets/conditions-en.png" width="680" alt="Hovering over Current conditions reveals four initially unchecked checkboxes."></p>
<p align="center"><img src="about/assets/recovery-en.png" width="480" alt="Reopening keeps eight minutes of saved progress and waits for an explicit choice to resume or end."></p>
<p align="center"><img src="about/assets/today-en.png" width="820" alt="Today groups three Vibe Coding sessions with individual time ranges and actual durations."></p>

</details>

[Watch the 14-second introduction](https://taouyh.github.io/now-what-to-do/about/#demo) · [What's new in 1.3.0](docs/releases/v1.3.0.md)

<a id="privacy"></a>
## Privacy

Activities, settings and history stay on this device. There is no automatic sync. Save a copy in **Settings → Back up data → Export** before switching devices.

Clearing app or browser data can erase your records. Restoring a backup replaces current data and does not include a running timer.

<a id="development"></a>
## Development & contribution

Download the source and open `index.html` to run the app. Suggestions in [Issues](https://github.com/Taouyh/now-what-to-do/issues) and Pull Requests are welcome.

[Build Windows / Android](docs/installable-builds.md) · [Publish the website](docs/site-and-readme.md)

<a id="license"></a>
## License

[MIT](LICENSE) © 2026 Taouyh. Use, change and share it; keep the license notice.
