const assert = require('node:assert/strict');

// Synthetic fixtures only, using the shared temporary Chrome profile runner.
module.exports = async (scenario, fixture) => {
  let count = 0;
  const check = async (name, fn) => {
    await scenario(name, { whatToDoData: JSON.stringify(fixture()) }, {}, fn);
    count++;
  };
  const key = async (protocol, value, code, keyCode) => {
    await protocol('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code, windowsVirtualKeyCode: keyCode, ...(value === 'Enter' ? { text: '\r' } : {}) });
    await protocol('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code, windowsVirtualKeyCode: keyCode });
  };
  const click = async (run, protocol, selector) => {
    const point = await run(`const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}`);
    await protocol('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 });
    await protocol('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 });
  };

  await check('data menu opens by keyboard, tabs through actions and closes without writing data', async (run, _import, { protocol }) => {
    const before = await run("return __rawGet('whatToDoData')");
    assert.equal(await run("return $('dataMenu').open"), false);
    await run("$('dataMenuToggle').focus()");
    await key(protocol, 'Enter', 'Enter', 13);
    assert.equal(await run("return $('dataMenu').open"), true);
    await key(protocol, 'Tab', 'Tab', 9);
    assert.equal(await run('return document.activeElement.id'), 'export');
    await key(protocol, 'Tab', 'Tab', 9);
    assert.equal(await run('return document.activeElement.id'), 'import');
    await key(protocol, 'Escape', 'Escape', 27);
    assert.deepEqual(await run("return [$('dataMenu').open,document.activeElement.id]"), [false, 'dataMenuToggle']);
    await click(run, protocol, '#dataMenuToggle');
    await click(run, protocol, '#home .hero');
    assert.equal(await run("return $('dataMenu').open"), false);
    assert.equal(await run("return __rawGet('whatToDoData')"), before);
    assert.equal(await run('return __writes.length'), 0);
  });

  await check('backup produces the complete JSON document and restores menu focus', async (run, _import, { protocol }) => {
    const expected = await run('return JSON.stringify(d,null,2)');
    await click(run, protocol, '#dataMenuToggle');
    await click(run, protocol, '#export');
    assert.equal(await run('return __downloads.length'), 1);
    assert.equal(await run('return __downloads[0].name'), 'what-to-do-backup.json');
    assert.equal(await run('return await __downloads[0].blob.text()'), expected);
    assert.deepEqual(await run("return [$('dataMenu').open,document.activeElement.id,__writes.length]"), [false, 'dataMenuToggle', 0]);
  });

  await check('restore keeps chooser binding, validation, cancellation and failed-write protection', async (run, importData, { protocol }) => {
    const before = await run("return __rawGet('whatToDoData')"), runtime = await run('return JSON.stringify(d)');
    // Observe only the chooser binding; native OS file-dialog interaction is not tested.
    await run("window.__chooserRequests=0;$('file').click=()=>__chooserRequests++");
    await click(run, protocol, '#dataMenuToggle');
    await click(run, protocol, '#import');
    assert.deepEqual(await run("return [__chooserRequests,$('dataMenu').open]"), [1, false]);
    await importData('{broken');
    assert.equal(await run("return $('confirmLayer').classList.contains('hide')"), true);
    const incoming = fixture(); incoming.theme = 'dark'; incoming.preferences = { time: 30, env: 'quiet', computerReady: true };
    await importData(incoming);
    assert.equal(await run("return $('confirmLayer').classList.contains('hide')"), false);
    await run("$('confirmCancel').click()");
    assert.equal(await run("return __rawGet('whatToDoData')"), before);
    await importData(incoming);
    await run("__faults.write=true;$('confirmAccept').click()");
    assert.equal(await run("return __rawGet('whatToDoData')"), before);
    assert.equal(await run('return JSON.stringify(d)'), runtime);
    assert.equal(await run("return !!$('storageWarning')"), true);
    await run("delete __faults.write;$('confirmAccept').click()");
    assert.deepEqual(await run('return [time,env,computerReady,document.documentElement.dataset.theme]'), [30, 'quiet', true, 'dark']);
    assert.deepEqual(await run('return [d.tasks,d.goals,d.completed.length]'), [incoming.tasks, incoming.goals, incoming.completed.length]);
  });

  await check('data menu fits narrow screens and remains below confirmation dialogs', async (run, importData, { protocol }) => {
    for (const width of [1366, 375, 320, 240]) {
      await protocol('Emulation.setDeviceMetricsOverride', { width, height: 600, deviceScaleFactor: 1, mobile: width < 600 });
      await run("$('dataMenu').open=true;await new Promise(requestAnimationFrame)");
      assert.ok(await run("const r=$('dataPanel').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&document.documentElement.scrollWidth<=innerWidth"));
      await run("$('dataMenu').open=false");
    }
    await importData(fixture());
    await run("$('dataMenu').open=true");
    assert.ok(await run("return Number(getComputedStyle($('confirmLayer')).zIndex)>Number(getComputedStyle(document.querySelector('header')).zIndex)"));
    await run("$('confirmCancel').click()");
    assert.equal(await run('return __writes.length'), 0);
  });
  console.log(count + ' data-menu Chrome scenarios passed.');
};
