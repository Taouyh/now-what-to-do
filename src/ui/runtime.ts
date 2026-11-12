import type { Task, RecordEntry, RecordGroup, Requirements, Translate } from '../domain/types';

export interface BookView {
  renderHome(): void;
  renderTasks(): void;
  renderToday(): void;
  savedTask(id: string, added: boolean): void;
  onPage(id: string): void;
  onTimer(): void;
  onEditor(): void;
  onEditorClose(): void;
}

export interface Runtime {
  readonly data: { tasks: Task[]; completed: RecordEntry[]; preferences: Record<string, unknown>; theme: string };
  readonly current: Task | null;
  readonly minutes: number | null;
  readonly language: string;
  readonly blocked: boolean;
  readonly conditions: Record<string, boolean>;
  readonly skipped: Set<string>;
  readonly feedback: { taskId: string; taskName: string; editing: boolean; draft: string } | null;
  readonly storageErrors: Map<string, string>;
  tr: Translate;
  page(id: string): void;
  random(options?: { keepCurrent?: boolean; avoidId?: string | null }): void;
  run(task: Task): void;
  startRecommendation(id: string): void;
  edit(task: Task): void;
  newTask(): void;
  closeActivity(): void;
  delTask(id: string): void;
  toggleTaskPin(id: string): boolean;
  orderedTasks(): Task[];
  moveTask(id: string, targetId: string, after?: boolean): boolean;
  saveActivity(draft: { id?: string; name: string; description: string; requirements: Requirements }): boolean;
  timerState(): { completionId: string; taskId: string; elapsed: number; durationMs: number; paused: boolean; finished: boolean; recoveryReason?: string } | null;
  discardTimer(): void;
  formatDuration(ms: number): string;
  formatClock(ms: number): string;
  recordDurationMs(record: RecordEntry): number;
  recordsForLocalDay(): RecordEntry[];
  todayRecordGroups(records: RecordEntry[]): RecordGroup[];
  recordCompactTimeRange(record: RecordEntry): string;
  activityRequirements(task: Task): Requirements;
  selectionReady(): boolean;
  settleEmptyCustomTime(): boolean;
  selectHomeCondition(key: string, value: boolean | string | number): void;
  syncHomeControls(): void;
  renderTimer(): void;
  tasks(): void;
  today(): void;
  notify(message: string): void;
  saveContinuation(value: string): boolean;
  closeContinuation(): void;
  connect(view: BookView): void;
}
