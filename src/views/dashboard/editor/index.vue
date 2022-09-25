<template lang="pug">
div#editor
  MiddleContainer(:nodes="nodes")
  NavPanel
  //- ToolbarPanel
  LeftPanel(
    :layerData="nodesTree"
    )
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

const { saveCurrentNode } = useDashboardStore();

let data = reactive<EditorData>({
  folder: '',
  id: '',
  type: '',
  name: '',
  nodes: [
    {
      id: 'root',
      name: '根容器',
      width: 1000,
      height: 600,
      type: '',
      x: 0,
      y: 0,
      z: 0,
      select: true,
      lock: false
    },
    {
      container: 'root',
      id: 'qweywdawshw',
      name: '图片',
      width: 500,
      height: 400,
      type: '',
      x: 0,
      y: 0,
      z: 1,
      select: false,
      lock: false
    },
    {
      container: 'root',
      id: '34324',
      name: 'a',
      width: 500,
      height: 400,
      type: '',
      x: 100,
      y: 100,
      z: 2,
      select: false,
      lock: false
    }
  ]
});

const init = function (editorData: EditorData): void {
  data = editorData;
};
defineExpose({ init });

const myNodeContext = createNodeContext(data);
const nodesTree = myNodeContext.getNodeTree();
const nodes = myNodeContext.getNodes();

// 绑定组合键
createBindKeysContext();
</script>

<style lang="scss">
#editor {
  --nav-bar-height: 42px;
  --tool-bar-height: 0px;
  --tab-bar-height: 42px;
  --left-menu-width: 241px;
  --right-menu-width: 252px;
  --theme-color-canvas: var(--color-realgray-900);
  --theme-color-canvas-bg: #262626;
  --editor-panel-bg-color: var(--color-main);
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
