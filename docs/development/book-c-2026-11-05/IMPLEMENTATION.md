# B/C 书版实施与验证

2026-11-05，版本 1.4.0，开发分支 `design/minimal-ui`。首版产品与打包代码基线：`948952aabab7594e5c7e631a219551c0cc162c50`。本地开发交付，尚未发布。后续日历名称适配修复见 [CALENDAR-LAYOUT-FIX.md](CALENDAR-LAYOUT-FIX.md)，其 Web 更新不改写首版安装包验收记录。

## 实现

- 使用账户 3966592487 的实时 Figma 设计上下文和原始素材，实现旧书书壳、首页、任务双页、添加/编辑卷轴、专注与恢复、完成续做、今天记录与设置。
- 任务每组 10 项；日历目录每页 5 组、记录每页 4 条；保留任务顺序、历史任务 ID、快照名称和精确投入。
- 每次启动重置四项环境条件；完成时记录和条件重置同次写入；清理失败可重试。会话深复制任务快照；续做仅改原任务说明。
- 本地字体、图像、SVG；本地存储格式、平台来源、用户数据目录和 Android 签名身份沿用原项目。
- 新页面使用 TypeScript，旧 JS 核心由 Vite 打入唯一 IIFE。详细边界见技术文档 TD 1.1，尚未完成全部领域模块抽离。

## 可运行入口

在仓库根目录执行 `npm ci`，然后：

| 命令 | 用途 |
| --- | --- |
| `npm run web` | 构建并在 http://127.0.0.1:8765 提供生产预览 |
| `npm run dev` | 同端口 Vite 开发服务器，不能与预览同时运行 |
| `npm test` | 业务、迁移、计时和故障回归 |
| `npm run build:web` | TypeScript 检查、IIFE 和静态资源构建 |
| `npm run test:e2e` | 独立 Edge 浏览器 context；测试端口 8766 |
| `npm run build:windows` | 使用已有本地 WebView2 SDK、MSVC、NSIS 构建 |
| `npm run build:android` | 使用已有 Android SDK、JDK 和本地签名身份构建 |

非 Windows 环境若未安装 Edge，调整 Playwright channel 或安装对应 Chromium 后运行；不把缺浏览器当通过。

## 开发窗口证据

- 137 项 Node 回归已通过，包含新增 16×16 筛选组合、16 种条件×4 种结束状态、条件重置、快照、续做、checkpoint 失败和外部写入冲突。
- `npm run build:web` 已通过；本地运行资源无远程字体或 Figma URL 依赖。
- `npm audit --omit=dev` 未报告生产依赖漏洞；完整开发依赖审计仍报告 6 项 moderate，未用自动升级改动本轮锁定工具链。后续工具链维护应单独评估并回归，不将它表述为全依赖零风险。
- Windows 1.4.0 安装包与 Android 1.4.0 / versionCode 6 APK 已构建；打包成功不等于安装升级/真实设备验收通过。
- 10 项 Playwright 场景整套通过，包括任务、日历、续做、恢复、语言主题、真实滚轮分页、长说明边界、损坏原文保护、同来源 Web Locks 与 file 来源回退保护。
- Windows WebView2 156.0.4314.58 已用 `tests/native-book-smoke.cjs` 在独立合成 profile 验证真实文件导出、来源与沙箱、PNG/SVG/WOFF2 加载、暂停关闭、重启恢复和单条完成。隐藏原生窗口不支持可靠截图，本次原生冒烟不冒充视觉验收。
- `tests/package-contents.cjs` 逐一核对 271 个 Web 生产文件与两个原生包。发现并修复 Windows aapt2 写入 APK 的嵌套路径反斜杠问题，规范化后再对齐、签名和校验。
- `tests/book-scale.cjs` 使用 1,000 项任务和 10,000 条记录：2,293,547 字节，写入约 9.2ms、重载约 213ms、同步任务渲染 1.6ms、日历渲染 7.3ms、目录翻页 13ms。环境为 Ryzen 7 7735H、约 15GiB 可用物理内存容量、Edge 156.0.4314.58。这是单次本机观察，同步渲染时间不含完整绘制，不承诺所有设备性能。
- `tests/windows-installer.cjs` 真实安装到含空格的隔离目录，逐个比对安装后的 271 个 Web 文件，实际启动 WebView 执行导出/恢复/完成，再卸载；已通过。修复了 NSIS 只收录第一层资源的问题。卸载只移除打包清单内文件及空目录，实测保留根目录及 assets 内无关文件，未触碰真实安装或个人 profile。
- 独立窗口发现并复验关闭了窄屏真实滚动、深色按钮/标签、专注长说明、保存后焦点、保护页初始焦点和 file 来源外部写入保护问题。完整历史与对应提交见 [独立验收报告](INDEPENDENT-TEST.md)。

