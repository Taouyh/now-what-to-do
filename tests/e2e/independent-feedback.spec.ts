import { test, expect, type Page } from '@playwright/test';

// Independent fixed-commit acceptance. All records and profiles are synthetic.
function fixture(language = 'zh-CN', theme = 'light', time = 60) {
  return { version: 2, goals: [], tasks: [{ id: 'independent', name: '独立合成任务', description: '精度保护', requirements: { computer: false, audio: false, speech: false, uninterrupted: false } }], completed: [] as any[], preferences: { time, language, conditions: { computer: false, audio: false, speech: false, interrupted: false } }, theme, independentUnknown: { keep: 1.234567 } };
}
async function seed(page: Page, value = fixture()) {
  await page.addInitScript(value => { if (!localStorage.getItem('whatToDoData')) localStorage.setItem('whatToDoData', JSON.stringify(value)); }, value);
  await page.goto('/');
}
async function nav(page: Page, route: string) { await page.locator(`.bookmarks [data-page="${route}"]`).click(); }
async function custom(page: Page, draft = '') {
  await page.locator('#timePicker > summary').click();
  await page.locator('#times [data-v="custom"]').click();
  await page.locator('#customMinutes').fill(draft);
}
const tipText: Record<string, string[]> = {
  'zh-CN': ['必须用电脑', '必须听音频', '需要出声', '不便中断'],
  en: ['Requires a computer', 'Requires audio', 'Requires speaking aloud', 'Hard to pause'],
  ja: ['パソコンが必要', '音声を聞く必要あり', '声を出す必要あり', '中断しにくい'],
};

