const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async(scenario,fixture)=>{
  let count=0;
  const dataSet=()=>{
    const d=fixture();d.completed=[];d.preferences={time:30,env:'quiet',computerReady:false};
    d.tasks=[{...d.tasks[0],id:'read',name:'读几页感兴趣的书',description:'中文 & English，保留 <特殊字符>。',minutes:10,env:'quiet'}, {...d.tasks[0],id:'write',name:'写一段今天的想法',minutes:20,env:'quiet'}];return d;
  };
  const check=async(name,fn,alter)=>{const d=dataSet();alter?.(d);await scenario(name,{whatToDoData:JSON.stringify(d)},{},async(run,imp,helpers)=>fn(run,helpers,d));count++;};
  const settle=run=>run('await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)');
  const wait=run=>run('for(let i=0;i<90&&cancelRecommendationReveal;i++)await new Promise(resolve=>setTimeout(resolve,20));if(cancelRecommendationReveal)throw Error("reveal did not settle")');
  const install=run=>run("window.__calls=[];window.__testScroll=window.scrollTo.bind(window);window.scrollTo=function(o){__calls.push({options:o,before:scrollY,full:$('rec').getBoundingClientRect().toJSON()});return __testScroll(o)};window.__hero=document.querySelector('#home .hero');window.__panel=document.querySelector('.home-workspace')");
  const snapshot=run=>run("return {scroll:scrollY,hero:__hero.getBoundingClientRect().top+scrollY,panel:__panel.getBoundingClientRect().top+scrollY}");
  const prepare=async(run,selector)=>run(`const e=document.querySelector(${JSON.stringify(selector)});let r=e.getBoundingClientRect();if(r.top<64||r.bottom>innerHeight){__testScroll({top:scrollY+r.top-80,behavior:'instant'});await new Promise(requestAnimationFrame);r=e.getBoundingClientRect()}return{x:r.left+r.width/2,y:r.top+r.height/2}`);
  const click=async(run,protocol,selector)=>{
    const p=await prepare(run,selector);
    await protocol('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});
    await protocol('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});
  };
  const visible=async run=>assert.ok(await run("const t=$('recommendedTaskName').getBoundingClientRect(),s=$('start').getBoundingClientRect(),nav=document.querySelector('header').getBoundingClientRect();return t.top>=nav.bottom+11&&s.bottom<=innerHeight-11"),JSON.stringify(await run("return {name:$('recommendedTaskName').getBoundingClientRect().toJSON(),start:$('start').getBoundingClientRect().toJSON(),height:innerHeight,scrollY}")));
  const setup=async(run,protocol,width,height)=>{
    await protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});await settle(run);
    await run('await document.fonts.ready;scrollTo(0,0);await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)');await install(run);
    for(const selector of ['#times [data-v="30"]','#envs [data-v=quiet]']){
      await prepare(run,selector);const before=await snapshot(run);await click(run,protocol,selector);await settle(run);
      assert.deepEqual(await snapshot(run),before);assert.deepEqual(await run('return __calls'),[]);
    }
  };
  for(const [width,height] of [[1366,768],[1024,600],[375,667],[320,568],[240,600],[700,300],[240,220]]){
    await check('explicit reveal '+width+'x'+height,async(run,{protocol},d)=>{
      await setup(run,protocol,width,height);const raw=await run("return __rawGet('whatToDoData')"),original=await snapshot(run);
      await click(run,protocol,'#random');await wait(run);await visible(run);
      const calls=await run('return __calls');assert.ok(calls.length<=1);
      if(calls.length){
        assert.equal(calls[0].options.behavior,'smooth');
        if(calls[0].full.height<=height-88)assert.ok(Math.abs(calls[0].options.top-(calls[0].before+calls[0].full.bottom-(height-12)))<1);
        assert.ok(await run('return scrollY<document.scrollingElement.scrollHeight-document.scrollingElement.clientHeight'));
      }
      const id=await run('return cur.id');await click(run,protocol,'#again');await wait(run);await visible(run);assert.notEqual(await run('return cur.id'),id);
      const after=await snapshot(run);assert.equal(after.hero,original.hero);assert.equal(after.panel,original.panel);
      assert.equal(await run("return __rawGet('whatToDoData')"),raw);assert.deepEqual(await run('return [d.tasks,d.completed]'),[d.tasks,d.completed]);
      if(process.env.RECOMMENDATION_VIEW_SHOTS&&[1366,375].includes(width)){
        fs.mkdirSync(process.env.RECOMMENDATION_VIEW_SHOTS,{recursive:true});const shot=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(process.env.RECOMMENDATION_VIEW_SHOTS,'result-'+width+'.png'),Buffer.from(shot.data,'base64'));
      }
      await click(run,protocol,'#start');assert.equal(await run('return timerState().taskId'),await run('return cur.id'));assert.equal(await run("return $('timer').classList.contains('hide')"),false);
      assert.equal(await run('return d.completed.length'),0);
    },d=>{if(width===240)for(const t of d.tasks)t.name='中文长任务 <标签> 与特殊字符 '.repeat(30)});
  }
  await check('a fully visible result does not cause any extra scrolling',async(run,{protocol})=>{
    await setup(run,protocol,1366,1200);const before=await snapshot(run);await click(run,protocol,'#random');await wait(run);await visible(run);
    assert.deepEqual(await snapshot(run),before);assert.deepEqual(await run('return __calls'),[]);
    await click(run,protocol,'#again');await wait(run);await visible(run);assert.deepEqual(await run('return __calls'),[]);
  });
  await check('keyboard activation reveals a new result without moving focus',async(run,{protocol})=>{
    await setup(run,protocol,1024,600);await prepare(run,'#random');await run("$('random').focus({preventScroll:true})");
    await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});
    await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await wait(run);await visible(run);assert.equal(await run('return document.activeElement.id'),'random');
  });
  await check('custom input and empty candidates remain passive, including an explicit empty draw',async(run,{protocol})=>{
    await setup(run,protocol,1366,768);
    for(const selector of ['#computerReady','#times [data-v=custom]']){
      const before=await snapshot(run);await click(run,protocol,selector);await settle(run);assert.deepEqual(await snapshot(run),before);
    }
    const before=await snapshot(run);await protocol('Input.insertText',{text:'25'});await settle(run);assert.deepEqual(await snapshot(run),before);assert.deepEqual(await run('return __calls'),[]);
    await click(run,protocol,'#envs [data-v=class]');assert.equal(await run('return cur'),null);
    const empty=await snapshot(run);await click(run,protocol,'#random');await settle(run);assert.deepEqual(await snapshot(run),empty);assert.deepEqual(await run('return __calls'),[]);
    assert.match(await run("return $('rec').textContent"),/没有符合当前条件/);
  });
  for(const input of ['wheel','keyboard','touch'])await check('manual '+input+' interrupts one native scroll without later pullback',async(run,{protocol})=>{
    await setup(run,protocol,375,667);await click(run,protocol,'#random');
    assert.equal(await run('return typeof cancelRecommendationReveal'),'function');
    if(input==='wheel')await protocol('Input.dispatchMouseEvent',{type:'mouseWheel',x:20,y:300,deltaX:0,deltaY:-180});
    if(input==='keyboard'){
      await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowUp',code:'ArrowUp',windowsVirtualKeyCode:38});await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowUp',code:'ArrowUp',windowsVirtualKeyCode:38});
    }
    if(input==='touch'){
      await protocol('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
      await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:10,y:200}]});await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
    await settle(run);assert.equal(await run('return cancelRecommendationReveal'),null);await run('await new Promise(resolve=>setTimeout(resolve,250))');
    const before=await run('return scrollY'),calls=await run('return __calls.length');await run('await new Promise(resolve=>setTimeout(resolve,1250))');
    assert.equal(await run('return scrollY'),before);assert.equal(await run('return __calls.length'),calls);assert.equal(calls,2);
    assert.equal(await run('return __calls[1].options.behavior'),'instant');
  });
  await check('reduced-motion preference uses a single immediate minimal scroll',async(run,{protocol})=>{
    await protocol('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await setup(run,protocol,1024,600);await click(run,protocol,'#random');await settle(run);await visible(run);
    assert.equal(await run('return __calls.length'),1);assert.equal(await run('return __calls[0].options.behavior'),'instant');assert.equal(await run('return cancelRecommendationReveal'),null);
  });
  console.log(count+' recommendation-view browser scenarios passed.');
};
