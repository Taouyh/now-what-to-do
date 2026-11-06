# 交互精简：独立固定提交验收

2026-11-06，独立 GPT 测试窗口。结论：**PASS，本轮网页切片未发现阻断缺陷**。固定产品提交为 `29d9b4656f47b50435b30ca81137fc0b787b35a0`；允许开发窗口继续本轮后续流程。本窗口没有修改产品代码、访问 Figma、合并或推送。

## 隔离与环境

- 工作树：`C:/Users/fengcai/.codex/worktrees/b6e3/now-what-to-do`，启动时为上述提交的干净 detached HEAD；与开发及旧验收工作树分离。
- Node `24.18.0`，npm `11.16.0`，Playwright `1.64.1`，Microsoft Edge `156.0.4314.58`。
- 仅使用本工作树生产构建及 `http://127.0.0.1:8771/`。每个用例/矩阵项创建新的 Edge context，仅注入合成任务和记录，未连接既有用户 profile，未访问 8765。
- 临时补查脚本、合成导出文件、JSON、截图及日志均保存在 Git 忽略目录 `test-artifacts/interaction-independent/`。未永久添加样式测试。

## 本窗口实际执行

```powershell
npm ci --ignore-scripts
npm run build:web
$env:BOOK_TEST_PORT='8771'
npx playwright test tests/e2e/interaction-refinement.spec.ts tests/e2e/book.spec.ts --grep 'automatic custom time|four calendar records|empty library|task groups|calendar groups|local assets'
node test-artifacts/interaction-independent/check.cjs
npm test
```

| 检查 | 结果 | 证据（相对本工作树） |
| --- | --- | --- |
| 依赖安装、类型检查、生产构建 | PASS | `test-artifacts/interaction-independent/build.txt` |
| 指定浏览器回归 | PASS，11/11，13.9 秒 | `test-artifacts/interaction-independent/e2e.txt` |
| 核心回归 | PASS，140/140，0 失败/跳过 | `test-artifacts/interaction-independent/unit.txt` |
| 临时真实交互与几何检查 | PASS，深浅主题 × 1531/390/320 宽，共 6 组，统一高度 715 | `test-artifacts/interaction-independent/{check.cjs,visual.txt,results.json}` |

11 项浏览器回归包括：两主题自定义时间即时应用/错误通知/文字条件；1531、1024、810、390、320 五种宽度的四条记录、分页、展开；空库新增/专注/续做、任务分页/草稿/删除、日历按身份分组、资源/语言/主题/窄屏操作。

## 本轮新增反馈验收

| 条目 | 结果与实际观察 |
| --- | --- |
| 记录展开不缩列宽 | PASS。六组补查展开前后每行宽度一致；1531 宽为 360.765625px，390 宽为 310px，320 宽为 240px。指定五种宽度浏览器回归也通过。 |
| 记录最小行高与详情 | PASS。桌面四行展开前后均约 62.80px；390 宽四行均 65px；320 宽展开行从 65px 增至约 70.59px，其余仍为 65px。计划/暂停/追加明细可读，长数值在 320 宽换为两行，无水平溢出。 |
| 活动名称/说明输入框反馈 | PASS。两框实际 hover 和键盘 focus-visible 均改变底色与边框；focus 时 outline 为 none，box-shadow 为 none。浅色底色 `rgb(240,224,183)` → `rgb(228,204,161)`；深色 `rgb(80,61,44)` → `rgb(114,83,52)`。 |
| 日历目录使用任务纸条 | PASS。真实按钮带 `calendar-group task-strip`，背景使用纸条资源，伪元素显示纸卷右边缘；按钮文本仅活动名。次数和汇总用时保留于右页标题下，目录选组和分页回归通过。 |
| 设置七项胶囊与操作反馈 | PASS。语言 3 项、主题 2 项、导入/导出 2 项全部为 24px 圆角、1px 边框、高度至少 44px。hover/键盘 focus-visible 无 outline，浅色亮度反馈为 0.92，深色为 1.18，选中状态保留。 |
| 六组布局与真实交互 | PASS。七个设置按钮均在横向可视边界内，无按钮相交或文字水平溢出；两个编辑框无横向裁切。语言三项键盘 Enter 切换、两主题切换、导出下载后解析、点击导入并确认恢复合成备份均通过；六组无 pageerror。窄屏自然纵向滚动。 |

已保存并逐张目视查看 14 张截图：`test-artifacts/interaction-independent/{light,dark}-{1531,390,320}-{settings,edit}.png`（六组各两张），以及 `{light,dark}-1531-calendar-expanded.png`。设置与编辑文字、按钮均可见，桌面日历展开后四条记录和分页仍在书页内，未见本轮范围内的重叠、裁切或焦点光晕。

临时脚本初版曾把“必须改变 border-color”当作所有设置按钮的要求；导入/导出 ID 选择器保留边框色，但亮度反馈实际改变可见颜色，符合本轮“颜色反馈”要求，已改为检查实际 filter 变化。此外修正了导入确认层选择器及过宽的日历 caption 选择器。以上为测试脚本问题，没有修改待测产品；最终脚本完整六组通过。

## 旧窗口证据的引用边界

只读查看了旧窗口 `C:/Users/fengcai/.codex/worktrees/7aa2/now-what-to-do/test-artifacts/interaction-independent/` 中的 `e2e.txt`、`visual.txt`、`check.cjs` 和 `results.json`。交接标明该窗口验证提交 `c0a799a`，日志记录 8 项浏览器用例通过，JSON/脚本记录两主题合成 composition 事件、五种空白退出路径、条件文字状态、自己选 hover、续做焦点及日历检查。

这些属于旧窗口执行的历史证据，**不计入本窗口运行数量，也不据此宣称上述补充路径已在最终 SHA 全部重跑**。本窗口最终 SHA 的实际回归范围以本报告前述 11 项及六组补查为准；OS 级真实 IME 操作未执行。

## 产物指纹与未测范围

| 生产文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `0D9FC75C7B04DEB935700092E71ED7C9DEEBD001600CD13D81E79F0F6240F41E` |
| `dist/web/style.css` | `5DB3F28647B84BEF99B8AAFFE3E0DA5929B07876B387DE22100D9277FEB70C89` |
| `dist/web/index.html` | `72D1F6BF733BB59089AB436FA01DDB424738B9F20E50F82FCCD0052F53F22482` |

本次只验收指定网页切片，未重跑全量浏览器套件、原生安装/升级、Android 真机、参与者接受度、完整无障碍评估或 Figma 原型点击验收；不启动阶段 8。六组合成备份验证不代替各类备份失败注入专项。后续如修改产品代码，需针对新 SHA 补受影响验收。本窗口测试服务器与 Edge contexts 已关闭，最终仅提交本报告。
