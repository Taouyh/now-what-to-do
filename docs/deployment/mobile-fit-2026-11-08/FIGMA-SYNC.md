# Android 屏内适配 Figma 同步

2026-11-08（Asia/Shanghai）。**本轮有界可编辑设计同步、截图检查与动作回读通过。** 产品依据固定为 `ca728cd276db3f8d1c64aff297ec0ba18d418a6d`。这不是完整 B/C 原型实点、Android 实机、IME、安装升级或参与者验收。

## 隔离与依据

- 独立 GPT 窗口、新 worktree：`C:/Users/fengcai/.codex/worktrees/0969/now-what-to-do`，进入时干净，切到指定 SHA 后建立 `codex/figma-android-mobile-fit-2026-11-08`。
- 已读当前阶段 `docs/deployment/AGENTS.md`、当前 IMPLEMENTATION、发布候选及验证报告、development rules，以及 `src/ui/book.ts`、`pages.ts`、`styles/book.css`。只同步 Figma 和本报告；没有产品改动、merge、push 或 Windows 包更新。
- 设计访问前 whoami 核对 handle `3966592487`、email `3966592487@qq.com`、user ID `1698571271826901612`。文件 `EUoXZR1hDJUUPVAtrDxpE5`，页面 `49:243`，session `ea09f7fa-f02b-47ce-b813-fe9a91933416`。
- 使用 figma-use、figma-generate-design。未发现 Code Connect 文件；按已订阅团队库检索“移动任务书册”“翻页胶囊”无匹配，定向复用文件内现有组件、变量与纹理。
- 只读独立最终报告原提交 `93ce35f`、父窗口归档提交 `162c0ff`。最终固定源 build 与 20 项 Edge 测试、短屏滚动/确认/旋转复验通过是独立窗口的结果，本窗口没有重新执行或扩充其验收范围。

## 实际交付

说明与组件区：[374:5361](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=374-5361)。六个原型状态保持为同页顶层 frame，以满足 Figma NAVIGATE 的目标要求，邻接排列于该区。原有设计节点保留。

| 状态 | 可编辑节点 | 结果 |
| --- | --- | --- |
| 360×640 任务第一页 | [376:5829](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=376-5829) | 6 条 52px 纸条、8px 间距，示例任务 01–06；上一页禁用，下一页连接第二页 |
| 360×640 任务第二页 | [376:5950](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=376-5950) | 示例任务 07–12；上一页连接第一页，下一页禁用 |
| 360×640 设置 | [376:6073](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=376-6073) | 语言、主题、导出、导入单屏可见 |
| 360×640 完成续做编辑 | [376:6211](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=376-6211) | 可编辑说明草稿及相同配色、同宽高保存/取消胶囊 |
| 800×360 设置 | [376:6142](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=376-6142) | 语言/主题与备份/恢复分为两列 |
| 800×360 任务编辑 | [379:5620](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=379-5620) | 弹窗 y=12、高336；212px 正文视窗内放350px可滚动内容；保存/取消/删除固定可见 |
| 浅深色状态样例 | [379:5744](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=379-5744) | 复用既有 Default / Hover / Focus 六个胶囊实例 |

任务示例是独立的 12 项设计样本，用于表达两页导航，不代表用户真实数据。两页导航 `376:5948 → 376:5950`、`376:6067 → 376:5829` 已回读为 ON_CLICK / NAVIGATE；可用按钮保留共享 hover，两个禁用按钮无动作。部分书签连接到本组示例状态。此处未声称已在原型播放器实点全流程。

## 复用与桌面定向同步

