const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Real pointer/keyboard interactions, synthetic data, and screenshots from the
// shared isolated Chrome runner. No normal browser profile or real user data.
module.exports = async (scenario, fixture) => {
  let count = 0;
  const out = path.resolve(__dirname, '../test-artifacts/minimal-ui');
  fs.mkdirSync(out, { recursive: true });
  const dataset = () => {
    const d = fixture();
    d.preferences = { time: 15, env: 'quiet', computerReady: false };
    d.completed = [];
    d.tasks = ['读书', '复习单词', '练字', '拉伸', '学习 Python'].map((name, i) => ({
      ...d.tasks[0], id: 'activity-' + i, name, minutes: [10,15,20,5,30][i], env: 'quiet',
      computer: i === 4, description: i === 0 ? '接着上次读到的地方，读几页。' : '',
    }));
    return d;
  };
  const check = async (name, data, fn, faults = {}) => {
    await scenario(name, data === null ? {} : { whatToDoData: JSON.stringify(data) }, faults, async (...args) => {
      await size(args[2].protocol,1440,900);
      await fn(...args);
    }, { timezone: 'Asia/Shanghai' });
    count++;
  };
  const click = async (run, protocol, selector) => {
    const p = await run(`const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('missing '+${JSON.stringify(selector)});el.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const r=el.getBoundingClientRect();if(!r.width||!r.height)throw Error('not visible '+${JSON.stringify(selector)});return {x:r.left+r.width/2,y:r.top+r.height/2}`);
    await protocol('Input.dispatchMouseEvent', { type:'mousePressed', ...p, button:'left', buttons:1, clickCount:1 });
    await protocol('Input.dispatchMouseEvent', { type:'mouseReleased', ...p, button:'left', buttons:0, clickCount:1 });
    await run('await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await new Promise(resolve=>setTimeout(resolve,80))');
  };
  const key = async (protocol, key, code, keyCode, shiftKey = false) => {
    const params = {key,code,windowsVirtualKeyCode:keyCode,modifiers:shiftKey?8:0};
    await protocol('Input.dispatchKeyEvent', {type:'keyDown',...params,...(key==='Enter'?{text:'\r'}:{})});
    await protocol('Input.dispatchKeyEvent', {type:'keyUp',...params});
  };
  const size = async (protocol, width, height = 1000) => protocol('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:width<600});
  const shot = async (run, protocol, name) => {
    await run('await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)');
    const image = await protocol('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(image.data,'base64'));
  };
  const noOverflow = async run => assert.ok(await run('return document.documentElement.scrollWidth<=innerWidth'), 'no horizontal overflow');

  await check('empty library shows one-field onboarding; quick add is immediately usable and survives reload', null, async (run,_imp,{protocol,reload}) => {
    await size(protocol,1440);
    assert.deepEqual(await run("return [d.tasks.length,$('onboarding').classList.contains('hide'),$('homeWorkspace').classList.contains('hide')]"),[0,false,true]);
    await shot(run,protocol,'06-onboarding-light');
    await run("$('quickName').value='读书'");
    await click(run,protocol,'#addFirstTask');
    assert.deepEqual(await run("return [d.tasks.length,cur.name,Object.hasOwn(cur,'minutes'),$('onboarding').classList.contains('hide'),!!$('start')]"),[1,'读书',false,true,true]);
    assert.equal(await run("return __rawGet('activeTimer')"),null);
    await reload();
    assert.deepEqual(await run('return [d.tasks.length,cur.name,__writes.length]'),[1,'读书',0]);
  });

  await check('blank name and storage failure cannot dismiss onboarding or invent activity data', null, async (run,_imp,{protocol}) => {
    const before = await run("return __rawGet('whatToDoData')");
    await click(run,protocol,'#addFirstTask');
    assert.equal(await run('return d.tasks.length'),0);
    await run("$('quickName').value='读书';__faults.write=true");
    await click(run,protocol,'#addFirstTask');
    assert.deepEqual(await run("return [d.tasks.length,$('quickName').value,$('onboarding').classList.contains('hide'),__rawGet('whatToDoData')]"),[0,'读书',false,before]);
    await run('delete __faults.write');
    await click(run,protocol,'#addFirstTask');
    assert.equal(await run('return d.tasks.length'),1);
  });

  await check('returning user sees a valid recommendation without configuration or startup writes', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);
    const raw = await run("return __rawGet('whatToDoData')");
    assert.deepEqual(await run('return [selectionReady(),ok(cur),__writes.length]'),[true,true,0]);
    await run("cur=d.tasks[0];random({keepCurrent:true})");
    await shot(run,protocol,'01-home-light');
    const before = await run('return cur.id');
    await click(run,protocol,'#random');
    assert.notEqual(await run('return cur.id'),before);
    await click(run,protocol,'[data-page=tasks]');
    await click(run,protocol,'[data-page=home]');
    const id = await run('return cur.id');
    await click(run,protocol,'#timePicker > summary');
    assert.equal(await run("return $('timePicker').open"),true);
    await click(run,protocol,'#times [data-v="30"]');
    assert.deepEqual(await run("return [cur.id,$('timePicker').open,$('timeSummary').textContent]"),[id,false,'30 分钟']);
    assert.equal(JSON.parse(raw).tasks.length,await run('return d.tasks.length'));
  });

  await check('condition popovers handle keyboard, outside dismissal, custom validation and stale start buttons', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);
    await click(run,protocol,'#timePicker > summary');
    await click(run,protocol,'#times [data-v=custom]');
    assert.equal(await run('return document.activeElement.id'),'customMinutes');
    await run("$('customMinutes').value='8';$('customMinutes').dispatchEvent(new Event('input'))");
    assert.equal(await run('return ok(cur)'),true);
    await run("window.__stale=$('start');$('customMinutes').value='bad';$('customMinutes').dispatchEvent(new Event('input'));__stale.click()");
    assert.deepEqual(await run("return [cur,__rawGet('activeTimer'),$('customMinutes').getAttribute('aria-invalid')]"),[null,null,'true']);
    await key(protocol,'Escape','Escape',27);
    assert.equal(await run("return $('timePicker').open"),false);
    await click(run,protocol,'#timePicker > summary');
    await click(run,protocol,'#times [data-v="15"]');
    await run('d.tasks.forEach(t=>t.requirements={audio:true});random({keepCurrent:true})');
    await click(run,protocol,'#conditionsPicker > summary');
    assert.equal(await run('return cur'),null);
    await click(run,protocol,'.brand');
    assert.equal(await run("return $('conditionsPicker').open"),false);
    await click(run,protocol,'#rec .primary');
    assert.equal(await run("return $('conditionsPicker').open"),true);
  });

  await check('short and narrow screens keep condition popovers above content and custom input reachable', dataset(), async (run,_imp,{protocol}) => {
    for(const [width,height] of [[800,600],[700,400],[375,667],[320,568],[240,600]]){
      await size(protocol,width,height);
      await run("page('home');scrollTo(0,0)");
      await click(run,protocol,'#timePicker > summary');
      await click(run,protocol,'#times [data-v=custom]');
      assert.equal(await run('return document.activeElement.id'),'customMinutes');
      await run("$('customMinutes').value='25';$('customMinutes').dispatchEvent(new Event('input'))");
      assert.equal(await run('return selectionReady()'),true);
      assert.ok(await run("const r=$('customMinutes').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight"));
      await key(protocol,'Escape','Escape',27);
      await noOverflow(run);
    }
  });

  await check('activity list supports disclosure, search, edit defaults and modal keyboard focus', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);
    await click(run,protocol,'[data-page=tasks]');
    await shot(run,protocol,'02-activities-light');
    assert.equal(await run("return $('taskList').querySelectorAll('details').length"),5);
    await click(run,protocol,'.activity-item summary');
    await click(run,protocol,'.activity-item [data-task-action=more]');
    await click(run,protocol,'#activityMenuEdit');
    assert.deepEqual(await run("return [$('name').value,$('activityOptions').open,document.activeElement.id]"),['读书',true,'name']);
    await shot(run,protocol,'04-edit-light');
    await run("document.querySelector('#form [type=submit]').focus()");
    await key(protocol,'Tab','Tab',9);
    assert.equal(await run('return document.activeElement.id'),'close');
    await key(protocol,'Escape','Escape',27);
    assert.ok(await run("return $('modal').classList.contains('hide')&&!document.querySelector('main').inert"));
    await click(run,protocol,'#toggleActivitySearch');
    await run("$('taskSearch').value='Python';$('taskSearch').dispatchEvent(new Event('input'))");
    assert.equal(await run("return $('taskList').querySelectorAll('.activity-item').length"),1);
    await click(run,protocol,'#closeActivitySearch');
    assert.equal(await run("return $('taskList').querySelectorAll('.activity-item').length"),5);
  });

  await check('each collapsed activity starts immediately without expanding or replacing an existing timer', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);await run("page('tasks')");
    await click(run,protocol,'.activity-item:first-child [data-task-action=start]');
    assert.deepEqual(await run("return [timerState().taskId,document.querySelector('.activity-item').open,d.completed.length]"),['activity-0',false,0]);
    const session=await run('return timerState().completionId');
    await click(run,protocol,'[data-page=tasks]');
    await click(run,protocol,'.activity-item:last-child [data-task-action=start]');
    assert.deepEqual(await run('return [timerState().taskId,timerState().completionId]'),['activity-0',session]);
    await run("giveUpTimer();$('confirmAccept').click();page('tasks')");
    await click(run,protocol,'.activity-item:last-child [data-task-action=more]');
    await click(run,protocol,'.activity-item:last-child [data-task-action=start]');
    assert.equal(await run('return timerState().taskId'),'activity-4');
    assert.ok(await run("return $('activityMenu').classList.contains('hide')"));
  });

  await check('activity overflow edits the correct row, supports keyboard and dismissal, and confirms deletion', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);await run("page('tasks')");
    const original=await run("return __rawGet('whatToDoData')");
    await click(run,protocol,'.activity-item:first-child summary');
    assert.deepEqual(await run("return [document.querySelector('.activity-item').open,timerState()]"),[true,null]);
    await click(run,protocol,'.activity-item:last-child [data-task-action=more]');
    assert.deepEqual(await run("return [document.querySelector('.activity-item:last-child').open,document.activeElement.id,timerState()]"),[false,'activityMenuEdit',null]);
    await key(protocol,'ArrowDown','ArrowDown',40);
    assert.equal(await run('return document.activeElement.id'),'activityMenuDelete');
    await key(protocol,'Escape','Escape',27);
    assert.equal(await run('return document.activeElement.dataset.taskAction'),'more');
    assert.ok(await run("return $('activityMenu').classList.contains('hide')"));
    await key(protocol,'Enter','Enter',13);
    await key(protocol,'Enter','Enter',13);
    assert.equal(await run("return $('tid').value"),'activity-4');
    await key(protocol,'Escape','Escape',27);
    assert.equal(await run('return document.activeElement.dataset.taskAction'),'more');
    await key(protocol,'Enter','Enter',13);
    await key(protocol,'Tab','Tab',9,true);
    assert.equal(await run('return document.activeElement.dataset.taskAction'),'start');
    assert.ok(await run("return $('activityMenu').classList.contains('hide')"));
    await click(run,protocol,'.activity-item:last-child [data-task-action=more]');
    await click(run,protocol,'.heading h1');
    assert.ok(await run("return $('activityMenu').classList.contains('hide')"));
    assert.equal(await run("return __rawGet('whatToDoData')"),original);
    await click(run,protocol,'.activity-item:last-child [data-task-action=more]');
    await run("setActivitySearch(true);$('taskSearch').value='读书';$('taskSearch').dispatchEvent(new Event('input'));$('activityMenuDelete').click()");
    assert.equal(await run('return d.tasks.length'),5);
    assert.ok(await run("return $('confirmLayer').classList.contains('hide')"));
    await click(run,protocol,'.activity-item [data-task-action=more]');
    await click(run,protocol,'#activityMenuDelete');
    assert.equal(await run("return $('confirmTaskName').textContent"),'读书');
    await click(run,protocol,'#confirmCancel');
    assert.equal(await run('return d.tasks.length'),5);
    await click(run,protocol,'.activity-item [data-task-action=more]');
    await click(run,protocol,'#activityMenuDelete');
    await click(run,protocol,'#confirmAccept');
    assert.deepEqual(await run("return [d.tasks.length,d.tasks.some(t=>t.id==='activity-0'),d.completed.length]"),[4,false,0]);
  });

  await check('start and overflow stay reachable on narrow screens, in dark mode and at the bottom of a long list', dataset(), async (run,_imp,{protocol}) => {
    await run("page('tasks');d.tasks[0].name='这是一项名称非常长的活动，用于验证小屏布局';tasks()");
    for(const [width,height] of [[1440,1000],[375,667],[320,568],[240,600]]){
      await size(protocol,width,height);await run('scrollTo(0,0)');
      await click(run,protocol,'.activity-item:last-child [data-task-action=more]');
      const menuGeometry=await run("const r=$('activityMenu').getBoundingClientRect(),v=visualViewport;return {visible:r.width>0&&r.height>0,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight,visualTop:v.offsetTop,visualHeight:v.height}");
      assert.ok(menuGeometry.visible&&menuGeometry.left>=0&&menuGeometry.right<=width&&menuGeometry.top>=menuGeometry.visualTop&&menuGeometry.bottom<=menuGeometry.visualTop+menuGeometry.visualHeight,JSON.stringify(menuGeometry));
      assert.ok(await run("const b=document.querySelector('.activity-item [data-task-action=start]');return b.getBoundingClientRect().width>=50"));
      await noOverflow(run);
      if(width===1440)await shot(run,protocol,'13-instant-start-light');
      if(width===375)await shot(run,protocol,'13-instant-start-mobile');
      await key(protocol,'Escape','Escape',27);
    }
    await size(protocol,375,667);await run("setTheme('dark')");
    await click(run,protocol,'.activity-item:last-child [data-task-action=more]');
    await shot(run,protocol,'13-instant-start-dark-mobile');await noOverflow(run);
    await click(run,protocol,'[data-page=home]');
    assert.ok(await run("return $('activityMenu').classList.contains('hide')"));
  });

  await check('settings select explicit themes, persist dark mode and preserve backups and restore binding', dataset(), async (run,_imp,{protocol,reload}) => {
    await size(protocol,1440);
    await click(run,protocol,'#dataMenuToggle');
    await shot(run,protocol,'05-settings-light');
    await click(run,protocol,'#theme');
    const darkRaw = await run("return __rawGet('whatToDoData')");
    await click(run,protocol,'#theme');
    assert.equal(await run("return __rawGet('whatToDoData')"),darkRaw);
    assert.equal(await run('return getComputedStyle(document.body).backgroundColor'),'rgb(30, 32, 28)');
    await click(run,protocol,'#closeSettings');
    await reload();
    assert.equal(await run('return document.documentElement.dataset.theme'),'dark');
    await click(run,protocol,'#dataMenuToggle');
    await click(run,protocol,'#export');
    assert.equal(await run('return JSON.parse(await __downloads[0].blob.text()).theme'),'dark');
    await run("window.__restoreCount=0;$('file').click=()=>__restoreCount++");
    await click(run,protocol,'#dataMenuToggle');
    await click(run,protocol,'#import');
    assert.equal(await run('return __restoreCount'),1);
  });

  await check('End directly records actual time once and returns Home with another activity and no dialog', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);
    await run('cur=d.tasks[0];random({keepCurrent:true})');
    await click(run,protocol,'#start');
    assert.deepEqual(await run("return [...$('timerActions').querySelectorAll('button')].map(b=>b.textContent)"),['暂停','结束']);
    await run('let s=timerState();s.lastStarted=Date.now()-78000;setTimerState(s);renderTimer()');
    await shot(run,protocol,'03-timer-light');
    await click(run,protocol,'#pauseTimer');
    assert.equal(await run('return timerState().paused'),true);
    await run('let s=timerState();s.elapsed=360000;setTimerState(s);renderTimer()');
    await run("window.__finish=$('earlyTimer').onclick");
    await click(run,protocol,'#earlyTimer');
    await run('__finish()');
    assert.deepEqual(await run('return [d.completed.length,d.completed[0].actualDurationMs,d.completed[0].plannedDuration,d.tasks.length]'),[1,360000,15,5]);
    assert.deepEqual(await run("return [document.querySelector('.page.active').id,$('confirmLayer').classList.contains('hide'),$('modal').classList.contains('hide'),document.activeElement.id]"),['home',true,true,'start']);
    assert.notEqual(await run('return cur.id'),'activity-0');assert.equal(await run('return ok(cur)'),true);
    assert.match(await run("return $('appNotice').textContent"),/已记录/);
    await shot(run,protocol,'17-end-next-home');
  });

  await check('minimal floating countdown fits desktop, mobile, dark mode and paused long durations', dataset(), async (run,_imp,{protocol}) => {
    await run("time=30;run(d.tasks[0]);let s=timerState();s.lastStarted=Date.now()-296000;setTimerState(s);page('tasks')");
    const raw=await run("return __rawGet('activeTimer')");
    for(const [width,height,theme] of [[1440,1000,'light'],[375,667,'light'],[375,667,'dark'],[240,600,'dark']]){
      await size(protocol,width,height);await run('setTheme('+JSON.stringify(theme)+');renderTimer()');
      assert.ok(await run("const b=$('floatingTimer').getBoundingClientRect(),v=visualViewport;return b.width<170&&b.height>=44&&b.height<=60&&b.left>=v.offsetLeft&&b.right<=v.offsetLeft+v.width&&b.bottom<=v.offsetTop+v.height"));
      assert.equal(await run("return $('floatingTimer').innerText.trim()"),await run("return $('timerClock').textContent"));await noOverflow(run);
      if(width===1440)await shot(run,protocol,'16-countdown-badge-desktop');
      if(width===375)await shot(run,protocol,'16-countdown-badge-mobile-'+theme);
    }
    assert.equal(await run("return __rawGet('activeTimer')"),raw);
    await click(run,protocol,'#floatingTimer');await click(run,protocol,'#pauseTimer');await click(run,protocol,'[data-page=tasks]');
    assert.ok(await run("return !$('floatingPaused').classList.contains('hide')&&timerState().paused"));
    await size(protocol,375,667);await shot(run,protocol,'16-countdown-badge-paused');
    await run("let s=timerState();s.durationMs=s.plannedDurationMs=1440*60000;s.elapsed=0;setTimerState(s);renderTimer()");
    await size(protocol,240,600);await run('renderTimer()');
    assert.equal(await run("return $('floatingClock').textContent"),'1440:00');
    assert.ok(await run("const r=$('floatingTimer').getBoundingClientRect();return r.right<=innerWidth&&r.left>=0&&r.height<=60"));await noOverflow(run);
  });

  await check('Start and the brand restore the full running or paused timer while other pages float', dataset(), async (run,_imp,{protocol}) => {
    await run("cur=d.tasks[0];random({keepCurrent:true})");await click(run,protocol,'#start');
    for(const paused of [false,true]){
      if(paused)await click(run,protocol,'#pauseTimer');
      const raw=await run("return __rawGet('activeTimer')"),writes=await run('return __writes.length');
      for(const width of [1440,375]){
        await size(protocol,width,width===375?812:1000);
        for(const destination of ['[data-page=tasks]','[data-page=today]','#dataMenuToggle']){
          await click(run,protocol,destination);
          assert.deepEqual(await run("return [$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide'),document.querySelector('main').inert]"),[true,false,false]);
          await click(run,protocol,'[data-page=home]');
          assert.deepEqual(await run("return [$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide'),document.querySelector('main').inert,$('timerName').textContent,timerState().paused,document.activeElement.id]"),[false,true,true,'读书',paused,'pauseTimer']);
          assert.equal(await run("return document.querySelector('[data-page=home]').getAttribute('aria-current')"),'page');
          assert.equal(await run("return __rawGet('activeTimer')"),raw);
        }
        if(!paused)await shot(run,protocol,width===375?'15-home-active-timer-mobile':'15-home-active-timer-desktop');
      }
      await click(run,protocol,'[data-page=tasks]');await click(run,protocol,'.brand');
      assert.deepEqual(await run("return [location.hash,$('floatingTimer').classList.contains('hide'),d.completed.length,__writes.length]"),['#home',true,0,writes]);
      assert.equal(await run("return __rawGet('activeTimer')"),raw);
    }
    await click(run,protocol,'#earlyTimer');await click(run,protocol,'[data-page=home]');
    assert.deepEqual(await run("return [timerState(),$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide'),document.querySelector('main').inert,d.completed.length,!!$('start')?.getClientRects().length]"),[null,true,true,false,1,true]);
  });

  await check('reload, settings return, history and hash navigation keep the timer view aligned with the route', dataset(), async (run,_imp,{protocol,reload}) => {
    await run("cur=d.tasks[0];random({keepCurrent:true})");await click(run,protocol,'#start');await click(run,protocol,'#pauseTimer');
    const raw=await run("return __rawGet('activeTimer')");
    const view=async(full)=>assert.deepEqual(await run("return [location.hash,$('timer').classList.contains('hide'),$('floatingTimer').classList.contains('hide')]"),[full?'#home':'#tasks',!full,full]);
    await click(run,protocol,'[data-page=tasks]');await reload();await view(false);
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return __writes.length'),0);
    await click(run,protocol,'[data-page=home]');await reload();await view(true);
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return __writes.length'),0);
    await click(run,protocol,'#dataMenuToggle');await click(run,protocol,'#closeSettings');await view(true);
    await click(run,protocol,'[data-page=tasks]');await click(run,protocol,'[data-page=today]');
    await run('history.back();await new Promise(resolve=>setTimeout(resolve,80))');await view(false);
    await run('history.back();await new Promise(resolve=>setTimeout(resolve,80))');await view(true);
    await run('history.forward();await new Promise(resolve=>setTimeout(resolve,80))');await view(false);
    await run("location.hash='#home';await new Promise(resolve=>setTimeout(resolve,80))");await view(true);
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return d.completed.length'),0);
  });

  await check('today shows sessions in increasing displayed time with expandable details and no storage mutation', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);
    await run(`const day=new Date();day.setHours(9,30,0,0);const start=day.getTime();d.completed=[{taskId:'activity-2',taskName:'练字',startedAt:start,endedAt:start+900000,completedAt:new Date(start+900000).toISOString(),actualDurationMs:900000},{taskId:'activity-1',taskName:'复习单词',startedAt:start+5700000,endedAt:start+6600000,completedAt:new Date(start+6600000).toISOString(),actualDurationMs:900000},{taskId:'activity-0',taskName:'读书',startedAt:start+17400000,endedAt:start+18120000,completedAt:new Date(start+18120000).toISOString(),actualDurationMs:720000}];save();page('today')`);
    const before=await run("return __rawGet('whatToDoData')");
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item h3')].map(e=>e.textContent)"),['练字','复习单词','读书']);
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-time')].map(e=>e.textContent)"),['09:30','11:05','14:20']);
    assert.match(await run("return document.querySelector('.today-overview').textContent"),/做了 3 次，共 42 分钟/);
    await shot(run,protocol,'07-today-light');
    await click(run,protocol,'.history-item summary');
    assert.ok(await run("return document.querySelector('.history-item').open"));
    assert.match(await run("return document.querySelector('.history-item dl').textContent"),/实际有效用时15 分钟/);
    assert.equal(await run("return __rawGet('whatToDoData')"),before);
  });

  await check('desktop and mobile light/dark pages fit; settings, form and timer stay usable', dataset(), async (run,_imp,{protocol}) => {
    for(const width of [1440,375,320,240]){
      await size(protocol,width,width<600?812:1000);
      for(const theme of ['light','dark']){
        await run(`setTheme('${theme}');page('home')`);
        await noOverflow(run);
        await run("cur=d.tasks[0];random({keepCurrent:true})");
        await noOverflow(run);
        if(width===375)await shot(run,protocol,'08-home-mobile-'+theme);
        if(width===1440&&theme==='dark')await shot(run,protocol,'09-home-dark');
        await run("page('tasks')");await noOverflow(run);
        await click(run,protocol,'#newTask');await noOverflow(run);
        const bounds=await run("const r=document.querySelector('.dialog').getBoundingClientRect();return [r.left,r.right,r.top,r.bottom]");
        assert.ok(bounds[0]>=0&&bounds[1]<=width&&bounds[2]>=0&&bounds[3]<=(width<600?812:1000));
        await key(protocol,'Escape','Escape',27);
        await click(run,protocol,'#dataMenuToggle');await noOverflow(run);
        assert.ok(await run("const r=$('dataPanel').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight"));
        await click(run,protocol,'#closeSettings');
        await run("run(d.tasks[0])");await noOverflow(run);
        await run('discardTimer()');
      }
    }
  });

  await check('dark onboarding stays minimal and optional requirements are editable later', null, async (run,_imp,{protocol}) => {
    await size(protocol,1440);
    await run("setTheme('dark');$('quickName').value=''");
    await shot(run,protocol,'10-onboarding-dark');
    await run("$('quickName').value='练字'");
    await click(run,protocol,'#addFirstTask');
    await click(run,protocol,'[data-page=tasks]');
    await click(run,protocol,'.activity-item summary');
    await click(run,protocol,'.activity-item [data-task-action=more]');
    await click(run,protocol,'#activityMenuEdit');
    assert.equal(await run("return $('name').value"),'练字');
    await click(run,protocol,'#requirementsOptions > summary');
    await click(run,protocol,'#requiresAudio');
    await click(run,protocol,'#form [type=submit]');
    assert.deepEqual(await run("return [d.tasks[0].name,Object.hasOwn(d.tasks[0],'minutes'),Object.hasOwn(d.tasks[0],'env'),d.tasks[0].requirements.audio]"),['练字',false,false,true]);
  });

  await check('hostile names and descriptions remain inert in new list, recommendation and timer views', dataset(), async (run,_imp,{protocol}) => {
    const hostile='<img data-minimal-probe src=x onerror="window.__executed=1"> 中文 &';
    await run(`d.tasks[0].name=${JSON.stringify(hostile)};d.tasks[0].description=${JSON.stringify(hostile)};cur=d.tasks[0];random({keepCurrent:true});page('tasks')`);
    await click(run,protocol,'.activity-item summary');
    assert.equal(await run("return document.querySelector('.activity-item h3').textContent"),hostile);
    await run("run(d.tasks[0]);$('timerDescription').open=true");
    assert.deepEqual(await run("return [document.querySelectorAll('[data-minimal-probe]').length,window.__executed||0,$('timerName').textContent]"),[0,0,hostile]);
    await noOverflow(run);
  });
  await check('navigation positions stay fixed across short and scrolling pages; headings remain below the header', dataset(), async (run,_imp,{protocol}) => {
    await run(`const seed=d.tasks[0];d.tasks=Array.from({length:40},(_,i)=>({...seed,id:'long-'+i,name:'活动 '+i}));const stamp=Date.now();d.completed=Array.from({length:20},(_,i)=>({taskId:'long-0',taskName:'记录 '+i,startedAt:stamp-i*60000,completedAt:new Date(stamp-i*60000).toISOString(),actualDurationMs:1000}));`);
    const selectors=['[data-page=home]','[data-page=tasks]','[data-page=today]','#dataMenuToggle'];
    for(const [width,height] of [[1366,768],[375,667],[320,568]]){
      await size(protocol,width,height);
      for(const theme of ['light','dark']){
        await run(`setTheme('${theme}');page('home');await document.fonts.ready;await new Promise(requestAnimationFrame)`);
        const positions=await run(`return ${JSON.stringify(selectors)}.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,width:r.width}})`);
        for(const selector of selectors){
          await click(run,protocol,selector);
          await run('await new Promise(requestAnimationFrame)');
          const after=await run(`return ${JSON.stringify(selectors)}.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,width:r.width}})`);
          after.forEach((r,i)=>{assert.ok(Math.abs(r.left-positions[i].left)<0.5,JSON.stringify({width,theme,selector,positions,after}));assert.equal(r.width,positions[i].width)});
          assert.ok(await run('return scrollY<1'));
          assert.ok(await run("const heading=[...document.querySelectorAll('.page.active h1,.page.active .home-controls')].find(e=>e.getClientRects().length).getBoundingClientRect(),header=document.querySelector('header').getBoundingClientRect();return heading.top>=header.bottom"));
          await noOverflow(run);
        }
      }
    }
  });

  await check('settings is an independent page with return, browser history and untouched active timing', dataset(), async (run,_imp,{protocol}) => {
    await size(protocol,1440);
    await click(run,protocol,'[data-page=today]');
    await click(run,protocol,'#dataMenuToggle');
    assert.equal(await run("return document.querySelector('.page.active').id"),'settings');
    assert.equal(await run("return getComputedStyle($('today')).display"),'none');
    assert.equal(await run("return getComputedStyle($('home')).display"),'none');
    assert.equal(await run("return getComputedStyle($('dataPanel')).position"),'static');
    assert.deepEqual(await run("return [document.querySelectorAll('.page.active').length,$('dataMenuToggle').getAttribute('aria-current')]"),[1,'page']);
    await click(run,protocol,'#closeSettings');
    assert.equal(await run("return document.querySelector('.page.active').id"),'today');
    await run("page('home');run(d.tasks[0]);window.__timerBefore=__rawGet('activeTimer')");
    await click(run,protocol,'#dataMenuToggle');
    assert.equal(await run("return $('floatingTimer').classList.contains('hide')"),false);
    assert.equal(await run("return __rawGet('activeTimer')===__timerBefore"),true);
    await run("history.back();await new Promise(resolve=>setTimeout(resolve,80))");
    assert.equal(await run("return document.querySelector('.page.active').id"),'home');
    assert.equal(await run("return __rawGet('activeTimer')===__timerBefore"),true);
  });

  await check('compact add dialog fits one screen and keeps its action visible for long descriptions', dataset(), async (run,_imp,{protocol}) => {
    for(const [width,height] of [[1440,1000],[375,667],[320,568],[700,400]]){
      await size(protocol,width,height);await run("page('tasks')");
      await click(run,protocol,'#newTask');
      assert.deepEqual(await run("return [$('activityOptions').open,$('saveActivity').textContent,$('activityCategory')]"),[false,'添加',null]);
      assert.ok(await run("const r=document.querySelector('.activity-dialog').getBoundingClientRect();return r.height<400&&r.top>=0&&r.bottom<=innerHeight"));
      assert.deepEqual(await run("return [$('requirementsOptions').open,$('mins'),$('environment')]"),[false,null,null]);
      await noOverflow(run);
      if(width===1440){await run("$('name').value='读书';document.activeElement.blur()");await shot(run,protocol,'11-add-compact-light')}
      if(width===375)await shot(run,protocol,'11-add-compact-mobile');
      await click(run,protocol,'#descriptionToggle');
      await run("$('desc').value='说明内容与换行\\n'.repeat(50);$('desc').dispatchEvent(new Event('input'))");
      assert.ok(await run("const r=$('saveActivity').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.height>=44"));
      assert.ok(await run("return getComputedStyle($('desc')).resize==='none'&&$('desc').scrollHeight<=$('desc').clientHeight"));
      await noOverflow(run);await key(protocol,'Escape','Escape',27);
    }
  });

  const earlierCategories=dataset();
  ['study','study','life','exercise','work'].forEach((category,i)=>earlierCategories.tasks[i].activityCategory=category);
  earlierCategories.tasks[0].category={custom:'保留旧分类数据'};
  await check('library has no category controls and preserves earlier metadata through edits and backups', earlierCategories, async (run,_imp,{protocol,reload}) => {
    await size(protocol,1440);await run("page('tasks')");
    assert.deepEqual(await run("return [$('categoryTabs'),$('activityCategory'),$('libraryFilters'),document.querySelectorAll('.activity-item').length]"),[null,null,null,5]);
    assert.equal(await run('return __writes.length'),0);
    await shot(run,protocol,'14-simple-library-light');
    await click(run,protocol,'.activity-item:first-child [data-task-action=more]');
    await click(run,protocol,'#activityMenuEdit');
    await run("$('name').value='读下一章'");await click(run,protocol,'#saveActivity');
    assert.deepEqual(await run("return [d.tasks[0].activityCategory,d.tasks[0].category]"),['study',{custom:'保留旧分类数据'}]);
    await click(run,protocol,'#newTask');await run("$('name').value='新活动'");await click(run,protocol,'#saveActivity');
    assert.equal(await run("return Object.hasOwn(d.tasks.at(-1),'activityCategory')"),false);
    await run("page('settings');$('export').click()");
    assert.deepEqual(await run("const backup=JSON.parse(await __downloads.at(-1).blob.text());return [backup.tasks[0].activityCategory,backup.tasks[0].category,backup.tasks.length]"),['study',{custom:'保留旧分类数据'},6]);
    await reload();await run("page('tasks')");
    assert.deepEqual(await run("return [d.tasks[0].activityCategory,d.tasks[0].name,d.tasks.length]"),['study','读下一章',6]);
    await size(protocol,375,667);await noOverflow(run);await shot(run,protocol,'14-simple-library-mobile');
    await run("setTheme('dark')");await shot(run,protocol,'14-simple-library-dark-mobile');
  });

  await check('collapsed search supports focus, Escape, no results and navigation without hidden filters or writes', dataset(), async (run,_imp,{protocol}) => {
    await run("page('tasks')");const before=await run("return __rawGet('whatToDoData')");
    for(const [width,height] of [[1440,1000],[375,667],[320,568],[240,600]]){
      await size(protocol,width,height);
      assert.ok(await run("return $('librarySearch').classList.contains('hide')&&$('toggleActivitySearch').getAttribute('aria-expanded')==='false'"));
      await click(run,protocol,'#toggleActivitySearch');assert.equal(await run('return document.activeElement.id'),'taskSearch');
      await run("$('taskSearch').value='接着上次';$('taskSearch').dispatchEvent(new Event('input'))");
      assert.equal(await run("return document.querySelector('.activity-item h3').textContent"),'读书');
      await click(run,protocol,'.activity-item [data-task-action=more]');
      await key(protocol,'Escape','Escape',27);
      assert.ok(await run("return !$('librarySearch').classList.contains('hide')&&$('taskSearch').value==='接着上次'"));
      await key(protocol,'Escape','Escape',27);
      assert.deepEqual(await run("return [document.activeElement.id,$('taskSearch').value,document.querySelectorAll('.activity-item').length]"),['toggleActivitySearch','',5]);
      await click(run,protocol,'#toggleActivitySearch');await run("$('taskSearch').value='找不到';$('taskSearch').dispatchEvent(new Event('input'))");
      await click(run,protocol,'#taskList .empty-state .secondary');
      assert.ok(await run("return $('librarySearch').classList.contains('hide')&&document.querySelectorAll('.activity-item').length===5"));
      await click(run,protocol,'#toggleActivitySearch');await run("$('taskSearch').value='Python';$('taskSearch').dispatchEvent(new Event('input'))");
      await click(run,protocol,'#closeActivitySearch');
      await click(run,protocol,'#toggleActivitySearch');await run("$('taskSearch').value='读';$('taskSearch').dispatchEvent(new Event('input'))");
      await click(run,protocol,'[data-page=home]');await click(run,protocol,'[data-page=tasks]');
      assert.deepEqual(await run("return [$('librarySearch').classList.contains('hide'),$('taskSearch').value,document.querySelectorAll('.activity-item').length]"),[true,'',5]);
      await noOverflow(run);
    }
    assert.equal(await run("return __rawGet('whatToDoData')"),before);assert.equal(await run('return __writes.length'),0);
    await run("d.tasks=d.tasks.slice(0,1);tasks()");
    await click(run,protocol,'#toggleActivitySearch');
    await click(run,protocol,'.activity-item [data-task-action=more]');await click(run,protocol,'#activityMenuDelete');
    await click(run,protocol,'#confirmAccept');
    assert.deepEqual(await run("return [d.tasks.length,$('librarySearch').classList.contains('hide'),$('toggleActivitySearch').classList.contains('hide')]"),[0,true,true]);
  });

  console.log(count+' minimal UI browser scenarios passed. Screenshots: '+out);
};
