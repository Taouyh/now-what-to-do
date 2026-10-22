const $=id=>document.getElementById(id),gn=id=>d.goals.find(g=>g.id===id),en=e=>({quiet:'安静',noisy:'有人/嘈杂',class:'必须听课'}[e]||'不限');function normalizeCompletedRecords(records){
  const used=new Set(records.flatMap(c=>[c.recordId,c.completionId]).filter(Boolean));
  return records.map((c,i)=>{
    let r={...c};
    if(!r.recordId&&!r.completionId){let id='legacy-record-'+(i+1);while(used.has(id))id+='-legacy';used.add(id);r.recordId=id}
    if(!r.recordId)r.recordId=r.completionId;
    if(!r.completionId)r.completionId=r.recordId;
    return r;
  });
}
function toTimestamp(value){let n=typeof value==='number'?value:Date.parse(value);return Number.isFinite(n)?n:null}function formatDateTime(value){let n=toTimestamp(value);if(n===null)return'该记录没有保存时间';let z=new Date(n),p=x=>String(x).padStart(2,'0');return z.getFullYear()+'-'+p(z.getMonth()+1)+'-'+p(z.getDate())+' '+p(z.getHours())+':'+p(z.getMinutes())+':'+p(z.getSeconds())}function formatDuration(ms){if(!Number.isFinite(ms)||ms<0)return'未知';let total=Math.round(ms/1000),m=Math.floor(total/60),s=total%60;return m?(m+' 分钟'+(s?' '+s+' 秒':'')):s+' 秒'}function recordDurationMs(c){if(!c||typeof c!=='object')return null;if(Number.isFinite(c.actualDurationMs))return c.actualDurationMs;let m=Number(c.actualDuration);if(!Number.isFinite(m))m=Number(c.minutes);return Number.isFinite(m)?m*60000:null}
const ACTIVITY_CATEGORIES=[['study','学习'],['work','工作'],['life','生活'],['exercise','运动'],['other','其他']];
let activityMenuContext=null;
function activityCategoryOf(task){
  if(typeof task.activityCategory==='string')return ACTIVITY_CATEGORIES.some(([id])=>id===task.activityCategory)?task.activityCategory:'';
  // Older optional category fields remain intact, including object metadata.
  return ACTIVITY_CATEGORIES.find(([id,label])=>task.category===id||task.category===label)?.[0]||'';
}
function freshData(){return{version:2,goals:[],tasks:[],completed:[],preferences:{time:15,env:'quiet',computerReady:false},theme:'light'}}

// Keep the v2 keys and unknown user fields. Never seed examples during migration.
function validateData(x){
  const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),text=v=>typeof v==='string'&&v.trim().length>0;
  const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>=0;
  if(!object(x)||![undefined,1,2].includes(x.version)||x.goals!==undefined&&!Array.isArray(x.goals)||!Array.isArray(x.tasks)||!Array.isArray(x.completed))throw Error('数据必须包含任务和完成记录数组，且版本为 v1 或 v2；旧目标如有保存，必须为数组。');
  let goalIds=new Set(),taskIds=new Set();
  for(let g of x.goals||[]){
    if(!object(g)||!text(g.id)||!text(g.name)||goalIds.has(g.id))throw Error('目标数据无效：名称不能为空，ID 必须唯一。');
    if(['icon','description'].some(k=>g[k]!==undefined&&typeof g[k]!=='string'))throw Error('目标图标或说明无效。');
    goalIds.add(g.id);
  }
  for(let t of x.tasks){
    if(!object(t)||!text(t.id)||taskIds.has(t.id)||!text(t.name)||!Number.isFinite(t.minutes)||t.minutes<1||t.minutes>1440||!['quiet','noisy','class'].includes(t.env)||typeof t.computer!=='boolean'||t.goalId!=null&&typeof t.goalId!=='string')throw Error('任务数据无效：请检查 ID、名称、时长、环境及旧目标关联字段。');
    if(t.description!==undefined&&typeof t.description!=='string'||t.enabled!==undefined&&typeof t.enabled!=='boolean')throw Error('任务说明或启用状态无效。');
    if(t.activityCategory!==undefined&&t.activityCategory!==''&&!ACTIVITY_CATEGORIES.some(([id])=>id===t.activityCategory))throw Error('活动分类无效。');
    taskIds.add(t.id);
  }
  if(x.preferences!==undefined&&!object(x.preferences)||x.version===2&&!object(x.preferences))throw Error('偏好数据无效。');
  let p=x.preferences||{};
  if(p.time!==undefined&&![5,10,15,30,60].includes(Number(p.time))||p.env!==undefined&&!['quiet','noisy','class'].includes(p.env)||p.computerReady!==undefined&&typeof p.computerReady!=='boolean'||x.version===2&&(p.time===undefined||p.env===undefined))throw Error('时间、环境或电脑使用偏好无效。');
  if(x.theme!==undefined&&!['light','dark'].includes(x.theme))throw Error('主题数据无效。');
  if(x.defaultTasksSeeded!==undefined&&typeof x.defaultTasksSeeded!=='boolean')throw Error('默认任务迁移标记无效。');
  for(let c of x.completed){
    if(!object(c)||!text(c.taskId)||!numeric(c.actualDurationMs??c.actualDuration??c.minutes))throw Error('完成记录的任务 ID 或有效用时无效。');
    for(let k of ['date','completedAt','startedAt','endedAt'])if(c[k]!=null&&toTimestamp(c[k])===null)throw Error('完成记录的时间字段无效。');
    for(let k of ['recordId','completionId'])if(c[k]!==undefined&&!text(c[k]))throw Error('完成记录 ID 无效。');
    for(let k of ['plannedDuration','actualDuration','minutes','actualDurationMs','pausedDurationMs','extensionDuration','extensionDurationMs'])if(c[k]!=null&&!numeric(c[k]))throw Error('完成记录的时长字段无效。');
    for(let k of ['taskName','goalName'])if(c[k]!==undefined&&typeof c[k]!=='string')throw Error('完成记录的名称无效。');
  }
  return x;
}
function migrateData(x){
  validateData(x);
  let migrated=JSON.parse(JSON.stringify(x));
  migrated.version=2;
  if(migrated.goals===undefined)migrated.goals=[];
  migrated.completed=normalizeCompletedRecords(migrated.completed);
  migrated.preferences={time:10,env:'noisy',computerReady:false,...migrated.preferences};
  migrated.theme=migrated.theme||'light';
  return migrated;
}

