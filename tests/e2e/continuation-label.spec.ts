import { test, expect, type Page } from '@playwright/test';

async function finishFirst(page: Page, language = 'zh-CN', long = false, theme = 'light') {
  const name = long ? '读书与思考'.repeat(40) : '读书';
  const value = { version: 2, goals: [], tasks: [{ id: 'first', name, description: '第 12 页', requirements: {} }, { id: 'second', name: '散步', description: '另一项原说明', requirements: {} }], completed: [], preferences: { time: 15, language, conditions: {} }, theme };
  await page.addInitScript(value => { if (!localStorage.getItem('whatToDoData')) localStorage.setItem('whatToDoData', JSON.stringify(value)); }, value);
  await page.goto('/'); await page.locator('.bookmarks [data-page="tasks"]').click();
  await page.locator('.task-play').first().click(); await page.locator('#earlyTimer').click();
  await expect(page.locator('#recommendedTaskName')).toHaveText('散步');
  return name;
}

test('continuation names the completed activity and saves only its description', async ({ page }, info) => {
  await page.setViewportSize({ width: 1531, height: 715 });
  await finishFirst(page);
  const trigger = page.getByRole('button', { name: '读书：第 12 页', exact: true });
  await expect(trigger).toContainText('第 12 页'); await expect(trigger).toContainText('读书');
  await page.screenshot({ path: info.outputPath('entry.png'), fullPage: true });
  await trigger.focus(); await page.keyboard.press('Enter');
  const input = page.getByRole('textbox', { name: '读书：下次从哪继续？', exact: true });
  await expect(input).toBeFocused(); await expect(input).toHaveValue('第 12 页');
  await page.screenshot({ path: info.outputPath('editor.png'), fullPage: true });
  await input.fill('第 13 页继续'); await input.press('Enter');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!));
  expect(stored.tasks[0].description).toBe('第 13 页继续'); expect(stored.tasks[1].description).toBe('另一项原说明');
  expect(stored.completed).toHaveLength(1); await expect(page.locator('#completionFeedback')).toBeEmpty();
});

for (const [width, language, theme] of [[1531, 'zh-CN', 'light'], [390, 'en', 'dark'], [320, 'ja', 'light']] as const) {
  test(`continuation fits ${width}px ${language} ${theme} and cancel preserves data`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 715 });
    const name = await finishFirst(page, language, true, theme);
    const trigger = page.locator('.continuation-trigger');
    await expect(trigger).toHaveAccessibleName(name + (language === 'en' ? ': ' : '：') + '第 12 页');
    // The approved paper-slip contour replaced the rectangular border on Nov 9.
    await expect(trigger).toHaveClass(/paper-slip/);
    await expect(trigger).toHaveCSS('border-right-width', '0px');
    expect(await trigger.evaluate(el => getComputedStyle(el).backgroundImage)).not.toBe('none');
    await expect(trigger.locator('.desktop-note-summary')).toHaveCSS('text-overflow', 'ellipsis');
    const box = await trigger.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: info.outputPath('entry.png'), fullPage: true });
    await trigger.click(); await expect(page.locator('#continuationInput')).toBeFocused();
    await expect(page.locator('.continuation-label')).toContainText(name);
    await page.locator('#continuationInput').fill('取消的草稿');
    if (width > 800) {
      const book = await page.locator('#book').boundingBox(), actions = await page.locator('#continuationInput').boundingBox();
      expect(actions!.y + actions!.height).toBeLessThan(book!.y + book!.height - 24);
    }
    await page.screenshot({ path: info.outputPath('editor.png'), fullPage: true });
    await page.locator('#continuationInput').press('Escape');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).tasks[0].description)).toBe('第 12 页');
  });
}

for (const dismissal of ['outside click', 'timeout']) {
  test('dismissed completion note stays closed across navigation after ' + dismissal, async ({ page }) => {
    await finishFirst(page);
    const note = page.locator('.continuation-trigger');
    await expect(note).toContainText('读书');
    if (dismissal === 'outside click') {
      await note.click();
      await page.locator('#continuationInput').fill('第 14 页');
      await page.locator('[data-page="today"]').click();
    } else {
      await page.mouse.move(0, 0);
      await expect(note).toBeHidden({ timeout: 9000 });
      await page.locator('[data-page="settings"]').click();
    }
    await page.locator('[data-page="home"]').click();
    await expect(page.locator('#recommendedTaskName')).toHaveText('散步');
    await expect(note).toBeHidden();

    // A new session has its own invitation, even for the same completed activity.
    await page.locator('[data-page="tasks"]').click();
    await page.locator('.task-play').first().click();
    await page.locator('#earlyTimer').click();
    await expect(note).toHaveText(dismissal === 'outside click' ? '读书：第 14 页' : '读书：第 12 页');
    const history = await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).completed);
    expect(history).toHaveLength(2);
  });
}

test('a sole activity keeps its saved note closed on returning home', async ({ page }) => {
  await page.goto('/');
  await page.locator('#quickName').fill('阅读');
  await page.locator('#addFirstTask').click();
  await page.locator('#start').click();
  await page.locator('#earlyTimer').click();
  await page.locator('.continuation-trigger').click();
  await page.locator('#continuationInput').fill('从下一章开始');
  await page.locator('#continuationInput').press('Enter');
  await page.locator('[data-page="tasks"]').click();
  await page.locator('[data-page="home"]').click();
  await expect(page.locator('#recommendedTaskName')).toHaveText('阅读');
  await expect(page.locator('.continuation-trigger')).toBeHidden();
  await page.locator('#start').click();
  await page.locator('#earlyTimer').click();
  await expect(page.locator('.continuation-trigger')).toHaveText('阅读：从下一章开始');
});
