# VisualCraft

Visual Craft - A low-code visualization development platform based on Monorepo architecture, supporting Web, Electron, and Tauri multi-platform deployment.

English | [中文](./README.zh-CN.md)

## ✨ Features

- 🎨 **Visual Editor** - Build applications quickly by dragging and dropping components
- 🚀 **Multi-platform Support** - Unified Web, Electron, and Tauri deployment
- 📦 **Monorepo Architecture** - pnpm workspace for managing multiple packages
- 🔧 **Unified Configuration Management** - `project.config.json` for centralized project configuration
- 💻 **Modern Tech Stack** - Vue 3 + TypeScript + Vite
- 🎯 **Code Sharing** - Web core code is reused by Electron and Tauri

## 🏗️ Project Structure

```
visual-studio/
├── packages/
│   ├── web/          # Web application (Vue 3 + Vite)
│   ├── electron/     # Electron desktop application
│   └── tauri/        # Tauri desktop application (Rust)
├── scripts/          # Project scripts
│   └── sync-project-config.ts
├── config/           # Configuration files
│   └── changelog-option.ts
├── project.config.json  # Unified project configuration
├── vercel.json       # Vercel deployment configuration (auto-generated)
└── package.json
```

## 🚀 Quick Start

### Requirements

- Node.js >= 22
- pnpm >= 8
- Rust (required for Tauri only)

### Installation

```bash
git clone git@github.com:joel-xiao/visual-studio.git
cd visual-studio
pnpm install
```

### Development

```bash
# Web development
pnpm dev:web

# Electron development
pnpm dev:electron

# Tauri development
pnpm dev:tauri
```

### Build

```bash
pnpm build:web
pnpm build:electron
pnpm build:tauri
```

**Build Output Directories:**
- **Web mode** (`--mode web`): `packages/web/dist/` (base: `/`)
- **Client mode** (`--mode client`): `packages/web/dist/` (base: `./`)
- **Electron**: 
  - Main/Preload: `packages/electron/dist/main/`, `packages/electron/dist/preload/`
  - Web files: `packages/electron/dist/web/`
  - Release: `packages/electron/release/`
- **Tauri**: 
  - Rust build: `packages/tauri/target/`
  - Generated files: `packages/tauri/gen/`
  - Frontend: `packages/web/dist`

## 📦 Package Description

### `@visual-craft/web`

- Vue 3 + TypeScript + Vite
- Pinia + Vue Router + Naive UI
- `build:web` - `--mode web`, base `/`
- `build:client` - `--mode client`, base `./`

### `@visual-craft/electron`

- Electron 39 + electron-vite
- electron-builder
- Reuses web package core code

### `@visual-craft/tauri`

- Tauri 2.9 + Rust
- `pnpm build:app` / `pnpm build:dmg` / `pnpm create-dmg`

## 🔧 Configuration Management

Use `project.config.json` as the single source of truth for project configuration. Running the sync script will automatically update all related configuration files:

```bash
pnpm sync:config
```

**Auto-synced configurations include:**
- `package.json` - Root and all sub-packages' names and versions
- `packages/web/index.html` - Page title
- `packages/electron/electron-builder.json5` - Electron configuration
- `packages/tauri/tauri.conf.json` - Tauri configuration
- `packages/tauri/Cargo.toml` - Rust configuration
- `vercel.json` - Vercel deployment configuration (includes build command, output directory, Node.js version, etc.)

### Vercel Deployment

The project is configured to automatically generate `vercel.json` for one-click Vercel deployment:

1. Ensure the `vercel` configuration in `project.config.json` is correct
2. Run `pnpm sync:config` to generate `vercel.json`
3. Import the project in Vercel to automatically deploy

**Current Vercel Configuration:**
- Node.js version: 22.x
- Build command: `pnpm build:web`
- Output directory: `packages/web/dist`
- Install command: `pnpm install`

## 📝 Development Standards

- ESLint (Flat Config) + Prettier + TypeScript
- Husky + lint-staged (pre-commit)
- Commitlint (commit-msg)

**Commit Types:**
```
feat, fix, docs, style, refactor, perf, test
build, chore, config, revert, merge, sync
```

## 🛠️ Tech Stack

Vue 3.5 + Vite 7 + TypeScript 5.9 + Node.js 22 + Electron 39 / Tauri 2.9 + pnpm workspace + Pinia 3 + Vue Router 4 + Naive UI

## 📚 Related Documentation

- [Project Configuration](./project.config.json)
- [Tauri Build Issues](./packages/tauri/BUILD_FIX.md)

## 🤝 Contributing

1. Follow code standards
2. Run `pnpm sync:config` before committing
3. Follow Git Commit conventions

## 🔗 Links

- [Web Demo](https://visual-studio-one.vercel.app/)
