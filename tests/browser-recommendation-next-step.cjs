const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async(scenario,fixture)=>{
 const output=path.resolve(__dirname,'../test-artifacts/recommendation-next-step');fs.mkdirSync(output,{recursive:true});let count=0;
 const data=()=>{const d=fixture();d.theme='light';d.completed=[];d.preferences={time:15,language:'zh-CN',conditions:{computer:false,audio:false,speech:false,interrupted:false}};d.tasks=[{id:'read',name:'读书',nextStep:'翻到上次的位置，先读一页。',requirements:{},description:'保留原有说明'},{id:'code',name:'Vibe Coding',nextStep:'打开项目，先确认一个要改的问题。',requirements:{}},{id:'stretch',name:'伸展一下',requirements:{}}];return d};
 const check=async(name,fn,seed=data())=>{await scenario(name,{whatToDoData:JSON.stringify(seed)},{},async(...args)=>{await size(args[2].protocol,1440);await fn(...args)},{timezone:'Asia/Shanghai'});count++};
 const size=(p,width,height=1000)=>p('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
 const point=(run,selector)=>run(`const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('missing '+${JSON.stringify(selector)});const r=el.getBoundingClientRect();if(!r.width||!r.height)throw Error('hidden '+${JSON.stringify(selector)});return {x:r.left+r.width/2,y:r.top+r.height/2,left:r.left,right:r.right,top:r.top,bottom:r.bottom}`);
 const move=(p,r)=>p('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y});
 const click=async(run,p,selector)=>{await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'nearest'});await new Promise(requestAnimationFrame)`);const r=await point(run,selector);await move(p,r);await p('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',buttons:1,clickCount:1});await p('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x,y:r.y,button:'left',buttons:0,clickCount:1});await run('await new Promise(requestAnimationFrame)')};
 const key=async(p,key,code,n)=>{await p('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:n,...(key==='Enter'?{text:'\r'}:{})});await p('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n})};
 const shot=async(run,p,name)=>{await run("$('appNotice')?.classList.add('hide');await document.fonts.ready");const image=await p('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(image.data,'base64'))};
 const nextMenu=async(run,p)=>{await move(p,await point(run,'#recommendationMore'));assert.equal(await run("return !$('recommendationMenu').classList.contains('hide')"),true)};
 await check('next step editing saves safely, cancels drafts, survives reload and keeps user text inert',async(run,_imp,{protocol,reload})=>{
  await run("cur=d.tasks[0];random({keepCurrent:true})");assert.equal(await run("return document.querySelector('.next-step-copy').textContent"),'翻到上次的位置，先读一页。');
  await nextMenu(run,protocol);await click(run,protocol,'#recommendationMenuEdit');
  assert.deepEqual(await run("return [$('saveNextStep').textContent,!!$('start'),$('nextStepInput').value]"),['保存',false,'翻到上次的位置，先读一页。']);
  await shot(run,protocol,'01-save-desktop');
  await run("$('nextStepInput').value='丢弃这个草稿';$('nextStepInput').dispatchEvent(new Event('input'))");await click(run,protocol,'#cancelNextStep');
  assert.equal(await run('return d.tasks[0].nextStep'),'翻到上次的位置，先读一页。');
  await nextMenu(run,protocol);await click(run,protocol,'#recommendationMenuEdit');
  const text='<img src=x onerror=alert(1)> 先改一个按钮';await run(`$('nextStepInput').value=${JSON.stringify(text)};$('nextStepInput').dispatchEvent(new Event('input'))`);await click(run,protocol,'#saveNextStep');
  assert.equal(await run("return document.querySelector('.next-step-copy').textContent"),text);assert.equal(await run("return $('rec').querySelectorAll('img').length"),0);
  await reload();assert.equal(await run('return d.tasks[0].nextStep'),text);assert.equal(await run('return __writes.length'),0);
 });
 await check('hover menus sit to the right, survive the pointer gap and close on exit without writes',async(run,_imp,{protocol})=>{
  const raw=await run("return __rawGet('whatToDoData')");
  for(const which of ['recommendation','activity']){
   if(which==='activity')await click(run,protocol,'[data-page=tasks]');
   const trigger=which==='activity'?'.activity-item:first-child [data-task-action=more]':'#recommendationMore',menu=which==='activity'?'#activityMenu':'#recommendationMenu';
   await move(protocol,await point(run,trigger));const a=await point(run,trigger),b=await point(run,menu);
   assert.ok(b.left>=a.right+7,which+' menu opens beside the dots');
   await click(run,protocol,trigger);assert.equal(await run(`return document.querySelector('${menu}').classList.contains('hide')`),false);
   await move(protocol,{x:(a.right+b.left)/2,y:a.y});await new Promise(r=>setTimeout(r,60));
   await move(protocol,b);await new Promise(r=>setTimeout(r,200));assert.equal(await run(`return document.querySelector('${menu}').classList.contains('hide')`),false);
   if(which==='activity')await shot(run,protocol,'02-activity-menu-right');
   await move(protocol,{x:b.right+1,y:b.y});assert.equal(await run(`return document.querySelector('${menu}').classList.contains('hide')`),true);
  }
  assert.equal(await run("return __rawGet('whatToDoData')"),raw);assert.equal(await run('return __writes.length'),0);
 });
 await check('every row opens its own edit/delete menu; legacy exclusion flags no longer hide recommendations',async(run,_imp,{protocol,reload})=>{
  await click(run,protocol,'[data-page=tasks]');
  for(const id of ['read','code','stretch']){
   await move(protocol,await point(run,`[data-task-id=${id}] [data-task-action=more]`));assert.equal(await run('return activityMenuContext.id'),id);
  }
  assert.deepEqual(await run("return [...$('activityMenu').querySelectorAll('button')].map(b=>b.textContent)"),['编辑','删除']);
  await click(run,protocol,'#activityMenuEdit');assert.equal(await run("return $('tid').value"),'stretch');await key(protocol,'Escape','Escape',27);
  await run('for(const t of d.tasks)t.recommendationPaused=true;save()');await reload();await run("page('home')");
  const seen=new Set();for(let i=0;i<3;i++){seen.add(await run('return cur.id'));await click(run,protocol,'#random')}
  assert.equal(seen.size,3);assert.equal(await run('return cur'),null);
  assert.equal(await run("return !!$('recommendationMenuPause')||!!$('activityMenuRecommendation')"),false);
 });
 await check('swaps exhaust a round without repeats, deliberate restart and manual choice remain available',async(run,_imp,{protocol})=>{
  const seen=new Set();for(let i=0;i<3;i++){const id=await run('return cur.id');assert.ok(!seen.has(id));seen.add(id);await click(run,protocol,'#random')}
  assert.equal(await run('return cur'),null);assert.equal(await run("return $('rec').textContent.includes('这轮先到这里')"),true);
  await shot(run,protocol,'03-round-exhausted');
  await run("[...$('rec').querySelectorAll('button')].find(b=>b.textContent==='重新看看').click()");assert.ok(await run('return cur.id'));
  assert.equal(await run('return __writes.length'),0);assert.equal(await run('return d.completed.length'),0);
  await click(run,protocol,'#browse');assert.equal(await run("return $('tasks').classList.contains('active')"),true);
 });
 await check('failed save keeps the draft and both timer states unchanged, then retry works',async(run,_imp,{protocol})=>{
  for(const paused of [false,true]){
   await run("if(timerState())discardTimer();run(d.tasks[0]);"+(paused?'pauseTimer();':'')+"page('tasks');window.__timer=__rawGet('activeTimer');page('home');$('timer').classList.add('hide');syncDialogState();cur=d.tasks[0];random({keepCurrent:true});editNextStep(cur.id)");
   const raw=await run("return __rawGet('whatToDoData')");await run("$('nextStepInput').value='失败后保留';$('nextStepInput').dispatchEvent(new Event('input'));__faults.write=true");await click(run,protocol,'#saveNextStep');
   assert.deepEqual(await run("return [$('nextStepInput').value,__rawGet('whatToDoData'),__rawGet('activeTimer')===__timer]"),['失败后保留',raw,true]);
   await run('__faults.write=false');await click(run,protocol,'#saveNextStep');assert.equal(await run("return __rawGet('activeTimer')===__timer"),true);
  }
 });
 await check('keyboard, mobile touch, dark mode and viewport edges remain usable',async(run,_imp,{protocol})=>{
  await run("$('recommendationMore').focus()");await key(protocol,'Enter','Enter',13);assert.equal(await run('return document.activeElement.id'),'recommendationMenuEdit');
  await key(protocol,'ArrowDown','ArrowDown',40);assert.equal(await run('return document.activeElement.id'),'recommendationMenuEdit');await key(protocol,'Escape','Escape',27);
  assert.equal(await run('return document.activeElement.id'),'recommendationMore');
  for(const width of [320,390,800,1440]){
   await size(protocol,width,800);await run("page('tasks')");
   await move(protocol,await point(run,'.activity-item:last-child [data-task-action=more]'));
   assert.ok(await run("const r=$('activityMenu').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight"));
   assert.equal(await run('return document.documentElement.scrollWidth<=innerWidth'),true);
   await key(protocol,'Escape','Escape',27);
  }
  await size(protocol,390,850);await run("setTheme('dark');page('home');cur=d.tasks[0];random({keepCurrent:true})");
  const r=await point(run,'#recommendationMore');await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y,id:1}]});await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,80));
  assert.equal(await run("return !$('recommendationMenu').classList.contains('hide')"),true);await shot(run,protocol,'04-dark-mobile');
  await click(run,protocol,'#recommendationMenuEdit');await shot(run,protocol,'05-save-dark-mobile');
 });
 await check('new interface text is translated while next steps remain in the original language',async(run,_imp,{protocol})=>{
  for(const locale of ['en','ja','zh-CN']){
   await run(`setLanguage('${locale}');cur=d.tasks[0];random({keepCurrent:true});editNextStep(cur.id)`);
   assert.equal(await run("return $('saveNextStep').textContent"),{en:'Save',ja:'保存','zh-CN':'保存'}[locale]);
   assert.equal(await run("return $('nextStepInput').value"),'翻到上次的位置，先读一页。');
   await run('cancelNextStep()');await nextMenu(run,protocol);
   assert.equal(await run("return $('recommendationMenuEdit').textContent"),{en:'Edit next step',ja:'次の一歩を編集','zh-CN':'修改下一步'}[locale]);
   await key(protocol,'Escape','Escape',27);
  }
 });
 console.log(count+' next-step and hover browser scenarios passed; screenshots: '+output);
};
