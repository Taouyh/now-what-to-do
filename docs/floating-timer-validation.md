# 网页内悬浮计时器验证

日期：2026-10-21。分支 `master`，HEAD `739715fe07d3110dc854c8dfe8ca4271eefb3141`。开始时已有空白初始化、目标移除及执行记录语义等未提交修改，已保留。本轮先只读审查，并在用户确认方案后实施。没有提交、推送或部署，没有访问用户真实浏览器配置或 localStorage。

## 实现范围

- `index.html`：新增静态悬浮结构和结束弹窗的额外放弃按钮，更新资源版本参数。当前目标入口已移除，本轮只适配现存导航，不恢复目标页面。
- `app.js`：`page()` 在导航时切换为悬浮显示；`startTimer()` 和 `showFullTimer()` 显示完整视图。初始化导航显式保留恢复后的完整视图。`timerView`、悬浮坐标与手势状态仅存于内存。
- `renderTimer()` 从同一份计时快照和同一个 `now` 渲染两个视图的时间、任务和状态，只显示其中一个；任务文本使用 `textContent`。没有为悬浮窗新增计时循环或累计用时变量。
- `setupFloatingTimer()` 绑定一次 Pointer Events：非按钮区域拖动，6px 阈值区分轻点与拖动，支持捕获、取消、捕获丢失和主指针检查；使用文档级移动/释放监听跟踪离开卡片的手势。按钮不参与拖动。拖动不选中文字或滚动页面，Enter/空格也可返回完整视图。
- `clampFloatingTimer()` 根据 visual viewport（无此 API 时使用窗口尺寸）和卡片尺寸限制位置，监听窗口及可视区域变化。小窗口使用紧凑样式；位置刷新后重置，不写入 localStorage，不推动页面布局。
- `openTimerEnd()` 复用现有确认层，提供完成、放弃和取消。完成仍调用 `finishTimer()`；放弃复用提取的 `discardTimer()`，不写完成记录；取消不改变计时状态。回调绑定当前执行 ID，旧确认不能处理新会话。保存失败保留活动计时、错误提示和重试途径。
- `style.css`：悬浮层高于普通内容、低于编辑和确认弹窗，数据保护层优先级保持更高；确认卡片在小窗口内可滚动。数据保护同时禁用悬浮操作。

存储键、主数据版本、计时字段、历史记录格式均不变，旧目标归属和开始/结束时间继续保留。`startTimerLoop()`、时间戳计算、暂停/继续、自动追加、恢复和 `finishTimer()` 的记录写入及防重规则保持原实现。切换视图与拖动不调用启动或追加操作。完成时主数据写入失败不清除活动计时；完成成功但清理计时失败时，继续沿用既有执行 ID 防重和恢复清理机制。

旧版 `finished` 会话在悬浮窗中显示“时间到了”，其“继续”调用原 `extendTimer()`，与完整视图原有追加行为一致，不因切换视图自动追加。自动追加仍将最初计划的一半取整到整分钟、最少 1 分钟，例如 5 分钟追加 3 分钟、15 分钟追加 8 分钟；本轮没有修改该边界。系统休眠是否算有效时间仍待确认。

## 实际执行的验证

Node.js v24.18.0 和本机 Chrome 无头浏览器，均使用内存合成数据或全新的临时浏览器配置。浏览器每场景独立上下文，刷新不会重新注入初始数据。

```powershell
node --check app.js
node --check tests/browser-data-safety.cjs
node --check tests/browser-floating-timer.cjs
node --test tests/data-safety.test.cjs tests/recommendation.test.cjs tests/repeatable-tasks.test.cjs tests/personal-activities.test.cjs tests/floating-timer.test.cjs
node tests/browser-data-safety.cjs tests/browser-floating-timer.cjs --file
node tests/browser-data-safety.cjs tests/browser-floating-timer.cjs
node tests/browser-data-safety.cjs tests/browser-html-safety.cjs --file
node tests/browser-data-safety.cjs tests/browser-recommendation.cjs --file
node tests/browser-data-safety.cjs tests/browser-personal-activities.cjs --file
node tests/browser-data-safety.cjs tests/browser-repeatable-tasks.cjs --file
node tests/browser-data-safety.cjs
git diff --check
```

| 检查 | 实际结果 |
| --- | --- |
| 新增悬浮状态 Node 测试 | 7/7 通过 |
| 现有数据安全、推荐、长期活动及记录 Node 测试 | 62/62 通过 |
| 悬浮窗 Chrome，本地文件入口 | 10/10 通过 |
| 悬浮窗 Chrome，HTTP 入口 | 10/10 通过 |
| HTML 安全、推荐、空库兼容、重复执行回归，本地文件入口 | 11 + 11 + 6 + 10，全部通过 |
| 数据安全 Chrome，HTTP 入口 | 11/11 通过 |
| 语法和 Git 空白检查 | 通过 |

合计69项 Node 测试、69次浏览器场景执行通过；浏览器次数包含相同悬浮场景分别在两种入口运行，无未捕获异常。

新增场景覆盖：

- 开始完整显示，真实导航点击后悬浮，非按钮轻点和键盘返回；两种视图显示一致；反复切换不改变活动计时原文或新增存储键，刷新循环保持一个。
- DevTools 输入协议驱动真实浏览器 Pointer Events，覆盖鼠标、触摸、笔拖动、触摸取消和主动释放捕获；拖动不误返回，不选中文字、不产生额外滚动；按钮单独点击不会进入拖动。
- 拖动两个方向的边界限制；320×480、320×240、220×190及恢复大窗口，时间和两个按钮仍在视口内；确认和编辑弹层位于悬浮窗之上。
- 暂停期间实际等待，剩余状态保持；继续正常计时；暂停后刷新恢复为完整视图且位置重置。
- 使用另一个临时标签使测试页面实际进入后台，检查 `document.hidden === true`，等待1.4秒后切回，时间按真实时间戳推进。重复渲染及切换不重复追加、不创建完成记录。
- 完成、放弃、取消，运行/暂停取消时存储原文不变，主数据保存失败后重试，重复确认只记录一次，旧确认不能结束新会话；已有开始、结束、有效用时和目标字段保留。
- 恶意 HTML 文本在悬浮窗和弹窗中保持普通文本。原有初始化、迁移、导入导出、配额失败、回退、推荐及历史保护回归继续通过。

截图通过可选 `FLOATING_SCREENSHOT_DIR` 保存到仓库外的审查目录，已查看桌面、小屏长任务名和结束确认截图。测试中的 DevTools 鼠标拖动必须同时携带一致的 `button` 和 `buttons` 参数；早期不一致输入造成用例失败，修正后以上结果均通过。没有将该测试输入问题误报为已确认的用户计时故障。

## 验证限制

未在用户日常浏览器配置中验收，未做实体触屏/手写笔硬件、多浏览器、真实系统休眠、浏览器进程完整重启测试。协议输入验证浏览器事件和 DOM 行为，不等于所有物理设备已验收。系统休眠计时规则、多标签页并发写入等既有独立边界未调整。任务名过长时悬浮窗截断显示，完整计时页仍显示完整名称。等待用户实际验收，本轮不继续其他模块。
