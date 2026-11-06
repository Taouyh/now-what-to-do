# 紧凑文案、统一翻页与专注主按钮 Figma 同步

2026-11-06。**本轮限定范围的可编辑设计同步、动作回读与九张最终截图检查通过。** 这不是完整 B/C 原型实点、网页功能、Android 或参与者验收。

## 固定依据与隔离

- 产品固定提交：`703c988cfe3223e2225a30b3b2402c932d1a64a9`。读取本目录 IMPLEMENTATION、`app.js`、`index.html`、`src/ui/pages.ts`、`src/ui/styles/book.css`、`i18n.js`。按阶段 7 指南读取当前 TECHNICAL 与 development rules。
- 本独立 GPT 窗口/worktree：`C:/Users/fengcai/.codex/worktrees/c69c/now-what-to-do`；进入时干净，HEAD 为上述固定产品提交。分支 `codex/figma-compact-navigation-2026-11-06`。未修改产品文件、merge 或 push。
- 访问设计前 whoami 确认 handle `3966592487`、email `3966592487@qq.com`、user ID `1698571271826901612`。文件 `EUoXZR1hDJUUPVAtrDxpE5`，页面 `49:243`；session `afe7a4fa-13f9-49c6-a446-9815ce967d98`。
- 使用 figma-use、figma-generate-design，以及定向组件更新所需的 figma-generate-library。仓库没有 Code Connect 文件；读取订阅库后搜索“C 任务书册”“翻页胶囊”，未找到适用发布组件。复用文件内设置胶囊 `296:4292 / 296:4311`、首页条件/竖书签和既有专注组件，按本轮 CSS 校正颜色。未重做上一轮 paper-controls。
- 已只读根仓库独立报告，报告提交 `25a061916931d1555baf3a8a7f68dd42222c18ac`：最终 `703c988` 实际复测 3/3 尺寸；此前 10 组及功能 3/3 的实际执行提交仍为 `e6640b5`，按差异继承。本窗口没有重跑这些网页测试。

## 实际同步

全部修改在既有页面 `49:243`；完整翻页实例 ID 见 [figma-sync.json](figma-sync.json)。

| 项目 | 实际节点与结果 |
| --- | --- |
| 首页英文/日文短文案 | 以 [B 首页 49:244](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=49-244) 的条件 `49:580`、竖书签 `49:622` 为基础，在小型可编辑语言区 `346:4346` 展示 EN `Conditions / Choose`、JA `今の状況 / 選ぶ`。既有首页仍为中文，不重建整页。 |
| C 任务翻页 | [151:3405](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3405)、`151:3813`、`205:4260` 的六个实例换胶囊，任务翻页顶部 y=679.119、44px 高，对应 786px 书页底部约 8%。左右 x=116 / 1188。保留五行任务空间。中间页码 `151:3812 / 151:4147 / 205:4339` 仅隐藏，原文字与动态绑定保留。 |
| C 日历翻页 | `151:4354 / 4661 / 4958 / 5298 / 5612 / 5926 / 6240 / 6554 / 6858 / 7162 / 7466` 的 22 个目录按钮和读书明细两页的四个按钮，共 26 个实例同步；日历页码保持可见。空日历 `270:4257` 原本无翻页，不添加伪分页。 |
| 删除确认 | [151:4308](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4308) 的 `151:4349 / 151:4351` 同为 180×44、24px 圆角、18px 字号的相同胶囊。取消在左、删除在右，业务动作仍分别在原容器 `151:4350 / 151:4348`。短标签为“删除”，语言区显示 Delete / 削除；说明 `151:4338` 补齐当前实现的完整删除与备份警告。 |
| B 专注运行/暂停 | 既有组件集 `71:1035` 的 Pause、Resume、End 各三态，共九个源变体精准更新。运行 [71:1045](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=71-1045)、暂停 `71:1219`，以及说明展开 `71:1338 / 71:1419` 继承同套棕色 primary。原计时动作保留。 |
| 恢复与长暂停 | [203:4267](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=203-4267) 的 `203:4345` 改为 primary、“结束并记录”，与 `203:4344` 同样式；普通恢复仍显示“继续本次”。新增小型长暂停样例 `346:4455` 显示“接着做 / 结束并记录”及分段说明。“放弃本次”原实例 `203:4554` 的外观与动作未改。 |

## 组件与状态边界

