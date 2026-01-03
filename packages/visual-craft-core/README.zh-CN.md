# visual-craft-core

VisualCraft 的核心 UI/编辑器库，基于 Vue 3 + TypeScript + Vite 构建。

## 安装

```bash
pnpm add visual-craft-core
```

## 使用

在应用入口处引入样式（只需一次）：

```ts
import 'visual-craft-core/style.css';
```

使用编辑器组件：

```vue
<script setup lang="ts">
import { Editor } from 'visual-craft-core';

const data = {
  id: 'demo',
  name: 'Demo',
  type: 'screen',
  nodes: []
};
</script>

<template>
  <Editor :data="data" />
</template>
```

## 说明

- 大部分样式通过 `#visual-craft-core` / `#visual-craft-core-project` 进行作用域隔离。
- Vue 是 peerDependency，请确保你的项目使用 Vue 3.5+。

## API

### 导出

- `Editor` - 主编辑器组件
- `CoreMainLayout` / `CoreProjectsLayout` / `CoreDataLayout` - 布局组件
- `monaco` - Monaco 编辑器插件辅助导出

### 样式入口

- `visual-craft-core/style.css`

