import { test, expect } from '@playwright/test';

for (const [language, conditions, restricted, required] of [
  ['zh-CN', '专注条件', '不方便使用电脑', '必须用电脑'],
  ['en', 'Focus conditions', 'Cannot use a computer', 'Requires a computer'],
  ['ja', '集中条件', 'パソコンが使えない', 'パソコンが必要'],
]) test(`desktop controls use real activity, timer and journal data in ${language}`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(language => {
    if (localStorage.getItem('whatToDoData')) return;
    localStorage.setItem('whatToDoData', JSON.stringify({
      version: 2, goals: [], tasks: [{ id: 'read', name: 'Read', description: 'Chapter 1', requirements: {} }],
      completed: [], preferences: { language, time: 15, conditions: {computer:true, audio:true, speech:true, interrupted:false} }, theme: language === 'ja' ? 'dark' : 'light',
    }));
  }, language);
  await page.goto('/#tasks');
  await page.locator('.task-edit').click();
  const requirement = page.locator('#modal .focus-restriction').first();
  await expect(requirement).toHaveAccessibleName(required);
  await requirement.click();
  await page.locator('#saveActivity').click();
  await page.locator('[data-page="home"]').click();
  await page.getByRole('button', { name: conditions, exact: true }).click();
  const restriction = page.getByRole('button', { name: restricted, exact: true });
  await restriction.click();
  await expect(page.locator('#start')).toHaveCount(0);
  await restriction.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#start')).toBeVisible();

  const note = page.locator('.continuation-trigger');
  await expect(note).toContainText('Chapter 1');
  await note.click();
  await page.locator('#continuationInput').fill('Chapter 2');
  await page.locator('#continuationInput').press('Enter');
  const data = () => page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!));
  expect((await data()).tasks[0]).toMatchObject({description:'Chapter 2', requirements:{computer:true}});

  const minutes = page.locator('.inline-control-time input');
  await minutes.fill('181');
  await page.locator('#start').click();
  await expect(minutes).toHaveAttribute('aria-invalid', 'true');
  await minutes.fill('27');
  await page.locator('#start').click();
  await expect(page.locator('#timer')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('activeTimer')!).durationMs)).toBe(27 * 60000);
  await page.locator('#earlyTimer').click();
  await expect(note).toContainText('Read');
  await note.click();
  await page.locator('#continuationInput').fill('discard draft');
  await page.locator('#continuationInput').press('Escape');
  await expect(note).toContainText('Chapter 2');
  await note.click();
  await page.locator('#continuationInput').fill('Chapter 3');
  await page.locator('[data-page="today"]').click();
  await page.locator('.calendar-group').click();
  await expect(page.locator('.calendar-records [role=listitem]')).toHaveCount(1);
  await expect(page.locator('.calendar-records [role=listitem] span').first()).toHaveText(/^\d{1,2}:\d{2}$/);
  await page.reload();
  expect((await data()).tasks[0].description).toBe('Chapter 3');
  expect(errors).toEqual([]);
});
