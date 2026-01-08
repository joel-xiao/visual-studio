<template>
  <div id="visual-craft-core" ref="editorRef">
    <Canvas />
    <NavPanel @change="handleTabChange" />
    <!-- <ToolbarPanel /> -->
    <LeftPanel />
    <RightPanel />
    <AIPanel v-show="activeTab === 'ai'" />
    <ContextMenu />
  </div>
</template>

<script setup lang="ts">
import NavPanel from './panels/nav-panel.vue';
import AIPanel from './panels/ai-panel.vue';
// import ToolbarPanel from './panels/toolbar-panel.vue';
import LeftPanel from './panels/left-panel.vue';
import RightPanel from './panels/right-panel.vue';
import Canvas from './canvas/index.vue';
import ContextMenu from './canvas/context-menu.vue';

import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';

import { initEditorConfig, getLayoutConfig, type EditorConfigMap } from './config';
import { initAIConfig, type AIInitConfig } from './ai/config';

const props = defineProps<{
  data: IEditorData;
  editorConfig?: Partial<EditorConfigMap>;
  aiConfig?: AIInitConfig;
}>();

if (props.editorConfig) initEditorConfig(props.editorConfig);
if (props.aiConfig) initAIConfig(props.aiConfig);

const activeTab = ref('design');
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};
import { useNodeContext, removeNodeContext } from './hooks/node-context';
import { createBindKeysContext, removeBindKeysContext } from './hooks/bind-keys-context';
import { createComponentContext, removeComponentContext } from './hooks/component-context';
import { useRuler, removeRuler } from './hooks/ruler-context';

const editorData = reactive<IEditorData>(props.data);

function applyMeta(next: IEditorData) {
  editorData.folder = next.folder || '';
  editorData.id = next.id || '';
  editorData.type = next.type || '';
  editorData.name = next.name || '';
}

const layout = getLayoutConfig();
const rightMenuWidth = computed(() => {
  return activeTab.value === 'ai' ? layout.ai_panel_width : layout.right_menu_width;
});

// Create  Node
const nodeContext = useNodeContext();
applyMeta(props.data);
nodeContext.install(editorData);
onUnmounted(() => {
  removeNodeContext();
});

watch(
  () => props.data,
  next => {
    if (!next) return;
    applyMeta(next);
    nodeContext.update(next);
  }
);

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
#visual-craft-core {
  --db-editor-nav-bar-height: v-bind(`${layout.nav_bar_height}px`);
  --db-editor-tool-bar-height: v-bind(`${layout.tool_bar_height}px`);
  --db-editor-tab-bar-height: v-bind(`${layout.tab_bar_height}px`);
  --db-editor-left-menu-width: v-bind(`${layout.left_menu_width}px`);
  --db-editor-right-menu-width: v-bind(`${rightMenuWidth}px`);
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
