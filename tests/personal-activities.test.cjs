const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');
const start = data => {
  const app = boot(data === undefined ? {} : { whatToDoData: JSON.stringify(data) });
  assert.ifError(app.error); app.chooseConditions(); return app;
};

test('missing storage initializes empty arrays; repeated boots do not seed or rewrite', () => {
  const app = start();
  assert.deepEqual(app.json('[d.tasks,d.goals,d.completed]'), [[], [], []]);
  assert.equal(app.run('firstUse'), true);
  assert.ok(app.elements.get('addFirstTask'));
  const raw = app.values.get('whatToDoData'), again = boot(Object.fromEntries(app.values));
  assert.ifError(again.error); assert.equal(again.run('firstUse'), false);
  assert.equal(again.values.get('whatToDoData'), raw); assert.equal(again.writes.length, 0);
});

test('empty legacy libraries stay empty with absent, false or true old seeding flags', () => {
  for (const version of [undefined, 1, 2]) for (const flag of [undefined, false, true]) {
    const data = fixture(); data.version = version; data.tasks = [];
    if (flag === undefined) delete data.defaultTasksSeeded; else data.defaultTasksSeeded = flag;
    const app = start(data), raw = app.values.get('whatToDoData');
    assert.deepEqual(app.json('d.tasks'), []); assert.deepEqual(app.json('d.goals'), data.goals);
    assert.deepEqual(app.json('d.completed[0].note'), data.completed[0].note);
    assert.equal(app.writes.length, 0);
    assert.equal(app.run('JSON.stringify(migrateData(d))===JSON.stringify(d)'), true);
    app.import(data); app.confirm(); assert.deepEqual(app.json('d.tasks'), []);
    const reloaded = boot(Object.fromEntries(app.values)); assert.ifError(reloaded.error);
    assert.deepEqual(reloaded.json('d.tasks'), []); assert.equal(reloaded.writes.length, 0);
    assert.equal(typeof raw, 'string');
  }
});

test('existing examples, user tasks, optional categories and historical goals survive without startup writes', () => {
  const data = fixture(); delete data.defaultTasksSeeded;
  data.tasks[0].name = 'MySQL课程'; data.tasks[0].category = { id: 'old-category' };
  data.tasks.push({ ...data.tasks[0], id: 'default-reading-books', name: '读推荐书籍', goalId: 'missing' });
  const app = start(data);
  assert.deepEqual(app.json('d.tasks'), data.tasks); assert.deepEqual(app.json('d.goals'), data.goals);
  assert.equal(app.writes.length, 0);
  app.run('edit(d.tasks[1])'); app.elements.get('name').value = '编辑后的个人活动';
  app.elements.get('form').dispatch('submit');
  assert.equal(app.json('d.tasks[1].goalId'), 'missing');
  assert.deepEqual(app.json('d.tasks[1].category'), data.tasks[1].category);
  assert.deepEqual(app.json('d.goals'), data.goals);
});

test('tasks without goals or with orphaned goals are eligible; goal objects never become tasks', () => {
  const data = fixture(); delete data.goals; data.tasks[0].goalId = 'orphan';
  const app = start(data);
  assert.equal(app.run('ok(d.tasks[0])'), true); assert.equal(app.run('cur.id'), data.tasks[0].id);
  assert.deepEqual(app.json('d.goals'), []); assert.equal(app.writes.length, 0);
  app.run('newTask()'); app.elements.get('name').value = '不需要目标';
  app.elements.get('form').dispatch('submit');
  assert.equal(app.json('d.tasks').length, 2); assert.equal(app.run('d.tasks[1].goalId'), undefined);
  const onlyGoals = fixture(); onlyGoals.tasks = [];
  const empty = start(onlyGoals); assert.equal(empty.run('cur'), null);
  assert.deepEqual(empty.json('d.tasks'), []);
});

test('deleting the last task retains history, settings and goals and clears its recommendation', async () => {
  const data = fixture(), app = start(data), previous = app.elements.get('start');
  app.run('delTask(d.tasks[0].id)'); app.cancel(); assert.equal(app.json('d.tasks').length, 1);
  app.run('delTask(d.tasks[0].id)'); app.confirm(); previous.click();
  assert.equal(app.run('cur'), null); assert.equal(app.values.has('activeTimer'), false);
  assert.deepEqual(app.json('d.tasks'), []); assert.deepEqual(app.json('d.goals'), data.goals);
  assert.deepEqual(app.json('d.preferences'), data.preferences);
  assert.equal(app.json('d.completed').length, data.completed.length);
  const again = boot(Object.fromEntries(app.values)); assert.ifError(again.error);
  assert.deepEqual(again.json('d.tasks'), []);
  again.elements.get('export').click();
  const backup = JSON.parse(await again.downloads.at(-1).blob.text());
  assert.deepEqual(backup.goals, data.goals); assert.equal(backup.completed[0].startedAt, undefined);
});

test('goal-free completion records one session, keeps its task and exports a usable backup', async () => {
  const data = fixture(); data.goals = []; data.completed = []; delete data.tasks[0].goalId;
  const app = start(data); app.elements.get('start').click(); app.run('pauseTimer();resumeTimer();finishTimer();finishTimer()');
  assert.equal(app.json('d.completed').length, 1); assert.deepEqual(app.json('d.tasks'), data.tasks);
  app.run('page("home")'); assert.equal(app.run('cur.id'), data.tasks[0].id);
  app.elements.get('export').click(); const backup = JSON.parse(await app.downloads.at(-1).blob.text());
  assert.equal(backup.completed[0].goalName, '');
  const reloaded = start(backup); assert.deepEqual(reloaded.json('d.tasks'), data.tasks);
  assert.equal(reloaded.json('d.completed').length, 1);
});
