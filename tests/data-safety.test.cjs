const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');

const stored = data => ({ whatToDoData: JSON.stringify(data) });
const started = app => assert.ifError(app.error);
function activeTimer(paused = false) {
  const task = fixture().tasks[0], now = Date.now();
  return { completionId: 'session-one', taskId: task.id, task, durationMs: 600000, plannedDurationMs: 600000,
    extensionDurationMs: 0, elapsed: 1000, startedAt: now - 1000, lastStarted: paused ? 0 : now,
    paused, finished: false, soundPlayed: false, pauseStartedAt: paused ? now : 0, pausedDurationMs: 0 };
}

test('first use initializes an empty personal library', () => {
  const app = boot(); started(app);
  assert.equal(JSON.parse(app.values.get('whatToDoData')).version, 2);
  assert.equal(app.json('d.tasks').length, 0);
});

test('valid existing data and unknown fields survive loading', () => {
  const data = fixture(), app = boot(stored(data)); started(app);
  assert.deepEqual(app.json('d.customData'), data.customData);
  assert.deepEqual(app.json('d.tasks'), data.tasks);
  assert.deepEqual(app.json('d.completed[0].note'), '旧记录');
});

test('damaged JSON is retained and raw export is offered', async () => {
  const raw = '{broken'; const app = boot({ whatToDoData: raw }); started(app);
  assert.equal(app.values.get('whatToDoData'), raw);
  assert.equal(app.writes.length, 0);
  assert.ok(app.elements.get('dataRecovery'));
  app.elements.get('exportRawData').click();
  assert.equal(await app.downloads.at(-1).blob.text(), raw);
});

test('invalid nonempty structures are never replaced by defaults', () => {
  for (const raw of ['null', '{}', '[]', ' ', JSON.stringify({ ...fixture(), tasks: [null] })]) {
    const app = boot({ whatToDoData: raw }); started(app);
    assert.equal(app.values.get('whatToDoData'), raw);
    assert.equal(app.writes.length, 0);
  }
});

test('legacy migration preserves all goals, tasks, records and unknown fields', () => {
  const data = fixture(); delete data.version; delete data.preferences; delete data.defaultTasksSeeded;
  delete data.completed[0].completedAt;
  data.goals = [{ id: 'java', icon: '💻', name: 'Java 后端', description: '夯实 Java 后端能力' }];
  data.tasks = [{ id: 's0', name: '复习 Java 集合', goalId: 'java', minutes: 15, env: 'quiet', computer: true, description: '回顾 List、Set、Map 的核心差异', extra: '保留' }];
  const app = boot(stored(data)); started(app);
  assert.deepEqual(app.json('d.goals.find(g=>g.id==="java")'), data.goals[0]);
  for (const [key, value] of Object.entries(data.tasks[0])) assert.deepEqual(app.json('d.tasks.find(t=>t.id==="s0")[' + JSON.stringify(key) + ']'), value);
  assert.equal(app.json('d.completed[0]').startedAt, undefined);
  assert.equal(app.json('d.completed[0]').endedAt, undefined);
  assert.equal(app.json('d.completed[0]').date, data.completed[0].date);
  assert.deepEqual(app.json('d.customData'), data.customData);
});

test('unavailable localStorage does not crash or write defaults', () => {
  for (const faults of [{ read: true }, { access: true }]) {
    const app = boot(stored(fixture()), faults); started(app);
    assert.equal(app.writes.length, 0);
    assert.ok(app.elements.get('dataRecovery'));
  }
});

test('initial write failure leaves storage empty and reports failure', () => {
  const app = boot({}, { write: true }); started(app);
  assert.equal(app.values.has('whatToDoData'), false);
  assert.ok(app.elements.get('storageWarning'));
});

test('failed task save keeps old data, open editor and no success message', () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData');
  app.faults.write = true;
  app.run('newTask("mine")');
  for (const [id, value] of Object.entries({ name: '未保存的任务', mins: '5', environment: 'noisy' })) app.elements.get(id).value = value;
  app.elements.get('form').dispatch('submit');
  assert.equal(app.values.get('whatToDoData'), before);
  assert.equal(app.run('d.tasks.some(t=>t.name==="未保存的任务")'), false);
  assert.equal(app.elements.get('modal').classList.contains('hide'), false);
  assert.notEqual(app.elements.get('appNotice')?.textContent, '任务已保存。');
  assert.ok(app.elements.get('storageWarning'));
});

