const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
module.exports=async function(scenario,fixture){
 const out=path.resolve(__dirname,'../test-artifacts/current-conditions');fs.mkdirSync(out,{recursive:true});let count=0;
 const dataset=()=>{const d=fixture();d.completed=[];d.preferences={time:10,conditions:{computer:false,audio:false,speech:false,interrupted:false}};d.tasks=[
  {id:'read',name:'读书',requirements:{},description:'接着上次读到的地方。'},
  {id:'audio',name:'听一段课程',requirements:{audio:true}},
  {id:'shadow',name:'跟读英语',requirements:{audio:true,speech:true}},
  {id:'code',name:'编程练习',requirements:{computer:true}},
  {id:'deep',name:'整理一个思路',requirements:{uninterrupted:true}},
 ];return d;};
 const check=async(name,d,fn,faults={})=>{await scenario(name,d?{whatToDoData:JSON.stringify(d)}:{},faults,async(...args)=>{await size(args[2].protocol,1440);await fn(...args)},{timezone:'Asia/Shanghai'});count++;};
 const size=(protocol,width,height=900)=>protocol('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
 const click=async(run,protocol,selector)=>{
  const p=await run(`const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('missing control');el.scrollIntoView({block:'nearest'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const r=el.getBoundingClientRect();if(!r.width||!r.height)throw Error('hidden control: '+${JSON.stringify(selector)});const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(hit!==el&&!el.contains(hit))throw Error('covered control '+${JSON.stringify(selector)}+' by '+hit?.outerHTML+' rect '+JSON.stringify(r.toJSON())+' open '+$('conditionsPicker').open);return{x:r.left+r.width/2,y:r.top+r.height/2}`);
  await protocol('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});await protocol('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});await run('await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await new Promise(r=>setTimeout(r,80))');
 };
 const shot=async(run,protocol,name)=>{await run('await document.fonts.ready;await new Promise(requestAnimationFrame)');const r=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));};
 const overflow=async run=>assert.equal(await run('return document.documentElement.scrollWidth<=innerWidth'),true);
 await check('minimal first-use screen creates one duration-free activity and reloads',null,async(run,_imp,{protocol,reload})=>{
  await size(protocol,1440);assert.deepEqual(await run("return [d.tasks.length,!!$('quickOptions'),!!$('restoreWelcome'),!!$('mins'),!!$('environment')]"),[0,false,false,false,false]);
  assert.deepEqual(await run('return conditions'),{computer:false,audio:false,speech:false,interrupted:false});
  assert.deepEqual(await run("return [...$('conditionsPanel').querySelectorAll('input')].map(e=>e.checked)"),[false,false,false,false]);
  await shot(run,protocol,'01-onboarding');await run("$('quickName').value='跑步'");await click(run,protocol,'#addFirstTask');
  assert.deepEqual(await run("return [cur.name,Object.hasOwn(cur,'minutes'),Object.hasOwn(cur,'env'),$('random').getClientRects().length,$('rec').querySelectorAll('.meta').length]"),['跑步',false,false,0,0]);
  await shot(run,protocol,'02-single-recommendation');await reload();assert.deepEqual(await run('return [cur.name,__writes.length]'),['跑步',0]);
 });
 await check('mouse hover opens both pickers without clicking, crosses the gap and keeps clicks usable',dataset(),async(run,_imp,{protocol})=>{
  const raw=await run("return __rawGet('whatToDoData')");
  const rect=selector=>run(`const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,bottom:r.bottom,top:r.top}`);
  const move=p=>protocol('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y});
  const settle=()=>run('await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)');
  for(const id of ['timePicker','conditionsPicker']){
   const summary=await rect('#'+id+' > summary');await move(summary);await settle();
   assert.equal(await run(`return $('${id}').open`),true,'hover opens '+id);
   await click(run,protocol,'#'+id+' > summary');
   assert.equal(await run(`return $('${id}').open`),true,'click after hover does not close '+id);
   const panel=await rect('#'+id+' .condition-panel');
   await move({x:summary.x,y:(summary.bottom+panel.top)/2});
   await run('await new Promise(r=>setTimeout(r,60))');
   assert.equal(await run(`return $('${id}').open`),true,'crossing the gap stays open');
   await move(panel);await run('await new Promise(r=>setTimeout(r,200))');
   assert.equal(await run(`return $('${id}').open`),true,'entering the panel cancels pending close');
   await move({x:10,y:120});
   assert.equal(await run(`return $('${id}').open`),false,'leaving the panel closes immediately');
   await move(summary);await settle();await move({x:10,y:120});
   await run('await new Promise(r=>setTimeout(r,220))');
   assert.equal(await run(`return $('${id}').open`),false,'leaving only the summary closes too');
  }
  await move(await rect('#timePicker > summary'));await settle();
  await move(await rect('#conditionsPicker > summary'));await settle();
  assert.deepEqual(await run("return [$('timePicker').open,$('conditionsPicker').open]"),[false,true]);
  assert.equal(await run("return __rawGet('whatToDoData')"),raw);assert.equal(await run('return __writes.length'),0);
 });
 await check('native condition checkboxes combine audio and speech and update immediately',dataset(),async(run,_imp,{protocol})=>{
  await size(protocol,1440);await click(run,protocol,'#conditionsPicker > summary');await click(run,protocol,'#audioReady');
  assert.deepEqual(await run('return d.tasks.filter(ok).map(t=>t.id)'),['read','audio','deep']);
  await click(run,protocol,'#speechReady');assert.deepEqual(await run('return d.tasks.filter(ok).map(t=>t.id)'),['read','audio','shadow','deep']);
  await run("cur=d.tasks[2];random({keepCurrent:true})");await shot(run,protocol,'03-current-conditions');
  await run("window.__oldStart=$('start')");await click(run,protocol,'#audioReady');await run('__oldStart.click()');assert.equal(await run("return __rawGet('activeTimer')"),null);
  assert.equal(await run('return cur.id!=="shadow"'),true);
 });
 await check('four aligned checkboxes stay open inside the panel and close immediately on mouse exit from every edge',dataset(),async(run,_imp,{protocol})=>{
  await click(run,protocol,'#conditionsPicker > summary');
  assert.equal(await run("return $('conditionsPicker').open"),true,'opening from the summary allows entering the panel');
  assert.deepEqual(await run("return [...$('conditionsPanel').querySelectorAll('input')].map(e=>[e.type,e.getAttribute('role')])"),Array.from({length:4},()=>['checkbox',null]));
  assert.equal(await run("return $('conditionsPanel').querySelectorAll('h2,.condition-interruption').length"),0);
  for(const id of ['computerReady','audioReady','speechReady','interruptionsLikely']){
   await click(run,protocol,'#'+id);assert.equal(await run("return $('conditionsPicker').open"),true);
  }
  assert.deepEqual(await run('return conditions'),{computer:true,audio:true,speech:true,interrupted:true});
  assert.ok(await run("const boxes=[...$('conditionsPanel').querySelectorAll('input')].map(e=>e.getBoundingClientRect());return boxes.every(r=>r.width===18&&r.height===18&&Math.abs(r.right-boxes[0].right)<1)"));
  await shot(run,protocol,'09-checkbox-menu');
  const raw=await run("return __rawGet('whatToDoData')"),writes=await run('return __writes.length');
  for(const edge of ['left','right','top','bottom']){
   if(!await run("return $('conditionsPicker').open"))await click(run,protocol,'#conditionsPicker > summary');
   const r=await run("const r=$('conditionsPanel').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,x:r.left+r.width/2,y:r.top+r.height/2}");
   await protocol('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y});
   await protocol('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.left+6,y:r.top+6});
   assert.equal(await run("return $('conditionsPicker').open"),true,'moving between children and panel whitespace stays open');
   const target={x:r.x,y:r.y};
   if(edge==='left')target.x=r.left-1;if(edge==='right')target.x=r.right+1;if(edge==='top')target.y=r.top-1;if(edge==='bottom')target.y=r.bottom+1;
   await protocol('Input.dispatchMouseEvent',{type:'mouseMoved',...target});
   assert.equal(await run("return $('conditionsPicker').open"),false,edge+' exit closes without a delay');
  }
  assert.equal(await run("return __rawGet('whatToDoData')"),raw);assert.equal(await run('return __writes.length'),writes);
  assert.deepEqual(await run("return [...document.querySelectorAll('#times button')].map(e=>e.dataset.v)"),['5','10','15','30','60','custom']);
 });
 await check('touch release keeps the panel open and keyboard checkboxes and Escape still work',dataset(),async(run,_imp,{protocol})=>{
  await size(protocol,375);await click(run,protocol,'#conditionsPicker > summary');
  const p=await run("const r=$('audioReady').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}");
  await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});
  await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await run('await new Promise(resolve=>setTimeout(resolve,80))');
  assert.deepEqual(await run("return [$('conditionsPicker').open,$('audioReady').checked]"),[true,true]);
  await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:8,y:100,id:1}]});
  await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await run("return $('conditionsPicker').open"),false);
  await run("document.querySelector('#conditionsPicker > summary').focus()");
  const key=async(key,code,keyCode,text)=>{
   await protocol('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:keyCode,...(text?{text}:{})});
   await protocol('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:keyCode});
  };
  await key('Enter','Enter',13,'\r');assert.equal(await run("return $('conditionsPicker').open"),true);
  await run("$('computerReady').focus()");await key(' ','Space',32,' ');
  assert.deepEqual(await run("return [$('conditionsPicker').open,$('computerReady').checked]"),[true,true]);
  await key('Tab','Tab',9);assert.equal(await run('return document.activeElement.id'),'audioReady');
  await key('Escape','Escape',27);
  assert.ok(await run("return !$('conditionsPicker').open&&document.activeElement===document.querySelector('#conditionsPicker > summary')"));
 });
 await check('new activity requirements have no duration and survive export/import',dataset(),async(run,imp,{protocol,reload})=>{
  await click(run,protocol,'[data-page=tasks]');await click(run,protocol,'#newTask');
  assert.equal(await run("return $('requirementsOptions').open"),false);await run("$('name').value='跟读一句英语'");
  await click(run,protocol,'#requirementsOptions > summary');await click(run,protocol,'#requiresAudio');await click(run,protocol,'#requiresSpeech');
  await shot(run,protocol,'04-activity-editor');await click(run,protocol,'#saveActivity');
  const t=await run('return d.tasks.at(-1)');assert.equal(t.requirements.audio,true);assert.equal(t.requirements.speech,true);assert.equal('minutes' in t,false);
  const backup=await run("$('export').click();return JSON.parse(await __downloads.at(-1).blob.text())");await imp(backup);await run("$('confirmAccept').click()");await reload();assert.deepEqual(await run('return d.tasks.at(-1)'),t);
 });
 await check('session budget controls both recommended and manual starts; actual history stays exact',dataset(),async(run,_imp,{protocol})=>{
  await click(run,protocol,'#timePicker > summary');await click(run,protocol,'#times [data-v="5"]');assert.equal(await run('return time'),5);await click(run,protocol,'#start');
  assert.equal(await run('return timerState().plannedDurationMs'),300000);
  await run('pauseTimer();var x=timerState();x.elapsed=42000;setTimerState(x);finishTimer()');
  assert.deepEqual(await run('return [d.completed.length,d.completed[0].actualDurationMs,d.completed[0].plannedDuration]'),[1,42000,5]);
  await click(run,protocol,'[data-page=tasks]');await click(run,protocol,'[data-task-id=code] [data-task-action=start]');assert.equal(await run('return timerState().plannedDurationMs'),300000);
 });
 await check('custom budget validation blocks stale and manual starts without inventing duration',dataset(),async(run,_imp,{protocol})=>{
  await click(run,protocol,'#timePicker > summary');await click(run,protocol,'#times [data-v=custom]');await run("$('customMinutes').value='7';$('customMinutes').dispatchEvent(new Event('input'));window.__oldStart=$('start');$('customMinutes').value='bad';$('customMinutes').dispatchEvent(new Event('input'));__oldStart.click();run(d.tasks[0])");
  assert.equal(await run("return __rawGet('activeTimer')"),null);assert.equal(await run("return $('timePicker').open"),true);
  await run("$('customMinutes').value='7';$('customMinutes').dispatchEvent(new Event('input'));$('timePicker').open=false");await click(run,protocol,'#start');assert.equal(await run('return timerState().plannedDurationMs'),420000);
 });
 await check('old labels and minutes stay unchanged, while actual computer restrictions remain',fixture(),async(run,_imp,{reload})=>{
  const raw=await run("return __rawGet('whatToDoData')");await run('d.tasks[0].minutes=1440;d.tasks[0].env="class";random({keepCurrent:true})');assert.equal(await run('return ok(cur)'),true);
  await reload();assert.equal(await run("return __rawGet('whatToDoData')"),raw);assert.equal(await run('return __writes.length'),0);
  await run('edit(d.tasks[0]);$("name").value="旧活动改名";$("requiresAudio").checked=true;$("form").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}))');
  const old=JSON.parse(raw).tasks[0];assert.deepEqual(await run('return [d.tasks[0].minutes,d.tasks[0].env,d.tasks[0].description]'),[old.minutes,old.env,old.description]);
 });
 await check('failed switch writes restore all controls and running timer is not changed',dataset(),async(run,_imp,{protocol})=>{
  await click(run,protocol,'#start');await run('pauseTimer();window.__timer=__rawGet("activeTimer");page("tasks");__faults.write=true');
  const raw=await run('return __rawGet("whatToDoData")');await run('$("audioReady").checked=true;$("audioReady").dispatchEvent(new Event("change"))');
  assert.deepEqual(await run('return [conditions.audio,$("audioReady").checked,__rawGet("whatToDoData"),__rawGet("activeTimer")===__timer]'),[false,false,raw,true]);
 });
 await check('interruptions prefer easy-to-pause activities without an empty fallback',dataset(),async(run,_imp,{protocol})=>{
  await run('cur=d.tasks.at(-1);random({keepCurrent:true})');await click(run,protocol,'#conditionsPicker > summary');await click(run,protocol,'#interruptionsLikely');assert.equal(await run('return cur.id'),'read');
  await run('d.tasks=[d.tasks.at(-1)];cur=null;random()');assert.equal(await run('return cur.id'),'deep');assert.equal(await run('return $("random").getClientRects().length'),0);
 });
 await check('keyboard popovers and mobile layout work at 320, 390 and desktop widths',dataset(),async(run,_imp,{protocol})=>{
  for(const width of [320,390,1440]){
   await size(protocol,width);await run('page("home");cur=d.tasks[0];random({keepCurrent:true})');await overflow(run);await click(run,protocol,'#conditionsPicker > summary');
   const bounds=await run('const r=document.querySelector("#conditionsPicker .condition-panel").getBoundingClientRect();return [r.left>=0,r.right<=innerWidth,r.bottom<=innerHeight]');assert.deepEqual(bounds,[true,true,true]);
   await shot(run,protocol,'05-conditions-'+width);
   await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});assert.equal(await run('return $("conditionsPicker").open'),false);
   await click(run,protocol,'[data-page=tasks]');await overflow(run);await shot(run,protocol,'06-library-'+width);
   await click(run,protocol,'#newTask');await click(run,protocol,'#requirementsOptions > summary');await overflow(run);await shot(run,protocol,'07-editor-'+width);await click(run,protocol,'#close');
  }
  await click(run,protocol,'[data-page=settings]');await click(run,protocol,'#theme');await click(run,protocol,'[data-page=home]');await shot(run,protocol,'08-home-dark');await overflow(run);
 });
 console.log(count+' current-condition browser scenarios passed; screenshots: '+out);
};
