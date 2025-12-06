<template>
  <div id="editor" ref="editorRef">
    <Canvas />
    <NavPanel @change="handleTabChange" />
    <!-- <ToolbarPanel /> -->
    <LeftPanel />
    <RightPanel v-show="activeTab === 'design'" />
    <AIPanel v-show="activeTab === 'ai'" />
  </div>
</template>

<script setup lang="ts">
import NavPanel from './panels/nav-panel.vue';
import AIPanel from './panels/ai-panel/index.vue';
// import ToolbarPanel from './panels/toolbar-panel.vue';
import LeftPanel from './panels/left-panel.vue';
import RightPanel from './panels/right-panel.vue';
import Canvas from './canvas/index.vue';

import { ref, reactive, onMounted, onUnmounted } from 'vue';

const activeTab = ref('design');
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};
import { useConfig } from './config';
import { useNodeContext, removeNodeContext } from './hooks/node-context';
import { createBindKeysContext, removeBindKeysContext } from './hooks/bind-keys-context';
import { createComponentContext, removeComponentContext } from './hooks/component-context';
import { useRuler, removeRuler } from './hooks/ruler-context';

let data = reactive<IEditorData>({
  folder: '',
  id: '',
  type: '',
  name: '',
  nodes: [
    {
      parentId: '',
      id: 'root',
      icon: '',
      component: 'root',
      schema: '../../canvas/schema/default.ts',
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
      props: {
        layout: {
          width: 1000,
          height: 600
        },
        fill: {
          color: 'hsla(0, 0%, 13% , 1)'
        }
      }
    }
  ]
});

const init = function (editorData: IEditorData): void {
  data = editorData;
};

defineExpose({ init });

//  Get Layout Config
const { getConfig } = useConfig();
const layout = getConfig('layout');

// Create  Node
const { install: initIEditorData } = useNodeContext();
initIEditorData(data);
onUnmounted(() => {
  removeNodeContext();
});

// Create Bind Keys Context
createBindKeysContext();
onUnmounted(() => {
  removeBindKeysContext();
});

// Create Ruler Context
const editorRef = ref();
const { addRuler } = useRuler();
onMounted(() => {
  addRuler(editorRef.value, {
    left: layout.left_menu_width,
    top: layout.nav_bar_height + layout.tool_bar_height,
    right: layout.right_menu_width,
    size: layout.ruler_size
  });
});
onUnmounted(() => {
  removeRuler();
});

// Create Component Context
createComponentContext();
onUnmounted(() => {
  removeComponentContext();
});
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
