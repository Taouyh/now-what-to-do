// Exercises a hidden desktop window and a dedicated synthetic profile, never the user's app data.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),mode=process.argv.includes('--packaged')?'packaged':'development';
const packagedDir=process.env.NOWWHAT_PACKAGED_DIR||path.join(root,'dist/windows/win-unpacked');
const executable=mode==='packaged'?path.join(packagedDir,'Now What.exe'):path.join(root,'node_modules/electron/dist/electron.exe');
let child,socket,serial=0;const pending=new Map();
async function run(){
 await fs.mkdir(path.join(root,'test-artifacts'),{recursive:true});
 const profile=await fs.mkdtemp(path.join(root,'test-artifacts/desktop-profile-'));const output=path.join(root,'test-artifacts/desktop');await fs.mkdir(output,{recursive:true});
 async function launch(){
  child=spawn(executable,[...(mode==='development'?[root]:[]),'--lang=zh-CN','--remote-debugging-port=0'],{cwd:root,env:{...process.env,NOWWHAT_E2E:'1',NOWWHAT_E2E_PROFILE:profile,NOWWHAT_E2E_SAVE_DIR:output},windowsHide:true,stdio:['ignore','ignore','pipe']});
  const endpoint=await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('Desktop startup timed out: '+logs)),20000);child.on('error',reject);child.on('exit',code=>{clearTimeout(timer);reject(Error('Desktop exited: '+code+' '+logs))});child.stderr.on('data',chunk=>{logs+=chunk;const match=logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1])}})});
  socket=new WebSocket(endpoint);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(!message.id)return;const item=pending.get(message.id);if(item){pending.delete(message.id);clearTimeout(item.timer);message.error?item.reject(Error(message.error.message)):item.resolve(message.result)}});
  let page;for(let i=0;i<100;i++){const {targetInfos}=await send('Target.getTargets');page=targetInfos.find(t=>t.type==='page'&&t.url.startsWith('nowwhat://app/'));if(page)break;await new Promise(r=>setTimeout(r,50))}assert.ok(page,'local application document');
  const {sessionId}=await send('Target.attachToTarget',{targetId:page.targetId,flatten:true});
  const evaluate=async code=>{const result=await send('Runtime.evaluate',{expression:'(async()=>{'+code+'})()',awaitPromise:true,returnByValue:true},sessionId);if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
  for(let i=0;i<100;i++){if(await evaluate("return typeof setLanguage==='function'&&!!document.getElementById('quickName')"))break;await new Promise(r=>setTimeout(r,50))}
  return {evaluate,sessionId};
 }
 function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'))},10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,sessionId}))})}
 async function close(){const proc=child;const ended=new Promise(resolve=>proc.once('exit',resolve));await send('Browser.close').catch(()=>{});await Promise.race([ended,new Promise(resolve=>setTimeout(resolve,5000))]);socket.close();if(proc.exitCode===null)proc.kill();}
 let {evaluate:runPage,sessionId}=await launch();
 assert.deepEqual(await runPage("return [location.origin,typeof require,typeof process,typeof nativeApp.exportText,document.querySelector('main').inert]"),['nowwhat://app','undefined','undefined','function',false]);console.log('PASS isolated sandboxed local application');
 assert.deepEqual(await runPage("return [language,d.preferences.language,nativeApp.defaultLanguage,document.documentElement.lang]"),['en','en','en','en']);console.log('PASS first launch defaults to English regardless of system language');
 for(const locale of ['zh-CN','en','ja']){
  await runPage(`setLanguage('${locale}')`);
  assert.deepEqual(await runPage("return [document.title,document.querySelector('.brand').textContent.trim(),nativeApp.productName]"),['Now What','Now What','Now What']);
  const {targetInfos}=await send('Target.getTargets');
  assert.equal(targetInfos.find(t=>t.type==='page'&&t.url.startsWith('nowwhat://app/')).title,'Now What');
 }
 console.log('PASS English product name, title and header in all three interface languages');
 const memory=await send('SystemInfo.getProcessInfo');
 const usage=spawnSync('powershell.exe',['-NoProfile','-Command',`Get-Process -Id ${memory.processInfo.map(p=>Number(p.id)).join(',')} -ErrorAction SilentlyContinue | Select-Object Id,WorkingSet64,PrivateMemorySize64 | ConvertTo-Json -Compress`],{windowsHide:true,encoding:'utf8'});
 if(usage.status===0&&usage.stdout.trim()){
  const rows=[JSON.parse(usage.stdout)].flat();
  console.log('Memory snapshot (browser-listed processes): '+JSON.stringify({processes:rows.length,privateMiB:Math.round(rows.reduce((n,p)=>n+p.PrivateMemorySize64,0)/1048576),workingSetMiB:Math.round(rows.reduce((n,p)=>n+p.WorkingSet64,0)/1048576)}));
 }
 await runPage("setLanguage('zh-CN');$('quickName').value='读书';$('quickAddForm').requestSubmit();setLanguage('en');page('settings')");
 assert.deepEqual(await runPage("return [d.tasks.length,d.tasks[0].name,$('settingsTitle').textContent]"),[1,'读书','Settings']);
 await runPage("await nativeApp.exportText(JSON.stringify(d),'what-to-do-backup.json')");
 const backup=JSON.parse(await fs.readFile(path.join(output,'what-to-do-backup.json'),'utf8'));assert.equal(backup.tasks[0].name,'读书');assert.equal(backup.preferences.language,'en');console.log('PASS language switching, task creation and native backup export');
 assert.equal(await runPage("try{await nativeApp.exportText('{}','../escape.json');return false}catch{return true}"),true);console.log('PASS export rejects unsafe filenames');
 await runPage("page('home');run(d.tasks[0]);pauseTimer();page('settings');setLanguage('ja')");
 const before=await runPage("return localStorage.getItem('activeTimer')");
 assert.deepEqual(await runPage("return [timerState().paused,$('settingsTitle').textContent]"),[true,'設定']);
 const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);await fs.writeFile(path.join(output,'settings-'+mode+'.png'),Buffer.from(screenshot.data,'base64'));
 await close();({evaluate:runPage}=await launch());
 assert.deepEqual(await runPage("return [language,d.tasks[0].name,timerState().paused,localStorage.getItem('activeTimer')]"),['ja','读书',true,before]);console.log('PASS app restart preserves language, tasks and paused timer');
 await runPage("page('home');openTimerEnd();$('confirmAccept').click()");assert.equal(await runPage('return d.completed.length'),1);console.log('PASS session ends and records exactly once');
 await close();console.log('Desktop '+mode+' checks passed.');
}
run().catch(error=>{console.error(error);if(socket)socket.close();if(child&&child.exitCode===null)child.kill();process.exitCode=1});
