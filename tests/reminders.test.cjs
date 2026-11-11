const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(){const calls=[],data=fixture();data.completed=[];data.preferences.time=15;const app=boot({whatToDoData:JSON.stringify(data)},{},{nativeApp:{syncReminder:p=>calls.push(p)}});assert.ifError(app.error);app.run('var now=Date.now();var RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}');return {app,calls};}
test('background, sleep and closed-app deadlines cap the round and never replay sound',()=>{
 for(const event of ['background','sleep','close']){
  const {app}=setup();app.run("run(d.tasks[0]);nativeTimerLifecycle('"+event+"');now+=86400000;nativeTimerLifecycle('resume')");
  assert.equal(app.run('timerState().finished'),true);assert.equal(app.run('timerState().elapsed'),900000);assert.equal(app.run('timerState().soundPlayed'),true);assert.equal(app.run('d.completed.length'),0);
  app.run('now+=86400000;nativeTimerLifecycle("resume");restoreTimer()');assert.equal(app.run('timerState().recoveryReason'),undefined);assert.equal(app.run('timerState().elapsed'),900000);assert.equal(app.run('timerState().extensionDurationMs'),0);
 }
});
test('one native deadline per round; pause cancels, continue reschedules, finish clears',()=>{
 const {app,calls}=setup();app.run('run(d.tasks[0])');const first=calls.at(-1);assert.ok(first.at);assert.equal(first.title,'这一轮时间到了');assert.equal(first.sound,true);assert.equal(first.vibration,false);
 app.run('now+=1000;checkpointTimer(true)');assert.equal(calls.at(-1).at,first.at);
 app.run('pauseTimer()');assert.equal(calls.at(-1),null);
 app.run('now+=1000;resumeTimer()');assert.equal(calls.at(-1).at,first.at+1000);
 app.run("setReminderPreference('sound',false);setReminderPreference('vibration',true)");assert.equal(calls.at(-1).sound,false);assert.equal(calls.at(-1).vibration,true);
 app.run('now+=900000;advanceTimerIfNeeded(timerState())');assert.equal(calls.at(-1),null);
 app.run('extendTimer()');assert.notEqual(calls.at(-1).key,first.key);assert.ok(calls.at(-1).at>app.run('Date.now()'));
 app.run('finishTimer()');assert.equal(calls.at(-1),null);assert.equal(app.run('d.completed.length'),1);
});
test('notification activation returns to the current session without committing it',()=>{
 const {app}=setup();app.run('run(d.tasks[0]);now+=900001;nativeTimerLifecycle("notification")');assert.equal(app.run('timerState().finished'),true);assert.equal(app.run('d.completed.length'),0);assert.equal(app.run('timerView'),'full');
});
test('failed reminder preference save restores previous preference and does not change delivery',()=>{
 const {app,calls}=setup();app.run('run(d.tasks[0])');app.faults.writeKey='whatToDoData';assert.equal(app.run("setReminderPreference('sound',false)"),false);assert.equal(app.run('reminderPreferences().sound'),true);assert.equal(calls.at(-1).sound,true);
});
test('foreground sound is one-shot and muted or returning sessions never play it',()=>{
 for(const mode of ['foreground','muted','resume']){
  const {app}=setup();app.run("var notes=0;window.AudioContext=class{state='running';currentTime=0;destination={};createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}createOscillator(){return{frequency:{},connect(){},start(){notes++},stop(){}}}}");
  if(mode==='muted')app.run("setReminderPreference('sound',false)");
  app.run('run(d.tasks[0]);now+=900000');
  app.run(mode==='resume'?"nativeTimerLifecycle('resume')":'advanceTimerIfNeeded(timerState())');
  app.run('advanceTimerIfNeeded(timerState());playTimeUpSound(timerState());renderTimer()');
  assert.equal(app.run('notes'),mode==='foreground'?3:0);assert.equal(app.run('timerState().soundPlayed'),true);
 }
});
test('consumed foreground and restored rounds never re-arm when backgrounded',()=>{
 for(const arrival of ['foreground','resume','restore']){
  const {app,calls}=setup();app.run('run(d.tasks[0]);now+=900001');
  app.run(arrival==='foreground'?'advanceTimerIfNeeded(timerState())':arrival==='resume'?"nativeTimerLifecycle('resume')":'restoreTimer()');
  assert.equal(app.run('timerState().reminderConsumed'),true);
  calls.length=0;app.run("now+=1000;nativeTimerLifecycle('background')");assert.equal(calls.at(-1),null);
  app.run("nativeTimerLifecycle('resume');nativeTimerLifecycle('background')");assert.equal(calls.at(-1),null);
 }
});
test('pending background arrival remains armed until the foreground consumes it',()=>{
 const {app,calls}=setup();app.run("run(d.tasks[0]);nativeTimerLifecycle('background');now+=900001;advanceTimerIfNeeded(timerState())");
 assert.ok(calls.at(-1));assert.equal(app.run('timerState().reminderConsumed'),false);
 app.run("nativeTimerLifecycle('resume');nativeTimerLifecycle('background')");assert.equal(calls.at(-1),null);
});
test('locking a known running round does not pause it, including a pre-upgrade live round',()=>{
 for(const old of [false,true]){
  const {app}=setup();app.run('run(d.tasks[0]);now+=5000;checkpointTimer(true)');
  if(old)app.run('var x=timerState();delete x.reminderVersion;setTimerState(x)');
  app.run("nativeTimerLifecycle('sleep');now+=60000;nativeTimerLifecycle('resume')");
  assert.equal(app.run('timerState().paused'),false);assert.equal(app.run('timerState().recoveryReason'),undefined);assert.equal(app.run('elapsedMs(timerState())'),65000);
  app.run("nativeTimerLifecycle('sleep');now+=900000;nativeTimerLifecycle('resume')");assert.equal(app.run('timerState().finished'),true);assert.equal(app.run('timerState().elapsed'),900000);
 }
});
