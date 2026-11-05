const page=await figma.getNodeByIdAsync('0:1');await figma.setCurrentPageAsync(page);
page.name='Now What · 产品与可点击原型';
await Promise.all(['Regular','Medium','Bold'].map(style=>figma.loadFontAsync({family:'Noto Sans SC',style})));
if(page.children.some(n=>n.name==='NW/Controls'))throw new Error('Foundation already exists; inspect ledger.');
// Adapted from figma-generate-library createVariableCollection and createSemanticTokens helpers.
async function createVariableCollection(name,modes){const collection=figma.variables.createVariableCollection(name);collection.renameMode(collection.modes[0].modeId,modes[0]);return {collection,modeIds:{[modes[0]]:collection.modes[0].modeId}};}
const raw=await createVariableCollection('NW / Primitives',['Value']);
const sem=await createVariableCollection('NW / Semantics',['Light']);
const runtime=await createVariableCollection('NW / Prototype state',['Demo']);
const vars={};const primitives={};
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
function variable(name,type,value,scopes,coll,mode,syntax){const v=figma.variables.createVariable(name,coll,type);try{v.scopes=scopes;}catch(e){throw new Error(name+' '+type+' '+JSON.stringify(scopes)+': '+e.message);}v.setValueForMode(mode,value);v.setVariableCodeSyntax('WEB','var(--'+syntax+')');return v;}
const colorSpec={bg:'#F7F6F2',surface:'#FFFFFF',ink:'#233C37',muted:'#596D65',line:'#D6DFD9',primary:'#245C4E',hover:'#19483D',soft:'#EAF1EB',onPrimary:'#FFFFFF',accent:'#B44C32',accentSoft:'#FBEDE5',disabled:'#E5E9E4',disabledText:'#65746D',focus:'#B44C32'};
const css={bg:'bg',surface:'s',ink:'t',muted:'m',line:'l',primary:'p',soft:'ps',onPrimary:'on-p',accent:'danger'};
for(const [name,h]of Object.entries(colorSpec)){const p=variable('color/'+name,'COLOR',rgb(h),[],raw.collection,raw.modeIds.Value,'nw-raw-'+name);primitives[name]=p;vars[name]=variable('color/'+name,'COLOR',{type:'VARIABLE_ALIAS',id:p.id},['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'],sem.collection,sem.modeIds.Light,css[name]||'nw-'+name);}
for(const n of [4,8,12,16,20,24,32,40]){const p=variable('space/'+n,'FLOAT',n,[],raw.collection,raw.modeIds.Value,'nw-raw-space-'+n);vars['space'+n]=variable('space/'+n,'FLOAT',{type:'VARIABLE_ALIAS',id:p.id},['GAP'],sem.collection,sem.modeIds.Light,'nw-space-'+n);}
for(const n of [12,20,28]){const p=variable('radius/'+n,'FLOAT',n,[],raw.collection,raw.modeIds.Value,'nw-raw-radius-'+n);vars['radius'+n]=variable('radius/'+n,'FLOAT',{type:'VARIABLE_ALIAS',id:p.id},['CORNER_RADIUS'],sem.collection,sem.modeIds.Light,'nw-radius-'+n);}
const state={};
for(const [name,type,value] of [['budget','FLOAT',15],['budgetLabel','STRING','15 分钟'],['activity','STRING','读一点喜欢的内容'],['step','STRING','打开手边的一本书或一篇文章，先读一段。'],['stop','STRING','到点就在当前段落末停下。'],['note','STRING',''],['hasNote','FLOAT',0],['hasOwn','FLOAT',0],['onlyOwn','FLOAT',0],['rejections','FLOAT',0],['timed','FLOAT',0]])state[name]=variable('state/'+name,type,value,type==='STRING'?['TEXT_CONTENT']:[],runtime.collection,runtime.modeIds.Demo,'nw-demo-'+name);
for(const k of ['5','15','30','unknown']){state['chip'+k]=variable('state/chip'+k,'COLOR',rgb(k==='15'?colorSpec.soft:colorSpec.surface),['FRAME_FILL'],runtime.collection,runtime.modeIds.Demo,'nw-demo-chip-'+k);}
const styles={};
for(const [name,size,style,line]of [['Body',16,'Regular',26],['Caption',13,'Regular',21],['Title',32,'Bold',43],['Section',20,'Medium',29],['Button',15,'Medium',24],['Display',56,'Bold',70]]){const s=figma.createTextStyle();s.name='NW / '+name;s.fontName={family:'Noto Sans SC',style};s.fontSize=size;s.lineHeight={unit:'PIXELS',value:line};styles[name]=s;}
function paint(n,key,stroke=false){const p=figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(colorSpec[key])},'color',vars[key]);if(stroke)n.strokes=[p];else n.fills=[p];}
function text(parent,name,value,style='Body',color='ink',width=310){const t=figma.createText();t.name=name;t.fontName=styles[style].fontName;t.textStyleId=styles[style].id;t.characters=value;t.textAutoResize='HEIGHT';t.resize(width,Math.max(24,t.height));parent.appendChild(t);paint(t,color);return t;}
const area=figma.createFrame();area.name='NW/Controls';area.resize(1900,1900);area.x=200;area.y=9300;area.fills=[];area.clipsContent=false;
const comps={};
const variants=[];
let base=null;
for(const kind of ['Primary','Secondary','Quiet','Danger'])for(const s of ['Default','Hover','Focus','Disabled']){
 const c=base?base.clone():figma.createComponent();if(!base){base=c;c.layoutMode='HORIZONTAL';c.primaryAxisAlignItems='CENTER';c.counterAxisAlignItems='CENTER';const t=text(c,'Label','开始这一步','Button');const prop=c.addComponentProperty('Label','TEXT','开始这一步');t.componentPropertyReferences={characters:prop};t.textAutoResize='WIDTH_AND_HEIGHT';}
 c.name='Style='+kind+', State='+s;c.resize(342,52);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.setBoundVariable('cornerRadius',vars.radius12);for(const k of ['paddingLeft','paddingRight'])c.setBoundVariable(k,vars.space16);c.strokeWeight=s==='Focus'?2:1;
 const bg=s==='Disabled'?'disabled':kind==='Primary'?(s==='Hover'?'hover':'primary'):kind==='Danger'?'accentSoft':kind==='Quiet'?'bg':s==='Hover'?'soft':'surface';
 paint(c,bg);paint(c,s==='Focus'?'focus':kind==='Secondary'?'line':bg,true);
 for(const t of c.findAllWithCriteria({types:['TEXT']}))paint(t,s==='Disabled'?'disabledText':kind==='Primary'?'onPrimary':kind==='Danger'?'accent':'primary');
 area.appendChild(c);variants.push(c);
}
const set=figma.combineAsVariants(variants,area);set.name='NW/Button';set.description='主操作、次操作、文字操作与删除操作。44px 以上触控区；Label 可覆盖。';
set.children.forEach((c,i)=>{c.x=20+(i%4)*362;c.y=20+Math.floor(i/4)*80;});set.resize(1488,360);set.x=0;set.y=70;comps.button=set.id;
const fields=[];
for(const [i,s]of ['Default','Filled','Error','Focus'].entries()){const c=figma.createComponent();c.name='State='+s;c.layoutMode='VERTICAL';c.resize(342,88);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.paddingLeft=16;c.paddingRight=16;c.paddingTop=12;c.paddingBottom=12;c.itemSpacing=4;c.setBoundVariable('cornerRadius',vars.radius12);paint(c,'surface');paint(c,s==='Error'?'accent':s==='Focus'?'focus':'line',true);c.strokeWeight=s==='Focus'?2:1;const v=text(c,'Value',s==='Filled'?'第 48 页，下次接着读':'点按填入示例','Body',s==='Filled'?'ink':'muted',310);const vp=c.addComponentProperty('Value','TEXT',v.characters);v.componentPropertyReferences={characters:vp};const h=text(c,'Helper',s==='Error'?'先写一个活动名称':'选填，略过也可以','Caption',s==='Error'?'accent':'muted',310);const hp=c.addComponentProperty('Helper','TEXT',h.characters);h.componentPropertyReferences={characters:hp};area.appendChild(c);fields.push(c);}
const fs=figma.combineAsVariants(fields,area);fs.name='NW/Field';fs.description='原型输入通过预设示例模拟，后续产品支持实际键入。';fs.children.forEach((c,i)=>{c.x=20+(i%2)*362;c.y=20+Math.floor(i/2)*110;});fs.resize(744,250);fs.x=0;fs.y=510;comps.field=fs.id;
const row=figma.createComponent();row.name='NW/ActivityRow';row.layoutMode='VERTICAL';row.resize(342,98);row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';row.paddingTop=16;row.paddingLeft=20;row.paddingRight=20;row.itemSpacing=4;row.setBoundVariable('cornerRadius',vars.radius20);paint(row,'surface');paint(row,'line',true);for(const [name,value,style,color]of [['Title','读一点喜欢的内容','Section','ink'],['Detail','从手边内容开始 · 约 5 分钟','Caption','muted']]){const t=text(row,name,value,style,color,302);const p=row.addComponentProperty(name,'TEXT',value);t.componentPropertyReferences={characters:p};}area.appendChild(row);row.x=800;row.y=510;comps.row=row.id;
const note=figma.createComponent();note.name='NW/Notice';note.layoutMode='VERTICAL';note.resize(342,88);note.primaryAxisSizingMode='AUTO';note.counterAxisSizingMode='FIXED';note.paddingLeft=16;note.paddingRight=16;note.paddingTop=12;note.paddingBottom=12;note.itemSpacing=4;note.setBoundVariable('cornerRadius',vars.radius12);paint(note,'soft');const nt=text(note,'Message','先做一点，也很好。','Caption','primary',310);const np=note.addComponentProperty('Message','TEXT',nt.characters);nt.componentPropertyReferences={characters:np};area.appendChild(note);note.x=800;note.y=650;comps.notice=note.id;
page.backgrounds=[{type:'SOLID',color:rgb('#E9EDE8')}];
const roots=[area];
return {pageId:page.id,components:comps,variables:Object.fromEntries(Object.entries(vars).map(([k,v])=>[k,v.id])),state:Object.fromEntries(Object.entries(state).map(([k,v])=>[k,v.id])),styles:Object.fromEntries(Object.entries(styles).map(([k,v])=>[k,v.id])),collections:[raw.collection.id,sem.collection.id,runtime.collection.id],createdNodeIds:roots.flatMap(r=>[r.id,...r.findAll(()=>true).map(n=>n.id)]),mutatedNodeIds:[page.id],counts:{buttonVariants:16,fieldVariants:4,colors:Object.keys(colorSpec).length},font:'Noto Sans SC',rejectedLibraryCandidates:'Simple Design System controls use Inter and unrelated token schema; team Body is 13px. Local Chinese patterns use Noto Sans SC (available fallback for Microsoft YaHei).'};
