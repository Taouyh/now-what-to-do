const assert = require('node:assert/strict');

module.exports = async (scenario, fixture) => {
  let count=0;
  const check=async(name,fn,alter)=>{
    const data=fixture();data.completed=[];alter?.(data);
    await scenario(name,{whatToDoData:JSON.stringify(data)},{},fn,{chooseConditions:true});count++;
  };
  const point=(run,id)=>run("const el=$("+JSON.stringify(id)+");el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}");
  const click=async(run,cdp,id)=>{
    const p=await point(run,id);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});
  };
  const floating=async run=>assert.deepEqual(await run("return [$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide')]"),[true,false]);
  const full=async run=>assert.deepEqual(await run("return [location.hash,$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide')]"),['#home',false,true]);
  const end=async(run,cdp)=>{await click(run,cdp,'floatingTimer');await full(run);await click(run,cdp,'earlyTimer')};

  await check('the countdown is the only floating control and clicks return home without session writes',async(run,_imp,{protocol})=>{
    await run("$('start').click();window.__session=__rawGet('activeTimer');window.__initialWrites=__writes.length");
    for(const page of ['tasks','today','settings']){
      await run('page('+JSON.stringify(page)+')');await floating(run);
      assert.deepEqual(await run("return [$('floatingTimer').tagName,$('floatingTimer').querySelectorAll('button').length,$('floatingName'),$('floatingStatus'),$('floatingPause'),$('floatingEnd')]"),['BUTTON',0,null,null,null,null]);
      assert.equal(await run("return $('floatingTimer').innerText.trim()"),await run("return $('timerClock').textContent"));
      await click(run,protocol,'floatingTimer');await full(run);
      assert.equal(await run("return document.activeElement.id"),'pauseTimer');
    }
    assert.equal(await run("return __rawGet('activeTimer')===__session&&__writes.length===__initialWrites"),true);
  });

  await check('native keyboard activation supports Enter and Space without resuming a paused session',async(run,_imp,{protocol})=>{
    await run("$('start').click();pauseTimer();window.__paused=__rawGet('activeTimer')");
    for(const [key,code,keyCode] of [['Enter','Enter',13],[' ','Space',32]]){
      await run("page('tasks');$('floatingTimer').focus()");
      await protocol('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:keyCode,...(key==='Enter'?{text:'\r'}:{})});
      await protocol('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:keyCode});
      await full(run);assert.equal(await run("return __rawGet('activeTimer')===__paused&&timerState().paused"),true);
    }
  });

  await check('a touch tap opens the same session without pausing, completing or restarting it',async(run,_imp,{protocol})=>{
    await protocol('Emulation.setDeviceMetricsOverride',{width:375,height:667,deviceScaleFactor:1,mobile:true});
    await run("$('start').click();page('tasks');window.__before=__rawGet('activeTimer')");
    const p=await point(run,'floatingTimer');
    await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:0}]});
    await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await full(run);assert.deepEqual(await run("return [__rawGet('activeTimer')===__before,d.completed.length,timerState().paused]"),[true,0,false]);
  });

  await check('full timer pause and resume update the quiet paused indicator',async(run,_imp,{protocol})=>{
    await run("$('start').click();page('today')");await click(run,protocol,'floatingTimer');await click(run,protocol,'pauseTimer');
    assert.equal(await run('return timerState().paused'),true);
    const raw=await run("return __rawGet('activeTimer')");await run("page('tasks')");
    assert.equal(await run("return $('floatingPaused').classList.contains('hide')"),false);
    assert.match(await run("return $('floatingTimer').getAttribute('aria-label')"),/已暂停/);
    await click(run,protocol,'floatingTimer');assert.equal(await run("return __rawGet('activeTimer')"),raw);
    await click(run,protocol,'pauseTimer');await run("page('tasks')");
    assert.deepEqual(await run("return [timerState().paused,$('floatingPaused').classList.contains('hide')]"),[false,true]);
  });

  await check('direct End retries failed saves and ignores stale completion clicks after countdown return',async(run,_imp,{protocol,reload})=>{
    await run("$('start').click();page('tasks')");
    const session=await run('return timerState()'),raw=await run("return __rawGet('activeTimer')");
    await run('__faults.writeKey="whatToDoData"');await end(run,protocol);await full(run);
    assert.equal(await run('return d.completed.length'),0);assert.equal(await run("return __rawGet('activeTimer')"),raw);
    assert.equal(await run("return $('confirmLayer').classList.contains('hide')"),true);
    await run("delete __faults.writeKey;window.__oldEnd=$('earlyTimer').onclick");await click(run,protocol,'earlyTimer');await run('__oldEnd()');
    const records=await run('return d.completed');assert.equal(records.length,1);assert.equal(records[0].completionId,session.completionId);
    assert.equal(records[0].startedAt,session.startedAt);assert.ok(Number.isFinite(records[0].actualDurationMs));
    assert.equal(await run("return __rawGet('activeTimer')"),null);
    assert.deepEqual(await run("return [location.hash,$('modal').classList.contains('hide'),$('confirmLayer').classList.contains('hide')]"),['#home',true,true]);
    await reload();assert.equal(await run('return d.completed.length'),1);
  });

  await check('the old End handler cannot complete the next running session',async(run,_imp,{protocol})=>{
    await run("$('start').click();window.__oldEnd=$('earlyTimer').onclick;page('today')");await end(run,protocol);
    assert.equal(await run('return d.completed.length'),1);assert.equal(await run("return __rawGet('activeTimer')"),null);
    await run("$('start').click()");const raw=await run("return __rawGet('activeTimer')");await run('__oldEnd()');
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return d.completed.length'),1);await full(run);
  });

  await check('badge fits narrow screens and becomes inert behind editing and confirmation dialogs',async(run,_imp,{protocol})=>{
    await run("$('start').click();page('tasks')");
    for(const [width,height] of [[1440,1000],[375,667],[320,240],[220,190],[1000,700]]){
      await protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
      await run('await new Promise(requestAnimationFrame)');
      assert.ok(await run("const r=$('floatingTimer').getBoundingClientRect(),c=$('floatingClock').getBoundingClientRect(),v=visualViewport;return r.height>=44&&r.height<=60&&r.width<170&&r.left>=v.offsetLeft&&r.top>=v.offsetTop&&r.right<=v.offsetLeft+v.width+.5&&r.bottom<=v.offsetTop+v.height+.5&&c.width>0&&c.right<=r.right"));
    }
    await run('newTask()');assert.equal(await run("return $('floatingTimer').inert"),true);
    assert.ok(await run("const r=$('floatingTimer').getBoundingClientRect();return $('modal').contains(document.elementFromPoint(r.left+10,r.top+10))"));
    await run("closeActivity();openConfirm('delete',d.tasks[0].id)");assert.equal(await run("return $('floatingTimer').inert"),true);
    await click(run,protocol,'confirmCancel');assert.equal(await run("return $('floatingTimer').inert"),false);
  });

  await check('paused refresh keeps the countdown state and route, and clicking restores the full timer',async(run,_imp,{protocol,reload})=>{
    await run("$('start').click();pauseTimer();page('tasks')");const raw=await run("return __rawGet('activeTimer')");
    await reload();await floating(run);assert.equal(await run('return timerState().elapsed'),JSON.parse(raw).elapsed);assert.equal(await run('return timerState().recoveryReason'),'reopen');const recovered=await run("return __rawGet('activeTimer')");
    assert.equal(await run("return !$('floatingPaused').classList.contains('hide')"),true);
    await click(run,protocol,'floatingTimer');await full(run);await reload();await full(run);
    assert.equal(await run("return __rawGet('activeTimer')"),recovered);assert.equal(await run('return __writes.length'),0);
  });

  await check('background return advances bounded time and redraws never add time',async(run,_imp,{background})=>{
    await run("$('start').click();page('tasks')");const before=await run('return remainingMs(timerState())');
    assert.equal(await background(1400),true);assert.ok(before-await run('return remainingMs(timerState())')>=1300);
    await run("let x=timerState();x.lastStarted=Date.now()-x.durationMs-1000;setTimerState(x);advanceTimerIfNeeded(timerState());renderTimer()");
    const raw=await run("return __rawGet('activeTimer')");
    await run("for(let i=0;i<12;i++){showFullTimer();page('tasks');renderTimer();advanceTimerIfNeeded(timerState())}");
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return d.completed.length'),0);
    assert.equal(await run("return $('floatingClock').textContent"),await run("return $('timerClock').textContent"));
  });

  await check('hostile activity text stays out of the badge and remains inert in full timer and saved records',async(run,_imp,{protocol})=>{
    await run("$('start').click();page('today')");
    assert.match(await run("return $('floatingTimer').innerText.trim()"),/^\d+:\d{2}$/);
    await click(run,protocol,'floatingTimer');await click(run,protocol,'earlyTimer');
    assert.deepEqual(await run("return [document.querySelectorAll('[data-float-probe]').length,window.__floatExecuted||0]"),[0,0]);
    assert.match(await run("return d.completed[0].taskName"),/data-float-probe/);
  },data=>{data.tasks[0].name='<img data-float-probe src=x onerror="window.__floatExecuted=1"> 中文 &'});
  console.log(count+' countdown-badge Chrome scenarios passed.');
};
