// Run after build:web and assemble-site. Fresh browser context; synthetic storage only.
const {chromium,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist/site'),out=path.resolve(__dirname,'../.cache/promo-videos-test');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!pathname.startsWith('/now-what-to-do/'))return res.writeHead(404).end();
 const file=path.resolve(root,pathname.slice('/now-what-to-do/'.length)+(pathname.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();
 const size=fs.statSync(file).size,m=/bytes=(\d+)-(\d*)/.exec(req.headers.range||''),headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
 if(m){const start=+m[1],end=m[2]?Math.min(+m[2],size-1):size-1;res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
 else{res.writeHead(200,{...headers,'Content-Length':size});fs.createReadStream(file).pipe(res);}
});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}/now-what-to-do/`;
 browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({locale:'ja-JP'});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('whatToDoData','synthetic-app-data');localStorage.setItem('activeTimer','synthetic-timer');localStorage.setItem('nowWhat.about.language','ja');});
 await page.goto(base+'about/?lang=zh-CN');await expect(page.locator('html')).toHaveAttribute('lang','en');
 const trigger=page.locator('.language-trigger'),menu=page.locator('.language-options');
 await expect(menu).toBeHidden();await trigger.dispatchEvent('click');await expect(menu).toBeHidden();
 for(const width of [1531,1024,768,700,390,360,320]){
  await page.setViewportSize({width,height:900});
  for(const lang of ['en','zh-CN','ja']){
   await trigger.hover();await expect(menu).toBeVisible();
   await page.locator(`[data-lang="${lang}"]`).hover();await expect(menu).toBeVisible();
   await page.locator(`[data-lang="${lang}"]`).click();await expect(page.locator('html')).toHaveAttribute('lang',lang);await expect(menu).toBeHidden();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}/${lang} page overflow`);
   assert.equal(await page.locator('#getApp').getAttribute('href'),'https://github.com/Taouyh/now-what-to-do/releases');
   assert.deepEqual(await page.locator('.download').evaluateAll(els=>els.map(el=>el.href)),Array(2).fill('https://github.com/Taouyh/now-what-to-do/releases'));
   assert.equal(await page.locator('[data-lang][aria-pressed="true"]').count(),1);
   await trigger.hover();
   const style=await page.evaluate(()=>{
    const a=getComputedStyle(document.querySelector('#navDemo')),b=getComputedStyle(document.querySelector('[data-lang][aria-pressed="false"]')),c=getComputedStyle(document.querySelector('[data-lang][aria-pressed="true"]'));
    return {a:[a.borderRadius,a.borderWidth,a.fontSize,a.padding,a.minHeight],b:[b.borderRadius,b.borderWidth,b.fontSize,b.padding,b.minHeight],selected:c.backgroundColor,plain:b.backgroundColor};
   });assert.deepEqual(style.a,style.b);assert.notEqual(style.selected,style.plain);
   await page.evaluate(()=>document.fonts.ready);
   if(width===1531||width===390)await page.screenshot({path:path.join(out,`menu-${lang}-${width}.png`),fullPage:true});
   await page.mouse.move(1,850);await expect(menu).toBeHidden();
  }
 }
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
 await trigger.focus();await page.keyboard.press('ArrowDown');await expect(menu).toBeVisible();await page.keyboard.press('Escape');await expect(menu).toBeHidden();
 assert.deepEqual(await page.evaluate(()=>[localStorage.getItem('whatToDoData'),localStorage.getItem('activeTimer')]),['synthetic-app-data','synthetic-timer']);
 const metadataList=[];
 for(const id of ['desktop-demo','android-demo']){
 const video=page.locator('#'+id+' video');await video.scrollIntoViewIfNeeded();
 const metadata=await video.evaluate(async v=>{v.preload='auto';v.load();await new Promise((resolve,reject)=>{v.onloadedmetadata=resolve;v.onerror=()=>reject(Error('video failed'));});v.muted=true;await v.play();await new Promise(r=>setTimeout(r,350));const result={duration:v.duration,width:v.videoWidth,height:v.videoHeight,time:v.currentTime,paused:v.paused};v.pause();return result;});
 assert.ok(metadata.duration>=59&&metadata.duration<60);assert.equal(metadata.width,id==='desktop-demo'?1920:1080);assert.equal(metadata.height,id==='desktop-demo'?1080:1920);assert.ok(metadata.time>0);assert.equal(metadata.paused,false);metadataList.push({id,...metadata});
 const box=await video.boundingBox();assert.ok(Math.abs(box.width/box.height-metadata.width/metadata.height)<0.01);if(id==='android-demo')assert.ok(box.width<=360);
 const poster=await video.getAttribute('poster');assert.equal((await page.request.get(new URL(poster,page.url()).href)).status(),200);
 }
 const broken=await page.evaluate(async()=>{const urls=[...document.querySelectorAll('script[src],link[href],img[src],source[src]')].map(e=>e.src||e.href);return (await Promise.all(urls.map(async u=>({u,status:(await fetch(u)).status})))).filter(x=>x.status!==200);});assert.deepEqual(broken,[]);assert.deepEqual(errors,[]);
 // Touch has no click-to-open fallback, as explicitly requested.
 const touch=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});const tp=await touch.newPage();await tp.goto(base+'about/');await tp.locator('.language-trigger').tap();await expect(tp.locator('.language-options')).toBeHidden();
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({result:'PASS',layouts:21,metadataList,errors,checks:['hover and pointer gap','no trigger click or touch toggle','keyboard access','English on reload despite other locale/storage/query','selected contrast and shared styles','GitHub Releases links','data untouched','video playback','project-prefix assets']},null,2));
 console.log('PASS: 21 language/viewport layouts, hover-only pointer menu, keyboard, links, storage isolation and two 59-second videos, posters and original aspect ratios');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
