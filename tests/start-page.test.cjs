const test = require('node:test');
const assert = require('node:assert/strict');
const {boot,fixture} = require('./helpers/app-harness.cjs');
const start = () => {const data=fixture();data.completed=[];const app=boot({whatToDoData:JSON.stringify(data)});assert.ifError(app.error);return app;};

test('saved conditions immediately produce a valid recommendation without startup writes', () => {
  const app=start(),before=app.values.get('whatToDoData');
  assert.equal(app.run('selectionReady()'),true);
  assert.equal(app.run('cur.id'),'mine-task');
  assert.equal(app.elements.get('random').disabled,false);
  assert.equal(app.times.filter(b=>b.classList.contains('on')).length,1);
  assert.equal(app.envs.filter(b=>b.classList.contains('on')).length,1);
  assert.equal(app.elements.get('timeSummary').textContent,'10 分钟');
  assert.equal(app.elements.get('environmentSummary').textContent,'有人/嘈杂 · 无电脑');
  assert.equal(app.values.get('whatToDoData'),before);assert.equal(app.writes.length,0);
  assert.equal(app.values.has('activeTimer'),false);
});

test('fresh library shows onboarding and defaults without seeding sample activities', () => {
  const app=boot();assert.ifError(app.error);
  assert.equal(app.run('cur'),null);
  assert.equal(app.elements.get('onboarding').classList.contains('hide'),false);
  assert.equal(app.elements.get('homeWorkspace').classList.contains('hide'),true);
  assert.deepEqual(app.json('[d.tasks,d.completed,d.preferences]'),[[],[],{time:15,env:'quiet',computerReady:false}]);
});

test('page changes and reload keep saved conditions and an eligible activity', () => {
  const app=start(),before=app.values.get('whatToDoData');
  const id=app.run('cur.id');app.run('page("tasks");page("home")');
  assert.equal(app.run('cur.id'),id);
  const again=boot(Object.fromEntries(app.values));assert.ifError(again.error);
  assert.equal(again.run('selectionReady()'),true);assert.equal(again.run('ok(cur)'),true);
  assert.deepEqual(again.json('d.preferences'),app.json('d.preferences'));
  assert.equal(again.values.get('whatToDoData'),before);assert.equal(again.writes.length,0);
});

test('failed condition writes retain the previous valid conditions and recommendation', () => {
  const app=start();app.faults.write=true;
  app.times.find(b=>b.dataset.v==='30').click();
  assert.deepEqual(app.json('[timeChosen,envChosen,time,cur.id]'),[true,true,10,'mine-task']);
  delete app.faults.write;app.times.find(b=>b.dataset.v==='30').click();app.faults.write=true;
  app.envs.find(b=>b.dataset.v==='quiet').click();
  assert.deepEqual(app.json('[timeChosen,envChosen,time,env,cur.id]'),[true,true,30,'noisy','mine-task']);
  assert.equal(app.run('ok(cur)'),true);
});

test('import updates visible conditions and clears a recommendation incompatible with the new environment', () => {
  const app=start();
  const incoming=fixture();incoming.preferences={time:30,env:'quiet',computerReady:true};incoming.theme='dark';
  app.import(incoming);app.confirm();
  assert.deepEqual(app.json('[time,env,computerReady]'),[30,'quiet',true]);
  assert.equal(app.document.documentElement.dataset.theme,'dark');
  assert.equal(app.elements.get('timeSummary').textContent,'30 分钟');
  assert.equal(app.elements.get('environmentSummary').textContent,'安静 · 有电脑');
  assert.equal(app.run('selectionReady()'),true);assert.equal(app.run('cur'),null);
});

test('manual selection can start an activity outside recommendation conditions', () => {
  const app=start();app.elements.get('browse').click();assert.equal(app.run('location.hash'),'tasks');
  app.run('d.tasks[0].minutes=60;d.tasks[0].env="quiet";d.tasks[0].computer=true;run(d.tasks[0])');
  assert.equal(app.run('timerState().taskId'),'mine-task');assert.equal(app.run('timerState().plannedDurationMs'),3600000);
  assert.equal(app.json('d.completed').length,0);
});
