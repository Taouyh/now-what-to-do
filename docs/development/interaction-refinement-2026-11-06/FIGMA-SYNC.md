# 交互精简 Figma 同步

2026-11-06。结论：**本轮 11 项变化的定向同步、节点/反应回读和关键截图检查通过**。范围为 C 任务/日历、其余 B；不是完整 B/C 原型实点验收。

## 固定依据与隔离

- 产品固定 SHA：`29d9b4656f47b50435b30ca81137fc0b787b35a0`。依据为本目录 IMPLEMENTATION、当前 PRD 追加项、`src/ui/pages.ts`、`src/ui/styles/book.css` 及最终用户反馈。
- 独立网页验收报告提交：`e214f42b128141e37bf2ae209316d5dd13abbb55`。报告记录 build、140 核心、11 浏览器回归、6 组样式/交互及 14 张截图通过；这是独立窗口的执行结果，本同步窗口没有重新构建或运行网页测试。
- 独立 GPT 窗口/worktree：`C:/Users/fengcai/.codex/worktrees/2312/now-what-to-do`，初始为上述产品 SHA 的干净 detached HEAD；本轮分支 `codex/figma-interaction-refinement-2026-11-06`。
- 首次文件访问前已 whoami：handle `3966592487`、email `3966592487@qq.com`、user ID `1698571271826901612`。Figma session `9292bfab-8ca4-47ad-b6a6-ed6d0a5c8bce`。
- 使用 `figma-use`、`figma-generate-design`，设置的小型变体复用另按 `figma-generate-library` 定向更新流程。仓库无 Code Connect 文件；已查所订阅团队库的当前条件、设置、纸条与 paper，无适用发布资产。复用文件内字体、纸条、变量及按钮，没有引入大型库、整页截图填充或产品代码变更。

## 实际同步节点

| 范围 | 节点与结果 |
| --- | --- |
| 时间展开、卷起与收回 | [61:550](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=61-550)、`62:3087`、`62:3281`；已有预设点选后写时间并卷起的动作保留。 |
| 自定义空白 / 40 示例 | [62:3879](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-3879)、[62:4079](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-4079)；旧确定 `62:4076` / `62:4218` 隐藏并清除反应，范围提示 `62:4078` / `62:4220` 隐藏。输入与分钟共用 492px 单层框。 |
| 当前条件 | [61:700](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=61-700)、`62:3475`、`62:3675` 的 12 行；源组件 `61:544` 隐藏方框与选中洗色，保留整行反应及条件确定键。 |
| 自己选 | hover `49:609`，文字 `49:617` / `49:620` / `I49:622;49:613` 无下划线，保留原背景颜色变化和业务连接。 |
| 续做输入 | [205:4085](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=205-4085)、`203:4007`、`203:4032`、隐藏副本 `203:4491`；对应四个说明输入无 glow/effects，原 label、草稿和归属绑定及保存/取消/清空反应保留。 |
| 活动名称 / 说明 | [添加 151:4235](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4235)、[编辑 151:4148](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4148) 四个字段无 glow/effects；原草稿、错误、取消、保存、删除确认连接保留。 |
| C 日历 | [151:4354](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4354)、`151:4661`、[151:4958](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4958)、`151:5298`、`151:5612`、`151:5926`、`151:6240`、`151:6554`、`151:6858`、`151:7162`、`151:7466`；另回读空态 `270:4257`。 |
| B 设置 | [111:4832](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-4832)、`111:5147`、`111:5493`、`111:5808`、`111:6154`、`111:6469`；六个状态共 42 个按钮实例，全部保留。 |
| 相邻规格 | 更新旧说明 [268:4276](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=268-4276)，新增精简可编辑状态板 [299:4291](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=299-4291)。 |

时间输入 `62:4074` 点击进入固定 40 分钟示例时，先写原 `VariableID:61:532`，再导航，不再等待确定；有效示例 Enter / Esc / 关闭仅收起。空白 Enter、关闭、Esc 和已有遮罩动作仍回到 10。当前时间文字继续绑定原时间变量：直接打开静态 40 示例时，上方会显示全局初始 25 分钟；从输入点击路径进入后才会显示 40，没有修改全局变量默认值。

