# 开始页紧凑布局与快速启动验证

日期：2026-10-21。基线 HEAD：`739715fe07d3110dc854c8dfe8ca4271eefb3141`，分支 `master`。开始时有空库、目标移除、悬浮计时和今天页等未提交修改。本轮保留这些内容，只调整开始页及对应测试前置条件。没有提交、推送、部署或操作真实用户 localStorage；未发现适用的 AGENTS.md。

## 检查与最小修改

原开始页选择区域使用大间距和全宽按钮，推荐位于另一张面板；“自己选择”在两张面板之后。`browse` 已直接打开原任务库，不需要新建选择数据或计时流程。时间和环境从保存偏好恢复并在初始化时自动推荐，与本轮要求的刷新未选不符。

- `index.html`：紧凑标题、时间组、环境与电脑条件，随后并列“随机推荐”和“自己选择任务”。推荐结果置于同一面板紧邻选择区。保留原按钮 ID，电脑输入由动态插入改为静态唯一节点；更新脚本和样式版本参数。
- `style.css`：开始页专用间距、按钮、结果区域及响应式规则；主按钮紧跟必要信息，说明使用原生折叠区，长名称最多两行并保留完整文本和 tooltip。不使用固定容器高度或固定开始按钮。普通桌面视口可直接看到开始，窄屏自然换行，极窄屏入口及结果按钮纵向排列；未选按钮的 hover 样式区别于选中态。
- `app.js`：内存中的 `timeChosen/envChosen` 仅表示当前页面会话是否明确确认过两项。首次及刷新均为 false；时间、环境的原偏好值和电脑偏好仍兼容读取，不向存储写入 null、标记或新字段。随机推荐和推荐启动入口均检查两项选齐；空任务库仍可显示添加引导。页面内导航继续重新校验推荐，保留当前会话已确认条件。
- 选择操作沿用原保存方式；仅重新确认相同偏好时不写存储。实际修改保存失败时恢复旧偏好及本次之前的选择标记，不保留非法推荐。导入继续同步时间、环境、电脑和主题；若此前未选择，两项仍需明确确认，避免绕过新规则；已有确认时按导入偏好更新界面。
- 推荐硬筛选、近期避重和随机池次序保持原实现。有效旧推荐在条件变化时保留，失效时重选或清空；两个推荐按钮保留避免连续重复的行为。说明文字仍使用 `textContent`，没有引入用户文本 HTML 解析。
- 手动入口仍调用 `page('tasks')`，手动筛选及 `run/startTimer` 不变。推荐、选择及导航不新增完成记录，不更改任务预计时长、计时状态和历史数据格式。

新结果默认将说明收起，避免长说明把开始按钮推离视口。选择或点击推荐后，仅在开始按钮超出当前视口时调用 `scrollIntoView({block:'nearest'})`，按钮始终位于正常文档流。开始页设置滚动留白，避免页内锚点被固定页头遮挡。

## 测试设置的必要变化

原有推荐、HTML、悬浮等测试依赖“启动即自动推荐”。这些场景现在先通过真实按钮事件明确选择保存的时间和环境，再验证原流程，未绕过 `selectionReady()`。VM 驱动提供 `chooseConditions()`；浏览器场景显式设置 `options.chooseConditions`，可在相关测试刷新后重新建立同一前置条件。默认驱动仍保持不选。新的开始页测试不启用该选项，独立验证真实首次与刷新未选，避免旧测试的准备步骤掩盖新行为。空库和导入测试仅在确实需要推荐的步骤补充选择。

## 实际执行

Node.js v24.18.0，本机 Chrome 无头模式，全部使用内存或全新临时浏览器配置及合成任务。没有安装新依赖。

```powershell
node --check app.js
node --check tests/browser-start-page.cjs
node --check tests/browser-data-safety.cjs
node --test tests/data-safety.test.cjs tests/recommendation.test.cjs tests/repeatable-tasks.test.cjs tests/personal-activities.test.cjs tests/floating-timer.test.cjs tests/today-records.test.cjs tests/start-page.test.cjs
node tests/browser-data-safety.cjs tests/browser-start-page.cjs --file
node tests/browser-data-safety.cjs tests/browser-start-page.cjs
node tests/browser-data-safety.cjs tests/browser-recommendation.cjs --file
node tests/browser-data-safety.cjs tests/browser-personal-activities.cjs --file
node tests/browser-data-safety.cjs tests/browser-html-safety.cjs --file
node tests/browser-data-safety.cjs tests/browser-repeatable-tasks.cjs --file
node tests/browser-data-safety.cjs tests/browser-floating-timer.cjs --file
node tests/browser-data-safety.cjs tests/browser-today-records.cjs --file
node tests/browser-data-safety.cjs
git diff --check
```

| 检查 | 实际结果 |
| --- | --- |
| 新增开始页 Node 测试 | 5/5 通过 |
| 原有 Node 回归 | 71/71 通过 |
| 新增开始页浏览器，本地文件和 HTTP | 各7/7通过 |
| 推荐、空库兼容、HTML 安全、重复执行、悬浮、今天页浏览器 | 11 + 6 + 11 + 10 + 10 + 8，全部通过 |
| HTTP 数据安全浏览器 | 11/11通过 |
| JavaScript 语法与 Git 空白检查 | 通过 |

新增场景实际检查首次/刷新不恢复选择且不抽取任务、只选一项或仅切电脑不推荐、失败选择回退、当前会话导航、重复推荐避重、无匹配清空、推荐启动、未选条件直接手动选择长任务、键盘按钮、长说明默认收起、特殊字符安全展示和不重复写记录。

1366×768、1280×720及1024×600下断言两个入口和开始按钮全部在可视区域、无需滚动。375×667、320×568、240×600及700×400下断言无横向溢出，必要时开始按钮滚入可视区域且位置仍为 static。已保存并查看桌面与375px长内容截图；截图为合成页面，保存于仓库外 `START_SCREENSHOT_DIR`。

## 限制

未在用户日常浏览器、实体手机、多浏览器或屏幕阅读器软件中验收。长内容和小窗口允许自然滚动，不承诺所有内容同时可见。旧文档中“初始化即推荐”的测试结果属于历史行为，现以本轮刷新未选规则为准。系统休眠计时语义及多标签页并发写入等独立问题未在本轮修改。
