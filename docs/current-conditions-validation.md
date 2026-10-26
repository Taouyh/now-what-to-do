# 当前条件与无固定时长活动验收

## 2026-10-26：条件复选框、悬停展开与移出关闭

- 当前条件按参考图统一为四行：文字在左、方形复选框在右；去掉面板内重复标题和打断选项分隔线。
- 鼠标从面板任一边移出立即关闭；面板内移动与连续勾选保持展开。打开前先定位面板，避免首次打开时因位置变化意外关闭。
- 可用时间与当前条件均在鼠标进入入口时直接展开，无需点击；随后点击入口仍保持展开。入口移出留出 160 毫秒供鼠标跨越入口与弹框之间的空隙，进入弹框即取消待关闭操作；直接离开弹框仍立即关闭。两个弹框互斥。
- 触屏勾选后保持展开，点外部关闭；保留键盘空格勾选、Tab 切换和 Escape 关闭并返回入口焦点。
- 首次使用时四项条件全部不勾选；已有用户的主动选择继续保存和恢复，悬停与关闭不修改偏好。
- 时间选项保持 5、10、15、30、60 分钟和自定义，暂不加入「不设时长」。关闭面板不会写入偏好，也不会修改计时。
- 验证：109/109 自动测试、12/12 当前条件真实浏览器场景、23/23 界面回归场景均通过；浏览器通过直接打开 HTML 检查。已检查桌面与手机截图，使用独立浏览器和合成数据。
- 本次仅修改本地源码，尚未发布或重新打包。

以下为此前验收记录。

日期：2026-10-23。本次在已有界面修改上继续实现，本文记录本地验证结果，尚未发布线上。

## 交互结果

- 首次使用：只展示「有什么事，你一直想做？」、名称输入和「添加活动」。添加后直接出现推荐；备份恢复入口位于设置。
- 开始页：卡片外保留本次可用时间与折叠的「当前条件」。推荐卡片保留名称、开始、换一件；只有一个候选时隐藏换一件。自行选择活动入口保留。
- 当前条件：方便使用电脑、方便听音频、方便出声，可独立组合；开启「可能随时被打断」时优先推荐没有标注不便中断的活动。此项是偏好，允许回退或通过换一件访问其他符合必需条件的活动。
- 活动添加和编辑：名称是唯一必填项；按需展开所需条件与说明。不再填写、展示或按固定时长筛选活动。
- 计时：推荐开始与列表直接开始统一使用本次可用时间；无效自定义时间阻止开始。更改条件和时间不会改动正在运行的计时。

## 数据处理

新活动使用 `requirements` 保存 `computer`、`audio`、`speech`、`uninterrupted`；偏好使用 `conditions` 保存 `computer`、`audio`、`speech`、`interrupted`。仍使用 v2 顶层备份结构，早期应用未必能读取新增结构，应使用本版恢复。

保留旧活动的 `minutes`、`env`、`computer`、分类、说明与未知字段。旧时长和安静／嘈杂／听课不参与推荐，不从旧环境推断新的音频与出声条件；旧电脑要求仍可识别，编辑后的新 requirements 优先。完成记录、实际投入时间和进行中的计时保留原有语义。

旧数据加载不会自动写回；用户编辑或修改偏好后才保存。v1 缺少偏好的备份在首次保存后仍可重新导入与加载。保存失败回滚当前条件和控件，导入仍需确认并验证数据。

## 验证

以下检查已通过；浏览器测试使用临时独立配置和合成数据，不操作真实用户数据。

| 检查 | 结果 |
| --- | --- |
| `node --check app.js` | 通过 |
| `node --test tests/*.test.cjs` | 88/88 |
| `node tests/browser-data-safety.cjs tests/browser-current-conditions.cjs` | 9/9，HTTP |
| 上一命令添加 `--file` | 9/9，直接打开 HTML |
| `node tests/browser-data-safety.cjs` | 11/11 |
| `node tests/browser-data-safety.cjs tests/browser-html-safety.cjs --file` | 11/11 |
| `node tests/browser-data-safety.cjs tests/browser-floating-timer.cjs` | 10/10 |
| `node tests/browser-data-safety.cjs tests/browser-minimal-ui.cjs` | 23/23 |
| `git diff --check` | 通过 |

共 73 次通过的浏览器场景执行。覆盖首次添加、条件组合、旧按钮防误启动、时长与条件修改、可中断偏好、自定义时间、旧数据编辑及备份往返、写入失败、键盘操作、路由、设置与计时恢复、浅深色及手机／桌面布局。新版条件语义由 `browser-current-conditions.cjs` 覆盖；早期专用于旧环境或任务时长的浏览器脚本不代表新版筛选规则。

已检查实际页面截图，包含 320/390/1440 像素布局：

- `test-artifacts/current-conditions/01-onboarding.png`
- `test-artifacts/current-conditions/02-single-recommendation.png`
- `test-artifacts/current-conditions/03-current-conditions.png`
- `test-artifacts/current-conditions/05-conditions-320.png`
- `test-artifacts/current-conditions/06-library-1440.png`
- `test-artifacts/current-conditions/07-editor-320.png`

截图与运行日志为本地验证产物，不属于用户备份。
