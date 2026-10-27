const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(specs=[{}],conditions={}){
 const d=fixture();d.completed=[];d.preferences={time:10,conditions:{computer:false,audio:false,speech:false,interrupted:false,...conditions}};
 d.tasks=specs.map((s,i)=>({id:'t'+i,name:'活动 '+i,requirements:{computer:false,audio:false,speech:false,uninterrupted:false,...s.requirements},...s}));
 const a=boot({whatToDoData:JSON.stringify(d)});assert.ifError(a.error);return a;
}
function toggle(a,id,value){a.elements.get(id).checked=value;a.elements.get(id).dispatch('change');}
test('independent requirements combine with AND, with no mutually exclusive environment',()=>{
 const a=setup([{}, {requirements:{computer:true}}, {requirements:{audio:true}}, {requirements:{audio:true,speech:true}}]);
 assert.deepEqual(a.json('d.tasks.filter(ok).map(t=>t.id)'),['t0']);
 toggle(a,'audioReady',true);assert.deepEqual(a.json('d.tasks.filter(ok).map(t=>t.id)'),['t0','t2']);
 toggle(a,'speechReady',true);assert.deepEqual(a.json('d.tasks.filter(ok).map(t=>t.id)'),['t0','t2','t3']);
 toggle(a,'computerReady',true);assert.equal(a.run('d.tasks.filter(ok).length'),4);
});
test('legacy time and noise labels no longer exclude otherwise executable activities',()=>{
 const d=fixture();d.completed=[];d.preferences.time=5;
 d.tasks=['quiet','noisy','class'].map((env,i)=>({...d.tasks[0],id:'t'+i,env,minutes:1440}));
 const a=boot({whatToDoData:JSON.stringify(d)});assert.ifError(a.error);
 assert.deepEqual(a.json('d.tasks.filter(ok).map(t=>t.id)'),['t0','t1','t2']);
 assert.deepEqual(a.json('d.tasks'),d.tasks);assert.equal(a.writes.length,0);
});
test('disabled and computer-only activities stay excluded when no other candidate exists',()=>{
 const a=setup([{enabled:false},{requirements:{computer:true}}]);
 assert.equal(a.run('cur'),null);assert.match(a.elements.get('rec').children[0].textContent,/没有符合当前条件/);
 toggle(a,'computerReady',true);assert.equal(a.run('cur.id'),'t1');
});
test('changing time keeps the activity and starts a session for that budget',()=>{
 const a=setup();a.times.find(b=>b.dataset.v==='5').click();
 assert.equal(a.run('cur.id'),'t0');a.elements.get('start').click();
 assert.equal(a.run('timerState().plannedDurationMs'),5*60000);
});
test('condition changes invalidate stale start buttons',()=>{
 const a=setup([{requirements:{audio:true}}],{audio:true}),stale=a.elements.get('start');
 toggle(a,'audioReady',false);assert.equal(a.run('cur'),null);stale.click();assert.equal(a.values.has('activeTimer'),false);
});
test('start rechecks existence, enabled state and changed requirements',()=>{
 for(const mutation of ['d.tasks=[]','d.tasks[0].enabled=false','d.tasks[0].requirements.speech=true']){
  const a=setup(),stale=a.elements.get('start');a.run(mutation);stale.click();assert.equal(a.values.has('activeTimer'),false);
 }
});
test('detached start cannot start a different recommendation',()=>{
 const a=setup([{},{}]),stale=a.elements.get('start');a.elements.get('random').click();stale.click();
 assert.equal(a.values.has('activeTimer'),false);
});
test('interruption preference chooses easy-to-pause activities and falls back without excluding all',()=>{
 const a=setup([{requirements:{uninterrupted:true}},{}]);
 a.run('cur=d.tasks[0];random({keepCurrent:true})');toggle(a,'interruptionsLikely',true);assert.equal(a.run('cur.id'),'t1');
 a.elements.get('random').click();assert.equal(a.run('cur.id'),'t0');
 const b=setup([{requirements:{uninterrupted:true}}],{interrupted:true});assert.equal(b.run('cur.id'),'t0');
});
test('failed condition save restores runtime, controls, recommendation and storage',()=>{
 const a=setup([{requirements:{audio:true}}],{audio:true}),raw=a.values.get('whatToDoData');a.faults.write=true;
 toggle(a,'audioReady',false);assert.equal(a.run('conditions.audio'),true);assert.equal(a.elements.get('audioReady').checked,true);
 assert.equal(a.run('cur.id'),'t0');assert.equal(a.values.get('whatToDoData'),raw);
});
test('recent completion fallback cannot bypass resource requirements',()=>{
 const a=setup([{}, {requirements:{speech:true}}]);a.run('d.completed=[{taskId:"t0",completedAt:new Date().toISOString(),minutes:1}];random()');
 assert.equal(a.run('cur.id'),'t0');
});
test('recommendations do not rewrite activities or invent history',()=>{
 const a=setup([{},{}]),raw=a.values.get('whatToDoData');
 for(let i=0;i<6;i++)a.elements.get('random').click();
 assert.equal(a.values.get('whatToDoData'),raw);assert.equal(a.run('d.completed.length'),0);
 a.run('restartRecommendations()');a.elements.get('start').click();a.run('finishTimer();page("home");random();finishTimer()');assert.equal(a.run('d.completed.length'),1);
});
test('manual selection uses current budget while allowing a deliberate resource override',()=>{
 const a=setup([{requirements:{computer:true}}]);assert.equal(a.run('cur'),null);
 a.run('run(d.tasks[0])');assert.equal(a.run('timerState().plannedDurationMs'),10*60000);
});
test('requirements and current conditions survive a backup round trip, preserving unknown legacy data',async()=>{
 const a=setup([{requirements:{audio:true},notes:{keep:true}}],{audio:true});
 a.elements.get('export').click();const data=JSON.parse(await a.downloads.at(-1).blob.text());
 const b=boot({whatToDoData:JSON.stringify(data)});assert.ifError(b.error);
 assert.deepEqual(b.json('d.tasks'),data.tasks);assert.deepEqual(b.json('conditions'),data.preferences.conditions);
 for(const mutation of ['x.tasks[0].requirements.audio="yes"','x.preferences.conditions.speech=1']){
  const before=b.values.get('whatToDoData');b.run('var x=JSON.parse(JSON.stringify(d));'+mutation+';try{validateImport(x);throw Error("accepted")}catch(e){if(e.message==="accepted")throw e}');
  assert.equal(b.values.get('whatToDoData'),before);
 }
});
