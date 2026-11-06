# 表单按钮独立样式验收

**PASS，无阻断问题。** 2026-11-06，独立窗口 `7aa2`，固定产品 SHA：`69a5df2248ad485ddc8b02403fbd3892aff83e0c`（detached HEAD）。

Worktree：`C:\Users\fengcai\.codex\worktrees\7aa2\now-what-to-do`。切换前把上轮未跟踪报告与补查源码完整备份至忽略目录 `test-artifacts/footer-prior-backup/`，未删除。测试结束 HEAD 不变，产品跟踪文件无改动。

运行环境：Node 24.18.0、Playwright 1.64.1、Edge 156.0.4314.58。仅用 `127.0.0.1:8769` 和全新临时 contexts、合成数据；没有访问 8765 或真实用户 profile。

| 实际命令 | 结果 |
| --- | --- |
| `npm run build:web` | PASS，类型检查及 271 文件生产构建 |
| `$env:BOOK_TEST_PORT='8769'; npx playwright test tests/e2e/book.spec.ts --grep 'task groups' --output=test-artifacts/footer-independent/e2e-results --reporter=list` | PASS，1/1，4.4 s |
| `node test-artifacts/footer-independent/check.cjs` | PASS，8/8 组样式与交互检查 |

8 组为 1531×715 / 390×715 × 浅色/深色 × 添加/编辑。每组新 context，添加的添加/取消、编辑的保存/取消/删除，逐项与该表单保存/添加按钮比较：背景渐变与背景色、四边边框、圆角、文字颜色、阴影、字体/字号/字重/字形、行高、高度/最小高度、padding、filter **完全一致**。字号为 16px、高度至少 44px；hover 全部为 `brightness(1.09)`，悬停样式也逐项相同。

每组执行取消草稿并核对存储原文不变；编辑的四组另验证删除确认、取消确认回到原草稿、最终确认删除成功。既有用例同时覆盖保存、校验、取消、删除及分页边界。未发现行为回归。

人工查看全部 8 组普通截图，以及桌面深色/窄屏浅色编辑的 hover 截图，按钮渐变、尺寸和排布一致、文字完整且操作可见。共保留 16 张截图。

证据绝对目录：`C:\Users\fengcai\.codex\worktrees\7aa2\now-what-to-do\test-artifacts\footer-independent`。

- `build.txt`、`e2e.txt`、`visual.txt`：原始执行日志。
- `style-results.json`：8 组每个按钮普通/hover 全部计算样式及浏览器版本。
- `check.cjs`：本次临时检查脚本，处于忽略目录，没有新增永久自动测试。
- 截图：`1531-{light,dark}-{add,edit}.png`、`390-{light,dark}-{add,edit}.png`；对应 `-hover.png` 为取消按钮 hover。示例：[桌面编辑](../../../test-artifacts/footer-independent/1531-light-edit.png)、[窄屏深色编辑](../../../test-artifacts/footer-independent/390-dark-edit.png)。

按本轮范围未跑全核心 140、上轮 43 项、全部语言/缩放矩阵或原生安装；不据此推断未测项通过。未修改产品、访问 Figma、合并、推送或部署；后续集成和 Figma 同步由主窗口负责。证据受 gitignore 忽略，归档时需显式复制。