新定向胶囊组件集 [342:4359](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=342-4359) 只有 Light / Dark × Default / Hover / Focus / Disabled 八态，复用现有胶囊基础，没有扩建无关设计库。可编辑 Label 属性为 `Label#342:1`。应用到 32 个翻页实例和两个删除确认实例；同组尺寸、字体和配色一致。

- 翻页为 120×44、24px 圆角、18px Noto Serif SC Medium。删除确认同组件扩宽至 180px；同组两按钮等宽等高。
- Light 普通 `#f8ebc9 → #d6b783`，Hover/Focus `#edd9af → #be965d`、边框 `#895332`；Dark 普通 `#503d2c`，Hover/Focus `#38291e`、边框 `#d2b88e`。所有态保留同一低位阴影，没有新焦点外发光线；禁用透明度 0.38，无 hover 动作。
- Default 有指向同主题 Hover 的外观连接；Focus 为独立可编辑视觉态，不伪造 DOM 键盘焦点。分页没有 selected 语义；原时间选中状态、设置胶囊及其他历史组件未重做。
- 专注 Pause/Resume/End 同为 `#a16b43 → #895332 (22%) → #63351f`，`#c59b60` 边框、6px 圆角、浅色文字；Hover 按 1.09 亮度，沿用原三态动作。结束与对应暂停/继续的填充、边框、阴影回读完全一致。
- [状态区 346:4343](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=346-4343) 为 1240×1474，含语言、深浅四态、删除警告、运行/暂停与长暂停样例。包含 120 个子节点、51 个 TEXT、27 个 INSTANCE、零图片填充，主要为可编辑文字与实例；没有导入整页截图替代设计。
- 现有设计变量只有原“暖棕旧书”模式。深色通过胶囊 Theme 变体和状态区表达；本轮未创建全局主题切换或整页 EN/JA 路由。

## 有界验证

1. 修改前记录目标范围 316 个含 reactions 的节点摘要（序列化 FNV-1a）；最终 282 个未改节点的摘要全部一致。34 个预期变化仅为 32 个翻页和两个确认实例：更换旧 Paper/Leather 的 hover/press 为新胶囊 hover，禁用实例不再含 hover。最终该范围 299 个节点含 reactions，未出现预期集合外变化。原容器上的翻页、取消、删除、计时与放弃动作均保持原摘要。该检查不是原型实点。
2. 删除确认实例遗留的 Leather hover/press 已清除，实际 hover 目标均为 `342:4345`；不会跳回旧皮革变体。可用分页 hover 同样回读为新胶囊；禁用分页无动作。空任务下一页继续保持隐藏，并设为 Disabled。
3. 回读任务名称绑定 `151:3273 / 151:3313`、下一跨页可见性 `198:3960`、添加/编辑名称 `151:3396` 以及隐藏页码动态绑定 `198:3961`。这些业务绑定保留；外观填充/描边按本轮设计更新。首页 `49:244` 和空日历 `270:4257` 的完整动作/绑定摘要均与修改前一致。
4. 四对按钮（运行、暂停、普通恢复、长暂停样例）的填充、边框、effects 序列化比较均一致。EN Conditions 为 103×28、位于 180×44 控件内；Choose 旋转后包围盒 29×72、位于 64×152 竖书签内；JA 選ぶ为 20×58、位于同尺寸书签内。删除/取消文字均为 36×27、位于 180×44 内。
5. 目视核对九张最终截图：任务第一页、第二页、空任务、删除确认、日历读书明细、运行、暂停、恢复、状态区。最终无本轮新增文字裁切、重叠或焦点光晕。状态区首次出现行高不足与继承的绝对坐标，已定向改为正确 auto-layout 并复验；随后将 Hover/Focus 颜色校正为当前 CSS，以最后截图作为状态区证据。
6. 截图保存于本工作树忽略目录 `.cache/figma-compact-navigation/`：`tasks.png`、`tasks-second.png`、`tasks-empty.png`、`delete.png`、`calendar.png`、`focus.png`、`paused.png`、`recovery.png`、`states-final.png`。临时基线、节点台账及详细回读同存该目录；PNG 与短期素材 URL 不提交。

本次只验证设计结构、定向几何、样式与截图。任意输入、IME、Tab/Space/Enter、真实 disabled 行为、持久化、计时和长暂停分段的实际执行以固定产品及独立网页报告为准；状态区清除业务动作，仅作为可编辑样例。完整 B/C 原型点击、Android 真机、安装升级及参与者测试仍不在本轮结论内。阶段 8 未启动。仅提交本报告及精简 JSON。
