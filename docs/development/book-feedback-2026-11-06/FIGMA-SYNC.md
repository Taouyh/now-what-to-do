# 2026-11-06 Figma 实际同步记录

状态：本轮 11 条反馈已完成对应设计修改或正确项核对，并完成节点/反应回读与最终截图检查。不是全 B/C 原型逐点、参与者、Android 真机、升级或发布验收。

主窗口归档：最终同步记录 `25ac4a8bc46a93d2fd77d8a877075127bfed735f` 已选择性复制到本开发目录；本报告和两份 JSON 进入主分支，全部 PNG 与 ZIP 保存在 `D:\code\now-what-to-do\docs\development\book-feedback-2026-11-06` 对应相对路径并由 gitignore 排除。以下保留同步窗口的完整证据与原始交接记录。

## 固定依据与隔离

- 产品固定提交：`2624744f6d564c94910c23f9439239dedaf6783e`。140 核心、生产构建、21 浏览器及补充 22 项通过由主窗口交接，本窗口不冒充其独立测试执行者。
- 本窗口起点：`051f6f3f378d6fc510324fed9f51add4f31d399f`；与上述产品提交的差异仅为 `FIGMA-HANDOFF.md`。以此处产品源码重新执行 `npm ci`、`npm run build:web`，类型检查和 271 项文件生产构建通过。
- 独立 worktree：`C:\Users\fengcai\.codex\worktrees\23c1\now-what-to-do`；分支 `codex/figma-feedback-sync-2026-11-06`。初始无未提交改动；未修改产品代码、主工作树，未合并或推送。
- Figma 首先执行 whoami：handle `3966592487`，email `3966592487@qq.com`，user ID `1698571271826901612`；团队 `team::1698571274781651926`。只在该账户编辑。
- 文件：[Now What](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5)；会话 `2c1c1321-b77d-4f90-ad87-7001f3d8d17f`。目标均位于交付页 `49:243`。
- 本地截图仅访问 `http://127.0.0.1:8772/`，使用新建 Edge headless browser context 和合成任务/记录；未访问 8765 或真实用户 profile。截图脚本完成后关闭 context/browser。
- 采用 `figma-use`、`figma-generate-design`、`figma-generate-library` 的定向更新流程。仓库无 Code Connect 文件；已查团队库，无适合本轮的发布资产，复用文件内现有控件、变量、字体及图像填充。

## 本轮反馈与节点

