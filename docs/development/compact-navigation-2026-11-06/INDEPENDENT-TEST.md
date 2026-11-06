# 紧凑导航与统一胶囊：独立验收

## 最终受验版本：703c988，PASS

2026-11-06，最终固定产品 SHA：`703c988cfe3223e2225a30b3b2402c932d1a64a9`。独立窗口在干净工作树切换该提交后重新构建，针对上一轮1531宽底边相交以及两个原窄尺寸完成 **3/3组布局复测，全部PASS**。此前1531×715的轻微相交已消除，本报告中该观察关闭；下方保留原始发现与各轮结论。

本次从 `e6640b5` 到最终SHA核对了完整差异：产品仅 `src/ui/styles/book.css` 将桌面 `.spread-pager` 的 bottom 从16%改为8%，并移除窄桌面重复声明；另外两份文档补记既有需求和验证结果，没有JS、HTML、存储或计时逻辑改动。因此按委托继承上一轮10组中的其他已通过结果及既有book回归3/3，不重复执行计时、恢复、删除或全矩阵；这些继承结果的实际执行SHA仍是 `e6640b5`，不能写成在最终SHA重新跑过。

| 最终SHA实际复测 | 结果 |
| --- | --- |
| 1531×715，中文浅色，21项任务第二页 | PASS：两侧各五条，十条全部在各自纸页内；与翻页按钮相交数0；两个翻页按钮也在纸页内。截图确认末行与翻页之间有清晰间隔。 |
| 810×715，英文浅色，21项任务第二页 | PASS：十条及两按钮均在纸页内，相交数0。 |
| 900×551，英文浅色，21项任务第二页 | PASS：十条及两按钮均在纸页内，相交数0。 |
| 普通鼠标往返翻页 | 三组均点击上一页看到Activity 1，再下一页看到Activity 11；无强制点击，均无pageerror。 |
| 独立生产构建 | `npm run build:web` PASS，含类型检查及271文件装配。 |

三个截图均已目视核对；几何测量保留1px舍入容差，并正确排除 `.spine` 书脊图。环境沿用独立Edge contexts、合成数据、`127.0.0.1:8771`；没有访问真实8765/profile。执行命令 `node test-artifacts/compact-retest-703c/layout.cjs`，证据目录 `test-artifacts/compact-retest-703c/` 内有 `build.txt`、`layout.cjs`、`layout.txt`、`results.json` 和三张任务页截图。脚本初次往返翻页误写 `tasks-prev`，等待不存在元素超时；根据页面实际ID更正为 `tasks-previous` 后三组完整通过，初次日志保留 `first-run-layout.txt`，没有产品修改。

| 最终生产文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `E5125FCD44EB556EE2A8B16E0F5B213785862ED1489940338EED3C1CD27DB12B` |
| `dist/web/style.css` | `F5390AB1F3DC4A16C66661D25A675D55409EA20ED668CF61B0AFC413E860176A` |
| `dist/web/index.html` | `168CDC9E729155D67E60D6EA7A730596CB89DDD3797F814DF29F46491524E70B` |

最终PASS覆盖本轮既定变更及上述实际复测/差异继承，不扩展为任意尺寸、全主题语言笛卡尔矩阵、原生/Android/升级、Figma或参与者验收。没有重跑核心140项或旧全套，没有启动阶段8。测试服务及contexts已关闭；仅提交报告，不修改产品/Figma，不合并或推送。

## 上轮定向复验：e6640b5，PASS（指定范围）

2026-11-06，独立 GPT 窗口及隔离工作树。固定产品 SHA：`e6640b53a31d09a7ffc7052b03eb9ba5fac63eb6`。CN-01、CN-02 在本轮指定尺寸下修复通过；三语言删除短标签、运行/暂停及长暂停恢复主按钮检查通过。构建 PASS，指定既有回归 **3/3 PASS**，临时定向检查 **10/10 组 PASS、0 个失败断言**。下方完整保留 `acbfc932` 的首轮 FAIL 历史；其 14 组矩阵没有在本次重跑。范围外轻微边界相交观察见下，不应将本结论解释为所有尺寸完全无重叠。

### 复验步骤与结果

