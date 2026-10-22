const assert = require('node:assert/strict');

module.exports = async (scenario, fixture) => {
  let count = 0;
  const check = async (name, initial, fn, options={}) => { await scenario(name, initial, {}, fn, options); count++; };
  const submit = "$('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))";

  await check('fresh library has guidance and no goal controls, including old goal bookmarks', {}, async (run, _import, { reload }) => {
    assert.deepEqual(await run("return [d.tasks.length,d.goals.length,d.completed.length,firstUse]"), [0,0,0,true]);
    assert.deepEqual(await run("return [$('goals'),$('goal'),$('fg'),$('newGoal'),$('goalEditor'),document.querySelector('[data-page=goals]')]"), Array(6).fill(null));
    assert.match(await run("return $('rec').textContent"), /添加一件你想经常做的事/);
    assert.deepEqual(await run("$('addFirstTask').click();return [$('name').value,$('mins').value,$('environment').value,$('computer').checked]"), ['', '10', 'quiet', false]);
    assert.ok(await run("return $('name').placeholder.includes('例如')"));
    await run("$('close').click();page('goals')");
    assert.equal(await run("return document.querySelector('.page.active').id"), 'home');
    const raw = await run("return __rawGet('whatToDoData')");
    await reload();
    assert.equal(await run("return __rawGet('whatToDoData')"), raw);
    assert.equal(await run('return firstUse'), false);
    assert.equal(await run('return __writes.length'), 0);
    assert.ok(await run("page('tasks');const b=$('addLibraryTask').getBoundingClientRect();return b.width>0&&b.height>0&&document.documentElement.scrollWidth<=innerWidth"));
  });

  await check('create, backup, cancel deletion, delete all and reload without reseeding', {}, async (run, _import, { reload }) => {
    await run(`$('addFirstTask').click();$('name').value='每天读书 < > & 中文';${submit}`);
    const task = await run('return d.tasks[0]');
    assert.equal(task.goalId, undefined);
    await reload(); assert.deepEqual(await run('return d.tasks'), [task]);
    const backup = JSON.parse(await run("$('export').click();return await __downloads.at(-1).blob.text()"));
    assert.deepEqual(backup.tasks, [task]);
    await run("page('tasks');$('taskList').querySelector('[data-task-action=delete]').click();$('confirmCancel').click()");
    assert.equal(await run('return d.tasks.length'), 1);
    await run("$('taskList').querySelector('[data-task-action=delete]').click();$('confirmAccept').click()");
    const raw = await run("return __rawGet('whatToDoData')");
    for (let i=0;i<2;i++) {
      await reload(); assert.deepEqual(await run('return d.tasks'), []);
      assert.equal(await run("return __rawGet('whatToDoData')"), raw);
      assert.equal(await run('return __writes.length'), 0);
    }
  });

  await check('legacy import preserves goals, records and category fields and orphan tasks remain usable', {}, async (run, importData, { reload, chooseConditions }) => {
    const old = fixture(); old.version=1; delete old.defaultTasksSeeded;
    old.tasks[0].goalId='missing-goal'; old.tasks[0].category={tag:'旧分类'};
    await importData(old); assert.equal(await run('return d.tasks.length'), 0);
    await run("$('confirmAccept').click()");
    assert.deepEqual(await run('return d.tasks'), old.tasks);
    assert.deepEqual(await run('return d.goals'), old.goals);
    const records = await run('return d.completed');
    assert.equal(records[0].startedAt, undefined); assert.equal(records[0].endedAt, undefined);
    await run("page('tasks');$('taskList').querySelector('[data-task-action=edit]').click();$('name').value='编辑后的旧活动'");
    await run(submit);
    assert.deepEqual(await run('return [d.tasks[0].goalId,d.tasks[0].category]'), ['missing-goal',old.tasks[0].category]);
    await reload();
    await chooseConditions();assert.equal(await run("page('home');return cur.id"), old.tasks[0].id);
    await run("$('start').click();$('pauseTimer').click()"); assert.equal(await run('return timerState().paused'), true);
    await run("$('pauseTimer').click();$('giveUpTimer').click();$('confirmAccept').click()");
    assert.deepEqual(await run('return d.completed'), records);
    const backup = JSON.parse(await run("$('export').click();return await __downloads.at(-1).blob.text()"));
    assert.deepEqual(backup.goals,old.goals); assert.equal(backup.tasks.length,1); assert.deepEqual(backup.completed,records);
    const empty = { ...old, tasks:[] };
    await importData(empty); await run("$('confirmAccept').click()"); await reload();
    assert.deepEqual(await run('return d.tasks'), []); assert.deepEqual(await run('return d.goals'),old.goals);
    assert.equal(await run('return cur'), null);
  });

  const matching = fixture(); matching.goals=[]; delete matching.tasks[0].goalId;
  await check('invalid conditions clear the card and cannot start a stale goal-free task', {whatToDoData:JSON.stringify(matching)}, async run => {
    assert.deepEqual(await run("const old=$('start');document.querySelector('#envs [data-v=quiet]').click();old.click();return [cur,!!$('rec').querySelector('#start'),__rawGet('activeTimer')]"), [null,false,null]);
    assert.match(await run("return $('rec').textContent"), /没有符合当前条件的任务/);
    assert.deepEqual(await run('return d.completed'), matching.completed.map((c,i)=>({...c,recordId:'legacy-record-'+(i+1),completionId:'legacy-record-'+(i+1)})));
  }, {chooseConditions:true});

  const repeat = fixture(); repeat.goals=[]; repeat.completed=[]; delete repeat.tasks[0].goalId;
  await check('goal-free sessions pause, restore, extend and complete once while keeping the activity', {whatToDoData:JSON.stringify(repeat)}, async (run, importData, { reload }) => {
    await run("$('start').click();$('pauseTimer').click()");
    const paused = await run('return timerState()');
    await reload(); assert.equal(await run('return timerState().paused'), true);
    assert.equal(await run('return timerState().elapsed'), paused.elapsed);
    await run("$('pauseTimer').click();let x=timerState();x.lastStarted=Date.now()-x.durationMs-1000;setTimerState(x);advanceTimerIfNeeded(timerState())");
    assert.ok(await run('return timerState().extensionDurationMs>0'));
    assert.equal(await run('return d.completed.length'),0);
    await run("$('earlyTimer').click();$('confirmAccept').click();$('confirmAccept').click()");
    assert.equal(await run('return d.completed.length'),1);
    assert.deepEqual(await run('return d.tasks'),repeat.tasks);
    assert.match(await run("return $('todayBox').textContent"),/今日完成 · 1 次执行/);
    const backup = JSON.parse(await run("$('export').click();return await __downloads.at(-1).blob.text()"));
    await importData(backup);await run("$('confirmAccept').click()");
    assert.equal(await run('return cur.id'),repeat.tasks[0].id);
    await reload();assert.equal(await run('return d.completed.length'),1);
    assert.deepEqual(await run('return d.tasks'),repeat.tasks);
  }, {chooseConditions:true});

  await check('file and HTTP entries keep separate storage in the same isolated browser context', {}, async (run, _import, { navigateEntry }) => {
    await navigateEntry('file');
    await run(`newTask();$('name').value='仅在本地文件保存';${submit}`);
    const fileRaw=await run("return __rawGet('whatToDoData')");
    await navigateEntry('http');
    assert.equal(await run('return d.tasks.length'),0);
    await run(`newTask();$('name').value='仅在本地网址保存';${submit}`);
    await navigateEntry('file');
    assert.equal(await run("return __rawGet('whatToDoData')"),fileRaw);
    assert.equal(await run('return d.tasks[0].name'),'仅在本地文件保存');
    await navigateEntry('http');assert.equal(await run('return d.tasks[0].name'),'仅在本地网址保存');
  });
  console.log(count+' personal-activity browser scenarios passed.');
};
