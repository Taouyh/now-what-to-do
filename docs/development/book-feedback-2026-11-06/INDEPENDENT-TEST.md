# 2026-11-06 浏览器反馈独立验收

结论：**PASS，本轮 11 条浏览器反馈的网页验收通过，无阻断问题。** 本结论仅适用于下列固定产品提交；可以交回主窗口进行后续集成判断。此窗口没有合并、推送、发布、安装或访问 Figma。

## 固定基线与隔离

- 测试日期：2026-11-06，Asia/Shanghai。
- 独立 GPT 测试 chat：`01a1aec5-0bd2-7a43-ba37-2e62a1732fcc`。
- 分配 worktree：`C:\Users\fengcai\.codex\worktrees\7aa2\now-what-to-do`。
- 入场时工作树干净，detached HEAD 为 `051f6f3`；确认指定对象存在后执行 `git checkout --detach 2624744f6d564c94910c23f9439239dedaf6783e`。
- **完整受测产品 SHA：`2624744f6d564c94910c23f9439239dedaf6783e`**；测试结束 HEAD 仍为该值，产品跟踪文件无改动。仅新增本报告和独立测试源码。
- Node `24.18.0`、npm `11.16.0`、Playwright `1.64.1`、Microsoft Edge `156.0.4314.58`，Windows。
- 测试服务仅 `http://127.0.0.1:8769`，Playwright 自动启动/关闭生产静态服务，`reuseExistingServer: false`。各测试使用临时独立 Edge context、合成任务/记录；没有连接真实用户 profile、访问用户备份或操作 8765。
- 已阅读根 AGENTS、当前开发阶段指南、development rules、TECHNICAL、TEST-HANDOFF 及本轮 IMPLEMENTATION。遵循本次明确范围，不因旧阶段标签停止，也不执行 Figma 同步。

## 实际执行与结果

命令在本 worktree 的 PowerShell 执行。

| 命令 | 结果 | 原始日志（相对 worktree） |
| --- | --- | --- |
| `npm ci --ignore-scripts` | PASS，安装 300 packages | `test-artifacts/independent-feedback/.cache-independent-install.txt` |
| `npm test` | PASS，140/140，无 skip | `test-artifacts/independent-feedback/.cache-independent-unit.txt` |
| `npm run build:web` | PASS，typecheck + Vite + 271 文件装配 | `test-artifacts/independent-feedback/.cache-independent-build.txt` |
| `$env:BOOK_TEST_PORT='8769'; npx playwright test tests/e2e/feedback-controls.spec.ts tests/e2e/book.spec.ts` | PASS，21/21，24.5 s | `test-artifacts/independent-feedback/.cache-independent-e2e.txt` |
| `$env:BOOK_TEST_PORT='8769'; npx playwright test tests/e2e/independent-feedback.spec.ts --output=test-artifacts/independent-feedback/supplemental-results --reporter=list` | PASS，15/15，33.4 s（追加以下 7 项之前） | `test-artifacts/independent-feedback/supplemental.txt` |
| `$env:BOOK_TEST_PORT='8769'; npx playwright test tests/e2e/independent-feedback.spec.ts --grep 'genuinely empty\|actually darkens' --output=test-artifacts/independent-feedback/exit-hover-results --reporter=list` | PASS，追加 7/7，12.7 s | `test-artifacts/independent-feedback/exit-hover.txt` |

合计核心 140 项、真实浏览器 43 项（既有 21 + 独立新增 22）通过。没有把仅加载 browser 场景模块作为验收。

首次独立补充脚本 6 通过、9 失败：错误假设名称输入框后按一次 Tab 即进入首个 checkbox，漏算原生 details summary 的停靠点。改为真实 Tab 遍历至目标 checkbox（上限 12 次），没有 `force` 点击或产品改动；修正后 15/15。首次记录保留于 `harness-first-run.txt` 和 `harness-first-run/`，不计为产品失败或最终通过证据。

## 11 项反馈结论

