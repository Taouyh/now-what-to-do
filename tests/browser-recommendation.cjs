const assert = require('node:assert/strict');

module.exports = async function recommendationSuite(scenario, fixture) {
  let count = 0;
  const dataWithTasks = (specs, preferences = {}) => {
    const data = fixture(); data.completed = [];
    data.preferences = { time: 30, env: 'quiet', computerReady: false, ...preferences };
    data.tasks = specs.map((spec, i) => ({ ...data.tasks[0], id: 'task-' + i, name: '中文任务 ' + i, env: 'quiet', minutes: 10, ...spec }));
    return data;
  };
  const check = async (name, data, fn) => {
    await scenario(name, { whatToDoData: JSON.stringify(data) }, {}, fn); count++;
  };

  const bounds = dataWithTasks([{ minutes: 10 }, { minutes: 30 }, { minutes: 60 }, { env: 'noisy' }, { computer: true }, { enabled: false }]);
  await check('30 minute budget includes short/equal tasks and keeps every hard filter', bounds, async run => {
    const seen = await run("const result=[];for(let value of [0,0.2,0.5,0.8,0.999999]){Math.random=()=>value;$('random').click();result.push({id:cur.id,eligible:ok(cur),label:$('rec').querySelector('h2').textContent})}return result");
    assert.deepEqual([...new Set(seen.map(x => x.id))].sort(), ['task-0', 'task-1']);
    assert.ok(seen.every(x => x.eligible && x.label === '中文任务 ' + x.id.slice(-1)));
    assert.equal(await run("return __rawGet('whatToDoData')"), JSON.stringify(bounds));
    assert.equal(await run('return __writes.length'), 0);
  });

  await check('time changes replace the card and reject its detached start button', dataWithTasks([{ minutes: 30 }]), async run => {
    const result = await run("const stale=$('start');document.querySelector('#times [data-v=\"5\"]').click();stale.click();return [cur,$('rec').textContent,$('rec').querySelector('#start'),__rawGet('activeTimer')]");
    assert.equal(result[0], null); assert.match(result[1], /没有符合当前条件的任务/); assert.equal(result[2], null); assert.equal(result[3], null);
    assert.equal(await run("document.querySelector('#times [data-v=\"30\"]').click();return cur.id"), 'task-0');
    assert.equal(await run('return d.tasks[0].minutes'), 30);
  });

  const environments = dataWithTasks([{ env: 'quiet' }, { env: 'noisy' }, { env: 'class' }, { env: 'class', computer: true }], { computerReady: true });
  await check('environment changes remain exact, including class computer restrictions', environments, async run => {
    for (const [env, id] of [['noisy', 'task-1'], ['class', 'task-2'], ['quiet', 'task-0']]) {
      assert.deepEqual(await run(`document.querySelector('#envs [data-v=${env}]').click();return [cur.id,ok(cur),$('rec').querySelector('h2').textContent]`), [id, true, '中文任务 ' + id.slice(-1)]);
    }
  });

  await check('computer toggle recomputes both empty and populated states', dataWithTasks([{ computer: true }]), async run => {
    assert.equal(await run('return cur'), null);
    assert.equal(await run("$('computerReady').click();return cur.id"), 'task-0');
    assert.equal(await run("$('computerReady').click();return cur"), null);
    assert.equal(await run("return $('rec').querySelector('#start')"), null);
    assert.equal(await run("return __rawGet('activeTimer')"), null);
  });

  await check('change recommendation never escapes the eligible pool', bounds, async run => {
    const ids = await run("const seen=[];for(let i=0;i<40;i++){$('again').click();if(!ok(cur))throw Error('ineligible recommendation');seen.push(cur.id)}return seen");
    assert.ok(ids.every(id => ['task-0', 'task-1'].includes(id)));
    assert.equal(await run('return d.completed.length'), 0);
    assert.deepEqual(await run('return d.tasks.map(t=>t.minutes)'), bounds.tasks.map(t => t.minutes));
  });

  await check('recent-completion fallback preserves all hard constraints', dataWithTasks([{ minutes: 10 }, { minutes: 60 }, { env: 'noisy' }, { computer: true }]), async run => {
    assert.equal(await run("d.completed.push({taskId:'task-0',completedAt:new Date().toISOString(),minutes:1});random();return cur.id"), 'task-0');
    assert.equal(await run('return ok(cur)'), true);
  });

  await check('no eligible task stays empty and offers browsing', dataWithTasks([{ minutes: 60 }, { env: 'noisy' }, { computer: true }]), async run => {
    assert.deepEqual(await run("$('random').click();return [cur,!!$('rec').querySelector('#openTasks'),!!$('rec').querySelector('#start')]"), [null, true, false]);
    assert.equal(await run("$('openTasks').click();return document.querySelector('.page.active').id"), 'tasks');
    assert.equal(await run('return d.completed.length'), 0);
  });

  await check('manual library selection retains its original behavior', dataWithTasks([{ minutes: 60, env: 'noisy', computer: true }], { time: 5 }), async run => {
    assert.equal(await run('return cur'), null);
    assert.deepEqual(await run("page('tasks');$('taskList').querySelector('[data-task-action=start]').click();return [timerState().taskId,timerState().plannedDurationMs,$('timerName').textContent]"), ['task-0', 3600000, '中文任务 0']);
    await run("giveUpTimer();$('confirmAccept').click()");
  });

  await check('completion clears the old card and returning home avoids stale history', dataWithTasks([{}, {}]), async run => {
    await run("Math.random=()=>0;page('home');$('start').click();$('earlyTimer').click();$('confirmAccept').click();$('confirmAccept').click();");
    assert.deepEqual(await run("return [document.querySelector('.page.active').id,cur,$('rec').children.length,d.completed.length]"), ['today', null, 0, 1]);
    assert.equal(await run("document.querySelector('[data-page=home]').click();return cur.id"), 'task-1');
    assert.equal(await run("for(let i=0;i<10;i++){$('again').click();page('home')}return d.completed.length"), 1);
    assert.equal(await run("return __rawGet('activeTimer')"), null);
  });

  await check('failed preference save retains a valid old card and preferences', dataWithTasks([{ minutes: 30 }]), async run => {
    const before = await run("return __rawGet('whatToDoData')");
    assert.deepEqual(await run("__faults.write=true;document.querySelector('#times [data-v=\"5\"]').click();return [time,cur.id,ok(cur),document.querySelector('#times .on').dataset.v]"), [30, 'task-0', true, '30']);
    assert.equal(await run("return __rawGet('whatToDoData')"), before);
  });

  const special = '<img data-recommendation-probe src="/__recommendation_probe__" onerror="window.__recommendationExecuted=1">中文 < > & \' "';
  await check('special text remains inert after preference changes and recommendations', dataWithTasks([{ name: special, description: special + '\n第二行' }], { time: 10 }), async run => {
    assert.deepEqual(await run("document.querySelector('#times [data-v=\"30\"]').click();$('again').click();await new Promise(resolve=>setTimeout(resolve,80));return [$('rec').querySelector('h2').textContent,$('rec').querySelector('p.muted').textContent,document.querySelectorAll('[data-recommendation-probe]').length,window.__recommendationExecuted||0]"), [special, special + '\n第二行', 0, 0]);
  });
  console.log(count + ' recommendation Chrome scenarios passed.');
};
