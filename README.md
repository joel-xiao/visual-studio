# Visualization Editor

一个基于 Monorepo 架构的低代码可视化开发平台，支持 Web、Electron 和 Tauri 多平台部署。

## ✨ 特性

- 🎨 **可视化编辑器** - 通过拖放组件快速构建应用
- 🚀 **多平台支持** - Web、Electron、Tauri 三端统一
- 📦 **Monorepo 架构** - 使用 pnpm workspace 管理多包
- 🔧 **统一配置管理** - 通过 `project.config.json` 集中管理项目配置
- 💻 **现代化技术栈** - Vue 3 + TypeScript + Vite
- 🎯 **代码共享** - Web 核心代码被 Electron 和 Tauri 复用

## 🏗️ 项目结构

这是一个 Monorepo 项目，使用 pnpm workspace 管理多个包：

```
visualization-editor.monorepo/
├── packages/
│   ├── web/              # Web 核心包（Vue3 + Vite + TypeScript）
│   ├── electron/         # Electron 桌面应用
│   └── tauri/            # Tauri 桌面应用（Rust + Vue3）
├── scripts/              # 项目级脚本
│   └── sync-project-config.ts
├── config/               # 配置文件目录
│   └── changelog-option.ts
├── project.config.json   # 项目统一配置
└── package.json          # 根 package.json
```


## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Rust (仅 Tauri 需要)

### 安装依赖

```bash
# 克隆项目
git clone git@github.com:joel-xiao/visual-studio.monorepo.git

# 进入项目目录
cd visualization-editor.monorepo

# 安装依赖
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
# 构建 Web 版本（输出到 packages/web/dist）
pnpm build:web

# 构建 Electron 应用（Web 输出到 packages/web/dist，然后复制到 packages/electron/dist/web）
pnpm build:electron

# 构建 Tauri 应用（Web 输出到 packages/web/dist，Tauri 使用该目录构建）
pnpm build:tauri

# Tauri 创建 DMG（构建完成后）
cd packages/tauri && pnpm create-dmg
```

**构建输出目录：**
- **Web 模式** (`--mode web`): 
  - 输出目录：`packages/web/dist/`
  - Base URL：`/`（用于部署到服务器）
- **客户端模式** (`--mode client`): 
  - 输出目录：`packages/web/dist/`（与 Web 模式相同）
  - Base URL：`./`（用于 Electron 和 Tauri 本地文件加载）
- **Electron**: 
  - 主进程：`packages/electron/dist/main/`
  - 预加载脚本：`packages/electron/dist/preload/`
  - Web 文件：`packages/electron/dist/web/`（从 `packages/web/dist` 复制）
  - 打包输出：`packages/electron/release/`
- **Tauri**: 
  - Rust 构建：`packages/tauri/target/`
  - 生成文件：`packages/tauri/gen/`
  - 前端：直接使用 `packages/web/dist`（通过 `frontendDist` 配置指向 `../web/dist`）

## 📦 包说明

### `@visualization-editor/web`

Web 核心包，包含所有业务逻辑和 UI 组件。

- **技术栈**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI 框架**: Naive UI
- **构建模式**:
  - `build:web` - Web 模式（`--mode web`），输出到 `dist/`，base 为 `/`
  - `build:client` - 客户端模式（`--mode client`），输出到 `dist/`，base 为 `./`（用于 Electron 和 Tauri）

### `@visualization-editor/electron`

Electron 桌面应用包。

- **技术栈**: Electron 39 + electron-vite
- **构建工具**: electron-builder
- **特点**: 复用 web 包的核心代码

### `@visualization-editor/tauri`

Tauri 桌面应用包。

- **技术栈**: Tauri 2.9 + Rust
- **特点**: 更小的应用体积，更好的性能
- **构建脚本**: `scripts/create-dmg.sh` - 手动创建 DMG
- **构建命令**: 
  - `pnpm build:app` - 只构建 app
  - `pnpm build:dmg` - 构建 DMG（需要权限）
  - `pnpm create-dmg` - 手动创建 DMG

## 🔧 配置管理

项目使用 `project.config.json` 作为单一数据源（SSOT）管理所有配置：

- 项目名称和版本
- 应用 ID (appId)
- 作者信息
- 版权信息

修改配置后，运行以下命令同步到所有相关文件：

```bash
pnpm sync:config
```

## 📝 开发规范

### 代码规范

项目使用以下工具保证代码质量：

- **ESLint** - 代码检查和格式化（Flat Config）
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **Husky** - Git hooks 管理
- **lint-staged** - 暂存文件检查（pre-commit）
- **Commitlint** - Commit 信息规范（commit-msg）

### Git Commit 规范

项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，使用 Husky 和 Commitlint 自动验证：

```bash
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
build: 构建系统或外部依赖的变动
chore: 构建/工具链相关
config: 构建过程或辅助工具的变动
revert: 回滚
merge: 代码合并
sync: 同步主线或分支的 Bug
```

**示例：**
```bash
feat: add user authentication
fix: resolve memory leak in editor
refactor: simplify build configuration
```

## 🛠️ 技术栈

- **前端框架**: Vue 3.5
- **构建工具**: Vite 7
- **类型系统**: TypeScript 5.9
- **桌面框架**: Electron 39 / Tauri 2.9
- **包管理**: pnpm
- **Monorepo**: pnpm workspace
- **状态管理**: Pinia 3
- **路由**: Vue Router 4
- **UI 组件**: Naive UI

## 📚 相关文档

- [项目配置](./project.config.json) - 项目统一配置
- [Tauri 构建问题](./packages/tauri/BUILD_FIX.md) - Tauri DMG 构建解决方案

## 🤝 贡献

欢迎贡献代码！请确保：

1. 遵循项目的代码规范
2. 提交前运行 `pnpm sync:config` 同步配置
3. 遵循 Git Commit 规范

## 📄 许可证

[待定]

## 🔗 相关链接

- [Web Demo](https://visual-studio-one.vercel.app/)
- [Electron 版本](https://github.com/joel-xiao/visual-studio.electron)
