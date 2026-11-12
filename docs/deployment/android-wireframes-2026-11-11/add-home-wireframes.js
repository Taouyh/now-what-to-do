// Design-only extension approved for this chat on 2026-11-12; no application edits.
const page=await figma.getNodeByIdAsync('49:243');await figma.setCurrentPageAsync(page);
const board=await figma.getNodeByIdAsync('497:9796');
if(board.children.some(n=>n.name==='00 / Now / balanced mobile home · 2026-11-12'))throw new Error('Home draft exists; inspect before retrying.');
const template=await figma.getNodeByIdAsync('497:9823');
const startSource=await figma.getNodeByIdAsync('49:512');
const changeSource=await figma.getNodeByIdAsync('49:584');
const pillSource=await figma.getNodeByIdAsync('342:4343');
const fonts=new Map();
for(const n of [template,startSource,changeSource,pillSource])for(const t of n.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
const vars={};for(const [key,id]of Object.entries({ink:'497:9789',muted:'497:9790',border:'497:9791',paper:'497:9792',field:'497:9793',selected:'497:9794'}))vars[key]=await figma.variables.getVariableByIdAsync('VariableID:'+id);
const created=[];const track=n=>{created.push(n.id);return n;};
function paint(key){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',vars[key]);}
function fill(n,key){n.fills=[paint(key)];}
function frame(parent,name,w,h,dir='VERTICAL'){const n=track(figma.createAutoLayout(dir));parent.appendChild(n);n.name=name;n.resize(w,h);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';n.fills=[];return n;}
function text(parent,value,size=14,width,key='ink'){const n=track(figma.createText());parent.appendChild(n);n.name=value;n.fontName={family:'Noto Sans SC',style:'Regular'};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.round(size*1.5)};fill(n,key);n.characters=value;if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;}
function pill(parent,label,w){const n=track(pillSource.createInstance());parent.appendChild(n);n.resize(w,44);n.name=label;fill(n,'field');n.strokes=[paint('border')];n.effects=[];const t=n.findAllWithCriteria({types:['TEXT']})[0];t.characters=label;t.fontSize=14;fill(t,'ink');return n;}
function gray(n,key){fill(n,key);n.effects=[];for(const c of n.findAll(()=>true)){if(c.type==='TEXT')fill(c,'ink');if(c.type==='VECTOR'){if(Array.isArray(c.fills)&&c.fills.length)fill(c,'ink');if(Array.isArray(c.strokes)&&c.strokes.length)c.strokes=[paint('ink')];}}}
const section=frame(board,'00 / Now / balanced mobile home · 2026-11-12',1676,100);board.insertChild(4,section);section.primaryAxisSizingMode='AUTO';section.itemSpacing=20;
text(section,'现在做 · 将主要操作放到页面中部',26);
text(section,'新增安卓线框 · 2026-11-12 · 待确认，尚未修改视觉稿和代码',14,undefined,'muted');
const row=frame(section,'Home review states',1676,100,'HORIZONTAL');row.primaryAxisSizingMode='AUTO';row.counterAxisSizingMode='AUTO';row.itemSpacing=28;
const masters=frame(section,'Home action group / local reusable component',1676,100,'HORIZONTAL');masters.counterAxisSizingMode='AUTO';masters.itemSpacing=32;
const core=track(figma.createComponent());masters.appendChild(core);core.name='DRAFT / Now / task and actions';core.layoutMode='VERTICAL';core.resize(312,212);core.primaryAxisSizingMode='AUTO';core.counterAxisSizingMode='FIXED';core.counterAxisAlignItems='CENTER';core.itemSpacing=20;core.fills=[];
const title=text(core,'读书',28,312);title.name='Task name';title.fontName={family:'Noto Serif SC',style:'Medium'};title.lineHeight={unit:'PIXELS',value:38};title.textAlignHorizontal='CENTER';title.textAlignVertical='CENTER';title.textAutoResize='NONE';title.resize(312,76);title.layoutSizingHorizontal='FILL';
const taskKey=core.addComponentProperty('Task name','TEXT','读书');title.componentPropertyReferences={characters:taskKey};
const next=text(core,'从第三章继续，读完后记一句感想。',14,280,'muted');next.name='Existing next step';next.textAlignHorizontal='CENTER';next.textAutoResize='HEIGHT';next.layoutSizingHorizontal='FILL';
const nextKey=core.addComponentProperty('Next step','TEXT',next.characters);const hasNext=core.addComponentProperty('Show next step','BOOLEAN',false);next.componentPropertyReferences={characters:nextKey,visible:hasNext};next.visible=false;
const start=track(startSource.createInstance());core.appendChild(start);start.resize(240,56);start.name='Start / primary';gray(start,'selected');start.strokes=[paint('border')];start.cornerRadius=8;
const startLabel=start.findAllWithCriteria({types:['TEXT']})[0];startLabel.fontSize=22;
const change=track(changeSource.createInstance());core.appendChild(change);change.name='Change / secondary';gray(change,'paper');change.resize(160,44);
const note=text(masters,'主操作组：名称 → 开始 → 换一件。\n名称预留两行高度，短标题与长标题切换时按钮不跳动。\n已有“下次起点”显示在名称下方，整组重新居中。',14,660,'muted');
const screens=[];
function make(label,w,h,name,hasStep=false){
 const column=frame(row,label,w,100);column.itemSpacing=12;column.primaryAxisSizingMode='AUTO';text(column,label,17,w);
 const screen=track(template.clone());column.appendChild(screen);screen.name=label;screen.resize(w,h);
 const book=screen.children.find(n=>n.name==='Single page / available viewport');book.resize(w-24,h-136);for(const c of [...book.children])c.remove();
 for(const child of screen.children){if(child!==book)child.resize(w,child.height);}
 const nav=screen.children.find(n=>n.name==='Navigation');for(const tab of nav.children)fill(tab,tab.name==='Tab / 现在做'?'selected':'field');
 const controls=frame(book,'Time and conditions / top utility row',w-48,44,'HORIZONTAL');controls.primaryAxisAlignItems='CENTER';controls.itemSpacing=12;
 pill(controls,'10 分钟',Math.min(132,(w-60)/2));pill(controls,'当前条件',Math.min(132,(w-60)/2));
 const area=frame(book,'Flexible focus area / vertically centered',w-48,100);area.layoutSizingVertical='FILL';area.primaryAxisAlignItems='CENTER';area.counterAxisAlignItems='CENTER';
 const content=track(core.createInstance());area.appendChild(content);content.setProperties({[taskKey]:name,[hasNext]:hasStep});content.resize(w-48,content.height);content.layoutSizingVertical='HUG';
 text(column,hasStep?'长名称与已有起点同时出现时，优先压缩上下留白，保持完整可读与按钮间距。':h<700?'小屏仍整体居中，按钮保持触控尺寸；根据可用高度缩减留白，不固定写死顶部距离。':'时间与条件留在顶部；任务名称、开始和换一件作为一组，移到页面中部偏下，平衡上下留白。',13,w,'muted');
 screens.push({id:screen.id,name:label,width:w,height:h,focusGroupId:content.id});return screen;
}
make('12 默认主页 · 360×800',360,800,'读书');
make('13 小屏主页 · 320×640',320,640,'学习日语');
make('14 长名称与已有起点 · 360×800',360,800,'学习日语并整理\n今天的新单词',true);
const notes=frame(row,'Layout decisions pending approval',440,600);notes.paddingTop=44;notes.paddingLeft=20;notes.paddingRight=20;notes.itemSpacing=20;fill(notes,'paper');
text(notes,'布局确认重点',22);
text(notes,'顶部：时间、当前条件\n中部：任务名称、开始、换一件\n底部：保留适量呼吸空间',17,400);
text(notes,'“开始”保持主要操作的视觉权重，\n“换一件”紧随其后，避免分散。',15,400,'muted');
text(notes,'换任务时位置稳定。\n存在下次起点或更大字体时，先减少留白；内容超过可用高度后允许阅读区滚动。\n完成反馈出现时重新分配中部空间，不能把操作推出屏幕。',15,400,'muted');
text(notes,'灰阶仅表示层级。确认后沿用原有旧书视觉，调整排版；本轮不改运行中的网页、Windows 或 Android。',15,400,'muted');
const counts={};const images=[];const fontFamilies=new Set();const bounds=[];
for(const n of section.findAll(()=>true)){counts[n.type]=(counts[n.type]||0)+1;if('fills'in n&&Array.isArray(n.fills)&&n.fills.some(f=>f.type==='IMAGE'))images.push(n.id);if(n.type==='TEXT')for(const s of n.getStyledTextSegments(['fontName']))fontFamilies.add(s.fontName.family);}
for(const s of screens){const n=await figma.getNodeByIdAsync(s.id);const group=await figma.getNodeByIdAsync(s.focusGroupId);bounds.push({screen:s.id,groupTop:group.absoluteBoundingBox.y-n.absoluteBoundingBox.y,groupHeight:group.height,screenHeight:n.height});}
figma.viewport.scrollAndZoomIntoView([section]);
return {sectionId:section.id,createdNodeIds:[section.id,...section.findAll(()=>true).map(n=>n.id)],mutatedNodeIds:[board.id],screens,counts,imageNodes:images,fontFamilies:[...fontFamilies],bounds};