| 项目 | 实际检查与结果 |
| --- | --- |
| CN-01 删除确认 | 810×715，英文/日文 × 浅深四组：kicker、标题、说明、活动快照和按钮区域的矩形全部在确认卡片内，截图目视完整；两按钮中心命中按钮，普通鼠标 Cancel 返回 `Unsaved draft`，再次打开后普通 Delete 使 21 项变 20 项。900×551 英文浅色及810×715中文浅色也通过同样检查。无 force、DOM 点击或键盘回退。 |
| CN-02 任务第二页 | 上述六组，每组第二页两侧各五条、共十条；纸条矩形均在各自纸页内，与两个翻页按钮无相交（几何允许1px舍入误差）。810×715与900×551代表截图目视通过。 |
| 删除按钮短标签 | 实际确认框文本严格匹配中文“删除”、英文“Delete”、日文“削除”；取消及确认均实际点击。 |
| 运行/暂停主按钮 | 1531×715中文浅深两组：`earlyTimer` 与 `pauseTimer` 在运行、暂停状态均含 primary；统一移走鼠标并移除焦点后，文字色、底色、背景图、边框、圆角和字体计算样式一致。暂停后按钮变“继续”；实际点击“结束”退出计时并写一条记录。 |
| 长暂停恢复 | 1531×715中文浅深两组：合成暂停2小时、已投入120秒的会话，实际显示“已暂停很久”；`finishRecoveryTimer` 与 `recoverTimer` 均为 primary 且上述计算样式一致。点击“结束并记录”后仅有一条 completionId=`long-pause-fixed`、actualDurationMs=`120000` 的记录，activeTimer清除，刷新后仍只有一条。 |
| 生产构建 | `npm run build:web` PASS（含类型检查，271个文件）。 |
| 指定既有book测试 | `task groups`、`recovery uses`、`empty library` 三项，3/3 PASS，6.6秒。覆盖草稿/删除分页、恢复快照与放弃不写记录、从空库创建活动到暂停/结束/续做旅程。 |

10组的组成：六组任务/删除布局，两组运行及暂停，两组长暂停恢复。主按钮对比采用同一普通状态，不宣称覆盖所有 hover/focus 组合。截图已目视核对810英文/日文深浅删除确认、810及900×551任务页、浅色运行/深色暂停和浅深长暂停恢复。

```powershell
npm run build:web
$env:BOOK_TEST_PORT='8771'
npx playwright test tests/e2e/book.spec.ts --grep 'task groups|recovery uses|empty library'
node test-artifacts/compact-retest-e664/check.cjs
```

仍仅使用本工作树 `http://127.0.0.1:8771/` 的生产产物、新 Edge contexts 与合成存储，未访问8765或真实profile；Node/npm/Playwright/Edge版本与首轮相同。证据目录：`test-artifacts/compact-retest-e664/`，包含 `build.txt`、`e2e.txt`、`check.cjs`、`visual.txt`、`results.json` 及各状态PNG。测试服务及contexts已经关闭。没有新增永久样式测试、修改产品/Figma、合并或推送；本提交仅含报告。

### 测量更正及范围外观察

首次临时脚本将 `.book-paper` 列表中的左侧书脊图片误选作右纸页，导致每组右侧五条被错误报告为越界。核对DOM后改成 `.book-paper:not(.spine)`，重跑同样目标流程，指定尺寸全部通过。首次日志、JSON保存在 `first-run-visual.txt`、`first-run-results.json`，未修改产品以绕过断言。

首次为检查中文短标签选用1531×715中文浅色，附带测量发现：任务第二页翻页矩形与 Activity 15/20 底边分别相交约 **6.53px / 5.78px**，截图可见底边轻微接触，但未覆盖名称。这与上述纸页选择错误无关；保留为范围外待跟进观察，未验证是否由本轮引入。证据 `zh-CN-light-1531x715-tasks.png` 和 `first-run-results.json`。已告知开发窗口。最终中文短标签检查使用810×715，将本次布局复验限于委托指定的两种尺寸；没有将这项范围外观察记为已修复，也没有扩跑完整矩阵。首轮“1531代表截图未出现这一位置问题”只代表当时未发现窄桌面严重覆盖，并不构成全尺寸无相交保证。

### 本次产物与验收边界

| 文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `E5125FCD44EB556EE2A8B16E0F5B213785862ED1489940338EED3C1CD27DB12B` |
| `dist/web/style.css` | `6926C1DE8DBE06EA55C60691647EEBC6857D1C904AD36CC9CC7BEC6CD8994F77` |
| `dist/web/index.html` | `168CDC9E729155D67E60D6EA7A730596CB89DDD3797F814DF29F46491524E70B` |

未重跑首轮14组矩阵、核心140项、旧全套、Figma、原生/Android/升级或参与者验收；未启动阶段8。此 PASS 仅覆盖上述固定提交的定向修复与指定回归。

## 首轮历史：acbfc932，FAIL

2026-11-06，独立 GPT 窗口。固定产品 SHA：`acbfc93248ed9f47d767519d9595e7584f124507`。**结论：FAIL，两个布局缺陷待修复后补测。** 构建及指定既有回归 3/3 通过；不能据此宣告本轮视觉验收通过。已提前向开发窗口发送具体缺陷与证据位置，产品修复由开发窗口执行。

