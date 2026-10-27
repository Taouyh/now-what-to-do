# 宣传页与 GitHub Pages

继续使用同一个仓库、同一个 GitHub Pages，不需要换服务器。

| 页面 | 地址 | 本地文件 |
| --- | --- | --- |
| 工具 | https://taouyh.github.io/now-what-to-do/ | `index.html` |
| 宣传页 | https://taouyh.github.io/now-what-to-do/about/ | `about/index.html` |

宣传页默认英语，顶部可切换中文、日语，并记住选择。这个选择和工具内的语言设置分开保存，不会改动工具里的活动、记录或计时。也可以用 `?lang=zh-CN` 或 `?lang=ja` 直接打开对应语言。

## 发布

1. 将 `about/`、三份 README、`LICENSE` 和本次相关修改提交、推送到发布分支。
2. 仓库 **Settings → Pages** 中，选择 **Deploy from a branch**，选 `design/minimal-ui` 和 **/ (root)**。如果已设置好，无需再改。自己 Fork 时选择自己的分支。
3. 等 GitHub Pages 发布完成后，分别打开上面的两个地址。

不要只上传 `about/index.html`：它还需要同目录里的样式、语言脚本和 `assets/`。

下载按钮指向 `v1.3.0` 的 Windows EXE 和安卓 APK。发布 Release 时，安装包名字必须与链接一致；以后版本或文件名变了，要一起更新宣传页和三份 README。上传 Release 安装包和发布网页是两件事。

1.2 宣传页新增今天页截图与活动汇总介绍。`about/assets/today-en.png`、`today-zh-CN.png`、`today-ja.png` 由当前应用使用合成数据生成，随宣传页语言切换；三份 README 各引用对应截图。原有视频仍展示从添加活动到开始计时的流程。重新截图可运行 `node tests/browser-data-safety.cjs scripts/capture-today-marketing.cjs --file`。

1.2.1 三份 README 改为图标、产品名、一句话介绍、导航与徽章，再说明功能、安装、使用和隐私。宣传页新增悬停选择说明，开始页和条件截图随语言切换。

`about/assets/start-{language}.png` 和 `conditions-{language}.png` 来自实际应用与合成活动；运行 `node tests/browser-data-safety.cjs scripts/capture-start-marketing.cjs --file` 可重新生成。首次条件全部未选，不展示或读取用户真实记录。

1.3 三语介绍新增下一步、本轮不重复选择和计时恢复。首页截图包含下一步，恢复截图来自实际应用，使用合成计时而非个人记录。重新生成恢复截图可运行 `node tests/browser-data-safety.cjs scripts/capture-recovery-marketing.cjs --file`。

## 演示

- `about/assets/windows-demo.mp4`：横版，1920 × 1080。
- `about/assets/mobile-demo.mp4`：竖版，1080 × 1920。
- 都是 14 秒，英语界面，原创轻柔配乐，没有人声。点击播放才出声，不会自动播放。
- README 使用同目录 GIF 预览，点击可看视频。GIF 没有声音。
- 演示和截图使用示例活动，不包含真实用户数据。宣传页媒体不会打入 Windows 或安卓安装包。

本地预览可直接打开 `about/index.html`。如需通过本地网站检查，先在仓库目录启动静态服务器，再访问 `/about/`。

网页检查：`node_modules/electron/dist/electron.exe tests/about-browser.cjs --force-device-scale-factor=1`。它使用临时测试资料，检查三语、手机排版、视频和返回工具后的数据保留，截图在 `test-artifacts/about/`。

## 维护

宣传页文字在 `about/about.js`，布局在 `about/about.css`。英语 HTML 保留了不运行脚本时也能阅读和下载的内容。README 分别在 `README.md`、`README.zh-CN.md` 和 `README.ja.md`。

MIT 许可在根目录 `LICENSE`。使用的第三方依赖仍遵守各自的许可。
