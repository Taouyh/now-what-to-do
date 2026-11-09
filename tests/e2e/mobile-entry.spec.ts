import { test, expect } from '@playwright/test';

for (const language of ['zh-CN', 'en', 'ja']) {
  test(`mobile empty entry and contracted add header ${language}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36' });
    const page = await context.newPage();
    await page.addInitScript(language => localStorage.setItem('whatToDoData', JSON.stringify({ version: 2, goals: [], tasks: [], completed: [], preferences: { language, time: 10, conditions: {} }, theme: 'light' })), language);
    await page.goto('/'); await page.evaluate(() => document.fonts.ready);
    const book = await page.locator('#book').boundingBox(), title = await page.locator('.welcome-card h1').boundingBox();
    expect(title!.y - book!.y).toBeLessThan(80);
    await page.locator('[data-page="today"]').click();
    const start = await page.locator('.calendar-start').boundingBox(), count = await page.locator('#todayBox .book-left .page-count').boundingBox();
    expect(Math.abs(start!.x + start!.width / 2 - count!.x - count!.width / 2)).toBeLessThan(1);
    expect(start!.y + start!.height).toBeLessThan(count!.y);
    await page.locator('.calendar-start').click(); await expect(page.locator('#onboarding')).toBeVisible();
    await page.locator('[data-page="tasks"]').click(); await page.locator('.small-action').click();
    await page.locator('#name').fill('保留草稿');
    for (const size of [{ width: 360, height: 360 }, { width: 800, height: 360 }]) {
      await page.setViewportSize(size);
      await expect(page.locator('.book-header')).toBeHidden();
      expect(await page.locator('#close').evaluate(el => {
        const r = el.getBoundingClientRect(), input = document.getElementById('name')!.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= input.top && r.right <= innerWidth && el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      })).toBe(true);
      await expect(page.locator('#name')).toHaveValue('保留草稿');
    }
    await page.locator('#close').click(); await expect(page.locator('.book-header')).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).tasks.length)).toBe(0);
    await context.close();
  });
}
