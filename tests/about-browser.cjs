// Run with: node_modules/electron/dist/electron.exe tests/about-browser.cjs --force-device-scale-factor=1
// Uses an isolated temporary profile and a local server. Never opens personal browser data.
const {app,BrowserWindow,Menu}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nowwhat-about-'));
app.setPath('userData',profile);app.disableHardwareAcceleration();
const output=path.join(root,'test-artifacts/about');fs.mkdirSync(output,{recursive:true});
const errors=[],prefix='/now-what-to-do/';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return}
    let name=decodeURIComponent(url.pathname.slice(prefix.length));if(!name||name.endsWith('/'))name+='index.html';
    const file=path.resolve(root,name);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}
    const size=fs.statSync(file).size,match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
    if(match){const start=Number(match[1]),end=Math.min(Number(match[2]||size-1),size-1);if(start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res)}
    else{res.writeHead(200,{...headers,'Content-Length':size});fs.createReadStream(file).pipe(res)}
  }catch(error){res.writeHead(500).end(error.message)}
});
let window;
const evaluate=expression=>window.webContents.executeJavaScript(expression,true);
const settled=()=>evaluate('document.fonts.ready.then(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))');
async function screenshot(name,selector){
  await evaluate(`document.documentElement.style.scrollBehavior='auto';${selector?`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start'});`:'scrollTo(0,0);'}`);
  await settled();await new Promise(resolve=>setTimeout(resolve,150));
  fs.writeFileSync(path.join(output,name+'.png'),(await window.webContents.capturePage()).toPNG());
}
app.whenReady().then(async()=>{
  Menu.setApplicationMenu(null);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  window=new BrowserWindow({width:1440,height:1000,show:false,frame:false,useContentSize:true,webPreferences:{offscreen:true,contextIsolation:true,sandbox:true,nodeIntegration:false,backgroundThrottling:false}});
  window.webContents.on('console-message',(_event,...args)=>{const details=args[0];if(typeof details==='object'&&details.level==='error')errors.push(details.message)});
  window.webContents.on('did-fail-load',(_event,code,description,url)=>errors.push(`${code} ${description} ${url}`));
  await window.loadURL(base+'about/');await settled();
  assert.equal(await evaluate('document.documentElement.lang'),'en','English on first visit');
  assert.equal(await evaluate('navigator.language').then(Boolean),true);
  assert.deepEqual(await evaluate('Object.keys(localStorage)'),[],'reading the page does not initialize app data');
  const widths=[1440,1024,768,700,390,360,320];
  for(const language of ['en','zh-CN','ja']){
    await evaluate(`document.querySelector('[data-lang="${language}"]').click()`);
    assert.equal(await evaluate('document.documentElement.lang'),language);
    assert.equal(await evaluate('document.querySelectorAll("[data-lang][aria-pressed=true]").length'),1);
    for(const width of widths){
      window.setContentSize(width,width<701?850:1000);await settled();
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`${language} ${width} no horizontal overflow`);
      assert.equal(await evaluate('[...document.querySelectorAll("h1>span")].every(e=>e.getClientRects().length===1)'),true,`${language} ${width} headline keeps its intended two lines`);
      assert.equal(await evaluate('[...document.querySelectorAll("[data-copy]")].every(e=>e.textContent.trim()!==""&&e.textContent!=="undefined")'),true,'all visible copy translated');
      if(width===1440||width===390){
        await screenshot(`hero-${language}-${width}`);
        await evaluate('document.querySelector("#today-review").scrollIntoView();document.querySelector("#historyShot").decode()');
        assert.equal(await evaluate('document.querySelector("#historyShot").src.includes("today-"+document.documentElement.lang+".png")'),true,'current screenshot follows the selected language');
        await screenshot(`today-${language}-${width}`,'#today-review');
      }
    }
  }
  const reloaded=new Promise(resolve=>window.webContents.once('did-finish-load',resolve));window.webContents.reload();await reloaded;await settled();
  assert.equal(await evaluate('document.documentElement.lang'),'ja','language persists across reload');
  await window.loadURL(base+'about/?lang=zh-CN');assert.equal(await evaluate('document.documentElement.lang'),'zh-CN','explicit language link overrides saved preference');
  await window.loadURL(base+'about/?lang=unsupported');assert.equal(await evaluate('document.documentElement.lang'),'ja','unsupported language falls back safely');
  // A denied localStorage must not stop language links or manual language switching.
  await window.webContents.debugger.attach('1.3');
  const injected=await window.webContents.debugger.sendCommand('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})"});
  await window.loadURL(base+'about/?lang=zh-CN');assert.equal(await evaluate('document.documentElement.lang'),'zh-CN');
  await evaluate('document.querySelector("[data-lang=ja]").click()');assert.equal(await evaluate('document.documentElement.lang'),'ja');
  await window.webContents.debugger.sendCommand('Page.removeScriptToEvaluateOnNewDocument',{identifier:injected.identifier});window.webContents.debugger.detach();
  await window.loadURL(base+'about/');
  await evaluate('localStorage.removeItem("nowWhat.about.language")');
  window.setContentSize(390,850);await window.loadURL(base+'about/');
  assert.equal(await evaluate('document.documentElement.lang'),'en');
  assert.equal(await evaluate('document.querySelector(".video-stage").dataset.format'),'mobile','portrait demo selected on mobile first visit');
  for(const format of ['windows','mobile']){
    await evaluate(`document.querySelector('[data-demo="${format}"]').click()`);
    const media=await evaluate(`(async()=>{const v=document.querySelector('video');await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('video timeout')),10000);v.addEventListener('loadedmetadata',()=>{clearTimeout(timeout);resolve()},{once:true});v.addEventListener('error',()=>reject(Error('video decode error')),{once:true});v.preload='metadata';v.load()});return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,paused:v.paused,autoplay:v.autoplay,controls:v.controls}})()`);
    assert.equal(media.duration,14);assert.equal(media.width,format==='windows'?1920:1080);assert.equal(media.height,format==='windows'?1080:1920);assert.equal(media.paused,true);assert.equal(media.autoplay,false);assert.equal(media.controls,true);
    await evaluate(`(async()=>{const v=document.querySelector('video');v.muted=true;await v.play();await new Promise(resolve=>setTimeout(resolve,250));if(v.paused||v.currentTime===0)throw Error('Video failed to play');v.pause();v.currentTime=0})()`);
  }
  await screenshot('demo-en-mobile','#demo');
  await screenshot('download-en-mobile','#download');
  window.setContentSize(1440,1000);await evaluate('document.querySelector("[data-demo=windows]").click()');await screenshot('demo-en-desktop','#demo');await screenshot('download-en-desktop','#download');
  const fullHeight=await evaluate('document.documentElement.scrollHeight');window.setContentSize(1440,fullHeight);await screenshot('full-en-desktop');window.setContentSize(1440,1000);
  const broken=await evaluate(`(async()=>{const paths=[...document.querySelectorAll('link[href],script[src],img[src],video[poster],source[src]')].flatMap(e=>[e.href,e.src,e.poster].filter(Boolean));const bad=[];for(const url of paths){const r=await fetch(url);if(!r.ok)bad.push(url)}return bad})()`);assert.deepEqual(broken,[],'page assets resolve under a GitHub Pages project prefix');
  // Seed real activities and a paused timer through the existing app, then leave and return.
  await window.loadURL(base);await settled();
  await evaluate(`document.querySelector('#quickName').value='Read a book';document.querySelector('#quickAddForm').requestSubmit();document.querySelector('#start').click();pauseTimer()`);
  const before=await evaluate('[localStorage.getItem("whatToDoData"),localStorage.getItem("activeTimer")]');assert.ok(before.every(Boolean));
  await window.loadURL(base+'about/');await evaluate(`document.querySelector('[data-lang="zh-CN"]').click();document.querySelector('[data-lang="ja"]').click()`);
  assert.deepEqual(await evaluate('[localStorage.getItem("whatToDoData"),localStorage.getItem("activeTimer")]'),before,'promotion page leaves activities and timer untouched');
  const appLink=await evaluate('document.querySelector(".hero .button").href');assert.equal(appLink,base+'index.html');
  await window.loadURL(appLink);await settled();
  assert.equal(await evaluate('d.tasks[0].name'),'Read a book');assert.equal(await evaluate('document.querySelector("#timer").classList.contains("hide")'),false,'returning to the tool restores the existing timer');
  // Directly opening the promotional HTML must open the tool, never a file directory listing.
  await window.loadFile(path.join(root,'about/index.html'));await settled();
  const fileAppUrl=require('node:url').pathToFileURL(path.join(root,'index.html')).href;
  const fileLinks=await evaluate('[...document.querySelectorAll("[data-copy=open],[data-copy=browserAlternative]")].map(a=>a.href)');
  assert.deepEqual(fileLinks,[fileAppUrl,fileAppUrl]);
  await window.loadURL(fileLinks[0]);await settled();
  assert.equal(await evaluate('location.href.split("#")[0]'),fileAppUrl);
  assert.equal(await evaluate('Boolean(document.querySelector("#quickAddForm"))'),true,'local link opens the real tool page');
  assert.deepEqual(errors,[]);
  console.log('PASS multilingual page at 7 viewport widths, English default, persistence and language links');
  console.log('PASS both 14-second videos decode and play, no autoplay, all local media resolves');
  console.log('PASS original app URL and existing activities/timer survive visiting the promotional page');
  console.log('PASS direct local HTML links open index.html instead of a directory listing');
  console.log('Screenshots: '+output);app.exit(0);
}).catch(error=>{console.error(error);app.exit(1)});
