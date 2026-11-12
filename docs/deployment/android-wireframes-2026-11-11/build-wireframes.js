// Design-only proposal. Run through Figma use_figma; never loaded by the app.
const page = await figma.getNodeByIdAsync('49:243');
await figma.setCurrentPageAsync(page);
if (page.children.some(n => n.name === 'DRAFT / Android layout review / 2026-11-11')) throw new Error('Draft already exists; inspect before retrying.');
await Promise.all([
  figma.loadFontAsync({family:'Noto Sans SC',style:'Regular'}),
  figma.loadFontAsync({family:'Noto Sans SC',style:'Medium'}),
  figma.loadFontAsync({family:'Noto Serif SC',style:'Medium'}),
  figma.loadFontAsync({family:'EB Garamond',style:'Regular'})
]);
const created = [];
const track = n => { created.push(n.id); return n; };
const palette = {ink:.15, muted:.42, border:.73, paper:1, field:.95, selected:.85, canvas:.91};
const collection = figma.variables.createVariableCollection('DRAFT Android wireframe / grayscale only');
const tokens = {};
for (const [name,value] of Object.entries(palette)) {
  const v=figma.variables.createVariable(name,collection,'COLOR');
  v.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];
  v.setValueForMode(collection.modes[0].modeId,{r:value,g:value,b:value,a:1});tokens[name]=v;
}
function paint(key){ const g=palette[key];return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:g,g,b:g}},'color',tokens[key]); }
function fill(n,key){n.fills=[paint(key)];}
function frame(parent,name,w,h,dir='VERTICAL') {
  const n=track(figma.createAutoLayout(dir));parent.appendChild(n);n.name=name;n.resize(w,h);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';n.fills=[];n.clipsContent=false;return n;
}
function text(parent,value,size=14,key='ink',width) {
  const n=track(figma.createText());parent.appendChild(n);n.name=value;n.fontName={family:'Noto Sans SC',style:'Regular'};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.round(size*1.5)};fill(n,key);n.characters=value;
  if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;
}
const sourceIds={pill:'342:4343',grip:'434:6301',pin:'406:6098',play:'104:1791',close:'391:5701'};
const source={};for(const [k,id] of Object.entries(sourceIds))source[k]=await figma.getNodeByIdAsync(id);
for(const m of Object.values(source)) for(const t of m.findAllWithCriteria({types:['TEXT']})) for(const s of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName);
const maxX=Math.max(0,...page.children.map(n=>n.x+n.width));
const board=frame(page,'DRAFT / Android layout review / 2026-11-11',1740,100);
board.x=maxX+200;board.y=0;board.paddingTop=32;board.paddingBottom=32;board.paddingLeft=32;board.paddingRight=32;board.itemSpacing=28;board.primaryAxisSizingMode='AUTO';fill(board,'canvas');
text(board,'安卓布局线框 · 待确认',30);
text(board,'OPPO Reno 10 Pro 5G 反馈 / 只评审布局与交互；尚未修改视觉稿、安卓代码或 APK',16,'muted');
text(board,'参考画布 360×800 与 320×640；系统栏、键盘高度仅为示意，实装按实际可用空间适配。',14,'muted');
const library=frame(board,'Draft controls / reused source instances',1600,100,'HORIZONTAL');library.itemSpacing=24;library.counterAxisAlignItems='CENTER';
function recolor(n) {
  for(const c of [n,...n.findAll(()=>true)]){
    if(c.type==='TEXT')fill(c,'ink');
    if(c.type==='VECTOR'&&Array.isArray(c.fills)&&c.fills.length)fill(c,'ink');
    if('strokes'in c&&Array.isArray(c.strokes)&&c.strokes.length)c.strokes=[paint('border')];
  }
}
function sourceInstance(parent,key,w,h) {
  const n=track(source[key].createInstance());parent.appendChild(n);recolor(n);if(w&&h)n.resize(w,h);return n;
}
function pill(parent,label,w=112,disabled=false){
  const n=sourceInstance(parent,'pill',w,44);n.name=label;fill(n,'field');n.strokes=[paint('border')];n.effects=[];n.cornerRadius=22;
  const t=n.findAllWithCriteria({types:['TEXT']})[0];t.characters=label;t.fontSize=14;t.textAutoResize='WIDTH_AND_HEIGHT';
  if(disabled)n.opacity=.42;return n;
}
const row=track(figma.createComponent());library.appendChild(row);row.name='DRAFT / task slip / touch targets';row.layoutMode='HORIZONTAL';row.resize(312,72);row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';row.counterAxisAlignItems='CENTER';row.itemSpacing=4;row.paddingLeft=4;row.paddingRight=4;row.cornerRadius=8;fill(row,'field');row.strokes=[paint('border')];
sourceInstance(row,'grip',28,44);
const title=text(row,'读书',16);title.name='Activity name';title.textAutoResize='HEIGHT';title.resize(140,48);title.layoutSizingHorizontal='FILL';
const titleProp=row.addComponentProperty('Activity','TEXT','读书');title.componentPropertyReferences={characters:titleProp};
const pin=sourceInstance(row,'pin',44,44);pin.name='Pin / existing action';pin.opacity=.55;
sourceInstance(row,'play',44,44);
pill(library,'上一页');pill(library,'下一页');text(library,'既有胶囊按钮、拖拽、置顶、开始组件\n灰阶仅用于评审，不代表最终配色。',14,'muted',340);
const screens={};const refs={};
function group(name){const g=frame(board,name,1676,100,'HORIZONTAL');g.itemSpacing=36;g.counterAxisAlignItems='MIN';g.primaryAxisSizingMode='AUTO';g.counterAxisSizingMode='AUTO';return g;}
function screen(parent,key,label,w=360,h=800,active='任务'){
 const wrap=frame(parent,label,w,100);wrap.itemSpacing=12;wrap.primaryAxisSizingMode='AUTO';text(wrap,label,17,'ink',w);
 const s=frame(wrap,key,w,h);s.clipsContent=true;fill(s,'paper');s.strokes=[paint('border')];screens[key]=s;
 const status=frame(s,'System status inset',w,24,'HORIZONTAL');status.paddingLeft=16;status.counterAxisAlignItems='CENTER';text(status,'9:41',11,'muted');
 const brand=frame(s,'Brand',w,40,'HORIZONTAL');brand.paddingLeft=16;brand.counterAxisAlignItems='CENTER';text(brand,'NowWhat',20);
 const nav=frame(s,'Navigation',w,48,'HORIZONTAL');nav.paddingLeft=12;nav.paddingRight=12;nav.itemSpacing=4;
 for(const name of ['现在做','任务','日历','设置']) {const tab=frame(nav,'Tab / '+name,(w-36)/4,44);tab.primaryAxisAlignItems='CENTER';tab.counterAxisAlignItems='CENTER';tab.cornerRadius=8;fill(tab,name===active?'selected':'field');text(tab,name,13);}
 const book=frame(s,'Single page / available viewport',w-24,h-136);book.paddingTop=16;book.paddingBottom=16;book.paddingLeft=12;book.paddingRight=12;book.itemSpacing=16;book.cornerRadius=12;book.strokes=[paint('border')];s.counterAxisAlignItems='CENTER';
 const safe=frame(s,'Bottom safe area',w,24);text(safe,'',1);
 return {s,book,wrap,w:w-48};
}
function footer(book,w,prev=false,next=false,key=''){
 const f=frame(book,'Bottom pager / stable position',w,44,'HORIZONTAL');f.primaryAxisAlignItems='SPACE_BETWEEN';f.counterAxisAlignItems='CENTER';const a=pill(f,'上一页',112,!prev);const b=pill(f,'下一页',112,!next);refs[key+'Prev']=a;refs[key+'Next']=b;return f;
}
function note(wrap,value,w){text(wrap,value,13,'muted',w);}
function task(parent,key,label,names,{w=360,h=800,total=names.length,prev=false,next=false}={}) {
 const o=screen(parent,key,label,w,h);const heading=frame(o.book,'Task heading',o.w,60);heading.itemSpacing=4;
 const hrow=frame(heading,'Title and add',o.w,36,'HORIZONTAL');hrow.primaryAxisAlignItems='SPACE_BETWEEN';hrow.counterAxisAlignItems='CENTER';text(hrow,'任务',24);refs[key+'Add']=pill(hrow,'添加',80);text(heading,`共 ${total} 项`,13,'muted');
 const list=frame(o.book,'Task list / top aligned / true pagination',o.w,100);list.layoutSizingVertical='FILL';list.primaryAxisAlignItems='MIN';list.itemSpacing=12;
 for(const name of names){const i=track(row.createInstance());list.appendChild(i);i.setProperties({[titleProp]:name});i.resize(o.w,names.length>3?64:72);}
 footer(o.book,o.w,prev,next,key);return o;
}
const g1=group('01 / Tasks / sparse, full and compact');
const t1=task(g1,'tasksSparse','01 任务少时 · 顶部排列',['读书','学习日语','整理书桌']);note(t1.wrap,'任务无论多少，都从内容区顶部依次排列；名称、置顶与开始在行内对齐。保持真分页，翻页区固定在底部。',360);
const t2=task(g1,'tasksFull','02 任务较多 · 真分页',['读书','学习日语','整理书桌','散步','画画','练习吉他'],{total:9,next:true});note(t2.wrap,'按可用高度分配本页容量；示例一页 6 项。保留拖拽排序、置顶、开始；不整页无限下滑。',360);
const t3=task(g1,'tasksNext','03 后一页 · 保持相同位置',['学习摄影','练字','运动'],{total:9,prev:true});note(t3.wrap,'后一页也从顶部排列，剩余空白留在列表下方。切换和关闭弹窗后保留当前页及任务位置。',360);
const t4=task(g1,'tasksCompact','04 小屏 · 320×640',['读书','学习日语','整理书桌','散步'],{w:320,h:640,total:9,next:true});note(t4.wrap,'小屏示例一页 4 项。行高保持可点按，优先减少本页项数，而不是压缩文字和按钮。',320);
const g2=group('02 / Calendar / directory then detail');
function calendar(parent,key,label,w=360,h=800,mode='directory'){
 const o=screen(parent,key,label,w,h,'日历');
 const heading=frame(o.book,'Today or selected activity',o.w,mode==='detail'?96:68);heading.itemSpacing=4;
 if(mode==='detail'){refs[key+'Back']=pill(heading,'返回',108);text(heading,'读书',24);text(heading,'今天 · 4 次 · 38 分钟',13,'muted');}
 else {text(heading,'今天 · 11月11日',24);text(heading,mode==='empty'?'还没有记录':'共 6 次 · 58 分钟',13,'muted');}
 const body=frame(o.book,'Main calendar content',o.w,100);body.layoutSizingVertical='FILL';body.itemSpacing=12;body.primaryAxisAlignItems='MIN';
 if(mode==='directory'){
  for(const name of ['读书','学习日语','散步']){const r=frame(body,'Activity / '+name,o.w,72,'HORIZONTAL');fill(r,'field');r.cornerRadius=8;r.strokes=[paint('border')];r.paddingLeft=16;r.paddingRight=16;r.primaryAxisAlignItems='SPACE_BETWEEN';r.counterAxisAlignItems='CENTER';text(r,name,17);text(r,'›',24,'muted');if(name==='读书')refs.calendarRead=r;}
 } else if(mode==='detail'){
  body.itemSpacing=8;
  ['10:30–10:45','11:20–11:30','14:10–14:18','16:00–16:05'].forEach((range,i)=>{
   const r=frame(body,'Session '+(i+1),o.w,h<700?64:84);r.paddingLeft=12;r.paddingRight=12;r.paddingTop=8;r.paddingBottom=8;r.itemSpacing=4;fill(r,'field');r.cornerRadius=8;r.strokes=[paint('border')];
   const top=frame(r,'Time and duration',o.w-24,26,'HORIZONTAL');top.primaryAxisAlignItems='SPACE_BETWEEN';text(top,range,15);text(top,[15,10,8,5][i]+' 分钟',14);
   if(i===0)text(r,'计划 15 分 · 暂停 0 秒 · 追加 0 秒',11,'muted',o.w-24);
  });
 } else {text(body,'今天还没开始。',18,'muted',o.w);}
 if(mode==='empty'){const c=frame(o.book,'Empty action above pager',o.w,44);c.counterAxisAlignItems='CENTER';refs.emptyStart=pill(c,'去开始',144);}
 footer(o.book,o.w,false,mode==='detail',key);return o;
}
const c1=calendar(g2,'calendarDirectory','05 日历 · 今天的活动');note(c1.wrap,'先看今天的汇总与活动目录，活动从顶部依次排列。点击活动进入单独的记录明细页。',360);
const c2=calendar(g2,'calendarDetail','06 活动明细 · 全页查看',360,800,'detail');note(c2.wrap,'记录从顶部依次排列，不足一页也不居中。预留行内详情空间；点击“返回”回到原目录位置。',360);
const c3=calendar(g2,'calendarEmpty','07 日历空状态',360,800,'empty');note(c3.wrap,'空状态说明置于内容区顶部；“去开始”仍在底部翻页区上方水平居中，不叠加空的记录明细。',360);
const c4=calendar(g2,'calendarCompact','08 明细小屏 · 320×640',320,640,'detail');note(c4.wrap,'小屏记录同样从顶部排列。保留行内详情空间与底部翻页；空间不足时减少本页容量。',320);
const g3=group('03 / Add activity / keyboard and close');
function editor(parent,key,label,w,h,keyboard){
 const wrap=frame(parent,label,w,100);wrap.itemSpacing=12;wrap.primaryAxisSizingMode='AUTO';text(wrap,label,17,'ink',w);
 const s=frame(wrap,key,w,h);screens[key]=s;fill(s,'selected');s.clipsContent=true;s.paddingTop=24;s.paddingLeft=12;s.paddingRight=12;s.paddingBottom=0;s.itemSpacing=12;s.counterAxisAlignItems='CENTER';
 const panel=frame(s,'Editor / stable top anchor',w-24,h-keyboard-48);panel.paddingTop=12;panel.paddingBottom=12;panel.paddingLeft=12;panel.paddingRight=12;panel.itemSpacing=12;fill(panel,'paper');panel.cornerRadius=12;
 const head=frame(panel,'Title and full close target',w-48,44,'HORIZONTAL');head.primaryAxisAlignItems='SPACE_BETWEEN';head.counterAxisAlignItems='CENTER';text(head,'添加活动',22);refs[key+'Close']=sourceInstance(head,'close',44,44);
 const content=frame(panel,'Scrollable form only',w-48,100);content.layoutSizingVertical='FILL';content.clipsContent=true;content.itemSpacing=10;
 text(content,'活动名称',13,'muted');const name=frame(content,'Name slip',w-48,48,'HORIZONTAL');fill(name,'field');name.cornerRadius=8;name.paddingLeft=12;name.counterAxisAlignItems='CENTER';text(name,'读书│',16);
 text(content,'需要的条件（可选）',13,'muted');const conditions=frame(content,'Conditions',w-48,44,'HORIZONTAL');conditions.itemSpacing=8;for(const s of ['电脑','音频','出声','中断']){const b=frame(conditions,s,58,44);fill(b,'field');b.cornerRadius=8;b.primaryAxisAlignItems='CENTER';b.counterAxisAlignItems='CENTER';text(b,s,13);}
 const descTitle=text(content,'活动说明',14,'ink',w-48);descTitle.textAlignHorizontal='CENTER';const desc=frame(content,'Description / expanded by default',w-48,72);fill(desc,'field');desc.paddingTop=10;desc.paddingLeft=12;desc.cornerRadius=8;text(desc,'下次从哪里继续？',14,'muted');
 const controls=frame(panel,'Fixed actions above keyboard',w-48,44,'HORIZONTAL');controls.itemSpacing=12;pill(controls,'添加',(w-60)/2);refs[key+'Cancel']=pill(controls,'取消',(w-60)/2);
 if(keyboard){const kb=frame(s,'System keyboard / schematic only',w,keyboard);fill(kb,'canvas');kb.primaryAxisAlignItems='CENTER';kb.counterAxisAlignItems='CENTER';text(kb,'输入法区域',20,'muted');text(kb,'系统控制 · 高度以手机实测为准',12,'muted');}
 else {const inset=frame(s,'Bottom safe area',w,24);}
 return {s,wrap};
}
const e1=editor(g3,'editorNormal','09 添加活动 · 键盘未显示',360,800,0);note(e1.wrap,'标题、叉号、底部操作固定；活动说明默认展开。弹层内不重复显示应用名。',360);
const e2=editor(g3,'editorKeyboard','10 添加活动 · 输入法展开',360,800,280);note(e2.wrap,'仅表单中间区域可滚动；叉号和添加／取消保持完整可见，不被键盘或输入框遮挡。',360);
const notes=frame(g3,'Close behavior proposal',700,700);notes.paddingTop=40;notes.paddingLeft=24;notes.paddingRight=24;notes.itemSpacing=20;fill(notes,'paper');
text(notes,'11 关闭交互 · 本轮修订',24);
text(notes,'点击 × 或取消',20);text(notes,'立即取消输入焦点，同时请求收起键盘。\n弹层采用约 120 ms 的短淡出，不纵向压扁、不向下卷走。',16,'ink',640);
text(notes,'回到原任务页',20);text(notes,'键盘退场期间保持背景布局稳定；恢复可用高度后统一计算分页。\n不重置当前页，不移动已显示任务，不出现第二段慢滑动。',16,'ink',640);
text(notes,'验证边界',20);text(notes,'线框只表示交互目标，不模拟 ColorOS 输入法的真实动画。\n确认后再改视觉与代码，用 OPPO Reno 10 Pro 5G 实测：\n键盘开／关、连续添加关闭、少任务／多任务、横竖屏和返回键。',15,'muted',640);
text(notes,'本轮不修改 Android 代码，不生成新版 APK。',16);
const counts={};const imageNodes=[];for(const n of board.findAll(()=>true)){counts[n.type]=(counts[n.type]||0)+1;if('fills'in n&&Array.isArray(n.fills)&&n.fills.some(p=>p.type==='IMAGE'))imageNodes.push({id:n.id,name:n.name,width:n.width,height:n.height});}
figma.viewport.scrollAndZoomIntoView([board]);
return {boardId:board.id,createdNodeIds:created,collectionId:collection.id,variableIds:Object.values(tokens).map(v=>v.id),screens:Object.fromEntries(Object.entries(screens).map(([k,v])=>[k,{id:v.id,width:v.width,height:v.height}])),rows:[g1.id,g2.id,g3.id],counts,imageNodes};
