# 现在做什么（now-what-to-do）

根据当前可用时间和环境，从你长期想做的活动中选出一项，立刻开始。支持计时和学习记录，结束的是本次执行，活动可以反复进行。

## 在线体验

体验地址：[https://taouyh.github.io/now-what-to-do/](https://taouyh.github.io/now-what-to-do/)

## 复制到自己的 GitHub 并上线

1. 登录 GitHub，打开 [项目仓库](https://github.com/Taouyh/now-what-to-do)，点击右上角 **Fork**。
2. 将 **Owner** 选为自己的账号，保留仓库名 `now-what-to-do`，点击 **Create fork**，即可得到自己的项目副本。
3. 在自己的仓库打开 **Settings → Pages**，将 **Source** 设为 **Deploy from a branch**。
4. 选择包含 `index.html` 的主分支（本项目为 `master`），目录选择 **/ (root)**，点击 **Save**。
5. 等待发布完成，点击 Pages 设置中的 **Visit site** 打开网页。保留原仓库名时，网址为：

   ```text
   https://你的GitHub用户名.github.io/now-what-to-do/
   ```

如果修改了仓库名，网址最后一段也会相应改变，以 Pages 页面显示的地址为准。发布设置可参考 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 本地运行

1. 在 [项目仓库](https://github.com/Taouyh/now-what-to-do) 点击 **Code → Download ZIP**，下载并解压；也可以使用 Git 克隆：

   ```bash
   git clone https://github.com/Taouyh/now-what-to-do.git
   ```

2. 打开项目文件夹，直接双击 `index.html`，使用浏览器运行。

项目使用原生 HTML、CSS 和 JavaScript，无需安装依赖、Node.js 或后端服务，也不需要启动本地 HTTP 服务器。

## 注意事项

- 使用支持 JavaScript 和 `localStorage` 的现代浏览器，并允许网页使用本地存储。
- 首次使用任务库为空，先添加自己想经常做的活动，再选择时间和环境进行推荐，也可以自己选择任务。
- 数据仅保存在当前浏览器本地，不会自动跨浏览器、设备或网址同步。清除浏览器数据可能导致任务和学习记录丢失。
- 建议通过顶部「数据管理 → 备份我的数据」定期保存 JSON 备份。更换访问地址前先备份，再通过「从备份恢复」导入；恢复会在确认后替换当前主数据，进行中的计时不包含在备份中。
- 个人备份请保存在项目仓库外，不要随源码公开上传。