| 批注 | 修改或核对结果 | Figma 节点 |
| --- | --- | --- |
| 1 | 空白自定义“确定”、关闭、Esc 增加 `SET_VARIABLE 可用时间文案=10 分钟` 后收回。非空非法、点外部、切页及存储失败规则写入相邻说明，不伪称任意输入/持久化已模拟。 | [空输入页 62:3879](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-3879)，确定 `62:4076`，关闭 `62:4017`；[说明 268:4276](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=268-4276) |
| 2 | 既有输入只有一个外框；在同一水平布局中补“分钟”文本，数字/单位无内框。40 分钟示例显示整个外框的键盘焦点规格。 | [空输入 62:4074](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-4074)，单位 `266:4215`；[40 分钟焦点外框 62:4216](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-4216)，单位 `266:4216` |
| 3 | 将前三项 5/10/15 改为 10/15/20，保留 30/60/自定义；同步每个预设的点击变量值。覆盖展开、自定义以及原型实际收回/卷起关联状态，未保留“文字变了但动作仍写旧值”的情况。 | [展开 61:550](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=61-550)，[卷起 62:3087](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-3087)，[收回 62:3281](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-3281)，[空自定义 62:3879](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-3879)，[40 示例 62:4079](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=62-4079) |
| 4、6 | 两组原本无填充，保持透明并取消外层裁切；按钮自身边框保留。添加为“添加/取消”；编辑补上独立“取消”，变成“保存/取消/删除”。取消使用纸签组件，复用关闭的草稿退出动作，删除仍去既有确认页。 | [C 添加 151:4235](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4235)，组 `151:4275`；[C 编辑 151:4148](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4148)，组 `151:4202`，新取消 `266:4220`，删除 `151:4205` → [确认 151:4308](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4308) |
| 5 | 四提示由褐底浅金字改为 `#111` / `#fff`，放在图标上方。默认透明、hover 可见，转换无延时/过渡；C 添加与编辑的 8 个实际实例均补即时 hover，保留原有点击变量动作。需求行取消裁切。补四个 Focus 变体和可编辑实例展示；不冒充真实 Tab 焦点链。 | [原组件集 104:2220](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=104-2220)，默认/hover `104:2162/2169`、`104:2176/2184`、`104:2192/2199`、`104:2206/2213`；[Focus 0 268:4212](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=268-4212)，[1 268:4222](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=268-4222)，[2 268:4233](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=268-4233)，[3 268:4243](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=268-4243) |
| 7、8 | 已正确，无需重建：语言与外观组无外层填充/裁切；每个内部按钮均独立有一条完整 stroke。核对全部六个语言/主题示例。 | [zh 浅 111:4832](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-4832)，[zh 深 111:5147](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-5147)，[en 浅 111:5493](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-5493)，[en 深 111:5808](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-5808)，[ja 浅 111:6154](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-6154)，[ja 深 111:6469](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-6469) |
| 9 | 时间与条件主组件 hover 原先提亮，改为同纹理渐变加深；所有渐变 RGB 分量均低于默认值，既有展开导航保留。 | [B 首页 49:244](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=49-244)，[时间集 49:539](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=49-539)，hover `49:537`；[条件集 49:563](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=49-563)，hover `49:561` |
| 10 | 先确认 C 目录/明细不是空态，且旧 B 空态无 C 关联入口。保留旧 B 空态及其原动作/“现在做”文字；从 C 目录派生缺失的 C 空态，沿用书页/字体/纹理，移除合成记录与分页，使用原皮革组件的深色“去开始”直接回 B 首页。相邻说明提供显式状态演示入口。 | [C 目录 151:4354](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4354) → 新 [C 空态 270:4257](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=270-4257)；按钮 [270:4382](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=270-4382) → `49:244`；说明入口 `270:4385` → `270:4257` |
| 11 | 已正确，无需改动旧示例：扫描全部 11 个 C 日历目录/明细，没有 HH:mm:ss 形式的记录时刻。读书明细为 `09:00–09:15` 等 HH:mm。相邻说明明确实际用时可有秒，跨日保留日期、原始时间戳不降精度。合成短记录网页截图实见 `11:07–11:07` 与 `17 秒`。 | [C 读书明细 151:4958](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4958)，范围文本 `151:5261/5267/5273/5279`；[说明 268:4276](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=268-4276) |

全部实际修改/新增 ID 见 [change-ledger.json](figma-sync/change-ledger.json)，回读属性/反应见 [node-audit.json](figma-sync/node-audit.json)。两种新增共享 paint style 仅服务本轮条件提示，不重建其它样式。修改共享条件/时间组件会自然传播到原有实例；未重做或删除历史 B/C 备选页面。

## 原型能力与边界

- 已建立且已回读：10/15/20/30/60 预设写入对应字符串后收回；空白自定义确定/关闭/Esc 设为 10 后收回；既有点击输入 → 40 分钟示例及示例确认；8 个 C 条件实例即时 hover；取消复用关闭退出、删除到确认；说明 → C 空态 → B 首页。
- Focus 变体和整个分钟外框为可编辑视觉规格；未宣称 Figma 支持 DOM Tab 顺序、任意输入校验、存储失败回滚、跨日记录生成或自动无记录分支。
- 非空非法值保留提示、点外部/切页的空白校验、语言切换文案和持久化规则，由相邻说明准确表述并以已验收实现为准。中文条件组件未另造全套英/日交互稿。
- 原型交互通过属性/反应回读验收；本窗口没有完成整个 B/C 原型的浏览器实点测试，不将反应存在等同于全链路原型通过。
- 沿用现有桌面书页布局；320/390 工程降级不扩展成本次移动稿重设计。现有示例的 25 分钟、11 月 2 日等是原有合成上下文，不将其误改为全局默认/真实当天数据。

## 截图与检查