| 批注 | 结果 | 独立确认内容 |
| --- | --- | --- |
| 1 空白自定义时间 | PASS | 确定、关闭、Esc、summary Space、外部点击、切页 6 路径：既有集验证空格；补充集从有效 25 分钟草稿清为真正空串，均回到 10 并持久化，刷新仍为 10。实际开始预算 600000 ms。 |
| 2 输入去重复边线 | PASS | 1531/390/320 × 715 截图及 computed style：input 无边框/outline，外层数字和单位控件保留边框与整体焦点。 |
| 3 时长菜单及兼容 | PASS | 菜单顺序 10/15/20/30/60/自定义，20 选择刷新保留；独立浏览器加载旧 5、真实文件导入 20；1/1440 有效且临时自定义不污染已保存预设。 |
| 4、6 添加/编辑按钮组 | PASS | 三宽度添加、编辑的组背景透明、无组边框；按钮自身边框可见。既有保存/取消/删除路径继续通过。 |
| 5 四条件提示 | PASS | 三语言 × 三宽度 × 深浅主题 × 添加/编辑 × 四条件，共 144 个组合：准确译文、黑底白字、无 transition 延迟、viewport 内及所有 overflow 祖先不裁切；真实 Tab 到每个 checkbox 后也可见。 |
| 7、8 设置完整右边框 | PASS | 三宽度深浅主题中 group overflow 可见、无外层右边框，每个语言/主题按钮自身右边框 1px，边界在视口内。补充截图覆盖中英日和两主题。 |
| 9 首页两入口悬停 | PASS | 深浅主题时间/条件两个入口 computed background 每个颜色 stop 的加权亮度均降低，并保存截图。 |
| 10 日历空态去开始 | PASS | 复用 primary 深色渐变按钮，深浅主题截图及点击返回推荐首页通过。 |
| 11 分钟时刻与精度 | PASS | 17,001 ms 合成记录起止显示 HH:mm–HH:mm，实际仍显示 17 秒；展开后暂停 1 秒。原时间戳、17001/1234/2345 ms 和未知精度字段在存储、真实下载导出、20 分钟导入后保持。跨日带日期、缺失时间文案由本次实际执行的核心测试覆盖。 |

## 针对性保护与回归

- `0/-1/1.5/1441/abc/1e2/Infinity` 在真实浏览器确认时保留错误和草稿，不默认为 10、不启动计时、不改持久主数据。Esc 后仍没有会话；有效自定义 1/1440 只在本次运行有效，刷新回已保存 60。
- 主数据 `Storage.prototype.setItem` 注入 `QuotaExceededError`：空白确认、Esc、切页均提示保存失败，原始主数据逐字不变、没有新计时；解除故障重新确认后可成功保存 10。
- 真实浏览器检查暂停会话在导航/主题切换后 `activeTimer` 原文不变，没有额外记录；结束后新会话使用 10 分钟回退且拥有不同 completionId。
- 核心 140 项覆盖运行中/暂停计时不随时间或条件修改而改变、空白回退失败不改 activeTimer、checkpoint 失败冻结可信投入、恢复不补算离线、长暂停分段、幂等完成、记录写入/清理失败及精确时间汇总。
- 既有浏览器 10 项也独立通过：真实添加到完成和续做、任务分页/删除、历史分组/分页、恢复放弃、语言主题/窄屏、长说明、损坏数据导出、第二标签 Web Lock 及 file-origin 外部写保护。

## 产物和证据

独立构建运行文件 SHA-256：

| 文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `5A4086F4E254DB2041D31C8673C270D90663544B177E23F5ADA4D015EFD12795` |
| `dist/web/style.css` | `1C35A001756B0D1FC2D1943EBFE5A98FCE6FEDA20B7B35FA9746380765FAB219` |
| `dist/web/index.html` | `F1A94E475632107750E64BD882DD6D971C32E5F148D7B2E50747976DEB49CACA` |

- 补充测试源码：`tests/e2e/independent-feedback.spec.ts`（22 项，保留供主窗口归档）。
- 证据根：`C:\Users\fengcai\.codex\worktrees\7aa2\now-what-to-do\test-artifacts\independent-feedback`。
- 最终通过截图：`baseline-results/` 15 张，`supplemental-results/` 54 张，`exit-hover-results/` 4 张，共 73 张；截图使用 1531×715、390×715、320×715 viewport，小屏 fullPage 高于 715 反映既有可滚动布局。
- 已人工查看代表截图：1531 中文时间/编辑/设置、英文编辑；390 中文时间/日文添加；320 中文时间/深色设置、英文深色编辑、日文深色添加，以及深色日历空态。观察到单层输入、透明按钮组、完整右边框和完整黑白提示，无本轮阻断外观问题。其余组合以自动几何/样式检查和保留截图为证，不宣称逐张人工审图。
- 便于转交的归档：`test-artifacts/independent-feedback-evidence.zip`，包括最终截图、日志、独立测试源码与本报告；生成文件受 gitignore 忽略，主窗口归档时需显式复制。

## 未测边界与后续

- 未重做 Windows/Android 原生安装、真实用户安装升级、签名/商店发布、Android 真机或参与者研究；这些不由本次网页通过推断。
- 没有扩展为历史全矩阵、全部浏览器、全部系统缩放或读屏器验收。三语言提示的 hover/键盘和所列视口是本次明确覆盖范围。
- 未访问或修改 Figma；后续受影响页面/组件同步由主窗口按用户指令另建窗口处理。
- 本报告只批准受测固定 SHA 的本轮网页范围。后续产品修改需重新固定 SHA 并复验受影响项；合并及合后冒烟由主窗口负责，本测试窗口不执行。
