import type { Runtime } from './runtime';
import type { Task } from '../domain/types';
import { paginate } from '../domain/pagination';
import { element, button, image, byId } from './dom';

export class BookPages {
  taskPage = 0;
  taskFocusAfterSave: string | null = null;
  directoryPage = 0;
  recordPage = 0;
  selectedTask: string | null = null;
  expandedRecord: string | null = null;
  recordTimeout: ReturnType<typeof setTimeout> | undefined;
  readonly app: Runtime;

  constructor(app: Runtime) { this.app = app; }

  pager(page: number, total: number, change: (page: number) => void, id: string) {
    const { tr } = this.app;
    const navigation = element('nav', 'book-pager');
    navigation.setAttribute('aria-label', tr('翻页'));
    const previous = button(tr('上一页'), () => change(page - 1), 'paper-button');
    previous.id = `${id}-previous`;
    previous.disabled = page === 0;
    const next = button(tr('下一页'), () => change(page + 1), 'paper-button');
    next.id = `${id}-next`;
    next.disabled = !total || page + 1 >= total;
    navigation.append(previous, element('span', 'page-count', total ? `${page + 1} / ${total}` : '—'), next);
    return navigation;
  }

  renderHome() {
    const app = this.app;
    const { tr, current } = app;
    const entries = byId('homeEntries');
    entries.append(byId('random'));
    if (current && app.selectionReady()) {
      const content = byId('rec');
      const name = element('h2', 'user-text', current.name);
      name.id = 'recommendedTaskName';
      const start = button('', () => {
        app.startRecommendation(current.id);
      }, 'primary book-start');
      start.id = 'start';
      start.append(image('play.svg'), element('span', '', tr('开始')));
      content.replaceChildren(name, start);
      // Existing user-provided next steps remain readable after the layout change.
      if (current.nextStep) content.append(element('p', 'recommendation-step user-text', current.nextStep));
    }
    byId('browse').textContent = tr('自己选');
    const feedback = byId('completionFeedback');
    feedback.replaceChildren();
    const completed = app.feedback;
    if (!completed) return;
    const title = element('div', 'feedback-heading');
    title.append(element('span', '', tr('本次已记录')));
    const close = button('×', () => app.closeContinuation(), 'icon-button');
    close.setAttribute('aria-label', tr('关闭'));
    title.append(close);
    feedback.append(title);
    if (!completed.editing) {
      const next = button('', () => {
        const task = app.data.tasks.find(item => item.id === completed.taskId);
        if (!task) { app.closeContinuation(); return; }
        completed.editing = true;
        completed.draft = task.description || '';
        this.renderHome();
        byId('continuationInput').focus();
      }, 'paper-button continuation-trigger');
      next.setAttribute('aria-label', tr('为「{name}」记录下次起点', { name: completed.taskName }));
      const target = element('span', 'continuation-target user-text', completed.taskName);
      target.title = completed.taskName;
      next.append(element('span', 'continuation-verb', tr('记下次起点')), element('span', 'continuation-separator', '·'), target);
      next.disabled = !app.data.tasks.some(item => item.id === completed.taskId);
      feedback.append(next);
      return;
    }
    const form = element('form', 'continuation-form');
    const input = element('textarea');
    input.id = 'continuationInput';
    const label = element('label', 'continuation-label user-text', tr('{name}：下次从哪继续？', { name: completed.taskName }));
    label.htmlFor = input.id;
    input.value = completed.draft;
    input.rows = 2;
    input.addEventListener('input', () => { completed.draft = input.value; });
    const clear = button('×', () => { input.value = ''; completed.draft = ''; input.focus(); }, 'clear-description');
    clear.setAttribute('aria-label', tr('清空说明'));
    const field = element('div', 'continuation-input');
    field.append(input, clear);
    const controls = element('div', 'feedback-actions');
    const save = button(tr('保存'), () => {}, 'paper-button');
    save.type = 'submit';
    controls.append(save, button(tr('取消'), () => app.closeContinuation(), 'paper-button'));
    form.append(label, field, controls);
    form.addEventListener('submit', event => { event.preventDefault(); app.saveContinuation(input.value); });
    feedback.append(form);
  }

