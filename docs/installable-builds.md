# Windows 和 Android 安装版

首次打包版本：1.0.0。安装包位于本地 `dist/`，公开下载见 [GitHub Releases](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.0.0)。尚未上传应用商店。

本次重新构建已将两个安装版的首次语言设为英语，并为 Windows 加入安装目录选择。发布说明见 `docs/releases/v1.0.0.md`，三语 README 均提供直接下载地址。

## 下载与安装

| 系统 | 文件 |
| --- | --- |
| Windows 10/11，64 位 | `dist/windows/Now-What-1.0.0-Windows-x64-Setup.exe` |
| Android 7.0 及以上 | `dist/android/Now-What-1.0.0-Android.apk` |

Windows 双击安装程序，按步骤选择安装目录，例如 D 盘的应用文件夹，可从桌面或开始菜单打开。默认安装到当前用户；选择所有用户或受保护的目录时，可能需要管理员权限。当前 EXE 没有发布者代码签名证书，Windows 可能显示未知发布者。自选安装目录只改变程序位置，个人数据仍保存在系统的用户应用数据目录。

Android 将 APK 传到手机后打开安装，按手机提示允许该来源安装。需要较新的 Android System WebView；老设备如果无法正常显示，需要先更新 WebView。APK 不包含原生 CPU 库，可用于常见的 ARM 和 x86 设备。已验证 APK 签名及安装包结构，尚未在安卓真机或模拟器上验证安装和运行。

## 数据和计时

- 两个版本都自带页面，离线可用，支持中文、英文、日文。首次打开固定为英语，与系统语言无关；在设置里切换后记住选择。更新或导入备份时保留已保存的语言。网页版首次仍跟随浏览器语言。
- 安装后的应用名统一为 **Now What**。Windows 快捷方式、应用信息、窗口标题，以及安卓桌面和应用信息中的名称都保持英文；应用内的品牌文字也保持英文，其他界面文字仍可切换三种语言。
- 安装版、网页版和其他设备各自保存数据，不会自动同步。迁移时先在原来的版本中导出备份，再在新版本中导入。
- 导入前仍需确认；导出使用系统文件保存窗口。Android 无需申请整个存储空间的读写权限。
- 计时和暂停状态会保存，重新打开后继续读取。Android 锁屏或切到后台时可能暂停页面运行，不能当作可靠的后台闹钟；返回应用后会按已保存的时间重新计算。
- 卸载或清理应用数据之前，先导出备份。Windows 安装器设置为卸载时保留应用数据；安卓卸载通常会删除应用数据。

## 本地重新打包

需要 Node.js 22.12 或更新版本，以及 JDK 17 或更新版本。首次需联网下载工具，之后可复用项目 `.cache/`。网页本身仍可直接打开，不依赖这些构建工具。

```powershell
npm ci --no-audit --no-fund

# Windows：准备 Electron，生成安装程序
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-electron.ps1
npm run build:windows

# Android：准备 SDK，编译并签名 APK
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-android.ps1
npm run build:android
```

如果 GitHub 下载不可达，Electron 准备脚本可加 `-UseMirror`，Windows 构建可用 `npm run build:windows -- -UseMirror`。下载文件仍按固定校验值验证。现有本地 NSIS、rcedit 和 7zip 缓存存在时，Windows 构建脚本会自动使用。

如果旧的输出文件被占用，可以构建到新目录：`npm run build:windows -- -OutputDirectory dist/windows-english-name`。测试这次的程序时，将 `NOWWHAT_PACKAGED_DIR` 环境变量设为该目录里的 `win-unpacked`。本次已使用这个目录生成程序，并把最新 EXE 复制到上表的下载位置。

Android 使用官方 Build Tools 35.0.0、Android 35 API 和 Java 编译器直接构建，没有引入额外的 Gradle 依赖。SDK 包从 Google 官方仓库下载，并按其元数据中的摘要校验。若已有 SDK，可直接向 `scripts/build-android.ps1` 传入 `-SdkRoot` 和 `-JavaHome`。

Windows 使用 Electron 45.0.0、electron-builder 26.15.3 和 NSIS 3.12。Electron、NSIS 及其他编译工具的镜像文件均与对应包内公布的摘要核对。

