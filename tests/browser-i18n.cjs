const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
module.exports=async(scenario,fixture)=>{
 const out=path.resolve(__dirname,'../test-artifacts/i18n');fs.mkdirSync(out,{recursive:true});let count=0;
 const seed=()=>{const d=fixture();d.completed=[];d.tasks=[{id:'read',name:'读书',requirements:{},description:'设置里也不要翻译这句用户笔记。'},{id:'talk',name:'跟读',requirements:{audio:true,speech:true}}];return d};
 const size=(p,width,height=900)=>p('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
 const check=async(name,data,fn,faults={},options={})=>{await scenario(name,data===null?{}:{whatToDoData:typeof data==='string'?data:JSON.stringify(data)},faults,async(run,imp,ctx)=>{await size(ctx.protocol,1440);await fn(run,imp,ctx)},options);count++};
 const click=async(run,p,selector)=>{
  const point=await run(`const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('missing '+${JSON.stringify(selector)});el.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(!r.width||!r.height||!el.contains(document.elementFromPoint(x,y)))throw Error('unreachable '+${JSON.stringify(selector)});return{x,y}`);
  await p('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1});await p('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',buttons:0,clickCount:1});await run('await new Promise(requestAnimationFrame);await new Promise(resolve=>setTimeout(resolve,60))');
 };
 const shot=async(run,p,name)=>{await run("$('appNotice')?.classList.add('hide');await document.fonts.ready;await new Promise(requestAnimationFrame)");const r=await p('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'))};
 const noOverflow=async run=>assert.ok(await run('return document.documentElement.scrollWidth<=innerWidth'),'no horizontal overflow');
 const noChinese=async run=>assert.deepEqual(await run(`const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),found=[];while(walker.nextNode()){const n=walker.currentNode,e=n.parentElement;if(e.closest('[data-language],.user-text,#timerName,#timerDesc,#confirmTaskName,#confirmTaskDesc,script')||!e.getClientRects().length||e.closest('.hide'))continue;if(/[\\u4e00-\\u9fff]/.test(n.textContent))found.push(n.textContent)}return found`),[]);

 await check('first visit follows Japanese browser language and renders all onboarding attributes',null,async(run,_imp,{protocol})=>{
  assert.deepEqual(await run("return [language,document.documentElement.lang,document.title,$('quickName').placeholder]"),['ja','ja','今、何する？','例：読書、字の練習、単語の復習']);
  await shot(run,protocol,'01-onboarding-ja');assert.equal(await run("return JSON.parse(__rawGet('whatToDoData')).preferences.language"),'ja');
 },{}, {languages:['ja-JP']});
 await check('unsupported browser language falls back to English without rewriting an existing backup',seed(),async(run)=>{
  assert.deepEqual(await run("return [language,document.documentElement.lang,__writes.length]"),['en','en',0]);await noChinese(run);
 },{}, {languages:['fr-FR']});
 await check('native language controls switch immediately, persist on reload and support keyboard activation',seed(),async(run,_imp,{protocol,reload})=>{
  await click(run,protocol,'#dataMenuToggle');await click(run,protocol,'[data-language=en]');
  assert.deepEqual(await run("return [location.hash,$('settingsTitle').textContent,$('export').textContent,document.documentElement.lang,document.querySelector('[data-language=en]').getAttribute('aria-pressed')]"),['#settings','Settings','Export','en','true']);await noChinese(run);
  await shot(run,protocol,'02-settings-en');await reload();assert.equal(await run('return language'),'en');assert.equal(await run('return __writes.length'),0);
  await run("document.querySelector('[data-language=ja]').focus()");await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  assert.equal(await run("return $('settingsTitle').textContent"),'設定');await shot(run,protocol,'03-settings-ja');
  await click(run,protocol,'[data-language="zh-CN"]');assert.equal(await run("return $('settingsTitle').textContent"),'设置');
 });
 await check('English forms, conditions, timer and history stay localized while user content stays literal',seed(),async(run,_imp,{protocol})=>{
  await run("setLanguage('en');page('tasks')");await noChinese(run);await click(run,protocol,'#newTask');await noChinese(run);
  await click(run,protocol,'#requirementsOptions > summary');await noChinese(run);
  await run("$('name').value='设置 <img onerror=alert(1)> {n}';$('desc').value='用户笔记';$('requiresAudio').checked=true");await click(run,protocol,'#saveActivity');
  assert.equal(await run('return d.tasks.at(-1).name'),'设置 <img onerror=alert(1)> {n}');assert.equal(await run("return document.querySelectorAll('img').length"),0);
  await run("page('home')");await click(run,protocol,'#conditionsPicker > summary');await noChinese(run);await click(run,protocol,'#audioReady');
  await click(run,protocol,'#timePicker > summary');await click(run,protocol,'#times [data-v=custom]');await run("$('customMinutes').value='bad';$('customMinutes').dispatchEvent(new Event('input'))");assert.equal(await run("return $('customTimeError').textContent"),'Enter a whole number from 1 to 1440');
  await run("$('customMinutes').value='7';$('customMinutes').dispatchEvent(new Event('input'));$('timePicker').open=false;cur=d.tasks[0];random({keepCurrent:true})");await click(run,protocol,'#start');await noChinese(run);
  assert.equal(await run("return $('timerMeta').textContent"),'Planned 7 min');await click(run,protocol,'#pauseTimer');
  const raw=await run("return __rawGet('activeTimer')");await click(run,protocol,'#dataMenuToggle');await click(run,protocol,'[data-language=ja]');assert.equal(await run("return __rawGet('activeTimer')"),raw);
  await click(run,protocol,'[data-page=home]');assert.equal(await run("return $('pauseTimer').textContent"),'再開');
  await click(run,protocol,'#earlyTimer');assert.equal(await run("return $('confirmTitle').textContent"),'終了して今回の記録を保存しますか？');await click(run,protocol,'#confirmCancel');assert.equal(await run("return __rawGet('activeTimer')"),raw);
  await click(run,protocol,'#earlyTimer');await click(run,protocol,'#confirmAccept');assert.equal(await run("return d.completed.length"),1);
  await run("setLanguage('en')");await noChinese(run);assert.match(await run("return $('todayBox').textContent"),/1 session/);
 });
 await check('backup exports language and confirmed restore updates the interface without touching active timing',seed(),async(run,imp,{reload})=>{
  await run("setLanguage('en');run(d.tasks[0]);pauseTimer()");const timer=await run("return __rawGet('activeTimer')");
  const backup=await run("$('export').click();return JSON.parse(await __downloads.at(-1).blob.text())");assert.equal(backup.preferences.language,'en');backup.preferences.language='ja';
  await imp(backup);assert.match(await run("return $('confirmTitle').textContent"),/Replace activities/);await run("$('confirmAccept').click()");
  assert.equal(await run('return language'),'ja');assert.equal(await run("return __rawGet('activeTimer')"),timer);await reload();assert.equal(await run('return language'),'ja');
 });
 await check('failed language save rolls back both selected control and rendered language',seed(),async(run,_imp,{protocol})=>{
  await click(run,protocol,'#dataMenuToggle');const before=await run("return __rawGet('whatToDoData')");await run('__faults.write=true');await click(run,protocol,'[data-language=en]');
  assert.deepEqual(await run("return [language,$('settingsTitle').textContent,document.querySelector('[data-language=\"zh-CN\"]').getAttribute('aria-pressed'),__rawGet('whatToDoData')]"),['zh-CN','设置','true',before]);
  await run('delete __faults.write');await click(run,protocol,'[data-language=en]');assert.equal(await run('return language'),'en');
 });
 await check('compact settings and core views fit all languages on desktop and narrow phones',seed(),async(run,_imp,{protocol})=>{
  for(const locale of ['zh-CN','en','ja'])for(const width of [1440,390,320,240]){
   await size(protocol,width,width<600?812:900);await run(`setLanguage(${JSON.stringify(locale)});page('settings')`);await noOverflow(run);
   assert.ok(await run("return [...document.querySelectorAll('nav button')].every(b=>b.getBoundingClientRect().height<=46)"),'navigation labels stay on one line');
   assert.ok(await run("const r=$('dataPanel').getBoundingClientRect();return r.width<=520&&r.left>=0&&r.right<=innerWidth"));
   if(width===1440){assert.ok(await run("return $('dataPanel').getBoundingClientRect().height<400"));await shot(run,protocol,'04-settings-'+locale+'-desktop')}
   if(width===320)await shot(run,protocol,'05-settings-'+locale+'-320');
   await run("setTheme('dark')");await noOverflow(run);if(width===390&&locale==='en')await shot(run,protocol,'06-settings-en-dark-mobile');await run("setTheme('light');page('home')");await noOverflow(run);
   await click(run,protocol,'#conditionsPicker > summary');await noOverflow(run);await run("$('conditionsPicker').open=false;page('tasks')");await noOverflow(run);await click(run,protocol,'#newTask');await noOverflow(run);await run('closeActivity();run(d.tasks[0])');await noOverflow(run);await run('discardTimer()');
  }
 });
 await check('corrupt data recovery is localized and never replaces the original bytes','{broken',async(run)=>{
  assert.equal(await run("return __rawGet('whatToDoData')"),'{broken');assert.match(await run("return $('dataRecovery').textContent"),/Your local data is protected/);await noChinese(run);
 },{}, {languages:['en-US']});
 console.log(count+' localization browser scenarios passed. Screenshots: '+out);
};
