const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');
process.env.TZ = 'Asia/Shanghai';
const now = '2026-10-21T21:30:00+08:00';
const appFor = () => {
  const app = boot({whatToDoData:JSON.stringify(fixture())}); assert.ifError(app.error); return app;
};
function range(app, startedAt, endedAt) {
  return app.run(`recordTimeRange(${JSON.stringify({startedAt,endedAt})},${JSON.stringify(now)})`);
}

test('record ranges use local times, include dates across midnight and never infer missing timestamps', () => {
  const app = appFor();
  assert.equal(range(app,'2026-10-21T19:29:00+08:00','2026-10-21T19:59:13+08:00'),'19:29–19:59');
  assert.equal(range(app,'2026-10-20T23:50:00+08:00','2026-10-21T00:20:00+08:00'),'2026-10-20 23:50–2026-10-21 00:20');
  assert.equal(range(app,'2025-12-31T23:50:00+08:00','2026-01-01T00:20:00+08:00'),'2025-12-31 23:50–2026-01-01 00:20');
  assert.equal(range(app,null,null),'开始时间未记录–结束时间未记录');
  assert.equal(range(app,null,'2026-10-21T19:59:00+08:00'),'开始时间未记录–2026-10-21 19:59');
  assert.equal(range(app,'2026-10-21T19:29:00+08:00',undefined),'2026-10-21 19:29–结束时间未记录');
  assert.equal(range(app,'invalid',''),'开始时间未记录–结束时间未记录');
});

test('rendering 1, 5 or 10 records keeps exact data, order, duration rules and storage unchanged', () => {
  for (const count of [1,5,10]) {
    const data = fixture();
    data.completed = Array.from({length:count},(_,i)=>({recordId:'r'+i,completionId:'r'+i,taskId:'task'+i,taskName:'记录 '+i,completedAt:now,actualDurationMs:1813000,startedAt:null,endedAt:null,note:'保留原文'}));
    const raw = JSON.stringify(data), app = boot({whatToDoData:raw}); assert.ifError(app.error);
    app.run(`const RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${JSON.stringify(now)}]))}static now(){return RealDate.parse(${JSON.stringify(now)})}}`);
    for (let i=0;i<3;i++) app.run('today()');
    assert.equal(app.run('recordsForLocalDay().length'),count);
    assert.equal(app.run('recordsForLocalDay().reduce((s,c)=>s+(recordDurationMs(c)||0),0)'),count*1813000);
    assert.deepEqual(app.json('d.completed'),data.completed);
    assert.equal(app.values.get('whatToDoData'),raw); assert.equal(app.writes.length,0);
  }
});
