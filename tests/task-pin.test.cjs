const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');

test('pin survives backup validation, editing and reload without reordering source tasks', () => {
  const a = boot({ whatToDoData: JSON.stringify(fixture()) });
  const ids = a.json('d.tasks.map(t=>t.id)');
  assert.equal(a.run('toggleTaskPin(d.tasks[0].id)'), true);
  assert.equal(a.json('d.tasks[0].pinned'), true);
  assert.deepEqual(a.json('d.tasks.map(t=>t.id)'), ids);
  assert.equal(a.json('validateImport(JSON.parse(localStorage.getItem("whatToDoData"))).tasks[0].pinned'), true);
  a.run('saveActivity({...d.tasks[0],name:"Renamed",requirements:activityRequirements(d.tasks[0])})');
  const b = boot(Object.fromEntries(a.values));
  assert.equal(b.json('d.tasks[0].pinned'), true);
  assert.equal(b.run('toggleTaskPin(d.tasks[0].id)'), true);
  assert.equal(b.json('d.tasks[0].pinned'), false);
});

test('failed pin write keeps stored and in-memory pin state unchanged', () => {
  const a = boot({ whatToDoData: JSON.stringify(fixture()) });
  const before = a.values.get('whatToDoData');
  a.faults.write = true;
  assert.equal(a.run('toggleTaskPin(d.tasks[0].id)'), false);
  assert.equal(a.values.get('whatToDoData'), before);
  assert.equal(a.run('d.tasks[0].pinned'), undefined);
});
