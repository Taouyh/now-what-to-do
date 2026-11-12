const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
fs.mkdirSync('.cache/always-sound',{recursive:true});
const server=spawn(process.execPath,['scripts/serve-web.cjs'],{env:{...process.env,PORT:'8914'},stdio:'pipe',windowsHide:true});
const data={version:2,goals:[],tasks:[{id:'read',name:'读书',requirements:{},enabled:true}],completed:[],preferences:{time:10,language:'zh-CN',conditions:{},reminders:{sound:false,vibration:false}},theme:'light'};
(async()=>{let browser;try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject)});
 browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
 for(const platform of ['web','windows','android']){
  const context=await browser.newContext(platform==='android'?{viewport:{width:320,height:568},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1600,height:1000}});
  const page=await context.newPage();await page.clock.install();
  await page.addInitScript(({data,platform})=>{
   if(!localStorage.getItem('whatToDoData'))localStorage.setItem('whatToDoData',JSON.stringify(data));
   window.audioNotes=0;window.payloads=[];
   window.AudioContext=class{state='running';currentTime=0;destination={};createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}createOscillator(){return{frequency:{},connect(){},start(){window.audioNotes++},stop(){}}}};
   if(platform!=='web')window.nativeApp={supportsVibration:platform==='android',syncReminder:p=>window.payloads.push(p),requestReminders(){}};
  },{data,platform});
  await page.goto('http://127.0.0.1:8914/#settings');await page.locator('html[data-app-ready=true]').waitFor();
  assert.equal(await page.locator('#reminderSound').count(),0);
  assert.equal(await page.locator('#reminderVibration').isVisible(),platform==='android');
  if(platform==='android'){await page.locator('#reminderVibration').check();assert.equal(await page.locator('#reminderVibration').isChecked(),true);}
  const footer=await page.locator('.settings-footer').evaluate(el=>({text:el.innerText,rect:el.getBoundingClientRect().toJSON(),note:el.querySelector('.settings-note').getBoundingClientRect().toJSON()}));
  await page.screenshot({path:'.cache/always-sound/source-'+platform+'.png'});
  await page.locator('#file').setInputFiles({name:'old-muted.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.locator('#confirmAccept').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('whatToDoData')).preferences.reminders.sound),false);
  await page.locator('[data-page=tasks]').click();await page.locator('.task-play').first().click();
  if(platform!=='web')assert.equal(await page.evaluate(()=>window.payloads.filter(Boolean).at(-1).sound),true);
  await page.clock.fastForward(600001);await page.locator('#extendTimer').waitFor();
  const notes=await page.evaluate(()=>window.audioNotes);assert.equal(notes,3);
  await page.evaluate(()=>{window.nativeTimerLifecycle('background');window.nativeTimerLifecycle('resume')});await page.clock.fastForward(1000);assert.equal(await page.evaluate(()=>window.audioNotes),3);
  await page.reload();await page.locator('#extendTimer').waitFor();assert.equal(await page.evaluate(()=>window.audioNotes),0);
  await page.locator('#extendTimer').click();await page.evaluate(()=>window.nativeTimerLifecycle('background'));
  if(platform!=='web')assert.equal(await page.evaluate(()=>window.payloads.filter(Boolean).at(-1).sound),true);
  await page.clock.fastForward(86400000);await page.evaluate(()=>window.nativeTimerLifecycle('resume'));assert.equal(await page.evaluate(()=>window.audioNotes),0);
  results.push({platform,soundDOM:0,vibrationVisible:platform==='android',oldMutedImportPreserved:true,foregroundNotes:notes,nativeSound:platform==='web'?'not applicable':true,backgroundResumeNotes:0,reloadNotes:0,footer});await context.close();
 }
 fs.writeFileSync('.cache/always-sound/probe-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
