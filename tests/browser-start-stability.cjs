const assert=require('node:assert/strict');
// Real layout/scroll checks use the isolated Chrome driver, never a user profile.
module.exports=async(scenario,fixture)=>{
  let count=0;
  const dataSet=()=>{
    const d=fixture();d.completed=[];d.preferences={time:30,env:'quiet',computerReady:false};
    d.tasks=[{...d.tasks[0],id:'read',minutes:10,env:'quiet'}, {...d.tasks[0],id:'write',minutes:20,env:'quiet'}, {...d.tasks[0],id:'computer',minutes:20,env:'quiet',computer:true}, {...d.tasks[0],id:'noisy',minutes:10,env:'noisy'}];return d;
  };
  const settle=run=>run('await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)');
  const install=run=>run("window.__scrollCalls=[];for(const name of ['scrollIntoView','scroll']){const original=Element.prototype[name];Element.prototype[name]=function(...args){__scrollCalls.push(name);return original.apply(this,args)}}for(const name of ['scrollTo','scrollBy']){const original=window[name];window[name]=function(...args){__scrollCalls.push(name);return original.apply(this,args)}}window.__focusCalls=[];const focus=HTMLElement.prototype.focus;HTMLElement.prototype.focus=function(options){__focusCalls.push({id:this.id,options});return focus.call(this,options)};window.__hero=document.querySelector('#home .hero');window.__panel=document.querySelector('.home-workspace')");
  const snapshot=run=>run("const h=__hero.getBoundingClientRect(),p=__panel.getBoundingClientRect();return {scroll:scrollY,hero:h.top+scrollY,panel:p.top+scrollY,font:getComputedStyle(__hero.querySelector('h1')).fontSize,padding:getComputedStyle(__panel).paddingTop,same:__hero===document.querySelector('#home .hero')&&__panel===document.querySelector('.home-workspace')}");
  const stable=async(run,before)=>{
    await settle(run);const after=await snapshot(run);
    assert.ok(Math.abs(after.scroll-before.scroll)<.6,JSON.stringify({before,after}));
    assert.ok(Math.abs(after.hero-before.hero)<.6,JSON.stringify({before,after}));
    assert.ok(Math.abs(after.panel-before.panel)<.6,JSON.stringify({before,after}));
    assert.equal(after.font,before.font);assert.equal(after.padding,before.padding);assert.ok(after.same);
    assert.deepEqual(await run('return __scrollCalls'),[]);
  };
  // Moving the viewport to an offscreen control is an explicit test/user action.
  // Application-induced scrolling is measured only after that preparation.
  const point=async(run,selector)=>run(`const e=document.querySelector(${JSON.stringify(selector)});let r=e.getBoundingClientRect();if(r.top<64||r.bottom>innerHeight){__scrollCalls=[];window.scrollTo(0,scrollY+r.top-80);__scrollCalls=[];await new Promise(requestAnimationFrame);r=e.getBoundingClientRect()}return{x:r.left+r.width/2,y:r.top+r.height/2}`);
  const click=async(run,protocol,selector)=>{
    const p=await point(run,selector),before=await snapshot(run);
    await protocol('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});
    await protocol('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});
    await stable(run,before);
  };
  for(const [width,height] of [[1366,768],[1024,600],[375,667],[320,568]])for(const theme of ['light','dark']){
    const d=dataSet();await scenario('stable conditions '+width+'x'+height+' '+theme,{whatToDoData:JSON.stringify(d)},{},async(run,_imp,{protocol})=>{
      await protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
      await run(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);await settle(run);await install(run);
      const initial=await snapshot(run);assert.equal(await run('return selectionReady()'),false);
      await click(run,protocol,'#times [data-v="30"]');assert.equal(await run('return cur'),null);
      await click(run,protocol,'#envs [data-v=quiet]');assert.equal(await run('return ok(cur)'),true);
      await click(run,protocol,'#computerReady');assert.equal(await run('return computerReady'),true);
      await click(run,protocol,'#envs [data-v=class]');assert.equal(await run('return cur'),null);assert.match(await run("return $('rec').textContent"),/没有符合当前条件/);
      await click(run,protocol,'#envs [data-v=quiet]');assert.equal(await run('return ok(cur)'),true);
      await click(run,protocol,'#times [data-v=custom]');assert.equal(await run('return cur'),null);
      assert.equal(await run('return document.activeElement.id'),'customMinutes');
      assert.deepEqual(await run('return __focusCalls.at(-1)'),{id:'customMinutes',options:{preventScroll:true}});
      const inputPoint=await point(run,'#customMinutes');
      await protocol('Input.dispatchMouseEvent',{type:'mousePressed',...inputPoint,button:'left',buttons:1,clickCount:1});
      await protocol('Input.dispatchMouseEvent',{type:'mouseReleased',...inputPoint,button:'left',buttons:0,clickCount:1});
      const beforeInput=await snapshot(run);await protocol('Input.insertText',{text:'25'});await stable(run,beforeInput);
      assert.equal(await run('return ok(cur)'),true);
      for(const value of ['5','0','1.5','90']){
        const before=await snapshot(run);await run(`$('customMinutes').value=${JSON.stringify(value)};$('customMinutes').dispatchEvent(new Event('input',{bubbles:true}))`);await stable(run,before);
        if(value==='5')assert.match(await run("return $('rec').textContent"),/没有符合当前条件/);
        if(value==='0'||value==='1.5')assert.equal(await run("return $('random').disabled"),true);
      }
      const final=await snapshot(run);assert.equal(final.hero,initial.hero);assert.equal(final.panel,initial.panel);
      assert.deepEqual(await run('return [d.tasks,d.completed]'),[d.tasks,d.completed]);assert.equal(await run("return __rawGet('activeTimer')"),null);
    });count++;
  }
  await scenario('custom focus does not scroll a short viewport to a newly revealed input',{whatToDoData:JSON.stringify(dataSet())},{},async(run,_imp,{protocol})=>{
    await protocol('Emulation.setDeviceMetricsOverride',{width:375,height:360,deviceScaleFactor:1,mobile:true});await settle(run);await install(run);
    await click(run,protocol,'#times [data-v=custom]');assert.equal(await run('return scrollY'),0);assert.equal(await run('return document.activeElement.id'),'customMinutes');
  });count++;
  await scenario('manual viewport position survives passive redraws and condition changes',{whatToDoData:JSON.stringify(dataSet())},{},async(run,_imp,{protocol})=>{
    await protocol('Emulation.setDeviceMetricsOverride',{width:700,height:400,deviceScaleFactor:1,mobile:false});await settle(run);await install(run);
    await click(run,protocol,'#times [data-v="30"]');await click(run,protocol,'#envs [data-v=quiet]');
    await click(run,protocol,'#computerReady');
    const before=await snapshot(run);await run('for(let i=0;i<5;i++)random({keepCurrent:true})');await stable(run,before);
    assert.ok(await run('return scrollY>0'));assert.equal(await run("return getComputedStyle(document.body).overflowAnchor"),'none');
    await run("page('tasks')");assert.equal(await run("return getComputedStyle(document.body).overflowAnchor"),'auto');
  });count++;
  console.log(count+' start stability browser scenarios passed.');
};