## 发现的问题

### CN-01 / P2：窄桌面删除确认内容超出卷轴，纸卷遮住按钮中心

- 环境：Edge `156.0.4314.58`；810×715 的英文/日文、深浅主题四组均复现；900×551 英文浅色也出现上下溢出。
- 数据与步骤：合成 21 项任务 → 任务第二页 → 编辑 Activity 11 → 输入未保存草稿 → 点击删除。
- 期望：确认内容及两个等高胶囊完整容纳于可读、可操作区域，纸卷不遮挡按钮；正常鼠标操作和键盘均可取消/确认。
- 实际：810×715 英文卡片 top=122.90625、bottom=465.5625；kicker top=102.375，跑到卡片上方。按钮区域 y=443.515625–500.109375，超过卡片底部约 34.55px；纸卷伪元素遮住两个按钮中心。普通 `hover()` 持续被 `.confirm-card` 拦截，`elementFromPoint` 也确认中心命中卡片而非按钮。日文相同位置也遮挡中心。
- 900×551 英文卡片 bottom=429.0625，按钮 bottom=475.421875，超出约 46.36px；部分标题也跑出卡片。这组按钮中心可点击，但文字和卷轴区域仍重叠。
- 影响：四组 810 宽无法按正常中心鼠标操作完成确认；键盘仍可取消回原草稿、确认删除，数据检查通过。本测试没有强制点击遮挡的控件，也没有把键盘回退计为鼠标通过。
- 原因线索：`src/ui/styles/book.css` 的桌面 `.confirm-card` 固定 86% 高度、flex 居中、overflow visible，底部 `::after` 纸卷覆盖溢出的内容；多语言长文本和两列按钮换行后超出该高度。
- 证据（本工作树）：`test-artifacts/compact-independent/en-light-810x715-blocked.png`、`{en,ja}-{light,dark}-810x715-delete-confirm.png`、`en-light-900x551-delete-confirm.png`；`probe-810-results.json` 记录完整几何，`probe-810.txt` 记录原始指针拦截；最终 `results.json` 包含四组中心命中及内容边界失败。

### CN-02 / P2：窄桌面与低高度任务翻页覆盖活动纸条，末行溢出书页

- 环境：英文浅色，810×715 与 900×551，21 项任务的第二页。
- 步骤：打开任务 → 下一页，使两侧各有 5 项且前后翻页均可用。
- 期望：任务纸条与翻页胶囊分开布局，所有本页任务保留可读、可点击区域，不跑出书页。
- 实际定向几何：810×715 的 Previous 与 Activity 14 相交 **88×35.609375px**；Next 与 Activity 18、19 相交，Activity 15、20 超出纸页底边。900×551 的 Previous 与 Activity 14 相交 **88×34.484375px**，Next 也覆盖活动纸条，末行部分跑到书页外。
- 影响：翻页按钮遮挡任务名称及编辑点击区；低高度下部分纸条被书壳边界裁切。1531×715 和手机单列代表截图未出现这一位置问题。
- 原因线索：桌面每页五条的最小行高与间距、右页两行标题占用空间，配合 `.spread-pager` 的固定底部位置，未在较小书页中让出独立区域。
- 证据：`test-artifacts/compact-independent/layout.cjs`、`layout-results.json`、`layout.txt`、`en-light-{810x715,900x551}-task-layout.png`。先目视发现，再定向测量确认；没有与旧产品 SHA 做布局对照，不宣称已证明是本轮新引入，但它确实存在于本轮固定提交和指定环境中。

## 实际执行与隔离

测试工作树 `C:/Users/fengcai/.codex/worktrees/b6e3/now-what-to-do`，开始时干净，从上轮报告提交切到固定产品 SHA。旧报告提交及所有忽略证据目录均保留。Node `24.18.0`、npm `11.16.0`、Playwright `1.64.1`、Edge `156.0.4314.58`。

仅访问本工作树生产构建 `http://127.0.0.1:8771/`，每项使用新 Edge context 与合成数据；未访问 8765 或真实用户 profile。主矩阵注入 21 项任务、11 个记录目录组，其中首组 9 条记录，使任务/目录/记录均至少有三页；记录在设备当天，使用合成名称和时长。

```powershell
npm run build:web
$env:BOOK_TEST_PORT='8771'
npx playwright test tests/e2e/book.spec.ts --grep 'task groups|calendar groups|local assets'
node test-artifacts/compact-independent/check.cjs
node test-artifacts/compact-independent/layout.cjs
```