test('valid import waits for confirmation and synchronizes preferences and theme', () => {
  const app = boot(stored(fixture())); started(app); app.chooseConditions();
  const before = app.values.get('whatToDoData');
  const incoming = fixture(); incoming.preferences = { time: 30, env: 'quiet', computerReady: true }; incoming.theme = 'dark';
  app.import(incoming);
  assert.equal(app.values.get('whatToDoData'), before);
  assert.equal(app.elements.get('confirmLayer').classList.contains('hide'), false);
  app.confirm();
  assert.deepEqual(JSON.parse(app.values.get('whatToDoData')).preferences, incoming.preferences);
  assert.deepEqual(app.json('[time,env,computerReady]'), [30, 'quiet', true]);
  assert.equal(app.document.documentElement.dataset.theme, 'dark');
  assert.equal(app.elements.get('computerReady').checked, true);
  assert.ok(app.times.find(x => x.dataset.v === '30').classList.contains('on'));
  assert.ok(app.envs.find(x => x.dataset.v === 'quiet').classList.contains('on'));
});

test('invalid imports and cancellation do not touch stored or runtime data', () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData'), runtime = app.json('d');
  for (const input of ['{broken', { ...fixture(), preferences: { time: 10, env: 'noisy', computerReady: 'yes' } }, { ...fixture(), theme: 'invalid' }]) {
    app.import(input);
    assert.equal(app.elements.get('confirmLayer').classList.contains('hide'), true);
    assert.equal(app.values.get('whatToDoData'), before);
    assert.deepEqual(app.json('d'), runtime);
  }
  app.import(fixture()); app.cancel();
  assert.equal(app.values.get('whatToDoData'), before);
  assert.deepEqual(app.json('d'), runtime);
});

test('failed import retains old runtime, storage, preferences and theme', () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData'), runtime = app.json('d');
  const incoming = fixture(); incoming.tasks[0].name = '新备份'; incoming.theme = 'dark'; incoming.preferences.time = 30;
  app.import(incoming); app.faults.write = true;
  app.confirm();
  assert.equal(app.values.get('whatToDoData'), before);
  assert.deepEqual(app.json('d'), runtime);
  assert.deepEqual(app.json('[time,env,computerReady]'), [10, 'noisy', false]);
  assert.equal(app.document.documentElement.dataset.theme, 'light');
});

test('empty string storage is first use, but future versions are protected', () => {
  const empty = boot({ whatToDoData: '' }); started(empty);
  assert.equal(empty.json('d.tasks').length, 0);
  const raw = JSON.stringify({ ...fixture(), version: 3 });
  const newer = boot({ whatToDoData: raw }); started(newer);
  assert.equal(newer.values.get('whatToDoData'), raw);
  assert.equal(newer.writes.length, 0);
});

test('existing data is migrated in memory without startup writes', () => {
  const data = fixture(); delete data.defaultTasksSeeded;
  data.goals.push({ id: 'hobby', name: '兴趣爱好' });
  data.tasks.push({ ...data.tasks[0], id: 's99', name: '计算机二级', goalId: 'hobby' });
  const raw = JSON.stringify(data), app = boot({ whatToDoData: raw }); started(app);
  assert.equal(app.values.get('whatToDoData'), raw);
  assert.equal(app.writes.length, 0);
  assert.equal(app.run('d.tasks.some(t=>t.id==="s99")'), true);
  assert.equal(app.run('d.tasks.filter(t=>t.id.startsWith("default-")).length'), 0);
  app.run('persistPreferences()');
  const reload = boot(Object.fromEntries(app.values)); started(reload);
  assert.equal(reload.json('d.tasks').length, app.json('d.tasks').length);
});

test('malformed active timer is retained, exported and prevents initialization writes', async () => {
  for (const raw of ['{broken', '{}', 'null', JSON.stringify({ ...activeTimer(), durationMs: -1 })]) {
    const app = boot({ whatToDoData: JSON.stringify(fixture()), activeTimer: raw }); started(app);
    assert.equal(app.values.get('activeTimer'), raw);
    assert.equal(app.writes.length, 0);
    app.elements.get('exportRawTimer').click();
    assert.equal(await app.downloads.at(-1).blob.text(), raw);
  }
});

test('failed timer start, pause, resume and give-up retain the previous state', () => {
  const app = boot(stored(fixture())); started(app);
  app.faults.writeKey = 'activeTimer';
  app.run('startTimer(d.tasks[0])');
  assert.equal(app.values.has('activeTimer'), false);
  assert.equal(app.elements.get('timer').classList.contains('hide'), true);
  delete app.faults.writeKey;
  app.run('startTimer(d.tasks[0])');
  const running = app.values.get('activeTimer');
  app.faults.writeKey = 'activeTimer'; app.run('pauseTimer()');
  assert.equal(app.values.get('activeTimer'), running);
  assert.ok(app.intervals.size > 0);
  delete app.faults.writeKey; app.run('pauseTimer()');
  const paused = app.values.get('activeTimer');
  app.faults.writeKey = 'activeTimer'; app.run('resumeTimer()');
  assert.equal(app.values.get('activeTimer'), paused);
  app.faults.removeKey = 'activeTimer'; app.run('giveUpTimer()'); app.confirm();
  assert.equal(app.values.get('activeTimer'), paused);
  assert.equal(app.elements.get('confirmLayer').classList.contains('hide'), false);
});

