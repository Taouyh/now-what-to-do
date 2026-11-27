import { mountFocusConditions } from './focus-conditions.js';
import { mountTaskEditor } from './task-editor.js';
import { mountContinuation } from './continuation.js';
import './controls.css';

const conditionKeys = ['computer', 'audio', 'speech', 'interrupted'];

function keepControlBounds(id) {
  const original = document.getElementById(id);
  const frame = document.createElement('div');
  frame.className = 'inline-control-frame';
  original.before(frame);
  frame.append(original);
  original.open = false;
  original.querySelector('summary').inert = true;
  original.setAttribute('aria-hidden', 'true');
  return frame;
}

function mountTime(runtime) {
  const frame = keepControlBounds('timePicker');
  const pill = document.createElement('label');
  pill.className = 'inline-control-pill inline-control-time';
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  input.dataset.i18nAriaLabel = '自定义可用时间（分钟）';
  input.setAttribute('aria-label', runtime.tr(input.dataset.i18nAriaLabel));
  input.value = String(runtime.minutes ?? 15);
  const display = document.createElement('span');
  display.className = 'inline-control-time-display';
  const number = document.createElement('span');
  number.className = 'inline-control-time-number';
  const measure = document.createElement('span');
  measure.className = 'inline-control-time-measure';
  measure.setAttribute('aria-hidden', 'true');
  measure.textContent = '00';
  function sizeEntry() {
    const count = Math.min(input.value.length, 3);
    number.style.setProperty('--time-entry-width', `${Math.max(count, 2)}ch`);
    number.style.setProperty('--time-digits-width', `${count}ch`);
  }
  const unit = document.createElement('span');
  unit.dataset.i18n = '分钟';
  unit.textContent = runtime.tr('分钟');
  unit.setAttribute('aria-hidden', 'true');
  number.append(measure, input);
  display.append(number, unit);
  pill.append(display);
  sizeEntry();
  const range = () => runtime.tr('{n} 分钟', { n: '5–180' });
  const tip = document.createElement('span');
  tip.id = 'inline-control-time-tip';
  tip.className = 'inline-control-tip inline-control-time-tip';
  tip.textContent = range();
  tip.setAttribute('role', 'status');
  input.setAttribute('aria-describedby', tip.id);
  frame.append(pill, tip);
  let update;
  const validMinutes = () => /^\d{1,3}$/.test(input.value) && Number(input.value) >= 5 && Number(input.value) <= 180;

  function updateSelection() {
    const allSelected = pill.hasAttribute('data-editing') && document.activeElement === input &&
      !!input.value && input.selectionStart === 0 && input.selectionEnd === input.value.length;
    number.toggleAttribute('data-selected', allSelected);
  }

  function apply() {
    clearTimeout(update);
    const valid = validMinutes();
    tip.textContent = valid ? range() : runtime.tr('请输入 5–180 的整数');
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid) {
      input.value = '';
      sizeEntry();
      updateSelection();
      return false;
    }
    delete pill.dataset.editing;
    updateSelection();
    if (runtime.minutes !== Number(input.value)) {
      runtime.setAvailableMinutes(Number(input.value));
    }
    return true;
  }

  function beginEditing() {
    pill.dataset.editing = '';
    input.select();
    updateSelection();
  }

  input.addEventListener('focus', beginEditing);
  pill.addEventListener('pointerenter', () => { delete pill.dataset.typing; });
  pill.addEventListener('pointerdown', event => {
    if (event.button !== 0 || (event.target === input && input === document.activeElement && pill.hasAttribute('data-editing'))) return;
    event.preventDefault();
    input.focus({ preventScroll: true });
    beginEditing();
  });
  function updateDraft() {
    sizeEntry();
    clearTimeout(update);
    pill.dataset.editing = '';
    pill.dataset.typing = '';
    updateSelection();
    tip.textContent = range();
    input.setAttribute('aria-invalid', 'false');
    if (!input.value) return;
    if (!/^\d{1,3}$/.test(input.value) || Number(input.value) > 180) apply();
    else update = setTimeout(apply, validMinutes() ? 400 : 650);
  }

  input.addEventListener('input', event => {
    if (!event.isComposing) updateDraft();
    else {
      pill.dataset.typing = '';
      clearTimeout(update);
    }
  });
  input.addEventListener('compositionend', updateDraft);
  input.addEventListener('select', updateSelection);
  input.addEventListener('selectionchange', updateSelection);
  input.addEventListener('blur', updateSelection);
  document.getElementById('home').addEventListener('click', event => {
    if (!event.target.closest('#start')) return;
    if (!apply()) {
      event.stopPropagation();
      input.focus({ preventScroll: true });
    }
  }, { capture: true });
  new MutationObserver(() => {
    // Refreshing conditions must not replace minutes that are still being typed or debounced.
    if (!pill.hasAttribute('data-editing') && input !== document.activeElement && runtime.minutes != null) {
      input.value = String(runtime.minutes);
      sizeEntry();
    }
    tip.textContent = input.getAttribute('aria-invalid') === 'true' ? runtime.tr('请输入 5–180 的整数') : range();
  }).observe(document.getElementById('timeSummary'), { childList: true });

}

export function mountWebControls(runtime, pages) {
  mountTime(runtime);
  document.querySelector('#random > img')?.remove();
  document.querySelector('.bookmarks').classList.add('text-bookmarks');
  mountTaskEditor(runtime);
  pages.renderDesktopNote = mountContinuation(runtime, runtime.saveTaskNote);
  const isRestricted = key => key === 'interrupted' ? runtime.conditions[key] : !runtime.conditions[key];
  const refresh = mountFocusConditions(keepControlBounds('conditionsPicker'), {
    tr: runtime.tr,
    initial: conditionKeys.filter(isRestricted),
    onChange: selected => {
      const key = conditionKeys.find(key => selected.includes(key) !== isRestricted(key));
      if (key) runtime.selectHomeCondition(key, key === 'interrupted' ? selected.includes(key) : !selected.includes(key));
      refresh(conditionKeys.filter(isRestricted));
    },
  });
  new MutationObserver(() => refresh(conditionKeys.filter(isRestricted)))
    .observe(document.getElementById('conditionsSummary'), { childList: true });
}
