import { test, expect, type Page } from '@playwright/test';

async function seed(page: Page, theme = 'light') {
  const now = Date.now();
  const value = { version: 2, goals: [], tasks: [{ id: 'reading', name: '读书', requirements: { computer: false, audio: false, speech: false, uninterrupted: false } }], completed: Array.from({ length: 5 }, (_, i) => ({ recordId: `r${i}`, completionId: `r${i}`, taskId: 'reading', taskName: '读书', startedAt: now - (6-i)*60000, endedAt: now - (6-i)*60000 + 17000, completedAt: new Date(now).toISOString(), actualDurationMs: 17000, plannedDuration: 10, pausedDurationMs: 0, extensionDurationMs: 0 })), preferences: { time: 15, language: 'zh-CN', conditions: {} }, theme };
  await page.addInitScript(value => localStorage.setItem('whatToDoData', JSON.stringify(value)), value);
  await page.goto('/');
}
for (const theme of ['light', 'dark']) test(`automatic custom time and text conditions (${theme})`, async ({ page }) => {
  await seed(page, theme);
  await page.locator('#timePicker > summary').click();
  await expect(page.locator('#timePicker .picker-done')).toHaveCount(0);
  await page.locator('#times [data-v="custom"]').click();
  await expect(page.locator('#customTimeError')).toBeEmpty();
  await page.locator('#customMinutes').fill('1441');
  await expect(page.locator('#appNotice')).toBeVisible();
  await expect(page.locator('#appNotice')).toHaveText('请输入 1–1440 的整数');
  await expect(page.locator('#appNotice')).toHaveCSS('background-color', 'rgb(17, 17, 17)');
  await expect(page.locator('#appNotice')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.locator('#customMinutes').press('Enter');
  await expect(page.locator('#timePicker')).toHaveAttribute('open', '');
  expect(await page.evaluate(() => localStorage.getItem('activeTimer'))).toBeNull();
  await page.locator('#customMinutes').fill('25');
  await expect(page.locator('#timeSummary')).toHaveText('25 分钟');
  await expect(page.locator('#appNotice')).toBeHidden();
  await page.locator('#customMinutes').press('Enter');
  await expect(page.locator('#timePicker')).not.toHaveAttribute('open', '');
  await page.locator('#conditionsPicker > summary').click();
  for (const id of ['computerReady', 'audioReady', 'speechReady', 'interruptionsLikely']) {
    const input = page.locator(`#${id}`), label = input.locator('..');
    const before = await label.evaluate(el => getComputedStyle(el).color);
    await label.click(); await page.mouse.move(0, 0);
    await expect(input).toBeChecked(); await expect(input).toHaveCSS('opacity', '0');
    expect(await label.evaluate(el => getComputedStyle(el).color)).not.toBe(before);
    await input.focus(); await page.keyboard.press('Space'); await expect(input).not.toBeChecked();
  }
  await page.keyboard.press('Escape');
  await page.locator('#start').click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('activeTimer')!).plannedDurationMs)).toBe(1500000);
});
for (const width of [1531, 1024, 810, 390, 320]) test(`four calendar records fit at ${width}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 715 }); await seed(page, 'dark');
  await page.locator('[data-page="today"]').click(); await page.locator('.calendar-group').click();
  await expect(page.locator('.record-toggle')).toHaveCount(4);
  const layout = await page.locator('.calendar-records').evaluate(el => {
    const r = el.getBoundingClientRect();
    return { overflow: el.scrollHeight-el.clientHeight, bottom: r.bottom, rows: [...el.querySelectorAll('.record-toggle')].map(row => ({ top: row.getBoundingClientRect().top, bottom: row.getBoundingClientRect().bottom, height: row.getBoundingClientRect().height })) };
  });
  expect(layout.overflow).toBeLessThanOrEqual(1);
  for (const row of layout.rows) { expect(row.bottom).toBeLessThanOrEqual(layout.bottom+1); expect(row.height).toBeGreaterThanOrEqual(36); }
  const pager = await page.locator('#records-next').boundingBox(); expect(layout.rows.at(-1)!.bottom).toBeLessThanOrEqual(pager!.y);
  await page.screenshot({ path: info.outputPath('calendar.png'), fullPage: true });
  await page.locator('#records-next').click(); await expect(page.locator('.record-toggle')).toHaveCount(1);
  await page.locator('#records-previous').click(); await expect(page.locator('.record-toggle')).toHaveCount(4);
  const before = await page.locator('.record-row').evaluateAll(rows => rows.map(row => ({ width: row.getBoundingClientRect().width, height: row.getBoundingClientRect().height })));
  await page.locator('.record-toggle').first().click(); await expect(page.locator('.record-detail')).toBeVisible();
  const after = await page.locator('.record-row').evaluateAll(rows => rows.map(row => ({ width: row.getBoundingClientRect().width, height: row.getBoundingClientRect().height })));
  for (let i = 0; i < before.length; i++) { expect(after[i].width).toBeCloseTo(before[i].width, 1); expect(after[i].height).toBeGreaterThanOrEqual(before[i].height-1); }
  await page.screenshot({ path: info.outputPath('calendar-expanded.png'), fullPage: true });
});
