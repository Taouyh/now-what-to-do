// Exercises a hidden desktop window and a dedicated synthetic profile, never the user's app data.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),mode=process.argv.includes('--webview2')?'webview2':process.argv.includes('--packaged')?'packaged':'development';
const packagedDir=process.env.NOWWHAT_PACKAGED_DIR||path.join(root,'dist/windows/win-unpacked');
const executable=mode==='webview2'?path.join(process.env.NOWWHAT_NATIVE_DIR||path.join(root,'dist/windows/webview2-unpacked'),'Now What.exe'):mode==='packaged'?path.join(packagedDir,'Now What.exe'):path.join(root,'node_modules/electron/dist/electron.exe');
const origin=mode==='webview2'?'https://nowwhat.local':'nowwhat://app';
let child,socket,serial=0;const pending=new Map();
async function run(){
 await fs.mkdir(path.join(root,'test-artifacts'),{recursive:true});
 const profile=await fs.mkdtemp(path.join(root,'test-artifacts/desktop-profile-'));const output=path.join(root,'test-artifacts/desktop');await fs.mkdir(output,{recursive:true});
 async function launch(){
  const server=require('node:net').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
  child=spawn(executable,[...(mode==='development'?[root]:[]),'--lang=zh-CN','--remote-debugging-port=0'],{cwd:root,env:{...process.env,NOWWHAT_E2E:'1',NOWWHAT_E2E_PORT:String(port),NOWWHAT_E2E_PROFILE:profile,NOWWHAT_E2E_SAVE_DIR:output},windowsHide:true,stdio:['ignore','ignore','pipe']});
  let endpoint;
  if(mode==='webview2'){
   for(let i=0;i<200;i++){if(child.exitCode!==null)throw Error('Native host exited: '+await fs.readFile(path.join(profile,'startup-error.txt'),'utf8').catch(()=>child.exitCode));try{endpoint=(await (await fetch('http://127.0.0.1:'+port+'/json/version')).json()).webSocketDebuggerUrl;break}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(endpoint,'WebView2 CDP startup');
  }else endpoint=await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('Desktop startup timed out: '+logs)),20000);child.on('error',reject);child.on('exit',code=>{clearTimeout(timer);reject(Error('Desktop exited: '+code+' '+logs))});child.stderr.on('data',chunk=>{logs+=chunk;const match=logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1])}})});
  socket=new WebSocket(endpoint);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(!message.id)return;const item=pending.get(message.id);if(item){pending.delete(message.id);clearTimeout(item.timer);message.error?item.reject(Error(message.error.message)):item.resolve(message.result)}});
  let page;for(let i=0;i<100;i++){const {targetInfos}=await send('Target.getTargets');page=targetInfos.find(t=>t.type==='page'&&t.url.startsWith(origin+'/'));if(page)break;await new Promise(r=>setTimeout(r,50))}assert.ok(page,'local application document');
  const {sessionId}=await send('Target.attachToTarget',{targetId:page.targetId,flatten:true});
  const evaluate=async code=>{const result=await send('Runtime.evaluate',{expression:'(async()=>{'+code+'})()',awaitPromise:true,returnByValue:true},sessionId);if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
  for(let i=0;i<100;i++){if(await evaluate("return typeof setLanguage==='function'&&!!document.getElementById('quickName')"))break;await new Promise(r=>setTimeout(r,50))}
  return {evaluate,sessionId};
 }
 function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'))},10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,sessionId}))})}
 async function close(){const proc=child;const ended=new Promise(resolve=>proc.once('exit',resolve));if(mode==='webview2'){const result=spawnSync('powershell.exe',['-NoProfile','-Command',`Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class NowWhatTestClose { [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr window, uint message, IntPtr wp, IntPtr lp); }'; [NowWhatTestClose]::PostMessage((Get-Process -Id ${proc.pid}).MainWindowHandle,16,[IntPtr]::Zero,[IntPtr]::Zero) | Out-Null`],{windowsHide:true,encoding:'utf8'});assert.equal(result.status,0,result.stderr)}else await send('Browser.close').catch(()=>{});await Promise.race([ended,new Promise(resolve=>setTimeout(resolve,5000))]);socket.close();if(proc.exitCode===null)proc.kill();}
 let {evaluate:runPage,sessionId}=await launch();
 assert.deepEqual(await runPage("return [location.origin,typeof require,typeof process,typeof nativeApp.exportText,document.querySelector('main').inert]"),[origin,'undefined','undefined','function',false]);console.log('PASS isolated sandboxed local application');
 assert.deepEqual(await runPage("return [language,d.preferences.language,nativeApp.defaultLanguage,document.documentElement.lang]"),['en','en','en','en']);console.log('PASS first launch defaults to English regardless of system language');
 for(const locale of ['zh-CN','en','ja']){
  await runPage(`setLanguage('${locale}')`);
  assert.deepEqual(await runPage("return [document.title,document.querySelector('.brand').textContent.trim(),nativeApp.productName]"),['Now What','Now What','Now What']);
  const {targetInfos}=await send('Target.getTargets');
  assert.equal(targetInfos.find(t=>t.type==='page'&&t.url.startsWith(origin+'/')).title,'Now What');
 }
 console.log('PASS English product name, title and header in all three interface languages');
 await new Promise(r=>setTimeout(r,5000));
 const memory=await send('SystemInfo.getProcessInfo');
 const usage=spawnSync('powershell.exe',['-NoProfile','-Command',`Get-Process -Id ${[...new Set([...memory.processInfo.map(p=>Number(p.id)),child.pid])].join(',')} -ErrorAction SilentlyContinue | Select-Object Id,WorkingSet64,PrivateMemorySize64 | ConvertTo-Json -Compress`],{windowsHide:true,encoding:'utf8'});
 if(usage.status===0&&usage.stdout.trim()){
  const rows=[JSON.parse(usage.stdout)].flat();
  const snapshot={mode,processes:rows.length,privateMiB:Math.round(rows.reduce((n,p)=>n+p.PrivateMemorySize64,0)/1048576),workingSetMiB:Math.round(rows.reduce((n,p)=>n+p.WorkingSet64,0)/1048576)};
  console.log('Memory snapshot (engine processes plus native host): '+JSON.stringify(snapshot));
  await fs.writeFile(path.join(output,'memory-'+mode+'.json'),JSON.stringify(snapshot,null,2));
 }
 await runPage("setLanguage('zh-CN');$('quickName').value='读书';$('quickAddForm').requestSubmit();setLanguage('en');page('settings')");
 assert.deepEqual(await runPage("return [d.tasks.length,d.tasks[0].name,$('settingsTitle').textContent]"),[1,'读书','Settings']);
 await runPage("await nativeApp.exportText(JSON.stringify(d),'what-to-do-backup.json')");
 const backup=JSON.parse(await fs.readFile(path.join(output,'what-to-do-backup.json'),'utf8'));assert.equal(backup.tasks[0].name,'读书');assert.equal(backup.preferences.language,'en');console.log('PASS language switching, task creation and native backup export');
 assert.equal(await runPage("try{await nativeApp.exportText('{}','../escape.json');return false}catch{return true}"),true);console.log('PASS export rejects unsafe filenames');
 await runPage("page('home');$('quickName').value='Take a walk';$('quickAddForm').requestSubmit();run(d.tasks[0])");
 if(mode==='webview2'){
  const setState=command=>{const result=spawnSync('powershell.exe',['-NoProfile','-Command',`Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class NowWhatTestWindow { [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr window, int command); }'; [NowWhatTestWindow]::ShowWindow((Get-Process -Id ${child.pid}).MainWindowHandle,${command}) | Out-Null`],{windowsHide:true,encoding:'utf8'});assert.equal(result.status,0,result.stderr)};
  const beforeMinimize=await runPage('return activeElapsedMs(timerState())');setState(6);await new Promise(r=>setTimeout(r,5000));
  const ids=[...new Set([...memory.processInfo.map(p=>Number(p.id)),child.pid])];
  const measured=spawnSync('powershell.exe',['-NoProfile','-Command',`Get-Process -Id ${ids.join(',')} -ErrorAction SilentlyContinue | Select-Object Id,WorkingSet64,PrivateMemorySize64 | ConvertTo-Json -Compress`],{windowsHide:true,encoding:'utf8'});
  assert.equal(measured.status,0);const rows=[JSON.parse(measured.stdout)].flat();console.log('Minimized snapshot (native host included): '+JSON.stringify({processes:rows.length,privateMiB:Math.round(rows.reduce((n,p)=>n+p.PrivateMemorySize64,0)/1048576),workingSetMiB:Math.round(rows.reduce((n,p)=>n+p.WorkingSet64,0)/1048576)}));
  setState(9);assert.ok(await runPage('return activeElapsedMs(timerState())')>=beforeMinimize+4500);console.log('PASS minimized memory target preserves running timer');
 }
 await runPage("pauseTimer();page('settings');setLanguage('ja')");
 const before=await runPage("return localStorage.getItem('activeTimer')");
 assert.deepEqual(await runPage("return [timerState().paused,$('settingsTitle').textContent]"),[true,'設定']);
 const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);await fs.writeFile(path.join(output,'settings-'+mode+'.png'),Buffer.from(screenshot.data,'base64'));
 await close();({evaluate:runPage}=await launch());
 assert.deepEqual(await runPage("return [language,d.tasks[0].name,timerState().paused,timerState().recoveryReason,timerState().elapsed]"),['ja','读书',true,'reopen',JSON.parse(before).elapsed]);console.log('PASS native window close checkpoints and app restart waits for recovery');
 await runPage("page('home');$('finishRecoveryTimer').click()");assert.equal(await runPage('return d.completed.length'),1);assert.equal(await runPage("return document.querySelector('#home').classList.contains('hide')"),false);assert.equal(await runPage("return $('recommendedTaskName').textContent"),'Take a walk');console.log('PASS session ends and records exactly once, returning Home with another activity');
 await runPage('run(d.tasks[1])');await new Promise(resolve=>setTimeout(resolve,650));
 const runningId=await runPage('return timerState().completionId'),beforeCloseElapsed=await runPage('return activeElapsedMs(timerState())'),beforeCloseAt=Date.now();await close();const closedAt=Date.now();({evaluate:runPage}=await launch());
 assert.deepEqual(await runPage('return [timerState().completionId,timerState().paused,timerState().recoveryReason,d.completed.length]'),[runningId,true,'reopen',1]);
 const frozenElapsed=await runPage('return timerState().elapsed');assert.ok(frozenElapsed>=beforeCloseElapsed-50&&frozenElapsed<=beforeCloseElapsed+closedAt-beforeCloseAt+250,JSON.stringify({frozenElapsed,beforeCloseElapsed,closeDuration:closedAt-beforeCloseAt}));
 await new Promise(resolve=>setTimeout(resolve,300));assert.equal(await runPage('return timerState().elapsed'),frozenElapsed);
 await runPage("$('finishRecoveryTimer').click()");assert.equal(await runPage('return d.completed.length'),2);console.log('PASS closing a running native session saves its latest progress without charging time away');
 // Exercise the real file-input and confirmation path with the exported, synthetic backup.
 const {sessionId:importSession}=await send('Target.attachToTarget',{targetId:(await send('Target.getTargets')).targetInfos.find(t=>t.type==='page'&&t.url.startsWith(origin+'/')).targetId,flatten:true});
 const {root:dom}=await send('DOM.getDocument',{},importSession);const {nodeId}=await send('DOM.querySelector',{nodeId:dom.nodeId,selector:'#file'},importSession);
 await send('DOM.setFileInputFiles',{nodeId,files:[path.join(output,'what-to-do-backup.json')]},importSession);
 for(let i=0;i<100;i++){if(await runPage("return !$('confirmLayer').classList.contains('hide')"))break;await new Promise(r=>setTimeout(r,50))}
 assert.ok(await runPage('return pendingImport!==null'));await runPage("$('confirmAccept').click()");assert.equal(await runPage('return d.tasks.length'),1);assert.equal(await runPage('return d.tasks[0].name'),'读书');console.log('PASS native file input restores an exported backup through the confirmation flow');
 await close();console.log('Desktop '+mode+' checks passed.');
}
run().catch(error=>{console.error(error);if(socket)socket.close();if(child&&child.exitCode===null)child.kill();process.exitCode=1});
