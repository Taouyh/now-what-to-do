const $=id=>document.getElementById(id),gn=id=>d.goals.find(g=>g.id===id);
const recommendationChange=$('random');
const CONDITION_KEYS=['computer','audio','speech','interrupted'];
const REQUIREMENT_KEYS=['computer','audio','speech','uninterrupted'];
const CONDITION_INPUTS={computer:'computerReady',audio:'audioReady',speech:'speechReady',interrupted:'interruptionsLikely'};
function currentConditions(preferences){return{computer:!!preferences.computerReady,audio:false,speech:false,interrupted:false,...preferences.conditions}}
function activityRequirements(task){return{computer:!!task.computer,audio:false,speech:false,uninterrupted:false,...task.requirements}}
function requirementLabels(task){const r=activityRequirements(task);return[[r.computer,tr('需要电脑')],[r.audio,tr('需要听音频')],[r.speech,tr('需要出声')],[r.uninterrupted,tr('不便中断')]].filter(([needed])=>needed).map(([,label])=>label)}
function normalizeCompletedRecords(records){
  const used=new Set(records.flatMap(c=>[c.recordId,c.completionId]).filter(Boolean));
  return records.map((c,i)=>{
    let r={...c};
    if(!r.recordId&&!r.completionId){let id='legacy-record-'+(i+1);while(used.has(id))id+='-legacy';used.add(id);r.recordId=id}
    if(!r.recordId)r.recordId=r.completionId;
    if(!r.completionId)r.completionId=r.recordId;
    return r;
  });
}
function toTimestamp(value){let n=typeof value==='number'?value:Date.parse(value);return Number.isFinite(n)?n:null}function formatDateTime(value){let n=toTimestamp(value);if(n===null)return tr('该记录没有保存时间');let z=new Date(n),p=x=>String(x).padStart(2,'0');return z.getFullYear()+'-'+p(z.getMonth()+1)+'-'+p(z.getDate())+' '+p(z.getHours())+':'+p(z.getMinutes())+':'+p(z.getSeconds())}function formatDuration(ms){if(!Number.isFinite(ms)||ms<0)return tr('未知');let total=Math.round(ms/1000),m=Math.floor(total/60),s=total%60;return m?(s?tr('{minutes} 分钟 {seconds} 秒',{minutes:m,seconds:s}):tr('{n} 分钟',{n:m})):tr('{n} 秒',{n:s})}function recordDurationMs(c){if(!c||typeof c!=='object')return null;if(Number.isFinite(c.actualDurationMs))return c.actualDurationMs;let m=Number(c.actualDuration);if(!Number.isFinite(m))m=Number(c.minutes);return Number.isFinite(m)?m*60000:null}
// Retain validation of category metadata from earlier v2 backups.
const LEGACY_ACTIVITY_CATEGORIES=['study','work','life','exercise','other'];
let activityMenuContext=null;
let recommendationMenuContext=null,nextStepEditor=null;
const recommendationSkipped=new Set(),menuCloseTimers=new Map();
function freshData(){return{version:2,goals:[],tasks:[],completed:[],preferences:{time:15,language:defaultLanguage,conditions:{computer:false,audio:false,speech:false,interrupted:false}},theme:'light'}}

// Keep the v2 keys and unknown user fields. Never seed examples during migration.
function validateData(x){
  const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),text=v=>typeof v==='string'&&v.trim().length>0;
  const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>=0;
  if(!object(x)||![undefined,1,2].includes(x.version)||x.goals!==undefined&&!Array.isArray(x.goals)||!Array.isArray(x.tasks)||!Array.isArray(x.completed))throw Error(tr('数据必须包含任务和完成记录数组，且版本为 v1 或 v2；旧目标如有保存，必须为数组。'));
  let goalIds=new Set(),taskIds=new Set();
  for(let g of x.goals||[]){
    if(!object(g)||!text(g.id)||!text(g.name)||goalIds.has(g.id))throw Error(tr('目标数据无效：名称不能为空，ID 必须唯一。'));
    if(['icon','description'].some(k=>g[k]!==undefined&&typeof g[k]!=='string'))throw Error(tr('目标图标或说明无效。'));
    goalIds.add(g.id);
  }
  for(let t of x.tasks){
    if(!object(t)||!text(t.id)||taskIds.has(t.id)||!text(t.name)||t.goalId!=null&&typeof t.goalId!=='string')throw Error(tr('活动数据无效：请检查 ID、名称及旧目标关联字段。'));
    // Keep old fields verbatim, but validate old backups before accepting them.
    if(t.requirements===undefined){if(!Number.isFinite(t.minutes)||t.minutes<1||t.minutes>1440||!['quiet','noisy','class'].includes(t.env)||typeof t.computer!=='boolean')throw Error(tr('旧活动的时长、环境或电脑条件无效。'))}
    else if(!object(t.requirements)||REQUIREMENT_KEYS.some(k=>t.requirements[k]!==undefined&&typeof t.requirements[k]!=='boolean'))throw Error(tr('活动条件必须为布尔值。'));
    if(t.minutes!==undefined&&(!Number.isFinite(t.minutes)||t.minutes<1||t.minutes>1440)||t.env!==undefined&&!['quiet','noisy','class'].includes(t.env)||t.computer!==undefined&&typeof t.computer!=='boolean')throw Error(tr('旧活动字段无效。'));
    if(t.description!==undefined&&typeof t.description!=='string'||t.enabled!==undefined&&typeof t.enabled!=='boolean')throw Error(tr('任务说明或启用状态无效。'));
    if(t.nextStep!==undefined&&(typeof t.nextStep!=='string'||t.nextStep.length>200))throw Error(tr('活动下一步无效。'));
    if(t.activityCategory!==undefined&&t.activityCategory!==''&&!LEGACY_ACTIVITY_CATEGORIES.includes(t.activityCategory))throw Error(tr('活动分类无效。'));
    taskIds.add(t.id);
  }
  if(x.preferences!==undefined&&!object(x.preferences)||x.version===2&&!object(x.preferences))throw Error(tr('偏好数据无效。'));
  let p=x.preferences||{};
  if(p.language!==undefined&&!SUPPORTED_LANGUAGES.includes(p.language))throw Error(tr('语言设置无效。'));
  if(p.time!==undefined&&![5,10,15,30,60].includes(Number(p.time))||p.env!==undefined&&!['quiet','noisy','class'].includes(p.env)||p.computerReady!==undefined&&typeof p.computerReady!=='boolean'||x.version===2&&(p.time===undefined||p.conditions===undefined&&p.env===undefined))throw Error(tr('时间或旧环境偏好无效。'));
  if(p.conditions!==undefined&&(!object(p.conditions)||CONDITION_KEYS.some(k=>p.conditions[k]!==undefined&&typeof p.conditions[k]!=='boolean')))throw Error(tr('当前条件必须为布尔值。'));
  if(x.theme!==undefined&&!['light','dark'].includes(x.theme))throw Error(tr('主题数据无效。'));
  if(x.defaultTasksSeeded!==undefined&&typeof x.defaultTasksSeeded!=='boolean')throw Error(tr('默认任务迁移标记无效。'));
  for(let c of x.completed){
    if(!object(c)||!text(c.taskId)||!numeric(c.actualDurationMs??c.actualDuration??c.minutes))throw Error(tr('完成记录的任务 ID 或有效用时无效。'));
    for(let k of ['date','completedAt','startedAt','endedAt'])if(c[k]!=null&&toTimestamp(c[k])===null)throw Error(tr('完成记录的时间字段无效。'));
    for(let k of ['recordId','completionId'])if(c[k]!==undefined&&!text(c[k]))throw Error(tr('完成记录 ID 无效。'));
    for(let k of ['plannedDuration','actualDuration','minutes','actualDurationMs','pausedDurationMs','extensionDuration','extensionDurationMs'])if(c[k]!=null&&!numeric(c[k]))throw Error(tr('完成记录的时长字段无效。'));
    for(let k of ['taskName','goalName'])if(c[k]!==undefined&&typeof c[k]!=='string')throw Error(tr('完成记录的名称无效。'));
  }
  return x;
}
function migrateData(x){
  validateData(x);
  let migrated=JSON.parse(JSON.stringify(x));
  migrated.version=2;
  if(migrated.goals===undefined)migrated.goals=[];
  migrated.completed=normalizeCompletedRecords(migrated.completed);
  migrated.preferences={time:10,...migrated.preferences};
  if(migrated.preferences.env===undefined&&migrated.preferences.conditions===undefined)migrated.preferences.conditions=currentConditions(migrated.preferences);
  migrated.theme=migrated.theme||'light';
  return migrated;
}

