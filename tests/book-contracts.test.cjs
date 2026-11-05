const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(){const value=fixture();value.completed=[];return boot({whatToDoData:JSON.stringify(value)})}
test('all 16 conditions enforce resource conjunction and interruption stays a preference',()=>{
 const app=setup();
 for(let c=0;c<16;c++)for(let r=0;r<16;r++){
   app.run(`conditions={computer:${!!(c&1)},audio:${!!(c&2)},speech:${!!(c&4)},interrupted:${!!(c&8)}}`);
   assert.equal(app.run(`ok({requirements:{computer:${!!(r&1)},audio:${!!(r&2)},speech:${!!(r&4)},uninterrupted:${!!(r&8)}}})`),(r&7&~c)===0);
 }
});
test('fresh round does not resurrect old conditions when changing language or theme',()=>{
 const value=fixture();value.preferences.conditions={computer:true,audio:true,speech:true,interrupted:true};
 const app=boot({whatToDoData:JSON.stringify(value)});assert.equal(app.writes.length,0);
 app.run("setLanguage('en');setTheme('dark')");assert.deepEqual(app.json('conditions'),{computer:false,audio:false,speech:false,interrupted:false});
});
test('completion atomically resets conditions; cleanup retry cannot append twice',()=>{
 const app=setup();app.run("selectHomeCondition('audio',true);run(d.tasks[0])");app.faults.removeKey='activeTimer';
 assert.equal(app.run('finishTimer()'),false);const value=JSON.parse(app.values.get('whatToDoData'));
 assert.equal(value.completed.length,1);assert.deepEqual(value.preferences.conditions,{computer:false,audio:false,speech:false,interrupted:false});
 assert.equal(app.elements.get('timerActions').dataset.mode,'cleanup');assert.ok(app.elements.get('retryFinish'));
 delete app.faults.removeKey;app.elements.get('retryFinish').click();assert.equal(app.run('d.completed.length'),1);assert.equal(app.values.has('activeTimer'),false);
});
test('all condition combinations reset after running, paused, time-up and recovered finishes',()=>{
 for(let bits=0;bits<16;bits++)for(const mode of ['running','paused','finished','recovery']){
  const app=setup();
  const conditions={computer:!!(bits&1),audio:!!(bits&2),speech:!!(bits&4),interrupted:!!(bits&8)};
  app.run(`conditions=${JSON.stringify(conditions)};persistPreferences();run(d.tasks[0])`);
  if(mode==='paused')app.run('pauseTimer()');
  if(mode==='finished')app.run('var x=timerState();x.elapsed=x.durationMs;x.finished=true;x.lastStarted=0;x.timeUpAt=Date.now();setTimerState(x)');
  if(mode==='recovery')app.run("suspendTimer('reopen')");
  assert.equal(app.run('finishTimer()'),true,`${bits} ${mode}`);
  assert.deepEqual(app.json('conditions'),{computer:false,audio:false,speech:false,interrupted:false});
  assert.equal(app.run('d.completed.length'),1);assert.equal(app.run('time'),10);
 }
});
test('task and description snapshots remain immutable and continuation edits only the completed task',()=>{
 const app=setup();app.run('run(d.tasks[0]);d.tasks[0].name="新名称";d.tasks[0].description="新说明";save()');
 assert.equal(app.run('timerTask(timerState()).name'),fixture().tasks[0].name);
 assert.equal(app.run('timerTask(timerState()).description'),'保留');
 app.run('finishTimer();saveContinuation("下次从这里继续")');
 assert.equal(app.run('d.tasks[0].description'),'下次从这里继续');assert.equal(app.run('d.completed[0].taskName'),fixture().tasks[0].name);
});
test('failed continuation keeps the draft; deletion cannot redirect it to a different task',()=>{
 const app=setup();app.run('run(d.tasks[0]);finishTimer();completionFeedback.editing=true;completionFeedback.draft="草稿"');
 app.faults.writeKey='whatToDoData';assert.equal(app.run('saveContinuation("草稿")'),false);assert.equal(app.run('completionFeedback.draft'),'草稿');
 delete app.faults.writeKey;app.run('d.tasks=[{id:"other",name:"其他",description:"保留"}];save()');assert.equal(app.run('saveContinuation("不能误写")'),false);assert.equal(app.run('d.tasks[0].description'),'保留');
});
test('failed checkpoint freezes at last persisted progress and explicit recovery resumes',()=>{
 const app=setup();app.run('run(d.tasks[0]);var t=timerState();t.elapsed=1000;t.lastStarted=Date.now()-6000;t.checkpointAt=t.lastStarted;setTimerState(t)');
 const before=app.values.get('activeTimer');app.faults.writeKey='activeTimer';app.run('checkpointTimer(true)');
 assert.equal(app.values.get('activeTimer'),before);assert.equal(app.intervals.size,0);assert.equal(app.run('timerState().elapsed'),1000);assert.equal(app.run('timerState().recoveryReason'),'interrupted');
 delete app.faults.writeKey;assert.equal(app.run('resumeRecoveredTimer()'),true);assert.equal(app.run('timerState().elapsed'),1000);
});
test('concurrent main document changes are detected before overwriting',()=>{
 const app=setup();const external=JSON.stringify({...fixture(),customData:{external:true}});app.values.set('whatToDoData',external);
 assert.equal(app.run('saveActivity({name:"冲突草稿"})'),false);assert.equal(app.values.get('whatToDoData'),external);assert.equal(app.run('storageBlocked'),true);
});
test('a recovered completion with failed cleanup offers only retry, not a new session',()=>{
 const app=setup();app.run("run(d.tasks[0]);suspendTimer('reopen')");app.faults.removeKey='activeTimer';
 assert.equal(app.run('finishTimer()'),false);assert.equal(app.elements.get('timerActions').dataset.mode,'cleanup');assert.equal(app.run('d.completed.length'),1);
 delete app.faults.removeKey;app.elements.get('retryFinish').click();assert.equal(app.run('d.completed.length'),1);assert.equal(app.run('timerState()'),null);
});