以下均为本地归档 PNG，不依赖临时 Figma 下载 URL；Figma 内没有导入整页网页截图。最终图像在目标节点更新完成后导出并人工查看，提示展示的裁切已修复，最终无文字、单位、焦点圈或按钮边框裁切。

| 检查 | Figma 最终图 | 固定实现对照 |
| --- | --- | --- |
| 预设与单层空输入 | [时间卷轴](figma-sync/after-62-3879.png) / [原稿](figma-sync/before-62-3879.png) | [空输入](figma-sync/web-custom-empty.png)、[非法值保留](figma-sync/web-custom-invalid.png) |
| 整体输入焦点 | [40 分钟焦点示例](figma-sync/after-62-4079.png) | 同上，单外框，无数字内框 |
| 添加、编辑、透明组 | [添加](figma-sync/after-151-4235.png)、[编辑](figma-sync/after-151-4148.png) / [原编辑](figma-sync/before-151-4148.png) | [添加 hover](figma-sync/web-add-tooltip.png)、[编辑 focus](figma-sync/web-edit-focus.png) |
| 四提示、焦点、规则边界 | [同步说明与可编辑实例](figma-sync/after-268-4276.png) | [编辑键盘焦点](figma-sync/web-edit-focus.png) |
| 完整设置按钮边框 | [设置](figma-sync/after-111-4832.png) / [原稿](figma-sync/before-111-4832.png)，该正确项图像未改变 | [浅色](figma-sync/web-settings-light.png)、[深色](figma-sync/web-settings-dark.png) |
| 首页 hover 加深 | [时间三态](figma-sync/after-49-539.png)、[条件三态](figma-sync/after-49-563.png)，从左至右 Default / Hover / Pressed；[首页](figma-sync/after-49-244.png) | 源码 hover 规则及回读渐变分量对应检查；未重造深色首页稿 |
| C 空态深色主按钮 | [C 空态](figma-sync/after-270-4257.png) | [网页空态](figma-sync/web-calendar-empty.png) |
| 时刻分钟、实际用时秒 | [C 记录明细](figma-sync/after-151-4958.png) | [17 秒合成记录](figma-sync/web-calendar-short.png) |

字体显式回读通过：页面文字保持 Noto Serif SC、Noto Sans SC、EB Garamond；设置日本语按钮保留原 Noto Sans JP。与本地 Noto Serif/Sans SC Variable、EB Garamond Variable 的字体家族一致。既有书页/卷轴图像填充复用，UI 仍由可编辑文本、图标、框架、实例组成；例如编辑卷轴 17 个文本/7 个实例，新增 C 空态 14 个文本/6 个实例；没有将截图作为整页填充。

本轮工具的过大只读返回已改为有界属性/反应摘要后成功；一次截图传输中断已重新下载并实际查看。没有遗留工具阻塞。网页对照脚本最初因回退到预设后未重新选择“自定义”而等待隐藏输入，补齐正常点击流程后 8 张合成截图完整生成；未修改产品或用强制点击绕过。

本地完整证据目录：`C:\Users\fengcai\.codex\worktrees\23c1\now-what-to-do\docs\development\book-feedback-2026-11-06\figma-sync`，24 个文件约 29.24 MB，含 22 张 PNG 与 2 份 JSON。完整交接包：[figma-sync-evidence.zip](figma-sync-evidence.zip)，绝对路径 `C:\Users\fengcai\.codex\worktrees\23c1\now-what-to-do\docs\development\book-feedback-2026-11-06\figma-sync-evidence.zip`，包含本报告和上述目录。相对图片链接用于本地查看，主窗口可整体复制证据后继续使用。

初次同步记录已提交为 `afc5f8e30faa9377fa15438a99cda6bd147595d9`，其中已包含 PNG；收到归档调整时该提交已经存在，依交接要求不重写历史。后续提交只补本报告及精确目录的 PNG/ZIP 忽略规则；这些规则不改变原提交中已跟踪的 PNG。主窗口应选择性归档本报告、`change-ledger.json`、`node-audit.json` 和忽略规则，并在本地保留完整证据包，无需把初次提交的 PNG 纳入主分支。产品代码没有变化；独立代码测试结果、未完成的参与者/原型/设备边界维持原报告结论。
