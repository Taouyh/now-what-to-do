const test=require('node:test'),assert=require('node:assert/strict');
const {boot,fixture}=require('./helpers/app-harness.cjs');
test('native backup export receives exact text and bypasses browser Blob downloads',async()=>{
  const a=boot({whatToDoData:JSON.stringify(fixture())});assert.ifError(a.error);
  a.run("window.__native=[];window.nativeApp={exportText:(content,name)=>{__native.push({content,name});return Promise.resolve(true)}};downloadText('中文 日本語 <text>','what-to-do-backup.json')");
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(a.json('__native'),[{content:'中文 日本語 <text>',name:'what-to-do-backup.json'}]);assert.equal(a.downloads.length,0);
});
test('native export cancellation is silent and failure reports a localized error without touching data',async()=>{
  const a=boot({whatToDoData:JSON.stringify(fixture())});const before=a.values.get('whatToDoData');
  a.run("setLanguage('en');window.nativeApp={exportText:()=>Promise.resolve(false)};downloadText('{}','what-to-do-backup.json')");
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(a.elements.get('appNotice').textContent,'Language updated.');
  const saved=a.values.get('whatToDoData');
  a.run("window.nativeApp.exportText=()=>Promise.reject(Error('disk'));downloadText('{}','what-to-do-backup.json')");
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(a.elements.get('appNotice').textContent,"Export failed. Check your browser's download permissions and try again.");assert.equal(a.values.get('whatToDoData'),saved);assert.notEqual(before,saved);
});