条件未选文字绑定原次级墨色 `VariableID:6:4`（`#7d6041`），选中文字绑定原墨色 `VariableID:6:3`（`#452a1a`）并用 Noto Serif SC Bold / 700。新增选中文字层 `293:4308` 的实例可见性分别绑定原四个条件布尔值 `61:533–536`，无需新增条件变量或改写完成后的重置动作。深色 `#d2b88e → #f1dfb6` 与加粗在相邻可编辑样例明确表达，没有新建整套深色条件画板。

输入 hover / focus 的浅色底色/边框为 `#e4cca1 / #895332`，深色为 `#725334 / #d2b88e`。实际输入节点保留原正常态绑定并清除光晕；相邻板提供 Normal / Hover / Focus 六个可编辑样例。非法时间仅显示黑底白字“请输入1–1440的整数”的可编辑错误样例；正常和空白态没有常驻范围提示。

日历 47 个目录行复用 C 任务的可编辑纸条边缘和右卷边，隐藏行内摘要与翻阅符号，只留活动名称。每活动次数/用时在右页；左页的每日整体合计沿用最终实现。13 个现有明细行统一为 530px 列宽、99.6875px 固定/最小行高，主文字 20px、详情 16px，列表高 398.75px，展开与收回不缩列或最小行高，无占宽滚动条。5 组目录 / 4 条明细分页和原详情可见性布尔值保持。

设置复用原 Paper / Leather 六态，建立两个仅供设置的本地副本 `296:4291`（light）和 `296:4310`（dark），合计 12 个变体。七项为语言 3、主题 2、导入/导出 2，均 24px 圆角、52px 高；保留现有间距、每页两项选中、颜色反馈。浅色 hover 按亮度 0.92、深色 1.18 表达，焦点采用同样颜色规格，无额外光晕。回读发现深色实例的旧 paint overrides 会压住新反馈，已清除这些覆盖，再恢复文字、字体、尺寸、绑定和原操作。

## 有界检查与证据

- 修改前记录 372 项反应摘要。修改后 330 项原样一致；42 项仅为设置实例 hover / press 的 CHANGE_TO 目标改到上述本地副本。把这些已知目标还原为原 ID 后，42/42 摘要一致，即 372 项无额外业务动作变化。方法为序列化 JSON 的 FNV-1a 比较，属于结构检查，不是浏览器执行器。
- 回读四个活动输入与四个续做输入无 effects，原变量绑定保留；放弃页反馈 `203:4491` 继续隐藏。
- 六个设置画板各 7 项、各 2 项选中；42 个标签均在按钮内、24px 圆角、52px 高，hover 连接存在。最终 42 个实例填充均继承新变体，无残留实例 paint override。
- 五个已验收表单按钮 `151:4277` / `151:4279` / `151:4204` / `266:4221` / `151:4206` 均仍使用原 `111:3029` Leather，120×68、6px 圆角；未修改其共享组件。
- 逐张查看最终九个构图截图：时间空/有效、条件、续做、编辑、日历、设置浅/深、相邻状态板。文字、分钟单位、四条记录和分页无裁切或重叠，条件无方框、设置无额外光晕。规格板首次出现文字间距不足，已定向修正，并以修正后的截图为最终证据。
- 最终截图均保存在 Git 忽略目录 `.cache/figma-interaction-refinement/`：`calendar.png`、`settings.png`、`time-empty.png`、`time-filled-final.png`、`conditions.png`、`continuation.png`、`edit.png`、`settings-dark-final.png`、`states-final.png`。中间截图与完整工作台账也仅在该忽略目录；未提交 PNG 或临时资产 URL。
- 节点、颜色、变体映射及精简检查结果见 [figma-sync.json](figma-sync.json)。

## 边界与交付

Figma 输入仍为固定样例；任意数字、非法草稿分支、真实 IME、DOM 原生 checkbox/Space/焦点反馈、点外部/切页校验与持久化等，在相邻规格准确说明，以产品固定 SHA 和独立网页验收为依据。输入 hover/focus 以可编辑状态样例表达；设置 hover/press 有实际变体连接。未宣称这些样例已完整模拟任意键盘行为。

本窗口未扩展全库、扫描整文件、重建网页、运行全原型实点、参与者、Android 真机或安装升级测试；阶段 8 未开始。只提交本报告与 JSON，未修改产品代码、merge 或 push。