let storageBlocked=false,firstUse=false,originalMain=null,originalTimer=null,pendingImport=null;
const storageFailures=new Map();
function downloadText(content,name,type='application/json'){
  if(window.nativeApp?.exportText){Promise.resolve().then(()=>window.nativeApp.exportText(content,name)).catch(()=>notify(tr('导出失败，请检查浏览器下载权限后重试。')));return}
  try{let a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){notify(tr('导出失败，请检查浏览器下载权限后重试。'))}
}
function protectData(message){
  closeActivityMenu();
  closeRecommendationMenu();
  storageBlocked=true;
  let layer=$('dataRecovery');
  if(!layer){
    layer=document.createElement('div');layer.id='dataRecovery';layer.className='confirm-layer';layer.style.zIndex='100';layer.setAttribute('role','alertdialog');layer.setAttribute('aria-modal','true');
    layer.innerHTML="<div class=\"confirm-card\"><h2><span data-i18n=\"本地数据已保护\">本地数据已保护</span></h2><p id=\"dataRecoveryMessage\"></p><p><span data-i18n=\"已停止保存和计时操作，不会自动重置或覆盖数据。请先导出原始内容留存。存储权限恢复或损坏数据经人工修复后，可重新加载尝试读取；应用不会自动重置数据。\">已停止保存和计时操作，不会自动重置或覆盖数据。请先导出原始内容留存。存储权限恢复或损坏数据经人工修复后，可重新加载尝试读取；应用不会自动重置数据。</span></p><div id=\"recoveryActions\" class=\"actions\"></div></div>";
    document.body.append(layer);translateStatic(layer);
    const add=(id,label,action)=>{let b=document.createElement('button');b.id=id;b.type='button';b.className='secondary';b.textContent=label;b.onclick=action;$('recoveryActions').append(b)};
    if(originalMain!==null)add('exportRawData',tr('导出主数据原文'),()=>downloadText(originalMain,'what-to-do-original.txt','text/plain;charset=utf-8'));
    if(originalTimer!==null)add('exportRawTimer',tr('导出计时原文'),()=>downloadText(originalTimer,'what-to-do-timer-original.txt','text/plain;charset=utf-8'));
    add('retryDataLoad',tr('重新加载'),()=>location.reload());
  }
  $('dataRecoveryMessage').textContent=message;
  document.querySelectorAll('header, main, footer, #timer, #floatingTimer, #modal, #confirmLayer').forEach(el=>el.inert=true);
}
function loadData(){
  try{
    originalMain=localStorage.getItem('whatToDoData');
    originalTimer=localStorage.getItem('activeTimer');
    if(originalTimer!==null&&originalTimer!=='')validateTimer(JSON.parse(originalTimer));
    if(originalMain===null||originalMain===''){firstUse=true;return freshData()}
    return migrateData(JSON.parse(originalMain));
  }catch(e){
    protectData(tr('读取或迁移失败：{error}。原有本地内容未更改；若浏览器禁止读取，需先恢复存储权限才能导出。',{error:e.message}));
    return freshData();
  }
}
function storageFailure(key,error){
  storageFailures.set(key,tr('{kind}保存失败（{error}）。本次操作未保存，原有本地数据未清空；请检查空间和存储权限后重试原操作；初始化或计时清理失败时，可重新加载后重试。',{kind:key==='whatToDoData'?tr('主数据'):tr('计时状态'),error:error.name||tr('存储错误')}));
  let box=$('storageWarning');
  if(!box){box=document.createElement('div');box.id='storageWarning';box.className='card';box.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:30;max-height:40vh;overflow:auto';box.setAttribute('role','alert');box.innerHTML="<p id=\"storageWarningText\"></p><button type=\"button\" class=\"secondary\" id=\"exportSafeData\"><span data-i18n=\"导出当前数据备份\">导出当前数据备份</span></button>";document.body.append(box);translateStatic(box);$('exportSafeData').onclick=()=>downloadText(JSON.stringify(d,null,2),'what-to-do-backup.json')}
  $('storageWarningText').textContent=[...storageFailures.values()].join(' ');box.classList.remove('hide');
}
function clearStorageFailure(key){storageFailures.delete(key);if($('storageWarning')){if(!storageFailures.size)$('storageWarning').classList.add('hide');else $('storageWarningText').textContent=[...storageFailures.values()].join(' ')}}
function syncRuntimePreferences(){
  const changedLanguage=applyLanguage(d.preferences.language);
  document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
  if(changedLanguage){
    $('timerActions').dataset.mode='';
    $('modalTitle').textContent=tr($('tid').value?'编辑活动':'添加活动');
    $('saveActivity').textContent=tr($('tid').value?'保存':'添加');
    syncDescriptionToggle();
    recommendationChange.textContent=tr('换一件');
  }
  time=customTime?customMinutes():Number(d.preferences.time);conditions=currentConditions(d.preferences);
  document.documentElement.dataset.theme=d.theme;
  $('theme').setAttribute('aria-pressed',String(d.theme==='dark'));
  $('lightTheme').setAttribute('aria-pressed',String(d.theme==='light'));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',d.theme==='dark'?'#1e201c':'#f7f5f0');
  syncHomeControls();
}
function save(candidate=d){
  if(storageBlocked)return false;
  try{let serialized=JSON.stringify({...candidate,version:2});localStorage.setItem('whatToDoData',serialized);dataSnapshot=serialized;originalMain=serialized;clearStorageFailure('whatToDoData');return true}
  catch(e){d=JSON.parse(dataSnapshot);syncRuntimePreferences();storageFailure('whatToDoData',e);return false}
}
let d=loadData(),time=Number(d.preferences.time),conditions=currentConditions(d.preferences),cur=null;
let timeChosen=true,customTime=false,customTimeDraft='';
let settingsReturnPage='home';
let dataSnapshot=JSON.stringify(d);
if(firstUse&&!storageBlocked)save();
function customMinutes(){
  const value=customTimeDraft.trim();
  return /^[0-9]+$/.test(value)&&Number(value)>=1&&Number(value)<=1440?Number(value):null;
}
function selectionReady(){return timeChosen&&(!customTime||customMinutes()!==null)}
function syncHomeControls(){
  for(const [id,value,chosen] of [['times',time,timeChosen]]){
    document.querySelectorAll('#'+id+' button').forEach(button=>{
      const selected=id==='times'&&customTime?button.dataset.v==='custom':chosen&&String(button.dataset.v)===String(value);
      button.classList.toggle('on',selected);button.setAttribute('aria-pressed',String(selected));
      button.textContent=button.dataset.v==='custom'?tr('自定义'):tr('{n} 分钟',{n:button.dataset.v});
    });
  }
  $('customTimeField').classList.toggle('hide',!customTime);
  if($('customMinutes').value!==customTimeDraft)$('customMinutes').value=customTimeDraft;
  const invalid=customTime&&customMinutes()===null;
  const showError=invalid&&customTimeDraft.trim()!=='';
  $('customMinutes').setAttribute('aria-invalid',String(showError));
  $('customTimeError').textContent=customTime?(showError?tr('请输入 1–1440 的整数'):tr('1–1440 分钟，整数')):'';
  recommendationChange.disabled=!selectionReady();
  $('timeSummary').textContent=customTime?(customMinutes()===null?tr('自定义时间'):tr('{n} 分钟',{n:customMinutes()})):tr('{n} 分钟',{n:time});
  for(const key of CONDITION_KEYS)$(CONDITION_INPUTS[key]).checked=conditions[key];
  const summary=[conditions.computer?tr('可用电脑'):tr('不便用电脑'),conditions.audio?tr('可听音频'):tr('不便听音频'),conditions.speech?tr('可出声'):tr('不便出声'),conditions.interrupted?tr('可能被打断'):''];
  $('conditionsSummary').textContent=tr('当前条件');
  $('conditionsSummary').title=summary.filter(Boolean).join(' · ');
  $('conditionsPicker').setAttribute('aria-label',tr('当前条件：{conditions}',{conditions:summary.filter(Boolean).join(' · ')}));
}
function persistPreferences(){
  // Custom availability is session-only; keep the existing preset preference format.
  const savedTime=customTime?d.preferences.time:time;
  const changed=Number(d.preferences.time)!==Number(savedTime)||CONDITION_KEYS.some(k=>currentConditions(d.preferences)[k]!==conditions[k]);
  if(changed){d.preferences={...d.preferences,time:savedTime,conditions:{...conditions}};if(!save())return false;recommendationSkipped.clear()}
  syncHomeControls();random({keepCurrent:true});return true;
}
function selectHomeCondition(key,value){
  const previous={timeChosen,customTime};
  if(key==='time'){customTime=value==='custom';time=customTime?customMinutes():value;timeChosen=time!==null}
  else if(CONDITION_KEYS.includes(key))conditions={...conditions,[key]:!!value};
  if(!persistPreferences()){timeChosen=previous.timeChosen;customTime=previous.customTime;syncRuntimePreferences()}
  if(key==='time'&&customTime)$('customMinutes').focus({preventScroll:true});
  else if(key==='time'){$('timePicker').open=false;document.querySelector('#timePicker > summary')?.focus({preventScroll:true})}
}
// User strings are text, option values are data, and event handlers are functions.
// Tags, classes and button IDs passed to these helpers are fixed application code.
function textElement(tag,text='',className=''){
  let node=document.createElement(tag);node.className=className;node.textContent=text??'';return node;
}
function actionButton(label,action,className,id){
  let button=textElement('button',label,className);button.type='button';button.onclick=action;if(id)button.id=id;return button;
}
function page(id,{avoidActivityId=null}={}){
  closeActivityMenu();
  closeRecommendationMenu();
  clearTodayRecordTimers();
  if(!['home','today','tasks','settings'].includes(id))id='home';
  const session=timerState();
  if(id==='settings'&&!$('settings').classList.contains('active'))settingsReturnPage=['home','tasks','today'].includes(location.hash.slice(1))?location.hash.slice(1):'home';
  if(id==='home'&&!session)random({keepCurrent:!avoidActivityId,avoidId:avoidActivityId});
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));
  document.querySelectorAll('[data-page]').forEach(x=>{x.classList.toggle('active',x.dataset.page===id);x.setAttribute('aria-current',x.dataset.page===id?'page':'false')});
  for(const key of ['timePicker','conditionsPicker'])$(key).open=false;
  if(id!=='tasks')setActivitySearch(false,{render:false});
  if(id==='tasks')tasks();if(id==='today')today();
  // Push routes without the browser scrolling the section underneath the header.
  if(window.history?.pushState){if(location.hash!=='#'+id)window.history.pushState(null,'','#'+id)}else location.hash=id;
  // Home resumes the current session; other pages keep its floating controls.
  if(session){if(id==='home')showFullTimer();else{timerView='floating';renderTimer()}}
  window.scrollTo?.({top:0,left:0,behavior:'instant'});
}
document.querySelectorAll('[data-page]').forEach(x=>x.onclick=()=>page(x.dataset.page));$('browse').onclick=()=>page('tasks');
document.querySelectorAll('#times button').forEach(x=>x.onclick=()=>selectHomeCondition('time',x.dataset.v==='custom'?'custom':+x.dataset.v));
$('customMinutes').oninput=()=>{
  customTimeDraft=$('customMinutes').value;
  if(!customTime)return;
  time=customMinutes();timeChosen=time!==null;
  syncHomeControls();random({keepCurrent:true});
};
for(const key of CONDITION_KEYS)$(CONDITION_INPUTS[key]).onchange=()=>selectHomeCondition(key,$(CONDITION_INPUTS[key]).checked);
function ok(t){const r=activityRequirements(t);return t.enabled!==false&&['computer','audio','speech'].every(k=>!r[k]||conditions[k])}
function startRecommendation(id){
  let task=d.tasks.find(t=>t.id===id);
  if(!selectionReady()||!task||cur?.id!==id||!ok(task)||recommendationSkipped.has(id)){random();return}
  run(task);
}
let cancelRecommendationReveal=null;
function revealRecommendation(){
  if(!cur||!$('home').classList.contains('active')||!$('timer').classList.contains('hide'))return;
  const rec=$('rec'),name=$('recommendedTaskName'),actions=$('recommendationActions'),start=$('start');
  if(!name||!actions||!start||rec.classList.contains('hide'))return;
  const viewport=window.visualViewport,header=document.querySelector('header');
  const top=Math.max(viewport?.offsetTop||0,header?.getBoundingClientRect().bottom||64)+12;
  const bottom=Math.min(window.innerHeight,(viewport?.offsetTop||0)+(viewport?.height||window.innerHeight))-12;
  const available=bottom-top,full=rec.getBoundingClientRect(),title=name.getBoundingClientRect(),buttons=actions.getBoundingClientRect();
  let first=full.top,last=full.bottom;
  if(last-first>available){first=title.top;last=buttons.bottom}
  if(last-first>available)last=start.getBoundingClientRect().bottom;
  if(!Number.isFinite(first)||!Number.isFinite(last)||available<=0)return;
  const delta=first<top?first-top:last>bottom?last-bottom:0;
  const root=document.scrollingElement;
  if(!root||Math.abs(delta)<1)return;
  const target=Math.max(0,Math.min(window.scrollY+delta,root.scrollHeight-root.clientHeight));
  if(Math.abs(target-window.scrollY)<1)return;
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){window.scrollTo({top:target,left:window.scrollX,behavior:'instant'});return}
  // One native scroll, with no retry loop. User input immediately takes control.
  let timeout;
  const cleanup=()=>{
    for(const type of ['wheel','touchstart','pointerdown','keydown'])window.removeEventListener(type,cancel);
    window.removeEventListener('scrollend',ended);clearTimeout(timeout);cancelRecommendationReveal=null;
  };
  const cancel=()=>{cleanup();window.scrollTo({top:window.scrollY,left:window.scrollX,behavior:'instant'})};
  const ended=()=>{if(Math.abs(window.scrollY-target)<2)cleanup()};
  for(const type of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(type,cancel,{passive:true});
  window.addEventListener('scrollend',ended);timeout=setTimeout(cleanup,1200);cancelRecommendationReveal=cancel;
  window.scrollTo({top:target,left:window.scrollX,behavior:'smooth'});
}
function recommendAndReveal(){if(cur&&d.tasks.filter(ok).length<2)return;if(cur)recommendationSkipped.add(cur.id);nextStepEditor=null;random();revealRecommendation()}
function restartRecommendations(){recommendationSkipped.clear();nextStepEditor=null;random()}
function random({keepCurrent=false,avoidId=null}={}){
  cancelRecommendationReveal?.();closeRecommendationMenu();
  const empty=!d.tasks.length;
  $('onboarding').classList.toggle('hide',!empty);
  $('homeWorkspace').classList.toggle('hide',empty);
  if(empty){cur=null;$('rec').replaceChildren();$('rec').classList.add('hide');return}
  if(!selectionReady()){cur=null;$('rec').replaceChildren();$('rec').classList.add('hide');return}
  const available=d.tasks.filter(ok),eligible=available.filter(t=>!recommendationSkipped.has(t.id));
  const previousId=avoidId??cur?.id,easy=eligible.filter(t=>!activityRequirements(t).uninterrupted);
  const candidates=conditions.interrupted&&easy.length?easy:eligible,current=candidates.find(t=>t.id===previousId);
  if(keepCurrent&&current)cur=current;
  else{
    const alternatives=eligible.length>1?eligible.filter(t=>t.id!==previousId):eligible;
    const easier=conditions.interrupted?alternatives.filter(t=>!activityRequirements(t).uninterrupted):[];
    const pool=easier.length?easier:alternatives;
    cur=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
  }
  const b=$('rec');b.classList.remove('is-editing');
  if(!cur){
    nextStepEditor=null;const content=textElement('div','','recommendation-empty');
    if(available.length){
      content.append(textElement('h2',tr('这轮先到这里')),textElement('p',tr('暂时没有想做的，也没关系。')),
        actionButton(tr('自己选一件'),()=>page('tasks'),'primary'),actionButton(tr('重新看看'),restartRecommendations,'quiet-link'));
    }else{b.replaceChildren(textElement('p',tr('没有符合当前条件的活动。')),actionButton(tr('调整条件'),()=>{$('timePicker').open=false;$('conditionsPicker').open=true;document.querySelector('#conditionsPicker > summary')?.focus()},'primary'));b.classList.remove('hide');return}
    b.replaceChildren(content);b.classList.remove('hide');return;
  }
  if(nextStepEditor&&nextStepEditor.taskId!==cur.id)nextStepEditor=null;
  const id=cur.id,editing=nextStepEditor?.taskId===id;
  const name=textElement('h2',cur.name,'user-text');name.title=cur.name;name.id='recommendedTaskName';
  const more=actionButton('⋯',null,'recommendation-more','recommendationMore');
  more.setAttribute('aria-label',tr('{name}，更多操作',{name:cur.name}));more.setAttribute('aria-haspopup','menu');more.setAttribute('aria-controls','recommendationMenu');more.setAttribute('aria-expanded','false');
  more.onclick=event=>toggleRecommendationMenu(id,more,event?.pointerType==='mouse');
  bindMenuHover(more,'recommendationMenu',()=>openRecommendationMenu(id,more,false),()=>closeRecommendationMenu(),()=>recommendationMenuContext?.anchor===more);
  b.replaceChildren(more,name);
  if(editing){
    b.classList.add('is-editing');const form=document.createElement('form');form.id='nextStepForm';form.className='next-step-editor';
    const label=textElement('label',tr('下一步（可选）'));label.setAttribute('for','nextStepInput');
    const input=document.createElement('input');input.id='nextStepInput';input.type='text';input.maxLength=200;input.value=nextStepEditor.draft;input.placeholder=tr('从哪一小步开始？');input.autocomplete='off';
    input.oninput=()=>{if(nextStepEditor?.taskId===id)nextStepEditor.draft=input.value};
    const controls=textElement('div','','next-step-actions');
    controls.append(actionButton(tr('取消'),cancelNextStep,'quiet-link','cancelNextStep'));
    const submit=textElement('button',tr('保存'),'primary');submit.type='submit';submit.id='saveNextStep';controls.append(submit);
    form.append(label,input,controls);form.onsubmit=event=>{event.preventDefault();saveNextStep(id,input.value)};b.append(form);
  }else{
    if(cur.nextStep){const step=textElement('div','','recommendation-step');step.append(textElement('p',tr('下一步'),'next-step-label'),textElement('p',cur.nextStep,'next-step-copy user-text'));b.append(step)}
    const actions=textElement('div','','actions');actions.id='recommendationActions';
    const begin=actionButton(tr('开始'),()=>startRecommendation(id),'primary','start'),play=textElement('span','','play-icon');play.setAttribute('aria-hidden','true');begin.replaceChildren(play,textElement('span',tr('开始')));
    recommendationChange.classList.toggle('hide',available.length<2);actions.append(begin,recommendationChange);b.append(actions);
    if(cur.description){const description=textElement('details','','recommendation-details');description.append(textElement('summary',tr('活动说明')),textElement('p',cur.description,'muted user-text'));b.append(description)}
  }
  b.classList.remove('hide');
}
recommendationChange.onclick=recommendAndReveal;
function editNextStep(id){
  const task=d.tasks.find(t=>t.id===id);if(!task||cur?.id!==id)return;
  closeRecommendationMenu();nextStepEditor={taskId:id,draft:task.nextStep||''};random({keepCurrent:true});$('nextStepInput')?.focus({preventScroll:true});
}
function cancelNextStep(){nextStepEditor=null;random({keepCurrent:true});$('recommendationMore')?.focus({preventScroll:true})}
function saveNextStep(id,value){
  const task=d.tasks.find(t=>t.id===id);if(!task||nextStepEditor?.taskId!==id)return false;
  const nextStep=value.trim();nextStepEditor.draft=value;
  if(nextStep.length>200){notify(tr('下一步最多 200 个字符。'));return false}
  d.tasks=d.tasks.map(t=>t.id===id?{...t,nextStep,updatedAt:new Date().toISOString()}:t);
  if(!save())return false;
  nextStepEditor=null;random({keepCurrent:true});$('start')?.focus({preventScroll:true});return true;
}
function closeRecommendationMenu({restoreFocus=false}={}){
  cancelMenuClose('recommendationMenu');const anchor=recommendationMenuContext?.anchor;recommendationMenuContext=null;
  $('recommendationMenu').classList.add('hide');anchor?.setAttribute('aria-expanded','false');
  if(restoreFocus&&anchor?.isConnected)anchor.focus({preventScroll:true});
}
function openRecommendationMenu(id,anchor,focus=true){
  if(!anchor.isConnected||cur?.id!==id)return;
  closeActivityMenu();closeRecommendationMenu();recommendationMenuContext={id,anchor};
  showSideMenu('recommendationMenu',anchor);if(focus)$('recommendationMenuEdit').focus({preventScroll:true});
}
function toggleRecommendationMenu(id,anchor,mouse=false){
  if(recommendationMenuContext?.anchor===anchor){if(!mouse)closeRecommendationMenu({restoreFocus:true});return}
  openRecommendationMenu(id,anchor,!mouse);
}
$('recommendationMenuEdit').onclick=()=>{const id=recommendationMenuContext?.id;if(id)editNextStep(id)};

