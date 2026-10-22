const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Runs the real app script with an in-memory Storage and a small DOM substitute.
// No browser profile, network, dependency install, or user data is involved.
function boot(initial = {}, faults = {}) {
  const values = new Map(Object.entries(initial));
  const writes = [];
  const downloads = [];
  const elements = new Map();
  const intervals = new Map();
  let nextTimer = 0;
  class Element {
    constructor(tagName = 'div') {
      this.tagName = tagName.toUpperCase();
      this.dataset = {};
      this.style = {};
      this.value = '';
      this.checked = false;
      this.textContent = '';
      this.listeners = {};
      this.children = [];
      const classes = new Set();
      this.classList = {
        add: (...xs) => xs.forEach(x => classes.add(x)),
        remove: (...xs) => xs.forEach(x => classes.delete(x)),
        contains: x => classes.has(x),
        toggle(x, force = !classes.has(x)) { force ? classes.add(x) : classes.delete(x); },
      };
    }
    set id(id) { this._id = id; elements.set(id, this); }
    get id() { return this._id; }
    set innerHTML(html) { this._html = html; parse(html); }
    get innerHTML() { return this._html || ''; }
    set className(value) { value.split(/\s+/).filter(Boolean).forEach(x => this.classList.add(x)); }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; this._html = ''; }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(type, fn, capture) { (this.listeners[type] ||= []).push({ fn, capture }); }
    dispatch(type, details = {}) {
      const event = { target: this, preventDefault() {}, stopImmediatePropagation() { this.stopped = true; }, ...details };
      for (const { fn } of this.listeners[type] || []) { fn(event); if (event.stopped) return; }
      this['on' + type]?.(event);
    }
    click() {
      if (this.tagName === 'A') downloads.push({ name: this.download, blob: blobs.get(this.href) });
      else this.dispatch('click');
    }
    focus() {}
    getBoundingClientRect() { return { left: 12, top: 12, width: 280, height: 190 }; }
    hasPointerCapture() { return false; }
    reset() {}
    insertAdjacentHTML(_, html) { parse(html); }
    contains(el) { return this.children.includes(el); }
  }
  function parse(html) {
    for (const match of html.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)) {
      const el = new Element(match[1]);
      el.id = match[3];
      const cls = match[2].match(/\bclass="([^"]*)"/);
      if (cls) el.className = cls[1];
      const value = match[2].match(/\bvalue="([^"]*)"/);
      if (value) el.value = value[1];
    }
  }
  parse(fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8'));
  const choice = (value, on = false) => {
    const el = new Element('button'); el.dataset.v = String(value);
    if (on) el.classList.add('on');
    return el;
  };
  const times = [5, 10, 15, 30, 60, 'custom'].map(x => choice(x, x === 10));
  const envs = ['quiet', 'noisy', 'class'].map(x => choice(x, x === 'noisy'));
  const pages = ['home', 'today', 'tasks'].map(id => elements.get(id));
  const nav = pages.map(p => { const e = new Element('button'); e.dataset.page = p.id; return e; });
  const body = new Element('body');
  const document = {
    body, documentElement: new Element('html'), hidden: false,
    getElementById: id => elements.get(id) || null,
    createElement: tag => new Element(tag),
    querySelector: selector => selector.startsWith('#') ? elements.get(selector.slice(1)) : null,
    querySelectorAll: selector => ({ '#times button': times, '#envs button': envs, '.page': pages, '[data-page]': nav,
      'header, main, footer, #timer, #floatingTimer, #modal, #confirmLayer': [...pages, ...nav, elements.get('floatingTimer')],
    }[selector] || []),
    addEventListener() {},
  };
  function storageError(kind) { const e = new Error(kind); e.name = kind; return e; }
  const storage = {
    getItem(key) { if (faults.read || faults.readKey === key) throw storageError('SecurityError'); return values.get(key) ?? null; },
    setItem(key, value) {
      if (faults.write || faults.writeKey === key || faults.writeAfter !== undefined && writes.filter(w => w[0] === 'set').length >= faults.writeAfter) throw storageError('QuotaExceededError');
      writes.push(['set', key, String(value)]); values.set(key, String(value));
    },
    removeItem(key) {
      if (faults.remove || faults.removeKey === key) throw storageError('SecurityError');
      writes.push(['remove', key]); values.delete(key);
    },
  };
  const localStorage = new Proxy(storage, {
    get(target, key) { return key in target ? target[key] : target.getItem(key); },
    set(target, key, value) { target.setItem(key, value); return true; },
  });
  const blobs = new Map(), readers = [];
  const context = vm.createContext({
    document, location: { hash: '', reload() {} }, localStorage, console, Blob,
    innerWidth: 1024, innerHeight: 768, addEventListener() {},
    URL: { createObjectURL(blob) { const id = 'blob:test-' + blobs.size; blobs.set(id, blob); return id; }, revokeObjectURL() {} },
    setTimeout: () => ++nextTimer, clearTimeout() {},
    setInterval(fn) { const id = ++nextTimer; intervals.set(id, fn); return id; },
    clearInterval: id => intervals.delete(id),
    FileReader: class {
      readAsText(file) {
        if (file.throw) throw new Error('file read failed');
        if (file.defer) { readers.push(() => { this.result = file.text; this.onload?.(); }); return; }
        if (file.error) this.onerror?.();
        else { this.result = file.text; this.onload?.(); }
      }
    },
  });
  context.window = context;
  if (faults.access) Object.defineProperty(context, 'localStorage', { get() { throw storageError('SecurityError'); } });
  let error;
  try { vm.runInContext(fs.readFileSync(path.join(__dirname, '../../app.js'), 'utf8'), context, { filename: 'app.js' }); }
  catch (e) { error = e; }
  return {
    error, values, writes, elements, downloads, intervals, times, envs, document, faults, readers,
    run: code => vm.runInContext(code, context),
    json: code => JSON.parse(vm.runInContext('JSON.stringify(' + code + ')', context)),
    chooseConditions() {
      const [minutes, environment] = this.json('[time,env]');
      times.find(button => Number(button.dataset.v) === minutes).click();
      envs.find(button => button.dataset.v === environment).click();
    },
    import(data) {
      const file = elements.get('file');
      file.files = [{ text: typeof data === 'string' ? data : JSON.stringify(data) }];
      file.dispatch('change');
    },
    confirm() { elements.get('confirmAccept').click(); },
    cancel() { elements.get('confirmCancel').click(); },
  };
}

function fixture() {
  return {
    version: 2,
    goals: [{ id: 'mine', icon: '🎯', name: '个人目标', description: '保留' }],
    tasks: [{ id: 'mine-task', name: '个人任务', goalId: 'mine', minutes: 10, env: 'noisy', computer: false, description: '保留', enabled: true }],
    completed: [{ taskId: 'deleted-task', completedAt: '2026-09-01T10:00:00Z', date: '2026-09-01T10:00:00Z', minutes: 7, note: '旧记录' }],
    preferences: { time: 10, env: 'noisy', computerReady: false }, theme: 'light', defaultTasksSeeded: true,
    customData: { reflection: '不得丢失' },
  };
}
module.exports = { boot, fixture };
