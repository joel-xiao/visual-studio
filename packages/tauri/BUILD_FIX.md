# Tauri DMG 构建问题解决方案

## 问题描述

构建 Tauri 应用时遇到 `bundle_dmg.sh` 脚本执行失败的错误。这通常是因为 macOS 权限问题，脚本需要控制 Finder 来创建 DMG。

## 快速解决（推荐）

```bash
# 1. 构建 app
pnpm build:tauri

# 2. 创建 DMG
cd packages/tauri
pnpm create-dmg
```

## 解决方案

### 方案 1: 分步构建（当前使用，无需权限）

```bash
# 步骤 1: 构建 app
cd packages/tauri
pnpm build:app

# 步骤 2: 创建 DMG
pnpm create-dmg
```

### 方案 2: 修复 macOS 权限（永久解决）

1. 打开 **系统设置** > **隐私与安全** > **自动化**
2. 允许 **终端** 控制 **Finder**
3. 将 `tauri.conf.json` 中的 `targets` 改为 `["dmg"]` 或 `"all"`
4. 运行 `pnpm build:dmg` 直接构建 DMG

## 可用命令

- `pnpm build:app` - 只构建 app
- `pnpm build:dmg` - 构建 DMG（需要权限）
- `pnpm create-dmg` - 手动创建 DMG（无需权限）

## 当前配置

- `targets: ["app"]` - 只构建 app，避免权限问题
- `scripts/create-dmg.sh` - DMG 创建脚本

