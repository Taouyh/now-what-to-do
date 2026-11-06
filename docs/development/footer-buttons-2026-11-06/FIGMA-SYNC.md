# 活动表单按钮 Figma 同步

2026-11-06，在独立 GPT 窗口及 worktree `C:/Users/fengcai/.codex/worktrees/6d2c/now-what-to-do` 完成。产品基线已核对为 `69a5df2248ad485ddc8b02403fbd3892aff83e0c`；同步分支 `codex/figma-footer-buttons-2026-11-06`。连接后先通过 whoami 核对账户 **3966592487 / 3966592487@qq.com**（user_id `1698571271826901612`）。

## 实际修改与结果

- [C 添加表单 151:4235](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4235)，按钮组 [151:4275](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4275)：[添加 151:4277](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4277) 已符合；[取消 151:4279](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4279) 由 Paper 切为现有 Leather。
- [C 编辑表单 151:4148](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4148)，按钮组 [151:4202](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4202)：[保存 151:4204](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4204) 和 [删除 151:4206](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4206) 已符合；[取消 266:4221](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=266-4221)（外层 `266:4220`）切为 Leather。
- 两处取消复用同一主组件 `111:3029`，并以添加/保存实例的反应为基准，移除旧 Paper hover/press 重复反应。五个按钮回读均完全一致：皮革三段渐变 `#a16b43 / #895332 / #63351f`、原金色描边变量 `6:7`、浅金文字 `#f1dcad`（变量 `6:8`）、投影与内阴影、6px 圆角、1px 描边、120×68、Noto Serif SC Medium 22px、150% 行高。保留稿内尺度，没有将网页 16px 强加到设计稿。
- 五个实例均指向现有 Leather hover `111:3031` 和 pressed `111:3033`。Figma hover 沿用稿内 7% 浅色叠层；网页采用 `brightness(1.09)`，两端各自复用已验收基准，不宣称两种表现计算上等价。未改主组件、组件库或变量定义。

## 回读与视觉检查

两张表单修改前后合计均为 141 个节点；除两处取消实例和随变体切换的两个文字子节点，其余 137 个节点的记录完全相同。五个外层点击动作（含取消确认及删除到 `151:4308` 的连接）、两处透明按钮组、标签、位置和尺寸指纹保持一致；具体指纹与样式结果见 [FIGMA-SYNC.json](FIGMA-SYNC.json)。

已查看两张最终 1600×1000 Figma 截图：按钮样式一致、文字清晰，无新增裁切或重叠。仅使用已提供网页截图作视觉参考，未重建或启动网页服务。

截图绝对路径（PNG 均未提交）：

- `C:/Users/fengcai/.codex/worktrees/6d2c/now-what-to-do/.cache/footer-buttons/figma-add.png`
- `C:/Users/fengcai/.codex/worktrees/6d2c/now-what-to-do/.cache/footer-buttons/figma-edit.png`
- 网页参考：`D:/code/now-what-to-do/.cache/footer-buttons/1531-light-add.png`、`D:/code/now-what-to-do/.cache/footer-buttons/1531-light-edit.png`

本次只做指定 Figma 表单按钮同步、属性/反应回读及两张静态截图检查。网页 build、既有任务表单 1/1 和八组样式检查沿用交接的独立验收结果；本窗口未重跑。不涉及确认弹层、其他页面或产品代码；不代表全 B/C 原型点击、Android 真机、升级或参与者验收通过，阶段 8 未开始。只提交本报告和精简 JSON，不 merge/push。
