const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(){
  const data=fixture();data.completed=[];
  data.tasks=[1,8,9,25,26,45,46,60,61,90,91,1440].map(minutes=>({...data.tasks[0],id:'t'+minutes,minutes}));
  data.tasks.push({...data.tasks[0],id:'wrong-env',minutes:1,env:'quiet'},{...data.tasks[0],id:'computer',minutes:1,computer:true},{...data.tasks[0],id:'disabled',minutes:1,enabled:false});
  const app=boot({whatToDoData:JSON.stringify(data)});assert.ifError(app.error);return app;
}
const select=(app,value)=>app.times.find(b=>b.dataset.v===String(value)).click();
function input(app,value){app.elements.get('customMinutes').value=value;app.elements.get('customMinutes').dispatch('input');}
const environment=app=>app.envs.find(b=>b.dataset.v==='noisy').click();

test('custom starts blank and valid input uses the already visible saved environment',()=>{
  const app=setup(),before=app.values.get('whatToDoData');
  assert.equal(app.times.some(b=>b.classList.contains('on')),true);
  select(app,'custom');assert.equal(app.elements.get('customMinutes').value,'');
  assert.equal(app.elements.get('customTimeField').classList.contains('hide'),false);
  assert.equal(app.times.find(b=>b.dataset.v==='custom')['aria-pressed'],'true');
  assert.equal(app.run('selectionReady()'),false);assert.match(app.elements.get('customTimeError').textContent,/1–1440/);
  assert.equal(app.elements.get('customMinutes')['aria-invalid'],'false');
  input(app,'25');assert.equal(app.run('ok(cur)'),true);assert.equal(app.elements.get('random').disabled,false);
  environment(app);assert.equal(app.run('selectionReady()'),true);assert.equal(app.run('ok(cur)'),true);
  assert.equal(app.values.get('whatToDoData'),before);assert.equal(app.writes.length,0);
});

test('8, 25, 45, 90 and boundary minutes include equal/shorter tasks and enforce all hard conditions',()=>{
  const app=setup();select(app,'custom');environment(app);
  for(const value of [1,8,25,45,90,1440]){
    input(app,String(value));assert.equal(app.run('time'),value);
    const ids=app.json('d.tasks.filter(ok).map(t=>t.id)');
    assert.ok(ids.includes('t'+value));assert.deepEqual(ids,app.json('d.tasks.filter(t=>t.id.startsWith("t")&&t.minutes<='+value+').map(t=>t.id)'));
    for(let i=0;i<5;i++){app.elements.get('random').click();assert.equal(app.run('ok(cur)'),true);}
  }
  assert.equal(app.json('d.completed').length,0);
});

test('invalid custom inputs immediately remove recommendations and stale start buttons cannot run',()=>{
  const app=setup();select(app,'custom');environment(app);
  for(const value of ['', ' ', '0','-5','1.5','abc','1441','9999999999999999999','1e2','NaN','Infinity']){
    input(app,'25');const oldStart=app.elements.get('start');input(app,value);
    assert.equal(app.run('cur'),null,value);assert.equal(app.elements.get('random').disabled,true,value);
    assert.equal(app.elements.get('customMinutes')['aria-invalid'],String(value.trim()!==''));assert.match(app.elements.get('customTimeError').textContent,/1–1440/);
    app.elements.get('random').click();oldStart.click();assert.equal(app.values.has('activeTimer'),false);
  }
});

test('a smaller budget clears an ineligible recommendation and no candidates show the empty state',()=>{
  const app=setup();select(app,'custom');environment(app);input(app,'90');app.run('cur=d.tasks.find(t=>t.id==="t90");random({keepCurrent:true})');
  input(app,'25');assert.notEqual(app.run('cur.id'),'t90');assert.equal(app.run('ok(cur)'),true);
  const id=app.run('cur.id');input(app,'90');assert.equal(app.run('cur.id'),id);
  app.envs.find(b=>b.dataset.v==='class').click();assert.equal(app.run('cur'),null);
  assert.match(app.elements.get('rec').children[0].textContent,/没有符合当前条件/);
  environment(app);app.run('d.tasks=d.tasks.filter(t=>t.minutes>8)');input(app,'8');assert.equal(app.run('cur'),null);
  assert.match(app.elements.get('rec').children[0].textContent,/没有符合当前条件/);
});

test('presets hide the input, retain the session draft, and 60 still excludes 61 minutes',()=>{
  const app=setup();select(app,'custom');environment(app);input(app,'90');
  select(app,60);assert.equal(app.run('time'),60);assert.equal(app.elements.get('customTimeField').classList.contains('hide'),true);
  assert.equal(app.run('d.tasks.filter(ok).some(t=>t.minutes>60)'),false);
  select(app,'custom');assert.equal(app.elements.get('customMinutes').value,'90');assert.equal(app.run('time'),90);
  input(app,'invalid');select(app,10);assert.equal(app.run('selectionReady()'),true);select(app,'custom');assert.equal(app.run('selectionReady()'),false);
});

test('custom budgets stay out of backups and refresh; runtime sync and failed preset saves retain the session budget',()=>{
  const app=setup();select(app,'custom');environment(app);input(app,'25');const before=app.values.get('whatToDoData');
  app.elements.get('theme').click();assert.equal(app.run('time'),25);assert.equal(app.run('d.preferences.time'),10);
  app.faults.write=true;select(app,60);assert.deepEqual(app.json('[customTime,time,timeChosen]'),[true,25,true]);assert.equal(app.run('ok(cur)'),true);
  delete app.faults.write;
  app.elements.get('computerReady').checked=true;app.elements.get('computerReady').dispatch('change');
  assert.equal(app.run('time'),25);assert.equal(app.run('d.preferences.time'),10);assert.equal(app.run('validateData(d)===d'),true);
  assert.deepEqual(app.json('d.tasks'),JSON.parse(before).tasks);assert.deepEqual(app.json('d.completed'),JSON.parse(before).completed);
  const reloaded=boot(Object.fromEntries(app.values));assert.ifError(reloaded.error);
  assert.deepEqual(reloaded.json('[customTime,customTimeDraft,timeChosen,envChosen,time]'),[false,'',true,true,10]);
  assert.equal(reloaded.run('ok(cur)'),true);
  assert.equal(reloaded.elements.get('customMinutes').value,'');assert.equal(reloaded.elements.get('random').disabled,false);
});

test('manual start uses the original task duration and budget edits leave the active timer unchanged',()=>{
  const app=setup();select(app,'custom');environment(app);input(app,'90');
  app.run('cur=d.tasks.find(t=>t.id==="t25");random({keepCurrent:true})');app.elements.get('start').click();
  const timer=app.values.get('activeTimer');assert.equal(app.run('timerState().plannedDurationMs'),25*60000);
  app.run('page("home")');input(app,'8');input(app,'invalid');select(app,60);assert.equal(app.values.get('activeTimer'),timer);
  assert.equal(app.json('d.completed').length,0);
  const manual=setup();select(manual,'custom');input(manual,'bad');manual.elements.get('browse').click();manual.run('run(d.tasks.find(t=>t.id==="t90"))');
  assert.equal(manual.run('timerState().plannedDurationMs'),90*60000);
});
