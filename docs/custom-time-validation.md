# 开始页自定义可用时间验证

2026-10-21：仅增加开始页的自定义可用时间，不修改任务时长、记录格式或计时算法。

- 输入接受 1–1440 的整数分钟；空值、零、负数、小数、非数字、指数写法和越界值均提示错误、禁用随机推荐、移除旧推荐。
- 时间和环境仍需显式选择；修改有效时长会复查推荐资格，仍符合条件的推荐保留，无匹配时显示空状态。
- 输入只存于当前页面内存。切换预设隐藏输入并保留草稿；刷新后清空草稿并恢复未选择状态。自定义值不写入备份的 `preferences.time`，该字段继续保存原有预设，沿用现有校验和格式。
- 现有“60 分钟以上”按钮的真实推荐条件是 `task.minutes <= 60`，本轮保持这一条件。任务库的独立时间筛选未改动。

实际执行结果：

- `node --check app.js`：通过。
- `node --test tests/custom-time.test.cjs tests/data-safety.test.cjs tests/recommendation.test.cjs tests/repeatable-tasks.test.cjs tests/personal-activities.test.cjs tests/floating-timer.test.cjs tests/today-records.test.cjs tests/start-page.test.cjs`：83 项通过，含新增 7 项自定义时间测试。
- `node tests/browser-data-safety.cjs tests/browser-custom-time.cjs --file` 与去掉 `--file` 的 HTTP 入口：分别 8 项通过。
- 同一浏览器驱动运行 `tests/browser-start-page.cjs`、`tests/browser-recommendation.cjs`、`tests/browser-html-safety.cjs`、`tests/browser-floating-timer.cjs`，均带 `--file`：分别 7、11、11、10 项通过。
- `node tests/browser-data-safety.cjs`：11 项数据安全浏览器场景通过。
- `git diff --check`：通过（仅既有 LF/CRLF 提示）。

浏览器合计 66 次场景执行通过。全部使用新建临时 Chrome 配置和隔离场景中的合成数据，未打开用户浏览器配置或操作真实数据。通过真实 Chrome 的输入、鼠标与键盘事件验证 8、25、45、90 和边界值，错误输入、预设切换、环境和电脑条件、旧按钮失效、空状态、刷新、手动选择、任务原始计时时长、保存失败、导入和主题同步；视口覆盖 1366×768、1024×600、375×667、320×568、240×600，并查看了桌面和窄屏截图。

限制：浏览器为 headless Chrome；窄屏为设备模拟，尚未在实体手机、移动软键盘或其他浏览器中人工验收。
