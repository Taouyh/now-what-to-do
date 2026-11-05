# B/C 旧书版技术设计

版本：TD 1.1，2026-11-05。状态：阶段 7 已实现书版首个候选版本，独立验收进行中。选型见 [FRAMEWORK](../../technology/book-c-2026-11-05/FRAMEWORK.md)，需求以 [PRD](../../product/book-c-2026-11-04/PRD.md) 和 [INTERACTIONS](../../product/book-c-2026-11-04/INTERACTIONS.md) 为准。下列领域模块目录仍是逐步迁移目标，当前真实结构见本节末的实施记录。

用户本轮授权从设计推进选型和技术文档；不因此宣告原型实点或参与者测试通过。旧文档的“阶段 5 未启动”描述保留为历史日期状态。本文不批准 PRD 之外的功能。

## 1. 范围与设计基线

本项目统一使用 Figma 账户 `3966592487`。每次连接 Figma 时，先核对当前账户，再读取或编辑设计稿、导出素材或进行原型验收。

实现单设备、本地优先的推荐、任务管理、专注与恢复、今天记录、三语言、深浅主题和文件备份。不增加账号、同步、服务端、月历排期、AI 拆解或默认样例任务。

| 模块 | Figma 目标节点（文件 EUoXZR1hDJUUPVAtrDxpE5） | 实现要点 |
| --- | --- | --- |
| B 首页 | [49:244](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=49-244) | 单项推荐、时间与条件卷轴 |
| C 任务 | [151:3405](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-3405) | 双页各 5 项，整行编辑、独立播放 |
| C 添加/编辑/删除 | [151:4235](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4235)、[151:4148](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4148)、[151:4308](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4308) | 草稿与持久数据分离 |
| B 专注/恢复/反馈 | [71:1045](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=71-1045)、[203:4267](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=203-4267)、[205:4085](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=205-4085) | 快照、计时状态机和续做草稿 |
| C 日历 | [151:4354](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4354)、[151:4958](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=151-4958) | 目录 5 组、明细 4 条，独立分页 |
| B 设置 | [111:4832](https://www.figma.com/design/EUoXZR1hDJUUPVAtrDxpE5?node-id=111-4832) | 三语言、主题、真实文件导入导出 |

阶段 6 曾因 Figma 连接失败而采用仓库设计证据；阶段 7 已恢复连接，核对账户 `3966592487`，读取首页、任务、添加、专注、恢复、反馈、日历和设置的实时设计上下文与截图。素材和字体已本地化，来源见 `public/assets/PROVENANCE.md`。未向 Figma 写入设计变更。

### 当前实施结构与迁移边界

- `src/main.ts`、`src/ui/book.ts` 负责书壳和交互装配；`src/ui/pages.ts` 实现推荐/续做、双页任务、日历分组和分页；`src/domain/pagination.ts` 提供有边界修正的分页；接口在 `src/ui/runtime.ts`。
- `app.js`、`i18n.js` 继续作为唯一计时、迁移、存储和语言实现，Vite 的 `virtual:runtime` 将同一份源码打进经典 IIFE，并只向新页面提供显式接口。现有 VM 单元测试仍执行同一份源码。避免一次重写成熟计时引擎；不宣称它们已经全部迁为 TypeScript 或纯领域模块。
- 开发 HTML 为根 `index.html`，加载 `src/main.ts`；`scripts/assemble-web.cjs` 生成 `dist/web/index.html`、`app.js`、`style.css` 和完整 `assets/`。字体作为本地独立文件，避免内联为巨大的 CSS。WebView2、Android、Electron 均消费这一目录，保持原来源和用户数据路径。
- `npm run dev` 启动 Vite；`npm run web` 先构建后提供生产预览；`npm run build:web` 做类型检查与构建；`npm test` 做核心回归；`npm run test:e2e` 用独立 Edge context 和 8766 端口执行真实浏览器测试。测试只注入合成数据。
- `src/main.ts` 在加载计时运行时之前取得同来源 Web Lock，第二标签只显示回原窗口/重新加载提示，不初始化计时或写数据；页面关闭释放锁，返回缓存页面时重载重新取得锁。`file:` 或不支持 Web Locks 时降级为单窗口使用，监听外部存储变化并进入保护模式；主数据写入前仍复读原文。降级路径不是原子跨标签锁。原生宿主保留每 profile 单实例约束。
- 800px 以下使用保持操作可用的单列降级布局。这是工程适配，不代表已获得完整移动端 Figma 设计批准或参与者研究通过。

最新验证结果与独立窗口报告见 [实施与验证记录](../../development/book-c-2026-11-05/IMPLEMENTATION.md)，不以本文的目标验收表推断未执行测试已通过。

## 2. 架构与目录

调用方向为：页面事件 → 应用命令 → 领域函数 → repository → 持久化成功 → 更新 store → 局部渲染。读操作用 selector 派生；失败不发布成功状态。

```text
src/
  main.ts                       # 初始化、保护模式、生命周期
  app/store.ts                  # 内存状态、订阅、命令串行执行
  app/commands.ts               # 完成/导入等跨模块编排
  domain/types.ts               # 数据与结果类型
  domain/recommendation.ts      # 筛选、跳过、排序与选取
  domain/session.ts             # 专注状态转换、快照与投入计算
  domain/history.ts             # 本地日、分组、汇总
  domain/pagination.ts           # 派生分页和边界修正
  infra/storage.ts              # 唯一 localStorage 读写入口
  infra/validation.ts           # 外部 JSON 校验、版本迁移
  infra/clock.ts                # 可注入时间源
  infra/platform.ts             # 导出和生命周期适配
  ui/book.ts                    # 书壳、书签、返回专注
  ui/pages/{home,tasks,focus,calendar,settings}.ts
  ui/components/{scroll,task-row,pager,notice}.ts
  ui/styles/{tokens,book,controls,motion}.css
  i18n/{zh-CN,en,ja}.ts
public/assets/                  # 已确认授权的字体、纹理与 SVG
web/index.template.html         # 生产 HTML，经典脚本入口
web/dev.html                    # Vite 开发入口，加载 src/main.ts
scripts/assemble-web.cjs        # 生成 HTML 并复制运行资源
vite.config.mts
tests/unit/                    # 纯领域函数测试
tests/e2e/                     # 浏览器验收
```

domain 不依赖 DOM、Storage 或 native bridge；由调用者传入数据、时钟与随机数。UI 模块返回 `dispose()`，卸载时注销监听、订阅和动画；全局专注服务不随切书签卸载。倒计时只更新数字与状态，不每 250ms 重绘整本书、表单或纹理。

保留现有根目录脚本和 harness 作为迁移基线；按模块替换后才删除对应旧实现。不要保留两份会写同一存储的计时引擎。不更改 package 的全局 module 类型来破坏现有 `.cjs` 脚本。

## 3. 状态与数据契约

### 3.1 五类状态

| 类别 | 包含 | 生命周期 |
| --- | --- | --- |
| 主数据 | tasks、completed、preferences、theme、兼容字段 | 主文档持久化 |
| 进行中会话 | 独立任务快照、投入、计划、暂停、追加、恢复信息 | activeTimer 独立持久化 |
| 当前轮次 | 本次 time、自定义时间、四项 conditions、skippedTaskIds、推荐任务 ID | 当前运行轮次；正常结束重置条件和跳过集 |
| 草稿 | 添加/编辑/续做说明、校验错误 | 保存前不写任务；关闭丢弃 |
| 展示状态 | 当前书签、页码、卷轴、焦点、说明展开、选中记录 | 内存；不作为业务数据写盘 |

每次完整启动四项当前条件为 false（PRD 覆盖旧版本重启后恢复条件的行为）；同一轮切书签、开关条件卷轴保持。旧 `preferences.conditions` 字段仍可兼容读取和导出，但不能作为下次启动的环境事实。可保留旧偏好写回格式，启动只在内存清零，不为此重写整个旧文档。

时长沿用已有有效预设，空库首次默认沿用 `freshData()` 的 15 分钟；旧数据缺少时间沿用迁移的 10 分钟，不统一重置为设计样例的 25 分钟。自定义 1–1440 整数保留 v1.3 的本次运行有效规则，重启回到已保存的有效预设；正常完成不清除本次自定义时间。不要把临时自定义值塞入只接受预设值的 v2 preferences.time。

### 3.2 存储格式和类型

继续使用 `whatToDoData`，包含 `version: 2`、`goals`（旧字段）、`tasks`、`completed`、`preferences`、`theme` 及未知字段。`activeTimer` 使用已有 timerVersion 2；新鲜启动无进行中会话则不存在该 key。

```ts
type Conditions = { computer: boolean; audio: boolean; speech: boolean; interrupted: boolean };
type Requirements = { computer: boolean; audio: boolean; speech: boolean; uninterrupted: boolean };
type Task = {
  id: string; name: string; requirements: Requirements;
  description?: string; enabled?: boolean;
  [legacyField: string]: unknown;
};
type Result<T> = { ok: true; value: T } |
  { ok: false; code: 'invalid' | 'storage' | 'conflict' | 'blocked'; message: string };
```

`Task` 是迁移后领域视图；旧活动缺 requirements 时经现有 activityRequirements 适配，校验和导出保留旧 minutes/env/computer 等字段。名称 trim 后非空；不新增未经 PRD 批准的字符上限。说明可以清空，不静默裁剪长文本。TypeScript 不能替代运行时 JSON 校验。

会话持久字段继续包括 `completionId/taskId/task/taskName/plannedDurationMs/durationMs/extensionDurationMs/elapsed/lastStarted/startedAt/checkpointAt/paused/finished/pausedDurationMs/pauseStartedAt` 和已有恢复字段。开始时深拷贝任务，渲染专注优先使用快照，不从实时任务库覆盖名称或说明。旧会话快照缺字段按既有恢复规则处理，不凭空补“已投入”。

记录沿用 `recordId/completionId/taskId/taskName/startedAt/endedAt/completedAt/date/actualDurationMs/plannedDuration/pausedDurationMs/extensionDurationMs` 及兼容字段。新增记录的 recordId 与 completionId 均为会话 completionId。计划的兼容字段单位为分钟，带 Ms 字段单位为毫秒；派生显示分钟不得写回覆盖精度。现有未知字段、旧目标、记录 ID 归一化逻辑均需保留。

创建任务和会话使用稳定随机 ID；不可用随机 API时采用可检测碰撞的回退，创建前查重；不用数组下标、名称或 Figma 槽位做持久关联。删除任务不级联记录，会话也不依赖任务继续存在。

### 3.3 应用接口

以下为接口语义，具体 TS 签名在工程化时落地。所有变更入口串行执行，并对异步保存期间重复点击设防。

| 接口 | 输入与结果 | 约束 |
| --- | --- | --- |
| load/validate/migrate | 原始 JSON → Result 主数据/会话 | 不就地改外部对象；失败留原文 |
| saveTask | 任务 ID 或新建、草稿 → Result Task | 无变化不写；失败保留草稿 |
| deleteTask | 明确确认的 taskId → Result | 仅删除 tasks 中该 ID |
| recommend | tasks、conditions、skippedIds、avoidId、rng → pick/empty/no-match/exhausted | 纯函数，返回明确空状态 |
| startSession | taskId、本次分钟 → Result Session | 已有会话优先返回原会话 |
| pause/resume/extend | completionId、clock → Result Session | 校验当前 ID、状态及恢复边界 |
| finishSession | completionId → Result Record | 幂等，见第 5 节 |
| discardSession | completionId → Result | 仅清会话，不记历史 |
| importBackup | 已验证、已确认的候选 → Result | 整份主数据替换；activeTimer 不动 |
| exportBackup | 主数据快照 → 文件结果 | 不含活动会话；取消不同于成功 |

没有服务端 HTTP API；平台边界继续兼容 `window.nativeApp.exportText(content, name): Promise<boolean>`。保留现有安全文件名；结果 false 为用户取消，不提示“已保存”。原生生命周期事件经 platform 转交 session 服务，网页使用 visibility/pagehide 等入口，不把后台标签定时器当成可靠时钟。

## 4. 推荐、任务与日历算法

### 4.1 推荐

1. 仅保留 enabled 不为 false 的任务。电脑/音频/出声三项满足 `!requirement || condition` 才可行；不以旧任务 minutes 或 env 追加新的过滤。
2. 排除本轮跳过 ID。区分无任务、无可行任务和本轮耗尽；不得偷偷放宽限制或注入样例。
3. 有其他可行项时先避免刚完成/刚显示项，再按 interrupted 条件优先可中断任务；没有可中断任务仍可选择不便中断项。保留既有“结束后避免重复优先于可中断偏好”的测试。
4. 从剩余池随机选择；测试注入 rng 确保可复现。单候选仍可开始；换一件入口遵循当前 PRD/已有单候选规则。
5. 修改条件或任务后重新核验当前候选；点击开始时再查 ID、当前推荐与条件，阻止已删除或过期推荐启动。

### 4.2 任务分页与编辑

用持久 tasks 的原有顺序。双页组索引 p 从 0 起：`tasks.slice(10*p, 10*p+5)` 为左页，后 5 项为右页。组数 `ceil(n/10)`；0 项用空书页表现，内部 p=0，不显示“第 1/0 页”。新增成功定位 `floor((n-1)/10)`，删除后 p 限制到剩余有效范围；编辑取消/保存保留原组。

任务条采用同一视觉纸条内相邻的“编辑按钮”和“播放按钮”，避免按钮内嵌按钮；鼠标空白属于编辑点击区，播放只触发 start。悬停不改选中任务或右页状态。删除确认保留编辑草稿，取消返回原草稿；关闭、取消、切书签丢弃草稿。中文输入法组合输入期间不抢先 trim/提交，提交时统一校验。

### 4.3 今天记录

沿用 recordsForLocalDay：按设备本地日期，依据 `completedAt || date` 归入完成当天；跨午夜不拆分投入，也不把整段差值当实际投入。存储时间戳保留原格式，显示用当前设备语言和本地时区；时区变更会影响今天归属，这属于已有口径，不在本轮改为固定中国时区。

分组键为 taskId，重名任务不合并。按 `startedAt ?? endedAt ?? completedAt ?? date` 时间升序，组按首次出现顺序；每组也保持升序，与 todayRecordGroups 基线一致。目录用记录快照名称，不能因删除/改名丢失历史；每条记录使用其自己的 taskName。

先对今天全部记录汇总精确 actualDurationMs（缺失才用现有分钟字段回退），再分页。左侧每页 5 组，右侧每页 4 条；选组时右页归零，左页翻动时清除不可见组并显示查看提示。同一时刻最多展开一条。沿用 v1.3 的 10 秒明细自动收起，用户操作可重置；分页/切书签销毁对应超时。计划、暂停、追加只读。日期在启动、回到前台和跨午夜时刷新。

## 5. 计时状态机、完成事务与恢复

### 5.1 状态机

| 当前状态 | 动作 | 目标状态/影响 |
| --- | --- | --- |
| idle | 开始 | 先保存会话，再进入 running；失败不启动 |
| running | 暂停 | 结算有效片段、保存为 paused |
| paused | 继续 | 原会话 running；长暂停走已有恢复分段 |
| running | 到点 | time-up，投入封顶，不自动记录 |
| time-up | 追加 | 原计划不变、增加总预算与 extensionDurationMs，running |
| running/paused/time-up/recovery | 结束 | finishing，成功后 idle + 首页反馈 |
| 任意有会话状态 | 重新打开/异常间隔 | recovery，未经确认不继续计入 |
| recovery | 直接放弃 | 清除会话后 idle，约 30 秒提示，不走完成反馈 |
| 任意保存失败 | 重试 | 保留已确认的持久状态，不假成功 |

页面切换不是会话状态转换；存在会话时任何任务播放都返回原专注，不覆盖。新增显式 UI 状态可由旧布尔字段推导，不为了前端状态机强制改写 timerVersion。

### 5.2 时间规则

- running 的实际投入为 `min(durationMs, elapsed + max(0, now-lastStarted))`；paused、time-up、recovery 仅使用确认累计值。不能通过 setInterval 次数计时。
- 追加量为 `max(1, round(plannedDurationMs / 120000)) * 60000`；25 分钟追加 13 分钟。等待时长不算投入，追加后不补算等待。
- 保留 5 秒 checkpoint、60 分钟长暂停、未观察心跳超过 2 分钟的已有边界与后台已知间隔逻辑。不要简单把每次 visibilitychange 都当异常结束；正常短后台可以到点封顶，重启/睡眠/长失联按既有安全恢复。
- 初始化、暂停、继续、追加、到点、切后台和关闭等边界均触发必要检查点；checkpoint 写失败应停止继续承诺可靠累计，提供重试，不丢原快照。
- 首轮继续复用既有经过回归的计时算法，clock 抽象供测试；系统时钟明显回拨/跃迁进入确认恢复，不把跳变计为投入。引入单调时钟改造须单独对照现有生命周期测试。
- 崩溃时最多只能恢复最后成功保存的可信进度，不能承诺零损失；缺少可信时长的旧计时需显式确认。长暂停分段继续保留原分段记录和新会话 ID 的既有语义。

### 5.3 正常完成顺序

localStorage 不提供两个 key 的事务。使用相同 completionId 重试保证记录不重复；UI 命令串行，finishing 时禁止再次开始或结束。

1. 读取并确认当前 activeTimer 的 completionId，冻结有效投入、快照和结束边界。需要恢复确认时先完成确认，不能猜测。
2. 若主数据无该 completionId，在主数据候选中追加一条记录；同时将 `preferences.conditions` 四项设 false。若已有记录，复用它并确保条件重置。用一次 setItem 提交完整主文档；失败保留会话和原条件，不显示记录成功。
3. 主文档提交后删除 activeTimer。失败保留“记录已保存、会话清理待重试”的受限状态；不开放新会话，不再次追加记录，也不误报全部完成。
4. 清理成功后清空运行轮次条件/跳过集，保留本次时间，清除进行中 UI，再基于清空后的条件生成下一项推荐，尽可能避免刚完成任务。
5. 创建以原 taskId 关联的首页续做反馈，无操作一直保留；保存/取消/关闭/开始下一次隐藏。保存只改仍存在的原任务说明，不改新推荐任务、快照或历史；删除原任务后不误写别项。无变化关闭不写。

崩溃发生在第 2、3 步之间时，启动发现 activeTimer 的 completionId 已记录，只重试清理，不再次计入；条件已随同记录落盘。恢复继续新分段属于已有特殊分支：原段幂等保存后创建新会话，不执行普通“回首页清条件”流程。

放弃仅删除 activeTimer，删除失败仍留在会话；成功后显示“不计入今天”提示。放弃不是正常完成，不创建记录/续做反馈，不顺带执行正常完成清条件流程。

## 6. 存储、备份、升级与失败恢复

读写只在 repository 中发生。先 validate → 深复制候选 → migrate in memory；验证不通过的原文必须保留且可导出，不能用空数据覆盖。无效新版本进入保护模式。未修改用户数据时不为“升级界面”写盘，保留未知字段。

| 场景 | 必须行为 |
| --- | --- |
| 名称无效 | 字段错误、保留其他草稿、聚焦错误位置 |
| 主数据/会话 JSON 损坏、读权限失败 | 停止写入和计时；可读原文提供导出；不自动清空 |
| QuotaExceededError 或 setItem 失败 | 保留旧持久数据与草稿，提示重试/导出；不发布成功状态 |
| 记录写成功、会话删除失败 | 按 completionId 恢复清理，不重复记账 |
| ID 不存在/过期事件 | 返回 conflict 或回当前会话，不改别项 |
| 导出取消/失败 | 取消无成功提示；失败可重试 |

导出只包含主文档，不包含 activeTimer，不把网页内存空默认当作损坏原文的备份。导入先完整校验，展示替换任务/记录/偏好/主题/兼容字段的范围，用户确认后再写主文档；取消不改变任何内存或磁盘数据。activeTimer 保持原样；同一会话的完成记录已存在于导入数据时，按幂等清理处理，不能再产生重复。

继续沿用现有文件导入校验和回滚保护，导入阶段序列化命令、暂停其他写入；提交前复读原文检测变化，失败保留原文并阻止后续覆盖。设置恢复后的显示状态从已提交主数据重建，不能半导入。

Windows 来源 `https://nowwhat.local` 和 `%LOCALAPPDATA%/NowWhat/WebView2` 不改；Android 来源 `https://app.nowwhat.local`、包名和签名身份不改。保持安装升级路径，Windows 1.0 的不同来源仍使用原有显式导出/导入途径。不读取用户真实 profile 来测试迁移。

网页按 origin 隔离：localhost、127.0.0.1、不同端口、HTTP/HTTPS 或 file 是不同数据位置。换开发服务器不等于数据被删除；用合成备份验证，不能偷偷复制个人浏览器数据库。

多上下文：Windows 已有每 profile 单实例机制继续保留；网页同 origin 优先用 Web Locks 持有写锁，第二标签只读并提示回原窗口。实现需覆盖锁释放和崩溃恢复。若环境不支持该 API，仅支持单标签写入，监听 storage 并在发现外部变更时阻止旧状态覆盖；后者不是原子跨标签锁，不能声称保证并发写入。该限制需写入发布说明并验证受支持运行环境。`storage` 事件本身不充当事务。

暂不迁移 IndexedDB/SQLite；如实测 localStorage 容量或同步写耗时不合格，另写 ADR 与可恢复迁移，再变更 schema。UI 布局调整不应顺带换数据库。

## 7. 视觉实现、可访问性与适配

书本、书脊和纹理为表现层，文字与控件为真实 DOM。CSS tokens 管理纸面、墨色、皮革、黄铜、字体、阴影、间距和层级；背景材质 pointer-events:none。共享书本几何保持切页时背景/书签不跳动；不用整页背景图承载操作。

首页、C 任务与 C 日历共享双页 Grid。任务和目录用分页，长说明仅在阅读/输入区域内滚动；长名称限制展示区域、允许合理换行或省略，同时提供键盘/触摸可达的完整名称查看方式，不只用 hover title。

目标桌面视口为约 1236×715、1480×715 CSS 像素：书本、四书签、页底可见，不产生整页纵向滚动。字体和触达区域不可只用 transform 全局缩小；先分配标题/页脚空间再排内容。初始实现可采用 16px 正文、44px 图标触达区作为工程目标，具体值经三语言实窗复核，不能冒充已读取 Figma token。

小窗口、125%/150%/200% 系统或浏览器放大分别测试；如果双页无法同时满足阅读与完整显示，提出单页适配稿并补 PRD/设计决定，不能擅自宣称小屏双页验收通过。移动旧书布局尚未批准；保留已有移动可用能力，不能用“桌面优先”删除它，亦不能在新布局未验收时替换 Android 发布包。

卷轴用语义 dialog/表单：开启时焦点进入，modal 时隔离底层焦点，Esc/关闭/取消不保存草稿，关闭返回触发控件；删除确认取消回编辑草稿。条件卷轴即时选择与任务表单草稿规则不同。分页、书签、播放具备名称与禁用状态；错误用文本和 aria-invalid/关联说明表达。

展开/收回采用约 240ms ease-out，与 Figma 10ms 状态切换仅作视觉参考；业务保存/关闭不等待动画。用取消令牌防止旧动画回调关闭新弹层；快速双击、连续开关与 reduced-motion 都须验证。倒计时不逐秒向读屏器播报，仅状态变化提示。文字对比度以 WCAG AA 的正文 4.5:1、大字 3:1 为验收目标（[W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)）。

Noto Serif SC、Noto Sans SC、EB Garamond 按授权打包；不在运行时请求字体服务。中文、英文、日文与 light/dark 的业务文本和控件均验证，不能仅设置页翻译。用户内容以 textContent/安全属性渲染，不拼接为可执行 HTML；纹理素材也需记录来源和许可。

## 8. 构建、运行与验证命令

版本基线和来源见 FRAMEWORK。新增依赖属于后续工程化提交，本轮不修改 package.json/lockfile。

生产构建契约：Vite library mode 单入口 src/main.ts，`formats: ['iife']`、name 为 NowWhat、输出固定 app.js 与 style.css，禁止运行时动态 import。源文件可模块化，产物为经典脚本。assemble-web 根据 template 生成 `dist/web/index.html`，复制 `assets/` 和图标；原 i18n 代码进入 bundle，平台桥接仍在 app.js 前加载。素材通过受控 public 目录复制，不把大纹理作为 library import 内联。路径保持相对，不引用开发服务器。

初始 build.target 为 es2020；API 支持另行检测/回退（如 inert、Web Locks、随机 ID），语法转译不补 API。实际支持范围由受测 WebView/浏览器版本记录确定，不因操作系统可安装就宣称旧 WebView 全部兼容。验证 HTTP、file 经典脚本入口与两个安装壳；file 存储限制见 FRAMEWORK。

Windows/Android 脚本要从整个 dist/web 复制资源，不再依赖四个根文件。桥接加载入口改为模板标记，不能继续靠替换旧 i18n script 标签注入。网页静态托管发布 dist/web 应用资源，宣传页单独保留；发布脚本必须验证子路径、完整资源清单与旧发布能力。不要把 Vite dev 根目录暴露给公网，开发服务仅监听 127.0.0.1。

| 命令 | 当前状态 | 目标意义 |
| --- | --- | --- |
| `npm ci` | 已有锁文件 | 干净环境安装精确依赖 |
| `npm run web` | 已存在 | 原网页本地入口，默认 http://localhost:8765 |
| `npm test` | 已存在，本轮 128 通过 | 旧逻辑回归；不包括 browser-*.cjs 真实浏览器验收 |
| `npm run dev` | 待新增 | Vite 开发入口 web/dev.html，本地固定端口 |
| `npm run typecheck` | 待新增 | tsc --noEmit，明确迁移 JS 与新 TS 范围 |
| `npm run test:unit` | 待新增 | node:test 运行新纯领域测试，Node 24 下使用可擦除 TS 语法 |
| `npm run test:e2e` | 待新增 | Playwright 自启专用服务和独立合成数据 context |
| `npm run build:web` | 待新增 | 类型检查、Vite 打包、assemble-web、资源清单 |
| `npm run preview:web` | 待新增 | 只服务 dist/web，供验收生产产物 |
| `npm run build:windows` / `build:android` | 已有，资源接入待修改 | 先调用 build:web，再用既有平台链打包 |

旧 `tests/browser-*.cjs` 多为被其他 harness 调用的场景模块，不可直接 `node file` 后把退出码 0 当通过。工程化首先建立明确 runner，或者逐场景迁至 Playwright；旧 Node harness 也不能靠只运行遗留 app.js 而掩盖新实现未测。新领域测试直接覆盖新模块，旧测试对新入口的等价行为继续有效。

当前 PRD 明确覆盖的旧行为需要同步调整旧断言，例如重启后恢复旧环境条件、完成后保留环境条件、旧菜单/编辑命中区。每项调整须注明对应 PRD 条款，保留旧数据兼容和故障保护断言，并补新行为的验收；“保留回归基线”不表示强迫新实现满足已被替代的旧交互，也不允许通过删除失败测试掩盖问题。

## 9. 测试与验收矩阵

详细独立窗口交接见 [TEST-HANDOFF](TEST-HANDOFF.md)。测试均用合成数据、独立 origin/profile，禁止清空或导入替换真实用户数据。

| PRD 验收 | 必测内容 | 层级 |
| --- | --- | --- |
| C01 | 两目标视口整书可见、全局不滚动、主题/语言与放大 | 浏览器截图+人工实点 |
| C02 | 0/1/5/6/10/11/20/21 项；增删定位、无遗漏 | 单元+浏览器 |
| C03 | 悬停无状态变化，纸条编辑与播放分离，键盘等效 | 浏览器 |
| C04–05 | 空白/无变化/清空说明/取消/删除草稿、历史与会话快照 | 单元+浏览器 |
| C06–07 | 暂停/到点/追加/导航返回/第二次播放；重复结束 | 时钟单元+真实生命周期 |
| C08 | 16 种条件 × 运行/暂停/到点结束；恢复结束；保留预设/自定义 | 单元+浏览器抽样端到端 |
| C09 | 目录 0/1/5/6/10/11 组、明细 0/1/4/5/8/9 条；跨日、同名不同 ID | 单元+浏览器 |
| C10 | 真实备份往返、取消、无效 JSON、旧版、超配额、写/删失败、幂等恢复 | 故障注入+浏览器+原生桥 |
| C11 | Tab 顺序、Esc/焦点返回、图标名称、读屏状态、减弱动态 | 浏览器+人工 |
| v1.3 保留 | 旧字段/语言/主题、自定义、长暂停分段、文件导出、移动入口 | 回归+安装包升级 |

另用 1,000 项任务、10,000 条合成记录观察启动/写入/翻页性能和配额；记录硬件、WebView 版本、资源大小和耗时，不写未测性能承诺。若达到存储上限应明确失败、可导出且不丢数据，不能以“无限记录”承诺取代配额处理。

当前证据：本轮仅已有 Node 128/128 通过；书版 UI、类型检查、新构建、Playwright、安装升级、参与者测试均未执行。本轮文档不能作为这些项的通过报告。

## 10. 开发切片、Git 与发布边界

| 切片 | 可审查成果 | 进入下一片的条件 |
| --- | --- | --- |
| S0 基线 | 整理已存在用户改动、文档和合成测试入口 | 原测试可复现、工作树归属明确 |
| S1 工程化 | 锁定依赖、模块/构建、完整资源与平台冒烟 | 原 UI 功能不退化，新产物可离线运行 |
| S2 领域 | 推荐/会话/存储抽取、完成清条件、数据故障保护 | 新旧契约差异显式测试；计时安全回归 |
| S3 书壳与首页 | B 首页、卷轴、B/C 导航、目标视口 | 最新设计节点核对、键盘与适配验证 |
| S4 任务 | C 动态分页与增删改、独立开始 | C02–05，通过任意输入和快照回归 |
| S5 专注与记录 | B 专注/恢复/反馈、C 日历 | C06–09、幂等故障及跨日验证 |
| S6 设置与整合 | 全局三语言/主题、真实备份、平台回归 | C10–11、用户数据兼容与独立验收 |

每片先由开发者运行适当检查，再交独立窗口；最后集成版再做完整独立验收。独立窗口未完成时标记未验收，不能拿开发者自测代替。

本地 Git 评估：当前 HEAD `edd744c` 在 `design/minimal-ui`，master `4ed3aa1` 是其祖先，`master...design/minimal-ui` 为 0/10；origin 跟踪引用与本地分支一致。只核对本地引用，未 fetch，远程实时状态须在合并前刷新。没有重建仓库的证据。

保留并整理用户未提交改动，不 reset/clean、不强推、不在脏树切 master。先按“现有应用变更”“产品与设计资料”“本轮技术交付”分组审查提交，人工检查不会纳入签名密钥或个人数据；不盲目 git add .。本轮未提交/切分支/合并。

之后可在当前分支逐片提交，或从已保存基线建立 `codex/book-ui-implementation`，合回 design/minimal-ui 作为集成线；最终源分支仍为 design/minimal-ui，目标为 master。独立验收在固定 SHA 的另一个 worktree 完成，不共享正在编辑的工作树。远程更新后重新核查祖先关系；仍可快进则快进/PR 合并，有新 master 提交则正常合并并复测，不重写历史。合并后对 master 产物冒烟；创建版本和发布安装包属于阶段 8，未由本轮执行。

## 11. 开放项与变更管理

- Figma 实时读取/素材与精确 token：对应页面实现前复核，不影响本轮架构；读取恢复前不能签署逐像素还原通过。
- 小窗口、系统放大、移动旧书布局：先测现有可读性；需新增布局时补设计决定，不从单张 desktop 稿推断全部断点。
- 全局 dark 与三语言文本长度、长说明阅读区：随页面切片验收，不仅检查设置页。
- 原型固定推荐池/容量满、浏览器完整旅程与参与者试验：继续保留待办；参与者研究验证价值，不能由自动测试替代。
- 多上下文写锁与受支持 WebView 版本：在 S1 验证能力，失败时记录支持边界和安全降级。

本文作为当前技术基线持续更新。需求变动先改 PRD/交互验收，再同步受影响设计、技术契约、代码与测试；仅修正实现细节可直接更新本文。更换 UI 框架、存储版本、来源/数据目录、时间口径等写独立 ADR，保留原因与迁移/回退办法。每次代码 PR 同时提交相关文档，Git 历史保留旧版本，发布时以 tag 对齐 PRD、设计节点清单与技术版本。

文档修订：TD 1.0（2026-11-05）建立选型后的实现契约。后续增加日期、变更原因、影响模块、对应提交及验证结果，不为每个小改动另建一份互相冲突的“最终版”。