function run(t){const starting=!timerState();cur=t;startTimer(t);if(starting)$('timerDescription').open=false;if(!$('timer').classList.contains('hide'))($('pauseTimer')||$('extendTimer'))?.focus({preventScroll:true})}
const TIMER_CHECKPOINT_MS=5000,TIMER_LONG_PAUSE_MS=60*60*1000,TIMER_UNOBSERVED_MS=2*60*1000;
let timerTick=null,timerAudio=null,timerPauseWatch=null,timerBackgroundAt=0;
let timerView='full';
function createTimerState(t,plannedMs,now=Date.now()){
  return{timerVersion:2,completionId:'c'+now+Math.random().toString(36).slice(2),taskId:t.id,task:{...t},taskName:t.name,goalId:t.goalId,goalName:gn(t.goalId)?.name||'',plannedDurationMs:plannedMs,durationMs:plannedMs,extensionDurationMs:0,elapsed:0,lastStarted:now,startedAt:now,checkpointAt:now,paused:false,finished:false,soundPlayed:false,pausedDurationMs:0,pauseStartedAt:0};
}
function startTimer(t){
  if(timerState()){showFullTimer();return}
  if(!t||d.tasks.some(x=>x.id===t.id&&x.enabled===false))return;
  if(!selectionReady()){page('home');$('timePicker').open=true;$('customMinutes').focus({preventScroll:true});notify(tr('请先选择本次可用时间。'));return}
  primeTimerAudio();if(!setTimerState(createTimerState(t,time*60000)))return;
  clearTimeout(timerPauseWatch);timerView='full';renderTimer();startTimerLoop();
}
function primeTimerAudio(){try{if(!timerAudio)timerAudio=new (window.AudioContext||window.webkitAudioContext)();if(timerAudio.state==='suspended')timerAudio.resume()}catch(e){timerAudio=null}}
function playTimeUpSound(x){if(!x||x.soundPlayed)return;x.soundPlayed=true;if(!setTimerState(x))return;try{primeTimerAudio();if(!timerAudio)return;let now=timerAudio.currentTime+0.03,gain=timerAudio.createGain();gain.gain.setValueAtTime(0.0001,now);gain.gain.linearRampToValueAtTime(0.075,now+0.18);gain.gain.exponentialRampToValueAtTime(0.0001,now+2.2);gain.connect(timerAudio.destination);[523.25,659.25,783.99].forEach((freq,i)=>{let osc=timerAudio.createOscillator();osc.type='sine';osc.frequency.value=freq;osc.connect(gain);osc.start(now+i*0.28);osc.stop(now+i*0.28+1.8)});setTimeout(()=>gain.disconnect(),2600)}catch(e){}}
function validateTimer(x){
  if(!x||typeof x!=='object'||Array.isArray(x)||typeof x.taskId!=='string'||!x.taskId||!Number.isFinite(x.durationMs)||x.durationMs<=0||!Number.isFinite(x.elapsed)||x.elapsed<0||!Number.isFinite(x.lastStarted)||x.lastStarted<0||typeof x.paused!=='boolean'||typeof x.finished!=='boolean')throw Error(tr('进行中的计时数据无效'));
  if(x.task!==undefined&&(!x.task||typeof x.task!=='object'||typeof x.task.name!=='string'))throw Error(tr('计时任务快照无效'));
  if(x.timerVersion!==undefined&&x.timerVersion!==2)throw Error(tr('进行中的计时数据无效'));
  for(const key of ['checkpointAt','stoppedAt','timeUpAt'])if(x[key]!==undefined&&(!Number.isFinite(x[key])||x[key]<0))throw Error(tr('进行中的计时数据无效'));
  if(x.recoveryReason!==undefined&&!['reopen','long','interrupted','legacy'].includes(x.recoveryReason))throw Error(tr('进行中的计时数据无效'));
  for(const key of ['resumeAsNew','needsElapsedConfirmation'])if(x[key]!==undefined&&typeof x[key]!=='boolean')throw Error(tr('进行中的计时数据无效'));
  return x;
}
function timerState(){
  if(storageBlocked)return null;
  try{let raw=localStorage.getItem('activeTimer');originalTimer=raw;if(raw===null||raw==='')return null;let x=validateTimer(JSON.parse(raw));if(!x.completionId)x.completionId='legacy-'+x.taskId+'-'+x.lastStarted;return x}
  catch(e){stopTimerLoop();protectData(tr('无法读取活动计时：{error}。原始计时数据未更改。',{error:e.message}));return null}
}
function setTimerState(x){
  if(storageBlocked)return false;
  try{if(x)localStorage.setItem('activeTimer',JSON.stringify(x));else localStorage.removeItem('activeTimer');clearStorageFailure('activeTimer');return true}
  catch(e){storageFailure('activeTimer',e);return false}
}
function stopTimerLoop(){if(timerTick){clearInterval(timerTick);timerTick=null}}
function plannedDurationMs(x){return Number.isFinite(x.plannedDurationMs)?x.plannedDurationMs:Math.max(0,x.durationMs-(x.extensionDurationMs||0))}
function extensionStepMs(x){return Math.max(1,Math.round(plannedDurationMs(x)/120000))*60000}
function activeElapsedMs(x,now=Date.now()){return Math.min(x.durationMs,Math.max(0,x.elapsed+(x.paused||x.finished||x.recoveryReason?0:Math.max(0,now-x.lastStarted))))}
function elapsedMs(x,now=Date.now()){return activeElapsedMs(x,now)}
function remainingMs(x,now=Date.now()){return Math.max(0,x.durationMs-elapsedMs(x,now))}
function formatClock(ms){let n=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(n/60),s=n%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function timerTask(x){return x&&(d.tasks.find(t=>t.id===x.taskId)||x.task)}
function longTimerPause(x,now=Date.now()){
  const reference=x.recoveryReason?x.stoppedAt:x.finished?x.timeUpAt:x.paused?x.pauseStartedAt:null;
  return Number.isFinite(reference)&&reference>0&&now-reference>=TIMER_LONG_PAUSE_MS;
}
function unobservedTimerGap(x,now=Date.now()){
  const gap=now-(x.checkpointAt??x.lastStarted);
  return x.timerVersion===2&&gap>(timerBackgroundAt?TIMER_LONG_PAUSE_MS:TIMER_UNOBSERVED_MS);
}
function watchPausedTimer(x){
  clearTimeout(timerPauseWatch);if(!x||x.recoveryReason||(!x.paused&&!x.finished))return;
  const reference=x.finished?x.timeUpAt:x.pauseStartedAt;if(!Number.isFinite(reference)||reference<=0)return;
  timerPauseWatch=setTimeout(()=>{const current=timerState();if(current?.completionId===x.completionId&&longTimerPause(current)){suspendTimer('long',Date.now(),false);renderTimer()}},Math.max(0,reference+TIMER_LONG_PAUSE_MS-Date.now()));
}
function suspendTimer(reason='reopen',now=Date.now(),trustCurrent=true){
  let x=timerState();if(!x)return true;stopTimerLoop();clearTimeout(timerPauseWatch);
  const already=!!x.recoveryReason,wasLong=longTimerPause(x,now);
  if(already){if(wasLong&&!x.resumeAsNew){x.resumeAsNew=true;return setTimerState(x)}return true}
  const legacy=x.timerVersion!==2;
  if(legacy){x.legacyTimerSnapshot=JSON.parse(JSON.stringify(x));x.needsElapsedConfirmation=(!x.paused&&!x.finished)||x.elapsed>plannedDurationMs(x)}
  if(x.finished){
    x.elapsed=Math.min(x.durationMs,x.elapsed);x.stoppedAt=x.timeUpAt??Math.min(now,(x.startedAt||now)+x.elapsed+(x.pausedDurationMs||0));
  }else if(x.paused){
    const pauseAt=x.pauseStartedAt||x.checkpointAt||now;
    if(trustCurrent&&!wasLong){x.pausedDurationMs=(x.pausedDurationMs||0)+Math.max(0,now-pauseAt);x.stoppedAt=now}
    else x.stoppedAt=pauseAt;
  }else{
    const deadline=x.lastStarted+Math.max(0,x.durationMs-x.elapsed);
    if(trustCurrent&&!unobservedTimerGap(x,now)){x.elapsed=elapsedMs(x,now);x.stoppedAt=Math.min(now,deadline)}
    else x.stoppedAt=x.checkpointAt??x.lastStarted??now;
  }
  x.timerVersion=2;x.recoveryReason=legacy&&x.needsElapsedConfirmation?'legacy':reason;
  x.resumeAsNew=reason==='long'||wasLong||now-x.stoppedAt>=TIMER_LONG_PAUSE_MS;
  x.paused=true;x.lastStarted=0;x.pauseStartedAt=now;x.checkpointAt=now;
  return setTimerState(x);
}
function advanceTimerIfNeeded(x,now=Date.now()){
  if(!x||x.paused||x.finished||x.recoveryReason||timerState()?.completionId!==x.completionId)return false;
  if(d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){setTimerState(null);return false}
  if(unobservedTimerGap(x,now)){suspendTimer('interrupted',now,false);return true}
  if(elapsedMs(x,now)<x.durationMs)return false;
  x.timeUpAt=x.lastStarted+Math.max(0,x.durationMs-x.elapsed);x.elapsed=x.durationMs;x.lastStarted=0;x.finished=true;x.checkpointAt=x.timeUpAt;
  if(!setTimerState(x))return false;
  stopTimerLoop();watchPausedTimer(x);playTimeUpSound(x);return true;
}
function checkpointTimer(force=false,now=Date.now()){
  const x=timerState();if(!x||x.paused||x.finished||x.recoveryReason)return true;
  if(advanceTimerIfNeeded(x,now))return !storageFailures.has('activeTimer');
  if(!force&&now-(x.checkpointAt??x.lastStarted)<TIMER_CHECKPOINT_MS)return true;
  x.elapsed=elapsedMs(x,now);x.lastStarted=now;x.checkpointAt=now;return setTimerState(x);
}
function startTimerLoop(){
  stopTimerLoop();clearTimeout(timerPauseWatch);
  timerTick=setInterval(()=>{const x=timerState();if(!x){stopTimerLoop();return}if(x.paused||x.finished||x.recoveryReason){stopTimerLoop();watchPausedTimer(x);renderTimer();return}checkpointTimer();renderTimer()},250);
}
function recoveryUsesNewSession(x){return x.resumeAsNew||d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)}
function renderTimerRecovery(x,t){
  const asNew=recoveryUsesNewSession(x);
  $('timerRecoveryName').textContent=t.name;
  $('timerRecoveryStatus').textContent=tr(asNew?'已暂停很久':x.recoveryReason==='interrupted'?'计时已中断':'等待恢复');
  $('timerRecoveryLabel').textContent=tr(asNew?'上次已投入':'已投入');
  $('timerRecoverySpent').textContent=x.needsElapsedConfirmation?'—':formatDuration(x.elapsed);
  $('timerRecoveryRange').classList.toggle('hide',!asNew||!!x.needsElapsedConfirmation);
  $('timerRecoveryRange').textContent=formatDateTime(x.startedAt)+' – '+formatDateTime(x.stoppedAt);
  $('timerRecoveryNote').textContent=tr(x.needsElapsedConfirmation?'旧计时缺少可靠进度，请确认实际用时。':asNew?'接着做时，上次用时会单独记录。新的这一段重新计时。':'离开期间未计入用时。');
  $('timerRecoveryLegacy').classList.toggle('hide',!x.needsElapsedConfirmation);
  if($('timerRecovery').dataset.completionId!==x.completionId){$('recoveryMinutes').value=x.needsElapsedConfirmation&&x.elapsed?String(Math.round(x.elapsed/600)/100):'';$('recoveryError').textContent='';$('timerRecovery').dataset.completionId=x.completionId}
  $('recoverTimer').textContent=tr(asNew?'接着做':'继续本次');
}
function renderTimer(){
  let x=timerState();
  if(x&&!x.recoveryReason&&longTimerPause(x)){suspendTimer('long',Date.now(),false);x=timerState()}
  if(!x||(!x.recoveryReason&&d.completed.some(c=>(c.completionId||c.recordId)===x.completionId))){
    $('timer').classList.add('hide');$('floatingTimer').classList.add('hide');$('timerActions').replaceChildren();$('timerActions').dataset.mode='';stopTimerLoop();clearTimeout(timerPauseWatch);syncDialogState();return;
  }
  const t=timerTask(x);if(!t){protectData(tr('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。'));return}
  const now=Date.now(),recovering=!!x.recoveryReason,left=remainingMs(x,now),extensionMs=x.extensionDurationMs||0;
  $('timer').classList.toggle('hide',timerView!=='full');$('floatingTimer').classList.toggle('hide',timerView!=='floating');
  $('timerStandard').classList.toggle('hide',recovering);$('timerRecovery').classList.toggle('hide',!recovering);
  $('timerName').textContent=t.name;$('timerDesc').textContent=t.description||'';$('timerDescription').classList.toggle('hide',!t.description);
  $('timerClock').textContent=formatClock(left);$('timerProgress').style.width=Math.min(100,elapsedMs(x,now)/x.durationMs*100)+'%';
  $('timerMeta').textContent=x.finished?tr('本轮已投入 {duration}',{duration:formatDuration(x.elapsed)}):tr('计划 {duration}',{duration:formatDuration(plannedDurationMs(x))})+(extensionMs?tr(' · 已追加 {duration}',{duration:formatDuration(extensionMs)}):'');
  $('floatingClock').textContent=recovering?formatClock(x.elapsed):$('timerClock').textContent;
  $('floatingPaused').classList.toggle('hide',!x.paused&&!recovering);
  $('floatingTimer').setAttribute('aria-label',tr('{status} {time}，返回开始页的当前计时',{status:recovering?tr('等待恢复'):x.finished?tr('时间到了'):x.paused?tr('已暂停'):tr('剩余时间'),time:$('floatingClock').textContent}));
  if(timerView==='floating')positionFloatingTimer();
  $('timerStatus').textContent=x.finished?tr('时间到了'):x.paused?tr('已暂停'):tr('正在专注');
  const mode=recovering?'recovery':x.finished?'finished':x.paused?'paused':'running',actions=$('timerActions'),focusId=document.activeElement?.id;
  if(mode==='recovery'){actions.replaceChildren();actions.dataset.mode=mode;renderTimerRecovery(x,t)}
  else if(actions.dataset.mode!==mode){
    actions.dataset.mode=mode;
    if(mode==='finished'){
      actions.innerHTML='<button type="button" class="primary" id="extendTimer"></button><button type="button" class="outline" id="finishTimer"></button>';
      $('extendTimer').textContent=tr('继续');$('extendTimer').onclick=extendTimer;$('finishTimer').textContent=tr('结束并记录');$('finishTimer').onclick=()=>finishTimer(x.completionId);
    }else{
      actions.innerHTML='<button type="button" class="primary" id="pauseTimer"></button><button type="button" class="outline" id="earlyTimer"></button>';
      $('pauseTimer').textContent=x.paused?tr('继续'):tr('暂停');$('pauseTimer').onclick=()=>{const y=timerState();if(!y)return;y.paused?resumeTimer():pauseTimer()};$('earlyTimer').textContent=tr('结束');$('earlyTimer').onclick=()=>finishTimer(x.completionId);
    }
    if(['pauseTimer','earlyTimer','finishTimer','extendTimer'].includes(focusId))$(focusId)?.focus({preventScroll:true});
  }
  $('timerWaitingNote').classList.toggle('hide',!x.finished||recovering);
  syncDialogState();
}
function confirmRecoveryElapsed(x){
  if(!x.needsElapsedConfirmation)return x;
  const raw=$('recoveryMinutes').value.trim(),minutes=Number(raw);
  if(!raw||!Number.isFinite(minutes)||minutes<0||minutes>1440){$('recoveryError').textContent=tr('请输入 0–1440 分钟的实际用时。');$('recoveryMinutes').focus();return null}
  x.elapsed=Math.round(minutes*60000);x.plannedDurationMs=plannedDurationMs(x);x.durationMs=Math.max(x.plannedDurationMs,x.elapsed);x.extensionDurationMs=Math.max(0,x.durationMs-x.plannedDurationMs);x.needsElapsedConfirmation=false;
  x.stoppedAt=Math.max(x.stoppedAt||0,Math.min(Date.now(),(x.startedAt||Date.now())+x.elapsed+(x.pausedDurationMs||0)));return x;
}
function resumeRecoveredTimer(){
  let x=timerState();if(!x?.recoveryReason)return false;
  if(longTimerPause(x))x.resumeAsNew=true;
  x=confirmRecoveryElapsed(x);if(!x)return false;
  if(recoveryUsesNewSession(x))return finishTimer(x.completionId,{restart:true,confirmedState:x});
  const now=Date.now();delete x.recoveryReason;x.paused=false;x.pauseStartedAt=0;x.lastStarted=now;x.checkpointAt=now;
  if(x.elapsed>=x.durationMs){x.finished=true;x.timeUpAt=x.stoppedAt;if(!setTimerState(x))return false;extendTimer();return true}
  x.finished=false;if(!setTimerState(x))return false;primeTimerAudio();renderTimer();startTimerLoop();return true;
}
$('recoverTimer').onclick=resumeRecoveredTimer;
$('discardRecoveryTimer').onclick=()=>{if(timerState()?.recoveryReason)giveUpTimer()};
$('finishRecoveryTimer').onclick=()=>{const x=timerState();if(x?.recoveryReason)finishTimer(x.completionId)};

