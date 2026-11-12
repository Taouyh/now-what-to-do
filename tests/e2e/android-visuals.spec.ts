import { test, expect, type Page } from '@playwright/test';

const android = 'Mozilla/5.0 (Linux; Android 14; OPPO Reno10 Pro) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36';
const tasks = Array.from({length: 9}, (_, i) => ({id: `visual-${i}`, name: ['读书','学习日语','整理书桌','散步','画画','练字','运动','学习摄影','听音乐'][i], requirements: {}}));
async function seed(page: Page, language: string) {
  await page.addInitScript(({tasks,language}) => {
    const now = Date.now();
    localStorage.setItem('whatToDoData', JSON.stringify({version:2,goals:[],tasks,
      completed: tasks.flatMap((task,i) => Array.from({length:i ? 1 : 9},(_,j)=>({recordId:`r-${i}-${j}`, completionId:`r-${i}-${j}`,taskId:task.id,taskName:task.name,startedAt:now-600000,endedAt:now,completedAt:new Date(now).toISOString(),actualDurationMs:600000,plannedDuration:10,pausedDurationMs:0,extensionDurationMs:0}))),
      preferences:{language,time:10,conditions:{}},theme:'light'}));
  }, {tasks,language});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-app-ready','true');
}

test('calendar return retains focus after pending keyboard viewport reflow', async ({browser}) => {
  const context = await browser.newContext({viewport:{width:320,height:592}, userAgent:android, hasTouch:true, isMobile:true});
  const page = await context.newPage();
  await seed(page,'zh-CN');
  await page.locator('[data-page=tasks]').click();
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.locator('.small-action').click();
  await page.setViewportSize({width:320,height:320});
  await page.evaluate(()=>(window as any).nativeNavigateBack());
  await page.setViewportSize({width:320,height:592});
  const group = await page.evaluate(()=>{
    document.querySelector<HTMLButtonElement>('[data-page=today]')!.click();
    document.querySelector<HTMLButtonElement>('.calendar-group')!.click();
    (window as any).nativeNavigateBack();
    return (document.activeElement as HTMLElement).dataset.groupId!;
  });
  expect(group).toBeTruthy();
  await page.clock.runFor(300);
  await expect(page.locator(`[data-group-id="${group}"]`)).toBeFocused();
  await context.close();
});

for (const [width,height,language] of [[360,752,'zh-CN'],[320,592,'en'],[390,796,'ja']] as const) {
  test(`Android visual flow ${width}x${height} ${language}`, async ({browser}, info) => {
    const context = await browser.newContext({viewport:{width,height}, userAgent:android, hasTouch:true, isMobile:true});
    const page = await context.newPage();
    const errors: string[]=[];page.on('pageerror', e=>errors.push(e.message));
    await seed(page,language);
    await expect(page.locator('#start')).toBeVisible();
    await expect(page.locator('#random')).toBeVisible();
    expect((await page.locator('#start').boundingBox())!.width).toBe(240);
    await page.screenshot({path:info.outputPath('home.png')});
    for (const selector of ['#timePicker', '#conditionsPicker']) {
      await page.locator(`${selector}>summary`).click();
      await expect.poll(()=>page.locator(`${selector} .condition-panel`).evaluate(el=>{const r=el.getBoundingClientRect();return r.height>200&&r.bottom<=innerHeight&&el.scrollHeight<=el.clientHeight+1;})).toBe(true);
      await page.keyboard.press('Escape');
    }
    await page.locator('[data-page=tasks]').click();
    const ids: string[]=[];
    do {
      await expect.poll(()=>page.locator('.mobile-task-items').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
      ids.push(...await page.locator('#taskList .task-strip').evaluateAll(rows=>rows.map(r=>(r as HTMLElement).dataset.taskId!)));
      if(await page.locator('#tasks-next').isDisabled())break;
      await page.locator('#tasks-next').click();
    } while(ids.length<20);
    expect(ids).toEqual(tasks.map(t=>t.id));
    if (height > 650 && await page.locator('#taskList .task-strip').count() <= 3) {
      await expect(page.locator('#taskList .task-strip').first()).toHaveCSS('height','72px');
    }
    const anchor=await page.locator('#taskList .task-strip').first().getAttribute('data-task-id');
    await page.screenshot({path:info.outputPath('tasks.png')});
    await page.locator('.small-action').click();
    await page.locator('#name').fill('保存键盘草稿');
    await page.screenshot({path:info.outputPath('editor.png')});
    await page.setViewportSize({width,height:Math.max(320,height-280)});
    for(const id of ['close','saveActivity','cancelActivity']) {
      await expect.poll(()=>page.locator(`#${id}`).evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
    }
    await page.screenshot({path:info.outputPath('editor-keyboard.png')});
    expect(await page.locator('#modal .dialog').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
    expect(await page.evaluate(()=>(window as any).nativeNavigateBack())).toBe(true);
    await expect(page.locator('#modal')).toBeHidden();
    await page.setViewportSize({width,height});
    await expect(page.locator(`.task-strip[data-task-id="${anchor}"]`)).toBeVisible();
    await page.locator('[data-page=today]').click();
    await expect(page.locator('.calendar-records')).toHaveCount(0);
    await page.screenshot({path:info.outputPath('calendar-directory.png')});
    await page.locator('.calendar-group').first().click();
    await expect(page.locator('.calendar-directory')).toHaveCount(0);
    await expect(page.locator('#calendarBack')).toBeVisible();
    const before=await page.locator('.record-row').evaluateAll(rows=>rows.map(r=>({y:r.getBoundingClientRect().y,width:r.getBoundingClientRect().width})));
    await page.locator('.record-toggle').first().click();
    expect(await page.locator('.record-row').evaluateAll(rows=>rows.map(r=>({y:r.getBoundingClientRect().y,width:r.getBoundingClientRect().width})))).toEqual(before);
    await expect.poll(()=>page.locator('.calendar-records').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
    expect(await page.locator('.record-row').first().evaluate(el=>{const s=getComputedStyle(el);return [s.backgroundColor,s.borderTopWidth,s.borderLeftWidth,s.borderBottomWidth]})).toEqual(['rgba(0, 0, 0, 0)','0px','0px','1px']);
    await page.screenshot({path:info.outputPath('calendar-detail.png')});
    await page.locator('#records-next').click();
    await page.locator('#calendarBack').click();
    await expect(page.locator('.calendar-group').first()).toBeFocused();
    await page.locator('#directory-next').click();
    const selected=await page.locator('.calendar-group').first().getAttribute('data-group-id');
    await page.locator('.calendar-group').first().click();
    expect(await page.evaluate(()=>(window as any).nativeNavigateBack())).toBe(true);
    await expect(page.locator(`[data-group-id="${selected}"]`)).toBeFocused();
    expect(errors).toEqual([]);
    await context.close();
  });
}
