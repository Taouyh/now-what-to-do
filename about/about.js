/* Static landing-page copy; never reads or writes application storage. */
(() => {
'use strict';
const names=['English','简体中文','日本語'], languages=['en','zh-CN','ja'];
const copy=[
['.skip','Skip to content','跳到正文','本文へ移動'],
['#navDemo','See it work','看看怎么用','使い方を見る'],
['#getApp','Get the app ↗','获取应用 ↗','アプリを入手 ↗'],
['.hero .eyebrow','A QUIET PLACE TO BEGIN · VERSION 1.4.1','安静地开始 · 1.4.1 版','静かに始める場所 · バージョン 1.4.1'],
['#hero-title','A little time.<br><em>A page of your own.</em>','有点空闲。<br><em>写下自己的这一页。</em>','少しの時間を、<br><em>自分の一ページに。</em>'],
['.lead','Keep the things you want to do.<br class="mobile-break"> Choose one that fits right now.','把一直想做的事放在这里。<br class="mobile-break"> 有空时选一件，做一点。','やりたいことを、ここに。<br class="mobile-break"> 今できることを一つ選ぼう。'],
['.actions .primary','Open in browser ↗','打开网页版 ↗','ブラウザで開く ↗'],
['.actions .secondary','Watch the demo ↓','观看演示 ↓','デモを見る ↓'],
['.hero > .small','Free. No account. Your data stays on this device.','免费，无需注册。数据保存在当前设备。','無料、登録不要。データはこの端末に保存。'],
['figcaption','A familiar place for a small first step.','一个熟悉的地方，迈出小小的第一步。','小さな一歩のための、なじみの場所。'],
['.steps-section .eyebrow','HOW IT WORKS','怎么开始','使い方'],
['#steps-title','From a free moment<br>to a first step.','从一点空闲，<br>到第一小步。','空いた時間から、<br>最初の一歩へ。'],
['.steps article:nth-child(1) h3','Keep your ideas.','记下想做的事。','やりたいことを残す。'],
['.steps article:nth-child(1) p','Add an activity and a small next step. Pin favorites and drag the grip to put tasks in your own order.','添加活动和下一小步。常做的任务可以置顶，也可以拖动把手调整顺序。','活動と次の一歩を追加。よく使う活動をピン留めし、ハンドルをドラッグして並べ替えられます。'],
['.steps article:nth-child(2) h3','Find what fits.','选一件合适的。','今できることを選ぶ。'],
['.steps article:nth-child(2) p','Choose your time and current conditions. Start a suggestion, try another, or choose for yourself.','选好时间和当前条件。接受推荐、换一件，或者自己选。','時間と今の条件を設定。提案を始めても、別の活動を選んでも大丈夫。'],
['.steps article:nth-child(3) h3','Start, then remember.','开始，也记下来。','始めて、記録する。'],
['.steps article:nth-child(3) p','Focus, pause when you need to, and end to save your time. Leave a note for next time.','专注一会儿，需要时暂停，结束后记录用时。留下一句，下次接着做。','集中し、必要なら一休み。終了すると時間が記録され、次回のメモを残せます。'],
['.demo-section .eyebrow','A WALK THROUGH THE APP','跟着演示走一遍','アプリをひとめぐり'],
['#demo-title','See each step.','每一步，都看得见。','一つずつ、見てみよう。'],
['.section-heading .small','86 seconds · English<br>Soft music and mouse clicks. No voiceover.','86 秒 · 英语界面<br>轻柔配乐和鼠标点击声，无旁白。','86秒 · 英語の画面<br>穏やかな音楽とクリック音。ナレーションなし。'],
['video a','Download the product demo','下载产品演示','製品デモをダウンロード'],
['.video-caption span','Add → Pin & reorder → Focus → Journal → Settings','添加 → 置顶与排序 → 专注 → 日历 → 设置','追加 → ピン留め・並べ替え → 集中 → 記録 → 設定'],
['.video-caption a','Save video ↓','保存视频 ↓','動画を保存 ↓'],
['.journal .eyebrow','A RECORD OF YOUR TIME','留下时间的痕迹','時間の記録'],
['#journal-title','Your time,<br>in a journal.','你的时间，<br>在手账里。','あなたの時間を、<br>手帳に。'],
['.journal p:not(.eyebrow):not(.small)','See what you made time for. Open an activity, review your sessions, and pick up where you left off.','看看今天为哪些事留出了时间。打开活动，回顾记录，下次从这里继续。','何に時間を使えたかを振り返る。活動を開いて記録を見たら、また続きから。'],
['.journal .small','Light and dark themes. English, Chinese and Japanese.<br>Export a backup in Settings to keep a copy.','浅色与深色主题，支持中英日。<br>可以在设置中导出备份。','ライト・ダークテーマ、英語・中国語・日本語に対応。<br>設定からバックアップを書き出せます。'],
['.download-section .eyebrow','TAKE IT WITH YOU · 1.4.1','随身带上 · 1.4.1','いつも手元に · 1.4.1'],
['#download-title','Make room for<br><em>one small thing.</em>','留一点时间，<br><em>做一件小事。</em>','小さなことを一つ、<br><em>始める余白を。</em>'],
['.text-link','Or open it in your browser ↗','也可以直接打开网页版 ↗','ブラウザで開くこともできます ↗'],
['.download:nth-child(1) small','Windows 10 / 11 · 64-bit · 1.4.1','Windows 10 / 11 · 64 位 · 1.4.1','Windows 10 / 11 · 64ビット · 1.4.1'],
['.download:nth-child(2) small','Android 7.0+ · APK · 1.4.1','Android 7.0 及以上 · APK · 1.4.1','Android 7.0以降 · APK · 1.4.1'],
['.download > span:last-child','GitHub Releases ↗','前往 GitHub Release ↗','GitHub Releases へ ↗'],
['.downloads > .small','Installed apps work offline. Windows shares the system WebView2 runtime; first setup needs internet if it is missing.','安装版可离线使用。Windows 使用系统 WebView2；缺少运行时时，首次安装需联网。','インストール版はオフラインで使えます。Windows はシステムの WebView2 を使い、未導入時の初回セットアップには接続が必要です。'],
['.downloads summary','Installation and updates','安装与更新','インストールと更新'],
['.downloads details p:nth-of-type(1)','Windows may show an unknown-publisher notice. Android needs an up-to-date WebView.','Windows 可能提示未知发布者。安卓需要较新的 WebView。','Windows では不明な発行元の通知が出る場合があります。Android には新しい WebView が必要です。'],
['.downloads details p:nth-of-type(2)','Back up before updating. Install over your existing 1.1–1.4 app to keep its data. From Windows 1.0, export first and restore in Settings.','更新前先导出备份。1.1–1.4 版本可覆盖安装，保留数据；Windows 1.0 请先导出，再到新版设置中恢复。','更新前にバックアップを。1.1〜1.4 は上書きでデータを保持できます。Windows 1.0 は先に書き出し、新版の設定で復元してください。'],
['.downloads details a','Release notes ↗','版本说明 ↗','更新内容 ↗'],
['.privacy p','No account. No automatic sync.<br>Your activities, settings and history stay on this device.','无需注册，不自动同步。<br>活动、设置和历史记录保存在当前设备。','登録不要、自動同期なし。<br>活動・設定・履歴はこの端末に保存されます。'],
['.privacy a','Open source, with care ↗','开源，也用心 ↗','オープンソース ↗'],
['footer > a:last-child','MIT License ↗','MIT 许可 ↗','MIT ライセンス ↗']
];
const titles=['Now What — A little time. A page of your own.','Now What — 有点空闲，现在就开始。','Now What — 少しの時間を、自分の一歩に。'];
const descriptions=['A book-style activity picker for Windows, Android and the web. Pin, reorder and start one thing.','支持 Windows、安卓和网页的活动手账。置顶、拖拽排序，选一件事开始。','Windows・Android・Webで使える手帳のような活動アプリ。ピン留め、並べ替え、そして一歩。'];
const picker=document.querySelector('.language-picker'),trigger=picker.querySelector('.language-trigger'),options=picker.querySelector('.language-options');
function open(value){picker.classList.toggle('is-open',value);trigger.setAttribute('aria-expanded',String(value));}
function select(i){
 document.documentElement.lang=languages[i];document.title=titles[i];
 document.querySelector('meta[name="description"]').content=descriptions[i];
 document.querySelector('meta[property="og:title"]').content=titles[i];
 for(const [selector,...text] of copy) document.querySelectorAll(selector).forEach(el=>{el.innerHTML=text[i];});
 document.getElementById('languageCurrent').textContent=names[i];
 const label=['Language','语言','言語'][i];trigger.setAttribute('aria-label',label+': '+names[i]);options.setAttribute('aria-label',label);
 document.querySelector('nav').setAttribute('aria-label',['Main navigation','主导航','メインナビゲーション'][i]);
 document.querySelector('.hero-image img').alt=['Now What 1.4.1: choose time and conditions, then start.','Now What 1.4.1：选好时间与条件，开始活动。','Now What 1.4.1：時間と条件を選んで活動を始める。'][i];
 document.querySelector('.journal img').alt=['Activity sessions and time spent in the Journal.','手账日历展示活动记录和投入时间。','記録画面に活動と所要時間が表示される。'][i];
 document.querySelector('video').setAttribute('aria-label',['Now What 1.4.1 English demonstration, 86 seconds','Now What 1.4.1 英语演示，86 秒','Now What 1.4.1 英語デモ、86秒'][i]);
 options.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===languages[i])));
}
// Hover opens the pointer menu. Clicking the trigger never toggles it.
picker.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')open(true);});
picker.addEventListener('pointerleave',()=>open(false));
// Keyboard access supplements hover, without click-to-open behavior.
trigger.addEventListener('keydown',e=>{if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();open(true);options.querySelector('[aria-pressed="true"]').focus();}});
picker.addEventListener('keydown',e=>{if(e.key==='Escape'){open(false);trigger.focus();}});
picker.addEventListener('focusout',e=>{if(!picker.contains(e.relatedTarget))open(false);});
options.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>{select(languages.indexOf(el.dataset.lang));open(false);trigger.focus();}));
// Every initial load is English, regardless of browser or saved app language.
select(0);
})();

