import { test, expect } from '@playwright/test';

for (const language of ['zh-CN', 'en', 'ja']) test(`web pin pagination and open descriptions ${language}`, async ({ page }) => {
  await page.addInitScript(language => {
    if (localStorage.getItem('whatToDoData')) return;
    localStorage.setItem('whatToDoData', JSON.stringify({ version: 2, goals: [], tasks: Array.from({ length: 12 }, (_, i) => ({ id: `pin-${i}`, name: `Task ${i}`, description: 'First line\nSecond line', requirements: {} })), completed: [], preferences: { language, time: 10, conditions: {} }, theme: 'light' }));
  }, language);
  await page.goto('/#tasks');
  await page.locator('#tasks-next').click();
  await page.locator('[data-task-id="pin-11"] .task-pin').click();
  await expect(page.locator('.task-strip').first()).toHaveAttribute('data-task-id', 'pin-11');
  await expect(page.locator('[data-task-id="pin-11"] .task-pin')).toBeFocused();
  await page.locator('[data-task-id="pin-3"] .task-pin').click();
  expect(await page.locator('.task-strip').evaluateAll(rows => rows.slice(0, 2).map(r => (r as HTMLElement).dataset.taskId))).toEqual(['pin-3', 'pin-11']);
  await page.reload();
  await expect(page.locator('.task-strip').first()).toHaveAttribute('data-task-id', 'pin-3');
  await expect(page.locator('[data-task-id="pin-11"] .task-pin')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-task-id="pin-11"] .task-pin').click();
  // Unpin follows the moved task back to its original page, with keyboard focus intact.
  await expect(page.locator('[data-task-id="pin-11"] .task-pin')).toBeFocused();
  await page.locator('[data-task-id="pin-11"] .task-edit').click();
  await expect(page.locator('#activityOptions')).toHaveAttribute('open', '');
  await expect(page.locator('#descriptionToggle')).toHaveCSS('text-align', 'center');
  expect(await page.locator('#descriptionToggle').evaluate(el => {
    const range = document.createRange(); range.selectNodeContents(el);
    const text = range.getBoundingClientRect(), parent = el.parentElement!.getBoundingClientRect();
    return Math.abs(text.x + text.width / 2 - parent.x - parent.width / 2);
  })).toBeLessThan(1);
  await page.locator('#cancelActivity').click();
  await page.locator('[data-task-id="pin-11"] .task-play').click();
  await expect(page.locator('#timerDescription')).toHaveAttribute('open', '');
  await expect(page.locator('#timerDesc')).toBeVisible();
  await expect(page.locator('#timerDescription summary')).toHaveCSS('text-align', 'center');
  await page.locator('#timerDescription summary').click();
  await page.locator('#pauseTimer').click();
  await expect(page.locator('#timerDescription')).not.toHaveAttribute('open');
  await page.locator('#earlyTimer').click();
  await expect(page.locator('.continuation-trigger')).toHaveClass(/paper-slip/);
  await expect(page.locator('.continuation-trigger')).toHaveCSS('border-radius', '0px');
  await page.locator('.continuation-trigger').click();
  await page.locator('#continuationInput').fill('Continue here');
  await page.locator('.feedback-actions button').first().click();
  await page.locator('[data-page="tasks"]').click();
  await page.locator('.task-play').first().click();
  await expect(page.locator('#timerDescription')).toHaveAttribute('open', '');
  await page.locator('#earlyTimer').click();
  await page.locator('[data-page="tasks"]').click(); await page.locator('.small-action').click();
  await expect(page.locator('#desc')).toBeVisible();
});