let storageBlocked=false,firstUse=false,originalMain=null,originalTimer=null,pendingImport=null;
const storageFailures=new Map();
function downloadText(content,name,type='application/json'){
  try{let a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){notify('导出失败，请检查浏览器下载权限后重试。')}
}
function protectData(message){
  closeActivityMenu();
  storageBlocked=true;
  let layer=$('dataRecovery');
  if(!layer){
    layer=document.createElement('div');layer.id='dataRecovery';layer.className='confirm-layer';layer.style.zIndex='100';layer.setAttribute('role','alertdialog');layer.setAttribute('aria-modal','true');
    layer.innerHTML='<div class="confirm-card"><h2>本地数据已保护</h2><p id="dataRecoveryMessage"></p><p>已停止保存和计时操作，不会自动重置或覆盖数据。请先导出原始内容留存。存储权限恢复或损坏数据经人工修复后，可重新加载尝试读取；应用不会自动重置数据。</p><div id="recoveryActions" class="actions"></div></div>';
    document.body.append(layer);
    const add=(id,label,action)=>{let b=document.createElement('button');b.id=id;b.type='button';b.className='secondary';b.textContent=label;b.onclick=action;$('recoveryActions').append(b)};
    if(originalMain!==null)add('exportRawData','导出主数据原文',()=>downloadText(originalMain,'what-to-do-original.txt','text/plain;charset=utf-8'));
    if(originalTimer!==null)add('exportRawTimer','导出计时原文',()=>downloadText(originalTimer,'what-to-do-timer-original.txt','text/plain;charset=utf-8'));
    add('retryDataLoad','重新加载',()=>location.reload());
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
    protectData('读取或迁移失败：'+e.message+'。原有本地内容未更改；若浏览器禁止读取，需先恢复存储权限才能导出。');
    return{version:2,goals:[],tasks:[],completed:[],preferences:{time:10,env:'noisy',computerReady:false},theme:'light'};
  }
}
function storageFailure(key,error){
  storageFailures.set(key,(key==='whatToDoData'?'主数据':'计时状态')+'保存失败（'+(error.name||'存储错误')+'）。本次操作未保存，原有本地数据未清空；请检查空间和存储权限后重试原操作；初始化或计时清理失败时，可重新加载后重试。');
  let box=$('storageWarning');
  if(!box){box=document.createElement('div');box.id='storageWarning';box.className='card';box.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:30;max-height:40vh;overflow:auto';box.setAttribute('role','alert');box.innerHTML='<p id="storageWarningText"></p><button type="button" class="secondary" id="exportSafeData">导出当前数据备份</button>';document.body.append(box);$('exportSafeData').onclick=()=>downloadText(JSON.stringify(d,null,2),'what-to-do-backup.json')}
  $('storageWarningText').textContent=[...storageFailures.values()].join(' ');box.classList.remove('hide');
}
function clearStorageFailure(key){storageFailures.delete(key);if($('storageWarning')){if(!storageFailures.size)$('storageWarning').classList.add('hide');else $('storageWarningText').textContent=[...storageFailures.values()].join(' ')}}
function syncRuntimePreferences(){
  time=customTime?customMinutes():Number(d.preferences.time);env=d.preferences.env;computerReady=!!d.preferences.computerReady;
  document.documentElement.dataset.theme=d.theme;
  $('theme').setAttribute('aria-pressed',String(d.theme==='dark'));
  $('lightTheme').setAttribute('aria-pressed',String(d.theme==='light'));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',d.theme==='dark'?'#1e201c':'#f7f5f0');
  syncHomeControls();
  if($('computerReady'))$('computerReady').checked=computerReady;
}
function save(candidate=d){
  if(storageBlocked)return false;
  try{let serialized=JSON.stringify({...candidate,version:2});localStorage.setItem('whatToDoData',serialized);dataSnapshot=serialized;originalMain=serialized;clearStorageFailure('whatToDoData');return true}
  catch(e){d=JSON.parse(dataSnapshot);syncRuntimePreferences();storageFailure('whatToDoData',e);return false}
}
let d=loadData(),time=Number(d.preferences.time),env=d.preferences.env,computerReady=!!d.preferences.computerReady,cur=null;
let timeChosen=true,envChosen=true,customTime=false,customTimeDraft='';
let settingsReturnPage='home';
let activeCategory='';
let dataSnapshot=JSON.stringify(d);
if(firstUse&&!storageBlocked)save();
function customMinutes(){
  const value=customTimeDraft.trim();
  return /^[0-9]+$/.test(value)&&Number(value)>=1&&Number(value)<=1440?Number(value):null;
}
function selectionReady(){return timeChosen&&envChosen&&(!customTime||customMinutes()!==null)}
function syncHomeControls(){
  for(const [id,value,chosen] of [['times',time,timeChosen],['envs',env,envChosen]]){
    document.querySelectorAll('#'+id+' button').forEach(button=>{
      const selected=id==='times'&&customTime?button.dataset.v==='custom':chosen&&String(button.dataset.v)===String(value);
      button.classList.toggle('on',selected);button.setAttribute('aria-pressed',String(selected));
    });
  }
  $('customTimeField').classList.toggle('hide',!customTime);
  if($('customMinutes').value!==customTimeDraft)$('customMinutes').value=customTimeDraft;
  const invalid=customTime&&customMinutes()===null;
  const showError=invalid&&customTimeDraft.trim()!=='';
  $('customMinutes').setAttribute('aria-invalid',String(showError));
  $('customTimeError').textContent=customTime?(showError?'请输入 1–1440 的整数':'1–1440 分钟，整数'):'';
  $('random').disabled=!selectionReady();
  $('timeSummary').textContent=customTime?(customMinutes()===null?'自定义时间':customMinutes()+' 分钟'):time+' 分钟';
  $('environmentSummary').textContent=en(env)+' · '+(computerReady?'有电脑':'无电脑');
  $('quickOptions').textContent='每次 '+quickActivityMinutes()+' 分钟 · '+en(env)+' · 无需电脑 ›';
}
function persistPreferences(){
  // Custom availability is session-only; keep the existing preset preference format.
  const savedTime=customTime?d.preferences.time:time;
  const changed=Number(d.preferences.time)!==Number(savedTime)||d.preferences.env!==env||!!d.preferences.computerReady!==computerReady;
  if(changed){d.preferences={...d.preferences,time:savedTime,env,computerReady};if(!save())return false}
  syncHomeControls();random({keepCurrent:true});return true;
}
function selectHomeCondition(key,value){
  const previous={timeChosen,envChosen,customTime};
  if(key==='time'){customTime=value==='custom';time=customTime?customMinutes():value;timeChosen=time!==null}else{env=value;envChosen=true}
  if(!persistPreferences()){timeChosen=previous.timeChosen;envChosen=previous.envChosen;customTime=previous.customTime;syncRuntimePreferences()}
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
function page(id,{keepTimerView=false}={}){
  closeActivityMenu();
  if(!['home','today','tasks','settings'].includes(id))id='home';
  if(id==='settings'&&!$('settings').classList.contains('active'))settingsReturnPage=['home','tasks','today'].includes(location.hash.slice(1))?location.hash.slice(1):'home';
  if(id==='home')random({keepCurrent:true});
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));
  document.querySelectorAll('[data-page]').forEach(x=>{x.classList.toggle('active',x.dataset.page===id);x.setAttribute('aria-current',x.dataset.page===id?'page':'false')});
  for(const key of ['timePicker','environmentPicker','libraryFilters'])$(key).open=false;
  if(id==='tasks')tasks();if(id==='today')today();
  // Push routes without the browser scrolling the section underneath the header.
  if(window.history?.pushState){if(location.hash!=='#'+id)window.history.pushState(null,'','#'+id)}else location.hash=id;
  if(!keepTimerView&&timerState()){timerView='floating';renderTimer()}
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
document.querySelectorAll('#envs button').forEach(x=>x.onclick=()=>selectHomeCondition('env',x.dataset.v));
function ok(t){return t.enabled!==false&&t.minutes<=time&&(!t.computer||computerReady)&&(env==='class'?!t.computer&&t.env==='class':env==='noisy'?t.env==='noisy':t.env==='quiet')}
function startRecommendation(id){
  let task=d.tasks.find(t=>t.id===id);
  if(!selectionReady()||!task||cur?.id!==id||!ok(task)){random();return}
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
function recommendAndReveal(){random();revealRecommendation()}
function random({keepCurrent=false}={}){
  cancelRecommendationReveal?.();
  const empty=!d.tasks.length;
  $('onboarding').classList.toggle('hide',!empty);
  $('homeWorkspace').classList.toggle('hide',empty);
  if(empty){cur=null;$('rec').replaceChildren();$('rec').classList.add('hide');return}
  if(!selectionReady()){
    cur=null;
    if(!d.tasks.length){$('rec').replaceChildren(...emptyTaskGuide('addFirstTask'));$('rec').classList.remove('hide')}
    else{$('rec').replaceChildren();$('rec').classList.add('hide')}
    return;
  }
  let previousId=cur?.id,all=d.tasks.filter(ok),current=all.find(t=>t.id===previousId);
  if(keepCurrent&&current)cur=current;
  else{
    // An explicit new recommendation prefers another hard-eligible activity.
    let pool=all.length>1?all.filter(t=>t.id!==previousId):all;
    let doneRecently=new Set(d.completed.filter(c=>Date.now()-new Date(c.completedAt||c.date||0).getTime()<7*86400000).map(c=>c.taskId)),preferred=pool.filter(t=>!doneRecently.has(t.id));
    if(!preferred.length)preferred=pool;
    cur=preferred.length?preferred[Math.floor(Math.random()*preferred.length)]:null;
  }
  let b=$('rec');
  if(!cur){
    if(!d.tasks.length)b.replaceChildren(...emptyTaskGuide('addFirstTask'));
    else b.replaceChildren(textElement('p','没有符合当前条件的活动。'),actionButton('调整条件',()=>{$('environmentPicker').open=false;$('timePicker').open=true;document.querySelector('#timePicker > summary')?.focus()},'primary'),actionButton('自己选择',()=>page('tasks'),'quiet-link','openTasks'));
    b.classList.remove('hide');return;
  }
  let meta=textElement('div','','meta'),actions=textElement('div','','actions');
  meta.append(textElement('span',cur.minutes+' 分钟'));
  let recommendedId=cur.id;
  actions.id='recommendationActions';
  const start=actionButton('开始',()=>startRecommendation(recommendedId),'primary','start'),play=textElement('span','','play-icon');play.setAttribute('aria-hidden','true');
  start.replaceChildren(play,textElement('span','开始'));
  actions.append(start,actionButton('换一件',recommendAndReveal,'quiet-link','again'));
  const name=textElement('h2',cur.name,'user-text');name.title=cur.name;name.id='recommendedTaskName';
  b.replaceChildren(name,meta,actions);
  if(cur.description){const description=textElement('details','','recommendation-details');description.append(textElement('summary','活动说明'),textElement('p',cur.description,'muted user-text'));b.append(description)}
  if(all.length===1){let hint=textElement('p','当前条件下只有这一项活动','muted');hint.id='recommendationHint';hint.setAttribute('role','status');$('again').disabled=true;$('again').setAttribute('aria-describedby','recommendationHint');b.append(hint)}
  b.classList.remove('hide');
}$('random').onclick=recommendAndReveal;
function run(t){const starting=!timerState();cur=t;startTimer(t);if(starting)$('timerDescription').open=false;if(!$('timer').classList.contains('hide'))($('pauseTimer')||$('extendTimer'))?.focus({preventScroll:true})}
function startTimer(t){if(timerState()){showFullTimer();return}if(!t||d.tasks.some(x=>x.id===t.id&&x.enabled===false))return;primeTimerAudio();let now=Date.now(),plannedMs=Math.max(1,Number(t.minutes)||0)*60000,x={completionId:'c'+now+Math.random().toString(36).slice(2),taskId:t.id,task:{...t},taskName:t.name,goalId:t.goalId,goalName:gn(t.goalId)?.name||'',plannedDurationMs:plannedMs,durationMs:plannedMs,extensionDurationMs:0,elapsed:0,lastStarted:now,startedAt:now,paused:false,finished:false,soundPlayed:false,pausedDurationMs:0,pauseStartedAt:0};if(!setTimerState(x))return;timerView='full';renderTimer();startTimerLoop()}
let timerTick=null,timerAudio=null;
let timerView='full',floatingPosition=null,floatingDrag=null;
function primeTimerAudio(){try{if(!timerAudio)timerAudio=new (window.AudioContext||window.webkitAudioContext)();if(timerAudio.state==='suspended')timerAudio.resume()}catch(e){timerAudio=null}}
function playTimeUpSound(x){if(!x||x.soundPlayed)return;x.soundPlayed=true;if(!setTimerState(x))return;try{primeTimerAudio();if(!timerAudio)return;let now=timerAudio.currentTime+0.03,gain=timerAudio.createGain();gain.gain.setValueAtTime(0.0001,now);gain.gain.linearRampToValueAtTime(0.075,now+0.18);gain.gain.exponentialRampToValueAtTime(0.0001,now+2.2);gain.connect(timerAudio.destination);[523.25,659.25,783.99].forEach((freq,i)=>{let osc=timerAudio.createOscillator();osc.type='sine';osc.frequency.value=freq;osc.connect(gain);osc.start(now+i*0.28);osc.stop(now+i*0.28+1.8)});setTimeout(()=>gain.disconnect(),2600)}catch(e){}}
function validateTimer(x){
  if(!x||typeof x!=='object'||Array.isArray(x)||typeof x.taskId!=='string'||!x.taskId||!Number.isFinite(x.durationMs)||x.durationMs<=0||!Number.isFinite(x.elapsed)||x.elapsed<0||!Number.isFinite(x.lastStarted)||x.lastStarted<0||typeof x.paused!=='boolean'||typeof x.finished!=='boolean')throw Error('进行中的计时数据无效');
  if(x.task!==undefined&&(!x.task||typeof x.task!=='object'||typeof x.task.name!=='string'))throw Error('计时任务快照无效');
  return x;
}
function timerState(){
  if(storageBlocked)return null;
  try{let raw=localStorage.getItem('activeTimer');originalTimer=raw;if(raw===null||raw==='')return null;let x=validateTimer(JSON.parse(raw));if(!x.completionId)x.completionId='legacy-'+x.taskId+'-'+x.lastStarted;return x}
  catch(e){stopTimerLoop();protectData('无法读取活动计时：'+e.message+'。原始计时数据未更改。');return null}
}
function setTimerState(x){
  if(storageBlocked)return false;
  try{if(x)localStorage.setItem('activeTimer',JSON.stringify(x));else localStorage.removeItem('activeTimer');clearStorageFailure('activeTimer');return true}
  catch(e){storageFailure('activeTimer',e);return false}
}
function stopTimerLoop(){if(timerTick){clearInterval(timerTick);timerTick=null}}
function startTimerLoop(){stopTimerLoop();timerTick=setInterval(()=>{let y=timerState();if(!y){stopTimerLoop();return}if(y.paused||y.finished){stopTimerLoop();renderTimer();return}advanceTimerIfNeeded(y);renderTimer()},250)}
function plannedDurationMs(x){return Number.isFinite(x.plannedDurationMs)?x.plannedDurationMs:Math.max(0,x.durationMs-(x.extensionDurationMs||0))}
function extensionStepMs(x){return Math.max(1,Math.round(plannedDurationMs(x)/120000))*60000}
function activeElapsedMs(x,now=Date.now()){return x.paused||x.finished?x.elapsed:Math.max(0,x.elapsed+Math.max(0,now-x.lastStarted))}
function advanceTimerIfNeeded(x,now=Date.now()){if(!x||x.paused||x.finished||timerState()?.completionId!==x.completionId)return false;if(d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){setTimerState(null);return false}let elapsed=activeElapsedMs(x,now);if(elapsed<x.durationMs)return false;let step=extensionStepMs(x),count=Math.floor((elapsed-x.durationMs)/step)+1,added=count*step;x.extensionDurationMs=(x.extensionDurationMs||0)+added;x.durationMs+=added;x.soundPlayed=false;if(!setTimerState(x))return false;playTimeUpSound(x);notify('时间到了，检测到你还没有结束任务，已自动追加 '+formatDuration(added)+(count>1?'（'+count+' 次，每次 '+formatDuration(step)+'）':''));return true}
function elapsedMs(x,now=Date.now()){return x.paused||x.finished?x.elapsed:Math.min(x.durationMs,x.elapsed+Math.max(0,now-x.lastStarted))}
function remainingMs(x,now=Date.now()){return Math.max(0,x.durationMs-elapsedMs(x,now))}
function formatClock(ms){let n=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(n/60),s=n%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function timerTask(x){return x&&(d.tasks.find(t=>t.id===x.taskId)||x.task)}
function renderTimer(){
  let x=timerState();
  if(!x||d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){
    $('timer').classList.add('hide');$('floatingTimer').classList.add('hide');cancelFloatingDrag();$('timerActions').replaceChildren();$('timerActions').dataset.mode='';stopTimerLoop();syncDialogState();return;
  }
  let t=timerTask(x);if(!t){protectData('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。');return}
  let now=Date.now(),left=remainingMs(x,now),plannedMs=plannedDurationMs(x),extensionMs=Number.isFinite(x.extensionDurationMs)?x.extensionDurationMs:0;
  $('timerName').textContent=t.name;$('timerDesc').textContent=t.description||'';$('timerDescription').classList.toggle('hide',!t.description);
  $('timerClock').textContent=formatClock(left);$('timerProgress').style.width=Math.min(100,elapsedMs(x,now)/x.durationMs*100)+'%';
  $('timerMeta').textContent='计划 '+formatDuration(plannedMs)+(extensionMs?' · 已追加 '+formatDuration(extensionMs):'');
  $('timer').classList.toggle('hide',timerView!=='full');$('floatingTimer').classList.toggle('hide',timerView!=='floating');
  $('floatingClock').textContent=$('timerClock').textContent;$('floatingName').textContent=t.name;
  $('floatingStatus').textContent=x.finished?'时间到了':x.paused?'已暂停':'正在专注';$('floatingPause').textContent=x.finished||x.paused?'继续':'暂停';
  if(timerView==='floating')clampFloatingTimer();else cancelFloatingDrag();
  $('timerStatus').textContent=x.finished?'时间到了':x.paused?'已暂停':'正在专注';
  let mode=x.finished?'finished':x.paused?'paused':'running',actions=$('timerActions'),focusId=document.activeElement?.id;
  if(actions.dataset.mode!==mode){
    actions.dataset.mode=mode;
    if(mode==='finished'){
      actions.innerHTML='<button type="button" class="primary" id="extendTimer">继续</button><button type="button" class="outline" id="finishTimer">结束</button>';
      $('extendTimer').textContent='继续 '+Math.round(extensionStepMs(x)/60000)+' 分钟';$('extendTimer').onclick=extendTimer;$('finishTimer').onclick=openTimerEnd;
    }else{
      actions.innerHTML='<button type="button" class="primary" id="pauseTimer">暂停</button><button type="button" class="outline" id="earlyTimer">结束</button>';
      $('pauseTimer').textContent=x.paused?'继续':'暂停';$('pauseTimer').onclick=()=>{let y=timerState();if(!y)return;y.paused?resumeTimer():pauseTimer()};$('earlyTimer').onclick=openTimerEnd;
    }
    if(['pauseTimer','earlyTimer','finishTimer','extendTimer'].includes(focusId))$(focusId)?.focus({preventScroll:true});
  }
  syncDialogState();
}

function showFullTimer(){timerView='full';cancelFloatingDrag();renderTimer();($('pauseTimer')||$('extendTimer'))?.focus({preventScroll:true})}
function clampFloatingTimer(position=floatingPosition){
  const box=$('floatingTimer');if(box.classList.contains('hide'))return;
  const viewport=window.visualViewport||{width:window.innerWidth,height:window.innerHeight,offsetLeft:0,offsetTop:0};
  const margin=12,left=viewport.offsetLeft||0,top=viewport.offsetTop||0;
  box.style.maxWidth=Math.max(0,viewport.width-2*margin)+'px';
  box.style.maxHeight=Math.max(0,viewport.height-2*margin)+'px';
  const rect=box.getBoundingClientRect(),minX=left+margin,minY=top+margin;
  const maxX=Math.max(minX,left+viewport.width-margin-rect.width),maxY=Math.max(minY,top+viewport.height-margin-rect.height);
  const x=Math.min(maxX,Math.max(minX,position?.x??maxX)),y=Math.min(maxY,Math.max(minY,position?.y??maxY));
  box.style.left=x+'px';box.style.top=y+'px';box.style.right='auto';box.style.bottom='auto';
  if(position)floatingPosition={x,y};
}
function cancelFloatingDrag(){
  const drag=floatingDrag;floatingDrag=null;
  const box=$('floatingTimer');box.classList.remove('dragging');
  if(drag&&box.hasPointerCapture(drag.id))box.releasePointerCapture(drag.id);
}
function setupFloatingTimer(){
  const box=$('floatingTimer');
  box.addEventListener('pointerdown',e=>{
    if(e.target.closest('button')||e.button!==0||!e.isPrimary||floatingDrag)return;
    const rect=box.getBoundingClientRect();
    floatingDrag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:rect.left,y:rect.top,moved:false};
    try{box.setPointerCapture(e.pointerId)}catch(error){floatingDrag=null;return}
    e.preventDefault();
  });
  // Track movement across the document too, without depending on retargeting.
  document.addEventListener('pointermove',e=>{
    const drag=floatingDrag;if(!drag||e.pointerId!==drag.id)return;
    if(!box.hasPointerCapture(drag.id)){cancelFloatingDrag();return}
    const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
    if(Math.hypot(dx,dy)>6)drag.moved=true;
    if(drag.moved){box.classList.add('dragging');clampFloatingTimer({x:drag.x+dx,y:drag.y+dy})}
    e.preventDefault();
  });
  document.addEventListener('pointerup',e=>{
    const drag=floatingDrag;if(!drag||e.pointerId!==drag.id)return;
    if(!box.hasPointerCapture(drag.id)){cancelFloatingDrag();return}
    // A final jump can arrive without a pointermove (e.g. coalesced input).
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){drag.moved=true;clampFloatingTimer({x:drag.x+e.clientX-drag.startX,y:drag.y+e.clientY-drag.startY})}
    e.preventDefault();cancelFloatingDrag();if(!drag.moved)showFullTimer();
  });
  document.addEventListener('pointercancel',e=>{if(floatingDrag?.id===e.pointerId)cancelFloatingDrag()});
  box.addEventListener('lostpointercapture',e=>{if(floatingDrag?.id===e.pointerId)cancelFloatingDrag()});
  $('floatingHandle').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showFullTimer()}};
  $('floatingPause').onclick=()=>{const x=timerState();if(!x)return;if(x.finished)extendTimer();else x.paused?resumeTimer():pauseTimer()};
  $('floatingEnd').onclick=openTimerEnd;
  window.addEventListener('resize',()=>clampFloatingTimer());
  window.visualViewport?.addEventListener('resize',()=>clampFloatingTimer());
  window.visualViewport?.addEventListener('scroll',()=>clampFloatingTimer());
}
function discardTimer(){
  if(!setTimerState(null))return;
  closeConfirm();stopTimerLoop();cur=null;renderTimer();page('home');
}
function openTimerEnd(){
  const session=timerState();if(!session)return;
  openConfirm('early');
  const current=()=>{if(timerState()?.completionId===session.completionId)return true;closeConfirm();renderTimer();return false};
  $('confirmKicker').textContent='本次活动';$('confirmTitle').textContent='结束并保存这次记录？';
  $('confirmText').textContent='记录实际投入的时间，活动仍保留，下次可以继续。选择放弃则不保存记录。';
  $('confirmCancel').textContent='取消';$('confirmAccept').textContent='结束';
  $('confirmAccept').onclick=()=>{if(!current())return;finishTimer();if(d.completed.some(c=>(c.completionId||c.recordId)===session.completionId))closeConfirm()};
  $('confirmAbandon').classList.remove('hide');$('confirmAbandon').onclick=()=>{if(current())discardTimer()};
}
function pauseTimer(){let x=timerState();if(!x||x.finished)return;if(!x.paused){let now=Date.now();advanceTimerIfNeeded(x,now);x=timerState();if(!x||x.finished)return;x.elapsed=elapsedMs(x,now);x.paused=true;x.pauseStartedAt=now;x.lastStarted=0;if(!setTimerState(x))return;stopTimerLoop();renderTimer()}}
function resumeTimer(){let x=timerState();if(!x||x.finished)return;if(!x.paused)return;let now=Date.now();if(Number.isFinite(x.pauseStartedAt))x.pausedDurationMs=(x.pausedDurationMs||0)+Math.max(0,now-x.pauseStartedAt);x.pauseStartedAt=0;x.paused=false;x.lastStarted=now;if(!setTimerState(x))return;renderTimer();startTimerLoop()}
function closeConfirm(){pendingImport=null;$('confirmAbandon').classList.add('hide');$('confirmAbandon').onclick=null;$('confirmLayer').classList.add('hide');syncDialogState();restoreDialogFocus('confirmLayer')}
function giveUpTimer(){openConfirm('giveup')}
function openConfirm(type,id){
  rememberDialogFocus('confirmLayer');
  $('confirmAbandon').classList.add('hide');$('confirmAbandon').onclick=null;
  let isDelete=type==='delete',task=isDelete?d.tasks.find(t=>t.id===id):(timerState()?timerTask(timerState()):null);
  $('confirmKicker').textContent=isDelete?'删除任务？':type==='early'?'结束本次执行？':type==='import'?'导入备份？':'放弃本次执行？';
  $('confirmTitle').textContent=isDelete?'确定删除这个任务吗？':type==='early'?'已经完成本次执行了吗？':type==='import'?'用备份替换当前任务、记录和设置？':'确定放弃本次执行吗？';
  $('confirmText').textContent=isDelete?'删除后任务将不再出现在任务库中，已有学习记录仍会保留。建议先导出数据备份。':type==='early'?'确认后记录本次实际用时，任务仍会保留，可以再次执行。':type==='import'?'导入前已校验备份结构；现有任务、完成记录、偏好、主题及其他主数据将被替换，兼容保留的旧目标数据也将被替换。当前活动计时保持不变，不随备份导入。':'当前计时不会计入完成记录，任务仍会保留。';
  $('confirmTaskName').textContent=type==='import'?'备份数据将替换当前本地数据。':task?.name||'';
  $('confirmTaskDesc').textContent=task?.description||'';
  $('confirmCancel').textContent=isDelete||type==='import'?'取消':'继续计时';
  $('confirmAccept').textContent=isDelete?'删除任务':type==='early'?'✓ 完成本次执行':type==='import'?'确认导入':'放弃本次执行';
  $('confirmAccept').className=isDelete||type==='giveup'?'danger':'primary';
  $('confirmAccept').onclick=isDelete?()=>{d.tasks=d.tasks.filter(t=>t.id!==id);if(!save())return;closeConfirm();tasks();random({keepCurrent:true})}:type==='early'?()=>{closeConfirm();finishTimer()}:type==='import'?applyImport:discardTimer;
  $('confirmCancel').onclick=closeConfirm;$('confirmLayer').classList.remove('hide');syncDialogState();$('confirmCancel').focus();
}
function confirmEarly(){openConfirm('early')}
function finishTimer(){let x=timerState();if(!x)return;let t=timerTask(x);if(!t){protectData('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。');return}if(d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){setTimerState(null);renderTimer();return}let endedAt=Date.now(),actualMs=elapsedMs(x,endedAt),pausedMs=(x.pausedDurationMs||0)+(x.paused&&Number.isFinite(x.pauseStartedAt)?Math.max(0,endedAt-x.pauseStartedAt):0),plannedMs=Number.isFinite(x.plannedDurationMs)?x.plannedDurationMs:Math.max(0,x.durationMs-(x.extensionDurationMs||0)),extensionMs=Number.isFinite(x.extensionDurationMs)?x.extensionDurationMs:0,taskName=x.taskName||x.task?.name||t.name,goalId=x.goalId||x.task?.goalId||t.goalId,goalName=x.goalName||gn(goalId)?.name||'',actual=Math.round(actualMs/600)/100,now=new Date(endedAt).toISOString();d.completed.push({recordId:x.completionId,completionId:x.completionId,taskId:x.taskId,taskName,goalId,goalName,startedAt:Number.isFinite(x.startedAt)?x.startedAt:null,endedAt,completedAt:now,date:now,plannedDuration:plannedMs/60000,actualDurationMs:actualMs,actualDuration:actual,minutes:actual,pausedDurationMs:pausedMs,extensionDurationMs:extensionMs,extensionDuration:extensionMs/60000});if(!save())return;stopTimerLoop();setTimerState(null);cur=null;$('rec').replaceChildren();$('rec').classList.add('hide');renderTimer();page('today')}
function extendTimer(){let x=timerState();if(!x)return;let now=Date.now(),extensionMs=extensionStepMs(x);x.plannedDurationMs=plannedDurationMs(x);x.extensionDurationMs=(x.extensionDurationMs||0)+extensionMs;x.durationMs=x.plannedDurationMs+x.extensionDurationMs;x.finished=false;x.paused=false;x.soundPlayed=false;x.lastStarted=now;x.pauseStartedAt=0;if(!setTimerState(x))return;renderTimer();startTimerLoop()}
function notify(message){let n=$('appNotice');if(!n){n=document.createElement('div');n.id='appNotice';n.setAttribute('role','status');n.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;background:var(--t);color:var(--s);padding:10px 16px;border-radius:10px;box-shadow:0 8px 24px #0003;max-width:calc(100% - 32px)';document.body.append(n)}n.textContent=message;n.classList.remove('hide');clearTimeout(n.timer);n.timer=setTimeout(()=>n.classList.add('hide'),3200)}
function validateImport(x){return migrateData(x)}
function applyImport(){
  if(storageBlocked||!pendingImport)return;
  let candidate,previousRaw,previousData=d,previousSnapshot=dataSnapshot,previousPage=location.hash.slice(1)||'home';
  try{candidate=validateImport(pendingImport);previousRaw=localStorage.getItem('whatToDoData')}
  catch(e){notify('导入未完成，原数据未更改：'+e.message);return}
  // A single Storage write commits the whole main document. Do not touch activeTimer.
  if(!save(candidate))return;
  try{
    d=candidate;syncRuntimePreferences();page('home');closeConfirm();notify('备份数据已导入。');
  }catch(e){
    d=previousData;dataSnapshot=previousSnapshot;
    try{
      if(previousRaw===null)localStorage.removeItem('whatToDoData');else localStorage.setItem('whatToDoData',previousRaw);originalMain=previousRaw;
      syncRuntimePreferences();closeConfirm();page(previousPage);notify('导入未完成，已恢复导入前的数据。');
    }catch(rollbackError){
      originalMain=previousRaw;
      protectData('导入后的界面同步失败，恢复操作也遇到错误。已停止后续写入；请导出原始主数据并重新加载检查。');
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
    r.onload=()=>{if(request!==importRequest)return;try{pendingImport=validateImport(JSON.parse(r.result));openConfirm('import')}catch(err){fail(err.message||'JSON 格式不正确，现有数据未更改。')}e.target.value=''};
    r.onerror=()=>fail('无法读取文件，现有数据未更改。');
    r.readAsText(f);
  }catch(err){fail('无法读取文件，现有数据未更改。')}
},true);
$('computerReady').checked=computerReady;$('computerReady').onchange=()=>{computerReady=$('computerReady').checked;persistPreferences()};
function saveActivity({id='',name,minutes,environment='quiet',computer=false,description='',category}){
  name=name.trim();
  if(!name||!Number.isFinite(minutes)||minutes<1||minutes>1440||!['quiet','noisy','class'].includes(environment)){notify('请填写活动名称和 1–1440 分钟时长。');return false}
  if(category!==undefined&&category!==''&&!ACTIVITY_CATEGORIES.some(([id])=>id===category)){notify('请选择有效的活动分类。');return false}
  let old=d.tasks.find(t=>t.id===id),now=new Date().toISOString();
  if(id&&!old){notify('这项活动已不存在，请重新选择。');return false}
  let t={...old,id:id||'t'+Date.now()+Math.random().toString(36).slice(2,8),name,minutes,env:environment,computer,description:description.trim(),createdAt:old?.createdAt||now,updatedAt:now,enabled:old?.enabled!==false};
  if(category!==undefined)t.activityCategory=category;
  if(id)d.tasks=d.tasks.map(x=>x.id===id?t:x);else d.tasks.push(t);
  if(!save())return false;
  closeActivity();tasks();
  if(!old&&ok(t))cur=t;
  random({keepCurrent:true});notify('活动已保存。');return true;
}
$('form').addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();saveActivity({id:$('tid').value,name:$('name').value,minutes:+$('mins').value,environment:$('environment').value,computer:$('computer').checked,description:$('desc').value,category:$('activityCategory').value})},true);
function quickActivityMinutes(){return Math.min(10,time||Number(d.preferences.time))}
$('quickAddForm').addEventListener('submit',e=>{e.preventDefault();if(saveActivity({name:$('quickName').value,minutes:quickActivityMinutes(),environment:env})){$('quickName').value='';$('start')?.focus({preventScroll:true})}});
$('quickOptions').onclick=()=>{newTask();$('name').value=$('quickName').value;$('mins').value=quickActivityMinutes();$('environment').value=env;syncDescriptionToggle()};
$('restoreWelcome').onclick=()=>$('file').click();
function restoreTimer(){let x=timerState();if(!x)return;if(!timerTask(x)){protectData('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。');return}if(x.completionId&&d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){setTimerState(null);return}if(!x.completionId)x.completionId='legacy-'+x.taskId+'-'+x.lastStarted;if(!Number.isFinite(x.extensionDurationMs))x.extensionDurationMs=0;if(!Number.isFinite(x.plannedDurationMs))x.plannedDurationMs=Math.max(0,x.durationMs-x.extensionDurationMs);if(JSON.stringify(x)!==originalTimer&&!setTimerState(x)){renderTimer();return}if(!x.finished&&!x.paused)advanceTimerIfNeeded(x);renderTimer();if(!x.finished&&!x.paused)startTimerLoop()}document.addEventListener('visibilitychange',()=>{if(!document.hidden){let x=timerState();if(x&&!x.paused&&!x.finished)advanceTimerIfNeeded(x);renderTimer()}});
function tasks(){
  closeActivityMenu();
  const query=$('taskSearch').value.trim().toLocaleLowerCase();
  const hasUncategorized=d.tasks.some(t=>t.enabled!==false&&!activityCategoryOf(t));
  if(activeCategory==='uncategorized'&&!hasUncategorized)activeCategory='';
  $('categoryTabs').classList.toggle('hide',!d.tasks.length);
  for(const button of document.querySelectorAll('#categoryTabs button')){
    const selected=button.dataset.category===activeCategory;
    button.classList.toggle('on',selected);button.setAttribute('aria-pressed',String(selected));
    if(button.dataset.category==='uncategorized')button.classList.toggle('hide',!hasUncategorized);
  }
  const filters=[$('ft').value,$('fe').value,$('fc').checked].filter(Boolean).length;
  $('filterCount').textContent=filters?' · '+filters:'';
  let a=d.tasks.filter(t=>t.enabled!==false&&(!activeCategory||(activeCategory==='uncategorized'?!activityCategoryOf(t):activityCategoryOf(t)===activeCategory))&&(!query||(t.name+' '+(t.description||'')).toLocaleLowerCase().includes(query))&&(!$('ft').value||($('ft').value==='60'?t.minutes>=60:t.minutes<=+$('ft').value))&&(!$('fe').value||t.env===$('fe').value)&&(!$('fc').checked||t.computer));
  const expanded=new Set([...document.querySelectorAll('#taskList details[open]')].map(el=>el.dataset.taskId));
  let cards=a.map((t,i)=>{
    let card=textElement('details','','activity-item'),summary=document.createElement('summary'),content=textElement('div','','activity-content'),meta=textElement('div','','meta');
    card.dataset.taskId=t.id;card.open=expanded.has(t.id);
    const arrow=textElement('span','›','row-arrow');arrow.setAttribute('aria-hidden','true');
    const name=textElement('h3',t.name,'user-text');name.title=t.name;
    const label=textElement('div','','activity-label');label.append(name);
    summary.append(arrow,label,textElement('span',t.minutes+' 分钟','activity-duration'));
    meta.append(textElement('span',en(t.env)),textElement('span',t.computer?'需要电脑':'无需电脑'));
    for(let [action,title] of [['start','开始'],['more','⋯']]){
      let button=textElement('button','','activity-action activity-action-'+action);button.type='button';button.dataset.taskAction=action;button.dataset.taskIndex=String(i);
      if(action==='start'){const play=textElement('span','▶','activity-play');play.setAttribute('aria-hidden','true');button.append(play,textElement('span',title));button.setAttribute('aria-label','开始：'+t.name)}
      else{button.textContent=title;button.setAttribute('aria-label',t.name+'，更多操作');button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-controls','activityMenu');button.setAttribute('aria-expanded','false')}
      summary.append(button);
    }
    content.append(meta);if(t.description)content.append(textElement('p',t.description,'user-text'));card.append(summary,content);return card;
  });
  if(cards.length)$('taskList').replaceChildren(...cards);
  else{const empty=textElement('div','','empty-state');empty.append(...(d.tasks.length?[textElement('p','没有符合条件的活动。','muted'),actionButton('清除搜索与筛选',clearActivityFilters,'secondary'),actionButton('添加活动',()=>newTask(),'primary')]:emptyTaskGuide('addLibraryTask')));$('taskList').replaceChildren(empty)}
  $('taskList').onclick=e=>{let button=e.target.closest?.('button[data-task-action]');if(!button||!$('taskList').contains(button))return;e.preventDefault();let t=a[Number(button.dataset.taskIndex)];if(!t)return;if(button.dataset.taskAction==='start'){closeActivityMenu();run(t)}else toggleActivityMenu(t,button)};
}['ft','fe','fc'].forEach(x=>$(x).onchange=tasks);
function closeActivityMenu({restoreFocus=false}={}){
  const anchor=activityMenuContext?.anchor;activityMenuContext=null;
  $('activityMenu').classList.add('hide');anchor?.setAttribute('aria-expanded','false');
  if(restoreFocus&&anchor?.isConnected)anchor.focus({preventScroll:true});
}
function toggleActivityMenu(task,anchor){
  if(activityMenuContext?.anchor===anchor){closeActivityMenu({restoreFocus:true});return}
  closeActivityMenu();activityMenuContext={id:task.id,anchor};
  anchor.setAttribute('aria-expanded','true');$('activityMenu').classList.remove('hide');
  placeActivityMenu();
  $('activityMenuEdit').focus({preventScroll:true});
}
function placeActivityMenu(){
  if(!activityMenuContext)return;
  const {anchor}=activityMenuContext,menu=$('activityMenu'),r=anchor.getBoundingClientRect(),view=window.visualViewport;
  const left=view?.offsetLeft||0,top=view?.offsetTop||0,right=left+(view?.width||window.innerWidth),bottom=top+(view?.height||window.innerHeight);
  if(!anchor.isConnected||r.bottom<top||r.top>bottom){closeActivityMenu();return}
  // Clear a previous position before measuring, including after a viewport change.
  menu.style.left=left+'px';menu.style.top=top+'px';const box=menu.getBoundingClientRect();
  menu.style.left=Math.max(left+8,Math.min(right-box.width-8,r.right-box.width))+'px';
  menu.style.top=Math.max(top+8,Math.min(bottom-box.height-8,r.bottom+6+box.height>bottom-8?r.top-box.height-6:r.bottom+6))+'px';
}
function activityMenuAction(action){
  const task=d.tasks.find(t=>t.id===activityMenuContext?.id&&t.enabled!==false);
  closeActivityMenu({restoreFocus:true});if(!task)return;
  if(action==='edit')edit(task);else delTask(task.id);
}
$('activityMenuEdit').onclick=()=>activityMenuAction('edit');
$('activityMenuDelete').onclick=()=>activityMenuAction('delete');
$('activityMenu').addEventListener('keydown',e=>{
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
    e.preventDefault();const items=[$('activityMenuEdit'),$('activityMenuDelete')],index=items.indexOf(document.activeElement);
    items[e.key==='Home'?0:e.key==='End'?1:(index+1)%2].focus();
  }else if(e.key==='Tab'){
    // Continue the normal tab order from the originating row.
    closeActivityMenu({restoreFocus:true});
  }
});
$('taskSearch').oninput=tasks;
function clearActivityFilters(){activeCategory='';$('taskSearch').value='';$('ft').value='';$('fe').value='';$('fc').checked=false;tasks()}
function selectActivityCategory(category){if(category!==''&&category!=='uncategorized'&&!ACTIVITY_CATEGORIES.some(([id])=>id===category))return;activeCategory=category;tasks()}
document.querySelectorAll('#categoryTabs button').forEach(button=>button.onclick=()=>selectActivityCategory(button.dataset.category));
$('clearFilters').onclick=clearActivityFilters;
// Classify execution records by the browser's local calendar day.
function recordsForLocalDay(records=d.completed,reference=new Date()){
  let day=new Date(reference).toDateString();
  return records.filter(c=>c&&new Date(c.completedAt||c.date||0).toDateString()===day);
}
function recordTimeRange(record,reference=new Date()){
  const timestamp=value=>value==null||value===''?null:toTimestamp(value);
  const start=timestamp(record.startedAt),end=timestamp(record.endedAt);
  const day=value=>new Date(value).toDateString();
  const showDate=start===null||end===null||day(start)!==day(end)||day(start)!==day(reference);
  const clock=value=>{
    const date=new Date(value),pad=n=>String(n).padStart(2,'0');
    const datePart=showDate?date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+' ':'';
    return datePart+pad(date.getHours())+':'+pad(date.getMinutes());
  };
  return(start===null?'开始时间未记录':clock(start))+'–'+(end===null?'结束时间未记录':clock(end));
}
function today(){
  const orderTime=c=>toTimestamp(c.startedAt??c.endedAt??c.completedAt??c.date)??0;
  let now=new Date(),a=recordsForLocalDay(d.completed,now).sort((a,b)=>orderTime(a)-orderTime(b)),totalMs=a.reduce((s,c)=>s+(recordDurationMs(c)||0),0);
  $('date').textContent=new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric'}).format(now);
  let list=a.map(c=>{
    let taskName=c.taskName||d.tasks.find(t=>t.id===c.taskId)?.name||'已删除任务',actualMs=recordDurationMs(c),planned=c.plannedDuration!=null&&c.plannedDuration!==''&&Number.isFinite(Number(c.plannedDuration))?Number(c.plannedDuration)+' 分钟':c.plannedDurationMs!=null&&c.plannedDurationMs!==''&&Number.isFinite(Number(c.plannedDurationMs))?formatDuration(Number(c.plannedDurationMs)):'未知',extensionMs=c.extensionDurationMs!=null&&c.extensionDurationMs!==''&&Number.isFinite(Number(c.extensionDurationMs))?Number(c.extensionDurationMs):c.extensionDuration!=null&&c.extensionDuration!==''&&Number.isFinite(Number(c.extensionDuration))?Number(c.extensionDuration)*60000:0;
    let card=textElement('details','','history-item'),summary=document.createElement('summary'),title=textElement('div','','history-title'),meta=textElement('div','','history-meta'),details=document.createElement('dl');
    const arrow=textElement('span','›','history-arrow');arrow.setAttribute('aria-hidden','true');
    const name=textElement('h3',taskName,'user-text');name.title=taskName;
    const stamp=c.startedAt??c.endedAt??c.completedAt??c.date,stampMs=stamp==null?null:toTimestamp(stamp);
    const clock=stampMs===null?'—':new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(stampMs));
    title.append(textElement('span',clock,'history-time'),name,textElement('span',formatDuration(actualMs),'history-duration'),arrow);
    meta.append(textElement('span',recordTimeRange(c,now),'history-range'));
    if(extensionMs>0)meta.append(textElement('span','+'+formatDuration(extensionMs).replace(' 分钟',' 分'),'history-extension'));
    summary.append(title,meta);
    const detail=(label,value)=>{let row=document.createElement('div');row.append(textElement('dt',label),textElement('dd',value));details.append(row)};
    detail('开始时间',formatDateTime(c.startedAt));detail('结束时间',formatDateTime(c.endedAt));detail('原始计划时长',planned);
    const hasExtension=[c.extensionDurationMs,c.extensionDuration].some(v=>v!=null&&v!==''&&Number.isFinite(Number(v)));
    detail('累计追加时长',hasExtension?formatDuration(extensionMs):'未记录');detail('实际有效用时',formatDuration(actualMs));
    if(c.pausedDurationMs!=null)detail('累计暂停时长',formatDuration(Number(c.pausedDurationMs)));
    card.append(summary,details);
    return card;
  });
  let card=textElement('div','','today-overview');card.append(textElement('p','做了 '+a.length+' 次，共 '+formatDuration(totalMs)));
  if(list.length){let history=textElement('div','','history-list');history.append(...list);$('todayBox').replaceChildren(card,history)}else{const empty=textElement('div','','empty-state');empty.append(textElement('p','今天还没开始。'),actionButton('去开始',()=>page('home'),'primary'));$('todayBox').replaceChildren(card,empty)}
}
function emptyTaskGuide(buttonId){return[textElement('p','添加一件你想经常做的事。','muted'),actionButton('添加活动',()=>newTask(),'primary',buttonId)]}
function newTask(){
  closeActivityMenu();
  rememberDialogFocus('modal');$('modal').classList.remove('hide');$('modalTitle').textContent='添加活动';$('form').reset();$('tid').value='';
  $('name').value='';$('desc').value='';$('mins').value=10;$('environment').value='quiet';$('computer').checked=false;
  $('desc').style.height='44px';
  $('activityCategory').value=$('tasks').classList.contains('active')&&ACTIVITY_CATEGORIES.some(([id])=>id===activeCategory)?activeCategory:'';
  $('saveActivity').textContent='添加';
  $('activityOptions').open=false;syncDescriptionToggle();syncDialogState();$('name').focus();
}
function edit(t){newTask();$('modalTitle').textContent='编辑活动';$('saveActivity').textContent='保存';$('tid').value=t.id;$('name').value=t.name;$('mins').value=t.minutes;$('environment').value=t.env;$('computer').checked=t.computer;$('desc').value=t.description||'';$('activityCategory').value=activityCategoryOf(t);$('activityOptions').open=!!t.description;syncDescriptionToggle()}
function delTask(id){openConfirm('delete',id)}
function resizeActivityDescription(){
  const input=$('desc');if(!input.getClientRects?.().length)return;
  input.style.height='auto';input.style.height=Math.max(44,input.scrollHeight+2)+'px';
}
function syncDescriptionToggle(){$('descriptionToggle').textContent=$('activityOptions').open?'活动说明':$('desc').value?'查看说明':'＋ 添加说明'}
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
  if(confirmOpen||modalOpen||timerFull)closeActivityMenu();
  document.querySelectorAll('header, main, #timer, #floatingTimer').forEach(el=>el.inert=confirmOpen||modalOpen||(timerFull&&el.tagName==='MAIN'));
  $('modal').inert=confirmOpen;
}
function setupMinimalInteractions(){
  const pickers=['timePicker','environmentPicker','libraryFilters'];
  const placeConditions=id=>{
    const panel=document.querySelector('#'+id+' .condition-panel'),summary=document.querySelector('#'+id+' > summary');
    if(!panel||!summary||!$(id).open)return;
    const r=summary.getBoundingClientRect(),header=document.querySelector('header').getBoundingClientRect();
    const width=Math.min(310,window.innerWidth-32),top=Math.max(header.bottom+8,Math.min(r.bottom+8,window.innerHeight-230));
    panel.style.left=Math.max(16,Math.min(window.innerWidth-width-16,r.left+r.width/2-width/2))+'px';
    panel.style.top=top+'px';panel.style.width=width+'px';panel.style.maxHeight=Math.max(90,window.innerHeight-top-16)+'px';
  };
  for(const id of pickers){
    $(id).addEventListener('toggle',()=>{if($(id).open){for(const other of pickers)if(other!==id)$(other).open=false;placeConditions(id)}});
  }
  window.addEventListener('resize',()=>pickers.forEach(placeConditions));
  window.addEventListener('scroll',()=>pickers.forEach(placeConditions),{passive:true});
  document.addEventListener('pointerdown',e=>{for(const id of pickers)if(!$(id).contains(e.target))$(id).open=false});
  document.addEventListener('pointerdown',e=>{if(activityMenuContext&&!$('activityMenu').contains(e.target)&&!activityMenuContext.anchor.contains(e.target))closeActivityMenu()});
  document.addEventListener('focusin',e=>{if(activityMenuContext&&!$('activityMenu').contains(e.target)&&e.target!==activityMenuContext.anchor)closeActivityMenu()});
  window.addEventListener('resize',placeActivityMenu);
  window.addEventListener('scroll',placeActivityMenu,{passive:true});
  window.visualViewport?.addEventListener('resize',placeActivityMenu);
  window.visualViewport?.addEventListener('scroll',placeActivityMenu);
  document.addEventListener('keydown',e=>{
    const active=!$('confirmLayer').classList.contains('hide')?'confirmLayer':!$('modal').classList.contains('hide')?'modal':null;
    if(e.key==='Escape'){
      if(active){e.preventDefault();active==='modal'?closeActivity():closeConfirm();return}
      if(activityMenuContext){e.preventDefault();closeActivityMenu({restoreFocus:true});return}
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
$('export').onclick=()=>{if(!storageBlocked)downloadText(JSON.stringify(d,null,2),'what-to-do-backup.json')};$('import').onclick=()=>$('file').click();syncRuntimePreferences();if(!storageBlocked){restoreTimer();page(location.hash.slice(1)||'home',{keepTimerView:true})}else protectData($('dataRecoveryMessage').textContent);
