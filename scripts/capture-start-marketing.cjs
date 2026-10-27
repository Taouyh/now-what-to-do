// Actual app screenshots, with isolated synthetic activities and no personal data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async(scenario,fixture)=>{
 const output=path.resolve(__dirname,'../about/assets');
 for(const locale of ['en','zh-CN','ja']){
  const data=fixture();data.completed=[];data.theme='light';
  data.preferences={time:10,language:locale,conditions:{computer:false,audio:false,speech:false,interrupted:false}};
  data.tasks=[{id:'sample-read',name:{en:'Read a book','zh-CN':'读书',ja:'読書'}[locale],nextStep:{en:'Open where you left off. Read one page.','zh-CN':'翻到上次的位置，先读一页。',ja:'前回の続きから、まず1ページ読む。'}[locale],requirements:{}}];
  await scenario('capture actual Start screen and hover conditions in '+locale,{whatToDoData:JSON.stringify(data)},{},async(run,_import,{protocol})=>{
   await protocol('Emulation.setDeviceMetricsOverride',{width:1000,height:800,deviceScaleFactor:1,mobile:false});
   await run("page('home');await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)");
   const clip=await run("const r=$('homeWorkspace').getBoundingClientRect();return {x:r.x-60,y:r.y-45,width:r.width+120,height:r.height+100,scale:2}");
   const save=async(name,area=clip)=>{const shot=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:area});fs.writeFileSync(path.join(output,name+'-'+locale+'.png'),Buffer.from(shot.data,'base64'))};
   await save('start');
   const p=await run("const r=document.querySelector('#conditionsPicker > summary').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}");
   await protocol('Input.dispatchMouseEvent',{type:'mouseMoved',...p});
   await run('await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)');
   assert.equal(await run("return $('conditionsPicker').open"),true);
   assert.deepEqual(await run("return [...$('conditionsPanel').querySelectorAll('input')].map(e=>e.checked)"),[false,false,false,false]);
   const panelClip=await run("const boxes=[...document.querySelectorAll('.home-controls > details > summary'),$('conditionsPanel')].map(e=>e.getBoundingClientRect());const x=Math.min(...boxes.map(r=>r.left))-20,y=Math.min(...boxes.map(r=>r.top))-18;return {x,y,width:Math.max(...boxes.map(r=>r.right))-x+20,height:Math.max(...boxes.map(r=>r.bottom))-y+18,scale:2}");
   await save('conditions',panelClip);
   assert.equal(await run('return __writes.length'),0);
  },{timezone:'Asia/Shanghai'});
 }
};
