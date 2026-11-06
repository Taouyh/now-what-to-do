# 续做反馈 Figma 同步

2026-11-06。状态：完成本轮反馈入口与展开草稿的定向同步、节点/反应回读及截图检查。

## 固定依据与隔离

- 产品固定 SHA：`92102393d77dda9b8a89ed1f0a84cc09962fc930`。
- 依据：本目录 `IMPLEMENTATION.md`、`src/ui/pages.ts` 与 `src/ui/styles/book.css`。开发者最终合成截图来自 `D:\code\now-what-to-do\.cache\continuation-9210239\continuation-label-continu-71e53--saves-only-its-description\entry.png` / `editor.png`。
- 140 核心、build、14 浏览器与 2 项针对性补查通过由独立窗口交接；本窗口没有重新执行这些测试，也未构建或启动网页服务。
- 独立 GPT 窗口/worktree：`C:\Users\fengcai\.codex\worktrees\dad8\now-what-to-do`。起点即上述 SHA，初始无未提交改动；分支 `codex/figma-continuation-sync-2026-11-06`。
- Figma 访问前 whoami 核对：handle `3966592487`，email `3966592487@qq.com`，user ID `1698571271826901612`。会话 `372e313b-0c1b-47f0-b38c-93bbce933de2`。
- 使用 `figma-use`、`figma-generate-design`。仓库无 Code Connect 文件；已查团队库的“续做反馈”“纸签”，无匹配发布资产。本轮直接复用原有纸色按钮实例、变量、字体与书页，不扩建组件库。

## 实际同步

| 范围 | 节点与结果 |
| --- | --- |
| 已有展开示例 | [205:4085](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=205-4085)；保留为展开态，当前推荐“散步”，刚完成活动“读书”，示例草稿“第 12 页”。 |
| 首页动态反馈 | [203:4007](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=203-4007)；入口 [203:4011](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=203-4011)，新增 label `278:4307`。 |
| 完成返回动态反馈 | [203:4032](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=203-4032)；入口 `203:4036`，label `278:4314`。 |
| 放弃页的既有隐藏副本 | [203:4491](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=203-4491)；同步内部结构，继续隐藏，不把放弃改成记录成功。 |

- 状态行统一为“本次已记录”，关闭移至行尾；原关闭动作不变。
- 原纸色按钮实例扩为完整单一边框。可编辑文字显示“记下次起点 · 活动名”，动词稍重，长名称末尾省略。没有修改共享按钮组件。
- 动态入口与可见 label 均绑定原 `续做反馈/刚结束活动`（`VariableID:203:4003`），不绑定当前推荐名称。独立展开示例仅在自身文本上固定“读书 / 散步”，未改全局变量默认值。
- 展开 label 由活动名和“：下次从哪继续？”组成。保存、取消、清空与输入的原动作保留；保存仍检查结束活动序号及既有活动槽位，再写该槽位说明。
- 反馈接入现有右页自动布局；填写时隐藏原有留白并使用紧凑标题，入口态保留原标题/留白。动态可见性继续使用既有“正在填写 / 未填写”变量。
- 只改该反馈及必要关联布局。既有书页、Noto 字体、25 分钟的历史合成上下文及其他页面保持；没有新增整页截图填充、重做 B/C 稿或移动稿。

## 检查与证据

- 24 个原业务控件反应的序列化摘要在修改前后全部一致；入口外层额外复制原点击反应，使文字区域与原纸色实例有一致动作。
- 回读确认三个动态副本的活动名与 label 仍绑定刚结束活动变量，反馈/草稿的原可见性绑定保留。
- 字体显式回读为 Noto Sans SC / Noto Serif SC；与源代码的 Variable 字体家族及网页对照截图一致。
- 已查看完整入口、最终编辑截图并与开发者截图比较：完整边框、名称归属、label、纸色输入、保存/取消无裁切或重叠。编辑示例反馈高度 190，全部处于原书页内。
- 最终 `205:4085` 恢复为展开态。入口截图通过同一现有示例临时切换显示生成，未新增整页副本；动态入口仍在上述实际关联节点中。
- 精简节点、绑定与反应摘要见 [figma-sync.json](figma-sync.json)。PNG 均在被忽略的本地证据目录，不纳入提交。

本地证据目录：`C:\Users\fengcai\.codex\worktrees\dad8\now-what-to-do\.cache\figma-continuation-sync`。

| 证据 | 文件 |
| --- | --- |
| 同步前编辑态 | `before-editor.png` |
| 同步后入口 / 最终编辑态 | `after-entry.png` / `after-editor.png` |
| 固定实现对照 | `web-entry.png` / `web-editor.png` |

## 原型边界

Figma 原输入点击仍填入固定示例文字，清空仍操作草稿变量，保存仍演示既有活动槽位；它不支持任意真实输入、DOM label 关联、真实持久化或任意 taskId。产品的真实输入/保存以固定 SHA 及独立测试为准。本次完成属性、反应与截图检查，没有宣称全 B/C 原型实点、参与者、Android 真机、升级或发布验收。

本窗口只提交本报告与精简 JSON；未修改产品、主工作树，未 merge 或 push。