function showFullTimer(){timerView='full';renderTimer();const x=timerState();(x?.recoveryReason?$('recoverTimer'):x?.finished?$('extendTimer'):$('pauseTimer'))?.focus({preventScroll:true})}
function positionFloatingTimer(){
  const box=$('floatingTimer');if(box.classList.contains('hide'))return;
  const viewport=window.visualViewport||{width:window.innerWidth,height:window.innerHeight,offsetLeft:0,offsetTop:0};
  const margin=window.innerWidth<=600?16:32,left=viewport.offsetLeft||0,top=viewport.offsetTop||0;
  box.style.maxWidth=Math.max(0,viewport.width-2*margin)+'px';
  box.style.maxHeight=Math.max(0,viewport.height-2*margin)+'px';
  const rect=box.getBoundingClientRect();
  box.style.left=Math.max(left+margin,left+viewport.width-margin-rect.width)+'px';
  box.style.top=Math.max(top+margin,top+viewport.height-margin-rect.height)+'px';
  box.style.right='auto';box.style.bottom='auto';
}
function setupFloatingTimer(){
  $('floatingTimer').onclick=()=>{if(timerState())page('home')};
  window.addEventListener('resize',positionFloatingTimer);
  window.visualViewport?.addEventListener('resize',positionFloatingTimer);
  window.visualViewport?.addEventListener('scroll',positionFloatingTimer);
}
function discardTimer(){
  if(!setTimerState(null))return;
  closeConfirm();stopTimerLoop();clearTimeout(timerPauseWatch);cur=null;renderTimer();page('home');
}
function pauseTimer(){
  let x=timerState();if(!x||x.finished||x.recoveryReason||x.paused)return;
  const now=Date.now();advanceTimerIfNeeded(x,now);x=timerState();if(!x||x.finished||x.recoveryReason)return;
  x.elapsed=elapsedMs(x,now);x.paused=true;x.pauseStartedAt=now;x.lastStarted=0;x.checkpointAt=now;
  if(!setTimerState(x))return;stopTimerLoop();watchPausedTimer(x);renderTimer();
}
function resumeTimer(){
  let x=timerState();if(!x||x.finished||!x.paused||x.recoveryReason)return;
  const now=Date.now();if(longTimerPause(x,now)){suspendTimer('long',now,false);renderTimer();return}
  if(x.pauseStartedAt>0)x.pausedDurationMs=(x.pausedDurationMs||0)+Math.max(0,now-x.pauseStartedAt);
  x.pauseStartedAt=0;x.paused=false;x.lastStarted=now;x.checkpointAt=now;if(!setTimerState(x))return;
  clearTimeout(timerPauseWatch);renderTimer();startTimerLoop();
}
function closeConfirm(){pendingImport=null;$('confirmAbandon').classList.add('hide');$('confirmAbandon').onclick=null;$('confirmLayer').classList.add('hide');syncDialogState();restoreDialogFocus('confirmLayer')}
function giveUpTimer(){openConfirm('giveup')}
function openConfirm(type,id){
  rememberDialogFocus('confirmLayer');
  $('confirmAbandon').classList.add('hide');$('confirmAbandon').onclick=null;
  let isDelete=type==='delete',task=isDelete?d.tasks.find(t=>t.id===id):(timerState()?timerTask(timerState()):null);
  $('confirmKicker').textContent=isDelete?tr('删除任务？'):type==='early'?tr('结束本次执行？'):type==='import'?tr('导入备份？'):tr('放弃本次执行？');
  $('confirmTitle').textContent=isDelete?tr('确定删除这个任务吗？'):type==='early'?tr('已经完成本次执行了吗？'):type==='import'?tr('用备份替换当前任务、记录和设置？'):tr('确定放弃本次执行吗？');
  $('confirmText').textContent=isDelete?tr('删除后任务将不再出现在任务库中，已有学习记录仍会保留。建议先导出数据备份。'):type==='early'?tr('确认后记录本次实际用时，任务仍会保留，可以再次执行。'):type==='import'?tr('导入前已校验备份结构；现有任务、完成记录、偏好、主题及其他主数据将被替换，兼容保留的旧目标数据也将被替换。当前活动计时保持不变，不随备份导入。'):tr('当前计时不会计入完成记录，任务仍会保留。');
  $('confirmTaskName').textContent=type==='import'?tr('备份数据将替换当前本地数据。'):task?.name||'';
  $('confirmTaskDesc').textContent=task?.description||'';
  $('confirmCancel').textContent=isDelete||type==='import'||type==='giveup'&&timerState()?.recoveryReason?tr('取消'):tr('继续计时');
  $('confirmAccept').textContent=isDelete?tr('删除任务'):type==='early'?tr('✓ 完成本次执行'):type==='import'?tr('确认导入'):tr('放弃本次执行');
  $('confirmAccept').className=isDelete||type==='giveup'?'danger':'primary';
  $('confirmAccept').onclick=isDelete?()=>{d.tasks=d.tasks.filter(t=>t.id!==id);if(!save())return;closeConfirm();tasks();random({keepCurrent:true})}:type==='early'?()=>{closeConfirm();finishTimer()}:type==='import'?applyImport:discardTimer;
  $('confirmCancel').onclick=closeConfirm;$('confirmLayer').classList.remove('hide');syncDialogState();$('confirmCancel').focus();
}
function confirmEarly(){return finishTimer()}
function finishTimer(expectedCompletionId,{restart=false,confirmedState=null}={}){
  let x=timerState();
  if(!x||(expectedCompletionId!==undefined&&x.completionId!==expectedCompletionId))return false;
  if(!x.recoveryReason&&(longTimerPause(x)||(!x.paused&&!x.finished&&unobservedTimerGap(x)))){if(!suspendTimer(longTimerPause(x)?'long':'interrupted',Date.now(),false))return false;x=timerState()}
  if(confirmedState&&confirmedState.completionId===x.completionId)x=confirmedState;
  x=confirmRecoveryElapsed(x);if(!x)return false;
  const task=timerTask(x),nextTask=restart?d.tasks.find(t=>t.id===x.taskId&&t.enabled!==false):null;
  if(!task){protectData(tr('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。'));return false}
  if(restart&&!nextTask){notify(tr('这项活动已不存在，请结束并记录。'));return false}
  let record=d.completed.find(c=>(c.completionId||c.recordId)===x.completionId);
  if(!record){
    const now=Date.now(),actualMs=elapsedMs(x,now);
    const boundary=x.recoveryReason?x.stoppedAt:x.finished?(x.timeUpAt??x.checkpointAt):!x.paused&&actualMs>=x.durationMs?x.lastStarted+Math.max(0,x.durationMs-x.elapsed):now;
    const endedAt=Math.max(x.startedAt||0,Number.isFinite(boundary)?boundary:now);
    const pausedMs=(x.pausedDurationMs||0)+(!x.recoveryReason&&!x.finished&&x.paused&&x.pauseStartedAt>0?Math.max(0,endedAt-x.pauseStartedAt):0);
    const plannedMs=plannedDurationMs(x),extensionMs=x.extensionDurationMs||0,goalId=x.goalId||x.task?.goalId||task.goalId;
    const actual=Math.round(actualMs/600)/100,stamp=new Date(endedAt).toISOString();
    record={recordId:x.completionId,completionId:x.completionId,taskId:x.taskId,taskName:x.taskName||x.task?.name||task.name,
      goalId,goalName:x.goalName||gn(goalId)?.name||'',startedAt:Number.isFinite(x.startedAt)?x.startedAt:null,endedAt,completedAt:stamp,date:stamp,
      plannedDuration:plannedMs/60000,actualDurationMs:actualMs,actualDuration:actual,minutes:actual,
      pausedDurationMs:pausedMs,extensionDurationMs:extensionMs,extensionDuration:extensionMs/60000};
    if(x.legacyTimerSnapshot)record.timerRecoveryOriginal=x.legacyTimerSnapshot;
    d.completed.push(record);if(!save())return false;
  }
  stopTimerLoop();clearTimeout(timerPauseWatch);
  // The history commit is idempotent. Replacing the active state is a second
  // atomic write; if it fails, retry never appends the old segment twice.
  if(restart){
    const plannedMs=selectionReady()?time*60000:plannedDurationMs(x);
    if(!setTimerState(createTimerState(nextTask,plannedMs))){renderTimer();return false}
    cur=nextTask;timerView='full';primeTimerAudio();renderTimer();startTimerLoop();page('home');return true;
  }
  if(!setTimerState(null)){renderTimer();return false}
  cur=null;recommendationSkipped.clear();nextStepEditor=null;renderTimer();page('home',{avoidActivityId:x.taskId});
  notify(tr('已记录 {duration}',{duration:formatDuration(recordDurationMs(record))}));$('start')?.focus({preventScroll:true});return true;
}

