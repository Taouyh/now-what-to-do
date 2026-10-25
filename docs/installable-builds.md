# Windows 和 Android 安装版

当前版本：**1.2.0**。下载见 [GitHub Releases](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.2.0)，变更见 [发布说明](releases/v1.2.0.md)。两个安装包包含活动汇总、单行执行记录、按需更多信息与 10 秒自动收起；结束仍直接保存实际用时，回到开始页并优先推荐另一件符合当前条件的活动。

从 1.1 更新到 1.2 可直接覆盖安装，数据目录、来源和存储格式保持不变，安卓使用原签名及 versionCode 3。

## 下载与安装

| 系统 | 文件 | 环境 |
| --- | --- | --- |
| Windows | `dist/windows/Now-What-1.2.0-Windows-x64-Setup.exe`，约 2 MiB | Windows 10 / 11，x64，Microsoft Edge WebView2 Runtime |
| Android | `dist/android/Now-What-1.2.0-Android.apk` | Android 7.0+，较新的 Android System WebView |

Windows 采用 **C++ / Win32 + 系统 WebView2 + NSIS**，不再附带 Electron、Node.js、完整 Chromium 或 .NET。安装器允许选择目录，默认只安装到当前用户。如果电脑缺少 WebView2，安装器会运行随包提供、经微软签名的 Evergreen 引导程序并联网下载运行时；已有运行时则不必下载。安装后应用页面可离线使用。首次打开为英语，设置里可切换中文、日语并记住选择。

Windows 安装包目前没有发布者签名，可能显示「未知发布者」。安卓版可直接覆盖安装，沿用原包名和原签名；不要先卸载。APK 不含原生 CPU 库。已检查签名、版本和包内容，尚未在安卓真机或模拟器上验证安装和运行。

## Windows 1.0 升级到 1.2

1. 在旧版结束正在运行的计时，在 **设置 → 备份数据 → 导出** 保存 JSON 备份。
2. 安装 1.2，打开设置并导入刚才的备份。导入确认后会替换新版当前数据，正在运行的计时不包含在备份里。
3. 核对活动、记录和语言后再决定是否卸载旧版。不要手动清理旧数据目录。

新外壳使用独立的 `%LOCALAPPDATA%\\NowWhat\\WebView2` 配置目录，以及 `https://nowwhat.local` 本地来源；1.0 使用 Electron 的配置目录和 `nowwhat://app` 来源。因此不会自动读取旧记录。安装、卸载新版均不删除旧版配置；新版卸载也保留自己的配置。需要再次导出时，[1.0 安装包](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.0.0)仍然保留。旧版与新版快捷方式名称相同，旧版卸载后可重装新版恢复快捷方式。

网页版、Windows、安卓、不同设备之间不自动同步，迁移请用导出和导入。Android 卸载一般会删除其数据；清理应用数据前务必先备份。安卓后台运行受系统限制，不能作为可靠的后台闹钟；回到应用时会依据保存的时间重算。

<a id="windows-memory"></a>
## Windows 内存与体积实测

2026-10-25，同一台 Windows 机器、相同网页代码、独立空资料目录，首次打开后切换三种语言，静置约 5 秒再采样。统计 CDP 返回的浏览器进程，并将原生宿主 PID 去重后加入，**包含 WebView2 子进程**，不是只看 344 KiB 的窗口程序。

| 指标 | Electron 45 基准 | C++ / WebView2 候选 |
| --- | ---: | ---: |
| 安装包 | 106.93 MiB | 约 1.95 MiB |
| 私有内存合计 | 188 MiB | 124 MiB |
| 工作集合计 | 348 MiB | 316 MiB |
| 进程数 | 4 | 6 |

该次私有内存快照降低约 34%。工作集会重复统计共享页；调试连接、运行时版本、音频、系统、数据量和启动时间都会影响结果。这不是所有设备的保证，也不是内存上限。WebView2 在该机使用已安装的 155 系列 Evergreen 运行时。安装包大小不包含系统共享运行时占用。

窗口不活动或最小化时会请求 WebView2 的低内存目标，不暂停 JavaScript 或计时。它属于尽力而为的提示，不能据此承诺额外降低内存。已验证最小化一段时间后计时继续，重启能恢复暂停状态。参考：[微软 WebView2 内存说明](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/performance)、[MemoryUsageTargetLevel](https://learn.microsoft.com/en-us/dotnet/api/microsoft.web.webview2.core.corewebview2.memoryusagetargetlevel)。

## 本地构建

网页无需构建，直接打开 `index.html`。打包需要 Node.js 22.12+；Windows 原生编译另需 Visual Studio 2022 / Build Tools 的「使用 C++ 的桌面开发」、Windows SDK，以及 [NSIS 3](https://nsis.sourceforge.io/Download)。将 `makensis.exe` 加入 PATH，或给脚本传入 `-NsisPath`。已有项目 NSIS 缓存时会自动使用。

```powershell
npm ci --no-audit --no-fund
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-webview2.ps1
npm run build:windows

# Android：JDK 17+，官方下载并校验 Android Build Tools 35 与 Android 35 API
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-android.ps1
npm run build:android
```

WebView2 SDK 固定为 1.0.4314.35，下载后按脚本内 SHA-256 校验。微软引导程序从官方链接下载，构建前验证微软 Authenticode 签名。C++ 使用静态 CRT 和静态 WebView2 Loader，用户无需安装 .NET 或 Visual C++ Redistributable。SDK 许可及声明随安装包提供。构建输出在 `dist/windows/webview2-unpacked`，自选输出目录可用 `-OutputDirectory`。Electron 依赖保留用于现有浏览器测试及基准比较，不会出现在新安装包里。

安卓使用 Java 与原生 WebView，直接调用官方 SDK 工具构建。请备份 **`android/.signing/`** 中的私有签名身份，切勿上传。APK 更新必须沿用原密钥，并递增 manifest 的 versionCode。当前版本为 versionName 1.2.0 / versionCode 3。

## 验证与发布

```powershell
npm test
node tests/desktop-packaging.cjs --webview2
node tests/windows-installer.cjs
node tests/package-contents.cjs
node_modules/electron/dist/electron.exe tests/about-browser.cjs --force-device-scale-factor=1
```

这些测试使用隐藏窗口、独立目录和合成数据；不读取正常安装的个人资料。覆盖默认英语、三语切换、没有 Node 的本地页面、原生导出、非法文件名拒绝、文件导入确认、最小化时计时、重启恢复，以及结束后推荐另一件活动。真实安装与卸载测试会关闭快捷方式和注册表写入，验证带空格的安装目录、包内文件一致性及保留非程序文件。已有 WebView2 的安装路径已实测；缺失运行时的联网安装尚未在干净虚拟机验证。

109 项 Node 单元测试通过。APK 构建会验证签名及编译后的各语言应用名；包内容检查确保网页与当前源代码相同，不包含密钥、用户数据或研究资料。浏览器交互与宣传页另行检查。发布附带 `SHA256SUMS.txt`。

GitHub 插件没有 Release 附件上传能力，发布脚本使用官方 GitHub CLI。登录后，先提交并推送构建所对应的源码，再运行：

```powershell
gh auth login --hostname github.com --git-protocol https --web
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/publish-release.ps1
```

脚本核对远程分支、源码提交、包内容及校验值，先上传草稿，全部成功后公开发布；已有同版本会停止，不覆盖。加 `-Draft` 可保留草稿。GitHub Pages 继续使用 `design/minimal-ui` 的根目录，工具和宣传页网址均不变。
