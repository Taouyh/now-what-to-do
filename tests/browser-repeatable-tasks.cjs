const assert = require('node:assert/strict');

module.exports = async (scenario, fixture) => {
  let count = 0;
  function dataSet(taskCount = 2) {
    const data = fixture(); data.completed = [];
    data.preferences = { time: 30, env: 'quiet', computerReady: false };
    data.tasks = Array.from({ length: taskCount }, (_, i) => ({ ...data.tasks[0], id: 'task-' + i, name: '重复学习 ' + i, env: 'quiet' }));
    return data;
  }
  const check = async (name, data, fn) => {
    await scenario(name, { whatToDoData: JSON.stringify(data) }, {}, fn, { timezone: 'Asia/Shanghai', chooseConditions:true }); count++;
  };
  const freeze = run => run("const RealDate=Date;const fixed=RealDate.parse('2026-10-20T00:30:00+08:00');Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixed]))}static now(){return fixed}}");
  const record = (id, taskId, date, extra = {}) => ({ recordId: id, completionId: id, taskId, completedAt: date, minutes: 5, ...extra });

  await check('condition changes clear invalid cards and preserve valid cards', dataSet(), async run => {
    const id = await run('return cur.id');
    assert.equal(await run("document.querySelector('#times [data-v=\"60\"]').click();return cur.id"), id);
    const invalid = await run("const stale=$('start');document.querySelector('#envs [data-v=class]').click();stale.click();return {task:cur,text:$('rec').textContent,start:$('rec').querySelector('#start'),timer:__rawGet('activeTimer')}");
    assert.equal(invalid.task, null); assert.match(invalid.text, /没有符合当前条件的任务/); assert.equal(invalid.start, null); assert.equal(invalid.timer, null);
    assert.ok(await run("document.querySelector('#envs [data-v=quiet]').click();return !!$('rec').querySelector('#start')"));
    await run("document.querySelector('#times [data-v=\"5\"]').click()");
    assert.equal(await run('return cur'), null);
  });

  await check('both repeated recommendation clicks and replacement buttons change the displayed task', dataSet(), async run => {
    const before = await run("return __rawGet('whatToDoData')");
    const seen = await run("Math.random=()=>0;const result=[];for(let i=0;i<12;i++){const before=cur.id;$(i%2?'again':'random').click();result.push({before,after:cur.id,label:$('rec').querySelector('h2').textContent,valid:ok(cur)})}return result");
    assert.ok(seen.every(x => x.before !== x.after && x.valid && x.label === '重复学习 ' + x.after.slice(-1)));
    assert.equal(await run("return __rawGet('whatToDoData')"), before);
    assert.equal(await run('return d.completed.length'), 0);
  });

  const weighted = dataSet(); weighted.completed = [record('recent', 'task-1', new Date().toISOString())];
  await check('replacement can choose a recently practiced repeatable task', weighted, async run => {
    assert.equal(await run('return cur.id'), 'task-0');
    assert.equal(await run("$('again').click();return cur.id"), 'task-1');
    assert.equal(await run("$('random').click();return cur.id"), 'task-0');
  });

  await check('single candidate gives an explicit hint and empty candidates remove start controls', dataSet(1), async run => {
    for (let i = 0; i < 3; i++) {
      assert.deepEqual(await run("$('random').click();$('again').click();return [cur.id,$('recommendationHint').textContent]"), ['task-0', '当前条件下只有这一项符合要求的任务']);
    }
    assert.equal(await run("document.querySelector('#times [data-v=\"5\"]').click();return cur"), null);
    assert.equal(await run("return !!$('rec').querySelector('#start')"), false);
    assert.equal(await run("return __rawGet('activeTimer')"), null);
  });

  await check('changing conditions leaves active and paused timer storage untouched', dataSet(), async run => {
    await run("$('start').click()");
    const active = await run("return __rawGet('activeTimer')");
    await run("document.querySelector('#envs [data-v=class]').click();$('random').click()");
    assert.equal(await run("return __rawGet('activeTimer')"), active);
    await run("$('pauseTimer').click()");
    const paused = await run("return __rawGet('activeTimer')");
    await run("document.querySelector('#times [data-v=\"5\"]').click();$('computerReady').click()");
    assert.equal(await run("return __rawGet('activeTimer')"), paused);
    assert.equal(await run('return d.completed.length'), 0);
  });

  const boundary = dataSet(); boundary.completed = [
    record('yesterday', 'task-0', '2026-10-19T15:59:59Z', { taskName: '昨日记录', goalId: 'mine', minutes: 20 }),
    record('today-utc', 'task-0', '2026-10-19T16:00:00Z', { taskName: '今天 UTC', goalId: 'mine', actualDurationMs: 120000 }),
    record('today-offset', 'task-1', '2026-10-20T00:01:00+08:00', { taskName: '今天偏移', minutes: 3 }),
    record('tomorrow', 'task-1', '2026-10-20T16:00:00Z', { taskName: '明日记录', minutes: 30 }),
  ];
  await check('today uses local dates at the UTC boundary', boundary, async run => {
    await freeze(run);
    assert.deepEqual(await run("page('today');return [...$('todayBox').querySelectorAll('h3')].map(h=>h.textContent)"), ['今天 UTC', '今天偏移']);
    assert.match(await run("return $('todayBox').textContent"), /5 分钟/);
    assert.equal(await run("return __rawGet('whatToDoData')"), JSON.stringify(boundary));
  });

  const history = dataSet(); history.tasks[0].completed = true; history.tasks[0].done = true;
  history.completed = [record('historic', 'task-0', '2026-01-01T01:00:00Z', { note: '历史原文不得丢失' })];
  await check('task library has no permanent-completion filter and old fields survive real reloads', history, async (run, _import, { reload }) => {
    const raw = JSON.stringify(history);
    assert.equal(await run("page('tasks');return $('fd')"), null);
    assert.equal(await run("return $('taskList').querySelectorAll('article').length"), 2);
    for (let i = 0; i < 2; i++) {
      await reload();
      assert.equal(await run("return __rawGet('whatToDoData')"), raw);
      assert.deepEqual(await run('return d.completed'), history.completed);
      assert.deepEqual(await run('return [d.tasks[0].completed,d.tasks[0].done,__writes.length]'), [true, true, 0]);
    }
  });

  await check('each repeat execution creates one record and refresh creates none', dataSet(1), async (run, _import, { reload }) => {
    for (let i = 0; i < 2; i++) {
      await run("page('tasks');$('taskList').querySelector('[data-task-action=start]').click();$('earlyTimer').click();$('confirmAccept').click();$('confirmAccept').click()");
      assert.equal(await run('return d.completed.length'), i + 1);
      await reload();
      assert.equal(await run('return d.completed.length'), i + 1);
    }
    const records = await run('return d.completed');
    assert.equal(new Set(records.map(c => c.completionId)).size, 2);
    assert.equal(records[0].taskId, records[1].taskId);
    assert.ok(records.every(c => Number.isFinite(c.startedAt) && Number.isFinite(c.endedAt) && c.endedAt >= c.startedAt));
    assert.equal(await run('return d.tasks.length'), 1);
    assert.equal(await run("return __rawGet('activeTimer')"), null);
  });

  await check('restoring and extending a persisted timer creates no completion records', dataSet(1), async (run, _import, { reload }) => {
    await run("$('start').click();let state=timerState();state.lastStarted=Date.now()-state.durationMs-1000;setTimerState(state)");
    await reload();
    assert.equal(await run('return d.completed.length'), 0);
    assert.ok(await run('return timerState().extensionDurationMs>0'));
    assert.equal(await run("return JSON.parse(__rawGet('whatToDoData')).completed.length"), 0);
  });

  const hostile = dataSet(1); hostile.tasks[0].name = '<img data-session-probe src="missing" onerror="window.__sessionProbe=1">中文 & \' "';
  hostile.goals[0].name = hostile.tasks[0].name;
  hostile.completed = [record('safe-text', 'task-0', '2026-10-19T16:00:00Z', { taskName: hostile.tasks[0].name, goalName: hostile.goals[0].name })];
  await check('updated recommendation and history keep user text inert', hostile, async run => {
    await freeze(run); await run("$('random').click();$('again').click();page('today');await new Promise(resolve=>setTimeout(resolve,80))");
    assert.deepEqual(await run("return [document.querySelectorAll('[data-session-probe]').length,window.__sessionProbe||0]"), [0, 0]);
    assert.equal(await run("return $('todayBox').querySelector('h3').textContent"), hostile.tasks[0].name);
    assert.equal(await run("return __rawGet('whatToDoData')"), JSON.stringify(hostile));
  });
  console.log(count + ' repeatable-task/browser-state scenarios passed.');
};
