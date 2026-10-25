// Uses the isolated browser runner with synthetic content, never personal data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async(scenario,fixture)=>{
 const output=path.resolve(__dirname,'../about/assets');
 const stamp=clock=>Date.parse('2026-10-25T'+clock+'+08:00');
 for(const locale of ['en','zh-CN','ja']){
  const data=fixture(),names={en:['Vibe Coding','Read a book','Stretch'],'zh-CN':['Vibe Coding','读书','伸展一下'],ja:['Vibe Coding','読書','ストレッチ']}[locale];
  data.preferences.language=locale;data.theme='light';
  data.tasks=names.map((name,i)=>({id:'sample-'+i,name,requirements:{}}));
  const record=(id,task,start,end,ms,planned,added=0)=>({recordId:id,completionId:id,taskId:'sample-'+task,taskName:names[task],startedAt:stamp(start),endedAt:stamp(end),completedAt:new Date(stamp(end)).toISOString(),actualDurationMs:ms,plannedDuration:planned,extensionDurationMs:added,pausedDurationMs:0});
  data.completed=[record('sample-1',0,'19:00:00','19:25:00',1500000,25),record('sample-2',0,'19:30:00','19:40:00',600000,10),record('sample-3',1,'19:45:00','20:00:00',900000,15),record('sample-4',0,'20:04:48','20:19:33',884000,10,300000),record('sample-5',2,'20:30:00','20:35:00',300000,5)];
  await scenario('capture current Today screenshot in '+locale,{whatToDoData:JSON.stringify(data)},{},async(run,_import,{protocol})=>{
   await protocol('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
   await run("const RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-10-25T21:00:00+08:00']))}static now(){return RealDate.parse('2026-10-25T21:00:00+08:00')}};page('today');document.querySelector('.history-item').open=true;await document.fonts.ready;await new Promise(resolve=>setTimeout(resolve,200));scrollTo(0,0)");
   assert.equal(await run("return document.querySelectorAll('.history-item').length"),3);
   assert.equal(await run("return document.querySelector('.history-session-duration').textContent"),await run('return formatDuration(1500000)'));
   const clip=await run("const r=$('today').getBoundingClientRect();return {x:r.x-24,y:r.y+scrollY-24,width:r.width+48,height:r.height+48,scale:1}");
   const shot=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
   fs.writeFileSync(path.join(output,'today-'+locale+'.png'),Buffer.from(shot.data,'base64'));
   assert.equal(await run("return __rawGet('whatToDoData')"),JSON.stringify(data));
   assert.equal(await run('return __writes.length'),0);
  },{timezone:'Asia/Shanghai'});
 }
 console.log('Saved three current product screenshots using synthetic records.');
};
