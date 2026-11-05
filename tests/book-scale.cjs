// Synthetic scale observation; accepts a running production preview URL.
const {chromium}=require('@playwright/test'),os=require('node:os'),fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({channel:'msedge'});const page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.goto(process.env.BOOK_URL||'http://127.0.0.1:8765');
 const storage=await page.evaluate(()=>{
   const now=Date.now(),value={version:2,goals:[],tasks:Array.from({length:1000},(_,i)=>({id:`t${i}`,name:`Synthetic activity ${i}`,description:'A synthetic description, never user data',requirements:{computer:false,audio:false,speech:false,uninterrupted:false}})),completed:Array.from({length:10000},(_,i)=>({recordId:`r${i}`,completionId:`r${i}`,taskId:`t${i%1000}`,taskName:`Recorded activity ${i%1000}`,actualDurationMs:60000,startedAt:now-600000+i,endedAt:now-540000+i,completedAt:new Date(now).toISOString()})),preferences:{time:15,language:'en',conditions:{computer:false,audio:false,speech:false,interrupted:false}},theme:'light'};
   const raw=JSON.stringify(value),start=performance.now();localStorage.setItem('whatToDoData',raw);return {bytes:new Blob([raw]).size,writeMs:performance.now()-start};
 });
 const start=Date.now();await page.reload();await page.locator('#book').waitFor();const startupMs=Date.now()-start;
 const timings={};
 for(const route of ['tasks','today']){timings[route]=await page.evaluate(route=>{const start=performance.now();document.querySelector(`.bookmarks [data-page="${route}"]`).click();return performance.now()-start},route)}
 const paginationMs=await page.evaluate(()=>{const start=performance.now();document.getElementById('directory-next').click();return performance.now()-start});
 const result={date:new Date().toISOString(),cpu:os.cpus()[0].model,ramGiB:Math.round(os.totalmem()/2**30),browser:browser.version(),tasks:1000,records:10000,...storage,startupMs,renderMs:timings,paginationMs,note:'Single local observation; startup includes browser navigation. Render measures synchronous handler only, not full frame or persistent quota guarantee.'};
 await fs.mkdir('test-artifacts',{recursive:true});await fs.writeFile('test-artifacts/book-scale.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1});
