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

test('details close at ten seconds independently; closing and reopening starts a fresh countdown', () => {
  const app=appFor();
  app.run(`
    let clock=0,sequence=0;
    const pendingTimeouts=new Map();
    setTimeout=(fn,delay)=>{const id=++sequence;pendingTimeouts.set(id,{fn,at:clock+delay});return id};
    clearTimeout=id=>pendingTimeouts.delete(id);
    function advance(ms){clock+=ms;for(const [id,timer] of [...pendingTimeouts])if(timer.at<=clock){pendingTimeouts.delete(id);timer.fn()}}
    const RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${JSON.stringify(now)}]))}};
    d.completed=Array.from({length:2},(_,i)=>({taskId:'task'+i,taskName:'记录 '+i,completedAt:${JSON.stringify(now)},actualDurationMs:3000}));
    today();
    const cards=$('todayBox').children[1].children;
    function toggleCard(card,open){card.isConnected=true;card.open=open;card.dispatch('toggle')}
    toggleCard(cards[0],true);advance(5000);toggleCard(cards[1],true);advance(4999);
  `);
  assert.deepEqual(app.json('cards.map(c=>c.open)'),[true,true]);
  app.run('advance(1)');
  assert.deepEqual(app.json('cards.map(c=>c.open)'),[false,true]);
  app.run('toggleCard(cards[1],false);advance(1000);toggleCard(cards[1],true);advance(9999)');
  assert.equal(app.run('cards[1].open'),true);
  app.run('advance(1)');
  assert.equal(app.run('cards[1].open'),false);
  assert.equal(app.run('pendingTimeouts.size'),0);
  assert.equal(app.writes.length,0);
});

test('redraw and navigation discard disclosure timeouts and detached toggle events cannot restart them', () => {
  const app=appFor(),raw=app.values.get('whatToDoData');
  app.run(`
    const activeTimeouts=new Map();let timeoutId=0;
    setTimeout=(fn,delay)=>{const id=++timeoutId;activeTimeouts.set(id,{fn,delay});return id};
    clearTimeout=id=>activeTimeouts.delete(id);
    const RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${JSON.stringify(now)}]))}};
    d.completed=[{taskId:'task',taskName:'记录',completedAt:${JSON.stringify(now)},actualDurationMs:3000}];
    today();const oldCard=$('todayBox').children[1].children[0];
    oldCard.open=true;oldCard.isConnected=true;oldCard.dispatch('toggle');
  `);
  assert.equal(app.run('todayRecordTimers.size'),1);
  app.run('today();oldCard.isConnected=false;oldCard.dispatch("toggle")');
  assert.equal(app.run('todayRecordTimers.size'),0);
  assert.equal(app.run('activeTimeouts.size'),0);
  app.run('const currentCard=$("todayBox").children[1].children[0];currentCard.open=true;currentCard.isConnected=true;currentCard.dispatch("toggle");page("tasks")');
  assert.equal(app.run('todayRecordTimers.size'),0);
  assert.equal(app.run('activeTimeouts.size'),0);
  assert.equal(app.values.get('whatToDoData'),raw);
  assert.equal(app.writes.length,0);
});

test('today groups repeated executions by activity identity, sorts both levels and sums only effective time', () => {
  const data=fixture(),stamp=(day,time)=>`2026-10-${day}T${time}+08:00`;
  const record=(recordId,taskId,time,duration,day='21')=>({recordId,completionId:recordId,taskId,taskName:'同名活动',startedAt:stamp(day,time),completedAt:stamp(day,time),actualDurationMs:duration,pausedDurationMs:600000,plannedDuration:30,note:'保留原始记录'});
  data.completed=[record('c3','coding','14:20:00',1800000),record('other','another-coding','12:00:00',900000),record('c2','coding','11:10:43',62000),record('yesterday','coding','11:00:00',999999,'20'),record('c1','coding','11:10:19',3000),record('zero','__proto__','16:00:00',0)];
  const raw=JSON.stringify(data),app=boot({whatToDoData:raw});assert.ifError(app.error);
  app.run(`const RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${JSON.stringify(now)}]))}}`);
  assert.deepEqual(app.json('todayRecordGroups().map(g=>({id:g.taskId,ids:g.records.map(r=>r.recordId),total:g.totalMs}))'),[
    {id:'coding',ids:['c1','c2','c3'],total:1865000},
    {id:'another-coding',ids:['other'],total:900000},
    {id:'__proto__',ids:['zero'],total:0}
  ]);
  for(let i=0;i<3;i++)app.run('today()');
  assert.equal(app.elements.get('todayBox').children[1].children.length,3);
  assert.deepEqual(app.json('d.completed'),data.completed);
  assert.equal(app.values.get('whatToDoData'),raw);assert.equal(app.writes.length,0);
});

