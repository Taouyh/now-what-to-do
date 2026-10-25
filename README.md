<p align="center"><strong>English</strong> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<h1 align="center">Now What</h1>
<p align="center">Got a little free time? Pick something you've been meaning to do, and start now.</p>
<p align="center"><a href="https://taouyh.github.io/now-what-to-do/about/">Website</a> · <a href="https://taouyh.github.io/now-what-to-do/">Try it online</a> · <a href="https://github.com/Taouyh/now-what-to-do/releases">Download</a> · <a href="#see-it-work">Demo</a> · <a href="LICENSE">MIT License</a></p>
<p align="center">Windows · Android · Web &nbsp; / &nbsp; Free · No account · <a href="LICENSE">MIT</a></p>

[![Now What: add an activity, choose your time and conditions, then start.](about/assets/windows-demo.gif)](https://taouyh.github.io/now-what-to-do/about/#demo)

## How it works

Too many things you want to do, and no idea where to start when you're finally free? Keep them here. When a little time opens up, pick one that fits your current conditions and begin.

1. **Add your things.** Reading, drawing, learning a language. A name is enough.
2. **Set the moment.** Choose how much time you have and whether you can use a computer, listen, speak or may be interrupted.
3. **Begin one.** Start the suggested activity, try another, or choose one yourself.

Activities have no fixed length. Set the time for each session. Ending a session saves the time you spent and keeps the activity for next time.

Click **End** to save your actual time and return Home, with another activity suggested whenever one fits your current conditions. No confirmation or new-activity form interrupts the flow; a brief notice confirms the time recorded.

## See it work

[Watch Windows demo](about/assets/windows-demo.mp4) · [Watch mobile demo](about/assets/mobile-demo.mp4) · [Watch on the website](https://taouyh.github.io/now-what-to-do/about/#demo)

Both demos are 14 seconds, from an empty activity list to starting a session. English interface, original gentle music, no voice.

<details>
<summary>Mobile demo — tap to expand the animation</summary>
<p align="center"><a href="about/assets/mobile-demo.mp4"><img src="about/assets/mobile-demo.gif" width="280" alt="Mobile demo: add an activity, choose ten minutes and start."></a></p>
</details>

## Get Now What

| Platform | Download | What you need |
| --- | --- | --- |
| Windows | [Installer (.exe, ~2 MiB)](https://github.com/Taouyh/now-what-to-do/releases/download/v1.1.0/Now-What-1.1.0-Windows-x64-Setup.exe) | Windows 10 / 11, 64-bit; Microsoft WebView2. |
| Android | [Installer (.apk)](https://github.com/Taouyh/now-what-to-do/releases/download/v1.1.0/Now-What-1.1.0-Android.apk) | Android 7.0+ and an up-to-date WebView. |
| Web | [Open in browser](https://taouyh.github.io/now-what-to-do/) | Nothing to install. |

Installed apps work offline and start in **English**. Switch to Chinese or Japanese in **Settings**. The web app starts with your browser language. Your choice is remembered; your activity names and notes aren't translated.

Windows may show an unknown-publisher notice. The Android package has not yet been tested on a real phone. See [Releases](https://github.com/Taouyh/now-what-to-do/releases) for all versions; if a download isn't available, use the web app.

**Windows 1.1 uses a C++ native shell and the system WebView2 instead of bundling Electron.** Setup downloads the Microsoft runtime only if it is missing, so the first installation may need internet. The app then works offline. A same-machine test measured about 188 → 124 MiB total private memory; results vary by device and runtime. See the [comparison and build details](docs/installable-builds.md#windows-memory).

**Upgrading from Windows 1.0:** finish any running session, export a backup in the old app, then install 1.1 and restore the backup in Settings. The new shell uses a separate data store; it cannot automatically read the old one. Old data is preserved. The [1.0 installer](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.0.0) remains available if you need to reopen it and export. Android keeps its package identity and signing key; install the APK over the old version without uninstalling first.

## Keep your data

- Activities and history stay in this app or browser on this device. No automatic sync. Clearing its data can erase them.
- Save a copy in **Settings → Back up data → Export**. Restoring a backup replaces current activities, history and settings. The running timer isn't included.

## Run or publish your own copy

Choose **Code → Download ZIP**, unzip it, and open `index.html`. No setup needed.

To publish on GitHub Pages, fork this repository and select the branch and **/ (root)** in **Settings → Pages**. The tool stays at the main address, and the introduction is at `/about/`. [Publishing details](docs/site-and-readme.md) · [Build Windows / Android](docs/installable-builds.md).

## License

[MIT](LICENSE) © 2026 Taouyh. You're welcome to use, change and share it. Keep the license notice with your copy.
