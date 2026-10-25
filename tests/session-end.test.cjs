const test=require('node:test');
const assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(tasks,conditions={}){
  const data=fixture();data.completed=[];data.tasks=tasks.map(t=>({requirements:{},...t}));
  data.preferences={time:10,conditions:{computer:false,audio:false,speech:false,interrupted:false,...conditions}};
  const app=boot({whatToDoData:JSON.stringify(data)});assert.ifError(app.error);assert.equal(app.run('storageBlocked'),false);return {app,data};
}

test('End saves actual effective time and returns a different ready-to-start recommendation without opening a dialog',()=>{
  const {app,data}=setup([{id:'read',name:'读书',requirements:{}},{id:'write',name:'写作',requirements:{}}]);
  app.run('run(d.tasks[0]);pauseTimer();let s=timerState();s.elapsed=42500;s.pausedDurationMs=2000;setTimerState(s)');
  app.elements.get('earlyTimer').click();
  assert.equal(app.run('location.hash.replace(/^#/,"")'),'home');assert.equal(app.run('cur.id'),'write');
  assert.equal(app.values.has('activeTimer'),false);assert.equal(app.run('d.completed.length'),1);
  assert.equal(app.run('d.completed[0].actualDurationMs'),42500);
  for(const id of ['timer','floatingTimer','modal','confirmLayer'])assert.equal(app.elements.get(id).classList.contains('hide'),true);
  assert.deepEqual(app.json('d.tasks'),data.tasks);assert.deepEqual(app.json('d.preferences'),data.preferences);
  assert.match(app.elements.get('appNotice').textContent,/已记录/);assert.equal(app.intervals.size,0);
  app.elements.get('start').click();assert.equal(app.run('timerState().taskId'),'write');
});

test('a recently completed alternative wins over repeating the just-finished activity despite interruption preferences',()=>{
  for(const random of [0,0.999999]){
    const {app}=setup([{id:'read',name:'读书',requirements:{}},{id:'write',name:'写作',requirements:{uninterrupted:true}},
      {id:'code',name:'编程',requirements:{computer:true}},{id:'disabled',name:'停用',enabled:false}],{interrupted:true});
    app.run('d.completed.push({taskId:"write",completedAt:new Date().toISOString(),actualDurationMs:1000});save();run(d.tasks[0]);Math.random=()=>'+random);
    app.elements.get('earlyTimer').click();assert.equal(app.run('cur.id'),'write');assert.equal(app.run('ok(cur)'),true);
    assert.equal(app.run('d.completed.length'),2);
  }
});

test('one eligible activity remains available after ending instead of requiring a new activity',()=>{
  const {app}=setup([{id:'read',name:'读书',requirements:{}},{id:'code',name:'编程',requirements:{computer:true}}]);
  app.run('run(d.tasks[0])');app.elements.get('earlyTimer').click();
  assert.equal(app.run('cur.id'),'read');assert.equal(app.run('d.tasks.length'),2);
  assert.equal(app.elements.get('modal').classList.contains('hide'),true);assert.equal(app.run('d.completed.length'),1);
});

test('End does not relax resource constraints or open an add form when there are no eligible activities',()=>{
  for(const remove of [false,true]){
    const {app}=setup([{id:'read',name:'读书',requirements:{}},{id:'code',name:'编程',requirements:{computer:true}}]);
    app.run('run(d.tasks[0]);'+(remove?'d.tasks=[]':'d.tasks[0].enabled=false'));
    app.elements.get('earlyTimer').click();
    assert.equal(app.run('cur'),null);assert.equal(app.run('d.completed.length'),1);
    assert.equal(app.elements.get('modal').classList.contains('hide'),true);assert.equal(app.values.has('activeTimer'),false);
  }
});

test('legacy time-up End directly records the session and recommends another activity',()=>{
  const {app}=setup([{id:'read',name:'读书',requirements:{}},{id:'write',name:'写作',requirements:{}}]);
  app.run('run(d.tasks[0]);let s=timerState();s.finished=true;s.elapsed=s.durationMs;setTimerState(s);renderTimer()');
  app.elements.get('finishTimer').click();
  assert.equal(app.run('cur.id'),'write');assert.equal(app.run('d.completed[0].actualDurationMs'),600000);
  assert.equal(app.elements.get('confirmLayer').classList.contains('hide'),true);assert.equal(app.run('d.completed.length'),1);
});
