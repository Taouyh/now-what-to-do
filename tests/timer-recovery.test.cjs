const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(timer,faults={}){const d=fixture();d.completed=[];d.preferences.time=15;const app=boot({whatToDoData:JSON.stringify(d),...(timer?{activeTimer:JSON.stringify(timer)}:{})},faults);assert.ifError(app.error);return app}
function clock(app){const t=Date.now();app.run(`var timerTestNow=${t};var OriginalTimerDate=Date;Date=class extends OriginalTimerDate{constructor(...args){super(...(args.length?args:[timerTestNow]))}static now(){return timerTestNow}}`);return ms=>app.run('timerTestNow+='+ms)}
function saved({age=86400000,paused=false,legacy=false,finished=false}={}){const now=Date.now(),at=now-age,task=fixture().tasks[0];return {completionId:'recovery-sample',taskId:task.id,task:{...task},startedAt:at-480000,lastStarted:paused?0:at,elapsed:480000,plannedDurationMs:900000,durationMs:900000,extensionDurationMs:0,paused,finished,soundPlayed:false,pausedDurationMs:1200,pauseStartedAt:paused?at:0,...(!legacy?{timerVersion:2,checkpointAt:at}:{}),...(finished?{elapsed:900000,timeUpAt:at}: {})}}
test('time up caps effective duration, fixes the end boundary and waits without automatic extensions',()=>{
 const app=setup(),advance=clock(app);app.run('run(d.tasks[0]);var x=timerState();x.elapsed=x.durationMs-5000;x.lastStarted=Date.now();x.checkpointAt=Date.now();setTimerState(x)');advance(6000);
 app.run('advanceTimerIfNeeded(timerState());renderTimer()');const timeUp=app.json('timerState()');assert.equal(timeUp.finished,true);assert.equal(timeUp.elapsed,900000);assert.equal(timeUp.extensionDurationMs,0);assert.equal(app.intervals.size,0);
 advance(300000);app.run('renderTimer();advanceTimerIfNeeded(timerState())');assert.equal(app.run('elapsedMs(timerState())'),900000);
 app.run('finishTimer()');assert.equal(app.run('d.completed[0].endedAt'),timeUp.timeUpAt);assert.equal(app.run('d.completed[0].actualDurationMs'),900000);
});
test('only an explicit Continue adds one extension and the waiting period is excluded',()=>{
 const app=setup(),advance=clock(app);app.run('run(d.tasks[0]);var x=timerState();x.elapsed=x.durationMs-1000;x.checkpointAt=Date.now();setTimerState(x)');advance(1100);app.run('advanceTimerIfNeeded(timerState())');advance(600000);
 app.run('extendTimer()');const x=app.json('timerState()');assert.equal(x.elapsed,900000);assert.equal(x.extensionDurationMs,480000);assert.equal(x.finished,false);assert.equal(app.run('remainingMs(timerState())'),480000);
 app.run('extendTimer()');assert.equal(app.run('timerState().extensionDurationMs'),480000);advance(3000);assert.equal(app.run('elapsedMs(timerState())'),903000);
});
test('periodic checkpoints and a normal close preserve progress and reopening does not add offline time',()=>{
 const app=setup(),advance=clock(app);app.run('run(d.tasks[0])');advance(6000);app.run('checkpointTimer()');assert.equal(app.run('timerState().elapsed'),6000);
 advance(2000);app.run("nativeTimerLifecycle('close')");const closed=app.json('timerState()');assert.equal(closed.elapsed,8000);assert.equal(closed.paused,true);assert.equal(closed.recoveryReason,'reopen');
 const again=boot(Object.fromEntries(app.values));assert.ifError(again.error);assert.equal(again.run('timerState().elapsed'),8000);assert.equal(again.intervals.size,0);assert.equal(again.run('d.completed.length'),0);
 again.run('resumeRecoveredTimer()');assert.equal(again.run('timerState().completionId'),closed.completionId);assert.equal(again.run('timerState().paused'),false);assert.equal(again.run('timerState().pausedDurationMs'),0);
});
test('overnight running and paused snapshots both recover only their saved duration, without overnight pauses',()=>{
 for(const paused of [false,true]){
  const input=saved({paused}),app=setup(input);assert.equal(app.run('timerState().elapsed'),480000);assert.equal(app.run('timerState().resumeAsNew'),true);assert.equal(app.run('timerState().extensionDurationMs'),0);assert.equal(app.intervals.size,0);
  app.run('finishTimer()');const record=app.json('d.completed[0]');assert.equal(record.actualDurationMs,480000);assert.equal(record.pausedDurationMs,1200);assert.equal(record.endedAt,paused?input.pauseStartedAt:input.checkpointAt);
 }
});
test('long recovery saves one old segment and starts a new session of the same activity',()=>{
 const app=setup(saved({paused:true})),old=app.json('timerState()');app.run('resumeRecoveredTimer();resumeRecoveredTimer()');const current=app.json('timerState()');
 assert.notEqual(current.completionId,old.completionId);assert.equal(current.taskId,old.taskId);assert.equal(current.elapsed,0);assert.equal(current.paused,false);assert.equal(app.run('d.completed.length'),1);assert.equal(app.run('d.completed[0].actualDurationMs'),480000);assert.equal(app.run('d.completed[0].endedAt'),old.stoppedAt);
});
test('failed old-segment save never starts a new timer; failed timer replacement retries without duplicates',()=>{
 for(const failKey of ['whatToDoData','activeTimer']){
  const app=setup(saved({paused:true})),oldRaw=app.values.get('activeTimer');app.faults.writeKey=failKey;
  assert.equal(app.run('resumeRecoveredTimer()'),false);assert.equal(app.values.get('activeTimer'),oldRaw);assert.equal(app.run('timerState().paused'),true);
  assert.equal(app.run('d.completed.length'),failKey==='whatToDoData'?0:1);
  delete app.faults.writeKey;assert.equal(app.run('resumeRecoveredTimer()'),true);assert.equal(app.run('d.completed.length'),1);assert.notEqual(app.run('timerState().completionId'),'recovery-sample');
 }
});
test('short pauses remain in the same session; long pauses become a frozen previous segment',()=>{
 const app=setup(),advance=clock(app);app.run('run(d.tasks[0])');advance(8000);app.run('pauseTimer()');const id=app.run('timerState().completionId');
 advance(10000);app.run('resumeTimer()');assert.equal(app.run('timerState().pausedDurationMs'),10000);assert.equal(app.run('timerState().completionId'),id);advance(1000);app.run('pauseTimer()');
 advance(3600001);app.run('resumeTimer()');assert.equal(app.run('timerState().resumeAsNew'),true);assert.equal(app.run('timerState().elapsed'),9000);assert.equal(app.run('timerState().pausedDurationMs'),10000);assert.equal(app.run('timerState().paused'),true);
});
test('unexpected heartbeat gaps and native sleep do not get charged as effective time',()=>{
 for(const event of ['sleep','checkpoint']){
  const app=setup(),advance=clock(app);app.run('run(d.tasks[0])');advance(6000);app.run('checkpointTimer()');advance(86400000);
  app.run(`nativeTimerLifecycle('${event}')`);assert.equal(app.run('timerState().elapsed'),6000);assert.equal(app.run('timerState().recoveryReason'),'interrupted');assert.equal(app.run('timerState().paused'),true);
 }
});
test('a bounded background interval reaches time up while a very long background gap waits for recovery',()=>{
 for(const gap of [16*60000,24*3600000]){
  const app=setup(),advance=clock(app);app.run('run(d.tasks[0])');advance(6000);app.run("nativeTimerLifecycle('background')");advance(gap);app.run("nativeTimerLifecycle('resume')");
  assert.equal(app.run('timerState().extensionDurationMs'),0);
  if(gap<3600000){assert.equal(app.run('timerState().finished'),true);assert.equal(app.run('timerState().elapsed'),900000)}else{assert.equal(app.run('timerState().paused'),true);assert.equal(app.run('timerState().elapsed'),6000)}
 }
});
test('an old running timer needs a deliberate duration confirmation and retains its original snapshot',()=>{
 const input=saved({legacy:true});input.elapsed=0;const app=setup(input),main=app.values.get('whatToDoData');assert.equal(app.run('timerState().needsElapsedConfirmation'),true);assert.equal(app.run('d.completed.length'),0);
 assert.equal(app.run('finishTimer()'),false);assert.equal(app.values.get('whatToDoData'),main);
 app.elements.get('recoveryMinutes').value='8';assert.equal(app.run('finishTimer()'),true);const record=app.json('d.completed[0]');assert.equal(record.actualDurationMs,480000);assert.deepEqual(record.timerRecoveryOriginal,input);
});
test('legacy paused progress is recoverable without guessing its offline duration',()=>{
 const input=saved({legacy:true,paused:true}),app=setup(input);assert.equal(app.run('timerState().needsElapsedConfirmation'),false);app.run('finishTimer()');assert.equal(app.run('d.completed[0].actualDurationMs'),480000);assert.equal(app.run('d.completed[0].pausedDurationMs'),1200);
});
test('an uncertain legacy session can be explicitly discarded without inventing a zero-duration record',()=>{
 const app=setup(saved({legacy:true}));app.elements.get('discardRecoveryTimer').click();assert.equal(app.elements.get('confirmCancel').textContent,'取消');
 app.elements.get('confirmCancel').click();assert.ok(app.run('timerState()'));assert.equal(app.run('d.completed.length'),0);
 app.elements.get('discardRecoveryTimer').click();app.elements.get('confirmAccept').click();assert.equal(app.run('timerState()'),null);assert.equal(app.run('d.completed.length'),0);assert.equal(app.run('d.tasks.length'),fixture().tasks.length);
});
test('an expired session left overnight starts a fresh segment rather than extending yesterday',()=>{
 const app=setup(saved({finished:true}));assert.equal(app.run('timerState().resumeAsNew'),true);app.run('resumeRecoveredTimer()');assert.equal(app.run('d.completed[0].actualDurationMs'),900000);assert.equal(app.run('timerState().elapsed'),0);assert.equal(app.run('timerState().extensionDurationMs'),0);
});
