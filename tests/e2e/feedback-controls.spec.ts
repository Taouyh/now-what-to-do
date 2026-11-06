import { test, expect, type Page } from '@playwright/test';

function fixture() {
  return { version: 2, goals: [], tasks: [{ id: 'reading', name: '读书', requirements: { computer: false, audio: false, speech: false, uninterrupted: false } }], completed: [] as any[], preferences: { time: 60, language: 'zh-CN', conditions: { computer: false, audio: false, speech: false, interrupted: false } }, theme: 'light' };
}
async function seed(page: Page, value = fixture()) {
  await page.addInitScript(value => { if (!localStorage.getItem('whatToDoData')) localStorage.setItem('whatToDoData', JSON.stringify(value)); }, value);
  await page.goto('/');
}
async function nav(page: Page, route: string) { await page.locator(`.bookmarks [data-page="${route}"]`).click(); }
async function custom(page: Page) {
  await page.locator('#timePicker > summary').click();
  await page.locator('#times [data-v="custom"]').click();
  await page.locator('#customMinutes').fill('');
}
async function savedTime(page: Page) { return page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).preferences.time); }

for (const exit of ['enter', 'close', 'escape', 'summary', 'outside', 'navigation']) {
  test(`blank custom time defaults to ten on ${exit}`, async ({ page }) => {
    await seed(page); await custom(page);
    await page.locator('#customMinutes').fill('   ');
    if (exit === 'enter') await page.locator('#customMinutes').press('Enter');
    if (exit === 'close') await page.locator('#timePicker .picker-close').click();
    if (exit === 'escape') await page.keyboard.press('Escape');
    if (exit === 'summary') await page.locator('#timePicker > summary').press('Space');
    if (exit === 'outside') await page.locator('.brand').click();
    if (exit === 'navigation') { await nav(page, 'tasks'); await nav(page, 'home'); }
    await expect(page.locator('#timeSummary')).toHaveText('10 分钟'); await expect(page.locator('#recommendedTaskName')).toHaveText('读书'); await page.locator('#start').click();
    await expect(page.locator('#timer')).toBeVisible();
    expect(await savedTime(page)).toBe(10);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('activeTimer')!).plannedDurationMs)).toBe(600000);
  });
}

test('ordered presets, persisted twenty, valid custom and nonempty invalid input', async ({ page }) => {
  await seed(page);
  expect(await page.locator('#times button').evaluateAll(buttons => buttons.map(b => (b as HTMLElement).dataset.v))).toEqual(['10', '15', '20', '30', '60', 'custom']);
  await page.locator('#timePicker > summary').click(); await page.locator('#times [data-v="20"]').click();
  await expect(page.locator('#timePicker')).not.toHaveAttribute('open', ''); await page.reload();
  await expect(page.locator('#timeSummary')).toHaveText('20 分钟'); expect(await savedTime(page)).toBe(20);
  await custom(page); await page.locator('#customMinutes').fill('25'); await page.locator('#customMinutes').press('Enter');
  await expect(page.locator('#timeSummary')).toHaveText('25 分钟');
  await page.locator('#timePicker > summary').click(); await page.locator('#customMinutes').fill('0');
  await page.locator('#customMinutes').press('Enter');
  await expect(page.locator('#timePicker')).toHaveAttribute('open', '');
  await expect(page.locator('#customMinutes')).toHaveValue('0');
  await expect(page.locator('#customMinutes')).toHaveAttribute('aria-invalid', 'true');
});

