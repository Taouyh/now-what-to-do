import conditions from './icons.json';

const namespace = 'http://www.w3.org/2000/svg';
const dismissDelay = 300;
const restrictionSlash = 'M2.6 17.4 17.4 2.6';
let toolbarCount = 0;

function makeConditionIcon(condition, selected) {
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(namespace, 'path');
  const slash = selected && condition.id !== 'interrupted' ? ` ${restrictionSlash}` : '';
  path.setAttribute('d', (selected ? condition.restricted : condition.base) + slash);
  svg.append(path);
  return svg;
}

export function mountRestrictionOptions(toolbar, { initial = [], onChange, tr, labels = {} } = {}) {
  let selected = new Set(initial);
  toolbar.classList.add('focus-restrictions');
  toolbar.setAttribute('role', 'group');
  toolbar.dataset.i18nAriaLabel = '专注条件';
  toolbar.setAttribute('aria-label', tr('专注条件'));
  const renderOptions = conditions.map(condition => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'focus-restriction';
    const label = labels[condition.id] ?? condition.label;
    button.dataset.i18nAriaLabel = label;
    button.setAttribute('aria-label', tr(label));
    const tooltip = document.createElement('span');
    tooltip.className = 'focus-restriction-tip';
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.dataset.i18n = label;
    tooltip.textContent = tr(label);
    button.append(makeConditionIcon(condition, false), makeConditionIcon(condition, true), tooltip);
    function render() { button.setAttribute('aria-pressed', String(selected.has(condition.id))); }
    button.addEventListener('click', () => {
      if (selected.has(condition.id)) selected.delete(condition.id);
      else selected.add(condition.id);
      render();
      onChange([...selected]);
    });
    render();
    toolbar.append(button);
    return render;
  });
  return values => {
    selected = new Set(values);
    renderOptions.forEach(render => render());
  };
}

export function mountFocusConditions(root, options) {
  const trigger = document.createElement('button');
  trigger.id = 'focusConditionsTrigger';
  trigger.type = 'button';
  trigger.className = 'inline-control-pill focus-conditions-trigger';
  trigger.dataset.i18n = '专注条件';
  trigger.textContent = options.tr('专注条件');
  const prompt = document.createElement('span');
  prompt.className = 'inline-control-tip focus-conditions-trigger-tip';
  prompt.id = `focus-restrictions-prompt-${toolbarCount + 1}`;
  prompt.dataset.i18n = '请选择专注条件';
  prompt.textContent = options.tr('请选择专注条件');
  trigger.setAttribute('aria-describedby', prompt.id);
  const toolbar = document.createElement('div');
  toolbar.id = `focus-restrictions-${++toolbarCount}`;
  const setSelected = mountRestrictionOptions(toolbar, options);
  trigger.setAttribute('aria-controls', toolbar.id);
  let pointerInside = false;
  let timer;

  function positionTips() {
    const viewportRight = document.documentElement.clientWidth;
    const surfaceRight = root.closest('#book')?.getBoundingClientRect().right ?? viewportRight;
    const right = Math.min(surfaceRight, viewportRight) - 12;
    for (const button of toolbar.children) {
      const tip = button.querySelector('.focus-restriction-tip');
      const available = right - button.getBoundingClientRect().left - tip.offsetWidth;
      tip.style.left = `${Math.min(button.clientWidth - 4, available)}px`;
    }
  }

  function setOpen(open) {
    clearTimeout(timer);
    toolbar.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) positionTips();
  }

  function scheduleClose() {
    clearTimeout(timer);
    if (toolbar.hidden || pointerInside || toolbar.querySelector(':focus-visible')) return;
    timer = setTimeout(() => setOpen(false), dismissDelay);
  }

  trigger.addEventListener('click', () => setOpen(toolbar.hidden));
  root.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    pointerInside = true;
    clearTimeout(timer);
  });
  root.addEventListener('pointerleave', event => {
    if (event.pointerType === 'touch') return;
    pointerInside = false;
    scheduleClose();
  });
  root.addEventListener('focusin', () => clearTimeout(timer));
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) scheduleClose();
  });
  document.addEventListener('pointerdown', event => {
    if (!root.contains(event.target)) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (!toolbar.hidden) positionTips();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || toolbar.hidden) return;
    const restore = toolbar.contains(document.activeElement);
    setOpen(false);
    if (restore) trigger.focus({ preventScroll: true });
  });
  root.append(trigger, prompt, toolbar);
  setOpen(false);
  return setSelected;
}
