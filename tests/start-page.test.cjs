const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
const start=()=>{const a=boot({whatToDoData:JSON.stringify(fixture())});assert.ifError(a.error);return a;};
test('legacy saved conditions show a recommendation without startup writes',()=>{
 const a=start();assert.equal(a.run('selectionReady()'),true);assert.equal(a.run('cur.id'),'mine-task');
 assert.equal(a.elements.get('timeSummary').textContent,'10 分钟');assert.equal(a.elements.get('conditionsSummary').textContent,'当前条件');
 assert.equal(a.writes.length,0);assert.equal(a.values.has('activeTimer'),false);
});
test('fresh one-field onboarding creates an activity without a duration or environment',()=>{
 const a=boot();assert.ifError(a.error);assert.equal(a.elements.get('onboarding').classList.contains('hide'),false);
 assert.equal(a.elements.has('mins'),false);assert.equal(a.elements.has('environment'),false);assert.equal(a.elements.has('quickOptions'),false);assert.equal(a.elements.has('restoreWelcome'),false);
 a.elements.get('quickName').value='读书';a.elements.get('quickAddForm').dispatch('submit');
 assert.equal(a.run('cur.name'),'读书');assert.equal(a.run('Object.hasOwn(cur,"minutes")'),false);assert.equal(a.run('Object.hasOwn(cur,"env")'),false);
 assert.equal(a.run('validateData(d)===d'),true);assert.equal(a.values.has('activeTimer'),false);
 const b=boot(Object.fromEntries(a.values));assert.ifError(b.error);assert.equal(b.run('cur.name'),'读书');assert.equal(b.writes.length,0);
});
test('single candidate hides change and never shows a redundant explanation',()=>{
 const a=start();assert.equal(a.elements.get('random').classList.contains('hide'),true);assert.equal(a.elements.has('recommendationHint'),false);
 assert.equal(a.elements.get('rec').children.some(c=>c.classList.contains('meta')),false);
});
test('failed preset and condition writes retain the current recommendation',()=>{
 const a=start();a.faults.write=true;a.times.find(b=>b.dataset.v==='30').click();
 a.elements.get('speechReady').checked=true;a.elements.get('speechReady').dispatch('change');
 assert.deepEqual(a.json('[timeChosen,time,conditions.speech,cur.id]'),[true,10,false,'mine-task']);
});
test('import updates current conditions, theme, and excludes incompatible activities',()=>{
 const a=start(),d=fixture();d.tasks[0].requirements={audio:true};d.preferences={time:30,conditions:{computer:true,audio:false,speech:true,interrupted:true}};d.theme='dark';
 a.import(d);a.confirm();assert.deepEqual(a.json('[time,conditions]'),[30,d.preferences.conditions]);
 assert.equal(a.run('cur'),null);assert.equal(a.document.documentElement.dataset.theme,'dark');assert.equal(a.elements.get('speechReady').checked,true);
});
test('editing legacy conditions preserves old fields and enables future backup reloads',()=>{
 const a=start(),old=a.json('d.tasks[0]');a.run('edit(d.tasks[0])');
 a.elements.get('requiresAudio').checked=true;a.elements.get('name').value='接着读';a.elements.get('form').dispatch('submit');
 assert.equal(a.run('d.tasks[0].minutes'),old.minutes);assert.equal(a.run('d.tasks[0].env'),old.env);assert.equal(a.run('d.tasks[0].requirements.audio'),true);
 assert.equal(a.run('cur'),null);const b=boot(Object.fromEntries(a.values));assert.ifError(b.error);assert.equal(b.run('d.tasks[0].requirements.audio'),true);
});
test('a v1 backup without preferences remains valid after its first save and reload',()=>{
 const d=fixture();delete d.version;delete d.preferences;
 const a=boot({whatToDoData:JSON.stringify(d)});assert.ifError(a.error);
 a.elements.get('theme').click();assert.equal(a.run('validateData(d)===d'),true);
 const b=boot(Object.fromEntries(a.values));assert.ifError(b.error);assert.equal(b.run('storageBlocked'),false);assert.equal(b.run('d.tasks.length'),1);
});