function extendTimer(){
  let x=timerState();if(!x||!x.finished||x.recoveryReason)return;
  if(longTimerPause(x)){suspendTimer('long',Date.now(),false);renderTimer();return}
  const now=Date.now(),extensionMs=extensionStepMs(x);x.plannedDurationMs=plannedDurationMs(x);x.extensionDurationMs=(x.extensionDurationMs||0)+extensionMs;x.durationMs=x.plannedDurationMs+x.extensionDurationMs;
  x.finished=false;x.paused=false;x.soundPlayed=false;x.lastStarted=now;x.pauseStartedAt=0;x.checkpointAt=now;delete x.timeUpAt;
  if(!setTimerState(x))return;clearTimeout(timerPauseWatch);renderTimer();startTimerLoop();
}
function notify(message){let n=$('appNotice');if(!n){n=document.createElement('div');n.id='appNotice';n.setAttribute('role','status');n.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;background:var(--t);color:var(--s);padding:10px 16px;border-radius:10px;box-shadow:0 8px 24px #0003;max-width:calc(100% - 32px)';document.body.append(n)}n.textContent=message;n.classList.remove('hide');clearTimeout(n.timer);n.timer=setTimeout(()=>n.classList.add('hide'),3200)}
function validateImport(x){return migrateData(x)}
function applyImport(){
  if(storageBlocked||!pendingImport)return;
  let candidate,previousRaw,previousData=d,previousSnapshot=dataSnapshot,previousPage=location.hash.slice(1)||'home';
  try{candidate=validateImport(pendingImport);previousRaw=localStorage.getItem('whatToDoData')}
  catch(e){notify(tr('导入未完成，原数据未更改：{error}',{error:e.message}));return}
  // A single Storage write commits the whole main document. Do not touch activeTimer.
  if(!save(candidate))return;
  try{
    d=candidate;recommendationSkipped.clear();nextStepEditor=null;syncRuntimePreferences();page('home');closeConfirm();notify(tr('备份数据已导入。'));
  }catch(e){
    d=previousData;dataSnapshot=previousSnapshot;
    try{
      if(previousRaw===null)localStorage.removeItem('whatToDoData');else localStorage.setItem('whatToDoData',previousRaw);originalMain=previousRaw;
      syncRuntimePreferences();closeConfirm();page(previousPage);notify(tr('导入未完成，已恢复导入前的数据。'));
    }catch(rollbackError){
      originalMain=previousRaw;
      protectData(tr('导入后的界面同步失败，恢复操作也遇到错误。已停止后续写入；请导出原始主数据并重新加载检查。'));
    }
  }
}
let importRequest=0;
$('file').addEventListener('change',e=>{
  e.preventDefault();e.stopImmediatePropagation();if(storageBlocked)return;
  let f=e.target.files?.[0];if(!f)return;
  closeConfirm();let request=++importRequest;
  const fail=message=>{if(request!==importRequest)return;pendingImport=null;notify(message);e.target.value=''};
  try{
    let r=new FileReader();
    r.onload=()=>{if(request!==importRequest)return;try{pendingImport=validateImport(JSON.parse(r.result));openConfirm('import')}catch(err){fail(err.message||tr('JSON 格式不正确，现有数据未更改。'))}e.target.value=''};
    r.onerror=()=>fail(tr('无法读取文件，现有数据未更改。'));
    r.readAsText(f);
  }catch(err){fail(tr('无法读取文件，现有数据未更改。'))}
},true);
function saveActivity({id='',name,requirements={computer:false,audio:false,speech:false,uninterrupted:false},description=''}){
  name=name.trim();
  if(!name||!requirements||REQUIREMENT_KEYS.some(k=>typeof requirements[k]!=='boolean')){notify(tr('请填写活动名称并检查需要的条件。'));return false}
  let old=d.tasks.find(t=>t.id===id),now=new Date().toISOString();
  if(id&&!old){notify(tr('这项活动已不存在，请重新选择。'));return false}
  let t={...old,id:id||'t'+Date.now()+Math.random().toString(36).slice(2,8),name,requirements:{...old?.requirements,...requirements},description:description.trim(),createdAt:old?.createdAt||now,updatedAt:now,enabled:old?.enabled!==false};
  if(id)d.tasks=d.tasks.map(x=>x.id===id?t:x);else d.tasks.push(t);
  if(!save())return false;
  closeActivity();tasks();
  if(!old&&ok(t))cur=t;
  random({keepCurrent:true});notify(tr('活动已保存。'));return true;
}
$('form').addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();saveActivity({id:$('tid').value,name:$('name').value,requirements:{computer:$('computer').checked,audio:$('requiresAudio').checked,speech:$('requiresSpeech').checked,uninterrupted:$('requiresUninterrupted').checked},description:$('desc').value})},true);
$('quickAddForm').addEventListener('submit',e=>{e.preventDefault();if(saveActivity({name:$('quickName').value})){$('quickName').value='';$('start')?.focus({preventScroll:true})}});
function restoreTimer(){
  const x=timerState();if(!x)return;
  if(!timerTask(x)){protectData(tr('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。'));return}
  if(d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){setTimerState(null);return}
  if(x.timerVersion===2&&x.finished&&!x.recoveryReason&&!longTimerPause(x)){renderTimer();watchPausedTimer(x);return}
  suspendTimer('reopen',Date.now(),false);renderTimer();
}
function nativeTimerLifecycle(event){
  if(storageBlocked)return false;
  if(event==='close'||event==='sleep'){const result=suspendTimer(event==='sleep'?'interrupted':'reopen');renderTimer();return result}
  if(event==='background'){const result=checkpointTimer(true);timerBackgroundAt=Date.now();return result}
  if(event==='checkpoint')return checkpointTimer(true);
  if(event==='resume'){
    const x=timerState();if(x&&!x.recoveryReason){if(longTimerPause(x))suspendTimer('long',Date.now(),false);else checkpointTimer(true)}
    timerBackgroundAt=0;renderTimer();return true;
  }
  return false;
}
document.addEventListener('visibilitychange',()=>nativeTimerLifecycle(document.hidden?'background':'resume'));
document.addEventListener('freeze',()=>nativeTimerLifecycle('sleep'));
window.addEventListener('pagehide',()=>nativeTimerLifecycle('close'));
window.addEventListener('pageshow',event=>{if(event.persisted)nativeTimerLifecycle('resume')});

