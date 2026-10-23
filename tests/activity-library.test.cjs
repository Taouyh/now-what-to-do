const test=require('node:test');
const assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
const dataSet=()=>{
  const d=fixture();d.preferences={time:30,env:'quiet',computerReady:false};
  d.tasks=[
    {...d.tasks[0],id:'read',name:'读书',minutes:10,env:'quiet',activityCategory:'study'},
    {...d.tasks[0],id:'words',name:'复习单词',minutes:20,env:'quiet',activityCategory:'study'},
    {...d.tasks[0],id:'work',name:'整理工作资料',minutes:15,env:'quiet',activityCategory:'work'},
    {...d.tasks[0],id:'legacy',name:'旧活动',minutes:5,env:'quiet',category:{id:'legacy-category',note:'保留原文'}},
  ];return d;
};
const start=data=>{const a=boot({whatToDoData:JSON.stringify(data)});assert.ifError(a.error);return a;};
const ids=app=>app.elements.get('taskList').children.map(el=>el.dataset.taskId).filter(Boolean);

test('existing category metadata loads unchanged and does not hide any activities',()=>{
  const d=dataSet(),raw=JSON.stringify(d),app=start(d);app.run('page("tasks")');
  assert.deepEqual(ids(app),['read','words','work','legacy']);
  assert.deepEqual(app.json('d.tasks'),d.tasks);assert.deepEqual(app.json('d.completed'),app.json('normalizeCompletedRecords('+JSON.stringify(d.completed)+')'));
  assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.writes.length,0);
});

test('search matches names and descriptions without changing recommendation conditions or stored data',()=>{
  const app=start(dataSet()),raw=app.values.get('whatToDoData'),chosen=app.run('cur.id');app.run('page("tasks")');
  app.elements.get('taskSearch').value='读';app.elements.get('taskSearch').dispatch('input');assert.deepEqual(ids(app),['read']);
  app.elements.get('taskSearch').value='保留';app.elements.get('taskSearch').dispatch('input');assert.equal(ids(app).length,4);
  app.elements.get('taskSearch').value='不存在';app.elements.get('taskSearch').dispatch('input');assert.deepEqual(ids(app),[]);
  app.run('setActivitySearch(false)');assert.deepEqual(ids(app),['read','words','work','legacy']);
  assert.equal(app.run('cur.id'),chosen);assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.writes.length,0);
});

test('new activities require no category and backup round trips preserve earlier metadata and history',async()=>{
  const d=dataSet(),app=start(d);app.run('page("tasks");newTask()');
  app.elements.get('name').value='写周报';app.elements.get('form').dispatch('submit');
  assert.equal(app.run('Object.hasOwn(d.tasks.at(-1),"activityCategory")'),false);assert.equal(app.run('d.tasks.length'),5);
  app.elements.get('export').click();const backup=JSON.parse(await app.downloads.at(-1).blob.text()),reloaded=start(backup);
  assert.deepEqual(reloaded.json('d.tasks.slice(0,4)'),d.tasks);assert.deepEqual(reloaded.json('d.completed'),app.json('d.completed'));
  assert.deepEqual(reloaded.json('d.goals'),d.goals);
});

test('editing a name retains existing category fields, descriptions and unknown metadata',()=>{
  const d=dataSet(),app=start(d);
  for(const id of ['read','legacy']){
    app.run('edit(d.tasks.find(t=>t.id==='+JSON.stringify(id)+'))');assert.equal(app.elements.get('activityOptions').open,true);
    app.elements.get('name').value='改名：'+id;app.elements.get('form').dispatch('submit');
    const before=d.tasks.find(t=>t.id===id),after=app.json('d.tasks.find(t=>t.id==='+JSON.stringify(id)+')');
    assert.equal(after.activityCategory,before.activityCategory);assert.deepEqual(after.category,before.category);assert.equal(after.description,before.description);
  }
  assert.deepEqual(app.json('d.goals'),d.goals);assert.deepEqual(app.json('d.customData'),d.customData);
});

test('failed edit keeps both stored metadata and the draft, then retry saves one update',()=>{
  const app=start(dataSet()),raw=app.values.get('whatToDoData');app.run('edit(d.tasks[0])');
  app.elements.get('name').value='读下一章';app.faults.write=true;app.elements.get('form').dispatch('submit');
  assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.run('d.tasks[0].name'),'读书');assert.equal(app.run('d.tasks[0].activityCategory'),'study');
  assert.equal(app.elements.get('name').value,'读下一章');assert.equal(app.elements.get('modal').classList.contains('hide'),false);
  delete app.faults.write;app.elements.get('form').dispatch('submit');assert.equal(app.run('d.tasks[0].name'),'读下一章');assert.equal(app.run('d.tasks[0].activityCategory'),'study');
  assert.equal(app.run('d.tasks.length'),4);
});

test('earlier backup validation still rejects malformed metadata without replacing current data',()=>{
  const app=start(dataSet()),raw=app.values.get('whatToDoData'),bad=dataSet();bad.tasks[0].activityCategory='<img src=x onerror=alert(1)>';
  app.import(bad);assert.equal(app.run('pendingImport'),null);assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.run('d.tasks.length'),4);
});
