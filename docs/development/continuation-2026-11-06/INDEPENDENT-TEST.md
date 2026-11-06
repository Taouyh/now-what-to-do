# 续做入口独立验收

**PASS：本轮续做入口网页验收通过，无阻断问题。** 仅批准以下固定提交的本轮范围，交主窗口负责后续合并和 Figma 同步。

- 日期：2026-11-06，Asia/Shanghai；独立测试窗口沿用 `7aa2`。
- 完整产品 SHA：`92102393d77dda9b8a89ed1f0a84cc09962fc930`，detached HEAD。
- Worktree：`C:\Users\fengcai\.codex\worktrees\7aa2\now-what-to-do`。
- 切换前完整复制并移动上轮两个未跟踪文件至忽略目录 `test-artifacts/continuation-prior-backup/`；未删除原证据。确认目标 commit 存在后 checkout，测试结束 HEAD 不变，产品跟踪文件无改动。
- Node 24.18.0、npm 11.16.0、Playwright 1.64.1、Edge 156.0.4314.58；复用本 worktree 已安装的锁定依赖。
- 仅使用 127.0.0.1:8769、临时独立 Edge contexts 和合成数据；无真实浏览器 profile、8765 数据或主目录修改。

## 命令与结果

均在上述 worktree 的 PowerShell 执行，日志位于 `test-artifacts/continuation-independent/`。

| 实际命令 | 结果 | 日志 |
| --- | --- | --- |
| `npm test` | 140/140 PASS，无跳过 | `unit.txt` |
| `npm run build:web` | typecheck、Vite、271 文件装配 PASS | `build.txt` |
| `$env:BOOK_TEST_PORT='8769'; npx playwright test tests/e2e/continuation-label.spec.ts tests/e2e/book.spec.ts --output=test-artifacts/continuation-independent/base-results --reporter=list` | 14/14 PASS，11.8 s | `e2e.txt` |
| `$env:BOOK_TEST_PORT='8769'; npx playwright test tests/e2e/independent-continuation.spec.ts --output=test-artifacts/continuation-independent/supplemental-results --reporter=list` | 2/2 PASS，5.1 s | `supplemental.txt` |

没有失败重试或修改产品。独立新增源码为 `tests/e2e/independent-continuation.spec.ts`，保留供主窗口归档。

## 本轮检查

| 内容 | 结果与证据 |
| --- | --- |
| 短名称入口与归属 | PASS。1531×715 中文显示“本次已记录”“记下次起点 · 读书”，同时推荐为“散步”；键盘 Enter 打开后自动聚焦，真实关联 label 为“读书：下次从哪继续？”，读取原说明。 |
| 保存原 taskId | PASS。填写新说明只改刚完成任务，推荐任务原说明保留；历史条数和数据不因续做保存增加/改变。 |
| 清空、取消、关闭 | PASS。补查清空后取消与修改后关闭，主数据原文逐字不变；清空后保存可以将原任务说明设为空，其他任务和完成记录保持。 |
| 长名称与可访问性 | PASS。1531 中文、390 英文深色、320 日文浅色下入口 ellipsis、完整 aria-label、至少 44px 高且在视口内。源码确认 title 保存完整名称；长标签保留完整文本及关联，视觉区域可滚动。未执行真实读屏器测试。 |
| 桌面编辑空间 | PASS。1531×715 短名称和长名称截图人工检查；保存/取消均可见且在书页内，补查两个按钮各自的横纵边界。 |
| 窄屏英文 | PASS。390×715 深色短名称显示“Note where to resume · Read”，当前推荐“Walk”；标签“Read: where will you resume?”、聚焦和 Save 可达并成功保存原活动。 |

已人工查看关键短名称入口/展开、长名称桌面展开、390 英文长名称展开、320 日文长名称入口，以及390 英文短名称入口/展开截图。共保留 12 张本轮截图。

关键截图（相对本报告）：

- [桌面短名称入口](../../../test-artifacts/continuation-independent/base-results/continuation-label-continu-71e53--saves-only-its-description/entry.png)
- [桌面短名称展开](../../../test-artifacts/continuation-independent/base-results/continuation-label-continu-71e53--saves-only-its-description/editor.png)
- [390 英文短名称入口](../../../test-artifacts/continuation-independent/supplemental-results/independent-continuation-i-5114f-ort-label-and-action-access/english-short-entry.png)
- [390 英文短名称编辑](../../../test-artifacts/continuation-independent/supplemental-results/independent-continuation-i-5114f-ort-label-and-action-access/english-short-editor.png)

## 产物与边界

独立构建 SHA-256：

| 文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `FA923E61833D0831D5880B358690A4084CEB3E413C46B392BC4FA7B9088B727F` |
| `dist/web/style.css` | `BFE4744A3111DFD0ED912C40186765A1A3B9470DD63FAEED69D686EC4EA23AA3` |
| `dist/web/index.html` | `F1A94E475632107750E64BD882DD6D971C32E5F148D7B2E50747976DEB49CACA` |

证据绝对目录：`C:\Users\fengcai\.codex\worktrees\7aa2\now-what-to-do\test-artifacts\continuation-independent`。截图与日志受 gitignore 忽略，归档时需显式复制。

未重跑上轮 43 项反馈矩阵、原生安装/升级、Android 真机、参与者测试、全部缩放或读屏器矩阵；不从网页结果推断这些通过。没有合并、推送、部署或访问/修改 Figma。后续产品变更应固定新 SHA 并复验受影响项。