  taskRow(task: Task, index: number) {
    const { app } = this;
    const row = element('div', 'task-strip');
    row.dataset.taskId = task.id;
    const edit = button('', () => app.edit(task), 'task-edit');
    edit.setAttribute('aria-label', app.tr('编辑：{name}', { name: task.name }));
    edit.append(element('span', 'task-number', String(index + 1).padStart(2, '0')), element('span', 'task-title user-text', task.name));
    const start = button('', () => app.run(task), 'task-play icon-button');
    start.title = app.tr('开始');
    start.setAttribute('aria-label', app.tr('开始'));
    start.append(image('task-play.svg'));
    row.append(edit, start);
    return row;
  }

  renderTasks() {
    const { app } = this;
    const focusedTask = this.taskFocusAfterSave || document.activeElement?.closest<HTMLElement>('[data-task-id]')?.dataset.taskId;
    this.taskFocusAfterSave = null;
    const tasks = app.data.tasks.filter(task => task.enabled !== false);
    const group = paginate(tasks, this.taskPage, 10);
    this.taskPage = group.page;
    const left = element('div', 'book-column book-left');
    const right = element('div', 'book-column book-right');
    left.append(element('h1', '', app.tr('任务')), element('p', 'book-caption', app.tr('共 {count} 项 · {time}', { count: tasks.length, time: app.minutes ? app.formatDuration(app.minutes * 60000) : '—' })));
    const heading = element('div', 'column-heading');
    heading.append(element('h2', '', app.tr('任务 · 续页')), button(app.tr('＋ 添加任务'), () => app.newTask(), 'primary small-action'));
    right.append(heading, element('p', 'book-caption', app.tr('点击任务编辑，点击 ▶ 开始')));
    const first = element('div', 'task-strips');
    const second = element('div', 'task-strips');
    group.items.forEach((task, index) => (index < 5 ? first : second).append(this.taskRow(task, group.start + index)));
    if (!tasks.length) first.append(element('p', 'empty-copy', app.tr('暂无活动')), button(app.tr('添加活动'), () => app.newTask(), 'paper-button'));
    left.append(first);
    right.append(second);
    const footer = this.pager(group.page, group.total, page => {
      this.taskPage = page;
      this.renderTasks();
      this.focusPager('tasks', page > group.page);
    }, 'tasks');
    footer.classList.add('spread-pager');
    byId('taskList').replaceChildren(left, right, footer);
    if (focusedTask) {
      const row = document.querySelector<HTMLElement>(`[data-task-id="${CSS.escape(focusedTask)}"] .task-edit`);
      (row || document.querySelector<HTMLElement>('.task-edit,.small-action'))?.focus({preventScroll: true});
    }
  }

  focusPager(id: string, forward: boolean) {
    const wanted = byId<HTMLButtonElement>(`${id}-${forward ? 'next' : 'previous'}`);
    const other = byId<HTMLButtonElement>(`${id}-${forward ? 'previous' : 'next'}`);
    (wanted.disabled ? other : wanted).focus();
  }

  clearRecordSelection() {
    clearTimeout(this.recordTimeout);
    this.expandedRecord = null;
  }

