const G=[['cognition','🧠','认知提升','保持阅读和思考'],['professional','📘','专业知识','持续积累专业能力'],['hobby','🎨','兴趣爱好','留一点时间给兴趣']];
const N=[['复习 Java 集合','java',15,'quiet',1,'回顾 List、Set、Map 的核心差异'],['复习 HashMap','java',15,'quiet',1,'梳理底层结构与扩容机制'],['复习 JVM 基础','java',30,'quiet',1,'复习内存区域与垃圾回收'],['看一个 Java 八股知识点','java',10,'noisy',0,'用自己的话讲清一个知识点'],['熟悉 Redis 基本数据类型','redis',10,'noisy',0,'回忆 String、Hash、List、Set、ZSet'],['敲一遍 SET / GET / DEL','redis',10,'noisy',0,'SET name Tony\nGET name\nDEL name\n不要只是看。'],['学习 Redis Key 命令','redis',10,'noisy',0,'练习 EXISTS、EXPIRE、TTL'],['学习缓存穿透','redis',15,'quiet',1,'理解原因与布隆过滤器方案'],['学习缓存击穿','redis',15,'quiet',1,'理解互斥锁与逻辑过期'],['学习缓存雪崩','redis',15,'quiet',1,'整理三种应对方式'],['了解 Jedis','redis',15,'quiet',1,'读一段 Jedis 基本用法'],['了解 Spring Data Redis','redis',30,'quiet',1,'认识 RedisTemplate'],['阅读项目代码 15 分钟','dianping',15,'quiet',1,'挑一个接口，从 Controller 追到数据库'],['理解 Redis 在项目中的作用','dianping',15,'quiet',1,'记录项目中使用缓存的场景'],['回顾缓存相关代码','dianping',30,'quiet',1,'对照代码写出流程'],['整理今天遇到的问题','dianping',10,'noisy',0,'写下问题、原因和下一步'],['阅读《苏菲的世界》10 分钟','mind',10,'noisy',0,'读完后记一句印象最深的话'],['阅读认知提升文章 15 分钟','mind',15,'noisy',0,'摘录一个值得实践的观点'],['写 3 分钟学习反思','mind',5,'noisy',0,'今天学到了什么？'],['背 10 个单词','english',10,'noisy',0,'选择一组词，遮住中文自测'],['复习 20 个单词','english',15,'noisy',0,'快速回忆词义并造句'],['阅读一段英语文章','english',15,'quiet',0,'标记三个生词'],['听 10 分钟英语内容','english',10,'noisy',0,'听完复述大意']];
const LEGACY_GOALS=[['java','💻','Java 后端','夯实 Java 后端能力'],['redis','🔴','Redis','掌握缓存与数据结构'],['dianping','🏗','黑马点评','推进项目实战'],['mind','📚','认知提升','保持阅读和思考'],['english','🇬🇧','英语','让英语成为日常输入'],['other','🧩','其他','随手记录']];
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
function freshData(){let now=new Date().toISOString();return{version:2,goals:G.map(x=>({id:x[0],icon:x[1],name:x[2],description:x[3]})),tasks:[{id:'default-reading-books',name:'读推荐书籍',goalId:'cognition',minutes:30,env:'quiet',computer:false,description:'阅读推荐书籍，记录值得记住的内容。',createdAt:now,updatedAt:now,enabled:true},{id:'default-mysql-course',name:'MySQL课程',goalId:'professional',minutes:60,env:'quiet',computer:true,description:'学习 MySQL 课程并整理关键知识点。',createdAt:now,updatedAt:now,enabled:true},{id:'default-vocabulary',name:'背单词',goalId:'hobby',minutes:20,env:'noisy',computer:false,description:'选择一组单词，遮住释义自测。',createdAt:now,updatedAt:now,enabled:true}],completed:[],preferences:{time:10,env:'noisy'},theme:'light',defaultTasksSeeded:true}}
function seedDefaultTasks(x){if(x.defaultTasksSeeded)return x;let defaults=freshData();defaults.goals.forEach(g=>{if(!x.goals.some(old=>old.id===g.id))x.goals.push(g)});defaults.tasks.forEach(t=>{if(!x.tasks.some(old=>old.id===t.id))x.tasks.push(t)});x.defaultTasksSeeded=true;return x}

