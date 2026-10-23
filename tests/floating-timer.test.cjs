const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');
function start() {
  const data = fixture(); data.completed = [];
  const app = boot({ whatToDoData: JSON.stringify(data) }); assert.ifError(app.error);
  app.run('startTimer(d.tasks[0])'); return app;
}
const hidden = (app, id) => app.elements.get(id).classList.contains('hide');

test('view changes share one timer, do not persist presentation and never multiply intervals', () => {
  const app = start(), raw = app.values.get('activeTimer'), writes = app.writes.length;
  assert.equal(hidden(app, 'timer'), false); assert.equal(hidden(app, 'floatingTimer'), true);
  for (let i = 0; i < 8; i++) {
    app.run('page("today");page("tasks");renderTimer()');
    assert.equal(hidden(app, 'timer'), true); assert.equal(hidden(app, 'floatingTimer'), false);
    assert.equal(app.elements.get('timerClock').textContent, app.elements.get('floatingClock').textContent);
    app.run('showFullTimer();startTimer(d.tasks[0])');
    assert.equal(hidden(app, 'floatingTimer'), true); assert.equal(app.intervals.size, 1);
  }
  assert.equal(app.values.get('activeTimer'), raw); assert.equal(app.writes.length, writes);
});

test('countdown returns home for pause and resume while reload preserves the existing session', () => {
  const app = start(); app.run('page("tasks")'); app.elements.get('floatingTimer').click(); app.elements.get('pauseTimer').click();
  const paused = app.values.get('activeTimer');
  assert.equal(app.run('timerState().paused'), true); assert.equal(app.intervals.size, 0);
  app.run('page("tasks")');assert.equal(hidden(app,'floatingPaused'),false);
  app.elements.get('floatingTimer').click();assert.equal(app.run('location.hash.replace(/^#/,"")'),'home');
  app.run('page("today");showFullTimer();renderTimer()');
  assert.equal(app.values.get('activeTimer'), paused);
  assert.equal(app.elements.get('pauseTimer').textContent, '继续');
  const again = boot(Object.fromEntries(app.values)); assert.ifError(again.error);
  assert.equal(hidden(again, 'timer'), false); assert.equal(hidden(again, 'floatingTimer'), true);
  assert.equal(again.values.get('activeTimer'), paused); assert.equal(again.intervals.size, 0);
  again.run('page("tasks")'); again.elements.get('floatingTimer').click(); again.elements.get('pauseTimer').click();
  assert.equal(again.run('timerState().paused'), false); assert.equal(again.intervals.size, 1);
  again.run('page("tasks")');assert.equal(hidden(again,'floatingPaused'),true);
});

test('home returns to the same full timer while other routes float without changing timing state', () => {
  for (const paused of [false,true]) {
    const app=start();if(paused)app.run('pauseTimer()');
    const raw=app.values.get('activeTimer'),writes=app.writes.length,session=app.json('timerState()'),chosen=app.run('cur.id');
    for(const destination of ['tasks','today','settings']) {
      app.run('page('+JSON.stringify(destination)+')');
      assert.equal(hidden(app,'timer'),true);assert.equal(hidden(app,'floatingTimer'),false);
      app.run('page("home")');
      assert.equal(hidden(app,'timer'),false);assert.equal(hidden(app,'floatingTimer'),true);
      assert.equal(app.values.get('activeTimer'),raw);assert.deepEqual(app.json('timerState()'),session);
      assert.equal(app.run('cur.id'),chosen);assert.equal(app.run('d.completed.length'),0);
      assert.equal(app.intervals.size,paused?0:1);
    }
    assert.equal(app.writes.length,writes);
  }
});

test('ending a session restores the normal home recommendation without a floating or full timer', () => {
  const app=start();app.run('page("tasks");page("home");finishTimer();page("home")');
  assert.equal(app.values.has('activeTimer'),false);assert.equal(hidden(app,'timer'),true);assert.equal(hidden(app,'floatingTimer'),true);
  assert.equal(app.run('d.completed.length'),1);assert.equal(app.run('cur.id'),app.run('d.tasks[0].id'));
});