  renderToday() {
    const { app } = this;
    const { tr } = app;
    const records = app.recordsForLocalDay();
    const groups = app.todayRecordGroups(records);
    const directory = paginate(groups, this.directoryPage, 5);
    this.directoryPage = directory.page;
    if (!directory.items.some(group => group.taskId === this.selectedTask)) this.selectedTask = null;
    const selected = groups.find(group => group.taskId === this.selectedTask);
    const left = element('div', 'book-column book-left calendar-column');
    const right = element('div', 'book-column book-right calendar-column');
    const date = new Intl.DateTimeFormat(app.language, { month: 'long', day: 'numeric' }).format(new Date());
    left.append(element('h1', '', `${tr('今天')} · ${date}`), element('p', 'book-caption', tr('做了 {count} 次，共 {duration}', { count: records.length, duration: app.formatDuration(groups.reduce((sum, group) => sum + group.totalMs, 0)) })));
    const list = element('div', 'calendar-directory');
    for (const group of directory.items) {
      const name = group.records[0].taskName || app.data.tasks.find(task => task.id === group.taskId)?.name || tr('已删除任务');
      const row = button('', () => {
        this.selectedTask = group.taskId;
        this.recordPage = 0;
        this.clearRecordSelection();
        this.renderToday();
        document.querySelector<HTMLButtonElement>(`[data-group-id="${CSS.escape(group.taskId)}"]`)?.focus();
      }, 'calendar-group');
      row.dataset.groupId = group.taskId;
      row.setAttribute('aria-pressed', String(group.taskId === this.selectedTask));
      row.append(element('span', 'user-text', name), element('small', '', tr('{count} 次 · {duration}', { count: group.records.length, duration: app.formatDuration(group.totalMs) })));
      list.append(row);
    }
    if (!groups.length) list.append(element('p', 'empty-copy', tr('今天还没开始。')), button(tr('去开始'), () => app.page('home'), 'primary calendar-start'));
    left.append(list, this.pager(directory.page, directory.total, page => {
      this.directoryPage = page;
      this.selectedTask = null;
      this.clearRecordSelection();
      this.renderToday();
      this.focusPager('directory', page > directory.page);
    }, 'directory'));
    if (!selected) {
      right.append(element('h2', '', tr('记录明细')), element('p', 'book-caption', tr('点击左页任务，翻阅每次记录。')));
    } else {
      const name = selected.records[0].taskName || tr('已删除任务');
      const heading = element('h2', 'user-text', name);
      heading.tabIndex = 0;
      right.append(heading, element('p', 'book-caption', tr('{count} 次 · {duration}', { count: selected.records.length, duration: app.formatDuration(selected.totalMs) })));
      const page = paginate(selected.records, this.recordPage, 4);
      this.recordPage = page.page;
      const rows = element('div', 'calendar-records');
      page.items.forEach((record, index) => {
        const id = record.recordId || record.completionId || `${record.taskId}-${page.start + index}`;
        const row = element('div', 'record-row');
        const toggle = button('', () => {
          const wasOpen = this.expandedRecord === id;
          this.clearRecordSelection();
          this.expandedRecord = wasOpen ? null : id;
          this.renderToday();
          document.getElementById(`record-${id}`)?.focus();
          if (!wasOpen) this.recordTimeout = setTimeout(() => {
            const focusedId = document.activeElement?.id;
            this.expandedRecord = null;
            this.renderToday();
            if (focusedId) document.getElementById(focusedId)?.focus({preventScroll: true});
          }, 10000);
        }, 'record-toggle');
        toggle.id = `record-${id}`;
        toggle.setAttribute('aria-expanded', String(this.expandedRecord === id));
        toggle.append(element('span', '', app.recordCompactTimeRange(record)), element('span', '', app.formatDuration(app.recordDurationMs(record))));
        row.append(toggle);
        if (this.expandedRecord === id) {
          row.append(element('p', 'record-detail', tr('计划 {plan} · 暂停 {pause} · 追加 {extension}', {
            plan: typeof record.plannedDuration === 'number' ? app.formatDuration(record.plannedDuration * 60000) : tr('未知'),
            pause: typeof record.pausedDurationMs === 'number' ? app.formatDuration(record.pausedDurationMs) : tr('未知'),
            extension: typeof record.extensionDurationMs === 'number' ? app.formatDuration(record.extensionDurationMs) : tr('未知'),
          })));
        }
        rows.append(row);
      });
      right.append(rows, this.pager(page.page, page.total, next => {
        this.recordPage = next;
        this.clearRecordSelection();
        this.renderToday();
        this.focusPager('records', next > page.page);
      }, 'records'));
    }
    byId('todayBox').replaceChildren(left, right);
  }
}