test('failed completion save retains timer and permits one successful retry', () => {
  const timer = activeTimer(), app = boot({ ...stored(fixture()), activeTimer: JSON.stringify(timer) }); started(app);
  const before = app.values.get('whatToDoData'), activeBefore = app.values.get('activeTimer');
  app.faults.writeKey = 'whatToDoData'; app.run('finishTimer()');
  assert.equal(app.values.get('whatToDoData'), before);
  assert.equal(app.values.get('activeTimer'), activeBefore);
  assert.equal(app.json('d.completed').length, 1);
  assert.ok(app.intervals.size > 0);
  delete app.faults.writeKey; app.run('finishTimer()'); app.run('finishTimer()');
  assert.equal(app.json('d.completed').length, 2);
  assert.equal(app.values.has('activeTimer'), false);
});

test('completion survives failed timer removal without duplicate records after reload', () => {
  const timer = activeTimer(), app = boot({ ...stored(fixture()), activeTimer: JSON.stringify(timer) }); started(app);
  app.faults.removeKey = 'activeTimer'; app.run('finishTimer()'); app.run('finishTimer()');
  assert.equal(app.json('d.completed').filter(c => c.completionId === timer.completionId).length, 1);
  assert.equal(app.values.has('activeTimer'), true);
  assert.equal(app.elements.get('timer').classList.contains('hide'), true);
  const reload = boot(Object.fromEntries(app.values)); started(reload);
  assert.equal(reload.values.has('activeTimer'), false);
  assert.equal(reload.json('d.completed').filter(c => c.completionId === timer.completionId).length, 1);
});

test('missing timer task and failed removal do not recurse or delete the timer', () => {
  const timer = activeTimer(true); timer.taskId = 'missing'; delete timer.task;
  const raw = JSON.stringify(timer), app = boot({ ...stored(fixture()), activeTimer: raw }, { remove: true }); started(app);
  assert.equal(app.values.get('activeTimer'), raw);
  assert.equal(app.writes.length, 0);
  assert.ok(app.elements.get('dataRecovery'));
});

test('failed preference and theme writes restore selected controls', () => {
  const app = boot(stored(fixture())); started(app); app.chooseConditions();
  app.faults.write = true;
  app.times.find(x => x.dataset.v === '30').click();
  app.envs.find(x => x.dataset.v === 'quiet').click();
  app.elements.get('computerReady').checked = true;
  app.elements.get('computerReady').dispatch('change');
  app.elements.get('theme').click();
  assert.deepEqual(app.json('[time,env,computerReady]'), [10, 'noisy', false]);
  assert.equal(app.document.documentElement.dataset.theme, 'light');
  assert.ok(app.times.find(x => x.dataset.v === '10').classList.contains('on'));
  assert.ok(app.envs.find(x => x.dataset.v === 'noisy').classList.contains('on'));
  assert.equal(app.elements.get('computerReady').checked, false);
});

test('strict import validation rejects invalid fields and never mutates the candidate', () => {
  const app = boot(stored(fixture())); started(app);
  const invalid = [
    x => { x.version = 99; }, x => { delete x.completed; }, x => { x.preferences = []; },
    x => { x.goals.push(x.goals[0]); }, x => { x.tasks[0].minutes = 0; },
    x => { x.tasks[0].goalId = 123; }, x => { x.tasks[0].computer = 1; },
    x => { x.preferences.time = 20; }, x => { x.preferences.env = 'invalid'; },
    x => { x.completed[0].minutes = -1; }, x => { x.completed[0].minutes = ''; },
    x => { x.completed[0].completedAt = 'invalid'; }, x => { x.completed[0].taskName = {}; },
  ];
  const before = app.values.get('whatToDoData');
  for (const mutate of invalid) {
    const data = fixture(); mutate(data); app.import(data);
    assert.equal(app.elements.get('confirmLayer').classList.contains('hide'), true);
    assert.equal(app.values.get('whatToDoData'), before);
  }
  const copy = JSON.stringify(fixture());
  app.run('const importCandidate=' + copy + ';validateImport(importCandidate)');
  assert.equal(app.run('JSON.stringify(importCandidate)'), copy);
});

