export interface Requirements {
  computer: boolean;
  audio: boolean;
  speech: boolean;
  uninterrupted: boolean;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  nextStep?: string;
  requirements?: Partial<Requirements>;
  enabled?: boolean;
  pinned?: boolean;
  [key: string]: unknown;
}

export interface RecordEntry {
  recordId?: string;
  completionId?: string;
  taskId: string;
  taskName?: string;
  startedAt?: number;
  endedAt?: number;
  completedAt?: string;
  date?: string;
  actualDurationMs?: number;
  minutes?: number;
  plannedDuration?: number;
  pausedDurationMs?: number;
  extensionDurationMs?: number;
  [key: string]: unknown;
}

export interface RecordGroup {
  taskId: string;
  records: RecordEntry[];
  totalMs: number;
}

export type Translate = (key: string, values?: Record<string, unknown>) => string;
