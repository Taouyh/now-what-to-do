# 纸条输入与时间胶囊：独立验收

最新复测 SHA：`859cf565cd39eef94f037c24d9955a0309556960`。**最终结论：PASS，本轮限定网页切片两个缺陷均已修复。** 最新受影响补测 4/4 通过，结合此前明确记录的 5 项功能回归、六组其余控件检查结果；不宣称在最新 SHA 重跑全部旧用例。末节记录最新证据，以下保留两轮历史失败及修复过程。

## 首次验收：1539237（历史失败）

2026-11-06，独立 GPT 窗口。固定产品 SHA：`15392377801734d0504b9c3f7b134ffa817a5ea9`。**结论：FAIL，发现两处本轮样式要求未满足，修复后补受影响复测。** 指定功能回归 5/5 通过，不等于本轮视觉验收通过。本窗口没有修改产品代码、Figma、合并或推送。

## 问题

### PC-01 / P2：空任务“添加活动”纸条仍显示键盘焦点外轮廓

- 环境：Edge `156.0.4314.58`；1531×715、390×715、320×715；深浅主题全部复现。
- 步骤：新 context 注入空任务库 → 点击“任务”书签 → 用 Tab 聚焦 `.empty-task-add`。
- 期望：同款纸条及卷边，键盘焦点仅通过颜色反馈，无额外高亮外轮廓。
- 实际：`:focus-visible` 为 true，计算样式 `outline-style: solid`；浅色出现棕色矩形外框，深色出现浅金色外框。纸条 hover/focus 的亮度反馈与 Enter 打开添加仍可用。
- 原因：`src/ui/styles/book.css:25` 的 `.book-app button:focus-visible` 设有 3px outline，其优先级高于第 123 行 `.book .empty-task-add` 的 `outline: none`。深色全局规则还改变了该外框颜色。
- 证据：本工作树 `test-artifacts/paper-independent/results.json` 的六项 `empty.emptyFocus.outline`；`{light,dark}-{1531,390,320}-empty-tasks.png`，已逐张目视确认。

### PC-02 / P2：深色添加/编辑名称输入出现独立实色背景

- 环境：同上；深色主题三个宽度的添加、编辑两种表单均复现。
- 步骤：深色主题 → 任务 → 添加活动或编辑已有活动 → 悬停名称输入 `#name`，再通过键盘聚焦。
- 期望：输入自身无 border、outline、背景；纸条 wrapper 通过 hover/focus-within 变色，保留纸条纹理和右卷边。
- 实际：正常失焦时 input 背景透明；hover/focus 时 input 的 `background-color` 变为 `rgb(114, 83, 52)`，形成覆盖纹理的实色长块。边框、outline 和 box-shadow 均已移除，输入及保存正常。
- 原因：`src/ui/styles/book.css:246` 的 `html[data-theme=dark] .book :is(#continuationInput,#name,#desc):hover/:focus` 以更高优先级覆盖第 122 行纸条输入的透明背景。首页 `#quickName` 不受此规则影响。
- 证据：`results.json` 三个深色矩阵项的 `add/edit.hover.input.background`、`add/edit.focused.input.background`；`dark-{1531,390,320}-{add-invalid,edit-focus}.png`，已逐张目视确认。

以上合计 18 个失败断言，归并为 **2 个缺陷**：PC-01 六组各 1 次；PC-02 三组深色 × 添加/编辑 × hover/focus，共 12 次。不是 18 个独立问题。

## 环境、隔离与实际命令

工作树 `C:/Users/fengcai/.codex/worktrees/b6e3/now-what-to-do`，切换前干净；上轮报告提交 `e214f42b128141e37bf2ae209316d5dd13abbb55` 及忽略目录 `test-artifacts/interaction-independent/` 均保留。先 detached checkout 本轮 SHA，再构建本工作树产物。依赖复用上轮 `npm ci --ignore-scripts` 安装的锁定版本，未重装。

Node `24.18.0`，npm `11.16.0`，Playwright `1.64.1`。仅访问 `http://127.0.0.1:8771/`；每项创建新的 Edge context，使用合成空库及临时创建的任务，未访问真实 8765 profile。结束时测试服务器与 contexts 已关闭。

```powershell
npm run build:web
$env:BOOK_TEST_PORT='8771'
npx playwright test tests/e2e/book.spec.ts tests/e2e/interaction-refinement.spec.ts --grep 'empty library|task groups|local assets|automatic custom time'
node test-artifacts/paper-independent/check.cjs
```

| 检查 | 结果 | 证据（相对本工作树） |
| --- | --- | --- |
| 类型检查及生产构建 | PASS | `test-artifacts/paper-independent/build.txt` |
| 指定既有浏览器回归 | PASS，5/5，8.9 秒 | `test-artifacts/paper-independent/e2e.txt` |
| 临时六组真实交互、几何与样式检查 | FAIL，执行完 6/6 组；18 个断言失败归并为上述 2 个缺陷 | `test-artifacts/paper-independent/{check.cjs,visual.txt,results.json}` |

