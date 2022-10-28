<template lang="pug">
div#editor
  MiddleContainer(:nodes="nodes")
  NavPanel
  //- ToolbarPanel
  LeftPanel
  RightPanel
</template>

<script setup lang="ts">
import NavPanel from './panels/nav-panel.vue';
// import ToolbarPanel from './panels/toolbar-panel.vue';
import LeftPanel from './panels/left-panel.vue';
import RightPanel from './panels/right-panel.vue';
import MiddleContainer from './container/index.vue';

import { reactive } from 'vue';
import { useDashboardStore } from '@/store/dashboard';
import { createNodeContext } from './hooks/node-context';
import type { EditorData } from './hooks/node-context/interface';
import { createBindKeysContext } from './hooks/bind-keys-context';
import { createSchemaContext } from './hooks/schema-context';
import { createUiLibraryContext } from './hooks/ui-library-context';

const { saveCurrentNode } = useDashboardStore();

let data = reactive<EditorData>({
  folder: '',
  id: '',
  type: '',
  name: '',
  nodes: [
    {
      container: '',
      id: 'root',
      icon: '',
      component: 'root',
      schema: 'root',
      name: '根容器',
      width: 1000,
      height: 600,
      type: '',
      x: 0,
      y: 0,
      z: 0,
      select: true,
      lock: false,
      props: {}
    }
  ]
});

const init = function (editorData: EditorData): void {
  data = editorData;
};
defineExpose({ init });

// Create  Node
const myNodeContext = createNodeContext(data);
const nodes = myNodeContext.getNodes();

// Create Bind Keys
createBindKeysContext();

// Create Schema
createSchemaContext();

// Create Ui Library
createUiLibraryContext();
</script>

<style lang="scss">
#editor {
  --nav-bar-height: 42px;
  --tool-bar-height: 0px;
  --tab-bar-height: 42px;
  --left-menu-width: 241px;
  --right-menu-width: 252px;
  --theme-color-canvas: var(--color-real-gray-900);
  --theme-color-canvas-bg: #262626;
  --editor-panel-bg-color: var(--color-main);
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
