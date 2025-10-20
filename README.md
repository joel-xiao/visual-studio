# Visualization Editor

<!-- ![awesome-vite](https://camo.githubusercontent.com/abb97269de2982c379cbc128bba93ba724d8822bfbe082737772bd4feb59cb54/68747470733a2f2f63646e2e7261776769742e636f6d2f73696e647265736f726875732f617765736f6d652f643733303566333864323966656437386661383536353265336136336531353464643865383832392f6d656469612f62616467652e737667)
![GitHub license](https://img.shields.io/github/license/caoxiemeihao/electron-vue-vite?style=flat)
![GitHub stars](https://img.shields.io/github/stars/caoxiemeihao/electron-vue-vite?color=fa6470&style=flat)
![GitHub forks](https://img.shields.io/github/forks/caoxiemeihao/electron-vue-vite?style=flat) -->

<!-- **[English](README.md) | 简体中文** -->

[DEMO](https://visual-studio-one.vercel.app/)

🥳 `Electron` + `Vue3` + `Vite2` + `Ts`

[Tauri Visualization Editor](https://github.com/joel-xiao/visual-studio)


## 概述

&emsp;&emsp;这是一个低代码开发平台简化软件，通过可视化界面和拖放组件快速构建应用。开发者无需写大量代
码，可配置预定义模块，如表单、数据管理和工作流程。它加快开发速度、降低成本，适用于企业应用、移动应用
和 Web 应用开发。提供实时预览和可视化界面，便于测试和定制，提高效率和灵活性。

它还在开发阶段，所以说如果你对该工程感兴趣，欢迎你的加入。或者刚入世的小白想弄明白`Tauri`整合类模板
最基础的工作原理，亦或者你是大神只是想偷懒少干点活；那么这个程序最合适你不过了。

目前正在进行`可视化`编辑器开发，后续会陆续集成`3D` `网页` `拓扑`等快速开发模块。还有
`生成可二次编辑的代码` 比如说生成 `Vue` `React` 脚手架项目程序和单元文件，及
`一键打包上传指定至服务器`等功能。

按照计划会依次对某个已完成的模块进行单独发布作为公共库，即上传至 npm，yarn，pnpm 库供使用者安装。还
可将使用者开发的自定义组件加载至该库可进行拖放自定义组件快速构建应用。

尽管如此，我还是希望你对`Electron` `Vue3` `Vite` `Ts` `Scss`有一定的基础；

具体实现细节我相信你看两遍源码就能把它吃透了 😋

## 运行项目

```bash
# clone the project
git clone https://github.com/joel-xiao/visual-studio.electron.git

# enter the project directory
cd visual-studio.electron

# switch the main
git switch main

# install dependency
npm install or yarn or pnpm

# develop
npm run dev or yarn dev or pnpm dev

## 目录结构

&emsp;&emsp;一旦启动或打包脚本执行过，会在根目录产生 **`dist` 文件夹，里面的文件夹同 `src` 一模一
样**；在使用一些路径计算时，尤其是相对路径计算；`dist` 与 `src` 里面保持相同的目录结构能避开好多问题

```tree
├
├── dist                        构建后，根据 src 目录生成
├   ├── assets
├   ├── images
├
├── .vscode
├   ├── settings.json           vscode 规范 配置
├
├── electron                    Electron and Nodejs
├   ├── ...
├
├── src                         Vue3 and JS code
├   ├── assets
├   ├── ...
├
├── tests                         Vue3 and JS 单元测试
├
├── .commitlintrc.js            git commit message 规范 配置
├── .gitignore                  指定 git 忽略文件和目录
├── changelog-option.js         git commit message 扩展阅读 配置
├── tsconfig.json               tslint 配置

├
```

## 提交更改

请点击这里查看
[提交规则](https://github.com/joel-xiao/visual-studio.electron/blob/main/.commitlintrc.js)。

```bash
# pull
git pull --rebase

# commit the message
git commit -m "commit: message"

# push
git push
```
