await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));figma.skipInvisibleInstanceChildren=false;
const board=await figma.getNodeByIdAsync('574:10204');const changed=new Set(),created=[];
const fonts=new Map();for(const t of board.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);
for(const f of fonts.values())await figma.loadFontAsync(f);await figma.loadFontAsync({family:'Noto Serif SC',style:'Medium'});
const vars={};for(const [k,id]of Object.entries({ink:'6:3',muted:'6:4',paper:'6:5',leather:'6:6',brass:'6:7',gold:'6:8'}))vars[k]=await figma.variables.getVariableByIdAsync('VariableID:'+id);
function paint(k,opacity=1){return {...figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',vars[k]),opacity};}
const copy=x=>JSON.parse(JSON.stringify(x));const src={};for(const [k,id]of Object.entries({screen:'376:5829',paper:'376:5833',pill:'342:4343',start:'49:512',leather:'111:3029',slip:'87:1238',slipFx:'87:1237',roll:'87:1240'}))src[k]=await figma.getNodeByIdAsync(id);
const remap={'VariableID:497:9789':'ink','VariableID:497:9790':'muted','VariableID:497:9791':'brass','VariableID:497:9792':'paper','VariableID:497:9793':'paper','VariableID:497:9794':'gold','VariableID:497:9795':'paper'};
const all=[board,...board.findAll(()=>true)];
for(const n of all){
 for(const prop of ['fills','strokes'])if(prop in n&&Array.isArray(n[prop])){
 let edited=false;const ps=n[prop].map(p=>{const k=remap[p.boundVariables?.color?.id];if(k&&p.type==='SOLID'){edited=true;return {...paint(k,p.opacity),visible:p.visible,blendMode:p.blendMode};}return p;});
 if(edited){n[prop]=ps;changed.add(n.id);}
 }
 if('reactions'in n&&n.reactions.length){await n.setReactionsAsync([]);changed.add(n.id);}
 if(n.name.startsWith('DRAFT /')){n.name=n.name.replace('DRAFT /','Android B+C /');changed.add(n.id);}
}
board.fills=[paint('paper')];
const screenIds=["574:10223","574:10241","574:10259","574:10291","574:10315","574:10342","574:10366","574:10392","574:10414","574:10438","574:10460","574:10485","574:10514"];
const screens=[];for(const id of screenIds){const s=await figma.getNodeByIdAsync(id);s.fills=copy(src.screen.fills);s.strokes=[];changed.add(id);screens.push(s);
 for(const c of s.children){if(['Brand','System status inset'].includes(c.name))for(const t of c.findAllWithCriteria({types:['TEXT']})){t.fills=[paint('paper')];if(c.name==='Brand')t.fontName={family:'Noto Serif SC',style:'Medium'};changed.add(t.id);}}
}
function apply(n,source,primary=false){n.fills=copy(source.fills);n.strokes=copy(source.strokes);n.effects=copy(source.effects);changed.add(n.id);if(primary)for(const t of n.findAllWithCriteria({types:['TEXT']})){t.fills=[paint('paper')];changed.add(t.id);}if(primary)for(const v of n.findAllWithCriteria({types:['VECTOR']})){if(v.fills.length)v.fills=[paint('paper')];if(v.strokes.length)v.strokes=[paint('paper')];changed.add(v.id);}}
for(const n of board.findAll(()=>true)){
 if(n.type==='FRAME'&&(n.name==='Single page / available viewport'||n.name==='Editor / stable top anchor')){
 n.fills=copy(src.paper.fills);n.strokes=[paint('brass',.8)];n.cornerRadius=12;
 n.effects=[{type:'DROP_SHADOW',color:{r:.439,g:.235,b:.145,a:1},offset:{x:0,y:1},radius:0,spread:3,visible:true,blendMode:'NORMAL'},{type:'DROP_SHADOW',color:{r:.1,g:.04,b:.01,a:.35},offset:{x:0,y:4},radius:8,spread:0,visible:true,blendMode:'NORMAL'},{type:'INNER_SHADOW',color:{r:.5,g:.34,b:.16,a:.13},offset:{x:3,y:0},radius:8,spread:0,visible:true,blendMode:'NORMAL'}];changed.add(n.id);
 }
 if(n.type==='INSTANCE'){
 const main=await n.getMainComponentAsync();
 if(main?.id==='342:4343'){apply(n,src.pill);n.cornerRadius=22;}
 if(n.name==='Start / primary'){apply(n,src.start,true);n.cornerRadius=10;}
 if(n.name==='Change / secondary'){n.fills=[];n.strokes=[];n.effects=[];changed.add(n.id);}
 if(n.name==='添加'){apply(n,src.leather,true);n.cornerRadius=8;}
 }
 if(n.type==='FRAME'&&(n.name==='Name slip'||n.name==='Description / expanded by default')){
 n.fills=[paint('paper',.86)];n.strokes=[paint('brass',.65)];n.effects=[{type:'INNER_SHADOW',color:{r:.27,g:.16,b:.1,a:.1},offset:{x:0,y:1},radius:3,spread:0,visible:true,blendMode:'NORMAL'}];changed.add(n.id);
 }
 if(n.type==='FRAME'&&n.parent?.name==='Conditions'){n.fills=copy(src.pill.fills);n.strokes=[paint('brass',.65)];changed.add(n.id);}
 if(n.type==='TEXT'&&(['Task heading','Today or selected activity','Title and full close target'].includes(n.parent.name))&&n.fontSize>=20){n.fontName={family:'Noto Serif SC',style:'Medium'};changed.add(n.id);}
}
const navMaster=await figma.getNodeByIdAsync('574:10561');
for(let i=0;i<navMaster.children.length;i++){const tab=navMaster.children[i];tab.layoutMode='HORIZONTAL';tab.primaryAxisAlignItems='CENTER';tab.counterAxisAlignItems='CENTER';tab.itemSpacing=4;tab.cornerRadius=6;const icon=(await figma.getNodeByIdAsync(['49:376','49:379','49:382','49:385'][i])).clone();tab.insertChild(0,icon);icon.rescale(16/22);icon.name='Bookmark icon';created.push(icon.id,...icon.findAll(()=>true).map(x=>x.id));changed.add(tab.id);}
for(const s of screens){const nav=s.children.find(c=>c.name==='Navigation');if(!nav)continue;const active=s.name.startsWith('calendar')?'日历':/主页|长名称/.test(s.name)?'现在做':'任务';for(const tab of nav.children){const selected=tab.name==='Tab / '+active;tab.fills=selected?copy(src.pill.fills):[paint('brass')];tab.strokes=[paint('gold',selected?.8:.35)];tab.effects=selected?copy(src.pill.effects):[];tab.cornerRadius=6;for(const t of tab.findAllWithCriteria({types:['TEXT']})){t.fills=[paint('ink')];changed.add(t.id);}changed.add(tab.id);}}
for(const id of ['574:10209','574:10553']){
 const master=await figma.getNodeByIdAsync(id);master.fills=[paint('paper')];master.strokes=[paint('brass',.45)];master.cornerRadius=7;master.effects=copy(src.slipFx.effects);changed.add(master.id);
 const paper=src.slip.clone();master.insertChild(0,paper);paper.layoutPositioning='ABSOLUTE';paper.resize(master.width-2,master.height-2);paper.x=1;paper.y=1;paper.constraints={horizontal:'STRETCH',vertical:'STRETCH'};paper.name='Editable aged paper contour';created.push(paper.id);
 const roll=src.roll.clone();master.appendChild(roll);roll.layoutPositioning='ABSOLUTE';roll.resize(7,master.height-6);roll.x=master.width-9;roll.y=3;roll.cornerRadius=3;roll.constraints={horizontal:'MAX',vertical:'STRETCH'};roll.name='Paper edge / shallow curl';created.push(roll.id);
 const labels=master.findAllWithCriteria({types:['TEXT']});for(const t of labels)if(t.fontSize>=16&&t.characters!=='›'){t.fontName={family:'Noto Serif SC',style:'Medium'};changed.add(t.id);}
}
const sessions=await figma.getNodeByIdAsync('574:10556');sessions.fills=[paint('paper',.65)];sessions.strokes=[paint('brass',.45)];sessions.cornerRadius=6;changed.add(sessions.id);
const textReplacements={
"574:10205":'安卓视觉稿 · 旧书 B / C',
"574:10206":'依据 11 月 12 日确认的线框 · C 版任务与日历 / B 版主页与控件',
"574:10207":'顶部排列 · 真分页 · 独立记录明细 · 120 ms 短淡出；360×800 / 320×640 为参考画布。',
"574:10544":'添加活动 · 收起动效规范',
"574:10550":'视觉稿已按确认线框完成。键盘为系统占位示意，\n不代表 ColorOS 实际动画或性能。后续实现需实机检查\n键盘开／关、连续关闭、分页及返回键。',
"574:10551":'本次交付可编辑视觉稿；尚未修改应用或生成 APK。'
};
for(const [id,value]of Object.entries(textReplacements)){const t=await figma.getNodeByIdAsync(id);t.characters=value;changed.add(id);}
for(const n of board.findAllWithCriteria({types:['TEXT']})){
 if(n.characters==='新增安卓线框 · 2026-11-12 · 待确认，尚未修改视觉稿和代码')n.characters='B 版安卓主页 · 保留已确认的位置与触控尺寸';
 else if(n.characters==='布局确认重点')n.characters='主页布局规范';
 else if(n.characters.includes('灰阶仅表示层级。'))n.characters='延续既有暖棕旧书视觉，保留已确认的排版。文字、按钮、导航均为可编辑图层；未改应用代码。';
 else if(n.characters.includes('灰阶仅用于评审'))n.characters='复用既有胶囊、拖拽、置顶、开始组件\n暖棕旧书材质 · 可编辑图层';
 else continue;changed.add(n.id);
}
const counts={},images=[];for(const n of board.findAll(()=>true)){counts[n.type]=(counts[n.type]||0)+1;if('fills'in n&&Array.isArray(n.fills)&&n.fills.some(p=>p.type==='IMAGE'))images.push({id:n.id,name:n.name,w:n.width,h:n.height});}
return{boardId:board.id,createdNodeIds:created,mutatedNodeIds:[...changed],screens:screens.map(s=>({id:s.id,name:s.name,w:s.width,h:s.height})),counts,imageNodes:images};
