# 词课 · 可点击原型

在线访问：https://passmetheplay.github.io/wordclass-prototype/

包含：今日 / 巩固 / 学情 / 我的，五步学词、单词精讲、测试与学情方案线稿。

## 整体原型的单元学

[方案 A](./today-entries/today-a-single.html)和[方案 B](./today-entries/today-b-single.html)通过同一个 `today-entries/unit-tab.js` 加载 [单元学原型](https://passmetheplay.github.io/yibei-plan-progress/)的嵌入视图。两套整体原型打开时默认显示今日。

三个原型的单元学界面、数据和交互统一在 [yibei-plan-progress 仓库](https://github.com/passmetheplay/yibei-plan-progress)修改。该仓库发布后，三个原型重新打开即可加载同一版本。独立版同时展示演示状态和说明卡。

## 今日与详情页

[今日 A 模块](./today-entries/today-a.html)和[今日 B 模块](./today-entries/today-b.html)包含静态与动态状态，和两套整体原型共用 `today-entries/today.js` 与 `today-entries/today.css`。

计划进度和单元学习记录共用 `yibei-plan-progress` 的 `record-view.js` 与 `record-view.css`。今日任务和单元学共用该仓库的五步学词界面。今日按当前计划取词和结算，单元学按选定教材单元取词和结算。