- 复用胶囊组件集 `342:4359`、设置胶囊 `296:4291`、纸条背景 `313:4299`、书签图标 `6:15 / 6:20 / 6:27 / 6:33`、任务开始图标 `104:1791`、主开始按钮 `49:512` 与原需求图标。
- 仅新建一个适配单列的任务行源组件 `376:5817`，内部继续实例化既有纸条与图标；名称、序号为可编辑 TEXT 属性。没有扩建全产品组件库。
- 环境与纸纹沿用原文件 imageHash，具体节点、尺寸与 hash 见 JSON。图片只承担环境/纸面纹理；没有导入完整 UI 截图，也没有把界面压成位图。保留既有可编辑纸条轮廓，其卷边与浏览器缩放纹理不是逐像素相同。
- Noto Serif SC、Noto Sans SC、EB Garamond 对应产品 CSS 的 Variable 字族；六个状态字体家族回读全部通过，没有改用 Inter。标题、正文、任务名与序号保持各自字体分工。
- 桌面四个既有续做组，仅同步保存/取消八个实例及四个对应按钮容器：`203:4026 / 4029`、`203:4051 / 4054`、`203:4504 / 4505`、`205:4210 / 4211`。每个按钮236×44、圆角24，容器480宽、间距8；其他桌面内容未重做。[可见桌面编辑态](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=205-4085)。
- 保存/取消 ON_CLICK 原业务序列完整保留：FNV-1a 摘要分别 `5fc9a6ef` / `6928f224`，八个实例前后相同。四个目标页面内其余52个含动作节点摘要全部一致。新增 hover 指向共享胶囊状态，不改原保存、取消、计时或导航业务。
- 续做普通浅色为 `#f8ebc9 → #d6b783`，深色 `#503d2c`；hover/focus 复用上一轮已校正的对应变体。移动续做两按钮144×44、间距8，填充、描边、效果、圆角、宽高序列化比较完全相同。任务编辑的保存/取消/删除继续保持实现中的棕色主按钮，不混同续做胶囊。

## 核对结果与证据

六个移动状态共 **555 个子节点、137 个 TEXT、99 个 INSTANCE**；其余为可编辑 frame、vector、group、rectangle。节点类型计数、完整图片节点清单、实例来源、字体及控制尺寸保存于 [figma-sync.json](figma-sync.json)。

- 两页任务翻页 x=30 / 242、y=566、高44，和独立网页360×640测量一致，均在屏内。每页恰好6行。
- 竖屏导出/导入 y=405.438 / 481.938、高44；横屏 y=148.25 / 224.75、高44。与独立网页对应位置约0.75px差异，所有语言/主题/备份控制均可见。
- 续做保存/取消 y=510..554；标签28×20，位于144×44按钮内。分页标签42×20，位于88×44按钮内，没有裁切。
- 短屏编辑保存/取消/删除 x=62 / 291.334 / 520.666、y=286..330，和新独立复测纵向位置一致；正文可滚动与 footer 分离。正文末端的局部裁切是滚动视窗，非动作按钮被遮挡。
- 已目视检查六个最终移动状态、浅深状态样例及可见桌面续做编辑态，共八个最终截图。修正了初版书签图标缩放、描边计入布局带来的6px偏移，以及关闭按钮层级；最终截图无导航文字相撞或操作按钮越界。截图路径及 SHA-256 在 JSON 中，文件位于本 worktree 的 `.cache/figma-mobile/`，不提交 PNG。
- 源画面对照：新短屏编辑使用独立 `.cache/mobile-independent-retest/800-editor.png` 等 `ca728cd` 复测证据；任务/设置/续做使用独立 `.cache/mobile-independent/` 与父窗口 `.cache/mobile-visual/` 的既有四配置截图，按最终差异继承布局，明确不是本窗口新跑的产品测试。

静态稿注明容量320×568为5、360×640为6、390×844为9、800×360为2；Android或非Windows触控设备且紧凑视口才启用移动书版。Figma 不实现 ResizeObserver、任务 ID 旋转锚点、软键盘/IME、导入选择器或数据持久化。新增移动设置、编辑字段及业务保存/取消主要为可编辑布局状态；仅已列出的原型导航、hover 与滚动配置被接线/回读。原桌面业务动作的保留不等于 Android 或参与者验收。Windows 安装包未更新；本窗口也未构建、安装或发布 APK。
