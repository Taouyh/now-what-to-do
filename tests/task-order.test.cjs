const test = require('node:test');
const assert = require('node:assert/strict');
const { boot, fixture } = require('./helpers/app-harness.cjs');
function setup() {
  const data = fixture();
  data.tasks = Array.from({length: 5}, (_, i) => ({...data.tasks[0], id: `order-${i}`, name: `Task ${i}`, pinned: i < 2}));
  return boot({whatToDoData: JSON.stringify(data)});
}

test('manual ordering preserves source order, pins, backup, new tasks and refresh', () => {
  const a = setup(), source = a.json('d.tasks');
  assert.equal(a.run('moveTask("order-4","order-2")'), true);
  assert.deepEqual(a.json('orderedTasks().map(t=>t.id)'), ['order-0','order-1','order-4','order-2','order-3']);
  assert.deepEqual(a.json('d.tasks'), source);
  assert.equal(a.run('moveTask("order-1","order-0")'), true);
  assert.equal(a.run('moveTask("order-3","order-0")'), false);
  assert.equal(a.run('moveTask("missing","order-0")'), false);
  assert.equal(a.run('moveTask("order-0","order-0")'), false);
  const backup = a.json('validateImport(JSON.parse(localStorage.getItem("whatToDoData")))');
  const b = boot({whatToDoData: JSON.stringify(backup)});
  assert.deepEqual(b.json('orderedTasks().map(t=>t.id)'), ['order-1','order-0','order-4','order-2','order-3']);
  b.run('toggleTaskPin("order-4");toggleTaskPin("order-4")');
  assert.deepEqual(b.json('orderedTasks().map(t=>t.id)'), ['order-1','order-0','order-4','order-2','order-3']);
  b.run('saveActivity({name:"New activity"})');
  assert.equal(b.run('orderedTasks().at(-1).name'), 'New activity');
});

test('failed reorder is atomic and malformed backup order is rejected', () => {
  const a = setup(), before = a.values.get('whatToDoData');
  a.faults.write = true;
  assert.equal(a.run('moveTask("order-4","order-2")'), false);
  assert.equal(a.values.get('whatToDoData'), before);
  assert.deepEqual(a.json('orderedTasks().map(t=>t.id)'), ['order-0','order-1','order-2','order-3','order-4']);
  for (const value of [null, 'bad', [1], ['x','x'], ['']]) {
    assert.throws(() => a.run(`validateImport({...d,preferences:{...d.preferences,taskOrder:${JSON.stringify(value)}}})`));
  }
});
