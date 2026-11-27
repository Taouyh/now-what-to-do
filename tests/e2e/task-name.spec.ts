import { test, expect } from '@playwright/test';

test('duplicate task names show an inline error until corrected', async ({ page }) => {
  await page.goto('/');
  await page.locator('#quickName').fill('写字');
  await page.locator('#addFirstTask').click();
  await page.locator('[data-page="tasks"]').click();
  await page.locator('.small-action').click();
  const name = page.locator('#name'), error = page.locator('#activityError');
  await name.fill(' 写字 ');
  await expect(error).toHaveText('任务名称重复');
  await page.locator('#desc').fill('保留这段草稿');
  await page.locator('#saveActivity').click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.task-strip')).toHaveCount(1);
  await name.fill('Read');
  await expect(error).toBeEmpty();
  await expect(page.locator('#desc')).toHaveValue('保留这段草稿');
  await page.locator('#saveActivity').click();
  const edit = page.locator('.task-edit').filter({hasText:'Read'});
  await expect(edit).toBeFocused();
  await expect(edit).toHaveCSS('outline-style', 'none');
  await page.locator('.task-edit').filter({hasText:'写字'}).click();
  await name.fill('read');
  await page.locator('#saveActivity').click();
  await expect(error).toHaveText('任务名称重复');
  await name.fill('写字');
  await expect(error).toBeEmpty();
  await page.locator('#saveActivity').click();
  await expect(page.locator('#modal')).toBeHidden();
  await page.reload();
  await expect(page.locator('.task-title')).toHaveText(['写字','Read']);
});

test('legacy names can be repaired while a duplicate import preserves current data', async ({ page }) => {
  const original = {version:2, goals:[], completed:[], tasks:['first','second'].map(id => ({id, name:'写字', requirements:{}})), preferences:{time:15,language:'zh-CN',conditions:{}},theme:'light'};
  await page.addInitScript(value => {
    if (!localStorage.getItem('whatToDoData')) localStorage.setItem('whatToDoData', JSON.stringify(value));
  }, original);
  await page.goto('/#tasks');
  await page.locator('[data-task-id="second"] .task-edit').click();
  await expect(page.locator('#activityError')).toHaveText('任务名称重复');
  await page.locator('#name').fill('练字');
  await page.locator('#saveActivity').click();
  await expect(page.locator('.task-title')).toHaveText(['写字','练字']);
  await page.locator('[data-page="settings"]').click();
  const data = () => page.evaluate(() => localStorage.getItem('whatToDoData'));
  const before = await data();
  await page.locator('#file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(original))});
  await expect(page.locator('#appNotice')).toHaveText('任务名称重复');
  await expect(page.locator('#confirmLayer')).toBeHidden();
  expect(await data()).toBe(before);
});