临时脚本初次执行误假设 Enter 选预设后时间菜单保持打开，下一选项等待超时；按真实“选择后关闭”行为修正为后续选项前重新打开。最终完整六组运行未超时，测试失败仅来自上述真实样式偏差。未修改产品，未新增永久样式测试。

## 通过部分与截图核对

| 本轮条目 | 结果 |
| --- | --- |
| 空库标题精简 | PASS，六组均为“你想做什么”。 |
| 首页名称纸条输入 | PASS，`paper-slip paper-input`、任务纸条纹理和右卷边存在；输入透明、无 border/outline/glow；wrapper hover/focus 变色；实际输入并新增活动成功。 |
| 添加/编辑名称纸条、校验与保存 | 部分失败：PC-02；其他状态及浅色通过。空白名称被拦截，错误文案在纸条下方，无重叠或水平裁切；有效名称新增和编辑保存成功。 |
| 空任务添加纸条 | 部分失败：PC-01；纸条纹理、右卷边、整条 hover 变色与键盘 Enter 打开添加通过。 |
| 任务右上角入口 | PASS，六组仅显示“添加”。 |
| 六个时间选项及自定义组 | PASS，七项均为 24px 圆角胶囊；hover/键盘 focus 颜色反馈，无额外 outline/glow；预设深色选中状态及 aria-pressed 保留；分钟单位位于同一输入组。预设 10/15/20/30/60 均通过键盘选中并生效，自定义 25 即时应用、1441 黑底白字报错、改回有效值及 Enter 关闭均可用。七项几何无重叠、无水平文字溢出且处于 715px 高视口内。 |

已保存并查看 **30 张截图**：`test-artifacts/paper-independent/{light,dark}-{1531,390,320}-{empty-home,empty-tasks,add-invalid,edit-focus,time-capsules}.png`。除上述两处样式偏差外，本轮关键布局无新发现的重叠/裁切，移动宽度按页面正常纵向滚动。六组均无 pageerror。

## 产物与边界

| 文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `41EEAEC44B32F55B2B938F1A94A256E5EBF1AE55D1969689E6A173304488178A` |
| `dist/web/style.css` | `5CC89883E6FE9CBBBC248A30487435F394AE19E24752393AC073DE7B2C7B6386` |
| `dist/web/index.html` | `5CB2921171A25C296AD97744516CD4D9D58DAEFCB86790AF164DC103D3BEEBA4` |

按本次交接仅测试六项变化及指定 5 项回归，没有重跑 140 项核心、上轮全部矩阵或全量浏览器套件。原生/Android、升级、真实 IME、参与者测试及 Figma 验收均未执行；不据此启动阶段 8。本窗口仅提交此报告，建议开发窗口修复 PC-01/PC-02 后交新固定 SHA 补测。

## 2026-11-06 修复后复测：b1ba1ade

固定产品 SHA：`b1ba1aded0815c108b45d846e142e1de55835a58`。核对产品差异，相对 `1539237` 只有新增一条 `.book .empty-task-add:focus-visible { outline: none; }`。在本独立工作树检出该 SHA、重新生产构建，再执行原临时六组脚本；原目录未覆盖，全部新证据位于 `test-artifacts/paper-retest-b1ba/`。

```powershell
npm run build:web
node test-artifacts/paper-retest-b1ba/check.cjs
```

| 复测项 | 结果 |
| --- | --- |
| 类型检查和生产构建 | PASS，`test-artifacts/paper-retest-b1ba/build.txt` |
| PC-01 空任务添加键盘焦点 | **PASS，已修复**。深浅 × 1531/390/320 六组的 `empty.emptyFocus.outline` 均为 `none`，颜色反馈及 Enter 打开添加仍可用。六张最新 `*-empty-tasks.png` 均已目视确认。 |
| PC-02 深色名称输入背景 | **FAIL，未修复**。三个深色宽度 × 添加/编辑 × hover/focus 共 12 个断言仍失败，input 背景仍为 `rgb(114, 83, 52)`；对应浅色状态均透明。已目视查看最新三张 `dark-*-edit-focus.png`，实色块仍覆盖纸条纹理。 |
| 六组其余纸条/时间控件检查 | PASS，无新失败。标题、首页纸条保存、名称校验与保存、右上角“添加”、七项时间胶囊的尺寸/颜色/焦点/预设/自定义及错误提示、几何检查均通过；六组 pageerror 为零。 |

脚本完整执行 6/6 组，最终退出码 1，对应 **12 个重复断言、1 个未解决缺陷 PC-02**。计算样式、几何和完整失败列表见 `test-artifacts/paper-retest-b1ba/results.json`，运行日志 `visual.txt`，脚本 `check.cjs`，本轮另存 30 张截图。最新重点目视核对为前表所列 9 张；首次 30 张仍保存在原证据目录。

