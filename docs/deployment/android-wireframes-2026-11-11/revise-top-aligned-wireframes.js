await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));
const board=await figma.getNodeByIdAsync('497:9796');const fonts=new Map();
for(const t of board.findAllWithCriteria({types:['TEXT']}))for(const seg of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(seg.fontName),seg.fontName);
for(const font of fonts.values())await figma.loadFontAsync(font);
const changed=[],before=[],lists=[];
const listIds=['497:9846','497:9920','497:10036','497:10110','497:10196','497:10236','497:10282','497:10317'];
for(const id of listIds){const n=await figma.getNodeByIdAsync(id);const pager=n.parent.children.find(c=>c.name==='Bottom pager / stable position');before.push({id,align:n.primaryAxisAlignItems,childY:n.children.map(c=>c.y),pagerY:pager.y});n.primaryAxisAlignItems='MIN';if(n.name.startsWith('Task list'))n.name='Task list / top aligned / true pagination';changed.push(id);if(n.children[0].y!==0)throw new Error('First row is not top aligned');if(pager.y!==before[before.length-1].pagerY)throw new Error('Pager moved');lists.push({id,align:n.primaryAxisAlignItems,y:n.y,height:n.height,rows:n.children.map(c=>({id:c.id,y:c.y,height:c.height})),pagerY:pager.y});}
const copy={
'497:9822':'01 任务少时 · 顶部排列',
'497:9894':'任务无论多少，都从内容区顶部依次排列；名称、置顶与开始在行内对齐。保持真分页，翻页区固定在底部。',
'497:10084':'后一页也从顶部排列，剩余空白留在列表下方。切换和关闭弹窗后保留当前页及任务位置。',
'497:10211':'先看今天的汇总与活动目录，活动从顶部依次排列。点击活动进入单独的记录明细页。',
'497:10259':'记录从顶部依次排列，不足一页也不居中。预留行内详情空间；点击“返回”回到原目录位置。',
'497:10292':'空状态说明置于内容区顶部；“去开始”仍在底部翻页区上方水平居中，不叠加空的记录明细。',
'497:10340':'小屏记录同样从顶部排列。保留行内详情空间与底部翻页；空间不足时减少本页容量。',
'497:10409':'11 关闭交互 · 本轮修订',
'497:10411':'点击后立即取消输入焦点，并同时请求收起键盘。\n面板在 0—120 ms 内短淡出，不等待键盘退场；\n不纵向压扁、不向下卷走。减少动态效果时立即关闭。',
'497:10413':'键盘退场期间保持背景任务与底部翻页区稳定。\n可用高度稳定后统一计算分页，保留当前页／任务锚点；\n不随每次高度变化重启动画，不再追加一段慢滑动。',
'497:10415':'本轮只修改线框，待你核对后再进入视觉稿设计。\n键盘为系统占位示意，不代表 ColorOS 的实际动画。\n后续实现仍需实机检查键盘开／关、连续关闭、分页与返回键。',
'497:9799':'11月12日修订：任务／日历顶部排列、真分页；返回文案精简；添加活动短淡出。参考画布非实测设备尺寸。'
};
for(const [id,value]of Object.entries(copy)){const t=await figma.getNodeByIdAsync(id);t.characters=value;changed.push(id);}
const wrap=await figma.getNodeByIdAsync('497:9821');wrap.name='01 任务少时 · 顶部排列';changed.push(wrap.id);
for(const id of ['497:10232','497:10313']){const n=await figma.getNodeByIdAsync(id);n.setProperties({'Label#342:1':'返回'});n.name='返回';changed.push(id);}
const counts={},badFonts=[],imageNodes=[];for(const n of board.findAll(()=>true)){counts[n.type]=(counts[n.type]||0)+1;if('fills'in n&&Array.isArray(n.fills)&&n.fills.some(p=>p.type==='IMAGE'))imageNodes.push(n.id);if(n.type==='TEXT')for(const s of n.getStyledTextSegments(['fontName']))if(!['Noto Sans SC','Noto Serif SC','EB Garamond'].includes(s.fontName.family))badFonts.push(n.id);}
return{createdNodeIds:[],mutatedNodeIds:changed,before,lists,counts,imageNodes,badFonts,oldReturnLabels:board.findAllWithCriteria({types:['TEXT']}).filter(n=>n.characters==='返回今天').map(n=>n.id),scope:'Only existing Android draft board; home layouts, visual designs, application code and APK untouched. User review required before visual design.'};
