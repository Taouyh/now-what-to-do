const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async(scenario,fixture)=>{
  let count=0;
  const dataSet=()=>{
    const d=fixture();d.completed=[];
    d.tasks=[1,8,9,25,26,45,46,60,61,90,91,1440].map(minutes=>({...d.tasks[0],id:'t'+minutes,minutes,name:'中文 <活动> & \' " '+minutes}));
    d.tasks.push({...d.tasks[0],id:'quiet',minutes:1,env:'quiet'},{...d.tasks[0],id:'computer',minutes:1,computer:true},{...d.tasks[0],id:'disabled',minutes:1,enabled:false});return d;
  };
  const check=async(name,fn)=>{const d=dataSet();await scenario(name,{whatToDoData:JSON.stringify(d)},{},async(run,imp,helpers)=>fn(run,imp,helpers,d));count++;};
  const click=async(run,protocol,selector)=>{
    const p=await run(`const e=document.querySelector(${JSON.stringify(selector)});let r=e.getBoundingClientRect();if(r.top<64||r.bottom>innerHeight)e.scrollIntoView({block:'center'});r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}`);
    await protocol('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});
    await protocol('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});
    await run('for(let i=0;i<90&&cancelRecommendationReveal;i++)await new Promise(resolve=>setTimeout(resolve,20))');
  };
  const input=async(run,protocol,value)=>{
    await run("$('customMinutes').focus();$('customMinutes').select()");
    await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
    await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
    if(value)await protocol('Input.insertText',{text:value});
  };
  const choose=async(run,protocol)=>{await click(run,protocol,'#times [data-v=custom]');await click(run,protocol,'#envs [data-v=noisy]')};
  const shot=async(protocol,name)=>{
    if(!process.env.CUSTOM_SCREENSHOT_DIR)return;
    fs.mkdirSync(process.env.CUSTOM_SCREENSHOT_DIR,{recursive:true});
    const result=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(process.env.CUSTOM_SCREENSHOT_DIR,name+'.png'),Buffer.from(result.data,'base64'));
  };

  await check('custom starts empty, keeps a session draft, and refresh resets only session choices',async(run,_imp,{protocol,reload},d)=>{
    const before=await run("return __rawGet('whatToDoData')");
    assert.deepEqual(await run("return [document.querySelectorAll('#times .on,#envs .on').length,$('customMinutes').value,$('random').disabled]"),[0,'',true]);
    await click(run,protocol,'#times [data-v=custom]');
    assert.deepEqual(await run("return [$('customTimeField').classList.contains('hide'),$('customMinutes').value,$('random').disabled,document.activeElement.id]"),[false,'',true,'customMinutes']);
    assert.match(await run("return $('customTimeError').textContent"),/1–1440/);
    await input(run,protocol,'25');assert.equal(await run('return cur'),null);
    await click(run,protocol,'#envs [data-v=noisy]');assert.equal(await run('return time'),25);
    await run("page('tasks');page('home')");assert.equal(await run('return selectionReady()'),true);
    assert.equal(await run("return __rawGet('whatToDoData')"),before);
    await reload();assert.deepEqual(await run("return [timeChosen,envChosen,cur,$('customMinutes').value,$('customTimeField').classList.contains('hide'),$('random').disabled]"),[false,false,null,'',true,true]);
    await click(run,protocol,'#times [data-v=custom]');assert.equal(await run("return $('customMinutes').value"),'');
    assert.deepEqual(await run('return [d.tasks,d.completed]'),[d.tasks,d.completed]);assert.equal(await run('return __writes.length'),0);
  });

  await check('real typing of 8, 25, 45, 90 and boundaries respects duration, environment, computer and enabled limits',async(run,_imp,{protocol},d)=>{
    await choose(run,protocol);
    for(const minutes of [8,25,45,90,1,1440]){
      await input(run,protocol,String(minutes));assert.equal(await run('return time'),minutes);
      assert.deepEqual(await run('return d.tasks.filter(ok).map(t=>t.id)'),d.tasks.filter(t=>t.id.startsWith('t')&&t.minutes<=minutes).map(t=>t.id));
      assert.equal(await run("return $('customMinutes').getAttribute('aria-invalid')"),'false');
      for(const selector of ['#random','#again','#random']){
        const previous=await run('return cur.id');await click(run,protocol,selector);
        assert.ok(await run('return ok(cur)'));if(minutes>1)assert.notEqual(await run('return cur.id'),previous);
      }
      if(minutes===1)assert.match(await run("return $('recommendationHint').textContent"),/只有这一项/);
    }
    assert.deepEqual(await run('return [d.tasks,d.completed]'),[d.tasks,d.completed]);assert.equal(await run('return __writes.length'),0);
    assert.match(await run("return $('rec').querySelector('h2').textContent"),/<活动>/);assert.equal(await run("return $('rec').querySelectorAll('活动').length"),0);
  });

  await check('every invalid input removes old buttons, blocks stale starts and reports an accessible error',async(run,_imp,{protocol})=>{
    await choose(run,protocol);
    for(const value of ['', '0','-5','1.5','abc','1441','9999999999999999999','1e2','<img src=x onerror=alert(1)>']){
      await input(run,protocol,'25');await run("window.__oldStart=$('start')");await input(run,protocol,value);
      assert.equal(await run("return $('customMinutes').value"),value);
      assert.deepEqual(await run("return [cur,$('random').disabled,$('rec').querySelector('#start'),$('customMinutes').getAttribute('aria-invalid')]"),[null,true,null,'true']);
      assert.match(await run("return $('customTimeError').textContent"),/正整数/);
      await run("$('random').click();__oldStart.click()");assert.equal(await run("return __rawGet('activeTimer')"),null);
    }
    assert.equal(await run('return __writes.length'),0);assert.equal(await run('return d.completed.length'),0);
  });

  await check('input and environment changes revalidate immediately, retain valid cards and show true empty states',async(run,_imp,{protocol})=>{
    await choose(run,protocol);await input(run,protocol,'90');await run('cur=d.tasks.find(t=>t.id==="t90");random({keepCurrent:true})');
    await input(run,protocol,'25');assert.notEqual(await run('return cur.id'),'t90');assert.ok(await run('return ok(cur)'));
    const id=await run('return cur.id');await run("$('customMinutes').value='90';$('customMinutes').dispatchEvent(new Event('input',{bubbles:true}))");assert.equal(await run('return cur.id'),id);
    await click(run,protocol,'#envs [data-v=class]');assert.equal(await run('return cur'),null);assert.match(await run("return $('rec').textContent"),/没有符合当前条件/);
    await click(run,protocol,'#envs [data-v=noisy]');await click(run,protocol,'#computerReady');await run('cur=d.tasks.find(t=>t.id==="computer");random({keepCurrent:true})');
    await click(run,protocol,'#computerReady');assert.notEqual(await run('return cur.id'),'computer');
    await run('d.tasks=d.tasks.filter(t=>t.minutes>8)');await input(run,protocol,'8');
    assert.equal(await run('return cur'),null);assert.match(await run("return $('rec').textContent"),/没有符合当前条件/);assert.equal(await run("return $('rec').querySelector('#start')"),null);
  });

  await check('preset switching hides errors and preserves the 60-minute ceiling and session draft',async(run,_imp,{protocol})=>{
    await choose(run,protocol);await input(run,protocol,'90');
    for(const minutes of [5,10,15,30,60]){
      await click(run,protocol,`#times [data-v="${minutes}"]`);
      assert.deepEqual(await run("return [time,$('customTimeField').classList.contains('hide'),selectionReady()]"),[minutes,true,true]);
      assert.ok(await run('return d.tasks.filter(ok).every(t=>t.minutes<=time)'));
    }
    assert.equal(await run('return d.tasks.filter(ok).some(t=>t.minutes===61)'),false);
    await click(run,protocol,'#times [data-v=custom]');assert.equal(await run('return time'),90);assert.equal(await run("return $('customMinutes').value"),'90');
    await input(run,protocol,'bad');await click(run,protocol,'#times [data-v="30"]');assert.equal(await run("return $('random').disabled"),false);
    await click(run,protocol,'#times [data-v=custom]');assert.equal(await run("return $('customMinutes').value"),'bad');assert.equal(await run("return $('random').disabled"),true);
  });

  await check('custom budget never alters the task timer; manual selection remains independent',async(run,_imp,{protocol})=>{
    await choose(run,protocol);await input(run,protocol,'90');await run('cur=d.tasks.find(t=>t.id==="t25");random({keepCurrent:true})');
    await click(run,protocol,'#start');assert.equal(await run('return timerState().plannedDurationMs'),25*60000);
    await run("page('home');pauseTimer();window.__timerBefore=__rawGet('activeTimer')");await input(run,protocol,'8');await input(run,protocol,'invalid');
    assert.equal(await run("return __rawGet('activeTimer')===__timerBefore"),true);
    await run('discardTimer()');await click(run,protocol,'#browse');
    await click(run,protocol,'#taskList article:nth-child(10) [data-task-action=start]');assert.equal(await run('return timerState().plannedDurationMs'),90*60000);assert.equal(await run('return d.completed.length'),0);
  });

  await check('theme, failed preset writes and imports keep the runtime budget and existing backup format safe',async(run,importData,{protocol},d)=>{
    await choose(run,protocol);await input(run,protocol,'25');await click(run,protocol,'#theme');
    assert.deepEqual(await run('return [time,d.preferences.time]'),[25,10]);
    await run('__faults.write=true');await click(run,protocol,'#times [data-v="60"]');assert.deepEqual(await run('return [customTime,time,ok(cur)]'),[true,25,true]);
    await run('delete __faults.write');await click(run,protocol,'#computerReady');assert.equal(await run('return time'),25);
    assert.equal(await run("return JSON.parse(__rawGet('whatToDoData')).preferences.time"),10);assert.ok(await run('return validateData(d)===d'));
    const incoming=structuredClone(d);incoming.preferences={time:60,env:'quiet',computerReady:true};incoming.theme='dark';
    await importData(incoming);await run("$('confirmAccept').click()");
    assert.deepEqual(await run('return [time,env,computerReady,d.preferences.time]'),[25,'quiet',true,60]);assert.ok(await run('return ok(cur)'));
    assert.deepEqual(await run('return [d.tasks,d.completed]'),[d.tasks,d.completed]);
  });

  await check('keyboard and narrow layouts keep custom input and recommendation actions usable',async(run,_imp,{protocol})=>{
    await run("document.querySelector('#times [data-v=custom]').focus()");
    await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r'});await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});
    assert.equal(await run('return customTime'),true);assert.equal(await run('return document.activeElement.id'),'customMinutes');
    await click(run,protocol,'#envs [data-v=noisy]');
    for(const [width,height] of [[1366,768],[1024,600],[375,667],[320,568],[240,600]]){
      await protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
      await input(run,protocol,'25');await click(run,protocol,'#random');await run('await new Promise(requestAnimationFrame)');
      assert.ok(await run('return document.documentElement.scrollWidth<=innerWidth'));
      const before=await run('return scrollY');await run("$('random').click();for(let i=0;i<90&&cancelRecommendationReveal;i++)await new Promise(resolve=>setTimeout(resolve,20))");assert.equal(await run('return scrollY'),before);
      assert.ok(await run("return $('start').getBoundingClientRect().top>$('random').getBoundingClientRect().bottom"));
      assert.equal(await run("return $('customMinutes').labels[0].textContent.includes('分钟')"),true);
      if(width===1366||width===375)await shot(protocol,'custom-'+width);
    }
  });
  console.log(count+' custom-time browser scenarios passed.');
};
