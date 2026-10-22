const test=require('node:test');
const assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
const dataSet=()=>{
  const d=fixture();d.completed=[];d.preferences={time:30,env:'quiet',computerReady:false};
  d.tasks=[
    {...d.tasks[0],id:'read',name:'读书',minutes:10,env:'quiet',activityCategory:'study'},
    {...d.tasks[0],id:'words',name:'复习单词',minutes:20,env:'quiet',activityCategory:'study'},
    {...d.tasks[0],id:'work',name:'整理工作资料',minutes:15,env:'quiet',activityCategory:'work'},
    {...d.tasks[0],id:'legacy',name:'旧活动',minutes:5,env:'quiet',category:{id:'legacy-category',note:'保留原文'}},
  ];return d;
};
const start=data=>{const a=boot({whatToDoData:JSON.stringify(data)});assert.ifError(a.error);return a;};
const ids=app=>app.elements.get('taskList').children.map(el=>el.dataset.taskId).filter(Boolean);

test('optional categories and legacy metadata load without seeding or rewriting user data',()=>{
  const d=dataSet(),raw=JSON.stringify(d),app=start(d);
  assert.deepEqual(app.json('d.tasks'),d.tasks);assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.writes.length,0);
  assert.deepEqual(app.json('d.tasks.map(activityCategoryOf)'),['study','study','work','']);
  assert.equal(app.run('activityCategoryOf({category:"学习"})'),'study');
  assert.equal(app.run('activityCategoryOf({category:{tag:"学习"}})'), '');
  assert.equal(app.run('activityCategoryOf({activityCategory:"",category:"学习"})'),'');
});

test('category, search and duration filters combine and never affect recommendation conditions',()=>{
  const d=dataSet(),app=start(d),raw=app.values.get('whatToDoData'),chosen=app.run('cur.id');
  app.run('page("tasks");selectActivityCategory("study")');assert.deepEqual(ids(app),['read','words']);
  app.elements.get('taskSearch').value='读';app.elements.get('taskSearch').dispatch('input');assert.deepEqual(ids(app),['read']);
  app.elements.get('ft').value='5';app.elements.get('ft').dispatch('change');assert.deepEqual(ids(app),[]);
  app.run('clearActivityFilters();selectActivityCategory("uncategorized")');assert.deepEqual(ids(app),['legacy']);
  app.run('clearActivityFilters()');assert.deepEqual(ids(app),['read','words','work','legacy']);
  assert.equal(app.run('cur.id'),chosen);assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.writes.length,0);
});

test('new activity inherits an explicitly selected library category; save and backup round-trip retain it',async()=>{
  const app=start(dataSet());
  app.run('page("tasks");selectActivityCategory("work");newTask()');
  assert.equal(app.elements.get('activityCategory').value,'work');
  app.elements.get('name').value='写周报';app.elements.get('form').dispatch('submit');
  assert.equal(app.run('d.tasks.at(-1).activityCategory'),'work');assert.deepEqual(ids(app),['work',app.run('d.tasks.at(-1).id')]);
  assert.equal(app.run('d.completed.length'),0);
  app.elements.get('export').click();const backup=JSON.parse(await app.downloads.at(-1).blob.text());
  const reloaded=start(backup);assert.equal(reloaded.run('d.tasks.at(-1).activityCategory'),'work');
  assert.deepEqual(reloaded.json('d.tasks.find(t=>t.id==="legacy").category'),{id:'legacy-category',note:'保留原文'});
});

test('editing opens an existing description and changing categories preserves unknown task and goal fields',()=>{
  const d=dataSet(),app=start(d);
  app.run('edit(d.tasks.find(t=>t.id==="legacy"))');
  assert.equal(app.elements.get('activityOptions').open,true);
  assert.equal(app.elements.get('activityCategory').value,'');
  app.elements.get('activityCategory').value='life';app.elements.get('form').dispatch('submit');
  assert.equal(app.run('d.tasks.find(t=>t.id==="legacy").activityCategory'),'life');
  assert.deepEqual(app.json('d.tasks.find(t=>t.id==="legacy").category'),d.tasks[3].category);
  assert.deepEqual(app.json('d.goals'),d.goals);
  app.run('edit(d.tasks.find(t=>t.id==="legacy"))');app.elements.get('activityCategory').value='';app.elements.get('form').dispatch('submit');
  assert.equal(app.run('activityCategoryOf(d.tasks.find(t=>t.id==="legacy"))'),'');
});

test('failed category save retains stored data and editor input, then a retry saves exactly one update',()=>{
  const app=start(dataSet()),raw=app.values.get('whatToDoData');app.run('edit(d.tasks[0])');
  app.elements.get('activityCategory').value='other';app.faults.write=true;app.elements.get('form').dispatch('submit');
  assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.run('d.tasks[0].activityCategory'),'study');
  assert.equal(app.elements.get('activityCategory').value,'other');assert.equal(app.elements.get('modal').classList.contains('hide'),false);
  delete app.faults.write;app.elements.get('form').dispatch('submit');assert.equal(app.run('d.tasks[0].activityCategory'),'other');
  assert.equal(app.run('d.tasks.length'),4);assert.equal(app.run('d.completed.length'),0);
});

test('invalid category backups and direct saves are rejected without data loss',()=>{
  const app=start(dataSet()),raw=app.values.get('whatToDoData');
  const bad=dataSet();bad.tasks[0].activityCategory='<img src=x onerror=alert(1)>';
  app.import(bad);assert.equal(app.run('pendingImport'),null);assert.equal(app.values.get('whatToDoData'),raw);
  assert.equal(app.run('saveActivity({name:"无效",minutes:10,category:{id:"study"}})'),false);
  assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.run('d.tasks.length'),4);
});
