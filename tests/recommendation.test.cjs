const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');

function dataWithTasks(specs, preferences = {}) {
  const data = fixture(); data.completed = [];
  data.preferences = { time: 30, env: 'quiet', computerReady: false, ...preferences };
  data.tasks = specs.map((spec, i) => ({ ...data.tasks[0], id: 'task-' + i, name: '中文任务 ' + i, env: 'quiet', minutes: 10, ...spec }));
  return data;
}
function start(data, faults) {
  const app = boot({ whatToDoData: JSON.stringify(data) }, faults); assert.ifError(app.error); app.chooseConditions(); return app;
}
function chooseTime(app, value) { app.times.find(b => b.dataset.v === String(value)).click(); }
function chooseEnv(app, value) { app.envs.find(b => b.dataset.v === value).click(); }

for (const [name, minutes, eligible] of [['shorter', 10, true], ['equal', 30, true], ['longer', 60, false]]) {
  test('30 minute budget: ' + name + ' task', () => {
    const app = start(dataWithTasks([{ minutes }]));
    assert.equal(app.run('cur?.id||null'), eligible ? 'task-0' : null);
    assert.equal(app.run('ok(d.tasks[0])'), eligible);
  });
}

test('environments match exactly, and class forbids computer tasks', () => {
  for (const env of ['quiet', 'noisy', 'class']) {
    const app = start(dataWithTasks([{ env: 'quiet' }, { env: 'noisy' }, { env: 'class' }, { env: 'class', computer: true }], { env, computerReady: true }));
    assert.deepEqual(app.json('d.tasks.filter(ok).map(t=>t.id)'), [env === 'quiet' ? 'task-0' : env === 'noisy' ? 'task-1' : 'task-2']);
  }
});

test('computer availability and enabled state remain hard restrictions', () => {
  const app = start(dataWithTasks([{ computer: true }, { enabled: false }]));
  assert.equal(app.run('cur'), null);
  app.elements.get('computerReady').checked = true; app.elements.get('computerReady').dispatch('change');
  assert.equal(app.run('cur?.id'), 'task-0');
});

test('no eligible task produces a visible empty state without starting a timer', () => {
  const app = start(dataWithTasks([{ minutes: 60 }, { env: 'noisy' }, { computer: true }]));
  assert.equal(app.run('cur'), null);
  assert.equal(app.elements.get('rec').classList.contains('hide'), false);
  assert.match(app.elements.get('rec').children[0].textContent, /没有符合当前条件的任务/);
  assert.equal(app.values.has('activeTimer'), false);
});

test('both short and equal tasks participate; changing recommendation stays within hard limits', () => {
  const data = dataWithTasks([{ minutes: 10 }, { minutes: 30 }, { minutes: 60 }, { env: 'noisy' }, { computer: true }, { enabled: false }]);
  const app = start(data), before = app.values.get('whatToDoData'), ids = new Set();
  for (const value of [0, 0.25, 0.5, 0.75, 0.999999]) {
    app.run('Math.random=()=>'+value+';random()');
    assert.equal(app.run('ok(cur)'), true); ids.add(app.run('cur.id'));
  }
  assert.deepEqual([...ids].sort(), ['task-0', 'task-1']);
  assert.equal(app.values.get('whatToDoData'), before);
  assert.deepEqual(app.json('d.tasks'), data.tasks);
  assert.equal(app.json('d.completed').length, 0);
});

test('reducing time invalidates the old task immediately', () => {
  const app = start(dataWithTasks([{ minutes: 30 }]));
  const staleStart = app.elements.get('start');
  chooseTime(app, 5);
  assert.equal(app.run('cur'), null);
  staleStart.click();
  assert.equal(app.values.has('activeTimer'), false);
});

test('increasing time recomputes an empty recommendation', () => {
  const app = start(dataWithTasks([{ minutes: 30 }], { time: 10 }));
  assert.equal(app.run('cur'), null);
  chooseTime(app, 30);
  assert.equal(app.run('cur?.id'), 'task-0');
});

test('changing environment recomputes the recommendation', () => {
  const app = start(dataWithTasks([{ env: 'quiet' }, { env: 'noisy' }]));
  chooseEnv(app, 'noisy');
  assert.equal(app.run('cur?.id'), 'task-1');
  assert.equal(app.run('ok(cur)'), true);
});

test('turning computer availability off invalidates a computer task', () => {
  const app = start(dataWithTasks([{ computer: true }], { computerReady: true }));
  const staleStart = app.elements.get('start');
  app.elements.get('computerReady').checked = false; app.elements.get('computerReady').dispatch('change');
  assert.equal(app.run('cur'), null);
  staleStart.click();
  assert.equal(app.values.has('activeTimer'), false);
});

test('start recommendation rechecks task existence and eligibility', () => {
  for (const mutation of ['d.tasks[0].enabled=false', 'd.tasks[0].minutes=60', 'd.tasks[0].env="noisy"', 'd.tasks[0].computer=true', 'd.tasks=[]']) {
    const app = start(dataWithTasks([{}]));
    const button = app.elements.get('start'); app.run(mutation); button.click();
    assert.equal(app.values.has('activeTimer'), false, mutation);
    assert.equal(app.run('cur'), null, mutation);
  }
});

test('a detached start button cannot start a different recommendation', () => {
  const app = start(dataWithTasks([{}, {}]));
  app.run('Math.random=()=>0;page("home")');
  const oldStart = app.elements.get('start');
  app.run('Math.random=()=>0.999999;random()');
  assert.equal(app.run('cur.id'), 'task-1');
  oldStart.click();
  assert.equal(app.values.has('activeTimer'), false);
});

test('failed preference save retains old preferences and a valid recommendation', () => {
  const app = start(dataWithTasks([{ minutes: 30 }]));
  const before = app.values.get('whatToDoData'); app.faults.write = true;
  chooseTime(app, 5);
  assert.equal(app.run('time'), 30);
  assert.equal(app.run('cur?.id'), 'task-0');
  assert.equal(app.run('ok(cur)'), true);
  assert.equal(app.values.get('whatToDoData'), before);
});

test('recent-completion fallback never relaxes hard restrictions', () => {
  const data = dataWithTasks([{ minutes: 10 }, { minutes: 60 }, { env: 'noisy' }, { computer: true }]);
  data.completed = [{ taskId: 'task-0', completedAt: new Date().toISOString(), minutes: 1 }];
  const app = start(data);
  assert.equal(app.run('cur?.id'), 'task-0');
  assert.equal(app.run('ok(cur)'), true);
});

test('returning home after completion refreshes recommendation without duplicate history', () => {
  const app = start(dataWithTasks([{}, {}]));
  app.run('Math.random=()=>0;page("home")'); app.elements.get('start').click();
  app.run('finishTimer();page("home")');
  assert.equal(app.run('cur?.id'), 'task-1');
  for (let i=0;i<4;i++) app.run('random();page("home");finishTimer()');
  assert.equal(app.json('d.completed').length, 1);
  assert.equal(app.values.has('activeTimer'), false);
});

test('manual task selection may still start tasks outside recommendation filters', () => {
  const app = start(dataWithTasks([{ minutes: 60, env: 'noisy', computer: true }]));
  assert.equal(app.run('cur'), null);
  app.run('run(d.tasks[0])');
  assert.equal(app.json('timerState().taskId'), 'task-0');
  assert.equal(app.json('timerState().durationMs'), 3600000);
});
