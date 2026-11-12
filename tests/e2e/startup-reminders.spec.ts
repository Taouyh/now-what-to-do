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
 await page.locator('#finishTimer').click();await page.locator('[data-page="settings"]').click();await expect(page.locator('#reminderSound')).toHaveCount(0);
 await expect(page.locator('#reminderPreferences')).toBeHidden();
 await expect(page.locator('#reminderVibrationRow')).toBeHidden();
});
test('sound setting is absent and import remains visible on small dark screens',async({browser})=>{
 const context=await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'});
 const page=await context.newPage();await page.addInitScript(data=>localStorage.setItem('whatToDoData',JSON.stringify({...data,theme:'dark'})),data);
 await page.goto('/#settings');await expect(page.locator('#reminderSettings')).toHaveCount(0);await expect(page.getByText('到点提醒',{exact:true})).toHaveCount(0);
 await expect(page.locator('#reminderSound')).toHaveCount(0);
 for(const id of ['import']){const rect=await page.locator('#'+id).boundingBox();expect(rect!.y).toBeGreaterThanOrEqual(0);expect(rect!.y+rect!.height).toBeLessThanOrEqual(568);}
 await expect(page.locator('#reminderSound')).toHaveCount(0);await expect(page.locator('#reminderPreferences')).toBeHidden();await context.close();
});
