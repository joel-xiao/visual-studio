<template lang="pug">
div#editor(ref='editorRef' :style="editorStyle")
  MiddleContainer
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

import { ref, reactive } from 'vue';
import { useConfig } from './config';
import { createNodeContext } from './hooks/node-context';
import type { EditorData } from './hooks/node-context/interface';
import { createBindKeysContext } from './hooks/bind-keys-context';
import { createComponentContext } from './hooks/component-context';
import { createRuler } from './hooks/ruler';

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
      radius: [0, 0, 0, 0],
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

//  Get Layout Config
let { getConfig } = useConfig();
const layout = getConfig('layout');

// Create  Node
createNodeContext(data);

// Create Bind Keys Context
createBindKeysContext();

// Create Ruler Context
const editorRef = ref();
createRuler(editorRef, {
  left: layout.left_menu_width,
  top: layout.nav_bar_height + layout.tool_bar_height,
  right: layout.right_menu_width,
  size: layout.ruler_size
});

// Create Component Context
createComponentContext();
</script>

<style lang="scss">
#editor {
  --db-editor-nav-bar-height: v-bind(`${layout.nav_bar_height}px`);
  --db-editor-tool-bar-height: v-bind(`${layout.tool_bar_height}px`);
  --db-editor-tab-bar-height: v-bind(`${layout.tab_bar_height}px`);
  --db-editor-left-menu-width: v-bind(`${layout.left_menu_width}px`);
  --db-editor-right-menu-width: v-bind(`${layout.right_menu_width}px`);
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
