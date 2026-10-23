const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');

// Fixed local timezone for UTC/local-midnight boundary assertions in this process.
process.env.TZ = 'Asia/Shanghai';
const now = '2026-10-20T00:30:00+08:00';
function dataSet(count = 2) {
  const data = fixture(); data.completed = [];
  data.preferences = { time: 30, env: 'quiet', computerReady: false };
  data.tasks = Array.from({ length: count }, (_, i) => ({ ...data.tasks[0], id: 'task-' + i, name: '重复学习 ' + i, env: 'quiet' }));
  return data;
}
function start(data) {
  const app = boot({ whatToDoData: JSON.stringify(data) }); assert.ifError(app.error); app.chooseConditions(); return app;
}
function record(id, taskId, completedAt, extra = {}) {
  return { recordId: id, completionId: id, taskId, completedAt, minutes: 5, ...extra };
}
function visibleText(node) {
  if (!node) return '';
  return [node.textContent || '', ...(node.children || []).map(visibleText)].join(' ');
}
function freeze(app) {
  app.run(`const RealDate=Date;const fixedTime=RealDate.parse(${JSON.stringify(now)});Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixedTime]))}static now(){return fixedTime}}`);
}

test('condition changes preserve an eligible current recommendation', () => {
  const app = start(dataSet());
  app.run('Math.random=()=>0;random()'); const id = app.run('cur.id');
  app.run('Math.random=()=>0.999999'); app.times.find(b => b.dataset.v === '60').click();
  assert.equal(app.run('cur.id'), id);
  app.elements.get('start').click();
  assert.equal(app.json('timerState().taskId'), id);
});

test('the single change button avoids consecutive repeats when alternatives exist', () => {
  const app = start(dataSet()); app.run('Math.random=()=>0');
  let previous = app.run('cur.id');
  for (let i = 0; i < 8; i++) {
    app.elements.get('random').click();
    assert.notEqual(app.run('cur.id'), previous); previous = app.run('cur.id');
  }
  assert.equal(app.json('d.completed').length, 0);
});

test('explicit change can choose another hard-eligible task even if it was recently practiced', () => {
  const data = dataSet(); data.completed = [record('old', 'task-1', new Date().toISOString())];
  const app = start(data); assert.equal(app.run('cur.id'), 'task-0');
  app.elements.get('random').click(); assert.equal(app.run('cur.id'), 'task-1');
});

test('single candidate hides the change button without explanatory copy', () => {
  const app = start(dataSet(1));
  for (let i = 0; i < 3; i++) app.elements.get('random').click();
  assert.equal(app.run('cur.id'), 'task-0');
  assert.equal(app.elements.get('random').classList.contains('hide'),true);
  assert.doesNotMatch(visibleText(app.elements.get('rec')), /当前条件下只有这一项活动/);
});

test('no candidate clears old task and prevents its detached start action', () => {
  const data = dataSet(1); data.tasks[0].minutes = 30;
  const app = start(data), oldStart = app.elements.get('start');
  app.run('d.tasks[0].computer=true;random({keepCurrent:true})');
  assert.equal(app.run('cur'), null);
  assert.match(visibleText(app.elements.get('rec')), /没有符合当前条件的活动/);
  oldStart.click(); assert.equal(app.values.has('activeTimer'), false);
});

test('changing recommendation conditions does not change a running or paused timer', () => {
  for (const paused of [false, true]) {
    const app = start(dataSet()); app.elements.get('start').click();
    if (paused) app.run('pauseTimer()');
    const before = app.values.get('activeTimer');
    app.times.find(b => b.dataset.v === '5').click(); app.elements.get('audioReady').checked=true;app.elements.get('audioReady').dispatch('change');
    app.elements.get('random').click();
    assert.equal(app.values.get('activeTimer'), before);
    assert.equal(app.json('d.completed').length, 0);
  }
});

test('local day filtering converts UTC timestamps at Shanghai midnight correctly', () => {
  const data = dataSet(); data.completed = [
    record('yesterday', 'task-0', '2026-10-19T15:59:59Z'),
    record('today-utc', 'task-0', '2026-10-19T16:00:00Z'),
    record('today-offset', 'task-1', '2026-10-20T00:01:00+08:00'),
    record('tomorrow', 'task-1', '2026-10-20T16:00:00Z'),
  ];
  const app = start(data);
  assert.equal(new Date(now).getTimezoneOffset(), -480);
  assert.deepEqual(app.json(`recordsForLocalDay(d.completed,${JSON.stringify(now)}).map(c=>c.recordId)`), ['today-utc', 'today-offset']);
});

test('historical task flags and all completion records survive views and repeated initialization', () => {
  const data = dataSet(); data.tasks[0].completed = true; data.tasks[0].done = true;
  data.completed = [record('old', 'task-0', '2026-10-19T15:59:59Z', { note: '保留历史原文' })];
  const raw = JSON.stringify(data);
  for (let i = 0; i < 3; i++) {
    const app = start(data); app.run('page("tasks");page("today");page("home");random()');
    assert.equal(app.values.get('whatToDoData'), raw);
    assert.deepEqual(app.json('d.completed'), data.completed);
    assert.equal(app.json('d.tasks[0].completed'), true); assert.equal(app.json('d.tasks[0].done'), true);
  }
});

test('restoring or automatically extending a timer does not create completion records', () => {
  const app = start(dataSet()); app.elements.get('start').click();
  app.run('let session=timerState();session.lastStarted=Date.now()-session.durationMs-1000;setTimerState(session)');
  const reloaded = boot(Object.fromEntries(app.values)); assert.ifError(reloaded.error);
  assert.equal(reloaded.json('d.completed').length, 0);
  assert.ok(reloaded.json('timerState().extensionDurationMs') > 0);
});

test('repeating the same task creates separate sessions, each completed only once', () => {
  const app = start(dataSet(1));
  for (let i = 0; i < 2; i++) {
    app.run('page("home")'); app.elements.get('start').click();
    app.run('finishTimer();finishTimer()');
  }
  const completed = app.json('d.completed');
  assert.equal(completed.length, 2);
  assert.equal(new Set(completed.map(c => c.completionId)).size, 2);
  assert.equal(completed[0].taskId, completed[1].taskId);
  assert.equal(app.json('d.tasks').length, 1);
});
