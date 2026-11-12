// Run from repository root. Uses an isolated-identity copy by default, or an explicitly hash-verified rebuilt host.
// This validates the real host's E2E schedule log, NOT Windows OS notification delivery.
const {chromium,expect}=require('@playwright/test');const {spawn,execFileSync}=require('child_process');const fs=require('fs/promises'),path=require('path'),net=require('net');
const nativeDir=process.env.NOWWHAT_NATIVE_DIR||'.cache/native-audit';
const binary=require('fs').readFileSync(path.join(nativeDir,'Now What.exe'));
const expectedHash=process.env.NOWWHAT_NATIVE_SHA256;
if(expectedHash){if(require('crypto').createHash('sha256').update(binary).digest('hex').toLowerCase()!==expectedHash.toLowerCase())throw Error('Native executable hash mismatch');}
else if(binary.includes(Buffer.from('io.github.taouyh.nowwhat','utf16le'))||!binary.includes(Buffer.from('io.github.audit1.nowwhat','utf16le')))throw Error('Notification identity is not isolated; refusing to launch');
let child,browser;const root=process.cwd();
function message(msg,w=0){execFileSync('powershell.exe',['-NoProfile','-Command',`Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class AuditMsg{public delegate bool Proc(IntPtr h,IntPtr l);[DllImport("user32.dll")]public static extern bool EnumWindows(Proc cb,IntPtr l);[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);[DllImport("user32.dll")]public static extern bool PostMessage(IntPtr h,uint m,IntPtr w,IntPtr l);public static IntPtr Find(uint pid){IntPtr r=IntPtr.Zero;EnumWindows((h,l)=>{uint p;GetWindowThreadProcessId(h,out p);if(p==pid){r=h;return false;}return true;},IntPtr.Zero);return r;}}';[AuditMsg]::PostMessage(([AuditMsg]::Find(${child.pid})),${msg},[IntPtr]${w},[IntPtr]::Zero)|Out-Null`],{windowsHide:true})}
(async()=>{const profile=await fs.mkdtemp(path.join(root,'test-artifacts/reminder-native-'));const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
child=spawn(path.resolve(nativeDir,'Now What.exe'),[],{windowsHide:true,env:{...process.env,NOWWHAT_E2E:'1',NOWWHAT_E2E_PROFILE:profile,NOWWHAT_E2E_PORT:String(port)},stdio:'ignore'});
for(let i=0;i<100;i++){try{await fetch(`http://127.0.0.1:${port}/json/version`);break}catch{await new Promise(r=>setTimeout(r,100))}}
browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);const page=browser.contexts()[0].pages()[0];await expect(page.locator('#book')).toBeAttached();
await page.addInitScript(()=>{window.__auditMessages=[];const original=chrome.webview.postMessage.bind(chrome.webview);chrome.webview.postMessage=p=>{if(p?.kind==='reminder:sync')window.__auditMessages.push(p);return original(p)}});
await page.evaluate(()=>{const now=Date.now(),task={id:'audit',name:'Native reminder audit',requirements:{},enabled:true};localStorage.setItem('whatToDoData',JSON.stringify({version:2,tasks:[task],goals:[],completed:[],preferences:{time:10,language:'en',conditions:{},reminders:{sound:false,vibration:false}},theme:'light'}));localStorage.setItem('activeTimer',JSON.stringify({timerVersion:2,reminderVersion:1,completionId:'audit-native-round',taskId:task.id,task,taskName:task.name,startedAt:now-580000,lastStarted:now,elapsed:580000,durationMs:600000,plannedDurationMs:600000,extensionDurationMs:0,paused:false,finished:false,soundPlayed:false,checkpointAt:now}));});await page.reload();await expect(page.locator('html')).toHaveAttribute('data-app-ready','true');message(6,0);
const log=path.join(profile,'reminder-schedule.json');await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(log,'utf8')).background}catch{return null}}).toBe(true);const schedule=JSON.parse(await fs.readFile(log,'utf8'));if(schedule.sound!==false)throw Error('mute not synchronized');
await expect(page.locator('#timerStatus')).toHaveText('Time is up',{timeout:30000});const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('activeTimer')));if(state.elapsed!==600000||!state.soundPlayed||state.reminderConsumed!==false)throw Error('background round not capped/pending');
message(0x8000+41);await expect(page.locator('#extendTimer')).toBeVisible();await expect(page.locator('#finishTimer')).toBeVisible();
await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('activeTimer')).reminderConsumed)).toBe(true);
message(6,0);await expect.poll(()=>page.evaluate(()=>window.__auditMessages.at(-1)?.payload)).toBe(null);
await page.locator('#finishTimer').click();const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('whatToDoData')).completed);if(records.length!==1||records[0].completionId!=='audit-native-round')throw Error('wrong record');
const powerMessages=[];
for(const old of [false,true]){
  await page.evaluate(()=>{const now=Date.now(),task=JSON.parse(localStorage.getItem('whatToDoData')).tasks[0];localStorage.setItem('activeTimer',JSON.stringify({timerVersion:2,reminderVersion:1,completionId:'sleep-'+now,taskId:task.id,task,taskName:task.name,startedAt:now,lastStarted:now,elapsed:0,durationMs:600000,plannedDurationMs:600000,extensionDurationMs:0,paused:false,finished:false,soundPlayed:false,checkpointAt:now}));});
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-app-ready','true');
  if(old)await page.evaluate(()=>{const x=JSON.parse(localStorage.getItem('activeTimer'));delete x.reminderVersion;localStorage.setItem('activeTimer',JSON.stringify(x));});
  // Actual messages to the real host; the machine itself is not put to sleep.
  message(0x218,4);await page.waitForTimeout(1500);message(0x218,18);
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('activeTimer')).elapsed)).toBeGreaterThanOrEqual(1500);
  const resumed=await page.evaluate(()=>JSON.parse(localStorage.getItem('activeTimer')));
  if(resumed.paused||resumed.recoveryReason||resumed.reminderVersion!==1||resumed.elapsed>=15000)throw Error('native power-message continuation failed');
  powerMessages.push({oldLiveV2:old,elapsed:resumed.elapsed,paused:resumed.paused,reminderVersion:resumed.reminderVersion});
  await page.locator('#pauseTimer').click();await expect.poll(()=>page.evaluate(()=>window.__auditMessages.at(-1)?.payload)).toBe(null);
}
console.log(JSON.stringify({status:'PASS',profile,webview:browser.version(),schedule,powerMessages,checks:['real native background message and scheduled payload','mute preference on bridge','deadline caps at 600000ms and keeps background pending','native activation consumes and opens actions','background after activation sends null','explicit finish records once','new and old-live timers continue across host power messages','explicit pause sends null'],actualOsNotifications:false,actualMachineSleep:false}));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(child){try{message(16)}catch{}await new Promise(r=>setTimeout(r,2000));if(child.exitCode===null)child.kill()}if(browser)await browser.close()});
