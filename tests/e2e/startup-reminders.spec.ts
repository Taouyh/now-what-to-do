import {test,expect} from '@playwright/test';
const data={version:2,goals:[],tasks:[{id:'read',name:'读书',requirements:{},enabled:true}],completed:[],preferences:{time:10,language:'zh-CN',conditions:{}},theme:'light'};
test('cold first view is revealed as an assembled book; missing textures cannot trap startup',async({browser})=>{
 for(const broken of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();
  if(broken)await page.route('**/assets/*.webp',route=>route.abort());
  await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-app-ready','true');await expect(page.locator('#startupStatus')).toBeHidden();
  await expect(page.locator('#quickName')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(!broken)expect(await page.locator('#book img').evaluateAll(images=>images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
  await context.close();
 }
});
test('timer arrival, silent reopen and preferences keep one current session',async({page})=>{
 const now=Date.now();
 await page.addInitScript(({data,now})=>{localStorage.setItem('whatToDoData',JSON.stringify(data));localStorage.setItem('activeTimer',JSON.stringify({timerVersion:2,reminderVersion:1,completionId:'round',taskId:'read',task:data.tasks[0],taskName:'读书',startedAt:now-600000,lastStarted:now,elapsed:599000,durationMs:600000,plannedDurationMs:600000,extensionDurationMs:0,paused:false,finished:false,soundPlayed:false,checkpointAt:now}));},{data,now});
 await page.goto('/');await expect(page.locator('#timerStatus')).toHaveText('时间到了');await expect(page.locator('#extendTimer')).toBeVisible();await expect(page.locator('#finishTimer')).toBeVisible();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('activeTimer')!));
 expect((await state()).elapsed).toBe(600000);expect((await state()).soundPlayed).toBe(true);
 await page.evaluate(()=>{const x=JSON.parse(localStorage.getItem('activeTimer')!);x.timeUpAt=Date.now()-86400000;localStorage.setItem('activeTimer',JSON.stringify(x));(window as any).nativeTimerLifecycle('resume')});
 await expect(page.locator('#timerStatus')).toHaveText('时间到了');expect((await state()).elapsed).toBe(600000);
 await page.locator('#finishTimer').click();await page.locator('[data-page="settings"]').click();await page.locator('#reminderSettings summary').click();await page.locator('#reminderSound').uncheck();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('whatToDoData')!).preferences.reminders.sound)).toBe(false);
 await expect(page.locator('#reminderVibrationRow')).toBeHidden();
});
