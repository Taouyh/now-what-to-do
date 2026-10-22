const assert = require('node:assert/strict');

module.exports = async (scenario, fixture) => {
  let count = 0;
  const check = async (name, fn, alter) => {
    const data = fixture(); data.completed = []; alter?.(data);
    await scenario(name, {whatToDoData:JSON.stringify(data)}, {}, fn, {chooseConditions:true}); count++;
  };
  const point = (run, id) => run(`const r=$(${JSON.stringify(id)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}`);
  const mouse = (cdp, type, p, extra={}) => cdp('Input.dispatchMouseEvent', {type,...p,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:1,...extra});
  const click = async (run, cdp, id) => {
    const p=await point(run,id);await mouse(cdp,'mousePressed',p);await mouse(cdp,'mouseReleased',p);
  };
  const rect = run => run("const r=$('floatingTimer').getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height}");
  const floating = async run => assert.deepEqual(await run("return [$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide')]"),[true,false]);
  const full = async run => assert.deepEqual(await run("return [$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide')]"),[false,true]);
  const screenshot = async (protocol, name) => {
    if (!process.env.FLOATING_SCREENSHOT_DIR) return;
    const fs = require('node:fs'), path = require('node:path');
    fs.mkdirSync(process.env.FLOATING_SCREENSHOT_DIR, {recursive:true});
    const shot = await protocol('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(process.env.FLOATING_SCREENSHOT_DIR,name+'.png'),Buffer.from(shot.data,'base64'));
  };

  await check('navigation and pointer taps switch views without persisting or duplicating the timer', async (run, _import, {protocol}) => {
    await run("$('start').click();const si=window.setInterval,ci=window.clearInterval;window.__timerIntervals=new Set([timerTick]);window.setInterval=(...args)=>{const id=si(...args);__timerIntervals.add(id);return id};window.clearInterval=id=>{__timerIntervals.delete(id);return ci(id)}");
    await full(run);const raw=await run("return __rawGet('activeTimer')"),writes=await run('return __writes.length');
    for(const page of ['today','tasks','home']) {
      const p=await run(`const r=document.querySelector('[data-page=${page}]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}`);
      await mouse(protocol,'mousePressed',p);await mouse(protocol,'mouseReleased',p);await floating(run);
      if(page==='tasks')await screenshot(protocol,'floating-desktop');
      assert.deepEqual(await run("return [$('timerClock').textContent,$('timerName').textContent]"),await run("return [$('floatingClock').textContent,$('floatingName').textContent]"));
      await click(run,protocol,'floatingHandle');await full(run);
    }
    assert.equal(await run("return __rawGet('activeTimer')"),raw);
    assert.equal(await run('return __writes.length'),writes);assert.equal(await run('return __timerIntervals.size'),1);
    await run("page('tasks');$('floatingHandle').focus()");
    await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await full(run);
  });

  await check('real mouse dragging clamps both edges and never triggers return, selection or scrolling', async (run, _import, {protocol}) => {
    await run("$('start').click();page('tasks');await new Promise(requestAnimationFrame)");
    const raw=await run("return __rawGet('activeTimer')"),before=await rect(run),start=await point(run,'floatingHandle'),scroll=await run('return scrollY');
    await mouse(protocol,'mousePressed',start);await mouse(protocol,'mouseMoved',{x:2,y:2});await mouse(protocol,'mouseReleased',{x:2,y:2});
    await floating(run);let moved=await rect(run);assert.ok(moved.x>=11&&moved.y>=11);assert.notDeepEqual(moved,before);
    assert.equal(await run('return getSelection().toString()'),'');assert.equal(await run('return scrollY'),scroll);
    await run("renderTimer();page('today')");assert.deepEqual(await rect(run),moved);
    const again=await point(run,'floatingHandle'),edge=await run('return {x:innerWidth+500,y:innerHeight+500}');
    await mouse(protocol,'mousePressed',again);await mouse(protocol,'mouseMoved',edge);await mouse(protocol,'mouseReleased',edge);await floating(run);
    moved=await rect(run);assert.ok(await run("const r=$('floatingTimer').getBoundingClientRect();return r.right<=innerWidth&&r.bottom<=innerHeight"));
    assert.equal(await run("return __rawGet('activeTimer')"),raw);
  });

  await check('touch drag, touch cancellation and pen drag respect pointer capture', async (run, _import, {protocol}) => {
    await run("$('start').click();page('tasks');window.__pointerKinds=[];$('floatingTimer').addEventListener('pointerdown',e=>__pointerKinds.push(e.pointerType))");
    const touch=async (type,p) => protocol('Input.dispatchTouchEvent',{type,touchPoints:p?[{...p,id:1}]:[]});
    let p=await point(run,'floatingHandle');await touch('touchStart',p);await touch('touchMove',{x:p.x-100,y:p.y-80});await touch('touchEnd');await floating(run);
    assert.equal(await run('return floatingDrag'),null);
    p=await point(run,'floatingHandle');await touch('touchStart',p);await touch('touchCancel');await floating(run);
    assert.equal(await run('return floatingDrag'),null);
    p=await point(run,'floatingHandle');await mouse(protocol,'mousePressed',p,{pointerType:'pen'});
    await mouse(protocol,'mouseMoved',{x:p.x-60,y:p.y-40},{pointerType:'pen',button:'left'});
    await mouse(protocol,'mouseReleased',{x:p.x-60,y:p.y-40},{pointerType:'pen'});await floating(run);
    assert.ok(await run("return __pointerKinds.includes('touch')&&__pointerKinds.includes('pen')"));
    p=await point(run,'floatingHandle');await mouse(protocol,'mousePressed',p);
    await run("$('floatingTimer').releasePointerCapture(floatingDrag.id)");
    await mouse(protocol,'mouseMoved',{x:p.x+2,y:p.y+2});await mouse(protocol,'mouseReleased',p);await floating(run);
    assert.equal(await run('return floatingDrag'),null);
  });

  await check('pointer buttons pause and resume without moving or reopening the full timer', async (run, _import, {protocol}) => {
    await run("$('start').click();page('today')");const position=await rect(run);
    await click(run,protocol,'floatingPause');await floating(run);
    const paused=await run('return timerState()');assert.equal(paused.paused,true);
    await new Promise(resolve=>setTimeout(resolve,1100));
    await run('renderTimer()');assert.equal(await run('return timerState().elapsed'),paused.elapsed);
    assert.equal(await run("return $('floatingPause').textContent"),'继续');assert.deepEqual(await rect(run),position);
    await click(run,protocol,'floatingPause');await floating(run);assert.equal(await run('return timerState().paused'),false);
    await click(run,protocol,'floatingEnd');assert.equal(await run('return floatingDrag'),null);
    assert.equal(await run("return $('confirmCancel').textContent"),'取消');
  });

  await check('three-way end cancellation, failed save, completion and stale clicks preserve session safety', async (run, _import, {protocol,reload}) => {
    await run("$('start').click();page('tasks')");
    for(const paused of [false,true]) {
      if(paused)await click(run,protocol,'floatingPause');
      const raw=await run("return __rawGet('activeTimer')");
      await click(run,protocol,'floatingEnd');await click(run,protocol,'confirmCancel');await floating(run);
      assert.equal(await run("return __rawGet('activeTimer')"),raw);
    }
    const session=await run('return timerState()');
    await click(run,protocol,'floatingEnd');await run('__faults.writeKey="whatToDoData"');
    await click(run,protocol,'confirmAccept');assert.equal(await run('return d.completed.length'),0);
    assert.equal(await run("return $('confirmLayer').classList.contains('hide')"),false);
    await run('delete __faults.writeKey;window.__oldAccept=$("confirmAccept").onclick');
    await click(run,protocol,'confirmAccept');await run('__oldAccept()');
    const records=await run('return d.completed');assert.equal(records.length,1);
    assert.equal(records[0].startedAt,session.startedAt);assert.equal(records[0].goalId,session.goalId);assert.equal(records[0].goalName,session.goalName);
    assert.ok(records[0].endedAt>=records[0].startedAt);assert.ok(Number.isFinite(records[0].actualDurationMs));
    assert.equal(await run('return d.tasks.length'),1);await reload();assert.equal(await run('return d.completed.length'),1);
    assert.equal(await run("return $('floatingTimer').classList.contains('hide')"),true);
  });

  await check('discard saves no record and its old completion handler cannot affect a new session', async (run, _import, {protocol}) => {
    await run("$('start').click();page('today')");await click(run,protocol,'floatingEnd');
    await run("window.__oldFinish=$('confirmAccept').onclick");await click(run,protocol,'confirmAbandon');
    assert.equal(await run('return d.completed.length'),0);assert.equal(await run("return __rawGet('activeTimer')"),null);
    await run("$('start').click()");const raw=await run("return __rawGet('activeTimer')");await run('__oldFinish()');
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return d.completed.length'),0);await full(run);
  });

  await check('resize keeps clock and buttons visible and confirmation layers remain above the float', async (run, _import, {protocol}) => {
    await run("$('start').click();page('tasks')");
    for(const [width,height] of [[320,480],[320,240],[220,190],[1000,700]]) {
      await protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      await run('await new Promise(requestAnimationFrame)');
      assert.ok(await run("return ['floatingTimer','floatingClock','floatingPause','floatingEnd'].every(id=>{const r=$(id).getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5})"));
      if(width===320&&height===480)await screenshot(protocol,'floating-small');
    }
    await click(run,protocol,'floatingEnd');
    await screenshot(protocol,'floating-end-confirmation');
    assert.ok(await run("const r=$('floatingTimer').getBoundingClientRect();return $('confirmLayer').contains(document.elementFromPoint(r.left+10,r.top+10))"));
    await click(run,protocol,'confirmCancel');await run('newTask()');
    assert.ok(await run("const r=$('floatingTimer').getBoundingClientRect();return $('modal').contains(document.elementFromPoint(r.left+10,r.top+10))"));
  }, data=>{data.tasks[0].name='很长的中文任务名称 '.repeat(30)});

  await check('paused refresh restores full view and resets only floating position', async (run, _import, {protocol,reload}) => {
    await run("$('start').click();page('tasks')");let p=await point(run,'floatingHandle');
    await mouse(protocol,'mousePressed',p);await mouse(protocol,'mouseMoved',{x:30,y:40});await mouse(protocol,'mouseReleased',{x:30,y:40});
    await click(run,protocol,'floatingPause');const raw=await run("return __rawGet('activeTimer')");
    await reload();await full(run);assert.equal(await run("return __rawGet('activeTimer')"),raw);
    assert.equal(await run('return floatingPosition'),null);assert.equal(await run('return timerState().paused'),true);
    await run("page('tasks')");assert.ok(await run("const r=$('floatingTimer').getBoundingClientRect(),v=visualViewport;return Math.abs(v.offsetLeft+v.width-r.right-12)<1&&Math.abs(v.offsetTop+v.height-r.bottom-12)<1"));
  });

  await check('real background return uses timestamps, and redraws do not duplicate extensions', async (run, _import, {background}) => {
    await run("$('start').click();page('tasks')");const before=await run('return remainingMs(timerState())');
    assert.equal(await background(1400),true,'Chrome must actually background this target');
    const after=await run('return remainingMs(timerState())');assert.ok(before-after>=1300);
    await run("let x=timerState();x.lastStarted=Date.now()-x.durationMs-1000;setTimerState(x);advanceTimerIfNeeded(timerState());renderTimer()");
    const raw=await run("return __rawGet('activeTimer')");
    await run("for(let i=0;i<12;i++){showFullTimer();page('tasks');renderTimer();advanceTimerIfNeeded(timerState())}");
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return d.completed.length'),0);
    assert.deepEqual(await run("return [$('floatingClock').textContent,$('floatingName').textContent]"),await run("return [$('timerClock').textContent,$('timerName').textContent]"));
  });

  await check('malicious text stays inert in the floating view and end confirmation', async (run, _import, {protocol}) => {
    await run("$('start').click();page('today')");assert.equal(await run("return $('floatingName').textContent"),'<img data-float-probe src=x onerror="window.__floatExecuted=1"> 中文 & \' "');
    await click(run,protocol,'floatingEnd');await run('await new Promise(resolve=>setTimeout(resolve,80))');
    assert.deepEqual(await run("return [document.querySelectorAll('[data-float-probe]').length,window.__floatExecuted||0]"),[0,0]);
  },data=>{data.tasks[0].name='<img data-float-probe src=x onerror="window.__floatExecuted=1"> 中文 & \' "'});
  console.log(count+' floating-timer Chrome scenarios passed.');
};
