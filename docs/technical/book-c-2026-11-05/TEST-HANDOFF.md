# 独立 GPT 窗口测试交接

2026-11-05。当前状态：**实现完成，独立网页验收通过**。真实报告见 [INDEPENDENT-TEST.md](../../development/book-c-2026-11-05/INDEPENDENT-TEST.md)，实现和开发者平台检查见 [IMPLEMENTATION.md](../../development/book-c-2026-11-05/IMPLEMENTATION.md)。以下为实际交接记录；后半部分保留后续迭代的流程和模板。

## 1. 开发窗口先交付什么

每个可验收切片自测完成后填齐以下信息，最终整合版再完整执行一次。缺少固定提交或实际启动入口时，不把测试结论写成整版通过。

| 字段 | 本次交接记录 |
| --- | --- |
| 待测分支与完整 commit SHA | 源分支 design/minimal-ui；网页最终验收 c388cd8abcd138e55230f9c008cb5cf5d58d0605；仅包装追加修复 948952aabab7594e5c7e631a219551c0cc162c50 |
| 切片与 PRD 验收范围 | B 首页/专注/设置，C 任务/日历；C01–C11 网页行为及数据/计时/备份保留能力。Android 真机、研究与完整无障碍边界见报告 |
| 工作树状态 | 测试基线为已提交 detached HEAD；独立测试文件和证据另外生成，不修改产品代码；主目录其他窗口的 docs/weekly/ 不属本次代码 |
| 测试 worktree 绝对路径 | C:\Users\fengcai\.codex\worktrees\cd53\now-what-to-do；独立 GPT chat 01a1ab9a-9601-7e91-8357-bf9ab63c3812 |
| 安装/构建/启动命令 | npm ci --ignore-scripts；npm test；npm run build:web；npm run test:e2e；npm run preview；补充测试命令见报告 |
| URL、端口、浏览器/WebView 版本 | 生产预览 http://127.0.0.1:8765；独立验收生产产物 8766、探针 8767；Edge/WebView2 156.0.4314.58，Playwright 1.64.1，Node 24.18.0 |
| 平台产物与 SHA-256 | 见下表；Windows 隔离安装/运行/卸载通过，Android 仅构建/签名/资源检查，无真机证据 |
| 开发者检查结果、已知问题 | Node 137、Edge 10、build:web 通过；主目录 .cache/installer-result.txt、.cache/windows-build.txt；独立截图/日志在测试 worktree 的 docs/development/book-c-2026-11-05/independent-evidence* |
| 合成数据与故障注入方法 | tests/book-contracts.test.cjs、tests/e2e/book.spec.ts 与 tests/independent：虚拟任务、历史记录、时钟、localStorage 写失败及外部写入；每测试新 context，原生测试新 profile；未使用个人备份 |

最终产物 SHA-256（包装修复前后 Web 三文件相同）：

| 文件 | SHA-256 |
| --- | --- |
| dist/web/app.js | DF2BB17EF09C296F21880824603AE48158C423D6C130392E00A3A73508C0A768 |
| dist/web/style.css | 80129ED23F9F3E24576B3C2E4F44491EB234A69265245ECB4073C0ED036BA8C3 |
| dist/web/index.html | A62E7DB123C0D53B7BD55F4ABB3A84A167C13DA634AE1416803FB939E95001A1 |
| dist/windows/Now-What-1.4.0-Windows-x64-Setup.exe | A29B001B87786A3896E0508273E2F4B3A4EC69F4FB18F68CCDC7B9A5C32CB77A |
| dist/android/Now-What-1.4.0-Android.apk | 5B6A9CA079A1DC67091BDAE537B082EF0D3EE19C30163C2D00BF89981BC0D02E |

安装包为本地构建产物；后续重新构建的原生二进制可能因构建元数据而哈希不同，交接时应重新记录。没有创建公开 release 或版本 tag。

跨 worktree 复建时，Git 的 CRLF/LF 转换可改变 source map 和直接复制的文本素材字节；独立复核确认本次三个 Web 运行文件哈希相同。安装器完整性必须对比该安装包的原配 payload，不能用另一目录的调试映射代替；具体差异和证据见报告追加记录。

测试 worktree 必须从已提交 SHA 建立；依赖、产物和未跟踪设计资料不会自动被 worktree 携带。开发窗口先确保必要文件已进入该提交，再在干净环境复现。未提交主工作树不宜交由另一窗口一边测试一边修改。

## 2. 可以直接交给另一个 GPT 的任务

将以下内容与上表填写值一起放入一个**新的 GPT 窗口**：

> 请独立验收 Now What 的指定提交。先阅读根 AGENTS.md、当前阶段指南和交接表，按 TECHNICAL.md 第 9 节的 PRD 矩阵测试。只使用独立测试 worktree、独立浏览器 context 和合成数据，不改真实用户资料，不替换真实主数据，不切换开发窗口的分支，不合并或发布。
>
> 先确认 SHA、工作树、实际可执行命令和产物一致，再做单元回归、真实浏览器点击、键盘/焦点、目标窗口截图、刷新恢复、计时边界、分页、真实文件备份与失败重试。既有 browser-*.cjs 可能只是场景模块，不能用“模块加载无报错”代替执行用例。需要原生平台时检查真实打包产物，无法执行则写未测。
>
> 给出按优先级排序的问题，每个问题附环境、复现步骤、期望、实际、截图/日志和对应 PRD 条目。区分已通过、失败、阻塞、未测；不要把未运行项目写通过。先报告问题，修复交回开发窗口；若要做验证性修改，另建测试分支，不能无声修改待测基线。最后生成独立测试报告并记录完整 SHA。

若新窗口支持独立 agent，也仍须独立工作树和状态；仅把当前窗口的结论改写一遍不构成独立验收。由开发窗口负责追踪问题和修复，不把交接当成工作结束。

## 3. 报告模板

```text
测试日期与测试者窗口：
commit SHA / 分支 / 工作树：
运行环境与产物 SHA-256：
实际执行命令：
合成数据说明：

验收条目 | PASS / FAIL / BLOCKED / NOT RUN | 证据路径

问题：
- ID / 严重程度 / 对应需求
- 前置数据与复现步骤
- 期望与实际
- 截图、日志、受影响平台

未测项目与原因：
结论：允许合并 / 修复后复测 / 证据不足
复测记录：新 SHA、修复项、相关回归、结果
```

## 4. 合并标准

- 数据丢失、重复记账、投入错误、核心路径不可达等阻断问题必须修复并独立复测。
- 本次切片适用的 PRD 验收、现有 v1.3 保留能力和必要平台检查通过；不适用/未测项有明确边界，不能一句“全部通过”。
- 验收完成后若又改代码，报告要指向新 SHA，并补受影响测试；不能用旧提交报告批准新提交。
- 最终合 master 前刷新远端状态、处理冲突并复测；合并后对 master 构建和核心旅程冒烟。发布安装包另走阶段 8。

原型参与者测试仍由产品研究记录承接；独立 GPT 的代码验收不证明真实用户使用效果。
