import { test, expect } from '@playwright/test';

const sizes = [[1531,715], [1480,715], [1236,715], [1920,1080], [1024,768], [820,600], [800,600], [390,844], [320,568], [812,375]];
for (const language of ['zh-CN', 'en', 'ja']) for (const [width, height] of sizes) {
  test(`calendar labels stay readable at ${width}x${height} ${language}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    const names = ['读书', '学日语', 'Take a walk', 'ストレッチ', '长活动名称 Long activity 日本語 '.repeat(8), '第六项活动'];
    const now = Date.now();
    await page.addInitScript(({ names, language, now }) => localStorage.setItem('whatToDoData', JSON.stringify({
      version: 2, goals: [], tasks: names.map((name, i) => ({ id: `layout-${i}`, name, requirements: {} })),
      completed: names.map((taskName, i) => ({ recordId: `layout-record-${i}`, completionId: `layout-record-${i}`, taskId: `layout-${i}`, taskName, startedAt: now - 17000, endedAt: now, completedAt: new Date(now).toISOString(), actualDurationMs: 17000, plannedDuration: 15, pausedDurationMs: 0, extensionDurationMs: 0 })),
      preferences: { time: 15, language, conditions: {} }, theme: 'light'
    })), { names, language, now });
    await page.goto('/');
    await page.locator('.bookmarks [data-page="today"]').click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.calendar-group')).toHaveCount(5);
    const inspect = async () => {
      const metrics = await page.locator('.calendar-group').evaluateAll(rows => rows.map(row => {
        const title = row.querySelector('span')!, meta = row.querySelector('small')!;
        const a = title.getBoundingClientRect(), b = meta.getBoundingClientRect(), c = row.getBoundingClientRect();
        return { titleHeight: a.height, lineHeight: parseFloat(getComputedStyle(title).lineHeight), overlap: a.bottom - b.top, inside: c.bottom - b.bottom, metaHeight: b.height, metaLine: parseFloat(getComputedStyle(meta).lineHeight) };
      }));
      for (const m of metrics) {
        expect(m.titleHeight, 'activity name must retain a complete line').toBeGreaterThanOrEqual(m.lineHeight - 1);
        expect(m.metaHeight, 'summary must retain a complete line').toBeGreaterThanOrEqual(m.metaLine - 1);
        expect(m.overlap, 'name and summary must not overlap').toBeLessThanOrEqual(1);
        expect(m.inside, 'summary must remain inside its card').toBeGreaterThanOrEqual(1);
      }
    };
    await inspect();
    await page.locator('.calendar-group').first().click();
    await inspect();
    await expect(page.locator('.calendar-column.book-right h2')).toHaveText('读书');
    await page.screenshot({ path: testInfo.outputPath('calendar-initial.png'), fullPage: true });
    const directory = page.locator('.calendar-directory');
    if (await directory.evaluate(el => el.scrollHeight > el.clientHeight + 1)) {
      await directory.hover(); await page.mouse.wheel(0, 1000);
      await expect.poll(() => directory.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
      const bounds = await page.evaluate(() => ({ list: document.querySelector('.calendar-directory')!.getBoundingClientRect().bottom, pager: document.querySelector('#directory-next')!.getBoundingClientRect().top }));
      expect(bounds.list).toBeLessThanOrEqual(bounds.pager);
    }
    await page.locator('.calendar-group').last().scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('calendar.png'), fullPage: true });
    await page.locator('#directory-next').click();
    await expect(page.locator('.calendar-group')).toHaveCount(1);
    await expect(page.locator('.calendar-group > span')).toHaveText('第六项活动');
    await inspect();
  });
}
