const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
function setup(){const d=fixture();d.completed=[];d.tasks[0].minutes=90;const a=boot({whatToDoData:JSON.stringify(d)});assert.ifError(a.error);return a;}
const select=(a,v)=>a.times.find(b=>b.dataset.v===String(v)).click();
function input(a,v){a.elements.get('customMinutes').value=v;a.elements.get('customMinutes').dispatch('input');}
test('custom begins blank and accepts integer boundaries without filtering legacy activity lengths',()=>{
 const a=setup();select(a,'custom');assert.equal(a.run('selectionReady()'),false);assert.equal(a.elements.get('customMinutes').value,'');
 for(const v of ['1','8','25','45','90','1440']){input(a,v);assert.equal(a.run('time'),+v);assert.equal(a.run('ok(cur)'),true);assert.equal(a.run('cur.id'),'mine-task');}
});
test('invalid budgets remove recommendations and prevent detached and manual starts',()=>{
 for(const v of ['',' ','0','-5','1.5','abc','1441','1e2','Infinity']){
  const a=setup();select(a,'custom');input(a,'25');const stale=a.elements.get('start');input(a,v);
  assert.equal(a.run('cur'),null);assert.equal(a.elements.get('customMinutes')['aria-invalid'],String(v.trim()!==''));stale.click();a.run('run(d.tasks[0])');
  assert.equal(a.values.has('activeTimer'),false);
 }
});
test('budget changes preserve an executable activity and new sessions use the selected time',()=>{
 const a=setup();select(a,'custom');input(a,'90');const id=a.run('cur.id');input(a,'8');
 assert.equal(a.run('cur.id'),id);a.elements.get('start').click();assert.equal(a.run('timerState().plannedDurationMs'),8*60000);
});
test('presets hide the field and retain the custom draft',()=>{
 const a=setup();select(a,'custom');input(a,'25');select(a,60);
 assert.equal(a.elements.get('customTimeField').classList.contains('hide'),true);select(a,'custom');
 assert.equal(a.run('time'),25);assert.equal(a.elements.get('customMinutes').value,'25');
});
test('custom time remains session-only through saved conditions, failed writes and reload',()=>{
 const a=setup();select(a,'custom');input(a,'25');a.elements.get('theme').click();
 a.faults.write=true;select(a,60);assert.deepEqual(a.json('[customTime,time,timeChosen]'),[true,25,true]);
 delete a.faults.write;a.elements.get('audioReady').checked=true;a.elements.get('audioReady').dispatch('change');
 assert.equal(a.run('time'),25);assert.equal(a.run('d.preferences.time'),10);assert.equal(a.run('conditions.audio'),true);
 const b=boot(Object.fromEntries(a.values));assert.ifError(b.error);assert.deepEqual(b.json('[customTime,customTimeDraft,time]'),[false,'',10]);assert.equal(b.run('conditions.audio'),true);
});
test('budget and current-condition edits never alter a running or paused timer',()=>{
 for(const paused of [false,true]){
  const a=setup();select(a,'custom');input(a,'25');a.elements.get('start').click();if(paused)a.run('pauseTimer()');
  const timer=a.values.get('activeTimer');input(a,'8');input(a,'bad');select(a,60);
  a.elements.get('audioReady').checked=true;a.elements.get('audioReady').dispatch('change');
  assert.equal(a.values.get('activeTimer'),timer);assert.equal(a.run('d.completed.length'),0);
 }
});
