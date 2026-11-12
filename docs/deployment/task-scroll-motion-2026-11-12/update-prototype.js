// Design-only Figma Plugin API script. Run in the verified account/session.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));
const mutated=new Set(), before=[], after=[];
const specs=[['234:4155','151:4164'],['234:4229','151:4237'],['198:4041','151:4237']];
for(const [targetId,sourceId] of specs){
 const t=await figma.getNodeByIdAsync(targetId),s=await figma.getNodeByIdAsync(sourceId);
 const ts=t.findAllWithCriteria({types:['TEXT']});
 const fonts=new Map();for(const x of ts)for(const z of x.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(z.fontName),z.fontName);
 for(const f of fonts.values())await figma.loadFontAsync(f);
 const nodes=[t,...t.children,...t.children.filter(c=>c.name==='纸卷 / 卷边').flatMap(c=>c.children)];
 before.push({id:targetId,nodes:nodes.map(c=>({id:c.id,name:c.name,x:c.x,y:c.y,w:c.width,h:c.height,opacity:c.opacity,clips:'clipsContent'in c?c.clipsContent:undefined}))});
 t.resize(s.width,s.height-80);t.x=s.x;t.y=s.y;t.opacity=0;mutated.add(t.id);
 for(const c of t.children){
  const sc=s.children.find(x=>x.name===c.name);if(!sc)continue;
  c.resize(sc.width,sc.height);c.x=sc.x;c.y=sc.y;c.opacity=sc.opacity;mutated.add(c.id);
  if(c.name==='便签 / 内容窗'){c.resize(sc.width,sc.height-80);c.clipsContent=true;
   const body=c.children.find(x=>x.name==='修改卷轴 / 内容');if(body){body.opacity=1;mutated.add(body.id);}}
  if(c.name==='纸卷 / 卷边'){c.y=sc.y-80;for(let i=0;i<c.children.length;i++){const rc=c.children[i],sr=sc.children[i];if(sr&&rc.name===sr.name){rc.resize(sr.width,sr.height);rc.x=sr.x;rc.y=sr.y;mutated.add(rc.id);}}}
 }
 after.push({id:t.id,x:t.x,y:t.y,w:t.width,h:t.height,opacity:t.opacity,paper:t.children.filter(c=>c.name==='便签 / 内容窗'||c.name==='纸卷 / 卷边').map(c=>({id:c.id,x:c.x,y:c.y,w:c.width,h:c.height}))});
}
const transitions=[];
for(const id of ['234:4153','234:4227']){
 const n=await figma.getNodeByIdAsync(id), rs=JSON.parse(JSON.stringify(n.reactions));
 for(const r of rs)for(const a of r.actions||[])if(a.type==='NODE'&&['151:4148','151:4235'].includes(a.destinationId)){
  transitions.push({id,before:a.transition});a.transition={type:'SMART_ANIMATE',easing:{type:'EASE_OUT'},duration:.22};
 }
 await n.setReactionsAsync(rs);mutated.add(n.id);
}
return{createdNodeIds:[],mutatedNodeIds:[...mutated],before,after,transitions,closing:'Existing single 240ms SMART_ANIMATE EASE_OUT to 198:4039 retained; conditional save/delete/page restoration untouched',scope:'Figma prototype only; expanded designs and application code unchanged'};
