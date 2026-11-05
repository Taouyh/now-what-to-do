# 技术框架决策：B/C 旧书版

日期：2026-11-05。决策：本轮采用 **Vite + TypeScript + 原生 DOM/CSS 模块化前端**；沿用 Windows WebView2、Android WebView 和本地 JSON 存储。这里的“原生”指浏览器标准 DOM，不是另写一套原生界面。采用 vanilla-ts 方向，不引入 React/Vue 运行时。

状态：阶段 5 选型交付，供阶段 6 技术设计和阶段 7 实现使用；尚未安装新依赖或迁移源码。用户本轮明确要求推进选型与技术文档，原型尚未完成的验证继续保留，不视为设计全量验收。

## 1. 决策输入与证据

- 需求：[PRD](../../product/book-c-2026-11-04/PRD.md)、[交互契约](../../product/book-c-2026-11-04/INTERACTIONS.md)、[开发规则](../../rules/development.md)。任务和日历采用 C，其他页面采用 B。
- 设计：Figma 文件 `EUoXZR1hDJUUPVAtrDxpE5`，入口以 PRD 第 9 节为准；已读取仓库中的 B 首页、条件、专注、设置说明及 B/C 尺寸核对记录。1600×1000 是设计参照，不是产品固定窗口大小。
- 本次 Figma `create_session`、`get_screenshot` 均返回 Unknown tool，网页读取也失败；没有声称重新读取线上最新图层。实现每个页面前须复核相应节点和可用素材，差异回填技术文档。
- 现状：`app.js` 集中了推荐、计时、DOM 与存储；`i18n.js` 保留三语言；Windows/Android 打包脚本复制同一套网页资源。应用版本为 1.3.0。
- 数据：`whatToDoData` 为 version 2 主数据；`activeTimer` 为独立 timerVersion 2 会话。保留旧字段、未知字段、稳定 ID、历史与恢复能力比换 UI 库更重要。
- 基线：2026-11-05 在当前工作区执行 `npm test`，128/128 通过；这只证明已有 Node 测试通过，不证明新书版已实现或浏览器已验收。

## 2. 需求如何约束选型

| 约束 | 技术含义 |
| --- | --- |
| 无账号、推荐离线可用 | 本地计算，无服务端请求作为开始前置条件 |
| 旧书材质、双页、卷轴、短动效 | CSS Grid、变量、局部图片和 SVG 足够；控件保留真实 DOM |
| 恢复、快照、记录防重复 | 独立领域模块与可注入时钟，不能把规则埋进页面回调 |
| 任务 10 条一组、日历 5/4 分页 | 统一任务源，分页派生数据，不复制 Figma 固定槽位 |
| Windows、Android、网页现有能力 | 保留原平台壳、来源地址和数据目录，避免无必要的平台迁移 |
| 个人项目的维护成本 | 小依赖集合，先拆分现有代码；不要求一次重写 |
| 长名称、三语言、系统放大 | 实际文本布局验证，不能用整张截图或无限缩小画布 |

## 3. 比较与取舍

下表为结合本项目现状的工程判断，没有做候选框架的速度或内存对照实验。

| 方案 | 离线与平台 | 性能/体积判断 | 维护与迁移成本 | 结论 |
| --- | --- | --- | --- | --- |
| Vite + TS + DOM/CSS | 静态资源可进入现有三个运行环境 | 无 UI 库运行时；纹理、字体仍可能占主要资源 | 复用 DOM 安全渲染与领域逻辑；需明确渲染和事件清理边界 | **采用** |
| Vite + React + TS | 同样可离线、进入现有壳 | 有额外运行时；不据此宣称性能不够 | 组件与状态组织成熟，但需迁移现有 DOM、事件和测试 harness | 若出现多人协作或大量跨页复杂状态，再用 ADR 评估 |
| Vite + Vue + TS | 同样可离线、进入现有壳 | 有额外运行时；未测量体积差 | 模板与响应式可简化页面，但同样需要 UI 层重写 | 本轮收益不足以抵消迁移 |

React/Vue 都能实现本产品。选 DOM 的依据是四个主要入口、已有可用代码与数据保护需求，不能解释为“原生 DOM 在所有项目都更好”。若页面继续堆叠全局变量或跨页手工同步，应先审查模块边界，再决定是否换框架。

平台壳另行比较：本轮沿用已有 C++ WebView2 与 Java WebView；Electron 仅保留既有兼容路径，不提升为主发布方式；不迁移 Tauri/Capacitor。新增壳会引入打包、桥接、来源地址及用户数据迁移工作，当前 PRD 没有足够收益支撑它。

## 4. 选定的完整技术栈

