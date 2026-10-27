const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async(scenario,fixture)=>{
 const out=path.resolve(__dirname,'../test-artifacts/timer-recovery');fs.mkdirSync(out,{recursive:true});let count=0;
 const data=()=>{const d=fixture();d.completed=[];d.theme='light';d.preferences={time:15,language:'zh-CN',conditions:{computer:false,audio:false,speech:false,interrupted:false}};d.tasks=[{id:'read',name:'读书',requirements:{},description:'从第 42 页接着读'},{id:'stretch',name:'伸展一下',requirements:{}}];return d};
 const timer=({paused=false,legacy=false,age=86400000}={})=>{const now=Date.now(),at=now-age;return{completionId:'browser-recovery',taskId:'read',task:{...data().tasks[0]},startedAt:at-480000,lastStarted:paused?0:at,elapsed:480000,plannedDurationMs:900000,durationMs:900000,extensionDurationMs:0,paused,finished:false,soundPlayed:false,pauseStartedAt:paused?at:0,pausedDurationMs:0,...(!legacy?{timerVersion:2,checkpointAt:at}:{})}};
 const check=async(name,fn,active=null)=>{await scenario(name,{whatToDoData:JSON.stringify(data()),...(active?{activeTimer:JSON.stringify(active)}:{})},{},async(...args)=>{await args[2].protocol('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await fn(...args)},{timezone:'Asia/Shanghai'});count++};
 const click=async(run,p,selector)=>{const r=await run(`const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('missing control');el.scrollIntoView({block:'nearest'});await new Promise(requestAnimationFrame);const r=el.getBoundingClientRect();if(!r.width||!r.height)throw Error('hidden '+${JSON.stringify(selector)});const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(hit!==el&&!el.contains(hit))throw Error('covered '+${JSON.stringify(selector)});return {x:r.left+r.width/2,y:r.top+r.height/2}`);await p('Input.dispatchMouseEvent',{type:'mousePressed',...r,button:'left',buttons:1,clickCount:1});await p('Input.dispatchMouseEvent',{type:'mouseReleased',...r,button:'left',buttons:0,clickCount:1});await run('await new Promise(requestAnimationFrame)')};
 const shot=async(run,p,name)=>{await run("$('appNotice')?.classList.add('hide');await document.fonts.ready;await new Promise(requestAnimationFrame)");const r=await p('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'))};
 const key=async(p,key,code,n)=>{await p('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:n,...(key==='Enter'?{text:'\r'}:{})});await p('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n})};
 await check('time up stops at zero, excludes waiting and only Continue adds time',async(run,_import,{protocol})=>{
  await run("run(d.tasks[0]);var x=timerState();x.elapsed=x.durationMs-900;x.lastStarted=Date.now();x.checkpointAt=Date.now();setTimerState(x)");
  await run('await new Promise(r=>setTimeout(r,1300))');
  assert.deepEqual(await run("return [timerState().finished,timerState().elapsed,timerState().extensionDurationMs,$('timerClock').textContent,$('finishTimer').textContent]"),[true,900000,0,'00:00','结束并记录']);
  await shot(run,protocol,'01-time-up-desktop');const up=await run('return timerState().timeUpAt');
  await run('window.__realTimerNow=Date.now;Date.now=()=>__realTimerNow()+1200000;renderTimer()');assert.equal(await run('return elapsedMs(timerState())'),900000);
  await click(run,protocol,'#extendTimer');assert.equal(await run('return timerState().extensionDurationMs'),480000);assert.equal(await run('return timerState().finished'),false);
  await run('Date.now=__realTimerNow;finishTimer()');assert.equal(await run('return d.completed.length'),1);assert.ok(up);
 });
 await check('real page reload freezes saved progress and waits for explicit resume',async(run,_import,{protocol,reload})=>{
  await run("run(d.tasks[0]);var x=timerState();x.elapsed=480000;x.startedAt=Date.now()-480000;x.lastStarted=Date.now();x.checkpointAt=Date.now();setTimerState(x)");const id=await run('return timerState().completionId');
  await reload();const elapsed=await run('return timerState().elapsed');assert.ok(elapsed>=480000&&elapsed<482000);
  assert.deepEqual(await run("return [timerState().paused,!!timerState().recoveryReason,$('timerRecovery').classList.contains('hide'),$('timerStandard').classList.contains('hide')]"),[true,true,false,true]);
  await run('await new Promise(r=>setTimeout(r,500))');assert.equal(await run('return timerState().elapsed'),elapsed);assert.equal(await run('return d.completed.length'),0);
  await shot(run,protocol,'02-reopen-desktop');await click(run,protocol,'#recoverTimer');assert.equal(await run('return timerState().completionId'),id);assert.equal(await run('return timerState().paused'),false);
 });
 for(const paused of [false,true])await check('overnight '+(paused?'paused':'running')+' recovery keeps eight minutes and starts one new segment',async(run,_import,{protocol})=>{
  assert.deepEqual(await run("return [timerState().elapsed,timerState().resumeAsNew,timerState().paused,$('recoverTimer').textContent]"),[480000,true,true,'接着做']);
  await run('renderTimer();renderTimer()');assert.equal(await run("return $('timerRecoveryRange').classList.contains('hide')"),false);
  if(paused)await shot(run,protocol,'03-long-pause-desktop');const boundary=await run('return timerState().stoppedAt');await click(run,protocol,'#recoverTimer');
  assert.equal(await run('return d.completed.length'),1);assert.equal(await run('return d.completed[0].actualDurationMs'),480000);assert.equal(await run('return d.completed[0].pausedDurationMs'),0);assert.equal(await run('return d.completed[0].endedAt'),boundary);
  assert.equal(await run('return timerState().recoveryReason||null'),null);assert.notEqual(await run('return timerState().completionId'),'browser-recovery');assert.equal(await run('return timerState().extensionDurationMs'),0);
 },timer({paused}));
 await check('ending an old segment records its original boundary without starting anything',async(run,_import,{protocol})=>{
  const boundary=await run('return timerState().stoppedAt');await click(run,protocol,'#finishRecoveryTimer');assert.equal(await run('return timerState()'),null);assert.equal(await run('return d.completed.length'),1);assert.equal(await run('return d.completed[0].endedAt'),boundary);assert.equal(await run("return $('home').classList.contains('active')"),true);
 },timer({paused:true}));
 await check('legacy timers require a duration confirmation and retain the original state for audit',async(run,_import,{protocol})=>{
  assert.equal(await run('return timerState().needsElapsedConfirmation'),true);await click(run,protocol,'#finishRecoveryTimer');assert.equal(await run('return d.completed.length'),0);assert.ok(await run("return $('recoveryError').textContent.length"));
  await run("$('recoveryMinutes').value='8'");await click(run,protocol,'#finishRecoveryTimer');assert.equal(await run('return d.completed[0].actualDurationMs'),480000);assert.equal(await run('return d.completed[0].timerRecoveryOriginal.completionId'),'browser-recovery');
 },{...timer({legacy:true}),elapsed:0});
 await check('failed history or timer writes preserve the recovery card and retry without duplicates',async(run,_import,{protocol})=>{
  const old=await run("return __rawGet('activeTimer')");await run("__faults.writeKey='whatToDoData'");await click(run,protocol,'#recoverTimer');assert.equal(await run('return d.completed.length'),0);assert.equal(await run("return __rawGet('activeTimer')"),old);
  await run("__faults.writeKey='activeTimer'");await click(run,protocol,'#recoverTimer');assert.equal(await run('return d.completed.length'),1);assert.equal(await run("return __rawGet('activeTimer')"),old);assert.equal(await run("return $('timerRecovery').classList.contains('hide')"),false);
  await run('delete __faults.writeKey');await click(run,protocol,'#recoverTimer');assert.equal(await run('return d.completed.length'),1);assert.notEqual(await run('return timerState().completionId'),'browser-recovery');
 },timer({paused:true}));
 await check('legacy recovery offers an explicit discard without saving invented time',async(run,_import,{protocol})=>{
  await click(run,protocol,'#discardRecoveryTimer');assert.equal(await run("return $('confirmCancel').textContent"),'取消');await click(run,protocol,'#confirmCancel');assert.ok(await run('return timerState()'));
  await click(run,protocol,'#discardRecoveryTimer');await click(run,protocol,'#confirmAccept');assert.equal(await run('return timerState()'),null);assert.equal(await run('return d.completed.length'),0);assert.equal(await run('return d.tasks.length'),2);
 },{...timer({legacy:true}),elapsed:0});
 await check('recovery fits narrow and dark screens, translates, and supports keyboard and touch',async(run,_import,{protocol})=>{
  for(const width of [320,390,800,1440]){await protocol('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:width<600});await run('renderTimer()');assert.equal(await run('return document.documentElement.scrollWidth<=innerWidth'),true);assert.ok(await run("const r=$('recoverTimer').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight"))}
  for(const locale of ['en','ja','zh-CN']){await run(`setLanguage('${locale}')`);assert.equal(await run("return $('finishRecoveryTimer').textContent"),{en:'End and save',ja:'終了して記録','zh-CN':'结束并记录'}[locale]);assert.equal(await run('return timerState().elapsed'),480000)}
  await protocol('Emulation.setDeviceMetricsOverride',{width:390,height:850,deviceScaleFactor:1,mobile:true});await run("setTheme('dark');renderTimer()");await shot(run,protocol,'04-long-pause-dark-mobile');
  await run("$('recoverTimer').focus()");await key(protocol,'Enter','Enter',13);assert.equal(await run('return timerState().paused'),false);
  await click(run,protocol,'#pauseTimer');const point=await run("const r=$('pauseTimer').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}");await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,80));assert.equal(await run('return timerState().paused'),false);
 },timer({paused:true}));
 console.log(count+' timer recovery browser scenarios passed; screenshots: '+out);
};
