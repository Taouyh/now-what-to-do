import { test, expect, type Page } from '@playwright/test';

function data(count = 1) {
  return { version: 2, goals: [], tasks: Array.from({ length: count }, (_, i) => ({ id: `t${i}`, name: `活动 ${i + 1}`, description: `说明 ${i + 1}`, requirements: { computer: false, audio: false, speech: false, uninterrupted: false } })), completed: [] as any[], preferences: { time: 15, language: 'zh-CN', conditions: { computer: true, audio: true, speech: true, interrupted: true } }, theme: 'light', customData: { keep: true } };
}
async function seed(page: Page, value = data(), timer?: any) {
  await page.addInitScript(({ value, timer }) => {
    if (!localStorage.getItem('whatToDoData')) localStorage.setItem('whatToDoData', JSON.stringify(value));
    if (timer && !sessionStorage.getItem('seeded')) { localStorage.setItem('activeTimer', JSON.stringify(timer)); sessionStorage.setItem('seeded', 'yes'); }
  }, { value, timer });
  await page.goto('/');
}
async function main(page: Page) { return page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!)); }
async function nav(page: Page, route: string) { await page.locator(`.bookmarks [data-page="${route}"]`).click(); }

test('empty library, real first activity, pause, navigation, finish and continuation', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('#quickName').fill('读书'); await page.locator('#addFirstTask').click();
  await expect(page.locator('#recommendedTaskName')).toHaveText('读书');
  await page.locator('#start').click(); await expect(page.locator('#timer')).toBeVisible();
  await page.locator('#pauseTimer').click(); await expect(page.locator('#pauseTimer')).toHaveText('继续');
  await nav(page, 'tasks'); await expect(page.locator('#floatingTimer')).toBeVisible();
  await page.locator('.task-play').click(); await expect(page.locator('#timerName')).toHaveText('读书');
  await page.locator('#earlyTimer').click(); await expect(page.locator('#completionFeedback')).toContainText('已记录');
  await page.getByRole('button', { name: '记下一步', exact: true }).click();
  await page.locator('#continuationInput').fill('从第 12 页继续');
  await page.locator('.continuation-form').getByRole('button', { name: '保存', exact: true }).click();
  expect((await main(page)).tasks[0].description).toBe('从第 12 页继续');
  expect((await main(page)).completed).toHaveLength(1);
  await page.reload(); expect((await main(page)).completed).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('task groups, cancelled drafts, validation, unchanged save and deletion clamp', async ({ page }) => {
  await seed(page, data(11)); await nav(page, 'tasks');
  await expect(page.locator('.task-strip')).toHaveCount(10);
  await page.locator('#tasks-next').click(); await expect(page.locator('.task-strip')).toHaveCount(1);
  await page.locator('.task-edit').click(); await page.locator('#name').fill('未保存草稿'); await page.locator('#cancelActivity').click();
  expect((await main(page)).tasks[10].name).toBe('活动 11');
  await page.locator('.task-edit').click(); await page.locator('#name').fill('   '); await page.locator('#saveActivity').click();
  await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true'); await expect(page.locator('#modal')).toBeVisible();
  await page.locator('#name').fill('改名'); await page.locator('#saveActivity').click();
  await expect(page.locator('.task-title')).toHaveText('改名');
  await page.locator('.task-edit').click(); await page.locator('#deleteActivity').click(); await page.locator('#confirmCancel').click();
  await expect(page.locator('#modal')).toBeVisible(); await expect(page.locator('#name')).toHaveValue('改名');
  await page.locator('#deleteActivity').click(); await page.locator('#confirmAccept').click();
  await expect(page.locator('#modal')).toBeHidden(); await expect(page.locator('.task-strip')).toHaveCount(10);
  expect((await main(page)).customData).toEqual({ keep: true });
});

test('calendar groups by identity, five groups and four records per page', async ({ page }) => {
  const value = data(6); const now = Date.now();
  value.completed = Array.from({ length: 10 }, (_, i) => ({ recordId: `r${i}`, completionId: `r${i}`, taskId: `t${i < 5 ? 0 : i - 4}`, taskName: '同名历史快照', startedAt: now - 600000 + i * 1000, endedAt: now - 599000 + i * 1000, completedAt: new Date(now).toISOString(), actualDurationMs: 1000, plannedDuration: 15, pausedDurationMs: 0, extensionDurationMs: 0 }));
  await seed(page, value); await nav(page, 'today');
  await expect(page.locator('.calendar-group')).toHaveCount(5); await page.locator('.calendar-group').first().click();
  await expect(page.locator('.record-toggle')).toHaveCount(4); await page.locator('.record-toggle').first().click();
  await expect(page.locator('.record-detail')).toHaveCount(1);
  await page.locator('#records-next').click(); await expect(page.locator('.record-toggle')).toHaveCount(1); await expect(page.locator('.record-detail')).toHaveCount(0);
  await page.locator('#directory-next').click(); await expect(page.locator('.calendar-group')).toHaveCount(1); await expect(page.locator('.record-toggle')).toHaveCount(0);
});

test('recovery uses saved task snapshot and direct discard creates no record', async ({ page }) => {
  const value = data(); const now = Date.now();
  const timer = { timerVersion: 2, completionId: 'fixed-session', taskId: 't0', task: { ...value.tasks[0], name: '开始时的名字' }, taskName: '开始时的名字', durationMs: 900000, plannedDurationMs: 900000, elapsed: 8000, startedAt: now - 18000, lastStarted: now - 10000, checkpointAt: now - 10000, paused: false, finished: false };
  await seed(page, value, timer);
  await expect(page.locator('#timerRecoveryName')).toHaveText('开始时的名字');
  await page.locator('#discardRecoveryTimer').click(); await expect(page.locator('#timer')).toBeHidden();
  expect((await main(page)).completed).toHaveLength(0); await expect(page.locator('#appNotice')).toHaveText('本次用时不会计入今天');
});

test('local assets, languages, theme, keyboard escape, and narrow-screen controls', async ({ page }) => {
  const failures: string[] = []; page.on('response', r => { if (r.status() >= 400) failures.push(r.url()); });
  await seed(page); await page.locator('#conditionsPicker > summary').click(); await expect(page.locator('#audioReady')).not.toBeChecked();
  await page.keyboard.press('Escape'); await expect(page.locator('#conditionsPicker')).not.toHaveAttribute('open', '');
  await nav(page, 'settings'); await page.locator('[data-language="en"]').click();
  await expect(page.locator('.bookmarks [data-page="tasks"]')).toContainText('Tasks');
  await page.locator('#theme').click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('[data-language="ja"]').click(); await page.locator('#lightTheme').click();
  await page.setViewportSize({ width: 390, height: 844 }); await nav(page, 'tasks');
  await page.locator('.small-action').click(); await page.locator('#name').fill('小さな画面'); await page.locator('#saveActivity').click();
  expect((await main(page)).tasks).toHaveLength(2); expect(failures).toEqual([]);
});

test('long focus descriptions stay inside the book and dark controls remain legible', async ({ page }) => {
  const value = data(); value.tasks[0].name = '很长的活动名称'.repeat(15); value.tasks[0].description = '这是一段不能丢失的说明。\n'.repeat(150); value.theme = 'dark';
  await seed(page, value);
  await page.locator('#start').click(); await page.locator('#timerDescription summary').click();
  for (const width of [1236, 1480]) {
    await page.setViewportSize({ width, height: 715 });
    const geometry = await page.evaluate(() => {
      const book = document.getElementById('book')!.getBoundingClientRect();
      const description = document.getElementById('timerDescription')!.getBoundingClientRect();
      const status = document.getElementById('timerStatus')!.getBoundingClientRect();
      const style = getComputedStyle(document.getElementById('earlyTimer')!);
      return { bookBottom: book.bottom, descriptionBottom: description.bottom, statusTop: status.top, color: style.color, background: style.backgroundColor };
    });
    expect(geometry.bookBottom).toBeLessThanOrEqual(715);
    expect(geometry.descriptionBottom).toBeLessThanOrEqual(geometry.statusTop + 1);
    expect(geometry.color).toBe('rgb(241, 223, 182)');
    expect(geometry.background).toBe('rgb(80, 61, 44)');
  }
  expect((await main(page)).tasks[0].description.length).toBe(value.tasks[0].description.length);
});

test('damaged source remains exportable and book controls stay inert', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('whatToDoData', '{damaged-json'));
  await page.goto('/');
  await expect(page.locator('#dataRecovery')).toBeVisible();
  await expect(page.locator('#book')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape'); await expect(page.locator('#dataRecovery')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('whatToDoData'))).toBe('{damaged-json');
  const downloaded = page.waitForEvent('download'); await page.locator('#exportRawData').click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe('what-to-do-original.txt');
});

test('narrow task pages can scroll with a real wheel to reach pagination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await seed(page, data(21)); await nav(page, 'tasks');
  await page.mouse.move(250, 600); await page.mouse.wheel(0, 1000);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  const next = await page.locator('#tasks-next').boundingBox();
  expect(next!.y).toBeLessThan(844);
  await page.locator('#tasks-next').click(); await expect(page.locator('.task-number').first()).toHaveText('11');
});
