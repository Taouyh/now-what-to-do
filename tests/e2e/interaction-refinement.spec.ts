import { test, expect, type Page } from '@playwright/test';

async function seed(page: Page, theme = 'light') {
  const now = Date.now();
  const value = { version: 2, goals: [], tasks: [{ id: 'reading', name: '读书', requirements: { computer: false, audio: false, speech: false, uninterrupted: false } }], completed: Array.from({ length: 5 }, (_, i) => ({ recordId: `r${i}`, completionId: `r${i}`, taskId: 'reading', taskName: '读书', startedAt: now - (6-i)*60000, endedAt: now - (6-i)*60000 + 17000, completedAt: new Date(now).toISOString(), actualDurationMs: 17000, plannedDuration: 10, pausedDurationMs: 0, extensionDurationMs: 0 })), preferences: { time: 15, language: 'zh-CN', conditions: {} }, theme };
  await page.addInitScript(value => localStorage.setItem('whatToDoData', JSON.stringify(value)), value);
  await page.goto('/');
}
for (const theme of ['light', 'dark']) test(`automatic custom time and text conditions (${theme})`, async ({ page }) => {
  await seed(page, theme);
  const minutes = page.locator('.inline-control-time input');
  await minutes.fill('181');
  await expect(minutes).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#inline-control-time-tip')).toBeVisible();
  await minutes.fill('25');
  await expect(page.locator('#timeSummary')).toHaveText('25 分钟');
  await page.locator('.focus-conditions-trigger').click();
  const options = page.locator('#home .focus-restriction');
  for (const option of await options.all()) {
    const previous = await option.getAttribute('aria-pressed');
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', String(previous !== 'true'));
    await option.press('Space');
    await expect(option).toHaveAttribute('aria-pressed', previous!);
  }
  await page.keyboard.press('Escape');
  await page.locator('#start').click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('activeTimer')!).plannedDurationMs)).toBe(1500000);
});
for (const width of [1531, 1024, 810, 390, 320]) test(`four calendar records fit at ${width}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 715 }); await seed(page, 'dark');
  await page.locator('[data-page="today"]').click(); await page.locator('.calendar-group').click();
  await expect(page.locator('.desktop-calendar-entry')).toHaveCount(4);
  const layout = await page.locator('.calendar-records').evaluate(el => {
    const r = el.getBoundingClientRect();
    return { overflow: el.scrollHeight-el.clientHeight, bottom: r.bottom, rows: [...el.querySelectorAll('.desktop-calendar-entry')].map(row => ({ top: row.getBoundingClientRect().top, bottom: row.getBoundingClientRect().bottom, height: row.getBoundingClientRect().height })) };
  });
  expect(layout.overflow).toBeLessThanOrEqual(1);
  for (const row of layout.rows) { expect(row.bottom).toBeLessThanOrEqual(layout.bottom+1); expect(row.height).toBeGreaterThanOrEqual(36); }
  const pager = await page.locator('#records-next').boundingBox(); expect(layout.rows.at(-1)!.bottom).toBeLessThanOrEqual(pager!.y);
  await page.screenshot({ path: info.outputPath('calendar.png'), fullPage: true });
  await page.locator('#records-next').click(); await expect(page.locator('.desktop-calendar-entry')).toHaveCount(1);
  await page.locator('#records-previous').click(); await expect(page.locator('.desktop-calendar-entry')).toHaveCount(4);
  const before = await page.locator('.record-row').evaluateAll(rows => rows.map(row => ({ width: row.getBoundingClientRect().width, height: row.getBoundingClientRect().height })));
  await page.locator('.desktop-calendar-entry').first().click(); await expect(page.locator('.record-detail')).toHaveCount(0);
  const after = await page.locator('.record-row').evaluateAll(rows => rows.map(row => ({ width: row.getBoundingClientRect().width, height: row.getBoundingClientRect().height })));
  for (let i = 0; i < before.length; i++) { expect(after[i].width).toBeCloseTo(before[i].width, 1); expect(after[i].height).toBeGreaterThanOrEqual(before[i].height-1); }
  await page.screenshot({ path: info.outputPath('calendar-after-click.png'), fullPage: true });
});
