const {chromium}=require('../../node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
const out=path.join(__dirname,'public','demo');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1,locale:'en-US'});
const page=await context.newPage();page.setDefaultTimeout(30000);
const req={computer:false,audio:false,speech:false,uninterrupted:false};
const data={version:2,goals:[],tasks:[{id:'demo-read',name:'Read a few pages',description:'Start with the book on your bedside table.',requirements:req},{id:'demo-draw',name:'Sketch an idea',description:'Pick a pencil and a blank page.',requirements:req}],completed:[],preferences:{time:15,language:'en',conditions:req},theme:'light'};
await page.addInitScript(d=>{localStorage.setItem('whatToDoData',JSON.stringify(d));Math.random=()=>0;},data);
await page.goto('http://127.0.0.1:5189');await page.locator('body.book-app #start').waitFor({state:'visible'});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));});await page.waitForTimeout(300);
const events=[],screens=[],captions=[];let time=0,count=0;
async function shot(t){await page.screenshot({path:path.join(out,`${count}.png`),animations:'disabled'});screens.push({time:t,file:`demo/${count++}.png`});}
await shot(0);captions.push({time:0,text:'Now What 1.4.1 - product walkthrough',chapter:'Overview'});time=2;
async function act(selector,text,chapter,duration=2.6,type){
 const loc=typeof selector==='string'?page.locator(selector):selector;
 await loc.waitFor({state:'visible'});const box=await loc.boundingBox();if(!box)throw Error('Missing target '+text);
 const x=box.x+box.width/2,y=box.y+box.height/2;
 captions.push({time,text,chapter});events.push({time:time+.85,x,y});
 await loc.click();
 if(type){await loc.fill('');const chunks=4;for(let i=1;i<=chunks;i++){await loc.fill(type.slice(0,Math.ceil(type.length*i/chunks)));await shot(time+1+i*.42);}}
 else {await page.waitForTimeout(300);await shot(time+1.0);}
 console.log(time.toFixed(1),text);time+=duration;
}
const nav=r=>`.bookmarks [data-page="${r}"]`;
await act(nav('tasks'),'Open Tasks to manage your activities.','Tasks');
await act('.small-action','Click Add to create an activity.','Tasks');
await act('#name','Enter the activity name.','Tasks',3.5,'Stretch for a moment');

await act('#desc','Write a simple instruction for getting started.','Tasks',3.5,'Stand up and gently stretch your shoulders.');
await act('#saveActivity','Save the activity to your list.','Tasks');
await act('[data-task-id="demo-read"] .task-pin','Pin an activity to keep it at the top.','Organize',2.6);
const moving=page.locator('.task-strip').filter({hasText:'Stretch for a moment'});
const grip=await moving.locator('.task-drag-handle').boundingBox();
const target=await page.locator('[data-task-id="demo-draw"]').boundingBox();
captions.push({time,text:'Drag the grip to reorder your activities.',chapter:'Organize'});
events.push({time:time+.85,x:grip.x+grip.width/2,y:grip.y+grip.height/2});
await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2);await page.mouse.down();
await page.mouse.move(grip.x+grip.width/2+10,grip.y+grip.height/2,{steps:3});
await page.mouse.move(target.x+target.width/2,target.y+target.height*.2,{steps:12});
events.push({time:time+2,x:target.x+target.width/2,y:target.y+target.height*.2,drag:true});
await shot(time+2);await page.mouse.up();await page.waitForTimeout(200);await shot(time+3);time+=4;
await act('[data-task-id="demo-read"] .task-pin','Unpin at any time. Your order is remembered.','Organize',2.4);
await act(nav('home'),'Return to Start for a suggestion.','Start');
await act('#timePicker > summary','Choose how long you want to spend.','Start');
await act('#times [data-v="10"]','Select a 10-minute session.','Start',2);
if(await page.locator('#timePicker').getAttribute('open')!==null)await act('#timePicker .picker-close','Close the time menu.','Start',1.5);
await act('#conditionsPicker > summary','Set the conditions that apply right now.','Start');
await act(page.locator('label').filter({has:page.locator('#interruptionsLikely')}),'Mark whether you might be interrupted.','Start');
await act('#conditionsPicker .picker-close','Keep these conditions.','Start',2);
await act('#start','Start the suggested activity.','Focus',3.5);
await act('#pauseTimer','Pause the timer when you need a break.','Focus',3);
await act('#pauseTimer','Resume the same session.','Focus',3);
await act('#earlyTimer','End the session and record the time spent.','Focus',3);
await act('.continuation-trigger','Save a note for the next session.','Next step');
await act('#continuationInput','Write where you want to resume.','Next step',3.5,'Next time, start with shoulder stretches.');
await act('.continuation-form button[type="submit"]','Save your next starting point.','Next step');
await act(nav('today'),"Open the Journal to review today's sessions.",'Journal');
await act(page.locator('.calendar-group').first(),'Select an activity to see its sessions.','Journal');
await act(page.locator('.record-toggle').first(),'Open a session to see its recorded details.','Journal',3);
await act(nav('settings'),'Open Settings for language, appearance, and backups.','Settings',3);
await act('#theme','Switch to the dark appearance.','Settings',3);
await act('#lightTheme','Switch back to the light appearance.','Settings',2.5);
await act('#export','Export a backup of your data.','Settings',3);
await act(nav('home'),'Return to Start.','Start',3);
const duration=Math.ceil(time+1);if(duration>100)throw Error('Duration exceeds 90: '+duration);
const result={duration,width:1600,height:900,events,screens,captions};
fs.writeFileSync(path.join(__dirname,'src','demo-data.json'),JSON.stringify(result,null,2));
await browser.close();console.log('DONE',duration,'seconds',events.length,'clicks');
})().catch(e=>{console.error(e);process.exit(1)});


