# 来源与采集日志

日期：2026-10-23，Asia/Shanghai。范围：公开网络资料；未登录私人账户，未发送消息。

## 主要检索式（实际使用的查询族）

- `"pomop" app review`、`"pomop" reddit`、`"pomop" app store google play`
- `"pomop" site:play.google.com/store/apps`、`"pomop" site:apps.apple.com`
- `"pomop.app" -site:pomop.app`、`"pomop.app" review OR reviews OR reddit OR producthunt`
- `"pomop.app" site:producthunt.com OR site:alternativeto.net OR site:youtube.com OR site:trustpilot.com`
- `"pomop.app" site:news.ycombinator.com OR site:indiehackers.com OR site:medium.com OR site:saashub.com`
- `"Pomop" app avaliações opiniones`、`"pomop.app" 评测 OR 评价 OR 评论`
- `site:reddit.com "free time" "hobbies" "scrolling" "minutes"`
- `site:reddit.com "tasks" "decision paralysis" app`
- `site:apps.apple.com "Llama Life" reviews`、`site:play.google.com "goblin.tools" reviews`
- `Llama Life review task time blindness downsides`

非命中结果只说明本次检索未取得可确认记录。不能证明全网不存在。搜索词还命中药品组合 PomOp、用户名、PomoPals/Pomopod 等，均排除。

## 下载清单及来源

| 文件 | 请求 URL | 结果与用途 |
|---|---|---|
| raw/home.html | https://pomop.app/ | 有效首页；当日已披露 AdSense |
| raw/app.html | https://pomop.app/app/ | 有效应用 HTML；表单/导航/引用脚本 |
| raw/methodology.html | https://pomop.app/methodology/ | 有效方法页；标注 2026-10-22 更新 |
| raw/task-prioritizer.html | https://pomop.app/task-prioritizer/ | 有效排序说明；和方法页有估时文案差异 |
| raw/productivity-planner.html | https://pomop.app/productivity-planner/ | 产品边界与免费声明 |
| raw/privacy.html | https://pomop.app/privacy-policy/ | 隐私政策；标注 2026-10-13 更新 |
| raw/sitemap.xml | https://pomop.app/sitemap-index.xml | 仅 sitemap 索引，不是全站爬取 |
| raw/dashboard.js | https://pomop.app/_astro/index.astro_astro_type_script_index_0_lang.BTUCsylu.js | 应用页引用 |
| raw/home-app.js | https://pomop.app/_astro/home-app.DVUc1M3t.js | 推荐选择/时间预设/文案 |
| raw/task-manager.js | https://pomop.app/_astro/task-manager.DtK5xnSE.js | 有限待办、剩余时间、完成状态 |
| raw/task-view.js | https://pomop.app/_astro/task-view.9O5Tukby.js | 45/26/15/10/4 权重 |
| raw/utils.js | https://pomop.app/_astro/utils.sLNDzJCL.js | 紧迫性、时间匹配、等待因子 |
| raw/apple-search-us.json | https://itunes.apple.com/search?term=pomop&entity=software&country=us&limit=200 | 36 个模糊命中；无确认属于 Pomop 的应用 |
| raw/apple-search-cn.json | https://itunes.apple.com/search?term=pomop&entity=software&country=cn&limit=200 | 1 个 PomoPals；不是 Pomop |
| Google Play search（未成功保存正文） | https://play.google.com/store/search?q=pomop&c=apps&hl=en&gl=US | 直接连接超时，网页工具不可访问；用索引检索补充但并非完整覆盖 |
| raw/llama-apple-reviews.html | https://apps.apple.com/us/app/adhd-organizer-llama-life/id6454469750?see-all=reviews | 命令行返回中国区商店首页；无效评论证据，不使用 |
| raw/adjacent-web-results.json | 下述 4 个来源经网页工具打开 | 保存工具返回的公开摘录/索引结果，不是全站原始 HTML 或评论全集 |

`*.txt` 和 `*.links.json` 是本地提取结果。原始下载中出现的脚本只是保存供静态阅读，未在用户浏览器执行。

## 相邻来源登记

| ID | 来源 | 类型、选样与限制 |
|---|---|---|
| A1 | https://apps.apple.com/us/app/adhd-organizer-llama-life/id6454469750?see-all=reviews | 商店可见评论；选 3 条，重复渲染去重；117 是评分数 |
| A2 | https://play.google.com/store/apps/details?id=com.goblintools | 商店可见 3 条英文评论；同时读开发者回应与版本更新 |
| R1 | https://www.reddit.com/r/nosurf/comments/1rzylo9/i_have_many_hobbies_or_activities_i_want_to_do/ | 原始需求帖与评论；不是 Pomop 用户评价 |
| R2 | https://www.reddit.com/r/Hobbies/comments/1vhefko/i_have_a_little_over_10_hobbies_and_end_up_doing/ | 2026-08-06；需求、材料准备和抽签替代 |
| R3 | https://www.reddit.com/r/ADHD/comments/1qeodbo/app_for_task_paralysis/ | 2026-01-16；明确要求隐藏列表并选一件 |
| R4 | https://www.reddit.com/r/getdisciplined/comments/1v1sfh4/i_cant_stop_wasting_my_free_time_away_and_i_feel/ | 2026-07-20；有时间也不开始的反证 |
| R5 | https://www.reddit.com/r/ProductivityApps/comments/1pxi0wn/time_blindness_app_issue_with_llama_life/ | 单一学生价格反馈；不能估算支付意愿分布 |
| T1 | https://www.g2.com/products/llama-life/reviews | 仅 2 条；历史版本、激励来源、AI 摘要需区分 |
| T2 | https://www.tryfoco.com/llama-life-review/ | 2026-10-19；竞品作者披露未亲测；不是中立实测 |

`adjacent-web-results.json` 覆盖 A1、A2、R2、T2 的二次打开结果，其余通过报告中的原始 URL 复核；没有声称保存全部搜索响应。

## 数据质量规则

1. 官方声明、静态代码观察、用户报告、研究者推断分别陈述。
2. 评论里的旧版本缺陷不能自动算作当前缺陷。
3. 无评论可采不能伪装成零差评或零用户。
4. API 模糊返回的 36/1 是搜索结果数，不是 Pomop 下载/评价数。
5. 缓存权重与广告文案已过时，以当日原站快照和代码为准。
6. 本报告无评论频率、情绪占比、市场规模或收入估算。
7. 假设示例和建议实验阈值不是行业事实。
