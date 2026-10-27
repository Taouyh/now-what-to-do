// Capture the actual recovery UI using isolated, synthetic checkpoints.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async(scenario,fixture)=>{
 const output=path.resolve(__dirname,'../about/assets');
 for(const locale of ['en','zh-CN','ja']){
  const data=fixture(),at=Date.now()-60000;data.completed=[];data.theme='light';
  data.preferences={time:15,language:locale,conditions:{computer:false,audio:false,speech:false,interrupted:false}};
  const task={id:'sample-read',name:{en:'Read a book','zh-CN':'读书',ja:'読書'}[locale],requirements:{}};data.tasks=[task];
  const timer={timerVersion:2,completionId:'sample-recovery',taskId:task.id,task:{...task},taskName:task.name,startedAt:at-480000,lastStarted:at,checkpointAt:at,elapsed:480000,plannedDurationMs:900000,durationMs:900000,extensionDurationMs:0,paused:false,finished:false,soundPlayed:false,pauseStartedAt:0,pausedDurationMs:0};
  await scenario('capture actual recovery screen in '+locale,{whatToDoData:JSON.stringify(data),activeTimer:JSON.stringify(timer)},{},async(run,_import,{protocol})=>{
   await protocol('Emulation.setDeviceMetricsOverride',{width:1000,height:900,deviceScaleFactor:1,mobile:false});
   await run("page('home');await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)");
   assert.equal(await run('return timerState().paused'),true);assert.equal(await run('return timerState().elapsed'),480000);assert.equal(await run('return d.completed.length'),0);
   const clip=await run("const r=$('timerRecovery').getBoundingClientRect();return {x:r.x-24,y:r.y-24,width:r.width+48,height:r.height+48,scale:2}");
   const shot=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});fs.writeFileSync(path.join(output,'recovery-'+locale+'.png'),Buffer.from(shot.data,'base64'));
   assert.equal(await run("return __rawGet('whatToDoData')"),JSON.stringify(data));
  },{timezone:'Asia/Shanghai'});
 }
};
