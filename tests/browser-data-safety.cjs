// Optional real-Chrome check. Uses a new temporary profile and a separate
// incognito browser context per case. Never opens an existing browser profile.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { fixture } = require('./helpers/app-harness.cjs');

async function main() {
  const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chrome)) throw Error('Chrome not found. Set CHROME_PATH to its executable.');
  const root = path.resolve(__dirname, '..');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'now-what-to-do-test-'));
  const server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'app.js', 'style.css'].includes(name)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript;charset=utf-8' : name.endsWith('.css') ? 'text/css;charset=utf-8' : 'text/html;charset=utf-8');
    res.end(fs.readFileSync(path.join(root, name), 'utf8'));
  });
  let browser, socket, exited;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
      '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
      '--disable-sync', '--disable-extensions', 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    exited = once(browser, 'exit');
    const endpoint = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('Chrome startup timed out')), 15000);
      let stderr = '';
      browser.once('error', error => { clearTimeout(timeout); reject(error); });
      browser.once('exit', code => { clearTimeout(timeout); reject(Error('Chrome exited before debugging was ready: ' + code)); });
      browser.stderr.on('data', data => {
        stderr += data;
        const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
    });
    socket = new WebSocket(endpoint); await once(socket, 'open');
    let serial = 0;
    const pending = new Map(), events = new Map(), errors = new Map();
    socket.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.id) {
        const callback = pending.get(msg.id); if (!callback) return;
        pending.delete(msg.id); clearTimeout(callback.timeout);
        msg.error ? callback.reject(Error(msg.error.message)) : callback.resolve(msg.result);
      } else {
        if (msg.method === 'Runtime.exceptionThrown') {
          const list = errors.get(msg.sessionId) || [];
          list.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text); errors.set(msg.sessionId, list);
        }
        const key = msg.sessionId + ':' + msg.method;
        if (events.has(key)) { events.get(key)(msg.params); events.delete(key); }
      }
    });
    function send(method, params = {}, sessionId) {
      return new Promise((resolve, reject) => {
        const id = ++serial;
        const timeout = setTimeout(() => { pending.delete(id); reject(Error(method + ' timed out')); }, 10000);
        pending.set(id, { resolve, reject, timeout }); socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
    }
    function event(method, sessionId) {
      return new Promise((resolve, reject) => {
        const key = sessionId + ':' + method;
        const timeout = setTimeout(() => { events.delete(key); reject(Error(method + ' timed out')); }, 10000);
        events.set(key, value => { clearTimeout(timeout); resolve(value); });
      });
    }
    async function scenario(name, initial, faults, check) {
      const { browserContextId } = await send('Target.createBrowserContext');
      try {
        const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
        const evaluate = async code => {
          const result = await send('Runtime.evaluate', { expression: '(async()=>{' + code + '})()', awaitPromise: true, returnByValue: true }, sessionId);
          if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
          return result.result.value;
        };
        await send('Runtime.enable', {}, sessionId); await send('Page.enable', {}, sessionId);
        await send('Page.addScriptToEvaluateOnNewDocument', { source: `
          const rawStorage=window.localStorage;
          window.__rawGet=key=>Storage.prototype.getItem.call(rawStorage,key);
          for(const [key,value] of Object.entries(${JSON.stringify(initial)}))rawStorage.setItem(key,value);
          const get=Storage.prototype.getItem,set=Storage.prototype.setItem,remove=Storage.prototype.removeItem;
          window.__rawGet=key=>get.call(rawStorage,key);window.__faults=${JSON.stringify(faults)};window.__writes=[];
          Storage.prototype.getItem=function(key){if(__faults.read)throw new DOMException('test read failure','SecurityError');return get.call(this,key)};
          Storage.prototype.setItem=function(key,value){if(__faults.write||__faults.writeKey===key)throw new DOMException('test write failure','QuotaExceededError');__writes.push(key);return set.call(this,key,value)};
          Storage.prototype.removeItem=function(key){if(__faults.remove)throw new DOMException('test removal failure','SecurityError');return remove.call(this,key)};
          window.__downloads=[];const urls=new Map(),create=URL.createObjectURL.bind(URL);
          URL.createObjectURL=blob=>{let url=create(blob);urls.set(url,blob);return url};
          HTMLAnchorElement.prototype.click=function(){__downloads.push({name:this.download,blob:urls.get(this.href)})};
        ` }, sessionId);
        const loaded = event('Page.loadEventFired', sessionId);
        await send('Page.navigate', { url: 'http://127.0.0.1:' + server.address().port + '/' }, sessionId);
        await loaded;
        const importData = async data => {
          await evaluate(`const dt=new DataTransfer();dt.items.add(new File([${JSON.stringify(typeof data === 'string' ? data : JSON.stringify(data))}],'backup.json',{type:'application/json'}));$('file').files=dt.files;$('file').dispatchEvent(new Event('change',{bubbles:true}));`);
          for (let i = 0; i < 100; i++) {
            if (await evaluate("return pendingImport!==null||!!$('appNotice')")) return;
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          throw Error('Import reader timed out');
        };
        await check(evaluate, importData);
        assert.deepEqual(errors.get(sessionId) || [], [], name + ': browser exceptions');
        console.log('PASS ' + name);
      } finally { await send('Target.disposeBrowserContext', { browserContextId }); }
    }
    // Additional browser suites share the same isolated profile/context runner.
    if (process.argv[2]) {
      await require(path.resolve(process.argv[2]))(scenario, fixture);
      await send('Browser.close');
      return;
    }
    const initial = { whatToDoData: JSON.stringify(fixture()) };
    await scenario('first use', {}, {}, async run => {
      assert.equal(await run("return JSON.parse(__rawGet('whatToDoData')).tasks.length"), 3);
    });
    await scenario('normal data stays unchanged on load', initial, {}, async run => {
      assert.equal(await run("return __rawGet('whatToDoData')"), initial.whatToDoData);
      assert.equal(await run('return __writes.length'), 0);
    });
    await scenario('damaged data and raw export', { whatToDoData: '{broken' }, {}, async run => {
      assert.equal(await run("return __rawGet('whatToDoData')"), '{broken');
      assert.equal(await run("return !!$('dataRecovery')&&document.querySelector('main').inert"), true);
      assert.equal(await run("$('exportRawData').click();return await __downloads.at(-1).blob.text()"), '{broken');
    });
    await scenario('storage unavailable', initial, { read: true }, async run => {
      assert.equal(await run("return !!$('dataRecovery')&&__writes.length===0"), true);
      assert.equal(await run("return __rawGet('whatToDoData')"), initial.whatToDoData);
    });
    await scenario('first write failure', {}, { write: true }, async run => {
      assert.equal(await run("return __rawGet('whatToDoData')===null&&!!$('storageWarning')"), true);
    });
    const legacy = fixture(); delete legacy.version; delete legacy.preferences; delete legacy.completed[0].completedAt;
    await scenario('legacy records retain missing times', { whatToDoData: JSON.stringify(legacy) }, {}, async run => {
      assert.deepEqual(await run('return d.completed[0]'), { ...legacy.completed[0], recordId: 'legacy-record-1', completionId: 'legacy-record-1' });
      assert.equal(await run('return __writes.length'), 0);
    });
    await scenario('valid import synchronizes actual DOM', initial, {}, async (run, importData) => {
      const data = fixture(); data.preferences = { time: 30, env: 'quiet', computerReady: true }; data.theme = 'dark';
      await importData(data);
      assert.equal(await run("return __rawGet('whatToDoData')"), initial.whatToDoData);
      assert.deepEqual(await run("$('confirmAccept').click();return [time,env,computerReady,document.documentElement.dataset.theme,$('computerReady').checked,document.querySelector('#times .on').dataset.v,document.querySelector('#envs .on').dataset.v]"), [30, 'quiet', true, 'dark', true, '30', 'quiet']);
    });
    await scenario('invalid import rejected', initial, {}, async (run, importData) => {
      await importData({ ...fixture(), theme: 'invalid' });
      assert.equal(await run("return $('confirmLayer').classList.contains('hide')&&pendingImport===null"), true);
      assert.equal(await run("return __rawGet('whatToDoData')"), initial.whatToDoData);
    });
    await scenario('cancelled import', initial, {}, async (run, importData) => {
      await importData(fixture());
      assert.equal(await run("$('confirmCancel').click();return pendingImport===null&&$('confirmLayer').classList.contains('hide')"), true);
      assert.equal(await run("return __rawGet('whatToDoData')"), initial.whatToDoData);
    });
    await scenario('failed import keeps original data', initial, {}, async (run, importData) => {
      const before = await run('return JSON.stringify(d)');
      const data = fixture(); data.theme = 'dark'; await importData(data);
      assert.equal(await run("__faults.write=true;$('confirmAccept').click();return JSON.stringify(d)"), before);
      assert.equal(await run("return __rawGet('whatToDoData')"), initial.whatToDoData);
      assert.equal(await run("return document.documentElement.dataset.theme==='light'&&!!$('storageWarning')"), true);
    });
    await scenario('failed task save keeps editor open', initial, {}, async run => {
      assert.equal(await run("newTask('mine');$('name').value='new task';$('mins').value='5';$('environment').value='noisy';__faults.write=true;$('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return !$('modal').classList.contains('hide')&&!d.tasks.some(t=>t.name==='new task')&&!!$('storageWarning')"), true);
      assert.equal(await run("return __rawGet('whatToDoData')"), initial.whatToDoData);
    });
    console.log('11 real-Chrome scenarios passed; isolated profile only.');
    await send('Browser.close');
  } finally {
    socket?.close();
    if (browser && browser.exitCode === null) browser.kill();
    if (exited) await exited;
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    // Only delete the exact temporary profile created above, inside os.tmpdir().
    const resolved = path.resolve(profile), tempRoot = path.resolve(os.tmpdir());
    if (path.dirname(resolved) !== tempRoot || !path.basename(resolved).startsWith('now-what-to-do-test-')) throw Error('Unsafe test cleanup path');
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
