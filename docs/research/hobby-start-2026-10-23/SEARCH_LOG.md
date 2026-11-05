# 检索与采集方法

日期：2026-10-23。先定义完整情境，再检索直接自述，随后查找实际工具使用、第三方内容及反证。

## 查询族

- Reddit：`"too many hobbies" "free time" "choose"`；`"hobbies" "free time" "decision paralysis"`；`"hobby paralysis"`。
- 商店：`site:apps.apple.com hobbies decide reviews`；`Tiny Decisions app reviews indecisive what to do`；`Spin The Wheel random picker Google Play reviews decisions`；品牌与 hobbies / read / scrolling 组合。
- 中文：`兴趣 太多 空闲 不知道 做什么 豆瓣 知乎`；`"爱好太多" "不知道"`；`"爱好" "太多" "不知道" site:douban.com/group/topic`。高相关、可读取的直接样本不足，未据此判断中国频率。
- 第三方：`Tiny Decisions app review`；AppAdvice/MacStories/iMore/Lifehacker 站点限制；`hobby paralysis -site:reddit.com`。
- 研究：`leisure choice overload free time survey hobbies paralysis study`；`choice overload meta analysis 2010 50 experiments 5036 zero effect`；`leisure guilt study 2021 1310`；`leisure paralysis survey`。

具体结果按调用批次保存在 raw/hobby*.json。第一个发现查询后来以 Reddit 核心查询重跑保存，不声称每一次无关检索均完整存档。

## 纳入与排除

- 纳入：本人或回复者描述已有想做活动、选择/启动障碍；或说明自己使用工具应对。
- 单独标注：通用待办、社交选择、创意阻滞、单纯缺时间、广告/UI 摩擦。
- 排除核心计数：开发者自荐、纯官方营销、机器人、抽奖游戏用途、不同网站重复转载的同一评论、同一 Reddit 帖子的重复 URL。
- R16 明确提及曾在 AskReddit 发过相似内容；仅保留当前 Hobbies 串。
- 采用产品/平台/作者/显示日期去重评论；不按 App Store 同一评论的列表与展开文本重复计数。
- 这不是预注册系统综述，也没有可证明穷尽的所有帖子分母，因此不提供检索命中率、总体情绪比例或统计发生率。

## 第三方来源分层

|来源|处理|
|---|---|
|Creative Bloq 创作爱好启动文章|经验性编辑内容；用于理解障碍，不作发生率调查|
|Anarky Creations 的 Hobby Paralysis|商业创作者博客；用于说明同词不同义|
|AppsHunter / Chrome-Stats|商店评论聚合；不重复计入独立样本|
|Marlvel|AI 分析聚合；不采用其情绪比例估算人群|
|Neurodivergent Hobby Club|付费产品存在性；不证明销量或效果|
|Ipsos 2024 休闲导读|背景信息；题项不同，不等于目标情境比例|
|2010/2015 选择过载元分析|机制与边界，不是爱好启动的流行率|
|2022 六国调查|跨文化反证；具体领域不含爱好|
|2021 休闲浪费观念研究|产品压力设计的提醒，不作医疗推断|

## 采集限制

- 公开网页和搜索索引混合使用；若只有索引文本，登记为索引，不称全文。
- Reddit 多个短链接返回 Cache miss；尝试完整标题 URL 后部分可读，保留失败快照。
- App Store iPad 参数页可由搜索返回评论，但直接打开失败。评论显示月日不含年时不补造年份。
- Google Play 搜索索引和页面当前展示的评论不同；按各自来源保留，不伪造统一时间窗。
- 美区两个 RSS 请求均有 feed 无 entry，因此不能形成最新评论样本。
- Ipsos PDF 约 14 MB，网页工具因大小无法打开；仅使用可读网页导读和索引，没有读取全部图表。
- 不比较不同年份、国家、设备分栏和缓存版本下的评分涨跌。

## 可复核性

结构化数据为 evidence-records.json；不保存非公开资料。原始快照仅供审阅来源，正文以简短转述为主。SHA256SUMS.txt 记录已保存资料的校验值，便于辨别后续改动。