for (const width of [1531, 390, 320]) {
  test(`feedback controls stay intact at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 715 }); await seed(page);
    const failures: string[] = []; page.on('pageerror', e => failures.push(e.message));
    await custom(page); await page.locator('#customMinutes').focus();
    await expect(page.locator('#customMinutes')).toHaveCSS('border-top-width', '0px');
    await expect(page.locator('#customMinutes')).toHaveCSS('outline-style', 'none');
    await expect(page.locator('.custom-minutes-control')).not.toHaveCSS('border-top-width', '0px');
    await page.screenshot({ path: info.outputPath('time.png'), fullPage: true });
    await page.keyboard.press('Escape'); await nav(page, 'tasks');
    for (const edit of [false, true]) {
      if (edit) await page.locator('.task-edit').click(); else await page.locator('.small-action').click();
      await expect(page.locator('.activity-dialog-footer')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(page.locator('.activity-dialog-footer')).toHaveCSS('border-top-width', '0px');
      const labels = page.locator('.activity-requirements .checkbox-label');
      for (let i = 0; i < 4; i++) {
        const label = labels.nth(i), tip = label.locator('.requirement-tooltip');
        await label.hover();
        await expect(tip).toHaveCSS('visibility', 'visible', { timeout: 150 });
        await expect(tip).toHaveCSS('background-color', 'rgb(17, 17, 17)');
        await expect(tip).toHaveCSS('color', 'rgb(255, 255, 255)');
        expect(await label.getAttribute('title')).toBeNull();
        const box = await tip.boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      await page.screenshot({ path: info.outputPath(edit ? 'edit.png' : 'add.png'), fullPage: true });
      await page.locator('#cancelActivity').click();
    }
    await nav(page, 'settings');
    for (const dark of [false, true]) {
      if (dark) await page.locator('#theme').click();
      for (const selector of ['#languageOptions', '.theme-options']) {
        const group = page.locator(selector); await expect(group).toHaveCSS('overflow', 'visible'); await expect(group).toHaveCSS('border-right-width', '0px');
        for (const b of await group.locator('button').all()) {
          await expect(b).toHaveCSS('border-right-width', '1px');
          const box = await b.boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        }
      }
      await page.screenshot({ path: info.outputPath(dark ? 'settings-dark.png' : 'settings-light.png'), fullPage: true });
      await nav(page, 'home');
      for (const selector of ['#timePicker > summary', '#conditionsPicker > summary']) {
        await page.mouse.move(0, 0);
        const before = await page.locator(selector).evaluate(el => { const s = getComputedStyle(el); return s.backgroundColor + s.backgroundImage; });
        await page.locator(selector).hover();
        const after = await page.locator(selector).evaluate(el => { const s = getComputedStyle(el); return s.backgroundColor + s.backgroundImage; });
        expect(after).not.toBe(before);
      }
      await nav(page, 'settings');
    }
    await page.locator('[data-language="ja"]').click(); await nav(page, 'tasks'); await page.locator('.task-edit').click();
    expect(await page.locator('.requirement-tooltip').first().textContent()).not.toBe('必须用电脑');
    await page.keyboard.press('Tab'); await page.locator('#computer').focus();
    await expect(page.locator('.requirement-tooltip').first()).toHaveCSS('visibility', 'visible');
    expect(failures).toEqual([]);
  });
}

test('calendar primary empty action and minute-only ranges preserve precise records', async ({ page }) => {
  await seed(page); await nav(page, 'today');
  await expect(page.locator('.calendar-start')).toHaveClass(/primary/);
  await expect(page.locator('.calendar-start')).toHaveCSS('background-image', /linear-gradient/);
  await page.locator('.calendar-start').click(); await expect(page.locator('#recommendedTaskName')).toBeVisible();
  const now = Date.now(), value = fixture();
  value.completed = [{ recordId: 'short', completionId: 'short', taskId: 'reading', taskName: '读书', startedAt: now - 17001, endedAt: now, completedAt: new Date(now).toISOString(), actualDurationMs: 17001, plannedDuration: 10, pausedDurationMs: 0, extensionDurationMs: 0 }];
  await page.evaluate(value => localStorage.setItem('whatToDoData', JSON.stringify(value)), value); await page.reload(); await nav(page, 'today');
  await page.locator('.calendar-group').click();
  await expect(page.locator('.record-toggle > span').first()).toHaveText(/^\d{2}:\d{2}–\d{2}:\d{2}$/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).completed)).toEqual(value.completed);
});
