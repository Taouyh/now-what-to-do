const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(){const d=fixture();d.completed=[];d.preferences={time:15,conditions:{computer:false,audio:false,speech:false,interrupted:false}};d.tasks=[0,1,2].map(i=>({id:'item-'+i,name:'活动'+i,requirements:{},description:'保留说明',unknown:{keep:true}}));const app=boot({whatToDoData:JSON.stringify(d)});assert.ifError(app.error);return app}
test('a round never returns a skipped activity, stops when exhausted and restarts only explicitly',()=>{
 const app=setup(),seen=new Set();
 for(let i=0;i<3;i++){const id=app.run('cur.id');assert.ok(!seen.has(id));seen.add(id);app.elements.get('random').click()}
 assert.equal(app.run('cur'),null);app.run('page("tasks");page("home");random({keepCurrent:true})');assert.equal(app.run('cur'),null);
 assert.equal(app.writes.length,0);assert.equal(app.run('d.completed.length'),0);
 app.run('restartRecommendations()');assert.ok(seen.has(app.run('cur.id')));
 const again=boot(Object.fromEntries(app.values));assert.ifError(again.error);assert.ok(again.run('cur'));
});
test('recently completed activities remain eligible for a deliberate repeat',()=>{
 const app=setup();app.run('d.completed=[{taskId:"item-0",minutes:1,completedAt:new Date().toISOString()}];Math.random=()=>0;cur=null;random()');
 assert.equal(app.run('cur.id'),'item-0');
});
test('next step saves, survives reload and backup, and preserves legacy and unknown data',async()=>{
 const app=setup(),id=app.run('cur.id'),original=app.json('d.tasks.find(t=>t.id===cur.id)');
 app.run('editNextStep(cur.id)');assert.equal(app.run('nextStepEditor.draft'),'');
 app.run('saveNextStep(cur.id,"  打开项目，先改一个按钮。  ")');
 const saved=app.json('d.tasks.find(t=>t.id===cur.id)');assert.equal(saved.nextStep,'打开项目，先改一个按钮。');assert.equal(saved.description,original.description);assert.deepEqual(saved.unknown,original.unknown);
 app.elements.get('export').click();const backup=JSON.parse(await app.downloads.at(-1).blob.text());
 const again=boot({whatToDoData:JSON.stringify(backup)});assert.ifError(again.error);assert.equal(again.run(`d.tasks.find(t=>t.id==='${id}').nextStep`),saved.nextStep);assert.equal(again.writes.length,0);assert.equal(again.run('d.completed.length'),0);
});
test('cancel does not write; failed save preserves the draft, original task and active timer',()=>{
 for(const paused of [false,true]){
  const app=setup();app.run('run(cur)');if(paused)app.run('pauseTimer()');
  const raw=app.values.get('whatToDoData'),timer=app.values.get('activeTimer');
  app.run('editNextStep(cur.id);nextStepEditor.draft="未保存的内容";cancelNextStep()');assert.equal(app.values.get('whatToDoData'),raw);
  app.run('editNextStep(cur.id)');app.faults.write=true;assert.equal(app.run('saveNextStep(cur.id,"失败后保留这句")'),false);
  assert.equal(app.run('nextStepEditor.draft'),'失败后保留这句');assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.values.get('activeTimer'),timer);
  app.faults.write=false;assert.equal(app.run('saveNextStep(cur.id,nextStepEditor.draft)'),true);assert.equal(app.run('cur.nextStep'),'失败后保留这句');assert.equal(app.values.get('activeTimer'),timer);
 }
});
test('earlier recommendation pause flags no longer exclude activities or trigger startup writes',()=>{
 const source=setup().json('d');for(const task of source.tasks)task.recommendationPaused=true;
 const raw=JSON.stringify(source),app=boot({whatToDoData:raw});assert.ifError(app.error);
 assert.ok(app.run('cur'));assert.equal(app.writes.length,0);assert.equal(app.values.get('whatToDoData'),raw);
 const seen=new Set();for(let i=0;i<3;i++){seen.add(app.run('cur.id'));app.elements.get('random').click()}
 assert.equal(seen.size,3);assert.equal(app.run('cur'),null);
 app.run('restartRecommendations();run(cur);pauseTimer()');const timer=app.values.get('activeTimer');
 const id=app.run('cur.id');app.run('editNextStep(cur.id);saveNextStep(cur.id,"继续读一页")');
 assert.equal(app.run(`d.tasks.find(t=>t.id==='${id}').recommendationPaused`),true,'obsolete metadata is preserved as an unknown field');assert.equal(app.values.get('activeTimer'),timer);
});
test('malformed next steps cannot replace existing backup data',()=>{
 const app=setup(),raw=app.values.get('whatToDoData');
 for(const change of ['x.tasks[0].nextStep=8','x.tasks[0].nextStep="x".repeat(201)']){
  assert.throws(()=>app.run('var x=JSON.parse(JSON.stringify(d));'+change+';validateImport(x)'));
  assert.equal(app.values.get('whatToDoData'),raw);
 }
});