test('legacy backup import and JSON export round trip retain history without invented times', async () => {
  const app = boot(stored(fixture())); started(app);
  const data = fixture(); delete data.version; delete data.preferences; delete data.completed[0].completedAt;
  app.import(data); app.confirm(); app.elements.get('export').click();
  const backup = JSON.parse(await app.downloads.at(-1).blob.text());
  assert.equal(backup.completed[0].date, data.completed[0].date);
  assert.equal(backup.completed[0].startedAt, undefined);
  assert.equal(backup.completed[0].endedAt, undefined);
  assert.deepEqual(backup.customData, data.customData);
  app.import(backup); app.confirm();
  assert.deepEqual(app.json('d'), backup);
});

test('cancelling an import clears its candidate and confirmation cannot write later', () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData');
  const incoming = fixture(); incoming.theme = 'dark';
  app.import(incoming); app.cancel(); app.confirm();
  assert.equal(app.run('pendingImport'), null);
  assert.equal(app.values.get('whatToDoData'), before);
});

test('import leaves the separate active timer untouched', () => {
  const app = boot({ ...stored(fixture()), activeTimer: JSON.stringify(activeTimer(true)) }); started(app);
  const before = app.values.get('activeTimer');
  app.import(fixture());
  assert.match(app.elements.get('confirmText').textContent, /主题/);
  assert.match(app.elements.get('confirmText').textContent, /当前活动计时保持不变/);
  app.confirm();
  assert.equal(app.values.get('activeTimer'), before);
});

test('interface failure during import rolls back storage and runtime', () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData'), runtime = app.json('d');
  const incoming = fixture(); incoming.theme = 'dark'; incoming.preferences.time = 30;
  app.import(incoming);
  app.run('const originalPage=page;let failPageOnce=true;page=function(id){if(failPageOnce){failPageOnce=false;throw Error("test render error")}return originalPage(id)}');
  app.confirm();
  assert.equal(app.values.get('whatToDoData'), before);
  assert.deepEqual(app.json('d'), runtime);
  assert.deepEqual(app.json('[time,env,computerReady]'), [10, 'noisy', false]);
  assert.equal(app.document.documentElement.dataset.theme, 'light');
  assert.notEqual(app.elements.get('appNotice').textContent, '备份数据已导入。');
});

test('read failure during import confirmation keeps old data', () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData'), runtime = app.json('d');
  app.import(fixture()); app.faults.readKey = 'whatToDoData'; app.confirm();
  assert.equal(app.values.get('whatToDoData'), before);
  assert.deepEqual(app.json('d'), runtime);
});

test('failed rollback protects the old raw document for export', async () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData'), runtime = app.json('d');
  const incoming = fixture(); incoming.theme = 'dark';
  app.import(incoming); app.faults.writeAfter = 1;
  app.run('page=function(){throw Error("render failure")}');
  app.confirm();
  assert.deepEqual(app.json('d'), runtime);
  assert.equal(app.run('storageBlocked'), true);
  app.elements.get('exportRawData').click();
  assert.equal(await app.downloads.at(-1).blob.text(), before);
  const writes = app.writes.length;
  app.run('save();setTimerState(null)');
  assert.equal(app.writes.length, writes);
});

test('legacy record IDs cannot collide with IDs already present', () => {
  const data = fixture();
  data.completed.push({ ...data.completed[0], recordId: 'legacy-record-1', completionId: 'legacy-record-1' });
  const app = boot(stored(data)); started(app);
  const records = app.json('d.completed');
  assert.equal(new Set(records.map(c => c.completionId)).size, 2);
  assert.equal(records[1].completionId, 'legacy-record-1');
});

test('file read failures do not offer confirmation or change data', () => {
  const app = boot(stored(fixture())); started(app);
  const before = app.values.get('whatToDoData');
  for (const file of [{ error: true }, { throw: true }]) {
    app.elements.get('file').files = [file]; app.elements.get('file').dispatch('change');
    assert.equal(app.elements.get('confirmLayer').classList.contains('hide'), true);
    assert.equal(app.values.get('whatToDoData'), before);
    assert.equal(app.run('pendingImport'), null);
  }
});

test('a delayed previous file cannot replace the most recently chosen backup', () => {
  const app = boot(stored(fixture())); started(app);
  const old = fixture(); old.theme = 'dark';
  app.elements.get('file').files = [{ text: JSON.stringify(old), defer: true }];
  app.elements.get('file').dispatch('change');
  const latest = fixture(); latest.preferences.time = 30;
  app.import(latest); app.readers[0](); app.confirm();
  assert.equal(app.json('d.theme'), 'light');
  assert.equal(app.json('d.preferences.time'), 30);
});