## 独立验收与边界

另一个 GPT 窗口“独立验收 Now What 1.4 书版”在 `C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do` 独立验收。网页最终基线 `c388cd8abcd138e55230f9c008cb5cf5d58d0605`：Node 137/137、既有浏览器 10/10、补充浏览器 17/17、缺陷复验 5/5、64 条条件组合及真实 file 来源探针均通过；没有未关闭的已观察缺陷。后续 `948952a` 仅改 Windows 包装及其测试，Web 产物哈希不变，追加复核见独立报告。

独立源码归档到 `tests/independent`；截图/trace 保留在独立 worktree 的 `docs/development/book-c-2026-11-05/independent-evidence*`，未把大量测试图片混入产品资源。固定 SHA、运行命令和产物哈希见 [测试交接](../../technical/book-c-2026-11-05/TEST-HANDOFF.md)。

`948952a` 追加独立验收已通过：复建 Web 与运行文件哈希一致，真实安装后 271 项资源完整，原生导出/恢复/完成通过；卸载后独立核对 277 个自有文件已移除，两处无关哨兵保留。测试以 `/S _?=` 直接调用卸载器，留下执行中的 `Uninstall.exe`，不代表普通交互卸载、自删除、注册/快捷方式或升级流程已验收。独立窗口使用指定哈希的开发者构建包，未独立重新编译 Windows 安装器。

尚不能宣称通过：Android 真机生命周期、真实安装升级、系统休眠/断电、完整屏幕阅读器和系统缩放、真实用户参与者测试。390×844 已通过浏览器可用性检查，但移动旧书布局仍是降级适配，不是已批准的完整移动设计。APK 已构建且资源/签名检查通过，不等于真机验收，也不替换公开发布包。阶段 8 尚未启动。

## 版本记录

2026-11-06 的自定义时间、按钮边框、即时提示和日历显示修订，见 [11 项浏览器反馈交付](../book-feedback-2026-11-06/IMPLEMENTATION.md)。本页以下保留 11 月 5 日初始实施的验证边界。

保留原仓库和原始历史，先提交原有界面改动与设计文档，再分别提交实现、测试和缺陷修复。源分支仍为 `design/minimal-ui`，独立验收通过后本地快进合入 `master`，随后在独立集成 worktree 构建和跑核心旅程。没有重写历史、推送或发布。其他窗口新建的 `docs/weekly/` 保持原状，不进入本次提交。

合并实际记录：`origin/master` 刷新后仍为 `4ed3aa165c4f37da066bdd4709ab06224c7fd15e`；本地 `master` 在 `D:\code\now-what-to-do-integration` 快进到已验收代码 `948952aabab7594e5c7e631a219551c0cc162c50`。在该集成目录重新 `npm ci --ignore-scripts`、`npm run build:web`、`npm test`（137/137），并以端口 8770 运行 `npm run test:e2e -- --grep 'empty library'`（1/1），验证创建任务、专注、暂停、导航、完成与下一步记录。日志在集成目录 `.cache/`。其后仅同步本次交付文档、独立测试源码与证据忽略规则，不改变已验收产品代码。
