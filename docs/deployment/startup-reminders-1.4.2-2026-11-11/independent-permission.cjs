// Synthetic JS/native-bridge verification, not a real Android permission-dialog test.
const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('../../../tests/helpers/app-harness.cjs');
for(const scenario of ['start','short-recovery','long-recovery']){
  test(`automatic notification permission: ${scenario}`,()=>{
    const data=fixture();data.completed=[];
    const initial={whatToDoData:JSON.stringify(data)},task=data.tasks[0];let requests=0;
    if(scenario!=='start'){
      const at=Date.now()-(scenario==='long-recovery'?86400000:60000);
      initial.activeTimer=JSON.stringify({timerVersion:2,completionId:'old-recovery',taskId:task.id,task,
        startedAt:at-480000,lastStarted:0,elapsed:480000,plannedDurationMs:900000,durationMs:900000,
        extensionDurationMs:0,paused:true,finished:false,soundPlayed:false,pausedDurationMs:0,
        pauseStartedAt:at,checkpointAt:at});
    }
    const app=boot(initial,{}, {nativeApp:{syncReminder(){},requestReminders(){requests++}}});
    assert.ifError(app.error);assert.equal(requests,0,'boot alone must not request permission');
    app.run(scenario==='start'?'run(d.tasks[0])':'resumeRecoveredTimer()');
    assert.equal(app.run('timerState().paused'),false);
    assert.equal(app.run('timerState().reminderVersion'),1);
    if(scenario==='long-recovery'){
      assert.notEqual(app.run('timerState().completionId'),'old-recovery');
      assert.equal(app.run('d.completed.length'),1);
    }
    assert.equal(requests,1,'the explicit start/resume must reach the native permission bridge');
  });
}
for(const failedKey of ['whatToDoData','activeTimer']){
  test(`long recovery does not request permission on ${failedKey} failure; retry requests once`,()=>{
    const data=fixture();data.completed=[];const task=data.tasks[0],at=Date.now()-86400000;
    const initial={whatToDoData:JSON.stringify(data),activeTimer:JSON.stringify({timerVersion:2,
      completionId:'retry-old',taskId:task.id,task,startedAt:at-480000,lastStarted:0,elapsed:480000,
      plannedDurationMs:900000,durationMs:900000,extensionDurationMs:0,paused:true,finished:false,
      soundPlayed:false,pausedDurationMs:0,pauseStartedAt:at,checkpointAt:at})};
    let requests=0;const app=boot(initial,{}, {nativeApp:{syncReminder(){},requestReminders(){requests++}}});
    assert.ifError(app.error);app.faults.writeKey=failedKey;
    assert.equal(app.run('resumeRecoveredTimer()'),false);assert.equal(requests,0);
    assert.equal(app.run('timerState().completionId'),'retry-old');
    delete app.faults.writeKey;
    assert.equal(app.run('resumeRecoveredTimer()'),true);assert.equal(requests,1);
    assert.notEqual(app.run('timerState().completionId'),'retry-old');
    assert.equal(app.run('d.completed.length'),1);
    assert.equal(app.run('timerState().paused'),false);
    app.run('resumeRecoveredTimer()');assert.equal(requests,1);assert.equal(app.run('d.completed.length'),1);
  });
}
