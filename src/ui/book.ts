import { BookPages } from './pages';
import type { Runtime } from './runtime';
import { byId, element, image, button } from './dom';

function translated(tag: 'h1' | 'h2' | 'p' | 'span', text: string, className = '') {
  const node = element(tag, className, text);
  node.dataset.i18n = text;
  return node;
}

export function mountBook(app: Runtime) {
  document.body.classList.add('book-app');
  const pages = new BookPages(app);
  const compactViewport = matchMedia('(max-width:800px), (max-height:550px)');
  const mobileDevice = !/Windows/i.test(navigator.userAgent) && (/Android/i.test(navigator.userAgent) || matchMedia('(pointer:coarse)').matches);
  document.body.classList.toggle('mobile-book', mobileDevice && compactViewport.matches);
  compactViewport.addEventListener('change', () => {
    document.body.classList.toggle('mobile-book', mobileDevice && compactViewport.matches);
    pages.reflowTasks();
  });
  const book = element('div', 'book');
  book.id = 'book';
  const decoration = element('div', 'book-decoration');
  decoration.setAttribute('aria-hidden', 'true');
  decoration.append(element('div', 'book-cover'), element('div', 'cover-rule'));
  for (let layer = 8; layer >= 1; layer--) {
    const left = image(`edge-left-${layer % 2 ? 1 : 2}.svg`, 'book-layer');
    const right = image(`edge-right-${layer % 2 ? 1 : 2}.svg`, 'book-layer');
    left.style.left = `${(44 - layer * 0.4) / 14.4}%`;
    right.style.left = `${(720 + layer * 0.4) / 14.4}%`;
    for (const node of [left, right]) node.style.top = `${(25 + layer * 2.4) / 7.86}%`;
    decoration.append(left, right);
  }
  for (const side of ['left', 'right']) {
    decoration.append(image(`paper-${side}.webp`, `book-paper ${side}`), image(`spine-${side}.svg`, `book-paper spine ${side}`));
    for (const position of ['top', 'bottom']) decoration.append(image(`corner-${side}.svg`, `book-corner ${side} ${position}`));
  }
  decoration.append(element('div', 'book-spine'));
  const leftNumber = element('span', 'folio left', '1');
  const rightNumber = element('span', 'folio right', '2');
  decoration.append(leftNumber, rightNumber);
  book.append(decoration);

  const header = document.querySelector('header')!;
  const navigation = document.querySelector('header nav')!;
  navigation.append(byId('dataMenuToggle'));
  navigation.className = 'bookmarks';
  const routes = ['home', 'tasks', 'today', 'settings'];
  const labels = ['现在做', '任务', '日历', '设置'];
  const icons = ['home', 'tasks', 'calendar', 'settings'];
  navigation.querySelectorAll<HTMLButtonElement>('button').forEach((node, index) => {
    node.replaceChildren(image(`nav-${icons[index]}.svg`), translated('span', labels[index]));
    node.dataset.page = routes[index];
    node.dataset.i18nAriaLabel = labels[index];
    node.setAttribute('aria-label', app.tr(labels[index]));
  });
  book.append(navigation);
  document.body.insertBefore(book, document.querySelector('main'));
  book.append(document.querySelector('main')!, byId('timer'), byId('modal'), byId('confirmLayer'));
  header.classList.add('book-header');

  const chapter = element('div', 'book-column book-left chapter');
  const plant = element('div', 'chapter-plant');
  plant.setAttribute('aria-hidden', 'true');
  const stem = image('plant-4.svg');
  stem.style.cssText = 'position:absolute;left:18.16%;top:13.2%;width:61.77%;height:77.4%';
  plant.append(stem);
  // Original vector parts, positioned from Figma node 49:276. No page screenshot.
  const leaves = [[5,23.9,59.63,-16],[6,26.08,50.37,-32],[7,17.7,38.89,-28],[8,38.73,59.27,8],[9,49,44.95,12],[10,59.52,31.43,20],[10,66.45,20,20],[11,71.95,13.88,16],[6,48.77,39.66,-32],[12,40.12,23.86,-24],[13,70.65,39.68,32],[14,77.86,29.02,24]];
  for (const [part,x,y,rotation] of leaves) {
    const leaf = image(`plant-${part}.svg`);
    leaf.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:8.89%;height:18.46%;transform:translate(-50%,-50%) rotate(${rotation}deg)`;
    plant.append(leaf);
  }
  const flower = image('plant-15.svg');
  flower.style.cssText = 'position:absolute;left:29.85%;top:40.87%;width:27.94%;height:28.26%';
  plant.append(flower);
  chapter.append(translated('p', '今日篇章', 'chapter-title'), element('p', 'chapter-number', '01'), plant, translated('p', '从这一页开始。', 'chapter-motto'));
  byId('home').prepend(chapter);
  byId('homeWorkspace').classList.add('book-column', 'book-right');
  byId('onboarding').classList.add('book-column', 'book-right');
  byId('quickName').removeAttribute('maxlength');
  for (const id of ['quickName', 'name']) {
    const input = byId(id);
    const strip = element('div', 'paper-slip paper-input');
    input.before(strip);
    strip.append(input);
  }
  byId('addFirstTask').dataset.i18n = '添加活动';
  const entries = document.querySelector<HTMLElement>('.home-entries')!;
  entries.id = 'homeEntries';
  const change = byId('random');
  change.replaceChildren(image('refresh.svg'), translated('span', '换一件'));
  byId('home').append(byId('browse'));
  const feedback = element('div', 'completion-feedback');
  feedback.id = 'completionFeedback';
  byId('homeWorkspace').append(feedback);

  // Existing IDs keep timer/recovery lifecycle behavior shared with the runtime.
  const focusLeft = element('div', 'book-column book-left focus-left');
  focusLeft.append(translated('p', '今日篇章', 'book-caption'), byId('timerName'), byId('timerDescription'), byId('timerStatus'));
  const focusRight = element('div', 'book-column book-right focus-right');
  focusRight.append(translated('p', '剩余时间', 'book-caption'), byId('timerClock'), document.querySelector('.timer-track')!, byId('timerMeta'), byId('timerActions'), byId('timerWaitingNote'));
  byId('timerStandard').replaceChildren(focusLeft, focusRight);
  const recoveryLeft = element('div', 'book-column book-left focus-left');
  recoveryLeft.append(translated('p', '今日篇章', 'book-caption'), byId('timerRecoveryName'), byId('timerRecoveryRange'), byId('timerRecoveryStatus'));
  const recoveryRight = element('div', 'book-column book-right focus-right recovery-right');
  const discard = byId('discardRecoveryTimer');
  discard.dataset.i18n = '放弃本次';
  recoveryRight.append(byId('timerRecoveryLabel'), byId('timerRecoverySpent'), byId('timerRecoveryNote'), byId('timerRecoveryLegacy'), document.querySelector('.recovery-actions')!, discard);
  byId('timerRecovery').replaceChildren(recoveryLeft, recoveryRight);

  const settingsLeft = element('div', 'book-column book-left settings-column');
  const settingsRight = element('div', 'book-column book-right settings-column');
  settingsLeft.append(byId('settingsTitle'));
  settingsRight.append(translated('h2', '备份与恢复'));
  const settingsRows = [...document.querySelectorAll('#dataPanel .settings-row')];
  settingsRows.forEach((row, index) => (index < 2 ? settingsLeft : settingsRight).append(row));
  settingsLeft.append(document.querySelector('.settings-note')!);
  byId('dataPanel').replaceChildren(settingsLeft, settingsRight);
  byId('settings').append(byId('dataPanel'));

  const form = byId<HTMLFormElement>('form');
  form.noValidate = true;
  const error = element('p', 'field-error');
  error.id = 'activityError';
  error.setAttribute('role', 'alert');
  byId('name').closest('.paper-input')!.after(error);
  byId('name').setAttribute('aria-describedby', error.id);
  const cancel = button(app.tr('取消'), () => app.closeActivity(), 'primary');
  cancel.dataset.i18n = '取消';
  cancel.id = 'cancelActivity';
  const remove = button(app.tr('删除'), () => app.delTask(byId<HTMLInputElement>('tid').value), 'primary');
  remove.dataset.i18n = '删除';
  remove.id = 'deleteActivity';
  document.querySelector('.activity-dialog-footer')!.append(cancel, remove);
  const clear = button('×', () => { byId<HTMLTextAreaElement>('desc').value = ''; byId('desc').focus(); }, 'clear-description');
  clear.setAttribute('aria-label', app.tr('清空说明'));
  clear.dataset.i18nAriaLabel = '清空说明';
  document.querySelector('.description-field')!.append(clear);

  for (const [index, id] of ['computer', 'requiresAudio', 'requiresSpeech', 'requiresUninterrupted'].entries()) {
    const label = byId(id).closest('label')!;
    label.prepend(image(`scroll-icon-${index + 1}.svg`));
    const key = ['必须用电脑', '必须听音频', '需要出声', '不便中断'][index];
    const tip = translated('span', key, 'requirement-tooltip');
    tip.setAttribute('role', 'tooltip');
    // The original label already supplies the accessible checkbox name.
    tip.setAttribute('aria-hidden', 'true');
    label.append(tip);
  }
  for (const id of ['timePicker', 'conditionsPicker']) {
    const details = byId<HTMLDetailsElement>(id);
    const panel = details.querySelector<HTMLElement>('.condition-panel')!;
    const close = button('×', () => { if (id === 'timePicker') app.settleEmptyCustomTime(); details.open = false; details.querySelector('summary')!.focus(); }, 'picker-close icon-button');
    close.dataset.i18nAriaLabel = '关闭';
    close.setAttribute('aria-label', app.tr('关闭'));
    const done = button(app.tr('确定'), () => {
      if (id === 'timePicker' && !app.settleEmptyCustomTime()) { byId('customMinutes').focus(); return; }
      details.open = false;
      details.querySelector('summary')!.focus();
    }, 'primary picker-done');
    done.dataset.i18n = '确定';
    panel.prepend(close);
    if (id === 'conditionsPicker') panel.append(done);
    details.addEventListener('toggle', () => {
      if (details.open) {
        const other = byId<HTMLDetailsElement>(id === 'timePicker' ? 'conditionsPicker' : 'timePicker');
        other.open = false;
        panel.querySelector<HTMLElement>('input,button')?.focus();
      } else if (id === 'timePicker') app.settleEmptyCustomTime();
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const panel = document.querySelector<HTMLElement>('.condition-picker[open] .condition-panel');
    if (!panel) return;
    const items = [...panel.querySelectorAll<HTMLElement>('button,input')].filter(item => item.getClientRects().length && !(item as HTMLButtonElement).disabled);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  let previousPage = location.hash.slice(1) || 'home';
  app.connect({
    renderHome: () => pages.renderHome(),
    renderTasks: () => pages.renderTasks(),
    renderToday: () => pages.renderToday(),
    savedTask(id) {
      pages.taskFocusAfterSave = id;
      pages.taskAnchorId = id;
      pages.taskPage = Math.floor(pages.orderedTasks.findIndex(item => item.id === id) / pages.taskPageSize);
    },
    onPage(id) {
      pages.reorder.cancel();
      pages.clearRecordSelection();
      if (id === 'tasks' && previousPage !== 'tasks') { pages.taskPage = 0; pages.renderTasks(); }
      if (id !== 'today') pages.selectedTask = null;
      previousPage = id;
      book.dataset.page = id;
      book.classList.toggle('has-focus', !byId('timer').classList.contains('hide'));
    },
    onTimer() {
      book.classList.toggle('has-focus', !byId('timer').classList.contains('hide'));
    },
    onEditor() {
      byId<HTMLDetailsElement>('requirementsOptions').open = true;
      byId<HTMLDetailsElement>('activityOptions').open = true;
      byId('activityError').textContent = '';
      byId('name').setAttribute('aria-invalid', 'false');
      remove.hidden = !byId<HTMLInputElement>('tid').value;
    },
  });
  app.page(previousPage);
  if (app.blocked) { book.inert = true; byId('retryDataLoad').focus(); }
  // Newly mounted labels participate in the same language dictionary.
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(node => { node.textContent = app.tr(node.dataset.i18n!); });
  let today = new Date().toDateString();
  setInterval(() => {
    const next = new Date().toDateString();
    if (next !== today) { today = next; pages.selectedTask = null; pages.renderToday(); }
  }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pages.renderToday(); });
  return pages;
}