未在本修复 SHA 重跑既有 5 项浏览器或核心大套件；它们的首次结果仍仅对应 `1539237`。本轮继续使用 8771 和全新 Edge contexts/合成数据，未访问真实 profile，结束后服务器和 contexts 已关闭。本报告提交以 `b1ba1ade` 为父提交，仅包含此报告；开发窗口可只取这一份最新报告提交，无需先取首次报告提交。

| 本次生产文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `41EEAEC44B32F55B2B938F1A94A256E5EBF1AE55D1969689E6A173304488178A` |
| `dist/web/style.css` | `89D27029F4DBD7ED318B7C25376CC9FDCF6A550029BD6D08404C4C4E5D462EFE` |
| `dist/web/index.html` | `5CB2921171A25C296AD97744516CD4D9D58DAEFCB86790AF164DC103D3BEEBA4` |

**该轮结论：仍需修复 PC-02 并在新固定 SHA 补受影响验证；当时不能宣告本轮六项反馈全部通过。** 本窗口未改产品/Figma、未合并或推送。此历史状态已由下节最新结果更新。

## 2026-11-06 最终受影响补测：859cf565

固定产品 SHA：`859cf565cd39eef94f037c24d9955a0309556960`。独立核对相对 `b1ba1ade` 的产品差异：仅三条旧普通输入框样式规则从 `:is(#continuationInput,#name,#desc)` 移除了 `#name`，纸条输入自己的透明/无轮廓规则、续做与说明框规则仍在。检出并重新构建此固定提交后，执行独立临时受影响脚本。

```powershell
npm run build:web
node test-artifacts/paper-retest-859c/check.cjs
```

| 最新补测项 | 结果 |
| --- | --- |
| 类型检查与生产构建 | PASS，`test-artifacts/paper-retest-859c/build.txt` |
| PC-02 深色 1531/390/320 × 715 添加/编辑 hover/focus | **PASS，已修复**。三组每个表单的正常、hover、键盘 focus 状态，输入背景均为 `rgba(0, 0, 0, 0)`，border-width 为 0px，outline/box-shadow 为 none；wrapper 在 hover/focus-within 时变色，纹理和卷边保留。 |
| 浅色 1531×715 添加/编辑对照组 | PASS，同上各状态透明、无额外边框或轮廓，wrapper 正常反馈。 |
| PC-01 焦点修复保持 | PASS，四组空任务纸条均真实获得键盘 focus-visible，outline 为 none；颜色反馈存在，Enter 打开添加正常。 |
| 名称实际输入与保存 | PASS，四组均完成添加、编辑并检查任务名称更新，输入位于水平视口内；无 pageerror。 |

**4/4 组全部通过，退出码 0，无未解决缺陷。** 新证据均在 `test-artifacts/paper-retest-859c/`：`check.cjs`、`visual.txt`、`results.json`，以及 `{dark-1531,dark-390,dark-320,light-1531}-{empty-focus,add-focus,edit-focus}.png` 共 12 张。全部截图已逐张查看，确认纸条纹理可见、无实色块遮盖、无焦点外框，未见本次修复引入的重叠/裁切。

最新脚本仅覆盖上述受影响状态与必要的输入保存，不重新运行时间流程、既有 5 项功能回归或核心/大套件。此前 5/5 的实际执行 SHA 为 `1539237`；此前六组其余纸条/时间控件的最后完整执行 SHA 为 `b1ba1ade`，其通过结果在本次仅改名称框选择器的条件下沿用，不能改写成最新 SHA 的全量运行记录。PC-01 六组完整通过证据仍在 `paper-retest-b1ba/`；本次另对四组确认保持。

依然使用独立 b6e3 工作树、8771、新 Edge contexts 与合成数据；未访问真实用户 profile，服务器和 contexts 已关闭。原始两轮报告内容及所有证据目录保留。最新报告提交仅含此完整报告，父提交为产品 `859cf565`，不依赖之前两个报告提交；主窗口可直接取最终完整文件复制归档，或只取最终报告提交，无需按报告提交历史逐个合入。

| 最新生产文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `41EEAEC44B32F55B2B938F1A94A256E5EBF1AE55D1969689E6A173304488178A` |
| `dist/web/style.css` | `55E664C2D6463A00B70A2C9D3906CFB166F8F0DFBE7EF53690E5BD238EBE2B6C` |
| `dist/web/index.html` | `5CB2921171A25C296AD97744516CD4D9D58DAEFCB86790AF164DC103D3BEEBA4` |

本轮限定网页切片允许开发窗口继续后续流程；Figma 同步、原生/Android、升级、参与者验收及阶段 8 仍不属于本次结论。本窗口仅提交报告，未修改产品或 Figma，未合并或推送。