function tasks(){
  closeActivityMenu();
  const hasActivities=d.tasks.some(t=>t.enabled!==false);
  if(!hasActivities)setActivitySearch(false,{render:false});
  const query=$('taskSearch').value.trim().toLocaleLowerCase();
  $('toggleActivitySearch').classList.toggle('hide',!hasActivities);
  let a=d.tasks.filter(t=>t.enabled!==false&&(!query||(t.name+' '+(t.description||'')+' '+(t.nextStep||'')).toLocaleLowerCase().includes(query)));
  const expanded=new Set([...document.querySelectorAll('#taskList details[open]')].map(el=>el.dataset.taskId));
  let cards=a.map((t,i)=>{
    let card=textElement('details','','activity-item'),summary=document.createElement('summary'),content=textElement('div','','activity-content'),meta=textElement('div','','meta');
    card.dataset.taskId=t.id;card.open=expanded.has(t.id);
    const arrow=textElement('span','›','row-arrow');arrow.setAttribute('aria-hidden','true');
    const name=textElement('h3',t.name,'user-text');name.title=t.name;
    const label=textElement('div','','activity-label');label.append(name);
    summary.append(arrow,label);
    for(const text of requirementLabels(t))meta.append(textElement('span',text));
    for(let [action,title] of [['start',tr('开始')],['more','⋯']]){
      let button=textElement('button','','activity-action activity-action-'+action);button.type='button';button.dataset.taskAction=action;button.dataset.taskIndex=String(i);
      if(action==='start'){const play=textElement('span','▶','activity-play');play.setAttribute('aria-hidden','true');button.append(play,textElement('span',title));button.setAttribute('aria-label',tr('开始：{name}',{name:t.name}))}
      else{button.textContent=title;button.setAttribute('aria-label',tr('{name}，更多操作',{name:t.name}));button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-controls','activityMenu');button.setAttribute('aria-expanded','false');bindMenuHover(button,'activityMenu',()=>openActivityMenu(t,button,false),()=>closeActivityMenu(),()=>activityMenuContext?.anchor===button)}
      summary.append(button);
    }
    if(meta.children.length)content.append(meta);if(t.nextStep)content.append(textElement('p',tr('下一步：{step}',{step:t.nextStep}),'user-text'));if(t.description)content.append(textElement('p',t.description,'user-text'));if(!content.children.length)content.append(textElement('p',tr('未添加说明'),'muted'));card.append(summary,content);return card;
  });
  if(cards.length)$('taskList').replaceChildren(...cards);
  else{const empty=textElement('div','','empty-state');empty.append(...(d.tasks.length?[textElement('p',tr('没有找到这项活动。'),'muted'),actionButton(tr('显示全部活动'),()=>setActivitySearch(false,{restoreFocus:true}),'secondary'),actionButton(tr('添加活动'),()=>newTask(),'primary')]:emptyTaskGuide('addLibraryTask')));$('taskList').replaceChildren(empty)}
  $('taskList').onclick=e=>{let button=e.target.closest?.('button[data-task-action]');if(!button||!$('taskList').contains(button))return;e.preventDefault();let t=a[Number(button.dataset.taskIndex)];if(!t)return;if(button.dataset.taskAction==='start'){closeActivityMenu();run(t)}else toggleActivityMenu(t,button,e.pointerType==='mouse')};
}
function cancelMenuClose(id){clearTimeout(menuCloseTimers.get(id));menuCloseTimers.delete(id)}
function bindMenuHover(anchor,id,open,close,isCurrent){
  const panel=$(id);
  anchor.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')cancelMenuClose(id)});
  // Actual movement opens the menu; closing a dialog under a stationary cursor
  // must not undo Escape or Tab dismissal by generating a new pointerenter.
  anchor.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){cancelMenuClose(id);if(!isCurrent())open()}});
  anchor.addEventListener('pointerleave',event=>{
    if(event.pointerType!=='mouse'||!isCurrent()||panel.contains(event.relatedTarget))return;
    cancelMenuClose(id);menuCloseTimers.set(id,setTimeout(()=>{if(isCurrent()&&!anchor.matches(':hover')&&!panel.matches(':hover'))close()},160));
  });
}
function placeSideMenu(id,anchor){
  const menu=$(id),r=anchor.getBoundingClientRect(),view=window.visualViewport;
  const left=view?.offsetLeft||0,top=view?.offsetTop||0,right=left+(view?.width||window.innerWidth),bottom=top+(view?.height||window.innerHeight);
  if(!anchor.isConnected||r.bottom<top||r.top>bottom)return false;
  menu.style.left=left+'px';menu.style.top=top+'px';menu.style.maxHeight=Math.max(60,bottom-top-16)+'px';
  const box=menu.getBoundingClientRect(),gap=8;
  const fitsRight=r.right+gap+box.width<=right-8,fitsLeft=r.left-gap-box.width>=left+8;
  const x=fitsRight?r.right+gap:fitsLeft?r.left-gap-box.width:Math.max(left+8,Math.min(right-box.width-8,r.right-box.width));
  menu.style.left=x+'px';menu.style.top=Math.max(top+8,Math.min(bottom-box.height-8,r.top))+'px';
  menu.dataset.placement=fitsRight?'right':fitsLeft?'left':'inside';return true;
}
function showSideMenu(id,anchor){
  for(const picker of ['timePicker','conditionsPicker'])$(picker).open=false;
  const panel=$(id);panel.style.visibility='hidden';panel.classList.remove('hide');anchor.setAttribute('aria-expanded','true');
  placeSideMenu(id,anchor);panel.style.visibility='';
}
function closeActivityMenu({restoreFocus=false}={}){
  cancelMenuClose('activityMenu');const anchor=activityMenuContext?.anchor;activityMenuContext=null;
  $('activityMenu').classList.add('hide');anchor?.setAttribute('aria-expanded','false');
  if(restoreFocus&&anchor?.isConnected)anchor.focus({preventScroll:true});
}
function openActivityMenu(task,anchor,focus=true){
  if(!anchor.isConnected||!d.tasks.some(t=>t.id===task.id&&t.enabled!==false))return;
  closeRecommendationMenu();closeActivityMenu();activityMenuContext={id:task.id,anchor};
  showSideMenu('activityMenu',anchor);if(focus)$('activityMenuEdit').focus({preventScroll:true});
}
function toggleActivityMenu(task,anchor,mouse=false){
  if(activityMenuContext?.anchor===anchor){if(!mouse)closeActivityMenu({restoreFocus:true});return}
  openActivityMenu(task,anchor,!mouse);
}
function placeActivityMenu(){if(activityMenuContext&&!placeSideMenu('activityMenu',activityMenuContext.anchor))closeActivityMenu()}
function placeRecommendationMenu(){if(recommendationMenuContext&&!placeSideMenu('recommendationMenu',recommendationMenuContext.anchor))closeRecommendationMenu()}
function activityMenuAction(action){
  const task=d.tasks.find(t=>t.id===activityMenuContext?.id&&t.enabled!==false);
  closeActivityMenu({restoreFocus:true});if(!task)return;
  if(action==='edit')edit(task);else delTask(task.id);
}
$('activityMenuEdit').onclick=()=>activityMenuAction('edit');
$('activityMenuDelete').onclick=()=>activityMenuAction('delete');
for(const [id,context,close,items] of [
  ['activityMenu',()=>activityMenuContext,closeActivityMenu,['activityMenuEdit','activityMenuDelete']],
  ['recommendationMenu',()=>recommendationMenuContext,closeRecommendationMenu,['recommendationMenuEdit']]
]){
  const panel=$(id);
  panel.addEventListener('pointerenter',()=>cancelMenuClose(id));
  panel.addEventListener('pointerleave',event=>{
    const anchor=context()?.anchor;if(event.pointerType==='mouse'&&anchor&&!anchor.contains(event.relatedTarget)){cancelMenuClose(id);close({restoreFocus:panel.contains(document.activeElement)})}
  });
  panel.addEventListener('keydown',event=>{
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();const buttons=items.map($),index=buttons.indexOf(document.activeElement);
      buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length].focus();
    }else if(event.key==='Tab')close({restoreFocus:true});
  });
}