// Keep the v2 keys and unknown user fields. Migration is additive, never a reset.
function validateData(x){
  const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),text=v=>typeof v==='string'&&v.trim().length>0;
  const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>=0;
  if(!object(x)||![undefined,1,2].includes(x.version)||!Array.isArray(x.goals)||!Array.isArray(x.tasks)||!Array.isArray(x.completed))throw Error('数据必须包含目标、任务和完成记录数组，且版本为 v1 或 v2。');
  let goalIds=new Set(),taskIds=new Set();
  for(let g of x.goals){
    if(!object(g)||!text(g.id)||!text(g.name)||goalIds.has(g.id))throw Error('目标数据无效：名称不能为空，ID 必须唯一。');
    if(['icon','description'].some(k=>g[k]!==undefined&&typeof g[k]!=='string'))throw Error('目标图标或说明无效。');
    goalIds.add(g.id);
  }
  for(let t of x.tasks){
    if(!object(t)||!text(t.id)||taskIds.has(t.id)||!text(t.name)||!Number.isFinite(t.minutes)||t.minutes<1||t.minutes>1440||!['quiet','noisy','class'].includes(t.env)||typeof t.computer!=='boolean'||t.goalId!=null&&(typeof t.goalId!=='string'||!goalIds.has(t.goalId)))throw Error('任务数据无效：请检查 ID、名称、时长、环境和所属目标。');
    if(t.description!==undefined&&typeof t.description!=='string'||t.enabled!==undefined&&typeof t.enabled!=='boolean')throw Error('任务说明或启用状态无效。');
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
  migrated.completed=normalizeCompletedRecords(migrated.completed);
  migrated.preferences={time:10,env:'noisy',computerReady:false,...migrated.preferences};
  migrated.theme=migrated.theme||'light';
  return seedDefaultTasks(migrated);
}

