// Runs the built Windows host with a temporary synthetic profile, never user data.
const {chromium,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs/promises'),path=require('node:path'),net=require('node:net');
const root=path.resolve(__dirname,'..');
let child,browser;
async function closeHost(){
 if(!child||child.exitCode!==null)return;
 execFileSync('powershell.exe',['-NoProfile','-Command',`Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class BookSmokeClose { [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr window, uint message, IntPtr w, IntPtr l); }'; [BookSmokeClose]::PostMessage((Get-Process -Id ${child.pid}).MainWindowHandle,16,[IntPtr]::Zero,[IntPtr]::Zero) | Out-Null`],{windowsHide:true});
 await Promise.race([new Promise(resolve=>child.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,4000))]);
 if(child.exitCode===null)child.kill();
}
(async()=>{
 await fs.mkdir(path.join(root,'test-artifacts'),{recursive:true});
 const profile=await fs.mkdtemp(path.join(root,'test-artifacts/book-native-'));
 const output=path.join(profile,'exports');await fs.mkdir(output);
 async function launch(){
   const server=net.createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;await new Promise(resolve=>server.close(resolve));
   const payload=process.env.NOWWHAT_NATIVE_DIR||path.join(root,'dist/windows/webview2-unpacked');
   child=spawn(path.join(payload,'Now What.exe'),[],{cwd:root,windowsHide:true,env:{...process.env,NOWWHAT_E2E:'1',NOWWHAT_E2E_PORT:String(port),NOWWHAT_E2E_PROFILE:profile,NOWWHAT_E2E_SAVE_DIR:output},stdio:'ignore'});
   let ready=false;
   for(let n=0;n<100;n++){try{await fetch(`http://127.0.0.1:${port}/json/version`);ready=true;break}catch{await new Promise(resolve=>setTimeout(resolve,100))}}
   if(!ready)throw Error('Native CDP unavailable');
   browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
   const page=browser.contexts()[0].pages()[0];await page.waitForURL('https://nowwhat.local/index.html');await expect(page.locator('#book')).toBeAttached();return page;
 }
 let page=await launch();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.locator('#quickName').fill('Native synthetic activity');await page.locator('#addFirstTask').click();
 const isolation=await page.evaluate(()=>[location.origin,typeof require,typeof process,typeof window.nativeApp.exportText]);
 require('node:assert/strict').deepEqual(isolation,['https://nowwhat.local','undefined','undefined','function']);
 const assets=await page.evaluate(async()=>{
   await document.fonts.ready;
   const images=await Promise.all(['assets/environment.webp','assets/plant-4.svg'].map(url=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image.naturalWidth>0);image.onerror=()=>resolve(false);image.src=url})));
   const font=new FontFace('NativeProbe','url(assets/fonts/eb-garamond/files/eb-garamond-latin-wght-normal.woff2)');
   await font.load();return [...images,font.status==='loaded'];
 });
 require('node:assert/strict').deepEqual(assets,[true,true,true]);
 await page.locator('.bookmarks [data-page="settings"]').click();await page.locator('#export').click();
 await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(path.join(output,'what-to-do-backup.json'),'utf8')).tasks[0].name}catch{return null}}).toBe('Native synthetic activity');
 await page.locator('.bookmarks [data-page="home"]').click();await page.locator('#start').click();await page.locator('#pauseTimer').click();
 // The host's transparent test window supports DOM checks; screenshots are covered
 // by the production browser suite, not falsely reported as native visual proof.
 const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('activeTimer')).completionId);
 await closeHost();page=await launch();
 await expect(page.locator('#timerRecoveryName')).toHaveText('Native synthetic activity');
 await page.locator('#finishRecoveryTimer').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('whatToDoData')));
 require('node:assert/strict').equal(saved.completed.length,1);require('node:assert/strict').equal(saved.completed[0].completionId,id);
 console.log(JSON.stringify({status:'PASS',profile,webview:browser.version(),checks:['isolated profile and unchanged origin','native default language','book DOM','real native file export','pause and close','reopen recovery','single completion']}));
 await closeHost();
})().catch(async error=>{console.error(error);await closeHost().catch(()=>{});process.exitCode=1});