## 安卓签名：请保管

首次构建会在 **`android/.signing/`** 创建签名密钥和密码文件。该目录已排除出 Git，也不会打入 APK 或 EXE。请将整个目录另外备份到安全的私人位置，不要公开上传。

以后的 APK 更新必须沿用同一把密钥。密钥丢失后，原安装版本无法直接覆盖升级。发布新版本时，同时更新 `package.json` 的版本号，以及 `android/AndroidManifest.xml` 中的 `versionName` 和递增的 `versionCode`。

## 验证方式

```powershell
npm test
node tests/desktop-packaging.cjs
node tests/desktop-packaging.cjs --packaged
node tests/package-contents.cjs
```

桌面测试使用隐藏窗口、独立配置目录和合成数据，覆盖本地页面、渲染进程隔离、三语切换、原生导出、非法文件名拒绝、重启恢复及结束记录。不会读取正常安装版的个人数据。

APK 构建结束会自动执行 `apksigner verify` 和 `aapt2 dump badging`。包内容检查比对当前网页代码与原生适配文件，并确认没有混入签名私钥、研究资料或测试数据。安装包 SHA-256 校验值另存于 `dist/SHA256SUMS.txt`。

本次验证：99 项自动测试通过；Windows 打包程序首次默认英语、切换后重启记忆、三语界面下英文产品名、备份导出及记录保存通过；APK 签名与内容检查通过，并核对编译后的各语言应用名均为 Now What。另以隐藏窗口打开真实 EXE 安装器，确认目录输入框可编辑、可接受带空格的自选路径，然后退出，未执行安装。

## 发布到 GitHub Releases

GitHub 插件目前没有上传 Release 附件的接口。可用官方 GitHub CLI 登录后，提交并推送本次源码，再运行：

```powershell
gh auth login --hostname github.com --git-protocol https --web
# 本次打包目录为 dist/windows-english-name，因此检查对应的程序
$env:NOWWHAT_PACKAGED_DIR = "$PWD/dist/windows-english-name/win-unpacked"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/publish-release.ps1
```

脚本会核对源码提交、远程分支、安装包内容和校验值，先创建草稿并上传 EXE、APK 和校验文件，全部成功后再公开发布。加 `-Draft` 可保留为草稿。若已有同名 Release，脚本会停止，不自动覆盖。也可以在 GitHub 新建 `v1.0.0` Release，选择本次源码提交，粘贴 `docs/releases/v1.0.0.md`，附加两个安装包和 `dist/SHA256SUMS.txt` 后发布。

## Windows 的体积与内存

当前使用 Electron，自带 Chromium 和 Node.js。安装包约 107 MiB，安装器显示程序文件约 357 MiB；二者都不是运行内存。

本机隔离测试中，首次打开空库页面，浏览器列出的 4 个进程合计约 164 MiB 私有内存，工作集约 322 MiB。工作集可能重复计算共享页面；开发工具连接、窗口状态、系统和运行时间都会影响结果。这是一次运行快照，不能当作所有电脑上的固定占用。

若优先缩小下载和磁盘占用，建议保留现有 HTML/CSS/JavaScript，用 Tauri 2（Rust）和系统 WebView2 重做 Windows 外壳。它可以省去随包附带的 Chromium 和 Node.js，但仍有浏览器进程，运行内存需要迁移后在同一台电脑上对比，不能承诺降到某个数值。缺少 WebView2 的电脑需要安装运行时；把完整运行时放入离线安装包会削弱体积收益。本次尚未迁移技术栈。

参考：[Tauri 的 WebView](https://v2.tauri.app/reference/webview-versions/)、[WebView2 性能与内存说明](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/performance)。

构建方式参考：[Electron 隔离与沙箱](https://www.electronjs.org/docs/latest/tutorial/sandbox)、[NSIS 安装选项](https://www.electron.build/docs/nsis/)、[Android 构建工具](https://developer.android.com/tools)、[WebView 文件选择接口](https://developer.android.com/reference/android/webkit/WebChromeClient#onShowFileChooser(android.webkit.WebView,%20android.webkit.ValueCallback%3Candroid.net.Uri[]%3E,%20android.webkit.WebChromeClient.FileChooserParams))。
