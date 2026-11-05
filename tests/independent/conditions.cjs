const assert=require('node:assert/strict');
const {boot,fixture}=require('../helpers/app-harness.cjs');
let cases=0;
for(let mask=0;mask<16;mask++)for(const mode of ['running','paused','finished','recovery']){
 const d=fixture();d.completed=[];d.preferences.time=15;const app=boot({whatToDoData:JSON.stringify(d)});assert.ifError(app.error);
 app.run(`conditions={computer:${!!(mask&1)},audio:${!!(mask&2)},speech:${!!(mask&4)},interrupted:${!!(mask&8)}};persistPreferences();run(d.tasks[0]);`);
 if(mode==='paused')app.run('pauseTimer()');
 if(mode==='finished')app.run('var x=timerState();x.elapsed=x.durationMs;x.finished=true;x.timeUpAt=Date.now();x.checkpointAt=Date.now();setTimerState(x);renderTimer()');
 if(mode==='recovery')app.run("suspendTimer('reopen',Date.now(),false);renderTimer()");
 assert.equal(app.run('finishTimer()'),true,`${mask}/${mode}`);
 const saved=JSON.parse(app.values.get('whatToDoData'));
 assert.deepEqual(saved.preferences.conditions,{computer:false,audio:false,speech:false,interrupted:false});
 assert.deepEqual(app.json('conditions'),saved.preferences.conditions);
 assert.equal(saved.preferences.time,15);assert.equal(saved.completed.length,1);assert.equal(app.values.has('activeTimer'),false);cases++;
}
console.log(`PASS: ${cases} independent condition-reset combinations (16 masks x 4 ending states); Node VM of fixed app.js, not real browser evidence.`);
