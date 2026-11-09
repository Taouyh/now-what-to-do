import { test, expect, type Page } from '@playwright/test';

async function seed(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem('whatToDoData')) return;
    localStorage.setItem('whatToDoData', JSON.stringify({version:2,goals:[],tasks:Array.from({length:23},(_,i)=>({id:`drag-${i}`,name:`活动 ${i}`,requirements:{},pinned:i<2})),completed:[],preferences:{language:'zh-CN',time:10,conditions:{}},theme:'light'}));
  });
  await page.goto('/#tasks'); await page.evaluate(() => document.fonts.ready);
}
const row = (page: Page, id: number) => page.locator(`[data-task-id="drag-${id}"]`);
async function begin(page: Page, id: number) {
  const r = (await row(page,id).locator('.task-drag-handle').boundingBox())!;
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2); await page.mouse.down();
  await page.mouse.move(r.x+r.width/2+9,r.y+r.height/2,{steps:3});
}
async function over(page: Page, id: number, after=false) {
  const r=(await row(page,id).boundingBox())!;
  await page.mouse.move(r.x+r.width/2,r.y+r.height*(after?.8:.2),{steps:8});
}
async function order(page: Page) { return page.locator('.task-strip').evaluateAll(rows=>rows.map(r=>(r as HTMLElement).dataset.taskId)); }

test('pointer reorders across columns and pages; reload, cancel, pins and keyboard remain coherent', async ({page}) => {
  await seed(page);
  await begin(page,8); await over(page,2); await expect(row(page,2)).toHaveClass(/task-drop-before/); await page.mouse.up();
  expect((await order(page)).slice(0,4)).toEqual(['drag-0','drag-1','drag-8','drag-2']);
  await expect(page.locator('#modal')).toBeHidden(); await expect(page.locator('#timer')).toBeHidden();
  await page.reload(); await expect(row(page,8).locator('.task-drag-handle')).toBeVisible();
  expect((await order(page))[2]).toBe('drag-8');
  const stored=await page.evaluate(()=>localStorage.getItem('whatToDoData'));
  await begin(page,8); await over(page,0); await page.mouse.up();
  expect(await page.evaluate(()=>localStorage.getItem('whatToDoData'))).toBe(stored);
  await begin(page,8); await over(page,6); await page.keyboard.press('Escape'); await page.mouse.up();
  expect(await page.evaluate(()=>localStorage.getItem('whatToDoData'))).toBe(stored);
  await begin(page,8);
  const next=(await page.locator('#tasks-next').boundingBox())!;
  await page.mouse.move(next.x+next.width/2,next.y+next.height/2,{steps:8});
  await expect(row(page,10)).toBeVisible();
  await over(page,12,true); await page.mouse.up();
  expect((await order(page)).slice(0,3)).toEqual(['drag-11','drag-12','drag-8']);
  await expect(row(page,8).locator('.task-drag-handle')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  expect((await order(page)).slice(0,3)).toEqual(['drag-11','drag-8','drag-12']);
  await page.locator('#tasks-previous').click();
  await begin(page,1); await over(page,0); await page.mouse.up();
  expect((await order(page)).slice(0,2)).toEqual(['drag-1','drag-0']);
  await row(page,0).locator('.task-edit').click(); await expect(page.locator('#name')).toHaveValue('活动 0');
  await page.locator('#cancelActivity').click();
  await row(page,0).locator('.task-play').click(); await expect(page.locator('#timerName')).toHaveText('活动 0');
});
