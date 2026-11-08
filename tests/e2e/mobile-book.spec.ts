import { test, expect, type Page } from '@playwright/test';

const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const tasks = Array.from({ length: 23 }, (_, i) => ({ id: `mobile-${i}`, name: `活动 ${i + 1} — 长名称也不应该挤掉翻页按钮`, requirements: {} }));
async function seed(page: Page, language = 'zh-CN') {
  await page.addInitScript(({ tasks, language }) => localStorage.setItem('whatToDoData', JSON.stringify({ version: 2, goals: [], tasks, completed: [], preferences: { language, time: 10, conditions: {} }, theme: 'light' })), { tasks, language });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}
async function nav(page: Page, id: string) { await page.locator(`.bookmarks [data-page="${id}"]`).click(); }
async function assertTaskBounds(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const rows = [...document.querySelectorAll<HTMLElement>('.task-strip')];
    const pager = document.querySelector('#tasks .book-pager')!.getBoundingClientRect();
    return rows.length > 0 && rows.every(row => {
      const r = row.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= pager.top && r.left >= 0 && r.right <= innerWidth;
    }) && pager.bottom <= innerHeight && document.documentElement.scrollHeight <= innerHeight + 1;
  })).toBe(true);
}

for (const [width, height, language] of [[320, 568, 'en'], [360, 640, 'zh-CN'], [390, 844, 'ja'], [800, 360, 'en']] as const) {
  test(`phone true pagination and visible import ${width}x${height} ${language}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, userAgent: android, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await seed(page, language); await nav(page, 'tasks');
    await expect(page.locator('body')).toHaveClass(/mobile-book/);
    const seen: string[] = [];
    do {
      await assertTaskBounds(page);
      seen.push(...await page.locator('.task-strip').evaluateAll(rows => rows.map(row => (row as HTMLElement).dataset.taskId!)));
      if (await page.locator('#tasks-next').isDisabled()) break;
      await page.locator('#tasks-next').click();
    } while (seen.length < 30);
    expect(seen).toEqual(tasks.map(t => t.id));
    await expect(page.locator('#tasks-previous')).toBeEnabled();
    await page.locator('#tasks-previous').click(); await assertTaskBounds(page);
    await nav(page, 'settings');
    for (const id of ['languageOptions', 'lightTheme', 'theme', 'export', 'import']) {
      const rect = await page.locator(`#${id}`).boundingBox();
      expect(rect).not.toBeNull(); expect(rect!.y).toBeGreaterThanOrEqual(0);
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(height);
    }
    // Real chooser proves the visible import button is also reachable.
    const chooser = page.waitForEvent('filechooser'); await page.locator('#import').click(); await chooser;
    expect(errors).toEqual([]); await context.close();
  });
}

test('phone resize preserves position; adding and deleting uses the current page capacity', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: android, hasTouch: true });
  const page = await context.newPage(); await seed(page); await nav(page, 'tasks'); await assertTaskBounds(page);
  await page.locator('#tasks-next').click();
  const anchor = await page.locator('.task-strip').first().getAttribute('data-task-id');
  await page.setViewportSize({ width: 360, height: 568 }); await assertTaskBounds(page);
  await expect(page.locator(`.task-strip[data-task-id="${anchor}"]`)).toBeVisible();
  await page.locator('.small-action').click(); await page.locator('#name').fill('新加任务'); await page.locator('#saveActivity').click();
  await expect(page.locator('.task-title', { hasText: '新加任务' })).toBeVisible(); await assertTaskBounds(page);
  await page.locator('.task-edit').last().click(); await page.locator('#deleteActivity').click(); await page.locator('#confirmAccept').click();
  await assertTaskBounds(page); await expect(page.locator('.task-title', { hasText: '新加任务' })).toHaveCount(0);
  await context.close();
});

for (const mobile of [true, false]) for (const dark of [true, false]) {
  test(`completion capsules preserve save/cancel mobile=${mobile} dark=${dark}`, async ({ browser }) => {
    const context = await browser.newContext(mobile ? { viewport: { width: 360, height: 640 }, userAgent: android, hasTouch: true } : { viewport: { width: 1531, height: 715 } });
    const page = await context.newPage(); await seed(page);
    if (dark) { await nav(page, 'settings'); await page.locator('#theme').click(); }
    await nav(page, 'tasks');
    await page.locator('.task-play').first().click(); await page.locator('#earlyTimer').click();
    await page.locator('.continuation-trigger').click(); await page.locator('#continuationInput').fill('未保存的草稿');
    await page.mouse.move(0, 0); await page.locator('#continuationInput').focus();
    const styles = await page.locator('.feedback-actions button').evaluateAll(buttons => buttons.map(button => {
      const s = getComputedStyle(button), r = button.getBoundingClientRect();
      return { background: s.backgroundImage, color: s.color, border: s.border, radius: s.borderRadius, width: r.width, height: r.height };
    }));
    const [{ width: firstWidth, ...firstStyle }, { width: secondWidth, ...secondStyle }] = styles;
    expect(firstStyle).toEqual(secondStyle); expect(Math.abs(firstWidth - secondWidth)).toBeLessThan(1);
    expect(styles[0].radius).toBe('24px');
    await page.locator('.feedback-actions button').last().click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).tasks[0].description || '')).toBe('');
    // A second completed session lets us verify the save path after dismissing the previous editor.
    await nav(page, 'tasks'); await page.locator('.task-play').first().click(); await page.locator('#earlyTimer').click();
    await page.locator('.continuation-trigger').click(); await page.locator('#continuationInput').fill('下一次从这里继续');
    await page.locator('.feedback-actions button').first().click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).tasks[0].description)).toBe('下一次从这里继续');
    await context.close();
  });
}
