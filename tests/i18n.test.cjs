const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {boot,fixture}=require('./helpers/app-harness.cjs');

test('browser language negotiation supports regional tags, priority and English fallback',()=>{
  for(const [languages,expected] of [[['ja-JP'],'ja'],[['en-GB'],'en'],[['zh-TW'],'zh-CN'],[['fr-FR','ja'],'ja'],[['de-DE'],'en']]){
    const a=boot({}, {}, {languages});assert.equal(a.error,undefined);assert.equal(a.run('language'),expected);
    assert.equal(a.json('d.preferences.language'),expected);
  }
});
test('manual language choice persists without modifying user content or unknown fields',()=>{
  const data=fixture(),a=boot({whatToDoData:JSON.stringify(data)},{},{languages:['ja-JP']});
  assert.equal(a.error,undefined);assert.equal(a.run('language'),'ja');assert.equal(a.writes.length,0);
  const records=a.json('d.completed');
  a.run("setLanguage('en')");
  const saved=JSON.parse(a.values.get('whatToDoData'));
  assert.equal(saved.preferences.language,'en');assert.deepEqual(saved.tasks,data.tasks);assert.deepEqual(saved.completed,records);assert.deepEqual(saved.customData,data.customData);
  assert.equal(a.run("tr('设置')"),'Settings');
  const b=boot({whatToDoData:JSON.stringify(saved)},{},{languages:['zh-CN']});assert.equal(b.run('language'),'en');assert.equal(b.writes.length,0);
  b.run("setLanguage('zh-CN')");assert.equal(b.run("tr('设置')"),'设置');
});
test('failed language writes restore the previous language and leave timer and data intact',()=>{
  const a=boot({whatToDoData:JSON.stringify(fixture())});a.run('run(d.tasks[0]);pauseTimer()');
  const main=a.values.get('whatToDoData'),timer=a.values.get('activeTimer');
  a.faults.write=true;a.run("setLanguage('ja')");
  assert.equal(a.run('language'),'zh-CN');assert.equal(a.values.get('whatToDoData'),main);assert.equal(a.values.get('activeTimer'),timer);
  a.faults.write=false;a.run("setLanguage('ja')");assert.equal(a.run('language'),'ja');assert.equal(a.values.get('activeTimer'),timer);
});
test('language survives backup restoration and malformed preferences cannot replace data',()=>{
  const a=boot({whatToDoData:JSON.stringify(fixture())});const restored=fixture();restored.preferences.language='ja';a.import(restored);a.confirm();
  assert.equal(a.run('language'),'ja');assert.equal(a.json('d.preferences.language'),'ja');
  const raw=a.values.get('whatToDoData');restored.preferences.language='fr';a.import(restored);assert.equal(a.values.get('whatToDoData'),raw);
});
test('time, sentences and hostile interpolations are formatted without translating user strings',()=>{
  const a=boot({whatToDoData:JSON.stringify(fixture())});a.run("setLanguage('en')");
  assert.equal(a.run('formatDuration(65000)'),'1 min 5 sec');
  assert.equal(a.run("tr('做了 {count} 次，共 {duration}',{count:3,duration:formatDuration(180000)})"),'3 sessions · 3 min total');
  assert.equal(a.run("tr('开始：{name}',{name:'<img onerror=1> {n} 设置'})"),'Start: <img onerror=1> {n} 设置');
  a.run("setLanguage('ja')");assert.equal(a.run('formatDuration(65000)'),'1分5秒');
});
test('every explicit static and dynamic UI key has complete English and Japanese translations',()=>{
  const a=boot();const messages=a.json('MESSAGES');
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
  const keys=[...html.matchAll(/data-i18n(?:-(?:placeholder|aria-label|title))?="([^"]+)"/g)].map(m=>m[1]);
  keys.push(...[...app.matchAll(/tr\('([^']+)'/g)].map(m=>m[1]));
  for(const key of keys){assert.ok(messages[key]?.en,key+' en');assert.ok(messages[key]?.ja,key+' ja');}
  for(const [key,values] of Object.entries(messages))for(const locale of ['en','ja']){
    assert.deepEqual([...key.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),[...values[locale].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),key+' placeholders in '+locale);
  }
});
