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