| 检查 | 结果 | 证据（相对本工作树） |
| --- | --- | --- |
| 类型检查和生产构建 | PASS | `test-artifacts/compact-independent/build.txt` |
| 指定任务/日历/语言资源回归 | PASS，3/3，6.3 秒 | `test-artifacts/compact-independent/e2e.txt` |
| 主临时矩阵 | 14/14 组执行完成；19 个失败断言归并为 CN-01 | `test-artifacts/compact-independent/{check.cjs,visual.txt,results.json}` |
| 任务布局定向补查 | FAIL，两个环境均确认 CN-02 | `test-artifacts/compact-independent/{layout.cjs,layout.txt,layout-results.json}` |

14 组为英文/日文 × 深浅 × 1531/810/320 宽（统一高 715），加中文浅色 1531×715 一组，及英文浅色 900×551 一组。主矩阵每组核对首页、任务中间页、首尾禁用边界和删除确认；没有把所有日历页与全部环境做笛卡尔扩测。

最初真实鼠标操作在 810 宽删除确认处被拦截并超时。定向复现保存截图和几何后，临时脚本改为先检查中心命中：遮挡即记录失败，保留 hover 未执行状态，使用真实键盘操作继续核对草稿/删除逻辑。未用 force、DOM 点击或产品样式修改绕过缺陷；首次日志留在 `first-run-visual.txt`，首轮已完成结果在 `first-run-results.json`，定向探针在 `probe-810*`。

## 通过的本轮检查

| 条目 | 结果与执行范围 |
| --- | --- |
| 紧凑文案与首页文字边界 | PASS，14 组。英文为 Conditions/Choose，日文竖书签为 選ぶ。使用字体加载后的 DOM Range 实际文本矩形核对时间/条件 summary、文字与 chevron 不相交、竖书签文字位于框内；没有仅凭 scrollWidth 判断。900×551 仍显示 Choose 并容纳完整文字。 |
| 手机导航 | PASS，320 宽按原行为隐藏 browse；真实点击既有任务书签成功。 |
| 任务翻页样式和边界 | PASS，14 组，三页中间两个按钮均 enabled。同组 normal/hover/focus 的 width/height/font/font-family/font-size/font-weight/line-height/color/background/background-image/border/radius 对比一致；24px 胶囊，无 hover/focus outline，颜色变化存在。首尾 disabled 与淡化保持。布局问题另见 CN-02，不在此写成通过。 |
| 日历目录和记录翻页 | PASS，英文桌面1531深浅及日文深色320三个代表环境，分别用至少三页验证中间页两按钮；同组上述样式对比、键盘焦点、hover 颜色、首尾禁用检查通过。 |
| 页码 | PASS，14 组任务页码保留文本并带 sr-only，实际尺寸 1×1、clip-path inset(50%)；日历代表环境两个页码有正常文本边界及可见尺寸。 |
| 删除确认同组胶囊 | 部分通过：14 组等宽等高、normal/focus 同色同字体同边框/圆角、无 outline，颜色反馈可用；10 个无遮挡环境也通过 mouse hover 状态比较。英文手机自然将 Delete activity 换为两行，两按钮同高约 56.59px。810 四组遮挡导致鼠标 hover 未执行，记 CN-01，不冒称全部通过。 |
| 删除业务 | PASS，14 组 Cancel 返回未保存草稿且任务仍21项；Confirm 后20项，实际只删一项。810四组使用键盘回退，其余使用正常鼠标点击。 |
| 其他确认作用域 | 英文桌面深浅两组实际打开合成文件导入确认，确认不带 confirm-delete，取消正常。源码只对删除切换该类；未把这项有限检查宣称为所有其他确认全量回归。 |

代表截图已保存并目视核对：首页英文浅深、日文深、900×551；任务中间页英文浅深及两种异常布局；日历英文深与日文手机深；删除确认英文手机浅深、日文手机深、日文桌面深及810/低高度异常截图。截图和计算样式均在忽略目录，未添加永久纯样式测试。14 组均无 pageerror。

## 产物及边界

| 文件 | SHA-256 |
| --- | --- |
| `dist/web/app.js` | `6F07318CB5DCB71BF05590AF71DFB7FA7E6E75D5946AFAA2CD3BE4D74C678C22` |
| `dist/web/style.css` | `BF5B6A84C0DAAE515E8BCED083819DC47543EF90C3E924E1D3BFF999DF00159F` |
| `dist/web/index.html` | `5CB2921171A25C296AD97744516CD4D9D58DAEFCB86790AF164DC103D3BEEBA4` |

未重跑核心140项、旧全套、原生/Android/升级、参与者或Figma验收。本轮不启动阶段8。本窗口未修改产品/Figma，未合并或推送，测试服务器及 contexts 已关闭；仅提交此报告。开发窗口修复 CN-01/CN-02 后需指定新 SHA，补受影响布局与必要回归。
