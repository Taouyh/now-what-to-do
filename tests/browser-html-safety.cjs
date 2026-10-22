const assert = require('node:assert/strict');

// Harmless execution probes only: no remote URL, cookie access or data exfiltration.
const image = '<img data-user-html src="/__html_safety_probe__" onerror="window.__htmlSafetyExecuted=(window.__htmlSafetyExecuted||0)+1">';
const svg = '<svg data-user-html onload="window.__htmlSafetyExecuted=(window.__htmlSafetyExecuted||0)+1"></svg>';
const special = '中文 English < > & &amp; &copy; "双引号" \'单引号\'';
const description = special + '\n第二行：保留换行 <b data-user-html>普通文本</b>';
const submit = id => `$(${JSON.stringify(id)}).dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));`;

module.exports = async function htmlSafetySuite(scenario, fixture) {
  const failures = [];
  let count = 0;
  const check = async (name, data, fn) => {
    try {
      await scenario(name, { whatToDoData: JSON.stringify(data) }, {}, fn, {chooseConditions:true});
      count++;
    } catch (error) { failures.push(error); console.error('FAIL ' + name + ': ' + error.message.slice(0, 180)); }
  };
  const noInjection = async run => {
    const actual = await run("await new Promise(resolve=>setTimeout(resolve,80));return {executed:window.__htmlSafetyExecuted||0,elements:document.querySelectorAll('[data-user-html]').length}");
    assert.deepEqual(actual, { executed: 0, elements: 0 });
  };

  await check('normal Chinese names and descriptions', fixture(), async run => {
    assert.deepEqual(await run("return [$('rec').querySelector('h2').textContent,$('rec').querySelector('p.muted').textContent]"), ['个人任务', '保留']);
    assert.deepEqual(await run("page('tasks');return [$('taskList').querySelector('h3').textContent,$('taskList').querySelector('p').textContent]"), ['个人任务', '保留']);
  });

  const characters = fixture(); characters.tasks[0].name = special; characters.tasks[0].description = description;
  characters.goals[0].name = special; characters.goals[0].description = description;
  await check('special characters, literal entities and multiline text', characters, async run => {
    assert.deepEqual(await run("return [$('rec').querySelector('h2').textContent,$('rec').querySelector('p.muted').textContent]"), [special, description]);
    assert.equal(await run("return getComputedStyle($('rec').querySelector('p.muted')).whiteSpace"), 'pre-wrap');
    assert.deepEqual(await run("page('tasks');return [$('taskList').querySelector('h3').textContent,$('taskList').querySelector('p').textContent]"), [special, description]);
    await noInjection(run);
  });

  const taskAttack = fixture(); taskAttack.tasks[0].name = image; taskAttack.tasks[0].description = svg;
  await check('task HTML and event handlers are inert on recommendation and library', taskAttack, async run => {
    await run("page('tasks');page('home');");
    await noInjection(run);
    assert.deepEqual(await run("return [$('rec').querySelector('h2').textContent,$('rec').querySelector('p.muted').textContent]"), [image, svg]);
    assert.equal(await run("page('tasks');return $('taskList').querySelector('h3').textContent"), image);
    assert.equal(await run("return __rawGet('whatToDoData')"), JSON.stringify(taskAttack));
  });

  const optionId = 'id\'"<>&' + image;
  await check('legacy goal metadata is preserved without management or category controls', fixture(), async (run, importData) => {
    const legacy=fixture();legacy.goals[0].name=image;legacy.goals[0].description=svg;legacy.goals[0].icon=image;legacy.goals[0].id=optionId;legacy.tasks[0].goalId=optionId;
    await importData(legacy);await run("$('confirmAccept').click();page('tasks');newTask();");
    assert.deepEqual(await run("return [$('goal'),$('fg'),$('goals'),$('goalEditor')]"),[null,null,null,null]);
    assert.deepEqual(await run("return d.goals"),legacy.goals);
    await noInjection(run);
  });

  const taskIdAttack = fixture(); taskIdAttack.tasks[0].id = optionId;
  await check('imported task IDs keep filtering and delegated controls working', taskIdAttack, async run => {
    assert.equal(await run("page('tasks');$('ft').value='10';$('ft').dispatchEvent(new Event('change'));return $('ft').value"), '10');
    assert.equal(await run("$('taskList').querySelector('[data-task-action=edit]').click();return $('tid').value"), optionId);
    await run(`$('name').value=${JSON.stringify(special)};${submit('form')}`);
    assert.equal(await run("$('taskList').querySelector('[data-task-action=start]').click();return timerState().taskId"), optionId);
    await run("giveUpTimer();$('confirmAccept').click();page('tasks');$('taskList').querySelector('[data-task-action=delete]').click();$('confirmAccept').click();");
    assert.equal(await run('return d.tasks.length'), 0);
    await noInjection(run);
  });

  const history = fixture(); history.completed = [{ ...history.completed[0], completedAt: new Date().toISOString(), taskName: image, goalName: svg }];
  await check('today record snapshots are plain text', history, async run => {
    assert.deepEqual(await run("page('today');return [$('todayBox').querySelector('h3').textContent,d.completed[0].goalName||gn(d.completed[0].goalId)?.name]"), [image, svg]);
    await noInjection(run);
  });

  const fallback = fixture(); fallback.tasks[0].name = image; fallback.goals[0].name = svg;
  fallback.completed = [{ taskId: fallback.tasks[0].id, goalId: fallback.goals[0].id, date: new Date().toISOString(), minutes: 5 }];
  await check('legacy record name fallbacks are plain text', fallback, async run => {
    assert.equal(await run("page('today');return $('todayBox').querySelector('h3').textContent"), image);
    assert.equal(await run("return d.goals[0].name"), svg);
    await noInjection(run);
  });

  await check('JSON import preserves raw strings and renders every page safely', fixture(), async (run, importData) => {
    const incoming = fixture(); incoming.goals[0] = { ...incoming.goals[0], id: optionId, name: special, description: svg, icon: image };
    incoming.tasks[0] = { ...incoming.tasks[0], goalId: optionId, name: image, description };
    incoming.completed[0] = { ...incoming.completed[0], completedAt: new Date().toISOString(), taskName: image, goalName: svg };
    await importData(incoming); await run("$('confirmAccept').click();page('tasks');page('today');newTask();");
    await noInjection(run);
    assert.equal(await run("return $('goal')"), null);
    assert.deepEqual(await run("const saved=JSON.parse(__rawGet('whatToDoData'));return [saved.version,saved.tasks[0].name,saved.tasks[0].description,saved.goals[0].id,saved.goals[0].icon,saved.completed[0].taskName]"), [2, image, description, optionId, image, image]);
  });

  await check('task form create, edit, recommend, pause, resume, finish and delete', fixture(), async run => {
    await run(`newTask('mine');$('name').value=${JSON.stringify(special)};$('desc').value=${JSON.stringify(description)};$('mins').value='5';$('environment').value='noisy';${submit('form')}`);
    const id = await run('return d.tasks.at(-1).id');
    const position = await run(`return d.tasks.findIndex(t=>t.id===${JSON.stringify(id)})`);
    assert.equal(await run(`return $('taskList').querySelectorAll('h3')[${position}].textContent`), special);
    await run(`$('taskList').querySelectorAll('article')[${position}].querySelector('[data-task-action="edit"]').click();$('name').value=${JSON.stringify(image)};${submit('form')}`);
    assert.equal(await run(`return d.tasks.find(t=>t.id===${JSON.stringify(id)}).name`), image);
    // Choose the newly edited task through the existing recommendation path.
    await run(`const savedRandom=Math.random;Math.random=()=>0.999999;page('home');Math.random=savedRandom;$('start').click();`);
    assert.deepEqual(await run("return [$('timerName').textContent,$('timerDesc').textContent]"), [image, description]);
    assert.equal(await run("$('pauseTimer').click();return timerState().paused"), true);
    assert.equal(await run("$('pauseTimer').click();return timerState().paused"), false);
    await run("$('earlyTimer').click();$('confirmAccept').click();");
    assert.equal(await run("return $('todayBox').querySelector('h3').textContent"), image);
    assert.equal(await run("return d.completed.at(-1).taskName"), image);
    assert.equal(await run("return __rawGet('activeTimer')"), null);
    await run(`page('tasks');$('taskList').querySelectorAll('article')[${position}].querySelector('[data-task-action="delete"]').click();$('confirmCancel').click();`);
    assert.equal(await run(`return d.tasks.some(t=>t.id===${JSON.stringify(id)})`), true);
    await run(`$('taskList').querySelectorAll('article')[${position}].querySelector('[data-task-action="delete"]').click();$('confirmAccept').click();`);
    assert.equal(await run(`return d.tasks.some(t=>t.id===${JSON.stringify(id)})`), false);
    await noInjection(run);
  });

  await check('notices, confirmation dialogs, timer snapshots and empty states stay safe', fixture(), async run => {
    await run(`notify(${JSON.stringify(image)});openConfirm('delete','mine-task');`);
    assert.equal(await run("return $('appNotice').textContent"), image);
    await run(`closeConfirm();d.tasks[0].name=${JSON.stringify(image)};d.tasks[0].description=${JSON.stringify(svg)};openConfirm('delete','mine-task');`);
    assert.deepEqual(await run("return [$('confirmTaskName').textContent,$('confirmTaskDesc').textContent]"), [image, svg]);
    await run("closeConfirm();startTimer(d.tasks[0]);d.tasks=[];renderTimer();");
    assert.deepEqual(await run("return [$('timerName').textContent,$('timerDesc').textContent]"), [image, svg]);
    await run("giveUpTimer();$('confirmAccept').click();page('tasks');page('today');");
    assert.ok(await run("return $('taskList').textContent.includes('添加一件你想经常做的事')"));
    await noInjection(run);
  });

  await check('legacy finished timer buttons preserve labels and event handlers', fixture(), async run => {
    await run("startTimer(d.tasks[0]);let state=timerState();state.finished=true;state.elapsed=state.durationMs;setTimerState(state);renderTimer();");
    assert.equal(await run("return $('extendTimer').textContent"), '再给我 5 分钟');
    assert.equal(await run("$('extendTimer').click();return timerState().extensionDurationMs"), 300000);
    await run("let state=timerState();state.finished=true;state.elapsed=state.durationMs;setTimerState(state);renderTimer();$('notDoneTimer').click();");
    assert.deepEqual(await run("return [timerState().paused,$('pauseTimer').textContent]"), [true, '继续']);
    await run("$('pauseTimer').click();giveUpTimer();$('confirmAccept').click();");
    assert.equal(await run("return __rawGet('activeTimer')"), null);
    await noInjection(run);
  });

  console.log(`${count}/${count + failures.length} HTML safety Chrome scenarios passed.`);
  if (failures.length) throw new AggregateError(failures, 'HTML safety scenarios failed');
};