test('end cancellation leaves running and paused storage byte-for-byte intact', () => {
  for (const paused of [false, true]) {
    const app = start(); if (paused) app.run('pauseTimer()'); app.run('page("today")');
    const raw = app.values.get('activeTimer'), writes = app.writes.length;
    app.elements.get('floatingTimer').click(); app.elements.get('earlyTimer').click();
    assert.equal(hidden(app, 'confirmAbandon'), false);
    assert.equal(app.elements.get('confirmAccept').textContent, '结束');
    assert.equal(app.elements.get('confirmCancel').textContent, '取消');
    app.cancel(); assert.equal(app.values.get('activeTimer'), raw); assert.equal(app.writes.length, writes);
    assert.equal(app.json('d.completed').length, 0);
  }
});

test('completion after countdown return records one session with existing timing and goal fields', () => {
  const app = start(); app.run('page("tasks")'); const session = app.json('timerState()');
  app.elements.get('floatingTimer').click(); app.elements.get('earlyTimer').click(); const accept = app.elements.get('confirmAccept').onclick;
  accept(); accept();
  const records = app.json('d.completed'); assert.equal(records.length, 1);
  assert.equal(records[0].completionId, session.completionId);
  assert.equal(records[0].startedAt, session.startedAt); assert.ok(records[0].endedAt >= session.startedAt);
  assert.equal(records[0].goalId, session.goalId); assert.equal(records[0].goalName, session.goalName);
  assert.ok(Number.isFinite(records[0].actualDurationMs));
  assert.equal(app.json('d.tasks').length, 1); assert.equal(app.values.has('activeTimer'), false);
  assert.equal(hidden(app, 'timer'), true); assert.equal(hidden(app, 'floatingTimer'), true);
});

test('discard creates no records and a stale confirmation cannot finish a new session', () => {
  const app = start(); app.run('page("tasks")'); app.elements.get('floatingTimer').click(); app.elements.get('earlyTimer').click();
  const stale = app.elements.get('confirmAccept').onclick;
  app.elements.get('confirmAbandon').click(); assert.equal(app.values.has('activeTimer'), false);
  assert.equal(app.json('d.completed').length, 0); assert.equal(app.json('d.tasks').length, 1);
  app.run('startTimer(d.tasks[0])'); const raw = app.values.get('activeTimer'); stale();
  assert.equal(app.values.get('activeTimer'), raw); assert.equal(app.json('d.completed').length, 0);
});

test('failed persistence in the full timer keeps prior state and allows completion to be retried once', () => {
  const app = start(); app.run('page("tasks")'); const raw = app.values.get('activeTimer');
  app.faults.writeKey = 'activeTimer'; app.elements.get('floatingTimer').click(); app.elements.get('pauseTimer').click();
  assert.equal(app.values.get('activeTimer'), raw); delete app.faults.writeKey;
  app.elements.get('floatingTimer').click(); app.elements.get('earlyTimer').click(); app.faults.writeKey = 'whatToDoData'; app.confirm();
  assert.equal(app.json('d.completed').length, 0); assert.equal(app.values.get('activeTimer'), raw);
  assert.equal(hidden(app, 'confirmLayer'), false); delete app.faults.writeKey;
  app.confirm(); app.confirm(); assert.equal(app.json('d.completed').length, 1);
  const other = start(); other.run('page("tasks")'); other.elements.get('floatingTimer').click(); other.elements.get('earlyTimer').click();
  const before = other.values.get('activeTimer'); other.faults.removeKey = 'activeTimer';
  other.elements.get('confirmAbandon').click(); assert.equal(other.values.get('activeTimer'), before);
  assert.equal(other.json('d.completed').length, 0); assert.equal(hidden(other, 'confirmLayer'), false);
});

test('floating redraws do not repeat automatic extensions or create records', () => {
  const app = start(); app.run('page("tasks");let x=timerState();x.lastStarted=Date.now()-x.durationMs-1000;setTimerState(x);advanceTimerIfNeeded(timerState())');
  const raw = app.values.get('activeTimer');
  for (let i = 0; i < 8; i++) app.run('renderTimer();showFullTimer();page("today");advanceTimerIfNeeded(timerState())');
  assert.equal(app.values.get('activeTimer'), raw); assert.equal(app.json('d.completed').length, 0);
  assert.equal(app.elements.get('timerClock').textContent, app.elements.get('floatingClock').textContent);
  assert.equal(app.intervals.size, 1);
});
