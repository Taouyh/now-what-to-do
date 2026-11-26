import { mountRestrictionOptions } from './focus-conditions.js';

const fields = { computer: 'computer', audio: 'requiresAudio', speech: 'requiresSpeech', interrupted: 'requiresUninterrupted' };

export function mountTaskEditor(runtime) {
  const list = document.getElementById('taskList');
  list.classList.add('desktop-task-list');
  const modal = document.getElementById('modal');
  const editor = modal.querySelector('.activity-dialog');
  editor.classList.add('desktop-task-editor');
  const heading = editor.querySelector('#requirementsOptions > summary > span');
  heading.dataset.i18n = '专注条件';
  heading.textContent = runtime.tr('专注条件');

  const toolbar = editor.querySelector('.activity-requirements');
  const legacy = document.createElement('div');
  legacy.hidden = true;
  legacy.append(...toolbar.children);
  toolbar.append(legacy);
  toolbar.classList.add('desktop-task-conditions');

  const setSelected = mountRestrictionOptions(toolbar, {
    tr: runtime.tr,
    labels: { computer: '必须用电脑', audio: '必须听音频', speech: '需要出声', interrupted: '不便中断' },
    onChange: selected => {
      for (const [key, id] of Object.entries(fields)) document.getElementById(id).checked = selected.includes(key);
    },
  });
  new MutationObserver(() => {
    if (!modal.classList.contains('hide')) {
      setSelected(Object.keys(fields).filter(key => document.getElementById(fields[key]).checked));
    }
  }).observe(modal, { attributes: true, attributeFilter: ['class'] });
}
