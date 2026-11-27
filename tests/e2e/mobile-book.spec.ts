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
  await page.setViewportSize({ width: 800, height: 360 }); await assertTaskBounds(page);
  await expect(page.locator(`.task-strip[data-task-id="${anchor}"]`)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await assertTaskBounds(page);
  await expect(page.locator(`.task-strip[data-task-id="${anchor}"]`)).toBeVisible();
  await page.setViewportSize({ width: 360, height: 568 }); await assertTaskBounds(page);
  await expect(page.locator(`.task-strip[data-task-id="${anchor}"]`)).toBeVisible();
  await page.locator('.small-action').click(); await page.locator('#name').fill('新加任务'); await page.locator('#saveActivity').click();
  await expect(page.locator('.task-title', { hasText: '新加任务' })).toBeVisible(); await assertTaskBounds(page);
  await page.locator('.task-edit').last().click(); await page.locator('#deleteActivity').click(); await page.locator('#confirmAccept').click();
  await assertTaskBounds(page); await expect(page.locator('.task-title', { hasText: '新加任务' })).toHaveCount(0);
  await context.close();
});

test('phone editor actions remain reachable when the viewport contracts', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: android, hasTouch: true });
  const page = await context.newPage(); await seed(page); await nav(page, 'tasks'); await assertTaskBounds(page);
  await page.locator('.task-edit').first().click(); await page.locator('#name').fill('短视口保存');
  await page.locator('#desc').fill('保留输入草稿');
  for (const viewport of [{ width: 390, height: 360 }, { width: 800, height: 360 }]) {
    await page.setViewportSize(viewport);
    for (const id of ['saveActivity', 'cancelActivity', 'deleteActivity']) {
      await expect.poll(() => page.locator(`#${id}`).evaluate(button => {
        const r = button.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight && button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      })).toBe(true);
    }
    await expect(page.locator('#name')).toHaveValue('短视口保存');
  }
  await page.locator('#saveActivity').click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).tasks[0].description)).toBe('保留输入草稿');
  await page.locator('.task-edit').first().click(); await page.locator('#deleteActivity').click();
  const card = page.locator('.confirm-card'); await card.hover(); await page.mouse.wheel(0, 600);
  await expect.poll(() => page.locator('#confirmCancel').evaluate(button => {
    const r = button.getBoundingClientRect(); return r.bottom <= innerHeight && button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  })).toBe(true);
  await page.locator('#confirmCancel').click(); await expect(page.locator('#name')).toHaveValue('短视口保存');
  await page.locator('#cancelActivity').click(); await context.close();
});

for (const mobile of [true, false]) for (const dark of [true, false]) {
  test(`completion capsules preserve save/cancel mobile=${mobile} dark=${dark}`, async ({ browser }) => {
    const context = await browser.newContext(mobile ? { viewport: { width: 360, height: 640 }, userAgent: android, hasTouch: true } : { viewport: { width: 1531, height: 715 } });
    if (mobile) await context.addInitScript(() => Object.defineProperty(window, 'NowWhatAndroid', { value: {} }));
    const page = await context.newPage(); await seed(page);
    if (dark) { await nav(page, 'settings'); await page.locator('#theme').click(); }
    await nav(page, 'tasks');
    await page.locator('.task-play').first().click(); await page.locator('#earlyTimer').click();
    await page.locator('.continuation-trigger').click(); await page.locator('#continuationInput').fill('未保存的草稿');
    await page.mouse.move(0, 0); await page.locator('#continuationInput').focus();
    if (!mobile) {
      await page.locator('#continuationInput').press('Escape');
      await page.locator('.continuation-trigger').click();
      await page.locator('#continuationInput').fill('下一次从这里继续');
      await page.locator('#continuationInput').press('Enter');
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).tasks[0].description)).toBe('下一次从这里继续');
      await context.close();
      return;
    }
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

for (const [device, width, userAgent] of [
  ['Android browser', 320, android],
  ['iPhone browser', 390, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'],
] as const) {
  test(`${device} uses the web controls throughout a touch session`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 700 }, userAgent, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await seed(page);
    const tab = (route: string) => page.locator(`[data-page="${route}"]`).tap();
    await tab('tasks');
    const first = page.locator('.task-strip').first();
    await expect(first.locator('.task-number')).toBeVisible();
    await expect(first.locator('.task-play + .task-pin')).toBeVisible();
    await page.locator('.small-action').tap();
    await page.locator('#name').fill(tasks[0].name);
    await page.locator('#saveActivity').tap();
    await expect(page.locator('#activityError')).toHaveText('任务名称重复');
    await page.locator('#cancelActivity').tap();
    await first.locator('.task-edit').tap();
    await page.locator('#modal .focus-restriction').first().tap();
    await page.locator('#saveActivity').tap();
    await tab('home');
    const minutes = page.locator('.inline-control-time input');
    await page.locator('.inline-control-time').tap();
    await expect(minutes).toBeFocused();
    await minutes.fill('26');
    const trigger = page.locator('#focusConditionsTrigger');
    await trigger.tap();
    const options = page.locator('.inline-control-frame .focus-restriction');
    await expect(options).toHaveCount(4);
    for (const option of await options.all()) {
      const wasPressed = await option.getAttribute('aria-pressed');
      await option.tap();
      await expect(option).not.toHaveAttribute('aria-pressed', wasPressed!);
      const rect = await option.boundingBox();
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width);
    }
    await trigger.tap();
    await page.locator('#start').tap();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('activeTimer')!).durationMs)).toBe(26 * 60000);
    await page.locator('#earlyTimer').tap();
    await page.locator('.desktop-note-slip button').tap();
    await page.locator('#continuationInput').fill('下次从第三章开始');
    await tab('today');
    await page.locator('.calendar-group').tap();
    await expect(page.locator('.desktop-calendar-entry')).toHaveCount(1);
    await expect(page.locator('.desktop-calendar-entry span').first()).toHaveText(/^\d{1,2}:\d{2}$/);
    await page.locator('#calendarBack').tap();
    await tab('home');
    await expect(page.locator('.desktop-note-slip')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).tasks.some((t: {description?: string}) => t.description === '下次从第三章开始'))).toBe(true);
    await context.close();
  });
}
