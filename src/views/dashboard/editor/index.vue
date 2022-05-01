<template lang="pug">
div#editor
  MiddleContainer(:nodes="nodes")
  NavPanel
  //- ToolbarPanel
  LeftPanel(
    @component-drag-start="onComponentDragStart"
    @component-drag-stop="onComponentDragStop"
    )
  RightPanel
</template>

<script setup lang="ts">
import NavPanel from './panels/nav-panel.vue';
// import ToolbarPanel from './panels/toolbar-panel.vue';
import LeftPanel from './panels/left-panel.vue';
import RightPanel from './panels/right-panel.vue';
import MiddleContainer from './container/index.vue';
import type { EditorData, Node, AddNode, NodeDelta } from './interface';
import type { Component } from './panels/components/panel-component/interface';
import { getPlatform } from '@a/util/index';
import { useDashboardStore } from '@/store/dashboard';

import {
  ref,
  reactive,
  computed,
  readonly,
  provide,
  defineEmits,
  defineExpose,
  defineProps,
  withDefaults,
  createApp,
  onUnmounted
} from 'vue';
import { storeToRefs } from 'pinia';

const { saveCurrentNode, saveComBindKeys } = useDashboardStore();
const { comBindKeys } = storeToRefs(useDashboardStore());

// interface Props {
//   data?: EditorData | null;
// }

// const props = withDefaults(defineProps<Props>(), {
//   data: () => ({})
// });

let data = reactive<EditorData>({
  folder: '',
  id: '',
  key: '',
  name: '',
  nodes: [
    {
      id: 'root',
      name: '根容器',
      width: 1000,
      height: 600,
      key: '',
      x: 0,
      y: 0,
      z: 0,
      select: true,
      lock: false
    },
    {
      id: 'qweywdawshw',
      name: '图片',
      width: 500,
      height: 400,
      key: '',
      x: 0,
      y: 0,
      z: 1,
      select: false,
      lock: false
    },
    {
      id: '34324',
      name: 'a',
      width: 500,
      height: 400,
      key: '',
      x: 100,
      y: 100,
      z: 2,
      select: false,
      lock: false
    }
  ]
});

const nodes = computed<Node[]>(() => {
  return data.nodes.filter((node) => node.id !== 'root');
});

const init = function (editorData: EditorData): void {
  data = editorData;
};
defineExpose({ init });

const getRoot = function (): Node | undefined {
  const node: Node | undefined = data.nodes.find((node) => node.id === 'root');
  return node ? node : undefined;
};
provide('getRoot', getRoot);
saveCurrentNode(getRoot());

const getNode = function (id: string): Node | undefined {
  const node: Node | undefined = data.nodes.find((node) => node.id === id);
  return node ? node : undefined;
};
provide('getNode', getNode);

const onUpdateNode = function (id: string, delta: NodeDelta): void {
  const node = data.nodes.find((node) => node.id === id);
  if (node && delta) {
    Object.keys(delta).forEach((key: string): void => {
      // @ts-ignore
      node[key] = delta[key];
    });
  }
};
provide('updateNode', onUpdateNode);

const onAddNode = function (addNode: AddNode): void {
  let node: Node = {
    id: Math.random() + '',
    name: addNode.name,
    width: addNode.width || 400,
    height: addNode.height || 400,
    key: addNode.key,
    x: 0,
    y: 0,
    z: 0,
    select: true,
    lock: false
  };
  data.nodes.push(node);
};
const onAddNodes = function (nodes: AddNode[] | AddNode): void {
  if (Array.isArray(nodes)) {
    nodes.forEach((node: AddNode) => {
      onAddNode(node);
    });
  } else if (nodes instanceof Object) {
    onAddNode(nodes);
  }
};
provide('addNode', onAddNodes);

const onSelectNode = function (id: string): void {
  data.nodes.forEach((node) => {
    if (id === node.id) {
      node.select = true;
    } else {
      node.select = false;
    }
  });
};
provide('selectNode', onSelectNode);

const comBindKeysUpdate = function (event: KeyboardEvent, isBoolean: boolean): void {
  event = event || window.event;
  let code = event.keyCode || event.which || event.charCode;
  let key = event.code || event.key;
  let platform = getPlatform();
  // if (code === 16) {
  //   saveComBindKeys({ isShift: isBoolean });
  // } else if (code === 18) {
  //   saveComBindKeys({ isAlt: isBoolean });
  // } else if (code === 32) {
  //   saveComBindKeys({ isSpace: isBoolean });
  // }
  if (key === 'Shift') {
    event.preventDefault();
    if (comBindKeys.value.isShift === isBoolean) return;
    saveComBindKeys({ isShift: isBoolean });
  } else if (key === 'Alt') {
    event.preventDefault();
    if (comBindKeys.value.isAlt === isBoolean) return;
    saveComBindKeys({ isAlt: isBoolean });
  } else if (key === 'Space') {
    event.preventDefault();
    if (comBindKeys.value.isSpace === isBoolean) return;
    saveComBindKeys({ isSpace: isBoolean });
  }
};
const onKeyDown = function (event: KeyboardEvent): void {
  comBindKeysUpdate(event, true);
};
const onKeyUp = function (event: KeyboardEvent): void {
  comBindKeysUpdate(event, false);
};

const addEventKeydown = function (): void {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
};
const removeEventKeydown = function (): void {
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
};
addEventKeydown();
onUnmounted(() => {
  removeEventKeydown();
});

const onComponentDragStart = function (item: Component, event: DragEvent): void {
  event.dataTransfer?.setData('component', JSON.stringify(item));
};
const onComponentDragStop = function (event: DragEvent): void {
  event.dataTransfer?.setData('component', '');
};
</script>

<style lang="scss" scoped>
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
