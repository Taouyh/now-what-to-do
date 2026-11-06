import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// The existing runtime remains the single owner of persistence and timer state.
// Both the VM regression suite and the production bundle execute these sources.
const runtimeExports = `
window.nativeTimerLifecycle = nativeTimerLifecycle;
export const runtime = {
  get data() { return d }, get current() { return cur },
  get language() { return language }, get minutes() { return time },
  get conditions() { return conditions }, get blocked() { return storageBlocked },
  get skipped() { return recommendationSkipped }, get feedback() { return completionFeedback },
  get storageErrors() { return storageFailures },
  tr, page, random, run, startRecommendation, edit, newTask, closeActivity, delTask, saveActivity,
  timerState, finishTimer, discardTimer, pauseTimer, resumeTimer, extendTimer,
  formatDuration, formatClock, recordDurationMs, recordsForLocalDay, todayRecordGroups,
  recordCompactTimeRange, plannedDurationMs, activityRequirements, selectionReady, settleEmptyCustomTime,
  selectHomeCondition, syncHomeControls, renderTimer, tasks, today, save,
  notify, saveContinuation, closeContinuation,
  connect(view) { bookView = view; random({keepCurrent:true}); tasks(); today(); renderTimer(); },
};`;

export default defineConfig({
  base: './',
  server: { host: '127.0.0.1', port: 8765, strictPort: true },
  plugins: [{
    name: 'now-what-runtime',
    resolveId(id) { if (id === 'virtual:runtime') return '\0now-what-runtime'; },
    load(id) {
      if (id !== '\0now-what-runtime') return;
      return 'window.bookMode = true;\n' + readFileSync('i18n.js', 'utf8') + '\n' +
        readFileSync('app.js', 'utf8') + '\n' + runtimeExports;
    },
    handleHotUpdate(context) {
      if (/[\\/](app|i18n)\.js$/.test(context.file)) {
        const module = context.server.moduleGraph.getModuleById('\0now-what-runtime');
        if (module) context.server.moduleGraph.invalidateModule(module);
        context.server.ws.send({ type: 'full-reload' });
      }
    },
  }],
  build: {
    outDir: 'dist/web', target: 'es2020', sourcemap: true,
    lib: { entry: 'src/main.ts', name: 'NowWhat', formats: ['iife'], fileName: () => 'app.js', cssFileName: 'style' },
  },
});