for (const width of [1531, 390, 320]) for (const language of ['zh-CN', 'en', 'ja']) {
  test(`independent tooltip clipping ${width} ${language}`, async ({ page, browser }, info) => {
    await info.attach('browser-version', { body: browser.version(), contentType: 'text/plain' });
    await page.setViewportSize({ width, height: 715 });
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await seed(page, fixture(language));
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') { await nav(page, 'settings'); await page.locator('#theme').click(); }
      await nav(page, 'tasks');
      for (const mode of ['add', 'edit']) {
        await page.locator(mode === 'add' ? '.small-action' : '.task-edit').click();
        for (let index = 0; index < 4; index++) {
          const label = page.locator('.activity-requirements .checkbox-label').nth(index);
          const tip = label.locator('.requirement-tooltip');
          await label.hover();
          await expect(tip).toHaveText(tipText[language][index]);
          const geometry = await tip.evaluate(el => {
            const r = el.getBoundingClientRect(), style = getComputedStyle(el);
            const clips: string[] = [];
            for (let p = el.parentElement; p; p = p.parentElement) {
              const s = getComputedStyle(p), b = p.getBoundingClientRect();
              if (/(hidden|auto|scroll|clip)/.test(s.overflowX) && (r.left < b.left - 1 || r.right > b.right + 1)) clips.push(p.className + ':x');
              if (/(hidden|auto|scroll|clip)/.test(s.overflowY) && (r.top < b.top - 1 || r.bottom > b.bottom + 1)) clips.push(p.className + ':y');
            }
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, visibility: style.visibility, bg: style.backgroundColor, color: style.color, transition: style.transitionDuration, clips };
          });
          expect(geometry).toMatchObject({ visibility: 'visible', bg: 'rgb(17, 17, 17)', color: 'rgb(255, 255, 255)', transition: '0s', clips: [] });
          expect(geometry.left).toBeGreaterThanOrEqual(0); expect(geometry.right).toBeLessThanOrEqual(width);
          expect(geometry.top).toBeGreaterThanOrEqual(0); expect(geometry.bottom).toBeLessThanOrEqual(715);
          // Real keyboard traversal also exposes each localized tooltip.
          await page.mouse.move(0, 0); await page.locator('#name').focus();
          // Native details summaries are keyboard stops between name and checkboxes.
          for (let tab = 0; tab < 12 && !await label.locator('input').evaluate(el => el === document.activeElement); tab++) await page.keyboard.press('Tab');
          await expect(label.locator('input')).toBeFocused(); await expect(tip).toHaveCSS('visibility', 'visible');
          if (index === 2) await page.screenshot({ path: info.outputPath(`${theme}-${mode}-tooltip.png`), fullPage: true });
        }
        await page.locator('#cancelActivity').click();
      }
      await nav(page, 'settings');
      await page.screenshot({ path: info.outputPath(`${theme}-settings.png`), fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test('independent invalid values never silently default and boundaries stay session-only', async ({ page }) => {
  await seed(page); const raw = await page.evaluate(() => localStorage.getItem('whatToDoData'));
  await custom(page);
  for (const invalid of ['0', '-1', '1.5', '1441', 'abc', '1e2', 'Infinity']) {
    await page.locator('#customMinutes').fill(invalid); await page.locator('#timePicker .picker-done').click();
    await expect(page.locator('#timePicker')).toHaveAttribute('open', '');
    await expect(page.locator('#customMinutes')).toHaveValue(invalid);
    await expect(page.locator('#customMinutes')).toHaveAttribute('aria-invalid', 'true');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => localStorage.getItem('activeTimer'))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('whatToDoData'))).toBe(raw);
    await page.locator('#timePicker > summary').click();
  }
  for (const valid of ['1', '1440']) {
    await page.locator('#customMinutes').fill(valid); await page.locator('#timePicker .picker-done').click();
    await expect(page.locator('#timeSummary')).toHaveText(`${valid} 分钟`);
    expect(await page.evaluate(() => localStorage.getItem('whatToDoData'))).toBe(raw);
    await page.locator('#timePicker > summary').click();
  }
  await page.keyboard.press('Escape'); await page.reload(); await expect(page.locator('#timeSummary')).toHaveText('60 分钟');
});

for (const exit of ['done', 'escape', 'navigation']) test(`independent blank fallback storage failure ${exit}`, async ({ page }) => {
  await seed(page); const original = await page.evaluate(() => localStorage.getItem('whatToDoData'));
  await custom(page, '   ');
  await page.evaluate(() => {
    const originalSet = Storage.prototype.setItem;
    (window as any).restoreIndependentStorage = () => { Storage.prototype.setItem = originalSet; };
    Storage.prototype.setItem = function(key, value) { if (key === 'whatToDoData') throw new DOMException('Synthetic quota', 'QuotaExceededError'); originalSet.call(this, key, value); };
  });
  if (exit === 'done') await page.locator('#timePicker .picker-done').click();
  if (exit === 'escape') await page.keyboard.press('Escape');
  if (exit === 'navigation') { await nav(page, 'tasks'); await nav(page, 'home'); }
  await expect(page.locator('#storageWarning')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('whatToDoData'))).toBe(original);
  expect(await page.evaluate(() => localStorage.getItem('activeTimer'))).toBeNull();
  await page.evaluate(() => (window as any).restoreIndependentStorage());
  if (!await page.locator('#timePicker').evaluate(el => el.hasAttribute('open'))) await page.locator('#timePicker > summary').click();
  await page.locator('#timePicker .picker-done').click();
  await expect(page.locator('#timeSummary')).toHaveText('10 分钟');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).preferences.time)).toBe(10);
});

test('independent paused timer survives navigation and settings then next session uses fallback', async ({ page }) => {
  await seed(page); await page.locator('#start').click(); await page.locator('#pauseTimer').click();
  const timer = await page.evaluate(() => localStorage.getItem('activeTimer'));
  await nav(page, 'tasks'); await nav(page, 'home');
  // The active focus screen owns home; use the floating view on another page to access persisted state.
  await nav(page, 'settings'); await page.locator('#theme').click();
  expect(await page.evaluate(() => localStorage.getItem('activeTimer'))).toBe(timer);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).completed)).toEqual([]);
  await page.locator('#floatingTimer').click(); await page.locator('#earlyTimer').click();
  await custom(page); await page.keyboard.press('Escape'); await page.locator('#start').click();
  const next = await page.evaluate(() => JSON.parse(localStorage.getItem('activeTimer')!));
  expect(next.plannedDurationMs).toBe(600000); expect(next.completionId).not.toBe(JSON.parse(timer!).completionId);
});

