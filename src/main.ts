import { mountBook } from './ui/book';
import './ui/styles/book.css';

async function start() {
  const { runtime } = await import('virtual:runtime');
  mountBook(runtime);
  // Decode the assembled book before revealing it, not one texture at a time.
  // A failed/offline resource cannot leave the application trapped behind a loader.
  const backgrounds = ['environment.webp', 'scroll-paper.webp', 'task-paper.webp'].map(name => {
    const image = new Image(); image.src = `assets/${name}`; return image.decode();
  });
  let timeout: ReturnType<typeof setTimeout>;
  await Promise.race([
    Promise.allSettled([...Array.from(document.querySelectorAll<HTMLImageElement>('#book img'), image => image.decode()), ...backgrounds, document.fonts.ready]),
    new Promise<void>(resolve => { timeout = setTimeout(resolve, 2500); }),
  ]);
  clearTimeout(timeout!);
  document.documentElement.dataset.appReady = 'true';
  performance.mark('nowwhat-ready');
}

function showUnavailable(failed = false) {
  document.documentElement.dataset.appReady = 'true';
  const chinese = navigator.language.startsWith('zh'), japanese = navigator.language.startsWith('ja');
  const heading = document.createElement('h1');
  heading.textContent = failed ? (chinese ? '暂时无法打开' : japanese ? '開けませんでした' : 'Unable to open') : (chinese ? '已在另一个窗口打开' : japanese ? '別のウィンドウで開いています' : 'Already open in another window');
  const note = document.createElement('p');
  note.textContent = chinese ? '本窗口不会修改任务或计时。关闭原窗口后重新加载；原有本地数据保持不变。' : japanese ? 'このウィンドウは活動やタイマーを変更しません。元のウィンドウを閉じて再読み込みしてください。保存済みデータは保持されます。' : 'This window will not change activities or timers. Close the original window and reload. Existing local data is preserved.';
  const reload = document.createElement('button'); reload.type = 'button'; reload.textContent = chinese ? '重新加载' : japanese ? '再読み込み' : 'Reload'; reload.onclick = () => location.reload();
  const panel = document.createElement('main'); panel.id = 'singleWindowNotice'; panel.setAttribute('role', 'alert'); panel.append(heading, note, reload);
  document.body.replaceChildren(panel); reload.focus();
}

// Acquire before importing the runtime: a second tab cannot restore or checkpoint
// the first tab's timer. The browser releases the lock when its document closes.
if (navigator.locks && location.protocol !== 'file:') {
  void navigator.locks.request('now-what-editor-v1', { ifAvailable: true }, async lock => {
    if (!lock) { showUnavailable(); return; }
    await start();
    await new Promise<void>(release => window.addEventListener('pagehide', () => release(), { once: true }));
  }).catch(error => { console.error(error); showUnavailable(true); });
} else {
  void start().catch(error => { console.error(error); showUnavailable(true); });
}
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
