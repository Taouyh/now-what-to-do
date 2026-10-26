/* This page keeps its language preference separate from the tool's data. */
(() => {
  'use strict';
  const copy = {
    en: {
      conditionsKicker: 'NEW IN 1.2.1', conditionsTitle: 'Ready when you are.', conditionsBody: 'Hover over time or conditions to open the menu. Pick what fits, then start. Move away from the panel and it closes.', conditionsNote: 'All four conditions start unchecked. Your choices are remembered. On mobile, just tap.', conditionsAlt: 'Four simple condition checkboxes, all initially unchecked.',
      historyKicker: 'YOUR DAY AT A GLANCE', historyTitle: 'See what you made time for.', historyBody: 'Repeat sessions come together in Today. Open an activity to see each time range and time spent. Use ⋯ when you want a little more detail.', historyNote: 'Cards close after ten seconds. Your original records stay intact.', historyAlt: 'Today groups three Vibe Coding sessions with their time ranges and actual durations.',
      pageTitle: 'Now What — A little time. A real start.', description: "Got a little free time? Pick something you've been meaning to do, and start now.",
      skip: 'Skip to content', nav: 'Navigation', language: 'Language', navDemo: 'See it work', navDownload: 'Download',
      heroKicker: 'FOR THE THINGS YOU KEEP MEANING TO DO', titleOne: 'Got a little', titleTwo: 'free time?', intro: "Pick something you've been meaning to do. Start now.", open: 'Open in browser ↗', getApp: 'Get the app ↓', heroNote: 'Free. No account. Just a place to start.', oneThing: 'ONE THING, RIGHT NOW', artFoot: 'A little progress counts.', shotAlt: 'Now What suggests reading a book with ten minutes available.',
      demoKicker: 'LESS DECIDING. MORE DOING.', demoTitle: 'From “someday” to started.', format: 'Demo format', desktop: 'Windows', mobile: 'Mobile', videoDesktop: 'Windows app demo, 14 seconds', videoMobile: 'Mobile app demo, 14 seconds', demoNote: '14 seconds · English interface · gentle music, no voice', saveVideo: 'Save video ↓', videoFallback: 'Download the demo video',
      howKicker: 'NOT ANOTHER LONG TO-DO LIST', howTitle: 'One small start is enough.', stepOne: 'Add your things.', stepOneBody: 'Reading, drawing, learning a language. A name is enough.', stepTwo: 'Set the moment.', stepTwoBody: 'How much time do you have? Can you use a computer, listen or speak?', stepThree: 'Begin one.', stepThreeBody: 'Start a suggestion that fits. End to save your time and get another idea.',
      downloadKicker: 'KEEP A LITTLE SPACE FOR YOURSELF', downloadOne: 'Your next', downloadTwo: 'ten minutes.', browserAlternative: 'Or just open it in your browser ↗', windowsSpec: 'Windows 10 / 11 · 64-bit · ~2 MiB', androidSpec: 'Android 7.0+ · .apk', downloadAction: 'Download ↓', installNote: 'Works offline after setup. Starts in English. Windows uses Microsoft WebView2; setup needs internet if the runtime is missing.', beforeInstall: 'Before you install', installCaveat: 'Windows may show an unknown-publisher notice. Upgrading from Windows 1.0? Export your old backup before installing, then restore it in the new app. Android needs an up-to-date WebView and has not yet been tested on a real phone.', upgradeGuide: 'Version 1.2.1 & upgrade guide ↗', allReleases: 'All releases & download help ↗', privacy: 'Your activities stay on this device. No automatic sync. Export a backup in Settings to keep a copy.', license: 'MIT License ↗'
    },
    'zh-CN': {
      conditionsKicker: '1.2.1 版本更新', conditionsTitle: '随时都能开始。', conditionsBody: '鼠标移到时间或当前条件，选项就会展开。按现在的情况选好，就能开始；移出弹框，它会自动收起。', conditionsNote: '四项条件默认都不勾选，选过会记住。手机上轻点操作。', conditionsAlt: '当前条件展开为四个简洁的复选框，默认全部未勾选。',
      historyKicker: '回看今天', historyTitle: '今天做过的，一眼就清楚。', historyBody: '同一活动的多次执行放在一起。展开就能看到每次的时间段和实际用时，需要更多信息时再点 ⋯。', historyNote: '卡片 10 秒后自动收起，原始记录完整保留。', historyAlt: '今天页汇总三次 Vibe Coding，每次只展示时间段和实际用时。',
      pageTitle: 'Now What — 有点空闲，现在就开始。', description: '有点空闲？选一件一直想做的事，现在就开始。',
      skip: '跳到正文', nav: '导航', language: '语言', navDemo: '看看怎么用', navDownload: '下载',
      heroKicker: '给那些一直想做的事，留一点时间', titleOne: '有点空闲？', titleTwo: '现在就开始。', intro: '选一件一直想做的事，现在就开始。', open: '打开网页版 ↗', getApp: '下载安装 ↓', heroNote: '免费，不用注册，直接开始。', oneThing: '此刻，只做一件事', artFoot: '开始一点，也算前进。', shotAlt: 'Now What 在有十分钟空闲时推荐读书。',
      demoKicker: '少纠结一点，多开始一点', demoTitle: '从「一直想做」到开始做。', format: '演示格式', desktop: 'Windows', mobile: '手机版', videoDesktop: 'Windows 版操作演示，14 秒', videoMobile: '手机版操作演示，14 秒', demoNote: '14 秒 · 英语界面 · 轻柔配乐，无人声', saveVideo: '保存视频 ↓', videoFallback: '下载演示视频',
      howKicker: '不用再列一张长长的清单', howTitle: '先开始一件小事。', stepOne: '写下想做的事。', stepOneBody: '读书、画画、学语言，先写一个名字就好。', stepTwo: '看看现在的条件。', stepTwoBody: '有多少时间？能用电脑、听音频，还是方便出声？', stepThree: '选一件，开始。', stepThreeBody: '选一件符合当前条件的事，直接开始。结束后记下用时，再换个想法。',
      downloadKicker: '给自己，留一点空闲', downloadOne: '接下来的', downloadTwo: '十分钟。', browserAlternative: '也可以直接打开网页版 ↗', windowsSpec: 'Windows 10 / 11 · 64 位 · 约 2 MiB', androidSpec: 'Android 7.0 及以上 · .apk', downloadAction: '下载 ↓', installNote: '安装后可离线使用，首次为英语，可在设置中切换。Windows 使用系统 WebView2，缺少运行时时首次安装需要联网。', beforeInstall: '安装前看一眼', installCaveat: 'Windows 可能提示「未知发布者」。从 Windows 1.0 升级时，请先在旧版导出备份，再安装新版并导入。安卓需要较新的 WebView，目前尚未在真机上测试。', upgradeGuide: '1.2.1 版本与升级说明 ↗', allReleases: '全部版本与下载说明 ↗', privacy: '活动只存在当前设备，不会自动同步。可以在设置里导出备份，自己留一份。', license: 'MIT 开源许可 ↗'
    },
    ja: {
      conditionsKicker: '1.2.1 の更新', conditionsTitle: '思い立ったら、すぐに。', conditionsBody: '時間や条件にマウスを重ねると、選択肢が開きます。今の状況を選んで、開始。パネルから離すと閉じます。', conditionsNote: '4つの条件は最初は未選択。選んだ内容は保存されます。スマホではタップで操作します。', conditionsAlt: '最初はすべて未選択の、4つのシンプルな条件チェックボックス。',
      historyKicker: '今日を振り返る', historyTitle: '今日の積み重ねが、見えてくる。', historyBody: '同じ活動の記録をひとつに。開くと各回の時間帯と実際に使った時間が並びます。詳しく見たいときだけ ⋯ へ。', historyNote: 'カードは10秒後に閉じ、元の記録はそのまま残ります。', historyAlt: 'Vibe Coding の3回の記録をまとめ、時間帯と実際に使った時間を表示する今日の画面。',
      pageTitle: 'Now What — 少しの時間で、ひとつはじめよう。', description: '少し時間が空いた？ ずっとやりたかったことをひとつ選んで、今はじめよう。',
      skip: '本文へ移動', nav: 'ナビゲーション', language: '言語', navDemo: '使い方を見る', navDownload: 'ダウンロード',
      heroKicker: 'ずっとやりたかったことに、少しの時間を', titleOne: '少し時間が', titleTwo: '空いた？', intro: 'ずっとやりたかったことをひとつ選んで、今はじめよう。', open: 'ブラウザで開く ↗', getApp: 'アプリを入れる ↓', heroNote: '無料。登録不要。気軽にはじめよう。', oneThing: '今、できることをひとつ', artFoot: '少しの一歩も、前進。', shotAlt: '空いた10分に読書を提案する Now What の画面。',
      demoKicker: '迷う時間を、はじめる時間に', demoTitle: '「いつか」を、今に。', format: 'デモの形式', desktop: 'Windows', mobile: 'モバイル', videoDesktop: 'Windows 版の操作デモ、14秒', videoMobile: 'モバイル版の操作デモ、14秒', demoNote: '14秒 · 英語の画面 · 穏やかな音楽、音声なし', saveVideo: '動画を保存 ↓', videoFallback: 'デモ動画をダウンロード',
      howKicker: '長いリストは、いりません', howTitle: '小さく、ひとつはじめよう。', stepOne: 'やりたいことを書く。', stepOneBody: '読書、絵、語学。まずは名前だけで大丈夫。', stepTwo: '今の状況を選ぶ。', stepTwoBody: '何分ある？ パソコンを使える？ 音を聞ける？ 声を出せる？', stepThree: 'ひとつ、はじめる。', stepThreeBody: '今の状況に合う提案から開始。終了すると時間を記録し、次の提案へ。',
      downloadKicker: '自分のために、少しの時間を', downloadOne: '次の', downloadTwo: '10分から。', browserAlternative: 'ブラウザでも、そのまま使えます ↗', windowsSpec: 'Windows 10 / 11 · 64ビット · 約2 MiB', androidSpec: 'Android 7.0以降 · .apk', downloadAction: 'ダウンロード ↓', installNote: 'セットアップ後はオフラインで使えます。初回は英語です。Windows は WebView2 を使い、未導入の場合のみ通信が必要です。', beforeInstall: 'インストール前に', installCaveat: 'Windows では「不明な発行元」と表示される場合があります。Windows 1.0 から更新する前にバックアップを保存し、新版で復元してください。Android は最新の WebView が必要です。実機では未検証です。', upgradeGuide: '1.2.1 の更新・移行ガイド ↗', allReleases: 'すべてのリリースとダウンロード案内 ↗', privacy: 'データは今の端末だけに保存され、自動同期されません。設定からバックアップを保存できます。', license: 'MIT ライセンス ↗'
    }
  };
  const storageKey = 'nowWhat.about.language';
  const allowed = language => Object.hasOwn(copy, language);
  let language = 'en';
  const requested = new URL(location.href).searchParams.get('lang');
  if (allowed(requested)) language = requested;
  else {
    try {
      const saved = localStorage.getItem(storageKey);
      if (allowed(saved)) language = saved;
    } catch (_) { /* English is usable when storage is unavailable. */ }
  }
  let demo = matchMedia('(max-width: 700px)').matches ? 'mobile' : 'windows';
  const video = document.getElementById('demoVideo');

  function renderLanguage() {
    const text = copy[language];
    document.documentElement.lang = language;
    document.title = text.pageTitle;
    document.querySelector('meta[name="description"]').content = text.description;
    for (const element of document.querySelectorAll('[data-copy]')) element.textContent = text[element.dataset.copy];
    for (const element of document.querySelectorAll('[data-label]')) element.setAttribute('aria-label', text[element.dataset.label]);
    for (const element of document.querySelectorAll('[data-alt]')) element.alt = text[element.dataset.alt];
    document.getElementById('startShot').src = `assets/start-${language}.png?v=1.2.1`;
    document.getElementById('conditionsShot').src = `assets/conditions-${language}.png?v=1.2.1`;
    document.getElementById('historyShot').src = `assets/today-${language}.png?v=1.2.1`;
    for (const button of document.querySelectorAll('[data-lang]')) button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    video.setAttribute('aria-label', text[demo === 'windows' ? 'videoDesktop' : 'videoMobile']);
  }

  function renderDemo() {
    video.pause();
    video.poster = `assets/${demo}-poster.jpg`;
    const source = video.querySelector('source');
    source.src = `assets/${demo}-demo.mp4`;
    video.querySelector('a').href = source.src;
    video.width = demo === 'windows' ? 1920 : 1080;
    video.height = demo === 'windows' ? 1080 : 1920;
    video.load();
    video.closest('.video-stage').dataset.format = demo;
    document.getElementById('videoDownload').href = source.src;
    for (const button of document.querySelectorAll('[data-demo]')) button.setAttribute('aria-pressed', String(button.dataset.demo === demo));
    video.dataset.label = demo === 'windows' ? 'videoDesktop' : 'videoMobile';
    video.setAttribute('aria-label', copy[language][video.dataset.label]);
  }

  for (const button of document.querySelectorAll('[data-lang]')) button.addEventListener('click', () => {
    language = button.dataset.lang;
    try { localStorage.setItem(storageKey, language); } catch (_) { /* Switching still works. */ }
    renderLanguage();
  });
  for (const button of document.querySelectorAll('[data-demo]')) button.addEventListener('click', () => {
    demo = button.dataset.demo;
    renderDemo();
  });
  renderLanguage();
  renderDemo();
})();
