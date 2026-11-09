import type { Task } from '../domain/types';
import type { BookPages } from './pages';
import { button, byId, element } from './dom';

type Drag = {
  id: string; pointer: number; x: number; y: number; originalPage: number;
  active: boolean; target?: string; after: boolean; wrongGroup: boolean;
  preview?: HTMLElement; pager?: string; timer?: ReturnType<typeof setTimeout>;
};

export class TaskReorder {
  private drag?: Drag;
  private readonly pages: BookPages;
  constructor(pages: BookPages) {
    this.pages = pages;
    document.addEventListener('pointermove', event => this.move(event));
    document.addEventListener('pointerup', event => this.finish(event));
    document.addEventListener('pointercancel', () => this.cancel());
    document.addEventListener('lostpointercapture', event => { if (event.pointerId === this.drag?.pointer) this.cancel(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.drag) { event.preventDefault(); this.cancel(); }
    });
    window.addEventListener('blur', () => this.cancel());
    window.addEventListener('resize', () => this.cancel());
  }

  handle(task: Task) {
    const { app } = this.pages;
    const handle = button('', () => {}, 'task-drag-handle');
    handle.innerHTML = '<svg viewBox="0 0 16 24" aria-hidden="true"><path d="M5 6h1m4 0h1M5 12h1m4 0h1M5 18h1m4 0h1"/></svg>';
    handle.title = app.tr('拖拽排序，或用 ↑ ↓ 调整');
    handle.setAttribute('aria-label', `${app.tr('排序：{name}', { name: task.name })} · ${handle.title}`);
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary || app.blocked) return;
      this.cancel();
      event.preventDefault(); handle.focus({ preventScroll: true });
      this.drag = { id: task.id, pointer: event.pointerId, x: event.clientX, y: event.clientY, originalPage: this.pages.taskPage, active: false, after: false, wrongGroup: false };
      // Capture on the stable list container so hovering a pager can replace rows.
      byId('taskList').setPointerCapture(event.pointerId);
    });
    handle.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key) || this.drag) return;
      event.preventDefault();
      const group = this.pages.orderedTasks.filter(item => (item.pinned === true) === (task.pinned === true));
      const forward = event.key === 'ArrowDown';
      const target = group[group.findIndex(item => item.id === task.id) + (forward ? 1 : -1)];
      if (target && app.moveTask(task.id, target.id, forward)) this.reveal(task.id);
    });
    return handle;
  }

  markSource() {
    if (!this.drag?.active) return;
    document.querySelector<HTMLElement>(`[data-task-id="${CSS.escape(this.drag.id)}"]`)?.classList.add('task-dragging');
  }

  private clearMarkers() {
    document.querySelectorAll('.task-drop-before,.task-drop-after,.task-page-drop').forEach(node => node.classList.remove('task-drop-before', 'task-drop-after', 'task-page-drop'));
  }

  private move(event: PointerEvent) {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointer) return;
    if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
    if (!drag.active) {
      drag.active = true;
      drag.preview = element('div', 'task-drag-preview', this.pages.orderedTasks.find(task => task.id === drag.id)?.name || '');
      drag.preview.setAttribute('aria-hidden', 'true'); document.body.append(drag.preview);
      document.body.classList.add('task-reordering'); this.markSource();
    }
    drag.preview!.style.left = `${Math.max(8, Math.min(event.clientX + 14, innerWidth - 248))}px`;
    drag.preview!.style.top = `${Math.max(8, Math.min(event.clientY + 14, innerHeight - 60))}px`;
    this.clearMarkers(); drag.target = undefined; drag.wrongGroup = false;
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const row = hit?.closest<HTMLElement>('#taskList [data-task-id]');
    const source = this.pages.orderedTasks.find(task => task.id === drag.id);
    const target = this.pages.orderedTasks.find(task => task.id === row?.dataset.taskId);
    if (source && target && source.id !== target.id && row) {
      if ((source.pinned === true) === (target.pinned === true)) {
        drag.target = target.id;
        const rect = row.getBoundingClientRect(); drag.after = event.clientY >= rect.y + rect.height / 2;
        row.classList.add(drag.after ? 'task-drop-after' : 'task-drop-before');
      } else drag.wrongGroup = true;
    }
    drag.preview!.classList.toggle('invalid-drop', drag.wrongGroup);
    const pager = hit?.closest<HTMLButtonElement>('#tasks-previous,#tasks-next');
    const pagerId = pager && !pager.disabled ? pager.id : undefined;
    if (pagerId !== drag.pager) {
      clearTimeout(drag.timer); drag.pager = pagerId;
      if (pagerId) drag.timer = setTimeout(() => {
        if (this.drag !== drag) return;
        this.pages.taskPage += pagerId === 'tasks-next' ? 1 : -1;
        this.pages.renderTasks(); drag.target = undefined;
      }, 650);
    }
    if (pagerId) pager!.classList.add('task-page-drop');
  }

  private finish(event: PointerEvent) {
    if (!this.drag || event.pointerId !== this.drag.pointer) return;
    this.move(event);
    const drag = this.drag;
    this.cleanup();
    if (drag.active && drag.target && this.pages.app.moveTask(drag.id, drag.target, drag.after)) {
      this.reveal(drag.id);
    } else {
      if (drag.wrongGroup) this.pages.app.notify(this.pages.app.tr('请在同一置顶分组内排序。'));
      this.pages.taskPage = drag.originalPage; this.pages.renderTasks(); this.focus(drag.id);
    }
  }

  private reveal(id: string) {
    this.pages.taskAnchorId = id;
    this.pages.taskPage = Math.floor(this.pages.orderedTasks.findIndex(task => task.id === id) / this.pages.taskPageSize);
    this.pages.renderTasks(); this.focus(id);
    this.pages.app.notify(this.pages.app.tr('任务顺序已保存。'));
  }

  private focus(id: string) {
    document.querySelector<HTMLButtonElement>(`[data-task-id="${CSS.escape(id)}"] .task-drag-handle`)?.focus({ preventScroll: true });
  }

  private cleanup() {
    const drag = this.drag; this.drag = undefined;
    if (!drag) return;
    clearTimeout(drag.timer); drag.preview?.remove(); this.clearMarkers();
    document.querySelectorAll('.task-dragging').forEach(node => node.classList.remove('task-dragging'));
    document.body.classList.remove('task-reordering');
    const list = byId('taskList');
    if (list.hasPointerCapture(drag.pointer)) list.releasePointerCapture(drag.pointer);
  }

  cancel() {
    const drag = this.drag;
    if (!drag) return;
    this.cleanup(); this.pages.taskPage = drag.originalPage;
    this.pages.renderTasks(); this.focus(drag.id);
  }
}
