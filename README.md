# VisualCraft

可视化工匠 - 基于 Monorepo 架构的低代码可视化开发平台，支持 Web、Electron 和 Tauri 多平台部署。

## ✨ 特性

- 🎨 **可视化编辑器** - 拖放组件快速构建应用
- 🚀 **多平台支持** - Web、Electron、Tauri 三端统一
- 📦 **Monorepo 架构** - pnpm workspace 管理多包
- 🔧 **统一配置管理** - `project.config.json` 集中管理项目配置
- 💻 **现代化技术栈** - Vue 3 + TypeScript + Vite
- 🎯 **代码共享** - Web 核心代码被 Electron 和 Tauri 复用

## 🏗️ 项目结构

```
visual-craft.monorepo/
├── packages/
│   ├── web/
│   ├── electron/
│   └── tauri/
├── scripts/
│   └── sync-project-config.ts
├── config/
│   └── changelog-option.ts
├── project.config.json
└── package.json
```


## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Rust (仅 Tauri 需要)

### 安装依赖

```bash
git clone git@github.com:joel-xiao/visual-studio.monorepo.git
cd visualization-editor.monorepo
pnpm install
```

### 开发模式

```bash
# Web 开发
pnpm dev:web

# Electron 开发
pnpm dev:electron

# Tauri 开发
pnpm dev:tauri
```

### 构建

```bash
pnpm build:web
pnpm build:electron
pnpm build:tauri
```

**构建输出目录：**
- **Web 模式** (`--mode web`): `packages/web/dist/` (base: `/`)
- **客户端模式** (`--mode client`): `packages/web/dist/` (base: `./`)
- **Electron**: 
  - 主进程/预加载：`packages/electron/dist/main/`, `packages/electron/dist/preload/`
  - Web 文件：`packages/electron/dist/web/`
  - 打包输出：`packages/electron/release/`
- **Tauri**: 
  - Rust 构建：`packages/tauri/target/`
  - 生成文件：`packages/tauri/gen/`
  - 前端：`packages/web/dist`

## 📦 包说明

### `@visual-craft/web`

- Vue 3 + TypeScript + Vite
- Pinia + Vue Router + Naive UI
- `build:web` - `--mode web`, base `/`
- `build:client` - `--mode client`, base `./`

### `@visual-craft/electron`

- Electron 39 + electron-vite
- electron-builder
- 复用 web 包核心代码

### `@visual-craft/tauri`

- Tauri 2.9 + Rust
- `pnpm build:app` / `pnpm build:dmg` / `pnpm create-dmg`

## 🔧 配置管理

使用 `project.config.json` 作为单一数据源管理配置：

```bash
pnpm sync:config
```

## 📝 开发规范

- ESLint (Flat Config) + Prettier + TypeScript
- Husky + lint-staged (pre-commit)
- Commitlint (commit-msg)

**Commit 类型：**
```
feat, fix, docs, style, refactor, perf, test
build, chore, config, revert, merge, sync
```

## 🛠️ 技术栈

Vue 3.5 + Vite 7 + TypeScript 5.9 + Electron 39 / Tauri 2.9 + pnpm workspace + Pinia 3 + Vue Router 4 + Naive UI

## 📚 相关文档

- [项目配置](./project.config.json)
- [Tauri 构建问题](./packages/tauri/BUILD_FIX.md)

## 🤝 贡献

1. 遵循代码规范
2. 提交前运行 `pnpm sync:config`
3. 遵循 Git Commit 规范

## 🔗 相关链接

- [Web Demo](https://visual-studio-one.vercel.app/)
- [Electron 版本](https://github.com/joel-xiao/visual-studio.electron)
