<p align="center"><a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <strong>日本語</strong></p>

<p align="center"><img src="packaging/icon.png" width="88" height="88" alt="Now What アイコン"></p>
<h1 align="center">Now What</h1>
<h3 align="center">少しの時間で、ひとつはじめよう。</h3>

<p align="center">ずっとやりたかったことを置いておく。時間が空いたら、ひとつ選ぶ。</p>
<p align="center"><a href="#features">機能</a> · <a href="#download">ダウンロード</a> · <a href="#start">使い方</a> · <a href="#privacy">プライバシー</a> · <a href="#development">開発</a> · <a href="#license">ライセンス</a></p>
<p align="center">
  <a href="https://github.com/Taouyh/now-what-to-do/releases/latest"><img src="https://img.shields.io/github/v/release/Taouyh/now-what-to-do?color=5b6650" alt="最新リリース"></a>
  <a href="https://github.com/Taouyh/now-what-to-do/releases"><img src="https://img.shields.io/github/downloads/Taouyh/now-what-to-do/total?color=5b6650" alt="ダウンロード数"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5b6650" alt="MIT ライセンス"></a>
</p>
<p align="center"><a href="https://taouyh.github.io/now-what-to-do/">ブラウザで使う</a> · <a href="https://taouyh.github.io/now-what-to-do/about/?lang=ja">紹介ページ</a></p>

<p align="center"><img src="about/assets/start-ja.png" width="820" alt="空いた10分で読書をはじめる画面。"></p>

<a id="features"></a>
## できること

- **迷ったら、ひとつ。** 読書、絵、語学などを登録。提案から選んだり、別の候補や自分の一覧から選べます。
- **今の状況に合わせる。** パソコンを使える、音を聞ける、声を出せる、中断されるかもしれない。最初はすべて未選択で、その後の選択は保存されます。
- **空いた時間で。** 5・10・15・30・60分、または好きな時間を設定。パソコンでは時間や条件にマウスを重ねると開き、パネルから離すと閉じます。スマホではタップで操作します。
- **終えたら記録。** 実際に使った時間を保存して開始画面へ。活動は残るので、次回も続けられます。
- **今日を振り返る。** 同じ活動の記録をまとめ、回数と合計時間を表示。各回の記録を開くと、10秒後に閉じます。
- **好みに合わせて。** ライト・ダークテーマ、英語・中国語・日本語。Windows・Android・ブラウザに対応。

<a id="download"></a>
## ダウンロード

| 環境 | 入手先 | 必要なもの |
| --- | --- | --- |
| Windows | [インストーラー](https://github.com/Taouyh/now-what-to-do/releases/download/v1.2.1/Now-What-1.2.1-Windows-x64-Setup.exe) · 約2 MiB | Windows 10 / 11、64ビット |
| Android | [APK をダウンロード](https://github.com/Taouyh/now-what-to-do/releases/download/v1.2.1/Now-What-1.2.1-Android.apk) | Android 7.0以降 |
| Web | [ブラウザで開く](https://taouyh.github.io/now-what-to-do/) | インストール不要 |

無料、登録不要。インストール版はオフラインで使え、初回は英語です。**設定**で言語を変更できます。Web版はブラウザの言語に合わせて起動します。

<details>
<summary>インストールと更新について</summary>

- Windows はシステムの WebView2 を使います。未導入の場合のみセットアップ中にダウンロードします。インストーラーは未署名のため、「不明な発行元」と表示される場合があります。
- Android は新しい WebView が必要です。パッケージと署名は確認済みですが、実機での動作は未検証です。
- 1.1 / 1.2 からは上書きで更新できます。データの保存場所は同じです。Android は先にアンインストールしないでください。
- **Windows 1.0** からは、旧版でバックアップを書き出し、新版の設定で復元してください。自動移行はありません。進行中のタイマーはバックアップに含まれません。
- [すべてのリリース](https://github.com/Taouyh/now-what-to-do/releases) · [詳しいインストール・更新手順](docs/installable-builds.md)

</details>

<a id="start"></a>
## 使い方

1. **やりたいことを書く。** 「読書」など、名前だけで大丈夫です。
2. **空いている時間を選ぶ。** 必要なら今の条件も調整します。
3. **開始を押す。** 終わったら終了を押すと、使った時間が保存されます。

<details>
<summary>条件の選択と今日の記録を見る</summary>

<p align="center"><img src="about/assets/conditions-ja.png" width="680" alt="現在の条件にマウスを重ねると、未選択の4つのチェックボックスが開きます。"></p>
<p align="center"><img src="about/assets/today-ja.png" width="820" alt="今日の3回の Vibe Coding をまとめ、各回の時間帯と実際に使った時間を表示。"></p>

</details>

[14秒の使い方動画](https://taouyh.github.io/now-what-to-do/about/?lang=ja#demo) · [1.2.1 の更新内容](docs/releases/v1.2.1.md)

<a id="privacy"></a>
## データとプライバシー

活動・設定・記録は今の端末に保存され、自動同期されません。端末を変える前に、**設定 → データのバックアップ → エクスポート**で控えを保存してください。

アプリやブラウザのデータを消すと記録も失われる場合があります。復元すると現在のデータが置き換わり、進行中のタイマーは含まれません。

<a id="development"></a>
## 開発・貢献

ソースをダウンロードして `index.html` を開くと使えます。[Issue](https://github.com/Taouyh/now-what-to-do/issues) や Pull Request も歓迎します。

[Windows / Android のビルド](docs/installable-builds.md) · [紹介ページの公開](docs/site-and-readme.md)

<a id="license"></a>
## ライセンス

[MIT](LICENSE) © 2026 Taouyh。使用・変更・共有できます。ライセンス表記を残してください。
