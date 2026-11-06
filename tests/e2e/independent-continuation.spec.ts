import { test, expect, type Page } from '@playwright/test';

async function completed(page: Page, english = false) {
  const value = { version: 2, goals: [], tasks: [
    { id: 'done-id', name: english ? 'Read' : '读书', description: '第 12 页', requirements: {} },
    { id: 'next-id', name: english ? 'Walk' : '散步', description: '另一项保留说明', requirements: {} },
  ], completed: [], preferences: { time: 15, language: english ? 'en' : 'zh-CN', conditions: {} }, theme: english ? 'dark' : 'light' };
  await page.addInitScript(value => { if (!localStorage.getItem('whatToDoData')) localStorage.setItem('whatToDoData', JSON.stringify(value)); }, value);
  await page.goto('/'); await page.locator('.bookmarks [data-page="tasks"]').click();
  await page.locator('.task-play').first().click(); await page.locator('#earlyTimer').click();
  await expect(page.locator('#recommendedTaskName')).toHaveText(english ? 'Walk' : '散步');
}
async function raw(page: Page) { return page.evaluate(() => localStorage.getItem('whatToDoData')!); }

test('independent short desktop clear cancel close and empty save preserve original identity', async ({ page }, info) => {
  await page.setViewportSize({ width: 1531, height: 715 }); await completed(page);
  const trigger = page.getByRole('button', { name: '为「读书」记录下次起点', exact: true });
  await expect(trigger).toHaveText('记下次起点·读书');
  await page.screenshot({ path: info.outputPath('short-entry.png'), fullPage: true });
  const original = await raw(page), before = JSON.parse(original);
  await trigger.click();
  const input = page.getByRole('textbox', { name: '读书：下次从哪继续？', exact: true });
  await page.locator('.continuation-input').getByRole('button', { name: '清空说明', exact: true }).click();
  await expect(input).toHaveValue(''); await expect(input).toBeFocused();
  await page.locator('.feedback-actions').getByRole('button', { name: '取消', exact: true }).click();
  expect(await raw(page)).toBe(original);
  // Produce another completed session to check closing an edited draft.
  await page.locator('.bookmarks [data-page="tasks"]').click(); await page.locator('.task-play').first().click(); await page.locator('#earlyTimer').click();
  await trigger.click(); const afterSecond = await raw(page);
  await input.fill('不保存的草稿'); await page.locator('.feedback-heading').getByRole('button', { name: '关闭', exact: true }).click();
  expect(await raw(page)).toBe(afterSecond);
  await page.locator('.bookmarks [data-page="tasks"]').click(); await page.locator('.task-play').first().click(); await page.locator('#earlyTimer').click();
  await trigger.click(); await page.locator('.continuation-input').getByRole('button', { name: '清空说明', exact: true }).click();
  const book = await page.locator('#book').boundingBox();
  for (const b of await page.locator('.feedback-actions button').all()) {
    const box = await b.boundingBox(); expect(box!.y + box!.height).toBeLessThan(book!.y + book!.height - 24);
    expect(box!.x).toBeGreaterThan(book!.x); expect(box!.x + box!.width).toBeLessThan(book!.x + book!.width);
  }
  await page.screenshot({ path: info.outputPath('short-clear-editor.png'), fullPage: true });
  const beforeSave = JSON.parse(await raw(page));
  await page.locator('.feedback-actions').getByRole('button', { name: '保存', exact: true }).click();
  const after = JSON.parse(await raw(page));
  expect(after.tasks.find((t: any) => t.id === 'done-id').description).toBe('');
  expect(after.tasks.find((t: any) => t.id === 'next-id')).toEqual(before.tasks.find((t: any) => t.id === 'next-id'));
  expect(after.completed).toEqual(beforeSave.completed);
  await expect(page.locator('#completionFeedback')).toBeEmpty();
});

test('independent narrow English short label and action access', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 715 }); await completed(page, true);
  const trigger = page.getByRole('button', { name: 'Note where to resume Read', exact: true });
  await expect(trigger).toHaveText('Note where to resume·Read');
  await page.screenshot({ path: info.outputPath('english-short-entry.png'), fullPage: true });
  await trigger.click();
  const input = page.getByRole('textbox', { name: 'Read: where will you resume?', exact: true });
  await expect(input).toBeFocused(); await input.fill('Page 13');
  await page.screenshot({ path: info.outputPath('english-short-editor.png'), fullPage: true });
  await page.locator('.feedback-actions').getByRole('button', { name: 'Save', exact: true }).click();
  const after = JSON.parse(await raw(page));
  expect(after.tasks.find((t: any) => t.id === 'done-id').description).toBe('Page 13');
  expect(after.tasks.find((t: any) => t.id === 'next-id').description).toBe('另一项保留说明');
});
