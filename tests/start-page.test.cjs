const test = require('node:test');
const assert = require('node:assert/strict');
const {boot,fixture} = require('./helpers/app-harness.cjs');
const start = () => {const data=fixture();data.completed=[];const app=boot({whatToDoData:JSON.stringify(data)});assert.ifError(app.error);return app;};

test('fresh and reloaded pages keep saved preferences but require both explicit choices', () => {
  for(const app of [start(),boot()]){
    assert.ifError(app.error);const before=app.values.get('whatToDoData');
    assert.equal(app.run('selectionReady()'),false);assert.equal(app.run('cur'),null);
    assert.equal(app.elements.get('random').disabled,true);
    assert.equal(app.times.some(b=>b.classList.contains('on')),false);assert.equal(app.envs.some(b=>b.classList.contains('on')),false);
    app.run('Math.random=()=>{throw Error("must not draw before both choices")};random();startRecommendation("mine-task")');
    assert.equal(app.values.has('activeTimer'),false);assert.equal(app.values.get('whatToDoData'),before);
  }
});

test('one selected field cannot recommend, two fields can, and refresh clears only readiness', () => {
  const app=start(),before=app.values.get('whatToDoData');
  app.times.find(b=>b.dataset.v==='10').click();assert.equal(app.run('cur'),null);assert.equal(app.elements.get('random').disabled,true);
  app.envs.find(b=>b.dataset.v==='noisy').click();assert.equal(app.run('cur.id'),'mine-task');
  assert.equal(app.values.get('whatToDoData'),before);assert.equal(app.writes.length,0);
  app.run('page("tasks");page("home")');assert.equal(app.run('selectionReady()'),true);assert.equal(app.run('ok(cur)'),true);
  const again=boot(Object.fromEntries(app.values));assert.ifError(again.error);
  assert.equal(again.run('selectionReady()'),false);assert.equal(again.run('cur'),null);
  assert.deepEqual(again.json('d.preferences'),app.json('d.preferences'));
  const environmentFirst=start();environmentFirst.envs.find(b=>b.dataset.v==='noisy').click();
  assert.equal(environmentFirst.run('selectionReady()'),false);assert.equal(environmentFirst.run('cur'),null);
  environmentFirst.times.find(b=>b.dataset.v==='10').click();assert.equal(environmentFirst.run('selectionReady()'),true);
});

test('failed choice writes restore readiness and controls without keeping an invalid card', () => {
  const app=start(),before=app.values.get('whatToDoData');app.faults.write=true;
  app.times.find(b=>b.dataset.v==='30').click();
  assert.deepEqual(app.json('[timeChosen,envChosen,time]'),[false,false,10]);assert.equal(app.run('cur'),null);
  delete app.faults.write;app.times.find(b=>b.dataset.v==='30').click();app.faults.write=true;
  app.envs.find(b=>b.dataset.v==='quiet').click();
  assert.deepEqual(app.json('[timeChosen,envChosen,time,env]'),[true,false,30,'noisy']);assert.equal(app.run('cur'),null);
  delete app.faults.write;app.envs.find(b=>b.dataset.v==='noisy').click();
  assert.equal(app.run('selectionReady()'),true);assert.equal(app.run('ok(cur)'),true);
  assert.notEqual(app.values.get('whatToDoData'),before);
});

test('computer changes and imports cannot bypass an incomplete selection', () => {
  const app=start();app.elements.get('computerReady').checked=true;app.elements.get('computerReady').dispatch('change');
  assert.equal(app.run('selectionReady()'),false);assert.equal(app.run('cur'),null);
  const incoming=fixture();incoming.preferences={time:30,env:'quiet',computerReady:true};incoming.theme='dark';
  app.import(incoming);app.confirm();
  assert.deepEqual(app.json('[time,env,computerReady]'),[30,'quiet',true]);assert.equal(app.document.documentElement.dataset.theme,'dark');
  assert.equal(app.run('selectionReady()'),false);assert.equal(app.times.some(b=>b.classList.contains('on')),false);
  app.chooseConditions();assert.equal(app.run('selectionReady()'),true);assert.equal(app.run('cur'),null); // Existing task is noisy.
});

test('manual selection works before choosing conditions without applying recommendation filters', () => {
  const app=start();app.elements.get('browse').click();assert.equal(app.run('location.hash'),'tasks');
  app.run('d.tasks[0].minutes=60;d.tasks[0].env="quiet";d.tasks[0].computer=true;run(d.tasks[0])');
  assert.equal(app.run('timerState().taskId'),'mine-task');assert.equal(app.run('timerState().plannedDurationMs'),3600000);
  assert.equal(app.json('d.completed').length,0);
});