let storageBlocked=false,firstUse=false,originalMain=null,originalTimer=null,pendingImport=null;
const storageFailures=new Map();
function downloadText(content,name,type='application/json'){
  try{let a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){notify('导出失败，请检查浏览器下载权限后重试。')}
}
function protectData(message){
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
  document.querySelectorAll('header, main, footer, #timer, #modal, #goalEditor, #confirmLayer').forEach(el=>el.inert=true);
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
  time=Number(d.preferences.time);env=d.preferences.env;computerReady=!!d.preferences.computerReady;
  document.documentElement.dataset.theme=d.theme;
  document.querySelectorAll('#times button').forEach(x=>x.classList.toggle('on',Number(x.dataset.v)===time));
  document.querySelectorAll('#envs button').forEach(x=>x.classList.toggle('on',x.dataset.v===env));
  if($('computerReady'))$('computerReady').checked=computerReady;
}
function save(candidate=d){
  if(storageBlocked)return false;
  try{let serialized=JSON.stringify({...candidate,version:2});localStorage.setItem('whatToDoData',serialized);dataSnapshot=serialized;originalMain=serialized;clearStorageFailure('whatToDoData');return true}
  catch(e){d=JSON.parse(dataSnapshot);syncRuntimePreferences();storageFailure('whatToDoData',e);return false}
}
let d=loadData(),time=Number(d.preferences.time),env=d.preferences.env,computerReady=!!d.preferences.computerReady,cur=null;
let dataSnapshot=JSON.stringify(d);
if(firstUse&&!storageBlocked)save();
function persistPreferences(){d.preferences={...d.preferences,time,env,computerReady};return save()}
// User strings are text, option values are data, and event handlers are functions.
// Tags, classes and button IDs passed to these helpers are fixed application code.
function textElement(tag,text='',className=''){
  let node=document.createElement(tag);node.className=className;node.textContent=text??'';return node;
}
function actionButton(label,action,className,id){
  let button=textElement('button',label,className);button.type='button';button.onclick=action;if(id)button.id=id;return button;
}
function renderGoalOptions(select,includeAll=false){
  let options=includeAll?[textElement('option','全部目标')]:[];
  if(includeAll)options[0].value='';
  d.goals.forEach(g=>{let option=textElement('option',(g.icon||'')+' '+g.name);option.value=g.id;options.push(option)});
  select.replaceChildren(...options);
}
function page(id){if(id==='home'){cur=null;$('rec').classList.add('hide');$('rec').replaceChildren();random()}document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===id));if(id==='tasks')tasks();if(id==='goals')goals();if(id==='today')today();location.hash=id}
document.querySelectorAll('[data-page]').forEach(x=>x.onclick=()=>page(x.dataset.page));$('browse').onclick=()=>page('tasks');document.querySelectorAll('#times button').forEach(x=>x.onclick=()=>{time=+x.dataset.v;if(!persistPreferences())return;document.querySelectorAll('#times button').forEach(y=>y.classList.toggle('on',y===x))});document.querySelectorAll('#envs button').forEach(x=>x.onclick=()=>{env=x.dataset.v;if(!persistPreferences())return;document.querySelectorAll('#envs button').forEach(y=>y.classList.toggle('on',y===x))});
function ok(t){return t.enabled!==false&&t.minutes<=time&&(!t.goalId||!!gn(t.goalId))&&(!t.computer||computerReady)&&(env==='class'?!t.computer&&t.env==='class':env==='noisy'?t.env==='noisy':t.env==='quiet')}
function random(){let doneRecently=new Set(d.completed.filter(c=>Date.now()-new Date(c.completedAt||c.date||0).getTime()<7*86400000).map(c=>c.taskId)),all=d.tasks.filter(ok),a=all.filter(t=>!doneRecently.has(t.id));if(!a.length)a=all;cur=a.length?a[Math.floor(Math.random()*a.length)]:null;let b=$('rec');
  if(!cur){
    b.replaceChildren(textElement('p','没有完全符合当前时间、环境和设备条件的启用任务。请调整条件或添加任务。'),actionButton('去任务库',()=>page('tasks'),'secondary','openTasks'));
    b.classList.remove('hide');return;
  }
  let intro=textElement('p'),meta=textElement('div','','meta'),actions=textElement('div','','actions');
  intro.append(textElement('small','为你挑好了'));
  meta.append(textElement('span','⏱ '+cur.minutes+' 分钟'),textElement('span',en(cur.env)),textElement('span',cur.computer?'💻 需要电脑':'📱 手机即可'));
  actions.append(actionButton('开始任务',()=>run(cur),'primary','start'),actionButton('换一个',random,'secondary','again'));
  b.replaceChildren(intro,textElement('h2',cur.name,'user-text'),textElement('p',cur.description||'','muted user-text'),meta,actions);
  b.classList.remove('hide');
}$('random').onclick=random;
function run(t){cur=t;startTimer(t)}
function startTimer(t){if(timerState()){renderTimer();return}if(!t||d.tasks.some(x=>x.id===t.id&&x.enabled===false))return;primeTimerAudio();let now=Date.now(),plannedMs=Math.max(1,Number(t.minutes)||0)*60000,x={completionId:'c'+now+Math.random().toString(36).slice(2),taskId:t.id,task:{...t},taskName:t.name,goalId:t.goalId,goalName:gn(t.goalId)?.name||'已删除目标',plannedDurationMs:plannedMs,durationMs:plannedMs,extensionDurationMs:0,elapsed:0,lastStarted:now,startedAt:now,paused:false,finished:false,soundPlayed:false,pausedDurationMs:0,pauseStartedAt:0};if(!setTimerState(x))return;renderTimer();startTimerLoop()}
let timerTick=null,timerAudio=null;
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
function renderTimer(){let x=timerState();if(!x||d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){$('timer').classList.add('hide');$('timerActions').replaceChildren();$('timerActions').dataset.mode='';stopTimerLoop();return}let t=timerTask(x);if(!t){protectData('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。');return}let left=remainingMs(x),plannedMs=plannedDurationMs(x),extensionMs=Number.isFinite(x.extensionDurationMs)?x.extensionDurationMs:0;$('timerName').textContent=t.name;$('timerDesc').textContent=t.description||'';$('timerClock').textContent=formatClock(left);$('timerProgress').style.width=Math.min(100,elapsedMs(x)/x.durationMs*100)+'%';$('timerMeta').textContent='本轮计划时长 '+formatDuration(plannedMs)+' · 已追加时长 '+formatDuration(extensionMs)+' · 当前剩余时间 '+formatDuration(left);$('timer').classList.remove('hide');$('timerStatus').textContent=x.finished?'🎉 时间到了！':x.paused?'已暂停':'正在专注';let mode=x.finished?'finished':x.paused?'paused':'running',actions=$('timerActions');if(actions.dataset.mode!==mode){actions.dataset.mode=mode;if(mode==='finished'){actions.innerHTML='<button type="button" class="primary" id="finishTimer">✓ 完成任务</button><button type="button" class="primary" id="extendTimer">追加时间</button><button type="button" class="outline" id="notDoneTimer">还没完成</button>';$('extendTimer').textContent='再给我 '+Math.round(extensionStepMs(x)/60000)+' 分钟';$('finishTimer').onclick=finishTimer;$('extendTimer').onclick=extendTimer;$('notDoneTimer').onclick=()=>{let y=timerState();if(!y)return;y.finished=false;y.paused=true;y.elapsed=y.durationMs;y.lastStarted=0;setTimerState(y);renderTimer()}}else{actions.innerHTML='<button type="button" class="primary" id="pauseTimer">暂停</button><button type="button" class="primary" id="earlyTimer">✓ 提前完成</button><button type="button" class="danger" id="giveUpTimer">放弃任务</button>';$('pauseTimer').textContent=x.paused?'继续':'暂停';$('pauseTimer').onclick=()=>{let y=timerState();if(!y)return;y.paused?resumeTimer():pauseTimer()};$('earlyTimer').onclick=confirmEarly;$('giveUpTimer').onclick=giveUpTimer}}else if(mode==='paused'){$('pauseTimer').textContent='继续'}}