$('taskSearch').oninput=tasks;
function setActivitySearch(open,{restoreFocus=false,render=true}={}){
  closeActivityMenu();$('librarySearch').classList.toggle('hide',!open);
  $('toggleActivitySearch').setAttribute('aria-expanded',String(open));
  $('toggleActivitySearch').setAttribute('aria-label',open?tr('关闭搜索'):tr('搜索活动'));
  $('toggleActivitySearch').title=open?tr('关闭搜索'):tr('搜索活动');
  if(open)$('taskSearch').focus({preventScroll:true});
  else{$('taskSearch').value='';if(render)tasks();if(restoreFocus)$('toggleActivitySearch').focus({preventScroll:true})}
}
$('toggleActivitySearch').onclick=()=>setActivitySearch($('librarySearch').classList.contains('hide'),{restoreFocus:true});
$('closeActivitySearch').onclick=()=>setActivitySearch(false,{restoreFocus:true});
// Classify execution records by the browser's local calendar day.
function recordsForLocalDay(records=d.completed,reference=new Date()){
  let day=new Date(reference).toDateString();
  return records.filter(c=>c&&new Date(c.completedAt||c.date||0).toDateString()===day);
}
function recordTimeRange(record,reference=new Date(),{seconds=false}={}){
  const timestamp=value=>value==null||value===''?null:toTimestamp(value);
  const start=timestamp(record.startedAt),end=timestamp(record.endedAt);
  const day=value=>new Date(value).toDateString();
  const showDate=start===null||end===null||day(start)!==day(end)||day(start)!==day(reference);
  const clock=value=>{
    const date=new Date(value),pad=n=>String(n).padStart(2,'0');
    const datePart=showDate?date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+' ':'';
    return datePart+pad(date.getHours())+':'+pad(date.getMinutes())+(seconds?':'+pad(date.getSeconds()):'');
  };
  return(start===null?tr('开始时间未记录'):clock(start))+'–'+(end===null?tr('结束时间未记录'):clock(end));
}
function recordCompactTimeRange(record,reference=new Date()){
  const start=toTimestamp(record.startedAt),end=toTimestamp(record.endedAt);
  const short=start!==null&&end!==null&&end>=start&&end-start<60000;
  return recordTimeRange(record,reference,{seconds:short});
}
const todayRecordTimers=new Map();
function clearTodayRecordTimers(){
  for(const timeout of todayRecordTimers.values())clearTimeout(timeout);
  todayRecordTimers.clear();
}
function todayRecordGroups(records=recordsForLocalDay()){
  const orderTime=c=>toTimestamp(c.startedAt??c.endedAt??c.completedAt??c.date)??0;
  const groups=new Map();
  for(const record of [...records].sort((a,b)=>orderTime(a)-orderTime(b))){
    if(!groups.has(record.taskId))groups.set(record.taskId,{taskId:record.taskId,records:[],totalMs:0});
    const group=groups.get(record.taskId);group.records.push(record);group.totalMs+=recordDurationMs(record)||0;
  }
  return [...groups.values()];
}
function setupTodayDisclosure(card,onClose=()=>{}){
  const clear=element=>{clearTimeout(todayRecordTimers.get(element));todayRecordTimers.delete(element)};
  const close=()=>{
    clear(card);card.open=false;
    onClose();
  };
  const restart=()=>{
    clear(card);
    if(card.open&&card.isConnected)todayRecordTimers.set(card,setTimeout(close,10000));
  };
  card.addEventListener('toggle',()=>{if(card.open)restart();else close()});
  return restart;
}
function today(){
  clearTodayRecordTimers();
  let now=new Date(),a=recordsForLocalDay(d.completed,now),groups=todayRecordGroups(a),totalMs=groups.reduce((s,g)=>s+g.totalMs,0);
  $('date').textContent=new Intl.DateTimeFormat(language,{month:'numeric',day:'numeric'}).format(now);
  const clock=c=>{
    const stamp=c.startedAt??c.endedAt??c.completedAt??c.date,ms=stamp==null?null:toTimestamp(stamp);
    return ms===null?'—':new Intl.DateTimeFormat(language,{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(ms));
  };
  const disclosureArrow=()=>{const arrow=textElement('span','›','history-arrow');arrow.setAttribute('aria-hidden','true');return arrow};
  let recordIndex=0,list=groups.map(group=>{
    const first=group.records[0],taskName=first.taskName||d.tasks.find(t=>t.id===group.taskId)?.name||tr('已删除任务');
    let card=textElement('details','','history-item'),summary=document.createElement('summary'),title=textElement('div','','history-title'),nameBox=textElement('div','','history-name');
    const name=textElement('h3',taskName,'user-text');name.title=taskName;
    nameBox.append(name);
    if(group.records.length>1)nameBox.append(textElement('span',tr('{count} 次',{count:group.records.length}),'history-count'));
    title.append(textElement('span',clock(first),'history-time'),nameBox,textElement('span',formatDuration(group.totalMs),'history-duration'),disclosureArrow());
    summary.append(title);
    if(group.records.length>1)summary.append(textElement('p',tr('最近一次 {time}',{time:clock(group.records.at(-1))}),'history-meta'));
    const content=textElement('div','','history-group-content'),morePanels=[];
    const closeMore=()=>{for(const {button,panel} of morePanels){button.setAttribute('aria-expanded','false');panel.hidden=true}};
    const restartGroup=setupTodayDisclosure(card,()=>{
      if(content.contains(document.activeElement))summary.focus({preventScroll:true});
      closeMore();
    });
    const sessions=group.records.map(c=>{
      const actualMs=recordDurationMs(c),planned=c.plannedDuration!=null&&c.plannedDuration!==''&&Number.isFinite(Number(c.plannedDuration))?tr('{n} 分钟',{n:Number(c.plannedDuration)}):c.plannedDurationMs!=null&&c.plannedDurationMs!==''&&Number.isFinite(Number(c.plannedDurationMs))?formatDuration(Number(c.plannedDurationMs)):tr('未知'),extensionMs=c.extensionDurationMs!=null&&c.extensionDurationMs!==''&&Number.isFinite(Number(c.extensionDurationMs))?Number(c.extensionDurationMs):c.extensionDuration!=null&&c.extensionDuration!==''&&Number.isFinite(Number(c.extensionDuration))?Number(c.extensionDuration)*60000:0;
      const session=textElement('div','','history-session'),row=textElement('div','','history-session-row'),panel=textElement('div','','history-more-panel'),range=recordCompactTimeRange(c,now);
      panel.id='history-record-details-'+(++recordIndex);panel.hidden=true;
      panel.append(textElement('p',formatDateTime(c.startedAt)+' – '+formatDateTime(c.endedAt),'history-exact-time'));
      const metrics=[tr('计划 {duration}',{duration:planned})];
      const hasExtension=[c.extensionDurationMs,c.extensionDuration].some(v=>v!=null&&v!==''&&Number.isFinite(Number(v)));
      if(!hasExtension||extensionMs>0)metrics.push(tr('追加 {duration}',{duration:hasExtension?formatDuration(extensionMs):tr('未记录')}));
      if(c.pausedDurationMs!=null&&Number(c.pausedDurationMs)>0)metrics.push(tr('暂停 {duration}',{duration:formatDuration(Number(c.pausedDurationMs))}));
      panel.append(textElement('p',metrics.join(' · '),'history-record-metrics'));
      const more=actionButton('⋯',()=>{
        if(!card.isConnected||!card.open)return;
        const open=panel.hidden;closeMore();panel.hidden=!open;more.setAttribute('aria-expanded',String(open));restartGroup();
      },'history-more');
      more.setAttribute('aria-label',tr('更多信息：{time}',{time:range}));more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls',panel.id);
      session.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&!panel.hidden){closeMore();more.focus({preventScroll:true});event.preventDefault();event.stopPropagation()}
      });
      morePanels.push({button:more,panel});
      row.append(textElement('span',range,'history-range'),textElement('span',formatDuration(actualMs),'history-session-duration'),more);
      session.append(row,panel);return session;
    });
    content.append(...sessions);card.append(summary,content);
    return card;
  });
  let card=textElement('div','','today-overview');card.append(textElement('p',tr(a.length===1?'做了 1 次，共 {duration}':'做了 {count} 次，共 {duration}',{count:a.length,duration:formatDuration(totalMs)})));
  if(list.length){let history=textElement('div','','history-list');history.append(...list);$('todayBox').replaceChildren(card,history)}else{const empty=textElement('div','','empty-state');empty.append(textElement('p',tr('今天还没开始。')),actionButton(tr('去开始'),()=>page('home'),'primary'));$('todayBox').replaceChildren(card,empty)}
}
function emptyTaskGuide(buttonId){return[textElement('p',tr('添加一件你想经常做的事。'),'muted'),actionButton(tr('添加活动'),()=>newTask(),'primary',buttonId)]}
function newTask(){
  closeActivityMenu();
  rememberDialogFocus('modal');$('modal').classList.remove('hide');$('modalTitle').textContent=tr('添加活动');$('form').reset();$('tid').value='';
  $('name').value='';$('desc').value='';
  for(const id of ['computer','requiresAudio','requiresSpeech','requiresUninterrupted'])$(id).checked=false;
  $('requirementsOptions').open=false;
  $('desc').style.height='44px';
  $('saveActivity').textContent=tr('添加');
  $('activityOptions').open=false;syncDescriptionToggle();syncDialogState();$('name').focus();
}
function edit(t){newTask();$('modalTitle').textContent=tr('编辑活动');$('saveActivity').textContent=tr('保存');$('tid').value=t.id;$('name').value=t.name;const r=activityRequirements(t);$('computer').checked=r.computer;$('requiresAudio').checked=r.audio;$('requiresSpeech').checked=r.speech;$('requiresUninterrupted').checked=r.uninterrupted;$('requirementsOptions').open=REQUIREMENT_KEYS.some(k=>r[k]);$('desc').value=t.description||'';$('activityOptions').open=!!t.description;syncDescriptionToggle()}
function delTask(id){openConfirm('delete',id)}
function resizeActivityDescription(){
  const input=$('desc');if(!input.getClientRects?.().length)return;
  input.style.height='auto';input.style.height=Math.max(44,input.scrollHeight+2)+'px';
}
function syncDescriptionToggle(){$('descriptionToggle').textContent=$('activityOptions').open?tr('活动说明'):$('desc').value?tr('查看说明'):tr('＋ 添加说明')}
function closeActivity(){$('modal').classList.add('hide');syncDialogState();restoreDialogFocus('modal')}