test('more information restarts the group timeout, switches panels and resets when the group closes', () => {
  const app=appFor();
  app.run(`
    let clock=0,serial=0;const timeouts=new Map();
    setTimeout=(fn,delay)=>{const id=++serial;timeouts.set(id,{fn,at:clock+delay});return id};
    clearTimeout=id=>timeouts.delete(id);
    function advance(ms){clock+=ms;for(const [id,timer] of [...timeouts])if(timeouts.has(id)&&timer.at<=clock){timeouts.delete(id);timer.fn()}}
    const RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${JSON.stringify(now)}]))}};
    d.completed=Array.from({length:2},(_,i)=>({taskId:'same',taskName:'活动',completedAt:${JSON.stringify(now)},actualDurationMs:3000}));
    today();const group=$('todayBox').children[1].children[0],sessions=group.children[1].children;
    const buttons=sessions.map(s=>s.children[0].children[2]),panels=sessions.map(s=>s.children[1]);
    function toggle(card,open){card.isConnected=true;card.open=open;card.dispatch('toggle')}
    toggle(group,true);advance(5000);buttons[0].click();advance(5000);
  `);
  assert.deepEqual(app.json('[group.open,...panels.map(p=>p.hidden)]'),[true,false,true]);
  app.run('buttons[1].click();advance(9999)');
  assert.deepEqual(app.json('[group.open,...panels.map(p=>p.hidden)]'),[true,true,false]);
  app.run('advance(1)');assert.deepEqual(app.json('[group.open,...panels.map(p=>p.hidden)]'),[false,true,true]);
  assert.deepEqual(app.json('buttons.map(b=>b["aria-expanded"])'),['false','false']);
  assert.equal(app.run('todayRecordTimers.size'),0);
  app.run('toggle(group,true);buttons[0].click();toggle(group,false)');
  assert.deepEqual(app.json('[group.open,...panels.map(p=>p.hidden),timeouts.size,todayRecordTimers.size]'),[false,true,true,0,0]);
  assert.equal(app.writes.length,0);
});

test('compact ranges use minutes while retaining seconds for short executions and dates across midnight', () => {
  const app=appFor();
  const compact=(startedAt,endedAt)=>app.run(`recordCompactTimeRange(${JSON.stringify({startedAt,endedAt})},${JSON.stringify(now)})`);
  assert.equal(compact('2026-10-21T20:04:48+08:00','2026-10-21T20:19:33+08:00'),'20:04–20:19');
  assert.equal(compact('2026-10-21T11:10:19+08:00','2026-10-21T11:10:22+08:00'),'11:10:19–11:10:22');
  assert.equal(compact('2026-10-21T11:10:58+08:00','2026-10-21T11:11:05+08:00'),'11:10:58–11:11:05');
  assert.equal(compact('2026-10-21T11:10:00+08:00','2026-10-21T11:11:00+08:00'),'11:10–11:11');
  assert.equal(compact('2026-10-20T23:59:58+08:00','2026-10-21T00:00:05+08:00'),'2026-10-20 23:59:58–2026-10-21 00:00:05');
  assert.equal(compact(null,null),'开始时间未记录–结束时间未记录');
  assert.equal(compact(null,'2026-10-21T20:19:33+08:00'),'开始时间未记录–2026-10-21 20:19');
});