for (const exit of ['done', 'close', 'escape', 'summary', 'outside', 'navigation']) {
  test(`independent genuinely empty prior-valid draft exits via ${exit}`, async ({ page }) => {
    await seed(page); await custom(page, '25'); await page.locator('#timePicker .picker-done').click();
    await custom(page, '');
    if (exit === 'done') await page.locator('#timePicker .picker-done').click();
    if (exit === 'close') await page.locator('#timePicker .picker-close').click();
    if (exit === 'escape') await page.keyboard.press('Escape');
    if (exit === 'summary') await page.locator('#timePicker > summary').press('Space');
    if (exit === 'outside') await page.locator('.brand').click();
    if (exit === 'navigation') { await nav(page, 'tasks'); await nav(page, 'home'); }
    await expect(page.locator('#timeSummary')).toHaveText('10 分钟');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!).preferences.time)).toBe(10);
    await page.reload(); await expect(page.locator('#timeSummary')).toHaveText('10 分钟');
  });
}

test('independent home hover actually darkens both themes and calendar action returns home', async ({ page }, info) => {
  await page.setViewportSize({ width: 1531, height: 715 }); await seed(page);
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') { await nav(page, 'settings'); await page.locator('#theme').click(); await nav(page, 'home'); }
    for (const selector of ['#timePicker > summary', '#conditionsPicker > summary']) {
      const control = page.locator(selector);
      const colors = () => control.evaluate(el => {
        const s = getComputedStyle(el), source = s.backgroundImage === 'none' ? s.backgroundColor : s.backgroundImage;
        return [...source.matchAll(/rgb\((\d+), (\d+), (\d+)\)/g)].map(m => .2126 * +m[1] + .7152 * +m[2] + .0722 * +m[3]);
      });
      await page.mouse.move(0, 0); const before = await colors(); await control.hover(); const after = await colors();
      expect(before.length).toBeGreaterThan(0); expect(after.length).toBe(before.length);
      after.forEach((level, i) => expect(level).toBeLessThan(before[i]));
    }
    await page.screenshot({ path: info.outputPath(`${theme}-home-hover.png`), fullPage: true });
    await nav(page, 'today'); await expect(page.locator('.calendar-start')).toHaveClass(/primary/);
    await page.screenshot({ path: info.outputPath(`${theme}-calendar-empty.png`), fullPage: true });
    await page.locator('.calendar-start').click(); await expect(page.locator('#recommendedTaskName')).toBeVisible();
  }
});

test('independent precise record presentation export and old-five to twenty import', async ({ page }) => {
  const value = fixture('zh-CN', 'light', 5), now = Date.now();
  value.completed = [{ recordId: 'precise', completionId: 'precise', taskId: 'independent', taskName: '精确合成记录', startedAt: now - 17001, endedAt: now, completedAt: new Date(now).toISOString(), actualDurationMs: 17001, plannedDuration: 10, pausedDurationMs: 1234, extensionDurationMs: 2345, unknownMs: 12345.6789 }];
  await seed(page, value); await expect(page.locator('#timeSummary')).toHaveText('5 分钟');
  const original = await page.evaluate(() => localStorage.getItem('whatToDoData'));
  await nav(page, 'today'); await page.locator('.calendar-group').click();
  await expect(page.locator('.record-toggle > span').first()).toHaveText(/^\d{2}:\d{2}–\d{2}:\d{2}$/);
  await expect(page.locator('.record-toggle > span').last()).toHaveText('17 秒');
  await page.locator('.record-toggle').click(); await expect(page.locator('.record-detail')).toContainText('暂停 1 秒');
  expect(await page.evaluate(() => localStorage.getItem('whatToDoData'))).toBe(original);
  await nav(page, 'settings');
  const downloadPromise = page.waitForEvent('download'); await page.locator('#export').click();
  const download = await downloadPromise; const stream = await download.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(value);
  const imported = { ...value, preferences: { ...value.preferences, time: 20 } };
  await page.locator('#file').setInputFiles({ name: 'independent-twenty.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
  await expect(page.locator('#confirmLayer')).toBeVisible(); await page.locator('#confirmAccept').click();
  await expect(page.locator('#timeSummary')).toHaveText('20 分钟');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('whatToDoData')!))).toEqual(imported);
});