$('desc').oninput=()=>{resizeActivityDescription();syncDescriptionToggle()};
$('activityOptions').addEventListener('toggle',()=>{syncDescriptionToggle();resizeActivityDescription()});
window.addEventListener('resize',resizeActivityDescription);
$('newTask').onclick=()=>newTask();$('close').onclick=closeActivity;
const dialogFocus=new Map();
function rememberDialogFocus(id){if($(id).classList.contains('hide'))dialogFocus.set(id,document.activeElement)}
function restoreDialogFocus(id){const target=dialogFocus.get(id);dialogFocus.delete(id);if(target?.isConnected&&!target.closest('.hide,[inert]'))target.focus({preventScroll:true})}
function syncDialogState(){
  if(storageBlocked)return;
  const confirmOpen=!$('confirmLayer').classList.contains('hide'),modalOpen=!$('modal').classList.contains('hide');
  const timerFull=!$('timer').classList.contains('hide');
  if(confirmOpen||modalOpen||timerFull){closeActivityMenu();closeRecommendationMenu()}
  document.querySelectorAll('header, main, #timer, #floatingTimer').forEach(el=>el.inert=confirmOpen||modalOpen||(timerFull&&el.tagName==='MAIN'));
  $('modal').inert=confirmOpen;
}
function setupMinimalInteractions(){
  const pickers=['timePicker','conditionsPicker'];
  const placeConditions=id=>{
    const panel=document.querySelector('#'+id+' .condition-panel'),summary=document.querySelector('#'+id+' > summary');
    if(!panel||!summary)return;
    const r=summary.getBoundingClientRect(),header=document.querySelector('header').getBoundingClientRect();
    const width=Math.min(310,window.innerWidth-32),top=Math.max(header.bottom+8,Math.min(r.bottom+8,window.innerHeight-230));
    panel.style.left=Math.max(16,Math.min(window.innerWidth-width-16,r.left+r.width/2-width/2))+'px';
    panel.style.top=top+'px';panel.style.width=width+'px';panel.style.maxHeight=Math.max(90,window.innerHeight-top-16)+'px';
  };
  for(const id of pickers){
    const summary=document.querySelector('#'+id+' > summary'),panel=document.querySelector('#'+id+' .condition-panel');
    let exitTimer;
    const cancelExit=()=>clearTimeout(exitTimer);
    summary?.addEventListener('pointerenter',event=>{
      if(event.pointerType!=='mouse')return;
      cancelExit();placeConditions(id);
      for(const other of pickers)if(other!==id)$(other).open=false;
      $(id).open=true;
    });
    summary?.addEventListener('click',event=>{
      placeConditions(id);
      if(event.pointerType==='mouse'&&$(id).open)event.preventDefault();
    });
    summary?.addEventListener('pointerleave',event=>{
      if(event.pointerType!=='mouse'||panel?.contains(event.relatedTarget))return;
      cancelExit();
      exitTimer=setTimeout(()=>{if(!panel.matches(':hover')&&!summary.matches(':hover'))$(id).open=false},160);
    });
    panel?.addEventListener('pointerenter',cancelExit);
    panel?.addEventListener('pointerleave',event=>{
      if(event.pointerType==='mouse'){cancelExit();$(id).open=false}
    });
    $(id).addEventListener('toggle',()=>{if($(id).open){for(const other of pickers)if(other!==id)$(other).open=false;placeConditions(id)}});
  }
  window.addEventListener('resize',()=>pickers.forEach(placeConditions));
  window.addEventListener('scroll',()=>pickers.forEach(placeConditions),{passive:true});
  document.addEventListener('pointerdown',e=>{for(const id of pickers)if(!$(id).contains(e.target))$(id).open=false});
  document.addEventListener('pointerdown',e=>{if(activityMenuContext&&!$('activityMenu').contains(e.target)&&!activityMenuContext.anchor.contains(e.target))closeActivityMenu();if(recommendationMenuContext&&!$('recommendationMenu').contains(e.target)&&!recommendationMenuContext.anchor.contains(e.target))closeRecommendationMenu()});
  document.addEventListener('focusin',e=>{if(activityMenuContext&&!$('activityMenu').contains(e.target)&&e.target!==activityMenuContext.anchor)closeActivityMenu();if(recommendationMenuContext&&!$('recommendationMenu').contains(e.target)&&e.target!==recommendationMenuContext.anchor)closeRecommendationMenu()});
  window.addEventListener('resize',()=>{placeActivityMenu();placeRecommendationMenu()});
  window.addEventListener('scroll',()=>{placeActivityMenu();placeRecommendationMenu()},{passive:true});
  window.visualViewport?.addEventListener('resize',()=>{placeActivityMenu();placeRecommendationMenu()});
  window.visualViewport?.addEventListener('scroll',()=>{placeActivityMenu();placeRecommendationMenu()});
  document.addEventListener('keydown',e=>{
    const active=!$('confirmLayer').classList.contains('hide')?'confirmLayer':!$('modal').classList.contains('hide')?'modal':null;
    if(e.key==='Escape'){
      if(active){e.preventDefault();active==='modal'?closeActivity():closeConfirm();return}
      if(activityMenuContext){e.preventDefault();closeActivityMenu({restoreFocus:true});return}
      if(recommendationMenuContext){e.preventDefault();closeRecommendationMenu({restoreFocus:true});return}
      if(nextStepEditor&&$('nextStepForm')?.contains(e.target)){e.preventDefault();cancelNextStep();return}
      if(!$('librarySearch').classList.contains('hide')){e.preventDefault();setActivitySearch(false,{restoreFocus:true});return}
      for(const id of pickers)if($(id).open){e.preventDefault();$(id).open=false;document.querySelector('#'+id+' > summary')?.focus()}
    }
    if(active&&e.key==='Tab'){
      const elements=[...$(active).querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
      if(!elements.length)return;
      const first=elements[0],last=elements[elements.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  document.querySelector('.brand')?.addEventListener('click',e=>{e.preventDefault();page('home')});
  const restorePage=()=>{const id=['home','tasks','today','settings'].includes(location.hash.slice(1))?location.hash.slice(1):'home';if(!$(id).classList.contains('active'))page(id)};
  window.addEventListener('hashchange',restorePage);window.addEventListener('popstate',restorePage);
}
setupMinimalInteractions();
setupFloatingTimer();
$('closeSettings').onclick=()=>{page(settingsReturnPage);$('dataMenuToggle').focus({preventScroll:true})};
function setTheme(theme){if(d.theme===theme)return;d.theme=theme;if(save())syncRuntimePreferences()}
$('theme').onclick=()=>setTheme('dark');$('lightTheme').onclick=()=>setTheme('light');
function setLanguage(nextLanguage){
  if(storageBlocked||!SUPPORTED_LANGUAGES.includes(nextLanguage))return;
  // An explicit choice is saved even when it matches the browser language.
  if(d.preferences.language===nextLanguage)return;
  d.preferences={...d.preferences,language:nextLanguage};
  if(!save())return;
  syncRuntimePreferences();
  random({keepCurrent:true});tasks();today();renderTimer();
  $('toggleActivitySearch').setAttribute('aria-label',tr($('librarySearch').classList.contains('hide')?'搜索活动':'关闭搜索'));
  $('toggleActivitySearch').title=tr($('librarySearch').classList.contains('hide')?'搜索活动':'关闭搜索');
  notify(tr('语言已切换。'));
}
document.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>setLanguage(button.dataset.language));
$('export').onclick=()=>{if(!storageBlocked)downloadText(JSON.stringify(d,null,2),'what-to-do-backup.json')};$('import').onclick=()=>$('file').click();syncRuntimePreferences();if(!storageBlocked){restoreTimer();page(location.hash.slice(1)||'home')}else protectData($('dataRecoveryMessage').textContent);
