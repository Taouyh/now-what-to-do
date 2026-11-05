
figma.skipInvisibleInstanceChildren=false;await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));
const g=id=>figma.getNodeById(id),find=(n,s)=>n.findOne(c=>c.name===s),vs=await figma.variables.getLocalVariablesAsync(),vi=n=>vs.find(v=>v.name===n).id;
const D=Array.from({length:15},(_,i)=>({name:vi('任务/'+i+'/名称'),desc:vi('任务/'+i+'/说明'),live:vi('任务/'+i+'/存在'),needs:Array.from({length:4},(_,j)=>vi('任务/'+i+'/条件'+j))}));
const V={idx:vi('编辑序号'),name:vi('名称草稿'),desc:vi('说明草稿'),error:vi('名称错误'),count:vi('可见任务数量'),needs:Array.from({length:4},(_,j)=>vi('条件草稿'+j))};
const rx=n=>n.reactions.find(r=>r.trigger.type==='ON_CLICK')?.actions||[];
const evalV=(v,s)=>{if(!v)return true;if(v.type==='VARIABLE_ALIAS')return s[v.value.id];if(v.type!=='EXPRESSION')return v.value;const a=v.value.expressionArguments.map(x=>evalV(x,s));switch(v.value.expressionFunction){case'EQUALS':return a[0]===a[1];case'NOT_EQUAL':return a[0]!==a[1];case'AND':return a.every(Boolean);case'OR':return a.some(Boolean);case'NOT':return!a[0];case'GREATER_THAN':return a[0]>a[1];case'LESS_THAN':return a[0]<a[1];case'ADDITION':return a[0]+a[1];case'SUBTRACTION':return a[0]-a[1];default:throw Error(v.value.expressionFunction);}};
function run(a,s,w=[],nav=[]){for(const x of a){if(x.type==='SET_VARIABLE'){s[x.variableId]=evalV(x.variableValue,s);w.push(x.variableId);}else if(x.type==='CONDITIONAL'){const b=x.conditionalBlocks.find(b=>!b.condition||evalV(b.condition,s));if(b)run(b.actions,s,w,nav);}else if(x.type==='NODE'||x.type==='CLOSE')nav.push(x);}return{w,nav};}
const init=()=>{const s={};D.forEach((d,i)=>{s[d.name]='任务'+i;s[d.desc]='说明'+i;s[d.live]=true;d.needs.forEach(x=>s[x]=false);});s[V.count]=15;s[vi('当前任务跨页')]=0;s['VariableID:203:4006']=-1;s['VariableID:203:4005']=-1;return s;};
const prepare=(s,i)=>{s[V.idx]=i;s[V.name]=s[D[i].name];s[V.desc]=s[D[i].desc];V.needs.forEach((x,j)=>s[x]=s[D[i].needs[j]]);};
const save=rx(find(g('151:4148'),'卷轴 / Primary')),del=rx(find(g('151:4308'),'卷轴 / Primary')),add=rx(find(g('151:4235'),'卷轴 / Primary'));let count=0;const cases=[];
function pass(name,ok){if(!ok)throw Error(name);count++;cases.push(name);}
for(let i=0;i<15;i++){let s=init();prepare(s,i);const out=run(save,s);pass('unchanged-'+i,!out.w.some(x=>[D[i].name,D[i].desc,...D[i].needs].includes(x)));
s=init();prepare(s,i);s[V.name]='修改后'+i;run(save,s);pass('save-'+i,s[D[i].name]==='修改后'+i);
s=init();prepare(s,i);s[V.name]='';const e=run(save,s);pass('empty-name-'+i,s[V.error]===true&&s[D[i].name]==='任务'+i&&!e.nav.length);
s=init();s[V.idx]=i;run(del,s);pass('delete-compact-'+i,s[V.count]===14&&D.slice(0,14).every((d,j)=>s[d.live]&&s[d.name]==='任务'+(j>=i?j+1:j))&&!s[D[14].live]);}
let s=init();for(let i=0;i<15;i++){s[V.idx]=0;run(del,s);}pass('delete-all-empty',s[V.count]===0&&s['VariableID:198:3959']===true&&!s['VariableID:198:3960']);
run(rx(find(g('151:3405'),'C / 新增任务')),s);pass('add-first-free',s[V.idx]===0);s[V.name]='新任务';s[V.desc]='新说明';run(add,s);pass('add-empty-book',s[V.count]===1&&s[D[0].live]&&s[D[0].name]==='新任务');
s=init();s[V.idx]=2;s['VariableID:203:4006']=4;s['VariableID:203:4005']=2;run(del,s);pass('stable-active-reference',s['VariableID:203:4006']===3&&s['VariableID:203:4005']===-1);
s=init();s['VariableID:203:4005']=3;s['VariableID:203:4002']='下一步';s['VariableID:203:3999']=true;run(rx(find(g('71:1685'),'续做 / 保存')),s);pass('continuation-save-owner',s[D[3].desc]==='下一步'&&s['VariableID:203:3999']===false);
pass('continuation-no-timeout',!g('71:1685').reactions.some(r=>r.trigger.type==='AFTER_TIMEOUT'));
pass('discard-30-seconds',g('203:4383').reactions.some(r=>r.trigger.type==='AFTER_TIMEOUT'&&Math.abs(r.trigger.timeout-30)<.01));
const selected=['49:244','71:1045','71:1219','71:1338','71:1419','71:1566','71:1685','151:3405','151:3813','111:3036','111:4832','111:5147','203:4267'];
function destinations(a){return a.flatMap(x=>x.type==='CONDITIONAL'?x.conditionalBlocks.flatMap(b=>destinations(b.actions)):x.type==='NODE'&&x.navigation==='NAVIGATE'?[x.destinationId]:[]);}
for(const id of selected){const n=g(id);const b=find(n,'书签 / 任务');if(b)pass('task-nav-'+id,id==='151:3405'||destinations(rx(b)).includes('151:3405'));const c=find(n,'书签 / 日历');if(c)pass('calendar-nav-'+id,id==='111:3036'||destinations(rx(c)).includes('111:3036'));}
return {passed:count,cases,rollTransitions:['198:3966','198:4039'].map(id=>({id,reactions:g(id).reactions})),fonts:[...new Set(selected.flatMap(id=>g(id).findAllWithCriteria({types:['TEXT']}).flatMap(t=>t.getStyledTextSegments(['fontName']).map(s=>s.fontName.family))))]};

