const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async(scenario,fixture)=>{
  let count=0;
  const dataSet=()=>{
    const d=fixture();d.completed=[];d.preferences={time:30,env:'quiet',computerReady:false};
    d.tasks=[{...d.tasks[0],id:'short',name:'读书',minutes:10,env:'quiet',description:'读几页，记下一点收获。'},{...d.tasks[0],id:'equal',name:'练习中文与 English',minutes:30,env:'quiet'},{...d.tasks[0],id:'long',name:'只能手动选择的长任务',minutes:60,env:'noisy',computer:true}];return d;
  };
  const check=async(name,fn,alter)=>{const d=dataSet();alter?.(d);await scenario(name,{whatToDoData:JSON.stringify(d)},{},async(run,imp,helpers)=>fn(run,imp,helpers,d));count++;};
  const waitReveal=run=>run('for(let i=0;i<90&&cancelRecommendationReveal;i++)await new Promise(resolve=>setTimeout(resolve,20))');
  const click=async(run,protocol,selector)=>{
    const p=await run(`const e=document.querySelector(${JSON.stringify(selector)});let r=e.getBoundingClientRect();if(r.top<64||r.bottom>innerHeight)e.scrollIntoView({block:'center'});r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}`);
    await protocol('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});
    await protocol('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});
    await waitReveal(run);
  };
  const select=async(run,protocol,time=30,env='quiet')=>{await click(run,protocol,`#times [data-v="${time}"]`);await click(run,protocol,`#envs [data-v="${env}"]`)};
  const shot=async(protocol,name)=>{if(!process.env.START_SCREENSHOT_DIR)return;fs.mkdirSync(process.env.START_SCREENSHOT_DIR,{recursive:true});const r=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(process.env.START_SCREENSHOT_DIR,name+'.png'),Buffer.from(r.data,'base64'))};

  await check('fresh and refreshed pages never restore choices or draw early, while saved data survives',async(run,_imp,{reload,protocol},d)=>{
    const before=await run("return __rawGet('whatToDoData')");
    assert.deepEqual(await run("return [document.querySelectorAll('#times .on,#envs .on').length,$('random').disabled,cur,selectionReady()]"),[0,true,null,false]);
    await run('window.__draws=0;const draw=Math.random;Math.random=()=>{__draws++;return draw()};random()');assert.equal(await run('return __draws'),0);
    await click(run,protocol,'#times [data-v="30"]');assert.equal(await run('return cur'),null);
    await run("$('random').click();$('computerReady').click()");assert.equal(await run('return __draws'),0);
    await click(run,protocol,'#envs [data-v="quiet"]');assert.ok(await run('return !!cur'));
    assert.deepEqual(await run('return d.completed'),d.completed);
    await reload();assert.deepEqual(await run("return [timeChosen,envChosen,cur,$('random').disabled]"),[false,false,null,true]);
    assert.deepEqual(await run('return d.tasks'),d.tasks);assert.equal(await run('return __writes.length'),0);
    assert.equal(JSON.parse(before).preferences.time,await run('return time'));
  });

  await check('desktop controls stay in place when recommendations grow below them',async(run,_imp,{protocol})=>{
    for(const [width,height] of [[1366,768],[1024,600],[1280,720]]){
      await protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      await run('await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);scrollTo(0,0);await new Promise(requestAnimationFrame)');
      const before=await run("return ['#home .hero','.home-workspace','#random','#browse'].map(s=>document.querySelector(s).getBoundingClientRect().top)");
      await select(run,protocol);await run('await new Promise(requestAnimationFrame)');
      assert.deepEqual(await run("return ['#home .hero','.home-workspace','#random','#browse'].map(s=>document.querySelector(s).getBoundingClientRect().top)"),before);
      assert.ok(await run("return ['random','browse','start'].every(id=>{const r=$(id).getBoundingClientRect();return r.width>100&&r.height>=42})"));
      assert.equal(await run('return scrollY'),0);
      assert.ok(await run("const a=$('random').getBoundingClientRect(),b=$('browse').getBoundingClientRect();return Math.abs(a.top-b.top)<1&&a.right<b.left"));
      if(width===1366)await shot(protocol,'start-desktop');
    }
  });

  await check('both recommendation buttons avoid repeats and cannot escape time/environment/computer limits',async(run,_imp,{protocol},d)=>{
    await select(run,protocol);const raw=await run("return __rawGet('whatToDoData')");
    for(let i=0;i<8;i++){
      const previous=await run('return cur.id');await click(run,protocol,i%2?'#again':'#random');
      const next=await run('return {id:cur.id,ok:ok(cur)}');assert.notEqual(next.id,previous);assert.ok(next.ok);assert.ok(['short','equal'].includes(next.id));
    }
    assert.equal(await run("return __rawGet('whatToDoData')"),raw);assert.deepEqual(await run('return d.tasks'),d.tasks);assert.equal(await run('return d.completed.length'),0);
    await run("window.__stale=$('start')");await click(run,protocol,'#envs [data-v="class"]');
    assert.equal(await run('return cur'),null);assert.match(await run("return $('rec').textContent"),/没有符合当前条件的任务/);
    await run('__stale.click()');assert.equal(await run("return __rawGet('activeTimer')"),null);
    await click(run,protocol,'#envs [data-v="quiet"]');await click(run,protocol,'#times [data-v="5"]');
    assert.equal(await run('return cur'),null);assert.equal(await run("return $('rec').querySelector('#start')"),null);
  });

  await check('manual entry is available with no choices and preserves the task library start behavior',async(run,_imp,{protocol})=>{
    await click(run,protocol,'#browse');assert.equal(await run("return document.querySelector('.page.active').id"),'tasks');
    assert.equal(await run("return $('taskList').querySelectorAll('article').length"),3);
    await click(run,protocol,"#taskList article:nth-child(3) [data-task-action=start]");
    assert.deepEqual(await run("return [timerState().taskId,timerState().plannedDurationMs,$('timer').classList.contains('hide')]"),['long',3600000,false]);
    assert.equal(await run('return d.completed.length'),0);
  });

  await check('starting and returning through pages retains valid session choices and does not reset the timer',async(run,_imp,{protocol})=>{
    await select(run,protocol);const id=await run('return cur.id');await click(run,protocol,'#start');
    const raw=await run("return __rawGet('activeTimer')");assert.equal(await run('return timerState().taskId'),id);
    await click(run,protocol,'[data-page=today]');await click(run,protocol,'[data-page=home]');
    assert.equal(await run('return selectionReady()'),true);assert.equal(await run('return ok(cur)'),true);
    assert.equal(await run("return __rawGet('activeTimer')"),raw);assert.equal(await run('return d.completed.length'),0);
  });

  await check('narrow and short windows keep controls readable and results in normal flow',async(run,_imp,{protocol})=>{
    for(const [width,height] of [[375,667],[320,568],[240,600],[700,400]]){
      await protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await select(run,protocol);
      await run("$('random').click()");await waitReveal(run);
      assert.ok(await run("return $('recommendedTaskName').getBoundingClientRect().top>=76&&$('start').getBoundingClientRect().bottom<=innerHeight-11"));
      assert.ok(await run('return document.documentElement.scrollWidth<=innerWidth'));
      assert.ok(await run("return ['times','envs'].every(id=>[...$(id).querySelectorAll('button')].every(b=>b.getBoundingClientRect().height>=40))"));
      assert.equal(await run("return getComputedStyle($('start')).position"),'static');
      assert.equal(await run("return $('rec').querySelector('.recommendation-details').open"),false);
      if(width===375)await shot(protocol,'start-mobile');
    }
  },d=>{d.tasks[0].name='很长的个人活动名称 '.repeat(40);d.tasks[1].name=d.tasks[0].name;d.tasks[0].description='很长的说明\n'.repeat(100);d.tasks[1].description=d.tasks[0].description});

  await check('keyboard choices, failed preference writes and hostile text preserve selection and rendering safety',async(run,_imp,{protocol})=>{
    await run("document.querySelector('#times [data-v=\"30\"]').focus()");
    await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r'});await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});
    assert.equal(await run('return timeChosen'),true);assert.equal(await run('return cur'),null);
    await click(run,protocol,'#envs [data-v="quiet"]');const id=await run('return cur.id');
    await run('__faults.write=true');await click(run,protocol,'#times [data-v="5"]');
    assert.deepEqual(await run('return [time,cur.id,ok(cur)]'),[30,id,true]);
    await run('delete __faults.write');await click(run,protocol,'#again');
    assert.deepEqual(await run("return [document.querySelectorAll('[data-start-probe]').length,window.__startExecuted||0]"),[0,0]);
    assert.ok(await run("return $('rec').querySelector('h2').textContent.includes('<img')"));
  },d=>{for(const t of d.tasks.slice(0,2)){t.name='<img data-start-probe src=x onerror="window.__startExecuted=1">中文 & \' "';t.description=t.name+'\n保留说明'}});
  console.log(count+' quick-start browser scenarios passed.');
};