function pauseTimer(){let x=timerState();if(!x||x.finished)return;if(!x.paused){let now=Date.now();advanceTimerIfNeeded(x,now);x=timerState();if(!x||x.finished)return;x.elapsed=elapsedMs(x,now);x.paused=true;x.pauseStartedAt=now;x.lastStarted=0;if(!setTimerState(x))return;stopTimerLoop();renderTimer()}}
function resumeTimer(){let x=timerState();if(!x||x.finished)return;if(!x.paused)return;let now=Date.now();if(Number.isFinite(x.pauseStartedAt))x.pausedDurationMs=(x.pausedDurationMs||0)+Math.max(0,now-x.pauseStartedAt);x.pauseStartedAt=0;x.paused=false;x.lastStarted=now;if(!setTimerState(x))return;renderTimer();startTimerLoop()}
function closeConfirm(){pendingImport=null;$('confirmLayer').classList.add('hide')}
function giveUpTimer(){openConfirm('giveup')}
function openConfirm(type,id){let isDelete=type==='delete',isGoalDelete=type==='deleteGoal',t=isDelete?d.tasks.find(x=>x.id===id):null,g=isGoalDelete?d.goals.find(x=>x.id===id):null,task=isDelete?t:isGoalDelete?g:(timerState()?timerTask(timerState()):null),otherGoal=isGoalDelete?d.goals.find(x=>x.id!==id):null;$('confirmKicker').textContent=isDelete||isGoalDelete?'删除'+(isGoalDelete?'目标':'任务')+'？':type==='early'?'提前完成？':type==='import'?'导入备份？':'放弃任务？';$('confirmTitle').textContent=isDelete||isGoalDelete?'确定删除这个'+(isGoalDelete?'目标':'任务')+'吗？':type==='early'?'已经完成这个任务了吗？':type==='import'?'用备份替换当前目标、任务、偏好与完成记录？':'确定放弃这个任务吗？';$('confirmText').textContent=isDelete?'删除后将无法在任务库中继续使用。':isGoalDelete?d.tasks.some(x=>x.goalId===id)?(otherGoal?'该目标下的任务将转移到“'+otherGoal.name+'”，不会删除任务。':'该目标仍有任务；请先新增其他目标或逐项转移任务，之后才能删除。'):'该目标下没有任务。':type==='early'?'确认后会按实际计时记录。':type==='import'?'导入前已校验备份结构；现有对应数据将被替换。主题及备份中的其他主数据也将被替换；当前活动计时保持不变，不随备份导入。':'当前计时不会计入完成记录。';$('confirmTaskName').textContent=type==='import'?'备份数据将替换当前本地数据。':task?.name||'';$('confirmTaskDesc').textContent=task?.description||'';$('confirmCancel').textContent=isDelete||isGoalDelete||type==='import'?'取消':type==='early'?'继续计时':'继续任务';$('confirmAccept').textContent=isDelete||isGoalDelete?'删除'+(isGoalDelete?'目标':'任务'):type==='early'?'✓ 完成任务':type==='import'?'确认导入':'放弃任务';$('confirmAccept').className=isDelete||isGoalDelete||type==='giveup'?'danger':'primary';$('confirmAccept').onclick=isDelete?()=>{d.tasks=d.tasks.filter(x=>x.id!==id);if(!save())return;closeConfirm();tasks()}:isGoalDelete?()=>{if(!otherGoal&&d.tasks.some(x=>x.goalId===id)){closeConfirm();notify('请先新增另一个目标或转移该目标下的任务。');return}d.goals=d.goals.filter(x=>x.id!==id);d.tasks.forEach(x=>{if(x.goalId===id)x.goalId=otherGoal?.id||null;x.updatedAt=new Date().toISOString()});if(!save())return;closeConfirm();goals()}:type==='early'?()=>{closeConfirm();finishTimer()}:type==='import'?applyImport:()=>{if(!setTimerState(null))return;closeConfirm();stopTimerLoop();cur=null;renderTimer();page('home')};$('confirmCancel').onclick=closeConfirm;$('confirmLayer').classList.remove('hide')}function confirmEarly(){openConfirm('early')}
function finishTimer(){let x=timerState();if(!x)return;let t=timerTask(x);if(!t){protectData('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。');return}if(d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){setTimerState(null);renderTimer();return}let endedAt=Date.now(),actualMs=elapsedMs(x,endedAt),pausedMs=(x.pausedDurationMs||0)+(x.paused&&Number.isFinite(x.pauseStartedAt)?Math.max(0,endedAt-x.pauseStartedAt):0),plannedMs=Number.isFinite(x.plannedDurationMs)?x.plannedDurationMs:Math.max(0,x.durationMs-(x.extensionDurationMs||0)),extensionMs=Number.isFinite(x.extensionDurationMs)?x.extensionDurationMs:0,taskName=x.taskName||x.task?.name||t.name,goalId=x.goalId||x.task?.goalId||t.goalId,goalName=x.goalName||gn(goalId)?.name||'已删除目标',actual=Math.round(actualMs/600)/100,now=new Date(endedAt).toISOString();d.completed.push({recordId:x.completionId,completionId:x.completionId,taskId:x.taskId,taskName,goalId,goalName,startedAt:Number.isFinite(x.startedAt)?x.startedAt:null,endedAt,completedAt:now,date:now,plannedDuration:plannedMs/60000,actualDurationMs:actualMs,actualDuration:actual,minutes:actual,pausedDurationMs:pausedMs,extensionDurationMs:extensionMs,extensionDuration:extensionMs/60000});if(!save())return;stopTimerLoop();setTimerState(null);cur=null;$('rec').replaceChildren();$('rec').classList.add('hide');renderTimer();page('today')}
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
let goalLayer=document.createElement('div');goalLayer.className='modal hide';goalLayer.id='goalEditor';goalLayer.innerHTML='<div class="dialog"><button type="button" class="x" id="goalEditorClose">×</button><h2 id="goalEditorTitle">新增目标</h2><form id="goalEditorForm"><input type="hidden" id="goalEditorId"><label>目标名称<input id="goalEditorName" maxlength="60" required></label><label>图标<input id="goalEditorIcon" maxlength="8" value="🎯"></label><label>简短说明<textarea id="goalEditorDesc" rows="2"></textarea></label><button class="primary">保存目标</button></form></div>';document.body.append(goalLayer);$('goalEditorClose').onclick=()=>goalLayer.classList.add('hide');function showGoalEditor(id){let g=gn(id);$('goalEditorId').value=g?.id||'';$('goalEditorTitle').textContent=g?'编辑目标':'新增目标';$('goalEditorName').value=g?.name||'';$('goalEditorIcon').value=g?.icon||'🎯';$('goalEditorDesc').value=g?.description||'';goalLayer.classList.remove('hide');$('goalEditorName').focus()}$('goalEditorForm').onsubmit=e=>{e.preventDefault();let name=$('goalEditorName').value.trim();if(!name){notify('目标名称不能为空。');return}let id=$('goalEditorId').value,now=new Date().toISOString();if(id){let g=gn(id);if(g)Object.assign(g,{name,icon:$('goalEditorIcon').value.trim()||'🎯',description:$('goalEditorDesc').value.trim(),updatedAt:now})}else d.goals.push({id:'g'+Date.now(),name,icon:$('goalEditorIcon').value.trim()||'🎯',description:$('goalEditorDesc').value.trim(),createdAt:now,updatedAt:now});if(!save())return;goalLayer.classList.add('hide');goals();random()};$('newGoal').onclick=()=>showGoalEditor();
document.querySelector('#envs').insertAdjacentHTML('afterend','<label id="computerReadyLabel" style="display:block;margin-top:12px;color:var(--m)"><input type="checkbox" id="computerReady"> 我现在方便使用电脑</label>');$('computerReady').checked=computerReady;$('computerReady').onchange=()=>{computerReady=$('computerReady').checked;persistPreferences()};document.querySelectorAll('#times button').forEach(x=>x.classList.toggle('on',+x.dataset.v===time));document.querySelectorAll('#envs button').forEach(x=>x.classList.toggle('on',x.dataset.v===env));
$('form').addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();let id=$('tid').value,name=$('name').value.trim(),minutes=+$('mins').value,goalId=$('goal').value;if(!name||!Number.isFinite(minutes)||minutes<1||minutes>1440||!gn(goalId)){notify('请填写名称、1–1440 分钟时长和有效所属目标。');return}let old=d.tasks.find(t=>t.id===id),now=new Date().toISOString(),t={...old,id:id||'t'+Date.now(),name,goalId,minutes,env:$('environment').value,computer:$('computer').checked,description:$('desc').value.trim(),createdAt:old?.createdAt||now,updatedAt:now,enabled:old?.enabled!==false};if(id)d.tasks=d.tasks.map(x=>x.id===id?t:x);else d.tasks.push(t);if(!save())return;$('modal').classList.add('hide');tasks();random();notify('任务已保存。')},true);
function restoreTimer(){let x=timerState();if(!x)return;if(!timerTask(x)){protectData('活动计时关联的任务信息缺失。原始计时已保留，请导出计时原文后检查。');return}if(x.completionId&&d.completed.some(c=>(c.completionId||c.recordId)===x.completionId)){setTimerState(null);return}if(!x.completionId)x.completionId='legacy-'+x.taskId+'-'+x.lastStarted;if(!Number.isFinite(x.extensionDurationMs))x.extensionDurationMs=0;if(!Number.isFinite(x.plannedDurationMs))x.plannedDurationMs=Math.max(0,x.durationMs-x.extensionDurationMs);if(JSON.stringify(x)!==originalTimer&&!setTimerState(x)){renderTimer();return}if(!x.finished&&!x.paused)advanceTimerIfNeeded(x);renderTimer();if(!x.finished&&!x.paused)startTimerLoop()}document.addEventListener('visibilitychange',()=>{if(!document.hidden){let x=timerState();if(x&&!x.paused&&!x.finished)advanceTimerIfNeeded(x);renderTimer()}});
function tasks(){
  let s=$('fg'),previousGoal=s.value;renderGoalOptions(s,true);s.value=previousGoal;
  let a=d.tasks.filter(t=>t.enabled!==false&&(!s.value||t.goalId===s.value)&&(!$('ft').value||($('ft').value==='60'?t.minutes>=60:t.minutes<=+$('ft').value))&&(!$('fe').value||t.env===$('fe').value)&&(!$('fc').checked||t.computer)&&(!$('fd').checked||d.completed.some(c=>c.taskId===t.id)));
  let cards=a.map((t,i)=>{
    let card=textElement('article','','card'),meta=textElement('div','','meta'),actions=textElement('div','','actions'),goal=gn(t.goalId);
    meta.append(textElement('span',(goal?.icon||'🧩')+' '+(goal?.name||'其他'),'user-text'),textElement('span','⏱ '+t.minutes+' 分钟'));
    for(let [action,label] of [['start','开始'],['edit','编辑'],['delete','删除']]){
      let button=textElement('button',label,'small');button.type='button';button.dataset.taskAction=action;button.dataset.taskIndex=String(i);actions.append(button);
    }
    card.append(textElement('h3',t.name,'user-text'),textElement('p',t.description,'user-text'),meta,actions);return card;
  });
  $('taskList').replaceChildren(...(cards.length?cards:[textElement('p','没有符合条件的任务。','muted')]));
  $('taskList').onclick=e=>{let button=e.target.closest?.('button[data-task-action]');if(!button||!$('taskList').contains(button))return;e.preventDefault();let t=a[Number(button.dataset.taskIndex)];if(!t)return;let action=button.dataset.taskAction;if(action==='start')run(t);else if(action==='edit')edit(t);else delTask(t.id)};
}['fg','ft','fe','fc','fd'].forEach(x=>$(x).onchange=tasks);
function goals(){
  let cards=d.goals.map(g=>{
    let a=d.tasks.filter(t=>t.goalId===g.id),n=a.filter(t=>d.completed.some(c=>c.taskId===t.id)).length,p=a.length?Math.round(n/a.length*100):0;
    let card=textElement('article','','card'),progress=textElement('div','','progress'),bar=document.createElement('i'),actions=textElement('div','','actions');
    bar.style.width=p+'%';progress.append(bar);
    actions.append(actionButton('添加任务',()=>newTask(g.id),'small'),actionButton('编辑目标',()=>showGoalEditor(g.id),'small'),actionButton('删除目标',()=>delGoal(g.id),'small'));
    card.append(textElement('h3',(g.icon||'')+' '+g.name,'user-text'),textElement('p',g.description,'user-text'),progress,textElement('small',n+'/'+a.length+' 个任务已完成'),actions);return card;
  });
  $('goalList').replaceChildren(...cards);
}
function today(){
  let day=new Date().toDateString(),a=d.completed.filter(c=>c&&new Date(c.completedAt||c.date||0).toDateString()===day),totalMs=a.reduce((s,c)=>s+(recordDurationMs(c)||0),0);
  $('date').textContent=new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric'}).format(new Date());
  let list=a.map(c=>{
    let taskName=c.taskName||d.tasks.find(t=>t.id===c.taskId)?.name||'已删除任务',goalName=c.goalName||gn(c.goalId)?.name||'已删除目标',actualMs=recordDurationMs(c),planned=c.plannedDuration!==undefined&&c.plannedDuration!==null&&Number.isFinite(Number(c.plannedDuration))?Number(c.plannedDuration)+' 分钟':Number.isFinite(Number(c.plannedDurationMs))?formatDuration(Number(c.plannedDurationMs)):'未知',extensionMs=Number.isFinite(Number(c.extensionDurationMs))?Number(c.extensionDurationMs):Number.isFinite(Number(c.extensionDuration))?Number(c.extensionDuration)*60000:0;
    let card=textElement('article','','card history-item'),details=document.createElement('dl');
    const detail=(label,value)=>{let row=document.createElement('div');row.append(textElement('dt',label),textElement('dd',value));details.append(row)};
    detail('开始时间',formatDateTime(c.startedAt));detail('结束时间',formatDateTime(c.endedAt));detail('实际用时',formatDuration(actualMs));detail('原始计划',planned);
    if(extensionMs>0)detail('追加时长',formatDuration(extensionMs));
    card.append(textElement('h3',taskName,'user-text'),textElement('p','目标：'+goalName,'muted user-text'),details);return card;
  });
  let card=textElement('div','','card'),heading=document.createElement('p'),totalHeading=document.createElement('p'),total=textElement('strong',formatDuration(totalMs));
  heading.append(textElement('b','今日完成 · '+a.length+' 个任务'));totalHeading.append(textElement('b','今日有效学习时间'));total.style.fontSize='32px';
  card.append(heading);
  if(list.length){let history=textElement('div','','history-list');history.append(...list);card.append(history)}else card.append(textElement('p','还没有记录，挑一件轻松的小事开始吧。','muted'));
  card.append(document.createElement('hr'),totalHeading,total);$('todayBox').replaceChildren(card);
}
function newTask(g){$('modal').classList.remove('hide');$('modalTitle').textContent='添加任务';$('form').reset();$('tid').value='';renderGoalOptions($('goal'));$('goal').value=g||d.goals[0]?.id||''}function edit(t){newTask();$('modalTitle').textContent='编辑任务';$('tid').value=t.id;$('name').value=t.name;$('goal').value=t.goalId;$('mins').value=t.minutes;$('environment').value=t.env;$('computer').checked=t.computer;$('desc').value=t.description}function delTask(id){openConfirm('delete',id)}function delGoal(id){openConfirm('deleteGoal',id)}$('newTask').onclick=()=>newTask();$('newGoal').onclick=()=>{showGoalEditor()};$('close').onclick=()=>$('modal').classList.add('hide');$('form').onsubmit=e=>{e.preventDefault();let id=$('tid').value,t={id:id||'t'+Date.now(),name:$('name').value.trim(),goalId:$('goal').value,minutes:+$('mins').value,env:$('environment').value,computer:$('computer').checked,description:$('desc').value.trim()};if(id)d.tasks=d.tasks.map(x=>x.id===id?t:x);else d.tasks.push(t);if(!save())return;$('modal').classList.add('hide');tasks()};$('theme').onclick=()=>{d.theme=d.theme==='dark'?'light':'dark';if(save())syncRuntimePreferences()};$('export').onclick=()=>{if(!storageBlocked)downloadText(JSON.stringify(d,null,2),'what-to-do-backup.json')};$('import').onclick=()=>$('file').click();syncRuntimePreferences();if(!storageBlocked){restoreTimer();page(location.hash.slice(1)||'home')}else protectData($('dataRecoveryMessage').textContent);
