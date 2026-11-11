// Fixed-commit behavioral probes. Uses synthetic data; no OS notification claims.
const assert = require('node:assert/strict');
const {boot, fixture} = require('../../../tests/helpers/app-harness.cjs');
function setup() {
  const calls = [], data = fixture(); data.completed = []; data.preferences.time = 10;
  const app = boot({whatToDoData: JSON.stringify(data)}, {}, {nativeApp:{syncReminder:p => calls.push(p)}});
  assert.ifError(app.error);
  app.run(`var now=Date.now(), RealDate=Date, sounds=0;
    Date=class extends RealDate {static now(){return now}};
    window.AudioContext=class {constructor(){this.state='running';this.currentTime=0}
      createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
      createOscillator(){sounds++;return {frequency:{},connect(){},start(){},stop(){}}}};
    run(d.tasks[0]);`);
  return {app,calls};
}
const results = [];
{
  for(const old of [false,true]){
    const {app}=setup();app.run('now+=5000;checkpointTimer(true)');
    if(old)app.run('var preUpgrade=timerState();delete preUpgrade.reminderVersion;setTimerState(preUpgrade)');
    app.run("nativeTimerLifecycle('sleep');now+=60000;nativeTimerLifecycle('resume')");
    assert.equal(app.run('timerState().reminderVersion'),1);
    assert.equal(app.run('timerState().paused'),false);assert.equal(app.run('elapsedMs(timerState())'),65000);
    app.run("nativeTimerLifecycle('sleep');now+=86400000;nativeTimerLifecycle('resume')");
    assert.equal(app.run('timerState().finished'),true);assert.equal(app.run('timerState().elapsed'),600000);
    assert.equal(app.run('timerState().extensionDurationMs'),0);assert.equal(app.run('d.completed.length'),0);
  }
  const {app}=setup(),values=Object.fromEntries(app.values),saved=JSON.parse(values.activeTimer);
  delete saved.reminderVersion;saved.elapsed=5000;saved.lastStarted=Date.now()-86400000;saved.checkpointAt=saved.lastStarted;
  values.activeTimer=JSON.stringify(saved);const reopened=boot(values);assert.ifError(reopened.error);
  assert.equal(reopened.run('timerState().paused'),true);assert.ok(reopened.run('timerState().recoveryReason'));
  assert.equal(reopened.run('timerState().elapsed'),5000);assert.equal(reopened.run('timerState().reminderVersion'),undefined);
  results.push({check:'new and known-live old v2 sleep advances 60s, caps at deadline; uncertain old reopen remains conservative',status:'PASS'});
}
{
  const {app,calls}=setup();app.run("nativeTimerLifecycle('background')");
  const before=calls.length;app.faults.writeKey='activeTimer';
  app.run('now+=5000;checkpointTimer(true)');
  assert.equal(app.run('timerState().paused'),true);
  assert.equal(app.run('timerState().recoveryReason'),'interrupted');
  assert.equal(calls.length,before+1);assert.equal(calls.at(-1),null);
  results.push({check:'STORAGE-FAILURE-STALE-ALARM fixed in 16efacd',recoveryPaused:true,nativeCancellation:true});
}
{
  const {app,calls} = setup(); const first=calls.at(-1);
  app.run('now+=600000;advanceTimerIfNeeded(timerState())');
  assert.equal(app.run('sounds'),3); assert.equal(calls.at(-1),null);
  app.run("now+=1000;nativeTimerLifecycle('background')");
  assert.equal(app.run('timerState().reminderConsumed'),true);
  assert.equal(calls.at(-1),null);
  app.run("nativeTimerLifecycle('resume');nativeTimerLifecycle('background')");
  assert.equal(calls.at(-1),null);
  results.push({check:'ANDROID-REPLAY fixed in 3a59aa4',foregroundOscillators:3,expiredPayloadResent:false});
}
{
  const {app,calls}=setup(); app.run('now+=500000;checkpointTimer(true)');
  const before=calls.length; const replacement=fixture();replacement.preferences.reminders={sound:false,vibration:true};
  app.import(replacement);app.confirm();
  assert.equal(app.run('reminderPreferences().sound'),false);
  assert.equal(calls.length,before+1);assert.equal(calls.at(-1).sound,false);
  assert.equal(calls.at(-1).vibration,true);
  results.push({check:'IMPORT-STALE-PREFERENCES fixed in 3a59aa4',nativeSyncCallsAfterImport:calls.length-before,uiSound:false,pendingSound:false});
}
{
  const {app,calls}=setup();const initial=calls.at(-1);
  app.run("nativeTimerLifecycle('background');now+=600001;advanceTimerIfNeeded(timerState())");
  assert.equal(app.run('timerState().reminderConsumed'),false);
  assert.equal(calls.at(-1).key,initial.key);assert.equal(calls.at(-1).at,initial.at);
  assert.equal(app.run('sounds'),0);
  app.run("nativeTimerLifecycle('resume');nativeTimerLifecycle('background')");
  assert.equal(calls.at(-1),null);assert.equal(app.run('timerState().reminderConsumed'),true);
  app.run('extendTimer()');assert.notEqual(calls.at(-1).key,initial.key);
  assert.equal(app.run('timerState().reminderConsumed'),false);
  results.push({check:'background pending deadline retained; resume consumes; explicit extension rearms',status:'PASS'});
}
{
  for(const finished of [true,false]){
    const {app}=setup();app.run('now+=600001');
    if(finished)app.run('advanceTimerIfNeeded(timerState())');
    const values=Object.fromEntries(app.values),saved=JSON.parse(values.activeTimer);
    if(!finished){saved.lastStarted=Date.now()-600001;saved.checkpointAt=saved.lastStarted;}
    // Simulate a pre-fix snapshot lacking the optional consumption marker.
    delete saved.reminderConsumed;values.activeTimer=JSON.stringify(saved);
    const calls=[],again=boot(values,{}, {nativeApp:{syncReminder:p=>calls.push(p)}});
    assert.ifError(again.error);assert.equal(again.run('timerState().finished'),true);
    assert.equal(again.run('timerState().reminderConsumed'),true);
    again.run("nativeTimerLifecycle('background')");assert.equal(calls.at(-1),null);
    assert.equal(again.run('d.completed.length'),0);
  }
  results.push({check:'fresh-runtime restore consumes expired running and finished snapshots before background',status:'PASS'});
}
{
  const {app,calls}=setup();const replacement=fixture();replacement.preferences.reminders={sound:false,vibration:true};
  app.import(replacement);
  app.run("var originalPage=page,failPageOnce=true;page=(...args)=>{if(failPageOnce){failPageOnce=false;throw Error('synthetic import UI failure')}return originalPage(...args)}");
  const before=calls.length;app.confirm();
  assert.equal(app.run('reminderPreferences().sound'),true);
  assert.equal(calls.length,before+1);assert.equal(calls.at(-1).sound,true);
  results.push({check:'import rollback immediately synchronizes restored reminder preference',status:'PASS'});
}
{
  const {app,calls}=setup();const initial=calls.at(-1);
  app.run("now+=5000;pauseTimer()");assert.equal(calls.at(-1),null);
  app.run('now+=10000;resumeTimer()');assert.equal(calls.at(-1).at,initial.at+10000);
  app.run("setReminderPreference('sound',false);now+=600000;advanceTimerIfNeeded(timerState())");
  assert.equal(app.run('sounds'),0);assert.equal(app.run('timerState().elapsed'),600000);
  app.run('now+=86400000;nativeTimerLifecycle("resume");extendTimer()');
  assert.equal(app.run('timerState().elapsed'),600000);assert.notEqual(calls.at(-1).key,initial.key);
  results.push({check:'pause, preference, overnight cap, explicit extension',status:'PASS'});
}
{
  const {app}=setup();app.run('now+=600000;advanceTimerIfNeeded(timerState())');
  const again=boot(Object.fromEntries(app.values));assert.ifError(again.error);
  assert.equal(again.run('timerState().finished'),true);assert.equal(again.run('timerState().soundPlayed'),true);
  assert.equal(again.run('d.completed.length'),0);
  results.push({check:'completed round reload retains time-up without record',status:'PASS'});
}
console.log(JSON.stringify(results,null,2));
