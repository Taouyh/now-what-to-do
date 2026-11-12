// Targeted refinement of the draft created by build-wireframes.js.
const page=await figma.getNodeByIdAsync('49:243');await figma.setCurrentPageAsync(page);
const board=await figma.getNodeByIdAsync('497:9796');
const fonts=new Map();for(const t of board.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
const changed=[];const created=[];const removed=[];
const title=await figma.getNodeByIdAsync('497:9805');title.textAutoResize='NONE';title.textAlignVertical='CENTER';changed.push(title.id);
const pin=await figma.getNodeByIdAsync('497:9806');pin.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:.85,g:.85,b:.85}},'color',await figma.variables.getVariableByIdAsync('VariableID:497:9794'))];changed.push(pin.id);
for(const id of ['497:10257','497:10338']){const n=await figma.getNodeByIdAsync(id);n.opacity=.42;changed.push(id);}
const library=figma.createAutoLayout('HORIZONTAL');board.appendChild(library);library.name='Draft reusable directory, session and navigation components';library.itemSpacing=24;library.fills=[];library.resize(1500,120);created.push(library.id);
function property(comp,t,name,value){const k=comp.addComponentProperty(name,'TEXT',value);t.componentPropertyReferences={characters:k};return k;}
const directory=await figma.getNodeByIdAsync('497:10197');const dp=directory.parent;const di=dp.children.indexOf(directory);
const dc=figma.createComponentFromNode(directory);dc.name='DRAFT / Calendar activity slip';library.appendChild(dc);created.push(dc.id);
const dk=property(dc,dc.children[0],'Activity','读书');
for(const [i,name] of ['读书','学习日语','散步'].entries()){
 const instance=dc.createInstance();dp.insertChild(di+i,instance);instance.setProperties({[dk]:name});instance.name='Activity / '+name;created.push(instance.id);
}
for(const id of ['497:10200','497:10203']){const n=await figma.getNodeByIdAsync(id);removed.push(n.id);n.remove();}
const record=await figma.getNodeByIdAsync('497:10237');const rp=record.parent;const ri=rp.children.indexOf(record);
record.children[0].layoutSizingHorizontal='FILL';record.children[1].layoutSizingHorizontal='FILL';
const rc=figma.createComponentFromNode(record);rc.name='DRAFT / Session row / reserved detail line';library.appendChild(rc);created.push(rc.id);
const timeKey=property(rc,rc.children[0].children[0],'Time','10:30–10:45');
const durationKey=property(rc,rc.children[0].children[1],'Duration','15 分钟');
const detailKey=property(rc,rc.children[1],'Detail','计划 15 分 · 暂停 0 秒 · 追加 0 秒');
const records=[['10:30–10:45','15 分钟'],['11:20–11:30','10 分钟'],['14:10–14:18','8 分钟'],['16:00–16:05','5 分钟']];
for(const [parentId,w,h] of [[rp.id,312,84],['497:10317',272,64]]){
 const parent=await figma.getNodeByIdAsync(parentId);const old=[...parent.children];
 for(const n of old){removed.push(n.id);n.remove();}
 for(const [i,[time,duration]]of records.entries()){
  const n=rc.createInstance();parent.appendChild(n);n.resize(w,h);n.setProperties({[timeKey]:time,[durationKey]:duration,[detailKey]:i===0?'计划 15 分 · 暂停 0 秒 · 追加 0 秒':''});n.name='Session '+(i+1);created.push(n.id);
 }
}
const navs=board.findAll(n=>n.type==='FRAME'&&n.name==='Navigation');
const first=navs[0];const firstParent=first.parent;const firstIndex=firstParent.children.indexOf(first);
const nc=figma.createComponentFromNode(first);nc.name='DRAFT / Navigation / four tabs';library.appendChild(nc);created.push(nc.id);
for(const c of nc.children)c.layoutSizingHorizontal='FILL';
const gray=await figma.variables.getVariableByIdAsync('VariableID:497:9793');const selected=await figma.variables.getVariableByIdAsync('VariableID:497:9794');
const navTargets=[{parent:firstParent,index:firstIndex,width:360},...navs.slice(1).map(n=>({parent:n.parent,index:n.parent.children.indexOf(n),width:n.width,old:n}))];
for(const t of navTargets){
 const instance=nc.createInstance();t.parent.insertChild(t.index,instance);instance.resize(t.width,48);instance.name='Navigation';
 const active=t.parent.name.startsWith('calendar')?'日历':'任务';
 for(const tab of instance.children){const variable=tab.name.endsWith(active)?selected:gray;tab.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:.95,g:.95,b:.95}},'color',variable)];}
 created.push(instance.id);if(t.old){removed.push(t.old.id);t.old.remove();}
}
// The discovered team Body style is applied to review notes with the product font override.
const style=await figma.importStyleByKeyAsync('06130b604646d8fe9ddbd82e0d96258d78e23006');
const note=await figma.getNodeByIdAsync('497:9894');await note.setTextStyleIdAsync(style.id);note.fontName={family:'Noto Sans SC',style:'Regular'};note.fontSize=13;note.lineHeight={unit:'PIXELS',value:20};changed.push(note.id);
const counts={};const imageNodes=[];const unexpectedFonts=[];
for(const n of board.findAll(()=>true)){
 counts[n.type]=(counts[n.type]||0)+1;
 if('fills'in n&&Array.isArray(n.fills)&&n.fills.some(f=>f.type==='IMAGE'))imageNodes.push({id:n.id,name:n.name,width:n.width,height:n.height});
 if(n.type==='TEXT')for(const s of n.getStyledTextSegments(['fontName']))if(!['Noto Sans SC','Noto Serif SC','EB Garamond'].includes(s.fontName.family))unexpectedFonts.push({id:n.id,font:s.fontName});
}
return {boardId:board.id,createdNodeIds:created,mutatedNodeIds:changed,removedNodeIds:removed,counts,imageNodes,unexpectedFonts,bodyStyleId:style.id};
