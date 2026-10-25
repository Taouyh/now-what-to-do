<p align="center"><a href="README.md">English</a> · <strong>简体中文</strong> · <a href="README.ja.md">日本語</a></p>

<h1 align="center">Now What</h1>
<p align="center">有点空闲？选一件一直想做的事，现在就开始。</p>
<p align="center"><a href="https://taouyh.github.io/now-what-to-do/about/?lang=zh-CN">宣传页</a> · <a href="https://taouyh.github.io/now-what-to-do/">在线体验</a> · <a href="https://github.com/Taouyh/now-what-to-do/releases">下载安装</a> · <a href="#看看怎么用">操作演示</a> · <a href="LICENSE">MIT 许可</a></p>
<p align="center">Windows · 安卓 · 网页 &nbsp; / &nbsp; 免费 · 不用注册 · <a href="LICENSE">MIT 开源</a></p>

[![Now What 操作演示：添加活动，选择时间和当前条件，然后开始。](about/assets/windows-demo.gif)](https://taouyh.github.io/now-what-to-do/about/?lang=zh-CN#demo)

## 怎么用

想做的事情很多，空下来却不知道先做哪个？先把它们放在这里。有空时，选一件符合当前条件的事，直接开始。

1. **写下想做的事。** 读书、画画、学语言，先写一个名字就好。
2. **看看现在的条件。** 有多少时间，能不能用电脑、听音频、出声，会不会被打断。
3. **选一件，开始。** 可以接受推荐，换一件，或者自己选。

不用给每项活动规定时长，每次开始时再选。结束后会记下这次花了多少时间，活动还在，下次继续做。

点击「结束」直接保存实际用时并回到开始页；当前条件下有其他可选活动时，优先推荐另一件。无需再次确认或添加新活动，只用轻提示告知已记录的时间。

## 一眼回看今天

**1.2 新增：**「今天」把同一活动的多次执行放在一起，汇总次数和有效用时。展开后，每次只显示时间段和实际用时；精确时间、计划、追加和暂停收到 **⋯** 里，零追加、零暂停不占位置。卡片 10 秒后自动收起，打开更多信息会重新计时，原始记录完整保留。

![今天页按活动汇总，展开后用简洁单行展示每次执行的时间段和实际用时。](about/assets/today-zh-CN.png)

## 看看怎么用

[Windows 演示](about/assets/windows-demo.mp4) · [手机演示](about/assets/mobile-demo.mp4) · [在介绍页观看](https://taouyh.github.io/now-what-to-do/about/?lang=zh-CN#demo)

两段演示都是 14 秒，从没有活动到开始计时。英语界面，原创轻柔配乐，没有人声。

<details>
<summary>手机演示 · 点击展开动图</summary>
<p align="center"><a href="about/assets/mobile-demo.mp4"><img src="about/assets/mobile-demo.gif" width="280" alt="手机版演示：添加活动，选择十分钟，然后开始。"></a></p>
</details>

## 下载安装

| 平台 | 下载 | 使用要求 |
| --- | --- | --- |
| Windows | [安装包 (.exe，约 2 MiB)](https://github.com/Taouyh/now-what-to-do/releases/download/v1.2.0/Now-What-1.2.0-Windows-x64-Setup.exe) | Windows 10 / 11，64 位；Microsoft WebView2。 |
| 安卓 | [安装包 (.apk)](https://github.com/Taouyh/now-what-to-do/releases/download/v1.2.0/Now-What-1.2.0-Android.apk) | Android 7.0 及以上，需要较新的 WebView。 |
| 网页 | [直接打开](https://taouyh.github.io/now-what-to-do/) | 不用安装。 |

安装版可离线使用，第一次打开是**英语**，可以在**设置**里切换中文、英语和日语。网页版默认跟随浏览器语言。选过会记住，自己写的活动名和说明不会被翻译。

Windows 可能提示「未知发布者」。安卓版目前还没有在真机上测试。全部版本在 [Releases](https://github.com/Taouyh/now-what-to-do/releases)；如果暂时下载不了，先用网页版。

**Windows 1.1 改用 C++ 原生窗口和系统 WebView2，不再随包附带 Electron。** 缺少 WebView2 时，安装器会下载微软运行时，因此首次安装可能需要联网，之后应用可离线使用。本机同条件实测合计私有内存约 188 → 124 MiB，实际占用随设备和运行时变化，见[实测对比与构建说明](docs/installable-builds.md#windows-memory)。

**从 Windows 1.0 升级：**先结束正在计时的活动，在旧版设置里导出备份，再安装 1.2 并导入。新外壳使用独立的数据目录，不会自动读取旧数据，也不会删除旧数据。需要重新打开旧版导出时，[1.0 安装包](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.0.0)仍保留。安卓沿用包名和签名，直接覆盖安装，不要先卸载。

从 **1.1 更新到 1.2** 可直接覆盖安装，数据位置和格式不变，安卓继续沿用原签名。

## 数据自己留一份

- 活动和记录只存在当前设备的这个应用或浏览器里，不会自动同步。清理应用或浏览器数据，可能会一起删掉它们。
- 在**设置 → 备份数据 → 导出**里留一份备份。恢复备份会替换现有活动、记录和设置，不包含正在进行的计时。

## 自己运行或发布

点 **Code → Download ZIP**，解压后打开 `index.html`，就能使用。

想发布到 GitHub Pages：先 Fork 仓库，在 **Settings → Pages** 里选分支和 **/ (root)**。原首页还是工具，介绍页在 `/about/`。[发布说明](docs/site-and-readme.md) · [制作 Windows / 安卓安装包](docs/installable-builds.md)。

## 开源许可

[MIT](LICENSE) © 2026 Taouyh。可以使用、修改和分享，记得保留许可声明。