| 层 | 决定 |
| --- | --- |
| UI | TypeScript、语义 HTML、原生 DOM、CSS Grid/Flex、CSS 自定义属性 |
| 构建 | Vite；开发使用 ESM，正式产物用 library mode 的单入口 IIFE，配套 HTML 和 CSS |
| 状态 | 小型显式 store + 领域命令；持久数据、会话、轮次、草稿、显示状态分离 |
| 数据 | localStorage JSON，保留主数据 version 2 和 timerVersion 2；运行时校验，不引入远程数据库 |
| 测试 | 保留 Node 内置 node:test；增量引入 Playwright Test 做真实浏览器验收 |
| 字体与素材 | 本地字体/纹理/SVG，确认授权后打包，不依赖运行时 CDN |
| Windows | 现有 C++ WebView2 + NSIS；保持 `https://nowwhat.local` 与现有用户目录 |
| Android | 现有 Java WebView；保持 `https://app.nowwhat.local` 与现有包名、签名身份 |
| 网页 | 静态产物，支持现有项目子路径；本地 HTTP 为主要开发入口 |

选择 IIFE 是为继续提供可直接打开的静态资源并减少原平台壳变更。localStorage 在 `file:` 下的行为并无跨浏览器保证，因此用户数据升级测试以原来源地址为准，直接打开文件只作兼容入口，不承诺与 HTTP/安装版共享数据。技术文档定义具体构建契约。

工具版本基线：Node 24.18.0 / npm 11.16.0（本机实读），Vite 8.3.5、TypeScript 7.0.2、Playwright Test 1.64.1（2026-11-05 从官方 npm registry 查询）。Vite 的 Node 要求为 `^20.19.0 || >=22.12.0`，其余两者分别为 `>=16.20.0`、`>=20`，当前 Node 满足声明要求。首次工程化提交使用精确版本并更新 `package-lock.json`，通过构建和回归后才形成已验证组合；本次仅核实版本元数据，没有安装或证明三者集成通过。此后用 `npm ci` 复现；保留现有 Electron 兼容依赖，不顺带升级。

本机默认 npm 镜像查询 Vite 曾超时，改用单次 `--registry=https://registry.npmjs.org` 后成功；没有修改全局 npm 配置。[Vite](https://registry.npmjs.org/vite/latest)、[TypeScript](https://registry.npmjs.org/typescript/latest)、[Playwright Test](https://registry.npmjs.org/@playwright%2ftest/latest) 的 latest 链接随时间变化，上述固定版本记录用于本轮选型。

## 5. 迁移顺序与风险

1. 保存现有用户改动的可审查基线；保留原 128 项测试，补齐可独立启动的浏览器测试入口。
2. 引入构建、类型检查和模块目录，先维持旧 UI 与存储协议，不同时改视觉、计时与存储格式。
3. 依次抽出校验/存储、推荐、计时、今日统计；新模块经验证后移除对应旧实现，避免两套长期并存。
4. 接入统一书本框架和 B 首页，再做 C 任务、B 专注、C 日历、B 设置。每一片都有 PRD 验收和回归结果。
5. 独立 GPT 窗口检查固定提交及实际产物；修复后复测；通过后合并 master，发布属于阶段 8。

| 风险 | 控制与边界 |
| --- | --- |
| 新构建只复制脚本，漏字体/纹理 | Windows、Android、网页使用同一完整资源目录；离线验证无外部请求 |
| 换来源导致“数据消失” | 保持来源和 profile；不同来源通过显式备份迁移，不自动读个人浏览器资料 |
| localStorage 无跨键事务且容量有限 | 完成记录幂等提交；存储失败保留会话；大量记录性能和配额实测后再决定 IndexedDB |
| 手工 DOM 随规模失控 | 页面 mount/unmount 与事件清理；领域函数无 DOM；控件模块化 |
| Android 旧 WebView 与 API 缺失 | Android 7.0 不是 WebView 版本保证；构建 target 与实际 API 特性均须验证，不能只靠语法转译 |
| 小窗口与中文/日文/英文排版未定 | 先完成目标桌面实窗验证；手机维持已有可用布局，新的移动旧书稿尚待设计，不宣称已获批准 |
| 原型有槽位上限和样例推荐池 | 应用实现动态数组与 ID，不复制样例容量限制 |

本轮没有新增云服务运行费用；下载工具、存储静态资源、CI 和后续代码签名仍有实际维护成本。没有安装包体积、启动速度或帧率的新测量值。

## 6. 官方资料

以下资料于 2026-11-05 核对，用于支持能力与限制；最终取舍是项目工程判断。

- [Vite 构建与路径](https://vite.dev/guide/build)：静态构建与相对资源路径。
- [Vite build.lib](https://vite.dev/config/build-options.html#build-lib)：支持 IIFE，非 HTML 入口需配套处理 HTML。
- [TypeScript 与 JavaScript 渐进检查](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)：迁移可从已有 JS 开始。
- [React 状态结构](https://react.dev/learn/choosing-the-state-structure)、[Vue 简介](https://vuejs.org/guide/introduction.html)：候选 UI 方案。
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)：按 origin 隔离、访问异常及 file URL 限制。
- [Node 测试运行器](https://nodejs.org/api/test.html)、[Playwright webServer](https://playwright.dev/docs/test-webserver)：分层测试与服务启动。

下一份交付：[技术设计](../../technical/book-c-2026-11-05/TECHNICAL.md)。
