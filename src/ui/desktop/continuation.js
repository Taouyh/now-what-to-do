const copy = {
  'zh-CN': { example: '例如：第 5 章', hint: '点击外部或按 Enter 保存并收起', separator: '：' },
  en: { example: 'For example, chapter 5', hint: 'Click outside or press Enter to save and close', separator: ': ' },
  ja: { example: '例：第5章', hint: '外側をクリックするか Enter キーで保存して閉じる', separator: '：' },
};

const promptDurationMs = 6000;

export function mountContinuation(runtime, saveNote) {
  const home = document.getElementById('home');
  const timer = document.getElementById('timer');
  const feedback = document.getElementById('completionFeedback');

  let recommendationId;
  let completedId;
  let lastCompletion;
  let rendered;
  let dismissed = false;
  let promptTimeout;
  let draft;
  let resizeObserver;

  function renderSummary(refocus = false) {
    const currentId = runtime.current?.id;
    const recommendationChanged = currentId !== recommendationId;
    const completion = runtime.feedback;
    const newCompletion = completion && completion !== lastCompletion;
    const active = home.classList.contains('active') && !runtime.timerState();
    if (draft && (!active || recommendationChanged || newCompletion)) saveDraft();

    recommendationId = currentId;
    lastCompletion = completion;
    if (!active || recommendationChanged) {
      completedId = undefined;
      dismissed = false;
    }
    if (active && newCompletion) {
      completedId = completion.taskId;
      dismissed = false;
    }
    if (draft) {
      feedback.hidden = !active;
      return;
    }

    const task = runtime.data.tasks.find(item => item.id === (completedId ?? currentId));
    const show = active && !dismissed && task && (completedId || task.description?.trim());
    const key = show ? JSON.stringify([completedId, task.id, task.name, task.description, runtime.language]) : '';
    if (key === rendered && !refocus && !newCompletion) return;
    clearTimeout(promptTimeout);
    rendered = key;
    feedback.hidden = !show;
    if (!show) {
      feedback.replaceChildren();
      return;
    }

    const language = copy[runtime.language] ?? copy['zh-CN'];
    const slip = document.createElement('div');
    slip.className = 'desktop-note-slip';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'paper-slip continuation-trigger';
    button.setAttribute('aria-describedby', 'desktopContinuationHint');
    const summary = document.createElement('span');
    summary.className = 'desktop-note-summary user-text';
    summary.textContent = task.name + language.separator + (task.description?.trim() || runtime.tr('记下次起点'));
    button.append(summary);
    button.addEventListener('click', () => edit(task));
    const hint = document.createElement('span');
    hint.id = 'desktopContinuationHint';
    hint.className = 'inline-control-tip desktop-note-hint';
    hint.textContent = language.hint;
    hint.setAttribute('role', 'tooltip');
    slip.append(button, hint);
    feedback.replaceChildren(slip);
    if (completedId) {
      function scheduleDismissal() {
        clearTimeout(promptTimeout);
        if (slip.matches(':hover, :focus-within')) return;
        promptTimeout = setTimeout(() => {
          completedId = undefined;
          dismissed = true;
          renderSummary();
        }, promptDurationMs);
      }
      slip.addEventListener('pointerenter', () => clearTimeout(promptTimeout));
      slip.addEventListener('pointerleave', scheduleDismissal);
      button.addEventListener('focus', () => clearTimeout(promptTimeout));
      button.addEventListener('blur', scheduleDismissal);
      scheduleDismissal();
    }
    if (refocus) button.focus({ preventScroll: true });
  }

  function releaseDraft() {
    resizeObserver?.disconnect();
    draft = undefined;
    rendered = undefined;
  }

  function saveDraft() {
    if (!saveNote(draft.taskId, draft.input.value)) return false;
    completedId = undefined;
    dismissed = true;
    releaseDraft();
    return true;
  }

  function commit() {
    if (!draft) return true;
    if (!saveDraft()) return false;
    renderSummary();
    return true;
  }

  function edit(task) {
    clearTimeout(promptTimeout);
    const language = copy[runtime.language] ?? copy['zh-CN'];
    const form = document.createElement('form');
    form.className = 'desktop-note-editor';
    const label = document.createElement('label');
    label.className = 'continuation-label user-text';
    label.htmlFor = 'continuationInput';
    label.textContent = runtime.tr('{name}：下次从哪继续？', { name: task.name });
    const field = document.createElement('div');
    field.className = 'continuation-input paper-slip';
    const input = document.createElement('textarea');
    input.id = 'continuationInput';
    input.rows = 1;
    input.value = task.description || '';
    input.placeholder = language.example;
    field.append(input);
    form.append(label, field);
    form.addEventListener('submit', event => {
      event.preventDefault();
      commit();
    });
    input.addEventListener('keydown', event => {
      if (event.isComposing) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        releaseDraft();
        renderSummary(true);
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        commit();
      }
    });

    draft = { taskId: task.id, input, form };
    feedback.replaceChildren(form);
    function grow() {
      input.style.height = 'auto';
      const contentHeight = input.scrollHeight;
      const stripHeight = parseFloat(getComputedStyle(input).minHeight);
      if (contentHeight > Math.ceil(stripHeight)) input.style.height = `${contentHeight}px`;
    }
    grow();
    input.addEventListener('input', grow);
    let previousWidth = input.clientWidth;
    resizeObserver = new ResizeObserver(() => {
      if (input.clientWidth === previousWidth) return;
      previousWidth = input.clientWidth;
      grow();
    });
    resizeObserver.observe(input);
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }

  renderSummary();
  const observer = new MutationObserver(() => renderSummary());
  observer.observe(home, { attributes: true, attributeFilter: ['class'] });
  observer.observe(timer, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', event => {
    if (!draft || runtime.timerState() || !draft.form.closest('#home.active') || draft.form.contains(event.target)) return;
    if (!commit() && event.target.closest('#start, #random, #browse, [data-page]')) {
      event.preventDefault();
      event.stopPropagation();
      draft.input.focus({ preventScroll: true });
    }
  }, { capture: true });
  return renderSummary;
}
