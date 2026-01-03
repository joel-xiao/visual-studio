# visual-craft-core

Core UI/editor library for VisualCraft. Built with Vue 3 + TypeScript + Vite.

## Install

```bash
pnpm add visual-craft-core
```

## Usage

Import styles once in your app entry:

```ts
import 'visual-craft-core/style.css';
```

Use the editor component:

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

## Notes

- Most styles are scoped under `#visual-craft-core` / `#visual-craft-core-project`.
- Vue is a peer dependency. Ensure your app uses Vue 3.5+.

## API

### Exports

- `Editor` - main visual editor component
- `CoreMainLayout` / `CoreProjectsLayout` / `CoreDataLayout` - layout components
- `monaco` - Monaco editor plugin helper

### Style entry

- `visual-craft-core/style.css`

